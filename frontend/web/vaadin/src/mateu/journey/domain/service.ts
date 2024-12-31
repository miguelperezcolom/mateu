import {Subject} from "rxjs";
import {callActionCommandHandler} from "./commands/callAction/CallActionCommandHandler";
import UIIncrement from "../../shared/apiClients/dtos/UIIncrement";
import {startJourneyCommandHandler} from "./commands/startJourney/StartJourneyCommandHandler";
import {MateuApiClient} from "../../shared/apiClients/MateuApiClient";

export class Service {

    upstream: Subject<UIIncrement>

    constructor(upstream: Subject<UIIncrement>) {
        this.upstream = upstream;
    }

    async startJourney(mateuApiClient: MateuApiClient, baseUrl: string, journeyTypeId: string, journeyId: string) {
        const uiIncrement = await startJourneyCommandHandler.handle(mateuApiClient, {baseUrl, journeyTypeId, journeyId})
        this.upstream.next(uiIncrement)
    }

    async runAction(
        mateuApiClient: MateuApiClient,
        baseUrl: string,
        journeyTypeId: string,
        journeyId: string,
        stepId: string,
        componentId: string,
        actionId: string,
        componentType: string,
        data: unknown
    ) {
        await callActionCommandHandler
            .handle(mateuApiClient, {
                baseUrl,
                journeyTypeId,
                journeyId,
                stepId,
                componentId,
                actionId,
                componentType,
                data
            })
            .catch((error) => {
                throw error
            })
            .then(async (delta: UIIncrement) => {
                this.upstream.next(delta)
            })
    }

}

