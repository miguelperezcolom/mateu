import { test, expect } from '@playwright/test';

test('basic field validations work', async ({ page }) => {
  await page.goto('/#idjijdid')

  await expect(page.getByText('NotFoundException').first()).toBeVisible()

});
