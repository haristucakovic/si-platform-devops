'use strict';

const { Op } = require('sequelize');
const { sequelize, User, Student, Kompanija, Oglas, PrijavaNaPraksu, Koordinator, Fakultet, Praksa, Aktivnost, Prisustvo, Evaluacija, Ugovor, Izvjestaj } = require('../../infrastructure/database/models');
const { sendStudentDeactivationToCompany, sendStudentDeactivationToKoordinator } = require('./email.service');
const {
  APPLICATION_STATUS,
  ACTIVE_APPLICATION_STATUSES,
  COMPANY_BLOCKING_STATUSES,
  COORDINATOR_STATUS,
  STUDENT_BLOCKING_STATUSES,
} = require('./applicationStatus.service');
const bcrypt = require('bcrypt');
const { ACTION_TYPES, logAudit } = require('./audit.service');

const PROFILE_FIELDS = ['naziv', 'opisPoslovanja', 'djelatnost', 'adresa', 'telefon', 'kontaktOsoba'];
const OPTIONAL_FIELDS = ['opisPoslovanja', 'djelatnost', 'telefon', 'kontaktOsoba'];
const PHONE_RE = /^(?:\d{9,10}|\+387[1-9]\d{7,8})$/;
const PHONE_VALIDATION_MESSAGE = 'Broj telefona mora sadržavati 9 ili 10 cifara ili biti u formatu +387.';

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function hasOwn(data, field) {
  return Object.prototype.hasOwnProperty.call(data, field);
}

function normalizeString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeRequired(value, message) {
  const normalized = normalizeString(value);
  if (!normalized) {
    throw makeError(message, 400);
  }
  return normalized;
}

function normalizeOptional(value) {
  const normalized = normalizeString(value);
  return normalized || null;
}

function normalizePhone(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const normalized = String(value);
  if (!PHONE_RE.test(normalized)) {
    throw makeError(PHONE_VALIDATION_MESSAGE, 400);
  }

  return normalized;
}

function normalizeOptionalProfileField(field, value) {
  return field === 'telefon' ? normalizePhone(value) : normalizeOptional(value);
}

function mapCompanyProfile(company) {
  return {
    naziv: company.naziv,
    opisPoslovanja: company.opisPoslovanja,
    djelatnost: company.djelatnost,
    adresa: company.adresa,
    telefon: company.telefon,
    kontaktOsoba: company.kontaktOsoba,
  };
}

function mapFallbackCompanyProfile(user) {
  return {
    naziv: user.ime || user.institution || user.username || 'Kompanija',
    opisPoslovanja: null,
    djelatnost: null,
    adresa: null,
    telefon: null,
    kontaktOsoba: null,
  };
}

async function getCompanyProfile(userId) {
  const company = await Kompanija.findOne({ where: { userID: userId } });

  if (company) {
    return mapCompanyProfile(company);
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw makeError('Korisnik nije pronađen.', 404);
  }

  return mapFallbackCompanyProfile(user);
}

async function updateCompanyProfile(userId, data) {
  const existingCompany = await Kompanija.findOne({ where: { userID: userId } });
  const user = await User.findByPk(userId);

  if (!user) {
    throw makeError('Korisnik nije pronađen.', 404);
  }

  const fallbackNaziv = user.ime || user.institution || user.username || '';

  const nextNaziv = normalizeRequired(
    hasOwn(data, 'naziv') ? data.naziv : existingCompany?.naziv ?? fallbackNaziv,
    'Naziv kompanije je obavezan.'
  );

  const nextAdresa = normalizeRequired(
    hasOwn(data, 'adresa') ? data.adresa : existingCompany?.adresa,
    'Adresa je obavezna.'
  );

  const updatedCompany = await sequelize.transaction(async (transaction) => {
    let company = existingCompany;

    if (!company) {
      const createPayload = {
        userID: userId,
        naziv: nextNaziv,
        adresa: nextAdresa,
      };

      for (const field of OPTIONAL_FIELDS) {
        createPayload[field] = hasOwn(data, field) ? normalizeOptionalProfileField(field, data[field]) : null;
      }

      company = await Kompanija.create(createPayload, { transaction });
    } else {
      const fieldsToSave = ['naziv', 'adresa'];

      company.naziv = nextNaziv;
      company.adresa = nextAdresa;

      for (const field of OPTIONAL_FIELDS) {
        if (field === 'telefon' || hasOwn(data, field)) {
          company[field] = normalizeOptionalProfileField(field, hasOwn(data, field) ? data[field] : undefined);
          fieldsToSave.push(field);
        }
      }

      await company.save({ transaction, fields: fieldsToSave });
    }

    if (user.ime !== nextNaziv || user.institution !== nextNaziv) {
      user.ime = nextNaziv;
      user.institution = nextNaziv;
      await user.save({ transaction, fields: ['ime', 'institution'] });
    }

    return company;
  });

  return mapCompanyProfile(updatedCompany);
}

