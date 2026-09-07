'use strict';

const adminService = require('../services/admin.service');

async function getUsers(req, res) {
  try {
    const { status } = req.query;
    const users = await adminService.getUsers(status);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ message: 'Valid user id is required.' });
    }

    if (!role) {
      return res.status(400).json({ message: 'Field "role" is required.' });
    }

    const user = await adminService.updateUserRole(numericId, role.toUpperCase());
    res.json({ message: `Role updated to ${user.role}.`, user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ message: 'Valid user id is required.' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Field "status" is required.' });
    }

    const user = await adminService.updateUserStatus(numericId, status.toUpperCase(), req.user.id);
    res.json({ message: `Status updated to ${user.status}.`, user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function getFaculties(req, res) {
  try {
    const faculties = await adminService.getFaculties();
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createFaculty(req, res) {
  try {
    const faculty = await adminService.createFaculty(req.body);
    res.status(201).json(faculty);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function updateFaculty(req, res) {
  try {
    const { id } = req.params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ message: 'Valid faculty id is required.' });
    }
    const faculty = await adminService.updateFaculty(numericId, req.body);
    res.json(faculty);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function deleteFaculty(req, res) {
  try {
    const { id } = req.params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ message: 'Valid faculty id is required.' });
    }
    await adminService.deleteFaculty(numericId);
    res.json({ message: 'Faculty deleted successfully.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function getOdsjeci(req, res) {
  try {
    const numericId = Number(req.params.id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ message: 'Valid faculty id is required.' });
    }
    const odsjeci = await adminService.getOdsjeci(numericId);
    res.json(odsjeci);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function createOdsjek(req, res) {
  try {
    const numericId = Number(req.params.id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ message: 'Valid faculty id is required.' });
    }
    const odsjek = await adminService.createOdsjek(numericId, req.body.naziv);
    res.status(201).json(odsjek);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function deleteOdsjek(req, res) {
  try {
    const numericId = Number(req.params.id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ message: 'Valid odsjek id is required.' });
    }
    await adminService.deleteOdsjek(numericId);
    res.json({ message: 'Odsjek deleted successfully.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    const numericId = Number(req.params.id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ message: 'Valid user id is required.' });
    }
    await adminService.deleteUser(numericId, req.user.id);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function getAuditLogs(req, res) {
  try {
    const logs = await adminService.getAuditLogs({
      actionType: req.query.actionType,
      limit: req.query.limit,
    });
    res.json(logs);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = { getUsers, updateUserRole, updateUserStatus, deleteUser, getFaculties, createFaculty, updateFaculty, deleteFaculty, getOdsjeci, createOdsjek, deleteOdsjek, getAuditLogs };
