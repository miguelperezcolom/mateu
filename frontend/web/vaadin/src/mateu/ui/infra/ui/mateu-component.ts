import { customElement, property } from "lit/decorators.js";
import { css, html, TemplateResult } from "lit";
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/split-layout'
import '@vaadin/master-detail-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/tabsheet'
import "@vaadin/menu-bar"
import "@vaadin/progress-bar"
import "@vaadin/scroller"
import "@vaadin/accordion"
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
import {
    renderAccordionLayout,
    renderContainer,
    renderFormLayout,
    renderFullWidth,
    renderHorizontalLayout,
    renderMasterDetailLayout,
    renderScroller,
    renderSplitLayout,
    renderTabLayout,
    renderVerticalLayout
} from "@infra/ui/renderLayouts";
import { renderText } from "@infra/ui/renderComponets";

@customElement('mateu-component')
export class MateuComponent extends ComponentElement {

    @property()
    signature: ComponentMetadata | undefined

    @property()
    baseUrl: string | undefined

    renderElement = (element: Element): TemplateResult => {
        let attributes = ''
        if (element.attributes) {
            for (let key in element.attributes) {
                // @ts-ignore
                attributes += ` ${key}="${element.attributes[key]}"`
            }
        }
        const h = `<${element.name}${attributes}>${element.content?element.content:''}<slot></slot></${element.name}>`
        return html`${unsafeHTML(h)}`
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
            if (component.metadata.type == ComponentMetadataType.SplitLayout) {
                return renderSplitLayout(component, this.renderChildComponent)
            }
            if (component.metadata.type == ComponentMetadataType.MasterDetailLayout) {
                return renderMasterDetailLayout(component, this.renderChildComponent)
            }
            if (component.metadata.type == ComponentMetadataType.TabLayout) {
                return renderTabLayout(component, this.renderChildComponent)
            }
            if (component.metadata.type == ComponentMetadataType.AccordionLayout) {
                return renderAccordionLayout(component, this.renderChildComponent)
            }
            if (component.metadata.type == ComponentMetadataType.Scroller) {
                return renderScroller(component, this.renderChildComponent)
            }
            if (component.metadata.type == ComponentMetadataType.FullWidth) {
                return renderFullWidth(component, this.renderChildComponent)
            }
            if (component.metadata.type == ComponentMetadataType.Container) {
                return renderContainer(component, this.renderChildComponent)
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
            if (component.metadata.type == ComponentMetadataType.Text) {
                return renderText(component)
            }

            return html`<p>Unknown metadata type ${component.metadata.type} for component ${component?.id}</p>`
        }
        return html`<p>No metadata for component ${component?.id}</p>`
    }

    render() {
        return this.renderComponent(this.component)
    }

    static styles = css`
        :host {
            width: 100%;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-component': MateuComponent
    }
}