async function checkDeactivation(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }

  const student = await Student.findOne({ where: { userID: userId } });
  if (!student) return { canDeactivate: true, pendingApplications: [] };

  const applications = await PrijavaNaPraksu.findAll({
    where: {
      studentID: student.id,
      status: { [Op.in]: STUDENT_BLOCKING_STATUSES },
    },
    include: [
      {
        model: Oglas,
        attributes: ['naziv'],
        include: [{ model: Kompanija, attributes: ['naziv'] }],
      },
    ],
  });

  const odobrene = applications.filter(a => a.status === APPLICATION_STATUS.APPROVED);
  if (odobrene.length > 0) {
    return {
      canDeactivate: false,
      reason: 'ODOBRENA_EXISTS',
      companies: odobrene.map(a => a.Oglas?.Kompanija?.naziv || 'N/A'),
    };
  }

  const pending = applications.filter(a => ACTIVE_APPLICATION_STATUSES.includes(a.status));
  return {
    canDeactivate: true,
    pendingApplications: pending.map(a => ({
      oglasNaziv: a.Oglas?.naziv || 'N/A',
      kompanijaNaziv: a.Oglas?.Kompanija?.naziv || 'N/A',
    })),
  };
}

async function deactivateMyAccount(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }
  if (user.status === 'DEACTIVATED') {
    const err = new Error('Nalog je već deaktiviran.');
    err.status = 400;
    throw err;
  }

  const student = await Student.findOne({ where: { userID: userId } });

  if (student) {
    const odobrena = await PrijavaNaPraksu.findOne({
      where: { studentID: student.id, status: APPLICATION_STATUS.APPROVED },
    });
    if (odobrena) {
      const err = new Error('Imate odobrenu praksu. Morate se najprije odjaviti s prakse prije deaktivacije naloga.');
      err.status = 409;
      err.code = 'ODOBRENA_EXISTS';
      throw err;
    }

    const pending = await PrijavaNaPraksu.findAll({
      where: {
        studentID: student.id,
        status: { [Op.in]: ACTIVE_APPLICATION_STATUSES },
      },
      include: [
        {
          model: Oglas,
          attributes: ['naziv'],
          include: [
            {
              model: Kompanija,
              include: [{ model: User, attributes: ['email'] }],
            },
          ],
        },
        {
          model: Koordinator,
          include: [{ model: User, attributes: ['email'] }],
        },
      ],
    });

    if (pending.length > 0) {
      await PrijavaNaPraksu.update(
        { status: APPLICATION_STATUS.WITHDRAWN, datumOdustajanja: new Date() },
        {
          where: {
            studentID: student.id,
            status: { [Op.in]: ACTIVE_APPLICATION_STATUSES },
          },
        }
      );

      const studentName = `${user.ime} ${user.prezime}`;
      const notifPromises = [];
      for (const prijava of pending) {
        const oglasNaziv = prijava.Oglas?.naziv || 'N/A';
        await logAudit({
          userID: userId,
          actionType: ACTION_TYPES.INTERNSHIP_WITHDRAWN,
          details: {
            prijavaID: prijava.id,
            oglasNaziv,
            reason: 'ACCOUNT_DEACTIVATION',
            fromStatus: prijava.status,
            toStatus: 'ODUSTAO',
          },
        });
        const companyEmail = prijava.Oglas?.Kompanija?.User?.email;
        if (companyEmail) {
          notifPromises.push(
            sendStudentDeactivationToCompany(companyEmail, studentName, oglasNaziv).catch(() => {})
          );
        }
        const koordinatorEmail = prijava.Koordinator?.User?.email;
        if (koordinatorEmail) {
          notifPromises.push(
            sendStudentDeactivationToKoordinator(koordinatorEmail, studentName, oglasNaziv).catch(() => {})
          );
        }
      }
      await Promise.all(notifPromises);
    }
  }

  user.status = 'DEACTIVATED';
  await user.save();
}

