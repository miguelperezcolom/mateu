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
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import { ButtonColor } from "@mateu/shared/apiClients/dtos/componentmetadata/ButtonColor";
import { ButtonStyle } from "@mateu/shared/apiClients/dtos/componentmetadata/ButtonStyle";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";


const buttonTheme = (button: Button): string | undefined => {
    const parts: string[] = []
    if (button.color && button.color !== ButtonColor.normal) parts.push(button.color)
    if (button.buttonStyle) parts.push(button.buttonStyle === ButtonStyle.tertiaryInline ? 'tertiary-inline' : button.buttonStyle)
    return parts.length ? parts.join(' ') : undefined
}

const isNavButton = (id: string | undefined): boolean =>
    id === 'back' || id === 'backToList' || (!!id && id.startsWith('cancel'))

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

    handleToolbarButtonClick = (actionId: string) => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId,
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
                        <vaadin-form-layout max-columns="2" @keydown="${this.handleKey}">
                            <vaadin-form-row>
                                ${this.metadata?.filters?.map(filter => renderComponent(this, {
                                    id: '',
                                    metadata: {...(filter as unknown as FormField), wantsFocus: true },
                                    type: ComponentType.ClientSide,
                                    style: '',
                                    children: [],
                                    slot: '',
                                    cssClasses: '',
                                    initialData: {}
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
        const navButtons = toolbar.filter(b => isNavButton(b.actionId))
        const actionButtons = toolbar.filter(b => !isNavButton(b.actionId))
        const hasDivider = navButtons.length > 0 && actionButtons.length > 0
        const hasHeader = !!this.metadata?.title || !!this.metadata?.subtitle || toolbar.length > 0

        if (this.searchOnly) {
            return html`
                ${this.metadata?.searchable ? this.renderSearchBar() : nothing}
                ${this.renderFiltersDialog()}
            `
        }

        return html`
            <vaadin-vertical-layout style="width: 100%;">
                ${hasHeader ? html`
                    <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m);">
                        <div style="flex: 1;">
                            ${this.metadata?.title ? html`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color);">${this.metadata.title}</h2>
                            ` : nothing}
                            ${this.metadata?.subtitle ? html`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.metadata.subtitle}</span>
                            ` : nothing}
                        </div>
                        ${navButtons.map(button => html`
                            <vaadin-button
                                    data-action-id="${button.id}"
                                    theme="${buttonTheme(button) || nothing}"
                                    @click="${() => this.handleToolbarButtonClick(button.actionId)}"
                            >${button.label}</vaadin-button>
                        `)}
                        ${hasDivider ? html`<span class="toolbar-divider"></span>` : nothing}
                        ${actionButtons.map(button => html`
                            <vaadin-button
                                    data-action-id="${button.id}"
                                    theme="${buttonTheme(button) || nothing}"
                                    @click="${() => this.handleToolbarButtonClick(button.actionId)}"
                            >${button.label}</vaadin-button>
                        `)}
                        <slot></slot>
                    </vaadin-horizontal-layout>
                ` : nothing}
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


