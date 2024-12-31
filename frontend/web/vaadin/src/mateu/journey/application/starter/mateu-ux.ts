import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import '@vaadin/button'
import '@vaadin/horizontal-layout'
import {MateuApiClient} from "../../../shared/apiClients/MateuApiClient";
import {Subject, Subscription} from "rxjs";
import {ApiController} from "./controllers/ApiController";
import {ActionTarget} from "../../../shared/apiClients/dtos/ActionTarget";
import {DialogOpenedChangedEvent} from "@vaadin/dialog";
import {dialogHeaderRenderer, dialogRenderer} from "@vaadin/dialog/lit";
import {Service} from "../../domain/service";
import {nanoid} from "nanoid";
import UICommand from "../../../shared/apiClients/dtos/UICommand";
import {UICommandType} from "../../../shared/apiClients/dtos/UICommandType";
import Message from "../../../shared/apiClients/dtos/Message";
import {Notification} from '@vaadin/notification';
import View from "../../../shared/apiClients/dtos/View";
import Component from "../../../shared/apiClients/dtos/Component";
import './view/mateu-view'
import UIIncrement from "../../../shared/apiClients/dtos/UIIncrement";
import {ContentType} from "../../../shared/apiClients/dtos/ContentType";
import {SingleComponent} from "../../../shared/apiClients/dtos/SingleComponent";
import {UIFragment} from "../../../shared/apiClients/dtos/UIFragment";

@customElement('mateu-ux')
export class MateuUx extends LitElement {

    //properties (reactive)
    @property()
    baseUrl = ''
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
    initialUiIncrement: UIFragment | undefined = undefined;
    @property()
    main: boolean = false

    //reactive state (not properties)
    @state()
    modalStepId: string | undefined = undefined;
    @state()
    modalInstant: string | undefined = undefined;
    @state()
    modalTitle: string | undefined = undefined;
    @state()
    modalStyle: string | undefined = undefined;
    @state()
    modalClass: string | undefined = undefined
    @state()
    modalInitialUiIncrement: UIFragment | undefined

    @state()
    loading: boolean = false;
    @state()
    error: boolean | undefined = undefined;
    @state()
    loadFailed: unknown;
    @state()
    view: View | undefined = undefined;
    @state()
    components: Record<string, Component> = {};


    // upstream channel
    private upstreamSubscription: Subscription | undefined;

    upstream = new Subject<UIIncrement>()
    apiController = new ApiController(this)
    service: Service
    mateuApiClient = new MateuApiClient(this)

    constructor() {
        super();
        this.service = new Service(this.upstream)
    }

    runAction(event: CustomEvent) {
        event.preventDefault()
        event.stopPropagation()
        this.service.runAction(
            this.mateuApiClient,
            this.baseUrl,
            this.journeyTypeId!,
            this.journeyId!,
            'notInUse',
            event.detail.componentId,
            event.detail.actionId,
            event.detail.componentType,
            event.detail.data
        ).then()
    }

    replaceComponent(event: CustomEvent) {
        event.preventDefault()
        event.stopPropagation()

        const target = event.detail.target
        const replacement = event.detail.replacement
        replacement.id = target.id
        const components: Record<string, Component> = {}
        components[target.id] = replacement

        const state:UIIncrement = {
            commands: [],
            messages: [],
            uiFragments: [
                {
                    target: ActionTarget.Component,
                    targetId: target.id,
                    modalStyle: undefined,
                    modalTitle: undefined,
                    content: replacement,
                    components: components
                }
            ] as UIFragment[]
        }
        this.upstream.next(state)
    }


    async connectedCallback() {
        super.connectedCallback();

        this.upstreamSubscription = this.upstream.subscribe((delta: UIIncrement) =>
            this.stampState(delta )
        )

    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe();
    }

