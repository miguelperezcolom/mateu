import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { interpolate } from "@infra/ui/interpolation.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Avatar from "@mateu/shared/apiClients/dtos/componentmetadata/Avatar";
import {html, nothing} from "lit";
import AvatarGroup from "@mateu/shared/apiClients/dtos/componentmetadata/AvatarGroup";

export const renderAvatar = (component: ClientSideComponent, state: ComponentState, data: ComponentData) => {
    const metadata = component.metadata as Avatar
    return html`<vaadin-avatar
            img="${metadata.image}"
            name="${evalIfNecessary(metadata.name, state, data)}"
            abbr="${metadata.abbreviation}"
            style="${component.style}" class="${component.cssClasses}"
            slot="${component.slot??nothing}"
    ></vaadin-avatar>`
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
    return html`<vaadin-avatar-group max-items-visible="${metadata.maxItemsVisible}"
                                     .items="${metadata.avatars}"
                                     style="${component.style}" class="${component.cssClasses}"
                                     slot="${component.slot??nothing}">
    </vaadin-avatar-group>`
}