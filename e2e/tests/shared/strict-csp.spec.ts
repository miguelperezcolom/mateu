import { test, expect, Page, Route } from '@playwright/test';
import { createHash } from 'node:crypto';

/**
 * The web client runs under a STRICT Content Security Policy — in particular without
 * 'unsafe-eval': rules, conditions and `${…}` templates go through Mateu's own sandboxed
 * expression evaluator (libs/mateu infra/ui/expression.ts), never `eval`/`new Function`, and no
 * link is an `href="javascript:…"`.
 *
 * The SUT apps do not send a CSP themselves, so the policy is added here, on every HTML document,
 * by a Playwright route. The page's own inline scripts (the theme bootstrap of index.html) are
 * allowed by their HASH, which keeps the policy strict: an injected inline script, an eval or a
 * javascript: URL would still be a violation. Any violation fails the test.
 *
 * The policy is the one documented in java-user-manual/advanced/security.md.
 */

const POLICY = (scriptHashes: string[]) => [
  "default-src 'self'",
  `script-src 'self' ${scriptHashes.join(' ')}`.trim(),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const inlineScriptHashes = (html: string): string[] =>
  [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => `'sha256-${createHash('sha256').update(m[1], 'utf8').digest('base64')}'`);

const withStrictCsp = async (page: Page) => {
  await page.route('**/*', async (route: Route) => {
    const request = route.request();
    if (request.resourceType() !== 'document') return route.continue();
    const response = await route.fetch();
    const body = await response.text();
    await route.fulfill({
      response,
      body,
      headers: { ...response.headers(), 'content-security-policy': POLICY(inlineScriptHashes(body)) },
    });
  });
  // collect violations from the page itself (the console message alone is browser-specific)
  await page.addInitScript(() => {
    (window as unknown as { __csp: string[] }).__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { __csp: string[] }).__csp.push(
        `${e.violatedDirective} blocked ${e.blockedURI || '(inline)'} at ${e.sourceFile}:${e.lineNumber}`);
    });
  });
};

const violations = async (page: Page, consoleCsp: string[]) => {
  const fromPage = await page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []);
  return [...fromPage, ...consoleCsp];
};

/** Form, every field kind (rules, conditions, templates), validation, listing, shell, layouts. */
const ROUTES = ['/', '/all-types', '/validation', '/app', '/items', '/tabs', '/sections', '/accordion', '/overlays'];

test.describe('strict Content Security Policy (no unsafe-eval)', () => {
  for (const route of ROUTES) {
    test(`${route} renders with no CSP violation`, async ({ page }) => {
      const consoleCsp: string[] = [];
      page.on('console', (msg) => {
        const text = msg.text();
        if (/Content Security Policy|Refused to (evaluate|execute|load|apply)/i.test(text)) consoleCsp.push(text);
      });
      await withStrictCsp(page);
      await page.goto(route);
      await page.waitForSelector('mateu-page, mateu-app, vaadin-grid', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1500);
      // the page really rendered (a CSP that broke the bundle would leave it empty)
      await expect(page.locator('mateu-ui')).toBeAttached();
      expect(await violations(page, consoleCsp), `CSP violations on ${route}`).toEqual([]);
    });
  }

  test('typing in a form (rules and validations re-evaluate) stays within the policy', async ({ page }) => {
    const consoleCsp: string[] = [];
    page.on('console', (msg) => {
      if (/Content Security Policy|Refused to/i.test(msg.text())) consoleCsp.push(msg.text());
    });
    await withStrictCsp(page);
    await page.goto('/validation');
    await page.waitForSelector('mateu-page', { timeout: 15000 });
    const input = page.locator('vaadin-text-field input, input').first();
    await input.fill('x');
    await input.fill('');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(800);
    expect(await violations(page, consoleCsp)).toEqual([]);
  });
});
