import Component from "@mateu/shared/apiClients/dtos/Component";
import FormLayout from "@mateu/shared/apiClients/dtos/componentmetadata/FormLayout";
import { FormLayoutResponsiveStep } from "@vaadin/form-layout";
import { html } from "lit";
import Tab from "@mateu/shared/apiClients/dtos/componentmetadata/Tab";
import AccordionPanel from "@mateu/shared/apiClients/dtos/componentmetadata/AccordionPanel";

export const renderFormLayout = (component: Component, renderComponent: Function) => {
    const metadata = component.metadata as FormLayout

    const responsiveSteps: FormLayoutResponsiveStep[] = [
        // Use one column by default
        { minWidth: 0, columns: 1 },
        // Use two columns, if layout's width exceeds 500px
        { minWidth: '500px', columns: metadata?.columns??2 },
    ];

    return html`
               <vaadin-form-layout .responsiveSteps="${responsiveSteps}">
                   ${component.children?.map(child => renderComponent(child))}
               </vaadin-form-layout>
            `
}

export const renderHorizontalLayout = (component: Component, renderComponent: Function) => {
    return html`
               <vaadin-horizontal-layout>
                   ${component.children?.map(child => renderComponent(child))}
               </vaadin-horizontal-layout>
            `
}

export const renderVerticalLayout = (component: Component, renderComponent: Function) => {
    return html`
               <vaadin-vertical-layout>
                   ${component.children?.map(child => renderComponent(child))}
               </vaadin-vertical-layout>
            `
}

/*
<vaadin-split-layout style="max-height: 280px;">
  <master-content></master-content>
  <detail-content></detail-content>
</vaadin-split-layout>
 */
export const renderSplitLayout = (component: Component, renderComponent: Function) => {
    return html`
               <vaadin-split-layout>
                   <master-content>${renderComponent(component.children![0])}</master-content>
                   <detail-content>${renderComponent(component.children![1])}</detail-content>
               </vaadin-split-layout>
            `
}

export const renderMasterDetailLayout = (component: Component, renderComponent: Function) => {
    return html`
               <vaadin-master-detail-layout has-detail>
                   <div>${renderComponent(component.children![0])}</div>
                   <div slot="detail">${renderComponent(component.children![1])}</div>
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
export const renderTabLayout = (component: Component, renderComponent: Function) => {
    return html`
        <vaadin-tabsheet>
            <vaadin-tabs slot="tabs">
                ${component.children?.map(child => html`
                    <vaadin-tab id="${(child.metadata as Tab).label}">${(child.metadata as Tab).label}</vaadin-tab>
                `)}
            </vaadin-tabs>

            ${component.children?.map(child => renderTab(child, renderComponent))}
        </vaadin-tabsheet>
            `
}

export const renderTab = (tab: Component, renderComponent: Function) => {
    return html`
        <div tab="${(tab.metadata as Tab).label}">
                   ${tab.children?.map(child => renderComponent(child))}
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
export const renderAccordionLayout = (component: Component, renderComponent: Function) => {
    return html`
               <vaadin-accordion>
                   ${component.children?.map(child => renderAccordionPanel(child, renderComponent))}
               </vaadin-accordion>
            `
}

export const renderAccordionPanel = (panel: Component, renderComponent: Function) => {
    return html`
        <vaadin-accordion-panel>
            <vaadin-accordion-heading slot="summary">${(panel.metadata as AccordionPanel).label}</vaadin-accordion-heading>
            ${panel.children?.map(child => renderComponent(child))}
        </vaadin-accordion-panel>
            `
}

export const renderScroller = (component: Component, renderComponent: Function) => {
    return html`
               <vaadin-scroller>
                   ${component.children?.map(child => renderComponent(child))}
               </vaadin-scroller>
            `
}

export const renderFullWidth = (component: Component, renderComponent: Function) => {
    return html`
               <div style="width: 100%">
                   ${component.children?.map(child => renderComponent(child))}
               </div>
            `
}

export const renderContainer = (component: Component, renderComponent: Function) => {
    return html`
               <div style="max-width: 800px; margin: auto;">
                   ${component.children?.map(child => renderComponent(child))}
               </div>
            `
}
