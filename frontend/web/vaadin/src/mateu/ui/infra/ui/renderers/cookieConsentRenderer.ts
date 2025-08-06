import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import CookieConsent from "@mateu/shared/apiClients/dtos/componentmetadata/CookieConsent";
import { html, nothing } from "lit";

export const renderCookieConsent = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as CookieConsent

    return html`
        <vaadin-cookie-consent style="${component.style}" class="${component.cssClasses}"
                               slot="${component.slot??nothing}"></vaadin-cookie-consent>
    `
}