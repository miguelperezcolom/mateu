import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import '@vaadin/button'
import '@vaadin/horizontal-layout'
import './step/journey-step'
import {notificationRenderer} from 'lit-vaadin-helpers';
import Journey from "../../../shared/apiClients/dtos/Journey";
import Step from "../../../shared/apiClients/dtos/Step";
import {mateuApiClient} from "../../../shared/apiClients/MateuApiClient";
import {Subject, Subscription} from "rxjs";
import {State} from "../../domain/state";
import {ApiController} from "./controllers/ApiController";
import {PreviousAndNextController} from "./controllers/PreviousAndNextController";
import Action from "../../../shared/apiClients/dtos/Action";
import {ActionTarget} from "../../../shared/apiClients/dtos/ActionTarget";
import {DialogOpenedChangedEvent} from "@vaadin/dialog";
import {dialogHeaderRenderer, dialogRenderer} from "@vaadin/dialog/lit";
import {Service} from "../../domain/service";
import {nanoid} from "nanoid";

@customElement('journey-starter')
export class JourneyStarter extends LitElement {

    //properties
    @property()
    baseUrl = ''
    @property()
    uiId: string | undefined = undefined;
    @property()
    journeyTypeId: string | undefined = undefined;
    @property()
    journeyId: string | undefined = undefined;
    @property()
    stepId: string | undefined = undefined;
    @property()
    instant: string | undefined = undefined;
    @property()
    label: string | undefined = undefined;
    @property()
    actionId: string | undefined = undefined;
    @property()
    actionData: unknown | undefined = undefined;
    @property()
    parentStepId: string | undefined = undefined;
    @property()
    initialStepId: string | undefined = undefined;

    //reactive state
    @state()
    modalStepId: string | undefined = undefined;
    @state()
    modalActionId: string | undefined = undefined;
    @state()
    modalActionData: unknown | undefined = undefined;
    @state()
    modalInstant: string | undefined = undefined;
    @state()
    modalStyle: string | undefined = undefined;
    @state()
    loading: boolean = false;
    @state()
    error: boolean | undefined = undefined;
    @state()
    journey: Journey | undefined = undefined;
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

    upstream = new Subject<State>()
    apiController = new ApiController(this)
    previousAndNextController: PreviousAndNextController
    service: Service

    constructor() {
        super();
        this.service = new Service(this.upstream)
        this.previousAndNextController = new PreviousAndNextController(this, this.service);
    }

    renderNotification = () => html`${this.notificationMessage}`;

    runAction(event: CustomEvent) {
        const action: Action = event.detail.action
        if (action && ActionTarget.NewTab == action.target) {
            const newWindow = window.open();
            newWindow?.document.write('Hola!');
        } else if (action && ActionTarget.NewWindow == action.target) {
            const newWindow = window.open('', 'A window', 'width=800,height=400,screenX=200,screenY=200');
            newWindow?.document.write('Hola!');
        } else if (action && ActionTarget.NewModal == action.target) {
            // crear modal y meter un journey-starter dentro
            this.modalOpened = true
            this.modalStepId = this.stepId
            this.modalActionId = event.detail.actionId
            this.modalActionData = event.detail.data
            this.modalInstant = nanoid()
            this.modalStyle = action.modalStyle
        } else {
            this.service.runAction(event.detail.actionId, event.detail.data).then()
        }
    }

    goBack() {
        this.service.goBack(this.journeyId!).then()
    }


