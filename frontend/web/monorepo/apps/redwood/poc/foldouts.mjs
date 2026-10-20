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

import { chromeText } from './i18n.mjs'

export const FOLDED_CLASS = 'mateu-foldout-folded'
const LAYOUT_ID = 'mateuFoldoutEl'
const PANEL_CONTAINER = 'oj-sp-foldout-layout-panel-container'

const unfolded = new Set()

/** The identity of a wire panel across re-projections of the same page: position + title. */
export function foldoutPanelKey(panel, index) {
  return index + ':' + ((panel && panel.title) || '')
}

/** A new page: every `open: false` panel starts folded again. */
export function resetFoldoutFolds() {
  unfolded.clear()
}

/** Whether the wire panel `index` of the projection is folded right now. */
export function isPanelFolded(foldout, index) {
  const panel = ((foldout && foldout.panels) || [])[index]
  return !!panel && panel.open === false && !unfolded.has(foldoutPanelKey(panel, index))
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
  panels.forEach((panel, i) => {
    const container = containers[i + offset]
    const element = container && panelOf(container)
    if (!element) return
    const folded = isPanelFolded(foldout, i)
    element.classList.toggle(FOLDED_CLASS, folded)
    if (panel.open === false) container.setAttribute('aria-expanded', folded ? 'false' : 'true')
    if (folded) container.setAttribute('title', chromeText('foldoutUnfold', { title: panel.title || '' }))
    else if (panel.open === false) container.removeAttribute('title')
  })
  return true
}

/** The component's own selection unfolds a folded panel (once per layout element). */
function wireSelection(layout) {
  if (layout.__mateuFoldWired) return
  layout.__mateuFoldWired = true
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

/** Applies the folds once VB has painted the foldout. `fresh` = a new page (folds start over). */
export function applyFoldoutFoldsSoon(foldout, { fresh = false, frames = 60 } = {}) {
  if (fresh) resetFoldoutFolds()
  if (!foldout || typeof document === 'undefined') return
  if (!(foldout.panels || []).some((p) => p && p.open === false)) return
  let left = frames
  const tick = () => {
    if (applyFoldoutFolds(document.getElementById(LAYOUT_ID), foldout)) return
    left -= 1
    if (left > 0 && typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(tick)
  }
  tick()
}
