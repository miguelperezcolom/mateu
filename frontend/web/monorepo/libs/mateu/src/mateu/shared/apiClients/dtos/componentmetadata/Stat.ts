import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Stat extends ComponentMetadata {
    label?: string
    value?: string
    unit?: string
    delta?: string
    trend?: string
    spark?: number[]
    actionId?: string
}
