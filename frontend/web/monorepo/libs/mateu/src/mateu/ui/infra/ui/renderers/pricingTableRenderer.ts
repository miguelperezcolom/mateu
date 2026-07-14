import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import PricingTable from "@mateu/shared/apiClients/dtos/componentmetadata/PricingTable";
import { html, nothing } from "lit";
import "@infra/ui/mateu-pricing-table.ts";

export const renderPricingTable = (component: ClientSideComponent) => {
    const metadata = component.metadata as PricingTable
    return html`
        <mateu-pricing-table
                .plans="${metadata.plans ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-pricing-table>
    `
}
