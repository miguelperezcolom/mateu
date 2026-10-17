import { writeTileOrder, moveTile, moveTileBy } from './prefs.mjs'
// DRAGGING ROWS TO A DESTINATION: the rows of a @DragRows(type) listing are dragged with the dnd
// of JET's own oj-table (dnd.drag.rows.data-types = the type's MIME type); a DropZone
// (isDropZone atom) accepts that MIME type — it highlights while something of its own passes over it — and on
// drop it launches its action with its parameters plus _draggedIds and _dragType: source and destination.

/** The ids of what the drag carries: the JSON JET puts per type (rows, or {data,key}). */
export function draggedIdsOf(json) {
  let rows
  try { rows = JSON.parse(json) } catch (e) { return [] }
  if (!Array.isArray(rows)) rows = [rows]
  return rows.map((r) => {
    if (r == null) return null
    if (typeof r !== 'object') return String(r)
    const d = r.data && typeof r.data === 'object' ? r.data : r
    const id = d.id != null ? d.id : (r.key != null ? r.key : null)
    return id == null ? null : String(id)
  }).filter((id) => id != null)
}

/** The «charge» type of a MIME «application/x-mateu-charge». */
export const dragTypeOfMime = (mime) => String(mime || '').replace(/^application\/x-mateu-/, '')

let dropSink = null
export function setDropSink(fn) { dropSink = typeof fn === 'function' ? fn : null }

// ── REORDERABLE TILES (ResponsiveGrid.reorderable): each tile's block carries data-mateu-tile
// (its key) and data-mateu-tile-scope; dragging one over another places it there, and Alt+←/→ with the
// tile focused moves it one place. The order is saved (prefs: the same store as the web) and the
// page re-projects the host without going to the server (tileSink).
const TILE_MIME = 'application/x-mateu-tile'
let tileSink = null
export function setTileReorderSink(fn) { tileSink = typeof fn === 'function' ? fn : null }

/** The keys of a scope's tiles, in the order they are painted. */
export function paintedTileOrder(doc, scope) {
  return Array.from(doc.querySelectorAll('[data-mateu-tile]'))
    .filter((el) => el.getAttribute('data-mateu-tile-scope') === scope)
    .map((el) => el.getAttribute('data-mateu-tile'))
}

export function installTileReorder(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuTiles) return
  doc.__mateuTiles = true
  const tileOf = (t) => (t && t.closest ? t.closest('[data-mateu-tile]') : null)
  const commit = (scope, next, focusKey) => {
    writeTileOrder(scope, next)
    if (tileSink) tileSink(scope)
    if (focusKey) {
      // after re-projecting, focus returns to the moved tile (VB repaints asynchronously)
      let tries = 0
      const refocus = () => {
        const el = Array.from(doc.querySelectorAll('[data-mateu-tile]'))
          .find((n) => n.getAttribute('data-mateu-tile') === focusKey && n.getAttribute('data-mateu-tile-scope') === scope)
        const painted = paintedTileOrder(doc, scope)
        if (el && painted.join('|') === next.join('|')) { el.focus(); return }
        if (++tries < 20) setTimeout(refocus, 50)
      }
      setTimeout(refocus, 0)
    }
  }
  // the draggable attribute is set when the gesture starts (the template paints the block without it)
  doc.addEventListener('mousedown', (e) => { const tile = tileOf(e.target); if (tile) tile.draggable = true }, true)
  doc.addEventListener('dragstart', (e) => {
    const tile = tileOf(e.target)
    if (!tile || !e.dataTransfer) return
    e.dataTransfer.setData(TILE_MIME, tile.getAttribute('data-mateu-tile-scope') + '\n' + tile.getAttribute('data-mateu-tile'))
    e.dataTransfer.effectAllowed = 'move'
    tile.classList.add('mateu-tile-dragging')
  }, true)
  doc.addEventListener('dragend', () => {
    for (const t of doc.querySelectorAll('.mateu-tile-dragging, .mateu-tile-over')) t.classList.remove('mateu-tile-dragging', 'mateu-tile-over')
  }, true)
  doc.addEventListener('dragover', (e) => {
    const tile = tileOf(e.target)
    const types = (e.dataTransfer && e.dataTransfer.types) ? Array.from(e.dataTransfer.types) : []
    if (!tile || !types.includes(TILE_MIME)) return
    e.preventDefault()
    tile.classList.add('mateu-tile-over')
  }, true)
  doc.addEventListener('dragleave', (e) => {
    const tile = tileOf(e.target)
    if (tile && !(e.relatedTarget && tile.contains(e.relatedTarget))) tile.classList.remove('mateu-tile-over')
  }, true)
  doc.addEventListener('drop', (e) => {
    const tile = tileOf(e.target)
    const raw = tile && e.dataTransfer ? e.dataTransfer.getData(TILE_MIME) : ''
    if (!raw) return
    const [scope, moved] = raw.split('\n')
    if (scope !== tile.getAttribute('data-mateu-tile-scope')) return
    e.preventDefault()
    const order = paintedTileOrder(doc, scope)
    const next = moveTile(order, moved, tile.getAttribute('data-mateu-tile'))
    if (next !== order) commit(scope, next, null)
  }, true)
  doc.addEventListener('keydown', (e) => {
    if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return
    const tile = e.target && e.target.hasAttribute && e.target.hasAttribute('data-mateu-tile') ? e.target : null
    if (!tile) return
    e.preventDefault()
    const scope = tile.getAttribute('data-mateu-tile-scope')
    const key = tile.getAttribute('data-mateu-tile')
    const order = paintedTileOrder(doc, scope)
    const next = moveTileBy(order, key, e.key === 'ArrowLeft' ? -1 : 1)
    if (next !== order) commit(scope, next, key)
  }, true)
}

