import Trigger from "@mateu/shared/apiClients/dtos/componentmetadata/Trigger";

export default interface OnLoadTrigger extends Trigger {

    times: number
    triggered: boolean

}