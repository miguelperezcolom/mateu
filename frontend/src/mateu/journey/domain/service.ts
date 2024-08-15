import {State} from "./state";
import {goBackCommandHandler} from "./commands/goBack/GoBackCommandHandler";
import {goToIndexCommandHandler} from "./commands/goToIndex/GoToIndexCommandHandler";
import {Subject} from "rxjs";
import {goToStepCommandHandler} from "./commands/goToStep/GoToStepCommandHandler";
import {wrapperCallActionCommandHandler} from "./commands/callAction/WrapperCallActionCommandHandler";
import StepWrapper from "../../shared/apiClients/dtos/StepWrapper";
import {wrapperStartJourneyCommandHandler} from "./commands/startJourney/WrapperStartJourneyCommandHandler";

export class Service {

    upstream: Subject<State>
    state = new State()

    constructor(upstream: Subject<State>) {
        this.upstream = upstream;
    }

    async startJourney(baseUrl: string, uiId: string, journeyTypeId: string) {
        await wrapperStartJourneyCommandHandler.handle({baseUrl, uiId, journeyTypeId}, this.state)
        this.upstream.next({...this.state})
    }

    async runAction(actionId: string, data: unknown) {
        await wrapperCallActionCommandHandler
            .handle({actionId, data}, this.state)
            .catch((error) => {
                console.log('error', error)
                throw error
            })
            .then(async (value: StepWrapper) => {
                if (value.step?.type == 'java.net.URL') {
                    // @ts-ignore
                    if (value.step.target == 'Deferred') {
                        // @ts-ignore
                        window.location = value.step.data.url
                        return
                    }
                    // @ts-ignore
                    if (value.step.target == 'DeferredNewTab') {
                        // @ts-ignore
                        window.open(value.step.data.url, '_blank')
                        return
                    }
                    // @ts-ignore
                    if (value.step.target == 'DeferredNewWindow') {
                        // @ts-ignore
                        window.open(value.step.data.url, 'A window', 'width=800,height=400,screenX=200,screenY=200')
                        return
                    }
                    // @ts-ignore
                    if (value.step.target == 'DeferredReplace') {
                        window.close()
                        // @ts-ignore
                        window.open(value.step.data.url, 'A window', 'width=800,height=400,screenX=200,screenY=200')
                        return
                    }
                }

                sessionStorage.setItem(this.state.journeyId!, JSON.stringify(value.store))
                this.state.journey = value.journey
                this.state.stepId = this.state.journey.currentStepId
                if (this.state.journey.status != 'Finished') {
                    this.state.step = value.step
                    this.state.previousStepId = this.state.step.previousStepId
                }
                this.upstream.next({...this.state})
            })
    }


    async goBack(journeyId: string) {
        await goBackCommandHandler.handle({
            journey: JSON.parse(sessionStorage.getItem(journeyId)!)
        }, this.state).then(async (value: StepWrapper) => {
            sessionStorage.setItem(this.state.journeyId!, JSON.stringify(value.store))
            this.state.journey = value.journey
            this.state.stepId = this.state.journey.currentStepId
            if (this.state.journey.status != 'Finished') {
                this.state.step = value.step
                this.state.previousStepId = this.state.step.previousStepId
            }
            this.upstream.next({...this.state})
        })
    }

    async goToIndex(data: { __listId: string; __index: number; __count: number }) {
        await goToIndexCommandHandler.handle(data, this.state).then(async (value: StepWrapper) => {
            sessionStorage.setItem(this.state.journeyId!, JSON.stringify(value.store))
            this.state.journey = value.journey
            this.state.stepId = this.state.journey.currentStepId
            if (this.state.journey.status != 'Finished') {
                this.state.step = value.step
                this.state.previousStepId = this.state.step.previousStepId
            }
            this.upstream.next({...this.state})
        })
    }

    async goToStep(stepId: string) {
        await goToStepCommandHandler.handle({
            __stepId: stepId
        }, this.state).then(async (value: StepWrapper) => {
            sessionStorage.setItem(this.state.journeyId!, JSON.stringify(value.store))
            this.state.journey = value.journey
            this.state.stepId = this.state.journey.currentStepId
            if (this.state.journey.status != 'Finished') {
                this.state.step = value.step
                this.state.previousStepId = this.state.step.previousStepId
            }
            this.upstream.next({...this.state})
        })
    }

}

