import { writeTileOrder, moveTile, moveTileBy } from './prefs.mjs'
// ARRASTRAR FILAS A UN DESTINO: las filas de un listado @DragRows(tipo) se arrastran con el dnd
// del propio oj-table de JET (dnd.drag.rows.data-types = el tipo MIME del tipo); un DropZone
// (atom isDropZone) acepta ese tipo MIME — se resalta mientras pasa por encima algo suyo — y al
// soltar lanza su acción con sus parámetros más _draggedIds y _dragType: origen y destino.

/** Los ids de lo que trae el arrastre: el JSON que JET pone por tipo (filas, o {data,key}). */
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

/** El tipo «charge» de un MIME «application/x-mateu-charge». */
export const dragTypeOfMime = (mime) => String(mime || '').replace(/^application\/x-mateu-/, '')

let dropSink = null
export function setDropSink(fn) { dropSink = typeof fn === 'function' ? fn : null }

// ── TILES REORDENABLES (ResponsiveGrid.reorderable): el bloque de cada tile lleva data-mateu-tile
// (su clave) y data-mateu-tile-scope; arrastrar uno sobre otro lo coloca ahí, y Alt+←/→ con el
// tile enfocado lo mueve un puesto. El orden se guarda (prefs: el mismo almacén que el web) y la
// página re-proyecta el host sin ir al servidor (tileSink).
const TILE_MIME = 'application/x-mateu-tile'
let tileSink = null
export function setTileReorderSink(fn) { tileSink = typeof fn === 'function' ? fn : null }

/** Las claves de los tiles de un ámbito, en el orden en que están pintados. */
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
      // tras re-proyectar, el foco vuelve al tile movido (VB repinta de forma asíncrona)
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
  // el atributo draggable se pone al empezar el gesto (el bloque lo pinta la plantilla sin él)
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
  // mientras se arrastra algo con tipo, los destinos que lo aceptan se ofrecen (borde punteado)
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
