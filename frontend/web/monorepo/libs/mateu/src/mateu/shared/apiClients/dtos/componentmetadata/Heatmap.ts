import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import HeatCell from "@mateu/shared/apiClients/dtos/componentmetadata/HeatCell";

export default interface Heatmap extends ComponentMetadata {
    cells?: HeatCell[]
}
