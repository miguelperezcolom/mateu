import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import '@vaadin/vertical-layout'
import { upstream } from "@domain/state";
import './mateu-ux'
import { mockedSimpleRoot1 } from "@domain/mocks/simpleRoot1";
import Component from "@mateu/shared/apiClients/dtos/Component";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import { nanoid } from "nanoid";
import { mockedSimpleRoot2 } from "@domain/mocks/simpleRoot2";
import { mockedSimpleForm1 } from "@domain/mocks/simpleForm1";
import './mateu-ui'
import { mockedSimpleTable1 } from "@domain/mocks/simpleTable1";
import { mockedSimpleTableCrud1 } from "@domain/mocks/simpleTableCrud1";
import { mockedSimpleCardCrud1 } from "@domain/mocks/simpleCardCrud1";
import { mockedSimpleApp1 } from "@domain/mocks/simpleApp1";
import { mockedSimpleCard1 } from "@domain/mocks/simpleCard1";
import Message from "@mateu/shared/apiClients/dtos/Message";


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
        const message = {
            targetComponentId: 'table1',
            component: {
                data: {
                    items: [
                        {
                            col1: 'ewwerwer',
                            col2: 'werer',
                            col3: 'werwer'
                        },
                    ]
                }
            }
        } as Message
        upstream.next({
            message,
            ui:undefined
        })
    }

    loadTableCrud = () => {
        this.loadComponent(mockedSimpleTableCrud1)
    }

    loadCardCrud = () => {
        this.loadComponent(mockedSimpleCardCrud1)
    }

    loadApp = () => {
        this.loadComponent(mockedSimpleApp1)
    }

    loadCard = () => {
        this.loadComponent(mockedSimpleCard1)
    }

    loadComponent = (component: Component) => {
        const message = {
            targetComponentId: '_ux',
            component
        } as Message
        upstream.next({
            message,
            ui:undefined
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
           <vaadin-button @click="${this.loadTableCrud}">Table Crud</vaadin-button>
           <vaadin-button @click="${this.loadCardCrud}">Card Crud</vaadin-button>
           <vaadin-button @click="${this.loadApp}">App</vaadin-button>
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

