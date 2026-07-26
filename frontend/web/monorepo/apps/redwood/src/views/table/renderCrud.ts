import { html, nothing, type TemplateResult } from 'lit'
import { ojElement } from '../../oj/ojElement'
import { interpolate } from '../../core/expressions'
import type { Json, RenderCtx } from '../renderComponent'
import { ctxScope } from '../renderComponent'
import { renderButton } from '../leaves/renderButton'

interface Col {
  id: string
  label: string
  type: string
}

interface ListingState {
  rows: Json[]
  total: number
  page: number
  size: number
  searchText: string
}

/** Per-crud row state (filled by the search data handler, read by the table renderer). Keyed by the
 *  crud component id so several listings on a page stay independent. */
const listings = new Map<string, ListingState>()

function columnsOf(m: Json): Col[] {
  const raw = (m['columns'] as Json[]) ?? []
  return raw.map((c) => {
    const cm = (c['metadata'] as Json) ?? c
    return { id: String(cm['id'] ?? cm['fieldId'] ?? ''), label: String(cm['label'] ?? ''), type: mapColType(String(cm['dataType'] ?? 'string')) }
  })
}

function mapColType(dataType: string): string {
  if (['integer', 'number', 'double', 'money', 'decimal', 'long', 'float'].includes(dataType)) return 'number'
  if (dataType === 'boolean') return 'boolean'
  return 'string'
}

/** Normalise a toolbar/action item to its metadata (wire nests some as ClientSide, some raw). */
function metaItems(arr: unknown): Json[] {
  return (Array.isArray(arr) ? arr : []).map((i) => ((i as Json)['metadata'] as Json) ?? (i as Json))
}

/**
 * Crud / Listing → the authentic Oracle oj-dynamic-table (Dynamic UI pack). Columns become a
 * JsonMetadataProvider, the search rows an ArrayDataProvider. The OnLoad `search` trigger (fired by
 * the controller) returns the rows as a data fragment; we catch them through a data handler keyed on
 * the crud, store them and re-render. Toolbar buttons + a search box sit above the table.
 */
export function renderCrud(node: unknown, m: Json, ctx: RenderCtx): TemplateResult {
  const id = String((node as Json)?.['id'] ?? 'crud')
  const cols = columnsOf(m)
  const title = m['title'] ? interpolate(String(m['title']), ctxScope(ctx)) : ''
  const subtitle = m['subtitle'] ? interpolate(String(m['subtitle']), ctxScope(ctx)) : ''
  const toolbar = metaItems(m['toolbar'])
  const searchable = m['searchable'] !== false
  const emptyMsg = String(m['emptyStateMessage'] ?? 'No data.')

  // Register the search data handler once (idempotent — registerDataHandler overwrites). The wire
  // sends the rows under either the crud target id or the 'crud' fallback key.
  const handler = (data: unknown) => {
    const page = extractPage(data)
    listings.set(id, {
      rows: page.content,
      total: page.total,
      page: page.pageNumber,
      size: page.pageSize,
      searchText: String(ctx.controller.currentComponentState['searchText'] ?? ''),
    })
    ctx.controller.onRender(ctx.controller.rendered) // re-render with the rows
  }
  ctx.controller.registerDataHandler('crud', handler)
  ctx.controller.registerDataHandler(id, handler)

  const state = listings.get(id)
  const rows = state?.rows ?? []

  const runSearch = () => {
    ctx.controller.seedSearchState()
    void ctx.controller.runAction('search', undefined, true)
  }
  const onSearchInput = (value: string) => {
    ctx.controller.currentComponentState['searchText'] = value
    ctx.controller.currentComponentState['page'] = 0
    runSearch()
  }

  return html`
    <div class="mateu-crud">
      <div class="mateu-crud-head">
        <div class="mateu-crud-titles">
          ${title ? html`<h1 class="oj-typography-heading-lg mateu-page-title">${title}</h1>` : nothing}
          ${subtitle ? html`<p class="oj-typography-body-md oj-text-color-secondary">${subtitle}</p>` : nothing}
        </div>
        <div class="mateu-crud-toolbar">${toolbar.map((b) => renderButton({}, b, ctx))}</div>
      </div>

      ${searchable ? renderSearchBar(ctx, onSearchInput) : nothing}

      <div class="mateu-crud-table">${renderTable(cols, rows, emptyMsg, ctx)}</div>

      ${state && state.total > state.size ? renderPagination(ctx, state, id, listings) : nothing}
    </div>
  `
}