    async connectedCallback() {
        super.connectedCallback();

        this.upstreamSubscription = this.upstream.subscribe((state: State) =>
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
        this.uiId = state.uiId
        this.journeyTypeId = state.journeyTypeId
    }

    async updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has("baseUrl")
            || changedProperties.has("journeyTypeId")
            || changedProperties.has("instant")
        ) {
            console.log('changedProperties', changedProperties)
                setTimeout(async () => {
                    if (this.baseUrl && this.journeyTypeId) {
                        mateuApiClient.baseUrl = this.baseUrl
                        mateuApiClient.element = this
                        if (this.actionId) {
                            console.log('running action as prop is set', this.baseUrl, this.journeyTypeId, this.journeyId, this.stepId, this.actionId, this.actionData, changedProperties)
                            this.service.state.uiId = this.uiId
                            this.service.state.journeyTypeId = this.journeyTypeId
                            this.service.state.journeyId = this.journeyId
                            this.service.state.baseUrl = this.baseUrl
                            this.service.state.stepId = this.initialStepId
                            console.log('this.service.state', this.service.state, this, this.initialStepId)
                            await this.service.runAction(this.actionId, this.actionData)
                        } else {
                            console.log('starting journey due to props change', this.baseUrl, this.journeyTypeId, changedProperties)
                            mateuApiClient.abortAll();
                            document.title = this.label??''
                            var url = '#' + this.journeyTypeId
                            if ('____home____' == this.journeyTypeId) {
                                url = ''
                            }
                            window.history.pushState({},"", url);
                            await this.service.startJourney(this.baseUrl, this.uiId!, this.journeyTypeId)
                        }
                    }
                })
        }
    }

    async cancelAll() {
        await mateuApiClient.abortAll();
    }

    @state()
    modalOpened = false

    async closeModal() {
        this.modalOpened = false
        await this.service.goToStep(this.stepId!)
    }


    async _goBack() {
        this.dispatchEvent(new CustomEvent('back-requested', {
            bubbles: true,
            composed: true}))
    }

    async goNext() {
        this.dispatchEvent(new CustomEvent('next-requested', {
            bubbles: true,
            composed: true,
            detail: {
                journeyTypeId: this.journeyTypeId,
                journeyId: this.journeyId,
                stepId: this.stepId,
                __listId: '__list__main__edit',
                __index: this.step?.data.__index! + 1,
                __count: this.step?.data.__count,
                previousStepId: this.previousStepId
            }}))
    }

    async goPrevious() {
        this.dispatchEvent(new CustomEvent('previous-requested', {
            bubbles: true,
            composed: true,
            detail: {
                journeyTypeId: this.journeyTypeId,
                journeyId: this.journeyId,
                stepId: this.stepId,
                __listId: '__list__main__edit',
                __index: this.step?.data.__index! - 1,
                __count: this.step?.data.__count,
                previousStepId: this.previousStepId
            }}))
    }

    renderModal() {
        return html`
            <div style="${this.modalStyle}">
            <journey-starter
                    uiId="${this.uiId}"
                    journeyTypeId="${this.journeyTypeId}"
                    journeyId="${this.journeyId}"
                    stepId="${this.modalStepId}"
                    baseUrl="${this.baseUrl}"
                    instant="${this.modalInstant}"
                    actionId="${this.modalActionId}"
                    .actionData=${this.modalActionData}
                    parentStepId="${this.stepId}"
                    initialStepId="${this.stepId}"
            >
            </div>
   
        `
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
                                uiId="${this.uiId}"
                                journeyTypeId="${this.journeyTypeId}"
                                journeyId="${this.journeyId}" 
                                       stepId="${this.stepId}" 
                                       .step=${this.step} 
                                       baseUrl="${this.baseUrl}"
                                initialStepId="${this.initialStepId}"
                                version="${this.version}"
                                .service=${this.service}
                                @runaction="${this.runAction}"
                                @back-requested="${this.goBack}"
                        >
                            ${this.step?.previousStepId || this.step?.data?.__index || this.step?.data?.__count?html`
                <vaadin-horizontal-layout theme="spacing">
                      ${this.step?.previousStepId && this.step?.previousStepId != this.initialStepId?html`
                          ${this.step?.data?.__index?html``:html`
                              <vaadin-button theme="tertiary" @click=${this.goBack}>Back</vaadin-button>
                          `}
                      `:''}
                      ${this.step?.id != 'list' && this.step?.data?.__index != undefined && this.step?.data?.__count && this.step?.data?.__count > 0?html`

                          <vaadin-button theme="tertiary" @click=${this.goPrevious} ?disabled=${this.step?.data?.__index == 0}>Previous</vaadin-button>
                          <vaadin-button theme="tertiary" @click=${this.goNext} ?disabled=${this.step?.data?.__index >= this.step?.data?.__count - 1}>Next</vaadin-button>

                      `:''}                    
                </vaadin-horizontal-layout>
`:''}
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


            <vaadin-dialog
                    header-title="User details"
                    .opened="${this.modalOpened}"
                    resizable
                    draggable
                    @opened-changed="${async (event: DialogOpenedChangedEvent) => {
                        if (!event.detail.value && this.modalOpened && this.stepId) {
                            this.closeModal()
                        }
                    }}"
                    ${dialogHeaderRenderer(
                            () => html`
      <vaadin-button theme="tertiary" @click="${this.closeModal}">
        <vaadin-icon icon="lumo:cross"></vaadin-icon>
      </vaadin-button>
    `,
                            []
                    )}
                    ${dialogRenderer(this.renderModal, [])}
            ></vaadin-dialog>
            
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

