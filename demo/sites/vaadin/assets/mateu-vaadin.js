const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-ol.js","assets/rolldown-runtime.js","assets/vendor.js","assets/vendor-chartjs.js","assets/vendor-diagrams.js","assets/vendor-ui5.js"])))=>i.map(i=>d[i]);
import{_ as e,a as t,c as n,d as r,f as i,g as a,h as o,i as s,l as c,m as l,n as u,o as d,p as f,r as p,s as ee,t as te,u as ne,v as re}from"./vendor-vaadin.js";import{S as m,a as h,c as g,g as ie,h as _,i as v,m as y,n as b,o as x,r as S,v as C,w as ae,y as w}from"./vendor-lit.js";import{c as oe,l as se,o as ce,s as T}from"./vendor.js";import{r as E}from"./vendor-ui5.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),re(`vaadin-card`,m`
      :host(.mateu-section) {
        --vaadin-card-border-width: 0 !important;
        --vaadin-card-background: transparent !important;
        --vaadin-card-shadow: none !important;
        --vaadin-card-padding: 0 !important;
      }
    `);var le=document.createElement(`style`);le.innerHTML=`
${e.cssText}
${o.cssText}
${a.cssText}
${l.cssText}
${f}
${i}
`,document.body.appendChild(le);{let e=window.Vaadin;e&&((e.featureFlags??={}).masterDetailLayoutComponent=!0)}new class{constructor(){this.ui=void 0,this.loading=!1,this.config={},this.sharedData={},this.userData={},this.appData={},this.runtimeData={}}};var ue=new se,D={value:{}},de={value:{}},fe=m`
  [theme~='badge'] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 0.4em calc(0.5em + var(--lumo-border-radius-s, 4px) / 4);
    color: var(--lumo-primary-text-color, #1a5dad);
    background-color: var(--lumo-primary-color-10pct, rgba(66, 133, 211, 0.12));
    border-radius: var(--lumo-border-radius-s, 4px);
    font-family: var(--lumo-font-family, inherit);
    font-size: var(--lumo-font-size-s, 0.875rem);
    line-height: 1;
    font-weight: 500;
    text-transform: initial;
    letter-spacing: initial;
    min-width: calc(var(--lumo-line-height-xs, 1.25) * 1em + 0.45em);
    flex-shrink: 0;
  }

  [theme~='badge']::before {
    display: inline-block;
    content: '\\2003';
    width: 0;
  }

  [theme~='badge'][theme~='small'] {
    font-size: var(--lumo-font-size-xxs, 0.6875rem);
    line-height: 1;
  }

  /* Colors */
  [theme~='badge'][theme~='success'] {
    color: var(--lumo-success-text-color, #22703a);
    background-color: var(--lumo-success-color-10pct, rgba(62, 134, 53, 0.12));
  }
  [theme~='badge'][theme~='error'] {
    color: var(--lumo-error-text-color, #a5502e);
    background-color: var(--lumo-error-color-10pct, rgba(178, 91, 61, 0.12));
  }
  [theme~='badge'][theme~='warning'] {
    color: var(--lumo-warning-text-color, #925a13);
    background-color: var(--lumo-warning-color-10pct, rgba(201, 138, 30, 0.12));
  }
  [theme~='badge'][theme~='contrast'] {
    color: var(--lumo-contrast-80pct, rgba(0, 0, 0, 0.8));
    background-color: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.05));
  }

  /* Primary (solid) */
  [theme~='badge'][theme~='primary'] {
    color: var(--lumo-primary-contrast-color, #fff);
    background-color: var(--lumo-primary-color, #4285d3);
  }
  [theme~='badge'][theme~='success'][theme~='primary'] {
    color: var(--lumo-success-contrast-color, #fff);
    background-color: var(--lumo-success-color, #3e8635);
  }
  [theme~='badge'][theme~='error'][theme~='primary'] {
    color: var(--lumo-error-contrast-color, #fff);
    background-color: var(--lumo-error-color, #b25b3d);
  }
  [theme~='badge'][theme~='warning'][theme~='primary'] {
    color: var(--lumo-warning-contrast-color, #fff);
    background-color: var(--lumo-warning-color, #c98a1e);
  }
  [theme~='badge'][theme~='contrast'][theme~='primary'] {
    color: var(--lumo-base-color, #fff);
    background-color: var(--lumo-contrast, rgba(0, 0, 0, 0.8));
  }

  [theme~='badge'][href]:hover {
    text-decoration: none;
  }

  /* Icon spacing */
  [theme~='badge'] > vaadin-icon {
    margin: -0.25em 0;
  }
  [theme~='badge'] > vaadin-icon:first-child {
    margin-left: -0.375em;
  }
  [theme~='badge'] > vaadin-icon:last-child {
    margin-right: -0.375em;
  }

  /* Empty (dot) badges */
  [theme~='badge']:not([icon]):empty {
    min-width: 0;
    width: 1em;
    height: 1em;
    padding: 0;
    border-radius: 50%;
    background-color: var(--lumo-primary-color, #4285d3);
  }
  [theme~='badge'][theme~='small']:not([icon]):empty {
    width: 0.75em;
    height: 0.75em;
  }
  [theme~='badge'][theme~='contrast']:not([icon]):empty {
    background-color: var(--lumo-contrast, rgba(0, 0, 0, 0.8));
  }
  [theme~='badge'][theme~='success']:not([icon]):empty {
    background-color: var(--lumo-success-color, #3e8635);
  }
  [theme~='badge'][theme~='error']:not([icon]):empty {
    background-color: var(--lumo-error-color, #b25b3d);
  }
  [theme~='badge'][theme~='warning']:not([icon]):empty {
    background-color: var(--lumo-warning-color, #c98a1e);
  }

  /* Pill */
  [theme~='badge'][theme~='pill'] {
    --lumo-border-radius-s: 1em;
  }
`,pe={lon:0,lat:0},me=e=>{if(!e)return;let t=e.split(`,`).map(e=>e.trim());if(t.length!==2)return;let n=Number(t[0]),r=Number(t[1]);if(!(t[0]===``||t[1]===``||!Number.isFinite(n)||!Number.isFinite(r)))return{lon:r,lat:n}},he=e=>{if(e==null||e.trim()===``)return 3;let t=Number(e);return Number.isFinite(t)?t:3};function O(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var ge=class extends y{constructor(...e){super(...e),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){let e=++this.renderSeq,[{default:t},{default:n},{default:r},{default:i},{fromLonLat:a},{default:o}]=await Promise.all([E(()=>import(`./vendor-ol.js`).then(e=>e.i),__vite__mapDeps([0,1])),E(()=>import(`./vendor-ol.js`).then(e=>e.a),__vite__mapDeps([0,1])),E(()=>import(`./vendor-ol.js`).then(e=>e.r),__vite__mapDeps([0,1])),E(()=>import(`./vendor-ol.js`).then(e=>e.t),__vite__mapDeps([0,1])),E(()=>import(`./vendor-ol.js`).then(e=>e.o),__vite__mapDeps([0,1])),E(()=>import(`./vendor-ol.js`).then(e=>e.n),__vite__mapDeps([0,1]))]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector(`style[data-ol]`)){let e=document.createElement(`style`);e.setAttribute(`data-ol`,``),e.textContent=o,this.shadowRoot.appendChild(e)}this.map&&=(this.map.setTarget(void 0),void 0);let s=me(this.position)??pe;this.map=new t({target:this.mapElement,layers:[new r({source:new i})],view:new n({center:a([s.lon,s.lat]),zoom:he(this.zoom)})})}render(){return w`<div id="map"></div>`}static{this.styles=m`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `}};O([v()],ge.prototype,`position`,void 0),O([v()],ge.prototype,`zoom`,void 0),O([b(`#map`)],ge.prototype,`mapElement`,void 0),ge=O([h(`mateu-map`)],ge);var _e=typeof HTMLElement<`u`?HTMLElement:class{},ve=class extends _e{static get observedAttributes(){return[`content`]}#e;#t=0;get content(){return this.#e}set content(e){this.#e=e,this.#n()}attributeChangedCallback(e,t,n){this.content=n??void 0}connectedCallback(){this.style.display=`block`,this.#n()}async#n(){if(!this.isConnected)return;let e=this.#e??``,t=++this.#t,[{marked:n},{default:r}]=await Promise.all([E(()=>import(`./vendor.js`).then(e=>e.n),__vite__mapDeps([2,1])),E(()=>import(`./vendor.js`).then(e=>e.a),__vite__mapDeps([2,1]))]);t===this.#t&&(this.innerHTML=r.sanitize(await n.parse(e),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:e=>!0}}))}};typeof customElements<`u`&&!customElements.get(`mateu-markdown`)&&customElements.define(`mateu-markdown`,ve);var k=function(e){return e.ServerSide=`ServerSide`,e.ClientSide=`ClientSide`,e}({}),A=function(e){return e.Page=`Page`,e.Div=`Div`,e.Element=`Element`,e.MicroFrontend=`MicroFrontend`,e.Form=`Form`,e.Crud=`Crud`,e.Result=`Result`,e.Card=`Card`,e.Directory=`Directory`,e.Stepper=`Stepper`,e.HorizontalLayout=`HorizontalLayout`,e.VerticalLayout=`VerticalLayout`,e.SplitLayout=`SplitLayout`,e.MasterDetailLayout=`MasterDetailLayout`,e.TabLayout=`TabLayout`,e.AccordionLayout=`AccordionLayout`,e.FormLayout=`FormLayout`,e.FormRow=`FormRow`,e.FormItem=`FormItem`,e.BoardLayout=`BoardLayout`,e.BoardLayoutRow=`BoardLayoutRow`,e.BoardLayoutItem=`BoardLayoutItem`,e.Scroller=`Scroller`,e.FullWidth=`FullWidth`,e.Container=`Container`,e.FormField=`FormField`,e.Table=`Table`,e.App=`App`,e.Text=`Text`,e.Avatar=`Avatar`,e.Chat=`Chat`,e.AvatarGroup=`AvatarGroup`,e.Badge=`Badge`,e.Breadcrumbs=`Breadcrumbs`,e.Anchor=`Anchor`,e.Button=`Button`,e.Chart=`Chart`,e.Icon=`Icon`,e.ConfirmDialog=`ConfirmDialog`,e.ContextMenu=`ContextMenu`,e.CookieConsent=`CookieConsent`,e.Details=`Details`,e.Dialog=`Dialog`,e.Drawer=`Drawer`,e.Image=`Image`,e.Map=`Map`,e.Markdown=`Markdown`,e.Notification=`Notification`,e.ProgressBar=`ProgressBar`,e.Popover=`Popover`,e.CarouselLayout=`CarouselLayout`,e.Tooltip=`Tooltip`,e.MessageInput=`MessageInput`,e.MessageList=`MessageList`,e.CustomField=`CustomField`,e.MenuBar=`MenuBar`,e.Grid=`Grid`,e.GridColumn=`GridColumn`,e.GridGroupColumn=`GridGroupColumn`,e.VirtualList=`VirtualList`,e.FormSection=`FormSection`,e.FormSubSection=`FormSubSection`,e.Bpmn=`Bpmn`,e.Workflow=`Workflow`,e.FormEditor=`FormEditor`,e.MetricCard=`MetricCard`,e.Scoreboard=`Scoreboard`,e.DashboardPanel=`DashboardPanel`,e.DashboardLayout=`DashboardLayout`,e.FoldoutLayout=`FoldoutLayout`,e.ContentLayout=`ContentLayout`,e.HeroSection=`HeroSection`,e.EmptyState=`EmptyState`,e.Skeleton=`Skeleton`,e.Gantt=`Gantt`,e.PlanningBoard=`PlanningBoard`,e.Kanban=`Kanban`,e.Timeline=`Timeline`,e.ProgressSteps=`ProgressSteps`,e.Stat=`Stat`,e.Calendar=`Calendar`,e.PricingTable=`PricingTable`,e.OrgChart=`OrgChart`,e.Heatmap=`Heatmap`,e.Funnel=`Funnel`,e.TrendChart=`TrendChart`,e.FeatureGrid=`FeatureGrid`,e.Testimonials=`Testimonials`,e.Faq=`Faq`,e.CalloutCard=`CalloutCard`,e.CommentThread=`CommentThread`,e.FileList=`FileList`,e.Checklist=`Checklist`,e.ComparisonCard=`ComparisonCard`,e.EntityHeader=`EntityHeader`,e.Meter=`Meter`,e.TaskProgress=`TaskProgress`,e.StatusList=`StatusList`,e.BulletedList=`BulletedList`,e.Separator=`Separator`,e.Notice=`Notice`,e.TaskQueue=`TaskQueue`,e.ResourceGrid=`ResourceGrid`,e.OfferCard=`OfferCard`,e.AddOnPicker=`AddOnPicker`,e.Ledger=`Ledger`,e.PaymentPicker=`PaymentPicker`,e.ProcessMonitor=`ProcessMonitor`,e}({}),ye=`mateu-app-context`,be=`mateu-app-context-labels`,xe=e=>{try{return JSON.parse(localStorage.getItem(e)??`{}`)}catch{return{}}},Se=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},Ce=()=>xe(ye),we=()=>xe(be),Te=(e,t,n)=>{let r=Ce(),i=we();t==null||t===``?(delete r[e],delete i[e]):(r[e]=t,n!==void 0&&(i[e]=n)),Se(ye,r),Se(be,i)},Ee=!1,De=()=>{Ee||(Ee=!0,window.addEventListener(`storage`,e=>{e.key===ye&&e.newValue!==e.oldValue&&window.location.reload()}))},Oe,ke=(e,t)=>new Promise((n,r)=>{let i=!1,a={retry:()=>{i||(i=!0,t().then(n,r))},giveUp:()=>{i||(i=!0,r(e))}};if(Oe){Oe(a);return}let o=new CustomEvent(`mateu-session-expired`,{detail:a,cancelable:!0,bubbles:!1});typeof document<`u`&&!document.dispatchEvent(o)||a.giveUp()}),Ae=(e,t)=>e.includes(`json`)?!0:typeof t==`object`&&!!t,je=(e,t)=>{let n=e.finalUrl;if(!n)return;let r=t??(typeof window<`u`?window.location.href:void 0),i;try{i=new URL(e.requestedUrl,r).href}catch{return}if(i!==n&&!Ae(e.contentType??``,e.data))return n},Me=new class{constructor(){this.windowMs=4e3,this.threshold=12,this.events=[],this.reported=new Set}check(e,t=Date.now()){this.events.push({sig:e,t});let n=t-this.windowMs;this.events=this.events.filter(e=>e.t>=n);let r=0;for(let t of this.events)t.sig===e&&r++;if(r>=this.threshold){let t=!this.reported.has(e);return this.reported.add(e),{blocked:!0,firstTrip:t}}return this.reported.delete(e),{blocked:!1,firstTrip:!1}}reset(){this.events=[],this.reported.clear()}configure(e){e.windowMs!==void 0&&(this.windowMs=e.windowMs),e.threshold!==void 0&&(this.threshold=e.threshold)}},Ne={offline:()=>`No connection. Your changes have not been sent — check your network and try again.`,timeout:()=>`The server is taking too long to answer. Your changes may not have been saved.`,server:e=>`The server could not complete the request${e?` (error ${e})`:``}. Please try again.`,unauthorized:()=>`Your session is no longer valid. Please sign in again.`,notFound:()=>`This is no longer available. It may have been moved or deleted.`,client:e=>`The request was rejected${e?` (error ${e})`:``}.`,cancelled:()=>``,unknown:()=>`Something went wrong. Please try again.`},Pe=new Set([`offline`,`timeout`,`server`]),Fe=(e,t={})=>{let n=e??{},r=n.response?.status,i=n.code,a=t.online??(typeof navigator<`u`&&typeof navigator.onLine==`boolean`?navigator.onLine:!0),o=e=>({kind:e,message:Ne[e](r),retryable:Pe.has(e),status:r});return i===`ERR_CANCELED`?o(`cancelled`):i===`ECONNABORTED`||i===`ETIMEDOUT`||/timeout/i.test(n.message??``)?o(`timeout`):r===void 0?!a||i===`ERR_NETWORK`||/network error/i.test(n.message??``)?o(`offline`):o(`unknown`):o(r===401||r===403?`unauthorized`:r===404||r===410?`notFound`:r===408||r===429?`timeout`:r>=500?`server`:r>=400?`client`:`unknown`)},Ie=new Set([``,`__load__`,`search`,`_globalsearch`,`_notifications-list`]),Le=[`_appcontext-search-`,`search-`],Re=(e,t)=>t===!0?!0:e==null?!1:Ie.has(e)?!0:Le.some(t=>e.startsWith(t)),ze=(e,t=Math.random)=>{let n=300*3**Math.max(0,e-1);return Math.round(n*(.75+t()*.5))},Be=(e,t,n)=>!n.idempotent||t>2||!e.retryable?!1:e.kind===`timeout`||e.kind===`server`,Ve=new class{constructor(){this.linkUp=!0,this.listeners=new Set,this.waiters=new Set,this.started=!1}start(){this.started||typeof window>`u`||(this.started=!0,this.linkUp=typeof navigator<`u`&&typeof navigator.onLine==`boolean`?navigator.onLine:!0,window.addEventListener(`online`,()=>{this.linkUp=!0,this.reachable=void 0,this.changed(),this.releaseWaiters()}),window.addEventListener(`offline`,()=>{this.linkUp=!1,this.changed()}))}isOnline(){return this.linkUp?this.reachable!==!1:!1}noteReachable(){let e=this.isOnline();this.reachable=!0,e||(this.changed(),this.releaseWaiters())}noteUnreachable(){let e=this.isOnline();this.reachable=!1,e&&this.changed()}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}whenBack(e){return this.isOnline()?(e(),()=>{}):(this.waiters.add(e),()=>this.waiters.delete(e))}reset(){this.linkUp=!0,this.reachable=void 0,this.waiters.clear()}changed(){let e=this.isOnline();this.listeners.forEach(t=>t(e))}releaseWaiters(){let e=Array.from(this.waiters);this.waiters.clear(),e.forEach(e=>e())}};Ve.start();var He=[],Ue=6e4,We=e=>new Promise(t=>setTimeout(t,e)),Ge=new class{constructor(){this.axiosInstance=oe.create({timeout:Ue}),this.axiosInstance.interceptors.request.use(e=>(this.addAuthToken(e),this.addSessionId(e),e)),this.axiosInstance.interceptors.response.use(e=>{let t=je({requestedUrl:this.axiosInstance.getUri(e.config),finalUrl:e.request?.responseURL,contentType:String(e.headers?.[`content-type`]??``),data:e.data});if(t)throw window.location.assign(t),Object.assign(Error(`session lost — redirecting to `+t),{code:`ERR_CANCELED`});return e},e=>{let t=e;if(t?.response?.status===401&&t.config&&!t.config.__mateuRetried){let n=t.config;return n.__mateuRetried=!0,ke(e,()=>this.axiosInstance.request(n))}throw e})}addSessionId(e){let t=sessionStorage.getItem(`__mateu_sesion_id`);t||(t=T(),sessionStorage.setItem(`__mateu_sesion_id`,t)),e.headers[`X-Session-Id`]=t}addAuthToken(e){let t=localStorage.getItem(`__mateu_auth_token`);t&&(e.headers.Authorization=`Bearer `+t)}async wrap(e,t,n,r,i){return n||t.dispatchEvent(new CustomEvent(`backend-called-event`,{bubbles:!0,composed:!0,detail:{}})),e().then(e=>(t.dispatchEvent(new CustomEvent(`backend-succeeded-event`,{bubbles:!0,composed:!0,detail:{actionId:r}})),e)).catch(e=>{let n=Fe(e,{online:Ve.isOnline()});throw n.kind==`cancelled`?t.dispatchEvent(new CustomEvent(`backend-cancelled-event`,{bubbles:!0,composed:!0,detail:{actionId:r}})):(e&&typeof e==`object`&&(e.__mateuReported=!0),t.dispatchEvent(new CustomEvent(`backend-failed-event`,{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(e),failure:n,retry:i}}))),e})}async sendWithRetry(e,t){let n=0;for(;;)try{let t=await e();return Ve.noteReachable(),t}catch(e){let r=Fe(e,{online:Ve.isOnline()});if(r.kind==`offline`&&Ve.noteUnreachable(),n++,!Be(r,n,{idempotent:t}))throw e;await We(ze(n))}}serialize(e){return e?.message?e:JSON.stringify(e)}release(e){He=He.filter(t=>t!==e)}async get(e){let t=new AbortController;return He=[...He,t],this.axiosInstance.get(e,{signal:t.signal}).finally(()=>this.release(t))}async post(e,t,n){let r=new AbortController;return He=[...He,r],this.axiosInstance.post(e,t,{signal:r.signal,...n&&n>0?{timeout:n}:{}}).finally(()=>this.release(r))}async abortAll(){He.forEach(e=>e.abort()),He=[]}async runAction(e,t,n,r,i,a,o,s,c,l,u,d={}){t&&t.startsWith(`/`)&&(t=t.substring(1));let f=[e,t,n,o??``,r,i].join(``),p=Me.check(f);if(p.blocked)return await this.abortAll(),p.firstTrip&&console.error(`[mateu] request loop detected — aborting repeated request`,f),{messages:p.firstTrip?[{title:``,text:`A repeating request was detected and stopped to protect the server. Reload the page or navigate elsewhere.`,position:`bottom-end`,variant:`error`,duration:6e3}]:[],commands:[],fragments:[],banners:[],appendBanners:!1,appData:void 0,appState:void 0};a={...Ce(),...a};let ee=e+`/mateu/v3/sync/`+(t&&t!=``?t:`_no_route`),te={serverSideType:o,appState:a,componentState:s,parameters:c,initiatorComponentId:i,consumedRoute:n,route:t&&t!=``?`/`+t:``,actionId:r,knownStructureHash:d.knownStructureHash},ne=Re(r,d.idempotent),re=()=>this.post(ee,te,d.timeoutMillis).then(e=>e.data);return await this.wrap(()=>this.sendWithRetry(re,ne),l,u,r,d.retry)}},Ke=function(e){return e.Add=`Add`,e.Replace=`Replace`,e.ReplaceKeepData=`ReplaceKeepData`,e}({}),qe=function(e){return e.HAMBURGUER_MENU=`HAMBURGUER_MENU`,e.MENU_ON_LEFT=`MENU_ON_LEFT`,e.MENU_ON_TOP=`MENU_ON_TOP`,e.TABS=`TABS`,e.TILES=`TILES`,e.RAIL=`RAIL`,e.AUTO=`AUTO`,e.MEDIATOR=`MEDIATOR`,e}({}),Je=new Map,Ye=[`position:absolute`,`width:1px`,`height:1px`,`margin:-1px`,`padding:0`,`overflow:hidden`,`clip:rect(0 0 0 0)`,`clip-path:inset(50%)`,`white-space:nowrap`,`border:0`].join(`;`),Xe=e=>{if(typeof document>`u`||!document.body)return;let t=Je.get(e);return t?.isConnected?t:(t=document.createElement(`div`),t.setAttribute(`aria-live`,e),t.setAttribute(`aria-atomic`,`true`),t.setAttribute(`role`,e===`assertive`?`alert`:`status`),t.setAttribute(`data-mateu-live-region`,e),t.style.cssText=Ye,document.body.appendChild(t),Je.set(e,t),t)},Ze=()=>{if(!(typeof document>`u`)){if(!document.body){document.addEventListener(`DOMContentLoaded`,()=>Ze(),{once:!0});return}Xe(`polite`),Xe(`assertive`)}},Qe=(e,t={})=>{let n=(e??``).trim();if(!n)return;let r=Xe(t.politeness??`polite`);if(r){if(r.textContent===n){r.textContent=``,setTimeout(()=>{r.textContent=n},60);return}r.textContent=n}},$e=class extends y{constructor(...e){super(...e),this.id=``,this.baseUrl=``,this.callbackToken=``,this.createElement=e=>{let t=e.data,n=document.createElement(t.name);for(let e in t.attributes)n.setAttribute(e,t.attributes[e]);for(let e in t.on)n.addEventListener(e,n=>{this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.on[e],parameters:{event:n}},bubbles:!0,composed:!0}))});return n},this.closeModal=()=>{let e=(this.shadowRoot??this).querySelectorAll(`mateu-dialog, mateu-drawer`);if(e&&e.length>0){e[e.length-1].close();return}this.dispatchEvent(new CustomEvent(`close-modal-requested`,{bubbles:!0,composed:!0}))},this.changeFavicon=e=>{let t=document.querySelector(`link[rel="icon"]`);t===null?(t=document.createElement(`link`),t.setAttribute(`rel`,`icon`),t.setAttribute(`href`,e),document.head.appendChild(t)):t.setAttribute(`href`,e)}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=ue.subscribe(e=>{if(e.command){let t=e.command;this.id==t.targetComponentId&&this.applyCommand(t)}if((!e.callbackToken||!this.callbackToken||e.callbackToken===this.callbackToken)&&e.fragment){let t=e.fragment;this.id==t.targetComponentId&&(this.applyFragment(t),this.completeMenu(t))}})}completeMenu(e){if(e.component&&e.component.type==k.ClientSide){let t=e.component,n=t.metadata;if(n?.type==A.App){let e=n,r=this.getRemoteMenus(e.menu);if(r.length>0){let n=r.map(e=>Ge.runAction(e.baseUrl,e.route,`_empty`,``,e.baseUrl+`#`+e.route,void 0,void 0,void 0,e.params,this,!0));Promise.all(n).then(n=>{e.menu=this.updateMenu(e.menu,n.map(e=>e.fragments).filter(e=>e).map(e=>e).flat()),e.variant=qe.MENU_ON_TOP,ue.next({fragment:{component:t,data:void 0,state:void 0,action:Ke.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(e,t){let n=[];return e.forEach(e=>{if(e.remote){let r=t.find(t=>t.targetComponentId==e.baseUrl+`#`+e.route);if(r&&r.component?.type==k.ClientSide){let t=r.component;if(t.metadata?.type==A.App){let r=t.metadata,i=e.serverSideType&&e.serverSideType!=``?e.serverSideType:r.serverSideType;this.changeBaseUrl(r.menu,e.baseUrl,i,e.route,r.route),n.push(...r.menu)}}}else n.push(e)}),n}changeBaseUrl(e,t,n,r,i){e.forEach(e=>{e.baseUrl||(e.submenus&&e.submenus.length>0?this.changeBaseUrl(e.submenus,t,n,r,i):(e.consumedRoute=i??``,e.baseUrl=t,e.serverSideType=n,e.uriPrefix=r))})}getRemoteMenus(e){let t=[];return e.forEach(e=>{e.remote&&t.push(e)}),t}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(e){if(e.type==`SetWindowTitle`&&(document.title=e.data,Qe(document.title)),e.type==`SetFavicon`&&this.changeFavicon(e.data),e.type==`DispatchEvent`&&this.dispatchNamedEvent(e.data),e.type==`NavigateTo`){let t=e.data;t&&(t.startsWith(`http:`)||t.startsWith(`https:`)?window.open(e.data,`_blank`):window.location.href=e.data)}if(e.type==`PushStateToHistory`){let t=e.data;t!==void 0&&this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:t},bubbles:!0,composed:!0}))}if(e.type==`RunAction`){let t=e.data;if(t&&t.actionId)if(t.targetComponentId){let e={command:{type:`RunAction`,data:{actionId:t.actionId},targetComponentId:t.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:``};setTimeout(()=>ue.next(e))}else this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(e.type==`MarkAsDirty`&&this.dispatchEvent(new CustomEvent(`dirty`,{detail:{},bubbles:!0,composed:!0})),e.type==`MarkAsClean`&&this.dispatchEvent(new CustomEvent(`clean`,{detail:{},bubbles:!0,composed:!0})),e.type==`DownloadFile`){let t=e.data;if(t&&t.base64Content){let e=atob(t.base64Content),n=new Uint8Array(e.length);for(let t=0;t<e.length;t++)n[t]=e.charCodeAt(t);let r=new Blob([n],{type:t.mimeType}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t.filename??`export`,a.click(),URL.revokeObjectURL(i)}}if(e.type==`CloseModal`&&(this.closeModal(),this.dispatchNamedEvent(e.data)),e.type==`AddContentToHead`){let t=e.data;if(t&&t.name){if(t.attributes&&t.attributes.id&&document.getElementById(t.attributes.id))return;document.head.appendChild(this.createElement(e))}}if(e.type==`AddContentToBody`){let t=e.data;if(t&&t.name){if(t.attributes&&t.attributes.id&&document.getElementById(t.attributes.id))return;document.body.appendChild(this.createElement(e))}}}dispatchNamedEvent(e){if(e&&e.eventName){let t=this.component,n=t?.emitsName??t?.serverSideType,r=e.payload??e.detail;n&&r&&typeof r==`object`&&(r={...r,__source:n}),this.dispatchEvent(new CustomEvent(e.eventName,{detail:r,bubbles:!0,composed:!0}))}}};O([v()],$e.prototype,`id`,void 0),O([v()],$e.prototype,`baseUrl`,void 0);var et=class extends $e{applyFragment(e){}manageActionRequestedEvent(e){}};O([v()],et.prototype,`component`,void 0);var tt=(e,t)=>Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),nt=(e,t,n)=>({state:e??{},data:t??{},...n});function j(e,t,n,r){if(!e?.includes("${"))return e;try{return tt(e,nt(t,n,r))}catch(t){return console.warn(`Mateu: could not interpolate "${e}":`,t),e}}var rt=(e,t,n)=>{if(e&&e.indexOf("${")>=0)try{return tt(e,nt(t,n))}catch(e){return e.message}return e},it=(e,t,n,r,i)=>{if(!e)return e;let a=nt(t,n,{appState:r??{},appData:i??{}}),o=e;try{if(o=tt(e,a),o.includes("${"))try{o=tt(o,a)}catch(a){o=`when evaluating nested `+e+` :`+a+`, where data is `+n+` and state is `+t+` and app state is `+r+` and app data is `+i,console.error(a,o,t,n,r,i)}}catch(a){o=`when evaluating `+e+` :`+a+`, where data is `+n+` and state is `+t+` and app state is `+r+` and app data is `+i,console.error(a,o,t,n,r,i)}return o},at=(e,t,n,r,i,a)=>{let o=nt(t,n,{appState:r??{},appData:i??{},...a}),s=tt(e,o);return Function(...Object.keys(o),`return (${s})`)(...Object.values(o))},ot=(e,t,n,r)=>{let i=nt(t,n,r);return Function(...Object.keys(i),`return (${e})`)(...Object.values(i))},st=(e,t,n,r)=>tt(e,nt(t,n,r)),ct=`display:inline-flex; align-items:center; justify-content:center; width:2rem; height:2rem; border-radius:50%; background:var(--lumo-contrast-10pct,#e0e0e0); color:var(--lumo-secondary-text-color,#555); font-size:.8rem; font-weight:600; overflow:hidden; flex:none;`,lt=(e,t)=>t||(typeof e==`string`&&e?e.trim().split(/\s+/).map(e=>e[0]).slice(0,2).join(``).toUpperCase():``),ut=(e,t,n)=>{let r=e.metadata,i=M(r.name,t,n);return w`<span style="${ct}${e.style}" class="${e.cssClasses}"
                      title="${i||_}" slot="${e.slot??_}">
        ${r.image?w`<img src="${r.image}" alt="${i}" style="width:100%;height:100%;object-fit:cover;">`:lt(i,r.abbreviation)}
    </span>`},M=(e,t,n)=>typeof e==`string`&&e.includes("${")?j(e,t,n):e,dt=e=>{let t=e.metadata,n=t.avatars??[],r=t.maxItemsVisible&&t.maxItemsVisible>0?t.maxItemsVisible:n.length,i=n.slice(0,r),a=n.length-i.length,o=`margin-left:-0.4rem; border:2px solid var(--lumo-base-color,#fff);`;return w`<span style="display:inline-flex; ${e.style}" class="${e.cssClasses}" slot="${e.slot??_}">
        ${i.map(e=>w`<span style="${ct}${o}" title="${e.name||_}">
            ${e.img?w`<img src="${e.img}" style="width:100%;height:100%;object-fit:cover;">`:lt(e.name??``,e.abbr)}
        </span>`)}
        ${a>0?w`<span style="${ct}${o}">+${a}</span>`:_}
    </span>`},ft=(e,t,n)=>{let r=e.metadata;return w`<span theme="badge ${r.color} ${r.pill?`pill`:``} ${r.small?`small`:``} ${r.primary?`primary`:``}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??_}">${M(r.text,t,n)}</span>`},pt=(e,t,n)=>{let r=M(e.text,t,n);if(!r)return _;let i=M(e.color,t,n);return i==`SUCCESS`&&(i=`success`),i==`ERROR`&&(i=`error`),i==`DANGER`&&(i=`error`),i==`WARNING`&&(i=`warning`),i==`INFO`&&(i=`info`),i==`PRIMARY`&&(i=`primary`),i==`SECONDARY`&&(i=`secondary`),i==`TERTIARY`&&(i=`tertiary`),i==`QUATERNARY`&&(i=`quaternary`),i==`LIGHT`&&(i=`light`),i==`DARK`&&(i=`dark`),w`<span theme="badge ${i} ${e.pill?`pill`:``} ${e.small?`small`:``} ${e.primary?`primary`:``}">${r}</span>`},N=new class{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(e){if(this.componentRenderer=e,typeof window<`u`){let t=e.supportedClientSideTypes?.();window.__mateuRendererInfo={name:e.rendererName?.()??e.constructor?.name??`unknown`,supportedTypes:t?[...t].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(e){this.useShadowRoot=e}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(e){this.afterRenderHook=e}getAfterRenderHook(){return this.afterRenderHook}},mt=(e,t,n,r,i,a,o,s,c)=>(t.slot=s,P(e,t,n,r,i,a,o,c)),P=(e,t,n,r,i,a,o,s)=>{if(!t)return w``;if(t.type==k.ClientSide)return N.get().renderClientSideComponent(e,t,n,r,i,a,o,s);let c=e.route,l=e.consumedRoute;return w`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${l}"
                         baseUrl="${n}"
                         slot="${t.slot??_}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...r}}"
                         .data="${{...i}}"
                         .appState="${a}"
                         .appData="${o}"
        >
       </mateu-component>`},ht=e=>{let t=[];return e.color&&e.color!==`normal`&&e.color!==`none`&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle===`tertiaryInline`?`tertiary-inline`:e.buttonStyle),e.size&&e.size!==`none`&&e.size!==`normal`&&t.push(e.size),t.length?t.join(` `):void 0},gt=e=>{let t=ht(e)??``,n=[];return t.includes(`primary`)&&n.push(`primary`),t.includes(`tertiary`)&&n.push(`tertiary`),(t.includes(`error`)||e.color===`error`)&&n.push(`danger`),n.join(` `)},_t=e=>e===`back`||e===`backToList`||!!e&&e.startsWith(`cancel`),vt=class extends y{constructor(...e){super(...e),this.appState={},this.appData={},this._overflowOpen=!1,this._onDocClick=e=>{e.composedPath().includes(this)||(this._overflowOpen=!1)},this.handleButtonClick=e=>{this._overflowOpen=!1,this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>j(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+`.hidden`])return _;let t=this.evalLabel(e.label);return N.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId))||w`
        <button class="mtb ${gt(e)}"
                data-action-id="${e.id}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${t}</button>
    `},this.renderActions=e=>{let t=e.filter(e=>!(this.data??{})[e.actionId+`.hidden`]),n=t.filter(e=>e.buttonStyle===`primary`),r=t.filter(e=>e.buttonStyle!==`primary`);return r.length<2?w`${t.map(this.renderBtn)}`:w`
            ${n.map(this.renderBtn)}
            <div class="overflow-wrap">
                <button class="mtb overflow-btn" title="Más acciones" aria-haspopup="true"
                        aria-expanded="${this._overflowOpen}"
                        @click="${e=>{e.stopPropagation(),this._overflowOpen=!this._overflowOpen}}">⋯</button>
                ${this._overflowOpen?w`
                    <div class="overflow-menu">
                        ${r.map(e=>w`
                            <button class="overflow-item" ?disabled="${e.disabled}"
                                    data-action-id="${e.actionId}"
                                    @click="${()=>this.handleButtonClick(e.actionId)}">${this.evalLabel(e.label)}</button>
                        `)}
                    </div>
                `:_}
            </div>
        `},this.renderPeerNav=e=>N.get()?.renderPeerNav?.(e)||w`
            <div style="display: flex; gap: var(--lumo-space-xs, .25rem); align-items: center;" class="peer-nav">
                <button class="mtb tertiary peer-nav-prev"
                        title="${e.prevLabel??`Previous`}"
                        ?disabled="${!e.prevRoute}"
                        @click="${()=>{e.prevRoute&&(window.location.href=e.prevRoute)}}">‹</button>
                <button class="mtb tertiary peer-nav-next"
                        title="${e.nextLabel??`Next`}"
                        ?disabled="${!e.nextRoute}"
                        @click="${()=>{e.nextRoute&&(window.location.href=e.nextRoute)}}">›</button>
            </div>
        `}connectedCallback(){super.connectedCallback(),document.addEventListener(`click`,this._onDocClick)}disconnectedCallback(){document.removeEventListener(`click`,this._onDocClick),super.disconnectedCallback()}render(){let e=this.metadata;if(!e)return w``;let t=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0,n=e.toolbar??[],r=n.filter(e=>_t(e.actionId)),i=n.filter(e=>!_t(e.actionId)),a=r.length>0&&i.length>0?w`<span class="toolbar-divider"></span>`:_,o=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||n.length>0||!!t,s=e.level??0;return s>0?this.setAttribute(`data-nested`,``):this.removeAttribute(`data-nested`),w`
            ${e.breadcrumbs&&e.breadcrumbs.length>0?w`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="breadcrumbs-bar">
                    ${e.breadcrumbs.map((e,t)=>w`
                        ${t>0?w`<span>/</span>`:_}
                        ${e.link?w`<button class="breadcrumb-link" @click="${()=>window.location.href=`${e.link}`}">${e.text}</button>`:w`<span>${e.text}</span>`}
                    `)}
                </div>
            `:_}
            ${e.noHeader?w`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                    ${e?.header?.map(e=>P(this,e,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${t?this.renderPeerNav(t):_}
                    ${r.map(this.renderBtn)}
                    ${a}
                    ${this.renderActions(i)}
                </div>
            `:o?w`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center; flex-wrap: wrap;" class="form-header">
                    ${e.avatar?P(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):_}
                    <div style="flex: 1; min-width: min(22rem, 100%); overflow: hidden;">
                        ${e?.title&&s==0?w`
                            <div style="display: flex; align-items: center; gap: var(--lumo-space-s, .5rem); min-width: 0;">
                                <h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${g(rt(e?.title,this.state??{},this.data??{}))}</h2>
                                ${e.kpisBelow&&e.badges?.length?e.badges.map(e=>pt(e,this.state??{},this.data??{})):_}
                            </div>`:_}
                        ${e?.title&&s==1?w`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${g(rt(e?.title,this.state??{},this.data??{}))}</h3>`:_}
                        ${e?.title&&s==2?w`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${g(rt(e?.title,this.state??{},this.data??{}))}</h4>`:_}
                        ${e?.title&&s==3?w`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${g(rt(e?.title,this.state??{},this.data??{}))}</h5>`:_}
                        ${e?.title&&s>3?w`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${g(rt(e?.title,this.state??{},this.data??{}))}</h6>`:_}

                        ${e?.subtitle?w`<span style="display: inline-block; margin-block-end: 0.83em;">${g(rt(e?.subtitle,this.state??{},this.data??{}))}</span>`:_}
                        ${e?.timestamp?w`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${g(rt(e.timestamp,this.state??{},this.data??{}))}</span>`:_}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e.kpisBelow?_:e?.kpis?.map(e=>w`
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div>${this.evalLabel(e.title)}</div>
                                <div>${g(rt(e.text,this.state??{},this.data??{}))}</div>
                            </div>
                        `)}
                        ${e?.header?.map(e=>P(this,e,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${t?this.renderPeerNav(t):_}
                        ${r.map(this.renderBtn)}
                        ${a}
                        ${this.renderActions(i)}
                    </div>
                </div>
            `:_}
            ${e.kpisBelow&&e?.kpis?.length?w`
                <div class="kpi-row">
                    ${e.kpis.map(e=>w`
                        <div class="kpi-pair">
                            <span class="kpi-label">${this.evalLabel(e.title)}</span>
                            <span class="kpi-value">${g(rt(e.text,this.state??{},this.data??{}))}</span>
                        </div>
                    `)}
                </div>
            `:_}
            ${e.badges&&e.badges.length>0&&!e.kpisBelow?w`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(e=>pt(e,this.state??{},this.data??{}))}
                </div>
            `:_}
        `}static{this.styles=m`
        :host {
            display: block;
            width: 100%;
            padding-top: var(--lumo-space-m);
        }

        /* When rendered nested (e.g. inside an @Inline embedded mediator, level>0) the host
           section/card already provides top spacing, so suppress this header's own padding-top. */
        :host([data-nested]) {
            padding-top: 0;
        }

        .breadcrumb-link {
            border: none;
            background: transparent;
            cursor: pointer;
            font: inherit;
            color: var(--lumo-primary-text-color, #1676f3);
            padding: 0;
        }

        /* Facts row UNDER the title (hoisted EntityHeader anatomy): label+value pairs,
           label in small caps secondary, value emphasized — mirrors the VB/Redwood header. */
        .kpi-row {
            display: flex;
            flex-wrap: wrap;
            gap: var(--lumo-space-s, .5rem) 2.5rem;
            align-items: baseline;
            padding: var(--lumo-space-xs, .25rem) 0 var(--lumo-space-s, .5rem);
        }
        .kpi-pair {
            display: flex;
            gap: var(--lumo-space-s, .5rem);
            align-items: baseline;
        }
        .kpi-label {
            font-size: var(--lumo-font-size-xs, .8125rem);
            letter-spacing: .03em;
            text-transform: uppercase;
            color: var(--lumo-secondary-text-color, #6b7280);
        }
        .kpi-value {
            font-weight: 600;
        }

        /* "…" overflow menu for secondary header actions */
        .overflow-wrap {
            position: relative;
            display: inline-block;
        }
        .overflow-btn {
            font-weight: 700;
            line-height: 1;
        }
        .overflow-menu {
            position: absolute;
            right: 0;
            top: calc(100% + .25rem);
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, .15));
            border-radius: var(--lumo-border-radius-m, 6px);
            box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0, 0, 0, .18));
            padding: .25rem;
            min-width: 13rem;
            display: flex;
            flex-direction: column;
            z-index: 30;
        }
        .overflow-item {
            text-align: left;
            border: none;
            background: transparent;
            font: inherit;
            padding: .5rem .75rem;
            border-radius: var(--lumo-border-radius-s, 4px);
            cursor: pointer;
            white-space: nowrap;
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .overflow-item:hover:not(:disabled) {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .04));
        }
        .overflow-item:disabled {
            opacity: .5;
            cursor: default;
        }

        .toolbar-divider {
            display: inline-block;
            width: 1px;
            height: 1.5rem;
            background-color: var(--lumo-contrast-20pct);
            align-self: center;
            margin: 0 4px;
        }

        /* DS-neutral toolbar button (the Vaadin adapter overrides via renderToolbarButton) */
        .mtb {
            font: inherit; font-weight: 500;
            padding: .4rem .9rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid var(--lumo-contrast-30pct, rgba(0,0,0,.25));
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            cursor: pointer;
        }
        .mtb:hover:not(:disabled) { background: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
        .mtb:disabled { opacity: .5; cursor: default; }
        .mtb.primary { background: var(--lumo-primary-color, #1676f3); color: var(--lumo-primary-contrast-color, #fff); border-color: transparent; }
        .mtb.tertiary { background: transparent; border-color: transparent; color: var(--lumo-primary-text-color, #1676f3); }
        .mtb.danger { color: var(--lumo-error-text-color, #c0392b); border-color: var(--lumo-error-color-50pct, rgba(192,57,43,.5)); }
        .mtb.danger.primary { background: var(--lumo-error-color, #c0392b); color: #fff; border-color: transparent; }

        ${fe}
    `}};O([v()],vt.prototype,`metadata`,void 0),O([v()],vt.prototype,`baseUrl`,void 0),O([v()],vt.prototype,`state`,void 0),O([v()],vt.prototype,`data`,void 0),O([v()],vt.prototype,`appState`,void 0),O([v()],vt.prototype,`appData`,void 0),O([S()],vt.prototype,`_overflowOpen`,void 0),vt=O([h(`mateu-content-header`)],vt);var yt=class extends et{constructor(...e){super(...e),this.state={},this.data={},this.appState={},this.appData={}}render(){let e=this.component?.metadata;return w`
            <div class="mateu-vlayout ${this.component?.cssClasses??``}">
                <mateu-content-header
                    .metadata="${e}"
                    .baseUrl="${this.baseUrl}"
                    .state="${this.state}"
                    .data="${this.data}"
                    .appState="${this.appState}"
                    .appData="${this.appData}"
                ></mateu-content-header>
                <div class="form-content" style="width: 100%;">
                    <slot></slot>
                    <div class="mateu-hlayout form-buttons">
                        <slot name="buttons"></slot>
                    </div>
                </div>
            </div>
       `}static{this.styles=m`
        :host {
        }

        /* DS-neutral replacements for vaadin vertical/horizontal-layout theme="spacing" */
        .mateu-vlayout {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: var(--lumo-space-m, 1rem);
            width: 100%;
        }
        .mateu-hlayout {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: var(--lumo-space-m, 1rem);
        }

        .redwood .form-header {
            background-color: rgb(44, 82, 102);
            color: var(--lumo-base-color);
            padding: 30px;
            font-family: "Times New Roman";
        }

        .form-content {
            padding-bottom: 3rem;
        }
    `}};O([v()],yt.prototype,`state`,void 0),O([v()],yt.prototype,`data`,void 0),O([v()],yt.prototype,`appState`,void 0),O([v()],yt.prototype,`appData`,void 0),yt=O([h(`mateu-form`)],yt);var bt=class extends y{constructor(...e){super(...e),this.variant=`text`,this.count=3}static{this.styles=m`
        :host {
            display: block;
            flex: 1 1 0;
            min-width: 6rem;
            width: 100%;
        }
        .bone {
            background: linear-gradient(90deg,
                var(--lumo-contrast-10pct, rgba(0,0,0,.08)) 25%,
                var(--lumo-contrast-5pct, rgba(0,0,0,.04)) 37%,
                var(--lumo-contrast-10pct, rgba(0,0,0,.08)) 63%);
            background-size: 400% 100%;
            animation: shimmer 1.4s ease infinite;
            border-radius: var(--lumo-border-radius-m, 6px);
        }
        @keyframes shimmer {
            0% { background-position: 100% 50%; }
            100% { background-position: 0 50%; }
        }
        .line { height: 1em; margin: .5em 0; }
        .line:nth-child(3n) { width: 80%; }
        .line:nth-child(3n+1) { width: 95%; }
        .line:nth-child(3n+2) { width: 60%; }
        .card { height: 9rem; }
        .row { height: 2.25rem; margin: .4em 0; }
        .form-pair { display: flex; flex-direction: column; gap: .35em; margin: .9em 0; }
        .label { height: .8em; width: 30%; }
        .field { height: 2.25em; width: 100%; }
    `}render(){let e=Array.from({length:Math.max(1,this.count)});return this.variant==`card`?w`${e.map(()=>w`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant==`grid`?w`${e.map(()=>w`<div class="bone row"></div>`)}`:this.variant==`form`?w`${e.map(()=>w`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:w`${e.map(()=>w`<div class="bone line"></div>`)}`}};O([v()],bt.prototype,`variant`,void 0),O([v({type:Number})],bt.prototype,`count`,void 0),bt=O([h(`mateu-skeleton`)],bt);var xt=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t},bubbles:!0,composed:!0}))},St=(e,t,n,r,i,a)=>w`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??`🗂`}</span>
            ${n?w`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${n}</span>`:_}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${r??e??`Nothing here yet.`}</span>
            ${i&&a?w`
                <button style="margin-top: .25rem; font: inherit; font-weight: 500; cursor: pointer; padding: .4rem .9rem; border: none; border-radius: var(--lumo-border-radius-m, 6px); background: transparent; color: var(--lumo-primary-text-color, #3b5bdb);"
                        @click="${e=>xt(e,i)}">${a}</button>
            `:_}
        </div>
    `,Ct=e=>{let t=e.metadata;return w`
        <div style="${e.style??_}" class="${e.cssClasses??_}" slot="${e.slot??_}">
            ${St(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},wt=e=>{let t=e.metadata;return w`
        <mateu-skeleton
                variant="${t.variant??`text`}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-skeleton>
    `},F=(e,t,n,r)=>{if(!e)return w``;let i=N.get()?.renderIcon;if(i){let a=i.call(N.get(),e,t,n);return r?w`<span slot="${r}">${a}</span>`:a}return w`<span class="mateu-icon ${n??``}" data-icon="${e}" aria-hidden="true"
                      style="display:inline-block; width:1em; height:1em; ${t??``}" slot="${r??_}"></span>`},Tt=`mateu-saved-views`,Et=()=>{try{return JSON.parse(localStorage.getItem(Tt)??`{}`)}catch{return{}}},Dt=e=>{try{localStorage.setItem(Tt,JSON.stringify(e))}catch{}},Ot=e=>Et()[e]??[],kt=(e,t)=>{let n=t.name?.trim();if(!n||Object.keys(t.values??{}).length===0)return;let r=Et(),i=(r[e]??[]).filter(e=>e.name!==n);i.push({...t,name:n}),r[e]=i,Dt(r)},At=(e,t)=>{let n=Et(),r=(n[e]??[]).filter(e=>e.name!==t);r.length===0?delete n[e]:n[e]=r,Dt(n)},jt=(e,t)=>{let n=Et();n[e]=(n[e]??[]).map(e=>({...e,isDefault:e.name===t&&!e.isDefault})),Dt(n)},Mt=e=>Ot(e).find(e=>e.isDefault),I=class extends y{constructor(...e){super(...e),this.baseUrl=``,this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.viewsOpened=!1,this.draftText=``,this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{let e=this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId]),t={searchText:void 0};e.forEach(e=>{t[e]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent(`filter-reset-requested`,{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return this.metadata?.filters??[]}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent(`search-requested`,{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){let t=this.filters.find(t=>t.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e===`searchText`?``:void 0),this.requestSearch()}commitText(e){this.emitValueChanged(`searchText`,e.value),this.draftText=``,e.value=``,this.requestSearch()}get viewsScope(){return window.location.pathname}allFilterKeys(){return[`searchText`,...this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])]}snapshotValues(){let e={};return this.state.searchText&&(e.searchText=this.state.searchText),this.filters.forEach(t=>{if(this.isSet(t))if(this.isRangeFilter(t)){let n=this.rangeBound(t,`from`),r=this.rangeBound(t,`to`);n&&(e[`${t.fieldId}_from`]=n),r&&(e[`${t.fieldId}_to`]=r)}else this.isMultiFilter(t)?e[t.fieldId]=this.multiValues(t):e[t.fieldId]=this.state[t.fieldId]}),e}applyView(e){let t=this.allFilterKeys(),n={};t.forEach(e=>{n[e]=void 0}),this.state={...this.state,...n},this.dispatchEvent(new CustomEvent(`filter-reset-requested`,{detail:{fieldIds:t},bubbles:!0,composed:!0})),Object.entries(e.values).forEach(([e,t])=>this.emitValueChanged(e,t)),this.viewsOpened=!1,this.detachOutsideClick(),this.requestSearch()}saveCurrentView(e){let t=e.value.trim();t&&(kt(this.viewsScope,{name:t,values:this.snapshotValues()}),e.value=``,this.requestUpdate())}firstUpdated(){if(window.location.search)return;let e=Mt(this.viewsScope);e&&setTimeout(()=>{this.state.searchText||this.filters.some(e=>this.isSet(e))||this.applyView(e)},0)}isBooleanFilter(e){return e.dataType===`boolean`||e.dataType===`bool`||e.stereotype===`checkbox`||e.stereotype===`toggle`}isNumericFilter(e){return[`integer`,`decimal`,`number`,`money`].includes(e.dataType??``)}isRangeFilter(e){return e.stereotype===`dateRange`||e.stereotype===`numberRange`}isMultiFilter(e){return e.stereotype===`multiSelect`}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){let t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t==`string`&&t!==``?t.split(`,`).map(e=>e.trim()).filter(e=>e):[]}rangeBound(e,t){let n=this.state[`${e.fieldId}_${t}`];return n==null?``:String(n)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,`from`)!==``||this.rangeBound(e,`to`)!==``;if(this.isMultiFilter(e))return this.multiValues(e).length>0;let t=this.state[e.fieldId];return t!=null&&t!==``&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){let n=e.options.find(e=>e.value===String(t));if(n)return n.label??n.value}return typeof t==`boolean`?t?`Yes`:`No`:String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){let t=this.rangeBound(e,`from`),n=this.rangeBound(e,`to`);return t&&n?`${t} – ${n}`:t?`≥ ${t}`:`≤ ${n}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(`, `):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return j(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,n=`panel-row`){return w`
            <div class="${n}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){let t=e.stereotype===`numberRange`?`number`:e.dataType===`dateTime`?`datetime-local`:e.dataType===`time`?`time`:`date`,n=t=>{let n=t.closest(`.panel-input-row`),r=n.querySelector(`input.range-from`).value,i=n.querySelector(`input.range-to`).value;this.emitValueChanged(`${e.fieldId}_from`,r===``?void 0:r),this.emitValueChanged(`${e.fieldId}_to`,i===``?void 0:i),this.requestSearch()},r=e=>{e.key===`Enter`&&n(e.target),e.key===`Escape`&&this.closePanel()};return w`
            <div class="panel-input-row">
                <input class="range-from" type="${t}" placeholder="From"
                       .value="${this.rangeBound(e,`from`)}"
                       @mousedown="${e=>e.stopPropagation()}"
                       @keydown="${r}"/>
                <span class="range-separator" aria-hidden="true">–</span>
                <input class="range-to" type="${t}" placeholder="To"
                       .value="${this.rangeBound(e,`to`)}"
                       @mousedown="${e=>e.stopPropagation()}"
                       @keydown="${r}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${e=>n(e.target)}">Apply</button>
            </div>`}renderMultiWidget(e){let t=this.multiValues(e),n=n=>{let r=t.includes(n)?t.filter(e=>e!==n):[...t,n];this.emitValueChanged(e.fieldId,r.length>0?r:void 0),this.dispatchEvent(new CustomEvent(`search-requested`,{detail:{},bubbles:!0,composed:!0}))};return w`${(e.options??[]).map(e=>this.panelRow(w`
            <span class="multi-check ${t.includes(e.value)?`multi-check--on`:``}"
                  aria-hidden="true">${t.includes(e.value)?`✓`:``}</span>
            ${e.label??e.value}
        `,()=>n(e.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return w`${e.options.map(t=>this.panelRow(t.label??t.value,()=>this.applyFilter(e.fieldId,t.value)))}`;if(this.isBooleanFilter(e))return w`
                ${this.panelRow(`Yes`,()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow(`No`,()=>this.applyFilter(e.fieldId,!1))}`;let t=this.isNumericFilter(e),n=n=>{n.value!==``&&this.applyFilter(e.fieldId,t?Number(n.value):n.value)};return w`
            <div class="panel-input-row">
                <input type="${t?`number`:`text`}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${e=>e.stopPropagation()}"
                       @keydown="${e=>{e.key===`Enter`&&n(e.target),e.key===`Escape`&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${e=>n(e.target.previousElementSibling)}">Apply</button>
            </div>`}renderViewsPanel(){if(!this.viewsOpened)return _;let e=Ot(this.viewsScope),t=!!this.state.searchText||this.filters.some(e=>this.isSet(e));return w`
            <div class="panel views-panel">
                <div class="panel-caption">Saved views</div>
                ${e.length===0?w`
                    <div class="panel-row views-empty">No saved views yet</div>`:_}
                ${e.map(e=>w`
                    <div class="panel-row view-row" @mousedown="${this.keepFocus}">
                        <span class="view-name" @click="${()=>this.applyView(e)}">${e.name}</span>
                        <button class="view-star ${e.isDefault?`view-star--on`:``}"
                                title="${e.isDefault?`Unset as default`:`Open this listing with this view`}"
                                @click="${()=>{jt(this.viewsScope,e.name),this.requestUpdate()}}">★</button>
                        <button class="chip-remove" aria-label="Delete view ${e.name}"
                                @click="${()=>{At(this.viewsScope,e.name),this.requestUpdate()}}">✕</button>
                    </div>`)}
                ${t?w`
                    <div class="panel-input-row" @mousedown="${e=>e.stopPropagation()}">
                        <input class="view-name-input" type="text" placeholder="Save current view as…"
                               @keydown="${e=>{e.key===`Enter`&&this.saveCurrentView(e.target),e.key===`Escape`&&(this.viewsOpened=!1)}}"/>
                        <button class="apply-button"
                                @click="${e=>this.saveCurrentView(e.target.previousElementSibling)}">Save</button>
                    </div>`:w`
                    <div class="panel-row views-empty">Apply some filters to save a view</div>`}
            </div>`}renderPanel(){if(!this.panelOpened||this.filters.length===0)return _;if(this.activeFilter){let e=this.activeFilter;return w`
                <div class="panel">
                    <div class="panel-row panel-header"
                         @mousedown="${this.keepFocus}"
                         @click="${()=>{this.activeFilter=void 0}}">
                        <span aria-hidden="true">←</span> ${this.labelOf(e)}
                    </div>
                    ${this.renderActiveFilterWidget(e)}
                </div>`}let e=!!this.state.searchText||this.filters.some(e=>this.isSet(e));return w`
            <div class="panel">
                <div class="panel-caption">Filter by</div>
                ${this.filters.map(e=>this.panelRow(w`
                    ${this.labelOf(e)}
                    ${this.isSet(e)?w`<span class="current-value">${this.conditionDisplay(e)}</span>`:_}
                `,()=>{this.activeFilter=e}))}
                ${e?this.panelRow(`Clear filters`,this.clearAllFilters,`panel-row panel-footer`):_}
            </div>`}render(){let e=[];return this.state.searchText&&e.push({fieldId:`searchText`,label:`Text`,display:String(this.state.searchText)}),this.filters.forEach(t=>{this.isSet(t)&&e.push({fieldId:t.fieldId,label:this.labelOf(t),display:this.conditionDisplay(t)})}),w`
            <div class="smart-search">
                <div class="bar"
                     @click="${e=>{e.currentTarget.querySelector(`input.free-text`)?.focus(),this.openPanel()}}">
                    <svg aria-hidden="true" class="magnifier" width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
                    </svg>
                    ${e.map(e=>w`
                        <span theme="badge contrast pill" class="chip">
                            <span class="chip-label">${e.label}:</span> ${e.display}
                            <button class="chip-remove" aria-label="Remove filter ${e.label}"
                                    @mousedown="${this.keepFocus}"
                                    @click="${t=>{t.stopPropagation(),this.removeChip(e.fieldId)}}">✕</button>
                        </span>`)}
                    ${this.metadata?.searchable===!1?_:w`
                        <input class="free-text" type="text" id="searchText"
                               placeholder="${e.length===0?`Search`:``}"
                               autofocus="${this.metadata?.autoFocusOnSearchText?!0:_}"
                               .value="${this.draftText??``}"
                               @input="${e=>{this.draftText=e.target.value,this.openPanel()}}"
                               @keydown="${e=>{e.key===`Enter`&&this.commitText(e.target),e.key===`Escape`&&this.closePanel()}}"/>
                    `}
                    <button class="views-button" title="Saved views" aria-label="Saved views"
                            @mousedown="${this.keepFocus}"
                            @click="${e=>{e.stopPropagation(),this.closePanel(),this.viewsOpened=!this.viewsOpened,this.viewsOpened&&(this.outsideClick=e=>{e.composedPath().includes(this)||(this.viewsOpened=!1,this.detachOutsideClick())},document.addEventListener(`mousedown`,this.outsideClick))}}">
                        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"/>
                        </svg>
                    </button>
                </div>
                ${this.renderPanel()}
                ${this.renderViewsPanel()}
            </div>
            <slot></slot>
        `}static{this.styles=m`
        ${fe}
        :host {
            width: 100%;
        }
        .smart-search {
            position: relative;
            padding: var(--lumo-space-xs, 0.25rem) 0;
        }
        .bar {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            flex-wrap: wrap;
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            padding: 0.3rem 0.6rem;
            cursor: text;
        }
        .bar:focus-within {
            box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct, rgba(0, 100, 200, 0.5));
        }
        .magnifier {
            flex: none;
            opacity: 0.6;
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .chip {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            white-space: nowrap;
        }
        .chip-label {
            opacity: 0.7;
        }
        .chip-remove {
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 0.7rem;
            line-height: 1;
            padding: 0.1rem 0.2rem;
            color: inherit;
            opacity: 0.6;
        }
        .chip-remove:hover {
            opacity: 1;
        }
        .free-text {
            flex: 1 1 8rem;
            min-width: 7rem;
            border: none;
            outline: none;
            background: transparent;
            font: inherit;
            font-size: var(--lumo-font-size-m, 1rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            padding: 0.25rem 0;
        }
        .panel {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            min-width: 20rem;
            max-width: 100%;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 16px rgba(0, 0, 0, 0.15));
            z-index: 200;
            overflow: hidden;
            padding: 0.25rem 0;
        }
        .views-panel {
            left: auto;
            right: 0;
        }
        .views-button {
            margin-left: auto;
            flex-shrink: 0;
            border: none;
            background: none;
            cursor: pointer;
            padding: 0.15rem 0.3rem;
            color: var(--lumo-secondary-text-color, #555);
            line-height: 1;
        }
        .views-button:hover {
            color: var(--lumo-primary-text-color, #1676f3);
        }
        .view-row {
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .view-name {
            flex: 1 1 auto;
            cursor: pointer;
        }
        .view-star {
            border: none;
            background: none;
            cursor: pointer;
            color: var(--lumo-contrast-40pct, #999);
            padding: 0 0.15rem;
        }
        .view-star--on {
            color: var(--lumo-primary-text-color, #1676f3);
        }
        .views-empty {
            color: var(--lumo-secondary-text-color, #777);
            font-size: var(--lumo-font-size-s, 0.875rem);
            cursor: default;
        }
        .view-name-input {
            flex: 1 1 auto;
        }
        .panel-caption {
            padding: 0.35rem 0.75rem;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.6));
        }
        .panel-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.45rem 0.75rem;
            cursor: pointer;
            color: var(--lumo-body-text-color, #1a1a1a);
            font-size: var(--lumo-font-size-s, 0.875rem);
        }
        .panel-row:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
        }
        .panel-header {
            font-weight: 600;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
        }
        .panel-footer {
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
            color: var(--lumo-primary-text-color, rgb(0, 100, 200));
        }
        .current-value {
            margin-left: auto;
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
            font-size: var(--lumo-font-size-xs, 0.8125rem);
        }
        .panel-input-row {
            display: flex;
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
        }
        .range-separator {
            align-self: center;
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
        }
        .multi-check {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1rem;
            height: 1rem;
            border: 1px solid var(--lumo-contrast-40pct, rgba(0, 0, 0, 0.35));
            border-radius: 3px;
            font-size: 0.7rem;
            line-height: 1;
            flex: none;
        }
        .multi-check--on {
            background: var(--lumo-primary-color, rgb(0, 100, 200));
            border-color: var(--lumo-primary-color, rgb(0, 100, 200));
            color: var(--lumo-primary-contrast-color, #fff);
        }
        .panel-input-row input {
            flex: 1;
            font: inherit;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-30pct, rgba(0, 0, 0, 0.3));
            border-radius: var(--lumo-border-radius-s, 4px);
            padding: 0.35rem 0.5rem;
            outline: none;
        }
        .apply-button {
            font: inherit;
            font-size: var(--lumo-font-size-s, 0.875rem);
            background: var(--lumo-primary-color, rgb(0, 100, 200));
            color: var(--lumo-primary-contrast-color, #fff);
            border: 1px solid transparent;
            border-radius: var(--lumo-border-radius-s, 4px);
            padding: 0.35rem 0.75rem;
            cursor: pointer;
        }
    `}};O([v()],I.prototype,`metadata`,void 0),O([v()],I.prototype,`baseUrl`,void 0),O([S()],I.prototype,`state`,void 0),O([S()],I.prototype,`data`,void 0),O([v()],I.prototype,`appState`,void 0),O([v()],I.prototype,`appData`,void 0),O([v({type:Boolean})],I.prototype,`searchOnly`,void 0),O([S()],I.prototype,`panelOpened`,void 0),O([S()],I.prototype,`viewsOpened`,void 0),O([S()],I.prototype,`activeFilter`,void 0),O([S()],I.prototype,`draftText`,void 0),I=O([h(`mateu-filter-bar`)],I);var Nt=`mateu-column-prefs`,Pt=()=>{try{let e=JSON.parse(localStorage.getItem(Nt)??`{}`);return e&&typeof e==`object`&&!Array.isArray(e)?e:{}}catch{return{}}},Ft=e=>{try{localStorage.setItem(Nt,JSON.stringify(e))}catch{}},It=e=>{if(!e||typeof e!=`object`)return;let t=e=>Array.isArray(e)?e.filter(e=>typeof e==`string`):[];return{hidden:t(e.hidden),order:t(e.order)}},Lt=e=>It(Pt()[e]),Rt=(e,t)=>{let n=Pt(),r=It(t);r.hidden.length===0&&r.order.length===0?delete n[e]:n[e]=r,Ft(n)},zt=e=>{let t=Pt();delete t[e],Ft(t)},Bt=e=>e?!!e.identifier||e.dataType===`action`||e.dataType===`actionGroup`||e.dataType===`menu`||e.id===`select`||e.id===`menu`:!1,Vt=(e,t,n=e=>e)=>{let r=It(t);if(!r||r.hidden.length===0&&r.order.length===0)return e;let i=e=>n(e)?.id??e.id,a=new Set(r.hidden),o=e.filter(e=>{let t=i(e);return!t||!a.has(t)||Bt(n(e))});if(r.order.length===0)return o.length===e.length?e:o;let s=new Map;o.forEach(e=>{let t=i(e);t&&!s.has(t)&&s.set(t,e)});let c=[],l=new Set;return r.order.forEach(e=>{let t=s.get(e);t&&!l.has(t)&&(c.push(t),l.add(t))}),o.forEach(e=>{l.has(e)||(c.push(e),l.add(e))}),c.length===e.length&&c.every((t,n)=>t===e[n])?e:c},Ht=class extends y{constructor(...e){super(...e),this.columns=[],this.scope=``,this.panelOpened=!1,this.revision=0,this.togglePanel=()=>{if(this.panelOpened){this.closePanel();return}this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick)},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1},this.reset=()=>{zt(this.scope),this.revision++,this.dispatchEvent(new CustomEvent(`column-prefs-changed`,{bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}get prefs(){return Lt(this.scope)??{hidden:[],order:[]}}effectiveEntries(e){return Vt(this.columns,{hidden:[],order:e.order})}commit(e){Rt(this.scope,e),this.revision++,this.dispatchEvent(new CustomEvent(`column-prefs-changed`,{bubbles:!0,composed:!0}))}toggleVisibility(e){let t=this.prefs,n=t.hidden.includes(e)?t.hidden.filter(t=>t!==e):[...t.hidden,e];this.commit({...t,hidden:n})}move(e,t){let n=this.prefs,r=[...this.effectiveEntries(n)],i=r.findIndex(t=>t.id===e);if(i<0)return;let a=i+t;for(;a>=0&&a<r.length&&r[a].protected;)a+=t;if(a<0||a>=r.length)return;let o=r[i];r[i]=r[a],r[a]=o,this.commit({...n,order:r.map(e=>e.id)})}render(){this.revision;let e=this.prefs,t=this.effectiveEntries(e).filter(e=>!e.protected);if(t.length===0)return w``;let n=e.hidden.length>0||e.order.length>0;return w`
            <div class="chooser">
                <button
                    class="trigger ${n?`active`:``}"
                    type="button"
                    title="Columns"
                    aria-label="Columns"
                    aria-haspopup="true"
                    aria-expanded="${this.panelOpened}"
                    @click="${this.togglePanel}"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <rect x="1" y="2" width="4" height="12" rx="1" fill="currentColor"/>
                        <rect x="6" y="2" width="4" height="12" rx="1" fill="currentColor" opacity="0.65"/>
                        <rect x="11" y="2" width="4" height="12" rx="1" fill="currentColor" opacity="0.35"/>
                    </svg>
                </button>
                ${this.panelOpened?w`
                    <div class="panel" role="menu">
                        <div class="panel-title">Columns</div>
                        ${t.map((n,r)=>{let i=e.hidden.includes(n.id);return w`
                                <div class="row" data-column-id="${n.id}">
                                    <label class="row-label">
                                        <input
                                            type="checkbox"
                                            .checked="${!i}"
                                            @change="${()=>this.toggleVisibility(n.id)}"
                                        />
                                        <span class="${i?`muted`:``}">${n.label||n.id}</span>
                                    </label>
                                    <button class="move" type="button" title="Move up" aria-label="Move ${n.label||n.id} up"
                                        ?disabled="${r===0}"
                                        @click="${()=>this.move(n.id,-1)}">↑</button>
                                    <button class="move" type="button" title="Move down" aria-label="Move ${n.label||n.id} down"
                                        ?disabled="${r===t.length-1}"
                                        @click="${()=>this.move(n.id,1)}">↓</button>
                                </div>
                            `})}
                        <div class="footer">
                            <button class="reset" type="button" ?disabled="${!n}" @click="${this.reset}">Reset</button>
                        </div>
                    </div>
                `:_}
            </div>
        `}static{this.styles=m`
        :host {
            display: block;
            flex: none;
        }
        .chooser {
            position: relative;
        }
        .trigger {
            border: none;
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            cursor: pointer;
            padding: 0.45rem 0.55rem;
            line-height: 0;
            color: var(--lumo-secondary-text-color, #555);
        }
        .trigger:hover {
            color: var(--lumo-primary-text-color, #1676f3);
        }
        .trigger.active {
            color: var(--lumo-primary-text-color, #1676f3);
        }
        .panel {
            position: absolute;
            top: calc(100% + 4px);
            right: 0;
            min-width: 15rem;
            max-height: 22rem;
            overflow-y: auto;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 16px rgba(0, 0, 0, 0.15));
            z-index: 200;
            padding: 0.25rem 0;
        }
        .panel-title {
            font-size: var(--lumo-font-size-xs, 0.8rem);
            font-weight: 600;
            color: var(--lumo-secondary-text-color, #555);
            text-transform: uppercase;
            letter-spacing: 0.03em;
            padding: 0.35rem 0.75rem 0.25rem;
        }
        .row {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.15rem 0.5rem 0.15rem 0.75rem;
        }
        .row:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.03));
        }
        .row-label {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 0.45rem;
            cursor: pointer;
            font-size: var(--lumo-font-size-s, 0.9rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            min-width: 0;
        }
        .row-label span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .row-label .muted {
            color: var(--lumo-secondary-text-color, #777);
        }
        .row-label input {
            accent-color: var(--lumo-primary-color, #1676f3);
            margin: 0;
            flex: none;
        }
        .move {
            border: none;
            background: transparent;
            cursor: pointer;
            padding: 0.15rem 0.3rem;
            line-height: 1;
            color: var(--lumo-secondary-text-color, #555);
            border-radius: var(--lumo-border-radius-s, 0.15rem);
        }
        .move:hover:not([disabled]) {
            color: var(--lumo-primary-text-color, #1676f3);
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
        }
        .move[disabled] {
            opacity: 0.3;
            cursor: default;
        }
        .footer {
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
            margin-top: 0.25rem;
            padding: 0.35rem 0.75rem 0.15rem;
            display: flex;
            justify-content: flex-end;
        }
        .reset {
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: var(--lumo-font-size-s, 0.9rem);
            color: var(--lumo-primary-text-color, #1676f3);
            padding: 0.15rem 0.3rem;
        }
        .reset[disabled] {
            opacity: 0.4;
            cursor: default;
        }
    `}};O([v()],Ht.prototype,`columns`,void 0),O([v()],Ht.prototype,`scope`,void 0),O([S()],Ht.prototype,`panelOpened`,void 0),O([S()],Ht.prototype,`revision`,void 0),Ht=O([h(`mateu-column-chooser`)],Ht);function Ut(e,t){return t?t.split(`.`).reduce((e,t)=>typeof e==`object`&&e?e[t]:void 0,e):e}function Wt(e,t,n=`value`,r=`label`){let i=Ut(e,t);return Array.isArray(i)?i.map(e=>{if(typeof e==`object`&&e){let t=Ut(e,n),i=Ut(e,r);return{value:t??i,label:String(i??t??``)}}return{value:e,label:String(e)}}):[]}function Gt(e,t,n){let r=Ut(e,t);return Array.isArray(r)?r.map(e=>{let t={};for(let r of n)t[r]=Ut(e,r);return t}):[]}async function Kt(e,t,n){let r=t(e.url)??e.url,i=(e.method||`GET`).toUpperCase(),a={};for(let[n,r]of Object.entries(e.headers??{}))a[n]=t(r)??r;let o={method:i,headers:a};i!==`GET`&&i!==`HEAD`&&e.body&&(o.body=t(e.body)??e.body);let s=await n(r,o);if(!s.ok)throw Error(`External REST fetch failed: ${s.status}`);return s.json()}async function qt(e,t=e=>e,n=fetch){return Wt(await Kt(e,t,n),e.itemsPath,e.valuePath,e.labelPath)}async function Jt(e,t,n=e=>e,r=fetch){return Gt(await Kt(e,n,r),e.itemsPath,t)}var Yt=class extends y{constructor(...e){super(...e),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has(`totalElements`)||e.has(`pageSize`))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent(`page-changed`,{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return _;let e=this.totalPages>1,t=this.pageNumber,n=t===0,r=t>=this.totalPages-1;return w`
            <div class="bar">
                ${e?w`
                    <button class="nav" title="First page" ?disabled="${n}"
                        @click="${()=>this.dispatch(0)}" data-testid="page-first">«</button>
                    <button class="nav" title="Previous page" ?disabled="${n}"
                        @click="${()=>this.dispatch(t-1)}" data-testid="page-prev">‹</button>
                    <span class="page-indicator">Page ${t+1} of ${this.totalPages}</span>
                    <button class="nav" title="Next page" ?disabled="${r}"
                        @click="${()=>this.dispatch(t+1)}" data-testid="page-next">›</button>
                    <button class="nav" title="Last page" ?disabled="${r}"
                        @click="${()=>this.dispatch(this.totalPages-1)}" data-testid="page-last">»</button>
                    <span class="separator"></span>
                `:_}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?``:`s`}</span>
                <slot></slot>
            </div>
        `}static{this.styles=m`
        :host {
            display: block;
            width: 100%;
        }
        .bar {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: var(--lumo-space-s, 0.5rem);
        }
        /* tertiary icon button, DS-neutral */
        .nav {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 2rem;
            height: 2rem;
            padding: 0 0.35rem;
            border: none;
            background: transparent;
            color: var(--lumo-primary-text-color, #1a73e8);
            font-size: 1.1rem;
            line-height: 1;
            border-radius: var(--lumo-border-radius-m, 6px);
            cursor: pointer;
        }
        .nav:hover:not(:disabled) { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .nav:disabled { color: var(--lumo-disabled-text-color, #bbb); cursor: default; }
        .page-indicator {
            font-size: var(--lumo-font-size-s);
            color: var(--lumo-secondary-text-color);
            white-space: nowrap;
        }
        .total-count {
            font-size: var(--lumo-font-size-s);
            color: var(--lumo-secondary-text-color);
            white-space: nowrap;
        }
        .separator {
            display: inline-block;
            width: 1px;
            height: 1.2rem;
            background-color: var(--lumo-contrast-20pct);
            align-self: center;
            margin: 0 4px;
        }
    `}};O([v()],Yt.prototype,`totalElements`,void 0),O([v()],Yt.prototype,`pageSize`,void 0),O([v()],Yt.prototype,`pageNumber`,void 0),O([S()],Yt.prototype,`totalPages`,void 0),Yt=O([h(`mateu-pagination`)],Yt);var Xt=`var(--lumo-space-m, 1rem)`,Zt=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.columnWidth||`13rem`,l=`display: grid; grid-template-columns: ${s.maxColumns&&s.maxColumns>0?`repeat(${s.maxColumns}, minmax(0, 1fr))`:`repeat(auto-fill, minmax(min(100%, ${c}), 1fr))`}; gap: ${Xt} var(--lumo-space-l, 1.5rem); align-items: start;`;return s.labelsAside&&(l+=` --mateu-label-width: 10rem;`),s.fullWidth&&(l+=` width: 100%;`),l+=t.style??``,w`
        <div style="${l}" class="${t.cssClasses}" slot="${t.slot||_}">
            ${t.children?.map(t=>Qt(s,e,t,n,r,i,a,o))}
        </div>
    `},Qt=(e,t,n,r,i,a,o,s)=>n.type==k.ClientSide&&n.metadata?.type==A.FormRow?tn(e,t,n,r,i,a,o,s):w`<div style="grid-column: span ${$t(n)}; min-width: 0;">${e.labelsAside?en(t,n,r,i,a,o,s):P(t,n,r,i,a,o,s)}</div>`,$t=e=>{if(e.type==k.ClientSide){let t=e.metadata;if(t?.type==A.FormField)return t.colspan||1}return 1},en=(e,t,n,r,i,a,o)=>{if(t.type==k.ClientSide&&t.metadata?.type==A.FormField&&t.metadata.label){let s=t.metadata;return w`
            <div style="display: flex; gap: ${Xt}; align-items: baseline;">
                <label style="flex: 0 0 var(--mateu-label-width, 10rem); color: var(--lumo-secondary-text-color, #667);">${s.label?.includes("${")?e._evalTemplate(s.label):s.label}</label>
                <div style="flex: 1; min-width: 0;">${P(e,t,n,r,i,a,o,!0)}</div>
            </div>
        `}return P(e,t,n,r,i,a,o)},tn=(e,t,n,r,i,a,o,s)=>w`
        <div style="grid-column: 1 / -1; display: flex; gap: ${Xt}; flex-wrap: wrap;">
            ${n.children?.map(c=>w`<div style="flex: 1 1 ${100/Math.max(1,n.children.length)}%; min-width: min(100%, 13rem);">${Qt(e,t,c,r,i,a,o,s)}</div>`)}
        </div>
    `,nn=(e,t,n,r,i,a,o,s)=>{let c=n.metadata,l=`display: flex; flex-direction: ${e};`;c.spacing&&(l+=` gap: ${Xt};`),c.padding&&(l+=` padding: var(--lumo-space-m, 1rem);`),c.wrap&&(l+=` flex-wrap: wrap;`),c.fullWidth&&(l+=` width: 100%;`),c.justification&&(l+=` justify-content: ${c.justification};`);let u=e===`row`?c.verticalAlignment:c.horizontalAlignment;return u&&(l+=` align-items: ${u};`),l+=n.style??``,w`
        <div style="${l}" class="${n.cssClasses}" slot="${n.slot??_}">
            ${n.children?.map(e=>P(t,e,r,i,a,o,s))}
        </div>
    `},rn=(e,t,n,r,i,a,o)=>nn(`row`,e,t,n,r,i,a,o),an=(e,t,n,r,i,a,o)=>nn(`column`,e,t,n,r,i,a,o),on=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=`display: flex; flex-direction: ${s.orientation===`vertical`?`column`:`row`}; gap: var(--lumo-space-s, 0.5rem);`;return s.fullWidth&&(c+=` width: 100%;`),c+=t.style??``,w`
        <div style="${c}" class="${t.cssClasses}" slot="${t.slot??_}">
            <div style="flex: 1; min-width: 0; min-height: 0;">${P(e,t.children[0],n,r,i,a,o)}</div>
            <div style="flex: 1; min-width: 0; min-height: 0;">${P(e,t.children[1],n,r,i,a,o)}</div>
        </div>
    `},sn=(e,t,n,r,i,a,o)=>{let s=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,l=!!i?.hasDetail||!!s,u=c??s;return w`
        <div style="display: flex; gap: var(--lumo-space-m, 1rem); ${t.style??``}" class="${t.cssClasses}" slot="${t.slot??_}">
            <div style="flex: 1; min-width: 0;">${P(e,t.children[0],n,r,i,a,o)}</div>
            ${l&&u?w`<div style="flex: 1; min-width: 0;">${P(e,u,n,r,i,a,o)}</div>`:w`<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem);">Select an item to view details</div>`}
        </div>
    `},cn=(e,t,n,r,i,a,o)=>{let s=t.style??``;t.metadata.fullWidth&&(s+=` width: 100%;`);let c=Math.max(0,(t.children??[]).findIndex(e=>e.metadata.active));return w`
        <div style="${s}" class="${t.cssClasses}" slot="${t.slot??_}">
            ${t.children?.map((t,s)=>{let l=t,u=l.metadata.label,d=u?.includes("${")?e._evalTemplate(u):u;return w`
                    <details ?open="${s===c}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));">
                        <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600;">${d}</summary>
                        <div style="padding: var(--lumo-space-m, 1rem) 0;">
                            ${l.children?.map(t=>P(e,t,n,r,i,a,o))}
                        </div>
                    </details>
                `})}
        </div>
    `},ln=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style??``;return s.fullWidth&&(c+=` width: 100%;`),w`
        <div style="${c}" class="${t.cssClasses}" slot="${t.slot??_}">
            ${t.children?.map(t=>un(e,t,n,r,i,a,o,s.variant))}
        </div>
    `},un=(e,t,n,r,i,a,o,s)=>{let c=t.metadata,l=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return w`
        <details ?open="${c.active}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); ${t.style??``}" class="${t.cssClasses}">
            <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600; ${c.disabled?`pointer-events: none; opacity: .5;`:``}">${l}</summary>
            <div style="padding: var(--lumo-space-s, .5rem) 0;">
                ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
            </div>
        </details>
    `},dn=(e,t,n,r,i,a,o)=>w`
        <div style="overflow: auto; ${t.style??``}" class="${t.cssClasses}" slot="${t.slot??_}">
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </div>
    `,fn=(e,t,n,r,i,a,o)=>w`
        <div style="width: 100%; ${t.style}" class="${t.cssClasses}" slot="${t.slot??_}">
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </div>
    `,pn=(e,t,n,r,i,a,o)=>w`
        <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" class="${t.cssClasses}" slot="${t.slot??_}">
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </div>
    `,mn=(e,t,n,r,i,a,o)=>w`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: ${Xt}; ${t.style}" class="${t.cssClasses}" slot="${t.slot??_}">
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </div>
    `,hn=(e,t,n,r,i,a,o)=>w`
        <div style="display: flex; gap: ${Xt}; flex-wrap: wrap; ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </div>
    `,gn=(e,t,n,r,i,a,o)=>w`
        <div style="flex: ${t.metadata.boardCols??1} 1 0; min-width: min(100%, 12rem); ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </div>
    `,_n=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`
        <div
                style="display: flex; flex-direction: column; overflow: auto; ${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??_}"
        >
            ${s.page.content.map(t=>P(e,t,n,r,i,a,o))}
        </div>
    `},vn=e=>{let t=e.metadata;return(t?.content??t?.columns??[]).filter(e=>e&&e.metadata).map(e=>{let t=e.metadata;return{id:e.id??``,label:t?.label??e.id??``,autoWidth:t?.autoWidth,width:t?.width}})},yn=(e,t)=>{let n=e?.[t];return n==null?``:typeof n==`object`?n.text??n.label??n.value??``:String(n)},bn=(e,t,n)=>{let r=vn(e);return w`
        <div style="overflow:auto; width:100%; ${e.style}" class="${e.cssClasses}" slot="${e.slot??_}">
            <table style="border-collapse:collapse; width:100%; font-size: var(--lumo-font-size-s,.875rem);">
                <thead><tr>${r.map(e=>w`<th style="${`text-align:left; padding:.45rem .6rem; border-bottom:2px solid var(--lumo-contrast-20pct,rgba(0,0,0,.2)); font-weight:600; white-space:nowrap; color: var(--lumo-secondary-text-color,#556);`}">${e.label}</th>`)}</tr></thead>
                <tbody>
                    ${(t??[]).length===0?w`<tr><td colspan="${Math.max(1,r.length)}" style="padding:1.5rem; text-align:center; color: var(--lumo-secondary-text-color,#888);">${n??`No data.`}</td></tr>`:t.map(e=>w`<tr>${r.map(t=>w`<td style="${`padding:.4rem .6rem; border-bottom:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.08)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:24rem;`}" title="${yn(e,t.id)}">${yn(e,t.id)}</td>`)}</tr>`)}
                </tbody>
            </table>
        </div>
    `},xn=(e,t)=>{let n=e.metadata;return e.id&&t&&t[e.id]?t[e.id]:n?.page?.content??[]},Sn=e=>{let t=e.metadata.items??[];return w`
        <div class="mateu-message-list ${e.cssClasses??``}"
             style="display:flex; flex-direction:column; gap:.75rem; ${e.style??``}"
             slot="${e.slot??_}">
            ${t.map(e=>w`
                <div style="display:flex; gap:.6rem; align-items:flex-start;">
                    <span style="flex:0 0 auto; width:2rem; height:2rem; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:.8rem; background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);">
                        ${e.userImg?w`<img src="${e.userImg}" alt="" style="width:100%; height:100%; object-fit:cover;">`:e.userAbbr??(e.userName?e.userName.charAt(0):`?`)}
                    </span>
                    <div style="min-width:0;">
                        <div style="display:flex; gap:.5rem; align-items:baseline;">
                            ${e.userName?w`<span style="font-weight:600;">${e.userName}</span>`:_}
                            ${e.time?w`<span style="font-size:var(--lumo-font-size-xs,.75rem); color:var(--lumo-secondary-text-color,#666);">${e.time}</span>`:_}
                        </div>
                        <div style="white-space:pre-wrap; overflow-wrap:anywhere;">${e.text}</div>
                    </div>
                </div>
            `)}
        </div>
    `},Cn=(e,t,n,r,i,a,o)=>t.separator?w`<span style="align-self: stretch; width: 1px; background: var(--lumo-contrast-20pct, rgba(0,0,0,.2));"></span>`:t.submenus?w`
            <details style="position: relative;">
                <summary style="cursor: pointer; list-style: none; padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);">
                    ${t.component?P(e,t.component,n,r,i,a,o):t.label} ▾
                </summary>
                <div style="display: flex; flex-direction: column; gap: .1rem; padding: .3rem; min-width: 10rem;
                            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px);
                            background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15));">
                    ${t.submenus.map(t=>Cn(e,t,n,r,i,a,o))}
                </div>
            </details>
        `:w`
        <span class="${t.className??``}"
              style="cursor: ${t.disabled?`default`:`pointer`}; opacity: ${t.disabled?.5:1};
                     padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
                     ${t.selected?`background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));`:``}">
            ${t.component?P(e,t.component,n,r,i,a,o):t.label}
        </span>
    `,wn=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`
        <div style="display: flex; flex-wrap: wrap; gap: .25rem; align-items: center; ${t.style}"
             class="${t.cssClasses}" slot="${t.slot??_}">
            ${s.options?.map(t=>Cn(e,t,n,r,i,a??{},o??{}))}
        </div>
    `},Tn=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`
        <div style="${t.style}" class="${t.cssClasses}" slot="${t.slot??_}">
            ${P(e,s.wrapped,n,r,i,a,o)}
        </div>
    `},En=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.content?.metadata,l=c?.type==A.Notice&&c.fullWidth===!0;return w`
        <div style="display:flex; flex-direction:column; ${l?`width: 100%; `:``}${t.style}"
             class="${t.cssClasses}"
             slot="${t.slot??_}"
             data-colspan="${s.colspan||(l?99:_)}"
        >
            ${s.label?w`<label style="font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${s.label}</label>`:_}
            ${P(e,s.content,n,r,i,a,o)}
        </div>
            `},Dn=e=>{let t=e.metadata,n=e=>{let n=e.closest(`.mateu-message-input`)?.querySelector(`input`),r=n?.value??``;!t.actionId||!r.trim()||(e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:{message:r}},bubbles:!0,composed:!0})),n&&(n.value=``))};return w`
        <div class="mateu-message-input ${e.cssClasses??``}"
             style="display:flex; gap:.5rem; align-items:center; ${e.style??``}"
             slot="${e.slot??_}">
            <input type="text"
                   style="flex:1; min-width:0; font:inherit; padding:.5rem .75rem; border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16)); border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513);"
                   @keydown="${e=>{e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),n(e.currentTarget))}}">
            <button style="font:inherit; font-weight:500; cursor:pointer; padding:.5rem 1rem; border:none; border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);"
                    @click="${e=>n(e.currentTarget)}">Send</button>
        </div>
    `},On=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`<span title="${s.text}" style="${t.style}" class="${t.cssClasses}" slot="${t.slot??_}"
        >${P(e,s.wrapped,n,r,i,a,o)}</span>`},kn=e=>{if(e instanceof CustomEvent)return e.detail;let t={};for(let n in e){let r=e[n];[`number`,`string`,`boolean`].indexOf(typeof r)>=0&&(t[n]=e[n])}return t},An=(e,t,n)=>{for(let n in t.attributes)e.setAttribute(n,t.attributes[n]);n.style&&e.setAttribute(`style`,n.style),n.cssClasses&&e.setAttribute(`class`,n.cssClasses),n.slot&&e.setAttribute(`slot`,n.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},jn=e=>{let t=e.name,n=e.attributes?e.attributes.import:void 0;n&&t.includes(`-`)&&!customElements.get(t)&&E(()=>import(n),[])},Mn=(e,t,n)=>{jn(t);let r=t.name;return t.attributes&&t.attributes.id&&(r=`#`+t.attributes.id),setTimeout(()=>{let i=e.shadowRoot?.querySelector(`.element-container`)?.querySelector(r);if(i){for(;i.firstChild;)i.removeChild(i.lastChild);An(i,t,n)}else{let r=document.createElement(t.name);An(r,t,n);for(let n in t.on)r.addEventListener(n,r=>{let i=kn(r);e.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.on[n],parameters:{event:i}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(`.element-container`)?.appendChild(r)}}),w`<div class="element-container"></div>`},Nn=function(e){return e.div=`div`,e.p=`p`,e.h1=`h1`,e.h2=`h2`,e.h3=`h3`,e.h4=`h4`,e.h5=`h5`,e.h6=`h6`,e.span=`span`,e}({}),Pn=(e,t,n,r,i)=>{let a=e.metadata,o=a.attributes?.[`data-colspan`],s=it(a.text,t,n,r,i),c={xl:`var(--lumo-font-size-xl, 1.375rem)`,l:`var(--lumo-font-size-l, 1.125rem)`,s:`var(--lumo-font-size-s, .875rem)`,xs:`var(--lumo-font-size-xs, .8125rem)`},l=(a.size&&c[a.size]?`font-size: ${c[a.size]}; `:``)+(a.noMargins?`margin-block-start: 0; margin-block-end: 0; `:``);return Nn.h1==a.container?w`
            <h1 style="${l}${e.style}" class="${e.cssClasses}"
                id="${x(e.id)}"
                data-colspan="${x(o)}"
                slot="${e.slot??_}">
                ${s??_}
            </h1>
        `:Nn.h2==a.container?w`
            <h2 style="${l}${e.style}" class="${e.cssClasses}"
                id="${x(e.id)}"
                data-colspan="${x(o)}"
                slot="${e.slot??_}">
                ${s??_}
            </h2>
        `:Nn.h3==a.container?w`
            <h3 style="${l}${e.style}" class="${e.cssClasses}"
                id="${x(e.id)}"
                data-colspan="${x(o)}"
                slot="${e.slot??_}">
                ${s??_}
            </h3>
        `:Nn.h4==a.container?w`
            <h4 style="${l}${e.style}" class="${e.cssClasses}"
                id="${x(e.id)}"
                data-colspan="${x(o)}"
                slot="${e.slot??_}">
                ${s??_}
            </h4>
        `:Nn.h5==a.container?w`
            <h5 style="${l}${e.style}" class="${e.cssClasses}"
                id="${x(e.id)}"
                data-colspan="${x(o)}"
                slot="${e.slot??_}">
                ${s??_}
            </h5>
        `:Nn.h6==a.container?w`
            <h6 style="${l}${e.style}" class="${e.cssClasses}"
                id="${x(e.id)}"
                data-colspan="${x(o)}"
                slot="${e.slot??_}">
                ${s??_}
            </h6>
        `:Nn.p==a.container?w`
               <p style="${l}${e.style}" class="${e.cssClasses}"
                  id="${x(e.id)}"
                  data-colspan="${x(o)}"
                  slot="${e.slot??_}">
                   ${s??_}
               </p>
            `:Nn.div==a.container?w`
               <div style="${l}${e.style}" class="${e.cssClasses}"
                    id="${x(e.id)}"
                    data-colspan="${x(o)}"
                    slot="${e.slot??_}">${s?g(s):_}</div>
            `:Nn.span==a.container?w`
               <span style="${l}${e.style}" class="${e.cssClasses}"
                     id="${x(e.id)}"
                     data-colspan="${x(o)}"
                    slot="${e.slot??_}">${s??_}</span>
            `:w`
               <p
                       id="${x(e.id)}"
                       data-colspan="${x(o)}"
                       slot="${e.slot??_}">
                   Unknown text container: ${a.container} 
               </p>
            `},Fn=e=>{let t=e.metadata;return w`<a href="${t.url}" target="${t.target??_}"
                   rel="${t.target===`_blank`?`noopener`:_}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??_}">${t.text}</a>`},In=(e,t)=>{let n=e.toLowerCase().split(`+`);return t.ctrlKey===n.includes(`ctrl`)&&t.altKey===n.includes(`alt`)&&t.shiftKey===n.includes(`shift`)&&t.metaKey===n.includes(`meta`)},Ln=(e,t)=>{if(!In(e,t))return!1;let n=e.toLowerCase().split(`+`),r=n[n.length-1];return!!(t.key.toLowerCase()===r||/^[a-z]$/.test(r)&&t.code===`Key`+r.toUpperCase()||/^[0-9]$/.test(r)&&(t.code===`Digit`+r||t.code===`Numpad`+r))},Rn=e=>e?e.split(`+`).map(e=>e.length<=1?e.toUpperCase():e.charAt(0).toUpperCase()+e.slice(1)).join(`+`):void 0,zn=(e,t)=>{let n=e.currentTarget.dataset.actionId;e.currentTarget?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:n,parameters:t.parameters},bubbles:!0,composed:!0}))},Bn=`display:inline-flex; align-items:center; justify-content:center; gap:.4em; box-sizing:border-box; font:inherit; font-weight:500; cursor:pointer; border-radius:var(--lumo-border-radius-m,6px); border:1px solid transparent; line-height:1; white-space:nowrap;`,Vn=e=>{let t=e.buttonStyle??``,n=e.color&&e.color!==`none`&&e.color!==`normal`?e.color:``,r=e.size,i=n===`success`?`var(--lumo-success-color,#1a7f37)`:n===`error`?`var(--lumo-error-color,#c5221f)`:n===`contrast`?`var(--lumo-contrast,#161513)`:`var(--lumo-primary-color,#3b5bdb)`,a=n===`success`?`var(--lumo-success-contrast-color,#fff)`:n===`error`?`var(--lumo-error-contrast-color,#fff)`:n===`contrast`?`var(--lumo-base-color,#fff)`:`var(--lumo-primary-contrast-color,#fff)`,o=n===`success`?`var(--lumo-success-text-color,#1a7f37)`:n===`error`?`var(--lumo-error-text-color,#c5221f)`:n===`contrast`?`var(--lumo-body-text-color,#161513)`:`var(--lumo-primary-text-color,#3b5bdb)`,s;return s=t===`primary`?`background:${i}; color:${a};`:t===`tertiary`||t===`tertiaryInline`?`background:transparent; color:${o};`:`background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:${o}; border-color:var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,`${Bn}${s}${r===`small`?`padding:.25rem .6rem; font-size:var(--lumo-font-size-s,.875rem);`:r===`large`?`padding:.65rem 1.4rem; font-size:var(--lumo-font-size-l,1.125rem);`:`padding:.45rem 1rem; font-size:var(--lumo-font-size-m,1rem);`}`},Hn=(e,t,n)=>{let r=e.metadata,i=j(r.label,t,n);return w`<button
            id="${e.id}"
            data-action-id="${r.actionId}"
            @click="${e=>zn(e,r)}"
            style="${Vn(r)}${e.style}"
            class="${e.cssClasses}"
            ?disabled="${r.disabled}"
            title="${r.shortcut?`${i} (${Rn(r.shortcut)})`:_}"
            slot="${e.slot??_}"
    >${r.iconOnLeft?F(r.iconOnLeft):_}${i}${r.iconOnRight?F(r.iconOnRight):_}</button>`},Un=`display:block; box-sizing:border-box; background:var(--lumo-base-color,#fff); border:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.1)); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-xs,0 1px 3px rgba(0,0,0,.08)); overflow:hidden;`,Wn=(e,t,n,r,i,a,o)=>{let s=t.metadata;if(!s)return w``;let c=t=>t?P(e,t,n,r,i,a,o,!1):_,l=s.header||s.headerPrefix||s.headerSuffix||s.title||s.subtitle;return w`
        <div style="${Un}${t.style}" class="${t.cssClasses}" slot="${t.slot??_}">
            ${s.media?c(s.media):_}
            ${l?w`<div style="display:flex; align-items:flex-start; gap:.75rem; padding:1rem 1.25rem ${s.content||s.footer?`0`:`1rem`};">
                ${s.headerPrefix?c(s.headerPrefix):_}
                <div style="flex:1; min-width:0;">
                    ${s.header?c(s.header):_}
                    ${s.title?w`<div style="font-weight:600; font-size:1.05rem; color:var(--lumo-body-text-color,#161513);">${c(s.title)}</div>`:_}
                    ${s.subtitle?w`<div style="color:var(--lumo-secondary-text-color,#667);">${c(s.subtitle)}</div>`:_}
                </div>
                ${s.headerSuffix?c(s.headerSuffix):_}
            </div>`:_}
            ${s.content?w`<div style="padding:1rem 1.25rem;">${c(s.content)}</div>`:_}
            ${s.footer?w`<div style="padding:0 1.25rem 1rem;">${c(s.footer)}</div>`:_}
        </div>
    `},Gn=e=>{let t=e.metadata;return w`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??_}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},Kn=e=>{let t=e.metadata;return F(t.icon,e.style,e.cssClasses,e.slot)},qn=(e,t)=>{e&&e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t},bubbles:!0,composed:!0}))},Jn=`font:inherit; font-weight:500; cursor:pointer; padding:.45rem 1rem; border-radius:var(--lumo-border-radius-m,6px);`,Yn=`${Jn} background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:var(--lumo-body-text-color,#161513); border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,Xn=`${Jn} background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff); border:1px solid transparent;`,Zn=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=!1;if(s.openedCondition)try{c=at(s.openedCondition,r,i,a,o)}catch(e){console.error(`when evaluating `+s.openedCondition+` :`+e+`, where data is `+i+` and state is `+r)}return c?w`
        <div class="mateu-confirm-dialog ${t.cssClasses??``}"
             style="position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.4); ${t.style??``}"
             slot="${t.slot??_}">
            <div style="background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-l,0 8px 24px rgba(0,0,0,.2)); width:100%; max-width:min(90vw,32rem); padding:1.5rem; box-sizing:border-box;">
                ${s.header?w`<h3 style="margin:0 0 .75rem; font-size:1.15rem;">${s.header}</h3>`:_}
                <div>${t.children?.map(t=>P(e,t,n,r,i,a,o))}</div>
                <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:1.25rem;">
                    ${s.canCancel?w`<button style="${Yn}" @click="${e=>qn(e.currentTarget,s.cancelActionId)}">${s.rejectText&&!s.canReject?s.rejectText:`Cancel`}</button>`:_}
                    ${s.canReject?w`<button style="${Yn}" @click="${e=>qn(e.currentTarget,s.rejectActionId)}">${s.rejectText||`No`}</button>`:_}
                    <button style="${Xn}" @click="${e=>qn(e.currentTarget,s.confirmActionId)}">${s.confirmText||`OK`}</button>
                </div>
            </div>
        </div>
    `:w``},Qn=e=>{let t=e.metadata,n;return t.position&&(n={Top:`top`,Bottom:`bottom`,TopLeft:`top-left`,TopRight:`top-right`,BottomLeft:`bottom-left`,BottomRight:`bottom-right`}[t.position]),w`
        <mateu-cookie-consent style="${e.style}" class="${e.cssClasses}"
                               slot="${e.slot??_}"
                               position="${n??_}"
                               cookie-name="${t.cookieName??_}"
                               .message="${t.message??_}"
                               theme="${t.theme??_}"
                               .learnMore="${t.learnMore??_}"
                               .learnMoreLink="${t.learnMoreLink??_}"
                               .dismiss="${t.dismiss??_}"
        ></mateu-cookie-consent>
    `},$n=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`
        <details
                ?open="${s.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??_}"
        >
            <summary>${P(e,s.summary,n,r,i,a,o)}</summary>
            ${P(e,s.content,n,r,i,a,o)}
        </details>
            `},er=(e,t,n,r,i,a)=>w`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${n}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${a}"
        ></mateu-dialog>
            `,tr=(e,t,n,r,i,a)=>w`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${n}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${a}"
        ></mateu-drawer>
            `,nr=e=>{let t=e.metadata;return w`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"  
                  route="${t.route}" 
                  consumedRoute="${t.consumedRoute}" 
                  id="${T()}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??_}"
        ></mateu-ux>
        </mateu-api-caller>
            `},rr=e=>w`
        <mateu-markdown .content=${e.metadata.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??_}"></mateu-markdown>
            `,ir=e=>{let t=e.metadata;return w`
        <div
            role="status"
            slot="${e.slot??_}"
            class="${e.cssClasses}"
            style="display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem;
                   border-radius: var(--lumo-border-radius-m, 8px);
                   background: var(--lumo-contrast-5pct, rgba(0,0,0,0.05));
                   color: var(--lumo-body-text-color, #1a1a1a); ${e.style}"
        >
            ${t.title?w`<strong>${t.title}</strong>`:_}
            ${t.text?w`<span>${t.text}</span>`:_}
        </div>
    `},ar=(e,t={})=>{let n=e.metadata,r=n.valueKey?t[n.valueKey]:n.value,i=n.max&&n.max!=0?n.max:1,a=!n.indeterminate&&r!=null;return w`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??_}">
            <progress
                    style="width:100%;"
                    max="${i}"
                    .value="${a?r:_}"
            ></progress>
            ${n.text?w`<span class="text-secondary text-xs" id="sublbl">
    ${n.text}
  </span>`:_}
        </div>
    `},or=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`
        <details style="position: relative; ${t.style}" class="${t.cssClasses}" slot="${t.slot??_}">
            <summary style="list-style: none; cursor: pointer;">${P(e,s.wrapped,n,r,i,a,o)}</summary>
            <div style="position: absolute; z-index: 100; min-width: 300px; margin-top: .25rem; padding: .6rem .8rem;
                        border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px);
                        background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.2));">
                ${P(e,s.content,n,r,i,a,o)}
            </div>
        </details>
    `},sr=e=>{let t=e.metadata;return w`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??_}"></mateu-map>
            `},cr=e=>w`
        <img src="${e.metadata.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??_}">
            `,lr=e=>{let t=e.metadata;return w`<div style="display:flex; align-items:center; gap:0.5rem;" slot="${e.slot??_}">
        ${t.breadcrumbs.map(e=>w`
            <a href="${e.link}">${e.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </div>`},ur=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${s.dots}" 
                ?nav = "${s.nav}" 
                ?loop = "${s.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(t=>w`<div>${P(e,t,n,r,i,a,o)}</div>`)}
        </skeleton-carousel>
    `},dr=(e,t,n,r)=>{let i=e.metadata;return w`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??_}">
            ${i.menu.map(e=>fr(e))}
        </div>
            `},fr=e=>w`
        ${e.submenus?w`
                <details open>
                    <summary>${e.label}</summary>
                    <div style="display:flex; flex-direction:column; gap:0.25rem; padding-left:0.5rem;">
                        ${e.submenus.map(e=>fr(e))}
                    </div>
                </details>
            `:w`
                <a href="${e.path}">${e.label}</a>
        `}
        `,pr=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`<div
                slot="${t.slot??_}"
                style="${t.style}" class="${t.cssClasses}"
        >${s.content?g(s.content):_}${t.children?.map(t=>P(e,t,n,r,i,a,o))}</div>
    `},mr=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.title?.includes("${")?e._evalTemplate(s.title):s.title;return w`<div
                slot="${t.slot??_}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?w`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${c}</div>`:_}
        ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
    </div>
    `},hr=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.title?.includes("${")?e._evalTemplate(s.title):s.title;return w`
        <div
                slot="${t.slot??_}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(t=>P(e,t,n,r,i,a,o))}</div>
    `},gr=(e,t,n)=>{n.dispatchEvent(new CustomEvent(`value-changed`,{detail:{fieldId:e,value:t},bubbles:!0,composed:!0}))},_r=e=>t=>{let n=t.target,r=n.type===`checkbox`?n.checked:n.value;gr(e.fieldId,r,n)},vr=(e,t)=>{let n=e.metadata,r=t?.[n.fieldId]??``,i=n,a=i.dataType,o=i.stereotype,s=!!i.readOnly,c=!!i.disabled,l=i.options,u=n.label?w`<label style="display:block; font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${n.label}</label>`:_,d=`width:100%; box-sizing:border-box; padding:.4rem .6rem; border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.3)); border-radius: var(--lumo-border-radius-m,6px); font:inherit; background: var(--lumo-base-color,#fff); color: var(--lumo-body-text-color,#1a1a1a);`,f;return f=s||o===`plainText`?w`<div style="padding:.4rem 0;">${String(r??``)}</div>`:a===`boolean`||o===`checkbox`||o===`badge`?w`<input type="checkbox" ?checked="${!!r}" ?disabled="${c}" @change="${_r(n)}">`:l&&l.length?w`
            <select style="${d}" ?disabled="${c}" @change="${_r(n)}">
                <option value="">—</option>
                ${l.map(e=>w`<option value="${e.value}" ?selected="${e.value===r}">${e.label}</option>`)}
            </select>`:o===`textarea`||o===`richText`||o===`html`?w`<textarea style="${d}" rows="3" ?disabled="${c}" @input="${_r(n)}">${String(r??``)}</textarea>`:w`<input type="${a===`integer`||a===`number`||a===`double`||a===`money`?`number`:a===`date`?`date`:a===`datetime`?`datetime-local`:a===`time`?`time`:o===`password`?`password`:a===`email`?`email`:`text`}" style="${d}" .value="${String(r??``)}"
                              placeholder="${i.placeholder??_}" ?disabled="${c}" @input="${_r(n)}">`,w`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??_}">
            ${u}
            ${f}
        </div>
    `},yr=e=>{let t=e.metadata;if((t?.level??0)>0)return e;let n=e=>{if(e?.metadata?.type===A.EntityHeader)return e;let t=e?.metadata?.content,r=[...e?.children??[],...Array.isArray(t)?t:t?[t]:[]];for(let e of r){let t=n(e);if(t)return t}},r;for(let t of e.children??[])if(r=n(t),r)break;if(!r)return e;let i=r.metadata;r.__hoistedToPageHeader=!0;let a=[...(i.facts??[]).filter(e=>e.label||e.value).map(e=>({title:e.label??``,text:e.value??``})),...i.metricLabel?[{title:i.metricLabel,text:i.metricValue??``}]:[]],o=(i.badges??[]).filter(e=>e.label).map(e=>({text:e.label,color:e.color})),s={...t,title:i.title||t.title,subtitle:i.subtitle??t.subtitle,kpis:[...t.kpis??[],...a],kpisBelow:!0,badges:[...t.badges??[],...o]};return{...e,metadata:s}},br=(e,t,n,r,i,a,o,s)=>{let c=yr(t),l=c.metadata,u=l?.fabs??[];return w`<mateu-page
            .component="${c}"
            baseUrl="${n}"
            .state="${r}"
            .data="${i}"
            .appState="${a}"
            .appdata="${o}"
            slot="${c.slot??_}"
            style="${c.style}"
            class="${c.cssClasses}"
            ?standalone="${s??!1}"
    >
        ${c.children?.map(t=>P(e,t,n,r,i,a,o))}
        ${l?.buttons?.map(t=>w`
                   ${P(e,{id:t.actionId,metadata:t,type:k.ClientSide,slot:`buttons`},void 0,r,i,a,o)}
`)}
        ${u.map((t,n)=>w`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+n*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))}"
                title="${t.label}">
                ${F(t.icon)}
            </button>
        `)}
</mateu-page>
    `},xr=(e,t,n,r,i,a,o,s)=>w`<mateu-table-crud
            id="${t.id}"
            baseUrl="${n}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${r}"
            .data="${i}"
            .appState="${a}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??_}"
            ?standalone="${s??!1}"
    >
        ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
    </mateu-table-crud>`,Sr=e=>{let t=e.metadata;return w`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??_}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},Cr=(e,t,n)=>w`<mateu-chat sseUrl="${e.metadata.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??_}"></mateu-chat>`,wr=e=>{let t=e.metadata;return w`
        <mateu-workflow
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
                value="${t.value??`{"name":"New Workflow","steps":[]}`}"
        ></mateu-workflow>
    `},Tr=e=>{let t=e.metadata;return w`
        <mateu-form-editor
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
                value="${t.value??`{"name":"New Form","fields":[]}`}"
        ></mateu-form-editor>
    `},Er=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,Dr=e=>e==`up`?`var(--lumo-success-text-color, #1a7f37)`:e==`down`?`var(--lumo-error-text-color, #c5221f)`:`var(--lumo-secondary-text-color, #666)`,Or=e=>e==`up`?`▲`:e==`down`?`▼`:``,kr=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},Ar=e=>{let t=e.metadata,n=!!t.actionId;return w`
        <div class="mateu-metric-card ${e.cssClasses??``}"
             style="${Er} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${n?`cursor: pointer;`:``} ${e.style??``}"
             slot="${e.slot??_}"
             role="${n?`button`:_}"
             @click="${e=>kr(e,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?F(t.icon,`color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;`):_}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?w`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:_}
            </div>
            ${t.trend||t.trendLabel?w`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${Dr(t.trend)};">
                    ${Or(t.trend)} ${t.trendLabel??_}
                </span>
            `:_}
            ${t.description?w`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:_}
        </div>
    `},jr=(e,t,n,r,i,a,o)=>w`
        <div class="mateu-scoreboard ${t.cssClasses??``}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??``}"
             slot="${t.slot??_}"
        >
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </div>
    `,Mr=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.colSpan&&s.colSpan>1?`grid-column: span ${s.colSpan};`:``,l=s.rowSpan&&s.rowSpan>1?`grid-row: span ${s.rowSpan};`:``,u=t.children??[];return u.length===1&&u[0].metadata?.type===`MetricCard`?w`
            <div style="min-width: 0; ${c} ${l} ${t.style??``}" slot="${t.slot??_}">
                ${P(e,u[0],n,r,i,a,o)}
            </div>`:w`
        <div class="mateu-dashboard-panel ${t.cssClasses??``}"
             style="${Er} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${l} ${t.style??``}"
             slot="${t.slot??_}"
        >
            ${s.title?w`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${s.title}</h3>
                    ${s.subtitle?w`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${s.subtitle}</span>`:_}
                </div>
            `:_}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
            </div>
        </div>
    `},Nr=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.columns&&s.columns>0?`repeat(${s.columns}, minmax(0, 1fr))`:`repeat(auto-fit, minmax(20rem, 1fr))`;return w`
        <div class="mateu-dashboard ${t.cssClasses??``}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??``}"
             slot="${t.slot??_}"
        >
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </div>
    `},Pr=class extends y{constructor(...e){super(...e),this.panels=[],this.headerTitle=``,this.badges=[],this.orientation=`vertical`,this.navigation=null,this.overviewEditActionId=``,this.openPanels=new Set,this.expandedPanel=null,this._onPopState=()=>{let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(e.startsWith(`expand=`)){let t=e.slice(7),n=this.panels.findIndex((e,n)=>this.panelAnchor(e,n)===t);this.expandedPanel=n>=0?n:null}else this.expandedPanel=null},this.initialized=!1}navAction(e){e&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),window.addEventListener(`popstate`,this._onPopState)}disconnectedCallback(){window.removeEventListener(`popstate`,this._onPopState),super.disconnectedCallback()}willUpdate(){if(!this.initialized&&this.panels.length){this.openPanels=new Set(this.panels.map((e,t)=>e.open?t:-1).filter(e=>e>=0));let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(e.startsWith(`expand=`)){let t=e.slice(7),n=this.panels.findIndex((e,n)=>this.panelAnchor(e,n)===t);n>=0&&(this.expandedPanel=n)}else if(e){let t=this.panels.findIndex((t,n)=>this.panelAnchor(t,n)===e);t>=0&&this.openPanels.add(t)}this.initialized=!0}}firstUpdated(){let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(!e)return;let t=this.renderRoot.querySelector(`[data-anchor="${CSS.escape(e)}"]`);t&&t.scrollIntoView({block:`nearest`})}panelAnchor(e,t){return(e.title??``).toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)||`panel-${t}`}bookmarkPanel(e){let t=this.panelAnchor(this.panels[e],e);try{history.replaceState(history.state,``,`#`+t)}catch{}}clearBookmark(e){let t=this.panelAnchor(this.panels[e],e);if(decodeURIComponent((location.hash||``).replace(/^#/,``))===t)try{history.replaceState(history.state,``,location.pathname+location.search)}catch{}}expandPanel(e,t){t?.stopPropagation(),this.expandedPanel=e;let n=this.panelAnchor(this.panels[e],e);try{history.pushState(history.state,``,`#expand=`+n)}catch{}}collapsePanel(){try{history.back()}catch{this.expandedPanel=null}}toggle(e){let t=new Set(this.openPanels);t.has(e)?(t.delete(e),this.clearBookmark(e)):(t.add(e),this.bookmarkPanel(e)),this.openPanels=t}static{this.styles=m`
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
            min-height: var(--mateu-foldout-min-height, 24rem);
            height: var(--mateu-foldout-height, auto);
            margin: var(--mateu-foldout-outer-margin, 0);
        }
        /* Navigation Header (RDS Foldout anatomy): a top bar to move to the previous/next object of
           the same type or go to the parent. Rendered only when navigation is provided. */
        .nav-header {
            display: flex;
            align-items: center;
            gap: .75rem;
            padding: var(--mateu-foldout-nav-padding, var(--mateu-foldout-header-padding, var(--mateu-foldout-panel-padding, var(--lumo-space-m, 1rem))));
            padding-top: var(--mateu-foldout-nav-pad-y, .5rem);
            padding-bottom: var(--mateu-foldout-nav-pad-y, .5rem);
            border-bottom: var(--mateu-foldout-nav-border, 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)));
        }
        .nav-header .nav-parent {
            display: inline-flex;
            align-items: center;
            gap: .35rem;
            border: none;
            background: none;
            cursor: pointer;
            padding: .25rem .35rem;
            border-radius: var(--lumo-border-radius-m, 6px);
            color: var(--mateu-foldout-nav-parent-color, var(--lumo-primary-text-color, #1976d2));
            font: inherit;
            font-weight: 600;
        }
        .nav-header .nav-parent:hover {
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.04));
        }
        .nav-header .nav-title {
            font-weight: 600;
            color: var(--mateu-foldout-nav-title-color, var(--lumo-body-text-color, inherit));
        }
        .nav-header .nav-spacer {
            flex: 1;
        }
        .nav-header .nav-move {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            border: var(--mateu-foldout-nav-move-border, 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.16)));
            background: var(--lumo-base-color, #fff);
            border-radius: var(--lumo-border-radius-m, 6px);
            cursor: pointer;
            color: var(--lumo-body-text-color, inherit);
            font-size: 1rem;
            line-height: 1;
        }
        .nav-header .nav-move:hover {
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.04));
        }
        /* Optional header band above the columns (RDS "overview title" + Label/Value chips +
           full-width accent bar). Rendered only when headerTitle is set. */
        .header-band {
            display: flex;
            flex-direction: column;
        }
        .header-content {
            padding: var(--mateu-foldout-header-padding, var(--mateu-foldout-panel-padding, var(--lumo-space-m, 1rem)));
            padding-bottom: var(--mateu-foldout-header-content-gap, .75rem);
            display: flex;
            flex-direction: column;
            gap: .5rem;
        }
        .header-title {
            margin: 0;
            font-size: var(--mateu-foldout-header-title-size, var(--lumo-font-size-xxl, 1.5rem));
            font-weight: var(--mateu-foldout-header-title-weight, 700);
            color: var(--mateu-foldout-header-title-color, var(--lumo-header-text-color, inherit));
        }
        .header-badges {
            display: flex;
            flex-wrap: wrap;
            gap: .5rem;
        }
        .header-badge {
            border: 1px solid var(--mateu-foldout-badge-border, var(--lumo-contrast-30pct, rgba(0,0,0,.2)));
            border-radius: var(--mateu-foldout-badge-radius, 999px);
            padding: var(--mateu-foldout-badge-padding, .1rem .625rem);
            font-size: var(--mateu-foldout-badge-size, var(--lumo-font-size-s, .8rem));
            color: var(--mateu-foldout-badge-color, var(--lumo-secondary-text-color, inherit));
            white-space: nowrap;
        }
        .header-accent {
            height: var(--mateu-foldout-header-accent-height, 4px);
            background: var(--mateu-foldout-header-accent-bg, var(--mateu-foldout-title-accent-color, transparent));
        }
        /* Row holding the overview + fold-out panels; fills the remaining height below the header. */
        .columns {
            display: flex;
            flex: 1;
            min-height: 0;
            gap: var(--mateu-foldout-gap, var(--lumo-space-m, 1rem));
            align-items: stretch;
        }
        /* Horizontal configuration (RDS Foldout spec): the overview spans the top full-width and the
           panels lay out in a row below it, instead of the overview being pinned on the left. */
        :host([orientation="horizontal"]) .columns {
            flex-direction: column;
        }
        :host([orientation="horizontal"]) .overview {
            flex: 0 0 auto;
            width: 100%;
            overflow: visible;
        }
        /* The visual treatment is tokenised: the fallbacks reproduce the original bordered-card
           look (Vaadin), while a design system can switch to the RDS "Foldout" anatomy — frameless
           columns split by vertical dividers, a gold accent under each panel title — by setting the
           --mateu-foldout-* custom properties (see redwood-oj index.css). */
        .overview {
            position: relative;
            flex: 0 0 var(--mateu-foldout-overview-width, 20rem);
            min-width: 0;
            background: var(--mateu-foldout-panel-bg, var(--lumo-base-color, #fff));
            border: var(--mateu-foldout-overview-border, 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)));
            border-radius: var(--mateu-foldout-panel-radius, var(--lumo-border-radius-l, 12px));
            padding: var(--mateu-foldout-overview-padding, var(--lumo-space-m, 1rem));
            box-sizing: border-box;
            overflow: auto;
        }
        /* Overview Edit affordance (RDS edit flow): dispatches overviewEditActionId, whose backend
           method opens a Dialog (vertical) or navigates to an edit page (horizontal). */
        .overview-edit {
            position: absolute;
            top: var(--mateu-foldout-overview-edit-top, .5rem);
            right: var(--mateu-foldout-overview-edit-right, .5rem);
            display: inline-flex;
            align-items: center;
            gap: .3rem;
            border: var(--mateu-foldout-overview-edit-border, 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.16)));
            background: var(--lumo-base-color, #fff);
            color: var(--mateu-foldout-nav-parent-color, var(--lumo-primary-text-color, #1976d2));
            cursor: pointer;
            font: inherit;
            font-weight: 600;
            font-size: var(--lumo-font-size-s, .875rem);
            padding: .2rem .5rem;
            border-radius: var(--lumo-border-radius-m, 6px);
        }
        .overview-edit:hover {
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.04));
        }
        .rail {
            display: flex;
            gap: var(--mateu-foldout-gap, var(--lumo-space-s, .5rem));
            flex: 1;
            min-width: 0;
            overflow-x: auto;
            align-items: stretch;
        }
        .panel {
            flex: var(--mateu-foldout-panel-flex, 1 1 22rem);
            min-width: var(--mateu-foldout-panel-min-width, 18rem);
            background: var(--mateu-foldout-panel-bg, var(--lumo-base-color, #fff));
            border: var(--mateu-foldout-panel-border, 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)));
            border-left: var(--mateu-foldout-divider, var(--mateu-foldout-panel-border, 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08))));
            border-radius: var(--mateu-foldout-panel-radius, var(--lumo-border-radius-l, 12px));
            padding: var(--mateu-foldout-panel-padding, var(--lumo-space-m, 1rem));
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: .5rem;
            overflow: auto;
        }
        /* Per-section background tint (RDS gives each column its own colour). Cycles through four
           tokens; each falls back to the flat panel background so non-RDS renderers are unaffected. */
        .rail .panel:nth-of-type(4n+1) { background: var(--mateu-foldout-panel-bg-a, var(--mateu-foldout-panel-bg, var(--lumo-base-color, #fff))); }
        .rail .panel:nth-of-type(4n+2) { background: var(--mateu-foldout-panel-bg-b, var(--mateu-foldout-panel-bg, var(--lumo-base-color, #fff))); }
        .rail .panel:nth-of-type(4n+3) { background: var(--mateu-foldout-panel-bg-c, var(--mateu-foldout-panel-bg, var(--lumo-base-color, #fff))); }
        .rail .panel:nth-of-type(4n+4) { background: var(--mateu-foldout-panel-bg-d, var(--mateu-foldout-panel-bg, var(--lumo-base-color, #fff))); }
        .panel-header {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: .5rem;
        }
        .panel-header h3 {
            margin: 0;
            font-size: var(--mateu-foldout-title-size, var(--lumo-font-size-l, 1.125rem));
            font-weight: var(--mateu-foldout-title-weight, 600);
        }
        /* RDS heading accent: a short gold rule under the panel title. Hidden by default so
           non-RDS renderers keep flat titles. */
        .panel-header h3::after {
            content: "";
            display: var(--mateu-foldout-title-accent-display, none);
            width: var(--mateu-foldout-title-accent-width, 1.75rem);
            height: var(--mateu-foldout-title-accent-height, 2px);
            margin-top: var(--mateu-foldout-title-accent-gap-above, 6px);
            margin-bottom: var(--mateu-foldout-title-accent-gap-below, 0);
            background: var(--mateu-foldout-title-accent-color, transparent);
        }
        .panel-header .subtitle {
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #666);
        }
        .strip {
            flex: 0 0 2.75rem;
            border: var(--mateu-foldout-strip-border, 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)));
            border-radius: var(--mateu-foldout-panel-radius, var(--lumo-border-radius-l, 12px));
            background: var(--mateu-foldout-strip-bg, var(--lumo-contrast-5pct, rgba(0,0,0,.03)));
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--lumo-space-s, .5rem) 0;
            gap: .5rem;
        }
        .strip:hover {
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.06));
        }
        .strip span {
            writing-mode: vertical-rl;
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #666);
            white-space: nowrap;
        }
        button.fold {
            display: var(--mateu-foldout-fold-display, inline-block);
            border: none;
            background: none;
            cursor: pointer;
            color: var(--lumo-secondary-text-color, #666);
            font-size: 1rem;
            padding: 0;
            line-height: 1;
        }
        .panel-actions {
            display: inline-flex;
            align-items: center;
            gap: .5rem;
        }
        /* "Show all" affordance — hidden by default so non-RDS renderers keep flat panels; a design
           system opts in by setting --mateu-foldout-expand-display (see redwood-oj index.css). */
        button.panel-expand {
            display: var(--mateu-foldout-expand-display, none);
            border: none;
            background: none;
            cursor: pointer;
            color: var(--lumo-secondary-text-color, #666);
            font-size: 1rem;
            padding: 0;
            line-height: 1;
        }
        /* Panel extended view: the panel's detail content shown full-bleed with a Back control. */
        .expanded-view {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
        }
        .expanded-header {
            display: flex;
            align-items: baseline;
            gap: .75rem;
            padding: var(--mateu-foldout-header-padding, var(--mateu-foldout-panel-padding, var(--lumo-space-m, 1rem)));
            padding-bottom: var(--mateu-foldout-header-content-gap, .75rem);
            border-bottom: var(--mateu-foldout-nav-border, 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)));
        }
        .expanded-header .nav-parent {
            display: inline-flex;
            align-items: center;
            gap: .35rem;
            border: none;
            background: none;
            cursor: pointer;
            padding: .25rem .35rem;
            border-radius: var(--lumo-border-radius-m, 6px);
            color: var(--mateu-foldout-nav-parent-color, var(--lumo-primary-text-color, #1976d2));
            font: inherit;
            font-weight: 600;
        }
        .expanded-header .nav-parent:hover {
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.04));
        }
        .expanded-header .nav-title {
            font-size: var(--mateu-foldout-title-size, var(--lumo-font-size-l, 1.125rem));
            font-weight: var(--mateu-foldout-title-weight, 600);
        }
        .expanded-header .subtitle {
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #666);
        }
        .expanded-body {
            flex: 1;
            min-height: 0;
            overflow: auto;
            padding: var(--mateu-foldout-panel-padding, var(--lumo-space-m, 1rem));
        }
    `}render(){if(this.expandedPanel!=null&&this.panels[this.expandedPanel]){let e=this.panels[this.expandedPanel];return w`
                <div class="expanded-view" part="expanded-view">
                    <div class="expanded-header">
                        <button class="nav-parent" title="Back"
                                @click="${()=>this.collapsePanel()}">
                            <span>‹</span><span>Back</span>
                        </button>
                        <span class="nav-title">${e.title}</span>
                        ${e.subtitle?w`<span class="subtitle">${e.subtitle}</span>`:_}
                    </div>
                    <div class="expanded-body">
                        <slot name="panel-${this.expandedPanel}"></slot>
                    </div>
                </div>
            `}let e=this.navigation;return w`
            ${e?w`
                <div class="nav-header" part="nav-header">
                    ${e.parentActionId?w`
                        <button class="nav-parent" title="${e.parentLabel??`Back`}"
                                @click="${()=>this.navAction(e.parentActionId)}">
                            <span>‹</span><span>${e.parentLabel??`Back`}</span>
                        </button>
                    `:_}
                    ${e.title?w`<span class="nav-title">${e.title}</span>`:_}
                    <span class="nav-spacer"></span>
                    ${e.previousActionId?w`
                        <button class="nav-move" title="Previous"
                                @click="${()=>this.navAction(e.previousActionId)}">‹</button>
                    `:_}
                    ${e.nextActionId?w`
                        <button class="nav-move" title="Next"
                                @click="${()=>this.navAction(e.nextActionId)}">›</button>
                    `:_}
                </div>
            `:_}
            ${this.headerTitle?w`
                <div class="header-band" part="header-band">
                    <div class="header-content">
                        <h2 class="header-title">${this.headerTitle}</h2>
                        ${this.badges.length?w`
                            <div class="header-badges">
                                ${this.badges.map(e=>w`<span class="header-badge">${e}</span>`)}
                            </div>
                        `:``}
                    </div>
                    <div class="header-accent" part="header-accent"></div>
                </div>
            `:``}
            <div class="columns" part="columns">
                <div class="overview" part="overview">
                    ${this.overviewEditActionId?w`
                        <button class="overview-edit" title="Edit"
                                @click="${()=>this.navAction(this.overviewEditActionId)}">
                            <span>✎</span><span>Edit</span>
                        </button>
                    `:_}
                    <slot name="overview"></slot>
                </div>
                <div class="rail" part="rail">
                    ${this.panels.map((e,t)=>this.openPanels.has(t)?w`
                        <div class="panel" part="panel" data-anchor="${this.panelAnchor(e,t)}"
                             style="${e.width?`flex-basis: ${e.width}; min-width: min(${e.width}, 100%);`:_}"
                             @click="${()=>this.bookmarkPanel(t)}">
                            <div class="panel-header">
                                <div>
                                    <h3>${e.title}</h3>
                                    ${e.subtitle?w`<div class="subtitle">${e.subtitle}</div>`:``}
                                </div>
                                <span class="panel-actions">
                                    <button class="panel-expand" title="Show all"
                                            @click="${e=>this.expandPanel(t,e)}">⤢</button>
                                    <button class="fold" title="Fold" @click="${e=>{e.stopPropagation(),this.toggle(t)}}">⟨</button>
                                </span>
                            </div>
                            <div style="flex: 1; min-height: 0;">
                                <slot name="panel-${t}"></slot>
                            </div>
                        </div>
                    `:w`
                        <div class="strip" role="button" title="${e.title}"
                             data-anchor="${this.panelAnchor(e,t)}" @click="${()=>this.toggle(t)}">
                            <button class="fold" tabindex="-1">⟩</button>
                            <span>${e.title}</span>
                        </div>
                    `)}
                </div>
            </div>
        `}};O([v({type:Array})],Pr.prototype,`panels`,void 0),O([v({type:String})],Pr.prototype,`headerTitle`,void 0),O([v({type:Array})],Pr.prototype,`badges`,void 0),O([v({type:String,reflect:!0})],Pr.prototype,`orientation`,void 0),O([v({attribute:!1})],Pr.prototype,`navigation`,void 0),O([v({type:String})],Pr.prototype,`overviewEditActionId`,void 0),O([S()],Pr.prototype,`openPanels`,void 0),O([S()],Pr.prototype,`expandedPanel`,void 0),Pr=O([h(`mateu-foldout`)],Pr);var Fr=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`
        <mateu-foldout
                .panels="${s.panels??[]}"
                .headerTitle="${s.headerTitle??``}"
                .badges="${s.badges??[]}"
                .navigation="${s.navigation??null}"
                overviewEditActionId="${s.overviewEditActionId??``}"
                orientation="${s.orientation??`vertical`}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??_}"
        >
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </mateu-foldout>
    `},Ir=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.children??[],l=e=>c.filter(t=>(t.slot??``).startsWith(e)),u=l(`main-`),d=l(`aside-`),f=l(`footer-`),p=s.asideWidth&&s.asideWidth.trim()?s.asideWidth:`32%`,ee=s.asidePosition===`start`,te=s.asideSticky!==!1,ne=t=>t.map(t=>P(e,t,n,r,i,a,o)),re=w`
        <div class="mateu-content-main"
             style="flex: 1 1 0; min-width: min(20rem, 100%); box-sizing: border-box;">
            ${ne(u)}
        </div>`,m=d.length?w`
        <div class="mateu-content-aside"
             style="flex: 0 1 calc(${p} - var(--lumo-space-m, 1rem)); min-width: min(18rem, 100%); box-sizing: border-box; ${te?`position: sticky; top: 1rem; align-self: flex-start;`:``}">
            ${ne(d)}
        </div>`:_;return w`
        <div class="mateu-content-layout ${t.cssClasses??``}"
             style="${t.style??``}"
             slot="${t.slot??_}">
            <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); align-items: flex-start;">
                ${ee?[m,re]:[re,m]}
            </div>
            ${f.length?w`
                <div class="mateu-content-footer"
                     style="flex-basis: 100%; margin-top: var(--lumo-space-m, 1rem);">
                    ${ne(f)}
                </div>`:_}
        </div>
    `},Lr=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=!!s.image,l=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${s.image}'); background-size: cover; background-position: center; color: #fff;`:``,u=s.centered===!1?`flex-start`:`center`,d=s.centered===!1?`left`:`center`;return w`
        <div class="mateu-hero ${t.cssClasses??``}"
             style="display: flex; flex-direction: column; align-items: ${u}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${d}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${s.height??`12rem`}; box-sizing: border-box; ${l} ${t.style??``}"
             slot="${t.slot??_}"
        >
            ${s.title?w`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${s.title}</h1>`:_}
            ${s.subtitle?w`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?``:`color: var(--lumo-secondary-text-color, #666);`} max-width: 40rem;">${s.subtitle}</p>`:_}
            ${t.children?.length?w`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${u}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
                </div>
            `:_}
        </div>
    `},L=e=>t=>{if(t.key===`Enter`){e(t);return}(t.key===` `||t.key===`Spacebar`)&&(t.preventDefault(),e(t))},R=m`
    [role="button"]:focus-visible,
    [role="option"]:focus-visible,
    [role="treeitem"]:focus-visible,
    [role="tab"]:focus-visible,
    [role="gridcell"]:focus-visible,
    [tabindex="0"]:focus-visible {
        outline: 2px solid var(--lumo-primary-color, #3b5bdb);
        outline-offset: 2px;
        border-radius: var(--lumo-border-radius-s, 4px);
    }
`,Rr=1440*60*1e3,zr=class extends y{constructor(...e){super(...e),this.tasks=[],this.onTaskSelectionActionId=``}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}static{this.styles=m`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .frame {
            display: grid;
            grid-template-columns: minmax(9rem, 14rem) 1fr;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
        }
        .label, .lane, .head {
            padding: .45rem .75rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            box-sizing: border-box;
        }
        .head {
            font-weight: 600;
            color: var(--lumo-secondary-text-color, #666);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
        }
        .months {
            display: flex;
            padding: 0;
        }
        .month {
            border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            padding: .45rem 0 .45rem .5rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            box-sizing: border-box;
        }
        .label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .lane {
            position: relative;
            padding: .45rem 0;
        }
        .bar {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            height: 1.15rem;
            border-radius: .6rem;
            background: var(--mateu-gantt-bar, var(--lumo-contrast-20pct, #cbd5e1));
            overflow: hidden;
            min-width: 4px;
        }
        .bar.clickable {
            cursor: pointer;
        }
        .bar.clickable:hover {
            filter: brightness(0.94);
            box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct, rgba(26,115,232,.5));
        }
        .fill {
            height: 100%;
            background: var(--mateu-gantt-fill, var(--lumo-primary-color, #1a73e8));
            border-radius: .6rem 0 0 .6rem;
        }
        .today {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--lumo-error-color, #e11d48);
            opacity: .55;
        }
    
        ${R}
    `}range(){let e=this.tasks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>new Date(e+`T00:00:00`).getTime());return e.length?{min:Math.min(...e)-Rr,max:Math.max(...e)+2*Rr}:null}months(e,t){let n=[],r=new Date(e);for(r.setDate(1);r.getTime()<=t;){let i=Math.max(r.getTime(),e),a=new Date(r.getFullYear(),r.getMonth()+1,1),o=Math.min(a.getTime(),t);n.push({label:r.toLocaleDateString(void 0,{month:`short`,year:`2-digit`}),from:i,to:o}),r.setMonth(r.getMonth()+1)}return n}render(){let e=this.range();if(!e)return w``;let t=e.max-e.min,n=n=>(n-e.min)/t*100,r=Date.now();return w`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(e=>w`
                        <div class="month" style="width: ${(e.to-e.from)/t*100}%;">${e.label}</div>
                    `)}
                </div>
                ${this.tasks.map(i=>{let a=new Date(i.start+`T00:00:00`).getTime(),o=new Date(i.end+`T00:00:00`).getTime()+Rr;return w`
                        <div class="label" title="${i.title}">${i.title}</div>
                        <div class="lane">
                            ${r>=e.min&&r<=e.max?w`<div class="today" style="left: ${n(r)}%;"></div>`:_}
                            <div role="button" tabindex="0"
                                 aria-label="${i.title}, ${i.start} to ${i.end}${i.progress?`, ${i.progress}% complete`:``}"
                                 class="bar ${this.onTaskSelectionActionId?`clickable`:``}"
                                 title="${i.title} · ${i.start} → ${i.end}${i.progress?` · ${i.progress}%`:``}"
                                 @click="${()=>this.selectTask(i)}" @keydown="${L(()=>this.selectTask(i))}"
                                 style="left: ${n(a)}%; width: ${(o-a)/t*100}%; ${i.color?`--mateu-gantt-fill: ${i.color};`:``}">
                                <div class="fill" style="width: ${i.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};O([v({type:Array})],zr.prototype,`tasks`,void 0),O([v()],zr.prototype,`onTaskSelectionActionId`,void 0),zr=O([h(`mateu-gantt`)],zr);var Br=e=>{let t=e.metadata;return w`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                .onTaskSelectionActionId="${t.onTaskSelectionActionId??``}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-gantt>
    `},z,Vr=class extends y{static{z=this}constructor(...e){super(...e),this.resources=[],this.blocks=[],this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key===`Escape`&&this.drag&&(e.stopPropagation(),this.endDrag())}}static{this.styles=m`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .frame {
            display: grid;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow-x: auto;
        }
        .corner, .label, .group, .day-head {
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            box-sizing: border-box;
        }
        .corner, .label, .group {
            position: sticky;
            left: 0;
            z-index: 3;
            background: var(--lumo-base-color, #fff);
        }
        .corner, .day-head {
            font-weight: 600;
            color: var(--lumo-secondary-text-color, #666);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
        }
        .corner {
            padding: .45rem .75rem;
            background: var(--lumo-base-color, #fff);
        }
        .day-head {
            text-align: center;
            padding: .3rem .1rem;
            border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            white-space: nowrap;
            overflow: hidden;
            font-weight: 400;
            line-height: 1.15;
        }
        .day-head .dow {
            display: block;
            font-size: .7em;
            text-transform: uppercase;
            color: var(--lumo-tertiary-text-color, #999);
        }
        .day-head .num {
            font-weight: 600;
        }
        .day-head.weekend {
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.06));
        }
        .day-head.today .num {
            color: var(--lumo-primary-text-color, var(--lumo-primary-color, #1a73e8));
        }
        .group {
            grid-column: 1 / -1;
            padding: .3rem .75rem;
            font-weight: 600;
            font-size: .8em;
            text-transform: uppercase;
            letter-spacing: .04em;
            color: var(--lumo-secondary-text-color, #666);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
        }
        .label {
            padding: .55rem .75rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            border-right: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
        }
        .lane {
            grid-column: 2 / -1;
            position: relative;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            min-height: 2.2rem;
            box-sizing: border-box;
        }
        .cells {
            position: absolute;
            inset: 0;
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 1fr;
        }
        .cell {
            border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.05));
        }
        .cell.weekend {
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
        }
        .today-line {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--lumo-error-color, #e11d48);
            opacity: .45;
            pointer-events: none;
        }
        .block {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            height: 1.5rem;
            line-height: 1.5rem;
            border-radius: .5rem;
            background: var(--mateu-planning-block, var(--lumo-primary-color, #1a73e8));
            color: var(--lumo-primary-contrast-color, #fff);
            padding: 0 .5rem;
            box-sizing: border-box;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 4px;
            user-select: none;
            -webkit-user-select: none;
            touch-action: none;
        }
        .block.clickable {
            cursor: pointer;
        }
        .block.draggable {
            cursor: grab;
        }
        .block.dragging {
            opacity: .35;
            cursor: grabbing;
        }
        .ghost {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            height: 1.5rem;
            border-radius: .5rem;
            border: 2px dashed var(--lumo-primary-color, #1a73e8);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));
            box-sizing: border-box;
            pointer-events: none;
            z-index: 2;
        }
    `}static parse(e){return new Date(e+`T00:00:00`)}static iso(e){let t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){let e=z.parse(this.from),t=z.daysBetween(e,z.parse(this.to))+1;return t>0?{from:e,days:t}:null}let e=this.blocks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>z.parse(e));if(!e.length)return null;let t=new Date(Math.min(...e.map(e=>e.getTime()))),n=new Date(Math.max(...e.map(e=>e.getTime())));return{from:t,days:z.daysBetween(t,n)+1}}onBlockPointerDown(e,t,n){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;let r=z.parse(t.start),i=z.parse(t.end),a=Math.max(1,z.daysBetween(r,i)+1);this.laneRects=[...this.renderRoot.querySelectorAll(`.lane[data-resource-id]`)].map(e=>({resourceId:e.dataset.resourceId,rect:e.getBoundingClientRect()}));let o=this.dayAt(t.resourceId,e.clientX)??n;this.drag={blockId:t.id,duration:a,grabOffsetDays:o-n,originResourceId:t.resourceId,originStartIdx:n,targetResourceId:t.resourceId,targetStartIdx:n,moved:!1},window.addEventListener(`keydown`,this.onDragKeydown)}dayAt(e,t){let n=this.laneRects.find(t=>t.resourceId===e),r=this.window();if(!n||!r||n.rect.width===0)return null;let i=Math.floor((t-n.rect.left)/n.rect.width*r.days);return Math.max(0,Math.min(r.days-1,i))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;let t=this.window();if(!t)return;let n=this.laneRects.find(t=>e.clientY>=t.rect.top&&e.clientY<=t.rect.bottom)??this.laneRects.find(e=>e.resourceId===this.drag.targetResourceId);if(!n)return;let r=this.dayAt(n.resourceId,e.clientX);if(r==null)return;let i=Math.max(0,Math.min(t.days-this.drag.duration,r-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:n.resourceId,targetStartIdx:i}}onBlockPointerUp(e){let t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;let n=this.window();if(!n)return;let r=z.addDays(n.from,t.targetStartIdx),i=z.addDays(r,t.duration-1);this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:z.iso(r),_end:z.iso(i)}},bubbles:!0,composed:!0}))}endDrag(){this.drag=null,window.removeEventListener(`keydown`,this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener(`keydown`,this.onDragKeydown)}render(){let e=this.window();if(!e||!this.resources.length)return w``;let t=[...Array(e.days).keys()].map(t=>z.addDays(e.from,t)),n=new Date,r=z.daysBetween(e.from,new Date(n.getFullYear(),n.getMonth(),n.getDate())),i=r>=0&&r<e.days,a=[],o;return this.resources.forEach(n=>{n.group&&n.group!==o&&a.push(w`<div class="group">${n.group}</div>`),o=n.group,a.push(this.renderRow(n,e,t,i?r:null))}),w`
            <div class="frame" style="grid-template-columns: minmax(8rem, 12rem) repeat(${e.days}, minmax(2.2rem, 1fr));">
                <div class="corner">Resource</div>
                ${t.map((e,t)=>w`
                    <div class="day-head ${this.isWeekend(e)?`weekend`:``} ${t===r?`today`:``}">
                        <span class="dow">${e.toLocaleDateString(void 0,{weekday:`short`})}</span>
                        <span class="num">${e.getDate()}</span>
                    </div>
                `)}
                ${a}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(e,t,n,r){let i=100/t.days,a=this.blocks.filter(t=>t.resourceId===e.id&&t.start&&t.end),o=this.drag?.moved&&this.drag.targetResourceId===e.id?this.drag:null;return w`
            <div class="label" title="${e.label??``}">${e.label}</div>
            <div class="lane" data-resource-id="${e.id}">
                <div class="cells">
                    ${n.map(e=>w`<div class="cell ${this.isWeekend(e)?`weekend`:``}"></div>`)}
                </div>
                ${r==null?_:w`<div class="today-line" style="left: ${(r+.5)*i}%;"></div>`}
                ${a.map(e=>{let n=z.daysBetween(t.from,z.parse(e.start)),r=z.daysBetween(t.from,z.parse(e.end));if(r<0||n>=t.days)return _;let a=Math.max(0,n),o=Math.min(t.days-1,r),s=this.drag?.moved&&this.drag.blockId===e.id;return w`
                        <div class="block ${this.selectActionId?`clickable`:``} ${this.moveActionId?`draggable`:``} ${s?`dragging`:``}"
                             title="${e.label??``} · ${e.start} → ${e.end}${e.status?` · ${e.status}`:``}"
                             style="left: ${a*i}%; width: ${(o-a+1)*i}%; ${e.color?`--mateu-planning-block: ${e.color};`:``}"
                             @pointerdown="${t=>this.onBlockPointerDown(t,e,n)}"
                             @pointermove="${e=>this.onBlockPointerMove(e)}"
                             @pointerup="${()=>this.onBlockPointerUp(e)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${e.label}</div>
                    `})}
                ${o?w`
                    <div class="ghost"
                         style="left: ${o.targetStartIdx*i}%; width: ${Math.min(o.duration,t.days-o.targetStartIdx)*i}%;"></div>
                `:_}
            </div>
        `}};O([v({type:Array})],Vr.prototype,`resources`,void 0),O([v({type:Array})],Vr.prototype,`blocks`,void 0),O([v()],Vr.prototype,`from`,void 0),O([v()],Vr.prototype,`to`,void 0),O([v()],Vr.prototype,`moveActionId`,void 0),O([v()],Vr.prototype,`selectActionId`,void 0),O([S()],Vr.prototype,`drag`,void 0),Vr=z=O([h(`mateu-planning-board`)],Vr);var Hr=e=>{let t=e.metadata;return w`
        <mateu-planning-board
                .resources="${t.resources??[]}"
                .blocks="${t.blocks??[]}"
                .from="${t.from}"
                .to="${t.to}"
                .moveActionId="${t.moveActionId}"
                .selectActionId="${t.selectActionId}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-planning-board>
    `},Ur=class extends y{constructor(...e){super(...e),this.columns=[]}static{this.styles=m`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .board {
            display: flex;
            gap: var(--lumo-space-m, 1rem);
            align-items: flex-start;
            overflow-x: auto;
            padding-bottom: .5rem;
        }
        .column {
            flex: 0 0 16rem;
            display: flex;
            flex-direction: column;
            gap: .5rem;
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
            border-radius: var(--lumo-border-radius-l, 12px);
            padding: .6rem;
            box-sizing: border-box;
        }
        .column-head {
            display: flex;
            align-items: center;
            gap: .4rem;
            font-weight: 600;
            padding: .1rem .25rem .3rem;
            border-bottom: 2px solid var(--mateu-kanban-accent, var(--lumo-contrast-20pct, #cbd5e1));
        }
        .column-title {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .count {
            margin-left: auto;
            font-weight: 500;
            color: var(--lumo-secondary-text-color, #666);
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            border-radius: 999px;
            padding: 0 .5rem;
            font-size: var(--lumo-font-size-xs, .75rem);
        }
        .card {
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-left: 3px solid var(--mateu-kanban-card-accent, transparent);
            border-radius: var(--lumo-border-radius-m, 8px);
            padding: .55rem .65rem;
            display: flex;
            flex-direction: column;
            gap: .3rem;
            box-shadow: 0 1px 2px rgba(0,0,0,.04);
        }
        .card.clickable {
            cursor: pointer;
        }
        .card.clickable:hover {
            border-color: var(--lumo-primary-color, #1a73e8);
        }
        .card-title {
            font-weight: 600;
            color: var(--lumo-body-text-color, #222);
        }
        .card-desc {
            color: var(--lumo-secondary-text-color, #666);
            font-size: var(--lumo-font-size-xs, .8rem);
        }
        .badge {
            align-self: flex-start;
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));
            color: var(--lumo-primary-text-color, #1a73e8);
            border-radius: 999px;
            padding: .05rem .5rem;
            font-size: var(--lumo-font-size-xs, .72rem);
            font-weight: 600;
        }
        @media (prefers-color-scheme: dark) {
            .card { background: var(--lumo-contrast-5pct, #2a2a2a); }
        }
    
        ${R}
    `}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return w`
            <div class="board">
                ${this.columns.map(e=>w`
                    <div class="column" style="${e.color?`--mateu-kanban-accent: ${e.color};`:``}">
                        <div class="column-head">
                            <span class="column-title" title="${e.title??``}">${e.title}</span>
                            <span class="count">${e.cards?.length??0}</span>
                        </div>
                        ${(e.cards??[]).map(e=>w`
                            <div role="button" tabindex="0" class="card ${e.actionId?`clickable`:``}"
                                 style="${e.color?`--mateu-kanban-card-accent: ${e.color};`:``}"
                                 @click="${()=>this.clickCard(e)}" @keydown="${L(()=>this.clickCard(e))}">
                                <span class="card-title">${e.title}</span>
                                ${e.description?w`<span class="card-desc">${e.description}</span>`:_}
                                ${e.badge?w`<span class="badge">${e.badge}</span>`:_}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};O([v({type:Array})],Ur.prototype,`columns`,void 0),Ur=O([h(`mateu-kanban`)],Ur);var Wr=e=>w`
        <mateu-kanban
                .columns="${e.metadata.columns??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-kanban>
    `,Gr=class extends y{constructor(...e){super(...e),this.items=[]}static{this.styles=m`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .feed {
            display: flex;
            flex-direction: column;
        }
        .item {
            display: grid;
            grid-template-columns: 1.6rem 1fr;
            gap: .6rem;
            padding-bottom: .1rem;
        }
        .rail {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .dot {
            width: 1.6rem;
            height: 1.6rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: .8rem;
            background: var(--mateu-timeline-dot, var(--lumo-primary-color, #1a73e8));
            color: #fff;
            flex: 0 0 auto;
        }
        .line {
            flex: 1 1 auto;
            width: 2px;
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            margin: .15rem 0;
            min-height: .5rem;
        }
        .body {
            padding-bottom: 1rem;
        }
        .item:last-child .line {
            display: none;
        }
        .head {
            display: flex;
            align-items: baseline;
            gap: .5rem;
            flex-wrap: wrap;
        }
        .title {
            font-weight: 600;
            color: var(--lumo-body-text-color, #222);
        }
        .clickable .title {
            cursor: pointer;
        }
        .clickable:hover .title {
            color: var(--lumo-primary-color, #1a73e8);
            text-decoration: underline;
        }
        .time {
            color: var(--lumo-secondary-text-color, #888);
            font-size: var(--lumo-font-size-xs, .75rem);
        }
        .desc {
            color: var(--lumo-secondary-text-color, #666);
            margin-top: .15rem;
        }
    
        ${R}
    `}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return w`
            <div class="feed">
                ${this.items.map(e=>w`
                    <div class="item ${e.actionId?`clickable`:``}">
                        <div class="rail">
                            <div class="dot" style="${e.color?`--mateu-timeline-dot: ${e.color};`:``}">${e.icon??``}</div>
                            <div class="line"></div>
                        </div>
                        <div role="button" tabindex="0" class="body" @click="${()=>this.clickItem(e)}" @keydown="${L(()=>this.clickItem(e))}">
                            <div class="head">
                                <span class="title">${e.title}</span>
                                ${e.timestamp?w`<span class="time">${e.timestamp}</span>`:_}
                            </div>
                            ${e.description?w`<div class="desc">${e.description}</div>`:_}
                        </div>
                    </div>
                `)}
            </div>
        `}};O([v({type:Array})],Gr.prototype,`items`,void 0),Gr=O([h(`mateu-timeline`)],Gr);var Kr=e=>w`
        <mateu-timeline
                .items="${e.metadata.items??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-timeline>
    `,qr=class extends y{constructor(...e){super(...e),this.steps=[],this.vertical=!1}static{this.styles=m`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .steps {
            display: flex;
            align-items: flex-start;
        }
        .step {
            flex: 1 1 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            position: relative;
            min-width: 0;
        }
        .connector {
            position: absolute;
            top: calc(.75rem - 1px);
            left: -50%;
            width: 100%;
            height: 2px;
            background: var(--lumo-contrast-20pct, #cbd5e1);
            z-index: 0;
        }
        .step:first-child .connector { display: none; }
        .step.done .connector, .step.current .connector {
            background: var(--lumo-primary-color, #1a73e8);
        }
        .dot {
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: .7rem;
            /* the contrast tint layered over the OPAQUE base color: lumo contrast vars are
               translucent and would let the connector line show through the dot */
            background: linear-gradient(var(--lumo-contrast-10pct, #e5e7eb), var(--lumo-contrast-10pct, #e5e7eb)) var(--lumo-base-color, #fff);
            color: var(--lumo-secondary-text-color, #666);
            z-index: 1;
            border: 2px solid transparent;
        }
        .step.done .dot {
            background: var(--lumo-primary-color, #1a73e8);
            color: #fff;
        }
        .step.current .dot {
            background: var(--lumo-base-color, #fff);
            color: var(--lumo-primary-color, #1a73e8);
            border-color: var(--lumo-primary-color, #1a73e8);
        }
        .label {
            margin-top: .35rem;
            font-weight: 600;
            color: var(--lumo-body-text-color, #222);
            padding: 0 .25rem;
        }
        .step.upcoming .label {
            color: var(--lumo-secondary-text-color, #888);
            font-weight: 500;
        }
        .desc {
            margin-top: .1rem;
            color: var(--lumo-secondary-text-color, #888);
            font-size: var(--lumo-font-size-xs, .75rem);
            padding: 0 .25rem;
        }

        /* vertical (rail) variant: dots stacked in a column, labels beside them, the connector
           running down between consecutive dots */
        :host([vertical]) .steps {
            flex-direction: column;
            align-items: stretch;
            gap: 1.1rem;
        }
        :host([vertical]) .step {
            flex: none;
            flex-direction: row;
            align-items: center;
            text-align: left;
            gap: .6rem;
        }
        :host([vertical]) .connector {
            top: auto;
            bottom: calc(100% - 2px);
            left: calc(.75rem - 1px);
            width: 2px;
            height: 1.1rem;
        }
        :host([vertical]) .label {
            margin-top: 0;
            padding: 0;
        }
        :host([vertical]) .desc {
            margin-top: 0;
            padding: 0;
        }
    `}updated(){let e=this.steps.length;if(e===0)return;let t=this.steps.findIndex(e=>e.status===`current`),n=this.steps.every(e=>e.status===`done`),r=t>=0?t+1:n?e:0;this.dispatchEvent(new CustomEvent(`mateu-guided-progress`,{detail:{current:r,total:e,steps:this.steps.map(e=>({id:e.id,title:e.title,status:e.status??`upcoming`}))},bubbles:!0,composed:!0}))}render(){return w`
            <div class="steps">
                ${this.steps.map((e,t)=>{let n=e.status??`upcoming`;return w`
                        <div class="step ${n}">
                            <div class="connector"></div>
                            <div class="dot">${n===`done`?`✓`:t+1}</div>
                            <div class="label">${e.title}</div>
                            ${e.description?w`<div class="desc">${e.description}</div>`:_}
                        </div>
                    `})}
            </div>
        `}};O([v({type:Array})],qr.prototype,`steps`,void 0),O([v({type:Boolean,reflect:!0})],qr.prototype,`vertical`,void 0),qr=O([h(`mateu-progress-steps`)],qr);var Jr=e=>{let t=e.metadata;return w`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                ?vertical="${t.vertical??!1}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-progress-steps>
    `},Yr=class extends y{constructor(...e){super(...e),this.spark=[]}static{this.styles=m`
        :host {
            display: block;
        }
        .tile {
            display: flex;
            flex-direction: column;
            gap: .2rem;
            padding: var(--lumo-space-m, 1rem);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, #fff);
            min-width: 0;
        }
        .tile.clickable {
            cursor: pointer;
        }
        .tile.clickable:hover {
            border-color: var(--lumo-primary-color, #1a73e8);
        }
        .label {
            font-size: var(--lumo-font-size-s, .8rem);
            color: var(--lumo-secondary-text-color, #666);
        }
        .value {
            font-size: 1.9rem;
            font-weight: 700;
            line-height: 1.1;
            color: var(--lumo-body-text-color, #111);
        }
        .unit {
            font-size: 1rem;
            font-weight: 500;
            color: var(--lumo-secondary-text-color, #888);
            margin-left: .25rem;
        }
        .foot {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: .5rem;
            margin-top: .25rem;
        }
        .delta {
            font-size: var(--lumo-font-size-s, .8rem);
            font-weight: 600;
        }
        .delta.up { color: var(--lumo-success-color, #12b76a); }
        .delta.down { color: var(--lumo-error-color, #e11d48); }
        .delta.flat { color: var(--lumo-secondary-text-color, #888); }
        svg { display: block; }
        @media (prefers-color-scheme: dark) {
            .tile { background: var(--lumo-contrast-5pct, #2a2a2a); }
        }
    
        ${R}
    `}sparkline(){let e=this.spark;if(!e||e.length<2)return _;let t=Math.min(...e),n=Math.max(...e)-t||1,r=80/(e.length-1),i=e.map((e,i)=>[2+i*r,2+26*(1-(e-t)/n)]),a=i.map(([e,t],n)=>`${n===0?`M`:`L`}${e.toFixed(1)} ${t.toFixed(1)}`).join(` `),o=`${a} L${i[i.length-1][0].toFixed(1)} 30 L${i[0][0].toFixed(1)} 30 Z`,s=this.trend===`down`?`var(--lumo-error-color, #e11d48)`:this.trend===`flat`?`var(--lumo-secondary-text-color, #888)`:`var(--lumo-success-color, #12b76a)`;return C`
            <svg width="${84}" height="${30}" viewBox="0 0 ${84} ${30}">
                <path d="${o}" fill="${s}" opacity="0.12"></path>
                <path d="${a}" fill="none" stroke="${s}" stroke-width="1.6"
                      stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>
        `}dispatchAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){let e=this.trend??`up`;return w`
            <div role="button" tabindex="0" class="tile ${this.actionId?`clickable`:``}" @click="${()=>this.dispatchAction()}" @keydown="${L(()=>this.dispatchAction())}">
                ${this.label?w`<span class="label">${this.label}</span>`:_}
                <span class="value">${this.value}${this.unit?w`<span class="unit">${this.unit}</span>`:_}</span>
                <div class="foot">
                    ${this.delta?w`<span class="delta ${e}">${e===`up`?`▲`:e===`down`?`▼`:`→`} ${this.delta}</span>`:w`<span></span>`}
                    ${this.sparkline()}
                </div>
            </div>
        `}};O([v()],Yr.prototype,`label`,void 0),O([v()],Yr.prototype,`value`,void 0),O([v()],Yr.prototype,`unit`,void 0),O([v()],Yr.prototype,`delta`,void 0),O([v()],Yr.prototype,`trend`,void 0),O([v({type:Array})],Yr.prototype,`spark`,void 0),O([v()],Yr.prototype,`actionId`,void 0),Yr=O([h(`mateu-stat`)],Yr);var Xr=e=>{let t=e.metadata;return w`
        <mateu-stat
                label="${t.label??_}"
                value="${t.value??_}"
                unit="${t.unit??_}"
                delta="${t.delta??_}"
                trend="${t.trend??_}"
                actionId="${t.actionId??_}"
                .spark="${t.spark??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-stat>
    `},Zr=class extends y{constructor(...e){super(...e),this.events=[]}static{this.styles=m`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .title {
            font-weight: 700;
            font-size: 1.05rem;
            margin-bottom: .5rem;
            color: var(--lumo-body-text-color, #222);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-m, 8px);
            overflow: hidden;
        }
        .dow {
            background: var(--lumo-contrast-5pct, #f7f7f8);
            padding: .35rem .5rem;
            font-weight: 600;
            font-size: var(--lumo-font-size-xs, .72rem);
            color: var(--lumo-secondary-text-color, #888);
            text-align: center;
            text-transform: uppercase;
        }
        .cell {
            background: var(--lumo-base-color, #fff);
            min-height: 4.4rem;
            padding: .25rem;
            display: flex;
            flex-direction: column;
            gap: .15rem;
        }
        .cell.blank {
            background: var(--lumo-contrast-5pct, #fafafa);
        }
        .num {
            font-size: var(--lumo-font-size-xs, .72rem);
            color: var(--lumo-secondary-text-color, #888);
            align-self: flex-end;
        }
        .cell.today .num {
            background: var(--lumo-primary-color, #1a73e8);
            color: #fff;
            border-radius: 50%;
            width: 1.25rem;
            height: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .chip {
            font-size: var(--lumo-font-size-xs, .7rem);
            padding: .05rem .3rem;
            border-radius: 4px;
            background: var(--mateu-cal-chip, var(--lumo-primary-color-10pct, rgba(26,115,232,.12)));
            color: var(--mateu-cal-chip-text, var(--lumo-primary-text-color, #1a73e8));
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            border-left: 3px solid var(--mateu-cal-accent, var(--lumo-primary-color, #1a73e8));
        }
        .chip.clickable { cursor: pointer; }
        .chip.clickable:hover { filter: brightness(.95); }
        @media (prefers-color-scheme: dark) {
            .cell { background: var(--lumo-contrast-5pct, #2a2a2a); }
            .dow { background: var(--lumo-contrast-10pct, #333); }
        }
    
        ${R}
    `}clickEvent(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}render(){let e=this.month?new Date(this.month+`T00:00:00`):new Date,t=e.getFullYear(),n=e.getMonth(),r=new Date(t,n,1),i=(r.getDay()+6)%7,a=new Date(t,n+1,0).getDate(),o=new Date,s=e=>o.getFullYear()===t&&o.getMonth()===n&&o.getDate()===e,c={};for(let e of this.events){if(!e.date)continue;let r=new Date(e.date+`T00:00:00`);r.getFullYear()===t&&r.getMonth()===n&&(c[r.getDate()]??=[]).push(e)}let l=[`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`,`Sun`],u=[];for(let e=0;e<i;e++)u.push(w`<div class="cell blank"></div>`);for(let e=1;e<=a;e++)u.push(w`
                <div class="cell ${s(e)?`today`:``}">
                    <span class="num">${e}</span>
                    ${(c[e]??[]).map(e=>w`
                        <span role="button" tabindex="0" class="chip ${e.actionId?`clickable`:``}"
                              style="${e.color?`--mateu-cal-accent: ${e.color};`:``}"
                              title="${e.title??``}"
                              @click="${()=>this.clickEvent(e)}" @keydown="${L(()=>this.clickEvent(e))}">${e.title}</span>
                    `)}
                </div>
            `);return w`
            <div class="title">${r.toLocaleDateString(void 0,{month:`long`,year:`numeric`})}</div>
            <div class="grid">
                ${l.map(e=>w`<div class="dow">${e}</div>`)}
                ${u}
            </div>
        `}};O([v()],Zr.prototype,`month`,void 0),O([v({type:Array})],Zr.prototype,`events`,void 0),Zr=O([h(`mateu-calendar`)],Zr);var Qr=e=>{let t=e.metadata;return w`
        <mateu-calendar
                month="${t.month??_}"
                .events="${t.events??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-calendar>
    `},$r=class extends y{constructor(...e){super(...e),this.plans=[]}static{this.styles=m`
        :host {
            display: block;
            width: 100%;
        }
        .plans {
            display: flex;
            gap: 1rem;
            align-items: stretch;
            flex-wrap: wrap;
        }
        .plan {
            flex: 1 1 14rem;
            min-width: 12rem;
            display: flex;
            flex-direction: column;
            gap: .6rem;
            padding: 1.25rem;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 14px);
            background: var(--lumo-base-color, #fff);
        }
        .plan.featured {
            border-color: var(--lumo-primary-color, #1a73e8);
            box-shadow: 0 6px 24px rgba(26,115,232,.14);
        }
        .badge {
            align-self: flex-start;
            font-size: var(--lumo-font-size-xs, .68rem);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .04em;
            color: #fff;
            background: var(--lumo-primary-color, #1a73e8);
            border-radius: 999px;
            padding: .1rem .55rem;
        }
        .name {
            font-weight: 600;
            color: var(--lumo-secondary-text-color, #666);
        }
        .price {
            font-size: 2rem;
            font-weight: 800;
            color: var(--lumo-body-text-color, #111);
            line-height: 1;
        }
        .period {
            font-size: .9rem;
            font-weight: 500;
            color: var(--lumo-secondary-text-color, #888);
        }
        ul {
            list-style: none;
            margin: .25rem 0 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: .4rem;
            flex: 1;
        }
        li {
            display: flex;
            align-items: flex-start;
            gap: .5rem;
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-body-text-color, #333);
        }
        li::before {
            content: '✓';
            color: var(--lumo-success-color, #12b76a);
            font-weight: 700;
            flex: 0 0 auto;
        }
        .cta {
            margin-top: .25rem;
            border: none;
            border-radius: var(--lumo-border-radius-m, 8px);
            padding: .6rem 1rem;
            font-size: .9rem;
            font-weight: 600;
            cursor: pointer;
            background: var(--lumo-contrast-10pct, #eef0f2);
            color: var(--lumo-body-text-color, #222);
        }
        .plan.featured .cta {
            background: var(--lumo-primary-color, #1a73e8);
            color: #fff;
        }
        .cta:hover { filter: brightness(.96); }
        @media (prefers-color-scheme: dark) {
            .plan { background: var(--lumo-contrast-5pct, #2a2a2a); }
        }
    `}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return w`
            <div class="plans">
                ${this.plans.map(e=>w`
                    <div class="plan ${e.featured?`featured`:``}">
                        ${e.featured?w`<span class="badge">Recommended</span>`:_}
                        <span class="name">${e.name}</span>
                        <div>
                            <span class="price">${e.price}</span>
                            ${e.period?w`<span class="period">${e.period}</span>`:_}
                        </div>
                        <ul>
                            ${(e.features??[]).map(e=>w`<li>${e}</li>`)}
                        </ul>
                        ${e.ctaLabel?w`
                            <button class="cta" @click="${()=>this.cta(e)}">${e.ctaLabel}</button>
                        `:_}
                    </div>
                `)}
            </div>
        `}};O([v({type:Array})],$r.prototype,`plans`,void 0),$r=O([h(`mateu-pricing-table`)],$r);var ei=e=>w`
        <mateu-pricing-table
                .plans="${e.metadata.plans??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-pricing-table>
    `,ti=class extends y{static{this.styles=m`
        :host {
            display: block;
            width: 100%;
            overflow-x: auto;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .tree {
            display: inline-flex;
            padding: .5rem 1rem 1rem;
            min-width: 100%;
            justify-content: center;
        }
        ul {
            display: flex;
            padding-top: 1.1rem;
            position: relative;
            list-style: none;
            margin: 0;
        }
        li {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            padding: 1.1rem .4rem 0;
        }
        /* vertical line down from a parent */
        li::before {
            content: '';
            position: absolute;
            top: 0;
            height: 1.1rem;
            width: 2px;
            background: var(--lumo-contrast-20pct, #cbd5e1);
        }
        /* horizontal connectors between siblings */
        li::after {
            content: '';
            position: absolute;
            top: 0;
            height: 2px;
            width: 50%;
            right: 50%;
            background: var(--lumo-contrast-20pct, #cbd5e1);
        }
        li:only-child::before, li:only-child::after { display: none; }
        li:first-child::after { display: none; }
        li:last-child::before {
            /* the last child needs the connector on its left */
        }
        ul > li:not(:only-child)::after { left: 50%; right: auto; }
        ul > li:not(:only-child):last-child::after { display: none; }
        ul > li:not(:only-child):first-child::before { display: none; }
        /* the connecting bar spanning the children row */
        ul::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            width: 0;
        }
        .node {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: .1rem;
            padding: .5rem .75rem;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-top: 3px solid var(--mateu-org-accent, var(--lumo-primary-color, #1a73e8));
            border-radius: var(--lumo-border-radius-m, 8px);
            background: var(--lumo-base-color, #fff);
            min-width: 7rem;
            box-shadow: 0 1px 2px rgba(0,0,0,.05);
            text-align: center;
        }
        .node.clickable { cursor: pointer; }
        .node.clickable:hover { border-color: var(--lumo-primary-color, #1a73e8); }
        .avatar {
            width: 1.7rem;
            height: 1.7rem;
            border-radius: 50%;
            background: var(--lumo-contrast-10pct, #eee);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: .9rem;
            overflow: hidden;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .title { font-weight: 600; color: var(--lumo-body-text-color, #222); }
        .subtitle { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); }
        @media (prefers-color-scheme: dark) {
            .node { background: var(--lumo-contrast-5pct, #2a2a2a); }
        }
    
        ${R}
    `}clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){let t=e.avatar,n=t&&(t.startsWith(`http`)||t.startsWith(`data:`));return w`
            <li>
                <div role="button" tabindex="0" class="node ${e.actionId?`clickable`:``}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:``}"
                     @click="${()=>this.clickNode(e)}" @keydown="${L(()=>this.clickNode(e))}">
                    ${t?w`<span class="avatar">${n?w`<img src="${t}" alt="">`:t}</span>`:_}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?w`<span class="subtitle">${e.subtitle}</span>`:_}
                </div>
                ${e.children&&e.children.length?w`<ul>${e.children.map(e=>this.renderNode(e))}</ul>`:_}
            </li>
        `}render(){return this.root?w`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:w``}};O([v({attribute:!1})],ti.prototype,`root`,void 0),ti=O([h(`mateu-org-chart`)],ti);var ni=e=>w`
        <mateu-org-chart
                .root="${e.metadata.root}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-org-chart>
    `,ri=1440*60*1e3,ii=class extends y{constructor(...e){super(...e),this.cells=[]}static{this.styles=m`
        :host {
            display: block;
            width: 100%;
            overflow-x: auto;
            font-size: var(--lumo-font-size-xs, .72rem);
        }
        .wrap { display: inline-flex; flex-direction: column; gap: .25rem; padding-bottom: .25rem; }
        .months { display: flex; color: var(--lumo-secondary-text-color, #888); height: 1rem; }
        .grid { display: grid; grid-auto-flow: column; grid-template-rows: repeat(7, 1fr); gap: 2px; }
        .cell {
            width: 12px;
            height: 12px;
            border-radius: 2px;
            background: var(--cell, var(--lumo-contrast-10pct, #ebedf0));
        }
        .legend {
            display: flex;
            align-items: center;
            gap: 3px;
            color: var(--lumo-secondary-text-color, #888);
            margin-top: .15rem;
        }
        .legend .cell { width: 10px; height: 10px; }
    `}color(e,t){if(e<=0||t<=0)return`var(--lumo-contrast-10pct, #ebedf0)`;let n=e/t;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round((n>.75?1:n>.5?.75:n>.25?.5:.3)*100)}%, transparent)`}render(){let e=this.cells.filter(e=>!!e.date);if(!e.length)return w``;let t=e.map(e=>new Date(e.date+`T00:00:00`).getTime()),n=Math.min(...t),r=Math.max(...t),i=new Date(n);i.setDate(i.getDate()-(i.getDay()+6)%7);let a={};for(let t of e)a[t.date]=t;let o=Math.max(...e.map(e=>e.value??0),1),s=[];for(let e=i.getTime();e<=r;e+=ri){let t=new Date(e),n=t.toISOString().slice(0,10),r=a[n],i=r?.value??0,c=(t.getDay()+6)%7+1,l=r?.label??`${n}: ${i}`;s.push(w`
                <div class="cell" style="grid-row: ${c}; --cell: ${this.color(i,o)};" title="${l}"></div>
            `)}return w`
            <div class="wrap">
                <div class="grid">${s}</div>
                <div class="legend">
                    <span>Less</span>
                    <span class="cell" style="--cell: var(--lumo-contrast-10pct, #ebedf0);"></span>
                    <span class="cell" style="--cell: ${this.color(1,4)};"></span>
                    <span class="cell" style="--cell: ${this.color(2,4)};"></span>
                    <span class="cell" style="--cell: ${this.color(3,4)};"></span>
                    <span class="cell" style="--cell: ${this.color(4,4)};"></span>
                    <span>More</span>
                </div>
            </div>
        `}};O([v({type:Array})],ii.prototype,`cells`,void 0),ii=O([h(`mateu-heatmap`)],ii);var ai=e=>w`
        <mateu-heatmap
                .cells="${e.metadata.cells??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-heatmap>
    `,oi=class extends y{constructor(...e){super(...e),this.stages=[]}static{this.styles=m`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .funnel { display: flex; flex-direction: column; gap: .35rem; }
        .stage { display: flex; flex-direction: column; align-items: center; gap: .1rem; }
        .bar {
            height: 2.4rem;
            border-radius: 6px;
            background: var(--bar, var(--lumo-primary-color, #1a73e8));
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 700;
            min-width: 3rem;
            transition: width .2s;
        }
        .meta { display: flex; gap: .5rem; align-items: baseline; }
        .label { font-weight: 600; color: var(--lumo-body-text-color, #222); }
        .conv { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .75rem); }
    `}render(){let e=this.stages;if(!e.length)return w``;let t=e[0].value??0,n=Math.max(...e.map(e=>e.value??0),1);return w`
            <div class="funnel">
                ${e.map((r,i)=>{let a=r.value??0,o=n>0?Math.max(6,a/n*100):6,s=i>0?e[i-1].value??0:t,c=i===0?t>0?`100%`:``:s>0?`${Math.round(a/s*100)}%`:`0%`;return w`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${r.label}</span>
                                ${i>0?w`<span class="conv">${c} of previous</span>`:_}
                            </div>
                            <div class="bar" style="width: ${o}%; ${r.color?`--bar: ${r.color};`:``}">
                                ${a.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};O([v({type:Array})],oi.prototype,`stages`,void 0),oi=O([h(`mateu-funnel`)],oi);var si=e=>w`
        <mateu-funnel
                .stages="${e.metadata.stages??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-funnel>
    `,ci=class extends y{constructor(...e){super(...e),this.values=[],this.labels=[],this.area=!1}static{this.styles=m`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `}render(){let e=this.values;if(!e||e.length<2)return w``;let t=Math.min(...e),n=Math.max(...e),r=n-t||1,i=584/(e.length-1),a=e.map((e,n)=>[8+n*i,8+144*(1-(e-t)/r)]),o=a.map(([e,t],n)=>`${n===0?`M`:`L`}${e.toFixed(1)} ${t.toFixed(1)}`).join(` `),s=`${o} L${a[a.length-1][0].toFixed(1)} 152 L${a[0][0].toFixed(1)} 152 Z`,c=this.color||`var(--lumo-primary-color, #1a73e8)`,l=e.indexOf(n),u=e.indexOf(t);return w`
            ${this.heading?w`<div class="title">${this.heading}</div>`:_}
            <svg viewBox="0 0 ${600} ${160}" preserveAspectRatio="none">
                ${this.area?C`<path d="${s}" fill="${c}" opacity="0.12"></path>`:_}
                <path d="${o}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${a.map((t,n)=>n===l||n===u?C`<circle cx="${t[0]}" cy="${t[1]}" r="3.2" fill="${c}"><title>${this.labels[n]??``}: ${e[n]}</title></circle>`:C`<circle cx="${t[0]}" cy="${t[1]}" r="6" fill="transparent"><title>${this.labels[n]??``}: ${e[n]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?w`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:_}
        `}};O([v()],ci.prototype,`heading`,void 0),O([v({type:Array})],ci.prototype,`values`,void 0),O([v({type:Array})],ci.prototype,`labels`,void 0),O([v()],ci.prototype,`color`,void 0),O([v({type:Boolean})],ci.prototype,`area`,void 0),ci=O([h(`mateu-trend-chart`)],ci);var li=e=>{let t=e.metadata;return w`
        <mateu-trend-chart
                heading="${t.title??_}"
                color="${t.color??_}"
                ?area="${t.area??!1}"
                .values="${t.values??[]}"
                .labels="${t.labels??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-trend-chart>
    `},ui=class extends y{constructor(...e){super(...e),this.features=[],this.columns=0}static{this.styles=m`
        :host { display: block; width: 100%; }
        .grid {
            display: grid;
            gap: var(--lumo-space-m, 1rem);
        }
        .card {
            display: flex;
            flex-direction: column;
            gap: .35rem;
            padding: var(--lumo-space-m, 1.15rem);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, #fff);
        }
        .card.clickable { cursor: pointer; }
        .card.clickable:hover { border-color: var(--lumo-primary-color, #1a73e8); }
        .icon {
            width: 2.5rem; height: 2.5rem;
            border-radius: var(--lumo-border-radius-m, 10px);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));
            display: flex; align-items: center; justify-content: center;
            font-size: 1.4rem;
        }
        .title { font-weight: 700; color: var(--lumo-body-text-color, #111); }
        .desc { color: var(--lumo-secondary-text-color, #666); font-size: var(--lumo-font-size-s, .875rem); }
        @media (prefers-color-scheme: dark) {
            .card { background: var(--lumo-contrast-5pct, #2a2a2a); }
        }
    
        ${R}
    `}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return w`
            <div class="grid" style="grid-template-columns: ${this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:`repeat(auto-fit, minmax(15rem, 1fr))`};">
                ${this.features.map(e=>w`
                    <div role="button" tabindex="0" class="card ${e.actionId?`clickable`:``}" @click="${()=>this.clickFeature(e)}" @keydown="${L(()=>this.clickFeature(e))}">
                        ${e.icon?w`<span class="icon">${e.icon}</span>`:_}
                        <span class="title">${e.title}</span>
                        ${e.description?w`<span class="desc">${e.description}</span>`:_}
                    </div>
                `)}
            </div>
        `}};O([v({type:Array})],ui.prototype,`features`,void 0),O([v({type:Number})],ui.prototype,`columns`,void 0),ui=O([h(`mateu-feature-grid`)],ui);var di=e=>{let t=e.metadata;return w`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-feature-grid>
    `},fi=class extends y{constructor(...e){super(...e),this.items=[]}static{this.styles=m`
        :host { display: block; width: 100%; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); gap: var(--lumo-space-m, 1rem); }
        .card {
            display: flex; flex-direction: column; gap: .6rem;
            padding: var(--lumo-space-m, 1.25rem);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, #fff);
        }
        .stars { color: #f5a623; letter-spacing: 1px; font-size: .95rem; }
        .quote { color: var(--lumo-body-text-color, #333); font-style: italic; line-height: 1.5; flex: 1; }
        .quote::before { content: '“'; }
        .quote::after { content: '”'; }
        .author { display: flex; align-items: center; gap: .6rem; }
        .avatar {
            width: 2.2rem; height: 2.2rem; border-radius: 50%;
            background: var(--lumo-contrast-10pct, #eee);
            display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .name { font-weight: 600; color: var(--lumo-body-text-color, #222); }
        .role { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .75rem); }
        @media (prefers-color-scheme: dark) { .card { background: var(--lumo-contrast-5pct, #2a2a2a); } }
    `}stars(e){let t=Math.max(0,Math.min(5,e||0));return`★`.repeat(t)+`☆`.repeat(5-t)}render(){return w`
            <div class="grid">
                ${this.items.map(e=>{let t=e.avatar&&(e.avatar.startsWith(`http`)||e.avatar.startsWith(`data:`));return w`
                        <div class="card">
                            ${e.rating?w`<div class="stars">${this.stars(e.rating)}</div>`:_}
                            <div class="quote">${e.quote}</div>
                            <div class="author">
                                ${e.avatar?w`<span class="avatar">${t?w`<img src="${e.avatar}" alt="">`:e.avatar}</span>`:_}
                                <div>
                                    <div class="name">${e.author}</div>
                                    ${e.role?w`<div class="role">${e.role}</div>`:_}
                                </div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};O([v({type:Array})],fi.prototype,`items`,void 0),fi=O([h(`mateu-testimonials`)],fi);var pi=e=>w`
        <mateu-testimonials
                .items="${e.metadata.items??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-testimonials>
    `,mi=class extends y{constructor(...e){super(...e),this.items=[],this.openSet=new Set,this.seeded=!1}static{this.styles=m`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-m, 1rem); }
        .list {
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
        }
        .item + .item { border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); }
        .q {
            display: flex; align-items: center; justify-content: space-between; gap: 1rem;
            padding: .9rem 1.1rem; cursor: pointer; font-weight: 600;
            color: var(--lumo-body-text-color, #222);
            background: var(--lumo-base-color, #fff);
        }
        .q:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.02)); }
        .chevron { transition: transform .2s; color: var(--lumo-secondary-text-color, #888); }
        .item.open .chevron { transform: rotate(90deg); }
        .a {
            padding: 0 1.1rem 1rem;
            color: var(--lumo-secondary-text-color, #555);
            line-height: 1.55;
        }
        @media (prefers-color-scheme: dark) { .q { background: var(--lumo-contrast-5pct, #2a2a2a); } }
    
        ${R}
    `}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),w`
            <div class="list">
                ${this.items.map((e,t)=>{let n=this.openSet.has(t);return w`
                        <div class="item ${n?`open`:``}">
                            <div role="button" tabindex="0" aria-expanded="${n}" class="q" @click="${()=>this.toggle(t)}" @keydown="${L(()=>this.toggle(t))}">
                                <span>${e.question}</span>
                                <span class="chevron">›</span>
                            </div>
                            ${n?w`<div class="a">${e.answer}</div>`:``}
                        </div>
                    `})}
            </div>
        `}};O([v({type:Array})],mi.prototype,`items`,void 0),O([S()],mi.prototype,`openSet`,void 0),mi=O([h(`mateu-faq`)],mi);var hi=e=>w`
        <mateu-faq
                .items="${e.metadata.items??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-faq>
    `,gi=class extends y{static{this.styles=m`
        :host { display: block; width: 100%; }
        .callout {
            display: flex; gap: 1rem; align-items: flex-start;
            padding: var(--lumo-space-l, 1.5rem);
            border-radius: var(--lumo-border-radius-l, 14px);
            border-left: 4px solid var(--accent, var(--lumo-primary-color, #1a73e8));
            background: var(--bg, var(--lumo-primary-color-10pct, rgba(26,115,232,.08)));
        }
        .icon { font-size: 1.7rem; line-height: 1; }
        .body { flex: 1; display: flex; flex-direction: column; gap: .35rem; }
        .heading { font-weight: 700; font-size: 1.1rem; color: var(--lumo-body-text-color, #111); }
        .desc { color: var(--lumo-secondary-text-color, #555); line-height: 1.5; }
        .cta {
            align-self: flex-start; margin-top: .5rem;
            border: none; border-radius: var(--lumo-border-radius-m, 8px);
            padding: .55rem 1.1rem; font-weight: 600; cursor: pointer; font-size: .9rem;
            background: var(--accent, var(--lumo-primary-color, #1a73e8)); color: #fff;
        }
        .cta:hover { filter: brightness(.95); }
    `}themeVars(){switch(this.theme){case`success`:return`--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));`;case`warning`:return`--accent: #f59e0b; --bg: rgba(245,158,11,.12);`;case`danger`:return`--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));`;default:return`--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));`}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return w`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?w`<span class="icon">${this.icon}</span>`:_}
                <div class="body">
                    ${this.heading?w`<span class="heading">${this.heading}</span>`:_}
                    ${this.description?w`<span class="desc">${this.description}</span>`:_}
                    ${this.ctaLabel?w`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:_}
                </div>
            </div>
        `}};O([v()],gi.prototype,`heading`,void 0),O([v()],gi.prototype,`description`,void 0),O([v()],gi.prototype,`icon`,void 0),O([v()],gi.prototype,`ctaLabel`,void 0),O([v()],gi.prototype,`actionId`,void 0),O([v()],gi.prototype,`theme`,void 0),gi=O([h(`mateu-callout-card`)],gi);var _i=e=>{let t=e.metadata;return w`
        <mateu-callout-card
                heading="${t.title??_}"
                description="${t.description??_}"
                icon="${t.icon??_}"
                ctaLabel="${t.ctaLabel??_}"
                actionId="${t.actionId??_}"
                theme="${t.theme??_}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-callout-card>
    `},vi=class extends y{constructor(...e){super(...e),this.comments=[]}static{this.styles=m`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .thread { display: flex; flex-direction: column; gap: 1rem; }
        .replies {
            display: flex; flex-direction: column; gap: 1rem;
            margin: .75rem 0 0 1.1rem; padding-left: 1rem;
            border-left: 2px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
        }
        .comment { display: flex; gap: .6rem; }
        .avatar {
            width: 2rem; height: 2rem; border-radius: 50%; flex: 0 0 auto;
            background: var(--lumo-contrast-10pct, #eee);
            display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .body { flex: 1; min-width: 0; }
        .head { display: flex; align-items: baseline; gap: .5rem; }
        .author { font-weight: 600; color: var(--lumo-body-text-color, #222); }
        .time { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); }
        .text { color: var(--lumo-body-text-color, #333); margin-top: .15rem; line-height: 1.5; }
    `}renderComment(e){let t=e.avatar&&(e.avatar.startsWith(`http`)||e.avatar.startsWith(`data:`));return w`
            <div class="comment">
                <span class="avatar">${e.avatar?t?w`<img src="${e.avatar}" alt="">`:e.avatar:e.author?.[0]??`?`}</span>
                <div class="body">
                    <div class="head">
                        <span class="author">${e.author}</span>
                        ${e.timestamp?w`<span class="time">${e.timestamp}</span>`:_}
                    </div>
                    <div class="text">${e.text}</div>
                    ${e.replies&&e.replies.length?w`<div class="replies">${e.replies.map(e=>this.renderComment(e))}</div>`:_}
                </div>
            </div>
        `}render(){return w`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};O([v({type:Array})],vi.prototype,`comments`,void 0),vi=O([h(`mateu-comment-thread`)],vi);var yi=e=>w`
        <mateu-comment-thread
                .comments="${e.metadata.comments??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-comment-thread>
    `,bi={pdf:`📕`,image:`🖼️`,img:`🖼️`,doc:`📘`,docx:`📘`,word:`📘`,xls:`📗`,xlsx:`📗`,excel:`📗`,sheet:`📗`,zip:`🗜️`,archive:`🗜️`,video:`🎬`,audio:`🎵`,code:`💻`,csv:`📄`,txt:`📄`},xi=class extends y{constructor(...e){super(...e),this.files=[]}static{this.styles=m`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .list {
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
        }
        .file { display: flex; align-items: center; gap: .7rem; padding: .65rem .9rem; text-decoration: none; color: inherit; }
        .file + .file { border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06)); }
        .file.clickable { cursor: pointer; }
        .file.clickable:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.02)); }
        .icon { font-size: 1.3rem; flex: 0 0 auto; }
        .name { flex: 1; min-width: 0; font-weight: 500; color: var(--lumo-body-text-color, #222); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .size { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .75rem); flex: 0 0 auto; }
        .dl { color: var(--lumo-primary-color, #1a73e8); flex: 0 0 auto; }
    
        ${R}
    `}icon(e){return e&&bi[e.toLowerCase()]||`📄`}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return w`
            <div class="list">
                ${this.files.map(e=>{let t=!!e.url||!!e.actionId,n=w`
                        <span class="icon">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?w`<span class="size">${e.size}</span>`:_}
                        ${e.url?w`<span class="dl">⬇</span>`:_}
                    `;return e.url?w`<a class="file clickable" href="${e.url}" download target="_blank" rel="noopener">${n}</a>`:w`<div role="button" tabindex="0" class="file ${t?`clickable`:``}" @click="${t=>this.clickFile(e,t)}" @keydown="${L(t=>this.clickFile(e,t))}">${n}</div>`})}
            </div>
        `}};O([v({type:Array})],xi.prototype,`files`,void 0),xi=O([h(`mateu-file-list`)],xi);var Si=e=>w`
        <mateu-file-list
                .files="${e.metadata.files??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-file-list>
    `,Ci=class extends y{constructor(...e){super(...e),this.items=[],this.localDone=new Map}static{this.styles=m`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: .5rem; }
        .title { font-weight: 700; color: var(--lumo-body-text-color, #222); }
        .count { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .75rem); }
        .bar { height: 6px; border-radius: 999px; background: var(--lumo-contrast-10pct, #e5e7eb); overflow: hidden; margin-bottom: .75rem; }
        .fill { height: 100%; background: var(--lumo-success-color, #12b76a); border-radius: 999px; transition: width .2s; }
        .item { display: flex; align-items: center; gap: .6rem; padding: .35rem 0; cursor: pointer; }
        .box {
            width: 1.15rem; height: 1.15rem; border-radius: 5px; flex: 0 0 auto;
            border: 2px solid var(--lumo-contrast-30pct, #cbd5e1);
            display: flex; align-items: center; justify-content: center; color: #fff; font-size: .8rem;
        }
        .item.done .box { background: var(--lumo-success-color, #12b76a); border-color: var(--lumo-success-color, #12b76a); }
        .label { color: var(--lumo-body-text-color, #333); }
        .item.done .label { color: var(--lumo-secondary-text-color, #999); text-decoration: line-through; }
    
        ${R}
    `}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){let n=!this.isDone(e,t);this.localDone.set(t,n),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_item:e,_done:n}},bubbles:!0,composed:!0}))}render(){let e=this.items.length,t=this.items.filter((e,t)=>this.isDone(e,t)).length,n=e>0?Math.round(t/e*100):0;return w`
            <div class="head">
                ${this.heading?w`<span class="title">${this.heading}</span>`:w`<span></span>`}
                <span class="count">${t} / ${e}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${n}%;"></div></div>
            ${this.items.map((e,t)=>{let n=this.isDone(e,t);return w`
                    <div role="button" tabindex="0" class="item ${n?`done`:``}" @click="${()=>this.toggle(e,t)}" @keydown="${L(()=>this.toggle(e,t))}">
                        <span class="box">${n?`✓`:_}</span>
                        <span class="label">${e.label}</span>
                    </div>
                `})}
        `}};O([v()],Ci.prototype,`heading`,void 0),O([v({type:Array})],Ci.prototype,`items`,void 0),O([S()],Ci.prototype,`localDone`,void 0),Ci=O([h(`mateu-checklist`)],Ci);var wi=e=>{let t=e.metadata;return w`
        <mateu-checklist
                heading="${t.title??_}"
                .items="${t.items??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-checklist>
    `},Ti=class extends y{static{this.styles=m`
        :host { display: block; width: 100%; }
        .card {
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 14px);
            padding: var(--lumo-space-m, 1.25rem);
            background: var(--lumo-base-color, #fff);
        }
        .title { font-weight: 700; color: var(--lumo-body-text-color, #222); margin-bottom: .75rem; }
        .row { display: flex; align-items: center; gap: 1rem; }
        .side { flex: 1; text-align: center; }
        .label { font-size: var(--lumo-font-size-xs, .72rem); text-transform: uppercase; letter-spacing: .04em; color: var(--lumo-secondary-text-color, #888); }
        .value { font-size: 1.9rem; font-weight: 800; color: var(--lumo-body-text-color, #111); line-height: 1.1; margin-top: .15rem; }
        .mid { flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: .2rem; color: var(--lumo-secondary-text-color, #888); }
        .arrow { font-size: 1.2rem; }
        .delta {
            font-weight: 700; font-size: .85rem; border-radius: 999px; padding: .1rem .55rem;
        }
        .delta.up { color: var(--lumo-success-color, #12b76a); background: var(--lumo-success-color-10pct, rgba(18,183,106,.12)); }
        .delta.down { color: var(--lumo-error-color, #e11d48); background: var(--lumo-error-color-10pct, rgba(225,29,72,.12)); }
        .delta.flat { color: var(--lumo-secondary-text-color, #888); background: var(--lumo-contrast-10pct, rgba(0,0,0,.06)); }
        @media (prefers-color-scheme: dark) { .card { background: var(--lumo-contrast-5pct, #2a2a2a); } }
    `}render(){let e=this.trend??`flat`;return w`
            <div class="card">
                ${this.heading?w`<div class="title">${this.heading}</div>`:_}
                <div class="row">
                    <div class="side">
                        ${this.leftLabel?w`<div class="label">${this.leftLabel}</div>`:_}
                        <div class="value">${this.leftValue}</div>
                    </div>
                    <div class="mid">
                        <span class="arrow">${`→`}</span>
                        ${this.delta?w`<span class="delta ${e}">${e===`up`?`▲`:e===`down`?`▼`:``} ${this.delta}</span>`:_}
                    </div>
                    <div class="side">
                        ${this.rightLabel?w`<div class="label">${this.rightLabel}</div>`:_}
                        <div class="value">${this.rightValue}</div>
                    </div>
                </div>
            </div>
        `}};O([v()],Ti.prototype,`heading`,void 0),O([v()],Ti.prototype,`leftLabel`,void 0),O([v()],Ti.prototype,`leftValue`,void 0),O([v()],Ti.prototype,`rightLabel`,void 0),O([v()],Ti.prototype,`rightValue`,void 0),O([v()],Ti.prototype,`delta`,void 0),O([v()],Ti.prototype,`trend`,void 0),Ti=O([h(`mateu-comparison-card`)],Ti);var Ei=e=>{let t=e.metadata;return w`
        <mateu-comparison-card
                heading="${t.title??_}"
                leftLabel="${t.leftLabel??_}"
                leftValue="${t.leftValue??_}"
                rightLabel="${t.rightLabel??_}"
                rightValue="${t.rightValue??_}"
                delta="${t.delta??_}"
                trend="${t.trend??_}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-comparison-card>
    `},Di=m`
    .chip {
        display: inline-flex;
        align-items: center;
        padding: .1rem .5rem;
        border-radius: 999px;
        font-size: var(--lumo-font-size-xxs, .7rem);
        font-weight: 600;
        letter-spacing: .02em;
        line-height: 1.4;
        white-space: nowrap;
        color: var(--lumo-primary-text-color, #1a73e8);
        background: var(--lumo-primary-color-10pct, rgba(26, 115, 232, .12));
    }
    .chip.success {
        color: var(--lumo-success-text-color, #1a7f37);
        background: var(--lumo-success-color-10pct, rgba(18, 183, 106, .12));
    }
    .chip.warning {
        color: var(--lumo-warning-text-color, #b45309);
        background: var(--lumo-warning-color-10pct, rgba(245, 158, 11, .15));
    }
    .chip.error {
        color: var(--lumo-error-text-color, #c5221f);
        background: var(--lumo-error-color-10pct, rgba(225, 29, 72, .12));
    }
    .chip.contrast {
        color: var(--lumo-contrast-80pct, #333);
        background: var(--lumo-contrast-10pct, rgba(0, 0, 0, .08));
    }
`,Oi=new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}),ki=e=>Oi.format(e),Ai=(e,t)=>{let n=e<0?`-`:``,r=ki(Math.abs(e));return t?`${n}${t} ${r}`:`${n}${r}`},ji=(e,t)=>t?`${ki(e)} ${t}`:ki(e),Mi=class extends y{constructor(...e){super(...e),this.title=``,this.badges=[],this.facts=[]}static{this.styles=[Di,m`
        :host { display: block; width: 100%; }
        .card {
            display: flex;
            align-items: stretch;
            gap: var(--lumo-space-l, 1.5rem);
            padding: var(--lumo-space-m, 1rem) var(--lumo-space-l, 1.5rem);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.02));
        }
        .main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .3rem; }
        .title-row { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }
        .title {
            font-size: var(--lumo-font-size-xl, 1.375rem);
            font-weight: 700;
            color: var(--lumo-header-text-color, var(--lumo-body-text-color, #111));
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .subtitle {
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #666);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            line-height: normal;
        }
        .facts {
            display: flex; gap: var(--lumo-space-l, 1.5rem); flex-wrap: wrap;
            margin-top: .55rem; padding-top: .55rem;
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
        }
        .fact { display: flex; flex-direction: column; gap: .1rem; min-width: 0; }
        .fact .label {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-tertiary-text-color, #999);
        }
        .fact .value {
            font-size: var(--lumo-font-size-s, .875rem); font-weight: 500;
            color: var(--lumo-body-text-color, #222);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            line-height: normal;
        }
        .metric {
            flex: 0 0 auto; display: flex; flex-direction: column; justify-content: center;
            align-items: flex-end; text-align: right; gap: .15rem;
            padding-left: var(--lumo-space-l, 1.5rem);
            border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
        }
        .metric .label {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-tertiary-text-color, #999);
        }
        .metric .value {
            font-size: 1.7rem; font-weight: 700; line-height: 1.1;
            color: var(--lumo-primary-text-color, #1a73e8);
        }
        .metric .caption { font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888); }
    `]}render(){let e=!!(this.metricLabel||this.metricValue||this.metricCaption);return w`
            <div class="card">
                <div class="main">
                    <div class="title-row">
                        <span class="title">${this.title}</span>
                        ${this.badges.map(e=>w`<span class="chip ${e.color??``}">${e.label}</span>`)}
                    </div>
                    ${this.subtitle?w`<span class="subtitle">${this.subtitle}</span>`:_}
                    ${this.facts.length?w`
                        <div class="facts">
                            ${this.facts.map(e=>w`
                                <div class="fact">
                                    <span class="label">${e.label}</span>
                                    <span class="value">${e.value}</span>
                                </div>
                            `)}
                        </div>
                    `:_}
                </div>
                ${e?w`
                    <div class="metric">
                        ${this.metricLabel?w`<span class="label">${this.metricLabel}</span>`:_}
                        ${this.metricValue?w`<span class="value">${this.metricValue}</span>`:_}
                        ${this.metricCaption?w`<span class="caption">${this.metricCaption}</span>`:_}
                    </div>
                `:_}
            </div>
        `}};O([v()],Mi.prototype,`title`,void 0),O([v({type:Array})],Mi.prototype,`badges`,void 0),O([v()],Mi.prototype,`subtitle`,void 0),O([v({type:Array})],Mi.prototype,`facts`,void 0),O([v()],Mi.prototype,`metricLabel`,void 0),O([v()],Mi.prototype,`metricValue`,void 0),O([v()],Mi.prototype,`metricCaption`,void 0),Mi=O([h(`mateu-entity-header`)],Mi);var Ni=e=>{if(e.__hoistedToPageHeader)return w``;let t=e.metadata;return w`
        <mateu-entity-header
                .title="${t.title??``}"
                .badges="${t.badges??[]}"
                .subtitle="${t.subtitle}"
                .facts="${t.facts??[]}"
                .metricLabel="${t.metricLabel}"
                .metricValue="${t.metricValue}"
                .metricCaption="${t.metricCaption}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-entity-header>
    `},Pi=class extends y{constructor(...e){super(...e),this.value=0,this.max=0}static{this.styles=m`
        :host { display: block; width: 100%; }
        .meter { display: flex; flex-direction: column; gap: .35rem; }
        .label {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-tertiary-text-color, #999);
        }
        .value {
            font-size: 1.6rem; font-weight: 700; line-height: 1.1;
            color: var(--lumo-body-text-color, #111);
            font-variant-numeric: tabular-nums;
        }
        .track {
            height: .45rem; border-radius: 999px; overflow: hidden;
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.08));
        }
        .fill { height: 100%; border-radius: 999px; transition: width .3s ease; }
        .fill.primary { background: var(--lumo-primary-color, #1a73e8); }
        .fill.success { background: var(--lumo-success-color, #12b76a); }
        .fill.warning { background: var(--lumo-warning-color, #f59e0b); }
        .fill.error { background: var(--lumo-error-color, #e11d48); }
        .caption { font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888); }
    `}fillColor(){return this.dangerAt!=null&&this.value>=this.dangerAt?`error`:this.warnAt!=null&&this.value>=this.warnAt?`warning`:this.warnAt!=null||this.dangerAt!=null?`success`:`primary`}render(){let e=this.max>0?Math.min(Math.max(this.value/this.max,0),1):0,t=Math.round(e*100);return w`
            <div class="meter">
                ${this.label?w`<span class="label">${this.label}</span>`:_}
                <span class="value">${ji(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};O([v()],Pi.prototype,`label`,void 0),O([v({type:Number})],Pi.prototype,`value`,void 0),O([v({type:Number})],Pi.prototype,`max`,void 0),O([v()],Pi.prototype,`unit`,void 0),O([v()],Pi.prototype,`caption`,void 0),O([v({type:Number})],Pi.prototype,`warnAt`,void 0),O([v({type:Number})],Pi.prototype,`dangerAt`,void 0),Pi=O([h(`mateu-meter`)],Pi);var Fi=e=>{let t=e.metadata;return w`
        <mateu-meter
                .label="${t.label}"
                .value="${t.value??0}"
                .max="${t.max??0}"
                .unit="${t.unit}"
                .caption="${t.caption}"
                .warnAt="${t.warnAt}"
                .dangerAt="${t.dangerAt}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-meter>
    `},Ii=class extends y{constructor(...e){super(...e),this.total=0,this.done=0}static{this.styles=m`
        :host { display: block; width: 100%; }
        .banner {
            display: flex; align-items: center; gap: .8rem; flex-wrap: wrap;
            padding: .65rem var(--lumo-space-m, 1rem);
            border-radius: var(--lumo-border-radius-l, 12px);
            border: 1px solid var(--lumo-warning-color-10pct, rgba(245,158,11,.25));
            background: var(--lumo-warning-color-10pct, rgba(245,158,11,.12));
        }
        .banner.complete {
            border-color: var(--lumo-success-color-10pct, rgba(18,183,106,.25));
            background: var(--lumo-success-color-10pct, rgba(18,183,106,.12));
        }
        .icon { font-size: 1.1rem; flex: 0 0 auto; }
        .label {
            font-size: var(--lumo-font-size-s, .875rem); font-weight: 500;
            color: var(--lumo-body-text-color, #222);
            min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .pills { display: flex; gap: .3rem; flex: 0 0 auto; }
        .pill {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600;
            font-variant-numeric: tabular-nums;
            padding: .1rem .45rem; border-radius: 999px;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.15));
            color: var(--lumo-secondary-text-color, #888);
            background: transparent;
        }
        .pill.filled {
            border-color: var(--lumo-success-color, #12b76a);
            background: var(--lumo-success-color, #12b76a);
            color: var(--lumo-success-contrast-color, #fff);
        }
        .spacer { flex: 1; }
        button {
            font: inherit; font-size: var(--lumo-font-size-s, .875rem); font-weight: 600;
            padding: .35rem .8rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: none; cursor: pointer;
            background: var(--lumo-primary-color, #1a73e8);
            color: var(--lumo-primary-contrast-color, #fff);
            white-space: nowrap;
        }
        button:hover { filter: brightness(1.08); }
    `}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){let e=this.total>0&&this.done>=this.total,t=!e&&!!this.actionLabel&&!!this.actionId;return w`
            <div class="banner ${e?`complete`:``}">
                <span class="icon">👥</span>
                ${this.label?w`<span class="label">${this.label}</span>`:_}
                <div class="pills">
                    ${Array.from({length:this.total},(e,t)=>w`
                        <span class="pill ${t+1<=this.done?`filled`:``}">${t+1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${t?w`<button @click="${()=>this.runAction()}">${this.actionLabel} →</button>`:_}
            </div>
        `}};O([v()],Ii.prototype,`label`,void 0),O([v({type:Number})],Ii.prototype,`total`,void 0),O([v({type:Number})],Ii.prototype,`done`,void 0),O([v()],Ii.prototype,`actionLabel`,void 0),O([v()],Ii.prototype,`actionId`,void 0),Ii=O([h(`mateu-task-progress`)],Ii);var Li=e=>{let t=e.metadata;return w`
        <mateu-task-progress
                .label="${t.label}"
                .total="${t.total??0}"
                .done="${t.done??0}"
                .actionLabel="${t.actionLabel}"
                .actionId="${t.actionId}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-task-progress>
    `},Ri=class extends y{constructor(...e){super(...e),this.items=[],this.compact=!1,this.frameless=!1,this.columns=0,this.itemHeadingLevel=3}static{this.styles=[Di,R,m`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .list {
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
            /* an ancestor (e.g. a form-layout row) may set an inherited line-height like 44px —
               it pierces the shadow boundary and blows the rows up */
            line-height: var(--lumo-line-height-s, 1.375);
        }
        .list.frameless { border: none; border-radius: 0; }
        .row { display: flex; align-items: center; gap: .8rem; padding: .65rem .9rem; }
        .list.compact .row { gap: .6rem; padding: .35rem .75rem; }
        .row.clickable { cursor: pointer; }
        .row.clickable:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
        /* no frame → align the content with the host's edges */
        .list.frameless .row { padding-left: 0; padding-right: 0; }
        .row + .row { border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06)); }
        .icon { font-size: 1.2rem; flex: 0 0 auto; }
        .avatar {
            flex: 0 0 auto;
            width: 2rem; height: 2rem;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600;
            letter-spacing: .02em;
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));
            color: var(--lumo-primary-text-color, #1a73e8);
        }
        .list.compact .avatar { width: 1.6rem; height: 1.6rem; font-size: .65rem; }
        .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .1rem; }
        .list.compact .body { gap: 0; }
        .title {
            font-weight: 500; color: var(--lumo-body-text-color, #222);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .description {
            font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        /* DS-neutral small action button */
        .row-action {
            flex: 0 0 auto;
            font: inherit; font-weight: 600;
            font-size: var(--lumo-font-size-xs, .75rem);
            padding: .25rem .7rem;
            border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2));
            background: var(--lumo-base-color, #fff);
            color: var(--lumo-primary-text-color, #1a73e8);
            cursor: pointer;
        }
        .row-action:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
        /* N-column grid mode (columns > 1): cells instead of stacked rows — no dividers,
           auto-collapsing to one column on narrow viewports via the min() clamp */
        .list.grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
            /* air BETWEEN cards (the operations checklist reads as a grid of fichas, not a
               dense list) — overridable per surface via the CSS vars */
            column-gap: var(--mateu-status-grid-column-gap, 2.5rem);
            row-gap: var(--mateu-status-grid-row-gap, 2rem);
        }
        .list.grid .cell { padding: .6rem 0; }
        .list.grid .row + .row { border-top: none; }
        /* STACKED cells (items with actions or a timeline): borderless card — title + status
           chip on the same line, description below, icon actions below. Mirrors the VB/Redwood
           check-in anatomy (pax fichas / operations checklist). */
        .list.stacked { border: none; border-radius: 0; overflow: visible; }
        .cell { display: flex; flex-direction: column; gap: .2rem; padding: .5rem 0; }
        .cell + .cell { border-top: none; }
        .list.stacked:not(.grid) .cell + .cell { margin-top: .6rem; }
        /* a single-column stack (e.g. the guests rail) keeps card-sized cells — same width
           as the operations grid cells, however wide the hosting fold grows */
        .list.stacked:not(.grid) .cell { max-width: 22rem; }
        .cell-title-row { display: flex; align-items: center; gap: .5rem; min-width: 0; }
        .cell-title {
            margin: 0; font-weight: 600; color: var(--lumo-body-text-color, #222);
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        h3.cell-title { font-size: var(--lumo-font-size-m, 1rem); }
        h4.cell-title { font-size: var(--lumo-font-size-s, .875rem); }
        /* the status chip aligns to the RIGHT edge of the card */
        .cell-title-row .chip { margin-left: auto; }
        .cell-description {
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #888);
        }
        .cell-line {
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #888);
        }
        .cell-actions { display: flex; gap: .35rem; padding-top: .25rem; }
        .icon-action {
            display: inline-flex; align-items: center; justify-content: center;
            width: 2rem; height: 2rem;
            border: none; border-radius: var(--lumo-border-radius-m, 6px);
            background: transparent;
            color: var(--lumo-primary-text-color, #1a73e8);
            cursor: pointer; font-size: 1rem;
        }
        .icon-action:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
    `]}runAction(e,t){t&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}rowClicked(e){this.rowActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.rowActionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}renderItemAction(e,t,n,r){return!t||!n?_:r?w`
                <button class="icon-action" title="${t}" aria-label="${t}"
                    @click="${t=>{t.stopPropagation(),this.runAction(e,n)}}">
                    ${F(r)}
                </button>`:w`
            <button class="row-action" title="${t}"
                @click="${t=>{t.stopPropagation(),this.runAction(e,n)}}">${t}</button>`}render(){let e=this.columns>1||this.items.some(e=>e.actionId||e.actionId2||e.actionId3||(e.lines?.length??0)>0),t=this.itemHeadingLevel===4?`h4`:`h3`;return e?w`
                <div class="list stacked ${this.compact?`compact`:``} ${this.columns>1?`grid`:``}"
                     style="${this.columns>1?`grid-template-columns: repeat(auto-fit, minmax(min(18rem, calc(100% / ${this.columns} - 1.5rem)), 1fr));`:``}">
                    ${this.items.map(e=>w`
                        <div role="button" tabindex="0" class="cell ${(e.lines?.length??0)>0?`with-lines`:``} ${this.rowActionId?`clickable`:``}"
                             @click="${()=>this.rowClicked(e)}" @keydown="${L(()=>this.rowClicked(e))}">
                            <div class="cell-title-row">
                                ${t===`h4`?w`<h4 class="cell-title">${e.title}</h4>`:w`<h3 class="cell-title">${e.title}</h3>`}
                                ${e.status?w`<span class="chip ${e.statusColor??``}">${e.status}</span>`:_}
                            </div>
                            ${e.description?w`<span class="cell-description">${e.description}</span>`:_}
                            ${(e.lines??[]).map(e=>w`<span class="cell-line">${e}</span>`)}
                            ${e.actionId||e.actionId2||e.actionId3?w`
                                <div class="cell-actions">
                                    ${this.renderItemAction(e,e.actionLabel,e.actionId,e.actionIcon)}
                                    ${this.renderItemAction(e,e.actionLabel2,e.actionId2,e.actionIcon2)}
                                    ${this.renderItemAction(e,e.actionLabel3,e.actionId3,e.actionIcon3)}
                                </div>`:_}
                        </div>
                    `)}
                </div>
            `:w`
            <div class="list ${this.compact?`compact`:``} ${this.frameless?`frameless`:``}">
                ${this.items.map(e=>w`
                    <div role="button" tabindex="0" class="row ${this.rowActionId?`clickable`:``}"
                         @click="${()=>this.rowClicked(e)}" @keydown="${L(()=>this.rowClicked(e))}">
                        ${e.avatar?w`<span class="avatar">${e.avatar}</span>`:e.icon?w`<span class="icon">${e.icon}</span>`:_}
                        <div class="body">
                            <span class="title">${e.title}</span>
                            ${e.description?w`<span class="description">${e.description}</span>`:_}
                        </div>
                        ${e.status?w`<span class="chip ${e.statusColor??``}">${e.status}</span>`:_}
                    </div>
                `)}
            </div>
        `}};O([v({type:Array})],Ri.prototype,`items`,void 0),O([v({type:Boolean})],Ri.prototype,`compact`,void 0),O([v({type:Boolean})],Ri.prototype,`frameless`,void 0),O([v()],Ri.prototype,`rowActionId`,void 0),O([v({type:Number})],Ri.prototype,`columns`,void 0),O([v({type:Number})],Ri.prototype,`itemHeadingLevel`,void 0),Ri=O([h(`mateu-status-list`)],Ri);var zi=e=>{let t=e.metadata;return w`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                columns="${t.columns??0}"
                itemHeadingLevel="${t.itemHeadingLevel??3}"
                rowActionId="${x(t.rowActionId??void 0)}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-status-list>
    `},Bi=class extends y{constructor(...e){super(...e),this.items=[]}static{this.styles=m`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        ul {
            margin: 0; padding-inline-start: 1.2rem;
            color: var(--lumo-body-text-color, #222);
        }
        li { 
            padding: .15rem 0;
            line-height: normal;
        }
        li::marker { color: var(--lumo-secondary-text-color, #888); }
    `}render(){return w`
            <ul>
                ${this.items.map(e=>w`<li>${e}</li>`)}
            </ul>
        `}};O([v({type:Array})],Bi.prototype,`items`,void 0),Bi=O([h(`mateu-bulleted-list`)],Bi);var Vi=e=>w`
        <mateu-bulleted-list
                .items="${e.metadata.items??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-bulleted-list>
    `,Hi=e=>{let t=e.metadata.attributes?.[`data-colspan`];return w`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??``}"
            class="${e.cssClasses??_}"
            id="${x(e.id??void 0)}"
            data-colspan="${x(t)}"
            slot="${e.slot??_}"/>
    `},Ui={info:`ℹ`,success:`✓`,warning:`!`,danger:`!`},B=class extends y{constructor(...e){super(...e),this.text=``,this.theme=`info`,this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}static{this.styles=m`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .notice {
            display: flex;
            align-items: center;
            gap: .6rem;
            padding: .5rem .75rem;
            border-radius: var(--lumo-border-radius-m, 8px);
        }
        .notice.slim {
            margin-block-start: 0;
            margin-block-end: 0;
            padding: .2rem .5rem;
            gap: .45rem;
            line-height: normal;
        }
        .notice.slim .icon { width: .95rem; height: .95rem; font-size: .6rem; }
        /* a custom icon (e.g. an emoji like 👥) renders at its natural size, no severity circle */
        .icon.custom, .notice .icon.custom {
            background: transparent; width: auto; height: auto;
            font-size: 1rem; color: inherit;
        }
        .icon {
            flex: 0 0 auto;
            width: 1.1rem;
            height: 1.1rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: .7rem;
            font-weight: 700;
            color: #fff;
        }
        .text { flex: 1; min-width: 0; font-weight: 600; }
        .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .25rem; }
        .content { min-width: 0; }
        /* inline content: text and content share the line (e.g. label + input + action);
           wraps on narrow widths */
        .body.inline { flex-direction: row; align-items: center; gap: .8rem; flex-wrap: wrap; }
        .body.inline .text { flex: 0 0 auto; }
        .body.inline .content { flex: 1 1 12rem; min-width: 0; }
        /* ghost action button: blends with the themed strip via currentColor (DS-neutral) */
        .notice-action {
            flex: 0 0 auto;
            font: inherit; font-weight: 600;
            font-size: var(--lumo-font-size-xs, .75rem);
            padding: .2rem .7rem;
            border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid currentColor;
            background: transparent; color: inherit; cursor: pointer;
        }
        .notice-action:hover { background: rgba(0,0,0,.06); }
        .status { flex: 0 0 auto; font-weight: 600; font-size: var(--lumo-font-size-xs, .75rem); }
        /* pastel background + dark ink per theme (always-light pastels, like the page banners) */
        .info    { background: #e3f0fb; } .info .text, .info .status       { color: #1a5dad; }
        .info    .icon    { background: #4285d3; }
        .success { background: #e2f3e6; } .success .text, .success .status { color: #22703a; }
        .success .icon { background: #3e8635; }
        .warning { background: #fdf0dc; } .warning .text, .warning .status { color: #925a13; }
        .warning .icon { background: #c98a1e; }
        .danger  { background: #f6e0da; } .danger .text, .danger .status   { color: #a5502e; }
        .danger  .icon  { background: #b25b3d; }
    `}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){let e=!!this.text&&!!this.text.trim();if(!e&&!this.hasContent)return w``;let t=[`info`,`success`,`warning`,`danger`].includes(this.theme)?this.theme:`info`;return w`
            <div class="notice ${t} ${this.slim?`slim`:``}">
                ${this.noIcon?_:w`<span class="icon ${this.icon?`custom`:``}">${this.icon||Ui[t]}</span>`}
                <div class="body ${this.inlineContent?`inline`:``}">
                    ${e?w`<span class="text">${this.text}</span>`:_}
                    ${this.hasContent?w`<div class="content"><slot></slot></div>`:_}
                </div>
                ${this.actionLabel&&this.actionId?w`<button class="notice-action" @click="${()=>this.runAction()}">${this.actionLabel}</button>`:this.status?w`<span class="status">${this.status}</span>`:_}
            </div>
        `}};O([v()],B.prototype,`text`,void 0),O([v()],B.prototype,`theme`,void 0),O([v()],B.prototype,`icon`,void 0),O([v({type:Boolean})],B.prototype,`noIcon`,void 0),O([v()],B.prototype,`actionLabel`,void 0),O([v()],B.prototype,`actionId`,void 0),O([v()],B.prototype,`status`,void 0),O([v({type:Boolean})],B.prototype,`slim`,void 0),O([v({type:Boolean})],B.prototype,`fullWidth`,void 0),O([v({type:Boolean})],B.prototype,`hasContent`,void 0),O([v({type:Boolean})],B.prototype,`inlineContent`,void 0),B=O([h(`mateu-notice`)],B);var Wi=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=it(s.text??``,r,i,a,o)??``,l=t.children??[];return w`
        <mateu-notice
                text="${c}"
                theme="${s.theme??`info`}"
                icon="${x(s.icon??void 0)}"
                ?noIcon="${s.noIcon??!1}"
                actionLabel="${x(s.actionLabel??void 0)}"
                actionId="${x(s.actionId??void 0)}"
                status="${x(s.status??void 0)}"
                ?slim="${s.slim??!1}"
                ?fullWidth="${s.fullWidth??!1}"
                ?inlineContent="${s.inlineContent??!1}"
                ?hasContent="${l.length>0}"
                data-colspan="${s.fullWidth?`99`:_}"
                style="${t.style??_}"
                class="${t.cssClasses??_}"
                slot="${t.slot??_}"
        >${l.map(t=>P(e,t,n,r,i,a,o))}</mateu-notice>
    `},Gi=class extends y{constructor(...e){super(...e),this.groups=[]}static{this.styles=[Di,R,m`
        :host { display: block; width: 100%; }
        .rail { display: flex; flex-direction: column; gap: var(--lumo-space-m, 1rem); }
        .group { display: flex; flex-direction: column; gap: .45rem; }
        .group-label {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-tertiary-text-color, #999);
        }
        .card {
            display: flex; flex-direction: column; gap: .25rem;
            padding: .6rem .8rem; cursor: pointer;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, transparent);
            transition: border-color .15s ease, background .15s ease;
        }
        .card:hover { border-color: var(--lumo-contrast-30pct, rgba(0,0,0,.25)); }
        .card.selected {
            border-color: var(--lumo-primary-color, #1a73e8);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.08));
        }
        .title {
            font-size: var(--lumo-font-size-s, .875rem); font-weight: 600;
            color: var(--lumo-body-text-color, #222);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .meta { display: flex; align-items: center; gap: .45rem; flex-wrap: wrap; }
        .item-action {
            align-self: flex-end; margin-top: .25rem; cursor: pointer;
            font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600;
            color: var(--lumo-primary-text-color, #1a73e8);
            background: none; border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.15));
            border-radius: var(--lumo-border-radius-m, 8px); padding: .2rem .6rem;
        }
        .item-action:hover { border-color: var(--lumo-primary-color, #1a73e8); }
        .caption {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #888);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
    `]}willUpdate(e){e.has(`groups`)&&(this.selectedId=this.groups.flatMap(e=>e.items??[]).find(e=>e.selected)?.id)}itemAction(e,t,n){e.stopPropagation(),t&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_item:n}},bubbles:!0,composed:!0}))}select(e){this.selectedId=e,this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_item:e}},bubbles:!0,composed:!0}))}render(){return w`
            <div class="rail">
                ${this.groups.map(e=>w`
                    <div class="group" role="listbox">
                        ${e.label?w`<span class="group-label">${e.label}</span>`:_}
                        ${(e.items??[]).map(e=>w`
                            <div role="option" tabindex="0" aria-selected="${e.id===this.selectedId}" class="card ${e.id===this.selectedId?`selected`:``}"
                                 @click="${()=>this.select(e.id)}" @keydown="${L(()=>this.select(e.id))}">
                                <span class="title">${e.title}</span>
                                <div class="meta">
                                    ${e.caption?w`<span class="caption">${e.caption}</span>`:_}
                                    ${(e.badges??[]).map(e=>w`<span class="chip ${e.color??``}">${e.label}</span>`)}
                                </div>
                                ${e.actionLabel&&e.actionId?w`
                                    <button class="item-action"
                                            @click="${t=>this.itemAction(t,e.actionId,e.id)}">${e.actionLabel}</button>
                                `:_}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};O([v()],Gi.prototype,`actionId`,void 0),O([v({type:Array})],Gi.prototype,`groups`,void 0),O([S()],Gi.prototype,`selectedId`,void 0),Gi=O([h(`mateu-task-queue`)],Gi);var Ki=e=>{let t=e.metadata;return w`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-task-queue>
    `},qi=class extends y{constructor(...e){super(...e),this.columns=0,this.items=[]}static{this.styles=[Di,R,m`
        /* explicit line-height: inside a form field wrapper the inherited one is the 44px
           field height, which blows up every text row */
        :host { display: block; width: 100%; line-height: var(--lumo-line-height-m, 1.4); }
        .grid { display: grid; gap: .7rem; }
        .cell {
            position: relative;
            display: flex; flex-direction: column; align-items: flex-start; gap: .15rem;
            padding: .55rem .7rem; cursor: pointer;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, transparent);
            transition: border-color .15s ease, background .15s ease;
            min-width: 0;
        }
        .cell:hover { border-color: var(--lumo-contrast-30pct, rgba(0,0,0,.25)); }
        .cell.disabled { opacity: .5; cursor: default; pointer-events: none; }
        .cell.recommended { border-color: var(--lumo-primary-color, #1a73e8); }
        .cell.selected {
            border-color: var(--lumo-primary-color, #1a73e8);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.08));
        }
        .tag {
            position: absolute; top: -.55rem; left: .6rem;
            font-size: .55rem; font-weight: 600; letter-spacing: .04em;
            line-height: 1.5;
            padding: 0 .4rem; border-radius: 999px;
            background: var(--lumo-primary-color, #1a73e8);
            color: var(--lumo-primary-contrast-color, #fff);
            white-space: nowrap;
        }
        .title {
            font-size: var(--lumo-font-size-m, 1rem); font-weight: 700;
            color: var(--lumo-body-text-color, #111);
            max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .subtitle {
            font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888);
            max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .note {
            display: flex; align-items: center; gap: .3rem;
            font-size: var(--lumo-font-size-xs, .75rem);
            max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .note .dot { width: .45rem; height: .45rem; border-radius: 50%; flex: 0 0 auto; background: currentColor; }
        .note, .note.normal { color: var(--lumo-primary-text-color, #1a73e8); }
        .note.success { color: var(--lumo-success-text-color, #1a7f37); }
        .note.warning { color: var(--lumo-warning-text-color, #b45309); }
        .note.error { color: var(--lumo-error-text-color, #c5221f); }
        .note.contrast { color: var(--lumo-contrast-80pct, #333); }
    `]}willUpdate(e){e.has(`items`)&&(this.selectedId=this.items.find(e=>e.selected)?.id)}select(e){e.disabled||(this.selectedId=e.id,this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0})))}render(){return w`
            <div class="grid" style="${this.columns>0?`grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`:`grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));`}">
                ${this.items.map(e=>w`
                    <div role="button" tabindex="0" class="cell ${e.disabled?`disabled`:``} ${e.recommended?`recommended`:``} ${e.id===this.selectedId?`selected`:``}"
                         @click="${()=>this.select(e)}" @keydown="${L(()=>this.select(e))}">
                        ${e.recommended?w`<span class="tag">${this.recommendedLabel||`Recommended`}</span>`:_}
                        <span class="title">${e.title}</span>
                        ${e.subtitle?w`<span class="subtitle">${e.subtitle}</span>`:_}
                        ${e.statusLabel?w`<span class="chip ${e.statusColor??``}">${e.statusLabel}</span>`:_}
                        ${e.note?w`<span class="note ${e.noteColor??``}"><span class="dot"></span>${e.note}</span>`:_}
                    </div>
                `)}
            </div>
        `}};O([v()],qi.prototype,`actionId`,void 0),O([v({type:Number})],qi.prototype,`columns`,void 0),O([v()],qi.prototype,`recommendedLabel`,void 0),O([v({type:Array})],qi.prototype,`items`,void 0),O([S()],qi.prototype,`selectedId`,void 0),qi=O([h(`mateu-resource-grid`)],qi);var Ji=e=>{let t=e.metadata;return w`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-resource-grid>
    `},V=class extends y{constructor(...e){super(...e),this.title=``,this.features=[],this.current=!1,this.added=!1}static{this.styles=m`
        /* explicit line-height: inside a form field wrapper the inherited one is the 44px
           field height, which blows up every text row */
        :host { display: block; width: 100%; line-height: var(--lumo-line-height-m, 1.4); }
        .card {
            position: relative; display: flex; flex-direction: column;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
            background: var(--lumo-base-color, transparent);
        }
        .card.offer { border-color: var(--lumo-primary-color, #1a73e8); }
        .image { aspect-ratio: 16 / 9; width: 100%; object-fit: cover; display: block; }
        /* the tag is a regular small badge (tinted background + primary ink) */
        .tag {
            position: absolute; top: .7rem; left: .7rem;
            font-size: var(--lumo-font-size-xxs, .65rem); font-weight: 600; letter-spacing: .03em;
            line-height: 1.4;
            padding: .1rem .45rem; border-radius: var(--lumo-border-radius-s, 4px);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));
            color: var(--lumo-primary-text-color, #1a73e8);
            white-space: nowrap;
        }
        /* floating over an image it needs a solid background for contrast */
        .card > .tag {
            background: var(--lumo-primary-color, #1a73e8);
            color: var(--lumo-primary-contrast-color, #fff);
        }
        .tag.static { position: static; align-self: flex-start; margin-bottom: .25rem; }
        .body { display: flex; flex-direction: column; gap: .3rem; padding: var(--lumo-space-m, 1rem); flex: 1; }
        .title {
            font-size: var(--lumo-font-size-l, 1.125rem); font-weight: 700;
            color: var(--lumo-body-text-color, #111);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .subtitle {
            font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #888);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .features { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .35rem; }
        .feature {
            font-size: var(--lumo-font-size-xs, .75rem);
            padding: .1rem .55rem; border-radius: 999px;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.15));
            color: var(--lumo-secondary-text-color, #666);
            white-space: nowrap;
        }
        .footer { padding: 0 var(--lumo-space-m, 1rem) var(--lumo-space-m, 1rem); }
        .current-label {
            display: block; text-align: center; padding: .45rem 0;
            font-size: var(--lumo-font-size-s, .875rem); font-weight: 500;
            color: var(--lumo-secondary-text-color, #888);
        }
        button {
            display: flex; align-items: center; justify-content: space-between; gap: .8rem;
            width: 100%; box-sizing: border-box;
            font: inherit; font-size: var(--lumo-font-size-s, .875rem); font-weight: 600;
            padding: .5rem .9rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: none; cursor: pointer;
            background: var(--lumo-primary-color, #1a73e8);
            color: var(--lumo-primary-contrast-color, #fff);
        }
        button:hover { filter: brightness(1.08); }
        button.added { background: var(--lumo-success-color, #2e7d32); }
        .price { font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
    `}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return w`
            <div class="card ${this.current?``:`offer`}">
                ${this.image?w`<img class="image" src="${this.image}" alt="${this.title}">`:_}
                ${this.tag&&this.image?w`<span class="tag">${this.tag}</span>`:_}
                <div class="body">
                    ${this.tag&&!this.image?w`<span class="tag static">${this.tag}</span>`:_}
                    <span class="title">${this.title}</span>
                    ${this.subtitle?w`<span class="subtitle">${this.subtitle}</span>`:_}
                    ${this.features.length?w`
                        <div class="features">
                            ${this.features.map(e=>w`<span class="feature">${e}</span>`)}
                        </div>
                    `:_}
                </div>
                <div class="footer">
                    ${this.current?this.currentLabel?w`<span class="current-label">${this.currentLabel}</span>`:_:this.actionLabel&&this.actionId?w`
                            <button class="${this.added?`added`:``}" @click="${()=>this.runAction()}">
                                <span>${this.added&&this.addedLabel||this.actionLabel}</span>
                                ${this.priceLabel?w`<span class="price">${this.priceLabel}</span>`:_}
                            </button>
                        `:_}
                </div>
            </div>
        `}};O([v()],V.prototype,`tag`,void 0),O([v()],V.prototype,`title`,void 0),O([v()],V.prototype,`subtitle`,void 0),O([v()],V.prototype,`image`,void 0),O([v({type:Array})],V.prototype,`features`,void 0),O([v()],V.prototype,`priceLabel`,void 0),O([v()],V.prototype,`actionLabel`,void 0),O([v()],V.prototype,`actionId`,void 0),O([v({type:Boolean})],V.prototype,`current`,void 0),O([v()],V.prototype,`currentLabel`,void 0),O([v({type:Boolean})],V.prototype,`added`,void 0),O([v()],V.prototype,`addedLabel`,void 0),V=O([h(`mateu-offer-card`)],V);var Yi=e=>{let t=e.metadata;return w`
        <mateu-offer-card
                .tag="${t.tag}"
                .title="${t.title??``}"
                .subtitle="${t.subtitle}"
                .image="${t.image}"
                .features="${t.features??[]}"
                .priceLabel="${t.priceLabel}"
                .actionLabel="${t.actionLabel}"
                .actionId="${t.actionId}"
                .current="${t.current??!1}"
                .currentLabel="${t.currentLabel}"
                .added="${t.added??!1}"
                .addedLabel="${t.addedLabel}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-offer-card>
    `},Xi=class extends y{constructor(...e){super(...e),this.items=[],this.added=new Set}static{this.styles=m`
        :host { display: block; width: 100%; }
        .header { display: flex; align-items: baseline; justify-content: flex-end; gap: .4rem; margin-bottom: .6rem; }
        .total-label { font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #888); }
        .total {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: var(--lumo-font-size-m, 1rem); font-weight: 700;
            color: var(--lumo-primary-text-color, #1a73e8);
        }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); gap: .7rem; }
        .card {
            position: relative;
            display: flex; flex-direction: column; align-items: flex-start; gap: .3rem;
            padding: .75rem .85rem; padding-right: 3rem;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, transparent);
            transition: border-color .15s ease, background .15s ease;
            min-width: 0;
        }
        .card.added {
            border-color: var(--lumo-primary-color, #1a73e8);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.06));
        }
        .icon {
            font-size: 1.1rem; width: 2rem; height: 2rem;
            display: flex; align-items: center; justify-content: center;
            border-radius: var(--lumo-border-radius-m, 8px);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.04));
        }
        .title {
            font-size: var(--lumo-font-size-s, .875rem); font-weight: 600;
            color: var(--lumo-body-text-color, #222);
            max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .description {
            font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888);
            max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .price {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600;
            color: var(--lumo-primary-text-color, #1a73e8);
            white-space: nowrap;
        }
        .included {
            font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600;
            color: var(--lumo-success-text-color, #1a7f37);
            white-space: nowrap;
        }
        .toggle {
            position: absolute; top: .6rem; right: .6rem;
            width: 1.7rem; height: 1.7rem; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font: inherit; font-size: 1rem; line-height: 1; cursor: pointer;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2));
            background: transparent; color: var(--lumo-secondary-text-color, #666);
            transition: all .15s ease;
        }
        .toggle:hover { border-color: var(--lumo-primary-color, #1a73e8); color: var(--lumo-primary-text-color, #1a73e8); }
        .toggle.on {
            border-color: var(--lumo-primary-color, #1a73e8);
            background: var(--lumo-primary-color, #1a73e8);
            color: var(--lumo-primary-contrast-color, #fff);
        }
    `}willUpdate(e){e.has(`items`)&&(this.added=new Set(this.items.filter(e=>e.added).map(e=>e.id)))}total(){return this.items.filter(e=>e.id!=null&&this.added.has(e.id)).reduce((e,t)=>e+(t.price??0),0)}toggle(e){if(e.id==null)return;let t=new Set(this.added),n=!t.has(e.id);n?t.add(e.id):t.delete(e.id),this.added=t,this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_item:e.id,_added:n,_total:this.total()}},bubbles:!0,composed:!0}))}render(){return w`
            <div class="header">
                ${this.totalLabel?w`<span class="total-label">${this.totalLabel}:</span>`:_}
                <span class="total">${Ai(this.total(),this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(e=>{let t=e.id!=null&&this.added.has(e.id);return w`
                        <div class="card ${t?`added`:``}">
                            ${e.icon?w`<span class="icon">${e.icon}</span>`:_}
                            <span class="title">${e.title}</span>
                            ${e.description?w`<span class="description">${e.description}</span>`:_}
                            ${e.includedLabel?w`<span class="included">${e.includedLabel}</span>`:w`
                                    ${e.price==null?_:w`
                                        <span class="price">${Ai(e.price,this.currency)}${e.unit?` / ${e.unit}`:``}</span>
                                    `}
                                    <button class="toggle ${t?`on`:``}" @click="${()=>this.toggle(e)}"
                                            aria-pressed="${t}">${t?`✓`:`+`}</button>
                                `}
                        </div>
                    `})}
            </div>
        `}};O([v()],Xi.prototype,`totalLabel`,void 0),O([v()],Xi.prototype,`currency`,void 0),O([v()],Xi.prototype,`actionId`,void 0),O([v({type:Array})],Xi.prototype,`items`,void 0),O([S()],Xi.prototype,`added`,void 0),Xi=O([h(`mateu-addon-picker`)],Xi);var Zi=e=>{let t=e.metadata;return w`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-addon-picker>
    `},Qi=class extends y{constructor(...e){super(...e),this.lines=[]}static{this.styles=m`
        :host {
            display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem);
            /* an ancestor (e.g. a form-layout row) may set an inherited line-height like 44px —
               it pierces the shadow boundary and blows the rows up */
            line-height: var(--lumo-line-height-s, 1.375);
        }
        .row { display: flex; align-items: center; gap: .6rem; padding: .35rem 0; }
        .dot {
            width: .35rem; height: .35rem; border-radius: 50%; flex: 0 0 auto;
            background: var(--lumo-contrast-30pct, rgba(0,0,0,.25));
        }
        .concept {
            flex: 1; min-width: 0; color: var(--lumo-body-text-color, #222);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .amount {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-variant-numeric: tabular-nums;
            color: var(--lumo-body-text-color, #222);
            white-space: nowrap;
        }
        .amount.negative { color: var(--lumo-error-text-color, #c5221f); }
        .included-label { font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888); white-space: nowrap; }
        .total-row {
            display: flex; align-items: baseline; justify-content: space-between; gap: .6rem;
            margin-top: .45rem; padding-top: .55rem;
            border-top: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.15));
        }
        .total-label { font-weight: 600; color: var(--lumo-body-text-color, #222); }
        .total {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-variant-numeric: tabular-nums;
            font-size: var(--lumo-font-size-l, 1.125rem); font-weight: 700;
            color: var(--lumo-body-text-color, #111);
            white-space: nowrap;
        }
    `}computedTotal(){return this.total==null?this.lines.filter(e=>!e.included).reduce((e,t)=>e+(t.amount??0),0):this.total}render(){return w`
            ${this.lines.map(e=>w`
                <div class="row">
                    <span class="dot"></span>
                    <span class="concept">${e.concept}</span>
                    ${e.included?w`<span class="included-label">${e.includedLabel||`Included`}</span>`:w`<span class="amount ${(e.amount??0)<0?`negative`:``}">${Ai(e.amount??0,this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel||`Total`}</span>
                <span class="total">${Ai(this.computedTotal(),this.currency)}</span>
            </div>
        `}};O([v()],Qi.prototype,`currency`,void 0),O([v()],Qi.prototype,`totalLabel`,void 0),O([v({type:Array})],Qi.prototype,`lines`,void 0),O([v({type:Number})],Qi.prototype,`total`,void 0),Qi=O([h(`mateu-ledger`)],Qi);var $i=e=>{let t=e.metadata;return w`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-ledger>
    `},ea=class extends y{constructor(...e){super(...e),this.methods=[]}static{this.styles=m`
        :host { display: block; width: 100%; }
        .bar { display: flex; align-items: stretch; gap: .6rem; flex-wrap: wrap; }
        .methods { display: flex; gap: .4rem; flex-wrap: wrap; }
        .method {
            font: inherit; font-size: var(--lumo-font-size-s, .875rem); font-weight: 600;
            padding: .45rem .9rem; cursor: pointer;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.15));
            border-radius: var(--lumo-border-radius-m, 6px);
            background: transparent; color: var(--lumo-body-text-color, #444);
            transition: all .15s ease;
            white-space: nowrap;
        }
        .method:hover { border-color: var(--lumo-contrast-40pct, rgba(0,0,0,.3)); }
        .method.selected {
            border-color: var(--lumo-primary-color, #1a73e8);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));
            color: var(--lumo-primary-text-color, #1a73e8);
        }
        .context {
            display: flex; flex-direction: column; justify-content: center; gap: .05rem;
            padding: .3rem .7rem;
            border-radius: var(--lumo-border-radius-m, 6px);
            background: var(--lumo-success-color-10pct, rgba(18,183,106,.12));
        }
        .context .label {
            font-size: var(--lumo-font-size-xxs, .65rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-success-text-color, #1a7f37);
        }
        .context .value {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: var(--lumo-font-size-s, .875rem); font-weight: 700;
            color: var(--lumo-success-text-color, #1a7f37);
            white-space: nowrap;
        }
        .spacer { flex: 1; }
        .confirm {
            font: inherit; font-size: var(--lumo-font-size-s, .875rem); font-weight: 700;
            padding: .45rem 1.1rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: none; cursor: pointer;
            background: var(--lumo-primary-color, #1a73e8);
            color: var(--lumo-primary-contrast-color, #fff);
            white-space: nowrap;
        }
        .confirm:hover { filter: brightness(1.08); }
    `}willUpdate(e){e.has(`selected`)&&(this.selectedId=this.selected)}confirm(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_method:this.selectedId}},bubbles:!0,composed:!0}))}pick(e){this.selectedId=e,this.methodActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.methodActionId,parameters:{_method:e}},bubbles:!0,composed:!0}))}render(){return w`
            <div class="bar">
                <div class="methods">
                    ${this.methods.map(e=>w`
                        <button class="method ${e.id===this.selectedId?`selected`:``}"
                                @click="${()=>this.pick(e.id)}">${e.label}</button>
                    `)}
                </div>
                ${this.contextLabel||this.contextValue?w`
                    <div class="context">
                        ${this.contextLabel?w`<span class="label">${this.contextLabel}</span>`:_}
                        ${this.contextValue?w`<span class="value">${this.contextValue}</span>`:_}
                    </div>
                `:_}
                <span class="spacer"></span>
                ${this.confirmLabel&&this.actionId?w`<button class="confirm" @click="${()=>this.confirm()}">${this.confirmLabel}</button>`:_}
            </div>
        `}};O([v()],ea.prototype,`actionId`,void 0),O([v()],ea.prototype,`methodActionId`,void 0),O([v({type:Array})],ea.prototype,`methods`,void 0),O([v()],ea.prototype,`selected`,void 0),O([v()],ea.prototype,`contextLabel`,void 0),O([v()],ea.prototype,`contextValue`,void 0),O([v()],ea.prototype,`confirmLabel`,void 0),O([S()],ea.prototype,`selectedId`,void 0),ea=O([h(`mateu-payment-picker`)],ea);var ta=e=>{let t=e.metadata;return w`
        <mateu-payment-picker
                .actionId="${t.actionId}"
                .methodActionId="${t.methodActionId}"
                .methods="${t.methods??[]}"
                .selected="${t.selected}"
                .contextLabel="${t.contextLabel}"
                .contextValue="${t.contextValue}"
                .confirmLabel="${t.confirmLabel}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-payment-picker>
    `},na=class extends y{constructor(...e){super(...e),this.items=[]}static{this.styles=m`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .list {
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
        }
        .row { display: flex; align-items: center; gap: .8rem; padding: .7rem .9rem; }
        .row + .row { border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06)); }
        .dot { width: .55rem; height: .55rem; border-radius: 50%; flex: 0 0 auto; }
        .dot.ok { background: var(--lumo-success-color, #12b76a); }
        .dot.warning { background: var(--lumo-warning-color, #f59e0b); }
        .dot.error { background: var(--lumo-error-color, #e11d48); }
        .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .1rem; }
        .name {
            font-weight: 500; color: var(--lumo-body-text-color, #222);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .systems {
            font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .counters { display: flex; align-items: center; gap: .8rem; flex: 0 0 auto; }
        .counter { font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums; }
        .counter.ok { color: var(--lumo-success-text-color, #1a7f37); }
        .counter.warning { color: var(--lumo-warning-text-color, #b45309); }
        .counter.error { color: var(--lumo-error-text-color, #c5221f); }
        button {
            font: inherit; font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600;
            padding: .25rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid var(--lumo-warning-text-color, #b45309);
            background: var(--lumo-warning-color-10pct, rgba(245,158,11,.12));
            color: var(--lumo-warning-text-color, #b45309);
            cursor: pointer; white-space: nowrap; flex: 0 0 auto;
        }
        button:hover { background: var(--lumo-warning-color-10pct, rgba(245,158,11,.25)); filter: brightness(.97); }
    `}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return w`
            <div class="list">
                ${this.items.map(e=>w`
                    <div class="row">
                        <span class="dot ${e.status??`ok`}"></span>
                        <div class="body">
                            <span class="name">${e.name}</span>
                            ${e.systems?.length?w`<span class="systems">${e.systems.join(` · `)}</span>`:_}
                        </div>
                        <div class="counters">
                            <span class="counter ok">✓ ${e.ok??0} OK</span>
                            ${(e.warnings??0)>0?w`<span class="counter warning">⚠ ${e.warnings} warnings</span>`:_}
                            ${(e.errors??0)>0?w`<span class="counter error">⛔ ${e.errors} errors</span>`:_}
                        </div>
                        ${e.actionLabel&&e.actionId?w`<button @click="${()=>this.runAction(e)}">${e.actionLabel}</button>`:_}
                    </div>
                `)}
            </div>
        `}};O([v({type:Array})],na.prototype,`items`,void 0),na=O([h(`mateu-process-monitor`)],na);var ra=e=>w`
        <mateu-process-monitor
                .items="${e.metadata.items??[]}"
                style="${e.style??_}"
                class="${e.cssClasses??_}"
                slot="${e.slot??_}"
        ></mateu-process-monitor>
    `,ia=(e,t)=>{let n=e.style;return e.id&&(n&&!n.endsWith(`;`)&&(n+=`;`),n??=``,t[e.id+`.hidden`]==1&&(n+=`display: none;`)),n},aa=(e,t)=>{let n={...e.metadata};if(e.id&&n){if(n.type==A.Button){let r=n;t[e.id+`.disabled`]==1&&(r.disabled=!0)}if(n.type==A.FormField){let r=n;t[e.id+`.disabled`]==1&&(r.disabled=!0)}}return n},H=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),oa={[A.Bpmn]:({component:e})=>Sr(e),[A.Workflow]:({component:e})=>wr(e),[A.FormEditor]:({component:e})=>Tr(e),[A.Page]:H(br),[A.Div]:H(pr),[A.Directory]:({component:e,baseUrl:t,state:n,data:r})=>dr(e,t,n,r),[A.FormLayout]:H(Zt),[A.HorizontalLayout]:H(rn),[A.VerticalLayout]:H(an),[A.SplitLayout]:H(on),[A.MasterDetailLayout]:H(sn),[A.TabLayout]:H(cn),[A.AccordionLayout]:H(ln),[A.BoardLayout]:H(mn),[A.BoardLayoutRow]:H(hn),[A.BoardLayoutItem]:H(gn),[A.Scroller]:H(dn),[A.FullWidth]:H(fn),[A.Container]:H(pn),[A.Form]:({container:e,component:t,baseUrl:n,state:r,data:i,appState:a,appData:o})=>{let s=t.metadata;return w`<mateu-form
            id="${t.id}"
        baseUrl="${n}"
            .component="${t}"
            .values="${r}"
            .state="${r}"
            .data="${i}"
            .appState="${a}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??_}"
            >
                ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
            ${s?.buttons?.map(t=>w`
               ${P(e,{id:t.actionId,metadata:t,type:k.ClientSide,slot:`buttons`},void 0,r,i,a,o)}
`)}

            </mateu-form>`},[A.Table]:({component:e,state:t,data:n})=>bn(e,(e.id?n?.[e.id]:void 0)?.page?.content??xn(e,t)),[A.Crud]:H(xr),[A.App]:({container:e,component:t,baseUrl:n,state:r,data:i,appState:a,appData:o})=>w`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${n}"
                        .component="${t}"
                        .state="${r}"
                        .data="${i}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${a}"
                        .appData="${o}"
            >
             ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
         </mateu-app>`,[A.Element]:({container:e,component:t})=>Mn(e,t.metadata,t),[A.FormField]:({component:e,state:t})=>vr(e,t),[A.Text]:({component:e,state:t,data:n,appState:r,appData:i})=>Pn(e,t,n,r,i),[A.Avatar]:({component:e,state:t,data:n})=>ut(e,t,n),[A.Chat]:({component:e,state:t,data:n})=>Cr(e,t,n),[A.AvatarGroup]:({component:e})=>dt(e),[A.Badge]:({component:e,state:t,data:n})=>ft(e,t,n),[A.Breadcrumbs]:({component:e})=>lr(e),[A.Anchor]:({component:e})=>Fn(e),[A.Button]:({component:e,state:t,data:n})=>Hn(e,t,n),[A.Card]:H(Wn),[A.Chart]:({component:e})=>Gn(e),[A.Icon]:({component:e})=>Kn(e),[A.ConfirmDialog]:H(Zn),[A.ContextMenu]:H(Tn),[A.CookieConsent]:({component:e})=>Qn(e),[A.Details]:H($n),[A.Dialog]:({component:e,baseUrl:t,state:n,data:r,appState:i,appData:a})=>er(e,t,n,r,i,a),[A.Drawer]:({component:e,baseUrl:t,state:n,data:r,appState:i,appData:a})=>tr(e,t,n,r,i,a),[A.Image]:({component:e})=>cr(e),[A.Map]:({component:e})=>sr(e),[A.Markdown]:({component:e})=>rr(e),[A.MicroFrontend]:({component:e})=>nr(e),[A.Notification]:({component:e})=>ir(e),[A.ProgressBar]:({component:e,state:t})=>ar(e,t),[A.Popover]:H(or),[A.CarouselLayout]:H(ur),[A.Tooltip]:H(On),[A.MessageInput]:({component:e})=>Dn(e),[A.MessageList]:({component:e})=>Sn(e),[A.CustomField]:H(En),[A.MenuBar]:({container:e,component:t,baseUrl:n,state:r,data:i})=>wn(e,t,n,r,i),[A.Grid]:({component:e,state:t})=>bn(e,xn(e,t)),[A.VirtualList]:H(_n),[A.FormSection]:H(mr),[A.FormSubSection]:H(hr),[A.MetricCard]:({component:e})=>Ar(e),[A.Scoreboard]:H(jr),[A.DashboardPanel]:H(Mr),[A.DashboardLayout]:H(Nr),[A.FoldoutLayout]:H(Fr),[A.ContentLayout]:H(Ir),[A.HeroSection]:H(Lr),[A.EmptyState]:({component:e})=>Ct(e),[A.Skeleton]:({component:e})=>wt(e),[A.Gantt]:({component:e})=>Br(e),[A.PlanningBoard]:({component:e})=>Hr(e),[A.Kanban]:({component:e})=>Wr(e),[A.Timeline]:({component:e})=>Kr(e),[A.ProgressSteps]:({component:e})=>Jr(e),[A.Stat]:({component:e})=>Xr(e),[A.Calendar]:({component:e})=>Qr(e),[A.PricingTable]:({component:e})=>ei(e),[A.OrgChart]:({component:e})=>ni(e),[A.Heatmap]:({component:e})=>ai(e),[A.Funnel]:({component:e})=>si(e),[A.TrendChart]:({component:e})=>li(e),[A.FeatureGrid]:({component:e})=>di(e),[A.Testimonials]:({component:e})=>pi(e),[A.Faq]:({component:e})=>hi(e),[A.CalloutCard]:({component:e})=>_i(e),[A.CommentThread]:({component:e})=>yi(e),[A.FileList]:({component:e})=>Si(e),[A.Checklist]:({component:e})=>wi(e),[A.ComparisonCard]:({component:e})=>Ei(e),[A.EntityHeader]:({component:e})=>Ni(e),[A.Meter]:({component:e})=>Fi(e),[A.TaskProgress]:({component:e})=>Li(e),[A.StatusList]:({component:e})=>zi(e),[A.BulletedList]:({component:e})=>Vi(e),[A.Separator]:({component:e})=>Hi(e),[A.Notice]:H(Wi),[A.TaskQueue]:({component:e})=>Ki(e),[A.ResourceGrid]:({component:e})=>Ji(e),[A.OfferCard]:({component:e})=>Yi(e),[A.AddOnPicker]:({component:e})=>Zi(e),[A.Ledger]:({component:e})=>$i(e),[A.PaymentPicker]:({component:e})=>ta(e),[A.ProcessMonitor]:({component:e})=>ra(e)},sa=(e,t,n,r,i,a,o,s)=>{if(!t?.metadata)return t==null?(console.warn(`No metadata for component`,t),w`<p>No metadata for component</p>`):sa(e,{id:T(),metadata:t,type:k.ClientSide},n,r,i,a,o,s);let c=t.metadata.type,l={...t,style:ia(t,i),metadata:aa(t,i)},u=oa[c];return u?u({container:e,component:l,baseUrl:n,state:r,data:i,appState:a,appData:o,labelAlreadyRendered:s}):w`<p ${l?.slot??_}>Unknown metadata type ${c} for component ${l?.id}</p>`},ca=function(e){return e.NONE=`NONE`,e.INFO=`INFO`,e.SUCCESS=`SUCCESS`,e.WARNING=`WARNING`,e.DANGER=`DANGER`,e}({}),la=(e,t,n)=>{let r=e[n.path];return r?w`<span theme="badge pill ${ua(r.type)}">${r.message}</span>`:w``},ua=e=>{switch(e){case ca.SUCCESS:return`success`;case ca.WARNING:return`warning`;case ca.DANGER:return`error`;case ca.NONE:return`contrast`}return``},U=class extends y{constructor(...e){super(...e),this.id=``,this.baseUrl=``,this.state={},this.data={},this.appState={},this.appData={},this.respondToVisibility=(e,t)=>{var n={root:document.documentElement};new IntersectionObserver(e=>{e.forEach(e=>{t(e.intersectionRatio>0)})},n).observe(e)},this.keepAsking=!1,this.askToUpper=()=>{let e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent(`fetch-more-elements`,{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?sa(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?w`<div class="neutral-card">
                ${e.image?w`<img class="card-media" src="${e.image}" alt="" />`:_}
                <div class="card-body">
                    <div class="card-head">
                        ${e.title?w`<span class="card-title">${e.title}</span>`:_}
                        ${e.status?w`<span theme="badge ${ua(e.status.type)}">${e.status.message}</span>`:_}
                    </div>
                    ${e.subtitle?w`<div class="card-subtitle">${e.subtitle}</div>`:_}
                    ${e.content?w`<div>${e.content}</div>`:_}
                </div>
        </div>`:w`${e}`,this.hasMore=!1,this.clickedOnCard=e=>{this.state[this.id+`_selected_items`]=[e],this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0}))}}updated(e){super.updated(e);let t=this.data[this.id]?.page;this.hasMore=t?.content?.length<t?.totalElements}firstUpdated(e){super.firstUpdated(e),this.respondToVisibility(this.askForMore,e=>{this.keepAsking=e,e&&this.askToUpper()})}render(){return w`
            <div class="card-container">
                ${(this.data[this.id]?.page)?.content?.map(e=>w`<div role="button" tabindex="0" @click="${()=>this.clickedOnCard(e)}" @keydown="${L(()=>this.clickedOnCard(e))}" class="car-container">${this.renderItem(e)}</div>`)}
                <div id="ask-for-more" style="display: ${this.hasMore?`flex`:`none`}; width: 100%; justify-content: center; padding: var(--lumo-space-m); color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Loading more…</div>
            </div>

            <slot></slot>
       `}static{this.styles=m`
        ${fe}
        
        .card-container {
            display: flex;
            width: 100%;
            flex-wrap: wrap;
            gap: 10px;
        }

        .neutral-card {
            display: flex;
            gap: .75rem;
            padding: .8rem 1rem;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, #fff);
            min-width: 14rem;
        }
        .neutral-card .card-media { width: 3rem; height: 3rem; object-fit: cover; border-radius: var(--lumo-border-radius-m, 8px); }
        .neutral-card .card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .2rem; }
        .neutral-card .card-head { display: flex; align-items: center; gap: .5rem; justify-content: space-between; }
        .neutral-card .card-title { font-weight: 600; }
        .neutral-card .card-subtitle { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem); }
    
        ${R}
    `}};O([v()],U.prototype,`id`,void 0),O([v()],U.prototype,`metadata`,void 0),O([v()],U.prototype,`baseUrl`,void 0),O([v()],U.prototype,`state`,void 0),O([v()],U.prototype,`data`,void 0),O([v()],U.prototype,`appState`,void 0),O([v()],U.prototype,`appData`,void 0),O([v()],U.prototype,`emptyStateMessage`,void 0),O([S()],U.prototype,`keepAsking`,void 0),O([b(`#ask-for-more`)],U.prototype,`askForMore`,void 0),O([S()],U.prototype,`hasMore`,void 0),U=O([h(`mateu-card-list`)],U);var da={show:e=>console.debug(`[mateu] no notifier registered, dropping toast:`,e.text)};function fa(e){da=e}function pa(e,t){da.show(e,t)}var ma=function(e){return e.none=`none`,e.success=`success`,e.error=`error`,e.warning=`warning`,e.contrast=`contrast`,e.normal=`normal`,e}({}),ha=function(e){return e.primary=`primary`,e.secondary=`secondary`,e.tertiary=`tertiary`,e.tertiaryInline=`tertiaryInline`,e}({});function ga(e){if(e.weight!=null)return e.weight;let t=e.stereotype??``;if(t===`icon`)return 1;if(t===`image`)return 4;if(t===`html`||t===`richText`||t===`markdown`||t===`textarea`)return 5;if(t===`link`)return 2.5;if(t===`combobox`||t===`select`)return 2;let n=e.dataType??``;return n===`bool`?1:n===`status`||n===`integer`?1.5:n===`number`||n===`date`||n===`money`?2:n===`dateTime`||n===`dateRange`?2.5:3}function _a(e,t){if(e.length===0)return`table`;let n=e.reduce((e,t)=>e+ga(t),0)/(t/76);if(n<=1.1)return`table`;if(n>1.6||e.length>10)return`masterDetail`;let r=e.filter(e=>e.identifier||(e.priority??2**53-1)<=2),i=r.reduce((e,t)=>e+ga(t),0);return r.length>0&&i<=8?`list`:e.some(e=>e.stereotype===`image`||e.stereotype===`html`)||r.length===0&&e.length>=4&&e.length<=8?`cards`:`masterDetail`}function va(e){return e.filter(e=>e.identifier||(e.priority??2**53-1)<=2).sort((e,t)=>(e.priority??2**53-1)-(t.priority??2**53-1))}function ya(e){let t=va(e);return t.length>0?t:e.slice(0,3)}var ba={asc:`ascending`,desc:`descending`},W=class extends y{constructor(...e){super(...e),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this._columnPrefsRevision=0,this._prefsRevisionApplied=-1,this.search=()=>{let e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`search`,parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{pa({text:e,position:`bottomEnd`,variant:`error`,duration:3e3},this)},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};let t=this.component.metadata;if(this._syncStateToUrl(t),t.rowsSource){this._fetchRowsFromRest(t,e);return}!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`search`,parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this._fetchRowsFromRest=(e,t)=>{let n=this.cols.map(e=>e.id).filter(Boolean);Jt(e.rowsSource,n,e=>j(e,this.state,this.data)).then(r=>{let i=String(this.state?.searchText??``).trim().toLowerCase(),a=i?r.filter(e=>n.some(t=>String(e[t]??``).toLowerCase().includes(i))):r,o=e.pageSize&&e.pageSize>0?e.pageSize:a.length||1,s=Number(this.state?.page??0),c=a.slice(s*o,s*o+o);this.data={...this.data,[this.id]:{page:{totalElements:a.length,pageSize:o,pageNumber:s,content:c}}},this.requestUpdate(),t?.()}).catch(e=>{console.warn(`mateu: external rows fetch failed`,e),t?.()})},this.fetchMoreElements=e=>{let{params:t,callback:n}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(n)},this.directionChanged=e=>{let t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(e=>({fieldId:e.__data.path,direction:e.__data.direction?ba[e.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>j(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e===`import`){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{let t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`process-import`,parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get columnPrefsScope(){return window.location.pathname}get effectiveComponent(){let e=this.component,t=e?.metadata;if(!e||!t?.columns)return e;if(this._prefsSource===e&&this._prefsRevisionApplied===this._columnPrefsRevision)return this._prefsApplied;let n=Lt(this.columnPrefsScope),r=Vt(t.columns,n,e=>e.metadata??{});return this._prefsApplied=r===t.columns?e:{...e,metadata:{...t,columns:r}},this._prefsSource=e,this._prefsRevisionApplied=this._columnPrefsRevision,this._prefsApplied}get columnChooserEntries(){return(this.component?.metadata?.columns??[]).map(e=>{let t=e.metadata??{},n=t.id??e.id;return n?{id:n,label:t.label??n,protected:Bt(t)}:void 0}).filter(e=>!!e)}renderColumnChooser(){let e=this.columnChooserEntries;return e.filter(e=>!e.protected).length===0?_:w`
            <mateu-column-chooser
                .columns="${e}"
                .scope="${this.columnPrefsScope}"
                @column-prefs-changed="${e=>{e.stopPropagation(),this._columnPrefsRevision++}}"
            ></mateu-column-chooser>
        `}get cols(){return(this.effectiveComponent?.metadata)?.columns?.map(e=>e.metadata)??[]}get identifierFieldName(){let e=this.cols.find(e=>e.identifier);return e?e.id:this.cols.find(e=>e.id===`id`)?.id}get effectiveGridLayout(){let e=this.component?.metadata,t=e?.gridLayout??`auto`;return t===`auto`?e?.crudlType===`card`?`cards`:_a(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{let t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set([`searchText`,...(e.filters??[]).flatMap(e=>e.stereotype===`dateRange`||e.stereotype===`numberRange`?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])])}_syncStateToUrl(e){let t=this._filterIds(e),n=new URLSearchParams(window.location.search);t.forEach(e=>n.delete(e)),n.delete(`page`),n.delete(`sort`),t.forEach(e=>{let t=this.state[e];t!=null&&t!==``&&n.set(e,String(t))});let r=this.state.page;r&&r>0&&n.set(`page`,String(r));let i=this.state.sort;if(i&&i.length>0){let e=i.filter(e=>e.fieldId&&e.direction).map(e=>`${e.fieldId}:${e.direction}`).join(`,`);e&&n.set(`sort`,e)}let a=n.toString(),o=a?`${window.location.pathname}?${a}`:window.location.pathname;window.location.pathname+window.location.search!==o&&history.replaceState(null,``,o)}_initStateFromUrl(e,t){let n=new URLSearchParams(window.location.search),r=this._filterIds(e),i={...t};n.forEach((e,t)=>{r.has(t)&&(i[t]=e)});let a=n.get(`page`);if(a!==null){let e=parseInt(a,10);!isNaN(e)&&e>0&&(i.page=e)}let o=n.get(`sort`);if(o){let e=o.split(`,`).map(e=>{let[t,n]=e.split(`:`);return t&&n?{fieldId:t,direction:n}:null}).filter(Boolean);e.length>0&&(i.sort=e)}return i}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has(`component`)){let e=this.component?.id;if(e!==this._initializedForComponentId){this._initializedForComponentId=e;let t=this.component?.metadata,n=t.initialPage&&t.initialPage>0?t.initialPage:0;this.state=this._initStateFromUrl(t,{...this.state,size:t.pageSize,page:n,sort:[]}),(this.state.page!==n||this.state.sort?.length>0||[...this._filterIds(t)].some(e=>this.state[e]!=null)||t.rowsSource)&&this.handleSearchRequested(void 0)}}}render(){let e=e=>{let t=[];return e.color&&e.color!==ma.normal&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle===ha.tertiaryInline?`tertiary-inline`:e.buttonStyle),t.length?t.join(` `):void 0},t=e=>e===`back`||e===`backToList`||!!e&&e.startsWith(`cancel`),n=t=>N.get()?.renderToolbarButton?.(t,this.evalLabel(t.label),()=>this.handleToolbarButtonClick(t.actionId))||w`
                <button class="crud-btn"
                        data-action-id="${t.id}"
                        theme="${e(t)||_}"
                        @click="${()=>this.handleToolbarButtonClick(t.actionId)}"
                >${this.evalLabel(t.label)}</button>
            `;if(!this.component)return w`no component`;let r=this.effectiveComponent,i=r.metadata;i.serverSideOrdering=!0;let a=(()=>{let e=this;for(;e;){let t=e;if(t.tagName===`MATEU-PAGE`)return(t.component?.metadata?.toolbar?.length??0)>0;e=t.parentElement??(t.getRootNode?.()instanceof ShadowRoot?t.getRootNode().host:null)}return!1})()?[]:i?.toolbar??[],o=a.filter(e=>t(e.actionId)),s=a.filter(e=>!t(e.actionId)),c=o.length>0&&s.length>0,l=!!i?.title||!!i?.subtitle||a.length>0,u=this.effectiveGridLayout,d=this.cols,f=va(d),p=this.data[this.id]?.page?.content??[],ee=this.state[this.component?.id]?.emptyStateMessage,te=(e,t)=>{let n=t[e.id];return n==null?w``:e.dataType===`status`?w`<span theme="badge pill ${ua(n.type)}">${n.message}</span>`:e.dataType===`bool`?w`${n?`✓`:`✗`}`:typeof n==`object`?w`${n.label??n.name??n.message??``}`:w`${n}`},ne=()=>{let e=this.identifierFieldName,t=this.state._selectedId??this.appState?._splitDetailId,n=f.find(e=>e.identifier)??f[0],r=e=>e.dataType===`action`||e.dataType===`actionGroup`||e.dataType===`menu`||e.stereotype===`button`,i=f.filter(e=>e!==n&&!r(e)),a=d.filter(e=>r(e)),o=(e,t,n)=>{e.stopPropagation(),e.currentTarget.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_clickedRow:n}},bubbles:!0,composed:!0}))},s=e=>{let t=[];for(let n of a){let r=e[n.id];if(n.dataType===`action`){let i=r?.methodNameInCrud?r:e.action?.methodNameInCrud?e.action:{methodNameInCrud:n.id,label:n.label,icon:null,disabled:!1};t.push(w`
                            <button class="crud-btn" theme="tertiary small" title="${i.label||_}"
                                @click="${t=>o(t,`action-on-row-`+i.methodNameInCrud,e)}">
                                ${i.icon?F(i.icon):_}
                                ${i.label??_}
                            </button>`)}else(n.dataType===`actionGroup`||n.dataType===`menu`)&&(r?.actions??[]).forEach(n=>t.push(w`
                            <button class="crud-btn" theme="tertiary small" title="${n.label||_}"
                                @click="${t=>o(t,`action-on-row-`+n.methodNameInCrud,e)}">
                                ${n.icon?F(n.icon):_}
                                ${n.label??_}
                            </button>`))}return t.length?w`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${t}
                    </div>`:_};return w`
                <div class="m-listbox" style="width: 100%;">
                    ${p.length===0?w`<div class="m-item" disabled>${St(ee)}</div>`:_}
                    ${p.map(r=>w`
                        <div role="button" tabindex="0" class="m-item"
                            ?selected="${e&&t!==void 0&&String(r[e])===String(t)}"
                            @click="${()=>{e&&r[e]!==void 0&&(this.state={...this.state,_selectedId:String(r[e])}),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`view`,parameters:r},bubbles:!0,composed:!0}))}}" @keydown="${L(()=>{e&&r[e]!==void 0&&(this.state={...this.state,_selectedId:String(r[e])}),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`view`,parameters:r},bubbles:!0,composed:!0}))})}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${n?r[n.id]??``:``}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${i.map(e=>w`<span>${e.label}: ${te(e,r)}</span>`)}
                            </div>
                            ${s(r)}
                        </div>
                    `)}
                </div>`},re=(e,t,n)=>{let r=this.identifierFieldName;r&&n[r]!==void 0&&(this.state={...this.state,_selectedId:String(n[r])}),e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:n},bubbles:!0,composed:!0}))},m=()=>{let e=this.identifierFieldName,t=this.state._selectedId??this.appState?._splitDetailId,n=e=>!!e.actionId,r=e=>e.dataType===`action`||e.dataType===`actionGroup`||e.dataType===`menu`||e.stereotype===`button`,i=[...d.slice(0,6),...d.slice(6).filter(e=>r(e)||e.dataType===`status`)],a=i.filter(e=>e.stereotype===`image`),o=i.find(e=>e.identifier)??i[0],s=i.find(e=>e.id===`select`&&e.dataType===`action`),c=!!s,l=i.filter(e=>e!==o&&!a.includes(e)&&!n(e)&&!r(e)),u=i.filter(e=>r(e)&&!(c&&e===s)),f=(e,t,n)=>{e.stopPropagation(),e.currentTarget.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_clickedRow:n}},bubbles:!0,composed:!0}))},ne=e=>{let t=[];for(let n of u){let r=e[n.id];if(n.dataType===`action`){let i=r?.methodNameInCrud?r:e.action?.methodNameInCrud?e.action:{methodNameInCrud:n.id,label:n.label,icon:null,disabled:!1};t.push(w`
                            <button class="crud-btn" theme="tertiary" title="${i.label||_}"
                                @click="${t=>f(t,`action-on-row-`+i.methodNameInCrud,e)}">
                                ${i.icon?F(i.icon):_}
                                ${i.label??_}
                            </button>`)}else(n.dataType===`actionGroup`||n.dataType===`menu`)&&(r?.actions??[]).forEach(n=>t.push(w`
                            <button class="crud-btn" theme="tertiary" title="${n.label||_}"
                                @click="${t=>f(t,`action-on-row-`+n.methodNameInCrud,e)}">
                                ${n.icon?F(n.icon):_}
                                ${n.label??_}
                            </button>`))}return t.length?w`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${t}
                    </div>`:_};return w`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${p.length===0?w`<div style="grid-column: 1 / -1;">${St(ee)}</div>`:_}
                    ${p.map(n=>w`
                        <div role="button" tabindex="0" class="crud-card"
                            ?data-selected="${e&&t!==void 0&&String(n[e])===String(t)}"
                            style="cursor: pointer;"
                            @click="${e=>c?f(e,`action-on-row-select`,n):re(e.target,`view`,n)}" @keydown="${L(e=>c?f(e,`action-on-row-select`,n):re(e.target,`view`,n))}"
                        >
                            ${a.length?w`<img src="${n[a[0].id]??``}" alt="" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: var(--lumo-border-radius-m, 8px);" />`:_}
                            ${o?w`<div class="crud-card-title">${n[o.id]??``}</div>`:_}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${l.map(e=>w`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${e.label}</span>
                                        <span>${te(e,n)}</span>
                                    </div>
                                `)}
                            </div>
                            ${ne(n)}
                        </div>
                    `)}
                </div>`},h=()=>{let e=ya(d),t=e.find(e=>e.identifier)??e[0],n=e.filter(e=>e!==t);return w`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <div class="m-listbox" style="width: 100%;">
                            ${p.length===0?w`<div class="m-item" disabled>${St(ee)}</div>`:_}
                            ${p.map(e=>w`
                                <div role="button" tabindex="0" class="m-item"
                                    ?selected="${this.selectedItem===e}"
                                    @click="${()=>{this.selectedItem=e}}" @keydown="${L(()=>{this.selectedItem=e})}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${t?e[t.id]??``:``}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${n.map(t=>w`${te(t,e)} `)}
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?w`
                            <div class="m-formlayout">
                                ${d.map(e=>w`
                                    <label style="display: flex; flex-direction: column; gap: .1rem; font-size: var(--lumo-font-size-s, .875rem);">
                                        <span style="color: var(--lumo-secondary-text-color, #667);">${e.label}</span>
                                        <span>${String(this.selectedItem[e.id]??``)}</span>
                                    </label>
                                `)}
                            </div>
                        `:w`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},g=()=>{let e=this.identifierFieldName,t=this.state._selectedId??this.appState?._splitDetailId,n=d[0],r=d.slice(1),i=!!n?.actionId,a=e=>(e??[]).map(e=>{let t=Array.isArray(e.children)?e.children:[];return t.length>0?{...e,children:a(t)}:{...e,children:void 0}}),o=a(p),s=(t,n,r)=>{t.stopPropagation(),e&&n[e]!==void 0&&(this.state={...this.state,_selectedId:String(n[e])}),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:r,parameters:n},bubbles:!0,composed:!0}))},c=(a,o)=>w`
                <tr class="${e&&t!==void 0&&String(a[e])===String(t)?`selected`:``}"
                    style="cursor: pointer;" @click="${e=>s(e,a,`view`)}">
                    ${n?w`<td style="padding-left: ${o*1.2+.6}rem;">${a[n.id]??``}</td>`:_}
                    ${r.map(e=>e.id===`select`?w`<td><button class="crud-btn small" @click="${e=>{e.stopPropagation(),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`action-on-row-select`,parameters:{_clickedRow:a}},bubbles:!0,composed:!0}))}}">Select</button></td>`:w`<td>${a[e.id]??``}</td>`)}
                    ${i?w`<td style="text-align: end;">${a?.viewable===!1?_:w`<button class="crud-btn small" @click="${e=>s(e,a,`view`)}">View</button>`}</td>`:_}
                </tr>
                ${(a.children??[]).map(e=>c(e,o+1))}
            `;return w`
                <table class="crud-table">
                    <thead><tr>
                        ${n?w`<th>${n.label??_}</th>`:_}
                        ${r.map(e=>w`<th>${e.label??_}</th>`)}
                        ${i?w`<th></th>`:_}
                    </tr></thead>
                    <tbody>
                        ${o.length===0?w`<tr><td colspan="99" style="padding: 1.5rem; text-align: center; color: var(--lumo-secondary-text-color, #888);">${St(ee)}</td></tr>`:_}
                        ${o.map(e=>c(e,0))}
                    </tbody>
                </table>`},ie=N.get()?.rendersCrudLayouts?.()===!0,v=w`
            ${i.infiniteScrolling?w`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:_}
            ${!ie&&u===`list`?ne():!ie&&u===`cards`?i.contentHeight?w`
                <div class="m-scroll" style="width: 100%; height: ${i.contentHeight};">
                    ${m()}
                </div>
            `:m():!ie&&u===`masterDetail`?h():!ie&&u===`tree`?(()=>{let e=N.get();return e?.renderTreeComponent?e.renderTreeComponent(this,{rows:p,columns:d.map(e=>({id:e.id,label:e.label})),idField:this.identifierFieldName,navigable:!!d[0]?.actionId,selectedId:this.state._selectedId??this.appState?._splitDetailId}):g()})():N.get()?.renderTableComponent(this,r,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,y=i.infiniteScrolling?_:N.get()?.renderPagination(this,this.component),b=this.showImportDialog?w`
            <div role="button" tabindex="0" class="crud-modal-backdrop" @click="${e=>{e.target===e.currentTarget&&(this.showImportDialog=!1)}}" @keydown="${L(e=>{e.target===e.currentTarget&&(this.showImportDialog=!1)})}">
                <div class="crud-modal">
                    <h3 style="margin: 0 0 .75rem;">Import</h3>
                    <input type="file" @change="${e=>{let t=e.target.files?.[0];if(t){let e=new FormData;e.append(`file`,t),fetch(`/upload`,{method:`POST`,body:e}).then(e=>e.json()).then(e=>this.handleImportUploadSuccess({detail:e})).catch(()=>this.notify(`Import failed`))}}}">
                    <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                        <button class="crud-btn" @click="${()=>{this.showImportDialog=!1}}">Cancel</button>
                    </div>
                </div>
            </div>
        `:_;return this.standalone?w`
                ${b}
                <div style="border: var(--mateu-section-border, none); background: var(--mateu-section-bg, transparent); overflow: hidden; max-height: calc(100dvh - 12rem); width: 100%; box-sizing: border-box; padding: var(--mateu-section-padding, 0); display: flex; flex-direction: column;">
                    <div style="flex-shrink: 0;">
                        <mateu-content-header
                            .metadata="${i}"
                            .baseUrl="${this.baseUrl}"
                            .state="${this.state}"
                            .data="${this.data}"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                        ></mateu-content-header>
                    </div>
                    <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                        <div style="flex: 1; min-width: 0;">${N.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                        ${this.renderColumnChooser()}
                    </div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${v}</div>
                    <div style="flex-shrink: 0;">${y}</div>
                </div>
            `:w`
            ${b}
            ${l?w`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem);">
                        <div style="flex: 1; min-width: 0;">
                            ${i?.title?w`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(i.title)}</h2>
                            `:_}
                            ${i?.subtitle?w`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(i.subtitle)}</span>
                            `:_}
                        </div>
                        ${o.map(e=>n(e))}
                        ${c?w`<span class="toolbar-divider"></span>`:_}
                        ${s.map(e=>n(e))}
                        <slot></slot>
                    </div>
                `:_}
            <div style="border: var(--mateu-section-border, none); background: var(--mateu-section-bg, transparent); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--mateu-section-padding, 0); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                    <div style="flex: 1; min-width: 0;">${N.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                    ${this.renderColumnChooser()}
                </div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${v}</div>
                <div style="flex-shrink: 0;">${y}</div>
            </div>
        `}createRenderRoot(){return N.mustUseShadowRoot()?super.createRenderRoot():this}static{this.styles=m`
        ${fe}
        /* DS-neutral crud widgets (replace vaadin-button/card/grid/list-box/form-layout/dialog). */
        .crud-btn {
            font: inherit; font-weight: 500;
            padding: .4rem .9rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2));
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a); cursor: pointer;
        }
        .crud-btn:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
        .crud-btn.small, .crud-btn[theme~="small"] { padding: .2rem .55rem; font-size: var(--lumo-font-size-s, .875rem); }
        .crud-btn[theme~="tertiary"] { border-color: transparent; background: transparent; color: var(--lumo-primary-text-color, #1676f3); }
        .crud-btn[theme~="primary"] { border-color: transparent; background: var(--lumo-primary-color, #1676f3); color: var(--lumo-primary-contrast-color, #fff); }

        .m-listbox { display: flex; flex-direction: column; }
        .m-item { padding: .5rem 0; border-radius: var(--lumo-border-radius-m, 6px); }
        .m-item[selected], .m-item[data-selected] { background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12)); }
        .m-formlayout { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr)); gap: var(--lumo-space-m, 1rem); }

        .crud-card {
            display: flex; flex-direction: column;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            padding: .8rem 1rem; background: var(--lumo-base-color, #fff);
            transition: box-shadow .15s, transform .15s;
        }
        .crud-card:hover { box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.12)); }
        .crud-card[data-selected] { border-color: var(--lumo-primary-color, #1676f3); }
        .crud-card-title { font-weight: 600; }

        .crud-table { border-collapse: collapse; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .crud-table th { text-align: left; padding: .45rem .6rem; border-bottom: 2px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2)); font-weight: 600; color: var(--lumo-secondary-text-color, #556); white-space: nowrap; }
        .crud-table td { padding: .4rem .6rem; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); }
        .crud-table tbody tr:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
        .crud-table tr.selected { background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12)); }

        .crud-modal-backdrop { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.35); padding: 1rem; }
        .crud-modal { background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a); border-radius: var(--lumo-border-radius-l, 12px); box-shadow: var(--lumo-box-shadow-xl, 0 12px 40px rgba(0,0,0,.3)); padding: 1.2rem; max-width: min(90vw, 28rem); }
        vaadin-card[clickable] {
            transition: box-shadow 0.15s, transform 0.15s;
        }
        vaadin-card[clickable]:hover {
            box-shadow: var(--lumo-box-shadow-m);
            transform: translateY(-2px);
        }
        vaadin-card[clickable]:active {
            box-shadow: none;
            transform: translateY(0);
        }
        vaadin-card[data-selected] {
            outline: 2px solid var(--lumo-primary-color);
            outline-offset: -2px;
        }
    
        ${R}
    `}};O([v()],W.prototype,`component`,void 0),O([v()],W.prototype,`baseUrl`,void 0),O([v({type:Boolean})],W.prototype,`standalone`,void 0),O([v()],W.prototype,`state`,void 0),O([v()],W.prototype,`data`,void 0),O([v()],W.prototype,`appState`,void 0),O([v()],W.prototype,`appData`,void 0),O([S()],W.prototype,`showImportDialog`,void 0),O([S()],W.prototype,`availableWidthPx`,void 0),O([S()],W.prototype,`selectedItem`,void 0),O([S()],W.prototype,`_columnPrefsRevision`,void 0),W=O([h(`mateu-table-crud`)],W);var xa=function(e){return e.OnLoad=`OnLoad`,e.OnSuccess=`OnSuccess`,e.OnError=`OnError`,e.OnValueChange=`OnValueChange`,e.OnCustomEvent=`OnCustomEvent`,e.AutoSave=`AutoSave`,e}({}),Sa=class extends et{constructor(...e){super(...e),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{let e=this.component;this.registerCustomEventListeners(),e.triggers?.filter(e=>e.type==xa.OnLoad).forEach(e=>{if((!e.condition||this._evalExpr(e.condition))&&!e.triggered){let n=e;n.triggered=!0;var t=n.times-1;n.timeoutMillis>0?this.scheduleOnload(n,t,this.id):this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(e,t,n)=>{if(n!=this.component?.id)return;let r=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,callbackToken:r},bubbles:!0,composed:!0}))},e.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=e=>{if(!(e instanceof CustomEvent))return;let t=e,n=(this.component.triggers??[]).filter(e=>e.type==xa.OnCustomEvent).filter(e=>e.eventName==t.type).filter(e=>e.source!==`COMPONENT`||t.detail?.__source===e.from);n.length!==0&&(n.some(e=>!e.source||e.source===`SELF`)&&(e.stopPropagation(),e.preventDefault()),n.forEach(e=>{(!e.condition||this._evalExpr(e.condition))&&this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:t.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(e){return ot(e,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(e){return st(e,this.state??{},this.data??{},this._interpolationExtra())}isOverlayChild(e){let t=e?.metadata?.type;return t==A.Drawer||t==A.Dialog}removeSelfFromOwnerChildren(){let e=this.component;if(!e)return!1;let t=t=>{if(t===e)return!0;let n=t;return e.id!=null&&n?.id==e.id&&this.isOverlayChild(n)},n=this.parentNode;for(;n;){let e=n instanceof ShadowRoot?n.host:n,r=e.component?.children;if(Array.isArray(r)){let n=r.findIndex(t);if(n>=0)return r.splice(n,1),e.requestUpdate?.(),!0}n=n instanceof ShadowRoot?e:n.parentNode}return!1}applyFragment(e){if(this.id==e.targetComponentId){if(e.component)if(Ke.Add==e.action){if(this.component){let t=this.component.children??(this.component.children=[]),n=e.component.id?t.findIndex(t=>t.id==e.component.id&&this.isOverlayChild(t)):-1;n>=0?(t[n]=e.component,this.component={...this.component}):t.push(e.component)}}else{this.callbackToken=T();let t=!1;if(e.component?.type==k.ServerSide)if(this.component){let n=this.component,r=e.component;t=n.serverSideType==r.serverSideType;let i=t?(n.children??[]).filter(e=>this.isOverlayChild(e)):[];n.actions=r.actions,n.type=r.type,n.rules=r.rules,n.triggers=r.triggers,n.serverSideType=r.serverSideType,n.route=r.route,n.initialData=r.initialData,n.validations=r.validations,n.cssClasses=r.cssClasses,n.slot=r.slot,n.style=r.style,n.children=i.length?[...r.children??[],...i]:r.children,(n.serverSideType!=r.serverSideType||n.id!=r.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=e.component,setTimeout(()=>this.triggerOnLoad());else{let t=[e.component];this.component&&(this.component.children=t)}e.action!==Ke.ReplaceKeepData&&!t&&(this.state={},this.data={})}if(e.state&&(this.state={...this.state,...e.state}),e.data){for(let t in e.data){let n=e.data[t]?.page;n?.pageNumber>0&&this.data[t]&&this.data[t].page.content&&(n.content?n.content=[...this.data[t].page.content,...n.content]:n.content=[...this.data[t].page.content])}this.data={...this.data,...e.data}}this.registerCustomEventListeners();let t=N.getAfterRenderHook();t&&setTimeout(()=>t(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:e,name:t})=>e.removeEventListener(t,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(e=>e.type==xa.OnCustomEvent).forEach(e=>{let t=e.source===`DOCUMENT`||e.source===`COMPONENT`?document:this;t.addEventListener(e.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:t,name:e.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:e,name:t})=>e.removeEventListener(t,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}};O([v()],Sa.prototype,`state`,void 0),O([v()],Sa.prototype,`data`,void 0),O([v()],Sa.prototype,`appData`,void 0),O([v()],Sa.prototype,`appState`,void 0);var Ca=`mateu-recent-routes`,wa=8;function Ta(){try{return JSON.parse(localStorage.getItem(Ca)??`{}`)}catch{return{}}}function Ea(e){try{localStorage.setItem(Ca,JSON.stringify(e))}catch{}}function Da(e){return Ta()[e||`_`]??[]}function Oa(e,t){if(!t?.route||!t.label)return;let n=e||`_`,r=Ta(),i=(r[n]??[]).filter(e=>e.route!==t.route);i.unshift({route:t.route,label:t.label}),r[n]=i.slice(0,wa),Ea(r)}var G=class extends y{constructor(...e){super(...e),this.baseUrl=``,this.open=!1,this.queryText=``,this.dataHits=[],this.loading=!1,this.selectedIndex=0,this.fabOffset=0,this.keydownHandler=null}connectedCallback(){super.connectedCallback(),this.keydownHandler=e=>{(e.metaKey||e.ctrlKey)&&(e.key===`k`||e.key===`K`)?(e.preventDefault(),this.toggle()):e.key===`Escape`&&this.open&&this.close()},document.addEventListener(`keydown`,this.keydownHandler),this.setupFabObserver()}disconnectedCallback(){super.disconnectedCallback(),this.keydownHandler&&document.removeEventListener(`keydown`,this.keydownHandler),clearTimeout(this.searchTimer),this.fabObserver?.disconnect(),this.fabObserver=void 0}setupFabObserver(){let e=this.getRootNode(),t=e instanceof ShadowRoot?e:document.body;this.measureFabStack(),this.fabObserver?.disconnect(),this.fabObserver=new MutationObserver(()=>this.measureFabStack()),this.fabObserver.observe(t,{childList:!0,subtree:!0})}measureFabStack(){let e=(this.getRootNode().querySelectorAll?.(`.ai-fab, .app-fab, .page-fab`).length??0)*4;e!==this.fabOffset&&(this.fabOffset=e)}updated(e){e.has(`open`)&&this.open&&requestAnimationFrame(()=>this.inputEl?.focus())}toggle(){this.open?this.close():this.openCenter()}openCenter(){this.open=!0,this.queryText=``,this.dataHits=[],this.selectedIndex=0}close(){this.open=!1,this.queryText=``,this.dataHits=[],clearTimeout(this.searchTimer)}flattenMenu(e,t){let n=[];for(let r of e??[])if(!r.separator)if(r.submenus&&r.submenus.length>0){let e=t?`${t} › ${r.label}`:r.label;n.push(...this.flattenMenu(r.submenus,e))}else r.route!==void 0&&r.route!==null&&n.push({label:r.label,breadcrumb:t,route:r.route});return n}onInput(e){this.queryText=e,this.selectedIndex=0;let t=e.trim();if(clearTimeout(this.searchTimer),!t||!this.app?.globalSearchEnabled){this.dataHits=[],this.loading=!1;return}this.loading=!0,this.searchTimer=setTimeout(()=>this.fetchGlobalSearch(t),250)}async fetchGlobalSearch(e){let t=this.app;if(!t?.globalSearchEnabled){this.loading=!1;return}try{let n=(await Ge.runAction(this.baseUrl??``,t.rootRoute??``,``,`_globalsearch`,`command-center`,void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(e=>e.data).find(e=>e&&e._globalsearch);this.dataHits=n?._globalsearch??[]}catch{this.dataHits=[]}finally{this.loading=!1}}navigateTo(e,t){Oa(this.app?.serverSideType??``,{route:e,label:t}),this.close();for(let t of[`route-changed`,`navigate-to-requested`])this.dispatchEvent(new CustomEvent(t,{detail:{route:e},bubbles:!0,composed:!0}))}askAi(){let e=this.queryText.trim();this.close(),this.dispatchEvent(new CustomEvent(`mateu-open-ai`,{detail:{query:e},bubbles:!0,composed:!0}))}visibleTargets(e){if(!this.queryText.trim()){let e=this.flattenMenu(this.app?.menu,``).map(e=>({route:e.route,label:e.label})),t=Da(this.app?.serverSideType??``);return[...e,...t]}return[...e.map(e=>({route:e.route,label:e.label})),...this.dataHits.map(e=>({route:e.route,label:e.label}))]}onKeydown(e,t){if(e.key===`ArrowDown`)e.preventDefault(),this.selectedIndex=Math.min(this.selectedIndex+1,t.length-1);else if(e.key===`ArrowUp`)e.preventDefault(),this.selectedIndex=Math.max(this.selectedIndex-1,0);else if(e.key===`Enter`){let e=t[this.selectedIndex];e&&this.navigateTo(e.route,e.label)}}render(){return w`
            <button class="cc-fab" style="bottom: ${1.5+this.fabOffset}rem;"
                @click=${()=>this.openCenter()} title="Buscar y navegar (⌘K)" aria-label="Command center">
                ${this.fabIcon()}
            </button>
            ${this.open?this.renderOverlay():_}
        `}fabIcon(){return w`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>`}renderOverlay(){let e=this.queryText.trim().toLowerCase(),t=e?this.flattenMenu(this.app?.menu,``).filter(t=>t.label.toLowerCase().includes(e)||t.breadcrumb.toLowerCase().includes(e)):[],n=this.visibleTargets(t);return w`
            <div class="cc-backdrop" @click=${()=>this.close()}>
                <div class="cc-panel" @click=${e=>e.stopPropagation()}>
                    <div class="cc-bar">
                        <button class="cc-icon-btn" @click=${()=>this.queryText?this.onInput(``):this.close()} title="${this.queryText?`Borrar`:`Cerrar`}">
                            ${this.queryText?this.backIcon():this.searchGlyph()}
                        </button>
                        <input class="cc-input" .value=${this.queryText} placeholder="Buscar pantallas, datos y acciones…"
                            @input=${e=>this.onInput(e.target.value)}
                            @keydown=${e=>this.onKeydown(e,n)}>
                        ${this.queryText?w`<button class="cc-icon-btn" @click=${()=>this.onInput(``)} title="Limpiar">${this.clearIcon()}</button>`:_}
                    </div>
                    <div class="cc-body">
                        ${e?this.renderResults(t):this.renderDefault()}
                    </div>
                </div>
                <button class="cc-close" @click=${()=>this.close()} title="Cerrar">${this.clearIcon()}</button>
            </div>
        `}renderDefault(){let e=this.flattenMenu(this.app?.menu,``),t=Da(this.app?.serverSideType??``),n=-1;return w`
            <div class="cc-columns">
                <div class="cc-col">
                    <div class="cc-section-title">Ir a</div>
                    <div class="cc-tiles">
                        ${e.map(e=>{n++;let t=n;return w`
                            <button class="cc-tile ${t===this.selectedIndex?`cc-sel`:``}"
                                @click=${()=>this.navigateTo(e.route,e.label)}
                                @mouseenter=${()=>{this.selectedIndex=t}}>
                                <span class="cc-tile-label">${e.label}</span>
                                ${e.breadcrumb?w`<span class="cc-sub">${e.breadcrumb}</span>`:_}
                            </button>`})}
                        ${e.length===0?w`<div class="cc-empty">Sin opciones de menú.</div>`:_}
                    </div>
                </div>
                ${t.length>0?w`
                    <div class="cc-col cc-col--recent">
                        <div class="cc-section-title">Recientes</div>
                        ${t.map(e=>{n++;let t=n;return w`
                            <button class="cc-row ${t===this.selectedIndex?`cc-sel`:``}"
                                @click=${()=>this.navigateTo(e.route,e.label)}
                                @mouseenter=${()=>{this.selectedIndex=t}}>
                                <span class="cc-tile-label">${e.label}</span>
                            </button>`})}
                    </div>`:_}
            </div>
        `}renderResults(e){if(this.loading&&this.dataHits.length===0&&e.length===0)return w`<div class="cc-list">${[0,1,2,3].map(()=>w`<div class="cc-skeleton"></div>`)}</div>`;let t=e.length===0&&this.dataHits.length===0;return w`
            <div class="cc-list">
                ${this.app?.sseUrl?w`
                    <button class="cc-row cc-ask-ai" @click=${()=>this.askAi()}>
                        ${this.aiIcon()}<span class="cc-tile-label">Preguntar a la IA: “${this.queryText.trim()}”</span>
                    </button>`:_}
                ${e.length>0?w`<div class="cc-section-title">Pantallas</div>`:_}
                ${e.map((e,t)=>w`
                    <button class="cc-row ${t===this.selectedIndex?`cc-sel`:``}"
                        @click=${()=>this.navigateTo(e.route,e.label)}
                        @mouseenter=${()=>{this.selectedIndex=t}}>
                        <span class="cc-tile-label">${e.label}</span>
                        ${e.breadcrumb?w`<span class="cc-sub">${e.breadcrumb}</span>`:_}
                    </button>`)}
                ${this.renderDataHits(e.length)}
                ${t?w`<div class="cc-empty">No encontramos coincidencias para “${this.queryText.trim()}”.</div>`:_}
            </div>
        `}renderDataHits(e){if(this.dataHits.length===0)return _;let t;return w`${this.dataHits.map((n,r)=>{let i=e+r,a=n.category&&n.category!==t;return t=n.category,w`
                ${a?w`<div class="cc-section-title">${n.category}</div>`:_}
                <button class="cc-row ${i===this.selectedIndex?`cc-sel`:``}"
                    @click=${()=>this.navigateTo(n.route,n.label)}
                    @mouseenter=${()=>{this.selectedIndex=i}}>
                    <span class="cc-tile-label">${n.label}</span>
                    ${n.description?w`<span class="cc-sub">${n.description}</span>`:_}
                </button>`})}`}searchGlyph(){return w`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`}backIcon(){return w`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`}clearIcon(){return w`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`}aiIcon(){return w`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 4.7L19 8.5l-4.1 2.3L12 15l-1.9-4.2L6 8.5l5.1-1.8z"></path></svg>`}static{this.styles=m`
        :host { --cc-accent: var(--lumo-primary-color, #3b82f6); }

        .cc-fab {
            position: fixed; bottom: 1.5rem; right: 1.5rem;
            width: 3.5rem; height: 3.5rem; border-radius: 50%;
            background: var(--cc-accent); color: #fff; border: none; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 16px rgba(0,0,0,0.25); z-index: 950;
            transition: background 0.2s, transform 0.1s, bottom 0.2s ease;
        }
        .cc-fab:hover { background: var(--lumo-primary-color-50pct, #2563eb); transform: scale(1.08); }

        .cc-backdrop {
            position: fixed; inset: 0; background: rgba(15, 23, 33, 0.72);
            display: flex; flex-direction: column; align-items: center;
            padding: 8vh 1rem 1rem; z-index: 1100; overflow: auto;
        }
        .cc-panel {
            width: min(920px, 96vw);
            display: flex; flex-direction: column; gap: 0;
        }
        .cc-bar {
            display: flex; align-items: center; gap: 0.5rem;
            background: var(--lumo-base-color, #fff);
            border-radius: 999px; padding: 0.35rem 0.75rem;
            box-shadow: 0 12px 40px rgba(0,0,0,0.35);
        }
        .cc-input {
            flex: 1; border: none; outline: none; background: transparent;
            font-size: var(--lumo-font-size-l, 1.125rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            padding: 0.75rem 0.25rem; font-family: var(--lumo-font-family, inherit);
        }
        .cc-icon-btn {
            display: flex; align-items: center; justify-content: center;
            width: 2rem; height: 2rem; border: none; background: transparent;
            color: var(--lumo-secondary-text-color, #667); cursor: pointer; border-radius: 50%;
        }
        .cc-icon-btn:hover { background: var(--lumo-contrast-10pct, rgba(0,0,0,0.06)); }

        .cc-body { margin-top: 1rem; }
        .cc-columns { display: flex; gap: 1.5rem; align-items: flex-start; }
        .cc-col { flex: 1 1 0; min-width: 0; }
        .cc-col--recent { flex: 0 0 min(320px, 40%); }
        @media (max-width: 720px) { .cc-columns { flex-direction: column; } .cc-col--recent { flex: 1 1 auto; width: 100%; } }

        .cc-section-title {
            padding: 0.5rem 0.25rem 0.35rem;
            font-size: var(--lumo-font-size-xs, 0.75rem); text-transform: uppercase;
            letter-spacing: 0.05em; color: rgba(255,255,255,0.55); font-weight: 600;
        }
        .cc-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.5rem; }

        .cc-tile, .cc-row {
            display: flex; flex-direction: column; align-items: flex-start; gap: 0.15rem;
            text-align: left; width: 100%;
            background: rgba(255,255,255,0.06); color: #fff;
            border: 1px solid rgba(255,255,255,0.08); border-radius: var(--lumo-border-radius-m, 0.5rem);
            padding: 0.7rem 0.85rem; cursor: pointer; transition: background 0.12s;
        }
        .cc-row { flex-direction: row; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem; }
        .cc-tile:hover, .cc-row:hover, .cc-sel { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.24); }
        .cc-tile-label { font-size: var(--lumo-font-size-m, 1rem); color: #fff; }
        .cc-sub { font-size: var(--lumo-font-size-xs, 0.75rem); color: rgba(255,255,255,0.6); }
        .cc-ask-ai { background: rgba(59,130,246,0.18); border-color: rgba(59,130,246,0.4); }
        .cc-ask-ai svg { color: var(--cc-accent); flex-shrink: 0; }

        .cc-list { display: flex; flex-direction: column; }
        .cc-empty { padding: 1.5rem; text-align: center; color: rgba(255,255,255,0.6); font-size: var(--lumo-font-size-s, 0.875rem); }

        .cc-skeleton {
            height: 2.75rem; margin-bottom: 0.5rem; border-radius: var(--lumo-border-radius-m, 0.5rem);
            background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.14) 37%, rgba(255,255,255,0.06) 63%);
            background-size: 400% 100%; animation: cc-shimmer 1.2s ease-in-out infinite;
        }
        @keyframes cc-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

        .cc-close {
            position: fixed; bottom: 1.5rem; right: 1.5rem;
            width: 3.5rem; height: 3.5rem; border-radius: 50%;
            background: rgba(0,0,0,0.55); color: #fff; border: 1px solid rgba(255,255,255,0.2);
            display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 1110;
        }
        .cc-close:hover { background: rgba(0,0,0,0.75); }
    `}};O([v({attribute:!1})],G.prototype,`app`,void 0),O([v()],G.prototype,`baseUrl`,void 0),O([S()],G.prototype,`open`,void 0),O([S()],G.prototype,`queryText`,void 0),O([S()],G.prototype,`dataHits`,void 0),O([S()],G.prototype,`loading`,void 0),O([S()],G.prototype,`selectedIndex`,void 0),O([S()],G.prototype,`fabOffset`,void 0),O([b(`.cc-input`)],G.prototype,`inputEl`,void 0),G=O([h(`mateu-command-center`)],G);var ka=null;function Aa(e){let t=e.component?.metadata;t&&(t.commandCenterEnabled||t.chromeless)&&t.variant!==`MEDIATOR`?((!ka||!ka.isConnected)&&(ka=document.createElement(`mateu-command-center`),e.renderRoot.appendChild(ka)),ka.app=t,ka.baseUrl=e.baseUrl??``):ka&&e.renderRoot.contains(ka)&&(ka.remove(),ka=null)}var ja=class extends y{constructor(...e){super(...e),this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1;let t=e.detail??{},n=t.failure??Fe(t.reason,{online:Ve.isOnline()});if(n.kind===`cancelled`)return;let r=t.retry;pa({text:n.message,variant:`error`,duration:r?8e3:5e3,position:`bottomEnd`,...r?{actionLabel:`Retry`,onAction:r}:{}},this)}}connectedCallback(){super.connectedCallback(),this.addEventListener(`backend-called-event`,this.fetchStarted),this.addEventListener(`backend-succeeded-event`,this.fetchFinished),this.addEventListener(`backend-cancelled-event`,this.fetchFinished),this.addEventListener(`backend-failed-event`,this.fetchFailed)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`backend-called-event`,this.fetchStarted),this.removeEventListener(`backend-succeeded-event`,this.fetchFinished),this.removeEventListener(`backend-cancelled-event`,this.fetchFinished),this.removeEventListener(`backend-failed-event`,this.fetchFailed)}render(){return w`<div class="loader-container">
            <div style="display: flex; flex-direction: column;">
                <slot></slot>
                <div class="loader-frame ${this.loading?`delayed-show`:``}" style="${this.loading?`pointer-events: all;`:`display: none;`}"><div class="loader"></div></div>
            </div>
        </div>`}static{this.styles=m`
        :host {
        }

        .loader-container {
            position: relative; /* clave */
        }

        .loader-frame {
            position: absolute; /* se posiciona sobre el contenedor */
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;

            display: flex;
            align-items: center;
            justify-content: center;

            /* Theme-aware scrim: a hardcoded white flashed the page in dark mode. */
            background: var(--lumo-base-color, #fff);
            opacity: 0;
        }

        /*
         * Held invisible for 600ms, then faded in. Below that threshold the request usually
         * finishes first and the user sees nothing at all — which is the correct outcome for a
         * wait too short to be worth a spinner. Note the frame is mounted (and therefore blocking
         * pointer events) from the first millisecond: the delay is about what is SHOWN, not about
         * when the page stops accepting a second click.
         */
        .delayed-show {
            animation: showLoader .25s ease .6s forwards;
        }

        @keyframes showLoader {
            from {
                opacity: 0;
            }
            to {
                opacity: .6;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .loader { animation: none; }
        }

        /* HTML: <div class="loader"></div> */
        .loader {
            width: 1rem;
            --b: 1px;
            aspect-ratio: 1;
            border-radius: 50%;
            background: var(--lumo-primary-color, #514b82);
            -webkit-mask:
                    repeating-conic-gradient(#0000 0deg,#000 1deg 70deg,#0000 71deg 90deg),
                    radial-gradient(farthest-side,#0000 calc(100% - var(--b) - 1px),#000 calc(100% - var(--b)));
            -webkit-mask-composite: destination-in;
            mask-composite: intersect;
            animation: l5 1s infinite;
        }
        @keyframes l5 {to{transform: rotate(.5turn)}}
  `}};O([S()],ja.prototype,`loading`,void 0),ja=O([h(`mateu-api-caller`)],ja);var Ma=new class{constructor(){this._dirty=!1,this._installed=!1,this.message=`You have unsaved changes. Are you sure you want to leave this page?`,this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=e=>{this._dirty&&(e.preventDefault(),e.returnValue=``)}}install(){this._installed||(this._installed=!0,document.addEventListener(`dirty`,this._onDirty),document.addEventListener(`clean`,this._onClean),window.addEventListener(`beforeunload`,this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;let e=window.confirm(this.message);return e&&(this._dirty=!1),e}},Na,K=class extends Sa{static{Na=this}constructor(...e){super(...e),this.filter=``,this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery=``,this.commandPaletteSelectedIndex=0,this.commandPaletteDataHits=[],this.openDataHit=e=>{Ma.confirmLeave()&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=``,this.commandPaletteDataHits=[],this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:e.route},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`navigate-to-requested`,{detail:{route:e.route},bubbles:!0,composed:!0})))},this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this._openAiHandler=()=>{this.chatOpen||this.showHideIa()},this.isDark=document.documentElement.getAttribute(`theme`)===`dark`,this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;let e=this.isDark?`dark`:`light`;document.documentElement.setAttribute(`theme`,e),localStorage.setItem(`mateu-theme`,e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?`detail`:`detail-hidden`)},this.runAction=e=>{let t=this.renderRoot.querySelector?.(`mateu-component`);t&&t.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){let n=e[t];if(this.selectedRoute?this.isActiveOption(n):n.selected)return n;let r=this.getSelectedOption(n.submenus);if(r)return r}return null},this.itemSelected=e=>{let t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{let t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(e=>({text:e.label,consumedRoute:e.consumedRoute,route:e.route,baseUrl:e.baseUrl,serverSideType:e.serverSideType,uriPrefix:e.uriPrefix,actionId:e.actionId,selected:e.selected,_menuOption:e})),this.flattenMenuForPalette=(e,t)=>{let n=[];for(let r of e)if(!r.separator)if(r.submenus&&r.submenus.length>0){let e=t?`${t} › ${r.label}`:r.label;n.push(...this.flattenMenuForPalette(r.submenus,e))}else n.push({label:r.label,breadcrumb:t,consumedRoute:r.consumedRoute,route:r.route,actionId:r.actionId,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix});return n},this.handleCommandPaletteKeydown=(e,t)=>{let n=Math.min(t.length,10),r=n+Math.min(this.commandPaletteDataHits.length,8);if(e.key===`ArrowDown`)e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,r-1);else if(e.key===`ArrowUp`)e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key===`Enter`){if(this.commandPaletteSelectedIndex>=n){let e=this.commandPaletteDataHits[this.commandPaletteSelectedIndex-n];e&&this.openDataHit(e);return}let e=t[this.commandPaletteSelectedIndex];e&&(this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=``)}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return _;let e=this.component?.metadata;if(e?.commandCenterEnabled||!e?.menu)return _;let t=this.flattenMenuForPalette(e.menu,``),n=this.commandPaletteQuery.toLowerCase(),r=n?t.filter(e=>e.label.toLowerCase().includes(n)||e.breadcrumb.toLowerCase().includes(n)):t;return w`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=``}}>
                <div class="cmd-palette" @click=${e=>e.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        ${F(`vaadin:search`,void 0,`cmd-search-icon`)}
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${e=>{this.commandPaletteQuery=e.target.value,this.commandPaletteSelectedIndex=0,this.fetchGlobalSearch(this.commandPaletteQuery)}}
                            @keydown=${e=>this.handleCommandPaletteKeydown(e,r)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${r.slice(0,10).map((e,t)=>w`
                            <div class="cmd-result ${t===this.commandPaletteSelectedIndex?`cmd-result--selected`:``}"
                                @click=${()=>{this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=``}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=t}}
                            >
                                <span class="cmd-result-label">${e.label}</span>
                                ${e.breadcrumb?w`<span class="cmd-result-breadcrumb">${e.breadcrumb}</span>`:_}
                            </div>
                        `)}
                        ${n&&this.commandPaletteDataHits.length>0?w`
                            ${this.commandPaletteDataHits.slice(0,8).map((e,t)=>{let n=Math.min(r.length,10)+t,i=this.commandPaletteDataHits[t-1];return w`
                                    ${e.category&&e.category!==i?.category?w`
                                        <div class="cmd-category">${e.category}</div>`:_}
                                    <div class="cmd-result ${n===this.commandPaletteSelectedIndex?`cmd-result--selected`:``}"
                                         @click=${()=>this.openDataHit(e)}
                                         @mouseenter=${()=>{this.commandPaletteSelectedIndex=n}}
                                    >
                                        <span class="cmd-result-label">${e.label}</span>
                                        ${e.description?w`<span class="cmd-result-breadcrumb">${e.description}</span>`:_}
                                    </div>`})}`:_}
                        ${r.length===0&&this.commandPaletteDataHits.length===0?w`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:_}
                    </div>
                </div>
            </div>
        `},this.renderRail=e=>w`
            <div class="nav-rail">
                ${e.map(e=>this.renderRailItem(e))}
            </div>
        `,this.renderRailItem=e=>w`
            <div class="rail-item ${(e.submenus?.length>0?this.railOpenOption?.label===e.label:e.selected)?`rail-item--active`:``}"
                @click=${()=>{e.submenus&&e.submenus.length>0?this.railOpenOption=this.railOpenOption?.label===e.label?null:e:(this.railOpenOption=null,this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix))}}
            >
                ${e.icon?F(e.icon,void 0,`rail-icon`):w`<div class="rail-icon-placeholder">${e.label.charAt(0).toUpperCase()}</div>`}
                <span class="rail-label">${e.label}</span>
            </div>
        `,this.renderRailSubPanel=e=>w`
            <div class="rail-sub-panel">
                <div class="rail-sub-title">${e.label}</div>
                ${e.submenus.map(e=>w`
                    <div class="rail-sub-item ${e.selected?`rail-sub-item--active`:``}"
                        @click=${()=>{e.submenus&&e.submenus.length>0?this.railOpenOption=e:this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}}
                    >${e.label}</div>
                `)}
            </div>
        `,this.renderTilesHub=e=>w`
            <div style="padding: 2rem;">
                <h2 style="margin-top: 0; margin-bottom: 1.5rem;">${e.label}</h2>
                <div class="tiles-hub-grid">
                    ${e.submenus.map(e=>w`
                        <div class="nav-tile"
                            @click=${()=>{e.submenus&&e.submenus.length>0?this.tilesMenuOption=e:(this.tilesMenuOption=null,this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix))}}
                        >
                            ${e.icon?F(e.icon,`font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;`):_}
                            <div class="nav-tile-title">${e.label}</div>
                            ${e.description?w`<div class="nav-tile-desc">${e.description}</div>`:_}
                        </div>
                    `)}
                </div>
            </div>
        `,this.goHome=()=>{Ma.confirmLeave()&&(window.history.pushState(null,``,`/`),window.dispatchEvent(new PopStateEvent(`popstate`,{state:null})))},this.selectRoute=(e,t,n,r,i,a)=>{Ma.confirmLeave()&&this._selectRoute(e,t,n,r,i,a)},this._selectRoute=(e,t,n,r,i,a)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=r,this.selectedRoute=t,this.selectedServerSideType=i,this.selectedUriPrefix=a,this.instant=T(),this.state&&this.state._route!=null&&(this.state._route=void 0);let n=this.baseUrl??``;n.indexOf(`://`)<0&&(n.startsWith(`/`)||(n=`/`+n),n=window.location.origin+n),n.endsWith(`/`)&&(t??``).startsWith(`/`)&&(t=(t??``).substring(1));let o=new URL(n+t);if(e&&o.pathname.startsWith(e)){let t=o.pathname.substring(e.length);o=new URL(o.origin+(t||`/`))}if((window.location.pathname||o.pathname)&&window.location.pathname!=o.pathname){let e=o.pathname;o.search&&(e+=o.search),e&&!e.startsWith(`/`)&&(e=`/`+e),this.baseUrl&&e.startsWith(this.baseUrl)&&(e=e.substring(this.baseUrl.length));let t=e;this.selectedUriPrefix&&(t=t.startsWith(`/`)&&this.selectedUriPrefix.endsWith(`/`)?this.selectedUriPrefix+t.substring(1):!t.startsWith(`/`)&&!this.selectedUriPrefix.endsWith(`/`)?this.selectedUriPrefix+`/`+t:this.selectedUriPrefix+t),t==`/_page`&&(t=``),this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:t},bubbles:!0,composed:!0}))}}},this.isActiveOption=e=>this.selectedRoute?!!e.route&&(this.selectedRoute==e.route||this.selectedRoute.startsWith(e.route+`/`)):!!e.selected,this.mapItems=(e,t)=>e.map(e=>{if(e.submenus&&e.submenus.length>0){let n=this.mapItems(e.submenus,t);return t&&e.label.toLowerCase().includes(t)&&(n=this.mapItems(e.submenus,``)),n&&n.length>0?{consumedRoute:e.consumedRoute,text:e.label,route:e.route,baseUrl:e.baseUrl,serverSideType:e.serverSideType,uriPrefix:e.uriPrefix,actionId:e.actionId,selected:t||this.isActiveOption(e),children:n}:void 0}if(e.separator)return t?void 0:{component:`hr`};if(!t||e.label.toLowerCase().includes(t))return{consumedRoute:e.consumedRoute,text:e.label,route:e.route,baseUrl:e.baseUrl,serverSideType:e.serverSideType,uriPrefix:e.uriPrefix,actionId:e.actionId,selected:t||this.isActiveOption(e)}}).filter(e=>e!=null),this.getSelectedIndex=e=>{if(!e)return NaN;let t=e=>{let t=(e??``).trim();return t.length>1&&t.endsWith(`/`)&&(t=t.slice(0,-1)),t},n=t(this.selectedRoute??window.location.pathname),r=NaN,i=-1;for(let a=0;a<e.length;a++){let o=t(e[a].route);o!==``&&(n===o||n.startsWith(o+`/`))&&o.length>i&&(i=o.length,r=a)}if(!Number.isNaN(r))return r;let a=this.getSelectedOption(e);return a?e.indexOf(a):NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?w`
                <details open class="left-menu-group">
                    <summary>${e.label}</summary>
                    <div class="left-menu-children">
                        ${e.submenus.map(e=>w`${this.renderOptionOnLeftMenu(e)}`)}
                    </div>
                </details>
`:w`<button class="left-menu-item"
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){let e=this.shadowRoot?.querySelector(`mateu-ux`);e&&e.setAttribute(`instant`,T())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?w`
            ${e.map(e=>{let t=e;return w`

                        ${t.component==`hr`?w`<hr/>`:w`
                                <div class="side-nav-item ${t.selected?`side-nav-item--active`:``}">
                                    <button class="side-nav-link"
                                            @click="${()=>{t.route&&!t.children&&this.selectRoute(void 0,t.route,void 0,this.baseUrl,void 0,void 0)}}">
                                        ${t.icon?F(`vaadin:dashboard`,`margin-right:.5rem;`):_}${t.text}
                                    </button>
                                    ${t.children?w`<div class="side-nav-children">${this.renderSideNav(t.children,`children`)}</div>`:_}
                                </div>
                        `}

                            `})}`:_,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return N.mustUseShadowRoot()?super.createRenderRoot():(Na.injectLightDomStyles(),this)}static{this.lightDomStylesInjected=!1}static injectLightDomStyles(){if(Na.lightDomStylesInjected||typeof document>`u`||(Na.lightDomStylesInjected=!0,document.getElementById(`mateu-app-light-styles`)))return;let e=Na.styles,t=Array.isArray(e)?e.map(e=>e?.cssText??``).join(`
`):e?.cssText??``;if(!t)return;let n=document.createElement(`style`);n.id=`mateu-app-light-styles`,n.textContent=t,document.head.appendChild(n)}fetchGlobalSearch(e){let t=this.component?.metadata;if(t?.globalSearchEnabled){if(clearTimeout(this._globalSearchTimer),!e){this.commandPaletteDataHits=[];return}this._globalSearchTimer=setTimeout(async()=>{try{let n=(await Ge.runAction(this.baseUrl??``,t.rootRoute??``,``,`_globalsearch`,`cmd-palette`,void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(e=>e.data).find(e=>e&&e._globalsearch);this.commandPaletteDataHits=n?._globalsearch??[]}catch{this.commandPaletteDataHits=[]}},250)}}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute(`theme`)===`dark`,this._commandPaletteHandler=e=>{this.component?.metadata?.commandCenterEnabled||((e.metaKey||e.ctrlKey)&&e.key===`k`&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery=``,this.commandPaletteSelectedIndex=0),e.key===`Escape`&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=``))},document.addEventListener(`keydown`,this._commandPaletteHandler),Ma.install(),this.addEventListener(`compact-changed`,this._compactHandler),this.addEventListener(`mateu-open-ai`,this._openAiHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener(`keydown`,this._commandPaletteHandler),this.removeEventListener(`compact-changed`,this._compactHandler),this.removeEventListener(`mateu-open-ai`,this._openAiHandler)}updated(e){if(super.updated(e),Aa(this),this.component){let t=this.component.metadata;if(t){let n=t;if(n.favicon){let e=document.querySelector(`link[rel~='icon']`);e||(e=document.createElement(`link`),e.rel=`icon`,document.head.appendChild(e)),e.href=n.favicon}e.has(`component`)&&(this.selectedRoute=n.homeRoute,this.selectedConsumedRoute=n.homeConsumedRoute,this.selectedServerSideType=n.homeServerSideType,this.selectedBaseUrl=n.homeBaseUrl,this.selectedUriPrefix=n.homeUriPrefix)}}e.has(`commandPaletteOpen`)&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(`.cmd-input`)?.focus()},0)}render(){return N.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}static{this.styles=m`
        /* DS-neutral app chrome (replaces vaadin-app-layout / menu-bar / tabs / side-nav). */
        .m-hl { display: flex; flex-direction: row; }
        .m-vl { display: flex; flex-direction: column; }
        .m-scroll { overflow: auto; }
        .m-md { display: flex; width: 100%; height: 100%; }
        .m-md > .m-scroll { flex: 1; min-width: 0; }
        /* the AI chat panel: shown when open (slot="detail"), hidden when closed — replaces the
           vaadin-master-detail-layout detail slot that used to toggle it. */
        mateu-chat[slot="detail-hidden"] { display: none; }
        mateu-chat[slot="detail"] { display: flex; flex-direction: column; flex: 0 0 24rem; min-width: 0; }
        .m-app-layout { display: flex; flex-direction: column; width: 100%; height: 100vh; overflow: hidden; }
        .m-app-layout > .app-navbar { display: flex; align-items: center; gap: .5rem; height: 4rem; flex-shrink: 0; padding: 0 .75rem; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); background: var(--lumo-base-color, #fff); }
        .m-app-layout > .app-body { display: flex; flex: 1; min-height: 0; }
        .app-drawer { width: 16rem; flex-shrink: 0; overflow: auto; border-right: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); padding: .5rem 0; }
        .m-app-layout:not(.drawer-open) > .app-body > .app-drawer { display: none; }
        .drawer-toggle { border: none; background: transparent; font-size: 1.2rem; cursor: pointer; padding: .3rem .5rem; border-radius: var(--lumo-border-radius-m, 6px); }
        .drawer-toggle:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .drawer-search { padding: .4rem .6rem; border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2)); border-radius: var(--lumo-border-radius-m, 6px); box-sizing: border-box; font: inherit; }

        /* top nav (menu-on-top) */
        .app-nav { display: flex; flex-wrap: wrap; align-items: center; gap: .15rem; }
        .app-nav-item { border: none; background: transparent; font: inherit; padding: .4rem .8rem; border-radius: var(--lumo-border-radius-m, 6px); cursor: pointer; color: var(--lumo-body-text-color, #1a1a1a); white-space: nowrap; }
        .app-nav-item:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .app-nav-item.active { color: var(--lumo-primary-text-color, #1676f3); font-weight: 600; }
        .app-nav-group { position: relative; }
        .app-nav-group > summary { list-style: none; cursor: pointer; }
        .app-nav-group[open] > summary::after { content: ''; }
        .app-nav-dropdown { position: absolute; z-index: 50; display: flex; flex-direction: column; min-width: 11rem; padding: .3rem; background: var(--lumo-base-color, #fff); border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15)); }
        .app-nav-dropdown .app-nav-item { text-align: left; }

        /* header action buttons + icon buttons */
        .app-action-btn { font: inherit; font-weight: 600; padding: .35rem .8rem; border-radius: var(--lumo-border-radius-m, 6px); border: 1px solid transparent; cursor: pointer; }
        .app-action-btn.primary { background: var(--lumo-primary-color, #1676f3); color: var(--lumo-primary-contrast-color, #fff); }
        .app-icon-btn { border: none; background: transparent; cursor: pointer; font-size: 1.1rem; padding: .3rem .5rem; border-radius: var(--lumo-border-radius-m, 6px); line-height: 1; }
        .app-icon-btn:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }

        /* tabs variant */
        .app-tabs { display: flex; gap: .1rem; align-items: flex-end; }
        .app-tab { border: none; background: transparent; font: inherit; padding: .6rem 1rem; cursor: pointer; border-bottom: 2px solid transparent; color: var(--lumo-secondary-text-color, #667); }
        .app-tab.active { color: var(--lumo-primary-text-color, #1676f3); border-bottom-color: var(--lumo-primary-color, #1676f3); font-weight: 600; }

        /* side nav (hamburger drawer) + left menu (tiles) */
        .side-nav-item { display: flex; flex-direction: column; }
        .side-nav-link { text-align: left; border: none; background: transparent; font: inherit; padding: .5rem 1rem; cursor: pointer; color: inherit; }
        .side-nav-link:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .side-nav-item--active > .side-nav-link { color: var(--lumo-primary-text-color, #1676f3); font-weight: 600; }
        .side-nav-children { padding-left: 1rem; }
        .left-menu-item { display: block; width: 100%; text-align: left; border: none; background: transparent; font: inherit; padding: .5rem .75rem; cursor: pointer; border-radius: var(--lumo-border-radius-m, 6px); color: inherit; }
        .left-menu-item:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .left-menu-group > summary { cursor: pointer; padding: .5rem .75rem; font-weight: 600; }

        .app-content {
            padding-left: 2rem;
            padding-right: 2rem;
            padding-top: 1.5rem;
            width: calc(100% - 4rem);
            height: calc(100vh - 6rem);
            overflow-y: auto;
        }

        .app-content.no-padding {
            padding: 0;
            width: 100%;
        }

        /* Native top navigation (was a vaadin-menu-bar). */
        .mateu-nav { display: flex; align-items: center; gap: .1rem; flex-grow: 1; min-width: 0; overflow: visible; }
        .mateu-nav-item { border: none; background: transparent; font: inherit; cursor: pointer; padding: .5rem .8rem; border-radius: var(--lumo-border-radius-m, 6px); color: inherit; white-space: nowrap; }
        .mateu-nav-item:hover, .mateu-nav-group > summary:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .mateu-nav-item--active { color: var(--lumo-primary-text-color, #1676f3); font-weight: 600; }
        .mateu-nav-group { position: relative; }
        .mateu-nav-group > summary { list-style: none; cursor: pointer; padding: .5rem .8rem; border-radius: var(--lumo-border-radius-m, 6px); white-space: nowrap; }
        .mateu-nav-group > summary::-webkit-details-marker { display: none; }
        .mateu-nav-panel { position: absolute; top: 100%; left: 0; z-index: 100; min-width: 12rem; display: flex; flex-direction: column; padding: .25rem; background: var(--lumo-base-color, #fff); border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px); box-shadow: var(--lumo-box-shadow-m, 0 4px 12px rgba(0,0,0,.15)); }
        .mateu-nav-panel .mateu-nav-item { text-align: left; }
        .left-menu-children { padding-left: .75rem; }
        .left-menu-group > summary { list-style: none; }
        .left-menu-group > summary::-webkit-details-marker { display: none; }
        /* Native tab strip (TABS variant, was vaadin-tabs). */
        .mateu-tabs { display: flex; align-items: stretch; gap: .1rem; overflow-x: auto; }
        .mateu-tab { border: none; background: transparent; font: inherit; cursor: pointer; padding: .85rem 1rem; color: var(--lumo-secondary-text-color, #667); border-bottom: 2px solid transparent; white-space: nowrap; }
        .mateu-tab:hover { color: var(--lumo-body-text-color, #161513); }
        .mateu-tab--active { color: var(--lumo-primary-text-color, #1676f3); border-bottom-color: var(--lumo-primary-color, #1676f3); font-weight: 600; }
        /* App-header chrome buttons (theme toggle, header actions). */
        .app-chrome-icon-btn { border: none; background: transparent; cursor: pointer; padding: .4rem; border-radius: var(--lumo-border-radius-m, 6px); display: inline-flex; align-items: center; }
        .app-chrome-icon-btn:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .app-header-action-btn { display: inline-flex; align-items: center; gap: .3rem; border: none; cursor: pointer; font: inherit; font-weight: 500; padding: .4rem .8rem; border-radius: var(--lumo-border-radius-m, 6px); background: var(--lumo-primary-color, #1676f3); color: var(--lumo-primary-contrast-color, #fff); list-style: none; }
        .app-header-action-btn::-webkit-details-marker { display: none; }

        .tiles-hub-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1.5rem;
        }

        .nav-tile {
            border: 1px solid var(--lumo-contrast-10pct);
            border-radius: var(--lumo-border-radius-l);
            padding: 1.5rem;
            cursor: pointer;
            transition: box-shadow 0.2s, border-color 0.2s;
        }

        .nav-tile:hover {
            box-shadow: 0 4px 12px var(--lumo-contrast-20pct);
            border-color: var(--lumo-primary-color-50pct);
        }

        .nav-tile-title {
            font-size: var(--lumo-font-size-l);
            font-weight: 600;
            margin-bottom: 0.35rem;
        }

        .nav-tile-desc {
            color: var(--lumo-secondary-text-color);
            font-size: var(--lumo-font-size-s);
        }

        .nav-rail {
            width: 72px;
            min-height: 100vh;
            border-right: 1px solid var(--lumo-contrast-10pct);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 0.75rem;
            gap: 0.25rem;
            flex-shrink: 0;
        }

        .rail-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 64px;
            padding: 0.5rem 0;
            cursor: pointer;
            border-radius: var(--lumo-border-radius-m);
            transition: background-color 0.2s;
            gap: 0.2rem;
        }

        .rail-item:hover {
            background-color: var(--lumo-contrast-5pct);
        }

        .rail-item--active {
            background-color: var(--lumo-primary-color-10pct);
            color: var(--lumo-primary-color);
        }

        .rail-icon {
            font-size: 1.4rem;
        }

        .rail-icon-placeholder {
            width: 1.6rem;
            height: 1.6rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: 600;
            border-radius: 50%;
            background-color: var(--lumo-contrast-10pct);
        }

        .rail-label {
            font-size: 0.6rem;
            text-align: center;
            max-width: 64px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .rail-sub-panel {
            width: 200px;
            min-height: 100vh;
            border-right: 1px solid var(--lumo-contrast-10pct);
            padding: 0.75rem 0;
            flex-shrink: 0;
        }

        .rail-sub-title {
            font-size: var(--lumo-font-size-xs);
            font-weight: 600;
            color: var(--lumo-secondary-text-color);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 0.25rem 1rem 0.5rem;
        }

        .rail-sub-item {
            padding: 0.5rem 1rem;
            cursor: pointer;
            border-radius: var(--lumo-border-radius-m);
            margin: 0.1rem 0.5rem;
            transition: background-color 0.2s;
            font-size: var(--lumo-font-size-s);
        }

        .rail-sub-item:hover {
            background-color: var(--lumo-contrast-5pct);
        }

        .rail-sub-item--active {
            background-color: var(--lumo-primary-color-10pct);
            color: var(--lumo-primary-color);
            font-weight: 600;
        }

        .cmd-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 15vh;
            z-index: 1000;
        }

        .cmd-palette {
            background: var(--lumo-base-color);
            border-radius: var(--lumo-border-radius-l);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: min(560px, 90vw);
            overflow: hidden;
        }

        .cmd-search-wrapper {
            display: flex;
            align-items: center;
            padding: 0 1rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct);
            gap: 0.75rem;
        }

        .cmd-search-icon {
            color: var(--lumo-secondary-text-color);
            flex-shrink: 0;
        }

        .cmd-input {
            flex: 1;
            border: none;
            outline: none;
            background: transparent;
            font-size: var(--lumo-font-size-l);
            color: var(--lumo-body-text-color);
            padding: 1rem 0;
            font-family: var(--lumo-font-family);
        }

        .cmd-results {
            max-height: 340px;
            overflow-y: auto;
            padding: 0.5rem;
        }

        .cmd-result {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.6rem 0.75rem;
            border-radius: var(--lumo-border-radius-m);
            cursor: pointer;
            gap: 1rem;
        }

        .cmd-result--selected {
            background: var(--lumo-primary-color-10pct);
        }

        .cmd-result-label {
            font-size: var(--lumo-font-size-m);
        }

        .cmd-result-breadcrumb {
            font-size: var(--lumo-font-size-xs);
            color: var(--lumo-secondary-text-color);
            white-space: nowrap;
        }

        .cmd-category {
            padding: 0.35rem 1rem 0.15rem;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--lumo-secondary-text-color, #777);
        }
        .cmd-empty {
            padding: 1.5rem;
            text-align: center;
            color: var(--lumo-secondary-text-color);
            font-size: var(--lumo-font-size-s);
        }

        .app-fab, .page-fab {
            position: fixed;
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 50%;
            background: var(--lumo-primary-color);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
            z-index: 900;
            transition: background 0.2s, transform 0.1s;
            font-size: 1rem;
        }

        .app-fab:hover, .page-fab:hover {
            background: var(--lumo-primary-color-50pct);
            transform: scale(1.08);
        }

        .ai-fab {
            position: fixed;
            bottom: 1.5rem;
            right: 1.5rem;
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 50%;
            background: var(--lumo-primary-color);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
            z-index: 900;
            transition: background 0.2s, transform 0.1s;
            font-size: 1rem;
        }

        .ai-fab:hover {
            background: var(--lumo-primary-color-50pct);
            transform: scale(1.08);
        }

  `}};O([S()],K.prototype,`filter`,void 0),O([S()],K.prototype,`instant`,void 0),O([S()],K.prototype,`selectedConsumedRoute`,void 0),O([S()],K.prototype,`selectedRoute`,void 0),O([S()],K.prototype,`selectedUriPrefix`,void 0),O([S()],K.prototype,`selectedBaseUrl`,void 0),O([S()],K.prototype,`selectedServerSideType`,void 0),O([S()],K.prototype,`selectedParams`,void 0),O([S()],K.prototype,`tilesMenuOption`,void 0),O([S()],K.prototype,`railOpenOption`,void 0),O([S()],K.prototype,`commandPaletteOpen`,void 0),O([S()],K.prototype,`commandPaletteQuery`,void 0),O([S()],K.prototype,`commandPaletteSelectedIndex`,void 0),O([S()],K.prototype,`commandPaletteDataHits`,void 0),O([S()],K.prototype,`pageCompact`,void 0),O([b(`mateu-chat`)],K.prototype,`chat`,void 0),O([S()],K.prototype,`isDark`,void 0),O([S()],K.prototype,`chatOpen`,void 0),O([b(`.mateu-app-layout`)],K.prototype,`vaadinAppLayout`,void 0),K=Na=O([h(`mateu-app`)],K);var q=class extends y{constructor(...e){super(...e),this.message=`This website uses cookies.`,this.dismiss=`Ok. Thanks :).`,this.learnMore=`Learn more`,this.learnMoreLink=`https://cookiesandyou.com/`,this.showLearnMore=!0,this.position=`top`,this.cookieName=`mateu-cookieconsent`}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement(`style`),this._css.innerText=`.cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}`,document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){let e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){let e=this.popup;e&&(e.classList.remove(`cc-invisible`),e.style.display=``)}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:`#000`},button:{background:`rgba(22, 118, 243, 0.95)`,hover:`rgba(22, 118, 243, 1)`}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});let e=this.popup;if(e){e.setAttribute(`role`,`alert`);let t=e.querySelector(`a.cc-btn`);t?.addEventListener(`keydown`,e=>{let n=e.keyCode||e.which;(n===32||n===13)&&t.click()})}}render(){return w`
       `}static{this.styles=m`
  `}};O([v()],q.prototype,`message`,void 0),O([v()],q.prototype,`dismiss`,void 0),O([v()],q.prototype,`learnMore`,void 0),O([v()],q.prototype,`learnMoreLink`,void 0),O([v()],q.prototype,`showLearnMore`,void 0),O([v()],q.prototype,`position`,void 0),O([v()],q.prototype,`cookieName`,void 0),O([S()],q.prototype,`_css`,void 0),O([b(`[aria-label="cookieconsent"]`)],q.prototype,`popup`,void 0),q=O([h(`mateu-cookie-consent`)],q);var Pa=class extends y{constructor(...e){super(...e),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener(`value-changed`,this.redispatchEvent),this.addEventListener(`data-changed`,this.redispatchEvent),this.addEventListener(`action-requested`,this.redispatchEvent),this.addEventListener(`server-side-action-requested`,this.redispatchEvent),this.addEventListener(`route-changed`,this.redispatchEvent),this.addEventListener(`close-modal-requested`,this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`value-changed`,this.redispatchEvent),this.removeEventListener(`data-changed`,this.redispatchEvent),this.removeEventListener(`action-requested`,this.redispatchEvent),this.removeEventListener(`server-side-action-requested`,this.redispatchEvent),this.removeEventListener(`route-changed`,this.redispatchEvent)}render(){return w`<slot></slot>`}static{this.styles=m`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `}};O([v()],Pa.prototype,`target`,void 0),Pa=O([h(`mateu-event-interceptor`)],Pa);var Fa=[`a[href]`,`button`,`input`,`select`,`textarea`,`[tabindex]`,`vaadin-button`,`vaadin-text-field`,`vaadin-combo-box`,`vaadin-select`,`vaadin-checkbox`,`vaadin-date-picker`,`ui5-button`,`oj-c-button`].join(`,`),Ia=e=>{let t=e;return t.hidden||t.hasAttribute(`disabled`)||t.getAttribute(`aria-hidden`)===`true`||t.getAttribute(`tabindex`)===`-1`?!1:!!(t.offsetParent||t.getClientRects().length)},La=e=>{let t=[],n=e=>{e.querySelectorAll(`*`).forEach(e=>{e.matches(Fa)&&Ia(e)&&t.push(e),e.shadowRoot&&n(e.shadowRoot),e instanceof HTMLSlotElement&&e.assignedElements().forEach(e=>{e.matches(Fa)&&Ia(e)&&t.push(e),n(e)})})};return n(e),t.filter((e,n)=>t.indexOf(e)===n)},Ra=(e,t={})=>{let n=za(),r=[],i=()=>{r=La(e)},a=t=>{if(t.key!==`Tab`)return;if(i(),r.length===0){t.preventDefault(),e.focus();return}let n=r[0],a=r[r.length-1],o=za();t.shiftKey&&(o===n||!o||!Ba(o,e))?(t.preventDefault(),a.focus()):!t.shiftKey&&o===a&&(t.preventDefault(),n.focus())};return e.addEventListener(`keydown`,a),requestAnimationFrame(()=>{i();let n=t.initialFocus?.()??r[0];n?n.focus():(e.hasAttribute(`tabindex`)||e.setAttribute(`tabindex`,`-1`),e.focus())}),{refresh:i,release(){e.removeEventListener(`keydown`,a);let t=za();(!t||t===document.body||Ba(t,e))&&n?.focus?.()}}},za=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},Ba=(e,t)=>{let n=e;for(;n;){if(n===t)return!0;n=n.parentNode??n.host??null}return!1},Va=class extends Sa{constructor(...e){super(...e),this.opened=!0,this.close=()=>{this.opened=!1,this.releaseFocusTrap(),setTimeout(()=>{this.removeSelfFromOwnerChildren()||this.parentElement?.removeChild(this)},500)},this.onKeydown=e=>{e.key===`Escape`&&this.opened&&(e.stopPropagation(),this.close())}}connectedCallback(){super.connectedCallback(),this.addEventListener(`keydown`,this.onKeydown)}disconnectedCallback(){super.disconnectedCallback(),this.releaseFocusTrap()}releaseFocusTrap(){this.focusTrap?.release(),this.focusTrap=void 0}applyFragment(e){super.applyFragment(e);let t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has(`component`)&&this.component){let e=this.component.metadata;this.state=e.initialData}let t=this.renderRoot.querySelector(`[role="dialog"]`),n=this.component?.metadata?.modeless;this.opened&&t&&!this.focusTrap&&!n?this.focusTrap=Ra(t):this.focusTrap&&this.opened&&this.focusTrap.refresh()}render(){if(!this.opened)return w``;let e=this.component.metadata,t=it(e.headerTitle,this.state,this.data,this.appState,this.appData),n=!!(t||e.header||e.closeButtonOnHeader),r=[e.width?`width:${e.width};`:`min-width:min(90vw,28rem);`,e.height?`height:${e.height};`:``,e.top?`margin-top:${e.top};`:``].join(``);return w`
            <div class="backdrop ${e.modeless?`modeless`:``}"
                 @click="${t=>{!e.modeless&&t.target===t.currentTarget&&this.close()}}">
                <div class="dialog ${e.noPadding?`no-padding`:``} ${this.component?.cssClasses??``}"
                     role="dialog"
                     aria-modal="${e.modeless?`false`:`true`}"
                     aria-label="${t||`Dialog`}"
                     style="${r} ${this.component?.style??``}">
                    ${n?w`
                        <div class="dialog-header">
                            <mateu-event-interceptor .target="${this}" style="flex:1; min-width:0;">
                                ${t?w`<span class="dialog-title">${t}</span>`:_}
                                ${e.header?P(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):_}
                            </mateu-event-interceptor>
                            ${e.closeButtonOnHeader?w`<button class="dialog-close" @click="${this.close}" aria-label="Close">✕</button>`:_}
                        </div>`:_}
                    ${e.content?w`
                        <div class="dialog-body">
                            <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width:100%;">
                                ${P(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:_}
                    ${e.footer?w`
                        <div class="dialog-footer">
                            <mateu-event-interceptor .target="${this}" style="width:100%;">
                                ${P(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:_}
                </div>
            </div>
        `}static{this.styles=m`
        .backdrop {
            position: fixed; inset: 0; z-index: 1000;
            display: flex; align-items: center; justify-content: center;
            background: rgba(0,0,0,.35); padding: 1rem;
        }
        .backdrop.modeless { background: transparent; pointer-events: none; }
        .backdrop.modeless .dialog { pointer-events: all; }
        .dialog {
            max-width: 90vw; max-height: 90vh; overflow: auto;
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            border-radius: var(--lumo-border-radius-l, 12px);
            box-shadow: var(--lumo-box-shadow-xl, 0 12px 40px rgba(0,0,0,.3));
            display: flex; flex-direction: column;
        }
        .dialog-header { display: flex; align-items: center; gap: .5rem; padding: 1rem 1.2rem .5rem; }
        .dialog-title { font-size: var(--lumo-font-size-l, 1.25rem); font-weight: 600; }
        .dialog-close {
            flex: 0 0 auto; border: none; background: transparent; cursor: pointer;
            font-size: 1rem; color: var(--lumo-secondary-text-color, #667); padding: .25rem .4rem; border-radius: 4px;
        }
        .dialog-close:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .dialog-body { padding: .5rem 1.2rem; flex: 1; }
        .dialog.no-padding .dialog-body { padding: 0; }
        .dialog-footer { padding: .5rem 1.2rem 1rem; display: flex; justify-content: flex-end; gap: .5rem; }
    `}};O([S()],Va.prototype,`opened`,void 0),Va=O([h(`mateu-dialog`)],Va);var Ha,Ua=class extends Sa{static{Ha=this}constructor(...e){super(...e),this.opened=!1,this.maximizeSteps=0,this.collapsed=!1,this.pagerMenuOpen=!1,this.onGuidedProgress=e=>{let t=e.detail;t&&t.total>0&&(this.guidedProgress=t)},this.close=()=>{this.opened=!1,this.releaseLayoutInset(),this.releaseFocusTrap(),setTimeout(()=>{this.removeSelfFromOwnerChildren()||this.parentElement?.removeChild(this)},300)},this._escListener=e=>{if(e.key!==`Escape`)return;let t=this.getRootNode().querySelectorAll(`mateu-drawer, mateu-dialog`);t[t.length-1]===this&&(e.stopPropagation(),this.close())}}jumpToStep(e){this.pagerMenuOpen=!1,e&&(this.renderRoot.querySelector(`.content mateu-component`)??this.renderRoot.querySelector(`mateu-component`))?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`goToStep`,parameters:{_stepId:e}},bubbles:!0,composed:!0}))}static{this.SIZE_LADDER=[`s`,`m`,`l`,`xl`]}static{this.SIZE_WIDTHS={s:`464px`,m:`648px`,l:`968px`,xl:`90vw`}}effectiveWidth(e){if(e.width)return e.width;if(!e.size)return;let t=Ha.SIZE_LADDER,n=Math.max(0,t.indexOf(e.size)),r=Math.min(t.length-1,n+this.maximizeSteps);return Ha.SIZE_WIDTHS[t[r]]}canMaximize(e){if(!e.maximizable)return!1;let t=Ha.SIZE_LADDER;return Math.max(0,t.indexOf(e.size??`m`))+this.maximizeSteps<t.length-1}firstUpdated(){requestAnimationFrame(()=>this.opened=!0),this.addEventListener(`mateu-guided-progress`,this.onGuidedProgress);let e=this.component?.metadata;e&&requestAnimationFrame(()=>this.applyLayoutInset(e))}releaseFocusTrap(){this.focusTrap?.release(),this.focusTrap=void 0}applyLayoutInset(e){if(!e.layout)return;let t=document.querySelector(`mateu-ui`);if(!t)return;let n=e.position??`end`,r=n===`bottom`?`var(--mateu-drawer-height, 50vh)`:this.effectiveWidth(e)??`648px`;this._insetProp=n===`start`?`paddingLeft`:n===`bottom`?`paddingBottom`:`paddingRight`,t.style.transition=`padding .25s ease`,t.style[this._insetProp]=r}releaseLayoutInset(){if(!this._insetProp)return;let e=document.querySelector(`mateu-ui`);e&&(e.style[this._insetProp]=``),this._insetProp=void 0}applyFragment(e){super.applyFragment(e);let t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has(`component`)&&this.component){let e=this.component.metadata;this.state=e.initialData}let t=this.component?.metadata,n=this.renderRoot.querySelector(`[role="dialog"]`);this.opened&&n&&!t?.modeless&&!t?.layout&&!this.focusTrap?this.focusTrap=Ra(n):this.focusTrap&&this.opened&&this.focusTrap.refresh()}connectedCallback(){super.connectedCallback(),document.addEventListener(`keydown`,this._escListener)}disconnectedCallback(){document.removeEventListener(`keydown`,this._escListener),this.releaseLayoutInset(),this.releaseFocusTrap(),super.disconnectedCallback()}render(){let e=this.component.metadata,t=e.position??`end`,n=it(e.headerTitle,this.state,this.data,this.appState,this.appData),r=it(e.subtitle,this.state,this.data,this.appState,this.appData),i=this.effectiveWidth(e),a=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0;return w`
        ${e.modeless||e.layout?_:w`
            <div class="backdrop ${this.opened?`open`:``}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${t} ${this.opened?`open`:``} ${this.collapsed?`collapsed`:``} ${this.component?.cssClasses??``}"
                role="dialog"
                aria-modal="${!e.modeless}"
                aria-label="${n??_}"
                style="${i&&t!==`bottom`?`width: ${i};`:``}${this.component?.style??``}"
        >
            <header>
                ${n?w`<div class="titles"><h3>${n}</h3>${r?w`<span class="subtitle">${r}</span>`:_}</div>`:w`<span class="spacer"></span>`}
                ${this.guidedProgress&&this.guidedProgress.total>1?w`
                    <div class="guided-pager-wrap">
                        <button class="guided-pager" aria-haspopup="true" aria-expanded="${this.pagerMenuOpen}"
                                aria-label="Step ${this.guidedProgress.current} of ${this.guidedProgress.total}"
                                @click="${()=>this.pagerMenuOpen=!this.pagerMenuOpen}">${this.guidedProgress.current} | ${this.guidedProgress.total}<span class="caret">▾</span></button>
                        ${this.pagerMenuOpen&&this.guidedProgress.steps?w`
                            <div class="guided-pager-menu">
                                ${this.guidedProgress.steps.map((e,t)=>w`
                                    <button class="guided-pager-item ${e.status}" ?disabled="${e.status!==`done`}"
                                            @click="${()=>this.jumpToStep(e.id)}"><span class="pager-dot">${e.status===`done`?`✓`:t+1}</span>${e.title??`Step ${t+1}`}</button>
                                `)}
                            </div>
                        `:_}
                    </div>
                `:_}
                ${e.header?w`
                    <mateu-event-interceptor .target="${this}">${P(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:_}
                ${a?w`
                    <button class="drawer-icon" aria-label="${a.prevLabel??`Previous`}" title="${a.prevLabel??`Previous`}"
                            ?disabled="${!a.prevRoute}" @click="${()=>{a.prevRoute&&(window.location.href=a.prevRoute)}}">‹</button>
                    <button class="drawer-icon" aria-label="${a.nextLabel??`Next`}" title="${a.nextLabel??`Next`}"
                            ?disabled="${!a.nextRoute}" @click="${()=>{a.nextRoute&&(window.location.href=a.nextRoute)}}">›</button>
                `:_}
                ${e.collapsible?w`
                    <button class="drawer-icon" aria-label="${this.collapsed?`Expand`:`Collapse`}" title="${this.collapsed?`Expand`:`Collapse`}"
                            @click="${()=>this.collapsed=!this.collapsed}">${this.collapsed?`▴`:`▾`}</button>
                `:_}
                ${this.canMaximize(e)?w`
                    <button class="drawer-icon" aria-label="Maximize" title="Maximize" @click="${()=>this.maximizeSteps++}">⤢</button>
                `:_}
                <button class="drawer-close" aria-label="Close" @click="${this.close}">✕</button>
            </header>
            ${this.collapsed?_:w`
            <div class="content ${e.noPadding?`no-padding`:``}">
                ${e.content?w`
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${P(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:_}
            </div>
            ${e.footer?w`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${P(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:_}
            `}
        </section>
       `}static{this.styles=m`
        .drawer-close {
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 1rem;
            line-height: 1;
            padding: .35rem .5rem;
            border-radius: var(--lumo-border-radius-m, 6px);
            color: var(--lumo-secondary-text-color, #555);
        }
        .drawer-close:hover {
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.05));
        }

        .backdrop {
            position: fixed;
            inset: 0;
            background: var(--mateu-drawer-backdrop, rgba(0, 0, 0, 0.35));
            opacity: 0;
            transition: opacity 0.25s ease;
            z-index: 1000;
        }
        .backdrop.open {
            opacity: 1;
        }
        .panel {
            position: fixed;
            top: 0;
            bottom: 0;
            width: var(--mateu-drawer-width, 26rem);
            max-width: 92vw;
            background: var(--lumo-base-color, #fff);
            color: var(--lumo-body-text-color, #1a1a1a);
            box-shadow: var(--lumo-box-shadow-l, 0 8px 24px rgba(0, 0, 0, 0.25));
            display: flex;
            flex-direction: column;
            transition: transform 0.25s ease;
            z-index: 1001;
        }
        .panel.end {
            right: 0;
            transform: translateX(100%);
        }
        .panel.start {
            left: 0;
            transform: translateX(-100%);
        }
        .panel.open {
            transform: translateX(0);
        }
        /* Bottom drawer: docked at the bottom edge, full width, slides up (the Redwood
           "Bottom Drawer" template). Height defaults to half the viewport; collapsing (via the
           handle) shrinks it to the header strip. */
        .panel.bottom {
            top: auto;
            left: 0;
            right: 0;
            width: auto;
            max-width: 100vw;
            height: var(--mateu-drawer-height, 50vh);
            max-height: 90vh;
            transform: translateY(100%);
            border-top-left-radius: var(--lumo-border-radius-l, 12px);
            border-top-right-radius: var(--lumo-border-radius-l, 12px);
        }
        .panel.bottom.open {
            transform: translateY(0);
        }
        .panel.bottom.collapsed {
            height: auto;
        }
        header {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-s, 0.5rem);
            padding: var(--mateu-drawer-header-padding, var(--lumo-space-s, 0.5rem) var(--lumo-space-m, 1rem));
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
        }
        header .titles {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
        }
        header h3 {
            margin: 0;
            font-size: var(--lumo-font-size-l, 1.125rem);
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        header .subtitle {
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #6b7280);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        header .spacer {
            flex: 1;
        }
        .guided-pager-wrap {
            position: relative;
        }
        .guided-pager {
            display: inline-flex;
            align-items: center;
            gap: .15rem;
            font-size: var(--lumo-font-size-m, 1rem);
            font-weight: 300;
            letter-spacing: .1em;
            color: var(--lumo-secondary-text-color, #6b7280);
            white-space: nowrap;
            padding: .1rem .35rem;
            background: transparent;
            border: none;
            border-radius: var(--lumo-border-radius-m, 6px);
            cursor: pointer;
        }
        .guided-pager:hover {
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.05));
        }
        .guided-pager .caret {
            font-size: .7em;
            letter-spacing: 0;
        }
        .guided-pager-menu {
            position: absolute;
            top: calc(100% + .25rem);
            right: 0;
            z-index: 10;
            min-width: 12rem;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-m, 6px);
            box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.16));
            padding: .25rem;
            display: flex;
            flex-direction: column;
        }
        .guided-pager-item {
            display: flex;
            align-items: center;
            gap: .5rem;
            padding: .4rem .5rem;
            border: none;
            background: transparent;
            border-radius: var(--lumo-border-radius-s, 4px);
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            text-align: left;
            cursor: pointer;
            letter-spacing: 0;
        }
        .guided-pager-item:hover:not(:disabled) {
            background: var(--lumo-primary-color-10pct, rgba(0,90,200,.1));
        }
        .guided-pager-item:disabled {
            color: var(--lumo-tertiary-text-color, #9aa0a6);
            cursor: default;
        }
        .guided-pager-item .pager-dot {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.15rem;
            height: 1.15rem;
            border-radius: 50%;
            font-size: .7rem;
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            color: var(--lumo-secondary-text-color, #6b7280);
            flex: none;
        }
        .guided-pager-item.done .pager-dot {
            background: var(--lumo-primary-color, #0b57d0);
            color: var(--lumo-primary-contrast-color, #fff);
        }
        .drawer-icon {
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 1.1rem;
            line-height: 1;
            padding: .35rem .5rem;
            border-radius: var(--lumo-border-radius-m, 6px);
            color: var(--lumo-secondary-text-color, #555);
        }
        .drawer-icon:hover:not(:disabled) {
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.05));
        }
        .drawer-icon:disabled {
            opacity: .35;
            cursor: default;
        }
        .content {
            flex: 1;
            overflow: auto;
            padding: var(--mateu-drawer-content-padding, var(--lumo-space-m, 1rem));
        }
        .content.no-padding {
            padding: 0;
        }
        /* Footer holds the drawer's actions — right-aligned with a top divider, the standard
           (and RDS "Create and Edit - Drawer") footer treatment. The action row inside is a
           HorizontalLayout, so stretch it and push its buttons to the trailing edge. */
        footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: var(--lumo-space-s, 0.5rem);
            padding: var(--mateu-drawer-footer-padding, var(--lumo-space-s, 0.5rem) var(--lumo-space-m, 1rem));
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
        }
        footer > * {
            display: flex;
            justify-content: flex-end;
        }
  `}};O([S()],Ua.prototype,`opened`,void 0),O([S()],Ua.prototype,`maximizeSteps`,void 0),O([S()],Ua.prototype,`collapsed`,void 0),O([S()],Ua.prototype,`guidedProgress`,void 0),O([S()],Ua.prototype,`pagerMenuOpen`,void 0),Ua=Ha=O([h(`mateu-drawer`)],Ua);function Wa(e){if(e.parentElement)return e.parentElement;let t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}var J=class extends y{constructor(...e){super(...e),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type===`keydown`){let t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{let t=e.detail,n=t.banners??[],r=t.append??!1;r?this.actionBanners=[...this.actionBanners,...n]:(this._clearActionBannerTimers(),this.actionBanners=n);let i=r?this.actionBanners.length-n.length:0;n.forEach((e,t)=>{if(e.timeoutSeconds&&e.timeoutSeconds>0){let n=i+t;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((e,t)=>t!==n)},e.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;let t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;let n=parseInt(t[1],10)-1;n>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(n))},this._onScrollSpy=()=>{if(this._tocLocked)return;let e=this._sectionCards();if(!e.length)return;let t=this.shadowRoot?.querySelector(`mateu-content-header`),n=t?t.getBoundingClientRect().bottom:0;for(let t of e){if(!t.classList.contains(`mateu-section--sticky`))continue;let e=t.getBoundingClientRect();e.top<=n+12+2&&(n=Math.max(n,e.bottom))}let r=n+12+4,i=0;this._tocEntries.forEach((e,t)=>{e.el.getBoundingClientRect().top<=r&&(i=t)}),this._activeToc=i}}connectedCallback(){super.connectedCallback(),document.addEventListener(`page-banners-received`,this._bannersHandler),window.addEventListener(`resize`,this._onResize),document.addEventListener(`keydown`,this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener(`page-banners-received`,this._bannersHandler),window.removeEventListener(`resize`,this._onResize),document.removeEventListener(`keydown`,this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){if(super.updated(e),e.has(`component`)&&e.get(`component`)!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has(`component`)){let e=this.component?.metadata?.level??0;this.toggleAttribute(`data-nested`,e>0),this._scheduleStaticBannerTimeouts();let t=this.component?.metadata?.pageWidth===`edgeToEdge`;this.toggleAttribute(`data-edge`,t),this.dispatchEvent(new CustomEvent(`compact-changed`,{detail:{compact:!!this.component?.style?.includes(`--mateu-compact:1`)||t},bubbles:!0,composed:!0})),this._scheduleTocRebuild()}}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((e,t)=>{e.timeoutSeconds&&e.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,t])},e.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,n)=>n!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){let t=e.theme?.toLowerCase()??`info`;return t===`none`?``:t}_evalBannerText(e){return j(e,this.state,this.data)}_renderBanner(e,t){let n=this._evalBannerText(e.title),r=this._evalBannerText(e.description);return w`
            <div class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${n||e.hasCloseButton?w`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${n??``}</span>
                        ${e.hasCloseButton?w`
                            <button class="banner-close" @click=${t} title="Dismiss" aria-label="Dismiss">✕</button>
                        `:_}
                    </div>
                `:_}
                ${r?w`<p>${r}</p>`:_}
            </div>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(`.mateu-section`))}_sectionTitle(e){return e.querySelector(`[slot="title"]`)?.textContent?.trim()||e.querySelector(`h1,h2,h3,h4,h5,h6`)?.textContent?.trim()||void 0}_rebuildToc(){let e=this._sectionCards(),t=e.map(e=>({title:this._sectionTitle(e),el:e})).filter(e=>!!e.title),n=this.component?.metadata?.toc,r=t.length>4&&e.every(e=>!e.closest(`vaadin-horizontal-layout`)),i=(n===!0||n!==!1&&r)&&t.length>0;this._tocEntries=t,this._tocVisible=i,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),i?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){let e=this.shadowRoot?.querySelector(`mateu-content-header`);this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty(`--mateu-header-h`,this._headerH+`px`);let t=this._headerH+12;for(let e of this._sectionCards())e.classList.contains(`mateu-section--sticky`)&&(e.style.top=t+`px`,t+=e.offsetHeight+12)}_scrollContainer(){let e=Wa(this);for(;e;){let t=getComputedStyle(e).overflowY;if((t===`auto`||t===`scroll`)&&e.scrollHeight>e.clientHeight)return e;e=Wa(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener(`scroll`,this._onScrollSpy,{passive:!0}),window.addEventListener(`wheel`,this._unlockToc,{passive:!0}),window.addEventListener(`touchstart`,this._unlockToc,{passive:!0}),window.addEventListener(`keydown`,this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener(`scroll`,this._onScrollSpy),window.removeEventListener(`wheel`,this._unlockToc),window.removeEventListener(`touchstart`,this._unlockToc),window.removeEventListener(`keydown`,this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){let t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;let n=this._headerH+12;for(let e of this._sectionCards()){if(e===t.el)break;e.classList.contains(`mateu-section--sticky`)&&(n+=e.offsetHeight+12)}let r=this._scrollContainer(),i=r?r.getBoundingClientRect().top:0,a=t.el.getBoundingClientRect().top-i-n;(r??window).scrollBy({top:a,behavior:`smooth`})}_showHeaderBand(){let e=this.component?.metadata,t=!!(e?.title||e?.subtitle||e?.toolbar?.length),n=!!this.component?.children?.some(e=>e.metadata?.type===A.Crud);return t&&!n&&!this._hasWelcomeBanner()}_hasWelcomeBanner(){let e=t=>t?.metadata?.type===A.HeroSection||(t?.children??[]).some(e);return(this.component?.children??[]).some(e)}render(){let e=this.component?.metadata,t=[...(e?.banners??[]).map((e,t)=>({banner:e,index:t})).filter(({index:e})=>!this.dismissedStaticBannerIndices.has(e)).map(({banner:e,index:t})=>({banner:e,onDismiss:()=>this._dismissStaticBanner(t)})),...this.actionBanners.map((e,t)=>({banner:e,onDismiss:()=>this._dismissActionBanner(t)}))];return w`<div style="display: flex; flex-direction: column; width: 100%;">${w`
            <div class="page-header-wrap">
                <mateu-content-header
                    class="${this._tocVisible?`sticky-header`:``}"
                    .metadata="${e}"
                    .baseUrl="${this.baseUrl}"
                    .state="${this.state}"
                    .data="${this.data}"
                    .appState="${this.appState}"
                    .appData="${this.appData}"
                ></mateu-content-header>
                ${this._showHeaderBand()?w`
                    <div class="page-header-band" aria-hidden="true"></div>
                `:_}
            </div>
            ${t.length>0?w`
                <div class="page-banners">
                    ${t.map(({banner:e,onDismiss:t})=>this._renderBanner(e,t))}
                </div>
            `:_}
            <div class="page-body ${this._tocVisible?`with-toc`:``}">
                <div class="form-content">
                    <slot @slotchange=${this._onSlotChange}></slot>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem);" class="form-buttons">
                        <slot name="buttons"></slot>
                    </div>
                </div>
                ${this._tocVisible?w`
                    <aside class="page-toc">
                        <nav>
                            ${this._tocEntries.map((e,t)=>w`
                                <a class="page-toc__item ${t===this._activeToc?`is-active`:``}"
                                   @click=${()=>this._scrollToSection(t)}
                                   title=${t<9?`${e.title} (Ctrl+Alt+${t+1})`:e.title}>
                                    <span class="page-toc__label">${e.title}</span>
                                    ${t<9?w`<span class="page-toc__key">${t+1}</span>`:_}
                                </a>
                            `)}
                        </nav>
                    </aside>
                `:_}
            </div>
            <div class="form-footer">
                ${e?.footer?.map(e=>P(this,e,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `}</div>`}static{this.styles=m`
        /* Design-system hook: background behind the page header (the RDS "Header + Background"
           band) — transparent by default; the Redwood renderer paints it with the canvas color
           via a custom property, so the header reads as part of the canvas and the content slab
           starts at the color strip below. */
        .page-header-wrap {
            background: var(--mateu-page-header-bg, transparent);
        }

        /* edgeToEdge (RDS): the shell drops its gutters (no-padding hook) so the CONTENT
           bleeds, but the page header + banners keep their own gutter — like the Redwood
           anatomy, where only the content band reaches the edges. */
        :host([data-edge]) .page-header-wrap,
        :host([data-edge]) .page-banners {
            padding-left: var(--mateu-shell-gutter, 2rem);
            padding-right: var(--mateu-shell-gutter, 2rem);
        }

        .page-header-band {
            width: 100%;
            height: var(--mateu-page-band-h, 0);
            background-image: var(--mateu-page-band-image, none);
            background-repeat: repeat-x;
            background-size: auto var(--mateu-page-band-h, 0);
        }

        :host {
            width: 100%;
        }

        .form-content {
            width: 100%;
            min-width: 0;
            display: flex;
            flex-direction: column;
            /* Space the top-level content blocks — full-width bands, @Zones rows and the button bar
               are slotted siblings with no spacing of their own, so e.g. a check-in reservation
               summary band abutted the first section. Floored so @Compact stays dense. */
            gap: max(0.9rem, var(--lumo-space-l));
        }

        /* Embedded (level>0) pages sit inside a host card/drawer — drop the top-level breathing
           room so the host's chrome + these margins don't leave a big empty gap. */
        :host([data-nested]) .form-content {
            gap: var(--lumo-space-s);
        }
        :host([data-nested]) .page-body {
            margin-top: 0;
        }

        .page-body {
            width: 100%;
            /* breathing room between the page header (title + toolbar) and the first section;
               the floor keeps the gap legible under @Compact (which shrinks --lumo-space-l to ~7px) */
            margin-top: max(0.9rem, var(--lumo-space-l));
        }

        .sticky-header {
            position: sticky;
            top: 0;
            z-index: 5;
            background: var(--lumo-base-color);
            padding-bottom: 0.25rem;
        }

        .page-body.with-toc {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 15rem;
            gap: 2rem;
            align-items: start;
        }

        .page-toc {
            position: sticky;
            top: calc(var(--mateu-header-h, 0px) + 0.5rem);
            align-self: start;
            max-height: calc(100vh - 8rem);
            overflow: auto;
            font-size: var(--lumo-font-size-s);
        }

        .page-toc nav {
            display: flex;
            flex-direction: column;
            gap: 0.1rem;
            border-left: 1px solid var(--lumo-contrast-10pct);
            padding-left: 0.25rem;
        }

        .page-toc__item {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.2rem 0.5rem;
            cursor: pointer;
            color: var(--lumo-secondary-text-color);
            border-left: 2px solid transparent;
            margin-left: -0.25rem;
            border-radius: var(--lumo-border-radius-s);
        }

        .page-toc__label {
            flex: 1;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .page-toc__key {
            flex-shrink: 0;
            font-size: var(--lumo-font-size-xxs);
            font-family: var(--lumo-font-family-monospace, monospace);
            color: var(--lumo-tertiary-text-color);
            background: var(--lumo-contrast-5pct);
            border-radius: var(--lumo-border-radius-s);
            padding: 0 0.3rem;
            line-height: 1.4;
            opacity: 0;
            transition: opacity 0.1s;
        }

        .page-toc:hover .page-toc__key,
        .page-toc__item.is-active .page-toc__key {
            opacity: 1;
        }

        .page-toc__item:hover {
            color: var(--lumo-body-text-color);
            background: var(--lumo-contrast-5pct);
        }

        .page-toc__item.is-active {
            color: var(--lumo-primary-text-color);
            border-left-color: var(--lumo-primary-color);
            font-weight: 600;
        }

        @media (max-width: 900px) {
            .page-body.with-toc {
                grid-template-columns: 1fr;
            }
            .page-toc {
                display: none;
            }
        }

        .page-banners {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem 0 0.5rem;
            width: 100%;
            box-sizing: border-box;
        }

        .page-banner {
            width: 100%;
            box-sizing: border-box;
            color: #1a1a1a;
            padding: var(--lumo-space-m, 1rem);
            border-radius: var(--lumo-border-radius-l, 12px);
        }

        .page-banner p {
            margin: 0;
            color: #1a1a1a;
        }

        .banner-close {
            color: #1a1a1a;
            flex-shrink: 0;
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: .875rem;
            line-height: 1;
            padding: .25rem .4rem;
        }

        .page-banner--info {
            background: #e8f4fd;
            border-leftx: 4px solid var(--lumo-primary-color);
        }

        .page-banner--success {
            background: #eafaf1;
            border-leftx: 4px solid var(--lumo-success-color);
        }

        .page-banner--warning {
            background: #fef9e7;
            border-leftx: 4px solid var(--lumo-warning-color, #f59e0b);
        }

        .page-banner--danger {
            background: #fdf2f2;
            border-leftx: 4px solid var(--lumo-error-color);
        }
    `}};O([v()],J.prototype,`component`,void 0),O([v()],J.prototype,`baseUrl`,void 0),O([v()],J.prototype,`state`,void 0),O([v()],J.prototype,`data`,void 0),O([v()],J.prototype,`appState`,void 0),O([v()],J.prototype,`appData`,void 0),O([v()],J.prototype,`value`,void 0),O([v({type:Boolean})],J.prototype,`standalone`,void 0),O([S()],J.prototype,`actionBanners`,void 0),O([S()],J.prototype,`dismissedStaticBannerIndices`,void 0),O([S()],J.prototype,`_tocEntries`,void 0),O([S()],J.prototype,`_activeToc`,void 0),O([S()],J.prototype,`_tocVisible`,void 0),J=O([h(`mateu-page`)],J);var Ga=m`
    .nbtn {
        display: inline-flex;
        align-items: center;
        gap: .35em;
        box-sizing: border-box;
        margin: 0;
        border: none;
        border-radius: var(--lumo-border-radius-m, 4px);
        padding: 0 calc(var(--lumo-space-s, .5rem) + 2px);
        height: var(--lumo-size-s, 1.75rem);
        font-family: inherit;
        font-size: var(--lumo-font-size-s, .875rem);
        font-weight: 500;
        line-height: 1;
        cursor: pointer;
        white-space: nowrap;
        background: transparent;
        color: var(--lumo-primary-text-color, #1676f3);
        transition: background-color .1s;
    }
    .nbtn:hover { background: var(--lumo-primary-color-10pct, rgba(22, 118, 243, .1)); }
    .nbtn:disabled { cursor: default; opacity: .5; background: transparent; }
    .nbtn.primary {
        background: var(--lumo-primary-color, #1676f3);
        color: var(--lumo-primary-contrast-color, #fff);
    }
    .nbtn.primary:hover { background: var(--lumo-primary-color, #1676f3); filter: brightness(1.08); }
    .nbtn svg { width: 1em; height: 1em; flex-shrink: 0; }
`,Ka=e=>C`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,qa=Ka(C`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),Ja=Ka(C`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),Ya=Ka(C`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`);Ka(C`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`);var Xa=Ka(C`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),Za=Ka(C`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`),Qa=[`#e91e63`,`#1676f3`,`#10b981`,`#8b5cf6`,`#f59e0b`,`#ef4444`],$a=e=>Qa[Math.abs(e??0)%Qa.length],eo=e=>(e??`?`).split(/\s+/).filter(e=>e).map(e=>e[0]).slice(0,2).join(``).toUpperCase()||`?`,Y=class extends y{constructor(...e){super(...e),this.localAgentUrl=`http://127.0.0.1:8776`,this.localAgentAlive=!1,this.menu=[],this.chatSessionId=T(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){let t=e,n=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=n,this.send(new CustomEvent(`submit`,{detail:{value:n},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{let e=new AbortController,t=setTimeout(()=>e.abort(),1200),n=await fetch(this.localAgentUrl+`/health`,{signal:e.signal});clearTimeout(t),this.localAgentAlive=n.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{let t=e.target,n=Array.from(t.files??[]);if(t.value=``,!(!n.length||!this.uploadUrl)){this.uploading=!0;try{let e=new FormData;e.append(`sessionId`,this.chatSessionId);for(let t of n)e.append(`files`,t,t.name);let t={},r=localStorage.getItem(`__mateu_auth_token`);r&&(t.Authorization=`Bearer `+r);let i=sessionStorage.getItem(`__mateu_sesion_id`);i&&(t[`X-Session-Id`]=i);let a=await fetch(this.uploadUrl,{method:`POST`,headers:t,body:e});if(!a.ok)throw Error(`Upload failed: ${a.status}`);let o=((await a.json()).files??[]).filter(e=>e&&e.path);this.attachments=[...this.attachments,...o]}catch(e){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${e instanceof Error?e.message:e}`,`agent`)}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute(`disabled`,`disabled`);let t=e.detail.value.trim(),n=this.localAgentAlive?this.localAgentUrl+`/mateu/agent/stream`:this.sseUrl,r=this.attachments;if(!t&&r.length===0||!n)return;let i=r.length?`${t}${t?`

`:``}📎 ${r.map(e=>e.name).join(`, `)}`:t;this.addMessage(i,`user`),this.attachments=[];let a=this.addMessage(``,`agent`);this.startLoading();let o=``;try{let e={Accept:`text/event-stream`,"Content-Type":`application/json`},i=localStorage.getItem(`__mateu_auth_token`);i&&(e.Authorization=`Bearer `+i);let s=sessionStorage.getItem(`__mateu_sesion_id`);s&&(e[`X-Session-Id`]=s);let c=this.contextProvider?.(),l=JSON.stringify({message:t,sessionId:this.chatSessionId,...r.length&&{attachments:r},...c!=null&&{context:c},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;let u=await fetch(n,{method:`POST`,headers:e,body:l});if(!u.ok){let e=await u.text();throw Error(`Servidor respondió ${u.status}: ${e}`)}let d=u.body?.getReader();if(!d)throw Error(`No se pudo obtener el reader del stream.`);let f=new TextDecoder,p=``;for(;;){let{done:e,value:t}=await d.read();if(e){if(p.trim().startsWith(`data:`)){let e=p.trim().slice(5).trim(),t=this.tryParseTokenUsage(e),n=!t&&this.tryParseCustomEvent(e);t?this.tokenUsage={...this.tokenUsage,...t}:n?n.event===`agent-error`?(o=`⚠️ `+(n.detail?.message??`Error desconocido del agente`),this.updateMessage(a,o)):this.dispatchEvent(new CustomEvent(n.event,{detail:n.detail,bubbles:!0,composed:!0})):(o+=e,this.updateMessage(a,o))}break}let n=f.decode(t,{stream:!0});p+=n;let r=p.split(`
`);p=r.pop()||``;let i=!1;for(let e of r)if(e.trim().startsWith(`data:`)){let t=e.trim().slice(5).trim(),n=this.tryParseTokenUsage(t),r=!n&&this.tryParseCustomEvent(t);n?this.tokenUsage={...this.tokenUsage,...n}:r?r.event===`agent-error`?(o=`⚠️ `+(r.detail?.message??`Error desconocido del agente`),this.updateMessage(a,o)):this.dispatchEvent(new CustomEvent(r.event,{detail:r.detail,bubbles:!0,composed:!0})):(o+=t+`
`,i=!0)}i&&this.updateMessage(a,o)}o||this.updateMessage(a,`⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).`)}catch(e){console.error(`Error en el flujo SSE:`,e);let t=e?.message??String(e);(t===`Failed to fetch`||t===`network error`||t===`Load failed`)&&!o?this.updateMessage(a,`⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible.`):this.updateMessage(a,`⚠️ Error: `+t)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value=``)},250),this.messageInputElement?.removeAttribute(`disabled`),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent(`close-requested`,{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{let e=this.messageInputElement?.value?.trim()??``;e&&this.send(new CustomEvent(`submit`,{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key===`Enter`&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback(),this.probeLocalAgent();let e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){let t=new e;this.recognition=t,t.lang=`es-ES`,t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=e=>{console.error(`Error de reconocimiento: `+e.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:`smooth`})},0)}addMessage(e,t){let n={text:e,time:new Date().toLocaleTimeString(),userName:t.includes(`agent`)?`Asistente`:`Tú`,userColorIndex:t.includes(`agent`)?2:1};return this.items=[...this.items,n],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((n,r)=>r===e?{...n,text:t}:n),this.scrollBottom()}tryParseCustomEvent(e){let t=e.trim();if(!t.startsWith(`{`))return null;try{let e=JSON.parse(t);if(typeof e.event==`string`)return{event:e.event,detail:e.detail??{}}}catch{}return null}tryParseTokenUsage(e){let t=e.trim();if(!t.startsWith(`{`))return null;try{let e=JSON.parse(t);if(`inputTokens`in e||`outputTokens`in e||`totalTokens`in e)return e}catch{}return null}buildMenuContext(e,t=[]){let n=[];for(let r of e){if(r.separator||r.remote)continue;let e=[...t,r.label];if(r.submenus&&r.submenus.length>0)n.push(...this.buildMenuContext(r.submenus,e));else{let t={path:e,navigation:{route:r.route,consumedRoute:r.consumedRoute,actionId:r.actionId??``,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix}};r.description&&(t.description=r.description),n.push(t)}}return n}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return w`
            <div class="chat-container">
                <div class="chat-header">
                    <span class="chat-title">AI Assistant</span>
                    ${this.localAgentAlive?w`<span class="local-agent-badge" title="Hablando con tu CLI local (companion en ${this.localAgentUrl}) — sin api key">agente local</span>`:_}
                    <button class="chat-icon-btn" @click="${this.toggleExpanded}"
                            title="${this.expanded?`Contraer`:`Expandir a pantalla completa`}"
                            aria-label="${this.expanded?`Contraer el chat`:`Expandir el chat`}">
                        ${this.expanded?`⤡`:`⤢`}
                    </button>
                    <button class="chat-close" @click="${this.closeChat}" title="Cerrar">
                        ${Za}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>w`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${$a(e.userColorIndex)};">${eo(e.userName)}</div>
                                <div class="message-body">
                                    <div class="message-meta">
                                        <span class="message-name">${e.userName}</span>
                                        <span class="message-time">${e.time}</span>
                                    </div>
                                    <mateu-markdown class="message-text" .content="${e.text??``}"></mateu-markdown>
                                </div>
                            </div>
                        `)}
                    </div>
                </div>
                ${this.tokenUsage?w`
                    <div class="token-bar">
                        <span class="token-label">Tokens:</span>
                        ${this.tokenUsage.inputTokens==null?_:w`<span class="token-chip">in&nbsp;<strong>${this.tokenUsage.inputTokens}</strong></span>`}
                        ${this.tokenUsage.outputTokens==null?_:w`<span class="token-chip">out&nbsp;<strong>${this.tokenUsage.outputTokens}</strong></span>`}
                        ${this.tokenUsage.totalTokens==null?_:w`<span class="token-chip">total&nbsp;<strong>${this.tokenUsage.totalTokens}</strong></span>`}
                    </div>
                `:_}
                ${this.loading?w`
                    <div class="loading-bar">
                        <span class="spinner"></span>
                        <span class="loading-text">Thinking… ${this.elapsedSeconds}s</span>
                    </div>
                `:_}
                ${this.attachments.length?w`
                    <div class="attachments">
                        ${this.attachments.map(e=>w`
                            <span class="attachment-chip" title="${e.path}">
                                📎 ${e.name}
                                <button class="attachment-remove" @click="${()=>this.removeAttachment(e.path)}" aria-label="Quitar ${e.name}">✕</button>
                            </span>`)}
                    </div>
                `:_}
                <div class="input-bar">
                    ${this.uploadUrl?w`
                        <button class="mic-btn" title="Adjuntar ficheros"
                                @click="${this.pickFiles}" ?disabled="${this.uploading}"
                                aria-label="Adjuntar ficheros">${this.uploading?`…`:`📎`}</button>
                        <input class="file-input" type="file" multiple hidden
                               @change="${this.onFilesPicked}"/>
                    `:_}
                    <button class="mic-btn"
                            title="Dictar"
                            style="color: ${this.listening?`red`:`var(--lumo-contrast-50pct, #767676)`};"
                            @click="${this.startListening}"
                            ?disabled="${!this.recognitionAvailable}"
                    >${Xa}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}static{this.styles=[Ga,m`
        :host {
            display: block;
            height: 100%;
        }

        /* Full-screen: the panel leaves its side slot and covers the whole viewport, so the
           conversation is all there is. Toggled from the header expand button. */
        :host([expanded]) {
            position: fixed;
            inset: 0;
            width: 100vw !important;
            max-width: none !important;
            height: 100vh;
            z-index: 1000;
            border-left: none !important;
        }
        :host([expanded]) .message-list,
        :host([expanded]) .input-bar,
        :host([expanded]) .attachments,
        :host([expanded]) .token-bar,
        :host([expanded]) .loading-bar {
            max-width: 820px;
            margin-left: auto;
            margin-right: auto;
            width: 100%;
            box-sizing: border-box;
        }

        .chat-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: var(--lumo-base-color, #fff);
        }

        .chat-icon-btn {
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 15px;
            line-height: 1;
            color: var(--lumo-contrast-60pct, #6b6b6b);
            padding: 4px 6px;
            border-radius: 6px;
        }
        .chat-icon-btn:hover {
            background: var(--lumo-contrast-10pct, #eee);
            color: var(--lumo-body-text-color, #222);
        }

        .attachments {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            padding: 6px 12px 0;
        }
        .attachment-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font: 500 12px ui-sans-serif, system-ui, sans-serif;
            background: var(--lumo-contrast-10pct, #eef1f4);
            color: var(--lumo-body-text-color, #222);
            border-radius: 999px;
            padding: 3px 6px 3px 10px;
            max-width: 220px;
        }
        .attachment-chip > :not(.attachment-remove) {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .attachment-remove {
            border: none;
            background: transparent;
            cursor: pointer;
            color: var(--lumo-contrast-60pct, #767676);
            font-size: 11px;
            line-height: 1;
            padding: 2px 4px;
            border-radius: 50%;
        }
        .attachment-remove:hover { background: var(--lumo-contrast-20pct, #dcdcdc); }

        .local-agent-badge {
            font: 600 10px ui-sans-serif, system-ui, sans-serif;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #047857;
            background: #d1fae5;
            border-radius: 999px;
            padding: 2px 8px;
            margin-left: 8px;
            cursor: default;
        }

        .chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem 0.75rem 0.5rem 1rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            flex-shrink: 0;
        }

        .chat-title {
            font-size: var(--lumo-font-size-s, .875rem);
            font-weight: 600;
            color: var(--lumo-secondary-text-color, #555);
        }

        .chat-close {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--lumo-secondary-text-color, #555);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.25rem;
            border-radius: var(--lumo-border-radius-s, 4px);
            line-height: 1;
        }

        .chat-close svg {
            width: 1rem;
            height: 1rem;
        }

        .chat-close:hover {
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            color: var(--lumo-body-text-color, #1a1a1a);
        }

        .scroll-container {
            flex: 1;
            overflow-y: auto;
            min-height: 0;
        }

        .message-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            font-size: 12px;
        }

        .message {
            display: flex;
            gap: 0.5rem;
            align-items: flex-start;
        }

        .avatar {
            width: 1.75rem;
            height: 1.75rem;
            border-radius: 50%;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 0.65rem;
            font-weight: 600;
            user-select: none;
        }

        .message-body {
            flex: 1;
            min-width: 0;
        }

        .message-meta {
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
        }

        .message-name {
            font-weight: 600;
            color: var(--lumo-body-text-color, #1a1a1a);
        }

        .message-time {
            font-size: 0.7rem;
            color: var(--lumo-tertiary-text-color, #888);
        }

        .message-text {
            color: var(--lumo-body-text-color, #1a1a1a);
            overflow-wrap: anywhere;
        }

        .message-text img,
        .message-text svg {
            max-width: 100%;
            height: auto;
            display: block;
            border-radius: 8px;
        }

        .message-text > :first-child {
            margin-top: 0.15rem;
        }

        .message-text > :last-child {
            margin-bottom: 0;
        }

        .input-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            flex-shrink: 0;
        }

        .mic-btn {
            background: none;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.35rem;
            border-radius: var(--lumo-border-radius-s, 4px);
            line-height: 1;
        }

        .mic-btn svg {
            width: 1.1rem;
            height: 1.1rem;
        }

        .mic-btn:hover:not(:disabled) {
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
        }

        .mic-btn:disabled {
            cursor: default;
            opacity: .4;
        }

        .msg-input {
            flex: 1;
            min-width: 0;
            box-sizing: border-box;
            height: var(--lumo-size-m, 2.25rem);
            padding: 0 0.75rem;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, .2));
            border-radius: var(--lumo-border-radius-m, 4px);
            background: var(--lumo-base-color, #fff);
            color: var(--lumo-body-text-color, #1a1a1a);
            font-family: inherit;
            font-size: var(--lumo-font-size-s, .875rem);
            outline: none;
        }

        .msg-input:focus {
            border-color: var(--lumo-primary-color, #1676f3);
        }

        .msg-input:disabled {
            opacity: .5;
        }

        .token-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 1rem;
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .04));
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #555);
            flex-wrap: wrap;
        }

        .token-label {
            font-weight: 600;
            color: var(--lumo-tertiary-text-color, #888);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .token-chip {
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            border-radius: var(--lumo-border-radius-s, 4px);
            padding: 0.1rem 0.4rem;
            font-variant-numeric: tabular-nums;
        }

        .loading-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 1rem;
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .04));
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #555);
        }

        .loading-text {
            font-variant-numeric: tabular-nums;
        }

        .spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, .2));
            border-top-color: var(--lumo-primary-color, #1676f3);
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
            flex-shrink: 0;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `]}};O([v({attribute:!1})],Y.prototype,`contextProvider`,void 0),O([v()],Y.prototype,`localAgentUrl`,void 0),O([v({attribute:!1})],Y.prototype,`mcpUrl`,void 0),O([S()],Y.prototype,`localAgentAlive`,void 0),O([v()],Y.prototype,`sseUrl`,void 0),O([v()],Y.prototype,`uploadUrl`,void 0),O([v({attribute:!1})],Y.prototype,`menu`,void 0),O([S()],Y.prototype,`attachments`,void 0),O([S()],Y.prototype,`uploading`,void 0),O([b(`.file-input`)],Y.prototype,`fileInputElement`,void 0),O([v({type:Boolean,reflect:!0})],Y.prototype,`expanded`,void 0),O([v()],Y.prototype,`items`,void 0),O([b(`.scroll-container`)],Y.prototype,`scrollContainer`,void 0),O([b(`.msg-input`)],Y.prototype,`messageInputElement`,void 0),O([S()],Y.prototype,`recognition`,void 0),O([S()],Y.prototype,`listening`,void 0),O([S()],Y.prototype,`recognitionAvailable`,void 0),O([S()],Y.prototype,`loading`,void 0),O([S()],Y.prototype,`elapsedSeconds`,void 0),O([S()],Y.prototype,`tokenUsage`,void 0),Y=O([h(`mateu-chat`)],Y);var to=class extends y{updated(e){super.updated(e),this.chart&&=(this.chart.destroy(),void 0),this.data&&this.createChart(this.data)}async createChart(e){let[{default:t}]=await Promise.all([E(()=>import(`./vendor-chartjs.js`).then(e=>e.n),__vite__mapDeps([3,1])),E(()=>import(`./vendor-chartjs.js`).then(e=>e.t),__vite__mapDeps([3,1]))]);if(e!==this.data)return;this.chart&&this.chart.destroy();let n={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,n)}handleSlotChange(){}render(){return w`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}static{this.styles=m`
    /* the host's inline height (Chart.style) must reach the canvas parent — chart.js
       measures .container to size the canvas when maintainAspectRatio is false */
    :host {
        display: block;
    }
    .container {
        height: 100%;
        position: relative;
    }
  `}};O([v()],to.prototype,`type`,void 0),O([v()],to.prototype,`data`,void 0),O([v()],to.prototype,`options`,void 0),O([b(`#chart`)],to.prototype,`chartElement`,void 0),to=O([h(`mateu-chart`)],to);var no=class extends y{updated(e){super.updated(e),this.chart&&=(this.chart.destroy(),void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){let{default:t}=await E(async()=>{let{default:e}=await import(`./vendor-diagrams.js`).then(e=>e.t);return{default:e}},__vite__mapDeps([4,1,2]));if(e!==this.xml)return;this.chart&&this.chart.destroy();let n={container:this.divElement};this.chart=new t(n),this.chart.importXML(e)}handleSlotChange(){}render(){return w`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}static{this.styles=m`
  `}};O([v()],no.prototype,`xml`,void 0),O([b(`#canvas`)],no.prototype,`divElement`,void 0),no=O([h(`mateu-bpmn`)],no);var ro=160,io=56,ao=220,oo=110,so=60,co={ACTION:`#3B82F6`,JOIN:`#8B5CF6`,FORK:`#F59E0B`,END:`#EF4444`,USER_TASK:`#10B981`,PROCESS:`#6366F1`},lo={ACTION:`▶`,JOIN:`⟨`,FORK:`⟩`,END:`◼`,USER_TASK:`👤`,PROCESS:`⚙`},uo=[`ACTION`,`JOIN`,`FORK`,`END`,`USER_TASK`,`PROCESS`];function fo(){return`step-`+Math.random().toString(36).slice(2,8)}var po=class extends y{constructor(...e){super(...e),this.value=`{"name":"New Workflow","steps":[]}`,this.wf={name:`New Workflow`,steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;let t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener(`mousemove`,this.onMouseMove),window.removeEventListener(`mouseup`,this.onMouseUp)}}updated(e){if(e.has(`value`)){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){let e=this.wf.steps??[],t={};e.forEach(e=>{t[e.id]=0});let n=!0;for(;n;)n=!1,e.forEach(e=>{if(e.preconditionStepId!=null&&t[e.preconditionStepId]!==void 0){let r=t[e.preconditionStepId]+1;r>t[e.id]&&(t[e.id]=r,n=!0)}});let r={};e.forEach(e=>{let n=t[e.id]??0;(r[n]??=[]).push(e.id)});let i={...this.positions},a=!1;Object.entries(r).forEach(([e,t])=>{let n=Number(e);t.forEach((e,t)=>{i[e]||(i[e]={x:so+n*ao,y:so+t*oo},a=!0)})}),a&&(this.positions=i)}emit(){let e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(n=>n.id===e?{...n,...t}:n)},this.emit()}addStep(){let e=fo(),t={id:e,type:`ACTION`,name:`New Step`};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};let n=Object.values(this.positions).map(e=>e.y),r=n.length?Math.max(...n)+oo:so;this.positions={...this.positions,[e]:{x:so,y:r}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(t=>t.id!==e).map(t=>t.preconditionStepId===e?{...t,preconditionStepId:void 0}:t)};let{[e]:t,...n}=this.positions;this.positions=n,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;let n=this.positions[t]??{x:0,y:0},r=this.toSvgPoint(e);this.dragOffset={x:r.x-n.x,y:r.y-n.y},this.svgEl=e.currentTarget.closest(`svg`),window.addEventListener(`mousemove`,this.onMouseMove),window.addEventListener(`mouseup`,this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};let t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){let e=Object.values(this.positions),t=e.length?Math.max(...e.map(e=>e.x))+ro+so:600,n=e.length?Math.max(...e.map(e=>e.y))+io+so:400;return{w:Math.max(t,600),h:Math.max(n,400)}}render(){let{w:e,h:t}=this.canvasSize(),n=this.wf.steps??[];return w`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():``}
                <div class="workspace">
                    <div class="canvas-wrap">
                        <svg width="${e}" height="${t}" class="canvas"
                             @click="${e=>{e.target===e.currentTarget&&(this.selectedId=null)}}">
                            <defs>
                                <marker id="arrow" markerWidth="8" markerHeight="8"
                                        refX="6" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/>
                                </marker>
                            </defs>
                            ${n.map(e=>this.renderArrow(e))}
                            ${n.map(e=>this.renderNode(e))}
                        </svg>
                    </div>
                    ${this.selectedId?this.renderPanel():``}
                </div>
            </div>
        `}renderToolbar(){let e=this.wf.status??`DRAFT`;return w`
            <div class="toolbar">
                <span class="wf-name">${this.wf.name}</span>
                <span class="badge badge-${e.toLowerCase()}">${e}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${qa}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${Ja}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Ya}
                    Export
                </button>
            </div>
        `}renderMeta(){let e=this.wf;return w`
            <div class="meta-panel">
                <div class="meta-grid">
                    <label>Name</label>
                    <input class="inp" .value="${e.name}" @change="${e=>this.updateWf({name:e.target.value})}"/>
                    <label>Description</label>
                    <textarea class="inp" rows="2" @change="${e=>this.updateWf({description:e.target.value})}">${e.description??``}</textarea>
                    <label>Status</label>
                    <select class="inp" @change="${e=>this.updateWf({status:e.target.value})}">
                        ${[`DRAFT`,`ACTIVE`,`DISABLED`,`ARCHIVED`].map(t=>w`
                            <option value="${t}" ?selected="${e.status===t}">${t}</option>`)}
                    </select>
                    <label>Limit concurrent</label>
                    <input type="checkbox" ?checked="${e.limitConcurrentExecutions}"
                           @change="${e=>this.updateWf({limitConcurrentExecutions:e.target.checked})}"/>
                    ${e.limitConcurrentExecutions?w`
                        <label>Max concurrent</label>
                        <input class="inp" type="number" min="0" .value="${String(e.maxConcurrentExecutions??0)}"
                               @change="${e=>this.updateWf({maxConcurrentExecutions:Number(e.target.value)})}"/>
                        <label>Enqueue on limit</label>
                        <input type="checkbox" ?checked="${e.enqueueOnLimit}"
                               @change="${e=>this.updateWf({enqueueOnLimit:e.target.checked})}"/>
                    `:``}
                </div>
            </div>
        `}renderArrow(e){if(!e.preconditionStepId)return C``;let t=this.positions[e.preconditionStepId],n=this.positions[e.id];if(!t||!n)return C``;let r=t.x+ro,i=t.y+io/2,a=n.x,o=n.y+io/2,s=(r+a)/2;return C`
            <path d="M${r},${i} C${s},${i} ${s},${o} ${a},${o}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){let t=this.positions[e.id]??{x:so,y:so},n=co[e.type]??`#64748b`,r=lo[e.type]??`•`,i=this.selectedId===e.id;return C`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${t=>this.onNodeMouseDown(t,e.id)}"
               @click="${t=>{t.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${ro}" height="${io}" rx="8"
                      fill="white"
                      stroke="${i?n:`#e2e8f0`}"
                      stroke-width="${i?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${io}" rx="8" fill="${n}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${io}" fill="${n}"/>
                <text x="16" y="${33}" text-anchor="middle"
                      font-size="14" fill="white">${r}</text>
                <!-- name -->
                <text x="44" y="${io/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+`…`:e.name}
                </text>
                <text x="44" y="${36}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${48}" font-size="9" fill="${n}">${e.type}</text>
            </g>
        `}renderPanel(){let e=this.wf.steps.find(e=>e.id===this.selectedId);if(!e)return``;let t=this.wf.steps.filter(t=>t.id!==e.id),n=(e,t)=>w`
            <div class="field">
                <label class="field-label">${e}</label>
                ${t}
            </div>
        `;return w`
            <div class="properties">
                <div class="prop-header">
                    <span>Step Properties</span>
                    <button class="del-btn" title="Delete step"
                            @click="${()=>this.deleteStep(e.id)}">🗑</button>
                    <button class="close-btn" @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${n(`ID`,w`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${n(`Name`,w`<input class="inp" .value="${e.name}"
                        @change="${t=>this.updateStep(e.id,{name:t.target.value})}"/>`)}
                    ${n(`Type`,w`
                        <select class="inp" @change="${t=>this.updateStep(e.id,{type:t.target.value})}">
                            ${uo.map(t=>w`<option value="${t}" ?selected="${e.type===t}">${t}</option>`)}
                        </select>`)}
                    ${n(`Description`,w`<textarea class="inp" rows="2"
                        @change="${t=>this.updateStep(e.id,{description:t.target.value})}">${e.description??``}</textarea>`)}
                    ${n(`Precondition step`,w`
                        <select class="inp" @change="${t=>this.updateStep(e.id,{preconditionStepId:t.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(t=>w`<option value="${t.id}" ?selected="${e.preconditionStepId===t.id}">${t.name} (${t.id})</option>`)}
                        </select>`)}
                    ${n(`Precondition expression`,w`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??``}"
                        @change="${t=>this.updateStep(e.id,{preconditionExpression:t.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${t=>this.updateStep(e.id,{parallel:t.target.checked})}"/>
                    </div>
                    ${n(`Timeout (ms)`,w`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${t=>this.updateStep(e.id,{timeout:Number(t.target.value)})}"/>`)}
                    ${n(`Retries`,w`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${t=>this.updateStep(e.id,{retries:Number(t.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${t=>this.updateStep(e.id,{rollbackable:t.target.checked})}"/>
                    </div>
                    ${e.rollbackable?n(`Compensation step`,w`
                        <select class="inp" @change="${t=>this.updateStep(e.id,{compensationStepId:t.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(t=>w`<option value="${t.id}" ?selected="${e.compensationStepId===t.id}">${t.name} (${t.id})</option>`)}
                        </select>`):``}

                    ${e.type===`ACTION`?n(`Topic`,w`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??``}"
                        @change="${t=>this.updateStep(e.id,{topic:t.target.value||void 0})}"/>`):``}
                    ${e.type===`USER_TASK`?n(`Form ID`,w`<input class="inp"
                        .value="${e.formId??``}"
                        @change="${t=>this.updateStep(e.id,{formId:t.target.value||void 0})}"/>`):``}
                    ${e.type===`PROCESS`?n(`Child workflow ID`,w`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??``}"
                        @change="${t=>this.updateStep(e.id,{childWorkflowDefinitionId:t.target.value||void 0})}"/>`):``}
                </div>
            </div>
        `}exportJson(){let e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=(this.wf.name??`workflow`).replace(/\s+/g,`-`).toLowerCase()+`.json`,r.click(),URL.revokeObjectURL(n)}static{this.styles=[Ga,m`
        :host { display: block; height: 100%; font-family: var(--lumo-font-family, sans-serif); }

        .root { display: flex; flex-direction: column; height: 100%; background: var(--lumo-base-color, #fff); }

        /* toolbar */
        .toolbar {
            display: flex; align-items: center; gap: .5rem;
            padding: .5rem 1rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            background: var(--lumo-base-color, #fff);
            flex-shrink: 0;
        }
        .wf-name { font-weight: 600; font-size: 1rem; color: var(--lumo-body-text-color, #1e293b); }
        .badge {
            font-size: .7rem; font-weight: 600; padding: .15rem .5rem;
            border-radius: 9999px; text-transform: uppercase; letter-spacing: .04em;
        }
        .badge-draft    { background: #e2e8f0; color: #475569; }
        .badge-active   { background: #dcfce7; color: #166534; }
        .badge-disabled { background: #fef9c3; color: #854d0e; }
        .badge-archived { background: #fee2e2; color: #991b1b; }

        /* meta */
        .meta-panel {
            padding: .75rem 1rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            background: var(--lumo-contrast-5pct, #f8fafc);
            flex-shrink: 0;
        }
        .meta-grid { display: grid; grid-template-columns: 120px 1fr; gap: .4rem .75rem; align-items: start; }
        .meta-grid label { font-size: .8rem; color: #64748b; padding-top: .3rem; }

        /* workspace */
        .workspace { display: flex; flex: 1; overflow: hidden; }
        .canvas-wrap { flex: 1; overflow: auto; background: #f8fafc; }
        .canvas { display: block; }

        /* properties panel */
        .properties {
            width: 280px; flex-shrink: 0;
            border-left: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            display: flex; flex-direction: column;
            background: var(--lumo-base-color, #fff);
        }
        .prop-header {
            display: flex; align-items: center;
            padding: .6rem .75rem;
            font-size: .85rem; font-weight: 600;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            gap: .4rem;
        }
        .prop-header span { flex: 1; }
        .del-btn, .close-btn {
            background: none; border: none; cursor: pointer;
            font-size: .95rem; padding: .1rem .3rem; border-radius: 4px;
            line-height: 1;
        }
        .del-btn:hover { background: #fee2e2; }
        .close-btn:hover { background: #f1f5f9; }
        .prop-body { flex: 1; overflow-y: auto; padding: .75rem; display: flex; flex-direction: column; gap: .6rem; }

        /* fields */
        .field { display: flex; flex-direction: column; gap: .2rem; }
        .field.row { flex-direction: row; align-items: center; gap: .5rem; }
        .field-label { font-size: .75rem; color: #64748b; font-weight: 500; }
        .inp {
            width: 100%; box-sizing: border-box;
            padding: .3rem .5rem;
            border: 1px solid #e2e8f0; border-radius: 6px;
            font-size: .82rem; color: #1e293b;
            background: #fff; outline: none;
            font-family: inherit;
            transition: border-color .15s;
        }
        .inp:focus { border-color: #3B82F6; }
        textarea.inp { resize: vertical; }
        input[readonly].inp { background: #f8fafc; color: #94a3b8; }
    `]}};O([v()],po.prototype,`value`,void 0),O([S()],po.prototype,`wf`,void 0),O([S()],po.prototype,`positions`,void 0),O([S()],po.prototype,`selectedId`,void 0),O([S()],po.prototype,`showMeta`,void 0),po=O([h(`mateu-workflow`)],po);var mo=[`string`,`integer`,`number`,`bool`,`date`,`time`,`dateTime`,`dateRange`,`money`,`file`,`array`,`status`,`component`,`menu`,`range`,`action`,`actionGroup`],ho=[`regular`,`radio`,`checkbox`,`textarea`,`toggle`,`combobox`,`select`,`email`,`password`,`richText`,`listBox`,`html`,`markdown`,`image`,`icon`,`link`,`money`,`grid`,`color`,`choice`,`popover`,`slider`,`button`,`stars`],go={string:`#3B82F6`,integer:`#8B5CF6`,number:`#6366F1`,bool:`#10B981`,date:`#F59E0B`,time:`#F59E0B`,dateTime:`#F59E0B`,dateRange:`#F59E0B`,money:`#EF4444`,file:`#64748B`,array:`#0EA5E9`,status:`#EC4899`,component:`#14B8A6`,menu:`#94A3B8`,range:`#A855F7`,action:`#F97316`,actionGroup:`#FB923C`};function _o(){return`field-`+Math.random().toString(36).slice(2,8)}var vo=class extends y{constructor(...e){super(...e),this.value=`{"name":"New Form","fields":[]}`,this.form={name:`New Form`,fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has(`value`))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){let e=this.shadowRoot?.querySelector(`.field-list`);!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=ce.create(e,{animation:150,handle:`.drag-handle`,ghostClass:`sortable-ghost`,onEnd:e=>{let{oldIndex:t,newIndex:n}=e;if(t===void 0||n===void 0||t===n)return;let r=[...this.form.fields],[i]=r.splice(t,1);r.splice(n,0,i),this.form={...this.form,fields:r},this.emit()}}))}emit(){let e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(n=>n.id===e?{...n,...t}:n)},this.emit()}addField(){let e=_o(),t={id:e,label:`New Field`,dataType:`string`};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){let t=this.form.fields.find(t=>t.id===e);if(!t)return;let n={...t,id:_o(),label:t.label+` (copy)`},r=this.form.fields.findIndex(t=>t.id===e),i=[...this.form.fields];i.splice(r+1,0,n),this.form={...this.form,fields:i},this.selectedId=n.id,this.emit()}render(){return w`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():_}
                <div class="workspace">
                    ${this.renderList()}
                    ${this.selectedId?this.renderPanel():_}
                </div>
            </div>
        `}renderToolbar(){return w`
            <div class="toolbar">
                <span class="form-name">${this.form.name}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${qa}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${Ja}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Ya}
                    Export
                </button>
            </div>
        `}renderMeta(){let e=this.form;return w`
            <div class="meta-panel">
                <div class="meta-grid">
                    <label>Name</label>
                    <input class="inp" .value="${e.name}"
                           @change="${e=>this.updateForm({name:e.target.value})}"/>
                    <label>Description</label>
                    <textarea class="inp" rows="2"
                              @change="${e=>this.updateForm({description:e.target.value})}">${e.description??``}</textarea>
                </div>
            </div>
        `}renderList(){let e=this.form.fields;return w`
            <div class="list-wrap">
                ${e.length===0?w`
                    <div class="empty">
                        No fields yet. Click <strong>Add Field</strong> to start.
                    </div>`:_}
                <div class="field-list">
                    ${e.map(e=>this.renderRow(e))}
                </div>
            </div>
        `}renderRow(e){let t=go[e.dataType]??`#64748b`;return w`
            <div role="button" tabindex="0" class="field-row ${this.selectedId===e.id?`selected`:``}"
                 data-id="${e.id}"
                 @click="${()=>this.selectedId=this.selectedId===e.id?null:e.id}" @keydown="${L(()=>this.selectedId=this.selectedId===e.id?null:e.id)}">
                <span class="drag-handle" title="Drag to reorder">⠿</span>
                <span class="type-badge" style="background:${t}">${e.dataType}</span>
                <span class="field-label-text">${e.label}</span>
                <span class="field-id-text">${e.id}</span>
                ${e.required?w`<span class="required-badge">required</span>`:_}
                ${e.stereotype&&e.stereotype!==`regular`?w`<span class="stereo-badge">${e.stereotype}</span>`:_}
                <div style="flex:1"></div>
                <button class="row-btn" title="Duplicate"
                        @click="${t=>{t.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${t=>{t.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){let e=this.form.fields.find(e=>e.id===this.selectedId);if(!e)return _;let t=(e,t)=>w`
            <div class="prop-field">
                <label class="prop-label">${e}</label>
                ${t}
            </div>
        `;return w`
            <div class="properties">
                <div class="prop-header">
                    <span>Field Properties</span>
                    <button class="close-btn" @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${t(`ID`,w`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${t(`Label`,w`
                        <input class="inp" .value="${e.label}"
                               @change="${t=>this.updateField(e.id,{label:t.target.value})}"/>`)}
                    ${t(`Data type`,w`
                        <select class="inp"
                                @change="${t=>this.updateField(e.id,{dataType:t.target.value})}">
                            ${mo.map(t=>w`
                                <option value="${t}" ?selected="${e.dataType===t}">${t}</option>`)}
                        </select>`)}
                    ${t(`Stereotype`,w`
                        <select class="inp"
                                @change="${t=>this.updateField(e.id,{stereotype:t.target.value||void 0})}">
                            ${ho.map(t=>w`
                                <option value="${t}" ?selected="${(e.stereotype??`regular`)===t}">${t}</option>`)}
                        </select>`)}
                    <div class="prop-field row">
                        <label class="prop-label">Required</label>
                        <input type="checkbox" ?checked="${e.required}"
                               @change="${t=>this.updateField(e.id,{required:t.target.checked})}"/>
                    </div>
                    ${t(`Description / hint`,w`
                        <textarea class="inp" rows="3"
                                  @change="${t=>this.updateField(e.id,{description:t.target.value||void 0})}">${e.description??``}</textarea>`)}
                </div>
            </div>
        `}exportJson(){let e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=(this.form.name??`form`).replace(/\s+/g,`-`).toLowerCase()+`.json`,r.click(),URL.revokeObjectURL(n)}static{this.styles=[Ga,R,m`
        :host { display: block; height: 100%; font-family: var(--lumo-font-family, sans-serif); }

        .root { display: flex; flex-direction: column; height: 100%; background: var(--lumo-base-color, #fff); }

        /* toolbar */
        .toolbar {
            display: flex; align-items: center; gap: .5rem;
            padding: .5rem 1rem; flex-shrink: 0;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
        }
        .form-name { font-weight: 600; font-size: 1rem; color: var(--lumo-body-text-color, #1e293b); }

        /* meta panel */
        .meta-panel {
            padding: .75rem 1rem; flex-shrink: 0;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            background: var(--lumo-contrast-5pct, #f8fafc);
        }
        .meta-grid { display: grid; grid-template-columns: 100px 1fr; gap: .4rem .75rem; align-items: start; }
        .meta-grid label { font-size: .8rem; color: #64748b; padding-top: .3rem; }

        /* workspace */
        .workspace { display: flex; flex: 1; overflow: hidden; }

        /* field list */
        .list-wrap { flex: 1; overflow-y: auto; padding: .75rem; }
        .empty {
            text-align: center; color: #94a3b8; padding: 3rem 1rem;
            font-size: .9rem; border: 2px dashed #e2e8f0; border-radius: 8px;
        }

        .field-list { display: flex; flex-direction: column; gap: .4rem; }

        .field-row {
            display: flex; align-items: center; gap: .5rem;
            padding: .5rem .75rem; border-radius: 8px; cursor: pointer;
            border: 1.5px solid #e2e8f0; background: #fff;
            transition: border-color .15s, box-shadow .15s;
            user-select: none;
        }
        .field-row:hover { border-color: #94a3b8; box-shadow: 0 1px 4px #0000000d; }
        .field-row.selected { border-color: #3B82F6; box-shadow: 0 0 0 2px #3B82F620; }

        /* sortablejs ghost */
        .sortable-ghost { opacity: .35; background: #dbeafe !important; }

        .drag-handle {
            cursor: grab; color: #cbd5e1; font-size: 1.1rem; flex-shrink: 0;
            padding: 0 .1rem;
        }
        .drag-handle:active { cursor: grabbing; }

        .type-badge {
            font-size: .65rem; font-weight: 700; padding: .15rem .45rem;
            border-radius: 9999px; color: #fff; text-transform: uppercase;
            letter-spacing: .03em; flex-shrink: 0;
        }
        .required-badge {
            font-size: .65rem; font-weight: 600; padding: .15rem .4rem;
            border-radius: 9999px; background: #fee2e2; color: #991b1b;
            flex-shrink: 0;
        }
        .stereo-badge {
            font-size: .65rem; font-weight: 600; padding: .15rem .4rem;
            border-radius: 9999px; background: #ede9fe; color: #6d28d9;
            flex-shrink: 0;
        }
        .field-label-text { font-size: .875rem; font-weight: 600; color: #1e293b; }
        .field-id-text { font-size: .75rem; color: #94a3b8; }

        .row-btn {
            background: none; border: none; cursor: pointer;
            font-size: .9rem; padding: .15rem .3rem; border-radius: 4px; line-height: 1;
            color: #94a3b8; flex-shrink: 0;
        }
        .row-btn:hover { background: #f1f5f9; color: #475569; }
        .row-btn.danger:hover { background: #fee2e2; color: #b91c1c; }

        /* properties panel */
        .properties {
            width: 280px; flex-shrink: 0;
            border-left: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            display: flex; flex-direction: column;
            background: var(--lumo-base-color, #fff);
        }
        .prop-header {
            display: flex; align-items: center; gap: .4rem;
            padding: .6rem .75rem; font-size: .85rem; font-weight: 600;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
        }
        .prop-header span { flex: 1; }
        .close-btn {
            background: none; border: none; cursor: pointer;
            font-size: .95rem; padding: .1rem .3rem; border-radius: 4px; line-height: 1;
        }
        .close-btn:hover { background: #f1f5f9; }
        .prop-body {
            flex: 1; overflow-y: auto; padding: .75rem;
            display: flex; flex-direction: column; gap: .6rem;
        }

        /* inputs */
        .prop-field { display: flex; flex-direction: column; gap: .2rem; }
        .prop-field.row { flex-direction: row; align-items: center; gap: .5rem; }
        .prop-label { font-size: .75rem; color: #64748b; font-weight: 500; }
        .inp {
            width: 100%; box-sizing: border-box;
            padding: .3rem .5rem; border: 1px solid #e2e8f0; border-radius: 6px;
            font-size: .82rem; color: #1e293b; background: #fff;
            outline: none; font-family: inherit; transition: border-color .15s;
        }
        .inp:focus { border-color: #3B82F6; }
        textarea.inp { resize: vertical; }
        input[readonly].inp { background: #f8fafc; color: #94a3b8; }
    `]}};O([v()],vo.prototype,`value`,void 0),O([S()],vo.prototype,`form`,void 0),O([S()],vo.prototype,`selectedId`,void 0),O([S()],vo.prototype,`showMeta`,void 0),vo=O([h(`mateu-form-editor`)],vo);var yo=class extends y{constructor(...e){super(...e),this.appState={},this.appData={},this.open=!1,this.activeTab=`appstate`,this.hoveredTag=``,this.hoveredId=``,this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith(`mateu-`)&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline=``,this._prevTarget.style.outlineOffset=``,this._prevTarget=null,this.hoveredTag=``,this.hoveredId=``,this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline=``,this._prevTarget.style.outlineOffset=``),this._prevTarget=t,t.style.outline=`2px solid #0070f3`,t.style.outlineOffset=`-2px`,this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||``,this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener(`mouseover`,this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener(`mouseover`,this._onMouseover,!0),this._prevTarget&&=(this._prevTarget.style.outline=``,null)}_fmt(e){try{return JSON.stringify(e,null,2)??`null`}catch{return String(e)}}_renderTab(e,t){return w`
            <button class="tab ${this.activeTab===e?`tab--active`:``}"
                @click=${()=>{this.activeTab=e}}>
                ${t}
            </button>
        `}render(){return this.open?w`
                <div class="panel">
                    <div class="panel-header">
                        <span class="panel-title">🐛 Mateu Debug</span>
                        <button class="close-btn" @click=${()=>{this.open=!1}}>✕</button>
                    </div>
                    <div class="tabs">
                        ${this._renderTab(`appstate`,`AppState`)}
                        ${this._renderTab(`appdata`,`AppData`)}
                        ${this._renderTab(`inspector`,`Inspector`)}
                    </div>
                    <div class="content">
                        ${this.activeTab===`appstate`?w`
                            <pre class="json">${this._fmt(this.appState)}</pre>
                        `:_}
                        ${this.activeTab===`appdata`?w`
                            <pre class="json">${this._fmt(this.appData)}</pre>
                        `:_}
                        ${this.activeTab===`inspector`?w`
                            ${this.hoveredTag?w`
                                <div class="inspector-tag">&lt;${this.hoveredTag}${this.hoveredId?` id="${this.hoveredId}"`:``}&gt;</div>
                                <div class="section-label">state</div>
                                <pre class="json">${this._fmt(this.hoveredState)}</pre>
                                <div class="section-label">data</div>
                                <pre class="json">${this._fmt(this.hoveredData)}</pre>
                                <div class="section-label">metadata</div>
                                <pre class="json">${this._fmt(this.hoveredMeta)}</pre>
                            `:w`
                                <div class="inspector-hint">Hover a mateu-* element to inspect it</div>
                            `}
                        `:_}
                    </div>
                </div>
            `:w`
            <button class="fab" @click=${()=>{this.open=!0}} title="Mateu Debug">🐛</button>
        `}static{this.styles=m`
        :host {
            position: fixed;
            z-index: 9999;
            font-family: 'Fira Code', 'Cascadia Code', monospace;
            font-size: 13px;
        }
        .fab {
            position: fixed;
            bottom: 1.5rem;
            right: 1.5rem;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: none;
            background: #1e3a5f;
            color: white;
            font-size: 1.4rem;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.15s, box-shadow 0.15s;
            opacity: 0.85;
        }
        .fab:hover {
            transform: scale(1.1);
            opacity: 1;
            box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        }
        .panel {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 400px;
            background: #0f1117;
            color: #d4d4d4;
            display: flex;
            flex-direction: column;
            box-shadow: -6px 0 24px rgba(0,0,0,0.5);
            border-left: 1px solid #2a2a3a;
        }
        .panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 1rem;
            background: #1a1a2e;
            border-bottom: 1px solid #2a2a3a;
            flex-shrink: 0;
        }
        .panel-title {
            font-weight: 600;
            color: #7dd3fc;
            font-size: 0.85rem;
            letter-spacing: 0.03em;
        }
        .close-btn {
            border: none;
            background: transparent;
            color: #888;
            cursor: pointer;
            font-size: 1rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            transition: color 0.15s, background 0.15s;
        }
        .close-btn:hover { color: #fff; background: #333; }
        .tabs {
            display: flex;
            border-bottom: 1px solid #2a2a3a;
            flex-shrink: 0;
            background: #0f1117;
        }
        .tab {
            flex: 1;
            padding: 0.6rem;
            border: none;
            background: transparent;
            color: #666;
            cursor: pointer;
            font-size: 0.75rem;
            font-family: inherit;
            border-bottom: 2px solid transparent;
            transition: color 0.15s;
        }
        .tab:hover { color: #aaa; }
        .tab--active { color: #7dd3fc; border-bottom-color: #0070f3; }
        .content {
            flex: 1;
            overflow-y: auto;
            padding: 0.75rem;
        }
        .content::-webkit-scrollbar { width: 6px; }
        .content::-webkit-scrollbar-track { background: #0f1117; }
        .content::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        .json {
            margin: 0;
            font-size: 0.72rem;
            line-height: 1.6;
            white-space: pre-wrap;
            word-break: break-all;
            color: #a8ff78;
        }
        .inspector-tag {
            font-size: 0.82rem;
            color: #7dd3fc;
            margin-bottom: 0.75rem;
            font-weight: bold;
            background: #1a2a3a;
            padding: 0.4rem 0.6rem;
            border-radius: 4px;
            border-left: 3px solid #0070f3;
        }
        .inspector-hint {
            color: #555;
            font-size: 0.8rem;
            text-align: center;
            margin-top: 3rem;
            line-height: 1.8;
        }
        .section-label {
            font-size: 0.65rem;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin: 1rem 0 0.3rem;
            padding-bottom: 0.25rem;
            border-bottom: 1px solid #2a2a3a;
        }
        .section-label:first-of-type { margin-top: 0; }
    `}};O([v()],yo.prototype,`appState`,void 0),O([v()],yo.prototype,`appData`,void 0),O([S()],yo.prototype,`open`,void 0),O([S()],yo.prototype,`activeTab`,void 0),O([S()],yo.prototype,`hoveredTag`,void 0),O([S()],yo.prototype,`hoveredId`,void 0),O([S()],yo.prototype,`hoveredState`,void 0),O([S()],yo.prototype,`hoveredData`,void 0),O([S()],yo.prototype,`hoveredMeta`,void 0),yo=O([h(`mateu-debug-overlay`)],yo);var bo=function(e){return e.SetAppDataValue=`SetAppDataValue`,e.SetAppStateValue=`SetAppStateValue`,e.SetDataValue=`SetDataValue`,e.RunAction=`RunAction`,e.RunJS=`RunJS`,e.SetAttributeValue=`SetAttributeValue`,e.SetStateValue=`SetStateValue`,e.SetCssClass=`SetCssClass`,e.SetStyle=`SetStyle`,e}({}),xo=function(e){return e.required=`required`,e.disabled=`disabled`,e.hidden=`hidden`,e.pattern=`pattern`,e.minValue=`minValue`,e.maxValue=`maxValue`,e.minLength=`minLength`,e.maxLength=`maxLength`,e.css=`css`,e.style=`style`,e.theme=`theme`,e.errorMessage=`errorMessage`,e.description=`description`,e.none=`none`,e}({}),So=function(e){return e.Continue=`Continue`,e.Stop=`Stop`,e}({}),Co=12e4,wo=(e,t)=>`${e??`_`}::${t}`,To=new class{constructor(){this.started=new Map,this.listeners=new Set}begin(e,t=Date.now()){let n=this.started.get(e);return n!==void 0&&t-n<Co?!1:(this.started.set(e,t),this.emit(),!0)}end(e){this.started.delete(e)&&this.emit()}isPending(e,t=Date.now()){let n=this.started.get(e);return n!==void 0&&t-n<Co}snapshot(){return new Set(this.started.keys())}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}reset(){this.started.clear(),this.emit()}emit(){let e=this.snapshot();this.listeners.forEach(t=>t(e))}},Eo=`data-mateu-pending-styles`,Do=`
[data-mateu-pending] {
    pointer-events: none;
    cursor: progress;
    animation: mateu-pending-pulse 1.1s ease-in-out infinite;
}
/* Respect the user's motion preference: keep the affordance, drop the movement. */
@media (prefers-reduced-motion: reduce) {
    [data-mateu-pending] { animation: none; opacity: .55; }
}
@keyframes mateu-pending-pulse {
    0%, 100% { opacity: .45; }
    50% { opacity: .85; }
}
`,Oo=new WeakSet,ko=e=>{if(Oo.has(e))return;Oo.add(e);let t=e;if(typeof CSSStyleSheet<`u`&&Array.isArray(t.adoptedStyleSheets))try{let e=new CSSStyleSheet;e.replaceSync(Do),t.adoptedStyleSheets=[...t.adoptedStyleSheets,e];return}catch{}let n=e instanceof Document?e.head:e;if(!n)return;let r=document.createElement(`style`);r.setAttribute(Eo,``),r.textContent=Do,n.appendChild(r)},Ao=e=>{let t=e.getRootNode();if(t instanceof ShadowRoot||t instanceof Document)return t},jo=e=>{if(!e||e.hasAttribute(`data-mateu-pending`))return;let t=Ao(e);t&&ko(t),e.setAttribute(`data-mateu-pending`,``),e.setAttribute(`aria-busy`,`true`)},Mo=e=>{e&&(e.removeAttribute(`data-mateu-pending`),e.removeAttribute(`aria-busy`))},No=e=>{let t=(typeof e.composedPath==`function`?e.composedPath():[])[0]??e.target;return t instanceof Element?t:void 0},Po=[`button`,`a[href]`,`[role="button"]`,`[role="menuitem"]`,`input[type="button"]`,`input[type="submit"]`,`vaadin-button`,`vaadin-menu-bar-button`,`ui5-button`,`oj-c-button`,`oj-button`].join(`, `),Fo=e=>{if(!(!e||typeof e.closest!=`function`))return e.closest(Po)??void 0},Io=null,Lo=class extends Sa{constructor(...e){super(...e),this.baseUrl=``,this.route=``,this.consumedRoute=``,this.formerState={},this.applyRules=()=>{let e=this.component.rules;if(e&&e.length>0){let t=this.state,n=this.data,r=this.appState,i=this.appData,a=this.component,o=e=>ot(e,t,n,{appState:r,appData:i,component:a}),s=e=>at(e,t,n,r,i,{component:a}),c=[`state`,`data`,`appState`,`appData`,`component`],l=[t,n,r,i,a],u={...this.state},d={...this.data},f=!1,p=!1;for(let t=0;t<e.length;t++){let n=e[t];try{if(o(n.filter)){if(bo.SetStateValue==n.action||bo.SetDataValue==n.action){let e=bo.SetStateValue==n.action?u:d,t=n.fieldName.split(`,`);for(let r=0;r<t.length;r++){let i=t[r];if(!e[i]||e[i]!=n.value){let t=n.expression?s(n.expression):n.value,r=xo.none==n.fieldAttribute?i:i+`.`+n.fieldAttribute;t!=e[r]&&(e[r]=t,bo.SetStateValue==n.action&&(f=!0),bo.SetDataValue==n.action&&(p=!0))}}}if(bo.RunAction==n.action&&this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.actionId},bubbles:!0,composed:!0})),bo.RunJS==n.action&&Function(...c,n.value)(...l),bo.SetAttributeValue==n.action){let e=n.expression?o(n.expression):n.value;if(n.fieldAttribute==`disabled`){e?this.shadowRoot?.getElementById(n.fieldName)?.setAttribute(n.fieldAttribute,`disabled`):this.shadowRoot?.getElementById(n.fieldName)?.removeAttribute(n.fieldAttribute);continue}this.shadowRoot?.getElementById(n.fieldName)?.setAttribute(n.fieldAttribute,e)}if(bo.SetCssClass==n.action&&this.shadowRoot?.getElementById(n.fieldName)?.setAttribute(`class`,n.value),bo.SetStyle==n.action&&this.shadowRoot?.getElementById(n.fieldName)?.style.setProperty(n.expression,n.value),So.Stop==n.result)break}}catch(e){console.error(`rule failed`,n,e)}}f&&(this.state=u),p&&(this.data=d),f&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes(`-`),this.checkValidations=e=>{let t=e?e.split(`,`):void 0,n=this.component.validations,r=!0,i=!1,a=this.data??{},o={...this.data??{},errors:{}};if(n){for(let e=0;e<n.length;e++){let r=n[e];if(this.skipValidation(t,r))continue;let i=(r.fieldId??`_component`).split(`,`);for(let e=0;e<i.length;e++){let t=i[e];o.errors[t]=[]}}for(let e=0;e<n.length;e++){let i=n[e];if(!this.skipValidation(t,i))try{let e=i.condition&&i.condition.includes("${")?this._evalTemplate(i.condition):this._evalExpr(i.condition);if(i.condition&&!e){r=!1;let e=(i.fieldId??`_component`).split(`,`);for(let t=0;t<e.length;t++){let n=e[t],r=o.errors[n];if(r||(o.errors[n]=[]),r=o.errors[n],!a[n]){let e=i.message;try{e=this._evalTemplate(i.message)}catch{}r.push(e)}}}}catch(e){console.error(`validation failed`,i,e)}}for(let e=0;e<n.length;e++){let r=n[e];if(this.skipValidation(t,r))continue;let s=(r.fieldId??`_component`).split(`,`);for(let e=0;e<s.length;e++){let t=s[e];if((a.errors||o.errors==``)&&[t].join(`,`)){i=!0;break}}}(a.errors||o.errors==``)&&[`_component`].join(`,`)&&(i=!0)}o._valid=r,o._valid!=a._valid&&(i=!0),i&&(this.data=o)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){let t=e.detail,n={};t.fieldIds.forEach(e=>{n[e]=void 0}),n.searchText=void 0,this.state={...this.state,...n}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){let t=e.detail,n={};n[t.key]=t.value,e.type==`data-changed`&&(this.data={...this.data,...n})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){let t=e.detail;if(e.type==`value-changed`){let n={...this.state};n[t.fieldId]=t.value,this.state=n,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent(`dirty`,{detail:e.detail,bubbles:!0,composed:!0}));let r=this.component;r.triggers?.filter(e=>e.type==xa.OnValueChange).filter(e=>!e.propertyName||t.fieldId==e.propertyName).forEach(e=>{(!e.condition||this._evalExpr(e.condition))&&this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}),r.triggers?.filter(e=>e.type==xa.AutoSave).forEach(e=>{let t=e.actionId,n=this._autoSaveTimers.get(t);n!==void 0&&clearTimeout(n),this._autoSaveTimers.set(t,setTimeout(()=>{this._autoSaveTimers.delete(t),this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))},e.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{let t=e.detail,n=t?._originElement??No(e);if(e.type==`action-requested`){e.preventDefault(),e.stopPropagation();let r=this.component,i=r.actions?.find(e=>e.id==t.actionId)??r.actions?.find(e=>e.id.endsWith(`*`)&&t.actionId.startsWith(e.id.replace(`*`,``)));if(i){if(i&&i.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify(`You first need to select some rows`);return}if(i&&i.validationRequired){let e=Io??this;if(Io=null,e.checkValidations(i.fieldsToValidate),!e.data._valid){e.notifyValidationErrors();return}}Io=null;let e={...t,initiatorComponentId:this.id};i&&i.confirmationRequired?this.callAfterConfirmation(i,()=>this.requestActionCallToServerOrBubble(e,r,i,n)):this.requestActionCallToServerOrBubble(e,r,i,n)}else{let r={...t.parameters};r.initiatorState||=this.state,Io||=this,this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,_originElement:n,parameters:r},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{let e={},t=n=>{if(n)for(let r of n){let n=r.metadata;if(n?.type===A.FormField){let t=n;t.fieldId&&t.label&&(e[t.fieldId]=t.label)}t(r.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{let e=this.data?.errors??{},t=this.buildFieldLabelMap(),n=[];if(Object.entries(e).forEach(([e,r])=>{if(!Array.isArray(r))return;let i=e===`_component`?void 0:t[e]??e;r.forEach(e=>{e&&!n.some(t=>t.label===i&&t.msg===e)&&n.push({label:i,msg:e})})}),n.length===0){this.notify(`There are validation errors`);return}pa({text:`There are validation errors
`+n.map(({label:e,msg:t})=>e?`• ${e}: ${t}`:`• ${t}`).join(`
`),variant:`error`,position:`bottomEnd`,duration:Math.max(3e3,1500+n.length*1e3)},this),this.focusFirstInvalidField()},this.notify=e=>{pa({text:e,variant:`error`,position:`bottomEnd`,duration:3e3},this)},this.callAfterConfirmation=(e,t)=>{let n=`One moment, please`,r=`Are you sure?`,i=`Yes`,a=`No`;e.confirmationTexts&&(n=e.confirmationTexts.title,r=e.confirmationTexts.message,i=e.confirmationTexts.confirmationText,a=e.confirmationTexts.denialText);let o=document.createElement(`div`);o.style.cssText=`position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);padding:1rem;`;let s=document.createElement(`div`);s.style.cssText=`background:var(--lumo-base-color,#fff);color:var(--lumo-body-text-color,#1a1a1a);border-radius:var(--lumo-border-radius-l,12px);box-shadow:var(--lumo-box-shadow-xl,0 12px 40px rgba(0,0,0,.3));padding:1.2rem;max-width:min(90vw,26rem);`;let c=()=>{o.parentElement&&document.body.removeChild(o)},l=`font:inherit;font-weight:600;padding:.45rem 1rem;border-radius:var(--lumo-border-radius-m,6px);cursor:pointer;`;ie(w`
            <h3 style="margin:0 0 .5rem;">${n}</h3>
            <div style="margin-bottom:1.2rem;">${r}</div>
            <div style="display:flex;justify-content:flex-end;gap:.5rem;">
                <button style="${l}border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.25));background:var(--lumo-base-color,#fff);"
                        @click="${()=>c()}">${a}</button>
                <button style="${l}border:none;background:var(--lumo-primary-color,#1676f3);color:var(--lumo-primary-contrast-color,#fff);"
                        @click="${()=>{c(),t()}}">${i}</button>
            </div>
        `,s),o.appendChild(s),o.addEventListener(`click`,e=>{e.target===o&&c()}),document.body.appendChild(o)},this.requestActionCallToServerOrBubble=(e,t,n,r)=>{if(n&&n.bubble){let t={...e.parameters};t.initiatorState||=this.state,this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{...e,_originElement:r,parameters:t},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,n,r)},this.requestActionCallToServer=(e,t,n,r)=>{if(n&&n.href){window.location.href=n.href;return}if(n&&n.js)try{Function(`state`,`data`,`appState`,`appData`,`component`,n.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(e){console.error(`when evaluating `+n.js,e,this.component,this.state,this.data)}if(n&&n.customEvent&&this.dispatchEvent(new CustomEvent(n.customEvent.name,{detail:n.customEvent.detail,bubbles:!0,composed:!0})),!(n&&(n.js||n.customEvent))){if(e.actionId==`search`){let t=e.parameters?._searchState;t?this.state={...this.state,...t}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}if(!n?.background){if(!Re(e.actionId,n?.idempotent)&&!To.begin(wo(this.id,e.actionId)))return;let t=Fo(r);this._pendingOrigins.set(e.actionId,t),jo(t)}this.dispatchEvent(new CustomEvent(`server-side-action-requested`,{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:n?.background,sse:n?.sse,timeoutMillis:n?.timeoutMillis,idempotent:n?.idempotent,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(e=>e.type==xa.OnSuccess).filter(t=>e.detail.actionId==t.calledActionId).forEach(t=>{if(!t.condition||this._evalExpr(t.condition))if(e.preventDefault(),e.stopPropagation(),t.timeoutMillis>0){let e=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,callbackToken:e},bubbles:!0,composed:!0}))},t.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(e=>e.type==xa.OnError).filter(t=>e.detail.actionId==t.calledActionId).forEach(t=>{(!t.condition||this._evalExpr(t.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0})))})},this._pendingOrigins=new Map,this._backendSettledListener=e=>{((typeof e.composedPath==`function`?e.composedPath():[])[0]??e.target)===this&&this._releasePending(e.detail?.actionId)},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;let t=this.component;if(t)for(let n of t.actions??[]){let t=n.shortcut||(n.runOnEnter?`enter`:null);if(t&&this._shortcutMatchesEvent(t,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return N.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has(`state`)&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has(`component`)&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent(`clean`,{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}focusFirstInvalidField(){let e=t=>requestAnimationFrame(()=>{let n=this.findFirstInvalid(this.renderRoot);if(n){n.focus?.(),n.scrollIntoView?.({block:`center`,behavior:`smooth`});return}t>0&&e(t-1)});e(3)}findFirstInvalid(e){if(!e?.querySelectorAll)return null;for(let t of Array.from(e.querySelectorAll(`*`))){if(t.invalid===!0)return t;if(t.shadowRoot){let e=this.findFirstInvalid(t.shadowRoot);if(e)return e}}return null}_releasePending(e){(e===void 0?Array.from(this._pendingOrigins.keys()):[e]).forEach(e=>{To.end(wo(this.id,e)),Mo(this._pendingOrigins.get(e)),this._pendingOrigins.delete(e)})}_shortcutMatchesEvent(e,t){return Ln(e,t)}_collectShortcutTabs(){let e=this.renderRoot;if(!e)return[];let t=Array.from(e.querySelectorAll(`vaadin-tab[data-shortcut]`));return e.querySelectorAll(`mateu-drawer, mateu-dialog`).forEach(e=>{let n=e.shadowRoot;n&&t.push(...Array.from(n.querySelectorAll(`vaadin-tab[data-shortcut]`)))}),t}_handleTabShortcut(e){let t=this._collectShortcutTabs();if(t.length===0)return!1;for(let n of Array.from(t)){let t=n.dataset.shortcut;if(!t||!this._shortcutMatchesEvent(t,e))continue;let r=n.closest(`vaadin-tabs`);if(!r)continue;let i=Array.from(r.querySelectorAll(`vaadin-tab`)).indexOf(n);if(!(i<0))return e.preventDefault(),r.selected=i,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener(`backend-call-succeeded`,this.handleBackendSucceeded),this.addEventListener(`backend-call-failed`,this.handleBackendFailed),this.addEventListener(`backend-succeeded-event`,this._backendSettledListener),this.addEventListener(`backend-failed-event`,this._backendSettledListener),this.addEventListener(`backend-cancelled-event`,this._backendSettledListener),document.addEventListener(`keydown`,this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`backend-call-succeeded`,this.handleBackendSucceeded),this.removeEventListener(`backend-call-failed`,this.handleBackendFailed),this.removeEventListener(`backend-succeeded-event`,this._backendSettledListener),this.removeEventListener(`backend-failed-event`,this._backendSettledListener),this.removeEventListener(`backend-cancelled-event`,this._backendSettledListener),document.removeEventListener(`keydown`,this._keydownListener),this._releasePending()}render(){return w`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?w`
                <div><ul>${this.data.errors._component.map(e=>w`<li>${e}</li>`)}</ul></div>
            `:_}</div>`}_render(){if(this.component?.type==k.ClientSide){let e=this.component;return e.metadata?.type==A.Page?br(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==A.Crud?xr(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):N.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return w`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==k.ClientSide){let t=e;if(t.metadata?.type==A.Page)return br(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==A.Crud)return xr(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return P(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}static{this.styles=m`
        :host {
        }

        ${ae(fe.cssText)}
        
        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }

        /* Reflective @Section forms render as frameless cards (no border/padding). Give them
           breathing room so nothing reads as cramped: 1.5rem between stacked sections, and 0.5rem
           between a section's title and its content. The section title h3 carries an inline
           margin:0, so we space the wrapping vertical-layout rather than fighting the inline style.
           The max(floor, token) keeps the section HEADINGS legible even under @Compact — which
           shrinks --lumo-space-* to ~0.18-0.45rem and would otherwise glue the 18px titles to their
           content; the field rows stay compact because their spacing is the raw (shrunk) token. */
        vaadin-vertical-layout:has(> vaadin-card.mateu-section) {
            gap: max(0.9rem, var(--lumo-space-l));
        }
        vaadin-card.mateu-section > vaadin-vertical-layout {
            gap: max(0.45rem, var(--lumo-space-s));
        }

        /* A pinned section (@Section(sticky=true)) must be OPAQUE — the section cards are frameless
           (transparent), so without a background the content scrolling underneath bleeds through the
           pinned band. Give it the base color + a small horizontal pad so the band isn't flush, a
           z-index above the in-flow content, and a hairline to mark where it ends. */
        vaadin-card.mateu-section--sticky {
            background: var(--lumo-base-color, #fff);
            --vaadin-card-background: var(--lumo-base-color, #fff);
            z-index: 2;
            padding-block: var(--lumo-space-xs);
            box-shadow: 0 1px 0 0 var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
        }
  `}};O([v()],Lo.prototype,`baseUrl`,void 0),O([v()],Lo.prototype,`route`,void 0),O([v()],Lo.prototype,`consumedRoute`,void 0),Lo=O([h(`mateu-component`)],Lo);var Ro=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}},zo=new class{async handle(e,t){return await e.runAction(t.baseUrl,t.route,t.consumedRoute,t.actionId,t.initiatorComponentId,t.appState,t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.options)}},Bo=new class{constructor(){this.handleUIIncrement=(e,t,n)=>{if(e?.fragments?.forEach(e=>{ue.next({command:void 0,fragment:e,ui:void 0,error:void 0,callbackToken:n})}),e?.appState&&(D.value={...e.appState},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))),e?.appData){let n=e?.appData;de.value={...e.appData,...n},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))}e?.messages?.forEach(e=>{pa({text:e.text,position:e.position,variant:e.variant,duration:e.duration,undoLabel:e.undoLabel,undoActionId:e.undoActionId,undoParameters:e.undoParameters},t)}),e?.banners&&e.banners.length>0&&document.dispatchEvent(new CustomEvent(`page-banners-received`,{detail:{banners:e.banners,append:e.appendBanners??!1},bubbles:!1,composed:!1})),e?.commands?.forEach(e=>{ue.next({command:e,fragment:void 0,ui:void 0,error:void 0,callbackToken:n})})}}async runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,ee,te={}){let ne=()=>{this.runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,ee,te)};try{let o=await zo.handle(e,{baseUrl:t,route:n,consumedRoute:r,actionId:i,appState:D.value,initiatorComponentId:a,componentState:c,parameters:l,serverSideType:s,initiator:u,background:d,options:{...te,retry:ne}});f&&f(o),p||this.handleUIIncrement(o,u,ee),o.messages&&o.messages.length==1&&o.messages[0].variant==`error`&&u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-succeeded`,{detail:{actionId:i,evevntId:T()},bubbles:!0,composed:!0}))}catch(e){console.warn(`Action request failed`,e),e?.__mateuReported||u.dispatchEvent(new CustomEvent(`backend-failed-event`,{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(e),retry:ne}})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0}))}}serialize(e){return e?.message?e:JSON.stringify(e)}},Vo=new class{constructor(){this.handleUIIncrement=(e,t,n)=>{if(e?.messages?.forEach(e=>{pa({text:e.text,position:e.position,variant:e.variant,duration:e.duration,undoLabel:e.undoLabel,undoActionId:e.undoActionId,undoParameters:e.undoParameters},t)}),e?.banners&&e.banners.length>0&&document.dispatchEvent(new CustomEvent(`page-banners-received`,{detail:{banners:e.banners,append:e.appendBanners??!1},bubbles:!1,composed:!1})),e?.commands?.forEach(e=>{ue.next({command:e,fragment:void 0,ui:void 0,error:void 0,callbackToken:n})}),e?.fragments?.forEach(e=>{ue.next({command:void 0,fragment:e,ui:void 0,error:void 0,callbackToken:n})}),e?.appState&&(D.value={...e.appState},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))),e?.appData){let n=e?.appData;de.value={...e.appData,...n},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))}}}async runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,ee,te={}){let ne=()=>{this.runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,ee,te)};if(n){n||=`_no_route`,n&&n.startsWith(`/`)&&(n=n.substring(1));let e={serverSideType:s,appState:D.value,componentState:c,parameters:l,initiatorComponentId:a,consumedRoute:r,route:`/`+n,actionId:i};d||u.dispatchEvent(new CustomEvent(`backend-called-event`,{bubbles:!0,composed:!0,detail:{}})),fetch(t+`/mateu/v3/sse/`+n,{method:`POST`,headers:{Accept:`text/event-stream`,"Content-Type":`application/json`},body:JSON.stringify(e)}).then(async e=>{let t=e.body?.pipeThrough(new TextDecoderStream).getReader();if(t){let e=``;for(;;){let{value:n,done:r}=await t.read();if(r)break;e+=n;let a=e.split(`

`);e=a.pop()??``;for(let e of a){let t=e.trim();if(t)if(t.startsWith(`data:`)){let e=JSON.parse(t.substring(5).trim());f&&f(e),p||this.handleUIIncrement(e,u,ee),e.messages&&e.messages.length==1&&e.messages[0].variant==`error`&&u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0}))}else{let e=t;try{let n=JSON.parse(t);e=n.message,n._embedded?.errors?.length>0&&n._embedded.errors[0].message&&(e=n._embedded.errors[0].message)}catch{}throw Error(e)}}}}d||u.dispatchEvent(new CustomEvent(`backend-succeeded-event`,{bubbles:!0,composed:!0,detail:{actionId:i}})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-succeeded`,{detail:{actionId:i},bubbles:!0,composed:!0}))}).catch(e=>{u.dispatchEvent(new CustomEvent(`backend-failed-event`,{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(e),retry:ne}})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0}))})}}serialize(e){return e?.message?e:JSON.stringify(e)}},Ho={fixed:`fixed`,fullWidth:`full`,edgeToEdge:`edge`},Uo=new Set([A.Gantt,A.PlanningBoard,A.Kanban,A.Bpmn,A.Workflow,A.Map]),Wo={landing:`fixed`,form:`fixed`,process:`fixed`},Go=e=>e?Ho[e]:void 0,Ko=e=>e.type==k.ClientSide?e.metadata:void 0,qo=e=>{let t=Ko(e);if(t?.type==A.Page){let e=Go(t.pageWidth);if(e)return e}for(let t of e.children??[]){let e=qo(t);if(e)return e}},Jo=e=>{let t=e.pageType;if(t)return t;let n=e=>{let t=Ko(e);if(t?.type==A.Page&&t.pageType)return t.pageType;for(let t of e.children??[]){let e=n(t);if(e)return e}};return n(e)},Yo=e=>{let t=Ko(e);if(t?.type!=A.Crud)return!1;let n=t;return n.compact?!0:(n.columns??[]).some(e=>e.metadata?.editable)},Xo=(e,t)=>t(e)||(e.children??[]).some(e=>Xo(e,t)),Zo=e=>!!e&&Xo(e,e=>Ko(e)?.type==A.HeroSection),Qo=e=>Ko(e)?.type==A.App||(e.children??[]).some(e=>Ko(e)?.type==A.App),$o=(e,t)=>e?(Go(e.pageWidth)??qo(e))||(t?.top&&Qo(e)?`edge`:Wo[Jo(e)??``]||(Xo(e,e=>{let t=Ko(e)?.type;return t!=null&&Uo.has(t)})?`edge`:Xo(e,Yo)?`full`:`fixed`)):`fixed`,es=`mateu-route-structure-cache`,ts=1,ns=50,rs=(()=>{try{return localStorage.getItem(`mateu-route-structure-cache-off`)!==`1`}catch{return!0}})(),is=()=>{try{return JSON.parse(localStorage.getItem(es)??`{}`)}catch{return{}}},as=e=>{try{localStorage.setItem(es,JSON.stringify(e))}catch{try{let t=Object.entries(e).sort((e,t)=>t[1].t-e[1].t).slice(0,Math.floor(ns/2));localStorage.setItem(es,JSON.stringify(Object.fromEntries(t)))}catch{}}},os=e=>{let t=e.initialState&&Object.keys(e.initialState).length?`#`+ls(JSON.stringify(e.initialState)):``;return[e.baseUrl,e.consumedRoute??``,e.route??``,e.serverSideType??``].join(`|`)+t},ss=e=>{if(!rs)return;let t=is()[e];if(!(!t||t.v!==ts))return{component:t.component,hash:t.hash}},cs=(e,t,n)=>{if(!rs)return;let r=is();r[e]={v:ts,t:Date.now(),component:t,hash:n};let i=Object.keys(r);if(i.length>ns){let e=i.sort((e,t)=>r[e].t-r[t].t).slice(0,i.length-ns);for(let t of e)delete r[t]}as(r)},ls=e=>{let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return(t>>>0).toString(36)},us=30,ds=new Map,fs=!0,ps=e=>{if(fs)return ds.get(e)},ms=(e,t)=>{if(fs&&(ds.delete(e),ds.set(e,t),ds.size>us)){let e=ds.keys().next().value;e!==void 0&&ds.delete(e)}},hs,X=class extends $e{static{hs=this}constructor(...e){super(...e),this.consumedRoute=``,this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.showSkeleton=!1,this.pendingRouteFocus=!1,this.hasRenderedContent=!1,this.loadLifecycleListener=e=>{if(((typeof e.composedPath==`function`?e.composedPath():[])[0]??e.target)===this)if(clearTimeout(this.skeletonTimer),e.type===`backend-called-event`){if(this.fragment?.component)return;this.skeletonTimer=setTimeout(()=>{this.showSkeleton=!0},hs.SKELETON_DELAY_MS)}else this.showSkeleton=!1},this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t==`string`&&(t===``||t.startsWith(`/`))&&this.consumedRoute&&this.consumedRoute!==`_empty`&&this.consumedRoute.startsWith(`/`)&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t=t.startsWith(`/`)&&this.uriPrefix.endsWith(`/`)?this.uriPrefix+t.substring(1):!t.startsWith(`/`)&&!this.uriPrefix.endsWith(`/`)?this.uriPrefix+`/`+t:this.uriPrefix+t),this.dispatchEvent(new CustomEvent(`url-update-requested`,{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==``&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:k.ClientSide,metadata:{type:A.Element,name:`div`,content:`Not found`},id:`fieldId`},action:Ke.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;let t=this.detail1;if(e.type==`server-side-action-requested`){let e=Bo;t.sse&&(e=Vo),e.runAction(Ge,this.baseUrl,t.route??``,t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken,{timeoutMillis:t.timeoutMillis,idempotent:t.idempotent,knownStructureHash:t.knownStructureHash})}},this.getCustomisedAppState=()=>{let e={...D.value};if(this.overrides){let t=Ro(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw Error(`Method not implemented.`)}createRenderRoot(){return N.mustUseShadowRoot()?super.createRenderRoot():this}structureCacheKey(){return os({baseUrl:this.baseUrl,consumedRoute:this.consumedRoute,route:this.route,serverSideType:this.serverSideType,initialState:this.initialState})}focusNewContent(){requestAnimationFrame(()=>{let e=this.renderRoot?.querySelector?.(`h1, h2, [role="heading"]`)??this;e.hasAttribute(`tabindex`)||e.setAttribute(`tabindex`,`-1`),e.focus?.({preventScroll:!0})})}static{this.SKELETON_DELAY_MS=400}connectedCallback(){super.connectedCallback(),this.overridesParsed=Ro(this.overrides),this.addEventListener(`server-side-action-requested`,this.actionRequestedListener),this.addEventListener(`backend-call-failed`,this.backendFailedListener),this.addEventListener(`history-pushed`,this.historyPushed),this.addEventListener(`route-changed`,this.routeChangedListener),this.addEventListener(`backend-called-event`,this.loadLifecycleListener),this.addEventListener(`backend-succeeded-event`,this.loadLifecycleListener),this.addEventListener(`backend-failed-event`,this.loadLifecycleListener),this.addEventListener(`backend-cancelled-event`,this.loadLifecycleListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`server-side-action-requested`,this.actionRequestedListener),this.removeEventListener(`backend-call-failed`,this.backendFailedListener),this.removeEventListener(`history-pushed`,this.historyPushed),this.removeEventListener(`route-changed`,this.routeChangedListener),this.removeEventListener(`backend-called-event`,this.loadLifecycleListener),this.removeEventListener(`backend-succeeded-event`,this.loadLifecycleListener),this.removeEventListener(`backend-failed-event`,this.loadLifecycleListener),this.removeEventListener(`backend-cancelled-event`,this.loadLifecycleListener),clearTimeout(this.skeletonTimer)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(e=>e===`appState`||e===`appData`)){let t=this.renderRoot.querySelector(`mateu-component`);if(t)return e.has(`appState`)&&(t.appState=this.appState),e.has(`appData`)&&(t.appData=this.appData),!1}return!0}updated(e){if((e.has(`id`)||e.has(`baseurl`)||e.has(`route`)||e.has(`consumedRoute`)||e.has(`instant`))&&!this.preventNavigation){this.callbackToken=this.instant||T();let e=this.structureCacheKey(),t=e===this.lastAuthoritativeKey?void 0:ps(e);if(t)queueMicrotask(()=>this.applyFragment(t));else{if(e!==this.lastAuthoritativeKey){let t=ss(e);this.currentStructureHash=t?.hash,t&&(this.fragment={targetComponentId:this.id,component:t.component,state:{},data:{},action:Ke.Replace,containerId:void 0})}this.manageActionEvent(new CustomEvent(`server-side-action-requested`,{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:``,serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,componentState:this.initialState,knownStructureHash:this.currentStructureHash,callbackToken:this.callbackToken},bubbles:!0,composed:!0}))}}e.has(`route`)&&this.top&&(this.preventNavigation||(this.pendingRouteFocus=!0),this.preventNavigation||this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&=!1}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}if(this.fragment=e,e.component){if(e.action!==Ke.Add){let t=this.structureCacheKey(),n=e.component.structureHash;cs(t,e.component,n),this.lastAuthoritativeKey=t,this.currentStructureHash=n,e.component.staticView&&ms(t,e)}this.pendingRouteFocus&&this.hasRenderedContent&&this.focusNewContent(),this.pendingRouteFocus=!1,this.hasRenderedContent=!0}e.component&&(this.dataset.pageWidth=$o(e.component,{top:this.top}),this.dataset.pageType=Jo(e.component)??``,this.dataset.hasWelcomeBanner=String(Zo(e.component)))}render(){return!this.fragment?.component&&this.showSkeleton?w`
                <div class="route-skeleton" aria-busy="true" aria-live="polite">
                    <mateu-skeleton variant="text" count="1"></mateu-skeleton>
                    <mateu-skeleton variant="form" count="4"></mateu-skeleton>
                </div>
            `:w`
           ${this.fragment?.component?P(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):_}
       `}static{this.styles=m`
        :host {
            display: block;
            min-height: 100%;
        }

        .container {
            padding-left: 0; padding-right: 0;
            width:100%;
            max-width: 1392px;
            margin: 0 auto;
        }

        /* Anatomía de anchos RDS (data-page-width — el valor RESUELTO fixed|full|edge que
           applyFragment estampa en el host): fixed = columna de contenido con tope RDS
           (1408px) centrada; full = fluido sin tope (el comportamiento por defecto del
           host); edge = a sangre — los gutters del shell caen por el hook no-padding
           (compact-changed) y el header de mateu-page conserva el suyo. Solo aplica al
           mateu-ux de CONTENIDO: el ux raíz del app shell resuelve 'edge'. */
        :host([data-page-width='fixed']) {
            max-width: min(1408px, 100%);
            margin-inline: auto;
        }

        /* Loading placeholder for a route with nothing on screen yet. */
        .route-skeleton {
            padding: var(--lumo-space-m, 1rem);
            max-width: 40rem;
        }
        .route-skeleton mateu-skeleton:first-child {
            max-width: 16rem;
            margin-block-end: var(--lumo-space-l, 1.5rem);
        }
  `}};O([v()],X.prototype,`consumedRoute`,void 0),O([v()],X.prototype,`serverSideType`,void 0),O([v()],X.prototype,`uriPrefix`,void 0),O([v()],X.prototype,`overrides`,void 0),O([v()],X.prototype,`homeRoute`,void 0),O([v()],X.prototype,`route`,void 0),O([v()],X.prototype,`top`,void 0),O([v()],X.prototype,`instant`,void 0),O([v()],X.prototype,`initialState`,void 0),O([v()],X.prototype,`appState`,void 0),O([v()],X.prototype,`appData`,void 0),O([S()],X.prototype,`fragment`,void 0),O([S()],X.prototype,`showSkeleton`,void 0),X=hs=O([h(`mateu-ux`)],X);function gs(e){let t=`var(--lumo-space-m, 1rem)`,n={left:`50%`,transform:`translateX(-50%)`};switch(e){case`topStart`:return{top:t,left:t};case`topCenter`:return{top:t,...n};case`topEnd`:return{top:t,right:t};case`topStretch`:return{top:t,left:t,right:t};case`middle`:return{top:`50%`,left:`50%`,transform:`translate(-50%, -50%)`};case`bottomStart`:return{bottom:t,left:t};case`bottomCenter`:return{bottom:t,...n};case`bottomStretch`:return{bottom:t,left:t,right:t};default:return{bottom:t,right:t}}}function _s(e){switch(e){case`success`:return{bg:`var(--lumo-success-color, #2e7d32)`,fg:`#fff`};case`error`:return{bg:`var(--lumo-error-color, #c62828)`,fg:`#fff`};case`warning`:return{bg:`var(--lumo-warning-color, #f9a825)`,fg:`#1a1a1a`};case`contrast`:return{bg:`var(--lumo-contrast-90pct, #1a1a1a)`,fg:`#fff`};default:return{bg:`var(--lumo-base-color, #fff)`,fg:`var(--lumo-body-text-color, #1a1a1a)`}}}var vs={show(e,t){let{bg:n,fg:r}=_s(e.variant),i=gs(e.position),a=document.createElement(`div`),o=e.variant===`error`;a.setAttribute(`role`,o?`alert`:`status`),a.setAttribute(`aria-live`,o?`assertive`:`polite`),a.setAttribute(`aria-atomic`,`true`),Object.assign(a.style,{position:`fixed`,zIndex:`2000`,display:`flex`,alignItems:`center`,gap:`0.75rem`,maxWidth:`min(90vw, 28rem)`,padding:`0.7rem 1rem`,borderRadius:`var(--lumo-border-radius-m, 8px)`,boxShadow:`var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,0.2))`,background:n,color:r,font:`inherit`,fontSize:`var(--lumo-font-size-s, 0.875rem)`,opacity:`0`,transition:`opacity 0.2s ease`,...i});let s=document.createElement(`span`);s.textContent=e.text,a.appendChild(s);let c=()=>{a.style.opacity=`0`,setTimeout(()=>a.remove(),200)},l=e.onAction?{label:e.actionLabel??`Retry`,run:e.onAction}:e.undoActionId?{label:e.undoLabel??`Undo`,run:()=>t.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0}))}:void 0;if(l){let e=document.createElement(`button`);e.textContent=l.label,e.style.cssText=`margin-left: 0.25rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;`,e.addEventListener(`click`,()=>{l.run(),c()}),a.appendChild(e)}document.body.appendChild(a),requestAnimationFrame(()=>{a.style.opacity=`1`});let u=e.duration??(l?1e4:5e3);u>0&&setTimeout(c,u)}};function ys(){fa(vs)}var bs=class extends y{constructor(...e){super(...e),this.online=!0,this.recovered=!1}connectedCallback(){super.connectedCallback(),this.online=Ve.isOnline(),this.unsubscribe=Ve.subscribe(e=>{let t=!this.online;this.online=e,e&&t&&(this.recovered=!0,clearTimeout(this.recoveredTimer),this.recoveredTimer=setTimeout(()=>{this.recovered=!1},4e3))})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),clearTimeout(this.recoveredTimer),this.releaseSpace()}updated(){let e=this.renderRoot.querySelector(`.bar`);if(!e){this.releaseSpace();return}document.body.style.setProperty(`padding-block-start`,`${e.offsetHeight}px`)}releaseSpace(){typeof document<`u`&&document.body?.style.removeProperty(`padding-block-start`)}render(){if(this.online&&!this.recovered)return _;let e=!this.online;return w`<div class="bar ${e?`offline`:`back`}" role="status" aria-live="polite">
            <span class="dot"></span>
            <span>${e?`No connection — changes you make now will not be saved.`:`Connection restored.`}</span>
        </div>`}static{this.styles=m`
        :host {
            position: fixed;
            inset-block-start: 0;
            inset-inline: 0;
            z-index: 3000;
            display: block;
            pointer-events: none;
        }
        .bar {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: .55rem;
            padding: .45rem 1rem;
            font: inherit;
            font-size: var(--lumo-font-size-s, .875rem);
            font-weight: 500;
            /* Always-light pastels with dark ink, matching the page-banner convention: the strip
               must stay legible in either theme without a second palette. */
            color: #1a1a1a;
            box-shadow: var(--lumo-box-shadow-xs, 0 1px 4px rgba(0, 0, 0, .18));
            animation: slide-in .2s ease;
        }
        .bar.offline { background: #ffe0b2; }
        .bar.back { background: #c8e6c9; }
        .dot {
            width: .5rem;
            height: .5rem;
            border-radius: 50%;
            background: currentColor;
            opacity: .55;
        }
        .bar.offline .dot { animation: pulse 1.6s ease-in-out infinite; }
        @keyframes slide-in { from { transform: translateY(-100%); } to { transform: none; } }
        @keyframes pulse { 50% { opacity: .15; } }
        @media (prefers-reduced-motion: reduce) {
            .bar, .bar.offline .dot { animation: none; }
        }
    `}};O([S()],bs.prototype,`online`,void 0),O([S()],bs.prototype,`recovered`,void 0),bs=O([h(`mateu-connectivity-banner`)],bs);var xs=null;function Ss(){if(!(typeof document>`u`)&&!(xs&&xs.isConnected)){if(!document.body){document.addEventListener(`DOMContentLoaded`,()=>Ss(),{once:!0});return}xs=document.createElement(`mateu-connectivity-banner`),document.body.appendChild(xs)}}var Cs,ws=class extends y{static{Cs=this}constructor(...e){super(...e),this.skip=()=>{let e=this.findContent();e&&(e.hasAttribute(`tabindex`)||e.setAttribute(`tabindex`,`-1`),e.focus(),e.scrollIntoView({block:`start`}))}}static{this.TARGETS=[`.app-content`,`mateu-page`,`mateu-ux`,`mateu-component`]}findContent(){let e=new Set,t=n=>{if(e.has(n))return null;e.add(n);for(let e of Cs.TARGETS){let t=n.querySelector?.(e);if(t&&t!==this)return t}for(let e of Array.from(n.querySelectorAll?.(`*`)??[]))if(e.shadowRoot){let n=t(e.shadowRoot);if(n)return n}return null};return t(document)}render(){return w`<button class="skip" @click="${this.skip}">Skip to content</button>`}static{this.styles=m`
        :host {
            position: fixed;
            inset-block-start: 0;
            inset-inline-start: 0;
            z-index: 4000;
        }
        /*
         * Hidden by being moved off-screen rather than by display:none — a display:none element is
         * not focusable at all, which would make the link unreachable and therefore pointless.
         */
        .skip {
            position: absolute;
            transform: translateY(-200%);
            margin: .5rem;
            padding: .5rem 1rem;
            font: inherit;
            font-weight: 600;
            color: var(--lumo-primary-contrast-color, #fff);
            background: var(--lumo-primary-color, #3b5bdb);
            border: 2px solid var(--lumo-primary-color, #3b5bdb);
            border-radius: var(--lumo-border-radius-m, 6px);
            box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0, 0, 0, .2));
            cursor: pointer;
            white-space: nowrap;
            transition: transform .15s ease;
        }
        .skip:focus-visible,
        .skip:focus {
            transform: none;
            outline: 2px solid var(--lumo-body-text-color, #161513);
            outline-offset: 2px;
        }
    `}};ws=Cs=O([h(`mateu-skip-link`)],ws);var Ts=null;function Es(){if(!(typeof document>`u`)&&!(Ts&&Ts.isConnected)){if(!document.body){document.addEventListener(`DOMContentLoaded`,()=>Es(),{once:!0});return}Ts=document.createElement(`mateu-skip-link`),document.body.insertBefore(Ts,document.body.firstChild)}}ys(),Ss(),Ze(),Es();var Ds=class extends y{constructor(...e){super(...e),this.baseUrl=``,this.route=void 0,this.consumedRoute=`_empty`,this.config=void 0,this.top=`true`,this.pathPrefix=void 0,this.debug=!1,this._lastUrl=``,this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top==`true`){let t=e.detail.route,n=this.baseUrl??``;!t||t.startsWith(`/`)?n=window.location.origin+(this.pathPrefix??``):(t=(this.pathPrefix??``)+t,n.indexOf(`://`)<0&&(n.startsWith(`/`)||(n=`/`+n),n=window.location.origin+n)),t.startsWith(this.pathPrefix+`/`)&&(t=t.substring(this.pathPrefix?.length)),n.endsWith(`/`)&&t.startsWith(`/`)&&(t=t.substring(1));let r=new URL(n+t);if((window.location.pathname||r.pathname)&&window.location.pathname!=r.pathname){let e=r.pathname;r.search&&(e+=r.search),e&&!e.startsWith(`/`)&&(e=`/`+e),window.history.pushState({},``,e),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),Ma.markClean(),e instanceof CustomEvent){let t=e.detail.route,n=this.renderRoot.querySelector(`mateu-ux`);n&&(n.setAttribute(`route`,t),n.setAttribute(`instant`,T()))}}}createRenderRoot(){return N.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),Ma.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!Ma.confirmLeave()){window.history.pushState({},``,this._lastUrl);return}let t=e.target;this.loadUrl(t)},this.top==`true`?this.loadUrl(window):this.route&&(this.consumedRoute=``),this.config)try{let e=JSON.parse(this.config);D.value={...D.value,...e}}catch{D.value={...D.value,config:this.config}}this.addEventListener(`url-update-requested`,this.routeChangedListener),this.addEventListener(`navigate-to-requested`,this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener(`url-update-requested`,this.routeChangedListener),this.removeEventListener(`navigate-to-requested`,this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute(`route`,this.route),this.instant=T(),this._lastUrl=e.location.href,e.location.search){let t=new URLSearchParams(e.location.search).get(`overrides`);if(t&&(this.config=t,this.config))try{let e=JSON.parse(this.config);D.value={...D.value,...e}}catch{D.value={...D.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){let t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t==`/`?``:t}addQueryParams(e,t){return e+(t.search?``+t.search:``)}extractGrossRouteFromUrl(e){let t=e.location.pathname,n=this.baseUrl&&(this.baseUrl.startsWith(`http://`)||this.baseUrl.startsWith(`https://`))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(n)?t.substring(n.length):t}getContextPathStartingIndex(e){return e.startsWith(`http:`)?e.indexOf(`/`,7):e.startsWith(`https:`)?e.indexOf(`/`,8):0}render(){return w`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${de.value}"
                          .appState="${D.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?w`
               <mateu-debug-overlay
                   .appState="${D.value}"
                   .appData="${de.value}"
               ></mateu-debug-overlay>
           `:_}
       `}static{this.styles=m`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `}};O([v()],Ds.prototype,`baseUrl`,void 0),O([v()],Ds.prototype,`route`,void 0),O([v()],Ds.prototype,`consumedRoute`,void 0),O([v()],Ds.prototype,`config`,void 0),O([v()],Ds.prototype,`top`,void 0),O([v()],Ds.prototype,`pathPrefix`,void 0),O([S()],Ds.prototype,`instant`,void 0),O([v({type:Boolean})],Ds.prototype,`debug`,void 0),Ds=O([h(`mateu-ui`)],Ds);var Os,ks=class extends y{static{Os=this}constructor(...e){super(...e),this.baseUrl=``,this.opened=!1,this.searchText=``}static{this.SEARCHABLE_THRESHOLD=7}connectedCallback(){super.connectedCallback(),De()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(Ce()[this.selector.fieldName]??``)}currentLabel(){let e=this.currentValue();if(!e)return`—`;let t=(this.searchedOptions??this.selector.options)?.find(t=>String(t.value)===e);if(t)return t.label;let n=we()[this.selector.fieldName];return n===void 0?e:String(n)}pick(e,t){Te(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText=``,this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector(`input.picker-search`)?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){let e=this.app;if(e?.serverSideType)try{let t=await Ge.runAction(this.baseUrl??``,e.rootRoute??e.initialRoute??``,``,`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(let e of t?.fragments??[]){let t=e.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(t)){this.searchedOptions=t.map(e=>({value:e.value,label:e.label??String(e.value)}));return}}}catch{}}visibleOptions(){let e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(e=>e.label.toLowerCase().includes(t)):e}renderPanel(){let e=this.currentValue(),t=this.visibleOptions();return w`
            <div class="panel">
                ${this.searchText!==``||t.length>Os.SEARCHABLE_THRESHOLD?w`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${e=>{e.key===`Escape`&&this.closePanel()}}"/>`:_}
                <div class="options">
                    ${e?w`
                        <div class="option option--clear" @click="${()=>this.pick(``)}">— (clear)</div>`:_}
                    ${t.map(t=>w`
                        <div class="option ${e===String(t.value)?`option--selected`:``}"
                             @click="${()=>this.pick(t.value,t.label)}">${t.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?w`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():_}
            </label>`:w``}static{this.styles=m`
        :host {
            display: inline-flex;
            position: relative;
            flex-shrink: 0;
        }
        .root {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            margin-left: 0.5rem;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.6));
        }
        .picker-select, .picker-button {
            font: inherit;
            color: var(--lumo-body-text-color, #1a1a1a);
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border: none;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            padding: 0.3rem 0.5rem;
            cursor: pointer;
            outline: none;
            white-space: nowrap;
        }
        .caret {
            opacity: 0.6;
            font-size: 0.7em;
        }
        .panel {
            position: absolute;
            top: calc(100% + 4px);
            right: 0;
            min-width: 14rem;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 16px rgba(0, 0, 0, 0.15));
            z-index: 300;
            padding: 0.4rem;
        }
        .picker-search {
            width: 100%;
            box-sizing: border-box;
            font: inherit;
            color: var(--lumo-body-text-color, #1a1a1a);
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-30pct, rgba(0, 0, 0, 0.3));
            border-radius: var(--lumo-border-radius-s, 4px);
            padding: 0.3rem 0.5rem;
            outline: none;
            margin-bottom: 0.25rem;
        }
        .options {
            max-height: 16rem;
            overflow-y: auto;
        }
        .option {
            padding: 0.35rem 0.5rem;
            border-radius: var(--lumo-border-radius-s, 4px);
            cursor: pointer;
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .option:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
        }
        .option--selected {
            font-weight: 600;
        }
        .option--clear {
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
        }
    `}};O([v()],ks.prototype,`selector`,void 0),O([v()],ks.prototype,`app`,void 0),O([v()],ks.prototype,`baseUrl`,void 0),O([S()],ks.prototype,`opened`,void 0),O([S()],ks.prototype,`searchText`,void 0),O([S()],ks.prototype,`searchedOptions`,void 0),ks=Os=O([h(`mateu-app-context-picker`)],ks);var As=class extends y{constructor(...e){super(...e),this.baseUrl=``,this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){let n=this.app;if(n?.serverSideType)try{let r=await Ge.runAction(this.baseUrl??``,n.rootRoute??n.initialRoute??``,``,e,`notification-bell`,void 0,n.serverSideType,{},t,this,!0);for(let e of r?.fragments??[]){let t=e.data?._notifications;if(Array.isArray(t)){this.notifications=t;return}}}catch{}}refresh(){return this.runNotificationsAction(`_notifications-list`,{})}markRead(e){return this.runNotificationsAction(`_notifications-read`,{ids:e})}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);let t=e.route;if(t){if(!Ma.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`navigate-to-requested`,{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return w`
            <div role="button" tabindex="0" class="entry ${e.unread?`entry--unread`:``}"
                 @click="${()=>this.entryClicked(e)}" @keydown="${L(()=>this.entryClicked(e))}">
                <span class="unread-dot" aria-hidden="true"></span>
                <div class="entry-body">
                    <div class="entry-top">
                        <span class="entry-title">${e.title}</span>
                        ${e.when?w`<span class="entry-when">${e.when}</span>`:_}
                    </div>
                    ${e.text?w`<div class="entry-text">${e.text}</div>`:_}
                </div>
            </div>`}renderPanel(){return w`
            <div class="panel">
                <div class="entries">
                    ${this.notifications.length===0?w`
                        <div class="empty">No notifications</div>`:_}
                    ${this.notifications.map(e=>this.renderEntry(e))}
                </div>
                ${this.notifications.length>0?w`
                    <div class="footer">
                        <button class="mark-all" ?disabled="${this.unreadCount()===0}"
                                @click="${()=>this.markRead(`all`)}">Mark all read</button>
                    </div>`:_}
            </div>`}render(){let e=this.unreadCount();return w`
            <div class="root">
                <button class="bell-button" title="Notifications" aria-label="Notifications"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    <svg class="bell-icon" viewBox="0 0 24 24" aria-hidden="true"
                         fill="none" stroke="currentColor" stroke-width="1.8"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    ${e>0?w`<span class="badge">${e>99?`99+`:e}</span>`:_}
                </button>
                ${this.opened?this.renderPanel():_}
            </div>`}static{this.styles=m`
        :host {
            display: inline-flex;
            position: relative;
            flex-shrink: 0;
        }
        .root {
            display: inline-flex;
            position: relative;
            align-items: center;
            margin-left: 0.5rem;
        }
        .bell-button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font: inherit;
            color: var(--lumo-body-text-color, #1a1a1a);
            background: transparent;
            border: none;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            padding: 0.3rem;
            cursor: pointer;
            outline: none;
        }
        .bell-button:hover {
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
        }
        .bell-icon {
            width: 1.25rem;
            height: 1.25rem;
        }
        .badge {
            position: absolute;
            top: -2px;
            right: -4px;
            min-width: 1rem;
            height: 1rem;
            box-sizing: border-box;
            padding: 0 0.2rem;
            border-radius: 0.5rem;
            background: var(--lumo-error-color, #d32f2f);
            color: #fff;
            font-size: 0.65rem;
            font-weight: 600;
            line-height: 1rem;
            text-align: center;
        }
        .panel {
            position: absolute;
            top: calc(100% + 4px);
            right: 0;
            width: 20rem;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 16px rgba(0, 0, 0, 0.15));
            z-index: 300;
        }
        .entries {
            max-height: 20rem;
            overflow-y: auto;
            padding: 0.3rem;
        }
        .empty {
            padding: 0.8rem 0.5rem;
            text-align: center;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
        }
        .entry {
            display: flex;
            align-items: flex-start;
            gap: 0.4rem;
            padding: 0.45rem 0.5rem;
            border-radius: var(--lumo-border-radius-s, 4px);
            cursor: pointer;
        }
        .entry:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
        }
        .unread-dot {
            flex-shrink: 0;
            width: 0.45rem;
            height: 0.45rem;
            margin-top: 0.4rem;
            border-radius: 50%;
            background: transparent;
        }
        .entry--unread .unread-dot {
            background: var(--lumo-primary-color, #1976d2);
        }
        .entry-body {
            flex: 1;
            min-width: 0;
        }
        .entry-top {
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
        }
        .entry-title {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .entry--unread .entry-title {
            font-weight: 600;
        }
        .entry-when {
            flex-shrink: 0;
            margin-left: auto;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            color: var(--lumo-tertiary-text-color, rgba(0, 0, 0, 0.45));
        }
        .entry-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
        }
        .footer {
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
            padding: 0.3rem;
        }
        .mark-all {
            width: 100%;
            font: inherit;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-primary-text-color, #1976d2);
            background: transparent;
            border: none;
            border-radius: var(--lumo-border-radius-s, 4px);
            padding: 0.35rem 0.5rem;
            cursor: pointer;
            outline: none;
        }
        .mark-all:hover:not([disabled]) {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
        }
        .mark-all[disabled] {
            color: var(--lumo-disabled-text-color, rgba(0, 0, 0, 0.3));
            cursor: default;
        }
    
        ${R}
    `}};O([v()],As.prototype,`app`,void 0),O([v()],As.prototype,`baseUrl`,void 0),O([S()],As.prototype,`opened`,void 0),O([S()],As.prototype,`notifications`,void 0),As=O([h(`mateu-notification-bell`)],As);var js=e=>{if(!e||!(`querySelectorAll`in e))return null;for(let t of e.querySelectorAll(`*`)){if(t.tagName?.toLowerCase()===`mateu-component`)return t;let e=js(t.shadowRoot);if(e)return e}return null},Ms=async(e,t,n)=>{let r=js(t.renderRoot??t);await Vo.runAction(Ge,t.baseUrl??``,e.rootRoute||`_no_route`,``,n,r?.id??`app-header-action`,{},e.serverSideType??``,{},{},r??t,!0,void 0,!1,``)},Ns=async(e,t,n)=>{try{await Ms(e,t,n)}catch(e){pa({text:`La acción falló: `+e,position:`bottomStart`,duration:6e3,variant:`error`},t)}},Ps=(e,t)=>{let n=e.contextSelectors??[],r=e.contextActions??[];return n.length===0&&r.length===0&&!e.notificationsEnabled?_:w`${e.notificationsEnabled?w`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??``}"></mateu-notification-bell>`:_}${n.map(n=>w`
        <mateu-app-context-picker .selector="${n}" .app="${e}" .baseUrl="${t.baseUrl??``}"></mateu-app-context-picker>`)}${r.map(n=>(n.children?.length??0)>0?w`
        <details class="mateu-nav-group" style="margin-left: 0.5rem; flex-shrink: 0;">
            <summary class="app-header-action-btn">${n.label} ▾</summary>
            <div class="mateu-nav-panel" style="right: 0; left: auto;">
                ${n.children.map(n=>w`
                    <button class="mateu-nav-item" @click="${()=>n.actionId&&Ns(e,t,n.actionId)}">${n.label}</button>`)}
            </div>
        </details>`:w`
        <button class="app-header-action-btn" style="margin-left: 0.5rem; flex-shrink: 0;"
            @click="${()=>n.actionId&&Ns(e,t,n.actionId)}" title="${n.label}">${n.icon?F(n.icon):_}${n.label}</button>`)}`},Fs=(e,t)=>w`
    <button class="mateu-nav-item ${e.selected?`mateu-nav-item--active`:``}"
            ?disabled="${e.disabled}"
            @click="${()=>t(e)}">${e.text}</button>`,Is=(e,t,n=``)=>w`
    <nav class="mateu-nav ${n}">
        ${e.map(e=>(e.children?.length??0)>0?w`<details class="mateu-nav-group">
                       <summary class="mateu-nav-item">${e.text} ▾</summary>
                       <div class="mateu-nav-panel">
                           ${e.children.map(e=>Fs(e,t))}
                       </div>
                   </details>`:Fs(e,t))}
    </nav>`,Ls=(e,t)=>n=>t.call(e,{detail:{value:n}}),Rs=(e,t)=>e.themeToggle?w`
        <button class="app-chrome-icon-btn" @click="${t.toggleTheme}"
            title="${t.isDark?`Switch to light mode`:`Switch to dark mode`}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            ${F(t.isDark?`vaadin:sun-o`:`vaadin:moon`,`color: var(--lumo-body-text-color);`)}
        </button>
    `:_,zs=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},Bs=(e,t,n)=>{let r=Vs(e,t,n),i=Z(t,n);return r==`list`||r==i?`new`:r},Vs=(e,t,n)=>{let r=e?._route;if(r!=null&&(r===``||r.startsWith(`/`))){let e=n.homeRoute??``,i=e.indexOf(`?`),a=i>=0?e.substring(i+1):``,o=Z(t,n)+r;return a?o+(o.indexOf(`?`)>=0?`&`:`?`)+a:o}return t.selectedRoute?t.selectedRoute:n.homeRoute},Z=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,Hs=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,Us=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,Ws=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,Gs=(e,t,n,r,i,a,o)=>{if(t.chromeless)return w`
            <div class="app chromeless">
                <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}" style="height: 100%;">
                    <div class="m-md">
                        <div class="m-scroll" style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${Vs(r,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${Hs(e,t)}"
                                        consumedRoute="${Z(e,t)}"
                                        serverSideType="${Us(e,t)}"
                                        uriPrefix="${Ws(e,t)}"
                                        style="width: 100%;"
                                        .appState="${a}"
                                        .appData="${o}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                        ${t.sseUrl?w`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:_}
                    </div>
                </div>
                <slot></slot>
            </div>
        `;let s=e.mapItems(t.menu,e.filter?.toLowerCase()??``),c=Z(e,t),l=Bs(r,e,t),u=l&&l!==`new`&&l.startsWith(c+`/`)?l.substring(c.length+1).split(`/`)[0]:void 0;return w`
                    ${t.variant==qe.MEDIATOR?w`

                        ${t.layout==`SPLIT`?w`
                            <div class="m-md">
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${Z(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Hs(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${Us(e,t)}"
                                            uriPrefix="${Ws(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...a,_splitDetailId:u}}"
                                            .appData="${o}"
                                            instant="${c}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${Bs(r,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${Hs(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${Us(e,t)}"
                                            uriPrefix="${Ws(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>

                            </div>
                        `:w`
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${Vs(r,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${Hs(e,t)}"
                                        consumedRoute="${Z(e,t)}"
                                        serverSideType="${Us(e,t)}"
                                        uriPrefix="${Ws(e,t)}"
                                        style="width: 100%;"
                                        .appState="${a}"
                                        .appData="${o}"
                                        .initialState="${r}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:_}
            ${t.variant==qe.HAMBURGUER_MENU?w`
                <div class="mateu-app-layout m-app-layout ${t.drawerClosed?``:`drawer-open`} ${t?.cssClasses}" style="${t?.style}">
                    <header class="app-navbar">
                        <button class="drawer-toggle" title="Menu"
                                @click="${e=>e.currentTarget.closest(`.m-app-layout`)?.classList.toggle(`drawer-open`)}">
                            ${F(`vaadin:menu`)}
                        </button>
                        <h2 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; margin: 0 .5rem;">${t.title}</h2><p style="margin: 0;">${t.subtitle}</p>
                        <div class="m-hl" style="margin-left: auto; align-items: center;">
                            <slot name="widgets"></slot>
                            ${Ps(t,e)}${Rs(t,e)}
                        </div>
                    </header>
                    <div class="app-body">
                        <aside class="app-drawer p-s" @navigation-requested="${e.updateRoute}">
                            ${t.menu&&t.totalMenuOptions>10?w`
                                <div style="position: sticky; top: 0; z-index: 2; background: var(--lumo-base-color); padding: .25rem 0 .5rem;">
                                    <input class="drawer-search" placeholder="Search…" style="width: calc(100% - 20px); margin: 0 10px;"
                                           @input="${t=>zs({detail:{value:t.target.value}},e)}">
                                </div>
                                `:_}
                            <nav class="side-nav">
                                ${e.renderSideNav(s,void 0)}
                            </nav>
                        </aside>
                        <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}" style="flex: 1; min-width: 0;">
                            <div class="m-md">
                                <div class="m-scroll" style="height: 100%;">
                                    <mateu-api-caller>
                                        <mateu-ux
                                                route="${Vs(r,e,t)}"
                                                id="ux_${e.id}"
                                                baseUrl="${Hs(e,t)}"
                                                consumedRoute="${Z(e,t)}"
                                                serverSideType="${Us(e,t)}"
                                                uriPrefix="${Ws(e,t)}"
                                                style="width: 100%;"
                                                .appState="${a}"
                                                .appData="${o}"
                                                instant="${e.instant}"
                                                @navigation-requested="${e.updateRoute}"
                                        ></mateu-ux>
                                    </mateu-api-caller>
                                </div>
                                ${t.sseUrl?w`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:_}
                            </div>
                        </div>
                    </div>
                </div>

            `:_}
            
            ${t.variant==qe.MENU_ON_TOP?w`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <div class="m-hl" style="align-items: center;">
                            ${t.logo?w`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:_}
                            ${t.title?w`<h2 style="margin: 0 var(--lumo-space-l, 1.5rem) 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:_}
                        </div>
                        </a>
                        ${(()=>{let t=Ls(e,e.itemSelected);return N.get()?.renderTopNav?.(s,t,`menu-on-top`)??Is(s,t,`menu-on-top`)})()}
                        <div class="m-hl" style="margin-left: auto; flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${Ps(t,e)}${Rs(t,e)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Vs(r,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Hs(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${Us(e,t)}"
                                            uriPrefix="${Ws(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?w`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:_}
                        </div>
                    </div>
                </div>

            `:_}

            ${t.variant==qe.TILES?w`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <div class="m-hl" style="align-items: center;">
                            ${t.logo?w`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:_}
                            ${t.title?w`<h2 style="margin: 0 var(--lumo-space-l, 1.5rem) 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:_}
                        </div>
                        </a>
                        ${Is(e.mapItemsForTiles(t.menu),Ls(e,e.itemSelectedTiles),`menu-on-top`)}
                        <div class="m-hl" style="margin-left: auto; flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${Ps(t,e)}${Rs(t,e)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):w`
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Vs(r,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Hs(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${Us(e,t)}"
                                            uriPrefix="${Ws(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?w`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:_}
                        </div>
                        `}
                    </div>
                </div>
            `:_}

            ${t.variant==qe.RAIL?w`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):_}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Vs(r,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Hs(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${Us(e,t)}"
                                            uriPrefix="${Ws(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?w`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:_}
                        </div>
                    </div>
                </div>
            `:_}

            ${t.variant==qe.MENU_ON_LEFT?w`

                <div class="m-hl">
                    <div class="m-scroll" style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <div class="m-vl"
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(t=>e.renderOptionOnLeftMenu(t))}
                            ${Ps(t,e)}${Rs(t,e)}
                        </div>
                    </div>
                    <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Vs(r,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Hs(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${Us(e,t)}"
                                            uriPrefix="${Ws(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?w`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:_}
                        </div>
                    </div>
                </div>


            `:_}

            ${t.variant==qe.TABS?w`
                <!--
                
                box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
                
                -->
                
                <div>
                    <div>
                        <div class="m-hl" 
                                style="width: 100%;   align-items: center; border-bottom: 1px solid var(--lumo-contrast-10pct);" 
                                theme="spacing"
                                @navigation-requested="${e.updateRoute}">
                            <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                            <div class="m-hl" style="align-items: center;">
                                ${t.logo?w`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:_}
                                ${t.title?w`<h2 style="margin: 0 var(--lumo-space-l, 1.5rem) 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:_}
                            </div>
                            </a>
                            <nav class="mateu-tabs ${e.component?.cssClasses??``}" style="flex-grow: 1; min-width: 0; margin-left: 1.5rem;">
                                ${t.menu.map((n,r)=>w`
                                <button class="mateu-tab ${r===e.getSelectedIndex(t.menu)?`mateu-tab--active`:``}"
                                        @click="${()=>e.selectRoute(n.consumedRoute,n.route,n.actionId,n.baseUrl,n.serverSideType,n.uriPrefix)}"
                                >${n.label}</button>`)}
                            </nav>
                            <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${Ps(t,e)}${Rs(t,e)}
                            </div>
                        </div>
                    </div>
                    <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Vs(r,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Hs(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${Us(e,t)}"
                                            uriPrefix="${Ws(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?w`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:_}
                        </div>
                    </div>
                </div>
            
            `:_}

            ${t.fabs?.map((n,r)=>w`
                <button class="app-fab" style="bottom: ${(t.sseUrl?5.5:1.5)+r*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(n.actionId)}"
                    title="${n.label}">
                    ${F(n.icon)}
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?w`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    ${F(`vaadin:comments-o`)}
                </button>
            `:_}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},Ks=(e,t)=>t!=null&&e!=null&&!e.has(t),qs=typeof HTMLElement<`u`?HTMLElement:class{},Js=class extends qs{static get observedAttributes(){return[`type`,`renderer`]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){let e=this.getAttribute(`type`)??`unknown`,t=this.getAttribute(`renderer`)??`unknown`;this.shadowRoot||this.attachShadow({mode:`open`}),this.shadowRoot.innerHTML=`
            <style>
                :host { display: block; }
                .mateu-unsupported {
                    box-sizing: border-box;
                    border: 1px dashed #b45309;
                    border-radius: 4px;
                    background: repeating-linear-gradient(45deg, #fffbeb, #fffbeb 10px, #fef3c7 10px, #fef3c7 20px);
                    color: #92400e;
                    font-family: monospace;
                    font-size: 12px;
                    line-height: 1.4;
                    padding: 6px 10px;
                    margin: 2px 0;
                }
            </style>
            <div class="mateu-unsupported" role="note">
                ⚠ Component “${e}” is not supported by the “${t}” renderer yet.
            </div>
        `}};typeof customElements<`u`&&!customElements.get(`mateu-unsupported`)&&customElements.define(`mateu-unsupported`,Js);var Ys=new Set,Xs=(e,t,n)=>{let r=`${n}/${t}`;return Ys.has(r)||(Ys.add(r),console.warn(`[mateu] Component type "${t}" is not supported by the "${n}" renderer — rendering <mateu-unsupported> placeholder.`)),w`<mateu-unsupported
            type="${t}"
            renderer="${n}"
            data-component-id="${e?.id??_}"
            slot="${e?.slot??_}"
    ></mateu-unsupported>`},Zs=class{renderFilterBar(e,t,n,r,i,a,o,s){let c=t?.metadata;return w`
            <mateu-filter-bar
                .metadata="${c}"
                @search-requested="${e.search}"
                @value-changed="${t=>{let{fieldId:n,value:r}=t.detail;e.state={...e.state,[n]:r}}}"
                @filter-reset-requested="${t=>{let{fieldIds:n}=t.detail,r={};n.forEach(e=>{r[e]=void 0}),r.searchText=void 0,e.state={...e.state,...r}}}"
                .state="${e.state}"
                .data="${i}"
                .appState="${a}"
                .appData="${o}"
                ?searchOnly="${s??!1}"
            >
                ${c?.header?.map(t=>P(e,t,n,r,i,a,o))}
            </mateu-filter-bar>
        `}renderPagination(e,t){return w`
        <mateu-pagination
                @page-changed="${e.pageChanged}"
                @fetch-more-elements="${e.fetchMoreElements}"
                .totalElements="${e.data[t?.id]?.page?.totalElements??0}"
                .pageSize="${e.data[t?.id]?.page?.pageSize??10}"
                data-testid="pagination"
                .pageNumber="${e.data[t?.id]?.page?.pageNumber??0}"
        ></mateu-pagination>
        `}renderTableComponent(e,t,n,r,i,a,o){return bn(t,(e.data?.[e.id])?.page?.content??[],r[t?.id]?.emptyStateMessage)}rendererName(){return this.constructor?.name??`unknown`}supportedClientSideTypes(){}renderClientSideComponent(e,t,n,r,i,a,o,s){let c=t?.metadata?.type??t?.type,l=Object.values(A).includes(c)?c:void 0;return Ks(this.supportedClientSideTypes(),l)?Xs(t,l,this.rendererName()):sa(e,t,n,r,i,a,o,s)}renderAppComponent(e,t,n,r,i,a,o){return Gs(e,t?.metadata,n,r,i,a,o)}},Qs=(e,t,n,r,i,a,o)=>w`
        <vaadin-virtual-list
                .items="${t.metadata.page.content}"
                ${ne(t=>w`${P(e,t,n,r,i,a,o)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??_}"
        ></vaadin-virtual-list>
    `,$s=e=>{let t=e.metadata;return w`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??_}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${c(()=>w`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>${t.text}</div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
    `},ec=(e,t={})=>{let n=e.metadata,r=n.valueKey?t[n.valueKey]:n.value;return w`
        <div style="${e.style}">
        <vaadin-progress-bar
                ?indeterminate="${n.indeterminate}"
                min="${n.min&&n.min!=0?n.min:_}"
                max="${n.max&&n.max!=0?n.max:_}"
                value="${r??_}"
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??_}"
        ></vaadin-progress-bar>
        ${n.text?w`<span class="text-secondary text-xs" id="sublbl">
    ${n.text}
  </span>`:_}
        </div>
    `},tc=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`
        <vaadin-details
                ?opened="${s.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??_}"
        >
            <vaadin-details-summary slot="summary">
            ${P(e,s.summary,n,r,i,a,o)}
            </vaadin-details-summary>
            ${P(e,s.content,n,r,i,a,o)}
        </vaadin-details>
            `},nc=(e,t,n)=>{let r=e.metadata;return w`<vaadin-avatar
            img="${r.image}"
            name="${M(r.name,t,n)}"
            abbr="${r.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??_}"
    ></vaadin-avatar>`},rc=e=>{let t=e.metadata;return w`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??_}">
    </vaadin-avatar-group>`},ic=(e,t,n,r,i,a,o)=>{let s=t.metadata;if(!s)return w``;let c=``;return s.variants?.map(e=>e==`stretchMedia`?`stretch-media`:e==`coverMedia`?`cover-media`:e).forEach(e=>c+=` `+e),c=c.trim(),w`
        <vaadin-card
                style="${t.style}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??_}"
        >
            ${s.media?mt(e,s.media,n,r,i,a,o,`media`,!1):_}
            ${s.title?mt(e,s.title,n,r,i,a,o,`title`,!1):_}
            ${s.subtitle?mt(e,s.subtitle,n,r,i,a,o,`subtitle`,!1):_}
            ${s.header?mt(e,s.header,n,r,i,a,o,`header`,!1):_}
            ${s.headerPrefix?mt(e,s.headerPrefix,n,r,i,a,o,`header-prefix`,!1):_}
            ${s.headerSuffix?mt(e,s.headerSuffix,n,r,i,a,o,`header-suffix`,!1):_}
            ${s.footer?mt(e,s.footer,n,r,i,a,o,`footer`,!1):_}
            ${s.content?P(e,s.content,n,r,i,a,o,!1):_}
        </vaadin-card>
    `},ac=e=>e>0&&e<640?`accordion`:`tabs`,oc=class extends y{constructor(...e){super(...e),this.tabLabels=[],this.mode=`tabs`,this.selected=0,this.selectedChangedListener=e=>{let t=e.detail?.value;typeof t==`number`&&t>=0&&(this.selected=t)}}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{for(let t of e)this.mode=ac(t.contentRect.width)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=void 0,this.detachTabsListener()}detachTabsListener(){this.slottedTabs?.removeEventListener(`selected-changed`,this.selectedChangedListener),this.slottedTabs=void 0}tabsSlotChanged(e){this.detachTabsListener();let t=e.target.assignedElements().find(e=>`selected`in e);t&&(this.slottedTabs=t,t.addEventListener(`selected-changed`,this.selectedChangedListener),t.selected=this.selected)}select(e){this.selected=e,this.slottedTabs&&(this.slottedTabs.selected=e)}updated(){this.slottedTabs&&this.slottedTabs.selected!=this.selected&&(this.slottedTabs.selected=this.selected)}static{this.styles=m`
        :host {
            display: block;
        }
        .strip[hidden] {
            display: none;
        }
        .panel[hidden] {
            display: none;
        }
        .accordion {
            display: flex;
            flex-direction: column;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-m, 8px);
            overflow: hidden;
        }
        .acc-item + .acc-item {
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
        }
        .acc-header {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: .5rem;
            border: none;
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
            cursor: pointer;
            font: inherit;
            font-weight: 500;
            color: var(--lumo-body-text-color, #1a1a1a);
            padding: var(--lumo-space-s, .5rem) var(--lumo-space-m, 1rem);
            text-align: start;
        }
        .acc-header:hover {
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.06));
        }
        .acc-header[aria-expanded="true"] {
            background: var(--lumo-base-color, #fff);
        }
        .acc-header .chevron {
            color: var(--lumo-secondary-text-color, #666);
            font-size: var(--lumo-font-size-s, .875rem);
            transition: transform .15s ease-in-out;
        }
        .acc-header[aria-expanded="true"] .chevron {
            transform: rotate(90deg);
        }
        .acc-body {
            padding: 0 var(--lumo-space-m, 1rem);
        }
        .acc-body[hidden] {
            display: none;
        }
    `}render(){return w`
            <div class="strip" ?hidden="${this.mode!=`tabs`}">
                <slot name="tabs" @slotchange="${this.tabsSlotChanged}"></slot>
            </div>
            ${this.mode==`tabs`?w`
                ${this.tabLabels.map((e,t)=>w`
                    <div class="panel" ?hidden="${t!=this.selected}">
                        <slot name="panel-${t}"></slot>
                    </div>
                `)}
            `:w`
                <div class="accordion" part="accordion">
                    ${this.tabLabels.map((e,t)=>w`
                        <div class="acc-item">
                            <button class="acc-header"
                                    aria-expanded="${t==this.selected}"
                                    aria-controls="acc-body-${t}"
                                    @click="${()=>this.select(t)}"
                            >
                                <span>${e??_}</span>
                                <span class="chevron">⟩</span>
                            </button>
                            <div class="acc-body" id="acc-body-${t}" ?hidden="${t!=this.selected}">
                                <slot name="panel-${t}"></slot>
                            </div>
                        </div>
                    `)}
                </div>
            `}
        `}};O([v({type:Array})],oc.prototype,`tabLabels`,void 0),O([S()],oc.prototype,`mode`,void 0),O([S()],oc.prototype,`selected`,void 0),oc=O([h(`mateu-adaptive-tabs`)],oc);var sc=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style;c??=``,s.columnSpacing&&(c+=`--vaadin-form-layout-column-spacing: `+s.columnSpacing+`;`);let l=s.itemRowSpacing&&s.itemRowSpacing!==`0`?s.itemRowSpacing:`var(--lumo-space-m)`;return c+=`--vaadin-form-layout-row-spacing: `+l+`;`,s.itemLabelSpacing&&(c+=`--vaadin-form-layout-label-spacing: `+s.itemLabelSpacing+`;`),s.labelsAside&&(c+=`--vaadin-form-item-label-width: 10rem;`),s.fullWidth&&(c+=`width: 100%;`),w`
               <vaadin-form-layout 
                       .responsiveSteps="${s.responsiveSteps||_}"  
                       style="${c||_}" 
                       class="${t.cssClasses}"
                       max-columns="${s.maxColumns&&s.maxColumns>0?s.maxColumns:_}"
                       auto-responsive="${s.autoResponsive||_}"
                       column-width="${s.columnWidth||_}"
                       expand-columns="${s.expandColumns||_}"
                       expand-fields="${s.expandFields||!s.labelsAside||_}"
                       labels-aside="${s.labelsAside||_}"
                       slot="${t.slot||_}"
               >
                   ${t.children?.map(t=>cc(s,e,t,n,r,i,a,o))}
               </vaadin-form-layout>
            `},cc=(e,t,n,r,i,a,o,s)=>n.type==k.ClientSide&&n.metadata?.type==A.FormRow?uc(e,t,n,r,i,a,o,s):e.labelsAside?lc(t,n,r,i,a,o,s):P(t,n,r,i,a,o,s),lc=(e,t,n,r,i,a,o)=>{if(t.type==k.ClientSide&&t.metadata?.type==A.FormField&&t.metadata.label){let s=t.metadata,c=s.label?.includes("${")?e._evalTemplate(s.label):s.label;return w`
                       <vaadin-form-item data-colspan="${s.colspan}">
                           <label slot="label">${c}</label>
                           ${P(e,t,n,r,i,a,o,!0)}
                       </vaadin-form-item>
                   `}return P(e,t,n,r,i,a,o)},uc=(e,t,n,r,i,a,o,s)=>w`
        <vaadin-form-row>
            ${n.children?.map(n=>cc(e,t,n,r,i,a,o,s))}
        </vaadin-form-row>
            `,dc=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=(s.padding?` padding`:``)+(s.spacing?` spacing`:``)+(s.spacingVariant?` spacing-`+s.spacingVariant:``)+(s.wrap?` wrap`:``),l=t.style;return s.fullWidth&&(l=l?`width: 100%;`+l:`width: 100%;`),s.justification&&(l=l?`justify-content: `+s.justification+`;`+l:`justify-content: `+s.justification+`;`),s.verticalAlignment&&(l=l?`align-items: `+s.verticalAlignment+`;`+l:`align-items: `+s.verticalAlignment+`;`),w`
               <vaadin-horizontal-layout 
                       style="${l}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??_}"
               >
                   ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
               </vaadin-horizontal-layout>
            `},fc=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=(s.padding?` padding`:``)+(s.spacing?` spacing`:``)+(s.spacingVariant?` spacing-`+s.spacingVariant:``)+(s.wrap?` wrap`:``),l=t.style;return s.fullWidth&&(l=l?`width: 100%;`+l:`width: 100%;`),s.justification&&(l=l?`justify-content: `+s.justification+`;`+l:`justify-content: `+s.justification+`;`),s.horizontalAlignment&&(l=l?`align-items: `+s.horizontalAlignment+`;`+l:`align-items: `+s.horizontalAlignment+`;`),w`
        <vaadin-vertical-layout
                style="${l}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??_}"
        >
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </vaadin-vertical-layout>
    `},pc=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style;return s.fullWidth&&(c=c?`width: 100%;`+c:`width: 100%;`),w`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${s.orientation??_}"
                       theme="${s.variant??_}"
                       slot="${t.slot??_}"
               >
                   <master-content>${P(e,t.children[0],n,r,i,a,o)}</master-content>
                   <detail-content>${P(e,t.children[1],n,r,i,a,o)}</detail-content>
               </vaadin-split-layout>
            `},mc=(e,t,n,r,i,a,o)=>{let s=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,l=!!i?.hasDetail||!!s,u=c??s;return w`
               <vaadin-master-detail-layout ?has-detail="${l}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??_}">
                   <div>${P(e,t.children[0],n,r,i,a,o)}</div>
                   ${l&&u?w`<div slot="detail">${P(e,u,n,r,i,a,o)}</div>`:w`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},hc=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style;c??=``,s.fullWidth&&(c+=`width: 100%;`);let l=s.variant;l==`equalWidth`&&(l=`equal-width-tabs`);let u=Math.max(0,(t.children??[]).findIndex(e=>e.metadata.active)),d=e=>{e.target.selected=u};if(s.adaptable){let u=(t.children??[]).map(t=>{let n=t.metadata.label;return n?.includes("${")?e._evalTemplate(n):n});return w`
            <mateu-adaptive-tabs
                    .tabLabels="${u}"
                    style="${c}"
                    class="${t.cssClasses}"
                    slot="${t.slot??_}"
            >
                <vaadin-tabs slot="tabs"
                             theme="${l??_}"
                             orientation="${s.orientation??_}"
                             @items-changed=${d}
                >
                    ${t.children?.map(e=>e).map((e,t)=>{let n=e.metadata.shortcut;return w`
                        <vaadin-tab id="${u[t]}"
                                    style="${e.style}"
                                    class="${e.cssClasses}"
                                    data-shortcut="${n??_}"
                        >${u[t]}</vaadin-tab>`})}
                </vaadin-tabs>

                ${t.children?.map((t,s)=>w`
                    <div slot="panel-${s}" style="padding: var(--lumo-space-m) 0;">
                        ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
                    </div>`)}
            </mateu-adaptive-tabs>
                `}return w`
        <vaadin-tabsheet
                theme="${l??_}"
                style="${c}"
                slot="${t.slot??_}"
        >
            <vaadin-tabs slot="tabs"
                         style="${c}"
                         class="${t.cssClasses}"
                         orientation="${s.orientation??_}"
                         @items-changed=${d}
            >
                ${t.children?.map(e=>e).map(t=>{let n=t.metadata.label,r=n?.includes("${")?e._evalTemplate(n):n,i=t.metadata.shortcut;return w`
                    <vaadin-tab id="${r}"
                                style="${t.style}"
                                class="${t.cssClasses}"
                                data-shortcut="${i??_}"
                    >${r}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map(t=>gc(e,t,n,r,i,a,o))}
        </vaadin-tabsheet>
            `},gc=(e,t,n,r,i,a,o)=>{let s=t.metadata.label;return w`
        <div tab="${s?.includes("${")?e._evalTemplate(s):s}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
               </div>
            `},_c=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style;s.fullWidth&&(c=c?`width: 100%;`+c:`width: 100%;`);let l=0;if(t.children){for(let e=0;e<t.children.length;e++)if(t.children[e].metadata?.active){l=e;break}}return w`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${l}"
                       slot="${t.slot??_}"
               >
                   ${t.children?.map(t=>vc(e,t,n,r,i,a,o,s.variant))}
               </vaadin-accordion>
            `},vc=(e,t,n,r,i,a,o,s)=>{let c=t.metadata,l=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return w`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${s??_}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${l}</vaadin-accordion-heading>
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </vaadin-accordion-panel>
            `},yc=(e,t,n,r,i,a,o)=>w`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??_}">
                   ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
               </vaadin-scroller>
            `,bc=(e,t,n,r,i,a,o)=>w`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??_}">
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </vaadin-board>
            `,xc=(e,t,n,r,i,a,o)=>w`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
               </vaadin-board-row>
            `,Sc=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${s.boardCols??_}"
        >
                   ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
               </div>
            `},Cc=(e,t,n)=>w`
    <vaadin-menu-bar
        .items=${e}
        class="${n??_}"
        @item-selected=${e=>t(e.detail.value)}>
    </vaadin-menu-bar>`,wc=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`
        <vaadin-context-menu .items=${Dc(e,s.menu,n,r,i,a,o)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${s.activateOnLeftClick?`click`:_}"
                             slot="${t.slot??_}">
            ${P(e,s.wrapped,n,r,i,a,o)}
        </vaadin-context-menu>
            `},Tc=(e,t,n,r,i)=>{let a=t.metadata;return w`
        <vaadin-menu-bar .items=${Dc(e,a.options,n,r,i,D,de)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??_}">
        </vaadin-menu-bar>
            `},Ec=(e,t,n,r,i,a,o)=>{let s=document.createElement(`vaadin-context-menu-item`);return ie(P(e,t,n,r,i,a,o),s),s},Dc=(e,t,n,r,i,a,o)=>t.map(t=>t.submenus?{text:t.component?void 0:t.label,route:t.path,checked:t.selected,disabled:t.disabled,className:t.className,component:t.component?Ec(e,t.component,n,r,i,a,o):void 0,children:Dc(e,t.submenus,n,r,i,a,o)}:t.separator?{component:`hr`}:{text:t.component?void 0:t.label,route:t.path,checked:t.selected,disabled:t.disabled,className:t.className,component:t.component?Ec(e,t.component,n,r,i,a,o):void 0}),Oc=class extends y{constructor(...e){super(...e),this.fieldId=``,this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{let t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;let n=t.getContext(`2d`);n.lineWidth=2,n.lineCap=`round`,n.lineJoin=`round`,n.strokeStyle=getComputedStyle(this).getPropertyValue(`--lumo-body-text-color`)||`#1a1a1a`;let[r,i]=this.pointerPosition(e);n.beginPath(),n.moveTo(r,i),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;let t=e.target.getContext(`2d`),[n,r]=this.pointerPosition(e);t.lineTo(n,r),t.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector(`canvas`)}pointerPosition(e){let t=e.target.getBoundingClientRect();return[e.clientX-t.left,e.clientY-t.top]}ensureCanvasSize(e){let t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){let e=this.canvas();e&&e.getContext(`2d`).clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){let e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL(`image/png`)))}renderPad(){return w`
            <canvas class="pad"
                    @pointerdown="${this.startStroke}"
                    @pointermove="${this.stroke}"
                    @pointerup="${this.endStroke}"
                    @pointercancel="${this.endStroke}"></canvas>
            <div class="actions">
                <button class="button" @click="${this.clear}">Clear</button>
                <button class="button button--primary" ?disabled="${!this.hasStrokes}"
                        @click="${this.accept}">Accept</button>
                ${this.value?w`
                    <button class="button" @click="${()=>{this.signing=!1}}">Cancel</button>`:_}
            </div>`}render(){let e=this.value!=null&&this.value!==``;return this.signing||!e?this.renderPad():w`
            <img class="preview" src="${this.value}" alt="Signature"/>
            <div class="actions">
                <button class="button" @click="${()=>{this.signing=!0,this.hasStrokes=!1,this.updateComplete.then(()=>this.clear())}}">Sign again</button>
                <button class="button button--danger" @click="${()=>this.emit(``)}">Delete</button>
            </div>`}static{this.styles=m`
        :host {
            display: block;
            max-width: 420px;
        }
        .pad {
            width: 100%;
            height: 160px;
            display: block;
            touch-action: none;
            background: var(--lumo-base-color, #fff);
            border: 1px dashed var(--lumo-contrast-40pct, rgba(0, 0, 0, 0.35));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            cursor: crosshair;
        }
        .preview {
            max-width: 100%;
            max-height: 160px;
            object-fit: contain;
            display: block;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            background: var(--lumo-base-color, #fff);
        }
        .actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        .button {
            font: inherit;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border: none;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            padding: 0.35rem 0.75rem;
            cursor: pointer;
        }
        .button--primary {
            background: var(--lumo-primary-color, rgb(0, 100, 200));
            color: var(--lumo-primary-contrast-color, #fff);
        }
        .button--primary[disabled] {
            opacity: 0.5;
            cursor: default;
        }
        .button--danger {
            color: var(--lumo-error-text-color, rgb(179, 49, 31));
        }
    `}};O([v()],Oc.prototype,`fieldId`,void 0),O([v()],Oc.prototype,`value`,void 0),O([S()],Oc.prototype,`signing`,void 0),O([S()],Oc.prototype,`hasStrokes`,void 0),Oc=O([h(`mateu-signature-pad`)],Oc);var kc=class extends y{constructor(...e){super(...e),this.fieldId=``,this.options=[],this.leavesOnly=!1,this.opened=!1,this.expandedItems=[],this._normalized=[],this.dataProvider=(e,t)=>{let n=e.parentItem?e.parentItem.children??[]:this.normalized;t(n,n.length)}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get normalized(){return this._optsSource!==this.options&&(this._optsSource=this.options,this._normalized=this.normalizeOptions(this.options??[])),this._normalized}normalizeOptions(e){return e.map(e=>{let t=e.children&&e.children.length?this.normalizeOptions(e.children):void 0;return{...e,children:t}})}ancestorsOf(e,t){for(let n of t){if(String(n.value)===e)return[];let t=n.children?this.ancestorsOf(e,n.children):null;if(t!=null)return[n,...t]}return null}labelOf(e,t){for(let n of t){if(String(n.value)===e)return n.label;let t=n.children?this.labelOf(e,n.children):null;if(t!=null)return t}return null}open(){this.opened||(this.expandedItems=this.value==null?[]:this.ancestorsOf(String(this.value),this.normalized)??[],this.opened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.close()},document.addEventListener(`mousedown`,this.outsideClick))}close(){this.detachOutsideClick(),this.opened=!1}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}pick(e){this.close(),this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e.value,fieldId:this.fieldId},bubbles:!0,composed:!0}))}clear(){this.close(),this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:void 0,fieldId:this.fieldId},bubbles:!0,composed:!0}))}onActiveItemChanged(e){let t=e.detail.value;if(t){if((t.children?.length??0)>0&&this.leavesOnly){this.expandedItems=this.expandedItems.includes(t)?this.expandedItems.filter(e=>e!==t):[...this.expandedItems,t],e.target.activeItem=null;return}this.pick(t)}}render(){let e=this.value!=null&&this.value!==``?this.labelOf(String(this.value),this.normalized)??String(this.value):``;return w`
            <div class="root">
                <vaadin-button class="control" theme="tertiary"
                               @click="${()=>this.opened?this.close():this.open()}">
                    <span class="${e?``:`placeholder`}">${e||`—`}</span>
                    <span class="chevron" slot="suffix" aria-hidden="true">▾</span>
                </vaadin-button>
                ${this.opened?w`
                    <div class="panel">
                        ${this.value?w`
                            <div class="clear-row">
                                <vaadin-button theme="tertiary small" @click="${this.clear}">— Clear</vaadin-button>
                            </div>`:_}
                        <vaadin-grid
                                theme="compact no-border no-row-borders"
                                all-rows-visible
                                .dataProvider="${this.dataProvider}"
                                .itemHasChildrenPath="${`children`}"
                                .expandedItems="${this.expandedItems}"
                                @expanded-items-changed="${e=>{this.expandedItems=e.detail.value}}"
                                @active-item-changed="${this.onActiveItemChanged}">
                            <vaadin-grid-tree-column path="label"></vaadin-grid-tree-column>
                        </vaadin-grid>
                    </div>`:_}
            </div>`}static{this.styles=m`
        :host {
            display: block;
            width: 100%;
            min-width: 12rem;
        }
        .root {
            position: relative;
        }
        .control {
            width: 100%;
        }
        /* vaadin-button centres its slotted content; spread the value (left) and chevron (right). */
        .control::part(label) {
            display: flex;
            width: 100%;
            align-items: center;
            justify-content: space-between;
        }
        .placeholder {
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.5));
        }
        .chevron {
            opacity: 0.6;
            font-size: 0.75em;
        }
        .panel {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            min-width: 100%;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 16px rgba(0, 0, 0, 0.15));
            z-index: 300;
            padding: 0.25rem;
        }
        .clear-row {
            padding-bottom: 0.25rem;
            margin-bottom: 0.25rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
        }
        vaadin-grid {
            min-width: 16rem;
            max-height: 18rem;
        }
    `}};O([v()],kc.prototype,`fieldId`,void 0),O([v()],kc.prototype,`value`,void 0),O([v()],kc.prototype,`options`,void 0),O([v({type:Boolean})],kc.prototype,`leavesOnly`,void 0),O([S()],kc.prototype,`opened`,void 0),O([S()],kc.prototype,`expandedItems`,void 0),kc=O([h(`mateu-vaadin-tree-select`)],kc);var Ac=class extends y{constructor(...e){super(...e),this.fieldId=``,this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{let t=e.target,n=t.files?.[0];if(!n)return;let r=new FileReader;r.onload=()=>this.emit(r.result),r.readAsDataURL(n),t.value=``}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:`environment`},audio:!1}),this.cameraOpen=!0,await this.updateComplete;let e=this.renderRoot.querySelector(`video`);e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){let e=this.renderRoot.querySelector(`video`);if(!e||e.videoWidth===0)return;let t=document.createElement(`canvas`);t.width=e.videoWidth,t.height=e.videoHeight,t.getContext(`2d`).drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL(`image/jpeg`,.9))}triggerFallback(){this.renderRoot.querySelector(`input[type=file]`)?.click()}render(){let e=this.value!=null&&this.value!==``;return w`
            <input type="file" accept="image/*" capture="environment" style="display: none;"
                   @change="${this.fileFallback}">
            ${this.cameraOpen?w`
                <video class="viewfinder" playsinline muted></video>
                <div class="actions">
                    <button class="button button--primary" @click="${this.shoot}">Capture</button>
                    <button class="button" @click="${this.closeCamera}">Cancel</button>
                </div>
            `:w`
                ${e?w`<img class="preview" src="${this.value}" alt="Photo"/>`:w`<div class="placeholder" aria-hidden="true">📷</div>`}
                <div class="actions">
                    <button class="button button--primary" @click="${this.openCamera}">
                        ${e?`Retake`:`Take photo`}
                    </button>
                    ${this.cameraError?w`
                        <button class="button" @click="${this.triggerFallback}">Use file / native camera</button>`:_}
                    ${e?w`
                        <button class="button button--danger" @click="${()=>this.emit(``)}">Delete</button>`:_}
                </div>
                ${this.cameraError?w`
                    <div class="error-hint">Camera unavailable — the file picker opens the device camera on phones.</div>`:_}
            `}`}static{this.styles=m`
        :host {
            display: block;
            max-width: 420px;
        }
        .viewfinder {
            width: 100%;
            max-height: 260px;
            display: block;
            background: #000;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
        }
        .preview {
            max-width: 100%;
            max-height: 240px;
            object-fit: contain;
            display: block;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
        }
        .placeholder {
            height: 135px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            border: 1px dashed var(--lumo-contrast-30pct, rgba(0, 0, 0, 0.3));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
        }
        .actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        .button {
            font: inherit;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border: none;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            padding: 0.35rem 0.75rem;
            cursor: pointer;
        }
        .button--primary {
            background: var(--lumo-primary-color, rgb(0, 100, 200));
            color: var(--lumo-primary-contrast-color, #fff);
        }
        .button--danger {
            color: var(--lumo-error-text-color, rgb(179, 49, 31));
        }
        .error-hint {
            margin-top: 0.35rem;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.6));
        }
    `}};O([v()],Ac.prototype,`fieldId`,void 0),O([v()],Ac.prototype,`value`,void 0),O([S()],Ac.prototype,`cameraOpen`,void 0),O([S()],Ac.prototype,`cameraError`,void 0),Ac=O([h(`mateu-camera-capture`)],Ac);var jc,Mc=(e,t)=>{if(!e)return;if(Array.isArray(e)){let n=e.find(e=>e.key==t);return n?.value==null?void 0:String(n.value)}let n=e[t];return n==null?void 0:String(n)},Nc=class extends y{static{jc=this}constructor(...e){super(...e),this.fieldId=``,this.editable=!0,this.filePicked=e=>{let t=e.target,n=t.files?.[0];if(!n)return;let r=new FileReader;r.onload=()=>{let e=r.result,t=e.indexOf(`,`),i=e.substring(0,t).replace(`;base64`,`;name=${encodeURIComponent(n.name)};base64`);this.emit(i+e.substring(t))},r.readAsDataURL(n),t.value=``}}static fileName(e){if(!e)return``;if(e.startsWith(`data:`)){let t=e.indexOf(`,`),n=e.substring(5,t<0?e.length:t).split(`;`).find(e=>e.startsWith(`name=`));if(n)try{return decodeURIComponent(n.substring(5))}catch{return n.substring(5)}return`Attached file`}return e.split(`/`).pop()||e}emit(e){this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}triggerPick(){this.renderRoot.querySelector(`input[type=file]`)?.click()}render(){let e=this.value!=null&&this.value!==``,t=jc.fileName(this.value),n=e&&this.value.startsWith(`data:`),r=e?w`<span class="file" title="${t}">📄 ${n?w`<a href="${this.value}" download="${t}">${t}</a>`:w`<a href="${this.value}" target="_blank">${t}</a>`}</span>`:_;return this.editable?w`
            <input type="file" accept="${this.accept||_}" style="display: none;"
                   @change="${this.filePicked}">
            <div class="row">
                ${r}
                <button class="button" @click="${this.triggerPick}">
                    ${e?`Replace`:`Choose file`}
                </button>
                ${e?w`
                    <button class="button button--danger" @click="${()=>this.emit(``)}">Remove</button>`:_}
            </div>`:w`${e?r:w`<span class="empty">—</span>`}`}static{this.styles=m`
        :host {
            display: block;
        }
        .row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            min-height: var(--lumo-size-m, 2.25rem);
        }
        .file {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 18rem;
            font-size: var(--lumo-font-size-s, 0.875rem);
        }
        .file a {
            color: var(--lumo-primary-text-color, rgb(0, 100, 200));
            text-decoration: none;
        }
        .empty {
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.6));
        }
        .button {
            font: inherit;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border: none;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            padding: 0.35rem 0.75rem;
            cursor: pointer;
        }
        .button--danger {
            color: var(--lumo-error-text-color, rgb(179, 49, 31));
        }
    `}};O([v()],Nc.prototype,`fieldId`,void 0),O([v()],Nc.prototype,`value`,void 0),O([v()],Nc.prototype,`accept`,void 0),O([v({type:Boolean})],Nc.prototype,`editable`,void 0),Nc=jc=O([h(`mateu-file-upload`)],Nc);var Pc=e=>!!e&&typeof e==`object`&&`__mateuGroup`in e,Fc=e=>String(e??``),Ic=(e,t,n)=>{let r=e??[];if(!t||!n||n.length===0)return r;let i=[],a,o=!1;return r.forEach((e,s)=>{let c=Fc(e?.[t]);if(!o||c!==a){let e=n.find(e=>Fc(e.value)===c)??{value:c,count:r.filter(e=>Fc(e?.[t])===c).length,aggregates:{}};i.push({__mateuGroup:e,__mateuGroupBy:t,_rowNumber:`__mateuGroup:${s}:${c}`}),o=!0,a=c}i.push(e)}),i},Lc=(e,t)=>e==null?``:t.dataType===`money`||t.stereotype===`money`?new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(e):t.aggregate===`count`?new Intl.NumberFormat(void 0,{maximumFractionDigits:0}).format(Math.round(e)):new Intl.NumberFormat(void 0,{maximumFractionDigits:2}).format(e),Rc=(e,t)=>e&&t.includes(e)?e:t.find(e=>!!e),zc=(e,t,n)=>{let r=e.__mateuGroup;return t.id===n?`${r.value} (${r.count})`:t.aggregate?Lc(r.aggregates?.[t.id],t):``},Bc=(e,t,n)=>{let r=t?.aggregates;if(!r||!e.some(e=>e.aggregate))return;let i={};e.forEach(e=>{e.aggregate&&r[e.id]!=null&&(i[e.id]=Lc(r[e.id],e))});let a=e[0];if(a&&i[a.id]===void 0){let e=t?.page?.totalElements;i[a.id]=n&&a.id===n&&e!=null?`Total (${e})`:`Total`}return i},Vc=(e,t,n)=>F(e[n.path]?`vaadin:check`:`vaadin:minus`,`height: 16px; width: 16px; color: var(--lumo-body-text-color);`),Hc=(e,t,n,r,i)=>{let a=e[n.path],o=a;return r==`money`&&a&&a.locale&&a.currency?o=new Intl.NumberFormat(a.locale,{style:`currency`,currency:a.currency}).format(a.value):i==`money`&&(o=new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(a)),w`${o}`},Uc=(e,t,n)=>{e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:n},bubbles:!0,composed:!0}))},Wc=(e,t,n,r,i,a)=>{let o=n.xcolumn??a;if(o.text)return o.actionId?w`<a href="javascript: void(0);" @click="${t=>Uc(n,o,e)}">${o.text}</a>`:w`<a href="${e[n.path]}">${o.text}</a>`;if(r==`string`){if(o.actionId)return w`<a href="javascript: void(0);" @click="${t=>Uc(n,o,e)}">${e[n.path]}</a>`;let t=e[n.path];return w`<a href="${t}">${t}</a>`}let s=e[n.path];return w`<a href="${s.href}">${s.text}</a>`},Gc=(e,t,n,r,i)=>{let a=e[n.path];return r==`string`?a.split(`,`).map(e=>F(e,`width: 16px;`)):a.split(`,`).map(e=>F(e.icon,`width: 16px;`))},Kc=(e,t,n,r,i)=>{let a=e[n.path];return w`${g(a)}`},qc=(e,t,n,r,i,a)=>r==`string`?w`<img src="${e[n.path]}" style="${`max-height: 40px; `+(a.style??``)}">`:w`<img src="${e[n.path].src}" style="${a.style??``}">`,Jc=e=>{let t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`action-on-row-`+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Yc=e=>{let t={_clickedRow:e.target.row},n=e.target.action;e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`action-on-row-`+n.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Xc=e=>{let t=document.createElement(`vaadin-context-menu-item`),n=document.createElement(`vaadin-icon`);return n.style.color=`var(--lumo-secondary-text-color)`,n.style.marginInlineEnd=`var(--lumo-space-s)`,n.style.padding=`var(--lumo-space-xs)`,n.setAttribute(`icon`,e.icon),t.appendChild(n),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},Zc=(e,t,n)=>{let r=e[n.path]?.actions?.map(e=>e.icon?{component:Xc(e),methodNameInCrud:e.methodNameInCrud}:{...e,text:e.label});return!r||r.length==0?w``:w`
                                     <vaadin-menu-bar
                                         .items=${[{text:`···`,children:r}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${n.path}"
                                         @item-selected="${Jc}"
                                     ></vaadin-menu-bar>
                                   `},Qc=(e,t,n)=>{if(n.path==`select`)return w`
         <vaadin-button theme="tertiary" title="Select" @click="${Yc}" .row="${e}" .action="${{actionId:n.path,icon:``,label:`Select`,disabled:!1,methodNameInCrud:`select`}}">
             Select
         </vaadin-button>
    `;let r=n.path&&e[n.path]?.methodNameInCrud?e[n.path]:e.action;return r?w`
         <vaadin-button theme="tertiary${r.icon&&!r.label?` icon`:``}" title="${r.label||_}" @click="${Yc}" .row="${e}" .action="${r}">
             ${r.icon?w`<vaadin-icon icon="${r.icon}"></vaadin-icon>`:_}
             ${r.label?r.label:_}
         </vaadin-button>
    `:w``},$c=(e,t,n)=>{e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:n},bubbles:!0,composed:!0}))},el=(e,t,n,r,i,a)=>{let o=n.xcolumn??a;if(o.actionId)return w`
            <vaadin-button theme="tertiary" @click="${t=>$c(n,o,e)}" .row="${e}">
                ${o.text||e[n.path]}
            </vaadin-button>
        `;let s=e[n.path];return w`<a href="${s}">${o.text||s}</a>`},tl=(e,t,n,r,i,a,o,s,c)=>{let l=e[n.path];return P(r,l,i,a,o,s,c)},nl=new WeakMap,rl=(e,t)=>nl.get(e)?.[t],il=(e,t,n)=>{let r=nl.get(e);r||(r={},nl.set(e,r)),r[t]=n},al=e=>{if(e==null||e===``)return null;let t=Number(e);return Number.isNaN(t)?null:t},ol=(e,t,n,r)=>{let i=n?.field?.fieldId,a=a=>{if(e[t.id]===a||e[t.id]==null&&(a===``||a==null))return;if(e[t.id]=a,!i){n.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`update-row`,parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}let o=(n?.state??r)[i];n.dispatchEvent(new CustomEvent(`value-changed`,{detail:{fieldId:i,value:Array.isArray(o)?[...o]:o},bubbles:!0,composed:!0}))},o=e[t.id],s=o==null?``:String(o);switch(t.editorType){case`boolean`:return w`<vaadin-checkbox ?checked=${!!o} @checked-changed=${e=>a(e.detail.value)}></vaadin-checkbox>`;case`integer`:return w`<vaadin-integer-field theme="small" style="width:100%;" .value=${s} @change=${e=>a(al(e.target.value))}></vaadin-integer-field>`;case`number`:return w`<vaadin-number-field theme="small" style="width:100%;" .value=${s} @change=${e=>a(al(e.target.value))}></vaadin-number-field>`;case`date`:return w`<vaadin-date-picker theme="small" style="width:100%;" .value=${s} @value-changed=${e=>a(e.detail.value)}></vaadin-date-picker>`;case`time`:return w`<vaadin-time-picker theme="small" style="width:100%;" .value=${s} @value-changed=${e=>a(e.detail.value)}></vaadin-time-picker>`;case`datetime`:return w`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${s} @value-changed=${e=>a(e.detail.value)}></vaadin-date-time-picker>`;case`select`:return w`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(e=>({label:e.label,value:String(e.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${s}
                @value-changed=${e=>a(e.detail.value)}></vaadin-combo-box>`;case`lookup`:{let r=n?.field?.fieldId,i=`search-${r}-${t.id}`,o=`${r}-${t.id}`;return w`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${(e,t)=>{n.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:i,parameters:{searchText:e.filter,size:e.pageSize,page:e.page},callback:e=>{let n=e?.fragments?.[0]?.data?.[o];t(n?.content??[],n?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${(t.editorOptions??[]).find(e=>String(e.value)===s)??(s?{value:s,label:rl(e,t.id)??s}:void 0)}
                @selected-item-changed=${n=>{let r=n.detail.value,i=r?r.value:null;String(i??``)!==s&&(r&&il(e,t.id,r.label),a(i))}}></vaadin-combo-box>`}default:return w`<vaadin-text-field theme="small" style="width:100%;" .value=${s} @change=${e=>a(e.target.value)}></vaadin-text-field>`}},sl=e=>ee(()=>w`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),cl=e=>e===void 0?_:d(()=>w`<span style="font-weight: 600; white-space: nowrap;">${e}</span>`,[e]),ll=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent(`sort-direction-changed`,{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},ul=(e,t,n,r,i,a,o,s)=>w`
<vaadin-grid-column-group header="${j(e.label,r,i)}">
    ${e.columns.map(e=>fl(e.metadata,t,n,r,i,a,o,s?.[e.metadata?.id]))}
</vaadin-grid-column-group>
`,dl=(e,t,n,r,i,a,o,s)=>A.GridGroupColumn==e.metadata?.type?ul(e.metadata,t,n,r,i,a,o,s):fl(e.metadata,t,n,r,i,a,o,s?.[e.metadata?.id]),fl=(e,n,r,i,a,o,s,c)=>{let l=j(e.label,i,a);return e.sortable?w`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??_}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??_}"
                                ?resizable="${e.resizable}"
                                width="${e.width??_}"
                                @direction-changed="${ll}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${sl(l)}
                                ${cl(c)}
                                ${t((t,c,l)=>pl(t,c,l,e,n,r,i,a,o,s),[e,i,a])}
                        ></vaadin-grid-sort-column>
                    `:e.filterable?w`
                        <vaadin-grid-filter-column
                                path="${e.id}"
                                text-align="${e.align??_}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??_}"
                                ?resizable="${e.resizable}"
                                width="${e.width??_}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${sl(l)}
                                ${cl(c)}
                                ${t((t,c,l)=>pl(t,c,l,e,n,r,i,a,o,s),[e,i,a])}
                        ></vaadin-grid-filter-column>
                    `:w`
                        <vaadin-grid-column
                                path="${e.id}"
                                text-align="${e.align??_}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??_}"
                                ?resizable="${e.resizable}"
                                width="${e.width??_}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                .xcolumn="${e}"
                                ${sl(l)}
                                ${cl(c)}
                                ${t((t,c,l)=>pl(t,c,l,e,n,r,i,a,o,s),[e,i,a])}
                        ></vaadin-grid-column>
                    `},pl=(e,t,n,r,i,a,o,s,c,l)=>{let u=n.dataset.dataType??``,d=n.dataset.stereotype??``;if(Pc(e)){let t=i?.metadata,n=(t?.columns??[]).flatMap(e=>e?.metadata?.type===A.GridGroupColumn?(e.metadata.columns??[]).map(e=>e?.metadata?.id):[e?.metadata?.id]),a=zc(e,r,Rc(e.__mateuGroupBy,n)),o=e.__mateuGroup.hiddenActions??[],s=r.id===n[n.length-1]?(t?.groupActions??[]).filter(e=>!o.includes(e.actionId??e.id)):[];return s.length?w`<span style="display: flex; align-items: center; justify-content: flex-end; gap: var(--lumo-space-s); overflow: hidden;">
                ${a?w`<span style="font-weight: 600;">${a}</span>`:_}
                ${s.map(t=>w`
                    <vaadin-button theme="tertiary small" style="flex-shrink: 0;"
                        @click="${n=>{n.stopPropagation(),n.currentTarget.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`action-on-row-`+(t.actionId??t.id),parameters:{_groupValue:e.__mateuGroup.value}},bubbles:!0,composed:!0}))}}">${t.label??t.caption??``}</vaadin-button>
                `)}
            </span>`:w`<span title="${a}" style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${a}</span>`}if(r.editable)return ol(e,r,i,o);if(u==`status`)return la(e,t,n);if(u==`bool`)return Vc(e,t,n);if(u==`money`||d==`money`)return Hc(e,t,n,u,d);if(u==`link`||d==`link`)return Wc(e,t,n,u,d,r);if(u==`icon`||d==`icon`)return Gc(e,t,n,u,d);if(d==`html`)return Kc(e,t,n,u,d);if(d==`image`)return qc(e,t,n,u,d,r);if(u==`menu`)return Zc(e,t,n);if(u==`component`)return tl(e,t,n,i,a,o,s,c,l);if(u==`action`)return Qc(e,t,n);if(u==`actionGroup`)return Zc(e,t,n);if(d==`button`||r.actionId)return el(e,t,n,u,d,r);let f=e[n.path];return w`<span title="${f}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${f}</span>`},ml=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},hl=(e,t)=>{let n=t;for(;n;){if(n===e)return!0;n=n.assignedSlot??n.parentNode??n.host??null}return!1},gl=class extends et{constructor(...e){super(...e),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{let t=e.currentTarget,n=t.getEventContext(e)?.item??null;n!==this.hoveredItem&&(this.hoveredItem=n,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?`hovered-cell`:``,this._onRowKey=e=>{let t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!In(t,e))return;let n=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!n)return;let r=this.currentItems(),i=parseInt(n[1],10)-1;i>=r.length||(e.preventDefault(),this.selectRow(r[i]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener(`keydown`,this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener(`keydown`,this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+`_selected_items`]=[e],this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;let e=ml();if(e&&e!==document.body&&!hl(this,e)){let t=e.tagName?.toLowerCase()??``;if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith(`vaadin-`)&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){let{item:t,selected:n,shiftKey:r}=e.detail;if(this.rangeStartItem??=t,r){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);let[r,i]=[this.rangeStartItem,t].map(t=>e.indexOf(t)).sort((e,t)=>e-t),a=e.slice(r,i+1),o=new Set(this.selectedItems);a.forEach(e=>{n?o.add(e):o.delete(e)}),this.selectedItems=[...o],this.state[this.id+`_selected_items`]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);let t=this.state[this.field?.fieldId+`_show_detail`]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){let t=this.field.remoteCoordinates;this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((e,t)=>{e&&typeof e==`object`&&e._rowNumber===void 0&&(e._rowNumber=t)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith(`modal`)){let n=this;return w`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{n.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.field?.fieldId+`_cancel`},bubbles:!0,composed:!0}))}}"
                        ${s(()=>w`
                            <mateu-event-interceptor .target="${n}">
                                <div id="container" style="${this.field?.formStyle??`display: contents;`}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>T()])}
                ></vaadin-dialog>
                
            `}else{let n=this.field?.formPosition==`left`||this.field?.formPosition==`right`?`horizontal`:`vertical`;return w`
            <vaadin-master-detail-layout
                    style="overflow: unset; width: 100%; ${t&&this.field?.minHeightWhenDetailVisible?`min-height: `+this.field?.minHeightWhenDetailVisible+`;`:``}"
                    orientation="${n}"
                    .forceOverlay="${!0}"
            >
                ${this.renderMaster(e)}
                <div slot="${t?`detail`:`detail-hidden`}" style="${this.field?.formStyle??`display: contents;`}">
                    <div id="container" style="padding-left: 2rem; padding-right: 2rem; padding-bottom: 2rem; background-color: var(--lumo-base-color);">
                        <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                    </div>
                </div>
                
                
            </vaadin-master-detail-layout>`}}renderMaster(e){let r=this.selectedItems||[];return w`<vaadin-vertical-layout style="width: 100%;">
            <!-- The field label is rendered by the surrounding mateu-field wrapper; rendering it
                 here too would duplicate it (e.g. "Guests / Guests"). -->
            <vaadin-grid
                    ?clickable="${!!this.field?.onItemSelectionActionId}"
                    .cellPartNameGenerator="${x(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${x(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${x(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?`cursor: pointer;`:``}${this.field?.style??``}"
                    class="${this.field?.cssClasses}"
                    .items="${e}"
                    .selectedItems="${r}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${e=>{this.selectedItems=e.detail.value,this.state[this.id+`_selected_items`]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${x(this.field?.onItemSelectionActionId?e=>{let t=e.currentTarget.getEventContext(e)?.item;t&&this.selectRow(t)}:void 0)}"
                    @active-item-changed="${x(this.field?.detailPath&&!this.field?.useButtonForDetail?e=>{if(this.field?.detailPath){let t=e.detail.value;t?this.detailsOpenedItems=[t]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${x(this.field?.detailPath?n(e=>w`${P(this,e[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${e?.length<10}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:`No items added yet.`}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?_:w`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(e=>dl(e,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?w`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${t(e=>w`
                                <vaadin-button theme="tertiary icon error" title="Remove row"
                                    @click="${()=>{this.state[this.id+`_selected_items`]=[e],this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_remove`},bubbles:!0,composed:!0}))}}">
                                    <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                </vaadin-button>`,[])}
                    ></vaadin-grid-column>
                `:_}

                ${this.field?.useButtonForDetail?w`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${t((e,{detailsOpened:t})=>w`
              <vaadin-button
                theme="tertiary icon"
                title="${t?`Collapse`:`Expand`}"
                aria-label="Toggle details"
                aria-expanded="${t?`true`:`false`}"
                @click="${()=>{this.detailsOpenedItems=this.detailsOpenedItems.length&&this.detailsOpenedItems[0]._rowNumber==e._rowNumber?[]:[e]}}"
              >
                <vaadin-icon
                  .icon="${t?`lumo:angle-down`:`lumo:angle-right`}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:_}

            </vaadin-grid>
            ${this.field?.readOnly?_:this.field?.inlineEditing?w`
                    <vaadin-horizontal-layout theme="spacing">
                        <!-- Inline mode: rows are removed with the per-row trash button, so the
                             toolbar only needs the "add" action. -->
                        <vaadin-button theme="tertiary icon" title="Add row" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_add`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:plus"></vaadin-icon></vaadin-button>
                    </vaadin-horizontal-layout>
                `:w`
                    <vaadin-horizontal-layout theme="spacing">
                        <vaadin-button theme="tertiary icon" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_add`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:plus"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon error" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_remove`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:minus"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon" title="Move up" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_move-up`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:arrow-up"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon" title="Move down" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_move-down`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:arrow-down"></vaadin-icon></vaadin-button>
                    </vaadin-horizontal-layout>
                `}
        </vaadin-vertical-layout>`}static{this.styles=m`
        ${fe}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `}};O([v()],gl.prototype,`field`,void 0),O([v()],gl.prototype,`state`,void 0),O([v()],gl.prototype,`data`,void 0),O([v()],gl.prototype,`appState`,void 0),O([v()],gl.prototype,`appData`,void 0),O([v()],gl.prototype,`selectedItems`,void 0),O([S()],gl.prototype,`detailsOpenedItems`,void 0),gl=O([h(`mateu-grid`)],gl);var _l=class extends y{constructor(...e){super(...e),this.getNewValue=e=>{if(this.field?.dataType==`array`){if(!this.value)return[e];let t=this.value;return t.indexOf(e)>=0?t.filter(t=>t!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){let t=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}return w`
        <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; ${this.field?.attributes?.divStyle}">
                                    ${e?.map(e=>w`
                            <div role="button" tabindex="0" 
                                    class="choice ${this.value==e.value||Array.isArray(this.value)&&this.value.includes(e.value)?`selected`:``}"
                                    @click="${()=>this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:this.getNewValue(e.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}" @keydown="${L(()=>this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:this.getNewValue(e.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))}"
                            >${e.description||e.image?w`
                                <div style="display: flex; align-items: center; gap: var(--lumo-space-m, 1rem);">
                                    ${e.image?w`
                                            <img src="${e.image}" alt="${e.label}" style="${e.imageStyle??`width: 2rem;`}" />
                                        `:_}
                                    <div style="display: flex; flex-direction: column;">
                                        <span> ${e.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${e.description}
            </span>
                                    </div>
                                </div>
                            `:e.label}</div>
                        `)}
                                </div>

       `}static{this.styles=m`
        .choice {
            min-width: 10rem;
            min-height: 5rem;
            padding: 1rem;
            border: 1px solid transparent;
            line-height: 24px;
            cursor: pointer;
            border-radius: 4px;
        }

        .choice h5, .choice p {
            margin: 0;
        }

        .choice:hover {
            border: 1px solid var(--lumo-primary-color-10pct);
        }

        .selected, .selected:hover {
            border: 1px solid var(--lumo-shade-20pct);
        }
  
        ${R}
    `}};O([v()],_l.prototype,`field`,void 0),O([v()],_l.prototype,`baseUrl`,void 0),O([v()],_l.prototype,`state`,void 0),O([v()],_l.prototype,`data`,void 0),O([v()],_l.prototype,`value`,void 0),_l=O([h(`mateu-choice`)],_l);var vl=class extends y{constructor(...e){super(...e),this.currencyChanged=e=>{this.value||={value:0,currency:`EUR`,locale:`es-ES`},this.value.currency=e.detail.value,this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:{...this.value},fieldId:this.fieldId}}))},this.valueChanged=e=>{this.value||={value:0,currency:`EUR`,locale:`es-ES`},e.detail.value&&(this.value.value=e.detail.value?parseFloat(e.detail.value):0,this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:{...this.value},fieldId:this.fieldId}})))}}render(){return w`
            <vaadin-number-field
                    id="${this.fieldId}"
                    label="${this.label}"
                    @value-changed="${this.valueChanged}"
                    .value="${this.value?.value}"
                    .helperText="${this.helperText}"
                    ?autofocus="${this.autofocus}"
                    ?required="${this.required||_}"
                    theme="align-right"
            ><div slot="prefix"><vaadin-select
                    item-label-path="label"
                    item-value-path="value"
                    .items="${[{label:`Euro`,value:`EUR`},{label:`US Dollar`,value:`USD`}]}"
                    @value-changed="${this.currencyChanged}"
                    .value="${this.value?.currency}"
                    style="max-width: 100px;"
                    theme="small"
            ></vaadin-select></div></vaadin-number-field>
       `}static{this.styles=m`
  `}};O([v()],vl.prototype,`fieldId`,void 0),O([v()],vl.prototype,`label`,void 0),O([v()],vl.prototype,`state`,void 0),O([v()],vl.prototype,`data`,void 0),O([v()],vl.prototype,`value`,void 0),O([v()],vl.prototype,`autoFocus`,void 0),O([v()],vl.prototype,`required`,void 0),O([v()],vl.prototype,`colspan`,void 0),O([v()],vl.prototype,`helperText`,void 0),vl=O([h(`mateu-money-field`)],vl);var yl=`vaadin:abacus.vaadin:absolute-position.vaadin:academy-cap.vaadin:accessibility.vaadin:accordion-menu.vaadin:add-dock.vaadin:adjust.vaadin:adobe-flash.vaadin:airplane.vaadin:alarm.vaadin:align-center.vaadin:align-justify.vaadin:align-left.vaadin:align-right.vaadin:alt-a.vaadin:alt.vaadin:ambulance.vaadin:anchor.vaadin:angle-double-down.vaadin:angle-double-left.vaadin:angle-double-right.vaadin:angle-double-up.vaadin:angle-down.vaadin:angle-left.vaadin:angle-right.vaadin:angle-up.vaadin:archive.vaadin:archives.vaadin:area-select.vaadin:arrow-backward.vaadin:arrow-circle-down-o.vaadin:arrow-circle-down.vaadin:arrow-circle-left-o.vaadin:arrow-circle-left.vaadin:arrow-circle-right-o.vaadin:arrow-circle-right.vaadin:arrow-circle-up-o.vaadin:arrow-circle-up.vaadin:arrow-down.vaadin:arrow-forward.vaadin:arrow-left.vaadin:arrow-long-down.vaadin:arrow-long-left.vaadin:arrow-right.vaadin:arrow-up.vaadin:arrows-cross.vaadin:arrows-long-h.vaadin:arrows-long-right.vaadin:arrows-long-up.vaadin:arrows-long-v.vaadin:arrows.vaadin:asterisk.vaadin:at.vaadin:automation.vaadin:backspace-a.vaadin:backspace.vaadin:backwards.vaadin:ban.vaadin:bar-chart-h.vaadin:bar-chart-v.vaadin:bar-chart.vaadin:barcode.vaadin:bed.vaadin:bell-o.vaadin:bell-slash-o.vaadin:bell-slash.vaadin:bell.vaadin:boat.vaadin:bold.vaadin:bolt.vaadin:bomb.vaadin:book-dollar.vaadin:book-percent.vaadin:book.vaadin:bookmark-o.vaadin:bookmark.vaadin:briefcase.vaadin:browser.vaadin:bug-o.vaadin:bug.vaadin:building-o.vaadin:building.vaadin:bullets.vaadin:bullseye.vaadin:bus.vaadin:buss.vaadin:button.vaadin:calc-book.vaadin:calc.vaadin:calendar-briefcase.vaadin:calendar-clock.vaadin:calendar-envelope.vaadin:calendar-o.vaadin:calendar-user.vaadin:calendar.vaadin:camera.vaadin:car.vaadin:caret-down.vaadin:caret-left.vaadin:caret-right.vaadin:caret-square-down-o.vaadin:caret-square-left-o.vaadin:caret-square-right-o.vaadin:caret-square-up-o.vaadin:caret-up.vaadin:cart-o.vaadin:cart.vaadin:cash.vaadin:chart-3d.vaadin:chart-grid.vaadin:chart-line.vaadin:chart-timeline.vaadin:chart.vaadin:chat.vaadin:check-circle-o.vaadin:check-circle.vaadin:check-square-o.vaadin:check-square.vaadin:check.vaadin:chevron-circle-down-o.vaadin:chevron-circle-down.vaadin:chevron-circle-left-o.vaadin:chevron-circle-left.vaadin:chevron-circle-right-o.vaadin:chevron-circle-right.vaadin:chevron-circle-up-o.vaadin:chevron-circle-up.vaadin:chevron-down-small.vaadin:chevron-down.vaadin:chevron-left-small.vaadin:chevron-left.vaadin:chevron-right-small.vaadin:chevron-right.vaadin:chevron-up-small.vaadin:chevron-up.vaadin:child.vaadin:circle-thin.vaadin:circle.vaadin:clipboard-check.vaadin:clipboard-cross.vaadin:clipboard-heart.vaadin:clipboard-pulse.vaadin:clipboard-text.vaadin:clipboard-user.vaadin:clipboard.vaadin:clock.vaadin:close-big.vaadin:close-circle-o.vaadin:close-circle.vaadin:close-small.vaadin:close.vaadin:cloud-download-o.vaadin:cloud-download.vaadin:cloud-o.vaadin:cloud-upload-o.vaadin:cloud-upload.vaadin:cloud.vaadin:cluster.vaadin:code.vaadin:coffee.vaadin:cog-o.vaadin:cog.vaadin:cogs.vaadin:coin-piles.vaadin:coins.vaadin:combobox.vaadin:comment-ellipsis-o.vaadin:comment-ellipsis.vaadin:comment-o.vaadin:comment.vaadin:comments-o.vaadin:comments.vaadin:compile.vaadin:compress-square.vaadin:compress.vaadin:connect-o.vaadin:connect.vaadin:controller.vaadin:copy-o.vaadin:copy.vaadin:copyright.vaadin:corner-lower-left.vaadin:corner-lower-right.vaadin:corner-upper-left.vaadin:corner-upper-right.vaadin:credit-card.vaadin:crop.vaadin:cross-cutlery.vaadin:crosshairs.vaadin:css.vaadin:ctrl-a.vaadin:ctrl.vaadin:cube.vaadin:cubes.vaadin:curly-brackets.vaadin:cursor-o.vaadin:cursor.vaadin:cutlery.vaadin:dashboard.vaadin:database.vaadin:date-input.vaadin:deindent.vaadin:del-a.vaadin:del.vaadin:dental-chair.vaadin:desktop.vaadin:diamond-o.vaadin:diamond.vaadin:diploma-scroll.vaadin:diploma.vaadin:disc.vaadin:doctor-briefcase.vaadin:doctor.vaadin:dollar.vaadin:dot-circle.vaadin:download-alt.vaadin:download.vaadin:drop.vaadin:edit.vaadin:eject.vaadin:elastic.vaadin:ellipsis-circle-o.vaadin:ellipsis-circle.vaadin:ellipsis-dots-h.vaadin:ellipsis-dots-v.vaadin:ellipsis-h.vaadin:ellipsis-v.vaadin:enter-arrow.vaadin:enter.vaadin:envelope-o.vaadin:envelope-open-o.vaadin:envelope-open.vaadin:envelope.vaadin:envelopes-o.vaadin:envelopes.vaadin:eraser.vaadin:esc-a.vaadin:esc.vaadin:euro.vaadin:exchange.vaadin:exclamation-circle-o.vaadin:exclamation-circle.vaadin:exclamation.vaadin:exit-o.vaadin:exit.vaadin:expand-full.vaadin:expand-square.vaadin:expand.vaadin:external-browser.vaadin:external-link.vaadin:eye-slash.vaadin:eye.vaadin:eyedropper.vaadin:facebook-square.vaadin:facebook.vaadin:factory.vaadin:family.vaadin:fast-backward.vaadin:fast-forward.vaadin:female.vaadin:file-add.vaadin:file-code.vaadin:file-font.vaadin:file-movie.vaadin:file-o.vaadin:file-picture.vaadin:file-presentation.vaadin:file-process.vaadin:file-refresh.vaadin:file-remove.vaadin:file-search.vaadin:file-sound.vaadin:file-start.vaadin:file-table.vaadin:file-text-o.vaadin:file-text.vaadin:file-tree-small.vaadin:file-tree-sub.vaadin:file-tree.vaadin:file-zip.vaadin:file.vaadin:fill.vaadin:film.vaadin:filter.vaadin:fire.vaadin:flag-checkered.vaadin:flag-o.vaadin:flag.vaadin:flash.vaadin:flask.vaadin:flight-landing.vaadin:flight-takeoff.vaadin:flip-h.vaadin:flip-v.vaadin:folder-add.vaadin:folder-o.vaadin:folder-open-o.vaadin:folder-open.vaadin:folder-remove.vaadin:folder-search.vaadin:folder.vaadin:font.vaadin:form.vaadin:forward.vaadin:frown-o.vaadin:funcion.vaadin:function.vaadin:funnel.vaadin:gamepad.vaadin:gavel.vaadin:gift.vaadin:glass.vaadin:glasses.vaadin:globe-wire.vaadin:globe.vaadin:golf.vaadin:google-plus-square.vaadin:google-plus.vaadin:grab.vaadin:grid-bevel.vaadin:grid-big-o.vaadin:grid-big.vaadin:grid-h.vaadin:grid-small-o.vaadin:grid-small.vaadin:grid-v.vaadin:grid.vaadin:group.vaadin:hammer.vaadin:hand.vaadin:handle-corner.vaadin:hands-up.vaadin:handshake.vaadin:harddrive-o.vaadin:harddrive.vaadin:hash.vaadin:header.vaadin:headphones.vaadin:headset.vaadin:health-card.vaadin:heart-o.vaadin:heart.vaadin:home-o.vaadin:home.vaadin:hospital.vaadin:hourglass-empty.vaadin:hourglass-end.vaadin:hourglass-start.vaadin:hourglass.vaadin:inbox.vaadin:indent.vaadin:info-circle-o.vaadin:info-circle.vaadin:info.vaadin:input.vaadin:insert.vaadin:institution.vaadin:invoice.vaadin:italic.vaadin:key-o.vaadin:key.vaadin:keyboard-o.vaadin:keyboard.vaadin:laptop.vaadin:layout.vaadin:level-down-bold.vaadin:level-down.vaadin:level-left-bold.vaadin:level-left.vaadin:level-right-bold.vaadin:level-right.vaadin:level-up-bold.vaadin:level-up.vaadin:lifebuoy.vaadin:lightbulb.vaadin:line-bar-chart.vaadin:line-chart.vaadin:line-h.vaadin:line-v.vaadin:lines-list.vaadin:lines.vaadin:link.vaadin:list-ol.vaadin:list-select.vaadin:list-ul.vaadin:list.vaadin:location-arrow-circle-o.vaadin:location-arrow-circle.vaadin:location-arrow.vaadin:lock.vaadin:magic.vaadin:magnet.vaadin:mailbox.vaadin:male.vaadin:map-marker.vaadin:margin-bottom.vaadin:margin-left.vaadin:margin-right.vaadin:margin-top.vaadin:margin.vaadin:medal.vaadin:megafone.vaadin:megaphone.vaadin:meh-o.vaadin:menu.vaadin:microphone.vaadin:minus-circle-o.vaadin:minus-circle.vaadin:minus-square-o.vaadin:minus.vaadin:mobile-browser.vaadin:mobile-retro.vaadin:mobile.vaadin:modal-list.vaadin:modal.vaadin:money-deposit.vaadin:money-exchange.vaadin:money-withdraw.vaadin:money.vaadin:moon-o.vaadin:moon.vaadin:morning.vaadin:movie.vaadin:music.vaadin:mute.vaadin:native-button.vaadin:newspaper.vaadin:notebook.vaadin:nurse.vaadin:office.vaadin:open-book.vaadin:option-a.vaadin:option.vaadin:options.vaadin:orientation.vaadin:out.vaadin:outbox.vaadin:package.vaadin:padding-bottom.vaadin:padding-left.vaadin:padding-right.vaadin:padding-top.vaadin:padding.vaadin:paint-roll.vaadin:paintbrush.vaadin:palete.vaadin:palette.vaadin:panel.vaadin:paperclip.vaadin:paperplane-o.vaadin:paperplane.vaadin:paragraph.vaadin:password.vaadin:paste.vaadin:pause.vaadin:pencil.vaadin:phone-landline.vaadin:phone.vaadin:picture.vaadin:pie-bar-chart.vaadin:pie-chart.vaadin:piggy-bank-coin.vaadin:piggy-bank.vaadin:pill.vaadin:pills.vaadin:pin-post.vaadin:pin.vaadin:play-circle-o.vaadin:play-circle.vaadin:play.vaadin:plug.vaadin:plus-circle-o.vaadin:plus-circle.vaadin:plus-minus.vaadin:plus-square-o.vaadin:plus.vaadin:pointer.vaadin:power-off.vaadin:presentation.vaadin:print.vaadin:progressbar.vaadin:puzzle-piece.vaadin:pyramid-chart.vaadin:qrcode.vaadin:question-circle-o.vaadin:question-circle.vaadin:question.vaadin:quote-left.vaadin:quote-right.vaadin:random.vaadin:raster-lower-left.vaadin:raster.vaadin:records.vaadin:recycle.vaadin:refresh.vaadin:reply-all.vaadin:reply.vaadin:resize-h.vaadin:resize-v.vaadin:retweet.vaadin:rhombus.vaadin:road-branch.vaadin:road-branches.vaadin:road-split.vaadin:road.vaadin:rocket.vaadin:rotate-left.vaadin:rotate-right.vaadin:rss-square.vaadin:rss.vaadin:safe-lock.vaadin:safe.vaadin:scale-unbalance.vaadin:scale.vaadin:scatter-chart.vaadin:scissors.vaadin:screwdriver.vaadin:search-minus.vaadin:search-plus.vaadin:search.vaadin:select.vaadin:server.vaadin:share-square.vaadin:share.vaadin:shield.vaadin:shift-arrow.vaadin:shift.vaadin:shop.vaadin:sign-in-alt.vaadin:sign-in.vaadin:sign-out-alt.vaadin:sign-out.vaadin:signal.vaadin:sitemap.vaadin:slider.vaadin:sliders.vaadin:smiley-o.vaadin:sort.vaadin:sound-disable.vaadin:spark-line.vaadin:specialist.vaadin:spinner-arc.vaadin:spinner-third.vaadin:spinner.vaadin:spline-area-chart.vaadin:spline-chart.vaadin:split-h.vaadin:split-v.vaadin:split.vaadin:spoon.vaadin:square-shadow.vaadin:star-half-left-o.vaadin:star-half-left.vaadin:star-half-right-o.vaadin:star-half-right.vaadin:star-o.vaadin:star.vaadin:start-cog.vaadin:step-backward.vaadin:step-forward.vaadin:stethoscope.vaadin:stock.vaadin:stop-cog.vaadin:stop.vaadin:stopwatch.vaadin:storage.vaadin:strikethrough.vaadin:subscript.vaadin:suitcase.vaadin:sun-down.vaadin:sun-o.vaadin:sun-rise.vaadin:superscript.vaadin:sword.vaadin:tab-a.vaadin:tab.vaadin:table.vaadin:tablet.vaadin:tabs.vaadin:tag.vaadin:tags.vaadin:tasks.vaadin:taxi.vaadin:teeth.vaadin:terminal.vaadin:text-height.vaadin:text-input.vaadin:text-label.vaadin:text-width.vaadin:thin-square.vaadin:thumbs-down-o.vaadin:thumbs-down.vaadin:thumbs-up-o.vaadin:thumbs-up.vaadin:ticket.vaadin:time-backward.vaadin:time-forward.vaadin:timer.vaadin:toolbox.vaadin:tools.vaadin:tooth.vaadin:touch.vaadin:train.vaadin:trash.vaadin:tree-table.vaadin:trendind-down.vaadin:trending-down.vaadin:trending-up.vaadin:trophy.vaadin:truck.vaadin:twin-col-select.vaadin:twitter-square.vaadin:twitter.vaadin:umbrella.vaadin:underline.vaadin:unlink.vaadin:unlock.vaadin:upload-alt.vaadin:upload.vaadin:user-card.vaadin:user-check.vaadin:user-clock.vaadin:user-heart.vaadin:user-star.vaadin:user.vaadin:users.vaadin:vaadin-h.vaadin:vaadin-v.vaadin:viewport.vaadin:vimeo-square.vaadin:vimeo.vaadin:volume-down.vaadin:volume-off.vaadin:volume-up.vaadin:volume.vaadin:wallet.vaadin:warning.vaadin:workplace.vaadin:wrench.vaadin:youtube-square.vaadin:youtube`.split(`.`),bl=null,xl=()=>(bl||=Promise.all([E(()=>import(`./vendor-ui5.js`).then(e=>e.n),__vite__mapDeps([5,1])),E(()=>import(`./vendor-ui5.js`).then(e=>e.t),__vite__mapDeps([5,1]))]),bl),Q=class extends y{constructor(...e){super(...e),this.ui5FieldComponentsReady=!1,this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter=``,this.rendered=!1,this.renderColorPicker=()=>{this.loadUi5FieldComponents();let e=this.field?.fieldId;return w`
            <ui5-color-picker value="${this.state&&e in this.state?this.state[e]:this.field?.initialValue}" @change="${e=>this.colorPickerValue=e.target.value}">Picker</ui5-color-picker>
        `},this.saveColor=()=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:this.colorPickerValue,fieldId:this.field.fieldId},bubbles:!0,composed:!0})),this.colorPickerOpened=!1},this.renderColorPickerFooter=()=>w`<vaadin-button @click="${()=>this.colorPickerOpened=!1}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`,this.checked=e=>{let t=e.target;this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t.checked,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))},this.convert=e=>this.field?.dataType==`integer`?parseInt(e):e,this.multiComboBoxValueChanged=e=>{if(this.rendered){let t=this.field?.fieldId,n=this.state&&t in this.state?this.state[t]:this.field?.initialValue,r;e.detail.value&&(r=e.detail.value.map(e=>e.value),r&&r.length>0&&(this.data[this.id]||(this.data[this.id]={}),this.data[this.id].content||(this.data[this.id].content=[]),this.data[this.id]&&this.data[this.id].content&&e.detail.value.forEach(e=>{this.data[this.id].content?.find(t=>e.value==t.value)||this.data[this.id].content.push(e)}))),this.compareArrays(r,n)||this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:r,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.valueChanged=e=>{this.rendered&&e.detail.value!==void 0&&e.detail.value!=this.state[this.field.fieldId]&&this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:this.convert(e.detail.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.selectedItems=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.comboData&&this.comboData.length>0)return this.comboData?.filter(t=>e.indexOf(t.value)>=0);if(this.data[this.id]&&this.data[this.id].content&&this.data[this.id].content.length>0)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0)}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0);return[]},this.selectedIndex=e=>{if(e)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){let t=this.data[this.id].content.find(t=>t.value==e);if(t)return this.data[this.id].content.indexOf(t)}}else{let t=this.field?.options?.find(t=>t.value==e);if(t)return this.field?.options?.indexOf(t)}},this.selectedIndexes=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0).map(e=>this.data[this.id].content.indexOf(e))}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0).map(e=>this.field?.options?.indexOf(e));return[]},this.compareArrays=(e,t)=>this.falsy(e)&&this.falsy(t)||e&&t&&e.length===t.length&&e.every((e,n)=>e===t[n]),this.falsy=e=>!e||e.length==0,this.listItemsSelected=e=>{let t=this.field?.fieldId,n=this.state&&t in this.state?this.state[t]:this.field?.initialValue,r;this.rendered&&(e.detail.value&&(this.field?.remoteCoordinates?this.data[this.id]&&this.data[this.id].content&&(r=e.detail.value.map(e=>this.data[this.id].content[e].value)):r=e.detail.value.map(e=>this.field.options[e].value)),this.compareArrays(r,n)||this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:r,fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))},this.listItemSelected=e=>{let t;if(e.detail.value||e.detail.value==0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){let n=this.data[this.id].content[e.detail.value];n&&(t=n.value)}}else{let n=this.field.options[e.detail.value];n&&(t=n.value)}this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.mapPosition=e=>{switch(e){case`topStretch`:return`top-stretch`;case`topStart`:return`top-start`;case`topCenter`:return`top-center`;case`topEnd`:return`top-end`;case`middle`:return`middle`;case`bottomStart`:return`bottom-start`;case`bottomEnd`:return`bottom-end`;case`bottomStretch`:return`bottom-stretch`;case`bottomCenter`:return`bottom-center`}return`bottom-end`},this.helperShownInControl=!1,this.lastAnnouncedError=``,this.controlOwnsValidity=!1,this.fileUploaded=e=>{let t=this.field?.fieldId??``,n=this.state[t];n.push({id:e.detail.xhr.responseText,name:e.detail.file.name}),this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:n,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.fileChanged=e=>{let t=this.field?.fieldId??``,n=(e.detail.value??[]).filter(e=>e.id).map(e=>e.id),r=(this.state[t]??[]).map(e=>e.id);if(!this.compareArrays(r,n)){let t=(e.detail.value??[]).filter(e=>e.id).map(e=>({id:e.id,name:e.name}));this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.triggerImageUpload=()=>{(this.renderRoot?.querySelector(`input[type="file"]`))?.click()},this.imageUpload=e=>{let t=e.target,n=t.files?.[0];if(!n)return;let r=new FileReader;r.onload=()=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:r.result,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},r.readAsDataURL(n),t.value=``},this.imageDelete=()=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:``,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.iconComboboxRenderer=e=>w`
  <div style="display: flex;">
      <vaadin-icon
              icon="${e}"
              style="height: var(--lumo-size-m); margin-right: var(--lumo-space-s);"
      ></vaadin-icon>
    <div>
      ${e}
      <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);">
        ${e}
      </div>
    </div>
  </div>
`,this.comboRenderer=e=>w`
        ${e.description||e.image||e.icon?w`
            <vaadin-horizontal-layout theme="spacing">
                ${e.icon?w`<div><vaadin-icon icon="${e.icon}"></vaadin-icon></div>
                                    `:_}
                ${e.image?w`
                    <div>
                    <img
                            style="width: var(--lumo-size-m); margin-right: var(--lumo-space-s);"
                            src="${e.image}"
                            alt="${e.label}"
                    />
                    </div>
                                        `:_}
                <div>
                    ${e.label}
                    ${e.description?w`
            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);">
                ${e.description}
            </div>
        `:_}
                </div>

            </vaadin-horizontal-layout>
                            `:e.label}
`,this.filteredIcons=[],this.navLinkOffset=null,this.iconFilterChanged=e=>{this.filteredIcons=yl.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}loadUi5FieldComponents(){this.ui5FieldComponentsReady||xl().then(()=>{this.ui5FieldComponentsReady=!0})}remoteComboDataProvider(e){return(t,n)=>{let{filter:i,page:a,pageSize:o}=t,s=i??``;this._comboFilter=s,this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{searchText:i,fieldId:this.field?.fieldId,size:o,page:a,sort:void 0},callback:e=>{if(s===this._comboFilter)if(e?.messages?.forEach(e=>{r.show(e.text,{position:e.position?this.mapPosition(e.position):void 0,theme:e.variant,duration:e.duration})}),!e.fragments||e.fragments.length==0)this.comboData=[],n([],0);else{let t=e.fragments[0].data?.[this.id];this.comboData=t?.content,n(t?.content,t?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}renderNavLink(){let e=this.field?.link;if(!e?.href)return _;let t=j(e.href,this.state,this.data)??e.href,n=j(e.title,this.state,this.data)||t,r=e.icon||(t.startsWith(`http`)?`vaadin:external-link`:`vaadin:link`),i=this.navLinkOffset??`calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)`;return w`<a
                data-navlink
                href="${t}"
                title="${n}"
                target="${x(e.target||void 0)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${i};"
        ><vaadin-icon icon="${r}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`}positionNavLink(){let e=this.renderRoot?.querySelector(`a[data-navlink]`);e&&setTimeout(()=>{let t=e.parentElement,n=t?.firstElementChild?.firstElementChild;if(!t||!n)return;let r=(n.shadowRoot?.querySelector(`[part="input-field"]`)??n).getBoundingClientRect();if(r.height===0)return;let i=Math.max(0,r.top+r.height/2-e.offsetHeight/2-t.getBoundingClientRect().top),a=`${Math.round(i)}px`;this.navLinkOffset!==a&&(this.navLinkOffset=a)})}helperText(){return this.helperShownInControl=!0,M(this.field?.description??``,this.state,this.data)??``}fieldErrors(){let e=this.field?.fieldId??``,t=this.data?.errors?.[e];return Array.isArray(t)?t.filter(e=>!!e):[]}validatableControl(){let e=this.renderRoot.querySelectorAll(`*`);for(let t of e)if(`invalid`in t&&`errorMessage`in t)return t;return null}applyValidationState(){let e=this.fieldErrors(),t=this.validatableControl();if(!t){this.lastAnnouncedError=e.join(`. `);return}let n=e.join(`. `);if(t.errorMessage=n,t.invalid=e.length>0,n&&n!==this.lastAnnouncedError){let e=(this.field?.label??``).toString().trim();Qe(e?`${e}: ${n}`:n,{politeness:`assertive`})}this.lastAnnouncedError=n}render(){this.rendered=!0;let e=this.renderNavLink();this.helperShownInControl=!1;let t=this.renderField(),n=this.field?.description&&!this.helperShownInControl?M(this.field.description,this.state,this.data):void 0,r=this.fieldErrors(),i=r.length>0&&!this.controlOwnsValidity;return w`<div style="display: block;">
            <div style="${e===_?``:`display: flex; gap: var(--lumo-space-xs);`}"><div style="flex: 1; min-width: 0;">${t}</div>${e}</div>
            ${n?w`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${n}</div>
            `:_}
            ${i?w`
                <div role="alert"><ul>${r.map(e=>w`<li>${e}</li>`)}</ul></div>
            `:_}
        </div>`}async firstUpdated(){this.filteredIcons=yl}update(e){e.has(`component`)&&(this.rendered=!1),super.update(e)}updated(e){super.updated(e),this.positionNavLink(),this.applyValidationState(),this.controlOwnsValidity=!!this.validatableControl()}renderField(){let e=this.field?.fieldId??``,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,n=j(this.field?.label+``,this.state,this.data),r=this.labelAlreadyRendered||!n||n==`null`?_:n;return this.field?.propertyRow?this.renderPropertyRowField(e,t,r,n):this.field?.stereotype==`badge`?this.renderBadgeField(e,t,r,n):this.field?.stereotype==`plainText`?this.renderPlainTextField(e,t,r,n):this.field?.stereotype==`bulletedList`?this.renderBulletedListField(e,t,r,n):this.field?.readOnly&&this.field.stereotype!=`grid`&&this.field.dataType!=`status`&&this.field?.dataType!=`money`?this.renderReadOnlyField(e,t,r,n):this.field?.dataType==`file`?this.renderFileField(e,t,r,n):this.field?.dataType==`string`?this.renderStringField(e,t,r,n):this.field?.dataType==`number`?this.renderNumberField(e,t,r,n):this.field?.dataType==`integer`?this.renderIntegerField(e,t,r,n):this.field?.dataType==`bool`?this.renderBoolField(e,t,r,n):this.field?.dataType==`dateRange`?this.renderDateRangeField(e,t,r,n):this.field?.dataType==`date`?this.renderDateField(e,t,r,n):this.field?.dataType==`dateTime`?this.renderDateTimeField(e,t,r,n):this.field?.dataType==`time`?this.renderTimeField(e,t,r,n):this.field?.dataType==`array`?this.renderArrayField(e,t,r,n):this.field?.dataType==`money`?this.renderMoneyField(e,t,r,n):this.field?.dataType==`status`?this.renderStatusField(e,t,r,n):this.field?.dataType==`range`?this.renderRangeField(e,t,r,n):w`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,n,r){if(!this.field)return w``;let i=t===!0||t===`true`;return w`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${i?`success`:``} pill" style="${i?``:`opacity: 0.4;`}">${r}</span>
            </vaadin-custom-field>`}renderPropertyRowField(e,t,n,r){if(!this.field)return w``;let i=M(t,this.state,this.data),a=i&&typeof i==`object`&&`value`in i?i:null;i&&i.value&&(i=i.value);let o=this.field?.dataType==`bool`||i===!0||i===!1,s=this.field?.dataType==`money`,c=i!=null&&i!==``,l=c?String(i):`—`;if(s&&c){let e=typeof i==`number`?i:parseFloat(String(i));isNaN(e)||(l=a&&a.locale&&a.currency?new Intl.NumberFormat(a.locale,{style:`currency`,currency:a.currency}).format(e):new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(e))}let u=o?w`<vaadin-icon icon="${i===!0||i===`true`?`vaadin:check`:`vaadin:minus`}" style="height: 16px; width: 16px;"></vaadin-icon>`:w`<span style="font-weight: 500; text-align: right; word-break: break-word; margin-left: auto;${s?` font-variant-numeric: tabular-nums;`:``}">${l}</span>`,d=r&&r!=`null`;return w`<div
                    id="${this.field.fieldId}"
                    data-colspan="${this.field?.colspan}"
                    style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; width: 100%; padding: 0.4rem 0; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); font-size: var(--lumo-font-size-s, .875rem); ${this.field?.style}"
            >${d?w`<span style="color: var(--lumo-secondary-text-color, #888); white-space: nowrap;">${r}</span>`:_}${u}</div>`}renderBulletedListField(e,t,n,r){if(!this.field)return w``;let i=M(t,this.state,this.data),a=Array.isArray(i)?i.map(e=>String(e)):i!=null&&i!==``?[String(i)]:[];return w`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${n}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><mateu-bulleted-list .items="${a}"></mateu-bulleted-list>
            </vaadin-custom-field>`}renderPlainTextField(e,t,n,r){if(!this.field)return w``;let i=M(t,this.state,this.data),a=i&&typeof i==`object`&&`value`in i?i:null;i&&i.value&&(i=i.value);let o=this.field?.dataType==`bool`||i===!0||i===!1,s=this.field?.dataType==`money`,c=i!=null&&i!==``,l=c?String(i):`—`;if(s&&c){let e=typeof i==`number`?i:parseFloat(String(i));isNaN(e)||(l=a&&a.locale&&a.currency?new Intl.NumberFormat(a.locale,{style:`currency`,currency:a.currency}).format(e):new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(e))}let u=o?w`<vaadin-icon icon="${i===!0||i===`true`?`vaadin:check`:`vaadin:minus`}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?w`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${l}</span>`:w`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${s?` font-variant-numeric: tabular-nums;`:``}">${l}</span>`;return w`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${n}"
                    data-colspan="${this.field?.colspan}"
                    style="${s?`text-align: right; `:``}${this.field?.style}"
            >${u}</vaadin-custom-field>`}renderReadOnlyField(e,t,n,r){if(!this.field)return w``;let i=M(t,this.state,this.data)||this.data[e];if(i&&i.value&&(i=i.value),this.field.stereotype==`fileUpload`)return w`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><mateu-file-upload .fieldId="${this.field.fieldId}" .value="${i}" .editable="${!1}"></mateu-file-upload>
                </vaadin-custom-field>`;if(this.field.stereotype==`image`||this.field.stereotype==`uploadableImage`||this.field.stereotype==`signature`||this.field.stereotype==`camera`)return w`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        required="${this.field.required||_}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><img src="${i}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`;if(this.field.dataType==`bool`)return w`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        required="${this.field.required||_}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${i?`vaadin:check`:`vaadin:minus`}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`;let a=i==null?``:String(i);return w`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        value="${i}"
                        readonly
                        style="${this.field.style}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >${a.length>15?w`<vaadin-icon
                        slot="suffix"
                        icon="vaadin:copy"
                        title="Copiar"
                        style="cursor: pointer; color: var(--lumo-secondary-text-color);"
                        @click="${()=>this.copyValue(a)}"
                ></vaadin-icon>`:_}</vaadin-text-field>
`}copyValue(e){navigator.clipboard.writeText(e).then(()=>r.show(`Copied`,{position:`bottom-end`,theme:`success`,duration:2e3})).catch(()=>{})}renderFileField(e,t,n,r){if(!this.field)return w``;let i=t?.map(e=>({id:e.id,name:e.name,type:``,uploadTarget:``,complete:!0}))??[];return w`
                <vaadin-custom-field
                        label="${n}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    <vaadin-upload
                            target="/upload"
                            .files="${i}"
                            @upload-success="${this.fileUploaded}"
                            @files-changed="${this.fileChanged}"
                    ></vaadin-upload>
                </vaadin-custom-field>
            `}renderStringField(e,t,n,r){if(!this.field)return w``;if(this.field?.stereotype==`searchable`)return w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            required="${this.field.required||_}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-horizontal-layout theme="spacing" style="--lumo-space-m: 0.33rem;">
                            <vaadin-text-field style="width: 4rem;" @change="${e=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`code-`+this.field?.fieldId,parameters:{code:e.currentTarget.value}},bubbles:!0,composed:!0}))}}" value="${t}"></vaadin-text-field>
                            <vaadin-text-field readonly="" value="${this.data[this.field.fieldId+`-label`]}"></vaadin-text-field>
                            <vaadin-button theme="icon" @click="${e=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`codesearch-`+this.field?.fieldId,parameters:{}},bubbles:!0,composed:!0}))}}"><vaadin-icon icon="lumo:search"></vaadin-icon></vaadin-button>
                        </vaadin-horizontal-layout>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`select`){if(this.field?.optionsSource){let e=this.field.optionsSource,r=j(e.url,this.state,this.data)??e.url;this.data[this.id]?.sourceSignature!==r&&(this.data[this.id]={content:this.data[this.id]?.content??[],sourceSignature:r},qt(e,e=>j(e,this.state,this.data)).then(e=>{this.data[this.id]={content:e,totalElements:e.length,sourceSignature:r},this.requestUpdate()}).catch(e=>console.warn(`mateu: external options fetch failed`,e)));let i=t;return t&&t.value&&(i=t.value),w`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${n}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.data[this.id]?.content??[]}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${i}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||_}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                    `}if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}));let r=t;return t&&t.value&&(r=t.value),w`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${n}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.data[this.id]?.content}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${r}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||_}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                    `}let e=t;return t&&t.value&&(e=t.value),w`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${n}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${e}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||_}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                `}if(this.field?.stereotype==`markdown`)return w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            required="${this.field.required||_}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><vaadin-markdown
                            .content="${t}"
                    ></vaadin-markdown>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`combobox`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates,r;this.data[this.id]&&this.data[this.id].content&&(r=this.data[this.id].content.find(e=>e.value==t)),!r&&this.comboData&&(r=this.comboData.find(e=>e.value==t)),!r&&t&&(r={value:t,label:this.data[this.id+`-label`]??t});let i=this.remoteComboDataProvider(e.action);return w`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${n}"
                            item-label-path="label"
                            item-id-path="value"
                            .dataProvider="${i}"
                            .selectedItem="${r}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||_}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            @keyup="${e=>{if(e.key==`Backspace`){let t=e.currentTarget;t.inputElement.value||(t.value=``)}}}"
                            ${u(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}return w`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${n}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||_}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            ${u(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype==`listBox`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),w`
                        <vaadin-custom-field
                                label="${n}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${x(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map(e=>w`
                            <vaadin-item>${e.description||e.image||e.icon?w`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${e.icon?w`
                                        <vaadin-icon icon="${e.icon}"></vaadin-icon>
                                    `:_}
                                    ${e.image?w`
                                            <img src="${e.image}" alt="${e.label}" style="width: 2rem;" />
                                        `:_}
                                    <vaadin-vertical-layout>
                                        <span> ${e.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${e.description}
            </span>
                                    </vaadin-vertical-layout>
                                </vaadin-horizontal-layout>
                            `:e.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                        </vaadin-custom-field>
                    `}return w`
                    <vaadin-custom-field
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${x(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(e=>w`
                            <vaadin-item>${e.description||e.image||e.icon?w`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${e.icon?w`
                                        <vaadin-icon icon="${e.icon}"></vaadin-icon>
                                    `:_}
                                    ${e.image?w`
                                            <img src="${e.image}" alt="${e.label}" style="width: 2rem;" />
                                        `:_}
                                    <vaadin-vertical-layout>
                                        <span> ${e.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${e.description}
            </span>
                                    </vaadin-vertical-layout>
                                </vaadin-horizontal-layout>
                            `:e.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype==`radio`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),w`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${n}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            theme="horizontal"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||_}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.data[this.id]?.content?.map(e=>w`
                            <vaadin-radio-button value="${e.value}" label="${e.label}" ?checked="${e&&t&&e.value===t}">
                                ${e.description||e.image||e.icon?w`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${e.icon?w`
                                                <vaadin-icon icon="${e.icon}"></vaadin-icon>
                                            `:_}
                                            ${e.image?w`
                                                <img src="${e.image}" alt="${e.label}" style="height: 1rem;" />
                                            `:_}
                                            <span>${e.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${e.description?w`
                                            <div>${e.description}</div>
                                        `:_}
                                    </label>
                                `:_}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `}return w`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${n}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||_}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(e=>w`
                            <vaadin-radio-button value="${e.value}" label="${e.label}">
                                ${e.description||e.image||e.icon?w`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${e.icon?w`
                                                <vaadin-icon icon="${e.icon}"></vaadin-icon>
                                            `:_}
                                            ${e.image?w`
                                                <img src="${e.image}" alt="${e.label}" style="height: 1rem;" />
                                            `:_}
                                            <span>${e.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${e.description?w`
                                            <div>${e.description}</div>
                                        `:_}
                                    </label>
                                `:_}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `}if(this.field.stereotype==`popover`)return w`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            required="${this.field.required||_}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-horizontal-layout theme="spacing">
                            <div>${t}</div>
                            <div id="${this.field.fieldId}_popover">
                                <vaadin-icon icon="vaadin:angle-down"></vaadin-icon>
                            </div>
                        </vaadin-horizontal-layout>
                    <vaadin-popover
                            for="${this.field.fieldId}_popover"
                            theme="arrow no-padding"
                            modal
                            accessible-name-ref="notifications-heading"
                            content-width="300px"
                            position="bottom"
                            ${te(()=>w`
                                <mateu-event-interceptor .target="${this}">
                                <mateu-choice
                                        .field="${this.field}"
                                        .value="${t}"
                                ></mateu-choice>
                                </mateu-event-interceptor>
                            `,[])}
                    ></vaadin-popover>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`choice`)return w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            required="${this.field.required||_}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-choice
                                .field="${this.field}"
                                .value="${t}"
                                .state="${this.state}"
                                .data="${this.data}"
                                .appState="${this.appState}"
                                .appdata="${this.appData}"
                        ></mateu-choice>
                        
                    </vaadin-custom-field>
                    `;if(this.field?.stereotype==`richText`)return w`
                    <vaadin-custom-field
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-rich-text-editor
                            .maxlength="${this.field.charLimit}"
                            .value="${t}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                    ></vaadin-rich-text-editor>
                    </vaadin-custom-field>`;if(this.field?.stereotype==`textarea`)return w`
                    <vaadin-text-area
                            id="${this.field.fieldId}"
                            label="${n}"
                            .maxlength="${this.field.charLimit}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||_}"
                            data-colspan="${this.field.colspan}"
                            rows="4"
                            style="width: 100%;"
                    ></vaadin-text-area>`;if(this.field?.stereotype==`email`)return w`
                    <vaadin-email-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||_}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-email-field>
                `;if(this.field?.stereotype==`link`)return this.field.readOnly?w`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><a href="${t}">${t}</a></vaadin-custom-field>`:w`
                            <vaadin-text-field
                                    id="${this.field.fieldId}"
                                    label="${n}"
                                    required="${this.field.required||_}"
                                    @value-changed="${this.valueChanged}"
                                    value="${t}"
                                    .helperText="${this.helperText()}"
                                    ?autofocus="${this.field.wantsFocus}"
                            >
                                <vaadin-icon slot="suffix"
                                             icon="vaadin:external-link"
                                             style="cursor: pointer;"
                                             @click="${()=>window.open(t,`_blank`)?.focus()}"
                                ></vaadin-icon>
                            </vaadin-text-field>
                `;if(this.field?.stereotype==`icon`)return this.field.readOnly?w`<vaadin-icon
                                             icon="${t}"
                                             data-colspan="${this.field.colspan}"
                    ></vaadin-icon>`:w`
                    <vaadin-combo-box
                                    id="${this.field.fieldId}"
                                    label="${n}"
                                    required="${this.field.required||_}"
                                    @value-changed="${this.valueChanged}"
                                    value="${t}"
                                    .helperText="${this.helperText()}"
                                    ?autofocus="${this.field.wantsFocus}"
                                    data-colspan="${this.field.colspan}"
                            item-label-path="displayName"
                            style="--vaadin-combo-box-overlay-width: 16em"
                                    .filteredItems="${this.filteredIcons}"
                            @filter-changed="${this.iconFilterChanged}"
                            ${u(this.iconComboboxRenderer,[])}
                    >
                        ${t?w`<vaadin-icon slot="prefix" icon="${t}"></vaadin-icon>`:_}
                    </vaadin-combo-box>
                `;if(this.field?.stereotype==`password`)return w`
                    <vaadin-password-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||_}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-password-field>
                `;if(this.field?.stereotype==`html`)return w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${g(``+t)}</div></vaadin-custom-field>
                `;if(this.field?.stereotype==`image`)return w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><img
                            src="${t}"
                            style="${this.component?.style}" class="${this.component?.cssClasses}"></vaadin-custom-field>
                `;if(this.field?.stereotype==`treeSelect`){let e=this.helperText();return w`
                    <div class="tree-field" id="${this.field.fieldId}" data-colspan="${this.field.colspan}">
                        ${n?w`
                            <span class="tree-field__label">${n}${this.field.required?w`<span class="tree-field__required"> •</span>`:_}</span>`:_}
                        <mateu-vaadin-tree-select
                                style="width: 100%;"
                                .fieldId="${this.field.fieldId}"
                                .value="${t}"
                                .options="${this.field.options??[]}"
                                .leavesOnly="${this.field.treeLeavesOnly??!1}"
                        ></mateu-vaadin-tree-select>
                        ${e?w`<span class="tree-field__helper">${e}</span>`:_}
                    </div>
                `}if(this.field?.stereotype==`signature`)return w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-signature-pad .fieldId="${this.field.fieldId}" .value="${t}"></mateu-signature-pad>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`camera`)return w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-camera-capture .fieldId="${this.field.fieldId}" .value="${t}"></mateu-camera-capture>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`fileUpload`){let e=Mc(this.field.attributes,`accept`);return w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-file-upload .fieldId="${this.field.fieldId}" .value="${t}" .accept="${e}"></mateu-file-upload>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype==`uploadableImage`){let e=t!=null&&t!==``;return w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-vertical-layout style="align-items: stretch; gap: var(--lumo-space-s); max-width: 320px;">
                            ${e?w`<img
                                    src="${t}"
                                    style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--lumo-contrast-20pct); border-radius: var(--lumo-border-radius-m); ${this.field.style??``}"
                                    class="${this.component?.cssClasses}">`:w`<div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--lumo-contrast-30pct); border-radius: var(--lumo-border-radius-m); color: var(--lumo-secondary-text-color);">
                                    <vaadin-icon icon="vaadin:picture" style="height: 2rem; width: 2rem;"></vaadin-icon>
                                </div>`}
                            <input type="file" accept="image/*" style="display: none;" @change="${this.imageUpload}">
                            <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-start;">
                                <vaadin-button @click="${this.triggerImageUpload}">
                                    <vaadin-icon icon="vaadin:upload" slot="prefix"></vaadin-icon>
                                    ${e?`Replace`:`Upload`}
                                </vaadin-button>
                                ${e?w`<vaadin-button theme="error tertiary" @click="${this.imageDelete}">
                                    <vaadin-icon icon="vaadin:trash" slot="prefix"></vaadin-icon>
                                    Delete
                                </vaadin-button>`:_}
                            </vaadin-horizontal-layout>
                        </vaadin-vertical-layout>
                    </vaadin-custom-field>
                `}return this.field?.stereotype==`color`?this.field.readOnly?w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><span style="background-color: ${t}; display: block; height: 20px; width: 40px; margin-top: 5px; margin-bottom: 24px; border: 1px solid var(--lumo-secondary-text-color)"></vaadin-custom-field>
                `:w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                    >
                        <input type="color" @input="${e=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"/>
                        <!--
                        <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                            <span style="background-color: ${t}; display: inline-block; height: 20px; width: 40px; border: 1px solid var(--lumo-secondary-text-color);"></span>
                            <vaadin-button @click="${()=>this.colorPickerOpened=!0}">Change</vaadin-button>
                        </vaadin-horizontal-layout>
                        -->
                    </vaadin-custom-field>
                    <vaadin-dialog
  header-title="Choose color"
  .opened="${this.colorPickerOpened}"
  @closed="${()=>{this.colorPickerOpened=!1}}"
  ${s(this.renderColorPicker,[])}
  ${p(this.renderColorPickerFooter,[])}
></vaadin-dialog>
                `:w`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||_}"
                        ?disabled="${this.field.disabled}"
                        data-colspan="${this.field.colspan}"
                        style="${this.field.style}"
                ></vaadin-text-field>
`}renderNumberField(e,t,n,r){return this.field?w`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||_}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||_}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min==null?_:this.field.min}"
                        max="${this.field.max==null?_:this.field.max}"
            ></vaadin-number-field>`:w``}renderIntegerField(e,t,n,r){if(!this.field)return w``;if(this.field.stereotype==`stars`){let e=t;return isNaN(e)&&(e=0),w`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >${[1,2,3,4,5].map(t=>w`
                    <vaadin-icon 
                            icon="vaadin:star" 
                            style="cursor: pointer; color: var(${t<=e?`--lumo-warning-color`:`--lumo-shade-30pct`});"
                            @click="${()=>this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}"
                    
                    ></vaadin-icon>
                `)}</vaadin-custom-field>`}if(this.field.stereotype==`slider`){let e=t;return isNaN(e)&&(e=0),w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><input type="range" @input="${e=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}" min="${this.field.sliderMin??0}" max="${this.field.sliderMax??10}" value="${e??0}"/></vaadin-custom-field>
                `}return w`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||_}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||_}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min==null?_:this.field.min}"
                        max="${this.field.max==null?_:this.field.max}"
                ></vaadin-integer-field>
            `}renderBoolField(e,t,n,r){return this.field?this.field.stereotype==`toggle`?w`
                    <vaadin-custom-field
                            label="${n}"
                            .helperText="${this.helperText()}"
                            ?required="${this.field.required||_}"
                            data-colspan="${this.field.colspan}"
                    >
                        <paper-toggle-button id="${this.field.fieldId}"
                                             ?disabled=${this.field.disabled}
                                             ?checked=${t}
                                             @change=${this.checked}>
                        </paper-toggle-button>
                    </vaadin-custom-field>
                `:w`
                <vaadin-checkbox
                        id="${this.field.fieldId}"
                        label="${n}"
                        .helperText="${this.helperText()}"
                        ?required="${this.field.required||_}"
                        data-colspan="${this.field.colspan}"
                        @change="${this.checked}"
                        value="${t}"
                        ?checked=${t}
                        ?autofocus="${this.field.wantsFocus}"
                ></vaadin-checkbox>
            `:w``}renderDateRangeField(e,t,n,r){if(!this.field)return w``;let i=t?t.from+`;`+t.to:void 0;return w`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${n}"
                    @value-changed="${e=>{e.detail.value&&(e.detail.value={from:e.detail.value.split(`;`)[0],to:e.detail.value.split(`;`)[1]}),this.valueChanged(e)}}"
                    value="${i}"
                    .helperText="${this.helperText()}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||_}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,n,r){return this.field?w`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||_}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:w``}renderDateTimeField(e,t,n,r){return this.field?w`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||_}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:w``}renderTimeField(e,t,n,r){return this.field?w`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||_}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:w``}renderArrayField(e,t,n,r){if(!this.field)return w``;if(this.field?.stereotype==`choice`)return w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            required="${this.field.required||_}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-choice
                                .field="${this.field}"
                                .value="${t}"
                                .state="${this.state}"
                                .data="${this.data}"
                                .appState="${this.appState}"
                                .appdata="${this.appData}"
                        ></mateu-choice>
                        
                    </vaadin-custom-field>
                    `;if(this.field?.stereotype==`grid`)return w`
                    <vaadin-custom-field
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                            style="width: 100%;"
                    >
                    <mateu-grid
                            id="${this.field.fieldId}"
                        .field="${this.field}"
                        .state="${this.state}"
                        .data="${this.data}"
                            .appState="${this.appState}"
                            .appdata="${this.appData}"
                            data-colspan="${this.field.colspan}"
                    ></mateu-grid>
                    </vaadin-custom-field>
`;if(this.field?.stereotype==`listBox`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),w`
                        <vaadin-custom-field
                                label="${n}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box multiple
                                     .selectedValues="${x(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                            id="${this.field.fieldId}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map(e=>w`
                            <vaadin-item>${e.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                        </vaadin-custom-field>
                    `}return w`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box multiple
                                     .selectedValues="${x(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                                     data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(e=>w`
                            <vaadin-item>${e.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype==`combobox`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return w`
                        <vaadin-multi-select-combo-box
                            label="${n}"
                            item-label-path="label"
                            item-id-path="value"
                            item-value-path="value"
                            .dataProvider="${this.remoteComboDataProvider(e.action)}"
                            .helperText="${this.helperText()}"
                            .selectedItems="${this.selectedItems(t)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||_}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            auto-expand-horizontally
                            auto-expand-vertically
                            xselected-items-on-top
                    ></vaadin-multi-select-combo-box>
                    `}return w`
                    <vaadin-multi-select-combo-box
                            label="${n}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            .selectedItems="${this.selectedItems(t)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||_}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            auto-expand-horizontally
                            auto-expand-vertically
                            xselected-items-on-top
                    ></vaadin-multi-select-combo-box>
                    `}if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.rendered||setTimeout(()=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}),w`
                    <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${n}"
                        theme="vertical"
                        @value-changed="${this.valueChanged}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||_}"
                        data-colspan="${this.field.colspan}"
                        .value="${t}"
                        class="mateu-checkbox-group-${this.field.optionsColumns>1?`multi-column`:``}"
                >
                        ${this.data[this.id]?.content?.map(e=>w`
                            <vaadin-checkbox
                                    value="${e.value}"
                                    label="${e.label}"
                            ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
                    `}return w`
                <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        theme="vertical"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||_}"
                        data-colspan="${this.field.colspan}"
                        class="mateu-checkbox-group-${this.field.optionsColumns>1?`multi-column`:``}"
                        .value="${t}"
                >
                        ${this.field.options?.map(e=>w`
                        <vaadin-checkbox 
                                value="${e.value}" 
                                label="${e.label}"
                        ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
            `}renderMoneyField(e,t,n,r){if(!this.field)return w``;if(this.field.readOnly){let e=t,r=e;return r=e&&e.locale&&e.currency?new Intl.NumberFormat(e.locale,{style:`currency`,currency:e.currency}).format(e.value):new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(e),w`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><div style="width: 186px; text-align: right;">${r}</div></vaadin-custom-field>`}return w`<mateu-money-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        .value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||_}"
                        data-colspan="${this.field.colspan}"
            ></mateu-money-field>`}renderStatusField(e,t,n,r){if(!this.field)return w``;let i=t;return w`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        required="${this.field.required||_}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    ${i?w`<span theme="badge pill ${ua(i.type)}">${i.message}</span>`:w``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,n,r){if(!this.field)return w``;this.loadUi5FieldComponents();let i=t;return w`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${i?.from??0}" end-value="${i?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${this.field.sliderMax??10}"
                                   step="${this.field.step||_}"
                                   @change="${e=>{let t=e.target;this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:{from:t.startValue,to:t.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}static{this.styles=m`
        ${fe}

        /* Fields fill the whole column width by default. Date, checkbox, numeric and money inputs
           are the exception — they keep their natural (narrower) width so a date/amount doesn't
           stretch across the column. (vaadin inputs default to a fixed width, hence the explicit
           width: 100% on the stretchy ones.) */
        :host {
            display: block;
            width: 100%;
        }
        :host vaadin-text-field,
        :host vaadin-text-area,
        :host vaadin-combo-box,
        :host vaadin-multi-select-combo-box,
        :host vaadin-select,
        :host vaadin-email-field,
        :host vaadin-password-field,
        :host vaadin-custom-field {
            width: 100%;
        }
        /* A field spanning several columns (host colspan attribute, set when colspan > 1) stretches
           every input — including the naturally-narrow date/numeric ones — to fill the columns. */
        :host([colspan]) vaadin-date-picker,
        :host([colspan]) vaadin-date-time-picker,
        :host([colspan]) vaadin-time-picker,
        :host([colspan]) vaadin-number-field,
        :host([colspan]) vaadin-integer-field {
            width: 100%;
        }

        /* Tree-select field wrapper (rendered without vaadin-custom-field — see the treeSelect
           branch). Its own label mimics the vaadin field label density. */
        .tree-field {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
        .tree-field__label {
            align-self: flex-start;
            font-size: var(--mateu-label-font-size, var(--lumo-font-size-s));
            line-height: var(--mateu-label-line-height, 1);
            padding-bottom: var(--mateu-label-padding-bottom, 7px);
            color: var(--lumo-secondary-text-color);
        }
        .tree-field__required {
            color: var(--lumo-required-field-indicator-color, var(--lumo-primary-text-color));
        }
        .tree-field__helper {
            padding-top: 0.25rem;
            font-size: var(--lumo-font-size-xs);
            color: var(--lumo-secondary-text-color);
        }

        .mateu-checkbox-group-multi-column::part(group-field) {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem 3rem;
        }

        /* Field-label density. Defaults reproduce the standard look; a page can compress all of
           them at once by setting the --mateu-label-* variables (e.g. via the @Compact preset). */
        vaadin-text-field::part(label),
        vaadin-text-area::part(label),
        vaadin-combo-box::part(label),
        vaadin-multi-select-combo-box::part(label),
        vaadin-select::part(label),
        vaadin-date-picker::part(label),
        vaadin-time-picker::part(label),
        vaadin-number-field::part(label),
        vaadin-email-field::part(label),
        vaadin-password-field::part(label),
        vaadin-custom-field::part(label) {
            font-size: var(--mateu-label-font-size, var(--lumo-font-size-s));
            padding-bottom: var(--mateu-label-padding-bottom, 7px);
            line-height: var(--mateu-label-line-height, 1.2);
            /* Let long labels wrap onto several lines instead of truncating with an ellipsis
               (e.g. "Tiempo esperando" / "Tipo hab. contratada" in a dense multi-column form). */
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
            height: auto;
        }
  `}};O([S()],Q.prototype,`ui5FieldComponentsReady`,void 0),O([v()],Q.prototype,`component`,void 0),O([v()],Q.prototype,`field`,void 0),O([v()],Q.prototype,`baseUrl`,void 0),O([v()],Q.prototype,`state`,void 0),O([v()],Q.prototype,`data`,void 0),O([v()],Q.prototype,`appState`,void 0),O([v()],Q.prototype,`appData`,void 0),O([v()],Q.prototype,`labelAlreadyRendered`,void 0),O([S()],Q.prototype,`colorPickerOpened`,void 0),O([S()],Q.prototype,`colorPickerValue`,void 0),O([S()],Q.prototype,`controlOwnsValidity`,void 0),O([S()],Q.prototype,`filteredIcons`,void 0),O([S()],Q.prototype,`navLinkOffset`,void 0),Q=O([h(`mateu-field`)],Q);var Sl=(e,t,n,r,i,a,o,s)=>{let c=t.metadata;return w`
        <mateu-field
                id="${t.id}"
                .component="${t}"
                .field="${t.metadata}"
                .state="${r}"
                .data="${i}"
                .appState="${a}"
                .appdata="${o}"
                style="${ia(t,i)}" class="${t.cssClasses}"
                slot="${t.slot??_}"
                data-colspan="${c.colspan}"
                colspan="${(c.colspan??1)>1?c.colspan:_}"
                .labelAlreadyRendered="${s}"
        >
            ${t.children?.map(t=>P(e,t,n,r,i,a,o,s))}
        </mateu-field>
    `},Cl=(e,n,r,i,a,o,s)=>{let c=n.metadata;if(c.tree)return w`
        <vaadin-grid style="${n.style}" class="${n.cssClasses}"
                     .itemHasChildrenPath="${`children`}" .dataProvider="${async(e,t)=>{let n=e.parentItem?e.parentItem.children:c.page.content;t(n,n.length)}}"
                     slot="${n.slot??_}"
                     all-rows-visible
        >
            ${c.content.map((n,c)=>{let l=n.metadata;return c>0?w`
            <vaadin-grid-column path="${n.id}"
                                header="${l?.label??_}"
                                ?auto-width="${l?.autoWidth}"
                                flex-grow="${l?.flexGrow??_}"
                                width="${l?.width??_}"
                                .column="${n.metadata}"
                                ${t((t,n,c)=>pl(t,n,c,l,e,r,i,a,o,s),[])}></vaadin-grid-column>
`:w`
            <vaadin-grid-tree-column path="${n.id}"
                                header="${l?.label??_}"
                                ?auto-width="${l?.autoWidth}"
                                flex-grow="${l?.flexGrow??_}"
                                width="${l?.width??_}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${St()}</span>
        </vaadin-grid>
    `;let l=c.page?.content;return n.id&&i&&i[n.id]&&(l=i[n.id]),l||=[],w`
        <vaadin-grid 
                style="${n.style}" 
                class="${n.cssClasses}" 
                .items="${l}"
                all-rows-visible
        >
            ${c?.content?.map(t=>dl(t,e,r,i,a,o,s))}
        </vaadin-grid>
    `},$=class extends y{constructor(...e){super(...e),this.id=``,this.baseUrl=``,this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{let n=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let r=!1;n&&n.content&&(n.content.length>=(e.page+1)*e.pageSize||n.content.length==n.totalElements)&&(t(n.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),n.totalElements),r=!0,this.grid&&this.grid.recalculateColumnWidths()),r||this.pagesRequested.find(t=>t==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent(`fetch-more-elements`,{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{let e=this.metadata?.infiniteScrolling?n?.totalElements:n?.content?.length??0;t(n?.content??[],e),this.grid&&this.grid.recalculateColumnWidths()}},this._onActionRequested=e=>{let t=e.detail,n=this.identifierFieldName;if(!n||!t.parameters||t.actionId?.startsWith(`action-on-row-`))return;let r=t.parameters[n];r!==void 0&&(this.state._selectedId=String(r),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t=``,{column:n,item:r}=e,i=this.metadata?.columns?.find(e=>e.metadata.id==n?.path);if(i?.metadata){let e=(i?.metadata).tooltipPath;e&&n&&r&&(t=r[e])}return t}}get identifierFieldName(){let e=this.metadata?.columns?.find(e=>e.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(e=>e.metadata?.id===`id`))return`id`}_applyCellPartNameGenerator(){if(!this.grid)return;let e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId,n=!!this.metadata?.groupBy;e&&t!==void 0||n?this.grid.cellPartNameGenerator=(n,r)=>{let i=r.item;return Pc(i)?`mateu-group-row`:e&&t!==void 0&&String(i[e])===String(t)?`selected-row`:``}:this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener(`action-requested`,this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`action-requested`,this._onActionRequested)}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.requestContentUpdate(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}render(){let e=this.data[this.id],r=e?.page,i=this.metadata?.groupBy,a=this.metadata?.infiniteScrolling?void 0:r?.content?Ic(r.content,i,e?.groups):r?.content,o=Bc((this.metadata?.columns??[]).flatMap(e=>e.metadata?.type===A.GridGroupColumn?(e.metadata.columns??[]).map(e=>e.metadata):[e.metadata]),e,i),s=``;return this.metadata?.wrapCellContent&&(s+=` wrap-cell-content`),this.metadata?.compact&&(s+=` compact`),this.metadata?.noBorder&&(s+=` no-border`),this.metadata?.noRowBorder&&(s+=` no-row-borders`),this.metadata?.columnBorders&&(s+=` column-borders`),this.metadata?.rowStripes&&(s+=` row-stripes`),w`
            <vaadin-grid
                    .items="${a}"
                    item-id-path="_rowNumber"
                    .selectedItems="${this.state[this.id+`_selected_items`]||[]}"
                    ?data-clickable-rows="${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?`lazy`:_}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.metadata?.infiniteScrolling?this.dataProvider:void 0}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    @selected-items-changed="${e=>{let t=(e.detail.value??[]).filter(e=>!Pc(e));this.emptyArray(this.state[this.id+`_selected_items`])&&this.emptyArray(t)||(this.state[this.id+`_selected_items`]=t,this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0})))}}"
                    @active-item-changed="${x(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?e=>{if(this.metadata?.detailPath){let t=e.detail.value;if(t&&Pc(t))return;t?this.detailsOpenedItems=[t]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${x(this.metadata?.detailPath?n(e=>w`${P(this,e[this.metadata?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    theme="${s}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?w`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:_}
                ${this.metadata?.columns?.map(e=>dl(e,this,this.baseUrl,this.state,this.data,this.appState,this.appData,o))}
                ${this.metadata?.useButtonForDetail?w`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${t((e,{detailsOpened:t})=>w`
              <vaadin-button
                theme="tertiary icon"
                title="${t?`Collapse`:`Expand`}"
                aria-label="Toggle details"
                aria-expanded="${t?`true`:`false`}"
                @click="${()=>{this.detailsOpenedItems=t?this.detailsOpenedItems.filter(t=>t!==e):[...this.detailsOpenedItems,e]}}"
              >
                <vaadin-icon
                  .icon="${t?`lumo:angle-down`:`lumo:angle-right`}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:_}
                <span slot="empty-state">${St(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(e=>e.metadata.tooltipPath)?w`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:_}
            </vaadin-grid>
            <slot></slot>
       `}static{this.styles=m`
        ${fe}
        vaadin-grid[data-clickable-rows]::part(row) {
            cursor: pointer;
        }
        vaadin-grid[data-clickable-rows]::part(row):hover {
            background-color: var(--lumo-primary-color-10pct);
        }
        vaadin-grid::part(selected-row) {
            background-color: var(--lumo-primary-color-10pct);
        }
        vaadin-grid::part(mateu-group-row) {
            background-color: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
            font-weight: 600;
        }
  `}};O([v()],$.prototype,`id`,void 0),O([v()],$.prototype,`metadata`,void 0),O([v()],$.prototype,`baseUrl`,void 0),O([v()],$.prototype,`state`,void 0),O([v()],$.prototype,`data`,void 0),O([v()],$.prototype,`appState`,void 0),O([v()],$.prototype,`appData`,void 0),O([v()],$.prototype,`emptyStateMessage`,void 0),O([S()],$.prototype,`detailsOpenedItems`,void 0),O([b(`vaadin-grid`)],$.prototype,`grid`,void 0),$=O([h(`mateu-table`)],$);var wl=(e,t,n,r,i,a,o)=>w`
    <mateu-table
            id="${t.id}"
            baseUrl="${n}"
            .metadata="${t.metadata}"
            .state="${r}"
            .data="${i}"
            .appState="${a}"
            .appDate="${o}"
            style="${t.style}" class="${t.cssClasses}"
            slot="${t.slot??_}"
    >
        ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
    </mateu-table>`,Tl=(e,t,n,r,i,a)=>w`
    <mateu-table id="${e.id}"
                 .metadata="${t?.metadata}"
                 .data="${e.data}"
                 .state="${r}"
                 .appState="${i}"
                 .appData="${a}"
                 .emptyStateMessage="${r[t?.id]?.emptyStateMessage}"
                 @sort-direction-changed="${e.directionChanged}"
                 @fetch-more-elements="${e.fetchMoreElements}"
                 baseUrl="${n}"
    ></mateu-table>`,El=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`
        <div id="show-notifications" slot="${t.slot??_}">${P(e,s.wrapped,n,r,i,a,o)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                ${te(()=>w`${P(e,s.content,n,r,i,a,o)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},Dl=(e,t,n)=>{let r=e;return w`
        <vaadin-button
                data-action-id="${r.id}"
                theme="${ht(e)||_}"
                @click="${n}"
                ?disabled="${r.disabled}"
        >${r.iconOnLeft?w`<vaadin-icon icon="${r.iconOnLeft}"></vaadin-icon>`:_}${t}${r.iconOnRight?w`<vaadin-icon icon="${r.iconOnRight}"></vaadin-icon>`:_}</vaadin-button>
    `},Ol=e=>w`
    <div style="display: flex; gap: var(--lumo-space-xs, .25rem); align-items: center;" class="peer-nav">
        <vaadin-button theme="tertiary icon" class="peer-nav-prev" title="${e.prevLabel??`Previous`}"
                ?disabled="${!e.prevRoute}"
                @click="${()=>{e.prevRoute&&(window.location.href=e.prevRoute)}}">
            <vaadin-icon icon="vaadin:angle-left"></vaadin-icon>
        </vaadin-button>
        <vaadin-button theme="tertiary icon" class="peer-nav-next" title="${e.nextLabel??`Next`}"
                ?disabled="${!e.nextRoute}"
                @click="${()=>{e.nextRoute&&(window.location.href=e.nextRoute)}}">
            <vaadin-icon icon="vaadin:angle-right"></vaadin-icon>
        </vaadin-button>
    </div>`,kl={"vaadin:wifi":`vaadin:connect`,"vaadin:pen":`vaadin:pencil`,"vaadin:automation":`vaadin:cogs`},Al=(e,t,n)=>w`<vaadin-icon icon="${kl[e]??e}" style="${t??_}" class="${n??_}"></vaadin-icon>`,jl=(e,t,n)=>{let r=e.metadata,i=j(r.label,t,n),a=``;return r.buttonStyle&&(a+=` `+r.buttonStyle),r.color&&r.color!==`none`&&r.color!==`normal`&&(a+=` `+r.color),r.size&&r.size!==`none`&&r.size!==`normal`&&(a+=` `+r.size),w`<vaadin-button
            id="${e.id}"
            data-action-id="${r.actionId}"
            @click="${e=>zn(e,r)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${a}"
            ?disabled="${r.disabled}"
            title="${r.shortcut?`${i} (${Rn(r.shortcut)})`:_}"
            slot="${e.slot??_}"
    >${r.iconOnLeft?w`<vaadin-icon icon="${r.iconOnLeft}"></vaadin-icon>`:_}${i}${r.iconOnRight?w`<vaadin-icon icon="${r.iconOnRight}"></vaadin-icon>`:_}</vaadin-button>`},Ml=e=>{let t=e.metadata;return w`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??_}"
                @submit="${e=>{let n=e.detail?.value??``;!t.actionId||!n.trim()||e.currentTarget.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:{message:n}},bubbles:!0,composed:!0}))}}"
        ></vaadin-message-input>
    `},Nl=e=>{let t=(e.metadata.items??[]).map(e=>({text:e.text,time:e.time,userName:e.userName,userImg:e.userImg,userAbbr:e.userAbbr,userColorIndex:e.userColorIndex}));return w`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??_}"
                .items="${t}"
        ></vaadin-message-list>
    `},Pl=(e,t)=>{e&&e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t},bubbles:!0,composed:!0}))},Fl=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=!1;if(s.openedCondition)try{c=at(s.openedCondition,r,i,a,o)}catch(e){console.error(`when evaluating `+s.openedCondition+` :`+e+`, where data is `+i+` and state is `+r)}return w`
        <vaadin-confirm-dialog
                header="${s.header}"
                ?cancel-button-visible="${s.canCancel}"
                ?reject-button-visible="${s.canReject}"
                reject-text="${s.rejectText}"
                confirm-text="${s.confirmText}"
                .opened="${c}"
                @confirm="${e=>Pl(e.currentTarget,s.confirmActionId)}"
                @reject="${e=>Pl(e.currentTarget,s.rejectActionId)}"
                @cancel="${e=>Pl(e.currentTarget,s.cancelActionId)}"
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??_}"
        >
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </vaadin-confirm-dialog>
    `},Il=class extends y{constructor(...e){super(...e),this.panels=[],this.headerTitle=``,this.badges=[],this.navigation=null,this.overviewEditActionId=``,this._raf=0,this._snapping=!1,this._less=!1,this._more=!1,this._onScroll=()=>{this._raf||=requestAnimationFrame(()=>{this._raf=0,this._syncPin()})},this._onScrollEnd=()=>{this._snapping||this._snapToNearest()},this._fit=()=>{let e=this.getBoundingClientRect().top;this.style.setProperty(`--mateu-foldout-fill`,`${Math.max(240,window.innerHeight-e)}px`),this._syncPin()},this._onKeydown=e=>{if(e.key!==`ArrowRight`&&e.key!==`ArrowLeft`||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||this._isEditingContext())return;let t=this._rail;!t||t.scrollWidth<=t.clientWidth||(e.preventDefault(),this._step(e.key===`ArrowRight`?1:-1))}}navAction(e){e&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}_stride(){let e=this.renderRoot.querySelectorAll(`.section`);return e.length>1?e[1].offsetLeft:this._rail?.clientWidth??0}_boundaries(){let e=this._rail;if(!e)return[];let t=e.scrollWidth-e.clientWidth,n=[...this.renderRoot.querySelectorAll(`.section`)].map(e=>Math.max(0,Math.min(e.offsetLeft,t)));return[...new Set(n)]}_snapToNearest(){let e=this._rail;if(!e)return;let t=this._boundaries();if(!t.length)return;let n=t.reduce((t,n)=>Math.abs(n-e.scrollLeft)<Math.abs(t-e.scrollLeft)?n:t);Math.abs(n-e.scrollLeft)<1||(this._snapping=!0,e.scrollTo({left:n,behavior:`smooth`}),window.setTimeout(()=>{this._snapping=!1},400))}_syncPin(){let e=this._rail,t=this._first;if(!e||!t)return;let n=this._stride(),r=Math.min(e.scrollLeft,n);t.style.transform=r?`translateX(${r}px)`:``,t.classList.toggle(`floating`,e.scrollLeft>0);let i=e.scrollWidth-e.clientWidth,a=i>32;this._less=a&&e.scrollLeft>2,this._more=a&&e.scrollLeft<i-2}_step(e){let t=this._rail;if(!t)return;let n=this._boundaries();if(!n.length)return;let r=n.reduce((e,r,i)=>Math.abs(r-t.scrollLeft)<Math.abs(n[e]-t.scrollLeft)?i:e,0),i=n[Math.max(0,Math.min(r+e,n.length-1))];this._snapping=!0,t.scrollTo({left:i,behavior:`smooth`}),window.setTimeout(()=>{this._snapping=!1},400)}_isEditingContext(){let e=document.activeElement;for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;if(!e)return!1;let t=e.tagName;return t===`INPUT`||t===`TEXTAREA`||t===`SELECT`||e.isContentEditable}_sectionFlex(e,t){if(!e.width)return _;let n=parseFloat(e.width)||1;return t===this.panels.length-1&&n<22?`flex: 22 1 var(--mateu-foldout-overview-width, 22rem);`:`flex: ${n} 1 ${e.width};`}firstUpdated(){this._fit(),this._resizeObserver=new ResizeObserver(()=>this._syncPin()),this._rail&&this._resizeObserver.observe(this._rail);for(let e of this.renderRoot.querySelectorAll(`.section`))this._resizeObserver.observe(e)}connectedCallback(){super.connectedCallback(),document.addEventListener(`keydown`,this._onKeydown),window.addEventListener(`resize`,this._fit)}disconnectedCallback(){document.removeEventListener(`keydown`,this._onKeydown),window.removeEventListener(`resize`,this._fit),this._resizeObserver?.disconnect(),this._resizeObserver=void 0,this._raf&&=(cancelAnimationFrame(this._raf),0),super.disconnectedCallback()}static{this.styles=m`
        :host {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
            min-height: var(--mateu-foldout-min-height, 30rem);
            height: var(--mateu-foldout-fill, var(--mateu-foldout-height, calc(100dvh - 8rem)));
            margin: var(--mateu-foldout-outer-margin, 0);
        }
        /* The carousel row: full-height borderless columns; snaps each column flush to the left. */
        .rail {
            display: flex;
            flex: 1;
            min-height: var(--mateu-foldout-fill, var(--mateu-foldout-min-height, calc(100dvh - 8rem)));
            gap: var(--mateu-foldout-gap, var(--lumo-space-l, 1.5rem));
            align-items: stretch;
            overflow-x: auto;
            overflow-y: hidden;
            padding: var(--mateu-foldout-rail-padding, 0);
            outline: none;
        }
        .rail:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #1976d2);
            outline-offset: -2px;
        }
        .section {
            position: relative;
            /* the declared width is the BASIS; sections grow to fill the row when there is
               free space (100%-wide foldout) and behave exactly as before when overflowing
               (flex-grow only distributes free space, so the carousel/snapping is untouched) */
            flex: 22 1 var(--mateu-foldout-section-width, 22rem);
            min-width: 0;
            background: var(--mateu-foldout-panel-bg, transparent);
            border: none;
            border-radius: 0;
            padding: var(--mateu-foldout-panel-padding, var(--lumo-space-m, 1rem));
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: .5rem;
            overflow-y: auto;
        }
        /* The overview: pinned to the left edge for one carousel step via a transform (see _syncPin).
           While floating over the scrolled content it needs an opaque background (so the sliding
           columns pass cleanly behind it) + its own stacking context + a drop shadow; at rest it
           stays borderless/flush. NOT position: sticky — that fights scroll-snap on the same box. */
        .section--first {
            position: relative;
            z-index: 2;
            flex-basis: var(--mateu-foldout-overview-width, 22rem);
            will-change: transform;
        }
        .section--first.floating {
            background: var(--mateu-foldout-panel-bg, var(--lumo-base-color, #fff));
            box-shadow: var(--mateu-foldout-pinned-shadow, 6px 0 12px -6px rgba(0, 0, 0, .25));
        }
        /* Title + toolbar + badges — these live INSIDE the first section, not in a full-width band. */
        .section-head {
            display: flex;
            flex-direction: column;
            gap: .5rem;
        }
        .section-head-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: .75rem;
        }
        .section-title {
            margin: 0;
            font-size: var(--mateu-foldout-header-title-size, var(--lumo-font-size-xl, 1.375rem));
            font-weight: var(--mateu-foldout-header-title-weight, 700);
            color: var(--lumo-header-text-color, inherit);
            line-height: 1.2;
        }
        .section-toolbar {
            display: inline-flex;
            align-items: center;
            gap: .35rem;
            flex: 0 0 auto;
        }
        .section-toolbar .tb-parent,
        .section-toolbar .tb-edit {
            display: inline-flex;
            align-items: center;
            gap: .3rem;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, .16));
            background: var(--lumo-base-color, #fff);
            color: var(--lumo-primary-text-color, #1976d2);
            cursor: pointer;
            font: inherit;
            font-weight: 600;
            font-size: var(--lumo-font-size-s, .875rem);
            padding: .2rem .5rem;
            border-radius: var(--lumo-border-radius-m, 6px);
        }
        .section-toolbar .tb-move {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.9rem;
            height: 1.9rem;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, .16));
            background: var(--lumo-base-color, #fff);
            border-radius: var(--lumo-border-radius-m, 6px);
            cursor: pointer;
            color: var(--lumo-body-text-color, inherit);
            font-size: 1rem;
            line-height: 1;
        }
        .section-toolbar button:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .04));
        }
        .section-badges {
            display: flex;
            flex-wrap: wrap;
            gap: .5rem;
        }
        .section-badge {
            border: 1px solid var(--lumo-contrast-30pct, rgba(0, 0, 0, .2));
            border-radius: 999px;
            padding: .1rem .625rem;
            font-size: var(--lumo-font-size-s, .8rem);
            color: var(--lumo-secondary-text-color, inherit);
            white-space: nowrap;
        }
        .overview-body {
            flex: 1;
            min-height: 0;
        }
        .panel-header h3 {
            margin: 0;
            font-size: var(--mateu-foldout-title-size, var(--lumo-font-size-l, 1.125rem));
            font-weight: var(--mateu-foldout-title-weight, 600);
        }
        .panel-header .subtitle {
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #666);
        }
        .panel-body {
            flex: 1;
            min-height: 0;
        }
        /* Carousel affordances: floating round buttons at the bottom corners, each shown only while
           the carousel can still scroll that way (the left one hides at the start, the right one at
           the end). Clicking steps one section that direction. */
        .scroll-nav {
            position: absolute;
            bottom: var(--mateu-foldout-nav-bottom, 1.25rem);
            z-index: 3;
            width: 2.75rem;
            height: 2.75rem;
            border-radius: 50%;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, .08));
            background: var(--lumo-base-color, #fff);
            color: var(--lumo-primary-text-color, #1976d2);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, .18);
            transition: opacity .2s ease, transform .2s ease;
        }
        .scroll-nav.right {
            right: var(--mateu-foldout-nav-right, 1.25rem);
        }
        .scroll-nav.left {
            left: var(--mateu-foldout-nav-left, 1.25rem);
        }
        .scroll-nav:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .04));
        }
        .scroll-nav.right:hover {
            transform: translateX(2px);
        }
        .scroll-nav.left:hover {
            transform: translateX(-2px);
        }
        .scroll-nav svg {
            width: 1.35rem;
            height: 1.35rem;
        }
    `}render(){let e=this.navigation,t=!!(this.overviewEditActionId||e&&(e.parentActionId||e.previousActionId||e.nextActionId)),n=!!(this.headerTitle||t||this.badges.length);return w`
            <div class="rail" part="rail" tabindex="0"
                 @scroll="${this._onScroll}" @scrollend="${this._onScrollEnd}">
                <section class="section section--first" part="section overview">
                    ${n?w`
                        <header class="section-head" part="section-head">
                            <div class="section-head-row">
                                ${this.headerTitle?w`<h2 class="section-title">${this.headerTitle}</h2>`:w`<span></span>`}
                                ${t?w`
                                    <div class="section-toolbar" part="section-toolbar">
                                        ${e?.parentActionId?w`
                                            <button class="tb-parent" title="${e.parentLabel??`Back`}"
                                                    @click="${()=>this.navAction(e.parentActionId)}">
                                                <span>‹</span><span>${e.parentLabel??`Back`}</span>
                                            </button>
                                        `:_}
                                        ${e?.previousActionId?w`
                                            <button class="tb-move" title="Previous"
                                                    @click="${()=>this.navAction(e.previousActionId)}">‹</button>
                                        `:_}
                                        ${e?.nextActionId?w`
                                            <button class="tb-move" title="Next"
                                                    @click="${()=>this.navAction(e.nextActionId)}">›</button>
                                        `:_}
                                        ${this.overviewEditActionId?w`
                                            <button class="tb-edit" title="Edit"
                                                    @click="${()=>this.navAction(this.overviewEditActionId)}">
                                                <span>✎</span><span>Edit</span>
                                            </button>
                                        `:_}
                                    </div>
                                `:_}
                            </div>
                            ${this.badges.length?w`
                                <div class="section-badges">
                                    ${this.badges.map(e=>w`<span class="section-badge">${e}</span>`)}
                                </div>
                            `:_}
                        </header>
                    `:_}
                    <div class="overview-body">
                        <slot name="overview"></slot>
                    </div>
                </section>
                ${this.panels.map((e,t)=>w`
                    <section class="section" part="section panel"
                             style="${this._sectionFlex(e,t)}">
                        ${e.title||e.subtitle?w`
                            <div class="panel-header">
                                ${e.title?w`<h3>${e.title}${e.subtitle?w` <span class="subtitle" style="font-weight: 400;">· ${e.subtitle}</span>`:_}</h3>`:_}
                                ${!e.title&&e.subtitle?w`<div class="subtitle">${e.subtitle}</div>`:_}
                            </div>
                        `:_}
                        <div class="panel-body">
                            <slot name="panel-${t}"></slot>
                        </div>
                    </section>
                `)}
            </div>
            ${this._less?w`
                <button class="scroll-nav left" part="scroll-nav-left" title="Scroll left"
                        aria-label="Scroll left" @click="${()=>this._step(-1)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 6 9 12 15 18"></polyline>
                    </svg>
                </button>
            `:_}
            ${this._more?w`
                <button class="scroll-nav right" part="scroll-nav-right" title="Scroll right"
                        aria-label="Scroll right" @click="${()=>this._step(1)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 6 15 12 9 18"></polyline>
                    </svg>
                </button>
            `:_}
        `}};O([v({type:Array})],Il.prototype,`panels`,void 0),O([v({type:String})],Il.prototype,`headerTitle`,void 0),O([v({type:Array})],Il.prototype,`badges`,void 0),O([v({attribute:!1})],Il.prototype,`navigation`,void 0),O([v({type:String})],Il.prototype,`overviewEditActionId`,void 0),O([b(`.rail`)],Il.prototype,`_rail`,void 0),O([b(`.section--first`)],Il.prototype,`_first`,void 0),O([S()],Il.prototype,`_less`,void 0),O([S()],Il.prototype,`_more`,void 0),Il=O([h(`mateu-vaadin-foldout`)],Il);var Ll=(e,t,n,r,i,a,o)=>{let s=t.metadata;return w`
        <mateu-vaadin-foldout
                .panels="${s.panels??[]}"
                .headerTitle="${s.headerTitle??``}"
                .badges="${s.badges??[]}"
                .navigation="${s.navigation??null}"
                overviewEditActionId="${s.overviewEditActionId??``}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??_}"
        >
            ${t.children?.map(t=>P(e,t,n,r,i,a,o))}
        </mateu-vaadin-foldout>
    `},Rl=class extends y{constructor(...e){super(...e),this.rows=[],this.columns=[],this.navigable=!1,this.expandedItems=[],this._normalized=[],this.dataProvider=(e,t)=>{let n=e.parentItem?e.parentItem.children??[]:this.normalized;t(n,n.length)}}get normalized(){return this._src!==this.rows&&(this._src=this.rows,this._normalized=this.normalizeRows(this.rows??[])),this._normalized}normalizeRows(e){return(e??[]).map(e=>{let t=Array.isArray(e.children)&&e.children.length?this.normalizeRows(e.children):void 0;return{...e,children:t}})}collectGroups(e,t=[]){return e.forEach(e=>{e.children&&e.children.length&&(t.push(e),this.collectGroups(e.children,t))}),t}willUpdate(){this._expandedSrc!==this.rows&&(this._expandedSrc=this.rows,this.expandedItems=this.collectGroups(this.normalized))}updated(e){e.has(`rows`)&&this._grid?.clearCache?.()}dispatch(e,t){this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}render(){let e=this.columns??[],n=e[0],r=e.slice(1);return w`
            <vaadin-grid
                    theme="compact no-row-borders"
                    all-rows-visible
                    .dataProvider="${this.dataProvider}"
                    .itemHasChildrenPath="${`children`}"
                    .expandedItems="${this.expandedItems}"
                    @expanded-items-changed="${e=>{this.expandedItems=e.detail.value}}">
                ${n?w`
                    <vaadin-grid-tree-column path="${n.id}" header="${n.label??``}"
                                             auto-width flex-grow="0"></vaadin-grid-tree-column>
                `:_}
                ${r.map(e=>e.id===`select`?w`<vaadin-grid-column header="${e.label??``}" auto-width flex-grow="0" text-align="end"
                              ${t(e=>w`<vaadin-button theme="tertiary small"
                                          @click="${()=>this.dispatch(`action-on-row-select`,{_clickedRow:e})}">Select</vaadin-button>`,[])}></vaadin-grid-column>`:w`<vaadin-grid-column path="${e.id}" header="${e.label??``}"></vaadin-grid-column>`)}
                ${this.navigable?w`
                    <vaadin-grid-column auto-width flex-grow="0" text-align="end"
                          ${t(e=>e?.viewable===!1?w``:w`<vaadin-button theme="tertiary small"
                                          @click="${()=>this.dispatch(`view`,e)}">View</vaadin-button>`,[])}></vaadin-grid-column>
                `:_}
            </vaadin-grid>
        `}static{this.styles=m`
        :host {
            display: block;
            width: 100%;
        }
        vaadin-grid {
            max-height: min(60vh, 32rem);
            min-width: 22rem;
        }
    `}};O([v({attribute:!1})],Rl.prototype,`rows`,void 0),O([v({attribute:!1})],Rl.prototype,`columns`,void 0),O([v()],Rl.prototype,`idField`,void 0),O([v({type:Boolean})],Rl.prototype,`navigable`,void 0),O([v()],Rl.prototype,`selectedId`,void 0),O([S()],Rl.prototype,`expandedItems`,void 0),O([b(`vaadin-grid`)],Rl.prototype,`_grid`,void 0),Rl=O([h(`mateu-vaadin-tree`)],Rl);var zl={[A.VirtualList]:(e,t,n,r,i,a,o)=>Qs(e,t,n,r,i,a,o),[A.Notification]:(e,t)=>$s(t),[A.ProgressBar]:(e,t,n,r)=>ec(t,r),[A.Details]:(e,t,n,r,i,a,o)=>tc(e,t,n,r,i,a,o),[A.Avatar]:(e,t,n,r,i)=>nc(t,r,i),[A.AvatarGroup]:(e,t)=>rc(t),[A.Card]:(e,t,n,r,i,a,o)=>ic(e,t,n,r,i,a,o),[A.Button]:(e,t,n,r,i)=>jl(t,r,i),[A.MessageInput]:(e,t)=>Ml(t),[A.MessageList]:(e,t)=>Nl(t),[A.ConfirmDialog]:(e,t,n,r,i,a,o)=>Fl(e,t,n,r,i,a,o),[A.FormLayout]:(e,t,n,r,i,a,o)=>sc(e,t,n,r,i,a,o),[A.HorizontalLayout]:(e,t,n,r,i,a,o)=>dc(e,t,n,r,i,a,o),[A.VerticalLayout]:(e,t,n,r,i,a,o)=>fc(e,t,n,r,i,a,o),[A.SplitLayout]:(e,t,n,r,i,a,o)=>pc(e,t,n,r,i,a,o),[A.MasterDetailLayout]:(e,t,n,r,i,a,o)=>mc(e,t,n,r,i,a,o),[A.TabLayout]:(e,t,n,r,i,a,o)=>hc(e,t,n,r,i,a,o),[A.AccordionLayout]:(e,t,n,r,i,a,o)=>_c(e,t,n,r,i,a,o),[A.BoardLayout]:(e,t,n,r,i,a,o)=>bc(e,t,n,r,i,a,o),[A.BoardLayoutRow]:(e,t,n,r,i,a,o)=>xc(e,t,n,r,i,a,o),[A.BoardLayoutItem]:(e,t,n,r,i,a,o)=>Sc(e,t,n,r,i,a,o),[A.Scroller]:(e,t,n,r,i,a,o)=>yc(e,t,n,r,i,a,o),[A.MenuBar]:(e,t,n,r,i)=>Tc(e,t,n,r,i),[A.ContextMenu]:(e,t,n,r,i,a,o)=>wc(e,t,n,r,i,a,o),[A.FormField]:(e,t,n,r,i,a,o,s)=>Sl(e,t,n,r,i,a,o,s),[A.Grid]:(e,t,n,r,i,a,o)=>Cl(e,t,n,r,i,a,o),[A.Table]:(e,t,n,r,i,a,o)=>wl(e,t,n,r,i,a,o),[A.Popover]:(e,t,n,r,i,a,o)=>El(e,t,n,r,i,a,o),[A.FoldoutLayout]:(e,t,n,r,i,a,o)=>Ll(e,t,n,r,i,a,o)},Bl=class extends Zs{rendererName(){return`vaadin`}renderClientSideComponent(e,t,n,r,i,a,o,s){let c=t?.metadata?.type,l=c?zl[c]:void 0;return l&&t?l(e,t,n,r,i,a,o,s):super.renderClientSideComponent(e,t,n,r,i,a,o,s)}renderTableComponent(e,t,n,r,i,a,o){return Tl(e,t,n,r,a,o)}renderTreeComponent(e,t){return w`
            <mateu-vaadin-tree
                    .rows="${t.rows}"
                    .columns="${t.columns}"
                    .idField="${t.idField}"
                    .navigable="${t.navigable}"
                    .selectedId="${t.selectedId}"
            ></mateu-vaadin-tree>`}renderToolbarButton(e,t,n){return Dl(e,t,n)}renderPeerNav(e){return Ol(e)}renderIcon(e,t,n){return Al(e,t,n)}renderTopNav(e,t,n){return Cc(e,t,n)}};function Vl(e){switch(e){case`topStretch`:return`top-stretch`;case`topStart`:return`top-start`;case`topCenter`:return`top-center`;case`topEnd`:return`top-end`;case`middle`:return`middle`;case`bottomStart`:return`bottom-start`;case`bottomEnd`:return`bottom-end`;case`bottomStretch`:return`bottom-stretch`;case`bottomCenter`:return`bottom-center`}return`bottom-end`}function Hl(e,t){if(e.onAction)return{label:e.actionLabel??`Retry`,run:e.onAction};if(e.undoActionId)return{label:e.undoLabel??`Undo`,run:()=>t.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0}))}}function Ul(e,t){let n=new r;n.position=Vl(e.position),n.duration=e.duration??1e4,e.variant&&n.setAttribute(`theme`,e.variant),n.renderer=r=>{if(r.firstElementChild)return;let i=document.createElement(`span`);i.textContent=e.text;let a=Hl(e,t),o=document.createElement(`button`);o.textContent=a.label,o.style.cssText=`margin-left: 0.75rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;`,o.addEventListener(`click`,()=>{a.run(),n.opened=!1}),r.append(i,o)},document.body.appendChild(n),n.opened=!0,n.addEventListener(`opened-changed`,e=>{e.detail.value||n.remove()})}N.set(new Bl),fa({show(e,t){if(Qe(e.text,{politeness:e.variant===`error`?`assertive`:`polite`}),e.undoActionId||e.onAction){Ul(e,t);return}r.show(e.text,{position:e.position?Vl(e.position):`bottom-end`,theme:e.variant,duration:e.duration})}});