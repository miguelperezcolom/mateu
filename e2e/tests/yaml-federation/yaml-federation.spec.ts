import { test, expect, type Page } from '@playwright/test';

/**
 * The YAML-only federation (e2e/sut/yaml-federation): a console and two domains, NONE with a line of
 * UI code — every screen, the console's shell and its menu are YAML definitions.
 *
 *   :18480  the console    — served; its menu is two RemoteMenus
 *   :18481  Orders         — a domain SERVED by its own backend, mounted at /orders
 *   :18482  Catalog        — a domain shipped as a STATIC bundle (no backend at all), plus the JSON
 *                            API both domains read their rows from (plain files, CORS open)
 *
 * The console reaches the static domain through a RemoteMenu whose baseUrl names the bundle's
 * manifest.json: the browser reads that manifest and answers the domain's loads from it.
 *
 * Start the three servers with e2e/sut/yaml-federation/run.sh (it builds the modules first).
 */
const ORDERS = 'http://localhost:18481';
const STATIC = 'http://localhost:18482';

/** Every Mateu request the page makes, by host — to tell who answered what. */
const watchRequests = (page: Page) => {
    const seen: string[] = [];
    page.on('request', (request) => {
        const url = request.url();
        if (url.includes('/mateu/v3/') || url.endsWith('manifest.json')) seen.push(`${request.method()} ${url}`);
    });
    return seen;
};

const menuItem = (page: Page, name: string) => page.getByRole('menuitem', { name, exact: true });
// vaadin-grid keeps recycled row cells in the DOM: only the VISIBLE ones are rows on screen.
const cell = (page: Page, text: string) =>
    page.locator('vaadin-grid').getByText(text, { exact: true }).filter({ visible: true });

test.describe('YAML-only federation', () => {

    test('the console shows its own page and both federated domains in its menu', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Welcome to the console' })).toBeVisible({ timeout: 20000 });
        await expect(menuItem(page, 'Home')).toBeVisible();
        await expect(menuItem(page, 'Orders')).toBeVisible();
        await expect(menuItem(page, 'Catalog')).toBeVisible();
        // neither section is shown as unavailable: both remotes answered with their menus
        await expect(menuItem(page, 'Orders')).not.toHaveClass(/mateu-nav-unavailable/);
        await expect(menuItem(page, 'Catalog')).not.toHaveClass(/mateu-nav-unavailable/);
    });

    test('the served domain renders in the console, its rows read with ITS OWN REST source', async ({ page }) => {
        const seen = watchRequests(page);
        await page.goto('/');
        await menuItem(page, 'Orders').click();
        await expect(page.getByRole('heading', { name: 'Open orders' })).toBeVisible({ timeout: 20000 });
        // the source is declared in the Orders domain only: the console learnt it from its app
        await expect(cell(page, 'ORD-001')).toBeVisible();
        await expect(cell(page, 'Globex')).toBeVisible();
        // the listing was asked of the remote, not of the console
        expect(seen.some((r) => r.startsWith(`POST ${ORDERS}/orders/mateu/v3/sync/list`))).toBe(true);
    });

    test('the static domain renders in the console with no backend behind it', async ({ page }) => {
        const seen = watchRequests(page);
        await page.goto('/');
        await menuItem(page, 'Catalog').click();
        await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({ timeout: 20000 });
        await expect(cell(page, 'Blue mug')).toBeVisible();
        // read once, as a file; nothing was ever POSTed to the static host
        expect(seen.filter((r) => r === `GET ${STATIC}/manifest.json`)).toHaveLength(1);
        expect(seen.filter((r) => r.startsWith(`POST ${STATIC}`))).toEqual([]);
    });

    test('deep links into either domain, by the console\'s menu path, open the page they name', async ({ page }) => {
        await page.goto('/orders/list/o2');
        await expect(page.getByRole('heading', { name: 'Order ORD-002' })).toBeVisible({ timeout: 20000 });

        await page.goto('/catalog/products');
        await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({ timeout: 20000 });
        await expect(cell(page, 'Red kettle')).toBeVisible();
    });

    test('a domain\'s root opens its home screen, once — not its shell inside the console\'s', async ({ page }) => {
        const seen = watchRequests(page);
        await page.goto('/orders');
        await expect(page.getByRole('heading', { name: 'Open orders' })).toBeVisible({ timeout: 20000 });
        await page.goto('/catalog');
        await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({ timeout: 20000 });
        // the root of the served domain used to answer its own shell, reloaded in a loop until the
        // client's circuit breaker stopped it ("A repeating request was detected")
        const orderLoads = seen.filter((r) => r.startsWith(`POST ${ORDERS}/orders/mateu/v3/sync/orders`));
        expect(orderLoads.length).toBeLessThanOrEqual(2);
        await expect(page.getByText(/repeating request/i)).toHaveCount(0);
    });

    test('the URL a served domain\'s entry leads to survives a reload', async ({ page }) => {
        await page.goto('/');
        await menuItem(page, 'Orders').click();
        await expect(page.getByRole('heading', { name: 'Open orders' })).toBeVisible({ timeout: 20000 });
        await page.reload();
        await expect(page.getByRole('heading', { name: 'Open orders' })).toBeVisible({ timeout: 20000 });
        await expect(cell(page, 'ORD-002')).toBeVisible();
    });

    test('each domain also stands on its own', async ({ page }) => {
        await page.goto(`${ORDERS}/orders`);
        await expect(page.getByRole('heading', { name: 'Open orders' })).toBeVisible({ timeout: 20000 });
        await page.goto(`${ORDERS}/orders/list/o1`);
        await expect(page.getByRole('heading', { name: 'Order ORD-001' })).toBeVisible({ timeout: 20000 });
        await page.goto(`${STATIC}/products`);
        await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({ timeout: 20000 });
    });
});
