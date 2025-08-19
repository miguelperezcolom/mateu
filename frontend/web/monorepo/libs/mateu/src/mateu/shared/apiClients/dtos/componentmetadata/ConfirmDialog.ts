import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface ConfirmDialog extends ComponentMetadata {

    header: string
    content: Component
    canCancel: boolean
    canReject: boolean
    rejectText: string
    confirmText: string
    openedCondition: string
    confirmActionId: string
    rejectActionId: string
    cancelActionId: string

}