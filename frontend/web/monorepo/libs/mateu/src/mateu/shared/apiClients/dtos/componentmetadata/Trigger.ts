import { TriggerType } from "@mateu/shared/apiClients/dtos/componentmetadata/TriggerType";

export default interface Trigger {

    type: TriggerType
    actionId: string
    condition: string
    eventName: string
    propertyName: string
    calledActionId: string
    timeoutMillis: number
    debounceMillis: number
    // For OnCustomEvent triggers: where to listen and, for COMPONENT scope, the source to match.
    source?: 'DOCUMENT' | 'COMPONENT' | 'SELF'
    from?: string
    // OnLoad/OnSuccess: run the triggered action as a silent background refresh (no loading veil).
    background?: boolean

}
