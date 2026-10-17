import { APIRequestContext, BrowserContext, Page, expect } from '@playwright/test';

/**
 * Shared helpers of the journeys (tests/journeys, Playwright project `journeys`, mvc-app1 only).
 * Not a spec: the project matches *.spec.ts only.
 */

/** Puts the journey fixtures' in-memory data back to its seed (JourneysReset in mvc-app1). */
export async function resetFixtures(request: APIRequestContext) {
  const res = await request.post('/j-reset')
  expect(res.ok()).toBeTruthy()
}

/**
 * Makes the browser one role or another: CookieRolesPrincipalResolver (mvc-app1, TEST-ONLY) reads
 * the caller's roles from this cookie. No cookie = anonymous.
 */
export async function actAs(context: BrowserContext, baseURL: string | undefined, ...roles: string[]) {
  await context.addCookies([{ name: 'mateu-e2e-roles', value: roles.join(','), url: baseURL ?? 'http://localhost:8080' }])
}

/** The text of every cell of every visible data row of the first vaadin-grid, row by row. */
export const gridRows = (page: Page) =>
  page.evaluate(() => {
    const grids: Element[] = []
    ;(function find(root: Document | ShadowRoot) {
      for (const el of Array.from(root.querySelectorAll('*'))) {
        if (el.tagName === 'VAADIN-GRID') grids.push(el)
        if ((el as HTMLElement).shadowRoot) find((el as HTMLElement).shadowRoot!)
      }
    })(document)
    const grid = grids[0] as HTMLElement | undefined
    if (!grid?.shadowRoot) return [] as string[][]
    return Array.from(grid.shadowRoot.querySelectorAll('tbody#items tr'))
      .filter(tr => !(tr as HTMLElement).hidden)
      .map(tr => Array.from(tr.querySelectorAll('td slot')).map(slot =>
        ((slot as HTMLSlotElement).assignedElements()[0]?.textContent ?? '').trim()))
  })

/** Every POST the page sends, url + body, as it sends them. */
export function posts(page: Page) {
  const seen: { url: string, body: string }[] = []
  page.on('request', r => { if (r.method() === 'POST') seen.push({ url: r.url(), body: r.postData() ?? '' }) })
  return seen
}

/** The header labels of the first vaadin-grid, in the order shown (hidden columns excluded). */
export const gridHeaders = (page: Page) =>
  page.evaluate(() => {
    const grids: Element[] = []
    ;(function find(root: Document | ShadowRoot) {
      for (const el of Array.from(root.querySelectorAll('*'))) {
        if (el.tagName === 'VAADIN-GRID') grids.push(el)
        if ((el as HTMLElement).shadowRoot) find((el as HTMLElement).shadowRoot!)
      }
    })(document)
    const grid = grids[0] as HTMLElement | undefined
    return Array.from(grid?.shadowRoot?.querySelectorAll('thead tr:last-child th') ?? [])
      .filter(th => !(th as HTMLElement).hidden)
      .map(th => ((th.querySelector('slot') as HTMLSlotElement | null)?.assignedElements()[0]?.textContent ?? '').trim())
      .filter(Boolean)
  })
