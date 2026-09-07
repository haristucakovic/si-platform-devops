'use strict';

const multer = require('multer');

const fileFilter = (_req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Dozvoljeni su samo PDF, DOC i DOCX fajlovi.'));
  }

  cb(null, true);
};

const uploadDocuments = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 150 * 1024, // 150 KB
  },
});

module.exports = { uploadDocuments };
