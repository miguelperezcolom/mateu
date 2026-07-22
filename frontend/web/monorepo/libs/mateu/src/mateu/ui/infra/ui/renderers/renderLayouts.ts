import Component from "@mateu/shared/apiClients/dtos/Component";
import FormLayout from "@mateu/shared/apiClients/dtos/componentmetadata/FormLayout";
import { html, LitElement, nothing, TemplateResult } from "lit";
import Tab from "@mateu/shared/apiClients/dtos/componentmetadata/Tab";
import AccordionPanel from "@mateu/shared/apiClients/dtos/componentmetadata/AccordionPanel";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import HorizontalLayout from "@mateu/shared/apiClients/dtos/componentmetadata/HorizontalLayout";
import VerticalLayout from "@mateu/shared/apiClients/dtos/componentmetadata/VerticalLayout";
import SplitLayout from "@mateu/shared/apiClients/dtos/componentmetadata/SplitLayout";
import AccordionLayout, { AccordionLayoutVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AccordionLayout";
import TabLayout from "@mateu/shared/apiClients/dtos/componentmetadata/TabLayout";
import BoardLayoutItem from "@mateu/shared/apiClients/dtos/componentmetadata/BoardLayout";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType.ts";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

/*
 * Design-system-neutral layout renderers — flex / CSS grid / native <details>, no `@vaadin`.
 * The Vaadin adapter (apps/vaadin/renderers/renderLayouts) overrides every layout type with the
 * pixel-perfect vaadin-* components; sapui5 has its own. These are the safe defaults any other
 * renderer inherits.
 */

const GAP = 'var(--lumo-space-m, 1rem)'

export const renderFormLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as FormLayout
    const colWidth = metadata.columnWidth || '13rem'
    const cols = metadata.maxColumns && metadata.maxColumns > 0
        ? `repeat(${metadata.maxColumns}, minmax(0, 1fr))`
        : `repeat(auto-fill, minmax(min(100%, ${colWidth}), 1fr))`
    let style = `display: grid; grid-template-columns: ${cols}; gap: ${GAP} var(--lumo-space-l, 1.5rem); align-items: start;`
    if (metadata.labelsAside) style += ' --mateu-label-width: 10rem;'
    if (metadata.fullWidth) style += ' width: 100%;'
    style += component.style ?? ''
    return html`
        <div style="${style}" class="${component.cssClasses}" slot="${component.slot || nothing}">
            ${component.children?.map(child => renderFormComponent(metadata, container, child, baseUrl, state, data, appState, appData))}
        </div>
    `
}

export const renderFormComponent = (form: FormLayout, container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => {
    if (component.type == ComponentType.ClientSide && (component as ClientSideComponent).metadata?.type == ComponentMetadataType.FormRow) {
        return renderFormRow(form, container, component as ClientSideComponent, baseUrl, state, data, appState, appData)
    }
    const colspan = fieldColspan(component)
    const cell = form.labelsAside
        ? wrapWithFormItem(container, component, baseUrl, state, data, appState, appData)
        : renderComponent(container, component, baseUrl, state, data, appState, appData)
    return html`<div style="grid-column: span ${colspan}; min-width: 0;">${cell}</div>`
}

const fieldColspan = (component: Component): number => {
    if (component.type == ComponentType.ClientSide) {
        const md = (component as ClientSideComponent).metadata
        if (md?.type == ComponentMetadataType.FormField) return (md as FormField).colspan || 1
    }
    return 1
}

export const wrapWithFormItem = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    if (component.type == ComponentType.ClientSide && (component as ClientSideComponent).metadata?.type == ComponentMetadataType.FormField && ((component as ClientSideComponent).metadata as FormField).label) {
        const field = (component as ClientSideComponent).metadata as FormField
        const fieldLabel = field.label?.includes('${') ? (container as any)._evalTemplate(field.label) : field.label
        return html`
            <div style="display: flex; gap: ${GAP}; align-items: baseline;">
                <label style="flex: 0 0 var(--mateu-label-width, 10rem); color: var(--lumo-secondary-text-color, #667);">${fieldLabel}</label>
                <div style="flex: 1; min-width: 0;">${renderComponent(container, component, baseUrl, state, data, appState, appData, true)}</div>
            </div>
        `
    }
    return renderComponent(container, component, baseUrl, state, data, appState, appData)
}

export const renderFormRow = (form: FormLayout, container: LitElement, tab: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    return html`
        <div style="grid-column: 1 / -1; display: flex; gap: ${GAP}; flex-wrap: wrap;">
            ${tab.children?.map(child => html`<div style="flex: 1 1 ${100 / Math.max(1, tab.children!.length)}%; min-width: min(100%, 13rem);">${renderFormComponent(form, container, child, baseUrl, state, data, appState, appData)}</div>`)}
        </div>
    `
}

const flexLayout = (direction: 'row' | 'column', container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = (component as ClientSideComponent).metadata as (HorizontalLayout & VerticalLayout)
    let style = `display: flex; flex-direction: ${direction};`
    if (metadata.spacing) style += ` gap: ${GAP};`
    if (metadata.padding) style += ' padding: var(--lumo-space-m, 1rem);'
    if (metadata.wrap) style += ' flex-wrap: wrap;'
    if (metadata.fullWidth) style += ' width: 100%;'
    if (metadata.justification) style += ` justify-content: ${metadata.justification};`
    const crossAlign = direction === 'row'
        ? (metadata as HorizontalLayout).verticalAlignment
        : (metadata as VerticalLayout).horizontalAlignment
    if (crossAlign) style += ` align-items: ${crossAlign};`
    style += component.style ?? ''
    return html`
        <div style="${style}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>
    `
}

