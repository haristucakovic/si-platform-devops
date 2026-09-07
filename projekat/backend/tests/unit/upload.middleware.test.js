'use strict';

const express = require('express');
const request = require('supertest');
const { uploadDocuments } = require('../../src/middleware/upload.middleware');

function buildTestApp() {
  const app = express();
  app.post('/upload', uploadDocuments.array('files', 10), (req, res) => {
    res.json({ ok: true, count: req.files?.length ?? 0 });
  });
  app.use((err, _req, res, _next) => {
    res.status(400).json({ message: err.message });
  });
  return app;
}

const testApp = buildTestApp();

describe('uploadDocuments middleware', () => {
  test('eksportira multer instancu sa array metodom', () => {
    expect(uploadDocuments).toBeDefined();
    expect(typeof uploadDocuments.array).toBe('function');
  });

  test('dozvoljava upload PDF fajla', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 test');
    const res = await request(testApp)
      .post('/upload')
      .attach('files', pdfBuffer, { filename: 'test.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  test('odbija upload image fajla (nije PDF/DOC/DOCX)', async () => {
    const imgBuffer = Buffer.from('fake image data');
    const res = await request(testApp)
      .post('/upload')
      .attach('files', imgBuffer, { filename: 'photo.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/PDF|DOC|DOCX/i);
  });

  test('odbija upload text fajla', async () => {
    const txtBuffer = Buffer.from('plain text');
    const res = await request(testApp)
      .post('/upload')
      .attach('files', txtBuffer, { filename: 'file.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
  });

  test('dozvoljava upload DOCX fajla', async () => {
    const docxBuffer = Buffer.from('PK fake docx content');
    const res = await request(testApp)
      .post('/upload')
      .attach('files', docxBuffer, {
        filename: 'document.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

    expect(res.status).toBe(200);
  });

  test('odbija fajl veći od 150KB', async () => {
    const bigBuffer = Buffer.alloc(160 * 1024, 'x');
    const res = await request(testApp)
      .post('/upload')
      .attach('files', bigBuffer, { filename: 'big.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(400);
  });
});
