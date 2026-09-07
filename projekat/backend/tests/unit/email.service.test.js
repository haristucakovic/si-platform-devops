'use strict';

// Mock global fetch before requiring the service
global.fetch = jest.fn();

const {
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
  sendStudentDeactivationToCompany,
  sendStudentDeactivationToKoordinator,
  sendPrijavaPodnesenaEmail,
  sendPrijavaShortlistedEmail,
  sendPrijavaStatusEmail,
  sendPraksaZavrsenaStudentEmail,
  sendPraksaZavrsenaCompanyEmail,
  sendEvaluacijaStudentaEmail,
  sendOdustajanjeKompaniji,
  sendOdustajanjeKoordinatoru,
} = require('../../src/business/services/email.service');

function mockFetchOk() {
  global.fetch.mockResolvedValue({ ok: true });
}

function mockFetchError(status = 400, text = 'Bad Request') {
  global.fetch.mockResolvedValue({
    ok: false,
    status,
    text: jest.fn().mockResolvedValue(text),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.BREVO_API_KEY = 'test-api-key';
  process.env.BREVO_SENDER_EMAIL = 'noreply@test.com';
  process.env.BREVO_SENDER_NAME = 'TestHub';
});

// ── sendPasswordResetEmail ────────────────────────────────────────────────────
describe('sendPasswordResetEmail', () => {
  test('šalje email s reset linkom', async () => {
    mockFetchOk();
    await sendPasswordResetEmail('user@test.com', 'https://app.com/reset?token=abc');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('brevo.com'),
      expect.objectContaining({ method: 'POST' })
    );
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.to[0].email).toBe('user@test.com');
    expect(body.subject).toMatch(/lozink/i);
  });

  test('baca grešku kada Brevo API vrati error', async () => {
    mockFetchError(500, 'Internal Server Error');
    await expect(sendPasswordResetEmail('user@test.com', 'link')).rejects.toThrow(/Brevo/);
  });
});

// ── sendEmailVerificationEmail ────────────────────────────────────────────────
describe('sendEmailVerificationEmail', () => {
  test('šalje verifikacijski email', async () => {
    mockFetchOk();
    await sendEmailVerificationEmail('user@test.com', 'https://app.com/verify?token=xyz');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.to[0].email).toBe('user@test.com');
    expect(body.subject).toMatch(/verifikaci/i);
  });

  test('baca grešku kada API vrati error', async () => {
    mockFetchError();
    await expect(sendEmailVerificationEmail('u@t.com', 'l')).rejects.toThrow();
  });
});

// ── sendAccountApprovedEmail ──────────────────────────────────────────────────
describe('sendAccountApprovedEmail', () => {
  test('šalje email o odobrenom nalogu', async () => {
    mockFetchOk();
    await sendAccountApprovedEmail('user@test.com', 'COMPANY');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.subject).toMatch(/odobren/i);
    expect(body.htmlContent).toContain('COMPANY');
  });
});

// ── sendAccountRejectedEmail ──────────────────────────────────────────────────
describe('sendAccountRejectedEmail', () => {
  test('šalje email o odbijenom nalogu s razlogom', async () => {
    mockFetchOk();
    await sendAccountRejectedEmail('user@test.com', 'Nepotpuna dokumentacija');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.subject).toMatch(/odbijen/i);
    expect(body.htmlContent).toContain('Nepotpuna dokumentacija');
  });
});

// ── sendStudentDeactivationToCompany ─────────────────────────────────────────
describe('sendStudentDeactivationToCompany', () => {
  test('šalje email kompaniji o deaktivaciji studenta', async () => {
    mockFetchOk();
    await sendStudentDeactivationToCompany('company@test.com', 'Marko Marković', 'Backend praksa');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.to[0].email).toBe('company@test.com');
    expect(body.htmlContent).toContain('Marko Marković');
    expect(body.htmlContent).toContain('Backend praksa');
  });
});

// ── sendStudentDeactivationToKoordinator ─────────────────────────────────────
describe('sendStudentDeactivationToKoordinator', () => {
  test('šalje email koordinatoru o deaktivaciji studenta', async () => {
    mockFetchOk();
    await sendStudentDeactivationToKoordinator('coord@test.com', 'Ana Anić', 'Frontend praksa');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.to[0].email).toBe('coord@test.com');
    expect(body.htmlContent).toContain('Ana Anić');
    expect(body.htmlContent).toContain('Frontend praksa');
  });
});

// ── sendPrijavaPodnesenaEmail ─────────────────────────────────────────────────
describe('sendPrijavaPodnesenaEmail', () => {
  test('šalje email o podnesenoj prijavi', async () => {
    mockFetchOk();
    await sendPrijavaPodnesenaEmail('student@test.com', 'React Developer', 'TechCo');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.htmlContent).toContain('React Developer');
    expect(body.htmlContent).toContain('TechCo');
  });
});

// ── sendPrijavaShortlistedEmail ───────────────────────────────────────────────
describe('sendPrijavaShortlistedEmail', () => {
  test('šalje email o ulasku u uži krug', async () => {
    mockFetchOk();
    await sendPrijavaShortlistedEmail('student@test.com', 'Node.js praksa', 'FirmaCo');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.htmlContent).toContain('Node.js praksa');
    expect(body.htmlContent).toContain('FirmaCo');
  });

  test('escapuje HTML u nazivima (XSS zaštita)', async () => {
    mockFetchOk();
    await sendPrijavaShortlistedEmail('s@t.com', '<script>xss</script>', '<img src=x>');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.htmlContent).not.toContain('<script>');
    expect(body.htmlContent).toContain('&lt;script&gt;');
  });
});

