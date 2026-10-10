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
