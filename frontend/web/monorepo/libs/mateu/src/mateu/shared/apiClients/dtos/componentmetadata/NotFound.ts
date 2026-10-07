import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

/**
 * The page a route renders when what it names does not exist (a deleted record, a wrong link):
 * shown in place of the content, inside the app shell.
 */
export default interface NotFound extends ComponentMetadata {

    /** The heading — the server's message; a generic "Not found" when absent. */
    title?: string
    /** The line under the heading. */
    message?: string
    /** Where the way back goes (a route of the app). No way back when absent. */
    backRoute?: string
    backLabel?: string

}
