import FieldGroup from "./FieldGroup";
import {SectionType} from "./SectionType";

export default interface Section {

    id: string
    tabId: string
    caption: string
    description: string
    readOnly: boolean
    type: SectionType
    leftSideImageUrl: string
    topImageUrl: string
    fieldGroups: FieldGroup[]
    columns: number

}
