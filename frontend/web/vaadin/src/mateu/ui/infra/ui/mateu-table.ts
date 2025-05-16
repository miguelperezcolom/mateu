import { customElement } from "lit/decorators.js";
import { css, html } from "lit";
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
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import ComponentElement from "@infra/ui/ComponentElement";


@customElement('mateu-table')
export class MateuTable extends ComponentElement {

    render() {
        const metadata = this.metadata as Table
        return html`
            <vaadin-grid
                    .items="${this.data?.items}"
                    all-rows-visible>
                ${metadata?.columns?.map(column => html`
                    <vaadin-grid-column
                            path="${column.id}" 
                            header="${column.header}"></vaadin-grid-column>
                `)}
            </vaadin-grid>
            <slot></slot>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-table': MateuTable
    }
}


