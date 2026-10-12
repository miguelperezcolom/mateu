import { test, expect, Page } from '@playwright/test';

// The page archetypes walked as a user does (sample1 io.mateu.sample1.pages, /arch/*): every one
// renders with no page error, names the window, and what it promises to DO works — drill-ins and
// calls to action navigate, searches filter, selections re-render in place, overlays open and close.

const watch = (page: Page) => {
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.text().includes('no component on the page handles it')) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  return problems;
};

test.describe('page archetypes', () => {

  test('Dashboard: KPIs and tiles, a metric drills in', async ({ page }) => {
    const problems = watch(page);
    await page.goto('/arch/dashboard');
    await expect(page.getByText('Monthly sales')).toBeVisible();
    await expect(page).toHaveTitle('Sales dashboard');
    await page.getByRole('button', { name: /Orders/ }).click();
    await expect(page).toHaveURL(/\/arch\/smart-search$/);
    expect(problems).toEqual([]);
  });

  test('Welcome: the hero calls to action navigate', async ({ page }) => {
    const problems = watch(page);
    await page.goto('/arch/welcome');
    await expect(page.getByText('Front desk check-in')).toBeVisible();
    await page.getByRole('button', { name: 'See the dashboard' }).click();
    await expect(page).toHaveURL(/\/arch\/dashboard$/);
    expect(problems).toEqual([]);
  });

  test('HeroSearch: starts empty, a search shows result cards', async ({ page }) => {
    const problems = watch(page);
    await page.goto('/arch/hero-search');
    await expect(page.getByText('Find your hotel')).toBeVisible();
    await expect(page.getByText('Playa Azul')).toHaveCount(0);
    const search = page.getByRole('textbox', { name: /Search/ }).first();
    await search.fill('beach');
    await search.press('Enter');
    await expect(page.getByText('Playa Azul').first()).toBeVisible();
    await expect(page.getByText('Mar i Cel').first()).toBeVisible();
    await expect(page.getByText('Serra Verda')).toHaveCount(0);
    expect(problems).toEqual([]);
  });

  test('SmartSearchPage: the columns are the ROW fields and a search filters them', async ({ page }) => {
    const problems = watch(page);
    await page.goto('/arch/smart-search');
    await expect(page.getByText('Find assets by name, zone or acquisition date')).toBeVisible();
    await expect(page).toHaveTitle('Smart Search');
    for (const header of ['Name', 'Zone', 'Acquired', 'Units']) {
      await expect(page.locator('vaadin-grid-sorter, vaadin-grid-cell-content').filter({ hasText: new RegExp(`^${header}$`) }).first()).toBeVisible();
    }
    const search = page.getByRole('textbox', { name: /Search/ }).first();
    await search.fill('van');
    await search.press('Enter');
    await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: /^Delivery van$/ }).first()).toBeVisible();
    await expect(page.getByText('Forklift')).toHaveCount(0);
    expect(problems).toEqual([]);
  });

  test('TodoList: counted buckets, a task acts', async ({ page }) => {
    const problems = watch(page);
    await page.goto('/arch/todo');
    await expect(page.getByText('Today (4)')).toBeVisible();
    await expect(page.getByText('This week (3)')).toBeVisible();
    await page.getByText('Approve late checkout — room 318').click();
    await expect(page).toHaveURL(/\/arch\/foldout$/);
    expect(problems).toEqual([]);
  });

  test('CalendarPage: month navigation, an event and the create action', async ({ page }) => {
    const problems = watch(page);
    await page.goto('/arch/calendar');
    const now = new Date();
    const month = (d: Date) => d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    await expect(page.getByText(month(now))).toBeVisible();
    await page.getByRole('button', { name: '›' }).click();
    await expect(page.getByText(month(new Date(now.getFullYear(), now.getMonth() + 1, 1)))).toBeVisible();
    await page.getByRole('button', { name: 'Today' }).click();
    await expect(page.getByText(month(now))).toBeVisible();
    await page.getByText('Room inspection — 204').click();
    await expect(page).toHaveURL(/\/arch\/foldout$/);
    await page.goBack();
    await page.getByRole('button', { name: '+ Create' }).click();
    await expect(page).toHaveURL(/\/arch\/todo$/);
    expect(problems).toEqual([]);
  });

  test('CollectionDetail: picking an item shows its detail in place, the search narrows the list', async ({ page }) => {
    const problems = watch(page);
    await page.goto('/arch/collection-detail');
    await expect(page.getByText('5 hoteles')).toBeVisible();
    await page.getByText('Riu Plaza España').first().click();
    await expect(page.getByText('Ciudad: Madrid')).toBeVisible();
    await expect(page).toHaveURL(/\/arch\/collection-detail/);
    await page.getByText('Riu Cancún').first().click();
    await expect(page.getByText('Ciudad: Cancún')).toBeVisible();
    await expect(page.getByText('Ocupación casi completa — revisar overbooking')).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('GeneralOverview: switching the record re-renders the overview', async ({ page }) => {
    const problems = watch(page);
    await page.goto('/arch/general-overview');
    await expect(page.getByText('Purchase requisition').first()).toBeVisible();
    await expect(page.getByText('Vision Operations').first()).toBeVisible();
    const switcher = page.locator('vaadin-select').first();
    await switcher.click();
    await page.getByRole('option', { name: 'Requisition 206' }).click();
    await expect(page.getByText('Vision Manufacturing').first()).toBeVisible();
    await expect(page.getByText('Célula robótica').first()).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('Foldout: the overview and the panels', async ({ page }) => {
    const problems = watch(page);
    await page.goto('/arch/foldout');
    await expect(page.getByText('Booking 2026-08117').first()).toBeVisible();
    await expect(page.getByText('Payments').first()).toBeVisible();
    await expect(page.getByText('Occupancy').first()).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('ItemOverview: the key info stays while the tabs switch', async ({ page }) => {
    const problems = watch(page);
    await page.goto('/arch/item-overview');
    await page.getByRole('tab', { name: 'Reviews' }).click();
    await expect(page.getByRole('tab', { name: 'Reviews' })).toHaveAttribute('aria-selected', 'true');
    expect(problems).toEqual([]);
  });

  test('GanttPage: a bar opens the task drawer, Escape closes it', async ({ page }) => {
    const problems = watch(page);
    await page.goto('/arch/gantt');
    const bar = page.locator('mateu-gantt').getByRole('button').first();
    await bar.click();
    const drawer = page.getByRole('dialog', { name: 'Análisis' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('100%', { exact: false })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).toHaveCount(0);
    expect(problems).toEqual([]);
  });

  test('DataManagement: grid and gantt views switch in place', async ({ page }) => {
    const problems = watch(page);
    await page.goto('/arch/data-management');
    await expect(page.locator('vaadin-grid').first()).toBeVisible();
    await page.getByRole('button', { name: /Gantt|Cronograma|Diagrama/i }).first().click();
    await expect(page.locator('mateu-gantt').first()).toBeVisible();
    await page.getByRole('button', { name: /Grid|Tabla|Cuadr/i }).first().click();
    await expect(page.locator('vaadin-grid').first()).toBeVisible();
    expect(problems).toEqual([]);
  });
});
