// SECTIONS INDEX (@Toc): the right-hand index of a long sectioned page — one entry per titled @Section,
// click / Enter to scroll there, the one in view selected (scrollspy), Ctrl+Alt+1..9 jump to the first
// nine. It is drawn as Spectra's vertical anchor navigator (its markup, classes and keyboard: a
// role=tablist, arrows move between entries, the selected one `anchor-item-selected` + aria-selected; on
// md-down a "Sections" button opens the list in an oj-popup) — see main-start-page.html for why it is
// not the oj-sp component itself. Same rule as libs/mateu mateu-page.ts: the Page's `toc` is tri-state — true forces it,
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

/** Is this a content page with a detail slot (@Aside → ContentLayout: a grid with an `aside` area)? */
function hasAside(n) {
  const areas = n?.metadata?.type === 'ResponsiveGrid' ? String(n.metadata.gridTemplateAreas || '') : ''
  return /(^|[\s"'])aside([\s"']|$)/.test(areas)
}

/** The projection of the index for a host context: { on, entries: [{ index, title, key, hint, sticky, tabIndex }], cls }. */
export function tocOf(host) {
  const tree = host && host.tree
  if (!tree) return TOC_EMPTY
  const entries = []
  let zoned = false
  // Redwood's Advanced create and edit: the anchor navigator and the detail slot exclude each other —
  // a page with an @Aside detail slot never shows the index, declared or not
  let aside = false
  const walk = (n, isRoot) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach((x) => walk(x, false)); return }
    if (!isRoot && n.type === 'ServerSide') return // another surface's sections are its own
    if (isZonedRow(n)) zoned = true
    if (hasAside(n)) aside = true
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
          // roving tabindex, as the component: the list is one tab stop, the arrows move inside it
          tabIndex: index === 0 ? 0 : -1,
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
  // tri-state: declared true forces it, declared false suppresses it, absent = auto
  const wanted = typeof declared === 'boolean' ? declared : auto
  const on = !aside && wanted && entries.length > 0
  return { on, entries: on ? entries : [], cls: on ? TOC_CLASS : '' }
}

// ── DOM behaviour (once per document) ────────────────────────────────────────────────────────────

/** The painted sections, in document order: what the index's entries point at (same order). */
export function tocSectionsOf(doc) {
  return [...doc.querySelectorAll('[data-mateu-section]')]
    .filter((el) => String(el.getAttribute('data-mateu-section') || '').trim() !== '')
}

/** What can be pinned at the top of the page: our sticky record band and the oj-sp page headers,
 *  which stick (and compact) on their own when the window scrolls. */
const PINNED = '.mateu-sticky-header, [id^="mateuPageHeader"]'

/**
 * The bottom of whatever is STUCK at the top right now (0 when nothing is): an element of PINNED
 * whose position is sticky or fixed and whose top sits at the viewport's top. A header still in its
 * place in the page (scrolled to the top) does not count — the content under it is not covered.
 */
export function tocPinnedBottom(doc) {
  const win = doc.defaultView
  let bottom = 0
  for (const el of doc.querySelectorAll(PINNED)) {
    const position = win && typeof win.getComputedStyle === 'function' ? win.getComputedStyle(el).position : 'sticky'
    if (position !== 'sticky' && position !== 'fixed') continue
    const r = el.getBoundingClientRect()
    if (r.height > 0 && r.top <= 1) bottom = Math.max(bottom, r.bottom)
  }
  return Math.max(0, bottom)
}

/**
 * Where the navigator's column starts inside the container: under the page header it holds (an oj-sp
 * header among its children, the overline above it included), else at the top — measured from the
 * painted boxes, while the header sits in its place. Once the header is stuck at the top (scrolled),
 * its box no longer says where the column starts: null, keep the last value.
 */
export function tocNavStart(container) {
  const top = container.getBoundingClientRect().top
  let bottom = 0
  for (const child of Array.from(container.children || [])) {
    const id = String(child.id || '')
    const cls = String(child.className || '')
    if (!id.startsWith('mateuPageHeader') && !/(^|\s)mateu-header-overline(\s|$)/.test(cls)) continue
    const r = child.getBoundingClientRect()
    if (!r.height) continue
    // in its place it opens the container (a toast or the overline at most above it); stuck at the
    // top of a scrolled page it is far down the container's box
    if (r.top - top > 64) return null
    bottom = Math.max(bottom, r.bottom - top)
  }
  return bottom
}

/** Where the reading line is: just under what is pinned at the top (a sticky header), plus air. */
export function tocReadingLine(doc) {
  return tocPinnedBottom(doc) + 16
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
      item.classList.toggle('anchor-item-selected', on)
      item.setAttribute('aria-selected', on ? 'true' : 'false')
    }
  }
  // the md-down popup that lists the entries (closed once one is chosen)
  const closePopup = () => {
    const popup = doc.getElementById('mateuAnchorNavPopup')
    if (popup && typeof popup.isOpen === 'function' && popup.isOpen()) popup.close()
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
  // the navigator sticks right under what is pinned at the top (Spectra's PositionUtility does this for
  // its own navigator: level headerNavigation, under the page header)
  // …and its column starts under the page header, which spans the page (app.css .mateu-has-toc)
  let navTop = -1
  let navStart = -1
  const placeNav = () => {
    const top = Math.round(tocPinnedBottom(doc))
    if (top !== navTop && doc.documentElement && doc.documentElement.style) {
      navTop = top
      doc.documentElement.style.setProperty('--mateu-anchor-nav-top', top + 'px')
    }
    const container = doc.querySelector('.mateu-has-toc')
    if (!container || !container.style) return
    const measured = tocNavStart(container)
    if (measured === null) return
    const start = Math.round(measured)
    if (start === navStart) return
    navStart = start
    container.style.setProperty('--mateu-anchor-nav-start', start + 'px')
  }
  const spy = () => {
    if (!items().length) return
    placeNav()
    if (locked >= 0) { mark(locked); return }
    const tops = tocSectionsOf(doc).map((el) => el.getBoundingClientRect().top)
    if (tops.length) mark(tocActiveIndex(tops, tocReadingLine(doc)))
  }
  // a click on an entry: the anchor must not navigate (href="#" would reboot VB's router, see the calendar)
  doc.addEventListener('click', (e) => {
    const target = e.target && e.target.closest ? e.target : null
    // md-down: the "Sections" button opens the list in its popup, next to the button
    const jump = target && target.closest('.mateu-anchor-nav-jump')
    if (jump) {
      const popup = doc.getElementById('mateuAnchorNavPopup')
      if (popup && typeof popup.open === 'function') {
        if (popup.isOpen && popup.isOpen()) popup.close()
        else popup.open(jump)
      }
      return
    }
    const item = target && target.closest('.mateu-toc-item')
    if (!item) return
    e.preventDefault()
    e.stopPropagation()
    jumpTo(Number(item.getAttribute('data-toc-index')))
    closePopup()
  }, true)
  // the component's keyboard: ↑/↓ move between the entries of a list, Enter goes to the focused one
  doc.addEventListener('keydown', (e) => {
    const item = e.target && e.target.closest && e.target.closest('.mateu-toc-item')
    if (!item) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = e.key === 'ArrowDown' ? item.nextElementSibling : item.previousElementSibling
      if (next && typeof next.focus === 'function') next.focus()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      jumpTo(Number(item.getAttribute('data-toc-index')))
      closePopup()
    }
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
  // a new screen: nothing locked, the first entry active. VB stamps the entries AFTER the chain that
  // announces the screen, so the spy is retried for a few frames until there is something to select.
  const spySoon = (tries) => {
    spy()
    if (tries > 0 && !items().length && win && typeof win.requestAnimationFrame === 'function') {
      win.requestAnimationFrame(() => spySoon(tries - 1))
    }
  }
  doc.addEventListener('mateu-toc-reset', () => { locked = -1; spySoon(30) })
  // …and whenever the entries appear (a first load paints them after every chain is done): select
  // the one in view if none is
  if (win && typeof win.MutationObserver === 'function' && doc.body) {
    // (the page header may paint after the entries: where the navigator's column starts follows it)
    new win.MutationObserver(() => {
      if (!items().length) return
      if (!doc.querySelector('.mateu-toc-item.anchor-item-selected')) spy()
      else placeNav()
    }).observe(doc.body, { childList: true, subtree: true })
  }
}

/** A new screen: the index starts unlocked (the chains call it right after assigning mateuToc). */
export function resetToc(doc = typeof document !== 'undefined' ? document : null) {
  if (doc && typeof CustomEvent === 'function') doc.dispatchEvent(new CustomEvent('mateu-toc-reset'))
}

/** The index's accessible name (the shell binds the nls text; this is the JS side's). */
export const tocLabel = (lang) => chromeText('sections', {}, lang)
