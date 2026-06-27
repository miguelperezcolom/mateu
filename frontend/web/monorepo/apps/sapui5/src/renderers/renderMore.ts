import { html, LitElement, nothing, TemplateResult } from "lit"
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts"
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts"

// ── Avatar → ui5-avatar ────────────────────────────────────────────────────────

export const renderAvatar = (component: ClientSideComponent): TemplateResult => {
    const md = component.metadata as any
    const initials = md.abbreviation || (md.name ? md.name.split(/\s+/).map((s: string) => s[0]).slice(0, 2).join('') : '')
    return html`
        <ui5-avatar slot="${component.slot ?? nothing}"
                    initials="${initials || nothing}"
                    accessible-name="${md.name ?? nothing}">
            ${md.image ? html`<img src="${md.image}" />` : nothing}
        </ui5-avatar>`
}

// ── AvatarGroup → ui5-avatar-group ──────────────────────────────────────────────

export const renderAvatarGroup = (component: ClientSideComponent): TemplateResult => {
    const md = component.metadata as any
    const avatars: any[] = md.avatars ?? []
    return html`
        <ui5-avatar-group type="Group" slot="${component.slot ?? nothing}">
            ${avatars.map(a => {
                const initials = a.abbreviation || (a.name ? a.name.split(/\s+/).map((s: string) => s[0]).slice(0, 2).join('') : '')
                return html`<ui5-avatar initials="${initials || nothing}" accessible-name="${a.name ?? nothing}">
                    ${a.image ? html`<img src="${a.image}" />` : nothing}
                </ui5-avatar>`
            })}
        </ui5-avatar-group>`
}

// ── Tooltip → wrap with a native title ─────────────────────────────────────────

export const renderTooltip = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    return html`
        <span title="${md.text ?? ''}" slot="${component.slot ?? nothing}">
            ${md.wrapped ? renderComponent(container, md.wrapped, baseUrl, state, data, appState, appData) : nothing}
        </span>`
}

// ── CarouselLayout → ui5-carousel ───────────────────────────────────────────────

export const renderCarouselLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    return html`
        <ui5-carousel
                ?cyclic="${md.auto ?? false}"
                arrows-placement="${md.alt ? 'Navigation' : nothing}"
                style="${component.style ?? ''}"
                class="${component.cssClasses ?? nothing}"
                slot="${component.slot ?? nothing}">
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </ui5-carousel>`
}

// ── Popover → ui5-popover with an opener ────────────────────────────────────────

export const renderPopover = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const openerId = `pop-opener-${component.id}`
    const open = (e: Event) => {
        const root = (e.target as HTMLElement).getRootNode() as ParentNode
        const pop = root.querySelector(`#pop-${component.id}`) as any
        if (pop) { pop.opener = openerId; pop.open = true }
    }
    return html`
        <span slot="${component.slot ?? nothing}">
            <span id="${openerId}" @click="${open}" style="cursor:pointer;">
                ${md.wrapped ? renderComponent(container, md.wrapped, baseUrl, state, data, appState, appData) : nothing}
            </span>
            <ui5-popover id="pop-${component.id}">
                <div style="padding:.5rem;">
                    ${md.content ? renderComponent(container, md.content, baseUrl, state, data, appState, appData) : nothing}
                </div>
            </ui5-popover>
        </span>`
}

// ── MenuBar → row of ui5-buttons that navigate (update-route) ───────────────────

export const renderMenuBar = (host: LitElement, component: ClientSideComponent): TemplateResult => {
    const md = component.metadata as any
    const options: any[] = md.options ?? []
    const navigate = (path: string | undefined) => {
        if (!path) return
        host.dispatchEvent(new CustomEvent('update-route', { detail: { route: path }, bubbles: true, composed: true }))
    }
    const renderOption = (opt: any): TemplateResult => {
        if (opt.submenus && opt.submenus.length > 0) {
            const menuId = `menu-${component.id}-${opt.label}`
            const openMenu = (e: Event) => {
                const root = (e.target as HTMLElement).getRootNode() as ParentNode
                const menu = root.querySelector(`#${CSS.escape(menuId)}`) as any
                if (menu) { menu.opener = e.target as HTMLElement; menu.open = true }
            }
            return html`
                <ui5-button design="Transparent" icon="${opt.icon || nothing}" @click="${openMenu}">${opt.label}</ui5-button>
                <ui5-menu id="${menuId}">
                    ${opt.submenus.map((sub: any) => html`
                        <ui5-menu-item text="${sub.label}" icon="${sub.icon || nothing}"
                                       @click="${() => navigate(sub.path)}"></ui5-menu-item>`)}
                </ui5-menu>`
        }
        return html`<ui5-button design="Transparent" icon="${opt.icon || nothing}" @click="${() => navigate(opt.path)}">${opt.label}</ui5-button>`
    }
    return html`
        <div style="display:flex; flex-direction:row; gap:.25rem; align-items:center;"
             slot="${component.slot ?? nothing}">
            ${options.map(renderOption)}
        </div>`
}
