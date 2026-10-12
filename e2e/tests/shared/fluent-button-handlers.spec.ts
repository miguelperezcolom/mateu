import { test, expect } from '@playwright/test';

// A fluent Button built with a handler — new Button("Increment", () -> ...) — is run by the server
// by finding the button in the tree. The browser only SENDS an action its component advertises,
// and a lambda has no action method to be advertised by: on demo.mateu.io (3.0-alpha.411) the
// counter's click was dropped with "no component on the page handles it". Every unit test of the
// harvester passed, because none of them drove a lambda button from a real client.
test.describe('FluentCounter (/fluent-counter)', () => {

  test('a lambda button runs on the server and the page shows the new state', async ({ page }) => {
    const unhandled: string[] = [];
    page.on('console', m => {
      if (m.text().includes('no component on the page handles it')) unhandled.push(m.text());
    });
    await page.goto('/fluent-counter');

    await expect(page.getByText('Count: 0')).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 2')).toBeVisible();

    expect(unhandled).toEqual([]);
  });

  test('a lambda button nested in a card runs too', async ({ page }) => {
    await page.goto('/fluent-counter');

    await expect(page.getByText('Count: 0')).toBeVisible();
    await page.getByRole('button', { name: 'Add ten' }).click();
    await expect(page.getByText('Count: 10')).toBeVisible();
  });

});
