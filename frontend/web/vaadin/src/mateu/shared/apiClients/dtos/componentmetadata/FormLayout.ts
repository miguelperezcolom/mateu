import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export interface FormLayoutItem extends ComponentMetadata {

}


export interface FormLayoutRow extends ComponentMetadata {

}

export default interface FormLayout extends ComponentMetadata {

    autoResponsive: boolean
    maxColumns: number | undefined
    labelsAside: boolean
    columnWidth: string
    expandColumns: boolean
    expandFields: boolean

    responsiveSteps: any
    itemLabelWidth: string | undefined

    columnSpacing: string | undefined
    itemRowSpacing: string | undefined
    itemLabelSpacing: string | undefined

}
