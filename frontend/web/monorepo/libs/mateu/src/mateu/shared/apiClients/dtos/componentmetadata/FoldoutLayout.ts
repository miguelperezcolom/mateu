import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import FoldoutPanelInfo from "@mateu/shared/apiClients/dtos/componentmetadata/FoldoutPanelInfo";
import FoldoutNavigation from "@mateu/shared/apiClients/dtos/componentmetadata/FoldoutNavigation";

// The overview travels as the child slotted "overview"; panel contents as "panel-N"
export default interface FoldoutLayout extends ComponentMetadata {

    panels?: FoldoutPanelInfo[]

    headerTitle?: string

    badges?: string[]

    // "vertical" (overview on the left) | "horizontal" (overview across the top)
    orientation?: string

    navigation?: FoldoutNavigation

}
