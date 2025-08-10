import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
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


@customElement('mateu-table')
export class MateuTable extends LitElement {

    @property()
    metadata: Table | undefined

    @property()
    data: Record<string, any> = {}

    @property()
    emptyStateMessage?: string

    render() {
        return html`
            <vaadin-grid
                    .items="${this.data?.page?.content}"
                    all-rows-visible>
                ${this.metadata?.columns?.map(column => html`
                    <vaadin-grid-column
                            path="${column.id}" 
                            header="${column.header}"
                            align="${column.align}"
                            
                    ></vaadin-grid-column>
                `)}
                <span slot="empty-state">${this.emptyStateMessage??this.metadata?.emptyStateMessage??'No data.'}</span>
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


