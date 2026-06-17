import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement, nothing, TemplateResult } from "lit";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";

@customElement('mateu-sapui5-filter-bar')
export class MateuSapUI5FilterBar extends LitElement {

    @property() metadata: Crud | undefined
    @property() baseUrl = ''
    @property() state: Record<string, any> = {}
    @property() data: Record<string, any> = {}
    @property() appState: Record<string, any> = {}
    @property() appData: Record<string, any> = {}

    @state() private filtersOpen = false

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    connectedCallback() {
        super.connectedCallback()
        if (this.metadata?.searchOnEnter) {
            this.addEventListener('keydown', this.handleKey as EventListener)
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.removeEventListener('keydown', this.handleKey as EventListener)
    }

    private handleKey = (e: KeyboardEvent) => {
        if (e.code === 'Enter') {
            this.filtersOpen = false
            this.triggerSearch()
        }
    }

    private triggerSearch() {
        this.dispatchEvent(new CustomEvent('search-requested', {
            bubbles: true, composed: true, detail: {}
        }))
    }

    private clearFilters() {
        this.metadata?.filters?.forEach((filter: any) => {
            this.dispatchEvent(new CustomEvent('value-changed', {
                detail: { value: undefined, fieldId: filter.fieldId ?? filter.id },
                bubbles: true, composed: true
            }))
        })
        this.triggerSearch()
    }

    private clearSingleFilter(fieldId: string) {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: { value: undefined, fieldId },
            bubbles: true, composed: true
        }))
        this.triggerSearch()
    }

    private getFilterDisplayValue(field: FormField, value: any): string {
        if ((field as any).options?.length) {
            const opt = (field as any).options.find((o: any) => o.value === String(value))
            if (opt) return opt.label
        }
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        return String(value)
    }

    private renderActiveFilterBadges() {
        const active = (this.metadata?.filters ?? [])
            .map(f => f as unknown as FormField)
            .filter(field => {
                const v = this.state[field.fieldId]
                return v !== undefined && v !== null && v !== ''
            })
        if (active.length === 0) return nothing
        return html`
            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; padding: 0.25rem 0;">
                ${active.map(field => html`
                    <ui5-token
                        text="${field.label}: ${this.getFilterDisplayValue(field, this.state[field.fieldId])}"
                        @ui5-delete="${() => this.clearSingleFilter(field.fieldId)}"
                    ></ui5-token>
                `)}
            </div>
        `
    }

    private dispatchToolbarAction(actionId: string) {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId },
            bubbles: true, composed: true
        }))
    }

    private wrapFilter(filter: any): ClientSideComponent {
        return {
            id: (filter as FormField).fieldId ?? '',
            metadata: { ...(filter as FormField) },
            type: ComponentType.ClientSide,
            style: '',
            children: [],
            slot: '',
            cssClasses: '',
            initialData: {}
        } as unknown as ClientSideComponent
    }

    render(): TemplateResult {
        const hasFilters = (this.metadata?.filters?.length ?? 0) > 0

        return html`
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; padding: 0.25rem 0;">
                ${this.metadata?.searchable ? html`
                    <ui5-input
                        id="searchText"
                        placeholder="Search..."
                        value="${this.state?.searchText ?? ''}"
                        style="flex: 1; min-width: 180px;"
                        @input="${(e: Event) => {
                            this.state.searchText = (e.target as HTMLInputElement).value
                        }}"
                        @keydown="${(e: KeyboardEvent) => {
                            if (e.code === 'Enter') this.triggerSearch()
                        }}"
                    ></ui5-input>
                ` : nothing}

                ${hasFilters ? html`
                    <ui5-button
                        @click="${() => this.filtersOpen = !this.filtersOpen}"
                    >${this.filtersOpen ? 'Hide Filters' : 'Filters'}</ui5-button>
                    <ui5-button @click="${() => this.clearFilters()}">Clear</ui5-button>
                ` : nothing}

                ${this.metadata?.searchable ? html`
                    <ui5-button design="Emphasized" @click="${() => this.triggerSearch()}">Search</ui5-button>
                ` : nothing}

                ${this.metadata?.toolbar?.map(button => html`
                    <ui5-button @click="${() => this.dispatchToolbarAction(button.actionId)}">
                        ${button.label}
                    </ui5-button>
                `)}

                <slot></slot>
            </div>

            ${this.renderActiveFilterBadges()}

            ${this.filtersOpen && hasFilters ? html`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; padding: 0.75rem 0;">
                    ${this.metadata?.filters?.map(filter =>
                        renderComponent(this, this.wrapFilter(filter), this.baseUrl, this.state, this.data, this.appState, this.appData)
                    )}
                </div>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-bottom: 0.5rem;">
                    <ui5-button @click="${() => { this.filtersOpen = false; this.clearFilters() }}">Clear</ui5-button>
                    <ui5-button design="Emphasized" @click="${() => { this.filtersOpen = false; this.triggerSearch() }}">Search</ui5-button>
                </div>
            ` : nothing}
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-sapui5-filter-bar': MateuSapUI5FilterBar
    }
}
