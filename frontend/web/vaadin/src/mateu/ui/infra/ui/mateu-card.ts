import { customElement } from "lit/decorators.js";
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
import "@vaadin/card"
import img from '@/assets/lit.svg?url';


@customElement('mateu-card')
export class MateuCard extends LitElement {


    render() {
        return html`
            <vaadin-card theme="outlined elevated horizontal cover-media">
                <img slot="media" width="100" src="${img}" alt="" />
                <div slot="title">Lapland</div>
                <div slot="subtitle">The Exotic North</div>
                <div>
                    Lapland is the northern-most region of Finland and an active outdoor destination.
                </div>
            </vaadin-card>        
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-card': MateuCard
    }
}


