import { test, expect, type Page } from '@playwright/test';

/**
 * P5 · S0 of design/maui-parity-plan.md — the «static VCN slice»: a 100% static Mateu UI. The page
 * under test is served by a DUMB static file server (demo/demo-static-vcn/serve-static.mjs: files +
 * an SPA fallback, nothing else) and every byte of data comes straight from the browser to «the
 * external API» (demo/demo-static-vcn/external-api/server.mjs, a stand-in for a public REST API,
 * with CORS). There is NO Mateu backend anywhere: any request to /mateu/v3/** fails the test.
 *
 * The same spec runs against each way of building the site (see playwright.config.ts):
 *   - static-vcn-java  — Java @UI classes exported by `mateu:bundle` (pre-rendered wire);
 *   - static-vcn-yaml  — YAML definitions shipped RAW and expanded in the browser (specs mode).
 *
 * Start the servers with demo/demo-static-vcn/run-static.sh (it builds both sites first).
 */
const API = process.env.STATIC_VCN_API ?? 'http://localhost:8790';

// One API, mutated by the delete test: run in order, in one worker, never stopping at a failure.
// The Java and YAML projects share it too, so playwright.config.ts runs them one after the other.
test.describe.configure({ mode: 'default' });

test.beforeEach(async ({ page, request }) => {
    await request.post(`${API}/__reset`);
    // The point of the slice: no Mateu backend. A sync call would mean the bundle could not answer.
    await page.route('**/mateu/v3/**', route => {
        throw new Error('a Mateu backend was called: ' + route.request().url());
    });
});

const grid = (page: Page) => page.locator('vaadin-grid');

/** A page-header action: inline, or — when the Vaadin header has collapsed it — in the "⋯" menu. */
const headerAction = async (page: Page, name: string) => {
    const inline = page.getByRole('button', { name, exact: true });
    if (await inline.isVisible()) return inline.click();
    await page.locator('button.overflow-btn').click();
    await page.locator('button.overflow-item', { hasText: name }).click();
};
// vaadin-grid keeps recycled row cells in the DOM: only the VISIBLE ones are rows on screen.
const row = (page: Page, name: string) =>
    grid(page).getByText(name, { exact: true }).filter({ visible: true });

test('the listing reads the API in the browser: status badges and client-side paging', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Virtual cloud networks' })).toBeVisible({ timeout: 20000 });
    await expect(row(page, 'vcn-dev-01')).toBeVisible();
    // a status column over the API's plain lifecycle word, painted as a badge
    const badge = grid(page).locator('span[theme~="badge"]', { hasText: 'PROVISIONING' }).first();
    await expect(badge).toBeVisible();
    await expect(badge).toHaveAttribute('theme', /warning/);
    // 12 rows, 10 a page: the renderer pages the fetched collection itself
    await expect(page.getByText('12 items')).toBeVisible();
    await expect(page.getByText('Page 1 of 2')).toBeVisible();
    await page.locator('button[title="Next page"]').click();
    await expect(page.getByText('Page 2 of 2')).toBeVisible();
    await expect(row(page, 'vcn-prod-12')).toBeVisible();
    await expect(row(page, 'vcn-dev-01')).toHaveCount(0);
});

test('the listing filters in the browser (free text and a declared filter)', async ({ page }) => {
    await page.goto('/');
    await expect(row(page, 'vcn-dev-01')).toBeVisible({ timeout: 20000 });
    // free text
    const search = page.getByPlaceholder('Search');
    await search.fill('prod');
    await search.press('Enter');
    await expect(page.getByText('4 items')).toBeVisible();
    await expect(row(page, 'vcn-dev-01')).toHaveCount(0);
    await expect(row(page, 'vcn-prod-03')).toBeVisible();
    // a declared filter (State = Provisioning), from the smart-search panel, on top of the text
    const bar = page.locator('mateu-filter-bar');
    await bar.locator('input.free-text').click();
    await bar.locator('.panel-row', { hasText: 'State' }).click();
    await bar.locator('.panel-row', { hasText: 'Provisioning' }).click();
    await expect(bar.locator('.chip', { hasText: 'Provisioning' })).toBeVisible();
    await expect(page.getByText('1 item', { exact: true }).or(page.getByText('1 items'))).toBeVisible();
    await expect(row(page, 'vcn-prod-03')).toBeVisible();
    await expect(row(page, 'vcn-prod-06')).toHaveCount(0);
});

test('a row opens its record by URL, loaded from the API by :id', async ({ page }) => {
    await page.goto('/');
    await row(page, 'vcn-dev-07').click({ timeout: 20000 });
    await expect(page).toHaveURL(/\/vcns\/7$/);
    await expect(page.getByRole('heading', { name: 'vcn-dev-07' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('10.7.0.0/16')).toBeVisible();
});

test('a deep link renders the record, not the home (#557)', async ({ page }) => {
    await page.goto('/vcns/7');
    await expect(page.getByRole('heading', { name: 'vcn-dev-07' })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('10.7.0.0/16')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Virtual cloud networks' })).not.toBeVisible();
});

test('the child listing is scoped by the parent id', async ({ page }) => {
    await page.goto('/vcns/7');
    await expect(page.getByRole('heading', { name: 'vcn-dev-07' })).toBeVisible({ timeout: 20000 });
    await headerAction(page, 'Subnets');
    await expect(page).toHaveURL(/\/vcns\/7\/subnets$/);
    await expect(row(page, 'subnet-public-1')).toBeVisible({ timeout: 15000 });
    await expect(row(page, 'subnet-private-2')).toBeVisible();
    await expect(page.getByText('10.7.1.0/24')).toBeVisible();
    // and by deep link too
    await page.goto('/vcns/2/subnets');
    await expect(page.getByText('10.2.3.0/24')).toBeVisible({ timeout: 20000 });
});

test('delete asks for confirmation, calls the API, toasts and lands on a refreshed listing', async ({ page }) => {
    await page.goto('/vcns/7');
    await expect(page.getByRole('heading', { name: 'vcn-dev-07' })).toBeVisible({ timeout: 20000 });
    const deleted = page.waitForRequest(r => r.method() === 'DELETE' && r.url() === `${API}/api/vcns/7`);
    await headerAction(page, 'Delete');
    await expect(page.getByText('This deletes the VCN and its subnets.')).toBeVisible();
    // the confirmation's own wording: confirmationTexts.confirmationText
    await page.getByRole('button', { name: 'Delete', exact: true }).last().click();
    await deleted;
    await expect(page.locator('vaadin-notification-card', { hasText: 'VCN deleted' })).toBeVisible();
    await expect(page).toHaveURL(/\/vcns$/);
    await expect(page.getByText('11 items')).toBeVisible({ timeout: 15000 });
    await expect(row(page, 'vcn-prod-06')).toBeVisible();
    await expect(row(page, 'vcn-dev-07')).toHaveCount(0);
});
