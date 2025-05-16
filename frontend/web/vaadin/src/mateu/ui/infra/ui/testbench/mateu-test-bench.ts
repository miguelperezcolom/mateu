import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import '@vaadin/vertical-layout'
import { upstream } from "@domain/state";
import '../mateu-ux'
import { mockedSimpleRoot1 } from "@infra/ui/testbench/mocks/simpleRoot1";
import Component from "@mateu/shared/apiClients/dtos/Component";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import { nanoid } from "nanoid";
import { mockedSimpleRoot2 } from "@infra/ui/testbench/mocks/simpleRoot2";
import { mockedSimpleForm1 } from "@infra/ui/testbench/mocks/simpleForm1";
import '../mateu-ui'
import { mockedSimpleTable1 } from "@infra/ui/testbench/mocks/simpleTable1";
import { mockedSimpleTableCrud1 } from "@infra/ui/testbench/mocks/simpleTableCrud1";
import { mockedSimpleCardCrud1 } from "@infra/ui/testbench/mocks/simpleCardCrud1";
import { mockedSimpleApp1 } from "@infra/ui/testbench/mocks/simpleApp1";
import { mockedSimpleCard1 } from "@infra/ui/testbench/mocks/simpleCard1";
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import { mockedSimpleApp2 } from "@infra/ui/testbench/mocks/simpleApp2";
import { mockedSimpleApp3 } from "@infra/ui/testbench/mocks/simpleApp3";
import { mockedSimpleTableCrud2 } from "@infra/ui/testbench/mocks/simpleTableCrud2";


@customElement('mateu-test-bench')
export class MateuTestBench extends LitElement {

    // public properties
    @property()
    baseUrl = ''
    @property()
    journeyTypeId: string | undefined = undefined;

    @property()
    overrides: string | undefined = undefined;

    signalUi = () => {
        this.loadComponent(mockedSimpleRoot1)
    }

    updateUi = () => {
        const newContent =  'Hola 6 -' + nanoid();
        const component = { ...mockedSimpleRoot2 };
        // @ts-ignore
        (component.children[1].children[0].metadata as Element).content = newContent
        this.loadComponent(component)
    }

    loadForm = () => {
        this.loadComponent(mockedSimpleForm1)
    }

    loadTable = () => {
        this.loadComponent(mockedSimpleTable1)
    }

    loadTableData = () => {
        const fragment = {
            targetComponentId: 'table1',
            component: {
                initialData: {
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

    loadTableCrud1 = () => {
        this.loadComponent(mockedSimpleTableCrud1)
    }

    loadTableCrud2 = () => {
        this.loadComponent(mockedSimpleTableCrud2)
    }

    loadCardCrud = () => {
        this.loadComponent(mockedSimpleCardCrud1)
    }

    loadApp1 = () => {
        this.loadComponent(mockedSimpleApp1)
    }

    loadApp2 = () => {
        this.loadComponent(mockedSimpleApp2)
    }

    loadApp3 = () => {
        this.loadComponent(mockedSimpleApp3)
    }

    loadCard = () => {
        this.loadComponent(mockedSimpleCard1)
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
           <vaadin-button @click="${this.signalUi}">Signal</vaadin-button>
           <vaadin-button @click="${this.updateUi}">Update</vaadin-button>
           <vaadin-button @click="${this.loadForm}">Form</vaadin-button>
           <vaadin-button @click="${this.loadTable}">Table</vaadin-button>
           <vaadin-button @click="${this.loadTableData}">Table Data</vaadin-button>
           <vaadin-button @click="${this.loadTableCrud1}">Table Crud 1</vaadin-button>
           <vaadin-button @click="${this.loadTableCrud2}">Table Crud 2</vaadin-button>
           <vaadin-button @click="${this.loadCardCrud}">Card Crud</vaadin-button>
           <vaadin-button @click="${this.loadApp1}">App 1</vaadin-button>
           <vaadin-button @click="${this.loadApp2}">App 2</vaadin-button>
           <vaadin-button @click="${this.loadApp3}">App 3</vaadin-button>
           <vaadin-button @click="${this.loadCard}">Card</vaadin-button>
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

