import { test, expect, Page } from '@playwright/test';

// The forms walkthrough (design/walkthrough/forms.md): every input a form can show is EDITED in the
// browser and the server's echo of what it received is read back. A widget that displays one value
// and commits another — or a value the server cannot coerce, which silently leaves the field at its
// initializer — shows up as a wrong echo instead of a green "it renders". Runs on every adapter.

const field = (page: Page, id: string) => page.locator(`mateu-field#${id}`);

async function echo(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Echo' }).click();
  const toast = page.locator('vaadin-notification-card').filter({ hasText: 'echo:' }).last();
  await expect(toast).toBeVisible();
  return (await toast.innerText()).replace(/\s+/g, ' ');
}

test.describe('FieldsWalkForm (/walk-fields) — every basic type and input stereotype', () => {

  test('the initial values round-trip untouched', async ({ page }) => {
    await page.goto('/walk-fields');
    const text = await echo(page);
    expect(text).toContain('text=hello');
    expect(text).toContain('count=3 boxedCount=null big=10 ratio=1.5 price=9.99');
    expect(text).toContain('total=EUR/25.5 date=2026-01-15 time=10:30 when=2026-01-15T10:30');
    expect(text).toContain('size=MEDIUM phase=CHECK_IN phases=[BOOKED] color=#ff0000 rating=3 level=50');
  });

  test('a colour field shows the colour it holds', async ({ page }) => {
    // the <input type=color> had no value binding: every colour was painted black
    await page.goto('/walk-fields');
    await expect(field(page, 'color').locator('input[type=color]')).toHaveValue('#ff0000');
  });

  test('an enum shows humanized labels, @Label first', async ({ page }) => {
    await page.goto('/walk-fields');
    await expect(field(page, 'phase').locator('vaadin-select')).toContainText('Arrived');
    await field(page, 'phase').locator('vaadin-select').click();
    await expect(page.getByRole('option', { name: 'Check out' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'No show' })).toBeVisible();
  });

  test('every edited value reaches the server as typed', async ({ page }) => {
    await page.goto('/walk-fields');
    await field(page, 'text').locator('input').fill('world');
    await field(page, 'notes').locator('textarea').fill('l1\nl2');
    await field(page, 'email').locator('input').fill('x@y.org');
    await field(page, 'secret').locator('input').fill('pw2');
    await field(page, 'count').locator('input').fill('7');
    await field(page, 'boxedCount').locator('input').fill('42');
    await field(page, 'big').locator('input').fill('123456789012');
    await field(page, 'ratio').locator('input').fill('2.25');
    await field(page, 'price').locator('input').fill('19.95');
    await field(page, 'fee').locator('input').fill('7');
    await page.locator('mateu-money-field#total vaadin-number-field input').fill('30');
    const date = field(page, 'date').locator('input');
    await date.fill('2/20/2026');
    await date.press('Enter');
    const time = field(page, 'time').locator('input');
    await time.fill('11:45');
    await time.press('Enter');
    const whenDate = field(page, 'when').locator('vaadin-date-picker input');
    await whenDate.fill('3/1/2026');
    await whenDate.press('Enter');
    const whenTime = field(page, 'when').locator('vaadin-time-picker input');
    await whenTime.fill('09:15');
    await whenTime.press('Enter');
    await field(page, 'active').locator('vaadin-checkbox').click();
    await field(page, 'enabled').locator('.track').click();
    await field(page, 'size').locator('vaadin-select').click();
    await page.getByRole('option', { name: 'Large' }).click();
    await field(page, 'phase').locator('vaadin-select').click();
    await page.getByRole('option', { name: 'Check out' }).click();
    await field(page, 'color').locator('input[type=color]').evaluate((el: HTMLInputElement) => {
      el.value = '#00ff00';
      el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    });
    await field(page, 'rating').locator('vaadin-icon').nth(4).click();
    await field(page, 'level').locator('input[type=range]').evaluate((el: HTMLInputElement) => {
      el.value = '80';
      el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    });
    await page.getByRole('heading', { name: 'Fields walk' }).click();

    const text = await echo(page);
    expect(text).toContain('text=world notes=l1 l2 email=x@y.org secret=pw2');
    expect(text).toContain('count=7 boxedCount=42 big=123456789012 ratio=2.25 price=19.95 fee=7');
    expect(text).toContain('total=EUR/30.0 date=2026-02-20 time=11:45 when=2026-03-01T09:15');
    expect(text).toContain('active=true enabled=true size=LARGE phase=CHECK_OUT');
    expect(text).toContain('color=#00ff00 rating=5 level=80');
  });

  test('clearing a field clears it on the server — a primitive becomes zero, never its old value', async ({ page }) => {
    // a cleared int was committed as null, the server could not write null into it and kept the
    // initializer: the screen showed an empty field while the server still had 3
    await page.goto('/walk-fields');
    for (const id of ['text', 'count', 'big', 'ratio', 'price']) {
      await field(page, id).locator('input').fill('');
    }
    const date = field(page, 'date').locator('input');
    await date.fill('');
    await date.press('Enter');
    await page.getByRole('heading', { name: 'Fields walk' }).click();

    const text = await echo(page);
    expect(text).toContain('text= ');
    expect(text).toContain('count=0 boxedCount=null big=0 ratio=0.0 price=null');
    expect(text).toContain('date=null');
  });
});

