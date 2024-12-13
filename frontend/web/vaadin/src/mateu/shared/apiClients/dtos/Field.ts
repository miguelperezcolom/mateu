import Validation from "./Validation";
import Pair from "./Pair";
import Badge from "./Badge";

export default interface Field {

    id: string
    type: string
    stereotype: string
    observed: boolean
    wantsFocus: boolean
    caption: string
    placeholder: string
    cssClasses: string
    description: string
    badges: Badge[]
    validations: Validation[]
    attributes: Pair[]
    colspan: number
    rightAligned: boolean
    bold: boolean

}
