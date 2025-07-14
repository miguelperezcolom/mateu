import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Avatar from "@mateu/shared/apiClients/dtos/componentmetadata/Avatar";
import { html } from "lit";
import AvatarGroup from "@mateu/shared/apiClients/dtos/componentmetadata/AvatarGroup";

export const renderAvatar = (component: ClientSideComponent) => {
    const metadata = component.metadata as Avatar
    return html`<vaadin-avatar
            img="${metadata.image}"
            name="${metadata.name}"
            abbr="${metadata.abbreviation}"
            style="${component.style}" class="${component.cssClasses}"
    ></vaadin-avatar>`
}

export const renderAvatarGroup = (component: ClientSideComponent) => {
    const metadata = component.metadata as AvatarGroup
    return html`<vaadin-avatar-group max-items-visible="${metadata.maxItemsVisible}"
                                     .items="${metadata.avatars}"
                                     style="${component.style}" class="${component.cssClasses}">
    </vaadin-avatar-group>`
}