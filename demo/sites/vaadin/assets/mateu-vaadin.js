const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-ol.js","assets/rolldown-runtime.js","assets/vendor.js","assets/vendor-chartjs.js","assets/vendor-diagrams.js","assets/vendor-ui5.js"])))=>i.map(i=>d[i]);
import{_ as e,a as t,c as n,d as r,f as i,g as a,h as o,i as s,l as c,m as l,n as u,o as d,p as f,r as p,s as m,t as h,u as ee,v as te}from"./vendor-vaadin.js";import{S as g,a as _,c as v,g as ne,h as y,i as b,m as x,n as S,o as C,r as w,v as T,w as re,y as E}from"./vendor-lit.js";import{c as ie,l as ae,o as oe,s as D}from"./vendor.js";import{r as O}from"./vendor-ui5.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),te(`vaadin-card`,g`
      :host(.mateu-section) {
        --vaadin-card-border-width: 0 !important;
        --vaadin-card-background: transparent !important;
        --vaadin-card-shadow: none !important;
        --vaadin-card-padding: 0 !important;
      }
    `);var se=document.createElement(`style`);se.innerHTML=`
${e.cssText}
${o.cssText}
${a.cssText}
${l.cssText}
${f}
${i}
`,document.body.appendChild(se);{let e=window.Vaadin;e&&((e.featureFlags??={}).masterDetailLayoutComponent=!0)}new class{constructor(){this.ui=void 0,this.loading=!1,this.config={},this.sharedData={},this.userData={},this.appData={},this.runtimeData={}}};var ce=new ae,k={value:{}},le={value:{}},ue=g`
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
`,de={lon:0,lat:0},fe=e=>{if(!e)return;let t=e.split(`,`).map(e=>e.trim());if(t.length!==2)return;let n=Number(t[0]),r=Number(t[1]);if(!(t[0]===``||t[1]===``||!Number.isFinite(n)||!Number.isFinite(r)))return{lon:r,lat:n}},pe=e=>{if(e==null||e.trim()===``)return 3;let t=Number(e);return Number.isFinite(t)?t:3};function A(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var me=class extends x{constructor(...e){super(...e),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){let e=++this.renderSeq,[{default:t},{default:n},{default:r},{default:i},{fromLonLat:a},{default:o}]=await Promise.all([O(()=>import(`./vendor-ol.js`).then(e=>e.i),__vite__mapDeps([0,1])),O(()=>import(`./vendor-ol.js`).then(e=>e.a),__vite__mapDeps([0,1])),O(()=>import(`./vendor-ol.js`).then(e=>e.r),__vite__mapDeps([0,1])),O(()=>import(`./vendor-ol.js`).then(e=>e.t),__vite__mapDeps([0,1])),O(()=>import(`./vendor-ol.js`).then(e=>e.o),__vite__mapDeps([0,1])),O(()=>import(`./vendor-ol.js`).then(e=>e.n),__vite__mapDeps([0,1]))]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector(`style[data-ol]`)){let e=document.createElement(`style`);e.setAttribute(`data-ol`,``),e.textContent=o,this.shadowRoot.appendChild(e)}this.map&&=(this.map.setTarget(void 0),void 0);let s=fe(this.position)??de;this.map=new t({target:this.mapElement,layers:[new r({source:new i})],view:new n({center:a([s.lon,s.lat]),zoom:pe(this.zoom)})})}render(){return E`<div id="map"></div>`}static{this.styles=g`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `}};A([b()],me.prototype,`position`,void 0),A([b()],me.prototype,`zoom`,void 0),A([S(`#map`)],me.prototype,`mapElement`,void 0),me=A([_(`mateu-map`)],me);var he=typeof HTMLElement<`u`?HTMLElement:class{},ge=class extends he{static get observedAttributes(){return[`content`]}#e;#t=0;get content(){return this.#e}set content(e){this.#e=e,this.#n()}attributeChangedCallback(e,t,n){this.content=n??void 0}connectedCallback(){this.style.display=`block`,this.#n()}async#n(){if(!this.isConnected)return;let e=this.#e??``,t=++this.#t,[{marked:n},{default:r}]=await Promise.all([O(()=>import(`./vendor.js`).then(e=>e.n),__vite__mapDeps([2,1])),O(()=>import(`./vendor.js`).then(e=>e.a),__vite__mapDeps([2,1]))]);t===this.#t&&(this.innerHTML=r.sanitize(await n.parse(e),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:e=>!0}}))}};typeof customElements<`u`&&!customElements.get(`mateu-markdown`)&&customElements.define(`mateu-markdown`,ge);var j=function(e){return e.ServerSide=`ServerSide`,e.ClientSide=`ClientSide`,e}({}),M=function(e){return e.Page=`Page`,e.Div=`Div`,e.Element=`Element`,e.MicroFrontend=`MicroFrontend`,e.Form=`Form`,e.Crud=`Crud`,e.Result=`Result`,e.Card=`Card`,e.Directory=`Directory`,e.Stepper=`Stepper`,e.HorizontalLayout=`HorizontalLayout`,e.VerticalLayout=`VerticalLayout`,e.SplitLayout=`SplitLayout`,e.MasterDetailLayout=`MasterDetailLayout`,e.TabLayout=`TabLayout`,e.AccordionLayout=`AccordionLayout`,e.FormLayout=`FormLayout`,e.FormRow=`FormRow`,e.FormItem=`FormItem`,e.BoardLayout=`BoardLayout`,e.BoardLayoutRow=`BoardLayoutRow`,e.BoardLayoutItem=`BoardLayoutItem`,e.Scroller=`Scroller`,e.FullWidth=`FullWidth`,e.Container=`Container`,e.FormField=`FormField`,e.Table=`Table`,e.App=`App`,e.Text=`Text`,e.Avatar=`Avatar`,e.Chat=`Chat`,e.AvatarGroup=`AvatarGroup`,e.Badge=`Badge`,e.Breadcrumbs=`Breadcrumbs`,e.Anchor=`Anchor`,e.Button=`Button`,e.Chart=`Chart`,e.Icon=`Icon`,e.ConfirmDialog=`ConfirmDialog`,e.ContextMenu=`ContextMenu`,e.CookieConsent=`CookieConsent`,e.Details=`Details`,e.Dialog=`Dialog`,e.Drawer=`Drawer`,e.Image=`Image`,e.Map=`Map`,e.Markdown=`Markdown`,e.Notification=`Notification`,e.ProgressBar=`ProgressBar`,e.Popover=`Popover`,e.CarouselLayout=`CarouselLayout`,e.Tooltip=`Tooltip`,e.MessageInput=`MessageInput`,e.MessageList=`MessageList`,e.CustomField=`CustomField`,e.MenuBar=`MenuBar`,e.Grid=`Grid`,e.GridColumn=`GridColumn`,e.GridGroupColumn=`GridGroupColumn`,e.VirtualList=`VirtualList`,e.FormSection=`FormSection`,e.FormSubSection=`FormSubSection`,e.Bpmn=`Bpmn`,e.Workflow=`Workflow`,e.FormEditor=`FormEditor`,e.MetricCard=`MetricCard`,e.Scoreboard=`Scoreboard`,e.DashboardPanel=`DashboardPanel`,e.DashboardLayout=`DashboardLayout`,e.FoldoutLayout=`FoldoutLayout`,e.ContentLayout=`ContentLayout`,e.HeroSection=`HeroSection`,e.EmptyState=`EmptyState`,e.Skeleton=`Skeleton`,e.Gantt=`Gantt`,e.PlanningBoard=`PlanningBoard`,e.Kanban=`Kanban`,e.Timeline=`Timeline`,e.ProgressSteps=`ProgressSteps`,e.Stat=`Stat`,e.Calendar=`Calendar`,e.PricingTable=`PricingTable`,e.OrgChart=`OrgChart`,e.Heatmap=`Heatmap`,e.Funnel=`Funnel`,e.TrendChart=`TrendChart`,e.FeatureGrid=`FeatureGrid`,e.Testimonials=`Testimonials`,e.Faq=`Faq`,e.CalloutCard=`CalloutCard`,e.CommentThread=`CommentThread`,e.FileList=`FileList`,e.Checklist=`Checklist`,e.ComparisonCard=`ComparisonCard`,e.EntityHeader=`EntityHeader`,e.Meter=`Meter`,e.TaskProgress=`TaskProgress`,e.StatusList=`StatusList`,e.BulletedList=`BulletedList`,e.Separator=`Separator`,e.Notice=`Notice`,e.TaskQueue=`TaskQueue`,e.ResourceGrid=`ResourceGrid`,e.OfferCard=`OfferCard`,e.AddOnPicker=`AddOnPicker`,e.Ledger=`Ledger`,e.PaymentPicker=`PaymentPicker`,e.ProcessMonitor=`ProcessMonitor`,e}({}),_e=`mateu-app-context`,ve=`mateu-app-context-labels`,ye=e=>{try{return JSON.parse(localStorage.getItem(e)??`{}`)}catch{return{}}},be=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},xe=()=>ye(_e),Se=()=>ye(ve),Ce=(e,t,n)=>{let r=xe(),i=Se();t==null||t===``?(delete r[e],delete i[e]):(r[e]=t,n!==void 0&&(i[e]=n)),be(_e,r),be(ve,i)},we=!1,Te=()=>{we||(we=!0,window.addEventListener(`storage`,e=>{e.key===_e&&e.newValue!==e.oldValue&&window.location.reload()}))},Ee,De=(e,t)=>new Promise((n,r)=>{let i=!1,a={retry:()=>{i||(i=!0,t().then(n,r))},giveUp:()=>{i||(i=!0,r(e))}};if(Ee){Ee(a);return}let o=new CustomEvent(`mateu-session-expired`,{detail:a,cancelable:!0,bubbles:!1});typeof document<`u`&&!document.dispatchEvent(o)||a.giveUp()}),Oe=(e,t)=>e.includes(`json`)?!0:typeof t==`object`&&!!t,ke=(e,t)=>{let n=e.finalUrl;if(!n)return;let r=t??(typeof window<`u`?window.location.href:void 0),i;try{i=new URL(e.requestedUrl,r).href}catch{return}if(i!==n&&!Oe(e.contentType??``,e.data))return n},Ae=new class{constructor(){this.windowMs=4e3,this.threshold=12,this.events=[],this.reported=new Set}check(e,t=Date.now()){this.events.push({sig:e,t});let n=t-this.windowMs;this.events=this.events.filter(e=>e.t>=n);let r=0;for(let t of this.events)t.sig===e&&r++;if(r>=this.threshold){let t=!this.reported.has(e);return this.reported.add(e),{blocked:!0,firstTrip:t}}return this.reported.delete(e),{blocked:!1,firstTrip:!1}}reset(){this.events=[],this.reported.clear()}configure(e){e.windowMs!==void 0&&(this.windowMs=e.windowMs),e.threshold!==void 0&&(this.threshold=e.threshold)}},je=[],Me=e=>{je=Array.isArray(e)?e:[]},Ne=e=>e?je.find(t=>t.name===e):void 0,Pe=e=>e==null||e===``,Fe=e=>{if(!e?.ref)return e;let t=Ne(e.ref);if(!t?.source)return console.warn(`mateu: no REST source named "${e.ref}" in the app's catalogue`),e;let n=t.source;return{...e,url:Pe(e.url)?n.url:e.url,method:Pe(e.method)?n.method:e.method,headers:e.headers&&Object.keys(e.headers).length>0?e.headers:n.headers,body:Pe(e.body)?n.body:e.body,itemsPath:Pe(e.itemsPath)?n.itemsPath:e.itemsPath,valuePath:Pe(e.valuePath)?n.valuePath:e.valuePath,labelPath:Pe(e.labelPath)?n.labelPath:e.labelPath,proxy:e.proxy||n.proxy}},Ie=(e,t)=>{let n=Ne(e?.ref)?.fields?.[t];return n&&n!==``?n:t},Le,Re=[],ze,Be=[],Ve=e=>e.split(`/`).filter(e=>e.startsWith(`:`)&&e.length>1).map(e=>e.substring(1)),He=e=>{let t=e=>e.replace(/^\/+/,``).replace(/\/+$/,``),n=t(e===`_no_route`?``:e),r=n===``?[]:n.split(`/`),i;for(let e of Be){let n=t(e.route??``),a=n===``?[]:n.split(`/`);if(a.length!==r.length)continue;let o={},s=!0;for(let e=0;e<a.length;e++){let t=a[e];if(t.startsWith(`:`)&&t.length>1)o[t.substring(1)]=r[e];else if(t!==r[e]){s=!1;break}}if(!s)continue;let c={entry:e,pathParams:o};(!i||Ve(n).length<Ve(t(i.entry.route??``)).length)&&(i=c)}return i},Ue=(e,t)=>{let n=He(e);if(!n)return t;let{entry:r,pathParams:i}=n,a=r.defaultParams??{},o=r.fixedParams??{};return!Object.keys(a).length&&!Object.keys(o).length&&!Object.keys(i).length?t:{...t,fragments:(t.fragments??[]).map(e=>({...e,state:{...a,...e.state??{},...i,...o},data:{...a,...e.data??{},...i,...o}}))}},We=e=>{let t=e&&e.startsWith(`/`)?e.substring(1):e??``;return t===``?`_no_route`:t};function Ge(e,t=fetch){return ze=(async()=>{try{let n=await t(e);if(!n.ok)return;let r=await n.json(),i=new Map,a=[];for(let e of r.entries??[])if(!(!e.ok||!e.json))try{let t=JSON.parse(e.json);e.routePattern?a.push({regex:new RegExp(e.routePattern),paramNames:e.paramNames??[],increment:t}):i.set(e.syncPath,t)}catch(t){console.warn(`mateu: bundle entry parse failed for`,e.syncPath,t)}Le=i,Re=a,Be=r.routes?.routes??[],Me(r.sources?.sources)}catch(e){console.warn(`mateu: bundle manifest load failed`,e)}})(),ze}var Ke=()=>ze??Promise.resolve(),qe=()=>Le!==void 0&&Le.size>0||Re.length>0,Je=e=>{let t=Le?.get(e);return t===void 0?void 0:Ue(e,t)},Ye=e=>{for(let t of Re){let n=t.regex.exec(e);if(!n)continue;let r={};return t.paramNames.forEach((e,t)=>{r[e]=n[t+1]}),Ue(e,{...t.increment,fragments:(t.increment.fragments??[]).map(e=>({...e,state:{...e.state??{},...r},data:{...e.data??{},...r}}))})}},Xe={offline:()=>`No connection. Your changes have not been sent — check your network and try again.`,timeout:()=>`The server is taking too long to answer. Your changes may not have been saved.`,server:e=>`The server could not complete the request${e?` (error ${e})`:``}. Please try again.`,unauthorized:()=>`Your session is no longer valid. Please sign in again.`,notFound:()=>`This is no longer available. It may have been moved or deleted.`,client:e=>`The request was rejected${e?` (error ${e})`:``}.`,cancelled:()=>``,unknown:()=>`Something went wrong. Please try again.`},Ze=new Set([`offline`,`timeout`,`server`]),Qe=(e,t={})=>{let n=e??{},r=n.response?.status,i=n.code,a=t.online??(typeof navigator<`u`&&typeof navigator.onLine==`boolean`?navigator.onLine:!0),o=e=>({kind:e,message:Xe[e](r),retryable:Ze.has(e),status:r});return i===`ERR_CANCELED`?o(`cancelled`):i===`ECONNABORTED`||i===`ETIMEDOUT`||/timeout/i.test(n.message??``)?o(`timeout`):r===void 0?!a||i===`ERR_NETWORK`||/network error/i.test(n.message??``)?o(`offline`):o(`unknown`):o(r===401||r===403?`unauthorized`:r===404||r===410?`notFound`:r===408||r===429?`timeout`:r>=500?`server`:r>=400?`client`:`unknown`)},$e=new Set([``,`__load__`,`search`,`_globalsearch`,`_notifications-list`]),et=[`_appcontext-search-`,`search-`],tt=(e,t)=>t===!0?!0:e==null?!1:$e.has(e)?!0:et.some(t=>e.startsWith(t)),nt=(e,t=Math.random)=>{let n=300*3**Math.max(0,e-1);return Math.round(n*(.75+t()*.5))},rt=(e,t,n)=>!n.idempotent||t>2||!e.retryable?!1:e.kind===`timeout`||e.kind===`server`,it=new class{constructor(){this.linkUp=!0,this.listeners=new Set,this.waiters=new Set,this.started=!1}start(){this.started||typeof window>`u`||(this.started=!0,this.linkUp=typeof navigator<`u`&&typeof navigator.onLine==`boolean`?navigator.onLine:!0,window.addEventListener(`online`,()=>{this.linkUp=!0,this.reachable=void 0,this.changed(),this.releaseWaiters()}),window.addEventListener(`offline`,()=>{this.linkUp=!1,this.changed()}))}isOnline(){return this.linkUp?this.reachable!==!1:!1}noteReachable(){let e=this.isOnline();this.reachable=!0,e||(this.changed(),this.releaseWaiters())}noteUnreachable(){let e=this.isOnline();this.reachable=!1,e&&this.changed()}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}whenBack(e){return this.isOnline()?(e(),()=>{}):(this.waiters.add(e),()=>this.waiters.delete(e))}reset(){this.linkUp=!0,this.reachable=void 0,this.waiters.clear()}changed(){let e=this.isOnline();this.listeners.forEach(t=>t(e))}releaseWaiters(){let e=Array.from(this.waiters);this.waiters.clear(),e.forEach(e=>e())}};it.start();var at=[],ot=6e4,st=e=>new Promise(t=>setTimeout(t,e)),ct=new class{constructor(){this.axiosInstance=ie.create({timeout:ot}),this.axiosInstance.interceptors.request.use(e=>(this.addAuthToken(e),this.addSessionId(e),e)),this.axiosInstance.interceptors.response.use(e=>{let t=ke({requestedUrl:this.axiosInstance.getUri(e.config),finalUrl:e.request?.responseURL,contentType:String(e.headers?.[`content-type`]??``),data:e.data});if(t)throw window.location.assign(t),Object.assign(Error(`session lost — redirecting to `+t),{code:`ERR_CANCELED`});return e},e=>{let t=e;if(t?.response?.status===401&&t.config&&!t.config.__mateuRetried){let n=t.config;return n.__mateuRetried=!0,De(e,()=>this.axiosInstance.request(n))}throw e})}addSessionId(e){let t=sessionStorage.getItem(`__mateu_sesion_id`);t||(t=D(),sessionStorage.setItem(`__mateu_sesion_id`,t)),e.headers[`X-Session-Id`]=t}addAuthToken(e){let t=localStorage.getItem(`__mateu_auth_token`);t&&(e.headers.Authorization=`Bearer `+t)}async wrap(e,t,n,r,i){return n||t.dispatchEvent(new CustomEvent(`backend-called-event`,{bubbles:!0,composed:!0,detail:{}})),e().then(e=>(t.dispatchEvent(new CustomEvent(`backend-succeeded-event`,{bubbles:!0,composed:!0,detail:{actionId:r}})),e)).catch(e=>{let n=Qe(e,{online:it.isOnline()});throw n.kind==`cancelled`?t.dispatchEvent(new CustomEvent(`backend-cancelled-event`,{bubbles:!0,composed:!0,detail:{actionId:r}})):(e&&typeof e==`object`&&(e.__mateuReported=!0),t.dispatchEvent(new CustomEvent(`backend-failed-event`,{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(e),failure:n,retry:i}}))),e})}async sendWithRetry(e,t){let n=0;for(;;)try{let t=await e();return it.noteReachable(),t}catch(e){let r=Qe(e,{online:it.isOnline()});if(r.kind==`offline`&&it.noteUnreachable(),n++,!rt(r,n,{idempotent:t}))throw e;await st(nt(n))}}serialize(e){return e?.message?e:JSON.stringify(e)}release(e){at=at.filter(t=>t!==e)}async get(e){let t=new AbortController;return at=[...at,t],this.axiosInstance.get(e,{signal:t.signal}).finally(()=>this.release(t))}async post(e,t,n){let r=new AbortController;return at=[...at,r],this.axiosInstance.post(e,t,{signal:r.signal,...n&&n>0?{timeout:n}:{}}).finally(()=>this.release(r))}async abortAll(){at.forEach(e=>e.abort()),at=[]}async runAction(e,t,n,r,i,a,o,s,c,l,u,d={}){if(t&&t.startsWith(`/`)&&(t=t.substring(1)),r===``&&(await Ke(),qe())){let e=Je(We(t))??Ye(We(t));if(e){let t={...e,fragments:(e.fragments??[]).map(e=>e.targetComponentId?e:{...e,targetComponentId:i})};return await this.wrap(()=>Promise.resolve(t),l,u,r,d.retry)}}let f=[e,t,n,o??``,r,i].join(``),p=Ae.check(f);if(p.blocked)return await this.abortAll(),p.firstTrip&&console.error(`[mateu] request loop detected — aborting repeated request`,f),{messages:p.firstTrip?[{title:``,text:`A repeating request was detected and stopped to protect the server. Reload the page or navigate elsewhere.`,position:`bottom-end`,variant:`error`,duration:6e3}]:[],commands:[],fragments:[],banners:[],appendBanners:!1,appData:void 0,appState:void 0};a={...xe(),...a};let m=e+`/mateu/v3/sync/`+(t&&t!=``?t:`_no_route`),h={serverSideType:o,appState:a,componentState:s,parameters:c,initiatorComponentId:i,consumedRoute:n,route:t&&t!=``?`/`+t:``,actionId:r,knownStructureHash:d.knownStructureHash},ee=tt(r,d.idempotent),te=()=>this.post(m,h,d.timeoutMillis).then(e=>e.data);return await this.wrap(()=>this.sendWithRetry(te,ee),l,u,r,d.retry)}},lt=function(e){return e.HAMBURGUER_MENU=`HAMBURGUER_MENU`,e.MENU_ON_LEFT=`MENU_ON_LEFT`,e.MENU_ON_TOP=`MENU_ON_TOP`,e.TABS=`TABS`,e.TILES=`TILES`,e.RAIL=`RAIL`,e.AUTO=`AUTO`,e.MEDIATOR=`MEDIATOR`,e}({}),ut=new Map,dt=[`position:absolute`,`width:1px`,`height:1px`,`margin:-1px`,`padding:0`,`overflow:hidden`,`clip:rect(0 0 0 0)`,`clip-path:inset(50%)`,`white-space:nowrap`,`border:0`].join(`;`),ft=e=>{if(typeof document>`u`||!document.body)return;let t=ut.get(e);return t?.isConnected?t:(t=document.createElement(`div`),t.setAttribute(`aria-live`,e),t.setAttribute(`aria-atomic`,`true`),t.setAttribute(`role`,e===`assertive`?`alert`:`status`),t.setAttribute(`data-mateu-live-region`,e),t.style.cssText=dt,document.body.appendChild(t),ut.set(e,t),t)},pt=()=>{if(!(typeof document>`u`)){if(!document.body){document.addEventListener(`DOMContentLoaded`,()=>pt(),{once:!0});return}ft(`polite`),ft(`assertive`)}},mt=(e,t={})=>{let n=(e??``).trim();if(!n)return;let r=ft(t.politeness??`polite`);if(r){if(r.textContent===n){r.textContent=``,setTimeout(()=>{r.textContent=n},60);return}r.textContent=n}},ht=class extends x{constructor(...e){super(...e),this.id=``,this.baseUrl=``,this.callbackToken=``,this.createElement=e=>{let t=e.data,n=document.createElement(t.name);for(let e in t.attributes)n.setAttribute(e,t.attributes[e]);for(let e in t.on)n.addEventListener(e,n=>{this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.on[e],parameters:{event:n}},bubbles:!0,composed:!0}))});return n},this.closeModal=()=>{let e=(this.shadowRoot??this).querySelectorAll(`mateu-dialog, mateu-drawer`);if(e&&e.length>0){e[e.length-1].close();return}this.dispatchEvent(new CustomEvent(`close-modal-requested`,{bubbles:!0,composed:!0}))},this.changeFavicon=e=>{let t=document.querySelector(`link[rel="icon"]`);t===null?(t=document.createElement(`link`),t.setAttribute(`rel`,`icon`),t.setAttribute(`href`,e),document.head.appendChild(t)):t.setAttribute(`href`,e)}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=ce.subscribe(e=>{if(e.command){let t=e.command;this.id==t.targetComponentId&&this.applyCommand(t)}if((!e.callbackToken||!this.callbackToken||e.callbackToken===this.callbackToken)&&e.fragment){let t=e.fragment;this.id==t.targetComponentId&&(this.applyFragment(t),this.completeMenu(t))}})}completeMenu(e){if(e.component&&e.component.type==j.ClientSide){let t=e.component,n=t.metadata;if(n?.type==M.App){let e=n,r=this.getRemoteMenus(e.menu);if(r.length>0){let n=r.map(e=>ct.runAction(e.baseUrl,e.route,`_empty`,``,e.baseUrl+`#`+e.route,void 0,void 0,void 0,e.params,this,!0));Promise.all(n).then(n=>{let r=this.updateMenu(e.menu,n.map(e=>e.fragments).filter(e=>e).map(e=>e).flat());t.metadata={...e,menu:r,variant:lt.MENU_ON_TOP},this.requestUpdate()})}}}}updateMenu(e,t){let n=[];return e.forEach(e=>{if(e.remote){let r=t.find(t=>t.targetComponentId==e.baseUrl+`#`+e.route);if(r&&r.component?.type==j.ClientSide){let t=r.component;if(t.metadata?.type==M.App){let r=t.metadata,i=e.serverSideType&&e.serverSideType!=``?e.serverSideType:r.serverSideType;this.changeBaseUrl(r.menu,e.baseUrl,i,e.route,r.route),n.push(...r.menu)}}}else n.push(e)}),n}changeBaseUrl(e,t,n,r,i){e.forEach(e=>{e.baseUrl||(e.submenus&&e.submenus.length>0?this.changeBaseUrl(e.submenus,t,n,r,i):(e.consumedRoute=i??``,e.baseUrl=t,e.serverSideType=n,e.uriPrefix=r))})}getRemoteMenus(e){let t=[];return e.forEach(e=>{e.remote&&t.push(e)}),t}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(e){if(e.type==`SetWindowTitle`&&(document.title=e.data,mt(document.title)),e.type==`SetFavicon`&&this.changeFavicon(e.data),e.type==`DispatchEvent`&&this.dispatchNamedEvent(e.data),e.type==`NavigateTo`){let t=e.data;t&&(t.startsWith(`http:`)||t.startsWith(`https:`)?window.open(e.data,`_blank`):window.location.href=e.data)}if(e.type==`PushStateToHistory`){let t=e.data;t!==void 0&&this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:t},bubbles:!0,composed:!0}))}if(e.type==`RunAction`){let t=e.data;if(t&&t.actionId)if(t.targetComponentId){let e={command:{type:`RunAction`,data:{actionId:t.actionId},targetComponentId:t.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:``};setTimeout(()=>ce.next(e))}else this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(e.type==`MarkAsDirty`&&this.dispatchEvent(new CustomEvent(`dirty`,{detail:{},bubbles:!0,composed:!0})),e.type==`MarkAsClean`&&this.dispatchEvent(new CustomEvent(`clean`,{detail:{},bubbles:!0,composed:!0})),e.type==`DownloadFile`){let t=e.data;if(t&&t.base64Content){let e=atob(t.base64Content),n=new Uint8Array(e.length);for(let t=0;t<e.length;t++)n[t]=e.charCodeAt(t);let r=new Blob([n],{type:t.mimeType}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t.filename??`export`,a.click(),URL.revokeObjectURL(i)}}if(e.type==`CloseModal`&&(this.closeModal(),this.dispatchNamedEvent(e.data)),e.type==`AddContentToHead`){let t=e.data;if(t&&t.name){if(t.attributes&&t.attributes.id&&document.getElementById(t.attributes.id))return;document.head.appendChild(this.createElement(e))}}if(e.type==`AddContentToBody`){let t=e.data;if(t&&t.name){if(t.attributes&&t.attributes.id&&document.getElementById(t.attributes.id))return;document.body.appendChild(this.createElement(e))}}}dispatchNamedEvent(e){if(e&&e.eventName){let t=this.component,n=t?.emitsName??t?.serverSideType,r=e.payload??e.detail;n&&r&&typeof r==`object`&&(r={...r,__source:n}),this.dispatchEvent(new CustomEvent(e.eventName,{detail:r,bubbles:!0,composed:!0}))}}};A([b()],ht.prototype,`id`,void 0),A([b()],ht.prototype,`baseUrl`,void 0);var gt=class extends ht{applyFragment(e){}manageActionRequestedEvent(e){}};A([b()],gt.prototype,`component`,void 0);var _t=(e,t)=>Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),vt=(e,t,n)=>({state:e??{},data:t??{},...n});function N(e,t,n,r){if(!e?.includes("${"))return e;try{return _t(e,vt(t,n,r))}catch(t){return console.warn(`Mateu: could not interpolate "${e}":`,t),e}}var yt=(e,t,n)=>{if(e&&e.indexOf("${")>=0)try{return _t(e,vt(t,n))}catch(e){return e.message}return e},bt=(e,t,n,r,i)=>{if(!e)return e;let a=vt(t,n,{appState:r??{},appData:i??{}}),o=e;try{if(o=_t(e,a),o.includes("${"))try{o=_t(o,a)}catch(a){o=`when evaluating nested `+e+` :`+a+`, where data is `+n+` and state is `+t+` and app state is `+r+` and app data is `+i,console.error(a,o,t,n,r,i)}}catch(a){o=`when evaluating `+e+` :`+a+`, where data is `+n+` and state is `+t+` and app state is `+r+` and app data is `+i,console.error(a,o,t,n,r,i)}return o},xt=(e,t,n,r,i,a)=>{let o=vt(t,n,{appState:r??{},appData:i??{},...a}),s=_t(e,o);return Function(...Object.keys(o),`return (${s})`)(...Object.values(o))},St=(e,t,n,r)=>{let i=vt(t,n,r);return Function(...Object.keys(i),`return (${e})`)(...Object.values(i))},Ct=(e,t,n,r)=>_t(e,vt(t,n,r)),wt=`display:inline-flex; align-items:center; justify-content:center; width:2rem; height:2rem; border-radius:50%; background:var(--lumo-contrast-10pct,#e0e0e0); color:var(--lumo-secondary-text-color,#555); font-size:.8rem; font-weight:600; overflow:hidden; flex:none;`,Tt=(e,t)=>t||(typeof e==`string`&&e?e.trim().split(/\s+/).map(e=>e[0]).slice(0,2).join(``).toUpperCase():``),Et=(e,t,n)=>{let r=e.metadata,i=Dt(r.name,t,n);return E`<span style="${wt}${e.style}" class="${e.cssClasses}"
                      title="${i||y}" slot="${e.slot??y}">
        ${r.image?E`<img src="${r.image}" alt="${i}" style="width:100%;height:100%;object-fit:cover;">`:Tt(i,r.abbreviation)}
    </span>`},Dt=(e,t,n)=>typeof e==`string`&&e.includes("${")?N(e,t,n):e,Ot=e=>{let t=e.metadata,n=t.avatars??[],r=t.maxItemsVisible&&t.maxItemsVisible>0?t.maxItemsVisible:n.length,i=n.slice(0,r),a=n.length-i.length,o=`margin-left:-0.4rem; border:2px solid var(--lumo-base-color,#fff);`;return E`<span style="display:inline-flex; ${e.style}" class="${e.cssClasses}" slot="${e.slot??y}">
        ${i.map(e=>E`<span style="${wt}${o}" title="${e.name||y}">
            ${e.img?E`<img src="${e.img}" style="width:100%;height:100%;object-fit:cover;">`:Tt(e.name??``,e.abbr)}
        </span>`)}
        ${a>0?E`<span style="${wt}${o}">+${a}</span>`:y}
    </span>`},kt=(e,t,n)=>{let r=e.metadata;return E`<span theme="badge ${r.color} ${r.pill?`pill`:``} ${r.small?`small`:``} ${r.primary?`primary`:``}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??y}">${Dt(r.text,t,n)}</span>`},At=(e,t,n)=>{let r=Dt(e.text,t,n);if(!r)return y;let i=Dt(e.color,t,n);return i==`SUCCESS`&&(i=`success`),i==`ERROR`&&(i=`error`),i==`DANGER`&&(i=`error`),i==`WARNING`&&(i=`warning`),i==`INFO`&&(i=`info`),i==`PRIMARY`&&(i=`primary`),i==`SECONDARY`&&(i=`secondary`),i==`TERTIARY`&&(i=`tertiary`),i==`QUATERNARY`&&(i=`quaternary`),i==`LIGHT`&&(i=`light`),i==`DARK`&&(i=`dark`),E`<span theme="badge ${i} ${e.pill?`pill`:``} ${e.small?`small`:``} ${e.primary?`primary`:``}">${r}</span>`},P=new class{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(e){if(this.componentRenderer=e,typeof window<`u`){let t=e.supportedClientSideTypes?.();window.__mateuRendererInfo={name:e.rendererName?.()??e.constructor?.name??`unknown`,supportedTypes:t?[...t].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(e){this.useShadowRoot=e}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(e){this.afterRenderHook=e}getAfterRenderHook(){return this.afterRenderHook}},jt=(e,t,n,r,i,a,o,s,c)=>(t.slot=s,F(e,t,n,r,i,a,o,c)),F=(e,t,n,r,i,a,o,s)=>{if(!t)return E``;if(t.type==j.ClientSide)return P.get().renderClientSideComponent(e,t,n,r,i,a,o,s);let c=e.route,l=e.consumedRoute;return E`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${l}"
                         baseUrl="${n}"
                         slot="${t.slot??y}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...r}}"
                         .data="${{...i}}"
                         .appState="${a}"
                         .appData="${o}"
        >
       </mateu-component>`},Mt=e=>{let t=[];return e.color&&e.color!==`normal`&&e.color!==`none`&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle===`tertiaryInline`?`tertiary-inline`:e.buttonStyle),e.size&&e.size!==`none`&&e.size!==`normal`&&t.push(e.size),t.length?t.join(` `):void 0},Nt=e=>{let t=Mt(e)??``,n=[];return t.includes(`primary`)&&n.push(`primary`),t.includes(`tertiary`)&&n.push(`tertiary`),(t.includes(`error`)||e.color===`error`)&&n.push(`danger`),n.join(` `)},Pt=e=>e===`back`||e===`backToList`||!!e&&e.startsWith(`cancel`),Ft=class extends x{constructor(...e){super(...e),this.appState={},this.appData={},this._overflowOpen=!1,this._overflowN=0,this._secCount=0,this._onDocClick=e=>{e.composedPath().includes(this)||(this._overflowOpen=!1)},this._resetOverflow=()=>{this._overflowN===0?this.requestUpdate():this._overflowN=0},this.handleButtonClick=e=>{this._overflowOpen=!1,this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>N(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+`.hidden`])return y;let t=this.evalLabel(e.label);return P.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId))||E`
        <button class="mtb ${Nt(e)}"
                data-action-id="${e.id}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${t}</button>
    `},this.renderActions=e=>{let t=e.filter(e=>!(this.data??{})[e.actionId+`.hidden`]),n=t.filter(e=>e.buttonStyle===`primary`),r=t.filter(e=>e.buttonStyle!==`primary`);this._secCount=r.length;let i=Math.max(0,Math.min(this._overflowN,r.length)),a=r.slice(0,r.length-i),o=r.slice(r.length-i);return E`
            <div class="actions-cluster">
                ${n.map(this.renderBtn)}
                ${a.map(this.renderBtn)}
                ${o.length?E`
                    <div class="overflow-wrap">
                        <button class="mtb overflow-btn" title="Más acciones" aria-haspopup="true"
                                aria-expanded="${this._overflowOpen}"
                                @click="${e=>{e.stopPropagation(),this._overflowOpen=!this._overflowOpen}}">⋯</button>
                        ${this._overflowOpen?E`
                            <div class="overflow-menu">
                                ${o.map(e=>E`
                                    <button class="overflow-item" ?disabled="${e.disabled}"
                                            data-action-id="${e.actionId}"
                                            @click="${()=>this.handleButtonClick(e.actionId)}">${this.evalLabel(e.label)}</button>
                                `)}
                            </div>
                        `:y}
                    </div>
                `:y}
            </div>
        `},this.renderPeerNav=e=>P.get()?.renderPeerNav?.(e)||E`
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
        `}connectedCallback(){super.connectedCallback(),document.addEventListener(`click`,this._onDocClick),this._ro=new ResizeObserver(()=>this._resetOverflow()),this._ro.observe(this),window.addEventListener(`resize`,this._resetOverflow)}disconnectedCallback(){document.removeEventListener(`click`,this._onDocClick),window.removeEventListener(`resize`,this._resetOverflow),this._ro?.disconnect(),this._ro=void 0,super.disconnectedCallback()}updated(e){if(e.has(`metadata`)||e.has(`data`)){this._resetOverflow();return}let t=this.renderRoot.querySelector(`.actions-cluster`);if(!t||this._secCount===0)return;let n=t.closest(`.form-header, .no-header-row`);if(!n)return;let r=t.getBoundingClientRect(),i=n.getBoundingClientRect();(r.top-i.top>8||r.right>i.right+1)&&this._overflowN<this._secCount&&(this._overflowN+=1)}render(){let e=this.metadata;if(!e)return E``;let t=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0,n=e.toolbar??[],r=n.filter(e=>Pt(e.actionId)),i=n.filter(e=>!Pt(e.actionId)),a=r.length>0&&i.length>0?E`<span class="toolbar-divider"></span>`:y,o=e.overline,s=e.title?void 0:e.titlePlaceholder,c=e.avatar||e.title||e.subtitle||o||s||e.kpis?.length>0||e.header?.length>0||n.length>0||!!t,l=e.level??0;return l>0?this.setAttribute(`data-nested`,``):this.removeAttribute(`data-nested`),E`
            ${e.breadcrumbs&&e.breadcrumbs.length>0?E`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="breadcrumbs-bar">
                    ${e.breadcrumbs.map((e,t)=>E`
                        ${t>0?E`<span>/</span>`:y}
                        ${e.link?E`<button class="breadcrumb-link" @click="${()=>window.location.href=`${e.link}`}">${e.text}</button>`:E`<span>${e.text}</span>`}
                    `)}
                </div>
            `:y}
            ${e.noHeader?E`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;" class="no-header-row">
                    ${e?.header?.map(e=>F(this,e,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${t?this.renderPeerNav(t):y}
                    ${r.map(this.renderBtn)}
                    ${a}
                    ${this.renderActions(i)}
                </div>
            `:c?E`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center; flex-wrap: wrap;" class="form-header">
                    ${e.avatar?F(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):y}
                    <div style="flex: 1; min-width: min(22rem, 100%); overflow: hidden;">
                        ${o?E`<div class="page-overline">${v(yt(o,this.state??{},this.data??{}))}</div>`:y}
                        ${(e?.title||s)&&l==0?E`
                            <div style="display: flex; align-items: center; gap: var(--lumo-space-s, .5rem); min-width: 0;">
                                <h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${e?.title?v(yt(e?.title,this.state??{},this.data??{})):E`<span class="page-title-placeholder">${v(yt(s,this.state??{},this.data??{}))}</span>`}</h2>
                                ${e.kpisBelow&&e.badges?.length?e.badges.map(e=>At(e,this.state??{},this.data??{})):y}
                            </div>`:y}
                        ${e?.title&&l==1?E`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${v(yt(e?.title,this.state??{},this.data??{}))}</h3>`:y}
                        ${e?.title&&l==2?E`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${v(yt(e?.title,this.state??{},this.data??{}))}</h4>`:y}
                        ${e?.title&&l==3?E`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${v(yt(e?.title,this.state??{},this.data??{}))}</h5>`:y}
                        ${e?.title&&l>3?E`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${v(yt(e?.title,this.state??{},this.data??{}))}</h6>`:y}

                        ${e?.subtitle?E`<span style="display: inline-block; margin-block-end: 0.83em;">${v(yt(e?.subtitle,this.state??{},this.data??{}))}</span>`:y}
                        ${e?.timestamp?E`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${v(yt(e.timestamp,this.state??{},this.data??{}))}</span>`:y}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e.kpisBelow?y:e?.kpis?.map(e=>E`
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div>${this.evalLabel(e.title)}</div>
                                <div>${v(yt(e.text,this.state??{},this.data??{}))}</div>
                            </div>
                        `)}
                        ${e?.header?.map(e=>F(this,e,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${t?this.renderPeerNav(t):y}
                        ${r.map(this.renderBtn)}
                        ${a}
                        ${this.renderActions(i)}
                    </div>
                </div>
            `:y}
            ${e.kpisBelow&&e?.kpis?.length?E`
                <div class="kpi-row">
                    ${e.kpis.map(e=>E`
                        <div class="kpi-pair">
                            <span class="kpi-label">${this.evalLabel(e.title)}</span>
                            <span class="kpi-value">${v(yt(e.text,this.state??{},this.data??{}))}</span>
                        </div>
                    `)}
                </div>
            `:y}
            ${e.badges&&e.badges.length>0&&!e.kpisBelow?E`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(e=>At(e,this.state??{},this.data??{}))}
                </div>
            `:y}
        `}static{this.styles=g`
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

        /* Redwood overline: the small line above the title — a category or parent context.
           Quieter and smaller than the title, with the same ellipsis discipline. */
        .page-overline {
            color: var(--lumo-secondary-text-color, #6b7280);
            font-size: var(--lumo-font-size-s, .875rem);
            line-height: 1.2;
            margin-block-end: .15rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Redwood pageTitlePlaceholder: stands in for a title that does not exist yet (create
           mode). Rendered inside the title heading so it keeps its size, but muted so it never
           reads as a real title. */
        .page-title-placeholder {
            color: var(--lumo-tertiary-text-color, #9ca3af);
            font-weight: inherit;
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

        /* The action cluster stays on one line and moves/wraps as a unit; updated() measures it
           against the header row to decide how many trailing secondaries overflow into the menu. */
        .actions-cluster {
            display: inline-flex;
            align-items: center;
            flex-wrap: nowrap;
            gap: var(--lumo-space-xs, .25rem);
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

        ${ue}
    `}};A([b()],Ft.prototype,`metadata`,void 0),A([b()],Ft.prototype,`baseUrl`,void 0),A([b()],Ft.prototype,`state`,void 0),A([b()],Ft.prototype,`data`,void 0),A([b()],Ft.prototype,`appState`,void 0),A([b()],Ft.prototype,`appData`,void 0),A([w()],Ft.prototype,`_overflowOpen`,void 0),A([w()],Ft.prototype,`_overflowN`,void 0),Ft=A([_(`mateu-content-header`)],Ft);var It=class extends gt{constructor(...e){super(...e),this.state={},this.data={},this.appState={},this.appData={}}render(){let e=this.component?.metadata;return E`
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
       `}static{this.styles=g`
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
    `}};A([b()],It.prototype,`state`,void 0),A([b()],It.prototype,`data`,void 0),A([b()],It.prototype,`appState`,void 0),A([b()],It.prototype,`appData`,void 0),It=A([_(`mateu-form`)],It);var Lt=class extends x{constructor(...e){super(...e),this.variant=`text`,this.count=3}static{this.styles=g`
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
    `}render(){let e=Array.from({length:Math.max(1,this.count)});return this.variant==`card`?E`${e.map(()=>E`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant==`grid`?E`${e.map(()=>E`<div class="bone row"></div>`)}`:this.variant==`form`?E`${e.map(()=>E`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:E`${e.map(()=>E`<div class="bone line"></div>`)}`}};A([b()],Lt.prototype,`variant`,void 0),A([b({type:Number})],Lt.prototype,`count`,void 0),Lt=A([_(`mateu-skeleton`)],Lt);var Rt=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t},bubbles:!0,composed:!0}))},zt=(e,t,n,r,i,a)=>E`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??`🗂`}</span>
            ${n?E`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${n}</span>`:y}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${r??e??`Nothing here yet.`}</span>
            ${i&&a?E`
                <button style="margin-top: .25rem; font: inherit; font-weight: 500; cursor: pointer; padding: .4rem .9rem; border: none; border-radius: var(--lumo-border-radius-m, 6px); background: transparent; color: var(--lumo-primary-text-color, #3b5bdb);"
                        @click="${e=>Rt(e,i)}">${a}</button>
            `:y}
        </div>
    `,Bt=e=>{let t=e.metadata;return E`
        <div style="${e.style??y}" class="${e.cssClasses??y}" slot="${e.slot??y}">
            ${zt(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},Vt=e=>{let t=e.metadata;return E`
        <mateu-skeleton
                variant="${t.variant??`text`}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-skeleton>
    `},I=(e,t,n,r)=>{if(!e)return E``;let i=P.get()?.renderIcon;if(i){let a=i.call(P.get(),e,t,n);return r?E`<span slot="${r}">${a}</span>`:a}return E`<span class="mateu-icon ${n??``}" data-icon="${e}" aria-hidden="true"
                      style="display:inline-block; width:1em; height:1em; ${t??``}" slot="${r??y}"></span>`},Ht=`mateu-saved-views`,Ut=()=>{try{return JSON.parse(localStorage.getItem(Ht)??`{}`)}catch{return{}}},Wt=e=>{try{localStorage.setItem(Ht,JSON.stringify(e))}catch{}},Gt=e=>Ut()[e]??[],Kt=(e,t)=>{let n=t.name?.trim();if(!n||Object.keys(t.values??{}).length===0)return;let r=Ut(),i=(r[e]??[]).filter(e=>e.name!==n);i.push({...t,name:n}),r[e]=i,Wt(r)},qt=(e,t)=>{let n=Ut(),r=(n[e]??[]).filter(e=>e.name!==t);r.length===0?delete n[e]:n[e]=r,Wt(n)},Jt=(e,t)=>{let n=Ut();n[e]=(n[e]??[]).map(e=>({...e,isDefault:e.name===t&&!e.isDefault})),Wt(n)},Yt=e=>Gt(e).find(e=>e.isDefault),L=class extends x{constructor(...e){super(...e),this.baseUrl=``,this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.viewsOpened=!1,this.draftText=``,this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{let e=this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId]),t={searchText:void 0};e.forEach(e=>{t[e]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent(`filter-reset-requested`,{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return this.metadata?.filters??[]}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent(`search-requested`,{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){let t=this.filters.find(t=>t.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e===`searchText`?``:void 0),this.requestSearch()}commitText(e){this.emitValueChanged(`searchText`,e.value),this.draftText=``,e.value=``,this.requestSearch()}get viewsScope(){return window.location.pathname}allFilterKeys(){return[`searchText`,...this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])]}snapshotValues(){let e={};return this.state.searchText&&(e.searchText=this.state.searchText),this.filters.forEach(t=>{if(this.isSet(t))if(this.isRangeFilter(t)){let n=this.rangeBound(t,`from`),r=this.rangeBound(t,`to`);n&&(e[`${t.fieldId}_from`]=n),r&&(e[`${t.fieldId}_to`]=r)}else this.isMultiFilter(t)?e[t.fieldId]=this.multiValues(t):e[t.fieldId]=this.state[t.fieldId]}),e}applyView(e){let t=this.allFilterKeys(),n={};t.forEach(e=>{n[e]=void 0}),this.state={...this.state,...n},this.dispatchEvent(new CustomEvent(`filter-reset-requested`,{detail:{fieldIds:t},bubbles:!0,composed:!0})),Object.entries(e.values).forEach(([e,t])=>this.emitValueChanged(e,t)),this.viewsOpened=!1,this.detachOutsideClick(),this.requestSearch()}saveCurrentView(e){let t=e.value.trim();t&&(Kt(this.viewsScope,{name:t,values:this.snapshotValues()}),e.value=``,this.requestUpdate())}firstUpdated(){if(window.location.search)return;let e=Yt(this.viewsScope);e&&setTimeout(()=>{this.state.searchText||this.filters.some(e=>this.isSet(e))||this.applyView(e)},0)}isBooleanFilter(e){return e.dataType===`boolean`||e.dataType===`bool`||e.stereotype===`checkbox`||e.stereotype===`toggle`}isNumericFilter(e){return[`integer`,`decimal`,`number`,`money`].includes(e.dataType??``)}isRangeFilter(e){return e.stereotype===`dateRange`||e.stereotype===`numberRange`}isMultiFilter(e){return e.stereotype===`multiSelect`}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){let t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t==`string`&&t!==``?t.split(`,`).map(e=>e.trim()).filter(e=>e):[]}rangeBound(e,t){let n=this.state[`${e.fieldId}_${t}`];return n==null?``:String(n)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,`from`)!==``||this.rangeBound(e,`to`)!==``;if(this.isMultiFilter(e))return this.multiValues(e).length>0;let t=this.state[e.fieldId];return t!=null&&t!==``&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){let n=e.options.find(e=>e.value===String(t));if(n)return n.label??n.value}return typeof t==`boolean`?t?`Yes`:`No`:String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){let t=this.rangeBound(e,`from`),n=this.rangeBound(e,`to`);return t&&n?`${t} – ${n}`:t?`≥ ${t}`:`≤ ${n}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(`, `):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return N(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,n=`panel-row`){return E`
            <div class="${n}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){let t=e.stereotype===`numberRange`?`number`:e.dataType===`dateTime`?`datetime-local`:e.dataType===`time`?`time`:`date`,n=t=>{let n=t.closest(`.panel-input-row`),r=n.querySelector(`input.range-from`).value,i=n.querySelector(`input.range-to`).value;this.emitValueChanged(`${e.fieldId}_from`,r===``?void 0:r),this.emitValueChanged(`${e.fieldId}_to`,i===``?void 0:i),this.requestSearch()},r=e=>{e.key===`Enter`&&n(e.target),e.key===`Escape`&&this.closePanel()};return E`
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
            </div>`}renderMultiWidget(e){let t=this.multiValues(e),n=n=>{let r=t.includes(n)?t.filter(e=>e!==n):[...t,n];this.emitValueChanged(e.fieldId,r.length>0?r:void 0),this.dispatchEvent(new CustomEvent(`search-requested`,{detail:{},bubbles:!0,composed:!0}))};return E`${(e.options??[]).map(e=>this.panelRow(E`
            <span class="multi-check ${t.includes(e.value)?`multi-check--on`:``}"
                  aria-hidden="true">${t.includes(e.value)?`✓`:``}</span>
            ${e.label??e.value}
        `,()=>n(e.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return E`${e.options.map(t=>this.panelRow(t.label??t.value,()=>this.applyFilter(e.fieldId,t.value)))}`;if(this.isBooleanFilter(e))return E`
                ${this.panelRow(`Yes`,()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow(`No`,()=>this.applyFilter(e.fieldId,!1))}`;let t=this.isNumericFilter(e),n=n=>{n.value!==``&&this.applyFilter(e.fieldId,t?Number(n.value):n.value)};return E`
            <div class="panel-input-row">
                <input type="${t?`number`:`text`}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${e=>e.stopPropagation()}"
                       @keydown="${e=>{e.key===`Enter`&&n(e.target),e.key===`Escape`&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${e=>n(e.target.previousElementSibling)}">Apply</button>
            </div>`}renderViewsPanel(){if(!this.viewsOpened)return y;let e=Gt(this.viewsScope),t=!!this.state.searchText||this.filters.some(e=>this.isSet(e));return E`
            <div class="panel views-panel">
                <div class="panel-caption">Saved views</div>
                ${e.length===0?E`
                    <div class="panel-row views-empty">No saved views yet</div>`:y}
                ${e.map(e=>E`
                    <div class="panel-row view-row" @mousedown="${this.keepFocus}">
                        <span class="view-name" @click="${()=>this.applyView(e)}">${e.name}</span>
                        <button class="view-star ${e.isDefault?`view-star--on`:``}"
                                title="${e.isDefault?`Unset as default`:`Open this listing with this view`}"
                                @click="${()=>{Jt(this.viewsScope,e.name),this.requestUpdate()}}">★</button>
                        <button class="chip-remove" aria-label="Delete view ${e.name}"
                                @click="${()=>{qt(this.viewsScope,e.name),this.requestUpdate()}}">✕</button>
                    </div>`)}
                ${t?E`
                    <div class="panel-input-row" @mousedown="${e=>e.stopPropagation()}">
                        <input class="view-name-input" type="text" placeholder="Save current view as…"
                               @keydown="${e=>{e.key===`Enter`&&this.saveCurrentView(e.target),e.key===`Escape`&&(this.viewsOpened=!1)}}"/>
                        <button class="apply-button"
                                @click="${e=>this.saveCurrentView(e.target.previousElementSibling)}">Save</button>
                    </div>`:E`
                    <div class="panel-row views-empty">Apply some filters to save a view</div>`}
            </div>`}renderPanel(){if(!this.panelOpened||this.filters.length===0)return y;if(this.activeFilter){let e=this.activeFilter;return E`
                <div class="panel">
                    <div class="panel-row panel-header"
                         @mousedown="${this.keepFocus}"
                         @click="${()=>{this.activeFilter=void 0}}">
                        <span aria-hidden="true">←</span> ${this.labelOf(e)}
                    </div>
                    ${this.renderActiveFilterWidget(e)}
                </div>`}let e=!!this.state.searchText||this.filters.some(e=>this.isSet(e));return E`
            <div class="panel">
                <div class="panel-caption">Filter by</div>
                ${this.filters.map(e=>this.panelRow(E`
                    ${this.labelOf(e)}
                    ${this.isSet(e)?E`<span class="current-value">${this.conditionDisplay(e)}</span>`:y}
                `,()=>{this.activeFilter=e}))}
                ${e?this.panelRow(`Clear filters`,this.clearAllFilters,`panel-row panel-footer`):y}
            </div>`}render(){let e=[];return this.state.searchText&&e.push({fieldId:`searchText`,label:`Text`,display:String(this.state.searchText)}),this.filters.forEach(t=>{this.isSet(t)&&e.push({fieldId:t.fieldId,label:this.labelOf(t),display:this.conditionDisplay(t)})}),E`
            <div class="smart-search">
                <div class="bar"
                     @click="${e=>{e.currentTarget.querySelector(`input.free-text`)?.focus(),this.openPanel()}}">
                    <svg aria-hidden="true" class="magnifier" width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
                    </svg>
                    ${e.map(e=>E`
                        <span theme="badge contrast pill" class="chip">
                            <span class="chip-label">${e.label}:</span> ${e.display}
                            <button class="chip-remove" aria-label="Remove filter ${e.label}"
                                    @mousedown="${this.keepFocus}"
                                    @click="${t=>{t.stopPropagation(),this.removeChip(e.fieldId)}}">✕</button>
                        </span>`)}
                    ${this.metadata?.searchable===!1?y:E`
                        <input class="free-text" type="text" id="searchText"
                               placeholder="${e.length===0?`Search`:``}"
                               autofocus="${this.metadata?.autoFocusOnSearchText?!0:y}"
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
        `}static{this.styles=g`
        ${ue}
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
    `}};A([b()],L.prototype,`metadata`,void 0),A([b()],L.prototype,`baseUrl`,void 0),A([w()],L.prototype,`state`,void 0),A([w()],L.prototype,`data`,void 0),A([b()],L.prototype,`appState`,void 0),A([b()],L.prototype,`appData`,void 0),A([b({type:Boolean})],L.prototype,`searchOnly`,void 0),A([w()],L.prototype,`panelOpened`,void 0),A([w()],L.prototype,`viewsOpened`,void 0),A([w()],L.prototype,`activeFilter`,void 0),A([w()],L.prototype,`draftText`,void 0),L=A([_(`mateu-filter-bar`)],L);var Xt=`mateu-column-prefs`,Zt=()=>{try{let e=JSON.parse(localStorage.getItem(Xt)??`{}`);return e&&typeof e==`object`&&!Array.isArray(e)?e:{}}catch{return{}}},Qt=e=>{try{localStorage.setItem(Xt,JSON.stringify(e))}catch{}},$t=e=>{if(!e||typeof e!=`object`)return;let t=e=>Array.isArray(e)?e.filter(e=>typeof e==`string`):[];return{hidden:t(e.hidden),order:t(e.order)}},en=e=>$t(Zt()[e]),tn=(e,t)=>{let n=Zt(),r=$t(t);r.hidden.length===0&&r.order.length===0?delete n[e]:n[e]=r,Qt(n)},nn=e=>{let t=Zt();delete t[e],Qt(t)},rn=e=>e?!!e.identifier||e.dataType===`action`||e.dataType===`actionGroup`||e.dataType===`menu`||e.id===`select`||e.id===`menu`:!1,an=(e,t,n=e=>e)=>{let r=$t(t);if(!r||r.hidden.length===0&&r.order.length===0)return e;let i=e=>n(e)?.id??e.id,a=new Set(r.hidden),o=e.filter(e=>{let t=i(e);return!t||!a.has(t)||rn(n(e))});if(r.order.length===0)return o.length===e.length?e:o;let s=new Map;o.forEach(e=>{let t=i(e);t&&!s.has(t)&&s.set(t,e)});let c=[],l=new Set;return r.order.forEach(e=>{let t=s.get(e);t&&!l.has(t)&&(c.push(t),l.add(t))}),o.forEach(e=>{l.has(e)||(c.push(e),l.add(e))}),c.length===e.length&&c.every((t,n)=>t===e[n])?e:c},on=class extends x{constructor(...e){super(...e),this.columns=[],this.scope=``,this.panelOpened=!1,this.revision=0,this.togglePanel=()=>{if(this.panelOpened){this.closePanel();return}this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick)},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1},this.reset=()=>{nn(this.scope),this.revision++,this.dispatchEvent(new CustomEvent(`column-prefs-changed`,{bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}get prefs(){return en(this.scope)??{hidden:[],order:[]}}effectiveEntries(e){return an(this.columns,{hidden:[],order:e.order})}commit(e){tn(this.scope,e),this.revision++,this.dispatchEvent(new CustomEvent(`column-prefs-changed`,{bubbles:!0,composed:!0}))}toggleVisibility(e){let t=this.prefs,n=t.hidden.includes(e)?t.hidden.filter(t=>t!==e):[...t.hidden,e];this.commit({...t,hidden:n})}move(e,t){let n=this.prefs,r=[...this.effectiveEntries(n)],i=r.findIndex(t=>t.id===e);if(i<0)return;let a=i+t;for(;a>=0&&a<r.length&&r[a].protected;)a+=t;if(a<0||a>=r.length)return;let o=r[i];r[i]=r[a],r[a]=o,this.commit({...n,order:r.map(e=>e.id)})}render(){this.revision;let e=this.prefs,t=this.effectiveEntries(e).filter(e=>!e.protected);if(t.length===0)return E``;let n=e.hidden.length>0||e.order.length>0;return E`
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
                ${this.panelOpened?E`
                    <div class="panel" role="menu">
                        <div class="panel-title">Columns</div>
                        ${t.map((n,r)=>{let i=e.hidden.includes(n.id);return E`
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
                `:y}
            </div>
        `}static{this.styles=g`
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
    `}};A([b()],on.prototype,`columns`,void 0),A([b()],on.prototype,`scope`,void 0),A([w()],on.prototype,`panelOpened`,void 0),A([w()],on.prototype,`revision`,void 0),on=A([_(`mateu-column-chooser`)],on);var sn;async function cn(e){if(!sn)return{};try{return await sn(e)??{}}catch(e){return console.warn(`mateu: external auth provider failed`,e),{}}}function ln(e,t){return t?t.split(`.`).reduce((e,t)=>typeof e==`object`&&e?e[t]:void 0,e):e}function un(e,t,n=`value`,r=`label`){let i=ln(e,t);return Array.isArray(i)?i.map(e=>{if(typeof e==`object`&&e){let t=ln(e,n),i=ln(e,r);return{value:t??i,label:String(i??t??``)}}return{value:e,label:String(e)}}):[]}function dn(e,t,n,r=e=>e){let i=ln(e,t);return Array.isArray(i)?i.map(e=>{let t={};for(let i of n)t[i]=ln(e,r(i));return t}):[]}async function fn(e,t=e=>e,n=fetch){let r=Fe(e);if(!r.url)throw Error(`External REST fetch has no url${e.ref?` (unknown source "${e.ref}")`:``}`);let i=t(r.url)??r.url,a=(r.method||`GET`).toUpperCase(),o={};for(let[e,n]of Object.entries(r.headers??{}))o[e]=t(n)??n;Object.assign(o,await cn({url:i,method:a}));let s={method:a,headers:o};a!==`GET`&&a!==`HEAD`&&r.body&&(s.body=t(r.body)??r.body);let c=await n(i,s);if(!c.ok)throw Error(`External REST fetch failed: ${c.status}`);return c.json()}async function pn(e,t=e=>e,n=fetch){let r=await fn(e,t,n),i=Fe(e);return un(r,i.itemsPath,i.valuePath,i.labelPath)}async function mn(e,t,n=e=>e,r=fetch){return dn(await fn(e,n,r),Fe(e).itemsPath,t,t=>Ie(e,t))}var hn=e=>{let t=Number(e);return Number.isFinite(t)&&t>0?Math.floor(t):0},gn=(e,t,n)=>{let r=hn(e),i=hn(t),a=hn(n);if(i===0)return{totalPages:void 0,currentPage:a,multiPage:a>0,isFirst:a===0,isLast:!0};let o=Math.max(1,Math.ceil(r/i)),s=Math.min(a,o-1);return{totalPages:o,currentPage:s,multiPage:o>1,isFirst:s===0,isLast:s>=o-1}},_n=class extends x{constructor(...e){super(...e),this.totalElements=0,this.pageSize=100,this.pageNumber=0}dispatch(e){this.dispatchEvent(new CustomEvent(`page-changed`,{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return y;let{totalPages:e,currentPage:t,multiPage:n,isFirst:r,isLast:i}=gn(this.totalElements,this.pageSize,this.pageNumber);return E`
            <div class="bar">
                ${n?E`
                    <button class="nav" title="First page" ?disabled="${r}"
                        @click="${()=>this.dispatch(0)}" data-testid="page-first">«</button>
                    <button class="nav" title="Previous page" ?disabled="${r}"
                        @click="${()=>this.dispatch(t-1)}" data-testid="page-prev">‹</button>
                    <span class="page-indicator">Page ${t+1}${e==null?y:E` of ${e}`}</span>
                    <button class="nav" title="Next page" ?disabled="${i}"
                        @click="${()=>this.dispatch(t+1)}" data-testid="page-next">›</button>
                    <button class="nav" title="Last page" ?disabled="${i||e==null}"
                        @click="${()=>this.dispatch(e-1)}" data-testid="page-last">»</button>
                    <span class="separator"></span>
                `:y}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?``:`s`}</span>
                <slot></slot>
            </div>
        `}static{this.styles=g`
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
    `}};A([b()],_n.prototype,`totalElements`,void 0),A([b()],_n.prototype,`pageSize`,void 0),A([b()],_n.prototype,`pageNumber`,void 0),_n=A([_(`mateu-pagination`)],_n);var vn=`var(--lumo-space-m, 1rem)`,yn=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.columnWidth||`13rem`,l=`display: grid; grid-template-columns: ${s.maxColumns&&s.maxColumns>0?`repeat(${s.maxColumns}, minmax(0, 1fr))`:`repeat(auto-fill, minmax(min(100%, ${c}), 1fr))`}; gap: ${vn} var(--lumo-space-l, 1.5rem); align-items: start;`;return s.labelsAside&&(l+=` --mateu-label-width: 10rem;`),s.fullWidth&&(l+=` width: 100%;`),l+=t.style??``,E`
        <div id="${t.id??y}" style="${l}" class="${t.cssClasses}" slot="${t.slot||y}">
            ${t.children?.map(t=>bn(s,e,t,n,r,i,a,o))}
        </div>
    `},bn=(e,t,n,r,i,a,o,s)=>n.type==j.ClientSide&&n.metadata?.type==M.FormRow?Cn(e,t,n,r,i,a,o,s):E`<div style="grid-column: span ${xn(n)}; min-width: 0;">${e.labelsAside?Sn(t,n,r,i,a,o,s):F(t,n,r,i,a,o,s)}</div>`,xn=e=>{if(e.type==j.ClientSide){let t=e.metadata;if(t?.type==M.FormField)return t.colspan||1}return 1},Sn=(e,t,n,r,i,a,o)=>{if(t.type==j.ClientSide&&t.metadata?.type==M.FormField&&t.metadata.label){let s=t.metadata;return E`
            <div style="display: flex; gap: ${vn}; align-items: baseline;">
                <label style="flex: 0 0 var(--mateu-label-width, 10rem); color: var(--lumo-secondary-text-color, #667);">${s.label?.includes("${")?e._evalTemplate(s.label):s.label}</label>
                <div style="flex: 1; min-width: 0;">${F(e,t,n,r,i,a,o,!0)}</div>
            </div>
        `}return F(e,t,n,r,i,a,o)},Cn=(e,t,n,r,i,a,o,s)=>E`
        <div style="grid-column: 1 / -1; display: flex; gap: ${vn}; flex-wrap: wrap;">
            ${n.children?.map(c=>E`<div style="flex: 1 1 ${100/Math.max(1,n.children.length)}%; min-width: min(100%, 13rem);">${bn(e,t,c,r,i,a,o,s)}</div>`)}
        </div>
    `,wn=(e,t,n,r,i,a,o,s)=>{let c=n.metadata,l=`display: flex; flex-direction: ${e};`;c.spacing&&(l+=` gap: ${vn};`),c.padding&&(l+=` padding: var(--lumo-space-m, 1rem);`),c.wrap&&(l+=` flex-wrap: wrap;`),c.fullWidth&&(l+=` width: 100%;`),c.justification&&(l+=` justify-content: ${c.justification};`);let u=e===`row`?c.verticalAlignment:c.horizontalAlignment;return u&&(l+=` align-items: ${u};`),l+=n.style??``,E`
        <div id="${n.id??y}" style="${l}" class="${n.cssClasses}" slot="${n.slot??y}">
            ${n.children?.map(e=>F(t,e,r,i,a,o,s))}
        </div>
    `},Tn=(e,t,n,r,i,a,o)=>wn(`row`,e,t,n,r,i,a,o),En=(e,t,n,r,i,a,o)=>wn(`column`,e,t,n,r,i,a,o),Dn=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=`display: flex; flex-direction: ${s.orientation===`vertical`?`column`:`row`}; gap: var(--lumo-space-s, 0.5rem);`;return s.fullWidth&&(c+=` width: 100%;`),c+=t.style??``,E`
        <div id="${t.id??y}" style="${c}" class="${t.cssClasses}" slot="${t.slot??y}">
            <div style="flex: 1; min-width: 0; min-height: 0;">${F(e,t.children[0],n,r,i,a,o)}</div>
            <div style="flex: 1; min-width: 0; min-height: 0;">${F(e,t.children[1],n,r,i,a,o)}</div>
        </div>
    `},On=(e,t,n,r,i,a,o)=>{let s=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,l=!!i?.hasDetail||!!s,u=c??s;return E`
        <div id="${t.id??y}" style="display: flex; gap: var(--lumo-space-m, 1rem); ${t.style??``}" class="${t.cssClasses}" slot="${t.slot??y}">
            <div style="flex: 1; min-width: 0;">${F(e,t.children[0],n,r,i,a,o)}</div>
            ${l&&u?E`<div style="flex: 1; min-width: 0;">${F(e,u,n,r,i,a,o)}</div>`:E`<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem);">Select an item to view details</div>`}
        </div>
    `},kn=(e,t,n,r,i,a,o)=>{let s=t.style??``;t.metadata.fullWidth&&(s+=` width: 100%;`);let c=Math.max(0,(t.children??[]).findIndex(e=>e.metadata.active));return E`
        <div id="${t.id??y}" style="${s}" class="${t.cssClasses}" slot="${t.slot??y}">
            ${t.children?.map((t,s)=>{let l=t,u=l.metadata.label,d=u?.includes("${")?e._evalTemplate(u):u;return E`
                    <details ?open="${s===c}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));">
                        <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600;">${d}</summary>
                        <div style="padding: var(--lumo-space-m, 1rem) 0;">
                            ${l.children?.map(t=>F(e,t,n,r,i,a,o))}
                        </div>
                    </details>
                `})}
        </div>
    `},An=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style??``;return s.fullWidth&&(c+=` width: 100%;`),E`
        <div style="${c}" class="${t.cssClasses}" slot="${t.slot??y}">
            ${t.children?.map(t=>jn(e,t,n,r,i,a,o,s.variant))}
        </div>
    `},jn=(e,t,n,r,i,a,o,s)=>{let c=t.metadata,l=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return E`
        <details ?open="${c.active}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); ${t.style??``}" class="${t.cssClasses}">
            <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600; ${c.disabled?`pointer-events: none; opacity: .5;`:``}">${l}</summary>
            <div style="padding: var(--lumo-space-s, .5rem) 0;">
                ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
            </div>
        </details>
    `},Mn=(e,t,n,r,i,a,o)=>E`
        <div style="overflow: auto; ${t.style??``}" class="${t.cssClasses}" slot="${t.slot??y}">
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </div>
    `,Nn=(e,t,n,r,i,a,o)=>E`
        <div style="width: 100%; ${t.style}" class="${t.cssClasses}" slot="${t.slot??y}">
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </div>
    `,Pn=(e,t,n,r,i,a,o)=>E`
        <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" class="${t.cssClasses}" slot="${t.slot??y}">
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </div>
    `,Fn=(e,t,n,r,i,a,o)=>E`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: ${vn}; ${t.style}" class="${t.cssClasses}" slot="${t.slot??y}">
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </div>
    `,In=(e,t,n,r,i,a,o)=>E`
        <div style="display: flex; gap: ${vn}; flex-wrap: wrap; ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </div>
    `,Ln=(e,t,n,r,i,a,o)=>E`
        <div style="flex: ${t.metadata.boardCols??1} 1 0; min-width: min(100%, 12rem); ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </div>
    `,Rn=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`
        <div
                style="display: flex; flex-direction: column; overflow: auto; ${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??y}"
        >
            ${s.page.content.map(t=>F(e,t,n,r,i,a,o))}
        </div>
    `},zn=e=>{let t=e.metadata;return(t?.content??t?.columns??[]).filter(e=>e&&e.metadata).map(e=>{let t=e.metadata;return{id:e.id??``,label:t?.label??e.id??``,autoWidth:t?.autoWidth,width:t?.width}})},Bn=(e,t)=>{let n=e?.[t];return n==null?``:typeof n==`object`?n.text??n.label??n.value??``:String(n)},Vn=(e,t,n)=>{let r=zn(e);return E`
        <div style="overflow:auto; width:100%; ${e.style}" class="${e.cssClasses}" slot="${e.slot??y}">
            <table style="border-collapse:collapse; width:100%; font-size: var(--lumo-font-size-s,.875rem);">
                <thead><tr>${r.map(e=>E`<th style="${`text-align:left; padding:.45rem .6rem; border-bottom:2px solid var(--lumo-contrast-20pct,rgba(0,0,0,.2)); font-weight:600; white-space:nowrap; color: var(--lumo-secondary-text-color,#556);`}">${e.label}</th>`)}</tr></thead>
                <tbody>
                    ${(t??[]).length===0?E`<tr><td colspan="${Math.max(1,r.length)}" style="padding:1.5rem; text-align:center; color: var(--lumo-secondary-text-color,#888);">${n??`No data.`}</td></tr>`:t.map(e=>E`<tr>${r.map(t=>E`<td style="${`padding:.4rem .6rem; border-bottom:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.08)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:24rem;`}" title="${Bn(e,t.id)}">${Bn(e,t.id)}</td>`)}</tr>`)}
                </tbody>
            </table>
        </div>
    `},Hn=(e,t)=>{let n=e.metadata;return e.id&&t&&t[e.id]?t[e.id]:n?.page?.content??[]},Un=e=>{let t=e.metadata.items??[];return E`
        <div class="mateu-message-list ${e.cssClasses??``}"
             style="display:flex; flex-direction:column; gap:.75rem; ${e.style??``}"
             slot="${e.slot??y}">
            ${t.map(e=>E`
                <div style="display:flex; gap:.6rem; align-items:flex-start;">
                    <span style="flex:0 0 auto; width:2rem; height:2rem; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:.8rem; background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);">
                        ${e.userImg?E`<img src="${e.userImg}" alt="" style="width:100%; height:100%; object-fit:cover;">`:e.userAbbr??(e.userName?e.userName.charAt(0):`?`)}
                    </span>
                    <div style="min-width:0;">
                        <div style="display:flex; gap:.5rem; align-items:baseline;">
                            ${e.userName?E`<span style="font-weight:600;">${e.userName}</span>`:y}
                            ${e.time?E`<span style="font-size:var(--lumo-font-size-xs,.75rem); color:var(--lumo-secondary-text-color,#666);">${e.time}</span>`:y}
                        </div>
                        <div style="white-space:pre-wrap; overflow-wrap:anywhere;">${e.text}</div>
                    </div>
                </div>
            `)}
        </div>
    `},Wn=(e,t,n,r,i,a,o)=>t.separator?E`<span style="align-self: stretch; width: 1px; background: var(--lumo-contrast-20pct, rgba(0,0,0,.2));"></span>`:t.submenus?E`
            <details style="position: relative;">
                <summary style="cursor: pointer; list-style: none; padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);">
                    ${t.component?F(e,t.component,n,r,i,a,o):t.label} ▾
                </summary>
                <div style="display: flex; flex-direction: column; gap: .1rem; padding: .3rem; min-width: 10rem;
                            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px);
                            background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15));">
                    ${t.submenus.map(t=>Wn(e,t,n,r,i,a,o))}
                </div>
            </details>
        `:E`
        <span class="${t.className??``}"
              style="cursor: ${t.disabled?`default`:`pointer`}; opacity: ${t.disabled?.5:1};
                     padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
                     ${t.selected?`background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));`:``}">
            ${t.component?F(e,t.component,n,r,i,a,o):t.label}
        </span>
    `,Gn=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`
        <div style="display: flex; flex-wrap: wrap; gap: .25rem; align-items: center; ${t.style}"
             class="${t.cssClasses}" slot="${t.slot??y}">
            ${s.options?.map(t=>Wn(e,t,n,r,i,a??{},o??{}))}
        </div>
    `},Kn=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`
        <div style="${t.style}" class="${t.cssClasses}" slot="${t.slot??y}">
            ${F(e,s.wrapped,n,r,i,a,o)}
        </div>
    `},qn=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.content?.metadata,l=c?.type==M.Notice&&c.fullWidth===!0;return E`
        <div style="display:flex; flex-direction:column; ${l?`width: 100%; `:``}${t.style}"
             class="${t.cssClasses}"
             slot="${t.slot??y}"
             data-colspan="${s.colspan||(l?99:y)}"
        >
            ${s.label?E`<label style="font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${s.label}</label>`:y}
            ${F(e,s.content,n,r,i,a,o)}
        </div>
            `},Jn=e=>{let t=e.metadata,n=e=>{let n=e.closest(`.mateu-message-input`)?.querySelector(`input`),r=n?.value??``;!t.actionId||!r.trim()||(e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:{message:r}},bubbles:!0,composed:!0})),n&&(n.value=``))};return E`
        <div class="mateu-message-input ${e.cssClasses??``}"
             style="display:flex; gap:.5rem; align-items:center; ${e.style??``}"
             slot="${e.slot??y}">
            <input type="text"
                   style="flex:1; min-width:0; font:inherit; padding:.5rem .75rem; border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16)); border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513);"
                   @keydown="${e=>{e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),n(e.currentTarget))}}">
            <button style="font:inherit; font-weight:500; cursor:pointer; padding:.5rem 1rem; border:none; border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);"
                    @click="${e=>n(e.currentTarget)}">Send</button>
        </div>
    `},Yn=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`<span title="${s.text}" style="${t.style}" class="${t.cssClasses}" slot="${t.slot??y}"
        >${F(e,s.wrapped,n,r,i,a,o)}</span>`},Xn=e=>{if(e instanceof CustomEvent)return e.detail;let t={};for(let n in e){let r=e[n];[`number`,`string`,`boolean`].indexOf(typeof r)>=0&&(t[n]=e[n])}return t},Zn=(e,t,n,r,i)=>{let a={appState:r??{},appData:i??{}},o={};for(let r in e.attributes)o[r]=N(e.attributes[r],t,n,a);return{attributes:o,content:N(e.content,t,n,a)}},Qn=(e,t,n,r)=>{for(let t in r.attributes)e.setAttribute(t,r.attributes[t]);n.style&&e.setAttribute(`style`,n.style),n.cssClasses&&e.setAttribute(`class`,n.cssClasses),n.slot&&e.setAttribute(`slot`,n.slot),r.content&&(t.html?e.innerHTML=r.content:e.append(r.content))},$n=e=>{let t=e.name,n=e.attributes?e.attributes.import:void 0;n&&t.includes(`-`)&&!customElements.get(t)&&O(()=>import(n),[])},er=(e,t,n,r,i,a,o)=>{$n(t);let s=Zn(t,r,i,a,o),c=t.name;s.attributes.id&&(c=`#`+s.attributes.id);let l=n.id?`.element-container[data-element-id="${n.id}"]`:`.element-container`;return setTimeout(()=>{let r=e.shadowRoot?.querySelector(l),i=r?.querySelector(c);if(i){for(;i.firstChild;)i.removeChild(i.lastChild);Qn(i,t,n,s)}else{let i=document.createElement(t.name);Qn(i,t,n,s);for(let n in t.on)i.addEventListener(n,r=>{let i=Xn(r);e.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.on[n],parameters:{event:i}},bubbles:!0,composed:!0}))});r?.appendChild(i)}}),E`<div class="element-container" data-element-id="${C(n.id)}"></div>`},tr=function(e){return e.div=`div`,e.p=`p`,e.h1=`h1`,e.h2=`h2`,e.h3=`h3`,e.h4=`h4`,e.h5=`h5`,e.h6=`h6`,e.span=`span`,e}({}),nr=(e,t,n,r,i)=>{let a=e.metadata,o=a.attributes?.[`data-colspan`],s=bt(a.text,t,n,r,i),c={xl:`var(--lumo-font-size-xl, 1.375rem)`,l:`var(--lumo-font-size-l, 1.125rem)`,s:`var(--lumo-font-size-s, .875rem)`,xs:`var(--lumo-font-size-xs, .8125rem)`},l=(a.size&&c[a.size]?`font-size: ${c[a.size]}; `:``)+(a.noMargins?`margin-block-start: 0; margin-block-end: 0; `:``);return tr.h1==a.container?E`
            <h1 style="${l}${e.style}" class="${e.cssClasses}"
                id="${C(e.id)}"
                data-colspan="${C(o)}"
                slot="${e.slot??y}">
                ${s??y}
            </h1>
        `:tr.h2==a.container?E`
            <h2 style="${l}${e.style}" class="${e.cssClasses}"
                id="${C(e.id)}"
                data-colspan="${C(o)}"
                slot="${e.slot??y}">
                ${s??y}
            </h2>
        `:tr.h3==a.container?E`
            <h3 style="${l}${e.style}" class="${e.cssClasses}"
                id="${C(e.id)}"
                data-colspan="${C(o)}"
                slot="${e.slot??y}">
                ${s??y}
            </h3>
        `:tr.h4==a.container?E`
            <h4 style="${l}${e.style}" class="${e.cssClasses}"
                id="${C(e.id)}"
                data-colspan="${C(o)}"
                slot="${e.slot??y}">
                ${s??y}
            </h4>
        `:tr.h5==a.container?E`
            <h5 style="${l}${e.style}" class="${e.cssClasses}"
                id="${C(e.id)}"
                data-colspan="${C(o)}"
                slot="${e.slot??y}">
                ${s??y}
            </h5>
        `:tr.h6==a.container?E`
            <h6 style="${l}${e.style}" class="${e.cssClasses}"
                id="${C(e.id)}"
                data-colspan="${C(o)}"
                slot="${e.slot??y}">
                ${s??y}
            </h6>
        `:tr.p==a.container?E`
               <p style="${l}${e.style}" class="${e.cssClasses}"
                  id="${C(e.id)}"
                  data-colspan="${C(o)}"
                  slot="${e.slot??y}">
                   ${s??y}
               </p>
            `:tr.div==a.container?E`
               <div style="${l}${e.style}" class="${e.cssClasses}"
                    id="${C(e.id)}"
                    data-colspan="${C(o)}"
                    slot="${e.slot??y}">${s?v(s):y}</div>
            `:tr.span==a.container?E`
               <span style="${l}${e.style}" class="${e.cssClasses}"
                     id="${C(e.id)}"
                     data-colspan="${C(o)}"
                    slot="${e.slot??y}">${s??y}</span>
            `:E`
               <p
                       id="${C(e.id)}"
                       data-colspan="${C(o)}"
                       slot="${e.slot??y}">
                   Unknown text container: ${a.container} 
               </p>
            `},rr=e=>{let t=e.metadata;return E`<a href="${t.url}" target="${t.target??y}"
                   rel="${t.target===`_blank`?`noopener`:y}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??y}">${t.text}</a>`},ir=(e,t)=>{let n=e.toLowerCase().split(`+`);return t.ctrlKey===n.includes(`ctrl`)&&t.altKey===n.includes(`alt`)&&t.shiftKey===n.includes(`shift`)&&t.metaKey===n.includes(`meta`)},ar=(e,t)=>{if(!ir(e,t))return!1;let n=e.toLowerCase().split(`+`),r=n[n.length-1];return!!(t.key.toLowerCase()===r||/^[a-z]$/.test(r)&&t.code===`Key`+r.toUpperCase()||/^[0-9]$/.test(r)&&(t.code===`Digit`+r||t.code===`Numpad`+r))},or=e=>e?e.split(`+`).map(e=>e.length<=1?e.toUpperCase():e.charAt(0).toUpperCase()+e.slice(1)).join(`+`):void 0,sr=(e,t)=>{let n=e.currentTarget.dataset.actionId;e.currentTarget?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:n,parameters:t.parameters},bubbles:!0,composed:!0}))},cr=`display:inline-flex; align-items:center; justify-content:center; gap:.4em; box-sizing:border-box; font:inherit; font-weight:500; cursor:pointer; border-radius:var(--lumo-border-radius-m,6px); border:1px solid transparent; line-height:1; white-space:nowrap;`,lr=e=>{let t=e.buttonStyle??``,n=e.color&&e.color!==`none`&&e.color!==`normal`?e.color:``,r=e.size,i=n===`success`?`var(--lumo-success-color,#1a7f37)`:n===`error`?`var(--lumo-error-color,#c5221f)`:n===`contrast`?`var(--lumo-contrast,#161513)`:`var(--lumo-primary-color,#3b5bdb)`,a=n===`success`?`var(--lumo-success-contrast-color,#fff)`:n===`error`?`var(--lumo-error-contrast-color,#fff)`:n===`contrast`?`var(--lumo-base-color,#fff)`:`var(--lumo-primary-contrast-color,#fff)`,o=n===`success`?`var(--lumo-success-text-color,#1a7f37)`:n===`error`?`var(--lumo-error-text-color,#c5221f)`:n===`contrast`?`var(--lumo-body-text-color,#161513)`:`var(--lumo-primary-text-color,#3b5bdb)`,s;return s=t===`primary`?`background:${i}; color:${a};`:t===`tertiary`||t===`tertiaryInline`?`background:transparent; color:${o};`:`background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:${o}; border-color:var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,`${cr}${s}${r===`small`?`padding:.25rem .6rem; font-size:var(--lumo-font-size-s,.875rem);`:r===`large`?`padding:.65rem 1.4rem; font-size:var(--lumo-font-size-l,1.125rem);`:`padding:.45rem 1rem; font-size:var(--lumo-font-size-m,1rem);`}`},ur=(e,t,n)=>{let r=e.metadata,i=N(r.label,t,n);return E`<button
            id="${e.id}"
            data-action-id="${r.actionId}"
            @click="${e=>sr(e,r)}"
            style="${lr(r)}${e.style}"
            class="${e.cssClasses}"
            ?disabled="${r.disabled}"
            title="${r.shortcut?`${i} (${or(r.shortcut)})`:y}"
            slot="${e.slot??y}"
    >${r.iconOnLeft?I(r.iconOnLeft):y}${i}${r.iconOnRight?I(r.iconOnRight):y}</button>`},dr=`display:block; box-sizing:border-box; background:var(--lumo-base-color,#fff); border:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.1)); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-xs,0 1px 3px rgba(0,0,0,.08)); overflow:hidden;`,fr=(e,t,n,r,i,a,o)=>{let s=t.metadata;if(!s)return E``;let c=t=>t?F(e,t,n,r,i,a,o,!1):y,l=s.header||s.headerPrefix||s.headerSuffix||s.title||s.subtitle;return E`
        <div id="${t.id??y}" style="${dr}${t.style}" class="${t.cssClasses}" slot="${t.slot??y}">
            ${s.media?c(s.media):y}
            ${l?E`<div style="display:flex; align-items:flex-start; gap:.75rem; padding:1rem 1.25rem ${s.content||s.footer?`0`:`1rem`};">
                ${s.headerPrefix?c(s.headerPrefix):y}
                <div style="flex:1; min-width:0;">
                    ${s.header?c(s.header):y}
                    ${s.title?E`<div style="font-weight:600; font-size:1.05rem; color:var(--lumo-body-text-color,#161513);">${c(s.title)}</div>`:y}
                    ${s.subtitle?E`<div style="color:var(--lumo-secondary-text-color,#667);">${c(s.subtitle)}</div>`:y}
                </div>
                ${s.headerSuffix?c(s.headerSuffix):y}
            </div>`:y}
            ${s.content?E`<div style="padding:1rem 1.25rem;">${c(s.content)}</div>`:y}
            ${s.footer?E`<div style="padding:0 1.25rem 1rem;">${c(s.footer)}</div>`:y}
        </div>
    `},pr=e=>{let t=e.metadata;return E`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??y}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},mr=e=>{let t=e.metadata;return I(t.icon,e.style,e.cssClasses,e.slot)},hr=(e,t)=>{e&&e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t},bubbles:!0,composed:!0}))},gr=`font:inherit; font-weight:500; cursor:pointer; padding:.45rem 1rem; border-radius:var(--lumo-border-radius-m,6px);`,_r=`${gr} background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:var(--lumo-body-text-color,#161513); border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,vr=`${gr} background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff); border:1px solid transparent;`,yr=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=!1;if(s.openedCondition)try{c=xt(s.openedCondition,r,i,a,o)}catch(e){console.error(`when evaluating `+s.openedCondition+` :`+e+`, where data is `+i+` and state is `+r)}return c?E`
        <div class="mateu-confirm-dialog ${t.cssClasses??``}"
             style="position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.4); ${t.style??``}"
             slot="${t.slot??y}">
            <div style="background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-l,0 8px 24px rgba(0,0,0,.2)); width:100%; max-width:min(90vw,32rem); padding:1.5rem; box-sizing:border-box;">
                ${s.header?E`<h3 style="margin:0 0 .75rem; font-size:1.15rem;">${s.header}</h3>`:y}
                <div>${t.children?.map(t=>F(e,t,n,r,i,a,o))}</div>
                <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:1.25rem;">
                    ${s.canCancel?E`<button style="${_r}" @click="${e=>hr(e.currentTarget,s.cancelActionId)}">${s.rejectText&&!s.canReject?s.rejectText:`Cancel`}</button>`:y}
                    ${s.canReject?E`<button style="${_r}" @click="${e=>hr(e.currentTarget,s.rejectActionId)}">${s.rejectText||`No`}</button>`:y}
                    <button style="${vr}" @click="${e=>hr(e.currentTarget,s.confirmActionId)}">${s.confirmText||`OK`}</button>
                </div>
            </div>
        </div>
    `:E``},br=e=>{let t=e.metadata,n;return t.position&&(n={Top:`top`,Bottom:`bottom`,TopLeft:`top-left`,TopRight:`top-right`,BottomLeft:`bottom-left`,BottomRight:`bottom-right`}[t.position]),E`
        <mateu-cookie-consent style="${e.style}" class="${e.cssClasses}"
                               slot="${e.slot??y}"
                               position="${n??y}"
                               cookie-name="${t.cookieName??y}"
                               .message="${t.message??y}"
                               theme="${t.theme??y}"
                               .learnMore="${t.learnMore??y}"
                               .learnMoreLink="${t.learnMoreLink??y}"
                               .dismiss="${t.dismiss??y}"
        ></mateu-cookie-consent>
    `},xr=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`
        <details
                ?open="${s.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??y}"
        >
            <summary>${F(e,s.summary,n,r,i,a,o)}</summary>
            ${F(e,s.content,n,r,i,a,o)}
        </details>
            `},Sr=(e,t,n,r,i,a)=>E`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${n}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${a}"
        ></mateu-dialog>
            `,Cr=(e,t,n,r,i,a)=>E`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${n}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${a}"
        ></mateu-drawer>
            `,wr=e=>{let t=e.metadata;return E`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"  
                  route="${t.route}" 
                  consumedRoute="${t.consumedRoute}" 
                  id="${D()}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??y}"
        ></mateu-ux>
        </mateu-api-caller>
            `},Tr=e=>E`
        <mateu-markdown .content=${e.metadata.markdown}
                        style="display:block; max-width: 72ch; ${e.style??``}" class="${e.cssClasses}"
                        slot="${e.slot??y}"></mateu-markdown>
            `,Er=e=>{let t=e.metadata;return E`
        <div
            role="status"
            slot="${e.slot??y}"
            class="${e.cssClasses}"
            style="display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem;
                   border-radius: var(--lumo-border-radius-m, 8px);
                   background: var(--lumo-contrast-5pct, rgba(0,0,0,0.05));
                   color: var(--lumo-body-text-color, #1a1a1a); ${e.style}"
        >
            ${t.title?E`<strong>${t.title}</strong>`:y}
            ${t.text?E`<span>${t.text}</span>`:y}
        </div>
    `},Dr=(e,t={})=>{let n=e.metadata,r=n.valueKey?t[n.valueKey]:n.value,i=n.max&&n.max!=0?n.max:1,a=!n.indeterminate&&r!=null;return E`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??y}">
            <progress
                    style="width:100%;"
                    max="${i}"
                    .value="${a?r:y}"
            ></progress>
            ${n.text?E`<span class="text-secondary text-xs" id="sublbl">
    ${n.text}
  </span>`:y}
        </div>
    `},Or=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`
        <details style="position: relative; ${t.style}" class="${t.cssClasses}" slot="${t.slot??y}">
            <summary style="list-style: none; cursor: pointer;">${F(e,s.wrapped,n,r,i,a,o)}</summary>
            <div style="position: absolute; z-index: 100; min-width: 300px; margin-top: .25rem; padding: .6rem .8rem;
                        border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px);
                        background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.2));">
                ${F(e,s.content,n,r,i,a,o)}
            </div>
        </details>
    `},kr=e=>{let t=e.metadata;return E`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??y}"></mateu-map>
            `},Ar=e=>E`
        <img src="${e.metadata.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??y}">
            `,jr=e=>{let t=e.metadata;return E`<div style="display:flex; align-items:center; gap:0.5rem;" slot="${e.slot??y}">
        ${t.breadcrumbs.map(e=>E`
            <a href="${e.link}">${e.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </div>`},Mr=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${s.dots}" 
                ?nav = "${s.nav}" 
                ?loop = "${s.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(t=>E`<div>${F(e,t,n,r,i,a,o)}</div>`)}
        </skeleton-carousel>
    `},Nr=(e,t,n,r)=>{let i=e.metadata;return E`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??y}">
            ${i.menu.map(e=>Pr(e))}
        </div>
            `},Pr=e=>E`
        ${e.submenus?E`
                <details open>
                    <summary>${e.label}</summary>
                    <div style="display:flex; flex-direction:column; gap:0.25rem; padding-left:0.5rem;">
                        ${e.submenus.map(e=>Pr(e))}
                    </div>
                </details>
            `:E`
                <a href="${e.path}">${e.label}</a>
        `}
        `,Fr=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`<div
                slot="${t.slot??y}"
                style="${t.style}" class="${t.cssClasses}"
        >${s.content?v(s.content):y}${t.children?.map(t=>F(e,t,n,r,i,a,o))}</div>
    `},Ir=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.title?.includes("${")?e._evalTemplate(s.title):s.title;return E`<div
                id="${t.id??y}"
                slot="${t.slot??y}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?E`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${c}</div>`:y}
        ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
    </div>
    `},Lr=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.title?.includes("${")?e._evalTemplate(s.title):s.title;return E`
        <div
                slot="${t.slot??y}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(t=>F(e,t,n,r,i,a,o))}</div>
    `},Rr=(e,t,n)=>{n.dispatchEvent(new CustomEvent(`value-changed`,{detail:{fieldId:e,value:t},bubbles:!0,composed:!0}))},zr=e=>t=>{let n=t.target,r=n.type===`checkbox`?n.checked:n.value;Rr(e.fieldId,r,n)},Br=(e,t)=>{let n=e.metadata,r=t?.[n.fieldId]??``,i=n,a=i.dataType,o=i.stereotype,s=!!i.readOnly,c=!!i.disabled,l=i.options,u=n.label?E`<label style="display:block; font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${n.label}</label>`:y,d=`width:100%; box-sizing:border-box; padding:.4rem .6rem; border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.3)); border-radius: var(--lumo-border-radius-m,6px); font:inherit; background: var(--lumo-base-color,#fff); color: var(--lumo-body-text-color,#1a1a1a);`,f;return f=s||o===`plainText`?E`<div style="padding:.4rem 0;">${String(r??``)}</div>`:a===`boolean`||o===`checkbox`||o===`badge`?E`<input type="checkbox" ?checked="${!!r}" ?disabled="${c}" @change="${zr(n)}">`:l&&l.length?E`
            <select style="${d}" ?disabled="${c}" @change="${zr(n)}">
                <option value="">—</option>
                ${l.map(e=>E`<option value="${e.value}" ?selected="${e.value===r}">${e.label}</option>`)}
            </select>`:o===`textarea`||o===`richText`||o===`html`?E`<textarea style="${d}" rows="3" ?disabled="${c}" @input="${zr(n)}">${String(r??``)}</textarea>`:E`<input type="${a===`integer`||a===`number`||a===`double`||a===`money`?`number`:a===`date`?`date`:a===`datetime`?`datetime-local`:a===`time`?`time`:o===`password`?`password`:a===`email`?`email`:`text`}" style="${d}" .value="${String(r??``)}"
                              placeholder="${i.placeholder??y}" ?disabled="${c}" @input="${zr(n)}">`,E`
        <div id="${e.id??y}" style="${e.style}" class="${e.cssClasses}" slot="${e.slot??y}">
            ${u}
            ${f}
        </div>
    `},Vr=e=>{let t=e.metadata;if((t?.level??0)>0)return e;let n=e=>{if(e?.metadata?.type===M.EntityHeader)return e;let t=e?.metadata?.content,r=[...e?.children??[],...Array.isArray(t)?t:t?[t]:[]];for(let e of r){let t=n(e);if(t)return t}},r;for(let t of e.children??[])if(r=n(t),r)break;if(!r)return e;let i=r.metadata;r.__hoistedToPageHeader=!0;let a=[...(i.facts??[]).filter(e=>e.label||e.value).map(e=>({title:e.label??``,text:e.value??``})),...i.metricLabel?[{title:i.metricLabel,text:i.metricValue??``}]:[]],o=(i.badges??[]).filter(e=>e.label).map(e=>({text:e.label,color:e.color})),s={...t,title:i.title||t.title,subtitle:i.subtitle??t.subtitle,kpis:[...t.kpis??[],...a],kpisBelow:!0,badges:[...t.badges??[],...o]};return{...e,metadata:s}},Hr=(e,t,n,r,i,a,o,s)=>{let c=Vr(t),l=c.metadata,u=l?.fabs??[];return E`<mateu-page
            .component="${c}"
            baseUrl="${n}"
            .state="${r}"
            .data="${i}"
            .appState="${a}"
            .appdata="${o}"
            slot="${c.slot??y}"
            style="${c.style}"
            class="${c.cssClasses}"
            ?standalone="${s??!1}"
    >
        ${c.children?.map(t=>F(e,t,n,r,i,a,o))}
        ${l?.buttons?.map(t=>E`
                   ${F(e,{id:t.actionId,metadata:t,type:j.ClientSide,slot:`buttons`},void 0,r,i,a,o)}
`)}
        ${u.map((t,n)=>E`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+n*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))}"
                title="${t.label}">
                ${I(t.icon)}
            </button>
        `)}
</mateu-page>
    `},Ur=(e,t,n,r,i,a,o,s)=>E`<mateu-table-crud
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
            slot="${t.slot??y}"
            ?standalone="${s??!1}"
    >
        ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
    </mateu-table-crud>`,Wr=e=>{let t=e.metadata;return E`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??y}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},Gr=(e,t,n)=>E`<mateu-chat sseUrl="${e.metadata.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??y}"></mateu-chat>`,Kr=e=>{let t=e.metadata;return E`
        <mateu-workflow
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
                value="${t.value??`{"name":"New Workflow","steps":[]}`}"
        ></mateu-workflow>
    `},qr=e=>{let t=e.metadata;return E`
        <mateu-form-editor
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
                value="${t.value??`{"name":"New Form","fields":[]}`}"
        ></mateu-form-editor>
    `},Jr=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,Yr=e=>e==`up`?`var(--lumo-success-text-color, #1a7f37)`:e==`down`?`var(--lumo-error-text-color, #c5221f)`:`var(--lumo-secondary-text-color, #666)`,Xr=e=>e==`up`?`▲`:e==`down`?`▼`:``,Zr=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},Qr=e=>{let t=e.metadata,n=!!t.actionId;return E`
        <div class="mateu-metric-card ${e.cssClasses??``}"
             style="${Jr} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${n?`cursor: pointer;`:``} ${e.style??``}"
             slot="${e.slot??y}"
             role="${n?`button`:y}"
             @click="${e=>Zr(e,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?I(t.icon,`color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;`):y}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?E`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:y}
            </div>
            ${t.trend||t.trendLabel?E`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${Yr(t.trend)};">
                    ${Xr(t.trend)} ${t.trendLabel??y}
                </span>
            `:y}
            ${t.description?E`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:y}
        </div>
    `},$r=(e,t,n,r,i,a,o)=>E`
        <div class="mateu-scoreboard ${t.cssClasses??``}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??``}"
             slot="${t.slot??y}"
        >
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </div>
    `,ei=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.colSpan&&s.colSpan>1?`grid-column: span ${s.colSpan};`:``,l=s.rowSpan&&s.rowSpan>1?`grid-row: span ${s.rowSpan};`:``,u=t.children??[];return u.length===1&&u[0].metadata?.type===`MetricCard`?E`
            <div style="min-width: 0; ${c} ${l} ${t.style??``}" slot="${t.slot??y}">
                ${F(e,u[0],n,r,i,a,o)}
            </div>`:E`
        <div class="mateu-dashboard-panel ${t.cssClasses??``}"
             style="${Jr} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${l} ${t.style??``}"
             slot="${t.slot??y}"
        >
            ${s.title?E`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${s.title}</h3>
                    ${s.subtitle?E`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${s.subtitle}</span>`:y}
                </div>
            `:y}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
            </div>
        </div>
    `},ti=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.columns&&s.columns>0?`repeat(${s.columns}, minmax(0, 1fr))`:`repeat(auto-fit, minmax(20rem, 1fr))`;return E`
        <div class="mateu-dashboard ${t.cssClasses??``}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??``}"
             slot="${t.slot??y}"
        >
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </div>
    `},ni=class extends x{constructor(...e){super(...e),this.panels=[],this.headerTitle=``,this.badges=[],this.orientation=`vertical`,this.navigation=null,this.overviewEditActionId=``,this.openPanels=new Set,this.expandedPanel=null,this._onPopState=()=>{let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(e.startsWith(`expand=`)){let t=e.slice(7),n=this.panels.findIndex((e,n)=>this.panelAnchor(e,n)===t);this.expandedPanel=n>=0?n:null}else this.expandedPanel=null},this.initialized=!1}navAction(e){e&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),window.addEventListener(`popstate`,this._onPopState)}disconnectedCallback(){window.removeEventListener(`popstate`,this._onPopState),super.disconnectedCallback()}willUpdate(){if(!this.initialized&&this.panels.length){this.openPanels=new Set(this.panels.map((e,t)=>e.open?t:-1).filter(e=>e>=0));let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(e.startsWith(`expand=`)){let t=e.slice(7),n=this.panels.findIndex((e,n)=>this.panelAnchor(e,n)===t);n>=0&&(this.expandedPanel=n)}else if(e){let t=this.panels.findIndex((t,n)=>this.panelAnchor(t,n)===e);t>=0&&this.openPanels.add(t)}this.initialized=!0}}firstUpdated(){let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(!e)return;let t=this.renderRoot.querySelector(`[data-anchor="${CSS.escape(e)}"]`);t&&t.scrollIntoView({block:`nearest`})}panelAnchor(e,t){return(e.title??``).toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)||`panel-${t}`}bookmarkPanel(e){let t=this.panelAnchor(this.panels[e],e);try{history.replaceState(history.state,``,`#`+t)}catch{}}clearBookmark(e){let t=this.panelAnchor(this.panels[e],e);if(decodeURIComponent((location.hash||``).replace(/^#/,``))===t)try{history.replaceState(history.state,``,location.pathname+location.search)}catch{}}expandPanel(e,t){t?.stopPropagation(),this.expandedPanel=e;let n=this.panelAnchor(this.panels[e],e);try{history.pushState(history.state,``,`#expand=`+n)}catch{}}collapsePanel(){try{history.back()}catch{this.expandedPanel=null}}toggle(e){let t=new Set(this.openPanels);t.has(e)?(t.delete(e),this.clearBookmark(e)):(t.add(e),this.bookmarkPanel(e)),this.openPanels=t}static{this.styles=g`
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
    `}render(){if(this.expandedPanel!=null&&this.panels[this.expandedPanel]){let e=this.panels[this.expandedPanel];return E`
                <div class="expanded-view" part="expanded-view">
                    <div class="expanded-header">
                        <button class="nav-parent" title="Back"
                                @click="${()=>this.collapsePanel()}">
                            <span>‹</span><span>Back</span>
                        </button>
                        <span class="nav-title">${e.title}</span>
                        ${e.subtitle?E`<span class="subtitle">${e.subtitle}</span>`:y}
                    </div>
                    <div class="expanded-body">
                        <slot name="panel-${this.expandedPanel}"></slot>
                    </div>
                </div>
            `}let e=this.navigation;return E`
            ${e?E`
                <div class="nav-header" part="nav-header">
                    ${e.parentActionId?E`
                        <button class="nav-parent" title="${e.parentLabel??`Back`}"
                                @click="${()=>this.navAction(e.parentActionId)}">
                            <span>‹</span><span>${e.parentLabel??`Back`}</span>
                        </button>
                    `:y}
                    ${e.title?E`<span class="nav-title">${e.title}</span>`:y}
                    <span class="nav-spacer"></span>
                    ${e.previousActionId?E`
                        <button class="nav-move" title="Previous"
                                @click="${()=>this.navAction(e.previousActionId)}">‹</button>
                    `:y}
                    ${e.nextActionId?E`
                        <button class="nav-move" title="Next"
                                @click="${()=>this.navAction(e.nextActionId)}">›</button>
                    `:y}
                </div>
            `:y}
            ${this.headerTitle?E`
                <div class="header-band" part="header-band">
                    <div class="header-content">
                        <h2 class="header-title">${this.headerTitle}</h2>
                        ${this.badges.length?E`
                            <div class="header-badges">
                                ${this.badges.map(e=>E`<span class="header-badge">${e}</span>`)}
                            </div>
                        `:``}
                    </div>
                    <div class="header-accent" part="header-accent"></div>
                </div>
            `:``}
            <div class="columns" part="columns">
                <div class="overview" part="overview">
                    ${this.overviewEditActionId?E`
                        <button class="overview-edit" title="Edit"
                                @click="${()=>this.navAction(this.overviewEditActionId)}">
                            <span>✎</span><span>Edit</span>
                        </button>
                    `:y}
                    <slot name="overview"></slot>
                </div>
                <div class="rail" part="rail">
                    ${this.panels.map((e,t)=>this.openPanels.has(t)?E`
                        <div class="panel" part="panel" data-anchor="${this.panelAnchor(e,t)}"
                             style="${e.width?`flex-basis: ${e.width}; min-width: min(${e.width}, 100%);`:y}"
                             @click="${()=>this.bookmarkPanel(t)}">
                            <div class="panel-header">
                                <div>
                                    <h3>${e.title}</h3>
                                    ${e.subtitle?E`<div class="subtitle">${e.subtitle}</div>`:``}
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
                    `:E`
                        <div class="strip" role="button" title="${e.title}"
                             data-anchor="${this.panelAnchor(e,t)}" @click="${()=>this.toggle(t)}">
                            <button class="fold" tabindex="-1">⟩</button>
                            <span>${e.title}</span>
                        </div>
                    `)}
                </div>
            </div>
        `}};A([b({type:Array})],ni.prototype,`panels`,void 0),A([b({type:String})],ni.prototype,`headerTitle`,void 0),A([b({type:Array})],ni.prototype,`badges`,void 0),A([b({type:String,reflect:!0})],ni.prototype,`orientation`,void 0),A([b({attribute:!1})],ni.prototype,`navigation`,void 0),A([b({type:String})],ni.prototype,`overviewEditActionId`,void 0),A([w()],ni.prototype,`openPanels`,void 0),A([w()],ni.prototype,`expandedPanel`,void 0),ni=A([_(`mateu-foldout`)],ni);var ri=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`
        <mateu-foldout
                .panels="${s.panels??[]}"
                .headerTitle="${s.headerTitle??``}"
                .badges="${s.badges??[]}"
                .navigation="${s.navigation??null}"
                overviewEditActionId="${s.overviewEditActionId??``}"
                orientation="${s.orientation??`vertical`}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??y}"
        >
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </mateu-foldout>
    `},ii=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.children??[],l=e=>c.filter(t=>(t.slot??``).startsWith(e)),u=l(`main-`),d=l(`aside-`),f=l(`footer-`),p=s.asideWidth&&s.asideWidth.trim()?s.asideWidth:`32%`,m=s.asidePosition===`start`,h=s.asideSticky!==!1,ee=t=>t.map(t=>F(e,t,n,r,i,a,o)),te=E`
        <div class="mateu-content-main"
             style="flex: 1 1 0; min-width: min(20rem, 100%); box-sizing: border-box;">
            ${ee(u)}
        </div>`,g=d.length?E`
        <div class="mateu-content-aside"
             style="flex: 0 1 calc(${p} - var(--lumo-space-m, 1rem)); min-width: min(18rem, 100%); box-sizing: border-box; ${h?`position: sticky; top: 1rem; align-self: flex-start;`:``}">
            ${ee(d)}
        </div>`:y;return E`
        <div class="mateu-content-layout ${t.cssClasses??``}"
             style="${t.style??``}"
             slot="${t.slot??y}">
            <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); align-items: flex-start;">
                ${m?[g,te]:[te,g]}
            </div>
            ${f.length?E`
                <div class="mateu-content-footer"
                     style="flex-basis: 100%; margin-top: var(--lumo-space-m, 1rem);">
                    ${ee(f)}
                </div>`:y}
        </div>
    `},ai=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=!!s.image,l=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${s.image}'); background-size: cover; background-position: center; color: #fff;`:``,u=s.centered===!1?`flex-start`:`center`,d=s.centered===!1?`left`:`center`;return E`
        <div class="mateu-hero ${t.cssClasses??``}"
             style="display: flex; flex-direction: column; align-items: ${u}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${d}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${s.height??`12rem`}; box-sizing: border-box; ${l} ${t.style??``}"
             slot="${t.slot??y}"
        >
            ${s.title?E`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${s.title}</h1>`:y}
            ${s.subtitle?E`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?``:`color: var(--lumo-secondary-text-color, #666);`} max-width: 40rem;">${s.subtitle}</p>`:y}
            ${t.children?.length?E`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${u}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
                </div>
            `:y}
        </div>
    `},R=e=>t=>{if(t.key===`Enter`){e(t);return}(t.key===` `||t.key===`Spacebar`)&&(t.preventDefault(),e(t))},z=g`
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
`,oi=1440*60*1e3,si=class extends x{constructor(...e){super(...e),this.tasks=[],this.onTaskSelectionActionId=``}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}static{this.styles=g`
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
    
        ${z}
    `}range(){let e=this.tasks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>new Date(e+`T00:00:00`).getTime());return e.length?{min:Math.min(...e)-oi,max:Math.max(...e)+2*oi}:null}months(e,t){let n=[],r=new Date(e);for(r.setDate(1);r.getTime()<=t;){let i=Math.max(r.getTime(),e),a=new Date(r.getFullYear(),r.getMonth()+1,1),o=Math.min(a.getTime(),t);n.push({label:r.toLocaleDateString(void 0,{month:`short`,year:`2-digit`}),from:i,to:o}),r.setMonth(r.getMonth()+1)}return n}render(){let e=this.range();if(!e)return E``;let t=e.max-e.min,n=n=>(n-e.min)/t*100,r=Date.now();return E`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(e=>E`
                        <div class="month" style="width: ${(e.to-e.from)/t*100}%;">${e.label}</div>
                    `)}
                </div>
                ${this.tasks.map(i=>{let a=new Date(i.start+`T00:00:00`).getTime(),o=new Date(i.end+`T00:00:00`).getTime()+oi;return E`
                        <div class="label" title="${i.title}">${i.title}</div>
                        <div class="lane">
                            ${r>=e.min&&r<=e.max?E`<div class="today" style="left: ${n(r)}%;"></div>`:y}
                            <div role="button" tabindex="0"
                                 aria-label="${i.title}, ${i.start} to ${i.end}${i.progress?`, ${i.progress}% complete`:``}"
                                 class="bar ${this.onTaskSelectionActionId?`clickable`:``}"
                                 title="${i.title} · ${i.start} → ${i.end}${i.progress?` · ${i.progress}%`:``}"
                                 @click="${()=>this.selectTask(i)}" @keydown="${R(()=>this.selectTask(i))}"
                                 style="left: ${n(a)}%; width: ${(o-a)/t*100}%; ${i.color?`--mateu-gantt-fill: ${i.color};`:``}">
                                <div class="fill" style="width: ${i.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};A([b({type:Array})],si.prototype,`tasks`,void 0),A([b()],si.prototype,`onTaskSelectionActionId`,void 0),si=A([_(`mateu-gantt`)],si);var ci=e=>{let t=e.metadata;return E`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                .onTaskSelectionActionId="${t.onTaskSelectionActionId??``}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-gantt>
    `},B,li=class extends x{static{B=this}constructor(...e){super(...e),this.resources=[],this.blocks=[],this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key===`Escape`&&this.drag&&(e.stopPropagation(),this.endDrag())}}static{this.styles=g`
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
    `}static parse(e){return new Date(e+`T00:00:00`)}static iso(e){let t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){let e=B.parse(this.from),t=B.daysBetween(e,B.parse(this.to))+1;return t>0?{from:e,days:t}:null}let e=this.blocks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>B.parse(e));if(!e.length)return null;let t=new Date(Math.min(...e.map(e=>e.getTime()))),n=new Date(Math.max(...e.map(e=>e.getTime())));return{from:t,days:B.daysBetween(t,n)+1}}onBlockPointerDown(e,t,n){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;let r=B.parse(t.start),i=B.parse(t.end),a=Math.max(1,B.daysBetween(r,i)+1);this.laneRects=[...this.renderRoot.querySelectorAll(`.lane[data-resource-id]`)].map(e=>({resourceId:e.dataset.resourceId,rect:e.getBoundingClientRect()}));let o=this.dayAt(t.resourceId,e.clientX)??n;this.drag={blockId:t.id,duration:a,grabOffsetDays:o-n,originResourceId:t.resourceId,originStartIdx:n,targetResourceId:t.resourceId,targetStartIdx:n,moved:!1},window.addEventListener(`keydown`,this.onDragKeydown)}dayAt(e,t){let n=this.laneRects.find(t=>t.resourceId===e),r=this.window();if(!n||!r||n.rect.width===0)return null;let i=Math.floor((t-n.rect.left)/n.rect.width*r.days);return Math.max(0,Math.min(r.days-1,i))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;let t=this.window();if(!t)return;let n=this.laneRects.find(t=>e.clientY>=t.rect.top&&e.clientY<=t.rect.bottom)??this.laneRects.find(e=>e.resourceId===this.drag.targetResourceId);if(!n)return;let r=this.dayAt(n.resourceId,e.clientX);if(r==null)return;let i=Math.max(0,Math.min(t.days-this.drag.duration,r-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:n.resourceId,targetStartIdx:i}}onBlockPointerUp(e){let t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;let n=this.window();if(!n)return;let r=B.addDays(n.from,t.targetStartIdx),i=B.addDays(r,t.duration-1);this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:B.iso(r),_end:B.iso(i)}},bubbles:!0,composed:!0}))}endDrag(){this.drag=null,window.removeEventListener(`keydown`,this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener(`keydown`,this.onDragKeydown)}render(){let e=this.window();if(!e||!this.resources.length)return E``;let t=[...Array(e.days).keys()].map(t=>B.addDays(e.from,t)),n=new Date,r=B.daysBetween(e.from,new Date(n.getFullYear(),n.getMonth(),n.getDate())),i=r>=0&&r<e.days,a=[],o;return this.resources.forEach(n=>{n.group&&n.group!==o&&a.push(E`<div class="group">${n.group}</div>`),o=n.group,a.push(this.renderRow(n,e,t,i?r:null))}),E`
            <div class="frame" style="grid-template-columns: minmax(8rem, 12rem) repeat(${e.days}, minmax(2.2rem, 1fr));">
                <div class="corner">Resource</div>
                ${t.map((e,t)=>E`
                    <div class="day-head ${this.isWeekend(e)?`weekend`:``} ${t===r?`today`:``}">
                        <span class="dow">${e.toLocaleDateString(void 0,{weekday:`short`})}</span>
                        <span class="num">${e.getDate()}</span>
                    </div>
                `)}
                ${a}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(e,t,n,r){let i=100/t.days,a=this.blocks.filter(t=>t.resourceId===e.id&&t.start&&t.end),o=this.drag?.moved&&this.drag.targetResourceId===e.id?this.drag:null;return E`
            <div class="label" title="${e.label??``}">${e.label}</div>
            <div class="lane" data-resource-id="${e.id}">
                <div class="cells">
                    ${n.map(e=>E`<div class="cell ${this.isWeekend(e)?`weekend`:``}"></div>`)}
                </div>
                ${r==null?y:E`<div class="today-line" style="left: ${(r+.5)*i}%;"></div>`}
                ${a.map(e=>{let n=B.daysBetween(t.from,B.parse(e.start)),r=B.daysBetween(t.from,B.parse(e.end));if(r<0||n>=t.days)return y;let a=Math.max(0,n),o=Math.min(t.days-1,r),s=this.drag?.moved&&this.drag.blockId===e.id;return E`
                        <div class="block ${this.selectActionId?`clickable`:``} ${this.moveActionId?`draggable`:``} ${s?`dragging`:``}"
                             title="${e.label??``} · ${e.start} → ${e.end}${e.status?` · ${e.status}`:``}"
                             style="left: ${a*i}%; width: ${(o-a+1)*i}%; ${e.color?`--mateu-planning-block: ${e.color};`:``}"
                             @pointerdown="${t=>this.onBlockPointerDown(t,e,n)}"
                             @pointermove="${e=>this.onBlockPointerMove(e)}"
                             @pointerup="${()=>this.onBlockPointerUp(e)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${e.label}</div>
                    `})}
                ${o?E`
                    <div class="ghost"
                         style="left: ${o.targetStartIdx*i}%; width: ${Math.min(o.duration,t.days-o.targetStartIdx)*i}%;"></div>
                `:y}
            </div>
        `}};A([b({type:Array})],li.prototype,`resources`,void 0),A([b({type:Array})],li.prototype,`blocks`,void 0),A([b()],li.prototype,`from`,void 0),A([b()],li.prototype,`to`,void 0),A([b()],li.prototype,`moveActionId`,void 0),A([b()],li.prototype,`selectActionId`,void 0),A([w()],li.prototype,`drag`,void 0),li=B=A([_(`mateu-planning-board`)],li);var ui=e=>{let t=e.metadata;return E`
        <mateu-planning-board
                .resources="${t.resources??[]}"
                .blocks="${t.blocks??[]}"
                .from="${t.from}"
                .to="${t.to}"
                .moveActionId="${t.moveActionId}"
                .selectActionId="${t.selectActionId}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-planning-board>
    `},di=class extends x{constructor(...e){super(...e),this.columns=[]}static{this.styles=g`
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
    
        ${z}
    `}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return E`
            <div class="board">
                ${this.columns.map(e=>E`
                    <div class="column" style="${e.color?`--mateu-kanban-accent: ${e.color};`:``}">
                        <div class="column-head">
                            <span class="column-title" title="${e.title??``}">${e.title}</span>
                            <span class="count">${e.cards?.length??0}</span>
                        </div>
                        ${(e.cards??[]).map(e=>E`
                            <div role="button" tabindex="0" class="card ${e.actionId?`clickable`:``}"
                                 style="${e.color?`--mateu-kanban-card-accent: ${e.color};`:``}"
                                 @click="${()=>this.clickCard(e)}" @keydown="${R(()=>this.clickCard(e))}">
                                <span class="card-title">${e.title}</span>
                                ${e.description?E`<span class="card-desc">${e.description}</span>`:y}
                                ${e.badge?E`<span class="badge">${e.badge}</span>`:y}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};A([b({type:Array})],di.prototype,`columns`,void 0),di=A([_(`mateu-kanban`)],di);var fi=e=>E`
        <mateu-kanban
                .columns="${e.metadata.columns??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-kanban>
    `,pi=class extends x{constructor(...e){super(...e),this.items=[]}static{this.styles=g`
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
    
        ${z}
    `}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return E`
            <div class="feed">
                ${this.items.map(e=>E`
                    <div class="item ${e.actionId?`clickable`:``}">
                        <div class="rail">
                            <div class="dot" style="${e.color?`--mateu-timeline-dot: ${e.color};`:``}">${e.icon??``}</div>
                            <div class="line"></div>
                        </div>
                        <div role="button" tabindex="0" class="body" @click="${()=>this.clickItem(e)}" @keydown="${R(()=>this.clickItem(e))}">
                            <div class="head">
                                <span class="title">${e.title}</span>
                                ${e.timestamp?E`<span class="time">${e.timestamp}</span>`:y}
                            </div>
                            ${e.description?E`<div class="desc">${e.description}</div>`:y}
                        </div>
                    </div>
                `)}
            </div>
        `}};A([b({type:Array})],pi.prototype,`items`,void 0),pi=A([_(`mateu-timeline`)],pi);var mi=e=>E`
        <mateu-timeline
                .items="${e.metadata.items??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-timeline>
    `,hi=class extends x{constructor(...e){super(...e),this.steps=[],this.vertical=!1}static{this.styles=g`
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
    `}updated(){let e=this.steps.length;if(e===0)return;let t=this.steps.findIndex(e=>e.status===`current`),n=this.steps.every(e=>e.status===`done`),r=t>=0?t+1:n?e:0;this.dispatchEvent(new CustomEvent(`mateu-guided-progress`,{detail:{current:r,total:e,steps:this.steps.map(e=>({id:e.id,title:e.title,status:e.status??`upcoming`}))},bubbles:!0,composed:!0}))}render(){return E`
            <div class="steps">
                ${this.steps.map((e,t)=>{let n=e.status??`upcoming`;return E`
                        <div class="step ${n}">
                            <div class="connector"></div>
                            <div class="dot">${n===`done`?`✓`:t+1}</div>
                            <div class="label">${e.title}</div>
                            ${e.description?E`<div class="desc">${e.description}</div>`:y}
                        </div>
                    `})}
            </div>
        `}};A([b({type:Array})],hi.prototype,`steps`,void 0),A([b({type:Boolean,reflect:!0})],hi.prototype,`vertical`,void 0),hi=A([_(`mateu-progress-steps`)],hi);var gi=e=>{let t=e.metadata;return E`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                ?vertical="${t.vertical??!1}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-progress-steps>
    `},_i=class extends x{constructor(...e){super(...e),this.spark=[]}static{this.styles=g`
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
    
        ${z}
    `}sparkline(){let e=this.spark;if(!e||e.length<2)return y;let t=Math.min(...e),n=Math.max(...e)-t||1,r=80/(e.length-1),i=e.map((e,i)=>[2+i*r,2+26*(1-(e-t)/n)]),a=i.map(([e,t],n)=>`${n===0?`M`:`L`}${e.toFixed(1)} ${t.toFixed(1)}`).join(` `),o=`${a} L${i[i.length-1][0].toFixed(1)} 30 L${i[0][0].toFixed(1)} 30 Z`,s=this.trend===`down`?`var(--lumo-error-color, #e11d48)`:this.trend===`flat`?`var(--lumo-secondary-text-color, #888)`:`var(--lumo-success-color, #12b76a)`;return T`
            <svg width="${84}" height="${30}" viewBox="0 0 ${84} ${30}">
                <path d="${o}" fill="${s}" opacity="0.12"></path>
                <path d="${a}" fill="none" stroke="${s}" stroke-width="1.6"
                      stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>
        `}dispatchAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){let e=this.trend??`up`;return E`
            <div role="button" tabindex="0" class="tile ${this.actionId?`clickable`:``}" @click="${()=>this.dispatchAction()}" @keydown="${R(()=>this.dispatchAction())}">
                ${this.label?E`<span class="label">${this.label}</span>`:y}
                <span class="value">${this.value}${this.unit?E`<span class="unit">${this.unit}</span>`:y}</span>
                <div class="foot">
                    ${this.delta?E`<span class="delta ${e}">${e===`up`?`▲`:e===`down`?`▼`:`→`} ${this.delta}</span>`:E`<span></span>`}
                    ${this.sparkline()}
                </div>
            </div>
        `}};A([b()],_i.prototype,`label`,void 0),A([b()],_i.prototype,`value`,void 0),A([b()],_i.prototype,`unit`,void 0),A([b()],_i.prototype,`delta`,void 0),A([b()],_i.prototype,`trend`,void 0),A([b({type:Array})],_i.prototype,`spark`,void 0),A([b()],_i.prototype,`actionId`,void 0),_i=A([_(`mateu-stat`)],_i);var vi=e=>{let t=e.metadata;return E`
        <mateu-stat
                label="${t.label??y}"
                value="${t.value??y}"
                unit="${t.unit??y}"
                delta="${t.delta??y}"
                trend="${t.trend??y}"
                actionId="${t.actionId??y}"
                .spark="${t.spark??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-stat>
    `},yi=class extends x{constructor(...e){super(...e),this.events=[]}static{this.styles=g`
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
    
        ${z}
    `}clickEvent(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}render(){let e=this.month?new Date(this.month+`T00:00:00`):new Date,t=e.getFullYear(),n=e.getMonth(),r=new Date(t,n,1),i=(r.getDay()+6)%7,a=new Date(t,n+1,0).getDate(),o=new Date,s=e=>o.getFullYear()===t&&o.getMonth()===n&&o.getDate()===e,c={};for(let e of this.events){if(!e.date)continue;let r=new Date(e.date+`T00:00:00`);r.getFullYear()===t&&r.getMonth()===n&&(c[r.getDate()]??=[]).push(e)}let l=[`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`,`Sun`],u=[];for(let e=0;e<i;e++)u.push(E`<div class="cell blank"></div>`);for(let e=1;e<=a;e++)u.push(E`
                <div class="cell ${s(e)?`today`:``}">
                    <span class="num">${e}</span>
                    ${(c[e]??[]).map(e=>E`
                        <span role="button" tabindex="0" class="chip ${e.actionId?`clickable`:``}"
                              style="${e.color?`--mateu-cal-accent: ${e.color};`:``}"
                              title="${e.title??``}"
                              @click="${()=>this.clickEvent(e)}" @keydown="${R(()=>this.clickEvent(e))}">${e.title}</span>
                    `)}
                </div>
            `);return E`
            <div class="title">${r.toLocaleDateString(void 0,{month:`long`,year:`numeric`})}</div>
            <div class="grid">
                ${l.map(e=>E`<div class="dow">${e}</div>`)}
                ${u}
            </div>
        `}};A([b()],yi.prototype,`month`,void 0),A([b({type:Array})],yi.prototype,`events`,void 0),yi=A([_(`mateu-calendar`)],yi);var bi=e=>{let t=e.metadata;return E`
        <mateu-calendar
                month="${t.month??y}"
                .events="${t.events??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-calendar>
    `},xi=class extends x{constructor(...e){super(...e),this.plans=[]}static{this.styles=g`
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
    `}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return E`
            <div class="plans">
                ${this.plans.map(e=>E`
                    <div class="plan ${e.featured?`featured`:``}">
                        ${e.featured?E`<span class="badge">Recommended</span>`:y}
                        <span class="name">${e.name}</span>
                        <div>
                            <span class="price">${e.price}</span>
                            ${e.period?E`<span class="period">${e.period}</span>`:y}
                        </div>
                        <ul>
                            ${(e.features??[]).map(e=>E`<li>${e}</li>`)}
                        </ul>
                        ${e.ctaLabel?E`
                            <button class="cta" @click="${()=>this.cta(e)}">${e.ctaLabel}</button>
                        `:y}
                    </div>
                `)}
            </div>
        `}};A([b({type:Array})],xi.prototype,`plans`,void 0),xi=A([_(`mateu-pricing-table`)],xi);var Si=e=>E`
        <mateu-pricing-table
                .plans="${e.metadata.plans??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-pricing-table>
    `,Ci=class extends x{static{this.styles=g`
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
    
        ${z}
    `}clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){let t=e.avatar,n=t&&(t.startsWith(`http`)||t.startsWith(`data:`));return E`
            <li>
                <div role="button" tabindex="0" class="node ${e.actionId?`clickable`:``}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:``}"
                     @click="${()=>this.clickNode(e)}" @keydown="${R(()=>this.clickNode(e))}">
                    ${t?E`<span class="avatar">${n?E`<img src="${t}" alt="">`:t}</span>`:y}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?E`<span class="subtitle">${e.subtitle}</span>`:y}
                </div>
                ${e.children&&e.children.length?E`<ul>${e.children.map(e=>this.renderNode(e))}</ul>`:y}
            </li>
        `}render(){return this.root?E`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:E``}};A([b({attribute:!1})],Ci.prototype,`root`,void 0),Ci=A([_(`mateu-org-chart`)],Ci);var wi=e=>E`
        <mateu-org-chart
                .root="${e.metadata.root}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-org-chart>
    `,Ti=1440*60*1e3,Ei=class extends x{constructor(...e){super(...e),this.cells=[]}static{this.styles=g`
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
    `}color(e,t){if(e<=0||t<=0)return`var(--lumo-contrast-10pct, #ebedf0)`;let n=e/t;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round((n>.75?1:n>.5?.75:n>.25?.5:.3)*100)}%, transparent)`}render(){let e=this.cells.filter(e=>!!e.date);if(!e.length)return E``;let t=e.map(e=>new Date(e.date+`T00:00:00`).getTime()),n=Math.min(...t),r=Math.max(...t),i=new Date(n);i.setDate(i.getDate()-(i.getDay()+6)%7);let a={};for(let t of e)a[t.date]=t;let o=Math.max(...e.map(e=>e.value??0),1),s=[];for(let e=i.getTime();e<=r;e+=Ti){let t=new Date(e),n=t.toISOString().slice(0,10),r=a[n],i=r?.value??0,c=(t.getDay()+6)%7+1,l=r?.label??`${n}: ${i}`;s.push(E`
                <div class="cell" style="grid-row: ${c}; --cell: ${this.color(i,o)};" title="${l}"></div>
            `)}return E`
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
        `}};A([b({type:Array})],Ei.prototype,`cells`,void 0),Ei=A([_(`mateu-heatmap`)],Ei);var Di=e=>E`
        <mateu-heatmap
                .cells="${e.metadata.cells??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-heatmap>
    `,Oi=class extends x{constructor(...e){super(...e),this.stages=[]}static{this.styles=g`
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
    `}render(){let e=this.stages;if(!e.length)return E``;let t=e[0].value??0,n=Math.max(...e.map(e=>e.value??0),1);return E`
            <div class="funnel">
                ${e.map((r,i)=>{let a=r.value??0,o=n>0?Math.max(6,a/n*100):6,s=i>0?e[i-1].value??0:t,c=i===0?t>0?`100%`:``:s>0?`${Math.round(a/s*100)}%`:`0%`;return E`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${r.label}</span>
                                ${i>0?E`<span class="conv">${c} of previous</span>`:y}
                            </div>
                            <div class="bar" style="width: ${o}%; ${r.color?`--bar: ${r.color};`:``}">
                                ${a.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};A([b({type:Array})],Oi.prototype,`stages`,void 0),Oi=A([_(`mateu-funnel`)],Oi);var ki=e=>E`
        <mateu-funnel
                .stages="${e.metadata.stages??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-funnel>
    `,Ai=class extends x{constructor(...e){super(...e),this.values=[],this.labels=[],this.area=!1}static{this.styles=g`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `}render(){let e=this.values;if(!e||e.length<2)return E``;let t=Math.min(...e),n=Math.max(...e),r=n-t||1,i=584/(e.length-1),a=e.map((e,n)=>[8+n*i,8+144*(1-(e-t)/r)]),o=a.map(([e,t],n)=>`${n===0?`M`:`L`}${e.toFixed(1)} ${t.toFixed(1)}`).join(` `),s=`${o} L${a[a.length-1][0].toFixed(1)} 152 L${a[0][0].toFixed(1)} 152 Z`,c=this.color||`var(--lumo-primary-color, #1a73e8)`,l=e.indexOf(n),u=e.indexOf(t);return E`
            ${this.heading?E`<div class="title">${this.heading}</div>`:y}
            <svg viewBox="0 0 ${600} ${160}" preserveAspectRatio="none">
                ${this.area?T`<path d="${s}" fill="${c}" opacity="0.12"></path>`:y}
                <path d="${o}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${a.map((t,n)=>n===l||n===u?T`<circle cx="${t[0]}" cy="${t[1]}" r="3.2" fill="${c}"><title>${this.labels[n]??``}: ${e[n]}</title></circle>`:T`<circle cx="${t[0]}" cy="${t[1]}" r="6" fill="transparent"><title>${this.labels[n]??``}: ${e[n]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?E`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:y}
        `}};A([b()],Ai.prototype,`heading`,void 0),A([b({type:Array})],Ai.prototype,`values`,void 0),A([b({type:Array})],Ai.prototype,`labels`,void 0),A([b()],Ai.prototype,`color`,void 0),A([b({type:Boolean})],Ai.prototype,`area`,void 0),Ai=A([_(`mateu-trend-chart`)],Ai);var ji=e=>{let t=e.metadata;return E`
        <mateu-trend-chart
                heading="${t.title??y}"
                color="${t.color??y}"
                ?area="${t.area??!1}"
                .values="${t.values??[]}"
                .labels="${t.labels??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-trend-chart>
    `},Mi=class extends x{constructor(...e){super(...e),this.features=[],this.columns=0}static{this.styles=g`
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
    
        ${z}
    `}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return E`
            <div class="grid" style="grid-template-columns: ${this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:`repeat(auto-fit, minmax(15rem, 1fr))`};">
                ${this.features.map(e=>E`
                    <div role="button" tabindex="0" class="card ${e.actionId?`clickable`:``}" @click="${()=>this.clickFeature(e)}" @keydown="${R(()=>this.clickFeature(e))}">
                        ${e.icon?E`<span class="icon">${e.icon}</span>`:y}
                        <span class="title">${e.title}</span>
                        ${e.description?E`<span class="desc">${e.description}</span>`:y}
                    </div>
                `)}
            </div>
        `}};A([b({type:Array})],Mi.prototype,`features`,void 0),A([b({type:Number})],Mi.prototype,`columns`,void 0),Mi=A([_(`mateu-feature-grid`)],Mi);var Ni=e=>{let t=e.metadata;return E`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-feature-grid>
    `},Pi=class extends x{constructor(...e){super(...e),this.items=[]}static{this.styles=g`
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
    `}stars(e){let t=Math.max(0,Math.min(5,e||0));return`★`.repeat(t)+`☆`.repeat(5-t)}render(){return E`
            <div class="grid">
                ${this.items.map(e=>{let t=e.avatar&&(e.avatar.startsWith(`http`)||e.avatar.startsWith(`data:`));return E`
                        <div class="card">
                            ${e.rating?E`<div class="stars">${this.stars(e.rating)}</div>`:y}
                            <div class="quote">${e.quote}</div>
                            <div class="author">
                                ${e.avatar?E`<span class="avatar">${t?E`<img src="${e.avatar}" alt="">`:e.avatar}</span>`:y}
                                <div>
                                    <div class="name">${e.author}</div>
                                    ${e.role?E`<div class="role">${e.role}</div>`:y}
                                </div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};A([b({type:Array})],Pi.prototype,`items`,void 0),Pi=A([_(`mateu-testimonials`)],Pi);var Fi=e=>E`
        <mateu-testimonials
                .items="${e.metadata.items??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-testimonials>
    `,Ii=class extends x{constructor(...e){super(...e),this.items=[],this.openSet=new Set,this.seeded=!1}static{this.styles=g`
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
    
        ${z}
    `}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),E`
            <div class="list">
                ${this.items.map((e,t)=>{let n=this.openSet.has(t);return E`
                        <div class="item ${n?`open`:``}">
                            <div role="button" tabindex="0" aria-expanded="${n}" class="q" @click="${()=>this.toggle(t)}" @keydown="${R(()=>this.toggle(t))}">
                                <span>${e.question}</span>
                                <span class="chevron">›</span>
                            </div>
                            ${n?E`<div class="a">${e.answer}</div>`:``}
                        </div>
                    `})}
            </div>
        `}};A([b({type:Array})],Ii.prototype,`items`,void 0),A([w()],Ii.prototype,`openSet`,void 0),Ii=A([_(`mateu-faq`)],Ii);var Li=e=>E`
        <mateu-faq
                .items="${e.metadata.items??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-faq>
    `,Ri=class extends x{static{this.styles=g`
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
    `}themeVars(){switch(this.theme){case`success`:return`--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));`;case`warning`:return`--accent: #f59e0b; --bg: rgba(245,158,11,.12);`;case`danger`:return`--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));`;default:return`--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));`}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return E`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?E`<span class="icon">${this.icon}</span>`:y}
                <div class="body">
                    ${this.heading?E`<span class="heading">${this.heading}</span>`:y}
                    ${this.description?E`<span class="desc">${this.description}</span>`:y}
                    ${this.ctaLabel?E`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:y}
                </div>
            </div>
        `}};A([b()],Ri.prototype,`heading`,void 0),A([b()],Ri.prototype,`description`,void 0),A([b()],Ri.prototype,`icon`,void 0),A([b()],Ri.prototype,`ctaLabel`,void 0),A([b()],Ri.prototype,`actionId`,void 0),A([b()],Ri.prototype,`theme`,void 0),Ri=A([_(`mateu-callout-card`)],Ri);var zi=e=>{let t=e.metadata;return E`
        <mateu-callout-card
                heading="${t.title??y}"
                description="${t.description??y}"
                icon="${t.icon??y}"
                ctaLabel="${t.ctaLabel??y}"
                actionId="${t.actionId??y}"
                theme="${t.theme??y}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-callout-card>
    `},Bi=class extends x{constructor(...e){super(...e),this.comments=[]}static{this.styles=g`
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
    `}renderComment(e){let t=e.avatar&&(e.avatar.startsWith(`http`)||e.avatar.startsWith(`data:`));return E`
            <div class="comment">
                <span class="avatar">${e.avatar?t?E`<img src="${e.avatar}" alt="">`:e.avatar:e.author?.[0]??`?`}</span>
                <div class="body">
                    <div class="head">
                        <span class="author">${e.author}</span>
                        ${e.timestamp?E`<span class="time">${e.timestamp}</span>`:y}
                    </div>
                    <div class="text">${e.text}</div>
                    ${e.replies&&e.replies.length?E`<div class="replies">${e.replies.map(e=>this.renderComment(e))}</div>`:y}
                </div>
            </div>
        `}render(){return E`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};A([b({type:Array})],Bi.prototype,`comments`,void 0),Bi=A([_(`mateu-comment-thread`)],Bi);var Vi=e=>E`
        <mateu-comment-thread
                .comments="${e.metadata.comments??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-comment-thread>
    `,Hi={pdf:`📕`,image:`🖼️`,img:`🖼️`,doc:`📘`,docx:`📘`,word:`📘`,xls:`📗`,xlsx:`📗`,excel:`📗`,sheet:`📗`,zip:`🗜️`,archive:`🗜️`,video:`🎬`,audio:`🎵`,code:`💻`,csv:`📄`,txt:`📄`},Ui=class extends x{constructor(...e){super(...e),this.files=[]}static{this.styles=g`
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
    
        ${z}
    `}icon(e){return e&&Hi[e.toLowerCase()]||`📄`}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return E`
            <div class="list">
                ${this.files.map(e=>{let t=!!e.url||!!e.actionId,n=E`
                        <span class="icon">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?E`<span class="size">${e.size}</span>`:y}
                        ${e.url?E`<span class="dl">⬇</span>`:y}
                    `;return e.url?E`<a class="file clickable" href="${e.url}" download target="_blank" rel="noopener">${n}</a>`:E`<div role="button" tabindex="0" class="file ${t?`clickable`:``}" @click="${t=>this.clickFile(e,t)}" @keydown="${R(t=>this.clickFile(e,t))}">${n}</div>`})}
            </div>
        `}};A([b({type:Array})],Ui.prototype,`files`,void 0),Ui=A([_(`mateu-file-list`)],Ui);var Wi=e=>E`
        <mateu-file-list
                .files="${e.metadata.files??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-file-list>
    `,Gi=class extends x{constructor(...e){super(...e),this.items=[],this.localDone=new Map}static{this.styles=g`
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
    
        ${z}
    `}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){let n=!this.isDone(e,t);this.localDone.set(t,n),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_item:e,_done:n}},bubbles:!0,composed:!0}))}render(){let e=this.items.length,t=this.items.filter((e,t)=>this.isDone(e,t)).length,n=e>0?Math.round(t/e*100):0;return E`
            <div class="head">
                ${this.heading?E`<span class="title">${this.heading}</span>`:E`<span></span>`}
                <span class="count">${t} / ${e}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${n}%;"></div></div>
            ${this.items.map((e,t)=>{let n=this.isDone(e,t);return E`
                    <div role="button" tabindex="0" class="item ${n?`done`:``}" @click="${()=>this.toggle(e,t)}" @keydown="${R(()=>this.toggle(e,t))}">
                        <span class="box">${n?`✓`:y}</span>
                        <span class="label">${e.label}</span>
                    </div>
                `})}
        `}};A([b()],Gi.prototype,`heading`,void 0),A([b({type:Array})],Gi.prototype,`items`,void 0),A([w()],Gi.prototype,`localDone`,void 0),Gi=A([_(`mateu-checklist`)],Gi);var Ki=e=>{let t=e.metadata;return E`
        <mateu-checklist
                heading="${t.title??y}"
                .items="${t.items??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-checklist>
    `},qi=class extends x{static{this.styles=g`
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
    `}render(){let e=this.trend??`flat`;return E`
            <div class="card">
                ${this.heading?E`<div class="title">${this.heading}</div>`:y}
                <div class="row">
                    <div class="side">
                        ${this.leftLabel?E`<div class="label">${this.leftLabel}</div>`:y}
                        <div class="value">${this.leftValue}</div>
                    </div>
                    <div class="mid">
                        <span class="arrow">${`→`}</span>
                        ${this.delta?E`<span class="delta ${e}">${e===`up`?`▲`:e===`down`?`▼`:``} ${this.delta}</span>`:y}
                    </div>
                    <div class="side">
                        ${this.rightLabel?E`<div class="label">${this.rightLabel}</div>`:y}
                        <div class="value">${this.rightValue}</div>
                    </div>
                </div>
            </div>
        `}};A([b()],qi.prototype,`heading`,void 0),A([b()],qi.prototype,`leftLabel`,void 0),A([b()],qi.prototype,`leftValue`,void 0),A([b()],qi.prototype,`rightLabel`,void 0),A([b()],qi.prototype,`rightValue`,void 0),A([b()],qi.prototype,`delta`,void 0),A([b()],qi.prototype,`trend`,void 0),qi=A([_(`mateu-comparison-card`)],qi);var Ji=e=>{let t=e.metadata;return E`
        <mateu-comparison-card
                heading="${t.title??y}"
                leftLabel="${t.leftLabel??y}"
                leftValue="${t.leftValue??y}"
                rightLabel="${t.rightLabel??y}"
                rightValue="${t.rightValue??y}"
                delta="${t.delta??y}"
                trend="${t.trend??y}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-comparison-card>
    `},Yi=g`
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
`,Xi=new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}),Zi=e=>Number.isFinite(e)?Xi.format(e):``,Qi=(e,t)=>{let n=e<0?`-`:``,r=Zi(Math.abs(e));return t?`${n}${t} ${r}`:`${n}${r}`},$i=(e,t)=>t?`${Zi(e)} ${t}`:Zi(e),ea=class extends x{constructor(...e){super(...e),this.title=``,this.badges=[],this.facts=[]}static{this.styles=[Yi,g`
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
    `]}render(){let e=!!(this.metricLabel||this.metricValue||this.metricCaption);return E`
            <div class="card">
                <div class="main">
                    <div class="title-row">
                        <span class="title">${this.title}</span>
                        ${this.badges.map(e=>E`<span class="chip ${e.color??``}">${e.label}</span>`)}
                    </div>
                    ${this.subtitle?E`<span class="subtitle">${this.subtitle}</span>`:y}
                    ${this.facts.length?E`
                        <div class="facts">
                            ${this.facts.map(e=>E`
                                <div class="fact">
                                    <span class="label">${e.label}</span>
                                    <span class="value">${e.value}</span>
                                </div>
                            `)}
                        </div>
                    `:y}
                </div>
                ${e?E`
                    <div class="metric">
                        ${this.metricLabel?E`<span class="label">${this.metricLabel}</span>`:y}
                        ${this.metricValue?E`<span class="value">${this.metricValue}</span>`:y}
                        ${this.metricCaption?E`<span class="caption">${this.metricCaption}</span>`:y}
                    </div>
                `:y}
            </div>
        `}};A([b()],ea.prototype,`title`,void 0),A([b({type:Array})],ea.prototype,`badges`,void 0),A([b()],ea.prototype,`subtitle`,void 0),A([b({type:Array})],ea.prototype,`facts`,void 0),A([b()],ea.prototype,`metricLabel`,void 0),A([b()],ea.prototype,`metricValue`,void 0),A([b()],ea.prototype,`metricCaption`,void 0),ea=A([_(`mateu-entity-header`)],ea);var ta=e=>{if(e.__hoistedToPageHeader)return E``;let t=e.metadata;return E`
        <mateu-entity-header
                .title="${t.title??``}"
                .badges="${t.badges??[]}"
                .subtitle="${t.subtitle}"
                .facts="${t.facts??[]}"
                .metricLabel="${t.metricLabel}"
                .metricValue="${t.metricValue}"
                .metricCaption="${t.metricCaption}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-entity-header>
    `},na=class extends x{constructor(...e){super(...e),this.value=0,this.max=0}static{this.styles=g`
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
    `}fillColor(){return this.dangerAt!=null&&this.value>=this.dangerAt?`error`:this.warnAt!=null&&this.value>=this.warnAt?`warning`:this.warnAt!=null||this.dangerAt!=null?`success`:`primary`}render(){let e=this.max>0?Math.min(Math.max(this.value/this.max,0),1):0,t=Math.round(e*100);return E`
            <div class="meter">
                ${this.label?E`<span class="label">${this.label}</span>`:y}
                <span class="value">${$i(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};A([b()],na.prototype,`label`,void 0),A([b({type:Number})],na.prototype,`value`,void 0),A([b({type:Number})],na.prototype,`max`,void 0),A([b()],na.prototype,`unit`,void 0),A([b()],na.prototype,`caption`,void 0),A([b({type:Number})],na.prototype,`warnAt`,void 0),A([b({type:Number})],na.prototype,`dangerAt`,void 0),na=A([_(`mateu-meter`)],na);var ra=e=>{let t=e.metadata;return E`
        <mateu-meter
                .label="${t.label}"
                .value="${t.value??0}"
                .max="${t.max??0}"
                .unit="${t.unit}"
                .caption="${t.caption}"
                .warnAt="${t.warnAt}"
                .dangerAt="${t.dangerAt}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-meter>
    `},ia=class extends x{constructor(...e){super(...e),this.total=0,this.done=0}static{this.styles=g`
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
    `}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){let e=this.total>0&&this.done>=this.total,t=!e&&!!this.actionLabel&&!!this.actionId;return E`
            <div class="banner ${e?`complete`:``}">
                <span class="icon">👥</span>
                ${this.label?E`<span class="label">${this.label}</span>`:y}
                <div class="pills">
                    ${Array.from({length:this.total},(e,t)=>E`
                        <span class="pill ${t+1<=this.done?`filled`:``}">${t+1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${t?E`<button @click="${()=>this.runAction()}">${this.actionLabel} →</button>`:y}
            </div>
        `}};A([b()],ia.prototype,`label`,void 0),A([b({type:Number})],ia.prototype,`total`,void 0),A([b({type:Number})],ia.prototype,`done`,void 0),A([b()],ia.prototype,`actionLabel`,void 0),A([b()],ia.prototype,`actionId`,void 0),ia=A([_(`mateu-task-progress`)],ia);var aa=e=>{let t=e.metadata;return E`
        <mateu-task-progress
                .label="${t.label}"
                .total="${t.total??0}"
                .done="${t.done??0}"
                .actionLabel="${t.actionLabel}"
                .actionId="${t.actionId}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-task-progress>
    `},oa=class extends x{constructor(...e){super(...e),this.items=[],this.compact=!1,this.frameless=!1,this.columns=0,this.itemHeadingLevel=3}static{this.styles=[Yi,z,g`
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
    `]}runAction(e,t){t&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}rowClicked(e){this.rowActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.rowActionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}renderItemAction(e,t,n,r){return!t||!n?y:r?E`
                <button class="icon-action" title="${t}" aria-label="${t}"
                    @click="${t=>{t.stopPropagation(),this.runAction(e,n)}}">
                    ${I(r)}
                </button>`:E`
            <button class="row-action" title="${t}"
                @click="${t=>{t.stopPropagation(),this.runAction(e,n)}}">${t}</button>`}render(){let e=this.columns>1||this.items.some(e=>e.actionId||e.actionId2||e.actionId3||(e.lines?.length??0)>0),t=this.itemHeadingLevel===4?`h4`:`h3`;return e?E`
                <div class="list stacked ${this.compact?`compact`:``} ${this.columns>1?`grid`:``}"
                     style="${this.columns>1?`grid-template-columns: repeat(auto-fit, minmax(min(18rem, calc(100% / ${this.columns} - 1.5rem)), 1fr));`:``}">
                    ${this.items.map(e=>E`
                        <div role="button" tabindex="0" class="cell ${(e.lines?.length??0)>0?`with-lines`:``} ${this.rowActionId?`clickable`:``}"
                             @click="${()=>this.rowClicked(e)}" @keydown="${R(()=>this.rowClicked(e))}">
                            <div class="cell-title-row">
                                ${t===`h4`?E`<h4 class="cell-title">${e.title}</h4>`:E`<h3 class="cell-title">${e.title}</h3>`}
                                ${e.status?E`<span class="chip ${e.statusColor??``}">${e.status}</span>`:y}
                            </div>
                            ${e.description?E`<span class="cell-description">${e.description}</span>`:y}
                            ${(e.lines??[]).map(e=>E`<span class="cell-line">${e}</span>`)}
                            ${e.actionId||e.actionId2||e.actionId3?E`
                                <div class="cell-actions">
                                    ${this.renderItemAction(e,e.actionLabel,e.actionId,e.actionIcon)}
                                    ${this.renderItemAction(e,e.actionLabel2,e.actionId2,e.actionIcon2)}
                                    ${this.renderItemAction(e,e.actionLabel3,e.actionId3,e.actionIcon3)}
                                </div>`:y}
                        </div>
                    `)}
                </div>
            `:E`
            <div class="list ${this.compact?`compact`:``} ${this.frameless?`frameless`:``}">
                ${this.items.map(e=>E`
                    <div role="button" tabindex="0" class="row ${this.rowActionId?`clickable`:``}"
                         @click="${()=>this.rowClicked(e)}" @keydown="${R(()=>this.rowClicked(e))}">
                        ${e.avatar?E`<span class="avatar">${e.avatar}</span>`:e.icon?E`<span class="icon">${e.icon}</span>`:y}
                        <div class="body">
                            <span class="title">${e.title}</span>
                            ${e.description?E`<span class="description">${e.description}</span>`:y}
                        </div>
                        ${e.status?E`<span class="chip ${e.statusColor??``}">${e.status}</span>`:y}
                    </div>
                `)}
            </div>
        `}};A([b({type:Array})],oa.prototype,`items`,void 0),A([b({type:Boolean})],oa.prototype,`compact`,void 0),A([b({type:Boolean})],oa.prototype,`frameless`,void 0),A([b()],oa.prototype,`rowActionId`,void 0),A([b({type:Number})],oa.prototype,`columns`,void 0),A([b({type:Number})],oa.prototype,`itemHeadingLevel`,void 0),oa=A([_(`mateu-status-list`)],oa);var sa=e=>{let t=e.metadata;return E`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                columns="${t.columns??0}"
                itemHeadingLevel="${t.itemHeadingLevel??3}"
                rowActionId="${C(t.rowActionId??void 0)}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-status-list>
    `},ca=class extends x{constructor(...e){super(...e),this.items=[]}static{this.styles=g`
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
    `}render(){return E`
            <ul>
                ${this.items.map(e=>E`<li>${e}</li>`)}
            </ul>
        `}};A([b({type:Array})],ca.prototype,`items`,void 0),ca=A([_(`mateu-bulleted-list`)],ca);var la=e=>E`
        <mateu-bulleted-list
                .items="${e.metadata.items??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-bulleted-list>
    `,ua=e=>{let t=e.metadata.attributes?.[`data-colspan`];return E`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??``}"
            class="${e.cssClasses??y}"
            id="${C(e.id??void 0)}"
            data-colspan="${C(t)}"
            slot="${e.slot??y}"/>
    `},da={info:`ℹ`,success:`✓`,warning:`!`,danger:`!`},V=class extends x{constructor(...e){super(...e),this.text=``,this.theme=`info`,this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}static{this.styles=g`
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
    `}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){let e=!!this.text&&!!this.text.trim();if(!e&&!this.hasContent)return E``;let t=[`info`,`success`,`warning`,`danger`].includes(this.theme)?this.theme:`info`;return E`
            <div class="notice ${t} ${this.slim?`slim`:``}">
                ${this.noIcon?y:E`<span class="icon ${this.icon?`custom`:``}">${this.icon||da[t]}</span>`}
                <div class="body ${this.inlineContent?`inline`:``}">
                    ${e?E`<span class="text">${this.text}</span>`:y}
                    ${this.hasContent?E`<div class="content"><slot></slot></div>`:y}
                </div>
                ${this.actionLabel&&this.actionId?E`<button class="notice-action" @click="${()=>this.runAction()}">${this.actionLabel}</button>`:this.status?E`<span class="status">${this.status}</span>`:y}
            </div>
        `}};A([b()],V.prototype,`text`,void 0),A([b()],V.prototype,`theme`,void 0),A([b()],V.prototype,`icon`,void 0),A([b({type:Boolean})],V.prototype,`noIcon`,void 0),A([b()],V.prototype,`actionLabel`,void 0),A([b()],V.prototype,`actionId`,void 0),A([b()],V.prototype,`status`,void 0),A([b({type:Boolean})],V.prototype,`slim`,void 0),A([b({type:Boolean})],V.prototype,`fullWidth`,void 0),A([b({type:Boolean})],V.prototype,`hasContent`,void 0),A([b({type:Boolean})],V.prototype,`inlineContent`,void 0),V=A([_(`mateu-notice`)],V);var fa=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=bt(s.text??``,r,i,a,o)??``,l=t.children??[];return E`
        <mateu-notice
                text="${c}"
                theme="${s.theme??`info`}"
                icon="${C(s.icon??void 0)}"
                ?noIcon="${s.noIcon??!1}"
                actionLabel="${C(s.actionLabel??void 0)}"
                actionId="${C(s.actionId??void 0)}"
                status="${C(s.status??void 0)}"
                ?slim="${s.slim??!1}"
                ?fullWidth="${s.fullWidth??!1}"
                ?inlineContent="${s.inlineContent??!1}"
                ?hasContent="${l.length>0}"
                data-colspan="${s.fullWidth?`99`:y}"
                style="${t.style??y}"
                class="${t.cssClasses??y}"
                slot="${t.slot??y}"
        >${l.map(t=>F(e,t,n,r,i,a,o))}</mateu-notice>
    `},pa=class extends x{constructor(...e){super(...e),this.groups=[]}static{this.styles=[Yi,z,g`
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
    `]}willUpdate(e){e.has(`groups`)&&(this.selectedId=this.groups.flatMap(e=>e.items??[]).find(e=>e.selected)?.id)}itemAction(e,t,n){e.stopPropagation(),t&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_item:n}},bubbles:!0,composed:!0}))}select(e){this.selectedId=e,this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_item:e}},bubbles:!0,composed:!0}))}render(){return E`
            <div class="rail">
                ${this.groups.map(e=>E`
                    <div class="group" role="listbox">
                        ${e.label?E`<span class="group-label">${e.label}</span>`:y}
                        ${(e.items??[]).map(e=>E`
                            <div role="option" tabindex="0" aria-selected="${e.id===this.selectedId}" class="card ${e.id===this.selectedId?`selected`:``}"
                                 @click="${()=>this.select(e.id)}" @keydown="${R(()=>this.select(e.id))}">
                                <span class="title">${e.title}</span>
                                <div class="meta">
                                    ${e.caption?E`<span class="caption">${e.caption}</span>`:y}
                                    ${(e.badges??[]).map(e=>E`<span class="chip ${e.color??``}">${e.label}</span>`)}
                                </div>
                                ${e.actionLabel&&e.actionId?E`
                                    <button class="item-action"
                                            @click="${t=>this.itemAction(t,e.actionId,e.id)}">${e.actionLabel}</button>
                                `:y}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};A([b()],pa.prototype,`actionId`,void 0),A([b({type:Array})],pa.prototype,`groups`,void 0),A([w()],pa.prototype,`selectedId`,void 0),pa=A([_(`mateu-task-queue`)],pa);var ma=e=>{let t=e.metadata;return E`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-task-queue>
    `},ha=class extends x{constructor(...e){super(...e),this.columns=0,this.items=[]}static{this.styles=[Yi,z,g`
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
    `]}willUpdate(e){e.has(`items`)&&(this.selectedId=this.items.find(e=>e.selected)?.id)}select(e){e.disabled||(this.selectedId=e.id,this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0})))}render(){return E`
            <div class="grid" style="${this.columns>0?`grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`:`grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));`}">
                ${this.items.map(e=>E`
                    <div role="button" tabindex="0" class="cell ${e.disabled?`disabled`:``} ${e.recommended?`recommended`:``} ${e.id===this.selectedId?`selected`:``}"
                         @click="${()=>this.select(e)}" @keydown="${R(()=>this.select(e))}">
                        ${e.recommended?E`<span class="tag">${this.recommendedLabel||`Recommended`}</span>`:y}
                        <span class="title">${e.title}</span>
                        ${e.subtitle?E`<span class="subtitle">${e.subtitle}</span>`:y}
                        ${e.statusLabel?E`<span class="chip ${e.statusColor??``}">${e.statusLabel}</span>`:y}
                        ${e.note?E`<span class="note ${e.noteColor??``}"><span class="dot"></span>${e.note}</span>`:y}
                    </div>
                `)}
            </div>
        `}};A([b()],ha.prototype,`actionId`,void 0),A([b({type:Number})],ha.prototype,`columns`,void 0),A([b()],ha.prototype,`recommendedLabel`,void 0),A([b({type:Array})],ha.prototype,`items`,void 0),A([w()],ha.prototype,`selectedId`,void 0),ha=A([_(`mateu-resource-grid`)],ha);var ga=e=>{let t=e.metadata;return E`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-resource-grid>
    `},H=class extends x{constructor(...e){super(...e),this.title=``,this.features=[],this.current=!1,this.added=!1}static{this.styles=g`
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
    `}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return E`
            <div class="card ${this.current?``:`offer`}">
                ${this.image?E`<img class="image" src="${this.image}" alt="${this.title}">`:y}
                ${this.tag&&this.image?E`<span class="tag">${this.tag}</span>`:y}
                <div class="body">
                    ${this.tag&&!this.image?E`<span class="tag static">${this.tag}</span>`:y}
                    <span class="title">${this.title}</span>
                    ${this.subtitle?E`<span class="subtitle">${this.subtitle}</span>`:y}
                    ${this.features.length?E`
                        <div class="features">
                            ${this.features.map(e=>E`<span class="feature">${e}</span>`)}
                        </div>
                    `:y}
                </div>
                <div class="footer">
                    ${this.current?this.currentLabel?E`<span class="current-label">${this.currentLabel}</span>`:y:this.actionLabel&&this.actionId?E`
                            <button class="${this.added?`added`:``}" @click="${()=>this.runAction()}">
                                <span>${this.added&&this.addedLabel||this.actionLabel}</span>
                                ${this.priceLabel?E`<span class="price">${this.priceLabel}</span>`:y}
                            </button>
                        `:y}
                </div>
            </div>
        `}};A([b()],H.prototype,`tag`,void 0),A([b()],H.prototype,`title`,void 0),A([b()],H.prototype,`subtitle`,void 0),A([b()],H.prototype,`image`,void 0),A([b({type:Array})],H.prototype,`features`,void 0),A([b()],H.prototype,`priceLabel`,void 0),A([b()],H.prototype,`actionLabel`,void 0),A([b()],H.prototype,`actionId`,void 0),A([b({type:Boolean})],H.prototype,`current`,void 0),A([b()],H.prototype,`currentLabel`,void 0),A([b({type:Boolean})],H.prototype,`added`,void 0),A([b()],H.prototype,`addedLabel`,void 0),H=A([_(`mateu-offer-card`)],H);var _a=e=>{let t=e.metadata;return E`
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
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-offer-card>
    `},va=class extends x{constructor(...e){super(...e),this.items=[],this.added=new Set}static{this.styles=g`
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
    `}willUpdate(e){e.has(`items`)&&(this.added=new Set(this.items.filter(e=>e.added).map(e=>e.id)))}total(){return this.items.filter(e=>e.id!=null&&this.added.has(e.id)).reduce((e,t)=>e+(t.price??0),0)}toggle(e){if(e.id==null)return;let t=new Set(this.added),n=!t.has(e.id);n?t.add(e.id):t.delete(e.id),this.added=t,this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_item:e.id,_added:n,_total:this.total()}},bubbles:!0,composed:!0}))}render(){return E`
            <div class="header">
                ${this.totalLabel?E`<span class="total-label">${this.totalLabel}:</span>`:y}
                <span class="total">${Qi(this.total(),this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(e=>{let t=e.id!=null&&this.added.has(e.id);return E`
                        <div class="card ${t?`added`:``}">
                            ${e.icon?E`<span class="icon">${e.icon}</span>`:y}
                            <span class="title">${e.title}</span>
                            ${e.description?E`<span class="description">${e.description}</span>`:y}
                            ${e.includedLabel?E`<span class="included">${e.includedLabel}</span>`:E`
                                    ${e.price==null?y:E`
                                        <span class="price">${Qi(e.price,this.currency)}${e.unit?` / ${e.unit}`:``}</span>
                                    `}
                                    <button class="toggle ${t?`on`:``}" @click="${()=>this.toggle(e)}"
                                            aria-pressed="${t}">${t?`✓`:`+`}</button>
                                `}
                        </div>
                    `})}
            </div>
        `}};A([b()],va.prototype,`totalLabel`,void 0),A([b()],va.prototype,`currency`,void 0),A([b()],va.prototype,`actionId`,void 0),A([b({type:Array})],va.prototype,`items`,void 0),A([w()],va.prototype,`added`,void 0),va=A([_(`mateu-addon-picker`)],va);var ya=e=>{let t=e.metadata;return E`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-addon-picker>
    `},ba=class extends x{constructor(...e){super(...e),this.lines=[]}static{this.styles=g`
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
    `}computedTotal(){return this.total==null?this.lines.filter(e=>!e.included).reduce((e,t)=>e+(t.amount??0),0):this.total}render(){return E`
            ${this.lines.map(e=>E`
                <div class="row">
                    <span class="dot"></span>
                    <span class="concept">${e.concept}</span>
                    ${e.included?E`<span class="included-label">${e.includedLabel||`Included`}</span>`:E`<span class="amount ${(e.amount??0)<0?`negative`:``}">${Qi(e.amount??0,this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel||`Total`}</span>
                <span class="total">${Qi(this.computedTotal(),this.currency)}</span>
            </div>
        `}};A([b()],ba.prototype,`currency`,void 0),A([b()],ba.prototype,`totalLabel`,void 0),A([b({type:Array})],ba.prototype,`lines`,void 0),A([b({type:Number})],ba.prototype,`total`,void 0),ba=A([_(`mateu-ledger`)],ba);var xa=e=>{let t=e.metadata;return E`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-ledger>
    `},Sa=class extends x{constructor(...e){super(...e),this.methods=[]}static{this.styles=g`
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
    `}willUpdate(e){e.has(`selected`)&&(this.selectedId=this.selected)}confirm(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_method:this.selectedId}},bubbles:!0,composed:!0}))}pick(e){this.selectedId=e,this.methodActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.methodActionId,parameters:{_method:e}},bubbles:!0,composed:!0}))}render(){return E`
            <div class="bar">
                <div class="methods">
                    ${this.methods.map(e=>E`
                        <button class="method ${e.id===this.selectedId?`selected`:``}"
                                @click="${()=>this.pick(e.id)}">${e.label}</button>
                    `)}
                </div>
                ${this.contextLabel||this.contextValue?E`
                    <div class="context">
                        ${this.contextLabel?E`<span class="label">${this.contextLabel}</span>`:y}
                        ${this.contextValue?E`<span class="value">${this.contextValue}</span>`:y}
                    </div>
                `:y}
                <span class="spacer"></span>
                ${this.confirmLabel&&this.actionId?E`<button class="confirm" @click="${()=>this.confirm()}">${this.confirmLabel}</button>`:y}
            </div>
        `}};A([b()],Sa.prototype,`actionId`,void 0),A([b()],Sa.prototype,`methodActionId`,void 0),A([b({type:Array})],Sa.prototype,`methods`,void 0),A([b()],Sa.prototype,`selected`,void 0),A([b()],Sa.prototype,`contextLabel`,void 0),A([b()],Sa.prototype,`contextValue`,void 0),A([b()],Sa.prototype,`confirmLabel`,void 0),A([w()],Sa.prototype,`selectedId`,void 0),Sa=A([_(`mateu-payment-picker`)],Sa);var Ca=e=>{let t=e.metadata;return E`
        <mateu-payment-picker
                .actionId="${t.actionId}"
                .methodActionId="${t.methodActionId}"
                .methods="${t.methods??[]}"
                .selected="${t.selected}"
                .contextLabel="${t.contextLabel}"
                .contextValue="${t.contextValue}"
                .confirmLabel="${t.confirmLabel}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-payment-picker>
    `},wa=class extends x{constructor(...e){super(...e),this.items=[]}static{this.styles=g`
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
    `}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return E`
            <div class="list">
                ${this.items.map(e=>E`
                    <div class="row">
                        <span class="dot ${e.status??`ok`}"></span>
                        <div class="body">
                            <span class="name">${e.name}</span>
                            ${e.systems?.length?E`<span class="systems">${e.systems.join(` · `)}</span>`:y}
                        </div>
                        <div class="counters">
                            <span class="counter ok">✓ ${e.ok??0} OK</span>
                            ${(e.warnings??0)>0?E`<span class="counter warning">⚠ ${e.warnings} warnings</span>`:y}
                            ${(e.errors??0)>0?E`<span class="counter error">⛔ ${e.errors} errors</span>`:y}
                        </div>
                        ${e.actionLabel&&e.actionId?E`<button @click="${()=>this.runAction(e)}">${e.actionLabel}</button>`:y}
                    </div>
                `)}
            </div>
        `}};A([b({type:Array})],wa.prototype,`items`,void 0),wa=A([_(`mateu-process-monitor`)],wa);var Ta=e=>E`
        <mateu-process-monitor
                .items="${e.metadata.items??[]}"
                style="${e.style??y}"
                class="${e.cssClasses??y}"
                slot="${e.slot??y}"
        ></mateu-process-monitor>
    `,Ea=(e,t)=>{let n=e.style;return e.id&&(n&&!n.endsWith(`;`)&&(n+=`;`),n??=``,t[e.id+`.hidden`]==1&&(n+=`display: none;`)),n},Da=(e,t)=>{let n={...e.metadata};if(e.id&&n){if(n.type==M.Button){let r=n;t[e.id+`.disabled`]==1&&(r.disabled=!0)}if(n.type==M.FormField){let r=n;t[e.id+`.disabled`]==1&&(r.disabled=!0)}}return n},U=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),Oa={[M.Bpmn]:({component:e})=>Wr(e),[M.Workflow]:({component:e})=>Kr(e),[M.FormEditor]:({component:e})=>qr(e),[M.Page]:U(Hr),[M.Div]:U(Fr),[M.Directory]:({component:e,baseUrl:t,state:n,data:r})=>Nr(e,t,n,r),[M.FormLayout]:U(yn),[M.HorizontalLayout]:U(Tn),[M.VerticalLayout]:U(En),[M.SplitLayout]:U(Dn),[M.MasterDetailLayout]:U(On),[M.TabLayout]:U(kn),[M.AccordionLayout]:U(An),[M.BoardLayout]:U(Fn),[M.BoardLayoutRow]:U(In),[M.BoardLayoutItem]:U(Ln),[M.Scroller]:U(Mn),[M.FullWidth]:U(Nn),[M.Container]:U(Pn),[M.Form]:({container:e,component:t,baseUrl:n,state:r,data:i,appState:a,appData:o})=>{let s=t.metadata;return E`<mateu-form
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
            slot="${t.slot??y}"
            >
                ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
            ${s?.buttons?.map(t=>E`
               ${F(e,{id:t.actionId,metadata:t,type:j.ClientSide,slot:`buttons`},void 0,r,i,a,o)}
`)}

            </mateu-form>`},[M.Table]:({component:e,state:t,data:n})=>Vn(e,(e.id?n?.[e.id]:void 0)?.page?.content??Hn(e,t)),[M.Crud]:U(Ur),[M.App]:({container:e,component:t,baseUrl:n,state:r,data:i,appState:a,appData:o})=>E`
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
             ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
         </mateu-app>`,[M.Element]:({container:e,component:t,state:n,data:r,appState:i,appData:a})=>er(e,t.metadata,t,n,r,i,a),[M.FormField]:({component:e,state:t})=>Br(e,t),[M.Text]:({component:e,state:t,data:n,appState:r,appData:i})=>nr(e,t,n,r,i),[M.Avatar]:({component:e,state:t,data:n})=>Et(e,t,n),[M.Chat]:({component:e,state:t,data:n})=>Gr(e,t,n),[M.AvatarGroup]:({component:e})=>Ot(e),[M.Badge]:({component:e,state:t,data:n})=>kt(e,t,n),[M.Breadcrumbs]:({component:e})=>jr(e),[M.Anchor]:({component:e})=>rr(e),[M.Button]:({component:e,state:t,data:n})=>ur(e,t,n),[M.Card]:U(fr),[M.Chart]:({component:e})=>pr(e),[M.Icon]:({component:e})=>mr(e),[M.ConfirmDialog]:U(yr),[M.ContextMenu]:U(Kn),[M.CookieConsent]:({component:e})=>br(e),[M.Details]:U(xr),[M.Dialog]:({component:e,baseUrl:t,state:n,data:r,appState:i,appData:a})=>Sr(e,t,n,r,i,a),[M.Drawer]:({component:e,baseUrl:t,state:n,data:r,appState:i,appData:a})=>Cr(e,t,n,r,i,a),[M.Image]:({component:e})=>Ar(e),[M.Map]:({component:e})=>kr(e),[M.Markdown]:({component:e})=>Tr(e),[M.MicroFrontend]:({component:e})=>wr(e),[M.Notification]:({component:e})=>Er(e),[M.ProgressBar]:({component:e,state:t})=>Dr(e,t),[M.Popover]:U(Or),[M.CarouselLayout]:U(Mr),[M.Tooltip]:U(Yn),[M.MessageInput]:({component:e})=>Jn(e),[M.MessageList]:({component:e})=>Un(e),[M.CustomField]:U(qn),[M.MenuBar]:({container:e,component:t,baseUrl:n,state:r,data:i})=>Gn(e,t,n,r,i),[M.Grid]:({component:e,state:t})=>Vn(e,Hn(e,t)),[M.VirtualList]:U(Rn),[M.FormSection]:U(Ir),[M.FormSubSection]:U(Lr),[M.MetricCard]:({component:e})=>Qr(e),[M.Scoreboard]:U($r),[M.DashboardPanel]:U(ei),[M.DashboardLayout]:U(ti),[M.FoldoutLayout]:U(ri),[M.ContentLayout]:U(ii),[M.HeroSection]:U(ai),[M.EmptyState]:({component:e})=>Bt(e),[M.Skeleton]:({component:e})=>Vt(e),[M.Gantt]:({component:e})=>ci(e),[M.PlanningBoard]:({component:e})=>ui(e),[M.Kanban]:({component:e})=>fi(e),[M.Timeline]:({component:e})=>mi(e),[M.ProgressSteps]:({component:e})=>gi(e),[M.Stat]:({component:e})=>vi(e),[M.Calendar]:({component:e})=>bi(e),[M.PricingTable]:({component:e})=>Si(e),[M.OrgChart]:({component:e})=>wi(e),[M.Heatmap]:({component:e})=>Di(e),[M.Funnel]:({component:e})=>ki(e),[M.TrendChart]:({component:e})=>ji(e),[M.FeatureGrid]:({component:e})=>Ni(e),[M.Testimonials]:({component:e})=>Fi(e),[M.Faq]:({component:e})=>Li(e),[M.CalloutCard]:({component:e})=>zi(e),[M.CommentThread]:({component:e})=>Vi(e),[M.FileList]:({component:e})=>Wi(e),[M.Checklist]:({component:e})=>Ki(e),[M.ComparisonCard]:({component:e})=>Ji(e),[M.EntityHeader]:({component:e})=>ta(e),[M.Meter]:({component:e})=>ra(e),[M.TaskProgress]:({component:e})=>aa(e),[M.StatusList]:({component:e})=>sa(e),[M.BulletedList]:({component:e})=>la(e),[M.Separator]:({component:e})=>ua(e),[M.Notice]:U(fa),[M.TaskQueue]:({component:e})=>ma(e),[M.ResourceGrid]:({component:e})=>ga(e),[M.OfferCard]:({component:e})=>_a(e),[M.AddOnPicker]:({component:e})=>ya(e),[M.Ledger]:({component:e})=>xa(e),[M.PaymentPicker]:({component:e})=>Ca(e),[M.ProcessMonitor]:({component:e})=>Ta(e)},ka=(e,t,n,r,i,a,o,s)=>{if(!t?.metadata)return t==null?(console.warn(`No metadata for component`,t),E`<p>No metadata for component</p>`):ka(e,{id:D(),metadata:t,type:j.ClientSide},n,r,i,a,o,s);let c=t.metadata.type,l={...t,style:Ea(t,i),metadata:Da(t,i)},u=Oa[c];return u?u({container:e,component:l,baseUrl:n,state:r,data:i,appState:a,appData:o,labelAlreadyRendered:s}):E`<p ${l?.slot??y}>Unknown metadata type ${c} for component ${l?.id}</p>`},Aa=function(e){return e.NONE=`NONE`,e.INFO=`INFO`,e.SUCCESS=`SUCCESS`,e.WARNING=`WARNING`,e.DANGER=`DANGER`,e}({}),ja=(e,t,n)=>{let r=e[n.path];return r?E`<span theme="badge pill ${Ma(r.type)}">${r.message}</span>`:E``},Ma=e=>{switch(e){case Aa.SUCCESS:return`success`;case Aa.WARNING:return`warning`;case Aa.DANGER:return`error`;case Aa.NONE:return`contrast`}return``},W=class extends x{constructor(...e){super(...e),this.id=``,this.baseUrl=``,this.state={},this.data={},this.appState={},this.appData={},this.respondToVisibility=(e,t)=>{var n={root:document.documentElement};new IntersectionObserver(e=>{e.forEach(e=>{t(e.intersectionRatio>0)})},n).observe(e)},this.keepAsking=!1,this.askToUpper=()=>{let e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent(`fetch-more-elements`,{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?ka(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?E`<div class="neutral-card">
                ${e.image?E`<img class="card-media" src="${e.image}" alt="" />`:y}
                <div class="card-body">
                    <div class="card-head">
                        ${e.title?E`<span class="card-title">${e.title}</span>`:y}
                        ${e.status?E`<span theme="badge ${Ma(e.status.type)}">${e.status.message}</span>`:y}
                    </div>
                    ${e.subtitle?E`<div class="card-subtitle">${e.subtitle}</div>`:y}
                    ${e.content?E`<div>${e.content}</div>`:y}
                </div>
        </div>`:E`${e}`,this.hasMore=!1,this.clickedOnCard=e=>{this.state[this.id+`_selected_items`]=[e],this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0}))}}updated(e){super.updated(e);let t=this.data[this.id]?.page;this.hasMore=t?.content?.length<t?.totalElements}firstUpdated(e){super.firstUpdated(e),this.respondToVisibility(this.askForMore,e=>{this.keepAsking=e,e&&this.askToUpper()})}render(){return E`
            <div class="card-container">
                ${(this.data[this.id]?.page)?.content?.map(e=>E`<div role="button" tabindex="0" @click="${()=>this.clickedOnCard(e)}" @keydown="${R(()=>this.clickedOnCard(e))}" class="car-container">${this.renderItem(e)}</div>`)}
                <div id="ask-for-more" style="display: ${this.hasMore?`flex`:`none`}; width: 100%; justify-content: center; padding: var(--lumo-space-m); color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Loading more…</div>
            </div>

            <slot></slot>
       `}static{this.styles=g`
        ${ue}
        
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
    
        ${z}
    `}};A([b()],W.prototype,`id`,void 0),A([b()],W.prototype,`metadata`,void 0),A([b()],W.prototype,`baseUrl`,void 0),A([b()],W.prototype,`state`,void 0),A([b()],W.prototype,`data`,void 0),A([b()],W.prototype,`appState`,void 0),A([b()],W.prototype,`appData`,void 0),A([b()],W.prototype,`emptyStateMessage`,void 0),A([w()],W.prototype,`keepAsking`,void 0),A([S(`#ask-for-more`)],W.prototype,`askForMore`,void 0),A([w()],W.prototype,`hasMore`,void 0),W=A([_(`mateu-card-list`)],W);var Na={show:e=>console.debug(`[mateu] no notifier registered, dropping toast:`,e.text)};function Pa(e){Na=e}function Fa(e,t){Na.show(e,t)}var Ia=function(e){return e.none=`none`,e.success=`success`,e.error=`error`,e.warning=`warning`,e.contrast=`contrast`,e.normal=`normal`,e}({}),La=function(e){return e.primary=`primary`,e.secondary=`secondary`,e.tertiary=`tertiary`,e.tertiaryInline=`tertiaryInline`,e}({});function Ra(e){if(e.weight!=null)return e.weight;let t=e.stereotype??``;if(t===`icon`)return 1;if(t===`image`)return 4;if(t===`html`||t===`richText`||t===`markdown`||t===`textarea`)return 5;if(t===`link`)return 2.5;if(t===`combobox`||t===`select`)return 2;let n=e.dataType??``;return n===`bool`?1:n===`status`||n===`integer`?1.5:n===`number`||n===`date`||n===`money`?2:n===`dateTime`||n===`dateRange`?2.5:3}function za(e,t){if(e.length===0)return`table`;let n=e.reduce((e,t)=>e+Ra(t),0)/(t/76);if(n<=1.1)return`table`;if(n>1.6||e.length>10)return`masterDetail`;let r=e.filter(e=>e.identifier||(e.priority??2**53-1)<=2),i=r.reduce((e,t)=>e+Ra(t),0);return r.length>0&&i<=8?`list`:e.some(e=>e.stereotype===`image`||e.stereotype===`html`)||r.length===0&&e.length>=4&&e.length<=8?`cards`:`masterDetail`}function Ba(e){return e.filter(e=>e.identifier||(e.priority??2**53-1)<=2).sort((e,t)=>(e.priority??2**53-1)-(t.priority??2**53-1))}function Va(e){let t=Ba(e);return t.length>0?t:e.slice(0,3)}var Ha,Ua={asc:`ascending`,desc:`descending`},G=class extends x{static{Ha=this}constructor(...e){super(...e),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this._columnPrefsRevision=0,this._prefsRevisionApplied=-1,this.pendingMeasure=!0,this.corrections=0,this.windowResizeListener=()=>this.scheduleMeasure(),this.search=()=>{this.beginLoading();let e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`search`,parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{Fa({text:e,position:`bottomEnd`,variant:`error`,duration:3e3},this)},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};let t=this.component.metadata;if(this._syncStateToUrl(t),t.rowsSource){this._fetchRowsFromRest(t,e);return}!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.beginLoading(),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`search`,parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this._fetchRowsFromRest=(e,t)=>{let n=this.cols.map(e=>e.id).filter(Boolean),r=e.rowsSource;(r.proxy?new Promise(e=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`__restfetch__`,parameters:{_sourceKind:`rows`,_sourceId:this.id},callback:t=>e(dn(t?.appData?._restfetch,r.itemsPath,n)),callbackonly:!0},bubbles:!0,composed:!0}))}):mn(r,n,e=>N(e,this.state,this.data))).then(r=>{let i=String(this.state?.searchText??``).trim().toLowerCase(),a=i?r.filter(e=>n.some(t=>String(e[t]??``).toLowerCase().includes(i))):r,o=e.pageSize&&e.pageSize>0?e.pageSize:a.length||1,s=Number(this.state?.page??0),c=a.slice(s*o,s*o+o);this.data={...this.data,[this.id]:{page:{totalElements:a.length,pageSize:o,pageNumber:s,content:c}}},this.requestUpdate(),t?.()}).catch(e=>{console.warn(`mateu: external rows fetch failed`,e),t?.()})},this.fetchMoreElements=e=>{let{params:t,callback:n}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(n)},this.directionChanged=e=>{let t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(e=>({fieldId:e.__data.path,direction:e.__data.direction?Ua[e.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>N(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e===`import`){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{let t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`process-import`,parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get columnPrefsScope(){return window.location.pathname}get effectiveComponent(){let e=this.component,t=e?.metadata;if(!e||!t?.columns)return e;if(this._prefsSource===e&&this._prefsRevisionApplied===this._columnPrefsRevision)return this._prefsApplied;let n=en(this.columnPrefsScope),r=an(t.columns,n,e=>e.metadata??{});return this._prefsApplied=r===t.columns?e:{...e,metadata:{...t,columns:r}},this._prefsSource=e,this._prefsRevisionApplied=this._columnPrefsRevision,this._prefsApplied}get columnChooserEntries(){return(this.component?.metadata?.columns??[]).map(e=>{let t=e.metadata??{},n=t.id??e.id;return n?{id:n,label:t.label??n,protected:rn(t)}:void 0}).filter(e=>!!e)}renderColumnChooser(){let e=this.columnChooserEntries;return e.filter(e=>!e.protected).length===0?y:E`
            <mateu-column-chooser
                .columns="${e}"
                .scope="${this.columnPrefsScope}"
                @column-prefs-changed="${e=>{e.stopPropagation(),this._columnPrefsRevision++}}"
            ></mateu-column-chooser>
        `}get cols(){return(this.effectiveComponent?.metadata)?.columns?.map(e=>e.metadata)??[]}get identifierFieldName(){let e=this.cols.find(e=>e.identifier);return e?e.id:this.cols.find(e=>e.id===`id`)?.id}get effectiveGridLayout(){let e=this.component?.metadata,t=e?.gridLayout??`auto`;return t===`auto`?e?.crudlType===`card`?`cards`:za(this.cols,this.availableWidthPx):t}scheduleMeasure(){this.pendingMeasure=!0,this.corrections=0,this.fillHeightPx==null?this.requestUpdate():this.fillHeightPx=void 0}measureFill(){if(!this.pendingMeasure||this.fillHeightPx!=null)return;let e=this.renderRoot?.querySelector?.(`[data-crud-box]`);if(!e)return;if(this.closest?.(`mateu-dialog, mateu-drawer`)){this.pendingMeasure=!1;return}let t=e.getBoundingClientRect().top,n=Math.round(window.innerHeight-t-this.measureBottomInset(e)-Ha.BOTTOM_GUTTER_PX);this.pendingMeasure=!1,n>=Ha.MIN_FILL_PX&&(this.fillHeightPx=n)}trimOverflow(){if(this.fillHeightPx==null||this.pendingMeasure||this.corrections>=Ha.MAX_CORRECTIONS)return;let e=document.documentElement.scrollHeight-window.innerHeight;e<=1||e>Ha.MAX_SLIVER_PX||(this.corrections++,this.fillHeightPx=Math.max(Ha.MIN_FILL_PX,this.fillHeightPx-e))}measureBottomInset(e){let t=e,n=0;for(let e=0;t&&e<20;e++){n+=parseFloat(getComputedStyle(t).marginBottom)||0;let e=t.getRootNode(),r=t.assignedSlot??t.parentElement??e.host??null;if(!r||r===document.documentElement||r===document.body)break;let i=getComputedStyle(r);n+=(parseFloat(i.paddingBottom)||0)+(parseFloat(i.borderBottomWidth)||0);let a=parseFloat(i.rowGap)||0;for(let e=t.nextElementSibling;e;e=e.nextElementSibling){let t=getComputedStyle(e);n+=e.getBoundingClientRect().height+(parseFloat(t.marginTop)||0)+(parseFloat(t.marginBottom)||0)+a}t=r}return Math.round(n)}static{this.BOTTOM_GUTTER_PX=16}static{this.MAX_SLIVER_PX=64}static{this.MAX_CORRECTIONS=3}static{this.MIN_FILL_PX=320}boxStyle(){let e=`border: var(--mateu-section-border, none); background: var(--mateu-section-bg, transparent); overflow: hidden; padding: var(--mateu-section-padding, 0); display: flex; flex-direction: column;`;return this.fillHeightPx==null?`${e} max-height: calc(100dvh - 12rem);`:`${e} height: ${this.fillHeightPx}px;`}connectedCallback(){super.connectedCallback(),window.addEventListener(`resize`,this.windowResizeListener),this.resizeObserver=new ResizeObserver(e=>{let t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.loadingTimer),window.removeEventListener(`resize`,this.windowResizeListener),this.resizeObserver?.disconnect()}static{this.LOADING_VALVE_MS=15e3}get awaitingRows(){return this.loadingSince!=null&&Date.now()-this.loadingSince<Ha.LOADING_VALVE_MS}beginLoading(){this.loadingSince=Date.now(),clearTimeout(this.loadingTimer),this.loadingTimer=setTimeout(()=>this.requestUpdate(),Ha.LOADING_VALVE_MS)}endLoading(){this.loadingSince=void 0,clearTimeout(this.loadingTimer)}_filterIds(e){return new Set([`searchText`,...(e.filters??[]).flatMap(e=>e.stereotype===`dateRange`||e.stereotype===`numberRange`?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])])}_syncStateToUrl(e){let t=this._filterIds(e),n=new URLSearchParams(window.location.search);t.forEach(e=>n.delete(e)),n.delete(`page`),n.delete(`sort`),t.forEach(e=>{let t=this.state[e];t!=null&&t!==``&&n.set(e,String(t))});let r=this.state.page;r&&r>0&&n.set(`page`,String(r));let i=this.state.sort;if(i&&i.length>0){let e=i.filter(e=>e.fieldId&&e.direction).map(e=>`${e.fieldId}:${e.direction}`).join(`,`);e&&n.set(`sort`,e)}let a=n.toString(),o=a?`${window.location.pathname}?${a}`:window.location.pathname;window.location.pathname+window.location.search!==o&&history.replaceState(null,``,o)}_initStateFromUrl(e,t){let n=new URLSearchParams(window.location.search),r=this._filterIds(e),i={...t};n.forEach((e,t)=>{r.has(t)&&(i[t]=e)});let a=n.get(`page`);if(a!==null){let e=parseInt(a,10);!isNaN(e)&&e>0&&(i.page=e)}let o=n.get(`sort`);if(o){let e=o.split(`,`).map(e=>{let[t,n]=e.split(`:`);return t&&n?{fieldId:t,direction:n}:null}).filter(Boolean);e.length>0&&(i.sort=e)}return i}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has(`component`)?this.scheduleMeasure():(this.measureFill(),this.trimOverflow()),this.data?.[this.id]==null?this.loadingSince==null&&this._initializedForComponentId!=null&&!this.awaitingRows&&this.beginLoading():this.endLoading(),e.has(`component`)){let e=this.component?.id;if(e!==this._initializedForComponentId){this._initializedForComponentId=e;let t=this.component?.metadata,n=t.initialPage&&t.initialPage>0?t.initialPage:0;this.state=this._initStateFromUrl(t,{...this.state,size:t.pageSize,page:n,sort:[]}),(this.state.page!==n||this.state.sort?.length>0||[...this._filterIds(t)].some(e=>this.state[e]!=null)||t.rowsSource)&&this.handleSearchRequested(void 0)}}}render(){let e=e=>{let t=[];return e.color&&e.color!==Ia.normal&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle===La.tertiaryInline?`tertiary-inline`:e.buttonStyle),t.length?t.join(` `):void 0},t=e=>e===`back`||e===`backToList`||!!e&&e.startsWith(`cancel`),n=t=>P.get()?.renderToolbarButton?.(t,this.evalLabel(t.label),()=>this.handleToolbarButtonClick(t.actionId))||E`
                <button class="crud-btn"
                        data-action-id="${t.id}"
                        theme="${e(t)||y}"
                        @click="${()=>this.handleToolbarButtonClick(t.actionId)}"
                >${this.evalLabel(t.label)}</button>
            `;if(!this.component)return E`no component`;let r=this.effectiveComponent,i=r.metadata;i.serverSideOrdering=!0;let a=(()=>{let e=this;for(;e;){let t=e;if(t.tagName===`MATEU-PAGE`)return(t.component?.metadata?.toolbar?.length??0)>0;e=t.parentElement??(t.getRootNode?.()instanceof ShadowRoot?t.getRootNode().host:null)}return!1})()?[]:i?.toolbar??[],o=a.filter(e=>t(e.actionId)),s=a.filter(e=>!t(e.actionId)),c=o.length>0&&s.length>0,l=!!i?.title||!!i?.subtitle||a.length>0,u=this.effectiveGridLayout,d=this.cols,f=Ba(d),p=this.data[this.id]?.page?.content??[],m=this.state[this.component?.id]?.emptyStateMessage,h=(e,t)=>{let n=t[e.id];return n==null?E``:e.dataType===`status`?E`<span theme="badge pill ${Ma(n.type)}">${n.message}</span>`:e.dataType===`bool`?E`${n?`✓`:`✗`}`:typeof n==`object`?E`${n.label??n.name??n.message??``}`:E`${n}`},ee=()=>{let e=this.identifierFieldName,t=this.state._selectedId??this.appState?._splitDetailId,n=f.find(e=>e.identifier)??f[0],r=e=>e.dataType===`action`||e.dataType===`actionGroup`||e.dataType===`menu`||e.stereotype===`button`,i=f.filter(e=>e!==n&&!r(e)),a=d.filter(e=>r(e)),o=(e,t,n)=>{e.stopPropagation(),e.currentTarget.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_clickedRow:n}},bubbles:!0,composed:!0}))},s=e=>{let t=[];for(let n of a){let r=e[n.id];if(n.dataType===`action`){let i=r?.methodNameInCrud?r:e.action?.methodNameInCrud?e.action:{methodNameInCrud:n.id,label:n.label,icon:null,disabled:!1};t.push(E`
                            <button class="crud-btn" theme="tertiary small" title="${i.label||y}"
                                @click="${t=>o(t,`action-on-row-`+i.methodNameInCrud,e)}">
                                ${i.icon?I(i.icon):y}
                                ${i.label??y}
                            </button>`)}else(n.dataType===`actionGroup`||n.dataType===`menu`)&&(r?.actions??[]).forEach(n=>t.push(E`
                            <button class="crud-btn" theme="tertiary small" title="${n.label||y}"
                                @click="${t=>o(t,`action-on-row-`+n.methodNameInCrud,e)}">
                                ${n.icon?I(n.icon):y}
                                ${n.label??y}
                            </button>`))}return t.length?E`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${t}
                    </div>`:y};return E`
                <div class="m-listbox" style="width: 100%;">
                    ${p.length===0?E`<div class="m-item" disabled>${zt(m)}</div>`:y}
                    ${p.map(r=>E`
                        <div role="button" tabindex="0" class="m-item"
                            ?selected="${e&&t!==void 0&&String(r[e])===String(t)}"
                            @click="${()=>{e&&r[e]!==void 0&&(this.state={...this.state,_selectedId:String(r[e])}),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`view`,parameters:r},bubbles:!0,composed:!0}))}}" @keydown="${R(()=>{e&&r[e]!==void 0&&(this.state={...this.state,_selectedId:String(r[e])}),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`view`,parameters:r},bubbles:!0,composed:!0}))})}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${n?r[n.id]??``:``}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${i.map(e=>E`<span>${e.label}: ${h(e,r)}</span>`)}
                            </div>
                            ${s(r)}
                        </div>
                    `)}
                </div>`},te=(e,t,n)=>{let r=this.identifierFieldName;r&&n[r]!==void 0&&(this.state={...this.state,_selectedId:String(n[r])}),e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:n},bubbles:!0,composed:!0}))},g=()=>{let e=this.identifierFieldName,t=this.state._selectedId??this.appState?._splitDetailId,n=e=>!!e.actionId,r=e=>e.dataType===`action`||e.dataType===`actionGroup`||e.dataType===`menu`||e.stereotype===`button`,i=[...d.slice(0,6),...d.slice(6).filter(e=>r(e)||e.dataType===`status`)],a=i.filter(e=>e.stereotype===`image`),o=i.find(e=>e.identifier)??i[0],s=i.find(e=>e.id===`select`&&e.dataType===`action`),c=!!s,l=i.filter(e=>e!==o&&!a.includes(e)&&!n(e)&&!r(e)),u=i.filter(e=>r(e)&&!(c&&e===s)),f=(e,t,n)=>{e.stopPropagation(),e.currentTarget.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_clickedRow:n}},bubbles:!0,composed:!0}))},ee=e=>{let t=[];for(let n of u){let r=e[n.id];if(n.dataType===`action`){let i=r?.methodNameInCrud?r:e.action?.methodNameInCrud?e.action:{methodNameInCrud:n.id,label:n.label,icon:null,disabled:!1};t.push(E`
                            <button class="crud-btn" theme="tertiary" title="${i.label||y}"
                                @click="${t=>f(t,`action-on-row-`+i.methodNameInCrud,e)}">
                                ${i.icon?I(i.icon):y}
                                ${i.label??y}
                            </button>`)}else(n.dataType===`actionGroup`||n.dataType===`menu`)&&(r?.actions??[]).forEach(n=>t.push(E`
                            <button class="crud-btn" theme="tertiary" title="${n.label||y}"
                                @click="${t=>f(t,`action-on-row-`+n.methodNameInCrud,e)}">
                                ${n.icon?I(n.icon):y}
                                ${n.label??y}
                            </button>`))}return t.length?E`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${t}
                    </div>`:y};return E`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${p.length===0?E`<div style="grid-column: 1 / -1;">${zt(m)}</div>`:y}
                    ${p.map(n=>E`
                        <div role="button" tabindex="0" class="crud-card"
                            ?data-selected="${e&&t!==void 0&&String(n[e])===String(t)}"
                            style="cursor: pointer;"
                            @click="${e=>c?f(e,`action-on-row-select`,n):te(e.target,`view`,n)}" @keydown="${R(e=>c?f(e,`action-on-row-select`,n):te(e.target,`view`,n))}"
                        >
                            ${a.length?E`<img src="${n[a[0].id]??``}" alt="" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: var(--lumo-border-radius-m, 8px);" />`:y}
                            ${o?E`<div class="crud-card-title">${n[o.id]??``}</div>`:y}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${l.map(e=>E`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${e.label}</span>
                                        <span>${h(e,n)}</span>
                                    </div>
                                `)}
                            </div>
                            ${ee(n)}
                        </div>
                    `)}
                </div>`},_=()=>{let e=Va(d),t=e.find(e=>e.identifier)??e[0],n=e.filter(e=>e!==t);return E`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <div class="m-listbox" style="width: 100%;">
                            ${p.length===0?E`<div class="m-item" disabled>${zt(m)}</div>`:y}
                            ${p.map(e=>E`
                                <div role="button" tabindex="0" class="m-item"
                                    ?selected="${this.selectedItem===e}"
                                    @click="${()=>{this.selectedItem=e}}" @keydown="${R(()=>{this.selectedItem=e})}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${t?e[t.id]??``:``}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${n.map(t=>E`${h(t,e)} `)}
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?E`
                            <div class="m-formlayout">
                                ${d.map(e=>E`
                                    <label style="display: flex; flex-direction: column; gap: .1rem; font-size: var(--lumo-font-size-s, .875rem);">
                                        <span style="color: var(--lumo-secondary-text-color, #667);">${e.label}</span>
                                        <span>${String(this.selectedItem[e.id]??``)}</span>
                                    </label>
                                `)}
                            </div>
                        `:E`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},v=()=>{let e=this.identifierFieldName,t=this.state._selectedId??this.appState?._splitDetailId,n=d[0],r=d.slice(1),i=!!n?.actionId,a=e=>(e??[]).map(e=>{let t=Array.isArray(e.children)?e.children:[];return t.length>0?{...e,children:a(t)}:{...e,children:void 0}}),o=a(p),s=(t,n,r)=>{t.stopPropagation(),e&&n[e]!==void 0&&(this.state={...this.state,_selectedId:String(n[e])}),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:r,parameters:n},bubbles:!0,composed:!0}))},c=(a,o)=>E`
                <tr class="${e&&t!==void 0&&String(a[e])===String(t)?`selected`:``}"
                    style="cursor: pointer;" @click="${e=>s(e,a,`view`)}">
                    ${n?E`<td style="padding-left: ${o*1.2+.6}rem;">${a[n.id]??``}</td>`:y}
                    ${r.map(e=>e.id===`select`?E`<td><button class="crud-btn small" @click="${e=>{e.stopPropagation(),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`action-on-row-select`,parameters:{_clickedRow:a}},bubbles:!0,composed:!0}))}}">Select</button></td>`:E`<td>${a[e.id]??``}</td>`)}
                    ${i?E`<td style="text-align: end;">${a?.viewable===!1?y:E`<button class="crud-btn small" @click="${e=>s(e,a,`view`)}">View</button>`}</td>`:y}
                </tr>
                ${(a.children??[]).map(e=>c(e,o+1))}
            `;return E`
                <table class="crud-table">
                    <thead><tr>
                        ${n?E`<th>${n.label??y}</th>`:y}
                        ${r.map(e=>E`<th>${e.label??y}</th>`)}
                        ${i?E`<th></th>`:y}
                    </tr></thead>
                    <tbody>
                        ${o.length===0?E`<tr><td colspan="99" style="padding: 1.5rem; text-align: center; color: var(--lumo-secondary-text-color, #888);">${zt(m)}</td></tr>`:y}
                        ${o.map(e=>c(e,0))}
                    </tbody>
                </table>`},ne=P.get()?.rendersCrudLayouts?.()===!0,b=p.length===0&&this.awaitingRows?E`
            <div role="status" aria-live="polite" aria-busy="true"
                 style="padding: var(--lumo-space-m, 1rem); width: 100%; box-sizing: border-box;">
                <span style="position: absolute; width: 1px; height: 1px; overflow: hidden;
                             clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap;"
                >Loading…</span>
                <mateu-skeleton variant="grid" count="6"></mateu-skeleton>
            </div>
        `:E`
            ${i.infiniteScrolling?E`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:y}
            ${!ne&&u===`list`?ee():!ne&&u===`cards`?i.contentHeight?E`
                <div class="m-scroll" style="width: 100%; height: ${i.contentHeight};">
                    ${g()}
                </div>
            `:g():!ne&&u===`masterDetail`?_():!ne&&u===`tree`?(()=>{let e=P.get();return e?.renderTreeComponent?e.renderTreeComponent(this,{rows:p,columns:d.map(e=>({id:e.id,label:e.label})),idField:this.identifierFieldName,navigable:!!d[0]?.actionId,selectedId:this.state._selectedId??this.appState?._splitDetailId}):v()})():P.get()?.renderTableComponent(this,r,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,x=i.infiniteScrolling?y:P.get()?.renderPagination(this,this.component),S=this.showImportDialog?E`
            <div role="button" tabindex="0" class="crud-modal-backdrop" @click="${e=>{e.target===e.currentTarget&&(this.showImportDialog=!1)}}" @keydown="${R(e=>{e.target===e.currentTarget&&(this.showImportDialog=!1)})}">
                <div class="crud-modal">
                    <h3 style="margin: 0 0 .75rem;">Import</h3>
                    <input type="file" @change="${e=>{let t=e.target.files?.[0];if(t){let e=new FormData;e.append(`file`,t),fetch(`/upload`,{method:`POST`,body:e}).then(e=>e.json()).then(e=>this.handleImportUploadSuccess({detail:e})).catch(()=>this.notify(`Import failed`))}}}">
                    <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                        <button class="crud-btn" @click="${()=>{this.showImportDialog=!1}}">Cancel</button>
                    </div>
                </div>
            </div>
        `:y;return this.standalone?E`
                ${S}
                <style>
                    /* Scoped to the listing area: a grid field inside a FORM must keep sizing
                       itself, so the fill is expressed here and never on the table component. */
                    [data-crud-area] > * { flex: 1 1 auto; min-height: 0; }
                    [data-crud-area] mateu-table, [data-crud-area] mateu-redwood-table { display: flex; flex-direction: column; }
                    [data-crud-area] vaadin-grid { height: 100%; min-height: 0; }
                </style>
                <div data-crud-box style="${this.boxStyle()} width: 100%; box-sizing: border-box;">
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
                        <div style="flex: 1; min-width: 0;">${P.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                        ${this.renderColumnChooser()}
                    </div>
                    <div data-crud-area style="flex: 1; overflow-y: auto; min-height: 0; display: flex; flex-direction: column;">${b}</div>
                    <div style="flex-shrink: 0;">${x}</div>
                </div>
            `:E`
            ${S}
            ${l?E`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem);">
                        <div style="flex: 1; min-width: 0;">
                            ${i?.title?E`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(i.title)}</h2>
                            `:y}
                            ${i?.subtitle?E`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(i.subtitle)}</span>
                            `:y}
                        </div>
                        ${o.map(e=>n(e))}
                        ${c?E`<span class="toolbar-divider"></span>`:y}
                        ${s.map(e=>n(e))}
                        <slot></slot>
                    </div>
                `:y}
                <style>
                    /* Scoped to the listing area: a grid field inside a FORM must keep sizing
                       itself, so the fill is expressed here and never on the table component. */
                    [data-crud-area] > * { flex: 1 1 auto; min-height: 0; }
                    [data-crud-area] mateu-table, [data-crud-area] mateu-redwood-table { display: flex; flex-direction: column; }
                    [data-crud-area] vaadin-grid { height: 100%; min-height: 0; }
                </style>
            <div data-crud-box style="${this.boxStyle()}">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                    <div style="flex: 1; min-width: 0;">${P.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                    ${this.renderColumnChooser()}
                </div>
                <div data-crud-area style="flex: 1; overflow-y: auto; min-height: 0; display: flex; flex-direction: column;">${b}</div>
                <div style="flex-shrink: 0;">${x}</div>
            </div>
        `}createRenderRoot(){return P.mustUseShadowRoot()?super.createRenderRoot():this}static{this.styles=g`
        ${ue}
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
    
        ${z}
    `}};A([b()],G.prototype,`component`,void 0),A([b()],G.prototype,`baseUrl`,void 0),A([b({type:Boolean})],G.prototype,`standalone`,void 0),A([b()],G.prototype,`state`,void 0),A([b()],G.prototype,`data`,void 0),A([b()],G.prototype,`appState`,void 0),A([b()],G.prototype,`appData`,void 0),A([w()],G.prototype,`showImportDialog`,void 0),A([w()],G.prototype,`availableWidthPx`,void 0),A([w()],G.prototype,`selectedItem`,void 0),A([w()],G.prototype,`_columnPrefsRevision`,void 0),A([w()],G.prototype,`fillHeightPx`,void 0),A([w()],G.prototype,`loadingSince`,void 0),G=Ha=A([_(`mateu-table-crud`)],G);var Wa=function(e){return e.Add=`Add`,e.Replace=`Replace`,e.ReplaceKeepData=`ReplaceKeepData`,e}({}),Ga=function(e){return e.OnLoad=`OnLoad`,e.OnSuccess=`OnSuccess`,e.OnError=`OnError`,e.OnValueChange=`OnValueChange`,e.OnCustomEvent=`OnCustomEvent`,e.AutoSave=`AutoSave`,e}({}),Ka=class extends gt{constructor(...e){super(...e),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{let e=this.component;this.registerCustomEventListeners(),e.triggers?.filter(e=>e.type==Ga.OnLoad).forEach(e=>{if((!e.condition||this._evalExpr(e.condition))&&!e.triggered){let n=e;n.triggered=!0;var t=n.times-1;n.timeoutMillis>0?this.scheduleOnload(n,t,this.id):this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(e,t,n)=>{if(n!=this.component?.id)return;let r=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,callbackToken:r},bubbles:!0,composed:!0}))},e.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=e=>{if(!(e instanceof CustomEvent))return;let t=e,n=(this.component.triggers??[]).filter(e=>e.type==Ga.OnCustomEvent).filter(e=>e.eventName==t.type).filter(e=>e.source!==`COMPONENT`||t.detail?.__source===e.from);n.length!==0&&(n.some(e=>!e.source||e.source===`SELF`)&&(e.stopPropagation(),e.preventDefault()),n.forEach(e=>{(!e.condition||this._evalExpr(e.condition))&&this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:t.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(e){return St(e,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(e){return Ct(e,this.state??{},this.data??{},this._interpolationExtra())}isOverlayChild(e){let t=e?.metadata?.type;return t==M.Drawer||t==M.Dialog}removeSelfFromOwnerChildren(){let e=this.component;if(!e)return!1;let t=t=>{if(t===e)return!0;let n=t;return e.id!=null&&n?.id==e.id&&this.isOverlayChild(n)},n=this.parentNode;for(;n;){let e=n instanceof ShadowRoot?n.host:n,r=e.component?.children;if(Array.isArray(r)){let n=r.findIndex(t);if(n>=0)return r.splice(n,1),e.requestUpdate?.(),!0}n=n instanceof ShadowRoot?e:n.parentNode}return!1}applyFragment(e){if(this.id==e.targetComponentId){if(e.component)if(Wa.Add==e.action){if(this.component){let t=this.component.children??(this.component.children=[]),n=e.component.id?t.findIndex(t=>t.id==e.component.id&&this.isOverlayChild(t)):-1;n>=0?(t[n]=e.component,this.component={...this.component}):t.push(e.component)}}else{this.callbackToken=D();let t=!1;if(e.component?.type==j.ServerSide)if(this.component){let n=this.component,r=e.component;t=n.serverSideType==r.serverSideType;let i=t?(n.children??[]).filter(e=>this.isOverlayChild(e)):[];n.actions=r.actions,n.type=r.type,n.rules=r.rules,n.triggers=r.triggers,n.serverSideType=r.serverSideType,n.route=r.route,n.initialData=r.initialData,n.validations=r.validations,n.cssClasses=r.cssClasses,n.slot=r.slot,n.style=r.style,n.children=i.length?[...r.children??[],...i]:r.children,(n.serverSideType!=r.serverSideType||n.id!=r.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=e.component,setTimeout(()=>this.triggerOnLoad());else{let t=[e.component];this.component&&(this.component.children=t)}e.action!==Wa.ReplaceKeepData&&!t&&(this.state={},this.data={})}if(e.state&&(this.state={...this.state,...e.state}),e.data){for(let t in e.data){let n=e.data[t]?.page;n?.pageNumber>0&&this.data[t]&&this.data[t].page.content&&(n.content?n.content=[...this.data[t].page.content,...n.content]:n.content=[...this.data[t].page.content])}this.data={...this.data,...e.data}}this._lastFragmentData=this.data,this.registerCustomEventListeners();let t=P.getAfterRenderHook();t&&setTimeout(()=>t(this)),this.requestUpdate()}}willUpdate(e){super.willUpdate(e);let t=this.component?.serverSideType,n=t!=null&&this._lastViewKey!=null&&t!==this._lastViewKey;if(t!=null&&(this._lastViewKey=t),!e.has(`data`)||this.data===this._lastFragmentData||n)return;let r=this.data,i=e.get(`data`);r&&Object.keys(r).length===0&&i&&Object.keys(i).length>0&&(this.data=i)}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:e,name:t})=>e.removeEventListener(t,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(e=>e.type==Ga.OnCustomEvent).forEach(e=>{let t=e.source===`DOCUMENT`||e.source===`COMPONENT`?document:this;t.addEventListener(e.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:t,name:e.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:e,name:t})=>e.removeEventListener(t,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}};A([b()],Ka.prototype,`state`,void 0),A([b()],Ka.prototype,`data`,void 0),A([b()],Ka.prototype,`appData`,void 0),A([b()],Ka.prototype,`appState`,void 0);var qa=`mateu-recent-routes`,Ja=8;function Ya(){try{return JSON.parse(localStorage.getItem(qa)??`{}`)}catch{return{}}}function Xa(e){try{localStorage.setItem(qa,JSON.stringify(e))}catch{}}function Za(e){return Ya()[e||`_`]??[]}function Qa(e,t){if(!t?.route||!t.label)return;let n=e||`_`,r=Ya(),i=(r[n]??[]).filter(e=>e.route!==t.route);i.unshift({route:t.route,label:t.label}),r[n]=i.slice(0,Ja),Xa(r)}var K=class extends x{constructor(...e){super(...e),this.baseUrl=``,this.open=!1,this.queryText=``,this.dataHits=[],this.loading=!1,this.selectedIndex=0,this.fabOffset=0,this.keydownHandler=null}connectedCallback(){super.connectedCallback(),this.keydownHandler=e=>{(e.metaKey||e.ctrlKey)&&(e.key===`k`||e.key===`K`)?(e.preventDefault(),this.toggle()):e.key===`Escape`&&this.open&&this.close()},document.addEventListener(`keydown`,this.keydownHandler),this.setupFabObserver()}disconnectedCallback(){super.disconnectedCallback(),this.keydownHandler&&document.removeEventListener(`keydown`,this.keydownHandler),clearTimeout(this.searchTimer),this.fabObserver?.disconnect(),this.fabObserver=void 0}setupFabObserver(){let e=this.getRootNode(),t=e instanceof ShadowRoot?e:document.body;this.measureFabStack(),this.fabObserver?.disconnect(),this.fabObserver=new MutationObserver(()=>this.measureFabStack()),this.fabObserver.observe(t,{childList:!0,subtree:!0})}measureFabStack(){let e=(this.getRootNode().querySelectorAll?.(`.ai-fab, .app-fab, .page-fab`).length??0)*4;e!==this.fabOffset&&(this.fabOffset=e)}updated(e){e.has(`open`)&&this.open&&requestAnimationFrame(()=>this.inputEl?.focus())}toggle(){this.open?this.close():this.openCenter()}openCenter(){this.open=!0,this.queryText=``,this.dataHits=[],this.selectedIndex=0}close(){this.open=!1,this.queryText=``,this.dataHits=[],clearTimeout(this.searchTimer)}flattenMenu(e,t){let n=[];for(let r of e??[])if(!r.separator)if(r.submenus&&r.submenus.length>0){let e=t?`${t} › ${r.label}`:r.label;n.push(...this.flattenMenu(r.submenus,e))}else r.route!==void 0&&r.route!==null&&n.push({label:r.label,breadcrumb:t,route:r.route});return n}onInput(e){this.queryText=e,this.selectedIndex=0;let t=e.trim();if(clearTimeout(this.searchTimer),!t||!this.app?.globalSearchEnabled){this.dataHits=[],this.loading=!1;return}this.loading=!0,this.searchTimer=setTimeout(()=>this.fetchGlobalSearch(t),250)}async fetchGlobalSearch(e){let t=this.app;if(!t?.globalSearchEnabled){this.loading=!1;return}try{let n=(await ct.runAction(this.baseUrl??``,t.rootRoute??``,``,`_globalsearch`,`command-center`,void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(e=>e.data).find(e=>e&&e._globalsearch);this.dataHits=n?._globalsearch??[]}catch{this.dataHits=[]}finally{this.loading=!1}}navigateTo(e,t){Qa(this.app?.serverSideType??``,{route:e,label:t}),this.close();for(let t of[`route-changed`,`navigate-to-requested`])this.dispatchEvent(new CustomEvent(t,{detail:{route:e},bubbles:!0,composed:!0}))}askAi(){let e=this.queryText.trim();this.close(),this.dispatchEvent(new CustomEvent(`mateu-open-ai`,{detail:{query:e},bubbles:!0,composed:!0}))}visibleTargets(e){if(!this.queryText.trim()){let e=this.flattenMenu(this.app?.menu,``).map(e=>({route:e.route,label:e.label})),t=Za(this.app?.serverSideType??``);return[...e,...t]}return[...e.map(e=>({route:e.route,label:e.label})),...this.dataHits.map(e=>({route:e.route,label:e.label}))]}onKeydown(e,t){if(e.key===`ArrowDown`)e.preventDefault(),this.selectedIndex=Math.min(this.selectedIndex+1,t.length-1);else if(e.key===`ArrowUp`)e.preventDefault(),this.selectedIndex=Math.max(this.selectedIndex-1,0);else if(e.key===`Enter`){let e=t[this.selectedIndex];e&&this.navigateTo(e.route,e.label)}}render(){return E`
            <button class="cc-fab" style="bottom: ${1.5+this.fabOffset}rem;"
                @click=${()=>this.openCenter()} title="Buscar y navegar (⌘K)" aria-label="Command center">
                ${this.fabIcon()}
            </button>
            ${this.open?this.renderOverlay():y}
        `}fabIcon(){return E`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>`}renderOverlay(){let e=this.queryText.trim().toLowerCase(),t=e?this.flattenMenu(this.app?.menu,``).filter(t=>t.label.toLowerCase().includes(e)||t.breadcrumb.toLowerCase().includes(e)):[],n=this.visibleTargets(t);return E`
            <div class="cc-backdrop" @click=${()=>this.close()}>
                <div class="cc-panel" @click=${e=>e.stopPropagation()}>
                    <div class="cc-bar">
                        <button class="cc-icon-btn" @click=${()=>this.queryText?this.onInput(``):this.close()} title="${this.queryText?`Borrar`:`Cerrar`}">
                            ${this.queryText?this.backIcon():this.searchGlyph()}
                        </button>
                        <input class="cc-input" .value=${this.queryText} placeholder="Buscar pantallas, datos y acciones…"
                            @input=${e=>this.onInput(e.target.value)}
                            @keydown=${e=>this.onKeydown(e,n)}>
                        ${this.queryText?E`<button class="cc-icon-btn" @click=${()=>this.onInput(``)} title="Limpiar">${this.clearIcon()}</button>`:y}
                    </div>
                    <div class="cc-body">
                        ${e?this.renderResults(t):this.renderDefault()}
                    </div>
                </div>
                <button class="cc-close" @click=${()=>this.close()} title="Cerrar">${this.clearIcon()}</button>
            </div>
        `}renderDefault(){let e=this.flattenMenu(this.app?.menu,``),t=Za(this.app?.serverSideType??``),n=-1;return E`
            <div class="cc-columns">
                <div class="cc-col">
                    <div class="cc-section-title">Ir a</div>
                    <div class="cc-tiles">
                        ${e.map(e=>{n++;let t=n;return E`
                            <button class="cc-tile ${t===this.selectedIndex?`cc-sel`:``}"
                                @click=${()=>this.navigateTo(e.route,e.label)}
                                @mouseenter=${()=>{this.selectedIndex=t}}>
                                <span class="cc-tile-label">${e.label}</span>
                                ${e.breadcrumb?E`<span class="cc-sub">${e.breadcrumb}</span>`:y}
                            </button>`})}
                        ${e.length===0?E`<div class="cc-empty">Sin opciones de menú.</div>`:y}
                    </div>
                </div>
                ${t.length>0?E`
                    <div class="cc-col cc-col--recent">
                        <div class="cc-section-title">Recientes</div>
                        ${t.map(e=>{n++;let t=n;return E`
                            <button class="cc-row ${t===this.selectedIndex?`cc-sel`:``}"
                                @click=${()=>this.navigateTo(e.route,e.label)}
                                @mouseenter=${()=>{this.selectedIndex=t}}>
                                <span class="cc-tile-label">${e.label}</span>
                            </button>`})}
                    </div>`:y}
            </div>
        `}renderResults(e){if(this.loading&&this.dataHits.length===0&&e.length===0)return E`<div class="cc-list">${[0,1,2,3].map(()=>E`<div class="cc-skeleton"></div>`)}</div>`;let t=e.length===0&&this.dataHits.length===0;return E`
            <div class="cc-list">
                ${this.app?.sseUrl?E`
                    <button class="cc-row cc-ask-ai" @click=${()=>this.askAi()}>
                        ${this.aiIcon()}<span class="cc-tile-label">Preguntar a la IA: “${this.queryText.trim()}”</span>
                    </button>`:y}
                ${e.length>0?E`<div class="cc-section-title">Pantallas</div>`:y}
                ${e.map((e,t)=>E`
                    <button class="cc-row ${t===this.selectedIndex?`cc-sel`:``}"
                        @click=${()=>this.navigateTo(e.route,e.label)}
                        @mouseenter=${()=>{this.selectedIndex=t}}>
                        <span class="cc-tile-label">${e.label}</span>
                        ${e.breadcrumb?E`<span class="cc-sub">${e.breadcrumb}</span>`:y}
                    </button>`)}
                ${this.renderDataHits(e.length)}
                ${t?E`<div class="cc-empty">No encontramos coincidencias para “${this.queryText.trim()}”.</div>`:y}
            </div>
        `}renderDataHits(e){if(this.dataHits.length===0)return y;let t;return E`${this.dataHits.map((n,r)=>{let i=e+r,a=n.category&&n.category!==t;return t=n.category,E`
                ${a?E`<div class="cc-section-title">${n.category}</div>`:y}
                <button class="cc-row ${i===this.selectedIndex?`cc-sel`:``}"
                    @click=${()=>this.navigateTo(n.route,n.label)}
                    @mouseenter=${()=>{this.selectedIndex=i}}>
                    <span class="cc-tile-label">${n.label}</span>
                    ${n.description?E`<span class="cc-sub">${n.description}</span>`:y}
                </button>`})}`}searchGlyph(){return E`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`}backIcon(){return E`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`}clearIcon(){return E`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`}aiIcon(){return E`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 4.7L19 8.5l-4.1 2.3L12 15l-1.9-4.2L6 8.5l5.1-1.8z"></path></svg>`}static{this.styles=g`
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
    `}};A([b({attribute:!1})],K.prototype,`app`,void 0),A([b()],K.prototype,`baseUrl`,void 0),A([w()],K.prototype,`open`,void 0),A([w()],K.prototype,`queryText`,void 0),A([w()],K.prototype,`dataHits`,void 0),A([w()],K.prototype,`loading`,void 0),A([w()],K.prototype,`selectedIndex`,void 0),A([w()],K.prototype,`fabOffset`,void 0),A([S(`.cc-input`)],K.prototype,`inputEl`,void 0),K=A([_(`mateu-command-center`)],K);var $a=null;function eo(e){let t=e.component?.metadata;t&&(t.commandCenterEnabled||t.chromeless)&&t.variant!==`MEDIATOR`?((!$a||!$a.isConnected)&&($a=document.createElement(`mateu-command-center`),e.renderRoot.appendChild($a)),$a.app=t,$a.baseUrl=e.baseUrl??``):$a&&e.renderRoot.contains($a)&&($a.remove(),$a=null)}var to=class extends x{constructor(...e){super(...e),this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1;let t=e.detail??{},n=t.failure??Qe(t.reason,{online:it.isOnline()});if(n.kind===`cancelled`)return;let r=t.retry;Fa({text:n.message,variant:`error`,duration:r?8e3:5e3,position:`bottomEnd`,...r?{actionLabel:`Retry`,onAction:r}:{}},this)}}connectedCallback(){super.connectedCallback(),this.addEventListener(`backend-called-event`,this.fetchStarted),this.addEventListener(`backend-succeeded-event`,this.fetchFinished),this.addEventListener(`backend-cancelled-event`,this.fetchFinished),this.addEventListener(`backend-failed-event`,this.fetchFailed)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`backend-called-event`,this.fetchStarted),this.removeEventListener(`backend-succeeded-event`,this.fetchFinished),this.removeEventListener(`backend-cancelled-event`,this.fetchFinished),this.removeEventListener(`backend-failed-event`,this.fetchFailed)}render(){return E`<div class="loader-container">
            <div style="display: flex; flex-direction: column;">
                <slot></slot>
                <div class="loader-frame ${this.loading?`delayed-show`:``}" style="${this.loading?`pointer-events: all;`:`display: none;`}"><div class="loader"></div></div>
            </div>
        </div>`}static{this.styles=g`
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
  `}};A([w()],to.prototype,`loading`,void 0),to=A([_(`mateu-api-caller`)],to);var no=new class{constructor(){this._dirty=!1,this._installed=!1,this.message=`You have unsaved changes. Are you sure you want to leave this page?`,this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=e=>{this._dirty&&(e.preventDefault(),e.returnValue=``)}}install(){this._installed||(this._installed=!0,document.addEventListener(`dirty`,this._onDirty),document.addEventListener(`clean`,this._onClean),window.addEventListener(`beforeunload`,this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;let e=window.confirm(this.message);return e&&(this._dirty=!1),e}},ro,io=(e,t)=>(e.homeBaseUrl??``).includes(`://`)?e.homeBaseUrl:t||e.homeBaseUrl,q=class extends Ka{static{ro=this}constructor(...e){super(...e),this.filter=``,this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery=``,this.commandPaletteSelectedIndex=0,this.commandPaletteDataHits=[],this.openDataHit=e=>{no.confirmLeave()&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=``,this.commandPaletteDataHits=[],this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:e.route},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`navigate-to-requested`,{detail:{route:e.route},bubbles:!0,composed:!0})))},this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this._openAiHandler=()=>{this.chatOpen||this.showHideIa()},this.isDark=document.documentElement.getAttribute(`theme`)===`dark`,this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;let e=this.isDark?`dark`:`light`;document.documentElement.setAttribute(`theme`,e),localStorage.setItem(`mateu-theme`,e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?`detail`:`detail-hidden`)},this.runAction=e=>{let t=this.renderRoot.querySelector?.(`mateu-component`);t&&t.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){let n=e[t];if(this.selectedRoute?this.isActiveOption(n):n.selected)return n;let r=this.getSelectedOption(n.submenus);if(r)return r}return null},this.itemSelected=e=>{let t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{let t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(e=>({text:e.label,consumedRoute:e.consumedRoute,route:e.route,baseUrl:e.baseUrl,serverSideType:e.serverSideType,uriPrefix:e.uriPrefix,actionId:e.actionId,selected:e.selected,_menuOption:e})),this.flattenMenuForPalette=(e,t)=>{let n=[];for(let r of e)if(!r.separator)if(r.submenus&&r.submenus.length>0){let e=t?`${t} › ${r.label}`:r.label;n.push(...this.flattenMenuForPalette(r.submenus,e))}else n.push({label:r.label,breadcrumb:t,consumedRoute:r.consumedRoute,route:r.route,actionId:r.actionId,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix});return n},this.handleCommandPaletteKeydown=(e,t)=>{let n=Math.min(t.length,10),r=n+Math.min(this.commandPaletteDataHits.length,8);if(e.key===`ArrowDown`)e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,r-1);else if(e.key===`ArrowUp`)e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key===`Enter`){if(this.commandPaletteSelectedIndex>=n){let e=this.commandPaletteDataHits[this.commandPaletteSelectedIndex-n];e&&this.openDataHit(e);return}let e=t[this.commandPaletteSelectedIndex];e&&(this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=``)}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return y;let e=this.component?.metadata;if(e?.commandCenterEnabled||!e?.menu)return y;let t=this.flattenMenuForPalette(e.menu,``),n=this.commandPaletteQuery.toLowerCase(),r=n?t.filter(e=>e.label.toLowerCase().includes(n)||e.breadcrumb.toLowerCase().includes(n)):t;return E`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=``}}>
                <div class="cmd-palette" @click=${e=>e.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        ${I(`vaadin:search`,void 0,`cmd-search-icon`)}
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${e=>{this.commandPaletteQuery=e.target.value,this.commandPaletteSelectedIndex=0,this.fetchGlobalSearch(this.commandPaletteQuery)}}
                            @keydown=${e=>this.handleCommandPaletteKeydown(e,r)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${r.slice(0,10).map((e,t)=>E`
                            <div class="cmd-result ${t===this.commandPaletteSelectedIndex?`cmd-result--selected`:``}"
                                @click=${()=>{this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=``}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=t}}
                            >
                                <span class="cmd-result-label">${e.label}</span>
                                ${e.breadcrumb?E`<span class="cmd-result-breadcrumb">${e.breadcrumb}</span>`:y}
                            </div>
                        `)}
                        ${n&&this.commandPaletteDataHits.length>0?E`
                            ${this.commandPaletteDataHits.slice(0,8).map((e,t)=>{let n=Math.min(r.length,10)+t,i=this.commandPaletteDataHits[t-1];return E`
                                    ${e.category&&e.category!==i?.category?E`
                                        <div class="cmd-category">${e.category}</div>`:y}
                                    <div class="cmd-result ${n===this.commandPaletteSelectedIndex?`cmd-result--selected`:``}"
                                         @click=${()=>this.openDataHit(e)}
                                         @mouseenter=${()=>{this.commandPaletteSelectedIndex=n}}
                                    >
                                        <span class="cmd-result-label">${e.label}</span>
                                        ${e.description?E`<span class="cmd-result-breadcrumb">${e.description}</span>`:y}
                                    </div>`})}`:y}
                        ${r.length===0&&this.commandPaletteDataHits.length===0?E`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:y}
                    </div>
                </div>
            </div>
        `},this.renderRail=e=>E`
            <div class="nav-rail">
                ${e.map(e=>this.renderRailItem(e))}
            </div>
        `,this.renderRailItem=e=>E`
            <div class="rail-item ${(e.submenus?.length>0?this.railOpenOption?.label===e.label:e.selected)?`rail-item--active`:``}"
                @click=${()=>{e.submenus&&e.submenus.length>0?this.railOpenOption=this.railOpenOption?.label===e.label?null:e:(this.railOpenOption=null,this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix))}}
            >
                ${e.icon?I(e.icon,void 0,`rail-icon`):E`<div class="rail-icon-placeholder">${e.label.charAt(0).toUpperCase()}</div>`}
                <span class="rail-label">${e.label}</span>
            </div>
        `,this.renderRailSubPanel=e=>E`
            <div class="rail-sub-panel">
                <div class="rail-sub-title">${e.label}</div>
                ${e.submenus.map(e=>E`
                    <div class="rail-sub-item ${e.selected?`rail-sub-item--active`:``}"
                        @click=${()=>{e.submenus&&e.submenus.length>0?this.railOpenOption=e:this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}}
                    >${e.label}</div>
                `)}
            </div>
        `,this.renderTilesHub=e=>E`
            <div style="padding: 2rem;">
                <h2 style="margin-top: 0; margin-bottom: 1.5rem;">${e.label}</h2>
                <div class="tiles-hub-grid">
                    ${e.submenus.map(e=>E`
                        <div class="nav-tile"
                            @click=${()=>{e.submenus&&e.submenus.length>0?this.tilesMenuOption=e:(this.tilesMenuOption=null,this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix))}}
                        >
                            ${e.icon?I(e.icon,`font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;`):y}
                            <div class="nav-tile-title">${e.label}</div>
                            ${e.description?E`<div class="nav-tile-desc">${e.description}</div>`:y}
                        </div>
                    `)}
                </div>
            </div>
        `,this.goHome=()=>{no.confirmLeave()&&(window.history.pushState(null,``,`/`),window.dispatchEvent(new PopStateEvent(`popstate`,{state:null})))},this.selectRoute=(e,t,n,r,i,a)=>{no.confirmLeave()&&this._selectRoute(e,t,n,r,i,a)},this._selectRoute=(e,t,n,r,i,a)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=r,this.selectedRoute=t,this.selectedServerSideType=i,this.selectedUriPrefix=a,this.instant=D(),this.state&&this.state._route!=null&&(this.state._route=void 0);let n=this.baseUrl??``;n.indexOf(`://`)<0&&(n.startsWith(`/`)||(n=`/`+n),n=window.location.origin+n),n.endsWith(`/`)&&(t??``).startsWith(`/`)&&(t=(t??``).substring(1));let o=new URL(n+t);if(e&&o.pathname.startsWith(e)){let t=o.pathname.substring(e.length);o=new URL(o.origin+(t||`/`))}if((window.location.pathname||o.pathname)&&window.location.pathname!=o.pathname){let e=o.pathname;o.search&&(e+=o.search),e&&!e.startsWith(`/`)&&(e=`/`+e),this.baseUrl&&e.startsWith(this.baseUrl)&&(e=e.substring(this.baseUrl.length));let t=e;this.selectedUriPrefix&&(t=t.startsWith(`/`)&&this.selectedUriPrefix.endsWith(`/`)?this.selectedUriPrefix+t.substring(1):!t.startsWith(`/`)&&!this.selectedUriPrefix.endsWith(`/`)?this.selectedUriPrefix+`/`+t:this.selectedUriPrefix+t),t==`/_page`&&(t=``),this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:t},bubbles:!0,composed:!0}))}}},this.isActiveOption=e=>this.selectedRoute?!!e.route&&(this.selectedRoute==e.route||this.selectedRoute.startsWith(e.route+`/`)):!!e.selected,this.mapItems=(e,t)=>e.map(e=>{if(e.submenus&&e.submenus.length>0){let n=this.mapItems(e.submenus,t);return t&&e.label.toLowerCase().includes(t)&&(n=this.mapItems(e.submenus,``)),n&&n.length>0?{consumedRoute:e.consumedRoute,text:e.label,route:e.route,baseUrl:e.baseUrl,serverSideType:e.serverSideType,uriPrefix:e.uriPrefix,actionId:e.actionId,selected:t||this.isActiveOption(e),children:n}:void 0}if(e.separator)return t?void 0:{component:`hr`};if(!t||e.label.toLowerCase().includes(t))return{consumedRoute:e.consumedRoute,text:e.label,route:e.route,baseUrl:e.baseUrl,serverSideType:e.serverSideType,uriPrefix:e.uriPrefix,actionId:e.actionId,selected:t||this.isActiveOption(e)}}).filter(e=>e!=null),this.getSelectedIndex=e=>{if(!e)return NaN;let t=e=>{let t=(e??``).trim();return t.length>1&&t.endsWith(`/`)&&(t=t.slice(0,-1)),t},n=t(this.selectedRoute??window.location.pathname),r=NaN,i=-1;for(let a=0;a<e.length;a++){let o=t(e[a].route);o!==``&&(n===o||n.startsWith(o+`/`))&&o.length>i&&(i=o.length,r=a)}if(!Number.isNaN(r))return r;let a=this.getSelectedOption(e);return a?e.indexOf(a):NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?E`
                <details open class="left-menu-group">
                    <summary>${e.label}</summary>
                    <div class="left-menu-children">
                        ${e.submenus.map(e=>E`${this.renderOptionOnLeftMenu(e)}`)}
                    </div>
                </details>
`:E`<button class="left-menu-item"
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){let e=this.shadowRoot?.querySelector(`mateu-ux`);e&&e.setAttribute(`instant`,D())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?E`
            ${e.map(e=>{let t=e;return E`

                        ${t.component==`hr`?E`<hr/>`:E`
                                <div class="side-nav-item ${t.selected?`side-nav-item--active`:``}">
                                    <button class="side-nav-link"
                                            @click="${()=>{t.route&&!t.children&&this.selectRoute(void 0,t.route,void 0,this.baseUrl,void 0,void 0)}}">
                                        ${t.icon?I(`vaadin:dashboard`,`margin-right:.5rem;`):y}${t.text}
                                    </button>
                                    ${t.children?E`<div class="side-nav-children">${this.renderSideNav(t.children,`children`)}</div>`:y}
                                </div>
                        `}

                            `})}`:y,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return P.mustUseShadowRoot()?super.createRenderRoot():(ro.injectLightDomStyles(),this)}static{this.lightDomStylesInjected=!1}static injectLightDomStyles(){if(ro.lightDomStylesInjected||typeof document>`u`||(ro.lightDomStylesInjected=!0,document.getElementById(`mateu-app-light-styles`)))return;let e=ro.styles,t=Array.isArray(e)?e.map(e=>e?.cssText??``).join(`
`):e?.cssText??``;if(!t)return;let n=document.createElement(`style`);n.id=`mateu-app-light-styles`,n.textContent=t,document.head.appendChild(n)}fetchGlobalSearch(e){let t=this.component?.metadata;if(t?.globalSearchEnabled){if(clearTimeout(this._globalSearchTimer),!e){this.commandPaletteDataHits=[];return}this._globalSearchTimer=setTimeout(async()=>{try{let n=(await ct.runAction(this.baseUrl??``,t.rootRoute??``,``,`_globalsearch`,`cmd-palette`,void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(e=>e.data).find(e=>e&&e._globalsearch);this.commandPaletteDataHits=n?._globalsearch??[]}catch{this.commandPaletteDataHits=[]}},250)}}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute(`theme`)===`dark`,this._commandPaletteHandler=e=>{this.component?.metadata?.commandCenterEnabled||((e.metaKey||e.ctrlKey)&&e.key===`k`&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery=``,this.commandPaletteSelectedIndex=0),e.key===`Escape`&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=``))},document.addEventListener(`keydown`,this._commandPaletteHandler),no.install(),this.addEventListener(`compact-changed`,this._compactHandler),this.addEventListener(`mateu-open-ai`,this._openAiHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener(`keydown`,this._commandPaletteHandler),this.removeEventListener(`compact-changed`,this._compactHandler),this.removeEventListener(`mateu-open-ai`,this._openAiHandler)}updated(e){if(super.updated(e),eo(this),this.component){let t=this.component.metadata;if(t){let n=t;if(Me(n.restSources),n.favicon){let e=document.querySelector(`link[rel~='icon']`);e||(e=document.createElement(`link`),e.rel=`icon`,document.head.appendChild(e)),e.href=n.favicon}e.has(`component`)&&(this.selectedRoute=n.homeRoute,this.selectedConsumedRoute=n.homeConsumedRoute,this.selectedServerSideType=n.homeServerSideType,this.selectedBaseUrl=io(n,this.baseUrl),this.selectedUriPrefix=n.homeUriPrefix)}}e.has(`commandPaletteOpen`)&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(`.cmd-input`)?.focus()},0)}render(){return P.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}static{this.styles=g`
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

  `}};A([w()],q.prototype,`filter`,void 0),A([w()],q.prototype,`instant`,void 0),A([w()],q.prototype,`selectedConsumedRoute`,void 0),A([w()],q.prototype,`selectedRoute`,void 0),A([w()],q.prototype,`selectedUriPrefix`,void 0),A([w()],q.prototype,`selectedBaseUrl`,void 0),A([w()],q.prototype,`selectedServerSideType`,void 0),A([w()],q.prototype,`selectedParams`,void 0),A([w()],q.prototype,`tilesMenuOption`,void 0),A([w()],q.prototype,`railOpenOption`,void 0),A([w()],q.prototype,`commandPaletteOpen`,void 0),A([w()],q.prototype,`commandPaletteQuery`,void 0),A([w()],q.prototype,`commandPaletteSelectedIndex`,void 0),A([w()],q.prototype,`commandPaletteDataHits`,void 0),A([w()],q.prototype,`pageCompact`,void 0),A([S(`mateu-chat`)],q.prototype,`chat`,void 0),A([w()],q.prototype,`isDark`,void 0),A([w()],q.prototype,`chatOpen`,void 0),A([S(`.mateu-app-layout`)],q.prototype,`vaadinAppLayout`,void 0),q=ro=A([_(`mateu-app`)],q);var ao=class extends x{constructor(...e){super(...e),this.message=`This website uses cookies.`,this.dismiss=`Ok. Thanks :).`,this.learnMore=`Learn more`,this.learnMoreLink=`https://cookiesandyou.com/`,this.showLearnMore=!0,this.position=`top`,this.cookieName=`mateu-cookieconsent`}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement(`style`),this._css.innerText=`.cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}`,document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){let e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){let e=this.popup;e&&(e.classList.remove(`cc-invisible`),e.style.display=``)}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:`#000`},button:{background:`rgba(22, 118, 243, 0.95)`,hover:`rgba(22, 118, 243, 1)`}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});let e=this.popup;if(e){e.setAttribute(`role`,`alert`);let t=e.querySelector(`a.cc-btn`);t?.addEventListener(`keydown`,e=>{let n=e.keyCode||e.which;(n===32||n===13)&&t.click()})}}render(){return E`
       `}static{this.styles=g`
  `}};A([b()],ao.prototype,`message`,void 0),A([b()],ao.prototype,`dismiss`,void 0),A([b()],ao.prototype,`learnMore`,void 0),A([b()],ao.prototype,`learnMoreLink`,void 0),A([b()],ao.prototype,`showLearnMore`,void 0),A([b()],ao.prototype,`position`,void 0),A([b()],ao.prototype,`cookieName`,void 0),A([w()],ao.prototype,`_css`,void 0),A([S(`[aria-label="cookieconsent"]`)],ao.prototype,`popup`,void 0),ao=A([_(`mateu-cookie-consent`)],ao);var oo=class extends x{constructor(...e){super(...e),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener(`value-changed`,this.redispatchEvent),this.addEventListener(`data-changed`,this.redispatchEvent),this.addEventListener(`action-requested`,this.redispatchEvent),this.addEventListener(`server-side-action-requested`,this.redispatchEvent),this.addEventListener(`route-changed`,this.redispatchEvent),this.addEventListener(`close-modal-requested`,this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`value-changed`,this.redispatchEvent),this.removeEventListener(`data-changed`,this.redispatchEvent),this.removeEventListener(`action-requested`,this.redispatchEvent),this.removeEventListener(`server-side-action-requested`,this.redispatchEvent),this.removeEventListener(`route-changed`,this.redispatchEvent)}render(){return E`<slot></slot>`}static{this.styles=g`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `}};A([b()],oo.prototype,`target`,void 0),oo=A([_(`mateu-event-interceptor`)],oo);var so=[`a[href]`,`button`,`input`,`select`,`textarea`,`[tabindex]`,`vaadin-button`,`vaadin-text-field`,`vaadin-combo-box`,`vaadin-select`,`vaadin-checkbox`,`vaadin-date-picker`,`ui5-button`,`oj-c-button`].join(`,`),co=e=>{let t=e;return t.hidden||t.hasAttribute(`disabled`)||t.getAttribute(`aria-hidden`)===`true`||t.getAttribute(`tabindex`)===`-1`?!1:!!(t.offsetParent||t.getClientRects().length)},lo=e=>{let t=[],n=e=>{e.querySelectorAll(`*`).forEach(e=>{e.matches(so)&&co(e)&&t.push(e),e.shadowRoot&&n(e.shadowRoot),e instanceof HTMLSlotElement&&e.assignedElements().forEach(e=>{e.matches(so)&&co(e)&&t.push(e),n(e)})})};return n(e),t.filter((e,n)=>t.indexOf(e)===n)},uo=(e,t={})=>{let n=fo(),r=[],i=()=>{r=lo(e)},a=t=>{if(t.key!==`Tab`)return;if(i(),r.length===0){t.preventDefault(),e.focus();return}let n=r[0],a=r[r.length-1],o=fo();t.shiftKey&&(o===n||!o||!po(o,e))?(t.preventDefault(),a.focus()):!t.shiftKey&&o===a&&(t.preventDefault(),n.focus())};return e.addEventListener(`keydown`,a),requestAnimationFrame(()=>{i();let n=t.initialFocus?.()??r[0];n?n.focus():(e.hasAttribute(`tabindex`)||e.setAttribute(`tabindex`,`-1`),e.focus())}),{refresh:i,release(){e.removeEventListener(`keydown`,a);let t=fo();(!t||t===document.body||po(t,e))&&n?.focus?.()}}},fo=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},po=(e,t)=>{let n=e;for(;n;){if(n===t)return!0;n=n.parentNode??n.host??null}return!1},mo=class extends Ka{constructor(...e){super(...e),this.opened=!0,this.close=()=>{this.opened=!1,this.releaseFocusTrap(),setTimeout(()=>{this.removeSelfFromOwnerChildren()||this.parentElement?.removeChild(this)},500)},this.onKeydown=e=>{e.key===`Escape`&&this.opened&&(e.stopPropagation(),this.close())}}connectedCallback(){super.connectedCallback(),this.addEventListener(`keydown`,this.onKeydown)}disconnectedCallback(){super.disconnectedCallback(),this.releaseFocusTrap()}releaseFocusTrap(){this.focusTrap?.release(),this.focusTrap=void 0}applyFragment(e){super.applyFragment(e);let t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has(`component`)&&this.component){let e=this.component.metadata;this.state=e.initialData}let t=this.renderRoot.querySelector(`[role="dialog"]`),n=this.component?.metadata?.modeless;this.opened&&t&&!this.focusTrap&&!n?this.focusTrap=uo(t):this.focusTrap&&this.opened&&this.focusTrap.refresh()}render(){if(!this.opened)return E``;let e=this.component.metadata,t=bt(e.headerTitle,this.state,this.data,this.appState,this.appData),n=!!(t||e.header||e.closeButtonOnHeader),r=[e.width?`width:${e.width};`:`min-width:min(90vw,28rem);`,e.height?`height:${e.height};`:``,e.top?`margin-top:${e.top};`:``].join(``);return E`
            <div class="backdrop ${e.modeless?`modeless`:``}"
                 @click="${t=>{!e.modeless&&t.target===t.currentTarget&&this.close()}}">
                <div class="dialog ${e.noPadding?`no-padding`:``} ${this.component?.cssClasses??``}"
                     role="dialog"
                     aria-modal="${e.modeless?`false`:`true`}"
                     aria-label="${t||`Dialog`}"
                     style="${r} ${this.component?.style??``}">
                    ${n?E`
                        <div class="dialog-header">
                            <mateu-event-interceptor .target="${this}" style="flex:1; min-width:0;">
                                ${t?E`<span class="dialog-title">${t}</span>`:y}
                                ${e.header?F(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):y}
                            </mateu-event-interceptor>
                            ${e.closeButtonOnHeader?E`<button class="dialog-close" @click="${this.close}" aria-label="Close">✕</button>`:y}
                        </div>`:y}
                    ${e.content?E`
                        <div class="dialog-body">
                            <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width:100%;">
                                ${F(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:y}
                    ${e.footer?E`
                        <div class="dialog-footer">
                            <mateu-event-interceptor .target="${this}" style="width:100%;">
                                ${F(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:y}
                </div>
            </div>
        `}static{this.styles=g`
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
    `}};A([w()],mo.prototype,`opened`,void 0),mo=A([_(`mateu-dialog`)],mo);var ho,go=class extends Ka{static{ho=this}constructor(...e){super(...e),this.opened=!1,this.maximizeSteps=0,this.collapsed=!1,this.pagerMenuOpen=!1,this.onGuidedProgress=e=>{let t=e.detail;t&&t.total>0&&(this.guidedProgress=t)},this.close=()=>{this.opened=!1,this.releaseLayoutInset(),this.releaseFocusTrap(),setTimeout(()=>{this.removeSelfFromOwnerChildren()||this.parentElement?.removeChild(this)},300)},this._escListener=e=>{if(e.key!==`Escape`)return;let t=this.getRootNode().querySelectorAll(`mateu-drawer, mateu-dialog`);t[t.length-1]===this&&(e.stopPropagation(),this.close())}}jumpToStep(e){this.pagerMenuOpen=!1,e&&(this.renderRoot.querySelector(`.content mateu-component`)??this.renderRoot.querySelector(`mateu-component`))?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`goToStep`,parameters:{_stepId:e}},bubbles:!0,composed:!0}))}static{this.SIZE_LADDER=[`s`,`m`,`l`,`xl`]}static{this.SIZE_WIDTHS={s:`464px`,m:`648px`,l:`968px`,xl:`90vw`}}effectiveWidth(e){if(e.width)return e.width;if(!e.size)return;let t=ho.SIZE_LADDER,n=Math.max(0,t.indexOf(e.size)),r=Math.min(t.length-1,n+this.maximizeSteps);return ho.SIZE_WIDTHS[t[r]]}canMaximize(e){if(!e.maximizable)return!1;let t=ho.SIZE_LADDER;return Math.max(0,t.indexOf(e.size??`m`))+this.maximizeSteps<t.length-1}firstUpdated(){requestAnimationFrame(()=>this.opened=!0),this.addEventListener(`mateu-guided-progress`,this.onGuidedProgress);let e=this.component?.metadata;e&&requestAnimationFrame(()=>this.applyLayoutInset(e))}releaseFocusTrap(){this.focusTrap?.release(),this.focusTrap=void 0}applyLayoutInset(e){if(!e.layout)return;let t=document.querySelector(`mateu-ui`);if(!t)return;let n=e.position??`end`,r=n===`bottom`?`var(--mateu-drawer-height, 50vh)`:this.effectiveWidth(e)??`648px`;this._insetProp=n===`start`?`paddingLeft`:n===`bottom`?`paddingBottom`:`paddingRight`,t.style.transition=`padding .25s ease`,t.style[this._insetProp]=r}releaseLayoutInset(){if(!this._insetProp)return;let e=document.querySelector(`mateu-ui`);e&&(e.style[this._insetProp]=``),this._insetProp=void 0}applyFragment(e){super.applyFragment(e);let t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has(`component`)&&this.component){let e=this.component.metadata;this.state=e.initialData}let t=this.component?.metadata,n=this.renderRoot.querySelector(`[role="dialog"]`);this.opened&&n&&!t?.modeless&&!t?.layout&&!this.focusTrap?this.focusTrap=uo(n):this.focusTrap&&this.opened&&this.focusTrap.refresh()}connectedCallback(){super.connectedCallback(),document.addEventListener(`keydown`,this._escListener)}disconnectedCallback(){document.removeEventListener(`keydown`,this._escListener),this.releaseLayoutInset(),this.releaseFocusTrap(),super.disconnectedCallback()}render(){let e=this.component.metadata,t=e.position??`end`,n=bt(e.headerTitle,this.state,this.data,this.appState,this.appData),r=bt(e.subtitle,this.state,this.data,this.appState,this.appData),i=this.effectiveWidth(e),a=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0;return E`
        ${e.modeless||e.layout?y:E`
            <div class="backdrop ${this.opened?`open`:``}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${t} ${this.opened?`open`:``} ${this.collapsed?`collapsed`:``} ${this.component?.cssClasses??``}"
                role="dialog"
                aria-modal="${!e.modeless}"
                aria-label="${n??y}"
                style="${i&&t!==`bottom`?`width: ${i};`:``}${this.component?.style??``}"
        >
            <header>
                ${n?E`<div class="titles"><h3>${n}</h3>${r?E`<span class="subtitle">${r}</span>`:y}</div>`:E`<span class="spacer"></span>`}
                ${this.guidedProgress&&this.guidedProgress.total>1?E`
                    <div class="guided-pager-wrap">
                        <button class="guided-pager" aria-haspopup="true" aria-expanded="${this.pagerMenuOpen}"
                                aria-label="Step ${this.guidedProgress.current} of ${this.guidedProgress.total}"
                                @click="${()=>this.pagerMenuOpen=!this.pagerMenuOpen}">${this.guidedProgress.current} | ${this.guidedProgress.total}<span class="caret">▾</span></button>
                        ${this.pagerMenuOpen&&this.guidedProgress.steps?E`
                            <div class="guided-pager-menu">
                                ${this.guidedProgress.steps.map((e,t)=>E`
                                    <button class="guided-pager-item ${e.status}" ?disabled="${e.status!==`done`}"
                                            @click="${()=>this.jumpToStep(e.id)}"><span class="pager-dot">${e.status===`done`?`✓`:t+1}</span>${e.title??`Step ${t+1}`}</button>
                                `)}
                            </div>
                        `:y}
                    </div>
                `:y}
                ${e.header?E`
                    <mateu-event-interceptor .target="${this}">${F(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:y}
                ${a?E`
                    <button class="drawer-icon" aria-label="${a.prevLabel??`Previous`}" title="${a.prevLabel??`Previous`}"
                            ?disabled="${!a.prevRoute}" @click="${()=>{a.prevRoute&&(window.location.href=a.prevRoute)}}">‹</button>
                    <button class="drawer-icon" aria-label="${a.nextLabel??`Next`}" title="${a.nextLabel??`Next`}"
                            ?disabled="${!a.nextRoute}" @click="${()=>{a.nextRoute&&(window.location.href=a.nextRoute)}}">›</button>
                `:y}
                ${e.collapsible?E`
                    <button class="drawer-icon" aria-label="${this.collapsed?`Expand`:`Collapse`}" title="${this.collapsed?`Expand`:`Collapse`}"
                            @click="${()=>this.collapsed=!this.collapsed}">${this.collapsed?`▴`:`▾`}</button>
                `:y}
                ${this.canMaximize(e)?E`
                    <button class="drawer-icon" aria-label="Maximize" title="Maximize" @click="${()=>this.maximizeSteps++}">⤢</button>
                `:y}
                <button class="drawer-close" aria-label="Close" @click="${this.close}">✕</button>
            </header>
            ${this.collapsed?y:E`
            <div class="content ${e.noPadding?`no-padding`:``}">
                ${e.content?E`
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${F(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:y}
            </div>
            ${e.footer?E`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${F(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:y}
            `}
        </section>
       `}static{this.styles=g`
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
  `}};A([w()],go.prototype,`opened`,void 0),A([w()],go.prototype,`maximizeSteps`,void 0),A([w()],go.prototype,`collapsed`,void 0),A([w()],go.prototype,`guidedProgress`,void 0),A([w()],go.prototype,`pagerMenuOpen`,void 0),go=ho=A([_(`mateu-drawer`)],go);function _o(e){if(e.parentElement)return e.parentElement;let t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}var J=class extends x{constructor(...e){super(...e),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type===`keydown`){let t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{let t=e.detail,n=t.banners??[],r=t.append??!1;r?this.actionBanners=[...this.actionBanners,...n]:(this._clearActionBannerTimers(),this.actionBanners=n);let i=r?this.actionBanners.length-n.length:0;n.forEach((e,t)=>{if(e.timeoutSeconds&&e.timeoutSeconds>0){let n=i+t;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((e,t)=>t!==n)},e.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;let t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;let n=parseInt(t[1],10)-1;n>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(n))},this._onScrollSpy=()=>{if(this._tocLocked)return;let e=this._sectionCards();if(!e.length)return;let t=this.shadowRoot?.querySelector(`mateu-content-header`),n=t?t.getBoundingClientRect().bottom:0;for(let t of e){if(!t.classList.contains(`mateu-section--sticky`))continue;let e=t.getBoundingClientRect();e.top<=n+12+2&&(n=Math.max(n,e.bottom))}let r=n+12+4,i=0;this._tocEntries.forEach((e,t)=>{e.el.getBoundingClientRect().top<=r&&(i=t)}),this._activeToc=i}}connectedCallback(){super.connectedCallback(),document.addEventListener(`page-banners-received`,this._bannersHandler),window.addEventListener(`resize`,this._onResize),document.addEventListener(`keydown`,this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener(`page-banners-received`,this._bannersHandler),window.removeEventListener(`resize`,this._onResize),document.removeEventListener(`keydown`,this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){if(super.updated(e),e.has(`component`)&&e.get(`component`)!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has(`component`)){let e=this.component?.metadata?.level??0;this.toggleAttribute(`data-nested`,e>0),this._scheduleStaticBannerTimeouts();let t=this.component?.metadata?.pageWidth===`edgeToEdge`;this.toggleAttribute(`data-edge`,t),this.dispatchEvent(new CustomEvent(`compact-changed`,{detail:{compact:!!this.component?.style?.includes(`--mateu-compact:1`)||t},bubbles:!0,composed:!0})),this._scheduleTocRebuild()}}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((e,t)=>{e.timeoutSeconds&&e.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,t])},e.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,n)=>n!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){let t=e.theme?.toLowerCase()??`info`;return t===`none`?``:t}_evalBannerText(e){return N(e,this.state,this.data)}_renderBanner(e,t){let n=this._evalBannerText(e.title),r=this._evalBannerText(e.description);return E`
            <div class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${n||e.hasCloseButton?E`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${n??``}</span>
                        ${e.hasCloseButton?E`
                            <button class="banner-close" @click=${t} title="Dismiss" aria-label="Dismiss">✕</button>
                        `:y}
                    </div>
                `:y}
                ${r?E`<p>${r}</p>`:y}
            </div>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(`.mateu-section`))}_sectionTitle(e){return e.querySelector(`[slot="title"]`)?.textContent?.trim()||e.querySelector(`h1,h2,h3,h4,h5,h6`)?.textContent?.trim()||void 0}_rebuildToc(){let e=this._sectionCards(),t=e.map(e=>({title:this._sectionTitle(e),el:e})).filter(e=>!!e.title),n=this.component?.metadata?.toc,r=t.length>4&&e.every(e=>!e.closest(`vaadin-horizontal-layout`)),i=(n===!0||n!==!1&&r)&&t.length>0;this._tocEntries=t,this._tocVisible=i,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),i?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){let e=this.shadowRoot?.querySelector(`mateu-content-header`);this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty(`--mateu-header-h`,this._headerH+`px`);let t=this._headerH+12;for(let e of this._sectionCards())e.classList.contains(`mateu-section--sticky`)&&(e.style.top=t+`px`,t+=e.offsetHeight+12)}_scrollContainer(){let e=_o(this);for(;e;){let t=getComputedStyle(e).overflowY;if((t===`auto`||t===`scroll`)&&e.scrollHeight>e.clientHeight)return e;e=_o(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener(`scroll`,this._onScrollSpy,{passive:!0}),window.addEventListener(`wheel`,this._unlockToc,{passive:!0}),window.addEventListener(`touchstart`,this._unlockToc,{passive:!0}),window.addEventListener(`keydown`,this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener(`scroll`,this._onScrollSpy),window.removeEventListener(`wheel`,this._unlockToc),window.removeEventListener(`touchstart`,this._unlockToc),window.removeEventListener(`keydown`,this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){let t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;let n=this._headerH+12;for(let e of this._sectionCards()){if(e===t.el)break;e.classList.contains(`mateu-section--sticky`)&&(n+=e.offsetHeight+12)}let r=this._scrollContainer(),i=r?r.getBoundingClientRect().top:0,a=t.el.getBoundingClientRect().top-i-n;(r??window).scrollBy({top:a,behavior:`smooth`})}_showHeaderBand(){let e=this.component?.metadata,t=!!(e?.title||e?.subtitle||e?.overline||e?.titlePlaceholder||e?.toolbar?.length),n=!!this.component?.children?.some(e=>e.metadata?.type===M.Crud);return t&&!n&&!this._hasWelcomeBanner()}_hasWelcomeBanner(){let e=t=>t?.metadata?.type===M.HeroSection||(t?.children??[]).some(e);return(this.component?.children??[]).some(e)}render(){let e=this.component?.metadata,t=[...(e?.banners??[]).map((e,t)=>({banner:e,index:t})).filter(({index:e})=>!this.dismissedStaticBannerIndices.has(e)).map(({banner:e,index:t})=>({banner:e,onDismiss:()=>this._dismissStaticBanner(t)})),...this.actionBanners.map((e,t)=>({banner:e,onDismiss:()=>this._dismissActionBanner(t)}))];return E`<div style="display: flex; flex-direction: column; width: 100%;">${E`
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
                ${this._showHeaderBand()?E`
                    <div class="page-header-band" aria-hidden="true"></div>
                `:y}
            </div>
            ${t.length>0?E`
                <div class="page-banners">
                    ${t.map(({banner:e,onDismiss:t})=>this._renderBanner(e,t))}
                </div>
            `:y}
            <div class="page-body ${this._tocVisible?`with-toc`:``}">
                <div class="form-content">
                    <slot @slotchange=${this._onSlotChange}></slot>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem);" class="form-buttons">
                        <slot name="buttons"></slot>
                    </div>
                </div>
                ${this._tocVisible?E`
                    <aside class="page-toc">
                        <nav>
                            ${this._tocEntries.map((e,t)=>E`
                                <a class="page-toc__item ${t===this._activeToc?`is-active`:``}"
                                   @click=${()=>this._scrollToSection(t)}
                                   title=${t<9?`${e.title} (Ctrl+Alt+${t+1})`:e.title}>
                                    <span class="page-toc__label">${e.title}</span>
                                    ${t<9?E`<span class="page-toc__key">${t+1}</span>`:y}
                                </a>
                            `)}
                        </nav>
                    </aside>
                `:y}
            </div>
            <div class="form-footer">
                ${e?.footer?.map(e=>F(this,e,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `}</div>`}static{this.styles=g`
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
    `}};A([b()],J.prototype,`component`,void 0),A([b()],J.prototype,`baseUrl`,void 0),A([b()],J.prototype,`state`,void 0),A([b()],J.prototype,`data`,void 0),A([b()],J.prototype,`appState`,void 0),A([b()],J.prototype,`appData`,void 0),A([b()],J.prototype,`value`,void 0),A([b({type:Boolean})],J.prototype,`standalone`,void 0),A([w()],J.prototype,`actionBanners`,void 0),A([w()],J.prototype,`dismissedStaticBannerIndices`,void 0),A([w()],J.prototype,`_tocEntries`,void 0),A([w()],J.prototype,`_activeToc`,void 0),A([w()],J.prototype,`_tocVisible`,void 0),J=A([_(`mateu-page`)],J);var vo=g`
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
`,yo=e=>T`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,bo=yo(T`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),xo=yo(T`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),So=yo(T`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`);yo(T`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`);var Co=yo(T`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),wo=yo(T`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`),To=[`#e91e63`,`#1676f3`,`#10b981`,`#8b5cf6`,`#f59e0b`,`#ef4444`],Eo=e=>To[Math.abs(e??0)%To.length],Do=e=>(e??`?`).split(/\s+/).filter(e=>e).map(e=>e[0]).slice(0,2).join(``).toUpperCase()||`?`,Y=class extends x{constructor(...e){super(...e),this.localAgentUrl=`http://127.0.0.1:8776`,this.localAgentAlive=!1,this.menu=[],this.chatSessionId=D(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){let t=e,n=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=n,this.send(new CustomEvent(`submit`,{detail:{value:n},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{let e=new AbortController,t=setTimeout(()=>e.abort(),1200),n=await fetch(this.localAgentUrl+`/health`,{signal:e.signal});clearTimeout(t),this.localAgentAlive=n.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{let t=e.target,n=Array.from(t.files??[]);if(t.value=``,!(!n.length||!this.uploadUrl)){this.uploading=!0;try{let e=new FormData;e.append(`sessionId`,this.chatSessionId);for(let t of n)e.append(`files`,t,t.name);let t={},r=localStorage.getItem(`__mateu_auth_token`);r&&(t.Authorization=`Bearer `+r);let i=sessionStorage.getItem(`__mateu_sesion_id`);i&&(t[`X-Session-Id`]=i);let a=await fetch(this.uploadUrl,{method:`POST`,headers:t,body:e});if(!a.ok)throw Error(`Upload failed: ${a.status}`);let o=((await a.json()).files??[]).filter(e=>e&&e.path);this.attachments=[...this.attachments,...o]}catch(e){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${e instanceof Error?e.message:e}`,`agent`)}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute(`disabled`,`disabled`);let t=e.detail.value.trim(),n=this.localAgentAlive?this.localAgentUrl+`/mateu/agent/stream`:this.sseUrl,r=this.attachments;if(!t&&r.length===0||!n)return;let i=r.length?`${t}${t?`

`:``}📎 ${r.map(e=>e.name).join(`, `)}`:t;this.addMessage(i,`user`),this.attachments=[];let a=this.addMessage(``,`agent`);this.startLoading();let o=``;try{let e={Accept:`text/event-stream`,"Content-Type":`application/json`},i=localStorage.getItem(`__mateu_auth_token`);i&&(e.Authorization=`Bearer `+i);let s=sessionStorage.getItem(`__mateu_sesion_id`);s&&(e[`X-Session-Id`]=s);let c=this.contextProvider?.(),l=JSON.stringify({message:t,sessionId:this.chatSessionId,...r.length&&{attachments:r},...c!=null&&{context:c},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;let u=await fetch(n,{method:`POST`,headers:e,body:l});if(!u.ok){let e=await u.text();throw Error(`Servidor respondió ${u.status}: ${e}`)}let d=u.body?.getReader();if(!d)throw Error(`No se pudo obtener el reader del stream.`);let f=new TextDecoder,p=``;for(;;){let{done:e,value:t}=await d.read();if(e){if(p.trim().startsWith(`data:`)){let e=p.trim().slice(5).trim(),t=this.tryParseTokenUsage(e),n=!t&&this.tryParseCustomEvent(e);t?this.tokenUsage={...this.tokenUsage,...t}:n?n.event===`agent-error`?(o=`⚠️ `+(n.detail?.message??`Error desconocido del agente`),this.updateMessage(a,o)):this.dispatchEvent(new CustomEvent(n.event,{detail:n.detail,bubbles:!0,composed:!0})):(o+=e,this.updateMessage(a,o))}break}let n=f.decode(t,{stream:!0});p+=n;let r=p.split(`
`);p=r.pop()||``;let i=!1;for(let e of r)if(e.trim().startsWith(`data:`)){let t=e.trim().slice(5).trim(),n=this.tryParseTokenUsage(t),r=!n&&this.tryParseCustomEvent(t);n?this.tokenUsage={...this.tokenUsage,...n}:r?r.event===`agent-error`?(o=`⚠️ `+(r.detail?.message??`Error desconocido del agente`),this.updateMessage(a,o)):this.dispatchEvent(new CustomEvent(r.event,{detail:r.detail,bubbles:!0,composed:!0})):(o+=t+`
`,i=!0)}i&&this.updateMessage(a,o)}o||this.updateMessage(a,`⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).`)}catch(e){console.error(`Error en el flujo SSE:`,e);let t=e?.message??String(e);(t===`Failed to fetch`||t===`network error`||t===`Load failed`)&&!o?this.updateMessage(a,`⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible.`):this.updateMessage(a,`⚠️ Error: `+t)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value=``)},250),this.messageInputElement?.removeAttribute(`disabled`),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent(`close-requested`,{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{let e=this.messageInputElement?.value?.trim()??``;e&&this.send(new CustomEvent(`submit`,{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key===`Enter`&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback(),this.probeLocalAgent();let e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){let t=new e;this.recognition=t,t.lang=`es-ES`,t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=e=>{console.error(`Error de reconocimiento: `+e.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:`smooth`})},0)}addMessage(e,t){let n={text:e,time:new Date().toLocaleTimeString(),userName:t.includes(`agent`)?`Asistente`:`Tú`,userColorIndex:t.includes(`agent`)?2:1};return this.items=[...this.items,n],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((n,r)=>r===e?{...n,text:t}:n),this.scrollBottom()}tryParseCustomEvent(e){let t=e.trim();if(!t.startsWith(`{`))return null;try{let e=JSON.parse(t);if(typeof e.event==`string`)return{event:e.event,detail:e.detail??{}}}catch{}return null}tryParseTokenUsage(e){let t=e.trim();if(!t.startsWith(`{`))return null;try{let e=JSON.parse(t);if(`inputTokens`in e||`outputTokens`in e||`totalTokens`in e)return e}catch{}return null}buildMenuContext(e,t=[]){let n=[];for(let r of e){if(r.separator||r.remote)continue;let e=[...t,r.label];if(r.submenus&&r.submenus.length>0)n.push(...this.buildMenuContext(r.submenus,e));else{let t={path:e,navigation:{route:r.route,consumedRoute:r.consumedRoute,actionId:r.actionId??``,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix}};r.description&&(t.description=r.description),n.push(t)}}return n}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return E`
            <div class="chat-container">
                <div class="chat-header">
                    <span class="chat-title">AI Assistant</span>
                    ${this.localAgentAlive?E`<span class="local-agent-badge" title="Hablando con tu CLI local (companion en ${this.localAgentUrl}) — sin api key">agente local</span>`:y}
                    <button class="chat-icon-btn" @click="${this.toggleExpanded}"
                            title="${this.expanded?`Contraer`:`Expandir a pantalla completa`}"
                            aria-label="${this.expanded?`Contraer el chat`:`Expandir el chat`}">
                        ${this.expanded?`⤡`:`⤢`}
                    </button>
                    <button class="chat-close" @click="${this.closeChat}" title="Cerrar">
                        ${wo}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>E`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${Eo(e.userColorIndex)};">${Do(e.userName)}</div>
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
                ${this.tokenUsage?E`
                    <div class="token-bar">
                        <span class="token-label">Tokens:</span>
                        ${this.tokenUsage.inputTokens==null?y:E`<span class="token-chip">in&nbsp;<strong>${this.tokenUsage.inputTokens}</strong></span>`}
                        ${this.tokenUsage.outputTokens==null?y:E`<span class="token-chip">out&nbsp;<strong>${this.tokenUsage.outputTokens}</strong></span>`}
                        ${this.tokenUsage.totalTokens==null?y:E`<span class="token-chip">total&nbsp;<strong>${this.tokenUsage.totalTokens}</strong></span>`}
                    </div>
                `:y}
                ${this.loading?E`
                    <div class="loading-bar">
                        <span class="spinner"></span>
                        <span class="loading-text">Thinking… ${this.elapsedSeconds}s</span>
                    </div>
                `:y}
                ${this.attachments.length?E`
                    <div class="attachments">
                        ${this.attachments.map(e=>E`
                            <span class="attachment-chip" title="${e.path}">
                                📎 ${e.name}
                                <button class="attachment-remove" @click="${()=>this.removeAttachment(e.path)}" aria-label="Quitar ${e.name}">✕</button>
                            </span>`)}
                    </div>
                `:y}
                <div class="input-bar">
                    ${this.uploadUrl?E`
                        <button class="mic-btn" title="Adjuntar ficheros"
                                @click="${this.pickFiles}" ?disabled="${this.uploading}"
                                aria-label="Adjuntar ficheros">${this.uploading?`…`:`📎`}</button>
                        <input class="file-input" type="file" multiple hidden
                               @change="${this.onFilesPicked}"/>
                    `:y}
                    <button class="mic-btn"
                            title="Dictar"
                            style="color: ${this.listening?`red`:`var(--lumo-contrast-50pct, #767676)`};"
                            @click="${this.startListening}"
                            ?disabled="${!this.recognitionAvailable}"
                    >${Co}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}static{this.styles=[vo,g`
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
    `]}};A([b({attribute:!1})],Y.prototype,`contextProvider`,void 0),A([b()],Y.prototype,`localAgentUrl`,void 0),A([b({attribute:!1})],Y.prototype,`mcpUrl`,void 0),A([w()],Y.prototype,`localAgentAlive`,void 0),A([b()],Y.prototype,`sseUrl`,void 0),A([b()],Y.prototype,`uploadUrl`,void 0),A([b({attribute:!1})],Y.prototype,`menu`,void 0),A([w()],Y.prototype,`attachments`,void 0),A([w()],Y.prototype,`uploading`,void 0),A([S(`.file-input`)],Y.prototype,`fileInputElement`,void 0),A([b({type:Boolean,reflect:!0})],Y.prototype,`expanded`,void 0),A([b()],Y.prototype,`items`,void 0),A([S(`.scroll-container`)],Y.prototype,`scrollContainer`,void 0),A([S(`.msg-input`)],Y.prototype,`messageInputElement`,void 0),A([w()],Y.prototype,`recognition`,void 0),A([w()],Y.prototype,`listening`,void 0),A([w()],Y.prototype,`recognitionAvailable`,void 0),A([w()],Y.prototype,`loading`,void 0),A([w()],Y.prototype,`elapsedSeconds`,void 0),A([w()],Y.prototype,`tokenUsage`,void 0),Y=A([_(`mateu-chat`)],Y);var Oo=class extends x{updated(e){super.updated(e),this.chart&&=(this.chart.destroy(),void 0),this.data&&this.createChart(this.data)}async createChart(e){let[{default:t}]=await Promise.all([O(()=>import(`./vendor-chartjs.js`).then(e=>e.n),__vite__mapDeps([3,1])),O(()=>import(`./vendor-chartjs.js`).then(e=>e.t),__vite__mapDeps([3,1]))]);if(e!==this.data)return;this.chart&&this.chart.destroy();let n={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,n)}handleSlotChange(){}render(){return E`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}static{this.styles=g`
    /* the host's inline height (Chart.style) must reach the canvas parent — chart.js
       measures .container to size the canvas when maintainAspectRatio is false */
    :host {
        display: block;
    }
    .container {
        height: 100%;
        position: relative;
    }
  `}};A([b()],Oo.prototype,`type`,void 0),A([b()],Oo.prototype,`data`,void 0),A([b()],Oo.prototype,`options`,void 0),A([S(`#chart`)],Oo.prototype,`chartElement`,void 0),Oo=A([_(`mateu-chart`)],Oo);var ko=class extends x{updated(e){super.updated(e),this.chart&&=(this.chart.destroy(),void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){let{default:t}=await O(async()=>{let{default:e}=await import(`./vendor-diagrams.js`).then(e=>e.t);return{default:e}},__vite__mapDeps([4,1,2]));if(e!==this.xml)return;this.chart&&this.chart.destroy();let n={container:this.divElement};this.chart=new t(n),this.chart.importXML(e)}handleSlotChange(){}render(){return E`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}static{this.styles=g`
  `}};A([b()],ko.prototype,`xml`,void 0),A([S(`#canvas`)],ko.prototype,`divElement`,void 0),ko=A([_(`mateu-bpmn`)],ko);var Ao=160,jo=56,Mo=220,No=110,Po=60,Fo={ACTION:`#3B82F6`,JOIN:`#8B5CF6`,FORK:`#F59E0B`,END:`#EF4444`,USER_TASK:`#10B981`,PROCESS:`#6366F1`},Io={ACTION:`▶`,JOIN:`⟨`,FORK:`⟩`,END:`◼`,USER_TASK:`👤`,PROCESS:`⚙`},Lo=[`ACTION`,`JOIN`,`FORK`,`END`,`USER_TASK`,`PROCESS`];function Ro(){return`step-`+Math.random().toString(36).slice(2,8)}var zo=class extends x{constructor(...e){super(...e),this.value=`{"name":"New Workflow","steps":[]}`,this.wf={name:`New Workflow`,steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;let t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener(`mousemove`,this.onMouseMove),window.removeEventListener(`mouseup`,this.onMouseUp)}}updated(e){if(e.has(`value`)){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){let e=this.wf.steps??[],t={};e.forEach(e=>{t[e.id]=0});let n=!0;for(;n;)n=!1,e.forEach(e=>{if(e.preconditionStepId!=null&&t[e.preconditionStepId]!==void 0){let r=t[e.preconditionStepId]+1;r>t[e.id]&&(t[e.id]=r,n=!0)}});let r={};e.forEach(e=>{let n=t[e.id]??0;(r[n]??=[]).push(e.id)});let i={...this.positions},a=!1;Object.entries(r).forEach(([e,t])=>{let n=Number(e);t.forEach((e,t)=>{i[e]||(i[e]={x:Po+n*Mo,y:Po+t*No},a=!0)})}),a&&(this.positions=i)}emit(){let e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(n=>n.id===e?{...n,...t}:n)},this.emit()}addStep(){let e=Ro(),t={id:e,type:`ACTION`,name:`New Step`};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};let n=Object.values(this.positions).map(e=>e.y),r=n.length?Math.max(...n)+No:Po;this.positions={...this.positions,[e]:{x:Po,y:r}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(t=>t.id!==e).map(t=>t.preconditionStepId===e?{...t,preconditionStepId:void 0}:t)};let{[e]:t,...n}=this.positions;this.positions=n,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;let n=this.positions[t]??{x:0,y:0},r=this.toSvgPoint(e);this.dragOffset={x:r.x-n.x,y:r.y-n.y},this.svgEl=e.currentTarget.closest(`svg`),window.addEventListener(`mousemove`,this.onMouseMove),window.addEventListener(`mouseup`,this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};let t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){let e=Object.values(this.positions),t=e.length?Math.max(...e.map(e=>e.x))+Ao+Po:600,n=e.length?Math.max(...e.map(e=>e.y))+jo+Po:400;return{w:Math.max(t,600),h:Math.max(n,400)}}render(){let{w:e,h:t}=this.canvasSize(),n=this.wf.steps??[];return E`
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
        `}renderToolbar(){let e=this.wf.status??`DRAFT`;return E`
            <div class="toolbar">
                <span class="wf-name">${this.wf.name}</span>
                <span class="badge badge-${e.toLowerCase()}">${e}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${bo}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${xo}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${So}
                    Export
                </button>
            </div>
        `}renderMeta(){let e=this.wf;return E`
            <div class="meta-panel">
                <div class="meta-grid">
                    <label>Name</label>
                    <input class="inp" .value="${e.name}" @change="${e=>this.updateWf({name:e.target.value})}"/>
                    <label>Description</label>
                    <textarea class="inp" rows="2" @change="${e=>this.updateWf({description:e.target.value})}">${e.description??``}</textarea>
                    <label>Status</label>
                    <select class="inp" @change="${e=>this.updateWf({status:e.target.value})}">
                        ${[`DRAFT`,`ACTIVE`,`DISABLED`,`ARCHIVED`].map(t=>E`
                            <option value="${t}" ?selected="${e.status===t}">${t}</option>`)}
                    </select>
                    <label>Limit concurrent</label>
                    <input type="checkbox" ?checked="${e.limitConcurrentExecutions}"
                           @change="${e=>this.updateWf({limitConcurrentExecutions:e.target.checked})}"/>
                    ${e.limitConcurrentExecutions?E`
                        <label>Max concurrent</label>
                        <input class="inp" type="number" min="0" .value="${String(e.maxConcurrentExecutions??0)}"
                               @change="${e=>this.updateWf({maxConcurrentExecutions:Number(e.target.value)})}"/>
                        <label>Enqueue on limit</label>
                        <input type="checkbox" ?checked="${e.enqueueOnLimit}"
                               @change="${e=>this.updateWf({enqueueOnLimit:e.target.checked})}"/>
                    `:``}
                </div>
            </div>
        `}renderArrow(e){if(!e.preconditionStepId)return T``;let t=this.positions[e.preconditionStepId],n=this.positions[e.id];if(!t||!n)return T``;let r=t.x+Ao,i=t.y+jo/2,a=n.x,o=n.y+jo/2,s=(r+a)/2;return T`
            <path d="M${r},${i} C${s},${i} ${s},${o} ${a},${o}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){let t=this.positions[e.id]??{x:Po,y:Po},n=Fo[e.type]??`#64748b`,r=Io[e.type]??`•`,i=this.selectedId===e.id;return T`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${t=>this.onNodeMouseDown(t,e.id)}"
               @click="${t=>{t.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Ao}" height="${jo}" rx="8"
                      fill="white"
                      stroke="${i?n:`#e2e8f0`}"
                      stroke-width="${i?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${jo}" rx="8" fill="${n}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${jo}" fill="${n}"/>
                <text x="16" y="${33}" text-anchor="middle"
                      font-size="14" fill="white">${r}</text>
                <!-- name -->
                <text x="44" y="${jo/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+`…`:e.name}
                </text>
                <text x="44" y="${36}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${48}" font-size="9" fill="${n}">${e.type}</text>
            </g>
        `}renderPanel(){let e=this.wf.steps.find(e=>e.id===this.selectedId);if(!e)return``;let t=this.wf.steps.filter(t=>t.id!==e.id),n=(e,t)=>E`
            <div class="field">
                <label class="field-label">${e}</label>
                ${t}
            </div>
        `;return E`
            <div class="properties">
                <div class="prop-header">
                    <span>Step Properties</span>
                    <button class="del-btn" title="Delete step"
                            @click="${()=>this.deleteStep(e.id)}">🗑</button>
                    <button class="close-btn" @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${n(`ID`,E`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${n(`Name`,E`<input class="inp" .value="${e.name}"
                        @change="${t=>this.updateStep(e.id,{name:t.target.value})}"/>`)}
                    ${n(`Type`,E`
                        <select class="inp" @change="${t=>this.updateStep(e.id,{type:t.target.value})}">
                            ${Lo.map(t=>E`<option value="${t}" ?selected="${e.type===t}">${t}</option>`)}
                        </select>`)}
                    ${n(`Description`,E`<textarea class="inp" rows="2"
                        @change="${t=>this.updateStep(e.id,{description:t.target.value})}">${e.description??``}</textarea>`)}
                    ${n(`Precondition step`,E`
                        <select class="inp" @change="${t=>this.updateStep(e.id,{preconditionStepId:t.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(t=>E`<option value="${t.id}" ?selected="${e.preconditionStepId===t.id}">${t.name} (${t.id})</option>`)}
                        </select>`)}
                    ${n(`Precondition expression`,E`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??``}"
                        @change="${t=>this.updateStep(e.id,{preconditionExpression:t.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${t=>this.updateStep(e.id,{parallel:t.target.checked})}"/>
                    </div>
                    ${n(`Timeout (ms)`,E`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${t=>this.updateStep(e.id,{timeout:Number(t.target.value)})}"/>`)}
                    ${n(`Retries`,E`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${t=>this.updateStep(e.id,{retries:Number(t.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${t=>this.updateStep(e.id,{rollbackable:t.target.checked})}"/>
                    </div>
                    ${e.rollbackable?n(`Compensation step`,E`
                        <select class="inp" @change="${t=>this.updateStep(e.id,{compensationStepId:t.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(t=>E`<option value="${t.id}" ?selected="${e.compensationStepId===t.id}">${t.name} (${t.id})</option>`)}
                        </select>`):``}

                    ${e.type===`ACTION`?n(`Topic`,E`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??``}"
                        @change="${t=>this.updateStep(e.id,{topic:t.target.value||void 0})}"/>`):``}
                    ${e.type===`USER_TASK`?n(`Form ID`,E`<input class="inp"
                        .value="${e.formId??``}"
                        @change="${t=>this.updateStep(e.id,{formId:t.target.value||void 0})}"/>`):``}
                    ${e.type===`PROCESS`?n(`Child workflow ID`,E`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??``}"
                        @change="${t=>this.updateStep(e.id,{childWorkflowDefinitionId:t.target.value||void 0})}"/>`):``}
                </div>
            </div>
        `}exportJson(){let e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=(this.wf.name??`workflow`).replace(/\s+/g,`-`).toLowerCase()+`.json`,r.click(),URL.revokeObjectURL(n)}static{this.styles=[vo,g`
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
    `]}};A([b()],zo.prototype,`value`,void 0),A([w()],zo.prototype,`wf`,void 0),A([w()],zo.prototype,`positions`,void 0),A([w()],zo.prototype,`selectedId`,void 0),A([w()],zo.prototype,`showMeta`,void 0),zo=A([_(`mateu-workflow`)],zo);var Bo=[`string`,`integer`,`number`,`bool`,`date`,`time`,`dateTime`,`dateRange`,`money`,`file`,`array`,`status`,`component`,`menu`,`range`,`action`,`actionGroup`],Vo=[`regular`,`radio`,`checkbox`,`textarea`,`toggle`,`combobox`,`select`,`email`,`password`,`richText`,`listBox`,`html`,`markdown`,`image`,`icon`,`link`,`money`,`grid`,`color`,`choice`,`popover`,`slider`,`button`,`stars`],Ho={string:`#3B82F6`,integer:`#8B5CF6`,number:`#6366F1`,bool:`#10B981`,date:`#F59E0B`,time:`#F59E0B`,dateTime:`#F59E0B`,dateRange:`#F59E0B`,money:`#EF4444`,file:`#64748B`,array:`#0EA5E9`,status:`#EC4899`,component:`#14B8A6`,menu:`#94A3B8`,range:`#A855F7`,action:`#F97316`,actionGroup:`#FB923C`};function Uo(){return`field-`+Math.random().toString(36).slice(2,8)}var Wo=class extends x{constructor(...e){super(...e),this.value=`{"name":"New Form","fields":[]}`,this.form={name:`New Form`,fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has(`value`))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){let e=this.shadowRoot?.querySelector(`.field-list`);!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=oe.create(e,{animation:150,handle:`.drag-handle`,ghostClass:`sortable-ghost`,onEnd:e=>{let{oldIndex:t,newIndex:n}=e;if(t===void 0||n===void 0||t===n)return;let r=[...this.form.fields],[i]=r.splice(t,1);r.splice(n,0,i),this.form={...this.form,fields:r},this.emit()}}))}emit(){let e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(n=>n.id===e?{...n,...t}:n)},this.emit()}addField(){let e=Uo(),t={id:e,label:`New Field`,dataType:`string`};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){let t=this.form.fields.find(t=>t.id===e);if(!t)return;let n={...t,id:Uo(),label:t.label+` (copy)`},r=this.form.fields.findIndex(t=>t.id===e),i=[...this.form.fields];i.splice(r+1,0,n),this.form={...this.form,fields:i},this.selectedId=n.id,this.emit()}render(){return E`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():y}
                <div class="workspace">
                    ${this.renderList()}
                    ${this.selectedId?this.renderPanel():y}
                </div>
            </div>
        `}renderToolbar(){return E`
            <div class="toolbar">
                <span class="form-name">${this.form.name}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${bo}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${xo}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${So}
                    Export
                </button>
            </div>
        `}renderMeta(){let e=this.form;return E`
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
        `}renderList(){let e=this.form.fields;return E`
            <div class="list-wrap">
                ${e.length===0?E`
                    <div class="empty">
                        No fields yet. Click <strong>Add Field</strong> to start.
                    </div>`:y}
                <div class="field-list">
                    ${e.map(e=>this.renderRow(e))}
                </div>
            </div>
        `}renderRow(e){let t=Ho[e.dataType]??`#64748b`;return E`
            <div role="button" tabindex="0" class="field-row ${this.selectedId===e.id?`selected`:``}"
                 data-id="${e.id}"
                 @click="${()=>this.selectedId=this.selectedId===e.id?null:e.id}" @keydown="${R(()=>this.selectedId=this.selectedId===e.id?null:e.id)}">
                <span class="drag-handle" title="Drag to reorder">⠿</span>
                <span class="type-badge" style="background:${t}">${e.dataType}</span>
                <span class="field-label-text">${e.label}</span>
                <span class="field-id-text">${e.id}</span>
                ${e.required?E`<span class="required-badge">required</span>`:y}
                ${e.stereotype&&e.stereotype!==`regular`?E`<span class="stereo-badge">${e.stereotype}</span>`:y}
                <div style="flex:1"></div>
                <button class="row-btn" title="Duplicate"
                        @click="${t=>{t.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${t=>{t.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){let e=this.form.fields.find(e=>e.id===this.selectedId);if(!e)return y;let t=(e,t)=>E`
            <div class="prop-field">
                <label class="prop-label">${e}</label>
                ${t}
            </div>
        `;return E`
            <div class="properties">
                <div class="prop-header">
                    <span>Field Properties</span>
                    <button class="close-btn" @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${t(`ID`,E`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${t(`Label`,E`
                        <input class="inp" .value="${e.label}"
                               @change="${t=>this.updateField(e.id,{label:t.target.value})}"/>`)}
                    ${t(`Data type`,E`
                        <select class="inp"
                                @change="${t=>this.updateField(e.id,{dataType:t.target.value})}">
                            ${Bo.map(t=>E`
                                <option value="${t}" ?selected="${e.dataType===t}">${t}</option>`)}
                        </select>`)}
                    ${t(`Stereotype`,E`
                        <select class="inp"
                                @change="${t=>this.updateField(e.id,{stereotype:t.target.value||void 0})}">
                            ${Vo.map(t=>E`
                                <option value="${t}" ?selected="${(e.stereotype??`regular`)===t}">${t}</option>`)}
                        </select>`)}
                    <div class="prop-field row">
                        <label class="prop-label">Required</label>
                        <input type="checkbox" ?checked="${e.required}"
                               @change="${t=>this.updateField(e.id,{required:t.target.checked})}"/>
                    </div>
                    ${t(`Description / hint`,E`
                        <textarea class="inp" rows="3"
                                  @change="${t=>this.updateField(e.id,{description:t.target.value||void 0})}">${e.description??``}</textarea>`)}
                </div>
            </div>
        `}exportJson(){let e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=(this.form.name??`form`).replace(/\s+/g,`-`).toLowerCase()+`.json`,r.click(),URL.revokeObjectURL(n)}static{this.styles=[vo,z,g`
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
    `]}};A([b()],Wo.prototype,`value`,void 0),A([w()],Wo.prototype,`form`,void 0),A([w()],Wo.prototype,`selectedId`,void 0),A([w()],Wo.prototype,`showMeta`,void 0),Wo=A([_(`mateu-form-editor`)],Wo);var Go=class extends x{constructor(...e){super(...e),this.appState={},this.appData={},this.open=!1,this.activeTab=`appstate`,this.hoveredTag=``,this.hoveredId=``,this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith(`mateu-`)&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline=``,this._prevTarget.style.outlineOffset=``,this._prevTarget=null,this.hoveredTag=``,this.hoveredId=``,this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline=``,this._prevTarget.style.outlineOffset=``),this._prevTarget=t,t.style.outline=`2px solid #0070f3`,t.style.outlineOffset=`-2px`,this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||``,this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener(`mouseover`,this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener(`mouseover`,this._onMouseover,!0),this._prevTarget&&=(this._prevTarget.style.outline=``,null)}_fmt(e){try{return JSON.stringify(e,null,2)??`null`}catch{return String(e)}}_renderTab(e,t){return E`
            <button class="tab ${this.activeTab===e?`tab--active`:``}"
                @click=${()=>{this.activeTab=e}}>
                ${t}
            </button>
        `}render(){return this.open?E`
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
                        ${this.activeTab===`appstate`?E`
                            <pre class="json">${this._fmt(this.appState)}</pre>
                        `:y}
                        ${this.activeTab===`appdata`?E`
                            <pre class="json">${this._fmt(this.appData)}</pre>
                        `:y}
                        ${this.activeTab===`inspector`?E`
                            ${this.hoveredTag?E`
                                <div class="inspector-tag">&lt;${this.hoveredTag}${this.hoveredId?` id="${this.hoveredId}"`:``}&gt;</div>
                                <div class="section-label">state</div>
                                <pre class="json">${this._fmt(this.hoveredState)}</pre>
                                <div class="section-label">data</div>
                                <pre class="json">${this._fmt(this.hoveredData)}</pre>
                                <div class="section-label">metadata</div>
                                <pre class="json">${this._fmt(this.hoveredMeta)}</pre>
                            `:E`
                                <div class="inspector-hint">Hover a mateu-* element to inspect it</div>
                            `}
                        `:y}
                    </div>
                </div>
            `:E`
            <button class="fab" @click=${()=>{this.open=!0}} title="Mateu Debug">🐛</button>
        `}static{this.styles=g`
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
    `}};A([b()],Go.prototype,`appState`,void 0),A([b()],Go.prototype,`appData`,void 0),A([w()],Go.prototype,`open`,void 0),A([w()],Go.prototype,`activeTab`,void 0),A([w()],Go.prototype,`hoveredTag`,void 0),A([w()],Go.prototype,`hoveredId`,void 0),A([w()],Go.prototype,`hoveredState`,void 0),A([w()],Go.prototype,`hoveredData`,void 0),A([w()],Go.prototype,`hoveredMeta`,void 0),Go=A([_(`mateu-debug-overlay`)],Go);var Ko=(e,t)=>{let n=t?.initiatorState;return n&&typeof n==`object`?{...n}:{...e??{}}},qo=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}},Jo=function(e){return e.SetAppDataValue=`SetAppDataValue`,e.SetAppStateValue=`SetAppStateValue`,e.SetDataValue=`SetDataValue`,e.RunAction=`RunAction`,e.RunJS=`RunJS`,e.SetAttributeValue=`SetAttributeValue`,e.SetStateValue=`SetStateValue`,e.SetCssClass=`SetCssClass`,e.SetStyle=`SetStyle`,e}({}),Yo=function(e){return e.required=`required`,e.disabled=`disabled`,e.hidden=`hidden`,e.pattern=`pattern`,e.minValue=`minValue`,e.maxValue=`maxValue`,e.minLength=`minLength`,e.maxLength=`maxLength`,e.css=`css`,e.style=`style`,e.theme=`theme`,e.errorMessage=`errorMessage`,e.description=`description`,e.none=`none`,e}({}),Xo=function(e){return e.Continue=`Continue`,e.Stop=`Stop`,e}({}),Zo=12e4,Qo=(e,t)=>`${e??`_`}::${t}`,$o=new class{constructor(){this.started=new Map,this.listeners=new Set}begin(e,t=Date.now()){let n=this.started.get(e);return n!==void 0&&t-n<Zo?!1:(this.started.set(e,t),this.emit(),!0)}end(e){this.started.delete(e)&&this.emit()}isPending(e,t=Date.now()){let n=this.started.get(e);return n!==void 0&&t-n<Zo}snapshot(){return new Set(this.started.keys())}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}reset(){this.started.clear(),this.emit()}emit(){let e=this.snapshot();this.listeners.forEach(t=>t(e))}},es=`data-mateu-pending-styles`,ts=`
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
`,ns=new WeakSet,rs=e=>{if(ns.has(e))return;ns.add(e);let t=e;if(typeof CSSStyleSheet<`u`&&Array.isArray(t.adoptedStyleSheets))try{let e=new CSSStyleSheet;e.replaceSync(ts),t.adoptedStyleSheets=[...t.adoptedStyleSheets,e];return}catch{}let n=e instanceof Document?e.head:e;if(!n)return;let r=document.createElement(`style`);r.setAttribute(es,``),r.textContent=ts,n.appendChild(r)},is=e=>{let t=e.getRootNode();if(t instanceof ShadowRoot||t instanceof Document)return t},as=e=>{if(!e||e.hasAttribute(`data-mateu-pending`))return;let t=is(e);t&&rs(t),e.setAttribute(`data-mateu-pending`,``),e.setAttribute(`aria-busy`,`true`)},os=e=>{e&&(e.removeAttribute(`data-mateu-pending`),e.removeAttribute(`aria-busy`))},ss=e=>{let t=(typeof e.composedPath==`function`?e.composedPath():[])[0]??e.target;return t instanceof Element?t:void 0},cs=[`button`,`a[href]`,`[role="button"]`,`[role="menuitem"]`,`input[type="button"]`,`input[type="submit"]`,`vaadin-button`,`vaadin-menu-bar-button`,`ui5-button`,`oj-c-button`,`oj-button`].join(`, `),ls=e=>{if(!(!e||typeof e.closest!=`function`))return e.closest(cs)??void 0},us=null,ds=class extends Ka{constructor(...e){super(...e),this.baseUrl=``,this.route=``,this.consumedRoute=``,this.formerState={},this.applyRules=()=>{let e=this.component.rules;if(e&&e.length>0){let t=this.state,n=this.data,r=this.appState,i=this.appData,a=this.component,o=e=>St(e,t,n,{appState:r,appData:i,component:a}),s=e=>xt(e,t,n,r,i,{component:a}),c=[`state`,`data`,`appState`,`appData`,`component`],l=[t,n,r,i,a],u={...this.state},d={...this.data},f=!1,p=!1;for(let t=0;t<e.length;t++){let n=e[t];try{if(o(n.filter)){if(Jo.SetStateValue==n.action||Jo.SetDataValue==n.action){let e=Jo.SetStateValue==n.action?u:d,t=n.fieldName.split(`,`);for(let r=0;r<t.length;r++){let i=t[r];if(!e[i]||e[i]!=n.value){let t=n.expression?s(n.expression):n.value,r=Yo.none==n.fieldAttribute?i:i+`.`+n.fieldAttribute;t!=e[r]&&(e[r]=t,Jo.SetStateValue==n.action&&(f=!0),Jo.SetDataValue==n.action&&(p=!0))}}}if(Jo.RunAction==n.action&&this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.actionId},bubbles:!0,composed:!0})),Jo.RunJS==n.action&&Function(...c,n.value)(...l),Jo.SetAttributeValue==n.action){let e=n.expression?o(n.expression):n.value;if(n.fieldAttribute==`disabled`){e?this.shadowRoot?.getElementById(n.fieldName)?.setAttribute(n.fieldAttribute,`disabled`):this.shadowRoot?.getElementById(n.fieldName)?.removeAttribute(n.fieldAttribute);continue}this.shadowRoot?.getElementById(n.fieldName)?.setAttribute(n.fieldAttribute,e)}if(Jo.SetCssClass==n.action&&this.shadowRoot?.getElementById(n.fieldName)?.setAttribute(`class`,n.value),Jo.SetStyle==n.action&&this.shadowRoot?.getElementById(n.fieldName)?.style.setProperty(n.expression,n.value),Xo.Stop==n.result)break}}catch(e){console.error(`rule failed`,n,e)}}f&&(this.state=u),p&&(this.data=d),f&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes(`-`),this.checkValidations=e=>{let t=e?e.split(`,`):void 0,n=this.component.validations,r=!0,i=!1,a=this.data??{},o={...this.data??{},errors:{}};if(n){for(let e=0;e<n.length;e++){let r=n[e];if(this.skipValidation(t,r))continue;let i=(r.fieldId??`_component`).split(`,`);for(let e=0;e<i.length;e++){let t=i[e];o.errors[t]=[]}}for(let e=0;e<n.length;e++){let i=n[e];if(!this.skipValidation(t,i))try{let e=i.condition&&i.condition.includes("${")?this._evalTemplate(i.condition):this._evalExpr(i.condition);if(i.condition&&!e){r=!1;let e=(i.fieldId??`_component`).split(`,`);for(let t=0;t<e.length;t++){let n=e[t],r=o.errors[n];if(r||(o.errors[n]=[]),r=o.errors[n],!a[n]){let e=i.message;try{e=this._evalTemplate(i.message)}catch{}r.push(e)}}}}catch(e){console.error(`validation failed`,i,e)}}for(let e=0;e<n.length;e++){let r=n[e];if(this.skipValidation(t,r))continue;let s=(r.fieldId??`_component`).split(`,`);for(let e=0;e<s.length;e++){let t=s[e];if((a.errors||o.errors==``)&&[t].join(`,`)){i=!0;break}}}(a.errors||o.errors==``)&&[`_component`].join(`,`)&&(i=!0)}o._valid=r,o._valid!=a._valid&&(i=!0),i&&(this.data=o)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){let t=e.detail,n={};t.fieldIds.forEach(e=>{n[e]=void 0}),n.searchText=void 0,this.state={...this.state,...n}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){let t=e.detail,n={};n[t.key]=t.value,e.type==`data-changed`&&(this.data={...this.data,...n})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){let t=e.detail;if(e.type==`value-changed`){let n={...this.state};n[t.fieldId]=t.value,this.state=n,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent(`dirty`,{detail:e.detail,bubbles:!0,composed:!0}));let r=this.component;r.triggers?.filter(e=>e.type==Ga.OnValueChange).filter(e=>!e.propertyName||t.fieldId==e.propertyName).forEach(e=>{(!e.condition||this._evalExpr(e.condition))&&this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}),r.triggers?.filter(e=>e.type==Ga.AutoSave).forEach(e=>{let t=e.actionId,n=this._autoSaveTimers.get(t);n!==void 0&&clearTimeout(n),this._autoSaveTimers.set(t,setTimeout(()=>{this._autoSaveTimers.delete(t),this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))},e.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{let t=e.detail,n=t?._originElement??ss(e);if(e.type==`action-requested`){e.preventDefault(),e.stopPropagation();let r=this.component,i=r.actions?.find(e=>e.id==t.actionId)??r.actions?.find(e=>e.id.endsWith(`*`)&&t.actionId.startsWith(e.id.replace(`*`,``)));if(i){if(i&&i.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify(`You first need to select some rows`);return}if(i&&i.validationRequired){let e=us??this;if(us=null,e.checkValidations(i.fieldsToValidate),!e.data._valid){e.notifyValidationErrors();return}}us=null;let e={...t,initiatorComponentId:this.id};i&&i.confirmationRequired?this.callAfterConfirmation(i,()=>this.requestActionCallToServerOrBubble(e,r,i,n)):this.requestActionCallToServerOrBubble(e,r,i,n)}else{let r={...t.parameters};r.initiatorState||=this.state,us||=this,this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,_originElement:n,parameters:r},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{let e={},t=n=>{if(n)for(let r of n){let n=r.metadata;if(n?.type===M.FormField){let t=n;t.fieldId&&t.label&&(e[t.fieldId]=t.label)}t(r.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{let e=this.data?.errors??{},t=this.buildFieldLabelMap(),n=[];if(Object.entries(e).forEach(([e,r])=>{if(!Array.isArray(r))return;let i=e===`_component`?void 0:t[e]??e;r.forEach(e=>{e&&!n.some(t=>t.label===i&&t.msg===e)&&n.push({label:i,msg:e})})}),n.length===0){this.notify(`There are validation errors`);return}Fa({text:`There are validation errors
`+n.map(({label:e,msg:t})=>e?`• ${e}: ${t}`:`• ${t}`).join(`
`),variant:`error`,position:`bottomEnd`,duration:Math.max(3e3,1500+n.length*1e3)},this),this.focusFirstInvalidField()},this.notify=e=>{Fa({text:e,variant:`error`,position:`bottomEnd`,duration:3e3},this)},this.handleRestAction=(e,t)=>{let n=t=>{if(e.resultPath!=null){let n=ln(t,e.resultPath);n&&typeof n==`object`&&(this.state={...this.state,...n})}let n=N(e.successMessage,this.state,this.data);n&&Fa({text:n,variant:`success`,position:`bottomEnd`,duration:3e3},this)};if(e.source?.proxy){let e=t===`__restdata__`?`data`:`action`;this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:`__restfetch__`,parameters:{_sourceKind:e,_sourceId:t},callback:e=>n(e?.appData?._restfetch),callbackonly:!0},bubbles:!0,composed:!0}));return}fn(e.source,e=>N(e,this.state,this.data)).then(n).catch(e=>{console.warn(`mateu: rest action failed`,e),Fa({text:`Request failed`,variant:`error`,position:`bottomEnd`,duration:3e3},this)})},this.callAfterConfirmation=(e,t)=>{let n=`One moment, please`,r=`Are you sure?`,i=`Yes`,a=`No`;e.confirmationTexts&&(n=e.confirmationTexts.title,r=e.confirmationTexts.message,i=e.confirmationTexts.confirmationText,a=e.confirmationTexts.denialText);let o=document.createElement(`div`);o.style.cssText=`position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);padding:1rem;`;let s=document.createElement(`div`);s.style.cssText=`background:var(--lumo-base-color,#fff);color:var(--lumo-body-text-color,#1a1a1a);border-radius:var(--lumo-border-radius-l,12px);box-shadow:var(--lumo-box-shadow-xl,0 12px 40px rgba(0,0,0,.3));padding:1.2rem;max-width:min(90vw,26rem);`;let c=()=>{o.parentElement&&document.body.removeChild(o)},l=`font:inherit;font-weight:600;padding:.45rem 1rem;border-radius:var(--lumo-border-radius-m,6px);cursor:pointer;`;ne(E`
            <h3 style="margin:0 0 .5rem;">${n}</h3>
            <div style="margin-bottom:1.2rem;">${r}</div>
            <div style="display:flex;justify-content:flex-end;gap:.5rem;">
                <button style="${l}border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.25));background:var(--lumo-base-color,#fff);"
                        @click="${()=>c()}">${a}</button>
                <button style="${l}border:none;background:var(--lumo-primary-color,#1676f3);color:var(--lumo-primary-contrast-color,#fff);"
                        @click="${()=>{c(),t()}}">${i}</button>
            </div>
        `,s),o.appendChild(s),o.addEventListener(`click`,e=>{e.target===o&&c()}),document.body.appendChild(o)},this.requestActionCallToServerOrBubble=(e,t,n,r)=>{if(n&&n.bubble){let t={...e.parameters};t.initiatorState||=this.state,this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{...e,_originElement:r,parameters:t},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,n,r)},this.requestActionCallToServer=(e,t,n,r)=>{if(n&&n.href){window.location.href=n.href;return}if(n&&n.js)try{Function(`state`,`data`,`appState`,`appData`,`component`,n.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(e){console.error(`when evaluating `+n.js,e,this.component,this.state,this.data)}if(n&&n.customEvent&&this.dispatchEvent(new CustomEvent(n.customEvent.name,{detail:n.customEvent.detail,bubbles:!0,composed:!0})),n&&(n.js||n.customEvent))return;if(n&&n.restAction){this.handleRestAction(n.restAction,n.id);return}if(e.actionId==`search`){let t=e.parameters?._searchState;t?this.state={...this.state,...t}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}if(!n?.background){if(!tt(e.actionId,n?.idempotent)&&!$o.begin(Qo(this.id,e.actionId)))return;let t=ls(r);this._pendingOrigins.set(e.actionId,t),as(t)}let i=Ko(this.state,e.parameters);this.dispatchEvent(new CustomEvent(`server-side-action-requested`,{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:i,parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:n?.background,sse:n?.sse,timeoutMillis:n?.timeoutMillis,idempotent:n?.idempotent,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(e=>e.type==Ga.OnSuccess).filter(t=>e.detail.actionId==t.calledActionId).forEach(t=>{if(!t.condition||this._evalExpr(t.condition))if(e.preventDefault(),e.stopPropagation(),t.timeoutMillis>0){let e=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,callbackToken:e},bubbles:!0,composed:!0}))},t.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(e=>e.type==Ga.OnError).filter(t=>e.detail.actionId==t.calledActionId).forEach(t=>{(!t.condition||this._evalExpr(t.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0})))})},this._pendingOrigins=new Map,this._backendSettledListener=e=>{((typeof e.composedPath==`function`?e.composedPath():[])[0]??e.target)===this&&this._releasePending(e.detail?.actionId)},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;let t=this.component;if(t)for(let n of t.actions??[]){let t=n.shortcut||(n.runOnEnter?`enter`:null);if(t&&this._shortcutMatchesEvent(t,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return P.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has(`state`)&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has(`component`)&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent(`clean`,{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}focusFirstInvalidField(){let e=t=>requestAnimationFrame(()=>{let n=this.findFirstInvalid(this.renderRoot);if(n){n.focus?.(),n.scrollIntoView?.({block:`center`,behavior:`smooth`});return}t>0&&e(t-1)});e(3)}findFirstInvalid(e){if(!e?.querySelectorAll)return null;for(let t of Array.from(e.querySelectorAll(`*`))){if(t.invalid===!0)return t;if(t.shadowRoot){let e=this.findFirstInvalid(t.shadowRoot);if(e)return e}}return null}_releasePending(e){(e===void 0?Array.from(this._pendingOrigins.keys()):[e]).forEach(e=>{$o.end(Qo(this.id,e)),os(this._pendingOrigins.get(e)),this._pendingOrigins.delete(e)})}_shortcutMatchesEvent(e,t){return ar(e,t)}_collectShortcutTabs(){let e=this.renderRoot;if(!e)return[];let t=Array.from(e.querySelectorAll(`vaadin-tab[data-shortcut]`));return e.querySelectorAll(`mateu-drawer, mateu-dialog`).forEach(e=>{let n=e.shadowRoot;n&&t.push(...Array.from(n.querySelectorAll(`vaadin-tab[data-shortcut]`)))}),t}_handleTabShortcut(e){let t=this._collectShortcutTabs();if(t.length===0)return!1;for(let n of Array.from(t)){let t=n.dataset.shortcut;if(!t||!this._shortcutMatchesEvent(t,e))continue;let r=n.closest(`vaadin-tabs`);if(!r)continue;let i=Array.from(r.querySelectorAll(`vaadin-tab`)).indexOf(n);if(!(i<0))return e.preventDefault(),r.selected=i,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener(`backend-call-succeeded`,this.handleBackendSucceeded),this.addEventListener(`backend-call-failed`,this.handleBackendFailed),this.addEventListener(`backend-succeeded-event`,this._backendSettledListener),this.addEventListener(`backend-failed-event`,this._backendSettledListener),this.addEventListener(`backend-cancelled-event`,this._backendSettledListener),document.addEventListener(`keydown`,this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`backend-call-succeeded`,this.handleBackendSucceeded),this.removeEventListener(`backend-call-failed`,this.handleBackendFailed),this.removeEventListener(`backend-succeeded-event`,this._backendSettledListener),this.removeEventListener(`backend-failed-event`,this._backendSettledListener),this.removeEventListener(`backend-cancelled-event`,this._backendSettledListener),document.removeEventListener(`keydown`,this._keydownListener),this._releasePending()}render(){return E`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?E`
                <div><ul>${this.data.errors._component.map(e=>E`<li>${e}</li>`)}</ul></div>
            `:y}</div>`}_render(){if(this.component?.type==j.ClientSide){let e=this.component;return e.metadata?.type==M.Page?Hr(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==M.Crud?Ur(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):P.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return E`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==j.ClientSide){let t=e;if(t.metadata?.type==M.Page)return Hr(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==M.Crud)return Ur(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return F(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}static{this.styles=g`
        :host {
        }

        ${re(ue.cssText)}
        
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
  `}};A([b()],ds.prototype,`baseUrl`,void 0),A([b()],ds.prototype,`route`,void 0),A([b()],ds.prototype,`consumedRoute`,void 0),ds=A([_(`mateu-component`)],ds);var fs=new class{async handle(e,t){return await e.runAction(t.baseUrl,t.route,t.consumedRoute,t.actionId,t.initiatorComponentId,t.appState,t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.options)}},ps=new class{constructor(){this.handleUIIncrement=(e,t,n)=>{if(e?.fragments?.forEach(e=>{ce.next({command:void 0,fragment:e,ui:void 0,error:void 0,callbackToken:n})}),e?.appState&&(k.value={...e.appState},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))),e?.appData){let n=e?.appData;le.value={...e.appData,...n},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))}e?.messages?.forEach(e=>{Fa({text:e.text,position:e.position,variant:e.variant,duration:e.duration,undoLabel:e.undoLabel,undoActionId:e.undoActionId,undoParameters:e.undoParameters},t)}),e?.banners&&e.banners.length>0&&document.dispatchEvent(new CustomEvent(`page-banners-received`,{detail:{banners:e.banners,append:e.appendBanners??!1},bubbles:!1,composed:!1})),e?.commands?.forEach(e=>{ce.next({command:e,fragment:void 0,ui:void 0,error:void 0,callbackToken:n})})}}async runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h={}){let ee=()=>{this.runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)};try{let o=await fs.handle(e,{baseUrl:t,route:n,consumedRoute:r,actionId:i,appState:k.value,initiatorComponentId:a,componentState:c,parameters:l,serverSideType:s,initiator:u,background:d,options:{...h,retry:ee}});f&&f(o),p||this.handleUIIncrement(o,u,m),o.messages&&o.messages.length==1&&o.messages[0].variant==`error`&&u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-succeeded`,{detail:{actionId:i,evevntId:D()},bubbles:!0,composed:!0}))}catch(e){console.warn(`Action request failed`,e),e?.__mateuReported||u.dispatchEvent(new CustomEvent(`backend-failed-event`,{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(e),retry:ee}})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0}))}}serialize(e){return e?.message?e:JSON.stringify(e)}},ms=new class{constructor(){this.handleUIIncrement=(e,t,n)=>{if(e?.messages?.forEach(e=>{Fa({text:e.text,position:e.position,variant:e.variant,duration:e.duration,undoLabel:e.undoLabel,undoActionId:e.undoActionId,undoParameters:e.undoParameters},t)}),e?.banners&&e.banners.length>0&&document.dispatchEvent(new CustomEvent(`page-banners-received`,{detail:{banners:e.banners,append:e.appendBanners??!1},bubbles:!1,composed:!1})),e?.commands?.forEach(e=>{ce.next({command:e,fragment:void 0,ui:void 0,error:void 0,callbackToken:n})}),e?.fragments?.forEach(e=>{ce.next({command:void 0,fragment:e,ui:void 0,error:void 0,callbackToken:n})}),e?.appState&&(k.value={...e.appState},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))),e?.appData){let n=e?.appData;le.value={...e.appData,...n},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))}}}async runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h={}){let ee=()=>{this.runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)};if(n){n||=`_no_route`,n&&n.startsWith(`/`)&&(n=n.substring(1));let e={serverSideType:s,appState:k.value,componentState:c,parameters:l,initiatorComponentId:a,consumedRoute:r,route:`/`+n,actionId:i};d||u.dispatchEvent(new CustomEvent(`backend-called-event`,{bubbles:!0,composed:!0,detail:{}}));let o={Accept:`text/event-stream`,"Content-Type":`application/json`},h=localStorage.getItem(`__mateu_auth_token`);h&&(o.Authorization=`Bearer `+h);let te=sessionStorage.getItem(`__mateu_sesion_id`);te&&(o[`X-Session-Id`]=te),fetch(t+`/mateu/v3/sse/`+n,{method:`POST`,headers:o,body:JSON.stringify(e)}).then(async e=>{let t=e.body?.pipeThrough(new TextDecoderStream).getReader();if(t){let e=``;for(;;){let{value:n,done:r}=await t.read();if(r)break;e+=n;let a=e.split(`

`);e=a.pop()??``;for(let e of a){let t=e.trim();if(t)if(t.startsWith(`data:`)){let e=JSON.parse(t.substring(5).trim());f&&f(e),p||this.handleUIIncrement(e,u,m),e.messages&&e.messages.length==1&&e.messages[0].variant==`error`&&u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0}))}else{let e=t;try{let n=JSON.parse(t);e=n.message,n._embedded?.errors?.length>0&&n._embedded.errors[0].message&&(e=n._embedded.errors[0].message)}catch{}throw Error(e)}}}}d||u.dispatchEvent(new CustomEvent(`backend-succeeded-event`,{bubbles:!0,composed:!0,detail:{actionId:i}})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-succeeded`,{detail:{actionId:i},bubbles:!0,composed:!0}))}).catch(e=>{u.dispatchEvent(new CustomEvent(`backend-failed-event`,{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(e),retry:ee}})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0}))})}}serialize(e){return e?.message?e:JSON.stringify(e)}},hs={fixed:`fixed`,fullWidth:`full`,edgeToEdge:`edge`},gs=new Set([M.Gantt,M.PlanningBoard,M.Kanban,M.Bpmn,M.Workflow,M.Map]),_s={landing:`fixed`,form:`fixed`,process:`fixed`},vs=e=>e?hs[e]:void 0,ys=e=>e.type==j.ClientSide?e.metadata:void 0,bs=e=>{let t=ys(e);if(t?.type==M.Page){let e=vs(t.pageWidth);if(e)return e}for(let t of e.children??[]){let e=bs(t);if(e)return e}},xs=e=>{let t=e.pageType;if(t)return t;let n=e=>{let t=ys(e);if(t?.type==M.Page&&t.pageType)return t.pageType;for(let t of e.children??[]){let e=n(t);if(e)return e}};return n(e)},Ss=e=>{let t=ys(e);if(t?.type!=M.Crud)return!1;let n=t;return n.compact?!0:(n.columns??[]).some(e=>e.metadata?.editable)},Cs=(e,t)=>t(e)||(e.children??[]).some(e=>Cs(e,t)),ws=e=>!!e&&Cs(e,e=>ys(e)?.type==M.HeroSection),Ts=e=>ys(e)?.type==M.App||(e.children??[]).some(e=>ys(e)?.type==M.App),Es=(e,t)=>e?(vs(e.pageWidth)??bs(e))||(t?.top&&Ts(e)?`edge`:_s[xs(e)??``]||(Cs(e,e=>{let t=ys(e)?.type;return t!=null&&gs.has(t)})?`edge`:Cs(e,Ss)?`full`:`fixed`)):`fixed`,Ds=`mateu-route-structure-cache`,Os=1,ks=50,As=(()=>{try{return localStorage.getItem(`mateu-route-structure-cache-off`)!==`1`}catch{return!0}})(),js=()=>{try{return JSON.parse(localStorage.getItem(Ds)??`{}`)}catch{return{}}},Ms=e=>{try{localStorage.setItem(Ds,JSON.stringify(e))}catch{try{let t=Object.entries(e).sort((e,t)=>t[1].t-e[1].t).slice(0,Math.floor(ks/2));localStorage.setItem(Ds,JSON.stringify(Object.fromEntries(t)))}catch{}}},Ns=e=>{let t=e.initialState&&Object.keys(e.initialState).length?`#`+Is(JSON.stringify(e.initialState)):``;return[e.baseUrl,e.consumedRoute??``,e.route??``,e.serverSideType??``].join(`|`)+t},Ps=e=>{if(!As)return;let t=js()[e];if(!(!t||t.v!==Os))return{component:t.component,hash:t.hash}},Fs=(e,t,n)=>{if(!As)return;let r=js();r[e]={v:Os,t:Date.now(),component:t,hash:n};let i=Object.keys(r);if(i.length>ks){let e=i.sort((e,t)=>r[e].t-r[t].t).slice(0,i.length-ks);for(let t of e)delete r[t]}Ms(r)},Is=e=>{let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return(t>>>0).toString(36)},Ls=30,Rs=new Map,zs=!0,Bs=e=>{if(zs)return Rs.get(e)},Vs=(e,t)=>{if(zs&&(Rs.delete(e),Rs.set(e,t),Rs.size>Ls)){let e=Rs.keys().next().value;e!==void 0&&Rs.delete(e)}},Hs,X=class extends ht{static{Hs=this}constructor(...e){super(...e),this.consumedRoute=``,this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.showSkeleton=!1,this.pendingRouteFocus=!1,this.hasRenderedContent=!1,this.loadLifecycleListener=e=>{if(((typeof e.composedPath==`function`?e.composedPath():[])[0]??e.target)===this)if(clearTimeout(this.skeletonTimer),e.type===`backend-called-event`){if(this.fragment?.component)return;this.skeletonTimer=setTimeout(()=>{this.showSkeleton=!0},Hs.SKELETON_DELAY_MS)}else this.showSkeleton=!1},this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t==`string`&&(t===``||t.startsWith(`/`))&&this.consumedRoute&&this.consumedRoute!==`_empty`&&this.consumedRoute.startsWith(`/`)&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t=t.startsWith(`/`)&&this.uriPrefix.endsWith(`/`)?this.uriPrefix+t.substring(1):!t.startsWith(`/`)&&!this.uriPrefix.endsWith(`/`)?this.uriPrefix+`/`+t:this.uriPrefix+t),this.dispatchEvent(new CustomEvent(`url-update-requested`,{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==``&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:j.ClientSide,metadata:{type:M.Element,name:`div`,content:`Not found`},id:`fieldId`},action:Wa.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;let t=this.detail1;if(e.type==`server-side-action-requested`){let e=ps;t.sse&&(e=ms),e.runAction(ct,this.baseUrl,t.route??``,t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken,{timeoutMillis:t.timeoutMillis,idempotent:t.idempotent,knownStructureHash:t.knownStructureHash})}},this.getCustomisedAppState=()=>{let e={...k.value};if(this.overrides){let t=qo(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw Error(`Method not implemented.`)}createRenderRoot(){return P.mustUseShadowRoot()?super.createRenderRoot():this}structureCacheKey(){return Ns({baseUrl:this.baseUrl,consumedRoute:this.consumedRoute,route:this.route,serverSideType:this.serverSideType,initialState:this.initialState})}focusNewContent(){requestAnimationFrame(()=>{let e=this.renderRoot?.querySelector?.(`h1, h2, [role="heading"]`)??this;e.hasAttribute(`tabindex`)||e.setAttribute(`tabindex`,`-1`),e.focus?.({preventScroll:!0})})}static{this.SKELETON_DELAY_MS=400}connectedCallback(){super.connectedCallback(),this.overridesParsed=qo(this.overrides),this.addEventListener(`server-side-action-requested`,this.actionRequestedListener),this.addEventListener(`backend-call-failed`,this.backendFailedListener),this.addEventListener(`history-pushed`,this.historyPushed),this.addEventListener(`route-changed`,this.routeChangedListener),this.addEventListener(`backend-called-event`,this.loadLifecycleListener),this.addEventListener(`backend-succeeded-event`,this.loadLifecycleListener),this.addEventListener(`backend-failed-event`,this.loadLifecycleListener),this.addEventListener(`backend-cancelled-event`,this.loadLifecycleListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`server-side-action-requested`,this.actionRequestedListener),this.removeEventListener(`backend-call-failed`,this.backendFailedListener),this.removeEventListener(`history-pushed`,this.historyPushed),this.removeEventListener(`route-changed`,this.routeChangedListener),this.removeEventListener(`backend-called-event`,this.loadLifecycleListener),this.removeEventListener(`backend-succeeded-event`,this.loadLifecycleListener),this.removeEventListener(`backend-failed-event`,this.loadLifecycleListener),this.removeEventListener(`backend-cancelled-event`,this.loadLifecycleListener),clearTimeout(this.skeletonTimer)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(e=>e===`appState`||e===`appData`)){let t=this.renderRoot.querySelector(`mateu-component`);if(t)return e.has(`appState`)&&(t.appState=this.appState),e.has(`appData`)&&(t.appData=this.appData),!1}return!0}updated(e){if((e.has(`id`)||e.has(`baseurl`)||e.has(`route`)||e.has(`consumedRoute`)||e.has(`instant`))&&!this.preventNavigation){this.callbackToken=this.instant||D();let e=this.structureCacheKey(),t=e===this.lastAuthoritativeKey?void 0:Bs(e);if(t)queueMicrotask(()=>this.applyFragment(t));else{if(e!==this.lastAuthoritativeKey){let t=Ps(e);this.currentStructureHash=t?.hash,t&&(this.fragment={targetComponentId:this.id,component:t.component,state:{},data:{},action:Wa.Replace,containerId:void 0})}this.manageActionEvent(new CustomEvent(`server-side-action-requested`,{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:``,serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,componentState:this.initialState,knownStructureHash:this.currentStructureHash,callbackToken:this.callbackToken},bubbles:!0,composed:!0}))}}e.has(`route`)&&this.top&&(this.preventNavigation||(this.pendingRouteFocus=!0),this.preventNavigation||this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&=!1}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}if(this.fragment=e,e.component){if(e.action!==Wa.Add){let t=this.structureCacheKey(),n=e.component.structureHash;Fs(t,e.component,n),this.lastAuthoritativeKey=t,this.currentStructureHash=n,e.component.staticView&&Vs(t,e)}this.pendingRouteFocus&&this.hasRenderedContent&&this.focusNewContent(),this.pendingRouteFocus=!1,this.hasRenderedContent=!0}e.component&&(this.dataset.pageWidth=Es(e.component,{top:this.top}),this.dataset.pageType=xs(e.component)??``,this.dataset.hasWelcomeBanner=String(ws(e.component)))}render(){return!this.fragment?.component&&this.showSkeleton?E`
                <div class="route-skeleton" aria-busy="true" aria-live="polite">
                    <mateu-skeleton variant="text" count="1"></mateu-skeleton>
                    <mateu-skeleton variant="form" count="4"></mateu-skeleton>
                </div>
            `:E`
           ${this.fragment?.component?F(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):y}
       `}static{this.styles=g`
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
           (1408px) centrada; full = fluido sin tope pero CON gutter de 24px siempre (el
           contenido posee el gutter — así una página SUELTA sin app-shell no queda a sangre
           por accidente; dentro de un app-shell el shell ya aporta su propio padding); edge =
           a sangre — los gutters del shell caen por el hook no-padding (compact-changed) y el
           header de mateu-page conserva el suyo. Solo aplica al mateu-ux de CONTENIDO. */
        :host([data-page-width='fixed']) {
            max-width: min(1408px, 100%);
            margin-inline: auto;
        }
        :host([data-page-width='full']) {
            box-sizing: border-box;
            padding-inline: 24px;
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
  `}};A([b()],X.prototype,`consumedRoute`,void 0),A([b()],X.prototype,`serverSideType`,void 0),A([b()],X.prototype,`uriPrefix`,void 0),A([b()],X.prototype,`overrides`,void 0),A([b()],X.prototype,`homeRoute`,void 0),A([b()],X.prototype,`route`,void 0),A([b()],X.prototype,`top`,void 0),A([b()],X.prototype,`instant`,void 0),A([b()],X.prototype,`initialState`,void 0),A([b()],X.prototype,`appState`,void 0),A([b()],X.prototype,`appData`,void 0),A([w()],X.prototype,`fragment`,void 0),A([w()],X.prototype,`showSkeleton`,void 0),X=Hs=A([_(`mateu-ux`)],X);function Us(e){let t=`var(--lumo-space-m, 1rem)`,n={left:`50%`,transform:`translateX(-50%)`};switch(e){case`topStart`:return{top:t,left:t};case`topCenter`:return{top:t,...n};case`topEnd`:return{top:t,right:t};case`topStretch`:return{top:t,left:t,right:t};case`middle`:return{top:`50%`,left:`50%`,transform:`translate(-50%, -50%)`};case`bottomStart`:return{bottom:t,left:t};case`bottomCenter`:return{bottom:t,...n};case`bottomStretch`:return{bottom:t,left:t,right:t};default:return{bottom:t,right:t}}}function Ws(e){switch(e){case`success`:return{bg:`var(--lumo-success-color, #2e7d32)`,fg:`#fff`};case`error`:return{bg:`var(--lumo-error-color, #c62828)`,fg:`#fff`};case`warning`:return{bg:`var(--lumo-warning-color, #f9a825)`,fg:`#1a1a1a`};case`contrast`:return{bg:`var(--lumo-contrast-90pct, #1a1a1a)`,fg:`#fff`};default:return{bg:`var(--lumo-base-color, #fff)`,fg:`var(--lumo-body-text-color, #1a1a1a)`}}}var Gs={show(e,t){let{bg:n,fg:r}=Ws(e.variant),i=Us(e.position),a=document.createElement(`div`),o=e.variant===`error`;a.setAttribute(`role`,o?`alert`:`status`),a.setAttribute(`aria-live`,o?`assertive`:`polite`),a.setAttribute(`aria-atomic`,`true`),Object.assign(a.style,{position:`fixed`,zIndex:`2000`,display:`flex`,alignItems:`center`,gap:`0.75rem`,maxWidth:`min(90vw, 28rem)`,padding:`0.7rem 1rem`,borderRadius:`var(--lumo-border-radius-m, 8px)`,boxShadow:`var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,0.2))`,background:n,color:r,font:`inherit`,fontSize:`var(--lumo-font-size-s, 0.875rem)`,opacity:`0`,transition:`opacity 0.2s ease`,...i});let s=document.createElement(`span`);s.textContent=e.text,a.appendChild(s);let c=()=>{a.style.opacity=`0`,setTimeout(()=>a.remove(),200)},l=e.onAction?{label:e.actionLabel??`Retry`,run:e.onAction}:e.undoActionId?{label:e.undoLabel??`Undo`,run:()=>t.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0}))}:void 0;if(l){let e=document.createElement(`button`);e.textContent=l.label,e.style.cssText=`margin-left: 0.25rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;`,e.addEventListener(`click`,()=>{l.run(),c()}),a.appendChild(e)}document.body.appendChild(a),requestAnimationFrame(()=>{a.style.opacity=`1`});let u=e.duration??(l?1e4:5e3);u>0&&setTimeout(c,u)}};function Ks(){Pa(Gs)}var qs=class extends x{constructor(...e){super(...e),this.online=!0,this.recovered=!1}connectedCallback(){super.connectedCallback(),this.online=it.isOnline(),this.unsubscribe=it.subscribe(e=>{let t=!this.online;this.online=e,e&&t&&(this.recovered=!0,clearTimeout(this.recoveredTimer),this.recoveredTimer=setTimeout(()=>{this.recovered=!1},4e3))})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),clearTimeout(this.recoveredTimer),this.releaseSpace()}updated(){let e=this.renderRoot.querySelector(`.bar`);if(!e){this.releaseSpace();return}document.body.style.setProperty(`padding-block-start`,`${e.offsetHeight}px`)}releaseSpace(){typeof document<`u`&&document.body?.style.removeProperty(`padding-block-start`)}render(){if(this.online&&!this.recovered)return y;let e=!this.online;return E`<div class="bar ${e?`offline`:`back`}" role="status" aria-live="polite">
            <span class="dot"></span>
            <span>${e?`No connection — changes you make now will not be saved.`:`Connection restored.`}</span>
        </div>`}static{this.styles=g`
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
    `}};A([w()],qs.prototype,`online`,void 0),A([w()],qs.prototype,`recovered`,void 0),qs=A([_(`mateu-connectivity-banner`)],qs);var Js=null;function Ys(){if(!(typeof document>`u`)&&!(Js&&Js.isConnected)){if(!document.body){document.addEventListener(`DOMContentLoaded`,()=>Ys(),{once:!0});return}Js=document.createElement(`mateu-connectivity-banner`),document.body.appendChild(Js)}}var Xs,Zs=class extends x{static{Xs=this}constructor(...e){super(...e),this.skip=()=>{let e=this.findContent();e&&(e.hasAttribute(`tabindex`)||e.setAttribute(`tabindex`,`-1`),e.focus(),e.scrollIntoView({block:`start`}))}}static{this.TARGETS=[`.app-content`,`mateu-page`,`mateu-ux`,`mateu-component`]}findContent(){let e=new Set,t=n=>{if(e.has(n))return null;e.add(n);for(let e of Xs.TARGETS){let t=n.querySelector?.(e);if(t&&t!==this)return t}for(let e of Array.from(n.querySelectorAll?.(`*`)??[]))if(e.shadowRoot){let n=t(e.shadowRoot);if(n)return n}return null};return t(document)}render(){return E`<button class="skip" @click="${this.skip}">Skip to content</button>`}static{this.styles=g`
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
    `}};Zs=Xs=A([_(`mateu-skip-link`)],Zs);var Qs=null;function $s(){if(!(typeof document>`u`)&&!(Qs&&Qs.isConnected)){if(!document.body){document.addEventListener(`DOMContentLoaded`,()=>$s(),{once:!0});return}Qs=document.createElement(`mateu-skip-link`),document.body.insertBefore(Qs,document.body.firstChild)}}Ks(),Ys(),pt(),$s();var ec=class extends x{constructor(...e){super(...e),this.baseUrl=``,this.route=void 0,this.consumedRoute=`_empty`,this.config=void 0,this.top=`true`,this.pathPrefix=void 0,this.bundleUrl=void 0,this.debug=!1,this._lastUrl=``,this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top==`true`){let t=e.detail.route,n=this.baseUrl??``;!t||t.startsWith(`/`)?n=window.location.origin+(this.pathPrefix??``):(t=(this.pathPrefix??``)+t,n.indexOf(`://`)<0&&(n.startsWith(`/`)||(n=`/`+n),n=window.location.origin+n)),t.startsWith(this.pathPrefix+`/`)&&(t=t.substring(this.pathPrefix?.length)),n.endsWith(`/`)&&t.startsWith(`/`)&&(t=t.substring(1));let r=new URL(n+t);if((window.location.pathname||r.pathname)&&window.location.pathname!=r.pathname){let e=r.pathname;r.search&&(e+=r.search),e&&!e.startsWith(`/`)&&(e=`/`+e),window.history.pushState({},``,e),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),no.markClean(),e instanceof CustomEvent){let t=e.detail.route,n=this.renderRoot.querySelector(`mateu-ux`);n&&(n.setAttribute(`route`,t),n.setAttribute(`instant`,D()))}}}createRenderRoot(){return P.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),no.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!no.confirmLeave()){window.history.pushState({},``,this._lastUrl);return}let t=e.target;this.loadUrl(t)},this.top==`true`?(this.bundleUrl&&Ge(this.bundleUrl),this.loadUrl(window)):this.route&&(this.consumedRoute=``),this.config)try{let e=JSON.parse(this.config);k.value={...k.value,...e}}catch{k.value={...k.value,config:this.config}}this.addEventListener(`url-update-requested`,this.routeChangedListener),this.addEventListener(`navigate-to-requested`,this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener(`url-update-requested`,this.routeChangedListener),this.removeEventListener(`navigate-to-requested`,this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute(`route`,this.route),this.instant=D(),this._lastUrl=e.location.href,e.location.search){let t=new URLSearchParams(e.location.search).get(`overrides`);if(t&&(this.config=t,this.config))try{let e=JSON.parse(this.config);k.value={...k.value,...e}}catch{k.value={...k.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){let t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t==`/`?``:t}addQueryParams(e,t){return e+(t.search?``+t.search:``)}extractGrossRouteFromUrl(e){let t=e.location.pathname,n=this.baseUrl&&(this.baseUrl.startsWith(`http://`)||this.baseUrl.startsWith(`https://`))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(n)?t.substring(n.length):t}getContextPathStartingIndex(e){return e.startsWith(`http:`)?e.indexOf(`/`,7):e.startsWith(`https:`)?e.indexOf(`/`,8):0}render(){return E`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${le.value}"
                          .appState="${k.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?E`
               <mateu-debug-overlay
                   .appState="${k.value}"
                   .appData="${le.value}"
               ></mateu-debug-overlay>
           `:y}
       `}static{this.styles=g`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `}};A([b()],ec.prototype,`baseUrl`,void 0),A([b()],ec.prototype,`route`,void 0),A([b()],ec.prototype,`consumedRoute`,void 0),A([b()],ec.prototype,`config`,void 0),A([b()],ec.prototype,`top`,void 0),A([b()],ec.prototype,`pathPrefix`,void 0),A([b()],ec.prototype,`bundleUrl`,void 0),A([w()],ec.prototype,`instant`,void 0),A([b({type:Boolean})],ec.prototype,`debug`,void 0),ec=A([_(`mateu-ui`)],ec);var tc,nc=class extends x{static{tc=this}constructor(...e){super(...e),this.baseUrl=``,this.opened=!1,this.searchText=``}static{this.SEARCHABLE_THRESHOLD=7}connectedCallback(){super.connectedCallback(),Te()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(xe()[this.selector.fieldName]??``)}currentLabel(){let e=this.currentValue();if(!e)return`—`;let t=(this.searchedOptions??this.selector.options)?.find(t=>String(t.value)===e);if(t)return t.label;let n=Se()[this.selector.fieldName];return n===void 0?e:String(n)}pick(e,t){Ce(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText=``,this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector(`input.picker-search`)?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){let e=this.app;if(e?.serverSideType)try{let t=await ct.runAction(this.baseUrl??``,e.rootRoute??e.initialRoute??``,``,`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(let e of t?.fragments??[]){let t=e.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(t)){this.searchedOptions=t.map(e=>({value:e.value,label:e.label??String(e.value)}));return}}}catch{}}visibleOptions(){let e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(e=>e.label.toLowerCase().includes(t)):e}renderPanel(){let e=this.currentValue(),t=this.visibleOptions();return E`
            <div class="panel">
                ${this.searchText!==``||t.length>tc.SEARCHABLE_THRESHOLD?E`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${e=>{e.key===`Escape`&&this.closePanel()}}"/>`:y}
                <div class="options">
                    ${e?E`
                        <div class="option option--clear" @click="${()=>this.pick(``)}">— (clear)</div>`:y}
                    ${t.map(t=>E`
                        <div class="option ${e===String(t.value)?`option--selected`:``}"
                             @click="${()=>this.pick(t.value,t.label)}">${t.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?E`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():y}
            </label>`:E``}static{this.styles=g`
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
    `}};A([b()],nc.prototype,`selector`,void 0),A([b()],nc.prototype,`app`,void 0),A([b()],nc.prototype,`baseUrl`,void 0),A([w()],nc.prototype,`opened`,void 0),A([w()],nc.prototype,`searchText`,void 0),A([w()],nc.prototype,`searchedOptions`,void 0),nc=tc=A([_(`mateu-app-context-picker`)],nc);var rc=class extends x{constructor(...e){super(...e),this.baseUrl=``,this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){let n=this.app;if(n?.serverSideType)try{let r=await ct.runAction(this.baseUrl??``,n.rootRoute??n.initialRoute??``,``,e,`notification-bell`,void 0,n.serverSideType,{},t,this,!0);for(let e of r?.fragments??[]){let t=e.data?._notifications;if(Array.isArray(t)){this.notifications=t;return}}}catch{}}refresh(){return this.runNotificationsAction(`_notifications-list`,{})}markRead(e){return this.runNotificationsAction(`_notifications-read`,{ids:e})}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);let t=e.route;if(t){if(!no.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`navigate-to-requested`,{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return E`
            <div role="button" tabindex="0" class="entry ${e.unread?`entry--unread`:``}"
                 @click="${()=>this.entryClicked(e)}" @keydown="${R(()=>this.entryClicked(e))}">
                <span class="unread-dot" aria-hidden="true"></span>
                <div class="entry-body">
                    <div class="entry-top">
                        <span class="entry-title">${e.title}</span>
                        ${e.when?E`<span class="entry-when">${e.when}</span>`:y}
                    </div>
                    ${e.text?E`<div class="entry-text">${e.text}</div>`:y}
                </div>
            </div>`}renderPanel(){return E`
            <div class="panel">
                <div class="entries">
                    ${this.notifications.length===0?E`
                        <div class="empty">No notifications</div>`:y}
                    ${this.notifications.map(e=>this.renderEntry(e))}
                </div>
                ${this.notifications.length>0?E`
                    <div class="footer">
                        <button class="mark-all" ?disabled="${this.unreadCount()===0}"
                                @click="${()=>this.markRead(`all`)}">Mark all read</button>
                    </div>`:y}
            </div>`}render(){let e=this.unreadCount();return E`
            <div class="root">
                <button class="bell-button" title="Notifications" aria-label="Notifications"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    <svg class="bell-icon" viewBox="0 0 24 24" aria-hidden="true"
                         fill="none" stroke="currentColor" stroke-width="1.8"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    ${e>0?E`<span class="badge">${e>99?`99+`:e}</span>`:y}
                </button>
                ${this.opened?this.renderPanel():y}
            </div>`}static{this.styles=g`
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
    
        ${z}
    `}};A([b()],rc.prototype,`app`,void 0),A([b()],rc.prototype,`baseUrl`,void 0),A([w()],rc.prototype,`opened`,void 0),A([w()],rc.prototype,`notifications`,void 0),rc=A([_(`mateu-notification-bell`)],rc);var ic=e=>{if(!e||!(`querySelectorAll`in e))return null;for(let t of e.querySelectorAll(`*`)){if(t.tagName?.toLowerCase()===`mateu-component`)return t;let e=ic(t.shadowRoot);if(e)return e}return null},ac=async(e,t,n)=>{let r=ic(t.renderRoot??t);await ms.runAction(ct,t.baseUrl??``,e.rootRoute||`_no_route`,``,n,r?.id??`app-header-action`,{},e.serverSideType??``,{},{},r??t,!0,void 0,!1,``)},oc=async(e,t,n)=>{try{await ac(e,t,n)}catch(e){Fa({text:`La acción falló: `+e,position:`bottomStart`,duration:6e3,variant:`error`},t)}},sc=(e,t)=>{let n=e.contextSelectors??[],r=e.contextActions??[];return n.length===0&&r.length===0&&!e.notificationsEnabled?y:E`${e.notificationsEnabled?E`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??``}"></mateu-notification-bell>`:y}${n.map(n=>E`
        <mateu-app-context-picker .selector="${n}" .app="${e}" .baseUrl="${t.baseUrl??``}"></mateu-app-context-picker>`)}${r.map(n=>(n.children?.length??0)>0?E`
        <details class="mateu-nav-group" style="margin-left: 0.5rem; flex-shrink: 0;">
            <summary class="app-header-action-btn">${n.label} ▾</summary>
            <div class="mateu-nav-panel" style="right: 0; left: auto;">
                ${n.children.map(n=>E`
                    <button class="mateu-nav-item" @click="${()=>n.actionId&&oc(e,t,n.actionId)}">${n.label}</button>`)}
            </div>
        </details>`:E`
        <button class="app-header-action-btn" style="margin-left: 0.5rem; flex-shrink: 0;"
            @click="${()=>n.actionId&&oc(e,t,n.actionId)}" title="${n.label}">${n.icon?I(n.icon):y}${n.label}</button>`)}`},cc=(e,t)=>E`
    <button class="mateu-nav-item ${e.selected?`mateu-nav-item--active`:``}"
            ?disabled="${e.disabled}"
            @click="${()=>t(e)}">${e.text}</button>`,lc=(e,t,n=``)=>E`
    <nav class="mateu-nav ${n}">
        ${e.map(e=>(e.children?.length??0)>0?E`<details class="mateu-nav-group">
                       <summary class="mateu-nav-item">${e.text} ▾</summary>
                       <div class="mateu-nav-panel">
                           ${e.children.map(e=>cc(e,t))}
                       </div>
                   </details>`:cc(e,t))}
    </nav>`,uc=(e,t)=>n=>t.call(e,{detail:{value:n}}),dc=(e,t)=>e.themeToggle?E`
        <button class="app-chrome-icon-btn" @click="${t.toggleTheme}"
            title="${t.isDark?`Switch to light mode`:`Switch to dark mode`}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            ${I(t.isDark?`vaadin:sun-o`:`vaadin:moon`,`color: var(--lumo-body-text-color);`)}
        </button>
    `:y,fc=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},pc=(e,t,n)=>{let r=mc(e,t,n),i=Z(t,n);return r==`list`||r==i?`new`:r},mc=(e,t,n)=>{let r=e?._route;if(r!=null&&(r===``||r.startsWith(`/`))){let e=n.homeRoute??``,i=e.indexOf(`?`),a=i>=0?e.substring(i+1):``,o=Z(t,n)+r;return a?o+(o.indexOf(`?`)>=0?`&`:`?`)+a:o}return t.selectedRoute?t.selectedRoute:n.homeRoute},Z=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,hc=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:e.baseUrl||t.homeBaseUrl,gc=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,_c=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,vc=(e,t)=>`ux_`+((Z(e,t)||`root`)+`|`+(gc(e,t)??``)).replace(/[^a-zA-Z0-9]/g,`_`),yc=(e,t,n,r,i,a,o)=>{let s=vc(e,t);if(t.chromeless)return E`
            <div class="app chromeless">
                <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}" style="height: 100%;">
                    <div class="m-md">
                        <div class="m-scroll" style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${mc(r,e,t)}"
                                        id="${s}"
                                        baseUrl="${hc(e,t)}"
                                        consumedRoute="${Z(e,t)}"
                                        serverSideType="${gc(e,t)}"
                                        uriPrefix="${_c(e,t)}"
                                        style="width: 100%;"
                                        .appState="${a}"
                                        .appData="${o}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                        ${t.sseUrl?E`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:y}
                    </div>
                </div>
                <slot></slot>
            </div>
        `;let c=e.mapItems(t.menu,e.filter?.toLowerCase()??``),l=Z(e,t),u=pc(r,e,t),d=u&&u!==`new`&&u.startsWith(l+`/`)?u.substring(l.length+1).split(`/`)[0]:void 0;return E`
                    ${t.variant==lt.MEDIATOR?E`

                        ${t.layout==`SPLIT`?E`
                            <div class="m-md">
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${Z(e,t)}"
                                            id="${s}"
                                            baseUrl="${hc(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${gc(e,t)}"
                                            uriPrefix="${_c(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...a,_splitDetailId:d}}"
                                            .appData="${o}"
                                            instant="${l}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${pc(r,e,t)}"
                                            id="${s}_detail"
                                            baseUrl="${hc(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${gc(e,t)}"
                                            uriPrefix="${_c(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>

                            </div>
                        `:E`
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${mc(r,e,t)}"
                                        id="${s}"
                                        baseUrl="${hc(e,t)}"
                                        consumedRoute="${Z(e,t)}"
                                        serverSideType="${gc(e,t)}"
                                        uriPrefix="${_c(e,t)}"
                                        style="width: 100%;"
                                        .appState="${a}"
                                        .appData="${o}"
                                        .initialState="${r}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:y}
            ${t.variant==lt.HAMBURGUER_MENU?E`
                <div class="mateu-app-layout m-app-layout ${t.drawerClosed?``:`drawer-open`} ${t?.cssClasses}" style="${t?.style}">
                    <header class="app-navbar">
                        <button class="drawer-toggle" title="Menu"
                                @click="${e=>e.currentTarget.closest(`.m-app-layout`)?.classList.toggle(`drawer-open`)}">
                            ${I(`vaadin:menu`)}
                        </button>
                        <h2 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; margin: 0 .5rem;">${t.title}</h2><p style="margin: 0;">${t.subtitle}</p>
                        <div class="m-hl" style="margin-left: auto; align-items: center;">
                            <slot name="widgets"></slot>
                            ${sc(t,e)}${dc(t,e)}
                        </div>
                    </header>
                    <div class="app-body">
                        <aside class="app-drawer p-s" @navigation-requested="${e.updateRoute}">
                            ${t.menu&&t.totalMenuOptions>10?E`
                                <div style="position: sticky; top: 0; z-index: 2; background: var(--lumo-base-color); padding: .25rem 0 .5rem;">
                                    <input class="drawer-search" placeholder="Search…" style="width: calc(100% - 20px); margin: 0 10px;"
                                           @input="${t=>fc({detail:{value:t.target.value}},e)}">
                                </div>
                                `:y}
                            <nav class="side-nav">
                                ${e.renderSideNav(c,void 0)}
                            </nav>
                        </aside>
                        <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}" style="flex: 1; min-width: 0;">
                            <div class="m-md">
                                <div class="m-scroll" style="height: 100%;">
                                    <mateu-api-caller>
                                        <mateu-ux
                                                route="${mc(r,e,t)}"
                                                id="${s}"
                                                baseUrl="${hc(e,t)}"
                                                consumedRoute="${Z(e,t)}"
                                                serverSideType="${gc(e,t)}"
                                                uriPrefix="${_c(e,t)}"
                                                style="width: 100%;"
                                                .appState="${a}"
                                                .appData="${o}"
                                                instant="${e.instant}"
                                                @navigation-requested="${e.updateRoute}"
                                        ></mateu-ux>
                                    </mateu-api-caller>
                                </div>
                                ${t.sseUrl?E`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:y}
                            </div>
                        </div>
                    </div>
                </div>

            `:y}
            
            ${t.variant==lt.MENU_ON_TOP?E`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <div class="m-hl" style="align-items: center;">
                            ${t.logo?E`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:y}
                            ${t.title?E`<h2 style="margin: 0 var(--lumo-space-l, 1.5rem) 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:y}
                        </div>
                        </a>
                        ${(()=>{let t=uc(e,e.itemSelected);return P.get()?.renderTopNav?.(c,t,`menu-on-top`)??lc(c,t,`menu-on-top`)})()}
                        <div class="m-hl" style="margin-left: auto; flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${sc(t,e)}${dc(t,e)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${mc(r,e,t)}"
                                            id="${s}"
                                            baseUrl="${hc(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${gc(e,t)}"
                                            uriPrefix="${_c(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?E`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:y}
                        </div>
                    </div>
                </div>

            `:y}

            ${t.variant==lt.TILES?E`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <div class="m-hl" style="align-items: center;">
                            ${t.logo?E`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:y}
                            ${t.title?E`<h2 style="margin: 0 var(--lumo-space-l, 1.5rem) 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:y}
                        </div>
                        </a>
                        ${lc(e.mapItemsForTiles(t.menu),uc(e,e.itemSelectedTiles),`menu-on-top`)}
                        <div class="m-hl" style="margin-left: auto; flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${sc(t,e)}${dc(t,e)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):E`
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${mc(r,e,t)}"
                                            id="${s}"
                                            baseUrl="${hc(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${gc(e,t)}"
                                            uriPrefix="${_c(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?E`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:y}
                        </div>
                        `}
                    </div>
                </div>
            `:y}

            ${t.variant==lt.RAIL?E`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):y}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${mc(r,e,t)}"
                                            id="${s}"
                                            baseUrl="${hc(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${gc(e,t)}"
                                            uriPrefix="${_c(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?E`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:y}
                        </div>
                    </div>
                </div>
            `:y}

            ${t.variant==lt.MENU_ON_LEFT?E`

                <div class="m-hl">
                    <div class="m-scroll" style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <div class="m-vl"
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(t=>e.renderOptionOnLeftMenu(t))}
                            ${sc(t,e)}${dc(t,e)}
                        </div>
                    </div>
                    <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${mc(r,e,t)}"
                                            id="${s}"
                                            baseUrl="${hc(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${gc(e,t)}"
                                            uriPrefix="${_c(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?E`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:y}
                        </div>
                    </div>
                </div>


            `:y}

            ${t.variant==lt.TABS?E`
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
                                ${t.logo?E`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:y}
                                ${t.title?E`<h2 style="margin: 0 var(--lumo-space-l, 1.5rem) 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:y}
                            </div>
                            </a>
                            <nav class="mateu-tabs ${e.component?.cssClasses??``}" style="flex-grow: 1; min-width: 0; margin-left: 1.5rem;">
                                ${t.menu.map((n,r)=>E`
                                <button class="mateu-tab ${r===e.getSelectedIndex(t.menu)?`mateu-tab--active`:``}"
                                        @click="${()=>e.selectRoute(n.consumedRoute,n.route,n.actionId,n.baseUrl,n.serverSideType,n.uriPrefix)}"
                                >${n.label}</button>`)}
                            </nav>
                            <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${sc(t,e)}${dc(t,e)}
                            </div>
                        </div>
                    </div>
                    <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${mc(r,e,t)}"
                                            id="${s}"
                                            baseUrl="${hc(e,t)}"
                                            consumedRoute="${Z(e,t)}"
                                            serverSideType="${gc(e,t)}"
                                            uriPrefix="${_c(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?E`<mateu-chat slot="${e.chatOpen?`detail`:`detail-hidden`}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:o,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:y}
                        </div>
                    </div>
                </div>
            
            `:y}

            ${t.fabs?.map((n,r)=>E`
                <button class="app-fab" style="bottom: ${(t.sseUrl?5.5:1.5)+r*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(n.actionId)}"
                    title="${n.label}">
                    ${I(n.icon)}
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?E`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    ${I(`vaadin:comments-o`)}
                </button>
            `:y}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},bc=(e,t)=>t!=null&&e!=null&&!e.has(t),xc=typeof HTMLElement<`u`?HTMLElement:class{},Sc=class extends xc{static get observedAttributes(){return[`type`,`renderer`]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){let e=this.getAttribute(`type`)??`unknown`,t=this.getAttribute(`renderer`)??`unknown`;this.shadowRoot||this.attachShadow({mode:`open`}),this.shadowRoot.innerHTML=`
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
        `}};typeof customElements<`u`&&!customElements.get(`mateu-unsupported`)&&customElements.define(`mateu-unsupported`,Sc);var Cc=new Set,wc=(e,t,n)=>{let r=`${n}/${t}`;return Cc.has(r)||(Cc.add(r),console.warn(`[mateu] Component type "${t}" is not supported by the "${n}" renderer — rendering <mateu-unsupported> placeholder.`)),E`<mateu-unsupported
            type="${t}"
            renderer="${n}"
            data-component-id="${e?.id??y}"
            slot="${e?.slot??y}"
    ></mateu-unsupported>`},Tc=class{renderFilterBar(e,t,n,r,i,a,o,s){let c=t?.metadata;return E`
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
                ${c?.header?.map(t=>F(e,t,n,r,i,a,o))}
            </mateu-filter-bar>
        `}renderPagination(e,t){return E`
        <mateu-pagination
                @page-changed="${e.pageChanged}"
                @fetch-more-elements="${e.fetchMoreElements}"
                .totalElements="${e.data[t?.id]?.page?.totalElements??0}"
                .pageSize="${e.data[t?.id]?.page?.pageSize??10}"
                data-testid="pagination"
                .pageNumber="${e.data[t?.id]?.page?.pageNumber??0}"
        ></mateu-pagination>
        `}renderTableComponent(e,t,n,r,i,a,o){return Vn(t,(e.data?.[e.id])?.page?.content??[],r[t?.id]?.emptyStateMessage)}rendererName(){return this.constructor?.name??`unknown`}supportedClientSideTypes(){}renderClientSideComponent(e,t,n,r,i,a,o,s){let c=t?.metadata?.type??t?.type,l=Object.values(M).includes(c)?c:void 0;return bc(this.supportedClientSideTypes(),l)?wc(t,l,this.rendererName()):ka(e,t,n,r,i,a,o,s)}renderAppComponent(e,t,n,r,i,a,o){return yc(e,t?.metadata,n,r,i,a,o)}},Ec=(e,t,n,r,i,a,o)=>E`
        <vaadin-virtual-list
                .items="${t.metadata.page.content}"
                ${ee(t=>E`${F(e,t,n,r,i,a,o)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??y}"
        ></vaadin-virtual-list>
    `,Dc=e=>{let t=e.metadata;return E`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??y}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${c(()=>E`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>${t.text}</div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
    `},Oc=(e,t={})=>{let n=e.metadata,r=n.valueKey?t[n.valueKey]:n.value;return E`
        <div style="${e.style}">
        <vaadin-progress-bar
                ?indeterminate="${n.indeterminate}"
                min="${n.min&&n.min!=0?n.min:y}"
                max="${n.max&&n.max!=0?n.max:y}"
                value="${r??y}"
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??y}"
        ></vaadin-progress-bar>
        ${n.text?E`<span class="text-secondary text-xs" id="sublbl">
    ${n.text}
  </span>`:y}
        </div>
    `},kc=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`
        <vaadin-details
                ?opened="${s.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??y}"
        >
            <vaadin-details-summary slot="summary">
            ${F(e,s.summary,n,r,i,a,o)}
            </vaadin-details-summary>
            ${F(e,s.content,n,r,i,a,o)}
        </vaadin-details>
            `},Ac=(e,t,n)=>{let r=e.metadata;return E`<vaadin-avatar
            img="${r.image}"
            name="${Dt(r.name,t,n)}"
            abbr="${r.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??y}"
    ></vaadin-avatar>`},jc=e=>{let t=e.metadata;return E`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??y}">
    </vaadin-avatar-group>`},Mc=(e,t,n,r,i,a,o)=>{let s=t.metadata;if(!s)return E``;let c=``;return s.variants?.map(e=>e==`stretchMedia`?`stretch-media`:e==`coverMedia`?`cover-media`:e).forEach(e=>c+=` `+e),c=c.trim(),E`
        <vaadin-card
                style="${t.style}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??y}"
        >
            ${s.media?jt(e,s.media,n,r,i,a,o,`media`,!1):y}
            ${s.title?jt(e,s.title,n,r,i,a,o,`title`,!1):y}
            ${s.subtitle?jt(e,s.subtitle,n,r,i,a,o,`subtitle`,!1):y}
            ${s.header?jt(e,s.header,n,r,i,a,o,`header`,!1):y}
            ${s.headerPrefix?jt(e,s.headerPrefix,n,r,i,a,o,`header-prefix`,!1):y}
            ${s.headerSuffix?jt(e,s.headerSuffix,n,r,i,a,o,`header-suffix`,!1):y}
            ${s.footer?jt(e,s.footer,n,r,i,a,o,`footer`,!1):y}
            ${s.content?F(e,s.content,n,r,i,a,o,!1):y}
        </vaadin-card>
    `},Nc=e=>e>0&&e<640?`accordion`:`tabs`,Pc=class extends x{constructor(...e){super(...e),this.tabLabels=[],this.mode=`tabs`,this.selected=0,this.selectedChangedListener=e=>{let t=e.detail?.value;typeof t==`number`&&t>=0&&(this.selected=t)}}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{for(let t of e)this.mode=Nc(t.contentRect.width)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=void 0,this.detachTabsListener()}detachTabsListener(){this.slottedTabs?.removeEventListener(`selected-changed`,this.selectedChangedListener),this.slottedTabs=void 0}tabsSlotChanged(e){this.detachTabsListener();let t=e.target.assignedElements().find(e=>`selected`in e);t&&(this.slottedTabs=t,t.addEventListener(`selected-changed`,this.selectedChangedListener),t.selected=this.selected)}select(e){this.selected=e,this.slottedTabs&&(this.slottedTabs.selected=e)}updated(){this.slottedTabs&&this.slottedTabs.selected!=this.selected&&(this.slottedTabs.selected=this.selected)}static{this.styles=g`
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
    `}render(){return E`
            <div class="strip" ?hidden="${this.mode!=`tabs`}">
                <slot name="tabs" @slotchange="${this.tabsSlotChanged}"></slot>
            </div>
            ${this.mode==`tabs`?E`
                ${this.tabLabels.map((e,t)=>E`
                    <div class="panel" ?hidden="${t!=this.selected}">
                        <slot name="panel-${t}"></slot>
                    </div>
                `)}
            `:E`
                <div class="accordion" part="accordion">
                    ${this.tabLabels.map((e,t)=>E`
                        <div class="acc-item">
                            <button class="acc-header"
                                    aria-expanded="${t==this.selected}"
                                    aria-controls="acc-body-${t}"
                                    @click="${()=>this.select(t)}"
                            >
                                <span>${e??y}</span>
                                <span class="chevron">⟩</span>
                            </button>
                            <div class="acc-body" id="acc-body-${t}" ?hidden="${t!=this.selected}">
                                <slot name="panel-${t}"></slot>
                            </div>
                        </div>
                    `)}
                </div>
            `}
        `}};A([b({type:Array})],Pc.prototype,`tabLabels`,void 0),A([w()],Pc.prototype,`mode`,void 0),A([w()],Pc.prototype,`selected`,void 0),Pc=A([_(`mateu-adaptive-tabs`)],Pc);var Fc=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style;c??=``,s.columnSpacing&&(c+=`--vaadin-form-layout-column-spacing: `+s.columnSpacing+`;`);let l=s.itemRowSpacing&&s.itemRowSpacing!==`0`?s.itemRowSpacing:`var(--lumo-space-m)`;return c+=`--vaadin-form-layout-row-spacing: `+l+`;`,s.itemLabelSpacing&&(c+=`--vaadin-form-layout-label-spacing: `+s.itemLabelSpacing+`;`),s.labelsAside&&(c+=`--vaadin-form-item-label-width: 10rem;`),s.fullWidth&&(c+=`width: 100%;`),E`
               <vaadin-form-layout 
                       .responsiveSteps="${s.responsiveSteps||y}"  
                       style="${c||y}" 
                       class="${t.cssClasses}"
                       max-columns="${s.maxColumns&&s.maxColumns>0?s.maxColumns:y}"
                       auto-responsive="${s.autoResponsive||y}"
                       column-width="${s.columnWidth||y}"
                       expand-columns="${s.expandColumns||y}"
                       expand-fields="${s.expandFields||!s.labelsAside||y}"
                       labels-aside="${s.labelsAside||y}"
                       slot="${t.slot||y}"
               >
                   ${t.children?.map(t=>Ic(s,e,t,n,r,i,a,o))}
               </vaadin-form-layout>
            `},Ic=(e,t,n,r,i,a,o,s)=>n.type==j.ClientSide&&n.metadata?.type==M.FormRow?Rc(e,t,n,r,i,a,o,s):e.labelsAside?Lc(t,n,r,i,a,o,s):F(t,n,r,i,a,o,s),Lc=(e,t,n,r,i,a,o)=>{if(t.type==j.ClientSide&&t.metadata?.type==M.FormField&&t.metadata.label){let s=t.metadata,c=s.label?.includes("${")?e._evalTemplate(s.label):s.label;return E`
                       <vaadin-form-item data-colspan="${s.colspan}">
                           <label slot="label">${c}</label>
                           ${F(e,t,n,r,i,a,o,!0)}
                       </vaadin-form-item>
                   `}return F(e,t,n,r,i,a,o)},Rc=(e,t,n,r,i,a,o,s)=>E`
        <vaadin-form-row>
            ${n.children?.map(n=>Ic(e,t,n,r,i,a,o,s))}
        </vaadin-form-row>
            `,zc=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=(s.padding?` padding`:``)+(s.spacing?` spacing`:``)+(s.spacingVariant?` spacing-`+s.spacingVariant:``)+(s.wrap?` wrap`:``),l=t.style;return s.fullWidth&&(l=l?`width: 100%;`+l:`width: 100%;`),s.justification&&(l=l?`justify-content: `+s.justification+`;`+l:`justify-content: `+s.justification+`;`),s.verticalAlignment&&(l=l?`align-items: `+s.verticalAlignment+`;`+l:`align-items: `+s.verticalAlignment+`;`),E`
               <vaadin-horizontal-layout 
                       style="${l}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??y}"
               >
                   ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
               </vaadin-horizontal-layout>
            `},Bc=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=(s.padding?` padding`:``)+(s.spacing?` spacing`:``)+(s.spacingVariant?` spacing-`+s.spacingVariant:``)+(s.wrap?` wrap`:``),l=t.style;return s.fullWidth&&(l=l?`width: 100%;`+l:`width: 100%;`),s.justification&&(l=l?`justify-content: `+s.justification+`;`+l:`justify-content: `+s.justification+`;`),s.horizontalAlignment&&(l=l?`align-items: `+s.horizontalAlignment+`;`+l:`align-items: `+s.horizontalAlignment+`;`),E`
        <vaadin-vertical-layout
                style="${l}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??y}"
        >
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </vaadin-vertical-layout>
    `},Vc=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style;return s.fullWidth&&(c=c?`width: 100%;`+c:`width: 100%;`),E`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${s.orientation??y}"
                       theme="${s.variant??y}"
                       slot="${t.slot??y}"
               >
                   <master-content>${F(e,t.children[0],n,r,i,a,o)}</master-content>
                   <detail-content>${F(e,t.children[1],n,r,i,a,o)}</detail-content>
               </vaadin-split-layout>
            `},Hc=(e,t,n,r,i,a,o)=>{let s=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,l=!!i?.hasDetail||!!s,u=c??s;return E`
               <vaadin-master-detail-layout ?has-detail="${l}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??y}">
                   <div>${F(e,t.children[0],n,r,i,a,o)}</div>
                   ${l&&u?E`<div slot="detail">${F(e,u,n,r,i,a,o)}</div>`:E`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},Uc=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style;c??=``,s.fullWidth&&(c+=`width: 100%;`);let l=s.variant;l==`equalWidth`&&(l=`equal-width-tabs`);let u=Math.max(0,(t.children??[]).findIndex(e=>e.metadata.active)),d=e=>{e.target.selected=u};if(s.adaptable){let u=(t.children??[]).map(t=>{let n=t.metadata.label;return n?.includes("${")?e._evalTemplate(n):n});return E`
            <mateu-adaptive-tabs
                    .tabLabels="${u}"
                    style="${c}"
                    class="${t.cssClasses}"
                    slot="${t.slot??y}"
            >
                <vaadin-tabs slot="tabs"
                             theme="${l??y}"
                             orientation="${s.orientation??y}"
                             @items-changed=${d}
                >
                    ${t.children?.map(e=>e).map((e,t)=>{let n=e.metadata.shortcut;return E`
                        <vaadin-tab id="${u[t]}"
                                    style="${e.style}"
                                    class="${e.cssClasses}"
                                    data-shortcut="${n??y}"
                        >${u[t]}</vaadin-tab>`})}
                </vaadin-tabs>

                ${t.children?.map((t,s)=>E`
                    <div slot="panel-${s}" style="padding: var(--lumo-space-m) 0;">
                        ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
                    </div>`)}
            </mateu-adaptive-tabs>
                `}return E`
        <vaadin-tabsheet
                theme="${l??y}"
                style="${c}"
                slot="${t.slot??y}"
        >
            <vaadin-tabs slot="tabs"
                         style="${c}"
                         class="${t.cssClasses}"
                         orientation="${s.orientation??y}"
                         @items-changed=${d}
            >
                ${t.children?.map(e=>e).map(t=>{let n=t.metadata.label,r=n?.includes("${")?e._evalTemplate(n):n,i=t.metadata.shortcut;return E`
                    <vaadin-tab id="${r}"
                                style="${t.style}"
                                class="${t.cssClasses}"
                                data-shortcut="${i??y}"
                    >${r}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map(t=>Wc(e,t,n,r,i,a,o))}
        </vaadin-tabsheet>
            `},Wc=(e,t,n,r,i,a,o)=>{let s=t.metadata.label;return E`
        <div tab="${s?.includes("${")?e._evalTemplate(s):s}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
               </div>
            `},Gc=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style;s.fullWidth&&(c=c?`width: 100%;`+c:`width: 100%;`);let l=0;if(t.children){for(let e=0;e<t.children.length;e++)if(t.children[e].metadata?.active){l=e;break}}return E`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${l}"
                       slot="${t.slot??y}"
               >
                   ${t.children?.map(t=>Kc(e,t,n,r,i,a,o,s.variant))}
               </vaadin-accordion>
            `},Kc=(e,t,n,r,i,a,o,s)=>{let c=t.metadata,l=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return E`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${s??y}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${l}</vaadin-accordion-heading>
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </vaadin-accordion-panel>
            `},qc=(e,t,n,r,i,a,o)=>E`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??y}">
                   ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
               </vaadin-scroller>
            `,Jc=(e,t,n,r,i,a,o)=>E`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??y}">
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </vaadin-board>
            `,Yc=(e,t,n,r,i,a,o)=>E`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
               </vaadin-board-row>
            `,Xc=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${s.boardCols??y}"
        >
                   ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
               </div>
            `},Zc=(e,t,n)=>E`
    <vaadin-menu-bar
        theme="tertiary"
        .items=${e}
        class="${n??y}"
        @item-selected=${e=>t(e.detail.value)}>
    </vaadin-menu-bar>`,Qc=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`
        <vaadin-context-menu .items=${tl(e,s.menu,n,r,i,a,o)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${s.activateOnLeftClick?`click`:y}"
                             slot="${t.slot??y}">
            ${F(e,s.wrapped,n,r,i,a,o)}
        </vaadin-context-menu>
            `},$c=(e,t,n,r,i)=>{let a=t.metadata;return E`
        <vaadin-menu-bar .items=${tl(e,a.options,n,r,i,k,le)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??y}">
        </vaadin-menu-bar>
            `},el=(e,t,n,r,i,a,o)=>{let s=document.createElement(`vaadin-context-menu-item`);return ne(F(e,t,n,r,i,a,o),s),s},tl=(e,t,n,r,i,a,o)=>t.map(t=>t.submenus?{text:t.component?void 0:t.label,route:t.path,checked:t.selected,disabled:t.disabled,className:t.className,component:t.component?el(e,t.component,n,r,i,a,o):void 0,children:tl(e,t.submenus,n,r,i,a,o)}:t.separator?{component:`hr`}:{text:t.component?void 0:t.label,route:t.path,checked:t.selected,disabled:t.disabled,className:t.className,component:t.component?el(e,t.component,n,r,i,a,o):void 0}),nl=class extends x{constructor(...e){super(...e),this.fieldId=``,this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{let t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;let n=t.getContext(`2d`);n.lineWidth=2,n.lineCap=`round`,n.lineJoin=`round`,n.strokeStyle=getComputedStyle(this).getPropertyValue(`--lumo-body-text-color`)||`#1a1a1a`;let[r,i]=this.pointerPosition(e);n.beginPath(),n.moveTo(r,i),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;let t=e.target.getContext(`2d`),[n,r]=this.pointerPosition(e);t.lineTo(n,r),t.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector(`canvas`)}pointerPosition(e){let t=e.target.getBoundingClientRect();return[e.clientX-t.left,e.clientY-t.top]}ensureCanvasSize(e){let t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){let e=this.canvas();e&&e.getContext(`2d`).clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){let e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL(`image/png`)))}renderPad(){return E`
            <canvas class="pad"
                    @pointerdown="${this.startStroke}"
                    @pointermove="${this.stroke}"
                    @pointerup="${this.endStroke}"
                    @pointercancel="${this.endStroke}"></canvas>
            <div class="actions">
                <button class="button" @click="${this.clear}">Clear</button>
                <button class="button button--primary" ?disabled="${!this.hasStrokes}"
                        @click="${this.accept}">Accept</button>
                ${this.value?E`
                    <button class="button" @click="${()=>{this.signing=!1}}">Cancel</button>`:y}
            </div>`}render(){let e=this.value!=null&&this.value!==``;return this.signing||!e?this.renderPad():E`
            <img class="preview" src="${this.value}" alt="Signature"/>
            <div class="actions">
                <button class="button" @click="${()=>{this.signing=!0,this.hasStrokes=!1,this.updateComplete.then(()=>this.clear())}}">Sign again</button>
                <button class="button button--danger" @click="${()=>this.emit(``)}">Delete</button>
            </div>`}static{this.styles=g`
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
    `}};A([b()],nl.prototype,`fieldId`,void 0),A([b()],nl.prototype,`value`,void 0),A([w()],nl.prototype,`signing`,void 0),A([w()],nl.prototype,`hasStrokes`,void 0),nl=A([_(`mateu-signature-pad`)],nl);var rl=class extends x{constructor(...e){super(...e),this.fieldId=``,this.options=[],this.leavesOnly=!1,this.opened=!1,this.expandedItems=[],this._normalized=[],this.dataProvider=(e,t)=>{let n=e.parentItem?e.parentItem.children??[]:this.normalized;t(n,n.length)}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get normalized(){return this._optsSource!==this.options&&(this._optsSource=this.options,this._normalized=this.normalizeOptions(this.options??[])),this._normalized}normalizeOptions(e){return e.map(e=>{let t=e.children&&e.children.length?this.normalizeOptions(e.children):void 0;return{...e,children:t}})}ancestorsOf(e,t){for(let n of t){if(String(n.value)===e)return[];let t=n.children?this.ancestorsOf(e,n.children):null;if(t!=null)return[n,...t]}return null}labelOf(e,t){for(let n of t){if(String(n.value)===e)return n.label;let t=n.children?this.labelOf(e,n.children):null;if(t!=null)return t}return null}open(){this.opened||(this.expandedItems=this.value==null?[]:this.ancestorsOf(String(this.value),this.normalized)??[],this.opened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.close()},document.addEventListener(`mousedown`,this.outsideClick))}close(){this.detachOutsideClick(),this.opened=!1}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}pick(e){this.close(),this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e.value,fieldId:this.fieldId},bubbles:!0,composed:!0}))}clear(){this.close(),this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:void 0,fieldId:this.fieldId},bubbles:!0,composed:!0}))}onActiveItemChanged(e){let t=e.detail.value;if(t){if((t.children?.length??0)>0&&this.leavesOnly){this.expandedItems=this.expandedItems.includes(t)?this.expandedItems.filter(e=>e!==t):[...this.expandedItems,t],e.target.activeItem=null;return}this.pick(t)}}render(){let e=this.value!=null&&this.value!==``?this.labelOf(String(this.value),this.normalized)??String(this.value):``;return E`
            <div class="root">
                <vaadin-button class="control" theme="tertiary"
                               @click="${()=>this.opened?this.close():this.open()}">
                    <span class="${e?``:`placeholder`}">${e||`—`}</span>
                    <span class="chevron" slot="suffix" aria-hidden="true">▾</span>
                </vaadin-button>
                ${this.opened?E`
                    <div class="panel">
                        ${this.value?E`
                            <div class="clear-row">
                                <vaadin-button theme="tertiary small" @click="${this.clear}">— Clear</vaadin-button>
                            </div>`:y}
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
                    </div>`:y}
            </div>`}static{this.styles=g`
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
    `}};A([b()],rl.prototype,`fieldId`,void 0),A([b()],rl.prototype,`value`,void 0),A([b()],rl.prototype,`options`,void 0),A([b({type:Boolean})],rl.prototype,`leavesOnly`,void 0),A([w()],rl.prototype,`opened`,void 0),A([w()],rl.prototype,`expandedItems`,void 0),rl=A([_(`mateu-vaadin-tree-select`)],rl);var il=class extends x{constructor(...e){super(...e),this.fieldId=``,this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{let t=e.target,n=t.files?.[0];if(!n)return;let r=new FileReader;r.onload=()=>this.emit(r.result),r.readAsDataURL(n),t.value=``}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:`environment`},audio:!1}),this.cameraOpen=!0,await this.updateComplete;let e=this.renderRoot.querySelector(`video`);e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){let e=this.renderRoot.querySelector(`video`);if(!e||e.videoWidth===0)return;let t=document.createElement(`canvas`);t.width=e.videoWidth,t.height=e.videoHeight,t.getContext(`2d`).drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL(`image/jpeg`,.9))}triggerFallback(){this.renderRoot.querySelector(`input[type=file]`)?.click()}render(){let e=this.value!=null&&this.value!==``;return E`
            <input type="file" accept="image/*" capture="environment" style="display: none;"
                   @change="${this.fileFallback}">
            ${this.cameraOpen?E`
                <video class="viewfinder" playsinline muted></video>
                <div class="actions">
                    <button class="button button--primary" @click="${this.shoot}">Capture</button>
                    <button class="button" @click="${this.closeCamera}">Cancel</button>
                </div>
            `:E`
                ${e?E`<img class="preview" src="${this.value}" alt="Photo"/>`:E`<div class="placeholder" aria-hidden="true">📷</div>`}
                <div class="actions">
                    <button class="button button--primary" @click="${this.openCamera}">
                        ${e?`Retake`:`Take photo`}
                    </button>
                    ${this.cameraError?E`
                        <button class="button" @click="${this.triggerFallback}">Use file / native camera</button>`:y}
                    ${e?E`
                        <button class="button button--danger" @click="${()=>this.emit(``)}">Delete</button>`:y}
                </div>
                ${this.cameraError?E`
                    <div class="error-hint">Camera unavailable — the file picker opens the device camera on phones.</div>`:y}
            `}`}static{this.styles=g`
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
    `}};A([b()],il.prototype,`fieldId`,void 0),A([b()],il.prototype,`value`,void 0),A([w()],il.prototype,`cameraOpen`,void 0),A([w()],il.prototype,`cameraError`,void 0),il=A([_(`mateu-camera-capture`)],il);var al,ol=(e,t)=>{if(!e)return;if(Array.isArray(e)){let n=e.find(e=>e.key==t);return n?.value==null?void 0:String(n.value)}let n=e[t];return n==null?void 0:String(n)},sl=class extends x{static{al=this}constructor(...e){super(...e),this.fieldId=``,this.editable=!0,this.filePicked=e=>{let t=e.target,n=t.files?.[0];if(!n)return;let r=new FileReader;r.onload=()=>{let e=r.result,t=e.indexOf(`,`),i=e.substring(0,t).replace(`;base64`,`;name=${encodeURIComponent(n.name)};base64`);this.emit(i+e.substring(t))},r.readAsDataURL(n),t.value=``}}static fileName(e){if(!e)return``;if(e.startsWith(`data:`)){let t=e.indexOf(`,`),n=e.substring(5,t<0?e.length:t).split(`;`).find(e=>e.startsWith(`name=`));if(n)try{return decodeURIComponent(n.substring(5))}catch{return n.substring(5)}return`Attached file`}return e.split(`/`).pop()||e}emit(e){this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}triggerPick(){this.renderRoot.querySelector(`input[type=file]`)?.click()}render(){let e=this.value!=null&&this.value!==``,t=al.fileName(this.value),n=e&&this.value.startsWith(`data:`),r=e?E`<span class="file" title="${t}">📄 ${n?E`<a href="${this.value}" download="${t}">${t}</a>`:E`<a href="${this.value}" target="_blank">${t}</a>`}</span>`:y;return this.editable?E`
            <input type="file" accept="${this.accept||y}" style="display: none;"
                   @change="${this.filePicked}">
            <div class="row">
                ${r}
                <button class="button" @click="${this.triggerPick}">
                    ${e?`Replace`:`Choose file`}
                </button>
                ${e?E`
                    <button class="button button--danger" @click="${()=>this.emit(``)}">Remove</button>`:y}
            </div>`:E`${e?r:E`<span class="empty">—</span>`}`}static{this.styles=g`
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
    `}};A([b()],sl.prototype,`fieldId`,void 0),A([b()],sl.prototype,`value`,void 0),A([b()],sl.prototype,`accept`,void 0),A([b({type:Boolean})],sl.prototype,`editable`,void 0),sl=al=A([_(`mateu-file-upload`)],sl);var cl=e=>e==null||typeof e==`string`&&e.trim()===``,ll=(e,t)=>{if(cl(e))return null;let n=t?parseInt(String(e),10):Number(e);return Number.isNaN(n)?null:n},ul=(e,t)=>cl(e)&&cl(t)?!0:e==t,dl=e=>!!e&&typeof e==`object`&&`__mateuGroup`in e,fl=e=>String(e??``),pl=(e,t,n)=>{let r=e??[];if(!t||!n||n.length===0)return r;let i=[],a,o=!1;return r.forEach((e,s)=>{let c=fl(e?.[t]);if(!o||c!==a){let e=n.find(e=>fl(e.value)===c)??{value:c,count:r.filter(e=>fl(e?.[t])===c).length,aggregates:{}};i.push({__mateuGroup:e,__mateuGroupBy:t,_rowNumber:`__mateuGroup:${s}:${c}`}),o=!0,a=c}i.push(e)}),i},ml=(e,t)=>e==null?``:t.dataType===`money`||t.stereotype===`money`?new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(e):t.aggregate===`count`?new Intl.NumberFormat(void 0,{maximumFractionDigits:0}).format(Math.round(e)):new Intl.NumberFormat(void 0,{maximumFractionDigits:2}).format(e),hl=(e,t)=>e&&t.includes(e)?e:t.find(e=>!!e),gl=(e,t,n)=>{let r=e.__mateuGroup;return t.id===n?`${r.value} (${r.count})`:t.aggregate?ml(r.aggregates?.[t.id],t):``},_l=(e,t,n)=>{let r=t?.aggregates;if(!r||!e.some(e=>e.aggregate))return;let i={};e.forEach(e=>{e.aggregate&&r[e.id]!=null&&(i[e.id]=ml(r[e.id],e))});let a=e[0];if(a&&i[a.id]===void 0){let e=t?.page?.totalElements;i[a.id]=n&&a.id===n&&e!=null?`Total (${e})`:`Total`}return i},vl=(e,t,n)=>I(e[n.path]?`vaadin:check`:`vaadin:minus`,`height: 16px; width: 16px; color: var(--lumo-body-text-color);`),yl=(e,t,n,r,i)=>{let a=e[n.path],o=a;return r==`money`&&a&&a.locale&&a.currency?o=new Intl.NumberFormat(a.locale,{style:`currency`,currency:a.currency}).format(a.value):i==`money`&&(o=new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(a)),E`${o}`},bl=(e,t,n)=>{e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:n},bubbles:!0,composed:!0}))},xl=(e,t,n,r,i,a)=>{let o=n.xcolumn??a;if(o.text)return o.actionId?E`<a href="javascript: void(0);" @click="${t=>bl(n,o,e)}">${o.text}</a>`:E`<a href="${e[n.path]}">${o.text}</a>`;if(r==`string`){if(o.actionId)return E`<a href="javascript: void(0);" @click="${t=>bl(n,o,e)}">${e[n.path]}</a>`;let t=e[n.path];return E`<a href="${t}">${t}</a>`}let s=e[n.path];return E`<a href="${s.href}">${s.text}</a>`},Sl=(e,t,n,r,i)=>{let a=e[n.path];return r==`string`?a.split(`,`).map(e=>I(e,`width: 16px;`)):a.split(`,`).map(e=>I(e.icon,`width: 16px;`))},Cl=(e,t,n,r,i)=>{let a=e[n.path];return E`${v(a)}`},wl=(e,t,n,r,i,a)=>r==`string`?E`<img src="${e[n.path]}" style="${`max-height: 40px; `+(a.style??``)}">`:E`<img src="${e[n.path].src}" style="${a.style??``}">`,Tl=e=>{let t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`action-on-row-`+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},El=e=>{let t={_clickedRow:e.target.row},n=e.target.action;e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`action-on-row-`+n.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Dl=e=>{let t=document.createElement(`vaadin-context-menu-item`),n=document.createElement(`vaadin-icon`);return n.style.color=`var(--lumo-secondary-text-color)`,n.style.marginInlineEnd=`var(--lumo-space-s)`,n.style.padding=`var(--lumo-space-xs)`,n.setAttribute(`icon`,e.icon),t.appendChild(n),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},Ol=(e,t,n)=>{let r=e[n.path]?.actions?.map(e=>e.icon?{component:Dl(e),methodNameInCrud:e.methodNameInCrud}:{...e,text:e.label});return!r||r.length==0?E``:E`
                                     <vaadin-menu-bar
                                         .items=${[{text:`···`,children:r}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${n.path}"
                                         @item-selected="${Tl}"
                                     ></vaadin-menu-bar>
                                   `},kl=(e,t,n)=>{if(n.path==`select`)return E`
         <vaadin-button theme="tertiary" title="Select" @click="${El}" .row="${e}" .action="${{actionId:n.path,icon:``,label:`Select`,disabled:!1,methodNameInCrud:`select`}}">
             Select
         </vaadin-button>
    `;let r=n.path&&e[n.path]?.methodNameInCrud?e[n.path]:e.action;return r?E`
         <vaadin-button theme="tertiary${r.icon&&!r.label?` icon`:``}" title="${r.label||y}" @click="${El}" .row="${e}" .action="${r}">
             ${r.icon?E`<vaadin-icon icon="${r.icon}"></vaadin-icon>`:y}
             ${r.label?r.label:y}
         </vaadin-button>
    `:E``},Al=(e,t,n)=>{e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:n},bubbles:!0,composed:!0}))},jl=(e,t,n,r,i,a)=>{let o=n.xcolumn??a;if(o.actionId)return E`
            <vaadin-button theme="tertiary" @click="${t=>Al(n,o,e)}" .row="${e}">
                ${o.text||e[n.path]}
            </vaadin-button>
        `;let s=e[n.path];return E`<a href="${s}">${o.text||s}</a>`},Ml=(e,t,n,r,i,a,o,s,c)=>{let l=e[n.path];return F(r,l,i,a,o,s,c)},Nl=new WeakMap,Pl=(e,t)=>Nl.get(e)?.[t],Fl=(e,t,n)=>{let r=Nl.get(e);r||(r={},Nl.set(e,r)),r[t]=n},Il=(e,t=!1)=>ll(e,t),Ll=(e,t,n,r)=>{let i=n?.field?.fieldId,a=a=>{if(e[t.id]===a||e[t.id]==null&&(a===``||a==null))return;if(e[t.id]=a,!i){n.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`update-row`,parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}let o=(n?.state??r)[i];n.dispatchEvent(new CustomEvent(`value-changed`,{detail:{fieldId:i,value:Array.isArray(o)?[...o]:o},bubbles:!0,composed:!0}))},o=e[t.id],s=o==null?``:String(o);switch(t.editorType){case`boolean`:return E`<vaadin-checkbox ?checked=${!!o} @checked-changed=${e=>a(e.detail.value)}></vaadin-checkbox>`;case`integer`:return E`<vaadin-integer-field theme="small" style="width:100%;" .value=${s} @change=${e=>a(Il(e.target.value,!0))}></vaadin-integer-field>`;case`number`:return E`<vaadin-number-field theme="small" style="width:100%;" .value=${s} @change=${e=>a(Il(e.target.value))}></vaadin-number-field>`;case`date`:return E`<vaadin-date-picker theme="small" style="width:100%;" .value=${s} @value-changed=${e=>a(e.detail.value)}></vaadin-date-picker>`;case`time`:return E`<vaadin-time-picker theme="small" style="width:100%;" .value=${s} @value-changed=${e=>a(e.detail.value)}></vaadin-time-picker>`;case`datetime`:return E`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${s} @value-changed=${e=>a(e.detail.value)}></vaadin-date-time-picker>`;case`select`:return E`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(e=>({label:e.label,value:String(e.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${s}
                @value-changed=${e=>a(e.detail.value)}></vaadin-combo-box>`;case`lookup`:{let r=n?.field?.fieldId,i=`search-${r}-${t.id}`,o=`${r}-${t.id}`;return E`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${(e,t)=>{n.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:i,parameters:{searchText:e.filter,size:e.pageSize,page:e.page},callback:e=>{let n=e?.fragments?.[0]?.data?.[o];t(n?.content??[],n?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${(t.editorOptions??[]).find(e=>String(e.value)===s)??(s?{value:s,label:Pl(e,t.id)??s}:void 0)}
                @selected-item-changed=${n=>{let r=n.detail.value,i=r?r.value:null;String(i??``)!==s&&(r&&Fl(e,t.id,r.label),a(i))}}></vaadin-combo-box>`}default:return E`<vaadin-text-field theme="small" style="width:100%;" .value=${s} @change=${e=>a(e.target.value)}></vaadin-text-field>`}},Rl=e=>m(()=>E`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),zl=e=>e===void 0?y:d(()=>E`<span style="font-weight: 600; white-space: nowrap;">${e}</span>`,[e]),Bl=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent(`sort-direction-changed`,{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},Vl=(e,t,n,r,i,a,o,s)=>E`
<vaadin-grid-column-group header="${N(e.label,r,i)}">
    ${e.columns.map(e=>Ul(e.metadata,t,n,r,i,a,o,s?.[e.metadata?.id]))}
</vaadin-grid-column-group>
`,Hl=(e,t,n,r,i,a,o,s)=>M.GridGroupColumn==e.metadata?.type?Vl(e.metadata,t,n,r,i,a,o,s):Ul(e.metadata,t,n,r,i,a,o,s?.[e.metadata?.id]),Ul=(e,n,r,i,a,o,s,c)=>{let l=N(e.label,i,a);return e.sortable?E`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??y}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??y}"
                                ?resizable="${e.resizable}"
                                width="${e.width??y}"
                                @direction-changed="${Bl}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${Rl(l)}
                                ${zl(c)}
                                ${t((t,c,l)=>Wl(t,c,l,e,n,r,i,a,o,s),[e,i,a])}
                        ></vaadin-grid-sort-column>
                    `:e.filterable?E`
                        <vaadin-grid-filter-column
                                path="${e.id}"
                                text-align="${e.align??y}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??y}"
                                ?resizable="${e.resizable}"
                                width="${e.width??y}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${Rl(l)}
                                ${zl(c)}
                                ${t((t,c,l)=>Wl(t,c,l,e,n,r,i,a,o,s),[e,i,a])}
                        ></vaadin-grid-filter-column>
                    `:E`
                        <vaadin-grid-column
                                path="${e.id}"
                                text-align="${e.align??y}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??y}"
                                ?resizable="${e.resizable}"
                                width="${e.width??y}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                .xcolumn="${e}"
                                ${Rl(l)}
                                ${zl(c)}
                                ${t((t,c,l)=>Wl(t,c,l,e,n,r,i,a,o,s),[e,i,a])}
                        ></vaadin-grid-column>
                    `},Wl=(e,t,n,r,i,a,o,s,c,l)=>{let u=n.dataset.dataType??``,d=n.dataset.stereotype??``;if(dl(e)){let t=i?.metadata,n=(t?.columns??[]).flatMap(e=>e?.metadata?.type===M.GridGroupColumn?(e.metadata.columns??[]).map(e=>e?.metadata?.id):[e?.metadata?.id]),a=gl(e,r,hl(e.__mateuGroupBy,n)),o=e.__mateuGroup.hiddenActions??[],s=r.id===n[n.length-1]?(t?.groupActions??[]).filter(e=>!o.includes(e.actionId??e.id)):[];return s.length?E`<span style="display: flex; align-items: center; justify-content: flex-end; gap: var(--lumo-space-s); overflow: hidden;">
                ${a?E`<span style="font-weight: 600;">${a}</span>`:y}
                ${s.map(t=>E`
                    <vaadin-button theme="tertiary small" style="flex-shrink: 0;"
                        @click="${n=>{n.stopPropagation(),n.currentTarget.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`action-on-row-`+(t.actionId??t.id),parameters:{_groupValue:e.__mateuGroup.value}},bubbles:!0,composed:!0}))}}">${t.label??t.caption??``}</vaadin-button>
                `)}
            </span>`:E`<span title="${a}" style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${a}</span>`}if(r.editable)return Ll(e,r,i,o);if(u==`status`)return ja(e,t,n);if(u==`bool`)return vl(e,t,n);if(u==`money`||d==`money`)return yl(e,t,n,u,d);if(u==`link`||d==`link`)return xl(e,t,n,u,d,r);if(u==`icon`||d==`icon`)return Sl(e,t,n,u,d);if(d==`html`)return Cl(e,t,n,u,d);if(d==`image`)return wl(e,t,n,u,d,r);if(u==`menu`)return Ol(e,t,n);if(u==`component`)return Ml(e,t,n,i,a,o,s,c,l);if(u==`action`)return kl(e,t,n);if(u==`actionGroup`)return Ol(e,t,n);if(d==`button`||r.actionId)return jl(e,t,n,u,d,r);let f=e[n.path];return E`<span title="${f}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${f}</span>`},Gl=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},Kl=(e,t)=>{let n=t;for(;n;){if(n===e)return!0;n=n.assignedSlot??n.parentNode??n.host??null}return!1},ql=class extends gt{constructor(...e){super(...e),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{let t=e.currentTarget,n=t.getEventContext(e)?.item??null;n!==this.hoveredItem&&(this.hoveredItem=n,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?`hovered-cell`:``,this._onRowKey=e=>{let t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!ir(t,e))return;let n=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!n)return;let r=this.currentItems(),i=parseInt(n[1],10)-1;i>=r.length||(e.preventDefault(),this.selectRow(r[i]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener(`keydown`,this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener(`keydown`,this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+`_selected_items`]=[e],this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;let e=Gl();if(e&&e!==document.body&&!Kl(this,e)){let t=e.tagName?.toLowerCase()??``;if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith(`vaadin-`)&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){let{item:t,selected:n,shiftKey:r}=e.detail;if(this.rangeStartItem??=t,r){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);let[r,i]=[this.rangeStartItem,t].map(t=>e.indexOf(t)).sort((e,t)=>e-t),a=e.slice(r,i+1),o=new Set(this.selectedItems);a.forEach(e=>{n?o.add(e):o.delete(e)}),this.selectedItems=[...o],this.state[this.id+`_selected_items`]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);let t=this.state[this.field?.fieldId+`_show_detail`]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){let t=this.field.remoteCoordinates;this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((e,t)=>{e&&typeof e==`object`&&e._rowNumber===void 0&&(e._rowNumber=t)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith(`modal`)){let n=this;return E`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{n.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.field?.fieldId+`_cancel`},bubbles:!0,composed:!0}))}}"
                        ${s(()=>E`
                            <mateu-event-interceptor .target="${n}">
                                <div id="container" style="${this.field?.formStyle??`display: contents;`}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>D()])}
                ></vaadin-dialog>
                
            `}else{let n=this.field?.formPosition,r=n===`left`||n===`right`;return E`
            <div style="display: flex; flex-direction: ${r?`row`:`column`}; gap: var(--lumo-space-m, 1rem); width: 100%; ${t&&this.field?.minHeightWhenDetailVisible?`min-height: `+this.field?.minHeightWhenDetailVisible+`;`:``}">
                <div style="${r?`flex: 1; min-width: 0;`:`width: 100%;`}${n===`left`?` order: 2;`:``}">
                    ${this.renderMaster(e)}
                </div>
                <div style="${t?``:`display: none;`}${r?`flex: 1; min-width: 0;`:`width: 100%;`}${n===`left`?` order: 1;`:``}${this.field?.formStyle??``}">
                    <div id="container" style="padding: 0 2rem 2rem; background-color: var(--lumo-base-color);">
                        <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                    </div>
                </div>
            </div>`}}renderMaster(e){let r=this.selectedItems||[];return E`<vaadin-vertical-layout style="width: 100%;">
            <!-- The field label is rendered by the surrounding mateu-field wrapper; rendering it
                 here too would duplicate it (e.g. "Guests / Guests"). -->
            <vaadin-grid
                    ?clickable="${!!this.field?.onItemSelectionActionId}"
                    .cellPartNameGenerator="${C(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${C(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${C(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?`cursor: pointer;`:``}${this.field?.style??``}"
                    class="${this.field?.cssClasses}"
                    .items="${e}"
                    .selectedItems="${r}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${e=>{this.selectedItems=e.detail.value,this.state[this.id+`_selected_items`]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${C(this.field?.onItemSelectionActionId?e=>{if(e.composedPath().some(e=>e instanceof HTMLElement&&(e.localName===`vaadin-button`||e.localName===`button`||e.localName===`a`||e.localName===`vaadin-checkbox`||e.getAttribute?.(`role`)===`button`)))return;let t=e.currentTarget.getEventContext(e)?.item;t&&this.selectRow(t)}:void 0)}"
                    @active-item-changed="${C(this.field?.detailPath&&!this.field?.useButtonForDetail?e=>{if(this.field?.detailPath){let t=e.detail.value;t?this.detailsOpenedItems=[t]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${C(this.field?.detailPath?n(e=>E`${F(this,e[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${e?.length<10}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:`No items added yet.`}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?y:E`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(e=>Hl(e,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?E`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${t(e=>E`
                                <vaadin-button theme="tertiary icon error" title="Remove row"
                                    @click="${()=>{this.state[this.id+`_selected_items`]=[e],this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_remove`},bubbles:!0,composed:!0}))}}">
                                    <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                </vaadin-button>`,[])}
                    ></vaadin-grid-column>
                `:y}

                ${this.field?.useButtonForDetail?E`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${t((e,{detailsOpened:t})=>E`
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
                `:y}

            </vaadin-grid>
            ${this.field?.readOnly?y:this.field?.inlineEditing?E`
                    <vaadin-horizontal-layout theme="spacing">
                        <!-- Inline mode: rows are removed with the per-row trash button, so the
                             toolbar only needs the "add" action. -->
                        <vaadin-button theme="tertiary icon" title="Add row" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_add`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:plus"></vaadin-icon></vaadin-button>
                    </vaadin-horizontal-layout>
                `:E`
                    <vaadin-horizontal-layout theme="spacing">
                        <vaadin-button theme="tertiary icon" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_add`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:plus"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon error" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_remove`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:minus"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon" title="Move up" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_move-up`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:arrow-up"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon" title="Move down" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_move-down`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:arrow-down"></vaadin-icon></vaadin-button>
                    </vaadin-horizontal-layout>
                `}
        </vaadin-vertical-layout>`}static{this.styles=g`
        ${ue}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `}};A([b()],ql.prototype,`field`,void 0),A([b()],ql.prototype,`state`,void 0),A([b()],ql.prototype,`data`,void 0),A([b()],ql.prototype,`appState`,void 0),A([b()],ql.prototype,`appData`,void 0),A([b()],ql.prototype,`selectedItems`,void 0),A([w()],ql.prototype,`detailsOpenedItems`,void 0),ql=A([_(`mateu-grid`)],ql);var Jl=class extends x{constructor(...e){super(...e),this.getNewValue=e=>{if(this.field?.dataType==`array`){if(!this.value)return[e];let t=this.value;return t.indexOf(e)>=0?t.filter(t=>t!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){let t=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}return E`
        <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; ${this.field?.attributes?.divStyle}">
                                    ${e?.map(e=>E`
                            <div role="button" tabindex="0" 
                                    class="choice ${this.value==e.value||Array.isArray(this.value)&&this.value.includes(e.value)?`selected`:``}"
                                    @click="${()=>this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:this.getNewValue(e.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}" @keydown="${R(()=>this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:this.getNewValue(e.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))}"
                            >${e.description||e.image?E`
                                <div style="display: flex; align-items: center; gap: var(--lumo-space-m, 1rem);">
                                    ${e.image?E`
                                            <img src="${e.image}" alt="${e.label}" style="${e.imageStyle??`width: 2rem;`}" />
                                        `:y}
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

       `}static{this.styles=g`
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
  
        ${z}
    `}};A([b()],Jl.prototype,`field`,void 0),A([b()],Jl.prototype,`baseUrl`,void 0),A([b()],Jl.prototype,`state`,void 0),A([b()],Jl.prototype,`data`,void 0),A([b()],Jl.prototype,`value`,void 0),Jl=A([_(`mateu-choice`)],Jl);var Yl,Xl=class extends x{static{Yl=this}constructor(...e){super(...e),this.commit=e=>{this.value=e,this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:{...e},fieldId:this.fieldId}}))},this.currencyChanged=e=>{let t=this.value??Yl.EMPTY;!e.detail.value||e.detail.value===t.currency||this.commit({...t,currency:e.detail.value})},this.valueChanged=e=>{let t=this.value??Yl.EMPTY,n=ll(e.detail.value,!1)??0;n!==t.value&&this.commit({...t,value:n})}}static{this.EMPTY={value:0,currency:`EUR`,locale:`es-ES`}}render(){return E`
            <vaadin-number-field
                    id="${this.fieldId}"
                    label="${this.label}"
                    @value-changed="${this.valueChanged}"
                    .value="${this.value?.value}"
                    .helperText="${this.helperText}"
                    ?autofocus="${this.autofocus}"
                    ?required="${this.required||y}"
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
       `}static{this.styles=g`
  `}};A([b()],Xl.prototype,`fieldId`,void 0),A([b()],Xl.prototype,`label`,void 0),A([b()],Xl.prototype,`state`,void 0),A([b()],Xl.prototype,`data`,void 0),A([b()],Xl.prototype,`value`,void 0),A([b()],Xl.prototype,`autoFocus`,void 0),A([b()],Xl.prototype,`required`,void 0),A([b()],Xl.prototype,`colspan`,void 0),A([b()],Xl.prototype,`helperText`,void 0),Xl=Yl=A([_(`mateu-money-field`)],Xl);var Zl=`vaadin:abacus.vaadin:absolute-position.vaadin:academy-cap.vaadin:accessibility.vaadin:accordion-menu.vaadin:add-dock.vaadin:adjust.vaadin:adobe-flash.vaadin:airplane.vaadin:alarm.vaadin:align-center.vaadin:align-justify.vaadin:align-left.vaadin:align-right.vaadin:alt-a.vaadin:alt.vaadin:ambulance.vaadin:anchor.vaadin:angle-double-down.vaadin:angle-double-left.vaadin:angle-double-right.vaadin:angle-double-up.vaadin:angle-down.vaadin:angle-left.vaadin:angle-right.vaadin:angle-up.vaadin:archive.vaadin:archives.vaadin:area-select.vaadin:arrow-backward.vaadin:arrow-circle-down-o.vaadin:arrow-circle-down.vaadin:arrow-circle-left-o.vaadin:arrow-circle-left.vaadin:arrow-circle-right-o.vaadin:arrow-circle-right.vaadin:arrow-circle-up-o.vaadin:arrow-circle-up.vaadin:arrow-down.vaadin:arrow-forward.vaadin:arrow-left.vaadin:arrow-long-down.vaadin:arrow-long-left.vaadin:arrow-right.vaadin:arrow-up.vaadin:arrows-cross.vaadin:arrows-long-h.vaadin:arrows-long-right.vaadin:arrows-long-up.vaadin:arrows-long-v.vaadin:arrows.vaadin:asterisk.vaadin:at.vaadin:automation.vaadin:backspace-a.vaadin:backspace.vaadin:backwards.vaadin:ban.vaadin:bar-chart-h.vaadin:bar-chart-v.vaadin:bar-chart.vaadin:barcode.vaadin:bed.vaadin:bell-o.vaadin:bell-slash-o.vaadin:bell-slash.vaadin:bell.vaadin:boat.vaadin:bold.vaadin:bolt.vaadin:bomb.vaadin:book-dollar.vaadin:book-percent.vaadin:book.vaadin:bookmark-o.vaadin:bookmark.vaadin:briefcase.vaadin:browser.vaadin:bug-o.vaadin:bug.vaadin:building-o.vaadin:building.vaadin:bullets.vaadin:bullseye.vaadin:bus.vaadin:buss.vaadin:button.vaadin:calc-book.vaadin:calc.vaadin:calendar-briefcase.vaadin:calendar-clock.vaadin:calendar-envelope.vaadin:calendar-o.vaadin:calendar-user.vaadin:calendar.vaadin:camera.vaadin:car.vaadin:caret-down.vaadin:caret-left.vaadin:caret-right.vaadin:caret-square-down-o.vaadin:caret-square-left-o.vaadin:caret-square-right-o.vaadin:caret-square-up-o.vaadin:caret-up.vaadin:cart-o.vaadin:cart.vaadin:cash.vaadin:chart-3d.vaadin:chart-grid.vaadin:chart-line.vaadin:chart-timeline.vaadin:chart.vaadin:chat.vaadin:check-circle-o.vaadin:check-circle.vaadin:check-square-o.vaadin:check-square.vaadin:check.vaadin:chevron-circle-down-o.vaadin:chevron-circle-down.vaadin:chevron-circle-left-o.vaadin:chevron-circle-left.vaadin:chevron-circle-right-o.vaadin:chevron-circle-right.vaadin:chevron-circle-up-o.vaadin:chevron-circle-up.vaadin:chevron-down-small.vaadin:chevron-down.vaadin:chevron-left-small.vaadin:chevron-left.vaadin:chevron-right-small.vaadin:chevron-right.vaadin:chevron-up-small.vaadin:chevron-up.vaadin:child.vaadin:circle-thin.vaadin:circle.vaadin:clipboard-check.vaadin:clipboard-cross.vaadin:clipboard-heart.vaadin:clipboard-pulse.vaadin:clipboard-text.vaadin:clipboard-user.vaadin:clipboard.vaadin:clock.vaadin:close-big.vaadin:close-circle-o.vaadin:close-circle.vaadin:close-small.vaadin:close.vaadin:cloud-download-o.vaadin:cloud-download.vaadin:cloud-o.vaadin:cloud-upload-o.vaadin:cloud-upload.vaadin:cloud.vaadin:cluster.vaadin:code.vaadin:coffee.vaadin:cog-o.vaadin:cog.vaadin:cogs.vaadin:coin-piles.vaadin:coins.vaadin:combobox.vaadin:comment-ellipsis-o.vaadin:comment-ellipsis.vaadin:comment-o.vaadin:comment.vaadin:comments-o.vaadin:comments.vaadin:compile.vaadin:compress-square.vaadin:compress.vaadin:connect-o.vaadin:connect.vaadin:controller.vaadin:copy-o.vaadin:copy.vaadin:copyright.vaadin:corner-lower-left.vaadin:corner-lower-right.vaadin:corner-upper-left.vaadin:corner-upper-right.vaadin:credit-card.vaadin:crop.vaadin:cross-cutlery.vaadin:crosshairs.vaadin:css.vaadin:ctrl-a.vaadin:ctrl.vaadin:cube.vaadin:cubes.vaadin:curly-brackets.vaadin:cursor-o.vaadin:cursor.vaadin:cutlery.vaadin:dashboard.vaadin:database.vaadin:date-input.vaadin:deindent.vaadin:del-a.vaadin:del.vaadin:dental-chair.vaadin:desktop.vaadin:diamond-o.vaadin:diamond.vaadin:diploma-scroll.vaadin:diploma.vaadin:disc.vaadin:doctor-briefcase.vaadin:doctor.vaadin:dollar.vaadin:dot-circle.vaadin:download-alt.vaadin:download.vaadin:drop.vaadin:edit.vaadin:eject.vaadin:elastic.vaadin:ellipsis-circle-o.vaadin:ellipsis-circle.vaadin:ellipsis-dots-h.vaadin:ellipsis-dots-v.vaadin:ellipsis-h.vaadin:ellipsis-v.vaadin:enter-arrow.vaadin:enter.vaadin:envelope-o.vaadin:envelope-open-o.vaadin:envelope-open.vaadin:envelope.vaadin:envelopes-o.vaadin:envelopes.vaadin:eraser.vaadin:esc-a.vaadin:esc.vaadin:euro.vaadin:exchange.vaadin:exclamation-circle-o.vaadin:exclamation-circle.vaadin:exclamation.vaadin:exit-o.vaadin:exit.vaadin:expand-full.vaadin:expand-square.vaadin:expand.vaadin:external-browser.vaadin:external-link.vaadin:eye-slash.vaadin:eye.vaadin:eyedropper.vaadin:facebook-square.vaadin:facebook.vaadin:factory.vaadin:family.vaadin:fast-backward.vaadin:fast-forward.vaadin:female.vaadin:file-add.vaadin:file-code.vaadin:file-font.vaadin:file-movie.vaadin:file-o.vaadin:file-picture.vaadin:file-presentation.vaadin:file-process.vaadin:file-refresh.vaadin:file-remove.vaadin:file-search.vaadin:file-sound.vaadin:file-start.vaadin:file-table.vaadin:file-text-o.vaadin:file-text.vaadin:file-tree-small.vaadin:file-tree-sub.vaadin:file-tree.vaadin:file-zip.vaadin:file.vaadin:fill.vaadin:film.vaadin:filter.vaadin:fire.vaadin:flag-checkered.vaadin:flag-o.vaadin:flag.vaadin:flash.vaadin:flask.vaadin:flight-landing.vaadin:flight-takeoff.vaadin:flip-h.vaadin:flip-v.vaadin:folder-add.vaadin:folder-o.vaadin:folder-open-o.vaadin:folder-open.vaadin:folder-remove.vaadin:folder-search.vaadin:folder.vaadin:font.vaadin:form.vaadin:forward.vaadin:frown-o.vaadin:funcion.vaadin:function.vaadin:funnel.vaadin:gamepad.vaadin:gavel.vaadin:gift.vaadin:glass.vaadin:glasses.vaadin:globe-wire.vaadin:globe.vaadin:golf.vaadin:google-plus-square.vaadin:google-plus.vaadin:grab.vaadin:grid-bevel.vaadin:grid-big-o.vaadin:grid-big.vaadin:grid-h.vaadin:grid-small-o.vaadin:grid-small.vaadin:grid-v.vaadin:grid.vaadin:group.vaadin:hammer.vaadin:hand.vaadin:handle-corner.vaadin:hands-up.vaadin:handshake.vaadin:harddrive-o.vaadin:harddrive.vaadin:hash.vaadin:header.vaadin:headphones.vaadin:headset.vaadin:health-card.vaadin:heart-o.vaadin:heart.vaadin:home-o.vaadin:home.vaadin:hospital.vaadin:hourglass-empty.vaadin:hourglass-end.vaadin:hourglass-start.vaadin:hourglass.vaadin:inbox.vaadin:indent.vaadin:info-circle-o.vaadin:info-circle.vaadin:info.vaadin:input.vaadin:insert.vaadin:institution.vaadin:invoice.vaadin:italic.vaadin:key-o.vaadin:key.vaadin:keyboard-o.vaadin:keyboard.vaadin:laptop.vaadin:layout.vaadin:level-down-bold.vaadin:level-down.vaadin:level-left-bold.vaadin:level-left.vaadin:level-right-bold.vaadin:level-right.vaadin:level-up-bold.vaadin:level-up.vaadin:lifebuoy.vaadin:lightbulb.vaadin:line-bar-chart.vaadin:line-chart.vaadin:line-h.vaadin:line-v.vaadin:lines-list.vaadin:lines.vaadin:link.vaadin:list-ol.vaadin:list-select.vaadin:list-ul.vaadin:list.vaadin:location-arrow-circle-o.vaadin:location-arrow-circle.vaadin:location-arrow.vaadin:lock.vaadin:magic.vaadin:magnet.vaadin:mailbox.vaadin:male.vaadin:map-marker.vaadin:margin-bottom.vaadin:margin-left.vaadin:margin-right.vaadin:margin-top.vaadin:margin.vaadin:medal.vaadin:megafone.vaadin:megaphone.vaadin:meh-o.vaadin:menu.vaadin:microphone.vaadin:minus-circle-o.vaadin:minus-circle.vaadin:minus-square-o.vaadin:minus.vaadin:mobile-browser.vaadin:mobile-retro.vaadin:mobile.vaadin:modal-list.vaadin:modal.vaadin:money-deposit.vaadin:money-exchange.vaadin:money-withdraw.vaadin:money.vaadin:moon-o.vaadin:moon.vaadin:morning.vaadin:movie.vaadin:music.vaadin:mute.vaadin:native-button.vaadin:newspaper.vaadin:notebook.vaadin:nurse.vaadin:office.vaadin:open-book.vaadin:option-a.vaadin:option.vaadin:options.vaadin:orientation.vaadin:out.vaadin:outbox.vaadin:package.vaadin:padding-bottom.vaadin:padding-left.vaadin:padding-right.vaadin:padding-top.vaadin:padding.vaadin:paint-roll.vaadin:paintbrush.vaadin:palete.vaadin:palette.vaadin:panel.vaadin:paperclip.vaadin:paperplane-o.vaadin:paperplane.vaadin:paragraph.vaadin:password.vaadin:paste.vaadin:pause.vaadin:pencil.vaadin:phone-landline.vaadin:phone.vaadin:picture.vaadin:pie-bar-chart.vaadin:pie-chart.vaadin:piggy-bank-coin.vaadin:piggy-bank.vaadin:pill.vaadin:pills.vaadin:pin-post.vaadin:pin.vaadin:play-circle-o.vaadin:play-circle.vaadin:play.vaadin:plug.vaadin:plus-circle-o.vaadin:plus-circle.vaadin:plus-minus.vaadin:plus-square-o.vaadin:plus.vaadin:pointer.vaadin:power-off.vaadin:presentation.vaadin:print.vaadin:progressbar.vaadin:puzzle-piece.vaadin:pyramid-chart.vaadin:qrcode.vaadin:question-circle-o.vaadin:question-circle.vaadin:question.vaadin:quote-left.vaadin:quote-right.vaadin:random.vaadin:raster-lower-left.vaadin:raster.vaadin:records.vaadin:recycle.vaadin:refresh.vaadin:reply-all.vaadin:reply.vaadin:resize-h.vaadin:resize-v.vaadin:retweet.vaadin:rhombus.vaadin:road-branch.vaadin:road-branches.vaadin:road-split.vaadin:road.vaadin:rocket.vaadin:rotate-left.vaadin:rotate-right.vaadin:rss-square.vaadin:rss.vaadin:safe-lock.vaadin:safe.vaadin:scale-unbalance.vaadin:scale.vaadin:scatter-chart.vaadin:scissors.vaadin:screwdriver.vaadin:search-minus.vaadin:search-plus.vaadin:search.vaadin:select.vaadin:server.vaadin:share-square.vaadin:share.vaadin:shield.vaadin:shift-arrow.vaadin:shift.vaadin:shop.vaadin:sign-in-alt.vaadin:sign-in.vaadin:sign-out-alt.vaadin:sign-out.vaadin:signal.vaadin:sitemap.vaadin:slider.vaadin:sliders.vaadin:smiley-o.vaadin:sort.vaadin:sound-disable.vaadin:spark-line.vaadin:specialist.vaadin:spinner-arc.vaadin:spinner-third.vaadin:spinner.vaadin:spline-area-chart.vaadin:spline-chart.vaadin:split-h.vaadin:split-v.vaadin:split.vaadin:spoon.vaadin:square-shadow.vaadin:star-half-left-o.vaadin:star-half-left.vaadin:star-half-right-o.vaadin:star-half-right.vaadin:star-o.vaadin:star.vaadin:start-cog.vaadin:step-backward.vaadin:step-forward.vaadin:stethoscope.vaadin:stock.vaadin:stop-cog.vaadin:stop.vaadin:stopwatch.vaadin:storage.vaadin:strikethrough.vaadin:subscript.vaadin:suitcase.vaadin:sun-down.vaadin:sun-o.vaadin:sun-rise.vaadin:superscript.vaadin:sword.vaadin:tab-a.vaadin:tab.vaadin:table.vaadin:tablet.vaadin:tabs.vaadin:tag.vaadin:tags.vaadin:tasks.vaadin:taxi.vaadin:teeth.vaadin:terminal.vaadin:text-height.vaadin:text-input.vaadin:text-label.vaadin:text-width.vaadin:thin-square.vaadin:thumbs-down-o.vaadin:thumbs-down.vaadin:thumbs-up-o.vaadin:thumbs-up.vaadin:ticket.vaadin:time-backward.vaadin:time-forward.vaadin:timer.vaadin:toolbox.vaadin:tools.vaadin:tooth.vaadin:touch.vaadin:train.vaadin:trash.vaadin:tree-table.vaadin:trendind-down.vaadin:trending-down.vaadin:trending-up.vaadin:trophy.vaadin:truck.vaadin:twin-col-select.vaadin:twitter-square.vaadin:twitter.vaadin:umbrella.vaadin:underline.vaadin:unlink.vaadin:unlock.vaadin:upload-alt.vaadin:upload.vaadin:user-card.vaadin:user-check.vaadin:user-clock.vaadin:user-heart.vaadin:user-star.vaadin:user.vaadin:users.vaadin:vaadin-h.vaadin:vaadin-v.vaadin:viewport.vaadin:vimeo-square.vaadin:vimeo.vaadin:volume-down.vaadin:volume-off.vaadin:volume-up.vaadin:volume.vaadin:wallet.vaadin:warning.vaadin:workplace.vaadin:wrench.vaadin:youtube-square.vaadin:youtube`.split(`.`),Ql=null,$l=()=>(Ql||=Promise.all([O(()=>import(`./vendor-ui5.js`).then(e=>e.n),__vite__mapDeps([5,1])),O(()=>import(`./vendor-ui5.js`).then(e=>e.t),__vite__mapDeps([5,1]))]),Ql),Q=class extends x{constructor(...e){super(...e),this.ui5FieldComponentsReady=!1,this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter=``,this.rendered=!1,this.renderColorPicker=()=>{this.loadUi5FieldComponents();let e=this.field?.fieldId;return E`
            <ui5-color-picker value="${this.state&&e in this.state?this.state[e]:this.field?.initialValue}" @change="${e=>this.colorPickerValue=e.target.value}">Picker</ui5-color-picker>
        `},this.saveColor=()=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:this.colorPickerValue,fieldId:this.field.fieldId},bubbles:!0,composed:!0})),this.colorPickerOpened=!1},this.renderColorPickerFooter=()=>E`<vaadin-button @click="${()=>this.colorPickerOpened=!1}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`,this.checked=e=>{let t=e.target;this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t.checked,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))},this.convert=e=>this.field?.dataType==`integer`?ll(e,!0):e,this.multiComboBoxValueChanged=e=>{if(this.rendered){let t=this.field?.fieldId,n=this.state&&t in this.state?this.state[t]:this.field?.initialValue,r;e.detail.value&&(r=e.detail.value.map(e=>e.value),r&&r.length>0&&(this.data[this.id]||(this.data[this.id]={}),this.data[this.id].content||(this.data[this.id].content=[]),this.data[this.id]&&this.data[this.id].content&&e.detail.value.forEach(e=>{this.data[this.id].content?.find(t=>e.value==t.value)||this.data[this.id].content.push(e)}))),this.compareArrays(r,n)||this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:r,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.valueChanged=e=>{this.rendered&&e.detail.value!==void 0&&!ul(e.detail.value,this.state[this.field.fieldId])&&this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:this.convert(e.detail.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.selectedItems=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.comboData&&this.comboData.length>0)return this.comboData?.filter(t=>e.indexOf(t.value)>=0);if(this.data[this.id]&&this.data[this.id].content&&this.data[this.id].content.length>0)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0)}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0);return[]},this.selectedIndex=e=>{if(e)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){let t=this.data[this.id].content.find(t=>t.value==e);if(t)return this.data[this.id].content.indexOf(t)}}else{let t=this.field?.options?.find(t=>t.value==e);if(t)return this.field?.options?.indexOf(t)}},this.selectedIndexes=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0).map(e=>this.data[this.id].content.indexOf(e))}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0).map(e=>this.field?.options?.indexOf(e));return[]},this.compareArrays=(e,t)=>this.falsy(e)&&this.falsy(t)||e&&t&&e.length===t.length&&e.every((e,n)=>e===t[n]),this.falsy=e=>!e||e.length==0,this.listItemsSelected=e=>{let t=this.field?.fieldId,n=this.state&&t in this.state?this.state[t]:this.field?.initialValue,r;this.rendered&&(e.detail.value&&(this.field?.remoteCoordinates?this.data[this.id]&&this.data[this.id].content&&(r=e.detail.value.map(e=>this.data[this.id].content[e].value)):r=e.detail.value.map(e=>this.field.options[e].value)),this.compareArrays(r,n)||this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:r,fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))},this.listItemSelected=e=>{let t;if(e.detail.value||e.detail.value==0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){let n=this.data[this.id].content[e.detail.value];n&&(t=n.value)}}else{let n=this.field.options[e.detail.value];n&&(t=n.value)}this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.mapPosition=e=>{switch(e){case`topStretch`:return`top-stretch`;case`topStart`:return`top-start`;case`topCenter`:return`top-center`;case`topEnd`:return`top-end`;case`middle`:return`middle`;case`bottomStart`:return`bottom-start`;case`bottomEnd`:return`bottom-end`;case`bottomStretch`:return`bottom-stretch`;case`bottomCenter`:return`bottom-center`}return`bottom-end`},this.helperShownInControl=!1,this.lastAnnouncedError=``,this.controlOwnsValidity=!1,this.fileUploaded=e=>{let t=this.field?.fieldId??``,n=this.state[t];n.push({id:e.detail.xhr.responseText,name:e.detail.file.name}),this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:n,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.fileChanged=e=>{let t=this.field?.fieldId??``,n=(e.detail.value??[]).filter(e=>e.id).map(e=>e.id),r=(this.state[t]??[]).map(e=>e.id);if(!this.compareArrays(r,n)){let t=(e.detail.value??[]).filter(e=>e.id).map(e=>({id:e.id,name:e.name}));this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.triggerImageUpload=()=>{(this.renderRoot?.querySelector(`input[type="file"]`))?.click()},this.imageUpload=e=>{let t=e.target,n=t.files?.[0];if(!n)return;let r=new FileReader;r.onload=()=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:r.result,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},r.readAsDataURL(n),t.value=``},this.imageDelete=()=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:``,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.iconComboboxRenderer=e=>E`
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
`,this.comboRenderer=e=>E`
        ${e.description||e.image||e.icon?E`
            <vaadin-horizontal-layout theme="spacing">
                ${e.icon?E`<div><vaadin-icon icon="${e.icon}"></vaadin-icon></div>
                                    `:y}
                ${e.image?E`
                    <div>
                    <img
                            style="width: var(--lumo-size-m); margin-right: var(--lumo-space-s);"
                            src="${e.image}"
                            alt="${e.label}"
                    />
                    </div>
                                        `:y}
                <div>
                    ${e.label}
                    ${e.description?E`
            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);">
                ${e.description}
            </div>
        `:y}
                </div>

            </vaadin-horizontal-layout>
                            `:e.label}
`,this.filteredIcons=[],this.navLinkOffset=null,this.iconFilterChanged=e=>{this.filteredIcons=Zl.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}loadUi5FieldComponents(){this.ui5FieldComponentsReady||$l().then(()=>{this.ui5FieldComponentsReady=!0})}remoteComboDataProvider(e){return(t,n)=>{let{filter:i,page:a,pageSize:o}=t,s=i??``;this._comboFilter=s,this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{searchText:i,fieldId:this.field?.fieldId,size:o,page:a,sort:void 0},callback:e=>{if(s===this._comboFilter)if(e?.messages?.forEach(e=>{r.show(e.text,{position:e.position?this.mapPosition(e.position):void 0,theme:e.variant,duration:e.duration})}),!e.fragments||e.fragments.length==0)this.comboData=[],n([],0);else{let t=e.fragments[0].data?.[this.id];this.comboData=t?.content,n(t?.content,t?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}renderNavLink(){let e=this.field?.link;if(!e?.href)return y;let t=N(e.href,this.state,this.data)??e.href,n=N(e.title,this.state,this.data)||t,r=e.icon||(t.startsWith(`http`)?`vaadin:external-link`:`vaadin:link`),i=this.navLinkOffset??`calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)`;return E`<a
                data-navlink
                href="${t}"
                title="${n}"
                target="${C(e.target||void 0)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${i};"
        ><vaadin-icon icon="${r}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`}positionNavLink(){let e=this.renderRoot?.querySelector(`a[data-navlink]`);e&&setTimeout(()=>{let t=e.parentElement,n=t?.firstElementChild?.firstElementChild;if(!t||!n)return;let r=(n.shadowRoot?.querySelector(`[part="input-field"]`)??n).getBoundingClientRect();if(r.height===0)return;let i=Math.max(0,r.top+r.height/2-e.offsetHeight/2-t.getBoundingClientRect().top),a=`${Math.round(i)}px`;this.navLinkOffset!==a&&(this.navLinkOffset=a)})}helperText(){return this.helperShownInControl=!0,Dt(this.field?.description??``,this.state,this.data)??``}fieldErrors(){let e=this.field?.fieldId??``,t=this.data?.errors?.[e];return Array.isArray(t)?t.filter(e=>!!e):[]}validatableControl(){let e=this.renderRoot.querySelectorAll(`*`);for(let t of e)if(`invalid`in t&&`errorMessage`in t)return t;return null}applyValidationState(){let e=this.fieldErrors(),t=this.validatableControl();if(!t){this.lastAnnouncedError=e.join(`. `);return}let n=e.join(`. `);if(t.errorMessage=n,t.invalid=e.length>0,n&&n!==this.lastAnnouncedError){let e=(this.field?.label??``).toString().trim();mt(e?`${e}: ${n}`:n,{politeness:`assertive`})}this.lastAnnouncedError=n}render(){this.rendered=!0;let e=this.renderNavLink();this.helperShownInControl=!1;let t=this.renderField(),n=this.field?.description&&!this.helperShownInControl?Dt(this.field.description,this.state,this.data):void 0,r=this.fieldErrors(),i=r.length>0&&!this.controlOwnsValidity;return E`<div style="display: block;">
            <div style="${e===y?``:`display: flex; gap: var(--lumo-space-xs);`}"><div style="flex: 1; min-width: 0;">${t}</div>${e}</div>
            ${n?E`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${n}</div>
            `:y}
            ${i?E`
                <div role="alert"><ul>${r.map(e=>E`<li>${e}</li>`)}</ul></div>
            `:y}
        </div>`}async firstUpdated(){this.filteredIcons=Zl}update(e){e.has(`component`)&&(this.rendered=!1),super.update(e)}updated(e){super.updated(e),this.positionNavLink(),this.applyValidationState(),this.controlOwnsValidity=!!this.validatableControl()}renderField(){let e=this.field?.fieldId??``,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,n=N(this.field?.label+``,this.state,this.data),r=this.labelAlreadyRendered||!n||n==`null`?y:n;return this.field?.propertyRow?this.renderPropertyRowField(e,t,r,n):this.field?.stereotype==`badge`?this.renderBadgeField(e,t,r,n):this.field?.stereotype==`plainText`?this.renderPlainTextField(e,t,r,n):this.field?.stereotype==`bulletedList`?this.renderBulletedListField(e,t,r,n):this.field?.readOnly&&this.field.stereotype!=`grid`&&this.field.dataType!=`status`&&this.field?.dataType!=`money`?this.renderReadOnlyField(e,t,r,n):this.field?.dataType==`file`?this.renderFileField(e,t,r,n):this.field?.dataType==`string`?this.renderStringField(e,t,r,n):this.field?.dataType==`number`?this.renderNumberField(e,t,r,n):this.field?.dataType==`integer`?this.renderIntegerField(e,t,r,n):this.field?.dataType==`bool`?this.renderBoolField(e,t,r,n):this.field?.dataType==`dateRange`?this.renderDateRangeField(e,t,r,n):this.field?.dataType==`date`?this.renderDateField(e,t,r,n):this.field?.dataType==`dateTime`?this.renderDateTimeField(e,t,r,n):this.field?.dataType==`time`?this.renderTimeField(e,t,r,n):this.field?.dataType==`array`?this.renderArrayField(e,t,r,n):this.field?.dataType==`money`?this.renderMoneyField(e,t,r,n):this.field?.dataType==`status`?this.renderStatusField(e,t,r,n):this.field?.dataType==`range`?this.renderRangeField(e,t,r,n):E`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,n,r){if(!this.field)return E``;let i=t===!0||t===`true`;return E`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${i?`success`:``} pill" style="${i?``:`opacity: 0.4;`}">${r}</span>
            </vaadin-custom-field>`}renderPropertyRowField(e,t,n,r){if(!this.field)return E``;let i=Dt(t,this.state,this.data),a=i&&typeof i==`object`&&`value`in i?i:null;i&&i.value&&(i=i.value);let o=this.field?.dataType==`bool`||i===!0||i===!1,s=this.field?.dataType==`money`,c=i!=null&&i!==``,l=c?String(i):`—`;if(s&&c){let e=typeof i==`number`?i:parseFloat(String(i));isNaN(e)||(l=a&&a.locale&&a.currency?new Intl.NumberFormat(a.locale,{style:`currency`,currency:a.currency}).format(e):new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(e))}let u=o?E`<vaadin-icon icon="${i===!0||i===`true`?`vaadin:check`:`vaadin:minus`}" style="height: 16px; width: 16px;"></vaadin-icon>`:E`<span style="font-weight: 500; text-align: right; word-break: break-word; margin-left: auto;${s?` font-variant-numeric: tabular-nums;`:``}">${l}</span>`,d=r&&r!=`null`;return E`<div
                    id="${this.field.fieldId}"
                    data-colspan="${this.field?.colspan}"
                    style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; width: 100%; padding: 0.4rem 0; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); font-size: var(--lumo-font-size-s, .875rem); ${this.field?.style}"
            >${d?E`<span style="color: var(--lumo-secondary-text-color, #888); white-space: nowrap;">${r}</span>`:y}${u}</div>`}renderBulletedListField(e,t,n,r){if(!this.field)return E``;let i=Dt(t,this.state,this.data),a=Array.isArray(i)?i.map(e=>String(e)):i!=null&&i!==``?[String(i)]:[];return E`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${n}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><mateu-bulleted-list .items="${a}"></mateu-bulleted-list>
            </vaadin-custom-field>`}renderPlainTextField(e,t,n,r){if(!this.field)return E``;let i=Dt(t,this.state,this.data),a=i&&typeof i==`object`&&`value`in i?i:null;i&&i.value&&(i=i.value);let o=this.field?.dataType==`bool`||i===!0||i===!1,s=this.field?.dataType==`money`,c=i!=null&&i!==``,l=c?String(i):`—`;if(s&&c){let e=typeof i==`number`?i:parseFloat(String(i));isNaN(e)||(l=a&&a.locale&&a.currency?new Intl.NumberFormat(a.locale,{style:`currency`,currency:a.currency}).format(e):new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(e))}let u=o?E`<vaadin-icon icon="${i===!0||i===`true`?`vaadin:check`:`vaadin:minus`}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?E`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${l}</span>`:E`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${s?` font-variant-numeric: tabular-nums;`:``}">${l}</span>`;return E`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${n}"
                    data-colspan="${this.field?.colspan}"
                    style="${s?`text-align: right; `:``}${this.field?.style}"
            >${u}</vaadin-custom-field>`}renderReadOnlyField(e,t,n,r){if(!this.field)return E``;let i=Dt(t,this.state,this.data)||this.data[e];if(i&&i.value&&(i=i.value),this.field.stereotype==`fileUpload`)return E`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><mateu-file-upload .fieldId="${this.field.fieldId}" .value="${i}" .editable="${!1}"></mateu-file-upload>
                </vaadin-custom-field>`;if(this.field.stereotype==`image`||this.field.stereotype==`uploadableImage`||this.field.stereotype==`signature`||this.field.stereotype==`camera`)return E`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        required="${this.field.required||y}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><img src="${i}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`;if(this.field.dataType==`bool`)return E`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        required="${this.field.required||y}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${i?`vaadin:check`:`vaadin:minus`}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`;let a=i==null?``:String(i);return E`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        value="${i}"
                        readonly
                        style="${this.field.style}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >${a.length>15?E`<vaadin-icon
                        slot="suffix"
                        icon="vaadin:copy"
                        title="Copiar"
                        style="cursor: pointer; color: var(--lumo-secondary-text-color);"
                        @click="${()=>this.copyValue(a)}"
                ></vaadin-icon>`:y}</vaadin-text-field>
`}copyValue(e){navigator.clipboard.writeText(e).then(()=>r.show(`Copied`,{position:`bottom-end`,theme:`success`,duration:2e3})).catch(()=>{})}renderFileField(e,t,n,r){if(!this.field)return E``;let i=t?.map(e=>({id:e.id,name:e.name,type:``,uploadTarget:``,complete:!0}))??[];return E`
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
            `}renderStringField(e,t,n,r){if(!this.field)return E``;if(this.field?.stereotype==`searchable`)return E`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            required="${this.field.required||y}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-horizontal-layout theme="spacing" style="--lumo-space-m: 0.33rem;">
                            <vaadin-text-field style="width: 4rem;" @change="${e=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`code-`+this.field?.fieldId,parameters:{code:e.currentTarget.value}},bubbles:!0,composed:!0}))}}" value="${t}"></vaadin-text-field>
                            <vaadin-text-field readonly="" value="${this.data[this.field.fieldId+`-label`]}"></vaadin-text-field>
                            <vaadin-button theme="icon" @click="${e=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`codesearch-`+this.field?.fieldId,parameters:{}},bubbles:!0,composed:!0}))}}"><vaadin-icon icon="lumo:search"></vaadin-icon></vaadin-button>
                        </vaadin-horizontal-layout>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`select`){if(this.field?.optionsSource){let e=this.field.optionsSource,r=N(e.url,this.state,this.data)??e.url;this.data[this.id]?.sourceSignature!==r&&(this.data[this.id]={content:this.data[this.id]?.content??[],sourceSignature:r},e.proxy?this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`__restfetch__`,parameters:{_sourceKind:`options`,_sourceId:this.field.fieldId},callback:t=>{let n=t?.appData?._restfetch,i=un(n,e.itemsPath,e.valuePath,e.labelPath);this.data[this.id]={content:i,totalElements:i.length,sourceSignature:r},this.requestUpdate()},callbackonly:!0},bubbles:!0,composed:!0})):pn(e,e=>N(e,this.state,this.data)).then(e=>{this.data[this.id]={content:e,totalElements:e.length,sourceSignature:r},this.requestUpdate()}).catch(e=>console.warn(`mateu: external options fetch failed`,e)));let i=t;return t&&t.value&&(i=t.value),E`
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
                            required="${this.field.required||y}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                    `}if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}));let r=t;return t&&t.value&&(r=t.value),E`
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
                            required="${this.field.required||y}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                    `}let e=t;return t&&t.value&&(e=t.value),E`
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
                            required="${this.field.required||y}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                `}if(this.field?.stereotype==`markdown`)return E`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            required="${this.field.required||y}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><vaadin-markdown
                            .content="${t}"
                    ></vaadin-markdown>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`combobox`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates,r;this.data[this.id]&&this.data[this.id].content&&(r=this.data[this.id].content.find(e=>e.value==t)),!r&&this.comboData&&(r=this.comboData.find(e=>e.value==t)),!r&&t&&(r={value:t,label:this.data[this.id+`-label`]??t});let i=this.remoteComboDataProvider(e.action);return E`
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
                            ?required="${this.field.required||y}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            @keyup="${e=>{if(e.key==`Backspace`){let t=e.currentTarget;t.inputElement.value||(t.value=``)}}}"
                            ${u(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}return E`
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
                            required="${this.field.required||y}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            ${u(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype==`listBox`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),E`
                        <vaadin-custom-field
                                label="${n}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${C(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map(e=>E`
                            <vaadin-item>${e.description||e.image||e.icon?E`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${e.icon?E`
                                        <vaadin-icon icon="${e.icon}"></vaadin-icon>
                                    `:y}
                                    ${e.image?E`
                                            <img src="${e.image}" alt="${e.label}" style="width: 2rem;" />
                                        `:y}
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
                    `}return E`
                    <vaadin-custom-field
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${C(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(e=>E`
                            <vaadin-item>${e.description||e.image||e.icon?E`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${e.icon?E`
                                        <vaadin-icon icon="${e.icon}"></vaadin-icon>
                                    `:y}
                                    ${e.image?E`
                                            <img src="${e.image}" alt="${e.label}" style="width: 2rem;" />
                                        `:y}
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
                `}if(this.field?.stereotype==`radio`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),E`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${n}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            theme="horizontal"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||y}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.data[this.id]?.content?.map(e=>E`
                            <vaadin-radio-button value="${e.value}" label="${e.label}" ?checked="${e&&t&&e.value===t}">
                                ${e.description||e.image||e.icon?E`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${e.icon?E`
                                                <vaadin-icon icon="${e.icon}"></vaadin-icon>
                                            `:y}
                                            ${e.image?E`
                                                <img src="${e.image}" alt="${e.label}" style="height: 1rem;" />
                                            `:y}
                                            <span>${e.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${e.description?E`
                                            <div>${e.description}</div>
                                        `:y}
                                    </label>
                                `:y}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `}return E`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${n}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||y}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(e=>E`
                            <vaadin-radio-button value="${e.value}" label="${e.label}">
                                ${e.description||e.image||e.icon?E`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${e.icon?E`
                                                <vaadin-icon icon="${e.icon}"></vaadin-icon>
                                            `:y}
                                            ${e.image?E`
                                                <img src="${e.image}" alt="${e.label}" style="height: 1rem;" />
                                            `:y}
                                            <span>${e.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${e.description?E`
                                            <div>${e.description}</div>
                                        `:y}
                                    </label>
                                `:y}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `}if(this.field.stereotype==`popover`)return E`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            required="${this.field.required||y}"
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
                            ${h(()=>E`
                                <mateu-event-interceptor .target="${this}">
                                <mateu-choice
                                        .field="${this.field}"
                                        .value="${t}"
                                ></mateu-choice>
                                </mateu-event-interceptor>
                            `,[])}
                    ></vaadin-popover>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`choice`)return E`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            required="${this.field.required||y}"
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
                    `;if(this.field?.stereotype==`richText`)return E`
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
                    </vaadin-custom-field>`;if(this.field?.stereotype==`textarea`)return E`
                    <vaadin-text-area
                            id="${this.field.fieldId}"
                            label="${n}"
                            .maxlength="${this.field.charLimit}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||y}"
                            data-colspan="${this.field.colspan}"
                            rows="4"
                            style="width: 100%;"
                    ></vaadin-text-area>`;if(this.field?.stereotype==`email`)return E`
                    <vaadin-email-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||y}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-email-field>
                `;if(this.field?.stereotype==`link`)return this.field.readOnly?E`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><a href="${t}">${t}</a></vaadin-custom-field>`:E`
                            <vaadin-text-field
                                    id="${this.field.fieldId}"
                                    label="${n}"
                                    required="${this.field.required||y}"
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
                `;if(this.field?.stereotype==`icon`)return this.field.readOnly?E`<vaadin-icon
                                             icon="${t}"
                                             data-colspan="${this.field.colspan}"
                    ></vaadin-icon>`:E`
                    <vaadin-combo-box
                                    id="${this.field.fieldId}"
                                    label="${n}"
                                    required="${this.field.required||y}"
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
                        ${t?E`<vaadin-icon slot="prefix" icon="${t}"></vaadin-icon>`:y}
                    </vaadin-combo-box>
                `;if(this.field?.stereotype==`password`)return E`
                    <vaadin-password-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||y}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-password-field>
                `;if(this.field?.stereotype==`html`)return E`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${v(``+t)}</div></vaadin-custom-field>
                `;if(this.field?.stereotype==`image`)return E`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><img
                            src="${t}"
                            style="${this.component?.style}" class="${this.component?.cssClasses}"></vaadin-custom-field>
                `;if(this.field?.stereotype==`treeSelect`){let e=this.helperText();return E`
                    <div class="tree-field" id="${this.field.fieldId}" data-colspan="${this.field.colspan}">
                        ${n?E`
                            <span class="tree-field__label">${n}${this.field.required?E`<span class="tree-field__required"> •</span>`:y}</span>`:y}
                        <mateu-vaadin-tree-select
                                style="width: 100%;"
                                .fieldId="${this.field.fieldId}"
                                .value="${t}"
                                .options="${this.field.options??[]}"
                                .leavesOnly="${this.field.treeLeavesOnly??!1}"
                        ></mateu-vaadin-tree-select>
                        ${e?E`<span class="tree-field__helper">${e}</span>`:y}
                    </div>
                `}if(this.field?.stereotype==`signature`)return E`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-signature-pad .fieldId="${this.field.fieldId}" .value="${t}"></mateu-signature-pad>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`camera`)return E`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-camera-capture .fieldId="${this.field.fieldId}" .value="${t}"></mateu-camera-capture>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`fileUpload`){let e=ol(this.field.attributes,`accept`);return E`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-file-upload .fieldId="${this.field.fieldId}" .value="${t}" .accept="${e}"></mateu-file-upload>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype==`uploadableImage`){let e=t!=null&&t!==``;return E`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-vertical-layout style="align-items: stretch; gap: var(--lumo-space-s); max-width: 320px;">
                            ${e?E`<img
                                    src="${t}"
                                    style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--lumo-contrast-20pct); border-radius: var(--lumo-border-radius-m); ${this.field.style??``}"
                                    class="${this.component?.cssClasses}">`:E`<div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--lumo-contrast-30pct); border-radius: var(--lumo-border-radius-m); color: var(--lumo-secondary-text-color);">
                                    <vaadin-icon icon="vaadin:picture" style="height: 2rem; width: 2rem;"></vaadin-icon>
                                </div>`}
                            <input type="file" accept="image/*" style="display: none;" @change="${this.imageUpload}">
                            <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-start;">
                                <vaadin-button @click="${this.triggerImageUpload}">
                                    <vaadin-icon icon="vaadin:upload" slot="prefix"></vaadin-icon>
                                    ${e?`Replace`:`Upload`}
                                </vaadin-button>
                                ${e?E`<vaadin-button theme="error tertiary" @click="${this.imageDelete}">
                                    <vaadin-icon icon="vaadin:trash" slot="prefix"></vaadin-icon>
                                    Delete
                                </vaadin-button>`:y}
                            </vaadin-horizontal-layout>
                        </vaadin-vertical-layout>
                    </vaadin-custom-field>
                `}return this.field?.stereotype==`color`?this.field.readOnly?E`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><span style="background-color: ${t}; display: block; height: 20px; width: 40px; margin-top: 5px; margin-bottom: 24px; border: 1px solid var(--lumo-secondary-text-color)"></vaadin-custom-field>
                `:E`
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
                `:E`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||y}"
                        ?disabled="${this.field.disabled}"
                        data-colspan="${this.field.colspan}"
                        style="${this.field.style}"
                ></vaadin-text-field>
`}renderNumberField(e,t,n,r){return this.field?E`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||y}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||y}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min==null?y:this.field.min}"
                        max="${this.field.max==null?y:this.field.max}"
            ></vaadin-number-field>`:E``}renderIntegerField(e,t,n,r){if(!this.field)return E``;if(this.field.stereotype==`stars`){let e=t;return isNaN(e)&&(e=0),E`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >${[1,2,3,4,5].map(t=>E`
                    <vaadin-icon 
                            icon="vaadin:star" 
                            style="cursor: pointer; color: var(${t<=e?`--lumo-warning-color`:`--lumo-shade-30pct`});"
                            @click="${()=>this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}"
                    
                    ></vaadin-icon>
                `)}</vaadin-custom-field>`}if(this.field.stereotype==`slider`){let e=t;return isNaN(e)&&(e=0),E`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><input type="range" @input="${e=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}" min="${this.field.sliderMin??0}" max="${this.field.sliderMax??10}" value="${e??0}"/></vaadin-custom-field>
                `}return E`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||y}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||y}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min==null?y:this.field.min}"
                        max="${this.field.max==null?y:this.field.max}"
                ></vaadin-integer-field>
            `}renderBoolField(e,t,n,r){return this.field?this.field.stereotype==`toggle`?E`
                    <vaadin-custom-field
                            label="${n}"
                            .helperText="${this.helperText()}"
                            ?required="${this.field.required||y}"
                            data-colspan="${this.field.colspan}"
                    >
                        <paper-toggle-button id="${this.field.fieldId}"
                                             ?disabled=${this.field.disabled}
                                             ?checked=${t}
                                             @change=${this.checked}>
                        </paper-toggle-button>
                    </vaadin-custom-field>
                `:E`
                <vaadin-checkbox
                        id="${this.field.fieldId}"
                        label="${n}"
                        .helperText="${this.helperText()}"
                        ?required="${this.field.required||y}"
                        data-colspan="${this.field.colspan}"
                        @change="${this.checked}"
                        value="${t}"
                        ?checked=${t}
                        ?autofocus="${this.field.wantsFocus}"
                ></vaadin-checkbox>
            `:E``}renderDateRangeField(e,t,n,r){if(!this.field)return E``;let i=t?t.from+`;`+t.to:void 0;return E`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${n}"
                    @value-changed="${e=>{e.detail.value&&(e.detail.value={from:e.detail.value.split(`;`)[0],to:e.detail.value.split(`;`)[1]}),this.valueChanged(e)}}"
                    value="${i}"
                    .helperText="${this.helperText()}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||y}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,n,r){return this.field?E`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||y}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:E``}renderDateTimeField(e,t,n,r){return this.field?E`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||y}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:E``}renderTimeField(e,t,n,r){return this.field?E`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||y}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:E``}renderArrayField(e,t,n,r){if(!this.field)return E``;if(this.field?.stereotype==`choice`)return E`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            required="${this.field.required||y}"
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
                    `;if(this.field?.stereotype==`grid`)return E`
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
`;if(this.field?.stereotype==`listBox`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),E`
                        <vaadin-custom-field
                                label="${n}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box multiple
                                     .selectedValues="${C(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                            id="${this.field.fieldId}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map(e=>E`
                            <vaadin-item>${e.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                        </vaadin-custom-field>
                    `}return E`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box multiple
                                     .selectedValues="${C(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                                     data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(e=>E`
                            <vaadin-item>${e.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype==`combobox`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return E`
                        <vaadin-multi-select-combo-box
                            label="${n}"
                            item-label-path="label"
                            item-id-path="value"
                            item-value-path="value"
                            .dataProvider="${this.remoteComboDataProvider(e.action)}"
                            .helperText="${this.helperText()}"
                            .selectedItems="${this.selectedItems(t)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||y}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            auto-expand-horizontally
                            auto-expand-vertically
                            xselected-items-on-top
                    ></vaadin-multi-select-combo-box>
                    `}return E`
                    <vaadin-multi-select-combo-box
                            label="${n}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            .selectedItems="${this.selectedItems(t)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||y}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            auto-expand-horizontally
                            auto-expand-vertically
                            xselected-items-on-top
                    ></vaadin-multi-select-combo-box>
                    `}if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.rendered||setTimeout(()=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}),E`
                    <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${n}"
                        theme="vertical"
                        @value-changed="${this.valueChanged}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||y}"
                        data-colspan="${this.field.colspan}"
                        .value="${t}"
                        class="mateu-checkbox-group-${this.field.optionsColumns>1?`multi-column`:``}"
                >
                        ${this.data[this.id]?.content?.map(e=>E`
                            <vaadin-checkbox
                                    value="${e.value}"
                                    label="${e.label}"
                            ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
                    `}return E`
                <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        theme="vertical"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||y}"
                        data-colspan="${this.field.colspan}"
                        class="mateu-checkbox-group-${this.field.optionsColumns>1?`multi-column`:``}"
                        .value="${t}"
                >
                        ${this.field.options?.map(e=>E`
                        <vaadin-checkbox 
                                value="${e.value}" 
                                label="${e.label}"
                        ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
            `}renderMoneyField(e,t,n,r){if(!this.field)return E``;if(this.field.readOnly){let e=t,r=e;return r=e&&e.locale&&e.currency?new Intl.NumberFormat(e.locale,{style:`currency`,currency:e.currency}).format(e.value):new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(e),E`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><div style="width: 186px; text-align: right;">${r}</div></vaadin-custom-field>`}return E`<mateu-money-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        .value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||y}"
                        data-colspan="${this.field.colspan}"
            ></mateu-money-field>`}renderStatusField(e,t,n,r){if(!this.field)return E``;let i=t;return E`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        required="${this.field.required||y}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    ${i?E`<span theme="badge pill ${Ma(i.type)}">${i.message}</span>`:E``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,n,r){if(!this.field)return E``;this.loadUi5FieldComponents();let i=t;return E`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${i?.from??0}" end-value="${i?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${this.field.sliderMax??10}"
                                   step="${this.field.step||y}"
                                   @change="${e=>{let t=e.target;this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:{from:t.startValue,to:t.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}static{this.styles=g`
        ${ue}

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
  `}};A([w()],Q.prototype,`ui5FieldComponentsReady`,void 0),A([b()],Q.prototype,`component`,void 0),A([b()],Q.prototype,`field`,void 0),A([b()],Q.prototype,`baseUrl`,void 0),A([b()],Q.prototype,`state`,void 0),A([b()],Q.prototype,`data`,void 0),A([b()],Q.prototype,`appState`,void 0),A([b()],Q.prototype,`appData`,void 0),A([b()],Q.prototype,`labelAlreadyRendered`,void 0),A([w()],Q.prototype,`colorPickerOpened`,void 0),A([w()],Q.prototype,`colorPickerValue`,void 0),A([w()],Q.prototype,`controlOwnsValidity`,void 0),A([w()],Q.prototype,`filteredIcons`,void 0),A([w()],Q.prototype,`navLinkOffset`,void 0),Q=A([_(`mateu-field`)],Q);var eu=(e,t,n,r,i,a,o,s)=>{let c=t.metadata;return E`
        <mateu-field
                id="${t.id}"
                .component="${t}"
                .field="${t.metadata}"
                .state="${r}"
                .data="${i}"
                .appState="${a}"
                .appdata="${o}"
                style="${Ea(t,i)}" class="${t.cssClasses}"
                slot="${t.slot??y}"
                data-colspan="${c.colspan}"
                colspan="${(c.colspan??1)>1?c.colspan:y}"
                .labelAlreadyRendered="${s}"
        >
            ${t.children?.map(t=>F(e,t,n,r,i,a,o,s))}
        </mateu-field>
    `},tu=(e,n,r,i,a,o,s)=>{let c=n.metadata;if(c.tree)return E`
        <vaadin-grid style="${n.style}" class="${n.cssClasses}"
                     .itemHasChildrenPath="${`children`}" .dataProvider="${async(e,t)=>{let n=e.parentItem?e.parentItem.children:c.page.content;t(n,n.length)}}"
                     slot="${n.slot??y}"
                     all-rows-visible
        >
            ${c.content.map((n,c)=>{let l=n.metadata;return c>0?E`
            <vaadin-grid-column path="${n.id}"
                                header="${l?.label??y}"
                                ?auto-width="${l?.autoWidth}"
                                flex-grow="${l?.flexGrow??y}"
                                width="${l?.width??y}"
                                .column="${n.metadata}"
                                ${t((t,n,c)=>Wl(t,n,c,l,e,r,i,a,o,s),[])}></vaadin-grid-column>
`:E`
            <vaadin-grid-tree-column path="${n.id}"
                                header="${l?.label??y}"
                                ?auto-width="${l?.autoWidth}"
                                flex-grow="${l?.flexGrow??y}"
                                width="${l?.width??y}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${zt()}</span>
        </vaadin-grid>
    `;let l=c.page?.content;return n.id&&i&&i[n.id]&&(l=i[n.id]),l||=[],E`
        <vaadin-grid 
                style="${n.style}" 
                class="${n.cssClasses}" 
                .items="${l}"
                all-rows-visible
        >
            ${c?.content?.map(t=>Hl(t,e,r,i,a,o,s))}
        </vaadin-grid>
    `},$=class extends x{constructor(...e){super(...e),this.id=``,this.baseUrl=``,this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this._lastGridHeight=0,this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{let n=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let r=!1;n&&n.content&&(n.content.length>=(e.page+1)*e.pageSize||n.content.length==n.totalElements)&&(t(n.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),n.totalElements),r=!0,this.grid&&this.grid.recalculateColumnWidths()),r||this.pagesRequested.find(t=>t==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent(`fetch-more-elements`,{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{let e=this.metadata?.infiniteScrolling?n?.totalElements:n?.content?.length??0;t(n?.content??[],e),this.grid&&this.grid.recalculateColumnWidths()}},this._onActionRequested=e=>{let t=e.detail,n=this.identifierFieldName;if(!n||!t.parameters||t.actionId?.startsWith(`action-on-row-`))return;let r=t.parameters[n];r!==void 0&&(this.state._selectedId=String(r),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t=``,{column:n,item:r}=e,i=this.metadata?.columns?.find(e=>e.metadata.id==n?.path);if(i?.metadata){let e=(i?.metadata).tooltipPath;e&&n&&r&&(t=r[e])}return t}}get identifierFieldName(){let e=this.metadata?.columns?.find(e=>e.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(e=>e.metadata?.id===`id`))return`id`}_applyCellPartNameGenerator(){if(!this.grid)return;let e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId,n=!!this.metadata?.groupBy;e&&t!==void 0||n?this.grid.cellPartNameGenerator=(n,r)=>{let i=r.item;return dl(i)?`mateu-group-row`:e&&t!==void 0&&String(i[e])===String(t)?`selected-row`:``}:this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener(`action-requested`,this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`action-requested`,this._onActionRequested),this._resizeObserver?.disconnect(),this._resizeObserver=void 0}firstUpdated(){let e=this.grid;!e||this._resizeObserver||(this._resizeObserver=new ResizeObserver(()=>{let t=e.offsetHeight;t>0&&this._lastGridHeight===0&&requestAnimationFrame(()=>{e.recalculateColumnWidths(),e.requestContentUpdate(),e.notifyResize?.()}),this._lastGridHeight=t}),this._resizeObserver.observe(e))}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.requestContentUpdate(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}render(){let e=this.data[this.id],r=e?.page,i=this.metadata?.groupBy,a=this.metadata?.infiniteScrolling?void 0:r?.content?pl(r.content,i,e?.groups):r?.content,o=_l((this.metadata?.columns??[]).flatMap(e=>e.metadata?.type===M.GridGroupColumn?(e.metadata.columns??[]).map(e=>e.metadata):[e.metadata]),e,i),s=``;return this.metadata?.wrapCellContent&&(s+=` wrap-cell-content`),this.metadata?.compact&&(s+=` compact`),this.metadata?.noBorder&&(s+=` no-border`),this.metadata?.noRowBorder&&(s+=` no-row-borders`),this.metadata?.columnBorders&&(s+=` column-borders`),this.metadata?.rowStripes&&(s+=` row-stripes`),E`
            <vaadin-grid
                    .items="${a}"
                    item-id-path="_rowNumber"
                    .selectedItems="${this.state[this.id+`_selected_items`]||[]}"
                    ?data-clickable-rows="${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?`lazy`:y}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.metadata?.infiniteScrolling?this.dataProvider:void 0}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    @selected-items-changed="${e=>{let t=(e.detail.value??[]).filter(e=>!dl(e));this.emptyArray(this.state[this.id+`_selected_items`])&&this.emptyArray(t)||(this.state[this.id+`_selected_items`]=t,this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0})))}}"
                    @active-item-changed="${C(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?e=>{if(this.metadata?.detailPath){let t=e.detail.value;if(t&&dl(t))return;t?this.detailsOpenedItems=[t]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${C(this.metadata?.detailPath?n(e=>E`${F(this,e[this.metadata?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    theme="${s}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?E`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:y}
                ${this.metadata?.columns?.map(e=>Hl(e,this,this.baseUrl,this.state,this.data,this.appState,this.appData,o))}
                ${this.metadata?.useButtonForDetail?E`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${t((e,{detailsOpened:t})=>E`
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
                `:y}
                <span slot="empty-state">${zt(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(e=>e.metadata.tooltipPath)?E`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:y}
            </vaadin-grid>
            <slot></slot>
       `}static{this.styles=g`
        ${ue}
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
  `}};A([b()],$.prototype,`id`,void 0),A([b()],$.prototype,`metadata`,void 0),A([b()],$.prototype,`baseUrl`,void 0),A([b()],$.prototype,`state`,void 0),A([b()],$.prototype,`data`,void 0),A([b()],$.prototype,`appState`,void 0),A([b()],$.prototype,`appData`,void 0),A([b()],$.prototype,`emptyStateMessage`,void 0),A([w()],$.prototype,`detailsOpenedItems`,void 0),A([S(`vaadin-grid`)],$.prototype,`grid`,void 0),$=A([_(`mateu-table`)],$);var nu=(e,t,n,r,i,a,o)=>E`
    <mateu-table
            id="${t.id}"
            baseUrl="${n}"
            .metadata="${t.metadata}"
            .state="${r}"
            .data="${i}"
            .appState="${a}"
            .appDate="${o}"
            style="${t.style}" class="${t.cssClasses}"
            slot="${t.slot??y}"
    >
        ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
    </mateu-table>`,ru=(e,t,n,r,i,a)=>E`
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
    ></mateu-table>`,iu=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`
        <div id="show-notifications" slot="${t.slot??y}">${F(e,s.wrapped,n,r,i,a,o)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                ${h(()=>E`${F(e,s.content,n,r,i,a,o)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},au=(e,t,n)=>{let r=e;return E`
        <vaadin-button
                data-action-id="${r.id}"
                theme="${Mt(e)||y}"
                @click="${n}"
                ?disabled="${r.disabled}"
        >${r.iconOnLeft?E`<vaadin-icon icon="${r.iconOnLeft}"></vaadin-icon>`:y}${t}${r.iconOnRight?E`<vaadin-icon icon="${r.iconOnRight}"></vaadin-icon>`:y}</vaadin-button>
    `},ou=e=>E`
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
    </div>`,su={"vaadin:wifi":`vaadin:connect`,"vaadin:pen":`vaadin:pencil`,"vaadin:automation":`vaadin:cogs`},cu=(e,t,n)=>E`<vaadin-icon icon="${su[e]??e}" style="${t??y}" class="${n??y}"></vaadin-icon>`,lu=(e,t,n)=>{let r=e.metadata,i=N(r.label,t,n),a=``;return r.buttonStyle&&(a+=` `+r.buttonStyle),r.color&&r.color!==`none`&&r.color!==`normal`&&(a+=` `+r.color),r.size&&r.size!==`none`&&r.size!==`normal`&&(a+=` `+r.size),E`<vaadin-button
            id="${e.id}"
            data-action-id="${r.actionId}"
            @click="${e=>sr(e,r)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${a}"
            ?disabled="${r.disabled}"
            title="${r.shortcut?`${i} (${or(r.shortcut)})`:y}"
            slot="${e.slot??y}"
    >${r.iconOnLeft?E`<vaadin-icon icon="${r.iconOnLeft}"></vaadin-icon>`:y}${i}${r.iconOnRight?E`<vaadin-icon icon="${r.iconOnRight}"></vaadin-icon>`:y}</vaadin-button>`},uu=e=>{let t=e.metadata;return E`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??y}"
                @submit="${e=>{let n=e.detail?.value??``;!t.actionId||!n.trim()||e.currentTarget.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:{message:n}},bubbles:!0,composed:!0}))}}"
        ></vaadin-message-input>
    `},du=e=>{let t=(e.metadata.items??[]).map(e=>({text:e.text,time:e.time,userName:e.userName,userImg:e.userImg,userAbbr:e.userAbbr,userColorIndex:e.userColorIndex}));return E`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??y}"
                .items="${t}"
        ></vaadin-message-list>
    `},fu=(e,t)=>{e&&e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t},bubbles:!0,composed:!0}))},pu=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=!1;if(s.openedCondition)try{c=xt(s.openedCondition,r,i,a,o)}catch(e){console.error(`when evaluating `+s.openedCondition+` :`+e+`, where data is `+i+` and state is `+r)}return E`
        <vaadin-confirm-dialog
                header="${s.header}"
                ?cancel-button-visible="${s.canCancel}"
                ?reject-button-visible="${s.canReject}"
                reject-text="${s.rejectText}"
                confirm-text="${s.confirmText}"
                .opened="${c}"
                @confirm="${e=>fu(e.currentTarget,s.confirmActionId)}"
                @reject="${e=>fu(e.currentTarget,s.rejectActionId)}"
                @cancel="${e=>fu(e.currentTarget,s.cancelActionId)}"
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??y}"
        >
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </vaadin-confirm-dialog>
    `},mu=class extends x{constructor(...e){super(...e),this.panels=[],this.headerTitle=``,this.badges=[],this.navigation=null,this.overviewEditActionId=``,this._raf=0,this._snapping=!1,this._less=!1,this._more=!1,this._onScroll=()=>{this._raf||=requestAnimationFrame(()=>{this._raf=0,this._syncPin()})},this._onScrollEnd=()=>{this._snapping||this._snapToNearest()},this._fit=()=>{let e=this.getBoundingClientRect().top;this.style.setProperty(`--mateu-foldout-fill`,`${Math.max(240,window.innerHeight-e)}px`),this._syncPin()},this._onKeydown=e=>{if(e.key!==`ArrowRight`&&e.key!==`ArrowLeft`||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||this._isEditingContext())return;let t=this._rail;!t||t.scrollWidth<=t.clientWidth||(e.preventDefault(),this._step(e.key===`ArrowRight`?1:-1))}}navAction(e){e&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}_stride(){let e=this.renderRoot.querySelectorAll(`.section`);return e.length>1?e[1].offsetLeft:this._rail?.clientWidth??0}_boundaries(){let e=this._rail;if(!e)return[];let t=e.scrollWidth-e.clientWidth,n=[...this.renderRoot.querySelectorAll(`.section`)].map(e=>Math.max(0,Math.min(e.offsetLeft,t)));return[...new Set(n)]}_snapToNearest(){let e=this._rail;if(!e)return;let t=this._boundaries();if(!t.length)return;let n=t.reduce((t,n)=>Math.abs(n-e.scrollLeft)<Math.abs(t-e.scrollLeft)?n:t);Math.abs(n-e.scrollLeft)<1||(this._snapping=!0,e.scrollTo({left:n,behavior:`smooth`}),window.setTimeout(()=>{this._snapping=!1},400))}_syncPin(){let e=this._rail,t=this._first;if(!e||!t)return;let n=this._stride(),r=Math.min(e.scrollLeft,n);t.style.transform=r?`translateX(${r}px)`:``,t.classList.toggle(`floating`,e.scrollLeft>0);let i=e.scrollWidth-e.clientWidth,a=i>32;this._less=a&&e.scrollLeft>2,this._more=a&&e.scrollLeft<i-2}_step(e){let t=this._rail;if(!t)return;let n=this._boundaries();if(!n.length)return;let r=n.reduce((e,r,i)=>Math.abs(r-t.scrollLeft)<Math.abs(n[e]-t.scrollLeft)?i:e,0),i=n[Math.max(0,Math.min(r+e,n.length-1))];this._snapping=!0,t.scrollTo({left:i,behavior:`smooth`}),window.setTimeout(()=>{this._snapping=!1},400)}_isEditingContext(){let e=document.activeElement;for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;if(!e)return!1;let t=e.tagName;return t===`INPUT`||t===`TEXTAREA`||t===`SELECT`||e.isContentEditable}_sectionFlex(e,t){if(!e.width)return y;let n=parseFloat(e.width)||1;return t===this.panels.length-1&&n<22?`flex: 22 1 var(--mateu-foldout-overview-width, 22rem);`:`flex: ${n} 1 ${e.width};`}firstUpdated(){this._fit(),this._resizeObserver=new ResizeObserver(()=>this._syncPin()),this._rail&&this._resizeObserver.observe(this._rail);for(let e of this.renderRoot.querySelectorAll(`.section`))this._resizeObserver.observe(e)}connectedCallback(){super.connectedCallback(),document.addEventListener(`keydown`,this._onKeydown),window.addEventListener(`resize`,this._fit)}disconnectedCallback(){document.removeEventListener(`keydown`,this._onKeydown),window.removeEventListener(`resize`,this._fit),this._resizeObserver?.disconnect(),this._resizeObserver=void 0,this._raf&&=(cancelAnimationFrame(this._raf),0),super.disconnectedCallback()}static{this.styles=g`
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
    `}render(){let e=this.navigation,t=!!(this.overviewEditActionId||e&&(e.parentActionId||e.previousActionId||e.nextActionId)),n=!!(this.headerTitle||t||this.badges.length);return E`
            <div class="rail" part="rail" tabindex="0"
                 @scroll="${this._onScroll}" @scrollend="${this._onScrollEnd}">
                <section class="section section--first" part="section overview">
                    ${n?E`
                        <header class="section-head" part="section-head">
                            <div class="section-head-row">
                                ${this.headerTitle?E`<h2 class="section-title">${this.headerTitle}</h2>`:E`<span></span>`}
                                ${t?E`
                                    <div class="section-toolbar" part="section-toolbar">
                                        ${e?.parentActionId?E`
                                            <button class="tb-parent" title="${e.parentLabel??`Back`}"
                                                    @click="${()=>this.navAction(e.parentActionId)}">
                                                <span>‹</span><span>${e.parentLabel??`Back`}</span>
                                            </button>
                                        `:y}
                                        ${e?.previousActionId?E`
                                            <button class="tb-move" title="Previous"
                                                    @click="${()=>this.navAction(e.previousActionId)}">‹</button>
                                        `:y}
                                        ${e?.nextActionId?E`
                                            <button class="tb-move" title="Next"
                                                    @click="${()=>this.navAction(e.nextActionId)}">›</button>
                                        `:y}
                                        ${this.overviewEditActionId?E`
                                            <button class="tb-edit" title="Edit"
                                                    @click="${()=>this.navAction(this.overviewEditActionId)}">
                                                <span>✎</span><span>Edit</span>
                                            </button>
                                        `:y}
                                    </div>
                                `:y}
                            </div>
                            ${this.badges.length?E`
                                <div class="section-badges">
                                    ${this.badges.map(e=>E`<span class="section-badge">${e}</span>`)}
                                </div>
                            `:y}
                        </header>
                    `:y}
                    <div class="overview-body">
                        <slot name="overview"></slot>
                    </div>
                </section>
                ${this.panels.map((e,t)=>E`
                    <section class="section" part="section panel"
                             style="${this._sectionFlex(e,t)}">
                        ${e.title||e.subtitle?E`
                            <div class="panel-header">
                                ${e.title?E`<h3>${e.title}${e.subtitle?E` <span class="subtitle" style="font-weight: 400;">· ${e.subtitle}</span>`:y}</h3>`:y}
                                ${!e.title&&e.subtitle?E`<div class="subtitle">${e.subtitle}</div>`:y}
                            </div>
                        `:y}
                        <div class="panel-body">
                            <slot name="panel-${t}"></slot>
                        </div>
                    </section>
                `)}
            </div>
            ${this._less?E`
                <button class="scroll-nav left" part="scroll-nav-left" title="Scroll left"
                        aria-label="Scroll left" @click="${()=>this._step(-1)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 6 9 12 15 18"></polyline>
                    </svg>
                </button>
            `:y}
            ${this._more?E`
                <button class="scroll-nav right" part="scroll-nav-right" title="Scroll right"
                        aria-label="Scroll right" @click="${()=>this._step(1)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 6 15 12 9 18"></polyline>
                    </svg>
                </button>
            `:y}
        `}};A([b({type:Array})],mu.prototype,`panels`,void 0),A([b({type:String})],mu.prototype,`headerTitle`,void 0),A([b({type:Array})],mu.prototype,`badges`,void 0),A([b({attribute:!1})],mu.prototype,`navigation`,void 0),A([b({type:String})],mu.prototype,`overviewEditActionId`,void 0),A([S(`.rail`)],mu.prototype,`_rail`,void 0),A([S(`.section--first`)],mu.prototype,`_first`,void 0),A([w()],mu.prototype,`_less`,void 0),A([w()],mu.prototype,`_more`,void 0),mu=A([_(`mateu-vaadin-foldout`)],mu);var hu=(e,t,n,r,i,a,o)=>{let s=t.metadata;return E`
        <mateu-vaadin-foldout
                .panels="${s.panels??[]}"
                .headerTitle="${s.headerTitle??``}"
                .badges="${s.badges??[]}"
                .navigation="${s.navigation??null}"
                overviewEditActionId="${s.overviewEditActionId??``}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??y}"
        >
            ${t.children?.map(t=>F(e,t,n,r,i,a,o))}
        </mateu-vaadin-foldout>
    `},gu=class extends x{constructor(...e){super(...e),this.rows=[],this.columns=[],this.navigable=!1,this.expandedItems=[],this._normalized=[],this.dataProvider=(e,t)=>{let n=e.parentItem?e.parentItem.children??[]:this.normalized;t(n,n.length)}}get normalized(){return this._src!==this.rows&&(this._src=this.rows,this._normalized=this.normalizeRows(this.rows??[])),this._normalized}normalizeRows(e){return(e??[]).map(e=>{let t=Array.isArray(e.children)&&e.children.length?this.normalizeRows(e.children):void 0;return{...e,children:t}})}collectGroups(e,t=[]){return e.forEach(e=>{e.children&&e.children.length&&(t.push(e),this.collectGroups(e.children,t))}),t}willUpdate(){this._expandedSrc!==this.rows&&(this._expandedSrc=this.rows,this.expandedItems=this.collectGroups(this.normalized))}updated(e){e.has(`rows`)&&this._grid?.clearCache?.()}dispatch(e,t){this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}render(){let e=this.columns??[],n=e[0],r=e.slice(1);return E`
            <vaadin-grid
                    theme="compact no-row-borders"
                    all-rows-visible
                    .dataProvider="${this.dataProvider}"
                    .itemHasChildrenPath="${`children`}"
                    .expandedItems="${this.expandedItems}"
                    @expanded-items-changed="${e=>{this.expandedItems=e.detail.value}}">
                ${n?E`
                    <vaadin-grid-tree-column path="${n.id}" header="${n.label??``}"
                                             auto-width flex-grow="0"></vaadin-grid-tree-column>
                `:y}
                ${r.map(e=>e.id===`select`?E`<vaadin-grid-column header="${e.label??``}" auto-width flex-grow="0" text-align="end"
                              ${t(e=>E`<vaadin-button theme="tertiary small"
                                          @click="${()=>this.dispatch(`action-on-row-select`,{_clickedRow:e})}">Select</vaadin-button>`,[])}></vaadin-grid-column>`:E`<vaadin-grid-column path="${e.id}" header="${e.label??``}"></vaadin-grid-column>`)}
                ${this.navigable?E`
                    <vaadin-grid-column auto-width flex-grow="0" text-align="end"
                          ${t(e=>e?.viewable===!1?E``:E`<vaadin-button theme="tertiary small"
                                          @click="${()=>this.dispatch(`view`,e)}">View</vaadin-button>`,[])}></vaadin-grid-column>
                `:y}
            </vaadin-grid>
        `}static{this.styles=g`
        :host {
            display: block;
            width: 100%;
        }
        vaadin-grid {
            max-height: min(60vh, 32rem);
            min-width: 22rem;
        }
    `}};A([b({attribute:!1})],gu.prototype,`rows`,void 0),A([b({attribute:!1})],gu.prototype,`columns`,void 0),A([b()],gu.prototype,`idField`,void 0),A([b({type:Boolean})],gu.prototype,`navigable`,void 0),A([b()],gu.prototype,`selectedId`,void 0),A([w()],gu.prototype,`expandedItems`,void 0),A([S(`vaadin-grid`)],gu.prototype,`_grid`,void 0),gu=A([_(`mateu-vaadin-tree`)],gu);var _u={[M.VirtualList]:(e,t,n,r,i,a,o)=>Ec(e,t,n,r,i,a,o),[M.Notification]:(e,t)=>Dc(t),[M.ProgressBar]:(e,t,n,r)=>Oc(t,r),[M.Details]:(e,t,n,r,i,a,o)=>kc(e,t,n,r,i,a,o),[M.Avatar]:(e,t,n,r,i)=>Ac(t,r,i),[M.AvatarGroup]:(e,t)=>jc(t),[M.Card]:(e,t,n,r,i,a,o)=>Mc(e,t,n,r,i,a,o),[M.Button]:(e,t,n,r,i)=>lu(t,r,i),[M.MessageInput]:(e,t)=>uu(t),[M.MessageList]:(e,t)=>du(t),[M.ConfirmDialog]:(e,t,n,r,i,a,o)=>pu(e,t,n,r,i,a,o),[M.FormLayout]:(e,t,n,r,i,a,o)=>Fc(e,t,n,r,i,a,o),[M.HorizontalLayout]:(e,t,n,r,i,a,o)=>zc(e,t,n,r,i,a,o),[M.VerticalLayout]:(e,t,n,r,i,a,o)=>Bc(e,t,n,r,i,a,o),[M.SplitLayout]:(e,t,n,r,i,a,o)=>Vc(e,t,n,r,i,a,o),[M.MasterDetailLayout]:(e,t,n,r,i,a,o)=>Hc(e,t,n,r,i,a,o),[M.TabLayout]:(e,t,n,r,i,a,o)=>Uc(e,t,n,r,i,a,o),[M.AccordionLayout]:(e,t,n,r,i,a,o)=>Gc(e,t,n,r,i,a,o),[M.BoardLayout]:(e,t,n,r,i,a,o)=>Jc(e,t,n,r,i,a,o),[M.BoardLayoutRow]:(e,t,n,r,i,a,o)=>Yc(e,t,n,r,i,a,o),[M.BoardLayoutItem]:(e,t,n,r,i,a,o)=>Xc(e,t,n,r,i,a,o),[M.Scroller]:(e,t,n,r,i,a,o)=>qc(e,t,n,r,i,a,o),[M.MenuBar]:(e,t,n,r,i)=>$c(e,t,n,r,i),[M.ContextMenu]:(e,t,n,r,i,a,o)=>Qc(e,t,n,r,i,a,o),[M.FormField]:(e,t,n,r,i,a,o,s)=>eu(e,t,n,r,i,a,o,s),[M.Grid]:(e,t,n,r,i,a,o)=>tu(e,t,n,r,i,a,o),[M.Table]:(e,t,n,r,i,a,o)=>nu(e,t,n,r,i,a,o),[M.Popover]:(e,t,n,r,i,a,o)=>iu(e,t,n,r,i,a,o),[M.FoldoutLayout]:(e,t,n,r,i,a,o)=>hu(e,t,n,r,i,a,o)},vu=class extends Tc{rendererName(){return`vaadin`}renderClientSideComponent(e,t,n,r,i,a,o,s){let c=t?.metadata?.type,l=c?_u[c]:void 0;return l&&t?l(e,t,n,r,i,a,o,s):super.renderClientSideComponent(e,t,n,r,i,a,o,s)}renderTableComponent(e,t,n,r,i,a,o){return ru(e,t,n,r,a,o)}renderTreeComponent(e,t){return E`
            <mateu-vaadin-tree
                    .rows="${t.rows}"
                    .columns="${t.columns}"
                    .idField="${t.idField}"
                    .navigable="${t.navigable}"
                    .selectedId="${t.selectedId}"
            ></mateu-vaadin-tree>`}renderToolbarButton(e,t,n){return au(e,t,n)}renderPeerNav(e){return ou(e)}renderIcon(e,t,n){return cu(e,t,n)}renderTopNav(e,t,n){return Zc(e,t,n)}};function yu(e){switch(e){case`topStretch`:return`top-stretch`;case`topStart`:return`top-start`;case`topCenter`:return`top-center`;case`topEnd`:return`top-end`;case`middle`:return`middle`;case`bottomStart`:return`bottom-start`;case`bottomEnd`:return`bottom-end`;case`bottomStretch`:return`bottom-stretch`;case`bottomCenter`:return`bottom-center`}return`bottom-end`}function bu(e,t){if(e.onAction)return{label:e.actionLabel??`Retry`,run:e.onAction};if(e.undoActionId)return{label:e.undoLabel??`Undo`,run:()=>t.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0}))}}function xu(e,t){let n=new r;n.position=yu(e.position),n.duration=e.duration??1e4,e.variant&&n.setAttribute(`theme`,e.variant),n.renderer=r=>{if(r.firstElementChild)return;let i=document.createElement(`span`);i.textContent=e.text;let a=bu(e,t),o=document.createElement(`button`);o.textContent=a.label,o.style.cssText=`margin-left: 0.75rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;`,o.addEventListener(`click`,()=>{a.run(),n.opened=!1}),r.append(i,o)},document.body.appendChild(n),n.opened=!0,n.addEventListener(`opened-changed`,e=>{e.detail.value||n.remove()})}P.set(new vu),Pa({show(e,t){if(mt(e.text,{politeness:e.variant===`error`?`assertive`:`polite`}),e.undoActionId||e.onAction){xu(e,t);return}r.show(e.text,{position:e.position?yu(e.position):`bottom-end`,theme:e.variant,duration:e.duration})}});