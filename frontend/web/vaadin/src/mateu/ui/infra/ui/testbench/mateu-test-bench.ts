import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import '@vaadin/vertical-layout'
import { upstream } from "@domain/state";
import '../mateu-ux'
import Component from "@mateu/shared/apiClients/dtos/Component";
import '../mateu-ui'
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import { mockedSimpleTableCrudMessage1 } from "@infra/ui/testbench/mocks/mockedSimpleTableCrudMessage1";


@customElement('mateu-test-bench')
export class MateuTestBench extends LitElement {

    // public properties
    @property()
    baseUrl = ''
    @property()
    journeyTypeId: string | undefined = undefined;

    @property()
    overrides: string | undefined = undefined;


    loadTableData = () => {
        const fragment = {
            targetComponentId: 'table1',
            data: {
                page: {
                    items: [
                        {
                            col1: 'ewwerwer',
                            col2: 'werer',
                            col3: 'werwer'
                        },
                    ]
                }
            }
        } as UIFragment
        upstream.next({
            fragment,
            ui:undefined,
            error: undefined
        })
    }


    loadTableCrudData1 = () => {
        const data = mockedSimpleTableCrudMessage1
        data.fragments?.forEach(fragment => {
            upstream.next({
                fragment,
                ui:undefined,
                error: undefined
            })
        })
    }

    loadComponent = (component: Component) => {
        const fragment = {
            targetComponentId: '_ux',
            component
        } as UIFragment
        upstream.next({
            fragment: fragment,
            ui:undefined,
            error: undefined
        })
    }

    render() {
       return html`
           <mateu-ui baseurl="${this.baseUrl}" journeytypeid="_" overrides="${this.overrides}"></mateu-ui>
           <vaadin-button @click="${this.loadTableData}">Table Data</vaadin-button>
           <vaadin-button @click="${this.loadTableCrudData1}">Table Crud Data 1</vaadin-button>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-test-bench': MateuTestBench
    }
}

declare global {
    interface Window {
        __MATEU_REMOTE_BASE_URL__: any
        __MATEU_UI_ID__: any
        location: Location
    }
}

