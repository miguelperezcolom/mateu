import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import OfferCard from "@mateu/shared/apiClients/dtos/componentmetadata/OfferCard";
import { html, nothing } from "lit";
import "@infra/ui/mateu-offer-card.ts";

export const renderOfferCard = (component: ClientSideComponent) => {
    const metadata = component.metadata as OfferCard
    return html`
        <mateu-offer-card
                .tag="${metadata.tag}"
                .title="${metadata.title ?? ''}"
                .subtitle="${metadata.subtitle}"
                .image="${metadata.image}"
                .features="${metadata.features ?? []}"
                .priceLabel="${metadata.priceLabel}"
                .actionLabel="${metadata.actionLabel}"
                .actionId="${metadata.actionId}"
                .current="${metadata.current ?? false}"
                .currentLabel="${metadata.currentLabel}"
                .added="${metadata.added ?? false}"
                .addedLabel="${metadata.addedLabel}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-offer-card>
    `
}
