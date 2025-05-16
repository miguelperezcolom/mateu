import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Column from "@mateu/shared/apiClients/dtos/componentmetadata/Column";

export default interface Card extends ComponentMetadata {

    columns: Column[]

}