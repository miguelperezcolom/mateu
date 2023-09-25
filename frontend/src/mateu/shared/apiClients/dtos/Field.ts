import Validation from "./Validation";
import Attribute from "./Attribute";

export default interface Field {

    id: string

    type: string

    stereotype: string

    observed: boolean

    caption: string

    placeholder: string

    description: string

    validations: Validation[]

    attributes: Attribute[]

}