async function checkCompanyDeactivation(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }

  const company = await Kompanija.findOne({ where: { userID: userId } });
  if (!company) return { canDeactivate: true, oglasiToClose: [] };

  const aktivniOglasi = await Oglas.findAll({
    where: { kompanijaID: company.id, status: 'AKTIVAN' },
    include: [{
      model: PrijavaNaPraksu,
      where: {
        koordinatorStatus: COORDINATOR_STATUS.APPROVED,
        status: { [Op.in]: COMPANY_BLOCKING_STATUSES },
      },
      required: false,
    }],
  });

  const blocked = aktivniOglasi.filter(o => o.PrijavaNaPraksus?.length > 0);
  if (blocked.length > 0) {
    return {
      canDeactivate: false,
      reason: 'AKTIVAN_SA_PRIJAVAMA',
      oglasi: blocked.map(o => o.naziv),
    };
  }

  return {
    canDeactivate: true,
    oglasiToClose: aktivniOglasi.map(o => o.naziv),
  };
}

async function deactivateCompanyAccount(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }
  if (user.status === 'DEACTIVATED') {
    const err = new Error('Nalog je već deaktiviran.');
    err.status = 400;
    throw err;
  }

  const company = await Kompanija.findOne({ where: { userID: userId } });

  if (company) {
    const blocked = await Oglas.findOne({
      where: { kompanijaID: company.id, status: 'AKTIVAN' },
      include: [{
        model: PrijavaNaPraksu,
        where: {
          koordinatorStatus: COORDINATOR_STATUS.APPROVED,
          status: { [Op.in]: COMPANY_BLOCKING_STATUSES },
        },
        required: true,
      }],
    });
    if (blocked) {
      const err = new Error('Imate aktivne oglase sa prijavama. Zatvorite oglase prije deaktivacije naloga.');
      err.status = 409;
      err.code = 'AKTIVAN_SA_PRIJAVAMA';
      throw err;
    }

    await Oglas.update(
      { status: 'ZATVOREN' },
      { where: { kompanijaID: company.id, status: 'AKTIVAN' } }
    );
  }

  user.status = 'DEACTIVATED';
  await user.save();
}

async function checkCoordinatorDeactivation(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }

  const coordinator = await Koordinator.findOne({ where: { userID: userId } });
  if (!coordinator) return { canDeactivate: true, pendingCount: 0 };

  const odobrene = await PrijavaNaPraksu.findAll({
    where: { koordinatorID: coordinator.id, status: APPLICATION_STATUS.APPROVED },
    include: [{ model: Student, include: [{ model: User, attributes: ['ime', 'prezime'] }] }],
  });

  if (odobrene.length > 0) {
    return {
      canDeactivate: false,
      reason: 'ODOBRENA_EXISTS',
      studenti: odobrene.map(a => {
        const u = a.Student?.User;
        return u ? `${u.ime} ${u.prezime}` : 'N/A';
      }),
    };
  }

  const pendingCount = await PrijavaNaPraksu.count({
    where: { koordinatorID: coordinator.id, status: { [Op.in]: ACTIVE_APPLICATION_STATUSES } },
  });

  return { canDeactivate: true, pendingCount };
}

