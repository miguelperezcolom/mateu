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
import ComponentElement from "@infra/ui/ComponentElement";
import './mateu-filter-bar'
import './mateu-pagination'
import './mateu-table'
import TableCrud from "@mateu/shared/apiClients/dtos/componentmetadata/TableCrud";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";


@customElement('mateu-crud')
export class MateuCrud extends ComponentElement {

    render() {
        const metadata = this.metadata as TableCrud
        return html`
            <mateu-filter-bar></mateu-filter-bar>
            ${this.metadata?.type == ComponentMetadataType.TableCrud?html`
                <mateu-table .metadata="${metadata.table}"></mateu-table>
            `:html`
                <mateu-card .metadata="${metadata.table}"></mateu-card>
            `}
            <slot></slot>
            <mateu-pagination></mateu-pagination>
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


