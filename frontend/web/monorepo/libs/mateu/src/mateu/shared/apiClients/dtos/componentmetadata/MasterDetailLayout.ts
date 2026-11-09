import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import { SplitLayoutOrientation } from "@mateu/shared/apiClients/dtos/componentmetadata/SplitLayout";

/** A master (first child) and its detail (second child): beside it, or BELOW it when vertical. */
export default interface MasterDetailLayout extends ComponentMetadata {

    orientation?: SplitLayoutOrientation

}
