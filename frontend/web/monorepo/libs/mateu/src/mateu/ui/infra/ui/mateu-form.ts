import { customElement, property } from "lit/decorators.js";
import { css, html, TemplateResult } from "lit";
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form";
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import './mateu-content-header'
import { ComponentState, ComponentData } from "@infra/ui/renderers/types"

export { possiblyHtml } from './mateu-content-header'

@customElement('mateu-form')
export class MateuForm extends MetadataDrivenElement {

    @property()
    state: ComponentState = {}

    @property()
    data: ComponentData = {}

    @property()
    appState: ComponentState = {}

    @property()
    appData: ComponentData = {}

    render(): TemplateResult {
        const metadata = (this.component as ClientSideComponent)?.metadata as Form
        return html`
            <div class="mateu-vlayout ${this.component?.cssClasses ?? ''}">
                <mateu-content-header
                    .metadata="${metadata}"
                    .baseUrl="${this.baseUrl}"
                    .state="${this.state}"
                    .data="${this.data}"
                    .appState="${this.appState}"
                    .appData="${this.appData}"
                ></mateu-content-header>
                <div class="form-content" style="width: 100%;">
                    <slot></slot>
                    <div class="mateu-hlayout form-buttons">
                        <slot name="buttons"></slot>
                    </div>
                </div>
            </div>
       `
    }

    static styles = css`
        :host {
        }

        /* DS-neutral replacements for vaadin vertical/horizontal-layout theme="spacing" */
        .mateu-vlayout {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: var(--lumo-space-m, 1rem);
            width: 100%;
        }
        .mateu-hlayout {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: var(--lumo-space-m, 1rem);
        }

        .redwood .form-header {
            background-color: rgb(44, 82, 102);
            color: var(--lumo-base-color);
            padding: 30px;
            font-family: "Times New Roman";
        }

        .form-content {
            padding-bottom: 3rem;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-form': MateuForm
    }
}
