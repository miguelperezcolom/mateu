import { html, LitElement, nothing, TemplateResult } from "lit"
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts"
import Icon from "@mateu/shared/apiClients/dtos/componentmetadata/Icon.ts"
import Breadcrumbs, { Breadcrumb } from "@mateu/shared/apiClients/dtos/componentmetadata/Breadcrumbs.ts"
import Notification from "@mateu/shared/apiClients/dtos/componentmetadata/Notification.ts"
import ProgressBar from "@mateu/shared/apiClients/dtos/componentmetadata/ProgressBar.ts"
import Details from "@mateu/shared/apiClients/dtos/componentmetadata/Details.ts"
import Avatar from "@mateu/shared/apiClients/dtos/componentmetadata/Avatar.ts"
import AvatarGroup from "@mateu/shared/apiClients/dtos/componentmetadata/AvatarGroup.ts"
import Tooltip from "@mateu/shared/apiClients/dtos/componentmetadata/Tooltip.ts"
import Popover from "@mateu/shared/apiClients/dtos/componentmetadata/Popover.ts"
import MenuBar from "@mateu/shared/apiClients/dtos/componentmetadata/MenuBar.ts"
import ContextMenu from "@mateu/shared/apiClients/dtos/componentmetadata/ContextMenu.ts"
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts"
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts"
import { evalIfNecessary } from "@infra/ui/renderers/avatarRenderer.ts"

// ─────────────────────────────────────────────────────────────────────────────
// Display/media components for the Redwood (Oracle JET) renderer.
// Native oj-c-* components are used where their AMD module is loaded and the API is
// attribute/property-driven (avatar, badge, progress-bar, buttons); everything else is
// plain markup styled with Redwood typography classes and --oj-* CSS variables, which
// keeps rendering deterministic under JET's async AMD bootstrap and its CSP expression
// evaluator (no `String()` etc. in OJ expressions — see feedback_ojet_csp).
// ─────────────────────────────────────────────────────────────────────────────

const SECONDARY = 'var(--oj-core-text-color-secondary, #666)'
const DIVIDER = 'var(--oj-core-divider-color, #e0e0e0)'
const BG = 'var(--oj-core-bg-color-content, #fff)'
const RADIUS = 'var(--oj-core-border-radius-md, 6px)'

// Icon ids arrive as "vaadin:name"/"lumo:name"; the Oracle UX icon font (ojuxIconFont,
// loaded in index.html) exposes icons as `oj-ux-ico-<name>` CSS classes. Many common names
// (plus, search, edit, trash, user, home, …) map 1:1 once the collection prefix is stripped.
export const uxIconClass = (icon: string | undefined): string =>
    'oj-ux-ico-' + (icon ?? '').replace(/^vaadin:/, '').replace(/^lumo:/, '')

export const renderIcon = (component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as Icon
    return html`<span class="${uxIconClass(metadata?.icon)} ${component.cssClasses ?? ''}"
                      style="font-size: 1.25rem; ${component.style ?? ''}"
                      slot="${component.slot ?? nothing}"
                      aria-label="${metadata?.icon ?? nothing}"></span>`
}

export const renderBreadcrumbs = (component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as Breadcrumbs
    const crumbs = metadata?.breadcrumbs ?? []
    return html`
        <nav aria-label="Breadcrumb"
             style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            ${crumbs.map((crumb: Breadcrumb, i: number) => html`
                ${i > 0 ? html`<span style="color: ${SECONDARY};">/</span>` : nothing}
                ${crumb.link
                    ? html`<a class="oj-link-standalone" href="${crumb.link}">${crumb.text}</a>`
                    : html`<span>${crumb.text}</span>`}
            `)}
            ${metadata?.currentItemText ? html`
                ${crumbs.length > 0 ? html`<span style="color: ${SECONDARY};">/</span>` : nothing}
                <span style="color: ${SECONDARY};">${metadata.currentItemText}</span>
            ` : nothing}
        </nav>`
}

// Inline informational banner (same decision as the sapui5 renderer: the reference toast
// carries title + text only, an inline Redwood banner is the closest native equivalent).
export const renderNotification = (component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as Notification
    return html`
        <div role="status"
             style="display: flex; gap: 0.5rem; align-items: baseline; padding: 0.75rem 1rem; border: 1px solid ${DIVIDER}; border-left: 4px solid var(--oj-core-info-color, #0572ce); border-radius: ${RADIUS}; background: ${BG}; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            ${metadata?.title ? html`<span class="oj-typography-body-md oj-typography-bold">${metadata.title}</span>` : nothing}
            <span class="oj-typography-body-md">${metadata?.text ?? ''}</span>
        </div>`
}

