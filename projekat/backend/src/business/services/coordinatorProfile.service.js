'use strict';

const {
  User,
  Koordinator,
  Fakultet,
} = require('../../infrastructure/database/models');

const LEGACY_FACULTY_ALIASES = {
  etf: 'elektrotehnicki fakultet sarajevo',
  'etf sarajevo': 'elektrotehnicki fakultet sarajevo',
  fit: 'fakultet informacijskih tehnologija',
};

function normalizeFacultyName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function resolveCoordinatorProfile(userId) {
  const existing = await Koordinator.findOne({
    where: { userID: userId },
    attributes: ['id', 'userID', 'fakultetID', 'odsjekID'],
  });
  if (existing) return existing;

  if (
    typeof User?.findOne !== 'function' ||
    typeof Fakultet?.findAll !== 'function' ||
    typeof Koordinator?.findOrCreate !== 'function'
  ) {
    return null;
  }

  const user = await User.findOne({
    where: {
      id: userId,
      role: 'COORDINATOR',
      status: 'ACTIVE',
      approvalStatus: 'APPROVED',
    },
    attributes: ['id', 'institution'],
  });
  if (!user?.institution) return null;

  const normalizedInstitution = normalizeFacultyName(user.institution);
  const expectedFaculty = LEGACY_FACULTY_ALIASES[normalizedInstitution] || normalizedInstitution;
  const faculties = await Fakultet.findAll({ attributes: ['id', 'naziv'] });
  const faculty = faculties.find((item) => normalizeFacultyName(item.naziv) === expectedFaculty);
  if (!faculty) return null;

  const [profile] = await Koordinator.findOrCreate({
    where: { userID: user.id },
    defaults: {
      userID: user.id,
      fakultetID: faculty.id,
      odsjekID: null,
    },
  });

  return profile;
}

module.exports = { resolveCoordinatorProfile };
