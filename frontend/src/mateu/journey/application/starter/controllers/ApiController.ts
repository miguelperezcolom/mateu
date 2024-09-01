import {ReactiveController} from 'lit';
import {JourneyStarter} from "../journey-starter";
import {ResultType} from "../../../../shared/apiClients/dtos/ResultType";

export class ApiController implements ReactiveController {

    host: JourneyStarter;

    // non reactive state
    activeCalls = 0;

    constructor(host: JourneyStarter) {
        (this.host = host).addController(this);
        this.activeCalls = 0;
    }

    hostConnected() {
        this.host.addEventListener('backend-called-event', this.onBackendCalled)
        this.host.addEventListener('backend-succeeded-event', this.onBackendSucceeded)
        this.host.addEventListener('backend-cancelled-event', this.onBackendCancelled)
        this.host.addEventListener('backend-failed-event', this.onBackendFailed)
        //this.host.requestUpdate();
    }
    hostDisconnected() {
        this.host.removeEventListener('backend-called-event', this.onBackendCalled)
        this.host.removeEventListener('backend-succeeded-event', this.onBackendSucceeded)
        this.host.removeEventListener('backend-cancelled-event', this.onBackendCancelled)
        this.host.removeEventListener('backend-failed-event', this.onBackendFailed)
    }

    onBackendCalled = () => {
        //console.log('backend called')
        if (this.activeCalls < 0) {
            this.activeCalls = 0
        }
        this.activeCalls++;
        this.host.loading = this.activeCalls > 0
    }

    onBackendSucceeded = () => {
        //console.log('backend succeed')
        this.activeCalls--;
        if (this.activeCalls < 0) {
            this.activeCalls = 0
        }
        this.host.loading = this.activeCalls > 0
    }

    onBackendCancelled = () => {
        console.log('backend cancelled')
        this.activeCalls--;
        if (this.activeCalls < 0) {
            this.activeCalls = 0
        }
        this.host.loading = this.activeCalls > 0
    }

    onBackendFailed = (event: Event) => {
        console.log('backend failed', event, (event as CustomEvent).detail.reason.response?.data)
        this.activeCalls--;
        if (this.activeCalls < 0) {
            this.activeCalls = 0
        }
        this.host.loading = this.activeCalls > 0
        const ce = event as CustomEvent
        let title = `${ce.detail.reason}`;
        let detail = '';
        if (ce.detail.reason.code || ce.detail.reason.message) {
            title = `${ce.detail.reason.code} ${ce.detail.reason.message}`;
        }
        if (ce.detail.reason.response?.data) {
            title = `${ce.detail.reason.response.data}`
        }
        if (!title.startsWith('Unknown action')) {
            this.host.showMessage({
                type: ResultType.Error,
                title: title,
                text: detail,
                duration: 5000
            })
        }
    }

}