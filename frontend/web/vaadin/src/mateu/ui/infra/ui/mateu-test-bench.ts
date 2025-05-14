import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import '@vaadin/vertical-layout'
import { State, store, upstream } from "@domain/state";
import './mateu-ux'
import { mockedSimpleRoot1 } from "@domain/mocks/simpleRoot1";
import Component from "@mateu/shared/apiClients/dtos/Component";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import { nanoid } from "nanoid";
import { mockedSimpleRoot2 } from "@domain/mocks/simpleRoot2";
import { mockedSimpleForm1 } from "@domain/mocks/simpleForm1";
import './mateu-ui'


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
        this.loadComponent(mockedSimpleRoot2)
    }

    loadForm = () => {
        this.loadComponent(mockedSimpleForm1)
    }

    loadComponent = (component: Component) => {
        const newState = {
            ...store.state
        }
        if (!newState.ui) {
            newState.ui = {
                title: 'Hola',
                favIcon: 'favicon',
                root: {...component}
            }
        } else {
            newState.ui!.root = {...component}
        }
        this.plainComponents(newState, {...component});
        store.state = newState
        upstream.next(newState)
    }


    plainComponents = (state: State, component: Component) => {
        state.components[component.id] = component
        component.children?.map(child => this.plainComponents(state, child))
    }

    render() {
       return html`
           <mateu-ui baseurl="${this.baseUrl}" journeytypeid="_" overrides="${this.overrides}"></mateu-ui>
           <vaadin-button @click="${this.signalUi}">Signal</vaadin-button>
           <vaadin-button @click="${this.updateUi}">Update</vaadin-button>
           <vaadin-button @click="${this.loadForm}">Form</vaadin-button>
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

