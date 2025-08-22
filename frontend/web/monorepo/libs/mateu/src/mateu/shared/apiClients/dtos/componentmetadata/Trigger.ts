import { TriggerType } from "@mateu/shared/apiClients/dtos/componentmetadata/TriggerType";

export default interface Trigger {

    type: TriggerType
    actionId: string
    condition: string
    eventName: string
    propertyName: string
    calledActionId: string

}
