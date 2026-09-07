'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');

const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const { uploadDocuments } = require('../../middleware/upload.middleware');
const supabase = require('../../infrastructure/supabase');

const {
  Dokument,
  Student,
  Kompanija,
  Oglas,
  PrijavaNaPraksu,
} = require('../../infrastructure/database/models');
const {
  APPLICATION_STATUS,
  COORDINATOR_STATUS,
} = require('../../business/services/applicationStatus.service');

const BUCKET = 'dokumenti';

// GET /api/dokumenti/mine
router.get('/mine', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userID: req.user.id } });
    if (!student) return res.json([]);

    const dokumenti = await Dokument.findAll({
      where: { student_id: student.id },
      order: [['created_at', 'DESC']],
    });

    return res.json(dokumenti);
  } catch (err) {
    return res.status(500).json({ message: 'Greška pri dohvatanju dokumenata.' });
  }
});

// GET /api/dokumenti/:id/company-download
router.get('/:id/company-download', authenticate, authorize('COMPANY'), async (req, res) => {
  try {
    const dokumentId = Number(req.params.id);
    if (!Number.isInteger(dokumentId) || dokumentId <= 0) {
      return res.status(404).json({ message: 'Dokument nije pronađen.' });
    }

    const kompanija = await Kompanija.findOne({ where: { userID: req.user.id } });
    if (!kompanija) {
      return res.status(404).json({ message: 'Profil kompanije nije pronađen.' });
    }

    const dokument = await Dokument.findByPk(dokumentId, {
      attributes: ['id', 'prijava_id', 'file_path', 'original_name'],
      include: [
        {
          model: PrijavaNaPraksu,
          attributes: ['id', 'oglasID', 'status', 'koordinatorStatus'],
          required: true,
          include: [
            {
              model: Oglas,
              attributes: ['id', 'kompanijaID', 'status'],
              required: true,
            },
          ],
        },
      ],
    });

    if (!dokument) {
      return res.status(404).json({ message: 'Dokument nije pronađen.' });
    }

    const oglas = dokument.PrijavaNaPraksu?.Ogla || dokument.PrijavaNaPraksu?.Oglas;
    if (!oglas || oglas.kompanijaID !== kompanija.id) {
      return res.status(403).json({ message: 'Nemate pravo pristupa ovom dokumentu.' });
    }

    const prijava = dokument.PrijavaNaPraksu;
    if (
      oglas.status !== 'AKTIVAN' ||
      prijava.koordinatorStatus !== COORDINATOR_STATUS.APPROVED ||
      prijava.status === APPLICATION_STATUS.WITHDRAWN
    ) {
      return res.status(403).json({ message: 'Dokument nije dostupan za ovu prijavu.' });
    }

    if (!dokument.file_path) {
      return res.status(404).json({ message: 'Dokument nije dostupan.' });
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(dokument.file_path, 60, { download: dokument.original_name || 'dokument' });

    if (error) {
      return res.status(500).json({ message: 'Greška pri generisanju linka.' });
    }

    return res.json({ url: data.signedUrl });
  } catch (err) {
    return res.status(500).json({ message: 'Greška pri preuzimanju dokumenta.' });
  }
});

// GET /api/dokumenti/:id/download
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userID: req.user.id } });
    if (!student) return res.status(403).json({ message: 'Pristup odbijen.' });

    const dokument = await Dokument.findOne({
      where: { id: req.params.id, student_id: student.id },
    });
    if (!dokument) return res.status(404).json({ message: 'Dokument nije pronađen.' });

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(dokument.file_path, 60, { download: dokument.original_name });

    if (error) return res.status(500).json({ message: 'Greška pri generisanju linka.' });

    return res.json({ url: data.signedUrl });
  } catch (err) {
    return res.status(500).json({ message: 'Greška pri preuzimanju dokumenta.' });
  }
});

// DELETE /api/dokumenti/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userID: req.user.id } });
    if (!student) return res.status(403).json({ message: 'Pristup odbijen.' });

    const dokument = await Dokument.findOne({
      where: { id: req.params.id, student_id: student.id },
    });
    if (!dokument) return res.status(404).json({ message: 'Dokument nije pronađen.' });

    if (dokument.file_path) {
      await supabase.storage.from(BUCKET).remove([dokument.file_path]);
    }

    await dokument.destroy();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: 'Greška pri brisanju dokumenta.' });
  }
});

// POST /api/dokumenti/attach
router.post('/attach', authenticate, async (req, res) => {
  try {
    const { oglas_id, dokument_ids, prijava_id } = req.body;
    if (!oglas_id || !Array.isArray(dokument_ids) || dokument_ids.length === 0) {
      return res.status(400).json({ message: 'Neispravni podaci.' });
    }

    const student = await Student.findOne({ where: { userID: req.user.id } });
    if (!student) return res.status(403).json({ message: 'Pristup odbijen.' });

    const created = (await Promise.all(
      dokument_ids.map(async (id) => {
        const doc = await Dokument.findOne({ where: { id, student_id: student.id } });
        if (!doc) return null;
        return Dokument.create({
          student_id: student.id,
          oglas_id: Number(oglas_id),
          prijava_id: prijava_id ? Number(prijava_id) : null,
          tip_dokumenta: doc.tip_dokumenta,
          original_name: doc.original_name,
          file_name: doc.file_name,
          file_path: doc.file_path,
          mime_path: doc.mime_path,
          size: doc.size,
          created_at: new Date(),
        });
      })
    )).filter(Boolean);

    return res.status(201).json({
      success: true,
      message: 'Dokumenti uspješno priloženi uz prijavu.',
      data: created,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Greška pri prilaganju dokumenata.' });
  }
});

// POST /api/dokumenti/upload
router.post(
  '/upload',
  authenticate,
  uploadDocuments.array('files', 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Nijedan fajl nije poslan.' });
      }

      const student = await Student.findOne({ where: { userID: req.user.id } });
      if (!student) {
        return res.status(400).json({ message: 'Studentski profil nije pronađen.' });
      }

      const dokumenti = await Promise.all(
        req.files.map(async (file, index) => {
          const tip = Array.isArray(req.body.tip_dokumenta)
            ? req.body.tip_dokumenta[index]
            : req.body.tip_dokumenta || 'OSTALO';

          const ext = path.extname(file.originalname);
          const storagePath = `${student.id}/${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, file.buffer, { contentType: file.mimetype });

          if (error) throw new Error(`Upload neuspješan: ${error.message}`);

          return Dokument.create({
            student_id: student.id,
            oglas_id: req.body.oglas_id || null,
            tip_dokumenta: tip,
            original_name: file.originalname,
            file_name: storagePath,
            file_path: storagePath,
            mime_path: file.mimetype,
            size: file.size,
            created_at: new Date(),
          });
        })
      );

      return res.status(201).json({
        success: true,
        message: 'Dokumenti uspješno uploadovani.',
        data: dokumenti,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message || 'Greška pri uploadu dokumenta.' });
    }
  }
);

module.exports = router;
