import FieldGroupLine from "./FieldGroupLine";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface FieldGroup extends ComponentMetadata {

    id: string
    caption: string
    lines: FieldGroupLine[]
    columns: number

}
