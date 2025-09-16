import Component from "@mateu/shared/apiClients/dtos/Component";
import FormLayout from "@mateu/shared/apiClients/dtos/componentmetadata/FormLayout";
import { html, LitElement, nothing } from "lit";
import Tab from "@mateu/shared/apiClients/dtos/componentmetadata/Tab";
import AccordionPanel from "@mateu/shared/apiClients/dtos/componentmetadata/AccordionPanel";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import HorizontalLayout from "@mateu/shared/apiClients/dtos/componentmetadata/HorizontalLayout";
import VerticalLayout from "@mateu/shared/apiClients/dtos/componentmetadata/VerticalLayout";
import SplitLayout from "@mateu/shared/apiClients/dtos/componentmetadata/SplitLayout";
import AccordionLayout, {
    AccordionLayoutVariant
} from "@mateu/shared/apiClients/dtos/componentmetadata/AccordionLayout";
import TabLayout from "@mateu/shared/apiClients/dtos/componentmetadata/TabLayout";
import BoardLayoutItem from "@mateu/shared/apiClients/dtos/componentmetadata/BoardLayout";

export const renderFormLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as FormLayout

    let style = component.style;
    if (style == undefined) {
        style = '';
    }
    if (metadata.columnSpacing) {
        style += '--vaadin-form-layout-column-spacing: ' + metadata.columnSpacing + ';'
    }
    if (metadata.itemRowSpacing) {
        style += '--vaadin-form-layout-row-spacing: ' + metadata.itemRowSpacing + ';'
    }
    if (metadata.itemLabelSpacing) {
        style += '--vaadin-form-layout-label-spacing: ' + metadata.itemLabelSpacing + ';'
    }
    if (metadata.fullWidth) {
        style += 'width: 100%;';
    }

    return html`
               <vaadin-form-layout 
                       .responsiveSteps="${metadata.responsiveSteps || nothing}"  
                       style="${style || nothing}" 
                       class="w-full ${component.cssClasses}"
                       max-columns="${metadata.maxColumns && metadata.maxColumns > 0?metadata.maxColumns:nothing}"
                       auto-responsive="${metadata.autoResponsive || nothing}"
                       column-width="${metadata.columnWidth || nothing}"
                       expand-columns="${metadata.expandColumns || nothing}"
                       expand-fields="${metadata.expandFields || nothing}"
                       labels-aside="${metadata.labelsAside || nothing}"
                       slot="${component.slot || nothing}"
               >
                   ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
               </vaadin-form-layout>
            `
}

export const renderFormRow = (container: LitElement, tab: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    return html`
        <vaadin-form-row>
            ${tab.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
        </vaadin-form-row>
            `
}

export const renderFormItem = (container: LitElement, tab: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    return html`
        <vaadin-form-item>
            ${tab.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
        </vaadin-form-item>
            `
}

export const renderHorizontalLayout = (container: LitElement, component: Component, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = (component as ClientSideComponent).metadata as HorizontalLayout
    const theme = ''
        + (metadata.padding?' padding':'')
        + (metadata.spacing?' spacing':'')
        + (metadata.spacingVariant?' spacing-' + metadata.spacingVariant:'')
        + (metadata.wrap?' wrap':'')
    let style = component.style;
    if (metadata.fullWidth) {
        style = style?'width: 100%;' + style:'width: 100%;'
    }
    if (metadata.justification) {
        style = style?'justify-content: ' + metadata.justification + ';' + style:'justify-content: ' + metadata.justification + ';'
    }
    if (metadata.verticalAlignment) {
        style = style?'align-items: ' + metadata.verticalAlignment + ';' + style:'align-items: ' + metadata.verticalAlignment + ';'
    }
    return html`
               <vaadin-horizontal-layout 
                       style="${style}" 
                       class="${component.cssClasses}"
                       theme="${theme}"
                       slot="${component.slot??nothing}"
               >
                   ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
               </vaadin-horizontal-layout>
            `
}

export const renderVerticalLayout = (container: LitElement, component: Component, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = (component as ClientSideComponent).metadata as VerticalLayout
    const theme = ''
        + (metadata.padding?' padding':'')
        + (metadata.spacing?' spacing':'')
        + (metadata.spacingVariant?' spacing-' + metadata.spacingVariant:'')
        + (metadata.wrap?' wrap':'')
    let style = component.style;
    if (metadata.fullWidth) {
        style = style?'width: 100%;' + style:'width: 100%;'
    }
    if (metadata.justification) {
        style = style?'justify-content: ' + metadata.justification + ';' + style:'justify-content: ' + metadata.justification + ';'
    }
    if (metadata.horizontalAlignment) {
        style = style?'align-items: ' + metadata.horizontalAlignment + ';' + style:'align-items: ' + metadata.horizontalAlignment + ';'
    }

    return html`
        <vaadin-vertical-layout
                style="${style}"
                class="${component.cssClasses}"
                theme="${theme}"
                slot="${component.slot??nothing}"
        >
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
        </vaadin-vertical-layout>
    `
}

/*
<vaadin-split-layout style="max-height: 280px;">
  <master-content></master-content>
  <detail-content></detail-content>
</vaadin-split-layout>
 */
