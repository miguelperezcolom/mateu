import Component from "@mateu/shared/apiClients/dtos/Component";
import Trigger from "@mateu/shared/apiClients/dtos/componentmetadata/Trigger";
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action";
import Rule from "@mateu/shared/apiClients/dtos/componentmetadata/Rule";

export default interface ServerSideComponent extends Component {

    serverSideType: string | undefined
    initialData: any | undefined
    triggers: Trigger[] | undefined
    actions: Action[] | undefined
    rules: Rule[]

}
