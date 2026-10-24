import { test, expect, Page } from '@playwright/test';

/**
 * Renderer-agnostic walk of the display components (sample1 InteractiveDisplay, /arch/interactive
 * and the YAML /display-gallery): semantic output only, so the same file runs on Vaadin and on
 * VB/Redwood. Each handler answers a message echoing what it received — a click the renderer
 * drops, or sends without its parameters, fails here. Found on Redwood: a page holding a TaskQueue
 * showed nothing but the queue; a Notice lost its action; an EmptyState lost its call to action.
 */

const said = (page: Page, text: string) => expect(page.getByText(text).first()).toBeVisible({ timeout: 15000 });

/** On Redwood a Calendar is first DRAWN and then handed to Spectra's oj-sp-calendar, which hides the
 *  drawn grid once it has painted: wait for that swap before clicking (no-op on Vaadin). */
const calendarSettled = async (page: Page) => {
  if (test.info().project.name === 'renderer-vb')
    await page.locator('.mateu-cal.mateu-cal-sp-on').first().waitFor({ timeout: 30000 });
};

test.describe('display components, on any renderer', () => {
  test('every component of a composed page is painted (not just a TaskQueue)', async ({ page }) => {
    await page.goto('/arch/interactive');
    for (const text of ['Write docs', 'Call Ada', 'Created', 'CEO', 'Payment', 'Basic', 'Breakfast',
      'Upgrade', 'Two complaints pending', 'Nothing here', 'Smith']) {
      await expect(page.getByText(text, { exact: true }).first(), text).toBeVisible({ timeout: 20000 });
    }
  });

  test('their actions reach the server with their parameters', async ({ page }) => {
    await page.goto('/arch/interactive');
    await page.getByText('Write docs', { exact: true }).first().click({ timeout: 20000 });
    await said(page, 'openCard');
    await page.getByRole('button', { name: 'Choose' }).first().click();
    await said(page, 'choosePlan');
    await page.getByRole('button', { name: 'Review' }).first().click();
    await said(page, 'reviewComplaints');
    await page.getByRole('button', { name: 'New booking' }).first().click();
    await said(page, 'newBooking');
    await page.getByRole('button', { name: 'Retry' }).first().click();
    await said(page, 'retryPayment {_item=s1}');
    await page.getByRole('button', { name: 'I want to…' }).first().click();
    await page.getByText('Cancel booking').first().click();
    await said(page, 'cancelBooking {reason=test}');
  });

  test('a calendar event click and a map marker click reach the server with their ids', async ({ page }) => {
    // on VB the event chip is an <a href="#">: its click used to navigate to /# and reboot the whole
    // app (nothing ran, the map was torn down); a marker is a keyboard-reachable button on both
    await page.goto('/arch/interactive');
    await calendarSettled(page);
    await page.getByText('Meeting', { exact: true }).filter({ visible: true }).first().click({ timeout: 20000 });
    await said(page, 'openEvent');
    await expect(page).toHaveURL(/\/arch\/interactive/);
    const marker = page.getByRole('button', { name: 'Palma' }).first();
    await expect(marker).toBeVisible({ timeout: 30000 }); // Leaflet comes from a CDN on VB
    await marker.focus();
    await page.keyboard.press('Enter');
    await said(page, 'openMarker {_markerId=m1}');
  });

  test('the YAML gallery paints its components and the content of its Notice', async ({ page }) => {
    await page.goto('/display-gallery');
    for (const text of ['Two complaints pending', 'Inside the notice', 'Inside the hero',
      'Inside the panel', 'Sea view', 'Great stay']) {
      await expect(page.getByText(text, { exact: true }).first(), text).toBeVisible({ timeout: 20000 });
    }
  });
});
