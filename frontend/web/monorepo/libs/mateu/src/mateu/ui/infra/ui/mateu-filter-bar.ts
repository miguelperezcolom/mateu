import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, nothing, TemplateResult} from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/text-field'
import '@vaadin/integer-field'
import '@vaadin/number-field'
import "@vaadin/menu-bar"
import "@vaadin/grid"
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import {dialogFooterRenderer, dialogRenderer} from "@vaadin/dialog/lit";
import {renderComponent} from "@infra/ui/renderers/renderComponent.ts";
import {ComponentType} from "@mateu/shared/apiClients/dtos/ComponentType";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import {ResolvedFiltersLayout, selectFiltersLayout} from "@infra/ui/layout/weightEngine.ts";


@customElement('mateu-filter-bar')
export class MateuFilterBar extends LitElement {


    @property()
    metadata: Crud | undefined

    @property()
    baseUrl = ''

    @state()
    state: Record<string, any> = {}

    @state()
    data: Record<string, any> = {}

    @property()
    appState: Record<string, any> = {}

    @property()
    appData: Record<string, any> = {}

    @property({ type: Boolean })
    searchOnly = false

    @state()
    filtersOpened = false

    private get effectiveFiltersLayout(): ResolvedFiltersLayout {
        const raw = this.metadata?.filtersLayout ?? 'auto'
        if (raw === 'auto') return selectFiltersLayout(this.metadata?.filters ?? [])
        return raw as ResolvedFiltersLayout
    }

    clickedOnClearFilters = () => {
        this.dispatchEvent(new CustomEvent('filter-reset-requested', {
            detail: {
                fieldIds: this.metadata?.filters.map(filter => (filter as unknown as FormField).fieldId)
            },
            bubbles: true,
            composed: true
        }))
        this.handleButtonClick()
    }
    clickedOnFilters = () => {
        this.filtersOpened = true
    }

    clickedOnSearch = () => {
        this.filtersOpened = false
        this.handleButtonClick()
    }