async function deactivateCoordinatorAccount(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }
  if (user.status === 'DEACTIVATED') {
    const err = new Error('Nalog je već deaktiviran.');
    err.status = 400;
    throw err;
  }

  const coordinator = await Koordinator.findOne({ where: { userID: userId } });

  if (coordinator) {
    const blocked = await PrijavaNaPraksu.findOne({
      where: { koordinatorID: coordinator.id, status: APPLICATION_STATUS.APPROVED },
    });
    if (blocked) {
      const err = new Error('Imate aktivne prakse u toku. Riješite ih prije deaktivacije naloga.');
      err.status = 409;
      err.code = 'ODOBRENA_EXISTS';
      throw err;
    }

    await PrijavaNaPraksu.update(
      { koordinatorID: null },
      { where: { koordinatorID: coordinator.id, status: { [Op.in]: ACTIVE_APPLICATION_STATUSES } } }
    );
  }

  user.status = 'DEACTIVATED';
  await user.save();
}

async function getMyProfile(userId) {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] },
    include: [
      {
        model: Student,
        required: false,
        include: [
          { model: Fakultet, attributes: ['naziv'], required: false },
        ],
      },
    ],
  });
 
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }
 
  return user;
}
 
async function updateStudentProfile(userId, data) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }
 
  if (user.role !== 'STUDENT') {
    const err = new Error('Samo studenti mogu mijenjati profil na ovaj način.');
    err.status = 403;
    throw err;
  }
 
  const { ime, prezime, email, currentPassword, newPassword } = data;
 
  // Email uniqueness check (only if changing)
  if (email && email !== user.email) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      const err = new Error('E-mail adresa je već u upotrebi.');
      err.status = 400;
      throw err;
    }
  }
 
  // Password change — requires current password verification
  if (newPassword) {
    if (!currentPassword) {
      const err = new Error('Unesite trenutnu lozinku da biste postavili novu.');
      err.status = 400;
      throw err;
    }
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      const err = new Error('Trenutna lozinka nije ispravna.');
      err.status = 400;
      throw err;
    }
    if (newPassword.length < 8) {
      const err = new Error('Nova lozinka mora imati najmanje 8 karaktera.');
      err.status = 400;
      throw err;
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
  }
 
  if (ime && ime.trim())     user.ime     = ime.trim();
  if (prezime && prezime.trim()) user.prezime = prezime.trim();
  if (email && email.trim()) user.email   = email.trim();
 
  await user.save();
 
  // Never return the password hash
  const userJson = user.toJSON();
  delete userJson.passwordHash;
  return userJson;
}

async function deleteMyAccount(userId) {
  const user = await User.findByPk(userId);
  const userSnapshot = user ? {
    userName: `${user.ime || ''} ${user.prezime || ''}`.trim() || user.email,
    userEmail: user.email,
    userRole: user.role,
  } : {};
  if (!user) throw makeError('Korisnik nije pronađen.', 404);

  const student = await Student.findOne({ where: { userID: userId } });

  if (student) {
    const odobrena = await PrijavaNaPraksu.findOne({
      where: { studentID: student.id, status: APPLICATION_STATUS.APPROVED },
    });
    if (odobrena) {
      const err = makeError('Imate odobrenu praksu. Morate se najprije odjaviti s prakse prije brisanja naloga.', 409);
      err.code = 'ODOBRENA_EXISTS';
      throw err;
    }

    const pending = await PrijavaNaPraksu.findAll({
      where: { studentID: student.id, status: { [Op.in]: ACTIVE_APPLICATION_STATUSES } },
      include: [
        { model: Oglas, attributes: ['naziv'], include: [{ model: Kompanija, include: [{ model: User, attributes: ['email'] }] }] },
        { model: Koordinator, include: [{ model: User, attributes: ['email'] }] },
      ],
    });

    if (pending.length > 0) {
      await PrijavaNaPraksu.update(
        { status: APPLICATION_STATUS.WITHDRAWN, datumOdustajanja: new Date() },
        { where: { studentID: student.id, status: { [Op.in]: ACTIVE_APPLICATION_STATUSES } } }
      );
      const studentName = `${user.ime} ${user.prezime}`;
      const notifPromises = [];
      for (const prijava of pending) {
        const oglasNaziv = prijava.Oglas?.naziv || 'N/A';
        await logAudit({
          userID: userId,
          actionType: ACTION_TYPES.INTERNSHIP_WITHDRAWN,
          details: {
            prijavaID: prijava.id,
            oglasNaziv,
            reason: 'ACCOUNT_DELETION',
            fromStatus: prijava.status,
            toStatus: 'ODUSTAO',
          },
          userSnapshot,
        });
        const companyEmail = prijava.Oglas?.Kompanija?.User?.email;
        const koordinatorEmail = prijava.Koordinator?.User?.email;
        if (companyEmail) notifPromises.push(sendStudentDeactivationToCompany(companyEmail, studentName, oglasNaziv).catch(() => {}));
        if (koordinatorEmail) notifPromises.push(sendStudentDeactivationToKoordinator(koordinatorEmail, studentName, oglasNaziv).catch(() => {}));
      }
      await Promise.all(notifPromises);
    }
  }

  await sequelize.transaction(async (t) => {
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
    await user.destroy({ transaction: t });
    await logAudit({
      userID: userId,
      actionType: ACTION_TYPES.USER_DELETED,
      details: { deletedBy: 'SELF', deletedUserID: userId },
      userSnapshot,
      transaction: t,
    });
  });
}

