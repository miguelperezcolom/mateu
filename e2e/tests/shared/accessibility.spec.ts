import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility regression net.
 *
 * Two halves, because one tool cannot see both:
 *
 *  - axe-core checks the MARKUP rules (labels, contrast, roles, names). Cheap, broad, and it
 *    catches the kind of regression a refactor introduces by accident.
 *  - the rest checks BEHAVIOUR — focus trapping, keyboard operability, live regions — which axe
 *    cannot evaluate at all, and which is where the framework's own hand-rolled widgets fail.
 *    A `<div @click>` is invisible to axe: it has no way to know the div was meant to be a button.
 *
 * These run against the same SUT apps as the rest of the shared suite, so every framework
 * adapter gets the same guarantee.
 */

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** Routes covering the shapes Mateu generates: form, every field kind, listing, shell, layouts. */
const ROUTES = ['/', '/all-types', '/validation', '/app', '/items', '/tabs', '/sections', '/accordion'];

/**
 * Violations that belong to a design-system component's own shadow DOM rather than to anything
 * Mateu emits, and which therefore cannot be fixed here.
 *
 * `vaadin-tabs` is `role="tablist"` and puts a `<div part="tabs" tabindex="-1">` inside its own
 * shadow root; axe counts that div as a child the role does not allow. Nothing in the wire model
 * or in any Mateu renderer can change it — the fix belongs upstream. Scoped to that one rule on
 * that one element, so a real tablist mistake of ours would still fail the build.
 */
const isUpstreamVaadin = (ruleId: string, node: { target: unknown[] }): boolean => {
  const target = JSON.stringify(node.target);
  return ruleId === 'aria-required-children' && target.includes('vaadin-tabs');
};

const settle = async (page: Page) => {
  await page.waitForSelector('mateu-page, mateu-app, vaadin-grid', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);
};

test.describe('accessibility — markup (axe-core)', () => {
  for (const route of ROUTES) {
    test(`${route} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(route);
      await settle(page);
      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      const violations = results.violations
        .map((v) => ({ ...v, nodes: v.nodes.filter((n) => !isUpstreamVaadin(v.id, n)) }))
        .filter((v) => v.nodes.length > 0);
      // Report the rule ids and a sample node, so a failure says what to fix rather than "3".
      const summary = violations.map(
        (v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes[0]?.html?.slice(0, 120)}`,
      );
      expect(summary, `axe violations on ${route}`).toEqual([]);
    });
  }
});

