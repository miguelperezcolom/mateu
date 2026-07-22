import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { interpolate } from "@infra/ui/interpolation.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Avatar from "@mateu/shared/apiClients/dtos/componentmetadata/Avatar";
import { html, nothing } from "lit";
import AvatarGroup from "@mateu/shared/apiClients/dtos/componentmetadata/AvatarGroup";

/*
 * Design-system-neutral Avatar — a CSS circle with an image or initials (no `@vaadin`). The Vaadin
 * adapter overrides Avatar / AvatarGroup with vaadin-avatar(-group).
 */
const CIRCLE = 'display:inline-flex; align-items:center; justify-content:center; width:2rem; height:2rem; border-radius:50%; background:var(--lumo-contrast-10pct,#e0e0e0); color:var(--lumo-secondary-text-color,#555); font-size:.8rem; font-weight:600; overflow:hidden; flex:none;'

const abbrOf = (name: string, abbr?: string): string =>
    abbr || (typeof name === 'string' && name ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() : '')

export const renderAvatar = (component: ClientSideComponent, state: ComponentState, data: ComponentData) => {
    const metadata = component.metadata as Avatar
    const name = evalIfNecessary(metadata.name, state, data) as string
    return html`<span style="${CIRCLE}${component.style}" class="${component.cssClasses}"
                      title="${name || nothing}" slot="${component.slot??nothing}">
        ${metadata.image
            ? html`<img src="${metadata.image}" alt="${name}" style="width:100%;height:100%;object-fit:cover;">`
            : abbrOf(name, metadata.abbreviation)}
    </span>`
}

// value is declared as string but callers also pass booleans/numbers/objects,
// which pass through untouched — hence the historical `any` return type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const evalIfNecessary = (value: string, state: ComponentState, data: ComponentData): any => {
    if (typeof value === 'string' && value.includes('${')) {
        return interpolate(value, state, data)
    }
    return value
}

export const renderAvatarGroup = (component: ClientSideComponent) => {
    const metadata = component.metadata as AvatarGroup
    const items = (metadata.avatars ?? []) as Array<{ img?: string; name?: string; abbr?: string }>
    const max = metadata.maxItemsVisible && metadata.maxItemsVisible > 0 ? metadata.maxItemsVisible : items.length
    const shown = items.slice(0, max)
    const overflow = items.length - shown.length
    const ring = 'margin-left:-0.4rem; border:2px solid var(--lumo-base-color,#fff);'
    return html`<span style="display:inline-flex; ${component.style}" class="${component.cssClasses}" slot="${component.slot??nothing}">
        ${shown.map(a => html`<span style="${CIRCLE}${ring}" title="${a.name || nothing}">
            ${a.img ? html`<img src="${a.img}" style="width:100%;height:100%;object-fit:cover;">` : abbrOf(a.name ?? '', a.abbr)}
        </span>`)}
        ${overflow > 0 ? html`<span style="${CIRCLE}${ring}">+${overflow}</span>` : nothing}
    </span>`
}
