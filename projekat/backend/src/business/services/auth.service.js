'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op, UniqueConstraintError } = require('sequelize');
const { User, Student, Koordinator, Kompanija, Fakultet, Odsjek } = require('../../infrastructure/database/models');
const sequelize = require('../../infrastructure/database/db');
const { sendPasswordResetEmail, sendEmailVerificationEmail } = require('./email.service');
const { ACTION_TYPES, logAudit } = require('./audit.service');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';
const SALT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(?:\d{9,10}|\+387[1-9]\d{7,8})$/;
const PHONE_VALIDATION_MESSAGE = 'Broj telefona mora sadržavati 9 ili 10 cifara ili biti u formatu +387.';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
}

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function normalizePhone(telefon) {
  if (telefon === undefined || telefon === null || telefon === '') {
    return null;
  }

  const normalized = String(telefon);
  if (!PHONE_RE.test(normalized)) {
    throw makeError(PHONE_VALIDATION_MESSAGE, 400);
  }

  return normalized;
}

async function checkAvailability(type, value) {
  if (!['username', 'email'].includes(type) || !value) {
    const err = new Error('Neispravni parametri.');
    err.status = 400;
    throw err;
  }
  const where = type === 'username' ? { username: value } : { email: value };
  const existing = await User.findOne({ where });
  return { available: !existing };
}

async function getPublicFaculties() {
  return Fakultet.findAll({ attributes: ['id', 'naziv'], order: [['naziv', 'ASC']] });
}

async function getPublicOdsjeci(fakultetID) {
  return Odsjek.findAll({ where: { fakultetID }, attributes: ['id', 'naziv'], order: [['naziv', 'ASC']] });
}

async function register(data) {
  const { role, username, email, password } = data;

  if (!EMAIL_RE.test(email)) {
    const err = new Error('Email adresa nije ispravnog formata.');
    err.status = 400;
    throw err;
  }

  if (!password || password.length < 8) {
    const err = new Error('Lozinka mora imati najmanje 8 karaktera.');
    err.status = 400;
    throw err;
  }

  const takenUsername = await User.findOne({ where: { username } });
  if (takenUsername) {
    const err = new Error('Korisničko ime je već zauzeto.');
    err.status = 409;
    throw err;
  }

  const takenEmail = await User.findOne({ where: { email } });
  if (takenEmail) {
    const err = new Error('Email adresa je već registrovana.');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    if (role === 'STUDENT') {
      const { ime, prezime, fakultetID, year_of_study, index_number, odsjekID } = data;
      const year = Number(year_of_study);
      if (!Number.isInteger(year) || year < 1) {
        const err = new Error('Godina studija mora biti pozitivan cijeli broj.');
        err.status = 400;
        throw err;
      }
      const faculty = await Fakultet.findByPk(fakultetID);
      if (!faculty) {
        const err = new Error('Odabrani fakultet nije pronađen.');
        err.status = 404;
        throw err;
      }
      const user = await sequelize.transaction(async (t) => {
        const createdUser = await User.create(
          { ime, prezime, username, email, passwordHash, role: 'STUDENT', status: 'ACTIVE', approvalStatus: 'PENDING_APPROVAL', approvalRequestedAt: new Date(), institution: faculty.naziv },
          { transaction: t }
        );
        await Student.create(
          { userID: createdUser.id, fakultetID: Number(fakultetID), year_of_study: year, index_number, odsjekID: odsjekID ? Number(odsjekID) : null },
          { transaction: t }
        );
        return createdUser;
      });
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = verificationToken;
      user.emailVerificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await sendEmailVerificationEmail(user.email, verificationLink);
      await logAudit({
        userID: user.id,
        actionType: ACTION_TYPES.USER_REGISTERED,
        details: { role: user.role, username: user.username, email: user.email },
        userSnapshot: {
          userName: `${user.ime || ''} ${user.prezime || ''}`.trim() || user.email,
          userEmail: user.email,
          userRole: user.role,
        },
      });
      return user;
    }

    if (role === 'COORDINATOR') {
      const { ime, prezime, fakultetID, odsjekID } = data;
      const faculty = await Fakultet.findByPk(fakultetID);
      if (!faculty) {
        const err = new Error('Odabrani fakultet nije pronađen.');
        err.status = 404;
        throw err;
      }
      const user = await sequelize.transaction(async (t) => {
        const createdUser = await User.create(
          { ime, prezime, username, email, passwordHash, role: 'COORDINATOR', status: 'ACTIVE', approvalStatus: 'PENDING_APPROVAL', approvalRequestedAt: new Date(), institution: faculty.naziv },
          { transaction: t }
        );
        await Koordinator.create(
          { userID: createdUser.id, fakultetID: Number(fakultetID), odsjekID: odsjekID ? Number(odsjekID) : null },
          { transaction: t }
        );
        return createdUser;
      });
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = verificationToken;
      user.emailVerificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await sendEmailVerificationEmail(user.email, verificationLink);
      await logAudit({
        userID: user.id,
        actionType: ACTION_TYPES.USER_REGISTERED,
        details: { role: user.role, username: user.username, email: user.email },
        userSnapshot: {
          userName: `${user.ime || ''} ${user.prezime || ''}`.trim() || user.email,
          userEmail: user.email,
          userRole: user.role,
        },
      });
      return user;
    }

    if (role === 'COMPANY') {
      const { naziv, adresa, telefon, opisPoslovanja, kontaktOsoba } = data;
      const normalizedTelefon = normalizePhone(telefon);
      const user = await sequelize.transaction(async (t) => {
        const createdUser = await User.create(
          { ime: naziv, prezime: '', username, email, passwordHash, role: 'COMPANY', status: 'ACTIVE', approvalStatus: 'PENDING_APPROVAL', approvalRequestedAt: new Date(), institution: naziv },
          { transaction: t }
        );
        await Kompanija.create(
          { userID: createdUser.id, naziv, adresa: adresa || null, telefon: normalizedTelefon, opisPoslovanja: opisPoslovanja || null, kontaktOsoba: kontaktOsoba || null },
          { transaction: t }
        );
        return createdUser;
      });
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = verificationToken;
      user.emailVerificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await sendEmailVerificationEmail(user.email, verificationLink);
      await logAudit({
        userID: user.id,
        actionType: ACTION_TYPES.USER_REGISTERED,
        details: { role: user.role, username: user.username, email: user.email },
        userSnapshot: {
          userName: user.ime || user.email,
          userEmail: user.email,
          userRole: user.role,
        },
      });
      return user;
    }

    const err = new Error('Nepoznata rola.');
    err.status = 400;
    throw err;
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      const field = err.errors?.[0]?.path;
      const msg = field === 'email' ? 'Email adresa je već registrovana.' : 'Korisničko ime je već zauzeto.';
      const conflict = new Error(msg);
      conflict.status = 409;
      throw conflict;
    }
    throw err;
  }
}