function renderSearchBar(ctx: RenderCtx, onInput: (v: string) => void): TemplateResult {
  if (!ctx.runtime) {
    return html`<input
      class="mateu-crud-search-native"
      placeholder="Search…"
      @change=${(e: Event) => onInput((e.target as HTMLInputElement).value)}
    />`
  }
  return html`<div class="mateu-crud-search">
    ${ojElement('oj-c-input-text', {
      props: { placeholder: 'Search…', labelEdge: 'none', value: String(ctx.controller.currentComponentState['searchText'] ?? '') },
      events: { valueChanged: (e: Event) => onInput(String((e as CustomEvent).detail?.value ?? '')) },
    })}
  </div>`
}

function renderTable(cols: Col[], rows: Json[], emptyMsg: string, ctx: RenderCtx): TemplateResult {
  if (!rows.length) {
    return html`<div class="mateu-empty oj-typography-body-md oj-text-color-secondary">${emptyMsg}</div>`
  }
  if (!ctx.runtime) return renderNativeTable(cols, rows)

  const props: Record<string, unknown> = {}
  cols.forEach((c) => {
    props[c.id] = { type: c.type, labelHint: c.label, sortable: 'enabled', readonly: true }
  })
  const metadata = new ctx.runtime.JsonMetadataProvider({ data: { properties: props } })
  const flat = rows.map((r, i) => {
    const o: Record<string, unknown> = { __key: String(i) }
    cols.forEach((c) => (o[c.id] = cellValue(r[c.id])))
    return o
  })
  const data = new ctx.runtime.ArrayDataProvider(flat, { keyAttributes: '__key' })

  const onRowAction = (e: Event) => {
    const detail = (e as CustomEvent).detail as { context?: { key?: unknown }; key?: unknown } | undefined
    const key = detail?.context?.key ?? detail?.key
    const idx = key != null ? Number(key) : NaN
    const row = Number.isInteger(idx) ? rows[idx] : undefined
    if (row) void ctx.controller.runAction('view', row)
  }

  return ojElement('oj-dynamic-table', {
    props: {
      metadata,
      data,
      displayProperties: cols.map((c) => c.id),
      selectionMode: { row: 'single' },
      readonly: true,
    },
    attrs: { style: 'width:100%;' },
    events: { ojRowAction: onRowAction },
  })
}

function renderNativeTable(cols: Col[], rows: Json[]): TemplateResult {
  return html`<table class="mateu-native-table">
    <thead>
      <tr>
        ${cols.map((c) => html`<th>${c.label}</th>`)}
      </tr>
    </thead>
    <tbody>
      ${rows.map(
        (r) => html`<tr>
          ${cols.map((c) => html`<td>${String(cellValue(r[c.id]) ?? '')}</td>`)}
        </tr>`,
      )}
    </tbody>
  </table>`
}

function renderPagination(ctx: RenderCtx, state: ListingState, id: string, store: Map<string, ListingState>): TemplateResult {
  const from = state.page * state.size + 1
  const to = Math.min(state.total, (state.page + 1) * state.size)
  const lastPage = Math.max(0, Math.ceil(state.total / state.size) - 1)
  const go = (page: number) => {
    if (page < 0 || page > lastPage) return
    ctx.controller.currentComponentState['page'] = page
    store.set(id, { ...state, page })
    ctx.controller.seedSearchState()
    void ctx.controller.runAction('search', undefined, true)
  }
  return html`<div class="mateu-pagination oj-typography-body-sm">
    <span>${from}–${to} of ${state.total}</span>
    <button class="mateu-page-btn" ?disabled=${state.page <= 0} @click=${() => go(state.page - 1)}>‹</button>
    <button class="mateu-page-btn" ?disabled=${state.page >= lastPage} @click=${() => go(state.page + 1)}>›</button>
  </div>`
}

// ── helpers ───────────────────────────────────────────────────────────────────────────

function extractPage(data: unknown): { content: Json[]; total: number; pageNumber: number; pageSize: number } {
  const d = data as Json
  const page = (d?.['crud']?.['page'] ?? d?.['page'] ?? d?.['crud'] ?? d) as Json
  return {
    content: Array.isArray(page?.['content']) ? page['content'] : Array.isArray(page) ? (page as unknown as Json[]) : [],
    total: Number(page?.['totalElements'] ?? 0),
    pageNumber: Number(page?.['pageNumber'] ?? 0),
    pageSize: Number(page?.['pageSize'] ?? 10),
  }
}

function cellValue(v: unknown): unknown {
  if (v && typeof v === 'object') {
    const o = v as Json
    return o['text'] ?? o['label'] ?? o['value'] ?? ''
  }
  return v
}
