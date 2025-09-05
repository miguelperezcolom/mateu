import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface ProgressBar extends ComponentMetadata {

    indeterminate: boolean
    min: number
    max: number
    value: number
    text: string
    theme: string

}