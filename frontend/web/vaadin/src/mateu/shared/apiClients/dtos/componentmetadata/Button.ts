import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Button extends ComponentMetadata {

    id: string
    icon: string
    label: string
    actionId: string

}
