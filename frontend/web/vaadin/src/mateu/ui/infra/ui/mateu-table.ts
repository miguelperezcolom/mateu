import { customElement, state } from "lit/decorators.js";
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
import ComponentElement from "@infra/ui/ComponentElement";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import { State } from "@domain/state";


@customElement('mateu-table')
export class MateuTable extends ComponentElement {

    @state()
    items: any

    stampState(state: State) {
        super.stampState(state);
        this.items = [
            {
                col1: 'aaa',
                col2: 'bbb',
                col3: 'cccc'
            },
            {
                col1: 'xxxx',
                col2: 'yyyy',
                col3: 'zzz'
            }
        ]
    }


    render() {
        const metadata = this.metadata as Table
        console.log('items', this.items)
        return html`
            <vaadin-grid
                    .items="${this.items}"
                    all-rows-visible>
                ${metadata.columns.map(column => html`
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


