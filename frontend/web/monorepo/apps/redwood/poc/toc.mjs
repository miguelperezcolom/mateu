// STICKY SECTIONS INDEX (@Toc): the right-hand index of a long sectioned page — one entry per titled
// @Section, click to scroll there, the one in view highlighted (scrollspy), Ctrl+Alt+1..9 jump to the
// first nine. Same rule as libs/mateu mateu-page.ts: the Page's `toc` is tri-state — true forces it,
// false suppresses it, absent = AUTO (more than 4 titled sections and not a @Zones form). Redwood's
// Vaadin renderer has had it for months; here the shell painted nothing (walkthrough forms ❌).
//
// Two halves, like the calendar's: `tocOf(host)` is the pure projection the page chains assign
// (mateuToc); `installToc(doc, win)` wires the DOM once per document — the entries are stamped by VB
// from the variable, the sections are found in the DOM by the `data-mateu-section` marker both
// painters set (the content's section cards, the generic form's .mateu-form-section), in order.
import { isSectionNode, sectionHeadOf, findByType } from './reduceContexts.mjs'
import { chromeText } from './i18n.mjs'

export const TOC_AUTO_MIN_SECTIONS = 5
export const TOC_EMPTY = { on: false, entries: [], cls: '' }
export const TOC_CLASS = 'mateu-has-toc'

/** Is this the @Zones row (a HorizontalLayout of flex-basis columns)? A horizontal form has no index. */
function isZonedRow(n) {
  if (!n || !n.metadata || n.metadata.type !== 'HorizontalLayout') return false
  const kids = n.children || []
  return kids.length >= 2 && kids.every((k) => /flex:\s*1 1 calc\(/.test(String((k && k.style) || '')))
}

/** The projection of the index for a host context: { on, entries: [{ index, title, key, hint, sticky }], cls }. */
export function tocOf(host) {
  const tree = host && host.tree
  if (!tree) return TOC_EMPTY
  const entries = []
  let zoned = false
  const walk = (n, isRoot) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach((x) => walk(x, false)); return }
    if (!isRoot && n.type === 'ServerSide') return // another surface's sections are its own
    if (isZonedRow(n)) zoned = true
    if (isSectionNode(n)) {
      const title = String(sectionHeadOf(n).title || '').trim()
      if (title) {
        const index = entries.length
        entries.push({
          index,
          title,
          key: index < 9 ? String(index + 1) : '',
          hint: index < 9 ? title + ' (Ctrl+Alt+' + (index + 1) + ')' : title,
          sticky: /(^|\s)mateu-section--sticky(\s|$)/.test(String(n.cssClasses || '')),
        })
      }
    }
    for (const [k, v] of Object.entries(n)) {
      if (k === 'metadata') { for (const mv of Object.values(n.metadata || {})) if (mv && typeof mv === 'object') walk(mv, false) }
      else if (v && typeof v === 'object') walk(v, false)
    }
  }
  walk(tree, true)
  const page = findByType(tree, 'Page')
  const declared = page && page.metadata ? page.metadata.toc : null
  const auto = entries.length >= TOC_AUTO_MIN_SECTIONS && !zoned
  const on = (declared === true ? true : declared === false ? false : auto) && entries.length > 0
  return { on, entries: on ? entries : [], cls: on ? TOC_CLASS : '' }
}

// ── DOM behaviour (once per document) ────────────────────────────────────────────────────────────

/** The painted sections, in document order: what the index's entries point at (same order). */
export function tocSectionsOf(doc) {
  return [...doc.querySelectorAll('[data-mateu-section]')]
    .filter((el) => String(el.getAttribute('data-mateu-section') || '').trim() !== '')
}

/** Where the reading line is: just under what is pinned at the top (a sticky record header), plus air. */
export function tocReadingLine(doc) {
  const pinned = doc.querySelector('.mateu-sticky-header')
  const bottom = pinned ? pinned.getBoundingClientRect().bottom : 0
  return Math.max(0, bottom) + 16
}

/** The active section for a scroll position: the last one whose top is at or above the reading line. */
export function tocActiveIndex(tops, readingLine) {
  let active = 0
  tops.forEach((top, i) => { if (top <= readingLine + 8) active = i })
  return active
}

export function installToc(doc = typeof document !== 'undefined' ? document : null, win = doc && doc.defaultView) {
  if (!doc || doc.__mateuToc) return
  doc.__mateuToc = true
  let locked = -1 // the entry clicked / jumped to stays highlighted until the user scrolls by hand
  const items = () => [...doc.querySelectorAll('.mateu-toc-item')]
  const mark = (active) => {
    for (const item of items()) {
      const on = Number(item.getAttribute('data-toc-index')) === active
      item.classList.toggle('is-active', on)
      if (on) item.setAttribute('aria-current', 'true')
      else item.removeAttribute('aria-current')
    }
  }
  const jumpTo = (index) => {
    const section = tocSectionsOf(doc)[index]
    if (!section) return false
    const delta = section.getBoundingClientRect().top - tocReadingLine(doc)
    if (win && typeof win.scrollBy === 'function') win.scrollBy({ top: delta, behavior: 'smooth' })
    locked = index
    mark(index)
    return true
  }
  const spy = () => {
    if (!items().length) return
    if (locked >= 0) { mark(locked); return }
    const tops = tocSectionsOf(doc).map((el) => el.getBoundingClientRect().top)
    if (tops.length) mark(tocActiveIndex(tops, tocReadingLine(doc)))
  }
  // a click on an entry: the anchor must not navigate (href="#" would reboot VB's router, see the calendar)
  doc.addEventListener('click', (e) => {
    const item = e.target && e.target.closest && e.target.closest('.mateu-toc-item')
    if (!item) return
    e.preventDefault()
    e.stopPropagation()
    jumpTo(Number(item.getAttribute('data-toc-index')))
  }, true)
  // Ctrl+Alt+1..9 (by physical key: Digit/Numpad, layout-independent) while an index is shown
  doc.addEventListener('keydown', (e) => {
    if (!e.ctrlKey || !e.altKey || e.shiftKey || e.metaKey) return
    const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code || '')
    if (!m || !items().length) return
    if (jumpTo(Number(m[1]) - 1)) e.preventDefault()
  }, true)
  // the user's own scroll gesture releases the lock, the spy follows the reading line again
  const unlock = () => { locked = -1 }
  if (win && typeof win.addEventListener === 'function') {
    for (const type of ['wheel', 'touchstart']) win.addEventListener(type, unlock, { passive: true })
    win.addEventListener('scroll', spy, { passive: true })
  }
  doc.addEventListener('keydown', (e) => { if (!(e.ctrlKey && e.altKey)) unlock() }, true)
  // a new screen: nothing locked, the first entry active (the entries are stamped after the chain)
  doc.addEventListener('mateu-toc-reset', () => { locked = -1; spy() })
}

/** A new screen: the index starts unlocked (the chains call it right after assigning mateuToc). */
export function resetToc(doc = typeof document !== 'undefined' ? document : null) {
  if (doc && typeof CustomEvent === 'function') doc.dispatchEvent(new CustomEvent('mateu-toc-reset'))
}

/** The index's accessible name (the shell binds the nls text; this is the JS side's). */
export const tocLabel = (lang) => chromeText('sections', {}, lang)