export const renderHorizontalLayout = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) =>
    flexLayout('row', container, component, baseUrl, state, data, appState, appData)

export const renderVerticalLayout = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) =>
    flexLayout('column', container, component, baseUrl, state, data, appState, appData)

export const renderSplitLayout = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = (component as ClientSideComponent).metadata as SplitLayout
    const dir = metadata.orientation === 'vertical' ? 'column' : 'row'
    let style = `display: flex; flex-direction: ${dir}; gap: var(--lumo-space-s, 0.5rem);`
    if (metadata.fullWidth) style += ' width: 100%;'
    style += component.style ?? ''
    return html`
        <div style="${style}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            <div style="flex: 1; min-width: 0; min-height: 0;">${renderComponent(container, component.children![0], baseUrl, state, data, appState, appData)}</div>
            <div style="flex: 1; min-width: 0; min-height: 0;">${renderComponent(container, component.children![1], baseUrl, state, data, appState, appData)}</div>
        </div>
    `
}

export const renderMasterDetailLayout = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const staticDetail = component.children && component.children.length > 1 ? component.children[1] : null
    const dynamicDetail = data?.detailComponent ?? null
    const hasDetail = !!(data?.hasDetail) || !!staticDetail
    const detailContent = dynamicDetail ?? staticDetail
    return html`
        <div style="display: flex; gap: var(--lumo-space-m, 1rem); ${component.style ?? ''}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            <div style="flex: 1; min-width: 0;">${renderComponent(container, component.children![0], baseUrl, state, data, appState, appData)}</div>
            ${hasDetail && detailContent
                ? html`<div style="flex: 1; min-width: 0;">${renderComponent(container, detailContent, baseUrl, state, data, appState, appData)}</div>`
                : html`<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem);">Select an item to view details</div>`}
        </div>
    `
}

/** Neutral tabs degrade to a native <details> disclosure per tab (first one open) — no JS. */
export const renderTabLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    let style = component.style ?? ''
    if ((component.metadata as TabLayout).fullWidth) style += ' width: 100%;'
    const activeIndex = Math.max(0, (component.children ?? []).findIndex(child => ((child as ClientSideComponent).metadata as Tab).active))
    return html`
        <div style="${style}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            ${component.children?.map((child, index) => {
                const cs = child as ClientSideComponent
                const rawLabel = (cs.metadata as Tab).label
                const label = rawLabel?.includes('${') ? (container as any)._evalTemplate(rawLabel) : rawLabel
                return html`
                    <details ?open="${index === activeIndex}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));">
                        <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600;">${label}</summary>
                        <div style="padding: var(--lumo-space-m, 1rem) 0;">
                            ${cs.children?.map(grandChild => renderComponent(container, grandChild, baseUrl, state, data, appState, appData))}
                        </div>
                    </details>
                `
            })}
        </div>
    `
}

export const renderTab = (container: LitElement, tab: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const rawLabel = (tab.metadata as Tab).label
    const label = rawLabel?.includes('${') ? (container as any)._evalTemplate(rawLabel) : rawLabel
    return html`
        <div tab="${label}" style="padding: var(--lumo-space-m, 1rem) 0;">
            ${tab.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>
    `
}

export const renderAccordionLayout = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = (component as ClientSideComponent).metadata as AccordionLayout
    let style = component.style ?? ''
    if (metadata.fullWidth) style += ' width: 100%;'
    return html`
        <div style="${style}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            ${(component as ClientSideComponent).children?.map(child => renderAccordionPanel(container, child as ClientSideComponent, baseUrl, state, data, appState, appData, metadata.variant))}
        </div>
    `
}

export const renderAccordionPanel = (container: LitElement, panel: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, _variant: AccordionLayoutVariant | undefined) => {
    const metadata = panel.metadata as AccordionPanel
    const label = metadata.label?.includes('${') ? (container as any)._evalTemplate(metadata.label) : metadata.label
    return html`
        <details ?open="${metadata.active}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); ${panel.style ?? ''}" class="${panel.cssClasses}">
            <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600; ${metadata.disabled ? 'pointer-events: none; opacity: .5;' : ''}">${label}</summary>
            <div style="padding: var(--lumo-space-s, .5rem) 0;">
                ${panel.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
            </div>
        </details>
    `
}

export const renderScroller = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    return html`
        <div style="overflow: auto; ${component.style ?? ''}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>
    `
}

export const renderFullWidth = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    return html`
        <div style="width: 100%; ${component.style}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>
    `
}

export const renderContainer = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    return html`
        <div style="max-width: min(100%, 1200px); margin: auto; ${component.style}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>
    `
}

export const renderBoardLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    return html`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: ${GAP}; ${component.style}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>
    `
}

export const renderBoardLayoutRow = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    return html`
        <div style="display: flex; gap: ${GAP}; flex-wrap: wrap; ${component.style}" class="${component.cssClasses}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>
    `
}

export const renderBoardLayoutItem = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as BoardLayoutItem
    return html`
        <div style="flex: ${metadata.boardCols ?? 1} 1 0; min-width: min(100%, 12rem); ${component.style}" class="${component.cssClasses}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>
    `
}
