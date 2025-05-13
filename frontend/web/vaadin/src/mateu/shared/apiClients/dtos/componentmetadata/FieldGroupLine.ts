import Field from "./Field";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface FieldGroupLine extends ComponentMetadata {

    fields: Field[]

}
