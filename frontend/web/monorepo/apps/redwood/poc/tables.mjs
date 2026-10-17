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

/** Watches (once) the oj-table's repaints to put the tones back. */
export function installRowTones(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuRowTones || typeof MutationObserver === 'undefined') return
  doc.__mateuRowTones = true
  let pending = false
  new MutationObserver(() => {
    if (pending || !tones.some(Boolean)) return
    pending = true
    requestAnimationFrame(() => { pending = false; applyRowTones(doc) })
  }).observe(doc.body, { childList: true, subtree: true })
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
