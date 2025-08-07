import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import CookieConsent from "@mateu/shared/apiClients/dtos/componentmetadata/CookieConsent";
import { html, nothing } from "lit";

export const renderCookieConsent = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as CookieConsent
    let position = undefined
    if (metadata.position) {
        position = {
            Top: 'top',
            Bottom: 'bottom',
            TopLeft: 'top-left',
            TopRight: 'top-right',
            BottomLeft: 'bottom-left',
            BottomRight: 'bottom-right'
        }[metadata.position]
    }

    return html`
        <mateu-cookie-consent style="${component.style}" class="${component.cssClasses}"
                               slot="${component.slot??nothing}"
                               position="${position??nothing}"
                               cookie-name="${metadata.cookieName??nothing}"
                               .message="${metadata.message??nothing}"
                               theme="${metadata.theme??nothing}"
                               .learnMore="${metadata.learnMore??nothing}"
                               .learnMoreLink="${metadata.learnMoreLink??nothing}"
                               .dismiss="${metadata.dismiss??nothing}"
        ></mateu-cookie-consent>
    `
}