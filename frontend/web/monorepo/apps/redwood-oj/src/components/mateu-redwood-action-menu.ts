import { customElement, property } from "lit/decorators.js"
import { html, LitElement, nothing, TemplateResult } from "lit"

@customElement('mateu-redwood-action-menu')
export class MateuRedwoodActionMenu extends LitElement {

    @property({ type: Array })
    actions: any[] = []

    @property({ type: Object })
    rowdata: any = {}

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this
    }

    private handleMenuAction(e: CustomEvent) {
        e.stopPropagation()
        const key = e.detail?.key
        if (!key) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: key,
                parameters: { _clickedRow: this.rowdata }
            },
            bubbles: true,
            composed: true
        }))
    }

    render(): TemplateResult {
        const actions = this.actions ?? []
        if (!actions.length) return html`${nothing}`

        const items = actions.map(a => ({
            label: a.label ?? a.text ?? '',
            key: a.methodNameInCrud ?? a.actionId ?? a.id ?? a.key ?? a.label,
            disabled: a.disabled ?? false
        }))

        return html`
            <oj-c-menu-button
                data-oj-binding-provider="preact"
                label="···"
                chroming="borderless"
                .items="${items}"
                @ojMenuAction="${(e: CustomEvent) => this.handleMenuAction(e)}"
            ></oj-c-menu-button>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-redwood-action-menu': MateuRedwoodActionMenu
    }
}
