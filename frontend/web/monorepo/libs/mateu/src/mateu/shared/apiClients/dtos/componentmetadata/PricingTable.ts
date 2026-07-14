import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import PricingPlan from "@mateu/shared/apiClients/dtos/componentmetadata/PricingPlan";

export default interface PricingTable extends ComponentMetadata {
    plans?: PricingPlan[]
}
