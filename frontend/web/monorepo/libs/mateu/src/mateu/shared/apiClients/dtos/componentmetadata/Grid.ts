import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import { Page } from "@mateu/shared/apiClients/dtos/Page";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";

export default interface Grid extends ComponentMetadata {

    content: ClientSideComponent[]
    page: Page
    tree: boolean

}