import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import CalloutCard from "@mateu/shared/apiClients/dtos/componentmetadata/CalloutCard";
import { html, nothing } from "lit";
import "@infra/ui/mateu-callout-card.ts";

export const renderCalloutCard = (component: ClientSideComponent) => {
    const metadata = component.metadata as CalloutCard
    return html`
        <mateu-callout-card
                heading="${metadata.title ?? nothing}"
                description="${metadata.description ?? nothing}"
                icon="${metadata.icon ?? nothing}"
                ctaLabel="${metadata.ctaLabel ?? nothing}"
                actionId="${metadata.actionId ?? nothing}"
                theme="${metadata.theme ?? nothing}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-callout-card>
    `
}
