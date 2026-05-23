import { html, LitElement, nothing, TemplateResult } from "lit"
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts"
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts"
import FormLayout from "@mateu/shared/apiClients/dtos/componentmetadata/FormLayout.ts"
import HorizontalLayout from "@mateu/shared/apiClients/dtos/componentmetadata/HorizontalLayout.ts"
import VerticalLayout from "@mateu/shared/apiClients/dtos/componentmetadata/VerticalLayout.ts"
import TabLayout from "@mateu/shared/apiClients/dtos/componentmetadata/TabLayout.ts"
import Tab from "@mateu/shared/apiClients/dtos/componentmetadata/Tab.ts"
import AccordionLayout from "@mateu/shared/apiClients/dtos/componentmetadata/AccordionLayout.ts"
import AccordionPanel from "@mateu/shared/apiClients/dtos/componentmetadata/AccordionPanel.ts"
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts"
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType.ts"
import Component from "@mateu/shared/apiClients/dtos/Component.ts"

export const renderHorizontalLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as HorizontalLayout
    let style = component.style ?? ''
    if (metadata?.fullWidth) style += 'width: 100%;'
    if (metadata?.justification) style += `justify-content: ${metadata.justification};`
    if (metadata?.verticalAlignment) style += `align-items: ${metadata.verticalAlignment};`
    const gap = metadata?.spacing ? '1rem' : '0'
    return html`
        <div style="display: flex; flex-direction: row; flex-wrap: ${metadata?.wrap ? 'wrap' : 'nowrap'}; gap: ${gap}; ${style}"
             class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>`
}

export const renderVerticalLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as VerticalLayout
    let style = component.style ?? ''
    if (metadata?.fullWidth) style += 'width: 100%;'
    if (metadata?.justification) style += `justify-content: ${metadata.justification};`
    if (metadata?.horizontalAlignment) style += `align-items: ${metadata.horizontalAlignment};`
    const gap = metadata?.spacing ? '1rem' : '0'
    return html`
        <div style="display: flex; flex-direction: column; gap: ${gap}; ${style}"
             class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>`
}

const renderFormChild = (container: LitElement, child: Component, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any, cols: number): TemplateResult => {
    const clientChild = child as ClientSideComponent
    // FormRow: transparent wrapper — render its children directly into the grid
    if (clientChild.type === ComponentType.ClientSide && clientChild.metadata?.type === ComponentMetadataType.FormRow) {
        return html`${clientChild.children?.map(grandchild =>
            renderFormChild(container, grandchild, baseUrl, state, data, appState, appData, cols)
        )}`
    }
    // FormField with colspan > 1 needs a spanning wrapper
    if (clientChild.type === ComponentType.ClientSide && clientChild.metadata?.type === ComponentMetadataType.FormField) {
        const fieldMeta = clientChild.metadata as FormField
        const colspan = fieldMeta?.colspan ?? 1
        if (colspan > 1) {
            return html`<div style="grid-column: span ${Math.min(colspan, cols)};">
                ${renderComponent(container, child, baseUrl, state, data, appState, appData)}
            </div>`
        }
    }
    return renderComponent(container, child, baseUrl, state, data, appState, appData)
}

export const renderFormRow = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    // Standalone FormRow outside a FormLayout — just render children
    return html`${component.children?.map(child =>
        renderComponent(container, child, baseUrl, state, data, appState, appData)
    )}`
}

export const renderFormLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as FormLayout
    const cols = metadata?.maxColumns && metadata.maxColumns > 0 ? metadata.maxColumns : 2
    let style = component.style ?? ''
    if (metadata?.fullWidth) style += 'width: 100%;'
    return html`
        <div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 1rem; ${style}"
             class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}">
            ${component.children?.map(child => renderFormChild(container, child, baseUrl, state, data, appState, appData, cols))}
        </div>`
}

export const renderTabLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as TabLayout
    let style = component.style ?? ''
    if (metadata?.fullWidth) style += 'width: 100%;'
    return html`
        <ui5-tabcontainer
            style="${style}"
            class="${component.cssClasses ?? nothing}"
            slot="${component.slot ?? nothing}"
        >
            ${component.children?.map(child => {
                const tab = child as ClientSideComponent
                const tabMeta = tab.metadata as Tab
                return html`
                    <ui5-tab text="${tabMeta?.label ?? ''}">
                        ${tab.children?.map(grandchild => renderComponent(container, grandchild, baseUrl, state, data, appState, appData))}
                    </ui5-tab>`
            })}
        </ui5-tabcontainer>`
}

export const renderAccordionLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as AccordionLayout
    let style = component.style ?? ''
    if (metadata?.fullWidth) style += 'width: 100%;'
    return html`
        <div style="${style}"
             class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}">
            ${component.children?.map(child => {
                const panel = child as ClientSideComponent
                const panelMeta = panel.metadata as AccordionPanel
                return html`
                    <ui5-panel
                        header-text="${panelMeta?.label ?? ''}"
                        ?collapsed="${!panelMeta?.active}"
                        ?disabled="${panelMeta?.disabled}"
                        style="margin-bottom: 0.5rem;"
                    >
                        ${panel.children?.map(grandchild => renderComponent(container, grandchild, baseUrl, state, data, appState, appData))}
                    </ui5-panel>`
            })}
        </div>`
}

export const renderSplitLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    return html`
        <div style="display: flex; gap: 1rem; ${component.style ?? ''}"
             slot="${component.slot ?? nothing}">
            <div style="flex: 1;">${component.children?.[0] ? renderComponent(container, component.children[0] as Component, baseUrl, state, data, appState, appData) : nothing}</div>
            <div style="flex: 1;">${component.children?.[1] ? renderComponent(container, component.children[1] as Component, baseUrl, state, data, appState, appData) : nothing}</div>
        </div>`
}

export const renderScroller = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    return html`
        <div style="overflow: auto; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>`
}

export const renderFullWidth = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    return html`
        <div style="width: 100%; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>`
}

export const renderContainer = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    return html`
        <div style="max-width: 800px; margin: auto; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>`
}

export const renderBoardLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    return html`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>`
}

export const renderBoardLayoutRow = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    return html`
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>`
}

export const renderBoardLayoutItem = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as any
    const boardCols = metadata?.boardCols
    const style = boardCols ? `flex: ${boardCols}; ${component.style ?? ''}` : `flex: 1; ${component.style ?? ''}`
    return html`
        <div style="${style}" class="${component.cssClasses ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>`
}