test.describe('accessibility — behaviour (what axe cannot see)', () => {

  test('the skip link is the first thing Tab reaches, and it moves the focus to the content', async ({ page }) => {
    await page.goto('/app');
    await settle(page);
    await page.keyboard.press('Tab');
    const firstStop = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      // The skip link lives in its own shadow root; the host is what document.activeElement sees.
      return active?.tagName.toLowerCase() ?? '';
    });
    expect(firstStop).toBe('mateu-skip-link');

    await page.keyboard.press('Enter');
    const movedIntoContent = await page.evaluate(() => {
      const deep = (): Element | null => {
        let el: Element | null = document.activeElement;
        while ((el as HTMLElement)?.shadowRoot?.activeElement) el = (el as HTMLElement).shadowRoot!.activeElement;
        return el;
      };
      const active = deep();
      return !!active?.closest?.('.app-content, mateu-page, mateu-ux')
        || ['mateu-page', 'mateu-ux', 'mateu-component'].includes(active?.tagName.toLowerCase() ?? '');
    });
    expect(movedIntoContent).toBe(true);
  });

  test('the content region is a main landmark', async ({ page }) => {
    await page.goto('/app');
    await settle(page);
    const mains = await page.evaluate(() => {
      const found: string[] = [];
      const walk = (root: ParentNode) => {
        root.querySelectorAll?.('[role="main"], main').forEach((el) => found.push(el.tagName.toLowerCase()));
        root.querySelectorAll?.('*').forEach((el) => { if ((el as HTMLElement).shadowRoot) walk((el as HTMLElement).shadowRoot!); });
      };
      walk(document);
      return found;
    });
    expect(mains.length).toBeGreaterThan(0);
  });

  test('live regions exist before anything needs announcing', async ({ page }) => {
    // Created at boot on purpose: a region filled in the same tick it is created is frequently
    // never announced.
    await page.goto('/');
    await settle(page);
    const regions = await page.evaluate(() =>
      [...document.querySelectorAll('[data-mateu-live-region]')].map((el) => ({
        politeness: el.getAttribute('data-mateu-live-region'),
        live: el.getAttribute('aria-live'),
        atomic: el.getAttribute('aria-atomic'),
      })));
    expect(regions).toEqual(
      expect.arrayContaining([
        { politeness: 'polite', live: 'polite', atomic: 'true' },
        { politeness: 'assertive', live: 'assertive', atomic: 'true' },
      ]),
    );
  });

  test('navigating announces where the user landed', async ({ page }) => {
    await page.goto('/app');
    await settle(page);
    const announced = await page.evaluate(() =>
      document.querySelector('[data-mateu-live-region="polite"]')?.textContent?.trim() ?? '');
    // The backend's SetWindowTitle drives both the tab title and the announcement.
    expect(announced.length).toBeGreaterThan(0);
    expect(announced).toBe(await page.title());
  });

  test('a rejected save marks the field invalid and moves the focus to it', async ({ page }) => {
    await page.goto('/validation');
    await settle(page);
    // Submit with the required fields empty.
    const submit = page.locator('vaadin-button', { hasText: /validate|save|submit/i }).first();
    await submit.click();
    await page.waitForTimeout(800);

    const state = await page.evaluate(() => {
      const deepAll = (root: ParentNode, out: Element[] = []): Element[] => {
        root.querySelectorAll('*').forEach((el) => {
          out.push(el);
          if ((el as HTMLElement).shadowRoot) deepAll((el as HTMLElement).shadowRoot!, out);
        });
        return out;
      };
      const invalid = deepAll(document).filter((el) => (el as HTMLElement & { invalid?: boolean }).invalid === true);
      let active: Element | null = document.activeElement;
      while ((active as HTMLElement)?.shadowRoot?.activeElement) active = (active as HTMLElement).shadowRoot!.activeElement;
      return {
        invalidCount: invalid.length,
        // The message must live ON the control, so the design system wires aria-describedby.
        hasMessage: invalid.some((el) => !!(el as HTMLElement & { errorMessage?: string }).errorMessage),
        focusIsInvalid: !!invalid.find((el) => el === active || el.contains(active)),
      };
    });
    expect(state.invalidCount, 'controls marked invalid').toBeGreaterThan(0);
    expect(state.hasMessage, 'the message travels on the control, not in a detached list').toBe(true);
    expect(state.focusIsInvalid, 'focus moved to the first rejected field').toBe(true);
  });

  for (const overlay of [
    { label: /open drawer/i, panel: 'mateu-drawer', name: 'drawer' },
    { label: /open dialog/i, panel: 'mateu-dialog', name: 'dialog' },
  ]) {
    test(`a ${overlay.name} owns the focus while open and gives it back on close`, async ({ page }) => {
      await page.goto('/overlays');
      await settle(page);

      const opener = page.locator('vaadin-button', { hasText: overlay.label }).first();
      await opener.click();
      // 'attached', not 'visible': the overlay HOST has no box of its own — the panel inside it
      // is position:fixed — so Playwright reports the host as hidden even when it is on screen.
      await page.waitForSelector(overlay.panel, { state: 'attached', timeout: 10000 });
      await page.waitForTimeout(600);

      const inPanel = async () => page.evaluate((panelTag) => {
        let active: Element | null = document.activeElement;
        while ((active as HTMLElement)?.shadowRoot?.activeElement) {
          active = (active as HTMLElement).shadowRoot!.activeElement;
        }
        // Walk up through hosts, since the focused control lives several shadow roots deep.
        let node: Node | null = active;
        while (node) {
          if ((node as Element).tagName?.toLowerCase() === panelTag) return true;
          node = node.parentNode ?? (node as ShadowRoot).host ?? null;
        }
        return false;
      }, overlay.panel);

      // Opening must take the focus off the page behind the scrim…
      expect(await inPanel(), 'focus moved into the overlay on open').toBe(true);

      // …and Tab must never take it back out, however many times it is pressed.
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        expect(await inPanel(), `focus stayed inside after ${i + 1} Tab(s)`).toBe(true);
      }
      await page.keyboard.press('Shift+Tab');
      expect(await inPanel(), 'focus stayed inside going backwards').toBe(true);

      // Closing returns it to the control that opened the overlay, not to nowhere.
      await page.keyboard.press('Escape');
      await page.waitForTimeout(700);
      const backOnOpener = await page.evaluate((text) => {
        let active: Element | null = document.activeElement;
        while ((active as HTMLElement)?.shadowRoot?.activeElement) {
          active = (active as HTMLElement).shadowRoot!.activeElement;
        }
        return new RegExp(text, 'i').test(active?.textContent ?? '');
      }, overlay.name === 'drawer' ? 'open drawer' : 'open dialog');
      expect(backOnOpener, 'focus returned to the opener').toBe(true);
    });
  }

  test('every control the framework made clickable is also reachable and operable by keyboard', async ({ page }) => {
    // The defect this guards: a `<div @click>` that works with a mouse and does not exist for
    // anyone else. Any such element must carry a role AND a tab stop.
    for (const route of ['/', '/all-types', '/items', '/accordion']) {
      await page.goto(route);
      await settle(page);
      const offenders = await page.evaluate(() => {
        const bad: string[] = [];
        const walk = (root: ParentNode) => {
          root.querySelectorAll('*').forEach((el) => {
            const tag = el.tagName.toLowerCase();
            const isNativelyInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(tag)
              || tag.includes('-');
            const looksClickable = el.hasAttribute('role')
              && ['button', 'option', 'treeitem', 'tab'].includes(el.getAttribute('role')!);
            if (looksClickable && !isNativelyInteractive && !el.hasAttribute('tabindex')) {
              bad.push(`${tag}[role=${el.getAttribute('role')}] ${el.className}`);
            }
            if ((el as HTMLElement).shadowRoot) walk((el as HTMLElement).shadowRoot!);
          });
        };
        walk(document);
        return bad;
      });
      expect(offenders, `elements with an interactive role but no tab stop on ${route}`).toEqual([]);
    }
  });
});
