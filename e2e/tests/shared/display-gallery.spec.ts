import { test, expect } from '@playwright/test';

// Every display component authored as DATA (sample1 specs/ui/display-gallery.yaml: a definition-only
// route, no view model), served by every adapter. Each must reach the page as its own element —
// not as the "unsupported" placeholder, not swallowed by the root view (a root @UI("") class used
// to answer for every definition-only route) — with no page error, and an action a component
// names must be CLAIMED by the page (declared as a client flow in the YAML) rather than dropped.

const ELEMENTS = [
  'mateu-entity-header', 'mateu-markdown', 'vaadin-avatar-group', 'vaadin-card', 'mateu-chart',
  'mateu-trend-chart', 'mateu-funnel', 'mateu-heatmap', 'mateu-gantt', 'mateu-kanban',
  'mateu-planning-board', 'mateu-matrix-grid', 'mateu-action-panel', 'mateu-map', 'mateu-timeline',
  'mateu-org-chart', 'mateu-bpmn', 'mateu-status-list', 'mateu-bulleted-list', 'mateu-faq',
  'mateu-pricing-table', 'mateu-offer-card', 'mateu-testimonials', 'mateu-feature-grid',
  'vaadin-progress-bar', 'mateu-progress-steps', 'mateu-meter', 'mateu-skeleton', 'mateu-notice',
  'mateu-callout-card', 'mateu-stat', 'mateu-comparison-card', 'mateu-calendar', 'mateu-task-queue',
];

test.describe('Display gallery as YAML (/display-gallery)', () => {

  test('every display component renders as itself, with no page error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/display-gallery');
    await expect(page.locator('mateu-entity-header')).toBeVisible();
    for (const tag of ELEMENTS) {
      await expect(page.locator(tag).first(), tag).toBeAttached();
    }
    // texts that only the right mapping produces
    await expect(page.locator('mateu-entity-header').getByText('Ada Lovelace')).toBeVisible();
    await expect(page.getByText('Inside the notice')).toBeVisible();
    await expect(page.getByText('Inside the hero')).toBeVisible();
    await expect(page.getByText('Inside the panel')).toBeVisible();
    // a custom component nobody registered: a visible placeholder, its children still shown
    await expect(page.locator('mateu-unsupported')).toBeAttached();
    expect(errors).toEqual([]);
  });

  test('actions the components name run their declared client flows', async ({ page }) => {
    const dropped: string[] = [];
    page.on('console', (m) => {
      if (m.text().includes('no component on the page handles it')) dropped.push(m.text());
    });
    await page.goto('/display-gallery');
    await expect(page.locator('mateu-action-panel')).toBeVisible();
    const picked = page.evaluate(() => new Promise<number>((resolve) => {
      let count = 0;
      document.addEventListener('gallery-picked', () => { if (++count === 3) resolve(count); });
    }));
    await page.getByRole('button', { name: 'I want to…' }).click();
    await page.getByRole('button', { name: /Cancel booking/ }).click();
    await page.getByRole('button', { name: 'Upgrade now' }).click();
    await page.getByRole('button', { name: 'Review' }).click();
    expect(await picked).toBe(3);
    expect(dropped).toEqual([]);
  });
});
