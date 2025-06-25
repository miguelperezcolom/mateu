import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import { Page } from "@mateu/shared/apiClients/dtos/Page";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";

export default interface Grid extends ComponentMetadata {

    columns: GridColumn[]
    page: Page
    tree: boolean

}