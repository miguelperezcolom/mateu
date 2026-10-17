import { test, expect } from '@playwright/test';

/**
 * A definition-only route whose definition is a bare `type: Form` (no `layout:` envelope) holding
 * only a Text renders THAT definition — not the mount's root page. Fixture: mvc-app1
 * `specs/ui/bare-form-routes.yaml` (one and two segments under sample1's `@UI("")` SimpleForm, and
 * an untitled one carrying `$schema:`).
 */

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'mvc-app1', 'the bare-form fixtures live in mvc-app1');
});

for (const route of ['/bare-form-note', '/bare/form-note']) {
  test(`${route} renders the bare Form definition`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByText('Only a text in this form')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'A bare form' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Simple Form' })).toHaveCount(0);
  });
}

test('an untitled bare Form with a $schema key renders too', async ({ page }) => {
  await page.goto('/bare/untitled');
  await expect(page.getByText('An untitled bare form')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Simple Form' })).toHaveCount(0);
});
