import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import AddOnPicker from "@mateu/shared/apiClients/dtos/componentmetadata/AddOnPicker";
import { html, nothing } from "lit";
import "@infra/ui/mateu-addon-picker.ts";

export const renderAddOnPicker = (component: ClientSideComponent) => {
    const metadata = component.metadata as AddOnPicker
    return html`
        <mateu-addon-picker
                .totalLabel="${metadata.totalLabel}"
                .currency="${metadata.currency}"
                .actionId="${metadata.actionId}"
                .items="${metadata.items ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-addon-picker>
    `
}
