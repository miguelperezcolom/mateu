import { html, LitElement, nothing, TemplateResult } from "lit"
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts"
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts"
import Badge from "@mateu/shared/apiClients/dtos/componentmetadata/Badge.ts"
import Breadcrumbs, { Breadcrumb } from "@mateu/shared/apiClients/dtos/componentmetadata/Breadcrumbs.ts"
import Icon from "@mateu/shared/apiClients/dtos/componentmetadata/Icon.ts"
import Notification from "@mateu/shared/apiClients/dtos/componentmetadata/Notification.ts"
import Text from "@mateu/shared/apiClients/dtos/componentmetadata/Text.ts"
import { TextContainer } from "@mateu/shared/apiClients/dtos/componentmetadata/TextContainer.ts"
import { ifDefined } from "lit/directives/if-defined.js"

// Text — use SAP UI5 typography elements
export const renderText = (component: ClientSideComponent, _state: any, _data: any, _appState: any, _appData: any): TemplateResult => {
    const metadata = component.metadata as Text
    const content = metadata.text ?? ''

    const sharedAttrs = {
        id: ifDefined(component.id),
        style: component.style ?? nothing,
        class: component.cssClasses ?? nothing,
        slot: component.slot ?? nothing,
    }

    if (metadata.container === TextContainer.h1) return html`<h1 id="${sharedAttrs.id}" style="${sharedAttrs.style}" class="${sharedAttrs.class}" slot="${sharedAttrs.slot}">${content}</h1>`
    if (metadata.container === TextContainer.h2) return html`<h2 id="${sharedAttrs.id}" style="${sharedAttrs.style}" class="${sharedAttrs.class}" slot="${sharedAttrs.slot}">${content}</h2>`
    if (metadata.container === TextContainer.h3) return html`<h3 id="${sharedAttrs.id}" style="${sharedAttrs.style}" class="${sharedAttrs.class}" slot="${sharedAttrs.slot}">${content}</h3>`
    if (metadata.container === TextContainer.h4) return html`<h4 id="${sharedAttrs.id}" style="${sharedAttrs.style}" class="${sharedAttrs.class}" slot="${sharedAttrs.slot}">${content}</h4>`
    if (metadata.container === TextContainer.h5) return html`<h5 id="${sharedAttrs.id}" style="${sharedAttrs.style}" class="${sharedAttrs.class}" slot="${sharedAttrs.slot}">${content}</h5>`
    if (metadata.container === TextContainer.h6) return html`<h6 id="${sharedAttrs.id}" style="${sharedAttrs.style}" class="${sharedAttrs.class}" slot="${sharedAttrs.slot}">${content}</h6>`
    if (metadata.container === TextContainer.span) return html`<span id="${sharedAttrs.id}" style="${sharedAttrs.style}" class="${sharedAttrs.class}" slot="${sharedAttrs.slot}">${content}</span>`

    return html`<p id="${sharedAttrs.id}" style="${sharedAttrs.style}" class="${sharedAttrs.class}" slot="${sharedAttrs.slot}">${content}</p>`
}

// Badge → ui5-tag
export const renderBadge = (component: ClientSideComponent, _state: any, _data: any): TemplateResult => {
    const metadata = component.metadata as Badge
    const text = metadata?.text ?? ''
    const color = metadata?.color ?? ''

    // Map Mateu badge colors to SAP UI5 color-scheme values (1-10)
    const colorScheme = (() => {
        const c = String(color).toUpperCase()
        if (c === 'SUCCESS') return '8'
        if (c === 'ERROR' || c === 'DANGER') return '1'
        if (c === 'WARNING') return '6'
        if (c === 'INFO') return '4'
        if (c === 'PRIMARY') return '5'
        return ''
    })()

    return html`
        <ui5-tag
            color-scheme="${colorScheme || nothing}"
            style="${component.style ?? nothing}"
            slot="${component.slot ?? nothing}"
        >${text}</ui5-tag>`
}

// Icon → ui5-icon (SAP icons use different naming than Vaadin)
export const renderIcon = (component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as Icon
    // Vaadin uses "vaadin:icon-name" format; SAP uses just "icon-name"
    const iconName = (metadata?.icon ?? '').replace(/^vaadin:/, '').replace(/^lumo:/, '')
    return html`
        <ui5-icon
            name="${iconName || 'question-mark'}"
            style="${component.style ?? nothing}"
            class="${component.cssClasses ?? nothing}"
            slot="${component.slot ?? nothing}"
        ></ui5-icon>`
}

// Breadcrumbs → ui5-breadcrumbs
export const renderBreadcrumbs = (component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as Breadcrumbs
    const crumbs = metadata?.breadcrumbs ?? []
    const currentItemText = metadata?.currentItemText ?? ''
    return html`
        <ui5-breadcrumbs slot="${component.slot ?? nothing}">
            ${crumbs.map((crumb: Breadcrumb) => html`
                <ui5-breadcrumbs-item href="${crumb.link ?? nothing}">${crumb.text}</ui5-breadcrumbs-item>
            `)}
            ${currentItemText ? html`<ui5-breadcrumbs-item>${currentItemText}</ui5-breadcrumbs-item>` : nothing}
        </ui5-breadcrumbs>`
}

// Notification → ui5-message-strip (inline) or log to console for toast-style
export const renderNotification = (component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as Notification
    return html`
        <ui5-message-strip
            design="Information"
            style="${component.style ?? nothing}"
            slot="${component.slot ?? nothing}"
        >
            ${metadata?.title ? html`<strong>${metadata.title}: </strong>` : nothing}
            ${metadata?.text ?? ''}
        </ui5-message-strip>`
}

// ProgressBar → ui5-progress-indicator
export const renderProgressBar = (component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as any
    const value = metadata?.value ?? 0
    const displayValue = metadata?.label ?? `${value}%`
    const valueState = metadata?.valueState ?? 'None'
    return html`
        <ui5-progress-indicator
            value="${value}"
            value-state="${valueState}"
            display-value="${displayValue}"
            style="${component.style ?? nothing}"
            slot="${component.slot ?? nothing}"
        ></ui5-progress-indicator>`
}

// Details → ui5-panel (collapsible section)
export const renderDetails = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as any
    const summary = metadata?.summary ?? metadata?.label ?? ''
    const open = metadata?.open ?? false
    return html`
        <ui5-panel
            header-text="${summary}"
            ?collapsed="${!open}"
            style="${component.style ?? nothing}"
            class="${component.cssClasses ?? nothing}"
            slot="${component.slot ?? nothing}"
        >
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </ui5-panel>`
}

// Image
export const renderImage = (component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as any
    const src = metadata?.src ?? metadata?.url ?? ''
    const alt = metadata?.alt ?? ''
    return html`
        <img
            src="${src}"
            alt="${alt}"
            style="${component.style ?? nothing}"
            class="${component.cssClasses ?? nothing}"
            slot="${component.slot ?? nothing}"
        />`
}