// ── sendPrijavaStatusEmail ────────────────────────────────────────────────────
describe('sendPrijavaStatusEmail', () => {
  test('šalje email za status CEKA_KOMPANIJU', async () => {
    mockFetchOk();
    await sendPrijavaStatusEmail('s@t.com', 'Oglas', 'Firma', 'CEKA_KOMPANIJU', null);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.htmlContent).toContain('proslijedjena kompaniji');
  });

  test('šalje email za status ODOBRENA', async () => {
    mockFetchOk();
    await sendPrijavaStatusEmail('s@t.com', 'Oglas', 'Firma', 'ODOBRENA', null);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.htmlContent).toContain('odobrena');
  });

  test('šalje email za status ODBIJENA_KOORDINATOR s razlogom', async () => {
    mockFetchOk();
    await sendPrijavaStatusEmail('s@t.com', 'Oglas', 'Firma', 'ODBIJENA_KOORDINATOR', 'Nepotpun profil');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.htmlContent).toContain('odbijena od koordinatora');
    expect(body.htmlContent).toContain('Nepotpun profil');
  });

  test('šalje email za status ODBIJENA_KOMPANIJA', async () => {
    mockFetchOk();
    await sendPrijavaStatusEmail('s@t.com', 'Oglas', 'Firma', 'ODBIJENA_KOMPANIJA', null);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.htmlContent).toContain('odbijena od kompanije');
  });

  test('šalje email za status ODBIJENA (legacy)', async () => {
    mockFetchOk();
    await sendPrijavaStatusEmail('s@t.com', 'Oglas', 'Firma', 'ODBIJENA', null);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.htmlContent).toContain('odbijena od koordinatora');
  });

  test('šalje email za nepoznat status (azurirana)', async () => {
    mockFetchOk();
    await sendPrijavaStatusEmail('s@t.com', 'Oglas', 'Firma', 'NEKI_STATUS', null);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.htmlContent).toContain('azurirana');
  });
});

// ── sendPraksaZavrsenaStudentEmail ────────────────────────────────────────────
describe('sendPraksaZavrsenaStudentEmail', () => {
  test('šalje email studentu o završetku prakse', async () => {
    mockFetchOk();
    await sendPraksaZavrsenaStudentEmail('student@test.com', 'Backend praksa', 'Firma d.o.o.', '25.05.2026.');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.to[0].email).toBe('student@test.com');
    expect(body.subject).toMatch(/završena/i);
    expect(body.htmlContent).toContain('Backend praksa');
    expect(body.htmlContent).toContain('Firma d.o.o.');
    expect(body.htmlContent).toContain('25.05.2026.');
  });
});

// ── sendPraksaZavrsenaCompanyEmail ────────────────────────────────────────────
describe('sendPraksaZavrsenaCompanyEmail', () => {
  test('šalje email kompaniji o završetku prakse', async () => {
    mockFetchOk();
    await sendPraksaZavrsenaCompanyEmail('company@test.com', 'Amina Begić', 'Backend praksa', '25.05.2026.');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.to[0].email).toBe('company@test.com');
    expect(body.subject).toMatch(/završena/i);
    expect(body.htmlContent).toContain('Amina Begić');
    expect(body.htmlContent).toContain('Backend praksa');
  });
});

// ── sendEvaluacijaStudentaEmail ───────────────────────────────────────────────
describe('sendEvaluacijaStudentaEmail', () => {
  test('šalje email studentu o evaluaciji', async () => {
    mockFetchOk();
    await sendEvaluacijaStudentaEmail('student@test.com', 'Haris Husić', 'Backend Developer', 4);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.to[0].email).toBe('student@test.com');
    expect(body.subject).toMatch(/evaluirala|evaluiran/i);
    expect(body.htmlContent).toContain('Haris Husić');
    expect(body.htmlContent).toContain('Backend Developer');
    expect(body.htmlContent).toContain('4');
  });

  test('ne šalje email kada fetch baci grešku', async () => {
    mockFetchError(500, 'Server Error');
    await expect(
      sendEvaluacijaStudentaEmail('student@test.com', 'Haris', 'Praksa', 5)
    ).rejects.toThrow();
  });
});

// ── sendOdustajanjeKompaniji ──────────────────────────────────────────────────
describe('sendOdustajanjeKompaniji', () => {
  test('šalje email kompaniji o odustajanju studenta', async () => {
    mockFetchOk();
    await sendOdustajanjeKompaniji('company@test.com', 'Haris Husić', 'Backend Dev');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.to[0].email).toBe('company@test.com');
    expect(body.subject).toMatch(/odustao/i);
    expect(body.htmlContent).toContain('Haris Husić');
    expect(body.htmlContent).toContain('Backend Dev');
  });

  test('escapeuje HTML specijalne znakove u imenu', async () => {
    mockFetchOk();
    await sendOdustajanjeKompaniji('company@test.com', '<script>alert(1)</script>', 'Test');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.htmlContent).not.toContain('<script>');
    expect(body.htmlContent).toContain('&lt;script&gt;');
  });
});

// ── sendOdustajanjeKoordinatoru ───────────────────────────────────────────────
describe('sendOdustajanjeKoordinatoru', () => {
  test('šalje email koordinatoru o odustajanju studenta', async () => {
    mockFetchOk();
    await sendOdustajanjeKoordinatoru('coordinator@test.com', 'Amina Begić', 'Design Praksa');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.to[0].email).toBe('coordinator@test.com');
    expect(body.subject).toMatch(/odustao/i);
    expect(body.htmlContent).toContain('Amina Begić');
    expect(body.htmlContent).toContain('Design Praksa');
  });
});
