import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";

export default interface GridGroupColumn extends ComponentMetadata {

    id: string
    label: string
    columns: ClientSideComponent[]

}