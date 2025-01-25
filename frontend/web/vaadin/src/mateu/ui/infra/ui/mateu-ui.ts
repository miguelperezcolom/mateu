import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import UI from "../../../shared/apiClients/dtos/UI"
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '../../journey/application/starter/mateu-ux'
import "@vaadin/menu-bar"
import "../../shared/apiClients/dtos/App"


@customElement('mateu-ui')
export class MateuUi extends LitElement {

    // public properties
    @property()
    baseUrl = ''
    @property()
    contextData: string | undefined = undefined;

    // state
    @state()
    ui: UI | undefined = undefined;

    render() {
       return html`
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-ui': MateuUi
    }
}

declare global {
    interface Window {
        __MATEU_REMOTE_BASE_URL__: any
        __MATEU_UI_ID__: any
        location: Location
    }
}

