import FieldGroup from "./FieldGroup";
import Action from "./Action";

export default interface Section {

    id: string

    caption: string

    description: string

    readOnly: boolean

    type: string

    actions: Action[]

    fieldGroups: FieldGroup[]

}
