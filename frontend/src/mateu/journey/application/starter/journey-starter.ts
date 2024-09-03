import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import '@vaadin/button'
import '@vaadin/horizontal-layout'
import {mateuApiClient} from "../../../shared/apiClients/MateuApiClient";
import {Subject, Subscription} from "rxjs";
import {State} from "../../domain/state";
import {ApiController} from "./controllers/ApiController";
import Action from "../../../shared/apiClients/dtos/Action";
import {ActionTarget} from "../../../shared/apiClients/dtos/ActionTarget";
import {DialogOpenedChangedEvent} from "@vaadin/dialog";
import {dialogHeaderRenderer, dialogRenderer} from "@vaadin/dialog/lit";
import {Service} from "../../domain/service";
import {nanoid} from "nanoid";
import UICommand from "../../../shared/apiClients/dtos/UICommand";
import {UICommandType} from "../../../shared/apiClients/dtos/UICommandType";
import Message from "../../../shared/apiClients/dtos/Message";
import { Notification } from '@vaadin/notification';
import View from "../../../shared/apiClients/dtos/View";
import Component from "../../../shared/apiClients/dtos/Component";
import './view/mateu-view'
import UIIncrement from "../../../shared/apiClients/dtos/UIIncrement";
import {ContentType} from "../../../shared/apiClients/dtos/ContentType";
import {SingleComponent} from "../../../shared/apiClients/dtos/SingleComponent";
    import {Content} from "../../../shared/apiClients/dtos/Content";

@customElement('journey-starter')
export class JourneyStarter extends LitElement {

    //properties (reactive)
    @property()
    baseUrl = ''
    @property()
    uiId: string | undefined = undefined;
    @property()
    journeyTypeId: string | undefined = undefined;
    @property()
    journeyId: string | undefined = undefined;
    @property()
    instant: string | undefined = undefined;
    @property()
    inModal: boolean | undefined = undefined;
    @property()
    contextData: string | undefined = undefined;
    @property()
    initialUiIncrement: UIIncrement | undefined = undefined;

    //reactive state (not properties)
    @state()
    modalStepId: string | undefined = undefined;
    @state()
    modalInstant: string | undefined = undefined;
    @state()
    modalStyle: string | undefined = undefined;
    @state()
    modalClass: string | undefined = undefined
    @state()
    modalInitialUiIncrement: UIIncrement | undefined

    @state()
    loading: boolean = false;
    @state()
    error: boolean | undefined = undefined;
    @state()
    view: View | undefined = undefined;
    @state()
    content: Content | undefined = undefined;
    @state()
    components: Record<string, Component> = {};


    // upstream channel
    private upstreamSubscription: Subscription | undefined;

    upstream = new Subject<State>()
    apiController = new ApiController(this)
    service: Service

    constructor() {
        super();
        this.service = new Service(this.upstream)
    }

    runAction(event: CustomEvent) {
        const action: Action = event.detail.action
        this.service.runAction(
            this.baseUrl,
            this.uiId!,
            this.journeyTypeId!,
            this.journeyId!,
            'notInUse',
            event.detail.componentId,
            event.detail.actionId,
            action.target,
            action.modalStyle,
            event.detail.componentType,
            event.detail.data
        ).then()
    }

