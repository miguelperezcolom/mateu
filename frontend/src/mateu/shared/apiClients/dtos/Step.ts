import View from "./View";
import Component from "./Component";

export default interface Step {

    id: string
    view: View
    previousStepId: string
    timestamp: string
    type: string
    components: Record<string, Component>

}
