import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Component {

    metadata: ComponentMetadata | undefined
    id: string | undefined
    serverSideType: string | undefined
    children: Component[] | undefined
    initialData: any | undefined

}
