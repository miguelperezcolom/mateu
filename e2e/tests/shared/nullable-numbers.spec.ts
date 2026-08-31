import { test, expect } from '@playwright/test';

// An empty numeric field is the ordinary state of a boxed numeric: unset means "not stated", which
// is a different fact from zero. What made this worth a test of its own is HOW it failed — the
// field turned the empty value into NaN, committed it, was handed it back, refused it, cleared
// itself, and the clear read as another change. NaN is not equal to itself, so the cycle could
// never settle: the page hung with the form unusable.
test.describe('NullableNumbersForm (/nullable-numbers)', () => {

  test('an unset numeric renders as an empty field, and the page settles', async ({ page }) => {
    const rejected: string[] = [];
    page.on('console', (msg) => {
      if (/non-integer value|non-numeric value/i.test(msg.text())) rejected.push(msg.text());
    });

    await page.goto('/nullable-numbers');

    const integerField = page.locator('vaadin-integer-field#failuresBeforeSuccess input');
    await expect(integerField).toHaveValue('');

    // A settle window: a render loop announces itself by producing these without end, so the
    // assertion is on what happened while nobody touched the page.
    await page.waitForTimeout(1500);
    expect(rejected).toEqual([]);

    // And the form is still usable, which is what the loop actually cost.
    await integerField.fill('3');
    await expect(integerField).toHaveValue('3');
  });

  test('clearing an amount reaches the state instead of being dropped', async ({ page }) => {
    // Same family, opposite symptom: the empty value was FALSY, so the commit was skipped
    // altogether. The field showed nothing while the state kept the previous figure — the screen
    // and what would be saved disagreed, and nothing on screen said so.
    await page.goto('/nullable-numbers');

    const amount = page.locator('mateu-money-field#price vaadin-number-field input');
    await expect(amount).toHaveValue('25.5');

    await amount.fill('');
    await amount.blur();

    await expect
      .poll(() => componentState(page, 'price').then((v: any) => v?.value))
      .toBe(0);
  });

});

// The state the enclosing component would post back, read from the live page: what the field
// displays and what would be saved are exactly the two things this defect made disagree.
const componentState = (page: any, fieldId: string) => page.evaluate((id: string) => {
  const find = (root: Document | ShadowRoot): any => {
    for (const el of Array.from(root.querySelectorAll('*'))) {
      const state = (el as any).state;
      if (el.tagName.toLowerCase() === 'mateu-component' && state && id in state) return state[id];
      if (el.shadowRoot) {
        const found = find(el.shadowRoot);
        if (found !== undefined) return found;
      }
    }
    return undefined;
  };
  return find(document);
}, fieldId);
