import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import PaymentPicker from "@mateu/shared/apiClients/dtos/componentmetadata/PaymentPicker";
import { html, nothing } from "lit";
import "@infra/ui/mateu-payment-picker.ts";

export const renderPaymentPicker = (component: ClientSideComponent) => {
    const metadata = component.metadata as PaymentPicker
    return html`
        <mateu-payment-picker
                .actionId="${metadata.actionId}"
                .methodActionId="${metadata.methodActionId}"
                .methods="${metadata.methods ?? []}"
                .selected="${metadata.selected}"
                .contextLabel="${metadata.contextLabel}"
                .contextValue="${metadata.contextValue}"
                .confirmLabel="${metadata.confirmLabel}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-payment-picker>
    `
}
