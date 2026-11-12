import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import { html, nothing } from "lit";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { interpolate } from "@infra/ui/interpolation.ts";
import { formatShortcut } from "@infra/ui/shortcuts.ts";
import { builtInButtonLabel } from "@infra/ui/builtInButtonLabels.ts";
import { icon } from "@infra/ui/renderers/neutralIcon.ts";
import { leaveToRoute } from "@infra/ui/rowRoute.ts";
import { chromeText } from "@infra/ui/chromeTexts.ts";

export const handleButtonClick = (event: Event, button: Button) => {
    const el = event.currentTarget as HTMLElement
    // A button carrying a route NAVIGATES on the client (the button form of a menu link), rather
    // than running a server action. The template was interpolated at render (data-route); an
    // unresolved one is left off — and the button disabled — so we never navigate to a literal
    // "${state.id}" nor to "/p/" with the id missing, and never fall through to a server action
    // that has nothing behind it.
    const route = el.dataset.route
    if (route) {
        leaveToRoute(el, route)
        return
    }
    if (button.route) {
        warnUnresolvedRoute(button.route)
        return
    }
    el.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId: el.dataset.actionId,
            parameters: button.parameters
        },
        bubbles: true,
        composed: true
    }))
}

const warnedRoutes = new Set<string>()
const warnUnresolvedRoute = (template: string) => {
    if (warnedRoutes.has(template)) return
    warnedRoutes.add(template)
    console.warn(`Mateu: the button route "${template}" has a value missing in the state; the button stays disabled until it is there.`)
}

/** The button's route with `${state.x}` resolved against the page state — undefined when it has no
 * route or the template did not fully resolve: an expression that is missing, blank or fails
 * (`/p/${state.id}` with no id is NOT "/p/") — so we never navigate somewhere nobody declared. */
export const resolvedRoute = (metadata: Button, state?: ComponentState, data?: ComponentData): string | undefined => {
    if (!metadata.route) return undefined
    for (const expression of metadata.route.match(/\$\{[^}]*\}/g) ?? []) {
        const value = interpolate(expression, state, data)
        if (!value || !value.trim() || value.includes('${')) return undefined
    }
    const route = interpolate(metadata.route, state, data)
    return (!route || route.includes('${')) ? undefined : route
}

/** A routed button whose route cannot be resolved yet is drawn disabled (see resolvedRoute). */
export const routeUnresolved = (metadata: Button, state?: ComponentState, data?: ComponentData): boolean =>
    !!metadata.route && resolvedRoute(metadata, state, data) === undefined

/*
 * Design-system-neutral Button — a native <button> themed with Lumo custom-property fallbacks (no
 * `@vaadin`). The Vaadin adapter overrides Button with vaadin-button (Lumo theme attribute); the
 * Design-system renderers override it with their own button component. Icons go through the icon port.
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

/** A Button carrying `children` is a GROUP (a `ButtonGroup` in content, or a toolbar group): one
 * trigger opening its buttons. */
export const isButtonGroup = (metadata: Button | undefined): boolean =>
    (metadata?.children?.length ?? 0) > 0

/** A SPLIT button (a ButtonGroup with a primary): the button runs its own action and an adjacent
 * ▾ opens its `children`. */
export const isSplitButton = (metadata: Button | undefined): boolean =>
    !!metadata?.split && isButtonGroup(metadata)

/** What picking a member of a group's menu does: follow its route, or dispatch its action from
 * `el` — exactly what pressing it as a lone button would do. */
export const runGroupMember = (el: HTMLElement, child: Button, state?: ComponentState, data?: ComponentData) => {
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

/** Keyboard inside an open group menu: arrows move between its items, Home/End jump, Escape
 * closes it and gives the focus back to its toggle. */
export const groupMenuKeydown = (e: KeyboardEvent) => {
    const menu = e.currentTarget as HTMLElement
    const details = menu.closest('details')
    const items = [...menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])')]
    const at = items.indexOf((menu.getRootNode() as Document | ShadowRoot).activeElement as HTMLButtonElement)
    let next: number | null = null
    if (e.key === 'ArrowDown') next = at < 0 ? 0 : (at + 1) % items.length
    else if (e.key === 'ArrowUp') next = at <= 0 ? items.length - 1 : at - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = items.length - 1
    else if (e.key === 'Escape') {
        e.preventDefault()
        details?.removeAttribute('open')
        details?.querySelector<HTMLElement>('summary')?.focus()
        return
    }
    if (next !== null && items[next]) {
        e.preventDefault()
        items[next].focus()
    }
}

/** A toolbar's group (dropdown or split button) as a content component, so a header or listing
 * toolbar draws it with the renderer's own group/split control — it used to be drawn as a lone
 * button labelled like the group that ran nothing. */
export const toolbarGroupComponent = (button: Button, index: number | string): ClientSideComponent =>
    ({ type: 'ClientSide', id: (button as unknown as { id?: string }).id || `toolbar-group-${button.actionId ?? button.label ?? ''}-${index}`,
        metadata: { ...button, type: 'Button' }, children: [] }) as unknown as ClientSideComponent

/** One button of a group as a content component of its own, so it renders (and dispatches) exactly
 * like a lone button. */
export const groupMember = (group: ClientSideComponent, child: Button, index: number): ClientSideComponent =>
    ({ type: 'ClientSide', id: `${group.id}-${index}`, metadata: child, children: [] }) as unknown as ClientSideComponent

