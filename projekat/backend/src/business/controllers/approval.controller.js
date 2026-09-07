'use strict';

const approvalService = require('../services/approval.service');

async function getUserApprovalRequests(req, res) {
  try {
    const data = await approvalService.getUserApprovalRequests();
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function getUserApprovalRequestById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Valid user id is required.' });
    }
    const data = await approvalService.getUserApprovalRequestById(id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function approveUserRequest(req, res) {
  try {
    const id = Number(req.params.id);
    const role = String(req.body.role || '').toUpperCase();
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Valid user id is required.' });
    }
    if (!role) {
      return res.status(400).json({ message: 'Field "role" is required.' });
    }
    const data = await approvalService.approveUserRequest(id, role, req.user.id);
    res.json({ message: 'Korisnički račun je odobren.', user: data });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function rejectUserRequest(req, res) {
  try {
    const id = Number(req.params.id);
    const rejectionReason = req.body.rejectionReason;
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Valid user id is required.' });
    }
    const data = await approvalService.rejectUserRequest(id, rejectionReason, req.user.id);
    res.json({ message: 'Zahtjev je odbijen.', user: data });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = {
  getUserApprovalRequests,
  getUserApprovalRequestById,
  approveUserRequest,
  rejectUserRequest,
};
