import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import FunnelStage from "@mateu/shared/apiClients/dtos/componentmetadata/FunnelStage";

export default interface Funnel extends ComponentMetadata {
    stages?: FunnelStage[]
}
