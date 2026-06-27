import { customElement, property, state } from 'lit/decorators.js'
import { html, type TemplateResult, LitElement } from 'lit'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'

/**
 * Redwood (Oracle JET) tab set. Light-DOM tab strip styled with oj-typography; renders the active
 * tab's content through renderComponent. Avoids the oj-c-tab-bar data-provider binding for a simple
 * self-contained component.
 */
@customElement('mateu-redwood-tabs')
export class MateuRedwoodTabs extends LitElement {

    @property({ attribute: false }) component: any
    @property({ attribute: false }) container: any
    @property() baseUrl: string | undefined
    @property({ attribute: false }) compState: any
    @property({ attribute: false }) compData: any
    @property({ attribute: false }) appState: any
    @property({ attribute: false }) appData: any

    @state() private selected = 0

    createRenderRoot() { return this }

    private label(tab: any): string {
        const raw = tab?.metadata?.label
        return raw && typeof raw === 'string' && raw.includes('${') && this.container?._evalTemplate
            ? this.container._evalTemplate(raw) : (raw ?? '')
    }

    render(): TemplateResult {
        const tabs: any[] = this.component?.children ?? []
        const active = tabs[this.selected]
        return html`
            <div>
                <div role="tablist" style="display:flex; gap:.25rem; border-bottom:1px solid var(--oj-core-divider-color, #e0e0e0); margin-bottom:1rem;">
                    ${tabs.map((tab, i) => html`
                        <button role="tab" aria-selected="${i === this.selected}"
                                class="oj-typography-body-md"
                                @click="${() => { this.selected = i }}"
                                style="border:none; background:none; cursor:pointer; padding:.5rem 1rem;
                                       border-bottom:2px solid ${i === this.selected ? 'var(--oj-core-text-color-brand, #1b6fdb)' : 'transparent'};
                                       color:${i === this.selected ? 'var(--oj-core-text-color-brand, #1b6fdb)' : 'inherit'};
                                       font-weight:${i === this.selected ? '700' : '400'};">
                            ${this.label(tab)}
                        </button>`)}
                </div>
                <div role="tabpanel">
                    ${(active?.children ?? []).map((child: any) =>
                        renderComponent(this.container, child, this.baseUrl, this.compState, this.compData, this.appState, this.appData))}
                </div>
            </div>`
    }
}

declare global {
    interface HTMLElementTagNameMap { 'mateu-redwood-tabs': MateuRedwoodTabs }
}