    replaceComponent(event: CustomEvent) {
        const target = event.detail.target
        const replacement = event.detail.replacement
        replacement.id = target.id
        this.components[target.id] = replacement


        const state = new State()
        state.modalStyle = this.modalStyle
        state.target = ActionTarget.View
        state.commands = []
        state.messages = []
        state.view = this.view
        state.content = this.content
        this.upstream.next(state)
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


        // run commands
        state.commands.forEach(c => this.runCommand(c))
        state.commands = []

        // show messages
        state.messages.forEach(c => this.showMessage(c))
        state.messages = []


        if (ActionTarget.NewTab == state.target) {
            const newWindow = window.open();
            newWindow?.document.write(`${this.renderModal()}`);
        } else if (ActionTarget.NewWindow == state.target) {
            const newWindow = window.open('', 'A window', 'width=800,height=400,screenX=200,screenY=200');
            newWindow?.document.write(`${this.renderModal()}`);
        } else if (ActionTarget.NewModal == state.target) {
            // crear modal y meter un journey-starter dentro
            this.modalOpened = true
            this.modalInstant = nanoid()
            this.modalInitialUiIncrement = {
                messages: state.messages,
                commands: state.commands,
                content: state.content!,
                components: state.components
            }
            this.modalStyle = state.modalStyle
            this.modalClass = ''
            setTimeout(() => {
                const overlay = document.querySelector('vaadin-dialog-overlay')?.shadowRoot?.querySelector('#overlay');

                overlay?.setAttribute('class', '')
                overlay?.setAttribute('style',  this.modalStyle?this.modalStyle:'')
            });
        } else if (ActionTarget.LeftDrawer == state.target) {
            // crear modal y meter un journey-starter dentro
            this.modalOpened = true
            this.modalInstant = nanoid()
            this.modalInitialUiIncrement = {
                messages: state.messages,
                commands: state.commands,
                content: state.content!,
                components: state.components
            }
            this.modalStyle = state.modalStyle
            this.modalClass = 'modal-left'
            setTimeout(() => {
                const overlay = document.querySelector('vaadin-dialog-overlay')?.shadowRoot?.querySelector('#overlay');
                console.log(overlay)
                overlay?.setAttribute('class', 'modal-left')
                overlay?.setAttribute('style', 'left:0;position:absolute;height:100vh;max-height:unset;max-width:unset;margin-left:-15px;border-top-left-radius:0px;border-bottom-left-radius:0px;' + (this.modalStyle?this.modalStyle:''))
            });
        } else if (ActionTarget.RightDrawer == state.target) {
            // crear modal y meter un journey-starter dentro
            this.modalOpened = true
            this.modalInstant = nanoid()
            this.modalInitialUiIncrement = {
                messages: state.messages,
                commands: state.commands,
                content: state.content!,
                components: state.components
            }
            this.modalStyle = state.modalStyle
            this.modalClass = 'modal-right'
            setTimeout(() => {
                const overlay = document.querySelector('vaadin-dialog-overlay')?.shadowRoot?.querySelector('#overlay');
                console.log(overlay)
                overlay?.setAttribute('class', 'modal-right')
                overlay?.setAttribute('style', 'right:0;position:absolute;height:100vh;max-height:unset;max-width:unset;;margin-right:-15px;border-top-right-radius:0px;border-bottom-right-radius:0px;' + (this.modalStyle ? this.modalStyle : ''))
            });
        } else {
            if (state.content) {
                this.content = state.content
            }
            if (state.view) {
                this.view = state.view
            }
            if (state.components) {
                for (let componentId in state.components) {
                    this.components[componentId] = state.components[componentId]
                }
            }
            this.error = state.error
            this.requestUpdate('view')
        }
    }

    private runCommand(c: UICommand) {
        try {
            switch (c.type) {
                case UICommandType.SetWindowTitle:
                    // @ts-ignore
                    document.title = c.data
                    return
                case UICommandType.UpdateUrl:
                    // @ts-ignore
                    var url = '#' + c.data.url
                    if ('____home____' == this.journeyTypeId) {
                        url = ''
                    }
                    window.history.pushState({},"", url)
                    return
                case UICommandType.CloseModal:
                    this.closeModalAndStay(c.data as UIIncrement)
                    return
                case UICommandType.SetLocation:
                    // @ts-ignore
                    window.location = c.data
                    return
                case UICommandType.ReplaceWithUrl:
                    window.close()
                    // @ts-ignore
                    window.open(c.data, 'A window', 'width=800,height=400,screenX=200,screenY=200')
                    return
                case UICommandType.OpenNewTab:
                    // @ts-ignore
                    window.open(c.data, '_blank')
                    return
                case UICommandType.OpenNewWindow:
                    // @ts-ignore
                    window.open(c.data, 'A window', 'width=800,height=400,screenX=200,screenY=200')
                    return
                case UICommandType.ReplaceJourney:
                    this.replaceJourney(c.data as JourneyStarter)
                    return

            }
        } catch (e) {
            console.error(e)
        }
    }

