import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import StatusItem from "@mateu/shared/apiClients/dtos/componentmetadata/StatusItem";

export default interface StatusList extends ComponentMetadata {
    items?: StatusItem[]
    compact?: boolean
    /** divider lines between rows but no outer border (the host provides the framing) */
    frameless?: boolean
}
