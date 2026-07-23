const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-diagrams.js","assets/vendor.js","assets/vendor-ui5.js","assets/vendor-vaadin.js","assets/vendor-lit.js"])))=>i.map(i=>d[i]);
import{r as qs,f as Ms,m as Ns,o as Us,a as js,b as Bs,c as Vs,s as Hs,d as Ws,e as Gs,t as Ks,u as Ys,g as Js,_ as me,v as Xs,n as Qs,h as At,i as Zs,j as eo,k as Ei,l as Pi,N as Ga,p as kr,q as Ti,w as to}from"./vendor-vaadin.js";import{a as $,j as p,k as de,i as C,x as o,m as k,A as l,p as ye,q as b,l as E,c as X,r as ao,D as zi}from"./vendor-lit.js";import{S as ro,a as io,n as xe,b as so}from"./vendor.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const n of s.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&r(n)}).observe(document,{childList:!0,subtree:!0});function a(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=a(i);fetch(i.href,s)}})();qs("vaadin-card",$`
      :host(.mateu-section) {
        --vaadin-card-border-width: 0 !important;
        --vaadin-card-background: transparent !important;
        --vaadin-card-shadow: none !important;
        --vaadin-card-padding: 0 !important;
      }
    `);const Oi=document.createElement("style");Oi.innerHTML=`
${Ms.cssText}
${Ns.cssText}
${Us.cssText}
${js.cssText}
${Bs.cssText}
${Vs.cssText}
${Hs.cssText}
${Ws.cssText}
${Gs.cssText}
${Ks.cssText}
${Ys.cssText}
${Js.cssText}
`;document.body.appendChild(Oi);{const e=window.Vaadin;e&&((e.featureFlags??={}).masterDetailLayoutComponent=!0)}const Dt=new ro,G={value:{}},wa={value:{}},kt=$`
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
`,oo={lon:0,lat:0},ti=3,no=e=>{if(!e)return;const t=e.split(",").map(i=>i.trim());if(t.length!==2)return;const a=Number(t[0]),r=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(a)||!Number.isFinite(r)))return{lon:r,lat:a}},lo=e=>{if(e==null||e.trim()==="")return ti;const t=Number(e);return Number.isFinite(t)?t:ti};var co=Object.defineProperty,uo=Object.getOwnPropertyDescriptor,cr=(e,t,a,r)=>{for(var i=r>1?void 0:r?uo(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&co(t,a,i),i};let ia=class extends C{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:a},{default:r},{default:i},{fromLonLat:s},{default:n}]=await Promise.all([me(()=>import("./vendor-ol.js").then(c=>c.M),[]),me(()=>import("./vendor-ol.js").then(c=>c.V),[]),me(()=>import("./vendor-ol.js").then(c=>c.T),[]),me(()=>import("./vendor-ol.js").then(c=>c.O),[]),me(()=>import("./vendor-ol.js").then(c=>c.p),[]),me(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=n,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const d=no(this.position)??oo;this.map=new t({target:this.mapElement,layers:[new r({source:new i})],view:new a({center:s([d.lon,d.lat]),zoom:lo(this.zoom)})})}render(){return o`<div id="map"></div>`}};ia.styles=$`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;cr([p()],ia.prototype,"position",2);cr([p()],ia.prototype,"zoom",2);cr([de("#map")],ia.prototype,"mapElement",2);ia=cr([k("mateu-map")],ia);const po=typeof HTMLElement<"u"?HTMLElement:class{};class ho extends po{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#a()}attributeChangedCallback(t,a,r){this.content=r??void 0}connectedCallback(){this.style.display="block",this.#a()}async#a(){if(!this.isConnected)return;const t=this.#e??"",a=++this.#t,[{marked:r},{default:i}]=await Promise.all([me(()=>import("./vendor.js").then(s=>s.f),[]),me(()=>import("./vendor.js").then(s=>s.c),[])]);a===this.#t&&(this.innerHTML=i.sanitize(await r.parse(t),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:s=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",ho);var W=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(W||{}),h=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Drawer="Drawer",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.FoldoutLayout="FoldoutLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e.PlanningBoard="PlanningBoard",e.Kanban="Kanban",e.Timeline="Timeline",e.ProgressSteps="ProgressSteps",e.Stat="Stat",e.Calendar="Calendar",e.PricingTable="PricingTable",e.OrgChart="OrgChart",e.Heatmap="Heatmap",e.Funnel="Funnel",e.TrendChart="TrendChart",e.FeatureGrid="FeatureGrid",e.Testimonials="Testimonials",e.Faq="Faq",e.CalloutCard="CalloutCard",e.CommentThread="CommentThread",e.FileList="FileList",e.Checklist="Checklist",e.ComparisonCard="ComparisonCard",e.EntityHeader="EntityHeader",e.Meter="Meter",e.TaskProgress="TaskProgress",e.StatusList="StatusList",e.BulletedList="BulletedList",e.Separator="Separator",e.Notice="Notice",e.TaskQueue="TaskQueue",e.ResourceGrid="ResourceGrid",e.OfferCard="OfferCard",e.AddOnPicker="AddOnPicker",e.Ledger="Ledger",e.PaymentPicker="PaymentPicker",e.ProcessMonitor="ProcessMonitor",e))(h||{});const qr="mateu-app-context",Ri="mateu-app-context-labels",Li=e=>{try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}},ai=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},Mr=()=>Li(qr),Ai=()=>Li(Ri),mo=(e,t,a)=>{const r=Mr(),i=Ai();t==null||t===""?(delete r[e],delete i[e]):(r[e]=t,a!==void 0&&(i[e]=a)),ai(qr,r),ai(Ri,i)};let ri=!1;const vo=()=>{ri||(ri=!0,window.addEventListener("storage",e=>{e.key===qr&&e.newValue!==e.oldValue&&window.location.reload()}))},fo=(e,t)=>new Promise((a,r)=>{let i=!1;const s={retry:()=>{i||(i=!0,t().then(a,r))},giveUp:()=>{i||(i=!0,r(e))}},n=new CustomEvent("mateu-session-expired",{detail:s,cancelable:!0,bubbles:!1});typeof document<"u"&&!document.dispatchEvent(n)||s.giveUp()}),bo=(e,t)=>e.includes("json")?!0:t!==null&&typeof t=="object",go=(e,t)=>{const a=e.finalUrl;if(!a)return;const r=typeof window<"u"?window.location.href:void 0;let i;try{i=new URL(e.requestedUrl,r).href}catch{return}if(i!==a&&!bo(e.contentType??"",e.data))return a};class yo{constructor(){this.windowMs=4e3,this.threshold=12,this.events=[],this.reported=new Set}check(t,a=Date.now()){this.events.push({sig:t,t:a});const r=a-this.windowMs;this.events=this.events.filter(s=>s.t>=r);let i=0;for(const s of this.events)s.sig===t&&i++;if(i>=this.threshold){const s=!this.reported.has(t);return this.reported.add(t),{blocked:!0,firstTrip:s}}return this.reported.delete(t),{blocked:!1,firstTrip:!1}}reset(){this.events=[],this.reported.clear()}configure(t){t.windowMs!==void 0&&(this.windowMs=t.windowMs),t.threshold!==void 0&&(this.threshold=t.threshold)}}const $o=new yo;let ra=[];class xo{constructor(){this.axiosInstance=io.create({timeout:6e4}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t)),this.axiosInstance.interceptors.response.use(t=>{const a=go({requestedUrl:this.axiosInstance.getUri(t.config),finalUrl:t.request?.responseURL,contentType:String(t.headers?.["content-type"]??""),data:t.data});if(a)throw window.location.assign(a),Object.assign(new Error("session lost — redirecting to "+a),{code:"ERR_CANCELED"});return t},t=>{const a=t;if(a?.response?.status===401&&a.config&&!a.config.__mateuRetried){const r=a.config;return r.__mateuRetried=!0,fo(t,()=>this.axiosInstance.request(r))}throw t})}addSessionId(t){let a=sessionStorage.getItem("__mateu_sesion_id");a||(a=xe(),sessionStorage.setItem("__mateu_sesion_id",a)),t.headers["X-Session-Id"]=a}addAuthToken(t){const a=localStorage.getItem("__mateu_auth_token");a&&(t.headers.Authorization="Bearer "+a)}async wrap(t,a,r,i){return r||a.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t.then(s=>(a.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:i}})),s)).catch(s=>{throw s?.code=="ERR_CANCELED"?a.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{}})):a.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(s)}})),s})}serialize(t){return t?.message?t:JSON.stringify(t)}async get(t){const a=new AbortController;return ra=[...ra,a],this.axiosInstance.get(t,{signal:a.signal})}async post(t,a){const r=new AbortController;return ra=[...ra,r],this.axiosInstance.post(t,a,{signal:r.signal})}async abortAll(){ra.forEach(t=>t.abort()),ra=[]}async runAction(t,a,r,i,s,n,d,c,u,m,v){a&&a.startsWith("/")&&(a=a.substring(1));const f=[t,a,r,d??"",i,s].join(""),w=$o.check(f);return w.blocked?(await this.abortAll(),w.firstTrip&&console.error("[mateu] request loop detected — aborting repeated request",f),{messages:w.firstTrip?[{title:"",text:"A repeating request was detected and stopped to protect the server. Reload the page or navigate elsewhere.",position:"bottom-end",variant:"error",duration:6e3}]:[],commands:[],fragments:[],banners:[],appendBanners:!1,appData:void 0,appState:void 0}):(n={...Mr(),...n},await this.wrap(this.post(t+"/mateu/v3/sync/"+(a&&a!=""?a:"_no_route"),{serverSideType:d,appState:n,componentState:c,parameters:u,initiatorComponentId:s,consumedRoute:r,route:a&&a!=""?"/"+a:"",actionId:i}).then(x=>x.data),m,v,i))}}const Jt=new xo;var ka=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(ka||{}),it=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(it||{}),wo=Object.defineProperty,Di=(e,t,a,r)=>{for(var i=void 0,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=n(t,a,i)||i);return i&&wo(t,a,i),i};class ur extends C{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const a=t.data,r=document.createElement(a.name);for(let i in a.attributes)r.setAttribute(i,a.attributes[i]);for(let i in a.on)r.addEventListener(i,s=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.on[i],parameters:{event:s}},bubbles:!0,composed:!0}))});return r},this.closeModal=()=>{const t=(this.shadowRoot??this).querySelectorAll("mateu-dialog, mateu-drawer");if(t&&t.length>0){t[t.length-1].close(),this.removeTopOverlayChild();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let a=document.querySelector('link[rel="icon"]');a!==null?a.setAttribute("href",t):(a=document.createElement("link"),a.setAttribute("rel","icon"),a.setAttribute("href",t),document.head.appendChild(a))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=Dt.subscribe(t=>{if(t.command){const a=t.command;this.id==a.targetComponentId&&this.applyCommand(a)}if((!t.callbackToken||!this.callbackToken||t.callbackToken===this.callbackToken)&&t.fragment){const a=t.fragment;this.id==a.targetComponentId&&(this.applyFragment(a),this.completeMenu(a))}})}completeMenu(t){if(t.component&&t.component.type==W.ClientSide){const a=t.component,r=a.metadata;if(r?.type==h.App){const i=r,s=this.getRemoteMenus(i.menu);if(s.length>0){const n=s.map(d=>Jt.runAction(d.baseUrl,d.route,"_empty","",d.baseUrl+"#"+d.route,void 0,void 0,void 0,d.params,this,!0));Promise.all(n).then(d=>{i.menu=this.updateMenu(i.menu,d.map(c=>c.fragments).filter(c=>c).map(c=>c).flat()),i.variant=it.MENU_ON_TOP,Dt.next({fragment:{component:a,data:void 0,state:void 0,action:ka.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(t,a){const r=[];return t.forEach(i=>{if(i.remote){const s=a.find(n=>n.targetComponentId==i.baseUrl+"#"+i.route);if(s&&s.component?.type==W.ClientSide){const n=s.component;if(n.metadata?.type==h.App){const d=n.metadata,c=i.serverSideType&&i.serverSideType!=""?i.serverSideType:d.serverSideType;this.changeBaseUrl(d.menu,i.baseUrl,c,i.route,d.route),r.push(...d.menu)}}}else r.push(i)}),r}changeBaseUrl(t,a,r,i,s){t.forEach(n=>{n.baseUrl||(n.submenus&&n.submenus.length>0?this.changeBaseUrl(n.submenus,a,r,i,s):(n.consumedRoute=s??"",n.baseUrl=a,n.serverSideType=r,n.uriPrefix=i))})}getRemoteMenus(t){const a=[];return t.forEach(r=>{r.remote&&a.push(r)}),a}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"&&this.dispatchNamedEvent(t.data),t.type=="NavigateTo"){const a=t.data;a&&(a.startsWith("http:")||a.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const a=t.data;a!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:a},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const a=t.data;if(a&&a.actionId)if(a.targetComponentId){const r={command:{type:"RunAction",data:{actionId:a.actionId},targetComponentId:a.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>Dt.next(r))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const a=t.data;if(a&&a.base64Content){const r=atob(a.base64Content),i=new Uint8Array(r.length);for(let c=0;c<r.length;c++)i[c]=r.charCodeAt(c);const s=new Blob([i],{type:a.mimeType}),n=URL.createObjectURL(s),d=document.createElement("a");d.href=n,d.download=a.filename??"export",d.click(),URL.revokeObjectURL(n)}}if(t.type=="CloseModal"&&(this.closeModal(),this.dispatchNamedEvent(t.data)),t.type=="AddContentToHead"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.body.appendChild(this.createElement(t))}}}dispatchNamedEvent(t){if(t&&t.eventName){const a=this.component,r=a?.emitsName??a?.serverSideType;let i=t.payload??t.detail;r&&i&&typeof i=="object"&&(i={...i,__source:r}),this.dispatchEvent(new CustomEvent(t.eventName,{detail:i,bubbles:!0,composed:!0}))}}removeTopOverlayChild(){const t=this.component?.children;if(t)for(let a=t.length-1;a>=0;a--){const r=t[a]?.metadata?.type;if(r==h.Drawer||r==h.Dialog){t.splice(a,1);return}}}}Di([p()],ur.prototype,"id");Di([p()],ur.prototype,"baseUrl");var ko=Object.defineProperty,Co=(e,t,a,r)=>{for(var i=void 0,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=n(t,a,i)||i);return i&&ko(t,a,i),i};class pr extends ur{applyFragment(t){}manageActionRequestedEvent(t){}}Co([p()],pr.prototype,"component");const sa=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),ca=(e,t,a)=>({state:e??{},data:t??{},...a});function $e(e,t,a,r){if(!e?.includes("${"))return e;try{return sa(e,ca(t,a,r))}catch(i){return console.warn(`Mateu: could not interpolate "${e}":`,i),e}}const ht=(e,t,a)=>{if(e&&e.indexOf("${")>=0)try{return sa(e,ca(t,a))}catch(r){return r.message}return e},Ca=(e,t,a,r,i)=>{if(!e)return e;const s=ca(t,a,{appState:r??{},appData:i??{}});let n=e;try{if(n=sa(e,s),n.includes("${"))try{n=sa(n,s)}catch(d){n="when evaluating nested "+e+" :"+d+", where data is "+a+" and state is "+t+" and app state is "+r+" and app data is "+i,console.error(d,n,t,a,r,i)}}catch(d){n="when evaluating "+e+" :"+d+", where data is "+a+" and state is "+t+" and app state is "+r+" and app data is "+i,console.error(d,n,t,a,r,i)}return n},Nr=(e,t,a,r,i,s)=>{const n=ca(t,a,{appState:r??{},appData:i??{},...s}),d=sa(e,n);return new Function(...Object.keys(n),`return (${d})`)(...Object.values(n))},Fi=(e,t,a,r)=>{const i=ca(t,a,r);return new Function(...Object.keys(i),`return (${e})`)(...Object.values(i))},_o=(e,t,a,r)=>sa(e,ca(t,a,r)),Or="display:inline-flex; align-items:center; justify-content:center; width:2rem; height:2rem; border-radius:50%; background:var(--lumo-contrast-10pct,#e0e0e0); color:var(--lumo-secondary-text-color,#555); font-size:.8rem; font-weight:600; overflow:hidden; flex:none;",qi=(e,t)=>t||(typeof e=="string"&&e?e.trim().split(/\s+/).map(a=>a[0]).slice(0,2).join("").toUpperCase():""),Io=(e,t,a)=>{const r=e.metadata,i=Oe(r.name,t,a);return o`<span style="${Or}${e.style}" class="${e.cssClasses}"
                      title="${i||l}" slot="${e.slot??l}">
        ${r.image?o`<img src="${r.image}" alt="${i}" style="width:100%;height:100%;object-fit:cover;">`:qi(i,r.abbreviation)}
    </span>`},Oe=(e,t,a)=>typeof e=="string"&&e.includes("${")?$e(e,t,a):e,So=e=>{const t=e.metadata,a=t.avatars??[],r=t.maxItemsVisible&&t.maxItemsVisible>0?t.maxItemsVisible:a.length,i=a.slice(0,r),s=a.length-i.length,n="margin-left:-0.4rem; border:2px solid var(--lumo-base-color,#fff);";return o`<span style="display:inline-flex; ${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
        ${i.map(d=>o`<span style="${Or}${n}" title="${d.name||l}">
            ${d.img?o`<img src="${d.img}" style="width:100%;height:100%;object-fit:cover;">`:qi(d.name??"",d.abbr)}
        </span>`)}
        ${s>0?o`<span style="${Or}${n}">+${s}</span>`:l}
    </span>`},Eo=(e,t,a)=>{const r=e.metadata;return o`<span theme="badge ${r.color} ${r.pill?"pill":""} ${r.small?"small":""} ${r.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??l}">${Oe(r.text,t,a)}</span>`},Po=(e,t,a)=>{const r=Oe(e.text,t,a);if(!r)return l;let i=Oe(e.color,t,a);return i=="SUCCESS"&&(i="success"),i=="ERROR"&&(i="error"),i=="DANGER"&&(i="error"),i=="WARNING"&&(i="warning"),i=="INFO"&&(i="info"),i=="PRIMARY"&&(i="primary"),i=="SECONDARY"&&(i="secondary"),i=="TERTIARY"&&(i="tertiary"),i=="QUATERNARY"&&(i="quaternary"),i=="LIGHT"&&(i="light"),i=="DARK"&&(i="dark"),o`<span theme="badge ${i} ${e.pill?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${r}</span>`};class To{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const a=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:a?[...a].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const B=new To,Rt=(e,t,a,r,i,s,n,d,c)=>(t.slot=d,g(e,t,a,r,i,s,n,c)),g=(e,t,a,r,i,s,n,d)=>{if(!t)return o``;if(t.type==W.ClientSide)return B.get().renderClientSideComponent(e,t,a,r,i,s,n,d);const c=e.route,u=e.consumedRoute;return o`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${u}"
                         baseUrl="${a}"
                         slot="${t.slot??l}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...r}}"
                         .data="${{...i}}"
                         .appState="${s}"
                         .appData="${n}"
        >
       </mateu-component>`};var zo=Object.defineProperty,Oo=Object.getOwnPropertyDescriptor,Xt=(e,t,a,r)=>{for(var i=r>1?void 0:r?Oo(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&zo(t,a,i),i};const Mi=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},Ro=e=>{const t=Mi(e)??"",a=[];return t.includes("primary")&&a.push("primary"),t.includes("tertiary")&&a.push("tertiary"),(t.includes("error")||e.color==="error")&&a.push("danger"),a.join(" ")},ii=e=>e==="back"||e==="backToList"||!!e&&e.startsWith("cancel");let st=class extends C{constructor(){super(...arguments),this.appState={},this.appData={},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>$e(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return l;const t=this.evalLabel(e.label),a=B.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId));return a||o`
        <button class="mtb ${Ro(e)}"
                data-action-id="${e.id}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${t}</button>
    `},this.renderPeerNav=e=>{const t=B.get()?.renderPeerNav?.(e);return t||o`
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
        `}}render(){const e=this.metadata;if(!e)return o``;const t=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0,a=e.toolbar??[],r=a.filter(c=>ii(c.actionId)),i=a.filter(c=>!ii(c.actionId)),s=r.length>0&&i.length>0?o`<span class="toolbar-divider"></span>`:l,n=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||a.length>0||!!t,d=e.level??0;return d>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested"),o`
            ${e.breadcrumbs&&e.breadcrumbs.length>0?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="breadcrumbs-bar">
                    ${e.breadcrumbs.map((c,u)=>o`
                        ${u>0?o`<span>/</span>`:l}
                        ${c.link?o`<button class="breadcrumb-link" @click="${()=>window.location.href=`${c.link}`}">${c.text}</button>`:o`<span>${c.text}</span>`}
                    `)}
                </div>
            `:l}
            ${e.noHeader?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                    ${e?.header?.map(c=>g(this,c,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${t?this.renderPeerNav(t):l}
                    ${r.map(this.renderBtn)}
                    ${s}
                    ${i.map(this.renderBtn)}
                </div>
            `:n?o`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="form-header">
                    ${e.avatar?g(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):l}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${e?.title&&d==0?o`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ye(ht(e?.title,this.state??{},this.data??{}))}</h2>`:l}
                        ${e?.title&&d==1?o`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ye(ht(e?.title,this.state??{},this.data??{}))}</h3>`:l}
                        ${e?.title&&d==2?o`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ye(ht(e?.title,this.state??{},this.data??{}))}</h4>`:l}
                        ${e?.title&&d==3?o`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ye(ht(e?.title,this.state??{},this.data??{}))}</h5>`:l}
                        ${e?.title&&d>3?o`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ye(ht(e?.title,this.state??{},this.data??{}))}</h6>`:l}

                        ${e?.subtitle?o`<span style="display: inline-block; margin-block-end: 0.83em;">${ye(ht(e?.subtitle,this.state??{},this.data??{}))}</span>`:l}
                        ${e?.timestamp?o`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${ye(ht(e.timestamp,this.state??{},this.data??{}))}</span>`:l}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e?.kpis?.map(c=>o`
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div>${this.evalLabel(c.title)}</div>
                                <div>${ye(ht(c.text,this.state??{},this.data??{}))}</div>
                            </div>
                        `)}
                        ${e?.header?.map(c=>g(this,c,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${t?this.renderPeerNav(t):l}
                        ${r.map(this.renderBtn)}
                        ${s}
                        ${i.map(this.renderBtn)}
                    </div>
                </div>
            `:l}
            ${e.badges&&e.badges.length>0?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(c=>Po(c,this.state??{},this.data??{}))}
                </div>
            `:l}
        `}};st.styles=$`
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

        ${kt}
    `;Xt([p()],st.prototype,"metadata",2);Xt([p()],st.prototype,"baseUrl",2);Xt([p()],st.prototype,"state",2);Xt([p()],st.prototype,"data",2);Xt([p()],st.prototype,"appState",2);Xt([p()],st.prototype,"appData",2);st=Xt([k("mateu-content-header")],st);var Lo=Object.defineProperty,Ao=Object.getOwnPropertyDescriptor,Oa=(e,t,a,r)=>{for(var i=r>1?void 0:r?Ao(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Lo(t,a,i),i};let qt=class extends pr{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return o`
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
       `}};qt.styles=$`
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
    `;Oa([p()],qt.prototype,"state",2);Oa([p()],qt.prototype,"data",2);Oa([p()],qt.prototype,"appState",2);Oa([p()],qt.prototype,"appData",2);qt=Oa([k("mateu-form")],qt);var Do=Object.defineProperty,Fo=Object.getOwnPropertyDescriptor,Ur=(e,t,a,r)=>{for(var i=r>1?void 0:r?Fo(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Do(t,a,i),i};let _a=class extends C{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?o`${e.map(()=>o`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?o`${e.map(()=>o`<div class="bone row"></div>`)}`:this.variant=="form"?o`${e.map(()=>o`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:o`${e.map(()=>o`<div class="bone line"></div>`)}`}};_a.styles=$`
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
    `;Ur([p()],_a.prototype,"variant",2);Ur([p({type:Number})],_a.prototype,"count",2);_a=Ur([k("mateu-skeleton")],_a);const qo=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},Lt=(e,t,a,r,i,s)=>o`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??"🗂"}</span>
            ${a?o`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${a}</span>`:l}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${r??e??"Nothing here yet."}</span>
            ${i&&s?o`
                <button style="margin-top: .25rem; font: inherit; font-weight: 500; cursor: pointer; padding: .4rem .9rem; border: none; border-radius: var(--lumo-border-radius-m, 6px); background: transparent; color: var(--lumo-primary-text-color, #3b5bdb);"
                        @click="${n=>qo(n,i)}">${s}</button>
            `:l}
        </div>
    `,Mo=e=>{const t=e.metadata;return o`
        <div style="${e.style??l}" class="${e.cssClasses??l}" slot="${e.slot??l}">
            ${Lt(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},No=e=>{const t=e.metadata;return o`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-skeleton>
    `},U=(e,t,a,r)=>{if(!e)return o``;const i=B.get()?.renderIcon;if(i){const s=i.call(B.get(),e,t,a);return r?o`<span slot="${r}">${s}</span>`:s}return o`<span class="mateu-icon ${a??""}" data-icon="${e}" aria-hidden="true"
                      style="display:inline-block; width:1em; height:1em; ${t??""}" slot="${r??l}"></span>`},Ni="mateu-saved-views",hr=()=>{try{return JSON.parse(localStorage.getItem(Ni)??"{}")}catch{return{}}},jr=e=>{try{localStorage.setItem(Ni,JSON.stringify(e))}catch{}},Ui=e=>hr()[e]??[],Uo=(e,t)=>{const a=t.name?.trim();if(!a||Object.keys(t.values??{}).length===0)return;const r=hr(),i=(r[e]??[]).filter(s=>s.name!==a);i.push({...t,name:a}),r[e]=i,jr(r)},jo=(e,t)=>{const a=hr(),r=(a[e]??[]).filter(i=>i.name!==t);r.length===0?delete a[e]:a[e]=r,jr(a)},Bo=(e,t)=>{const a=hr();a[e]=(a[e]??[]).map(r=>({...r,isDefault:r.name===t?!r.isDefault:!1})),jr(a)},Vo=e=>Ui(e).find(t=>t.isDefault);var Ho=Object.defineProperty,Wo=Object.getOwnPropertyDescriptor,Se=(e,t,a,r)=>{for(var i=r>1?void 0:r?Wo(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Ho(t,a,i),i};let se=class extends C{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.viewsOpened=!1,this.draftText="",this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{const e=this.filters.flatMap(a=>this.isRangeFilter(a)?[`${a.fieldId}_from`,`${a.fieldId}_to`]:[a.fieldId]),t={searchText:void 0};e.forEach(a=>{t[a]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return this.metadata?.filters??[]}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){const t=this.filters.find(a=>a.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e==="searchText"?"":void 0),this.requestSearch()}commitText(e){this.emitValueChanged("searchText",e.value),this.draftText="",e.value="",this.requestSearch()}get viewsScope(){return window.location.pathname}allFilterKeys(){return["searchText",...this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])]}snapshotValues(){const e={};return this.state.searchText&&(e.searchText=this.state.searchText),this.filters.forEach(t=>{if(this.isSet(t))if(this.isRangeFilter(t)){const a=this.rangeBound(t,"from"),r=this.rangeBound(t,"to");a&&(e[`${t.fieldId}_from`]=a),r&&(e[`${t.fieldId}_to`]=r)}else this.isMultiFilter(t)?e[t.fieldId]=this.multiValues(t):e[t.fieldId]=this.state[t.fieldId]}),e}applyView(e){const t=this.allFilterKeys(),a={};t.forEach(r=>{a[r]=void 0}),this.state={...this.state,...a},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:t},bubbles:!0,composed:!0})),Object.entries(e.values).forEach(([r,i])=>this.emitValueChanged(r,i)),this.viewsOpened=!1,this.detachOutsideClick(),this.requestSearch()}saveCurrentView(e){const t=e.value.trim();t&&(Uo(this.viewsScope,{name:t,values:this.snapshotValues()}),e.value="",this.requestUpdate())}firstUpdated(){if(window.location.search)return;const e=Vo(this.viewsScope);e&&setTimeout(()=>{this.state.searchText||this.filters.some(a=>this.isSet(a))||this.applyView(e)},0)}isBooleanFilter(e){return e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle"}isNumericFilter(e){return["integer","decimal","number","money"].includes(e.dataType??"")}isRangeFilter(e){return e.stereotype==="dateRange"||e.stereotype==="numberRange"}isMultiFilter(e){return e.stereotype==="multiSelect"}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){const t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t=="string"&&t!==""?t.split(",").map(a=>a.trim()).filter(a=>a):[]}rangeBound(e,t){const a=this.state[`${e.fieldId}_${t}`];return a==null?"":String(a)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,"from")!==""||this.rangeBound(e,"to")!=="";if(this.isMultiFilter(e))return this.multiValues(e).length>0;const t=this.state[e.fieldId];return t!=null&&t!==""&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){const a=e.options.find(r=>r.value===String(t));if(a)return a.label??a.value}return typeof t=="boolean"?t?"Yes":"No":String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){const t=this.rangeBound(e,"from"),a=this.rangeBound(e,"to");return t&&a?`${t} – ${a}`:t?`≥ ${t}`:`≤ ${a}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(", "):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return $e(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,a="panel-row"){return o`
            <div class="${a}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){const t=e.stereotype==="numberRange"?"number":e.dataType==="dateTime"?"datetime-local":e.dataType==="time"?"time":"date",a=i=>{const s=i.closest(".panel-input-row"),n=s.querySelector("input.range-from").value,d=s.querySelector("input.range-to").value;this.emitValueChanged(`${e.fieldId}_from`,n===""?void 0:n),this.emitValueChanged(`${e.fieldId}_to`,d===""?void 0:d),this.requestSearch()},r=i=>{i.key==="Enter"&&a(i.target),i.key==="Escape"&&this.closePanel()};return o`
            <div class="panel-input-row">
                <input class="range-from" type="${t}" placeholder="From"
                       .value="${this.rangeBound(e,"from")}"
                       @mousedown="${i=>i.stopPropagation()}"
                       @keydown="${r}"/>
                <span class="range-separator" aria-hidden="true">–</span>
                <input class="range-to" type="${t}" placeholder="To"
                       .value="${this.rangeBound(e,"to")}"
                       @mousedown="${i=>i.stopPropagation()}"
                       @keydown="${r}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${i=>a(i.target)}">Apply</button>
            </div>`}renderMultiWidget(e){const t=this.multiValues(e),a=r=>{const i=t.includes(r)?t.filter(s=>s!==r):[...t,r];this.emitValueChanged(e.fieldId,i.length>0?i:void 0),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))};return o`${(e.options??[]).map(r=>this.panelRow(o`
            <span class="multi-check ${t.includes(r.value)?"multi-check--on":""}"
                  aria-hidden="true">${t.includes(r.value)?"✓":""}</span>
            ${r.label??r.value}
        `,()=>a(r.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return o`${e.options.map(r=>this.panelRow(r.label??r.value,()=>this.applyFilter(e.fieldId,r.value)))}`;if(this.isBooleanFilter(e))return o`
                ${this.panelRow("Yes",()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow("No",()=>this.applyFilter(e.fieldId,!1))}`;const t=this.isNumericFilter(e),a=r=>{r.value!==""&&this.applyFilter(e.fieldId,t?Number(r.value):r.value)};return o`
            <div class="panel-input-row">
                <input type="${t?"number":"text"}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${r=>r.stopPropagation()}"
                       @keydown="${r=>{r.key==="Enter"&&a(r.target),r.key==="Escape"&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${r=>a(r.target.previousElementSibling)}">Apply</button>
            </div>`}renderViewsPanel(){if(!this.viewsOpened)return l;const e=Ui(this.viewsScope),t=!!this.state.searchText||this.filters.some(a=>this.isSet(a));return o`
            <div class="panel views-panel">
                <div class="panel-caption">Saved views</div>
                ${e.length===0?o`
                    <div class="panel-row views-empty">No saved views yet</div>`:l}
                ${e.map(a=>o`
                    <div class="panel-row view-row" @mousedown="${this.keepFocus}">
                        <span class="view-name" @click="${()=>this.applyView(a)}">${a.name}</span>
                        <button class="view-star ${a.isDefault?"view-star--on":""}"
                                title="${a.isDefault?"Unset as default":"Open this listing with this view"}"
                                @click="${()=>{Bo(this.viewsScope,a.name),this.requestUpdate()}}">★</button>
                        <button class="chip-remove" aria-label="Delete view ${a.name}"
                                @click="${()=>{jo(this.viewsScope,a.name),this.requestUpdate()}}">✕</button>
                    </div>`)}
                ${t?o`
                    <div class="panel-input-row" @mousedown="${a=>a.stopPropagation()}">
                        <input class="view-name-input" type="text" placeholder="Save current view as…"
                               @keydown="${a=>{a.key==="Enter"&&this.saveCurrentView(a.target),a.key==="Escape"&&(this.viewsOpened=!1)}}"/>
                        <button class="apply-button"
                                @click="${a=>this.saveCurrentView(a.target.previousElementSibling)}">Save</button>
                    </div>`:o`
                    <div class="panel-row views-empty">Apply some filters to save a view</div>`}
            </div>`}renderPanel(){if(!this.panelOpened||this.filters.length===0)return l;if(this.activeFilter){const t=this.activeFilter;return o`
                <div class="panel">
                    <div class="panel-row panel-header"
                         @mousedown="${this.keepFocus}"
                         @click="${()=>{this.activeFilter=void 0}}">
                        <span aria-hidden="true">←</span> ${this.labelOf(t)}
                    </div>
                    ${this.renderActiveFilterWidget(t)}
                </div>`}const e=!!this.state.searchText||this.filters.some(t=>this.isSet(t));return o`
            <div class="panel">
                <div class="panel-caption">Filter by</div>
                ${this.filters.map(t=>this.panelRow(o`
                    ${this.labelOf(t)}
                    ${this.isSet(t)?o`<span class="current-value">${this.conditionDisplay(t)}</span>`:l}
                `,()=>{this.activeFilter=t}))}
                ${e?this.panelRow("Clear filters",this.clearAllFilters,"panel-row panel-footer"):l}
            </div>`}render(){const e=[];return this.state.searchText&&e.push({fieldId:"searchText",label:"Text",display:String(this.state.searchText)}),this.filters.forEach(t=>{this.isSet(t)&&e.push({fieldId:t.fieldId,label:this.labelOf(t),display:this.conditionDisplay(t)})}),o`
            <div class="smart-search">
                <div class="bar"
                     @click="${t=>{t.currentTarget.querySelector("input.free-text")?.focus(),this.openPanel()}}">
                    <svg aria-hidden="true" class="magnifier" width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
                    </svg>
                    ${e.map(t=>o`
                        <span theme="badge contrast pill" class="chip">
                            <span class="chip-label">${t.label}:</span> ${t.display}
                            <button class="chip-remove" aria-label="Remove filter ${t.label}"
                                    @mousedown="${this.keepFocus}"
                                    @click="${a=>{a.stopPropagation(),this.removeChip(t.fieldId)}}">✕</button>
                        </span>`)}
                    ${this.metadata?.searchable!==!1?o`
                        <input class="free-text" type="text" id="searchText"
                               placeholder="${e.length===0?"Search":""}"
                               autofocus="${this.metadata?.autoFocusOnSearchText?!0:l}"
                               .value="${this.draftText??""}"
                               @input="${t=>{this.draftText=t.target.value,this.openPanel()}}"
                               @keydown="${t=>{t.key==="Enter"&&this.commitText(t.target),t.key==="Escape"&&this.closePanel()}}"/>
                    `:l}
                    <button class="views-button" title="Saved views" aria-label="Saved views"
                            @mousedown="${this.keepFocus}"
                            @click="${t=>{t.stopPropagation(),this.closePanel(),this.viewsOpened=!this.viewsOpened,this.viewsOpened&&(this.outsideClick=a=>{a.composedPath().includes(this)||(this.viewsOpened=!1,this.detachOutsideClick())},document.addEventListener("mousedown",this.outsideClick))}}">
                        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"/>
                        </svg>
                    </button>
                </div>
                ${this.renderPanel()}
                ${this.renderViewsPanel()}
            </div>
            <slot></slot>
        `}};se.styles=$`
        ${kt}
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
    `;Se([p()],se.prototype,"metadata",2);Se([p()],se.prototype,"baseUrl",2);Se([b()],se.prototype,"state",2);Se([b()],se.prototype,"data",2);Se([p()],se.prototype,"appState",2);Se([p()],se.prototype,"appData",2);Se([p({type:Boolean})],se.prototype,"searchOnly",2);Se([b()],se.prototype,"panelOpened",2);Se([b()],se.prototype,"viewsOpened",2);Se([b()],se.prototype,"activeFilter",2);Se([b()],se.prototype,"draftText",2);se=Se([k("mateu-filter-bar")],se);const ji="mateu-column-prefs",Br=()=>{try{const e=JSON.parse(localStorage.getItem(ji)??"{}");return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}},Bi=e=>{try{localStorage.setItem(ji,JSON.stringify(e))}catch{}},Vr=e=>{if(!e||typeof e!="object")return;const t=a=>Array.isArray(a)?a.filter(r=>typeof r=="string"):[];return{hidden:t(e.hidden),order:t(e.order)}},Vi=e=>Vr(Br()[e]),Go=(e,t)=>{const a=Br(),r=Vr(t);r.hidden.length===0&&r.order.length===0?delete a[e]:a[e]=r,Bi(a)},Ko=e=>{const t=Br();delete t[e],Bi(t)},Hi=e=>e?!!e.identifier||e.dataType==="action"||e.dataType==="actionGroup"||e.dataType==="menu"||e.id==="select"||e.id==="menu":!1,Wi=(e,t,a=r=>r)=>{const r=Vr(t);if(!r||r.hidden.length===0&&r.order.length===0)return e;const i=v=>a(v)?.id??v.id,s=new Set(r.hidden),n=e.filter(v=>{const f=i(v);return!f||!s.has(f)||Hi(a(v))});if(r.order.length===0)return n.length===e.length?e:n;const d=new Map;n.forEach(v=>{const f=i(v);f&&!d.has(f)&&d.set(f,v)});const c=[],u=new Set;return r.order.forEach(v=>{const f=d.get(v);f&&!u.has(f)&&(c.push(f),u.add(f))}),n.forEach(v=>{u.has(v)||(c.push(v),u.add(v))}),c.length===e.length&&c.every((v,f)=>v===e[f])?e:c};var Yo=Object.defineProperty,Jo=Object.getOwnPropertyDescriptor,Ra=(e,t,a,r)=>{for(var i=r>1?void 0:r?Jo(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Yo(t,a,i),i};let Mt=class extends C{constructor(){super(...arguments),this.columns=[],this.scope="",this.panelOpened=!1,this.revision=0,this.togglePanel=()=>{if(this.panelOpened){this.closePanel();return}this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick)},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1},this.reset=()=>{Ko(this.scope),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}get prefs(){return Vi(this.scope)??{hidden:[],order:[]}}effectiveEntries(e){return Wi(this.columns,{hidden:[],order:e.order})}commit(e){Go(this.scope,e),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}toggleVisibility(e){const t=this.prefs,a=t.hidden.includes(e)?t.hidden.filter(r=>r!==e):[...t.hidden,e];this.commit({...t,hidden:a})}move(e,t){const a=this.prefs,r=[...this.effectiveEntries(a)],i=r.findIndex(d=>d.id===e);if(i<0)return;let s=i+t;for(;s>=0&&s<r.length&&r[s].protected;)s+=t;if(s<0||s>=r.length)return;const n=r[i];r[i]=r[s],r[s]=n,this.commit({...a,order:r.map(d=>d.id)})}render(){this.revision;const e=this.prefs,t=this.effectiveEntries(e).filter(r=>!r.protected);if(t.length===0)return o``;const a=e.hidden.length>0||e.order.length>0;return o`
            <div class="chooser">
                <button
                    class="trigger ${a?"active":""}"
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
                ${this.panelOpened?o`
                    <div class="panel" role="menu">
                        <div class="panel-title">Columns</div>
                        ${t.map((r,i)=>{const s=e.hidden.includes(r.id);return o`
                                <div class="row" data-column-id="${r.id}">
                                    <label class="row-label">
                                        <input
                                            type="checkbox"
                                            .checked="${!s}"
                                            @change="${()=>this.toggleVisibility(r.id)}"
                                        />
                                        <span class="${s?"muted":""}">${r.label||r.id}</span>
                                    </label>
                                    <button class="move" type="button" title="Move up" aria-label="Move ${r.label||r.id} up"
                                        ?disabled="${i===0}"
                                        @click="${()=>this.move(r.id,-1)}">↑</button>
                                    <button class="move" type="button" title="Move down" aria-label="Move ${r.label||r.id} down"
                                        ?disabled="${i===t.length-1}"
                                        @click="${()=>this.move(r.id,1)}">↓</button>
                                </div>
                            `})}
                        <div class="footer">
                            <button class="reset" type="button" ?disabled="${!a}" @click="${this.reset}">Reset</button>
                        </div>
                    </div>
                `:l}
            </div>
        `}};Mt.styles=$`
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
    `;Ra([p()],Mt.prototype,"columns",2);Ra([p()],Mt.prototype,"scope",2);Ra([b()],Mt.prototype,"panelOpened",2);Ra([b()],Mt.prototype,"revision",2);Mt=Ra([k("mateu-column-chooser")],Mt);var Xo=Object.defineProperty,Qo=Object.getOwnPropertyDescriptor,La=(e,t,a,r)=>{for(var i=r>1?void 0:r?Qo(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Xo(t,a,i),i};let Nt=class extends C{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has("totalElements")||e.has("pageSize"))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return l;const e=this.totalPages>1,t=this.pageNumber,a=t===0,r=t>=this.totalPages-1;return o`
            <div class="bar">
                ${e?o`
                    <button class="nav" title="First page" ?disabled="${a}"
                        @click="${()=>this.dispatch(0)}" data-testid="page-first">«</button>
                    <button class="nav" title="Previous page" ?disabled="${a}"
                        @click="${()=>this.dispatch(t-1)}" data-testid="page-prev">‹</button>
                    <span class="page-indicator">Page ${t+1} of ${this.totalPages}</span>
                    <button class="nav" title="Next page" ?disabled="${r}"
                        @click="${()=>this.dispatch(t+1)}" data-testid="page-next">›</button>
                    <button class="nav" title="Last page" ?disabled="${r}"
                        @click="${()=>this.dispatch(this.totalPages-1)}" data-testid="page-last">»</button>
                    <span class="separator"></span>
                `:l}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?"":"s"}</span>
                <slot></slot>
            </div>
        `}};Nt.styles=$`
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
    `;La([p()],Nt.prototype,"totalElements",2);La([p()],Nt.prototype,"pageSize",2);La([p()],Nt.prototype,"pageNumber",2);La([b()],Nt.prototype,"totalPages",2);Nt=La([k("mateu-pagination")],Nt);const ua="var(--lumo-space-m, 1rem)",Zo=(e,t,a,r,i,s,n)=>{const d=t.metadata,c=d.columnWidth||"13rem";let m=`display: grid; grid-template-columns: ${d.maxColumns&&d.maxColumns>0?`repeat(${d.maxColumns}, minmax(0, 1fr))`:`repeat(auto-fill, minmax(min(100%, ${c}), 1fr))`}; gap: ${ua} var(--lumo-space-l, 1.5rem); align-items: start;`;return d.labelsAside&&(m+=" --mateu-label-width: 10rem;"),d.fullWidth&&(m+=" width: 100%;"),m+=t.style??"",o`
        <div style="${m}" class="${t.cssClasses}" slot="${t.slot||l}">
            ${t.children?.map(v=>Gi(d,e,v,a,r,i,s,n))}
        </div>
    `},Gi=(e,t,a,r,i,s,n,d)=>{if(a.type==W.ClientSide&&a.metadata?.type==h.FormRow)return an(e,t,a,r,i,s,n,d);const c=en(a),u=e.labelsAside?tn(t,a,r,i,s,n,d):g(t,a,r,i,s,n,d);return o`<div style="grid-column: span ${c}; min-width: 0;">${u}</div>`},en=e=>{if(e.type==W.ClientSide){const t=e.metadata;if(t?.type==h.FormField)return t.colspan||1}return 1},tn=(e,t,a,r,i,s,n)=>{if(t.type==W.ClientSide&&t.metadata?.type==h.FormField&&t.metadata.label){const d=t.metadata,c=d.label?.includes("${")?e._evalTemplate(d.label):d.label;return o`
            <div style="display: flex; gap: ${ua}; align-items: baseline;">
                <label style="flex: 0 0 var(--mateu-label-width, 10rem); color: var(--lumo-secondary-text-color, #667);">${c}</label>
                <div style="flex: 1; min-width: 0;">${g(e,t,a,r,i,s,n,!0)}</div>
            </div>
        `}return g(e,t,a,r,i,s,n)},an=(e,t,a,r,i,s,n,d)=>o`
        <div style="grid-column: 1 / -1; display: flex; gap: ${ua}; flex-wrap: wrap;">
            ${a.children?.map(c=>o`<div style="flex: 1 1 ${100/Math.max(1,a.children.length)}%; min-width: min(100%, 13rem);">${Gi(e,t,c,r,i,s,n,d)}</div>`)}
        </div>
    `,Ki=(e,t,a,r,i,s,n,d)=>{const c=a.metadata;let u=`display: flex; flex-direction: ${e};`;c.spacing&&(u+=` gap: ${ua};`),c.padding&&(u+=" padding: var(--lumo-space-m, 1rem);"),c.wrap&&(u+=" flex-wrap: wrap;"),c.fullWidth&&(u+=" width: 100%;"),c.justification&&(u+=` justify-content: ${c.justification};`);const m=e==="row"?c.verticalAlignment:c.horizontalAlignment;return m&&(u+=` align-items: ${m};`),u+=a.style??"",o`
        <div style="${u}" class="${a.cssClasses}" slot="${a.slot??l}">
            ${a.children?.map(v=>g(t,v,r,i,s,n,d))}
        </div>
    `},rn=(e,t,a,r,i,s,n)=>Ki("row",e,t,a,r,i,s,n),sn=(e,t,a,r,i,s,n)=>Ki("column",e,t,a,r,i,s,n),on=(e,t,a,r,i,s,n)=>{const d=t.metadata;let u=`display: flex; flex-direction: ${d.orientation==="vertical"?"column":"row"}; gap: var(--lumo-space-s, 0.5rem);`;return d.fullWidth&&(u+=" width: 100%;"),u+=t.style??"",o`
        <div style="${u}" class="${t.cssClasses}" slot="${t.slot??l}">
            <div style="flex: 1; min-width: 0; min-height: 0;">${g(e,t.children[0],a,r,i,s,n)}</div>
            <div style="flex: 1; min-width: 0; min-height: 0;">${g(e,t.children[1],a,r,i,s,n)}</div>
        </div>
    `},nn=(e,t,a,r,i,s,n)=>{const d=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,u=!!i?.hasDetail||!!d,m=c??d;return o`
        <div style="display: flex; gap: var(--lumo-space-m, 1rem); ${t.style??""}" class="${t.cssClasses}" slot="${t.slot??l}">
            <div style="flex: 1; min-width: 0;">${g(e,t.children[0],a,r,i,s,n)}</div>
            ${u&&m?o`<div style="flex: 1; min-width: 0;">${g(e,m,a,r,i,s,n)}</div>`:o`<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem);">Select an item to view details</div>`}
        </div>
    `},ln=(e,t,a,r,i,s,n)=>{let d=t.style??"";t.metadata.fullWidth&&(d+=" width: 100%;");const c=Math.max(0,(t.children??[]).findIndex(u=>u.metadata.active));return o`
        <div style="${d}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map((u,m)=>{const v=u,f=v.metadata.label,w=f?.includes("${")?e._evalTemplate(f):f;return o`
                    <details ?open="${m===c}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));">
                        <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600;">${w}</summary>
                        <div style="padding: var(--lumo-space-m, 1rem) 0;">
                            ${v.children?.map(x=>g(e,x,a,r,i,s,n))}
                        </div>
                    </details>
                `})}
        </div>
    `},dn=(e,t,a,r,i,s,n)=>{const d=t.metadata;let c=t.style??"";return d.fullWidth&&(c+=" width: 100%;"),o`
        <div style="${c}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(u=>cn(e,u,a,r,i,s,n,d.variant))}
        </div>
    `},cn=(e,t,a,r,i,s,n,d)=>{const c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return o`
        <details ?open="${c.active}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); ${t.style??""}" class="${t.cssClasses}">
            <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600; ${c.disabled?"pointer-events: none; opacity: .5;":""}">${u}</summary>
            <div style="padding: var(--lumo-space-s, .5rem) 0;">
                ${t.children?.map(m=>g(e,m,a,r,i,s,n))}
            </div>
        </details>
    `},un=(e,t,a,r,i,s,n)=>o`
        <div style="overflow: auto; ${t.style??""}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(d=>g(e,d,a,r,i,s,n))}
        </div>
    `,pn=(e,t,a,r,i,s,n)=>o`
        <div style="width: 100%; ${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(d=>g(e,d,a,r,i,s,n))}
        </div>
    `,hn=(e,t,a,r,i,s,n)=>o`
        <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(d=>g(e,d,a,r,i,s,n))}
        </div>
    `,mn=(e,t,a,r,i,s,n)=>o`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: ${ua}; ${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${t.children?.map(d=>g(e,d,a,r,i,s,n))}
        </div>
    `,vn=(e,t,a,r,i,s,n)=>o`
        <div style="display: flex; gap: ${ua}; flex-wrap: wrap; ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(d=>g(e,d,a,r,i,s,n))}
        </div>
    `,fn=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`
        <div style="flex: ${d.boardCols??1} 1 0; min-width: min(100%, 12rem); ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(c=>g(e,c,a,r,i,s,n))}
        </div>
    `},bn=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`
        <div
                style="display: flex; flex-direction: column; overflow: auto; ${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??l}"
        >
            ${d.page.content.map(c=>g(e,c,a,r,i,s,n))}
        </div>
    `},gn=e=>{const t=e.metadata;return(t?.content??t?.columns??[]).filter(r=>r&&r.metadata).map(r=>{const i=r.metadata;return{id:r.id??"",label:i?.label??r.id??"",autoWidth:i?.autoWidth,width:i?.width}})},si=(e,t)=>{const a=e?.[t];return a==null?"":typeof a=="object"?a.text??a.label??a.value??"":String(a)},Rr=(e,t,a)=>{const r=gn(e),i="text-align:left; padding:.45rem .6rem; border-bottom:2px solid var(--lumo-contrast-20pct,rgba(0,0,0,.2)); font-weight:600; white-space:nowrap; color: var(--lumo-secondary-text-color,#556);",s="padding:.4rem .6rem; border-bottom:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.08)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:24rem;";return o`
        <div style="overflow:auto; width:100%; ${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
            <table style="border-collapse:collapse; width:100%; font-size: var(--lumo-font-size-s,.875rem);">
                <thead><tr>${r.map(n=>o`<th style="${i}">${n.label}</th>`)}</tr></thead>
                <tbody>
                    ${(t??[]).length===0?o`<tr><td colspan="${Math.max(1,r.length)}" style="padding:1.5rem; text-align:center; color: var(--lumo-secondary-text-color,#888);">${a??"No data."}</td></tr>`:t.map(n=>o`<tr>${r.map(d=>o`<td style="${s}" title="${si(n,d.id)}">${si(n,d.id)}</td>`)}</tr>`)}
                </tbody>
            </table>
        </div>
    `},oi=(e,t)=>{const a=e.metadata;return e.id&&t&&t[e.id]?t[e.id]:a?.page?.content??[]},yn=e=>{const a=e.metadata.items??[];return o`
        <div class="mateu-message-list ${e.cssClasses??""}"
             style="display:flex; flex-direction:column; gap:.75rem; ${e.style??""}"
             slot="${e.slot??l}">
            ${a.map(r=>o`
                <div style="display:flex; gap:.6rem; align-items:flex-start;">
                    <span style="flex:0 0 auto; width:2rem; height:2rem; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:.8rem; background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);">
                        ${r.userImg?o`<img src="${r.userImg}" alt="" style="width:100%; height:100%; object-fit:cover;">`:r.userAbbr??(r.userName?r.userName.charAt(0):"?")}
                    </span>
                    <div style="min-width:0;">
                        <div style="display:flex; gap:.5rem; align-items:baseline;">
                            ${r.userName?o`<span style="font-weight:600;">${r.userName}</span>`:l}
                            ${r.time?o`<span style="font-size:var(--lumo-font-size-xs,.75rem); color:var(--lumo-secondary-text-color,#666);">${r.time}</span>`:l}
                        </div>
                        <div style="white-space:pre-wrap; overflow-wrap:anywhere;">${r.text}</div>
                    </div>
                </div>
            `)}
        </div>
    `},Yi=(e,t,a,r,i,s,n)=>t.separator?o`<span style="align-self: stretch; width: 1px; background: var(--lumo-contrast-20pct, rgba(0,0,0,.2));"></span>`:t.submenus?o`
            <details style="position: relative;">
                <summary style="cursor: pointer; list-style: none; padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);">
                    ${t.component?g(e,t.component,a,r,i,s,n):t.label} ▾
                </summary>
                <div style="display: flex; flex-direction: column; gap: .1rem; padding: .3rem; min-width: 10rem;
                            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px);
                            background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15));">
                    ${t.submenus.map(d=>Yi(e,d,a,r,i,s,n))}
                </div>
            </details>
        `:o`
        <span class="${t.className??""}"
              style="cursor: ${t.disabled?"default":"pointer"}; opacity: ${t.disabled?.5:1};
                     padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
                     ${t.selected?"background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));":""}">
            ${t.component?g(e,t.component,a,r,i,s,n):t.label}
        </span>
    `,$n=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`
        <div style="display: flex; flex-wrap: wrap; gap: .25rem; align-items: center; ${t.style}"
             class="${t.cssClasses}" slot="${t.slot??l}">
            ${d.options?.map(c=>Yi(e,c,a,r,i,{},{}))}
        </div>
    `},xn=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`
        <div style="${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${g(e,d.wrapped,a,r,i,s,n)}
        </div>
    `},wn=(e,t,a,r,i,s,n)=>{const d=t.metadata,c=d.content?.metadata,u=c?.type==h.Notice&&c.fullWidth===!0;return o`
        <div style="display:flex; flex-direction:column; ${u?"width: 100%; ":""}${t.style}"
             class="${t.cssClasses}"
             slot="${t.slot??l}"
             data-colspan="${d.colspan||(u?99:l)}"
        >
            ${d.label?o`<label style="font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${d.label}</label>`:l}
            ${g(e,d.content,a,r,i,s,n)}
        </div>
            `},kn=e=>{const t=e.metadata,a=r=>{const i=r.closest(".mateu-message-input")?.querySelector("input"),s=i?.value??"";!t.actionId||!s.trim()||(r.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:s}},bubbles:!0,composed:!0})),i&&(i.value=""))};return o`
        <div class="mateu-message-input ${e.cssClasses??""}"
             style="display:flex; gap:.5rem; align-items:center; ${e.style??""}"
             slot="${e.slot??l}">
            <input type="text"
                   style="flex:1; min-width:0; font:inherit; padding:.5rem .75rem; border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16)); border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513);"
                   @keydown="${r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),a(r.currentTarget))}}">
            <button style="font:inherit; font-weight:500; cursor:pointer; padding:.5rem 1rem; border:none; border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);"
                    @click="${r=>a(r.currentTarget)}">Send</button>
        </div>
    `},Cn=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`<span title="${d.text}" style="${t.style}" class="${t.cssClasses}" slot="${t.slot??l}"
        >${g(e,d.wrapped,a,r,i,s,n)}</span>`},_n=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const a in e){const r=e[a];["number","string","boolean"].indexOf(typeof r)>=0&&(t[a]=e[a])}return t},ni=(e,t,a)=>{for(let r in t.attributes)e.setAttribute(r,t.attributes[r]);a.style&&e.setAttribute("style",a.style),a.cssClasses&&e.setAttribute("class",a.cssClasses),a.slot&&e.setAttribute("slot",a.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},In=e=>{const t=e.name,a=e.attributes?e.attributes.import:void 0;a&&t.includes("-")&&!customElements.get(t)&&import(a)},Sn=(e,t,a)=>{In(t);let r=t.name;return t.attributes&&t.attributes.id&&(r="#"+t.attributes.id),setTimeout(()=>{const i=e.shadowRoot?.querySelector(".element-container")?.querySelector(r);if(i){for(;i.firstChild;)i.removeChild(i.lastChild);ni(i,t,a)}else{const s=document.createElement(t.name);ni(s,t,a);for(let n in t.on)s.addEventListener(n,d=>{const c=_n(d);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[n],parameters:{event:c}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(".element-container")?.appendChild(s)}}),o`<div class="element-container"></div>`};var We=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(We||{});const En=(e,t,a,r,i)=>{const s=e.metadata,n=s.attributes?.["data-colspan"],d=Ca(s.text,t,a,r,i),c={xl:"var(--lumo-font-size-xl, 1.375rem)",l:"var(--lumo-font-size-l, 1.125rem)",s:"var(--lumo-font-size-s, .875rem)",xs:"var(--lumo-font-size-xs, .8125rem)"},u=(s.size&&c[s.size]?`font-size: ${c[s.size]}; `:"")+(s.noMargins?"margin-block-start: 0; margin-block-end: 0; ":"");return We.h1==s.container?o`
            <h1 style="${u}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h1>
        `:We.h2==s.container?o`
            <h2 style="${u}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h2>
        `:We.h3==s.container?o`
            <h3 style="${u}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h3>
        `:We.h4==s.container?o`
            <h4 style="${u}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h4>
        `:We.h5==s.container?o`
            <h5 style="${u}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h5>
        `:We.h6==s.container?o`
            <h6 style="${u}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(n)}"
                slot="${e.slot??l}">
                ${d??l}
            </h6>
        `:We.p==s.container?o`
               <p style="${u}${e.style}" class="${e.cssClasses}"
                  id="${E(e.id)}"
                  data-colspan="${E(n)}"
                  slot="${e.slot??l}">
                   ${d??l}
               </p>
            `:We.div==s.container?o`
               <div style="${u}${e.style}" class="${e.cssClasses}"
                    id="${E(e.id)}"
                    data-colspan="${E(n)}"
                    slot="${e.slot??l}">${d?ye(d):l}</div>
            `:We.span==s.container?o`
               <span style="${u}${e.style}" class="${e.cssClasses}"
                     id="${E(e.id)}"
                     data-colspan="${E(n)}"
                    slot="${e.slot??l}">${d??l}</span>
            `:o`
               <p
                       id="${E(e.id)}"
                       data-colspan="${E(n)}"
                       slot="${e.slot??l}">
                   Unknown text container: ${s.container} 
               </p>
            `},Pn=e=>{const t=e.metadata;return o`<a href="${t.url}" target="${t.target??l}"
                   rel="${t.target==="_blank"?"noopener":l}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??l}">${t.text}</a>`},Ji=(e,t)=>{const a=e.toLowerCase().split("+");return t.ctrlKey===a.includes("ctrl")&&t.altKey===a.includes("alt")&&t.shiftKey===a.includes("shift")&&t.metaKey===a.includes("meta")},Tn=(e,t)=>{if(!Ji(e,t))return!1;const a=e.toLowerCase().split("+"),r=a[a.length-1];return!!(t.key.toLowerCase()===r||/^[a-z]$/.test(r)&&t.code==="Key"+r.toUpperCase()||/^[0-9]$/.test(r)&&(t.code==="Digit"+r||t.code==="Numpad"+r))},Xi=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,Qi=(e,t)=>{const a=e.currentTarget.dataset.actionId;e.currentTarget?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a,parameters:t.parameters},bubbles:!0,composed:!0}))},zn="display:inline-flex; align-items:center; justify-content:center; gap:.4em; box-sizing:border-box; font:inherit; font-weight:500; cursor:pointer; border-radius:var(--lumo-border-radius-m,6px); border:1px solid transparent; line-height:1; white-space:nowrap;",On=e=>{const t=e.buttonStyle??"",a=e.color&&e.color!=="none"&&e.color!=="normal"?e.color:"",r=e.size,i=a==="success"?"var(--lumo-success-color,#1a7f37)":a==="error"?"var(--lumo-error-color,#c5221f)":a==="contrast"?"var(--lumo-contrast,#161513)":"var(--lumo-primary-color,#3b5bdb)",s=a==="success"?"var(--lumo-success-contrast-color,#fff)":a==="error"?"var(--lumo-error-contrast-color,#fff)":a==="contrast"?"var(--lumo-base-color,#fff)":"var(--lumo-primary-contrast-color,#fff)",n=a==="success"?"var(--lumo-success-text-color,#1a7f37)":a==="error"?"var(--lumo-error-text-color,#c5221f)":a==="contrast"?"var(--lumo-body-text-color,#161513)":"var(--lumo-primary-text-color,#3b5bdb)";let d;return t==="primary"?d=`background:${i}; color:${s};`:t==="tertiary"||t==="tertiaryInline"?d=`background:transparent; color:${n};`:d=`background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:${n}; border-color:var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,`${zn}${d}${r==="small"?"padding:.25rem .6rem; font-size:var(--lumo-font-size-s,.875rem);":r==="large"?"padding:.65rem 1.4rem; font-size:var(--lumo-font-size-l,1.125rem);":"padding:.45rem 1rem; font-size:var(--lumo-font-size-m,1rem);"}`},Rn=(e,t,a)=>{const r=e.metadata,i=$e(r.label,t,a);return o`<button
            id="${e.id}"
            data-action-id="${r.actionId}"
            @click="${s=>Qi(s,r)}"
            style="${On(r)}${e.style}"
            class="${e.cssClasses}"
            ?disabled="${r.disabled}"
            title="${r.shortcut?`${i} (${Xi(r.shortcut)})`:l}"
            slot="${e.slot??l}"
    >${r.iconOnLeft?U(r.iconOnLeft):l}${i}${r.iconOnRight?U(r.iconOnRight):l}</button>`},Ln="display:block; box-sizing:border-box; background:var(--lumo-base-color,#fff); border:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.1)); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-xs,0 1px 3px rgba(0,0,0,.08)); overflow:hidden;",An=(e,t,a,r,i,s,n)=>{const d=t.metadata;if(!d)return o``;const c=m=>m?g(e,m,a,r,i,s,n,!1):l,u=d.header||d.headerPrefix||d.headerSuffix||d.title||d.subtitle;return o`
        <div style="${Ln}${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            ${d.media?c(d.media):l}
            ${u?o`<div style="display:flex; align-items:flex-start; gap:.75rem; padding:1rem 1.25rem ${d.content||d.footer?"0":"1rem"};">
                ${d.headerPrefix?c(d.headerPrefix):l}
                <div style="flex:1; min-width:0;">
                    ${d.header?c(d.header):l}
                    ${d.title?o`<div style="font-weight:600; font-size:1.05rem; color:var(--lumo-body-text-color,#161513);">${c(d.title)}</div>`:l}
                    ${d.subtitle?o`<div style="color:var(--lumo-secondary-text-color,#667);">${c(d.subtitle)}</div>`:l}
                </div>
                ${d.headerSuffix?c(d.headerSuffix):l}
            </div>`:l}
            ${d.content?o`<div style="padding:1rem 1.25rem;">${c(d.content)}</div>`:l}
            ${d.footer?o`<div style="padding:0 1.25rem 1rem;">${c(d.footer)}</div>`:l}
        </div>
    `},Dn=e=>{const t=e.metadata;return o`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??l}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},Fn=e=>{const t=e.metadata;return U(t.icon,e.style,e.cssClasses,e.slot)},Cr=(e,t)=>{e&&e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},Zi="font:inherit; font-weight:500; cursor:pointer; padding:.45rem 1rem; border-radius:var(--lumo-border-radius-m,6px);",li=`${Zi} background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:var(--lumo-body-text-color,#161513); border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,qn=`${Zi} background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff); border:1px solid transparent;`,Mn=(e,t,a,r,i,s,n)=>{const d=t.metadata;let c=!1;if(d.openedCondition)try{c=Nr(d.openedCondition,r,i,s,n)}catch(u){console.error("when evaluating "+d.openedCondition+" :"+u+", where data is "+i+" and state is "+r)}return c?o`
        <div class="mateu-confirm-dialog ${t.cssClasses??""}"
             style="position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.4); ${t.style??""}"
             slot="${t.slot??l}">
            <div style="background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-l,0 8px 24px rgba(0,0,0,.2)); width:100%; max-width:min(90vw,32rem); padding:1.5rem; box-sizing:border-box;">
                ${d.header?o`<h3 style="margin:0 0 .75rem; font-size:1.15rem;">${d.header}</h3>`:l}
                <div>${t.children?.map(u=>g(e,u,a,r,i,s,n))}</div>
                <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:1.25rem;">
                    ${d.canCancel?o`<button style="${li}" @click="${u=>Cr(u.currentTarget,d.cancelActionId)}">${d.rejectText&&!d.canReject?d.rejectText:"Cancel"}</button>`:l}
                    ${d.canReject?o`<button style="${li}" @click="${u=>Cr(u.currentTarget,d.rejectActionId)}">${d.rejectText||"No"}</button>`:l}
                    <button style="${qn}" @click="${u=>Cr(u.currentTarget,d.confirmActionId)}">${d.confirmText||"OK"}</button>
                </div>
            </div>
        </div>
    `:o``},Nn=e=>{const t=e.metadata;let a;return t.position&&(a={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),o`
        <mateu-cookie-consent style="${e.style}" class="${e.cssClasses}"
                               slot="${e.slot??l}"
                               position="${a??l}"
                               cookie-name="${t.cookieName??l}"
                               .message="${t.message??l}"
                               theme="${t.theme??l}"
                               .learnMore="${t.learnMore??l}"
                               .learnMoreLink="${t.learnMoreLink??l}"
                               .dismiss="${t.dismiss??l}"
        ></mateu-cookie-consent>
    `},Un=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`
        <details
                ?open="${d.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??l}"
        >
            <summary>${g(e,d.summary,a,r,i,s,n)}</summary>
            ${g(e,d.content,a,r,i,s,n)}
        </details>
            `},jn=(e,t,a,r,i,s)=>o`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${s}"
        ></mateu-dialog>
            `,Bn=(e,t,a,r,i,s)=>o`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${s}"
        ></mateu-drawer>
            `,Vn=e=>{const t=e.metadata;return o`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"  
                  route="${t.route}" 
                  consumedRoute="${t.consumedRoute}" 
                  id="${xe()}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??l}"
        ></mateu-ux>
        </mateu-api-caller>
            `},Hn=e=>{const t=e.metadata;return o`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??l}"></mateu-markdown>
            `},Wn=e=>{const t=e.metadata;return o`
        <div
            role="status"
            slot="${e.slot??l}"
            class="${e.cssClasses}"
            style="display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem;
                   border-radius: var(--lumo-border-radius-m, 8px);
                   background: var(--lumo-contrast-5pct, rgba(0,0,0,0.05));
                   color: var(--lumo-body-text-color, #1a1a1a); ${e.style}"
        >
            ${t.title?o`<strong>${t.title}</strong>`:l}
            ${t.text?o`<span>${t.text}</span>`:l}
        </div>
    `},Gn=(e,t={})=>{const a=e.metadata,r=a.valueKey?t[a.valueKey]:a.value,i=a.max&&a.max!=0?a.max:1,s=!a.indeterminate&&r!=null;return o`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
            <progress
                    style="width:100%;"
                    max="${i}"
                    .value="${s?r:l}"
            ></progress>
            ${a.text?o`<span class="text-secondary text-xs" id="sublbl">
    ${a.text}
  </span>`:l}
        </div>
    `},Kn=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`
        <details style="position: relative; ${t.style}" class="${t.cssClasses}" slot="${t.slot??l}">
            <summary style="list-style: none; cursor: pointer;">${g(e,d.wrapped,a,r,i,s,n)}</summary>
            <div style="position: absolute; z-index: 100; min-width: 300px; margin-top: .25rem; padding: .6rem .8rem;
                        border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px);
                        background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.2));">
                ${g(e,d.content,a,r,i,s,n)}
            </div>
        </details>
    `},Yn=e=>{const t=e.metadata;return o`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??l}"></mateu-map>
            `},Jn=e=>{const t=e.metadata;return o`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??l}">
            `},Xn=e=>{const t=e.metadata;return o`<div style="display:flex; align-items:center; gap:0.5rem;" slot="${e.slot??l}">
        ${t.breadcrumbs.map(a=>o`
            <a href="${a.link}">${a.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </div>`},Qn=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${d.dots}" 
                ?nav = "${d.nav}" 
                ?loop = "${d.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>o`<div>${g(e,c,a,r,i,s,n)}</div>`)}
        </skeleton-carousel>
    `},Zn=(e,t,a,r)=>{const i=e.metadata;return o`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
            ${i.menu.map(s=>es(s))}
        </div>
            `},es=e=>o`
        ${e.submenus?o`
                <details open>
                    <summary>${e.label}</summary>
                    <div style="display:flex; flex-direction:column; gap:0.25rem; padding-left:0.5rem;">
                        ${e.submenus.map(t=>es(t))}
                    </div>
                </details>
            `:o`
                <a href="${e.path}">${e.label}</a>
        `}
        `,el=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`<div
                slot="${t.slot??l}"
                style="${t.style}" class="${t.cssClasses}"
        >${d.content?ye(d.content):l}${t.children?.map(c=>g(e,c,a,r,i,s,n))}</div>
    `},tl=(e,t,a,r,i,s,n)=>{const d=t.metadata,c=d.title?.includes("${")?e._evalTemplate(d.title):d.title;return o`<div
                slot="${t.slot??l}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?o`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${c}</div>`:l}
        ${t.children?.map(u=>g(e,u,a,r,i,s,n))}
    </div>
    `},al=(e,t,a,r,i,s,n)=>{const d=t.metadata,c=d.title?.includes("${")?e._evalTemplate(d.title):d.title;return o`
        <div
                slot="${t.slot??l}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(u=>g(e,u,a,r,i,s,n))}</div>
    `},rl=(e,t,a)=>{a.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:e,value:t},bubbles:!0,composed:!0}))},Ba=e=>t=>{const a=t.target,r=a.type==="checkbox"?a.checked:a.value;rl(e.fieldId,r,a)},il=(e,t)=>{const a=e.metadata,r=t?.[a.fieldId]??"",i=a,s=i.dataType,n=i.stereotype,d=!!i.readOnly,c=!!i.disabled,u=i.options,m=a.label?o`<label style="display:block; font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${a.label}</label>`:l,v="width:100%; box-sizing:border-box; padding:.4rem .6rem; border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.3)); border-radius: var(--lumo-border-radius-m,6px); font:inherit; background: var(--lumo-base-color,#fff); color: var(--lumo-body-text-color,#1a1a1a);";let f;return d||n==="plainText"?f=o`<div style="padding:.4rem 0;">${String(r??"")}</div>`:s==="boolean"||n==="checkbox"||n==="badge"?f=o`<input type="checkbox" ?checked="${!!r}" ?disabled="${c}" @change="${Ba(a)}">`:u&&u.length?f=o`
            <select style="${v}" ?disabled="${c}" @change="${Ba(a)}">
                <option value="">—</option>
                ${u.map(w=>o`<option value="${w.value}" ?selected="${w.value===r}">${w.label}</option>`)}
            </select>`:n==="textarea"||n==="richText"||n==="html"?f=o`<textarea style="${v}" rows="3" ?disabled="${c}" @input="${Ba(a)}">${String(r??"")}</textarea>`:f=o`<input type="${s==="integer"||s==="number"||s==="double"||s==="money"?"number":s==="date"?"date":s==="datetime"?"datetime-local":s==="time"?"time":n==="password"?"password":s==="email"?"email":"text"}" style="${v}" .value="${String(r??"")}"
                              placeholder="${i.placeholder??l}" ?disabled="${c}" @input="${Ba(a)}">`,o`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??l}">
            ${m}
            ${f}
        </div>
    `},Lr=(e,t,a,r,i,s,n,d)=>{const c=t.metadata,u=c?.fabs??[];return o`<mateu-page
            .component="${t}"
            baseUrl="${a}"
            .state="${r}"
            .data="${i}"
            .appState="${s}"
            .appdata="${n}"
            slot="${t.slot??l}"
            style="${t.style}"
            class="${t.cssClasses}"
            ?standalone="${d??!1}"
    >
        ${t.children?.map(m=>g(e,m,a,r,i,s,n))}
        ${c?.buttons?.map(m=>o`
                   ${g(e,{id:m.actionId,metadata:m,type:W.ClientSide,slot:"buttons"},void 0,r,i,s,n)}
`)}
        ${u.map((m,v)=>o`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+v*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:m.actionId},bubbles:!0,composed:!0}))}"
                title="${m.label}">
                ${U(m.icon)}
            </button>
        `)}
</mateu-page>
    `},Ar=(e,t,a,r,i,s,n,d)=>o`<mateu-table-crud
            id="${t.id}"
            baseUrl="${a}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${r}"
            .data="${i}"
            .appState="${s}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??l}"
            ?standalone="${d??!1}"
    >
        ${t.children?.map(c=>g(e,c,a,r,i,s,n))}
    </mateu-table-crud>`,sl=e=>{const t=e.metadata;return o`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??l}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},ol=(e,t,a)=>{const r=e.metadata;return o`<mateu-chat sseUrl="${r.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??l}"></mateu-chat>`},nl=e=>{const t=e.metadata;return o`
        <mateu-workflow
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},ll=e=>{const t=e.metadata;return o`
        <mateu-form-editor
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},ts=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,dl=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",cl=e=>e=="up"?"▲":e=="down"?"▼":"",ul=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},pl=e=>{const t=e.metadata,a=!!t.actionId;return o`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${ts} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${a?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??l}"
             role="${a?"button":l}"
             @click="${r=>ul(r,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?U(t.icon,"color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;"):l}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?o`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:l}
            </div>
            ${t.trend||t.trendLabel?o`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${dl(t.trend)};">
                    ${cl(t.trend)} ${t.trendLabel??l}
                </span>
            `:l}
            ${t.description?o`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:l}
        </div>
    `},hl=(e,t,a,r,i,s,n)=>o`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${t.children?.map(d=>g(e,d,a,r,i,s,n))}
        </div>
    `,ml=(e,t,a,r,i,s,n)=>{const d=t.metadata,c=d.colSpan&&d.colSpan>1?`grid-column: span ${d.colSpan};`:"",u=d.rowSpan&&d.rowSpan>1?`grid-row: span ${d.rowSpan};`:"";return o`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${ts} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${u} ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${d.title?o`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${d.title}</h3>
                    ${d.subtitle?o`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${d.subtitle}</span>`:l}
                </div>
            `:l}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(m=>g(e,m,a,r,i,s,n))}
            </div>
        </div>
    `},vl=(e,t,a,r,i,s,n)=>{const d=t.metadata,c=d.columns&&d.columns>0?`repeat(${d.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return o`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${t.children?.map(u=>g(e,u,a,r,i,s,n))}
        </div>
    `};var fl=Object.defineProperty,bl=Object.getOwnPropertyDescriptor,lt=(e,t,a,r)=>{for(var i=r>1?void 0:r?bl(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&fl(t,a,i),i};let Le=class extends C{constructor(){super(...arguments),this.panels=[],this.headerTitle="",this.badges=[],this.orientation="vertical",this.navigation=null,this.overviewEditActionId="",this.openPanels=new Set,this.expandedPanel=null,this._onPopState=()=>{const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),a=this.panels.findIndex((r,i)=>this.panelAnchor(r,i)===t);this.expandedPanel=a>=0?a:null}else this.expandedPanel=null},this.initialized=!1}navAction(e){e&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),window.addEventListener("popstate",this._onPopState)}disconnectedCallback(){window.removeEventListener("popstate",this._onPopState),super.disconnectedCallback()}willUpdate(){if(!this.initialized&&this.panels.length){this.openPanels=new Set(this.panels.map((t,a)=>t.open?a:-1).filter(t=>t>=0));const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),a=this.panels.findIndex((r,i)=>this.panelAnchor(r,i)===t);a>=0&&(this.expandedPanel=a)}else if(e){const t=this.panels.findIndex((a,r)=>this.panelAnchor(a,r)===e);t>=0&&this.openPanels.add(t)}this.initialized=!0}}firstUpdated(){const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(!e)return;const t=this.renderRoot.querySelector(`[data-anchor="${CSS.escape(e)}"]`);t&&t.scrollIntoView({block:"nearest"})}panelAnchor(e,t){return(e.title??"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`panel-${t}`}bookmarkPanel(e){const t=this.panelAnchor(this.panels[e],e);try{history.replaceState(history.state,"","#"+t)}catch{}}clearBookmark(e){const t=this.panelAnchor(this.panels[e],e);if(decodeURIComponent((location.hash||"").replace(/^#/,""))===t)try{history.replaceState(history.state,"",location.pathname+location.search)}catch{}}expandPanel(e,t){t?.stopPropagation(),this.expandedPanel=e;const a=this.panelAnchor(this.panels[e],e);try{history.pushState(history.state,"","#expand="+a)}catch{}}collapsePanel(){try{history.back()}catch{this.expandedPanel=null}}toggle(e){const t=new Set(this.openPanels);t.has(e)?(t.delete(e),this.clearBookmark(e)):(t.add(e),this.bookmarkPanel(e)),this.openPanels=t}render(){if(this.expandedPanel!=null&&this.panels[this.expandedPanel]){const t=this.panels[this.expandedPanel];return o`
                <div class="expanded-view" part="expanded-view">
                    <div class="expanded-header">
                        <button class="nav-parent" title="Back"
                                @click="${()=>this.collapsePanel()}">
                            <span>‹</span><span>Back</span>
                        </button>
                        <span class="nav-title">${t.title}</span>
                        ${t.subtitle?o`<span class="subtitle">${t.subtitle}</span>`:l}
                    </div>
                    <div class="expanded-body">
                        <slot name="panel-${this.expandedPanel}"></slot>
                    </div>
                </div>
            `}const e=this.navigation;return o`
            ${e?o`
                <div class="nav-header" part="nav-header">
                    ${e.parentActionId?o`
                        <button class="nav-parent" title="${e.parentLabel??"Back"}"
                                @click="${()=>this.navAction(e.parentActionId)}">
                            <span>‹</span><span>${e.parentLabel??"Back"}</span>
                        </button>
                    `:l}
                    ${e.title?o`<span class="nav-title">${e.title}</span>`:l}
                    <span class="nav-spacer"></span>
                    ${e.previousActionId?o`
                        <button class="nav-move" title="Previous"
                                @click="${()=>this.navAction(e.previousActionId)}">‹</button>
                    `:l}
                    ${e.nextActionId?o`
                        <button class="nav-move" title="Next"
                                @click="${()=>this.navAction(e.nextActionId)}">›</button>
                    `:l}
                </div>
            `:l}
            ${this.headerTitle?o`
                <div class="header-band" part="header-band">
                    <div class="header-content">
                        <h2 class="header-title">${this.headerTitle}</h2>
                        ${this.badges.length?o`
                            <div class="header-badges">
                                ${this.badges.map(t=>o`<span class="header-badge">${t}</span>`)}
                            </div>
                        `:""}
                    </div>
                    <div class="header-accent" part="header-accent"></div>
                </div>
            `:""}
            <div class="columns" part="columns">
                <div class="overview" part="overview">
                    ${this.overviewEditActionId?o`
                        <button class="overview-edit" title="Edit"
                                @click="${()=>this.navAction(this.overviewEditActionId)}">
                            <span>✎</span><span>Edit</span>
                        </button>
                    `:l}
                    <slot name="overview"></slot>
                </div>
                <div class="rail" part="rail">
                    ${this.panels.map((t,a)=>this.openPanels.has(a)?o`
                        <div class="panel" part="panel" data-anchor="${this.panelAnchor(t,a)}"
                             @click="${()=>this.bookmarkPanel(a)}">
                            <div class="panel-header">
                                <div>
                                    <h3>${t.title}</h3>
                                    ${t.subtitle?o`<div class="subtitle">${t.subtitle}</div>`:""}
                                </div>
                                <span class="panel-actions">
                                    <button class="panel-expand" title="Show all"
                                            @click="${r=>this.expandPanel(a,r)}">⤢</button>
                                    <button class="fold" title="Fold" @click="${r=>{r.stopPropagation(),this.toggle(a)}}">⟨</button>
                                </span>
                            </div>
                            <div style="flex: 1; min-height: 0;">
                                <slot name="panel-${a}"></slot>
                            </div>
                        </div>
                    `:o`
                        <div class="strip" role="button" title="${t.title}"
                             data-anchor="${this.panelAnchor(t,a)}" @click="${()=>this.toggle(a)}">
                            <button class="fold" tabindex="-1">⟩</button>
                            <span>${t.title}</span>
                        </div>
                    `)}
                </div>
            </div>
        `}};Le.styles=$`
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
    `;lt([p({type:Array})],Le.prototype,"panels",2);lt([p({type:String})],Le.prototype,"headerTitle",2);lt([p({type:Array})],Le.prototype,"badges",2);lt([p({type:String,reflect:!0})],Le.prototype,"orientation",2);lt([p({attribute:!1})],Le.prototype,"navigation",2);lt([p({type:String})],Le.prototype,"overviewEditActionId",2);lt([b()],Le.prototype,"openPanels",2);lt([b()],Le.prototype,"expandedPanel",2);Le=lt([k("mateu-foldout")],Le);const gl=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`
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
            ${t.children?.map(c=>g(e,c,a,r,i,s,n))}
        </mateu-foldout>
    `},yl=(e,t,a,r,i,s,n)=>{const d=t.metadata,c=!!d.image,u=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${d.image}'); background-size: cover; background-position: center; color: #fff;`:"",m=d.centered===!1?"flex-start":"center",v=d.centered===!1?"left":"center";return o`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${m}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${v}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${d.height??"12rem"}; box-sizing: border-box; ${u} ${t.style??""}"
             slot="${t.slot??l}"
        >
            ${d.title?o`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${d.title}</h1>`:l}
            ${d.subtitle?o`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${d.subtitle}</p>`:l}
            ${t.children?.length?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${m}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(f=>g(e,f,a,r,i,s,n))}
                </div>
            `:l}
        </div>
    `};var $l=Object.defineProperty,xl=Object.getOwnPropertyDescriptor,Hr=(e,t,a,r)=>{for(var i=r>1?void 0:r?xl(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&$l(t,a,i),i};const _r=1440*60*1e3;let Ia=class extends C{constructor(){super(...arguments),this.tasks=[],this.onTaskSelectionActionId=""}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-_r,max:Math.max(...e)+2*_r}:null}months(e,t){const a=[],r=new Date(e);for(r.setDate(1);r.getTime()<=t;){const i=Math.max(r.getTime(),e),s=new Date(r.getFullYear(),r.getMonth()+1,1),n=Math.min(s.getTime(),t);a.push({label:r.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:i,to:n}),r.setMonth(r.getMonth()+1)}return a}render(){const e=this.range();if(!e)return o``;const t=e.max-e.min,a=i=>(i-e.min)/t*100,r=Date.now();return o`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(i=>o`
                        <div class="month" style="width: ${(i.to-i.from)/t*100}%;">${i.label}</div>
                    `)}
                </div>
                ${this.tasks.map(i=>{const s=new Date(i.start+"T00:00:00").getTime(),n=new Date(i.end+"T00:00:00").getTime()+_r;return o`
                        <div class="label" title="${i.title}">${i.title}</div>
                        <div class="lane">
                            ${r>=e.min&&r<=e.max?o`<div class="today" style="left: ${a(r)}%;"></div>`:l}
                            <div class="bar ${this.onTaskSelectionActionId?"clickable":""}"
                                 title="${i.title} · ${i.start} → ${i.end}${i.progress?` · ${i.progress}%`:""}"
                                 @click="${()=>this.selectTask(i)}"
                                 style="left: ${a(s)}%; width: ${(n-s)/t*100}%; ${i.color?`--mateu-gantt-fill: ${i.color};`:""}">
                                <div class="fill" style="width: ${i.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};Ia.styles=$`
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
    `;Hr([p({type:Array})],Ia.prototype,"tasks",2);Hr([p()],Ia.prototype,"onTaskSelectionActionId",2);Ia=Hr([k("mateu-gantt")],Ia);const wl=e=>{const t=e.metadata;return o`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                .onTaskSelectionActionId="${t.onTaskSelectionActionId??""}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-gantt>
    `};var kl=Object.defineProperty,Cl=Object.getOwnPropertyDescriptor,Ct=(e,t,a,r)=>{for(var i=r>1?void 0:r?Cl(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&kl(t,a,i),i};let L=class extends C{constructor(){super(...arguments),this.resources=[],this.blocks=[],this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key==="Escape"&&this.drag&&(e.stopPropagation(),this.endDrag())}}static parse(e){return new Date(e+"T00:00:00")}static iso(e){const t=a=>String(a).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){const r=L.parse(this.from),i=L.daysBetween(r,L.parse(this.to))+1;return i>0?{from:r,days:i}:null}const e=this.blocks.flatMap(r=>[r.start,r.end]).filter(r=>!!r).map(r=>L.parse(r));if(!e.length)return null;const t=new Date(Math.min(...e.map(r=>r.getTime()))),a=new Date(Math.max(...e.map(r=>r.getTime())));return{from:t,days:L.daysBetween(t,a)+1}}onBlockPointerDown(e,t,a){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;const s=L.parse(t.start),n=L.parse(t.end),d=Math.max(1,L.daysBetween(s,n)+1);this.laneRects=[...this.renderRoot.querySelectorAll(".lane[data-resource-id]")].map(u=>({resourceId:u.dataset.resourceId,rect:u.getBoundingClientRect()}));const c=this.dayAt(t.resourceId,e.clientX)??a;this.drag={blockId:t.id,duration:d,grabOffsetDays:c-a,originResourceId:t.resourceId,originStartIdx:a,targetResourceId:t.resourceId,targetStartIdx:a,moved:!1},window.addEventListener("keydown",this.onDragKeydown)}dayAt(e,t){const a=this.laneRects.find(s=>s.resourceId===e),r=this.window();if(!a||!r||a.rect.width===0)return null;const i=Math.floor((t-a.rect.left)/a.rect.width*r.days);return Math.max(0,Math.min(r.days-1,i))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;const t=this.window();if(!t)return;const a=this.laneRects.find(s=>e.clientY>=s.rect.top&&e.clientY<=s.rect.bottom)??this.laneRects.find(s=>s.resourceId===this.drag.targetResourceId);if(!a)return;const r=this.dayAt(a.resourceId,e.clientX);if(r==null)return;const i=Math.max(0,Math.min(t.days-this.drag.duration,r-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:a.resourceId,targetStartIdx:i}}onBlockPointerUp(e){const t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;const a=this.window();if(!a)return;const r=L.addDays(a.from,t.targetStartIdx),i=L.addDays(r,t.duration-1);this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:L.iso(r),_end:L.iso(i)}},bubbles:!0,composed:!0}))}endDrag(){this.drag=null,window.removeEventListener("keydown",this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.onDragKeydown)}render(){const e=this.window();if(!e||!this.resources.length)return o``;const t=[...Array(e.days).keys()].map(d=>L.addDays(e.from,d)),a=new Date,r=L.daysBetween(e.from,new Date(a.getFullYear(),a.getMonth(),a.getDate())),i=r>=0&&r<e.days,s=[];let n;return this.resources.forEach(d=>{d.group&&d.group!==n&&s.push(o`<div class="group">${d.group}</div>`),n=d.group,s.push(this.renderRow(d,e,t,i?r:null))}),o`
            <div class="frame" style="grid-template-columns: minmax(8rem, 12rem) repeat(${e.days}, minmax(2.2rem, 1fr));">
                <div class="corner">Resource</div>
                ${t.map((d,c)=>o`
                    <div class="day-head ${this.isWeekend(d)?"weekend":""} ${c===r?"today":""}">
                        <span class="dow">${d.toLocaleDateString(void 0,{weekday:"short"})}</span>
                        <span class="num">${d.getDate()}</span>
                    </div>
                `)}
                ${s}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(e,t,a,r){const i=100/t.days,s=this.blocks.filter(d=>d.resourceId===e.id&&d.start&&d.end),n=this.drag?.moved&&this.drag.targetResourceId===e.id?this.drag:null;return o`
            <div class="label" title="${e.label??""}">${e.label}</div>
            <div class="lane" data-resource-id="${e.id}">
                <div class="cells">
                    ${a.map(d=>o`<div class="cell ${this.isWeekend(d)?"weekend":""}"></div>`)}
                </div>
                ${r!=null?o`<div class="today-line" style="left: ${(r+.5)*i}%;"></div>`:l}
                ${s.map(d=>{const c=L.daysBetween(t.from,L.parse(d.start)),u=L.daysBetween(t.from,L.parse(d.end));if(u<0||c>=t.days)return l;const m=Math.max(0,c),v=Math.min(t.days-1,u),f=this.drag?.moved&&this.drag.blockId===d.id;return o`
                        <div class="block ${this.selectActionId?"clickable":""} ${this.moveActionId?"draggable":""} ${f?"dragging":""}"
                             title="${d.label??""} · ${d.start} → ${d.end}${d.status?` · ${d.status}`:""}"
                             style="left: ${m*i}%; width: ${(v-m+1)*i}%; ${d.color?`--mateu-planning-block: ${d.color};`:""}"
                             @pointerdown="${w=>this.onBlockPointerDown(w,d,c)}"
                             @pointermove="${w=>this.onBlockPointerMove(w)}"
                             @pointerup="${()=>this.onBlockPointerUp(d)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${d.label}</div>
                    `})}
                ${n?o`
                    <div class="ghost"
                         style="left: ${n.targetStartIdx*i}%; width: ${Math.min(n.duration,t.days-n.targetStartIdx)*i}%;"></div>
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
    `;Ct([p({type:Array})],L.prototype,"resources",2);Ct([p({type:Array})],L.prototype,"blocks",2);Ct([p()],L.prototype,"from",2);Ct([p()],L.prototype,"to",2);Ct([p()],L.prototype,"moveActionId",2);Ct([p()],L.prototype,"selectActionId",2);Ct([b()],L.prototype,"drag",2);L=Ct([k("mateu-planning-board")],L);const _l=e=>{const t=e.metadata;return o`
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
    `};var Il=Object.defineProperty,Sl=Object.getOwnPropertyDescriptor,as=(e,t,a,r)=>{for(var i=r>1?void 0:r?Sl(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Il(t,a,i),i};let Ka=class extends C{constructor(){super(...arguments),this.columns=[]}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="board">
                ${this.columns.map(e=>o`
                    <div class="column" style="${e.color?`--mateu-kanban-accent: ${e.color};`:""}">
                        <div class="column-head">
                            <span class="column-title" title="${e.title??""}">${e.title}</span>
                            <span class="count">${e.cards?.length??0}</span>
                        </div>
                        ${(e.cards??[]).map(t=>o`
                            <div class="card ${t.actionId?"clickable":""}"
                                 style="${t.color?`--mateu-kanban-card-accent: ${t.color};`:""}"
                                 @click="${()=>this.clickCard(t)}">
                                <span class="card-title">${t.title}</span>
                                ${t.description?o`<span class="card-desc">${t.description}</span>`:l}
                                ${t.badge?o`<span class="badge">${t.badge}</span>`:l}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};Ka.styles=$`
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
    `;as([p({type:Array})],Ka.prototype,"columns",2);Ka=as([k("mateu-kanban")],Ka);const El=e=>{const t=e.metadata;return o`
        <mateu-kanban
                .columns="${t.columns??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-kanban>
    `};var Pl=Object.defineProperty,Tl=Object.getOwnPropertyDescriptor,rs=(e,t,a,r)=>{for(var i=r>1?void 0:r?Tl(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Pl(t,a,i),i};let Ya=class extends C{constructor(){super(...arguments),this.items=[]}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="feed">
                ${this.items.map(e=>o`
                    <div class="item ${e.actionId?"clickable":""}">
                        <div class="rail">
                            <div class="dot" style="${e.color?`--mateu-timeline-dot: ${e.color};`:""}">${e.icon??""}</div>
                            <div class="line"></div>
                        </div>
                        <div class="body" @click="${()=>this.clickItem(e)}">
                            <div class="head">
                                <span class="title">${e.title}</span>
                                ${e.timestamp?o`<span class="time">${e.timestamp}</span>`:l}
                            </div>
                            ${e.description?o`<div class="desc">${e.description}</div>`:l}
                        </div>
                    </div>
                `)}
            </div>
        `}};Ya.styles=$`
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
    `;rs([p({type:Array})],Ya.prototype,"items",2);Ya=rs([k("mateu-timeline")],Ya);const zl=e=>{const t=e.metadata;return o`
        <mateu-timeline
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-timeline>
    `};var Ol=Object.defineProperty,Rl=Object.getOwnPropertyDescriptor,Wr=(e,t,a,r)=>{for(var i=r>1?void 0:r?Rl(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Ol(t,a,i),i};let Sa=class extends C{constructor(){super(...arguments),this.steps=[],this.vertical=!1}render(){return o`
            <div class="steps">
                ${this.steps.map((e,t)=>{const a=e.status??"upcoming";return o`
                        <div class="step ${a}">
                            <div class="connector"></div>
                            <div class="dot">${a==="done"?"✓":t+1}</div>
                            <div class="label">${e.title}</div>
                            ${e.description?o`<div class="desc">${e.description}</div>`:l}
                        </div>
                    `})}
            </div>
        `}};Sa.styles=$`
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
    `;Wr([p({type:Array})],Sa.prototype,"steps",2);Wr([p({type:Boolean,reflect:!0})],Sa.prototype,"vertical",2);Sa=Wr([k("mateu-progress-steps")],Sa);const Ll=e=>{const t=e.metadata;return o`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                ?vertical="${t.vertical??!1}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-progress-steps>
    `};var Al=Object.defineProperty,Dl=Object.getOwnPropertyDescriptor,_t=(e,t,a,r)=>{for(var i=r>1?void 0:r?Dl(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Al(t,a,i),i};let Ge=class extends C{constructor(){super(...arguments),this.spark=[]}sparkline(){const e=this.spark;if(!e||e.length<2)return l;const t=84,a=30,r=2,i=Math.min(...e),n=Math.max(...e)-i||1,d=(t-r*2)/(e.length-1),c=e.map((f,w)=>{const x=r+w*d,y=r+(a-r*2)*(1-(f-i)/n);return[x,y]}),u=c.map(([f,w],x)=>`${x===0?"M":"L"}${f.toFixed(1)} ${w.toFixed(1)}`).join(" "),m=`${u} L${c[c.length-1][0].toFixed(1)} ${a} L${c[0][0].toFixed(1)} ${a} Z`,v=this.trend==="down"?"var(--lumo-error-color, #e11d48)":this.trend==="flat"?"var(--lumo-secondary-text-color, #888)":"var(--lumo-success-color, #12b76a)";return X`
            <svg width="${t}" height="${a}" viewBox="0 0 ${t} ${a}">
                <path d="${m}" fill="${v}" opacity="0.12"></path>
                <path d="${u}" fill="none" stroke="${v}" stroke-width="1.6"
                      stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>
        `}dispatchAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=this.trend??"up";return o`
            <div class="tile ${this.actionId?"clickable":""}" @click="${()=>this.dispatchAction()}">
                ${this.label?o`<span class="label">${this.label}</span>`:l}
                <span class="value">${this.value}${this.unit?o`<span class="unit">${this.unit}</span>`:l}</span>
                <div class="foot">
                    ${this.delta?o`<span class="delta ${e}">${e==="up"?"▲":e==="down"?"▼":"→"} ${this.delta}</span>`:o`<span></span>`}
                    ${this.sparkline()}
                </div>
            </div>
        `}};Ge.styles=$`
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
    `;_t([p()],Ge.prototype,"label",2);_t([p()],Ge.prototype,"value",2);_t([p()],Ge.prototype,"unit",2);_t([p()],Ge.prototype,"delta",2);_t([p()],Ge.prototype,"trend",2);_t([p({type:Array})],Ge.prototype,"spark",2);_t([p()],Ge.prototype,"actionId",2);Ge=_t([k("mateu-stat")],Ge);const Fl=e=>{const t=e.metadata;return o`
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
    `};var ql=Object.defineProperty,Ml=Object.getOwnPropertyDescriptor,Gr=(e,t,a,r)=>{for(var i=r>1?void 0:r?Ml(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&ql(t,a,i),i};let Ea=class extends C{constructor(){super(...arguments),this.events=[]}clickEvent(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}render(){const e=this.month?new Date(this.month+"T00:00:00"):new Date,t=e.getFullYear(),a=e.getMonth(),r=new Date(t,a,1),i=(r.getDay()+6)%7,s=new Date(t,a+1,0).getDate(),n=new Date,d=f=>n.getFullYear()===t&&n.getMonth()===a&&n.getDate()===f,c={};for(const f of this.events){if(!f.date)continue;const w=new Date(f.date+"T00:00:00");w.getFullYear()===t&&w.getMonth()===a&&(c[w.getDate()]??=[]).push(f)}const u=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],m=[];for(let f=0;f<i;f++)m.push(o`<div class="cell blank"></div>`);for(let f=1;f<=s;f++)m.push(o`
                <div class="cell ${d(f)?"today":""}">
                    <span class="num">${f}</span>
                    ${(c[f]??[]).map(w=>o`
                        <span class="chip ${w.actionId?"clickable":""}"
                              style="${w.color?`--mateu-cal-accent: ${w.color};`:""}"
                              title="${w.title??""}"
                              @click="${()=>this.clickEvent(w)}">${w.title}</span>
                    `)}
                </div>
            `);const v=r.toLocaleDateString(void 0,{month:"long",year:"numeric"});return o`
            <div class="title">${v}</div>
            <div class="grid">
                ${u.map(f=>o`<div class="dow">${f}</div>`)}
                ${m}
            </div>
        `}};Ea.styles=$`
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
    `;Gr([p()],Ea.prototype,"month",2);Gr([p({type:Array})],Ea.prototype,"events",2);Ea=Gr([k("mateu-calendar")],Ea);const Nl=e=>{const t=e.metadata;return o`
        <mateu-calendar
                month="${t.month??l}"
                .events="${t.events??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-calendar>
    `};var Ul=Object.defineProperty,jl=Object.getOwnPropertyDescriptor,is=(e,t,a,r)=>{for(var i=r>1?void 0:r?jl(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Ul(t,a,i),i};let Ja=class extends C{constructor(){super(...arguments),this.plans=[]}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return o`
            <div class="plans">
                ${this.plans.map(e=>o`
                    <div class="plan ${e.featured?"featured":""}">
                        ${e.featured?o`<span class="badge">Recommended</span>`:l}
                        <span class="name">${e.name}</span>
                        <div>
                            <span class="price">${e.price}</span>
                            ${e.period?o`<span class="period">${e.period}</span>`:l}
                        </div>
                        <ul>
                            ${(e.features??[]).map(t=>o`<li>${t}</li>`)}
                        </ul>
                        ${e.ctaLabel?o`
                            <button class="cta" @click="${()=>this.cta(e)}">${e.ctaLabel}</button>
                        `:l}
                    </div>
                `)}
            </div>
        `}};Ja.styles=$`
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
    `;is([p({type:Array})],Ja.prototype,"plans",2);Ja=is([k("mateu-pricing-table")],Ja);const Bl=e=>{const t=e.metadata;return o`
        <mateu-pricing-table
                .plans="${t.plans??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-pricing-table>
    `};var Vl=Object.defineProperty,Hl=Object.getOwnPropertyDescriptor,ss=(e,t,a,r)=>{for(var i=r>1?void 0:r?Hl(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Vl(t,a,i),i};let Xa=class extends C{clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){const t=e.avatar,a=t&&(t.startsWith("http")||t.startsWith("data:"));return o`
            <li>
                <div class="node ${e.actionId?"clickable":""}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:""}"
                     @click="${()=>this.clickNode(e)}">
                    ${t?o`<span class="avatar">${a?o`<img src="${t}" alt="">`:t}</span>`:l}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?o`<span class="subtitle">${e.subtitle}</span>`:l}
                </div>
                ${e.children&&e.children.length?o`<ul>${e.children.map(r=>this.renderNode(r))}</ul>`:l}
            </li>
        `}render(){return this.root?o`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:o``}};Xa.styles=$`
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
    `;ss([p({attribute:!1})],Xa.prototype,"root",2);Xa=ss([k("mateu-org-chart")],Xa);const Wl=e=>{const t=e.metadata;return o`
        <mateu-org-chart
                .root="${t.root}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-org-chart>
    `};var Gl=Object.defineProperty,Kl=Object.getOwnPropertyDescriptor,os=(e,t,a,r)=>{for(var i=r>1?void 0:r?Kl(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Gl(t,a,i),i};const Yl=1440*60*1e3;let Qa=class extends C{constructor(){super(...arguments),this.cells=[]}color(e,t){if(e<=0||t<=0)return"var(--lumo-contrast-10pct, #ebedf0)";const a=e/t,r=a>.75?1:a>.5?.75:a>.25?.5:.3;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round(r*100)}%, transparent)`}render(){const e=this.cells.filter(c=>!!c.date);if(!e.length)return o``;const t=e.map(c=>new Date(c.date+"T00:00:00").getTime()),a=Math.min(...t),r=Math.max(...t),i=new Date(a);i.setDate(i.getDate()-(i.getDay()+6)%7);const s={};for(const c of e)s[c.date]=c;const n=Math.max(...e.map(c=>c.value??0),1),d=[];for(let c=i.getTime();c<=r;c+=Yl){const u=new Date(c),m=u.toISOString().slice(0,10),v=s[m],f=v?.value??0,w=(u.getDay()+6)%7+1,x=v?.label??`${m}: ${f}`;d.push(o`
                <div class="cell" style="grid-row: ${w}; --cell: ${this.color(f,n)};" title="${x}"></div>
            `)}return o`
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
        `}};Qa.styles=$`
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
    `;os([p({type:Array})],Qa.prototype,"cells",2);Qa=os([k("mateu-heatmap")],Qa);const Jl=e=>{const t=e.metadata;return o`
        <mateu-heatmap
                .cells="${t.cells??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-heatmap>
    `};var Xl=Object.defineProperty,Ql=Object.getOwnPropertyDescriptor,ns=(e,t,a,r)=>{for(var i=r>1?void 0:r?Ql(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Xl(t,a,i),i};let Za=class extends C{constructor(){super(...arguments),this.stages=[]}render(){const e=this.stages;if(!e.length)return o``;const t=e[0].value??0,a=Math.max(...e.map(r=>r.value??0),1);return o`
            <div class="funnel">
                ${e.map((r,i)=>{const s=r.value??0,n=a>0?Math.max(6,s/a*100):6,d=i>0?e[i-1].value??0:t,c=i===0?t>0?"100%":"":d>0?`${Math.round(s/d*100)}%`:"0%";return o`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${r.label}</span>
                                ${i>0?o`<span class="conv">${c} of previous</span>`:l}
                            </div>
                            <div class="bar" style="width: ${n}%; ${r.color?`--bar: ${r.color};`:""}">
                                ${s.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};Za.styles=$`
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
    `;ns([p({type:Array})],Za.prototype,"stages",2);Za=ns([k("mateu-funnel")],Za);const Zl=e=>{const t=e.metadata;return o`
        <mateu-funnel
                .stages="${t.stages??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-funnel>
    `};var ed=Object.defineProperty,td=Object.getOwnPropertyDescriptor,pa=(e,t,a,r)=>{for(var i=r>1?void 0:r?td(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&ed(t,a,i),i};let ft=class extends C{constructor(){super(...arguments),this.values=[],this.labels=[],this.area=!1}render(){const e=this.values;if(!e||e.length<2)return o``;const t=600,a=160,r=8,i=Math.min(...e),s=Math.max(...e),n=s-i||1,d=(t-r*2)/(e.length-1),c=e.map((x,y)=>{const S=r+y*d,H=r+(a-r*2)*(1-(x-i)/n);return[S,H]}),u=c.map(([x,y],S)=>`${S===0?"M":"L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" "),m=`${u} L${c[c.length-1][0].toFixed(1)} ${a-r} L${c[0][0].toFixed(1)} ${a-r} Z`,v=this.color||"var(--lumo-primary-color, #1a73e8)",f=e.indexOf(s),w=e.indexOf(i);return o`
            ${this.heading?o`<div class="title">${this.heading}</div>`:l}
            <svg viewBox="0 0 ${t} ${a}" preserveAspectRatio="none">
                ${this.area?X`<path d="${m}" fill="${v}" opacity="0.12"></path>`:l}
                <path d="${u}" fill="none" stroke="${v}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${c.map((x,y)=>y===f||y===w?X`<circle cx="${x[0]}" cy="${x[1]}" r="3.2" fill="${v}"><title>${this.labels[y]??""}: ${e[y]}</title></circle>`:X`<circle cx="${x[0]}" cy="${x[1]}" r="6" fill="transparent"><title>${this.labels[y]??""}: ${e[y]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?o`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:l}
        `}};ft.styles=$`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `;pa([p()],ft.prototype,"heading",2);pa([p({type:Array})],ft.prototype,"values",2);pa([p({type:Array})],ft.prototype,"labels",2);pa([p()],ft.prototype,"color",2);pa([p({type:Boolean})],ft.prototype,"area",2);ft=pa([k("mateu-trend-chart")],ft);const ad=e=>{const t=e.metadata;return o`
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
    `};var rd=Object.defineProperty,id=Object.getOwnPropertyDescriptor,Kr=(e,t,a,r)=>{for(var i=r>1?void 0:r?id(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&rd(t,a,i),i};let Pa=class extends C{constructor(){super(...arguments),this.features=[],this.columns=0}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){const e=this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(15rem, 1fr))";return o`
            <div class="grid" style="grid-template-columns: ${e};">
                ${this.features.map(t=>o`
                    <div class="card ${t.actionId?"clickable":""}" @click="${()=>this.clickFeature(t)}">
                        ${t.icon?o`<span class="icon">${t.icon}</span>`:l}
                        <span class="title">${t.title}</span>
                        ${t.description?o`<span class="desc">${t.description}</span>`:l}
                    </div>
                `)}
            </div>
        `}};Pa.styles=$`
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
    `;Kr([p({type:Array})],Pa.prototype,"features",2);Kr([p({type:Number})],Pa.prototype,"columns",2);Pa=Kr([k("mateu-feature-grid")],Pa);const sd=e=>{const t=e.metadata;return o`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-feature-grid>
    `};var od=Object.defineProperty,nd=Object.getOwnPropertyDescriptor,ls=(e,t,a,r)=>{for(var i=r>1?void 0:r?nd(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&od(t,a,i),i};let er=class extends C{constructor(){super(...arguments),this.items=[]}stars(e){const t=Math.max(0,Math.min(5,e||0));return"★".repeat(t)+"☆".repeat(5-t)}render(){return o`
            <div class="grid">
                ${this.items.map(e=>{const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return o`
                        <div class="card">
                            ${e.rating?o`<div class="stars">${this.stars(e.rating)}</div>`:l}
                            <div class="quote">${e.quote}</div>
                            <div class="author">
                                ${e.avatar?o`<span class="avatar">${t?o`<img src="${e.avatar}" alt="">`:e.avatar}</span>`:l}
                                <div>
                                    <div class="name">${e.author}</div>
                                    ${e.role?o`<div class="role">${e.role}</div>`:l}
                                </div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};er.styles=$`
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
    `;ls([p({type:Array})],er.prototype,"items",2);er=ls([k("mateu-testimonials")],er);const ld=e=>{const t=e.metadata;return o`
        <mateu-testimonials
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-testimonials>
    `};var dd=Object.defineProperty,cd=Object.getOwnPropertyDescriptor,Yr=(e,t,a,r)=>{for(var i=r>1?void 0:r?cd(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&dd(t,a,i),i};let Ta=class extends C{constructor(){super(...arguments),this.items=[],this.openSet=new Set,this.seeded=!1}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),o`
            <div class="list">
                ${this.items.map((e,t)=>{const a=this.openSet.has(t);return o`
                        <div class="item ${a?"open":""}">
                            <div class="q" @click="${()=>this.toggle(t)}">
                                <span>${e.question}</span>
                                <span class="chevron">›</span>
                            </div>
                            ${a?o`<div class="a">${e.answer}</div>`:""}
                        </div>
                    `})}
            </div>
        `}};Ta.styles=$`
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
    `;Yr([p({type:Array})],Ta.prototype,"items",2);Yr([b()],Ta.prototype,"openSet",2);Ta=Yr([k("mateu-faq")],Ta);const ud=e=>{const t=e.metadata;return o`
        <mateu-faq
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-faq>
    `};var pd=Object.defineProperty,hd=Object.getOwnPropertyDescriptor,Qt=(e,t,a,r)=>{for(var i=r>1?void 0:r?hd(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&pd(t,a,i),i};let ot=class extends C{themeVars(){switch(this.theme){case"success":return"--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));";case"warning":return"--accent: #f59e0b; --bg: rgba(245,158,11,.12);";case"danger":return"--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));";default:return"--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));"}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return o`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?o`<span class="icon">${this.icon}</span>`:l}
                <div class="body">
                    ${this.heading?o`<span class="heading">${this.heading}</span>`:l}
                    ${this.description?o`<span class="desc">${this.description}</span>`:l}
                    ${this.ctaLabel?o`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:l}
                </div>
            </div>
        `}};ot.styles=$`
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
    `;Qt([p()],ot.prototype,"heading",2);Qt([p()],ot.prototype,"description",2);Qt([p()],ot.prototype,"icon",2);Qt([p()],ot.prototype,"ctaLabel",2);Qt([p()],ot.prototype,"actionId",2);Qt([p()],ot.prototype,"theme",2);ot=Qt([k("mateu-callout-card")],ot);const md=e=>{const t=e.metadata;return o`
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
    `};var vd=Object.defineProperty,fd=Object.getOwnPropertyDescriptor,ds=(e,t,a,r)=>{for(var i=r>1?void 0:r?fd(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&vd(t,a,i),i};let tr=class extends C{constructor(){super(...arguments),this.comments=[]}renderComment(e){const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return o`
            <div class="comment">
                <span class="avatar">${e.avatar?t?o`<img src="${e.avatar}" alt="">`:e.avatar:e.author?.[0]??"?"}</span>
                <div class="body">
                    <div class="head">
                        <span class="author">${e.author}</span>
                        ${e.timestamp?o`<span class="time">${e.timestamp}</span>`:l}
                    </div>
                    <div class="text">${e.text}</div>
                    ${e.replies&&e.replies.length?o`<div class="replies">${e.replies.map(a=>this.renderComment(a))}</div>`:l}
                </div>
            </div>
        `}render(){return o`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};tr.styles=$`
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
    `;ds([p({type:Array})],tr.prototype,"comments",2);tr=ds([k("mateu-comment-thread")],tr);const bd=e=>{const t=e.metadata;return o`
        <mateu-comment-thread
                .comments="${t.comments??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-comment-thread>
    `};var gd=Object.defineProperty,yd=Object.getOwnPropertyDescriptor,cs=(e,t,a,r)=>{for(var i=r>1?void 0:r?yd(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&gd(t,a,i),i};const $d={pdf:"📕",image:"🖼️",img:"🖼️",doc:"📘",docx:"📘",word:"📘",xls:"📗",xlsx:"📗",excel:"📗",sheet:"📗",zip:"🗜️",archive:"🗜️",video:"🎬",audio:"🎵",code:"💻",csv:"📄",txt:"📄"};let ar=class extends C{constructor(){super(...arguments),this.files=[]}icon(e){return e&&$d[e.toLowerCase()]||"📄"}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return o`
            <div class="list">
                ${this.files.map(e=>{const t=!!e.url||!!e.actionId,a=o`
                        <span class="icon">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?o`<span class="size">${e.size}</span>`:l}
                        ${e.url?o`<span class="dl">⬇</span>`:l}
                    `;return e.url?o`<a class="file clickable" href="${e.url}" download target="_blank" rel="noopener">${a}</a>`:o`<div class="file ${t?"clickable":""}" @click="${r=>this.clickFile(e,r)}">${a}</div>`})}
            </div>
        `}};ar.styles=$`
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
    `;cs([p({type:Array})],ar.prototype,"files",2);ar=cs([k("mateu-file-list")],ar);const xd=e=>{const t=e.metadata;return o`
        <mateu-file-list
                .files="${t.files??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-file-list>
    `};var wd=Object.defineProperty,kd=Object.getOwnPropertyDescriptor,mr=(e,t,a,r)=>{for(var i=r>1?void 0:r?kd(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&wd(t,a,i),i};let oa=class extends C{constructor(){super(...arguments),this.items=[],this.localDone=new Map}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){const a=!this.isDone(e,t);this.localDone.set(t,a),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e,_done:a}},bubbles:!0,composed:!0}))}render(){const e=this.items.length,t=this.items.filter((r,i)=>this.isDone(r,i)).length,a=e>0?Math.round(t/e*100):0;return o`
            <div class="head">
                ${this.heading?o`<span class="title">${this.heading}</span>`:o`<span></span>`}
                <span class="count">${t} / ${e}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${a}%;"></div></div>
            ${this.items.map((r,i)=>{const s=this.isDone(r,i);return o`
                    <div class="item ${s?"done":""}" @click="${()=>this.toggle(r,i)}">
                        <span class="box">${s?"✓":l}</span>
                        <span class="label">${r.label}</span>
                    </div>
                `})}
        `}};oa.styles=$`
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
    `;mr([p()],oa.prototype,"heading",2);mr([p({type:Array})],oa.prototype,"items",2);mr([b()],oa.prototype,"localDone",2);oa=mr([k("mateu-checklist")],oa);const Cd=e=>{const t=e.metadata;return o`
        <mateu-checklist
                heading="${t.title??l}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-checklist>
    `};var _d=Object.defineProperty,Id=Object.getOwnPropertyDescriptor,It=(e,t,a,r)=>{for(var i=r>1?void 0:r?Id(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&_d(t,a,i),i};let Ke=class extends C{render(){const e=this.trend??"flat";return o`
            <div class="card">
                ${this.heading?o`<div class="title">${this.heading}</div>`:l}
                <div class="row">
                    <div class="side">
                        ${this.leftLabel?o`<div class="label">${this.leftLabel}</div>`:l}
                        <div class="value">${this.leftValue}</div>
                    </div>
                    <div class="mid">
                        <span class="arrow">${"→"}</span>
                        ${this.delta?o`<span class="delta ${e}">${e==="up"?"▲":e==="down"?"▼":""} ${this.delta}</span>`:l}
                    </div>
                    <div class="side">
                        ${this.rightLabel?o`<div class="label">${this.rightLabel}</div>`:l}
                        <div class="value">${this.rightValue}</div>
                    </div>
                </div>
            </div>
        `}};Ke.styles=$`
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
    `;It([p()],Ke.prototype,"heading",2);It([p()],Ke.prototype,"leftLabel",2);It([p()],Ke.prototype,"leftValue",2);It([p()],Ke.prototype,"rightLabel",2);It([p()],Ke.prototype,"rightValue",2);It([p()],Ke.prototype,"delta",2);It([p()],Ke.prototype,"trend",2);Ke=It([k("mateu-comparison-card")],Ke);const Sd=e=>{const t=e.metadata;return o`
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
    `},vr=$`
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
`,Ed=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}),Dr=e=>Ed.format(e),rr=(e,t)=>{const a=e<0?"-":"",r=Dr(Math.abs(e));return t?`${a}${t} ${r}`:`${a}${r}`},Pd=(e,t)=>t?`${Dr(e)} ${t}`:Dr(e);var Td=Object.defineProperty,zd=Object.getOwnPropertyDescriptor,St=(e,t,a,r)=>{for(var i=r>1?void 0:r?zd(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Td(t,a,i),i};let Ye=class extends C{constructor(){super(...arguments),this.title="",this.badges=[],this.facts=[]}render(){const e=!!(this.metricLabel||this.metricValue||this.metricCaption);return o`
            <div class="card">
                <div class="main">
                    <div class="title-row">
                        <span class="title">${this.title}</span>
                        ${this.badges.map(t=>o`<span class="chip ${t.color??""}">${t.label}</span>`)}
                    </div>
                    ${this.subtitle?o`<span class="subtitle">${this.subtitle}</span>`:l}
                    ${this.facts.length?o`
                        <div class="facts">
                            ${this.facts.map(t=>o`
                                <div class="fact">
                                    <span class="label">${t.label}</span>
                                    <span class="value">${t.value}</span>
                                </div>
                            `)}
                        </div>
                    `:l}
                </div>
                ${e?o`
                    <div class="metric">
                        ${this.metricLabel?o`<span class="label">${this.metricLabel}</span>`:l}
                        ${this.metricValue?o`<span class="value">${this.metricValue}</span>`:l}
                        ${this.metricCaption?o`<span class="caption">${this.metricCaption}</span>`:l}
                    </div>
                `:l}
            </div>
        `}};Ye.styles=[vr,$`
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
    `];St([p()],Ye.prototype,"title",2);St([p({type:Array})],Ye.prototype,"badges",2);St([p()],Ye.prototype,"subtitle",2);St([p({type:Array})],Ye.prototype,"facts",2);St([p()],Ye.prototype,"metricLabel",2);St([p()],Ye.prototype,"metricValue",2);St([p()],Ye.prototype,"metricCaption",2);Ye=St([k("mateu-entity-header")],Ye);const Od=e=>{const t=e.metadata;return o`
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
    `};var Rd=Object.defineProperty,Ld=Object.getOwnPropertyDescriptor,Et=(e,t,a,r)=>{for(var i=r>1?void 0:r?Ld(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Rd(t,a,i),i};let Je=class extends C{constructor(){super(...arguments),this.value=0,this.max=0}fillColor(){return this.dangerAt!=null&&this.value>=this.dangerAt?"error":this.warnAt!=null&&this.value>=this.warnAt?"warning":this.warnAt!=null||this.dangerAt!=null?"success":"primary"}render(){const e=this.max>0?Math.min(Math.max(this.value/this.max,0),1):0,t=Math.round(e*100);return o`
            <div class="meter">
                ${this.label?o`<span class="label">${this.label}</span>`:l}
                <span class="value">${Pd(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};Je.styles=$`
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
    `;Et([p()],Je.prototype,"label",2);Et([p({type:Number})],Je.prototype,"value",2);Et([p({type:Number})],Je.prototype,"max",2);Et([p()],Je.prototype,"unit",2);Et([p()],Je.prototype,"caption",2);Et([p({type:Number})],Je.prototype,"warnAt",2);Et([p({type:Number})],Je.prototype,"dangerAt",2);Je=Et([k("mateu-meter")],Je);const Ad=e=>{const t=e.metadata;return o`
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
    `};var Dd=Object.defineProperty,Fd=Object.getOwnPropertyDescriptor,ha=(e,t,a,r)=>{for(var i=r>1?void 0:r?Fd(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Dd(t,a,i),i};let bt=class extends C{constructor(){super(...arguments),this.total=0,this.done=0}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){const e=this.total>0&&this.done>=this.total,t=!e&&!!this.actionLabel&&!!this.actionId;return o`
            <div class="banner ${e?"complete":""}">
                <span class="icon">👥</span>
                ${this.label?o`<span class="label">${this.label}</span>`:l}
                <div class="pills">
                    ${Array.from({length:this.total},(a,r)=>o`
                        <span class="pill ${r+1<=this.done?"filled":""}">${r+1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${t?o`<button @click="${()=>this.runAction()}">${this.actionLabel} →</button>`:l}
            </div>
        `}};bt.styles=$`
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
    `;ha([p()],bt.prototype,"label",2);ha([p({type:Number})],bt.prototype,"total",2);ha([p({type:Number})],bt.prototype,"done",2);ha([p()],bt.prototype,"actionLabel",2);ha([p()],bt.prototype,"actionId",2);bt=ha([k("mateu-task-progress")],bt);const qd=e=>{const t=e.metadata;return o`
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
    `};var Md=Object.defineProperty,Nd=Object.getOwnPropertyDescriptor,Aa=(e,t,a,r)=>{for(var i=r>1?void 0:r?Nd(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Md(t,a,i),i};let Ut=class extends C{constructor(){super(...arguments),this.items=[],this.compact=!1,this.frameless=!1}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}rowClicked(e){this.rowActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.rowActionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="list ${this.compact?"compact":""} ${this.frameless?"frameless":""}">
                ${this.items.map(e=>o`
                    <div class="row ${this.rowActionId?"clickable":""}"
                         @click="${()=>this.rowClicked(e)}">
                        ${e.avatar?o`<span class="avatar">${e.avatar}</span>`:e.icon?o`<span class="icon">${e.icon}</span>`:l}
                        <div class="body">
                            <span class="title">${e.title}</span>
                            ${e.description?o`<span class="description">${e.description}</span>`:l}
                        </div>
                        ${e.status?o`<span class="chip ${e.statusColor??""}">${e.status}</span>`:l}
                        ${e.actionLabel&&e.actionId?o`<button class="row-action" @click="${()=>this.runAction(e)}">${e.actionLabel}</button>`:l}
                    </div>
                `)}
            </div>
        `}};Ut.styles=[vr,$`
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
    `];Aa([p({type:Array})],Ut.prototype,"items",2);Aa([p({type:Boolean})],Ut.prototype,"compact",2);Aa([p({type:Boolean})],Ut.prototype,"frameless",2);Aa([p()],Ut.prototype,"rowActionId",2);Ut=Aa([k("mateu-status-list")],Ut);const Ud=e=>{const t=e.metadata;return o`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                rowActionId="${E(t.rowActionId??void 0)}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-status-list>
    `};var jd=Object.defineProperty,Bd=Object.getOwnPropertyDescriptor,us=(e,t,a,r)=>{for(var i=r>1?void 0:r?Bd(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&jd(t,a,i),i};let ir=class extends C{constructor(){super(...arguments),this.items=[]}render(){return o`
            <ul>
                ${this.items.map(e=>o`<li>${e}</li>`)}
            </ul>
        `}};ir.styles=$`
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
    `;us([p({type:Array})],ir.prototype,"items",2);ir=us([k("mateu-bulleted-list")],ir);const Vd=e=>{const t=e.metadata;return o`
        <mateu-bulleted-list
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-bulleted-list>
    `},Hd=e=>{const a=e.metadata.attributes?.["data-colspan"];return o`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??""}"
            class="${e.cssClasses??l}"
            id="${E(e.id??void 0)}"
            data-colspan="${E(a)}"
            slot="${e.slot??l}"/>
    `};var Wd=Object.defineProperty,Gd=Object.getOwnPropertyDescriptor,Ee=(e,t,a,r)=>{for(var i=r>1?void 0:r?Gd(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Wd(t,a,i),i};const Kd={info:"ℹ",success:"✓",warning:"!",danger:"!"};let oe=class extends C{constructor(){super(...arguments),this.text="",this.theme="info",this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=!!this.text&&!!this.text.trim();if(!e&&!this.hasContent)return o``;const t=["info","success","warning","danger"].includes(this.theme)?this.theme:"info";return o`
            <div class="notice ${t} ${this.slim?"slim":""}">
                ${this.noIcon?l:o`<span class="icon ${this.icon?"custom":""}">${this.icon||Kd[t]}</span>`}
                <div class="body ${this.inlineContent?"inline":""}">
                    ${e?o`<span class="text">${this.text}</span>`:l}
                    ${this.hasContent?o`<div class="content"><slot></slot></div>`:l}
                </div>
                ${this.actionLabel&&this.actionId?o`<button class="notice-action" @click="${()=>this.runAction()}">${this.actionLabel}</button>`:this.status?o`<span class="status">${this.status}</span>`:l}
            </div>
        `}};oe.styles=$`
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
    `;Ee([p()],oe.prototype,"text",2);Ee([p()],oe.prototype,"theme",2);Ee([p()],oe.prototype,"icon",2);Ee([p({type:Boolean})],oe.prototype,"noIcon",2);Ee([p()],oe.prototype,"actionLabel",2);Ee([p()],oe.prototype,"actionId",2);Ee([p()],oe.prototype,"status",2);Ee([p({type:Boolean})],oe.prototype,"slim",2);Ee([p({type:Boolean})],oe.prototype,"fullWidth",2);Ee([p({type:Boolean})],oe.prototype,"hasContent",2);Ee([p({type:Boolean})],oe.prototype,"inlineContent",2);oe=Ee([k("mateu-notice")],oe);const Yd=(e,t,a,r,i,s,n)=>{const d=t.metadata,c=Ca(d.text??"",r,i,s,n)??"",u=t.children??[];return o`
        <mateu-notice
                text="${c}"
                theme="${d.theme??"info"}"
                icon="${E(d.icon??void 0)}"
                ?noIcon="${d.noIcon??!1}"
                actionLabel="${E(d.actionLabel??void 0)}"
                actionId="${E(d.actionId??void 0)}"
                status="${E(d.status??void 0)}"
                ?slim="${d.slim??!1}"
                ?fullWidth="${d.fullWidth??!1}"
                ?inlineContent="${d.inlineContent??!1}"
                ?hasContent="${u.length>0}"
                data-colspan="${d.fullWidth?"99":l}"
                style="${t.style??l}"
                class="${t.cssClasses??l}"
                slot="${t.slot??l}"
        >${u.map(m=>g(e,m,a,r,i,s,n))}</mateu-notice>
    `};var Jd=Object.defineProperty,Xd=Object.getOwnPropertyDescriptor,fr=(e,t,a,r)=>{for(var i=r>1?void 0:r?Xd(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Jd(t,a,i),i};let na=class extends C{constructor(){super(...arguments),this.groups=[]}willUpdate(e){e.has("groups")&&(this.selectedId=this.groups.flatMap(t=>t.items??[]).find(t=>t.selected)?.id)}select(e){this.selectedId=e,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="rail">
                ${this.groups.map(e=>o`
                    <div class="group">
                        ${e.label?o`<span class="group-label">${e.label}</span>`:l}
                        ${(e.items??[]).map(t=>o`
                            <div class="card ${t.id===this.selectedId?"selected":""}"
                                 @click="${()=>this.select(t.id)}">
                                <span class="title">${t.title}</span>
                                <div class="meta">
                                    ${t.caption?o`<span class="caption">${t.caption}</span>`:l}
                                    ${(t.badges??[]).map(a=>o`<span class="chip ${a.color??""}">${a.label}</span>`)}
                                </div>
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};na.styles=[vr,$`
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
    `];fr([p()],na.prototype,"actionId",2);fr([p({type:Array})],na.prototype,"groups",2);fr([b()],na.prototype,"selectedId",2);na=fr([k("mateu-task-queue")],na);const Qd=e=>{const t=e.metadata;return o`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-task-queue>
    `};var Zd=Object.defineProperty,ec=Object.getOwnPropertyDescriptor,ma=(e,t,a,r)=>{for(var i=r>1?void 0:r?ec(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Zd(t,a,i),i};let gt=class extends C{constructor(){super(...arguments),this.columns=0,this.items=[]}willUpdate(e){e.has("items")&&(this.selectedId=this.items.find(t=>t.selected)?.id)}select(e){e.disabled||(this.selectedId=e.id,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0})))}render(){const e=this.columns>0?`grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`:"grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));";return o`
            <div class="grid" style="${e}">
                ${this.items.map(t=>o`
                    <div class="cell ${t.disabled?"disabled":""} ${t.recommended?"recommended":""} ${t.id===this.selectedId?"selected":""}"
                         @click="${()=>this.select(t)}">
                        ${t.recommended?o`<span class="tag">${this.recommendedLabel||"Recommended"}</span>`:l}
                        <span class="title">${t.title}</span>
                        ${t.subtitle?o`<span class="subtitle">${t.subtitle}</span>`:l}
                        ${t.statusLabel?o`<span class="chip ${t.statusColor??""}">${t.statusLabel}</span>`:l}
                        ${t.note?o`<span class="note ${t.noteColor??""}"><span class="dot"></span>${t.note}</span>`:l}
                    </div>
                `)}
            </div>
        `}};gt.styles=[vr,$`
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
    `];ma([p()],gt.prototype,"actionId",2);ma([p({type:Number})],gt.prototype,"columns",2);ma([p()],gt.prototype,"recommendedLabel",2);ma([p({type:Array})],gt.prototype,"items",2);ma([b()],gt.prototype,"selectedId",2);gt=ma([k("mateu-resource-grid")],gt);const tc=e=>{const t=e.metadata;return o`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-resource-grid>
    `};var ac=Object.defineProperty,rc=Object.getOwnPropertyDescriptor,fe=(e,t,a,r)=>{for(var i=r>1?void 0:r?rc(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&ac(t,a,i),i};let Q=class extends C{constructor(){super(...arguments),this.title="",this.features=[],this.current=!1,this.added=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="card ${this.current?"":"offer"}">
                ${this.image?o`<img class="image" src="${this.image}" alt="${this.title}">`:l}
                ${this.tag&&this.image?o`<span class="tag">${this.tag}</span>`:l}
                <div class="body">
                    ${this.tag&&!this.image?o`<span class="tag static">${this.tag}</span>`:l}
                    <span class="title">${this.title}</span>
                    ${this.subtitle?o`<span class="subtitle">${this.subtitle}</span>`:l}
                    ${this.features.length?o`
                        <div class="features">
                            ${this.features.map(e=>o`<span class="feature">${e}</span>`)}
                        </div>
                    `:l}
                </div>
                <div class="footer">
                    ${this.current?this.currentLabel?o`<span class="current-label">${this.currentLabel}</span>`:l:this.actionLabel&&this.actionId?o`
                            <button class="${this.added?"added":""}" @click="${()=>this.runAction()}">
                                <span>${this.added?this.addedLabel||this.actionLabel:this.actionLabel}</span>
                                ${this.priceLabel?o`<span class="price">${this.priceLabel}</span>`:l}
                            </button>
                        `:l}
                </div>
            </div>
        `}};Q.styles=$`
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
    `;fe([p()],Q.prototype,"tag",2);fe([p()],Q.prototype,"title",2);fe([p()],Q.prototype,"subtitle",2);fe([p()],Q.prototype,"image",2);fe([p({type:Array})],Q.prototype,"features",2);fe([p()],Q.prototype,"priceLabel",2);fe([p()],Q.prototype,"actionLabel",2);fe([p()],Q.prototype,"actionId",2);fe([p({type:Boolean})],Q.prototype,"current",2);fe([p()],Q.prototype,"currentLabel",2);fe([p({type:Boolean})],Q.prototype,"added",2);fe([p()],Q.prototype,"addedLabel",2);Q=fe([k("mateu-offer-card")],Q);const ic=e=>{const t=e.metadata;return o`
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
    `};var sc=Object.defineProperty,oc=Object.getOwnPropertyDescriptor,va=(e,t,a,r)=>{for(var i=r>1?void 0:r?oc(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&sc(t,a,i),i};let yt=class extends C{constructor(){super(...arguments),this.items=[],this.added=new Set}willUpdate(e){e.has("items")&&(this.added=new Set(this.items.filter(t=>t.added).map(t=>t.id)))}total(){return this.items.filter(e=>e.id!=null&&this.added.has(e.id)).reduce((e,t)=>e+(t.price??0),0)}toggle(e){if(e.id==null)return;const t=new Set(this.added),a=!t.has(e.id);a?t.add(e.id):t.delete(e.id),this.added=t,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id,_added:a,_total:this.total()}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="header">
                ${this.totalLabel?o`<span class="total-label">${this.totalLabel}:</span>`:l}
                <span class="total">${rr(this.total(),this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(e=>{const t=e.id!=null&&this.added.has(e.id);return o`
                        <div class="card ${t?"added":""}">
                            ${e.icon?o`<span class="icon">${e.icon}</span>`:l}
                            <span class="title">${e.title}</span>
                            ${e.description?o`<span class="description">${e.description}</span>`:l}
                            ${e.includedLabel?o`<span class="included">${e.includedLabel}</span>`:o`
                                    ${e.price!=null?o`
                                        <span class="price">${rr(e.price,this.currency)}${e.unit?` / ${e.unit}`:""}</span>
                                    `:l}
                                    <button class="toggle ${t?"on":""}" @click="${()=>this.toggle(e)}"
                                            aria-pressed="${t}">${t?"✓":"+"}</button>
                                `}
                        </div>
                    `})}
            </div>
        `}};yt.styles=$`
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
    `;va([p()],yt.prototype,"totalLabel",2);va([p()],yt.prototype,"currency",2);va([p()],yt.prototype,"actionId",2);va([p({type:Array})],yt.prototype,"items",2);va([b()],yt.prototype,"added",2);yt=va([k("mateu-addon-picker")],yt);const nc=e=>{const t=e.metadata;return o`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-addon-picker>
    `};var lc=Object.defineProperty,dc=Object.getOwnPropertyDescriptor,Da=(e,t,a,r)=>{for(var i=r>1?void 0:r?dc(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&lc(t,a,i),i};let jt=class extends C{constructor(){super(...arguments),this.lines=[]}computedTotal(){return this.total!=null?this.total:this.lines.filter(e=>!e.included).reduce((e,t)=>e+(t.amount??0),0)}render(){return o`
            ${this.lines.map(e=>o`
                <div class="row">
                    <span class="dot"></span>
                    <span class="concept">${e.concept}</span>
                    ${e.included?o`<span class="included-label">${e.includedLabel||"Included"}</span>`:o`<span class="amount ${(e.amount??0)<0?"negative":""}">${rr(e.amount??0,this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel||"Total"}</span>
                <span class="total">${rr(this.computedTotal(),this.currency)}</span>
            </div>
        `}};jt.styles=$`
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
    `;Da([p()],jt.prototype,"currency",2);Da([p()],jt.prototype,"totalLabel",2);Da([p({type:Array})],jt.prototype,"lines",2);Da([p({type:Number})],jt.prototype,"total",2);jt=Da([k("mateu-ledger")],jt);const cc=e=>{const t=e.metadata;return o`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-ledger>
    `};var uc=Object.defineProperty,pc=Object.getOwnPropertyDescriptor,dt=(e,t,a,r)=>{for(var i=r>1?void 0:r?pc(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&uc(t,a,i),i};let Ae=class extends C{constructor(){super(...arguments),this.methods=[]}willUpdate(e){e.has("selected")&&(this.selectedId=this.selected)}confirm(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_method:this.selectedId}},bubbles:!0,composed:!0}))}pick(e){this.selectedId=e,this.methodActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.methodActionId,parameters:{_method:e}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="bar">
                <div class="methods">
                    ${this.methods.map(e=>o`
                        <button class="method ${e.id===this.selectedId?"selected":""}"
                                @click="${()=>this.pick(e.id)}">${e.label}</button>
                    `)}
                </div>
                ${this.contextLabel||this.contextValue?o`
                    <div class="context">
                        ${this.contextLabel?o`<span class="label">${this.contextLabel}</span>`:l}
                        ${this.contextValue?o`<span class="value">${this.contextValue}</span>`:l}
                    </div>
                `:l}
                <span class="spacer"></span>
                ${this.confirmLabel&&this.actionId?o`<button class="confirm" @click="${()=>this.confirm()}">${this.confirmLabel}</button>`:l}
            </div>
        `}};Ae.styles=$`
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
    `;dt([p()],Ae.prototype,"actionId",2);dt([p()],Ae.prototype,"methodActionId",2);dt([p({type:Array})],Ae.prototype,"methods",2);dt([p()],Ae.prototype,"selected",2);dt([p()],Ae.prototype,"contextLabel",2);dt([p()],Ae.prototype,"contextValue",2);dt([p()],Ae.prototype,"confirmLabel",2);dt([b()],Ae.prototype,"selectedId",2);Ae=dt([k("mateu-payment-picker")],Ae);const hc=e=>{const t=e.metadata;return o`
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
    `};var mc=Object.defineProperty,vc=Object.getOwnPropertyDescriptor,ps=(e,t,a,r)=>{for(var i=r>1?void 0:r?vc(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&mc(t,a,i),i};let sr=class extends C{constructor(){super(...arguments),this.items=[]}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return o`
            <div class="list">
                ${this.items.map(e=>o`
                    <div class="row">
                        <span class="dot ${e.status??"ok"}"></span>
                        <div class="body">
                            <span class="name">${e.name}</span>
                            ${e.systems?.length?o`<span class="systems">${e.systems.join(" · ")}</span>`:l}
                        </div>
                        <div class="counters">
                            <span class="counter ok">✓ ${e.ok??0} OK</span>
                            ${(e.warnings??0)>0?o`<span class="counter warning">⚠ ${e.warnings} warnings</span>`:l}
                            ${(e.errors??0)>0?o`<span class="counter error">⛔ ${e.errors} errors</span>`:l}
                        </div>
                        ${e.actionLabel&&e.actionId?o`<button @click="${()=>this.runAction(e)}">${e.actionLabel}</button>`:l}
                    </div>
                `)}
            </div>
        `}};sr.styles=$`
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
    `;ps([p({type:Array})],sr.prototype,"items",2);sr=ps([k("mateu-process-monitor")],sr);const fc=e=>{const t=e.metadata;return o`
        <mateu-process-monitor
                .items="${t.items??[]}"
                style="${e.style??l}"
                class="${e.cssClasses??l}"
                slot="${e.slot??l}"
        ></mateu-process-monitor>
    `},bc=(e,t)=>{let a=e.style;return e.id&&(a&&!a.endsWith(";")&&(a+=";"),a==null&&(a=""),t[e.id+".hidden"]==!0&&(a+="display: none;")),a},gc=(e,t)=>{let a={...e.metadata};if(e.id&&a){if(a.type==h.Button){const r=a;t[e.id+".disabled"]==!0&&(r.disabled=!0)}if(a.type==h.FormField){const r=a;t[e.id+".disabled"]==!0&&(r.disabled=!0)}}return a},z=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),yc={[h.Bpmn]:({component:e})=>sl(e),[h.Workflow]:({component:e})=>nl(e),[h.FormEditor]:({component:e})=>ll(e),[h.Page]:z(Lr),[h.Div]:z(el),[h.Directory]:({component:e,baseUrl:t,state:a,data:r})=>Zn(e),[h.FormLayout]:z(Zo),[h.HorizontalLayout]:z(rn),[h.VerticalLayout]:z(sn),[h.SplitLayout]:z(on),[h.MasterDetailLayout]:z(nn),[h.TabLayout]:z(ln),[h.AccordionLayout]:z(dn),[h.BoardLayout]:z(mn),[h.BoardLayoutRow]:z(vn),[h.BoardLayoutItem]:z(fn),[h.Scroller]:z(un),[h.FullWidth]:z(pn),[h.Container]:z(hn),[h.Form]:({container:e,component:t,baseUrl:a,state:r,data:i,appState:s,appData:n})=>{const d=t.metadata;return o`<mateu-form
            id="${t.id}"
        baseUrl="${a}"
            .component="${t}"
            .values="${r}"
            .state="${r}"
            .data="${i}"
            .appState="${s}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??l}"
            >
                ${t.children?.map(c=>g(e,c,a,r,i,s,n))}
            ${d?.buttons?.map(c=>o`
               ${g(e,{id:c.actionId,metadata:c,type:W.ClientSide,slot:"buttons"},void 0,r,i,s,n)}
`)}

            </mateu-form>`},[h.Table]:({component:e,state:t,data:a})=>Rr(e,(e.id?a?.[e.id]:void 0)?.page?.content??oi(e,t)),[h.Crud]:z(Ar),[h.App]:({container:e,component:t,baseUrl:a,state:r,data:i,appState:s,appData:n})=>o`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${a}"
                        .component="${t}"
                        .state="${r}"
                        .data="${i}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${s}"
                        .appData="${n}"
            >
             ${t.children?.map(d=>g(e,d,a,r,i,s,n))}
         </mateu-app>`,[h.Element]:({container:e,component:t})=>Sn(e,t.metadata,t),[h.FormField]:({component:e,state:t})=>il(e,t),[h.Text]:({component:e,state:t,data:a,appState:r,appData:i})=>En(e,t,a,r,i),[h.Avatar]:({component:e,state:t,data:a})=>Io(e,t,a),[h.Chat]:({component:e,state:t,data:a})=>ol(e),[h.AvatarGroup]:({component:e})=>So(e),[h.Badge]:({component:e,state:t,data:a})=>Eo(e,t,a),[h.Breadcrumbs]:({component:e})=>Xn(e),[h.Anchor]:({component:e})=>Pn(e),[h.Button]:({component:e,state:t,data:a})=>Rn(e,t,a),[h.Card]:z(An),[h.Chart]:({component:e})=>Dn(e),[h.Icon]:({component:e})=>Fn(e),[h.ConfirmDialog]:z(Mn),[h.ContextMenu]:z(xn),[h.CookieConsent]:({component:e})=>Nn(e),[h.Details]:z(Un),[h.Dialog]:({component:e,baseUrl:t,state:a,data:r,appState:i,appData:s})=>jn(e,t,a,r,i,s),[h.Drawer]:({component:e,baseUrl:t,state:a,data:r,appState:i,appData:s})=>Bn(e,t,a,r,i,s),[h.Image]:({component:e})=>Jn(e),[h.Map]:({component:e})=>Yn(e),[h.Markdown]:({component:e})=>Hn(e),[h.MicroFrontend]:({component:e})=>Vn(e),[h.Notification]:({component:e})=>Wn(e),[h.ProgressBar]:({component:e,state:t})=>Gn(e,t),[h.Popover]:z(Kn),[h.CarouselLayout]:z(Qn),[h.Tooltip]:z(Cn),[h.MessageInput]:({component:e})=>kn(e),[h.MessageList]:({component:e})=>yn(e),[h.CustomField]:z(wn),[h.MenuBar]:({container:e,component:t,baseUrl:a,state:r,data:i})=>$n(e,t,a,r,i),[h.Grid]:({component:e,state:t})=>Rr(e,oi(e,t)),[h.VirtualList]:z(bn),[h.FormSection]:z(tl),[h.FormSubSection]:z(al),[h.MetricCard]:({component:e})=>pl(e),[h.Scoreboard]:z(hl),[h.DashboardPanel]:z(ml),[h.DashboardLayout]:z(vl),[h.FoldoutLayout]:z(gl),[h.HeroSection]:z(yl),[h.EmptyState]:({component:e})=>Mo(e),[h.Skeleton]:({component:e})=>No(e),[h.Gantt]:({component:e})=>wl(e),[h.PlanningBoard]:({component:e})=>_l(e),[h.Kanban]:({component:e})=>El(e),[h.Timeline]:({component:e})=>zl(e),[h.ProgressSteps]:({component:e})=>Ll(e),[h.Stat]:({component:e})=>Fl(e),[h.Calendar]:({component:e})=>Nl(e),[h.PricingTable]:({component:e})=>Bl(e),[h.OrgChart]:({component:e})=>Wl(e),[h.Heatmap]:({component:e})=>Jl(e),[h.Funnel]:({component:e})=>Zl(e),[h.TrendChart]:({component:e})=>ad(e),[h.FeatureGrid]:({component:e})=>sd(e),[h.Testimonials]:({component:e})=>ld(e),[h.Faq]:({component:e})=>ud(e),[h.CalloutCard]:({component:e})=>md(e),[h.CommentThread]:({component:e})=>bd(e),[h.FileList]:({component:e})=>xd(e),[h.Checklist]:({component:e})=>Cd(e),[h.ComparisonCard]:({component:e})=>Sd(e),[h.EntityHeader]:({component:e})=>Od(e),[h.Meter]:({component:e})=>Ad(e),[h.TaskProgress]:({component:e})=>qd(e),[h.StatusList]:({component:e})=>Ud(e),[h.BulletedList]:({component:e})=>Vd(e),[h.Separator]:({component:e})=>Hd(e),[h.Notice]:z(Yd),[h.TaskQueue]:({component:e})=>Qd(e),[h.ResourceGrid]:({component:e})=>tc(e),[h.OfferCard]:({component:e})=>ic(e),[h.AddOnPicker]:({component:e})=>nc(e),[h.Ledger]:({component:e})=>cc(e),[h.PaymentPicker]:({component:e})=>hc(e),[h.ProcessMonitor]:({component:e})=>fc(e)},Jr=(e,t,a,r,i,s,n,d)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),o`<p>No metadata for component</p>`):Jr(e,{id:xe(),metadata:t,type:W.ClientSide},a,r,i,s,n,d);const c=t.metadata.type,u={...t,style:bc(t,i),metadata:gc(t,i)},m=yc[c];return m?m({container:e,component:u,baseUrl:a,state:r,data:i,appState:s,appData:n,labelAlreadyRendered:d}):o`<p ${u?.slot??l}>Unknown metadata type ${c} for component ${u?.id}</p>`};var xa=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(xa||{});const $c=(e,t,a)=>{const r=e[a.path];return r?o`<span theme="badge pill ${br(r.type)}">${r.message}</span>`:o``},br=e=>{switch(e){case xa.SUCCESS:return"success";case xa.WARNING:return"warning";case xa.DANGER:return"error";case xa.NONE:return"contrast"}return""};var xc=Object.defineProperty,wc=Object.getOwnPropertyDescriptor,Pe=(e,t,a,r)=>{for(var i=r>1?void 0:r?wc(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&xc(t,a,i),i};let ne=class extends C{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.respondToVisibility=(e,t)=>{var a={root:document.documentElement},r=new IntersectionObserver(i=>{i.forEach(s=>{t(s.intersectionRatio>0)})},a);r.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?Jr(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?o`<div class="neutral-card">
                ${e.image?o`<img class="card-media" src="${e.image}" alt="" />`:l}
                <div class="card-body">
                    <div class="card-head">
                        ${e.title?o`<span class="card-title">${e.title}</span>`:l}
                        ${e.status?o`<span theme="badge ${br(e.status.type)}">${e.status.message}</span>`:l}
                    </div>
                    ${e.subtitle?o`<div class="card-subtitle">${e.subtitle}</div>`:l}
                    ${e.content?o`<div>${e.content}</div>`:l}
                </div>
        </div>`:o`${e}`,this.hasMore=!1,this.clickedOnCard=e=>{this.state[this.id+"_selected_items"]=[e],this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0}))}}updated(e){super.updated(e);const t=this.data[this.id]?.page;this.hasMore=t?.content?.length<t?.totalElements}firstUpdated(e){super.firstUpdated(e),this.respondToVisibility(this.askForMore,t=>{this.keepAsking=t,t&&this.askToUpper()})}render(){const e=this.data[this.id]?.page;return o`
            <div class="card-container">
                ${e?.content?.map(t=>o`<div @click="${()=>this.clickedOnCard(t)}" class="car-container">${this.renderItem(t)}</div>`)}
                <div id="ask-for-more" style="display: ${this.hasMore?"flex":"none"}; width: 100%; justify-content: center; padding: var(--lumo-space-m); color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Loading more…</div>
            </div>

            <slot></slot>
       `}};ne.styles=$`
        ${kt}
        
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
    `;Pe([p()],ne.prototype,"id",2);Pe([p()],ne.prototype,"metadata",2);Pe([p()],ne.prototype,"baseUrl",2);Pe([p()],ne.prototype,"state",2);Pe([p()],ne.prototype,"data",2);Pe([p()],ne.prototype,"appState",2);Pe([p()],ne.prototype,"appData",2);Pe([p()],ne.prototype,"emptyStateMessage",2);Pe([b()],ne.prototype,"keepAsking",2);Pe([de("#ask-for-more")],ne.prototype,"askForMore",2);Pe([b()],ne.prototype,"hasMore",2);ne=Pe([k("mateu-card-list")],ne);const kc={show:e=>console.debug("[mateu] no notifier registered, dropping toast:",e.text)};let hs=kc;function ms(e){hs=e}function Bt(e,t){hs.show(e,t)}var vs=(e=>(e.none="none",e.success="success",e.error="error",e.warning="warning",e.contrast="contrast",e.normal="normal",e))(vs||{}),fs=(e=>(e.primary="primary",e.secondary="secondary",e.tertiary="tertiary",e.tertiaryInline="tertiaryInline",e))(fs||{});const Cc=76;function di(e){if(e.weight!=null)return e.weight;const t=e.stereotype??"";if(t==="icon")return 1;if(t==="image")return 4;if(t==="html"||t==="richText"||t==="markdown"||t==="textarea")return 5;if(t==="link")return 2.5;if(t==="combobox"||t==="select")return 2;const a=e.dataType??"";return a==="bool"?1:a==="status"||a==="integer"?1.5:a==="number"||a==="date"||a==="money"?2:a==="dateTime"||a==="dateRange"?2.5:3}function _c(e,t){if(e.length===0)return"table";const a=e.reduce((c,u)=>c+di(u),0),r=t/Cc,i=a/r;if(e.length>10)return"masterDetail";if(i<=1.7)return"table";const s=e.filter(c=>c.identifier||(c.priority??Number.MAX_SAFE_INTEGER)<=2),n=s.reduce((c,u)=>c+di(u),0);return i>2.4?"masterDetail":s.length>0&&n<=8?"list":e.some(c=>c.stereotype==="image"||c.stereotype==="html")||s.length===0&&e.length>=4&&e.length<=8?"cards":"masterDetail"}function bs(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,a)=>(t.priority??Number.MAX_SAFE_INTEGER)-(a.priority??Number.MAX_SAFE_INTEGER))}function Ic(e){const t=bs(e);return t.length>0?t:e.slice(0,3)}var Sc=Object.defineProperty,Ec=Object.getOwnPropertyDescriptor,Te=(e,t,a,r)=>{for(var i=r>1?void 0:r?Ec(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Sc(t,a,i),i};const Pc={asc:"ascending",desc:"descending"};let le=class extends C{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this._columnPrefsRevision=0,this._prefsRevisionApplied=-1,this.search=()=>{const e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{Bt({text:e,position:"bottomEnd",variant:"error",duration:3e3},this)},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};const t=this.component.metadata;this._syncStateToUrl(t),!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this.fetchMoreElements=e=>{const{params:t,callback:a}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(a)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(a=>({fieldId:a.__data.path,direction:a.__data.direction?Pc[a.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>$e(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get columnPrefsScope(){return window.location.pathname}get effectiveComponent(){const e=this.component,t=e?.metadata;if(!e||!t?.columns)return e;if(this._prefsSource===e&&this._prefsRevisionApplied===this._columnPrefsRevision)return this._prefsApplied;const a=Vi(this.columnPrefsScope),r=Wi(t.columns,a,i=>i.metadata??{});return this._prefsApplied=r===t.columns?e:{...e,metadata:{...t,columns:r}},this._prefsSource=e,this._prefsRevisionApplied=this._columnPrefsRevision,this._prefsApplied}get columnChooserEntries(){return(this.component?.metadata?.columns??[]).map(t=>{const a=t.metadata??{},r=a.id??t.id;return r?{id:r,label:a.label??r,protected:Hi(a)}:void 0}).filter(t=>!!t)}renderColumnChooser(){const e=this.columnChooserEntries;return e.filter(t=>!t.protected).length===0?l:o`
            <mateu-column-chooser
                .columns="${e}"
                .scope="${this.columnPrefsScope}"
                @column-prefs-changed="${t=>{t.stopPropagation(),this._columnPrefsRevision++}}"
            ></mateu-column-chooser>
        `}get cols(){return this.effectiveComponent?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":_c(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set(["searchText",...(e.filters??[]).flatMap(t=>t.stereotype==="dateRange"||t.stereotype==="numberRange"?[`${t.fieldId}_from`,`${t.fieldId}_to`]:[t.fieldId])])}_syncStateToUrl(e){const t=this._filterIds(e),a=new URLSearchParams(window.location.search);t.forEach(d=>a.delete(d)),a.delete("page"),a.delete("sort"),t.forEach(d=>{const c=this.state[d];c!=null&&c!==""&&a.set(d,String(c))});const r=this.state.page;r&&r>0&&a.set("page",String(r));const i=this.state.sort;if(i&&i.length>0){const d=i.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");d&&a.set("sort",d)}const s=a.toString(),n=s?`${window.location.pathname}?${s}`:window.location.pathname;window.location.pathname+window.location.search!==n&&history.replaceState(null,"",n)}_initStateFromUrl(e,t){const a=new URLSearchParams(window.location.search),r=this._filterIds(e),i={...t};a.forEach((d,c)=>{r.has(c)&&(i[c]=d)});const s=a.get("page");if(s!==null){const d=parseInt(s,10);!isNaN(d)&&d>0&&(i.page=d)}const n=a.get("sort");if(n){const d=n.split(",").map(c=>{const[u,m]=c.split(":");return u&&m?{fieldId:u,direction:m}:null}).filter(Boolean);d.length>0&&(i.sort=d)}return i}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has("component")){const t=this.component?.id;if(t!==this._initializedForComponentId){this._initializedForComponentId=t;const a=this.component?.metadata,r=a.initialPage&&a.initialPage>0?a.initialPage:0;this.state=this._initStateFromUrl(a,{...this.state,size:a.pageSize,page:r,sort:[]}),(this.state.page!==r||this.state.sort?.length>0||[...this._filterIds(a)].some(s=>this.state[s]!=null))&&this.handleSearchRequested(void 0)}}}render(){const e=_=>{const A=[];return _.color&&_.color!==vs.normal&&A.push(_.color),_.buttonStyle&&A.push(_.buttonStyle===fs.tertiaryInline?"tertiary-inline":_.buttonStyle),A.length?A.join(" "):void 0},t=_=>_==="back"||_==="backToList"||!!_&&_.startsWith("cancel"),a=_=>{const A=B.get()?.renderToolbarButton?.(_,this.evalLabel(_.label),()=>this.handleToolbarButtonClick(_.actionId));return A||o`
                <button class="crud-btn"
                        data-action-id="${_.id}"
                        theme="${e(_)||l}"
                        @click="${()=>this.handleToolbarButtonClick(_.actionId)}"
                >${this.evalLabel(_.label)}</button>
            `};if(!this.component)return o`no component`;const r=this.effectiveComponent,i=r.metadata;i.serverSideOrdering=!0;const s=i?.toolbar??[],n=s.filter(_=>t(_.actionId)),d=s.filter(_=>!t(_.actionId)),c=n.length>0&&d.length>0,u=!!i?.title||!!i?.subtitle||s.length>0,m=this.effectiveGridLayout,v=this.cols,f=bs(v),x=this.data[this.id]?.page?.content??[],y=this.state[this.component?.id]?.emptyStateMessage,S=(_,A)=>{const P=A[_.id];if(P==null)return o``;if(_.dataType==="status"){const O=br(P.type);return o`<span theme="badge pill ${O}">${P.message}</span>`}return _.dataType==="bool"?o`${P?"✓":"✗"}`:typeof P=="object"?o`${P.label??P.name??P.message??""}`:o`${P}`},H=()=>{const _=this.identifierFieldName,A=this.state._selectedId??this.appState?._splitDetailId,P=f.find(T=>T.identifier)??f[0],O=T=>T.dataType==="action"||T.dataType==="actionGroup"||T.dataType==="menu"||T.stereotype==="button",Me=f.filter(T=>T!==P&&!O(T)),ta=v.filter(T=>O(T)),ut=(T,R,M)=>{T.stopPropagation(),T.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:R,parameters:{_clickedRow:M}},bubbles:!0,composed:!0}))},zt=T=>{const R=[];for(const M of ta){const N=T[M.id];if(M.dataType==="action"){const Ne=N?.methodNameInCrud?N:T.action?.methodNameInCrud?T.action:{methodNameInCrud:M.id,label:M.label,icon:null};R.push(o`
                            <button class="crud-btn" theme="tertiary small" title="${Ne.label||l}"
                                @click="${I=>ut(I,"action-on-row-"+Ne.methodNameInCrud,T)}">
                                ${Ne.icon?U(Ne.icon):l}
                                ${Ne.label??l}
                            </button>`)}else(M.dataType==="actionGroup"||M.dataType==="menu")&&(N?.actions??[]).forEach(I=>R.push(o`
                            <button class="crud-btn" theme="tertiary small" title="${I.label||l}"
                                @click="${re=>ut(re,"action-on-row-"+I.methodNameInCrud,T)}">
                                ${I.icon?U(I.icon):l}
                                ${I.label??l}
                            </button>`))}return R.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${R}
                    </div>`:l};return o`
                <div class="m-listbox" style="width: 100%;">
                    ${x.length===0?o`<div class="m-item" disabled>${Lt(y)}</div>`:l}
                    ${x.map(T=>o`
                        <div class="m-item"
                            ?selected="${_&&A!==void 0&&String(T[_])===String(A)}"
                            @click="${()=>{_&&T[_]!==void 0&&(this.state={...this.state,_selectedId:String(T[_])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:T},bubbles:!0,composed:!0}))}}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${P?T[P.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${Me.map(R=>o`<span>${R.label}: ${S(R,T)}</span>`)}
                            </div>
                            ${zt(T)}
                        </div>
                    `)}
                </div>`},pe=(_,A,P)=>{const O=this.identifierFieldName;O&&P[O]!==void 0&&(this.state={...this.state,_selectedId:String(P[O])}),_.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:A,parameters:P},bubbles:!0,composed:!0}))},F=()=>{const _=this.identifierFieldName,A=this.state._selectedId??this.appState?._splitDetailId,P=v.slice(0,6),O=P.filter(I=>I.stereotype==="image"),Me=P.find(I=>I.identifier)??P[0],ta=I=>!!I.actionId,ut=I=>I.dataType==="action"||I.dataType==="actionGroup"||I.dataType==="menu"||I.stereotype==="button",zt=P.find(I=>I.id==="select"&&I.dataType==="action"),T=!!zt,R=P.filter(I=>I!==Me&&!O.includes(I)&&!ta(I)&&!ut(I)),M=P.filter(I=>ut(I)&&!(T&&I===zt)),N=(I,re,pt)=>{I.stopPropagation(),I.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:re,parameters:{_clickedRow:pt}},bubbles:!0,composed:!0}))},Ne=I=>{const re=[];for(const pt of M){const wr=I[pt.id];if(pt.dataType==="action"){const aa=wr?.methodNameInCrud?wr:I.action?.methodNameInCrud?I.action:{methodNameInCrud:pt.id,label:pt.label,icon:null};re.push(o`
                            <button class="crud-btn" theme="tertiary" title="${aa.label||l}"
                                @click="${Ot=>N(Ot,"action-on-row-"+aa.methodNameInCrud,I)}">
                                ${aa.icon?U(aa.icon):l}
                                ${aa.label??l}
                            </button>`)}else(pt.dataType==="actionGroup"||pt.dataType==="menu")&&(wr?.actions??[]).forEach(Ot=>re.push(o`
                            <button class="crud-btn" theme="tertiary" title="${Ot.label||l}"
                                @click="${Fs=>N(Fs,"action-on-row-"+Ot.methodNameInCrud,I)}">
                                ${Ot.icon?U(Ot.icon):l}
                                ${Ot.label??l}
                            </button>`))}return re.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${re}
                    </div>`:l};return o`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${x.length===0?o`<div style="grid-column: 1 / -1;">${Lt(y)}</div>`:l}
                    ${x.map(I=>o`
                        <div class="crud-card"
                            ?data-selected="${_&&A!==void 0&&String(I[_])===String(A)}"
                            style="cursor: pointer;"
                            @click="${re=>T?N(re,"action-on-row-select",I):pe(re.target,"view",I)}"
                        >
                            ${O.length?o`<img src="${I[O[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: var(--lumo-border-radius-m, 8px);" />`:l}
                            ${Me?o`<div class="crud-card-title">${I[Me.id]??""}</div>`:l}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${R.map(re=>o`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${re.label}</span>
                                        <span>${S(re,I)}</span>
                                    </div>
                                `)}
                            </div>
                            ${Ne(I)}
                        </div>
                    `)}
                </div>`},ee=()=>{const _=Ic(v),A=_.find(O=>O.identifier)??_[0],P=_.filter(O=>O!==A);return o`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <div class="m-listbox" style="width: 100%;">
                            ${x.length===0?o`<div class="m-item" disabled>${Lt(y)}</div>`:l}
                            ${x.map(O=>o`
                                <div class="m-item"
                                    ?selected="${this.selectedItem===O}"
                                    @click="${()=>{this.selectedItem=O}}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${A?O[A.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${P.map(Me=>o`${S(Me,O)} `)}
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?o`
                            <div class="m-formlayout">
                                ${v.map(O=>o`
                                    <label style="display: flex; flex-direction: column; gap: .1rem; font-size: var(--lumo-font-size-s, .875rem);">
                                        <span style="color: var(--lumo-secondary-text-color, #667);">${O.label}</span>
                                        <span>${String(this.selectedItem[O.id]??"")}</span>
                                    </label>
                                `)}
                            </div>
                        `:o`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},he=()=>{const _=this.identifierFieldName,A=this.state._selectedId??this.appState?._splitDetailId,P=v[0],O=v.slice(1),Me=!!P?.actionId,ta=R=>(R??[]).map(M=>{const N=Array.isArray(M.children)?M.children:[];return N.length>0?{...M,children:ta(N)}:{...M,children:void 0}}),ut=ta(x),zt=(R,M,N)=>{R.stopPropagation(),_&&M[_]!==void 0&&(this.state={...this.state,_selectedId:String(M[_])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:N,parameters:M},bubbles:!0,composed:!0}))},T=(R,M)=>o`
                <tr class="${_&&A!==void 0&&String(R[_])===String(A)?"selected":""}"
                    style="cursor: pointer;" @click="${N=>zt(N,R,"view")}">
                    ${P?o`<td style="padding-left: ${M*1.2+.6}rem;">${R[P.id]??""}</td>`:l}
                    ${O.map(N=>N.id==="select"?o`<td><button class="crud-btn small" @click="${Ne=>{Ne.stopPropagation(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-select",parameters:{_clickedRow:R}},bubbles:!0,composed:!0}))}}">Select</button></td>`:o`<td>${R[N.id]??""}</td>`)}
                    ${Me?o`<td style="text-align: end;">${R?.viewable===!1?l:o`<button class="crud-btn small" @click="${N=>zt(N,R,"view")}">View</button>`}</td>`:l}
                </tr>
                ${(R.children??[]).map(N=>T(N,M+1))}
            `;return o`
                <table class="crud-table">
                    <thead><tr>
                        ${P?o`<th>${P.label??l}</th>`:l}
                        ${O.map(R=>o`<th>${R.label??l}</th>`)}
                        ${Me?o`<th></th>`:l}
                    </tr></thead>
                    <tbody>
                        ${ut.length===0?o`<tr><td colspan="99" style="padding: 1.5rem; text-align: center; color: var(--lumo-secondary-text-color, #888);">${Lt(y)}</td></tr>`:l}
                        ${ut.map(R=>T(R,0))}
                    </tbody>
                </table>`},J=B.get()?.rendersCrudLayouts?.()===!0,te=o`
            ${i.infiniteScrolling?o`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:l}
            ${!J&&m==="list"?H():!J&&m==="cards"?i.contentHeight?o`
                <div class="m-scroll" style="width: 100%; height: ${i.contentHeight};">
                    ${F()}
                </div>
            `:F():!J&&m==="masterDetail"?ee():!J&&m==="tree"?he():B.get()?.renderTableComponent(this,r,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,ae=i.infiniteScrolling?l:B.get()?.renderPagination(this,this.component),ge=this.showImportDialog?o`
            <div class="crud-modal-backdrop" @click="${_=>{_.target===_.currentTarget&&(this.showImportDialog=!1)}}">
                <div class="crud-modal">
                    <h3 style="margin: 0 0 .75rem;">Import</h3>
                    <input type="file" @change="${_=>{const A=_.target.files?.[0];if(A){const P=new FormData;P.append("file",A),fetch("/upload",{method:"POST",body:P}).then(O=>O.json()).then(O=>this.handleImportUploadSuccess({detail:O})).catch(()=>this.notify("Import failed"))}}}">
                    <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                        <button class="crud-btn" @click="${()=>{this.showImportDialog=!1}}">Cancel</button>
                    </div>
                </div>
            </div>
        `:l;return this.standalone?o`
                ${ge}
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
                        <div style="flex: 1; min-width: 0;">${B.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                        ${this.renderColumnChooser()}
                    </div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${te}</div>
                    <div style="flex-shrink: 0;">${ae}</div>
                </div>
            `:o`
            ${ge}
            ${u?o`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem);">
                        <div style="flex: 1; min-width: 0;">
                            ${i?.title?o`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(i.title)}</h2>
                            `:l}
                            ${i?.subtitle?o`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(i.subtitle)}</span>
                            `:l}
                        </div>
                        ${n.map(_=>a(_))}
                        ${c?o`<span class="toolbar-divider"></span>`:l}
                        ${d.map(_=>a(_))}
                        <slot></slot>
                    </div>
                `:l}
            <div style="border: var(--mateu-section-border, none); background: var(--mateu-section-bg, transparent); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--mateu-section-padding, 0); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem);">
                    <div style="flex: 1; min-width: 0;">${B.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                    ${this.renderColumnChooser()}
                </div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${te}</div>
                <div style="flex-shrink: 0;">${ae}</div>
            </div>
        `}createRenderRoot(){return B.mustUseShadowRoot()?super.createRenderRoot():this}};le.styles=$`
        ${kt}
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
    `;Te([p()],le.prototype,"component",2);Te([p()],le.prototype,"baseUrl",2);Te([p({type:Boolean})],le.prototype,"standalone",2);Te([p()],le.prototype,"state",2);Te([p()],le.prototype,"data",2);Te([p()],le.prototype,"appState",2);Te([p()],le.prototype,"appData",2);Te([b()],le.prototype,"showImportDialog",2);Te([b()],le.prototype,"availableWidthPx",2);Te([b()],le.prototype,"selectedItem",2);Te([b()],le.prototype,"_columnPrefsRevision",2);le=Te([k("mateu-table-crud")],le);var vt=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(vt||{}),Tc=Object.defineProperty,gr=(e,t,a,r)=>{for(var i=void 0,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=n(t,a,i)||i);return i&&Tc(t,a,i),i};class Pt extends pr{constructor(){super(...arguments),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(a=>a.type==vt.OnLoad).forEach(a=>{if((!a.condition||this._evalExpr(a.condition))&&!a.triggered){const i=a;i.triggered=!0;var r=i.times-1;i.timeoutMillis>0?this.scheduleOnload(i,r,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,a,r)=>{if(r!=this.component?.id)return;const i=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,callbackToken:i},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const a=t,i=(this.component.triggers??[]).filter(s=>s.type==vt.OnCustomEvent).filter(s=>s.eventName==a.type).filter(s=>s.source!=="COMPONENT"||a.detail?.__source===s.from);i.length!==0&&(i.some(s=>!s.source||s.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),i.forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId,parameters:a.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return Fi(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return _o(t,this.state??{},this.data??{},this._interpolationExtra())}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(ka.Add==t.action)this.component&&this.component.children?.push(t.component);else{if(this.callbackToken=xe(),t.component?.type==W.ServerSide)if(this.component){const r=this.component,i=t.component;r.actions=i.actions,r.type=i.type,r.rules=i.rules,r.triggers=i.triggers,r.serverSideType=i.serverSideType,r.route=i.route,r.initialData=i.initialData,r.validations=i.validations,r.cssClasses=i.cssClasses,r.slot=i.slot,r.style=i.style,r.children=i.children,(r.serverSideType!=i.serverSideType||r.id!=i.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const r=[t.component];this.component&&(this.component.children=r)}t.action!==ka.ReplaceKeepData&&(this.state={},this.data={})}if(t.state&&(this.state={...this.state,...t.state}),t.data){for(const r in t.data){const i=t.data[r]?.page;i?.pageNumber>0&&this.data[r]&&this.data[r].page.content&&(i.content?i.content=[...this.data[r].page.content,...i.content]:i.content=[...this.data[r].page.content])}this.data={...this.data,...t.data}}this.registerCustomEventListeners();const a=B.getAfterRenderHook();a&&setTimeout(()=>a(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:a,name:r})=>a.removeEventListener(r,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(a=>a.type==vt.OnCustomEvent).forEach(a=>{const r=a.source==="DOCUMENT"||a.source==="COMPONENT"?document:this;r.addEventListener(a.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:r,name:a.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:a})=>t.removeEventListener(a,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}gr([p()],Pt.prototype,"state");gr([p()],Pt.prototype,"data");gr([p()],Pt.prototype,"appData");gr([p()],Pt.prototype,"appState");const gs="mateu-recent-routes",zc=8;function ys(){try{return JSON.parse(localStorage.getItem(gs)??"{}")}catch{return{}}}function Oc(e){try{localStorage.setItem(gs,JSON.stringify(e))}catch{}}function ci(e){return ys()[e||"_"]??[]}function Rc(e,t){if(!t?.route||!t.label)return;const a=e||"_",r=ys(),s=(r[a]??[]).filter(n=>n.route!==t.route);s.unshift({route:t.route,label:t.label}),r[a]=s.slice(0,zc),Oc(r)}var Lc=Object.defineProperty,Ac=Object.getOwnPropertyDescriptor,Qe=(e,t,a,r)=>{for(var i=r>1?void 0:r?Ac(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Lc(t,a,i),i};let we=class extends C{constructor(){super(...arguments),this.baseUrl="",this.open=!1,this.queryText="",this.dataHits=[],this.loading=!1,this.selectedIndex=0,this.fabOffset=0,this.keydownHandler=null}connectedCallback(){super.connectedCallback(),this.keydownHandler=e=>{(e.metaKey||e.ctrlKey)&&(e.key==="k"||e.key==="K")?(e.preventDefault(),this.toggle()):e.key==="Escape"&&this.open&&this.close()},document.addEventListener("keydown",this.keydownHandler),this.setupFabObserver()}disconnectedCallback(){super.disconnectedCallback(),this.keydownHandler&&document.removeEventListener("keydown",this.keydownHandler),clearTimeout(this.searchTimer),this.fabObserver?.disconnect(),this.fabObserver=void 0}setupFabObserver(){const e=this.getRootNode(),t=e instanceof ShadowRoot?e:document.body;this.measureFabStack(),this.fabObserver?.disconnect(),this.fabObserver=new MutationObserver(()=>this.measureFabStack()),this.fabObserver.observe(t,{childList:!0,subtree:!0})}measureFabStack(){const a=(this.getRootNode().querySelectorAll?.(".ai-fab, .app-fab, .page-fab").length??0)*4;a!==this.fabOffset&&(this.fabOffset=a)}updated(e){e.has("open")&&this.open&&requestAnimationFrame(()=>this.inputEl?.focus())}toggle(){this.open?this.close():this.openCenter()}openCenter(){this.open=!0,this.queryText="",this.dataHits=[],this.selectedIndex=0}close(){this.open=!1,this.queryText="",this.dataHits=[],clearTimeout(this.searchTimer)}flattenMenu(e,t){const a=[];for(const r of e??[])if(!r.separator)if(r.submenus&&r.submenus.length>0){const i=t?`${t} › ${r.label}`:r.label;a.push(...this.flattenMenu(r.submenus,i))}else r.route!==void 0&&r.route!==null&&a.push({label:r.label,breadcrumb:t,route:r.route});return a}onInput(e){this.queryText=e,this.selectedIndex=0;const t=e.trim();if(clearTimeout(this.searchTimer),!t||!this.app?.globalSearchEnabled){this.dataHits=[],this.loading=!1;return}this.loading=!0,this.searchTimer=setTimeout(()=>this.fetchGlobalSearch(t),250)}async fetchGlobalSearch(e){const t=this.app;if(!t?.globalSearchEnabled){this.loading=!1;return}try{const r=(await Jt.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","command-center",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(i=>i.data).find(i=>i&&i._globalsearch);this.dataHits=r?._globalsearch??[]}catch{this.dataHits=[]}finally{this.loading=!1}}navigateTo(e,t){Rc(this.app?.serverSideType??"",{route:e,label:t}),this.close();for(const a of["route-changed","navigate-to-requested"])this.dispatchEvent(new CustomEvent(a,{detail:{route:e},bubbles:!0,composed:!0}))}askAi(){const e=this.queryText.trim();this.close(),this.dispatchEvent(new CustomEvent("mateu-open-ai",{detail:{query:e},bubbles:!0,composed:!0}))}visibleTargets(e){if(!this.queryText.trim()){const t=this.flattenMenu(this.app?.menu,"").map(r=>({route:r.route,label:r.label})),a=ci(this.app?.serverSideType??"");return[...t,...a]}return[...e.map(t=>({route:t.route,label:t.label})),...this.dataHits.map(t=>({route:t.route,label:t.label}))]}onKeydown(e,t){if(e.key==="ArrowDown")e.preventDefault(),this.selectedIndex=Math.min(this.selectedIndex+1,t.length-1);else if(e.key==="ArrowUp")e.preventDefault(),this.selectedIndex=Math.max(this.selectedIndex-1,0);else if(e.key==="Enter"){const a=t[this.selectedIndex];a&&this.navigateTo(a.route,a.label)}}render(){return o`
            <button class="cc-fab" style="bottom: ${1.5+this.fabOffset}rem;"
                @click=${()=>this.openCenter()} title="Buscar y navegar (⌘K)" aria-label="Command center">
                ${this.fabIcon()}
            </button>
            ${this.open?this.renderOverlay():l}
        `}fabIcon(){return o`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>`}renderOverlay(){const e=this.queryText.trim().toLowerCase(),t=e?this.flattenMenu(this.app?.menu,"").filter(r=>r.label.toLowerCase().includes(e)||r.breadcrumb.toLowerCase().includes(e)):[],a=this.visibleTargets(t);return o`
            <div class="cc-backdrop" @click=${()=>this.close()}>
                <div class="cc-panel" @click=${r=>r.stopPropagation()}>
                    <div class="cc-bar">
                        <button class="cc-icon-btn" @click=${()=>this.queryText?this.onInput(""):this.close()} title="${this.queryText?"Borrar":"Cerrar"}">
                            ${this.queryText?this.backIcon():this.searchGlyph()}
                        </button>
                        <input class="cc-input" .value=${this.queryText} placeholder="Buscar pantallas, datos y acciones…"
                            @input=${r=>this.onInput(r.target.value)}
                            @keydown=${r=>this.onKeydown(r,a)}>
                        ${this.queryText?o`<button class="cc-icon-btn" @click=${()=>this.onInput("")} title="Limpiar">${this.clearIcon()}</button>`:l}
                    </div>
                    <div class="cc-body">
                        ${e?this.renderResults(t):this.renderDefault()}
                    </div>
                </div>
                <button class="cc-close" @click=${()=>this.close()} title="Cerrar">${this.clearIcon()}</button>
            </div>
        `}renderDefault(){const e=this.flattenMenu(this.app?.menu,""),t=ci(this.app?.serverSideType??"");let a=-1;return o`
            <div class="cc-columns">
                <div class="cc-col">
                    <div class="cc-section-title">Ir a</div>
                    <div class="cc-tiles">
                        ${e.map(r=>{a++;const i=a;return o`
                            <button class="cc-tile ${i===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(r.route,r.label)}
                                @mouseenter=${()=>{this.selectedIndex=i}}>
                                <span class="cc-tile-label">${r.label}</span>
                                ${r.breadcrumb?o`<span class="cc-sub">${r.breadcrumb}</span>`:l}
                            </button>`})}
                        ${e.length===0?o`<div class="cc-empty">Sin opciones de menú.</div>`:l}
                    </div>
                </div>
                ${t.length>0?o`
                    <div class="cc-col cc-col--recent">
                        <div class="cc-section-title">Recientes</div>
                        ${t.map(r=>{a++;const i=a;return o`
                            <button class="cc-row ${i===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(r.route,r.label)}
                                @mouseenter=${()=>{this.selectedIndex=i}}>
                                <span class="cc-tile-label">${r.label}</span>
                            </button>`})}
                    </div>`:l}
            </div>
        `}renderResults(e){if(this.loading&&this.dataHits.length===0&&e.length===0)return o`<div class="cc-list">${[0,1,2,3].map(()=>o`<div class="cc-skeleton"></div>`)}</div>`;const t=e.length===0&&this.dataHits.length===0;return o`
            <div class="cc-list">
                ${this.app?.sseUrl?o`
                    <button class="cc-row cc-ask-ai" @click=${()=>this.askAi()}>
                        ${this.aiIcon()}<span class="cc-tile-label">Preguntar a la IA: “${this.queryText.trim()}”</span>
                    </button>`:l}
                ${e.length>0?o`<div class="cc-section-title">Pantallas</div>`:l}
                ${e.map((a,r)=>o`
                    <button class="cc-row ${r===this.selectedIndex?"cc-sel":""}"
                        @click=${()=>this.navigateTo(a.route,a.label)}
                        @mouseenter=${()=>{this.selectedIndex=r}}>
                        <span class="cc-tile-label">${a.label}</span>
                        ${a.breadcrumb?o`<span class="cc-sub">${a.breadcrumb}</span>`:l}
                    </button>`)}
                ${this.renderDataHits(e.length)}
                ${t?o`<div class="cc-empty">No encontramos coincidencias para “${this.queryText.trim()}”.</div>`:l}
            </div>
        `}renderDataHits(e){if(this.dataHits.length===0)return l;let t;return o`${this.dataHits.map((a,r)=>{const i=e+r,s=a.category&&a.category!==t;return t=a.category,o`
                ${s?o`<div class="cc-section-title">${a.category}</div>`:l}
                <button class="cc-row ${i===this.selectedIndex?"cc-sel":""}"
                    @click=${()=>this.navigateTo(a.route,a.label)}
                    @mouseenter=${()=>{this.selectedIndex=i}}>
                    <span class="cc-tile-label">${a.label}</span>
                    ${a.description?o`<span class="cc-sub">${a.description}</span>`:l}
                </button>`})}`}searchGlyph(){return o`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`}backIcon(){return o`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`}clearIcon(){return o`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`}aiIcon(){return o`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 4.7L19 8.5l-4.1 2.3L12 15l-1.9-4.2L6 8.5l5.1-1.8z"></path></svg>`}};we.styles=$`
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
    `;Qe([p({attribute:!1})],we.prototype,"app",2);Qe([p()],we.prototype,"baseUrl",2);Qe([b()],we.prototype,"open",2);Qe([b()],we.prototype,"queryText",2);Qe([b()],we.prototype,"dataHits",2);Qe([b()],we.prototype,"loading",2);Qe([b()],we.prototype,"selectedIndex",2);Qe([b()],we.prototype,"fabOffset",2);Qe([de(".cc-input")],we.prototype,"inputEl",2);we=Qe([k("mateu-command-center")],we);let Ue=null;function Dc(e){const t=e.component?.metadata;!!(t&&(t.commandCenterEnabled||t.chromeless)&&t.variant!=="MEDIATOR")?((!Ue||!Ue.isConnected)&&(Ue=document.createElement("mateu-command-center"),e.renderRoot.appendChild(Ue)),Ue.app=t,Ue.baseUrl=e.baseUrl??""):Ue&&e.renderRoot.contains(Ue)&&(Ue.remove(),Ue=null)}var Fc=Object.defineProperty,qc=Object.getOwnPropertyDescriptor,$s=(e,t,a,r)=>{for(var i=r>1?void 0:r?qc(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Fc(t,a,i),i};let or=class extends C{constructor(){super(...arguments),this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1;const t=e.detail.reason,a=t?.message??String(t);Bt({text:a,variant:"error",duration:3e3,position:"bottomEnd"},this)}}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-called-event",this.fetchStarted),this.addEventListener("backend-succeeded-event",this.fetchFinished),this.addEventListener("backend-cancelled-event",this.fetchFailed),this.addEventListener("backend-failed-event",this.fetchFailed)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-succeeded-event",this.fetchStarted),this.removeEventListener("backend-succeeded-event",this.fetchFinished),this.removeEventListener("backend-cancelled-event",this.fetchFailed),this.removeEventListener("backend-failed-event",this.fetchFailed)}render(){return o`<div class="loader-container">
            <div style="display: flex; flex-direction: column;">
                <slot></slot>
                <div class="loader-frame ${this.loading?"delayed-show":""}" style="${this.loading?"pointer-events: all;":"display: none;"}"><div class="loader"></div></div>
            </div>
        </div>`}};or.styles=$`
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
  `;$s([b()],or.prototype,"loading",2);or=$s([k("mateu-api-caller")],or);class Mc{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const Ft=new Mc;var Nc=Object.defineProperty,Uc=Object.getOwnPropertyDescriptor,V=(e,t,a,r)=>{for(var i=r>1?void 0:r?Uc(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Nc(t,a,i),i};let D=class extends Pt{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this.commandPaletteDataHits=[],this.openDataHit=e=>{Ft.confirmLeave()&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteDataHits=[],this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:e.route},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:e.route},bubbles:!0,composed:!0})))},this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this._openAiHandler=()=>{this.chatOpen||this.showHideIa()},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const a=this.renderRoot.querySelector?.("mateu-component");a&&a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const a=e[t];if(a.selected)return a;const r=this.getSelectedOption(a.submenus);if(r)return r}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const a=[];for(const r of e)if(!r.separator)if(r.submenus&&r.submenus.length>0){const i=t?`${t} › ${r.label}`:r.label;a.push(...this.flattenMenuForPalette(r.submenus,i))}else a.push({label:r.label,breadcrumb:t,consumedRoute:r.consumedRoute,route:r.route,actionId:r.actionId,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix});return a},this.handleCommandPaletteKeydown=(e,t)=>{const a=Math.min(t.length,10),r=a+Math.min(this.commandPaletteDataHits.length,8);if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,r-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){if(this.commandPaletteSelectedIndex>=a){const s=this.commandPaletteDataHits[this.commandPaletteSelectedIndex-a];s&&this.openDataHit(s);return}const i=t[this.commandPaletteSelectedIndex];i&&(this.selectRoute(i.consumedRoute,i.route,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return l;const e=this.component?.metadata;if(e?.commandCenterEnabled)return l;if(!e?.menu)return l;const t=this.flattenMenuForPalette(e.menu,""),a=this.commandPaletteQuery.toLowerCase(),r=a?t.filter(i=>i.label.toLowerCase().includes(a)||i.breadcrumb.toLowerCase().includes(a)):t;return o`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}>
                <div class="cmd-palette" @click=${i=>i.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        ${U("vaadin:search",void 0,"cmd-search-icon")}
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${i=>{this.commandPaletteQuery=i.target.value,this.commandPaletteSelectedIndex=0,this.fetchGlobalSearch(this.commandPaletteQuery)}}
                            @keydown=${i=>this.handleCommandPaletteKeydown(i,r)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${r.slice(0,10).map((i,s)=>o`
                            <div class="cmd-result ${s===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                @click=${()=>{this.selectRoute(i.consumedRoute,i.route,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=s}}
                            >
                                <span class="cmd-result-label">${i.label}</span>
                                ${i.breadcrumb?o`<span class="cmd-result-breadcrumb">${i.breadcrumb}</span>`:l}
                            </div>
                        `)}
                        ${a&&this.commandPaletteDataHits.length>0?o`
                            ${this.commandPaletteDataHits.slice(0,8).map((i,s)=>{const n=Math.min(r.length,10)+s,d=this.commandPaletteDataHits[s-1];return o`
                                    ${i.category&&i.category!==d?.category?o`
                                        <div class="cmd-category">${i.category}</div>`:l}
                                    <div class="cmd-result ${n===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                         @click=${()=>this.openDataHit(i)}
                                         @mouseenter=${()=>{this.commandPaletteSelectedIndex=n}}
                                    >
                                        <span class="cmd-result-label">${i.label}</span>
                                        ${i.description?o`<span class="cmd-result-breadcrumb">${i.description}</span>`:l}
                                    </div>`})}`:l}
                        ${r.length===0&&this.commandPaletteDataHits.length===0?o`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:l}
                    </div>
                </div>
            </div>
        `},this.renderRail=e=>o`
            <div class="nav-rail">
                ${e.map(t=>this.renderRailItem(t))}
            </div>
        `,this.renderRailItem=e=>{const t=e.submenus?.length>0?this.railOpenOption?.label===e.label:e.selected;return o`
            <div class="rail-item ${t?"rail-item--active":""}"
                @click=${()=>{e.submenus&&e.submenus.length>0?this.railOpenOption=this.railOpenOption?.label===e.label?null:e:(this.railOpenOption=null,this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix))}}
            >
                ${e.icon?U(e.icon,void 0,"rail-icon"):o`<div class="rail-icon-placeholder">${e.label.charAt(0).toUpperCase()}</div>`}
                <span class="rail-label">${e.label}</span>
            </div>
        `},this.renderRailSubPanel=e=>o`
            <div class="rail-sub-panel">
                <div class="rail-sub-title">${e.label}</div>
                ${e.submenus.map(t=>o`
                    <div class="rail-sub-item ${t.selected?"rail-sub-item--active":""}"
                        @click=${()=>{t.submenus&&t.submenus.length>0?this.railOpenOption=t:this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}
                    >${t.label}</div>
                `)}
            </div>
        `,this.renderTilesHub=e=>o`
            <div style="padding: 2rem;">
                <h2 style="margin-top: 0; margin-bottom: 1.5rem;">${e.label}</h2>
                <div class="tiles-hub-grid">
                    ${e.submenus.map(t=>o`
                        <div class="nav-tile"
                            @click=${()=>{t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))}}
                        >
                            ${t.icon?U(t.icon,"font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;"):l}
                            <div class="nav-tile-title">${t.label}</div>
                            ${t.description?o`<div class="nav-tile-desc">${t.description}</div>`:l}
                        </div>
                    `)}
                </div>
            </div>
        `,this.goHome=()=>{const e=this.component.metadata;this.selectRoute(e.route,"_page","",void 0,void 0,void 0)},this.selectRoute=(e,t,a,r,i,s)=>{Ft.confirmLeave()&&this._selectRoute(e,t,a,r,i,s)},this._selectRoute=(e,t,a,r,i,s)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=r,this.selectedRoute=t,this.selectedServerSideType=i,this.selectedUriPrefix=s,this.instant=xe(),this.state&&this.state._route!=null&&(this.state._route=void 0);let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let d=new URL(n+t);if(e&&d.pathname.startsWith(e)){const c=d.pathname.substring(e.length);d=new URL(d.origin+(c||"/"))}if((window.location.pathname||d.pathname)&&window.location.pathname!=d.pathname){let c=d.pathname;d.search&&(c+=d.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="/_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.mapItems=(e,t)=>e.map(a=>{if(a.submenus&&a.submenus.length>0){let r=this.mapItems(a.submenus,t);return t&&a.label.toLowerCase().includes(t)&&(r=this.mapItems(a.submenus,"")),r&&r.length>0?{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected,children:r}:void 0}if(a.separator)return t?void 0:{component:"hr"};if(!t||a.label.toLowerCase().includes(t))return{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||a.selected}}).filter(a=>a!=null),this.getSelectedIndex=e=>{if(e){const t=this.getSelectedOption(e);if(t)return e.indexOf(t)}return NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?o`
                <details open class="left-menu-group">
                    <summary>${e.label}</summary>
                    <div class="left-menu-children">
                        ${e.submenus.map(t=>o`${this.renderOptionOnLeftMenu(t)}`)}
                    </div>
                </details>
`:o`<button class="left-menu-item"
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",xe())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?o`
            ${e.map(a=>{const r=a;return o`

                        ${r.component=="hr"?o`<hr/>`:o`
                                <div class="side-nav-item ${r.selected?"side-nav-item--active":""}">
                                    <button class="side-nav-link"
                                            @click="${()=>{r.route&&!r.children&&this.selectRoute(void 0,r.route,void 0,this.baseUrl,void 0,void 0)}}">
                                        ${r.icon?U("vaadin:dashboard","margin-right:.5rem;"):l}${r.text}
                                    </button>
                                    ${r.children?o`<div class="side-nav-children">${this.renderSideNav(r.children,"children")}</div>`:l}
                                </div>
                        `}

                            `})}`:l,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return B.mustUseShadowRoot()?super.createRenderRoot():(D.injectLightDomStyles(),this)}static injectLightDomStyles(){if(D.lightDomStylesInjected||typeof document>"u"||(D.lightDomStylesInjected=!0,document.getElementById("mateu-app-light-styles")))return;const e=D.styles,t=Array.isArray(e)?e.map(r=>r?.cssText??"").join(`
`):e?.cssText??"";if(!t)return;const a=document.createElement("style");a.id="mateu-app-light-styles",a.textContent=t,document.head.appendChild(a)}fetchGlobalSearch(e){const t=this.component?.metadata;if(t?.globalSearchEnabled){if(clearTimeout(this._globalSearchTimer),!e){this.commandPaletteDataHits=[];return}this._globalSearchTimer=setTimeout(async()=>{try{const r=(await Jt.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","cmd-palette",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(i=>i.data).find(i=>i&&i._globalsearch);this.commandPaletteDataHits=r?._globalsearch??[]}catch{this.commandPaletteDataHits=[]}},250)}}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{this.component?.metadata?.commandCenterEnabled||((e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=""))},document.addEventListener("keydown",this._commandPaletteHandler),Ft.install(),this.addEventListener("compact-changed",this._compactHandler),this.addEventListener("mateu-open-ai",this._openAiHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler),this.removeEventListener("mateu-open-ai",this._openAiHandler)}updated(e){if(super.updated(e),Dc(this),this.component){const a=this.component.metadata;if(a){const r=a;if(r.favicon){let i=document.querySelector("link[rel~='icon']");i||(i=document.createElement("link"),i.rel="icon",document.head.appendChild(i)),i.href=r.favicon}e.has("component")&&(this.selectedRoute=r.homeRoute,this.selectedConsumedRoute=r.homeConsumedRoute,this.selectedServerSideType=r.homeServerSideType,this.selectedBaseUrl=r.homeBaseUrl,this.selectedUriPrefix=r.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return B.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};D.lightDomStylesInjected=!1;D.styles=$`
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

  `;V([b()],D.prototype,"filter",2);V([b()],D.prototype,"instant",2);V([b()],D.prototype,"selectedConsumedRoute",2);V([b()],D.prototype,"selectedRoute",2);V([b()],D.prototype,"selectedUriPrefix",2);V([b()],D.prototype,"selectedBaseUrl",2);V([b()],D.prototype,"selectedServerSideType",2);V([b()],D.prototype,"selectedParams",2);V([b()],D.prototype,"tilesMenuOption",2);V([b()],D.prototype,"railOpenOption",2);V([b()],D.prototype,"commandPaletteOpen",2);V([b()],D.prototype,"commandPaletteQuery",2);V([b()],D.prototype,"commandPaletteSelectedIndex",2);V([b()],D.prototype,"commandPaletteDataHits",2);V([b()],D.prototype,"pageCompact",2);V([de("mateu-chat")],D.prototype,"chat",2);V([b()],D.prototype,"isDark",2);V([b()],D.prototype,"chatOpen",2);V([de(".mateu-app-layout")],D.prototype,"vaadinAppLayout",2);D=V([k("mateu-app")],D);var jc=Object.defineProperty,Bc=Object.getOwnPropertyDescriptor,Ze=(e,t,a,r)=>{for(var i=r>1?void 0:r?Bc(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&jc(t,a,i),i};let ke=class extends C{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",a=>{const s=a.keyCode||a.which;(s===32||s===13)&&t.click()})}}render(){return o`
       `}};ke.styles=$`
  `;Ze([p()],ke.prototype,"message",2);Ze([p()],ke.prototype,"dismiss",2);Ze([p()],ke.prototype,"learnMore",2);Ze([p()],ke.prototype,"learnMoreLink",2);Ze([p()],ke.prototype,"showLearnMore",2);Ze([p()],ke.prototype,"position",2);Ze([p()],ke.prototype,"cookieName",2);Ze([b()],ke.prototype,"_css",2);Ze([de('[aria-label="cookieconsent"]')],ke.prototype,"popup",2);ke=Ze([k("mateu-cookie-consent")],ke);var Vc=Object.defineProperty,Hc=Object.getOwnPropertyDescriptor,xs=(e,t,a,r)=>{for(var i=r>1?void 0:r?Hc(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Vc(t,a,i),i};let nr=class extends C{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return o`<slot></slot>`}};nr.styles=$`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;xs([p()],nr.prototype,"target",2);nr=xs([k("mateu-event-interceptor")],nr);var Wc=Object.defineProperty,Gc=Object.getOwnPropertyDescriptor,ws=(e,t,a,r)=>{for(var i=r>1?void 0:r?Gc(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Wc(t,a,i),i};let lr=class extends Pt{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),500)},this.onKeydown=e=>{e.key==="Escape"&&this.opened&&(e.stopPropagation(),this.close())}}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this.onKeydown)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}render(){if(!this.opened)return o``;const e=this.component.metadata,t=Ca(e.headerTitle,this.state,this.data,this.appState,this.appData),a=!!(t||e.header||e.closeButtonOnHeader),r=[e.width?`width:${e.width};`:"min-width:min(90vw,28rem);",e.height?`height:${e.height};`:"",e.top?`margin-top:${e.top};`:""].join("");return o`
            <div class="backdrop ${e.modeless?"modeless":""}"
                 @click="${i=>{!e.modeless&&i.target===i.currentTarget&&this.close()}}">
                <div class="dialog ${e.noPadding?"no-padding":""} ${this.component?.cssClasses??""}" style="${r} ${this.component?.style??""}">
                    ${a?o`
                        <div class="dialog-header">
                            <mateu-event-interceptor .target="${this}" style="flex:1; min-width:0;">
                                ${t?o`<span class="dialog-title">${t}</span>`:l}
                                ${e.header?g(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):l}
                            </mateu-event-interceptor>
                            ${e.closeButtonOnHeader?o`<button class="dialog-close" @click="${this.close}" aria-label="Close">✕</button>`:l}
                        </div>`:l}
                    ${e.content?o`
                        <div class="dialog-body">
                            <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width:100%;">
                                ${g(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:l}
                    ${e.footer?o`
                        <div class="dialog-footer">
                            <mateu-event-interceptor .target="${this}" style="width:100%;">
                                ${g(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:l}
                </div>
            </div>
        `}};lr.styles=$`
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
    `;ws([b()],lr.prototype,"opened",2);lr=ws([k("mateu-dialog")],lr);var Kc=Object.defineProperty,Yc=Object.getOwnPropertyDescriptor,yr=(e,t,a,r)=>{for(var i=r>1?void 0:r?Yc(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Kc(t,a,i),i};let Re=class extends Pt{constructor(){super(...arguments),this.opened=!1,this.maximizeSteps=0,this.collapsed=!1,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),300)},this._escListener=e=>{if(e.key!=="Escape")return;const a=this.getRootNode().querySelectorAll("mateu-drawer, mateu-dialog");a[a.length-1]===this&&(e.stopPropagation(),this.close())}}effectiveWidth(e){if(e.width)return e.width;if(!e.size)return;const t=Re.SIZE_LADDER,a=Math.max(0,t.indexOf(e.size)),r=Math.min(t.length-1,a+this.maximizeSteps);return Re.SIZE_WIDTHS[t[r]]}canMaximize(e){if(!e.maximizable)return!1;const t=Re.SIZE_LADDER;return Math.max(0,t.indexOf(e.size??"m"))+this.maximizeSteps<t.length-1}firstUpdated(){requestAnimationFrame(()=>this.opened=!0)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._escListener)}disconnectedCallback(){document.removeEventListener("keydown",this._escListener),super.disconnectedCallback()}render(){const e=this.component.metadata,t=e.position??"end",a=Ca(e.headerTitle,this.state,this.data,this.appState,this.appData),r=Ca(e.subtitle,this.state,this.data,this.appState,this.appData),i=this.effectiveWidth(e),s=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0;return o`
        ${e.modeless?l:o`
            <div class="backdrop ${this.opened?"open":""}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${t} ${this.opened?"open":""} ${this.collapsed?"collapsed":""} ${this.component?.cssClasses??""}"
                role="dialog"
                aria-modal="${!e.modeless}"
                aria-label="${a??l}"
                style="${i&&t!=="bottom"?`width: ${i};`:""}${this.component?.style??""}"
        >
            <header>
                ${a?o`<div class="titles"><h3>${a}</h3>${r?o`<span class="subtitle">${r}</span>`:l}</div>`:o`<span class="spacer"></span>`}
                ${e.header?o`
                    <mateu-event-interceptor .target="${this}">${g(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:l}
                ${s?o`
                    <button class="drawer-icon" aria-label="${s.prevLabel??"Previous"}" title="${s.prevLabel??"Previous"}"
                            ?disabled="${!s.prevRoute}" @click="${()=>{s.prevRoute&&(window.location.href=s.prevRoute)}}">‹</button>
                    <button class="drawer-icon" aria-label="${s.nextLabel??"Next"}" title="${s.nextLabel??"Next"}"
                            ?disabled="${!s.nextRoute}" @click="${()=>{s.nextRoute&&(window.location.href=s.nextRoute)}}">›</button>
                `:l}
                ${e.collapsible?o`
                    <button class="drawer-icon" aria-label="${this.collapsed?"Expand":"Collapse"}" title="${this.collapsed?"Expand":"Collapse"}"
                            @click="${()=>this.collapsed=!this.collapsed}">${this.collapsed?"▴":"▾"}</button>
                `:l}
                ${this.canMaximize(e)?o`
                    <button class="drawer-icon" aria-label="Maximize" title="Maximize" @click="${()=>this.maximizeSteps++}">⤢</button>
                `:l}
                <button class="drawer-close" aria-label="Close" @click="${this.close}">✕</button>
            </header>
            ${this.collapsed?l:o`
            <div class="content ${e.noPadding?"no-padding":""}">
                ${e.content?o`
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${g(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:l}
            </div>
            ${e.footer?o`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${g(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:l}
            `}
        </section>
       `}};Re.SIZE_LADDER=["s","m","l","xl"];Re.SIZE_WIDTHS={s:"464px",m:"648px",l:"968px",xl:"90vw"};Re.styles=$`
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
  `;yr([b()],Re.prototype,"opened",2);yr([b()],Re.prototype,"maximizeSteps",2);yr([b()],Re.prototype,"collapsed",2);Re=yr([k("mateu-drawer")],Re);var Jc=Object.defineProperty,Xc=Object.getOwnPropertyDescriptor,ce=(e,t,a,r)=>{for(var i=r>1?void 0:r?Xc(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Jc(t,a,i),i};function ui(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let K=class extends C{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,a=t.banners??[],r=t.append??!1;r?this.actionBanners=[...this.actionBanners,...a]:(this._clearActionBannerTimers(),this.actionBanners=a);const i=r?this.actionBanners.length-a.length:0;a.forEach((s,n)=>{if(s.timeoutSeconds&&s.timeoutSeconds>0){const d=i+n;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,u)=>u!==d)},s.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const a=parseInt(t[1],10)-1;a>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(a))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,a=this.shadowRoot?.querySelector("mateu-content-header");let r=a?a.getBoundingClientRect().bottom:0;for(const n of e){if(!n.classList.contains("mateu-section--sticky"))continue;const d=n.getBoundingClientRect();d.top<=r+t+2&&(r=Math.max(r,d.bottom))}const i=r+t+4;let s=0;this._tocEntries.forEach((n,d)=>{n.el.getBoundingClientRect().top<=i&&(s=d)}),this._activeToc=s}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){if(super.updated(e),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")){const t=this.component?.metadata?.level??0;this.toggleAttribute("data-nested",t>0),this._scheduleStaticBannerTimeouts(),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")},bubbles:!0,composed:!0})),this._scheduleTocRebuild()}}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(a=>clearTimeout(a)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((a,r)=>{a.timeoutSeconds&&a.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,r])},a.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,a)=>a!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return $e(e,this.state,this.data)}_renderBanner(e,t){const a=this._evalBannerText(e.title),r=this._evalBannerText(e.description);return o`
            <div class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${a||e.hasCloseButton?o`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${a??""}</span>
                        ${e.hasCloseButton?o`
                            <button class="banner-close" @click=${t} title="Dismiss" aria-label="Dismiss">✕</button>
                        `:l}
                    </div>
                `:l}
                ${r?o`<p>${r}</p>`:l}
            </div>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(".mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(s=>({title:this._sectionTitle(s),el:s})).filter(s=>!!s.title),a=this.component?.metadata?.toc,r=t.length>4&&e.every(s=>!s.closest("vaadin-horizontal-layout")),i=(a===!0?!0:a===!1?!1:r)&&t.length>0;this._tocEntries=t,this._tocVisible=i,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),i?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header");this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty("--mateu-header-h",this._headerH+"px");const t=12;let a=this._headerH+t;for(const r of this._sectionCards())r.classList.contains("mateu-section--sticky")&&(r.style.top=a+"px",a+=r.offsetHeight+t)}_scrollContainer(){let e=ui(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=ui(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const a=12;let r=this._headerH+a;for(const d of this._sectionCards()){if(d===t.el)break;d.classList.contains("mateu-section--sticky")&&(r+=d.offsetHeight+a)}const i=this._scrollContainer(),s=i?i.getBoundingClientRect().top:0,n=t.el.getBoundingClientRect().top-s-r;(i??window).scrollBy({top:n,behavior:"smooth"})}_showHeaderBand(){const e=this.component?.metadata,t=!!(e?.title||e?.subtitle||e?.toolbar?.length),a=!!this.component?.children?.some(r=>r.metadata?.type===h.Crud);return t&&!a&&!this._hasWelcomeBanner()}_hasWelcomeBanner(){const e=t=>t?.metadata?.type===h.HeroSection?!0:(t?.children??[]).some(e);return(this.component?.children??[]).some(e)}render(){const e=this.component?.metadata,r=[...(e?.banners??[]).map((s,n)=>({banner:s,index:n})).filter(({index:s})=>!this.dismissedStaticBannerIndices.has(s)).map(({banner:s,index:n})=>({banner:s,onDismiss:()=>this._dismissStaticBanner(n)})),...this.actionBanners.map((s,n)=>({banner:s,onDismiss:()=>this._dismissActionBanner(n)}))],i=o`
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
                ${this._showHeaderBand()?o`
                    <div class="page-header-band" aria-hidden="true"></div>
                `:l}
            </div>
            ${r.length>0?o`
                <div class="page-banners">
                    ${r.map(({banner:s,onDismiss:n})=>this._renderBanner(s,n))}
                </div>
            `:l}
            <div class="page-body ${this._tocVisible?"with-toc":""}">
                <div class="form-content">
                    <slot @slotchange=${this._onSlotChange}></slot>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem);" class="form-buttons">
                        <slot name="buttons"></slot>
                    </div>
                </div>
                ${this._tocVisible?o`
                    <aside class="page-toc">
                        <nav>
                            ${this._tocEntries.map((s,n)=>o`
                                <a class="page-toc__item ${n===this._activeToc?"is-active":""}"
                                   @click=${()=>this._scrollToSection(n)}
                                   title=${n<9?`${s.title} (Ctrl+Alt+${n+1})`:s.title}>
                                    <span class="page-toc__label">${s.title}</span>
                                    ${n<9?o`<span class="page-toc__key">${n+1}</span>`:l}
                                </a>
                            `)}
                        </nav>
                    </aside>
                `:l}
            </div>
            <div class="form-footer">
                ${e?.footer?.map(s=>g(this,s,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return o`<div style="display: flex; flex-direction: column; width: 100%;">${i}</div>`}};K.styles=$`
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
    `;ce([p()],K.prototype,"component",2);ce([p()],K.prototype,"baseUrl",2);ce([p()],K.prototype,"state",2);ce([p()],K.prototype,"data",2);ce([p()],K.prototype,"appState",2);ce([p()],K.prototype,"appData",2);ce([p()],K.prototype,"value",2);ce([p({type:Boolean})],K.prototype,"standalone",2);ce([b()],K.prototype,"actionBanners",2);ce([b()],K.prototype,"dismissedStaticBannerIndices",2);ce([b()],K.prototype,"_tocEntries",2);ce([b()],K.prototype,"_activeToc",2);ce([b()],K.prototype,"_tocVisible",2);K=ce([k("mateu-page")],K);const Xr=$`
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
`,fa=e=>X`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,ks=fa(X`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),Cs=fa(X`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),_s=fa(X`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`);fa(X`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`);const Qc=fa(X`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),Zc=fa(X`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);var eu=Object.defineProperty,tu=Object.getOwnPropertyDescriptor,j=(e,t,a,r)=>{for(var i=r>1?void 0:r?tu(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&eu(t,a,i),i};const pi=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],au=e=>pi[Math.abs(e??0)%pi.length],ru=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let q=class extends C{constructor(){super(...arguments),this.localAgentUrl="http://127.0.0.1:8776",this.localAgentAlive=!1,this.menu=[],this.chatSessionId=xe(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,a=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=a,this.send(new CustomEvent("submit",{detail:{value:a},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{const e=new AbortController,t=setTimeout(()=>e.abort(),1200),a=await fetch(this.localAgentUrl+"/health",{signal:e.signal});clearTimeout(t),this.localAgentAlive=a.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{const t=e.target,a=Array.from(t.files??[]);if(t.value="",!(!a.length||!this.uploadUrl)){this.uploading=!0;try{const r=new FormData;r.append("sessionId",this.chatSessionId);for(const m of a)r.append("files",m,m.name);const i={},s=localStorage.getItem("__mateu_auth_token");s&&(i.Authorization="Bearer "+s);const n=sessionStorage.getItem("__mateu_sesion_id");n&&(i["X-Session-Id"]=n);const d=await fetch(this.uploadUrl,{method:"POST",headers:i,body:r});if(!d.ok)throw new Error(`Upload failed: ${d.status}`);const u=((await d.json()).files??[]).filter(m=>m&&m.path);this.attachments=[...this.attachments,...u]}catch(r){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${r instanceof Error?r.message:r}`,"agent")}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim(),a=this.localAgentAlive?this.localAgentUrl+"/mateu/agent/stream":this.sseUrl,r=this.attachments;if(!t&&r.length===0||!a)return;const i=r.length?`${t}${t?`

`:""}📎 ${r.map(d=>d.name).join(", ")}`:t;this.addMessage(i,"user"),this.attachments=[];const s=this.addMessage("","agent");this.startLoading();let n="";try{const d={Accept:"text/event-stream","Content-Type":"application/json"},c=localStorage.getItem("__mateu_auth_token");c&&(d.Authorization="Bearer "+c);const u=sessionStorage.getItem("__mateu_sesion_id");u&&(d["X-Session-Id"]=u);const m=this.contextProvider?.(),v=JSON.stringify({message:t,sessionId:this.chatSessionId,...r.length&&{attachments:r},...m!=null&&{context:m},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const f=await fetch(a,{method:"POST",headers:d,body:v});if(!f.ok){const S=await f.text();throw new Error(`Servidor respondió ${f.status}: ${S}`)}const w=f.body?.getReader();if(!w)throw new Error("No se pudo obtener el reader del stream.");const x=new TextDecoder;let y="";for(;;){const{done:S,value:H}=await w.read();if(S){if(y.trim().startsWith("data:")){const he=y.trim().slice(5).trim(),J=this.tryParseTokenUsage(he),te=!J&&this.tryParseCustomEvent(he);J?this.tokenUsage={...this.tokenUsage,...J}:te?te.event==="agent-error"?(n="⚠️ "+(te.detail?.message??"Error desconocido del agente"),this.updateMessage(s,n)):this.dispatchEvent(new CustomEvent(te.event,{detail:te.detail,bubbles:!0,composed:!0})):(n+=he,this.updateMessage(s,n))}break}const pe=x.decode(H,{stream:!0});y+=pe;const F=y.split(`
`);y=F.pop()||"";let ee=!1;for(const he of F)if(he.trim().startsWith("data:")){const J=he.trim().slice(5).trim(),te=this.tryParseTokenUsage(J),ae=!te&&this.tryParseCustomEvent(J);te?this.tokenUsage={...this.tokenUsage,...te}:ae?ae.event==="agent-error"?(n="⚠️ "+(ae.detail?.message??"Error desconocido del agente"),this.updateMessage(s,n)):this.dispatchEvent(new CustomEvent(ae.event,{detail:ae.detail,bubbles:!0,composed:!0})):(n+=J+`
`,ee=!0)}ee&&this.updateMessage(s,n)}n||this.updateMessage(s,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(d){console.error("Error en el flujo SSE:",d);const c=d?.message??String(d);(c==="Failed to fetch"||c==="network error"||c==="Load failed")&&!n?this.updateMessage(s,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(s,"⚠️ Error: "+c)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback(),this.probeLocalAgent();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=a=>{console.error("Error de reconocimiento: "+a.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const a={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,a],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((a,r)=>r===e?{...a,text:t}:a),this.scrollBottom()}tryParseCustomEvent(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if(typeof a.event=="string")return{event:a.event,detail:a.detail??{}}}catch{}return null}tryParseTokenUsage(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const a=JSON.parse(t);if("inputTokens"in a||"outputTokens"in a||"totalTokens"in a)return a}catch{}return null}buildMenuContext(e,t=[]){const a=[];for(const r of e){if(r.separator||r.remote)continue;const i=[...t,r.label];if(r.submenus&&r.submenus.length>0)a.push(...this.buildMenuContext(r.submenus,i));else{const s={path:i,navigation:{route:r.route,consumedRoute:r.consumedRoute,actionId:r.actionId??"",baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix}};r.description&&(s.description=r.description),a.push(s)}}return a}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return o`
            <div class="chat-container">
                <div class="chat-header">
                    <span class="chat-title">AI Assistant</span>
                    ${this.localAgentAlive?o`<span class="local-agent-badge" title="Hablando con tu CLI local (companion en ${this.localAgentUrl}) — sin api key">agente local</span>`:l}
                    <button class="chat-icon-btn" @click="${this.toggleExpanded}"
                            title="${this.expanded?"Contraer":"Expandir a pantalla completa"}"
                            aria-label="${this.expanded?"Contraer el chat":"Expandir el chat"}">
                        ${this.expanded?"⤡":"⤢"}
                    </button>
                    <button class="chat-close" @click="${this.closeChat}" title="Cerrar">
                        ${Zc}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>o`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${au(e.userColorIndex)};">${ru(e.userName)}</div>
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
                ${this.tokenUsage?o`
                    <div class="token-bar">
                        <span class="token-label">Tokens:</span>
                        ${this.tokenUsage.inputTokens!=null?o`<span class="token-chip">in&nbsp;<strong>${this.tokenUsage.inputTokens}</strong></span>`:l}
                        ${this.tokenUsage.outputTokens!=null?o`<span class="token-chip">out&nbsp;<strong>${this.tokenUsage.outputTokens}</strong></span>`:l}
                        ${this.tokenUsage.totalTokens!=null?o`<span class="token-chip">total&nbsp;<strong>${this.tokenUsage.totalTokens}</strong></span>`:l}
                    </div>
                `:l}
                ${this.loading?o`
                    <div class="loading-bar">
                        <span class="spinner"></span>
                        <span class="loading-text">Thinking… ${this.elapsedSeconds}s</span>
                    </div>
                `:l}
                ${this.attachments.length?o`
                    <div class="attachments">
                        ${this.attachments.map(e=>o`
                            <span class="attachment-chip" title="${e.path}">
                                📎 ${e.name}
                                <button class="attachment-remove" @click="${()=>this.removeAttachment(e.path)}" aria-label="Quitar ${e.name}">✕</button>
                            </span>`)}
                    </div>
                `:l}
                <div class="input-bar">
                    ${this.uploadUrl?o`
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
                    >${Qc}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}};q.styles=[Xr,$`
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
    `];j([p({attribute:!1})],q.prototype,"contextProvider",2);j([p()],q.prototype,"localAgentUrl",2);j([p({attribute:!1})],q.prototype,"mcpUrl",2);j([b()],q.prototype,"localAgentAlive",2);j([p()],q.prototype,"sseUrl",2);j([p()],q.prototype,"uploadUrl",2);j([p({attribute:!1})],q.prototype,"menu",2);j([b()],q.prototype,"attachments",2);j([b()],q.prototype,"uploading",2);j([de(".file-input")],q.prototype,"fileInputElement",2);j([p({type:Boolean,reflect:!0})],q.prototype,"expanded",2);j([p()],q.prototype,"items",2);j([de(".scroll-container")],q.prototype,"scrollContainer",2);j([de(".msg-input")],q.prototype,"messageInputElement",2);j([b()],q.prototype,"recognition",2);j([b()],q.prototype,"listening",2);j([b()],q.prototype,"recognitionAvailable",2);j([b()],q.prototype,"loading",2);j([b()],q.prototype,"elapsedSeconds",2);j([b()],q.prototype,"tokenUsage",2);q=j([k("mateu-chat")],q);var iu=Object.defineProperty,su=Object.getOwnPropertyDescriptor,Fa=(e,t,a,r)=>{for(var i=r>1?void 0:r?su(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&iu(t,a,i),i};let Vt=class extends C{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([me(()=>import("./vendor-chartjs.js").then(r=>r.a),[]),me(()=>import("./vendor-chartjs.js").then(r=>r.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const a={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,a)}handleSlotChange(){}render(){return o`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};Vt.styles=$`
  `;Fa([p()],Vt.prototype,"type",2);Fa([p()],Vt.prototype,"data",2);Fa([p()],Vt.prototype,"options",2);Fa([de("#chart")],Vt.prototype,"chartElement",2);Vt=Fa([k("mateu-chart")],Vt);var ou=Object.defineProperty,nu=Object.getOwnPropertyDescriptor,Qr=(e,t,a,r)=>{for(var i=r>1?void 0:r?nu(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&ou(t,a,i),i};let za=class extends C{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await me(async()=>{const{default:r}=await import("./vendor-diagrams.js");return{default:r}},__vite__mapDeps([0,1]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const a={container:this.divElement};this.chart=new t(a),this.chart.importXML(e)}handleSlotChange(){}render(){return o`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};za.styles=$`
  `;Qr([p()],za.prototype,"xml",2);Qr([de("#canvas")],za.prototype,"divElement",2);za=Qr([k("mateu-bpmn")],za);var lu=Object.defineProperty,du=Object.getOwnPropertyDescriptor,ba=(e,t,a,r)=>{for(var i=r>1?void 0:r?du(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&lu(t,a,i),i};const Ir=160,je=56,cu=220,hi=110,mt=60,uu={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},pu={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},hu=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function mu(){return"step-"+Math.random().toString(36).slice(2,8)}let $t=class extends C{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(n=>{t[n.id]=0});let a=!0;for(;a;)a=!1,e.forEach(n=>{if(n.preconditionStepId!=null&&t[n.preconditionStepId]!==void 0){const d=t[n.preconditionStepId]+1;d>t[n.id]&&(t[n.id]=d,a=!0)}});const r={};e.forEach(n=>{const d=t[n.id]??0;(r[d]??=[]).push(n.id)});const i={...this.positions};let s=!1;Object.entries(r).forEach(([n,d])=>{const c=Number(n);d.forEach((u,m)=>{i[u]||(i[u]={x:mt+c*cu,y:mt+m*hi},s=!0)})}),s&&(this.positions=i)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addStep(){const e=mu(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(i=>i.y),r=a.length?Math.max(...a)+hi:mt;this.positions={...this.positions,[e]:{x:mt,y:r}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(r=>r.id!==e).map(r=>r.preconditionStepId===e?{...r,preconditionStepId:void 0}:r)};const{[e]:t,...a}=this.positions;this.positions=a,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},r=this.toSvgPoint(e);this.dragOffset={x:r.x-a.x,y:r.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(r=>r.x))+Ir+mt:600,a=e.length?Math.max(...e.map(r=>r.y))+je+mt:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return o`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():""}
                <div class="workspace">
                    <div class="canvas-wrap">
                        <svg width="${e}" height="${t}" class="canvas"
                             @click="${r=>{r.target===r.currentTarget&&(this.selectedId=null)}}">
                            <defs>
                                <marker id="arrow" markerWidth="8" markerHeight="8"
                                        refX="6" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/>
                                </marker>
                            </defs>
                            ${a.map(r=>this.renderArrow(r))}
                            ${a.map(r=>this.renderNode(r))}
                        </svg>
                    </div>
                    ${this.selectedId?this.renderPanel():""}
                </div>
            </div>
        `}renderToolbar(){const e=this.wf.status??"DRAFT";return o`
            <div class="toolbar">
                <span class="wf-name">${this.wf.name}</span>
                <span class="badge badge-${e.toLowerCase()}">${e}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${ks}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${Cs}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${_s}
                    Export
                </button>
            </div>
        `}renderMeta(){const e=this.wf;return o`
            <div class="meta-panel">
                <div class="meta-grid">
                    <label>Name</label>
                    <input class="inp" .value="${e.name}" @change="${t=>this.updateWf({name:t.target.value})}"/>
                    <label>Description</label>
                    <textarea class="inp" rows="2" @change="${t=>this.updateWf({description:t.target.value})}">${e.description??""}</textarea>
                    <label>Status</label>
                    <select class="inp" @change="${t=>this.updateWf({status:t.target.value})}">
                        ${["DRAFT","ACTIVE","DISABLED","ARCHIVED"].map(t=>o`
                            <option value="${t}" ?selected="${e.status===t}">${t}</option>`)}
                    </select>
                    <label>Limit concurrent</label>
                    <input type="checkbox" ?checked="${e.limitConcurrentExecutions}"
                           @change="${t=>this.updateWf({limitConcurrentExecutions:t.target.checked})}"/>
                    ${e.limitConcurrentExecutions?o`
                        <label>Max concurrent</label>
                        <input class="inp" type="number" min="0" .value="${String(e.maxConcurrentExecutions??0)}"
                               @change="${t=>this.updateWf({maxConcurrentExecutions:Number(t.target.value)})}"/>
                        <label>Enqueue on limit</label>
                        <input type="checkbox" ?checked="${e.enqueueOnLimit}"
                               @change="${t=>this.updateWf({enqueueOnLimit:t.target.checked})}"/>
                    `:""}
                </div>
            </div>
        `}renderArrow(e){if(!e.preconditionStepId)return X``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return X``;const r=t.x+Ir,i=t.y+je/2,s=a.x,n=a.y+je/2,d=(r+s)/2;return X`
            <path d="M${r},${i} C${d},${i} ${d},${n} ${s},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:mt,y:mt},a=uu[e.type]??"#64748b",r=pu[e.type]??"•",i=this.selectedId===e.id;return X`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${s=>this.onNodeMouseDown(s,e.id)}"
               @click="${s=>{s.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Ir}" height="${je}" rx="8"
                      fill="white"
                      stroke="${i?a:"#e2e8f0"}"
                      stroke-width="${i?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${je}" rx="8" fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${je}" fill="${a}"/>
                <text x="16" y="${je/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${r}</text>
                <!-- name -->
                <text x="44" y="${je/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${je/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${je/2+20}" font-size="9" fill="${a}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(r=>r.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(r=>r.id!==e.id),a=(r,i)=>o`
            <div class="field">
                <label class="field-label">${r}</label>
                ${i}
            </div>
        `;return o`
            <div class="properties">
                <div class="prop-header">
                    <span>Step Properties</span>
                    <button class="del-btn" title="Delete step"
                            @click="${()=>this.deleteStep(e.id)}">🗑</button>
                    <button class="close-btn" @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${a("ID",o`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${a("Name",o`<input class="inp" .value="${e.name}"
                        @change="${r=>this.updateStep(e.id,{name:r.target.value})}"/>`)}
                    ${a("Type",o`
                        <select class="inp" @change="${r=>this.updateStep(e.id,{type:r.target.value})}">
                            ${hu.map(r=>o`<option value="${r}" ?selected="${e.type===r}">${r}</option>`)}
                        </select>`)}
                    ${a("Description",o`<textarea class="inp" rows="2"
                        @change="${r=>this.updateStep(e.id,{description:r.target.value})}">${e.description??""}</textarea>`)}
                    ${a("Precondition step",o`
                        <select class="inp" @change="${r=>this.updateStep(e.id,{preconditionStepId:r.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(r=>o`<option value="${r.id}" ?selected="${e.preconditionStepId===r.id}">${r.name} (${r.id})</option>`)}
                        </select>`)}
                    ${a("Precondition expression",o`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??""}"
                        @change="${r=>this.updateStep(e.id,{preconditionExpression:r.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${r=>this.updateStep(e.id,{parallel:r.target.checked})}"/>
                    </div>
                    ${a("Timeout (ms)",o`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${r=>this.updateStep(e.id,{timeout:Number(r.target.value)})}"/>`)}
                    ${a("Retries",o`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${r=>this.updateStep(e.id,{retries:Number(r.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${r=>this.updateStep(e.id,{rollbackable:r.target.checked})}"/>
                    </div>
                    ${e.rollbackable?a("Compensation step",o`
                        <select class="inp" @change="${r=>this.updateStep(e.id,{compensationStepId:r.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(r=>o`<option value="${r.id}" ?selected="${e.compensationStepId===r.id}">${r.name} (${r.id})</option>`)}
                        </select>`):""}

                    ${e.type==="ACTION"?a("Topic",o`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??""}"
                        @change="${r=>this.updateStep(e.id,{topic:r.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?a("Form ID",o`<input class="inp"
                        .value="${e.formId??""}"
                        @change="${r=>this.updateStep(e.id,{formId:r.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?a("Child workflow ID",o`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??""}"
                        @change="${r=>this.updateStep(e.id,{childWorkflowDefinitionId:r.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),r=document.createElement("a");r.href=a,r.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",r.click(),URL.revokeObjectURL(a)}};$t.styles=[Xr,$`
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
    `];ba([p()],$t.prototype,"value",2);ba([b()],$t.prototype,"wf",2);ba([b()],$t.prototype,"positions",2);ba([b()],$t.prototype,"selectedId",2);ba([b()],$t.prototype,"showMeta",2);$t=ba([k("mateu-workflow")],$t);var vu=Object.defineProperty,fu=Object.getOwnPropertyDescriptor,qa=(e,t,a,r)=>{for(var i=r>1?void 0:r?fu(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&vu(t,a,i),i};const bu=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],gu=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],yu={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function mi(){return"field-"+Math.random().toString(36).slice(2,8)}let Ht=class extends C{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=so.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:a,newIndex:r}=t;if(a===void 0||r===void 0||a===r)return;const i=[...this.form.fields],[s]=i.splice(a,1);i.splice(r,0,s),this.form={...this.form,fields:i},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addField(){const e=mi(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(s=>s.id===e);if(!t)return;const a={...t,id:mi(),label:t.label+" (copy)"},r=this.form.fields.findIndex(s=>s.id===e),i=[...this.form.fields];i.splice(r+1,0,a),this.form={...this.form,fields:i},this.selectedId=a.id,this.emit()}render(){return o`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():l}
                <div class="workspace">
                    ${this.renderList()}
                    ${this.selectedId?this.renderPanel():l}
                </div>
            </div>
        `}renderToolbar(){return o`
            <div class="toolbar">
                <span class="form-name">${this.form.name}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${ks}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${Cs}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${_s}
                    Export
                </button>
            </div>
        `}renderMeta(){const e=this.form;return o`
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
        `}renderList(){const e=this.form.fields;return o`
            <div class="list-wrap">
                ${e.length===0?o`
                    <div class="empty">
                        No fields yet. Click <strong>Add Field</strong> to start.
                    </div>`:l}
                <div class="field-list">
                    ${e.map(t=>this.renderRow(t))}
                </div>
            </div>
        `}renderRow(e){const t=yu[e.dataType]??"#64748b",a=this.selectedId===e.id;return o`
            <div class="field-row ${a?"selected":""}"
                 data-id="${e.id}"
                 @click="${()=>this.selectedId=this.selectedId===e.id?null:e.id}">
                <span class="drag-handle" title="Drag to reorder">⠿</span>
                <span class="type-badge" style="background:${t}">${e.dataType}</span>
                <span class="field-label-text">${e.label}</span>
                <span class="field-id-text">${e.id}</span>
                ${e.required?o`<span class="required-badge">required</span>`:l}
                ${e.stereotype&&e.stereotype!=="regular"?o`<span class="stereo-badge">${e.stereotype}</span>`:l}
                <div style="flex:1"></div>
                <button class="row-btn" title="Duplicate"
                        @click="${r=>{r.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${r=>{r.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){const e=this.form.fields.find(a=>a.id===this.selectedId);if(!e)return l;const t=(a,r)=>o`
            <div class="prop-field">
                <label class="prop-label">${a}</label>
                ${r}
            </div>
        `;return o`
            <div class="properties">
                <div class="prop-header">
                    <span>Field Properties</span>
                    <button class="close-btn" @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${t("ID",o`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${t("Label",o`
                        <input class="inp" .value="${e.label}"
                               @change="${a=>this.updateField(e.id,{label:a.target.value})}"/>`)}
                    ${t("Data type",o`
                        <select class="inp"
                                @change="${a=>this.updateField(e.id,{dataType:a.target.value})}">
                            ${bu.map(a=>o`
                                <option value="${a}" ?selected="${e.dataType===a}">${a}</option>`)}
                        </select>`)}
                    ${t("Stereotype",o`
                        <select class="inp"
                                @change="${a=>this.updateField(e.id,{stereotype:a.target.value||void 0})}">
                            ${gu.map(a=>o`
                                <option value="${a}" ?selected="${(e.stereotype??"regular")===a}">${a}</option>`)}
                        </select>`)}
                    <div class="prop-field row">
                        <label class="prop-label">Required</label>
                        <input type="checkbox" ?checked="${e.required}"
                               @change="${a=>this.updateField(e.id,{required:a.target.checked})}"/>
                    </div>
                    ${t("Description / hint",o`
                        <textarea class="inp" rows="3"
                                  @change="${a=>this.updateField(e.id,{description:a.target.value||void 0})}">${e.description??""}</textarea>`)}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),r=document.createElement("a");r.href=a,r.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",r.click(),URL.revokeObjectURL(a)}};Ht.styles=[Xr,$`
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
    `];qa([p()],Ht.prototype,"value",2);qa([b()],Ht.prototype,"form",2);qa([b()],Ht.prototype,"selectedId",2);qa([b()],Ht.prototype,"showMeta",2);Ht=qa([k("mateu-form-editor")],Ht);var $u=Object.defineProperty,xu=Object.getOwnPropertyDescriptor,et=(e,t,a,r)=>{for(var i=r>1?void 0:r?xu(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&$u(t,a,i),i};let Ce=class extends C{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return o`
            <button class="tab ${this.activeTab===e?"tab--active":""}"
                @click=${()=>{this.activeTab=e}}>
                ${t}
            </button>
        `}render(){return this.open?o`
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
                        ${this.activeTab==="appstate"?o`
                            <pre class="json">${this._fmt(this.appState)}</pre>
                        `:l}
                        ${this.activeTab==="appdata"?o`
                            <pre class="json">${this._fmt(this.appData)}</pre>
                        `:l}
                        ${this.activeTab==="inspector"?o`
                            ${this.hoveredTag?o`
                                <div class="inspector-tag">&lt;${this.hoveredTag}${this.hoveredId?` id="${this.hoveredId}"`:""}&gt;</div>
                                <div class="section-label">state</div>
                                <pre class="json">${this._fmt(this.hoveredState)}</pre>
                                <div class="section-label">data</div>
                                <pre class="json">${this._fmt(this.hoveredData)}</pre>
                                <div class="section-label">metadata</div>
                                <pre class="json">${this._fmt(this.hoveredMeta)}</pre>
                            `:o`
                                <div class="inspector-hint">Hover a mateu-* element to inspect it</div>
                            `}
                        `:l}
                    </div>
                </div>
            `:o`
            <button class="fab" @click=${()=>{this.open=!0}} title="Mateu Debug">🐛</button>
        `}};Ce.styles=$`
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
    `;et([p()],Ce.prototype,"appState",2);et([p()],Ce.prototype,"appData",2);et([b()],Ce.prototype,"open",2);et([b()],Ce.prototype,"activeTab",2);et([b()],Ce.prototype,"hoveredTag",2);et([b()],Ce.prototype,"hoveredId",2);et([b()],Ce.prototype,"hoveredState",2);et([b()],Ce.prototype,"hoveredData",2);et([b()],Ce.prototype,"hoveredMeta",2);Ce=et([k("mateu-debug-overlay")],Ce);var ze=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(ze||{}),Is=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(Is||{}),Ss=(e=>(e.Continue="Continue",e.Stop="Stop",e))(Ss||{}),wu=Object.defineProperty,ku=Object.getOwnPropertyDescriptor,$r=(e,t,a,r)=>{for(var i=r>1?void 0:r?ku(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&wu(t,a,i),i};let ya=null,la=class extends Pt{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,a=this.data,r=this.appState,i=this.appData,s=this.component,n=x=>Fi(x,t,a,{appState:r,appData:i,component:s}),d=x=>Nr(x,t,a,r,i,{component:s}),c=["state","data","appState","appData","component"],u=[t,a,r,i,s],m={...this.state},v={...this.data};let f=!1,w=!1;for(let x=0;x<e.length;x++){const y=e[x];try{if(n(y.filter)){if(ze.SetStateValue==y.action||ze.SetDataValue==y.action){const S=ze.SetStateValue==y.action?m:v,H=y.fieldName.split(",");for(let pe=0;pe<H.length;pe++){const F=H[pe];if(!S[F]||S[F]!=y.value){const ee=y.expression?d(y.expression):y.value,he=Is.none==y.fieldAttribute?F:F+"."+y.fieldAttribute;ee!=S[he]&&(S[he]=ee,ze.SetStateValue==y.action&&(f=!0),ze.SetDataValue==y.action&&(w=!0))}}}if(ze.RunAction==y.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:y.actionId},bubbles:!0,composed:!0})),ze.RunJS==y.action&&new Function(...c,y.value)(...u),ze.SetAttributeValue==y.action){const S=y.expression?n(y.expression):y.value;if(y.fieldAttribute=="disabled"){S?this.shadowRoot?.getElementById(y.fieldName)?.setAttribute(y.fieldAttribute,"disabled"):this.shadowRoot?.getElementById(y.fieldName)?.removeAttribute(y.fieldAttribute);continue}this.shadowRoot?.getElementById(y.fieldName)?.setAttribute(y.fieldAttribute,S)}if(ze.SetCssClass==y.action&&this.shadowRoot?.getElementById(y.fieldName)?.setAttribute("class",y.value),ze.SetStyle==y.action&&this.shadowRoot?.getElementById(y.fieldName)?.style.setProperty(y.expression,y.value),Ss.Stop==y.result)break}}catch(S){console.error("rule failed",y,S)}}f&&(this.state=m),w&&(this.data=v),f&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,a=this.component.validations;let r=!0,i=!1;const s=this.data??{},n={...this.data??{},errors:{}};if(a){for(let d=0;d<a.length;d++){const c=a[d];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let m=0;m<u.length;m++){const v=u[m];n.errors[v]=[]}}for(let d=0;d<a.length;d++){const c=a[d];if(!this.skipValidation(t,c))try{const u=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!u){r=!1;const v=(c.fieldId??"_component").split(",");for(let f=0;f<v.length;f++){const w=v[f];let x=n.errors[w];if(x||(n.errors[w]=[]),x=n.errors[w],!s[w]){let y=c.message;try{y=this._evalTemplate(c.message)}catch{}x.push(y)}}}}catch(u){console.error("validation failed",c,u)}}for(let d=0;d<a.length;d++){const c=a[d];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let m=0;m<u.length;m++){const v=u[m];if(s.errors?[v].join(","):n.errors==""&&[v].join(",")){i=!0;break}}}(s.errors?["_component"].join(","):n.errors==""&&["_component"].join(","))&&(i=!0)}n._valid=r,n._valid!=s._valid&&(i=!0),i&&(this.data=n)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};t.fieldIds.forEach(r=>{a[r]=void 0}),a.searchText=void 0,this.state={...this.state,...a}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};a[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...a})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const a={...this.state};a[t.fieldId]=t.value,this.state=a,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const r=this.component;r.triggers?.filter(i=>i.type==vt.OnValueChange).filter(i=>!i.propertyName||t.fieldId==i.propertyName).forEach(i=>{(!i.condition||this._evalExpr(i.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))}),r.triggers?.filter(i=>i.type==vt.AutoSave).forEach(i=>{const s=i.actionId,n=this._autoSaveTimers.get(s);n!==void 0&&clearTimeout(n),this._autoSaveTimers.set(s,setTimeout(()=>{this._autoSaveTimers.delete(s),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))},i.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail;if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation();const a=this.component,r=a.actions?.find(i=>i.id==t.actionId||i.id.endsWith("*")&&t.actionId.startsWith(i.id.replace("*","")));if(r){if(r&&r.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(r&&r.validationRequired){const s=ya??this;if(ya=null,s.checkValidations(r.fieldsToValidate),!s.data._valid){s.notifyValidationErrors();return}}ya=null;const i={...t,initiatorComponentId:this.id};r&&r.confirmationRequired?this.callAfterConfirmation(r,()=>this.requestActionCallToServerOrBubble(i,a,r)):this.requestActionCallToServerOrBubble(i,a,r)}else{const i={...t.parameters};i.initiatorState||(i.initiatorState=this.state),ya||(ya=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,parameters:i},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=a=>{if(a)for(const r of a){const i=r.metadata;if(i?.type===h.FormField){const s=i;s.fieldId&&s.label&&(e[s.fieldId]=s.label)}t(r.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),a=[];if(Object.entries(e).forEach(([i,s])=>{if(!Array.isArray(s))return;const n=i==="_component"?void 0:t[i]??i;s.forEach(d=>{d&&!a.some(c=>c.label===n&&c.msg===d)&&a.push({label:n,msg:d})})}),a.length===0){this.notify("There are validation errors");return}const r=`There are validation errors
`+a.map(({label:i,msg:s})=>i?`• ${i}: ${s}`:`• ${s}`).join(`
`);Bt({text:r,variant:"error",position:"bottomEnd",duration:Math.max(3e3,1500+a.length*1e3)},this)},this.notify=e=>{Bt({text:e,variant:"error",position:"bottomEnd",duration:3e3},this)},this.callAfterConfirmation=(e,t)=>{let a="One moment, please",r="Are you sure?",i="Yes",s="No";e.confirmationTexts&&(a=e.confirmationTexts.title,r=e.confirmationTexts.message,i=e.confirmationTexts.confirmationText,s=e.confirmationTexts.denialText);const n=document.createElement("div");n.style.cssText="position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);padding:1rem;";const d=document.createElement("div");d.style.cssText="background:var(--lumo-base-color,#fff);color:var(--lumo-body-text-color,#1a1a1a);border-radius:var(--lumo-border-radius-l,12px);box-shadow:var(--lumo-box-shadow-xl,0 12px 40px rgba(0,0,0,.3));padding:1.2rem;max-width:min(90vw,26rem);";const c=()=>{n.parentElement&&document.body.removeChild(n)},u="font:inherit;font-weight:600;padding:.45rem 1rem;border-radius:var(--lumo-border-radius-m,6px);cursor:pointer;";zi(o`
            <h3 style="margin:0 0 .5rem;">${a}</h3>
            <div style="margin-bottom:1.2rem;">${r}</div>
            <div style="display:flex;justify-content:flex-end;gap:.5rem;">
                <button style="${u}border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.25));background:var(--lumo-base-color,#fff);"
                        @click="${()=>c()}">${s}</button>
                <button style="${u}border:none;background:var(--lumo-primary-color,#1676f3);color:var(--lumo-primary-contrast-color,#fff);"
                        @click="${()=>{c(),t()}}">${i}</button>
            </div>
        `,d),n.appendChild(d),n.addEventListener("click",m=>{m.target===n&&c()}),document.body.appendChild(n)},this.requestActionCallToServerOrBubble=(e,t,a)=>{if(a&&a.bubble){const r={...e.parameters};r.initiatorState||(r.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,parameters:r},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,a)},this.requestActionCallToServer=(e,t,a)=>{if(a&&a.href){window.location.href=a.href;return}if(a&&a.js)try{new Function("state","data","appState","appData","component",a.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(r){console.error("when evaluating "+a.js,r,this.component,this.state,this.data)}if(a&&a.customEvent&&this.dispatchEvent(new CustomEvent(a.customEvent.name,{detail:a.customEvent.detail,bubbles:!0,composed:!0})),!(a&&(a.js||a.customEvent))){if(e.actionId=="search"){const r=e.parameters?._searchState;r?this.state={...this.state,...r}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:a?.background,sse:a?.sse,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(r=>r.type==vt.OnSuccess).filter(r=>e.detail.actionId==r.calledActionId).forEach(r=>{if(!r.condition||this._evalExpr(r.condition))if(e.preventDefault(),e.stopPropagation(),r.timeoutMillis>0){const i=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,callbackToken:i},bubbles:!0,composed:!0}))},r.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(r=>r.type==vt.OnError).filter(r=>e.detail.actionId==r.calledActionId).forEach(r=>{(!r.condition||this._evalExpr(r.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId},bubbles:!0,composed:!0})))})},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const a of t.actions??[]){const r=a.shortcut||(a.runOnEnter?"enter":null);if(r&&this._shortcutMatchesEvent(r,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return B.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}_shortcutMatchesEvent(e,t){return Tn(e,t)}_collectShortcutTabs(){const e=this.renderRoot;if(!e)return[];const t=Array.from(e.querySelectorAll("vaadin-tab[data-shortcut]"));return e.querySelectorAll("mateu-drawer, mateu-dialog").forEach(a=>{const r=a.shadowRoot;r&&t.push(...Array.from(r.querySelectorAll("vaadin-tab[data-shortcut]")))}),t}_handleTabShortcut(e){const t=this._collectShortcutTabs();if(t.length===0)return!1;for(const a of Array.from(t)){const r=a.dataset.shortcut;if(!r||!this._shortcutMatchesEvent(r,e))continue;const i=a.closest("vaadin-tabs");if(!i)continue;const s=Array.from(i.querySelectorAll("vaadin-tab")).indexOf(a);if(!(s<0))return e.preventDefault(),i.selected=s,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),document.removeEventListener("keydown",this._keydownListener)}render(){return o`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?o`
                <div><ul>${this.data.errors._component.map(e=>o`<li>${e}</li>`)}</ul></div>
            `:l}</div>`}_render(){if(this.component?.type==W.ClientSide){const e=this.component;return e.metadata?.type==h.Page?Lr(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==h.Crud?Ar(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):B.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return o`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==W.ClientSide){const t=e;if(t.metadata?.type==h.Page)return Lr(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==h.Crud)return Ar(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return g(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};la.styles=$`
        :host {
        }

        ${ao(kt.cssText)}
        
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
  `;$r([p()],la.prototype,"baseUrl",2);$r([p()],la.prototype,"route",2);$r([p()],la.prototype,"consumedRoute",2);la=$r([k("mateu-component")],la);const vi=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}};class Cu{async handle(t,a){return await t.runAction(a.baseUrl,a.route,a.consumedRoute,a.actionId,a.initiatorComponentId,a.appState,a.serverSideType,a.componentState,a.parameters,a.initiator,a.background)}}const _u=new Cu;class Iu{constructor(){this.handleUIIncrement=(t,a,r)=>{if(t?.fragments?.forEach(i=>{Dt.next({command:void 0,fragment:i,ui:void 0,error:void 0,callbackToken:r})}),t?.appState&&(G.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const i=t?.appData;wa.value={...t.appData,...i},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(i=>{Bt({text:i.text,position:i.position,variant:i.variant,duration:i.duration,undoLabel:i.undoLabel,undoActionId:i.undoActionId,undoParameters:i.undoParameters},a)}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(i=>{Dt.next({command:i,fragment:void 0,ui:void 0,error:void 0,callbackToken:r})})}}async runAction(t,a,r,i,s,n,d,c,u,m,v,f,w,x,y){try{const S=await _u.handle(t,{baseUrl:a,route:r,consumedRoute:i,actionId:s,appState:G.value,initiatorComponentId:n,componentState:u,parameters:m,serverSideType:c,initiator:v,background:f});w&&w(S),x||this.handleUIIncrement(S,v,y),S.messages&&S.messages.length==1&&S.messages[0].variant=="error"&&v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:s},bubbles:!0,composed:!0})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:s,evevntId:xe()},bubbles:!0,composed:!0}))}catch(S){console.warn("Action request failed",S),v.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:s,reason:this.serialize(S)}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:s},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const Su=new Iu,Eu=Su;class Pu{constructor(){this.handleUIIncrement=(t,a,r)=>{if(t?.messages?.forEach(i=>{Bt({text:i.text,position:i.position,variant:i.variant,duration:i.duration,undoLabel:i.undoLabel,undoActionId:i.undoActionId,undoParameters:i.undoParameters},a)}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(i=>{Dt.next({command:i,fragment:void 0,ui:void 0,error:void 0,callbackToken:r})}),t?.fragments?.forEach(i=>{Dt.next({command:void 0,fragment:i,ui:void 0,error:void 0,callbackToken:r})}),t?.appState&&(G.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const i=t?.appData;wa.value={...t.appData,...i},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,a,r,i,s,n,d,c,u,m,v,f,w,x,y){if(r){r=r||"_no_route",r&&r.startsWith("/")&&(r=r.substring(1));const S={serverSideType:c,appState:G.value,componentState:u,parameters:m,initiatorComponentId:n,consumedRoute:i,route:"/"+r,actionId:s};f||v.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),fetch(a+"/mateu/v3/sse/"+r,{method:"POST",headers:{Accept:"text/event-stream","Content-Type":"application/json"},body:JSON.stringify(S)}).then(async H=>{const pe=H.body?.pipeThrough(new TextDecoderStream).getReader();if(pe){let F="";for(;;){const{value:ee,done:he}=await pe.read();if(he)break;F+=ee;const J=F.split(`

`);F=J.pop()??"";for(const te of J){const ae=te.trim();if(ae)if(ae.startsWith("data:")){const ge=JSON.parse(ae.substring(5).trim());w&&w(ge),x||this.handleUIIncrement(ge,v,y),ge.messages&&ge.messages.length==1&&ge.messages[0].variant=="error"&&v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:s},bubbles:!0,composed:!0}))}else{let ge=ae;try{const _=JSON.parse(ae);ge=_.message,_._embedded?.errors?.length>0&&_._embedded.errors[0].message&&(ge=_._embedded.errors[0].message)}catch{}throw new Error(ge)}}}}f||v.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:s}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:s},bubbles:!0,composed:!0}))}).catch(H=>{v.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:s,reason:this.serialize(H)}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:s},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}}const Es=new Pu,Tu={fixed:"fixed",fullWidth:"full",edgeToEdge:"edge"},zu=new Set([h.Gantt,h.PlanningBoard,h.Kanban,h.Bpmn,h.Workflow,h.Map]),Ou={landing:"fixed",form:"fixed",process:"fixed"},Ps=e=>e?Tu[e]:void 0,Wt=e=>e.type==W.ClientSide?e.metadata:void 0,Ts=e=>{const t=Wt(e);if(t?.type==h.Page){const a=Ps(t.pageWidth);if(a)return a}for(const a of e.children??[]){const r=Ts(a);if(r)return r}},zs=e=>{const t=e.pageType;if(t)return t;const a=r=>{const i=Wt(r);if(i?.type==h.Page&&i.pageType)return i.pageType;for(const s of r.children??[]){const n=a(s);if(n)return n}};return a(e)},Ru=e=>{const t=Wt(e);if(t?.type!=h.Crud)return!1;const a=t;return a.compact?!0:(a.columns??[]).some(r=>r.metadata?.editable)},dr=(e,t)=>t(e)||(e.children??[]).some(a=>dr(a,t)),Lu=e=>!!e&&dr(e,t=>Wt(t)?.type==h.HeroSection),Au=e=>Wt(e)?.type==h.App?!0:(e.children??[]).some(t=>Wt(t)?.type==h.App),Du=(e,t)=>{if(!e)return"fixed";const a=Ps(e.pageWidth)??Ts(e);if(a)return a;if(t?.top&&Au(e))return"edge";const r=Ou[zs(e)??""];return r||(dr(e,i=>{const s=Wt(i)?.type;return s!=null&&zu.has(s)})?"edge":dr(e,Ru)?"full":"fixed")};var Fu=Object.defineProperty,qu=Object.getOwnPropertyDescriptor,be=(e,t,a,r)=>{for(var i=r>1?void 0:r?qu(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Fu(t,a,i),i};let Z=class extends ur{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:W.ClientSide,metadata:{type:h.Element,name:"div",content:"Not found"},id:"fieldId"},action:ka.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let a=Eu;t.sse&&(a=Es),a.runAction(Jt,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken)}},this.getCustomisedAppState=()=>{let e={...G.value};if(this.overrides){const t=vi(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return B.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.overridesParsed=vi(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(a=>a==="appState"||a==="appData")){const a=this.renderRoot.querySelector("mateu-component");if(a)return e.has("appState")&&(a.appState=this.appState),e.has("appData")&&(a.appData=this.appData),!1}return!0}updated(e){(e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&(this.preventNavigation||(this.callbackToken=this.instant||xe(),this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,componentState:this.initialState,callbackToken:this.callbackToken},bubbles:!0,composed:!0})))),e.has("route")&&this.top&&(this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}this.fragment=e,e.component&&(this.dataset.pageWidth=Du(e.component,{top:this.top}),this.dataset.pageType=zs(e.component)??"",this.dataset.hasWelcomeBanner=String(Lu(e.component)))}render(){return o`
           ${this.fragment?.component?g(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):l}
       `}};Z.styles=$`
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
  `;be([p()],Z.prototype,"consumedRoute",2);be([p()],Z.prototype,"serverSideType",2);be([p()],Z.prototype,"uriPrefix",2);be([p()],Z.prototype,"overrides",2);be([p()],Z.prototype,"homeRoute",2);be([p()],Z.prototype,"route",2);be([p()],Z.prototype,"top",2);be([p()],Z.prototype,"instant",2);be([p()],Z.prototype,"initialState",2);be([p()],Z.prototype,"appState",2);be([p()],Z.prototype,"appData",2);be([b()],Z.prototype,"fragment",2);Z=be([k("mateu-ux")],Z);function Mu(e){const t="var(--lumo-space-m, 1rem)",a={left:"50%",transform:"translateX(-50%)"};switch(e){case"topStart":return{top:t,left:t};case"topCenter":return{top:t,...a};case"topEnd":return{top:t,right:t};case"topStretch":return{top:t,left:t,right:t};case"middle":return{top:"50%",left:"50%",transform:"translate(-50%, -50%)"};case"bottomStart":return{bottom:t,left:t};case"bottomCenter":return{bottom:t,...a};case"bottomStretch":return{bottom:t,left:t,right:t};default:return{bottom:t,right:t}}}function Nu(e){switch(e){case"success":return{bg:"var(--lumo-success-color, #2e7d32)",fg:"#fff"};case"error":return{bg:"var(--lumo-error-color, #c62828)",fg:"#fff"};case"warning":return{bg:"var(--lumo-warning-color, #f9a825)",fg:"#1a1a1a"};case"contrast":return{bg:"var(--lumo-contrast-90pct, #1a1a1a)",fg:"#fff"};default:return{bg:"var(--lumo-base-color, #fff)",fg:"var(--lumo-body-text-color, #1a1a1a)"}}}const Uu={show(e,t){const{bg:a,fg:r}=Nu(e.variant),i=Mu(e.position),s=document.createElement("div");s.setAttribute("role","status"),Object.assign(s.style,{position:"fixed",zIndex:"2000",display:"flex",alignItems:"center",gap:"0.75rem",maxWidth:"min(90vw, 28rem)",padding:"0.7rem 1rem",borderRadius:"var(--lumo-border-radius-m, 8px)",boxShadow:"var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,0.2))",background:a,color:r,font:"inherit",fontSize:"var(--lumo-font-size-s, 0.875rem)",opacity:"0",transition:"opacity 0.2s ease",...i});const n=document.createElement("span");n.textContent=e.text,s.appendChild(n);const d=()=>{s.style.opacity="0",setTimeout(()=>s.remove(),200)};if(e.undoActionId){const u=document.createElement("button");u.textContent=e.undoLabel??"Undo",u.style.cssText="margin-left: 0.25rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;",u.addEventListener("click",()=>{t.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0})),d()}),s.appendChild(u)}document.body.appendChild(s),requestAnimationFrame(()=>{s.style.opacity="1"});const c=e.duration??(e.undoActionId?1e4:5e3);c>0&&setTimeout(d,c)}};function ju(){ms(Uu)}var Bu=Object.defineProperty,Vu=Object.getOwnPropertyDescriptor,ct=(e,t,a,r)=>{for(var i=r>1?void 0:r?Vu(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Bu(t,a,i),i};ju();let De=class extends C{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,a=this.baseUrl??"";!t||t.startsWith("/")?a=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,a.indexOf("://")<0&&(a.startsWith("/")||(a="/"+a),a=window.location.origin+a)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),a.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let r=new URL(a+t);if((window.location.pathname||r.pathname)&&window.location.pathname!=r.pathname){let i=r.pathname;r.search&&(i+=r.search),i&&!i.startsWith("/")&&(i="/"+i),window.history.pushState({},"",i),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),Ft.markClean(),e instanceof CustomEvent){let t=e.detail.route;const a=this.renderRoot.querySelector("mateu-ux");a&&(a.setAttribute("route",t),a.setAttribute("instant",xe()))}}}createRenderRoot(){return B.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),Ft.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!Ft.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;this.loadUrl(t)},this.top=="true"?this.loadUrl(window):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);G.value={...G.value,...e}}catch{G.value={...G.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=xe(),this._lastUrl=e.location.href,e.location.search){const a=new URLSearchParams(e.location.search).get("overrides");if(a&&(this.config=a,this.config))try{const r=JSON.parse(this.config);G.value={...G.value,...r}}catch{G.value={...G.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,a=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(a)?t.substring(a.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return o`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${wa.value}"
                          .appState="${G.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?o`
               <mateu-debug-overlay
                   .appState="${G.value}"
                   .appData="${wa.value}"
               ></mateu-debug-overlay>
           `:l}
       `}};De.styles=$`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;ct([p()],De.prototype,"baseUrl",2);ct([p()],De.prototype,"route",2);ct([p()],De.prototype,"consumedRoute",2);ct([p()],De.prototype,"config",2);ct([p()],De.prototype,"top",2);ct([p()],De.prototype,"pathPrefix",2);ct([b()],De.prototype,"instant",2);ct([p({type:Boolean})],De.prototype,"debug",2);De=ct([k("mateu-ui")],De);var Hu=Object.defineProperty,Wu=Object.getOwnPropertyDescriptor,Zt=(e,t,a,r)=>{for(var i=r>1?void 0:r?Wu(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Hu(t,a,i),i};let Fe=class extends C{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.searchText=""}connectedCallback(){super.connectedCallback(),vo()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(Mr()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"—";const t=(this.searchedOptions??this.selector.options)?.find(r=>String(r.value)===e);if(t)return t.label;const a=Ai()[this.selector.fieldName];return a!==void 0?String(a):e}pick(e,t){mo(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText="",this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector("input.picker-search")?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){const e=this.app;if(e?.serverSideType)try{const t=await Jt.runAction(this.baseUrl??"",e.rootRoute??e.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(const a of t?.fragments??[]){const s=a.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(s)){this.searchedOptions=s.map(n=>({value:n.value,label:n.label??String(n.value)}));return}}}catch{}}visibleOptions(){const e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(a=>a.label.toLowerCase().includes(t)):e}renderPanel(){const e=this.currentValue(),t=this.visibleOptions(),a=this.searchText!==""||t.length>Fe.SEARCHABLE_THRESHOLD;return o`
            <div class="panel">
                ${a?o`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${r=>{r.key==="Escape"&&this.closePanel()}}"/>`:l}
                <div class="options">
                    ${e?o`
                        <div class="option option--clear" @click="${()=>this.pick("")}">— (clear)</div>`:l}
                    ${t.map(r=>o`
                        <div class="option ${e===String(r.value)?"option--selected":""}"
                             @click="${()=>this.pick(r.value,r.label)}">${r.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?o`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():l}
            </label>`:o``}};Fe.SEARCHABLE_THRESHOLD=7;Fe.styles=$`
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
    `;Zt([p()],Fe.prototype,"selector",2);Zt([p()],Fe.prototype,"app",2);Zt([p()],Fe.prototype,"baseUrl",2);Zt([b()],Fe.prototype,"opened",2);Zt([b()],Fe.prototype,"searchText",2);Zt([b()],Fe.prototype,"searchedOptions",2);Fe=Zt([k("mateu-app-context-picker")],Fe);var Gu=Object.defineProperty,Ku=Object.getOwnPropertyDescriptor,Ma=(e,t,a,r)=>{for(var i=r>1?void 0:r?Ku(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Gu(t,a,i),i};let Gt=class extends C{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){const a=this.app;if(a?.serverSideType)try{const r=await Jt.runAction(this.baseUrl??"",a.rootRoute??a.initialRoute??"","",e,"notification-bell",void 0,a.serverSideType,{},t,this,!0);for(const i of r?.fragments??[]){const n=i.data?._notifications;if(Array.isArray(n)){this.notifications=n;return}}}catch{}}refresh(){return this.runNotificationsAction("_notifications-list",{})}markRead(e){return this.runNotificationsAction("_notifications-read",{ids:e})}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);const t=e.route;if(t){if(!Ft.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return o`
            <div class="entry ${e.unread?"entry--unread":""}"
                 @click="${()=>this.entryClicked(e)}">
                <span class="unread-dot" aria-hidden="true"></span>
                <div class="entry-body">
                    <div class="entry-top">
                        <span class="entry-title">${e.title}</span>
                        ${e.when?o`<span class="entry-when">${e.when}</span>`:l}
                    </div>
                    ${e.text?o`<div class="entry-text">${e.text}</div>`:l}
                </div>
            </div>`}renderPanel(){return o`
            <div class="panel">
                <div class="entries">
                    ${this.notifications.length===0?o`
                        <div class="empty">No notifications</div>`:l}
                    ${this.notifications.map(e=>this.renderEntry(e))}
                </div>
                ${this.notifications.length>0?o`
                    <div class="footer">
                        <button class="mark-all" ?disabled="${this.unreadCount()===0}"
                                @click="${()=>this.markRead("all")}">Mark all read</button>
                    </div>`:l}
            </div>`}render(){const e=this.unreadCount();return o`
            <div class="root">
                <button class="bell-button" title="Notifications" aria-label="Notifications"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    <svg class="bell-icon" viewBox="0 0 24 24" aria-hidden="true"
                         fill="none" stroke="currentColor" stroke-width="1.8"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    ${e>0?o`<span class="badge">${e>99?"99+":e}</span>`:l}
                </button>
                ${this.opened?this.renderPanel():l}
            </div>`}};Gt.styles=$`
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
    `;Ma([p()],Gt.prototype,"app",2);Ma([p()],Gt.prototype,"baseUrl",2);Ma([b()],Gt.prototype,"opened",2);Ma([b()],Gt.prototype,"notifications",2);Gt=Ma([k("mateu-notification-bell")],Gt);const Os=e=>{if(!e||!("querySelectorAll"in e))return null;for(const t of e.querySelectorAll("*")){if(t.tagName?.toLowerCase()==="mateu-component")return t;const a=Os(t.shadowRoot);if(a)return a}return null},Yu=async(e,t,a)=>{const r=t.renderRoot??t,i=Os(r);await Es.runAction(Jt,t.baseUrl??"",e.rootRoute||"_no_route","",a,i?.id??"app-header-action",{},e.serverSideType??"",{},{},i??t,!0,void 0,!1,"")},fi=async(e,t,a)=>{try{await Yu(e,t,a)}catch(r){Bt({text:"La acción falló: "+r,position:"bottomStart",duration:6e3,variant:"error"},t)}},$a=(e,t)=>{const a=e.contextSelectors??[],r=e.contextActions??[];return a.length===0&&r.length===0&&!e.notificationsEnabled?l:o`${e.notificationsEnabled?o`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-notification-bell>`:l}${a.map(i=>o`
        <mateu-app-context-picker .selector="${i}" .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-app-context-picker>`)}${r.map(i=>(i.children?.length??0)>0?o`
        <details class="mateu-nav-group" style="margin-left: 0.5rem; flex-shrink: 0;">
            <summary class="app-header-action-btn">${i.label} ▾</summary>
            <div class="mateu-nav-panel" style="right: 0; left: auto;">
                ${i.children.map(s=>o`
                    <button class="mateu-nav-item" @click="${()=>s.actionId&&fi(e,t,s.actionId)}">${s.label}</button>`)}
            </div>
        </details>`:o`
        <button class="app-header-action-btn" style="margin-left: 0.5rem; flex-shrink: 0;"
            @click="${()=>i.actionId&&fi(e,t,i.actionId)}" title="${i.label}">${i.icon?U(i.icon):l}${i.label}</button>`)}`},bi=(e,t)=>o`
    <button class="mateu-nav-item ${e.selected?"mateu-nav-item--active":""}"
            ?disabled="${e.disabled}"
            @click="${()=>t(e)}">${e.text}</button>`,gi=(e,t,a="")=>o`
    <nav class="mateu-nav ${a}">
        ${e.map(r=>(r.children?.length??0)>0?o`<details class="mateu-nav-group">
                       <summary class="mateu-nav-item">${r.text} ▾</summary>
                       <div class="mateu-nav-panel">
                           ${r.children.map(i=>bi(i,t))}
                       </div>
                   </details>`:bi(r,t))}
    </nav>`,yi=(e,t)=>a=>t.call(e,{detail:{value:a}}),Va=(e,t)=>e.themeToggle?o`
        <button class="app-chrome-icon-btn" @click="${t.toggleTheme}"
            title="${t.isDark?"Switch to light mode":"Switch to dark mode"}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            ${U(t.isDark?"vaadin:sun-o":"vaadin:moon","color: var(--lumo-body-text-color);")}
        </button>
    `:l,Ju=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},$i=(e,t,a)=>{const r=rt(e,t,a),i=ie(t,a);return r=="list"||r==i?"new":r},rt=(e,t,a)=>{const r=e?._route;if(r!=null&&(r===""||r.startsWith("/"))){const i=a.homeRoute??"",s=i.indexOf("?"),n=s>=0?i.substring(s+1):"",d=ie(t,a)+r;if(!n)return d;const c=d.indexOf("?")>=0?"&":"?";return d+c+n}return t.selectedRoute?t.selectedRoute:a.homeRoute},ie=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,Be=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,Ve=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,He=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,Xu=(e,t,a,r,i,s,n)=>{if(t.chromeless)return o`
            <div class="app chromeless">
                <div class="${"app-content"+(e.pageCompact?" no-padding":"")}" style="height: 100%;">
                    <div class="m-md">
                        <div class="m-scroll" style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${rt(r,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${Be(e,t)}"
                                        consumedRoute="${ie(e,t)}"
                                        serverSideType="${Ve(e,t)}"
                                        uriPrefix="${He(e,t)}"
                                        style="width: 100%;"
                                        .appState="${s}"
                                        .appData="${n}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                        ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:s,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                    </div>
                </div>
                <slot></slot>
            </div>
        `;const d=e.mapItems(t.menu,e.filter?.toLowerCase()??""),c=ie(e,t),u=$i(r,e,t),m=u&&u!=="new"&&u.startsWith(c+"/")?u.substring(c.length+1).split("/")[0]:void 0;return o`
                    ${t.variant==it.MEDIATOR?o`

                        ${t.layout=="SPLIT"?o`
                            <div class="m-md">
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${ie(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Be(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Ve(e,t)}"
                                            uriPrefix="${He(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...s,_splitDetailId:m}}"
                                            .appData="${n}"
                                            instant="${c}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${$i(r,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${Be(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Ve(e,t)}"
                                            uriPrefix="${He(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>

                            </div>
                        `:o`
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${rt(r,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${Be(e,t)}"
                                        consumedRoute="${ie(e,t)}"
                                        serverSideType="${Ve(e,t)}"
                                        uriPrefix="${He(e,t)}"
                                        style="width: 100%;"
                                        .appState="${s}"
                                        .appData="${n}"
                                        .initialState="${r}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:l}
            ${t.variant==it.HAMBURGUER_MENU?o`
                <div class="mateu-app-layout m-app-layout ${t.drawerClosed?"":"drawer-open"} ${t?.cssClasses}" style="${t?.style}">
                    <header class="app-navbar">
                        <button class="drawer-toggle" title="Menu"
                                @click="${v=>v.currentTarget.closest(".m-app-layout")?.classList.toggle("drawer-open")}">
                            ${U("vaadin:menu")}
                        </button>
                        <h2 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; margin: 0 .5rem;">${t.title}</h2><p style="margin: 0;">${t.subtitle}</p>
                        <div class="m-hl" style="margin-left: auto; align-items: center;">
                            <slot name="widgets"></slot>
                            ${$a(t,e)}${Va(t,e)}
                        </div>
                    </header>
                    <div class="app-body">
                        <aside class="app-drawer p-s" @navigation-requested="${e.updateRoute}">
                            ${t.menu&&t.totalMenuOptions>10?o`
                                <div style="position: sticky; top: 0; z-index: 2; background: var(--lumo-base-color); padding: .25rem 0 .5rem;">
                                    <input class="drawer-search" placeholder="Search…" style="width: calc(100% - 20px); margin: 0 10px;"
                                           @input="${v=>Ju({detail:{value:v.target.value}},e)}">
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
                                                route="${rt(r,e,t)}"
                                                id="ux_${e.id}"
                                                baseUrl="${Be(e,t)}"
                                                consumedRoute="${ie(e,t)}"
                                                serverSideType="${Ve(e,t)}"
                                                uriPrefix="${He(e,t)}"
                                                style="width: 100%;"
                                                .appState="${s}"
                                                .appData="${n}"
                                                instant="${e.instant}"
                                                @navigation-requested="${e.updateRoute}"
                                        ></mateu-ux>
                                    </mateu-api-caller>
                                </div>
                                ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:s,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                            </div>
                        </div>
                    </div>
                </div>

            `:l}
            
            ${t.variant==it.MENU_ON_TOP?o`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <div class="m-hl" style="align-items: center;">
                            ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:l}
                            ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:l}
                        </div>
                        </a>
                        ${gi(d,yi(e,e.itemSelected),"menu-on-top")}
                        <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${$a(t,e)}${Va(t,e)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${rt(r,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Be(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Ve(e,t)}"
                                            uriPrefix="${He(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:s,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                    </div>
                </div>

            `:l}

            ${t.variant==it.TILES?o`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <div class="m-hl" style="align-items: center;">
                            ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:l}
                            ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:l}
                        </div>
                        </a>
                        ${gi(e.mapItemsForTiles(t.menu),yi(e,e.itemSelectedTiles),"menu-on-top")}
                        <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${$a(t,e)}${Va(t,e)}
                        </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):o`
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${rt(r,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Be(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Ve(e,t)}"
                                            uriPrefix="${He(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:s,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                        `}
                    </div>
                </div>
            `:l}

            ${t.variant==it.RAIL?o`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):l}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${rt(r,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Be(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Ve(e,t)}"
                                            uriPrefix="${He(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:s,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                    </div>
                </div>
            `:l}

            ${t.variant==it.MENU_ON_LEFT?o`

                <div class="m-hl">
                    <div class="m-scroll" style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <div class="m-vl"
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(v=>e.renderOptionOnLeftMenu(v))}
                            ${$a(t,e)}${Va(t,e)}
                        </div>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${rt(r,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Be(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Ve(e,t)}"
                                            uriPrefix="${He(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${s}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:s,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                    </div>
                </div>


            `:l}

            ${t.variant==it.TABS?o`
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
                                ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:l}
                                ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:l}
                            </div>
                            </a>
                            <nav class="mateu-tabs ${e.component?.cssClasses??""}" style="flex-grow: 1; min-width: 0;">
                                ${t.menu.map((v,f)=>o`
                                <button class="mateu-tab ${f===e.getSelectedIndex(t.menu)?"mateu-tab--active":""}"
                                        @click="${()=>e.selectRoute(v.consumedRoute,v.route,v.actionId,v.baseUrl,v.serverSideType,v.uriPrefix)}"
                                >${v.label}</button>`)}
                            </nav>
                            <div class="m-hl" style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${$a(t,e)}
                            </div>
                        </div>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${rt(r,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${Be(e,t)}"
                                            consumedRoute="${ie(e,t)}"
                                            serverSideType="${Ve(e,t)}"
                                            uriPrefix="${He(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${t.sseUrl?o`<mateu-chat slot="${e.chatOpen?"detail":"detail-hidden"}" sseurl="${t.sseUrl}" .mcpUrl="${t.mcpUrl}" .uploadUrl="${t.uploadUrl}" .menu="${t.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:s,appData:n,componentState:e.state,componentData:e.data})}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:l}
                        </div>
                    </div>
                </div>
            
            `:l}

            ${t.fabs?.map((v,f)=>o`
                <button class="app-fab" style="bottom: ${(t.sseUrl?5.5:1.5)+f*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(v.actionId)}"
                    title="${v.label}">
                    ${U(v.icon)}
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?o`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    ${U("vaadin:comments-o")}
                </button>
            `:l}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},Qu=(e,t)=>t!=null&&e!=null&&!e.has(t),Zu=typeof HTMLElement<"u"?HTMLElement:class{};class ep extends Zu{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",a=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
                ⚠ Component “${t}” is not supported by the “${a}” renderer yet.
            </div>
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",ep);const xi=new Set,tp=(e,t,a)=>{const r=`${a}/${t}`;return xi.has(r)||(xi.add(r),console.warn(`[mateu] Component type "${t}" is not supported by the "${a}" renderer — rendering <mateu-unsupported> placeholder.`)),o`<mateu-unsupported
            type="${t}"
            renderer="${a}"
            data-component-id="${e?.id??l}"
            slot="${e?.slot??l}"
    ></mateu-unsupported>`};class ap{renderFilterBar(t,a,r,i,s,n,d,c){const u=a?.metadata,m=f=>{const{fieldId:w,value:x}=f.detail;t.state={...t.state,[w]:x}},v=f=>{const{fieldIds:w}=f.detail,x={};w.forEach(y=>{x[y]=void 0}),x.searchText=void 0,t.state={...t.state,...x}};return o`
            <mateu-filter-bar
                .metadata="${u}"
                @search-requested="${t.search}"
                @value-changed="${m}"
                @filter-reset-requested="${v}"
                .state="${t.state}"
                .data="${s}"
                .appState="${n}"
                .appData="${d}"
                ?searchOnly="${c??!1}"
            >
                ${u?.header?.map(f=>g(t,f,r,i,s,n,d))}
            </mateu-filter-bar>
        `}renderPagination(t,a){return o`
        <mateu-pagination
                @page-changed="${t.pageChanged}"
                @fetch-more-elements="${t.fetchMoreElements}"
                .totalElements="${t.data[a?.id]?.page?.totalElements??0}"
                .pageSize="${t.data[a?.id]?.page?.pageSize??10}"
                data-testid="pagination"
                .pageNumber="${t.data[a?.id]?.page?.pageNumber??0}"
        ></mateu-pagination>
        `}renderTableComponent(t,a,r,i,s,n,d){const c=t.data?.[t.id]?.page?.content??[];return Rr(a,c,i[a?.id]?.emptyStateMessage)}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,a,r,i,s,n,d,c){const u=a?.metadata?.type??a?.type,m=Object.values(h).includes(u)?u:void 0;return Qu(this.supportedClientSideTypes(),m)?tp(a,m,this.rendererName()):Jr(t,a,r,i,s,n,d,c)}renderAppComponent(t,a,r,i,s,n,d){return Xu(t,a?.metadata,r,i,s,n,d)}}const rp=(e,t,a,r,i,s,n)=>{const d=t.metadata,c=u=>o`${g(e,u,a,r,i,s,n)}`;return o`
        <vaadin-virtual-list
                .items="${d.page.content}"
                ${Xs(c,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??l}"
        ></vaadin-virtual-list>
    `},ip=e=>{const t=e.metadata;return o`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??l}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${Qs(()=>o`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>${t.text}</div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
    `},sp=(e,t={})=>{const a=e.metadata,r=a.valueKey?t[a.valueKey]:a.value;return o`
        <div style="${e.style}">
        <vaadin-progress-bar
                ?indeterminate="${a.indeterminate}"
                min="${a.min&&a.min!=0?a.min:l}"
                max="${a.max&&a.max!=0?a.max:l}"
                value="${r??l}"
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??l}"
        ></vaadin-progress-bar>
        ${a.text?o`<span class="text-secondary text-xs" id="sublbl">
    ${a.text}
  </span>`:l}
        </div>
    `},op=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`
        <vaadin-details
                ?opened="${d.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??l}"
        >
            <vaadin-details-summary slot="summary">
            ${g(e,d.summary,a,r,i,s,n)}
            </vaadin-details-summary>
            ${g(e,d.content,a,r,i,s,n)}
        </vaadin-details>
            `},np=(e,t,a)=>{const r=e.metadata;return o`<vaadin-avatar
            img="${r.image}"
            name="${Oe(r.name,t,a)}"
            abbr="${r.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??l}"
    ></vaadin-avatar>`},lp=e=>{const t=e.metadata;return o`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??l}">
    </vaadin-avatar-group>`},dp=(e,t,a,r,i,s,n)=>{const d=t.metadata;if(!d)return o``;let c="";return d.variants?.map(u=>u=="stretchMedia"?"stretch-media":u=="coverMedia"?"cover-media":u).forEach(u=>c+=" "+u),c=c.trim(),o`
        <vaadin-card
                style="${t.style}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??l}"
        >
            ${d.media?Rt(e,d.media,a,r,i,s,n,"media",!1):l}
            ${d.title?Rt(e,d.title,a,r,i,s,n,"title",!1):l}
            ${d.subtitle?Rt(e,d.subtitle,a,r,i,s,n,"subtitle",!1):l}
            ${d.header?Rt(e,d.header,a,r,i,s,n,"header",!1):l}
            ${d.headerPrefix?Rt(e,d.headerPrefix,a,r,i,s,n,"header-prefix",!1):l}
            ${d.headerSuffix?Rt(e,d.headerSuffix,a,r,i,s,n,"header-suffix",!1):l}
            ${d.footer?Rt(e,d.footer,a,r,i,s,n,"footer",!1):l}
            ${d.content?g(e,d.content,a,r,i,s,n,!1):l}
        </vaadin-card>
    `},cp=640,up=e=>e>0&&e<cp?"accordion":"tabs";var pp=Object.defineProperty,hp=Object.getOwnPropertyDescriptor,xr=(e,t,a,r)=>{for(var i=r>1?void 0:r?hp(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&pp(t,a,i),i};let da=class extends C{constructor(){super(...arguments),this.tabLabels=[],this.mode="tabs",this.selected=0,this.selectedChangedListener=e=>{const t=e.detail?.value;typeof t=="number"&&t>=0&&(this.selected=t)}}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)this.mode=up(t.contentRect.width)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=void 0,this.detachTabsListener()}detachTabsListener(){this.slottedTabs?.removeEventListener("selected-changed",this.selectedChangedListener),this.slottedTabs=void 0}tabsSlotChanged(e){this.detachTabsListener();const a=e.target.assignedElements().find(r=>"selected"in r);a&&(this.slottedTabs=a,a.addEventListener("selected-changed",this.selectedChangedListener),a.selected=this.selected)}select(e){this.selected=e,this.slottedTabs&&(this.slottedTabs.selected=e)}updated(){this.slottedTabs&&this.slottedTabs.selected!=this.selected&&(this.slottedTabs.selected=this.selected)}render(){return o`
            <div class="strip" ?hidden="${this.mode!="tabs"}">
                <slot name="tabs" @slotchange="${this.tabsSlotChanged}"></slot>
            </div>
            ${this.mode=="tabs"?o`
                ${this.tabLabels.map((e,t)=>o`
                    <div class="panel" ?hidden="${t!=this.selected}">
                        <slot name="panel-${t}"></slot>
                    </div>
                `)}
            `:o`
                <div class="accordion" part="accordion">
                    ${this.tabLabels.map((e,t)=>o`
                        <div class="acc-item">
                            <button class="acc-header"
                                    aria-expanded="${t==this.selected}"
                                    aria-controls="acc-body-${t}"
                                    @click="${()=>this.select(t)}"
                            >
                                <span>${e??l}</span>
                                <span class="chevron">⟩</span>
                            </button>
                            <div class="acc-body" id="acc-body-${t}" ?hidden="${t!=this.selected}">
                                <slot name="panel-${t}"></slot>
                            </div>
                        </div>
                    `)}
                </div>
            `}
        `}};da.styles=$`
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
    `;xr([p({type:Array})],da.prototype,"tabLabels",2);xr([b()],da.prototype,"mode",2);xr([b()],da.prototype,"selected",2);da=xr([k("mateu-adaptive-tabs")],da);const mp=(e,t,a,r,i,s,n)=>{const d=t.metadata;let c=t.style;c==null&&(c=""),d.columnSpacing&&(c+="--vaadin-form-layout-column-spacing: "+d.columnSpacing+";");const u=d.itemRowSpacing&&d.itemRowSpacing!=="0"?d.itemRowSpacing:"var(--lumo-space-m)";return c+="--vaadin-form-layout-row-spacing: "+u+";",d.itemLabelSpacing&&(c+="--vaadin-form-layout-label-spacing: "+d.itemLabelSpacing+";"),d.labelsAside&&(c+="--vaadin-form-item-label-width: 10rem;"),d.fullWidth&&(c+="width: 100%;"),o`
               <vaadin-form-layout 
                       .responsiveSteps="${d.responsiveSteps||l}"  
                       style="${c||l}" 
                       class="${t.cssClasses}"
                       max-columns="${d.maxColumns&&d.maxColumns>0?d.maxColumns:l}"
                       auto-responsive="${d.autoResponsive||l}"
                       column-width="${d.columnWidth||l}"
                       expand-columns="${d.expandColumns||l}"
                       expand-fields="${(d.expandFields??!d.labelsAside)||l}"
                       labels-aside="${d.labelsAside||l}"
                       slot="${t.slot||l}"
               >
                   ${t.children?.map(m=>Rs(d,e,m,a,r,i,s,n))}
               </vaadin-form-layout>
            `},Rs=(e,t,a,r,i,s,n,d)=>a.type==W.ClientSide&&a.metadata?.type==h.FormRow?fp(e,t,a,r,i,s,n,d):e.labelsAside?vp(t,a,r,i,s,n,d):g(t,a,r,i,s,n,d),vp=(e,t,a,r,i,s,n)=>{if(t.type==W.ClientSide&&t.metadata?.type==h.FormField&&t.metadata.label){const d=t.metadata,c=d.label?.includes("${")?e._evalTemplate(d.label):d.label;return o`
                       <vaadin-form-item data-colspan="${d.colspan}">
                           <label slot="label">${c}</label>
                           ${g(e,t,a,r,i,s,n,!0)}
                       </vaadin-form-item>
                   `}return g(e,t,a,r,i,s,n)},fp=(e,t,a,r,i,s,n,d)=>o`
        <vaadin-form-row>
            ${a.children?.map(c=>Rs(e,t,c,r,i,s,n,d))}
        </vaadin-form-row>
            `,bp=(e,t,a,r,i,s,n)=>{const d=t.metadata,c=(d.padding?" padding":"")+(d.spacing?" spacing":"")+(d.spacingVariant?" spacing-"+d.spacingVariant:"")+(d.wrap?" wrap":"");let u=t.style;return d.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),d.justification&&(u=u?"justify-content: "+d.justification+";"+u:"justify-content: "+d.justification+";"),d.verticalAlignment&&(u=u?"align-items: "+d.verticalAlignment+";"+u:"align-items: "+d.verticalAlignment+";"),o`
               <vaadin-horizontal-layout 
                       style="${u}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??l}"
               >
                   ${t.children?.map(m=>g(e,m,a,r,i,s,n))}
               </vaadin-horizontal-layout>
            `},gp=(e,t,a,r,i,s,n)=>{const d=t.metadata,c=(d.padding?" padding":"")+(d.spacing?" spacing":"")+(d.spacingVariant?" spacing-"+d.spacingVariant:"")+(d.wrap?" wrap":"");let u=t.style;return d.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),d.justification&&(u=u?"justify-content: "+d.justification+";"+u:"justify-content: "+d.justification+";"),d.horizontalAlignment&&(u=u?"align-items: "+d.horizontalAlignment+";"+u:"align-items: "+d.horizontalAlignment+";"),o`
        <vaadin-vertical-layout
                style="${u}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??l}"
        >
            ${t.children?.map(m=>g(e,m,a,r,i,s,n))}
        </vaadin-vertical-layout>
    `},yp=(e,t,a,r,i,s,n)=>{const d=t.metadata;let c=t.style;return d.fullWidth&&(c=c?"width: 100%;"+c:"width: 100%;"),o`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${d.orientation??l}"
                       theme="${d.variant??l}"
                       slot="${t.slot??l}"
               >
                   <master-content>${g(e,t.children[0],a,r,i,s,n)}</master-content>
                   <detail-content>${g(e,t.children[1],a,r,i,s,n)}</detail-content>
               </vaadin-split-layout>
            `},$p=(e,t,a,r,i,s,n)=>{const d=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,u=!!i?.hasDetail||!!d,m=c??d;return o`
               <vaadin-master-detail-layout ?has-detail="${u}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??l}">
                   <div>${g(e,t.children[0],a,r,i,s,n)}</div>
                   ${u&&m?o`<div slot="detail">${g(e,m,a,r,i,s,n)}</div>`:o`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},xp=(e,t,a,r,i,s,n)=>{const d=t.metadata;let c=t.style;c==null&&(c=""),d.fullWidth&&(c+="width: 100%;");let u=d.variant;u=="equalWidth"&&(u="equal-width-tabs");const m=Math.max(0,(t.children??[]).findIndex(f=>f.metadata.active)),v=f=>{f.target.selected=m};if(d.adaptable){const f=(t.children??[]).map(w=>{const x=w.metadata.label;return x?.includes("${")?e._evalTemplate(x):x});return o`
            <mateu-adaptive-tabs
                    .tabLabels="${f}"
                    style="${c}"
                    class="${t.cssClasses}"
                    slot="${t.slot??l}"
            >
                <vaadin-tabs slot="tabs"
                             theme="${u??l}"
                             orientation="${d.orientation??l}"
                             @items-changed=${v}
                >
                    ${t.children?.map(w=>w).map((w,x)=>{const y=w.metadata.shortcut;return o`
                        <vaadin-tab id="${f[x]}"
                                    style="${w.style}"
                                    class="${w.cssClasses}"
                                    data-shortcut="${y??l}"
                        >${f[x]}</vaadin-tab>`})}
                </vaadin-tabs>

                ${t.children?.map((w,x)=>o`
                    <div slot="panel-${x}" style="padding: var(--lumo-space-m) 0;">
                        ${w.children?.map(y=>g(e,y,a,r,i,s,n))}
                    </div>`)}
            </mateu-adaptive-tabs>
                `}return o`
        <vaadin-tabsheet
                theme="${u??l}"
                style="${c}"
                slot="${t.slot??l}"
        >
            <vaadin-tabs slot="tabs"
                         style="${c}"
                         class="${t.cssClasses}"
                         orientation="${d.orientation??l}"
                         @items-changed=${v}
            >
                ${t.children?.map(f=>f).map(f=>{const w=f.metadata.label,x=w?.includes("${")?e._evalTemplate(w):w,y=f.metadata.shortcut;return o`
                    <vaadin-tab id="${x}"
                                style="${f.style}"
                                class="${f.cssClasses}"
                                data-shortcut="${y??l}"
                    >${x}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map(f=>wp(e,f,a,r,i,s,n))}
        </vaadin-tabsheet>
            `},wp=(e,t,a,r,i,s,n)=>{const d=t.metadata.label,c=d?.includes("${")?e._evalTemplate(d):d;return o`
        <div tab="${c}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(u=>g(e,u,a,r,i,s,n))}
               </div>
            `},kp=(e,t,a,r,i,s,n)=>{const d=t.metadata;t.style,d.fullWidth;let c=0;if(t.children){for(let u=0;u<t.children.length;u++)if(t.children[u].metadata?.active){c=u;break}}return o`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${c}"
                       slot="${t.slot??l}"
               >
                   ${t.children?.map(u=>Cp(e,u,a,r,i,s,n,d.variant))}
               </vaadin-accordion>
            `},Cp=(e,t,a,r,i,s,n,d)=>{const c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return o`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${d??l}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${u}</vaadin-accordion-heading>
            ${t.children?.map(m=>g(e,m,a,r,i,s,n))}
        </vaadin-accordion-panel>
            `},_p=(e,t,a,r,i,s,n)=>o`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??l}">
                   ${t.children?.map(d=>g(e,d,a,r,i,s,n))}
               </vaadin-scroller>
            `,Ip=(e,t,a,r,i,s,n)=>o`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??l}">
            ${t.children?.map(d=>g(e,d,a,r,i,s,n))}
        </vaadin-board>
            `,Sp=(e,t,a,r,i,s,n)=>o`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(d=>g(e,d,a,r,i,s,n))}
               </vaadin-board-row>
            `,Ep=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${d.boardCols??l}"
        >
                   ${t.children?.map(c=>g(e,c,a,r,i,s,n))}
               </div>
            `},Pp=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`
        <vaadin-context-menu .items=${Zr(e,d.menu,a,r,i,s,n)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${d.activateOnLeftClick?"click":l}"
                             slot="${t.slot??l}">
            ${g(e,d.wrapped,a,r,i,s,n)}
        </vaadin-context-menu>
            `},Tp=(e,t,a,r,i)=>{const s=t.metadata;return o`
        <vaadin-menu-bar .items=${Zr(e,s.options,a,r,i,G,wa)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??l}">
        </vaadin-menu-bar>
            `},wi=(e,t,a,r,i,s,n)=>{const d=document.createElement("vaadin-context-menu-item");return zi(g(e,t,a,r,i,s,n),d),d},Zr=(e,t,a,r,i,s,n)=>t.map(d=>d.submenus?{text:d.component?void 0:d.label,route:d.path,checked:d.selected,disabled:d.disabled,className:d.className,component:d.component?wi(e,d.component,a,r,i,s,n):void 0,children:Zr(e,d.submenus,a,r,i,s,n)}:d.separator?{component:"hr"}:{text:d.component?void 0:d.label,route:d.path,checked:d.selected,disabled:d.disabled,className:d.className,component:d.component?wi(e,d.component,a,r,i,s,n):void 0});var zp=Object.defineProperty,Op=Object.getOwnPropertyDescriptor,Na=(e,t,a,r)=>{for(var i=r>1?void 0:r?Op(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&zp(t,a,i),i};let Kt=class extends C{constructor(){super(...arguments),this.fieldId="",this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{const t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;const a=t.getContext("2d");a.lineWidth=2,a.lineCap="round",a.lineJoin="round",a.strokeStyle=getComputedStyle(this).getPropertyValue("--lumo-body-text-color")||"#1a1a1a";const[r,i]=this.pointerPosition(e);a.beginPath(),a.moveTo(r,i),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;const a=e.target.getContext("2d"),[r,i]=this.pointerPosition(e);a.lineTo(r,i),a.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector("canvas")}pointerPosition(e){const a=e.target.getBoundingClientRect();return[e.clientX-a.left,e.clientY-a.top]}ensureCanvasSize(e){const t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){const e=this.canvas();e&&e.getContext("2d").clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){const e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL("image/png")))}renderPad(){return o`
            <canvas class="pad"
                    @pointerdown="${this.startStroke}"
                    @pointermove="${this.stroke}"
                    @pointerup="${this.endStroke}"
                    @pointercancel="${this.endStroke}"></canvas>
            <div class="actions">
                <button class="button" @click="${this.clear}">Clear</button>
                <button class="button button--primary" ?disabled="${!this.hasStrokes}"
                        @click="${this.accept}">Accept</button>
                ${this.value?o`
                    <button class="button" @click="${()=>{this.signing=!1}}">Cancel</button>`:l}
            </div>`}render(){const e=this.value!=null&&this.value!=="";return this.signing||!e?this.renderPad():o`
            <img class="preview" src="${this.value}" alt="Signature"/>
            <div class="actions">
                <button class="button" @click="${()=>{this.signing=!0,this.hasStrokes=!1,this.updateComplete.then(()=>this.clear())}}">Sign again</button>
                <button class="button button--danger" @click="${()=>this.emit("")}">Delete</button>
            </div>`}};Kt.styles=$`
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
    `;Na([p()],Kt.prototype,"fieldId",2);Na([p()],Kt.prototype,"value",2);Na([b()],Kt.prototype,"signing",2);Na([b()],Kt.prototype,"hasStrokes",2);Kt=Na([k("mateu-signature-pad")],Kt);var Rp=Object.defineProperty,Lp=Object.getOwnPropertyDescriptor,ea=(e,t,a,r)=>{for(var i=r>1?void 0:r?Lp(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Rp(t,a,i),i};let nt=class extends C{constructor(){super(...arguments),this.fieldId="",this.options=[],this.leavesOnly=!1,this.opened=!1,this.expandedItems=[],this._normalized=[],this.dataProvider=(e,t)=>{const a=e.parentItem?e.parentItem.children??[]:this.normalized;t(a,a.length)}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get normalized(){return this._optsSource!==this.options&&(this._optsSource=this.options,this._normalized=this.normalizeOptions(this.options??[])),this._normalized}normalizeOptions(e){return e.map(t=>{const a=t.children&&t.children.length?this.normalizeOptions(t.children):void 0;return{...t,children:a}})}ancestorsOf(e,t){for(const a of t){if(String(a.value)===e)return[];const r=a.children?this.ancestorsOf(e,a.children):null;if(r!=null)return[a,...r]}return null}labelOf(e,t){for(const a of t){if(String(a.value)===e)return a.label;const r=a.children?this.labelOf(e,a.children):null;if(r!=null)return r}return null}open(){this.opened||(this.expandedItems=this.value!=null?this.ancestorsOf(String(this.value),this.normalized)??[]:[],this.opened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.close()},document.addEventListener("mousedown",this.outsideClick))}close(){this.detachOutsideClick(),this.opened=!1}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}pick(e){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e.value,fieldId:this.fieldId},bubbles:!0,composed:!0}))}clear(){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:this.fieldId},bubbles:!0,composed:!0}))}onActiveItemChanged(e){const t=e.detail.value;if(!t)return;if((t.children?.length??0)>0&&this.leavesOnly){this.expandedItems=this.expandedItems.includes(t)?this.expandedItems.filter(r=>r!==t):[...this.expandedItems,t],e.target.activeItem=null;return}this.pick(t)}render(){const e=this.value!=null&&this.value!==""?this.labelOf(String(this.value),this.normalized)??String(this.value):"";return o`
            <div class="root">
                <vaadin-button class="control" theme="tertiary"
                               @click="${()=>this.opened?this.close():this.open()}">
                    <span class="${e?"":"placeholder"}">${e||"—"}</span>
                    <span class="chevron" slot="suffix" aria-hidden="true">▾</span>
                </vaadin-button>
                ${this.opened?o`
                    <div class="panel">
                        ${this.value?o`
                            <div class="clear-row">
                                <vaadin-button theme="tertiary small" @click="${this.clear}">— Clear</vaadin-button>
                            </div>`:l}
                        <vaadin-grid
                                theme="compact no-border no-row-borders"
                                all-rows-visible
                                .dataProvider="${this.dataProvider}"
                                .itemHasChildrenPath="${"children"}"
                                .expandedItems="${this.expandedItems}"
                                @expanded-items-changed="${t=>{this.expandedItems=t.detail.value}}"
                                @active-item-changed="${this.onActiveItemChanged}">
                            <vaadin-grid-tree-column path="label"></vaadin-grid-tree-column>
                        </vaadin-grid>
                    </div>`:l}
            </div>`}};nt.styles=$`
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
    `;ea([p()],nt.prototype,"fieldId",2);ea([p()],nt.prototype,"value",2);ea([p()],nt.prototype,"options",2);ea([p({type:Boolean})],nt.prototype,"leavesOnly",2);ea([b()],nt.prototype,"opened",2);ea([b()],nt.prototype,"expandedItems",2);nt=ea([k("mateu-vaadin-tree-select")],nt);var Ap=Object.defineProperty,Dp=Object.getOwnPropertyDescriptor,Ua=(e,t,a,r)=>{for(var i=r>1?void 0:r?Dp(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Ap(t,a,i),i};let Yt=class extends C{constructor(){super(...arguments),this.fieldId="",this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const r=new FileReader;r.onload=()=>this.emit(r.result),r.readAsDataURL(a),t.value=""}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:!1}),this.cameraOpen=!0,await this.updateComplete;const e=this.renderRoot.querySelector("video");e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){const e=this.renderRoot.querySelector("video");if(!e||e.videoWidth===0)return;const t=document.createElement("canvas");t.width=e.videoWidth,t.height=e.videoHeight,t.getContext("2d").drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL("image/jpeg",.9))}triggerFallback(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="";return o`
            <input type="file" accept="image/*" capture="environment" style="display: none;"
                   @change="${this.fileFallback}">
            ${this.cameraOpen?o`
                <video class="viewfinder" playsinline muted></video>
                <div class="actions">
                    <button class="button button--primary" @click="${this.shoot}">Capture</button>
                    <button class="button" @click="${this.closeCamera}">Cancel</button>
                </div>
            `:o`
                ${e?o`<img class="preview" src="${this.value}" alt="Photo"/>`:o`<div class="placeholder" aria-hidden="true">📷</div>`}
                <div class="actions">
                    <button class="button button--primary" @click="${this.openCamera}">
                        ${e?"Retake":"Take photo"}
                    </button>
                    ${this.cameraError?o`
                        <button class="button" @click="${this.triggerFallback}">Use file / native camera</button>`:l}
                    ${e?o`
                        <button class="button button--danger" @click="${()=>this.emit("")}">Delete</button>`:l}
                </div>
                ${this.cameraError?o`
                    <div class="error-hint">Camera unavailable — the file picker opens the device camera on phones.</div>`:l}
            `}`}};Yt.styles=$`
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
    `;Ua([p()],Yt.prototype,"fieldId",2);Ua([p()],Yt.prototype,"value",2);Ua([b()],Yt.prototype,"cameraOpen",2);Ua([b()],Yt.prototype,"cameraError",2);Yt=Ua([k("mateu-camera-capture")],Yt);var Fp=Object.defineProperty,qp=Object.getOwnPropertyDescriptor,ja=(e,t,a,r)=>{for(var i=r>1?void 0:r?qp(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Fp(t,a,i),i};const Mp=(e,t)=>{if(!e)return;if(Array.isArray(e)){const r=e.find(i=>i.key==t);return r?.value!=null?String(r.value):void 0}const a=e[t];return a!=null?String(a):void 0};let xt=class extends C{constructor(){super(...arguments),this.fieldId="",this.editable=!0,this.filePicked=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const r=new FileReader;r.onload=()=>{const i=r.result,s=i.indexOf(","),n=i.substring(0,s).replace(";base64",`;name=${encodeURIComponent(a.name)};base64`);this.emit(n+i.substring(s))},r.readAsDataURL(a),t.value=""}}static fileName(e){if(!e)return"";if(e.startsWith("data:")){const t=e.indexOf(","),r=e.substring(5,t<0?e.length:t).split(";").find(i=>i.startsWith("name="));if(r)try{return decodeURIComponent(r.substring(5))}catch{return r.substring(5)}return"Attached file"}return e.split("/").pop()||e}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}triggerPick(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="",t=xt.fileName(this.value),a=e&&this.value.startsWith("data:"),r=e?o`<span class="file" title="${t}">📄 ${a?o`<a href="${this.value}" download="${t}">${t}</a>`:o`<a href="${this.value}" target="_blank">${t}</a>`}</span>`:l;return this.editable?o`
            <input type="file" accept="${this.accept||l}" style="display: none;"
                   @change="${this.filePicked}">
            <div class="row">
                ${r}
                <button class="button" @click="${this.triggerPick}">
                    ${e?"Replace":"Choose file"}
                </button>
                ${e?o`
                    <button class="button button--danger" @click="${()=>this.emit("")}">Remove</button>`:l}
            </div>`:o`${e?r:o`<span class="empty">—</span>`}`}};xt.styles=$`
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
    `;ja([p()],xt.prototype,"fieldId",2);ja([p()],xt.prototype,"value",2);ja([p()],xt.prototype,"accept",2);ja([p({type:Boolean})],xt.prototype,"editable",2);xt=ja([k("mateu-file-upload")],xt);const Ha=e=>!!e&&typeof e=="object"&&"__mateuGroup"in e,Sr=e=>String(e??""),Np=(e,t,a)=>{const r=e??[];if(!t||!a||a.length===0)return r;const i=[];let s,n=!1;return r.forEach((d,c)=>{const u=Sr(d?.[t]);if(!n||u!==s){const m=a.find(v=>Sr(v.value)===u)??{value:u,count:r.filter(v=>Sr(v?.[t])===u).length,aggregates:{}};i.push({__mateuGroup:m,__mateuGroupBy:t,_rowNumber:`__mateuGroup:${c}:${u}`}),n=!0,s=u}i.push(d)}),i},Ls=(e,t)=>e==null?"":t.dataType==="money"||t.stereotype==="money"?new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(e):t.aggregate==="count"?new Intl.NumberFormat(void 0,{maximumFractionDigits:0}).format(Math.round(e)):new Intl.NumberFormat(void 0,{maximumFractionDigits:2}).format(e),Up=(e,t)=>e&&t.includes(e)?e:t.find(a=>!!a),jp=(e,t,a)=>{const r=e.__mateuGroup;return t.id===a?`${r.value} (${r.count})`:t.aggregate?Ls(r.aggregates?.[t.id],t):""},Bp=(e,t,a)=>{const r=t?.aggregates;if(!r||!e.some(n=>n.aggregate))return;const i={};e.forEach(n=>{n.aggregate&&r[n.id]!=null&&(i[n.id]=Ls(r[n.id],n))});const s=e[0];if(s&&i[s.id]===void 0){const n=t?.page?.totalElements;i[s.id]=a&&s.id===a&&n!=null?`Total (${n})`:"Total"}return i},Vp=(e,t,a)=>{const i=e[a.path]?"vaadin:check":"vaadin:minus";return U(i,"height: 16px; width: 16px; color: var(--lumo-body-text-color);")},Hp=(e,t,a,r,i)=>{const s=e[a.path];let n=s;return r=="money"&&s&&s.locale&&s.currency?n=new Intl.NumberFormat(s.locale,{style:"currency",currency:s.currency}).format(s.value):i=="money"&&(n=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(s)),o`${n}`},ki=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},Wp=(e,t,a,r,i,s)=>{const n=a.xcolumn??s;if(n.text){if(n.actionId)return o`<a href="javascript: void(0);" @click="${u=>ki(a,n,e)}">${n.text}</a>`;const c=e[a.path];return o`<a href="${c}">${n.text}</a>`}if(r=="string"){if(n.actionId){const u=e[a.path];return o`<a href="javascript: void(0);" @click="${m=>ki(a,n,e)}">${u}</a>`}const c=e[a.path];return o`<a href="${c}">${c}</a>`}const d=e[a.path];return o`<a href="${d.href}">${d.text}</a>`},Gp=(e,t,a,r,i)=>{const s=e[a.path];return r=="string"?s.split(",").map(n=>U(n,"width: 16px;")):s.split(",").map(n=>U(n.icon,"width: 16px;"))},Kp=(e,t,a,r,i)=>{const s=e[a.path];return o`${ye(s)}`},Yp=(e,t,a,r,i,s)=>{if(r=="string"){const d=e[a.path],c="max-height: 40px; "+(s.style??"");return o`<img src="${d}" style="${c}">`}const n=e[a.path];return o`<img src="${n.src}" style="${s.style??""}">`},Jp=e=>{const t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Ci=e=>{const t={_clickedRow:e.target.row},a=e.target.action;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+a.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Xp=e=>{const t=document.createElement("vaadin-context-menu-item"),a=document.createElement("vaadin-icon");return a.style.color="var(--lumo-secondary-text-color)",a.style.marginInlineEnd="var(--lumo-space-s)",a.style.padding="var(--lumo-space-xs)",a.setAttribute("icon",e.icon),t.appendChild(a),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},_i=(e,t,a)=>{const r=e[a.path]?.actions?.map(i=>i.icon?{component:Xp(i),methodNameInCrud:i.methodNameInCrud}:{...i,text:i.label});return!r||r.length==0?o``:o`
                                     <vaadin-menu-bar
                                         .items=${[{text:"···",children:r}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${a.path}"
                                         @item-selected="${Jp}"
                                     ></vaadin-menu-bar>
                                   `},Qp=(e,t,a)=>{if(a.path=="select"){const s={actionId:a.path,icon:"",label:"Select",disabled:!1,methodNameInCrud:"select"};return o`
         <vaadin-button theme="tertiary" title="Select" @click="${Ci}" .row="${e}" .action="${s}">
             Select
         </vaadin-button>
    `}const r=a.path&&e[a.path]?.methodNameInCrud?e[a.path]:e.action;if(!r)return o``;const i=r.icon&&!r.label;return o`
         <vaadin-button theme="tertiary${i?" icon":""}" title="${r.label||l}" @click="${Ci}" .row="${e}" .action="${r}">
             ${r.icon?o`<vaadin-icon icon="${r.icon}"></vaadin-icon>`:l}
             ${r.label?r.label:l}
         </vaadin-button>
    `},Zp=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},eh=(e,t,a,r,i,s)=>{const n=a.xcolumn??s;if(n.actionId){const c=n.text||e[a.path];return o`
            <vaadin-button theme="tertiary" @click="${u=>Zp(a,n,e)}" .row="${e}">
                ${c}
            </vaadin-button>
        `}const d=e[a.path];return o`<a href="${d}">${n.text||d}</a>`},th=(e,t,a,r,i,s,n,d,c)=>{const u=e[a.path];return g(r,u,i,s,n,d,c)},Fr=new WeakMap,ah=(e,t)=>Fr.get(e)?.[t],rh=(e,t,a)=>{let r=Fr.get(e);r||(r={},Fr.set(e,r)),r[t]=a},Ii=e=>{if(e==null||e==="")return null;const t=Number(e);return Number.isNaN(t)?null:t},ih=(e,t,a,r)=>{const i=a?.field?.fieldId,s=c=>{if(e[t.id]===c||e[t.id]==null&&(c===""||c==null))return;if(e[t.id]=c,!i){a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"update-row",parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}const m=(a?.state??r)[i];a.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:i,value:Array.isArray(m)?[...m]:m},bubbles:!0,composed:!0}))},n=e[t.id],d=n==null?"":String(n);switch(t.editorType){case"boolean":return o`<vaadin-checkbox ?checked=${!!n} @checked-changed=${c=>s(c.detail.value)}></vaadin-checkbox>`;case"integer":return o`<vaadin-integer-field theme="small" style="width:100%;" .value=${d} @change=${c=>s(Ii(c.target.value))}></vaadin-integer-field>`;case"number":return o`<vaadin-number-field theme="small" style="width:100%;" .value=${d} @change=${c=>s(Ii(c.target.value))}></vaadin-number-field>`;case"date":return o`<vaadin-date-picker theme="small" style="width:100%;" .value=${d} @value-changed=${c=>s(c.detail.value)}></vaadin-date-picker>`;case"time":return o`<vaadin-time-picker theme="small" style="width:100%;" .value=${d} @value-changed=${c=>s(c.detail.value)}></vaadin-time-picker>`;case"datetime":return o`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${d} @value-changed=${c=>s(c.detail.value)}></vaadin-date-time-picker>`;case"select":return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(c=>({label:c.label,value:String(c.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${d}
                @value-changed=${c=>s(c.detail.value)}></vaadin-combo-box>`;case"lookup":{const c=a?.field?.fieldId,u=`search-${c}-${t.id}`,m=`${c}-${t.id}`,f=(t.editorOptions??[]).find(x=>String(x.value)===d)??(d?{value:d,label:ah(e,t.id)??d}:void 0);return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${(x,y)=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:u,parameters:{searchText:x.filter,size:x.pageSize,page:x.page},callback:S=>{const H=S?.fragments?.[0]?.data?.[m];y(H?.content??[],H?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${f}
                @selected-item-changed=${x=>{const y=x.detail.value,S=y?y.value:null;String(S??"")!==d&&(y&&rh(e,t.id,y.label),s(S))}}></vaadin-combo-box>`}default:return o`<vaadin-text-field theme="small" style="width:100%;" .value=${d} @change=${c=>s(c.target.value)}></vaadin-text-field>`}},Er=e=>Zs(()=>o`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),Pr=e=>e!==void 0?eo(()=>o`<span style="font-weight: 600; white-space: nowrap;">${e}</span>`,[e]):l,sh=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent("sort-direction-changed",{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},oh=(e,t,a,r,i,s,n,d)=>{const c=$e(e.label,r,i);return o`
<vaadin-grid-column-group header="${c}">
    ${e.columns.map(u=>As(u.metadata,t,a,r,i,s,n,d?.[u.metadata?.id]))}
</vaadin-grid-column-group>
`},ei=(e,t,a,r,i,s,n,d)=>h.GridGroupColumn==e.metadata?.type?oh(e.metadata,t,a,r,i,s,n,d):As(e.metadata,t,a,r,i,s,n,d?.[e.metadata?.id]),As=(e,t,a,r,i,s,n,d)=>{const c=$e(e.label,r,i);return e.sortable?o`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??l}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??l}"
                                ?resizable="${e.resizable}"
                                width="${e.width??l}"
                                @direction-changed="${sh}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${Er(c)}
                                ${Pr(d)}
                                ${At((u,m,v)=>Wa(u,m,v,e,t,a,r,i,s,n),[])}
                        ></vaadin-grid-sort-column>
                    `:e.filterable?o`
                        <vaadin-grid-filter-column
                                path="${e.id}"
                                text-align="${e.align??l}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??l}"
                                ?resizable="${e.resizable}"
                                width="${e.width??l}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${Er(c)}
                                ${Pr(d)}
                                ${At((u,m,v)=>Wa(u,m,v,e,t,a,r,i,s,n),[])}
                        ></vaadin-grid-filter-column>
                    `:o`
                        <vaadin-grid-column
                                path="${e.id}"
                                text-align="${e.align??l}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??l}"
                                ?resizable="${e.resizable}"
                                width="${e.width??l}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                .xcolumn="${e}"
                                ${Er(c)}
                                ${Pr(d)}
                                ${At((u,m,v)=>Wa(u,m,v,e,t,a,r,i,s,n),[])}
                        ></vaadin-grid-column>
                    `},Wa=(e,t,a,r,i,s,n,d,c,u)=>{const m=a.dataset.dataType??"",v=a.dataset.stereotype??"";if(Ha(e)){const w=i?.metadata,x=(w?.columns??[]).flatMap(F=>F?.metadata?.type===h.GridGroupColumn?(F.metadata.columns??[]).map(ee=>ee?.metadata?.id):[F?.metadata?.id]),y=Up(e.__mateuGroupBy,x),S=jp(e,r,y),H=e.__mateuGroup.hiddenActions??[],pe=r.id===x[x.length-1]?(w?.groupActions??[]).filter(F=>!H.includes(F.actionId??F.id)):[];return pe.length?o`<span style="display: flex; align-items: center; justify-content: flex-end; gap: var(--lumo-space-s); overflow: hidden;">
                ${S?o`<span style="font-weight: 600;">${S}</span>`:l}
                ${pe.map(F=>o`
                    <vaadin-button theme="tertiary small" style="flex-shrink: 0;"
                        @click="${ee=>{ee.stopPropagation(),ee.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+(F.actionId??F.id),parameters:{_groupValue:e.__mateuGroup.value}},bubbles:!0,composed:!0}))}}">${F.label??F.caption??""}</vaadin-button>
                `)}
            </span>`:o`<span title="${S}" style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${S}</span>`}if(r.editable)return ih(e,r,i,n);if(m=="status")return $c(e,t,a);if(m=="bool")return Vp(e,t,a);if(m=="money"||v=="money")return Hp(e,t,a,m,v);if(m=="link"||v=="link")return Wp(e,t,a,m,v,r);if(m=="icon"||v=="icon")return Gp(e,t,a,m);if(v=="html")return Kp(e,t,a);if(v=="image")return Yp(e,t,a,m,v,r);if(m=="menu")return _i(e,t,a);if(m=="component")return th(e,t,a,i,s,n,d,c,u);if(m=="action")return Qp(e,t,a);if(m=="actionGroup")return _i(e,t,a);if(v=="button"||r.actionId)return eh(e,t,a,m,v,r);const f=e[a.path];return o`<span title="${f}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${f}</span>`};var nh=Object.defineProperty,lh=Object.getOwnPropertyDescriptor,Tt=(e,t,a,r)=>{for(var i=r>1?void 0:r?lh(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&nh(t,a,i),i};const dh=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},ch=(e,t)=>{let a=t;for(;a;){if(a===e)return!0;a=a.assignedSlot??a.parentNode??a.host??null}return!1};let Xe=class extends pr{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{const t=e.currentTarget,a=t.getEventContext(e)?.item??null;a!==this.hoveredItem&&(this.hoveredItem=a,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?"hovered-cell":"",this._onRowKey=e=>{const t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!Ji(t,e))return;const a=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!a)return;const r=this.currentItems(),i=parseInt(a[1],10)-1;i>=r.length||(e.preventDefault(),this.selectRow(r[i]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+"_selected_items"]=[e],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;const e=dh();if(e&&e!==document.body&&!ch(this,e)){const t=e.tagName?.toLowerCase()??"";if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith("vaadin-")&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){const{item:t,selected:a,shiftKey:r}=e.detail;if(this.rangeStartItem??=t,r){let i=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(i=this.state[this.field.fieldId]);const[s,n]=[this.rangeStartItem,t].map(u=>i.indexOf(u)).sort((u,m)=>u-m),d=i.slice(s,n+1),c=new Set(this.selectedItems);d.forEach(u=>{a?c.add(u):c.delete(u)}),this.selectedItems=[...c],this.state[this.id+"_selected_items"]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);const t=this.state[this.field?.fieldId+"_show_detail"]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates,r="";this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((a,r)=>{a&&typeof a=="object"&&a._rowNumber===void 0&&(a._rowNumber=r)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith("modal")){const a=this;return o`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.field?.fieldId+"_cancel"},bubbles:!0,composed:!0}))}}"
                        ${Ei(()=>o`
                            <mateu-event-interceptor .target="${a}">
                                <div id="container" style="${this.field?.formStyle??"display: contents;"}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>xe()])}
                ></vaadin-dialog>
                
            `}else{const a=this.field?.formPosition=="left"||this.field?.formPosition=="right"?"horizontal":"vertical";return o`
            <vaadin-master-detail-layout
                    style="overflow: unset; width: 100%; ${t&&this.field?.minHeightWhenDetailVisible?"min-height: "+this.field?.minHeightWhenDetailVisible+";":""}"
                    orientation="${a}"
                    .forceOverlay="${!0}"
            >
                ${this.renderMaster(e)}
                <div slot="${t?"detail":"detail-hidden"}" style="${this.field?.formStyle??"display: contents;"}">
                    <div id="container" style="padding-left: 2rem; padding-right: 2rem; padding-bottom: 2rem; background-color: var(--lumo-base-color);">
                        <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                    </div>
                </div>
                
                
            </vaadin-master-detail-layout>`}}renderMaster(e){const t=this.selectedItems||[];return o`<vaadin-vertical-layout style="width: 100%;">
            <!-- The field label is rendered by the surrounding mateu-field wrapper; rendering it
                 here too would duplicate it (e.g. "Guests / Guests"). -->
            <vaadin-grid
                    ?clickable="${!!this.field?.onItemSelectionActionId}"
                    .cellPartNameGenerator="${E(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${E(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${E(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?"cursor: pointer;":""}${this.field?.style??""}"
                    class="${this.field?.cssClasses}"
                    .items="${e}"
                    .selectedItems="${t}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${a=>{this.selectedItems=a.detail.value,this.state[this.id+"_selected_items"]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${E(this.field?.onItemSelectionActionId?a=>{const i=a.currentTarget.getEventContext(a)?.item;i&&this.selectRow(i)}:void 0)}"
                    @active-item-changed="${E(this.field?.detailPath&&!this.field?.useButtonForDetail?a=>{if(this.field?.detailPath){const r=a.detail.value;r?this.detailsOpenedItems=[r]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${E(this.field?.detailPath?Pi(a=>o`${g(this,a[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${e?.length<10}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:"No items added yet."}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?l:o`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(a=>ei(a,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?o`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${At(a=>o`
                                <vaadin-button theme="tertiary icon error" title="Remove row"
                                    @click="${()=>{this.state[this.id+"_selected_items"]=[a],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_remove"},bubbles:!0,composed:!0}))}}">
                                    <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                </vaadin-button>`,[])}
                    ></vaadin-grid-column>
                `:l}

                ${this.field?.useButtonForDetail?o`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${At((a,{detailsOpened:r})=>o`
              <vaadin-button
                theme="tertiary icon"
                title="${r?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${r?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=this.detailsOpenedItems.length?this.detailsOpenedItems[0]._rowNumber==a._rowNumber?[]:[a]:[a]}}"
              >
                <vaadin-icon
                  .icon="${r?"lumo:angle-down":"lumo:angle-right"}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:l}

            </vaadin-grid>
            ${this.field?.readOnly?l:this.field?.inlineEditing?o`
                    <vaadin-horizontal-layout theme="spacing">
                        <!-- Inline mode: rows are removed with the per-row trash button, so the
                             toolbar only needs the "add" action. -->
                        <vaadin-button theme="tertiary icon" title="Add row" @click="${()=>this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_add"},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:plus"></vaadin-icon></vaadin-button>
                    </vaadin-horizontal-layout>
                `:o`
                    <vaadin-horizontal-layout theme="spacing">
                        <vaadin-button theme="tertiary icon" @click="${()=>this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_add"},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:plus"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon error" @click="${()=>this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_remove"},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:minus"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon" title="Move up" @click="${()=>this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_move-up"},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:arrow-up"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon" title="Move down" @click="${()=>this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_move-down"},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:arrow-down"></vaadin-icon></vaadin-button>
                    </vaadin-horizontal-layout>
                `}
        </vaadin-vertical-layout>`}};Xe.styles=$`
        ${kt}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `;Tt([p()],Xe.prototype,"field",2);Tt([p()],Xe.prototype,"state",2);Tt([p()],Xe.prototype,"data",2);Tt([p()],Xe.prototype,"appState",2);Tt([p()],Xe.prototype,"appData",2);Tt([p()],Xe.prototype,"selectedItems",2);Tt([b()],Xe.prototype,"detailsOpenedItems",2);Xe=Tt([k("mateu-grid")],Xe);var uh=Object.defineProperty,ph=Object.getOwnPropertyDescriptor,ga=(e,t,a,r)=>{for(var i=r>1?void 0:r?ph(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&uh(t,a,i),i};let wt=class extends C{constructor(){super(...arguments),this.getNewValue=e=>{if(this.field?.dataType=="array"){if(!this.value)return[e];const t=this.value;return t.indexOf(e)>=0?t.filter(a=>a!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:"",fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}const t=this.field?.attributes?.divStyle;return o`
        <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; ${t}">
                                    ${e?.map(a=>o`
                            <div 
                                    class="choice ${this.value==a.value||Array.isArray(this.value)&&this.value.includes(a.value)?"selected":""}"
                                    @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.getNewValue(a.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}"
                            >${a.description||a.image?o`
                                <div style="display: flex; align-items: center; gap: var(--lumo-space-m, 1rem);">
                                    ${a.image?o`
                                            <img src="${a.image}" alt="${a.label}" style="${a.imageStyle??"width: 2rem;"}" />
                                        `:l}
                                    <div style="display: flex; flex-direction: column;">
                                        <span> ${a.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${a.description}
            </span>
                                    </div>
                                </div>
                            `:a.label}</div>
                        `)}
                                </div>

       `}};wt.styles=$`
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
  `;ga([p()],wt.prototype,"field",2);ga([p()],wt.prototype,"baseUrl",2);ga([p()],wt.prototype,"state",2);ga([p()],wt.prototype,"data",2);ga([p()],wt.prototype,"value",2);wt=ga([k("mateu-choice")],wt);var hh=Object.defineProperty,mh=Object.getOwnPropertyDescriptor,tt=(e,t,a,r)=>{for(var i=r>1?void 0:r?mh(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&hh(t,a,i),i};let _e=class extends C{constructor(){super(...arguments),this.currencyChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),this.value.currency=e.detail.value,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}}))},this.valueChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),e.detail.value&&(this.value.value=e.detail.value?parseFloat(e.detail.value):0,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}})))}}render(){return o`
            <vaadin-number-field
                    id="${this.fieldId}"
                    label="${this.label}"
                    @value-changed="${this.valueChanged}"
                    .value="${this.value?.value}"
                    .helperText="${this.helperText}"
                    ?autofocus="${this.autofocus}"
                    ?required="${this.required||l}"
                    theme="align-right"
            ><div slot="prefix"><vaadin-select
                    item-label-path="label"
                    item-value-path="value"
                    .items="${[{label:"Euro",value:"EUR"},{label:"US Dollar",value:"USD"}]}"
                    @value-changed="${this.currencyChanged}"
                    .value="${this.value?.currency}"
                    style="max-width: 100px;"
                    theme="small"
            ></vaadin-select></div></vaadin-number-field>
       `}};_e.styles=$`
  `;tt([p()],_e.prototype,"fieldId",2);tt([p()],_e.prototype,"label",2);tt([p()],_e.prototype,"state",2);tt([p()],_e.prototype,"data",2);tt([p()],_e.prototype,"value",2);tt([p()],_e.prototype,"autoFocus",2);tt([p()],_e.prototype,"required",2);tt([p()],_e.prototype,"colspan",2);tt([p()],_e.prototype,"helperText",2);_e=tt([k("mateu-money-field")],_e);const Si=["vaadin:abacus","vaadin:absolute-position","vaadin:academy-cap","vaadin:accessibility","vaadin:accordion-menu","vaadin:add-dock","vaadin:adjust","vaadin:adobe-flash","vaadin:airplane","vaadin:alarm","vaadin:align-center","vaadin:align-justify","vaadin:align-left","vaadin:align-right","vaadin:alt-a","vaadin:alt","vaadin:ambulance","vaadin:anchor","vaadin:angle-double-down","vaadin:angle-double-left","vaadin:angle-double-right","vaadin:angle-double-up","vaadin:angle-down","vaadin:angle-left","vaadin:angle-right","vaadin:angle-up","vaadin:archive","vaadin:archives","vaadin:area-select","vaadin:arrow-backward","vaadin:arrow-circle-down-o","vaadin:arrow-circle-down","vaadin:arrow-circle-left-o","vaadin:arrow-circle-left","vaadin:arrow-circle-right-o","vaadin:arrow-circle-right","vaadin:arrow-circle-up-o","vaadin:arrow-circle-up","vaadin:arrow-down","vaadin:arrow-forward","vaadin:arrow-left","vaadin:arrow-long-down","vaadin:arrow-long-left","vaadin:arrow-right","vaadin:arrow-up","vaadin:arrows-cross","vaadin:arrows-long-h","vaadin:arrows-long-right","vaadin:arrows-long-up","vaadin:arrows-long-v","vaadin:arrows","vaadin:asterisk","vaadin:at","vaadin:automation","vaadin:backspace-a","vaadin:backspace","vaadin:backwards","vaadin:ban","vaadin:bar-chart-h","vaadin:bar-chart-v","vaadin:bar-chart","vaadin:barcode","vaadin:bed","vaadin:bell-o","vaadin:bell-slash-o","vaadin:bell-slash","vaadin:bell","vaadin:boat","vaadin:bold","vaadin:bolt","vaadin:bomb","vaadin:book-dollar","vaadin:book-percent","vaadin:book","vaadin:bookmark-o","vaadin:bookmark","vaadin:briefcase","vaadin:browser","vaadin:bug-o","vaadin:bug","vaadin:building-o","vaadin:building","vaadin:bullets","vaadin:bullseye","vaadin:bus","vaadin:buss","vaadin:button","vaadin:calc-book","vaadin:calc","vaadin:calendar-briefcase","vaadin:calendar-clock","vaadin:calendar-envelope","vaadin:calendar-o","vaadin:calendar-user","vaadin:calendar","vaadin:camera","vaadin:car","vaadin:caret-down","vaadin:caret-left","vaadin:caret-right","vaadin:caret-square-down-o","vaadin:caret-square-left-o","vaadin:caret-square-right-o","vaadin:caret-square-up-o","vaadin:caret-up","vaadin:cart-o","vaadin:cart","vaadin:cash","vaadin:chart-3d","vaadin:chart-grid","vaadin:chart-line","vaadin:chart-timeline","vaadin:chart","vaadin:chat","vaadin:check-circle-o","vaadin:check-circle","vaadin:check-square-o","vaadin:check-square","vaadin:check","vaadin:chevron-circle-down-o","vaadin:chevron-circle-down","vaadin:chevron-circle-left-o","vaadin:chevron-circle-left","vaadin:chevron-circle-right-o","vaadin:chevron-circle-right","vaadin:chevron-circle-up-o","vaadin:chevron-circle-up","vaadin:chevron-down-small","vaadin:chevron-down","vaadin:chevron-left-small","vaadin:chevron-left","vaadin:chevron-right-small","vaadin:chevron-right","vaadin:chevron-up-small","vaadin:chevron-up","vaadin:child","vaadin:circle-thin","vaadin:circle","vaadin:clipboard-check","vaadin:clipboard-cross","vaadin:clipboard-heart","vaadin:clipboard-pulse","vaadin:clipboard-text","vaadin:clipboard-user","vaadin:clipboard","vaadin:clock","vaadin:close-big","vaadin:close-circle-o","vaadin:close-circle","vaadin:close-small","vaadin:close","vaadin:cloud-download-o","vaadin:cloud-download","vaadin:cloud-o","vaadin:cloud-upload-o","vaadin:cloud-upload","vaadin:cloud","vaadin:cluster","vaadin:code","vaadin:coffee","vaadin:cog-o","vaadin:cog","vaadin:cogs","vaadin:coin-piles","vaadin:coins","vaadin:combobox","vaadin:comment-ellipsis-o","vaadin:comment-ellipsis","vaadin:comment-o","vaadin:comment","vaadin:comments-o","vaadin:comments","vaadin:compile","vaadin:compress-square","vaadin:compress","vaadin:connect-o","vaadin:connect","vaadin:controller","vaadin:copy-o","vaadin:copy","vaadin:copyright","vaadin:corner-lower-left","vaadin:corner-lower-right","vaadin:corner-upper-left","vaadin:corner-upper-right","vaadin:credit-card","vaadin:crop","vaadin:cross-cutlery","vaadin:crosshairs","vaadin:css","vaadin:ctrl-a","vaadin:ctrl","vaadin:cube","vaadin:cubes","vaadin:curly-brackets","vaadin:cursor-o","vaadin:cursor","vaadin:cutlery","vaadin:dashboard","vaadin:database","vaadin:date-input","vaadin:deindent","vaadin:del-a","vaadin:del","vaadin:dental-chair","vaadin:desktop","vaadin:diamond-o","vaadin:diamond","vaadin:diploma-scroll","vaadin:diploma","vaadin:disc","vaadin:doctor-briefcase","vaadin:doctor","vaadin:dollar","vaadin:dot-circle","vaadin:download-alt","vaadin:download","vaadin:drop","vaadin:edit","vaadin:eject","vaadin:elastic","vaadin:ellipsis-circle-o","vaadin:ellipsis-circle","vaadin:ellipsis-dots-h","vaadin:ellipsis-dots-v","vaadin:ellipsis-h","vaadin:ellipsis-v","vaadin:enter-arrow","vaadin:enter","vaadin:envelope-o","vaadin:envelope-open-o","vaadin:envelope-open","vaadin:envelope","vaadin:envelopes-o","vaadin:envelopes","vaadin:eraser","vaadin:esc-a","vaadin:esc","vaadin:euro","vaadin:exchange","vaadin:exclamation-circle-o","vaadin:exclamation-circle","vaadin:exclamation","vaadin:exit-o","vaadin:exit","vaadin:expand-full","vaadin:expand-square","vaadin:expand","vaadin:external-browser","vaadin:external-link","vaadin:eye-slash","vaadin:eye","vaadin:eyedropper","vaadin:facebook-square","vaadin:facebook","vaadin:factory","vaadin:family","vaadin:fast-backward","vaadin:fast-forward","vaadin:female","vaadin:file-add","vaadin:file-code","vaadin:file-font","vaadin:file-movie","vaadin:file-o","vaadin:file-picture","vaadin:file-presentation","vaadin:file-process","vaadin:file-refresh","vaadin:file-remove","vaadin:file-search","vaadin:file-sound","vaadin:file-start","vaadin:file-table","vaadin:file-text-o","vaadin:file-text","vaadin:file-tree-small","vaadin:file-tree-sub","vaadin:file-tree","vaadin:file-zip","vaadin:file","vaadin:fill","vaadin:film","vaadin:filter","vaadin:fire","vaadin:flag-checkered","vaadin:flag-o","vaadin:flag","vaadin:flash","vaadin:flask","vaadin:flight-landing","vaadin:flight-takeoff","vaadin:flip-h","vaadin:flip-v","vaadin:folder-add","vaadin:folder-o","vaadin:folder-open-o","vaadin:folder-open","vaadin:folder-remove","vaadin:folder-search","vaadin:folder","vaadin:font","vaadin:form","vaadin:forward","vaadin:frown-o","vaadin:funcion","vaadin:function","vaadin:funnel","vaadin:gamepad","vaadin:gavel","vaadin:gift","vaadin:glass","vaadin:glasses","vaadin:globe-wire","vaadin:globe","vaadin:golf","vaadin:google-plus-square","vaadin:google-plus","vaadin:grab","vaadin:grid-bevel","vaadin:grid-big-o","vaadin:grid-big","vaadin:grid-h","vaadin:grid-small-o","vaadin:grid-small","vaadin:grid-v","vaadin:grid","vaadin:group","vaadin:hammer","vaadin:hand","vaadin:handle-corner","vaadin:hands-up","vaadin:handshake","vaadin:harddrive-o","vaadin:harddrive","vaadin:hash","vaadin:header","vaadin:headphones","vaadin:headset","vaadin:health-card","vaadin:heart-o","vaadin:heart","vaadin:home-o","vaadin:home","vaadin:hospital","vaadin:hourglass-empty","vaadin:hourglass-end","vaadin:hourglass-start","vaadin:hourglass","vaadin:inbox","vaadin:indent","vaadin:info-circle-o","vaadin:info-circle","vaadin:info","vaadin:input","vaadin:insert","vaadin:institution","vaadin:invoice","vaadin:italic","vaadin:key-o","vaadin:key","vaadin:keyboard-o","vaadin:keyboard","vaadin:laptop","vaadin:layout","vaadin:level-down-bold","vaadin:level-down","vaadin:level-left-bold","vaadin:level-left","vaadin:level-right-bold","vaadin:level-right","vaadin:level-up-bold","vaadin:level-up","vaadin:lifebuoy","vaadin:lightbulb","vaadin:line-bar-chart","vaadin:line-chart","vaadin:line-h","vaadin:line-v","vaadin:lines-list","vaadin:lines","vaadin:link","vaadin:list-ol","vaadin:list-select","vaadin:list-ul","vaadin:list","vaadin:location-arrow-circle-o","vaadin:location-arrow-circle","vaadin:location-arrow","vaadin:lock","vaadin:magic","vaadin:magnet","vaadin:mailbox","vaadin:male","vaadin:map-marker","vaadin:margin-bottom","vaadin:margin-left","vaadin:margin-right","vaadin:margin-top","vaadin:margin","vaadin:medal","vaadin:megafone","vaadin:megaphone","vaadin:meh-o","vaadin:menu","vaadin:microphone","vaadin:minus-circle-o","vaadin:minus-circle","vaadin:minus-square-o","vaadin:minus","vaadin:mobile-browser","vaadin:mobile-retro","vaadin:mobile","vaadin:modal-list","vaadin:modal","vaadin:money-deposit","vaadin:money-exchange","vaadin:money-withdraw","vaadin:money","vaadin:moon-o","vaadin:moon","vaadin:morning","vaadin:movie","vaadin:music","vaadin:mute","vaadin:native-button","vaadin:newspaper","vaadin:notebook","vaadin:nurse","vaadin:office","vaadin:open-book","vaadin:option-a","vaadin:option","vaadin:options","vaadin:orientation","vaadin:out","vaadin:outbox","vaadin:package","vaadin:padding-bottom","vaadin:padding-left","vaadin:padding-right","vaadin:padding-top","vaadin:padding","vaadin:paint-roll","vaadin:paintbrush","vaadin:palete","vaadin:palette","vaadin:panel","vaadin:paperclip","vaadin:paperplane-o","vaadin:paperplane","vaadin:paragraph","vaadin:password","vaadin:paste","vaadin:pause","vaadin:pencil","vaadin:phone-landline","vaadin:phone","vaadin:picture","vaadin:pie-bar-chart","vaadin:pie-chart","vaadin:piggy-bank-coin","vaadin:piggy-bank","vaadin:pill","vaadin:pills","vaadin:pin-post","vaadin:pin","vaadin:play-circle-o","vaadin:play-circle","vaadin:play","vaadin:plug","vaadin:plus-circle-o","vaadin:plus-circle","vaadin:plus-minus","vaadin:plus-square-o","vaadin:plus","vaadin:pointer","vaadin:power-off","vaadin:presentation","vaadin:print","vaadin:progressbar","vaadin:puzzle-piece","vaadin:pyramid-chart","vaadin:qrcode","vaadin:question-circle-o","vaadin:question-circle","vaadin:question","vaadin:quote-left","vaadin:quote-right","vaadin:random","vaadin:raster-lower-left","vaadin:raster","vaadin:records","vaadin:recycle","vaadin:refresh","vaadin:reply-all","vaadin:reply","vaadin:resize-h","vaadin:resize-v","vaadin:retweet","vaadin:rhombus","vaadin:road-branch","vaadin:road-branches","vaadin:road-split","vaadin:road","vaadin:rocket","vaadin:rotate-left","vaadin:rotate-right","vaadin:rss-square","vaadin:rss","vaadin:safe-lock","vaadin:safe","vaadin:scale-unbalance","vaadin:scale","vaadin:scatter-chart","vaadin:scissors","vaadin:screwdriver","vaadin:search-minus","vaadin:search-plus","vaadin:search","vaadin:select","vaadin:server","vaadin:share-square","vaadin:share","vaadin:shield","vaadin:shift-arrow","vaadin:shift","vaadin:shop","vaadin:sign-in-alt","vaadin:sign-in","vaadin:sign-out-alt","vaadin:sign-out","vaadin:signal","vaadin:sitemap","vaadin:slider","vaadin:sliders","vaadin:smiley-o","vaadin:sort","vaadin:sound-disable","vaadin:spark-line","vaadin:specialist","vaadin:spinner-arc","vaadin:spinner-third","vaadin:spinner","vaadin:spline-area-chart","vaadin:spline-chart","vaadin:split-h","vaadin:split-v","vaadin:split","vaadin:spoon","vaadin:square-shadow","vaadin:star-half-left-o","vaadin:star-half-left","vaadin:star-half-right-o","vaadin:star-half-right","vaadin:star-o","vaadin:star","vaadin:start-cog","vaadin:step-backward","vaadin:step-forward","vaadin:stethoscope","vaadin:stock","vaadin:stop-cog","vaadin:stop","vaadin:stopwatch","vaadin:storage","vaadin:strikethrough","vaadin:subscript","vaadin:suitcase","vaadin:sun-down","vaadin:sun-o","vaadin:sun-rise","vaadin:superscript","vaadin:sword","vaadin:tab-a","vaadin:tab","vaadin:table","vaadin:tablet","vaadin:tabs","vaadin:tag","vaadin:tags","vaadin:tasks","vaadin:taxi","vaadin:teeth","vaadin:terminal","vaadin:text-height","vaadin:text-input","vaadin:text-label","vaadin:text-width","vaadin:thin-square","vaadin:thumbs-down-o","vaadin:thumbs-down","vaadin:thumbs-up-o","vaadin:thumbs-up","vaadin:ticket","vaadin:time-backward","vaadin:time-forward","vaadin:timer","vaadin:toolbox","vaadin:tools","vaadin:tooth","vaadin:touch","vaadin:train","vaadin:trash","vaadin:tree-table","vaadin:trendind-down","vaadin:trending-down","vaadin:trending-up","vaadin:trophy","vaadin:truck","vaadin:twin-col-select","vaadin:twitter-square","vaadin:twitter","vaadin:umbrella","vaadin:underline","vaadin:unlink","vaadin:unlock","vaadin:upload-alt","vaadin:upload","vaadin:user-card","vaadin:user-check","vaadin:user-clock","vaadin:user-heart","vaadin:user-star","vaadin:user","vaadin:users","vaadin:vaadin-h","vaadin:vaadin-v","vaadin:viewport","vaadin:vimeo-square","vaadin:vimeo","vaadin:volume-down","vaadin:volume-off","vaadin:volume-up","vaadin:volume","vaadin:wallet","vaadin:warning","vaadin:workplace","vaadin:wrench","vaadin:youtube-square","vaadin:youtube"];var vh=Object.defineProperty,fh=Object.getOwnPropertyDescriptor,ue=(e,t,a,r)=>{for(var i=r>1?void 0:r?fh(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&vh(t,a,i),i};let Tr=null;const bh=()=>(Tr||(Tr=Promise.all([me(()=>import("./vendor-ui5.js").then(e=>e.C),__vite__mapDeps([2,3,4,1])),me(()=>import("./vendor-ui5.js").then(e=>e.R),__vite__mapDeps([2,3,4,1]))])),Tr);let Y=class extends C{constructor(){super(...arguments),this.ui5FieldComponentsReady=!1,this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter="",this.rendered=!1,this.renderColorPicker=()=>{this.loadUi5FieldComponents();const e=this.field?.fieldId,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue;return o`
            <ui5-color-picker value="${t}" @change="${a=>this.colorPickerValue=a.target.value}">Picker</ui5-color-picker>
        `},this.saveColor=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.colorPickerValue,fieldId:this.field.fieldId},bubbles:!0,composed:!0})),this.colorPickerOpened=!1},this.renderColorPickerFooter=()=>o`<vaadin-button @click="${()=>this.colorPickerOpened=!1}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`,this.checked=e=>{const t=e.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))},this.convert=e=>this.field?.dataType=="integer"?parseInt(e):e,this.multiComboBoxValueChanged=e=>{if(this.rendered){const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let r;e.detail.value&&(r=e.detail.value.map(i=>i.value),r&&r.length>0&&(this.data[this.id]||(this.data[this.id]={}),this.data[this.id].content||(this.data[this.id].content=[]),this.data[this.id]&&this.data[this.id].content&&e.detail.value.forEach(i=>{this.data[this.id].content?.find(s=>i.value==s.value)||this.data[this.id].content.push(i)}))),this.compareArrays(r,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.valueChanged=e=>{this.rendered&&e.detail.value!==void 0&&e.detail.value!=this.state[this.field.fieldId]&&this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.convert(e.detail.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.selectedItems=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.comboData&&this.comboData.length>0)return this.comboData?.filter(t=>e.indexOf(t.value)>=0);if(this.data[this.id]&&this.data[this.id].content&&this.data[this.id].content.length>0)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0)}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0);return[]},this.selectedIndex=e=>{if(e)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const t=this.data[this.id].content.find(a=>a.value==e);if(t)return this.data[this.id].content.indexOf(t)}}else{const t=this.field?.options?.find(a=>a.value==e);if(t)return this.field?.options?.indexOf(t)}},this.selectedIndexes=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content)return this.data[this.id].content.filter(a=>e.indexOf(a.value)>=0).map(a=>this.data[this.id].content.indexOf(a))}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0).map(t=>this.field?.options?.indexOf(t));return[]},this.compareArrays=(e,t)=>this.falsy(e)&&this.falsy(t)||e&&t&&e.length===t.length&&e.every((a,r)=>a===t[r]),this.falsy=e=>!e||e.length==0,this.listItemsSelected=e=>{const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let r;this.rendered&&(e.detail.value&&(this.field?.remoteCoordinates?this.data[this.id]&&this.data[this.id].content&&(r=e.detail.value.map(i=>this.data[this.id].content[i].value)):r=e.detail.value.map(i=>this.field.options[i].value)),this.compareArrays(r,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r,fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))},this.listItemSelected=e=>{let t;if(e.detail.value||e.detail.value==0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const a=this.data[this.id].content[e.detail.value];a&&(t=a.value)}}else{const a=this.field.options[e.detail.value];a&&(t=a.value)}this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.mapPosition=e=>{switch(e){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.helperShownInControl=!1,this.fileUploaded=e=>{const t=this.field?.fieldId??"",a=this.state[t];a.push({id:e.detail.xhr.responseText,name:e.detail.file.name}),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.fileChanged=e=>{const t=this.field?.fieldId??"",a=(e.detail.value??[]).filter(i=>i.id).map(i=>i.id),r=(this.state[t]??[]).map(i=>i.id);if(!this.compareArrays(r,a)){const i=(e.detail.value??[]).filter(s=>s.id).map(s=>({id:s.id,name:s.name}));this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.triggerImageUpload=()=>{this.renderRoot?.querySelector('input[type="file"]')?.click()},this.imageUpload=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const r=new FileReader;r.onload=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r.result,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},r.readAsDataURL(a),t.value=""},this.imageDelete=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:"",fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.iconComboboxRenderer=e=>o`
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
`,this.comboRenderer=e=>o`
        ${e.description||e.image||e.icon?o`
            <vaadin-horizontal-layout theme="spacing">
                ${e.icon?o`<div><vaadin-icon icon="${e.icon}"></vaadin-icon></div>
                                    `:l}
                ${e.image?o`
                    <div>
                    <img
                            style="width: var(--lumo-size-m); margin-right: var(--lumo-space-s);"
                            src="${e.image}"
                            alt="${e.label}"
                    />
                    </div>
                                        `:l}
                <div>
                    ${e.label}
                    ${e.description?o`
            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);">
                ${e.description}
            </div>
        `:l}
                </div>

            </vaadin-horizontal-layout>
                            `:e.label}
`,this.filteredIcons=[],this.navLinkOffset=null,this.iconFilterChanged=e=>{this.filteredIcons=Si.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}loadUi5FieldComponents(){this.ui5FieldComponentsReady||bh().then(()=>{this.ui5FieldComponentsReady=!0})}remoteComboDataProvider(e){return(t,a)=>{const{filter:r,page:i,pageSize:s}=t,n=r??"";this._comboFilter=n,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{searchText:r,fieldId:this.field?.fieldId,size:s,page:i,sort:void 0},callback:d=>{if(n===this._comboFilter)if(d?.messages?.forEach(c=>{Ga.show(c.text,{position:c.position?this.mapPosition(c.position):void 0,theme:c.variant,duration:c.duration})}),!d.fragments||d.fragments.length==0)this.comboData=[],a([],0);else{const c=d.fragments[0].data?.[this.id];this.comboData=c?.content,a(c?.content,c?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}renderNavLink(){const e=this.field?.link;if(!e?.href)return l;const t=$e(e.href,this.state,this.data)??e.href,a=$e(e.title,this.state,this.data)||t,r=e.icon||(t.startsWith("http")?"vaadin:external-link":"vaadin:link"),i=this.navLinkOffset??"calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)";return o`<a
                data-navlink
                href="${t}"
                title="${a}"
                target="${E(e.target||void 0)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${i};"
        ><vaadin-icon icon="${r}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`}positionNavLink(){const e=this.renderRoot?.querySelector("a[data-navlink]");e&&setTimeout(()=>{const t=e.parentElement,a=t?.firstElementChild?.firstElementChild;if(!t||!a)return;const i=(a.shadowRoot?.querySelector('[part="input-field"]')??a).getBoundingClientRect();if(i.height===0)return;const s=Math.max(0,i.top+i.height/2-e.offsetHeight/2-t.getBoundingClientRect().top),n=`${Math.round(s)}px`;this.navLinkOffset!==n&&(this.navLinkOffset=n)})}helperText(){return this.helperShownInControl=!0,Oe(this.field?.description??"",this.state,this.data)??""}render(){const e=this.field?.fieldId??"";this.rendered=!0;const t=this.renderNavLink();this.helperShownInControl=!1;const a=this.renderField(),r=this.field?.description&&!this.helperShownInControl?Oe(this.field.description,this.state,this.data):void 0;return o`<div style="display: block;">
            <div style="${t!==l?"display: flex; gap: var(--lumo-space-xs);":""}"><div style="flex: 1; min-width: 0;">${a}</div>${t}</div>
            ${r?o`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${r}</div>
            `:l}
            ${this.data.errors&&this.data.errors[e]&&this.data.errors[e].length>0?o`
                <div><ul>${this.data.errors[e].map(i=>o`<li>${i}</li>`)}</ul></div>
            `:l}
        </div>`}async firstUpdated(){this.filteredIcons=Si}update(e){e.has("component")&&(this.rendered=!1),super.update(e)}updated(e){super.updated(e),this.positionNavLink()}renderField(){const e=this.field?.fieldId??"",t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,a=this.field?.label+"",r=$e(a,this.state,this.data),i=this.labelAlreadyRendered||!r||r=="null"?l:r;return this.field?.propertyRow?this.renderPropertyRowField(e,t,i,r):this.field?.stereotype=="badge"?this.renderBadgeField(e,t,i,r):this.field?.stereotype=="plainText"?this.renderPlainTextField(e,t,i,r):this.field?.stereotype=="bulletedList"?this.renderBulletedListField(e,t,i,r):this.field?.readOnly&&this.field.stereotype!="grid"&&this.field.dataType!="status"&&this.field?.dataType!="money"?this.renderReadOnlyField(e,t,i,r):this.field?.dataType=="file"?this.renderFileField(e,t,i,r):this.field?.dataType=="string"?this.renderStringField(e,t,i,r):this.field?.dataType=="number"?this.renderNumberField(e,t,i,r):this.field?.dataType=="integer"?this.renderIntegerField(e,t,i,r):this.field?.dataType=="bool"?this.renderBoolField(e,t,i,r):this.field?.dataType=="dateRange"?this.renderDateRangeField(e,t,i,r):this.field?.dataType=="date"?this.renderDateField(e,t,i,r):this.field?.dataType=="dateTime"?this.renderDateTimeField(e,t,i,r):this.field?.dataType=="time"?this.renderTimeField(e,t,i,r):this.field?.dataType=="array"?this.renderArrayField(e,t,i,r):this.field?.dataType=="money"?this.renderMoneyField(e,t,i,r):this.field?.dataType=="status"?this.renderStatusField(e,t,i,r):this.field?.dataType=="range"?this.renderRangeField(e,t,i,r):o`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,a,r){if(!this.field)return o``;const i=t===!0||t==="true";return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${i?"success":""} pill" style="${i?"":"opacity: 0.4;"}">${r}</span>
            </vaadin-custom-field>`}renderPropertyRowField(e,t,a,r){if(!this.field)return o``;let i=Oe(t,this.state,this.data);const s=i&&typeof i=="object"&&"value"in i?i:null;i&&i.value&&(i=i.value);const n=this.field?.dataType=="bool"||i===!0||i===!1,d=this.field?.dataType=="money",c=i!=null&&i!=="";let u=c?String(i):"—";if(d&&c){const f=typeof i=="number"?i:parseFloat(String(i));isNaN(f)||(u=s&&s.locale&&s.currency?new Intl.NumberFormat(s.locale,{style:"currency",currency:s.currency}).format(f):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(f))}const m=n?o`<vaadin-icon icon="${i===!0||i==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:o`<span style="font-weight: 500; text-align: right; word-break: break-word; margin-left: auto;${d?" font-variant-numeric: tabular-nums;":""}">${u}</span>`,v=r&&r!="null";return o`<div
                    id="${this.field.fieldId}"
                    data-colspan="${this.field?.colspan}"
                    style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; width: 100%; padding: 0.4rem 0; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); font-size: var(--lumo-font-size-s, .875rem); ${this.field?.style}"
            >${v?o`<span style="color: var(--lumo-secondary-text-color, #888); white-space: nowrap;">${r}</span>`:l}${m}</div>`}renderBulletedListField(e,t,a,r){if(!this.field)return o``;const i=Oe(t,this.state,this.data),s=Array.isArray(i)?i.map(n=>String(n)):i!=null&&i!==""?[String(i)]:[];return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><mateu-bulleted-list .items="${s}"></mateu-bulleted-list>
            </vaadin-custom-field>`}renderPlainTextField(e,t,a,r){if(!this.field)return o``;let i=Oe(t,this.state,this.data);const s=i&&typeof i=="object"&&"value"in i?i:null;i&&i.value&&(i=i.value);const n=this.field?.dataType=="bool"||i===!0||i===!1,d=this.field?.dataType=="money",c=i!=null&&i!=="";let u=c?String(i):"—";if(d&&c){const v=typeof i=="number"?i:parseFloat(String(i));isNaN(v)||(u=s&&s.locale&&s.currency?new Intl.NumberFormat(s.locale,{style:"currency",currency:s.currency}).format(v):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v))}const m=n?o`<vaadin-icon icon="${i===!0||i==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?o`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${u}</span>`:o`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${d?" font-variant-numeric: tabular-nums;":""}">${u}</span>`;return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    data-colspan="${this.field?.colspan}"
                    style="${d?"text-align: right; ":""}${this.field?.style}"
            >${m}</vaadin-custom-field>`}renderReadOnlyField(e,t,a,r){if(!this.field)return o``;let i=Oe(t,this.state,this.data)||this.data[e];if(i&&i.value&&(i=i.value),this.field.stereotype=="fileUpload")return o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><mateu-file-upload .fieldId="${this.field.fieldId}" .value="${i}" .editable="${!1}"></mateu-file-upload>
                </vaadin-custom-field>`;if(this.field.stereotype=="image"||this.field.stereotype=="uploadableImage"||this.field.stereotype=="signature"||this.field.stereotype=="camera")return o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||l}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><img src="${i}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`;if(this.field.dataType=="bool")return o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||l}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${i?"vaadin:check":"vaadin:minus"}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`;const s=i!=null?String(i):"";return o`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        value="${i}"
                        readonly
                        style="${this.field.style}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >${s.length>15?o`<vaadin-icon
                        slot="suffix"
                        icon="vaadin:copy"
                        title="Copiar"
                        style="cursor: pointer; color: var(--lumo-secondary-text-color);"
                        @click="${()=>this.copyValue(s)}"
                ></vaadin-icon>`:l}</vaadin-text-field>
`}copyValue(e){navigator.clipboard.writeText(e).then(()=>Ga.show("Copied",{position:"bottom-end",theme:"success",duration:2e3})).catch(()=>{})}renderFileField(e,t,a,r){if(!this.field)return o``;const i=t?.map(s=>({id:s.id,name:s.name,type:"",uploadTarget:"",complete:!0}))??[];return o`
                <vaadin-custom-field
                        label="${a}"
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
            `}renderStringField(e,t,a,r){if(!this.field)return o``;if(this.field?.stereotype=="searchable"){const i=n=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"code-"+this.field?.fieldId,parameters:{code:n.currentTarget.value}},bubbles:!0,composed:!0}))},s=n=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"codesearch-"+this.field?.fieldId,parameters:{}},bubbles:!0,composed:!0}))};return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            required="${this.field.required||l}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-horizontal-layout theme="spacing" style="--lumo-space-m: 0.33rem;">
                            <vaadin-text-field style="width: 4rem;" @change="${i}" value="${t}"></vaadin-text-field>
                            <vaadin-text-field readonly="" value="${this.data[this.field.fieldId+"-label"]}"></vaadin-text-field>
                            <vaadin-button theme="icon" @click="${s}"><vaadin-icon icon="lumo:search"></vaadin-icon></vaadin-button>
                        </vaadin-horizontal-layout>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="select"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,n="";this.data[this.id]&&(this.data[this.id].searchSignature||n)&&this.data[this.id].searchSignature!=n&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:n,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}));let d=t;return t&&t.value&&(d=t.value),o`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.data[this.id]?.content}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${d}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||l}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                    `}let i=t;return t&&t.value&&(i=t.value),o`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${i}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||l}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                `}if(this.field?.stereotype=="markdown")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            required="${this.field.required||l}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><vaadin-markdown
                            .content="${t}"
                    ></vaadin-markdown>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates;let s;this.data[this.id]&&this.data[this.id].content&&(s=this.data[this.id].content.find(d=>d.value==t)),!s&&this.comboData&&(s=this.comboData.find(d=>d.value==t)),!s&&t&&(s={value:t,label:this.data[this.id+"-label"]??t});const n=this.remoteComboDataProvider(i.action);return o`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-id-path="value"
                            .dataProvider="${n}"
                            .selectedItem="${s}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||l}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            @keyup="${d=>{if(d.key=="Backspace"){const c=d.currentTarget;c.inputElement.value||(c.value="")}}}"
                            ${kr(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}return o`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||l}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            ${kr(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,s="";return this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${E(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map(n=>o`
                            <vaadin-item>${n.description||n.image||n.icon?o`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${n.icon?o`
                                        <vaadin-icon icon="${n.icon}"></vaadin-icon>
                                    `:l}
                                    ${n.image?o`
                                            <img src="${n.image}" alt="${n.label}" style="width: 2rem;" />
                                        `:l}
                                    <vaadin-vertical-layout>
                                        <span> ${n.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${n.description}
            </span>
                                    </vaadin-vertical-layout>
                                </vaadin-horizontal-layout>
                            `:n.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                        </vaadin-custom-field>
                    `}return o`
                    <vaadin-custom-field
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${E(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(i=>o`
                            <vaadin-item>${i.description||i.image||i.icon?o`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${i.icon?o`
                                        <vaadin-icon icon="${i.icon}"></vaadin-icon>
                                    `:l}
                                    ${i.image?o`
                                            <img src="${i.image}" alt="${i.label}" style="width: 2rem;" />
                                        `:l}
                                    <vaadin-vertical-layout>
                                        <span> ${i.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${i.description}
            </span>
                                    </vaadin-vertical-layout>
                                </vaadin-horizontal-layout>
                            `:i.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="radio"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,s="";return this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${a}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            theme="horizontal"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||l}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.data[this.id]?.content?.map(n=>o`
                            <vaadin-radio-button value="${n.value}" label="${n.label}" ?checked="${n&&t&&n.value===t}">
                                ${n.description||n.image||n.icon?o`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${n.icon?o`
                                                <vaadin-icon icon="${n.icon}"></vaadin-icon>
                                            `:l}
                                            ${n.image?o`
                                                <img src="${n.image}" alt="${n.label}" style="height: 1rem;" />
                                            `:l}
                                            <span>${n.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${n.description?o`
                                            <div>${n.description}</div>
                                        `:l}
                                    </label>
                                `:l}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `}return o`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${a}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||l}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(i=>o`
                            <vaadin-radio-button value="${i.value}" label="${i.label}">
                                ${i.description||i.image||i.icon?o`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${i.icon?o`
                                                <vaadin-icon icon="${i.icon}"></vaadin-icon>
                                            `:l}
                                            ${i.image?o`
                                                <img src="${i.image}" alt="${i.label}" style="height: 1rem;" />
                                            `:l}
                                            <span>${i.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${i.description?o`
                                            <div>${i.description}</div>
                                        `:l}
                                    </label>
                                `:l}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `}if(this.field.stereotype=="popover")return o`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            required="${this.field.required||l}"
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
                            ${Ti(()=>o`
                                <mateu-event-interceptor .target="${this}">
                                <mateu-choice
                                        .field="${this.field}"
                                        .value="${t}"
                                ></mateu-choice>
                                </mateu-event-interceptor>
                            `,[])}
                    ></vaadin-popover>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="choice")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            required="${this.field.required||l}"
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
                    `;if(this.field?.stereotype=="richText")return o`
                    <vaadin-custom-field
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-rich-text-editor
                            .maxlength="${this.field.charLimit}"
                            .value="${t}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                    ></vaadin-rich-text-editor>
                    </vaadin-custom-field>`;if(this.field?.stereotype=="textarea")return o`
                    <vaadin-text-area
                            id="${this.field.fieldId}"
                            label="${a}"
                            .maxlength="${this.field.charLimit}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||l}"
                            data-colspan="${this.field.colspan}"
                            rows="4"
                            style="width: 100%;"
                    ></vaadin-text-area>`;if(this.field?.stereotype=="email")return o`
                    <vaadin-email-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||l}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-email-field>
                `;if(this.field?.stereotype=="link")return this.field.readOnly?o`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><a href="${t}">${t}</a></vaadin-custom-field>`:o`
                            <vaadin-text-field
                                    id="${this.field.fieldId}"
                                    label="${a}"
                                    required="${this.field.required||l}"
                                    @value-changed="${this.valueChanged}"
                                    value="${t}"
                                    .helperText="${this.helperText()}"
                                    ?autofocus="${this.field.wantsFocus}"
                            >
                                <vaadin-icon slot="suffix"
                                             icon="vaadin:external-link"
                                             style="cursor: pointer;"
                                             @click="${()=>window.open(t,"_blank")?.focus()}"
                                ></vaadin-icon>
                            </vaadin-text-field>
                `;if(this.field?.stereotype=="icon")return this.field.readOnly?o`<vaadin-icon
                                             icon="${t}"
                                             data-colspan="${this.field.colspan}"
                    ></vaadin-icon>`:o`
                    <vaadin-combo-box
                                    id="${this.field.fieldId}"
                                    label="${a}"
                                    required="${this.field.required||l}"
                                    @value-changed="${this.valueChanged}"
                                    value="${t}"
                                    .helperText="${this.helperText()}"
                                    ?autofocus="${this.field.wantsFocus}"
                                    data-colspan="${this.field.colspan}"
                            item-label-path="displayName"
                            style="--vaadin-combo-box-overlay-width: 16em"
                                    .filteredItems="${this.filteredIcons}"
                            @filter-changed="${this.iconFilterChanged}"
                            ${kr(this.iconComboboxRenderer,[])}
                    >
                        ${t?o`<vaadin-icon slot="prefix" icon="${t}"></vaadin-icon>`:l}
                    </vaadin-combo-box>
                `;if(this.field?.stereotype=="password")return o`
                    <vaadin-password-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||l}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-password-field>
                `;if(this.field?.stereotype=="html")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${ye(""+t)}</div></vaadin-custom-field>
                `;if(this.field?.stereotype=="image")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><img
                            src="${t}"
                            style="${this.component?.style}" class="${this.component?.cssClasses}"></vaadin-custom-field>
                `;if(this.field?.stereotype=="treeSelect"){const i=this.helperText();return o`
                    <div class="tree-field" id="${this.field.fieldId}" data-colspan="${this.field.colspan}">
                        ${a?o`
                            <span class="tree-field__label">${a}${this.field.required?o`<span class="tree-field__required"> •</span>`:l}</span>`:l}
                        <mateu-vaadin-tree-select
                                style="width: 100%;"
                                .fieldId="${this.field.fieldId}"
                                .value="${t}"
                                .options="${this.field.options??[]}"
                                .leavesOnly="${this.field.treeLeavesOnly??!1}"
                        ></mateu-vaadin-tree-select>
                        ${i?o`<span class="tree-field__helper">${i}</span>`:l}
                    </div>
                `}if(this.field?.stereotype=="signature")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-signature-pad .fieldId="${this.field.fieldId}" .value="${t}"></mateu-signature-pad>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="camera")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-camera-capture .fieldId="${this.field.fieldId}" .value="${t}"></mateu-camera-capture>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="fileUpload"){const i=Mp(this.field.attributes,"accept");return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-file-upload .fieldId="${this.field.fieldId}" .value="${t}" .accept="${i}"></mateu-file-upload>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="uploadableImage"){const i=t!=null&&t!=="";return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-vertical-layout style="align-items: stretch; gap: var(--lumo-space-s); max-width: 320px;">
                            ${i?o`<img
                                    src="${t}"
                                    style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--lumo-contrast-20pct); border-radius: var(--lumo-border-radius-m); ${this.field.style??""}"
                                    class="${this.component?.cssClasses}">`:o`<div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--lumo-contrast-30pct); border-radius: var(--lumo-border-radius-m); color: var(--lumo-secondary-text-color);">
                                    <vaadin-icon icon="vaadin:picture" style="height: 2rem; width: 2rem;"></vaadin-icon>
                                </div>`}
                            <input type="file" accept="image/*" style="display: none;" @change="${this.imageUpload}">
                            <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-start;">
                                <vaadin-button @click="${this.triggerImageUpload}">
                                    <vaadin-icon icon="vaadin:upload" slot="prefix"></vaadin-icon>
                                    ${i?"Replace":"Upload"}
                                </vaadin-button>
                                ${i?o`<vaadin-button theme="error tertiary" @click="${this.imageDelete}">
                                    <vaadin-icon icon="vaadin:trash" slot="prefix"></vaadin-icon>
                                    Delete
                                </vaadin-button>`:l}
                            </vaadin-horizontal-layout>
                        </vaadin-vertical-layout>
                    </vaadin-custom-field>
                `}return this.field?.stereotype=="color"?this.field.readOnly?o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><span style="background-color: ${t}; display: block; height: 20px; width: 40px; margin-top: 5px; margin-bottom: 24px; border: 1px solid var(--lumo-secondary-text-color)"></vaadin-custom-field>
                `:o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                    >
                        <input type="color" @input="${i=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"/>
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
  ${Ei(this.renderColorPicker,[])}
  ${to(this.renderColorPickerFooter,[])}
></vaadin-dialog>
                `:o`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||l}"
                        ?disabled="${this.field.disabled}"
                        data-colspan="${this.field.colspan}"
                        style="${this.field.style}"
                ></vaadin-text-field>
`}renderNumberField(e,t,a,r){return this.field?o`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||l}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min!=null?this.field.min:l}"
                        max="${this.field.max!=null?this.field.max:l}"
            ></vaadin-number-field>`:o``}renderIntegerField(e,t,a,r){if(!this.field)return o``;if(this.field.stereotype=="stars"){let i=t;isNaN(i)&&(i=0);const s=[1,2,3,4,5];return o`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >${s.map(n=>o`
                    <vaadin-icon 
                            icon="vaadin:star" 
                            style="cursor: pointer; color: var(${n<=i?"--lumo-warning-color":"--lumo-shade-30pct"});"
                            @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:n,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}"
                    
                    ></vaadin-icon>
                `)}</vaadin-custom-field>`}if(this.field.stereotype=="slider"){let i=t;return isNaN(i)&&(i=0),o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><input type="range" @input="${s=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}" min="${this.field.sliderMin??0}" max="${this.field.sliderMax??10}" value="${i??0}"/></vaadin-custom-field>
                `}return o`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||l}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min!=null?this.field.min:l}"
                        max="${this.field.max!=null?this.field.max:l}"
                ></vaadin-integer-field>
            `}renderBoolField(e,t,a,r){return this.field?this.field.stereotype=="toggle"?o`
                    <vaadin-custom-field
                            label="${a}"
                            .helperText="${this.helperText()}"
                            ?required="${this.field.required||l}"
                            data-colspan="${this.field.colspan}"
                    >
                        <paper-toggle-button id="${this.field.fieldId}"
                                             ?disabled=${this.field.disabled}
                                             ?checked=${t}
                                             @change=${this.checked}>
                        </paper-toggle-button>
                    </vaadin-custom-field>
                `:o`
                <vaadin-checkbox
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
                        @change="${this.checked}"
                        value="${t}"
                        ?checked=${t}
                        ?autofocus="${this.field.wantsFocus}"
                ></vaadin-checkbox>
            `:o``}renderDateRangeField(e,t,a,r){if(!this.field)return o``;const i=t?t.from+";"+t.to:void 0;return o`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${a}"
                    @value-changed="${s=>{s.detail.value&&(s.detail.value={from:s.detail.value.split(";")[0],to:s.detail.value.split(";")[1]}),this.valueChanged(s)}}"
                    value="${i}"
                    .helperText="${this.helperText()}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||l}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,a,r){return this.field?o`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:o``}renderDateTimeField(e,t,a,r){return this.field?o`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:o``}renderTimeField(e,t,a,r){return this.field?o`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:o``}renderArrayField(e,t,a,r){if(!this.field)return o``;if(this.field?.stereotype=="choice")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            required="${this.field.required||l}"
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
                    `;if(this.field?.stereotype=="grid")return o`
                    <vaadin-custom-field
                            label="${a}"
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
`;if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,s="";return this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box multiple
                                     .selectedValues="${E(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                            id="${this.field.fieldId}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map(n=>o`
                            <vaadin-item>${n.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                        </vaadin-custom-field>
                    `}return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box multiple
                                     .selectedValues="${E(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                                     data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(i=>o`
                            <vaadin-item>${i.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,s=this.remoteComboDataProvider(i.action);return o`
                        <vaadin-multi-select-combo-box
                            label="${a}"
                            item-label-path="label"
                            item-id-path="value"
                            item-value-path="value"
                            .dataProvider="${s}"
                            .helperText="${this.helperText()}"
                            .selectedItems="${this.selectedItems(t)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||l}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            auto-expand-horizontally
                            auto-expand-vertically
                            xselected-items-on-top
                    ></vaadin-multi-select-combo-box>
                    `}return o`
                    <vaadin-multi-select-combo-box
                            label="${a}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            .selectedItems="${this.selectedItems(t)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||l}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            auto-expand-horizontally
                            auto-expand-vertically
                            xselected-items-on-top
                    ></vaadin-multi-select-combo-box>
                    `}if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,s="";return this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.rendered||setTimeout(()=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}),o`
                    <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${a}"
                        theme="vertical"
                        @value-changed="${this.valueChanged}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
                        .value="${t}"
                        class="mateu-checkbox-group-${this.field.optionsColumns>1?"multi-column":""}"
                >
                        ${this.data[this.id]?.content?.map(n=>o`
                            <vaadin-checkbox
                                    value="${n.value}"
                                    label="${n.label}"
                            ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
                    `}return o`
                <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        theme="vertical"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
                        class="mateu-checkbox-group-${this.field.optionsColumns>1?"multi-column":""}"
                        .value="${t}"
                >
                        ${this.field.options?.map(i=>o`
                        <vaadin-checkbox 
                                value="${i.value}" 
                                label="${i.label}"
                        ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
            `}renderMoneyField(e,t,a,r){if(!this.field)return o``;if(this.field.readOnly){const i=t;let s=i;return i&&i.locale&&i.currency?s=new Intl.NumberFormat(i.locale,{style:"currency",currency:i.currency}).format(i.value):s=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(i),o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><div style="width: 186px; text-align: right;">${s}</div></vaadin-custom-field>`}return o`<mateu-money-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        .value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||l}"
                        data-colspan="${this.field.colspan}"
            ></mateu-money-field>`}renderStatusField(e,t,a,r){if(!this.field)return o``;const i=t;return o`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||l}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    ${i?o`<span theme="badge pill ${br(i.type)}">${i.message}</span>`:o``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,a,r){if(!this.field)return o``;this.loadUi5FieldComponents();const i=t;return o`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${i?.from??0}" end-value="${i?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${this.field.sliderMax??10}"
                                   step="${this.field.step||l}"
                                   @change="${s=>{const n=s.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{from:n.startValue,to:n.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}};Y.styles=$`
        ${kt}

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
  `;ue([b()],Y.prototype,"ui5FieldComponentsReady",2);ue([p()],Y.prototype,"component",2);ue([p()],Y.prototype,"field",2);ue([p()],Y.prototype,"baseUrl",2);ue([p()],Y.prototype,"state",2);ue([p()],Y.prototype,"data",2);ue([p()],Y.prototype,"appState",2);ue([p()],Y.prototype,"appData",2);ue([p()],Y.prototype,"labelAlreadyRendered",2);ue([b()],Y.prototype,"colorPickerOpened",2);ue([b()],Y.prototype,"colorPickerValue",2);ue([b()],Y.prototype,"filteredIcons",2);ue([b()],Y.prototype,"navLinkOffset",2);Y=ue([k("mateu-field")],Y);const gh=(e,t,a,r,i,s,n,d)=>{const c=t.metadata;return o`
        <mateu-field
                id="${t.id}"
                .component="${t}"
                .field="${t.metadata}"
                .state="${r}"
                .data="${i}"
                .appState="${s}"
                .appdata="${n}"
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??l}"
                data-colspan="${c.colspan}"
                colspan="${(c.colspan??1)>1?c.colspan:l}"
                .labelAlreadyRendered="${d}"
        >
            ${t.children?.map(u=>g(e,u,a,r,i,s,n,d))}
        </mateu-field>
    `},yh=(e,t,a,r,i,s,n)=>{const d=t.metadata;if(d.tree){const u=async(m,v)=>{const f=m.parentItem?m.parentItem.children:d.page.content;v(f,f.length)};return o`
        <vaadin-grid style="${t.style}" class="${t.cssClasses}"
                     .itemHasChildrenPath="${"children"}" .dataProvider="${u}"
                     slot="${t.slot??l}"
                     all-rows-visible
        >
            ${d.content.map((m,v)=>{const f=m.metadata;return v>0?o`
            <vaadin-grid-column path="${m.id}"
                                header="${f?.label??l}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??l}"
                                width="${f?.width??l}"
                                .column="${m.metadata}"
                                ${At((w,x,y)=>Wa(w,x,y,f,e,a,r,i,s,n),[])}></vaadin-grid-column>
`:o`
            <vaadin-grid-tree-column path="${m.id}"
                                header="${f?.label??l}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??l}"
                                width="${f?.width??l}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${Lt()}</span>
        </vaadin-grid>
    `}let c=d.page?.content;return t.id&&r&&r[t.id]&&(c=r[t.id]),c||(c=[]),o`
        <vaadin-grid 
                style="${t.style}" 
                class="${t.cssClasses}" 
                .items="${c}"
                all-rows-visible
        >
            ${d?.content?.map(u=>ei(u,e,a,r,i,s,n))}
        </vaadin-grid>
    `};var $h=Object.defineProperty,xh=Object.getOwnPropertyDescriptor,qe=(e,t,a,r)=>{for(var i=r>1?void 0:r?xh(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&$h(t,a,i),i};let ve=class extends C{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let r=!1;a&&a.content&&(a.content.length>=(e.page+1)*e.pageSize||a.content.length==a.totalElements)&&(t(a.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),a.totalElements),r=!0,this.grid&&this.grid.recalculateColumnWidths()),r||this.pagesRequested.find(i=>i==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{const r=this.metadata?.infiniteScrolling?a?.totalElements:a?.content?.length??0;t(a?.content??[],r),this.grid&&this.grid.recalculateColumnWidths()}},this._onActionRequested=e=>{const t=e.detail,a=this.identifierFieldName;if(!a||!t.parameters||t.actionId?.startsWith("action-on-row-"))return;const r=t.parameters[a];r!==void 0&&(this.state._selectedId=String(r),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t="";const{column:a,item:r}=e,i=this.metadata?.columns?.find(s=>s.metadata.id==a?.path);if(i?.metadata){const s=(i?.metadata).tooltipPath;s&&a&&r&&(t=r[s])}return t}}get identifierFieldName(){const e=this.metadata?.columns?.find(a=>a.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(a=>a.metadata?.id==="id"))return"id"}_applyCellPartNameGenerator(){if(!this.grid)return;const e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId,a=!!this.metadata?.groupBy;e&&t!==void 0||a?this.grid.cellPartNameGenerator=(r,i)=>{const s=i.item;return Ha(s)?"mateu-group-row":e&&t!==void 0&&String(s[e])===String(t)?"selected-row":""}:this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener("action-requested",this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("action-requested",this._onActionRequested)}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.requestContentUpdate(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}render(){const e=this.data[this.id],t=e?.page,a=this.metadata?.groupBy,r=this.metadata?.infiniteScrolling?void 0:t?.content?Np(t.content,a,e?.groups):t?.content,i=(this.metadata?.columns??[]).flatMap(c=>c.metadata?.type===h.GridGroupColumn?(c.metadata.columns??[]).map(u=>u.metadata):[c.metadata]),s=Bp(i,e,a);let n="";this.metadata?.wrapCellContent&&(n+=" wrap-cell-content"),this.metadata?.compact&&(n+=" compact"),this.metadata?.noBorder&&(n+=" no-border"),this.metadata?.noRowBorder&&(n+=" no-row-borders"),this.metadata?.columnBorders&&(n+=" column-borders"),this.metadata?.rowStripes&&(n+=" row-stripes");const d=this.state[this.id+"_selected_items"]||[];return o`
            <vaadin-grid
                    .items="${r}"
                    item-id-path="_rowNumber"
                    .selectedItems="${d}"
                    ?data-clickable-rows="${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?"lazy":l}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.metadata?.infiniteScrolling?this.dataProvider:void 0}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    @selected-items-changed="${c=>{const u=(c.detail.value??[]).filter(m=>!Ha(m));this.emptyArray(this.state[this.id+"_selected_items"])&&this.emptyArray(u)||(this.state[this.id+"_selected_items"]=u,this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0})))}}"
                    @active-item-changed="${E(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?c=>{if(this.metadata?.detailPath){const u=c.detail.value;if(u&&Ha(u))return;u?this.detailsOpenedItems=[u]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${E(this.metadata?.detailPath?Pi(c=>o`${g(this,c[this.metadata?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    theme="${n}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?o`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:l}
                ${this.metadata?.columns?.map(c=>ei(c,this,this.baseUrl,this.state,this.data,this.appState,this.appData,s))}
                ${this.metadata?.useButtonForDetail?o`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${At((c,{detailsOpened:u})=>o`
              <vaadin-button
                theme="tertiary icon"
                title="${u?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${u?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=u?this.detailsOpenedItems.filter(m=>m!==c):[...this.detailsOpenedItems,c]}}"
              >
                <vaadin-icon
                  .icon="${u?"lumo:angle-down":"lumo:angle-right"}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:l}
                <span slot="empty-state">${Lt(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(c=>c.metadata.tooltipPath)?o`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:l}
            </vaadin-grid>
            <slot></slot>
       `}};ve.styles=$`
        ${kt}
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
  `;qe([p()],ve.prototype,"id",2);qe([p()],ve.prototype,"metadata",2);qe([p()],ve.prototype,"baseUrl",2);qe([p()],ve.prototype,"state",2);qe([p()],ve.prototype,"data",2);qe([p()],ve.prototype,"appState",2);qe([p()],ve.prototype,"appData",2);qe([p()],ve.prototype,"emptyStateMessage",2);qe([b()],ve.prototype,"detailsOpenedItems",2);qe([de("vaadin-grid")],ve.prototype,"grid",2);ve=qe([k("mateu-table")],ve);const wh=(e,t,a,r,i,s,n)=>o`
    <mateu-table
            id="${t.id}"
            baseUrl="${a}"
            .metadata="${t.metadata}"
            .state="${r}"
            .data="${i}"
            .appState="${s}"
            .appDate="${n}"
            style="${t.style}" class="${t.cssClasses}"
            slot="${t.slot??l}"
    >
        ${t.children?.map(d=>g(e,d,a,r,i,s,n))}
    </mateu-table>`,kh=(e,t,a,r,i,s)=>o`
    <mateu-table id="${e.id}"
                 .metadata="${t?.metadata}"
                 .data="${e.data}"
                 .state="${r}"
                 .appState="${i}"
                 .appData="${s}"
                 .emptyStateMessage="${r[t?.id]?.emptyStateMessage}"
                 @sort-direction-changed="${e.directionChanged}"
                 @fetch-more-elements="${e.fetchMoreElements}"
                 baseUrl="${a}"
    ></mateu-table>`,Ch=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`
        <div id="show-notifications" slot="${t.slot??l}">${g(e,d.wrapped,a,r,i,s,n)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                ${Ti(()=>o`${g(e,d.content,a,r,i,s,n)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},_h=(e,t,a)=>{const r=e;return o`
        <vaadin-button
                data-action-id="${r.id}"
                theme="${Mi(e)||l}"
                @click="${a}"
                ?disabled="${r.disabled}"
        >${r.iconOnLeft?o`<vaadin-icon icon="${r.iconOnLeft}"></vaadin-icon>`:l}${t}${r.iconOnRight?o`<vaadin-icon icon="${r.iconOnRight}"></vaadin-icon>`:l}</vaadin-button>
    `},Ih=e=>o`
    <div style="display: flex; gap: var(--lumo-space-xs, .25rem); align-items: center;" class="peer-nav">
        <vaadin-button theme="tertiary icon" class="peer-nav-prev" title="${e.prevLabel??"Previous"}"
                ?disabled="${!e.prevRoute}"
                @click="${()=>{e.prevRoute&&(window.location.href=e.prevRoute)}}">
            <vaadin-icon icon="vaadin:angle-left"></vaadin-icon>
        </vaadin-button>
        <vaadin-button theme="tertiary icon" class="peer-nav-next" title="${e.nextLabel??"Next"}"
                ?disabled="${!e.nextRoute}"
                @click="${()=>{e.nextRoute&&(window.location.href=e.nextRoute)}}">
            <vaadin-icon icon="vaadin:angle-right"></vaadin-icon>
        </vaadin-button>
    </div>`,Sh=(e,t,a)=>o`<vaadin-icon icon="${e}" style="${t??l}" class="${a??l}"></vaadin-icon>`,Eh=(e,t,a)=>{const r=e.metadata,i=$e(r.label,t,a);let s="";return r.buttonStyle&&(s+=" "+r.buttonStyle),r.color&&r.color!=="none"&&r.color!=="normal"&&(s+=" "+r.color),r.size&&r.size!=="none"&&r.size!=="normal"&&(s+=" "+r.size),o`<vaadin-button
            id="${e.id}"
            data-action-id="${r.actionId}"
            @click="${n=>Qi(n,r)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${s}"
            ?disabled="${r.disabled}"
            title="${r.shortcut?`${i} (${Xi(r.shortcut)})`:l}"
            slot="${e.slot??l}"
    >${r.iconOnLeft?o`<vaadin-icon icon="${r.iconOnLeft}"></vaadin-icon>`:l}${i}${r.iconOnRight?o`<vaadin-icon icon="${r.iconOnRight}"></vaadin-icon>`:l}</vaadin-button>`},Ph=e=>{const t=e.metadata,a=r=>{const i=r.detail?.value??"";!t.actionId||!i.trim()||r.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:i}},bubbles:!0,composed:!0}))};return o`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??l}"
                @submit="${a}"
        ></vaadin-message-input>
    `},Th=e=>{const a=(e.metadata.items??[]).map(r=>({text:r.text,time:r.time,userName:r.userName,userImg:r.userImg,userAbbr:r.userAbbr,userColorIndex:r.userColorIndex}));return o`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??l}"
                .items="${a}"
        ></vaadin-message-list>
    `},zr=(e,t)=>{e&&e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},zh=(e,t,a,r,i,s,n)=>{const d=t.metadata;let c=!1;if(d.openedCondition)try{c=Nr(d.openedCondition,r,i,s,n)}catch(u){console.error("when evaluating "+d.openedCondition+" :"+u+", where data is "+i+" and state is "+r)}return o`
        <vaadin-confirm-dialog
                header="${d.header}"
                ?cancel-button-visible="${d.canCancel}"
                ?reject-button-visible="${d.canReject}"
                reject-text="${d.rejectText}"
                confirm-text="${d.confirmText}"
                .opened="${c}"
                @confirm="${u=>zr(u.currentTarget,d.confirmActionId)}"
                @reject="${u=>zr(u.currentTarget,d.rejectActionId)}"
                @cancel="${u=>zr(u.currentTarget,d.cancelActionId)}"
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??l}"
        >
            ${t.children?.map(u=>g(e,u,a,r,i,s,n))}
        </vaadin-confirm-dialog>
    `};var Oh=Object.defineProperty,Rh=Object.getOwnPropertyDescriptor,at=(e,t,a,r)=>{for(var i=r>1?void 0:r?Rh(t,a):t,s=e.length-1,n;s>=0;s--)(n=e[s])&&(i=(r?n(t,a,i):n(i))||i);return r&&i&&Oh(t,a,i),i};let Ie=class extends C{constructor(){super(...arguments),this.panels=[],this.headerTitle="",this.badges=[],this.navigation=null,this.overviewEditActionId="",this._raf=0,this._snapping=!1,this._less=!1,this._more=!1,this._onScroll=()=>{this._raf||(this._raf=requestAnimationFrame(()=>{this._raf=0,this._syncPin()}))},this._onScrollEnd=()=>{this._snapping||this._snapToNearest()},this._fit=()=>{const e=this.getBoundingClientRect().top;this.style.setProperty("--mateu-foldout-fill",`${Math.max(240,window.innerHeight-e)}px`),this._syncPin()},this._onKeydown=e=>{if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft"||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||this._isEditingContext())return;const t=this._rail;!t||t.scrollWidth<=t.clientWidth||(e.preventDefault(),this._step(e.key==="ArrowRight"?1:-1))}}navAction(e){e&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}_stride(){const e=this.renderRoot.querySelectorAll(".section");return e.length>1?e[1].offsetLeft:this._rail?.clientWidth??0}_snapToNearest(){const e=this._rail;if(!e)return;const t=this._stride();if(t<=0)return;const a=e.scrollWidth-e.clientWidth,r=Math.max(0,Math.min(Math.round(e.scrollLeft/t)*t,a));Math.abs(r-e.scrollLeft)<1||(this._snapping=!0,e.scrollTo({left:r,behavior:"smooth"}),window.setTimeout(()=>{this._snapping=!1},400))}_syncPin(){const e=this._rail,t=this._first;if(!e||!t)return;const a=this._stride(),r=Math.min(e.scrollLeft,a);t.style.transform=r?`translateX(${r}px)`:"",t.classList.toggle("floating",e.scrollLeft>0);const i=e.scrollWidth-e.clientWidth,s=i>2;this._less=s&&e.scrollLeft>2,this._more=s&&e.scrollLeft<i-2}_step(e){const t=this._rail;if(!t)return;const a=this._stride();if(a<=0)return;const r=Math.round(t.scrollLeft/a),i=t.scrollWidth-t.clientWidth,s=Math.max(0,Math.min((r+e)*a,i));this._snapping=!0,t.scrollTo({left:s,behavior:"smooth"}),window.setTimeout(()=>{this._snapping=!1},400)}_isEditingContext(){let e=document.activeElement;for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;if(!e)return!1;const t=e.tagName;return t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||e.isContentEditable}firstUpdated(){this._fit()}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onKeydown),window.addEventListener("resize",this._fit)}disconnectedCallback(){document.removeEventListener("keydown",this._onKeydown),window.removeEventListener("resize",this._fit),this._raf&&(cancelAnimationFrame(this._raf),this._raf=0),super.disconnectedCallback()}render(){const e=this.navigation,t=!!(this.overviewEditActionId||e&&(e.parentActionId||e.previousActionId||e.nextActionId)),a=!!(this.headerTitle||t||this.badges.length);return o`
            <div class="rail" part="rail" tabindex="0"
                 @scroll="${this._onScroll}" @scrollend="${this._onScrollEnd}">
                <section class="section section--first" part="section overview">
                    ${a?o`
                        <header class="section-head" part="section-head">
                            <div class="section-head-row">
                                ${this.headerTitle?o`<h2 class="section-title">${this.headerTitle}</h2>`:o`<span></span>`}
                                ${t?o`
                                    <div class="section-toolbar" part="section-toolbar">
                                        ${e?.parentActionId?o`
                                            <button class="tb-parent" title="${e.parentLabel??"Back"}"
                                                    @click="${()=>this.navAction(e.parentActionId)}">
                                                <span>‹</span><span>${e.parentLabel??"Back"}</span>
                                            </button>
                                        `:l}
                                        ${e?.previousActionId?o`
                                            <button class="tb-move" title="Previous"
                                                    @click="${()=>this.navAction(e.previousActionId)}">‹</button>
                                        `:l}
                                        ${e?.nextActionId?o`
                                            <button class="tb-move" title="Next"
                                                    @click="${()=>this.navAction(e.nextActionId)}">›</button>
                                        `:l}
                                        ${this.overviewEditActionId?o`
                                            <button class="tb-edit" title="Edit"
                                                    @click="${()=>this.navAction(this.overviewEditActionId)}">
                                                <span>✎</span><span>Edit</span>
                                            </button>
                                        `:l}
                                    </div>
                                `:l}
                            </div>
                            ${this.badges.length?o`
                                <div class="section-badges">
                                    ${this.badges.map(r=>o`<span class="section-badge">${r}</span>`)}
                                </div>
                            `:l}
                        </header>
                    `:l}
                    <div class="overview-body">
                        <slot name="overview"></slot>
                    </div>
                </section>
                ${this.panels.map((r,i)=>o`
                    <section class="section" part="section panel">
                        ${r.title||r.subtitle?o`
                            <div class="panel-header">
                                ${r.title?o`<h3>${r.title}</h3>`:l}
                                ${r.subtitle?o`<div class="subtitle">${r.subtitle}</div>`:l}
                            </div>
                        `:l}
                        <div class="panel-body">
                            <slot name="panel-${i}"></slot>
                        </div>
                    </section>
                `)}
            </div>
            ${this._less?o`
                <button class="scroll-nav left" part="scroll-nav-left" title="Scroll left"
                        aria-label="Scroll left" @click="${()=>this._step(-1)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 6 9 12 15 18"></polyline>
                    </svg>
                </button>
            `:l}
            ${this._more?o`
                <button class="scroll-nav right" part="scroll-nav-right" title="Scroll right"
                        aria-label="Scroll right" @click="${()=>this._step(1)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 6 15 12 9 18"></polyline>
                    </svg>
                </button>
            `:l}
        `}};Ie.styles=$`
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
            flex: 0 0 var(--mateu-foldout-section-width, 22rem);
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
    `;at([p({type:Array})],Ie.prototype,"panels",2);at([p({type:String})],Ie.prototype,"headerTitle",2);at([p({type:Array})],Ie.prototype,"badges",2);at([p({attribute:!1})],Ie.prototype,"navigation",2);at([p({type:String})],Ie.prototype,"overviewEditActionId",2);at([de(".rail")],Ie.prototype,"_rail",2);at([de(".section--first")],Ie.prototype,"_first",2);at([b()],Ie.prototype,"_less",2);at([b()],Ie.prototype,"_more",2);Ie=at([k("mateu-vaadin-foldout")],Ie);const Lh=(e,t,a,r,i,s,n)=>{const d=t.metadata;return o`
        <mateu-vaadin-foldout
                .panels="${d.panels??[]}"
                .headerTitle="${d.headerTitle??""}"
                .badges="${d.badges??[]}"
                .navigation="${d.navigation??null}"
                overviewEditActionId="${d.overviewEditActionId??""}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??l}"
        >
            ${t.children?.map(c=>g(e,c,a,r,i,s,n))}
        </mateu-vaadin-foldout>
    `},Ah={[h.VirtualList]:(e,t,a,r,i,s,n)=>rp(e,t,a,r,i,s,n),[h.Notification]:(e,t)=>ip(t),[h.ProgressBar]:(e,t,a,r)=>sp(t,r),[h.Details]:(e,t,a,r,i,s,n)=>op(e,t,a,r,i,s,n),[h.Avatar]:(e,t,a,r,i)=>np(t,r,i),[h.AvatarGroup]:(e,t)=>lp(t),[h.Card]:(e,t,a,r,i,s,n)=>dp(e,t,a,r,i,s,n),[h.Button]:(e,t,a,r,i)=>Eh(t,r,i),[h.MessageInput]:(e,t)=>Ph(t),[h.MessageList]:(e,t)=>Th(t),[h.ConfirmDialog]:(e,t,a,r,i,s,n)=>zh(e,t,a,r,i,s,n),[h.FormLayout]:(e,t,a,r,i,s,n)=>mp(e,t,a,r,i,s,n),[h.HorizontalLayout]:(e,t,a,r,i,s,n)=>bp(e,t,a,r,i,s,n),[h.VerticalLayout]:(e,t,a,r,i,s,n)=>gp(e,t,a,r,i,s,n),[h.SplitLayout]:(e,t,a,r,i,s,n)=>yp(e,t,a,r,i,s,n),[h.MasterDetailLayout]:(e,t,a,r,i,s,n)=>$p(e,t,a,r,i,s,n),[h.TabLayout]:(e,t,a,r,i,s,n)=>xp(e,t,a,r,i,s,n),[h.AccordionLayout]:(e,t,a,r,i,s,n)=>kp(e,t,a,r,i,s,n),[h.BoardLayout]:(e,t,a,r,i,s,n)=>Ip(e,t,a,r,i,s,n),[h.BoardLayoutRow]:(e,t,a,r,i,s,n)=>Sp(e,t,a,r,i,s,n),[h.BoardLayoutItem]:(e,t,a,r,i,s,n)=>Ep(e,t,a,r,i,s,n),[h.Scroller]:(e,t,a,r,i,s,n)=>_p(e,t,a,r,i,s,n),[h.MenuBar]:(e,t,a,r,i)=>Tp(e,t,a,r,i),[h.ContextMenu]:(e,t,a,r,i,s,n)=>Pp(e,t,a,r,i,s,n),[h.FormField]:(e,t,a,r,i,s,n,d)=>gh(e,t,a,r,i,s,n,d),[h.Grid]:(e,t,a,r,i,s,n)=>yh(e,t,a,r,i,s,n),[h.Table]:(e,t,a,r,i,s,n)=>wh(e,t,a,r,i,s,n),[h.Popover]:(e,t,a,r,i,s,n)=>Ch(e,t,a,r,i,s,n),[h.FoldoutLayout]:(e,t,a,r,i,s,n)=>Lh(e,t,a,r,i,s,n)};class Dh extends ap{rendererName(){return"vaadin"}renderClientSideComponent(t,a,r,i,s,n,d,c){const u=a?.metadata?.type,m=u?Ah[u]:void 0;return m&&a?m(t,a,r,i,s,n,d,c):super.renderClientSideComponent(t,a,r,i,s,n,d,c)}renderTableComponent(t,a,r,i,s,n,d){return kh(t,a,r,i,n,d)}renderToolbarButton(t,a,r){return _h(t,a,r)}renderPeerNav(t){return Ih(t)}renderIcon(t,a,r){return Sh(t,a,r)}}function Ds(e){switch(e){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"}function Fh(e,t){const a=new Ga;a.position=Ds(e.position),a.duration=e.duration??1e4,e.variant&&a.setAttribute("theme",e.variant),a.renderer=r=>{if(r.firstElementChild)return;const i=document.createElement("span");i.textContent=e.text;const s=document.createElement("button");s.textContent=e.undoLabel??"Undo",s.style.cssText="margin-left: 0.75rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;",s.addEventListener("click",()=>{t.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0})),a.opened=!1}),r.append(i,s)},document.body.appendChild(a),a.opened=!0,a.addEventListener("opened-changed",r=>{r.detail.value||a.remove()})}const qh={show(e,t){if(e.undoActionId){Fh(e,t);return}Ga.show(e.text,{position:e.position?Ds(e.position):"bottom-end",theme:e.variant,duration:e.duration})}};B.set(new Dh);ms(qh);
