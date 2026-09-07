'use strict';

const {
  canSendInApp,
  canSendEmail,
} = require('../../src/business/services/notificationPreferences.service');

// ── Fixtures za preference ────────────────────────────────────────────────────
function makePrefs(overrides = {}) {
  return {
    prijava_podnesena_in_app: true,
    prijava_podnesena_email: true,
    prijava_odobrena_in_app: true,
    prijava_odobrena_email: true,
    prijava_odbijena_in_app: true,
    prijava_odbijena_email: true,
    ...overrides,
  };
}

// ── canSendInApp ──────────────────────────────────────────────────────────────
describe('canSendInApp', () => {
  // Testira: null preference → uvijek true (default dozvola)
  test('null preferences → true za sve tipove', () => {
    expect(canSendInApp(null, 'PRIJAVA_PODNESENA')).toBe(true);
    expect(canSendInApp(null, 'PRIJAVA_ODOBRENA')).toBe(true);
    expect(canSendInApp(null, 'PRIJAVA_ODBIJENA')).toBe(true);
    expect(canSendInApp(null, 'NEPOZNAT_TIP')).toBe(true);
  });

  // Testira: isključena notifikacija o podneseni prijavi → false
  test('prijava_podnesena_in_app=false → false za PRIJAVA_PODNESENA', () => {
    const prefs = makePrefs({ prijava_podnesena_in_app: false });
    expect(canSendInApp(prefs, 'PRIJAVA_PODNESENA')).toBe(false);
  });

  // Testira: uključena notifikacija o podneseni prijavi → true
  test('prijava_podnesena_in_app=true → true za PRIJAVA_PODNESENA', () => {
    const prefs = makePrefs({ prijava_podnesena_in_app: true });
    expect(canSendInApp(prefs, 'PRIJAVA_PODNESENA')).toBe(true);
  });

  // Testira: PRIJAVA_PROSLIJEDJENA_KOMPANIJI, PRIJAVA_UZI_KRUG, PRIJAVA_KOMPANIJA_ODOBRENA
  //          mapiraju na prijava_odobrena_in_app
  test.each([
    'PRIJAVA_ODOBRENA',
    'PRIJAVA_PROSLIJEDJENA_KOMPANIJI',
    'PRIJAVA_UZI_KRUG',
    'PRIJAVA_KOMPANIJA_ODOBRENA',
  ])('%s mapira na prijava_odobrena_in_app', (tip) => {
    const prefsOn = makePrefs({ prijava_odobrena_in_app: true });
    const prefsOff = makePrefs({ prijava_odobrena_in_app: false });
    expect(canSendInApp(prefsOn, tip)).toBe(true);
    expect(canSendInApp(prefsOff, tip)).toBe(false);
  });

  // Testira: PRIJAVA_ODBIJENA i PRIJAVA_KOMPANIJA_ODBIJENA mapiraju na prijava_odbijena_in_app
  test.each([
    'PRIJAVA_ODBIJENA',
    'PRIJAVA_KOMPANIJA_ODBIJENA',
  ])('%s mapira na prijava_odbijena_in_app', (tip) => {
    const prefsOn = makePrefs({ prijava_odbijena_in_app: true });
    const prefsOff = makePrefs({ prijava_odbijena_in_app: false });
    expect(canSendInApp(prefsOn, tip)).toBe(true);
    expect(canSendInApp(prefsOff, tip)).toBe(false);
  });

  // Testira: nepoznati tip → uvijek true (fallback)
  test('nepoznati tip → true (fallback)', () => {
    const prefs = makePrefs({
      prijava_podnesena_in_app: false,
      prijava_odobrena_in_app: false,
      prijava_odbijena_in_app: false,
    });
    expect(canSendInApp(prefs, 'NEPOZNAT_TIP')).toBe(true);
  });
});

// ── canSendEmail ──────────────────────────────────────────────────────────────
describe('canSendEmail', () => {
  // Testira: null preference → uvijek true
  test('null preferences → true za sve tipove', () => {
    expect(canSendEmail(null, 'PRIJAVA_PODNESENA')).toBe(true);
    expect(canSendEmail(null, 'PRIJAVA_ODOBRENA')).toBe(true);
    expect(canSendEmail(null, 'PRIJAVA_ODBIJENA')).toBe(true);
  });

  // Testira: isključena email notifikacija o podneseni prijavi → false
  test('prijava_podnesena_email=false → false za PRIJAVA_PODNESENA', () => {
    const prefs = makePrefs({ prijava_podnesena_email: false });
    expect(canSendEmail(prefs, 'PRIJAVA_PODNESENA')).toBe(false);
  });

  // Testira: odobreni tipovi mapiraju na prijava_odobrena_email
  test.each([
    'PRIJAVA_ODOBRENA',
    'PRIJAVA_PROSLIJEDJENA_KOMPANIJI',
    'PRIJAVA_UZI_KRUG',
    'PRIJAVA_KOMPANIJA_ODOBRENA',
  ])('%s mapira na prijava_odobrena_email', (tip) => {
    const prefsOn = makePrefs({ prijava_odobrena_email: true });
    const prefsOff = makePrefs({ prijava_odobrena_email: false });
    expect(canSendEmail(prefsOn, tip)).toBe(true);
    expect(canSendEmail(prefsOff, tip)).toBe(false);
  });

  // Testira: odbijeni tipovi mapiraju na prijava_odbijena_email
  test.each([
    'PRIJAVA_ODBIJENA',
    'PRIJAVA_KOMPANIJA_ODBIJENA',
  ])('%s mapira na prijava_odbijena_email', (tip) => {
    const prefsOn = makePrefs({ prijava_odbijena_email: true });
    const prefsOff = makePrefs({ prijava_odbijena_email: false });
    expect(canSendEmail(prefsOn, tip)).toBe(true);
    expect(canSendEmail(prefsOff, tip)).toBe(false);
  });

  // Testira: nepoznati tip → uvijek true (fallback)
  test('nepoznati tip → true (fallback)', () => {
    const prefs = makePrefs({
      prijava_podnesena_email: false,
      prijava_odobrena_email: false,
      prijava_odbijena_email: false,
    });
    expect(canSendEmail(prefs, 'NEPOZNAT_TIP')).toBe(true);
  });
});
