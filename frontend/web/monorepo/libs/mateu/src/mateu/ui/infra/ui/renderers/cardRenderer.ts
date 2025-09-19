import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Card from "@mateu/shared/apiClients/dtos/componentmetadata/Card";
import { html, LitElement, nothing } from "lit";
import { renderComponent, renderComponentInSlot } from "@infra/ui/renderers/renderComponent.ts";

export const renderCard = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as Card

    if (!metadata) {
        return html``
    }

    let theme = '';
    metadata.variants?.map(variant => {
        if (variant == 'stretchMedia') {
            return 'stretch-media'
        }
        if (variant == 'coverMedia') {
            return 'cover-media'
        }
        return variant
    })
            .forEach(variant => theme += ' ' + variant)
    theme = theme.trim()

    return html`
        <vaadin-card
                style="${component.style}" 
                class="${component.cssClasses}" 
                theme="${theme}"
                slot="${component.slot??nothing}"
        >
            ${metadata.media?renderComponentInSlot(container, metadata.media, baseUrl, state, data, 'media', false):nothing}
            ${metadata.title?renderComponentInSlot(container, metadata.title, baseUrl, state, data, 'title', false):nothing}
            ${metadata.subtitle?renderComponentInSlot(container, metadata.subtitle, baseUrl, state, data, 'subtitle', false):nothing}
            ${metadata.header?renderComponentInSlot(container, metadata.header, baseUrl, state, data, 'header', false):nothing}
            ${metadata.headerPrefix?renderComponentInSlot(container, metadata.headerPrefix, baseUrl, state, data, 'header-prefix', false):nothing}
            ${metadata.headerSuffix?renderComponentInSlot(container, metadata.headerSuffix, baseUrl, state, data, 'header-suffix', false):nothing}
            ${metadata.footer?renderComponentInSlot(container, metadata.footer, baseUrl, state, data, 'footer', false):nothing}
            ${metadata.content?renderComponent(container, metadata.content, baseUrl, state, data, false):nothing}
        </vaadin-card>
    `
}