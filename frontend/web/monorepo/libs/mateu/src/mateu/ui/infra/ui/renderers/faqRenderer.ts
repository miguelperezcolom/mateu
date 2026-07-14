import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Faq from "@mateu/shared/apiClients/dtos/componentmetadata/Faq";
import { html, nothing } from "lit";
import "@infra/ui/mateu-faq.ts";

export const renderFaq = (component: ClientSideComponent) => {
    const metadata = component.metadata as Faq
    return html`
        <mateu-faq
                .items="${metadata.items ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-faq>
    `
}
