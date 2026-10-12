import { test, expect, Page } from '@playwright/test';

// The form-behaviour walkthrough (design/walkthrough/forms.md) on /walk-behaviour: autosave,
// keyboard shortcuts on actions (the page's and an @Inline subform's), the subform's toolbar and
// button, fields gated by identity, a component-holder field and a Double that the browser sends
// back as a whole number. Nobody is signed in on the SUT, so the gated fields are hidden /
// read-only / disabled.

const toast = (page: Page, text: string | RegExp) =>
  page.locator('vaadin-notification-card').filter({ hasText: text }).last();

test.describe('BehaviourWalkForm (/walk-behaviour)', () => {

  test('editing a field autosaves after the debounce, with the new value', async ({ page }) => {
    await page.goto('/walk-behaviour');
    await page.locator('mateu-field#name input').fill('Bea');
    await expect(toast(page, 'auto-saved Bea amount=343.0')).toBeVisible();
  });

  test('keyboard shortcuts run the page action and the subform action', async ({ page }) => {
    await page.goto('/walk-behaviour');
    await page.getByRole('heading', { name: 'Behaviour walk' }).click();
    await page.keyboard.press('Control+Alt+s');
    await expect(toast(page, /^saved Ana/)).toBeVisible();
    await page.keyboard.press('Control+Alt+g');
    await expect(toast(page, 'geocoded Gran Via 1')).toBeVisible();
  });

  test('an @Inline subform runs its toolbar action with the values typed in it', async ({ page }) => {
    await page.goto('/walk-behaviour');
    await page.locator('mateu-field#address-city input').fill('Sevilla');
    await page.getByRole('button', { name: 'Verify' }).click();
    await expect(toast(page, 'verified Sevilla')).toBeVisible();
  });

  test('identity-gated fields: hidden, read-only and disabled for a guest — and the hidden one never reaches the browser', async ({ page }) => {
    await page.goto('/walk-behaviour');
    await expect(page.locator('mateu-field#secretNote')).toHaveCount(0);
    await expect(page.getByText('only admins')).toHaveCount(0);
    await expect(page.locator('mateu-field#lockedForGuests input')).toHaveCount(0);
    await expect(page.getByText('read only for you')).toBeVisible();
    await expect(page.locator('mateu-field#disabledForGuests vaadin-text-field')).toHaveJSProperty('disabled', true);
  });

  test('a save keeps the server-side values the browser never had: the hidden field and the component holder', async ({ page }) => {
    await page.goto('/walk-behaviour');
    await expect(page.getByText('Hello from a component holder')).toBeVisible();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(toast(page, /^saved/)).toContainText('saved Ana amount=343.0 city=Madrid secret=only admins greeting=kept');
  });

  test('a tampered request cannot write a field the user may not see', async ({ request }) => {
    const res = await request.post('/walk-behaviour/mateu/v3/sync/_no_route', {
      data: {
        serverSideType: 'io.mateu.sample1.BehaviourWalkForm',
        route: '',
        actionId: 'save',
        componentState: { name: 'Ana', amount: 343, secretNote: 'forged', lockedForGuests: 'forged' },
      },
    });
    const text = JSON.stringify((await res.json()).messages);
    expect(text).toContain('secret=only admins');
    expect(text).not.toContain('forged');
  });
});
