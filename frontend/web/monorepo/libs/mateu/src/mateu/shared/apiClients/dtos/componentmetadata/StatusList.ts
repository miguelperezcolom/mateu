import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import StatusItem from "@mateu/shared/apiClients/dtos/componentmetadata/StatusItem";

export default interface StatusList extends ComponentMetadata {
    items?: StatusItem[]
}
