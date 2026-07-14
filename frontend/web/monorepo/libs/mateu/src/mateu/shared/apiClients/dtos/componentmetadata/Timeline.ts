import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import TimelineItem from "@mateu/shared/apiClients/dtos/componentmetadata/TimelineItem";

export default interface Timeline extends ComponentMetadata {
    items?: TimelineItem[]
}
