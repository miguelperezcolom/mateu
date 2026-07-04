import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface EmptyState extends ComponentMetadata {

    icon?: string
    title?: string
    description?: string
    actionId?: string
    actionLabel?: string

}
