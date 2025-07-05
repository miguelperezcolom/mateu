import Component from "@mateu/shared/apiClients/dtos/Component";
import FormLayout from "@mateu/shared/apiClients/dtos/componentmetadata/FormLayout";
import { FormLayoutResponsiveStep } from "@vaadin/form-layout";
import { html } from "lit";
import Tab from "@mateu/shared/apiClients/dtos/componentmetadata/Tab";
import AccordionPanel from "@mateu/shared/apiClients/dtos/componentmetadata/AccordionPanel";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { renderComponent } from "@infra/ui/renderComponents";

export const renderFormLayout = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as FormLayout

    const responsiveSteps: FormLayoutResponsiveStep[] = [
        // Use one column by default
        { minWidth: 0, columns: 1 },
        // Use two columns, if layout's width exceeds 500px
        { minWidth: '500px', columns: metadata?.columns??2 },
    ];

    return html`
               <vaadin-form-layout .responsiveSteps="${responsiveSteps}">
                   ${component.children?.map(child => renderComponent(child, baseUrl, data))}
               </vaadin-form-layout>
            `
}

export const renderHorizontalLayout = (component: Component, baseUrl: string | undefined, data: any) => {
    return html`
               <vaadin-horizontal-layout>
                   ${component.children?.map(child => renderComponent(child, baseUrl, data))}
               </vaadin-horizontal-layout>
            `
}

export const renderVerticalLayout = (component: Component, baseUrl: string | undefined, data: any) => {
    return html`
               <vaadin-vertical-layout>
                   ${component.children?.map(child => renderComponent(child, baseUrl, data))}
               </vaadin-vertical-layout>
            `
}

/*
<vaadin-split-layout style="max-height: 280px;">
  <master-content></master-content>
  <detail-content></detail-content>
</vaadin-split-layout>
 */
export const renderSplitLayout = (component: Component, baseUrl: string | undefined, data: any) => {
    return html`
               <vaadin-split-layout>
                   <master-content>${renderComponent(component.children![0], baseUrl, data)}</master-content>
                   <detail-content>${renderComponent(component.children![1], baseUrl, data)}</detail-content>
               </vaadin-split-layout>
            `
}

export const renderMasterDetailLayout = (component: Component, baseUrl: string | undefined, data: any) => {
    return html`
               <vaadin-master-detail-layout has-detail>
                   <div>${renderComponent(component.children![0], baseUrl, data)}</div>
                   <div slot="detail">${renderComponent(component.children![1], baseUrl, data)}</div>
               </vaadin-master-detail-layout>
            `
}

/*
<vaadin-tabs selected="4">
    <vaadin-tab>Page 1</vaadin-tab>
    <vaadin-tab>Page 2</vaadin-tab>
    <vaadin-tab>Page 3</vaadin-tab>
    <vaadin-tab>Page 4</vaadin-tab>
  </vaadin-tabs>
 */
export const renderTabLayout = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    return html`
        <vaadin-tabsheet>
            <vaadin-tabs slot="tabs">
                ${component.children?.map(child => child as ClientSideComponent).map(child => html`
                    <vaadin-tab id="${(child.metadata as Tab).label}">${(child.metadata as Tab).label}</vaadin-tab>
                `)}
            </vaadin-tabs>

            ${component.children?.map(child => renderTab(child as ClientSideComponent, baseUrl, data))}
        </vaadin-tabsheet>
            `
}

export const renderTab = (tab: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    return html`
        <div tab="${(tab.metadata as Tab).label}">
                   ${tab.children?.map(child => renderComponent(child, baseUrl, data))}
               </div>
            `
}


/*
<vaadin-accordion>
  <vaadin-accordion-panel>
    <vaadin-accordion-heading slot="summary">Panel 1</vaadin-accordion-heading>
    <div>This panel is opened, so the text is visible by default.</div>
  </vaadin-accordion-panel>
  <vaadin-accordion-panel>
    <vaadin-accordion-heading slot="summary">Panel 2</vaadin-accordion-heading>
    <div>After opening this panel, the first one becomes closed.</div>
  </vaadin-accordion-panel>
</vaadin-accordion>
 */
export const renderAccordionLayout = (component: Component, baseUrl: string | undefined, data: any) => {
    return html`
               <vaadin-accordion>
                   ${component.children?.map(child => renderAccordionPanel(child as ClientSideComponent, baseUrl, data))}
               </vaadin-accordion>
            `
}

export const renderAccordionPanel = (panel: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    return html`
        <vaadin-accordion-panel>
            <vaadin-accordion-heading slot="summary">${(panel.metadata as AccordionPanel).label}</vaadin-accordion-heading>
            ${panel.children?.map(child => renderComponent(child, baseUrl, data))}
        </vaadin-accordion-panel>
            `
}

export const renderScroller = (component: Component, baseUrl: string | undefined, data: any) => {
    return html`
               <vaadin-scroller style="width: 300px; height: 300px;">
                   ${component.children?.map(child => renderComponent(child, baseUrl, data))}
               </vaadin-scroller>
            `
}

export const renderFullWidth = (component: Component, baseUrl: string | undefined, data: any) => {
    return html`
               <div style="width: 100%">
                   ${component.children?.map(child => renderComponent(child, baseUrl, data))}
               </div>
            `
}

export const renderContainer = (component: Component, baseUrl: string | undefined, data: any) => {
    return html`
               <div style="max-width: 800px; margin: auto;">
                   ${component.children?.map(child => renderComponent(child, baseUrl, data))}
               </div>
            `
}

export const renderBoardLayout = (component: Component, baseUrl: string | undefined, data: any) => {
    return html`
        <vaadin-board>
            ${component.children?.map(child => renderBoardLayoutRow(child, baseUrl, data))}
        </vaadin-board>
            `
}

export const renderBoardLayoutRow = (tab: Component, baseUrl: string | undefined, data: any) => {
    return html`
        <vaadin-board-row>
                   ${tab.children?.map(child => renderComponent(child, baseUrl, data))}
               </vaadin-board-row>
            `
}