    // write state to reactive properties
    stampState(delta: UIIncrement) {

        // run commands
        delta.commands?.forEach(c => this.runCommand(c))

        // show messages
        delta.messages?.forEach(c => this.showMessage(c))

        // apply ui fragments
        delta.uiFragments?.forEach(f => {

            if (ActionTarget.NewTab == f.target) {
                const newWindow = window.open();
                newWindow?.document.write(`${this.renderModal()}`);
            } else if (ActionTarget.NewWindow == f.target) {
                const newWindow = window.open('', 'A window', 'width=800,height=400,screenX=200,screenY=200');
                newWindow?.document.write(`${this.renderModal()}`);
            } else if (ActionTarget.NewModal == f.target) {
                // crear modal y meter un mateu-ux dentro
                this.modalOpened = true
                this.modalInstant = nanoid()
                this.modalInitialUiIncrement = {
                    modalStyle: undefined,
                    modalTitle: undefined,
                    content: f.content,
                    targetId: '',
                    target: ActionTarget.View,
                    components: f.components
                }
                this.modalStyle = f.modalStyle
                this.modalTitle = f.modalTitle
                this.modalClass = ''
                setTimeout(() => {
                    const overlay = document.querySelector('vaadin-dialog-overlay')?.shadowRoot?.querySelector('#overlay');

                    overlay?.setAttribute('class', '')
                    overlay?.setAttribute('style',  this.modalStyle?this.modalStyle:'')
                });
            } else if (ActionTarget.LeftDrawer == f.target) {
                // crear modal y meter un mateu-ux dentro
                this.modalOpened = true
                this.modalInstant = nanoid()
                this.modalInitialUiIncrement = {
                    modalStyle: undefined,
                    modalTitle: undefined,
                    content: f.content,
                    targetId: '',
                    target: ActionTarget.View,
                    components: f.components
                }
                this.modalStyle = f.modalStyle
                this.modalTitle = f.modalTitle
                this.modalClass = 'modal-left'
                setTimeout(() => {
                    const overlay = document.querySelector('vaadin-dialog-overlay')?.shadowRoot?.querySelector('#overlay');
                    overlay?.setAttribute('class', 'modal-left')
                    overlay?.setAttribute('style', 'left:0;position:absolute;height:100vh;max-height:unset;max-width:unset;margin-left:-15px;border-top-left-radius:0px;border-bottom-left-radius:0px;' + (this.modalStyle?this.modalStyle:''))
                });
            } else if (ActionTarget.RightDrawer == f.target) {
                // crear modal y meter un mateu-ux dentro
                this.modalOpened = true
                this.modalInstant = nanoid()
                this.modalInitialUiIncrement = {
                    modalStyle: undefined,
                    modalTitle: undefined,
                    content: f.content,
                    targetId: '',
                    target: ActionTarget.View,
                    components: f.components
                }
                this.modalStyle = f.modalStyle
                this.modalTitle = f.modalTitle
                this.modalClass = 'modal-right'
                setTimeout(() => {
                    const overlay = document.querySelector('vaadin-dialog-overlay')?.shadowRoot?.querySelector('#overlay');
                    overlay?.setAttribute('class', 'modal-right')
                    overlay?.setAttribute('style', 'right:0;position:absolute;height:100vh;max-height:unset;max-width:unset;;margin-right:-15px;border-top-right-radius:0px;border-bottom-right-radius:0px;' + (this.modalStyle ? this.modalStyle : ''))
                });
            } else {
                this.stampFragment(f)
                this.requestUpdate('view')
            }

        })

    }

