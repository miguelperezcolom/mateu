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
        const fragment: UIFragment = {
            targetComponentId: 'table1',
            component: undefined,
            state: undefined,
            action: undefined,
            containerId: undefined,
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
        }
        upstream.next({
            command: undefined,
            fragment,
            ui:undefined,
            error: undefined,
            callbackToken: ''
        })
    }


    loadTableCrudData1 = () => {
        const data = mockedSimpleTableCrudMessage1
        data.fragments?.forEach(fragment => {
            upstream.next({
                command: undefined,
                fragment,
                ui:undefined,
                error: undefined,
                callbackToken: ''
            })
        })
    }

    loadComponent = (component: Component) => {
        const fragment: UIFragment = {
            targetComponentId: '_ux',
            component,
            data: undefined,
            state: undefined,
            action: undefined,
            containerId: undefined
        }
        upstream.next({
            command: undefined,
            fragment: fragment,
            ui:undefined,
            error: undefined,
            callbackToken: ''
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
        __MATEU_REMOTE_BASE_URL__: string
        __MATEU_UI_ID__: string
        location: Location
    }
}

