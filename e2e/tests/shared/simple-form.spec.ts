import { test, expect } from '@playwright/test';

test.describe('SimpleForm (root UI)', () => {

  test('loads the root page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Simple Form/);
  });

  test('root page renders mateu-ui with empty baseUrl', async ({ page }) => {
    await page.goto('/');
    const mateuUi = page.locator('mateu-ui');
    await expect(mateuUi).toBeAttached();
    await expect(mateuUi).toHaveAttribute('baseUrl', '');
  });

});

test.describe('MenuApp (/app UI)', () => {

  test('loads /app page', async ({ page }) => {
    await page.goto('/app');
    await expect(page).toHaveTitle(/Menu App/);
  });

  test('/app page renders mateu-ui with /app baseUrl', async ({ page }) => {
    await page.goto('/app');
    const mateuUi = page.locator('mateu-ui');
    await expect(mateuUi).toBeAttached();
    await expect(mateuUi).toHaveAttribute('baseUrl', '/app');
  });

  test('SPA sub-route /app/section1 serves /app page', async ({ page }) => {
    await page.goto('/app/section1');
    const mateuUi = page.locator('mateu-ui');
    await expect(mateuUi).toBeAttached();
    await expect(mateuUi).toHaveAttribute('baseUrl', '/app');
  });

  test('SPA sub-route /app/section2 serves /app page', async ({ page }) => {
    await page.goto('/app/section2');
    const mateuUi = page.locator('mateu-ui');
    await expect(mateuUi).toBeAttached();
    await expect(mateuUi).toHaveAttribute('baseUrl', '/app');
  });

  test('root page and /app page are independent UIs', async ({ page }) => {
    await page.goto('/');
    const rootUi = page.locator('mateu-ui');
    await expect(rootUi).toHaveAttribute('baseUrl', '');

    await page.goto('/app');
    const appUi = page.locator('mateu-ui');
    await expect(appUi).toHaveAttribute('baseUrl', '/app');
  });

});

test.describe('AllTypesForm (/all-types UI)', () => {

  test('loads /all-types page', async ({ page }) => {
    await page.goto('/all-types');
    await expect(page).toHaveTitle(/All Types Form/);
  });

  test('/all-types page renders mateu-ui with /all-types baseUrl', async ({ page }) => {
    await page.goto('/all-types');
    const mateuUi = page.locator('mateu-ui');
    await expect(mateuUi).toBeAttached();
    await expect(mateuUi).toHaveAttribute('baseUrl', '/all-types');
  });

});

test.describe('ProfileForm (/profile UI)', () => {

  test('loads /profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveTitle(/Profile/);
  });

  test('/profile page renders mateu-ui with /profile baseUrl', async ({ page }) => {
    await page.goto('/profile');
    const mateuUi = page.locator('mateu-ui');
    await expect(mateuUi).toBeAttached();
    await expect(mateuUi).toHaveAttribute('baseUrl', '/profile');
  });

});

test.describe('StatusDemoForm (/status-demo UI)', () => {

  test('loads /status-demo page', async ({ page }) => {
    await page.goto('/status-demo');
    await expect(page).toHaveTitle(/Status Demo/);
  });

  test('/status-demo page renders mateu-ui with /status-demo baseUrl', async ({ page }) => {
    await page.goto('/status-demo');
    const mateuUi = page.locator('mateu-ui');
    await expect(mateuUi).toBeAttached();
    await expect(mateuUi).toHaveAttribute('baseUrl', '/status-demo');
  });

});

test.describe('ItemsCatalog (/items UI)', () => {

  test('loads /items page', async ({ page }) => {
    await page.goto('/items');
    const mateuUi = page.locator('mateu-ui');
    await expect(mateuUi).toBeAttached();
    await expect(mateuUi).toHaveAttribute('baseUrl', '/items');
  });

});
