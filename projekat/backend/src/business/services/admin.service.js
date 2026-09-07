'use strict';

const { Op } = require('sequelize');
const { sequelize, User, Fakultet, Koordinator, Student, Kompanija, Oglas, PrijavaNaPraksu, Praksa, Aktivnost, Prisustvo, Evaluacija, Ugovor, Izvjestaj, Odsjek } = require('../../infrastructure/database/models');
const { ACTION_TYPES, logAudit, getAuditLogs } = require('./audit.service');
const {
  APPLICATION_STATUS,
  ACTIVE_APPLICATION_STATUSES,
  STUDENT_BLOCKING_STATUSES,
} = require('./applicationStatus.service');

const ALLOWED_ROLES = ['STUDENT', 'COMPANY', 'COORDINATOR', 'ADMIN'];

function mapUser(u) {
  return {
    id: u.id,
    name: `${u.ime} ${u.prezime}`,
    email: u.email,
    role: u.role,
    status: u.status,
    institution: u.institution,
    created_at: u.created_at,
  };
}

async function getUsers(status) {
  const where = status ? { status: status.toUpperCase() } : {};
  where.approvalStatus = 'APPROVED';
  const users = await User.findAll({
    where,
    attributes: ['id', 'ime', 'prezime', 'email', 'role', 'status', 'institution', 'created_at'],
    order: [['created_at', 'DESC']],
  });
  return users.map(mapUser);
}

async function updateUserRole(id, role) {
  if (!ALLOWED_ROLES.includes(role)) {
    const err = new Error(`Invalid role: ${role}. Allowed: ${ALLOWED_ROLES.join(', ')}`);
    err.status = 400;
    throw err;
  }
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
  user.role = role;
  await user.save();
  return mapUser(user);
}

const ALLOWED_STATUSES = ['PENDING', 'ACTIVE', 'DEACTIVATED'];

async function runDeactivationCleanup(user, actorId = null) {
  if (user.role === 'STUDENT') {
    const student = await Student.findOne({ where: { userID: user.id } });
    if (student) {
      const prijave = await PrijavaNaPraksu.findAll({
        where: {
          studentID: student.id,
          status: { [Op.in]: ['PODNESENA', 'U_RAZMATRANJU', 'ODOBRENA'] },
        },
      });
      await PrijavaNaPraksu.update(
        { status: APPLICATION_STATUS.WITHDRAWN, datumOdustajanja: new Date() },
        {
          where: {
            studentID: student.id,
            status: { [Op.in]: STUDENT_BLOCKING_STATUSES },
          },
        }
      );
      for (const prijava of Array.isArray(prijave) ? prijave : []) {
        await logAudit({
          userID: actorId,
          actionType: ACTION_TYPES.INTERNSHIP_WITHDRAWN,
          details: {
            prijavaID: prijava.id,
            studentUserID: user.id,
            reason: 'ADMIN_DEACTIVATION',
            fromStatus: prijava.status,
            toStatus: 'ODUSTAO',
          },
        });
      }
    }
  } else if (user.role === 'COMPANY') {
    const kompanija = await Kompanija.findOne({ where: { userID: user.id } });
    if (kompanija) {
      await Oglas.update(
        { status: 'ZATVOREN' },
        { where: { kompanijaID: kompanija.id, status: 'AKTIVAN' } }
      );
    }
  } else if (user.role === 'COORDINATOR') {
    const koordinator = await Koordinator.findOne({ where: { userID: user.id } });
    if (koordinator) {
      await PrijavaNaPraksu.update(
        { koordinatorID: null },
        {
          where: {
            koordinatorID: koordinator.id,
            status: { [Op.in]: ACTIVE_APPLICATION_STATUSES },
          },
        }
      );
    }
  }
}