async function deleteCompanyAccount(userId) {
  const user = await User.findByPk(userId);
  const userSnapshot = user ? {
    userName: `${user.ime || ''} ${user.prezime || ''}`.trim() || user.email,
    userEmail: user.email,
    userRole: user.role,
  } : {};
  if (!user) throw makeError('Korisnik nije pronađen.', 404);

  const kompanija = await Kompanija.findOne({ where: { userID: userId } });

  if (kompanija) {
    const blocked = await Oglas.findOne({
      where: { kompanijaID: kompanija.id, status: 'AKTIVAN' },
      include: [{
        model: PrijavaNaPraksu,
        where: {
          koordinatorStatus: COORDINATOR_STATUS.APPROVED,
          status: { [Op.in]: COMPANY_BLOCKING_STATUSES },
        },
        required: true,
      }],
    });
    if (blocked) {
      const err = makeError('Imate aktivne oglase sa prijavama. Zatvorite oglase prije brisanja naloga.', 409);
      err.code = 'AKTIVAN_SA_PRIJAVAMA';
      throw err;
    }
  }

  await sequelize.transaction(async (t) => {
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
    await user.destroy({ transaction: t });
    await logAudit({
      userID: userId,
      actionType: ACTION_TYPES.USER_DELETED,
      details: { deletedBy: 'SELF', deletedUserID: userId },
      userSnapshot,
      transaction: t,
    });
  });
}

async function deleteCoordinatorAccount(userId) {
  const user = await User.findByPk(userId);
  const userSnapshot = user ? {
    userName: `${user.ime || ''} ${user.prezime || ''}`.trim() || user.email,
    userEmail: user.email,
    userRole: user.role,
  } : {};
  if (!user) throw makeError('Korisnik nije pronađen.', 404);

  const koordinator = await Koordinator.findOne({ where: { userID: userId } });

  if (koordinator) {
    const blocked = await PrijavaNaPraksu.findOne({
      where: { koordinatorID: koordinator.id, status: APPLICATION_STATUS.APPROVED },
    });
    if (blocked) {
      const err = makeError('Imate aktivne prakse u toku. Riješite ih prije brisanja naloga.', 409);
      err.code = 'ODOBRENA_EXISTS';
      throw err;
    }
  }

  await sequelize.transaction(async (t) => {
    if (koordinator) {
      await Izvjestaj.destroy({ where: { koordinatorID: koordinator.id }, transaction: t });
      await PrijavaNaPraksu.update(
        { koordinatorID: null },
        { where: { koordinatorID: koordinator.id }, transaction: t }
      );
      await koordinator.destroy({ transaction: t });
    }
    await user.destroy({ transaction: t });
    await logAudit({
      userID: userId,
      actionType: ACTION_TYPES.USER_DELETED,
      details: { deletedBy: 'SELF', deletedUserID: userId },
      userSnapshot,
      transaction: t,
    });
  });
}

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
  checkDeactivation,
  deactivateMyAccount,
  checkCompanyDeactivation,
  deactivateCompanyAccount,
  checkCoordinatorDeactivation,
  deactivateCoordinatorAccount,
  deleteMyAccount,
  deleteCompanyAccount,
  deleteCoordinatorAccount,
  getMyProfile,
  updateStudentProfile,
};
