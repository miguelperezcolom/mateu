import { customElement, property, state } from 'lit/decorators.js'
import { html, nothing, type TemplateResult, LitElement } from 'lit'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'

/** PatternFly 6 accordion (pf-v6-c-accordion). Light DOM. */
@customElement('mateu-redhat-accordion')
export class MateuRedhatAccordion extends LitElement {
    @property({ attribute: false }) component: any
    @property({ attribute: false }) container: any
    @property() baseUrl: string | undefined
    @property({ attribute: false }) compState: any
    @property({ attribute: false }) compData: any
    @property({ attribute: false }) appState: any
    @property({ attribute: false }) appData: any
    @state() private open: Record<number, boolean> = {}
    private initialized = false

    createRenderRoot() { return this }

    private label(panel: any): string {
        const raw = panel?.metadata?.label
        return raw && typeof raw === 'string' && raw.includes('${') && this.container?._evalTemplate
            ? this.container._evalTemplate(raw) : (raw ?? '')
    }

    render(): TemplateResult {
        const panels: any[] = this.component?.children ?? []
        if (!this.initialized) { panels.forEach((p, i) => { if (p?.metadata?.active) this.open[i] = true }); this.initialized = true }
        return html`
            <div class="pf-v6-c-accordion">
                ${panels.map((panel, i) => {
                    const isOpen = !!this.open[i]
                    return html`
                        <h3>
                            <button class="pf-v6-c-accordion__toggle ${isOpen ? 'pf-m-expanded' : ''}" type="button"
                                    aria-expanded="${isOpen}" ?disabled="${panel?.metadata?.disabled}"
                                    @click="${() => { this.open = { ...this.open, [i]: !isOpen } }}">
                                <span class="pf-v6-c-accordion__toggle-text">${this.label(panel)}</span>
                                <span class="pf-v6-c-accordion__toggle-icon"><span style="display:inline-block; transform:rotate(${isOpen ? '90' : '0'}deg);">›</span></span>
                            </button>
                        </h3>
                        <div class="pf-v6-c-accordion__expandable-content ${isOpen ? 'pf-m-expanded' : ''}" ?hidden="${!isOpen}">
                            <div class="pf-v6-c-accordion__expandable-content-body">
                                ${isOpen ? (panel?.children ?? []).map((c: any) =>
                                    renderComponent(this.container, c, this.baseUrl, this.compState, this.compData, this.appState, this.appData)) : nothing}
                            </div>
                        </div>`
                })}
            </div>`
    }
}
declare global { interface HTMLElementTagNameMap { 'mateu-redhat-accordion': MateuRedhatAccordion } }
