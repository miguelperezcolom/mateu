import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import StatusItem from "@mateu/shared/apiClients/dtos/componentmetadata/StatusItem";

export default interface StatusList extends ComponentMetadata {
    items?: StatusItem[]
    compact?: boolean
    /** divider lines between rows but no outer border (the host provides the framing) */
    frameless?: boolean
    /** makes every row clickable: clicking one dispatches this action with { _item: id } */
    rowActionId?: string
    /** N-column responsive grid instead of a single stack; 0/absent = classic one-column list */
    columns?: number
    /** heading level of item titles in stacked mode (default 3 → h3; 4 → h4 under an h3 group) */
    itemHeadingLevel?: number
}
