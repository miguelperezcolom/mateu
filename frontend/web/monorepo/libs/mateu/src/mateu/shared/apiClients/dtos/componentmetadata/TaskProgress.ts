import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface TaskProgress extends ComponentMetadata {
    label?: string
    total?: number
    done?: number
    actionLabel?: string
    actionId?: string
}
