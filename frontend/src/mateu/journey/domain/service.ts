import {State} from "./state";
import {Subject} from "rxjs";
import {callActionCommandHandler} from "./commands/callAction/CallActionCommandHandler";
import UIIncrement from "../../shared/apiClients/dtos/UIIncrement";
import {startJourneyCommandHandler} from "./commands/startJourney/StartJourneyCommandHandler";
import {ContentType} from "../../shared/apiClients/dtos/ContentType";
import View from "../../shared/apiClients/dtos/View";
import {SingleComponent} from "../../shared/apiClients/dtos/SingleComponent";

export class Service {

    upstream: Subject<State>
    state = new State()

    constructor(upstream: Subject<State>) {
        this.upstream = upstream;
    }

    async startJourney(baseUrl: string, uiId: string, journeyTypeId: string, journeyId: string) {
        const uiIncrement = await startJourneyCommandHandler.handle({baseUrl, uiId, journeyTypeId, journeyId})
        this.state.view = uiIncrement.content as View
        this.state.components = uiIncrement.components
        this.upstream.next({...this.state })
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
                console.log('error', error)
                throw error
            })
            .then(async (delta: UIIncrement) => {

                console.log('state', this.state)

                // send new state upstream
                if (delta.content.contentType == ContentType.View) {
                    this.state.view = delta.content as View
                } else if (delta.content.contentType == ContentType.SingleComponent) {
                    const singleComponent = delta.content as SingleComponent
                    if (this.state.view) {
                        this.state.view.main.componentIds = [singleComponent.componentId]
                    } else {
                        console.error('no view in state')
                    }
                }
                for (let componentId in delta.components) {
                    this.state.components[componentId] = delta.components[componentId]
                }
                this.upstream.next({...this.state})
            })
    }

}