export const renderProgressBar = (component: ClientSideComponent, state: Record<string, unknown> = {}): TemplateResult => {
    const metadata = component.metadata as ProgressBar
    const value = metadata.valueKey ? state[metadata.valueKey] as number : metadata.value
    return html`
        <div style="${component.style ?? ''}" class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            <oj-c-progress-bar
                data-oj-binding-provider="preact"
                value="${metadata.indeterminate ? -1 : (value ?? 0)}"
                max="${metadata.max && metadata.max != 0 ? metadata.max : 100}"
                style="width: 100%;"
            ></oj-c-progress-bar>
            ${metadata.text ? html`<div style="font-size: 0.75rem; color: ${SECONDARY}; margin-top: 2px;">${metadata.text}</div>` : nothing}
        </div>`
}

// Native <details> styled as a Redwood panel: deterministic under JET's async bootstrap
// (oj-c-collapsible would need one more AMD module plus slotted-content lifecycle care).
export const renderDetails = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as Details
    return html`
        <details ?open="${metadata.opened}"
                 class="oj-panel ${component.cssClasses ?? ''}"
                 style="padding: 0.75rem 1rem; border-radius: var(--oj-core-border-radius-lg, 8px); ${component.style ?? ''}"
                 slot="${component.slot ?? nothing}">
            <summary class="oj-typography-subheading-sm" style="cursor: pointer;">
                ${renderComponent(container, metadata.summary, baseUrl, state, data, appState, appData)}
            </summary>
            <div style="padding-top: 0.5rem;">
                ${renderComponent(container, metadata.content, baseUrl, state, data, appState, appData)}
                ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
            </div>
        </details>`
}

const initialsOf = (avatar: { abbreviation?: string, name?: string }): string =>
    avatar.abbreviation || (avatar.name ? avatar.name.split(/\s+/).map(s => s[0]).slice(0, 2).join('') : '')

export const renderAvatar = (component: ClientSideComponent, state: any, data: any): TemplateResult => {
    const metadata = component.metadata as Avatar
    return html`<oj-c-avatar
            data-oj-binding-provider="preact"
            initials="${initialsOf(metadata) || nothing}"
            src="${metadata.image ?? nothing}"
            role="img"
            aria-label="${evalIfNecessary(metadata.name, state, data) ?? nothing}"
            title="${evalIfNecessary(metadata.name, state, data) ?? nothing}"
            style="${component.style ?? nothing}" class="${component.cssClasses ?? nothing}"
            slot="${component.slot ?? nothing}"
    ></oj-c-avatar>`
}

export const renderAvatarGroup = (component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as AvatarGroup
    const avatars = metadata.avatars ?? []
    const max = metadata.maxItemsVisible || avatars.length
    const visible = avatars.slice(0, max)
    const hidden = avatars.length - visible.length
    return html`
        <div style="display: flex; align-items: center; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            ${visible.map((avatar, i) => html`
                <oj-c-avatar
                    data-oj-binding-provider="preact"
                    size="sm"
                    initials="${initialsOf(avatar) || nothing}"
                    src="${avatar.image ?? nothing}"
                    title="${avatar.name ?? nothing}"
                    style="${i > 0 ? 'margin-left: -0.5rem;' : ''} border: 2px solid ${BG}; border-radius: 50%;"
                ></oj-c-avatar>
            `)}
            ${hidden > 0 ? html`<span style="margin-left: 0.4rem; font-size: 0.8125rem; color: ${SECONDARY};">+${hidden}</span>` : nothing}
        </div>`
}

export const renderTooltip = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as Tooltip
    return html`
        <span title="${metadata.text ?? ''}" style="${component.style ?? nothing}"
              class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            ${metadata.wrapped ? renderComponent(container, metadata.wrapped, baseUrl, state, data, appState, appData) : nothing}
        </span>`
}

// Shared toggle for the popover/context-menu panels below: pure DOM, works in the light DOM
// this renderer uses (componentRenderer.setUseShadowRoot(false)).
const togglePanel = (trigger: EventTarget | null) => {
    const wrap = (trigger as HTMLElement | null)?.closest('.rw-pop-wrap')
    const panel = wrap?.querySelector(':scope > .rw-pop-panel') as HTMLElement | null
    if (panel) panel.hidden = !panel.hidden
}

