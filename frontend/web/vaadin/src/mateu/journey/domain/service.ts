import {Subject} from "rxjs";
import {callActionCommandHandler} from "./commands/callAction/CallActionCommandHandler";
import UIIncrement from "../../shared/apiClients/dtos/UIIncrement";
import {startJourneyCommandHandler} from "./commands/startJourney/StartJourneyCommandHandler";

export class Service {

    upstream: Subject<UIIncrement>

    constructor(upstream: Subject<UIIncrement>) {
        this.upstream = upstream;
    }

    async startJourney(baseUrl: string, uiId: string, journeyTypeId: string, journeyId: string) {
        const uiIncrement = await startJourneyCommandHandler.handle({baseUrl, uiId, journeyTypeId, journeyId})
        this.upstream.next(uiIncrement)
    }

    async runAction(
        baseUrl: string,
        uiId: string,
        journeyTypeId: string,
        journeyId: string,
        stepId: string,
        componentId: string,
        actionId: string,
        componentType: string,
        data: unknown
    ) {
        console.log('runAction', baseUrl, uiId, data)
        await callActionCommandHandler
            .handle({
                baseUrl,
                uiId,
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

