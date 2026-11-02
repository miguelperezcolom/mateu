// Folded panels of the PAGE foldout (FoldoutPanel.open = false → the panel starts folded).
//
// oj-sp-foldout-layout is a horizontal carousel: every oj-sp-foldout-panel is laid out open, it has
// no folded state of its own and no property to start one folded (inspected at runtime: the panel
// containers only ever carry the layout's `open` animation class). What it DOES own is the
// selection — a click or focus on a panel's container, or its page dot, writes back
// `selectedPanel` and fires `selectedPanelChanged`. So a folded panel is the component's own panel
// reduced to a strip with its title (class `mateu-foldout-folded`, app.css), and the component's own
// selection unfolds it: selecting the strip — click, keyboard focus, page dot — unfolds the panel
// and brings it into view. Open panels are not touched. Unfolded panels stay unfolded while the page is the same (an action re-projects the
// foldout); a navigation starts over, as a fresh page does on the web renderer.
//
// A panel with autoOpen (a YAML panel whose author wrote no `open:`) is open while it fits the row
// and folded otherwise — foldoutOpenStates, the rule of conformance/client/foldout-auto.json, run
// against the layout's width on every paint and on resize. Unfolding one by hand wins until the page
// changes.

import { chromeText } from './i18n.mjs'

export const FOLDED_CLASS = 'mateu-foldout-folded'
const LAYOUT_ID = 'mateuFoldoutEl'
const PANEL_CONTAINER = 'oj-sp-foldout-layout-panel-container'

const unfolded = new Set()
// keys of the autoOpen panels that do NOT fit the row right now (recomputed from the layout width)
const autoFolded = new Set()

// Redwood's measures (main-start-page.html / app.css): the 25rem overview, a 4rem folded strip;
// a panel without a wire width is counted at 22rem, the web renderers' default column
const REDWOOD_FIT = { overviewPx: 400, stripPx: 64, defaultPanelPx: 352, remPx: 16, gapPx: 0 }

/** A panel's CSS width in px: px / rem / em / a bare number / % of the row; else null. */
export function foldoutWidthPx(width, available, remPx = 16) {
  const m = /^(\d+(?:\.\d+)?)(px|rem|em|%)?$/.exec(String(width == null ? '' : width).trim())
  if (!m) return null
  const n = parseFloat(m[1])
  if (m[2] === 'rem' || m[2] === 'em') return n * remPx
  if (m[2] === '%') return n * available / 100
  return n
}

/**
 * Which panels are open on first paint (conformance/client/foldout-auto.json, the same rule as
 * libs/mateu foldoutGeometry.ts): an autoOpen panel opens while it fits `available` px, in
 * declaration order; any other follows `open`. The overview, the panels declared open and every
 * folded strip are counted first; each auto panel then takes its width in place of its strip.
 * An unknown width (null / <= 0) opens every auto panel.
 */
export function foldoutOpenStates(panels, available, options = {}) {
  const list = panels || []
  const o = Object.assign({ overviewPx: 400, stripPx: 48, defaultPanelPx: 352, remPx: 16, gapPx: 0 }, options)
  const auto = (p) => !!p && p.autoOpen === true
  if (available == null || !(available > 0)) return list.map((p) => auto(p) || !p || p.open !== false)
  const widthOf = (p) => { const w = foldoutWidthPx(p && p.width, available, o.remPx); return w == null ? o.defaultPanelPx : w }
  let used = o.overviewPx
  for (const p of list) used += o.gapPx + (!auto(p) && (!p || p.open !== false) ? widthOf(p) : o.stripPx)
  return list.map((p) => {
    if (!auto(p)) return !p || p.open !== false
    const grown = used - o.stripPx + widthOf(p)
    if (grown > available) return false
    used = grown
    return true
  })
}

/** Re-decides the autoOpen panels against the layout's width (px). */
export function fitAutoPanels(foldout, available) {
  autoFolded.clear()
  const panels = (foldout && foldout.panels) || []
  foldoutOpenStates(panels, available, REDWOOD_FIT).forEach((open, i) => {
    if (!open && panels[i] && panels[i].autoOpen === true) autoFolded.add(foldoutPanelKey(panels[i], i))
  })
}

/** A panel that may be folded: declared `open: false`, or autoOpen. */
function foldable(panel) {
  return !!panel && (panel.open === false || panel.autoOpen === true)
}

/** The identity of a wire panel across re-projections of the same page: position + title. */
export function foldoutPanelKey(panel, index) {
  return index + ':' + ((panel && panel.title) || '')
}

/** A new page: every `open: false` panel starts folded again. */
export function resetFoldoutFolds() {
  unfolded.clear()
  autoFolded.clear()
}

/** Whether the wire panel `index` of the projection is folded right now. */
export function isPanelFolded(foldout, index) {
  const panel = ((foldout && foldout.panels) || [])[index]
  if (!panel || unfolded.has(foldoutPanelKey(panel, index))) return false
  return panel.autoOpen === true ? autoFolded.has(foldoutPanelKey(panel, index)) : panel.open === false
}

/** The indexes (wire order) of the panels folded right now. */
export function foldedPanelIndexes(foldout) {
  return ((foldout && foldout.panels) || []).map((_, i) => i).filter((i) => isPanelFolded(foldout, i))
}

/** How many layout panels precede the wire panels: the overview column (1), none when the
 *  overview runs across the top (orientation horizontal: it is the layout's `overview` slot). */
export function overviewPanelsOf(foldout) {
  return foldout && foldout.overviewOnTop ? 0 : 1
}

