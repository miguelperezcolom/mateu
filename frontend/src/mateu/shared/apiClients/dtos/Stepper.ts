import StepperStep from "./StepperStep";

export default interface Stepper {

    id: string;

    value: number;

    text: string;

    steps: StepperStep[]

}
