import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, PropertyValues} from "lit";
import UI from "../../shared/apiClients/dtos/UI";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '../../journey/application/starter/mateu-ux'
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
    contextData: string | undefined = undefined;


    // state
    @state()
    initialJourneyTypeIdFromWindow: string | undefined
    @state()
    journeyBaseUrl = ''
    @state()
    journeyContextData: string | undefined = undefined;
    @state()
    ui: UI | undefined = undefined;
    @state()
    remoteMenus: Menu[] = [];
    @property()
    journeyTypeId: string | undefined;
    @state()
    remoteJourneyTypeId: string | undefined
    @state()
    menuPath: string | undefined
    @state()
    search: string | undefined
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

    menuRetriesCount = 0

    // upstream channel
    private upstreamSubscription: Subscription | undefined;
    private mateuApiClient: MateuApiClient = new MateuApiClient(this)

    loadHash(w: Window) {
        if (!w.location.hash.startsWith('#state=')) {

            let journeyTypeId = this.extractJourneyTypeIdFromUrl(w)

            this.menuRetriesCount = 0
            if (journeyTypeId) {
                this.searchAndSelectMenuItem(journeyTypeId)
            } else {
                //home. No menu to select
            }

        }

    }

    extractJourneyTypeIdFromUrl(w: Window) {
        let journeyTypeId = w.location.pathname
        if (this.baseUrl) {
            journeyTypeId = journeyTypeId.substring(this.baseUrl.length)
        }
        if (journeyTypeId.startsWith('/')) {
            journeyTypeId = journeyTypeId.substring(1)
        }
        return journeyTypeId;
    }

    searchAndSelectMenuItem(journeyTypeId: string) {
        const item = this.findMenuBarItem(journeyTypeId)
        if (item) {
            this.myMenuBarItemSelected(item)
        } else {
            if (this.menuRetriesCount++ < 20) {
                console.log('Retrying (' + this.menuRetriesCount + ') search of menu item with journeyTypeId ' + journeyTypeId)
                setTimeout(() => this.searchAndSelectMenuItem(journeyTypeId), 100)
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

        this.initialJourneyTypeIdFromWindow = this.extractJourneyTypeIdFromUrl(window)

        this.search = window.location.search
        this.loadHash(window)
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

    updateContextData() {
        this.journeyContextData = this.contextData

        try {
            this.mateuApiClient.contextData = this.contextData?JSON.parse(this.contextData):{}
        } catch (e) {
            console.log('error when parsing context data', e)
        }
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);

        this.updateContextData()

        if (_changedProperties.has('baseUrl')
        //    || _changedProperties.has('instant')
        ) {

            this.mateuApiClient.baseUrl = this.baseUrl
            this.mateuApiClient.element = this

            service.loadUi(this.mateuApiClient, this.baseUrl, this.journeyTypeId).then();

        }

    }


    // write state to reactive properties
    stampState(state: State) {
        this.ui = state.ui
        if (this.ui?.contextData) {
            this.contextData = this.ui?.contextData
            this.updateContextData()
        }
        this.journeyTypeId = state.journeyTypeId
        this.remoteJourneyTypeId = undefined
        this.loading = state.loading
        this.items = state.items
        this.selectedItem = state.selectedItem
        this.notificationOpened = state.notificationOpened
        this.notificationMessage = state.notificationMessage

        this.journeyBaseUrl = this.baseUrl

    }




    renderNotification = () => html`${this.notificationMessage}`


    itemSelected(event: MenuBarItemSelectedEvent) {
        let item = event.detail.value as MyMenuBarItem
        let intendedPath = item.journeyTypeId || ''
        if ('____home____' == this.journeyTypeId) {
            intendedPath = ''
        }
        if (this.baseUrl && intendedPath) {
            intendedPath = this.baseUrl + '/' + intendedPath
        }
        if (!intendedPath.startsWith('/')) {
            intendedPath = '/' + intendedPath
        }
        if (this.search) {
            intendedPath += this.search
        }
        let currentPath = window.location.pathname;
        if (window.location.search) {
            currentPath += window.location.search
        }
        if (window.location.hash) {
            currentPath += window.location.hash
        }

        if (item.journeyTypeId && currentPath != intendedPath) {
            console.log('pushing path in ui', currentPath, intendedPath)
            window.history.pushState({},"", intendedPath);
            dispatchEvent(new PopStateEvent('popstate', { state: {} }));
        } else {
            this.myMenuBarItemSelected(item)
        }
    }

    myMenuBarItemSelected(item: MyMenuBarItem) {
        this.instant = nanoid()
        this.journeyTypeId = item.journeyTypeId
        this.remoteJourneyTypeId = item.remoteJourneyTypeId;
        let menuPath = ''
        if (item.journeyTypeId && item.remoteJourneyTypeId) {
            menuPath = item.journeyTypeId.substring(0, item.journeyTypeId.length - item.remoteJourneyTypeId.length)
        }
        this.menuPath = menuPath;
        this.journeyBaseUrl = item.baseUrl?item.baseUrl:''
        this.updateContextData()
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
        let url = this.baseUrl
        if (!url) {
            url = '/'
        } else {
            url = this.baseUrl
        }
        if (this.search) {
            url += this.search
        }
        window.location.href = url
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
        this.journeyTypeId = journeyStarter.journeyTypeId
        this.remoteJourneyTypeId = undefined
        this.journeyContextData = journeyStarter.contextData
    }


    render() {
       return html`
        ${this.ui?html`
            <vaadin-vertical-layout style="align-items: center">
                
                ${this.ui.menu && this.ui.menu.length > 0?html`
                    <vaadin-app-layout>
                        <vaadin-horizontal-layout style="width: 100%" slot="navbar" theme="wrap">
                        <vaadin-horizontal-layout theme="spacing" style="align-items: center;margin-left: 10px;">
                            ${this.ui.icon?html`
                                <vaadin-icon style="margin-left: 5px;" icon="${this.ui.icon}" @click=${this.goHome}></vaadin-icon>
                            `:''}
                            ${this.ui.logo?html`
                                <img style="margin-left: 5px; max-height: 36px;" src="${this.ui.logo}" @click=${this.goHome}>
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
                            ${this.ui.welcomeMessage?html`
                                <p>${this.ui.welcomeMessage}</p>
                            `:''}
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
                
                    ${this.ui.homeJourneyTypeId && !this.initialJourneyTypeIdFromWindow && !this.journeyTypeId?html`
                    <mateu-ux 
                            journeytypeid="${this.ui.homeJourneyTypeId}" 
                            baseUrl="${this.journeyBaseUrl}" 
                            instant="${this.instant}" 
                            contextData="${this.journeyContextData}"
                            @replace-journey="${this.replaceJourney}"
                            main="${this.baseUrl == this.journeyBaseUrl}"
                            uiBaseUrl="${this.baseUrl}"
                            menuPath="${this.menuPath}"
                            search="${this.search}"
                    ></mateu-ux>
                    
                `:''}

                    ${this.journeyTypeId?html`

                    <mateu-ux
                            journeytypeid=${this.remoteJourneyTypeId?this.remoteJourneyTypeId:this.journeyTypeId} 
                            baseUrl="${this.journeyBaseUrl}"  
                            instant="${this.instant}" 
                            contextData="${this.journeyContextData}"
                            @replace-journey="${this.replaceJourney}"
                            main="${this.baseUrl == this.journeyBaseUrl}"
                            uiBaseUrl="${this.baseUrl}"
                            menuPath="${this.menuPath}"
                            search="${this.search}"
                    ></mateu-ux>
                    
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

