import { customElement, property, state } from 'lit/decorators.js'
import { html, type TemplateResult, LitElement } from 'lit'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'

/**
 * Redwood (Oracle JET) tab set. Real oj-c-tab-bar strip (it takes a plain TabData array, no data
 * provider needed — same pattern as the app shell's TABS variant); renders the active tab's
 * content through renderComponent. Light DOM so JET's document-level CSS reaches the tab bar.
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
        const data = tabs.map((tab, i) => ({ itemKey: String(i), label: this.label(tab) }))
        const active = tabs[this.selected]
        return html`
            <div>
                <oj-c-tab-bar data-oj-binding-provider="preact"
                        .data="${data}"
                        .selection="${String(this.selected)}"
                        edge="top"
                        @ojSelectionAction="${(e: CustomEvent) => { this.selected = parseInt(e.detail.value, 10) || 0 }}"
                ></oj-c-tab-bar>
                <div role="tabpanel" style="padding-top: 1rem;">
                    ${(active?.children ?? []).map((child: any) =>
                        renderComponent(this.container, child, this.baseUrl, this.compState, this.compData, this.appState, this.appData))}
                </div>
            </div>`
    }
}

declare global {
    interface HTMLElementTagNameMap { 'mateu-redwood-tabs': MateuRedwoodTabs }
}
