import { LitElement, html, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

/**
 * Authentic Redwood tabs: an `oj-c-tab-bar` strip + the active panel. The renderer passes the tab
 * `labels` and the pre-rendered `panels` (one TemplateResult per tab); selection is local state, so
 * switching tabs never round-trips to the server. Light DOM so the oj-c-tab-bar upgrades (it needs
 * the body's preact binding provider, which doesn't cross a shadow root).
 */
@customElement('mateu-spectra-tabs')
export class MateuSpectraTabs extends LitElement {
  @property({ attribute: false }) labels: string[] = []
  @property({ attribute: false }) panels: TemplateResult[] = []
  @property({ attribute: false }) initialIndex = 0

  @state() private selected = 0
  private seeded = false

  protected createRenderRoot(): HTMLElement {
    return this
  }

  protected willUpdate(_c: PropertyValues): void {
    if (!this.seeded) {
      this.selected = this.initialIndex ?? 0
      this.seeded = true
    }
  }

  protected render() {
    const data = this.labels.map((label, i) => ({ itemKey: i, label }))
    return html`
      <oj-c-tab-bar
        .data=${data}
        .selection=${this.selected}
        layout="stretch"
        @ojSelectionAction=${(e: CustomEvent) => {
          const v = (e.detail as { value?: unknown } | undefined)?.value
          if (typeof v === 'number') this.selected = v
        }}
      ></oj-c-tab-bar>
      <div style="padding-top: var(--lumo-space-m, 1rem);">${this.panels[this.selected]}</div>
    `
  }
}
