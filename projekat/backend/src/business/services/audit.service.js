'use strict';

const { AuditLog, User } = require('../../infrastructure/database/models');

const ACTION_TYPES = {
  USER_REGISTERED: 'USER_REGISTERED',
  APPLICATION_STATUS_CHANGED: 'APPLICATION_STATUS_CHANGED',
  USER_DELETED: 'USER_DELETED',
  LISTING_UPDATED: 'LISTING_UPDATED',
  INTERNSHIP_WITHDRAWN: 'INTERNSHIP_WITHDRAWN',
};

function mapAuditLog(log) {
  return {
    id: log.id,
    user: {
      id: log.userID,
      name: log.userName,
      email: log.userEmail,
      role: log.userRole,
    },
    actionType: log.actionType,
    details: log.details || {},
    createdAt: log.createdAt,
  };
}

async function resolveUserSnapshot(userID, fallback = {}) {
  if (fallback.userName || fallback.userEmail || fallback.userRole) {
    return fallback;
  }

  if (!userID || !User?.findByPk) {
    return {};
  }

  const user = await User.findByPk(userID, {
    attributes: ['id', 'ime', 'prezime', 'email', 'role'],
  });

  if (!user) {
    return {};
  }

  return {
    userName: `${user.ime || ''} ${user.prezime || ''}`.trim() || user.email,
    userEmail: user.email,
    userRole: user.role,
  };
}

async function logAudit({ userID = null, actionType, details = null, transaction = null, userSnapshot = {} }) {
  if (!AuditLog?.create || !actionType) {
    return null;
  }

  const snapshot = await resolveUserSnapshot(userID, userSnapshot);

  try {
    return await AuditLog.create(
      {
        userID,
        userName: snapshot.userName || null,
        userEmail: snapshot.userEmail || null,
        userRole: snapshot.userRole || null,
        actionType,
        details,
      },
      transaction ? { transaction } : undefined
    );
  } catch {
    return null;
  }
}

async function getAuditLogs({ actionType, limit = 100 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const where = actionType ? { actionType } : {};

  const logs = await AuditLog.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: safeLimit,
  });

  return logs.map(mapAuditLog);
}

module.exports = {
  ACTION_TYPES,
  logAudit,
  getAuditLogs,
};
