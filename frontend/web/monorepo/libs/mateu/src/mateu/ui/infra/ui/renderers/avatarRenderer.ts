import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Avatar from "@mateu/shared/apiClients/dtos/componentmetadata/Avatar";
import { html, nothing } from "lit";
import AvatarGroup from "@mateu/shared/apiClients/dtos/componentmetadata/AvatarGroup";

export const renderAvatar = (component: ClientSideComponent, state: any, data: any) => {
    const metadata = component.metadata as Avatar
    return html`<vaadin-avatar
            img="${metadata.image}"
            name="${evalIfNecessary(metadata.name, state, data)}"
            abbr="${metadata.abbreviation}"
            style="${component.style}" class="${component.cssClasses}"
            slot="${component.slot??nothing}"
    ></vaadin-avatar>`
}

export const evalIfNecessary = (value: string, _state: any, _data: any) => {
    if (value && value.includes && value.includes('${')) {
        // @ts-ignore
        const state = _state
        // @ts-ignore
        const data = _data
        try {
            return eval('`' + value + '`')
        } catch (e) {
            console.error('Error evaluating template string:', e, value, state, data)
            return value
        }
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