import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import PaymentMethod from "@mateu/shared/apiClients/dtos/componentmetadata/PaymentMethod";

export default interface PaymentPicker extends ComponentMetadata {
    actionId?: string
    methods?: PaymentMethod[]
    selected?: string
    contextLabel?: string
    contextValue?: string
    confirmLabel?: string
}
