import { customElement } from "lit/decorators.js";
import { css, html, PropertyValues } from "lit";
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
import './mateu-filter-bar'
import './mateu-pagination'
import './mateu-table'
import TableCrud from "@mateu/shared/apiClients/dtos/componentmetadata/TableCrud";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import ComponentElement from "@infra/ui/ComponentElement";


@customElement('mateu-crud')
export class MateuCrud extends ComponentElement {

    values: Record<string, any> = {}

    search = () => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                userData: this.values,
                actionId: 'search',
                serverSideType: this.serverSideType,
                initiatorComponentId: this.id,
                initiator: this
            },
            bubbles: true,
            composed: true
        }))
    }

    valueChangedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (e instanceof CustomEvent) {
            const detail = e.detail as {
                value: any,
                fieldId: string
            }
            if (e.type == 'value-changed') {
                this.values[detail.fieldId] = detail.value
            }
        }
    }

    handleButtonClick = (actionId: string) => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                userData: this.values,
                actionId,
                serverSideType: this.serverSideType,
                initiatorComponentId: this.id,
                initiator: this
            },
            bubbles: true,
            composed: true
        }))
    }

    handleSearchRequested = () => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                userData: this.values,
                actionId: 'search',
                serverSideType: this.serverSideType,
                initiatorComponentId: this.id,
                initiator: this
            },
            bubbles: true,
            composed: true
        }))
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('value-changed', this.valueChangedListener)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('value-changed', this.valueChangedListener)
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.size > 1 || !_changedProperties.has('data')) {
            this.search()
        }
    }

    render() {
        const metadata = this.metadata as TableCrud
        return html`
            <mateu-filter-bar 
                    .metadata="${metadata}"
                    @search-requested="${this.handleSearchRequested}"
            ></mateu-filter-bar>
            ${this.metadata?.type == ComponentMetadataType.TableCrud?html`
                <mateu-table .metadata="${metadata.table}" .data="${this.data}"></mateu-table>
            `:html`
                <mateu-card .metadata="${metadata.table}" .data="${this.data}"></mateu-card>
            `}
            <slot></slot>
            <mateu-pagination .metadata="${metadata}"></mateu-pagination>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-crud': MateuCrud
    }
}