export function installDragAndDrop(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuDnd) return
  doc.__mateuDnd = true
  const zoneOf = (target, e) => {
    const zone = target && target.closest ? target.closest('.mateu-drop-zone[data-drop-accept]') : null
    if (!zone) return null
    const accept = zone.getAttribute('data-drop-accept')
    const types = (e.dataTransfer && e.dataTransfer.types) ? Array.from(e.dataTransfer.types) : []
    return accept && types.includes(accept) ? zone : null
  }
  doc.addEventListener('dragover', (e) => {
    const zone = zoneOf(e.target, e)
    if (!zone) return
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    zone.classList.add('mateu-drop-over')
  }, true)
  doc.addEventListener('dragleave', (e) => {
    const zone = e.target && e.target.closest ? e.target.closest('.mateu-drop-zone') : null
    if (zone && !(e.relatedTarget && zone.contains(e.relatedTarget))) zone.classList.remove('mateu-drop-over')
  }, true)
  // while something with a type is being dragged, the destinations that accept it offer themselves (dotted border)
  doc.addEventListener('dragstart', (e) => {
    const types = (e.dataTransfer && e.dataTransfer.types) ? Array.from(e.dataTransfer.types) : []
    setTimeout(() => {
      const live = (e.dataTransfer && e.dataTransfer.types) ? Array.from(e.dataTransfer.types) : types
      for (const z of doc.querySelectorAll('.mateu-drop-zone[data-drop-accept]')) {
        if (live.includes(z.getAttribute('data-drop-accept'))) z.classList.add('mateu-drop-ready')
      }
    })
  }, true)
  const clear = () => {
    for (const z of doc.querySelectorAll('.mateu-drop-zone')) z.classList.remove('mateu-drop-ready', 'mateu-drop-over')
  }
  doc.addEventListener('dragend', clear, true)
  doc.addEventListener('drop', (e) => {
    const zone = zoneOf(e.target, e)
    if (!zone) return
    e.preventDefault()
    clear()
    const mime = zone.getAttribute('data-drop-accept')
    const ids = draggedIdsOf(e.dataTransfer.getData(mime))
    if (!ids.length || !dropSink) return
    let params = {}
    try { params = JSON.parse(zone.getAttribute('data-drop-params') || '{}') } catch (err) { params = {} }
    dropSink(zone.getAttribute('data-drop-action'), { ...params, _draggedIds: ids, _dragType: dragTypeOfMime(mime) }, {})
  }, true)
}
