import {State} from "./state";
import {startJourneyCommandHandler} from "./commands/startJourney/StartJourneyCommandHandler";
import {callActionCommandHandler} from "./commands/callAction/CallActionCommandHandler";
import {getJourneyQueryHandler} from "./queries/getJourney/GetJourneyQueryHandler";
import {getStepQueryHandler} from "./queries/getStep/GetStepQueryHandler";
import {goBackCommandHandler} from "./commands/goBack/GoBackCommandHandler";
import {goToIndexCommandHandler} from "./commands/goToIndex/GoToIndexCommandHandler";
import {Subject} from "rxjs";

export class Service {

    upstream: Subject<State>
    state = new State()

    constructor(upstream: Subject<State>) {
        this.upstream = upstream;
    }

    async startJourney(baseUrl: string, journeyTypeId: string) {
        console.log('start journey', baseUrl, journeyTypeId)
        await startJourneyCommandHandler.handle({baseUrl, journeyTypeId}, this.state)
        this.upstream.next({...this.state})
    }

    async runAction(actionId: string, data: unknown) {
        await callActionCommandHandler
            .handle({actionId, data}, this.state)
            .catch((error) => {
            console.log('error', error)
            throw error
        }).then(async () => {
            await this.reloadJourney()
            this.upstream.next({...this.state})
        })
    }

    private async reloadJourney() {
        this.state.journey = await getJourneyQueryHandler.handle({
            journeyTypeId: this.state.journeyTypeId!,
            journeyId: this.state.journeyId!
        })
        this.state.stepId = this.state.journey.currentStepId
        if (this.state.journey.status != 'Finished') {
            this.state.step = await getStepQueryHandler.handle({
                journeyTypeId: this.state.journeyTypeId!,
                journeyId: this.state.journeyId!,
                stepId: this.state.stepId
            })
            this.state.previousStepId = this.state.step.previousStepId
        }
        console.log('journey reloaded', this.state)
    }

    async goBack() {
        await goBackCommandHandler.handle({}, this.state)
        await this.reloadJourney()
        this.upstream.next({...this.state})
    }

    async goToIndex(data: { __listId: string; __index: number; __count: number }) {
        await goToIndexCommandHandler.handle(data, this.state)
        await this.reloadJourney()
        this.upstream.next({...this.state})
    }

}

