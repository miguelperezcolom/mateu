import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import OrgNode from "@mateu/shared/apiClients/dtos/componentmetadata/OrgNode";

export default interface OrgChart extends ComponentMetadata {
    root?: OrgNode
    /** "tree" (default; null reads as tree) | "focus" */
    display?: string
    /** id of the node a focused chart opens on (null/unknown: the root) */
    focus?: string
}
