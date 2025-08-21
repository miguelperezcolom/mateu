import { TriggerType } from "@mateu/shared/apiClients/dtos/componentmetadata/TriggerType";

export default interface Trigger {

    type: TriggerType
    actionId: string
    condition: string
    data: string
    eventName: string

}
