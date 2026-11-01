import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { interpolateFields } from "@infra/ui/interpolation.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Avatar from "@mateu/shared/apiClients/dtos/componentmetadata/Avatar";
import { html, nothing } from "lit";
import AvatarGroup from "@mateu/shared/apiClients/dtos/componentmetadata/AvatarGroup";

/**
 * Vaadin adapter Avatar / AvatarGroup → vaadin-avatar(-group). Lives in apps/vaadin so the core stays
 * @vaadin-free; registered by VaadinComponentRenderer's override (the core renders a CSS-circle avatar).
 */
export const renderAvatar = (component: ClientSideComponent, state: ComponentState, data: ComponentData) => {
    // the image too: `image: ${state.thumbnail}` was requested literally (a 404)
    const metadata = interpolateFields(component.metadata as Avatar, ['name', 'image', 'abbreviation'], state, data)
    return html`<vaadin-avatar
            img="${metadata.image}"
            name="${metadata.name}"
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