test.describe('SpecialFieldsWalkForm (/walk-special) — choices, captures and presentations', () => {

  test('the initial values round-trip, and a lookup shows its label, not the id', async ({ page }) => {
    await page.goto('/walk-special');
    await expect(field(page, 'supplier').locator('vaadin-combo-box input')).toHaveValue('Acme');
    const text = await echo(page);
    expect(text).toContain('supplier=a2 zone=mca amenities=[WIFI] extras=[POOL]');
    expect(text).toContain('code=R-001 locked=cannot edit vip=true');
  });

  test('a view supplying options for one field leaves the enum choices alone', async ({ page }) => {
    // supports() was ignored on forms: the tree's countries replaced every enum's constants
    await page.goto('/walk-special');
    await expect(field(page, 'amenities').getByText('Spa')).toBeVisible();
    await expect(field(page, 'amenities').getByText('Spain')).toHaveCount(0);
    await expect(field(page, 'amenities').locator('vaadin-checkbox[checked]')).toHaveCount(1);
  });

  test('every choice and capture reaches the server', async ({ page }) => {
    await page.goto('/walk-special');
    await field(page, 'supplier').locator('vaadin-combo-box input').fill('bet');
    await page.getByRole('option', { name: 'Beta' }).click();
    await field(page, 'zone').locator('mateu-vaadin-tree-select').click();
    await page.getByText('Menorca').first().click();
    await field(page, 'amenities').getByText('Spa').click();
    await field(page, 'extras').getByText('Pool').click();
    await field(page, 'avatar').locator('input[type=file]').setInputFiles({
      name: 'a.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgo=', 'base64'),
    });
    await field(page, 'attachment').locator('input[type=file]').setInputFiles({
      name: 'b.csv', mimeType: 'text/csv', buffer: Buffer.from('a,b\n1,2'),
    });
    const canvas = field(page, 'signature').locator('canvas');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + 20, box!.y + 20);
    await page.mouse.down();
    await page.mouse.move(box!.x + 120, box!.y + 80, { steps: 5 });
    await page.mouse.up();
    await field(page, 'signature').getByRole('button', { name: 'Accept' }).click();

    const text = await echo(page);
    expect(text).toContain('supplier=b1 zone=men amenities=[WIFI, SPA] extras=[]');
    expect(text).toContain('avatar=data:image/png; signature=data:image/png; attachment=data:text/csv;n');
  });

  test('presentations render read-only: plain text, badge, bulleted list, notice', async ({ page }) => {
    await page.goto('/walk-special');
    await expect(page.getByText('R-001')).toBeVisible();
    await expect(page.getByText('Quiet room')).toBeVisible();
    await expect(page.getByText('2 pending complaints')).toBeVisible();
    await expect(field(page, 'locked').locator('input')).toHaveCount(0);
  });
});

test.describe('ValidationForm (/validation) — bean validation on both legs', () => {

  test('the client refuses the action and marks the fields; no request is sent', async ({ page }) => {
    await page.goto('/validation');
    await expect(page.getByRole('button', { name: 'Validate' })).toBeVisible();
    const posts: string[] = [];
    page.on('request', (r) => { if (r.method() === 'POST') posts.push(r.postData() ?? ''); });
    await page.getByRole('button', { name: 'Validate' }).click();
    await expect(page.locator('vaadin-notification-card').filter({ hasText: 'There are validation errors' })).toBeVisible();
    await expect(page.locator('vaadin-text-field#requiredText[invalid]')).toBeVisible();
    expect(posts.filter((p) => p.includes('"actionId":"validate"'))).toEqual([]);
  });

  test('the server refuses a request that skipped the client check', async ({ request }) => {
    // a tampered (or non-validating) client used to reach the action with whatever it sent
    const res = await request.post('/validation/mateu/v3/sync/_no_route', {
      data: {
        serverSideType: 'io.mateu.sample1.ValidationForm',
        route: '',
        actionId: 'validate',
        componentState: { requiredText: '', rangedInt: 500, positiveDouble: 1 },
      },
    });
    const body = await res.json();
    const text = JSON.stringify(body.messages);
    expect(text).toContain('There are validation errors');
    expect(text).toContain('Required text: Cannot be empty');
    expect(text).toContain('Ranged int: Must be at most 100');
    expect(text).not.toContain('Valid!');
  });

  test('a valid request runs the action', async ({ request }) => {
    const res = await request.post('/validation/mateu/v3/sync/_no_route', {
      data: {
        serverSideType: 'io.mateu.sample1.ValidationForm',
        route: '',
        actionId: 'validate',
        componentState: { requiredText: 'x', requiredDate: '2026-01-02', rangedInt: 50, positiveDouble: 0 },
      },
    });
    expect(JSON.stringify((await res.json()).messages)).toContain('Valid!');
  });
});
