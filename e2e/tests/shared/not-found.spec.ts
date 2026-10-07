import { test, expect } from '@playwright/test';

// A route whose record does not exist — a stay deleted since the link was shared. The view throws
// NoSuchElementException with a user-facing message while loading; before, the server logged it as
// an ERROR and answered an error toast over an empty page. Now it answers a NotFound component,
// rendered in place of the content: an icon, the message as the heading, a short line and the way
// back to the parent route.
test.describe('Not found (/hotel/stays/:id)', () => {

  test('a missing record shows the not-found page with the message as its heading', async ({ page }) => {
    await page.goto('/hotel/stays/FO-X6JB7F');

    await expect(page.getByRole('heading', { name: 'Stay FO-X6JB7F not found' })).toBeVisible();
    await expect(page.locator('.mateu-not-found-message')).toBeVisible();
    await expect(page.locator('.mateu-not-found-icon')).toBeVisible();
  });

  test('the way back leads to the listing', async ({ page }) => {
    await page.goto('/hotel/stays/FO-X6JB7F');

    await page.locator('a.mateu-not-found-back').click();

    await expect(page).toHaveURL(/\/hotel\/stays$/);
    await expect(page.getByText('Ana Pérez')).toBeVisible();
  });

  test('a record that exists still opens', async ({ page }) => {
    await page.goto('/hotel/stays/FO-1');

    await expect(page.getByText('Ana Pérez').first()).toBeVisible();
    await expect(page.locator('.mateu-not-found')).toHaveCount(0);
  });
});