export const renderSplitLayout = (container: LitElement, component: Component, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = (component as ClientSideComponent).metadata as SplitLayout
    let style = component.style;
    if (metadata.fullWidth) {
        style = style?'width: 100%;' + style:'width: 100%;'
    }
    return html`
               <vaadin-split-layout 
                       style="${style}" 
                       class="${component.cssClasses}"
                       orientation="${metadata.orientation??nothing}"
                       theme="${metadata.variant??nothing}"
                       slot="${component.slot??nothing}"
               >
                   <master-content>${renderComponent(container, component.children![0], baseUrl, state, data)}</master-content>
                   <detail-content>${renderComponent(container, component.children![1], baseUrl, state, data)}</detail-content>
               </vaadin-split-layout>
            `
}

export const renderMasterDetailLayout = (container: LitElement, component: Component, baseUrl: string | undefined, state: any, data: any) => {
    return html`
               <vaadin-master-detail-layout has-detail 
                                            style="${component.style}" 
                                            class="${component.cssClasses}"
                                            slot="${component.slot??nothing}">
                   <div>${renderComponent(container, component.children![0], baseUrl, state, data)}</div>
                   <div slot="detail">${renderComponent(container, component.children![1], baseUrl, state, data)}</div>
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
export const renderTabLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as TabLayout

    let style = component.style;
    if (style == undefined) {
        style = '';
    }
    if (metadata.fullWidth) {
        style += 'width: 100%;';
    }

    let variant = metadata.variant
    if ('equalWidth' == variant) {
        variant = 'equal-width-tabs'
    }

    console.log('variant', variant)

    return html`
        <vaadin-tabsheet
                theme="${variant??nothing}"
                slot="${component.slot??nothing}"
        >
            <vaadin-tabs slot="tabs" 
                         style="${style}" 
                         class="${component.cssClasses}"
                         orientation="${metadata.orientation??nothing}"
            >
                ${component.children?.map(child => child as ClientSideComponent).map(child => html`
                    <vaadin-tab id="${(child.metadata as Tab).label}" 
                                style="${child.style}" 
                                class="${child.cssClasses}"
                    >${(child.metadata as Tab).label}</vaadin-tab>
                `)}
            </vaadin-tabs>

            ${component.children?.map(child => renderTab(container, child as ClientSideComponent, baseUrl, state, data))}
        </vaadin-tabsheet>
            `
}

export const renderTab = (container: LitElement, tab: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    return html`
        <div tab="${(tab.metadata as Tab).label}">
                   ${tab.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
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
export const renderAccordionLayout = (container: LitElement, component: Component, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = (component as ClientSideComponent).metadata as AccordionLayout
    let style = component.style;
    if (metadata.fullWidth) {
        style = style?'width: 100%;' + style:'width: 100%;'
    }
    let opened = 'undefined';
    if (component.children) {
        for (let i = 0; i < component.children.length; i++) {
            // @ts-ignore
            if (component.children[i].metadata.active) {
                opened = '' + i;
                break;
            }
        }
    }
    console.log('opened', opened)
    return html`
               <vaadin-accordion 
                       style="${component.style}" 
                       class="${component.cssClasses}"
                       opened="${opened}"
                       slot="${component.slot??nothing}"
               >
                   ${component.children?.map(child => renderAccordionPanel(container, child as ClientSideComponent, baseUrl, state, data, metadata.variant))}
               </vaadin-accordion>
            `
}

export const renderAccordionPanel = (container: LitElement, panel: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, variant: AccordionLayoutVariant | undefined) => {
    const metadata = panel.metadata as AccordionPanel
    return html`
        <vaadin-accordion-panel style="${panel.style}" 
                                class="${panel.cssClasses}"
                                theme="${variant??nothing}"
                                ?opened="${metadata.active}"
                                ?disabled="${metadata.disabled}">
            <vaadin-accordion-heading slot="summary">${metadata.label}</vaadin-accordion-heading>
            ${panel.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
        </vaadin-accordion-panel>
            `
}

export const renderScroller = (container: LitElement, component: Component, baseUrl: string | undefined, state: any, data: any) => {
    return html`
               <vaadin-scroller style="${component.style}" 
                                class="${component.cssClasses}"
                                slot="${component.slot??nothing}">
                   ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
               </vaadin-scroller>
            `
}

export const renderFullWidth = (container: LitElement, component: Component, baseUrl: string | undefined, state: any, data: any) => {
    return html`
               <div style="width: 100%; ${component.style}" 
                    class="${component.cssClasses}"
                    slot="${component.slot??nothing}">
                   ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
               </div>
            `
}

export const renderContainer = (container: LitElement, component: Component, baseUrl: string | undefined, state: any, data: any) => {
    return html`
               <div style="max-width: 800px; margin: auto; ${component.style}" 
                    class="${component.cssClasses}"
                    slot="${component.slot??nothing}">
                   ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
               </div>
            `
}

export const renderBoardLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    return html`
        <vaadin-board style="${component.style}" 
                      class="${component.cssClasses}"
                      slot="${component.slot??nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
        </vaadin-board>
            `
}

export const renderBoardLayoutRow = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    return html`
        <vaadin-board-row style="${component.style}" class="${component.cssClasses}">
                   ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
               </vaadin-board-row>
            `
}

export const renderBoardLayoutItem = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as BoardLayoutItem
    return html`
        <div style="${component.style}" 
             class="${component.cssClasses}"
             board-cols="${metadata.boardCols??nothing}"
        >
                   ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
               </div>
            `
}
