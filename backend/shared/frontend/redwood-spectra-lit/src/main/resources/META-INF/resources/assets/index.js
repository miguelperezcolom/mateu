const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-diagrams.js","assets/vendor.js"])))=>i.map(i=>d[i]);
import{i as $,n as u,e as Pe,a as S,b as i,t as w,A as l,o as Me,r as b,c as D,w as H,d as Ua,D as Na,u as Fa,s as ja,f as Ba,g as qa,h as Ha}from"./vendor-lit.js";import{S as Wa,a as Va,n as ke,b as Ga}from"./vendor.js";import{_ as pe}from"./mateu-redwood-spectra.js";import"./vendor-vaadin.js";const $t=new Wa,G={value:{}},Cr={value:{}},hr=$`
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
`,Ka={lon:0,lat:0},_s=3,Ya=e=>{if(!e)return;const t=e.split(",").map(a=>a.trim());if(t.length!==2)return;const r=Number(t[0]),s=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(r)||!Number.isFinite(s)))return{lon:s,lat:r}},Ja=e=>{if(e==null||e.trim()==="")return _s;const t=Number(e);return Number.isFinite(t)?t:_s};var Xa=Object.defineProperty,Qa=Object.getOwnPropertyDescriptor,qr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Qa(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Xa(t,r,a),a};let Nt=class extends S{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:r},{default:s},{default:a},{fromLonLat:o},{default:n}]=await Promise.all([pe(()=>import("./vendor-ol.js").then(c=>c.M),[]),pe(()=>import("./vendor-ol.js").then(c=>c.V),[]),pe(()=>import("./vendor-ol.js").then(c=>c.T),[]),pe(()=>import("./vendor-ol.js").then(c=>c.O),[]),pe(()=>import("./vendor-ol.js").then(c=>c.p),[]),pe(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=n,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const d=Ya(this.position)??Ka;this.map=new t({target:this.mapElement,layers:[new s({source:new a})],view:new r({center:o([d.lon,d.lat]),zoom:Ja(this.zoom)})})}render(){return i`<div id="map"></div>`}};Nt.styles=$`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;qr([u()],Nt.prototype,"position",2);qr([u()],Nt.prototype,"zoom",2);qr([Pe("#map")],Nt.prototype,"mapElement",2);Nt=qr([w("mateu-map")],Nt);const Za=typeof HTMLElement<"u"?HTMLElement:class{};class eo extends Za{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#r()}attributeChangedCallback(t,r,s){this.content=s??void 0}connectedCallback(){this.style.display="block",this.#r()}async#r(){if(!this.isConnected)return;const t=this.#e??"",r=++this.#t,[{marked:s},{default:a}]=await Promise.all([pe(()=>import("./vendor.js").then(o=>o.m),[]),pe(()=>import("./vendor.js").then(o=>o.p),[])]);r===this.#t&&(this.innerHTML=a.sanitize(await s.parse(t),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:o=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",eo);var K=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(K||{}),h=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Drawer="Drawer",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.WorkflowElk="WorkflowElk",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.FoldoutLayout="FoldoutLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e.PlanningBoard="PlanningBoard",e.Kanban="Kanban",e.Timeline="Timeline",e.ProgressSteps="ProgressSteps",e.Stat="Stat",e.Calendar="Calendar",e.PricingTable="PricingTable",e.OrgChart="OrgChart",e.Heatmap="Heatmap",e.Funnel="Funnel",e.TrendChart="TrendChart",e.FeatureGrid="FeatureGrid",e.Testimonials="Testimonials",e.Faq="Faq",e.CalloutCard="CalloutCard",e.CommentThread="CommentThread",e.FileList="FileList",e.Checklist="Checklist",e.ComparisonCard="ComparisonCard",e.EntityHeader="EntityHeader",e.Meter="Meter",e.TaskProgress="TaskProgress",e.StatusList="StatusList",e.BulletedList="BulletedList",e.Separator="Separator",e.Notice="Notice",e.TaskQueue="TaskQueue",e.ResourceGrid="ResourceGrid",e.OfferCard="OfferCard",e.AddOnPicker="AddOnPicker",e.Ledger="Ledger",e.PaymentPicker="PaymentPicker",e.ProcessMonitor="ProcessMonitor",e))(h||{});const ls="mateu-app-context",Ws="mateu-app-context-labels",Vs=e=>{try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}},Es=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},ds=()=>Vs(ls),Gs=()=>Vs(Ws),to=(e,t,r)=>{const s=ds(),a=Gs();t==null||t===""?(delete s[e],delete a[e]):(s[e]=t,r!==void 0&&(a[e]=r)),Es(ls,s),Es(Ws,a)};let Is=!1;const ro=()=>{Is||(Is=!0,window.addEventListener("storage",e=>{e.key===ls&&e.newValue!==e.oldValue&&window.location.reload()}))},so=(e,t)=>new Promise((r,s)=>{let a=!1;const o={retry:()=>{a||(a=!0,t().then(r,s))},giveUp:()=>{a||(a=!0,s(e))}},n=new CustomEvent("mateu-session-expired",{detail:o,cancelable:!0,bubbles:!1});typeof document<"u"&&!document.dispatchEvent(n)||o.giveUp()}),ao=(e,t)=>e.includes("json")?!0:t!==null&&typeof t=="object",oo=(e,t)=>{const r=e.finalUrl;if(!r)return;const s=typeof window<"u"?window.location.href:void 0;let a;try{a=new URL(e.requestedUrl,s).href}catch{return}if(a!==r&&!ao(e.contentType??"",e.data))return r};class io{constructor(){this.windowMs=4e3,this.threshold=12,this.events=[],this.reported=new Set}check(t,r=Date.now()){this.events.push({sig:t,t:r});const s=r-this.windowMs;this.events=this.events.filter(o=>o.t>=s);let a=0;for(const o of this.events)o.sig===t&&a++;if(a>=this.threshold){const o=!this.reported.has(t);return this.reported.add(t),{blocked:!0,firstTrip:o}}return this.reported.delete(t),{blocked:!1,firstTrip:!1}}reset(){this.events=[],this.reported.clear()}configure(t){t.windowMs!==void 0&&(this.windowMs=t.windowMs),t.threshold!==void 0&&(this.threshold=t.threshold)}}const no=new io;let Ut=[];class lo{constructor(){this.axiosInstance=Va.create({timeout:6e4}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t)),this.axiosInstance.interceptors.response.use(t=>{const r=oo({requestedUrl:this.axiosInstance.getUri(t.config),finalUrl:t.request?.responseURL,contentType:String(t.headers?.["content-type"]??""),data:t.data});if(r)throw window.location.assign(r),Object.assign(new Error("session lost — redirecting to "+r),{code:"ERR_CANCELED"});return t},t=>{const r=t;if(r?.response?.status===401&&r.config&&!r.config.__mateuRetried){const s=r.config;return s.__mateuRetried=!0,so(t,()=>this.axiosInstance.request(s))}throw t})}addSessionId(t){let r=sessionStorage.getItem("__mateu_sesion_id");r||(r=ke(),sessionStorage.setItem("__mateu_sesion_id",r)),t.headers["X-Session-Id"]=r}addAuthToken(t){const r=localStorage.getItem("__mateu_auth_token");r&&(t.headers.Authorization="Bearer "+r)}async wrap(t,r,s,a){return s||r.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t.then(o=>(r.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:a}})),o)).catch(o=>{throw o?.code=="ERR_CANCELED"?r.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{}})):r.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:a,reason:this.serialize(o)}})),o})}serialize(t){return t?.message?t:JSON.stringify(t)}async get(t){const r=new AbortController;return Ut=[...Ut,r],this.axiosInstance.get(t,{signal:r.signal})}async post(t,r){const s=new AbortController;return Ut=[...Ut,s],this.axiosInstance.post(t,r,{signal:s.signal})}async abortAll(){Ut.forEach(t=>t.abort()),Ut=[]}async runAction(t,r,s,a,o,n,d,c,p,f,m){r&&r.startsWith("/")&&(r=r.substring(1));const v=[t,r,s,d??"",a,o].join(""),y=no.check(v);return y.blocked?(await this.abortAll(),y.firstTrip&&console.error("[mateu] request loop detected — aborting repeated request",v),{messages:y.firstTrip?[{title:"",text:"A repeating request was detected and stopped to protect the server. Reload the page or navigate elsewhere.",position:"bottom-end",variant:"error",duration:6e3}]:[],commands:[],fragments:[],banners:[],appendBanners:!1,appData:void 0,appState:void 0}):(n={...ds(),...n},await this.wrap(this.post(t+"/mateu/v3/sync/"+(r&&r!=""?r:"_no_route"),{serverSideType:d,appState:n,componentState:c,parameters:p,initiatorComponentId:o,consumedRoute:s,route:r&&r!=""?"/"+r:"",actionId:a}).then(C=>C.data),f,m,a))}}const Tt=new lo;var ar=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(ar||{}),Ge=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(Ge||{}),co=Object.defineProperty,Ks=(e,t,r,s)=>{for(var a=void 0,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=n(t,r,a)||a);return a&&co(t,r,a),a};class Hr extends S{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const r=t.data,s=document.createElement(r.name);for(let a in r.attributes)s.setAttribute(a,r.attributes[a]);for(let a in r.on)s.addEventListener(a,o=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.on[a],parameters:{event:o}},bubbles:!0,composed:!0}))});return s},this.closeModal=()=>{const t=(this.shadowRoot??this).querySelectorAll("mateu-dialog, mateu-drawer");if(t&&t.length>0){t[t.length-1].close(),this.removeTopOverlayChild();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let r=document.querySelector('link[rel="icon"]');r!==null?r.setAttribute("href",t):(r=document.createElement("link"),r.setAttribute("rel","icon"),r.setAttribute("href",t),document.head.appendChild(r))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=$t.subscribe(t=>{if(t.command){const r=t.command;this.id==r.targetComponentId&&this.applyCommand(r)}if((!t.callbackToken||!this.callbackToken||t.callbackToken===this.callbackToken)&&t.fragment){const r=t.fragment;this.id==r.targetComponentId&&(this.applyFragment(r),this.completeMenu(r))}})}completeMenu(t){if(t.component&&t.component.type==K.ClientSide){const r=t.component,s=r.metadata;if(s?.type==h.App){const a=s,o=this.getRemoteMenus(a.menu);if(o.length>0){const n=o.map(d=>Tt.runAction(d.baseUrl,d.route,"_empty","",d.baseUrl+"#"+d.route,void 0,void 0,void 0,d.params,this,!0));Promise.all(n).then(d=>{a.menu=this.updateMenu(a.menu,d.map(c=>c.fragments).filter(c=>c).map(c=>c).flat()),a.variant=Ge.MENU_ON_TOP,$t.next({fragment:{component:r,data:void 0,state:void 0,action:ar.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(t,r){const s=[];return t.forEach(a=>{if(a.remote){const o=r.find(n=>n.targetComponentId==a.baseUrl+"#"+a.route);if(o&&o.component?.type==K.ClientSide){const n=o.component;if(n.metadata?.type==h.App){const d=n.metadata,c=a.serverSideType&&a.serverSideType!=""?a.serverSideType:d.serverSideType;this.changeBaseUrl(d.menu,a.baseUrl,c,a.route,d.route),s.push(...d.menu)}}}else s.push(a)}),s}changeBaseUrl(t,r,s,a,o){t.forEach(n=>{n.baseUrl||(n.submenus&&n.submenus.length>0?this.changeBaseUrl(n.submenus,r,s,a,o):(n.consumedRoute=o??"",n.baseUrl=r,n.serverSideType=s,n.uriPrefix=a))})}getRemoteMenus(t){const r=[];return t.forEach(s=>{s.remote&&r.push(s)}),r}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"&&this.dispatchNamedEvent(t.data),t.type=="NavigateTo"){const r=t.data;r&&(r.startsWith("http:")||r.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const r=t.data;r!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:r},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const r=t.data;if(r&&r.actionId)if(r.targetComponentId){const s={command:{type:"RunAction",data:{actionId:r.actionId},targetComponentId:r.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>$t.next(s))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const r=t.data;if(r&&r.base64Content){const s=atob(r.base64Content),a=new Uint8Array(s.length);for(let c=0;c<s.length;c++)a[c]=s.charCodeAt(c);const o=new Blob([a],{type:r.mimeType}),n=URL.createObjectURL(o),d=document.createElement("a");d.href=n,d.download=r.filename??"export",d.click(),URL.revokeObjectURL(n)}}if(t.type=="CloseModal"&&(this.closeModal(),this.dispatchNamedEvent(t.data)),t.type=="AddContentToHead"){const r=t.data;if(r&&r.name){if(r.attributes&&r.attributes.id&&document.getElementById(r.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const r=t.data;if(r&&r.name){if(r.attributes&&r.attributes.id&&document.getElementById(r.attributes.id))return;document.body.appendChild(this.createElement(t))}}}dispatchNamedEvent(t){if(t&&t.eventName){const r=this.component,s=r?.emitsName??r?.serverSideType;let a=t.payload??t.detail;s&&a&&typeof a=="object"&&(a={...a,__source:s}),this.dispatchEvent(new CustomEvent(t.eventName,{detail:a,bubbles:!0,composed:!0}))}}removeTopOverlayChild(){const t=this.component?.children;if(t)for(let r=t.length-1;r>=0;r--){const s=t[r]?.metadata?.type;if(s==h.Drawer||s==h.Dialog){t.splice(r,1);return}}}}Ks([u()],Hr.prototype,"id");Ks([u()],Hr.prototype,"baseUrl");var uo=Object.defineProperty,po=(e,t,r,s)=>{for(var a=void 0,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=n(t,r,a)||a);return a&&uo(t,r,a),a};class cs extends Hr{applyFragment(t){}manageActionRequestedEvent(t){}}po([u()],cs.prototype,"component");const Ft=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),Ht=(e,t,r)=>({state:e??{},data:t??{},...r});function Rt(e,t,r,s){if(!e?.includes("${"))return e;try{return Ft(e,Ht(t,r,s))}catch(a){return console.warn(`Mateu: could not interpolate "${e}":`,a),e}}const st=(e,t,r)=>{if(e&&e.indexOf("${")>=0)try{return Ft(e,Ht(t,r))}catch(s){return s.message}return e},or=(e,t,r,s,a)=>{if(!e)return e;const o=Ht(t,r,{appState:s??{},appData:a??{}});let n=e;try{if(n=Ft(e,o),n.includes("${"))try{n=Ft(n,o)}catch(d){n="when evaluating nested "+e+" :"+d+", where data is "+r+" and state is "+t+" and app state is "+s+" and app data is "+a,console.error(d,n,t,r,s,a)}}catch(d){n="when evaluating "+e+" :"+d+", where data is "+r+" and state is "+t+" and app state is "+s+" and app data is "+a,console.error(d,n,t,r,s,a)}return n},Ys=(e,t,r,s,a,o)=>{const n=Ht(t,r,{appState:s??{},appData:a??{},...o}),d=Ft(e,n);return new Function(...Object.keys(n),`return (${d})`)(...Object.values(n))},Js=(e,t,r,s)=>{const a=Ht(t,r,s);return new Function(...Object.keys(a),`return (${e})`)(...Object.values(a))},ho=(e,t,r,s)=>Ft(e,Ht(t,r,s)),mo=(e,t,r)=>{const s=e.metadata;return i`<vaadin-avatar
            img="${s.image}"
            name="${_r(s.name,t,r)}"
            abbr="${s.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??l}"
    ></vaadin-avatar>`},_r=(e,t,r)=>typeof e=="string"&&e.includes("${")?Rt(e,t,r):e,fo=e=>{const t=e.metadata;return i`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??l}">
    </vaadin-avatar-group>`},vo=(e,t,r)=>{const s=e.metadata;return i`<span theme="badge ${s.color} ${s.pill?"pill":""} ${s.small?"small":""} ${s.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??l}">${_r(s.text,t,r)}</span>`},bo=(e,t,r)=>{const s=_r(e.text,t,r);if(!s)return l;let a=_r(e.color,t,r);return a=="SUCCESS"&&(a="success"),a=="ERROR"&&(a="error"),a=="DANGER"&&(a="error"),a=="WARNING"&&(a="warning"),a=="INFO"&&(a="info"),a=="PRIMARY"&&(a="primary"),a=="SECONDARY"&&(a="secondary"),a=="TERTIARY"&&(a="tertiary"),a=="QUATERNARY"&&(a="quaternary"),a=="LIGHT"&&(a="light"),a=="DARK"&&(a="dark"),i`<span theme="badge ${a} ${e.pill?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${s}</span>`};class go{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const r=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:r?[...r].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const q=new go,yt=(e,t,r,s,a,o,n,d,c)=>(t.slot=d,k(e,t,r,s,a,o,n,c)),k=(e,t,r,s,a,o,n,d)=>{if(!t)return i``;if(t.type==K.ClientSide)return q.get().renderClientSideComponent(e,t,r,s,a,o,n,d);const c=e.route,p=e.consumedRoute;return i`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${p}"
                         baseUrl="${r}"
                         slot="${t.slot??l}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...s}}"
                         .data="${{...a}}"
                         .appState="${o}"
                         .appData="${n}"
        >
       </mateu-component>`};var yo=Object.defineProperty,$o=Object.getOwnPropertyDescriptor,Lt=(e,t,r,s)=>{for(var a=s>1?void 0:s?$o(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&yo(t,r,a),a};const xo=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},wo=e=>{const t=xo(e)??"",r=[];return t.includes("primary")&&r.push("primary"),t.includes("tertiary")&&r.push("tertiary"),(t.includes("error")||e.color==="error")&&r.push("danger"),r.join(" ")},Ps=e=>e==="back"||e==="backToList"||!!e&&e.startsWith("cancel");let Ke=class extends S{constructor(){super(...arguments),this.appState={},this.appData={},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>Rt(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return l;const t=this.evalLabel(e.label),r=q.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId));return r||i`
        <button class="mtb ${wo(e)}"
                data-action-id="${e.id}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${t}</button>
    `},this.renderPeerNav=e=>{const t=q.get()?.renderPeerNav?.(e);return t||i`
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
        `}}render(){const e=this.metadata;if(!e)return i``;const t=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0,r=e.toolbar??[],s=r.filter(c=>Ps(c.actionId)),a=r.filter(c=>!Ps(c.actionId)),o=s.length>0&&a.length>0?i`<span class="toolbar-divider"></span>`:l,n=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||r.length>0||!!t,d=e.level??0;return d>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested"),i`
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
                    ${e?.header?.map(c=>k(this,c,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${t?this.renderPeerNav(t):l}
                    ${s.map(this.renderBtn)}
                    ${o}
                    ${a.map(this.renderBtn)}
                </div>
            `:n?i`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="form-header">
                    ${e.avatar?k(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):l}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${e?.title&&d==0?i`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Me(st(e?.title,this.state??{},this.data??{}))}</h2>`:l}
                        ${e?.title&&d==1?i`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Me(st(e?.title,this.state??{},this.data??{}))}</h3>`:l}
                        ${e?.title&&d==2?i`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Me(st(e?.title,this.state??{},this.data??{}))}</h4>`:l}
                        ${e?.title&&d==3?i`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Me(st(e?.title,this.state??{},this.data??{}))}</h5>`:l}
                        ${e?.title&&d>3?i`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${Me(st(e?.title,this.state??{},this.data??{}))}</h6>`:l}

                        ${e?.subtitle?i`<span style="display: inline-block; margin-block-end: 0.83em;">${Me(st(e?.subtitle,this.state??{},this.data??{}))}</span>`:l}
                        ${e?.timestamp?i`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${Me(st(e.timestamp,this.state??{},this.data??{}))}</span>`:l}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e?.kpis?.map(c=>i`
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div>${this.evalLabel(c.title)}</div>
                                <div>${Me(st(c.text,this.state??{},this.data??{}))}</div>
                            </div>
                        `)}
                        ${e?.header?.map(c=>k(this,c,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${t?this.renderPeerNav(t):l}
                        ${s.map(this.renderBtn)}
                        ${o}
                        ${a.map(this.renderBtn)}
                    </div>
                </div>
            `:l}
            ${e.badges&&e.badges.length>0?i`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(c=>bo(c,this.state??{},this.data??{}))}
                </div>
            `:l}
        `}};Ke.styles=$`
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

        ${hr}
    `;Lt([u()],Ke.prototype,"metadata",2);Lt([u()],Ke.prototype,"baseUrl",2);Lt([u()],Ke.prototype,"state",2);Lt([u()],Ke.prototype,"data",2);Lt([u()],Ke.prototype,"appState",2);Lt([u()],Ke.prototype,"appData",2);Ke=Lt([w("mateu-content-header")],Ke);var ko=Object.defineProperty,So=Object.getOwnPropertyDescriptor,mr=(e,t,r,s)=>{for(var a=s>1?void 0:s?So(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&ko(t,r,a),a};let wt=class extends cs{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return i`
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
       `}};wt.styles=$`
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
    `;mr([u()],wt.prototype,"state",2);mr([u()],wt.prototype,"data",2);mr([u()],wt.prototype,"appState",2);mr([u()],wt.prototype,"appData",2);wt=mr([w("mateu-form")],wt);var Co=Object.defineProperty,_o=Object.getOwnPropertyDescriptor,us=(e,t,r,s)=>{for(var a=s>1?void 0:s?_o(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Co(t,r,a),a};let ir=class extends S{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?i`${e.map(()=>i`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?i`${e.map(()=>i`<div class="bone row"></div>`)}`:this.variant=="form"?i`${e.map(()=>i`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:i`${e.map(()=>i`<div class="bone line"></div>`)}`}};ir.styles=$`
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
    `;us([u()],ir.prototype,"variant",2);us([u({type:Number})],ir.prototype,"count",2);ir=us([w("mateu-skeleton")],ir);const Eo=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},rr=(e,t,r,s,a,o)=>i`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??"🗂"}</span>
            ${r?i`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${r}</span>`:l}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${s??e??"Nothing here yet."}</span>
            ${a&&o?i`
                <vaadin-button theme="tertiary" style="margin-top: .25rem;" @click="${n=>Eo(n,a)}">${o}</vaadin-button>
            `:l}
        </div>
    `,Io=e=>{const t=e.metadata;return i`
        <div style="${e.style??l}" class="${e.cssClasses??l}" slot="${e.slot??l}">
            ${rr(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},Po=e=>{const t=e.metadata;return i`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-skeleton>
    `},Xs="mateu-saved-views",Wr=()=>{try{return JSON.parse(localStorage.getItem(Xs)??"{}")}catch{return{}}},ps=e=>{try{localStorage.setItem(Xs,JSON.stringify(e))}catch{}},Qs=e=>Wr()[e]??[],Oo=(e,t)=>{const r=t.name?.trim();if(!r||Object.keys(t.values??{}).length===0)return;const s=Wr(),a=(s[e]??[]).filter(o=>o.name!==r);a.push({...t,name:r}),s[e]=a,ps(s)},zo=(e,t)=>{const r=Wr(),s=(r[e]??[]).filter(a=>a.name!==t);s.length===0?delete r[e]:r[e]=s,ps(r)},To=(e,t)=>{const r=Wr();r[e]=(r[e]??[]).map(s=>({...s,isDefault:s.name===t?!s.isDefault:!1})),ps(r)},Ro=e=>Qs(e).find(t=>t.isDefault);var Lo=Object.defineProperty,Do=Object.getOwnPropertyDescriptor,ve=(e,t,r,s)=>{for(var a=s>1?void 0:s?Do(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Lo(t,r,a),a};let re=class extends S{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.viewsOpened=!1,this.draftText="",this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{const e=this.filters.flatMap(r=>this.isRangeFilter(r)?[`${r.fieldId}_from`,`${r.fieldId}_to`]:[r.fieldId]),t={searchText:void 0};e.forEach(r=>{t[r]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return this.metadata?.filters??[]}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){const t=this.filters.find(r=>r.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e==="searchText"?"":void 0),this.requestSearch()}commitText(e){this.emitValueChanged("searchText",e.value),this.draftText="",e.value="",this.requestSearch()}get viewsScope(){return window.location.pathname}allFilterKeys(){return["searchText",...this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])]}snapshotValues(){const e={};return this.state.searchText&&(e.searchText=this.state.searchText),this.filters.forEach(t=>{if(this.isSet(t))if(this.isRangeFilter(t)){const r=this.rangeBound(t,"from"),s=this.rangeBound(t,"to");r&&(e[`${t.fieldId}_from`]=r),s&&(e[`${t.fieldId}_to`]=s)}else this.isMultiFilter(t)?e[t.fieldId]=this.multiValues(t):e[t.fieldId]=this.state[t.fieldId]}),e}applyView(e){const t=this.allFilterKeys(),r={};t.forEach(s=>{r[s]=void 0}),this.state={...this.state,...r},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:t},bubbles:!0,composed:!0})),Object.entries(e.values).forEach(([s,a])=>this.emitValueChanged(s,a)),this.viewsOpened=!1,this.detachOutsideClick(),this.requestSearch()}saveCurrentView(e){const t=e.value.trim();t&&(Oo(this.viewsScope,{name:t,values:this.snapshotValues()}),e.value="",this.requestUpdate())}firstUpdated(){if(window.location.search)return;const e=Ro(this.viewsScope);e&&setTimeout(()=>{this.state.searchText||this.filters.some(r=>this.isSet(r))||this.applyView(e)},0)}isBooleanFilter(e){return e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle"}isNumericFilter(e){return["integer","decimal","number","money"].includes(e.dataType??"")}isRangeFilter(e){return e.stereotype==="dateRange"||e.stereotype==="numberRange"}isMultiFilter(e){return e.stereotype==="multiSelect"}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){const t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t=="string"&&t!==""?t.split(",").map(r=>r.trim()).filter(r=>r):[]}rangeBound(e,t){const r=this.state[`${e.fieldId}_${t}`];return r==null?"":String(r)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,"from")!==""||this.rangeBound(e,"to")!=="";if(this.isMultiFilter(e))return this.multiValues(e).length>0;const t=this.state[e.fieldId];return t!=null&&t!==""&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){const r=e.options.find(s=>s.value===String(t));if(r)return r.label??r.value}return typeof t=="boolean"?t?"Yes":"No":String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){const t=this.rangeBound(e,"from"),r=this.rangeBound(e,"to");return t&&r?`${t} – ${r}`:t?`≥ ${t}`:`≤ ${r}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(", "):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return Rt(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,r="panel-row"){return i`
            <div class="${r}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){const t=e.stereotype==="numberRange"?"number":e.dataType==="dateTime"?"datetime-local":e.dataType==="time"?"time":"date",r=a=>{const o=a.closest(".panel-input-row"),n=o.querySelector("input.range-from").value,d=o.querySelector("input.range-to").value;this.emitValueChanged(`${e.fieldId}_from`,n===""?void 0:n),this.emitValueChanged(`${e.fieldId}_to`,d===""?void 0:d),this.requestSearch()},s=a=>{a.key==="Enter"&&r(a.target),a.key==="Escape"&&this.closePanel()};return i`
            <div class="panel-input-row">
                <input class="range-from" type="${t}" placeholder="From"
                       .value="${this.rangeBound(e,"from")}"
                       @mousedown="${a=>a.stopPropagation()}"
                       @keydown="${s}"/>
                <span class="range-separator" aria-hidden="true">–</span>
                <input class="range-to" type="${t}" placeholder="To"
                       .value="${this.rangeBound(e,"to")}"
                       @mousedown="${a=>a.stopPropagation()}"
                       @keydown="${s}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${a=>r(a.target)}">Apply</button>
            </div>`}renderMultiWidget(e){const t=this.multiValues(e),r=s=>{const a=t.includes(s)?t.filter(o=>o!==s):[...t,s];this.emitValueChanged(e.fieldId,a.length>0?a:void 0),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))};return i`${(e.options??[]).map(s=>this.panelRow(i`
            <span class="multi-check ${t.includes(s.value)?"multi-check--on":""}"
                  aria-hidden="true">${t.includes(s.value)?"✓":""}</span>
            ${s.label??s.value}
        `,()=>r(s.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return i`${e.options.map(s=>this.panelRow(s.label??s.value,()=>this.applyFilter(e.fieldId,s.value)))}`;if(this.isBooleanFilter(e))return i`
                ${this.panelRow("Yes",()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow("No",()=>this.applyFilter(e.fieldId,!1))}`;const t=this.isNumericFilter(e),r=s=>{s.value!==""&&this.applyFilter(e.fieldId,t?Number(s.value):s.value)};return i`
            <div class="panel-input-row">
                <input type="${t?"number":"text"}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${s=>s.stopPropagation()}"
                       @keydown="${s=>{s.key==="Enter"&&r(s.target),s.key==="Escape"&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${s=>r(s.target.previousElementSibling)}">Apply</button>
            </div>`}renderViewsPanel(){if(!this.viewsOpened)return l;const e=Qs(this.viewsScope),t=!!this.state.searchText||this.filters.some(r=>this.isSet(r));return i`
            <div class="panel views-panel">
                <div class="panel-caption">Saved views</div>
                ${e.length===0?i`
                    <div class="panel-row views-empty">No saved views yet</div>`:l}
                ${e.map(r=>i`
                    <div class="panel-row view-row" @mousedown="${this.keepFocus}">
                        <span class="view-name" @click="${()=>this.applyView(r)}">${r.name}</span>
                        <button class="view-star ${r.isDefault?"view-star--on":""}"
                                title="${r.isDefault?"Unset as default":"Open this listing with this view"}"
                                @click="${()=>{To(this.viewsScope,r.name),this.requestUpdate()}}">★</button>
                        <button class="chip-remove" aria-label="Delete view ${r.name}"
                                @click="${()=>{zo(this.viewsScope,r.name),this.requestUpdate()}}">✕</button>
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
        ${hr}
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
    `;ve([u()],re.prototype,"metadata",2);ve([u()],re.prototype,"baseUrl",2);ve([b()],re.prototype,"state",2);ve([b()],re.prototype,"data",2);ve([u()],re.prototype,"appState",2);ve([u()],re.prototype,"appData",2);ve([u({type:Boolean})],re.prototype,"searchOnly",2);ve([b()],re.prototype,"panelOpened",2);ve([b()],re.prototype,"viewsOpened",2);ve([b()],re.prototype,"activeFilter",2);ve([b()],re.prototype,"draftText",2);re=ve([w("mateu-filter-bar")],re);const Zs="mateu-column-prefs",hs=()=>{try{const e=JSON.parse(localStorage.getItem(Zs)??"{}");return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}},ea=e=>{try{localStorage.setItem(Zs,JSON.stringify(e))}catch{}},ms=e=>{if(!e||typeof e!="object")return;const t=r=>Array.isArray(r)?r.filter(s=>typeof s=="string"):[];return{hidden:t(e.hidden),order:t(e.order)}},ta=e=>ms(hs()[e]),Ao=(e,t)=>{const r=hs(),s=ms(t);s.hidden.length===0&&s.order.length===0?delete r[e]:r[e]=s,ea(r)},Mo=e=>{const t=hs();delete t[e],ea(t)},ra=e=>e?!!e.identifier||e.dataType==="action"||e.dataType==="actionGroup"||e.dataType==="menu"||e.id==="select"||e.id==="menu":!1,sa=(e,t,r=s=>s)=>{const s=ms(t);if(!s||s.hidden.length===0&&s.order.length===0)return e;const a=m=>r(m)?.id??m.id,o=new Set(s.hidden),n=e.filter(m=>{const v=a(m);return!v||!o.has(v)||ra(r(m))});if(s.order.length===0)return n.length===e.length?e:n;const d=new Map;n.forEach(m=>{const v=a(m);v&&!d.has(v)&&d.set(v,m)});const c=[],p=new Set;return s.order.forEach(m=>{const v=d.get(m);v&&!p.has(v)&&(c.push(v),p.add(v))}),n.forEach(m=>{p.has(m)||(c.push(m),p.add(m))}),c.length===e.length&&c.every((m,v)=>m===e[v])?e:c};var Uo=Object.defineProperty,No=Object.getOwnPropertyDescriptor,fr=(e,t,r,s)=>{for(var a=s>1?void 0:s?No(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Uo(t,r,a),a};let kt=class extends S{constructor(){super(...arguments),this.columns=[],this.scope="",this.panelOpened=!1,this.revision=0,this.togglePanel=()=>{if(this.panelOpened){this.closePanel();return}this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick)},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1},this.reset=()=>{Mo(this.scope),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}get prefs(){return ta(this.scope)??{hidden:[],order:[]}}effectiveEntries(e){return sa(this.columns,{hidden:[],order:e.order})}commit(e){Ao(this.scope,e),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}toggleVisibility(e){const t=this.prefs,r=t.hidden.includes(e)?t.hidden.filter(s=>s!==e):[...t.hidden,e];this.commit({...t,hidden:r})}move(e,t){const r=this.prefs,s=[...this.effectiveEntries(r)],a=s.findIndex(d=>d.id===e);if(a<0)return;let o=a+t;for(;o>=0&&o<s.length&&s[o].protected;)o+=t;if(o<0||o>=s.length)return;const n=s[a];s[a]=s[o],s[o]=n,this.commit({...r,order:s.map(d=>d.id)})}render(){this.revision;const e=this.prefs,t=this.effectiveEntries(e).filter(s=>!s.protected);if(t.length===0)return i``;const r=e.hidden.length>0||e.order.length>0;return i`
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
                        ${t.map((s,a)=>{const o=e.hidden.includes(s.id);return i`
                                <div class="row" data-column-id="${s.id}">
                                    <label class="row-label">
                                        <input
                                            type="checkbox"
                                            .checked="${!o}"
                                            @change="${()=>this.toggleVisibility(s.id)}"
                                        />
                                        <span class="${o?"muted":""}">${s.label||s.id}</span>
                                    </label>
                                    <button class="move" type="button" title="Move up" aria-label="Move ${s.label||s.id} up"
                                        ?disabled="${a===0}"
                                        @click="${()=>this.move(s.id,-1)}">↑</button>
                                    <button class="move" type="button" title="Move down" aria-label="Move ${s.label||s.id} down"
                                        ?disabled="${a===t.length-1}"
                                        @click="${()=>this.move(s.id,1)}">↓</button>
                                </div>
                            `})}
                        <div class="footer">
                            <button class="reset" type="button" ?disabled="${!r}" @click="${this.reset}">Reset</button>
                        </div>
                    </div>
                `:l}
            </div>
        `}};kt.styles=$`
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
    `;fr([u()],kt.prototype,"columns",2);fr([u()],kt.prototype,"scope",2);fr([b()],kt.prototype,"panelOpened",2);fr([b()],kt.prototype,"revision",2);kt=fr([w("mateu-column-chooser")],kt);var Fo=Object.defineProperty,jo=Object.getOwnPropertyDescriptor,vr=(e,t,r,s)=>{for(var a=s>1?void 0:s?jo(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Fo(t,r,a),a};let St=class extends S{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has("totalElements")||e.has("pageSize"))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return l;const e=this.totalPages>1,t=this.pageNumber,r=t===0,s=t>=this.totalPages-1;return i`
            <div class="bar">
                ${e?i`
                    <button class="nav" title="First page" ?disabled="${r}"
                        @click="${()=>this.dispatch(0)}" data-testid="page-first">«</button>
                    <button class="nav" title="Previous page" ?disabled="${r}"
                        @click="${()=>this.dispatch(t-1)}" data-testid="page-prev">‹</button>
                    <span class="page-indicator">Page ${t+1} of ${this.totalPages}</span>
                    <button class="nav" title="Next page" ?disabled="${s}"
                        @click="${()=>this.dispatch(t+1)}" data-testid="page-next">›</button>
                    <button class="nav" title="Last page" ?disabled="${s}"
                        @click="${()=>this.dispatch(this.totalPages-1)}" data-testid="page-last">»</button>
                    <span class="separator"></span>
                `:l}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?"":"s"}</span>
                <slot></slot>
            </div>
        `}};St.styles=$`
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
    `;vr([u()],St.prototype,"totalElements",2);vr([u()],St.prototype,"pageSize",2);vr([u()],St.prototype,"pageNumber",2);vr([b()],St.prototype,"totalPages",2);St=vr([w("mateu-pagination")],St);const Wt="var(--lumo-space-m, 1rem)",Bo=(e,t,r,s,a,o,n)=>{const d=t.metadata,c=d.columnWidth||"13rem";let f=`display: grid; grid-template-columns: ${d.maxColumns&&d.maxColumns>0?`repeat(${d.maxColumns}, minmax(0, 1fr))`:`repeat(auto-fill, minmax(min(100%, ${c}), 1fr))`}; gap: ${Wt} var(--lumo-space-l, 1.5rem); align-items: start;`;return d.labelsAside&&(f+=" --mateu-label-width: 10rem;"),d.fullWidth&&(f+=" width: 100%;"),f+=t.style??"",i`
        <div style="${f}" class="${t.cssClasses}" slot="${t.slot||l}">
            ${t.children?.map(m=>aa(d,e,m,r,s,a,o,n))}
        </div>
    `},aa=(e,t,r,s,a,o,n,d)=>{if(r.type==K.ClientSide&&r.metadata?.type==h.FormRow)return Wo(e,t,r,s,a,o,n,d);const c=qo(r),p=e.labelsAside?Ho(t,r,s,a,o,n,d):k(t,r,s,a,o,n,d);return i`<div style="grid-column: span ${c}; min-width: 0;">${p}</div>`},qo=e=>{if(e.type==K.ClientSide){const t=e.metadata;if(t?.type==h.FormField)return t.colspan||1}return 1},Ho=(e,t,r,s,a,o,n)=>{if(t.type==K.ClientSide&&t.metadata?.type==h.FormField&&t.metadata.label){const d=t.metadata,c=d.label?.includes("${")?e._evalTemplate(d.label):d.label;return i`
            <div style="display: flex; gap: ${Wt}; align-items: baseline;">
                <label style="flex: 0 0 var(--mateu-label-width, 10rem); color: var(--lumo-secondary-text-color, #667);">${c}</label>
                <div style="flex: 1; min-width: 0;">${k(e,t,r,s,a,o,n,!0)}</div>
            </div>
        `}return k(e,t,r,s,a,o,n)},Wo=(e,t,r,s,a,o,n,d)=>i`
        <div style="grid-column: 1 / -1; display: flex; gap: ${Wt}; flex-wrap: wrap;">
            ${r.children?.map(c=>i`<div style="flex: 1 1 ${100/Math.max(1,r.children.length)}%; min-width: min(100%, 13rem);">${aa(e,t,c,s,a,o,n,d)}</div>`)}
        </div>
    `,oa=(e,t,r,s,a,o,n,d)=>{const c=r.metadata;let p=`display: flex; flex-direction: ${e};`;c.spacing&&(p+=` gap: ${Wt};`),c.padding&&(p+=" padding: var(--lumo-space-m, 1rem);"),c.wrap&&(p+=" flex-wrap: wrap;"),c.fullWidth&&(p+=" width: 100%;"),c.justification&&(p+=` justify-content: ${c.justification};`);const f=e==="row"?c.verticalAlignment:c.horizontalAlignment;return f&&(p+=` align-items: ${f};`),p+=r.style??"",i`
        <div style="${p}" class="${r.cssClasses}" slot="${r.slot??l}">
            ${r.children?.map(m=>k(t,m,s,a,o,n,d))}
        </div>
    `},Vo=(e,t,r,s,a,o,n)=>oa("row",e,t,r,s,a,o,n),Go=(e,t,r,s,a,o,n)=>oa("column",e,t,r,s,a,o,n),Ko=(e,t,r,s,a,o,n)=>{const d=t.metadata;let p=`display: flex; flex-direction: ${d.orientation==="vertical"?"column":"row"}; gap: var(--lumo-space-s, 0.5rem);`;return d.fullWidth&&(p+=" width: 100%;"),p+=t.style??"",i`
        <div style="${p}" class="${t.cssClasses}" slot="${t.slot??l}">
            <div style="flex: 1; min-width: 0; min-height: 0;">${k(e,t.children[0],r,s,a,o,n)}</div>
            <div style="flex: 1; min-width: 0; min-height: 0;">${k(e,t.children[1],r,s,a,o,n)}</div>
        </div>
    `},Yo=(e,t,r,s,a,o,n)=>{const d=t.children&&t.children.length>1?t.children[1]:null,c=a?.detailComponent??null,p=!!a?.hasDetail||!!d,f=c??d;return i`
        <div style="display: flex; gap: var(--lumo-space-m, 1rem); ${t.style??""}" class="${t.cssClasses}" slot="${t.slot??l}">
            <div style="flex: 1; min-width: 0;">${k(e,t.children[0],r,s,a,o,n)}</div>
            ${p&&f?i`<div style="flex: 1; min-width: 0;">${k(e,f,r,s,a,o,n)}</div>`:i`<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem);">Select an item to view details</div>`}
        </div>
    `},Jo=(e,t,r,s,a,o,n)=>{let d=t.style??"";t.metadata.fullWidth&&(d+=" width: 100%;");const c=Math.max(0,(t.children??[]).findIndex(p=>p.metadata.active));return i`
        <div style="${d}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map((p,f)=>{const m=p,v=m.metadata.label,y=v?.includes("${")?e._evalTemplate(v):v;return i`
                    <details ?open="${f===c}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));">
                        <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600;">${y}</summary>
                        <div style="padding: var(--lumo-space-m, 1rem) 0;">
                            ${m.children?.map(C=>k(e,C,r,s,a,o,n))}
                        </div>
                    </details>
                `})}
        </div>
    `},Xo=(e,t,r,s,a,o,n)=>{const d=t.metadata;let c=t.style??"";return d.fullWidth&&(c+=" width: 100%;"),i`
        <div style="${c}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(p=>Qo(e,p,r,s,a,o,n,d.variant))}
        </div>
    `},Qo=(e,t,r,s,a,o,n,d)=>{const c=t.metadata,p=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return i`
        <details ?open="${c.active}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); ${t.style??""}" class="${t.cssClasses}">
            <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600; ${c.disabled?"pointer-events: none; opacity: .5;":""}">${p}</summary>
            <div style="padding: var(--lumo-space-s, .5rem) 0;">
                ${t.children?.map(f=>k(e,f,r,s,a,o,n))}
            </div>
        </details>
    `},Zo=(e,t,r,s,a,o,n)=>i`
        <div style="overflow: auto; ${t.style??""}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(d=>k(e,d,r,s,a,o,n))}
        </div>
    `,ei=(e,t,r,s,a,o,n)=>i`
        <div style="width: 100%; ${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(d=>k(e,d,r,s,a,o,n))}
        </div>
    `,ti=(e,t,r,s,a,o,n)=>i`
        <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(d=>k(e,d,r,s,a,o,n))}
        </div>
    `,ri=(e,t,r,s,a,o,n)=>i`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: ${Wt}; ${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(d=>k(e,d,r,s,a,o,n))}
        </div>
    `,si=(e,t,r,s,a,o,n)=>i`
        <div style="display: flex; gap: ${Wt}; flex-wrap: wrap; ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(d=>k(e,d,r,s,a,o,n))}
        </div>
    `,ai=(e,t,r,s,a,o,n)=>{const d=t.metadata;return i`
        <div style="flex: ${d.boardCols??1} 1 0; min-width: min(100%, 12rem); ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(c=>k(e,c,r,s,a,o,n))}
        </div>
    `},oi=(e,t,r,s,a,o,n)=>{const d=t.metadata;return i`
        <div
                style="display: flex; flex-direction: column; overflow: auto; ${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??l}"
        >
            ${d.page.content.map(c=>k(e,c,r,s,a,o,n))}
        </div>
    `},ii=e=>{const t=e.metadata;return(t?.content??t?.columns??[]).filter(s=>s&&s.metadata).map(s=>{const a=s.metadata;return{id:s.id??"",label:a?.label??s.id??"",autoWidth:a?.autoWidth,width:a?.width}})},Os=(e,t)=>{const r=e?.[t];return r==null?"":typeof r=="object"?r.text??r.label??r.value??"":String(r)},ss=(e,t,r)=>{const s=ii(e),a="text-align:left; padding:.45rem .6rem; border-bottom:2px solid var(--lumo-contrast-20pct,rgba(0,0,0,.2)); font-weight:600; white-space:nowrap; color: var(--lumo-secondary-text-color,#556);",o="padding:.4rem .6rem; border-bottom:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.08)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:24rem;";return i`
        <div style="overflow:auto; width:100%; ${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
            <table style="border-collapse:collapse; width:100%; font-size: var(--lumo-font-size-s,.875rem);">
                <thead><tr>${s.map(n=>i`<th style="${a}">${n.label}</th>`)}</tr></thead>
                <tbody>
                    ${(t??[]).length===0?i`<tr><td colspan="${Math.max(1,s.length)}" style="padding:1.5rem; text-align:center; color: var(--lumo-secondary-text-color,#888);">${r??"No data."}</td></tr>`:t.map(n=>i`<tr>${s.map(d=>i`<td style="${o}" title="${Os(n,d.id)}">${Os(n,d.id)}</td>`)}</tr>`)}
                </tbody>
            </table>
        </div>
    `},zs=(e,t)=>{const r=e.metadata;return e.id&&t&&t[e.id]?t[e.id]:r?.page?.content??[]},ni=e=>{const r=(e.metadata.items??[]).map(s=>({text:s.text,time:s.time,userName:s.userName,userImg:s.userImg,userAbbr:s.userAbbr,userColorIndex:s.userColorIndex}));return i`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??l}"
                .items="${r}"
        ></vaadin-message-list>
    `},ia=(e,t,r,s,a,o,n)=>t.separator?i`<span style="align-self: stretch; width: 1px; background: var(--lumo-contrast-20pct, rgba(0,0,0,.2));"></span>`:t.submenus?i`
            <details style="position: relative;">
                <summary style="cursor: pointer; list-style: none; padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);">
                    ${t.component?k(e,t.component,r,s,a,o,n):t.label} ▾
                </summary>
                <div style="display: flex; flex-direction: column; gap: .1rem; padding: .3rem; min-width: 10rem;
                            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px);
                            background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15));">
                    ${t.submenus.map(d=>ia(e,d,r,s,a,o,n))}
                </div>
            </details>
        `:i`
        <span class="${t.className??""}"
              style="cursor: ${t.disabled?"default":"pointer"}; opacity: ${t.disabled?.5:1};
                     padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
                     ${t.selected?"background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));":""}">
            ${t.component?k(e,t.component,r,s,a,o,n):t.label}
        </span>
    `,li=(e,t,r,s,a,o,n)=>{const d=t.metadata;return i`
        <div style="display: flex; flex-wrap: wrap; gap: .25rem; align-items: center; ${t.style}"
             class="${t.cssClasses}" slot="${t.slot??l}">
            ${d.options?.map(c=>ia(e,c,r,s,a,{},{}))}
        </div>
    `},di=(e,t,r,s,a,o,n)=>{const d=t.metadata;return i`
        <div style="${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${k(e,d.wrapped,r,s,a,o,n)}
        </div>
    `},ci=(e,t,r,s,a,o,n)=>{const d=t.metadata,c=d.content?.metadata,p=c?.type==h.Notice&&c.fullWidth===!0;return i`
        <vaadin-custom-field label="${d.label}"
                             style="${p?"width: 100%; ":""}${t.style}"
                             class="${t.cssClasses}"
                             slot="${t.slot??l}"
                             data-colspan="${d.colspan||(p?99:l)}"
        >
            ${k(e,d.content,r,s,a,o,n)}
        </vaadin-custom-field>
            `},ui=e=>{const t=e.metadata,r=s=>{const a=s.detail?.value??"";!t.actionId||!a.trim()||s.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:a}},bubbles:!0,composed:!0}))};return i`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??l}"
                @submit="${r}"
        ></vaadin-message-input>
    `},pi=(e,t,r,s,a,o,n)=>{const d=t.metadata;return i`
        <div id="show-notifications">${k(e,d.wrapped,r,s,a,o,n)}</div>
        <vaadin-tooltip
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??l}"
                for="show-notifications" text="${d.text}" position="top-start"></vaadin-tooltip>
    `},hi=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const r in e){const s=e[r];["number","string","boolean"].indexOf(typeof s)>=0&&(t[r]=e[r])}return t},Ts=(e,t,r)=>{for(let s in t.attributes)e.setAttribute(s,t.attributes[s]);r.style&&e.setAttribute("style",r.style),r.cssClasses&&e.setAttribute("class",r.cssClasses),r.slot&&e.setAttribute("slot",r.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},mi=e=>{const t=e.name,r=e.attributes?e.attributes.import:void 0;r&&t.includes("-")&&!customElements.get(t)&&import(r)},fi=(e,t,r)=>{mi(t);let s=t.name;return t.attributes&&t.attributes.id&&(s="#"+t.attributes.id),setTimeout(()=>{const a=e.shadowRoot?.querySelector(".element-container")?.querySelector(s);if(a){for(;a.firstChild;)a.removeChild(a.lastChild);Ts(a,t,r)}else{const o=document.createElement(t.name);Ts(o,t,r);for(let n in t.on)o.addEventListener(n,d=>{const c=hi(d);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[n],parameters:{event:c}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(".element-container")?.appendChild(o)}}),i`<div class="element-container"></div>`};var Ae=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(Ae||{});const vi=(e,t,r,s,a)=>{const o=e.metadata,n=o.attributes?.["data-colspan"],d=or(o.text,t,r,s,a),c={xl:"var(--lumo-font-size-xl, 1.375rem)",l:"var(--lumo-font-size-l, 1.125rem)",s:"var(--lumo-font-size-s, .875rem)",xs:"var(--lumo-font-size-xs, .8125rem)"},p=(o.size&&c[o.size]?`font-size: ${c[o.size]}; `:"")+(o.noMargins?"margin-block-start: 0; margin-block-end: 0; ":"");return Ae.h1==o.container?i`
            <h1 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h1>
        `:Ae.h2==o.container?i`
            <h2 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h2>
        `:Ae.h3==o.container?i`
            <h3 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h3>
        `:Ae.h4==o.container?i`
            <h4 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h4>
        `:Ae.h5==o.container?i`
            <h5 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h5>
        `:Ae.h6==o.container?i`
            <h6 style="${p}${e.style}" class="${e.cssClasses}"
                id="${D(e.id)}"
                data-colspan="${D(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h6>
        `:Ae.p==o.container?i`
               <p style="${p}${e.style}" class="${e.cssClasses}"
                  id="${D(e.id)}"
                  data-colspan="${D(n)}"
                  slot="${e.slot??l}">
                   ${d??l}
               </p>
            `:Ae.div==o.container?i`
               <div style="${p}${e.style}" class="${e.cssClasses}"
                    id="${D(e.id)}"
                    data-colspan="${D(n)}"
                    slot="${e.slot??l}">${d?Me(d):l}</div>
            `:Ae.span==o.container?i`
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
            `},bi=e=>{const t=e.metadata;return i`<a href="${t.url}" target="${t.target??l}"
                   rel="${t.target==="_blank"?"noopener":l}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??l}">${t.text}</a>`},gi=(e,t)=>{const r=e.toLowerCase().split("+");return t.ctrlKey===r.includes("ctrl")&&t.altKey===r.includes("alt")&&t.shiftKey===r.includes("shift")&&t.metaKey===r.includes("meta")},yi=(e,t)=>{if(!gi(e,t))return!1;const r=e.toLowerCase().split("+"),s=r[r.length-1];return!!(t.key.toLowerCase()===s||/^[a-z]$/.test(s)&&t.code==="Key"+s.toUpperCase()||/^[0-9]$/.test(s)&&(t.code==="Digit"+s||t.code==="Numpad"+s))},$i=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,xi=(e,t)=>{const r=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r,parameters:t.parameters},bubbles:!0,composed:!0}))},wi=(e,t,r)=>{const s=e.metadata,a=Rt(s.label,t,r);let o="";return s.buttonStyle&&(o+=" "+s.buttonStyle),s.color&&s.color!=="none"&&s.color!=="normal"&&(o+=" "+s.color),s.size&&s.size!=="none"&&s.size!=="normal"&&(o+=" "+s.size),i`<vaadin-button
id="${e.id}"
            data-action-id="${s.actionId}"
            @click="${n=>xi(n,s)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${o}"
            ?disabled="${s.disabled}"
            title="${s.shortcut?`${a} (${$i(s.shortcut)})`:l}"
            slot="${e.slot??l}"
    >${s.iconOnLeft?i`<vaadin-icon icon="${s.iconOnLeft}"></vaadin-icon>`:l}${a}${s.iconOnRight?i`<vaadin-icon icon="${s.iconOnRight}"></vaadin-icon>`:l}</vaadin-button>`},ki=(e,t,r,s,a,o,n)=>{const d=t.metadata;if(!d)return i``;let c="";return d.variants?.map(p=>p=="stretchMedia"?"stretch-media":p=="coverMedia"?"cover-media":p).forEach(p=>c+=" "+p),c=c.trim(),i`
        <vaadin-card
                style="${t.style}" 
                class="${t.cssClasses}" 
                theme="${c}"
                slot="${t.slot??l}"
        >
            ${d.media?yt(e,d.media,r,s,a,o,n,"media",!1):l}
            ${d.title?yt(e,d.title,r,s,a,o,n,"title",!1):l}
            ${d.subtitle?yt(e,d.subtitle,r,s,a,o,n,"subtitle",!1):l}
            ${d.header?yt(e,d.header,r,s,a,o,n,"header",!1):l}
            ${d.headerPrefix?yt(e,d.headerPrefix,r,s,a,o,n,"header-prefix",!1):l}
            ${d.headerSuffix?yt(e,d.headerSuffix,r,s,a,o,n,"header-suffix",!1):l}
            ${d.footer?yt(e,d.footer,r,s,a,o,n,"footer",!1):l}
            ${d.content?k(e,d.content,r,s,a,o,n,!1):l}
        </vaadin-card>
    `},Si=e=>{const t=e.metadata;return i`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??l}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},Ci=e=>{const t=e.metadata;return i`
        <vaadin-icon icon="${t.icon}" style="${e.style}" class="${e.cssClasses}"
                     slot="${e.slot??l}"></vaadin-icon>
    `},_i=(e,t,r,s,a,o,n)=>{const d=t.metadata;let c=!1;if(d.openedCondition)try{c=Ys(d.openedCondition,s,a,o,n)}catch(p){console.error("when evaluating "+d.openedCondition+" :"+p+", where data is "+a+" and state is "+s)}return i`
        <vaadin-confirm-dialog
  header="${d.header}"
  ?cancel-button-visible="${d.canCancel}"
  ?reject-button-visible="${d.canReject}"
  reject-text="${d.rejectText}"
  confirm-text="${d.confirmText}"
  .opened="${c}"
  style="${t.style}" class="${t.cssClasses}"
  slot="${t.slot??l}"
>
  ${t.children?.map(p=>k(e,p,r,s,a,o,n))}
</vaadin-confirm-dialog>
            `},Ei=e=>{const t=e.metadata;let r;return t.position&&(r={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),i`
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
    `},Ii=(e,t,r,s,a,o,n)=>{const d=t.metadata;return i`
        <vaadin-details 
                ?opened="${d.opened}" 
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??l}"
        >
            <vaadin-details-summary slot="summary">
            ${k(e,d.summary,r,s,a,o,n)}
            </vaadin-details-summary>
            ${k(e,d.content,r,s,a,o,n)}
        </vaadin-details>
            `},Pi=(e,t,r,s,a,o)=>i`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${r}"
            .xdata="${s}"
            .appState="${a}"
            .appdata="${o}"
        ></mateu-dialog>
            `,Oi=(e,t,r,s,a,o)=>i`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${r}"
            .xdata="${s}"
            .appState="${a}"
            .appdata="${o}"
        ></mateu-drawer>
            `,zi=e=>{const t=e.metadata;return i`
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
            `},Ti=e=>{const t=e.metadata;return i`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??l}"></mateu-markdown>
            `},Ri=e=>{const t=e.metadata;return i`
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
    `},Li=(e,t={})=>{const r=e.metadata,s=r.valueKey?t[r.valueKey]:r.value;return i`
        <div style="${e.style}">
        <vaadin-progress-bar
                ?indeterminate="${r.indeterminate}"
                min="${r.min&&r.min!=0?r.min:l}"
                max="${r.max&&r.max!=0?r.max:l}"
                value="${s??l}"
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??l}"
        ></vaadin-progress-bar>
        ${r.text?i`<span class="text-secondary text-xs" id="sublbl">
    ${r.text}
  </span>`:l}
        </div>
    `},Di=(e,t,r,s,a,o,n)=>{const d=t.metadata;return i`
        <details style="position: relative; ${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            <summary style="list-style: none; cursor: pointer;">${k(e,d.wrapped,r,s,a,o,n)}</summary>
            <div style="position: absolute; z-index: 100; min-width: 300px; margin-top: .25rem; padding: .6rem .8rem;
                        border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px);
                        background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.2));">
                ${k(e,d.content,r,s,a,o,n)}
            </div>
        </details>
    `},Ai=e=>{const t=e.metadata;return i`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??l}"></mateu-map>
            `},Mi=e=>{const t=e.metadata;return i`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??l}">
            `},Ui=e=>{const t=e.metadata;return i`<vaadin-horizontal-layout theme="spacing"
                                          slot="${e.slot??l}">
        ${t.breadcrumbs.map(r=>i`
            <a href="${r.link}">${r.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </vaadin-horizontal-layout>`},Ni=(e,t,r,s,a,o,n)=>{const d=t.metadata;return i`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${d.dots}" 
                ?nav = "${d.nav}" 
                ?loop = "${d.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>i`<div>${k(e,c,r,s,a,o,n)}</div>`)}
        </skeleton-carousel>
    `},Fi=(e,t,r,s)=>{const a=e.metadata;return i`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
            ${a.menu.map(o=>na(o))}
        </div>
            `},na=e=>i`
        ${e.submenus?i`
                <vaadin-details summary="${e.label}" opened>
                    <vaadin-vertical-layout theme="spacing">
                        ${e.submenus.map(t=>na(t))}
                    </vaadin-vertical-layout>
                </vaadin-details>
            `:i`
                <a href="${e.path}">${e.label}</a>
        `}
        `,ji=(e,t,r,s,a,o,n)=>{const d=t.metadata;return i`<div
                slot="${t.slot??l}"
                style="${t.style}" class="${t.cssClasses}"
        >${d.content?Me(d.content):l}${t.children?.map(c=>k(e,c,r,s,a,o,n))}</div>
    `},Bi=(e,t,r,s,a,o,n)=>{const d=t.metadata,c=d.title?.includes("${")?e._evalTemplate(d.title):d.title;return i`<div
                slot="${t.slot??l}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?i`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${c}</div>`:l}
        ${t.children?.map(p=>k(e,p,r,s,a,o,n))}
    </div>
    `},qi=(e,t,r,s,a,o,n)=>{const d=t.metadata,c=d.title?.includes("${")?e._evalTemplate(d.title):d.title;return i`
        <div
                slot="${t.slot??l}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(p=>k(e,p,r,s,a,o,n))}</div>
    `},Hi=(e,t,r)=>{r.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:e,value:t},bubbles:!0,composed:!0}))},kr=e=>t=>{const r=t.target,s=r.type==="checkbox"?r.checked:r.value;Hi(e.fieldId,s,r)},Wi=(e,t)=>{const r=e.metadata,s=t?.[r.fieldId]??"",a=r,o=a.dataType,n=a.stereotype,d=!!a.readOnly,c=!!a.disabled,p=a.options,f=r.label?i`<label style="display:block; font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${r.label}</label>`:l,m="width:100%; box-sizing:border-box; padding:.4rem .6rem; border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.3)); border-radius: var(--lumo-border-radius-m,6px); font:inherit; background: var(--lumo-base-color,#fff); color: var(--lumo-body-text-color,#1a1a1a);";let v;return d||n==="plainText"?v=i`<div style="padding:.4rem 0;">${String(s??"")}</div>`:o==="boolean"||n==="checkbox"||n==="badge"?v=i`<input type="checkbox" ?checked="${!!s}" ?disabled="${c}" @change="${kr(r)}">`:p&&p.length?v=i`
            <select style="${m}" ?disabled="${c}" @change="${kr(r)}">
                <option value="">—</option>
                ${p.map(y=>i`<option value="${y.value}" ?selected="${y.value===s}">${y.label}</option>`)}
            </select>`:n==="textarea"||n==="richText"||n==="html"?v=i`<textarea style="${m}" rows="3" ?disabled="${c}" @input="${kr(r)}">${String(s??"")}</textarea>`:v=i`<input type="${o==="integer"||o==="number"||o==="double"||o==="money"?"number":o==="date"?"date":o==="datetime"?"datetime-local":o==="time"?"time":n==="password"?"password":o==="email"?"email":"text"}" style="${m}" .value="${String(s??"")}"
                              placeholder="${a.placeholder??l}" ?disabled="${c}" @input="${kr(r)}">`,i`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
            ${f}
            ${v}
        </div>
    `},as=(e,t,r,s,a,o,n,d)=>{const c=t.metadata,p=c?.fabs??[];return i`<mateu-page
            .component="${t}"
            baseUrl="${r}"
            .state="${s}"
            .data="${a}"
            .appState="${o}"
            .appdata="${n}"
            slot="${t.slot??l}"
            style="${t.style}"
            class="${t.cssClasses}"
            ?standalone="${d??!1}"
    >
        ${t.children?.map(f=>k(e,f,r,s,a,o,n))}
        ${c?.buttons?.map(f=>i`
                   ${k(e,{id:f.actionId,metadata:f,type:K.ClientSide,slot:"buttons"},void 0,s,a,o,n)}
`)}
        ${p.map((f,m)=>i`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+m*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:f.actionId},bubbles:!0,composed:!0}))}"
                title="${f.label}">
                <vaadin-icon icon="${f.icon}"></vaadin-icon>
            </button>
        `)}
</mateu-page>
    `},os=(e,t,r,s,a,o,n,d)=>i`<mateu-table-crud
            id="${t.id}"
            baseUrl="${r}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${s}"
            .data="${a}"
            .appState="${o}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??l}"
            ?standalone="${d??!1}"
    >
        ${t.children?.map(c=>k(e,c,r,s,a,o,n))}
    </mateu-table-crud>`,Vi=e=>{const t=e.metadata;return i`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??l}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},Gi=(e,t,r)=>{const s=e.metadata;return i`<mateu-chat sseUrl="${s.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??l}"></mateu-chat>`},Ki=e=>{const t=e.metadata;return i`
        <mateu-workflow
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},Yi=e=>{const t=e.metadata;return i`
        <mateu-workflow-elk
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
                ?readOnly="${t.readOnly??!1}"
        ></mateu-workflow-elk>
    `},Ji=e=>{const t=e.metadata;return i`
        <mateu-form-editor
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},la=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,Xi=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",Qi=e=>e=="up"?"▲":e=="down"?"▼":"",Zi=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},en=e=>{const t=e.metadata,r=!!t.actionId;return i`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${la} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${r?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??l}"
             role="${r?"button":l}"
             @click="${s=>Zi(s,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?i`<vaadin-icon icon="${t.icon}" style="color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;"></vaadin-icon>`:l}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?i`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:l}
            </div>
            ${t.trend||t.trendLabel?i`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${Xi(t.trend)};">
                    ${Qi(t.trend)} ${t.trendLabel??l}
                </span>
            `:l}
            ${t.description?i`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:l}
        </div>
    `},tn=(e,t,r,s,a,o,n)=>i`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${t.children?.map(d=>k(e,d,r,s,a,o,n))}
        </div>
    `,rn=(e,t,r,s,a,o,n)=>{const d=t.metadata,c=d.colSpan&&d.colSpan>1?`grid-column: span ${d.colSpan};`:"",p=d.rowSpan&&d.rowSpan>1?`grid-row: span ${d.rowSpan};`:"";return i`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${la} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${p} ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${d.title?i`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${d.title}</h3>
                    ${d.subtitle?i`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${d.subtitle}</span>`:l}
                </div>
            `:l}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(f=>k(e,f,r,s,a,o,n))}
            </div>
        </div>
    `},sn=(e,t,r,s,a,o,n)=>{const d=t.metadata,c=d.columns&&d.columns>0?`repeat(${d.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return i`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${t.children?.map(p=>k(e,p,r,s,a,o,n))}
        </div>
    `};var an=Object.defineProperty,on=Object.getOwnPropertyDescriptor,Je=(e,t,r,s)=>{for(var a=s>1?void 0:s?on(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&an(t,r,a),a};let Se=class extends S{constructor(){super(...arguments),this.panels=[],this.headerTitle="",this.badges=[],this.orientation="vertical",this.navigation=null,this.overviewEditActionId="",this.openPanels=new Set,this.expandedPanel=null,this._onPopState=()=>{const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),r=this.panels.findIndex((s,a)=>this.panelAnchor(s,a)===t);this.expandedPanel=r>=0?r:null}else this.expandedPanel=null},this.initialized=!1}navAction(e){e&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),window.addEventListener("popstate",this._onPopState)}disconnectedCallback(){window.removeEventListener("popstate",this._onPopState),super.disconnectedCallback()}willUpdate(){if(!this.initialized&&this.panels.length){this.openPanels=new Set(this.panels.map((t,r)=>t.open?r:-1).filter(t=>t>=0));const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),r=this.panels.findIndex((s,a)=>this.panelAnchor(s,a)===t);r>=0&&(this.expandedPanel=r)}else if(e){const t=this.panels.findIndex((r,s)=>this.panelAnchor(r,s)===e);t>=0&&this.openPanels.add(t)}this.initialized=!0}}firstUpdated(){const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(!e)return;const t=this.renderRoot.querySelector(`[data-anchor="${CSS.escape(e)}"]`);t&&t.scrollIntoView({block:"nearest"})}panelAnchor(e,t){return(e.title??"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`panel-${t}`}bookmarkPanel(e){const t=this.panelAnchor(this.panels[e],e);try{history.replaceState(history.state,"","#"+t)}catch{}}clearBookmark(e){const t=this.panelAnchor(this.panels[e],e);if(decodeURIComponent((location.hash||"").replace(/^#/,""))===t)try{history.replaceState(history.state,"",location.pathname+location.search)}catch{}}expandPanel(e,t){t?.stopPropagation(),this.expandedPanel=e;const r=this.panelAnchor(this.panels[e],e);try{history.pushState(history.state,"","#expand="+r)}catch{}}collapsePanel(){try{history.back()}catch{this.expandedPanel=null}}toggle(e){const t=new Set(this.openPanels);t.has(e)?(t.delete(e),this.clearBookmark(e)):(t.add(e),this.bookmarkPanel(e)),this.openPanels=t}render(){if(this.expandedPanel!=null&&this.panels[this.expandedPanel]){const t=this.panels[this.expandedPanel];return i`
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
                                            @click="${s=>this.expandPanel(r,s)}">⤢</button>
                                    <button class="fold" title="Fold" @click="${s=>{s.stopPropagation(),this.toggle(r)}}">⟨</button>
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
        `}};Se.styles=$`
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
    `;Je([u({type:Array})],Se.prototype,"panels",2);Je([u({type:String})],Se.prototype,"headerTitle",2);Je([u({type:Array})],Se.prototype,"badges",2);Je([u({type:String,reflect:!0})],Se.prototype,"orientation",2);Je([u({attribute:!1})],Se.prototype,"navigation",2);Je([u({type:String})],Se.prototype,"overviewEditActionId",2);Je([b()],Se.prototype,"openPanels",2);Je([b()],Se.prototype,"expandedPanel",2);Se=Je([w("mateu-foldout")],Se);const nn=(e,t,r,s,a,o,n)=>{const d=t.metadata;return i`
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
            ${t.children?.map(c=>k(e,c,r,s,a,o,n))}
        </mateu-foldout>
    `},ln=(e,t,r,s,a,o,n)=>{const d=t.metadata,c=!!d.image,p=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${d.image}'); background-size: cover; background-position: center; color: #fff;`:"",f=d.centered===!1?"flex-start":"center",m=d.centered===!1?"left":"center";return i`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${f}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${m}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${d.height??"12rem"}; box-sizing: border-box; ${p} ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${d.title?i`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${d.title}</h1>`:l}
            ${d.subtitle?i`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${d.subtitle}</p>`:l}
            ${t.children?.length?i`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${f}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(v=>k(e,v,r,s,a,o,n))}
                </div>
            `:l}
        </div>
    `};var dn=Object.defineProperty,cn=Object.getOwnPropertyDescriptor,fs=(e,t,r,s)=>{for(var a=s>1?void 0:s?cn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&dn(t,r,a),a};const es=1440*60*1e3;let nr=class extends S{constructor(){super(...arguments),this.tasks=[],this.onTaskSelectionActionId=""}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-es,max:Math.max(...e)+2*es}:null}months(e,t){const r=[],s=new Date(e);for(s.setDate(1);s.getTime()<=t;){const a=Math.max(s.getTime(),e),o=new Date(s.getFullYear(),s.getMonth()+1,1),n=Math.min(o.getTime(),t);r.push({label:s.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:a,to:n}),s.setMonth(s.getMonth()+1)}return r}render(){const e=this.range();if(!e)return i``;const t=e.max-e.min,r=a=>(a-e.min)/t*100,s=Date.now();return i`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(a=>i`
                        <div class="month" style="width: ${(a.to-a.from)/t*100}%;">${a.label}</div>
                    `)}
                </div>
                ${this.tasks.map(a=>{const o=new Date(a.start+"T00:00:00").getTime(),n=new Date(a.end+"T00:00:00").getTime()+es;return i`
                        <div class="label" title="${a.title}">${a.title}</div>
                        <div class="lane">
                            ${s>=e.min&&s<=e.max?i`<div class="today" style="left: ${r(s)}%;"></div>`:l}
                            <div class="bar ${this.onTaskSelectionActionId?"clickable":""}"
                                 title="${a.title} · ${a.start} → ${a.end}${a.progress?` · ${a.progress}%`:""}"
                                 @click="${()=>this.selectTask(a)}"
                                 style="left: ${r(o)}%; width: ${(n-o)/t*100}%; ${a.color?`--mateu-gantt-fill: ${a.color};`:""}">
                                <div class="fill" style="width: ${a.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};nr.styles=$`
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
    `;fs([u({type:Array})],nr.prototype,"tasks",2);fs([u()],nr.prototype,"onTaskSelectionActionId",2);nr=fs([w("mateu-gantt")],nr);const un=e=>{const t=e.metadata;return i`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                .onTaskSelectionActionId="${t.onTaskSelectionActionId??""}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-gantt>
    `};var pn=Object.defineProperty,hn=Object.getOwnPropertyDescriptor,pt=(e,t,r,s)=>{for(var a=s>1?void 0:s?hn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&pn(t,r,a),a};let R=class extends S{constructor(){super(...arguments),this.resources=[],this.blocks=[],this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key==="Escape"&&this.drag&&(e.stopPropagation(),this.endDrag())}}static parse(e){return new Date(e+"T00:00:00")}static iso(e){const t=r=>String(r).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){const s=R.parse(this.from),a=R.daysBetween(s,R.parse(this.to))+1;return a>0?{from:s,days:a}:null}const e=this.blocks.flatMap(s=>[s.start,s.end]).filter(s=>!!s).map(s=>R.parse(s));if(!e.length)return null;const t=new Date(Math.min(...e.map(s=>s.getTime()))),r=new Date(Math.max(...e.map(s=>s.getTime())));return{from:t,days:R.daysBetween(t,r)+1}}onBlockPointerDown(e,t,r){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;const o=R.parse(t.start),n=R.parse(t.end),d=Math.max(1,R.daysBetween(o,n)+1);this.laneRects=[...this.renderRoot.querySelectorAll(".lane[data-resource-id]")].map(p=>({resourceId:p.dataset.resourceId,rect:p.getBoundingClientRect()}));const c=this.dayAt(t.resourceId,e.clientX)??r;this.drag={blockId:t.id,duration:d,grabOffsetDays:c-r,originResourceId:t.resourceId,originStartIdx:r,targetResourceId:t.resourceId,targetStartIdx:r,moved:!1},window.addEventListener("keydown",this.onDragKeydown)}dayAt(e,t){const r=this.laneRects.find(o=>o.resourceId===e),s=this.window();if(!r||!s||r.rect.width===0)return null;const a=Math.floor((t-r.rect.left)/r.rect.width*s.days);return Math.max(0,Math.min(s.days-1,a))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;const t=this.window();if(!t)return;const r=this.laneRects.find(o=>e.clientY>=o.rect.top&&e.clientY<=o.rect.bottom)??this.laneRects.find(o=>o.resourceId===this.drag.targetResourceId);if(!r)return;const s=this.dayAt(r.resourceId,e.clientX);if(s==null)return;const a=Math.max(0,Math.min(t.days-this.drag.duration,s-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:r.resourceId,targetStartIdx:a}}onBlockPointerUp(e){const t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;const r=this.window();if(!r)return;const s=R.addDays(r.from,t.targetStartIdx),a=R.addDays(s,t.duration-1);this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:R.iso(s),_end:R.iso(a)}},bubbles:!0,composed:!0}))}endDrag(){this.drag=null,window.removeEventListener("keydown",this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.onDragKeydown)}render(){const e=this.window();if(!e||!this.resources.length)return i``;const t=[...Array(e.days).keys()].map(d=>R.addDays(e.from,d)),r=new Date,s=R.daysBetween(e.from,new Date(r.getFullYear(),r.getMonth(),r.getDate())),a=s>=0&&s<e.days,o=[];let n;return this.resources.forEach(d=>{d.group&&d.group!==n&&o.push(i`<div class="group">${d.group}</div>`),n=d.group,o.push(this.renderRow(d,e,t,a?s:null))}),i`
            <div class="frame" style="grid-template-columns: minmax(8rem, 12rem) repeat(${e.days}, minmax(2.2rem, 1fr));">
                <div class="corner">Resource</div>
                ${t.map((d,c)=>i`
                    <div class="day-head ${this.isWeekend(d)?"weekend":""} ${c===s?"today":""}">
                        <span class="dow">${d.toLocaleDateString(void 0,{weekday:"short"})}</span>
                        <span class="num">${d.getDate()}</span>
                    </div>
                `)}
                ${o}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(e,t,r,s){const a=100/t.days,o=this.blocks.filter(d=>d.resourceId===e.id&&d.start&&d.end),n=this.drag?.moved&&this.drag.targetResourceId===e.id?this.drag:null;return i`
            <div class="label" title="${e.label??""}">${e.label}</div>
            <div class="lane" data-resource-id="${e.id}">
                <div class="cells">
                    ${r.map(d=>i`<div class="cell ${this.isWeekend(d)?"weekend":""}"></div>`)}
                </div>
                ${s!=null?i`<div class="today-line" style="left: ${(s+.5)*a}%;"></div>`:l}
                ${o.map(d=>{const c=R.daysBetween(t.from,R.parse(d.start)),p=R.daysBetween(t.from,R.parse(d.end));if(p<0||c>=t.days)return l;const f=Math.max(0,c),m=Math.min(t.days-1,p),v=this.drag?.moved&&this.drag.blockId===d.id;return i`
                        <div class="block ${this.selectActionId?"clickable":""} ${this.moveActionId?"draggable":""} ${v?"dragging":""}"
                             title="${d.label??""} · ${d.start} → ${d.end}${d.status?` · ${d.status}`:""}"
                             style="left: ${f*a}%; width: ${(m-f+1)*a}%; ${d.color?`--mateu-planning-block: ${d.color};`:""}"
                             @pointerdown="${y=>this.onBlockPointerDown(y,d,c)}"
                             @pointermove="${y=>this.onBlockPointerMove(y)}"
                             @pointerup="${()=>this.onBlockPointerUp(d)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${d.label}</div>
                    `})}
                ${n?i`
                    <div class="ghost"
                         style="left: ${n.targetStartIdx*a}%; width: ${Math.min(n.duration,t.days-n.targetStartIdx)*a}%;"></div>
                `:l}
            </div>
        `}};R.styles=$`
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
    `;pt([u({type:Array})],R.prototype,"resources",2);pt([u({type:Array})],R.prototype,"blocks",2);pt([u()],R.prototype,"from",2);pt([u()],R.prototype,"to",2);pt([u()],R.prototype,"moveActionId",2);pt([u()],R.prototype,"selectActionId",2);pt([b()],R.prototype,"drag",2);R=pt([w("mateu-planning-board")],R);const mn=e=>{const t=e.metadata;return i`
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
    `};var fn=Object.defineProperty,vn=Object.getOwnPropertyDescriptor,da=(e,t,r,s)=>{for(var a=s>1?void 0:s?vn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&fn(t,r,a),a};let Er=class extends S{constructor(){super(...arguments),this.columns=[]}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return i`
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
        `}};Er.styles=$`
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
    `;da([u({type:Array})],Er.prototype,"columns",2);Er=da([w("mateu-kanban")],Er);const bn=e=>{const t=e.metadata;return i`
        <mateu-kanban
                .columns="${t.columns??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-kanban>
    `};var gn=Object.defineProperty,yn=Object.getOwnPropertyDescriptor,ca=(e,t,r,s)=>{for(var a=s>1?void 0:s?yn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&gn(t,r,a),a};let Ir=class extends S{constructor(){super(...arguments),this.items=[]}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return i`
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
        `}};Ir.styles=$`
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
    `;ca([u({type:Array})],Ir.prototype,"items",2);Ir=ca([w("mateu-timeline")],Ir);const $n=e=>{const t=e.metadata;return i`
        <mateu-timeline
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-timeline>
    `};var xn=Object.defineProperty,wn=Object.getOwnPropertyDescriptor,vs=(e,t,r,s)=>{for(var a=s>1?void 0:s?wn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&xn(t,r,a),a};let lr=class extends S{constructor(){super(...arguments),this.steps=[],this.vertical=!1}render(){return i`
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
        `}};lr.styles=$`
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
    `;vs([u({type:Array})],lr.prototype,"steps",2);vs([u({type:Boolean,reflect:!0})],lr.prototype,"vertical",2);lr=vs([w("mateu-progress-steps")],lr);const kn=e=>{const t=e.metadata;return i`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                ?vertical="${t.vertical??!1}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-progress-steps>
    `};var Sn=Object.defineProperty,Cn=Object.getOwnPropertyDescriptor,ht=(e,t,r,s)=>{for(var a=s>1?void 0:s?Cn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Sn(t,r,a),a};let Ue=class extends S{constructor(){super(...arguments),this.spark=[]}sparkline(){const e=this.spark;if(!e||e.length<2)return l;const t=84,r=30,s=2,a=Math.min(...e),n=Math.max(...e)-a||1,d=(t-s*2)/(e.length-1),c=e.map((v,y)=>{const C=s+y*d,g=s+(r-s*2)*(1-(v-a)/n);return[C,g]}),p=c.map(([v,y],C)=>`${C===0?"M":"L"}${v.toFixed(1)} ${y.toFixed(1)}`).join(" "),f=`${p} L${c[c.length-1][0].toFixed(1)} ${r} L${c[0][0].toFixed(1)} ${r} Z`,m=this.trend==="down"?"var(--lumo-error-color, #e11d48)":this.trend==="flat"?"var(--lumo-secondary-text-color, #888)":"var(--lumo-success-color, #12b76a)";return H`
            <svg width="${t}" height="${r}" viewBox="0 0 ${t} ${r}">
                <path d="${f}" fill="${m}" opacity="0.12"></path>
                <path d="${p}" fill="none" stroke="${m}" stroke-width="1.6"
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
        `}};Ue.styles=$`
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
    `;ht([u()],Ue.prototype,"label",2);ht([u()],Ue.prototype,"value",2);ht([u()],Ue.prototype,"unit",2);ht([u()],Ue.prototype,"delta",2);ht([u()],Ue.prototype,"trend",2);ht([u({type:Array})],Ue.prototype,"spark",2);ht([u()],Ue.prototype,"actionId",2);Ue=ht([w("mateu-stat")],Ue);const _n=e=>{const t=e.metadata;return i`
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
    `};var En=Object.defineProperty,In=Object.getOwnPropertyDescriptor,bs=(e,t,r,s)=>{for(var a=s>1?void 0:s?In(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&En(t,r,a),a};let dr=class extends S{constructor(){super(...arguments),this.events=[]}clickEvent(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}render(){const e=this.month?new Date(this.month+"T00:00:00"):new Date,t=e.getFullYear(),r=e.getMonth(),s=new Date(t,r,1),a=(s.getDay()+6)%7,o=new Date(t,r+1,0).getDate(),n=new Date,d=v=>n.getFullYear()===t&&n.getMonth()===r&&n.getDate()===v,c={};for(const v of this.events){if(!v.date)continue;const y=new Date(v.date+"T00:00:00");y.getFullYear()===t&&y.getMonth()===r&&(c[y.getDate()]??=[]).push(v)}const p=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],f=[];for(let v=0;v<a;v++)f.push(i`<div class="cell blank"></div>`);for(let v=1;v<=o;v++)f.push(i`
                <div class="cell ${d(v)?"today":""}">
                    <span class="num">${v}</span>
                    ${(c[v]??[]).map(y=>i`
                        <span class="chip ${y.actionId?"clickable":""}"
                              style="${y.color?`--mateu-cal-accent: ${y.color};`:""}"
                              title="${y.title??""}"
                              @click="${()=>this.clickEvent(y)}">${y.title}</span>
                    `)}
                </div>
            `);const m=s.toLocaleDateString(void 0,{month:"long",year:"numeric"});return i`
            <div class="title">${m}</div>
            <div class="grid">
                ${p.map(v=>i`<div class="dow">${v}</div>`)}
                ${f}
            </div>
        `}};dr.styles=$`
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
    `;bs([u()],dr.prototype,"month",2);bs([u({type:Array})],dr.prototype,"events",2);dr=bs([w("mateu-calendar")],dr);const Pn=e=>{const t=e.metadata;return i`
        <mateu-calendar
                month="${t.month??l}"
                .events="${t.events??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-calendar>
    `};var On=Object.defineProperty,zn=Object.getOwnPropertyDescriptor,ua=(e,t,r,s)=>{for(var a=s>1?void 0:s?zn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&On(t,r,a),a};let Pr=class extends S{constructor(){super(...arguments),this.plans=[]}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return i`
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
        `}};Pr.styles=$`
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
    `;ua([u({type:Array})],Pr.prototype,"plans",2);Pr=ua([w("mateu-pricing-table")],Pr);const Tn=e=>{const t=e.metadata;return i`
        <mateu-pricing-table
                .plans="${t.plans??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-pricing-table>
    `};var Rn=Object.defineProperty,Ln=Object.getOwnPropertyDescriptor,pa=(e,t,r,s)=>{for(var a=s>1?void 0:s?Ln(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Rn(t,r,a),a};let Or=class extends S{clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){const t=e.avatar,r=t&&(t.startsWith("http")||t.startsWith("data:"));return i`
            <li>
                <div class="node ${e.actionId?"clickable":""}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:""}"
                     @click="${()=>this.clickNode(e)}">
                    ${t?i`<span class="avatar">${r?i`<img src="${t}" alt="">`:t}</span>`:l}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?i`<span class="subtitle">${e.subtitle}</span>`:l}
                </div>
                ${e.children&&e.children.length?i`<ul>${e.children.map(s=>this.renderNode(s))}</ul>`:l}
            </li>
        `}render(){return this.root?i`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:i``}};Or.styles=$`
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
    `;pa([u({attribute:!1})],Or.prototype,"root",2);Or=pa([w("mateu-org-chart")],Or);const Dn=e=>{const t=e.metadata;return i`
        <mateu-org-chart
                .root="${t.root}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-org-chart>
    `};var An=Object.defineProperty,Mn=Object.getOwnPropertyDescriptor,ha=(e,t,r,s)=>{for(var a=s>1?void 0:s?Mn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&An(t,r,a),a};const Un=1440*60*1e3;let zr=class extends S{constructor(){super(...arguments),this.cells=[]}color(e,t){if(e<=0||t<=0)return"var(--lumo-contrast-10pct, #ebedf0)";const r=e/t,s=r>.75?1:r>.5?.75:r>.25?.5:.3;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round(s*100)}%, transparent)`}render(){const e=this.cells.filter(c=>!!c.date);if(!e.length)return i``;const t=e.map(c=>new Date(c.date+"T00:00:00").getTime()),r=Math.min(...t),s=Math.max(...t),a=new Date(r);a.setDate(a.getDate()-(a.getDay()+6)%7);const o={};for(const c of e)o[c.date]=c;const n=Math.max(...e.map(c=>c.value??0),1),d=[];for(let c=a.getTime();c<=s;c+=Un){const p=new Date(c),f=p.toISOString().slice(0,10),m=o[f],v=m?.value??0,y=(p.getDay()+6)%7+1,C=m?.label??`${f}: ${v}`;d.push(i`
                <div class="cell" style="grid-row: ${y}; --cell: ${this.color(v,n)};" title="${C}"></div>
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
        `}};zr.styles=$`
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
    `;ha([u({type:Array})],zr.prototype,"cells",2);zr=ha([w("mateu-heatmap")],zr);const Nn=e=>{const t=e.metadata;return i`
        <mateu-heatmap
                .cells="${t.cells??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-heatmap>
    `};var Fn=Object.defineProperty,jn=Object.getOwnPropertyDescriptor,ma=(e,t,r,s)=>{for(var a=s>1?void 0:s?jn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Fn(t,r,a),a};let Tr=class extends S{constructor(){super(...arguments),this.stages=[]}render(){const e=this.stages;if(!e.length)return i``;const t=e[0].value??0,r=Math.max(...e.map(s=>s.value??0),1);return i`
            <div class="funnel">
                ${e.map((s,a)=>{const o=s.value??0,n=r>0?Math.max(6,o/r*100):6,d=a>0?e[a-1].value??0:t,c=a===0?t>0?"100%":"":d>0?`${Math.round(o/d*100)}%`:"0%";return i`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${s.label}</span>
                                ${a>0?i`<span class="conv">${c} of previous</span>`:l}
                            </div>
                            <div class="bar" style="width: ${n}%; ${s.color?`--bar: ${s.color};`:""}">
                                ${o.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};Tr.styles=$`
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
    `;ma([u({type:Array})],Tr.prototype,"stages",2);Tr=ma([w("mateu-funnel")],Tr);const Bn=e=>{const t=e.metadata;return i`
        <mateu-funnel
                .stages="${t.stages??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-funnel>
    `};var qn=Object.defineProperty,Hn=Object.getOwnPropertyDescriptor,Vt=(e,t,r,s)=>{for(var a=s>1?void 0:s?Hn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&qn(t,r,a),a};let nt=class extends S{constructor(){super(...arguments),this.values=[],this.labels=[],this.area=!1}render(){const e=this.values;if(!e||e.length<2)return i``;const t=600,r=160,s=8,a=Math.min(...e),o=Math.max(...e),n=o-a||1,d=(t-s*2)/(e.length-1),c=e.map((C,g)=>{const I=s+g*d,A=s+(r-s*2)*(1-(C-a)/n);return[I,A]}),p=c.map(([C,g],I)=>`${I===0?"M":"L"}${C.toFixed(1)} ${g.toFixed(1)}`).join(" "),f=`${p} L${c[c.length-1][0].toFixed(1)} ${r-s} L${c[0][0].toFixed(1)} ${r-s} Z`,m=this.color||"var(--lumo-primary-color, #1a73e8)",v=e.indexOf(o),y=e.indexOf(a);return i`
            ${this.heading?i`<div class="title">${this.heading}</div>`:l}
            <svg viewBox="0 0 ${t} ${r}" preserveAspectRatio="none">
                ${this.area?H`<path d="${f}" fill="${m}" opacity="0.12"></path>`:l}
                <path d="${p}" fill="none" stroke="${m}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${c.map((C,g)=>g===v||g===y?H`<circle cx="${C[0]}" cy="${C[1]}" r="3.2" fill="${m}"><title>${this.labels[g]??""}: ${e[g]}</title></circle>`:H`<circle cx="${C[0]}" cy="${C[1]}" r="6" fill="transparent"><title>${this.labels[g]??""}: ${e[g]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?i`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:l}
        `}};nt.styles=$`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `;Vt([u()],nt.prototype,"heading",2);Vt([u({type:Array})],nt.prototype,"values",2);Vt([u({type:Array})],nt.prototype,"labels",2);Vt([u()],nt.prototype,"color",2);Vt([u({type:Boolean})],nt.prototype,"area",2);nt=Vt([w("mateu-trend-chart")],nt);const Wn=e=>{const t=e.metadata;return i`
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
    `};var Vn=Object.defineProperty,Gn=Object.getOwnPropertyDescriptor,gs=(e,t,r,s)=>{for(var a=s>1?void 0:s?Gn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Vn(t,r,a),a};let cr=class extends S{constructor(){super(...arguments),this.features=[],this.columns=0}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){const e=this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(15rem, 1fr))";return i`
            <div class="grid" style="grid-template-columns: ${e};">
                ${this.features.map(t=>i`
                    <div class="card ${t.actionId?"clickable":""}" @click="${()=>this.clickFeature(t)}">
                        ${t.icon?i`<span class="icon">${t.icon}</span>`:l}
                        <span class="title">${t.title}</span>
                        ${t.description?i`<span class="desc">${t.description}</span>`:l}
                    </div>
                `)}
            </div>
        `}};cr.styles=$`
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
    `;gs([u({type:Array})],cr.prototype,"features",2);gs([u({type:Number})],cr.prototype,"columns",2);cr=gs([w("mateu-feature-grid")],cr);const Kn=e=>{const t=e.metadata;return i`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-feature-grid>
    `};var Yn=Object.defineProperty,Jn=Object.getOwnPropertyDescriptor,fa=(e,t,r,s)=>{for(var a=s>1?void 0:s?Jn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Yn(t,r,a),a};let Rr=class extends S{constructor(){super(...arguments),this.items=[]}stars(e){const t=Math.max(0,Math.min(5,e||0));return"★".repeat(t)+"☆".repeat(5-t)}render(){return i`
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
        `}};Rr.styles=$`
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
    `;fa([u({type:Array})],Rr.prototype,"items",2);Rr=fa([w("mateu-testimonials")],Rr);const Xn=e=>{const t=e.metadata;return i`
        <mateu-testimonials
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-testimonials>
    `};var Qn=Object.defineProperty,Zn=Object.getOwnPropertyDescriptor,ys=(e,t,r,s)=>{for(var a=s>1?void 0:s?Zn(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Qn(t,r,a),a};let ur=class extends S{constructor(){super(...arguments),this.items=[],this.openSet=new Set,this.seeded=!1}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),i`
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
        `}};ur.styles=$`
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
    `;ys([u({type:Array})],ur.prototype,"items",2);ys([b()],ur.prototype,"openSet",2);ur=ys([w("mateu-faq")],ur);const el=e=>{const t=e.metadata;return i`
        <mateu-faq
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-faq>
    `};var tl=Object.defineProperty,rl=Object.getOwnPropertyDescriptor,Dt=(e,t,r,s)=>{for(var a=s>1?void 0:s?rl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&tl(t,r,a),a};let Ye=class extends S{themeVars(){switch(this.theme){case"success":return"--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));";case"warning":return"--accent: #f59e0b; --bg: rgba(245,158,11,.12);";case"danger":return"--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));";default:return"--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));"}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return i`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?i`<span class="icon">${this.icon}</span>`:l}
                <div class="body">
                    ${this.heading?i`<span class="heading">${this.heading}</span>`:l}
                    ${this.description?i`<span class="desc">${this.description}</span>`:l}
                    ${this.ctaLabel?i`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:l}
                </div>
            </div>
        `}};Ye.styles=$`
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
    `;Dt([u()],Ye.prototype,"heading",2);Dt([u()],Ye.prototype,"description",2);Dt([u()],Ye.prototype,"icon",2);Dt([u()],Ye.prototype,"ctaLabel",2);Dt([u()],Ye.prototype,"actionId",2);Dt([u()],Ye.prototype,"theme",2);Ye=Dt([w("mateu-callout-card")],Ye);const sl=e=>{const t=e.metadata;return i`
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
    `};var al=Object.defineProperty,ol=Object.getOwnPropertyDescriptor,va=(e,t,r,s)=>{for(var a=s>1?void 0:s?ol(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&al(t,r,a),a};let Lr=class extends S{constructor(){super(...arguments),this.comments=[]}renderComment(e){const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return i`
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
        `}render(){return i`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};Lr.styles=$`
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
    `;va([u({type:Array})],Lr.prototype,"comments",2);Lr=va([w("mateu-comment-thread")],Lr);const il=e=>{const t=e.metadata;return i`
        <mateu-comment-thread
                .comments="${t.comments??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-comment-thread>
    `};var nl=Object.defineProperty,ll=Object.getOwnPropertyDescriptor,ba=(e,t,r,s)=>{for(var a=s>1?void 0:s?ll(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&nl(t,r,a),a};const dl={pdf:"📕",image:"🖼️",img:"🖼️",doc:"📘",docx:"📘",word:"📘",xls:"📗",xlsx:"📗",excel:"📗",sheet:"📗",zip:"🗜️",archive:"🗜️",video:"🎬",audio:"🎵",code:"💻",csv:"📄",txt:"📄"};let Dr=class extends S{constructor(){super(...arguments),this.files=[]}icon(e){return e&&dl[e.toLowerCase()]||"📄"}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return i`
            <div class="list">
                ${this.files.map(e=>{const t=!!e.url||!!e.actionId,r=i`
                        <span class="icon">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?i`<span class="size">${e.size}</span>`:l}
                        ${e.url?i`<span class="dl">⬇</span>`:l}
                    `;return e.url?i`<a class="file clickable" href="${e.url}" download target="_blank" rel="noopener">${r}</a>`:i`<div class="file ${t?"clickable":""}" @click="${s=>this.clickFile(e,s)}">${r}</div>`})}
            </div>
        `}};Dr.styles=$`
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
    `;ba([u({type:Array})],Dr.prototype,"files",2);Dr=ba([w("mateu-file-list")],Dr);const cl=e=>{const t=e.metadata;return i`
        <mateu-file-list
                .files="${t.files??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-file-list>
    `};var ul=Object.defineProperty,pl=Object.getOwnPropertyDescriptor,Vr=(e,t,r,s)=>{for(var a=s>1?void 0:s?pl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&ul(t,r,a),a};let jt=class extends S{constructor(){super(...arguments),this.items=[],this.localDone=new Map}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){const r=!this.isDone(e,t);this.localDone.set(t,r),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e,_done:r}},bubbles:!0,composed:!0}))}render(){const e=this.items.length,t=this.items.filter((s,a)=>this.isDone(s,a)).length,r=e>0?Math.round(t/e*100):0;return i`
            <div class="head">
                ${this.heading?i`<span class="title">${this.heading}</span>`:i`<span></span>`}
                <span class="count">${t} / ${e}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${r}%;"></div></div>
            ${this.items.map((s,a)=>{const o=this.isDone(s,a);return i`
                    <div class="item ${o?"done":""}" @click="${()=>this.toggle(s,a)}">
                        <span class="box">${o?"✓":l}</span>
                        <span class="label">${s.label}</span>
                    </div>
                `})}
        `}};jt.styles=$`
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
    `;Vr([u()],jt.prototype,"heading",2);Vr([u({type:Array})],jt.prototype,"items",2);Vr([b()],jt.prototype,"localDone",2);jt=Vr([w("mateu-checklist")],jt);const hl=e=>{const t=e.metadata;return i`
        <mateu-checklist
                heading="${t.title??l}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-checklist>
    `};var ml=Object.defineProperty,fl=Object.getOwnPropertyDescriptor,mt=(e,t,r,s)=>{for(var a=s>1?void 0:s?fl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&ml(t,r,a),a};let Ne=class extends S{render(){const e=this.trend??"flat";return i`
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
        `}};Ne.styles=$`
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
    `;mt([u()],Ne.prototype,"heading",2);mt([u()],Ne.prototype,"leftLabel",2);mt([u()],Ne.prototype,"leftValue",2);mt([u()],Ne.prototype,"rightLabel",2);mt([u()],Ne.prototype,"rightValue",2);mt([u()],Ne.prototype,"delta",2);mt([u()],Ne.prototype,"trend",2);Ne=mt([w("mateu-comparison-card")],Ne);const vl=e=>{const t=e.metadata;return i`
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
    `},Gr=$`
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
`,bl=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}),is=e=>bl.format(e),Ar=(e,t)=>{const r=e<0?"-":"",s=is(Math.abs(e));return t?`${r}${t} ${s}`:`${r}${s}`},gl=(e,t)=>t?`${is(e)} ${t}`:is(e);var yl=Object.defineProperty,$l=Object.getOwnPropertyDescriptor,ft=(e,t,r,s)=>{for(var a=s>1?void 0:s?$l(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&yl(t,r,a),a};let Fe=class extends S{constructor(){super(...arguments),this.title="",this.badges=[],this.facts=[]}render(){const e=!!(this.metricLabel||this.metricValue||this.metricCaption);return i`
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
        `}};Fe.styles=[Gr,$`
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
    `];ft([u()],Fe.prototype,"title",2);ft([u({type:Array})],Fe.prototype,"badges",2);ft([u()],Fe.prototype,"subtitle",2);ft([u({type:Array})],Fe.prototype,"facts",2);ft([u()],Fe.prototype,"metricLabel",2);ft([u()],Fe.prototype,"metricValue",2);ft([u()],Fe.prototype,"metricCaption",2);Fe=ft([w("mateu-entity-header")],Fe);const xl=e=>{const t=e.metadata;return i`
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
    `};var wl=Object.defineProperty,kl=Object.getOwnPropertyDescriptor,vt=(e,t,r,s)=>{for(var a=s>1?void 0:s?kl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&wl(t,r,a),a};let je=class extends S{constructor(){super(...arguments),this.value=0,this.max=0}fillColor(){return this.dangerAt!=null&&this.value>=this.dangerAt?"error":this.warnAt!=null&&this.value>=this.warnAt?"warning":this.warnAt!=null||this.dangerAt!=null?"success":"primary"}render(){const e=this.max>0?Math.min(Math.max(this.value/this.max,0),1):0,t=Math.round(e*100);return i`
            <div class="meter">
                ${this.label?i`<span class="label">${this.label}</span>`:l}
                <span class="value">${gl(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};je.styles=$`
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
    `;vt([u()],je.prototype,"label",2);vt([u({type:Number})],je.prototype,"value",2);vt([u({type:Number})],je.prototype,"max",2);vt([u()],je.prototype,"unit",2);vt([u()],je.prototype,"caption",2);vt([u({type:Number})],je.prototype,"warnAt",2);vt([u({type:Number})],je.prototype,"dangerAt",2);je=vt([w("mateu-meter")],je);const Sl=e=>{const t=e.metadata;return i`
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
    `};var Cl=Object.defineProperty,_l=Object.getOwnPropertyDescriptor,Gt=(e,t,r,s)=>{for(var a=s>1?void 0:s?_l(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Cl(t,r,a),a};let lt=class extends S{constructor(){super(...arguments),this.total=0,this.done=0}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){const e=this.total>0&&this.done>=this.total,t=!e&&!!this.actionLabel&&!!this.actionId;return i`
            <div class="banner ${e?"complete":""}">
                <span class="icon">👥</span>
                ${this.label?i`<span class="label">${this.label}</span>`:l}
                <div class="pills">
                    ${Array.from({length:this.total},(r,s)=>i`
                        <span class="pill ${s+1<=this.done?"filled":""}">${s+1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${t?i`<button @click="${()=>this.runAction()}">${this.actionLabel} →</button>`:l}
            </div>
        `}};lt.styles=$`
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
    `;Gt([u()],lt.prototype,"label",2);Gt([u({type:Number})],lt.prototype,"total",2);Gt([u({type:Number})],lt.prototype,"done",2);Gt([u()],lt.prototype,"actionLabel",2);Gt([u()],lt.prototype,"actionId",2);lt=Gt([w("mateu-task-progress")],lt);const El=e=>{const t=e.metadata;return i`
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
    `};var Il=Object.defineProperty,Pl=Object.getOwnPropertyDescriptor,br=(e,t,r,s)=>{for(var a=s>1?void 0:s?Pl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Il(t,r,a),a};let Ct=class extends S{constructor(){super(...arguments),this.items=[],this.compact=!1,this.frameless=!1}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}rowClicked(e){this.rowActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.rowActionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}render(){return i`
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
        `}};Ct.styles=[Gr,$`
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
    `];br([u({type:Array})],Ct.prototype,"items",2);br([u({type:Boolean})],Ct.prototype,"compact",2);br([u({type:Boolean})],Ct.prototype,"frameless",2);br([u()],Ct.prototype,"rowActionId",2);Ct=br([w("mateu-status-list")],Ct);const Ol=e=>{const t=e.metadata;return i`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                rowActionId="${D(t.rowActionId??void 0)}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-status-list>
    `};var zl=Object.defineProperty,Tl=Object.getOwnPropertyDescriptor,ga=(e,t,r,s)=>{for(var a=s>1?void 0:s?Tl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&zl(t,r,a),a};let Mr=class extends S{constructor(){super(...arguments),this.items=[]}render(){return i`
            <ul>
                ${this.items.map(e=>i`<li>${e}</li>`)}
            </ul>
        `}};Mr.styles=$`
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
    `;ga([u({type:Array})],Mr.prototype,"items",2);Mr=ga([w("mateu-bulleted-list")],Mr);const Rl=e=>{const t=e.metadata;return i`
        <mateu-bulleted-list
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-bulleted-list>
    `},Ll=e=>{const r=e.metadata.attributes?.["data-colspan"];return i`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??""}"
            class="${e.cssClasses??l}"
            id="${D(e.id??void 0)}"
            data-colspan="${D(r)}"
            slot="${e.slot??l}"/>
    `};var Dl=Object.defineProperty,Al=Object.getOwnPropertyDescriptor,be=(e,t,r,s)=>{for(var a=s>1?void 0:s?Al(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Dl(t,r,a),a};const Ml={info:"ℹ",success:"✓",warning:"!",danger:"!"};let se=class extends S{constructor(){super(...arguments),this.text="",this.theme="info",this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=!!this.text&&!!this.text.trim();if(!e&&!this.hasContent)return i``;const t=["info","success","warning","danger"].includes(this.theme)?this.theme:"info";return i`
            <div class="notice ${t} ${this.slim?"slim":""}">
                ${this.noIcon?l:i`<span class="icon ${this.icon?"custom":""}">${this.icon||Ml[t]}</span>`}
                <div class="body ${this.inlineContent?"inline":""}">
                    ${e?i`<span class="text">${this.text}</span>`:l}
                    ${this.hasContent?i`<div class="content"><slot></slot></div>`:l}
                </div>
                ${this.actionLabel&&this.actionId?i`<button class="notice-action" @click="${()=>this.runAction()}">${this.actionLabel}</button>`:this.status?i`<span class="status">${this.status}</span>`:l}
            </div>
        `}};se.styles=$`
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
    `;be([u()],se.prototype,"text",2);be([u()],se.prototype,"theme",2);be([u()],se.prototype,"icon",2);be([u({type:Boolean})],se.prototype,"noIcon",2);be([u()],se.prototype,"actionLabel",2);be([u()],se.prototype,"actionId",2);be([u()],se.prototype,"status",2);be([u({type:Boolean})],se.prototype,"slim",2);be([u({type:Boolean})],se.prototype,"fullWidth",2);be([u({type:Boolean})],se.prototype,"hasContent",2);be([u({type:Boolean})],se.prototype,"inlineContent",2);se=be([w("mateu-notice")],se);const Ul=(e,t,r,s,a,o,n)=>{const d=t.metadata,c=or(d.text??"",s,a,o,n)??"",p=t.children??[];return i`
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
        >${p.map(f=>k(e,f,r,s,a,o,n))}</mateu-notice>
    `};var Nl=Object.defineProperty,Fl=Object.getOwnPropertyDescriptor,Kr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Fl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Nl(t,r,a),a};let Bt=class extends S{constructor(){super(...arguments),this.groups=[]}willUpdate(e){e.has("groups")&&(this.selectedId=this.groups.flatMap(t=>t.items??[]).find(t=>t.selected)?.id)}select(e){this.selectedId=e,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e}},bubbles:!0,composed:!0}))}render(){return i`
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
        `}};Bt.styles=[Gr,$`
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
    `];Kr([u()],Bt.prototype,"actionId",2);Kr([u({type:Array})],Bt.prototype,"groups",2);Kr([b()],Bt.prototype,"selectedId",2);Bt=Kr([w("mateu-task-queue")],Bt);const jl=e=>{const t=e.metadata;return i`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-task-queue>
    `};var Bl=Object.defineProperty,ql=Object.getOwnPropertyDescriptor,Kt=(e,t,r,s)=>{for(var a=s>1?void 0:s?ql(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Bl(t,r,a),a};let dt=class extends S{constructor(){super(...arguments),this.columns=0,this.items=[]}willUpdate(e){e.has("items")&&(this.selectedId=this.items.find(t=>t.selected)?.id)}select(e){e.disabled||(this.selectedId=e.id,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0})))}render(){const e=this.columns>0?`grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`:"grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));";return i`
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
        `}};dt.styles=[Gr,$`
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
    `];Kt([u()],dt.prototype,"actionId",2);Kt([u({type:Number})],dt.prototype,"columns",2);Kt([u()],dt.prototype,"recommendedLabel",2);Kt([u({type:Array})],dt.prototype,"items",2);Kt([b()],dt.prototype,"selectedId",2);dt=Kt([w("mateu-resource-grid")],dt);const Hl=e=>{const t=e.metadata;return i`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-resource-grid>
    `};var Wl=Object.defineProperty,Vl=Object.getOwnPropertyDescriptor,le=(e,t,r,s)=>{for(var a=s>1?void 0:s?Vl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Wl(t,r,a),a};let Y=class extends S{constructor(){super(...arguments),this.title="",this.features=[],this.current=!1,this.added=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return i`
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
        `}};Y.styles=$`
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
    `;le([u()],Y.prototype,"tag",2);le([u()],Y.prototype,"title",2);le([u()],Y.prototype,"subtitle",2);le([u()],Y.prototype,"image",2);le([u({type:Array})],Y.prototype,"features",2);le([u()],Y.prototype,"priceLabel",2);le([u()],Y.prototype,"actionLabel",2);le([u()],Y.prototype,"actionId",2);le([u({type:Boolean})],Y.prototype,"current",2);le([u()],Y.prototype,"currentLabel",2);le([u({type:Boolean})],Y.prototype,"added",2);le([u()],Y.prototype,"addedLabel",2);Y=le([w("mateu-offer-card")],Y);const Gl=e=>{const t=e.metadata;return i`
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
    `};var Kl=Object.defineProperty,Yl=Object.getOwnPropertyDescriptor,Yt=(e,t,r,s)=>{for(var a=s>1?void 0:s?Yl(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Kl(t,r,a),a};let ct=class extends S{constructor(){super(...arguments),this.items=[],this.added=new Set}willUpdate(e){e.has("items")&&(this.added=new Set(this.items.filter(t=>t.added).map(t=>t.id)))}total(){return this.items.filter(e=>e.id!=null&&this.added.has(e.id)).reduce((e,t)=>e+(t.price??0),0)}toggle(e){if(e.id==null)return;const t=new Set(this.added),r=!t.has(e.id);r?t.add(e.id):t.delete(e.id),this.added=t,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id,_added:r,_total:this.total()}},bubbles:!0,composed:!0}))}render(){return i`
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
        `}};ct.styles=$`
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
    `;Yt([u()],ct.prototype,"totalLabel",2);Yt([u()],ct.prototype,"currency",2);Yt([u()],ct.prototype,"actionId",2);Yt([u({type:Array})],ct.prototype,"items",2);Yt([b()],ct.prototype,"added",2);ct=Yt([w("mateu-addon-picker")],ct);const Jl=e=>{const t=e.metadata;return i`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-addon-picker>
    `};var Xl=Object.defineProperty,Ql=Object.getOwnPropertyDescriptor,gr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Ql(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Xl(t,r,a),a};let _t=class extends S{constructor(){super(...arguments),this.lines=[]}computedTotal(){return this.total!=null?this.total:this.lines.filter(e=>!e.included).reduce((e,t)=>e+(t.amount??0),0)}render(){return i`
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
        `}};_t.styles=$`
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
    `;gr([u()],_t.prototype,"currency",2);gr([u()],_t.prototype,"totalLabel",2);gr([u({type:Array})],_t.prototype,"lines",2);gr([u({type:Number})],_t.prototype,"total",2);_t=gr([w("mateu-ledger")],_t);const Zl=e=>{const t=e.metadata;return i`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-ledger>
    `};var ed=Object.defineProperty,td=Object.getOwnPropertyDescriptor,Xe=(e,t,r,s)=>{for(var a=s>1?void 0:s?td(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&ed(t,r,a),a};let Ce=class extends S{constructor(){super(...arguments),this.methods=[]}willUpdate(e){e.has("selected")&&(this.selectedId=this.selected)}confirm(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_method:this.selectedId}},bubbles:!0,composed:!0}))}pick(e){this.selectedId=e,this.methodActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.methodActionId,parameters:{_method:e}},bubbles:!0,composed:!0}))}render(){return i`
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
        `}};Ce.styles=$`
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
    `;Xe([u()],Ce.prototype,"actionId",2);Xe([u()],Ce.prototype,"methodActionId",2);Xe([u({type:Array})],Ce.prototype,"methods",2);Xe([u()],Ce.prototype,"selected",2);Xe([u()],Ce.prototype,"contextLabel",2);Xe([u()],Ce.prototype,"contextValue",2);Xe([u()],Ce.prototype,"confirmLabel",2);Xe([b()],Ce.prototype,"selectedId",2);Ce=Xe([w("mateu-payment-picker")],Ce);const rd=e=>{const t=e.metadata;return i`
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
    `};var sd=Object.defineProperty,ad=Object.getOwnPropertyDescriptor,ya=(e,t,r,s)=>{for(var a=s>1?void 0:s?ad(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&sd(t,r,a),a};let Ur=class extends S{constructor(){super(...arguments),this.items=[]}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return i`
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
        `}};Ur.styles=$`
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
    `;ya([u({type:Array})],Ur.prototype,"items",2);Ur=ya([w("mateu-process-monitor")],Ur);const od=e=>{const t=e.metadata;return i`
        <mateu-process-monitor
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-process-monitor>
    `},id=(e,t)=>{let r=e.style;return e.id&&(r&&!r.endsWith(";")&&(r+=";"),r==null&&(r=""),t[e.id+".hidden"]==!0&&(r+="display: none;")),r},nd=(e,t)=>{let r={...e.metadata};if(e.id&&r){if(r.type==h.Button){const s=r;t[e.id+".disabled"]==!0&&(s.disabled=!0)}if(r.type==h.FormField){const s=r;t[e.id+".disabled"]==!0&&(s.disabled=!0)}}return r},O=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),ld={[h.Bpmn]:({component:e})=>Vi(e),[h.Workflow]:({component:e})=>Ki(e),[h.WorkflowElk]:({component:e})=>Yi(e),[h.FormEditor]:({component:e})=>Ji(e),[h.Page]:O(as),[h.Div]:O(ji),[h.Directory]:({component:e,baseUrl:t,state:r,data:s})=>Fi(e),[h.FormLayout]:O(Bo),[h.HorizontalLayout]:O(Vo),[h.VerticalLayout]:O(Go),[h.SplitLayout]:O(Ko),[h.MasterDetailLayout]:O(Yo),[h.TabLayout]:O(Jo),[h.AccordionLayout]:O(Xo),[h.BoardLayout]:O(ri),[h.BoardLayoutRow]:O(si),[h.BoardLayoutItem]:O(ai),[h.Scroller]:O(Zo),[h.FullWidth]:O(ei),[h.Container]:O(ti),[h.Form]:({container:e,component:t,baseUrl:r,state:s,data:a,appState:o,appData:n})=>{const d=t.metadata;return i`<mateu-form
            id="${t.id}"
        baseUrl="${r}"
            .component="${t}"
            .values="${s}"
            .state="${s}"
            .data="${a}"
            .appState="${o}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??l}"
            >
                ${t.children?.map(c=>k(e,c,r,s,a,o,n))}
            ${d?.buttons?.map(c=>i`
               ${k(e,{id:c.actionId,metadata:c,type:K.ClientSide,slot:"buttons"},void 0,s,a,o,n)}
`)}

            </mateu-form>`},[h.Table]:({component:e,state:t,data:r})=>ss(e,(e.id?r?.[e.id]:void 0)?.page?.content??zs(e,t)),[h.Crud]:O(os),[h.App]:({container:e,component:t,baseUrl:r,state:s,data:a,appState:o,appData:n})=>i`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${r}"
                        .component="${t}"
                        .state="${s}"
                        .data="${a}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${o}"
                        .appData="${n}"
            >
             ${t.children?.map(d=>k(e,d,r,s,a,o,n))}
         </mateu-app>`,[h.Element]:({container:e,component:t})=>fi(e,t.metadata,t),[h.FormField]:({component:e,state:t})=>Wi(e,t),[h.Text]:({component:e,state:t,data:r,appState:s,appData:a})=>vi(e,t,r,s,a),[h.Avatar]:({component:e,state:t,data:r})=>mo(e,t,r),[h.Chat]:({component:e,state:t,data:r})=>Gi(e),[h.AvatarGroup]:({component:e})=>fo(e),[h.Badge]:({component:e,state:t,data:r})=>vo(e,t,r),[h.Breadcrumbs]:({component:e})=>Ui(e),[h.Anchor]:({component:e})=>bi(e),[h.Button]:({component:e,state:t,data:r})=>wi(e,t,r),[h.Card]:O(ki),[h.Chart]:({component:e})=>Si(e),[h.Icon]:({component:e})=>Ci(e),[h.ConfirmDialog]:O(_i),[h.ContextMenu]:O(di),[h.CookieConsent]:({component:e})=>Ei(e),[h.Details]:O(Ii),[h.Dialog]:({component:e,baseUrl:t,state:r,data:s,appState:a,appData:o})=>Pi(e,t,r,s,a,o),[h.Drawer]:({component:e,baseUrl:t,state:r,data:s,appState:a,appData:o})=>Oi(e,t,r,s,a,o),[h.Image]:({component:e})=>Mi(e),[h.Map]:({component:e})=>Ai(e),[h.Markdown]:({component:e})=>Ti(e),[h.MicroFrontend]:({component:e})=>zi(e),[h.Notification]:({component:e})=>Ri(e),[h.ProgressBar]:({component:e,state:t})=>Li(e,t),[h.Popover]:O(Di),[h.CarouselLayout]:O(Ni),[h.Tooltip]:O(pi),[h.MessageInput]:({component:e})=>ui(e),[h.MessageList]:({component:e})=>ni(e),[h.CustomField]:O(ci),[h.MenuBar]:({container:e,component:t,baseUrl:r,state:s,data:a})=>li(e,t,r,s,a),[h.Grid]:({component:e,state:t})=>ss(e,zs(e,t)),[h.VirtualList]:O(oi),[h.FormSection]:O(Bi),[h.FormSubSection]:O(qi),[h.MetricCard]:({component:e})=>en(e),[h.Scoreboard]:O(tn),[h.DashboardPanel]:O(rn),[h.DashboardLayout]:O(sn),[h.FoldoutLayout]:O(nn),[h.HeroSection]:O(ln),[h.EmptyState]:({component:e})=>Io(e),[h.Skeleton]:({component:e})=>Po(e),[h.Gantt]:({component:e})=>un(e),[h.PlanningBoard]:({component:e})=>mn(e),[h.Kanban]:({component:e})=>bn(e),[h.Timeline]:({component:e})=>$n(e),[h.ProgressSteps]:({component:e})=>kn(e),[h.Stat]:({component:e})=>_n(e),[h.Calendar]:({component:e})=>Pn(e),[h.PricingTable]:({component:e})=>Tn(e),[h.OrgChart]:({component:e})=>Dn(e),[h.Heatmap]:({component:e})=>Nn(e),[h.Funnel]:({component:e})=>Bn(e),[h.TrendChart]:({component:e})=>Wn(e),[h.FeatureGrid]:({component:e})=>Kn(e),[h.Testimonials]:({component:e})=>Xn(e),[h.Faq]:({component:e})=>el(e),[h.CalloutCard]:({component:e})=>sl(e),[h.CommentThread]:({component:e})=>il(e),[h.FileList]:({component:e})=>cl(e),[h.Checklist]:({component:e})=>hl(e),[h.ComparisonCard]:({component:e})=>vl(e),[h.EntityHeader]:({component:e})=>xl(e),[h.Meter]:({component:e})=>Sl(e),[h.TaskProgress]:({component:e})=>El(e),[h.StatusList]:({component:e})=>Ol(e),[h.BulletedList]:({component:e})=>Rl(e),[h.Separator]:({component:e})=>Ll(e),[h.Notice]:O(Ul),[h.TaskQueue]:({component:e})=>jl(e),[h.ResourceGrid]:({component:e})=>Hl(e),[h.OfferCard]:({component:e})=>Gl(e),[h.AddOnPicker]:({component:e})=>Jl(e),[h.Ledger]:({component:e})=>Zl(e),[h.PaymentPicker]:({component:e})=>rd(e),[h.ProcessMonitor]:({component:e})=>od(e)},$s=(e,t,r,s,a,o,n,d)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),i`<p>No metadata for component</p>`):$s(e,{id:ke(),metadata:t,type:K.ClientSide},r,s,a,o,n,d);const c=t.metadata.type,p={...t,style:id(t,a),metadata:nd(t,a)},f=ld[c];return f?f({container:e,component:p,baseUrl:r,state:s,data:a,appState:o,appData:n,labelAlreadyRendered:d}):i`<p ${p?.slot??l}>Unknown metadata type ${c} for component ${p?.id}</p>`};var sr=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(sr||{});const $a=e=>{switch(e){case sr.SUCCESS:return"success";case sr.WARNING:return"warning";case sr.DANGER:return"error";case sr.NONE:return"contrast"}return""};var dd=Object.defineProperty,cd=Object.getOwnPropertyDescriptor,ge=(e,t,r,s)=>{for(var a=s>1?void 0:s?cd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&dd(t,r,a),a};let ae=class extends S{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.respondToVisibility=(e,t)=>{var r={root:document.documentElement},s=new IntersectionObserver(a=>{a.forEach(o=>{t(o.intersectionRatio>0)})},r);s.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?$s(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?i`<div class="neutral-card">
                ${e.image?i`<img class="card-media" src="${e.image}" alt="" />`:l}
                <div class="card-body">
                    <div class="card-head">
                        ${e.title?i`<span class="card-title">${e.title}</span>`:l}
                        ${e.status?i`<span theme="badge ${$a(e.status.type)}">${e.status.message}</span>`:l}
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
       `}};ae.styles=$`
        ${hr}
        
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
    `;ge([u()],ae.prototype,"id",2);ge([u()],ae.prototype,"metadata",2);ge([u()],ae.prototype,"baseUrl",2);ge([u()],ae.prototype,"state",2);ge([u()],ae.prototype,"data",2);ge([u()],ae.prototype,"appState",2);ge([u()],ae.prototype,"appData",2);ge([u()],ae.prototype,"emptyStateMessage",2);ge([b()],ae.prototype,"keepAsking",2);ge([Pe("#ask-for-more")],ae.prototype,"askForMore",2);ge([b()],ae.prototype,"hasMore",2);ae=ge([w("mateu-card-list")],ae);const ud={show:e=>console.debug("[mateu] no notifier registered, dropping toast:",e.text)};let xa=ud;function pd(e){xa=e}function Et(e,t){xa.show(e,t)}var wa=(e=>(e.none="none",e.success="success",e.error="error",e.warning="warning",e.contrast="contrast",e.normal="normal",e))(wa||{}),ka=(e=>(e.primary="primary",e.secondary="secondary",e.tertiary="tertiary",e.tertiaryInline="tertiaryInline",e))(ka||{});const hd=76;function Rs(e){if(e.weight!=null)return e.weight;const t=e.stereotype??"";if(t==="icon")return 1;if(t==="image")return 4;if(t==="html"||t==="richText"||t==="markdown"||t==="textarea")return 5;if(t==="link")return 2.5;if(t==="combobox"||t==="select")return 2;const r=e.dataType??"";return r==="bool"?1:r==="status"||r==="integer"?1.5:r==="number"||r==="date"||r==="money"?2:r==="dateTime"||r==="dateRange"?2.5:3}function md(e,t){if(e.length===0)return"table";const r=e.reduce((c,p)=>c+Rs(p),0),s=t/hd,a=r/s;if(a<=1)return"table";const o=e.filter(c=>c.identifier||(c.priority??Number.MAX_SAFE_INTEGER)<=2),n=o.reduce((c,p)=>c+Rs(p),0);return a>1.6||e.length>10?"masterDetail":o.length>0&&n<=8?"list":e.some(c=>c.stereotype==="image"||c.stereotype==="html")||o.length===0&&e.length>=4&&e.length<=8?"cards":"masterDetail"}function Sa(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,r)=>(t.priority??Number.MAX_SAFE_INTEGER)-(r.priority??Number.MAX_SAFE_INTEGER))}function fd(e){const t=Sa(e);return t.length>0?t:e.slice(0,3)}var vd=Object.defineProperty,bd=Object.getOwnPropertyDescriptor,ye=(e,t,r,s)=>{for(var a=s>1?void 0:s?bd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&vd(t,r,a),a};const gd={asc:"ascending",desc:"descending"};let oe=class extends S{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this._columnPrefsRevision=0,this._prefsRevisionApplied=-1,this.search=()=>{const e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{Et({text:e,position:"bottomEnd",variant:"error",duration:3e3},this)},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};const t=this.component.metadata;this._syncStateToUrl(t),!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this.fetchMoreElements=e=>{const{params:t,callback:r}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(r)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(r=>({fieldId:r.__data.path,direction:r.__data.direction?gd[r.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>Rt(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get columnPrefsScope(){return window.location.pathname}get effectiveComponent(){const e=this.component,t=e?.metadata;if(!e||!t?.columns)return e;if(this._prefsSource===e&&this._prefsRevisionApplied===this._columnPrefsRevision)return this._prefsApplied;const r=ta(this.columnPrefsScope),s=sa(t.columns,r,a=>a.metadata??{});return this._prefsApplied=s===t.columns?e:{...e,metadata:{...t,columns:s}},this._prefsSource=e,this._prefsRevisionApplied=this._columnPrefsRevision,this._prefsApplied}get columnChooserEntries(){return(this.component?.metadata?.columns??[]).map(t=>{const r=t.metadata??{},s=r.id??t.id;return s?{id:s,label:r.label??s,protected:ra(r)}:void 0}).filter(t=>!!t)}renderColumnChooser(){const e=this.columnChooserEntries;return e.filter(t=>!t.protected).length===0?l:i`
            <mateu-column-chooser
                .columns="${e}"
                .scope="${this.columnPrefsScope}"
                @column-prefs-changed="${t=>{t.stopPropagation(),this._columnPrefsRevision++}}"
            ></mateu-column-chooser>
        `}get cols(){return this.effectiveComponent?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":md(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set(["searchText",...(e.filters??[]).flatMap(t=>t.stereotype==="dateRange"||t.stereotype==="numberRange"?[`${t.fieldId}_from`,`${t.fieldId}_to`]:[t.fieldId])])}_syncStateToUrl(e){const t=this._filterIds(e),r=new URLSearchParams(window.location.search);t.forEach(d=>r.delete(d)),r.delete("page"),r.delete("sort"),t.forEach(d=>{const c=this.state[d];c!=null&&c!==""&&r.set(d,String(c))});const s=this.state.page;s&&s>0&&r.set("page",String(s));const a=this.state.sort;if(a&&a.length>0){const d=a.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");d&&r.set("sort",d)}const o=r.toString(),n=o?`${window.location.pathname}?${o}`:window.location.pathname;window.location.pathname+window.location.search!==n&&history.replaceState(null,"",n)}_initStateFromUrl(e,t){const r=new URLSearchParams(window.location.search),s=this._filterIds(e),a={...t};r.forEach((d,c)=>{s.has(c)&&(a[c]=d)});const o=r.get("page");if(o!==null){const d=parseInt(o,10);!isNaN(d)&&d>0&&(a.page=d)}const n=r.get("sort");if(n){const d=n.split(",").map(c=>{const[p,f]=c.split(":");return p&&f?{fieldId:p,direction:f}:null}).filter(Boolean);d.length>0&&(a.sort=d)}return a}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has("component")){const t=this.component?.id;if(t!==this._initializedForComponentId){this._initializedForComponentId=t;const r=this.component?.metadata,s=r.initialPage&&r.initialPage>0?r.initialPage:0;this.state=this._initStateFromUrl(r,{...this.state,size:r.pageSize,page:s,sort:[]}),(this.state.page!==s||this.state.sort?.length>0||[...this._filterIds(r)].some(o=>this.state[o]!=null))&&this.handleSearchRequested(void 0)}}}render(){const e=x=>{const L=[];return x.color&&x.color!==wa.normal&&L.push(x.color),x.buttonStyle&&L.push(x.buttonStyle===ka.tertiaryInline?"tertiary-inline":x.buttonStyle),L.length?L.join(" "):void 0},t=x=>x==="back"||x==="backToList"||!!x&&x.startsWith("cancel"),r=x=>{const L=q.get()?.renderToolbarButton?.(x,this.evalLabel(x.label),()=>this.handleToolbarButtonClick(x.actionId));return L||i`
                <button class="crud-btn"
                        data-action-id="${x.id}"
                        theme="${e(x)||l}"
                        @click="${()=>this.handleToolbarButtonClick(x.actionId)}"
                >${this.evalLabel(x.label)}</button>
            `};if(!this.component)return i`no component`;const s=this.effectiveComponent,a=s.metadata;a.serverSideOrdering=!0;const o=a?.toolbar??[],n=o.filter(x=>t(x.actionId)),d=o.filter(x=>!t(x.actionId)),c=n.length>0&&d.length>0,p=!!a?.title||!!a?.subtitle||o.length>0,f=this.effectiveGridLayout,m=this.cols,v=Sa(m),C=this.data[this.id]?.page?.content??[],g=this.state[this.component?.id]?.emptyStateMessage,I=(x,L)=>{const E=L[x.id];if(E==null)return i``;if(x.dataType==="status"){const z=$a(E.type);return i`<span theme="badge pill ${z}">${E.message}</span>`}return x.dataType==="bool"?i`${E?"✓":"✗"}`:typeof E=="object"?i`${E.label??E.name??E.message??""}`:i`${E}`},A=()=>{const x=this.identifierFieldName,L=this.state._selectedId??this.appState?._splitDetailId,E=v.find(P=>P.identifier)??v[0],z=P=>P.dataType==="action"||P.dataType==="actionGroup"||P.dataType==="menu"||P.stereotype==="button",Oe=v.filter(P=>P!==E&&!z(P)),Mt=m.filter(P=>z(P)),et=(P,T,U)=>{P.stopPropagation(),P.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:T,parameters:{_clickedRow:U}},bubbles:!0,composed:!0}))},gt=P=>{const T=[];for(const U of Mt){const F=P[U.id];if(U.dataType==="action"){const tt=F?.methodNameInCrud?F:P.action?.methodNameInCrud?P.action:{methodNameInCrud:U.id,label:U.label};T.push(i`
                            <button class="crud-btn" theme="tertiary small" title="${tt.label||l}"
                                @click="${_=>et(_,"action-on-row-"+tt.methodNameInCrud,P)}">
                                ${l}
                                ${tt.label??l}
                            </button>`)}else(U.dataType==="actionGroup"||U.dataType==="menu")&&(F?.actions??[]).forEach(_=>T.push(i`
                            <button class="crud-btn" theme="tertiary small" title="${_.label||l}"
                                @click="${ee=>et(ee,"action-on-row-"+_.methodNameInCrud,P)}">
                                ${l}
                                ${_.label??l}
                            </button>`))}return T.length?i`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${T}
                    </div>`:l};return i`
                <div class="m-listbox" style="width: 100%;">
                    ${C.length===0?i`<div class="m-item" disabled>${rr(g)}</div>`:l}
                    ${C.map(P=>i`
                        <div class="m-item"
                            ?selected="${x&&L!==void 0&&String(P[x])===String(L)}"
                            @click="${()=>{x&&P[x]!==void 0&&(this.state={...this.state,_selectedId:String(P[x])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:P},bubbles:!0,composed:!0}))}}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${E?P[E.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${Oe.map(T=>i`<span>${T.label}: ${I(T,P)}</span>`)}
                            </div>
                            ${gt(P)}
                        </div>
                    `)}
                </div>`},ce=(x,L,E)=>{const z=this.identifierFieldName;z&&E[z]!==void 0&&(this.state={...this.state,_selectedId:String(E[z])}),x.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:L,parameters:E},bubbles:!0,composed:!0}))},X=()=>{const x=this.identifierFieldName,L=this.state._selectedId??this.appState?._splitDetailId,E=m.slice(0,6),z=E.filter(_=>_.stereotype==="image"),Oe=E.find(_=>_.identifier)??E[0],Mt=_=>!!_.actionId,et=_=>_.dataType==="action"||_.dataType==="actionGroup"||_.dataType==="menu"||_.stereotype==="button",gt=E.find(_=>_.id==="select"&&_.dataType==="action"),P=!!gt,T=E.filter(_=>_!==Oe&&!z.includes(_)&&!Mt(_)&&!et(_)),U=E.filter(_=>et(_)&&!(P&&_===gt)),F=(_,ee,rt)=>{_.stopPropagation(),_.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:ee,parameters:{_clickedRow:rt}},bubbles:!0,composed:!0}))},tt=_=>{const ee=[];for(const rt of U){const Zr=_[rt.id];if(rt.dataType==="action"){const wr=Zr?.methodNameInCrud?Zr:_.action?.methodNameInCrud?_.action:{methodNameInCrud:rt.id,label:rt.label};ee.push(i`
                            <button class="crud-btn" theme="tertiary" title="${wr.label||l}"
                                @click="${Qt=>F(Qt,"action-on-row-"+wr.methodNameInCrud,_)}">
                                ${l}
                                ${wr.label??l}
                            </button>`)}else(rt.dataType==="actionGroup"||rt.dataType==="menu")&&(Zr?.actions??[]).forEach(Qt=>ee.push(i`
                            <button class="crud-btn" theme="tertiary" title="${Qt.label||l}"
                                @click="${Ma=>F(Ma,"action-on-row-"+Qt.methodNameInCrud,_)}">
                                ${l}
                                ${Qt.label??l}
                            </button>`))}return ee.length?i`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${ee}
                    </div>`:l};return i`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${C.length===0?i`<div style="grid-column: 1 / -1;">${rr(g)}</div>`:l}
                    ${C.map(_=>i`
                        <div class="crud-card"
                            ?data-selected="${x&&L!==void 0&&String(_[x])===String(L)}"
                            style="cursor: pointer;"
                            @click="${ee=>P?F(ee,"action-on-row-select",_):ce(ee.target,"view",_)}"
                        >
                            ${z.length?i`<img src="${_[z[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: var(--lumo-border-radius-m, 8px);" />`:l}
                            ${Oe?i`<div class="crud-card-title">${_[Oe.id]??""}</div>`:l}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${T.map(ee=>i`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${ee.label}</span>
                                        <span>${I(ee,_)}</span>
                                    </div>
                                `)}
                            </div>
                            ${tt(_)}
                        </div>
                    `)}
                </div>`},We=()=>{const x=fd(m),L=x.find(z=>z.identifier)??x[0],E=x.filter(z=>z!==L);return i`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <div class="m-listbox" style="width: 100%;">
                            ${C.length===0?i`<div class="m-item" disabled>${rr(g)}</div>`:l}
                            ${C.map(z=>i`
                                <div class="m-item"
                                    ?selected="${this.selectedItem===z}"
                                    @click="${()=>{this.selectedItem=z}}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${L?z[L.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${E.map(Oe=>i`${I(Oe,z)} `)}
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?i`
                            <div class="m-formlayout">
                                ${m.map(z=>i`
                                    <label style="display: flex; flex-direction: column; gap: .1rem; font-size: var(--lumo-font-size-s, .875rem);">
                                        <span style="color: var(--lumo-secondary-text-color, #667);">${z.label}</span>
                                        <span>${String(this.selectedItem[z.id]??"")}</span>
                                    </label>
                                `)}
                            </div>
                        `:i`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},ne=()=>{const x=this.identifierFieldName,L=this.state._selectedId??this.appState?._splitDetailId,E=m[0],z=m.slice(1),Oe=!!E?.actionId,Mt=T=>(T??[]).map(U=>{const F=Array.isArray(U.children)?U.children:[];return F.length>0?{...U,children:Mt(F)}:{...U,children:void 0}}),et=Mt(C),gt=(T,U,F)=>{T.stopPropagation(),x&&U[x]!==void 0&&(this.state={...this.state,_selectedId:String(U[x])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:F,parameters:U},bubbles:!0,composed:!0}))},P=(T,U)=>i`
                <tr class="${x&&L!==void 0&&String(T[x])===String(L)?"selected":""}"
                    style="cursor: pointer;" @click="${F=>gt(F,T,"view")}">
                    ${E?i`<td style="padding-left: ${U*1.2+.6}rem;">${T[E.id]??""}</td>`:l}
                    ${z.map(F=>F.id==="select"?i`<td><button class="crud-btn small" @click="${tt=>{tt.stopPropagation(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-select",parameters:{_clickedRow:T}},bubbles:!0,composed:!0}))}}">Select</button></td>`:i`<td>${T[F.id]??""}</td>`)}
                    ${Oe?i`<td style="text-align: end;">${T?.viewable===!1?l:i`<button class="crud-btn small" @click="${F=>gt(F,T,"view")}">View</button>`}</td>`:l}
                </tr>
                ${(T.children??[]).map(F=>P(F,U+1))}
            `;return i`
                <table class="crud-table">
                    <thead><tr>
                        ${E?i`<th>${E.label??l}</th>`:l}
                        ${z.map(T=>i`<th>${T.label??l}</th>`)}
                        ${Oe?i`<th></th>`:l}
                    </tr></thead>
                    <tbody>
                        ${et.length===0?i`<tr><td colspan="99" style="padding: 1.5rem; text-align: center; color: var(--lumo-secondary-text-color, #888);">${rr(g)}</td></tr>`:l}
                        ${et.map(T=>P(T,0))}
                    </tbody>
                </table>`},V=q.get()?.rendersCrudLayouts?.()===!0,Q=i`
            ${a.infiniteScrolling?i`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:l}
            ${!V&&f==="list"?A():!V&&f==="cards"?a.contentHeight?i`
                <div class="m-scroll" style="width: 100%; height: ${a.contentHeight};">
                    ${X()}
                </div>
            `:X():!V&&f==="masterDetail"?We():!V&&f==="tree"?ne():q.get()?.renderTableComponent(this,s,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,Z=a.infiniteScrolling?l:q.get()?.renderPagination(this,this.component),ue=this.showImportDialog?i`
            <div class="crud-modal-backdrop" @click="${x=>{x.target===x.currentTarget&&(this.showImportDialog=!1)}}">
                <div class="crud-modal">
                    <h3 style="margin: 0 0 .75rem;">Import</h3>
                    <input type="file" @change="${x=>{const L=x.target.files?.[0];if(L){const E=new FormData;E.append("file",L),fetch("/upload",{method:"POST",body:E}).then(z=>z.json()).then(z=>this.handleImportUploadSuccess({detail:z})).catch(()=>this.notify("Import failed"))}}}">
                    <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                        <button class="crud-btn" @click="${()=>{this.showImportDialog=!1}}">Cancel</button>
                    </div>
                </div>
            </div>
        `:l;return this.standalone?i`
                ${ue}
                <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); background: var(--mateu-section-bg, transparent); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); width: 100%; box-sizing: border-box; padding: var(--lumo-space-m); display: flex; flex-direction: column;">
                    <div style="flex-shrink: 0;">
                        <mateu-content-header
                            .metadata="${a}"
                            .baseUrl="${this.baseUrl}"
                            .state="${this.state}"
                            .data="${this.data}"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                        ></mateu-content-header>
                    </div>
                    <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                        <div style="flex: 1; min-width: 0;">${q.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                        ${this.renderColumnChooser()}
                    </div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${Q}</div>
                    <div style="flex-shrink: 0;">${Z}</div>
                </div>
            `:i`
            ${ue}
            ${p?i`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem);">
                        <div style="flex: 1; min-width: 0;">
                            ${a?.title?i`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(a.title)}</h2>
                            `:l}
                            ${a?.subtitle?i`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(a.subtitle)}</span>
                            `:l}
                        </div>
                        ${n.map(x=>r(x))}
                        ${c?i`<span class="toolbar-divider"></span>`:l}
                        ${d.map(x=>r(x))}
                        <slot></slot>
                    </div>
                `:l}
            <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); background: var(--mateu-section-bg, transparent); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--lumo-space-m); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                    <div style="flex: 1; min-width: 0;">${q.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                    ${this.renderColumnChooser()}
                </div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${Q}</div>
                <div style="flex-shrink: 0;">${Z}</div>
            </div>
        `}createRenderRoot(){return q.mustUseShadowRoot()?super.createRenderRoot():this}};oe.styles=$`
        ${hr}
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
        .m-item { padding: .5rem .75rem; border-radius: var(--lumo-border-radius-m, 6px); }
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
    `;ye([u()],oe.prototype,"component",2);ye([u()],oe.prototype,"baseUrl",2);ye([u({type:Boolean})],oe.prototype,"standalone",2);ye([u()],oe.prototype,"state",2);ye([u()],oe.prototype,"data",2);ye([u()],oe.prototype,"appState",2);ye([u()],oe.prototype,"appData",2);ye([b()],oe.prototype,"showImportDialog",2);ye([b()],oe.prototype,"availableWidthPx",2);ye([b()],oe.prototype,"selectedItem",2);ye([b()],oe.prototype,"_columnPrefsRevision",2);oe=ye([w("mateu-table-crud")],oe);var it=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(it||{}),yd=Object.defineProperty,Yr=(e,t,r,s)=>{for(var a=void 0,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=n(t,r,a)||a);return a&&yd(t,r,a),a};class bt extends cs{constructor(){super(...arguments),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(r=>r.type==it.OnLoad).forEach(r=>{if((!r.condition||this._evalExpr(r.condition))&&!r.triggered){const a=r;a.triggered=!0;var s=a.times-1;a.timeoutMillis>0?this.scheduleOnload(a,s,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,r,s)=>{if(s!=this.component?.id)return;const a=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,callbackToken:a},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const r=t,a=(this.component.triggers??[]).filter(o=>o.type==it.OnCustomEvent).filter(o=>o.eventName==r.type).filter(o=>o.source!=="COMPONENT"||r.detail?.__source===o.from);a.length!==0&&(a.some(o=>!o.source||o.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),a.forEach(o=>{(!o.condition||this._evalExpr(o.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:o.actionId,parameters:r.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return Js(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return ho(t,this.state??{},this.data??{},this._interpolationExtra())}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(ar.Add==t.action)this.component&&this.component.children?.push(t.component);else{if(this.callbackToken=ke(),t.component?.type==K.ServerSide)if(this.component){const s=this.component,a=t.component;s.actions=a.actions,s.type=a.type,s.rules=a.rules,s.triggers=a.triggers,s.serverSideType=a.serverSideType,s.route=a.route,s.initialData=a.initialData,s.validations=a.validations,s.cssClasses=a.cssClasses,s.slot=a.slot,s.style=a.style,s.children=a.children,(s.serverSideType!=a.serverSideType||s.id!=a.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const s=[t.component];this.component&&(this.component.children=s)}t.action!==ar.ReplaceKeepData&&(this.state={},this.data={})}if(t.state&&(this.state={...this.state,...t.state}),t.data){for(const s in t.data){const a=t.data[s]?.page;a?.pageNumber>0&&this.data[s]&&this.data[s].page.content&&(a.content?a.content=[...this.data[s].page.content,...a.content]:a.content=[...this.data[s].page.content])}this.data={...this.data,...t.data}}this.registerCustomEventListeners();const r=q.getAfterRenderHook();r&&setTimeout(()=>r(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:r,name:s})=>r.removeEventListener(s,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(r=>r.type==it.OnCustomEvent).forEach(r=>{const s=r.source==="DOCUMENT"||r.source==="COMPONENT"?document:this;s.addEventListener(r.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:s,name:r.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:r})=>t.removeEventListener(r,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}Yr([u()],bt.prototype,"state");Yr([u()],bt.prototype,"data");Yr([u()],bt.prototype,"appData");Yr([u()],bt.prototype,"appState");const Ca="mateu-recent-routes",$d=8;function _a(){try{return JSON.parse(localStorage.getItem(Ca)??"{}")}catch{return{}}}function xd(e){try{localStorage.setItem(Ca,JSON.stringify(e))}catch{}}function Ls(e){return _a()[e||"_"]??[]}function wd(e,t){if(!t?.route||!t.label)return;const r=e||"_",s=_a(),o=(s[r]??[]).filter(n=>n.route!==t.route);o.unshift({route:t.route,label:t.label}),s[r]=o.slice(0,$d),xd(s)}var kd=Object.defineProperty,Sd=Object.getOwnPropertyDescriptor,Be=(e,t,r,s)=>{for(var a=s>1?void 0:s?Sd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&kd(t,r,a),a};let he=class extends S{constructor(){super(...arguments),this.baseUrl="",this.open=!1,this.queryText="",this.dataHits=[],this.loading=!1,this.selectedIndex=0,this.fabOffset=0,this.keydownHandler=null}connectedCallback(){super.connectedCallback(),this.keydownHandler=e=>{(e.metaKey||e.ctrlKey)&&(e.key==="k"||e.key==="K")?(e.preventDefault(),this.toggle()):e.key==="Escape"&&this.open&&this.close()},document.addEventListener("keydown",this.keydownHandler),this.setupFabObserver()}disconnectedCallback(){super.disconnectedCallback(),this.keydownHandler&&document.removeEventListener("keydown",this.keydownHandler),clearTimeout(this.searchTimer),this.fabObserver?.disconnect(),this.fabObserver=void 0}setupFabObserver(){const e=this.getRootNode(),t=e instanceof ShadowRoot?e:document.body;this.measureFabStack(),this.fabObserver?.disconnect(),this.fabObserver=new MutationObserver(()=>this.measureFabStack()),this.fabObserver.observe(t,{childList:!0,subtree:!0})}measureFabStack(){const r=(this.getRootNode().querySelectorAll?.(".ai-fab, .app-fab, .page-fab").length??0)*4;r!==this.fabOffset&&(this.fabOffset=r)}updated(e){e.has("open")&&this.open&&requestAnimationFrame(()=>this.inputEl?.focus())}toggle(){this.open?this.close():this.openCenter()}openCenter(){this.open=!0,this.queryText="",this.dataHits=[],this.selectedIndex=0}close(){this.open=!1,this.queryText="",this.dataHits=[],clearTimeout(this.searchTimer)}flattenMenu(e,t){const r=[];for(const s of e??[])if(!s.separator)if(s.submenus&&s.submenus.length>0){const a=t?`${t} › ${s.label}`:s.label;r.push(...this.flattenMenu(s.submenus,a))}else s.route!==void 0&&s.route!==null&&r.push({label:s.label,breadcrumb:t,route:s.route});return r}onInput(e){this.queryText=e,this.selectedIndex=0;const t=e.trim();if(clearTimeout(this.searchTimer),!t||!this.app?.globalSearchEnabled){this.dataHits=[],this.loading=!1;return}this.loading=!0,this.searchTimer=setTimeout(()=>this.fetchGlobalSearch(t),250)}async fetchGlobalSearch(e){const t=this.app;if(!t?.globalSearchEnabled){this.loading=!1;return}try{const s=(await Tt.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","command-center",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(a=>a.data).find(a=>a&&a._globalsearch);this.dataHits=s?._globalsearch??[]}catch{this.dataHits=[]}finally{this.loading=!1}}navigateTo(e,t){wd(this.app?.serverSideType??"",{route:e,label:t}),this.close();for(const r of["route-changed","navigate-to-requested"])this.dispatchEvent(new CustomEvent(r,{detail:{route:e},bubbles:!0,composed:!0}))}askAi(){const e=this.queryText.trim();this.close(),this.dispatchEvent(new CustomEvent("mateu-open-ai",{detail:{query:e},bubbles:!0,composed:!0}))}visibleTargets(e){if(!this.queryText.trim()){const t=this.flattenMenu(this.app?.menu,"").map(s=>({route:s.route,label:s.label})),r=Ls(this.app?.serverSideType??"");return[...t,...r]}return[...e.map(t=>({route:t.route,label:t.label})),...this.dataHits.map(t=>({route:t.route,label:t.label}))]}onKeydown(e,t){if(e.key==="ArrowDown")e.preventDefault(),this.selectedIndex=Math.min(this.selectedIndex+1,t.length-1);else if(e.key==="ArrowUp")e.preventDefault(),this.selectedIndex=Math.max(this.selectedIndex-1,0);else if(e.key==="Enter"){const r=t[this.selectedIndex];r&&this.navigateTo(r.route,r.label)}}render(){return i`
            <button class="cc-fab" style="bottom: ${1.5+this.fabOffset}rem;"
                @click=${()=>this.openCenter()} title="Buscar y navegar (⌘K)" aria-label="Command center">
                ${this.fabIcon()}
            </button>
            ${this.open?this.renderOverlay():l}
        `}fabIcon(){return i`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>`}renderOverlay(){const e=this.queryText.trim().toLowerCase(),t=e?this.flattenMenu(this.app?.menu,"").filter(s=>s.label.toLowerCase().includes(e)||s.breadcrumb.toLowerCase().includes(e)):[],r=this.visibleTargets(t);return i`
            <div class="cc-backdrop" @click=${()=>this.close()}>
                <div class="cc-panel" @click=${s=>s.stopPropagation()}>
                    <div class="cc-bar">
                        <button class="cc-icon-btn" @click=${()=>this.queryText?this.onInput(""):this.close()} title="${this.queryText?"Borrar":"Cerrar"}">
                            ${this.queryText?this.backIcon():this.searchGlyph()}
                        </button>
                        <input class="cc-input" .value=${this.queryText} placeholder="Buscar pantallas, datos y acciones…"
                            @input=${s=>this.onInput(s.target.value)}
                            @keydown=${s=>this.onKeydown(s,r)}>
                        ${this.queryText?i`<button class="cc-icon-btn" @click=${()=>this.onInput("")} title="Limpiar">${this.clearIcon()}</button>`:l}
                    </div>
                    <div class="cc-body">
                        ${e?this.renderResults(t):this.renderDefault()}
                    </div>
                </div>
                <button class="cc-close" @click=${()=>this.close()} title="Cerrar">${this.clearIcon()}</button>
            </div>
        `}renderDefault(){const e=this.flattenMenu(this.app?.menu,""),t=Ls(this.app?.serverSideType??"");let r=-1;return i`
            <div class="cc-columns">
                <div class="cc-col">
                    <div class="cc-section-title">Ir a</div>
                    <div class="cc-tiles">
                        ${e.map(s=>{r++;const a=r;return i`
                            <button class="cc-tile ${a===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(s.route,s.label)}
                                @mouseenter=${()=>{this.selectedIndex=a}}>
                                <span class="cc-tile-label">${s.label}</span>
                                ${s.breadcrumb?i`<span class="cc-sub">${s.breadcrumb}</span>`:l}
                            </button>`})}
                        ${e.length===0?i`<div class="cc-empty">Sin opciones de menú.</div>`:l}
                    </div>
                </div>
                ${t.length>0?i`
                    <div class="cc-col cc-col--recent">
                        <div class="cc-section-title">Recientes</div>
                        ${t.map(s=>{r++;const a=r;return i`
                            <button class="cc-row ${a===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(s.route,s.label)}
                                @mouseenter=${()=>{this.selectedIndex=a}}>
                                <span class="cc-tile-label">${s.label}</span>
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
                ${e.map((r,s)=>i`
                    <button class="cc-row ${s===this.selectedIndex?"cc-sel":""}"
                        @click=${()=>this.navigateTo(r.route,r.label)}
                        @mouseenter=${()=>{this.selectedIndex=s}}>
                        <span class="cc-tile-label">${r.label}</span>
                        ${r.breadcrumb?i`<span class="cc-sub">${r.breadcrumb}</span>`:l}
                    </button>`)}
                ${this.renderDataHits(e.length)}
                ${t?i`<div class="cc-empty">No encontramos coincidencias para “${this.queryText.trim()}”.</div>`:l}
            </div>
        `}renderDataHits(e){if(this.dataHits.length===0)return l;let t;return i`${this.dataHits.map((r,s)=>{const a=e+s,o=r.category&&r.category!==t;return t=r.category,i`
                ${o?i`<div class="cc-section-title">${r.category}</div>`:l}
                <button class="cc-row ${a===this.selectedIndex?"cc-sel":""}"
                    @click=${()=>this.navigateTo(r.route,r.label)}
                    @mouseenter=${()=>{this.selectedIndex=a}}>
                    <span class="cc-tile-label">${r.label}</span>
                    ${r.description?i`<span class="cc-sub">${r.description}</span>`:l}
                </button>`})}`}searchGlyph(){return i`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`}backIcon(){return i`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`}clearIcon(){return i`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`}aiIcon(){return i`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 4.7L19 8.5l-4.1 2.3L12 15l-1.9-4.2L6 8.5l5.1-1.8z"></path></svg>`}};he.styles=$`
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
    `;Be([u({attribute:!1})],he.prototype,"app",2);Be([u()],he.prototype,"baseUrl",2);Be([b()],he.prototype,"open",2);Be([b()],he.prototype,"queryText",2);Be([b()],he.prototype,"dataHits",2);Be([b()],he.prototype,"loading",2);Be([b()],he.prototype,"selectedIndex",2);Be([b()],he.prototype,"fabOffset",2);Be([Pe(".cc-input")],he.prototype,"inputEl",2);he=Be([w("mateu-command-center")],he);let ze=null;function Cd(e){const t=e.component?.metadata;!!(t&&(t.commandCenterEnabled||t.chromeless)&&t.variant!=="MEDIATOR")?((!ze||!ze.isConnected)&&(ze=document.createElement("mateu-command-center"),e.renderRoot.appendChild(ze)),ze.app=t,ze.baseUrl=e.baseUrl??""):ze&&e.renderRoot.contains(ze)&&(ze.remove(),ze=null)}var _d=Object.defineProperty,Ed=Object.getOwnPropertyDescriptor,Ea=(e,t,r,s)=>{for(var a=s>1?void 0:s?Ed(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&_d(t,r,a),a};let Nr=class extends S{constructor(){super(...arguments),this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1;const t=e.detail.reason,r=t?.message??String(t);Et({text:r,variant:"error",duration:3e3,position:"bottomEnd"},this)}}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-called-event",this.fetchStarted),this.addEventListener("backend-succeeded-event",this.fetchFinished),this.addEventListener("backend-cancelled-event",this.fetchFailed),this.addEventListener("backend-failed-event",this.fetchFailed)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-succeeded-event",this.fetchStarted),this.removeEventListener("backend-succeeded-event",this.fetchFinished),this.removeEventListener("backend-cancelled-event",this.fetchFailed),this.removeEventListener("backend-failed-event",this.fetchFailed)}render(){return i`<div class="loader-container">
            <div style="display: flex; flex-direction: column;">
                <slot></slot>
                <div class="loader-frame ${this.loading?"delayed-show":""}" style="${this.loading?"pointer-events: all;":"display: none;"}"><div class="loader"></div></div>
            </div>
        </div>`}};Nr.styles=$`
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
  `;Ea([b()],Nr.prototype,"loading",2);Nr=Ea([w("mateu-api-caller")],Nr);class Id{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const xt=new Id;var Pd=Object.defineProperty,Od=Object.getOwnPropertyDescriptor,B=(e,t,r,s)=>{for(var a=s>1?void 0:s?Od(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Pd(t,r,a),a};let N=class extends bt{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this.commandPaletteDataHits=[],this.openDataHit=e=>{xt.confirmLeave()&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteDataHits=[],this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:e.route},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:e.route},bubbles:!0,composed:!0})))},this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this._openAiHandler=()=>{this.chatOpen||this.showHideIa()},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const r=this.renderRoot.querySelector?.("mateu-component");r&&r.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const r=e[t];if(r.selected)return r;const s=this.getSelectedOption(r.submenus);if(s)return s}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const r=[];for(const s of e)if(!s.separator)if(s.submenus&&s.submenus.length>0){const a=t?`${t} › ${s.label}`:s.label;r.push(...this.flattenMenuForPalette(s.submenus,a))}else r.push({label:s.label,breadcrumb:t,consumedRoute:s.consumedRoute,route:s.route,actionId:s.actionId,baseUrl:s.baseUrl,serverSideType:s.serverSideType,uriPrefix:s.uriPrefix});return r},this.handleCommandPaletteKeydown=(e,t)=>{const r=Math.min(t.length,10),s=r+Math.min(this.commandPaletteDataHits.length,8);if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,s-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){if(this.commandPaletteSelectedIndex>=r){const o=this.commandPaletteDataHits[this.commandPaletteSelectedIndex-r];o&&this.openDataHit(o);return}const a=t[this.commandPaletteSelectedIndex];a&&(this.selectRoute(a.consumedRoute,a.route,a.actionId,a.baseUrl,a.serverSideType,a.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return l;const e=this.component?.metadata;if(e?.commandCenterEnabled)return l;if(!e?.menu)return l;const t=this.flattenMenuForPalette(e.menu,""),r=this.commandPaletteQuery.toLowerCase(),s=r?t.filter(a=>a.label.toLowerCase().includes(r)||a.breadcrumb.toLowerCase().includes(r)):t;return i`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}>
                <div class="cmd-palette" @click=${a=>a.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        <span class="cmd-search-icon" aria-hidden="true">⌕</span>
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${a=>{this.commandPaletteQuery=a.target.value,this.commandPaletteSelectedIndex=0,this.fetchGlobalSearch(this.commandPaletteQuery)}}
                            @keydown=${a=>this.handleCommandPaletteKeydown(a,s)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${s.slice(0,10).map((a,o)=>i`
                            <div class="cmd-result ${o===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                @click=${()=>{this.selectRoute(a.consumedRoute,a.route,a.actionId,a.baseUrl,a.serverSideType,a.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=o}}
                            >
                                <span class="cmd-result-label">${a.label}</span>
                                ${a.breadcrumb?i`<span class="cmd-result-breadcrumb">${a.breadcrumb}</span>`:l}
                            </div>
                        `)}
                        ${r&&this.commandPaletteDataHits.length>0?i`
                            ${this.commandPaletteDataHits.slice(0,8).map((a,o)=>{const n=Math.min(s.length,10)+o,d=this.commandPaletteDataHits[o-1];return i`
                                    ${a.category&&a.category!==d?.category?i`
                                        <div class="cmd-category">${a.category}</div>`:l}
                                    <div class="cmd-result ${n===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                         @click=${()=>this.openDataHit(a)}
                                         @mouseenter=${()=>{this.commandPaletteSelectedIndex=n}}
                                    >
                                        <span class="cmd-result-label">${a.label}</span>
                                        ${a.description?i`<span class="cmd-result-breadcrumb">${a.description}</span>`:l}
                                    </div>`})}`:l}
                        ${s.length===0&&this.commandPaletteDataHits.length===0?i`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:l}
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
                ${e.icon?i`<span class="rail-icon" aria-hidden="true"></span>`:i`<div class="rail-icon-placeholder">${e.label.charAt(0).toUpperCase()}</div>`}
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
                            ${t.icon?i`<span style="font-size: 1.5rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;" aria-hidden="true">▸</span>`:l}
                            <div class="nav-tile-title">${t.label}</div>
                            ${t.description?i`<div class="nav-tile-desc">${t.description}</div>`:l}
                        </div>
                    `)}
                </div>
            </div>
        `,this.goHome=()=>{const e=this.component.metadata;this.selectRoute(e.route,"_page","",void 0,void 0,void 0)},this.selectRoute=(e,t,r,s,a,o)=>{xt.confirmLeave()&&this._selectRoute(e,t,r,s,a,o)},this._selectRoute=(e,t,r,s,a,o)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=s,this.selectedRoute=t,this.selectedServerSideType=a,this.selectedUriPrefix=o,this.instant=ke(),this.state&&this.state._route!=null&&(this.state._route=void 0);let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let d=new URL(n+t);if(e&&d.pathname.startsWith(e)){const c=d.pathname.substring(e.length);d=new URL(d.origin+(c||"/"))}if((window.location.pathname||d.pathname)&&window.location.pathname!=d.pathname){let c=d.pathname;d.search&&(c+=d.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let p=c;this.selectedUriPrefix&&(p.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?p=this.selectedUriPrefix+p.substring(1):!p.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?p=this.selectedUriPrefix+"/"+p:p=this.selectedUriPrefix+p),p=="/_page"&&(p=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:p},bubbles:!0,composed:!0}))}}},this.mapItems=(e,t)=>e.map(r=>{if(r.submenus&&r.submenus.length>0){let s=this.mapItems(r.submenus,t);return t&&r.label.toLowerCase().includes(t)&&(s=this.mapItems(r.submenus,"")),s&&s.length>0?{consumedRoute:r.consumedRoute,text:r.label,route:r.route,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix,actionId:r.actionId,selected:t||r.selected,children:s}:void 0}if(r.separator)return t?void 0:{component:"hr"};if(!t||r.label.toLowerCase().includes(t))return{consumedRoute:r.consumedRoute,text:r.label,route:r.route,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix,actionId:r.actionId,selected:t||r.selected}}).filter(r=>r!=null),this.getSelectedIndex=e=>{if(e){const t=this.getSelectedOption(e);if(t)return e.indexOf(t)}return NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?i`
                <details class="left-menu-group">
                    <summary>${e.label}</summary>
                    <div style="display: flex; flex-direction: column;">
                        ${e.submenus.map(t=>i`${this.renderOptionOnLeftMenu(t)}`)}
                    </div>
                </details>
`:i`<button class="left-menu-item"
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",ke())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?i`
            ${e.map(r=>{const s=r;return i`

                        ${s.component=="hr"?i`<hr slot="children"/>`:i`
                                <div class="side-nav-item ${s.selected?"side-nav-item--active":""}" slot="${t}">
                                    <button class="side-nav-link"
                                            @click="${()=>{s.route&&!s.children&&this.selectRoute(void 0,s.route,void 0,this.baseUrl,void 0,void 0)}}">
                                        ${s.text}
                                    </button>
                                    ${s.children?i`<div class="side-nav-children">${this.renderSideNav(s.children,"children")}</div>`:l}
                                </div>
                        `}

                            `})}`:l,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return q.mustUseShadowRoot()?super.createRenderRoot():this}fetchGlobalSearch(e){const t=this.component?.metadata;if(t?.globalSearchEnabled){if(clearTimeout(this._globalSearchTimer),!e){this.commandPaletteDataHits=[];return}this._globalSearchTimer=setTimeout(async()=>{try{const s=(await Tt.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","cmd-palette",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(a=>a.data).find(a=>a&&a._globalsearch);this.commandPaletteDataHits=s?._globalsearch??[]}catch{this.commandPaletteDataHits=[]}},250)}}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{this.component?.metadata?.commandCenterEnabled||((e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=""))},document.addEventListener("keydown",this._commandPaletteHandler),xt.install(),this.addEventListener("compact-changed",this._compactHandler),this.addEventListener("mateu-open-ai",this._openAiHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler),this.removeEventListener("mateu-open-ai",this._openAiHandler)}updated(e){if(super.updated(e),Cd(this),this.component){const r=this.component.metadata;if(r){const s=r;if(s.favicon){let a=document.querySelector("link[rel~='icon']");a||(a=document.createElement("link"),a.rel="icon",document.head.appendChild(a)),a.href=s.favicon}e.has("component")&&(this.selectedRoute=s.homeRoute,this.selectedConsumedRoute=s.homeConsumedRoute,this.selectedServerSideType=s.homeServerSideType,this.selectedBaseUrl=s.homeBaseUrl,this.selectedUriPrefix=s.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return q.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};N.styles=$`
        /* DS-neutral app chrome (replaces vaadin-app-layout / menu-bar / tabs / side-nav). */
        .m-hl { display: flex; flex-direction: row; }
        .m-vl { display: flex; flex-direction: column; }
        .m-scroll { overflow: auto; }
        .m-md { display: flex; width: 100%; height: 100%; }
        .m-md > .m-scroll { flex: 1; min-width: 0; }
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

        .menu vaadin-menu-bar-button {
            background-color: var(--lumo-base-color);
        }

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

  `;B([b()],N.prototype,"filter",2);B([b()],N.prototype,"instant",2);B([b()],N.prototype,"selectedConsumedRoute",2);B([b()],N.prototype,"selectedRoute",2);B([b()],N.prototype,"selectedUriPrefix",2);B([b()],N.prototype,"selectedBaseUrl",2);B([b()],N.prototype,"selectedServerSideType",2);B([b()],N.prototype,"selectedParams",2);B([b()],N.prototype,"tilesMenuOption",2);B([b()],N.prototype,"railOpenOption",2);B([b()],N.prototype,"commandPaletteOpen",2);B([b()],N.prototype,"commandPaletteQuery",2);B([b()],N.prototype,"commandPaletteSelectedIndex",2);B([b()],N.prototype,"commandPaletteDataHits",2);B([b()],N.prototype,"pageCompact",2);B([Pe("mateu-chat")],N.prototype,"chat",2);B([b()],N.prototype,"isDark",2);B([b()],N.prototype,"chatOpen",2);B([Pe(".mateu-app-layout")],N.prototype,"vaadinAppLayout",2);N=B([w("mateu-app")],N);var zd=Object.defineProperty,Td=Object.getOwnPropertyDescriptor,qe=(e,t,r,s)=>{for(var a=s>1?void 0:s?Td(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&zd(t,r,a),a};let me=class extends S{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",r=>{const o=r.keyCode||r.which;(o===32||o===13)&&t.click()})}}render(){return i`
       `}};me.styles=$`
  `;qe([u()],me.prototype,"message",2);qe([u()],me.prototype,"dismiss",2);qe([u()],me.prototype,"learnMore",2);qe([u()],me.prototype,"learnMoreLink",2);qe([u()],me.prototype,"showLearnMore",2);qe([u()],me.prototype,"position",2);qe([u()],me.prototype,"cookieName",2);qe([b()],me.prototype,"_css",2);qe([Pe('[aria-label="cookieconsent"]')],me.prototype,"popup",2);me=qe([w("mateu-cookie-consent")],me);var Rd=Object.defineProperty,Ld=Object.getOwnPropertyDescriptor,Ia=(e,t,r,s)=>{for(var a=s>1?void 0:s?Ld(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Rd(t,r,a),a};let Fr=class extends S{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return i`<slot></slot>`}};Fr.styles=$`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;Ia([u()],Fr.prototype,"target",2);Fr=Ia([w("mateu-event-interceptor")],Fr);var Dd=Object.defineProperty,Ad=Object.getOwnPropertyDescriptor,Pa=(e,t,r,s)=>{for(var a=s>1?void 0:s?Ad(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Dd(t,r,a),a};let jr=class extends bt{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),500)},this.onKeydown=e=>{e.key==="Escape"&&this.opened&&(e.stopPropagation(),this.close())}}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this.onKeydown)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}render(){if(!this.opened)return i``;const e=this.component.metadata,t=or(e.headerTitle,this.state,this.data,this.appState,this.appData),r=!!(t||e.header||e.closeButtonOnHeader),s=[e.width?`width:${e.width};`:"min-width:min(90vw,28rem);",e.height?`height:${e.height};`:"",e.top?`margin-top:${e.top};`:""].join("");return i`
            <div class="backdrop ${e.modeless?"modeless":""}"
                 @click="${a=>{!e.modeless&&a.target===a.currentTarget&&this.close()}}">
                <div class="dialog ${e.noPadding?"no-padding":""} ${this.component?.cssClasses??""}" style="${s} ${this.component?.style??""}">
                    ${r?i`
                        <div class="dialog-header">
                            <mateu-event-interceptor .target="${this}" style="flex:1; min-width:0;">
                                ${t?i`<span class="dialog-title">${t}</span>`:l}
                                ${e.header?k(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):l}
                            </mateu-event-interceptor>
                            ${e.closeButtonOnHeader?i`<button class="dialog-close" @click="${this.close}" aria-label="Close">✕</button>`:l}
                        </div>`:l}
                    ${e.content?i`
                        <div class="dialog-body">
                            <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width:100%;">
                                ${k(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:l}
                    ${e.footer?i`
                        <div class="dialog-footer">
                            <mateu-event-interceptor .target="${this}" style="width:100%;">
                                ${k(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}
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
    `;Pa([b()],jr.prototype,"opened",2);jr=Pa([w("mateu-dialog")],jr);var Md=Object.defineProperty,Ud=Object.getOwnPropertyDescriptor,Jr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Ud(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Md(t,r,a),a};let we=class extends bt{constructor(){super(...arguments),this.opened=!1,this.maximizeSteps=0,this.collapsed=!1,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),300)},this._escListener=e=>{if(e.key!=="Escape")return;const r=this.getRootNode().querySelectorAll("mateu-drawer, mateu-dialog");r[r.length-1]===this&&(e.stopPropagation(),this.close())}}effectiveWidth(e){if(e.width)return e.width;if(!e.size)return;const t=we.SIZE_LADDER,r=Math.max(0,t.indexOf(e.size)),s=Math.min(t.length-1,r+this.maximizeSteps);return we.SIZE_WIDTHS[t[s]]}canMaximize(e){if(!e.maximizable)return!1;const t=we.SIZE_LADDER;return Math.max(0,t.indexOf(e.size??"m"))+this.maximizeSteps<t.length-1}firstUpdated(){requestAnimationFrame(()=>this.opened=!0)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._escListener)}disconnectedCallback(){document.removeEventListener("keydown",this._escListener),super.disconnectedCallback()}render(){const e=this.component.metadata,t=e.position??"end",r=or(e.headerTitle,this.state,this.data,this.appState,this.appData),s=or(e.subtitle,this.state,this.data,this.appState,this.appData),a=this.effectiveWidth(e),o=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0;return i`
        ${e.modeless?l:i`
            <div class="backdrop ${this.opened?"open":""}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${t} ${this.opened?"open":""} ${this.collapsed?"collapsed":""} ${this.component?.cssClasses??""}"
                role="dialog"
                aria-modal="${!e.modeless}"
                aria-label="${r??l}"
                style="${a&&t!=="bottom"?`width: ${a};`:""}${this.component?.style??""}"
        >
            <header>
                ${r?i`<div class="titles"><h3>${r}</h3>${s?i`<span class="subtitle">${s}</span>`:l}</div>`:i`<span class="spacer"></span>`}
                ${e.header?i`
                    <mateu-event-interceptor .target="${this}">${k(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
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
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${k(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:l}
            </div>
            ${e.footer?i`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${k(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
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
  `;Jr([b()],we.prototype,"opened",2);Jr([b()],we.prototype,"maximizeSteps",2);Jr([b()],we.prototype,"collapsed",2);we=Jr([w("mateu-drawer")],we);var Nd=Object.defineProperty,Fd=Object.getOwnPropertyDescriptor,ie=(e,t,r,s)=>{for(var a=s>1?void 0:s?Fd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Nd(t,r,a),a};function Ds(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let W=class extends S{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,r=t.banners??[],s=t.append??!1;s?this.actionBanners=[...this.actionBanners,...r]:(this._clearActionBannerTimers(),this.actionBanners=r);const a=s?this.actionBanners.length-r.length:0;r.forEach((o,n)=>{if(o.timeoutSeconds&&o.timeoutSeconds>0){const d=a+n;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,p)=>p!==d)},o.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const r=parseInt(t[1],10)-1;r>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(r))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,r=this.shadowRoot?.querySelector("mateu-content-header");let s=r?r.getBoundingClientRect().bottom:0;for(const n of e){if(!n.classList.contains("mateu-section--sticky"))continue;const d=n.getBoundingClientRect();d.top<=s+t+2&&(s=Math.max(s,d.bottom))}const a=s+t+4;let o=0;this._tocEntries.forEach((n,d)=>{n.el.getBoundingClientRect().top<=a&&(o=d)}),this._activeToc=o}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){super.updated(e),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")&&(this._scheduleStaticBannerTimeouts(),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")},bubbles:!0,composed:!0})),this._scheduleTocRebuild())}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(r=>clearTimeout(r)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((r,s)=>{r.timeoutSeconds&&r.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,s])},r.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,r)=>r!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return Rt(e,this.state,this.data)}_renderBanner(e,t){const r=this._evalBannerText(e.title),s=this._evalBannerText(e.description);return i`
            <div class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${r||e.hasCloseButton?i`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${r??""}</span>
                        ${e.hasCloseButton?i`
                            <button class="banner-close" @click=${t} title="Dismiss" aria-label="Dismiss">✕</button>
                        `:l}
                    </div>
                `:l}
                ${s?i`<p>${s}</p>`:l}
            </div>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(".mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(o=>({title:this._sectionTitle(o),el:o})).filter(o=>!!o.title),r=this.component?.metadata?.toc,s=t.length>4&&e.every(o=>!o.closest("vaadin-horizontal-layout")),a=(r===!0?!0:r===!1?!1:s)&&t.length>0;this._tocEntries=t,this._tocVisible=a,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),a?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header");this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty("--mateu-header-h",this._headerH+"px");const t=12;let r=this._headerH+t;for(const s of this._sectionCards())s.classList.contains("mateu-section--sticky")&&(s.style.top=r+"px",r+=s.offsetHeight+t)}_scrollContainer(){let e=Ds(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=Ds(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const r=12;let s=this._headerH+r;for(const d of this._sectionCards()){if(d===t.el)break;d.classList.contains("mateu-section--sticky")&&(s+=d.offsetHeight+r)}const a=this._scrollContainer(),o=a?a.getBoundingClientRect().top:0,n=t.el.getBoundingClientRect().top-o-s;(a??window).scrollBy({top:n,behavior:"smooth"})}_showHeaderBand(){const e=this.component?.metadata,t=!!(e?.title||e?.subtitle||e?.toolbar?.length),r=!!this.component?.children?.some(s=>s.metadata?.type===h.Crud);return t&&!r&&!this._hasWelcomeBanner()}_hasWelcomeBanner(){const e=t=>t?.metadata?.type===h.HeroSection?!0:(t?.children??[]).some(e);return(this.component?.children??[]).some(e)}render(){const e=this.component?.metadata,s=[...(e?.banners??[]).map((o,n)=>({banner:o,index:n})).filter(({index:o})=>!this.dismissedStaticBannerIndices.has(o)).map(({banner:o,index:n})=>({banner:o,onDismiss:()=>this._dismissStaticBanner(n)})),...this.actionBanners.map((o,n)=>({banner:o,onDismiss:()=>this._dismissActionBanner(n)}))],a=i`
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
            ${s.length>0?i`
                <div class="page-banners">
                    ${s.map(({banner:o,onDismiss:n})=>this._renderBanner(o,n))}
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
                ${e?.footer?.map(o=>k(this,o,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return i`<div style="display: flex; flex-direction: column; width: 100%;">${a}</div>`}};W.styles=$`
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
        }

        .page-body {
            width: 100%;
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
    `;ie([u()],W.prototype,"component",2);ie([u()],W.prototype,"baseUrl",2);ie([u()],W.prototype,"state",2);ie([u()],W.prototype,"data",2);ie([u()],W.prototype,"appState",2);ie([u()],W.prototype,"appData",2);ie([u()],W.prototype,"value",2);ie([u({type:Boolean})],W.prototype,"standalone",2);ie([b()],W.prototype,"actionBanners",2);ie([b()],W.prototype,"dismissedStaticBannerIndices",2);ie([b()],W.prototype,"_tocEntries",2);ie([b()],W.prototype,"_activeToc",2);ie([b()],W.prototype,"_tocVisible",2);W=ie([w("mateu-page")],W);const Xr=$`
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
`,Jt=e=>H`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,xs=Jt(H`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),ws=Jt(H`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),ks=Jt(H`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`),jd=Jt(H`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`),Bd=Jt(H`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),qd=Jt(H`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);var Hd=Object.defineProperty,Wd=Object.getOwnPropertyDescriptor,j=(e,t,r,s)=>{for(var a=s>1?void 0:s?Wd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Hd(t,r,a),a};const As=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],Vd=e=>As[Math.abs(e??0)%As.length],Gd=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let M=class extends S{constructor(){super(...arguments),this.localAgentUrl="http://127.0.0.1:8776",this.localAgentAlive=!1,this.menu=[],this.chatSessionId=ke(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,r=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=r,this.send(new CustomEvent("submit",{detail:{value:r},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{const e=new AbortController,t=setTimeout(()=>e.abort(),1200),r=await fetch(this.localAgentUrl+"/health",{signal:e.signal});clearTimeout(t),this.localAgentAlive=r.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{const t=e.target,r=Array.from(t.files??[]);if(t.value="",!(!r.length||!this.uploadUrl)){this.uploading=!0;try{const s=new FormData;s.append("sessionId",this.chatSessionId);for(const f of r)s.append("files",f,f.name);const a={},o=localStorage.getItem("__mateu_auth_token");o&&(a.Authorization="Bearer "+o);const n=sessionStorage.getItem("__mateu_sesion_id");n&&(a["X-Session-Id"]=n);const d=await fetch(this.uploadUrl,{method:"POST",headers:a,body:s});if(!d.ok)throw new Error(`Upload failed: ${d.status}`);const p=((await d.json()).files??[]).filter(f=>f&&f.path);this.attachments=[...this.attachments,...p]}catch(s){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${s instanceof Error?s.message:s}`,"agent")}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim(),r=this.localAgentAlive?this.localAgentUrl+"/mateu/agent/stream":this.sseUrl,s=this.attachments;if(!t&&s.length===0||!r)return;const a=s.length?`${t}${t?`

`:""}📎 ${s.map(d=>d.name).join(", ")}`:t;this.addMessage(a,"user"),this.attachments=[];const o=this.addMessage("","agent");this.startLoading();let n="";try{const d={Accept:"text/event-stream","Content-Type":"application/json"},c=localStorage.getItem("__mateu_auth_token");c&&(d.Authorization="Bearer "+c);const p=sessionStorage.getItem("__mateu_sesion_id");p&&(d["X-Session-Id"]=p);const f=this.contextProvider?.(),m=JSON.stringify({message:t,sessionId:this.chatSessionId,...s.length&&{attachments:s},...f!=null&&{context:f},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const v=await fetch(r,{method:"POST",headers:d,body:m});if(!v.ok){const I=await v.text();throw new Error(`Servidor respondió ${v.status}: ${I}`)}const y=v.body?.getReader();if(!y)throw new Error("No se pudo obtener el reader del stream.");const C=new TextDecoder;let g="";for(;;){const{done:I,value:A}=await y.read();if(I){if(g.trim().startsWith("data:")){const ne=g.trim().slice(5).trim(),V=this.tryParseTokenUsage(ne),Q=!V&&this.tryParseCustomEvent(ne);V?this.tokenUsage={...this.tokenUsage,...V}:Q?Q.event==="agent-error"?(n="⚠️ "+(Q.detail?.message??"Error desconocido del agente"),this.updateMessage(o,n)):this.dispatchEvent(new CustomEvent(Q.event,{detail:Q.detail,bubbles:!0,composed:!0})):(n+=ne,this.updateMessage(o,n))}break}const ce=C.decode(A,{stream:!0});g+=ce;const X=g.split(`
`);g=X.pop()||"";let We=!1;for(const ne of X)if(ne.trim().startsWith("data:")){const V=ne.trim().slice(5).trim(),Q=this.tryParseTokenUsage(V),Z=!Q&&this.tryParseCustomEvent(V);Q?this.tokenUsage={...this.tokenUsage,...Q}:Z?Z.event==="agent-error"?(n="⚠️ "+(Z.detail?.message??"Error desconocido del agente"),this.updateMessage(o,n)):this.dispatchEvent(new CustomEvent(Z.event,{detail:Z.detail,bubbles:!0,composed:!0})):(n+=V+`
`,We=!0)}We&&this.updateMessage(o,n)}n||this.updateMessage(o,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(d){console.error("Error en el flujo SSE:",d);const c=d?.message??String(d);(c==="Failed to fetch"||c==="network error"||c==="Load failed")&&!n?this.updateMessage(o,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(o,"⚠️ Error: "+c)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback(),this.probeLocalAgent();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=r=>{console.error("Error de reconocimiento: "+r.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const r={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,r],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((r,s)=>s===e?{...r,text:t}:r),this.scrollBottom()}tryParseCustomEvent(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const r=JSON.parse(t);if(typeof r.event=="string")return{event:r.event,detail:r.detail??{}}}catch{}return null}tryParseTokenUsage(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const r=JSON.parse(t);if("inputTokens"in r||"outputTokens"in r||"totalTokens"in r)return r}catch{}return null}buildMenuContext(e,t=[]){const r=[];for(const s of e){if(s.separator||s.remote)continue;const a=[...t,s.label];if(s.submenus&&s.submenus.length>0)r.push(...this.buildMenuContext(s.submenus,a));else{const o={path:a,navigation:{route:s.route,consumedRoute:s.consumedRoute,actionId:s.actionId??"",baseUrl:s.baseUrl,serverSideType:s.serverSideType,uriPrefix:s.uriPrefix}};s.description&&(o.description=s.description),r.push(o)}}return r}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return i`
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
                        ${qd}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>i`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${Vd(e.userColorIndex)};">${Gd(e.userName)}</div>
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
                    >${Bd}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}};M.styles=[Xr,$`
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
    `];j([u({attribute:!1})],M.prototype,"contextProvider",2);j([u()],M.prototype,"localAgentUrl",2);j([u({attribute:!1})],M.prototype,"mcpUrl",2);j([b()],M.prototype,"localAgentAlive",2);j([u()],M.prototype,"sseUrl",2);j([u()],M.prototype,"uploadUrl",2);j([u({attribute:!1})],M.prototype,"menu",2);j([b()],M.prototype,"attachments",2);j([b()],M.prototype,"uploading",2);j([Pe(".file-input")],M.prototype,"fileInputElement",2);j([u({type:Boolean,reflect:!0})],M.prototype,"expanded",2);j([u()],M.prototype,"items",2);j([Pe(".scroll-container")],M.prototype,"scrollContainer",2);j([Pe(".msg-input")],M.prototype,"messageInputElement",2);j([b()],M.prototype,"recognition",2);j([b()],M.prototype,"listening",2);j([b()],M.prototype,"recognitionAvailable",2);j([b()],M.prototype,"loading",2);j([b()],M.prototype,"elapsedSeconds",2);j([b()],M.prototype,"tokenUsage",2);M=j([w("mateu-chat")],M);var Kd=Object.defineProperty,Yd=Object.getOwnPropertyDescriptor,yr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Yd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Kd(t,r,a),a};let It=class extends S{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([pe(()=>import("./vendor-chartjs.js").then(s=>s.a),[]),pe(()=>import("./vendor-chartjs.js").then(s=>s.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const r={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,r)}handleSlotChange(){}render(){return i`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};It.styles=$`
  `;yr([u()],It.prototype,"type",2);yr([u()],It.prototype,"data",2);yr([u()],It.prototype,"options",2);yr([Pe("#chart")],It.prototype,"chartElement",2);It=yr([w("mateu-chart")],It);var Jd=Object.defineProperty,Xd=Object.getOwnPropertyDescriptor,Ss=(e,t,r,s)=>{for(var a=s>1?void 0:s?Xd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Jd(t,r,a),a};let pr=class extends S{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await pe(async()=>{const{default:s}=await import("./vendor-diagrams.js").then(a=>a.i);return{default:s}},__vite__mapDeps([0,1]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const r={container:this.divElement};this.chart=new t(r),this.chart.importXML(e)}handleSlotChange(){}render(){return i`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};pr.styles=$`
  `;Ss([u()],pr.prototype,"xml",2);Ss([Pe("#canvas")],pr.prototype,"divElement",2);pr=Ss([w("mateu-bpmn")],pr);var Qd=Object.defineProperty,Zd=Object.getOwnPropertyDescriptor,Xt=(e,t,r,s)=>{for(var a=s>1?void 0:s?Zd(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Qd(t,r,a),a};const ts=160,Te=56,ec=220,Ms=110,at=60,tc={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},rc={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},sc=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function ac(){return"step-"+Math.random().toString(36).slice(2,8)}let ut=class extends S{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(n=>{t[n.id]=0});let r=!0;for(;r;)r=!1,e.forEach(n=>{if(n.preconditionStepId!=null&&t[n.preconditionStepId]!==void 0){const d=t[n.preconditionStepId]+1;d>t[n.id]&&(t[n.id]=d,r=!0)}});const s={};e.forEach(n=>{const d=t[n.id]??0;(s[d]??=[]).push(n.id)});const a={...this.positions};let o=!1;Object.entries(s).forEach(([n,d])=>{const c=Number(n);d.forEach((p,f)=>{a[p]||(a[p]={x:at+c*ec,y:at+f*Ms},o=!0)})}),o&&(this.positions=a)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(r=>r.id===e?{...r,...t}:r)},this.emit()}addStep(){const e=ac(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const r=Object.values(this.positions).map(a=>a.y),s=r.length?Math.max(...r)+Ms:at;this.positions={...this.positions,[e]:{x:at,y:s}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(s=>s.id!==e).map(s=>s.preconditionStepId===e?{...s,preconditionStepId:void 0}:s)};const{[e]:t,...r}=this.positions;this.positions=r,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const r=this.positions[t]??{x:0,y:0},s=this.toSvgPoint(e);this.dragOffset={x:s.x-r.x,y:s.y-r.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(s=>s.x))+ts+at:600,r=e.length?Math.max(...e.map(s=>s.y))+Te+at:400;return{w:Math.max(t,600),h:Math.max(r,400)}}render(){const{w:e,h:t}=this.canvasSize(),r=this.wf.steps??[];return i`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():""}
                <div class="workspace">
                    <div class="canvas-wrap">
                        <svg width="${e}" height="${t}" class="canvas"
                             @click="${s=>{s.target===s.currentTarget&&(this.selectedId=null)}}">
                            <defs>
                                <marker id="arrow" markerWidth="8" markerHeight="8"
                                        refX="6" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/>
                                </marker>
                            </defs>
                            ${r.map(s=>this.renderArrow(s))}
                            ${r.map(s=>this.renderNode(s))}
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
                    ${xs}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${ws}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${ks}
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
        `}renderArrow(e){if(!e.preconditionStepId)return H``;const t=this.positions[e.preconditionStepId],r=this.positions[e.id];if(!t||!r)return H``;const s=t.x+ts,a=t.y+Te/2,o=r.x,n=r.y+Te/2,d=(s+o)/2;return H`
            <path d="M${s},${a} C${d},${a} ${d},${n} ${o},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:at,y:at},r=tc[e.type]??"#64748b",s=rc[e.type]??"•",a=this.selectedId===e.id;return H`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${o=>this.onNodeMouseDown(o,e.id)}"
               @click="${o=>{o.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${ts}" height="${Te}" rx="8"
                      fill="white"
                      stroke="${a?r:"#e2e8f0"}"
                      stroke-width="${a?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${Te}" rx="8" fill="${r}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Te}" fill="${r}"/>
                <text x="16" y="${Te/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${s}</text>
                <!-- name -->
                <text x="44" y="${Te/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${Te/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Te/2+20}" font-size="9" fill="${r}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(s=>s.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(s=>s.id!==e.id),r=(s,a)=>i`
            <div class="field">
                <label class="field-label">${s}</label>
                ${a}
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
                        @change="${s=>this.updateStep(e.id,{name:s.target.value})}"/>`)}
                    ${r("Type",i`
                        <select class="inp" @change="${s=>this.updateStep(e.id,{type:s.target.value})}">
                            ${sc.map(s=>i`<option value="${s}" ?selected="${e.type===s}">${s}</option>`)}
                        </select>`)}
                    ${r("Description",i`<textarea class="inp" rows="2"
                        @change="${s=>this.updateStep(e.id,{description:s.target.value})}">${e.description??""}</textarea>`)}
                    ${r("Precondition step",i`
                        <select class="inp" @change="${s=>this.updateStep(e.id,{preconditionStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>i`<option value="${s.id}" ?selected="${e.preconditionStepId===s.id}">${s.name} (${s.id})</option>`)}
                        </select>`)}
                    ${r("Precondition expression",i`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??""}"
                        @change="${s=>this.updateStep(e.id,{preconditionExpression:s.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${s=>this.updateStep(e.id,{parallel:s.target.checked})}"/>
                    </div>
                    ${r("Timeout (ms)",i`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${s=>this.updateStep(e.id,{timeout:Number(s.target.value)})}"/>`)}
                    ${r("Retries",i`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${s=>this.updateStep(e.id,{retries:Number(s.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${s=>this.updateStep(e.id,{rollbackable:s.target.checked})}"/>
                    </div>
                    ${e.rollbackable?r("Compensation step",i`
                        <select class="inp" @change="${s=>this.updateStep(e.id,{compensationStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>i`<option value="${s.id}" ?selected="${e.compensationStepId===s.id}">${s.name} (${s.id})</option>`)}
                        </select>`):""}

                    ${e.type==="ACTION"?r("Topic",i`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??""}"
                        @change="${s=>this.updateStep(e.id,{topic:s.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?r("Form ID",i`<input class="inp"
                        .value="${e.formId??""}"
                        @change="${s=>this.updateStep(e.id,{formId:s.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?r("Child workflow ID",i`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??""}"
                        @change="${s=>this.updateStep(e.id,{childWorkflowDefinitionId:s.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),r=URL.createObjectURL(t),s=document.createElement("a");s.href=r,s.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(r)}};ut.styles=[Xr,$`
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
    `];Xt([u()],ut.prototype,"value",2);Xt([b()],ut.prototype,"wf",2);Xt([b()],ut.prototype,"positions",2);Xt([b()],ut.prototype,"selectedId",2);Xt([b()],ut.prototype,"showMeta",2);ut=Xt([w("mateu-workflow")],ut);var oc=Object.defineProperty,ic=Object.getOwnPropertyDescriptor,Qe=(e,t,r,s)=>{for(var a=s>1?void 0:s?ic(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&oc(t,r,a),a};const Zt=160,$e=56,ot=60,nc={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},lc={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},dc=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];let rs;const cc=()=>(rs||(rs=pe(()=>import("./vendor-diagrams.js").then(e=>e.e),__vite__mapDeps([0,1])).then(e=>new e.default)),rs);function uc(){return"step-"+Math.random().toString(36).slice(2,8)}let _e=class extends S{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.readOnly=!1,this.wf={name:"New Workflow",steps:[]},this.positions={},this.layoutReady=!1,this.selectedId=null,this.showMeta=!1,this.layoutError=null,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.elkPositioned=new Set,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.elkPositioned.add(this.draggingId),this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value"))try{const t=JSON.parse(this.value),r=new Set((this.wf.steps??[]).map(o=>o.id)),s=new Set((t.steps??[]).map(o=>o.id)),a=r.size!==s.size||[...s].some(o=>!r.has(o))||[...s].some(o=>{const n=(this.wf.steps??[]).find(c=>c.id===o),d=(t.steps??[]).find(c=>c.id===o);return n?.preconditionStepId!==d?.preconditionStepId});this.wf=t,(a||!this.layoutReady)&&this.runElkLayout()}catch{}}async runElkLayout(){const e=this.wf.steps??[];if(e.length===0){this.positions={},this.layoutReady=!0;return}const t={id:"root",layoutOptions:{"elk.algorithm":"layered","elk.direction":"RIGHT","elk.spacing.nodeNode":"40","elk.layered.spacing.nodeNodeBetweenLayers":"80","elk.edgeRouting":"ORTHOGONAL","elk.layered.nodePlacement.strategy":"BRANDES_KOEPF"},children:e.map(r=>({id:r.id,width:Zt,height:$e})),edges:e.filter(r=>r.preconditionStepId).map(r=>({id:`${r.preconditionStepId}->${r.id}`,sources:[r.preconditionStepId],targets:[r.id]}))};try{const s=await(await cc()).layout(t),a={...this.positions};for(const o of s.children??[])(!this.elkPositioned.has(o.id)||!a[o.id])&&(a[o.id]={x:(o.x??0)+ot,y:(o.y??0)+ot},this.elkPositioned.add(o.id));this.positions=a,this.layoutReady=!0,this.layoutError=null}catch(r){this.layoutError=r?.message??"ELK layout failed",this.layoutReady=!0}}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){const r=this.wf.steps.map(o=>o.id===e?{...o,...t}:o),s=this.wf.steps.find(o=>o.id===e),a=t.preconditionStepId!==void 0&&t.preconditionStepId!==s?.preconditionStepId;this.wf={...this.wf,steps:r},a&&(this.elkPositioned.clear(),this.runElkLayout()),this.emit()}addStep(){const e=uc(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const r=Object.values(this.positions).map(s=>s.x);this.positions={...this.positions,[e]:{x:r.length?Math.max(...r)+Zt+80:ot,y:ot}},this.selectedId=e,this.elkPositioned.clear(),this.runElkLayout(),this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(s=>s.id!==e).map(s=>s.preconditionStepId===e?{...s,preconditionStepId:void 0}:s)};const{[e]:t,...r}=this.positions;this.positions=r,this.elkPositioned.delete(e),this.selectedId===e&&(this.selectedId=null),this.runElkLayout(),this.emit()}onNodeMouseDown(e,t){if(this.readOnly)return;e.preventDefault(),this.draggingId=t;const r=this.positions[t]??{x:0,y:0},s=this.toSvgPoint(e);this.dragOffset={x:s.x-r.x,y:s.y-r.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}relayout(){this.elkPositioned.clear(),this.runElkLayout()}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(s=>s.x))+Zt+ot:600,r=e.length?Math.max(...e.map(s=>s.y))+$e+ot:400;return{w:Math.max(t,600),h:Math.max(r,400)}}render(){if(!this.layoutReady)return i`<div class="loading">Computing layout…</div>`;const{w:e,h:t}=this.canvasSize(),r=this.wf.steps??[];return i`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():""}
                ${this.layoutError?i`<div class="error">⚠ ${this.layoutError}</div>`:""}
                <div class="workspace">
                    <div class="canvas-wrap">
                        <svg width="${e}" height="${t}" class="canvas"
                             @click="${s=>{s.target===s.currentTarget&&(this.selectedId=null)}}">
                            <defs>
                                <marker id="arrow" markerWidth="10" markerHeight="10"
                                        refX="8" refY="3.5" orient="auto">
                                    <path d="M0,0 L0,7 L10,3.5 z" fill="#94a3b8"/>
                                </marker>
                                <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                                    <feDropShadow dx="0" dy="2" stdDeviation="3"
                                                  flood-color="#00000018"/>
                                </filter>
                            </defs>
                            ${r.map(s=>this.renderArrow(s))}
                            ${r.map(s=>this.renderNode(s))}
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
                <button class="nbtn" title="Re-run ELK layout"
                        @click="${()=>this.relayout()}">
                    ${jd}
                    Re-layout
                </button>
                ${this.readOnly?l:i`
                    <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                        ${xs}
                        Settings
                    </button>
                    <button class="nbtn primary" @click="${()=>this.addStep()}">
                        ${ws}
                        Add Step
                    </button>
                `}
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${ks}
                    Export
                </button>
            </div>
        `}renderMeta(){const e=this.wf;return i`
            <div class="meta-panel">
                <div class="meta-grid">
                    <label>Name</label>
                    <input class="inp" .value="${e.name}"
                           @change="${t=>this.updateWf({name:t.target.value})}"/>
                    <label>Description</label>
                    <textarea class="inp" rows="2"
                              @change="${t=>this.updateWf({description:t.target.value})}">${e.description??""}</textarea>
                    <label>Status</label>
                    <select class="inp"
                            @change="${t=>this.updateWf({status:t.target.value})}">
                        ${["DRAFT","ACTIVE","DISABLED","ARCHIVED"].map(t=>i`
                            <option value="${t}" ?selected="${e.status===t}">${t}</option>`)}
                    </select>
                    <label>Limit concurrent</label>
                    <input type="checkbox" ?checked="${e.limitConcurrentExecutions}"
                           @change="${t=>this.updateWf({limitConcurrentExecutions:t.target.checked})}"/>
                    ${e.limitConcurrentExecutions?i`
                        <label>Max concurrent</label>
                        <input class="inp" type="number" min="0"
                               .value="${String(e.maxConcurrentExecutions??0)}"
                               @change="${t=>this.updateWf({maxConcurrentExecutions:Number(t.target.value)})}"/>
                        <label>Enqueue on limit</label>
                        <input type="checkbox" ?checked="${e.enqueueOnLimit}"
                               @change="${t=>this.updateWf({enqueueOnLimit:t.target.checked})}"/>
                    `:""}
                </div>
            </div>
        `}renderArrow(e){if(!e.preconditionStepId)return H``;const t=this.positions[e.preconditionStepId],r=this.positions[e.id];if(!t||!r)return H``;const s=t.x+Zt,a=t.y+$e/2,o=r.x,n=r.y+$e/2,d=(s+o)/2;return H`
            <path d="M${s},${a} C${d},${a} ${d},${n} ${o},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:ot,y:ot},r=nc[e.type]??"#64748b",s=lc[e.type]??"•",a=this.selectedId===e.id,o=e.name.length>16?e.name.slice(0,15)+"…":e.name;return H`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${n=>this.onNodeMouseDown(n,e.id)}"
               @click="${n=>{n.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Zt}" height="${$e}" rx="8"
                      fill="white"
                      stroke="${a?r:"#e2e8f0"}"
                      stroke-width="${a?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge strip -->
                <rect x="0" y="0" width="32" height="${$e}" rx="8"
                      fill="${r}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${$e}" fill="${r}"/>
                <text x="16" y="${$e/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${s}</text>
                <!-- labels -->
                <text x="44" y="${$e/2-6}" font-size="11"
                      fill="#1e293b" font-weight="600">${o}</text>
                <text x="44" y="${$e/2+8}" font-size="9"
                      fill="#94a3b8">${e.id}</text>
                <text x="44" y="${$e/2+20}" font-size="9"
                      fill="${r}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(a=>a.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(a=>a.id!==e.id),r=this.readOnly,s=(a,o)=>i`
            <div class="field">
                <label class="field-label">${a}</label>
                ${o}
            </div>
        `;return i`
            <div class="properties">
                <div class="prop-header">
                    <span>Step Properties</span>
                    ${r?l:i`<button class="del-btn" title="Delete step"
                            @click="${()=>this.deleteStep(e.id)}">🗑</button>`}
                    <button class="close-btn"
                            @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${s("ID",i`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${s("Name",i`<input class="inp" ?readonly="${r}" .value="${e.name}"
                        @change="${r?l:a=>this.updateStep(e.id,{name:a.target.value})}"/>`)}
                    ${s("Type",i`
                        <select class="inp" ?disabled="${r}"
                                @change="${r?l:a=>this.updateStep(e.id,{type:a.target.value})}">
                            ${dc.map(a=>i`
                                <option value="${a}" ?selected="${e.type===a}">${a}</option>`)}
                        </select>`)}
                    ${s("Description",i`<textarea class="inp" rows="2" ?readonly="${r}"
                        @change="${r?l:a=>this.updateStep(e.id,{description:a.target.value})}">${e.description??""}</textarea>`)}
                    ${s("Precondition step",i`
                        <select class="inp" ?disabled="${r}"
                                @change="${r?l:a=>this.updateStep(e.id,{preconditionStepId:a.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(a=>i`
                                <option value="${a.id}" ?selected="${e.preconditionStepId===a.id}">
                                    ${a.name} (${a.id})
                                </option>`)}
                        </select>`)}
                    ${s("Precondition expression",i`
                        <input class="inp" placeholder="JEXL expression" ?readonly="${r}"
                               .value="${e.preconditionExpression??""}"
                               @change="${r?l:a=>this.updateStep(e.id,{preconditionExpression:a.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}" ?disabled="${r}"
                               @change="${r?l:a=>this.updateStep(e.id,{parallel:a.target.checked})}"/>
                    </div>
                    ${s("Timeout (ms)",i`
                        <input class="inp" type="number" min="0" ?readonly="${r}"
                               .value="${String(e.timeout??0)}"
                               @change="${r?l:a=>this.updateStep(e.id,{timeout:Number(a.target.value)})}"/>`)}
                    ${s("Retries",i`
                        <input class="inp" type="number" min="0" ?readonly="${r}"
                               .value="${String(e.retries??0)}"
                               @change="${r?l:a=>this.updateStep(e.id,{retries:Number(a.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}" ?disabled="${r}"
                               @change="${r?l:a=>this.updateStep(e.id,{rollbackable:a.target.checked})}"/>
                    </div>
                    ${e.rollbackable?s("Compensation step",i`
                        <select class="inp" ?disabled="${r}"
                                @change="${r?l:a=>this.updateStep(e.id,{compensationStepId:a.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(a=>i`
                                <option value="${a.id}" ?selected="${e.compensationStepId===a.id}">
                                    ${a.name} (${a.id})
                                </option>`)}
                        </select>`):""}
                    ${e.type==="ACTION"?s("Topic",i`
                        <input class="inp" placeholder="kafka.topic.name" ?readonly="${r}"
                               .value="${e.topic??""}"
                               @change="${r?l:a=>this.updateStep(e.id,{topic:a.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?s("Form ID",i`
                        <input class="inp" ?readonly="${r}" .value="${e.formId??""}"
                               @change="${r?l:a=>this.updateStep(e.id,{formId:a.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?s("Child workflow ID",i`
                        <input class="inp" ?readonly="${r}" .value="${e.childWorkflowDefinitionId??""}"
                               @change="${r?l:a=>this.updateStep(e.id,{childWorkflowDefinitionId:a.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),r=URL.createObjectURL(t),s=document.createElement("a");s.href=r,s.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(r)}};_e.styles=[Xr,$`
        :host {display: block; height: 100%; font-family: var(--lumo-font-family, sans-serif);}

        .root {display: flex; flex-direction: column; height: 100%; background: var(--lumo-base-color, #fff);}

        .loading {
            display: flex; align-items: center; justify-content: center;
            height: 100%; color: #94a3b8; font-size: .9rem;
        }
        .error {
            padding: .4rem 1rem; background: #fee2e2; color: #991b1b;
            font-size: .8rem; flex-shrink: 0;
        }

        /* toolbar */
        .toolbar {
            display: flex; align-items: center; gap: .5rem;
            padding: .5rem 1rem; flex-shrink: 0;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
        }
        .wf-name {font-weight: 600; font-size: 1rem; color: var(--lumo-body-text-color, #1e293b);}
        .badge {
            font-size: .7rem; font-weight: 600; padding: .15rem .5rem;
            border-radius: 9999px; text-transform: uppercase; letter-spacing: .04em;
        }
        .badge-draft    {background: #e2e8f0; color: #475569;}
        .badge-active   {background: #dcfce7; color: #166534;}
        .badge-disabled {background: #fef9c3; color: #854d0e;}
        .badge-archived {background: #fee2e2; color: #991b1b;}

        /* meta */
        .meta-panel {
            padding: .75rem 1rem; flex-shrink: 0;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            background: var(--lumo-contrast-5pct, #f8fafc);
        }
        .meta-grid {display: grid; grid-template-columns: 120px 1fr; gap: .4rem .75rem; align-items: start;}
        .meta-grid label {font-size: .8rem; color: #64748b; padding-top: .3rem;}

        /* workspace */
        .workspace {display: flex; flex: 1; overflow: hidden;}
        .canvas-wrap {flex: 1; overflow: auto; background: #f8fafc;}
        .canvas {display: block;}

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
        .prop-header span {flex: 1;}
        .del-btn, .close-btn {
            background: none; border: none; cursor: pointer;
            font-size: .95rem; padding: .1rem .3rem; border-radius: 4px; line-height: 1;
        }
        .del-btn:hover {background: #fee2e2;}
        .close-btn:hover {background: #f1f5f9;}
        .prop-body {flex: 1; overflow-y: auto; padding: .75rem; display: flex; flex-direction: column; gap: .6rem;}

        /* fields */
        .field {display: flex; flex-direction: column; gap: .2rem;}
        .field.row {flex-direction: row; align-items: center; gap: .5rem;}
        .field-label {font-size: .75rem; color: #64748b; font-weight: 500;}
        .inp {
            width: 100%; box-sizing: border-box;
            padding: .3rem .5rem; border: 1px solid #e2e8f0; border-radius: 6px;
            font-size: .82rem; color: #1e293b; background: #fff;
            outline: none; font-family: inherit; transition: border-color .15s;
        }
        .inp:focus {border-color: #3B82F6;}
        textarea.inp {resize: vertical;}
        input[readonly].inp {background: #f8fafc; color: #94a3b8;}
    `];Qe([u()],_e.prototype,"value",2);Qe([u({type:Boolean})],_e.prototype,"readOnly",2);Qe([b()],_e.prototype,"wf",2);Qe([b()],_e.prototype,"positions",2);Qe([b()],_e.prototype,"layoutReady",2);Qe([b()],_e.prototype,"selectedId",2);Qe([b()],_e.prototype,"showMeta",2);Qe([b()],_e.prototype,"layoutError",2);_e=Qe([w("mateu-workflow-elk")],_e);var pc=Object.defineProperty,hc=Object.getOwnPropertyDescriptor,$r=(e,t,r,s)=>{for(var a=s>1?void 0:s?hc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&pc(t,r,a),a};const mc=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],fc=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],vc={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function Us(){return"field-"+Math.random().toString(36).slice(2,8)}let Pt=class extends S{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=Ga.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:r,newIndex:s}=t;if(r===void 0||s===void 0||r===s)return;const a=[...this.form.fields],[o]=a.splice(r,1);a.splice(s,0,o),this.form={...this.form,fields:a},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(r=>r.id===e?{...r,...t}:r)},this.emit()}addField(){const e=Us(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(o=>o.id===e);if(!t)return;const r={...t,id:Us(),label:t.label+" (copy)"},s=this.form.fields.findIndex(o=>o.id===e),a=[...this.form.fields];a.splice(s+1,0,r),this.form={...this.form,fields:a},this.selectedId=r.id,this.emit()}render(){return i`
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
                    ${xs}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${ws}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${ks}
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
                        @click="${s=>{s.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${s=>{s.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){const e=this.form.fields.find(r=>r.id===this.selectedId);if(!e)return l;const t=(r,s)=>i`
            <div class="prop-field">
                <label class="prop-label">${r}</label>
                ${s}
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
                            ${mc.map(r=>i`
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
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),r=URL.createObjectURL(t),s=document.createElement("a");s.href=r,s.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",s.click(),URL.revokeObjectURL(r)}};Pt.styles=[Xr,$`
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
    `];$r([u()],Pt.prototype,"value",2);$r([b()],Pt.prototype,"form",2);$r([b()],Pt.prototype,"selectedId",2);$r([b()],Pt.prototype,"showMeta",2);Pt=$r([w("mateu-form-editor")],Pt);var bc=Object.defineProperty,gc=Object.getOwnPropertyDescriptor,He=(e,t,r,s)=>{for(var a=s>1?void 0:s?gc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&bc(t,r,a),a};let fe=class extends S{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return i`
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
    `;He([u()],fe.prototype,"appState",2);He([u()],fe.prototype,"appData",2);He([b()],fe.prototype,"open",2);He([b()],fe.prototype,"activeTab",2);He([b()],fe.prototype,"hoveredTag",2);He([b()],fe.prototype,"hoveredId",2);He([b()],fe.prototype,"hoveredState",2);He([b()],fe.prototype,"hoveredData",2);He([b()],fe.prototype,"hoveredMeta",2);fe=He([w("mateu-debug-overlay")],fe);var xe=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(xe||{}),Oa=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(Oa||{}),za=(e=>(e.Continue="Continue",e.Stop="Stop",e))(za||{}),yc=Object.defineProperty,$c=Object.getOwnPropertyDescriptor,Qr=(e,t,r,s)=>{for(var a=s>1?void 0:s?$c(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&yc(t,r,a),a};let er=null,qt=class extends bt{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,r=this.data,s=this.appState,a=this.appData,o=this.component,n=C=>Js(C,t,r,{appState:s,appData:a,component:o}),d=C=>Ys(C,t,r,s,a,{component:o}),c=["state","data","appState","appData","component"],p=[t,r,s,a,o],f={...this.state},m={...this.data};let v=!1,y=!1;for(let C=0;C<e.length;C++){const g=e[C];try{if(n(g.filter)){if(xe.SetStateValue==g.action||xe.SetDataValue==g.action){const I=xe.SetStateValue==g.action?f:m,A=g.fieldName.split(",");for(let ce=0;ce<A.length;ce++){const X=A[ce];if(!I[X]||I[X]!=g.value){const We=g.expression?d(g.expression):g.value,ne=Oa.none==g.fieldAttribute?X:X+"."+g.fieldAttribute;We!=I[ne]&&(I[ne]=We,xe.SetStateValue==g.action&&(v=!0),xe.SetDataValue==g.action&&(y=!0))}}}if(xe.RunAction==g.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:g.actionId},bubbles:!0,composed:!0})),xe.RunJS==g.action&&new Function(...c,g.value)(...p),xe.SetAttributeValue==g.action){const I=g.expression?n(g.expression):g.value;if(g.fieldAttribute=="disabled"){I?this.shadowRoot?.getElementById(g.fieldName)?.setAttribute(g.fieldAttribute,"disabled"):this.shadowRoot?.getElementById(g.fieldName)?.removeAttribute(g.fieldAttribute);continue}this.shadowRoot?.getElementById(g.fieldName)?.setAttribute(g.fieldAttribute,I)}if(xe.SetCssClass==g.action&&this.shadowRoot?.getElementById(g.fieldName)?.setAttribute("class",g.value),xe.SetStyle==g.action&&this.shadowRoot?.getElementById(g.fieldName)?.style.setProperty(g.expression,g.value),za.Stop==g.result)break}}catch(I){console.error("rule failed",g,I)}}v&&(this.state=f),y&&(this.data=m),v&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,r=this.component.validations;let s=!0,a=!1;const o=this.data??{},n={...this.data??{},errors:{}};if(r){for(let d=0;d<r.length;d++){const c=r[d];if(this.skipValidation(t,c))continue;const p=(c.fieldId??"_component").split(",");for(let f=0;f<p.length;f++){const m=p[f];n.errors[m]=[]}}for(let d=0;d<r.length;d++){const c=r[d];if(!this.skipValidation(t,c))try{const p=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!p){s=!1;const m=(c.fieldId??"_component").split(",");for(let v=0;v<m.length;v++){const y=m[v];let C=n.errors[y];if(C||(n.errors[y]=[]),C=n.errors[y],!o[y]){let g=c.message;try{g=this._evalTemplate(c.message)}catch{}C.push(g)}}}}catch(p){console.error("validation failed",c,p)}}for(let d=0;d<r.length;d++){const c=r[d];if(this.skipValidation(t,c))continue;const p=(c.fieldId??"_component").split(",");for(let f=0;f<p.length;f++){const m=p[f];if(o.errors?[m].join(","):n.errors==""&&[m].join(",")){a=!0;break}}}(o.errors?["_component"].join(","):n.errors==""&&["_component"].join(","))&&(a=!0)}n._valid=s,n._valid!=o._valid&&(a=!0),a&&(this.data=n)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,r={};t.fieldIds.forEach(s=>{r[s]=void 0}),r.searchText=void 0,this.state={...this.state,...r}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,r={};r[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...r})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const r={...this.state};r[t.fieldId]=t.value,this.state=r,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const s=this.component;s.triggers?.filter(a=>a.type==it.OnValueChange).filter(a=>!a.propertyName||t.fieldId==a.propertyName).forEach(a=>{(!a.condition||this._evalExpr(a.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId},bubbles:!0,composed:!0}))}),s.triggers?.filter(a=>a.type==it.AutoSave).forEach(a=>{const o=a.actionId,n=this._autoSaveTimers.get(o);n!==void 0&&clearTimeout(n),this._autoSaveTimers.set(o,setTimeout(()=>{this._autoSaveTimers.delete(o),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId},bubbles:!0,composed:!0}))},a.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail;if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation();const r=this.component,s=r.actions?.find(a=>a.id==t.actionId||a.id.endsWith("*")&&t.actionId.startsWith(a.id.replace("*","")));if(s){if(s&&s.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(s&&s.validationRequired){const o=er??this;if(er=null,o.checkValidations(s.fieldsToValidate),!o.data._valid){o.notifyValidationErrors();return}}er=null;const a={...t,initiatorComponentId:this.id};s&&s.confirmationRequired?this.callAfterConfirmation(s,()=>this.requestActionCallToServerOrBubble(a,r,s)):this.requestActionCallToServerOrBubble(a,r,s)}else{const a={...t.parameters};a.initiatorState||(a.initiatorState=this.state),er||(er=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,parameters:a},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=r=>{if(r)for(const s of r){const a=s.metadata;if(a?.type===h.FormField){const o=a;o.fieldId&&o.label&&(e[o.fieldId]=o.label)}t(s.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),r=[];if(Object.entries(e).forEach(([a,o])=>{if(!Array.isArray(o))return;const n=a==="_component"?void 0:t[a]??a;o.forEach(d=>{d&&!r.some(c=>c.label===n&&c.msg===d)&&r.push({label:n,msg:d})})}),r.length===0){this.notify("There are validation errors");return}const s=`There are validation errors
`+r.map(({label:a,msg:o})=>a?`• ${a}: ${o}`:`• ${o}`).join(`
`);Et({text:s,variant:"error",position:"bottomEnd",duration:Math.max(3e3,1500+r.length*1e3)},this)},this.notify=e=>{Et({text:e,variant:"error",position:"bottomEnd",duration:3e3},this)},this.callAfterConfirmation=(e,t)=>{let r="One moment, please",s="Are you sure?",a="Yes",o="No";e.confirmationTexts&&(r=e.confirmationTexts.title,s=e.confirmationTexts.message,a=e.confirmationTexts.confirmationText,o=e.confirmationTexts.denialText);const n=document.createElement("div");n.style.cssText="position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);padding:1rem;";const d=document.createElement("div");d.style.cssText="background:var(--lumo-base-color,#fff);color:var(--lumo-body-text-color,#1a1a1a);border-radius:var(--lumo-border-radius-l,12px);box-shadow:var(--lumo-box-shadow-xl,0 12px 40px rgba(0,0,0,.3));padding:1.2rem;max-width:min(90vw,26rem);";const c=()=>{n.parentElement&&document.body.removeChild(n)},p="font:inherit;font-weight:600;padding:.45rem 1rem;border-radius:var(--lumo-border-radius-m,6px);cursor:pointer;";Na(i`
            <h3 style="margin:0 0 .5rem;">${r}</h3>
            <div style="margin-bottom:1.2rem;">${s}</div>
            <div style="display:flex;justify-content:flex-end;gap:.5rem;">
                <button style="${p}border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.25));background:var(--lumo-base-color,#fff);"
                        @click="${()=>c()}">${o}</button>
                <button style="${p}border:none;background:var(--lumo-primary-color,#1676f3);color:var(--lumo-primary-contrast-color,#fff);"
                        @click="${()=>{c(),t()}}">${a}</button>
            </div>
        `,d),n.appendChild(d),n.addEventListener("click",f=>{f.target===n&&c()}),document.body.appendChild(n)},this.requestActionCallToServerOrBubble=(e,t,r)=>{if(r&&r.bubble){const s={...e.parameters};s.initiatorState||(s.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,parameters:s},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,r)},this.requestActionCallToServer=(e,t,r)=>{if(r&&r.href){window.location.href=r.href;return}if(r&&r.js)try{new Function("state","data","appState","appData","component",r.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(s){console.error("when evaluating "+r.js,s,this.component,this.state,this.data)}if(r&&r.customEvent&&this.dispatchEvent(new CustomEvent(r.customEvent.name,{detail:r.customEvent.detail,bubbles:!0,composed:!0})),!(r&&(r.js||r.customEvent))){if(e.actionId=="search"){const s=e.parameters?._searchState;s?this.state={...this.state,...s}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:r?.background,sse:r?.sse,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(s=>s.type==it.OnSuccess).filter(s=>e.detail.actionId==s.calledActionId).forEach(s=>{if(!s.condition||this._evalExpr(s.condition))if(e.preventDefault(),e.stopPropagation(),s.timeoutMillis>0){const a=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId,callbackToken:a},bubbles:!0,composed:!0}))},s.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(s=>s.type==it.OnError).filter(s=>e.detail.actionId==s.calledActionId).forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0})))})},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const r of t.actions??[]){const s=r.shortcut||(r.runOnEnter?"enter":null);if(s&&this._shortcutMatchesEvent(s,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return q.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}_shortcutMatchesEvent(e,t){return yi(e,t)}_collectShortcutTabs(){const e=this.renderRoot;if(!e)return[];const t=Array.from(e.querySelectorAll("vaadin-tab[data-shortcut]"));return e.querySelectorAll("mateu-drawer, mateu-dialog").forEach(r=>{const s=r.shadowRoot;s&&t.push(...Array.from(s.querySelectorAll("vaadin-tab[data-shortcut]")))}),t}_handleTabShortcut(e){const t=this._collectShortcutTabs();if(t.length===0)return!1;for(const r of Array.from(t)){const s=r.dataset.shortcut;if(!s||!this._shortcutMatchesEvent(s,e))continue;const a=r.closest("vaadin-tabs");if(!a)continue;const o=Array.from(a.querySelectorAll("vaadin-tab")).indexOf(r);if(!(o<0))return e.preventDefault(),a.selected=o,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),document.removeEventListener("keydown",this._keydownListener)}render(){return i`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?i`
                <div><ul>${this.data.errors._component.map(e=>i`<li>${e}</li>`)}</ul></div>
            `:l}</div>`}_render(){if(this.component?.type==K.ClientSide){const e=this.component;return e.metadata?.type==h.Page?as(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==h.Crud?os(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):q.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return i`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==K.ClientSide){const t=e;if(t.metadata?.type==h.Page)return as(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==h.Crud)return os(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return k(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};qt.styles=$`
        :host {
        }

        ${Ua(hr.cssText)}
        
        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }
        
  `;Qr([u()],qt.prototype,"baseUrl",2);Qr([u()],qt.prototype,"route",2);Qr([u()],qt.prototype,"consumedRoute",2);qt=Qr([w("mateu-component")],qt);const Ns=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}};class xc{async handle(t,r){return await t.runAction(r.baseUrl,r.route,r.consumedRoute,r.actionId,r.initiatorComponentId,r.appState,r.serverSideType,r.componentState,r.parameters,r.initiator,r.background)}}const wc=new xc;class kc{constructor(){this.handleUIIncrement=(t,r,s)=>{if(t?.fragments?.forEach(a=>{$t.next({command:void 0,fragment:a,ui:void 0,error:void 0,callbackToken:s})}),t?.appState&&(G.value={...t.appState},r.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const a=t?.appData;Cr.value={...t.appData,...a},r.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(a=>{Et({text:a.text,position:a.position,variant:a.variant,duration:a.duration,undoLabel:a.undoLabel,undoActionId:a.undoActionId,undoParameters:a.undoParameters},r)}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(a=>{$t.next({command:a,fragment:void 0,ui:void 0,error:void 0,callbackToken:s})})}}async runAction(t,r,s,a,o,n,d,c,p,f,m,v,y,C,g){try{const I=await wc.handle(t,{baseUrl:r,route:s,consumedRoute:a,actionId:o,appState:G.value,initiatorComponentId:n,componentState:p,parameters:f,serverSideType:c,initiator:m,background:v});y&&y(I),C||this.handleUIIncrement(I,m,g),I.messages&&I.messages.length==1&&I.messages[0].variant=="error"&&m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:o},bubbles:!0,composed:!0})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:o,evevntId:ke()},bubbles:!0,composed:!0}))}catch(I){console.warn("Action request failed",I),m.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:o,reason:this.serialize(I)}})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:o},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const Sc=new kc,Cc=Sc;class _c{constructor(){this.handleUIIncrement=(t,r,s)=>{if(t?.messages?.forEach(a=>{Et({text:a.text,position:a.position,variant:a.variant,duration:a.duration,undoLabel:a.undoLabel,undoActionId:a.undoActionId,undoParameters:a.undoParameters},r)}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(a=>{$t.next({command:a,fragment:void 0,ui:void 0,error:void 0,callbackToken:s})}),t?.fragments?.forEach(a=>{$t.next({command:void 0,fragment:a,ui:void 0,error:void 0,callbackToken:s})}),t?.appState&&(G.value={...t.appState},r.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const a=t?.appData;Cr.value={...t.appData,...a},r.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,r,s,a,o,n,d,c,p,f,m,v,y,C,g){if(s){s=s||"_no_route",s&&s.startsWith("/")&&(s=s.substring(1));const I={serverSideType:c,appState:G.value,componentState:p,parameters:f,initiatorComponentId:n,consumedRoute:a,route:"/"+s,actionId:o};v||m.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),fetch(r+"/mateu/v3/sse/"+s,{method:"POST",headers:{Accept:"text/event-stream","Content-Type":"application/json"},body:JSON.stringify(I)}).then(async A=>{const ce=A.body?.pipeThrough(new TextDecoderStream).getReader();if(ce){let X="";for(;;){const{value:We,done:ne}=await ce.read();if(ne)break;X+=We;const V=X.split(`

`);X=V.pop()??"";for(const Q of V){const Z=Q.trim();if(Z)if(Z.startsWith("data:")){const ue=JSON.parse(Z.substring(5).trim());y&&y(ue),C||this.handleUIIncrement(ue,m,g),ue.messages&&ue.messages.length==1&&ue.messages[0].variant=="error"&&m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:o},bubbles:!0,composed:!0}))}else{let ue=Z;try{const x=JSON.parse(Z);ue=x.message,x._embedded?.errors?.length>0&&x._embedded.errors[0].message&&(ue=x._embedded.errors[0].message)}catch{}throw new Error(ue)}}}}v||m.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:o}})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:o},bubbles:!0,composed:!0}))}).catch(A=>{m.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:o,reason:this.serialize(A)}})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:o},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}}const Ta=new _c,Ec={fixed:"fixed",fullWidth:"full",edgeToEdge:"edge"},Ic=new Set([h.Gantt,h.PlanningBoard,h.Kanban,h.Bpmn,h.Workflow,h.WorkflowElk,h.Map]),Pc={landing:"fixed",form:"fixed",process:"fixed"},Ra=e=>e?Ec[e]:void 0,Ot=e=>e.type==K.ClientSide?e.metadata:void 0,La=e=>{const t=Ot(e);if(t?.type==h.Page){const r=Ra(t.pageWidth);if(r)return r}for(const r of e.children??[]){const s=La(r);if(s)return s}},Da=e=>{const t=e.pageType;if(t)return t;const r=s=>{const a=Ot(s);if(a?.type==h.Page&&a.pageType)return a.pageType;for(const o of s.children??[]){const n=r(o);if(n)return n}};return r(e)},Oc=e=>{const t=Ot(e);if(t?.type!=h.Crud)return!1;const r=t;return r.compact?!0:(r.columns??[]).some(s=>s.metadata?.editable)},Br=(e,t)=>t(e)||(e.children??[]).some(r=>Br(r,t)),zc=e=>!!e&&Br(e,t=>Ot(t)?.type==h.HeroSection),Tc=e=>Ot(e)?.type==h.App?!0:(e.children??[]).some(t=>Ot(t)?.type==h.App),Rc=(e,t)=>{if(!e)return"fixed";const r=Ra(e.pageWidth)??La(e);if(r)return r;if(t?.top&&Tc(e))return"edge";const s=Pc[Da(e)??""];return s||(Br(e,a=>{const o=Ot(a)?.type;return o!=null&&Ic.has(o)})?"edge":Br(e,Oc)?"full":"fixed")};var Lc=Object.defineProperty,Dc=Object.getOwnPropertyDescriptor,de=(e,t,r,s)=>{for(var a=s>1?void 0:s?Dc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Lc(t,r,a),a};let J=class extends Hr{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:K.ClientSide,metadata:{type:h.Element,name:"div",content:"Not found"},id:"fieldId"},action:ar.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let r=Cc;t.sse&&(r=Ta),r.runAction(Tt,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken)}},this.getCustomisedAppState=()=>{let e={...G.value};if(this.overrides){const t=Ns(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return q.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.overridesParsed=Ns(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(r=>r==="appState"||r==="appData")){const r=this.renderRoot.querySelector("mateu-component");if(r)return e.has("appState")&&(r.appState=this.appState),e.has("appData")&&(r.appData=this.appData),!1}return!0}updated(e){(e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&(this.preventNavigation||(this.callbackToken=this.instant||ke(),this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,componentState:this.initialState,callbackToken:this.callbackToken},bubbles:!0,composed:!0})))),e.has("route")&&this.top&&(this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}this.fragment=e,e.component&&(this.dataset.pageWidth=Rc(e.component,{top:this.top}),this.dataset.pageType=Da(e.component)??"",this.dataset.hasWelcomeBanner=String(zc(e.component)))}render(){return i`
           ${this.fragment?.component?k(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):l}
       `}};J.styles=$`
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
  `;de([u()],J.prototype,"consumedRoute",2);de([u()],J.prototype,"serverSideType",2);de([u()],J.prototype,"uriPrefix",2);de([u()],J.prototype,"overrides",2);de([u()],J.prototype,"homeRoute",2);de([u()],J.prototype,"route",2);de([u()],J.prototype,"top",2);de([u()],J.prototype,"instant",2);de([u()],J.prototype,"initialState",2);de([u()],J.prototype,"appState",2);de([u()],J.prototype,"appData",2);de([b()],J.prototype,"fragment",2);J=de([w("mateu-ux")],J);function Ac(e){const t="var(--lumo-space-m, 1rem)",r={left:"50%",transform:"translateX(-50%)"};switch(e){case"topStart":return{top:t,left:t};case"topCenter":return{top:t,...r};case"topEnd":return{top:t,right:t};case"topStretch":return{top:t,left:t,right:t};case"middle":return{top:"50%",left:"50%",transform:"translate(-50%, -50%)"};case"bottomStart":return{bottom:t,left:t};case"bottomCenter":return{bottom:t,...r};case"bottomStretch":return{bottom:t,left:t,right:t};default:return{bottom:t,right:t}}}function Mc(e){switch(e){case"success":return{bg:"var(--lumo-success-color, #2e7d32)",fg:"#fff"};case"error":return{bg:"var(--lumo-error-color, #c62828)",fg:"#fff"};case"warning":return{bg:"var(--lumo-warning-color, #f9a825)",fg:"#1a1a1a"};case"contrast":return{bg:"var(--lumo-contrast-90pct, #1a1a1a)",fg:"#fff"};default:return{bg:"var(--lumo-base-color, #fff)",fg:"var(--lumo-body-text-color, #1a1a1a)"}}}const Uc={show(e,t){const{bg:r,fg:s}=Mc(e.variant),a=Ac(e.position),o=document.createElement("div");o.setAttribute("role","status"),Object.assign(o.style,{position:"fixed",zIndex:"2000",display:"flex",alignItems:"center",gap:"0.75rem",maxWidth:"min(90vw, 28rem)",padding:"0.7rem 1rem",borderRadius:"var(--lumo-border-radius-m, 8px)",boxShadow:"var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,0.2))",background:r,color:s,font:"inherit",fontSize:"var(--lumo-font-size-s, 0.875rem)",opacity:"0",transition:"opacity 0.2s ease",...a});const n=document.createElement("span");n.textContent=e.text,o.appendChild(n);const d=()=>{o.style.opacity="0",setTimeout(()=>o.remove(),200)};if(e.undoActionId){const p=document.createElement("button");p.textContent=e.undoLabel??"Undo",p.style.cssText="margin-left: 0.25rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;",p.addEventListener("click",()=>{t.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0})),d()}),o.appendChild(p)}document.body.appendChild(o),requestAnimationFrame(()=>{o.style.opacity="1"});const c=e.duration??(e.undoActionId?1e4:5e3);c>0&&setTimeout(d,c)}};function Nc(){pd(Uc)}var Fc=Object.defineProperty,jc=Object.getOwnPropertyDescriptor,Ze=(e,t,r,s)=>{for(var a=s>1?void 0:s?jc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Fc(t,r,a),a};Nc();let Ee=class extends S{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,r=this.baseUrl??"";!t||t.startsWith("/")?r=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,r.indexOf("://")<0&&(r.startsWith("/")||(r="/"+r),r=window.location.origin+r)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),r.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let s=new URL(r+t);if((window.location.pathname||s.pathname)&&window.location.pathname!=s.pathname){let a=s.pathname;s.search&&(a+=s.search),a&&!a.startsWith("/")&&(a="/"+a),window.history.pushState({},"",a),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),xt.markClean(),e instanceof CustomEvent){let t=e.detail.route;const r=this.renderRoot.querySelector("mateu-ux");r&&(r.setAttribute("route",t),r.setAttribute("instant",ke()))}}}createRenderRoot(){return q.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),xt.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!xt.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;this.loadUrl(t)},this.top=="true"?this.loadUrl(window):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);G.value={...G.value,...e}}catch{G.value={...G.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=ke(),this._lastUrl=e.location.href,e.location.search){const r=new URLSearchParams(e.location.search).get("overrides");if(r&&(this.config=r,this.config))try{const s=JSON.parse(this.config);G.value={...G.value,...s}}catch{G.value={...G.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,r=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(r)?t.substring(r.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return i`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${Cr.value}"
                          .appState="${G.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?i`
               <mateu-debug-overlay
                   .appState="${G.value}"
                   .appData="${Cr.value}"
               ></mateu-debug-overlay>
           `:l}
       `}};Ee.styles=$`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;Ze([u()],Ee.prototype,"baseUrl",2);Ze([u()],Ee.prototype,"route",2);Ze([u()],Ee.prototype,"consumedRoute",2);Ze([u()],Ee.prototype,"config",2);Ze([u()],Ee.prototype,"top",2);Ze([u()],Ee.prototype,"pathPrefix",2);Ze([b()],Ee.prototype,"instant",2);Ze([u({type:Boolean})],Ee.prototype,"debug",2);Ee=Ze([w("mateu-ui")],Ee);var Bc=Object.defineProperty,qc=Object.getOwnPropertyDescriptor,At=(e,t,r,s)=>{for(var a=s>1?void 0:s?qc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Bc(t,r,a),a};let Ie=class extends S{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.searchText=""}connectedCallback(){super.connectedCallback(),ro()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(ds()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"—";const t=(this.searchedOptions??this.selector.options)?.find(s=>String(s.value)===e);if(t)return t.label;const r=Gs()[this.selector.fieldName];return r!==void 0?String(r):e}pick(e,t){to(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText="",this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector("input.picker-search")?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){const e=this.app;if(e?.serverSideType)try{const t=await Tt.runAction(this.baseUrl??"",e.rootRoute??e.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(const r of t?.fragments??[]){const o=r.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(o)){this.searchedOptions=o.map(n=>({value:n.value,label:n.label??String(n.value)}));return}}}catch{}}visibleOptions(){const e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(r=>r.label.toLowerCase().includes(t)):e}renderPanel(){const e=this.currentValue(),t=this.visibleOptions(),r=this.searchText!==""||t.length>Ie.SEARCHABLE_THRESHOLD;return i`
            <div class="panel">
                ${r?i`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${s=>{s.key==="Escape"&&this.closePanel()}}"/>`:l}
                <div class="options">
                    ${e?i`
                        <div class="option option--clear" @click="${()=>this.pick("")}">— (clear)</div>`:l}
                    ${t.map(s=>i`
                        <div class="option ${e===String(s.value)?"option--selected":""}"
                             @click="${()=>this.pick(s.value,s.label)}">${s.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?i`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():l}
            </label>`:i``}};Ie.SEARCHABLE_THRESHOLD=7;Ie.styles=$`
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
    `;At([u()],Ie.prototype,"selector",2);At([u()],Ie.prototype,"app",2);At([u()],Ie.prototype,"baseUrl",2);At([b()],Ie.prototype,"opened",2);At([b()],Ie.prototype,"searchText",2);At([b()],Ie.prototype,"searchedOptions",2);Ie=At([w("mateu-app-context-picker")],Ie);var Hc=Object.defineProperty,Wc=Object.getOwnPropertyDescriptor,xr=(e,t,r,s)=>{for(var a=s>1?void 0:s?Wc(t,r):t,o=e.length-1,n;o>=0;o--)(n=e[o])&&(a=(s?n(t,r,a):n(a))||a);return s&&a&&Hc(t,r,a),a};let zt=class extends S{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){const r=this.app;if(r?.serverSideType)try{const s=await Tt.runAction(this.baseUrl??"",r.rootRoute??r.initialRoute??"","",e,"notification-bell",void 0,r.serverSideType,{},t,this,!0);for(const a of s?.fragments??[]){const n=a.data?._notifications;if(Array.isArray(n)){this.notifications=n;return}}}catch{}}refresh(){return this.runNotificationsAction("_notifications-list",{})}markRead(e){return this.runNotificationsAction("_notifications-read",{ids:e})}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);const t=e.route;if(t){if(!xt.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return i`
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
            </div>`}};zt.styles=$`
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
    `;xr([u()],zt.prototype,"app",2);xr([u()],zt.prototype,"baseUrl",2);xr([b()],zt.prototype,"opened",2);xr([b()],zt.prototype,"notifications",2);zt=xr([w("mateu-notification-bell")],zt);const Aa=e=>{if(!e||!("querySelectorAll"in e))return null;for(const t of e.querySelectorAll("*")){if(t.tagName?.toLowerCase()==="mateu-component")return t;const r=Aa(t.shadowRoot);if(r)return r}return null},Vc=async(e,t,r)=>{const s=t.renderRoot??t,a=Aa(s);await Ta.runAction(Tt,t.baseUrl??"",e.rootRoute||"_no_route","",r,a?.id??"app-header-action",{},e.serverSideType??"",{},{},a??t,!0,void 0,!1,"")},Fs=async(e,t,r)=>{try{await Vc(e,t,r)}catch(s){Et({text:"La acción falló: "+s,position:"bottomStart",duration:6e3,variant:"error"},t)}},tr=(e,t)=>{const r=e.contextSelectors??[],s=e.contextActions??[];return r.length===0&&s.length===0&&!e.notificationsEnabled?l:i`${e.notificationsEnabled?i`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-notification-bell>`:l}${r.map(a=>i`
        <mateu-app-context-picker .selector="${a}" .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-app-context-picker>`)}${s.map(a=>(a.children?.length??0)>0?i`
        <details class="app-nav-group" style="margin-left: 0.5rem; flex-shrink: 0;">
            <summary class="app-action-btn primary">${a.label}</summary>
            <div class="app-nav-dropdown">
                ${a.children.map(o=>i`<button class="app-nav-item" @click="${()=>o.actionId&&Fs(e,t,o.actionId)}">${o.label}</button>`)}
            </div>
        </details>`:i`
        <button class="app-action-btn primary" style="margin-left: 0.5rem; flex-shrink: 0;"
            @click="${()=>a.actionId&&Fs(e,t,a.actionId)}" title="${a.label}">${a.label}</button>`)}`},js=(e,t,r="")=>i`
    <div class="app-nav ${r}">
        ${e.map(s=>s.children&&s.children.length?i`
            <details class="app-nav-group">
                <summary class="app-nav-item">${s.text}</summary>
                <div class="app-nav-dropdown">
                    ${s.children.map(a=>i`
                        <button class="app-nav-item" @click="${()=>t(a)}">${a.text}</button>`)}
                </div>
            </details>`:i`
            <button class="app-nav-item ${s.checked?"active":""}" @click="${()=>t(s)}">${s.text}</button>`)}
    </div>`,Bs=(e,t)=>r=>t.call(e,{detail:{value:r}}),Sr=(e,t)=>e.themeToggle?i`
        <button class="app-icon-btn" @click="${t.toggleTheme}"
            title="${t.isDark?"Switch to light mode":"Switch to dark mode"}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">${t.isDark?"☀":"🌙"}</button>
    `:l,Gc=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},qs=(e,t,r)=>{const s=Ve(e,t,r),a=te(t,r);return s=="list"||s==a?"new":s},Ve=(e,t,r)=>{const s=e?._route;if(s!=null&&(s===""||s.startsWith("/"))){const a=r.homeRoute??"",o=a.indexOf("?"),n=o>=0?a.substring(o+1):"",d=te(t,r)+s;if(!n)return d;const c=d.indexOf("?")>=0?"&":"?";return d+c+n}return t.selectedRoute?t.selectedRoute:r.homeRoute},te=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,Re=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,Le=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,De=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,Kc=(e,t,r,s,a,o,n)=>{if(t.chromeless)return i`
            <div class="app chromeless">
                <div class="${"app-content"+(e.pageCompact?" no-padding":"")}" style="height: 100%;">
                    <div class="m-md">
                        <div class="m-scroll" style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${Ve(s,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${Re(e,t)}"
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
                        ${t.sseUrl?i`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                    </div>
                </div>
                <slot></slot>
            </div>
        `;const d=e.mapItems(t.menu,e.filter?.toLowerCase()??""),c=te(e,t),p=qs(s,e,t),f=p&&p!=="new"&&p.startsWith(c+"/")?p.substring(c.length+1).split("/")[0]:void 0;return i`
                    ${t.variant==Ge.MEDIATOR?i`

                        ${t.layout=="SPLIT"?i`
                            <div class="m-md">
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${te(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Re(e,t)}"
                                            consumedRoute="${te(e,t)}"
                                            serverSideType="${Le(e,t)}"
                                            uriPrefix="${De(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...o,_splitDetailId:f}}"
                                            .appData="${n}"
                                            instant="${c}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${qs(s,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${Re(e,t)}"
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
                                        route="${Ve(s,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${Re(e,t)}"
                                        consumedRoute="${te(e,t)}"
                                        serverSideType="${Le(e,t)}"
                                        uriPrefix="${De(e,t)}"
                                        style="width: 100%;"
                                        .appState="${o}"
                                        .appData="${n}"
                                        .initialState="${s}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:l}
            ${t.variant==Ge.HAMBURGUER_MENU?i`
                <div class="mateu-app-layout m-app-layout ${t.drawerClosed?"":"drawer-open"} ${t?.cssClasses}" style="${t?.style}">
                    <header class="app-navbar">
                        <button class="drawer-toggle" title="Menu"
                                @click="${m=>m.target.closest(".m-app-layout")?.classList.toggle("drawer-open")}">☰</button>
                        <h2 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; margin: 0 .5rem;">${t.title}</h2><p style="margin: 0;">${t.subtitle}</p>
                        <div class="m-hl" style="margin-left: auto; align-items: center;">
                            <slot name="widgets"></slot>
                            ${tr(t,e)}${Sr(t,e)}
                        </div>
                    </header>
                    <div class="app-body">
                        <aside class="app-drawer p-s" @navigation-requested="${e.updateRoute}">
                            ${t.menu&&t.totalMenuOptions>10?i`
                                <input class="drawer-search" placeholder="⌕ Search…" style="width: calc(100% - 20px); margin: 0 10px;"
                                       @input="${m=>Gc({detail:{value:m.target.value}},e)}">
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
                                                route="${Ve(s,e,t)}"
                                                id="ux_${e.id}"
                                                baseUrl="${Re(e,t)}"
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
                                ${t.sseUrl?i`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                            </div>
                        </div>
                    </div>
                </div>

            `:l}
            
            ${t.variant==Ge.MENU_ON_TOP?i`
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
                        ${js(d,Bs(e,e.itemSelected),"menu-on-top")}
                        <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${tr(t,e)}${Sr(t,e)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ve(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Re(e,t)}"
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
                            ${t.sseUrl?i`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                    </div>
                </div>

            `:l}

            ${t.variant==Ge.TILES?i`
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
                        ${js(e.mapItemsForTiles(t.menu),Bs(e,e.itemSelectedTiles),"menu-on-top")}
                        <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${tr(t,e)}${Sr(t,e)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):i`
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ve(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Re(e,t)}"
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
                            ${t.sseUrl?i`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                        `}
                    </div>
                </div>
            `:l}

            ${t.variant==Ge.RAIL?i`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):l}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ve(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Re(e,t)}"
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
                            ${t.sseUrl?i`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                    </div>
                </div>
            `:l}

            ${t.variant==Ge.MENU_ON_LEFT?i`

                <div class="m-hl">
                    <div class="m-scroll" style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <div class="m-vl"
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(m=>e.renderOptionOnLeftMenu(m))}
                            ${tr(t,e)}${Sr(t,e)}
                        </div>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ve(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Re(e,t)}"
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
                            ${t.sseUrl?i`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                    </div>
                </div>


            `:l}

            ${t.variant==Ge.TABS?i`
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
                            <div class="app-tabs" style="flex-grow: 1; min-width: 0;">
                                ${t.menu.map((m,v)=>i`
                                <button class="app-tab ${v===e.getSelectedIndex(t.menu)?"active":""}"
                                        @click="${()=>e.selectRoute(m.consumedRoute,m.route,m.actionId,m.baseUrl,m.serverSideType,m.uriPrefix)}"
                                >${m.label}</button>`)}
                            </div>
                            <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${tr(t,e)}
                            </div>
                        </div>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${Ve(s,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Re(e,t)}"
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
                            ${t.sseUrl?i`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:o,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                    </div>
                </div>
            
            `:l}

            ${t.fabs?.map((m,v)=>i`
                <button class="app-fab" style="bottom: ${(t.sseUrl?5.5:1.5)+v*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(m.actionId)}"
                    title="${m.label}">
                    <span aria-hidden="true">+</span>
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?i`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    <span aria-hidden="true">💬</span>
                </button>
            `:l}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},Yc=(e,t)=>t!=null&&e!=null&&!e.has(t),Jc=typeof HTMLElement<"u"?HTMLElement:class{};class Xc extends Jc{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",r=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",Xc);const Hs=new Set,Qc=(e,t,r)=>{const s=`${r}/${t}`;return Hs.has(s)||(Hs.add(s),console.warn(`[mateu] Component type "${t}" is not supported by the "${r}" renderer — rendering <mateu-unsupported> placeholder.`)),i`<mateu-unsupported
            type="${t}"
            renderer="${r}"
            data-component-id="${e?.id??l}"
            slot="${e?.slot??l}"
    ></mateu-unsupported>`};class Zc{renderFilterBar(t,r,s,a,o,n,d,c){const p=r?.metadata,f=v=>{const{fieldId:y,value:C}=v.detail;t.state={...t.state,[y]:C}},m=v=>{const{fieldIds:y}=v.detail,C={};y.forEach(g=>{C[g]=void 0}),C.searchText=void 0,t.state={...t.state,...C}};return i`
            <mateu-filter-bar
                .metadata="${p}"
                @search-requested="${t.search}"
                @value-changed="${f}"
                @filter-reset-requested="${m}"
                .state="${t.state}"
                .data="${o}"
                .appState="${n}"
                .appData="${d}"
                ?searchOnly="${c??!1}"
            >
                ${p?.header?.map(v=>k(t,v,s,a,o,n,d))}
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
        `}renderTableComponent(t,r,s,a,o,n,d){const c=t.data?.[t.id]?.page?.content??[];return ss(r,c,a[r?.id]?.emptyStateMessage)}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,r,s,a,o,n,d,c){const p=r?.metadata?.type??r?.type,f=Object.values(h).includes(p)?p:void 0;return Yc(this.supportedClientSideTypes(),f)?Qc(r,f,this.rendererName()):$s(t,r,s,a,o,n,d,c)}renderAppComponent(t,r,s,a,o,n,d){return Kc(t,r?.metadata,s,a,o,n,d)}}function eu(e){const t=window.__mateuArrayDataProvider;return t?new t(e.map(r=>({value:r.value,label:r.label})),{keyAttributes:"value"}):void 0}function tu(e,t,r,s,a,o,n,d){const c=t.metadata,p=s,f=p&&c.fieldId in p?p[c.fieldId]:c.initialValue,m=f==null?"":String(f),v=(A,ce)=>{A==null||String(A)===m||ce?.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:c.fieldId,value:A},bubbles:!0,composed:!0}))},y=c.label||c.fieldId,C=d||!c.label?"none":"top",g=t.slot??l;return c.readOnly||c.stereotype==="plainText"?i`<div class="mateu-rw-field-plain" slot=${g}>${m}</div>`:c.options?.length?i`<oj-c-select-single
      class="mateu-rw-field"
      slot=${g}
      label-hint=${y}
      label-edge=${C}
      item-text="label"
      .data=${eu(c.options)}
      .value=${m}
      ?disabled=${!!c.disabled}
      @valueChanged=${A=>v(A.detail?.value,A.currentTarget)}
    ></oj-c-select-single>`:c.dataType==="integer"||c.dataType==="number"||c.dataType==="double"||c.dataType==="money"?i`<oj-c-input-number
      class="mateu-rw-field"
      slot=${g}
      label-hint=${y}
      label-edge=${C}
      .value=${f==null?l:Number(f)}
      ?disabled=${!!c.disabled}
      @valueChanged=${A=>v(A.detail?.value,A.currentTarget)}
    ></oj-c-input-number>`:i`<oj-c-input-text
    class="mateu-rw-field"
    slot=${g}
    label-hint=${y}
    label-edge=${C}
    .value=${m}
    ?disabled=${!!c.disabled}
    @valueChanged=${A=>v(A.detail?.value,A.currentTarget)}
  ></oj-c-input-text>`}function ru(e,t,r){const s=e.metadata,a=Rt(s.label??"",t,r),o=s.buttonStyle==="primary"?"callToAction":s.buttonStyle==="tertiary"?"borderless":"outlined",n=d=>d.currentTarget?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId,parameters:s.parameters},bubbles:!0,composed:!0}));return i`<oj-c-button
    id=${e.id??l}
    slot=${e.slot??l}
    label=${a}
    chroming=${o}
    ?disabled=${!!s.disabled}
    @ojAction=${n}
  ></oj-c-button>`}const Cs=(e,t,r,s,a,o,n)=>(t.children??[]).map(d=>k(e,d,r,s,a,o,n));function su(e,t,r,s,a,o,n){const d=t.metadata,c=d.columns&&d.columns>0?`repeat(${d.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return i`<div
    style="display:grid; grid-template-columns:${c}; gap:1rem; padding:1rem; align-items:start; width:100%; box-sizing:border-box;"
  >
    ${Cs(e,t,r,s,a,o,n)}
  </div>`}function au(e,t,r,s,a,o,n){return i`<div class="mateu-rw-scoreboard" style="grid-column:1 / -1;">
    ${Cs(e,t,r,s,a,o,n)}
  </div>`}function ou(e,t,r,s,a,o,n){const d=t.metadata,c=[];return d.colSpan&&d.colSpan>1&&c.push(`grid-column: span ${d.colSpan}`),d.rowSpan&&d.rowSpan>1&&c.push(`grid-row: span ${d.rowSpan}`),i`<oj-sp-dashboard-panel
    class="mateu-rw-panel"
    .panelTitle=${d.title??""}
    .panelSubtitle=${d.subtitle??""}
    style=${c.length?c.join("; "):l}
    >${Cs(e,t,r,s,a,o,n)}</oj-sp-dashboard-panel
  >`}function iu(e,t){const r=t.metadata,s=`${r.value??""}${r.unit?" "+r.unit:""}`,a=r.trendLabel||r.description||"",o=r.trend==="up"?"success":r.trend==="down"?"danger":"neutral",n=`flex:1 1 12rem; min-width:12rem;${r.actionId?" cursor:pointer;":""}`,d=r.actionId?c=>c.currentTarget?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:{}},bubbles:!0,composed:!0})):void 0;return i`<oj-sp-scoreboard-metric-card
    style=${n}
    .cardTitle=${r.title??""}
    .metricText=${s}
    .metaText=${a}
    .trendColor=${o}
    @click=${d}
  ></oj-sp-scoreboard-metric-card>`}function nu(e,t){const r=t.metadata,s=r.badges??[],a=r.facts??[];return i`<div class="mateu-rw-entity-header">
    <div class="rw-eh-top">
      <div class="rw-eh-titles">
        <h1 class="rw-eh-title">${r.title??""}</h1>
        ${r.subtitle?i`<div class="rw-eh-subtitle">${r.subtitle}</div>`:l}
        ${s.length?i`<div class="rw-eh-badges">
              ${s.map(o=>i`<span class="rw-eh-chip rw-eh-chip--${o.color||"neutral"}">${o.label??""}</span>`)}
            </div>`:l}
      </div>
      ${r.metricValue?i`<div class="rw-eh-metric">
            <div class="rw-eh-metric-value">${r.metricValue}</div>
            ${r.metricLabel?i`<div class="rw-eh-metric-label">${r.metricLabel}</div>`:l}
            ${r.metricCaption?i`<div class="rw-eh-metric-caption">${r.metricCaption}</div>`:l}
          </div>`:l}
    </div>
    ${a.length?i`<div class="rw-eh-facts">
          ${a.map(o=>i`<div class="rw-eh-fact">
              <div class="rw-eh-fact-label">${o.label??""}</div>
              <div class="rw-eh-fact-value">${o.value??""}</div>
            </div>`)}
        </div>`:l}
  </div>`}function lu(e,t,r,s,a,o,n){const d=t.metadata,c=p=>p?k(e,p,r,s,a,o,n):l;return i`<div class="mateu-rw-card ${t.cssClasses||""}" style=${t.style||l}>
    ${d.header?i`<div class="rw-card-header">${c(d.header)}</div>`:l}
    ${d.title?i`<div class="rw-card-title">${c(d.title)}</div>`:l}
    ${d.subtitle?i`<div class="rw-card-subtitle">${c(d.subtitle)}</div>`:l}
    ${c(d.media)}
    ${d.content?i`<div class="rw-card-content">${c(d.content)}</div>`:l}
    ${d.footer?i`<div class="rw-card-footer">${c(d.footer)}</div>`:l}
  </div>`}class du extends qa{constructor(t){if(super(t),t.type!==Ha.ELEMENT)throw new Error("applyOj can only be used on an element binding")}render(t){return l}update(t,[r]){const s=t.element;for(const[a,o]of Object.entries(r.props??{}))o!==void 0&&(s[a]=o);for(const[a,o]of Object.entries(r.attrs??{}))o===void 0?s.removeAttribute(a):s.setAttribute(a,o);return l}}const cu=Ba(du);function ns(e,t){const r=ja(e);return Fa`<${r} ${cu({props:t.props,attrs:t.attrs})}>${t.children??l}</${r}>`}function uu(e,t,r,s,a,o,n){const d=t.metadata,c=t.children??[],p=c.find(y=>y.slot==="overview"),f=d.panels??[],m=y=>y?k(e,y,r,s,a,o,n):l,v=f.findIndex(y=>y.open!==!1);return ns("oj-sp-foldout-layout",{props:{orientation:d.orientation==="horizontal"?"horizontal":"vertical",selectedPanel:v>=0?v:0},attrs:{class:t.cssClasses||void 0,style:`min-height: 32rem; ${t.style||""}`},children:i`
      ${p?i`<div slot="overview">${m(p)}</div>`:l}
      ${f.map((y,C)=>ns("oj-sp-foldout-panel-summarizing",{props:{panelTitle:y.title??""},children:i`
            <div>${m(c.find(g=>g.slot===`panel-${C}`))}</div>
            ${y.subtitle?i`<div slot="summary">${y.subtitle}</div>`:l}
          `}))}
    `})}function pu(e,t,r,s,a,o,n){const d=t.metadata,c=t.children??[];return ns("oj-sp-welcome-page",{props:{pageTitle:d.title??"",descriptionText:d.subtitle??"",illustrationBackground:d.image??void 0},attrs:{"display-options.responsive-padding":"on",class:t.cssClasses||void 0,style:t.style||void 0},children:c.length?i`<div class="oj-flex oj-sm-flex-wrap oj-sm-align-items-center" style="gap: 0.75rem;">
          ${c.map(p=>k(e,p,r,s,a,o,n))}
        </div>`:l})}const hu={[h.FormField]:(e,t,r,s,a,o,n,d)=>tu(e,t,r,s,a,o,n,d),[h.Button]:(e,t,r,s,a)=>ru(t,s,a),[h.DashboardLayout]:(e,t,r,s,a,o,n)=>su(e,t,r,s,a,o,n),[h.Scoreboard]:(e,t,r,s,a,o,n)=>au(e,t,r,s,a,o,n),[h.DashboardPanel]:(e,t,r,s,a,o,n)=>ou(e,t,r,s,a,o,n),[h.MetricCard]:(e,t)=>iu(e,t),[h.EntityHeader]:(e,t)=>nu(e,t),[h.Card]:(e,t,r,s,a,o,n)=>lu(e,t,r,s,a,o,n),[h.FoldoutLayout]:(e,t,r,s,a,o,n)=>uu(e,t,r,s,a,o,n),[h.HeroSection]:(e,t,r,s,a,o,n)=>pu(e,t,r,s,a,o,n)};class mu extends Zc{rendererName(){return"redwood"}renderClientSideComponent(t,r,s,a,o,n,d,c){const p=r?.metadata?.type??r?.type,f=Object.values(h).includes(p)?p:void 0,m=f?hu[f]:void 0;return m&&r?m(t,r,s,a,o,n,d,c):super.renderClientSideComponent(t,r,s,a,o,n,d,c)}}q.set(new mu);q.setUseShadowRoot(!1);
