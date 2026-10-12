import { test, expect, Page } from '@playwright/test';

// The app-shell walkthrough (design/walkthrough/app-shell.md), variants: one small non-root app per
// shell variant (sample1 io.mateu.sample1.shell.Shell*App), each navigated like a user — mouse and
// keyboard — down to a page of a nested group, plus the AUTO rule that picked it.

function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || /no component on the page handles it/.test(m.text())) {
      problems.push(`[${m.type()}] ${m.text()}`);
    }
  });
  page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
  return problems;
}

/** Section2's field: the page of every group's "Monthly" entry is on screen. */
const monthlyIsOnScreen = (page: Page) => expect(page.getByLabel('Description')).toBeVisible();

async function variantOf(page: Page, mount: string): Promise<string> {
  const response = await page.request.post(`${mount}/mateu/v3/sync/x`, {
    data: { route: '', consumedRoute: '_empty', actionId: '' },
    headers: { 'Content-Type': 'application/json' },
  });
  return /"variant":"(\w+)"/.exec(await response.text())?.[1] ?? '';
}

test.describe('AUTO picks the variant from the menu shape', () => {
  test('deep → TILES, groups and > 7 entries → HAMBURGER_MENU, no groups → TABS', async ({ page }) => {
    expect(await variantOf(page, '/shell-tiles')).toBe('TILES');
    expect(await variantOf(page, '/shell-wide')).toBe('HAMBURGER_MENU');
    expect(await variantOf(page, '/shell-flat')).toBe('TABS');
    expect(await variantOf(page, '/shell-rail')).toBe('RAIL');
  });
});

test.describe('Shell variants', () => {

  test('TILES: a group opens a hub of tiles, a tile opens its page', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell-tiles');
    await page.getByRole('navigation').getByRole('button', { name: 'Reports' }).click();
    await page.getByRole('button', { name: 'Monthly' }).click();
    await expect(page).toHaveURL(/\/shell-tiles\/reports\/monthly$/);
    await monthlyIsOnScreen(page);

    // the nested group is a tile too, reachable from the keyboard
    await page.getByRole('navigation').getByRole('button', { name: 'Reports' }).click();
    await page.getByRole('button', { name: 'Archive' }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Yearly' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/shell-tiles\/reports\/archive\/yearly$/);
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('HAMBURGER_MENU: the drawer lists the whole menu and navigates', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell-wide');
    await page.getByRole('navigation').getByRole('button', { name: 'Monthly' }).click();
    await expect(page).toHaveURL(/\/shell-wide\/group\/monthly$/);
    await monthlyIsOnScreen(page);
    await page.reload();
    await monthlyIsOnScreen(page);
    expect(problems).toEqual([]);
  });

  test('TABS: a tab per entry, the selected one marked', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell-flat');
    await page.getByRole('tab', { name: 'Monthly' }).click();
    await expect(page).toHaveURL(/\/shell-flat\/monthly$/);
    await monthlyIsOnScreen(page);
    await expect(page.getByRole('tab', { name: 'Monthly' })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: 'Page' }).click();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('RAIL: a navigation of buttons; a group opens its panel; works from the keyboard', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell-rail');
    const rail = page.getByRole('navigation', { name: 'Shell rail' });
    await rail.getByRole('button', { name: 'Reports' }).click();
    await page.getByRole('button', { name: 'Monthly' }).click();
    await expect(page).toHaveURL(/\/shell-rail\/reports\/monthly$/);
    await monthlyIsOnScreen(page);

    await rail.getByRole('button', { name: 'Page' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/shell-rail\/page$/);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('MENU_ON_LEFT: the sidebar shows the whole tree and navigates to a nested page', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell-left');
    await page.getByRole('button', { name: 'Yearly' }).click();
    await expect(page).toHaveURL(/\/shell-left\/reports\/archive\/yearly$/);
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/shell-left$/);
    expect(problems).toEqual([]);
  });

  test('HAMBURGER_SECTIONS: the hamburger picks a section, the band its entries', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell-sections');
    await page.getByRole('button', { name: 'Sections' }).first().click();
    await page.getByRole('button', { name: 'Reports' }).first().click();
    // a section opens on its first entry; the band holds the section's entries
    await expect(page).toHaveURL(/\/shell-sections\/reports\/monthly$/);
    await monthlyIsOnScreen(page);
    await page.getByRole('menuitem', { name: /^Archive/ }).click();
    await page.getByRole('menuitem', { name: 'Yearly' }).click();
    await expect(page).toHaveURL(/\/shell-sections\/reports\/archive\/yearly$/);
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('chromeless: no navigation chrome; the command center navigates and searches', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell-cc');
    await expect(page.getByRole('heading', { name: 'Shell chromeless' })).toBeVisible();
    await expect(page.getByRole('navigation')).toHaveCount(0);

    await page.getByRole('button', { name: 'Command center' }).click();
    // typed straight away, like a quick typist: no key may get lost on the way to the search field
    await page.keyboard.type('monthly');
    await expect(page.getByPlaceholder(/Search screens/)).toHaveValue('monthly');
    await page.getByText('Monthly', { exact: true }).last().click();
    await expect(page).toHaveURL(/\/shell-cc\/reports\/monthly$/);
    await monthlyIsOnScreen(page);

    await page.getByRole('button', { name: 'Command center' }).click();
    await page.keyboard.type('ada');
    await page.getByText('Ada Lovelace').click();
    await expect(page).toHaveURL(/\/shell-cc\/page$/);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('the app title goes home to the app\'s own mount, not to the server root', async ({ page }) => {
    await page.goto('/shell/probe');
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    await page.getByRole('button', { name: 'Shell walk' }).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/shell$/);
    await expect(page.getByRole('navigation').getByRole('menuitem', { name: 'Probe', exact: true })).toBeVisible();
  });
});
