import JourneyType from "../../shared/apiClients/dtos/JourneyType";
import Journey from "../../shared/apiClients/dtos/Journey";
import Step from "../../shared/apiClients/dtos/Step";

export class State {
    baseUrl: string = ''
    cargando: boolean | undefined = undefined;
    error: boolean | undefined = undefined;
    tipos:JourneyType[] = [];
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
}
