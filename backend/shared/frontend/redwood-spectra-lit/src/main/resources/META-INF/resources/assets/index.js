const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor.js","assets/vendor.css","assets/vendor-diagrams.js"])))=>i.map(i=>d[i]);
import{S as Ws,a as Gs,n as ke,b as Ks}from"./vendor.js";import{i as $,n as u,e as Ie,a as C,b as i,t as x,A as l,o as Ue,r as b,c as D,w as K,d as Ys,D as Js,f as Ha,g as Va,h as Wa,u as Xs,s as Qs}from"./vendor-lit.js";import{_ as xe}from"./mateu-redwood-spectra.js";import"./vendor-vaadin.js";const yt=new Ws,G={value:{}},wr={value:{}},ur=$`
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
`,Zs={lon:0,lat:0},wa=3,eo=e=>{if(!e)return;const t=e.split(",").map(s=>s.trim());if(t.length!==2)return;const r=Number(t[0]),a=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(r)||!Number.isFinite(a)))return{lon:a,lat:r}},to=e=>{if(e==null||e.trim()==="")return wa;const t=Number(e);return Number.isFinite(t)?t:wa};var ro=Object.defineProperty,ao=Object.getOwnPropertyDescriptor,Fr=(e,t,r,a)=>{for(var s=a>1?void 0:a?ao(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&ro(t,r,s),s};let Mt=class extends C{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:r},{default:a},{default:s},{fromLonLat:o},{default:n}]=await Promise.all([xe(()=>import("./vendor-ol.js").then(c=>c.M),[]),xe(()=>import("./vendor-ol.js").then(c=>c.V),[]),xe(()=>import("./vendor-ol.js").then(c=>c.T),[]),xe(()=>import("./vendor-ol.js").then(c=>c.O),[]),xe(()=>import("./vendor-ol.js").then(c=>c.p),[]),xe(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=n,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const d=eo(this.position)??Zs;this.map=new t({target:this.mapElement,layers:[new a({source:new s})],view:new r({center:o([d.lon,d.lat]),zoom:to(this.zoom)})})}render(){return i`<div id="map"></div>`}};Mt.styles=$`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;Fr([u()],Mt.prototype,"position",2);Fr([u()],Mt.prototype,"zoom",2);Fr([Ie("#map")],Mt.prototype,"mapElement",2);Mt=Fr([x("mateu-map")],Mt);const so=typeof HTMLElement<"u"?HTMLElement:class{};class oo extends so{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#r()}attributeChangedCallback(t,r,a){this.content=a??void 0}connectedCallback(){this.style.display="block",this.#r()}async#r(){if(!this.isConnected)return;const t=this.#e??"",r=++this.#t,[{marked:a},{default:s}]=await Promise.all([xe(()=>import("./vendor.js").then(o=>o.m),__vite__mapDeps([0,1])),xe(()=>import("./vendor.js").then(o=>o.p),__vite__mapDeps([0,1]))]);r===this.#t&&(this.innerHTML=s.sanitize(await a.parse(t),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:o=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",oo);var Y=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(Y||{}),m=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Drawer="Drawer",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.FoldoutLayout="FoldoutLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e.PlanningBoard="PlanningBoard",e.Kanban="Kanban",e.Timeline="Timeline",e.ProgressSteps="ProgressSteps",e.Stat="Stat",e.Calendar="Calendar",e.PricingTable="PricingTable",e.OrgChart="OrgChart",e.Heatmap="Heatmap",e.Funnel="Funnel",e.TrendChart="TrendChart",e.FeatureGrid="FeatureGrid",e.Testimonials="Testimonials",e.Faq="Faq",e.CalloutCard="CalloutCard",e.CommentThread="CommentThread",e.FileList="FileList",e.Checklist="Checklist",e.ComparisonCard="ComparisonCard",e.EntityHeader="EntityHeader",e.Meter="Meter",e.TaskProgress="TaskProgress",e.StatusList="StatusList",e.BulletedList="BulletedList",e.Separator="Separator",e.Notice="Notice",e.TaskQueue="TaskQueue",e.ResourceGrid="ResourceGrid",e.OfferCard="OfferCard",e.AddOnPicker="AddOnPicker",e.Ledger="Ledger",e.PaymentPicker="PaymentPicker",e.ProcessMonitor="ProcessMonitor",e))(m||{});const oa="mateu-app-context",Ga="mateu-app-context-labels",Ka=e=>{try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}},ka=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},ia=()=>Ka(oa),Ya=()=>Ka(Ga),io=(e,t,r)=>{const a=ia(),s=Ya();t==null||t===""?(delete a[e],delete s[e]):(a[e]=t,r!==void 0&&(s[e]=r)),ka(oa,a),ka(Ga,s)};let Ca=!1;const no=()=>{Ca||(Ca=!0,window.addEventListener("storage",e=>{e.key===oa&&e.newValue!==e.oldValue&&window.location.reload()}))},lo=(e,t)=>new Promise((r,a)=>{let s=!1;const o={retry:()=>{s||(s=!0,t().then(r,a))},giveUp:()=>{s||(s=!0,a(e))}},n=new CustomEvent("mateu-session-expired",{detail:o,cancelable:!0,bubbles:!1});typeof document<"u"&&!document.dispatchEvent(n)||o.giveUp()}),co=(e,t)=>e.includes("json")?!0:t!==null&&typeof t=="object",uo=(e,t)=>{const r=e.finalUrl;if(!r)return;const a=typeof window<"u"?window.location.href:void 0;let s;try{s=new URL(e.requestedUrl,a).href}catch{return}if(s!==r&&!co(e.contentType??"",e.data))return r};class po{constructor(){this.windowMs=4e3,this.threshold=12,this.events=[],this.reported=new Set}check(t,r=Date.now()){this.events.push({sig:t,t:r});const a=r-this.windowMs;this.events=this.events.filter(o=>o.t>=a);let s=0;for(const o of this.events)o.sig===t&&s++;if(s>=this.threshold){const o=!this.reported.has(t);return this.reported.add(t),{blocked:!0,firstTrip:o}}return this.reported.delete(t),{blocked:!1,firstTrip:!1}}reset(){this.events=[],this.reported.clear()}configure(t){t.windowMs!==void 0&&(this.windowMs=t.windowMs),t.threshold!==void 0&&(this.threshold=t.threshold)}}const mo=new po;let jt=[];class ho{constructor(){this.axiosInstance=Gs.create({timeout:6e4}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t)),this.axiosInstance.interceptors.response.use(t=>{const r=uo({requestedUrl:this.axiosInstance.getUri(t.config),finalUrl:t.request?.responseURL,contentType:String(t.headers?.["content-type"]??""),data:t.data});if(r)throw window.location.assign(r),Object.assign(new Error("session lost — redirecting to "+r),{code:"ERR_CANCELED"});return t},t=>{const r=t;if(r?.response?.status===401&&r.config&&!r.config.__mateuRetried){const a=r.config;return a.__mateuRetried=!0,lo(t,()=>this.axiosInstance.request(a))}throw t})}addSessionId(t){let r=sessionStorage.getItem("__mateu_sesion_id");r||(r=ke(),sessionStorage.setItem("__mateu_sesion_id",r)),t.headers["X-Session-Id"]=r}addAuthToken(t){const r=localStorage.getItem("__mateu_auth_token");r&&(t.headers.Authorization="Bearer "+r)}async wrap(t,r,a,s){return a||r.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t.then(o=>(r.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:s}})),o)).catch(o=>{throw o?.code=="ERR_CANCELED"?r.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{}})):r.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:s,reason:this.serialize(o)}})),o})}serialize(t){return t?.message?t:JSON.stringify(t)}async get(t){const r=new AbortController;return jt=[...jt,r],this.axiosInstance.get(t,{signal:r.signal})}async post(t,r){const a=new AbortController;return jt=[...jt,a],this.axiosInstance.post(t,r,{signal:a.signal})}async abortAll(){jt.forEach(t=>t.abort()),jt=[]}async runAction(t,r,a,s,o,n,d,c,p,h,f){r&&r.startsWith("/")&&(r=r.substring(1));const v=[t,r,a,d??"",s,o].join(""),y=mo.check(v);return y.blocked?(await this.abortAll(),y.firstTrip&&console.error("[mateu] request loop detected — aborting repeated request",v),{messages:y.firstTrip?[{title:"",text:"A repeating request was detected and stopped to protect the server. Reload the page or navigate elsewhere.",position:"bottom-end",variant:"error",duration:6e3}]:[],commands:[],fragments:[],banners:[],appendBanners:!1,appData:void 0,appState:void 0}):(n={...ia(),...n},await this.wrap(this.post(t+"/mateu/v3/sync/"+(r&&r!=""?r:"_no_route"),{serverSideType:d,appState:n,componentState:c,parameters:p,initiatorComponentId:o,consumedRoute:a,route:r&&r!=""?"/"+r:"",actionId:s}).then(S=>S.data),h,f,s))}}const Tt=new ho;var rr=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(rr||{}),Ke=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(Ke||{}),fo=Object.defineProperty,Ja=(e,t,r,a)=>{for(var s=void 0,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=n(t,r,s)||s);return s&&fo(t,r,s),s};class Br extends C{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const r=t.data,a=document.createElement(r.name);for(let s in r.attributes)a.setAttribute(s,r.attributes[s]);for(let s in r.on)a.addEventListener(s,o=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.on[s],parameters:{event:o}},bubbles:!0,composed:!0}))});return a},this.closeModal=()=>{const t=(this.shadowRoot??this).querySelectorAll("mateu-dialog, mateu-drawer");if(t&&t.length>0){t[t.length-1].close(),this.removeTopOverlayChild();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let r=document.querySelector('link[rel="icon"]');r!==null?r.setAttribute("href",t):(r=document.createElement("link"),r.setAttribute("rel","icon"),r.setAttribute("href",t),document.head.appendChild(r))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=yt.subscribe(t=>{if(t.command){const r=t.command;this.id==r.targetComponentId&&this.applyCommand(r)}if((!t.callbackToken||!this.callbackToken||t.callbackToken===this.callbackToken)&&t.fragment){const r=t.fragment;this.id==r.targetComponentId&&(this.applyFragment(r),this.completeMenu(r))}})}completeMenu(t){if(t.component&&t.component.type==Y.ClientSide){const r=t.component,a=r.metadata;if(a?.type==m.App){const s=a,o=this.getRemoteMenus(s.menu);if(o.length>0){const n=o.map(d=>Tt.runAction(d.baseUrl,d.route,"_empty","",d.baseUrl+"#"+d.route,void 0,void 0,void 0,d.params,this,!0));Promise.all(n).then(d=>{s.menu=this.updateMenu(s.menu,d.map(c=>c.fragments).filter(c=>c).map(c=>c).flat()),s.variant=Ke.MENU_ON_TOP,yt.next({fragment:{component:r,data:void 0,state:void 0,action:rr.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(t,r){const a=[];return t.forEach(s=>{if(s.remote){const o=r.find(n=>n.targetComponentId==s.baseUrl+"#"+s.route);if(o&&o.component?.type==Y.ClientSide){const n=o.component;if(n.metadata?.type==m.App){const d=n.metadata,c=s.serverSideType&&s.serverSideType!=""?s.serverSideType:d.serverSideType;this.changeBaseUrl(d.menu,s.baseUrl,c,s.route,d.route),a.push(...d.menu)}}}else a.push(s)}),a}changeBaseUrl(t,r,a,s,o){t.forEach(n=>{n.baseUrl||(n.submenus&&n.submenus.length>0?this.changeBaseUrl(n.submenus,r,a,s,o):(n.consumedRoute=o??"",n.baseUrl=r,n.serverSideType=a,n.uriPrefix=s))})}getRemoteMenus(t){const r=[];return t.forEach(a=>{a.remote&&r.push(a)}),r}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"&&this.dispatchNamedEvent(t.data),t.type=="NavigateTo"){const r=t.data;r&&(r.startsWith("http:")||r.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const r=t.data;r!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:r},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const r=t.data;if(r&&r.actionId)if(r.targetComponentId){const a={command:{type:"RunAction",data:{actionId:r.actionId},targetComponentId:r.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>yt.next(a))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const r=t.data;if(r&&r.base64Content){const a=atob(r.base64Content),s=new Uint8Array(a.length);for(let c=0;c<a.length;c++)s[c]=a.charCodeAt(c);const o=new Blob([s],{type:r.mimeType}),n=URL.createObjectURL(o),d=document.createElement("a");d.href=n,d.download=r.filename??"export",d.click(),URL.revokeObjectURL(n)}}if(t.type=="CloseModal"&&(this.closeModal(),this.dispatchNamedEvent(t.data)),t.type=="AddContentToHead"){const r=t.data;if(r&&r.name){if(r.attributes&&r.attributes.id&&document.getElementById(r.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const r=t.data;if(r&&r.name){if(r.attributes&&r.attributes.id&&document.getElementById(r.attributes.id))return;document.body.appendChild(this.createElement(t))}}}dispatchNamedEvent(t){if(t&&t.eventName){const r=this.component,a=r?.emitsName??r?.serverSideType;let s=t.payload??t.detail;a&&s&&typeof s=="object"&&(s={...s,__source:a}),this.dispatchEvent(new CustomEvent(t.eventName,{detail:s,bubbles:!0,composed:!0}))}}removeTopOverlayChild(){const t=this.component?.children;if(t)for(let r=t.length-1;r>=0;r--){const a=t[r]?.metadata?.type;if(a==m.Drawer||a==m.Dialog){t.splice(r,1);return}}}}Ja([u()],Br.prototype,"id");Ja([u()],Br.prototype,"baseUrl");var vo=Object.defineProperty,bo=(e,t,r,a)=>{for(var s=void 0,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=n(t,r,s)||s);return s&&vo(t,r,s),s};class na extends Br{applyFragment(t){}manageActionRequestedEvent(t){}}bo([u()],na.prototype,"component");const Nt=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),Ht=(e,t,r)=>({state:e??{},data:t??{},...r});function zt(e,t,r,a){if(!e?.includes("${"))return e;try{return Nt(e,Ht(t,r,a))}catch(s){return console.warn(`Mateu: could not interpolate "${e}":`,s),e}}const at=(e,t,r)=>{if(e&&e.indexOf("${")>=0)try{return Nt(e,Ht(t,r))}catch(a){return a.message}return e},ar=(e,t,r,a,s)=>{if(!e)return e;const o=Ht(t,r,{appState:a??{},appData:s??{}});let n=e;try{if(n=Nt(e,o),n.includes("${"))try{n=Nt(n,o)}catch(d){n="when evaluating nested "+e+" :"+d+", where data is "+r+" and state is "+t+" and app state is "+a+" and app data is "+s,console.error(d,n,t,r,a,s)}}catch(d){n="when evaluating "+e+" :"+d+", where data is "+r+" and state is "+t+" and app state is "+a+" and app data is "+s,console.error(d,n,t,r,a,s)}return n},Xa=(e,t,r,a,s,o)=>{const n=Ht(t,r,{appState:a??{},appData:s??{},...o}),d=Nt(e,n);return new Function(...Object.keys(n),`return (${d})`)(...Object.values(n))},Qa=(e,t,r,a)=>{const s=Ht(t,r,a);return new Function(...Object.keys(s),`return (${e})`)(...Object.values(s))},go=(e,t,r,a)=>Nt(e,Ht(t,r,a)),ea="display:inline-flex; align-items:center; justify-content:center; width:2rem; height:2rem; border-radius:50%; background:var(--lumo-contrast-10pct,#e0e0e0); color:var(--lumo-secondary-text-color,#555); font-size:.8rem; font-weight:600; overflow:hidden; flex:none;",Za=(e,t)=>t||(typeof e=="string"&&e?e.trim().split(/\s+/).map(r=>r[0]).slice(0,2).join("").toUpperCase():""),yo=(e,t,r)=>{const a=e.metadata,s=kr(a.name,t,r);return i`<span style="${ea}${e.style}" class="${e.cssClasses}"
                      title="${s||l}" slot="${e.slot??l}">
        ${a.image?i`<img src="${a.image}" alt="${s}" style="width:100%;height:100%;object-fit:cover;">`:Za(s,a.abbreviation)}
    </span>`},kr=(e,t,r)=>typeof e=="string"&&e.includes("${")?zt(e,t,r):e,$o=e=>{const t=e.metadata,r=t.avatars??[],a=t.maxItemsVisible&&t.maxItemsVisible>0?t.maxItemsVisible:r.length,s=r.slice(0,a),o=r.length-s.length,n="margin-left:-0.4rem; border:2px solid var(--lumo-base-color,#fff);";return i`<span style="display:inline-flex; ${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
        ${s.map(d=>i`<span style="${ea}${n}" title="${d.name||l}">
            ${d.img?i`<img src="${d.img}" style="width:100%;height:100%;object-fit:cover;">`:Za(d.name??"",d.abbr)}
        </span>`)}
        ${o>0?i`<span style="${ea}${n}">+${o}</span>`:l}
    </span>`},xo=(e,t,r)=>{const a=e.metadata;return i`<span theme="badge ${a.color} ${a.pill?"pill":""} ${a.small?"small":""} ${a.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??l}">${kr(a.text,t,r)}</span>`},wo=(e,t,r)=>{const a=kr(e.text,t,r);if(!a)return l;let s=kr(e.color,t,r);return s=="SUCCESS"&&(s="success"),s=="ERROR"&&(s="error"),s=="DANGER"&&(s="error"),s=="WARNING"&&(s="warning"),s=="INFO"&&(s="info"),s=="PRIMARY"&&(s="primary"),s=="SECONDARY"&&(s="secondary"),s=="TERTIARY"&&(s="tertiary"),s=="QUATERNARY"&&(s="quaternary"),s=="LIGHT"&&(s="light"),s=="DARK"&&(s="dark"),i`<span theme="badge ${s} ${e.pill?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${a}</span>`};class ko{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const r=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:r?[...r].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const j=new ko,w=(e,t,r,a,s,o,n,d)=>{if(!t)return i``;if(t.type==Y.ClientSide)return j.get().renderClientSideComponent(e,t,r,a,s,o,n,d);const c=e.route,p=e.consumedRoute;return i`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${p}"
                         baseUrl="${r}"
                         slot="${t.slot??l}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...a}}"
                         .data="${{...s}}"
                         .appState="${o}"
                         .appData="${n}"
        >
       </mateu-component>`};var Co=Object.defineProperty,So=Object.getOwnPropertyDescriptor,At=(e,t,r,a)=>{for(var s=a>1?void 0:a?So(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Co(t,r,s),s};const _o=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},Eo=e=>{const t=_o(e)??"",r=[];return t.includes("primary")&&r.push("primary"),t.includes("tertiary")&&r.push("tertiary"),(t.includes("error")||e.color==="error")&&r.push("danger"),r.join(" ")},Sa=e=>e==="back"||e==="backToList"||!!e&&e.startsWith("cancel");let Ye=class extends C{constructor(){super(...arguments),this.appState={},this.appData={},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>zt(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return l;const t=this.evalLabel(e.label),r=j.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId));return r||i`
        <button class="mtb ${Eo(e)}"
                data-action-id="${e.id}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${t}</button>
    `},this.renderPeerNav=e=>{const t=j.get()?.renderPeerNav?.(e);return t||i`
            <div style="display: flex; gap: var(--lumo-space-xs, .25rem); align-items: center;" class="peer-nav">
                <button class="mtb tertiary peer-nav-prev"
                        title="${e.prevLabel??"Previous"}"
                        ?disabled="${!e.prevRoute}"
                        @click="${()=>{e.prevRoute&&(window.location.href=e.prevRoute)}}">‹</button>
                <button class="mtb tertiary peer-nav-next"
                        title="${e.nextLabel??"Next"}"
                        ?disabled="${!e.nextRoute}"
                        @click="${()=>{e.nextRoute&&(window.location.href=e.nextRoute)}}">›</button>
            </div>
        `}}render(){const e=this.metadata;if(!e)return i``;const t=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0,r=e.toolbar??[],a=r.filter(c=>Sa(c.actionId)),s=r.filter(c=>!Sa(c.actionId)),o=a.length>0&&s.length>0?i`<span class="toolbar-divider"></span>`:l,n=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||r.length>0||!!t,d=e.level??0;return d>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested"),i`
            ${e.breadcrumbs&&e.breadcrumbs.length>0?i`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="breadcrumbs-bar">
                    ${e.breadcrumbs.map((c,p)=>i`
                        ${p>0?i`<span>/</span>`:l}
                        ${c.link?i`<button class="breadcrumb-link" @click="${()=>window.location.href=`${c.link}`}">${c.text}</button>`:i`<span>${c.text}</span>`}
                    `)}
                </div>
            `:l}
            ${e.noHeader?i`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                    ${e?.header?.map(c=>w(this,c,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${t?this.renderPeerNav(t):l}
                    ${a.map(this.renderBtn)}
                    ${o}
                    ${s.map(this.renderBtn)}
                </div>
            `:n?i`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="form-header">
                    ${e.avatar?w(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):l}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${e?.title&&d==0?i`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Ue(at(e?.title,this.state??{},this.data??{}))}</h2>`:l}
                        ${e?.title&&d==1?i`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Ue(at(e?.title,this.state??{},this.data??{}))}</h3>`:l}
                        ${e?.title&&d==2?i`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Ue(at(e?.title,this.state??{},this.data??{}))}</h4>`:l}
                        ${e?.title&&d==3?i`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Ue(at(e?.title,this.state??{},this.data??{}))}</h5>`:l}
                        ${e?.title&&d>3?i`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Ue(at(e?.title,this.state??{},this.data??{}))}</h6>`:l}

                        ${e?.subtitle?i`<span style="display: inline-block; margin-block-end: 0.83em;">${Ue(at(e?.subtitle,this.state??{},this.data??{}))}</span>`:l}
                        ${e?.timestamp?i`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${Ue(at(e.timestamp,this.state??{},this.data??{}))}</span>`:l}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e?.kpis?.map(c=>i`
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div>${this.evalLabel(c.title)}</div>
                                <div>${Ue(at(c.text,this.state??{},this.data??{}))}</div>
                            </div>
                        `)}
                        ${e?.header?.map(c=>w(this,c,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${t?this.renderPeerNav(t):l}
                        ${a.map(this.renderBtn)}
                        ${o}
                        ${s.map(this.renderBtn)}
                    </div>
                </div>
            `:l}
            ${e.badges&&e.badges.length>0?i`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(c=>wo(c,this.state??{},this.data??{}))}
                </div>
            `:l}
        `}};Ye.styles=$`
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

        ${ur}
    `;At([u()],Ye.prototype,"metadata",2);At([u()],Ye.prototype,"baseUrl",2);At([u()],Ye.prototype,"state",2);At([u()],Ye.prototype,"data",2);At([u()],Ye.prototype,"appState",2);At([u()],Ye.prototype,"appData",2);Ye=At([x("mateu-content-header")],Ye);var Io=Object.defineProperty,Po=Object.getOwnPropertyDescriptor,pr=(e,t,r,a)=>{for(var s=a>1?void 0:a?Po(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Io(t,r,s),s};let xt=class extends na{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return i`
            <div class="mateu-vlayout ${this.component?.cssClasses??""}">
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
       `}};xt.styles=$`
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
    `;pr([u()],xt.prototype,"state",2);pr([u()],xt.prototype,"data",2);pr([u()],xt.prototype,"appState",2);pr([u()],xt.prototype,"appData",2);xt=pr([x("mateu-form")],xt);var Oo=Object.defineProperty,To=Object.getOwnPropertyDescriptor,la=(e,t,r,a)=>{for(var s=a>1?void 0:a?To(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Oo(t,r,s),s};let sr=class extends C{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?i`${e.map(()=>i`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?i`${e.map(()=>i`<div class="bone row"></div>`)}`:this.variant=="form"?i`${e.map(()=>i`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:i`${e.map(()=>i`<div class="bone line"></div>`)}`}};sr.styles=$`
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
    `;la([u()],sr.prototype,"variant",2);la([u({type:Number})],sr.prototype,"count",2);sr=la([x("mateu-skeleton")],sr);const zo=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},er=(e,t,r,a,s,o)=>i`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??"🗂"}</span>
            ${r?i`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${r}</span>`:l}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${a??e??"Nothing here yet."}</span>
            ${s&&o?i`
                <button style="margin-top: .25rem; font: inherit; font-weight: 500; cursor: pointer; padding: .4rem .9rem; border: none; border-radius: var(--lumo-border-radius-m, 6px); background: transparent; color: var(--lumo-primary-text-color, #3b5bdb);"
                        @click="${n=>zo(n,s)}">${o}</button>
            `:l}
        </div>
    `,Ao=e=>{const t=e.metadata;return i`
        <div style="${e.style??l}" class="${e.cssClasses??l}" slot="${e.slot??l}">
            ${er(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},Lo=e=>{const t=e.metadata;return i`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-skeleton>
    `},H=(e,t,r,a)=>{if(!e)return i``;const s=j.get()?.renderIcon;if(s){const o=s.call(j.get(),e,t,r);return a?i`<span slot="${a}">${o}</span>`:o}return i`<span class="mateu-icon ${r??""}" data-icon="${e}" aria-hidden="true"
                      style="display:inline-block; width:1em; height:1em; ${t??""}" slot="${a??l}"></span>`},es="mateu-saved-views",qr=()=>{try{return JSON.parse(localStorage.getItem(es)??"{}")}catch{return{}}},da=e=>{try{localStorage.setItem(es,JSON.stringify(e))}catch{}},ts=e=>qr()[e]??[],Do=(e,t)=>{const r=t.name?.trim();if(!r||Object.keys(t.values??{}).length===0)return;const a=qr(),s=(a[e]??[]).filter(o=>o.name!==r);s.push({...t,name:r}),a[e]=s,da(a)},Ro=(e,t)=>{const r=qr(),a=(r[e]??[]).filter(s=>s.name!==t);a.length===0?delete r[e]:r[e]=a,da(r)},Uo=(e,t)=>{const r=qr();r[e]=(r[e]??[]).map(a=>({...a,isDefault:a.name===t?!a.isDefault:!1})),da(r)},jo=e=>ts(e).find(t=>t.isDefault);var Mo=Object.defineProperty,No=Object.getOwnPropertyDescriptor,ve=(e,t,r,a)=>{for(var s=a>1?void 0:a?No(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Mo(t,r,s),s};let re=class extends C{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.viewsOpened=!1,this.draftText="",this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{const e=this.filters.flatMap(r=>this.isRangeFilter(r)?[`${r.fieldId}_from`,`${r.fieldId}_to`]:[r.fieldId]),t={searchText:void 0};e.forEach(r=>{t[r]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return this.metadata?.filters??[]}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){const t=this.filters.find(r=>r.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e==="searchText"?"":void 0),this.requestSearch()}commitText(e){this.emitValueChanged("searchText",e.value),this.draftText="",e.value="",this.requestSearch()}get viewsScope(){return window.location.pathname}allFilterKeys(){return["searchText",...this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])]}snapshotValues(){const e={};return this.state.searchText&&(e.searchText=this.state.searchText),this.filters.forEach(t=>{if(this.isSet(t))if(this.isRangeFilter(t)){const r=this.rangeBound(t,"from"),a=this.rangeBound(t,"to");r&&(e[`${t.fieldId}_from`]=r),a&&(e[`${t.fieldId}_to`]=a)}else this.isMultiFilter(t)?e[t.fieldId]=this.multiValues(t):e[t.fieldId]=this.state[t.fieldId]}),e}applyView(e){const t=this.allFilterKeys(),r={};t.forEach(a=>{r[a]=void 0}),this.state={...this.state,...r},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:t},bubbles:!0,composed:!0})),Object.entries(e.values).forEach(([a,s])=>this.emitValueChanged(a,s)),this.viewsOpened=!1,this.detachOutsideClick(),this.requestSearch()}saveCurrentView(e){const t=e.value.trim();t&&(Do(this.viewsScope,{name:t,values:this.snapshotValues()}),e.value="",this.requestUpdate())}firstUpdated(){if(window.location.search)return;const e=jo(this.viewsScope);e&&setTimeout(()=>{this.state.searchText||this.filters.some(r=>this.isSet(r))||this.applyView(e)},0)}isBooleanFilter(e){return e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle"}isNumericFilter(e){return["integer","decimal","number","money"].includes(e.dataType??"")}isRangeFilter(e){return e.stereotype==="dateRange"||e.stereotype==="numberRange"}isMultiFilter(e){return e.stereotype==="multiSelect"}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){const t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t=="string"&&t!==""?t.split(",").map(r=>r.trim()).filter(r=>r):[]}rangeBound(e,t){const r=this.state[`${e.fieldId}_${t}`];return r==null?"":String(r)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,"from")!==""||this.rangeBound(e,"to")!=="";if(this.isMultiFilter(e))return this.multiValues(e).length>0;const t=this.state[e.fieldId];return t!=null&&t!==""&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){const r=e.options.find(a=>a.value===String(t));if(r)return r.label??r.value}return typeof t=="boolean"?t?"Yes":"No":String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){const t=this.rangeBound(e,"from"),r=this.rangeBound(e,"to");return t&&r?`${t} – ${r}`:t?`≥ ${t}`:`≤ ${r}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(", "):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return zt(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,r="panel-row"){return i`
            <div class="${r}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){const t=e.stereotype==="numberRange"?"number":e.dataType==="dateTime"?"datetime-local":e.dataType==="time"?"time":"date",r=s=>{const o=s.closest(".panel-input-row"),n=o.querySelector("input.range-from").value,d=o.querySelector("input.range-to").value;this.emitValueChanged(`${e.fieldId}_from`,n===""?void 0:n),this.emitValueChanged(`${e.fieldId}_to`,d===""?void 0:d),this.requestSearch()},a=s=>{s.key==="Enter"&&r(s.target),s.key==="Escape"&&this.closePanel()};return i`
            <div class="panel-input-row">
                <input class="range-from" type="${t}" placeholder="From"
                       .value="${this.rangeBound(e,"from")}"
                       @mousedown="${s=>s.stopPropagation()}"
                       @keydown="${a}"/>
                <span class="range-separator" aria-hidden="true">–</span>
                <input class="range-to" type="${t}" placeholder="To"
                       .value="${this.rangeBound(e,"to")}"
                       @mousedown="${s=>s.stopPropagation()}"
                       @keydown="${a}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${s=>r(s.target)}">Apply</button>
            </div>`}renderMultiWidget(e){const t=this.multiValues(e),r=a=>{const s=t.includes(a)?t.filter(o=>o!==a):[...t,a];this.emitValueChanged(e.fieldId,s.length>0?s:void 0),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))};return i`${(e.options??[]).map(a=>this.panelRow(i`
            <span class="multi-check ${t.includes(a.value)?"multi-check--on":""}"
                  aria-hidden="true">${t.includes(a.value)?"✓":""}</span>
            ${a.label??a.value}
        `,()=>r(a.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return i`${e.options.map(a=>this.panelRow(a.label??a.value,()=>this.applyFilter(e.fieldId,a.value)))}`;if(this.isBooleanFilter(e))return i`
                ${this.panelRow("Yes",()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow("No",()=>this.applyFilter(e.fieldId,!1))}`;const t=this.isNumericFilter(e),r=a=>{a.value!==""&&this.applyFilter(e.fieldId,t?Number(a.value):a.value)};return i`
            <div class="panel-input-row">
                <input type="${t?"number":"text"}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${a=>a.stopPropagation()}"
                       @keydown="${a=>{a.key==="Enter"&&r(a.target),a.key==="Escape"&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${a=>r(a.target.previousElementSibling)}">Apply</button>
            </div>`}renderViewsPanel(){if(!this.viewsOpened)return l;const e=ts(this.viewsScope),t=!!this.state.searchText||this.filters.some(r=>this.isSet(r));return i`
            <div class="panel views-panel">
                <div class="panel-caption">Saved views</div>
                ${e.length===0?i`
                    <div class="panel-row views-empty">No saved views yet</div>`:l}
                ${e.map(r=>i`
                    <div class="panel-row view-row" @mousedown="${this.keepFocus}">
                        <span class="view-name" @click="${()=>this.applyView(r)}">${r.name}</span>
                        <button class="view-star ${r.isDefault?"view-star--on":""}"
                                title="${r.isDefault?"Unset as default":"Open this listing with this view"}"
                                @click="${()=>{Uo(this.viewsScope,r.name),this.requestUpdate()}}">★</button>
                        <button class="chip-remove" aria-label="Delete view ${r.name}"
                                @click="${()=>{Ro(this.viewsScope,r.name),this.requestUpdate()}}">✕</button>
                    </div>`)}
                ${t?i`
                    <div class="panel-input-row" @mousedown="${r=>r.stopPropagation()}">
                        <input class="view-name-input" type="text" placeholder="Save current view as…"
                               @keydown="${r=>{r.key==="Enter"&&this.saveCurrentView(r.target),r.key==="Escape"&&(this.viewsOpened=!1)}}"/>
                        <button class="apply-button"
                                @click="${r=>this.saveCurrentView(r.target.previousElementSibling)}">Save</button>
                    </div>`:i`
                    <div class="panel-row views-empty">Apply some filters to save a view</div>`}
            </div>`}renderPanel(){if(!this.panelOpened||this.filters.length===0)return l;if(this.activeFilter){const t=this.activeFilter;return i`
                <div class="panel">
                    <div class="panel-row panel-header"
                         @mousedown="${this.keepFocus}"
                         @click="${()=>{this.activeFilter=void 0}}">
                        <span aria-hidden="true">←</span> ${this.labelOf(t)}
                    </div>
                    ${this.renderActiveFilterWidget(t)}
                </div>`}const e=!!this.state.searchText||this.filters.some(t=>this.isSet(t));return i`
            <div class="panel">
                <div class="panel-caption">Filter by</div>
                ${this.filters.map(t=>this.panelRow(i`
                    ${this.labelOf(t)}
                    ${this.isSet(t)?i`<span class="current-value">${this.conditionDisplay(t)}</span>`:l}
                `,()=>{this.activeFilter=t}))}
                ${e?this.panelRow("Clear filters",this.clearAllFilters,"panel-row panel-footer"):l}
            </div>`}render(){const e=[];return this.state.searchText&&e.push({fieldId:"searchText",label:"Text",display:String(this.state.searchText)}),this.filters.forEach(t=>{this.isSet(t)&&e.push({fieldId:t.fieldId,label:this.labelOf(t),display:this.conditionDisplay(t)})}),i`
            <div class="smart-search">
                <div class="bar"
                     @click="${t=>{t.currentTarget.querySelector("input.free-text")?.focus(),this.openPanel()}}">
                    <svg aria-hidden="true" class="magnifier" width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
                    </svg>
                    ${e.map(t=>i`
                        <span theme="badge contrast pill" class="chip">
                            <span class="chip-label">${t.label}:</span> ${t.display}
                            <button class="chip-remove" aria-label="Remove filter ${t.label}"
                                    @mousedown="${this.keepFocus}"
                                    @click="${r=>{r.stopPropagation(),this.removeChip(t.fieldId)}}">✕</button>
                        </span>`)}
                    ${this.metadata?.searchable!==!1?i`
                        <input class="free-text" type="text" id="searchText"
                               placeholder="${e.length===0?"Search":""}"
                               autofocus="${this.metadata?.autoFocusOnSearchText?!0:l}"
                               .value="${this.draftText??""}"
                               @input="${t=>{this.draftText=t.target.value,this.openPanel()}}"
                               @keydown="${t=>{t.key==="Enter"&&this.commitText(t.target),t.key==="Escape"&&this.closePanel()}}"/>
                    `:l}
                    <button class="views-button" title="Saved views" aria-label="Saved views"
                            @mousedown="${this.keepFocus}"
                            @click="${t=>{t.stopPropagation(),this.closePanel(),this.viewsOpened=!this.viewsOpened,this.viewsOpened&&(this.outsideClick=r=>{r.composedPath().includes(this)||(this.viewsOpened=!1,this.detachOutsideClick())},document.addEventListener("mousedown",this.outsideClick))}}">
                        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"/>
                        </svg>
                    </button>
                </div>
                ${this.renderPanel()}
                ${this.renderViewsPanel()}
            </div>
            <slot></slot>
        `}};re.styles=$`
        ${ur}
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
    `;ve([u()],re.prototype,"metadata",2);ve([u()],re.prototype,"baseUrl",2);ve([b()],re.prototype,"state",2);ve([b()],re.prototype,"data",2);ve([u()],re.prototype,"appState",2);ve([u()],re.prototype,"appData",2);ve([u({type:Boolean})],re.prototype,"searchOnly",2);ve([b()],re.prototype,"panelOpened",2);ve([b()],re.prototype,"viewsOpened",2);ve([b()],re.prototype,"activeFilter",2);ve([b()],re.prototype,"draftText",2);re=ve([x("mateu-filter-bar")],re);const rs="mateu-column-prefs",ca=()=>{try{const e=JSON.parse(localStorage.getItem(rs)??"{}");return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}},as=e=>{try{localStorage.setItem(rs,JSON.stringify(e))}catch{}},ua=e=>{if(!e||typeof e!="object")return;const t=r=>Array.isArray(r)?r.filter(a=>typeof a=="string"):[];return{hidden:t(e.hidden),order:t(e.order)}},ss=e=>ua(ca()[e]),Fo=(e,t)=>{const r=ca(),a=ua(t);a.hidden.length===0&&a.order.length===0?delete r[e]:r[e]=a,as(r)},Bo=e=>{const t=ca();delete t[e],as(t)},os=e=>e?!!e.identifier||e.dataType==="action"||e.dataType==="actionGroup"||e.dataType==="menu"||e.id==="select"||e.id==="menu":!1,is=(e,t,r=a=>a)=>{const a=ua(t);if(!a||a.hidden.length===0&&a.order.length===0)return e;const s=f=>r(f)?.id??f.id,o=new Set(a.hidden),n=e.filter(f=>{const v=s(f);return!v||!o.has(v)||os(r(f))});if(a.order.length===0)return n.length===e.length?e:n;const d=new Map;n.forEach(f=>{const v=s(f);v&&!d.has(v)&&d.set(v,f)});const c=[],p=new Set;return a.order.forEach(f=>{const v=d.get(f);v&&!p.has(v)&&(c.push(v),p.add(v))}),n.forEach(f=>{p.has(f)||(c.push(f),p.add(f))}),c.length===e.length&&c.every((f,v)=>f===e[v])?e:c};var qo=Object.defineProperty,Ho=Object.getOwnPropertyDescriptor,mr=(e,t,r,a)=>{for(var s=a>1?void 0:a?Ho(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&qo(t,r,s),s};let wt=class extends C{constructor(){super(...arguments),this.columns=[],this.scope="",this.panelOpened=!1,this.revision=0,this.togglePanel=()=>{if(this.panelOpened){this.closePanel();return}this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick)},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1},this.reset=()=>{Bo(this.scope),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}get prefs(){return ss(this.scope)??{hidden:[],order:[]}}effectiveEntries(e){return is(this.columns,{hidden:[],order:e.order})}commit(e){Fo(this.scope,e),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}toggleVisibility(e){const t=this.prefs,r=t.hidden.includes(e)?t.hidden.filter(a=>a!==e):[...t.hidden,e];this.commit({...t,hidden:r})}move(e,t){const r=this.prefs,a=[...this.effectiveEntries(r)],s=a.findIndex(d=>d.id===e);if(s<0)return;let o=s+t;for(;o>=0&&o<a.length&&a[o].protected;)o+=t;if(o<0||o>=a.length)return;const n=a[s];a[s]=a[o],a[o]=n,this.commit({...r,order:a.map(d=>d.id)})}render(){this.revision;const e=this.prefs,t=this.effectiveEntries(e).filter(a=>!a.protected);if(t.length===0)return i``;const r=e.hidden.length>0||e.order.length>0;return i`
            <div class="chooser">
                <button
                    class="trigger ${r?"active":""}"
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
                ${this.panelOpened?i`
                    <div class="panel" role="menu">
                        <div class="panel-title">Columns</div>
                        ${t.map((a,s)=>{const o=e.hidden.includes(a.id);return i`
                                <div class="row" data-column-id="${a.id}">
                                    <label class="row-label">
                                        <input
                                            type="checkbox"
                                            .checked="${!o}"
                                            @change="${()=>this.toggleVisibility(a.id)}"
                                        />
                                        <span class="${o?"muted":""}">${a.label||a.id}</span>
                                    </label>
                                    <button class="move" type="button" title="Move up" aria-label="Move ${a.label||a.id} up"
                                        ?disabled="${s===0}"
                                        @click="${()=>this.move(a.id,-1)}">↑</button>
                                    <button class="move" type="button" title="Move down" aria-label="Move ${a.label||a.id} down"
                                        ?disabled="${s===t.length-1}"
                                        @click="${()=>this.move(a.id,1)}">↓</button>
                                </div>
                            `})}
                        <div class="footer">
                            <button class="reset" type="button" ?disabled="${!r}" @click="${this.reset}">Reset</button>
                        </div>
                    </div>
                `:l}
            </div>
        `}};wt.styles=$`
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
    `;mr([u()],wt.prototype,"columns",2);mr([u()],wt.prototype,"scope",2);mr([b()],wt.prototype,"panelOpened",2);mr([b()],wt.prototype,"revision",2);wt=mr([x("mateu-column-chooser")],wt);var Vo=Object.defineProperty,Wo=Object.getOwnPropertyDescriptor,hr=(e,t,r,a)=>{for(var s=a>1?void 0:a?Wo(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Vo(t,r,s),s};let kt=class extends C{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has("totalElements")||e.has("pageSize"))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return l;const e=this.totalPages>1,t=this.pageNumber,r=t===0,a=t>=this.totalPages-1;return i`
            <div class="bar">
                ${e?i`
                    <button class="nav" title="First page" ?disabled="${r}"
                        @click="${()=>this.dispatch(0)}" data-testid="page-first">«</button>
                    <button class="nav" title="Previous page" ?disabled="${r}"
                        @click="${()=>this.dispatch(t-1)}" data-testid="page-prev">‹</button>
                    <span class="page-indicator">Page ${t+1} of ${this.totalPages}</span>
                    <button class="nav" title="Next page" ?disabled="${a}"
                        @click="${()=>this.dispatch(t+1)}" data-testid="page-next">›</button>
                    <button class="nav" title="Last page" ?disabled="${a}"
                        @click="${()=>this.dispatch(this.totalPages-1)}" data-testid="page-last">»</button>
                    <span class="separator"></span>
                `:l}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?"":"s"}</span>
                <slot></slot>
            </div>
        `}};kt.styles=$`
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
    `;hr([u()],kt.prototype,"totalElements",2);hr([u()],kt.prototype,"pageSize",2);hr([u()],kt.prototype,"pageNumber",2);hr([b()],kt.prototype,"totalPages",2);kt=hr([x("mateu-pagination")],kt);const Vt="var(--lumo-space-m, 1rem)",Go=(e,t,r,a,s,o,n)=>{const d=t.metadata,c=d.columnWidth||"13rem";let h=`display: grid; grid-template-columns: ${d.maxColumns&&d.maxColumns>0?`repeat(${d.maxColumns}, minmax(0, 1fr))`:`repeat(auto-fill, minmax(min(100%, ${c}), 1fr))`}; gap: ${Vt} var(--lumo-space-l, 1.5rem); align-items: start;`;return d.labelsAside&&(h+=" --mateu-label-width: 10rem;"),d.fullWidth&&(h+=" width: 100%;"),h+=t.style??"",i`
        <div style="${h}" class="${t.cssClasses}" slot="${t.slot||l}">
            ${t.children?.map(f=>ns(d,e,f,r,a,s,o,n))}
        </div>
    `},ns=(e,t,r,a,s,o,n,d)=>{if(r.type==Y.ClientSide&&r.metadata?.type==m.FormRow)return Jo(e,t,r,a,s,o,n,d);const c=Ko(r),p=e.labelsAside?Yo(t,r,a,s,o,n,d):w(t,r,a,s,o,n,d);return i`<div style="grid-column: span ${c}; min-width: 0;">${p}</div>`},Ko=e=>{if(e.type==Y.ClientSide){const t=e.metadata;if(t?.type==m.FormField)return t.colspan||1}return 1},Yo=(e,t,r,a,s,o,n)=>{if(t.type==Y.ClientSide&&t.metadata?.type==m.FormField&&t.metadata.label){const d=t.metadata,c=d.label?.includes("${")?e._evalTemplate(d.label):d.label;return i`
            <div style="display: flex; gap: ${Vt}; align-items: baseline;">
                <label style="flex: 0 0 var(--mateu-label-width, 10rem); color: var(--lumo-secondary-text-color, #667);">${c}</label>
                <div style="flex: 1; min-width: 0;">${w(e,t,r,a,s,o,n,!0)}</div>
            </div>
        `}return w(e,t,r,a,s,o,n)},Jo=(e,t,r,a,s,o,n,d)=>i`
        <div style="grid-column: 1 / -1; display: flex; gap: ${Vt}; flex-wrap: wrap;">
            ${r.children?.map(c=>i`<div style="flex: 1 1 ${100/Math.max(1,r.children.length)}%; min-width: min(100%, 13rem);">${ns(e,t,c,a,s,o,n,d)}</div>`)}
        </div>
    `,ls=(e,t,r,a,s,o,n,d)=>{const c=r.metadata;let p=`display: flex; flex-direction: ${e};`;c.spacing&&(p+=` gap: ${Vt};`),c.padding&&(p+=" padding: var(--lumo-space-m, 1rem);"),c.wrap&&(p+=" flex-wrap: wrap;"),c.fullWidth&&(p+=" width: 100%;"),c.justification&&(p+=` justify-content: ${c.justification};`);const h=e==="row"?c.verticalAlignment:c.horizontalAlignment;return h&&(p+=` align-items: ${h};`),p+=r.style??"",i`
        <div style="${p}" class="${r.cssClasses}" slot="${r.slot??l}">
            ${r.children?.map(f=>w(t,f,a,s,o,n,d))}
        </div>
    `},Xo=(e,t,r,a,s,o,n)=>ls("row",e,t,r,a,s,o,n),Qo=(e,t,r,a,s,o,n)=>ls("column",e,t,r,a,s,o,n),Zo=(e,t,r,a,s,o,n)=>{const d=t.metadata;let p=`display: flex; flex-direction: ${d.orientation==="vertical"?"column":"row"}; gap: var(--lumo-space-s, 0.5rem);`;return d.fullWidth&&(p+=" width: 100%;"),p+=t.style??"",i`
        <div style="${p}" class="${t.cssClasses}" slot="${t.slot??l}">
            <div style="flex: 1; min-width: 0; min-height: 0;">${w(e,t.children[0],r,a,s,o,n)}</div>
            <div style="flex: 1; min-width: 0; min-height: 0;">${w(e,t.children[1],r,a,s,o,n)}</div>
        </div>
    `},ei=(e,t,r,a,s,o,n)=>{const d=t.children&&t.children.length>1?t.children[1]:null,c=s?.detailComponent??null,p=!!s?.hasDetail||!!d,h=c??d;return i`
        <div style="display: flex; gap: var(--lumo-space-m, 1rem); ${t.style??""}" class="${t.cssClasses}" slot="${t.slot??l}">
            <div style="flex: 1; min-width: 0;">${w(e,t.children[0],r,a,s,o,n)}</div>
            ${p&&h?i`<div style="flex: 1; min-width: 0;">${w(e,h,r,a,s,o,n)}</div>`:i`<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem);">Select an item to view details</div>`}
        </div>
    `},ti=(e,t,r,a,s,o,n)=>{let d=t.style??"";t.metadata.fullWidth&&(d+=" width: 100%;");const c=Math.max(0,(t.children??[]).findIndex(p=>p.metadata.active));return i`
        <div style="${d}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map((p,h)=>{const f=p,v=f.metadata.label,y=v?.includes("${")?e._evalTemplate(v):v;return i`
                    <details ?open="${h===c}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));">
                        <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600;">${y}</summary>
                        <div style="padding: var(--lumo-space-m, 1rem) 0;">
                            ${f.children?.map(S=>w(e,S,r,a,s,o,n))}
                        </div>
                    </details>
                `})}
        </div>
    `},ri=(e,t,r,a,s,o,n)=>{const d=t.metadata;let c=t.style??"";return d.fullWidth&&(c+=" width: 100%;"),i`
        <div style="${c}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(p=>ai(e,p,r,a,s,o,n,d.variant))}
        </div>
    `},ai=(e,t,r,a,s,o,n,d)=>{const c=t.metadata,p=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return i`
        <details ?open="${c.active}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); ${t.style??""}" class="${t.cssClasses}">
            <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600; ${c.disabled?"pointer-events: none; opacity: .5;":""}">${p}</summary>
            <div style="padding: var(--lumo-space-s, .5rem) 0;">
                ${t.children?.map(h=>w(e,h,r,a,s,o,n))}
            </div>
        </details>
    `},si=(e,t,r,a,s,o,n)=>i`
        <div style="overflow: auto; ${t.style??""}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(d=>w(e,d,r,a,s,o,n))}
        </div>
    `,oi=(e,t,r,a,s,o,n)=>i`
        <div style="width: 100%; ${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(d=>w(e,d,r,a,s,o,n))}
        </div>
    `,ii=(e,t,r,a,s,o,n)=>i`
        <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(d=>w(e,d,r,a,s,o,n))}
        </div>
    `,ni=(e,t,r,a,s,o,n)=>i`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: ${Vt}; ${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(d=>w(e,d,r,a,s,o,n))}
        </div>
    `,li=(e,t,r,a,s,o,n)=>i`
        <div style="display: flex; gap: ${Vt}; flex-wrap: wrap; ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(d=>w(e,d,r,a,s,o,n))}
        </div>
    `,di=(e,t,r,a,s,o,n)=>{const d=t.metadata;return i`
        <div style="flex: ${d.boardCols??1} 1 0; min-width: min(100%, 12rem); ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(c=>w(e,c,r,a,s,o,n))}
        </div>
    `},ci=(e,t,r,a,s,o,n)=>{const d=t.metadata;return i`
        <div
                style="display: flex; flex-direction: column; overflow: auto; ${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??l}"
        >
            ${d.page.content.map(c=>w(e,c,r,a,s,o,n))}
        </div>
    `},ui=e=>{const t=e.metadata;return(t?.content??t?.columns??[]).filter(a=>a&&a.metadata).map(a=>{const s=a.metadata;return{id:a.id??"",label:s?.label??a.id??"",autoWidth:s?.autoWidth,width:s?.width}})},_a=(e,t)=>{const r=e?.[t];return r==null?"":typeof r=="object"?r.text??r.label??r.value??"":String(r)},ta=(e,t,r)=>{const a=ui(e),s="text-align:left; padding:.45rem .6rem; border-bottom:2px solid var(--lumo-contrast-20pct,rgba(0,0,0,.2)); font-weight:600; white-space:nowrap; color: var(--lumo-secondary-text-color,#556);",o="padding:.4rem .6rem; border-bottom:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.08)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:24rem;";return i`
        <div style="overflow:auto; width:100%; ${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
            <table style="border-collapse:collapse; width:100%; font-size: var(--lumo-font-size-s,.875rem);">
                <thead><tr>${a.map(n=>i`<th style="${s}">${n.label}</th>`)}</tr></thead>
                <tbody>
                    ${(t??[]).length===0?i`<tr><td colspan="${Math.max(1,a.length)}" style="padding:1.5rem; text-align:center; color: var(--lumo-secondary-text-color,#888);">${r??"No data."}</td></tr>`:t.map(n=>i`<tr>${a.map(d=>i`<td style="${o}" title="${_a(n,d.id)}">${_a(n,d.id)}</td>`)}</tr>`)}
                </tbody>
            </table>
        </div>
    `},Ea=(e,t)=>{const r=e.metadata;return e.id&&t&&t[e.id]?t[e.id]:r?.page?.content??[]},pi=e=>{const r=e.metadata.items??[];return i`
        <div class="mateu-message-list ${e.cssClasses??""}"
             style="display:flex; flex-direction:column; gap:.75rem; ${e.style??""}"
             slot="${e.slot??l}">
            ${r.map(a=>i`
                <div style="display:flex; gap:.6rem; align-items:flex-start;">
                    <span style="flex:0 0 auto; width:2rem; height:2rem; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:.8rem; background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);">
                        ${a.userImg?i`<img src="${a.userImg}" alt="" style="width:100%; height:100%; object-fit:cover;">`:a.userAbbr??(a.userName?a.userName.charAt(0):"?")}
                    </span>
                    <div style="min-width:0;">
                        <div style="display:flex; gap:.5rem; align-items:baseline;">
                            ${a.userName?i`<span style="font-weight:600;">${a.userName}</span>`:l}
                            ${a.time?i`<span style="font-size:var(--lumo-font-size-xs,.75rem); color:var(--lumo-secondary-text-color,#666);">${a.time}</span>`:l}
                        </div>
                        <div style="white-space:pre-wrap; overflow-wrap:anywhere;">${a.text}</div>
                    </div>
                </div>
            `)}
        </div>
    `},ds=(e,t,r,a,s,o,n)=>t.separator?i`<span style="align-self: stretch; width: 1px; background: var(--lumo-contrast-20pct, rgba(0,0,0,.2));"></span>`:t.submenus?i`
            <details style="position: relative;">
                <summary style="cursor: pointer; list-style: none; padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);">
                    ${t.component?w(e,t.component,r,a,s,o,n):t.label} ▾
                </summary>
                <div style="display: flex; flex-direction: column; gap: .1rem; padding: .3rem; min-width: 10rem;
                            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px);
                            background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15));">
                    ${t.submenus.map(d=>ds(e,d,r,a,s,o,n))}
                </div>
            </details>
        `:i`
        <span class="${t.className??""}"
              style="cursor: ${t.disabled?"default":"pointer"}; opacity: ${t.disabled?.5:1};
                     padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
                     ${t.selected?"background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));":""}">
            ${t.component?w(e,t.component,r,a,s,o,n):t.label}
        </span>
    `,mi=(e,t,r,a,s,o,n)=>{const d=t.metadata;return i`
        <div style="display: flex; flex-wrap: wrap; gap: .25rem; align-items: center; ${t.style}"
             class="${t.cssClasses}" slot="${t.slot??l}">
            ${d.options?.map(c=>ds(e,c,r,a,s,{},{}))}
        </div>
    `},hi=(e,t,r,a,s,o,n)=>{const d=t.metadata;return i`
        <div style="${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${w(e,d.wrapped,r,a,s,o,n)}
        </div>
    `},fi=(e,t,r,a,s,o,n)=>{const d=t.metadata,c=d.content?.metadata,p=c?.type==m.Notice&&c.fullWidth===!0;return i`
        <div style="display:flex; flex-direction:column; ${p?"width: 100%; ":""}${t.style}"
             class="${t.cssClasses}"
             slot="${t.slot??l}"
             data-colspan="${d.colspan||(p?99:l)}"
        >
            ${d.label?i`<label style="font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${d.label}</label>`:l}
            ${w(e,d.content,r,a,s,o,n)}
        </div>
            `},vi=e=>{const t=e.metadata,r=a=>{const s=a.closest(".mateu-message-input")?.querySelector("input"),o=s?.value??"";!t.actionId||!o.trim()||(a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:o}},bubbles:!0,composed:!0})),s&&(s.value=""))};return i`
        <div class="mateu-message-input ${e.cssClasses??""}"
             style="display:flex; gap:.5rem; align-items:center; ${e.style??""}"
             slot="${e.slot??l}">
            <input type="text"
                   style="flex:1; min-width:0; font:inherit; padding:.5rem .75rem; border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16)); border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513);"
                   @keydown="${a=>{a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),r(a.currentTarget))}}">
            <button style="font:inherit; font-weight:500; cursor:pointer; padding:.5rem 1rem; border:none; border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);"
                    @click="${a=>r(a.currentTarget)}">Send</button>
        </div>
    `},bi=(e,t,r,a,s,o,n)=>{const d=t.metadata;return i`<span title="${d.text}" style="${t.style}" class="${t.cssClasses}" slot="${t.slot??l}"
        >${w(e,d.wrapped,r,a,s,o,n)}</span>`},gi=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const r in e){const a=e[r];["number","string","boolean"].indexOf(typeof a)>=0&&(t[r]=e[r])}return t},Ia=(e,t,r)=>{for(let a in t.attributes)e.setAttribute(a,t.attributes[a]);r.style&&e.setAttribute("style",r.style),r.cssClasses&&e.setAttribute("class",r.cssClasses),r.slot&&e.setAttribute("slot",r.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},yi=e=>{const t=e.name,r=e.attributes?e.attributes.import:void 0;r&&t.includes("-")&&!customElements.get(t)&&import(r)},$i=(e,t,r)=>{yi(t);let a=t.name;return t.attributes&&t.attributes.id&&(a="#"+t.attributes.id),setTimeout(()=>{const s=e.shadowRoot?.querySelector(".element-container")?.querySelector(a);if(s){for(;s.firstChild;)s.removeChild(s.lastChild);Ia(s,t,r)}else{const o=document.createElement(t.name);Ia(o,t,r);for(let n in t.on)o.addEventListener(n,d=>{const c=gi(d);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[n],parameters:{event:c}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(".element-container")?.appendChild(o)}}),i`<div class="element-container"></div>`};var Re=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(Re||{});const xi=(e,t,r,a,s)=>{const o=e.metadata,n=o.attributes?.["data-colspan"],d=ar(o.text,t,r,a,s),c={xl:"var(--lumo-font-size-xl, 1.375rem)",l:"var(--lumo-font-size-l, 1.125rem)",s:"var(--lumo-font-size-s, .875rem)",xs:"var(--lumo-font-size-xs, .8125rem)"},p=(o.size&&c[o.size]?`font-size: ${c[o.size]}; `:"")+(o.noMargins?"margin-block-start: 0; margin-block-end: 0; ":"");return Re.h1==o.container?i`
            <h1 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h1>
        `:Re.h2==o.container?i`
            <h2 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h2>
        `:Re.h3==o.container?i`
            <h3 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h3>
        `:Re.h4==o.container?i`
            <h4 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h4>
        `:Re.h5==o.container?i`
            <h5 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h5>
        `:Re.h6==o.container?i`
            <h6 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h6>
        `:Re.p==o.container?i`
               <p style="${p}${e.style}" class="${e.cssClasses}"
                  id="${D(e.id)}"
                  data-colspan="${D(n)}"
                  slot="${e.slot??l}">
                   ${d??l}
               </p>
            `:Re.div==o.container?i`
               <div style="${p}${e.style}" class="${e.cssClasses}"
                    id="${D(e.id)}"
                    data-colspan="${D(n)}"
                    slot="${e.slot??l}">${d?Ue(d):l}</div>
            `:Re.span==o.container?i`
               <span style="${p}${e.style}" class="${e.cssClasses}"
                     id="${D(e.id)}"
                     data-colspan="${D(n)}"
                    slot="${e.slot??l}">${d??l}</span>
            `:i`
               <p
                       id="${D(e.id)}"
                       data-colspan="${D(n)}"
                       slot="${e.slot??l}">
                   Unknown text container: ${o.container} 
               </p>
            `},wi=e=>{const t=e.metadata;return i`<a href="${t.url}" target="${t.target??l}"
                   rel="${t.target==="_blank"?"noopener":l}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??l}">${t.text}</a>`},ki=(e,t)=>{const r=e.toLowerCase().split("+");return t.ctrlKey===r.includes("ctrl")&&t.altKey===r.includes("alt")&&t.shiftKey===r.includes("shift")&&t.metaKey===r.includes("meta")},Ci=(e,t)=>{if(!ki(e,t))return!1;const r=e.toLowerCase().split("+"),a=r[r.length-1];return!!(t.key.toLowerCase()===a||/^[a-z]$/.test(a)&&t.code==="Key"+a.toUpperCase()||/^[0-9]$/.test(a)&&(t.code==="Digit"+a||t.code==="Numpad"+a))},Si=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,_i=(e,t)=>{const r=e.currentTarget.dataset.actionId;e.currentTarget?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r,parameters:t.parameters},bubbles:!0,composed:!0}))},Ei="display:inline-flex; align-items:center; justify-content:center; gap:.4em; box-sizing:border-box; font:inherit; font-weight:500; cursor:pointer; border-radius:var(--lumo-border-radius-m,6px); border:1px solid transparent; line-height:1; white-space:nowrap;",Ii=e=>{const t=e.buttonStyle??"",r=e.color&&e.color!=="none"&&e.color!=="normal"?e.color:"",a=e.size,s=r==="success"?"var(--lumo-success-color,#1a7f37)":r==="error"?"var(--lumo-error-color,#c5221f)":r==="contrast"?"var(--lumo-contrast,#161513)":"var(--lumo-primary-color,#3b5bdb)",o=r==="success"?"var(--lumo-success-contrast-color,#fff)":r==="error"?"var(--lumo-error-contrast-color,#fff)":r==="contrast"?"var(--lumo-base-color,#fff)":"var(--lumo-primary-contrast-color,#fff)",n=r==="success"?"var(--lumo-success-text-color,#1a7f37)":r==="error"?"var(--lumo-error-text-color,#c5221f)":r==="contrast"?"var(--lumo-body-text-color,#161513)":"var(--lumo-primary-text-color,#3b5bdb)";let d;return t==="primary"?d=`background:${s}; color:${o};`:t==="tertiary"||t==="tertiaryInline"?d=`background:transparent; color:${n};`:d=`background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:${n}; border-color:var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,`${Ei}${d}${a==="small"?"padding:.25rem .6rem; font-size:var(--lumo-font-size-s,.875rem);":a==="large"?"padding:.65rem 1.4rem; font-size:var(--lumo-font-size-l,1.125rem);":"padding:.45rem 1rem; font-size:var(--lumo-font-size-m,1rem);"}`},Pi=(e,t,r)=>{const a=e.metadata,s=zt(a.label,t,r);return i`<button
            id="${e.id}"
            data-action-id="${a.actionId}"
            @click="${o=>_i(o,a)}"
            style="${Ii(a)}${e.style}"
            class="${e.cssClasses}"
            ?disabled="${a.disabled}"
            title="${a.shortcut?`${s} (${Si(a.shortcut)})`:l}"
            slot="${e.slot??l}"
    >${a.iconOnLeft?H(a.iconOnLeft):l}${s}${a.iconOnRight?H(a.iconOnRight):l}</button>`},Oi="display:block; box-sizing:border-box; background:var(--lumo-base-color,#fff); border:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.1)); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-xs,0 1px 3px rgba(0,0,0,.08)); overflow:hidden;",Ti=(e,t,r,a,s,o,n)=>{const d=t.metadata;if(!d)return i``;const c=h=>h?w(e,h,r,a,s,o,n,!1):l,p=d.header||d.headerPrefix||d.headerSuffix||d.title||d.subtitle;return i`
        <div style="${Oi}${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${d.media?c(d.media):l}
            ${p?i`<div style="display:flex; align-items:flex-start; gap:.75rem; padding:1rem 1.25rem ${d.content||d.footer?"0":"1rem"};">
                ${d.headerPrefix?c(d.headerPrefix):l}
                <div style="flex:1; min-width:0;">
                    ${d.header?c(d.header):l}
                    ${d.title?i`<div style="font-weight:600; font-size:1.05rem; color:var(--lumo-body-text-color,#161513);">${c(d.title)}</div>`:l}
                    ${d.subtitle?i`<div style="color:var(--lumo-secondary-text-color,#667);">${c(d.subtitle)}</div>`:l}
                </div>
                ${d.headerSuffix?c(d.headerSuffix):l}
            </div>`:l}
            ${d.content?i`<div style="padding:1rem 1.25rem;">${c(d.content)}</div>`:l}
            ${d.footer?i`<div style="padding:0 1.25rem 1rem;">${c(d.footer)}</div>`:l}
        </div>
    `},zi=e=>{const t=e.metadata;return i`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??l}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},Ai=e=>{const t=e.metadata;return H(t.icon,e.style,e.cssClasses,e.slot)},Xr=(e,t)=>{e&&e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},cs="font:inherit; font-weight:500; cursor:pointer; padding:.45rem 1rem; border-radius:var(--lumo-border-radius-m,6px);",Pa=`${cs} background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:var(--lumo-body-text-color,#161513); border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,Li=`${cs} background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff); border:1px solid transparent;`,Di=(e,t,r,a,s,o,n)=>{const d=t.metadata;let c=!1;if(d.openedCondition)try{c=Xa(d.openedCondition,a,s,o,n)}catch(p){console.error("when evaluating "+d.openedCondition+" :"+p+", where data is "+s+" and state is "+a)}return c?i`
        <div class="mateu-confirm-dialog ${t.cssClasses??""}"
             style="position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.4); ${t.style??""}"
             slot="${t.slot??l}">
            <div style="background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-l,0 8px 24px rgba(0,0,0,.2)); width:100%; max-width:min(90vw,32rem); padding:1.5rem; box-sizing:border-box;">
                ${d.header?i`<h3 style="margin:0 0 .75rem; font-size:1.15rem;">${d.header}</h3>`:l}
                <div>${t.children?.map(p=>w(e,p,r,a,s,o,n))}</div>
                <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:1.25rem;">
                    ${d.canCancel?i`<button style="${Pa}" @click="${p=>Xr(p.currentTarget,d.cancelActionId)}">${d.rejectText&&!d.canReject?d.rejectText:"Cancel"}</button>`:l}
                    ${d.canReject?i`<button style="${Pa}" @click="${p=>Xr(p.currentTarget,d.rejectActionId)}">${d.rejectText||"No"}</button>`:l}
                    <button style="${Li}" @click="${p=>Xr(p.currentTarget,d.confirmActionId)}">${d.confirmText||"OK"}</button>
                </div>
            </div>
        </div>
    `:i``},Ri=e=>{const t=e.metadata;let r;return t.position&&(r={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),i`
        <mateu-cookie-consent style="${e.style}" class="${e.cssClasses}"
                               slot="${e.slot??l}"
                               position="${r??l}"
                               cookie-name="${t.cookieName??l}"
                               .message="${t.message??l}"
                               theme="${t.theme??l}"
                               .learnMore="${t.learnMore??l}"
                               .learnMoreLink="${t.learnMoreLink??l}"
                               .dismiss="${t.dismiss??l}"
        ></mateu-cookie-consent>
    `},Ui=(e,t,r,a,s,o,n)=>{const d=t.metadata;return i`
        <details
                ?open="${d.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??l}"
        >
            <summary>${w(e,d.summary,r,a,s,o,n)}</summary>
            ${w(e,d.content,r,a,s,o,n)}
        </details>
            `},ji=(e,t,r,a,s,o)=>i`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${r}"
            .xdata="${a}"
            .appState="${s}"
            .appdata="${o}"
        ></mateu-dialog>
            `,Mi=(e,t,r,a,s,o)=>i`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${r}"
            .xdata="${a}"
            .appState="${s}"
            .appdata="${o}"
        ></mateu-drawer>
            `,Ni=e=>{const t=e.metadata;return i`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"  
                  route="${t.route}" 
                  consumedRoute="${t.consumedRoute}" 
                  id="${ke()}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??l}"
        ></mateu-ux>
        </mateu-api-caller>
            `},Fi=e=>{const t=e.metadata;return i`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??l}"></mateu-markdown>
            `},Bi=e=>{const t=e.metadata;return i`
        <div
            role="status"
            slot="${e.slot??l}"
            class="${e.cssClasses}"
            style="display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem;
                   border-radius: var(--lumo-border-radius-m, 8px);
                   background: var(--lumo-contrast-5pct, rgba(0,0,0,0.05));
                   color: var(--lumo-body-text-color, #1a1a1a); ${e.style}"
        >
            ${t.title?i`<strong>${t.title}</strong>`:l}
            ${t.text?i`<span>${t.text}</span>`:l}
        </div>
    `},qi=(e,t={})=>{const r=e.metadata,a=r.valueKey?t[r.valueKey]:r.value,s=r.max&&r.max!=0?r.max:1,o=!r.indeterminate&&a!=null;return i`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
            <progress
                    style="width:100%;"
                    max="${s}"
                    .value="${o?a:l}"
            ></progress>
            ${r.text?i`<span class="text-secondary text-xs" id="sublbl">
    ${r.text}
  </span>`:l}
        </div>
    `},Hi=(e,t,r,a,s,o,n)=>{const d=t.metadata;return i`
        <details style="position: relative; ${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            <summary style="list-style: none; cursor: pointer;">${w(e,d.wrapped,r,a,s,o,n)}</summary>
            <div style="position: absolute; z-index: 100; min-width: 300px; margin-top: .25rem; padding: .6rem .8rem;
                        border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px);
                        background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.2));">
                ${w(e,d.content,r,a,s,o,n)}
            </div>
        </details>
    `},Vi=e=>{const t=e.metadata;return i`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??l}"></mateu-map>
            `},Wi=e=>{const t=e.metadata;return i`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??l}">
            `},Gi=e=>{const t=e.metadata;return i`<div style="display:flex; align-items:center; gap:0.5rem;" slot="${e.slot??l}">
        ${t.breadcrumbs.map(r=>i`
            <a href="${r.link}">${r.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </div>`},Ki=(e,t,r,a,s,o,n)=>{const d=t.metadata;return i`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${d.dots}" 
                ?nav = "${d.nav}" 
                ?loop = "${d.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>i`<div>${w(e,c,r,a,s,o,n)}</div>`)}
        </skeleton-carousel>
    `},Yi=(e,t,r,a)=>{const s=e.metadata;return i`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
            ${s.menu.map(o=>us(o))}
        </div>
            `},us=e=>i`
        ${e.submenus?i`
                <details open>
                    <summary>${e.label}</summary>
                    <div style="display:flex; flex-direction:column; gap:0.25rem; padding-left:0.5rem;">
                        ${e.submenus.map(t=>us(t))}
                    </div>
                </details>
            `:i`
                <a href="${e.path}">${e.label}</a>
        `}
        `,Ji=(e,t,r,a,s,o,n)=>{const d=t.metadata;return i`<div
                slot="${t.slot??l}"
                style="${t.style}" class="${t.cssClasses}"
        >${d.content?Ue(d.content):l}${t.children?.map(c=>w(e,c,r,a,s,o,n))}</div>
    `},Xi=(e,t,r,a,s,o,n)=>{const d=t.metadata,c=d.title?.includes("${")?e._evalTemplate(d.title):d.title;return i`<div
                slot="${t.slot??l}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?i`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${c}</div>`:l}
        ${t.children?.map(p=>w(e,p,r,a,s,o,n))}
    </div>
    `},Qi=(e,t,r,a,s,o,n)=>{const d=t.metadata,c=d.title?.includes("${")?e._evalTemplate(d.title):d.title;return i`
        <div
                slot="${t.slot??l}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(p=>w(e,p,r,a,s,o,n))}</div>
    `},Zi=(e,t,r)=>{r.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:e,value:t},bubbles:!0,composed:!0}))},$r=e=>t=>{const r=t.target,a=r.type==="checkbox"?r.checked:r.value;Zi(e.fieldId,a,r)},en=(e,t)=>{const r=e.metadata,a=t?.[r.fieldId]??"",s=r,o=s.dataType,n=s.stereotype,d=!!s.readOnly,c=!!s.disabled,p=s.options,h=r.label?i`<label style="display:block; font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${r.label}</label>`:l,f="width:100%; box-sizing:border-box; padding:.4rem .6rem; border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.3)); border-radius: var(--lumo-border-radius-m,6px); font:inherit; background: var(--lumo-base-color,#fff); color: var(--lumo-body-text-color,#1a1a1a);";let v;return d||n==="plainText"?v=i`<div style="padding:.4rem 0;">${String(a??"")}</div>`:o==="boolean"||n==="checkbox"||n==="badge"?v=i`<input type="checkbox" ?checked="${!!a}" ?disabled="${c}" @change="${$r(r)}">`:p&&p.length?v=i`
            <select style="${f}" ?disabled="${c}" @change="${$r(r)}">
                <option value="">—</option>
                ${p.map(y=>i`<option value="${y.value}" ?selected="${y.value===a}">${y.label}</option>`)}
            </select>`:n==="textarea"||n==="richText"||n==="html"?v=i`<textarea style="${f}" rows="3" ?disabled="${c}" @input="${$r(r)}">${String(a??"")}</textarea>`:v=i`<input type="${o==="integer"||o==="number"||o==="double"||o==="money"?"number":o==="date"?"date":o==="datetime"?"datetime-local":o==="time"?"time":n==="password"?"password":o==="email"?"email":"text"}" style="${f}" .value="${String(a??"")}"
                              placeholder="${s.placeholder??l}" ?disabled="${c}" @input="${$r(r)}">`,i`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
            ${h}
            ${v}
        </div>
    `},ra=(e,t,r,a,s,o,n,d)=>{const c=t.metadata,p=c?.fabs??[];return i`<mateu-page
            .component="${t}"
            baseUrl="${r}"
            .state="${a}"
            .data="${s}"
            .appState="${o}"
            .appdata="${n}"
            slot="${t.slot??l}"
            style="${t.style}"
            class="${t.cssClasses}"
            ?standalone="${d??!1}"
    >
        ${t.children?.map(h=>w(e,h,r,a,s,o,n))}
        ${c?.buttons?.map(h=>i`
                   ${w(e,{id:h.actionId,metadata:h,type:Y.ClientSide,slot:"buttons"},void 0,a,s,o,n)}
`)}
        ${p.map((h,f)=>i`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+f*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:h.actionId},bubbles:!0,composed:!0}))}"
                title="${h.label}">
                ${H(h.icon)}
            </button>
        `)}
</mateu-page>
    `},aa=(e,t,r,a,s,o,n,d)=>i`<mateu-table-crud
            id="${t.id}"
            baseUrl="${r}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${a}"
            .data="${s}"
            .appState="${o}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??l}"
            ?standalone="${d??!1}"
    >
        ${t.children?.map(c=>w(e,c,r,a,s,o,n))}
    </mateu-table-crud>`,tn=e=>{const t=e.metadata;return i`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??l}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},rn=(e,t,r)=>{const a=e.metadata;return i`<mateu-chat sseUrl="${a.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??l}"></mateu-chat>`},an=e=>{const t=e.metadata;return i`
        <mateu-workflow
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},sn=e=>{const t=e.metadata;return i`
        <mateu-form-editor
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},ps=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,on=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",nn=e=>e=="up"?"▲":e=="down"?"▼":"",ln=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},dn=e=>{const t=e.metadata,r=!!t.actionId;return i`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${ps} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${r?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??l}"
             role="${r?"button":l}"
             @click="${a=>ln(a,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?H(t.icon,"color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;"):l}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?i`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:l}
            </div>
            ${t.trend||t.trendLabel?i`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${on(t.trend)};">
                    ${nn(t.trend)} ${t.trendLabel??l}
                </span>
            `:l}
            ${t.description?i`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:l}
        </div>
    `},cn=(e,t,r,a,s,o,n)=>i`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${t.children?.map(d=>w(e,d,r,a,s,o,n))}
        </div>
    `,un=(e,t,r,a,s,o,n)=>{const d=t.metadata,c=d.colSpan&&d.colSpan>1?`grid-column: span ${d.colSpan};`:"",p=d.rowSpan&&d.rowSpan>1?`grid-row: span ${d.rowSpan};`:"";return i`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${ps} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${p} ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${d.title?i`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${d.title}</h3>
                    ${d.subtitle?i`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${d.subtitle}</span>`:l}
                </div>
            `:l}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(h=>w(e,h,r,a,s,o,n))}
            </div>
        </div>
    `},pn=(e,t,r,a,s,o,n)=>{const d=t.metadata,c=d.columns&&d.columns>0?`repeat(${d.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return i`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${t.children?.map(p=>w(e,p,r,a,s,o,n))}
        </div>
    `};var mn=Object.defineProperty,hn=Object.getOwnPropertyDescriptor,Xe=(e,t,r,a)=>{for(var s=a>1?void 0:a?hn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&mn(t,r,s),s};let Ce=class extends C{constructor(){super(...arguments),this.panels=[],this.headerTitle="",this.badges=[],this.orientation="vertical",this.navigation=null,this.overviewEditActionId="",this.openPanels=new Set,this.expandedPanel=null,this._onPopState=()=>{const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),r=this.panels.findIndex((a,s)=>this.panelAnchor(a,s)===t);this.expandedPanel=r>=0?r:null}else this.expandedPanel=null},this.initialized=!1}navAction(e){e&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),window.addEventListener("popstate",this._onPopState)}disconnectedCallback(){window.removeEventListener("popstate",this._onPopState),super.disconnectedCallback()}willUpdate(){if(!this.initialized&&this.panels.length){this.openPanels=new Set(this.panels.map((t,r)=>t.open?r:-1).filter(t=>t>=0));const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),r=this.panels.findIndex((a,s)=>this.panelAnchor(a,s)===t);r>=0&&(this.expandedPanel=r)}else if(e){const t=this.panels.findIndex((r,a)=>this.panelAnchor(r,a)===e);t>=0&&this.openPanels.add(t)}this.initialized=!0}}firstUpdated(){const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(!e)return;const t=this.renderRoot.querySelector(`[data-anchor="${CSS.escape(e)}"]`);t&&t.scrollIntoView({block:"nearest"})}panelAnchor(e,t){return(e.title??"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`panel-${t}`}bookmarkPanel(e){const t=this.panelAnchor(this.panels[e],e);try{history.replaceState(history.state,"","#"+t)}catch{}}clearBookmark(e){const t=this.panelAnchor(this.panels[e],e);if(decodeURIComponent((location.hash||"").replace(/^#/,""))===t)try{history.replaceState(history.state,"",location.pathname+location.search)}catch{}}expandPanel(e,t){t?.stopPropagation(),this.expandedPanel=e;const r=this.panelAnchor(this.panels[e],e);try{history.pushState(history.state,"","#expand="+r)}catch{}}collapsePanel(){try{history.back()}catch{this.expandedPanel=null}}toggle(e){const t=new Set(this.openPanels);t.has(e)?(t.delete(e),this.clearBookmark(e)):(t.add(e),this.bookmarkPanel(e)),this.openPanels=t}render(){if(this.expandedPanel!=null&&this.panels[this.expandedPanel]){const t=this.panels[this.expandedPanel];return i`
                <div class="expanded-view" part="expanded-view">
                    <div class="expanded-header">
                        <button class="nav-parent" title="Back"
                                @click="${()=>this.collapsePanel()}">
                            <span>‹</span><span>Back</span>
                        </button>
                        <span class="nav-title">${t.title}</span>
                        ${t.subtitle?i`<span class="subtitle">${t.subtitle}</span>`:l}
                    </div>
                    <div class="expanded-body">
                        <slot name="panel-${this.expandedPanel}"></slot>
                    </div>
                </div>
            `}const e=this.navigation;return i`
            ${e?i`
                <div class="nav-header" part="nav-header">
                    ${e.parentActionId?i`
                        <button class="nav-parent" title="${e.parentLabel??"Back"}"
                                @click="${()=>this.navAction(e.parentActionId)}">
                            <span>‹</span><span>${e.parentLabel??"Back"}</span>
                        </button>
                    `:l}
                    ${e.title?i`<span class="nav-title">${e.title}</span>`:l}
                    <span class="nav-spacer"></span>
                    ${e.previousActionId?i`
                        <button class="nav-move" title="Previous"
                                @click="${()=>this.navAction(e.previousActionId)}">‹</button>
                    `:l}
                    ${e.nextActionId?i`
                        <button class="nav-move" title="Next"
                                @click="${()=>this.navAction(e.nextActionId)}">›</button>
                    `:l}
                </div>
            `:l}
            ${this.headerTitle?i`
                <div class="header-band" part="header-band">
                    <div class="header-content">
                        <h2 class="header-title">${this.headerTitle}</h2>
                        ${this.badges.length?i`
                            <div class="header-badges">
                                ${this.badges.map(t=>i`<span class="header-badge">${t}</span>`)}
                            </div>
                        `:""}
                    </div>
                    <div class="header-accent" part="header-accent"></div>
                </div>
            `:""}
            <div class="columns" part="columns">
                <div class="overview" part="overview">
                    ${this.overviewEditActionId?i`
                        <button class="overview-edit" title="Edit"
                                @click="${()=>this.navAction(this.overviewEditActionId)}">
                            <span>✎</span><span>Edit</span>
                        </button>
                    `:l}
                    <slot name="overview"></slot>
                </div>
                <div class="rail" part="rail">
                    ${this.panels.map((t,r)=>this.openPanels.has(r)?i`
                        <div class="panel" part="panel" data-anchor="${this.panelAnchor(t,r)}"
                             @click="${()=>this.bookmarkPanel(r)}">
                            <div class="panel-header">
                                <div>
                                    <h3>${t.title}</h3>
                                    ${t.subtitle?i`<div class="subtitle">${t.subtitle}</div>`:""}
                                </div>
                                <span class="panel-actions">
                                    <button class="panel-expand" title="Show all"
                                            @click="${a=>this.expandPanel(r,a)}">⤢</button>
                                    <button class="fold" title="Fold" @click="${a=>{a.stopPropagation(),this.toggle(r)}}">⟨</button>
                                </span>
                            </div>
                            <div style="flex: 1; min-height: 0;">
                                <slot name="panel-${r}"></slot>
                            </div>
                        </div>
                    `:i`
                        <div class="strip" role="button" title="${t.title}"
                             data-anchor="${this.panelAnchor(t,r)}" @click="${()=>this.toggle(r)}">
                            <button class="fold" tabindex="-1">⟩</button>
                            <span>${t.title}</span>
                        </div>
                    `)}
                </div>
            </div>
        `}};Ce.styles=$`
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
    `;Xe([u({type:Array})],Ce.prototype,"panels",2);Xe([u({type:String})],Ce.prototype,"headerTitle",2);Xe([u({type:Array})],Ce.prototype,"badges",2);Xe([u({type:String,reflect:!0})],Ce.prototype,"orientation",2);Xe([u({attribute:!1})],Ce.prototype,"navigation",2);Xe([u({type:String})],Ce.prototype,"overviewEditActionId",2);Xe([b()],Ce.prototype,"openPanels",2);Xe([b()],Ce.prototype,"expandedPanel",2);Ce=Xe([x("mateu-foldout")],Ce);const fn=(e,t,r,a,s,o,n)=>{const d=t.metadata;return i`
        <mateu-foldout
                .panels="${d.panels??[]}"
                .headerTitle="${d.headerTitle??""}"
                .badges="${d.badges??[]}"
                .navigation="${d.navigation??null}"
                overviewEditActionId="${d.overviewEditActionId??""}"
                orientation="${d.orientation??"vertical"}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??l}"
        >
            ${t.children?.map(c=>w(e,c,r,a,s,o,n))}
        </mateu-foldout>
    `},vn=(e,t,r,a,s,o,n)=>{const d=t.metadata,c=!!d.image,p=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${d.image}'); background-size: cover; background-position: center; color: #fff;`:"",h=d.centered===!1?"flex-start":"center",f=d.centered===!1?"left":"center";return i`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${h}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${f}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${d.height??"12rem"}; box-sizing: border-box; ${p} ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${d.title?i`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${d.title}</h1>`:l}
            ${d.subtitle?i`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${d.subtitle}</p>`:l}
            ${t.children?.length?i`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${h}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(v=>w(e,v,r,a,s,o,n))}
                </div>
            `:l}
        </div>
    `};var bn=Object.defineProperty,gn=Object.getOwnPropertyDescriptor,pa=(e,t,r,a)=>{for(var s=a>1?void 0:a?gn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&bn(t,r,s),s};const Qr=1440*60*1e3;let or=class extends C{constructor(){super(...arguments),this.tasks=[],this.onTaskSelectionActionId=""}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-Qr,max:Math.max(...e)+2*Qr}:null}months(e,t){const r=[],a=new Date(e);for(a.setDate(1);a.getTime()<=t;){const s=Math.max(a.getTime(),e),o=new Date(a.getFullYear(),a.getMonth()+1,1),n=Math.min(o.getTime(),t);r.push({label:a.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:s,to:n}),a.setMonth(a.getMonth()+1)}return r}render(){const e=this.range();if(!e)return i``;const t=e.max-e.min,r=s=>(s-e.min)/t*100,a=Date.now();return i`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(s=>i`
                        <div class="month" style="width: ${(s.to-s.from)/t*100}%;">${s.label}</div>
                    `)}
                </div>
                ${this.tasks.map(s=>{const o=new Date(s.start+"T00:00:00").getTime(),n=new Date(s.end+"T00:00:00").getTime()+Qr;return i`
                        <div class="label" title="${s.title}">${s.title}</div>
                        <div class="lane">
                            ${a>=e.min&&a<=e.max?i`<div class="today" style="left: ${r(a)}%;"></div>`:l}
                            <div class="bar ${this.onTaskSelectionActionId?"clickable":""}"
                                 title="${s.title} · ${s.start} → ${s.end}${s.progress?` · ${s.progress}%`:""}"
                                 @click="${()=>this.selectTask(s)}"
                                 style="left: ${r(o)}%; width: ${(n-o)/t*100}%; ${s.color?`--mateu-gantt-fill: ${s.color};`:""}">
                                <div class="fill" style="width: ${s.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};or.styles=$`
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
    `;pa([u({type:Array})],or.prototype,"tasks",2);pa([u()],or.prototype,"onTaskSelectionActionId",2);or=pa([x("mateu-gantt")],or);const yn=e=>{const t=e.metadata;return i`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                .onTaskSelectionActionId="${t.onTaskSelectionActionId??""}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-gantt>
    `};var $n=Object.defineProperty,xn=Object.getOwnPropertyDescriptor,ut=(e,t,r,a)=>{for(var s=a>1?void 0:a?xn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&$n(t,r,s),s};let L=class extends C{constructor(){super(...arguments),this.resources=[],this.blocks=[],this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key==="Escape"&&this.drag&&(e.stopPropagation(),this.endDrag())}}static parse(e){return new Date(e+"T00:00:00")}static iso(e){const t=r=>String(r).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){const a=L.parse(this.from),s=L.daysBetween(a,L.parse(this.to))+1;return s>0?{from:a,days:s}:null}const e=this.blocks.flatMap(a=>[a.start,a.end]).filter(a=>!!a).map(a=>L.parse(a));if(!e.length)return null;const t=new Date(Math.min(...e.map(a=>a.getTime()))),r=new Date(Math.max(...e.map(a=>a.getTime())));return{from:t,days:L.daysBetween(t,r)+1}}onBlockPointerDown(e,t,r){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;const o=L.parse(t.start),n=L.parse(t.end),d=Math.max(1,L.daysBetween(o,n)+1);this.laneRects=[...this.renderRoot.querySelectorAll(".lane[data-resource-id]")].map(p=>({resourceId:p.dataset.resourceId,rect:p.getBoundingClientRect()}));const c=this.dayAt(t.resourceId,e.clientX)??r;this.drag={blockId:t.id,duration:d,grabOffsetDays:c-r,originResourceId:t.resourceId,originStartIdx:r,targetResourceId:t.resourceId,targetStartIdx:r,moved:!1},window.addEventListener("keydown",this.onDragKeydown)}dayAt(e,t){const r=this.laneRects.find(o=>o.resourceId===e),a=this.window();if(!r||!a||r.rect.width===0)return null;const s=Math.floor((t-r.rect.left)/r.rect.width*a.days);return Math.max(0,Math.min(a.days-1,s))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;const t=this.window();if(!t)return;const r=this.laneRects.find(o=>e.clientY>=o.rect.top&&e.clientY<=o.rect.bottom)??this.laneRects.find(o=>o.resourceId===this.drag.targetResourceId);if(!r)return;const a=this.dayAt(r.resourceId,e.clientX);if(a==null)return;const s=Math.max(0,Math.min(t.days-this.drag.duration,a-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:r.resourceId,targetStartIdx:s}}onBlockPointerUp(e){const t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;const r=this.window();if(!r)return;const a=L.addDays(r.from,t.targetStartIdx),s=L.addDays(a,t.duration-1);this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:L.iso(a),_end:L.iso(s)}},bubbles:!0,composed:!0}))}endDrag(){this.drag=null,window.removeEventListener("keydown",this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.onDragKeydown)}render(){const e=this.window();if(!e||!this.resources.length)return i``;const t=[...Array(e.days).keys()].map(d=>L.addDays(e.from,d)),r=new Date,a=L.daysBetween(e.from,new Date(r.getFullYear(),r.getMonth(),r.getDate())),s=a>=0&&a<e.days,o=[];let n;return this.resources.forEach(d=>{d.group&&d.group!==n&&o.push(i`<div class="group">${d.group}</div>`),n=d.group,o.push(this.renderRow(d,e,t,s?a:null))}),i`
            <div class="frame" style="grid-template-columns: minmax(8rem, 12rem) repeat(${e.days}, minmax(2.2rem, 1fr));">
                <div class="corner">Resource</div>
                ${t.map((d,c)=>i`
                    <div class="day-head ${this.isWeekend(d)?"weekend":""} ${c===a?"today":""}">
                        <span class="dow">${d.toLocaleDateString(void 0,{weekday:"short"})}</span>
                        <span class="num">${d.getDate()}</span>
                    </div>
                `)}
                ${o}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(e,t,r,a){const s=100/t.days,o=this.blocks.filter(d=>d.resourceId===e.id&&d.start&&d.end),n=this.drag?.moved&&this.drag.targetResourceId===e.id?this.drag:null;return i`
            <div class="label" title="${e.label??""}">${e.label}</div>
            <div class="lane" data-resource-id="${e.id}">
                <div class="cells">
                    ${r.map(d=>i`<div class="cell ${this.isWeekend(d)?"weekend":""}"></div>`)}
                </div>
                ${a!=null?i`<div class="today-line" style="left: ${(a+.5)*s}%;"></div>`:l}
                ${o.map(d=>{const c=L.daysBetween(t.from,L.parse(d.start)),p=L.daysBetween(t.from,L.parse(d.end));if(p<0||c>=t.days)return l;const h=Math.max(0,c),f=Math.min(t.days-1,p),v=this.drag?.moved&&this.drag.blockId===d.id;return i`
                        <div class="block ${this.selectActionId?"clickable":""} ${this.moveActionId?"draggable":""} ${v?"dragging":""}"
                             title="${d.label??""} · ${d.start} → ${d.end}${d.status?` · ${d.status}`:""}"
                             style="left: ${h*s}%; width: ${(f-h+1)*s}%; ${d.color?`--mateu-planning-block: ${d.color};`:""}"
                             @pointerdown="${y=>this.onBlockPointerDown(y,d,c)}"
                             @pointermove="${y=>this.onBlockPointerMove(y)}"
                             @pointerup="${()=>this.onBlockPointerUp(d)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${d.label}</div>
                    `})}
                ${n?i`
                    <div class="ghost"
                         style="left: ${n.targetStartIdx*s}%; width: ${Math.min(n.duration,t.days-n.targetStartIdx)*s}%;"></div>
                `:l}
            </div>
        `}};L.styles=$`
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
    `;ut([u({type:Array})],L.prototype,"resources",2);ut([u({type:Array})],L.prototype,"blocks",2);ut([u()],L.prototype,"from",2);ut([u()],L.prototype,"to",2);ut([u()],L.prototype,"moveActionId",2);ut([u()],L.prototype,"selectActionId",2);ut([b()],L.prototype,"drag",2);L=ut([x("mateu-planning-board")],L);const wn=e=>{const t=e.metadata;return i`
        <mateu-planning-board
                .resources="${t.resources??[]}"
                .blocks="${t.blocks??[]}"
                .from="${t.from}"
                .to="${t.to}"
                .moveActionId="${t.moveActionId}"
                .selectActionId="${t.selectActionId}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-planning-board>
    `};var kn=Object.defineProperty,Cn=Object.getOwnPropertyDescriptor,ms=(e,t,r,a)=>{for(var s=a>1?void 0:a?Cn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&kn(t,r,s),s};let Cr=class extends C{constructor(){super(...arguments),this.columns=[]}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return i`
            <div class="board">
                ${this.columns.map(e=>i`
                    <div class="column" style="${e.color?`--mateu-kanban-accent: ${e.color};`:""}">
                        <div class="column-head">
                            <span class="column-title" title="${e.title??""}">${e.title}</span>
                            <span class="count">${e.cards?.length??0}</span>
                        </div>
                        ${(e.cards??[]).map(t=>i`
                            <div class="card ${t.actionId?"clickable":""}"
                                 style="${t.color?`--mateu-kanban-card-accent: ${t.color};`:""}"
                                 @click="${()=>this.clickCard(t)}">
                                <span class="card-title">${t.title}</span>
                                ${t.description?i`<span class="card-desc">${t.description}</span>`:l}
                                ${t.badge?i`<span class="badge">${t.badge}</span>`:l}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};Cr.styles=$`
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
    `;ms([u({type:Array})],Cr.prototype,"columns",2);Cr=ms([x("mateu-kanban")],Cr);const Sn=e=>{const t=e.metadata;return i`
        <mateu-kanban
                .columns="${t.columns??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-kanban>
    `};var _n=Object.defineProperty,En=Object.getOwnPropertyDescriptor,hs=(e,t,r,a)=>{for(var s=a>1?void 0:a?En(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&_n(t,r,s),s};let Sr=class extends C{constructor(){super(...arguments),this.items=[]}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return i`
            <div class="feed">
                ${this.items.map(e=>i`
                    <div class="item ${e.actionId?"clickable":""}">
                        <div class="rail">
                            <div class="dot" style="${e.color?`--mateu-timeline-dot: ${e.color};`:""}">${e.icon??""}</div>
                            <div class="line"></div>
                        </div>
                        <div class="body" @click="${()=>this.clickItem(e)}">
                            <div class="head">
                                <span class="title">${e.title}</span>
                                ${e.timestamp?i`<span class="time">${e.timestamp}</span>`:l}
                            </div>
                            ${e.description?i`<div class="desc">${e.description}</div>`:l}
                        </div>
                    </div>
                `)}
            </div>
        `}};Sr.styles=$`
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
    `;hs([u({type:Array})],Sr.prototype,"items",2);Sr=hs([x("mateu-timeline")],Sr);const In=e=>{const t=e.metadata;return i`
        <mateu-timeline
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-timeline>
    `};var Pn=Object.defineProperty,On=Object.getOwnPropertyDescriptor,ma=(e,t,r,a)=>{for(var s=a>1?void 0:a?On(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Pn(t,r,s),s};let ir=class extends C{constructor(){super(...arguments),this.steps=[],this.vertical=!1}render(){return i`
            <div class="steps">
                ${this.steps.map((e,t)=>{const r=e.status??"upcoming";return i`
                        <div class="step ${r}">
                            <div class="connector"></div>
                            <div class="dot">${r==="done"?"✓":t+1}</div>
                            <div class="label">${e.title}</div>
                            ${e.description?i`<div class="desc">${e.description}</div>`:l}
                        </div>
                    `})}
            </div>
        `}};ir.styles=$`
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
    `;ma([u({type:Array})],ir.prototype,"steps",2);ma([u({type:Boolean,reflect:!0})],ir.prototype,"vertical",2);ir=ma([x("mateu-progress-steps")],ir);const Tn=e=>{const t=e.metadata;return i`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                ?vertical="${t.vertical??!1}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-progress-steps>
    `};var zn=Object.defineProperty,An=Object.getOwnPropertyDescriptor,pt=(e,t,r,a)=>{for(var s=a>1?void 0:a?An(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&zn(t,r,s),s};let je=class extends C{constructor(){super(...arguments),this.spark=[]}sparkline(){const e=this.spark;if(!e||e.length<2)return l;const t=84,r=30,a=2,s=Math.min(...e),n=Math.max(...e)-s||1,d=(t-a*2)/(e.length-1),c=e.map((v,y)=>{const S=a+y*d,g=a+(r-a*2)*(1-(v-s)/n);return[S,g]}),p=c.map(([v,y],S)=>`${S===0?"M":"L"}${v.toFixed(1)} ${y.toFixed(1)}`).join(" "),h=`${p} L${c[c.length-1][0].toFixed(1)} ${r} L${c[0][0].toFixed(1)} ${r} Z`,f=this.trend==="down"?"var(--lumo-error-color, #e11d48)":this.trend==="flat"?"var(--lumo-secondary-text-color, #888)":"var(--lumo-success-color, #12b76a)";return K`
            <svg width="${t}" height="${r}" viewBox="0 0 ${t} ${r}">
                <path d="${h}" fill="${f}" opacity="0.12"></path>
                <path d="${p}" fill="none" stroke="${f}" stroke-width="1.6"
                      stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>
        `}dispatchAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=this.trend??"up";return i`
            <div class="tile ${this.actionId?"clickable":""}" @click="${()=>this.dispatchAction()}">
                ${this.label?i`<span class="label">${this.label}</span>`:l}
                <span class="value">${this.value}${this.unit?i`<span class="unit">${this.unit}</span>`:l}</span>
                <div class="foot">
                    ${this.delta?i`<span class="delta ${e}">${e==="up"?"▲":e==="down"?"▼":"→"} ${this.delta}</span>`:i`<span></span>`}
                    ${this.sparkline()}
                </div>
            </div>
        `}};je.styles=$`
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
    `;pt([u()],je.prototype,"label",2);pt([u()],je.prototype,"value",2);pt([u()],je.prototype,"unit",2);pt([u()],je.prototype,"delta",2);pt([u()],je.prototype,"trend",2);pt([u({type:Array})],je.prototype,"spark",2);pt([u()],je.prototype,"actionId",2);je=pt([x("mateu-stat")],je);const Ln=e=>{const t=e.metadata;return i`
        <mateu-stat
                label="${t.label??l}"
                value="${t.value??l}"
                unit="${t.unit??l}"
                delta="${t.delta??l}"
                trend="${t.trend??l}"
                actionId="${t.actionId??l}"
                .spark="${t.spark??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-stat>
    `};var Dn=Object.defineProperty,Rn=Object.getOwnPropertyDescriptor,ha=(e,t,r,a)=>{for(var s=a>1?void 0:a?Rn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Dn(t,r,s),s};let nr=class extends C{constructor(){super(...arguments),this.events=[]}clickEvent(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}render(){const e=this.month?new Date(this.month+"T00:00:00"):new Date,t=e.getFullYear(),r=e.getMonth(),a=new Date(t,r,1),s=(a.getDay()+6)%7,o=new Date(t,r+1,0).getDate(),n=new Date,d=v=>n.getFullYear()===t&&n.getMonth()===r&&n.getDate()===v,c={};for(const v of this.events){if(!v.date)continue;const y=new Date(v.date+"T00:00:00");y.getFullYear()===t&&y.getMonth()===r&&(c[y.getDate()]??=[]).push(v)}const p=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],h=[];for(let v=0;v<s;v++)h.push(i`<div class="cell blank"></div>`);for(let v=1;v<=o;v++)h.push(i`
                <div class="cell ${d(v)?"today":""}">
                    <span class="num">${v}</span>
                    ${(c[v]??[]).map(y=>i`
                        <span class="chip ${y.actionId?"clickable":""}"
                              style="${y.color?`--mateu-cal-accent: ${y.color};`:""}"
                              title="${y.title??""}"
                              @click="${()=>this.clickEvent(y)}">${y.title}</span>
                    `)}
                </div>
            `);const f=a.toLocaleDateString(void 0,{month:"long",year:"numeric"});return i`
            <div class="title">${f}</div>
            <div class="grid">
                ${p.map(v=>i`<div class="dow">${v}</div>`)}
                ${h}
            </div>
        `}};nr.styles=$`
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
    `;ha([u()],nr.prototype,"month",2);ha([u({type:Array})],nr.prototype,"events",2);nr=ha([x("mateu-calendar")],nr);const Un=e=>{const t=e.metadata;return i`
        <mateu-calendar
                month="${t.month??l}"
                .events="${t.events??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-calendar>
    `};var jn=Object.defineProperty,Mn=Object.getOwnPropertyDescriptor,fs=(e,t,r,a)=>{for(var s=a>1?void 0:a?Mn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&jn(t,r,s),s};let _r=class extends C{constructor(){super(...arguments),this.plans=[]}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return i`
            <div class="plans">
                ${this.plans.map(e=>i`
                    <div class="plan ${e.featured?"featured":""}">
                        ${e.featured?i`<span class="badge">Recommended</span>`:l}
                        <span class="name">${e.name}</span>
                        <div>
                            <span class="price">${e.price}</span>
                            ${e.period?i`<span class="period">${e.period}</span>`:l}
                        </div>
                        <ul>
                            ${(e.features??[]).map(t=>i`<li>${t}</li>`)}
                        </ul>
                        ${e.ctaLabel?i`
                            <button class="cta" @click="${()=>this.cta(e)}">${e.ctaLabel}</button>
                        `:l}
                    </div>
                `)}
            </div>
        `}};_r.styles=$`
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
    `;fs([u({type:Array})],_r.prototype,"plans",2);_r=fs([x("mateu-pricing-table")],_r);const Nn=e=>{const t=e.metadata;return i`
        <mateu-pricing-table
                .plans="${t.plans??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-pricing-table>
    `};var Fn=Object.defineProperty,Bn=Object.getOwnPropertyDescriptor,vs=(e,t,r,a)=>{for(var s=a>1?void 0:a?Bn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Fn(t,r,s),s};let Er=class extends C{clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){const t=e.avatar,r=t&&(t.startsWith("http")||t.startsWith("data:"));return i`
            <li>
                <div class="node ${e.actionId?"clickable":""}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:""}"
                     @click="${()=>this.clickNode(e)}">
                    ${t?i`<span class="avatar">${r?i`<img src="${t}" alt="">`:t}</span>`:l}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?i`<span class="subtitle">${e.subtitle}</span>`:l}
                </div>
                ${e.children&&e.children.length?i`<ul>${e.children.map(a=>this.renderNode(a))}</ul>`:l}
            </li>
        `}render(){return this.root?i`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:i``}};Er.styles=$`
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
    `;vs([u({attribute:!1})],Er.prototype,"root",2);Er=vs([x("mateu-org-chart")],Er);const qn=e=>{const t=e.metadata;return i`
        <mateu-org-chart
                .root="${t.root}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-org-chart>
    `};var Hn=Object.defineProperty,Vn=Object.getOwnPropertyDescriptor,bs=(e,t,r,a)=>{for(var s=a>1?void 0:a?Vn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Hn(t,r,s),s};const Wn=1440*60*1e3;let Ir=class extends C{constructor(){super(...arguments),this.cells=[]}color(e,t){if(e<=0||t<=0)return"var(--lumo-contrast-10pct, #ebedf0)";const r=e/t,a=r>.75?1:r>.5?.75:r>.25?.5:.3;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round(a*100)}%, transparent)`}render(){const e=this.cells.filter(c=>!!c.date);if(!e.length)return i``;const t=e.map(c=>new Date(c.date+"T00:00:00").getTime()),r=Math.min(...t),a=Math.max(...t),s=new Date(r);s.setDate(s.getDate()-(s.getDay()+6)%7);const o={};for(const c of e)o[c.date]=c;const n=Math.max(...e.map(c=>c.value??0),1),d=[];for(let c=s.getTime();c<=a;c+=Wn){const p=new Date(c),h=p.toISOString().slice(0,10),f=o[h],v=f?.value??0,y=(p.getDay()+6)%7+1,S=f?.label??`${h}: ${v}`;d.push(i`
                <div class="cell" style="grid-row: ${y}; --cell: ${this.color(v,n)};" title="${S}"></div>
            `)}return i`
            <div class="wrap">
                <div class="grid">${d}</div>
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
        `}};Ir.styles=$`
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
    `;bs([u({type:Array})],Ir.prototype,"cells",2);Ir=bs([x("mateu-heatmap")],Ir);const Gn=e=>{const t=e.metadata;return i`
        <mateu-heatmap
                .cells="${t.cells??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-heatmap>
    `};var Kn=Object.defineProperty,Yn=Object.getOwnPropertyDescriptor,gs=(e,t,r,a)=>{for(var s=a>1?void 0:a?Yn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Kn(t,r,s),s};let Pr=class extends C{constructor(){super(...arguments),this.stages=[]}render(){const e=this.stages;if(!e.length)return i``;const t=e[0].value??0,r=Math.max(...e.map(a=>a.value??0),1);return i`
            <div class="funnel">
                ${e.map((a,s)=>{const o=a.value??0,n=r>0?Math.max(6,o/r*100):6,d=s>0?e[s-1].value??0:t,c=s===0?t>0?"100%":"":d>0?`${Math.round(o/d*100)}%`:"0%";return i`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${a.label}</span>
                                ${s>0?i`<span class="conv">${c} of previous</span>`:l}
                            </div>
                            <div class="bar" style="width: ${n}%; ${a.color?`--bar: ${a.color};`:""}">
                                ${o.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};Pr.styles=$`
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
    `;gs([u({type:Array})],Pr.prototype,"stages",2);Pr=gs([x("mateu-funnel")],Pr);const Jn=e=>{const t=e.metadata;return i`
        <mateu-funnel
                .stages="${t.stages??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-funnel>
    `};var Xn=Object.defineProperty,Qn=Object.getOwnPropertyDescriptor,Wt=(e,t,r,a)=>{for(var s=a>1?void 0:a?Qn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Xn(t,r,s),s};let it=class extends C{constructor(){super(...arguments),this.values=[],this.labels=[],this.area=!1}render(){const e=this.values;if(!e||e.length<2)return i``;const t=600,r=160,a=8,s=Math.min(...e),o=Math.max(...e),n=o-s||1,d=(t-a*2)/(e.length-1),c=e.map((S,g)=>{const I=a+g*d,U=a+(r-a*2)*(1-(S-s)/n);return[I,U]}),p=c.map(([S,g],I)=>`${I===0?"M":"L"}${S.toFixed(1)} ${g.toFixed(1)}`).join(" "),h=`${p} L${c[c.length-1][0].toFixed(1)} ${r-a} L${c[0][0].toFixed(1)} ${r-a} Z`,f=this.color||"var(--lumo-primary-color, #1a73e8)",v=e.indexOf(o),y=e.indexOf(s);return i`
            ${this.heading?i`<div class="title">${this.heading}</div>`:l}
            <svg viewBox="0 0 ${t} ${r}" preserveAspectRatio="none">
                ${this.area?K`<path d="${h}" fill="${f}" opacity="0.12"></path>`:l}
                <path d="${p}" fill="none" stroke="${f}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${c.map((S,g)=>g===v||g===y?K`<circle cx="${S[0]}" cy="${S[1]}" r="3.2" fill="${f}"><title>${this.labels[g]??""}: ${e[g]}</title></circle>`:K`<circle cx="${S[0]}" cy="${S[1]}" r="6" fill="transparent"><title>${this.labels[g]??""}: ${e[g]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?i`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:l}
        `}};it.styles=$`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `;Wt([u()],it.prototype,"heading",2);Wt([u({type:Array})],it.prototype,"values",2);Wt([u({type:Array})],it.prototype,"labels",2);Wt([u()],it.prototype,"color",2);Wt([u({type:Boolean})],it.prototype,"area",2);it=Wt([x("mateu-trend-chart")],it);const Zn=e=>{const t=e.metadata;return i`
        <mateu-trend-chart
                heading="${t.title??l}"
                color="${t.color??l}"
                ?area="${t.area??!1}"
                .values="${t.values??[]}"
                .labels="${t.labels??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-trend-chart>
    `};var el=Object.defineProperty,tl=Object.getOwnPropertyDescriptor,fa=(e,t,r,a)=>{for(var s=a>1?void 0:a?tl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&el(t,r,s),s};let lr=class extends C{constructor(){super(...arguments),this.features=[],this.columns=0}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){const e=this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(15rem, 1fr))";return i`
            <div class="grid" style="grid-template-columns: ${e};">
                ${this.features.map(t=>i`
                    <div class="card ${t.actionId?"clickable":""}" @click="${()=>this.clickFeature(t)}">
                        ${t.icon?i`<span class="icon">${t.icon}</span>`:l}
                        <span class="title">${t.title}</span>
                        ${t.description?i`<span class="desc">${t.description}</span>`:l}
                    </div>
                `)}
            </div>
        `}};lr.styles=$`
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
    `;fa([u({type:Array})],lr.prototype,"features",2);fa([u({type:Number})],lr.prototype,"columns",2);lr=fa([x("mateu-feature-grid")],lr);const rl=e=>{const t=e.metadata;return i`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-feature-grid>
    `};var al=Object.defineProperty,sl=Object.getOwnPropertyDescriptor,ys=(e,t,r,a)=>{for(var s=a>1?void 0:a?sl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&al(t,r,s),s};let Or=class extends C{constructor(){super(...arguments),this.items=[]}stars(e){const t=Math.max(0,Math.min(5,e||0));return"★".repeat(t)+"☆".repeat(5-t)}render(){return i`
            <div class="grid">
                ${this.items.map(e=>{const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return i`
                        <div class="card">
                            ${e.rating?i`<div class="stars">${this.stars(e.rating)}</div>`:l}
                            <div class="quote">${e.quote}</div>
                            <div class="author">
                                ${e.avatar?i`<span class="avatar">${t?i`<img src="${e.avatar}" alt="">`:e.avatar}</span>`:l}
                                <div>
                                    <div class="name">${e.author}</div>
                                    ${e.role?i`<div class="role">${e.role}</div>`:l}
                                </div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};Or.styles=$`
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
    `;ys([u({type:Array})],Or.prototype,"items",2);Or=ys([x("mateu-testimonials")],Or);const ol=e=>{const t=e.metadata;return i`
        <mateu-testimonials
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-testimonials>
    `};var il=Object.defineProperty,nl=Object.getOwnPropertyDescriptor,va=(e,t,r,a)=>{for(var s=a>1?void 0:a?nl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&il(t,r,s),s};let dr=class extends C{constructor(){super(...arguments),this.items=[],this.openSet=new Set,this.seeded=!1}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),i`
            <div class="list">
                ${this.items.map((e,t)=>{const r=this.openSet.has(t);return i`
                        <div class="item ${r?"open":""}">
                            <div class="q" @click="${()=>this.toggle(t)}">
                                <span>${e.question}</span>
                                <span class="chevron">›</span>
                            </div>
                            ${r?i`<div class="a">${e.answer}</div>`:""}
                        </div>
                    `})}
            </div>
        `}};dr.styles=$`
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
    `;va([u({type:Array})],dr.prototype,"items",2);va([b()],dr.prototype,"openSet",2);dr=va([x("mateu-faq")],dr);const ll=e=>{const t=e.metadata;return i`
        <mateu-faq
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-faq>
    `};var dl=Object.defineProperty,cl=Object.getOwnPropertyDescriptor,Lt=(e,t,r,a)=>{for(var s=a>1?void 0:a?cl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&dl(t,r,s),s};let Je=class extends C{themeVars(){switch(this.theme){case"success":return"--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));";case"warning":return"--accent: #f59e0b; --bg: rgba(245,158,11,.12);";case"danger":return"--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));";default:return"--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));"}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return i`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?i`<span class="icon">${this.icon}</span>`:l}
                <div class="body">
                    ${this.heading?i`<span class="heading">${this.heading}</span>`:l}
                    ${this.description?i`<span class="desc">${this.description}</span>`:l}
                    ${this.ctaLabel?i`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:l}
                </div>
            </div>
        `}};Je.styles=$`
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
    `;Lt([u()],Je.prototype,"heading",2);Lt([u()],Je.prototype,"description",2);Lt([u()],Je.prototype,"icon",2);Lt([u()],Je.prototype,"ctaLabel",2);Lt([u()],Je.prototype,"actionId",2);Lt([u()],Je.prototype,"theme",2);Je=Lt([x("mateu-callout-card")],Je);const ul=e=>{const t=e.metadata;return i`
        <mateu-callout-card
                heading="${t.title??l}"
                description="${t.description??l}"
                icon="${t.icon??l}"
                ctaLabel="${t.ctaLabel??l}"
                actionId="${t.actionId??l}"
                theme="${t.theme??l}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-callout-card>
    `};var pl=Object.defineProperty,ml=Object.getOwnPropertyDescriptor,$s=(e,t,r,a)=>{for(var s=a>1?void 0:a?ml(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&pl(t,r,s),s};let Tr=class extends C{constructor(){super(...arguments),this.comments=[]}renderComment(e){const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return i`
            <div class="comment">
                <span class="avatar">${e.avatar?t?i`<img src="${e.avatar}" alt="">`:e.avatar:e.author?.[0]??"?"}</span>
                <div class="body">
                    <div class="head">
                        <span class="author">${e.author}</span>
                        ${e.timestamp?i`<span class="time">${e.timestamp}</span>`:l}
                    </div>
                    <div class="text">${e.text}</div>
                    ${e.replies&&e.replies.length?i`<div class="replies">${e.replies.map(r=>this.renderComment(r))}</div>`:l}
                </div>
            </div>
        `}render(){return i`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};Tr.styles=$`
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
    `;$s([u({type:Array})],Tr.prototype,"comments",2);Tr=$s([x("mateu-comment-thread")],Tr);const hl=e=>{const t=e.metadata;return i`
        <mateu-comment-thread
                .comments="${t.comments??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-comment-thread>
    `};var fl=Object.defineProperty,vl=Object.getOwnPropertyDescriptor,xs=(e,t,r,a)=>{for(var s=a>1?void 0:a?vl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&fl(t,r,s),s};const bl={pdf:"📕",image:"🖼️",img:"🖼️",doc:"📘",docx:"📘",word:"📘",xls:"📗",xlsx:"📗",excel:"📗",sheet:"📗",zip:"🗜️",archive:"🗜️",video:"🎬",audio:"🎵",code:"💻",csv:"📄",txt:"📄"};let zr=class extends C{constructor(){super(...arguments),this.files=[]}icon(e){return e&&bl[e.toLowerCase()]||"📄"}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return i`
            <div class="list">
                ${this.files.map(e=>{const t=!!e.url||!!e.actionId,r=i`
                        <span class="icon">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?i`<span class="size">${e.size}</span>`:l}
                        ${e.url?i`<span class="dl">⬇</span>`:l}
                    `;return e.url?i`<a class="file clickable" href="${e.url}" download target="_blank" rel="noopener">${r}</a>`:i`<div class="file ${t?"clickable":""}" @click="${a=>this.clickFile(e,a)}">${r}</div>`})}
            </div>
        `}};zr.styles=$`
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
    `;xs([u({type:Array})],zr.prototype,"files",2);zr=xs([x("mateu-file-list")],zr);const gl=e=>{const t=e.metadata;return i`
        <mateu-file-list
                .files="${t.files??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-file-list>
    `};var yl=Object.defineProperty,$l=Object.getOwnPropertyDescriptor,Hr=(e,t,r,a)=>{for(var s=a>1?void 0:a?$l(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&yl(t,r,s),s};let Ft=class extends C{constructor(){super(...arguments),this.items=[],this.localDone=new Map}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){const r=!this.isDone(e,t);this.localDone.set(t,r),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e,_done:r}},bubbles:!0,composed:!0}))}render(){const e=this.items.length,t=this.items.filter((a,s)=>this.isDone(a,s)).length,r=e>0?Math.round(t/e*100):0;return i`
            <div class="head">
                ${this.heading?i`<span class="title">${this.heading}</span>`:i`<span></span>`}
                <span class="count">${t} / ${e}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${r}%;"></div></div>
            ${this.items.map((a,s)=>{const o=this.isDone(a,s);return i`
                    <div class="item ${o?"done":""}" @click="${()=>this.toggle(a,s)}">
                        <span class="box">${o?"✓":l}</span>
                        <span class="label">${a.label}</span>
                    </div>
                `})}
        `}};Ft.styles=$`
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
    `;Hr([u()],Ft.prototype,"heading",2);Hr([u({type:Array})],Ft.prototype,"items",2);Hr([b()],Ft.prototype,"localDone",2);Ft=Hr([x("mateu-checklist")],Ft);const xl=e=>{const t=e.metadata;return i`
        <mateu-checklist
                heading="${t.title??l}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-checklist>
    `};var wl=Object.defineProperty,kl=Object.getOwnPropertyDescriptor,mt=(e,t,r,a)=>{for(var s=a>1?void 0:a?kl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&wl(t,r,s),s};let Me=class extends C{render(){const e=this.trend??"flat";return i`
            <div class="card">
                ${this.heading?i`<div class="title">${this.heading}</div>`:l}
                <div class="row">
                    <div class="side">
                        ${this.leftLabel?i`<div class="label">${this.leftLabel}</div>`:l}
                        <div class="value">${this.leftValue}</div>
                    </div>
                    <div class="mid">
                        <span class="arrow">${"→"}</span>
                        ${this.delta?i`<span class="delta ${e}">${e==="up"?"▲":e==="down"?"▼":""} ${this.delta}</span>`:l}
                    </div>
                    <div class="side">
                        ${this.rightLabel?i`<div class="label">${this.rightLabel}</div>`:l}
                        <div class="value">${this.rightValue}</div>
                    </div>
                </div>
            </div>
        `}};Me.styles=$`
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
    `;mt([u()],Me.prototype,"heading",2);mt([u()],Me.prototype,"leftLabel",2);mt([u()],Me.prototype,"leftValue",2);mt([u()],Me.prototype,"rightLabel",2);mt([u()],Me.prototype,"rightValue",2);mt([u()],Me.prototype,"delta",2);mt([u()],Me.prototype,"trend",2);Me=mt([x("mateu-comparison-card")],Me);const Cl=e=>{const t=e.metadata;return i`
        <mateu-comparison-card
                heading="${t.title??l}"
                leftLabel="${t.leftLabel??l}"
                leftValue="${t.leftValue??l}"
                rightLabel="${t.rightLabel??l}"
                rightValue="${t.rightValue??l}"
                delta="${t.delta??l}"
                trend="${t.trend??l}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-comparison-card>
    `},Vr=$`
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
`,Sl=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}),sa=e=>Sl.format(e),Ar=(e,t)=>{const r=e<0?"-":"",a=sa(Math.abs(e));return t?`${r}${t} ${a}`:`${r}${a}`},_l=(e,t)=>t?`${sa(e)} ${t}`:sa(e);var El=Object.defineProperty,Il=Object.getOwnPropertyDescriptor,ht=(e,t,r,a)=>{for(var s=a>1?void 0:a?Il(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&El(t,r,s),s};let Ne=class extends C{constructor(){super(...arguments),this.title="",this.badges=[],this.facts=[]}render(){const e=!!(this.metricLabel||this.metricValue||this.metricCaption);return i`
            <div class="card">
                <div class="main">
                    <div class="title-row">
                        <span class="title">${this.title}</span>
                        ${this.badges.map(t=>i`<span class="chip ${t.color??""}">${t.label}</span>`)}
                    </div>
                    ${this.subtitle?i`<span class="subtitle">${this.subtitle}</span>`:l}
                    ${this.facts.length?i`
                        <div class="facts">
                            ${this.facts.map(t=>i`
                                <div class="fact">
                                    <span class="label">${t.label}</span>
                                    <span class="value">${t.value}</span>
                                </div>
                            `)}
                        </div>
                    `:l}
                </div>
                ${e?i`
                    <div class="metric">
                        ${this.metricLabel?i`<span class="label">${this.metricLabel}</span>`:l}
                        ${this.metricValue?i`<span class="value">${this.metricValue}</span>`:l}
                        ${this.metricCaption?i`<span class="caption">${this.metricCaption}</span>`:l}
                    </div>
                `:l}
            </div>
        `}};Ne.styles=[Vr,$`
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
    `];ht([u()],Ne.prototype,"title",2);ht([u({type:Array})],Ne.prototype,"badges",2);ht([u()],Ne.prototype,"subtitle",2);ht([u({type:Array})],Ne.prototype,"facts",2);ht([u()],Ne.prototype,"metricLabel",2);ht([u()],Ne.prototype,"metricValue",2);ht([u()],Ne.prototype,"metricCaption",2);Ne=ht([x("mateu-entity-header")],Ne);const Pl=e=>{const t=e.metadata;return i`
        <mateu-entity-header
                .title="${t.title??""}"
                .badges="${t.badges??[]}"
                .subtitle="${t.subtitle}"
                .facts="${t.facts??[]}"
                .metricLabel="${t.metricLabel}"
                .metricValue="${t.metricValue}"
                .metricCaption="${t.metricCaption}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-entity-header>
    `};var Ol=Object.defineProperty,Tl=Object.getOwnPropertyDescriptor,ft=(e,t,r,a)=>{for(var s=a>1?void 0:a?Tl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Ol(t,r,s),s};let Fe=class extends C{constructor(){super(...arguments),this.value=0,this.max=0}fillColor(){return this.dangerAt!=null&&this.value>=this.dangerAt?"error":this.warnAt!=null&&this.value>=this.warnAt?"warning":this.warnAt!=null||this.dangerAt!=null?"success":"primary"}render(){const e=this.max>0?Math.min(Math.max(this.value/this.max,0),1):0,t=Math.round(e*100);return i`
            <div class="meter">
                ${this.label?i`<span class="label">${this.label}</span>`:l}
                <span class="value">${_l(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};Fe.styles=$`
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
    `;ft([u()],Fe.prototype,"label",2);ft([u({type:Number})],Fe.prototype,"value",2);ft([u({type:Number})],Fe.prototype,"max",2);ft([u()],Fe.prototype,"unit",2);ft([u()],Fe.prototype,"caption",2);ft([u({type:Number})],Fe.prototype,"warnAt",2);ft([u({type:Number})],Fe.prototype,"dangerAt",2);Fe=ft([x("mateu-meter")],Fe);const zl=e=>{const t=e.metadata;return i`
        <mateu-meter
                .label="${t.label}"
                .value="${t.value??0}"
                .max="${t.max??0}"
                .unit="${t.unit}"
                .caption="${t.caption}"
                .warnAt="${t.warnAt}"
                .dangerAt="${t.dangerAt}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-meter>
    `};var Al=Object.defineProperty,Ll=Object.getOwnPropertyDescriptor,Gt=(e,t,r,a)=>{for(var s=a>1?void 0:a?Ll(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Al(t,r,s),s};let nt=class extends C{constructor(){super(...arguments),this.total=0,this.done=0}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){const e=this.total>0&&this.done>=this.total,t=!e&&!!this.actionLabel&&!!this.actionId;return i`
            <div class="banner ${e?"complete":""}">
                <span class="icon">👥</span>
                ${this.label?i`<span class="label">${this.label}</span>`:l}
                <div class="pills">
                    ${Array.from({length:this.total},(r,a)=>i`
                        <span class="pill ${a+1<=this.done?"filled":""}">${a+1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${t?i`<button @click="${()=>this.runAction()}">${this.actionLabel} →</button>`:l}
            </div>
        `}};nt.styles=$`
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
    `;Gt([u()],nt.prototype,"label",2);Gt([u({type:Number})],nt.prototype,"total",2);Gt([u({type:Number})],nt.prototype,"done",2);Gt([u()],nt.prototype,"actionLabel",2);Gt([u()],nt.prototype,"actionId",2);nt=Gt([x("mateu-task-progress")],nt);const Dl=e=>{const t=e.metadata;return i`
        <mateu-task-progress
                .label="${t.label}"
                .total="${t.total??0}"
                .done="${t.done??0}"
                .actionLabel="${t.actionLabel}"
                .actionId="${t.actionId}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-task-progress>
    `};var Rl=Object.defineProperty,Ul=Object.getOwnPropertyDescriptor,fr=(e,t,r,a)=>{for(var s=a>1?void 0:a?Ul(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Rl(t,r,s),s};let Ct=class extends C{constructor(){super(...arguments),this.items=[],this.compact=!1,this.frameless=!1}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}rowClicked(e){this.rowActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.rowActionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}render(){return i`
            <div class="list ${this.compact?"compact":""} ${this.frameless?"frameless":""}">
                ${this.items.map(e=>i`
                    <div class="row ${this.rowActionId?"clickable":""}"
                         @click="${()=>this.rowClicked(e)}">
                        ${e.avatar?i`<span class="avatar">${e.avatar}</span>`:e.icon?i`<span class="icon">${e.icon}</span>`:l}
                        <div class="body">
                            <span class="title">${e.title}</span>
                            ${e.description?i`<span class="description">${e.description}</span>`:l}
                        </div>
                        ${e.status?i`<span class="chip ${e.statusColor??""}">${e.status}</span>`:l}
                        ${e.actionLabel&&e.actionId?i`<button class="row-action" @click="${()=>this.runAction(e)}">${e.actionLabel}</button>`:l}
                    </div>
                `)}
            </div>
        `}};Ct.styles=[Vr,$`
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
    `];fr([u({type:Array})],Ct.prototype,"items",2);fr([u({type:Boolean})],Ct.prototype,"compact",2);fr([u({type:Boolean})],Ct.prototype,"frameless",2);fr([u()],Ct.prototype,"rowActionId",2);Ct=fr([x("mateu-status-list")],Ct);const jl=e=>{const t=e.metadata;return i`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                rowActionId="${D(t.rowActionId??void 0)}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-status-list>
    `};var Ml=Object.defineProperty,Nl=Object.getOwnPropertyDescriptor,ws=(e,t,r,a)=>{for(var s=a>1?void 0:a?Nl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Ml(t,r,s),s};let Lr=class extends C{constructor(){super(...arguments),this.items=[]}render(){return i`
            <ul>
                ${this.items.map(e=>i`<li>${e}</li>`)}
            </ul>
        `}};Lr.styles=$`
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
    `;ws([u({type:Array})],Lr.prototype,"items",2);Lr=ws([x("mateu-bulleted-list")],Lr);const Fl=e=>{const t=e.metadata;return i`
        <mateu-bulleted-list
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-bulleted-list>
    `},Bl=e=>{const r=e.metadata.attributes?.["data-colspan"];return i`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??""}"
            class="${e.cssClasses??l}"
            id="${D(e.id??void 0)}"
            data-colspan="${D(r)}"
            slot="${e.slot??l}"/>
    `};var ql=Object.defineProperty,Hl=Object.getOwnPropertyDescriptor,be=(e,t,r,a)=>{for(var s=a>1?void 0:a?Hl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&ql(t,r,s),s};const Vl={info:"ℹ",success:"✓",warning:"!",danger:"!"};let ae=class extends C{constructor(){super(...arguments),this.text="",this.theme="info",this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=!!this.text&&!!this.text.trim();if(!e&&!this.hasContent)return i``;const t=["info","success","warning","danger"].includes(this.theme)?this.theme:"info";return i`
            <div class="notice ${t} ${this.slim?"slim":""}">
                ${this.noIcon?l:i`<span class="icon ${this.icon?"custom":""}">${this.icon||Vl[t]}</span>`}
                <div class="body ${this.inlineContent?"inline":""}">
                    ${e?i`<span class="text">${this.text}</span>`:l}
                    ${this.hasContent?i`<div class="content"><slot></slot></div>`:l}
                </div>
                ${this.actionLabel&&this.actionId?i`<button class="notice-action" @click="${()=>this.runAction()}">${this.actionLabel}</button>`:this.status?i`<span class="status">${this.status}</span>`:l}
            </div>
        `}};ae.styles=$`
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
    `;be([u()],ae.prototype,"text",2);be([u()],ae.prototype,"theme",2);be([u()],ae.prototype,"icon",2);be([u({type:Boolean})],ae.prototype,"noIcon",2);be([u()],ae.prototype,"actionLabel",2);be([u()],ae.prototype,"actionId",2);be([u()],ae.prototype,"status",2);be([u({type:Boolean})],ae.prototype,"slim",2);be([u({type:Boolean})],ae.prototype,"fullWidth",2);be([u({type:Boolean})],ae.prototype,"hasContent",2);be([u({type:Boolean})],ae.prototype,"inlineContent",2);ae=be([x("mateu-notice")],ae);const Wl=(e,t,r,a,s,o,n)=>{const d=t.metadata,c=ar(d.text??"",a,s,o,n)??"",p=t.children??[];return i`
        <mateu-notice
                text="${c}"
                theme="${d.theme??"info"}"
                icon="${D(d.icon??void 0)}"
                ?noIcon="${d.noIcon??!1}"
                actionLabel="${D(d.actionLabel??void 0)}"
                actionId="${D(d.actionId??void 0)}"
                status="${D(d.status??void 0)}"
                ?slim="${d.slim??!1}"
                ?fullWidth="${d.fullWidth??!1}"
                ?inlineContent="${d.inlineContent??!1}"
                ?hasContent="${p.length>0}"
                data-colspan="${d.fullWidth?"99":l}"
                style="${t.style??l}"
                class="${t.cssClasses??l}"
                slot="${t.slot??l}"
        >${p.map(h=>w(e,h,r,a,s,o,n))}</mateu-notice>
    `};var Gl=Object.defineProperty,Kl=Object.getOwnPropertyDescriptor,Wr=(e,t,r,a)=>{for(var s=a>1?void 0:a?Kl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Gl(t,r,s),s};let Bt=class extends C{constructor(){super(...arguments),this.groups=[]}willUpdate(e){e.has("groups")&&(this.selectedId=this.groups.flatMap(t=>t.items??[]).find(t=>t.selected)?.id)}select(e){this.selectedId=e,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e}},bubbles:!0,composed:!0}))}render(){return i`
            <div class="rail">
                ${this.groups.map(e=>i`
                    <div class="group">
                        ${e.label?i`<span class="group-label">${e.label}</span>`:l}
                        ${(e.items??[]).map(t=>i`
                            <div class="card ${t.id===this.selectedId?"selected":""}"
                                 @click="${()=>this.select(t.id)}">
                                <span class="title">${t.title}</span>
                                <div class="meta">
                                    ${t.caption?i`<span class="caption">${t.caption}</span>`:l}
                                    ${(t.badges??[]).map(r=>i`<span class="chip ${r.color??""}">${r.label}</span>`)}
                                </div>
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};Bt.styles=[Vr,$`
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
        .caption {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #888);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
    `];Wr([u()],Bt.prototype,"actionId",2);Wr([u({type:Array})],Bt.prototype,"groups",2);Wr([b()],Bt.prototype,"selectedId",2);Bt=Wr([x("mateu-task-queue")],Bt);const Yl=e=>{const t=e.metadata;return i`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-task-queue>
    `};var Jl=Object.defineProperty,Xl=Object.getOwnPropertyDescriptor,Kt=(e,t,r,a)=>{for(var s=a>1?void 0:a?Xl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Jl(t,r,s),s};let lt=class extends C{constructor(){super(...arguments),this.columns=0,this.items=[]}willUpdate(e){e.has("items")&&(this.selectedId=this.items.find(t=>t.selected)?.id)}select(e){e.disabled||(this.selectedId=e.id,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0})))}render(){const e=this.columns>0?`grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`:"grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));";return i`
            <div class="grid" style="${e}">
                ${this.items.map(t=>i`
                    <div class="cell ${t.disabled?"disabled":""} ${t.recommended?"recommended":""} ${t.id===this.selectedId?"selected":""}"
                         @click="${()=>this.select(t)}">
                        ${t.recommended?i`<span class="tag">${this.recommendedLabel||"Recommended"}</span>`:l}
                        <span class="title">${t.title}</span>
                        ${t.subtitle?i`<span class="subtitle">${t.subtitle}</span>`:l}
                        ${t.statusLabel?i`<span class="chip ${t.statusColor??""}">${t.statusLabel}</span>`:l}
                        ${t.note?i`<span class="note ${t.noteColor??""}"><span class="dot"></span>${t.note}</span>`:l}
                    </div>
                `)}
            </div>
        `}};lt.styles=[Vr,$`
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
    `];Kt([u()],lt.prototype,"actionId",2);Kt([u({type:Number})],lt.prototype,"columns",2);Kt([u()],lt.prototype,"recommendedLabel",2);Kt([u({type:Array})],lt.prototype,"items",2);Kt([b()],lt.prototype,"selectedId",2);lt=Kt([x("mateu-resource-grid")],lt);const Ql=e=>{const t=e.metadata;return i`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-resource-grid>
    `};var Zl=Object.defineProperty,ed=Object.getOwnPropertyDescriptor,de=(e,t,r,a)=>{for(var s=a>1?void 0:a?ed(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Zl(t,r,s),s};let J=class extends C{constructor(){super(...arguments),this.title="",this.features=[],this.current=!1,this.added=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return i`
            <div class="card ${this.current?"":"offer"}">
                ${this.image?i`<img class="image" src="${this.image}" alt="${this.title}">`:l}
                ${this.tag&&this.image?i`<span class="tag">${this.tag}</span>`:l}
                <div class="body">
                    ${this.tag&&!this.image?i`<span class="tag static">${this.tag}</span>`:l}
                    <span class="title">${this.title}</span>
                    ${this.subtitle?i`<span class="subtitle">${this.subtitle}</span>`:l}
                    ${this.features.length?i`
                        <div class="features">
                            ${this.features.map(e=>i`<span class="feature">${e}</span>`)}
                        </div>
                    `:l}
                </div>
                <div class="footer">
                    ${this.current?this.currentLabel?i`<span class="current-label">${this.currentLabel}</span>`:l:this.actionLabel&&this.actionId?i`
                            <button class="${this.added?"added":""}" @click="${()=>this.runAction()}">
                                <span>${this.added?this.addedLabel||this.actionLabel:this.actionLabel}</span>
                                ${this.priceLabel?i`<span class="price">${this.priceLabel}</span>`:l}
                            </button>
                        `:l}
                </div>
            </div>
        `}};J.styles=$`
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
    `;de([u()],J.prototype,"tag",2);de([u()],J.prototype,"title",2);de([u()],J.prototype,"subtitle",2);de([u()],J.prototype,"image",2);de([u({type:Array})],J.prototype,"features",2);de([u()],J.prototype,"priceLabel",2);de([u()],J.prototype,"actionLabel",2);de([u()],J.prototype,"actionId",2);de([u({type:Boolean})],J.prototype,"current",2);de([u()],J.prototype,"currentLabel",2);de([u({type:Boolean})],J.prototype,"added",2);de([u()],J.prototype,"addedLabel",2);J=de([x("mateu-offer-card")],J);const td=e=>{const t=e.metadata;return i`
        <mateu-offer-card
                .tag="${t.tag}"
                .title="${t.title??""}"
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
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-offer-card>
    `};var rd=Object.defineProperty,ad=Object.getOwnPropertyDescriptor,Yt=(e,t,r,a)=>{for(var s=a>1?void 0:a?ad(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&rd(t,r,s),s};let dt=class extends C{constructor(){super(...arguments),this.items=[],this.added=new Set}willUpdate(e){e.has("items")&&(this.added=new Set(this.items.filter(t=>t.added).map(t=>t.id)))}total(){return this.items.filter(e=>e.id!=null&&this.added.has(e.id)).reduce((e,t)=>e+(t.price??0),0)}toggle(e){if(e.id==null)return;const t=new Set(this.added),r=!t.has(e.id);r?t.add(e.id):t.delete(e.id),this.added=t,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id,_added:r,_total:this.total()}},bubbles:!0,composed:!0}))}render(){return i`
            <div class="header">
                ${this.totalLabel?i`<span class="total-label">${this.totalLabel}:</span>`:l}
                <span class="total">${Ar(this.total(),this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(e=>{const t=e.id!=null&&this.added.has(e.id);return i`
                        <div class="card ${t?"added":""}">
                            ${e.icon?i`<span class="icon">${e.icon}</span>`:l}
                            <span class="title">${e.title}</span>
                            ${e.description?i`<span class="description">${e.description}</span>`:l}
                            ${e.includedLabel?i`<span class="included">${e.includedLabel}</span>`:i`
                                    ${e.price!=null?i`
                                        <span class="price">${Ar(e.price,this.currency)}${e.unit?` / ${e.unit}`:""}</span>
                                    `:l}
                                    <button class="toggle ${t?"on":""}" @click="${()=>this.toggle(e)}"
                                            aria-pressed="${t}">${t?"✓":"+"}</button>
                                `}
                        </div>
                    `})}
            </div>
        `}};dt.styles=$`
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
    `;Yt([u()],dt.prototype,"totalLabel",2);Yt([u()],dt.prototype,"currency",2);Yt([u()],dt.prototype,"actionId",2);Yt([u({type:Array})],dt.prototype,"items",2);Yt([b()],dt.prototype,"added",2);dt=Yt([x("mateu-addon-picker")],dt);const sd=e=>{const t=e.metadata;return i`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-addon-picker>
    `};var od=Object.defineProperty,id=Object.getOwnPropertyDescriptor,vr=(e,t,r,a)=>{for(var s=a>1?void 0:a?id(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&od(t,r,s),s};let St=class extends C{constructor(){super(...arguments),this.lines=[]}computedTotal(){return this.total!=null?this.total:this.lines.filter(e=>!e.included).reduce((e,t)=>e+(t.amount??0),0)}render(){return i`
            ${this.lines.map(e=>i`
                <div class="row">
                    <span class="dot"></span>
                    <span class="concept">${e.concept}</span>
                    ${e.included?i`<span class="included-label">${e.includedLabel||"Included"}</span>`:i`<span class="amount ${(e.amount??0)<0?"negative":""}">${Ar(e.amount??0,this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel||"Total"}</span>
                <span class="total">${Ar(this.computedTotal(),this.currency)}</span>
            </div>
        `}};St.styles=$`
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
    `;vr([u()],St.prototype,"currency",2);vr([u()],St.prototype,"totalLabel",2);vr([u({type:Array})],St.prototype,"lines",2);vr([u({type:Number})],St.prototype,"total",2);St=vr([x("mateu-ledger")],St);const nd=e=>{const t=e.metadata;return i`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-ledger>
    `};var ld=Object.defineProperty,dd=Object.getOwnPropertyDescriptor,Qe=(e,t,r,a)=>{for(var s=a>1?void 0:a?dd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&ld(t,r,s),s};let Se=class extends C{constructor(){super(...arguments),this.methods=[]}willUpdate(e){e.has("selected")&&(this.selectedId=this.selected)}confirm(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_method:this.selectedId}},bubbles:!0,composed:!0}))}pick(e){this.selectedId=e,this.methodActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.methodActionId,parameters:{_method:e}},bubbles:!0,composed:!0}))}render(){return i`
            <div class="bar">
                <div class="methods">
                    ${this.methods.map(e=>i`
                        <button class="method ${e.id===this.selectedId?"selected":""}"
                                @click="${()=>this.pick(e.id)}">${e.label}</button>
                    `)}
                </div>
                ${this.contextLabel||this.contextValue?i`
                    <div class="context">
                        ${this.contextLabel?i`<span class="label">${this.contextLabel}</span>`:l}
                        ${this.contextValue?i`<span class="value">${this.contextValue}</span>`:l}
                    </div>
                `:l}
                <span class="spacer"></span>
                ${this.confirmLabel&&this.actionId?i`<button class="confirm" @click="${()=>this.confirm()}">${this.confirmLabel}</button>`:l}
            </div>
        `}};Se.styles=$`
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
    `;Qe([u()],Se.prototype,"actionId",2);Qe([u()],Se.prototype,"methodActionId",2);Qe([u({type:Array})],Se.prototype,"methods",2);Qe([u()],Se.prototype,"selected",2);Qe([u()],Se.prototype,"contextLabel",2);Qe([u()],Se.prototype,"contextValue",2);Qe([u()],Se.prototype,"confirmLabel",2);Qe([b()],Se.prototype,"selectedId",2);Se=Qe([x("mateu-payment-picker")],Se);const cd=e=>{const t=e.metadata;return i`
        <mateu-payment-picker
                .actionId="${t.actionId}"
                .methodActionId="${t.methodActionId}"
                .methods="${t.methods??[]}"
                .selected="${t.selected}"
                .contextLabel="${t.contextLabel}"
                .contextValue="${t.contextValue}"
                .confirmLabel="${t.confirmLabel}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-payment-picker>
    `};var ud=Object.defineProperty,pd=Object.getOwnPropertyDescriptor,ks=(e,t,r,a)=>{for(var s=a>1?void 0:a?pd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&ud(t,r,s),s};let Dr=class extends C{constructor(){super(...arguments),this.items=[]}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return i`
            <div class="list">
                ${this.items.map(e=>i`
                    <div class="row">
                        <span class="dot ${e.status??"ok"}"></span>
                        <div class="body">
                            <span class="name">${e.name}</span>
                            ${e.systems?.length?i`<span class="systems">${e.systems.join(" · ")}</span>`:l}
                        </div>
                        <div class="counters">
                            <span class="counter ok">✓ ${e.ok??0} OK</span>
                            ${(e.warnings??0)>0?i`<span class="counter warning">⚠ ${e.warnings} warnings</span>`:l}
                            ${(e.errors??0)>0?i`<span class="counter error">⛔ ${e.errors} errors</span>`:l}
                        </div>
                        ${e.actionLabel&&e.actionId?i`<button @click="${()=>this.runAction(e)}">${e.actionLabel}</button>`:l}
                    </div>
                `)}
            </div>
        `}};Dr.styles=$`
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
    `;ks([u({type:Array})],Dr.prototype,"items",2);Dr=ks([x("mateu-process-monitor")],Dr);const md=e=>{const t=e.metadata;return i`
        <mateu-process-monitor
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-process-monitor>
    `},hd=(e,t)=>{let r=e.style;return e.id&&(r&&!r.endsWith(";")&&(r+=";"),r==null&&(r=""),t[e.id+".hidden"]==!0&&(r+="display: none;")),r},fd=(e,t)=>{let r={...e.metadata};if(e.id&&r){if(r.type==m.Button){const a=r;t[e.id+".disabled"]==!0&&(a.disabled=!0)}if(r.type==m.FormField){const a=r;t[e.id+".disabled"]==!0&&(a.disabled=!0)}}return r},O=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),vd={[m.Bpmn]:({component:e})=>tn(e),[m.Workflow]:({component:e})=>an(e),[m.FormEditor]:({component:e})=>sn(e),[m.Page]:O(ra),[m.Div]:O(Ji),[m.Directory]:({component:e,baseUrl:t,state:r,data:a})=>Yi(e),[m.FormLayout]:O(Go),[m.HorizontalLayout]:O(Xo),[m.VerticalLayout]:O(Qo),[m.SplitLayout]:O(Zo),[m.MasterDetailLayout]:O(ei),[m.TabLayout]:O(ti),[m.AccordionLayout]:O(ri),[m.BoardLayout]:O(ni),[m.BoardLayoutRow]:O(li),[m.BoardLayoutItem]:O(di),[m.Scroller]:O(si),[m.FullWidth]:O(oi),[m.Container]:O(ii),[m.Form]:({container:e,component:t,baseUrl:r,state:a,data:s,appState:o,appData:n})=>{const d=t.metadata;return i`<mateu-form
            id="${t.id}"
        baseUrl="${r}"
            .component="${t}"
            .values="${a}"
            .state="${a}"
            .data="${s}"
            .appState="${o}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??l}"
            >
                ${t.children?.map(c=>w(e,c,r,a,s,o,n))}
            ${d?.buttons?.map(c=>i`
               ${w(e,{id:c.actionId,metadata:c,type:Y.ClientSide,slot:"buttons"},void 0,a,s,o,n)}
`)}

            </mateu-form>`},[m.Table]:({component:e,state:t,data:r})=>ta(e,(e.id?r?.[e.id]:void 0)?.page?.content??Ea(e,t)),[m.Crud]:O(aa),[m.App]:({container:e,component:t,baseUrl:r,state:a,data:s,appState:o,appData:n})=>i`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${r}"
                        .component="${t}"
                        .state="${a}"
                        .data="${s}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${o}"
                        .appData="${n}"
            >
             ${t.children?.map(d=>w(e,d,r,a,s,o,n))}
         </mateu-app>`,[m.Element]:({container:e,component:t})=>$i(e,t.metadata,t),[m.FormField]:({component:e,state:t})=>en(e,t),[m.Text]:({component:e,state:t,data:r,appState:a,appData:s})=>xi(e,t,r,a,s),[m.Avatar]:({component:e,state:t,data:r})=>yo(e,t,r),[m.Chat]:({component:e,state:t,data:r})=>rn(e),[m.AvatarGroup]:({component:e})=>$o(e),[m.Badge]:({component:e,state:t,data:r})=>xo(e,t,r),[m.Breadcrumbs]:({component:e})=>Gi(e),[m.Anchor]:({component:e})=>wi(e),[m.Button]:({component:e,state:t,data:r})=>Pi(e,t,r),[m.Card]:O(Ti),[m.Chart]:({component:e})=>zi(e),[m.Icon]:({component:e})=>Ai(e),[m.ConfirmDialog]:O(Di),[m.ContextMenu]:O(hi),[m.CookieConsent]:({component:e})=>Ri(e),[m.Details]:O(Ui),[m.Dialog]:({component:e,baseUrl:t,state:r,data:a,appState:s,appData:o})=>ji(e,t,r,a,s,o),[m.Drawer]:({component:e,baseUrl:t,state:r,data:a,appState:s,appData:o})=>Mi(e,t,r,a,s,o),[m.Image]:({component:e})=>Wi(e),[m.Map]:({component:e})=>Vi(e),[m.Markdown]:({component:e})=>Fi(e),[m.MicroFrontend]:({component:e})=>Ni(e),[m.Notification]:({component:e})=>Bi(e),[m.ProgressBar]:({component:e,state:t})=>qi(e,t),[m.Popover]:O(Hi),[m.CarouselLayout]:O(Ki),[m.Tooltip]:O(bi),[m.MessageInput]:({component:e})=>vi(e),[m.MessageList]:({component:e})=>pi(e),[m.CustomField]:O(fi),[m.MenuBar]:({container:e,component:t,baseUrl:r,state:a,data:s})=>mi(e,t,r,a,s),[m.Grid]:({component:e,state:t})=>ta(e,Ea(e,t)),[m.VirtualList]:O(ci),[m.FormSection]:O(Xi),[m.FormSubSection]:O(Qi),[m.MetricCard]:({component:e})=>dn(e),[m.Scoreboard]:O(cn),[m.DashboardPanel]:O(un),[m.DashboardLayout]:O(pn),[m.FoldoutLayout]:O(fn),[m.HeroSection]:O(vn),[m.EmptyState]:({component:e})=>Ao(e),[m.Skeleton]:({component:e})=>Lo(e),[m.Gantt]:({component:e})=>yn(e),[m.PlanningBoard]:({component:e})=>wn(e),[m.Kanban]:({component:e})=>Sn(e),[m.Timeline]:({component:e})=>In(e),[m.ProgressSteps]:({component:e})=>Tn(e),[m.Stat]:({component:e})=>Ln(e),[m.Calendar]:({component:e})=>Un(e),[m.PricingTable]:({component:e})=>Nn(e),[m.OrgChart]:({component:e})=>qn(e),[m.Heatmap]:({component:e})=>Gn(e),[m.Funnel]:({component:e})=>Jn(e),[m.TrendChart]:({component:e})=>Zn(e),[m.FeatureGrid]:({component:e})=>rl(e),[m.Testimonials]:({component:e})=>ol(e),[m.Faq]:({component:e})=>ll(e),[m.CalloutCard]:({component:e})=>ul(e),[m.CommentThread]:({component:e})=>hl(e),[m.FileList]:({component:e})=>gl(e),[m.Checklist]:({component:e})=>xl(e),[m.ComparisonCard]:({component:e})=>Cl(e),[m.EntityHeader]:({component:e})=>Pl(e),[m.Meter]:({component:e})=>zl(e),[m.TaskProgress]:({component:e})=>Dl(e),[m.StatusList]:({component:e})=>jl(e),[m.BulletedList]:({component:e})=>Fl(e),[m.Separator]:({component:e})=>Bl(e),[m.Notice]:O(Wl),[m.TaskQueue]:({component:e})=>Yl(e),[m.ResourceGrid]:({component:e})=>Ql(e),[m.OfferCard]:({component:e})=>td(e),[m.AddOnPicker]:({component:e})=>sd(e),[m.Ledger]:({component:e})=>nd(e),[m.PaymentPicker]:({component:e})=>cd(e),[m.ProcessMonitor]:({component:e})=>md(e)},ba=(e,t,r,a,s,o,n,d)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),i`<p>No metadata for component</p>`):ba(e,{id:ke(),metadata:t,type:Y.ClientSide},r,a,s,o,n,d);const c=t.metadata.type,p={...t,style:hd(t,s),metadata:fd(t,s)},h=vd[c];return h?h({container:e,component:p,baseUrl:r,state:a,data:s,appState:o,appData:n,labelAlreadyRendered:d}):i`<p ${p?.slot??l}>Unknown metadata type ${c} for component ${p?.id}</p>`};var tr=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(tr||{});const Cs=e=>{switch(e){case tr.SUCCESS:return"success";case tr.WARNING:return"warning";case tr.DANGER:return"error";case tr.NONE:return"contrast"}return""};var bd=Object.defineProperty,gd=Object.getOwnPropertyDescriptor,ge=(e,t,r,a)=>{for(var s=a>1?void 0:a?gd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&bd(t,r,s),s};let se=class extends C{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.respondToVisibility=(e,t)=>{var r={root:document.documentElement},a=new IntersectionObserver(s=>{s.forEach(o=>{t(o.intersectionRatio>0)})},r);a.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?ba(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?i`<div class="neutral-card">
                ${e.image?i`<img class="card-media" src="${e.image}" alt="" />`:l}
                <div class="card-body">
                    <div class="card-head">
                        ${e.title?i`<span class="card-title">${e.title}</span>`:l}
                        ${e.status?i`<span theme="badge ${Cs(e.status.type)}">${e.status.message}</span>`:l}
                    </div>
                    ${e.subtitle?i`<div class="card-subtitle">${e.subtitle}</div>`:l}
                    ${e.content?i`<div>${e.content}</div>`:l}
                </div>
        </div>`:i`${e}`,this.hasMore=!1,this.clickedOnCard=e=>{this.state[this.id+"_selected_items"]=[e],this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0}))}}updated(e){super.updated(e);const t=this.data[this.id]?.page;this.hasMore=t?.content?.length<t?.totalElements}firstUpdated(e){super.firstUpdated(e),this.respondToVisibility(this.askForMore,t=>{this.keepAsking=t,t&&this.askToUpper()})}render(){const e=this.data[this.id]?.page;return i`
            <div class="card-container">
                ${e?.content?.map(t=>i`<div @click="${()=>this.clickedOnCard(t)}" class="car-container">${this.renderItem(t)}</div>`)}
                <div id="ask-for-more" style="display: ${this.hasMore?"flex":"none"}; width: 100%; justify-content: center; padding: var(--lumo-space-m); color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Loading more…</div>
            </div>

            <slot></slot>
       `}};se.styles=$`
        ${ur}
        
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
    `;ge([u()],se.prototype,"id",2);ge([u()],se.prototype,"metadata",2);ge([u()],se.prototype,"baseUrl",2);ge([u()],se.prototype,"state",2);ge([u()],se.prototype,"data",2);ge([u()],se.prototype,"appState",2);ge([u()],se.prototype,"appData",2);ge([u()],se.prototype,"emptyStateMessage",2);ge([b()],se.prototype,"keepAsking",2);ge([Ie("#ask-for-more")],se.prototype,"askForMore",2);ge([b()],se.prototype,"hasMore",2);se=ge([x("mateu-card-list")],se);const yd={show:e=>console.debug("[mateu] no notifier registered, dropping toast:",e.text)};let Ss=yd;function $d(e){Ss=e}function _t(e,t){Ss.show(e,t)}var _s=(e=>(e.none="none",e.success="success",e.error="error",e.warning="warning",e.contrast="contrast",e.normal="normal",e))(_s||{}),Es=(e=>(e.primary="primary",e.secondary="secondary",e.tertiary="tertiary",e.tertiaryInline="tertiaryInline",e))(Es||{});const xd=76;function Oa(e){if(e.weight!=null)return e.weight;const t=e.stereotype??"";if(t==="icon")return 1;if(t==="image")return 4;if(t==="html"||t==="richText"||t==="markdown"||t==="textarea")return 5;if(t==="link")return 2.5;if(t==="combobox"||t==="select")return 2;const r=e.dataType??"";return r==="bool"?1:r==="status"||r==="integer"?1.5:r==="number"||r==="date"||r==="money"?2:r==="dateTime"||r==="dateRange"?2.5:3}function wd(e,t){if(e.length===0)return"table";const r=e.reduce((c,p)=>c+Oa(p),0),a=t/xd,s=r/a;if(s<=1)return"table";if(s>1.6||e.length>10)return"masterDetail";const o=e.filter(c=>c.identifier||(c.priority??Number.MAX_SAFE_INTEGER)<=2),n=o.reduce((c,p)=>c+Oa(p),0);return o.length>0&&n<=8?"list":e.some(c=>c.stereotype==="image"||c.stereotype==="html")||o.length===0&&e.length>=4&&e.length<=8?"cards":"masterDetail"}function Is(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,r)=>(t.priority??Number.MAX_SAFE_INTEGER)-(r.priority??Number.MAX_SAFE_INTEGER))}function kd(e){const t=Is(e);return t.length>0?t:e.slice(0,3)}var Cd=Object.defineProperty,Sd=Object.getOwnPropertyDescriptor,ye=(e,t,r,a)=>{for(var s=a>1?void 0:a?Sd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Cd(t,r,s),s};const _d={asc:"ascending",desc:"descending"};let oe=class extends C{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this._columnPrefsRevision=0,this._prefsRevisionApplied=-1,this.search=()=>{const e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{_t({text:e,position:"bottomEnd",variant:"error",duration:3e3},this)},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};const t=this.component.metadata;this._syncStateToUrl(t),!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this.fetchMoreElements=e=>{const{params:t,callback:r}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(r)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(r=>({fieldId:r.__data.path,direction:r.__data.direction?_d[r.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>zt(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get columnPrefsScope(){return window.location.pathname}get effectiveComponent(){const e=this.component,t=e?.metadata;if(!e||!t?.columns)return e;if(this._prefsSource===e&&this._prefsRevisionApplied===this._columnPrefsRevision)return this._prefsApplied;const r=ss(this.columnPrefsScope),a=is(t.columns,r,s=>s.metadata??{});return this._prefsApplied=a===t.columns?e:{...e,metadata:{...t,columns:a}},this._prefsSource=e,this._prefsRevisionApplied=this._columnPrefsRevision,this._prefsApplied}get columnChooserEntries(){return(this.component?.metadata?.columns??[]).map(t=>{const r=t.metadata??{},a=r.id??t.id;return a?{id:a,label:r.label??a,protected:os(r)}:void 0}).filter(t=>!!t)}renderColumnChooser(){const e=this.columnChooserEntries;return e.filter(t=>!t.protected).length===0?l:i`
            <mateu-column-chooser
                .columns="${e}"
                .scope="${this.columnPrefsScope}"
                @column-prefs-changed="${t=>{t.stopPropagation(),this._columnPrefsRevision++}}"
            ></mateu-column-chooser>
        `}get cols(){return this.effectiveComponent?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":wd(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set(["searchText",...(e.filters??[]).flatMap(t=>t.stereotype==="dateRange"||t.stereotype==="numberRange"?[`${t.fieldId}_from`,`${t.fieldId}_to`]:[t.fieldId])])}_syncStateToUrl(e){const t=this._filterIds(e),r=new URLSearchParams(window.location.search);t.forEach(d=>r.delete(d)),r.delete("page"),r.delete("sort"),t.forEach(d=>{const c=this.state[d];c!=null&&c!==""&&r.set(d,String(c))});const a=this.state.page;a&&a>0&&r.set("page",String(a));const s=this.state.sort;if(s&&s.length>0){const d=s.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");d&&r.set("sort",d)}const o=r.toString(),n=o?`${window.location.pathname}?${o}`:window.location.pathname;window.location.pathname+window.location.search!==n&&history.replaceState(null,"",n)}_initStateFromUrl(e,t){const r=new URLSearchParams(window.location.search),a=this._filterIds(e),s={...t};r.forEach((d,c)=>{a.has(c)&&(s[c]=d)});const o=r.get("page");if(o!==null){const d=parseInt(o,10);!isNaN(d)&&d>0&&(s.page=d)}const n=r.get("sort");if(n){const d=n.split(",").map(c=>{const[p,h]=c.split(":");return p&&h?{fieldId:p,direction:h}:null}).filter(Boolean);d.length>0&&(s.sort=d)}return s}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has("component")){const t=this.component?.id;if(t!==this._initializedForComponentId){this._initializedForComponentId=t;const r=this.component?.metadata,a=r.initialPage&&r.initialPage>0?r.initialPage:0;this.state=this._initStateFromUrl(r,{...this.state,size:r.pageSize,page:a,sort:[]}),(this.state.page!==a||this.state.sort?.length>0||[...this._filterIds(r)].some(o=>this.state[o]!=null))&&this.handleSearchRequested(void 0)}}}render(){const e=k=>{const z=[];return k.color&&k.color!==_s.normal&&z.push(k.color),k.buttonStyle&&z.push(k.buttonStyle===Es.tertiaryInline?"tertiary-inline":k.buttonStyle),z.length?z.join(" "):void 0},t=k=>k==="back"||k==="backToList"||!!k&&k.startsWith("cancel"),r=k=>{const z=j.get()?.renderToolbarButton?.(k,this.evalLabel(k.label),()=>this.handleToolbarButtonClick(k.actionId));return z||i`
                <button class="crud-btn"
                        data-action-id="${k.id}"
                        theme="${e(k)||l}"
                        @click="${()=>this.handleToolbarButtonClick(k.actionId)}"
                >${this.evalLabel(k.label)}</button>
            `};if(!this.component)return i`no component`;const a=this.effectiveComponent,s=a.metadata;s.serverSideOrdering=!0;const o=s?.toolbar??[],n=o.filter(k=>t(k.actionId)),d=o.filter(k=>!t(k.actionId)),c=n.length>0&&d.length>0,p=!!s?.title||!!s?.subtitle||o.length>0,h=this.effectiveGridLayout,f=this.cols,v=Is(f),S=this.data[this.id]?.page?.content??[],g=this.state[this.component?.id]?.emptyStateMessage,I=(k,z)=>{const E=z[k.id];if(E==null)return i``;if(k.dataType==="status"){const T=Cs(E.type);return i`<span theme="badge pill ${T}">${E.message}</span>`}return k.dataType==="bool"?i`${E?"✓":"✗"}`:typeof E=="object"?i`${E.label??E.name??E.message??""}`:i`${E}`},U=()=>{const k=this.identifierFieldName,z=this.state._selectedId??this.appState?._splitDetailId,E=v.find(P=>P.identifier)??v[0],T=P=>P.dataType==="action"||P.dataType==="actionGroup"||P.dataType==="menu"||P.stereotype==="button",Pe=v.filter(P=>P!==E&&!T(P)),Rt=f.filter(P=>T(P)),tt=(P,A,N)=>{P.stopPropagation(),P.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:A,parameters:{_clickedRow:N}},bubbles:!0,composed:!0}))},bt=P=>{const A=[];for(const N of Rt){const F=P[N.id];if(N.dataType==="action"){const Oe=F?.methodNameInCrud?F:P.action?.methodNameInCrud?P.action:{methodNameInCrud:N.id,label:N.label,icon:null};A.push(i`
                            <button class="crud-btn" theme="tertiary small" title="${Oe.label||l}"
                                @click="${_=>tt(_,"action-on-row-"+Oe.methodNameInCrud,P)}">
                                ${Oe.icon?H(Oe.icon):l}
                                ${Oe.label??l}
                            </button>`)}else(N.dataType==="actionGroup"||N.dataType==="menu")&&(F?.actions??[]).forEach(_=>A.push(i`
                            <button class="crud-btn" theme="tertiary small" title="${_.label||l}"
                                @click="${ee=>tt(ee,"action-on-row-"+_.methodNameInCrud,P)}">
                                ${_.icon?H(_.icon):l}
                                ${_.label??l}
                            </button>`))}return A.length?i`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${A}
                    </div>`:l};return i`
                <div class="m-listbox" style="width: 100%;">
                    ${S.length===0?i`<div class="m-item" disabled>${er(g)}</div>`:l}
                    ${S.map(P=>i`
                        <div class="m-item"
                            ?selected="${k&&z!==void 0&&String(P[k])===String(z)}"
                            @click="${()=>{k&&P[k]!==void 0&&(this.state={...this.state,_selectedId:String(P[k])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:P},bubbles:!0,composed:!0}))}}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${E?P[E.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${Pe.map(A=>i`<span>${A.label}: ${I(A,P)}</span>`)}
                            </div>
                            ${bt(P)}
                        </div>
                    `)}
                </div>`},ue=(k,z,E)=>{const T=this.identifierFieldName;T&&E[T]!==void 0&&(this.state={...this.state,_selectedId:String(E[T])}),k.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:z,parameters:E},bubbles:!0,composed:!0}))},Q=()=>{const k=this.identifierFieldName,z=this.state._selectedId??this.appState?._splitDetailId,E=f.slice(0,6),T=E.filter(_=>_.stereotype==="image"),Pe=E.find(_=>_.identifier)??E[0],Rt=_=>!!_.actionId,tt=_=>_.dataType==="action"||_.dataType==="actionGroup"||_.dataType==="menu"||_.stereotype==="button",bt=E.find(_=>_.id==="select"&&_.dataType==="action"),P=!!bt,A=E.filter(_=>_!==Pe&&!T.includes(_)&&!Rt(_)&&!tt(_)),N=E.filter(_=>tt(_)&&!(P&&_===bt)),F=(_,ee,rt)=>{_.stopPropagation(),_.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:ee,parameters:{_clickedRow:rt}},bubbles:!0,composed:!0}))},Oe=_=>{const ee=[];for(const rt of N){const Jr=_[rt.id];if(rt.dataType==="action"){const Ut=Jr?.methodNameInCrud?Jr:_.action?.methodNameInCrud?_.action:{methodNameInCrud:rt.id,label:rt.label,icon:null};ee.push(i`
                            <button class="crud-btn" theme="tertiary" title="${Ut.label||l}"
                                @click="${gt=>F(gt,"action-on-row-"+Ut.methodNameInCrud,_)}">
                                ${Ut.icon?H(Ut.icon):l}
                                ${Ut.label??l}
                            </button>`)}else(rt.dataType==="actionGroup"||rt.dataType==="menu")&&(Jr?.actions??[]).forEach(gt=>ee.push(i`
                            <button class="crud-btn" theme="tertiary" title="${gt.label||l}"
                                @click="${Vs=>F(Vs,"action-on-row-"+gt.methodNameInCrud,_)}">
                                ${gt.icon?H(gt.icon):l}
                                ${gt.label??l}
                            </button>`))}return ee.length?i`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${ee}
                    </div>`:l};return i`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${S.length===0?i`<div style="grid-column: 1 / -1;">${er(g)}</div>`:l}
                    ${S.map(_=>i`
                        <div class="crud-card"
                            ?data-selected="${k&&z!==void 0&&String(_[k])===String(z)}"
                            style="cursor: pointer;"
                            @click="${ee=>P?F(ee,"action-on-row-select",_):ue(ee.target,"view",_)}"
                        >
                            ${T.length?i`<img src="${_[T[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: var(--lumo-border-radius-m, 8px);" />`:l}
                            ${Pe?i`<div class="crud-card-title">${_[Pe.id]??""}</div>`:l}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${A.map(ee=>i`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${ee.label}</span>
                                        <span>${I(ee,_)}</span>
                                    </div>
                                `)}
                            </div>
                            ${Oe(_)}
                        </div>
                    `)}
                </div>`},We=()=>{const k=kd(f),z=k.find(T=>T.identifier)??k[0],E=k.filter(T=>T!==z);return i`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <div class="m-listbox" style="width: 100%;">
                            ${S.length===0?i`<div class="m-item" disabled>${er(g)}</div>`:l}
                            ${S.map(T=>i`
                                <div class="m-item"
                                    ?selected="${this.selectedItem===T}"
                                    @click="${()=>{this.selectedItem=T}}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${z?T[z.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${E.map(Pe=>i`${I(Pe,T)} `)}
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?i`
                            <div class="m-formlayout">
                                ${f.map(T=>i`
                                    <label style="display: flex; flex-direction: column; gap: .1rem; font-size: var(--lumo-font-size-s, .875rem);">
                                        <span style="color: var(--lumo-secondary-text-color, #667);">${T.label}</span>
                                        <span>${String(this.selectedItem[T.id]??"")}</span>
                                    </label>
                                `)}
                            </div>
                        `:i`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},ne=()=>{const k=this.identifierFieldName,z=this.state._selectedId??this.appState?._splitDetailId,E=f[0],T=f.slice(1),Pe=!!E?.actionId,Rt=A=>(A??[]).map(N=>{const F=Array.isArray(N.children)?N.children:[];return F.length>0?{...N,children:Rt(F)}:{...N,children:void 0}}),tt=Rt(S),bt=(A,N,F)=>{A.stopPropagation(),k&&N[k]!==void 0&&(this.state={...this.state,_selectedId:String(N[k])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:F,parameters:N},bubbles:!0,composed:!0}))},P=(A,N)=>i`
                <tr class="${k&&z!==void 0&&String(A[k])===String(z)?"selected":""}"
                    style="cursor: pointer;" @click="${F=>bt(F,A,"view")}">
                    ${E?i`<td style="padding-left: ${N*1.2+.6}rem;">${A[E.id]??""}</td>`:l}
                    ${T.map(F=>F.id==="select"?i`<td><button class="crud-btn small" @click="${Oe=>{Oe.stopPropagation(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-select",parameters:{_clickedRow:A}},bubbles:!0,composed:!0}))}}">Select</button></td>`:i`<td>${A[F.id]??""}</td>`)}
                    ${Pe?i`<td style="text-align: end;">${A?.viewable===!1?l:i`<button class="crud-btn small" @click="${F=>bt(F,A,"view")}">View</button>`}</td>`:l}
                </tr>
                ${(A.children??[]).map(F=>P(F,N+1))}
            `;return i`
                <table class="crud-table">
                    <thead><tr>
                        ${E?i`<th>${E.label??l}</th>`:l}
                        ${T.map(A=>i`<th>${A.label??l}</th>`)}
                        ${Pe?i`<th></th>`:l}
                    </tr></thead>
                    <tbody>
                        ${tt.length===0?i`<tr><td colspan="99" style="padding: 1.5rem; text-align: center; color: var(--lumo-secondary-text-color, #888);">${er(g)}</td></tr>`:l}
                        ${tt.map(A=>P(A,0))}
                    </tbody>
                </table>`},W=j.get()?.rendersCrudLayouts?.()===!0,le=()=>{const k=j.get();return k?.renderTreeComponent?k.renderTreeComponent(this,{rows:S,columns:f.map(z=>({id:z.id,label:z.label})),idField:this.identifierFieldName,navigable:!!f[0]?.actionId,selectedId:this.state._selectedId??this.appState?._splitDetailId}):ne()},Z=i`
            ${s.infiniteScrolling?i`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:l}
            ${!W&&h==="list"?U():!W&&h==="cards"?s.contentHeight?i`
                <div class="m-scroll" style="width: 100%; height: ${s.contentHeight};">
                    ${Q()}
                </div>
            `:Q():!W&&h==="masterDetail"?We():!W&&h==="tree"?le():j.get()?.renderTableComponent(this,a,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,pe=s.infiniteScrolling?l:j.get()?.renderPagination(this,this.component),et=this.showImportDialog?i`
            <div class="crud-modal-backdrop" @click="${k=>{k.target===k.currentTarget&&(this.showImportDialog=!1)}}">
                <div class="crud-modal">
                    <h3 style="margin: 0 0 .75rem;">Import</h3>
                    <input type="file" @change="${k=>{const z=k.target.files?.[0];if(z){const E=new FormData;E.append("file",z),fetch("/upload",{method:"POST",body:E}).then(T=>T.json()).then(T=>this.handleImportUploadSuccess({detail:T})).catch(()=>this.notify("Import failed"))}}}">
                    <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                        <button class="crud-btn" @click="${()=>{this.showImportDialog=!1}}">Cancel</button>
                    </div>
                </div>
            </div>
        `:l;return this.standalone?i`
                ${et}
                <div style="border: var(--mateu-section-border, none); background: var(--mateu-section-bg, transparent); overflow: hidden; max-height: calc(100dvh - 12rem); width: 100%; box-sizing: border-box; padding: var(--mateu-section-padding, 0); display: flex; flex-direction: column;">
                    <div style="flex-shrink: 0;">
                        <mateu-content-header
                            .metadata="${s}"
                            .baseUrl="${this.baseUrl}"
                            .state="${this.state}"
                            .data="${this.data}"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                        ></mateu-content-header>
                    </div>
                    <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                        <div style="flex: 1; min-width: 0;">${j.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                        ${this.renderColumnChooser()}
                    </div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${Z}</div>
                    <div style="flex-shrink: 0;">${pe}</div>
                </div>
            `:i`
            ${et}
            ${p?i`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem);">
                        <div style="flex: 1; min-width: 0;">
                            ${s?.title?i`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(s.title)}</h2>
                            `:l}
                            ${s?.subtitle?i`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(s.subtitle)}</span>
                            `:l}
                        </div>
                        ${n.map(k=>r(k))}
                        ${c?i`<span class="toolbar-divider"></span>`:l}
                        ${d.map(k=>r(k))}
                        <slot></slot>
                    </div>
                `:l}
            <div style="border: var(--mateu-section-border, none); background: var(--mateu-section-bg, transparent); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--mateu-section-padding, 0); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                    <div style="flex: 1; min-width: 0;">${j.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                    ${this.renderColumnChooser()}
                </div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${Z}</div>
                <div style="flex-shrink: 0;">${pe}</div>
            </div>
        `}createRenderRoot(){return j.mustUseShadowRoot()?super.createRenderRoot():this}};oe.styles=$`
        ${ur}
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
    `;ye([u()],oe.prototype,"component",2);ye([u()],oe.prototype,"baseUrl",2);ye([u({type:Boolean})],oe.prototype,"standalone",2);ye([u()],oe.prototype,"state",2);ye([u()],oe.prototype,"data",2);ye([u()],oe.prototype,"appState",2);ye([u()],oe.prototype,"appData",2);ye([b()],oe.prototype,"showImportDialog",2);ye([b()],oe.prototype,"availableWidthPx",2);ye([b()],oe.prototype,"selectedItem",2);ye([b()],oe.prototype,"_columnPrefsRevision",2);oe=ye([x("mateu-table-crud")],oe);var ot=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(ot||{}),Ed=Object.defineProperty,Gr=(e,t,r,a)=>{for(var s=void 0,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=n(t,r,s)||s);return s&&Ed(t,r,s),s};class vt extends na{constructor(){super(...arguments),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(r=>r.type==ot.OnLoad).forEach(r=>{if((!r.condition||this._evalExpr(r.condition))&&!r.triggered){const s=r;s.triggered=!0;var a=s.times-1;s.timeoutMillis>0?this.scheduleOnload(s,a,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,r,a)=>{if(a!=this.component?.id)return;const s=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,callbackToken:s},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const r=t,s=(this.component.triggers??[]).filter(o=>o.type==ot.OnCustomEvent).filter(o=>o.eventName==r.type).filter(o=>o.source!=="COMPONENT"||r.detail?.__source===o.from);s.length!==0&&(s.some(o=>!o.source||o.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),s.forEach(o=>{(!o.condition||this._evalExpr(o.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:o.actionId,parameters:r.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return Qa(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return go(t,this.state??{},this.data??{},this._interpolationExtra())}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(rr.Add==t.action)this.component&&this.component.children?.push(t.component);else{if(this.callbackToken=ke(),t.component?.type==Y.ServerSide)if(this.component){const a=this.component,s=t.component;a.actions=s.actions,a.type=s.type,a.rules=s.rules,a.triggers=s.triggers,a.serverSideType=s.serverSideType,a.route=s.route,a.initialData=s.initialData,a.validations=s.validations,a.cssClasses=s.cssClasses,a.slot=s.slot,a.style=s.style,a.children=s.children,(a.serverSideType!=s.serverSideType||a.id!=s.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const a=[t.component];this.component&&(this.component.children=a)}t.action!==rr.ReplaceKeepData&&(this.state={},this.data={})}if(t.state&&(this.state={...this.state,...t.state}),t.data){for(const a in t.data){const s=t.data[a]?.page;s?.pageNumber>0&&this.data[a]&&this.data[a].page.content&&(s.content?s.content=[...this.data[a].page.content,...s.content]:s.content=[...this.data[a].page.content])}this.data={...this.data,...t.data}}this.registerCustomEventListeners();const r=j.getAfterRenderHook();r&&setTimeout(()=>r(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:r,name:a})=>r.removeEventListener(a,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(r=>r.type==ot.OnCustomEvent).forEach(r=>{const a=r.source==="DOCUMENT"||r.source==="COMPONENT"?document:this;a.addEventListener(r.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:a,name:r.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:r})=>t.removeEventListener(r,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}Gr([u()],vt.prototype,"state");Gr([u()],vt.prototype,"data");Gr([u()],vt.prototype,"appData");Gr([u()],vt.prototype,"appState");const Ps="mateu-recent-routes",Id=8;function Os(){try{return JSON.parse(localStorage.getItem(Ps)??"{}")}catch{return{}}}function Pd(e){try{localStorage.setItem(Ps,JSON.stringify(e))}catch{}}function Ta(e){return Os()[e||"_"]??[]}function Od(e,t){if(!t?.route||!t.label)return;const r=e||"_",a=Os(),o=(a[r]??[]).filter(n=>n.route!==t.route);o.unshift({route:t.route,label:t.label}),a[r]=o.slice(0,Id),Pd(a)}var Td=Object.defineProperty,zd=Object.getOwnPropertyDescriptor,qe=(e,t,r,a)=>{for(var s=a>1?void 0:a?zd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Td(t,r,s),s};let me=class extends C{constructor(){super(...arguments),this.baseUrl="",this.open=!1,this.queryText="",this.dataHits=[],this.loading=!1,this.selectedIndex=0,this.fabOffset=0,this.keydownHandler=null}connectedCallback(){super.connectedCallback(),this.keydownHandler=e=>{(e.metaKey||e.ctrlKey)&&(e.key==="k"||e.key==="K")?(e.preventDefault(),this.toggle()):e.key==="Escape"&&this.open&&this.close()},document.addEventListener("keydown",this.keydownHandler),this.setupFabObserver()}disconnectedCallback(){super.disconnectedCallback(),this.keydownHandler&&document.removeEventListener("keydown",this.keydownHandler),clearTimeout(this.searchTimer),this.fabObserver?.disconnect(),this.fabObserver=void 0}setupFabObserver(){const e=this.getRootNode(),t=e instanceof ShadowRoot?e:document.body;this.measureFabStack(),this.fabObserver?.disconnect(),this.fabObserver=new MutationObserver(()=>this.measureFabStack()),this.fabObserver.observe(t,{childList:!0,subtree:!0})}measureFabStack(){const r=(this.getRootNode().querySelectorAll?.(".ai-fab, .app-fab, .page-fab").length??0)*4;r!==this.fabOffset&&(this.fabOffset=r)}updated(e){e.has("open")&&this.open&&requestAnimationFrame(()=>this.inputEl?.focus())}toggle(){this.open?this.close():this.openCenter()}openCenter(){this.open=!0,this.queryText="",this.dataHits=[],this.selectedIndex=0}close(){this.open=!1,this.queryText="",this.dataHits=[],clearTimeout(this.searchTimer)}flattenMenu(e,t){const r=[];for(const a of e??[])if(!a.separator)if(a.submenus&&a.submenus.length>0){const s=t?`${t} › ${a.label}`:a.label;r.push(...this.flattenMenu(a.submenus,s))}else a.route!==void 0&&a.route!==null&&r.push({label:a.label,breadcrumb:t,route:a.route});return r}onInput(e){this.queryText=e,this.selectedIndex=0;const t=e.trim();if(clearTimeout(this.searchTimer),!t||!this.app?.globalSearchEnabled){this.dataHits=[],this.loading=!1;return}this.loading=!0,this.searchTimer=setTimeout(()=>this.fetchGlobalSearch(t),250)}async fetchGlobalSearch(e){const t=this.app;if(!t?.globalSearchEnabled){this.loading=!1;return}try{const a=(await Tt.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","command-center",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(s=>s.data).find(s=>s&&s._globalsearch);this.dataHits=a?._globalsearch??[]}catch{this.dataHits=[]}finally{this.loading=!1}}navigateTo(e,t){Od(this.app?.serverSideType??"",{route:e,label:t}),this.close();for(const r of["route-changed","navigate-to-requested"])this.dispatchEvent(new CustomEvent(r,{detail:{route:e},bubbles:!0,composed:!0}))}askAi(){const e=this.queryText.trim();this.close(),this.dispatchEvent(new CustomEvent("mateu-open-ai",{detail:{query:e},bubbles:!0,composed:!0}))}visibleTargets(e){if(!this.queryText.trim()){const t=this.flattenMenu(this.app?.menu,"").map(a=>({route:a.route,label:a.label})),r=Ta(this.app?.serverSideType??"");return[...t,...r]}return[...e.map(t=>({route:t.route,label:t.label})),...this.dataHits.map(t=>({route:t.route,label:t.label}))]}onKeydown(e,t){if(e.key==="ArrowDown")e.preventDefault(),this.selectedIndex=Math.min(this.selectedIndex+1,t.length-1);else if(e.key==="ArrowUp")e.preventDefault(),this.selectedIndex=Math.max(this.selectedIndex-1,0);else if(e.key==="Enter"){const r=t[this.selectedIndex];r&&this.navigateTo(r.route,r.label)}}render(){return i`
            <button class="cc-fab" style="bottom: ${1.5+this.fabOffset}rem;"
                @click=${()=>this.openCenter()} title="Buscar y navegar (⌘K)" aria-label="Command center">
                ${this.fabIcon()}
            </button>
            ${this.open?this.renderOverlay():l}
        `}fabIcon(){return i`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>`}renderOverlay(){const e=this.queryText.trim().toLowerCase(),t=e?this.flattenMenu(this.app?.menu,"").filter(a=>a.label.toLowerCase().includes(e)||a.breadcrumb.toLowerCase().includes(e)):[],r=this.visibleTargets(t);return i`
            <div class="cc-backdrop" @click=${()=>this.close()}>
                <div class="cc-panel" @click=${a=>a.stopPropagation()}>
                    <div class="cc-bar">
                        <button class="cc-icon-btn" @click=${()=>this.queryText?this.onInput(""):this.close()} title="${this.queryText?"Borrar":"Cerrar"}">
                            ${this.queryText?this.backIcon():this.searchGlyph()}
                        </button>
                        <input class="cc-input" .value=${this.queryText} placeholder="Buscar pantallas, datos y acciones…"
                            @input=${a=>this.onInput(a.target.value)}
                            @keydown=${a=>this.onKeydown(a,r)}>
                        ${this.queryText?i`<button class="cc-icon-btn" @click=${()=>this.onInput("")} title="Limpiar">${this.clearIcon()}</button>`:l}
                    </div>
                    <div class="cc-body">
                        ${e?this.renderResults(t):this.renderDefault()}
                    </div>
                </div>
                <button class="cc-close" @click=${()=>this.close()} title="Cerrar">${this.clearIcon()}</button>
            </div>
        `}renderDefault(){const e=this.flattenMenu(this.app?.menu,""),t=Ta(this.app?.serverSideType??"");let r=-1;return i`
            <div class="cc-columns">
                <div class="cc-col">
                    <div class="cc-section-title">Ir a</div>
                    <div class="cc-tiles">
                        ${e.map(a=>{r++;const s=r;return i`
                            <button class="cc-tile ${s===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(a.route,a.label)}
                                @mouseenter=${()=>{this.selectedIndex=s}}>
                                <span class="cc-tile-label">${a.label}</span>
                                ${a.breadcrumb?i`<span class="cc-sub">${a.breadcrumb}</span>`:l}
                            </button>`})}
                        ${e.length===0?i`<div class="cc-empty">Sin opciones de menú.</div>`:l}
                    </div>
                </div>
                ${t.length>0?i`
                    <div class="cc-col cc-col--recent">
                        <div class="cc-section-title">Recientes</div>
                        ${t.map(a=>{r++;const s=r;return i`
                            <button class="cc-row ${s===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(a.route,a.label)}
                                @mouseenter=${()=>{this.selectedIndex=s}}>
                                <span class="cc-tile-label">${a.label}</span>
                            </button>`})}
                    </div>`:l}
            </div>
        `}renderResults(e){if(this.loading&&this.dataHits.length===0&&e.length===0)return i`<div class="cc-list">${[0,1,2,3].map(()=>i`<div class="cc-skeleton"></div>`)}</div>`;const t=e.length===0&&this.dataHits.length===0;return i`
            <div class="cc-list">
                ${this.app?.sseUrl?i`
                    <button class="cc-row cc-ask-ai" @click=${()=>this.askAi()}>
                        ${this.aiIcon()}<span class="cc-tile-label">Preguntar a la IA: “${this.queryText.trim()}”</span>
                    </button>`:l}
                ${e.length>0?i`<div class="cc-section-title">Pantallas</div>`:l}
                ${e.map((r,a)=>i`
                    <button class="cc-row ${a===this.selectedIndex?"cc-sel":""}"
                        @click=${()=>this.navigateTo(r.route,r.label)}
                        @mouseenter=${()=>{this.selectedIndex=a}}>
                        <span class="cc-tile-label">${r.label}</span>
                        ${r.breadcrumb?i`<span class="cc-sub">${r.breadcrumb}</span>`:l}
                    </button>`)}
                ${this.renderDataHits(e.length)}
                ${t?i`<div class="cc-empty">No encontramos coincidencias para “${this.queryText.trim()}”.</div>`:l}
            </div>
        `}renderDataHits(e){if(this.dataHits.length===0)return l;let t;return i`${this.dataHits.map((r,a)=>{const s=e+a,o=r.category&&r.category!==t;return t=r.category,i`
                ${o?i`<div class="cc-section-title">${r.category}</div>`:l}
                <button class="cc-row ${s===this.selectedIndex?"cc-sel":""}"
                    @click=${()=>this.navigateTo(r.route,r.label)}
                    @mouseenter=${()=>{this.selectedIndex=s}}>
                    <span class="cc-tile-label">${r.label}</span>
                    ${r.description?i`<span class="cc-sub">${r.description}</span>`:l}
                </button>`})}`}searchGlyph(){return i`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`}backIcon(){return i`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`}clearIcon(){return i`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`}aiIcon(){return i`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 4.7L19 8.5l-4.1 2.3L12 15l-1.9-4.2L6 8.5l5.1-1.8z"></path></svg>`}};me.styles=$`
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
    `;qe([u({attribute:!1})],me.prototype,"app",2);qe([u()],me.prototype,"baseUrl",2);qe([b()],me.prototype,"open",2);qe([b()],me.prototype,"queryText",2);qe([b()],me.prototype,"dataHits",2);qe([b()],me.prototype,"loading",2);qe([b()],me.prototype,"selectedIndex",2);qe([b()],me.prototype,"fabOffset",2);qe([Ie(".cc-input")],me.prototype,"inputEl",2);me=qe([x("mateu-command-center")],me);let Te=null;function Ad(e){const t=e.component?.metadata;!!(t&&(t.commandCenterEnabled||t.chromeless)&&t.variant!=="MEDIATOR")?((!Te||!Te.isConnected)&&(Te=document.createElement("mateu-command-center"),e.renderRoot.appendChild(Te)),Te.app=t,Te.baseUrl=e.baseUrl??""):Te&&e.renderRoot.contains(Te)&&(Te.remove(),Te=null)}var Ld=Object.defineProperty,Dd=Object.getOwnPropertyDescriptor,Ts=(e,t,r,a)=>{for(var s=a>1?void 0:a?Dd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Ld(t,r,s),s};let Rr=class extends C{constructor(){super(...arguments),this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1;const t=e.detail.reason,r=t?.message??String(t);_t({text:r,variant:"error",duration:3e3,position:"bottomEnd"},this)}}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-called-event",this.fetchStarted),this.addEventListener("backend-succeeded-event",this.fetchFinished),this.addEventListener("backend-cancelled-event",this.fetchFailed),this.addEventListener("backend-failed-event",this.fetchFailed)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-succeeded-event",this.fetchStarted),this.removeEventListener("backend-succeeded-event",this.fetchFinished),this.removeEventListener("backend-cancelled-event",this.fetchFailed),this.removeEventListener("backend-failed-event",this.fetchFailed)}render(){return i`<div class="loader-container">
            <div style="display: flex; flex-direction: column;">
                <slot></slot>
                <div class="loader-frame ${this.loading?"delayed-show":""}" style="${this.loading?"pointer-events: all;":"display: none;"}"><div class="loader"></div></div>
            </div>
        </div>`}};Rr.styles=$`
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

            background: rgba(255, 255, 255, 0.6);

            opacity: 0;
        }

        .delayed-show {
            animation: showLoader 1s ease 0.3s forwards;
        }

        @keyframes showLoader {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        
        /* HTML: <div class="loader"></div> */
        .loader {
            width: 1rem;
            --b: 1px;
            aspect-ratio: 1;
            border-radius: 50%;
            background: #514b82;
            -webkit-mask:
                    repeating-conic-gradient(#0000 0deg,#000 1deg 70deg,#0000 71deg 90deg),
                    radial-gradient(farthest-side,#0000 calc(100% - var(--b) - 1px),#000 calc(100% - var(--b)));
            -webkit-mask-composite: destination-in;
            mask-composite: intersect;
            animation: l5 1s infinite;
        }
        @keyframes l5 {to{transform: rotate(.5turn)}}
  `;Ts([b()],Rr.prototype,"loading",2);Rr=Ts([x("mateu-api-caller")],Rr);class Rd{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const $t=new Rd;var Ud=Object.defineProperty,jd=Object.getOwnPropertyDescriptor,q=(e,t,r,a)=>{for(var s=a>1?void 0:a?jd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Ud(t,r,s),s};let R=class extends vt{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this.commandPaletteDataHits=[],this.openDataHit=e=>{$t.confirmLeave()&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteDataHits=[],this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:e.route},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:e.route},bubbles:!0,composed:!0})))},this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this._openAiHandler=()=>{this.chatOpen||this.showHideIa()},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const r=this.renderRoot.querySelector?.("mateu-component");r&&r.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const r=e[t];if(r.selected)return r;const a=this.getSelectedOption(r.submenus);if(a)return a}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const r=[];for(const a of e)if(!a.separator)if(a.submenus&&a.submenus.length>0){const s=t?`${t} › ${a.label}`:a.label;r.push(...this.flattenMenuForPalette(a.submenus,s))}else r.push({label:a.label,breadcrumb:t,consumedRoute:a.consumedRoute,route:a.route,actionId:a.actionId,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix});return r},this.handleCommandPaletteKeydown=(e,t)=>{const r=Math.min(t.length,10),a=r+Math.min(this.commandPaletteDataHits.length,8);if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,a-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){if(this.commandPaletteSelectedIndex>=r){const o=this.commandPaletteDataHits[this.commandPaletteSelectedIndex-r];o&&this.openDataHit(o);return}const s=t[this.commandPaletteSelectedIndex];s&&(this.selectRoute(s.consumedRoute,s.route,s.actionId,s.baseUrl,s.serverSideType,s.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return l;const e=this.component?.metadata;if(e?.commandCenterEnabled)return l;if(!e?.menu)return l;const t=this.flattenMenuForPalette(e.menu,""),r=this.commandPaletteQuery.toLowerCase(),a=r?t.filter(s=>s.label.toLowerCase().includes(r)||s.breadcrumb.toLowerCase().includes(r)):t;return i`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}>
                <div class="cmd-palette" @click=${s=>s.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        ${H("vaadin:search",void 0,"cmd-search-icon")}
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${s=>{this.commandPaletteQuery=s.target.value,this.commandPaletteSelectedIndex=0,this.fetchGlobalSearch(this.commandPaletteQuery)}}
                            @keydown=${s=>this.handleCommandPaletteKeydown(s,a)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${a.slice(0,10).map((s,o)=>i`
                            <div class="cmd-result ${o===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                @click=${()=>{this.selectRoute(s.consumedRoute,s.route,s.actionId,s.baseUrl,s.serverSideType,s.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=o}}
                            >
                                <span class="cmd-result-label">${s.label}</span>
                                ${s.breadcrumb?i`<span class="cmd-result-breadcrumb">${s.breadcrumb}</span>`:l}
                            </div>
                        `)}
                        ${r&&this.commandPaletteDataHits.length>0?i`
                            ${this.commandPaletteDataHits.slice(0,8).map((s,o)=>{const n=Math.min(a.length,10)+o,d=this.commandPaletteDataHits[o-1];return i`
                                    ${s.category&&s.category!==d?.category?i`
                                        <div class="cmd-category">${s.category}</div>`:l}
                                    <div class="cmd-result ${n===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                         @click=${()=>this.openDataHit(s)}
                                         @mouseenter=${()=>{this.commandPaletteSelectedIndex=n}}
                                    >
                                        <span class="cmd-result-label">${s.label}</span>
                                        ${s.description?i`<span class="cmd-result-breadcrumb">${s.description}</span>`:l}
                                    </div>`})}`:l}
                        ${a.length===0&&this.commandPaletteDataHits.length===0?i`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:l}
                    </div>
                </div>
            </div>
        `},this.renderRail=e=>i`
            <div class="nav-rail">
                ${e.map(t=>this.renderRailItem(t))}
            </div>
        `,this.renderRailItem=e=>{const t=e.submenus?.length>0?this.railOpenOption?.label===e.label:e.selected;return i`
            <div class="rail-item ${t?"rail-item--active":""}"
                @click=${()=>{e.submenus&&e.submenus.length>0?this.railOpenOption=this.railOpenOption?.label===e.label?null:e:(this.railOpenOption=null,this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix))}}
            >
                ${e.icon?H(e.icon,void 0,"rail-icon"):i`<div class="rail-icon-placeholder">${e.label.charAt(0).toUpperCase()}</div>`}
                <span class="rail-label">${e.label}</span>
            </div>
        `},this.renderRailSubPanel=e=>i`
            <div class="rail-sub-panel">
                <div class="rail-sub-title">${e.label}</div>
                ${e.submenus.map(t=>i`
                    <div class="rail-sub-item ${t.selected?"rail-sub-item--active":""}"
                        @click=${()=>{t.submenus&&t.submenus.length>0?this.railOpenOption=t:this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}
                    >${t.label}</div>
                `)}
            </div>
        `,this.renderTilesHub=e=>i`
            <div style="padding: 2rem;">
                <h2 style="margin-top: 0; margin-bottom: 1.5rem;">${e.label}</h2>
                <div class="tiles-hub-grid">
                    ${e.submenus.map(t=>i`
                        <div class="nav-tile"
                            @click=${()=>{t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))}}
                        >
                            ${t.icon?H(t.icon,"font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;"):l}
                            <div class="nav-tile-title">${t.label}</div>
                            ${t.description?i`<div class="nav-tile-desc">${t.description}</div>`:l}
                        </div>
                    `)}
                </div>
            </div>
        `,this.goHome=()=>{const e=this.component.metadata;this.selectRoute(e.route,"_page","",void 0,void 0,void 0)},this.selectRoute=(e,t,r,a,s,o)=>{$t.confirmLeave()&&this._selectRoute(e,t,r,a,s,o)},this._selectRoute=(e,t,r,a,s,o)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=a,this.selectedRoute=t,this.selectedServerSideType=s,this.selectedUriPrefix=o,this.instant=ke(),this.state&&this.state._route!=null&&(this.state._route=void 0);let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let d=new URL(n+t);if(e&&d.pathname.startsWith(e)){const c=d.pathname.substring(e.length);d=new URL(d.origin+(c||"/"))}if((window.location.pathname||d.pathname)&&window.location.pathname!=d.pathname){let c=d.pathname;d.search&&(c+=d.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let p=c;this.selectedUriPrefix&&(p.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?p=this.selectedUriPrefix+p.substring(1):!p.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?p=this.selectedUriPrefix+"/"+p:p=this.selectedUriPrefix+p),p=="/_page"&&(p=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:p},bubbles:!0,composed:!0}))}}},this.mapItems=(e,t)=>e.map(r=>{if(r.submenus&&r.submenus.length>0){let a=this.mapItems(r.submenus,t);return t&&r.label.toLowerCase().includes(t)&&(a=this.mapItems(r.submenus,"")),a&&a.length>0?{consumedRoute:r.consumedRoute,text:r.label,route:r.route,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix,actionId:r.actionId,selected:t||r.selected,children:a}:void 0}if(r.separator)return t?void 0:{component:"hr"};if(!t||r.label.toLowerCase().includes(t))return{consumedRoute:r.consumedRoute,text:r.label,route:r.route,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix,actionId:r.actionId,selected:t||r.selected}}).filter(r=>r!=null),this.getSelectedIndex=e=>{if(e){const t=this.getSelectedOption(e);if(t)return e.indexOf(t)}return NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?i`
                <details open class="left-menu-group">
                    <summary>${e.label}</summary>
                    <div class="left-menu-children">
                        ${e.submenus.map(t=>i`${this.renderOptionOnLeftMenu(t)}`)}
                    </div>
                </details>
`:i`<button class="left-menu-item"
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",ke())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?i`
            ${e.map(r=>{const a=r;return i`

                        ${a.component=="hr"?i`<hr/>`:i`
                                <div class="side-nav-item ${a.selected?"side-nav-item--active":""}">
                                    <button class="side-nav-link"
                                            @click="${()=>{a.route&&!a.children&&this.selectRoute(void 0,a.route,void 0,this.baseUrl,void 0,void 0)}}">
                                        ${a.icon?H("vaadin:dashboard","margin-right:.5rem;"):l}${a.text}
                                    </button>
                                    ${a.children?i`<div class="side-nav-children">${this.renderSideNav(a.children,"children")}</div>`:l}
                                </div>
                        `}

                            `})}`:l,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return j.mustUseShadowRoot()?super.createRenderRoot():(R.injectLightDomStyles(),this)}static injectLightDomStyles(){if(R.lightDomStylesInjected||typeof document>"u"||(R.lightDomStylesInjected=!0,document.getElementById("mateu-app-light-styles")))return;const e=R.styles,t=Array.isArray(e)?e.map(a=>a?.cssText??"").join(`
`):e?.cssText??"";if(!t)return;const r=document.createElement("style");r.id="mateu-app-light-styles",r.textContent=t,document.head.appendChild(r)}fetchGlobalSearch(e){const t=this.component?.metadata;if(t?.globalSearchEnabled){if(clearTimeout(this._globalSearchTimer),!e){this.commandPaletteDataHits=[];return}this._globalSearchTimer=setTimeout(async()=>{try{const a=(await Tt.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","cmd-palette",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(s=>s.data).find(s=>s&&s._globalsearch);this.commandPaletteDataHits=a?._globalsearch??[]}catch{this.commandPaletteDataHits=[]}},250)}}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{this.component?.metadata?.commandCenterEnabled||((e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=""))},document.addEventListener("keydown",this._commandPaletteHandler),$t.install(),this.addEventListener("compact-changed",this._compactHandler),this.addEventListener("mateu-open-ai",this._openAiHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler),this.removeEventListener("mateu-open-ai",this._openAiHandler)}updated(e){if(super.updated(e),Ad(this),this.component){const r=this.component.metadata;if(r){const a=r;if(a.favicon){let s=document.querySelector("link[rel~='icon']");s||(s=document.createElement("link"),s.rel="icon",document.head.appendChild(s)),s.href=a.favicon}e.has("component")&&(this.selectedRoute=a.homeRoute,this.selectedConsumedRoute=a.homeConsumedRoute,this.selectedServerSideType=a.homeServerSideType,this.selectedBaseUrl=a.homeBaseUrl,this.selectedUriPrefix=a.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return j.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};R.lightDomStylesInjected=!1;R.styles=$`
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

  `;q([b()],R.prototype,"filter",2);q([b()],R.prototype,"instant",2);q([b()],R.prototype,"selectedConsumedRoute",2);q([b()],R.prototype,"selectedRoute",2);q([b()],R.prototype,"selectedUriPrefix",2);q([b()],R.prototype,"selectedBaseUrl",2);q([b()],R.prototype,"selectedServerSideType",2);q([b()],R.prototype,"selectedParams",2);q([b()],R.prototype,"tilesMenuOption",2);q([b()],R.prototype,"railOpenOption",2);q([b()],R.prototype,"commandPaletteOpen",2);q([b()],R.prototype,"commandPaletteQuery",2);q([b()],R.prototype,"commandPaletteSelectedIndex",2);q([b()],R.prototype,"commandPaletteDataHits",2);q([b()],R.prototype,"pageCompact",2);q([Ie("mateu-chat")],R.prototype,"chat",2);q([b()],R.prototype,"isDark",2);q([b()],R.prototype,"chatOpen",2);q([Ie(".mateu-app-layout")],R.prototype,"vaadinAppLayout",2);R=q([x("mateu-app")],R);var Md=Object.defineProperty,Nd=Object.getOwnPropertyDescriptor,He=(e,t,r,a)=>{for(var s=a>1?void 0:a?Nd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Md(t,r,s),s};let he=class extends C{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",r=>{const o=r.keyCode||r.which;(o===32||o===13)&&t.click()})}}render(){return i`
       `}};he.styles=$`
  `;He([u()],he.prototype,"message",2);He([u()],he.prototype,"dismiss",2);He([u()],he.prototype,"learnMore",2);He([u()],he.prototype,"learnMoreLink",2);He([u()],he.prototype,"showLearnMore",2);He([u()],he.prototype,"position",2);He([u()],he.prototype,"cookieName",2);He([b()],he.prototype,"_css",2);He([Ie('[aria-label="cookieconsent"]')],he.prototype,"popup",2);he=He([x("mateu-cookie-consent")],he);var Fd=Object.defineProperty,Bd=Object.getOwnPropertyDescriptor,zs=(e,t,r,a)=>{for(var s=a>1?void 0:a?Bd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Fd(t,r,s),s};let Ur=class extends C{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return i`<slot></slot>`}};Ur.styles=$`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;zs([u()],Ur.prototype,"target",2);Ur=zs([x("mateu-event-interceptor")],Ur);var qd=Object.defineProperty,Hd=Object.getOwnPropertyDescriptor,As=(e,t,r,a)=>{for(var s=a>1?void 0:a?Hd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&qd(t,r,s),s};let jr=class extends vt{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),500)},this.onKeydown=e=>{e.key==="Escape"&&this.opened&&(e.stopPropagation(),this.close())}}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this.onKeydown)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}render(){if(!this.opened)return i``;const e=this.component.metadata,t=ar(e.headerTitle,this.state,this.data,this.appState,this.appData),r=!!(t||e.header||e.closeButtonOnHeader),a=[e.width?`width:${e.width};`:"min-width:min(90vw,28rem);",e.height?`height:${e.height};`:"",e.top?`margin-top:${e.top};`:""].join("");return i`
            <div class="backdrop ${e.modeless?"modeless":""}"
                 @click="${s=>{!e.modeless&&s.target===s.currentTarget&&this.close()}}">
                <div class="dialog ${e.noPadding?"no-padding":""} ${this.component?.cssClasses??""}" style="${a} ${this.component?.style??""}">
                    ${r?i`
                        <div class="dialog-header">
                            <mateu-event-interceptor .target="${this}" style="flex:1; min-width:0;">
                                ${t?i`<span class="dialog-title">${t}</span>`:l}
                                ${e.header?w(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):l}
                            </mateu-event-interceptor>
                            ${e.closeButtonOnHeader?i`<button class="dialog-close" @click="${this.close}" aria-label="Close">✕</button>`:l}
                        </div>`:l}
                    ${e.content?i`
                        <div class="dialog-body">
                            <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width:100%;">
                                ${w(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:l}
                    ${e.footer?i`
                        <div class="dialog-footer">
                            <mateu-event-interceptor .target="${this}" style="width:100%;">
                                ${w(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:l}
                </div>
            </div>
        `}};jr.styles=$`
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
    `;As([b()],jr.prototype,"opened",2);jr=As([x("mateu-dialog")],jr);var Vd=Object.defineProperty,Wd=Object.getOwnPropertyDescriptor,Kr=(e,t,r,a)=>{for(var s=a>1?void 0:a?Wd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Vd(t,r,s),s};let we=class extends vt{constructor(){super(...arguments),this.opened=!1,this.maximizeSteps=0,this.collapsed=!1,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),300)},this._escListener=e=>{if(e.key!=="Escape")return;const r=this.getRootNode().querySelectorAll("mateu-drawer, mateu-dialog");r[r.length-1]===this&&(e.stopPropagation(),this.close())}}effectiveWidth(e){if(e.width)return e.width;if(!e.size)return;const t=we.SIZE_LADDER,r=Math.max(0,t.indexOf(e.size)),a=Math.min(t.length-1,r+this.maximizeSteps);return we.SIZE_WIDTHS[t[a]]}canMaximize(e){if(!e.maximizable)return!1;const t=we.SIZE_LADDER;return Math.max(0,t.indexOf(e.size??"m"))+this.maximizeSteps<t.length-1}firstUpdated(){requestAnimationFrame(()=>this.opened=!0)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._escListener)}disconnectedCallback(){document.removeEventListener("keydown",this._escListener),super.disconnectedCallback()}render(){const e=this.component.metadata,t=e.position??"end",r=ar(e.headerTitle,this.state,this.data,this.appState,this.appData),a=ar(e.subtitle,this.state,this.data,this.appState,this.appData),s=this.effectiveWidth(e),o=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0;return i`
        ${e.modeless?l:i`
            <div class="backdrop ${this.opened?"open":""}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${t} ${this.opened?"open":""} ${this.collapsed?"collapsed":""} ${this.component?.cssClasses??""}"
                role="dialog"
                aria-modal="${!e.modeless}"
                aria-label="${r??l}"
                style="${s&&t!=="bottom"?`width: ${s};`:""}${this.component?.style??""}"
        >
            <header>
                ${r?i`<div class="titles"><h3>${r}</h3>${a?i`<span class="subtitle">${a}</span>`:l}</div>`:i`<span class="spacer"></span>`}
                ${e.header?i`
                    <mateu-event-interceptor .target="${this}">${w(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:l}
                ${o?i`
                    <button class="drawer-icon" aria-label="${o.prevLabel??"Previous"}" title="${o.prevLabel??"Previous"}"
                            ?disabled="${!o.prevRoute}" @click="${()=>{o.prevRoute&&(window.location.href=o.prevRoute)}}">‹</button>
                    <button class="drawer-icon" aria-label="${o.nextLabel??"Next"}" title="${o.nextLabel??"Next"}"
                            ?disabled="${!o.nextRoute}" @click="${()=>{o.nextRoute&&(window.location.href=o.nextRoute)}}">›</button>
                `:l}
                ${e.collapsible?i`
                    <button class="drawer-icon" aria-label="${this.collapsed?"Expand":"Collapse"}" title="${this.collapsed?"Expand":"Collapse"}"
                            @click="${()=>this.collapsed=!this.collapsed}">${this.collapsed?"▴":"▾"}</button>
                `:l}
                ${this.canMaximize(e)?i`
                    <button class="drawer-icon" aria-label="Maximize" title="Maximize" @click="${()=>this.maximizeSteps++}">⤢</button>
                `:l}
                <button class="drawer-close" aria-label="Close" @click="${this.close}">✕</button>
            </header>
            ${this.collapsed?l:i`
            <div class="content ${e.noPadding?"no-padding":""}">
                ${e.content?i`
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${w(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:l}
            </div>
            ${e.footer?i`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${w(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:l}
            `}
        </section>
       `}};we.SIZE_LADDER=["s","m","l","xl"];we.SIZE_WIDTHS={s:"464px",m:"648px",l:"968px",xl:"90vw"};we.styles=$`
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
  `;Kr([b()],we.prototype,"opened",2);Kr([b()],we.prototype,"maximizeSteps",2);Kr([b()],we.prototype,"collapsed",2);we=Kr([x("mateu-drawer")],we);var Gd=Object.defineProperty,Kd=Object.getOwnPropertyDescriptor,ie=(e,t,r,a)=>{for(var s=a>1?void 0:a?Kd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Gd(t,r,s),s};function za(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let V=class extends C{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,r=t.banners??[],a=t.append??!1;a?this.actionBanners=[...this.actionBanners,...r]:(this._clearActionBannerTimers(),this.actionBanners=r);const s=a?this.actionBanners.length-r.length:0;r.forEach((o,n)=>{if(o.timeoutSeconds&&o.timeoutSeconds>0){const d=s+n;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,p)=>p!==d)},o.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const r=parseInt(t[1],10)-1;r>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(r))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,r=this.shadowRoot?.querySelector("mateu-content-header");let a=r?r.getBoundingClientRect().bottom:0;for(const n of e){if(!n.classList.contains("mateu-section--sticky"))continue;const d=n.getBoundingClientRect();d.top<=a+t+2&&(a=Math.max(a,d.bottom))}const s=a+t+4;let o=0;this._tocEntries.forEach((n,d)=>{n.el.getBoundingClientRect().top<=s&&(o=d)}),this._activeToc=o}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){if(super.updated(e),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")){const t=this.component?.metadata?.level??0;this.toggleAttribute("data-nested",t>0),this._scheduleStaticBannerTimeouts(),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")},bubbles:!0,composed:!0})),this._scheduleTocRebuild()}}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(r=>clearTimeout(r)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((r,a)=>{r.timeoutSeconds&&r.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,a])},r.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,r)=>r!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return zt(e,this.state,this.data)}_renderBanner(e,t){const r=this._evalBannerText(e.title),a=this._evalBannerText(e.description);return i`
            <div class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${r||e.hasCloseButton?i`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${r??""}</span>
                        ${e.hasCloseButton?i`
                            <button class="banner-close" @click=${t} title="Dismiss" aria-label="Dismiss">✕</button>
                        `:l}
                    </div>
                `:l}
                ${a?i`<p>${a}</p>`:l}
            </div>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(".mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(o=>({title:this._sectionTitle(o),el:o})).filter(o=>!!o.title),r=this.component?.metadata?.toc,a=t.length>4&&e.every(o=>!o.closest("vaadin-horizontal-layout")),s=(r===!0?!0:r===!1?!1:a)&&t.length>0;this._tocEntries=t,this._tocVisible=s,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),s?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header");this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty("--mateu-header-h",this._headerH+"px");const t=12;let r=this._headerH+t;for(const a of this._sectionCards())a.classList.contains("mateu-section--sticky")&&(a.style.top=r+"px",r+=a.offsetHeight+t)}_scrollContainer(){let e=za(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=za(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const r=12;let a=this._headerH+r;for(const d of this._sectionCards()){if(d===t.el)break;d.classList.contains("mateu-section--sticky")&&(a+=d.offsetHeight+r)}const s=this._scrollContainer(),o=s?s.getBoundingClientRect().top:0,n=t.el.getBoundingClientRect().top-o-a;(s??window).scrollBy({top:n,behavior:"smooth"})}_showHeaderBand(){const e=this.component?.metadata,t=!!(e?.title||e?.subtitle||e?.toolbar?.length),r=!!this.component?.children?.some(a=>a.metadata?.type===m.Crud);return t&&!r&&!this._hasWelcomeBanner()}_hasWelcomeBanner(){const e=t=>t?.metadata?.type===m.HeroSection?!0:(t?.children??[]).some(e);return(this.component?.children??[]).some(e)}render(){const e=this.component?.metadata,a=[...(e?.banners??[]).map((o,n)=>({banner:o,index:n})).filter(({index:o})=>!this.dismissedStaticBannerIndices.has(o)).map(({banner:o,index:n})=>({banner:o,onDismiss:()=>this._dismissStaticBanner(n)})),...this.actionBanners.map((o,n)=>({banner:o,onDismiss:()=>this._dismissActionBanner(n)}))],s=i`
            <div class="page-header-wrap">
                <mateu-content-header
                    class="${this._tocVisible?"sticky-header":""}"
                    .metadata="${e}"
                    .baseUrl="${this.baseUrl}"
                    .state="${this.state}"
                    .data="${this.data}"
                    .appState="${this.appState}"
                    .appData="${this.appData}"
                ></mateu-content-header>
                ${this._showHeaderBand()?i`
                    <div class="page-header-band" aria-hidden="true"></div>
                `:l}
            </div>
            ${a.length>0?i`
                <div class="page-banners">
                    ${a.map(({banner:o,onDismiss:n})=>this._renderBanner(o,n))}
                </div>
            `:l}
            <div class="page-body ${this._tocVisible?"with-toc":""}">
                <div class="form-content">
                    <slot @slotchange=${this._onSlotChange}></slot>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem);" class="form-buttons">
                        <slot name="buttons"></slot>
                    </div>
                </div>
                ${this._tocVisible?i`
                    <aside class="page-toc">
                        <nav>
                            ${this._tocEntries.map((o,n)=>i`
                                <a class="page-toc__item ${n===this._activeToc?"is-active":""}"
                                   @click=${()=>this._scrollToSection(n)}
                                   title=${n<9?`${o.title} (Ctrl+Alt+${n+1})`:o.title}>
                                    <span class="page-toc__label">${o.title}</span>
                                    ${n<9?i`<span class="page-toc__key">${n+1}</span>`:l}
                                </a>
                            `)}
                        </nav>
                    </aside>
                `:l}
            </div>
            <div class="form-footer">
                ${e?.footer?.map(o=>w(this,o,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return i`<div style="display: flex; flex-direction: column; width: 100%;">${s}</div>`}};V.styles=$`
        /* Design-system hook: background behind the page header (the RDS "Header + Background"
           band) — transparent by default; the Redwood renderer paints it with the canvas color
           via a custom property, so the header reads as part of the canvas and the content slab
           starts at the color strip below. */
        .page-header-wrap {
            background: var(--mateu-page-header-bg, transparent);
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
    `;ie([u()],V.prototype,"component",2);ie([u()],V.prototype,"baseUrl",2);ie([u()],V.prototype,"state",2);ie([u()],V.prototype,"data",2);ie([u()],V.prototype,"appState",2);ie([u()],V.prototype,"appData",2);ie([u()],V.prototype,"value",2);ie([u({type:Boolean})],V.prototype,"standalone",2);ie([b()],V.prototype,"actionBanners",2);ie([b()],V.prototype,"dismissedStaticBannerIndices",2);ie([b()],V.prototype,"_tocEntries",2);ie([b()],V.prototype,"_activeToc",2);ie([b()],V.prototype,"_tocVisible",2);V=ie([x("mateu-page")],V);const ga=$`
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
`,Jt=e=>K`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,Ls=Jt(K`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),Ds=Jt(K`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),Rs=Jt(K`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`);Jt(K`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`);const Yd=Jt(K`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),Jd=Jt(K`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);var Xd=Object.defineProperty,Qd=Object.getOwnPropertyDescriptor,B=(e,t,r,a)=>{for(var s=a>1?void 0:a?Qd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Xd(t,r,s),s};const Aa=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],Zd=e=>Aa[Math.abs(e??0)%Aa.length],ec=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let M=class extends C{constructor(){super(...arguments),this.localAgentUrl="http://127.0.0.1:8776",this.localAgentAlive=!1,this.menu=[],this.chatSessionId=ke(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,r=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=r,this.send(new CustomEvent("submit",{detail:{value:r},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{const e=new AbortController,t=setTimeout(()=>e.abort(),1200),r=await fetch(this.localAgentUrl+"/health",{signal:e.signal});clearTimeout(t),this.localAgentAlive=r.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{const t=e.target,r=Array.from(t.files??[]);if(t.value="",!(!r.length||!this.uploadUrl)){this.uploading=!0;try{const a=new FormData;a.append("sessionId",this.chatSessionId);for(const h of r)a.append("files",h,h.name);const s={},o=localStorage.getItem("__mateu_auth_token");o&&(s.Authorization="Bearer "+o);const n=sessionStorage.getItem("__mateu_sesion_id");n&&(s["X-Session-Id"]=n);const d=await fetch(this.uploadUrl,{method:"POST",headers:s,body:a});if(!d.ok)throw new Error(`Upload failed: ${d.status}`);const p=((await d.json()).files??[]).filter(h=>h&&h.path);this.attachments=[...this.attachments,...p]}catch(a){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${a instanceof Error?a.message:a}`,"agent")}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim(),r=this.localAgentAlive?this.localAgentUrl+"/mateu/agent/stream":this.sseUrl,a=this.attachments;if(!t&&a.length===0||!r)return;const s=a.length?`${t}${t?`

