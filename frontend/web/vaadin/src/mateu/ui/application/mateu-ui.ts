import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, PropertyValues} from "lit";
import UI from "../../shared/apiClients/dtos/UI";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '../../journey/application/starter/journey-starter'
import {notificationRenderer} from 'lit-vaadin-helpers';
import {MenuBarItem, MenuBarItemSelectedEvent} from "@vaadin/menu-bar";
import "@vaadin/menu-bar";
import {State} from "../domain/state";
import {upstream} from "../domain/upstream";
import {Subscription} from "rxjs";
import {service} from "../domain/service";
import {nanoid} from "nanoid";
import "../../shared/apiClients/dtos/App";
import App from "../../shared/apiClients/dtos/App";
import Menu from "../../shared/apiClients/dtos/Menu";
import {MyMenuBarItem} from "./my-menu-bar-item";
import {MateuApiClient} from "../../shared/apiClients/MateuApiClient";


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
    journeyBaseUrl = ''
    @state()
    journeyUiId = '';
    @state()
    journeyContextData: string | undefined = undefined;
    @state()
    ui: UI | undefined = undefined;
    @state()
    remoteMenus: Menu[] = [];
    @property()
    journeyTypeId: string | undefined;
    @state()
    instant: string | undefined;
    @state()
    label: string | undefined;
    @property()
    loading: boolean = false;
    @property()
    items: MyMenuBarItem[] | undefined;
    @property()
    selectedItem?: MenuBarItem;
    @property()
    notificationOpened: boolean = false;
    @property()
    notificationMessage: string = '';



    // upstream channel
    private upstreamSubscription: Subscription | undefined;
    private mateuApiClient: MateuApiClient = new MateuApiClient(this)

    loadHash(w: Window) {
        if (!w.location.hash.startsWith('#state=')) {
            /*
            this.journeyTypeId = w.location.hash.split('&')[0].substring(1)
            this.journeyBaseUrl = this.baseUrl
            this.journeyUiId = this.uiId
            this.journeyContextData = this.contextData
             */

            const journeyTypeId = w.location.hash.split('&')[0].substring(1)

            const item = this.findMenuBarItem(journeyTypeId)
            if (item) {
                this.myMenuBarItemSelected(item)
            } else {
                console.log('No menu item with journeyTypeId ' + journeyTypeId, this.items)
            }

        }

    }


    connectedCallback() {
        super.connectedCallback()
        this.upstreamSubscription = upstream.subscribe((state: State) =>
            this.stampState(state)
        )

        window.onpopstate = (e) => {
            const w = e.target as Window
            this.loadHash(w)
        };
    }

    findMenuBarItem(journeyTypeId: string): MyMenuBarItem | undefined {
        return this.items?.
        map(m => this.findMenuBarItemRecursively(m, journeyTypeId)).find(m => m)
    }

    findMenuBarItemRecursively(menu: MyMenuBarItem, journeyTypeId: string): MyMenuBarItem | undefined {
        if (menu.journeyTypeId == journeyTypeId) {
            return menu
        }
        return menu.children?.
        map(m => this.findMenuBarItemRecursively(m as MyMenuBarItem, journeyTypeId)).find(m => m)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.upstreamSubscription?.unsubscribe();
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);

        try {
            this.mateuApiClient.contextData = this.contextData?JSON.parse(this.contextData):{}
        } catch (e) {
            console.log('error when parsing context data', e)
        }

        if (_changedProperties.has('baseUrl') || _changedProperties.has('uiId')) {

            this.mateuApiClient.baseUrl = this.baseUrl
            this.mateuApiClient.element = this

            if (this.baseUrl && this.uiId) {
                service.loadUi(this.mateuApiClient, this.baseUrl, this.uiId, this.journeyTypeId).then();
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

        this.journeyBaseUrl = this.baseUrl
        this.journeyUiId = this.uiId
        this.journeyContextData = this.contextData

        if (window.location.hash) {
            this.loadHash(window)
        }

    }




    renderNotification = () => html`${this.notificationMessage}`


    itemSelected(event: MenuBarItemSelectedEvent) {
        let item = event.detail.value as MyMenuBarItem
        this.myMenuBarItemSelected(item)
    }

    myMenuBarItemSelected(item: MyMenuBarItem) {
        this.instant = nanoid()
        this.journeyTypeId = item.journeyTypeId
        this.journeyUiId = item.uiId?item.uiId:this.uiId
        this.journeyBaseUrl = item.baseUrl?item.baseUrl:this.baseUrl
        this.journeyContextData = this.contextData
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

    appSelected(event: MenuBarItemSelectedEvent) {
        setTimeout(async () => {
            // @ts-ignore
            window.location = event.detail.value.action.url
        })
    }

    buildItemsForApps(apps: App[]) {
        const items = apps.map(a => ({action: a, component: this.createComponentForApp(a), disabled: a.disabled}))
        return [
            {component: this.createRootAppsComponent(),
                children: items
            }]
    }

    createComponentForApp(a: App) {
        const item = document.createElement('vaadin-context-menu-item');
        const icon = document.createElement('vaadin-icon');
        icon.style.color = 'var(--lumo-secondary-text-color)';
        icon.style.marginInlineEnd = 'var(--lumo-space-s)';
        icon.style.padding = 'var(--lumo-space-xs)';
        icon.setAttribute('icon', `${a.icon}`);
        item.appendChild(icon);
        if (a.name) {
            item.appendChild(document.createTextNode(a.name));
        }
        return item;
    }

    private createRootAppsComponent():HTMLElement {
        const item = document.createElement('vaadin-menu-bar-item');
        const icon = document.createElement('vaadin-icon');
        item.setAttribute('aria-label', 'Other save options');
        icon.setAttribute('icon', `vaadin:grid-big`);
        icon.setAttribute('style', `color: var(--lumo-body-text-color);`);
        item.appendChild(icon);
        return item;
    }

    replaceJourney(event: CustomEvent) {
        const journeyStarter = event.detail.journeyStarter
        this.journeyBaseUrl = journeyStarter.baseUrl
        this.journeyUiId = journeyStarter.uiId
        this.journeyTypeId = journeyStarter.journeyTypeId
        this.journeyContextData = journeyStarter.contextData
    }


    render() {
       return html`
        ${this.ui?html`
            <vaadin-vertical-layout style="align-items: center">
                
                ${this.ui.menu && this.ui.menu.length > 0?html`
                    <vaadin-app-layout>
                        <vaadin-horizontal-layout style="width: 100%" slot="navbar">
                        <vaadin-horizontal-layout theme="spacing" style="align-items: center;margin-left: 10px;">
                            ${this.ui.icon?html`
                                <vaadin-icon style="margin-left: 5px;" icon="${this.ui.icon}" @click=${this.goHome}></vaadin-icon>
                            `:''}
                            ${this.ui.logo?html`
                                <img style="margin-left: 5px;" src="${this.ui.logo}" @click=${this.goHome}>
                            `:''}
                            ${this.ui.apps && this.ui.apps.length > 0?html`
                                <vaadin-menu-bar theme="icon tertiary small" xopen-on-hover
                                                 @item-selected="${this.appSelected}"
                                                 .items="${this.buildItemsForApps(this.ui.apps)}"></vaadin-menu-bar>
                            `:''}
                            <h3 class="title" @click=${this.goHome}>${this.ui.title}</h3>
                        </vaadin-horizontal-layout>
                        <div class="container xx" style="/*flex-grow: 1;*/">
                            ${this.ui.menu?html`
                                <vaadin-menu-bar id="main-menu"
                                        .items="${this.items}"
                                        @item-selected="${this.itemSelected}"
                                                 theme="tertiary"
                                ></vaadin-menu-bar>
                            `:''}
                        </div>                         
                        <div style="text-align: right; padding-right: 10px;">
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
                        </vaadin-horizontal-layout>
                    </vaadin-app-layout>
                `:''}
                
                    ${this.ui.homeJourneyTypeId && !this.journeyTypeId?html`
                    <journey-starter 
                            uiId="${this.journeyUiId}" 
                            journeytypeid="${this.ui.homeJourneyTypeId}" 
                            baseUrl="${this.journeyBaseUrl}" 
                            instant="${this.instant}" 
                            contextData="${this.journeyContextData}"
                            @replace-journey="${this.replaceJourney}"
                            main="${this.baseUrl == this.journeyBaseUrl}"
                    ></journey-starter>
                    
                `:''}

                    ${this.journeyTypeId?html`

                    <journey-starter 
                            uiId="${this.journeyUiId}" 
                            journeytypeid=${this.journeyTypeId} 
                            baseUrl="${this.journeyBaseUrl}"  
                            instant="${this.instant}" 
                            contextData="${this.journeyContextData}"
                            @replace-journey="${this.replaceJourney}"
                            main="${this.baseUrl == this.journeyBaseUrl}"
                    ></journey-starter>
                    
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
        margin-block-start: 0em; 
        margin-block-end: 0em;
        cursor: pointer;        
    }
        
        .containerx {
            justify-content: center;
            display: flex;
        }

        .container {
            /* flex: 1 1 0; */
            padding-left: 2rem;
            padding-right: 2rem;
            /*width: clamp(45ch, 20%, 75ch);*/
            width: 50%;
            max-width: 955px;
            margin: auto;
        }
    
    vaadin-button {
        padding-bottom: 4px;
    }
   
    
    div {
        height: 44px;
    }

        @media(max-width: 600px) {
            .xx {
                max-width: 150px;
            }
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

