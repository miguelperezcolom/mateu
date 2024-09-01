import {ActionTarget} from "../../../../shared/apiClients/dtos/ActionTarget";

export interface CallActionCommand {
    baseUrl: string
    uiId: string
    journeyTypeId: string
    journeyId: string
    stepId: string
    componentId: string
    actionId: string
    target: ActionTarget
    componentType: string
    data: unknown
}