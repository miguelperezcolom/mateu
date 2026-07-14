import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import AddOn from "@mateu/shared/apiClients/dtos/componentmetadata/AddOn";

export default interface AddOnPicker extends ComponentMetadata {
    totalLabel?: string
    currency?: string
    actionId?: string
    items?: AddOn[]
}
