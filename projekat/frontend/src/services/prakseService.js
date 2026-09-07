import { apiRequest } from './api';

function withFilter(path, filter) {
  return `${path}?filter=${encodeURIComponent(filter || 'all')}`;
}

export async function getMyPractices(filter = 'all') {
  return apiRequest(withFilter('/prakse/mine', filter));
}

export async function getCompanyPractices(filter = 'all') {
  return apiRequest(withFilter('/prakse/company', filter));
}

export async function getCoordinatorPractices(filter = 'all') {
  return apiRequest(withFilter('/prakse/coordinator', filter));
}

export async function generatePracticeContract(practiceId) {
  return apiRequest(`/prakse/${encodeURIComponent(practiceId)}/ugovor`, {
    method: 'POST',
  });
}

function wrapPdfLine(context, line, maxWidth) {
  if (!line) return [''];
  const words = line.split(/\s+/);
  const wrapped = [];
  let current = words.shift() || '';

  words.forEach((word) => {
    const candidate = `${current} ${word}`;
    if (context.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      wrapped.push(current);
      current = word;
    }
  });
  wrapped.push(current);
  return wrapped;
}

function renderContractPages(content) {
  const width = 1240;
  const height = 1754;
  const margin = 104;
  const lineHeight = 34;
  const pages = [];
  let canvas;
  let context;
  let y;

  function beginPage() {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#0d1f3c';
    context.font = '24px Arial, sans-serif';
    y = margin;
  }

  function finishPage() {
    const binary = atob(canvas.toDataURL('image/jpeg', 0.95).split(',')[1]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    pages.push({ bytes, width, height });
  }

  beginPage();
  content.split('\n').forEach((line, lineIndex) => {
    if (lineIndex === 0) {
      context.font = 'bold 33px Arial, sans-serif';
      context.textAlign = 'center';
      context.fillText(line, width / 2, y);
      context.textAlign = 'left';
      context.font = '24px Arial, sans-serif';
      y += 68;
      return;
    }

    const lines = wrapPdfLine(context, line, width - (margin * 2));
    lines.forEach((wrappedLine) => {
      if (y + lineHeight > height - margin) {
        finishPage();
        beginPage();
      }
      context.fillText(wrappedLine, margin, y);
      y += lineHeight;
    });
  });
  finishPage();
  return pages;
}

function createPdfBlob(pages) {
  const chunks = [];
  const offsets = [0];
  let length = 0;
  const encoder = new TextEncoder();
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  function append(chunk) {
    const bytes = typeof chunk === 'string' ? encoder.encode(chunk) : chunk;
    chunks.push(bytes);
    length += bytes.length;
  }

  function objectStart(id) {
    offsets[id] = length;
    append(`${id} 0 obj\n`);
  }

  append('%PDF-1.4\n');
  objectStart(1);
  append('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  const pageObjects = pages.map((_page, index) => 3 + (index * 3));
  objectStart(2);
  append(`<< /Type /Pages /Count ${pages.length} /Kids [${pageObjects.map((id) => `${id} 0 R`).join(' ')}] >>\nendobj\n`);

  pages.forEach((page, index) => {
    const pageId = pageObjects[index];
    const imageId = pageId + 1;
    const contentId = pageId + 2;
    const stream = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Img Do\nQ`;

    objectStart(pageId);
    append(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Img ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`);

    objectStart(imageId);
    append(`<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.bytes.length} >>\nstream\n`);
    append(page.bytes);
    append('\nendstream\nendobj\n');

    objectStart(contentId);
    append(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
  });

  const xrefStart = length;
  append(`xref\n0 ${offsets.length}\n`);
  append('0000000000 65535 f \n');
  for (let id = 1; id < offsets.length; id += 1) {
    append(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
  }
  append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);
  return new Blob(chunks, { type: 'application/pdf' });
}

export function downloadPracticeContract(contract) {
  const content = contract?.sadrzaj || '';
  const number = contract?.ugovor?.broj || 'ugovor-o-praksi';
  const fileName = `${String(number).toLowerCase().replace(/[^a-z0-9-]/g, '-')}.pdf`;
  const url = URL.createObjectURL(createPdfBlob(renderContractPages(content)));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

// NOVO — koristi apiRequest kao ostatak fajla:
export async function getPracticeActivities(praksaId) {
  return apiRequest(`/prakse/${encodeURIComponent(praksaId)}/aktivnosti`);
}

// NOVO:
export async function createPracticeActivity(praksaId, opis) {
  return apiRequest(`/prakse/${encodeURIComponent(praksaId)}/aktivnosti`, {
    method: 'POST',
    body: JSON.stringify({ opis }),
  });
}

export async function getPracticeAttendance(praksaId) {
  return apiRequest(`/prakse/${encodeURIComponent(praksaId)}/prisustva`);
}

export async function savePracticeAttendance(praksaId, data) {
  return apiRequest(`/prakse/${encodeURIComponent(praksaId)}/prisustva`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPracticeReport(praksaId) {
  return apiRequest(`/prakse/${encodeURIComponent(praksaId)}/izvjestaj`);
}

export async function generatePracticeReport(praksaId, data) {
  return apiRequest(`/prakse/${encodeURIComponent(praksaId)}/izvjestaj`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

