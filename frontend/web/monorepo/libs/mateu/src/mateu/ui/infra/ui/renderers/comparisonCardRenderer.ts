import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ComparisonCard from "@mateu/shared/apiClients/dtos/componentmetadata/ComparisonCard";
import { html, nothing } from "lit";
import "@infra/ui/mateu-comparison-card.ts";

export const renderComparisonCard = (component: ClientSideComponent) => {
    const metadata = component.metadata as ComparisonCard
    return html`
        <mateu-comparison-card
                heading="${metadata.title ?? nothing}"
                leftLabel="${metadata.leftLabel ?? nothing}"
                leftValue="${metadata.leftValue ?? nothing}"
                rightLabel="${metadata.rightLabel ?? nothing}"
                rightValue="${metadata.rightValue ?? nothing}"
                delta="${metadata.delta ?? nothing}"
                trend="${metadata.trend ?? nothing}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-comparison-card>
    `
}
