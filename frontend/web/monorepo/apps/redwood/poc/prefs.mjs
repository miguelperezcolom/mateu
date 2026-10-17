import { chromeText } from './i18n.mjs'
// LISTING PERSONALISATION in the browser: the COLUMN CHOOSER (which ones show and in what
// order) and SAVED VIEWS (a named combination of search + filters, with one as
// default). Same format and same localStorage keys as the web renderer (libs/mateu
// columnPrefsStore.ts / savedViewsStore.ts), so a user who switches renderer keeps
// their own. The scope is the listing's route. No wire changes: the server still sends all
// the columns and here they are filtered before painting.

const COLUMNS_KEY = 'mateu-column-prefs'
const VIEWS_KEY = 'mateu-saved-views'
const TILES_KEY = 'mateu-tile-order'

const storageOf = (storage) => storage || (typeof localStorage !== 'undefined' ? localStorage : null)
const readAll = (key, storage) => {
  try {
    const s = storageOf(storage)
    return s ? JSON.parse(s.getItem(key) || '{}') || {} : {}
  } catch (e) { return {} }
}
const writeAll = (key, value, storage) => {
  try { const s = storageOf(storage); if (s) s.setItem(key, JSON.stringify(value)) } catch (e) { /* full or blocked */ }
}

// columns that are neither hidden nor reordered: the technical ones (selection, actions, lines)
const PROTECTED = (c) => !c || !c.field || c.field === '_select' || c.template === 'cellRowActions'
  || c.field === '__rowLines' || c.id === '__rowLines'

/** The column preferences of a scope: { hidden: [], order: [] } or null. */
export function readColumnPrefs(scope, storage) {
  const p = readAll(COLUMNS_KEY, storage)[scope]
  if (!p || typeof p !== 'object') return null
  return { hidden: Array.isArray(p.hidden) ? p.hidden : [], order: Array.isArray(p.order) ? p.order : [] }
}

export function writeColumnPrefs(scope, prefs, storage) {
  const all = readAll(COLUMNS_KEY, storage)
  if (!prefs || (!(prefs.hidden || []).length && !(prefs.order || []).length)) delete all[scope]
  else all[scope] = { hidden: prefs.hidden || [], order: prefs.order || [] }
  writeAll(COLUMNS_KEY, all, storage)
}

/** The oj-table columns with the preferences applied: without the hidden ones, in the requested order
 *  (those not mentioned, after, in their order). The technical ones are not touched. */
export function applyColumnPrefs(columns, prefs) {
  if (!prefs) return columns
  const hidden = new Set(prefs.hidden || [])
  const order = prefs.order || []
  const rank = (c) => { const i = order.indexOf(c.field || c.id); return i < 0 ? order.length : i }
  const movable = columns.filter((c) => !PROTECTED(c) && !hidden.has(c.field || c.id))
  const sorted = movable.map((c, i) => ({ c, i })).sort((a, b) => (rank(a.c) - rank(b.c)) || (a.i - b.i)).map((x) => x.c)
  // the technical ones keep their relative place: selection ones in front, actions/lines behind
  const lead = columns.filter((c) => PROTECTED(c) && c.field === '_select')
  const tail = columns.filter((c) => PROTECTED(c) && c.field !== '_select')
  return lead.concat(sorted, tail)
}

/** The column dialog's model: [{ id, label, visible }] in the current order. */
export function columnChooserOf(columns, prefs) {
  const hidden = new Set((prefs && prefs.hidden) || [])
  const order = (prefs && prefs.order) || []
  const items = columns.filter((c) => !PROTECTED(c)).map((c, i) => ({ id: c.field || c.id, label: c.headerText || c.field, visible: !hidden.has(c.field || c.id), i }))
  const rank = (x) => { const k = order.indexOf(x.id); return k < 0 ? order.length : k }
  return items.sort((a, b) => (rank(a) - rank(b)) || (a.i - b.i)).map(({ id, label, visible }) => ({ id, label, visible }))
}

/** From the dialog's model to preferences. */
export function prefsFromChooser(items) {
  return { hidden: items.filter((x) => !x.visible).map((x) => x.id), order: items.map((x) => x.id) }
}

/** Move a dialog element up (-1) or down (+1). */
export function moveChooserItem(items, id, delta) {
  const i = items.findIndex((x) => x.id === id)
  const j = i + delta
  if (i < 0 || j < 0 || j >= items.length) return items
  const out = [...items]
  ;[out[i], out[j]] = [out[j], out[i]]
  return out
}

// ── saved views ──────────────────────────────────────────────────────────────────────────

