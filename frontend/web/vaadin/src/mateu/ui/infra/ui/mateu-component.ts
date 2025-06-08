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
import Component from "@mateu/shared/apiClients/dtos/Component";
import { renderFormLayout, renderHorizontalLayout, renderVerticalLayout } from "@infra/ui/renderLayouts";

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
        if (element.name == 'p') {
            return html`<p>
                ${element.content??nothing}
                <slot></slot>
            </p>`
        }
        return html`<div>unknown element: ${element.name}</div>`
    }

    renderChildComponent = (component: Component): TemplateResult => {
        if (component.metadata) {
            return html`<mateu-component id="${component.id}" 
                                         .metadata="${component.metadata}" 
                                         .component="${component}"
                                         .data="${component.initialData}"
                                         serverSideType="${component.serverSideType}"  
                                         baseUrl="${this.baseUrl}"
                                         signature="${JSON.stringify(component.metadata)
            + JSON.stringify(component.initialData)}">
           </mateu-component>`
        }
        return html`<p>No metadata for component ${component.id}</p>`
    }

    renderComponent = (component: Component | undefined): TemplateResult => {
        if (component?.metadata) {
            if (component.metadata.type == ComponentMetadataType.FormLayout) {
                return renderFormLayout(component, this.renderChildComponent)
            }
            if (component.metadata.type == ComponentMetadataType.HorizontalLayout) {
                return renderHorizontalLayout(component, this.renderChildComponent)
            }
            if (component.metadata.type == ComponentMetadataType.VerticalLayout) {
                return renderVerticalLayout(component, this.renderChildComponent)
            }
            if (component.metadata.type == ComponentMetadataType.Form) {
                return html`<mateu-api-caller><mateu-form 
                id="${this.id}" 
            baseUrl="${this.baseUrl}"
                .metadata="${component.metadata}"
                .data="${this.data}"
            serversidetype="${this.serverSideType}"
                >
                    ${component.children?.map(child => this.renderChildComponent(child))}        
                </mateu-form></mateu-api-caller>`
        }
        if (component.metadata.type == ComponentMetadataType.Table) {
             return html`<mateu-table
                            id="${this.id}"
            baseUrl="${this.baseUrl}"
                .metadata="${component.metadata}"
                .data="${this.data}"
            serversidetype="${this.serverSideType}"
                >
                 ${component.children?.map(child => this.renderChildComponent(child))}
                </mateu-table>`
        }
        if (component.metadata.type == ComponentMetadataType.TableCrud) {
             return html`<mateu-api-caller><mateu-table-crud
                            id="${this.id}"
            baseUrl="${this.baseUrl}"
                .metadata="${component.metadata}"
                .data="${this.data}"
            serversidetype="${this.serverSideType}"
                >
                 ${component.children?.map(child => this.renderChildComponent(child))}
             </mateu-table-crud></mateu-api-caller>`
        }
            if (component.metadata.type == ComponentMetadataType.CardCrud) {
             return html`<mateu-api-caller><mateu-table-crud
                            id="${this.id}"
            baseUrl="${this.baseUrl}"
                .metadata="${component.metadata}"
                .data="${this.data}"
            serversidetype="${this.serverSideType}"
                >
                 ${component.children?.map(child => this.renderChildComponent(child))}
             </mateu-table-crud></mateu-api-caller>`
            }

            if (component.metadata.type == ComponentMetadataType.Card) {
             return html`<mateu-api-caller><mateu-card
                            id="${this.id}"
            baseUrl="${this.baseUrl}"
                .metadata="${component.metadata}"
                .data="${this.data}"
            serversidetype="${this.serverSideType}"
                >
                 ${component.children?.map(child => this.renderChildComponent(child))}
             </mateu-card></mateu-api-caller>`
            }

            if (component.metadata.type == ComponentMetadataType.App) {
             return html`<mateu-api-caller><mateu-app
                            id="${this.id}"
            baseUrl="${this.baseUrl}"
                .metadata="${component.metadata}"
                .data="${this.data}"
            serversidetype="${this.serverSideType}"
                >
                 ${component.children?.map(child => this.renderChildComponent(child))}
             </mateu-app></mateu-api-caller>`
            }

            if (component.metadata.type == ComponentMetadataType.Element) {
                return this.renderElement(component.metadata as Element)
            }

            if (component.metadata.type == ComponentMetadataType.FormField) {
                    return html`<mateu-field
                       id="${this.id}"
                .field="${this.metadata}"
                >
                        ${component.children?.map(child => this.renderChildComponent(child))}
                    </mateu-field>`
            }

            return html`<p>Unknown metadata type ${component.metadata.type} for component ${component?.id}</p>`
        }
        return html`<p>No metadata for component ${component?.id}</p>`
    }

    render() {
        return this.renderComponent(this.component)
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-component': MateuComponent
    }
}


