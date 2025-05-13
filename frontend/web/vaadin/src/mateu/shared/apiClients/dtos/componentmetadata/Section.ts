import FieldGroup from "./FieldGroup";
import {SectionType} from "./SectionType";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Section extends ComponentMetadata {

    id: string
    tabId: string
    caption: string
    description: string
    readOnly: boolean
    sectionType: SectionType
    leftSideImageUrl: string
    topImageUrl: string
    fieldGroups: FieldGroup[]
    columns: number
    sidePositionedLabel: boolean
    itemLabelWidth: string

}
