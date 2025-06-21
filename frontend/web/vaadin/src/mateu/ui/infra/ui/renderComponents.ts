import Component from "@mateu/shared/apiClients/dtos/Component";
import { html, nothing } from "lit";
import Text from "@mateu/shared/apiClients/dtos/componentmetadata/Text";
import { TextContainer } from "@mateu/shared/apiClients/dtos/componentmetadata/TextContainer";
import Avatar from "@mateu/shared/apiClients/dtos/componentmetadata/Avatar";
import AvatarGroup from "@mateu/shared/apiClients/dtos/componentmetadata/AvatarGroup";
import Badge from "@mateu/shared/apiClients/dtos/componentmetadata/Badge";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import Anchor from "@mateu/shared/apiClients/dtos/componentmetadata/Anchor";
import Card from "@mateu/shared/apiClients/dtos/componentmetadata/Card";


export const renderCard = (component: Component) => {
    const metadata = component.metadata as Card
    return html`
        <vaadin-card>
            <div slot="title">Lapland</div>
            <!-- tag::[] -->
            <div slot="subtitle">The Exotic North</div>
            <!-- end::[] -->
            <div>Lapland is the northern-most region of Finland and an active outdoor destination.</div>
        </vaadin-card>
    `
}

export const renderAnchor = (component: Component) => {
    const metadata = component.metadata as Anchor
    return html`<a href="${metadata.url}">${metadata.text}</a>`
}

export const renderButton = (component: Component) => {
    const metadata = component.metadata as Button
    return html`<vaadin-button>${metadata.label}</vaadin-button>`
}


export const renderBadge = (component: Component) => {
    const metadata = component.metadata as Badge
    return html`<span theme="badge ${metadata.color} ${metadata.pill?'pill':''} ${metadata.small?'small':''} ${metadata.primary?'primary':''}">${metadata.text}</span>`
}

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