    private handleKey(e: KeyboardEvent) {
        if (e.code == 'Enter') {
            this.filtersOpened = false
            this.handleButtonClick()
        }
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.metadata?.searchOnEnter) {
            this.addEventListener('keydown', this.handleKey)
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.metadata?.searchOnEnter) {
            this.removeEventListener('keydown', this.handleKey)
        }
    }

    valueChanged = (e: CustomEvent) => {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: e.detail.value,
                fieldId: (e.target as HTMLElement).id
            },
            bubbles: true,
            composed: true
        }))
    }

    handleButtonClick = () => {
        this.dispatchEvent(new CustomEvent('search-requested', {
            detail: {
            },
            bubbles: true,
            composed: true
        }))
    }

    private getFilterDisplayValue(field: FormField, value: any): string {
        if (field.options?.length) {
            const opt = field.options.find(o => o.value === String(value))
            if (opt) return opt.label
        }
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        return String(value)
    }

    private clearFilter(fieldId: string) {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: { value: undefined, fieldId },
            bubbles: true,
            composed: true
        }))
        this.handleButtonClick()
    }

    renderActiveFilterBadges = () => {
        const active = (this.metadata?.filters ?? [])
            .map(f => f as unknown as FormField)
            .filter(field => {
                const v = this.state[field.fieldId]
                return v !== undefined && v !== null && v !== ''
            })
        if (active.length === 0) return nothing
        return html`
            <div class="active-filters">
                ${active.map(field => html`
                    <span theme="badge contrast pill" class="active-filter-badge">
                        <span>${field.label}: ${this.getFilterDisplayValue(field, this.state[field.fieldId])}</span>
                        <button
                            class="active-filter-remove"
                            @click="${() => this.clearFilter(field.fieldId)}"
                            aria-label="Remove filter"
                        >✕</button>
                    </span>
                `)}
            </div>
        `
    }

    private wrapFilter(filter: any): ClientSideComponent {
        return {
            id: '',
            metadata: { ...(filter as unknown as FormField), wantsFocus: true },
            type: ComponentType.ClientSide,
            style: '',
            children: [],
            slot: '',
            cssClasses: '',
            initialData: {},
            confirmOnNavigationIfDirty: false
        } as ClientSideComponent
    }

    private renderFilterControls() {
        return html`
            <mateu-event-interceptor .target="${this}">
                <vaadin-form-layout max-columns="1" @keydown="${this.handleKey}" auto-responsive>
                    <vaadin-form-row>
                        ${this.metadata?.filters?.map(filter =>
                            renderComponent(this, this.wrapFilter(filter), this.baseUrl, this.state, this.data, this.appState, this.appData)
                        )}
                    </vaadin-form-row>
                </vaadin-form-layout>
            </mateu-event-interceptor>`
    }

    private renderFilterActionButtons() {
        return html`
            <vaadin-button theme="tertiary" @click="${() => { this.filtersOpened = false; this.clickedOnClearFilters() }}">Clear</vaadin-button>
            <vaadin-button theme="primary" @click="${this.clickedOnSearch}" style="margin-left: auto;">Search</vaadin-button>`
    }

    renderSearchBar = () => html`
        <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: center;">
            ${this.metadata?.searchable ? html`
                <vaadin-text-field
                        id="searchText"
                        @value-changed="${this.valueChanged}"
                        value="${this.state.searchText}"
                        autofocus="${this.metadata?.autoFocusOnSearchText ? true : nothing}"
                        style="flex: 1;"
                        placeholder="Search..."
                ></vaadin-text-field>
            ` : nothing}

            ${this.effectiveFiltersLayout === 'inline' ? html`
                ${this.metadata?.filters?.map(filter =>
                    renderComponent(this, this.wrapFilter(filter), this.baseUrl, this.state, this.data, this.appState, this.appData)
                )}
            ` : nothing}

            ${(this.effectiveFiltersLayout === 'popover' || this.effectiveFiltersLayout === 'drawer' || this.effectiveFiltersLayout === 'dialog')
                && this.metadata?.filters && this.metadata.filters.length > 0 ? html`
                <vaadin-button @click="${this.clickedOnFilters}">Filters</vaadin-button>
                <vaadin-button @click="${this.clickedOnClearFilters}">Clear filters</vaadin-button>
            ` : nothing}

            <vaadin-button @click="${() => this.handleButtonClick()}" theme="primary">Search</vaadin-button>
        </vaadin-horizontal-layout>
    `

    /** Popover: inline panel below the search bar. */
    private renderPopover() {
        if (!this.filtersOpened) return nothing
        return html`
            <div class="filter-popover">
                ${this.renderFilterControls()}
                <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-end; padding-top: var(--lumo-space-s);">
                    ${this.renderFilterActionButtons()}
                </vaadin-horizontal-layout>
            </div>`
    }

    /** Side drawer sliding in from the right. */
    private renderDrawer() {
        return html`
            <div class="filter-drawer ${this.filtersOpened ? 'filter-drawer--open' : ''}">
                <vaadin-horizontal-layout theme="spacing" style="align-items: center; margin-bottom: var(--lumo-space-m);">
                    <span style="font-size: var(--lumo-font-size-l); font-weight: 600; flex: 1;">Filters</span>
                    <vaadin-button theme="icon tertiary" @click="${() => this.filtersOpened = false}" aria-label="Close">✕</vaadin-button>
                </vaadin-horizontal-layout>
                ${this.renderFilterControls()}
                <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-end; margin-top: var(--lumo-space-m);">
                    ${this.renderFilterActionButtons()}
                </vaadin-horizontal-layout>
            </div>
            ${this.filtersOpened ? html`
                <div class="filter-drawer-overlay" @click="${() => this.filtersOpened = false}"></div>
            ` : nothing}`
    }

    /** Modal dialog (existing Vaadin behavior). */
    renderFiltersDialog = () => html`
        <vaadin-dialog
                header-title="Filters"
                .opened="${this.filtersOpened}"
                @closed="${() => this.filtersOpened = false}"
                ${dialogRenderer(() => this.renderFilterControls(), [])}
                ${dialogFooterRenderer(() => html`
                    <vaadin-button theme="tertiary" @click="${() => this.filtersOpened = false}">Cancel</vaadin-button>
                    <vaadin-button theme="primary" @click="${this.clickedOnSearch}" style="margin-left: auto;">Search</vaadin-button>
                `, [])}
        ></vaadin-dialog>
    `

    render(): TemplateResult {
        const layout = this.effectiveFiltersLayout

        if (this.searchOnly) {
            return html`
                ${this.metadata?.searchable ? this.renderSearchBar() : nothing}
                ${this.renderActiveFilterBadges()}
                ${layout === 'dialog' ? this.renderFiltersDialog() : nothing}
                ${layout === 'drawer' ? this.renderDrawer() : nothing}
                ${layout === 'popover' ? this.renderPopover() : nothing}
            `
        }

        return html`
            <vaadin-vertical-layout style="width: 100%; position: relative;">
                ${this.metadata?.searchable ? this.renderSearchBar() : nothing}
                ${this.renderActiveFilterBadges()}
                ${layout === 'popover' ? this.renderPopover() : nothing}
            </vaadin-vertical-layout>
            ${layout === 'dialog' ? this.renderFiltersDialog() : nothing}
            ${layout === 'drawer' ? this.renderDrawer() : nothing}
        `
    }

    static styles = css`
        :host {
            width: 100%;
        }
        .active-filters {
            display: flex;
            flex-wrap: wrap;
            gap: 0.25rem;
            padding: 0.25rem 0;
        }
        .active-filter-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
        }
        .active-filter-remove {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0 0 0 2px;
            line-height: 1;
            font-size: 0.7rem;
            color: inherit;
            opacity: 0.7;
        }
        .active-filter-remove:hover {
            opacity: 1;
        }
        .filter-popover {
            border: 1px solid var(--lumo-contrast-20pct);
            border-radius: var(--lumo-border-radius-l);
            padding: var(--lumo-space-m);
            background: var(--lumo-base-color);
            box-shadow: var(--lumo-box-shadow-m);
            margin-top: var(--lumo-space-xs);
        }
        .filter-drawer {
            position: fixed;
            inset: 0 0 0 auto;
            width: min(360px, 90vw);
            background: var(--lumo-base-color);
            box-shadow: var(--lumo-box-shadow-xl);
            z-index: 200;
            padding: var(--lumo-space-l);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            transform: translateX(100%);
            transition: transform 0.2s ease;
        }
        .filter-drawer--open {
            transform: translateX(0);
        }
        .filter-drawer-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.32);
            z-index: 199;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-filter-bar': MateuFilterBar
    }
}
