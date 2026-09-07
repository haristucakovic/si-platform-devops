import { test, expect } from '@playwright/test';

test.describe('Smoke – javne stranice', () => {
  test('landing stranica se učitava bez greške', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('img', { name: 'PraksaHub' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Prijavi se' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Registruj se' }).first()).toBeVisible();
  });

  test('login stranica prikazuje osnovne elemente forme', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Prijava', level: 2 })).toBeVisible();
    await expect(page.getByLabel('Korisničko ime ili e-mail')).toBeVisible();
    await expect(page.getByLabel('Lozinka')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Prijavite se' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Zaboravili ste lozinku?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nazad na početnu stranicu' })).toBeVisible();
  });

  test('/auth ruta prikazuje istu login stranicu', async ({ page }) => {
    await page.goto('/auth');

    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByRole('heading', { name: 'Prijava', level: 2 })).toBeVisible();
  });

  test('navigacija sa landing stranice na login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Prijavi se' }).click();

    await expect(page).toHaveURL(/\/auth$/);
    await expect(page.getByRole('heading', { name: 'Prijava', level: 2 })).toBeVisible();
  });

  test('navigacija sa login stranice na početnu', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Nazad na početnu stranicu' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('img', { name: 'PraksaHub' }).first()).toBeVisible();
  });

  test('registracija se učitava i prikazuje izbor uloge', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: 'Registruj se kao...' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'PraksaHub' })).toBeVisible();
  });

  test('navigacija sa landing stranice na registraciju', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Registruj se' }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: 'Registruj se kao...' })).toBeVisible();
  });
});

test.describe('Smoke – validacija prijave', () => {
  test('prikazuje grešku kada su polja prazna', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Korisničko ime ili e-mail adresa su obavezni.',
        }),
      });
    });

    await page.goto('/login');
    await page.getByRole('button', { name: 'Prijavite se' }).click();

    await expect(page.getByRole('alert')).toContainText(
      'Korisničko ime ili e-mail adresa su obavezni.',
    );
  });

  test('prikazuje grešku za neispravne podatke', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Pogrešno korisničko ime/e-mail ili lozinka.',
        }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Korisničko ime ili e-mail').fill('ne-postoji@example.com');
    await page.getByLabel('Lozinka').fill('pogresna-lozinka');
    await page.getByRole('button', { name: 'Prijavite se' }).click();

    await expect(page.getByRole('alert')).toContainText(
      'Pogrešno korisničko ime/e-mail ili lozinka.',
    );
  });
});
