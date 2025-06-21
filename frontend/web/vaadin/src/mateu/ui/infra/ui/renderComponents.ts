import Component from "@mateu/shared/apiClients/dtos/Component";
import { html } from "lit";
import Text from "@mateu/shared/apiClients/dtos/componentmetadata/Text";
import { TextContainer } from "@mateu/shared/apiClients/dtos/componentmetadata/TextContainer";
import Avatar from "@mateu/shared/apiClients/dtos/componentmetadata/Avatar";
import AvatarGroup from "@mateu/shared/apiClients/dtos/componentmetadata/AvatarGroup";

export const renderAvatar = (component: Component) => {
    const metadata = component.metadata as Avatar
    return html`<vaadin-avatar
            img="${metadata.image}"
            name="${metadata.name}"
            abbr="${metadata.abbreviation}"
    ></vaadin-avatar>`
}

export const renderAvatarGroup = (component: Component) => {
    const metadata = component.metadata as AvatarGroup
    return html`<vaadin-avatar-group max-items-visible="${metadata.maxItemsVisible}"
                                     .items="${metadata.avatars}">
    </vaadin-avatar-group>`
}

export const renderText = (component: Component) => {
    const metadata = component.metadata as Text
    if (TextContainer.h1 == metadata.container) {
        return html`
            <h1>
                ${metadata.text}
            </h1>
        `
    }
    if (TextContainer.h2 == metadata.container) {
        return html`
            <h2>
                ${metadata.text}
            </h2>
        `
    }
    if (TextContainer.h3 == metadata.container) {
        return html`
            <h3>
                ${metadata.text}
            </h3>
        `
    }
    if (TextContainer.h4 == metadata.container) {
        return html`
            <h4>
                ${metadata.text}
            </h4>
        `
    }
    if (TextContainer.h5 == metadata.container) {
        return html`
            <h5>
                ${metadata.text}
            </h5>
        `
    }
    if (TextContainer.h6 == metadata.container) {
        return html`
            <h6>
                ${metadata.text}
            </h6>
        `
    }
    if (TextContainer.p == metadata.container) {
        return html`
               <p>
                   ${metadata.text}
               </p>
            `
    }

    return html`
               <p>
                   Unknown text container: ${metadata.container} 
               </p>
            `
}