/** The wire panel index a `selectedPanel` value names: the layout counts the overview column as
 *  panel 0 (unless the overview is on top — see overviewPanelsOf). */
export function wirePanelIndexOf(selectedPanel, foldout) {
  const n = Number(selectedPanel)
  const first = overviewPanelsOf(foldout)
  return Number.isInteger(n) && n >= first ? n - first : -1
}

/** Marks a panel as unfolded. Returns whether it was folded. */
export function unfoldPanel(foldout, index) {
  if (!isPanelFolded(foldout, index)) return false
  unfolded.add(foldoutPanelKey(foldout.panels[index], index))
  return true
}

/** The panel containers of the layout, in order (the overview first). */
function containersOf(layout) {
  return [...layout.querySelectorAll('.' + PANEL_CONTAINER)]
    .filter((c) => c.closest('oj-sp-foldout-layout') === layout)
}

function panelOf(container) {
  for (const child of container.children || []) {
    if (String(child.tagName).toLowerCase() === 'oj-sp-foldout-panel') return child
  }
  return null
}

/** Paints the folded/unfolded state on the layout's panels. Returns false while the layout has
 *  not stamped every panel yet (VB paints asynchronously — the caller retries). */
export function applyFoldoutFolds(layout, foldout) {
  if (!layout || !foldout) return false
  const panels = foldout.panels || []
  const containers = containersOf(layout)
  const offset = overviewPanelsOf(foldout)
  if (containers.length < panels.length + offset) return false
  layout.__mateuFoldout = foldout
  wireSelection(layout)
  if (panels.some((p) => p && p.autoOpen === true)) fitAutoPanels(foldout, layout.clientWidth || null)
  panels.forEach((panel, i) => {
    const container = containers[i + offset]
    const element = container && panelOf(container)
    if (!element) return
    const folded = isPanelFolded(foldout, i)
    element.classList.toggle(FOLDED_CLASS, folded)
    if (foldable(panel)) container.setAttribute('aria-expanded', folded ? 'false' : 'true')
    if (folded) container.setAttribute('title', chromeText('foldoutUnfold', { title: panel.title || '' }))
    else if (foldable(panel)) container.removeAttribute('title')
  })
  return true
}

/** The component's own selection unfolds a folded panel (once per layout element). */
function wireSelection(layout) {
  if (layout.__mateuFoldWired) return
  layout.__mateuFoldWired = true
  // the row's width decides the autoOpen panels: re-fit when it changes (a window resize, the
  // navigation drawer opening)
  if (typeof ResizeObserver !== 'undefined') {
    let last = layout.clientWidth
    new ResizeObserver(() => {
      if (layout.clientWidth === last) return
      last = layout.clientWidth
      const foldout = layout.__mateuFoldout
      if (foldout && (foldout.panels || []).some((p) => p && p.autoOpen === true)) applyFoldoutFolds(layout, foldout)
    }).observe(layout)
  }
  layout.addEventListener('selectedPanelChanged', (e) => {
    const foldout = layout.__mateuFoldout
    const index = wirePanelIndexOf(e && e.detail ? e.detail.value : layout.selectedPanel, foldout)
    if (!foldout || index < 0 || !unfoldPanel(foldout, index)) return
    applyFoldoutFolds(layout, foldout)
    // the strip grew to the panel's width: bring it into view. NOT layout.refresh(): the carousel
    // measures its panels live (dots and scroll keep working), and a refresh re-applies its own
    // scroll position a second later, sliding the panel the user just opened back out of view
    const container = containersOf(layout)[index + overviewPanelsOf(foldout)]
    const reveal = () => container && container.scrollIntoView && container.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(() => requestAnimationFrame(reveal))
    else reveal()
  })
}

/**
 * Whether a vertical wheel over an open panel is the PANEL's own scroll: Spectra's layout fixes every
 * panel to the row height and takes the wheel for its carousel, so a panel taller than the window
 * (a grid of cards) could not be read to the end — app.css lets the open panel scroll inside, and
 * this keeps the wheel for it while it still has room that way.
 */
export function panelWheelIsNative(container, deltaX, deltaY) {
  if (!container || Math.abs(deltaY) <= Math.abs(deltaX)) return false
  const room = deltaY > 0 ? container.scrollHeight - container.clientHeight - container.scrollTop : container.scrollTop
  return room > 1
}

let panelScrollInstalled = false

/** Leaves a vertical wheel over a scrollable open panel to the panel (once per document). */
export function installFoldoutPanelScroll() {
  if (panelScrollInstalled || typeof document === 'undefined') return
  panelScrollInstalled = true
  document.addEventListener('wheel', (event) => {
    const target = event.target
    const container = target && target.closest ? target.closest('#' + LAYOUT_ID + ' .' + PANEL_CONTAINER) : null
    if (panelWheelIsNative(container, event.deltaX, event.deltaY)) event.stopPropagation()
  }, { capture: true, passive: true })
}

/** Applies the folds once VB has painted the foldout. `fresh` = a new page (folds start over). */
export function applyFoldoutFoldsSoon(foldout, { fresh = false, frames = 60 } = {}) {
  if (fresh) resetFoldoutFolds()
  if (!foldout || typeof document === 'undefined') return
  installFoldoutPanelScroll()
  if (!(foldout.panels || []).some(foldable)) return
  let left = frames
  const tick = () => {
    if (applyFoldoutFolds(document.getElementById(LAYOUT_ID), foldout)) return
    left -= 1
    if (left > 0 && typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(tick)
  }
  tick()
}