    stampFragment(f: UIFragment) {
        if (f.content.contentType == ContentType.View) {
            this.view = f.content as View
        } else if (f.target == ActionTarget.Component && f.content.contentType == ContentType.SingleComponent) {
            for (let componentIdx in f.components) {
                this.components[f.targetId] = f.components[componentIdx]
                this.components[f.targetId].id = f.targetId
                this.components = {...this.components}
            }
        } else if (f.content.contentType == ContentType.SingleComponent) {
            const singleComponent = f.content as SingleComponent
            this.view = {
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
        if (f.components) {
            if (!this.components) {
                this.components = {}
            }
            for (let componentId in f.components) {
                this.components[componentId] = f.components[componentId]
            }
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
                    let url = '#' + c.data.url
                    if ('____home____' == this.journeyTypeId) {
                        url = ''
                    }
                    if (this.main) {
                        window.history.pushState({},"", url)
                    }
                    return
                case UICommandType.UpdateUrlFragment:
                    // @ts-ignore
                    let urlFragment = window.location.hash
                    console.log('url', urlFragment, c.data)
                    if (urlFragment.includes('____x')) {
                        urlFragment = urlFragment.substring(0, urlFragment.indexOf('____x'))
                    }
                    urlFragment += '____x' + c.data
                    console.log('url', urlFragment, c.data)
                    if (this.main) {
                        window.history.pushState({},"", urlFragment)
                    }
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
                    this.replaceJourney(c.data as MateuUx)
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
    <vaadin-button theme="tertiary-inline" 
                   @click="${() => closer.close()}" 
                   aria-label="Close"
                   autofocus
    >
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
            if (this.initialUiIncrement) {
                this.stampState({
                    commands: [],
                    messages: [],
                    uiFragments: [this.initialUiIncrement]
                })
            }
        } else if (changedProperties.has("baseUrl")
            || changedProperties.has("journeyTypeId")
            || changedProperties.has("instant")
        ) {
                setTimeout(async () => {
                    if (this.journeyTypeId) {
                        this.mateuApiClient.baseUrl = this.baseUrl
                        try {
                            this.mateuApiClient.contextData = this.contextData?JSON.parse(this.contextData):{}
                        } catch (e) {
                            console.log('error when parsing context data', e)
                        }
                        this.mateuApiClient.element = this

                        this.mateuApiClient.abortAll();

                        // @ts-ignore
                        if (this.main || this.main == 'true') {
                            let url = '#' + this.journeyTypeId
                            if ('____home____' == this.journeyTypeId) {
                                url = ''
                            }
                            if (!window.location.hash.startsWith(url)) {
                                window.history.pushState({},"", url);
                            }
                        }

                        this.journeyId = nanoid()
                        try {
                            await this.service.startJourney(this.mateuApiClient, this.baseUrl, this.journeyTypeId!, this.journeyId)
                            this.error = false
                            this.loadFailed = undefined
                        } catch (e) {
                            this.error = true
                            this.loadFailed = e
                        }
                    }
                })
        }
    }

    async cancelAll() {
        await this.mateuApiClient.abortAll();
    }

    @state()
    modalOpened = false

    async closeModal() {
        this.modalOpened = false
    }

    closeModalAndStay(uiIncrement: UIIncrement) {
        this.dispatchEvent(new CustomEvent('close-modal', {
            bubbles: true,
            composed: true,
            detail: {
                uiIncrement
            }}))
    }

    replaceJourney(journeyStarter: MateuUx) {
        this.dispatchEvent(new CustomEvent('replace-journey', {
            bubbles: true,
            composed: true,
            detail: {
                journeyStarter
            }}))
    }


    renderModal() {
        return html`
            <mateu-ux
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
                            this.initialUiIncrement = event.detail.uiIncrement.uiFragments[0]
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
            
            ${this.loadFailed?html`
                
                <vaadin-vertical-layout style="height: 50vh; align-items: center; justify-content: center;" theme="spacing padding">
                    <vaadin-icon icon="vaadin:frown-o" style="height: var(--lumo-icon-size-l); width: var(--lumo-icon-size-l);color: var(--lumo-error-color);"></vaadin-icon>
                    <p style="color: var(--lumo-error-color)">${this.loadFailed}</p>
                </vaadin-vertical-layout>
                
            
            `:html`

                ${this.view?html`
                    <mateu-view 
                .view=${this.view}
                .components=${this.components}
                journeyTypeId="${this.journeyTypeId}"
                journeyId="${this.journeyId}" 
                .service=${this.service}
                baseUrl="${this.baseUrl}"
                .mateuApiClient="${this.mateuApiClient}"
                stepId="none"
                @runaction="${this.runAction}"
                @replace-component="${this.replaceComponent}"
                instant="${nanoid()}"
        ><slot></slot></mateu-view>
                    `:html`
                <!--<p>No step</p>-->
            `}
            
            `}

            <vaadin-dialog
                    header-title="${this.modalTitle}"
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
                            () => this.modalTitle?html`
      <vaadin-button theme="tertiary" @click="${this.closeModal}">
        <vaadin-icon icon="lumo:cross"></vaadin-icon>
      </vaadin-button>
    `:html``,
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
        max-width: 100%;
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
        'mateu-ux': MateuUx
    }
}

