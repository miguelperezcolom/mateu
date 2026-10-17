// MatrixGrid on oj-data-grid: the behaviour JET leaves to the application, installed once
// per document (like the tape chart's range or the action panels):
//   - collapsing/expanding a section: the grid requests it (ojExpandRequest/ojCollapseRequest) and here the
//     KeySet of the FlattenedTreeDataProviderView is changed; the state is saved in the
//     panels store so it survives a re-projection;
//   - editing: which cells are edited is said by cell.editable (matrixAtomOf); when it ends
//     (ojBeforeEditEnd) the new value, if it changed, goes out through editActionId;
//   - a linking cell: click → cellActionId. Both with { _rowId, _columnId, _value }.
import { panelExpanded, setPanelExpanded, matrixSectionKey } from './reduceContexts.mjs'

let matrixSink = null
/** Who runs the action (the shell reuses the Elements' sink). */
export function setMatrixActionSink(fn) { matrixSink = typeof fn === 'function' ? fn : null }

/** The parameters of a cell's action. */
export const matrixCellParams = (rowId, columnId, value) => ({ _rowId: rowId, _columnId: columnId, _value: value })

/** Should the edit be launched? Only if it changed (an Enter without touching anything is not an edit). */
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