    public showMessage(c: Message) {

        const closer = {
            notification: Notification,
            close: Function
        }

        const renderer = () => html`
  <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
    <div>${c.title}
      ${c.text?html`
          <p>${c.text}</p>
      `:''}
    </div>
    <vaadin-button theme="tertiary-inline" @click="${() => closer.close()}" aria-label="Close">
      <vaadin-icon icon="lumo:cross"></vaadin-icon>
    </vaadin-button>
  </vaadin-horizontal-layout>
`

        const notification = Notification.show(renderer(), {
            position: 'middle',
            duration: c.duration,
            theme: this.getThemeForMessageType(c.type),
        });
        // @ts-ignore
        closer.notification = notification
        // @ts-ignore
        closer.close = () => {
            notification.close();
        }

    }

    private getThemeForMessageType(type: string): string {
        switch (type) {
            case 'Success': return 'success';
            case 'Warning': return 'contrast';
            case 'Error': return 'error';
            case 'Info': return 'primary';
        }
        return '';
    }


    async updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has("initialUiIncrement")) {
            //todo: código duplicado en service.ts. Mover
            if (this.initialUiIncrement) {
                const delta = this.initialUiIncrement!

                const state = new State()
                state.commands = delta.commands
                state.messages = delta.messages

                // send new state upstream
                if (delta.content) {
                    state.content = delta.content
                    if (delta.content.contentType == ContentType.View) {
                        state.view = delta.content as View
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
                this.stampState(state)
            }
        } else if (changedProperties.has("baseUrl")
            || changedProperties.has("journeyTypeId")
            || changedProperties.has("instant")
        ) {
                setTimeout(async () => {
                    if (this.baseUrl && this.journeyTypeId) {
                        mateuApiClient.baseUrl = this.baseUrl
                        try {
                            mateuApiClient.contextData = this.contextData?JSON.parse(this.contextData):{}
                        } catch (e) {
                            console.log('error when parsing context data', e)
                        }
                        mateuApiClient.element = this

                        mateuApiClient.abortAll();
                        var url = '#' + this.journeyTypeId
                        if ('____home____' == this.journeyTypeId) {
                            url = ''
                        }
                        window.history.pushState({},"", url);
                        this.journeyId = nanoid()
                        await this.service.startJourney(this.baseUrl, this.uiId!, this.journeyTypeId!, this.journeyId)
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
    }

    closeModalAndStay(uiIncrement: UIIncrement) {
        this.dispatchEvent(new CustomEvent('this.dispatchEvent(new CustomEvent(\'replace-journey\', {\n' +
            '            bubbles: true,\n' +
            '            composed: true,\n' +
            '            detail: {\n' +
            '                journeyStarter\n' +
            '            }}))', {
            bubbles: true,
            composed: true,
            detail: {
                uiIncrement
            }}))
    }

    replaceJourney(journeyStarter: JourneyStarter) {
        this.dispatchEvent(new CustomEvent('replace-journey', {
            bubbles: true,
            composed: true,
            detail: {
                journeyStarter
            }}))
    }


    renderModal() {
        return html`
            <journey-starter
                    uiId="${this.uiId}"
                    journeyTypeId="${this.journeyTypeId}"
                    journeyId="${this.journeyId}"
                    stepId="${this.modalStepId}"
                    baseUrl="${this.baseUrl}"
                    instant="${this.modalInstant}"
                    .initialUiIncrement="${this.modalInitialUiIncrement}"
                    .parent="${this}"
                    inModal="true"
                    @close-modal="${async (event: any) => {
                        if (this.modalOpened) {
                            this.modalOpened = false
                            this.initialUiIncrement = event.detail.uiIncrement
                        } else {
                            console.log('NOT closing modal')
                        }
                    }}"
            >
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
            
                
                ${this.view?html`
                    <mateu-view 
                .view=${this.view}
                .components=${this.components}
                uiId="${this.uiId}"
                journeyTypeId="${this.journeyTypeId}"
                journeyId="${this.journeyId}" 
                .service=${this.service}
                baseUrl="${this.baseUrl}"
                stepId="none"
                @runaction="${this.runAction}"
                @replace-component="${this.replaceComponent}"
                instant="${nanoid()}"
        ><slot></slot></mateu-view>
                    `:html`
                <!--<p>No step</p>-->
            `}

            <vaadin-dialog
                    header-title=" "
                    .opened="${this.modalOpened}"
                    class="${this.modalClass}"
                    resizable
                    draggable
                    @opened-changed="${async (event: DialogOpenedChangedEvent) => {
                        if (!event.detail.value && this.modalOpened) {
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
            >
            </vaadin-dialog>
            
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

