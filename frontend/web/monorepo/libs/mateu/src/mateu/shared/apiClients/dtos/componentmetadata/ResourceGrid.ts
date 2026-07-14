import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import ResourceItem from "@mateu/shared/apiClients/dtos/componentmetadata/ResourceItem";

export default interface ResourceGrid extends ComponentMetadata {
    actionId?: string
    columns?: number
    recommendedLabel?: string
    items?: ResourceItem[]
}
