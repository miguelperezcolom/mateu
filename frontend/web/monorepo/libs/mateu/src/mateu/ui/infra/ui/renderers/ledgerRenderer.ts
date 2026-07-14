import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Ledger from "@mateu/shared/apiClients/dtos/componentmetadata/Ledger";
import { html, nothing } from "lit";
import "@infra/ui/mateu-ledger.ts";

export const renderLedger = (component: ClientSideComponent) => {
    const metadata = component.metadata as Ledger
    return html`
        <mateu-ledger
                .currency="${metadata.currency}"
                .totalLabel="${metadata.totalLabel}"
                .lines="${metadata.lines ?? []}"
                .total="${metadata.total}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-ledger>
    `
}
