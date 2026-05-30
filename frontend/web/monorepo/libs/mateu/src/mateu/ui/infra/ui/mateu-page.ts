import { css, html, LitElement, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/card'
import { customElement, property } from 'lit/decorators.js';
import PageComponent from "@mateu/shared/apiClients/dtos/componentmetadata/PageComponent.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import './mateu-content-header'
import { ComponentState, ComponentData } from "@infra/ui/renderers/types"

@customElement('mateu-page')
export class MateuPage extends LitElement {

    @property()
    component?: ClientSideComponent

    @property()
    baseUrl?: string

    @property()
    state?: ComponentState

    @property()
    data?: ComponentData

    @property()
    appState: ComponentState = {}

    @property()
    appData: ComponentData = {}

    @property()
    value?: unknown

    @property({ type: Boolean })
    standalone = false

    render(): TemplateResult {
        const metadata = this.component?.metadata as PageComponent
        const inner = html`
            <mateu-content-header
                .metadata="${metadata}"
                .baseUrl="${this.baseUrl}"
                .state="${this.state}"
                .data="${this.data}"
                .appState="${this.appState}"
                .appData="${this.appData}"
            ></mateu-content-header>
            <div class="form-content">
                <slot></slot>
                <vaadin-horizontal-layout theme="spacing" class="form-buttons">
                    <slot name="buttons"></slot>
                </vaadin-horizontal-layout>
            </div>
            <div class="form-footer">
                ${metadata?.footer?.map(component => renderComponent(this, component, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData))}
            </div>
        `
        return this.standalone
            ? html`<vaadin-card theme="elevated" style="width: 100%;">${inner}</vaadin-card>`
            : html`<vaadin-vertical-layout style="width: 100%;">${inner}</vaadin-vertical-layout>`
    }

    static styles = css`
        :host {
            width: 100%;
        }

        .form-content {
            width: 100%;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-page': MateuPage
    }
}