export function listSavedViews(scope, storage) {
  const v = readAll(VIEWS_KEY, storage)[scope]
  return Array.isArray(v) ? v : []
}

export function saveView(scope, view, storage) {
  const all = readAll(VIEWS_KEY, storage)
  const views = (all[scope] || []).filter((x) => x.name !== view.name)
    .map((x) => (view.isDefault ? { ...x, isDefault: false } : x))
  views.push({ name: view.name, values: view.values || {}, isDefault: !!view.isDefault })
  all[scope] = views
  writeAll(VIEWS_KEY, all, storage)
}

export function deleteView(scope, name, storage) {
  const all = readAll(VIEWS_KEY, storage)
  const views = (all[scope] || []).filter((x) => x.name !== name)
  if (views.length) all[scope] = views
  else delete all[scope]
  writeAll(VIEWS_KEY, all, storage)
}

export function defaultView(scope, storage) {
  return listSavedViews(scope, storage).find((v) => v.isDefault) || null
}

/** The route that applies a view: the listing with its filters in the query (the URL-filters
 *  path, which already sets the chips and relaunches the search). */
export function viewRouteOf(route, values) {
  const path = String(route || '').split('?')[0]
  const q = Object.keys(values || {})
    .filter((k) => values[k] != null && values[k] !== '' && !(Array.isArray(values[k]) && !values[k].length))
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(Array.isArray(values[k]) ? values[k].join(',') : String(values[k])))
  return q.length ? path + '?' + q.join('&') : path
}

/** What is saved of the current search: the free text and the applied filters. */
export function currentViewValues(filterValues, searchText) {
  const values = { ...(filterValues || {}) }
  if (searchText) values.searchText = searchText
  return values
}

/** The options of the views menu (oj-menu): the saved ones (★ the default one) + actions. */
export function viewsMenuOf(scope, storage) {
  const views = listSavedViews(scope, storage).map((v) => ({ value: 'view:' + v.name, label: (v.isDefault ? '★ ' : '') + v.name }))
  return views.concat([{ value: 'save', label: chromeText('saveCurrentView') }])
    .concat(views.length ? [{ value: 'clear', label: chromeText('clearFilters') }] : [])
}

/** The preferences scope: the route of the listing on screen, without query (in hash mode, what
 *  comes after #). */
export function listingScope(loc = typeof window !== 'undefined' ? window.location : null) {
  if (!loc) return ''
  const raw = loc.hash && loc.hash.startsWith('#/') ? loc.hash.slice(1) : loc.pathname
  return String(raw || '').split('?')[0]
}

// ── TILE ORDER of a reorderable grid (ResponsiveGrid.reorderable: the OPERA
// dashboard, whose tiles are dragged). Same key and shape as the web (tileOrderStore.ts): {scope:
// [keys]}, scope = route + '#' + grid id, key = child id (or '#index').

export const tileKeyOf = (child, index) => (child && child.id ? String(child.id) : '#' + index)

export function readTileOrder(scope, storage) {
  const saved = readAll(TILES_KEY, storage)[scope]
  return Array.isArray(saved) ? saved.filter((k) => typeof k === 'string') : null
}

export function writeTileOrder(scope, keys, storage) {
  const all = readAll(TILES_KEY, storage)
  all[scope] = keys
  writeAll(TILES_KEY, all, storage)
}

/** The positions to paint in: first the saved ones in their order, then the never placed ones. */
export function orderedTileIndices(keys, saved) {
  if (!saved || !saved.length) return keys.map((_, i) => i)
  const placed = saved.map((k) => keys.indexOf(k)).filter((i) => i >= 0)
  const seen = new Set(placed)
  return [...placed, ...keys.map((_, i) => i).filter((i) => !seen.has(i))]
}

/** The order after dropping `moved` where `target` is. */
export function moveTile(order, moved, target) {
  const from = order.indexOf(moved)
  const to = order.indexOf(target)
  if (from < 0 || to < 0 || from === to) return order
  const next = order.filter((k) => k !== moved)
  next.splice(to, 0, moved)
  return next
}

/** The order after moving `moved` one place back (-1) or forward (+1): dragging with the keyboard. */
export function moveTileBy(order, moved, delta) {
  const from = order.indexOf(moved)
  const to = from + delta
  if (from < 0 || to < 0 || to >= order.length) return order
  return moveTile(order, moved, order[to])
}

export const tileScopeOf = (gridId, loc = typeof window !== 'undefined' ? window.location : null) =>
  ((loc && loc.pathname) || '') + '#' + (gridId || 'grid')
