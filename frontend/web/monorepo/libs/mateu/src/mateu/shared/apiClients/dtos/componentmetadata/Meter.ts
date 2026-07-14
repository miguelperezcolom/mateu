import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Meter extends ComponentMetadata {
    label?: string
    value?: number
    max?: number
    unit?: string
    caption?: string
    warnAt?: number
    dangerAt?: number
}
