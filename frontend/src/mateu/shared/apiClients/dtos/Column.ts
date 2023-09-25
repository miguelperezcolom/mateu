import Validation from "./Validation";
import Attribute from "./Attribute";

export default interface Column {

    id: string;

    type: string;

    caption: string;

    description: string;

    width: string;

    readOnly: boolean;

    placeholder: string;

    validations: Validation[]

    attributes: Attribute[]

}
