import { test, expect } from '@playwright/test';

/**
 * Renderer-agnostic forms walkthrough (design/walkthrough/forms.md): semantic assertions only —
 * accessible names, roles and visible text — so the same spec runs on Vaadin and on VB/Redwood.
 */

test.describe('renderer-agnostic forms', () => {
  test('every basic type is drawn and the form action round-trips the values', async ({ page }) => {
    await page.goto('/walk-fields');
    // a LocalTime was not drawn at all on Redwood, an Amount was blank
    await expect(page.getByText('Time', { exact: true }).first()).toBeVisible({ timeout: 15000 });
    // a form with a grid field lost its action row on Redwood (the rich blocks replaced the form)
    const echo = page.getByRole('button', { name: 'Echo' });
    await expect(echo).toBeVisible();
    await echo.click();
    await expect(page.getByText(/echo: text=hello/).first()).toBeVisible();
    await expect(page.getByText(/time=10:30 when=2026-01-15T10:30/).first()).toBeVisible();
    await expect(page.getByText(/total=EUR\/25\.5/).first()).toBeVisible();
  });

  test('a form with an editable grid keeps its action button', async ({ page }) => {
    await page.goto('/inline-grid-form');
    await expect(page.getByRole('button', { name: 'Recalc' })).toBeVisible({ timeout: 15000 });
  });

  test('a required field refuses the action', async ({ page }) => {
    await page.goto('/validation');
    const validate = page.getByRole('button', { name: 'Validate' });
    await expect(validate).toBeVisible({ timeout: 15000 });
    await validate.click();
    await expect(page.getByText(/Cannot be empty|Required/i).first()).toBeVisible();
    await expect(page.getByText('Valid!')).toHaveCount(0);
  });

  test('a wizard walks its steps and its result reads every one of them', async ({ page }) => {
    await page.goto('/walk-wizard');
    // VB/Redwood opens a guided process on an intro page
    const start = page.getByRole('button', { name: 'Start' });
    // the forward button: Next (Vaadin) or the guided process's Continue (Redwood) — only one of
    // them (a Draftable's row used to show Next next to Continue, which saved the draft)
    const forward = page.getByRole('button', { name: /^(Next|Continue)$/ });
    await expect(start.or(forward).first()).toBeVisible({ timeout: 15000 });
    if (await start.isVisible()) await start.click();
    await expect(forward).toHaveCount(1, { timeout: 15000 });
    await page.getByRole('textbox', { name: 'Name' }).first().fill('Ana');
    await forward.click();
    await expect(page.getByRole('textbox', { name: 'Nights' }).or(page.getByRole('spinbutton', { name: 'Nights' })).first()).toBeVisible();
    await forward.click();
    await page.getByRole('textbox', { name: 'Notes' }).first().fill('late');
    await expect(page.getByRole('button', { name: 'Check in' })).toHaveCount(1);
    await page.getByRole('button', { name: 'Check in' }).click();
    await expect(page.getByText('Checked in Ana, 1 nights, notes: late').first()).toBeVisible();
  });

  test('a sectioned form with tabs in one section shows every section, the open tab and its buttons', async ({ page }) => {
    // on Redwood a card + a tab bar anywhere was taken for an item overview: only the first
    // section and the tab bar were drawn
    await page.goto('/walk-layout');
    await expect(page.getByText('X1234567').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('3 previous stays').or(page.getByRole('textbox', { name: 'History' })).first()).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Diet' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('button', { name: 'Echo' })).toBeVisible();
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('add address').first()).toBeVisible();
  });

  test('a long sectioned page with @Toc shows a sections index that jumps to a section and follows Ctrl+Alt+N', async ({ page }) => {
    // Redwood had no index at all (walkthrough forms ❌); Vaadin's lives in mateu-page (`aside.page-toc`)
    await page.goto('/walk-layout');
    await expect(page.getByText('X1234567').first()).toBeVisible({ timeout: 15000 });
    const index = page.getByRole('complementary', { name: /^(Sections|Secciones)$/ });
    await expect(index).toBeVisible();
    for (const title of ['Guests', 'Document', 'Contact', 'Address', 'Preferences', 'Notes', 'History']) {
      await expect(index.getByText(title, { exact: true })).toBeVisible();
    }
    await index.getByText('Notes', { exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Notes' }).first()).toBeInViewport();
    await page.keyboard.press('Control+Alt+7');
    await expect(page.getByRole('heading', { name: 'History' }).first()).toBeInViewport();
    // a short form (one section) carries no index
    await page.goto('/overlay-lab');
    await expect(page.getByRole('heading', { name: 'Overlay lab' }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('complementary', { name: /^(Sections|Secciones)$/ })).toHaveCount(0);
  });

  test('autosave, action shortcuts and identity-gated fields', async ({ page }) => {
    await page.goto('/walk-behaviour');
    const name = page.getByRole('textbox', { name: 'Name', exact: true }).first();
    await expect(name).toBeVisible({ timeout: 15000 });
    // the hidden field never reaches the browser; the disabled one cannot be edited
    await expect(page.getByText('only admins')).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Disabled for guests' })).toBeDisabled();
    // a field of the generic form autosaves (on Redwood it never did)
    await name.fill('Bea');
    await name.press('Tab');
    await expect(page.getByText('auto-saved Bea amount=343.0').first()).toBeVisible();
    await page.getByRole('heading', { name: 'Behaviour walk' }).first().click();
    await page.keyboard.press('Control+Alt+g');
    await expect(page.getByText('geocoded Gran Via 1').first()).toBeVisible();
  });

  test('a YAML form with no view model renders its definition', async ({ page }) => {
    await page.goto('/walk-yaml');
    await expect(page.getByText('YAML booking').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Nights', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Look up' })).toBeVisible();
  });
});
