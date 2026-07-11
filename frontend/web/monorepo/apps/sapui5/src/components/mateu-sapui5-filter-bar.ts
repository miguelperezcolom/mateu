import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement, nothing, TemplateResult } from "lit";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { ResolvedFiltersLayout, selectFiltersLayout } from "@infra/ui/layout/weightEngine.ts";

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

    private get effectiveFiltersLayout(): ResolvedFiltersLayout {
        const raw = this.metadata?.filtersLayout ?? 'auto'
        if (raw === 'auto') return selectFiltersLayout(this.metadata?.filters ?? [])
        return raw as ResolvedFiltersLayout
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
        const cleared: Record<string, any> = {}
        this.metadata?.filters?.forEach((filter: any) => {
            cleared[filter.fieldId ?? filter.id] = undefined
        })
        cleared['searchText'] = undefined
        this.state = { ...this.state, ...cleared }
        this.metadata?.filters?.forEach((filter: any) => {
            this.dispatchEvent(new CustomEvent('value-changed', {
                detail: { value: undefined, fieldId: filter.fieldId ?? filter.id },
                bubbles: true, composed: true
            }))
        })
        this.triggerSearch()
    }

    private clearSingleFilter(fieldId: string) {
        this.state = { ...this.state, [fieldId]: undefined }
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

    /** Active-filter chips — always visible regardless of where controls live. */
    private renderActiveFilterChips() {
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
            </div>`
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

    private renderFilterControls() {
        return html`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; padding: 0.75rem 0;">
                ${this.metadata?.filters?.map(filter =>
                    renderComponent(this, this.wrapFilter(filter), this.baseUrl, this.state, this.data, this.appState, this.appData)
                )}
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-bottom: 0.5rem;">
                <ui5-button @click="${() => { this.filtersOpen = false; this.clearFilters() }}">Clear</ui5-button>
                <ui5-button design="Emphasized" @click="${() => { this.filtersOpen = false; this.triggerSearch() }}">Search</ui5-button>
            </div>`
    }

    /** Renders filter controls inline beside the search bar. */
    private renderInlineFilters() {
        return html`
            ${this.metadata?.filters?.map(filter =>
                renderComponent(this, this.wrapFilter(filter), this.baseUrl, this.state, this.data, this.appState, this.appData)
            )}`
    }

    /** Renders a drawer that slides in from the right. */
    private renderDrawer() {
        return html`
            <div
                style="
                    position: fixed; inset: 0 0 0 auto;
                    width: min(360px, 90vw);
                    background: var(--sapBackgroundColor, #fff);
                    box-shadow: var(--sapContent_Shadow3, -4px 0 12px rgba(0,0,0,.15));
                    z-index: 200;
                    display: flex; flex-direction: column;
                    transform: ${this.filtersOpen ? 'translateX(0)' : 'translateX(100%)'};
                    transition: transform .2s ease;
                    padding: 1rem;
                ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <span style="font-size: 1rem; font-weight: 600;">Filters</span>
                    <ui5-button design="Transparent" icon="decline" @click="${() => this.filtersOpen = false}"></ui5-button>
                </div>
                <div style="flex: 1; overflow-y: auto;">
                    ${this.renderFilterControls()}
                </div>
            </div>
            ${this.filtersOpen ? html`
                <div
                    style="position: fixed; inset: 0; background: rgba(0,0,0,.32); z-index: 199;"
                    @click="${() => this.filtersOpen = false}"
                ></div>` : nothing}`
    }

    /** Renders a modal dialog. */
    private renderDialog() {
        return html`
            <ui5-dialog
                header-text="Filters"
                ?open="${this.filtersOpen}"
                @ui5-after-close="${() => this.filtersOpen = false}"
            >
                ${this.renderFilterControls()}
                <div slot="footer" style="display: flex; gap: 0.5rem; justify-content: flex-end; padding: 0.5rem 1rem;">
                    <ui5-button @click="${() => { this.filtersOpen = false; this.clearFilters() }}">Clear</ui5-button>
                    <ui5-button design="Emphasized" @click="${() => { this.filtersOpen = false; this.triggerSearch() }}">Search</ui5-button>
                </div>
            </ui5-dialog>`
    }

    render(): TemplateResult {
        const hasFilters = (this.metadata?.filters?.length ?? 0) > 0
        const layout = this.effectiveFiltersLayout

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

                ${hasFilters && layout === 'inline' ? this.renderInlineFilters() : nothing}

                ${hasFilters && (layout === 'popover' || layout === 'drawer' || layout === 'dialog') ? html`
                    <ui5-button
                        @click="${() => this.filtersOpen = !this.filtersOpen}"
                    >${this.filtersOpen ? 'Hide Filters' : 'Filters'}</ui5-button>
                    <ui5-button @click="${() => this.clearFilters()}">Clear</ui5-button>
                ` : nothing}

                ${this.metadata?.searchable ? html`
                    <ui5-button design="Emphasized" @click="${() => this.triggerSearch()}">Search</ui5-button>
                ` : nothing}

                <slot></slot>
            </div>

            ${this.renderActiveFilterChips()}

            ${hasFilters && layout === 'popover' && this.filtersOpen ? html`
                <div style="border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; padding: 0.75rem; margin-top: 0.25rem;">
                    ${this.renderFilterControls()}
                </div>
            ` : nothing}

            ${hasFilters && layout === 'drawer' ? this.renderDrawer() : nothing}

            ${hasFilters && layout === 'dialog' ? this.renderDialog() : nothing}
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-sapui5-filter-bar': MateuSapUI5FilterBar
    }
}
