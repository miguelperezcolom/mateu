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

}