`:""}📎 ${a.map(d=>d.name).join(", ")}`:t;this.addMessage(s,"user"),this.attachments=[];const o=this.addMessage("","agent");this.startLoading();let n="";try{const d={Accept:"text/event-stream","Content-Type":"application/json"},c=localStorage.getItem("__mateu_auth_token");c&&(d.Authorization="Bearer "+c);const p=sessionStorage.getItem("__mateu_sesion_id");p&&(d["X-Session-Id"]=p);const h=this.contextProvider?.(),f=JSON.stringify({message:t,sessionId:this.chatSessionId,...a.length&&{attachments:a},...h!=null&&{context:h},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const v=await fetch(r,{method:"POST",headers:d,body:f});if(!v.ok){const I=await v.text();throw new Error(`Servidor respondió ${v.status}: ${I}`)}const y=v.body?.getReader();if(!y)throw new Error("No se pudo obtener el reader del stream.");const S=new TextDecoder;let g="";for(;;){const{done:I,value:U}=await y.read();if(I){if(g.trim().startsWith("data:")){const ne=g.trim().slice(5).trim(),W=this.tryParseTokenUsage(ne),le=!W&&this.tryParseCustomEvent(ne);W?this.tokenUsage={...this.tokenUsage,...W}:le?le.event==="agent-error"?(n="⚠️ "+(le.detail?.message??"Error desconocido del agente"),this.updateMessage(o,n)):this.dispatchEvent(new CustomEvent(le.event,{detail:le.detail,bubbles:!0,composed:!0})):(n+=ne,this.updateMessage(o,n))}break}const ue=S.decode(U,{stream:!0});g+=ue;const Q=g.split(`
`);g=Q.pop()||"";let We=!1;for(const ne of Q)if(ne.trim().startsWith("data:")){const W=ne.trim().slice(5).trim(),le=this.tryParseTokenUsage(W),Z=!le&&this.tryParseCustomEvent(W);le?this.tokenUsage={...this.tokenUsage,...le}:Z?Z.event==="agent-error"?(n="⚠️ "+(Z.detail?.message??"Error desconocido del agente"),this.updateMessage(o,n)):this.dispatchEvent(new CustomEvent(Z.event,{detail:Z.detail,bubbles:!0,composed:!0})):(n+=W+`
`,We=!0)}We&&this.updateMessage(o,n)}n||this.updateMessage(o,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(d){console.error("Error en el flujo SSE:",d);const c=d?.message??String(d);(c==="Failed to fetch"||c==="network error"||c==="Load failed")&&!n?this.updateMessage(o,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(o,"⚠️ Error: "+c)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback(),this.probeLocalAgent();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=r=>{console.error("Error de reconocimiento: "+r.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const r={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,r],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((r,a)=>a===e?{...r,text:t}:r),this.scrollBottom()}tryParseCustomEvent(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const r=JSON.parse(t);if(typeof r.event=="string")return{event:r.event,detail:r.detail??{}}}catch{}return null}tryParseTokenUsage(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const r=JSON.parse(t);if("inputTokens"in r||"outputTokens"in r||"totalTokens"in r)return r}catch{}return null}buildMenuContext(e,t=[]){const r=[];for(const a of e){if(a.separator||a.remote)continue;const s=[...t,a.label];if(a.submenus&&a.submenus.length>0)r.push(...this.buildMenuContext(a.submenus,s));else{const o={path:s,navigation:{route:a.route,consumedRoute:a.consumedRoute,actionId:a.actionId??"",baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix}};a.description&&(o.description=a.description),r.push(o)}}return r}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return i`
            <div class="chat-container">
                <div class="chat-header">
                    <span class="chat-title">AI Assistant</span>
                    ${this.localAgentAlive?i`<span class="local-agent-badge" title="Hablando con tu CLI local (companion en ${this.localAgentUrl}) — sin api key">agente local</span>`:l}
                    <button class="chat-icon-btn" @click="${this.toggleExpanded}"
                            title="${this.expanded?"Contraer":"Expandir a pantalla completa"}"
                            aria-label="${this.expanded?"Contraer el chat":"Expandir el chat"}">
                        ${this.expanded?"⤡":"⤢"}
                    </button>
                    <button class="chat-close" @click="${this.closeChat}" title="Cerrar">
                        ${Jd}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>i`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${Zd(e.userColorIndex)};">${ec(e.userName)}</div>
                                <div class="message-body">
                                    <div class="message-meta">
                                        <span class="message-name">${e.userName}</span>
                                        <span class="message-time">${e.time}</span>
                                    </div>
                                    <mateu-markdown class="message-text" .content="${e.text??""}"></mateu-markdown>
                                </div>
                            </div>
                        `)}
                    </div>
                </div>
                ${this.tokenUsage?i`
                    <div class="token-bar">
                        <span class="token-label">Tokens:</span>
                        ${this.tokenUsage.inputTokens!=null?i`<span class="token-chip">in&nbsp;<strong>${this.tokenUsage.inputTokens}</strong></span>`:l}
                        ${this.tokenUsage.outputTokens!=null?i`<span class="token-chip">out&nbsp;<strong>${this.tokenUsage.outputTokens}</strong></span>`:l}
                        ${this.tokenUsage.totalTokens!=null?i`<span class="token-chip">total&nbsp;<strong>${this.tokenUsage.totalTokens}</strong></span>`:l}
                    </div>
                `:l}
                ${this.loading?i`
                    <div class="loading-bar">
                        <span class="spinner"></span>
                        <span class="loading-text">Thinking… ${this.elapsedSeconds}s</span>
                    </div>
                `:l}
                ${this.attachments.length?i`
                    <div class="attachments">
                        ${this.attachments.map(e=>i`
                            <span class="attachment-chip" title="${e.path}">
                                📎 ${e.name}
                                <button class="attachment-remove" @click="${()=>this.removeAttachment(e.path)}" aria-label="Quitar ${e.name}">✕</button>
                            </span>`)}
                    </div>
                `:l}
                <div class="input-bar">
                    ${this.uploadUrl?i`
                        <button class="mic-btn" title="Adjuntar ficheros"
                                @click="${this.pickFiles}" ?disabled="${this.uploading}"
                                aria-label="Adjuntar ficheros">${this.uploading?"…":"📎"}</button>
                        <input class="file-input" type="file" multiple hidden
                               @change="${this.onFilesPicked}"/>
                    `:l}
                    <button class="mic-btn"
                            title="Dictar"
                            style="color: ${this.listening?"red":"var(--lumo-contrast-50pct, #767676)"};"
                            @click="${this.startListening}"
                            ?disabled="${!this.recognitionAvailable}"
                    >${Yd}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}};M.styles=[ga,$`
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
    `];B([u({attribute:!1})],M.prototype,"contextProvider",2);B([u()],M.prototype,"localAgentUrl",2);B([u({attribute:!1})],M.prototype,"mcpUrl",2);B([b()],M.prototype,"localAgentAlive",2);B([u()],M.prototype,"sseUrl",2);B([u()],M.prototype,"uploadUrl",2);B([u({attribute:!1})],M.prototype,"menu",2);B([b()],M.prototype,"attachments",2);B([b()],M.prototype,"uploading",2);B([Ie(".file-input")],M.prototype,"fileInputElement",2);B([u({type:Boolean,reflect:!0})],M.prototype,"expanded",2);B([u()],M.prototype,"items",2);B([Ie(".scroll-container")],M.prototype,"scrollContainer",2);B([Ie(".msg-input")],M.prototype,"messageInputElement",2);B([b()],M.prototype,"recognition",2);B([b()],M.prototype,"listening",2);B([b()],M.prototype,"recognitionAvailable",2);B([b()],M.prototype,"loading",2);B([b()],M.prototype,"elapsedSeconds",2);B([b()],M.prototype,"tokenUsage",2);M=B([x("mateu-chat")],M);var tc=Object.defineProperty,rc=Object.getOwnPropertyDescriptor,br=(e,t,r,a)=>{for(var s=a>1?void 0:a?rc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&tc(t,r,s),s};let Et=class extends C{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([xe(()=>import("./vendor-chartjs.js").then(a=>a.a),[]),xe(()=>import("./vendor-chartjs.js").then(a=>a.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const r={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,r)}handleSlotChange(){}render(){return i`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};Et.styles=$`
  `;br([u()],Et.prototype,"type",2);br([u()],Et.prototype,"data",2);br([u()],Et.prototype,"options",2);br([Ie("#chart")],Et.prototype,"chartElement",2);Et=br([x("mateu-chart")],Et);var ac=Object.defineProperty,sc=Object.getOwnPropertyDescriptor,ya=(e,t,r,a)=>{for(var s=a>1?void 0:a?sc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&ac(t,r,s),s};let cr=class extends C{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await xe(async()=>{const{default:a}=await import("./vendor-diagrams.js");return{default:a}},__vite__mapDeps([2,0,1]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const r={container:this.divElement};this.chart=new t(r),this.chart.importXML(e)}handleSlotChange(){}render(){return i`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};cr.styles=$`
  `;ya([u()],cr.prototype,"xml",2);ya([Ie("#canvas")],cr.prototype,"divElement",2);cr=ya([x("mateu-bpmn")],cr);var oc=Object.defineProperty,ic=Object.getOwnPropertyDescriptor,Xt=(e,t,r,a)=>{for(var s=a>1?void 0:a?ic(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&oc(t,r,s),s};const Zr=160,ze=56,nc=220,La=110,st=60,lc={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},dc={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},cc=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function uc(){return"step-"+Math.random().toString(36).slice(2,8)}let ct=class extends C{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(n=>{t[n.id]=0});let r=!0;for(;r;)r=!1,e.forEach(n=>{if(n.preconditionStepId!=null&&t[n.preconditionStepId]!==void 0){const d=t[n.preconditionStepId]+1;d>t[n.id]&&(t[n.id]=d,r=!0)}});const a={};e.forEach(n=>{const d=t[n.id]??0;(a[d]??=[]).push(n.id)});const s={...this.positions};let o=!1;Object.entries(a).forEach(([n,d])=>{const c=Number(n);d.forEach((p,h)=>{s[p]||(s[p]={x:st+c*nc,y:st+h*La},o=!0)})}),o&&(this.positions=s)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(r=>r.id===e?{...r,...t}:r)},this.emit()}addStep(){const e=uc(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const r=Object.values(this.positions).map(s=>s.y),a=r.length?Math.max(...r)+La:st;this.positions={...this.positions,[e]:{x:st,y:a}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(a=>a.id!==e).map(a=>a.preconditionStepId===e?{...a,preconditionStepId:void 0}:a)};const{[e]:t,...r}=this.positions;this.positions=r,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const r=this.positions[t]??{x:0,y:0},a=this.toSvgPoint(e);this.dragOffset={x:a.x-r.x,y:a.y-r.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(a=>a.x))+Zr+st:600,r=e.length?Math.max(...e.map(a=>a.y))+ze+st:400;return{w:Math.max(t,600),h:Math.max(r,400)}}render(){const{w:e,h:t}=this.canvasSize(),r=this.wf.steps??[];return i`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():""}
                <div class="workspace">
                    <div class="canvas-wrap">
                        <svg width="${e}" height="${t}" class="canvas"
                             @click="${a=>{a.target===a.currentTarget&&(this.selectedId=null)}}">
                            <defs>
                                <marker id="arrow" markerWidth="8" markerHeight="8"
                                        refX="6" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/>
                                </marker>
                            </defs>
                            ${r.map(a=>this.renderArrow(a))}
                            ${r.map(a=>this.renderNode(a))}
                        </svg>
                    </div>
                    ${this.selectedId?this.renderPanel():""}
                </div>
            </div>
        `}renderToolbar(){const e=this.wf.status??"DRAFT";return i`
            <div class="toolbar">
                <span class="wf-name">${this.wf.name}</span>
                <span class="badge badge-${e.toLowerCase()}">${e}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${Ls}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${Ds}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Rs}
                    Export
                </button>
            </div>
        `}renderMeta(){const e=this.wf;return i`
            <div class="meta-panel">
                <div class="meta-grid">
                    <label>Name</label>
                    <input class="inp" .value="${e.name}" @change="${t=>this.updateWf({name:t.target.value})}"/>
                    <label>Description</label>
                    <textarea class="inp" rows="2" @change="${t=>this.updateWf({description:t.target.value})}">${e.description??""}</textarea>
                    <label>Status</label>
                    <select class="inp" @change="${t=>this.updateWf({status:t.target.value})}">
                        ${["DRAFT","ACTIVE","DISABLED","ARCHIVED"].map(t=>i`
                            <option value="${t}" ?selected="${e.status===t}">${t}</option>`)}
                    </select>
                    <label>Limit concurrent</label>
                    <input type="checkbox" ?checked="${e.limitConcurrentExecutions}"
                           @change="${t=>this.updateWf({limitConcurrentExecutions:t.target.checked})}"/>
                    ${e.limitConcurrentExecutions?i`
                        <label>Max concurrent</label>
                        <input class="inp" type="number" min="0" .value="${String(e.maxConcurrentExecutions??0)}"
                               @change="${t=>this.updateWf({maxConcurrentExecutions:Number(t.target.value)})}"/>
                        <label>Enqueue on limit</label>
                        <input type="checkbox" ?checked="${e.enqueueOnLimit}"
                               @change="${t=>this.updateWf({enqueueOnLimit:t.target.checked})}"/>
                    `:""}
                </div>
            </div>
        `}renderArrow(e){if(!e.preconditionStepId)return K``;const t=this.positions[e.preconditionStepId],r=this.positions[e.id];if(!t||!r)return K``;const a=t.x+Zr,s=t.y+ze/2,o=r.x,n=r.y+ze/2,d=(a+o)/2;return K`
            <path d="M${a},${s} C${d},${s} ${d},${n} ${o},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:st,y:st},r=lc[e.type]??"#64748b",a=dc[e.type]??"•",s=this.selectedId===e.id;return K`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${o=>this.onNodeMouseDown(o,e.id)}"
               @click="${o=>{o.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Zr}" height="${ze}" rx="8"
                      fill="white"
                      stroke="${s?r:"#e2e8f0"}"
                      stroke-width="${s?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${ze}" rx="8" fill="${r}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${ze}" fill="${r}"/>
                <text x="16" y="${ze/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${a}</text>
                <!-- name -->
                <text x="44" y="${ze/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${ze/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${ze/2+20}" font-size="9" fill="${r}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(a=>a.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(a=>a.id!==e.id),r=(a,s)=>i`
            <div class="field">
                <label class="field-label">${a}</label>
                ${s}
            </div>
        `;return i`
            <div class="properties">
                <div class="prop-header">
                    <span>Step Properties</span>
                    <button class="del-btn" title="Delete step"
                            @click="${()=>this.deleteStep(e.id)}">🗑</button>
                    <button class="close-btn" @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${r("ID",i`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${r("Name",i`<input class="inp" .value="${e.name}"
                        @change="${a=>this.updateStep(e.id,{name:a.target.value})}"/>`)}
                    ${r("Type",i`
                        <select class="inp" @change="${a=>this.updateStep(e.id,{type:a.target.value})}">
                            ${cc.map(a=>i`<option value="${a}" ?selected="${e.type===a}">${a}</option>`)}
                        </select>`)}
                    ${r("Description",i`<textarea class="inp" rows="2"
                        @change="${a=>this.updateStep(e.id,{description:a.target.value})}">${e.description??""}</textarea>`)}
                    ${r("Precondition step",i`
                        <select class="inp" @change="${a=>this.updateStep(e.id,{preconditionStepId:a.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(a=>i`<option value="${a.id}" ?selected="${e.preconditionStepId===a.id}">${a.name} (${a.id})</option>`)}
                        </select>`)}
                    ${r("Precondition expression",i`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??""}"
                        @change="${a=>this.updateStep(e.id,{preconditionExpression:a.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${a=>this.updateStep(e.id,{parallel:a.target.checked})}"/>
                    </div>
                    ${r("Timeout (ms)",i`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${a=>this.updateStep(e.id,{timeout:Number(a.target.value)})}"/>`)}
                    ${r("Retries",i`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${a=>this.updateStep(e.id,{retries:Number(a.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${a=>this.updateStep(e.id,{rollbackable:a.target.checked})}"/>
                    </div>
                    ${e.rollbackable?r("Compensation step",i`
                        <select class="inp" @change="${a=>this.updateStep(e.id,{compensationStepId:a.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(a=>i`<option value="${a.id}" ?selected="${e.compensationStepId===a.id}">${a.name} (${a.id})</option>`)}
                        </select>`):""}

                    ${e.type==="ACTION"?r("Topic",i`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??""}"
                        @change="${a=>this.updateStep(e.id,{topic:a.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?r("Form ID",i`<input class="inp"
                        .value="${e.formId??""}"
                        @change="${a=>this.updateStep(e.id,{formId:a.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?r("Child workflow ID",i`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??""}"
                        @change="${a=>this.updateStep(e.id,{childWorkflowDefinitionId:a.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),r=URL.createObjectURL(t),a=document.createElement("a");a.href=r,a.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",a.click(),URL.revokeObjectURL(r)}};ct.styles=[ga,$`
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
    `];Xt([u()],ct.prototype,"value",2);Xt([b()],ct.prototype,"wf",2);Xt([b()],ct.prototype,"positions",2);Xt([b()],ct.prototype,"selectedId",2);Xt([b()],ct.prototype,"showMeta",2);ct=Xt([x("mateu-workflow")],ct);var pc=Object.defineProperty,mc=Object.getOwnPropertyDescriptor,gr=(e,t,r,a)=>{for(var s=a>1?void 0:a?mc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&pc(t,r,s),s};const hc=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],fc=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],vc={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function Da(){return"field-"+Math.random().toString(36).slice(2,8)}let It=class extends C{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=Ks.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:r,newIndex:a}=t;if(r===void 0||a===void 0||r===a)return;const s=[...this.form.fields],[o]=s.splice(r,1);s.splice(a,0,o),this.form={...this.form,fields:s},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(r=>r.id===e?{...r,...t}:r)},this.emit()}addField(){const e=Da(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(o=>o.id===e);if(!t)return;const r={...t,id:Da(),label:t.label+" (copy)"},a=this.form.fields.findIndex(o=>o.id===e),s=[...this.form.fields];s.splice(a+1,0,r),this.form={...this.form,fields:s},this.selectedId=r.id,this.emit()}render(){return i`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():l}
                <div class="workspace">
                    ${this.renderList()}
                    ${this.selectedId?this.renderPanel():l}
                </div>
            </div>
        `}renderToolbar(){return i`
            <div class="toolbar">
                <span class="form-name">${this.form.name}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${Ls}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${Ds}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Rs}
                    Export
                </button>
            </div>
        `}renderMeta(){const e=this.form;return i`
            <div class="meta-panel">
                <div class="meta-grid">
                    <label>Name</label>
                    <input class="inp" .value="${e.name}"
                           @change="${t=>this.updateForm({name:t.target.value})}"/>
                    <label>Description</label>
                    <textarea class="inp" rows="2"
                              @change="${t=>this.updateForm({description:t.target.value})}">${e.description??""}</textarea>
                </div>
            </div>
        `}renderList(){const e=this.form.fields;return i`
            <div class="list-wrap">
                ${e.length===0?i`
                    <div class="empty">
                        No fields yet. Click <strong>Add Field</strong> to start.
                    </div>`:l}
                <div class="field-list">
                    ${e.map(t=>this.renderRow(t))}
                </div>
            </div>
        `}renderRow(e){const t=vc[e.dataType]??"#64748b",r=this.selectedId===e.id;return i`
            <div class="field-row ${r?"selected":""}"
                 data-id="${e.id}"
                 @click="${()=>this.selectedId=this.selectedId===e.id?null:e.id}">
                <span class="drag-handle" title="Drag to reorder">⠿</span>
                <span class="type-badge" style="background:${t}">${e.dataType}</span>
                <span class="field-label-text">${e.label}</span>
                <span class="field-id-text">${e.id}</span>
                ${e.required?i`<span class="required-badge">required</span>`:l}
                ${e.stereotype&&e.stereotype!=="regular"?i`<span class="stereo-badge">${e.stereotype}</span>`:l}
                <div style="flex:1"></div>
                <button class="row-btn" title="Duplicate"
                        @click="${a=>{a.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${a=>{a.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){const e=this.form.fields.find(r=>r.id===this.selectedId);if(!e)return l;const t=(r,a)=>i`
            <div class="prop-field">
                <label class="prop-label">${r}</label>
                ${a}
            </div>
        `;return i`
            <div class="properties">
                <div class="prop-header">
                    <span>Field Properties</span>
                    <button class="close-btn" @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${t("ID",i`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${t("Label",i`
                        <input class="inp" .value="${e.label}"
                               @change="${r=>this.updateField(e.id,{label:r.target.value})}"/>`)}
                    ${t("Data type",i`
                        <select class="inp"
                                @change="${r=>this.updateField(e.id,{dataType:r.target.value})}">
                            ${hc.map(r=>i`
                                <option value="${r}" ?selected="${e.dataType===r}">${r}</option>`)}
                        </select>`)}
                    ${t("Stereotype",i`
                        <select class="inp"
                                @change="${r=>this.updateField(e.id,{stereotype:r.target.value||void 0})}">
                            ${fc.map(r=>i`
                                <option value="${r}" ?selected="${(e.stereotype??"regular")===r}">${r}</option>`)}
                        </select>`)}
                    <div class="prop-field row">
                        <label class="prop-label">Required</label>
                        <input type="checkbox" ?checked="${e.required}"
                               @change="${r=>this.updateField(e.id,{required:r.target.checked})}"/>
                    </div>
                    ${t("Description / hint",i`
                        <textarea class="inp" rows="3"
                                  @change="${r=>this.updateField(e.id,{description:r.target.value||void 0})}">${e.description??""}</textarea>`)}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),r=URL.createObjectURL(t),a=document.createElement("a");a.href=r,a.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",a.click(),URL.revokeObjectURL(r)}};It.styles=[ga,$`
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
    `];gr([u()],It.prototype,"value",2);gr([b()],It.prototype,"form",2);gr([b()],It.prototype,"selectedId",2);gr([b()],It.prototype,"showMeta",2);It=gr([x("mateu-form-editor")],It);var bc=Object.defineProperty,gc=Object.getOwnPropertyDescriptor,Ve=(e,t,r,a)=>{for(var s=a>1?void 0:a?gc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&bc(t,r,s),s};let fe=class extends C{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return i`
            <button class="tab ${this.activeTab===e?"tab--active":""}"
                @click=${()=>{this.activeTab=e}}>
                ${t}
            </button>
        `}render(){return this.open?i`
                <div class="panel">
                    <div class="panel-header">
                        <span class="panel-title">🐛 Mateu Debug</span>
                        <button class="close-btn" @click=${()=>{this.open=!1}}>✕</button>
                    </div>
                    <div class="tabs">
                        ${this._renderTab("appstate","AppState")}
                        ${this._renderTab("appdata","AppData")}
                        ${this._renderTab("inspector","Inspector")}
                    </div>
                    <div class="content">
                        ${this.activeTab==="appstate"?i`
                            <pre class="json">${this._fmt(this.appState)}</pre>
                        `:l}
                        ${this.activeTab==="appdata"?i`
                            <pre class="json">${this._fmt(this.appData)}</pre>
                        `:l}
                        ${this.activeTab==="inspector"?i`
                            ${this.hoveredTag?i`
                                <div class="inspector-tag">&lt;${this.hoveredTag}${this.hoveredId?` id="${this.hoveredId}"`:""}&gt;</div>
                                <div class="section-label">state</div>
                                <pre class="json">${this._fmt(this.hoveredState)}</pre>
                                <div class="section-label">data</div>
                                <pre class="json">${this._fmt(this.hoveredData)}</pre>
                                <div class="section-label">metadata</div>
                                <pre class="json">${this._fmt(this.hoveredMeta)}</pre>
                            `:i`
                                <div class="inspector-hint">Hover a mateu-* element to inspect it</div>
                            `}
                        `:l}
                    </div>
                </div>
            `:i`
            <button class="fab" @click=${()=>{this.open=!0}} title="Mateu Debug">🐛</button>
        `}};fe.styles=$`
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
    `;Ve([u()],fe.prototype,"appState",2);Ve([u()],fe.prototype,"appData",2);Ve([b()],fe.prototype,"open",2);Ve([b()],fe.prototype,"activeTab",2);Ve([b()],fe.prototype,"hoveredTag",2);Ve([b()],fe.prototype,"hoveredId",2);Ve([b()],fe.prototype,"hoveredState",2);Ve([b()],fe.prototype,"hoveredData",2);Ve([b()],fe.prototype,"hoveredMeta",2);fe=Ve([x("mateu-debug-overlay")],fe);var $e=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))($e||{}),Us=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(Us||{}),js=(e=>(e.Continue="Continue",e.Stop="Stop",e))(js||{}),yc=Object.defineProperty,$c=Object.getOwnPropertyDescriptor,Yr=(e,t,r,a)=>{for(var s=a>1?void 0:a?$c(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&yc(t,r,s),s};let Qt=null,qt=class extends vt{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,r=this.data,a=this.appState,s=this.appData,o=this.component,n=S=>Qa(S,t,r,{appState:a,appData:s,component:o}),d=S=>Xa(S,t,r,a,s,{component:o}),c=["state","data","appState","appData","component"],p=[t,r,a,s,o],h={...this.state},f={...this.data};let v=!1,y=!1;for(let S=0;S<e.length;S++){const g=e[S];try{if(n(g.filter)){if($e.SetStateValue==g.action||$e.SetDataValue==g.action){const I=$e.SetStateValue==g.action?h:f,U=g.fieldName.split(",");for(let ue=0;ue<U.length;ue++){const Q=U[ue];if(!I[Q]||I[Q]!=g.value){const We=g.expression?d(g.expression):g.value,ne=Us.none==g.fieldAttribute?Q:Q+"."+g.fieldAttribute;We!=I[ne]&&(I[ne]=We,$e.SetStateValue==g.action&&(v=!0),$e.SetDataValue==g.action&&(y=!0))}}}if($e.RunAction==g.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:g.actionId},bubbles:!0,composed:!0})),$e.RunJS==g.action&&new Function(...c,g.value)(...p),$e.SetAttributeValue==g.action){const I=g.expression?n(g.expression):g.value;if(g.fieldAttribute=="disabled"){I?this.shadowRoot?.getElementById(g.fieldName)?.setAttribute(g.fieldAttribute,"disabled"):this.shadowRoot?.getElementById(g.fieldName)?.removeAttribute(g.fieldAttribute);continue}this.shadowRoot?.getElementById(g.fieldName)?.setAttribute(g.fieldAttribute,I)}if($e.SetCssClass==g.action&&this.shadowRoot?.getElementById(g.fieldName)?.setAttribute("class",g.value),$e.SetStyle==g.action&&this.shadowRoot?.getElementById(g.fieldName)?.style.setProperty(g.expression,g.value),js.Stop==g.result)break}}catch(I){console.error("rule failed",g,I)}}v&&(this.state=h),y&&(this.data=f),v&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,r=this.component.validations;let a=!0,s=!1;const o=this.data??{},n={...this.data??{},errors:{}};if(r){for(let d=0;d<r.length;d++){const c=r[d];if(this.skipValidation(t,c))continue;const p=(c.fieldId??"_component").split(",");for(let h=0;h<p.length;h++){const f=p[h];n.errors[f]=[]}}for(let d=0;d<r.length;d++){const c=r[d];if(!this.skipValidation(t,c))try{const p=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!p){a=!1;const f=(c.fieldId??"_component").split(",");for(let v=0;v<f.length;v++){const y=f[v];let S=n.errors[y];if(S||(n.errors[y]=[]),S=n.errors[y],!o[y]){let g=c.message;try{g=this._evalTemplate(c.message)}catch{}S.push(g)}}}}catch(p){console.error("validation failed",c,p)}}for(let d=0;d<r.length;d++){const c=r[d];if(this.skipValidation(t,c))continue;const p=(c.fieldId??"_component").split(",");for(let h=0;h<p.length;h++){const f=p[h];if(o.errors?[f].join(","):n.errors==""&&[f].join(",")){s=!0;break}}}(o.errors?["_component"].join(","):n.errors==""&&["_component"].join(","))&&(s=!0)}n._valid=a,n._valid!=o._valid&&(s=!0),s&&(this.data=n)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,r={};t.fieldIds.forEach(a=>{r[a]=void 0}),r.searchText=void 0,this.state={...this.state,...r}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,r={};r[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...r})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const r={...this.state};r[t.fieldId]=t.value,this.state=r,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const a=this.component;a.triggers?.filter(s=>s.type==ot.OnValueChange).filter(s=>!s.propertyName||t.fieldId==s.propertyName).forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))}),a.triggers?.filter(s=>s.type==ot.AutoSave).forEach(s=>{const o=s.actionId,n=this._autoSaveTimers.get(o);n!==void 0&&clearTimeout(n),this._autoSaveTimers.set(o,setTimeout(()=>{this._autoSaveTimers.delete(o),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))},s.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail;if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation();const r=this.component,a=r.actions?.find(s=>s.id==t.actionId||s.id.endsWith("*")&&t.actionId.startsWith(s.id.replace("*","")));if(a){if(a&&a.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(a&&a.validationRequired){const o=Qt??this;if(Qt=null,o.checkValidations(a.fieldsToValidate),!o.data._valid){o.notifyValidationErrors();return}}Qt=null;const s={...t,initiatorComponentId:this.id};a&&a.confirmationRequired?this.callAfterConfirmation(a,()=>this.requestActionCallToServerOrBubble(s,r,a)):this.requestActionCallToServerOrBubble(s,r,a)}else{const s={...t.parameters};s.initiatorState||(s.initiatorState=this.state),Qt||(Qt=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,parameters:s},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=r=>{if(r)for(const a of r){const s=a.metadata;if(s?.type===m.FormField){const o=s;o.fieldId&&o.label&&(e[o.fieldId]=o.label)}t(a.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),r=[];if(Object.entries(e).forEach(([s,o])=>{if(!Array.isArray(o))return;const n=s==="_component"?void 0:t[s]??s;o.forEach(d=>{d&&!r.some(c=>c.label===n&&c.msg===d)&&r.push({label:n,msg:d})})}),r.length===0){this.notify("There are validation errors");return}const a=`There are validation errors
`+r.map(({label:s,msg:o})=>s?`• ${s}: ${o}`:`• ${o}`).join(`
`);_t({text:a,variant:"error",position:"bottomEnd",duration:Math.max(3e3,1500+r.length*1e3)},this)},this.notify=e=>{_t({text:e,variant:"error",position:"bottomEnd",duration:3e3},this)},this.callAfterConfirmation=(e,t)=>{let r="One moment, please",a="Are you sure?",s="Yes",o="No";e.confirmationTexts&&(r=e.confirmationTexts.title,a=e.confirmationTexts.message,s=e.confirmationTexts.confirmationText,o=e.confirmationTexts.denialText);const n=document.createElement("div");n.style.cssText="position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);padding:1rem;";const d=document.createElement("div");d.style.cssText="background:var(--lumo-base-color,#fff);color:var(--lumo-body-text-color,#1a1a1a);border-radius:var(--lumo-border-radius-l,12px);box-shadow:var(--lumo-box-shadow-xl,0 12px 40px rgba(0,0,0,.3));padding:1.2rem;max-width:min(90vw,26rem);";const c=()=>{n.parentElement&&document.body.removeChild(n)},p="font:inherit;font-weight:600;padding:.45rem 1rem;border-radius:var(--lumo-border-radius-m,6px);cursor:pointer;";Js(i`
            <h3 style="margin:0 0 .5rem;">${r}</h3>
            <div style="margin-bottom:1.2rem;">${a}</div>
            <div style="display:flex;justify-content:flex-end;gap:.5rem;">
                <button style="${p}border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.25));background:var(--lumo-base-color,#fff);"
                        @click="${()=>c()}">${o}</button>
                <button style="${p}border:none;background:var(--lumo-primary-color,#1676f3);color:var(--lumo-primary-contrast-color,#fff);"
                        @click="${()=>{c(),t()}}">${s}</button>
            </div>
        `,d),n.appendChild(d),n.addEventListener("click",h=>{h.target===n&&c()}),document.body.appendChild(n)},this.requestActionCallToServerOrBubble=(e,t,r)=>{if(r&&r.bubble){const a={...e.parameters};a.initiatorState||(a.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,parameters:a},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,r)},this.requestActionCallToServer=(e,t,r)=>{if(r&&r.href){window.location.href=r.href;return}if(r&&r.js)try{new Function("state","data","appState","appData","component",r.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(a){console.error("when evaluating "+r.js,a,this.component,this.state,this.data)}if(r&&r.customEvent&&this.dispatchEvent(new CustomEvent(r.customEvent.name,{detail:r.customEvent.detail,bubbles:!0,composed:!0})),!(r&&(r.js||r.customEvent))){if(e.actionId=="search"){const a=e.parameters?._searchState;a?this.state={...this.state,...a}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:r?.background,sse:r?.sse,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(a=>a.type==ot.OnSuccess).filter(a=>e.detail.actionId==a.calledActionId).forEach(a=>{if(!a.condition||this._evalExpr(a.condition))if(e.preventDefault(),e.stopPropagation(),a.timeoutMillis>0){const s=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,callbackToken:s},bubbles:!0,composed:!0}))},a.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(a=>a.type==ot.OnError).filter(a=>e.detail.actionId==a.calledActionId).forEach(a=>{(!a.condition||this._evalExpr(a.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId},bubbles:!0,composed:!0})))})},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const r of t.actions??[]){const a=r.shortcut||(r.runOnEnter?"enter":null);if(a&&this._shortcutMatchesEvent(a,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return j.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}_shortcutMatchesEvent(e,t){return Ci(e,t)}_collectShortcutTabs(){const e=this.renderRoot;if(!e)return[];const t=Array.from(e.querySelectorAll("vaadin-tab[data-shortcut]"));return e.querySelectorAll("mateu-drawer, mateu-dialog").forEach(r=>{const a=r.shadowRoot;a&&t.push(...Array.from(a.querySelectorAll("vaadin-tab[data-shortcut]")))}),t}_handleTabShortcut(e){const t=this._collectShortcutTabs();if(t.length===0)return!1;for(const r of Array.from(t)){const a=r.dataset.shortcut;if(!a||!this._shortcutMatchesEvent(a,e))continue;const s=r.closest("vaadin-tabs");if(!s)continue;const o=Array.from(s.querySelectorAll("vaadin-tab")).indexOf(r);if(!(o<0))return e.preventDefault(),s.selected=o,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),document.removeEventListener("keydown",this._keydownListener)}render(){return i`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?i`
                <div><ul>${this.data.errors._component.map(e=>i`<li>${e}</li>`)}</ul></div>
            `:l}</div>`}_render(){if(this.component?.type==Y.ClientSide){const e=this.component;return e.metadata?.type==m.Page?ra(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==m.Crud?aa(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):j.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return i`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==Y.ClientSide){const t=e;if(t.metadata?.type==m.Page)return ra(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==m.Crud)return aa(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return w(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};qt.styles=$`
        :host {
        }

        ${Ys(ur.cssText)}
        
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
  `;Yr([u()],qt.prototype,"baseUrl",2);Yr([u()],qt.prototype,"route",2);Yr([u()],qt.prototype,"consumedRoute",2);qt=Yr([x("mateu-component")],qt);const Ra=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}};class xc{async handle(t,r){return await t.runAction(r.baseUrl,r.route,r.consumedRoute,r.actionId,r.initiatorComponentId,r.appState,r.serverSideType,r.componentState,r.parameters,r.initiator,r.background)}}const wc=new xc;class kc{constructor(){this.handleUIIncrement=(t,r,a)=>{if(t?.fragments?.forEach(s=>{yt.next({command:void 0,fragment:s,ui:void 0,error:void 0,callbackToken:a})}),t?.appState&&(G.value={...t.appState},r.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const s=t?.appData;wr.value={...t.appData,...s},r.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(s=>{_t({text:s.text,position:s.position,variant:s.variant,duration:s.duration,undoLabel:s.undoLabel,undoActionId:s.undoActionId,undoParameters:s.undoParameters},r)}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(s=>{yt.next({command:s,fragment:void 0,ui:void 0,error:void 0,callbackToken:a})})}}async runAction(t,r,a,s,o,n,d,c,p,h,f,v,y,S,g){try{const I=await wc.handle(t,{baseUrl:r,route:a,consumedRoute:s,actionId:o,appState:G.value,initiatorComponentId:n,componentState:p,parameters:h,serverSideType:c,initiator:f,background:v});y&&y(I),S||this.handleUIIncrement(I,f,g),I.messages&&I.messages.length==1&&I.messages[0].variant=="error"&&f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:o},bubbles:!0,composed:!0})),f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:o,evevntId:ke()},bubbles:!0,composed:!0}))}catch(I){console.warn("Action request failed",I),f.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:o,reason:this.serialize(I)}})),f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:o},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const Cc=new kc,Sc=Cc;class _c{constructor(){this.handleUIIncrement=(t,r,a)=>{if(t?.messages?.forEach(s=>{_t({text:s.text,position:s.position,variant:s.variant,duration:s.duration,undoLabel:s.undoLabel,undoActionId:s.undoActionId,undoParameters:s.undoParameters},r)}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(s=>{yt.next({command:s,fragment:void 0,ui:void 0,error:void 0,callbackToken:a})}),t?.fragments?.forEach(s=>{yt.next({command:void 0,fragment:s,ui:void 0,error:void 0,callbackToken:a})}),t?.appState&&(G.value={...t.appState},r.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const s=t?.appData;wr.value={...t.appData,...s},r.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,r,a,s,o,n,d,c,p,h,f,v,y,S,g){if(a){a=a||"_no_route",a&&a.startsWith("/")&&(a=a.substring(1));const I={serverSideType:c,appState:G.value,componentState:p,parameters:h,initiatorComponentId:n,consumedRoute:s,route:"/"+a,actionId:o};v||f.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),fetch(r+"/mateu/v3/sse/"+a,{method:"POST",headers:{Accept:"text/event-stream","Content-Type":"application/json"},body:JSON.stringify(I)}).then(async U=>{const ue=U.body?.pipeThrough(new TextDecoderStream).getReader();if(ue){let Q="";for(;;){const{value:We,done:ne}=await ue.read();if(ne)break;Q+=We;const W=Q.split(`

`);Q=W.pop()??"";for(const le of W){const Z=le.trim();if(Z)if(Z.startsWith("data:")){const pe=JSON.parse(Z.substring(5).trim());y&&y(pe),S||this.handleUIIncrement(pe,f,g),pe.messages&&pe.messages.length==1&&pe.messages[0].variant=="error"&&f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:o},bubbles:!0,composed:!0}))}else{let pe=Z;try{const et=JSON.parse(Z);pe=et.message,et._embedded?.errors?.length>0&&et._embedded.errors[0].message&&(pe=et._embedded.errors[0].message)}catch{}throw new Error(pe)}}}}v||f.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:o}})),f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:o},bubbles:!0,composed:!0}))}).catch(U=>{f.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:o,reason:this.serialize(U)}})),f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:o},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}}const Ms=new _c,Ec={fixed:"fixed",fullWidth:"full",edgeToEdge:"edge"},Ic=new Set([m.Gantt,m.PlanningBoard,m.Kanban,m.Bpmn,m.Workflow,m.Map]),Pc={landing:"fixed",form:"fixed",process:"fixed"},Ns=e=>e?Ec[e]:void 0,Pt=e=>e.type==Y.ClientSide?e.metadata:void 0,Fs=e=>{const t=Pt(e);if(t?.type==m.Page){const r=Ns(t.pageWidth);if(r)return r}for(const r of e.children??[]){const a=Fs(r);if(a)return a}},Bs=e=>{const t=e.pageType;if(t)return t;const r=a=>{const s=Pt(a);if(s?.type==m.Page&&s.pageType)return s.pageType;for(const o of a.children??[]){const n=r(o);if(n)return n}};return r(e)},Oc=e=>{const t=Pt(e);if(t?.type!=m.Crud)return!1;const r=t;return r.compact?!0:(r.columns??[]).some(a=>a.metadata?.editable)},Mr=(e,t)=>t(e)||(e.children??[]).some(r=>Mr(r,t)),Tc=e=>!!e&&Mr(e,t=>Pt(t)?.type==m.HeroSection),zc=e=>Pt(e)?.type==m.App?!0:(e.children??[]).some(t=>Pt(t)?.type==m.App),Ac=(e,t)=>{if(!e)return"fixed";const r=Ns(e.pageWidth)??Fs(e);if(r)return r;if(t?.top&&zc(e))return"edge";const a=Pc[Bs(e)??""];return a||(Mr(e,s=>{const o=Pt(s)?.type;return o!=null&&Ic.has(o)})?"edge":Mr(e,Oc)?"full":"fixed")};var Lc=Object.defineProperty,Dc=Object.getOwnPropertyDescriptor,ce=(e,t,r,a)=>{for(var s=a>1?void 0:a?Dc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Lc(t,r,s),s};let X=class extends Br{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:Y.ClientSide,metadata:{type:m.Element,name:"div",content:"Not found"},id:"fieldId"},action:rr.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let r=Sc;t.sse&&(r=Ms),r.runAction(Tt,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken)}},this.getCustomisedAppState=()=>{let e={...G.value};if(this.overrides){const t=Ra(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return j.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.overridesParsed=Ra(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(r=>r==="appState"||r==="appData")){const r=this.renderRoot.querySelector("mateu-component");if(r)return e.has("appState")&&(r.appState=this.appState),e.has("appData")&&(r.appData=this.appData),!1}return!0}updated(e){(e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&(this.preventNavigation||(this.callbackToken=this.instant||ke(),this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,componentState:this.initialState,callbackToken:this.callbackToken},bubbles:!0,composed:!0})))),e.has("route")&&this.top&&(this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}this.fragment=e,e.component&&(this.dataset.pageWidth=Ac(e.component,{top:this.top}),this.dataset.pageType=Bs(e.component)??"",this.dataset.hasWelcomeBanner=String(Tc(e.component)))}render(){return i`
           ${this.fragment?.component?w(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):l}
       `}};X.styles=$`
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
  `;ce([u()],X.prototype,"consumedRoute",2);ce([u()],X.prototype,"serverSideType",2);ce([u()],X.prototype,"uriPrefix",2);ce([u()],X.prototype,"overrides",2);ce([u()],X.prototype,"homeRoute",2);ce([u()],X.prototype,"route",2);ce([u()],X.prototype,"top",2);ce([u()],X.prototype,"instant",2);ce([u()],X.prototype,"initialState",2);ce([u()],X.prototype,"appState",2);ce([u()],X.prototype,"appData",2);ce([b()],X.prototype,"fragment",2);X=ce([x("mateu-ux")],X);function Rc(e){const t="var(--lumo-space-m, 1rem)",r={left:"50%",transform:"translateX(-50%)"};switch(e){case"topStart":return{top:t,left:t};case"topCenter":return{top:t,...r};case"topEnd":return{top:t,right:t};case"topStretch":return{top:t,left:t,right:t};case"middle":return{top:"50%",left:"50%",transform:"translate(-50%, -50%)"};case"bottomStart":return{bottom:t,left:t};case"bottomCenter":return{bottom:t,...r};case"bottomStretch":return{bottom:t,left:t,right:t};default:return{bottom:t,right:t}}}function Uc(e){switch(e){case"success":return{bg:"var(--lumo-success-color, #2e7d32)",fg:"#fff"};case"error":return{bg:"var(--lumo-error-color, #c62828)",fg:"#fff"};case"warning":return{bg:"var(--lumo-warning-color, #f9a825)",fg:"#1a1a1a"};case"contrast":return{bg:"var(--lumo-contrast-90pct, #1a1a1a)",fg:"#fff"};default:return{bg:"var(--lumo-base-color, #fff)",fg:"var(--lumo-body-text-color, #1a1a1a)"}}}const jc={show(e,t){const{bg:r,fg:a}=Uc(e.variant),s=Rc(e.position),o=document.createElement("div");o.setAttribute("role","status"),Object.assign(o.style,{position:"fixed",zIndex:"2000",display:"flex",alignItems:"center",gap:"0.75rem",maxWidth:"min(90vw, 28rem)",padding:"0.7rem 1rem",borderRadius:"var(--lumo-border-radius-m, 8px)",boxShadow:"var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,0.2))",background:r,color:a,font:"inherit",fontSize:"var(--lumo-font-size-s, 0.875rem)",opacity:"0",transition:"opacity 0.2s ease",...s});const n=document.createElement("span");n.textContent=e.text,o.appendChild(n);const d=()=>{o.style.opacity="0",setTimeout(()=>o.remove(),200)};if(e.undoActionId){const p=document.createElement("button");p.textContent=e.undoLabel??"Undo",p.style.cssText="margin-left: 0.25rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;",p.addEventListener("click",()=>{t.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0})),d()}),o.appendChild(p)}document.body.appendChild(o),requestAnimationFrame(()=>{o.style.opacity="1"});const c=e.duration??(e.undoActionId?1e4:5e3);c>0&&setTimeout(d,c)}};function Mc(){$d(jc)}var Nc=Object.defineProperty,Fc=Object.getOwnPropertyDescriptor,Ze=(e,t,r,a)=>{for(var s=a>1?void 0:a?Fc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Nc(t,r,s),s};Mc();let _e=class extends C{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,r=this.baseUrl??"";!t||t.startsWith("/")?r=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,r.indexOf("://")<0&&(r.startsWith("/")||(r="/"+r),r=window.location.origin+r)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),r.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let a=new URL(r+t);if((window.location.pathname||a.pathname)&&window.location.pathname!=a.pathname){let s=a.pathname;a.search&&(s+=a.search),s&&!s.startsWith("/")&&(s="/"+s),window.history.pushState({},"",s),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),$t.markClean(),e instanceof CustomEvent){let t=e.detail.route;const r=this.renderRoot.querySelector("mateu-ux");r&&(r.setAttribute("route",t),r.setAttribute("instant",ke()))}}}createRenderRoot(){return j.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),$t.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!$t.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;this.loadUrl(t)},this.top=="true"?this.loadUrl(window):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);G.value={...G.value,...e}}catch{G.value={...G.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=ke(),this._lastUrl=e.location.href,e.location.search){const r=new URLSearchParams(e.location.search).get("overrides");if(r&&(this.config=r,this.config))try{const a=JSON.parse(this.config);G.value={...G.value,...a}}catch{G.value={...G.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,r=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(r)?t.substring(r.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return i`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${wr.value}"
                          .appState="${G.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?i`
               <mateu-debug-overlay
                   .appState="${G.value}"
                   .appData="${wr.value}"
               ></mateu-debug-overlay>
           `:l}
       `}};_e.styles=$`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;Ze([u()],_e.prototype,"baseUrl",2);Ze([u()],_e.prototype,"route",2);Ze([u()],_e.prototype,"consumedRoute",2);Ze([u()],_e.prototype,"config",2);Ze([u()],_e.prototype,"top",2);Ze([u()],_e.prototype,"pathPrefix",2);Ze([b()],_e.prototype,"instant",2);Ze([u({type:Boolean})],_e.prototype,"debug",2);_e=Ze([x("mateu-ui")],_e);var Bc=Object.defineProperty,qc=Object.getOwnPropertyDescriptor,Dt=(e,t,r,a)=>{for(var s=a>1?void 0:a?qc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Bc(t,r,s),s};let Ee=class extends C{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.searchText=""}connectedCallback(){super.connectedCallback(),no()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(ia()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"—";const t=(this.searchedOptions??this.selector.options)?.find(a=>String(a.value)===e);if(t)return t.label;const r=Ya()[this.selector.fieldName];return r!==void 0?String(r):e}pick(e,t){io(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText="",this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector("input.picker-search")?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){const e=this.app;if(e?.serverSideType)try{const t=await Tt.runAction(this.baseUrl??"",e.rootRoute??e.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(const r of t?.fragments??[]){const o=r.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(o)){this.searchedOptions=o.map(n=>({value:n.value,label:n.label??String(n.value)}));return}}}catch{}}visibleOptions(){const e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(r=>r.label.toLowerCase().includes(t)):e}renderPanel(){const e=this.currentValue(),t=this.visibleOptions(),r=this.searchText!==""||t.length>Ee.SEARCHABLE_THRESHOLD;return i`
            <div class="panel">
                ${r?i`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${a=>{a.key==="Escape"&&this.closePanel()}}"/>`:l}
                <div class="options">
                    ${e?i`
                        <div class="option option--clear" @click="${()=>this.pick("")}">— (clear)</div>`:l}
                    ${t.map(a=>i`
                        <div class="option ${e===String(a.value)?"option--selected":""}"
                             @click="${()=>this.pick(a.value,a.label)}">${a.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?i`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():l}
            </label>`:i``}};Ee.SEARCHABLE_THRESHOLD=7;Ee.styles=$`
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
    `;Dt([u()],Ee.prototype,"selector",2);Dt([u()],Ee.prototype,"app",2);Dt([u()],Ee.prototype,"baseUrl",2);Dt([b()],Ee.prototype,"opened",2);Dt([b()],Ee.prototype,"searchText",2);Dt([b()],Ee.prototype,"searchedOptions",2);Ee=Dt([x("mateu-app-context-picker")],Ee);var Hc=Object.defineProperty,Vc=Object.getOwnPropertyDescriptor,yr=(e,t,r,a)=>{for(var s=a>1?void 0:a?Vc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&Hc(t,r,s),s};let Ot=class extends C{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){const r=this.app;if(r?.serverSideType)try{const a=await Tt.runAction(this.baseUrl??"",r.rootRoute??r.initialRoute??"","",e,"notification-bell",void 0,r.serverSideType,{},t,this,!0);for(const s of a?.fragments??[]){const n=s.data?._notifications;if(Array.isArray(n)){this.notifications=n;return}}}catch{}}refresh(){return this.runNotificationsAction("_notifications-list",{})}markRead(e){return this.runNotificationsAction("_notifications-read",{ids:e})}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);const t=e.route;if(t){if(!$t.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return i`
            <div class="entry ${e.unread?"entry--unread":""}"
                 @click="${()=>this.entryClicked(e)}">
                <span class="unread-dot" aria-hidden="true"></span>
                <div class="entry-body">
                    <div class="entry-top">
                        <span class="entry-title">${e.title}</span>
                        ${e.when?i`<span class="entry-when">${e.when}</span>`:l}
                    </div>
                    ${e.text?i`<div class="entry-text">${e.text}</div>`:l}
                </div>
            </div>`}renderPanel(){return i`
            <div class="panel">
                <div class="entries">
                    ${this.notifications.length===0?i`
                        <div class="empty">No notifications</div>`:l}
                    ${this.notifications.map(e=>this.renderEntry(e))}
                </div>
                ${this.notifications.length>0?i`
                    <div class="footer">
                        <button class="mark-all" ?disabled="${this.unreadCount()===0}"
                                @click="${()=>this.markRead("all")}">Mark all read</button>
                    </div>`:l}
            </div>`}render(){const e=this.unreadCount();return i`
            <div class="root">
                <button class="bell-button" title="Notifications" aria-label="Notifications"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    <svg class="bell-icon" viewBox="0 0 24 24" aria-hidden="true"
                         fill="none" stroke="currentColor" stroke-width="1.8"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    ${e>0?i`<span class="badge">${e>99?"99+":e}</span>`:l}
                </button>
                ${this.opened?this.renderPanel():l}
            </div>`}};Ot.styles=$`
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
    `;yr([u()],Ot.prototype,"app",2);yr([u()],Ot.prototype,"baseUrl",2);yr([b()],Ot.prototype,"opened",2);yr([b()],Ot.prototype,"notifications",2);Ot=yr([x("mateu-notification-bell")],Ot);const qs=e=>{if(!e||!("querySelectorAll"in e))return null;for(const t of e.querySelectorAll("*")){if(t.tagName?.toLowerCase()==="mateu-component")return t;const r=qs(t.shadowRoot);if(r)return r}return null},Wc=async(e,t,r)=>{const a=t.renderRoot??t,s=qs(a);await Ms.runAction(Tt,t.baseUrl??"",e.rootRoute||"_no_route","",r,s?.id??"app-header-action",{},e.serverSideType??"",{},{},s??t,!0,void 0,!1,"")},Ua=async(e,t,r)=>{try{await Wc(e,t,r)}catch(a){_t({text:"La acción falló: "+a,position:"bottomStart",duration:6e3,variant:"error"},t)}},Zt=(e,t)=>{const r=e.contextSelectors??[],a=e.contextActions??[];return r.length===0&&a.length===0&&!e.notificationsEnabled?l:i`${e.notificationsEnabled?i`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-notification-bell>`:l}${r.map(s=>i`
        <mateu-app-context-picker .selector="${s}" .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-app-context-picker>`)}${a.map(s=>(s.children?.length??0)>0?i`
        <details class="mateu-nav-group" style="margin-left: 0.5rem; flex-shrink: 0;">
            <summary class="app-header-action-btn">${s.label} ▾</summary>
            <div class="mateu-nav-panel" style="right: 0; left: auto;">
                ${s.children.map(o=>i`
                    <button class="mateu-nav-item" @click="${()=>o.actionId&&Ua(e,t,o.actionId)}">${o.label}</button>`)}
            </div>
        </details>`:i`
        <button class="app-header-action-btn" style="margin-left: 0.5rem; flex-shrink: 0;"
            @click="${()=>s.actionId&&Ua(e,t,s.actionId)}" title="${s.label}">${s.icon?H(s.icon):l}${s.label}</button>`)}`},ja=(e,t)=>i`
    <button class="mateu-nav-item ${e.selected?"mateu-nav-item--active":""}"
            ?disabled="${e.disabled}"
            @click="${()=>t(e)}">${e.text}</button>`,Ma=(e,t,r="")=>i`
    <nav class="mateu-nav ${r}">
        ${e.map(a=>(a.children?.length??0)>0?i`<details class="mateu-nav-group">
                       <summary class="mateu-nav-item">${a.text} ▾</summary>
                       <div class="mateu-nav-panel">
                           ${a.children.map(s=>ja(s,t))}
                       </div>
                   </details>`:ja(a,t))}
    </nav>`,Na=(e,t)=>r=>t.call(e,{detail:{value:r}}),xr=(e,t)=>e.themeToggle?i`
        <button class="app-chrome-icon-btn" @click="${t.toggleTheme}"
            title="${t.isDark?"Switch to light mode":"Switch to dark mode"}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            ${H(t.isDark?"vaadin:sun-o":"vaadin:moon","color: var(--lumo-body-text-color);")}
        </button>
    `:l,Gc=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},Fa=(e,t,r)=>{const a=Ge(e,t,r),s=te(t,r);return a=="list"||a==s?"new":a},Ge=(e,t,r)=>{const a=e?._route;if(a!=null&&(a===""||a.startsWith("/"))){const s=r.homeRoute??"",o=s.indexOf("?"),n=o>=0?s.substring(o+1):"",d=te(t,r)+a;if(!n)return d;const c=d.indexOf("?")>=0?"&":"?";return d+c+n}return t.selectedRoute?t.selectedRoute:r.homeRoute},te=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,Ae=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,Le=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,De=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,Hs=(e,t,r,a,s,o,n)=>{if(t.chromeless)return i`
            <div class="app chromeless">
                <div class="${"app-content"+(e.pageCompact?" no-padding":"")}" style="height: 100%;">
                    <div class="m-md">
                        <div class="m-scroll" style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${Ge(a,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${Ae(e,t)}"
                                        consumedRoute="${te(e,t)}"
                                        serverSideType="${Le(e,t)}"
                                        uriPrefix="${De(e,t)}"
                                        style="width: 100%;"
                                        .appState="${o}"
                                        .appData="${n}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                        ${t.sseUrl?i`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                    </div>
                </div>
                <slot></slot>
            </div>
        `;const d=e.mapItems(t.menu,e.filter?.toLowerCase()??""),c=te(e,t),p=Fa(a,e,t),h=p&&p!=="new"&&p.startsWith(c+"/")?p.substring(c.length+1).split("/")[0]:void 0;return i`
                    ${t.variant==Ke.MEDIATOR?i`

                        ${t.layout=="SPLIT"?i`
                            <div class="m-md">
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${te(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Ae(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Le(e,t)}"
                                            uriPrefix="${De(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...o,_splitDetailId:h}}"
                                            .appData="${n}"
                                            instant="${c}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${Fa(a,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${Ae(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Le(e,t)}"
                                            uriPrefix="${De(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>

                            </div>
                        `:i`
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${Ge(a,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${Ae(e,t)}"
                                        consumedRoute="${te(e,t)}"
                                        serverSideType="${Le(e,t)}"
                                        uriPrefix="${De(e,t)}"
                                        style="width: 100%;"
                                        .appState="${o}"
                                        .appData="${n}"
                                        .initialState="${a}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:l}
            ${t.variant==Ke.HAMBURGUER_MENU?i`
                <div class="mateu-app-layout m-app-layout ${t.drawerClosed?"":"drawer-open"} ${t?.cssClasses}" style="${t?.style}">
                    <header class="app-navbar">
                        <button class="drawer-toggle" title="Menu"
                                @click="${f=>f.currentTarget.closest(".m-app-layout")?.classList.toggle("drawer-open")}">
                            ${H("vaadin:menu")}
                        </button>
                        <h2 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; margin: 0 .5rem;">${t.title}</h2><p style="margin: 0;">${t.subtitle}</p>
                        <div class="m-hl" style="margin-left: auto; align-items: center;">
                            <slot name="widgets"></slot>
                            ${Zt(t,e)}${xr(t,e)}
                        </div>
                    </header>
                    <div class="app-body">
                        <aside class="app-drawer p-s" @navigation-requested="${e.updateRoute}">
                            ${t.menu&&t.totalMenuOptions>10?i`
                                <div style="position: sticky; top: 0; z-index: 2; background: var(--lumo-base-color); padding: .25rem 0 .5rem;">
                                    <input class="drawer-search" placeholder="Search…" style="width: calc(100% - 20px); margin: 0 10px;"
                                           @input="${f=>Gc({detail:{value:f.target.value}},e)}">
                                </div>
                                `:l}
                            <nav class="side-nav">
                                ${e.renderSideNav(d,void 0)}
                            </nav>
                        </aside>
                        <div class="${"app-content"+(e.pageCompact?" no-padding":"")}" style="flex: 1; min-width: 0;">
                            <div class="m-md">
                                <div class="m-scroll" style="height: 100%;">
                                    <mateu-api-caller>
                                        <mateu-ux
                                                route="${Ge(a,e,t)}"
                                                id="ux_${e.id}"
                                                baseUrl="${Ae(e,t)}"
                                                consumedRoute="${te(e,t)}"
                                                serverSideType="${Le(e,t)}"
                                                uriPrefix="${De(e,t)}"
                                                style="width: 100%;"
                                                .appState="${o}"
                                                .appData="${n}"
                                                instant="${e.instant}"
                                                @navigation-requested="${e.updateRoute}"
                                        ></mateu-ux>
                                    </mateu-api-caller>
                                </div>
                                ${t.sseUrl?i`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                            </div>
                        </div>
                    </div>
                </div>

            `:l}
            
            ${t.variant==Ke.MENU_ON_TOP?i`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <div class="m-hl" style="align-items: center;">
                            ${t.logo?i`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:l}
                            ${t.title?i`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:l}
                        </div>
                        </a>
                        ${(()=>{const f=Na(e,e.itemSelected);return j.get()?.renderTopNav?.(d,f,"menu-on-top")??Ma(d,f,"menu-on-top")})()}
                        <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${Zt(t,e)}${xr(t,e)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ge(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Ae(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Le(e,t)}"
                                            uriPrefix="${De(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?i`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                    </div>
                </div>

            `:l}

            ${t.variant==Ke.TILES?i`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <div class="m-hl" style="align-items: center;">
                            ${t.logo?i`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:l}
                            ${t.title?i`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:l}
                        </div>
                        </a>
                        ${Ma(e.mapItemsForTiles(t.menu),Na(e,e.itemSelectedTiles),"menu-on-top")}
                        <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${Zt(t,e)}${xr(t,e)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):i`
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ge(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Ae(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Le(e,t)}"
                                            uriPrefix="${De(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?i`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                        `}
                    </div>
                </div>
            `:l}

            ${t.variant==Ke.RAIL?i`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):l}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ge(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Ae(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Le(e,t)}"
                                            uriPrefix="${De(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?i`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                    </div>
                </div>
            `:l}

            ${t.variant==Ke.MENU_ON_LEFT?i`

                <div class="m-hl">
                    <div class="m-scroll" style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <div class="m-vl"
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(f=>e.renderOptionOnLeftMenu(f))}
                            ${Zt(t,e)}${xr(t,e)}
                        </div>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ge(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Ae(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Le(e,t)}"
                                            uriPrefix="${De(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${o}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?i`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                    </div>
                </div>


            `:l}

            ${t.variant==Ke.TABS?i`
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
                                ${t.logo?i`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:l}
                                ${t.title?i`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:l}
                            </div>
                            </a>
                            <nav class="mateu-tabs ${e.component?.cssClasses??""}" style="flex-grow: 1; min-width: 0;">
                                ${t.menu.map((f,v)=>i`
                                <button class="mateu-tab ${v===e.getSelectedIndex(t.menu)?"mateu-tab--active":""}"
                                        @click="${()=>e.selectRoute(f.consumedRoute,f.route,f.actionId,f.baseUrl,f.serverSideType,f.uriPrefix)}"
                                >${f.label}</button>`)}
                            </nav>
                            <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${Zt(t,e)}
                            </div>
                        </div>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ge(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Ae(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Le(e,t)}"
                                            uriPrefix="${De(e,t)}"
                                            style="width: 100%;"
                                            .appState="${o}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?i`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                    </div>
                </div>
            
            `:l}

            ${t.fabs?.map((f,v)=>i`
                <button class="app-fab" style="bottom: ${(t.sseUrl?5.5:1.5)+v*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(f.actionId)}"
                    title="${f.label}">
                    ${H(f.icon)}
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?i`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    ${H("vaadin:comments-o")}
                </button>
            `:l}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},Kc=(e,t)=>t!=null&&e!=null&&!e.has(t),Yc=typeof HTMLElement<"u"?HTMLElement:class{};class Jc extends Yc{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",r=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
                ⚠ Component “${t}” is not supported by the “${r}” renderer yet.
            </div>
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",Jc);const Ba=new Set,Xc=(e,t,r)=>{const a=`${r}/${t}`;return Ba.has(a)||(Ba.add(a),console.warn(`[mateu] Component type "${t}" is not supported by the "${r}" renderer — rendering <mateu-unsupported> placeholder.`)),i`<mateu-unsupported
            type="${t}"
            renderer="${r}"
            data-component-id="${e?.id??l}"
            slot="${e?.slot??l}"
    ></mateu-unsupported>`};class Qc{renderFilterBar(t,r,a,s,o,n,d,c){const p=r?.metadata,h=v=>{const{fieldId:y,value:S}=v.detail;t.state={...t.state,[y]:S}},f=v=>{const{fieldIds:y}=v.detail,S={};y.forEach(g=>{S[g]=void 0}),S.searchText=void 0,t.state={...t.state,...S}};return i`
            <mateu-filter-bar
                .metadata="${p}"
                @search-requested="${t.search}"
                @value-changed="${h}"
                @filter-reset-requested="${f}"
                .state="${t.state}"
                .data="${o}"
                .appState="${n}"
                .appData="${d}"
                ?searchOnly="${c??!1}"
            >
                ${p?.header?.map(v=>w(t,v,a,s,o,n,d))}
            </mateu-filter-bar>
        `}renderPagination(t,r){return i`
        <mateu-pagination
                @page-changed="${t.pageChanged}"
                @fetch-more-elements="${t.fetchMoreElements}"
                .totalElements="${t.data[r?.id]?.page?.totalElements??0}"
                .pageSize="${t.data[r?.id]?.page?.pageSize??10}"
                data-testid="pagination"
                .pageNumber="${t.data[r?.id]?.page?.pageNumber??0}"
        ></mateu-pagination>
        `}renderTableComponent(t,r,a,s,o,n,d){const c=t.data?.[t.id]?.page?.content??[];return ta(r,c,s[r?.id]?.emptyStateMessage)}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,r,a,s,o,n,d,c){const p=r?.metadata?.type??r?.type,h=Object.values(m).includes(p)?p:void 0;return Kc(this.supportedClientSideTypes(),h)?Xc(r,h,this.rendererName()):ba(t,r,a,s,o,n,d,c)}renderAppComponent(t,r,a,s,o,n,d){return Hs(t,r?.metadata,a,s,o,n,d)}}const Zc={fixed:"fixedWidth",full:"fullWidth",edge:"edgeToEdge"},qa=Symbol("pageLayoutSyncSetup");class eu extends Va{constructor(t){if(super(t),t.type!==Wa.ELEMENT)throw new Error("pageLayoutSync is an element directive")}render(){return l}update(t){const r=t.element;if(r[qa])return l;r[qa]=!0;const a=()=>r.querySelector("mateu-ux"),s=()=>{const c=a()?.getAttribute("data-page-width"),p=c?Zc[c]:void 0;p&&(r.pageLayout=p);const h=r.querySelector(".oj-sp-rw-ask-oracle-page-container");h&&p&&(p==="fullWidth"||p==="edgeToEdge"?(h.style.setProperty("--oj-sp-simple-uishell-max-content-width","100%"),h.style.setProperty("--oj-sp-simple-uishell-max-content-width-margin","0"),h.style.setProperty("--oj-sp-simple-uishell-max-content-width-padding",p==="edgeToEdge"?"0":"24px")):(h.style.removeProperty("--oj-sp-simple-uishell-max-content-width"),h.style.removeProperty("--oj-sp-simple-uishell-max-content-width-margin"),h.style.removeProperty("--oj-sp-simple-uishell-max-content-width-padding")))};let o,n=0;const d=setInterval(()=>{const c=a();c&&!o&&(o=new MutationObserver(s),o.observe(c,{attributes:!0,attributeFilter:["data-page-width"]}),s()),(o||++n>60)&&clearInterval(d)},250);return l}}const tu=Ha(eu);var ru=Object.defineProperty,au=Object.getOwnPropertyDescriptor,$a=(e,t,r,a)=>{for(var s=a>1?void 0:a?au(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(s=(a?n(t,r,s):n(s))||s);return a&&s&&ru(t,r,s),s};let Nr=class extends C{constructor(){super(...arguments),this.menu=[],this.open=!1}createRenderRoot(){return this}disconnectedCallback(){super.disconnectedCallback(),this.closePalette()}updated(e){this.open&&!this.overlay&&this.openPalette(),!this.open&&this.overlay&&this.closePalette()}toMapTree(e,t="m"){const r=[];return e.forEach((a,s)=>{if(a.separator)return;const o=`${t}-${s}`;r.push({id:o,label:a.label??"",url:a.route??"",children:a.submenus?.length?this.toMapTree(a.submenus,o):[]})}),r}navigate(e){this.open=!1,this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:e},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:e},bubbles:!0,composed:!0}))}openPalette(){const e=window.__mateuArrayTreeDataProvider;if(!e)return;const t=document.createElement("div");t.className="mateu-spectra-nav-overlay",t.setAttribute("style","position:fixed; inset:0; z-index:9999;");const r=document.createElement("button");r.setAttribute("aria-label","Close"),r.textContent="✕",r.setAttribute("style","position:fixed; top:1rem; right:1.25rem; z-index:10000; width:2.25rem; height:2.25rem; border:none; border-radius:50%; background:rgba(255,255,255,.15); color:#fff; font-size:1.1rem; cursor:pointer;"),r.addEventListener("click",()=>this.open=!1);const a=document.createElement("oj-sp-ask-oracle-product-map");a.setAttribute("style","display:block; width:100%; height:100%;"),a.data=new e(this.toMapTree(this.menu),{keyAttributes:"id",childrenAttribute:"children"}),a.optionsKeys={label:"label",url:"url"},a.addEventListener("ojSpNavigate",s=>{const o=s.detail,n=o?.url??o?.data?.url??o?.item?.url??(typeof o=="string"?o:void 0);n&&this.navigate(n)}),t.append(a,r),document.body.appendChild(t),this.overlay=t,this._esc=s=>{s.key==="Escape"&&(this.open=!1)},document.addEventListener("keydown",this._esc)}closePalette(){this._esc&&document.removeEventListener("keydown",this._esc),this._esc=void 0,this.overlay?.remove(),this.overlay=void 0}render(){return i`
      <button
        class="mateu-spectra-nav-trigger"
        title="Search & navigate"
        @click=${()=>this.open=!0}
        style="display:inline-flex; align-items:center; gap:.5rem; height:2.25rem; padding:0 1rem; min-width:16rem;
               border:1px solid rgba(255,255,255,.35); border-radius:1.25rem; background:rgba(255,255,255,.1);
               color:#fff; font:inherit; cursor:pointer;"
      >
        <span aria-hidden="true">🔍</span>
        <span style="opacity:.85;">Search &amp; navigate</span>
      </button>
    `}};$a([u({attribute:!1})],Nr.prototype,"menu",2);$a([b()],Nr.prototype,"open",2);Nr=$a([x("mateu-spectra-nav")],Nr);function su(e){const t=window.__mateuArrayDataProvider;return t?new t(e.map(r=>({value:r.value,label:r.label})),{keyAttributes:"value"}):void 0}function ou(e,t,r,a,s,o,n,d){const c=t.metadata,p=a,h=p&&c.fieldId in p?p[c.fieldId]:c.initialValue,f=h==null?"":String(h),v=(U,ue)=>{U==null||String(U)===f||ue?.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:c.fieldId,value:U},bubbles:!0,composed:!0}))},y=c.label||c.fieldId,S=d||!c.label?"none":"top",g=t.slot??l;return c.readOnly||c.stereotype==="plainText"?i`<div class="mateu-rw-field-plain" slot=${g}>${f}</div>`:c.options?.length?i`<oj-c-select-single
      class="mateu-rw-field"
      slot=${g}
      label-hint=${y}
      label-edge=${S}
      item-text="label"
      .data=${su(c.options)}
      .value=${f}
      ?disabled=${!!c.disabled}
      @valueChanged=${U=>v(U.detail?.value,U.currentTarget)}
    ></oj-c-select-single>`:c.dataType==="integer"||c.dataType==="number"||c.dataType==="double"||c.dataType==="money"?i`<oj-c-input-number
      class="mateu-rw-field"
      slot=${g}
      label-hint=${y}
      label-edge=${S}
      .value=${h==null?l:Number(h)}
      ?disabled=${!!c.disabled}
      @valueChanged=${U=>v(U.detail?.value,U.currentTarget)}
    ></oj-c-input-number>`:i`<oj-c-input-text
    class="mateu-rw-field"
    slot=${g}
    label-hint=${y}
    label-edge=${S}
    .value=${f}
    ?disabled=${!!c.disabled}
    @valueChanged=${U=>v(U.detail?.value,U.currentTarget)}
  ></oj-c-input-text>`}function iu(e,t,r){const a=e.metadata,s=zt(a.label??"",t,r),o=a.buttonStyle==="primary"?"callToAction":a.buttonStyle==="tertiary"?"borderless":"outlined",n=d=>d.currentTarget?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,parameters:a.parameters},bubbles:!0,composed:!0}));return i`<oj-c-button
    id=${e.id??l}
    slot=${e.slot??l}
    label=${s}
    chroming=${o}
    ?disabled=${!!a.disabled}
    @ojAction=${n}
  ></oj-c-button>`}const xa=(e,t,r,a,s,o,n)=>(t.children??[]).map(d=>w(e,d,r,a,s,o,n));function nu(e,t,r,a,s,o,n){const d=t.metadata,c=d.columns&&d.columns>0?`repeat(${d.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return i`<div
    style="display:grid; grid-template-columns:${c}; gap:1rem; padding:1rem; align-items:start; width:100%; box-sizing:border-box;"
  >
    ${xa(e,t,r,a,s,o,n)}
  </div>`}function lu(e,t,r,a,s,o,n){return i`<div class="mateu-rw-scoreboard" style="grid-column:1 / -1;">
    ${xa(e,t,r,a,s,o,n)}
  </div>`}function du(e,t,r,a,s,o,n){const d=t.metadata,c=[];return d.colSpan&&d.colSpan>1&&c.push(`grid-column: span ${d.colSpan}`),d.rowSpan&&d.rowSpan>1&&c.push(`grid-row: span ${d.rowSpan}`),i`<oj-sp-dashboard-panel
    class="mateu-rw-panel"
    .panelTitle=${d.title??""}
    .panelSubtitle=${d.subtitle??""}
    style=${c.length?c.join("; "):l}
    >${xa(e,t,r,a,s,o,n)}</oj-sp-dashboard-panel
  >`}function cu(e,t){const r=t.metadata,a=`${r.value??""}${r.unit?" "+r.unit:""}`,s=r.trendLabel||r.description||"",o=r.trend==="up"?"success":r.trend==="down"?"danger":"neutral",n=`flex:1 1 12rem; min-width:12rem;${r.actionId?" cursor:pointer;":""}`,d=r.actionId?c=>c.currentTarget?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:{}},bubbles:!0,composed:!0})):void 0;return i`<oj-sp-scoreboard-metric-card
    style=${n}
    .cardTitle=${r.title??""}
    .metricText=${a}
    .metaText=${s}
    .trendColor=${o}
    @click=${d}
  ></oj-sp-scoreboard-metric-card>`}function uu(e,t){const r=t.metadata,a=r.badges??[],s=r.facts??[];return i`<div class="mateu-rw-entity-header">
    <div class="rw-eh-top">
      <div class="rw-eh-titles">
        <h1 class="rw-eh-title">${r.title??""}</h1>
        ${r.subtitle?i`<div class="rw-eh-subtitle">${r.subtitle}</div>`:l}
        ${a.length?i`<div class="rw-eh-badges">
              ${a.map(o=>i`<span class="rw-eh-chip rw-eh-chip--${o.color||"neutral"}">${o.label??""}</span>`)}
            </div>`:l}
      </div>
      ${r.metricValue?i`<div class="rw-eh-metric">
            <div class="rw-eh-metric-value">${r.metricValue}</div>
            ${r.metricLabel?i`<div class="rw-eh-metric-label">${r.metricLabel}</div>`:l}
            ${r.metricCaption?i`<div class="rw-eh-metric-caption">${r.metricCaption}</div>`:l}
          </div>`:l}
    </div>
    ${s.length?i`<div class="rw-eh-facts">
          ${s.map(o=>i`<div class="rw-eh-fact">
              <div class="rw-eh-fact-label">${o.label??""}</div>
              <div class="rw-eh-fact-value">${o.value??""}</div>
            </div>`)}
        </div>`:l}
  </div>`}function pu(e,t,r,a,s,o,n){const d=t.metadata,c=p=>p?w(e,p,r,a,s,o,n):l;return i`<div class="mateu-rw-card ${t.cssClasses||""}" style=${t.style||l}>
    ${d.header?i`<div class="rw-card-header">${c(d.header)}</div>`:l}
    ${d.title?i`<div class="rw-card-title">${c(d.title)}</div>`:l}
    ${d.subtitle?i`<div class="rw-card-subtitle">${c(d.subtitle)}</div>`:l}
    ${c(d.media)}
    ${d.content?i`<div class="rw-card-content">${c(d.content)}</div>`:l}
    ${d.footer?i`<div class="rw-card-footer">${c(d.footer)}</div>`:l}
  </div>`}const mu=Symbol("ojListeners");class hu extends Va{constructor(t){if(super(t),t.type!==Wa.ELEMENT)throw new Error("applyOj can only be used on an element binding")}render(t){return l}update(t,[r]){const a=t.element;for(const[o,n]of Object.entries(r.props??{}))n!==void 0&&(a[o]=n);for(const[o,n]of Object.entries(r.attrs??{}))n===void 0?a.removeAttribute(o):a.setAttribute(o,n);const s=a[mu]??={};for(const[o,n]of Object.entries(r.events??{})){const d=s[o];d&&a.removeEventListener(o,d),a.addEventListener(o,n),s[o]=n}return l}}const fu=Ha(hu);function Be(e,t){const r=Qs(e);return Xs`<${r} ${fu({props:t.props,attrs:t.attrs,events:t.events})}>${t.children??l}</${r}>`}function vu(e,t,r,a,s,o,n){const d=t.metadata,c=t.children??[],p=c.find(y=>y.slot==="overview"),h=d.panels??[],f=y=>y?w(e,y,r,a,s,o,n):l,v=h.findIndex(y=>y.open!==!1);return Be("oj-sp-foldout-layout",{props:{orientation:d.orientation==="horizontal"?"horizontal":"vertical",selectedPanel:v>=0?v:0},attrs:{class:t.cssClasses||void 0,style:`min-height: 32rem; ${t.style||""}`},children:i`
      ${p?i`<div slot="overview">${f(p)}</div>`:l}
      ${h.map((y,S)=>Be("oj-sp-foldout-panel-summarizing",{props:{panelTitle:y.title??""},children:i`
            <div>${f(c.find(g=>g.slot===`panel-${S}`))}</div>
            ${y.subtitle?i`<div slot="summary">${y.subtitle}</div>`:l}
          `}))}
    `})}function bu(e,t,r,a,s,o,n){const d=t.metadata,c=t.children??[];return Be("oj-sp-welcome-page",{props:{pageTitle:d.title??"",descriptionText:d.subtitle??"",illustrationBackground:d.image??void 0},attrs:{"display-options.responsive-padding":"on",class:t.cssClasses||void 0,style:t.style||void 0},children:c.length?i`<div class="oj-flex oj-sm-flex-wrap oj-sm-align-items-center" style="gap: 0.75rem;">
          ${c.map(p=>w(e,p,r,a,s,o,n))}
        </div>`:l})}function gu(e){const t=e.metadata,a=!!(t.actionId&&t.actionLabel)?{label:t.actionLabel,display:"on",type:"callToAction"}:null;return Be("oj-sp-empty-state",{props:{primaryText:t.title??"",secondaryText:t.description??"",primaryAction:a},attrs:{slot:e.slot||void 0,class:e.cssClasses||void 0,style:e.style||void 0},events:{spPrimaryAction:s=>{t.actionId&&s.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))}},children:l})}function yu(e,t,r,a,s,o,n){const c=t.metadata.title??"",p=c.includes("${")?e._evalTemplate(c):c,h=t.children?.length?i`${t.children.map(f=>w(e,f,r,a,s,o,n))}`:l;return Be("oj-sp-section",{props:{sectionTitle:p,level:"section"},attrs:{slot:t.slot||void 0,class:t.cssClasses||void 0,style:t.style||void 0},children:h})}function $u(e){const t=e.metadata,r=t.breadcrumbs??[],a=window.__mateuArrayDataProvider;if(!a)return i`<div style="display:flex; align-items:center; gap:0.5rem;" slot="${e.slot??l}">
      ${r.map(c=>i`<a href="${c.link??"#"}">${c.text}</a><span>/</span>`)}
      <span>${t.currentItemText}</span>
    </div>`;const s=r.slice().reverse(),o=[{id:"__current__",displayName:t.currentItemText},...s.map((c,p)=>({id:`c${p}`,displayName:c.text}))],n=new Map(s.map((c,p)=>[`c${p}`,c.link])),d=new a(o,{keyAttributes:"id"});return Be("oj-sp-breadcrumb-container",{props:{data:d},attrs:{slot:e.slot||void 0,class:e.cssClasses||void 0,style:e.style||void 0},events:{spAction:c=>{const p=c.detail?.id,h=p?n.get(p):void 0;if(!h)return;const f=c.target;f.dispatchEvent(new CustomEvent("route-changed",{detail:{route:h},bubbles:!0,composed:!0})),f.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:h},bubbles:!0,composed:!0}))}}})}function xu(e){const t=e.metadata;return Be("oj-c-avatar",{props:{initials:t.abbreviation||void 0,src:t.image||void 0,size:"md"},attrs:{slot:e.slot||void 0,title:t.name||void 0,class:e.cssClasses||void 0,style:e.style||void 0}})}function wu(e){const t=e.metadata,r=t.max&&t.max>0?t.max:100,a=t.indeterminate?-1:t.value??0;return Be("oj-c-progress-bar",{props:{value:a,max:r},attrs:{slot:e.slot||void 0,class:e.cssClasses||void 0,style:e.style||void 0}})}const ku={success:"success",error:"danger",warning:"warning",contrast:"info",normal:"neutral"};function Cu(e){const t=e.metadata,r=ku[String(t.color??"normal")]??"neutral";return Be("oj-c-badge",{props:{label:t.text??"",variant:r,size:t.small?"sm":void 0},attrs:{slot:e.slot||void 0,class:e.cssClasses||void 0,style:e.style||void 0}})}function Su(e){const t=e.metadata,r=t.value??0,a=t.max&&t.max>0?t.max:100;let s;t.dangerAt!=null&&r>=t.dangerAt?s="#C74634":t.warnAt!=null&&r>=t.warnAt&&(s="#946f00");const o=[t.unit?`${r} ${t.unit}`:void 0,t.caption].filter(Boolean).join(" · ");return i`<div
    slot="${e.slot??l}"
    class="${e.cssClasses??l}"
    style="${e.style??""}"
  >
    ${t.label?i`<div style="font-weight:600; margin-bottom:.25rem;">${t.label}</div>`:l}
    ${Be("oj-c-meter-bar",{props:{value:r,max:a,size:"md",color:s},attrs:{style:"width:100%;"}})}
    ${o?i`<div style="font-size:.8rem; color:var(--lumo-secondary-text-color,#666); margin-top:.25rem;">${o}</div>`:l}
  </div>`}const _u={[m.FormField]:(e,t,r,a,s,o,n,d)=>ou(e,t,r,a,s,o,n,d),[m.Button]:(e,t,r,a,s)=>iu(t,a,s),[m.DashboardLayout]:(e,t,r,a,s,o,n)=>nu(e,t,r,a,s,o,n),[m.Scoreboard]:(e,t,r,a,s,o,n)=>lu(e,t,r,a,s,o,n),[m.DashboardPanel]:(e,t,r,a,s,o,n)=>du(e,t,r,a,s,o,n),[m.MetricCard]:(e,t)=>cu(e,t),[m.EntityHeader]:(e,t)=>uu(e,t),[m.Card]:(e,t,r,a,s,o,n)=>pu(e,t,r,a,s,o,n),[m.FoldoutLayout]:(e,t,r,a,s,o,n)=>vu(e,t,r,a,s,o,n),[m.HeroSection]:(e,t,r,a,s,o,n)=>bu(e,t,r,a,s,o,n),[m.EmptyState]:(e,t)=>gu(t),[m.FormSection]:(e,t,r,a,s,o,n)=>yu(e,t,r,a,s,o,n),[m.Breadcrumbs]:(e,t)=>$u(t),[m.Avatar]:(e,t)=>xu(t),[m.ProgressBar]:(e,t)=>wu(t),[m.Badge]:(e,t)=>Cu(t),[m.Meter]:(e,t)=>Su(t)};class Eu extends Qc{rendererName(){return"redwood"}renderClientSideComponent(t,r,a,s,o,n,d,c){const p=r?.metadata?.type??r?.type,h=Object.values(m).includes(p)?p:void 0,f=h?_u[h]:void 0;return f&&r?f(t,r,a,s,o,n,d,c):super.renderClientSideComponent(t,r,a,s,o,n,d,c)}renderAppComponent(t,r,a,s,o,n,d){const c=r?.metadata;if(!c)return super.renderAppComponent(t,r,a,s,o,n,d);if(c.chromeless)return super.renderAppComponent(t,r,a,s,o,n,d);const p=Hs(t,{...c,chromeless:!0},a,s,o,n,d);return i`
      <oj-sp-simple-ui-shell ${tu()}>
        <oj-sp-global-header slot="globalHeader">
          <span
            slot="start"
            class="mateu-spectra-app-title"
            style="font-weight:700; font-size:1rem; white-space:nowrap; color:#fff;"
            >${c.title??""}</span
          >
          <mateu-spectra-nav slot="center" .menu=${c.menu??[]}></mateu-spectra-nav>
          ${c.themeToggle?i`<button
                slot="end"
                title="Toggle theme"
                @click=${t.toggleTheme}
                style="width:2.25rem; height:2.25rem; border:none; border-radius:50%; background:transparent; color:#fff; font-size:1.1rem; cursor:pointer;"
              >
                ${t.isDark?"☀":"🌙"}
              </button>`:l}
        </oj-sp-global-header>
        <div slot="stretchingContents" class="oj-sp-rw-ask-oracle-page-container">${p}</div>
      </oj-sp-simple-ui-shell>
    `}renderIcon(t,r,a){const s=(t||"").replace(/^(vaadin|lumo):/,""),o=Iu[s];return i`<span class="mateu-icon ${a??""}" data-icon="${t}" aria-hidden="true"
                      style="display:inline-flex; align-items:center; justify-content:center; width:1em; height:1em; line-height:1; ${r??""}"
                >${o??"•"}</span>`}}const Iu={menu:"☰",search:"🔍","sun-o":"☀",moon:"🌙","comments-o":"💬",comment:"💬",plus:"+",minus:"−",check:"✓",close:"✕",edit:"✎",trash:"🗑",dashboard:"▦",bell:"🔔",user:"👤",cog:"⚙",filter:"≡",download:"⤓",upload:"⤑",refresh:"↻","angle-left":"‹","angle-right":"›","angle-down":"⌄","angle-up":"⌃",ellipsis:"⋯","ellipsis-dots-v":"⋮"};j.set(new Eu);j.setUseShadowRoot(!1);
