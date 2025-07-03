import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface ServerSideComponent extends Component {

    serverSideType: string | undefined
    initialData: any | undefined

}
