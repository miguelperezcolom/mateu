import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Column from "@mateu/shared/apiClients/dtos/componentmetadata/Column";

export default interface Table extends ComponentMetadata {

    id: string
    columns: Column[]
    rows: number | undefined


}