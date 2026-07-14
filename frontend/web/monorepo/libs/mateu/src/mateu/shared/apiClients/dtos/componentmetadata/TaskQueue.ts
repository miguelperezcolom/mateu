import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import QueueGroup from "@mateu/shared/apiClients/dtos/componentmetadata/QueueGroup";

export default interface TaskQueue extends ComponentMetadata {
    actionId?: string
    groups?: QueueGroup[]
}
