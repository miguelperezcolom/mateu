import { test, expect, Page } from '@playwright/test';

// The authored half of a Mateu UI — specs/ui YAML — served by every Java adapter (this spec runs
// in the SHARED suite: MVC, WebFlux, Quarkus, Micronaut, Helidon). Fixtures live in
// e2e/sut/modules/sample1/src/main/resources/specs/ui (walkthrough/*, partials/, components.yaml,
// types.yaml, actions.yaml, translations/) and are routed by sample1-routes.yaml.

function consoleProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (m) => {
    const text = m.text();
    if (m.type() === 'error' || text.includes('no component on the page handles it')) problems.push(text);
  });
  return problems;
}

test.describe('YAML authoring served by the backend', () => {

  test('a definition-only page renders every authored kind', async ({ page }) => {
    const problems = consoleProblems(page);
    await page.goto('/walkthrough/page');

    // translation (default locale en), the route's seeded state
    await expect(page.getByText('Authored in YAML')).toBeVisible();
    await expect(page.getByText('Greeting: Hola')).toBeVisible();
    // a field of the page, the two fields a partial splices in, a field type's label + placeholder
    for (const label of ['Name', 'Street', 'City', 'Code']) {
      await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    }
    await expect(page.getByLabel('Code', { exact: true })).toHaveAttribute('placeholder', 'AB-123');
    // eyesOnly: the anonymous caller does not get the restricted field at all
    await expect(page.getByLabel('Salary')).toHaveCount(0);
    // a business component from components.yaml
    await expect(page.getByText('Built from the component catalogue')).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('the translation follows the request locale', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'es-ES' });
    const page = await context.newPage();
    await page.goto('/walkthrough/page');
    await expect(page.getByText('Escrito en YAML')).toBeVisible();
    await context.close();
  });

  test('a page action (flow) navigates to a pinned route', async ({ page }) => {
    const problems = consoleProblems(page);
    await page.goto('/walkthrough/page');
    await page.getByRole('button', { name: 'Open alpha' }).click();
    await expect(page).toHaveURL(/\/walkthrough\/pinned\/alpha$/);
    await expect(page.getByText('Flavour: alpha')).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('an action-catalogue entry runs from a page button', async ({ page }) => {
    const problems = consoleProblems(page);
    await page.goto('/walkthrough/page');
    await page.getByRole('button', { name: 'Open beta' }).click();
    await expect(page).toHaveURL(/\/walkthrough\/pinned\/beta$/);
    await expect(page.getByText('Flavour: beta')).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('one definition serves two routes, each pinning its parameter (deep link + back)', async ({ page }) => {
    await page.goto('/walkthrough/pinned/beta?flavour=alpha'); // a pin is not a suggestion
    await expect(page.getByText('Flavour: beta')).toBeVisible();
    await page.goto('/walkthrough/pinned/alpha');
    await expect(page.getByText('Flavour: alpha')).toBeVisible();
    await page.goBack();
    await expect(page.getByText('Flavour: beta')).toBeVisible();
  });

  test('a layout bound to a Java view model by its route entry runs the class\'s action', async ({ page }) => {
    const problems = consoleProblems(page);
    await page.goto('/walkthrough/bound');
    const count = page.getByLabel('Count');
    await expect(count).toHaveValue('1');
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(count).toHaveValue('2');
    expect(problems).toEqual([]);
  });

  test('a route restricted with access: is refused to an anonymous caller', async ({ page }) => {
    const refused = page.waitForResponse((r) => r.url().includes('/walkthrough/restricted') && r.request().method() === 'POST');
    await page.goto('/walkthrough/restricted');
    expect((await refused).status()).toBe(403);
    await expect(page.getByText('You are not allowed to do this.').first()).toBeVisible();
    await expect(page.getByText(/Flavour:/)).toHaveCount(0);
  });
});
