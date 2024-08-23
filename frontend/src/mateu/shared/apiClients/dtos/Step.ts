import View from "./View";

export default interface Step {

    id: string
    view: View
    previousStepId: string
    timestamp: string
    type: string

}
