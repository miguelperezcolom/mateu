import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import { html, nothing } from "lit";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { interpolate } from "@infra/ui/interpolation.ts";
import { formatShortcut } from "@infra/ui/shortcuts.ts";
import { builtInButtonLabel } from "@infra/ui/builtInButtonLabels.ts";
import { handleButtonClick, isButtonGroup, isSplitButton, resolvedRoute, routeUnresolved, runGroupMember } from "@infra/ui/renderers/buttonRenderer.ts";
import { leaveToRoute } from "@infra/ui/rowRoute.ts";
import { chromeText } from "@infra/ui/chromeTexts.ts";
import "@vaadin/menu-bar";
import "@vaadin/tooltip";
import "@vaadin/icon";
import "@vaadin/icons";

/**
 * Vaadin adapter Button → vaadin-button (Lumo theme attribute + vaadin-icon). Lives in apps/vaadin so the
 * core stays @vaadin-free; registered by VaadinComponentRenderer (the core renders a native <button>).
 */
/**
 * A ButtonGroup in content (a Button with `children` on the wire) → a vaadin-menu-bar with one
 * root item opening the group's buttons; picking one dispatches its action (or follows its route)
 * from the menu bar, exactly like a lone button.
 */
const renderButtonGroup = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData) => {
    const metadata = component.metadata as Button
    const label = builtInButtonLabel(metadata, interpolate(metadata.label, state, data))
    const items = [{
        text: label,
        children: metadata.children.map(child => ({
            text: builtInButtonLabel(child, interpolate(child.label, state, data)),
            disabled: child.disabled || routeUnresolved(child, state, data),
            button: child,
        })),
    }]
    const selected = (e: CustomEvent) => {
        const child = (e.detail as { value: { button?: Button } }).value?.button
        if (!child) return
        const el = e.currentTarget as HTMLElement
        const route = resolvedRoute(child, state, data)
        if (route) {
            leaveToRoute(el, route)
            return
        }
        if (child.route) return
        el.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: child.actionId, parameters: child.parameters },
            bubbles: true,
            composed: true,
        }))
    }
    return html`<vaadin-menu-bar
            id="${component.id}"
            class="mateu-button-group ${component.cssClasses ?? ''}"
            style="${component.style ?? nothing}"
            theme="${[metadata.buttonStyle, 'dropdown-indicators'].filter(Boolean).join(' ')}"
            slot="${component.slot ?? nothing}"
            .items=${items}
            @item-selected=${selected}
    ></vaadin-menu-bar>`
}

/** The theme of a vaadin-button / menu bar from a Mateu button's style, colour and size. */
export const vaadinButtonTheme = (metadata: Button): string => {
    let theme = ''
    if (metadata.buttonStyle) theme += ' ' + metadata.buttonStyle
    if (metadata.color && metadata.color !== 'none' && metadata.color !== 'normal') theme += ' ' + metadata.color
    if (metadata.size && metadata.size !== 'none' && metadata.size !== 'normal') theme += ' ' + metadata.size
    return theme.trim()
}

/** The ▾ of a split button: an icon plus its name for assistive technology ("More actions"). */
const splitArrow = (label: string): HTMLElement => {
    const item = document.createElement('vaadin-menu-bar-item')
    const icon = document.createElement('vaadin-icon')
    icon.setAttribute('icon', 'vaadin:chevron-down-small')
    icon.setAttribute('aria-hidden', 'true')
    const name = document.createElement('span')
    name.textContent = label
    name.setAttribute('style', 'position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap;')
    item.append(icon, name)
    return item
}

/**
 * A SPLIT button (a ButtonGroup with a primary) → ONE vaadin-menu-bar with two root items: the
 * primary, which runs its own action, and a ▾ (named "More actions", with a tooltip) whose submenu
 * holds the other buttons. The menu bar gives both parts one look and the keyboard model Vaadin
 * documents for it: Tab reaches the bar, ←/→ move between the two parts, Enter/Space/↓ open the
 * menu, Escape closes it.
 */
const renderSplitButton = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData) => {
    const metadata = component.metadata as Button
    const label = builtInButtonLabel(metadata, interpolate(metadata.label, state, data))
    const more = chromeText('moreActions')
    const items = [
        {
            text: label,
            disabled: metadata.disabled || routeUnresolved(metadata, state, data),
            className: 'mateu-split-primary',
            button: { ...metadata, children: [], split: false },
        },
        {
            component: splitArrow(more),
            tooltip: more,
            // square, like an icon button, in the bar's own look
            theme: [...vaadinButtonTheme(metadata).split(' ').filter(Boolean), 'icon'],
            className: 'mateu-split-more',
            children: metadata.children.map(child => ({
                text: builtInButtonLabel(child, interpolate(child.label, state, data)),
                disabled: child.disabled || routeUnresolved(child, state, data),
                button: child,
            })),
        },
    ]
    const selected = (e: CustomEvent) => {
        const button = (e.detail as { value: { button?: Button } }).value?.button
        if (button) runGroupMember(e.currentTarget as HTMLElement, button, state, data)
    }
    return html`<vaadin-menu-bar
            id="${component.id}"
            class="mateu-split-button ${component.cssClasses ?? ''}"
            style="${component.style ?? nothing}"
            theme="${vaadinButtonTheme(metadata) || nothing}"
            slot="${component.slot ?? nothing}"
            data-action-id="${metadata.actionId ?? nothing}"
            .items=${items}
            @item-selected=${selected}
    ><vaadin-tooltip slot="tooltip"></vaadin-tooltip></vaadin-menu-bar>`
}

export const renderButton = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData): ReturnType<typeof html> => {
    const metadata = component.metadata as Button
    if (isSplitButton(metadata)) return renderSplitButton(component, state, data)
    if (isButtonGroup(metadata)) return renderButtonGroup(component, state, data)
    // a built-in archetype button whose English label came back untranslated → the UI's language
    const label = builtInButtonLabel(metadata, interpolate(metadata.label, state, data))
    let theme = '';
    if (metadata.buttonStyle) {
        theme += ' ' + metadata.buttonStyle
    }
    if (metadata.color && metadata.color !== 'none' && metadata.color !== 'normal') {
        theme += ' ' + metadata.color
    }
    if (metadata.size && metadata.size !== 'none' && metadata.size !== 'normal') {
        theme += ' ' + metadata.size
    }
    return html`<vaadin-button
            id="${component.id}"
            data-action-id="${metadata.actionId}"
            data-route="${resolvedRoute(metadata, state, data) ?? nothing}"
            @click="${(e:any) => handleButtonClick(e, metadata)}"
            style="${component.style}"
            class="${component.cssClasses}"
            theme="${theme}"
            ?disabled="${metadata.disabled || routeUnresolved(metadata, state, data)}"
            data-shortcut="${metadata.shortcut ?? nothing}"
            title="${metadata.shortcut ? `${label} (${formatShortcut(metadata.shortcut)})` : nothing}"
            slot="${component.slot??nothing}"
    >${metadata.iconOnLeft?html`<vaadin-icon icon="${metadata.iconOnLeft}"></vaadin-icon>`:nothing}${label}${metadata.iconOnRight?html`<vaadin-icon icon="${metadata.iconOnRight}"></vaadin-icon>`:nothing}</vaadin-button>`
}
