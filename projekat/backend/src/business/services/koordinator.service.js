'use strict';

const { Op } = require('sequelize');
const db = require('../../infrastructure/database/models');
const { ACTION_TYPES, logAudit } = require('./audit.service');
const { resolveCoordinatorProfile } = require('./coordinatorProfile.service');
const {
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
  sendPrijavaStatusEmail,
} = require('./email.service');
const { createNotification } = require('./notifications.service');
const {
  getOrCreatePreferences,
  canSendInApp,
  canSendEmail,
} = require('./notificationPreferences.service');
const {
  APPLICATION_STATUS,
  COORDINATOR_STATUS,
  COMPANY_STATUS,
  STUDENT_STATUS,
  FINAL_REJECTED_STATUSES,
  isCoordinatorPending,
  normalizeStatusFilter,
} = require('./applicationStatus.service');
const {
  getCoordinatorPractices,
  getCoordinatorPracticeSummary,
} = require('./prakse.service');

const getDashboardStats = async (koordinatorUserId) => {
  const [ukupno, podnesene, proslijedene, odobrene, odbijene] = await Promise.all([
    db.PrijavaNaPraksu.count(),
    db.PrijavaNaPraksu.count({ where: { status: APPLICATION_STATUS.WAITING_COORDINATOR } }),
    db.PrijavaNaPraksu.count({
      where: {
        status: {
          [Op.in]: [
            APPLICATION_STATUS.WAITING_COMPANY,
            APPLICATION_STATUS.SHORTLISTED,
          ],
        },
      },
    }),
    db.PrijavaNaPraksu.count({ where: { status: APPLICATION_STATUS.APPROVED } }),
    db.PrijavaNaPraksu.count({ where: { status: { [Op.in]: FINAL_REJECTED_STATUSES } } }),
  ]);

  let aktivnePrakse = 0;
  let zavrsene = 0;
  if (db.Praksa && koordinatorUserId) {
    const practiceSummary = await getCoordinatorPracticeSummary(koordinatorUserId).catch(() => null);
    if (practiceSummary) {
      aktivnePrakse = practiceSummary.aktivnePrakse;
      zavrsene = practiceSummary.zavrsene;
    }
  } else if (db.Praksa) {
    aktivnePrakse = await db.Praksa.count().catch(() => 0);
  }
  return { ukupno, podnesene, proslijedene, odobrene, odbijene, aktivnePrakse, zavrsene };
};

const getPrijave = async ({ status, stranica = 1, limit = 15, koordinatorUserId }) => {
  const offset = (parseInt(stranica) - 1) * parseInt(limit);
  const where = {};
  const normalizedStatus = normalizeStatusFilter(status);
  if (normalizedStatus) where.status = normalizedStatus;

  const koordinator = await resolveCoordinatorProfile(koordinatorUserId);
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');

  const { count, rows } = await db.PrijavaNaPraksu.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    include: [
      {
        model: db.Student,
        where: { fakultetID: koordinator.fakultetID },
        include: [{ model: db.User, attributes: ['ime', 'prezime', 'email'] }],
        attributes: ['id', 'index_number', 'year_of_study', 'odsjekID', 'fakultetID'],
      },
      {
        model: db.Oglas,
        include: [{
          model: db.Kompanija,
          include: [{ model: db.User, attributes: ['ime', 'email'] }],
          attributes: ['id', 'naziv'],
        }],
        attributes: ['id', 'naziv', 'trajanje', 'brojMjesta'],
      },
    ],
    order: [['datumPrijave', 'DESC']],
  });

  return {
    prijave: rows,
    ukupno: count,
    stranice: Math.ceil(count / parseInt(limit)),
    trenutnaStranica: parseInt(stranica),
  };
};

const getPrijavaById = async (id, koordinatorUserId) => {
  const koordinator = await resolveCoordinatorProfile(koordinatorUserId);
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');

  const prijava = await db.PrijavaNaPraksu.findByPk(id, {
    include: [
      {
        model: db.Student,
        include: [
          { model: db.User, attributes: ['ime', 'prezime', 'email'] },
          { model: db.Odsjek, attributes: ['id', 'naziv'], required: false },
        ],
        attributes: ['id', 'index_number', 'year_of_study', 'odsjekID', 'fakultetID'],
      },
      {
        model: db.Oglas,
        include: [{
          model: db.Kompanija,
          include: [{ model: db.User, attributes: ['ime', 'email'] }],
          attributes: ['id', 'naziv', 'opisPoslovanja', 'djelatnost', 'adresa', 'telefon', 'kontaktOsoba'],
        }],
      },
      {
        model: db.Dokument,
        attributes: ['id', 'original_name', 'tip_dokumenta', 'mime_path', 'created_at'],
        required: false,
      },
    ],
  });
  if (!prijava) throw new Error('NOT_FOUND');
  if (prijava.Student?.fakultetID !== koordinator.fakultetID) {
    throw new Error('NOT_FOUND');
  }
  return prijava;
};

