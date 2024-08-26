import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, PropertyValues} from "lit";
import UI from "../../shared/apiClients/dtos/UI";
import '@vaadin/vertical-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/vaadin-tabs'
import '@vaadin/vaadin-tabs/vaadin-tab'
import '../../journey/application/starter/journey-starter'
import {notificationRenderer} from 'lit-vaadin-helpers';
import {MenuBarItem, MenuBarItemSelectedEvent} from "@vaadin/menu-bar";
import "@vaadin/menu-bar";
import {State} from "../domain/state";
import {upstream} from "../domain/upstream";
import {Subscription} from "rxjs";
import {service} from "../domain/service";
import {mateuApiClient} from "../../shared/apiClients/MateuApiClient";
import {nanoid} from "nanoid";

interface MyMenuBarItem extends MenuBarItem {

    journeyTypeId: string | undefined

}


@customElement('mateu-ui')
export class MateuUi extends LitElement {


    // public properties
    @property()
    baseUrl = ''
    @property()
    uiId = '';
    @property()
    contextData: string | undefined = undefined;

    // state
    @state()
    ui: UI | undefined = undefined;
    @property()
    journeyTypeId: string | undefined;
    @state()
    instant: string | undefined;
    @state()
    label: string | undefined;
    @property()
    loading: boolean = false;
    @property()
    items: MenuBarItem[] | undefined;
    @property()
    selectedItem?: MenuBarItem;
    @property()
    notificationOpened: boolean = false;
    @property()
    notificationMessage: string = '';


    // upstream channel
    private upstreamSubscription: Subscription | undefined;


    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((state: State) =>
            this.stampState(state)
        )

        if (window.location.hash) {
            if (!window.location.hash.startsWith('#state=')) {
                this.journeyTypeId = window.location.hash.split('&')[0].substring(1)
            }
        }

        window.onpopstate = (e) => {
            const w = e.target as Window
            if (!w.location.hash.startsWith('#state=')) {
                this.journeyTypeId = w.location.hash.split('&')[0].substring(1)
            }
        };
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe();
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);

        try {
            mateuApiClient.contextData = this.contextData?JSON.parse(this.contextData):{}
        } catch (e) {
            console.log('error when parsing context data', e)
        }

        if (_changedProperties.has('baseUrl') || _changedProperties.has('uiId')) {

            mateuApiClient.baseUrl = this.baseUrl
            mateuApiClient.element = this

            if (this.baseUrl && this.uiId) {
                service.loadUi(this.baseUrl, this.uiId, this.journeyTypeId).then();
            }

        }

    }


    // write state to reactive properties
    stampState(state: State) {
        this.ui = state.ui
        this.journeyTypeId = state.journeyTypeId
        this.loading = state.loading
        this.items = state.items
        this.selectedItem = state.selectedItem
        this.notificationOpened = state.notificationOpened
        this.notificationMessage = state.notificationMessage
    }


    renderNotification = () => html`${this.notificationMessage}`


    itemSelected(event: MenuBarItemSelectedEvent) {
        this.instant = nanoid()
        let item = event.detail.value as MyMenuBarItem
        this.journeyTypeId = item.journeyTypeId
        this.label = item.text
    }

    login() {
        if (this.ui?.loginUrl) {
            window.location.href = this.ui.loginUrl
        }
    }

    logout() {
        if (this.ui?.logoutUrl) {
            window.location.href = this.ui.logoutUrl
        }
    }

    goHome() {
        window.location.href = ''
    }


    render() {
       return html`
        ${this.ui?html`
            <vaadin-vertical-layout style="align-items: center">
                
                ${this.ui.menu && this.ui.menu.length > 0?html`
                    <vaadin-app-layout>
                        <h3 slot="navbar" class="title ml-l mr-l" style="width: 200px;" @click=${this.goHome}>${this.ui.title}</h3>
                        <div class="container" slot="navbar">
                            ${this.ui.menu?html`
                    <vaadin-menu-bar slot="navbar"
                            .items="${this.items}"
                            @item-selected="${this.itemSelected}"
                                     theme="tertiary"
                    ></vaadin-menu-bar>
                `:''}

                        </div>                         
                        <div slot="navbar" style="width: 200px; text-align: right; padding-right: 10px;">
                                ${this.ui.loginUrl?html`
                                    <vaadin-button theme="tertiary" 
                                                   @click="${this.login}"
                                    >Login</vaadin-button>
                            `:''}
                                ${this.ui.logoutUrl?html`
                                    <vaadin-button theme="tertiary"
                                                   @click="${this.logout}"
                                    >Logout</vaadin-button>
                            `:''}
                        </div>
                    </vaadin-app-layout>
                `:''}
                
                    ${this.ui.homeJourneyTypeId && !this.journeyTypeId?html`

                    <journey-starter uiId="${this.uiId}" journeytypeid="${this.ui.homeJourneyTypeId}" baseUrl="${this.baseUrl}" instant="${this.instant}" contextData="${this.contextData}"></journey-starter>
                    
                `:''}

                    ${this.journeyTypeId?html`

                    <journey-starter uiId="${this.uiId}" journeytypeid=${this.journeyTypeId} baseUrl="${this.baseUrl}"  instant="${this.instant}" contextData="${this.contextData}"></journey-starter>
                    
                `:''}

            </vaadin-vertical-layout>
        
        `:html``}


        <vaadin-notification
                .opened=${this.notificationOpened}
                position="bottom-end"
                duration="10000"
                theme="error"
                ${notificationRenderer(this.renderNotification)}
        >${this.notificationMessage}</vaadin-notification>


       `
    }

    static styles = css`
    :host {
        
    }
    
    .mr-l {
        margin-right: var(--lumo-space-l);
    }
    .ml-l {
        margin-left: var(--lumo-space-l);
    }
    
    h3.title {
        font-size: var(--lumo-font-size-xl);
        margin-bottom: 0.5em;
        font-weight: 600;
        padding-bottom: 6px;
    }
    
    vaadin-button {
        padding-bottom: 4px;
    }
   
    
    div {
        height: 44px;
    }
        
    .container {
      max-width: 1124px;
      margin: auto;
    }

  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-ui': MateuUi
    }
}

declare global {
    interface Window {
        __MATEU_REMOTE_BASE_URL__: any
        __MATEU_UI_ID__: any
        location: Location
    }
}

