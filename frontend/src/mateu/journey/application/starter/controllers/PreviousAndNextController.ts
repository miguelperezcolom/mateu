import {ReactiveController} from "lit";
import {JourneyStarter} from "../journey-starter";
import {Service} from "../../../domain/service";

export class PreviousAndNextController implements ReactiveController {

    host: JourneyStarter
    service: Service

    constructor(host: JourneyStarter, service: Service) {
        (this.host = host).addController(this)
        this.service = service
    }

    hostConnected() {
        this.host.addEventListener('next-requested', this.onNextRequested)
        this.host.addEventListener('previous-requested', this.onPreviousRequested)
        //this.host.requestUpdate();
    }
    hostDisconnected() {
        this.host.removeEventListener('next-requested', this.onNextRequested)
        this.host.removeEventListener('previous-requested', this.onPreviousRequested)
    }

    onNextRequested = async (event: Event) => {
        const ce = event as CustomEvent
        const data = {
            __listId: ce.detail.__listId,
            __index: ce.detail.__index,
            __count: ce.detail.__count
        }
        this.service.goToIndex(data)
    }

    onPreviousRequested = async (event: Event) => {
        const ce = event as CustomEvent
        const data = {
            __listId: ce.detail.__listId,
            __index: ce.detail.__index,
            __count: ce.detail.__count
        }
        this.service.goToIndex(data)
    }


}