import {State} from "./state";
import {Subject} from "rxjs";
import {callActionCommandHandler} from "./commands/callAction/CallActionCommandHandler";
import UIIncrement from "../../shared/apiClients/dtos/UIIncrement";
import {startJourneyCommandHandler} from "./commands/startJourney/StartJourneyCommandHandler";
import {ContentType} from "../../shared/apiClients/dtos/ContentType";
import View from "../../shared/apiClients/dtos/View";
import {SingleComponent} from "../../shared/apiClients/dtos/SingleComponent";
import {ActionTarget} from "../../shared/apiClients/dtos/ActionTarget";

export class Service {

    upstream: Subject<State>

    constructor(upstream: Subject<State>) {
        this.upstream = upstream;
    }

    async startJourney(baseUrl: string, uiId: string, journeyTypeId: string, journeyId: string) {
        const uiIncrement = await startJourneyCommandHandler.handle({baseUrl, uiId, journeyTypeId, journeyId})
        const state = new State()
        state.commands = uiIncrement.commands
        state.messages = uiIncrement.messages
        state.content = uiIncrement.content
        state.view = uiIncrement.content as View
        state.components = uiIncrement.components
        state.target = ActionTarget.View
        this.upstream.next(state)
    }

    async runAction(
        baseUrl: string,
        uiId: string,
        journeyTypeId: string,
        journeyId: string,
        stepId: string,
        componentId: string,
        actionId: string,
        target: ActionTarget,
        modalStyle: string | undefined,
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
                target,
                componentType,
                data
            })
            .catch((error) => {
                throw error
            })
            .then(async (delta: UIIncrement) => {

                const state = new State()
                state.modalStyle = modalStyle
                state.target = target
                state.commands = delta.commands
                state.messages = delta.messages

                // send new state upstream
                if (delta.content) {
                    state.content = delta.content
                    if (delta.content.contentType == ContentType.View) {
                        state.view = delta.content as View
                    } else if (target == ActionTarget.Component && delta.content.contentType == ContentType.SingleComponent) {
                        for (let componentIdx in delta.components) {
                            state.components[componentId] = delta.components[componentIdx]
                        }
                    } else if (delta.content.contentType == ContentType.SingleComponent) {
                        const singleComponent = delta.content as SingleComponent
                        state.view = {
                            contentType: ContentType.View,
                            header: {
                                componentIds: [],
                                cssClasses: undefined
                            },
                            left: {
                                componentIds: [],
                                cssClasses: undefined
                            },
                            main: {
                                componentIds: [singleComponent.componentId],
                                cssClasses: undefined
                            },
                            right: {
                                componentIds: [],
                                cssClasses: undefined
                            },
                            footer: {
                                componentIds: [],
                                cssClasses: undefined
                            }
                        }
                    }
                    for (let componentId in delta.components) {
                        state.components[componentId] = delta.components[componentId]
                    }
                }

                this.upstream.next(state)
            })
    }

}

