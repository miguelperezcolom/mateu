import { LitElement, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface TableCol {
  id: string
  label: string
  type: string
}

/**
 * Mateu crud/grid listings rendered with the authentic Oracle `oj-dynamic-table` (the Dynamic UI
 * pack, loaded from the public JET CDN). Metadata-driven: we build a JsonMetadataProvider from the
 * columns (type + labelHint) and an ArrayDataProvider from the (flattened) rows, then hand them to
 * the table. Read-only; a row click dispatches the crud's standard `action-requested { view }` so the
 * detail/edit flow keeps working. Light DOM so the oj component upgrades.
 */
@customElement('mateu-spectra-table')
export class MateuSpectraTable extends LitElement {
  @property({ attribute: false }) columns: TableCol[] = []
  @property({ attribute: false }) rows: unknown[] = []
  @property() emptyMessage = ''

  private provider?: unknown
  private dp?: unknown
  private displayProps: string[] = []

  protected createRenderRoot(): HTMLElement {
    return this
  }

  protected willUpdate(c: PropertyValues): void {
    if (c.has('columns') || c.has('rows')) this.rebuild()
  }

  private rebuild(): void {
    const w = window as unknown as {
      __mateuJsonMetadataProvider?: new (o: unknown) => unknown
      __mateuArrayDataProvider?: new (d: unknown[], o: unknown) => unknown
    }
    if (!w.__mateuJsonMetadataProvider || !w.__mateuArrayDataProvider) return
    const props: Record<string, unknown> = {}
    this.columns.forEach((col) => {
      props[col.id] = { type: col.type, labelHint: col.label, sortable: 'enabled', readonly: true }
    })
    this.provider = new w.__mateuJsonMetadataProvider({ data: { properties: props } })
    this.displayProps = this.columns.map((c) => c.id)
    const flat = (this.rows ?? []).map((r, i) => {
      const o: Record<string, unknown> = { __key: String(i) }
      const row = r as Record<string, unknown> | undefined
      this.columns.forEach((c) => {
        const v = row?.[c.id]
        o[c.id] =
          v && typeof v === 'object'
            ? ((v as Record<string, unknown>).text ??
              (v as Record<string, unknown>).label ??
              (v as Record<string, unknown>).value ??
              '')
            : v
      })
      return o
    })
    this.dp = new w.__mateuArrayDataProvider(flat, { keyAttributes: '__key' })
  }

  private onRowAction(e: Event): void {
    const detail = (e as CustomEvent).detail as { context?: { key?: unknown }; key?: unknown } | undefined
    const key = detail?.context?.key ?? detail?.key
    const idx = key != null ? Number(key) : NaN
    const row = Number.isInteger(idx) ? this.rows?.[idx] : undefined
    if (row == null) return
    this.dispatchEvent(
      new CustomEvent('action-requested', {
        detail: { actionId: 'view', parameters: row },
        bubbles: true,
        composed: true,
      }),
    )
  }

  protected render() {
    if (!this.rows?.length) {
      return html`<div
        style="padding:1.5rem; text-align:center; color:var(--lumo-secondary-text-color,#888);"
      >
        ${this.emptyMessage || 'No data.'}
      </div>`
    }
    if (!this.provider || !this.dp) return html`<div style="padding:1rem;"></div>`
    return html`<oj-dynamic-table
      .metadata=${this.provider}
      .data=${this.dp}
      .displayProperties=${this.displayProps}
      .selectionMode=${{ row: 'single' }}
      .readonly=${true}
      style="width:100%;"
      @ojRowAction=${(e: Event) => this.onRowAction(e)}
    ></oj-dynamic-table>`
  }
}
