/**
 * CRUD mapping: the listing table is a real oj-c-table fed by an ArrayDataProvider; pagination
 * is a Redwood prev/next control built from oj-c-button (JET 19 no longer ships a paging
 * control); the filter bar delegates to the shared, design-system-agnostic mateu-filter-bar
 * (already the Redwood smart-search chips pattern, themed via the Lumo→Redwood bridge).
 *
 * Mateu contracts honoured here (see libs/mateu mateu-table-crud):
 *  - row activation     → action-requested {actionId: 'view', parameters: row}
 *  - row action buttons → action-requested {actionId: 'action-on-row-<method>', parameters: {_clickedRow}}
 *  - sorting            → container.state.sort = [{fieldId, direction: 'ascending'|'descending'}]
 *                         + container.handleSearchRequested(undefined) (server-side ordering)
 *  - pagination         → page-changed {detail: {page}} handled by container.pageChanged
 */
import { html, nothing, TemplateResult } from 'lit'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import Crud from '@mateu/shared/apiClients/dtos/componentmetadata/Crud'
import GridColumn from '@mateu/shared/apiClients/dtos/componentmetadata/GridColumn'
import { MateuTableCrud } from '@infra/ui/mateu-table-crud.ts'
import { ComponentData, ComponentState } from '@infra/ui/renderers/types.ts'
import { arrayDataProvider, dispatchActionRequested } from './oj.ts'

type Row = Record<string, unknown>

const isActionCol = (c: GridColumn): boolean =>
  c.dataType === 'action' || c.dataType === 'actionGroup' || c.dataType === 'menu' || c.stereotype === 'button'

const keyFieldOf = (cols: GridColumn[]): string => cols.find(c => c.identifier)?.id ?? '_key'

/** Raw row → display row: object values flattened to text (oj-c-table fields render text), the
 * raw row kept under __raw for action dispatching. */
const toDisplayRow = (row: Row, cols: GridColumn[], keyField: string, index: number): Row => {
  const out: Row = { __raw: row }
  for (const col of cols) {
    if (isActionCol(col)) continue
    const v = row[col.id]
    if (v === null || v === undefined) {
      out[col.id] = ''
    } else if (col.dataType === 'bool') {
      out[col.id] = v === true || v === 'true' ? '✓' : '✗'
    } else if (col.dataType === 'status') {
      out[col.id] = (v as Row).message ?? ''
    } else if (typeof v === 'object') {
      const o = v as Row
      out[col.id] = String(o.label ?? o.name ?? o.message ?? '')
    } else {
      out[col.id] = v
    }
  }
  if (!(keyField in out)) out[keyField] = row[keyField] ?? index
  return out
}

const sortOf = (container: MateuTableCrud, fieldId: string): 'ascending' | 'descending' | undefined =>
  (container.state?.sort as { fieldId: string; direction: string }[] | undefined)?.find(s => s.fieldId === fieldId)
    ?.direction as 'ascending' | 'descending' | undefined

const cycleSort = (container: MateuTableCrud, fieldId: string) => {
  const current = sortOf(container, fieldId)
  const next = current === undefined ? 'ascending' : current === 'ascending' ? 'descending' : undefined
  container.state = { ...container.state, sort: next ? [{ fieldId, direction: next }] : [] }
  container.handleSearchRequested(undefined)
}

const renderOjTable = (
  container: MateuTableCrud,
  component: ClientSideComponent,
  metadata: Crud,
  rows: Row[],
): TemplateResult => {
  const cols = (metadata.columns ?? [])
    .map(c => c.metadata as GridColumn)
    .filter(c => c && !isActionCol(c))
  const keyField = keyFieldOf((metadata.columns ?? []).map(c => c.metadata as GridColumn))
  const displayRows = rows.map((r, i) => toDisplayRow(r, cols, keyField, i))
  const ojColumns = cols.map(col => ({
    field: col.id,
    headerText: col.label ?? col.id,
    className: col.align === 'end' || col.align === 'right' ? 'mateu-oj-cell-right' : undefined,
  }))

  const onRowAction = (e: Event) => {
    const ctx = (e as CustomEvent).detail?.context
    const key = ctx?.item?.metadata?.key ?? ctx?.key
    const row = displayRows.find(r => String(r[keyField]) === String(key))?.__raw as Row | undefined
    if (row) {
      dispatchActionRequested(e.target as Element, 'view', row)
    }
  }

  const emptyMsg = (container.state?.[component.id!] as Row | undefined)?.emptyStateMessage as string | undefined

  return html`
    <div class="mateu-oj-tablewrap">
      <div class="mateu-oj-sortbar">
        ${cols.filter(c => c.sortable).map(col => {
          const dir = sortOf(container, col.id)
          return html`
            <button class="mateu-oj-sortchip ${dir ? 'is-active' : ''}"
                    @click=${() => cycleSort(container, col.id)}>
              ${col.label ?? col.id}${dir === 'ascending' ? ' ↑' : dir === 'descending' ? ' ↓' : ''}
            </button>`
        })}
      </div>
      <oj-c-table
        aria-label="${metadata.title ?? 'listing'}"
        .data=${arrayDataProvider(displayRows, keyField)}
        .columns=${ojColumns}
        layout="contents"
        horizontal-grid-visible="enabled"
        class="mateu-oj-table"
        @ojRowAction=${onRowAction}>
        <template slot="noData">
          <div class="mateu-oj-table-empty">${emptyMsg ?? 'No data to display.'}</div>
        </template>
      </oj-c-table>
    </div>`
}

