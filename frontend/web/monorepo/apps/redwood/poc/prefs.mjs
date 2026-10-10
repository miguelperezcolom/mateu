// PERSONALIZACIÓN DE LISTADOS en el navegador: el SELECTOR DE COLUMNAS (cuáles se ven y en qué
// orden) y las VISTAS GUARDADAS (una combinación con nombre de búsqueda + filtros, con una por
// defecto). Mismo formato y mismas claves de localStorage que el renderer web (libs/mateu
// columnPrefsStore.ts / savedViewsStore.ts), así que un usuario que cambie de renderer conserva
// lo suyo. El ámbito es la ruta del listado. Sin cambios de wire: el servidor sigue mandando todas
// las columnas y aquí se filtran antes de pintar.

const COLUMNS_KEY = 'mateu-column-prefs'
const VIEWS_KEY = 'mateu-saved-views'

const storageOf = (storage) => storage || (typeof localStorage !== 'undefined' ? localStorage : null)
const readAll = (key, storage) => {
  try {
    const s = storageOf(storage)
    return s ? JSON.parse(s.getItem(key) || '{}') || {} : {}
  } catch (e) { return {} }
}
const writeAll = (key, value, storage) => {
  try { const s = storageOf(storage); if (s) s.setItem(key, JSON.stringify(value)) } catch (e) { /* lleno o bloqueado */ }
}

// columnas que no se ocultan ni se reordenan: las técnicas (selección, acciones, líneas)
const PROTECTED = (c) => !c || !c.field || c.field === '_select' || c.template === 'cellRowActions'
  || c.field === '__rowLines' || c.id === '__rowLines'

/** Las preferencias de columnas de un ámbito: { hidden: [], order: [] } o null. */
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

/** Las columnas del oj-table con las preferencias aplicadas: sin las ocultas, en el orden pedido
 *  (las no mencionadas, detrás, en su orden). Las técnicas no se tocan. */
export function applyColumnPrefs(columns, prefs) {
  if (!prefs) return columns
  const hidden = new Set(prefs.hidden || [])
  const order = prefs.order || []
  const rank = (c) => { const i = order.indexOf(c.field || c.id); return i < 0 ? order.length : i }
  const movable = columns.filter((c) => !PROTECTED(c) && !hidden.has(c.field || c.id))
  const sorted = movable.map((c, i) => ({ c, i })).sort((a, b) => (rank(a.c) - rank(b.c)) || (a.i - b.i)).map((x) => x.c)
  // las técnicas conservan su sitio relativo: delante las de selección, detrás acciones/líneas
  const lead = columns.filter((c) => PROTECTED(c) && c.field === '_select')
  const tail = columns.filter((c) => PROTECTED(c) && c.field !== '_select')
  return lead.concat(sorted, tail)
}

/** El modelo del diálogo de columnas: [{ id, label, visible }] en el orden actual. */
export function columnChooserOf(columns, prefs) {
  const hidden = new Set((prefs && prefs.hidden) || [])
  const order = (prefs && prefs.order) || []
  const items = columns.filter((c) => !PROTECTED(c)).map((c, i) => ({ id: c.field || c.id, label: c.headerText || c.field, visible: !hidden.has(c.field || c.id), i }))
  const rank = (x) => { const k = order.indexOf(x.id); return k < 0 ? order.length : k }
  return items.sort((a, b) => (rank(a) - rank(b)) || (a.i - b.i)).map(({ id, label, visible }) => ({ id, label, visible }))
}

/** Del modelo del diálogo a preferencias. */
export function prefsFromChooser(items) {
  return { hidden: items.filter((x) => !x.visible).map((x) => x.id), order: items.map((x) => x.id) }
}

/** Mover un elemento del diálogo arriba (-1) o abajo (+1). */
export function moveChooserItem(items, id, delta) {
  const i = items.findIndex((x) => x.id === id)
  const j = i + delta
  if (i < 0 || j < 0 || j >= items.length) return items
  const out = [...items]
  ;[out[i], out[j]] = [out[j], out[i]]
  return out
}

// ── vistas guardadas ──────────────────────────────────────────────────────────────────────────

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

/** La ruta que aplica una vista: el listado con sus filtros en la query (el camino de los
 *  filtros por URL, que ya pone los chips y relanza la búsqueda). */
export function viewRouteOf(route, values) {
  const path = String(route || '').split('?')[0]
  const q = Object.keys(values || {})
    .filter((k) => values[k] != null && values[k] !== '' && !(Array.isArray(values[k]) && !values[k].length))
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(Array.isArray(values[k]) ? values[k].join(',') : String(values[k])))
  return q.length ? path + '?' + q.join('&') : path
}

/** Lo que se guarda de la búsqueda actual: el texto libre y los filtros aplicados. */
export function currentViewValues(filterValues, searchText) {
  const values = { ...(filterValues || {}) }
  if (searchText) values.searchText = searchText
  return values
}

/** Las opciones del menú de vistas (oj-menu): las guardadas (★ la de por defecto) + acciones. */
export function viewsMenuOf(scope, storage) {
  const views = listSavedViews(scope, storage).map((v) => ({ value: 'view:' + v.name, label: (v.isDefault ? '★ ' : '') + v.name }))
  return views.concat([{ value: 'save', label: 'Save current view…' }])
    .concat(views.length ? [{ value: 'clear', label: 'Clear filters' }] : [])
}

/** El ámbito de las preferencias: la ruta del listado en pantalla, sin query (en modo hash, lo
 *  que va detrás de #). */
export function listingScope(loc = typeof window !== 'undefined' ? window.location : null) {
  if (!loc) return ''
  const raw = loc.hash && loc.hash.startsWith('#/') ? loc.hash.slice(1) : loc.pathname
  return String(raw || '').split('?')[0]
}
