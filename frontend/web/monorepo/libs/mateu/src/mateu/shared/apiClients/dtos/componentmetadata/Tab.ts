import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Tab extends ComponentMetadata {

    label: string

    shortcut?: string

    /** When true this tab is the one selected when the strip first renders. */
    active?: boolean

    /** The URL segment that opens this tab (@Tab(key)); selecting it pushes a history entry. */
    routeKey?: string

    /** A count drawn on the tab (the rows of its eager @Subresource listings). */
    badge?: string

}