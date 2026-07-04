import {css, html, nothing, TemplateResult} from "lit";
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
import {customElement, state} from 'lit/decorators.js';
import Dialog from "@mateu/shared/apiClients/dtos/componentmetadata/Dialog";
import {dialogFooterRenderer, dialogHeaderRenderer, dialogRenderer} from "@vaadin/dialog/lit";
import {renderComponent} from "@infra/ui/renderers/renderComponent.ts";
import ComponentElement from "@infra/ui/ComponentElement.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import { interpolateNested } from "@infra/ui/interpolation.ts";


@customElement('mateu-dialog')
export class MateuDialog extends ComponentElement {

    @state()
    opened = true

    close = () => {
        this.opened = false
        setTimeout(() => this.parentElement?.removeChild(this), 500)
    }

    applyFragment(fragment: UIFragment) {
        super.applyFragment(fragment)
        const millis = fragment.state?.['_closeAfterMillis'] as number | undefined
        if (millis) {
            setTimeout(() => this.close(), millis)
        }
    }

    updated(_changedProperties: any) {
        super.updated(_changedProperties);
        if (_changedProperties.has('component') && this.component) {
            const metadata = (this.component as ClientSideComponent).metadata as Dialog
            this.state = metadata.initialData
        }
    }

    render(): TemplateResult {

        const metadata = (this.component as ClientSideComponent).metadata as Dialog

        let theme = '';
        if (metadata.noPadding) {
            theme += ' ' + 'no-padding'
        }

        /*
                @opened-changed="${(event: DialogOpenedChangedEvent) => {
                this.dialogOpened = event.detail.value;
            }}"
 */
        const content = interpolateNested(
            metadata.headerTitle, this.state, this.data, this.appState, this.appData)

        return html`
        <vaadin-dialog
                header-title="${content}"
                .opened="${this.opened}"
                slot="${this.component?.slot??nothing}"
                theme="${theme}"
                ?modeless="${metadata.modeless}"
                ?draggable="${metadata.draggable}"
                ?resizable="${metadata.resizable}"
                top="${metadata.top??nothing}"
                left="${metadata.left??nothing}"
                right="${metadata.right??nothing}"
                width="${metadata.width??nothing}"
                height="${metadata.height??nothing}"
                ${metadata.header || metadata.closeButtonOnHeader?dialogHeaderRenderer(
            () => html`<mateu-event-interceptor .target="${this}" style="width: 100%;">${metadata.header?renderComponent(this, metadata.header, this.baseUrl, this.state, this.data, this.appState, this.appData):nothing}${metadata.closeButtonOnHeader?html`
                            <vaadin-button theme="tertiary" @click="${this.close}">
                                <vaadin-icon icon="lumo:cross"></vaadin-icon>
                            </vaadin-button>
                        `:nothing}</mateu-event-interceptor>`,
            [this.state, this.data]
        ):nothing}
                ${metadata.footer?dialogFooterRenderer(
            () => html`<mateu-event-interceptor .target="${this}" style="width: 100%;">${renderComponent(this, metadata.footer, this.baseUrl, this.state, this.data, this.appState, this.appData)}</mateu-event-interceptor>`,
            [this.state, this.data]
        ):nothing}
                ${metadata.content?dialogRenderer(
            () => html`<mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${renderComponent(this, metadata.content, this.baseUrl, this.state, this.data, this.appState, this.appData)}</mateu-event-interceptor>`,
            [this.state, this.data]
        ):nothing}
                style="${this.component?.style}" 
                class="${this.component?.cssClasses}"
        >
        </vaadin-dialog>

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


