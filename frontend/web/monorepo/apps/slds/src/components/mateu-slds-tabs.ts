import { customElement, property, state } from 'lit/decorators.js'
import { html, nothing, type TemplateResult, LitElement } from 'lit'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'

/**
 * SLDS 2 tab set. Renders an slds-tabs_default nav from the Tab children and the active panel's
 * content (recursing through renderComponent). Light DOM so the global SLDS stylesheet applies.
 */
@customElement('mateu-slds-tabs')
export class MateuSldsTabs extends LitElement {

    @property({ attribute: false }) component: any
    @property({ attribute: false }) container: any
    @property() baseUrl: string | undefined
    @property({ attribute: false }) compState: any
    @property({ attribute: false }) compData: any
    @property({ attribute: false }) appState: any
    @property({ attribute: false }) appData: any

    @state() private selected = 0

    createRenderRoot() {
        return this
    }

    private label(tab: any): string {
        const raw = tab?.metadata?.label
        if (raw && typeof raw === 'string' && raw.includes('${') && this.container?._evalTemplate) {
            return this.container._evalTemplate(raw)
        }
        return raw ?? ''
    }

    render(): TemplateResult {
        const tabs: any[] = this.component?.children ?? []
        const active = tabs[this.selected]
        return html`
            <div class="slds-tabs_default">
                <ul class="slds-tabs_default__nav" role="tablist">
                    ${tabs.map((tab, i) => html`
                        <li class="slds-tabs_default__item ${i === this.selected ? 'slds-is-active' : ''}"
                            role="presentation">
                            <a class="slds-tabs_default__link" href="javascript:void(0)" role="tab"
                               aria-selected="${i === this.selected}"
                               data-shortcut="${tab?.metadata?.shortcut ?? nothing}"
                               @click="${() => { this.selected = i }}">
                                ${this.label(tab)}
                            </a>
                        </li>`)}
                </ul>
                <div class="slds-tabs_default__content slds-show" role="tabpanel">
                    ${(active?.children ?? []).map((child: any) =>
                        renderComponent(this.container, child, this.baseUrl, this.compState, this.compData, this.appState, this.appData))}
                </div>
            </div>`
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-slds-tabs': MateuSldsTabs
    }
}