async function loginService(identifier, password) {
  const user = await User.findOne({
    where: {
      [Op.or]: [{ username: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    throw new Error('Pogrešno korisničko ime/e-mail ili lozinka.');
  }

  if (user.status === 'DEACTIVATED') {
    throw new Error('Vaš nalog je deaktiviran. Kontaktirajte administratora.');
  }

  if (user.status === 'PENDING') {
    throw new Error('Vaš nalog još nije aktivan. Sačekajte odobrenje administratora.');
  }

  if (user.role !== 'ADMIN') {
    if (user.approvalStatus === 'PENDING_APPROVAL') {
      throw new Error('Vaš korisnički račun čeka odobrenje administratora ili koordinatora.');
    }

    if (user.approvalStatus === 'REJECTED') {
      const reason = user.rejectionReason ? ` Razlog: ${user.rejectionReason}` : '';
      throw new Error(`Vaš zahtjev je odbijen.${reason}`);
    }

    if (user.approvalStatus !== 'APPROVED') {
      throw new Error('Vaš korisnički račun još nije odobren.');
    }
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new Error('Pogrešno korisničko ime/e-mail ili lozinka.');
  }

  if (!user.emailVerifikovan) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return {
    token,
    user: {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      email: user.email,
      role: user.role,
      institution: user.institution,
      status: user.status,
    },
  };
}

async function forgotPasswordService(email) {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(user.email, resetLink);
}

async function resetPasswordService(token, newPassword) {
  const user = await User.findOne({ where: { passwordResetToken: token } });

  if (!user) {
    throw new Error('Neispravan token.');
  }

  if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new Error('Token je istekao.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordHash = hashedPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();
}

async function verifyEmailService(token) {
  const user = await User.findOne({ where: { emailVerificationToken: token } });
  if (!user) {
    const err = new Error('Neispravan verifikacioni token.');
    err.status = 400;
    throw err;
  }
  if (user.emailVerificationTokenExpiresAt < new Date()) {
    const err = new Error('Verifikacioni token je istekao.');
    err.status = 400;
    throw err;
  }
  user.emailVerifikovan = true;
  user.emailVerificationToken = null;
  user.emailVerificationTokenExpiresAt = null;
  await user.save();
}

async function resendVerificationEmailService(email) {
  const user = await User.findOne({ where: { email } });
  if (!user || user.emailVerifikovan) return;
  const token = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = token;
  user.emailVerificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendEmailVerificationEmail(user.email, link);
}

module.exports = {
  checkAvailability,
  getPublicFaculties,
  getPublicOdsjeci,
  register,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  verifyEmailService,
  resendVerificationEmailService,
};
