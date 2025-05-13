import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Component {

    metadata: ComponentMetadata
    id: string
    type: string
    serverSideType: string
    children: Component[] | undefined

}