const renderCardsGrid = (
  container: MateuTableCrud,
  component: ClientSideComponent,
  metadata: Crud,
  rows: Row[],
): TemplateResult => {
  const allCols = (metadata.columns ?? []).map(c => c.metadata as GridColumn)
  const cols = allCols.filter(c => c && !isActionCol(c))
  const idCol = cols.find(c => c.identifier) ?? cols[0]
  const rest = cols.filter(c => c !== idCol)
  const emptyMsg = (container.state?.[component.id!] as Row | undefined)?.emptyStateMessage as string | undefined
  return html`
    <div class="mateu-oj-cardsgrid">
      ${rows.length === 0 ? html`<div class="mateu-oj-table-empty">${emptyMsg ?? 'No data to display.'}</div>` : nothing}
      ${rows.map(row => html`
        <div class="mateu-oj-card mateu-oj-rowcard" tabindex="0"
             @click=${(e: Event) => dispatchActionRequested(e.target as Element, 'view', row)}
             @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') dispatchActionRequested(e.target as Element, 'view', row) }}>
          <div class="mateu-oj-card-title">${idCol ? String(row[idCol.id] ?? '') : ''}</div>
          ${rest.map(col => html`
            <div class="mateu-oj-rowcard-field">
              <span class="mateu-oj-field-ro-label">${col.label ?? col.id}</span>
              <span>${toDisplayRow(row, [col], col.id, 0)[col.id]}</span>
            </div>`)}
        </div>`)}
    </div>`
}

export const renderTableComponent = (
  container: MateuTableCrud,
  component: ClientSideComponent | undefined,
  _baseUrl: string | undefined,
  _state: ComponentState,
  _data: ComponentData,
  _appState: ComponentState,
  _appData: ComponentData,
): TemplateResult => {
  if (!component?.metadata) return html``
  const metadata = component.metadata as Crud
  const rows = ((container.data?.[container.id]?.page?.content ?? []) as Row[]) || []
  const layout = metadata.gridLayout ?? 'auto'

  if (layout === 'cards') {
    return renderCardsGrid(container, component, metadata, rows)
  }
  // 'table' | 'auto' | 'list' | 'masterDetail' | 'tree': the oj-c-table covers them; list /
  // masterDetail / tree keep the table presentation until dedicated Redwood layouts land
  // (documented in the README).
  return renderOjTable(container, component, metadata, rows)
}

export const renderPagination = (
  container: MateuTableCrud,
  component: ClientSideComponent | undefined,
): TemplateResult => {
  const page = container.data?.[component?.id ?? container.id]?.page
  const total = page?.totalElements ?? 0
  const size = page?.pageSize ?? 10
  const current = page?.pageNumber ?? 0
  const pages = Math.max(1, Math.ceil(total / size))
  const go = (e: Event, p: number) => {
    e.target?.dispatchEvent(new CustomEvent('page-changed', {
      detail: { page: p },
      bubbles: true,
      composed: true,
    }))
  }
  return html`
    <div class="mateu-oj-pagination" data-testid="pagination"
         @page-changed=${(e: CustomEvent) => container.pageChanged(e)}>
      <span class="mateu-oj-pagination-info">${total} item${total === 1 ? '' : 's'} · page ${current + 1} of ${pages}</span>
      <oj-c-button chroming="outlined" label="Previous" ?disabled=${current <= 0}
                   @ojAction=${(e: Event) => go(e, current - 1)}>
        <span slot="startIcon" class="oj-ux-ico-caret-left"></span>
      </oj-c-button>
      <oj-c-button chroming="outlined" label="Next" ?disabled=${current >= pages - 1}
                   @ojAction=${(e: Event) => go(e, current + 1)}>
        <span slot="endIcon" class="oj-ux-ico-caret-right"></span>
      </oj-c-button>
    </div>`
}
