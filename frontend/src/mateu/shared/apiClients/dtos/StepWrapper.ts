import Step from "./Step";
import Journey from "./Journey";

export default interface StepWrapper {

    journey: Journey
    step: Step
    store: any
    modalMustBeClosed: boolean

}
