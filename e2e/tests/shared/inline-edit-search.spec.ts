import { test, expect, Page } from '@playwright/test';

// /inline-books (InlineBooksCrud, @InlineEditing): vaadin-grid RECYCLES its cell editors for the
// rows a search brings. On 3.0-beta.68 the recycled combo / date picker reported the NEXT row's
// value to the PREVIOUS row's commit, so searching "le guin" saved The Fellowship of the Ring as
// ScienceFiction — rows nobody touched. A search must send no update-row and change nothing
// stored; a real edit sends exactly one, for that row, naming the edited cell.
const updateRows = (page: Page) => {
  const sent: any[] = [];
  page.on('request', (r) => {
    if (!r.url().includes('/mateu/v3/') || r.method() !== 'POST') return;
    const body = JSON.parse(r.postData() || '{}');
    if (body.actionId === 'update-row') sent.push(body.parameters);
  });
  return sent;
};

const search = async (page: Page, text: string) => {
  const box = page.locator('mateu-filter-bar input.free-text');
  await box.click();
  await page.keyboard.press('Escape');
  await page.keyboard.type(text, { delay: 30 });
  await page.keyboard.press('Enter');
};

/** The genre each stored book has, read off the listing without editors. */
const storedGenres = async (page: Page) => {
  await page.goto('/inline-books-check');
  await expect(page.locator('vaadin-grid').getByText('The Hobbit').first()).toBeVisible();
  const texts = (await page.locator('vaadin-grid-cell-content').allInnerTexts()).map((t) => t.trim());
  return {
    fantasy: texts.filter((t) => t === 'Fantasy').length,
    sf: texts.filter((t) => t === 'Science fiction').length,
  };
};

test.describe('searching an inline-editing listing', () => {
  test.describe.configure({ mode: 'serial' });

  test('a search that changes the rows shown sends no update-row and stores nothing', async ({ page }) => {
    const before = await storedGenres(page);
    const sent = updateRows(page);
    await page.goto('/inline-books');
    await expect(page.locator('vaadin-grid vaadin-combo-box').first()).toBeVisible();
    for (const text of ['le guin', 'tolkien', '']) {
      await search(page, text);
      await page.waitForTimeout(1200);
    }
    expect(sent).toEqual([]);
    expect(await storedGenres(page)).toEqual(before);
  });

  test('a real edit after a search saves that row only, naming the edited cell', async ({ page }) => {
    const sent = updateRows(page);
    await page.goto('/inline-books');
    await expect(page.locator('vaadin-grid vaadin-combo-box').first()).toBeVisible();
    await search(page, 'le guin');
    // the first row now shows a Le Guin book: its editors are the recycled ones
    const firstTitle = page.locator('vaadin-grid vaadin-text-field').first();
    await expect.poll(() => firstTitle.evaluate((el: any) => el.value)).toMatch(/Earthsea|Left Hand/);
    const combo = page.locator('vaadin-grid vaadin-combo-box').first();
    const current = await combo.evaluate((el: any) => el.value);
    const target = current === 'Poetry' ? 'History' : 'Poetry';
    await combo.locator('input').click();
    await page.locator('vaadin-combo-box-item').filter({ hasText: target }).first().click();
    await expect.poll(() => sent.length).toBe(1);
    expect(sent[0]._editedField).toBe('genre');
    expect(sent[0]._editedRow.genre).toBe(target);
    expect(['B-003', 'B-004']).toContain(sent[0]._editedRow.id);
  });
});
