import { customElement, property, state } from 'lit/decorators.js'
import { html, nothing, type TemplateResult, LitElement } from 'lit'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'

/**
 * Redwood (Oracle JET) accordion. Light-DOM collapsible panels styled with oj-panel/oj-typography;
 * renders open panels' content through renderComponent.
 */
@customElement('mateu-redwood-accordion')
export class MateuRedwoodAccordion extends LitElement {

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
        if (!this.initialized) {
            panels.forEach((p, i) => { if (p?.metadata?.active) this.open[i] = true })
            this.initialized = true
        }
        return html`
            <div style="display:flex; flex-direction:column; gap:.5rem;">
                ${panels.map((panel, i) => {
                    const isOpen = !!this.open[i]
                    return html`
                        <div class="oj-panel" style="border-radius:var(--oj-core-border-radius-lg, 8px); overflow:hidden;">
                            <button aria-expanded="${isOpen}" ?disabled="${panel?.metadata?.disabled}"
                                    class="oj-typography-heading-sm"
                                    @click="${() => { this.open = { ...this.open, [i]: !isOpen } }}"
                                    style="width:100%; text-align:left; border:none; background:none; cursor:pointer;
                                           padding:.75rem 1rem; display:flex; justify-content:space-between; align-items:center;">
                                <span>${this.label(panel)}</span>
                                <span style="transform:rotate(${isOpen ? '90' : '0'}deg); transition:transform .15s;">›</span>
                            </button>
                            ${isOpen ? html`
                                <div style="padding:0 1rem 1rem;">
                                    ${(panel?.children ?? []).map((child: any) =>
                                        renderComponent(this.container, child, this.baseUrl, this.compState, this.compData, this.appState, this.appData))}
                                </div>` : nothing}
                        </div>`
                })}
            </div>`
    }
}

declare global {
    interface HTMLElementTagNameMap { 'mateu-redwood-accordion': MateuRedwoodAccordion }
}
