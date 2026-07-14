import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import OrgNode from "@mateu/shared/apiClients/dtos/componentmetadata/OrgNode";

export default interface OrgChart extends ComponentMetadata {
    root?: OrgNode
}
