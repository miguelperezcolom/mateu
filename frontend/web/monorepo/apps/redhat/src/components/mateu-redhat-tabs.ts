import { customElement, property, state } from 'lit/decorators.js'
import { html, type TemplateResult, LitElement } from 'lit'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'

/** PatternFly 6 tabs (pf-v6-c-tabs). Light DOM; renders the active tab content via renderComponent. */
@customElement('mateu-redhat-tabs')
export class MateuRedhatTabs extends LitElement {
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
                <div class="pf-v6-c-tabs pf-m-box">
                    <ul class="pf-v6-c-tabs__list">
                        ${tabs.map((tab, i) => html`
                            <li class="pf-v6-c-tabs__item ${i === this.selected ? 'pf-m-current' : ''}">
                                <button class="pf-v6-c-tabs__link" type="button" @click="${() => { this.selected = i }}">
                                    <span class="pf-v6-c-tabs__item-text">${this.label(tab)}</span>
                                </button>
                            </li>`)}
                    </ul>
                </div>
                <div style="padding: var(--pf-t--global--spacer--md, 1rem) 0;">
                    ${(active?.children ?? []).map((c: any) =>
                        renderComponent(this.container, c, this.baseUrl, this.compState, this.compData, this.appState, this.appData))}
                </div>
            </div>`
    }
}
declare global { interface HTMLElementTagNameMap { 'mateu-redhat-tabs': MateuRedhatTabs } }
