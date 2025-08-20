import { css, html, LitElement, nothing } from "lit";
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
import { customElement, property, state } from 'lit/decorators.js';
import 'chartjs-adapter-date-fns';
import Dialog from "@mateu/shared/apiClients/dtos/componentmetadata/Dialog";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { dialogFooterRenderer, dialogHeaderRenderer, dialogRenderer } from "@vaadin/dialog/lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";


@customElement('mateu-dialog')
export class MateuDialog extends LitElement {

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    @property()
    component?: ClientSideComponent

    @property()
    baseUrl?: string

    @property()
    state?: any

    @property()
    data?: any

    @state()
    opened = true

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('action-requested', this.redispatchEvent)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('action-requested', this.redispatchEvent)
    }

    redispatchEvent: EventListenerOrEventListenerObject = (e: Event) => {
        if (e instanceof CustomEvent) {
            e.stopPropagation()
            e.preventDefault()
            this.opened = false
            this.dispatchEvent(new CustomEvent(e.type, {
                detail: e.detail,
                bubbles: true,
                composed: true
            }))
        }
    }


    render() {

        const metadata = this.component?.metadata as Dialog

        let theme = '';
        if (metadata.noPadding) {
            theme += ' ' + 'no-padding'
        }

        /*
                @opened-changed="${(event: DialogOpenedChangedEvent) => {
                this.dialogOpened = event.detail.value;
            }}"
 */

        return html`
        <vaadin-dialog
                header-title="${metadata.headerTitle}"
                .opened="${this.opened}"
                slot="${this.component?.slot??nothing}"
                theme="${theme}"
                ?modeless="${metadata.modeless}"
                ?draggable="${metadata.draggable}"
                ?resizable="${metadata.resizable}"
                top="${metadata.top??nothing}"
                left="${metadata.left??nothing}"
                width="${metadata.width??nothing}"
                height="${metadata.height??nothing}"
                ${metadata.header || metadata.closeButtonOnHeader?dialogHeaderRenderer(
            () => html`<mateu-event-interceptor .target="${this}">${metadata.header?renderComponent(metadata.header, this.baseUrl, this.state, this.data):nothing}${metadata.closeButtonOnHeader?html`
                            <vaadin-button theme="tertiary" @click="${() => this.opened = false}">
                                <vaadin-icon icon="lumo:cross"></vaadin-icon>
                            </vaadin-button>
                        `:nothing}</mateu-event-interceptor>`,
            []
        ):nothing}
                ${metadata.footer?dialogFooterRenderer(
            () => html`<mateu-event-interceptor .target="${this}">${renderComponent(metadata.footer, this.baseUrl, this.state, this.data)}</mateu-event-interceptor>`,
            []
        ):nothing}
                ${metadata.content?dialogRenderer(
            () => html`<mateu-event-interceptor .target="${this}">${renderComponent(metadata.content, this.baseUrl, this.state, this.data)}</mateu-event-interceptor>`,
            []
        ):nothing}
                style="${this.component?.style}" 
                class="${this.component?.cssClasses}"
        ></vaadin-dialog>

       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-dialog': MateuDialog
    }
}


