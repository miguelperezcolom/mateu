import View from "./View";
import Rule from "./Rule";

export default interface Step {

    id: string;
    name: string;
    view: View;
    data: {
        __index: number | undefined;
        __count: number | undefined;
    };
    rules: Rule[];
    previousStepId: string;
    timestamp: string
    type: string
}
