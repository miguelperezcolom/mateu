import { test, expect } from '@playwright/test';

/**
 * The first-load budget: what a COLD first visit to a listing costs on the wire, on every adapter.
 *
 * Counts and bytes, never times — a timing gate on a shared CI runner is noise, and a gate that
 * reports noise gets ignored. The numbers it guards were measured on 2026-11 (see
 * design/performance/baseline-2026-11.md, the method is e2e/first-load-probe.mjs):
 *
 *   - before AssetCompression, every adapter sent the renderer UNCOMPRESSED: ~2.6 MB of JavaScript
 *     on the first load (≈14 s on a Fast 3G phone); gzipped it is ~0.7 MB;
 *   - a listing's first load is ~12 requests (the page, the eager chunks, the theme, the loads).
 *
 * The ceilings leave room (≈ +40%) for the bundle to grow a little; the eager bundle itself is
 * budgeted byte by byte by apps/vaadin/scripts/check-bundle-budget.mjs. Raise them only as a
 * reviewed change, saying why here.
 */
const MAX_REQUESTS_UNTIL_CONTENT = 25;
const MAX_JS_ON_THE_WIRE = 1_000 * 1024;
const MAX_TOTAL_ON_THE_WIRE = 1_200 * 1024;

test('a cold first load of a listing stays within its request and byte budget', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'bytes on the wire come from the Chrome DevTools Protocol');
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    const types = new Map<string, string>();
    const bytes = new Map<string, number>();
    const encodings = new Map<string, string>();
    cdp.on('Network.responseReceived', (e) => {
        types.set(e.requestId, e.type);
        const headers = Object.fromEntries(Object.entries(e.response.headers).map(([k, v]) => [k.toLowerCase(), String(v)]));
        if (e.response.url.includes('/assets/mateu-vaadin.js')) encodings.set('mateu-vaadin.js', headers['content-encoding'] ?? '');
    });
    cdp.on('Network.loadingFinished', (e) => bytes.set(e.requestId, e.encodedDataLength));
    let requests = 0;
    page.on('request', () => requests++);

    await page.goto('/items');
    await expect(page.getByText('Widget A').first()).toBeVisible();
    const untilContent = requests;
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

    let js = 0;
    let total = 0;
    for (const [id, n] of bytes) {
        total += n;
        if (types.get(id) === 'Script') js += n;
    }
    const kb = (n: number) => `${Math.round(n / 1024)} KB`;
    console.log(`first load /items: ${untilContent} requests until content, ${requests} in all, JS ${kb(js)}, total ${kb(total)}`);

    expect(encodings.get('mateu-vaadin.js'), 'the renderer bundle travels gzipped (AssetCompression)').toBe('gzip');
    expect(untilContent, 'requests until the listing is on screen').toBeLessThanOrEqual(MAX_REQUESTS_UNTIL_CONTENT);
    expect(js, `JavaScript on the wire (${kb(js)})`).toBeLessThanOrEqual(MAX_JS_ON_THE_WIRE);
    expect(total, `bytes on the wire (${kb(total)})`).toBeLessThanOrEqual(MAX_TOTAL_ON_THE_WIRE);
});
