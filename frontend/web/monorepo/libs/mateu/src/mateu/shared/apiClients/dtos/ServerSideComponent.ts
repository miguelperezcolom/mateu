import Component from "@mateu/shared/apiClients/dtos/Component";
import Trigger from "@mateu/shared/apiClients/dtos/componentmetadata/Trigger";
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action";
import Rule from "@mateu/shared/apiClients/dtos/componentmetadata/Rule";
import Validation from "@mateu/shared/apiClients/dtos/componentmetadata/Validation.ts";

export default interface ServerSideComponent extends Component {

    serverSideType: string | undefined
    route: string | undefined
    initialData: unknown
    triggers: Trigger[] | undefined
    actions: Action[] | undefined
    rules: Rule[]
    validations: Validation[]
    // Logical source name stamped into custom events this component emits (see @Emits).
    emitsName?: string | undefined
    /**
     * How the page's content column is sized within the viewport (the first parameter of the
     * Oracle Redwood page templates): "fixed" (capped, centered column), "fullWidth" (fluid with
     * side margins, uncapped) or "edgeToEdge" (content touches the viewport edges).
     * null/undefined = the renderer infers it from the page content.
     */
    pageWidth?: string | undefined

    /**
     * The page's coarse template type (the Oracle Redwood page-template families): "landing",
     * "collection", "detail", "form", "process" or "dashboard" — inferred from the ModelView's
     * shape unless declared with @PageTemplate.
     */
    pageType?: string | undefined

    /**
     * Stable content hash (ETag) of this component's structure (phase b of the client structure
     * cache). Stored next to the cached structure and echoed back as the request's
     * knownStructureHash; when it still matches, the server omits the component and the client
     * reuses its cache. undefined only from old backends.
     */
    structureHash?: string | undefined

    /**
     * The view is declared @StaticView: its full response never varies, so the client caches the
     * whole fragment for the session and skips the round-trip on return visits (phase b, static
     * skip). A developer promise; false/undefined unless declared.
     */
    staticView?: boolean | undefined

}
