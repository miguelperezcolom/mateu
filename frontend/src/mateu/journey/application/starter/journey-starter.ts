import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import '@vaadin/button'
import '@vaadin/horizontal-layout'
import './step/journey-step'
import {notificationRenderer} from 'lit-vaadin-helpers';
import Journey from "../../../shared/apiClients/dtos/Journey";
import Step from "../../../shared/apiClients/dtos/Step";
import {mateuApiClient} from "../../../shared/apiClients/MateuApiClient";
import {Subscription} from "rxjs";
import {upstream} from "../../domain/upstream";
import {State} from "../../domain/state";
import {service} from "../../domain/service";
import {ApiController} from "./controllers/ApiController";
import {PreviousAndNextController} from "./controllers/PreviousAndNextController";

@customElement('journey-starter')
export class JourneyStarter extends LitElement {

    //properties
    @property()
    baseUrl = ''
    @property()
    journeyTypeId: string | undefined = undefined;


    //reactive state
    @state()
    loading: boolean = false;
    @state()
    error: boolean | undefined = undefined;
    @state()
    journeyId: string | undefined = undefined;
    @state()
    journey: Journey | undefined = undefined;
    @state()
    stepId: string | undefined = undefined;
    @state()
    previousStepId: string | undefined = undefined;
    @state()
    step: Step | undefined = undefined;
    @state()
    completed: boolean = false;
    @state()
    version = ''
    @state()
    notificationOpened: boolean = false;
    @state()
    notificationMessage: string = '';



    // upstream channel
    private upstreamSubscription: Subscription | undefined;

    apiController = new ApiController(this);
    previousAndNextController = new PreviousAndNextController(this);

    renderNotification = () => html`${this.notificationMessage}`;

    runAction(event: CustomEvent) {
        service.runAction(event.detail.actionId, event.detail.data).then()
    }

    goBack() {
        service.goBack().then()
    }


    async connectedCallback() {
        super.connectedCallback();

        this.upstreamSubscription = upstream.subscribe((state: State) =>
            this.stampState(state)
        )

    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe();
    }

    // write state to reactive properties
    stampState(state: State) {
        this.error = state.error
        this.journeyId = state.journeyId
        this.journey = state.journey
        this.step = state.step
        this.stepId = state.stepId
        this.previousStepId = state.previousStepId
        this.completed = state.completed
        this.version = state.version
        this.notificationOpened = state.notificationOpened
        this.notificationMessage = state.notificationMessage
        this.journeyTypeId = state.journeyTypeId
    }

    async updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has("baseUrl") || changedProperties.has("journeyTypeId")) {
                setTimeout(() => {
                    if (this.baseUrl && this.journeyTypeId) {
                    console.log('starting journey due to props change', this.baseUrl, this.journeyTypeId, changedProperties)
                    mateuApiClient.baseUrl = this.baseUrl
                    mateuApiClient.element = this
                    service.startJourney(this.baseUrl, this.journeyTypeId).then()
                    }
                })
        }
    }





    async cancelAll() {
        await mateuApiClient.abortAll();
    }

    render() {
        return html`

            <div class="lds_container" style="display: ${this.loading?'':'none'};" @click="${(e: Event) => {
                e.preventDefault()
            }}">
                <div class="lds-roller" style="display: ${this.loading?'':'none'};"  @click=${this.cancelAll}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            </div>
            
            ${!this.journeyTypeId?html`

                <p>No journey type defined</p>
                
                `:''}
            
            ${this.journey?.status == 'Finished'?html`
                
                <h1>Application created</h1>
                <h2><a href="">Go to application list</a></h2>
                
            `:html`
                
                ${this.step?html`
                
                        <journey-step
                                id="step"
                                journeyTypeId="${this.journeyTypeId}"
                                journeyId="${this.journeyId}" 
                                       stepId="${this.stepId}" 
                                       .step=${this.step} 
                                       baseUrl="${this.baseUrl}"
                                version="${this.version}"
                                @runaction="${this.runAction}"
                                @back-requested="${this.goBack}"
                        >
                        </journey-step>

                    `:html`
                <p>No step</p>
            `}
            `}
                
            <vaadin-notification
                    .opened=${this.notificationOpened}
                    position="bottom-end"
                    duration="10000"
                    theme="error"
                    ${notificationRenderer(this.renderNotification)}
            >${this.notificationMessage}</vaadin-notification>
            
        <slot></slot>`
    }

    static styles = css`
    :host {
        width: clamp(45ch, 100%, 1400px);
    }
    
    .card-journey-type {
        padding-left: 20px;
        padding-right: 20px;
        margin-bottom: 10px;
        border: 1px solid lightgrey;
        border-radius: 7px;
    }
    
    .cancel-all {
        margin: auto;
        position: absolute;
        left: calc(50% - 17px);
        top: calc(50% + 40px);
    }
    
    .lds_container {
        position:absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        /*
        opacity: 50%;
        background-color: white;
        */
        z-index: 99;
    }
    
.lds-roller {
  display: inline-block;
  width: 80px;
  height: 80px;
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1000;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
.lds-roller div {
  animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  transform-origin: 40px 40px;
}
.lds-roller div:after {
  content: " ";
  display: block;
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fcf;
  margin: -4px 0 0 -4px;
}
.lds-roller div:nth-child(1) {
  animation-delay: -0.036s;
}
.lds-roller div:nth-child(1):after {
  top: 63px;
  left: 63px;
}
.lds-roller div:nth-child(2) {
  animation-delay: -0.072s;
}
.lds-roller div:nth-child(2):after {
  top: 68px;
  left: 56px;
}
.lds-roller div:nth-child(3) {
  animation-delay: -0.108s;
}
.lds-roller div:nth-child(3):after {
  top: 71px;
  left: 48px;
}
.lds-roller div:nth-child(4) {
  animation-delay: -0.144s;
}
.lds-roller div:nth-child(4):after {
  top: 72px;
  left: 40px;
}
.lds-roller div:nth-child(5) {
  animation-delay: -0.18s;
}
.lds-roller div:nth-child(5):after {
  top: 71px;
  left: 32px;
}
.lds-roller div:nth-child(6) {
  animation-delay: -0.216s;
}
.lds-roller div:nth-child(6):after {
  top: 68px;
  left: 24px;
}
.lds-roller div:nth-child(7) {
  animation-delay: -0.252s;
}
.lds-roller div:nth-child(7):after {
  top: 63px;
  left: 17px;
}
.lds-roller div:nth-child(8) {
  animation-delay: -0.288s;
}
.lds-roller div:nth-child(8):after {
  top: 56px;
  left: 12px;
}
@keyframes lds-roller {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}



  `
}

declare global {
    interface HTMLElementTagNameMap {
        'journey-starter': JourneyStarter
    }
}

