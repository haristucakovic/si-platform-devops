'use strict';

const { User, Student } = require('../../infrastructure/database/models');
const { sendAccountApprovedEmail, sendAccountRejectedEmail } = require('./email.service');
const { ACTION_TYPES, logAudit } = require('./audit.service');
const { resolveCoordinatorProfile } = require('./coordinatorProfile.service');

const ALLOWED_ASSIGN_ROLES = ['STUDENT', 'COMPANY', 'COORDINATOR'];
const OVERDUE_HOURS = 48;

function mapApprovalRequest(user) {
  const requestedAt = user.approvalRequestedAt || user.created_at || null;
  const overdue =
    user.approvalStatus === 'PENDING_APPROVAL' &&
    requestedAt &&
    Date.now() - new Date(requestedAt).getTime() > OVERDUE_HOURS * 60 * 60 * 1000;

  return {
    id: user.id,
    ime: user.ime,
    prezime: user.prezime,
    email: user.email,
    role: user.role,
    status: user.status,
    approvalStatus: user.approvalStatus,
    approvalRequestedAt: requestedAt,
    approvedBy: user.approvedBy,
    approvedAt: user.approvedAt,
    rejectedBy: user.rejectedBy,
    rejectedAt: user.rejectedAt,
    rejectionReason: user.rejectionReason,
    overdue: Boolean(overdue),
    created_at: user.created_at,
  };
}

async function getUserApprovalRequests() {
  const users = await User.findAll({
    where: { approvalStatus: 'PENDING_APPROVAL', emailVerifikovan: true },
    order: [['approvalRequestedAt', 'ASC'], ['created_at', 'ASC']],
  });
  return users.map(mapApprovalRequest);
}

async function getUserApprovalRequestById(id) {
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
  if (!user.emailVerifikovan) {
    const err = new Error('Korisnik mora verifikovati email prije odobravanja.');
    err.status = 400;
    throw err;
  }
  if (user.approvalStatus !== 'PENDING_APPROVAL') {
    const err = new Error('Zahtjev više nije na čekanju.');
    err.status = 409;
    throw err;
  }
  return mapApprovalRequest(user);
}

async function approveUserRequest(id, assignedRole, actorId) {
  if (!ALLOWED_ASSIGN_ROLES.includes(assignedRole)) {
    const err = new Error('Invalid role. Allowed: STUDENT, COMPANY, COORDINATOR.');
    err.status = 400;
    throw err;
  }

  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
  if (user.approvalStatus !== 'PENDING_APPROVAL') {
    const err = new Error('Zahtjev više nije na čekanju.');
    err.status = 409;
    throw err;
  }

  if (Number(actorId) === Number(user.id)) {
    const err = new Error('Ne možete odobriti vlastiti račun.');
    err.status = 403;
    throw err;
  }

  user.role = assignedRole;
  user.status = 'ACTIVE';
  user.approvalStatus = 'APPROVED';
  user.approvedBy = actorId;
  user.approvedAt = new Date();
  user.rejectedBy = null;
  user.rejectedAt = null;
  user.rejectionReason = null;
  await user.save();

  await logAudit({
    userID: actorId,
    actionType: ACTION_TYPES.APPLICATION_STATUS_CHANGED,
    details: {
      entityType: 'USER_APPROVAL',
      targetUserID: user.id,
      targetEmail: user.email,
      fromStatus: 'PENDING_APPROVAL',
      toStatus: 'APPROVED',
      assignedRole,
    },
  });

  await sendAccountApprovedEmail(user.email, assignedRole);
  return mapApprovalRequest(user);
}

async function rejectUserRequest(id, rejectionReason, actorId) {
  if (!rejectionReason || !rejectionReason.trim()) {
    const err = new Error('Razlog odbijanja je obavezan.');
    err.status = 400;
    throw err;
  }

  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  if (Number(actorId) === Number(user.id)) {
    const err = new Error('Ne možete odbiti vlastiti račun.');
    err.status = 403;
    throw err;
  }

  user.status = 'DEACTIVATED';
  user.approvalStatus = 'REJECTED';
  user.rejectedBy = actorId;
  user.rejectedAt = new Date();
  user.rejectionReason = rejectionReason.trim();
  user.approvedBy = null;
  user.approvedAt = null;
  await user.save();

  await logAudit({
    userID: actorId,
    actionType: ACTION_TYPES.APPLICATION_STATUS_CHANGED,
    details: {
      entityType: 'USER_APPROVAL',
      targetUserID: user.id,
      targetEmail: user.email,
      fromStatus: 'PENDING_APPROVAL',
      toStatus: 'REJECTED',
      rejectionReason: user.rejectionReason,
    },
  });

  await sendAccountRejectedEmail(user.email, user.rejectionReason);
  return mapApprovalRequest(user);
}

async function getStudentApprovalRequestsForKoordinator(koordinatorUserId) {
  const koordinator = await resolveCoordinatorProfile(koordinatorUserId);
  if (!koordinator) {
    const err = new Error('Koordinatorski profil nije pronađen.');
    err.status = 404;
    throw err;
  }

  // Dohvati studente sa istog fakulteta koji čekaju odobrenje i verifikovali su email
  const studenti = await Student.findAll({
    where: { fakultetID: koordinator.fakultetID },
    include: [{
      model: User,
      where: { approvalStatus: 'PENDING_APPROVAL', emailVerifikovan: true, role: 'STUDENT' },
      attributes: ['id', 'ime', 'prezime', 'email', 'role', 'status', 'approvalStatus', 'approvalRequestedAt', 'approvedBy', 'approvedAt', 'rejectedBy', 'rejectedAt', 'rejectionReason', 'created_at'],
    }],
  });

  return studenti.map(s => mapApprovalRequest(s.User));
}

module.exports = {
  getUserApprovalRequests,
  getUserApprovalRequestById,
  approveUserRequest,
  rejectUserRequest,
  getStudentApprovalRequestsForKoordinator
};
