import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import PlanningResource from "@mateu/shared/apiClients/dtos/componentmetadata/PlanningResource";
import PlanningBlock from "@mateu/shared/apiClients/dtos/componentmetadata/PlanningBlock";

export default interface PlanningBoard extends ComponentMetadata {

    resources?: PlanningResource[]
    blocks?: PlanningBlock[]
    from?: string
    to?: string
    moveActionId?: string
    selectActionId?: string

}
