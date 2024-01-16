import FieldGroup from "./FieldGroup";
import Action from "./Action";

export default interface Section {

    id: string

    caption: string

    tabId: string

    description: string

    readOnly: boolean

    type: string

    leftSideImageUrl: string

    topImageUrl: string

    actions: Action[]

    fieldGroups: FieldGroup[]

}