const odluciOPrijavi = async (id, odluka, razlog, koordinatorUserId) => {
  const koordinator = await resolveCoordinatorProfile(koordinatorUserId);
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');

  if (odluka === 'odbijena' && !razlog?.trim()) {
    throw new Error('RAZLOG_REQUIRED');
  }

  const prijava = await db.PrijavaNaPraksu.findByPk(id, {
    include: [
      {
        model: db.Student,
        include: [{ model: db.User, attributes: ['id', 'email'] }],
        attributes: ['id', 'fakultetID'],
      },
      {
        model: db.Oglas,
        include: [{ model: db.Kompanija, attributes: ['naziv'] }],
        attributes: ['naziv'],
      },
    ],
  });
  if (!prijava) throw new Error('NOT_FOUND');
  if (prijava.Student?.fakultetID !== koordinator.fakultetID) {
    throw new Error('NOT_FOUND');
  }

  if (!isCoordinatorPending(prijava)) {
    throw new Error('INVALID_STATUS');
  }

  const stariStatus = prijava.status;
  const approved = odluka === 'odobrena';
  const noviStatus = approved
    ? APPLICATION_STATUS.WAITING_COMPANY
    : APPLICATION_STATUS.REJECTED_COORDINATOR;

  await prijava.update({
    status: noviStatus,
    koordinatorStatus: approved ? COORDINATOR_STATUS.APPROVED : COORDINATOR_STATUS.REJECTED,
    kompanijaStatus: approved ? COMPANY_STATUS.PENDING : COMPANY_STATUS.UNAVAILABLE,
    studentStatus: STUDENT_STATUS.UNAVAILABLE,
    studentOdlucioAt: null,
    razlogOdbijanja: approved ? null : razlog.trim(),
    koordinatorID: koordinator.id,
  });

  await logAudit({
    userID: koordinatorUserId,
    actionType: ACTION_TYPES.APPLICATION_STATUS_CHANGED,
    details: {
      entityType: 'PRAKSA_APPLICATION',
      prijavaID: prijava.id,
      studentID: prijava.Student?.id,
      fromStatus: stariStatus,
      toStatus: noviStatus,
      reason: odluka === 'odbijena' ? razlog.trim() : null,
    },
  });

  const studentId = prijava.Student?.id;
  const studentEmail = prijava.Student?.User?.email;
  const studentUserId = prijava.Student?.User?.id;
  const oglasNaziv = prijava.Oglas?.naziv || 'praksu';
  const kompanijaNaziv = prijava.Oglas?.Kompanija?.naziv || 'Kompanija';
  const tip = approved ? 'PRIJAVA_PROSLIJEDJENA_KOMPANIJI' : 'PRIJAVA_ODBIJENA';
  const naslov = approved ? 'Prijava proslijedjena kompaniji' : 'Odbijeno od koordinatora';
  const poruka = approved
    ? `Vasa prijava na praksu "${oglasNaziv}" kod kompanije ${kompanijaNaziv} je odobrena od koordinatora i proslijedjena kompaniji.`
    : `Vasa prijava na praksu "${oglasNaziv}" kod kompanije ${kompanijaNaziv} je odbijena od koordinatora.${razlog ? ` Razlog: ${razlog}` : ''}`;

  const preferences = studentUserId ? await getOrCreatePreferences(studentUserId) : null;

  if (studentId && canSendInApp(preferences, tip)) {
    createNotification(studentId, prijava.id, tip, naslov, poruka).catch(() => {});
  }

  if (studentEmail && canSendEmail(preferences, tip)) {
    sendPrijavaStatusEmail(studentEmail, oglasNaziv, kompanijaNaziv, noviStatus, razlog).catch(() => {});
  }

  return {
    id: prijava.id,
    status: prijava.status,
    koordinatorStatus: prijava.koordinatorStatus,
    kompanijaStatus: prijava.kompanijaStatus,
  };
};

