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

    clickedOnClearFilters = () => {
        this.metadata?.filters.forEach(filter => {
            this.dispatchEvent(new CustomEvent('value-changed', {
                detail: {
                    value: undefined,
                    fieldId: filter.fieldId
                },
                bubbles: true,
                composed: true
            }))
        })
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

    renderSearchBar = () => html`
        <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: center;">
            <vaadin-text-field
                    id="searchText"
                    @value-changed="${this.valueChanged}"
                    value="${this.state.searchText}"
                    autofocus="${this.metadata?.autoFocusOnSearchText ? true : nothing}"
                    style="flex: 1;"
                    placeholder="Search..."
            ></vaadin-text-field>
            ${this.metadata?.filters && this.metadata.filters.length > 0 ? html`
                <vaadin-button @click="${this.clickedOnFilters}">Filters</vaadin-button>
                <vaadin-button @click="${this.clickedOnClearFilters}">Clear filters</vaadin-button>
            ` : nothing}
            <vaadin-button @click="${() => this.handleButtonClick()}" theme="primary">Search</vaadin-button>
        </vaadin-horizontal-layout>
    `

    renderFiltersDialog = () => html`
        <vaadin-dialog
                header-title="Filters"
                .opened="${this.filtersOpened}"
                @closed="${() => this.filtersOpened = false}"
                ${dialogRenderer(() => html`
                    <mateu-event-interceptor .target="${this}">
                        <vaadin-form-layout 
                                max-columns="1" 
                                @keydown="${this.handleKey}"
                                auto-responsive
                        >
                            <vaadin-form-row>
                                ${this.metadata?.filters?.map(filter => renderComponent(this, {
                                    id: '',
                                    metadata: {...(filter as unknown as FormField), wantsFocus: true },
                                    type: ComponentType.ClientSide,
                                    style: '',
                                    children: [],
                                    slot: '',
                                    cssClasses: '',
                                    initialData: {},
                                    confirmOnNavigationIfDirty: false
                                } as ClientSideComponent, this.baseUrl, this.state, this.data, this.appState, this.appData))}
                            </vaadin-form-row>
                        </vaadin-form-layout>
                    </mateu-event-interceptor>
                `, [])}
                ${dialogFooterRenderer(() => html`
                    <vaadin-button theme="tertiary" @click="${() => this.filtersOpened = false}" data-testid="dialog-cancel">Cancel</vaadin-button>
                    <vaadin-button theme="primary" @click="${this.clickedOnSearch}" style="margin-left: auto;" data-testid="dialog-confirm">Search</vaadin-button>
                `, [])}
        ></vaadin-dialog>
    `

    render(): TemplateResult {
        const toolbar = this.metadata?.toolbar ?? []
        const hasHeader = !!this.metadata?.title || !!this.metadata?.subtitle || toolbar.length > 0

        if (this.searchOnly) {
            return html`
                ${this.metadata?.searchable ? this.renderSearchBar() : nothing}
                ${this.renderFiltersDialog()}
            `
        }

        return html`
            <vaadin-vertical-layout style="width: 100%;">
                ${this.metadata?.searchable ? this.renderSearchBar()
                    : !hasHeader ? html`<span style="flex: 1;"></span>` : nothing}
            </vaadin-vertical-layout>
            ${this.renderFiltersDialog()}
        `
    }

    static styles = css`
        :host {
            width: 100%;
        }
        .toolbar-divider {
            display: inline-block;
            width: 1px;
            height: 1.5rem;
            background-color: var(--lumo-contrast-20pct);
            align-self: center;
            margin: 0 4px;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-filter-bar': MateuFilterBar
    }
}


