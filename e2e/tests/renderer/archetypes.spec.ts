import { test, expect } from '@playwright/test';

/**
 * The page archetypes on any renderer (sample1 /arch/*): semantic assertions only, so the same
 * file runs on Vaadin and VB/Redwood. On Redwood a composed page used to show «…» for a title, a
 * HeroSearch lost its hero and every page holding a hero or a task queue lost its other content.
 */

const T = 20000;

test.describe('page archetypes, on any renderer', () => {
  test('a composed page is titled by its @Title', async ({ page }) => {
    await page.goto('/arch/dashboard');
    await expect(page).toHaveTitle('Sales dashboard', { timeout: T });
    await expect(page.getByText('Monthly sales').first()).toBeVisible({ timeout: T });
  });

  test('Welcome: a call to action navigates', async ({ page }) => {
    await page.goto('/arch/welcome');
    await page.getByRole('button', { name: 'See the dashboard' }).click({ timeout: T });
    await expect(page).toHaveURL(/\/arch\/dashboard$/, { timeout: T });
  });

  test('HeroSearch: the hero is there', async ({ page }) => {
    await page.goto('/arch/hero-search');
    await expect(page.getByText('Find your hotel').first()).toBeVisible({ timeout: T });
  });

  test('TodoList: a task acts', async ({ page }) => {
    await page.goto('/arch/todo');
    await page.getByText('Approve late checkout — room 318').click({ timeout: T });
    await expect(page).toHaveURL(/\/arch\/foldout$/, { timeout: T });
  });

  test('CollectionDetail: picking an item shows its detail', async ({ page }) => {
    await page.goto('/arch/collection-detail');
    await page.getByText('Riu Plaza España').first().click({ timeout: T });
    await expect(page.getByText('Ciudad: Madrid')).toBeVisible({ timeout: T });
  });

  test('CalendarPage: the next month', async ({ page }) => {
    await page.goto('/arch/calendar');
    await page.getByRole('button', { name: '›' }).first().click({ timeout: T });
    const next = new Date();
    next.setMonth(next.getMonth() + 1, 1);
    await expect(page.getByText(next.toLocaleString('en-US', { month: 'long', year: 'numeric' })).first())
      .toBeVisible({ timeout: T });
  });
});
