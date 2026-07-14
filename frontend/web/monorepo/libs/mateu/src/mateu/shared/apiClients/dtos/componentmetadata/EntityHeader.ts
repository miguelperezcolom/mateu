import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Chip from "@mateu/shared/apiClients/dtos/componentmetadata/Chip";
import Fact from "@mateu/shared/apiClients/dtos/componentmetadata/Fact";

export default interface EntityHeader extends ComponentMetadata {
    title?: string
    badges?: Chip[]
    subtitle?: string
    facts?: Fact[]
    metricLabel?: string
    metricValue?: string
    metricCaption?: string
}
