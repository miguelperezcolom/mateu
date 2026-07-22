import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { evalIfNecessary } from "@infra/ui/renderers/avatarRenderer.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Avatar from "@mateu/shared/apiClients/dtos/componentmetadata/Avatar";
import { html, nothing } from "lit";
import AvatarGroup from "@mateu/shared/apiClients/dtos/componentmetadata/AvatarGroup";

/**
 * Vaadin adapter Avatar / AvatarGroup → vaadin-avatar(-group). Lives in apps/vaadin so the core stays
 * @vaadin-free; registered by VaadinComponentRenderer's override (the core renders a CSS-circle avatar).
 */
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

export const renderAvatarGroup = (component: ClientSideComponent) => {
    const metadata = component.metadata as AvatarGroup
    return html`<vaadin-avatar-group max-items-visible="${metadata.maxItemsVisible}"
                                     .items="${metadata.avatars}"
                                     style="${component.style}" class="${component.cssClasses}"
                                     slot="${component.slot??nothing}">
    </vaadin-avatar-group>`
}