const panelStyle = `position: absolute; top: 100%; left: 0; margin-top: 4px; z-index: 1000; background: ${BG}; border: 1px solid ${DIVIDER}; border-radius: ${RADIUS}; box-shadow: 0 4px 12px rgba(0,0,0,.15); min-width: 10rem;`

export const renderPopover = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as Popover
    return html`
        <span class="rw-pop-wrap ${component.cssClasses ?? ''}"
              style="position: relative; display: inline-block; ${component.style ?? ''}"
              slot="${component.slot ?? nothing}">
            <span style="cursor: pointer;" @click="${(e: Event) => togglePanel(e.currentTarget)}">
                ${metadata.wrapped ? renderComponent(container, metadata.wrapped, baseUrl, state, data, appState, appData) : nothing}
            </span>
            <div class="rw-pop-panel" hidden style="${panelStyle} padding: 0.75rem;">
                ${metadata.content ? renderComponent(container, metadata.content, baseUrl, state, data, appState, appData) : nothing}
            </div>
        </span>`
}

const navigate = (target: EventTarget | null, path: string | undefined) => {
    if (!path) return
    target?.dispatchEvent(new CustomEvent('update-route', {
        detail: { route: path },
        bubbles: true,
        composed: true
    }))
}

export const renderMenuBar = (host: LitElement, component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as MenuBar
    const options: MenuOption[] = metadata.options ?? []
    const renderOption = (option: MenuOption): TemplateResult => {
        if (option.submenus && option.submenus.length > 0) {
            const items = option.submenus.map(sub => ({
                key: sub.path ?? sub.label,
                label: sub.label,
                disabled: sub.disabled ?? false
            }))
            return html`
                <oj-c-menu-button
                    data-oj-binding-provider="preact"
                    label="${option.label}"
                    chroming="borderless"
                    .items="${items}"
                    @ojMenuAction="${(e: CustomEvent) => navigate(host, e.detail.key)}"
                ></oj-c-menu-button>`
        }
        return html`
            <oj-c-button
                data-oj-binding-provider="preact"
                label="${option.label}"
                chroming="borderless"
                ?disabled="${option.disabled}"
                @ojAction="${(e: Event) => navigate(e.target, option.path)}"
            ></oj-c-button>`
    }
    return html`
        <div style="display: flex; flex-direction: row; gap: 0.25rem; align-items: center; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            ${options.map(renderOption)}
        </div>`
}

export const renderContextMenu = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as ContextMenu

    const open = (e: Event) => {
        e.preventDefault()
        togglePanel(e.currentTarget)
    }
    const pick = (e: Event, option: MenuOption) => {
        togglePanel(e.currentTarget)
        navigate(e.target, option.path)
    }
    const renderItems = (options: MenuOption[], depth = 0): TemplateResult => html`
        ${options.map(option => option.separator
            ? html`<div style="border-top: 1px solid ${DIVIDER}; margin: 0.25rem 0;"></div>`
            : html`
                <div role="menuitem"
                     style="padding: 0.4rem 1rem 0.4rem ${1 + depth * 1.25}rem; cursor: ${option.disabled ? 'default' : 'pointer'}; ${option.disabled ? `color: ${SECONDARY}; opacity: 0.6;` : ''} white-space: nowrap;"
                     @click="${option.disabled ? nothing : (e: Event) => pick(e, option)}">
                    ${option.icon ? html`<span class="${uxIconClass(option.icon)}" style="margin-right: 0.4rem;"></span>` : nothing}
                    ${option.label}
                </div>
                ${option.submenus ? renderItems(option.submenus, depth + 1) : nothing}`)}
    `
    return html`
        <span class="rw-pop-wrap ${component.cssClasses ?? ''}"
              style="position: relative; display: inline-block; ${component.style ?? ''}"
              slot="${component.slot ?? nothing}"
              @contextmenu="${metadata.activateOnLeftClick ? nothing : open}"
              @click="${metadata.activateOnLeftClick ? open : nothing}">
            ${renderComponent(container, metadata.wrapped, baseUrl, state, data, appState, appData)}
            <div class="rw-pop-panel" hidden role="menu" style="${panelStyle} padding: 0.25rem 0;">
                ${renderItems(metadata.menu ?? [])}
            </div>
        </span>`
}