const getStudenti = async (koordinatorUserId, pretraga = '') => {
  const koordinator = await resolveCoordinatorProfile(koordinatorUserId);
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');

  const userWhere = {
    role: 'STUDENT',
    approvalStatus: 'APPROVED',
  };
  if (pretraga) {
    const dijelovi = pretraga.trim().split(/\s+/);

    if (dijelovi.length === 1) {
      userWhere[Op.or] = [
        { ime: { [Op.iLike]: `%${dijelovi[0]}%` } },
        { prezime: { [Op.iLike]: `%${dijelovi[0]}%` } },
      ];
    } else {
      const [prva, ...ostatak] = dijelovi;
      const zadnja = ostatak.join(' ');
      userWhere[Op.or] = [
        { [Op.and]: [{ ime: { [Op.iLike]: `%${prva}%` } }, { prezime: { [Op.iLike]: `%${zadnja}%` } }] },
        { [Op.and]: [{ ime: { [Op.iLike]: `%${zadnja}%` } }, { prezime: { [Op.iLike]: `%${prva}%` } }] },
      ];
    }
  }

  return db.Student.findAll({
    where: { fakultetID: koordinator.fakultetID },
    include: [
      {
        model: db.User,
        attributes: ['ime', 'prezime', 'email', 'role', 'status', 'approvalStatus'],
        where: userWhere,
      },
      {
        model: db.Odsjek,
        attributes: ['id', 'naziv'],
      },
      {
        model: db.PrijavaNaPraksu,
        required: false,
        attributes: ['id', 'status', 'koordinatorStatus', 'kompanijaStatus', 'datumPrijave'],
        include: [{
          model: db.Oglas,
          attributes: ['id', 'naziv'],
          include: [{
            model: db.Kompanija,
            attributes: ['naziv'],
          }],
        }],
      },
    ],
    attributes: ['id', 'index_number', 'year_of_study', 'odsjekID', 'fakultetID'],
  });
};

const getPrakse = async (filter = 'all', koordinatorUserId) => {
  if (!db.Praksa) return [];
  const result = await getCoordinatorPractices(koordinatorUserId, filter || 'all');
  return result.prakse;
};

const approveStudent = async (studentUserId, koordinatorUserId) => {
  const koordinator = await resolveCoordinatorProfile(koordinatorUserId);
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');

  const student = await db.Student.findOne({
    where: { userID: studentUserId, fakultetID: koordinator.fakultetID },
  });
  if (!student) throw new Error('STUDENT_NOT_FOUND_OR_WRONG_FACULTY');

  const user = await db.User.findByPk(studentUserId);
  if (!user || user.role !== 'STUDENT') throw new Error('NOT_FOUND');
  if (!user.emailVerifikovan) throw new Error('EMAIL_NOT_VERIFIED');
  if (user.approvalStatus !== 'PENDING_APPROVAL') throw new Error('INVALID_STATUS');

  user.approvalStatus = 'APPROVED';
  user.status = 'ACTIVE';
  user.approvedBy = koordinatorUserId;
  user.approvedAt = new Date();
  await user.save();

  await sendAccountApprovedEmail(user.email, user.role);
  return { id: user.id, approvalStatus: user.approvalStatus };
};

const rejectStudent = async (studentUserId, razlog, koordinatorUserId) => {
  if (!razlog?.trim()) throw new Error('RAZLOG_REQUIRED');

  const koordinator = await resolveCoordinatorProfile(koordinatorUserId);
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');

  const student = await db.Student.findOne({
    where: { userID: studentUserId, fakultetID: koordinator.fakultetID },
  });
  if (!student) throw new Error('STUDENT_NOT_FOUND_OR_WRONG_FACULTY');

  const user = await db.User.findByPk(studentUserId);
  if (!user || user.role !== 'STUDENT') throw new Error('NOT_FOUND');
  if (!user.emailVerifikovan) throw new Error('EMAIL_NOT_VERIFIED');
  if (user.approvalStatus !== 'PENDING_APPROVAL') throw new Error('INVALID_STATUS');

  user.approvalStatus = 'REJECTED';
  user.status = 'DEACTIVATED';
  user.rejectedBy = koordinatorUserId;
  user.rejectedAt = new Date();
  user.rejectionReason = razlog.trim();
  await user.save();

  await sendAccountRejectedEmail(user.email, user.rejectionReason);
  return { id: user.id, approvalStatus: user.approvalStatus };
};

module.exports = {
  getDashboardStats,
  getPrijave,
  getPrijavaById,
  odluciOPrijavi,
  getStudenti,
  getPrakse,
  approveStudent,
  rejectStudent,
};
