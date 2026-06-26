import { customElement, property, state } from 'lit/decorators.js'
import { html, nothing, type TemplateResult, LitElement } from 'lit'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'

/**
 * SLDS 2 accordion. Renders the AccordionPanel children as slds-accordion sections, recursing each
 * panel's content. Light DOM. Multiple panels can be open; initial open state honors `active`.
 */
@customElement('mateu-slds-accordion')
export class MateuSldsAccordion extends LitElement {

    @property({ attribute: false }) component: any
    @property({ attribute: false }) container: any
    @property() baseUrl: string | undefined
    @property({ attribute: false }) compState: any
    @property({ attribute: false }) compData: any
    @property({ attribute: false }) appState: any
    @property({ attribute: false }) appData: any

    @state() private open: Record<number, boolean> = {}
    private initialized = false

    createRenderRoot() {
        return this
    }

    private label(panel: any): string {
        const raw = panel?.metadata?.label
        if (raw && typeof raw === 'string' && raw.includes('${') && this.container?._evalTemplate) {
            return this.container._evalTemplate(raw)
        }
        return raw ?? ''
    }

    render(): TemplateResult {
        const panels: any[] = this.component?.children ?? []
        if (!this.initialized) {
            panels.forEach((p, i) => { if (p?.metadata?.active) this.open[i] = true })
            this.initialized = true
        }
        return html`
            <ul class="slds-accordion">
                ${panels.map((panel, i) => {
                    const isOpen = !!this.open[i]
                    return html`
                        <li class="slds-accordion__list-item">
                            <section class="slds-accordion__section ${isOpen ? 'slds-is-open' : ''}">
                                <div class="slds-accordion__summary">
                                    <h3 class="slds-accordion__summary-heading slds-text-heading_small">
                                        <button class="slds-button slds-button_reset slds-accordion__summary-action"
                                                aria-expanded="${isOpen}"
                                                ?disabled="${panel?.metadata?.disabled}"
                                                @click="${() => { this.open = { ...this.open, [i]: !isOpen } }}">
                                            <span class="slds-accordion__summary-content">${this.label(panel)}</span>
                                        </button>
                                    </h3>
                                </div>
                                <div class="slds-accordion__content" aria-hidden="${!isOpen}"
                                     style="${isOpen ? '' : 'display:none;'}">
                                    ${isOpen ? (panel?.children ?? []).map((child: any) =>
                                        renderComponent(this.container, child, this.baseUrl, this.compState, this.compData, this.appState, this.appData)) : nothing}
                                </div>
                            </section>
                        </li>`
                })}
            </ul>`
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-slds-accordion': MateuSldsAccordion
    }
}
