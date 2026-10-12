import { test, expect, Page } from '@playwright/test';

// The app-shell walkthrough (design/walkthrough/app-shell.md), header half: ShellApp
// (@UI("/shell")) declares two @AppContext pickers (an enum and a searchable supplier with 12
// options), header actions (a button and a dropdown), a notification inbox, the ⌘K global search,
// the theme toggle and access keys. Every test acts like a user and fails on console errors.

function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => {
    const text = m.text();
    if (m.type() === 'error' || /no component on the page handles it/.test(text)) {
      problems.push(`[${m.type()}] ${text}`);
    }
  });
  page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
  return problems;
}

/** The toast an action answers with (the live region repeats it: first is enough). */
const toast = (page: Page, text: string | RegExp) => page.getByText(text).first();

test.describe('Shell header (/shell)', () => {

  test.beforeEach(async ({ page }) => {
    // the pickers persist their value per origin: start every test from an empty context
    await page.goto('/shell/probe');
    await page.evaluate(() => {
      localStorage.removeItem('mateu-app-context');
      localStorage.removeItem('mateu-app-context-labels');
      localStorage.removeItem('mateu-theme');
    });
  });

  test('an enum @AppContext picker fixes a value every screen reads, and it survives a reload', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell/probe');
    await page.getByRole('button', { name: /^Region/ }).click();
    await page.getByRole('option', { name: 'South' }).click();
    // a change reloads the page: wait for the screen to be back
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    await page.getByRole('button', { name: 'Where am i' }).click();
    await expect(toast(page, 'region=South hotel=null')).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: /^Region/ })).toContainText('South');
    expect(problems).toEqual([]);
  });

  test('a picker is operable from the keyboard alone', async ({ page }) => {
    await page.goto('/shell/probe');
    const region = page.getByRole('button', { name: /^Region/ });
    await region.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox', { name: 'Region' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'North' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'South' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Region: South' })).toBeVisible();
  });

  test('a picker with more than 7 options searches on the server', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell/probe');
    await page.getByRole('button', { name: /^Hotel/ }).click();
    await page.keyboard.type('bil');
    await page.getByRole('option', { name: 'Hotel Bilbao' }).click();
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Hotel/ })).toContainText('Hotel Bilbao');
    await page.getByRole('button', { name: 'Where am i' }).click();
    await expect(toast(page, 'hotel=h2')).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('a header action runs on the app whatever screen is below', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell/page');
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    await page.getByRole('button', { name: 'Sync', exact: true }).click();
    await expect(toast(page, 'synced null')).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('a dropdown header action runs the child picked', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell/probe');
    await page.getByText('Export').first().click();
    await page.getByRole('button', { name: 'As PDF' }).click();
    await expect(toast(page, 'exported pdf')).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('the notification inbox lists, navigates and marks as read', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell/page');
    await page.getByRole('button', { name: /^Notifications/ }).click();
    await expect(page.getByText('Booking confirmed')).toBeVisible();
    await expect(page.getByText('Payment failed')).toBeVisible();
    await page.getByText('Booking confirmed').click();
    await expect(page).toHaveURL(/\/shell\/probe$/);
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();

    // the inbox is server state shared by every run against this server: marking it read is only
    // offered while something is unread, and leaves the bell with no unread count
    await page.getByRole('button', { name: /^Notifications/ }).click();
    const markAll = page.getByRole('button', { name: 'Mark all read' });
    if (await markAll.isEnabled()) await markAll.click();
    await expect(page.getByRole('button', { name: 'Notifications', exact: true })).toBeVisible();
    await expect(markAll).toBeDisabled();
    expect(problems).toEqual([]);
  });

  test('⌘K finds the app\'s entities and opens one', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell/page');
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    await page.keyboard.press('ControlOrMeta+k');
    await page.keyboard.type('ada');
    await page.getByText('Ada Lovelace').click();
    await expect(page).toHaveURL(/\/shell\/probe$/);
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('⌘K also finds menu destinations', async ({ page }) => {
    await page.goto('/shell/probe');
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    await page.keyboard.press('ControlOrMeta+k');
    // typed straight after ⌘K, like a quick typist: no key may get lost on the way to the palette
    await page.keyboard.type('monthly');
    await expect(page.getByRole('textbox', { name: 'Go to…' })).toHaveValue('monthly');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/shell\/reports\/monthly$/);
  });

  test('the theme toggle switches to dark and the choice survives a reload', async ({ page }) => {
    await page.goto('/shell/probe');
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(page.locator('html')).toHaveAttribute('theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('theme', 'dark');
    await page.getByRole('button', { name: /Switch to light mode/ }).click();
    await expect(page.locator('html')).toHaveAttribute('theme', 'light');
  });

  test('holding Alt shows access keys and Alt+letter presses the button', async ({ page }) => {
    await page.goto('/shell/probe');
    const button = page.getByRole('button', { name: 'Where am i' });
    await expect(button).toBeVisible();
    await page.keyboard.down('Alt');
    await expect(page.locator('.mateu-access-keys span').first()).toBeVisible();
    // the badge of the button sits on its top-left corner
    const box = (await button.boundingBox())!;
    const letter = await page.evaluate(({ left, top }) => {
      for (const s of document.querySelectorAll<HTMLElement>('.mateu-access-keys span')) {
        if (Math.abs(parseFloat(s.style.left) - Math.max(0, left - 4)) < 2
            && Math.abs(parseFloat(s.style.top) - Math.max(0, top - 8)) < 2) return s.textContent;
      }
      return null;
    }, { left: box.x, top: box.y });
    expect(letter).toMatch(/^[A-Z0-9]$/);
    await page.keyboard.press(/[0-9]/.test(letter!) ? `Digit${letter}` : `Key${letter}`);
    await page.keyboard.up('Alt');
    await expect(toast(page, /region=/)).toBeVisible();
  });

  test('the shell has a skip link, a main landmark and the page title as window title', async ({ page }) => {
    await page.goto('/shell/probe');
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    await expect(page).toHaveTitle('Probe');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Skip to content' })).toBeFocused();

    await page.getByRole('navigation').getByRole('menuitem', { name: 'Page', exact: true }).click();
    await expect(page).toHaveTitle('Section 1');
  });
});

test.describe('Shell header in Spanish (/shell)', () => {
  test.use({ locale: 'es-ES' });

  test('the shell chrome follows the request language', async ({ page }) => {
    await page.goto('/shell/probe');
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cambiar a modo oscuro' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Notificaciones/ })).toBeVisible();
  });
});
