// One-shot SLDS crud-layout verification: loads each route on the SLDS static server,
// waits + settles, deep-scans ALL shadow roots for vaadin-* elements, captures console/page
// errors, and screenshots to the scratchpad sweep folder.
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:8613'
const OUT = '/private/tmp/claude-501/-Users-mguel-IdeaProjects-mateuv3/78148da3-1dc3-49cf-a4f8-8851c6907f8d/scratchpad/sweep/shots'
const ROUTES = [
  { path: '/products', shot: 'slds--products.png' },
  { path: '/reservations', shot: 'slds--reservations.png' },
  { path: '/checkin/3/v2', shot: 'slds--checkin_3_v2.png' },
]

const browser = await chromium.launch()
let failures = 0

for (const { path, shot } of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1360, height: 900 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))

  await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 })
  try {
    await page.waitForSelector('mateu-page, mateu-component', { timeout: 15000 })
  } catch {
    errors.push('mateu-page/mateu-component never appeared')
  }
  await page.waitForTimeout(4000)

  const scan = await page.evaluate(() => {
    // vaadin-* elements that are FIXED chrome in libs/mateu (out of bounds for the SLDS
    // renderer task): mateu-api-caller's loader wrapper + error notification, and
    // mateu-table-crud's always-present (closed) import vaadin-dialog. Everything else
    // (crud layouts, toolbar buttons, form/grid fields) must be vaadin-free.
    // ancestor test that hops shadow-root boundaries
    const hasDeepAncestor = (el, tags) => {
      let cur = el
      while (cur) {
        cur = cur.parentElement ?? cur.getRootNode?.()?.host ?? null
        if (cur && tags.includes(cur.tagName)) return true
      }
      return false
    }
    const isSharedChrome = (el) => {
      const t = el.tagName
      if ((t === 'VAADIN-VERTICAL-LAYOUT' || t === 'VAADIN-NOTIFICATION') && hasDeepAncestor(el, ['MATEU-API-CALLER'])) return true
      if (hasDeepAncestor(el, ['VAADIN-NOTIFICATION', 'VAADIN-NOTIFICATION-CARD'])) return true
      if ((t === 'VAADIN-DIALOG' || t === 'VAADIN-DIALOG-OVERLAY') && !el.opened
          && (hasDeepAncestor(el, ['MATEU-TABLE-CRUD', 'VAADIN-DIALOG']))) return true
      return false
    }
    const vaadinAll = new Set()
    const vaadinStrict = new Set()
    let sldsCount = 0
    const walk = (root) => {
      for (const el of root.querySelectorAll('*')) {
        if (el.tagName.startsWith('VAADIN-')) {
          vaadinAll.add(el.tagName)
          if (!isSharedChrome(el)) vaadinStrict.add(el.tagName)
        }
        if (el.classList && [...el.classList].some(c => c.startsWith('slds-'))) sldsCount++
        if (el.shadowRoot) walk(el.shadowRoot)
      }
    }
    walk(document)
    return {
      vaadin: [...vaadinStrict],
      vaadinChromeOnly: [...vaadinAll].filter(t => !vaadinStrict.has(t)),
      sldsCount,
      sldsCards: (() => { let n = 0; const w = (r) => { n += r.querySelectorAll('article.slds-card').length; for (const el of r.querySelectorAll('*')) if (el.shadowRoot) w(el.shadowRoot) }; w(document); return n })(),
      bodyTextLen: document.body.innerText.trim().length,
    }
  })

  await page.screenshot({ path: `${OUT}/${shot}`, fullPage: false })

  const bad = scan.vaadin.length > 0 || errors.length > 0 || scan.bodyTextLen < 20
  if (bad) failures++
  console.log(`\n=== ${path} ${bad ? 'FAIL' : 'OK'}`)
  console.log(`  vaadin elements (excl. libs/mateu fixed chrome): ${scan.vaadin.length ? scan.vaadin.join(', ') : 'NONE'}`)
  console.log(`  libs/mateu fixed chrome present: ${scan.vaadinChromeOnly.join(', ') || 'none'}`)
  console.log(`  slds-classed elements: ${scan.sldsCount}, slds-cards: ${scan.sldsCards}, bodyTextLen: ${scan.bodyTextLen}`)
  if (errors.length) console.log('  errors:\n    ' + errors.slice(0, 10).join('\n    '))
  await page.close()
}

await browser.close()
process.exit(failures ? 1 : 0)
