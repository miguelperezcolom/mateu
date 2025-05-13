import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Component {

    metadata: ComponentMetadata
    id: string
    serverSideType: string | undefined
    children: Component[] | undefined

}
