import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Card from "@mateu/shared/apiClients/dtos/componentmetadata/Card";
import { html, nothing } from "lit";
import { renderComponent, renderComponentInSlot } from "@infra/ui/renderers/componentRenderer";

export const renderCard = (component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as Card
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
            ${metadata.media?renderComponentInSlot(metadata.media, baseUrl, state, data, 'media'):nothing}
            ${metadata.title?renderComponentInSlot(metadata.title, baseUrl, state, data, 'title'):nothing}
            ${metadata.subtitle?renderComponentInSlot(metadata.subtitle, baseUrl, state, data, 'subtitle'):nothing}
            ${metadata.header?renderComponentInSlot(metadata.header, baseUrl, state, data, 'header'):nothing}
            ${metadata.headerPrefix?renderComponentInSlot(metadata.headerPrefix, baseUrl, state, data, 'header-prefix'):nothing}
            ${metadata.headerSuffix?renderComponentInSlot(metadata.headerSuffix, baseUrl, state, data, 'header-suffix'):nothing}
            ${metadata.footer?renderComponentInSlot(metadata.footer, baseUrl, state, data, 'footer'):nothing}
            ${metadata.content?renderComponent(metadata.content, baseUrl, state, data):nothing}
        </vaadin-card>
    `
}