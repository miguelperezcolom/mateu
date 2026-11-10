import { surfaceAtomOf } from './surfaces.mjs'
import { shortcutMatches } from './actionPanels.mjs'
// Listing ROW TONES (@RowStatus) and GROUP rows (@GroupBy) on JET's oj-table.
// oj-table has no per-row class (only cell templates or a whole-row template that
// would force repainting every column by hand), so a minimal pass over the DOM: each `tr`
// of #mateuTable's body gets its row's class (same position: the page is painted whole,
// without virtualisation). A MutationObserver repeats it when JET repaints (sort, page, refresh).

let tones = []

/** The tones of the rows on screen, in order (from listingOf(...).rows: each one's _tone). */
export function setListingTones(rows) {
  tones = (rows || []).map((r) => (r && r._tone) || '')
  applyRowTonesSoon()
}

export const toneClassOf = (tone) => (tone ? 'mateu-row-tone-' + tone : '')

function applyRowTones(doc) {
  const table = doc.getElementById('mateuTable')
  if (!table) return 0
  const trs = table.querySelectorAll('tbody tr')
  let n = 0
  trs.forEach((tr, i) => {
    const want = toneClassOf(tones[i])
    for (const c of [...tr.classList]) if (c.startsWith('mateu-row-tone-') && c !== want) tr.classList.remove(c)
    if (want && !tr.classList.contains(want)) { tr.classList.add(want); n++ }
  })
  return n
}

function applyRowTonesSoon(frames = 10) {
  if (typeof requestAnimationFrame === 'undefined' || typeof document === 'undefined') return
  let left = frames
  const tick = () => { applyRowTones(document); if (--left > 0) requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
}

/** Watches (once) the oj-table's repaints to put the tones back (and gives cut cells their title). */
export function installRowTones(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuRowTones || typeof MutationObserver === 'undefined') return
  doc.__mateuRowTones = true
  installCellTitles(doc)
  let pending = false
  new MutationObserver(() => {
    if (pending || !tones.some(Boolean)) return
    pending = true
    requestAnimationFrame(() => { pending = false; applyRowTones(doc) })
  }).observe(doc.body, { childList: true, subtree: true })
}

// ── CUT cells: the listing's oj-table in layout="fixed" (default column sizing, listing.mjs
// columnSizingOf) cuts a text longer than its column with an ellipsis (white-space: nowrap). The
// whole text goes to the cell's title while the pointer is on it — only when it IS cut, and never
// over a title of its own.
const AUTO_TITLE = 'data-mateu-auto-title'

/** The title a cell earns: its whole text when it overflows its width; '' when it fits. */
export function overflowTitleOf(cell) {
  if (!cell || !(cell.scrollWidth > cell.clientWidth + 1)) return ''
  return String(cell.textContent || '').replace(/\s+/g, ' ').trim()
}

function installCellTitles(doc) {
  doc.addEventListener('mouseover', (e) => {
    const td = e.target && typeof e.target.closest === 'function' ? e.target.closest('#mateuTable td') : null
    if (!td || (td.getAttribute('title') && !td.hasAttribute(AUTO_TITLE))) return
    const title = overflowTitleOf(td)
    if (title) { td.setAttribute('title', title); td.setAttribute(AUTO_TITLE, '') }
    else if (td.hasAttribute(AUTO_TITLE)) { td.removeAttribute('title'); td.removeAttribute(AUTO_TITLE) }
  }, true)
}

// ── record header FIXED and compact on scroll (OPERA's «business card») ─────────────
/** Marks the body with mateu-scrolled as soon as the page leaves the header behind: app.css paints the
 *  compact .mateu-sticky-header band (less air, no strip, with shadow). */
export function installStickyHeader(win = typeof window !== 'undefined' ? window : null) {
  if (!win || win.__mateuStickyHeader) return
  win.__mateuStickyHeader = true
  let on = false
  win.addEventListener('scroll', () => {
    const now = win.scrollY > 48
    if (now !== on) { on = now; win.document.body.classList.toggle('mateu-scrolled', now) }
  }, { passive: true })
}

// ── @OnRowSelected on a GRID field (a list with columns inside a form): a click on a row — or the
// declared base combination plus a number key (ctrl+shift+2 = the second row, top row or keypad) —
// runs the field's onItemSelectionActionId with the row in `_clickedRow`, as the web grid does.
// Read-only grids too: this is the master/detail idiom. The grid's root carries the action, the
// shortcut and its rows (data-row-select-*, the isGrid atom); the action goes back to the grid's
// SURFACE (an inline island's).
let rowSelectSink = null
export function setRowSelectSink(fn) { rowSelectSink = typeof fn === 'function' ? fn : null }

const rowsOfSelectHost = (host) => {
  try { const rows = JSON.parse(host.getAttribute('data-row-select-rows') || '[]'); return Array.isArray(rows) ? rows : [] } catch (e) { return [] }
}

/** The row (0-based) a base combination + number key selects, or null: the shortcut is the BASE
 *  combination («ctrl+shift»), the number (top row or keypad) is the row's position. */
export function rowShortcutIndexOf(shortcut, e) {
  const m = /^(?:Digit|Numpad)([1-9])$/.exec(String((e && e.code) || '')) || /^([1-9])$/.exec(String((e && e.key) || ''))
  if (!shortcut || !m) return null
  const combo = String(shortcut).toLowerCase().replace(/\s+/g, '')
  return shortcutMatches(combo + '+' + m[1], e) ? Number(m[1]) - 1 : null
}

export function installRowSelection(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuRowSelection) return
  doc.__mateuRowSelection = true
  const select = (host, index) => {
    const rows = rowsOfSelectHost(host)
    if (!rowSelectSink || index == null || index < 0 || index >= rows.length) return false
    rowSelectSink(host.getAttribute('data-row-select-action'), { _clickedRow: rows[index] }, surfaceAtomOf(host))
    return true
  }
  doc.addEventListener('click', (e) => {
    const target = e.target && e.target.closest ? e.target : null
    const host = target && target.closest('[data-row-select-action]')
    if (!host || !host.getAttribute('data-row-select-action')) return
    // a control inside a cell does its own thing
    if (target.closest('oj-button, button, a, input, oj-input-text, oj-select-single, oj-switch')) return
    const table = target.closest('oj-table')
    const ctx = table && typeof table.getContextByNode === 'function' ? table.getContextByNode(target) : null
    if (!ctx || ctx.rowIndex == null || (ctx.subId && ctx.subId !== 'oj-table-cell')) return
    select(host, ctx.rowIndex)
  })
  doc.addEventListener('keydown', (e) => {
    if (!e.ctrlKey && !e.altKey && !e.metaKey) return
    for (const host of doc.querySelectorAll('[data-row-select-shortcut]')) {
      const sc = host.getAttribute('data-row-select-shortcut')
      if (!sc || !(host.getClientRects && host.getClientRects().length)) continue
      const index = rowShortcutIndexOf(sc, e)
      if (index != null && select(host, index)) { e.preventDefault(); e.stopPropagation(); return }
    }
  }, true)
}
