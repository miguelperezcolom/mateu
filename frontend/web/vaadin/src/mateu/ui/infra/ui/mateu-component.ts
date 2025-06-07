import { customElement, property } from "lit/decorators.js";
import { css, html, nothing, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import "@vaadin/progress-bar"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import './mateu-form'
import './mateu-field'
import './mateu-table'
import './mateu-table-crud'
import './mateu-card'
import './mateu-app'
import './mateu-api-caller'
import ComponentElement from "@infra/ui/ComponentElement";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

@customElement('mateu-component')
export class MateuComponent extends ComponentElement {

    @property()
    signature: ComponentMetadata | undefined

    @property()
    baseUrl: string | undefined

    renderElement = (element: Element): TemplateResult => {
        if (element.name == 'div') {
            return html`<div>
                ${element.content??nothing}
                <slot></slot>
            </div>`
        }
        return html``
    }

    render() {
        const metadata = this.metadata!
        return html`
            
            <mateu-api-caller>
                
           ${metadata.type == ComponentMetadataType.Form
            ?html`<mateu-form 
                           id="${this.id}" 
                           baseUrl="${this.baseUrl}"
                           .metadata="${metadata}"
                           .data="${this.data}"
                           serversidetype="${this.serverSideType}"
                   >
        <slot></slot>        
</mateu-form>`:nothing}
           
           ${metadata.type == ComponentMetadataType.Table
            ?html`<mateu-table
                           id="${this.id}"
                           baseUrl="${this.baseUrl}"
                           .metadata="${metadata}"
                           .data="${this.data}"
                           serversidetype="${this.serverSideType}"
                   >
                       <slot></slot>
                   </mateu-table>`:nothing}

           ${metadata.type == ComponentMetadataType.TableCrud
            ?html`<mateu-table-crud
                           id="${this.id}"
                           baseUrl="${this.baseUrl}"
                           .metadata="${metadata}"
                           .data="${this.data}"
                           serversidetype="${this.serverSideType}"
                   ></mateu-table-crud>`:nothing}
           ${metadata.type == ComponentMetadataType.CardCrud
            ?html`<mateu-table-crud
                           id="${this.id}"
                           baseUrl="${this.baseUrl}"
                           .metadata="${metadata}"
                           .data="${this.data}"
                           serversidetype="${this.serverSideType}"
                   ></mateu-table-crud>`:nothing}

           ${metadata.type == ComponentMetadataType.Card
            ?html`<mateu-card
                           id="${this.id}"
                           baseUrl="${this.baseUrl}"
                           .metadata="${metadata}"
                           .data="${this.data}"
                           serversidetype="${this.serverSideType}"
                   ></mateu-card>`:nothing}

           ${metadata.type == ComponentMetadataType.App
            ?html`<mateu-app
                           id="${this.id}"
                           baseUrl="${this.baseUrl}"
                           .metadata="${metadata}"
                           .data="${this.data}"
                           serversidetype="${this.serverSideType}"
                   ></mateu-app>`:nothing}

           ${metadata.type == ComponentMetadataType.Element
            ?this.renderElement(metadata as Element):nothing}

                ${metadata.type == ComponentMetadataType.FormField
                        ?html`<mateu-field
                           id="${this.id}"
                           .field="${this.metadata}"
                   ></mateu-field>`:nothing}

            </mateu-api-caller>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-component': MateuComponent
    }
}