/*
 * A ButtonGroup in content, design-system neutral: a native <details> whose summary is the trigger
 * and whose panel holds the group's buttons. Picking one closes the panel.
 */
const renderButtonGroup = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData) => {
    const metadata = component.metadata as Button
    const label = interpolate(metadata.label, state, data)
    return html`<details class="mateu-button-group ${component.cssClasses ?? ''}" id="${component.id}"
            style="position:relative; display:inline-block;${component.style ?? ''}" slot="${component.slot ?? nothing}">
        <summary style="${themeStyle(metadata)} list-style:none;">${metadata.iconOnLeft ? icon(metadata.iconOnLeft) : nothing}${label}${metadata.iconOnRight ? icon(metadata.iconOnRight) : nothing}<span aria-hidden="true">▾</span></summary>
        <div class="mateu-button-group-items"
             style="position:absolute; z-index:10; display:flex; flex-direction:column; gap:.25rem; padding:.25rem; margin-top:.25rem; background:var(--lumo-base-color,#fff); border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16)); border-radius:var(--lumo-border-radius-m,6px); box-shadow:var(--lumo-box-shadow-s,0 2px 6px rgba(0,0,0,.15));"
             @click="${(e: Event) => { if ((e.target as HTMLElement).closest('button')) (e.currentTarget as HTMLElement).closest('details')?.removeAttribute('open') }}"
        >${metadata.children.map((child, i) => renderButton(groupMember(component, child, i), state, data))}</div>
    </details>`
}

/*
 * A SPLIT button, design-system neutral: the primary as an ordinary button, joined to a ▾ toggle
 * (named "More actions") that opens a menu of the other buttons. The toggle is a <details>
 * summary, so Enter/Space open it natively; the arrows move inside the menu and Escape closes it.
 */
const renderSplitButton = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData) => {
    const metadata = component.metadata as Button
    const primary = { ...component, id: `${component.id}-primary`, metadata: { ...metadata, children: [], split: false },
        style: 'border-start-end-radius:0; border-end-end-radius:0;', cssClasses: '', slot: undefined } as unknown as ClientSideComponent
    const more = chromeText('moreActions')
    return html`<span class="mateu-split-button ${component.cssClasses ?? ''}" id="${component.id}" role="group"
            style="display:inline-flex; align-items:stretch; position:relative; gap:1px;${component.style ?? ''}" slot="${component.slot ?? nothing}">
        ${renderButton(primary, state, data)}
        <details class="mateu-split-button-more" style="position:relative; display:inline-flex;"
                 @toggle="${(e: Event) => { const d = e.currentTarget as HTMLDetailsElement; if (d.open) d.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus() }}">
            <summary aria-label="${more}" title="${more}" aria-haspopup="menu"
                     style="${themeStyle({ ...metadata, children: [] } as unknown as Button)} list-style:none; padding-inline:.5rem; border-start-start-radius:0; border-end-start-radius:0; height:100%;"
            ><span aria-hidden="true">▾</span></summary>
            <div class="mateu-button-group-items" role="menu" aria-label="${more}"
                 style="position:absolute; inset-inline-end:0; top:100%; z-index:10; display:flex; flex-direction:column; gap:.25rem; padding:.25rem; margin-top:.25rem; background:var(--lumo-base-color,#fff); border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16)); border-radius:var(--lumo-border-radius-m,6px); box-shadow:var(--lumo-box-shadow-s,0 2px 6px rgba(0,0,0,.15)); min-width:max-content;"
                 @keydown="${groupMenuKeydown}"
            >${metadata.children.map((child) => html`<button role="menuitem"
                    data-action-id="${child.actionId ?? nothing}"
                    ?disabled="${child.disabled || routeUnresolved(child, state, data)}"
                    style="${themeStyle({ ...child, buttonStyle: 'tertiary' } as unknown as Button)} justify-content:flex-start;"
                    @click="${(e: Event) => { const el = e.currentTarget as HTMLElement; el.closest('details')?.removeAttribute('open'); runGroupMember(el, child, state, data) }}"
                >${child.iconOnLeft ? icon(child.iconOnLeft) : nothing}${builtInButtonLabel(child, interpolate(child.label, state, data))}</button>`)}</div>
        </details>
    </span>`
}

export const renderButton = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData): ReturnType<typeof html> => {
    const metadata = component.metadata as Button
    if (isSplitButton(metadata)) return renderSplitButton(component, state, data)
    if (isButtonGroup(metadata)) return renderButtonGroup(component, state, data)
    // a built-in archetype button whose English label came back untranslated → the UI's language
    const label = builtInButtonLabel(metadata, interpolate(metadata.label, state, data))
    const disabled = metadata.disabled || routeUnresolved(metadata, state, data)
    return html`<button
            id="${component.id}"
            data-action-id="${metadata.actionId}"
            data-route="${resolvedRoute(metadata, state, data) ?? nothing}"
            @click="${(e:any) => handleButtonClick(e, metadata)}"
            style="${themeStyle(metadata)}${component.style}"
            class="${component.cssClasses}"
            ?disabled="${disabled}"
            data-shortcut="${metadata.shortcut ?? nothing}"
            title="${metadata.shortcut ? `${label} (${formatShortcut(metadata.shortcut)})` : nothing}"
            slot="${component.slot??nothing}"
    >${metadata.iconOnLeft?icon(metadata.iconOnLeft):nothing}${label}${metadata.iconOnRight?icon(metadata.iconOnRight):nothing}</button>`
}
