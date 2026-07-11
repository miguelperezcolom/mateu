import { customElement, property, state } from 'lit/decorators.js'
import { html, type TemplateResult, LitElement } from 'lit'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'

/**
 * Redwood (Oracle JET) accordion: a stack of real oj-c-collapsible panels (module in the demo.js
 * require list); renders open panels' content through renderComponent. Light DOM so JET's
 * document-level CSS reaches the collapsibles.
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
                        <oj-c-collapsible data-oj-binding-provider="preact"
                                ?expanded="${isOpen}"
                                ?disabled="${panel?.metadata?.disabled}"
                                @ojExpand="${() => { this.open = { ...this.open, [i]: true } }}"
                                @ojCollapse="${() => { this.open = { ...this.open, [i]: false } }}">
                            <span slot="header" class="oj-typography-heading-sm">${this.label(panel)}</span>
                            <div>
                                ${(panel?.children ?? []).map((child: any) =>
                                    renderComponent(this.container, child, this.baseUrl, this.compState, this.compData, this.appState, this.appData))}
                            </div>
                        </oj-c-collapsible>`
                })}
            </div>`
    }
}

declare global {
    interface HTMLElementTagNameMap { 'mateu-redwood-accordion': MateuRedwoodAccordion }
}
