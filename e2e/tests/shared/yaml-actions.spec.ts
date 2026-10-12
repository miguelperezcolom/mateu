import { test, expect, Page, Request } from '@playwright/test';

// Actions authored as DATA (design/walkthrough/actions.md): a definition-only page, no view model —
// e2e/sut/modules/sample1/src/main/resources/specs/ui/yaml-actions.yaml + walk-actions.yaml.

const box = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true })
const btn = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

const posts = (page: Page) => {
  const seen: { url: string, body: string }[] = []
  page.on('request', (r: Request) => {
    if (r.method() === 'POST') seen.push({ url: r.url(), body: r.postData() ?? '' })
  })
  return seen
}

async function open(page: Page) {
  await page.goto('/yaml-actions')
  await expect(page.getByRole('heading', { name: 'YAML actions' }).first()).toBeVisible()
}

test.describe('YAML actions (/yaml-actions)', () => {

  test('a direct restAction is fetched by the browser and merged into the form', async ({ page }) => {
    const sent = posts(page)
    await open(page)
    await box(page, 'Zip').fill('28001')
    const fetched = page.waitForRequest(r => r.url().includes('/rest-action-demo.json?zip=28001'))
    await btn(page, 'Look up directly').click()
    await fetched
    await expect(box(page, 'Street')).not.toHaveValue('')
    await expect(page.getByText('Address found').first()).toBeVisible()
    // no server round trip for it
    expect(sent.filter(s => s.body.includes('lookupDirect'))).toEqual([])
  })

  test('a proxied restAction goes through the server: the browser never sees the url or the secret', async ({ page }) => {
    const direct: string[] = []
    page.on('request', r => { if (r.url().includes('127.0.0.1:9')) direct.push(r.url()) })
    const sent = posts(page)
    await open(page)
    await btn(page, 'Look up through the server').click()
    await expect.poll(() => sent.filter(s => s.body.includes('__restfetch__')).length).toBeGreaterThan(0)
    expect(direct).toEqual([])
    expect(sent.map(s => s.body).join('\n')).not.toContain('secret')
    expect(sent.map(s => s.body).join('\n')).not.toContain('127.0.0.1:9')
    // the upstream is unreachable on purpose: the user is told, the success message never shows
    await expect(page.getByRole('alert').filter({ hasText: 'Request failed' }).first()).toBeAttached()
    await expect(page.getByText('Should not happen')).toHaveCount(0)
  })

  test('a flow of steps runs in the browser, with no server round trip', async ({ page }) => {
    await open(page)
    const sent = posts(page)
    await btn(page, 'Run a flow').click()
    await expect(page).toHaveURL(/\/fluent-counter$/)
    expect(sent.filter(s => s.body.includes('localFlow'))).toEqual([])
  })

  test('an id the page does not declare runs from the action catalogue', async ({ page }) => {
    await open(page)
    const sent = posts(page)
    await btn(page, 'Catalogue flow').click()
    await expect(page).toHaveURL(/\/fluent-counter$/)
    expect(sent.filter(s => s.body.includes('walkCatalogueFlow'))).toEqual([])
  })

  test('owner first: the page own action wins over the catalogue entry of the same id', async ({ page }) => {
    await open(page)
    await btn(page, 'Owner first').click()
    await expect(page).toHaveURL(/\/overlay-lab$/)
  })
})
