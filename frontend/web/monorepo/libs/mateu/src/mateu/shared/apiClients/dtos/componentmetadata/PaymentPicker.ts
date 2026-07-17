import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import PaymentMethod from "@mateu/shared/apiClients/dtos/componentmetadata/PaymentMethod";

export default interface PaymentPicker extends ComponentMetadata {
    actionId?: string
    /** dispatched with { _method: id } every time the user picks a method */
    methodActionId?: string
    methods?: PaymentMethod[]
    selected?: string
    contextLabel?: string
    contextValue?: string
    confirmLabel?: string
}
