/**
 * Bridges between the Lit renderer and the AMD-loaded Oracle JET / Spectra runtime.
 *
 * oj-bootstrap.ts loads every module up-front and stashes the useful exports on
 * `window.__mateuOj`; these helpers read that stash so the rendering modules stay
 * synchronous (Lit templates can't await).
 */

export const ojReady = (): boolean => window.__mateuOj?.ready === true

/** The ArrayDataProvider class (JET 19 exports it as the module value of
 * ojs/ojarraydataprovider). Used for selects, tables, list views and tab bars. */
export const arrayDataProvider = (rows: unknown[], keyAttributes: string | string[]): unknown => {
  const ADP = window.__mateuOj?.ArrayDataProvider
  if (!ADP) return undefined
  return new ADP(rows, { keyAttributes })
}

/** oj-c (preact VComponents) need a binding provider in scope. In the main document the <body>
 * carries it; inside foreign shadow roots (mateu-content-header, mateu-dialog…) we must stamp
 * the attribute on an in-shadow ancestor ourselves. */
export const BINDING_PROVIDER_ATTR = 'data-oj-binding-provider'

const JET_BASE = 'https://static.oracle.com/cdn/jet/19.0.0-2604.8'

/** The two runtime stylesheets the oj-c components auto-load into the main document via
 * require-css. CSS custom properties inherit across shadow boundaries, but CLASS selectors do
 * not — so any shadow root that hosts oj-c markup needs these links injected into itself. */
const SHADOW_CSS = [
  `${JET_BASE}/default/js/min/ojpreactbundle.css`,
  `https://static.oracle.com/cdn/jet/packs/oj-c/19.0.0-2604.8/min/corepackbundle.css`,
]

/** Idempotently inject the oj-c runtime stylesheets into the shadow root that owns `el`
 * (no-op in the main document). Used by templates that render oj-c components inside shared
 * Mateu hosts with shadow roots (content header toolbar buttons, peer nav…). */
export const injectOjStylesIntoShadow = (el: Element): void => {
  const root = el.getRootNode()
  if (!(root instanceof ShadowRoot)) return
  injectOjStylesIntoShadowRoot(root)
}

const injectOjStylesIntoShadowRoot = (root: ShadowRoot): void => {
  for (const href of SHADOW_CSS) {
    const id = 'mateu-ojcss-' + href.split('/').pop()
    if (!root.getElementById(id)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.id = id
      link.href = href
      root.prepend(link)
    }
  }
  // mateu-content-header's .form-header is width:100% with no right gutter, so the trailing
  // toolbar buttons are clipped by the viewport edge; give the shadow host a small right pad.
  // The shared header also renders Page.kpis as bare divs — dress them as Redwood metrics
  // (small secondary label over a bold ink value).
  if (!root.getElementById('mateu-oj-shadow-fixes')) {
    const style = document.createElement('style')
    style.id = 'mateu-oj-shadow-fixes'
    style.textContent = `
      .form-header { box-sizing: border-box; padding-right: 12px; }
      .form-header > div:last-child > div > div:first-child { font-size: 0.75rem; color: #6b6660; }
      .form-header > div:last-child > div > div:last-child { font-size: 1.25rem; font-weight: 700; color: #161513; }`
    root.append(style)
  }
}

/** Deep-find every mateu-content-header (they live inside mateu-page/mateu-ux shadow roots) and
 * inject the oj-c styles + shadow fixes. Called from renderer hooks AT CALL TIME: the header
 * element already exists in the DOM while its render() runs our hook. We cannot rely on lit's
 * ref directive here because the monorepo loads multiple lit instances and a directive class
 * from one instance is not honoured by a template rendered through the other. Some pages render
 * their fields BEFORE the header element exists, so every call also schedules a deferred pass
 * (rAF + short timeout, deduped) that lands once the whole page has rendered. */
let headerStylingScheduled = false

export const injectOjStylesIntoContentHeaders = (): void => {
  const visit = (root: ParentNode): void => {
    for (const el of root.querySelectorAll('*')) {
      if (el.tagName.toLowerCase() === 'mateu-content-header' && el.shadowRoot) {
        injectOjStylesIntoShadowRoot(el.shadowRoot)
      }
      if (el.shadowRoot) visit(el.shadowRoot)
    }
  }
  visit(document)
  if (!headerStylingScheduled) {
    headerStylingScheduled = true
    const again = () => visit(document)
    requestAnimationFrame(() => { again(); headerStylingScheduled = false })
    setTimeout(again, 400)
  }
}

/** Dispatch the Mateu field contract event. mateu-component listens for it (bubbling, composed)
 * and writes state[fieldId] = value. */
export const dispatchValueChanged = (from: Element, fieldId: string, value: unknown): void => {
  from.dispatchEvent(new CustomEvent('value-changed', {
    detail: { fieldId, value },
    bubbles: true,
    composed: true,
  }))
}

/** Dispatch the Mateu action contract event (buttons, row actions, card actions…). */
export const dispatchActionRequested = (from: Element, actionId: string, parameters?: Record<string, unknown>): void => {
  from.dispatchEvent(new CustomEvent('action-requested', {
    detail: { actionId, parameters },
    bubbles: true,
    composed: true,
  }))
}
