// MatrixGrid sobre oj-data-grid: el comportamiento que JET deja a la aplicación, instalado una
// vez por documento (como el rango del tape chart o los paneles de acciones):
//   - plegar/desplegar una sección: el grid pide (ojExpandRequest/ojCollapseRequest) y aquí se
//     cambia el KeySet del FlattenedTreeDataProviderView; el estado se guarda en el almacén de
//     paneles para que sobreviva a una re-proyección;
//   - editar: qué celdas se editan lo dice cell.editable (matrixAtomOf); al terminar
//     (ojBeforeEditEnd) el valor nuevo, si cambió, sale por editActionId;
//   - una celda que enlaza: clic → cellActionId. Ambas con { _rowId, _columnId, _value }.
import { panelExpanded, setPanelExpanded, matrixSectionKey } from './reduceContexts.mjs'

let matrixSink = null
/** Quién ejecuta la acción (la shell reutiliza el sumidero de los Element). */
export function setMatrixActionSink(fn) { matrixSink = typeof fn === 'function' ? fn : null }

/** Los parámetros de la acción de una celda. */
export const matrixCellParams = (rowId, columnId, value) => ({ _rowId: rowId, _columnId: columnId, _value: value })

/** ¿Hay que lanzar la edición? Sólo si cambió (un Enter sin tocar nada no es una edición). */
export const matrixEditChanged = (before, after) => String(before ?? '') !== String(after ?? '')

const gridOf = (el) => (el && el.closest ? el.closest('oj-data-grid.mateu-matrix') : null)
const rowKeyOf = (detail) => detail && detail.item && detail.item.metadata && detail.item.metadata.rowItem
  && detail.item.metadata.rowItem.metadata && detail.item.metadata.rowItem.metadata.key

export function installMatrixGrids(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuMatrixGrids) return
  doc.__mateuMatrixGrids = true
  const toggle = (expand) => (e) => {
    const grid = gridOf(e.target)
    const state = grid && grid.data && grid.data.__mateu
    const key = rowKeyOf(e.detail)
    if (!state || key == null) return
    state.expanded = expand ? state.expanded.add([key]) : state.expanded.delete([key])
    state.flat.setExpanded(state.expanded)
    if (String(key).startsWith('§')) setPanelExpanded(matrixSectionKey(grid.dataset.matrixId, String(key).slice(1)), expand)
  }
  doc.addEventListener('ojExpandRequest', toggle(true), true)
  doc.addEventListener('ojCollapseRequest', toggle(false), true)
  doc.addEventListener('ojBeforeEditEnd', (e) => {
    const grid = gridOf(e.target)
    if (!grid || (e.detail && e.detail.cancelEdit)) return
    const input = grid.querySelector('oj-input-text[data-mx-row]')
    if (!input || !matrixSink || !grid.dataset.editAction) return
    const before = input.getAttribute('data-mx-value')
    const after = input.value
    if (!matrixEditChanged(before, after)) return
    matrixSink(grid.dataset.editAction, matrixCellParams(input.getAttribute('data-mx-row'), input.getAttribute('data-mx-col'), after), {})
  }, true)
  doc.addEventListener('click', (e) => {
    const link = e.target && e.target.closest ? e.target.closest('[data-mx-link="true"]') : null
    const grid = gridOf(link)
    if (!link || !grid || !matrixSink || !grid.dataset.cellAction) return
    matrixSink(grid.dataset.cellAction, matrixCellParams(link.getAttribute('data-mx-row'), link.getAttribute('data-mx-col'), link.textContent), {})
  }, true)
}

void panelExpanded
