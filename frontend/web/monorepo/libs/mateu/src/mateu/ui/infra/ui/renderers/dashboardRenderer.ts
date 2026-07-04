import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MetricCard from "@mateu/shared/apiClients/dtos/componentmetadata/MetricCard";
import DashboardPanel from "@mateu/shared/apiClients/dtos/componentmetadata/DashboardPanel";
import DashboardLayout from "@mateu/shared/apiClients/dtos/componentmetadata/DashboardLayout";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

const cardSurface = `
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`

const trendColor = (trend?: string) => {
    if (trend == 'up') return 'var(--lumo-success-text-color, #1a7f37)'
    if (trend == 'down') return 'var(--lumo-error-text-color, #c5221f)'
    return 'var(--lumo-secondary-text-color, #666)'
}

const trendArrow = (trend?: string) => {
    if (trend == 'up') return '▲'
    if (trend == 'down') return '▼'
    return ''
}

const handleMetricClick = (event: Event, metadata: MetricCard) => {
    if (!metadata.actionId) {
        return
    }
    event.target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId: metadata.actionId
        },
        bubbles: true,
        composed: true
    }))
}

export const renderMetricCard = (component: ClientSideComponent) => {
    const metadata = component.metadata as MetricCard
    const clickable = !!metadata.actionId
    return html`
        <div class="mateu-metric-card ${component.cssClasses??''}"
             style="${cardSurface} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${clickable?'cursor: pointer;':''} ${component.style??''}"
             slot="${component.slot??nothing}"
             role="${clickable?'button':nothing}"
             @click="${(e: Event) => handleMetricClick(e, metadata)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${metadata.title}</span>
                ${metadata.icon?html`<vaadin-icon icon="${metadata.icon}" style="color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;"></vaadin-icon>`:nothing}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${metadata.value}</span>
                ${metadata.unit?html`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${metadata.unit}</span>`:nothing}
            </div>
            ${metadata.trend || metadata.trendLabel?html`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${trendColor(metadata.trend)};">
                    ${trendArrow(metadata.trend)} ${metadata.trendLabel??nothing}
                </span>
            `:nothing}
            ${metadata.description?html`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${metadata.description}</span>`:nothing}
        </div>
    `
}

export const renderScoreboard = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    return html`
        <div class="mateu-scoreboard ${component.cssClasses??''}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${component.style??''}"
             slot="${component.slot??nothing}"
        >
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>
    `
}

export const renderDashboardPanel = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as DashboardPanel
    const colSpan = metadata.colSpan && metadata.colSpan > 1 ? `grid-column: span ${metadata.colSpan};` : ''
    const rowSpan = metadata.rowSpan && metadata.rowSpan > 1 ? `grid-row: span ${metadata.rowSpan};` : ''
    return html`
        <div class="mateu-dashboard-panel ${component.cssClasses??''}"
             style="${cardSurface} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${colSpan} ${rowSpan} ${component.style??''}"
             slot="${component.slot??nothing}"
        >
            ${metadata.title?html`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${metadata.title}</h3>
                    ${metadata.subtitle?html`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${metadata.subtitle}</span>`:nothing}
                </div>
            `:nothing}
            <div style="flex: 1; min-height: 0;">
                ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
            </div>
        </div>
    `
}

export const renderDashboardLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as DashboardLayout
    const columns = metadata.columns && metadata.columns > 0
        ? `repeat(${metadata.columns}, minmax(0, 1fr))`
        : 'repeat(auto-fit, minmax(20rem, 1fr))'
    return html`
        <div class="mateu-dashboard ${component.cssClasses??''}"
             style="display: grid; grid-template-columns: ${columns}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${component.style??''}"
             slot="${component.slot??nothing}"
        >
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </div>
    `
}
