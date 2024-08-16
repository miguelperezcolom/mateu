import Journey from "../../shared/apiClients/dtos/Journey";
import Step from "../../shared/apiClients/dtos/Step";

export class State {
    baseUrl: string = ''
    error: boolean | undefined = undefined;
    uiId: string | undefined = undefined;
    journeyTypeId: string | undefined = undefined;
    journeyId: string | undefined = undefined;
    journey: Journey | undefined = undefined;
    stepId: string | undefined = undefined;
    previousStepId: string | undefined = undefined;
    step: Step | undefined = undefined;
    completed: boolean = false;
    version = ''
    notificationOpened: boolean = false;
    notificationMessage: string = '';
    modalMustBeClosed: boolean = false
}
