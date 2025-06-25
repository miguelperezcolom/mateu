import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import { Page } from "@mateu/shared/apiClients/dtos/Page";

export default interface VirtualList extends ComponentMetadata {

    page: Page

}