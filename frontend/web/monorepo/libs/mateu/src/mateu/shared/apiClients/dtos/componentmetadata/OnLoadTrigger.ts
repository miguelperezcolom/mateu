import Trigger from "@mateu/shared/apiClients/dtos/componentmetadata/Trigger";

export default interface OnLoadTrigger extends Trigger {

    timeoutMillis: number
    times: number
    triggered: boolean

}