import Validation from "./Validation";
import Pair from "./Pair";
import Badge from "./Badge";
import Option from "@mateu/shared/apiClients/dtos/componentmetadata/Option";

export default interface FormField {

    fieldId: string
    dataType: string
    stereotype: string
    observed: boolean | undefined
    wantsFocus: boolean | undefined
    label: string | undefined
    placeholder: string | undefined
    cssClasses: string | undefined
    description: string | undefined
    badges: Badge[] | undefined
    validations: Validation[] | undefined
    attributes: Pair[] | undefined
    colspan: number | undefined
    rightAligned: boolean | undefined
    bold: boolean | undefined
    initialValue: any
    options: Option[] | undefined

}
