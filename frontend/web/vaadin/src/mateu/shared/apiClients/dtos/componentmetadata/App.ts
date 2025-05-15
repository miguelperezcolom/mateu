import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action";

export default interface App extends ComponentMetadata {

    id: string
    title: string | undefined
    subtitle: string | undefined
    actions: Action[]

}