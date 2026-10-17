import { test, expect } from '@playwright/test';

// A newcomer opens the browser console first. Mateu's own code used to print two Vaadin warnings
// on EVERY page: "Lumo .js mixins are deprecated and will be removed in V26" (lumo.js imported four
// deprecated mixins whose CSS matched nothing at document level) and "The custom element
// definition for vaadin-card was finalized before a style module was registered" (the section-card
// style module is necessarily registered after the bundle defines vaadin-card). Both are gone;
// the section cards still render frameless.
//
// NOT asserted: the mixins warning as such. @vaadin-component-factory/vcf-date-range-picker 6.0.0
// (the newest release; the date-range filter widget) imports two of those deprecated mixins
// itself, and Vaadin prints that message once per page whoever triggers it.

test('the page prints no style-module warning and section cards stay frameless', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'warning') warnings.push(m.text());
  });

  await page.goto('/walk-layout');
  const card = page.locator('vaadin-card.mateu-section').first();
  await expect(card).toBeAttached();

  const chrome = await card.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      padding: cs.getPropertyValue('--vaadin-card-padding').trim(),
      border: cs.getPropertyValue('--vaadin-card-border-width').trim(),
    };
  });
  expect(chrome).toEqual({ padding: '0', border: '0' });
  expect(warnings.filter((w) => w.includes('finalized before a style module was registered'))).toEqual([]);
});
