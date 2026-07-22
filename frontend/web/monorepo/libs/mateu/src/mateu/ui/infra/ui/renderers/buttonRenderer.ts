import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import { html, nothing } from "lit";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { interpolate } from "@infra/ui/interpolation.ts";
import { formatShortcut } from "@infra/ui/shortcuts.ts";
import { icon } from "@infra/ui/renderers/neutralIcon.ts";

export const handleButtonClick = (event: Event, button: Button) => {
    const actionId = (event.currentTarget as HTMLElement).dataset.actionId
    event.currentTarget?.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId,
            parameters: button.parameters
        },
        bubbles: true,
        composed: true
    }))
}

/*
 * Design-system-neutral Button — a native <button> themed with Lumo custom-property fallbacks (no
 * `@vaadin`). The Vaadin adapter overrides Button with vaadin-button (Lumo theme attribute); the
 * SapUi5/Redwood renderers override it with their own button component. Icons go through the icon port.
 */
const BASE = 'display:inline-flex; align-items:center; justify-content:center; gap:.4em; box-sizing:border-box; font:inherit; font-weight:500; cursor:pointer; border-radius:var(--lumo-border-radius-m,6px); border:1px solid transparent; line-height:1; white-space:nowrap;'

const themeStyle = (metadata: Button): string => {
    const style = (metadata.buttonStyle ?? '') as string
    const color = (metadata.color && metadata.color !== 'none' && metadata.color !== 'normal' ? metadata.color : '') as string
    const size = metadata.size as string | undefined
    // Accent color per semantic color (defaults to the Lumo primary accent).
    const accentBg = color === 'success' ? 'var(--lumo-success-color,#1a7f37)'
        : color === 'error' ? 'var(--lumo-error-color,#c5221f)'
        : color === 'contrast' ? 'var(--lumo-contrast,#161513)'
        : 'var(--lumo-primary-color,#3b5bdb)'
    const accentText = color === 'success' ? 'var(--lumo-success-contrast-color,#fff)'
        : color === 'error' ? 'var(--lumo-error-contrast-color,#fff)'
        : color === 'contrast' ? 'var(--lumo-base-color,#fff)'
        : 'var(--lumo-primary-contrast-color,#fff)'
    const accentFg = color === 'success' ? 'var(--lumo-success-text-color,#1a7f37)'
        : color === 'error' ? 'var(--lumo-error-text-color,#c5221f)'
        : color === 'contrast' ? 'var(--lumo-body-text-color,#161513)'
        : 'var(--lumo-primary-text-color,#3b5bdb)'
    let variant: string
    if (style === 'primary') {
        variant = `background:${accentBg}; color:${accentText};`
    } else if (style === 'tertiary' || style === 'tertiaryInline') {
        variant = `background:transparent; color:${accentFg};`
    } else {
        // secondary / default: outlined
        variant = `background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:${accentFg}; border-color:var(--lumo-contrast-20pct,rgba(0,0,0,.16));`
    }
    const pad = size === 'small' ? 'padding:.25rem .6rem; font-size:var(--lumo-font-size-s,.875rem);'
        : size === 'large' ? 'padding:.65rem 1.4rem; font-size:var(--lumo-font-size-l,1.125rem);'
        : 'padding:.45rem 1rem; font-size:var(--lumo-font-size-m,1rem);'
    return `${BASE}${variant}${pad}`
}

export const renderButton = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData) => {
    const metadata = component.metadata as Button
    const label = interpolate(metadata.label, state, data)
    return html`<button
            id="${component.id}"
            data-action-id="${metadata.actionId}"
            @click="${(e:any) => handleButtonClick(e, metadata)}"
            style="${themeStyle(metadata)}${component.style}"
            class="${component.cssClasses}"
            ?disabled="${metadata.disabled}"
            title="${metadata.shortcut ? `${label} (${formatShortcut(metadata.shortcut)})` : nothing}"
            slot="${component.slot??nothing}"
    >${metadata.iconOnLeft?icon(metadata.iconOnLeft):nothing}${label}${metadata.iconOnRight?icon(metadata.iconOnRight):nothing}</button>`
}
