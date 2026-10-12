import { test, expect, Page } from '@playwright/test';

// The layout walkthrough (design/walkthrough/forms.md): the section-level layout features used, not
// just rendered — keyboard tab shortcuts, the default-open tab, the sections index (click and
// Ctrl+Alt+N), a pinned section that stays on screen, section affordances, values typed in a tab
// that is no longer shown, labels aside, a folded "More options" panel, and editable grid fields.

const toast = (page: Page, text: string | RegExp) =>
  page.locator('vaadin-notification-card').filter({ hasText: text }).last();

const selectedTab = (page: Page) => page.locator('vaadin-tab[selected]');

test.describe('LayoutWalkForm (/walk-layout)', () => {

  test('the tab marked open is selected first, and Alt+N selects by keyboard', async ({ page }) => {
    await page.goto('/walk-layout');
    await expect(selectedTab(page)).toHaveText('Diet');
    await page.getByRole('heading', { name: 'Layout walk' }).click();
    await page.keyboard.press('Alt+3');
    await expect(selectedTab(page)).toHaveText('Extras');
    await page.keyboard.press('Alt+1');
    await expect(selectedTab(page)).toHaveText('Room');
  });

  test('a value typed in a tab survives switching away from it', async ({ page }) => {
    await page.goto('/walk-layout');
    await page.locator('mateu-field#diet input').fill('Vegan');
    await page.getByRole('heading', { name: 'Layout walk' }).click();
    await page.keyboard.press('Alt+1');
    await expect(selectedTab(page)).toHaveText('Room');
    await page.getByRole('button', { name: 'Echo' }).click();
    await expect(toast(page, 'echo:')).toContainText('diet=Vegan extras=Late checkout zip=28013');
  });

  test('the sections index jumps by click and by Ctrl+Alt+N; the pinned section stays on screen', async ({ page }) => {
    await page.goto('/walk-layout');
    const index = page.locator('.page-toc__item');
    await expect(index.filter({ hasText: 'History' })).toBeVisible();
    await index.filter({ hasText: 'History' }).click();
    await expect(page.locator('.page-toc__item.is-active')).toContainText('History');
    // the Guests section is sticky: scrolled to the bottom, its heading is still in the viewport
    const guests = await page.getByRole('heading', { name: 'Guests' }).boundingBox();
    expect(guests).not.toBeNull();
    expect(guests!.y).toBeGreaterThanOrEqual(0);
    expect(guests!.y).toBeLessThan(page.viewportSize()!.height);
    await page.keyboard.press('Control+Alt+2');
    await expect(page.locator('.page-toc__item.is-active')).toContainText('Document');
  });

  test('a property-list section shows values as text, and section affordances run their actions', async ({ page }) => {
    await page.goto('/walk-layout');
    await expect(page.getByText('X1234567')).toBeVisible();
    await expect(page.locator('mateu-field#docNumber input')).toHaveCount(0);
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(toast(page, 'add address')).toBeVisible();
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(toast(page, 'edit address')).toBeVisible();
    await page.getByRole('button', { name: 'View more' }).click();
    await expect(toast(page, 'more address')).toBeVisible();
  });
});

test.describe('labels aside and folded optionals', () => {

  test('a dense single-column form puts its labels beside the inputs', async ({ page }) => {
    await page.goto('/walk-labels-aside');
    const layout = page.locator('vaadin-form-layout').first();
    await expect(layout).toHaveAttribute('labels-aside', '');
    const label = await page.getByText('Employees', { exact: true }).boundingBox();
    const input = await page.locator('mateu-field#employees input').boundingBox();
    expect(label && input && Math.abs(label.y - input.y) < 30).toBeTruthy();
    expect(label!.x).toBeLessThan(input!.x);
  });

  test('@AutoLayout folds the optional fields into a closed "More options" panel', async ({ page }) => {
    // vaadin-accordion opened its first panel by default, so the folded fields showed expanded
    await page.goto('/auto-layout');
    const panel = page.locator('vaadin-accordion-panel').filter({ hasText: 'More options' });
    await expect(panel).toBeVisible();
    await expect(panel).not.toHaveAttribute('opened', '');
    await expect(page.locator('mateu-field#deliveryNotes textarea')).toBeHidden();
    await panel.locator('vaadin-accordion-heading').click();
    await expect(page.locator('mateu-field#deliveryNotes textarea')).toBeVisible();
  });
});

test.describe('InlineGridForm (/inline-grid-form) — editable grid fields in the browser', () => {

  test('a detail-form grid adds rows through its editor, "save and add another" included', async ({ page }) => {
    await page.goto('/inline-grid-form');
    await page.locator('mateu-field#extras vaadin-button').first().click();
    await page.getByLabel('Concept').fill('Breakfast');
    await page.getByLabel('Qty').fill('2');
    await page.getByRole('button', { name: 'Save and add another' }).click();
    await page.getByLabel('Concept').fill('Parking');
    await page.getByLabel('Qty').fill('1');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    const rows = () => page.locator('mateu-field#extras vaadin-grid').evaluate(
      (g: any) => (g.items || []).map((i: any) => `${i.concept}:${i.qty}`));
    await expect.poll(rows).toEqual(['Breakfast:2', 'Parking:1']);
  });

  test('an inline-editing grid appends a row in place and the form action reads it back', async ({ page }) => {
    await page.goto('/inline-grid-form');
    await page.locator('mateu-field#lines vaadin-button').first().click();
    const rows = () => page.locator('mateu-field#lines vaadin-grid').evaluate((g: any) => (g.items || []).length);
    await expect.poll(rows).toBe(1);
    await page.getByRole('button', { name: 'Recalc' }).click();
    await expect(toast(page, '1 lines')).toBeVisible();
  });
});
