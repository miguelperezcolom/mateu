import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, nothing } from "lit";
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
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";


@customElement('mateu-filter-bar')
export class MateuFilterBar extends LitElement {

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    @property()
    metadata: Crud | undefined

    @property()
    baseUrl = ''

    @state()
    state: Record<string, any> = {}

    @state()
    data: Record<string, any> = {}

    @state()
    filtersOpened = false

    clickedOnClearFilters = () => {
        this.metadata?.filters.forEach(filter => {
            this.dispatchEvent(new CustomEvent('value-changed', {
                detail: {
                    value: undefined,
                    //@ts-ignore
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
                //@ts-ignore
                fieldId: e.target.id
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

    render() {
        return html`
            <vaadin-horizontal-layout theme="spacing">
                ${this.metadata?.searchable
                        || this.metadata?.filters?html`
                `:nothing}
                ${this.metadata?.searchable?html`
                    <vaadin-text-field
                            id="searchText"
                            @value-changed="${this.valueChanged}"
                            value=""
                            autofocus="${this.metadata?.autoFocusOnSearchText?true:nothing}"
                    ></vaadin-text-field>
                    ${this.metadata.filters?html`
                        <vaadin-button @click="${this.clickedOnFilters}">Filters</vaadin-button>
                        <vaadin-button @click="${this.clickedOnClearFilters}">Clear filters</vaadin-button>
                    `:nothing}
                    <vaadin-button 
                            @click="${this.handleButtonClick}"
                            theme="primary"
                    >Search</vaadin-button>
                `:nothing}
                ${this.metadata?.filters?html`
                `:nothing}
                <slot></slot>
            </vaadin-horizontal-layout>

            <vaadin-dialog
                    header-title="Filters"
                    .opened="${this.filtersOpened}"
                    @closed="${() => this.filtersOpened = false}"
                    ${dialogRenderer(() => html`
                        <mateu-event-interceptor .target="${this}">
                <vaadin-form-layout max-columns="2" @keydown="${this.handleKey}">
                    <vaadin-form-row>
                        ${this.metadata?.filters.map(filter => renderComponent({
                            id: '',
                            cssClasses: '',
                            type: ComponentType.ClientSide,
                            style: '',
                            children: [],
                            slot: '',
                            metadata: {...filter, wantsFocus: true }
        } as ClientSideComponent, this.baseUrl, this.state, this.data))}
                    </vaadin-form-row>
                </vaadin-form-layout>
                        </mateu-event-interceptor>
          `, [])}
                    ${dialogFooterRenderer(
                            () => html`
                <vaadin-button theme="tertiary" @click="${() => this.filtersOpened = false}" data-testid="dialog-cancel">Cancel</vaadin-button>
                <vaadin-button theme="primary" @click="${this.clickedOnSearch}" style="margin-left: auto;" data-testid="dialog-confirm">
                    Search
                </vaadin-button>
              `,
                            []
                    )}
            ></vaadin-dialog>

       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-filter-bar': MateuFilterBar
    }
}


