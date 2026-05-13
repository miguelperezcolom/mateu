import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement, nothing, TemplateResult } from "lit";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";

@customElement('mateu-redwood-filter-bar')
export class MateuRedwoodFilterBar extends LitElement {

    @property()
    metadata: Crud | undefined

    @property()
    baseUrl = ''

    @property()
    state: Record<string, any> = {}

    @property()
    data: Record<string, any> = {}

    @property()
    appState: Record<string, any> = {}

    @property()
    appData: Record<string, any> = {}

    @state()
    private localSearchText = ''

    private dispatchValueChanged(value: string, fieldId: string) {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: { value, fieldId },
            bubbles: true,
            composed: true
        }))
    }

    private dispatchSearchRequested() {
        this.dispatchEvent(new CustomEvent('search-requested', {
            detail: {},
            bubbles: true,
            composed: true
        }))
    }

    private handleValueAction(e: CustomEvent) {
        this.localSearchText = e.detail.value ?? ''
        this.dispatchValueChanged(this.localSearchText, 'searchText')
    }

    private handleSearchClick() {
        // Read raw value from input in case user hasn't committed yet
        const input = this.renderRoot?.querySelector('oj-c-input-text') as any
        const currentValue = input?.rawValue ?? input?.value ?? this.localSearchText
        if (currentValue !== this.localSearchText) {
            this.localSearchText = currentValue
            this.dispatchValueChanged(currentValue, 'searchText')
        }
        this.dispatchSearchRequested()
    }

    private handleKey(e: KeyboardEvent) {
        if (e.code === 'Enter' && this.metadata?.searchOnEnter) {
            this.handleSearchClick()
        }
    }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('keydown', (e: Event) => this.handleKey(e as KeyboardEvent))
    }

    render(): TemplateResult {
        return html`
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; padding: 0.25rem 0;">
                ${this.metadata?.searchable ? html`
                    <oj-c-input-text
                        data-oj-binding-provider="preact"
                        label-hint="Search"
                        label-edge="none"
                        .value="${this.state.searchText ?? ''}"
                        @ojValueAction="${(e: CustomEvent) => this.handleValueAction(e)}"
                        style="min-width: 220px;"
                    ></oj-c-input-text>
                    <oj-c-button
                        data-oj-binding-provider="preact"
                        label="Search"
                        chroming="callToAction"
                        @ojAction="${() => this.handleSearchClick()}"
                    ></oj-c-button>
                ` : nothing}
                ${this.metadata?.toolbar?.map(button => html`
                    <oj-c-button
                        data-oj-binding-provider="preact"
                        label="${button.label}"
                        chroming="outlined"
                        ?disabled="${button.disabled}"
                        @ojAction="${() => this.dispatchEvent(new CustomEvent('action-requested', {
                            detail: { actionId: button.actionId },
                            bubbles: true,
                            composed: true
                        }))}"
                    ></oj-c-button>
                `)}
                <slot></slot>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-redwood-filter-bar': MateuRedwoodFilterBar
    }
}