async function updateUserStatus(id, status, actorId = null) {
  if (!ALLOWED_STATUSES.includes(status)) {
    const err = new Error(`Invalid status: ${status}. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
    err.status = 400;
    throw err;
  }
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
  if (status === 'ACTIVE' && !user.emailVerifikovan) {
    const err = new Error('Korisnik ne može biti aktiviran dok email adresa nije verifikovana.');
    err.status = 400;
    throw err;
  }
  user.status = status;
  if (status === 'ACTIVE') {
    user.approvalStatus = 'APPROVED';
    user.approvedAt = new Date();
    user.rejectedAt = null;
    user.rejectedBy = null;
    user.rejectionReason = null;
  } else if (status === 'DEACTIVATED') {
    user.approvalStatus = 'REJECTED';
    user.rejectedAt = new Date();
    await runDeactivationCleanup(user, actorId);
  } else if (status === 'PENDING') {
    user.approvalStatus = 'PENDING_APPROVAL';
    user.approvalRequestedAt = new Date();
  }
  await user.save();
  await logAudit({
    userID: actorId,
    actionType: ACTION_TYPES.APPLICATION_STATUS_CHANGED,
    details: {
      entityType: 'USER_STATUS',
      targetUserID: user.id,
      targetEmail: user.email,
      toStatus: status,
    },
  });
  return mapUser(user);
}

async function getFaculties() {
  return Fakultet.findAll({ order: [['naziv', 'ASC']] });
}

async function createFaculty({ naziv, email, adresa }) {
  if (!naziv || !naziv.trim()) {
    const err = new Error('Field "naziv" is required.');
    err.status = 400;
    throw err;
  }
  return Fakultet.create({ naziv: naziv.trim(), email: email || null, adresa: adresa || null });
}

async function updateFaculty(id, { naziv, email, adresa }) {
  const faculty = await Fakultet.findByPk(id);
  if (!faculty) {
    const err = new Error('Faculty not found.');
    err.status = 404;
    throw err;
  }
  if (naziv !== undefined) faculty.naziv = naziv.trim();
  if (email !== undefined) faculty.email = email || null;
  if (adresa !== undefined) faculty.adresa = adresa || null;
  await faculty.save();
  return faculty;
}

async function deleteFaculty(id) {
  const faculty = await Fakultet.findByPk(id);
  if (!faculty) {
    const err = new Error('Faculty not found.');
    err.status = 404;
    throw err;
  }
  const coordinatorCount = await Koordinator.count({ where: { fakultetID: id } });
  if (coordinatorCount > 0) {
    const err = new Error('Cannot delete faculty with linked coordinators.');
    err.status = 409;
    throw err;
  }
  const studentCount = await Student.count({ where: { fakultetID: id } });
  if (studentCount > 0) {
    const err = new Error('Cannot delete faculty with linked students.');
    err.status = 409;
    throw err;
  }
  await faculty.destroy();
}

async function getOdsjeci(fakultetID) {
  const faculty = await Fakultet.findByPk(fakultetID);
  if (!faculty) {
    const err = new Error('Faculty not found.');
    err.status = 404;
    throw err;
  }
  return Odsjek.findAll({ where: { fakultetID }, order: [['naziv', 'ASC']] });
}

async function createOdsjek(fakultetID, naziv) {
  if (!naziv || !naziv.trim()) {
    const err = new Error('Field "naziv" is required.');
    err.status = 400;
    throw err;
  }
  const faculty = await Fakultet.findByPk(fakultetID);
  if (!faculty) {
    const err = new Error('Faculty not found.');
    err.status = 404;
    throw err;
  }
  return Odsjek.create({ naziv: naziv.trim(), fakultetID });
}

async function deleteOdsjek(id) {
  const odsjek = await Odsjek.findByPk(id);
  if (!odsjek) {
    const err = new Error('Odsjek not found.');
    err.status = 404;
    throw err;
  }
  await odsjek.destroy();
}

async function deleteUser(id, actorId = null) {
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
  const deletedUserSnapshot = {
    userName: `${user.ime || ''} ${user.prezime || ''}`.trim() || user.email,
    userEmail: user.email,
    userRole: user.role,
  };

  await sequelize.transaction(async (t) => {
    if (user.role === 'STUDENT') {
      const student = await Student.findOne({ where: { userID: id }, transaction: t });
      if (student) {
        const prijave = await PrijavaNaPraksu.findAll({ where: { studentID: student.id }, transaction: t });
        for (const prijava of prijave) {
          const praksa = await Praksa.findOne({ where: { prijavaID: prijava.id }, transaction: t });
          if (praksa) {
            await Aktivnost.destroy({ where: { praksaID: praksa.id }, transaction: t });
            await Prisustvo.destroy({ where: { praksaID: praksa.id }, transaction: t });
            await Evaluacija.destroy({ where: { praksaID: praksa.id }, transaction: t });
            await Ugovor.destroy({ where: { praksaID: praksa.id }, transaction: t });
            await Izvjestaj.destroy({ where: { praksaID: praksa.id }, transaction: t });
            await praksa.destroy({ transaction: t });
          }
        }
        await PrijavaNaPraksu.destroy({ where: { studentID: student.id }, transaction: t });
        await student.destroy({ transaction: t });
      }

    } else if (user.role === 'COMPANY') {
      const kompanija = await Kompanija.findOne({ where: { userID: id }, transaction: t });
      if (kompanija) {
        const oglasi = await Oglas.findAll({ where: { kompanijaID: kompanija.id }, transaction: t });
        for (const oglas of oglasi) {
          const prijave = await PrijavaNaPraksu.findAll({ where: { oglasID: oglas.id }, transaction: t });
          for (const prijava of prijave) {
            const praksa = await Praksa.findOne({ where: { prijavaID: prijava.id }, transaction: t });
            if (praksa) {
              await Aktivnost.destroy({ where: { praksaID: praksa.id }, transaction: t });
              await Prisustvo.destroy({ where: { praksaID: praksa.id }, transaction: t });
              await Evaluacija.destroy({ where: { praksaID: praksa.id }, transaction: t });
              await Ugovor.destroy({ where: { praksaID: praksa.id }, transaction: t });
              await Izvjestaj.destroy({ where: { praksaID: praksa.id }, transaction: t });
              await praksa.destroy({ transaction: t });
            }
          }
          await PrijavaNaPraksu.destroy({ where: { oglasID: oglas.id }, transaction: t });
        }
        await Oglas.destroy({ where: { kompanijaID: kompanija.id }, transaction: t });
        await kompanija.destroy({ transaction: t });
      }

    } else if (user.role === 'COORDINATOR') {
      const koordinator = await Koordinator.findOne({ where: { userID: id }, transaction: t });
      if (koordinator) {
        await Izvjestaj.destroy({ where: { koordinatorID: koordinator.id }, transaction: t });
        await PrijavaNaPraksu.update(
          { koordinatorID: null },
          { where: { koordinatorID: koordinator.id }, transaction: t }
        );
        await koordinator.destroy({ transaction: t });
      }

    } else if (user.role === 'ADMIN') {
      await User.update({ approvedBy: null }, { where: { approvedBy: id }, transaction: t });
      await User.update({ rejectedBy: null }, { where: { rejectedBy: id }, transaction: t });
    }

    await user.destroy({ transaction: t });
    await logAudit({
      userID: actorId,
      actionType: ACTION_TYPES.USER_DELETED,
      details: {
        deletedUserID: id,
        deletedUser: deletedUserSnapshot,
      },
      transaction: t,
    });
  });
}

module.exports = { getUsers, updateUserRole, updateUserStatus, deleteUser, getFaculties, createFaculty, updateFaculty, deleteFaculty, getOdsjeci, createOdsjek, deleteOdsjek, getAuditLogs };
