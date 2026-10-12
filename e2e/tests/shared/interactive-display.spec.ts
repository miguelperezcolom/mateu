import { test, expect, Page } from '@playwright/test';

// Every display component that RUNS something, composed in code (sample1 InteractiveDisplay,
// /arch/interactive): each names a plain public method of the page, the browser only sends an
// action its component advertises, and each handler answers a toast echoing the action and the
// parameters it received. So a click that is dropped, sent without its parameters or routed to the
// wrong handler fails here — the walk the unit tests of each piece cannot do.

const toast = (page: Page, text: string) =>
  expect(page.locator('vaadin-notification-card').filter({ hasText: text }).first()).toBeVisible();

test.describe('InteractiveDisplay (/arch/interactive)', () => {
  let unhandled: string[];

  test.beforeEach(async ({ page }) => {
    unhandled = [];
    page.on('console', (m) => {
      if (m.text().includes('no component on the page handles it')) unhandled.push(m.text());
    });
    page.on('pageerror', (e) => unhandled.push('pageerror: ' + e.message));
    await page.goto('/arch/interactive');
    await expect(page.locator('mateu-kanban')).toBeVisible();
  });

  test.afterEach(() => {
    expect(unhandled).toEqual([]);
  });

  test('metric card and stat drill in', async ({ page }) => {
    await page.getByRole('button', { name: /Revenue/ }).first().click();
    await toast(page, 'drillRevenue');
    await page.getByRole('button', { name: /Arrivals/ }).first().click();
    await toast(page, 'openArrivals');
  });

  test('a gantt bar sends its task id', async ({ page }) => {
    await page.locator('mateu-gantt').getByRole('button', { name: /Design/ }).first().click();
    await toast(page, 'pickTask {_clickedTaskId=t1}');
  });

  test('a kanban card runs its action', async ({ page }) => {
    await page.locator('mateu-kanban').getByText('Write docs').click();
    await toast(page, 'openCard');
  });

  test('a planning block is selected', async ({ page }) => {
    await page.locator('mateu-planning-board').getByText('Smith').click();
    await toast(page, 'pickBlock');
  });

  test('dragging a planning block to another row sends the move', async ({ page }) => {
    const board = page.locator('mateu-planning-board');
    const block = await board.getByText('Smith').boundingBox();
    const row = await board.getByText('Room 102').boundingBox();
    await page.mouse.move(block!.x + block!.width / 2, block!.y + block!.height / 2);
    await page.mouse.down();
    await page.mouse.move(block!.x + block!.width / 2, row!.y + row!.height / 2, { steps: 8 });
    await page.mouse.up();
    await toast(page, 'moveBlock {_blockId=b1, _end=2026-10-04, _resourceId=r102, _start=2026-10-02}');
  });

  test('a map marker is a keyboard-reachable button that sends its id', async ({ page }) => {
    const marker = page.locator('mateu-map').getByRole('button', { name: 'Palma' });
    await marker.focus();
    await page.keyboard.press('Enter');
    await toast(page, 'openMarker {_markerId=m1}');
  });

  test('a matrix link cell and an edited cell reach the server with row and column', async ({ page }) => {
    const matrix = page.locator('mateu-matrix-grid');
    await matrix.getByRole('button', { name: '7' }).click();
    await toast(page, 'openCell {_columnId=d1, _rowId=sgl, _value=7}');
    await matrix.getByText('4', { exact: true }).dblclick();
    const input = matrix.locator('input');
    await input.fill('5');
    await input.press('Enter');
    await toast(page, 'editCell {_columnId=d1, _rowId=dbl, _value=5}');
  });

  test('an action panel item runs with its parameters', async ({ page }) => {
    await page.getByRole('button', { name: 'I want to…' }).click();
    await page.getByRole('button', { name: /Cancel booking/ }).click();
    await toast(page, 'cancelBooking {reason=test}');
  });

  test('calendar: an event and a day', async ({ page }) => {
    const calendar = page.locator('mateu-calendar');
    await calendar.getByText('Meeting').click();
    await toast(page, 'openEvent');
    await calendar.getByRole('button', { name: /12/ }).first().click();
    await toast(page, 'openDay');
  });

  test('queue, timeline, org chart, status list and feature grid run their actions', async ({ page }) => {
    await page.locator('mateu-task-queue').getByText('Call Ada').click();
    await toast(page, 'openItem');
    await page.locator('mateu-timeline').getByText('Created').click();
    await toast(page, 'openTimeline');
    await page.locator('mateu-org-chart').getByText('CEO').click();
    await toast(page, 'openNode');
    await page.locator('mateu-status-list').getByRole('button', { name: 'Retry' }).click();
    await toast(page, 'retryPayment');
    await page.locator('mateu-feature-grid').getByText('Fast').click();
    await toast(page, 'openFeature');
  });

  test('calls to action: pricing, offer, callout, notice, empty state', async ({ page }) => {
    await page.getByRole('button', { name: 'Choose' }).click();
    await toast(page, 'choosePlan');
    await page.getByRole('button', { name: 'Add breakfast' }).click();
    await toast(page, 'addOffer');
    await page.getByRole('button', { name: 'Upgrade now' }).click();
    await toast(page, 'upgrade');
    await page.getByRole('button', { name: 'Review' }).click();
    await toast(page, 'reviewComplaints');
    await page.getByRole('button', { name: 'New booking' }).click();
    await toast(page, 'newBooking');
  });
});
