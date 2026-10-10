const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-diagrams.js","assets/vendor.js","assets/vendor-ui5.js","assets/vendor-vaadin.js","assets/vendor-lit.js"])))=>i.map(i=>d[i]);
import{r as hc,f as pc,m as mc,o as fc,a as vc,l as Mn,u as gc,_ as ee,v as bc,n as yc,c as ht,b as $c,d as wc,e as Nn,g as cs,N as ai,h as Ki,p as Fn,i as xc}from"./vendor-vaadin.js";import{a as k,j as h,k as fe,i as I,x as n,m as _,p as qn,A as d,q as b,l as M,e as kc,g as _c,h as Sc,r as Ls,b as me,D as Bn,s as Cc}from"./vendor-lit.js";import{S as Ec,a as Ic,n as Ne,p as Tc,b as Ac}from"./vendor.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function a(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=a(i);fetch(i.href,s)}})();hc("vaadin-card",k`
      :host(.mateu-section) {
        --vaadin-card-border-width: 0 !important;
        --vaadin-card-background: transparent !important;
        --vaadin-card-shadow: none !important;
        --vaadin-card-padding: 0 !important;
      }
    `);const Un=document.createElement("style");Un.innerHTML=`
${pc.cssText}
${mc.cssText}
${fc.cssText}
${vc.cssText}
${Mn}
${gc}
`;document.body.appendChild(Un);function Pc(e,t){const a=t.split(",").map(o=>o.trim()),r=o=>a.map(l=>l+o).join(","),i=[`${r("")}{color-scheme:light dark}`],s=(o,l)=>{const c=new RegExp(o.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\s*\\{([^}]*)\\}","g");let u;for(;(u=c.exec(e))!==null;){const p=u[1].trim();p&&i.push(`${r(l)}{${p}}`)}};return s(":where(:host),:where(:root)",""),s(":host,:root",""),s(":host([theme~=dark]),[theme~=dark]","[theme~=dark]"),s(":host([theme~=light-dark]),[theme~=light-dark]","[theme~=light-dark]"),i.join(`
`)}const Ds=document.createElement("style");Ds.setAttribute("data-mateu-theme-scope","");Ds.textContent=Pc(Mn,"mateu-ui,mateu-ux");document.head.appendChild(Ds);{const e=window.Vaadin;e&&((e.featureFlags??={}).masterDetailLayoutComponent=!0)}const Fa=new Ec,pe={value:{}},ba={value:{}};function Oc(e){let t="";for(const a of e)switch(a){case'"':t+='\\"';break;case"\\":t+="\\\\";break;case`
`:t+="\\n";break;case"\r":t+="\\r";break;case"	":t+="\\t";break;case"\b":t+="\\b";break;case"\f":t+="\\f";break;default:t+=a<" "?"\\u"+a.charCodeAt(0).toString(16).padStart(4,"0"):a}return t}function ri(e){if(typeof e=="string")return Oc(e);if(Array.isArray(e))return e.map(ri);if(e&&typeof e=="object"){const t={};for(const[a,r]of Object.entries(e))t[a]=ri(r);return t}return e}function Rc(e){return e?Object.entries(e).some(([t,a])=>t.toLowerCase()==="content-type"&&(a??"").toLowerCase().includes("json")):!1}let jn=[];const Hn=e=>{jn=Array.isArray(e)?e:[]},Ms=e=>e?jn.find(t=>t.name===e):void 0,Da=e=>e==null||e==="",Xa=e=>{if(!e?.ref)return e;const t=Ms(e.ref);if(!t?.source)return console.warn(`mateu: no REST source named "${e.ref}" in the app's catalogue`),e;const a=t.source;return{...e,url:Da(e.url)?a.url:e.url,method:Da(e.method)?a.method:e.method,headers:e.headers&&Object.keys(e.headers).length>0?e.headers:a.headers,body:Da(e.body)?a.body:e.body,itemsPath:Da(e.itemsPath)?a.itemsPath:e.itemsPath,valuePath:Da(e.valuePath)?a.valuePath:e.valuePath,labelPath:Da(e.labelPath)?a.labelPath:e.labelPath,proxy:e.proxy||a.proxy}},Wn=(e,t)=>{const r=Ms(e?.ref)?.fields?.[t];return r&&r!==""?r:t},Vn=e=>Ms(e?.ref)?.totalPath||void 0,Mt=k`
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
`,Ta=k`
    :where(a:any-link) {
        color: var(--mateu-link-color, var(--lumo-primary-text-color, #1676f3));
    }
`,zc={lon:0,lat:0},xo=3,Lc=e=>{if(!e)return;const t=e.split(",").map(i=>i.trim());if(t.length!==2)return;const a=Number(t[0]),r=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(a)||!Number.isFinite(r)))return{lon:r,lat:a}},Yi=e=>{if(e==null||e.trim()==="")return xo;const t=Number(e);return Number.isFinite(t)?t:xo},Dc=15,Mc=(e,t,a)=>{const r=Lc(e);if(r)return{kind:"center",center:r,zoom:Yi(t)};const i=(a??[]).filter(s=>Number.isFinite(s.latitude)&&Number.isFinite(s.longitude));if(i.length===1){const s=t!=null&&t.trim()!=="";return{kind:"center",center:{lat:i[0].latitude,lon:i[0].longitude},zoom:s?Yi(t):Dc}}return i.length>1?{kind:"fit",min:{lat:Math.min(...i.map(s=>s.latitude)),lon:Math.min(...i.map(s=>s.longitude))},max:{lat:Math.max(...i.map(s=>s.latitude)),lon:Math.max(...i.map(s=>s.longitude))}}:{kind:"center",center:zc,zoom:Yi(t)}};var Nc=Object.defineProperty,Fc=Object.getOwnPropertyDescriptor,Qa=(e,t,a,r)=>{for(var i=r>1?void 0:r?Fc(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Nc(t,a,i),i};const qc="#c74634";let Yt=class extends I{constructor(){super(...arguments),this.markers=[],this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:a},{default:r},{default:i},{fromLonLat:s,transformExtent:o},{default:l},{default:c},{default:u},{default:p},{default:m},{default:f},{default:g},{default:y},{default:$},{default:w}]=await Promise.all([ee(()=>import("./vendor-ol.js").then(S=>S.M),[]),ee(()=>import("./vendor-ol.js").then(S=>S.V),[]),ee(()=>import("./vendor-ol.js").then(S=>S.e),[]),ee(()=>import("./vendor-ol.js").then(S=>S.O),[]),ee(()=>import("./vendor-ol.js").then(S=>S.p),[]),ee(()=>import("./vendor-ol.js").then(S=>S.c),[]),ee(()=>import("./vendor-ol.js").then(S=>S.d),[]),ee(()=>import("./vendor-ol.js").then(S=>S.F),[]),ee(()=>import("./vendor-ol.js").then(S=>S.P),[]),ee(()=>import("./vendor-ol.js").then(S=>S.b),[]),ee(()=>import("./vendor-ol.js").then(S=>S.C),[]),ee(()=>import("./vendor-ol.js").then(S=>S.a),[]),ee(()=>import("./vendor-ol.js").then(S=>S.S),[]),ee(()=>import("./vendor-ol.js").then(S=>S.T),[]),ee(()=>import("./vendor-ol.js").then(S=>S.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const S=document.createElement("style");S.setAttribute("data-ol",""),S.textContent=w,this.shadowRoot.appendChild(S)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const C=this.markers??[],E=C.map(S=>{const z=new u({geometry:new p(s([S.longitude,S.latitude]))});return z.setId(S.id),z.set("marker",S),z.setStyle(new m({image:new f({radius:8,fill:new g({color:S.color||qc}),stroke:new y({color:"#ffffff",width:2})}),text:S.label?new $({text:S.label,offsetX:12,textAlign:"left",font:"600 13px system-ui, sans-serif",fill:new g({color:"#1a1a1a"}),stroke:new y({color:"#ffffff",width:3})}):void 0})),z}),A=Mc(this.position,this.zoom,C),P=A.kind==="center"?new a({center:s([A.center.lon,A.center.lat]),zoom:A.zoom}):new a({center:s([0,0]),zoom:2});this.map=new t({target:this.mapElement,layers:[new r({source:new i}),new l({source:new c({features:E})})],view:P}),A.kind==="fit"&&P.fit(o([A.min.lon,A.min.lat,A.max.lon,A.max.lat],"EPSG:4326","EPSG:3857"),{padding:[48,160,48,48],maxZoom:16});const R=this.map,O=S=>R.forEachFeatureAtPixel(S,z=>z.get("marker"));R.on("pointermove",S=>{const z=O(S.pixel);this.mapElement.style.cursor=z&&this.markerActionId?"pointer":"",this.mapElement.title=z?[z.label,z.description].filter(Boolean).join(`
`):""}),R.on("singleclick",S=>{const z=O(S.pixel);!z||!this.markerActionId||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.markerActionId,parameters:{_markerId:z.id}},bubbles:!0,composed:!0}))})}render(){return n`<div id="map"></div>`}};Yt.styles=k`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;Qa([h()],Yt.prototype,"position",2);Qa([h()],Yt.prototype,"zoom",2);Qa([h({attribute:!1})],Yt.prototype,"markers",2);Qa([h()],Yt.prototype,"markerActionId",2);Qa([fe("#map")],Yt.prototype,"mapElement",2);Yt=Qa([_("mateu-map")],Yt);const Bc=typeof HTMLElement<"u"?HTMLElement:class{};class Uc extends Bc{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#a()}attributeChangedCallback(t,a,r){this.content=r??void 0}connectedCallback(){this.style.display="block",this.#a()}async#a(){if(!this.isConnected)return;const t=this.#e??"",a=++this.#t,[{marked:r},{default:i}]=await Promise.all([ee(()=>import("./vendor.js").then(s=>s.m),[]),ee(()=>import("./vendor.js").then(s=>s.c),[])]);a===this.#t&&(this.innerHTML=i.sanitize(await r.parse(t),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:s=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",Uc);var re=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(re||{}),v=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Drawer="Drawer",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.ResponsiveGrid="ResponsiveGrid",e.FoldoutLayout="FoldoutLayout",e.ContentLayout="ContentLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e.PlanningBoard="PlanningBoard",e.Kanban="Kanban",e.Timeline="Timeline",e.ProgressSteps="ProgressSteps",e.Stat="Stat",e.Calendar="Calendar",e.PricingTable="PricingTable",e.OrgChart="OrgChart",e.Heatmap="Heatmap",e.Funnel="Funnel",e.TrendChart="TrendChart",e.FeatureGrid="FeatureGrid",e.Testimonials="Testimonials",e.Faq="Faq",e.CalloutCard="CalloutCard",e.CommentThread="CommentThread",e.FileList="FileList",e.Checklist="Checklist",e.ComparisonCard="ComparisonCard",e.EntityHeader="EntityHeader",e.Meter="Meter",e.TaskProgress="TaskProgress",e.StatusList="StatusList",e.BulletedList="BulletedList",e.ActionPanel="ActionPanel",e.MatrixGrid="MatrixGrid",e.DropZone="DropZone",e.Separator="Separator",e.CustomComponent="CustomComponent",e.Notice="Notice",e.TaskQueue="TaskQueue",e.ResourceGrid="ResourceGrid",e.OfferCard="OfferCard",e.AddOnPicker="AddOnPicker",e.Ledger="Ledger",e.PaymentPicker="PaymentPicker",e.ProcessMonitor="ProcessMonitor",e.NotFound="NotFound",e))(v||{}),Xe=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.HAMBURGER_MENU="HAMBURGER_MENU",e.HAMBURGER_SECTIONS="HAMBURGER_SECTIONS",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(Xe||{});const Ns="mateu-app-context",Gn="mateu-app-context-labels",Kn=e=>{try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}},ko=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},Fs=()=>Kn(Ns),Yn=()=>Kn(Gn),jc=(e,t,a)=>{const r=Fs(),i=Yn();t==null||t===""?(delete r[e],delete i[e]):(r[e]=t,a!==void 0&&(i[e]=a)),ko(Ns,r),ko(Gn,i)};let _o=!1;const Hc=()=>{_o||(_o=!0,window.addEventListener("storage",e=>{e.key===Ns&&e.newValue!==e.oldValue&&window.location.reload()}))},Jn=(e,t)=>new Promise((a,r)=>{let i=!1;const s={retry:()=>{i||(i=!0,t().then(a,r))},giveUp:()=>{i||(i=!0,r(e))}},o=new CustomEvent("mateu-session-expired",{detail:s,cancelable:!0,bubbles:!1});typeof document<"u"&&!document.dispatchEvent(o)||s.giveUp()}),Wc=(e,t)=>e.includes("json")?!0:t!==null&&typeof t=="object",Vc=(e,t)=>{const a=e.finalUrl;if(!a)return;const r=typeof window<"u"?window.location.href:void 0;let i;try{i=new URL(e.requestedUrl,r).href}catch{return}if(i!==a&&!Wc(e.contentType??"",e.data))return a};class Gc{constructor(){this.windowMs=4e3,this.threshold=12,this.events=[],this.reported=new Set}check(t,a=Date.now()){this.events.push({sig:t,t:a});const r=a-this.windowMs;this.events=this.events.filter(s=>s.t>=r);let i=0;for(const s of this.events)s.sig===t&&i++;if(i>=this.threshold){const s=!this.reported.has(t);return this.reported.add(t),{blocked:!0,firstTrip:s}}return this.reported.delete(t),{blocked:!1,firstTrip:!1}}reset(){this.events=[],this.reported.clear()}configure(t){t.windowMs!==void 0&&(this.windowMs=t.windowMs),t.threshold!==void 0&&(this.threshold=t.threshold)}}const Kc=new Gc;var Kt=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(Kt||{});let Xn=[];const Yc=e=>{Xn=Array.isArray(e)?e:[]},Jc=e=>e?Xn.find(t=>t.name===e)?.component:void 0,Qn=new Set(["id","style","cssClasses","slot","initialData","confirmOnNavigationIfDirty","sizing"]),Xc=new Set(["Form","FormLayout","VerticalLayout","HorizontalLayout","Div","FlexLayout","CustomComponent"]),Qc=new Set(["Card"]),Zc=new Set(["Listing","Crudl","Crud"]);function ii(e){const{note:t,...a}=e;if(Zc.has(a.type))return eu(a);if(a.type==="ComponentRef"){const p=Jc(a.ref);return p||{type:re.ClientSide,metadata:{type:"Text",text:`Unknown business component: ${a.ref}`},children:[]}}const{type:r,content:i,children:s,...o}=a,l={},c={type:r};for(const[p,m]of Object.entries(o))Qn.has(p)?l[p]=m:(p==="toolbar"||p==="buttons")&&Array.isArray(m)?c[p]=m.map(Zn):c[p]=m;r==="FormField"&&(o.id!==void 0&&(c.fieldId=o.id),delete c.id,c.dataType=c.dataType??"string",c.stereotype=c.stereotype??"regular");let u=[];if(Xc.has(r)){const p=i??s??[];u=Array.isArray(p)?p:[p]}else Qc.has(r)&&i&&typeof i=="object"&&!Array.isArray(i)&&(c.content=ii(i));return{...l,type:re.ClientSide,metadata:c,children:u.map(ii)}}function eu(e){const{type:t,content:a,children:r,...i}=e,s={id:"crud",sizing:"fill"},o={type:"Crud",crudlType:i.crudlType??i.listingType??"table",pageSize:10,searchOnEnter:!0,autoFocusOnSearchText:!0,filtersLayout:"auto",gridLayout:"auto"};for(const[l,c]of Object.entries(i))l==="crudlType"||l==="listingType"||(Qn.has(l)?s[l]=c:l==="columns"&&Array.isArray(c)?o[l]=c.map(tu):l==="toolbar"&&Array.isArray(c)?o[l]=c.map(Zn):l==="filters"&&Array.isArray(c)?o[l]=c.map(ru):o[l]=c);return{...s,type:re.ClientSide,metadata:o,children:[]}}function tu(e){const t=ii(e);return e.id!==void 0&&t.metadata&&(t.metadata.id=e.id),t}const au=e=>e.replace(/[^\p{L}\p{N}]+/gu," ").trim().split(/\s+/).filter(Boolean).map((a,r)=>r===0?a.charAt(0).toLowerCase()+a.slice(1):a.charAt(0).toUpperCase()+a.slice(1)).join("");function Zn(e){if(!e||e.type!=="Button")return e;const{actionable:t,...a}=e,r={...a};return t?.type==="RouteLink"&&t.route&&(r.route=t.route),!r.actionId&&typeof r.label=="string"&&(r.actionId=au(r.label)),r}function ru(e){if(!e||e.type!=="FormField")return e;const{id:t,...a}=e;return{...a,fieldId:a.fieldId??t,dataType:a.dataType??"string",stereotype:a.stereotype??"regular"}}const si="ux_main";function iu(e){return!!!(e.viewModel??e.modelView)&&!!el(e)}function el(e){if(e.layout&&typeof e.layout=="object")return e.layout;if(typeof e.type=="string")return e}function su(e,t,a,r={}){const i=el(e);if(!i)throw new Error(`Definition for route "${t}" has no layout to expand`);if(i.type==="AppShell")return lu(i);const s=typeof i.title=="string"?i.title:t,o=ii(i);return{commands:[{targetComponentId:si,type:"SetWindowTitle",data:s}],messages:[],fragments:[{targetComponentId:si,component:nu(e,o,r),data:void 0,state:void 0,action:Kt.Replace,containerId:void 0}],banners:[],appendBanners:!1,appData:void 0,appState:void 0}}function ou(e){return e.ref?{ref:e.ref}:Object.fromEntries(Object.entries(e).filter(([,t])=>t!=null))}function nu(e,t,a){const r=[...e.actions??[]],i=[...e.triggers??[]];if(a.data&&(a.data.ref||a.data.url)&&(r.push({id:"__restdata__",restAction:{source:ou(a.data),resultPath:""}}),i.push({type:"OnLoad",actionId:"__restdata__",times:1})),!r.length&&!i.length)return t;const s=a.path??"";return{type:re.ServerSide,id:"page_"+(s||"root").replace(/[^A-Za-z0-9_-]/g,"_"),serverSideType:void 0,route:"/"+s,initialData:{},actions:r,triggers:i,rules:[],validations:[],children:[t]}}function tl(e){const a="/"+(typeof e.route=="string"&&e.route?e.route:typeof e.path=="string"?e.path:"").replace(/^\/+/,""),r=e.submenu??e.submenus??e.menu;return{label:e.label,icon:e.icon,path:a,route:a,consumedRoute:"",uriPrefix:"",visible:!e.hidden,selected:!1,disabled:!1,separator:e.type==="MenuSeparator",remote:!1,rules:[],submenus:Array.isArray(r)?r.map(tl):[]}}function al(e){for(const t of e){if(t.type==="RouteLink"&&(t.route||t.path))return t.route??t.path;const a=t.submenu??t.submenus??t.menu;if(Array.isArray(a)){const r=al(a);if(r)return r}}}function lu(e){const t=e.menu??[];return{commands:[{targetComponentId:si,type:"SetWindowTitle",data:e.title??""}],messages:[],fragments:[{targetComponentId:si,component:{type:re.ClientSide,id:"app",metadata:{type:"App",route:"",rootRoute:"",variant:e.variant??"MENU_ON_TOP",layout:"SINGLE_SLOT",title:e.title,subtitle:e.subtitle,logo:e.logo,favicon:e.favicon,themeToggle:!!e.themeToggle,accentColor:typeof e.accentColor=="string"&&e.accentColor.trim()?e.accentColor.trim():void 0,menu:t.map(tl),totalMenuOptions:t.length,homeRoute:al(t)??"",homeConsumedRoute:"",homeBaseUrl:"",apps:[],fabs:[],contextSelectors:[],contextActions:[]},children:[]},data:void 0,state:void 0,action:Kt.Replace,containerId:void 0}],banners:[],appendBanners:!1,appData:void 0,appState:void 0}}let oi,us=new Map,qs=[],hs,rl=[],il=[],Bs={};const So=e=>e.split("/").filter(t=>t.startsWith(":")&&t.length>1).map(t=>t.substring(1)),Us=e=>{const t=s=>s.replace(/^\/+/,"").replace(/\/+$/,""),a=t(e==="_no_route"?"":e),r=a===""?[]:a.split("/");let i;for(const s of rl){const o=t(s.route??""),l=o===""?[]:o.split("/");if(l.length!==r.length)continue;const c={};let u=!0;for(let m=0;m<l.length;m++){const f=l[m];if(f.startsWith(":")&&f.length>1)c[f.substring(1)]=r[m];else if(f!==r[m]){u=!1;break}}if(!u)continue;const p={entry:s,pathParams:c};(!i||So(o).length<So(t(i.entry.route??"")).length)&&(i=p)}return i},Pi=(e,t)=>{const a=Us(e);if(!a)return t;const{entry:r,pathParams:i}=a,s=r.defaultParams??{},o=r.fixedParams??{};return!Object.keys(s).length&&!Object.keys(o).length&&!Object.keys(i).length?t:{...t,fragments:(t.fragments??[]).map(l=>({...l,state:{...s,...l.state??{},...i,...o},data:{...s,...l.data??{},...i,...o}}))}},du=e=>{const t=e&&e.startsWith("/")?e.substring(1):e??"";return t===""?"_no_route":t};function cu(e,t=fetch){return hs=(async()=>{try{const a=await t(e);if(!a.ok)return;const r=await a.json(),i=new Map,s=new Map,o=[];for(const l of r.entries??[])if(!(!l.ok||!l.json))try{const c=JSON.parse(l.json),u=l.contentJson?JSON.parse(l.contentJson):void 0;l.routePattern?o.push({regex:new RegExp(l.routePattern),paramNames:l.paramNames??[],increment:c,content:u}):(i.set(l.syncPath,c),u&&s.set(l.syncPath,u))}catch(c){console.warn("mateu: bundle entry parse failed for",l.syncPath,c)}oi=i,us=s,qs=o,rl=r.routes?.routes??[],Bs=r.definitions??{},il=r.sources?.sources??[],Hn(r.sources?.sources)}catch(a){console.warn("mateu: bundle manifest load failed",a)}})(),hs}const uu=()=>hs??Promise.resolve(),hu=()=>oi!==void 0&&oi.size>0||qs.length>0||Object.keys(Bs).length>0,Co=e=>{const t=oi?.get(e);return t===void 0?void 0:Pi(e,t)},Eo=(e,t=!1)=>{for(const a of qs){const r=a.regex.exec(e);if(!r)continue;const i=t?a.content:a.increment;if(!i)return;const s={};a.paramNames.forEach((l,c)=>{s[l]=r[c+1]});const o={...i,fragments:(i.fragments??[]).map(l=>({...l,component:pu(l.component,s),state:{...l.state??{},...s},data:{...l.data??{},...s}}))};return Pi(e,o)}},pu=(e,t)=>{const a=e;return!a||!a.initialData||typeof a.initialData!="object"?e:{...a,initialData:{...a.initialData,...t}}},Io=e=>{const t=Us(e),a=t?.entry.definition;if(!a)return;const r=Bs[a];if(!r||!iu(r))return;const i=su(r,t.entry.route,void 0,{data:t.entry.data??void 0,path:e==="_no_route"?"":e});return Pi(e,{...i,fragments:(i.fragments??[]).map(s=>{const o=Zr({fragments:[s]}),l=o?{...s.component,metadata:{...o,restSources:il}}:s.component;return{...s,component:l,targetComponentId:void 0}})})},Zr=e=>{const t=e?.fragments?.[0]?.component;return t?.metadata?.type==="App"?t.metadata:void 0},To=(e,t)=>{if(t==="_no_route")return e;const[a,...r]=e.fragments??[],i=a.component;return{...e,fragments:[{...a,component:{...i,metadata:{...i.metadata,homeRoute:"/"+t}}},...r]}},mu=(e,t)=>{const a=t===void 0||t==="_empty",r=()=>Co(e)??Eo(e)??Io(e);if(a){const o=r();if(o&&Zr(o))return To(o,e);if(e!=="_no_route"&&(Us(e)||!o)){const l=Co("_no_route")??Io("_no_route");if(l&&Zr(l))return To(l,e)}return o}const i=us.get(e)!==void 0?Pi(e,us.get(e)):Eo(e,!0);if(i)return i;const s=r();return s&&Zr(s)?void 0:s},fu={en:{chat:"Assistant",openChat:"Open the assistant",closeChat:"Close the assistant",darkMode:"Switch to dark mode",lightMode:"Switch to light mode",expandChat:"Expand",collapseChat:"Restore size",chatEmpty:"Ask whatever you need: about this screen, your data or how to do something.",chatPlaceholder:"Write a message…",send:"Send",sections:"Sections",confirmTitle:"One moment, please",confirmMessage:"Are you sure?",confirmYes:"Yes",confirmNo:"No",forbidden:"You are not allowed to do this.",notFound:"Not found",notFoundMessage:"It may have been deleted, or the link is wrong.",goBack:"Go back"},es:{chat:"Asistente",openChat:"Abrir el asistente",closeChat:"Cerrar el asistente",darkMode:"Cambiar a modo oscuro",lightMode:"Cambiar a modo claro",expandChat:"Ampliar",collapseChat:"Tamaño normal",chatEmpty:"Pregunta lo que necesites: sobre esta pantalla, tus datos o cómo hacer algo.",chatPlaceholder:"Escribe un mensaje…",send:"Enviar",sections:"Secciones",confirmTitle:"Un momento",confirmMessage:"¿Seguro?",confirmYes:"Sí",confirmNo:"No",forbidden:"No tienes permiso para esta acción.",notFound:"No encontrado",notFoundMessage:"Puede que se haya borrado o que el enlace no sea correcto.",goBack:"Volver"}},sl=e=>(typeof document<"u"&&document.documentElement?.lang||typeof navigator<"u"&&navigator.language||"").toLowerCase().startsWith("es")?"es":"en",Pe=(e,t)=>fu[sl()][e],vu={offline:()=>"No connection. Your changes have not been sent — check your network and try again.",timeout:()=>"The server is taking too long to answer. Your changes may not have been saved.",server:e=>`The server could not complete the request${e?` (error ${e})`:""}. Please try again.`,unauthorized:()=>"Your session is no longer valid. Please sign in again.",forbidden:()=>Pe("forbidden"),notFound:()=>"This is no longer available. It may have been moved or deleted.",client:e=>`The request was rejected${e?` (error ${e})`:""}.`,cancelled:()=>"",unknown:()=>"Something went wrong. Please try again."},gu=new Set(["offline","timeout","server"]),ps=(e,t={})=>{const a=e??{},r=a.response?.status,i=a.code,s=t.online??(typeof navigator<"u"&&typeof navigator.onLine=="boolean"?navigator.onLine:!0),o=l=>({kind:l,message:vu[l](r),retryable:gu.has(l),status:r});return i==="ERR_CANCELED"?o("cancelled"):i==="ECONNABORTED"||i==="ETIMEDOUT"||/timeout/i.test(a.message??"")?o("timeout"):r===void 0?!s||i==="ERR_NETWORK"||/network error/i.test(a.message??"")?o("offline"):o("unknown"):r===401?o("unauthorized"):r===403?o("forbidden"):r===404||r===410?o("notFound"):r===408||r===429?o("timeout"):r>=500?o("server"):r>=400?o("client"):o("unknown")},bu=e=>e.kind!=="forbidden",yu=new Set(["","__load__","search","_globalsearch","_notifications-list"]),$u=["_appcontext-search-","search-"],ol=(e,t)=>t===!0?!0:e==null?!1:yu.has(e)?!0:$u.some(a=>e.startsWith(a)),wu=2,xu=(e,t=Math.random)=>{const a=300*Math.pow(3,Math.max(0,e-1));return Math.round(a*(.75+t()*.5))},ku=(e,t,a)=>!a.idempotent||t>wu||!e.retryable?!1:e.kind==="timeout"||e.kind==="server";class _u{constructor(){this.linkUp=!0,this.listeners=new Set,this.waiters=new Set,this.started=!1}start(){this.started||typeof window>"u"||(this.started=!0,this.linkUp=typeof navigator<"u"&&typeof navigator.onLine=="boolean"?navigator.onLine:!0,window.addEventListener("online",()=>{this.linkUp=!0,this.reachable=void 0,this.changed(),this.releaseWaiters()}),window.addEventListener("offline",()=>{this.linkUp=!1,this.changed()}))}isOnline(){return this.linkUp?this.reachable!==!1:!1}noteReachable(){const t=this.isOnline();this.reachable=!0,t||(this.changed(),this.releaseWaiters())}noteUnreachable(){const t=this.isOnline();this.reachable=!1,t&&this.changed()}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}whenBack(t){return this.isOnline()?(t(),()=>{}):(this.waiters.add(t),()=>this.waiters.delete(t))}reset(){this.linkUp=!0,this.reachable=void 0,this.waiters.clear()}changed(){const t=this.isOnline();this.listeners.forEach(a=>a(t))}releaseWaiters(){const t=Array.from(this.waiters);this.waiters.clear(),t.forEach(a=>a())}}const Vt=new _u;Vt.start();const ms="/mateu/v3/client-log",Tt={message:1e3,detail:1e3,stack:4e3,url:1e3,pageUrl:1e3,source:500,route:500,actionId:200,userAgent:300},Su=14e3,Cu=/^(code|state|session_state|token|access_token|id_token|refresh_token|auth|password)$/i,At=(e,t)=>{if(e==null)return;const a=String(e);return a.length>t?a.slice(0,t)+"…":a},Eu=e=>{try{return decodeURIComponent(e)}catch{return e}},Ao=e=>{if(!e)return e;const t=String(e).split("#")[0],a=t.indexOf("?");if(a<0)return t;const r=t.slice(a+1).split("&").map(i=>{const s=i.indexOf("="),o=s<0?i:i.slice(0,s);return Cu.test(Eu(o))?`${o}=***`:i});return t.slice(0,a+1)+r.join("&")},Iu=e=>{if(!e)return;const t=/\/mateu\/v3\/(?:sync|sse)\/([^?#]*)/.exec(e);if(t)return t[1]==="_no_route"?"":"/"+t[1]},Tu=e=>!(e==null||e===0||e===204||e===401||e===403||e===413||e===429||e>=502),Au=(e,t)=>{const a=e??"";return/^https?:\/\//i.test(a)&&(!t||a.indexOf(t)!==0)?null:a.replace(/\/+$/,"")+ms},Pu=e=>{const t=e.renderer??"vaadin",a=e.now??(()=>Date.now()),r=e.schedule??((O,S)=>setTimeout(O,S)),i=e.cancel??(O=>clearTimeout(O)),s=e.dedupeWindowMs??6e4,o=e.batchDelayMs??2e3,l=e.maxPerMinute??20,c=e.endpoint??(()=>ms),u=new Map;let p=[],m=0,f=!1,g=null,y=1/0;const $=O=>[O.kind,O.status,O.message,O.url,O.actionId,(O.stack??"").split(`
`)[0]].join("|"),w=O=>{const S=a()+Math.max(0,O);g!==null&&S>=y||(g!==null&&i(g),y=S,g=r(()=>{g=null,y=1/0,R(!1)},Math.max(0,O)))},C=O=>{try{if(f||!O||O.kind==="cancelled")return;const S=O.url?String(O.url):void 0;if(S&&S.indexOf(ms)>=0||/ResizeObserver loop/i.test(O.message??""))return;const z=a(),Z={level:"error",kind:O.kind??"unknown",message:At(O.message,Tt.message),detail:At(O.detail,Tt.detail),status:typeof O.status=="number"?O.status:void 0,url:At(Ao(S),Tt.url),route:At(O.route!==void 0?O.route:Iu(S),Tt.route),actionId:At(O.actionId,Tt.actionId),source:At(O.source,Tt.source),traceparent:O.traceparent,stack:At(O.stack,Tt.stack)},H=$(Z),Q=u.get(H);if(Q&&z-Q.windowStart<s){Q.pending===0&&(Q.pendingFirstAt=z),Q.pending++,Q.lastAt=z,w(Q.windowStart+s-z);return}u.set(H,{report:Z,windowStart:z,pending:1,pendingFirstAt:z,lastAt:z,sent:!1}),w(o)}catch{}},E=O=>{const S=a(),z=[];for(const[Z,H]of u){const Q=S-H.windowStart>=s;H.pending>0&&(!H.sent||Q||O)&&(z.push({...H.report,count:H.pending,firstAt:new Date(H.pendingFirstAt).toISOString(),lastAt:new Date(H.lastAt).toISOString()}),H.pending=0,H.sent=!0),Q&&H.pending===0&&u.delete(Z)}return z},A=O=>{const S=a();p=p.filter(H=>S-H<6e4);const z=m,Z=[];for(const H of O){if(p.length>=l){m++;continue}p.push(S),Z.push(H)}return Z.length&&z&&(Z[0].dropped=z,m-=z),Z},P=O=>{const S=[];let z=[],Z=2;for(const H of O){const Q=JSON.stringify(H).length+1;z.length&&Z+Q>Su&&(S.push(z),z=[],Z=2),z.push(H),Z+=Q}return z.length&&S.push(z),S},R=(O=!1)=>{try{if(f)return;const S=c();if(!S)return;const z={renderer:t,userAgent:At(e.userAgent,Tt.userAgent),pageUrl:At(Ao(e.pageUrl?.()),Tt.pageUrl)},Z=A(E(O)).map(Q=>JSON.parse(JSON.stringify({...z,...Q})));for(const Q of P(Z)){let T;try{T=e.send(S,JSON.stringify(Q),{final:O})}catch{T=void 0}Promise.resolve(T).then(U=>{Tu(U)&&(f=!0)},()=>{})}let H=1/0;for(const Q of u.values())Q.pending>0&&(H=Math.min(H,Q.windowStart+s));H!==1/0&&!O&&w(H-a())}catch{}};return{report:C,flush:R,isDisabled:()=>f,pendingCount:()=>u.size}},Ou=(e=()=>({}))=>(t,a,{final:r})=>{const i=e()??{},s=Object.keys(i).length>0;if(r&&!s&&typeof navigator<"u"&&typeof navigator.sendBeacon=="function")try{return navigator.sendBeacon(t,new Blob([a],{type:"application/json"})),Promise.resolve(void 0)}catch{}return typeof fetch>"u"?Promise.resolve(void 0):fetch(t,{method:"POST",keepalive:!0,credentials:"same-origin",headers:{"Content-Type":"application/json",...i},body:a}).then(o=>o.status,()=>{})},Ru=()=>{try{const e=typeof localStorage<"u"?localStorage.getItem("__mateu_auth_token"):null;return e?{Authorization:"Bearer "+e}:{}}catch{return{}}},zu=(e,t,a)=>{const r=t??{},i=!!r.config||!!r.response,s=r.config?.headers?.traceparent;return{kind:e.kind,message:e.message,status:e.status??r.response?.status,detail:typeof t=="string"?t:r.message,url:r.config?.url,actionId:a,traceparent:typeof s=="string"?s:void 0,stack:i?void 0:r.stack}};let ei=null;const nl=e=>{ei?.report(e)},Lu=e=>{if(ei||typeof window>"u")return ei;const t=window.location?.origin,a=Pu({renderer:"vaadin",endpoint:()=>Au(e,t),send:Ou(Ru),userAgent:typeof navigator<"u"?navigator.userAgent:void 0,pageUrl:()=>window.location?.href});return ei=a,window.addEventListener("error",r=>{if(!r||!r.error&&!r.message)return;const i=r.error;a.report({kind:"js-error",message:r.message||i?.message,stack:i?.stack,source:r.filename?`${r.filename}:${r.lineno??0}:${r.colno??0}`:void 0})}),window.addEventListener("unhandledrejection",r=>{const i=r?.reason;if(i?.__mateuReported||i?.code==="ERR_CANCELED"||i?.name==="AbortError")return;let s=i?.message;if(!s)try{s=typeof i=="string"?i:JSON.stringify(i)}catch{s=String(i)}a.report({kind:"unhandled-rejection",message:s,stack:i?.stack})}),window.addEventListener("pagehide",()=>a.flush(!0)),a},qr=(e,t)=>`${e??""}|${t??""}`,Du=(e,t,a)=>!a||e===void 0?!0:e===t,Mu=(e,t)=>{const a=e.generation,r=e.callbackToken,i=e.connected;return()=>e.generation!==a||t&&e.callbackToken!==r||i&&!e.connected};class ll extends Error{constructor(t,a){super(`response to '${t}' arrived for a view no longer on screen`),this.actionId=t,this.outcome=a,this.__mateuStale=!0,this.__mateuReported=!0,this.code="ERR_CANCELED"}}const dl=e=>!!e&&typeof e=="object"&&e.__mateuStale===!0;let jt=[];const Nu=6e4,Fu=e=>new Promise(t=>setTimeout(t,e));class qu{constructor(){this.axiosInstance=Ic.create({timeout:Nu}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t)),this.axiosInstance.interceptors.response.use(t=>{const a=Vc({requestedUrl:this.axiosInstance.getUri(t.config),finalUrl:t.request?.responseURL,contentType:String(t.headers?.["content-type"]??""),data:t.data});if(a)throw window.location.assign(a),Object.assign(new Error("session lost — redirecting to "+a),{code:"ERR_CANCELED"});return t},t=>{const a=t;if(a?.response?.status===401&&a.config&&!a.config.__mateuRetried&&!a.config.__mateuIsStale?.()){const r=a.config;return r.__mateuRetried=!0,Jn(t,()=>this.axiosInstance.request(r))}throw t})}addSessionId(t){let a=sessionStorage.getItem("__mateu_sesion_id");a||(a=Ne(),sessionStorage.setItem("__mateu_sesion_id",a)),t.headers["X-Session-Id"]=a}addAuthToken(t){const a=localStorage.getItem("__mateu_auth_token");a&&(t.headers.Authorization="Bearer "+a)}async wrap(t,a,r,i,s,o=!1,l){r||a.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}}));const c=u=>{throw a.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{actionId:i}})),new ll(i,u)};return t().then(u=>(l?.()&&c("answered"),a.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:i}})),u),u=>{l?.()&&c("failed");const p=ps(u,{online:Vt.isOnline()});throw o||(p.kind=="cancelled"?a.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{actionId:i}})):(u&&typeof u=="object"&&(u.__mateuReported=!0),a.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(u),failure:p,retry:s}})))),u})}async sendWithRetry(t,a,r=!1,i){let s=0;for(;;)try{const o=await t();return r||Vt.noteReachable(),o}catch(o){const l=ps(o,{online:Vt.isOnline()});if(l.kind=="offline"&&!r&&Vt.noteUnreachable(),s++,i?.()||!ku(l,s,{idempotent:a}))throw o;await Fu(xu(s))}}serialize(t){return t?.message?t:JSON.stringify(t)}release(t){jt=jt.filter(a=>a!==t)}async get(t){const a=new AbortController;return jt=[...jt,a],this.axiosInstance.get(t,{signal:a.signal}).finally(()=>this.release(a))}async post(t,a,r,i){const s=new AbortController;return jt=[...jt,s],this.axiosInstance.post(t,a,{signal:s.signal,...i?{__mateuIsStale:i}:{},...r&&r>0?{timeout:r}:{}}).finally(()=>this.release(s))}async abortAll(){jt.forEach(t=>t.abort()),jt=[]}async runAction(t,a,r,i,s,o,l,c,u,p,m,f={}){if(a&&a.startsWith("/")&&(a=a.substring(1)),i===""&&(await uu(),hu())){const A=mu(du(a),r);if(A){const P={...A,fragments:(A.fragments??[]).map(R=>R.targetComponentId?R:{...R,targetComponentId:s})};return await this.wrap(()=>Promise.resolve(P),p,m,i,f.retry,!1,f.isStale)}}const g=[t,a,r,l??"",i,s].join(""),y=Kc.check(g);if(y.blocked)return await this.abortAll(),y.firstTrip&&(console.error("[mateu] request loop detected — aborting repeated request",g),nl({kind:"request-loop",message:"A repeating request was detected and stopped",url:t+"/mateu/v3/sync/"+(a||"_no_route"),actionId:i})),{messages:y.firstTrip?[{title:"",text:"A repeating request was detected and stopped to protect the server. Reload the page or navigate elsewhere.",position:"bottom-end",variant:"error",duration:6e3}]:[],commands:[],fragments:[],banners:[],appendBanners:!1,appData:void 0,appState:void 0};o={...Fs(),...o};const $=t+"/mateu/v3/sync/"+(a&&a!=""?a:"_no_route"),w={serverSideType:l,appState:o,componentState:c,parameters:u,initiatorComponentId:s,consumedRoute:r,route:a&&a!=""?"/"+a:"",actionId:i,knownStructureHash:f.knownStructureHash},C=ol(i,f.idempotent),E=()=>this.post($,w,f.timeoutMillis,f.isStale).then(A=>A.data);return await this.wrap(()=>this.sendWithRetry(E,C,f.quiet,f.isStale),p,m,i,f.retry,f.quiet,f.isStale)}}const Aa=new qu,pt=e=>{let t=(e??"").trim();const a=t.search(/[?#]/);for(a>=0&&(t=t.slice(0,a)),t&&!t.startsWith("/")&&(t="/"+t);t.length>1&&t.endsWith("/");)t=t.slice(0,-1);return t},js=e=>{let t=e??"",a;do a=t,t=t.replace(/<[^<>]*>/g,"");while(t!==a);return t.replace(/[<>]/g,"").replace(/\s+/g," ").trim()},qa=(e,t)=>!!e&&e!=="/"&&(t===e||t.startsWith(e+"/")),at=e=>!!e&&!!e.remote,Hs=e=>at(e)?pt(e.routePrefix||e.path||e.route):"",Ws=(e,t)=>{if(!e||e.separator)return-1;const a=pt(t);if(at(e)){const s=Hs(e);return qa(s,a)?s.length:-1}let r=-1;const i=pt(e.route);qa(i,a)&&(r=i.length);for(const s of e.submenus??[])r=Math.max(r,Ws(s,a));return r},fs=(e,t)=>Ws(e,t)>=0;function cl(e,t){let a=NaN,r=-1;return(e??[]).forEach((i,s)=>{const o=Ws(i,t);o>r&&(r=o,a=s)}),a}function Bu(e,t){const a=pt(t);let r;const i=Uu(e),s=(l,c,u)=>{(!r||l.length>r.route.length||l.length===r.route.length&&r.pending&&!u)&&(r={crumbs:c,route:l,pending:u})},o=(l,c)=>{for(const u of l??[]){if(!u||u.separator)continue;const p=js(u.label);if(at(u)){const g=Hs(u);qa(g,a)&&s(g,[...c,{text:p}],!0);continue}const m=pt(u.route),f=u.submenus??[];if(f.length>0){o(f,[...c,m&&m!=="/"&&i.has(m)?{text:p,route:m}:{text:p}]);continue}qa(m,a)&&s(m,[...c,{text:p,route:m}],!1)}};return o(e,[]),r?{crumbs:r.crumbs,matched:r.route,...r.pending?{pending:!0}:{}}:{crumbs:[]}}function Uu(e){const t=new Set,a=r=>{for(const i of r??[]){if(!i||i.separator||at(i))continue;const s=i.submenus??[];if(s.length>0){a(s);continue}const o=pt(i.route);o&&o!=="/"&&t.add(o)}};return a(e),t}function ju(e,t){const a=pt(t);let r;const i=s=>{for(const o of s??[]){if(!o||o.separator||at(o))continue;const l=o.submenus??[];if(l.length>0){i(l);continue}const c=pt(o.route);qa(c,a)&&(!r||c.length>r.route.length)&&(r={option:o,route:c})}};return i(e),r?.option}const ul=(e,t)=>{let a=!1;const r=e.map(i=>{if(at(i)){const s=t(i);return s!==i&&(a=!0),s}if(i.submenus&&i.submenus.length>0){const s=ul(i.submenus,t);if(s!==i.submenus)return a=!0,{...i,submenus:s}}return i});return a?r:e};function Hu(e,t,a){const r=pt(a);if(!t||!r||r==="/")return e;const i="/"+r.split("/")[1];return ul(e,s=>s.baseUrl===t&&!qa(Hs(s),r)?{...s,routePrefix:i}:s)}function Wu(e,t){const a=typeof document<"u"&&document.documentElement?.lang||typeof navigator<"u"&&navigator.language||"",r=js(e);return a.toLowerCase().startsWith("es")?`${r} no está disponible ahora. Se volverá a intentar.`:`${r} is not available right now. It will be retried.`}const hl=e=>e.map(t=>({...t,visible:!1,...t.submenus&&t.submenus.length>0?{submenus:hl(t.submenus)}:{}})),pl=(e,t,a)=>{const r=t.serverSideType&&t.serverSideType!==""?t.serverSideType:a.serverSideType;return e.map(i=>i.baseUrl?i:i.submenus&&i.submenus.length>0?{...i,submenus:pl(i.submenus,t,a)}:{...i,consumedRoute:a.route??"",baseUrl:t.baseUrl,serverSideType:r,uriPrefix:t.route})};function ml(e,t,a,r={},i=0){const s=[];for(const o of e)if(at(o)){const l=t.get(o);if(!l)s.push(o);else if("failed"in l)s.push({...o,unavailable:!0,disabled:!0,description:Wu(o.label)});else{let c=pl(l.app.menu??[],o,l.app);const u=c.length===1&&(c[0].submenus?.length??0)>0;r.sections&&i===0&&!u&&c.length>0?c=[Vu(o,c)]:o.shellLabel&&o.label&&c.length===1&&(c=[{...c[0],label:o.label,icon:o.icon||c[0].icon}]),s.push(...o.visible===!1?hl(c):c)}}else o.submenus&&o.submenus.length>0?s.push({...o,submenus:ml(o.submenus,t,a,r,i+1)}):s.push(o);return s}const Vu=(e,t)=>({label:e.label,icon:e.icon,path:e.path,route:"",separator:!1,visible:e.visible,description:void 0,submenus:t});function fl(e){const t=[];for(const a of e??[])at(a)?t.push(a):a.submenus&&a.submenus.length>0&&t.push(...fl(a.submenus));return t}function vs(e){let t=!1;const a=[];for(const r of e){if(r.visible===!1){t=!0;continue}if(r.submenus&&r.submenus.length>0){const i=vs(r.submenus);if(i!==r.submenus){t=!0,a.push({...r,submenus:i});continue}}a.push(r)}return t?a:e}function Po(e,t){const a=cl(e,t);return Number.isNaN(a)?void 0:e[a]}function vl(e){if(!e||e.separator||e.visible===!1||at(e)||e.unavailable)return;const t=e.submenus??[];if(t.length===0)return e;for(const a of t){const r=vl(a);if(r)return r}}const ni=new Set;function Gu(e){return ni.add(e),()=>{ni.delete(e)}}function Oo(){const e=[...ni];ni.clear(),e.forEach(t=>t())}const Ro=new Map,Ku=["position:absolute","width:1px","height:1px","margin:-1px","padding:0","overflow:hidden","clip:rect(0 0 0 0)","clip-path:inset(50%)","white-space:nowrap","border:0"].join(";"),gs=e=>{if(typeof document>"u"||!document.body)return;let t=Ro.get(e);return t?.isConnected||(t=document.createElement("div"),t.setAttribute("aria-live",e),t.setAttribute("aria-atomic","true"),t.setAttribute("role",e==="assertive"?"alert":"status"),t.setAttribute("data-mateu-live-region",e),t.style.cssText=Ku,document.body.appendChild(t),Ro.set(e,t)),t},gl=()=>{if(!(typeof document>"u")){if(!document.body){document.addEventListener("DOMContentLoaded",()=>gl(),{once:!0});return}gs("polite"),gs("assertive")}},Vs=(e,t={})=>{const a=(e??"").trim();if(!a)return;const r=gs(t.politeness??"polite");if(r){if(r.textContent===a){r.textContent="",setTimeout(()=>{r.textContent=a},60);return}r.textContent=a}};function Yu(e,t){return!t.callbackToken||!e.callbackToken||t.callbackToken===e.callbackToken?!0:t.initiator!=null&&t.initiator!==e}var Ju=Object.defineProperty,bl=(e,t,a,r)=>{for(var i=void 0,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=o(t,a,i)||i);return i&&Ju(t,a,i),i},ct;const Gs=(ct=class extends I{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const a=t.data,r=document.createElement(a.name);for(let i in a.attributes)r.setAttribute(i,a.attributes[i]);for(let i in a.on)r.addEventListener(i,s=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.on[i],parameters:{event:s}},bubbles:!0,composed:!0}))});return r},this.closeModal=()=>{const t=(this.shadowRoot??this).querySelectorAll("mateu-dialog, mateu-drawer");if(t&&t.length>0){t[t.length-1].close();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let a=document.querySelector('link[rel="icon"]');a!==null?a.setAttribute("href",t):(a=document.createElement("link"),a.setAttribute("rel","icon"),a.setAttribute("href",t),document.head.appendChild(a))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=Fa.subscribe(t=>{if(t.command){const a=t.command;this.id==a.targetComponentId&&this.applyCommand(a)}if(Yu(this,t)&&t.fragment){const a=t.fragment;this.id==a.targetComponentId&&(this.applyFragment(a),this.completeMenu(a))}})}completeMenu(t){if(t.component&&t.component.type==re.ClientSide){const a=t.component,r=a.metadata;if(r?.type==v.App){this.pendingMenuRetries?.forEach(u=>u()),this.pendingMenuRetries=new Set;const i=r,s=typeof window<"u"?window.location.pathname:"",o=Hu(i.menu??[],i.homeBaseUrl,s),l=vs(o);(l!==i.menu||o!==i.menu)&&(a.metadata={...i,menu:l,navMenu:o});const c=fl(o).filter(u=>u.visible!==!1||fs(u,s)||!!i.homeBaseUrl&&u.baseUrl===i.homeBaseUrl);c.length>0&&this.askRemotes(a,o,c,new Map,0)}}}askRemotes(t,a,r,i,s){const o=[],l=()=>{const c=t.metadata.variant===Xe.HAMBURGER_SECTIONS,u=ml(a,i,void 0,{sections:c}),p=t.metadata;t.metadata={...p,menu:vs(u),navMenu:u},this.requestUpdate()};Promise.allSettled(r.map(c=>Aa.runAction(c.baseUrl,c.route,"_empty","",c.baseUrl+"#"+c.route,void 0,void 0,void 0,c.params,this,!0,{quiet:!0,timeoutMillis:ct.remoteMenuTimeoutMillis}).then(u=>{const p=this.remoteAppOf(u?.fragments,c);if(!p)throw new Error("no app in the answer of "+c.baseUrl);i.set(c,{app:p}),l()}).catch(()=>{i.set(c,{failed:!0}),o.push(c),l()}))).then(()=>{if(o.length>0){const c=ct.remoteRetryDelays[s];let u;const p=()=>{u!==void 0&&clearTimeout(u),f(),this.pendingMenuRetries?.delete(p)},m=()=>{p(),this.isConnected&&this.askRemotes(t,a,o,i,Math.min(s+1,ct.remoteRetryDelays.length))},f=Gu(m);this.pendingMenuRetries?.add(p),c!==void 0&&(u=setTimeout(m,c))}})}remoteAppOf(t,a){const r=(t??[]).find(i=>i?.targetComponentId==a.baseUrl+"#"+a.route);if(r?.component?.type==re.ClientSide){const i=r.component.metadata;if(i?.type==v.App){const s=i;return{menu:s.menu??[],route:s.route,serverSideType:s.serverSideType}}}}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data,Vs(document.title)),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"&&this.dispatchNamedEvent(t.data),t.type=="NavigateTo"){const a=t.data;a&&(a.startsWith("http:")||a.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const a=t.data;a!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:a},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const a=t.data;if(a&&a.actionId)if(a.targetComponentId){const r={command:{type:"RunAction",data:{actionId:a.actionId},targetComponentId:a.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>Fa.next(r))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const a=t.data;if(a&&a.base64Content){const r=atob(a.base64Content),i=new Uint8Array(r.length);for(let c=0;c<r.length;c++)i[c]=r.charCodeAt(c);const s=new Blob([i],{type:a.mimeType}),o=URL.createObjectURL(s),l=document.createElement("a");l.href=o,l.download=a.filename??"export",l.click(),URL.revokeObjectURL(o)}}if(t.type=="CloseModal"&&(this.closeModal(),this.dispatchNamedEvent(t.data)),t.type=="AddContentToHead"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.body.appendChild(this.createElement(t))}}}dispatchNamedEvent(t){if(t&&t.eventName){const a=this.component,r=a?.emitsName??a?.serverSideType;let i=t.payload??t.detail;r&&i&&typeof i=="object"&&(i={...i,__source:r}),this.dispatchEvent(new CustomEvent(t.eventName,{detail:i,bubbles:!0,composed:!0}))}}},ct.remoteMenuTimeoutMillis=2e4,ct.remoteRetryDelays=[1e4,3e4,6e4],ct);bl([h()],Gs.prototype,"id");bl([h()],Gs.prototype,"baseUrl");let yl=Gs;var Xu=Object.defineProperty,Qu=(e,t,a,r)=>{for(var i=void 0,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=o(t,a,i)||i);return i&&Xu(t,a,i),i};class Oi extends yl{applyFragment(t){}manageActionRequestedEvent(t){}}Qu([h()],Oi.prototype,"component");const $l=e=>Tc.sanitize(e,{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:t=>!0,attributeNameCheck:t=>!/^on/i.test(t),allowCustomizedBuiltInElements:!1}}),we=e=>qn(e==null?e:$l(String(e))),Zu=(e,t)=>{const a=e[t];for(let r=t+1;r<e.length;r++){const i=e[r];if(i==="\\"){r++;continue}if(i===a)return r+1}throw new SyntaxError("Unterminated string literal in template expression")},eh=(e,t)=>{for(let a=t+1;a<e.length;a++){const r=e[a];if(r==="\\"){a++;continue}if(r==="`")return a+1;r==="$"&&e[a+1]==="{"&&(a=wl(e,a+2))}throw new SyntaxError("Unterminated template literal in template expression")},wl=(e,t)=>{let a=0,r=t;for(;r<e.length;){const i=e[r];if(i==="'"||i==='"'){r=Zu(e,r);continue}if(i==="`"){r=eh(e,r);continue}if(i==="{")a++;else if(i==="}"){if(a===0)return r;a--}r++}throw new SyntaxError('Unterminated ${ expression in "'+e+'"')},xl=e=>{const t=[];let a="",r=0;for(;r<e.length;){const i=e[r];if(i==="\\"&&e[r+1]==="\\"){a+="\\",r+=2;continue}if(i==="\\"&&e[r+1]==="$"&&e[r+2]==="{"){a+="${",r+=3;continue}if(i==="$"&&e[r+1]==="{"){const s=wl(e,r+2);a&&t.push({lit:a}),a="",t.push({expr:e.substring(r+2,s)}),r=s+1;continue}a+=i,r++}return a&&t.push({lit:a}),t},th=500,dr=new Map,ah=(e,t)=>{const a=e.join(",")+"\0"+t;let r=dr.get(a);return r||(r=new Function(...e,"return ("+t+`
)`),dr.size>=th&&dr.delete(dr.keys().next().value),dr.set(a,r)),r},kl=(e,t)=>ah(Object.keys(t),e)(...Object.values(t)),Ri=(e,t)=>{let a="";for(const r of xl(e))a+="lit"in r?r.lit:String(kl(r.expr,t)??"");return a},Za=(e,t,a)=>({state:e??{},data:t??{},...a});function G(e,t,a,r){if(!e?.includes("${"))return e;try{return Ri(e,Za(t,a,r))}catch(i){return console.warn(`Mateu: could not interpolate "${e}":`,i),e}}const Ge=(e,t,a)=>{if(e&&e.indexOf("${")>=0)try{return Ri(e,Za(t,a))}catch(r){return r.message}return e},gr=(e,t,a,r,i)=>{if(!e?.includes("${"))return e;const s=Za(t,a,{appState:r??{},appData:i??{}});let o=e;try{o=Ri(e,s)}catch(l){o="when evaluating "+e+" :"+l+", where data is "+a+" and state is "+t+" and app state is "+r+" and app data is "+i,console.error(l,o,t,a,r,i)}return o},rh=(e,t)=>{for(let a=0;a<e.length;a++){const r=e[a];t==="code"?(r==="'"||r==='"'||r==="`")&&(t=r):r==="\\"?a++:r===t&&(t="code")}return t},ih=e=>e.replace(/[\\'"`\n\r\u2028\u2029]|\$\{/g,t=>{switch(t){case`
`:return"\\n";case"\r":return"\\r";case"\u2028":return"\\u2028";case"\u2029":return"\\u2029";case"${":return"\\${";default:return"\\"+t}}),sh=e=>e===null?"null":e===void 0?"undefined":typeof e=="number"||typeof e=="boolean"?String(e):typeof e=="bigint"?e+"n":JSON.stringify(e)??"undefined",Ks=(e,t,a,r,i,s)=>{const o=Za(t,a,{appState:r??{},appData:i??{},...s});let l="",c="code";for(const u of xl(e))if("lit"in u)l+=u.lit,c=rh(u.lit,c);else{const p=kl(u.expr,o);l+=c==="code"?sh(p):ih(String(p))}return new Function(...Object.keys(o),"return ("+l+`
)`)(...Object.values(o))},_l=(e,t,a,r)=>{const i=Za(t,a,r);return new Function(...Object.keys(i),`return (${e})`)(...Object.values(i))},oh=(e,t,a,r)=>Ri(e,Za(t,a,r)),bs="display:inline-flex; align-items:center; justify-content:center; width:2rem; height:2rem; border-radius:50%; background:var(--lumo-contrast-10pct,#e0e0e0); color:var(--lumo-secondary-text-color,#555); font-size:.8rem; font-weight:600; overflow:hidden; flex:none;",Sl=(e,t)=>t||(typeof e=="string"&&e?e.trim().split(/\s+/).map(a=>a[0]).slice(0,2).join("").toUpperCase():""),nh=(e,t,a)=>{const r=e.metadata,i=Me(r.name,t,a);return n`<span style="${bs}${e.style}" class="${e.cssClasses}"
                      title="${i||d}" slot="${e.slot??d}">
        ${r.image?n`<img src="${r.image}" alt="${i}" style="width:100%;height:100%;object-fit:cover;">`:Sl(i,r.abbreviation)}
    </span>`},Me=(e,t,a)=>typeof e=="string"&&e.includes("${")?G(e,t,a):e,lh=e=>{const t=e.metadata,a=t.avatars??[],r=t.maxItemsVisible&&t.maxItemsVisible>0?t.maxItemsVisible:a.length,i=a.slice(0,r),s=a.length-i.length,o="margin-left:-0.4rem; border:2px solid var(--lumo-base-color,#fff);";return n`<span style="display:inline-flex; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
        ${i.map(l=>n`<span style="${bs}${o}" title="${l.name||d}">
            ${l.img?n`<img src="${l.img}" style="width:100%;height:100%;object-fit:cover;">`:Sl(l.name??"",l.abbr)}
        </span>`)}
        ${s>0?n`<span style="${bs}${o}">+${s}</span>`:d}
    </span>`},dh=(e,t,a)=>{const r=e.metadata;return n`<span theme="badge ${r.color} ${r.pill?"pill":""} ${r.small?"small":""} ${r.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??d}">${Me(r.text,t,a)}</span>`},zo=(e,t,a,r)=>{const i=Me(e.text,t,a);if(!i)return d;let s=Me(e.color,t,a);s=="SUCCESS"&&(s="success"),s=="ERROR"&&(s="error"),s=="DANGER"&&(s="error"),s=="WARNING"&&(s="warning"),s=="INFO"&&(s="info"),s=="PRIMARY"&&(s="primary"),s=="SECONDARY"&&(s="secondary"),s=="TERTIARY"&&(s="tertiary"),s=="QUATERNARY"&&(s="quaternary"),s=="LIGHT"&&(s="light"),s=="DARK"&&(s="dark");const o=e.pill||r?.pill;return n`<span theme="badge ${s} ${o?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${i}</span>`};class ch{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const a=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:a?[...a].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const J=new ch,pa=(e,t,a,r,i,s,o,l,c)=>(t.slot=l,x(e,t,a,r,i,s,o,c)),x=(e,t,a,r,i,s,o,l)=>{if(!t)return n``;if(t.type==re.ClientSide)return J.get().renderClientSideComponent(e,t,a,r,i,s,o,l);const c=e.route,u=e.consumedRoute;return n`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${u}"
                         baseUrl="${a}"
                         slot="${t.slot??d}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...r}}"
                         .data="${{...i}}"
                         .appState="${s}"
                         .appData="${o}"
        >
       </mateu-component>`},Ba=e=>e==="back"||e==="backToList"||e==="cancel-view",uh=e=>!!e&&e.startsWith("cancel")&&!Ba(e),li=e=>Ba(e)||uh(e);function Cl(e,t,a,r){if(!e||t==null)return;const i=G(e,a,r,{row:t});if(!(!i||i===e||i.includes("${")))return i}function mt(e,t){for(const a of["route-changed","navigate-to-requested"])e.dispatchEvent(new CustomEvent(a,{detail:{route:t},bubbles:!0,composed:!0}))}function hh(e){if(!e)return[];const t=new Set;for(const a of e.matchAll(/\$\{\s*row\.([A-Za-z0-9_]+)/g))t.add(a[1]);return[...t]}const ph=pt,Lo=js,mh=e=>(e||typeof document<"u"&&document.documentElement?.lang||typeof navigator<"u"&&navigator.language||"").toLowerCase().startsWith("es"),Do=new Map;function fh(e,t,a={}){const{crumbs:r,matched:i,pending:s}=Bu(e,t);if(!i)return[];const o=[...r];if(s){const p=Lo(a.title);return p&&p!==o[o.length-1]?.text&&o.push({text:p}),o.length<2?[]:o}const l=ph(t).slice(i.length).split("/").filter(Boolean),c=mh(a.lang);if(l.length>0){const p=decodeURIComponent(l[0]);if(p==="new"||p==="create")o.push({text:c?"Nuevo":"New"});else{const m=i+"/"+l[0],f=Lo(a.title);l.length===1&&f&&Do.set(m,f),o.push({text:Do.get(m)||p,route:m}),l[1]==="edit"?o.push({text:c?"Editar":"Edit"}):l.length>1&&o.push({text:f||decodeURIComponent(l[l.length-1])})}}if(o.length<2)return[];const u=o[o.length-1];return o[o.length-1]={text:u.text},o}let di,ys=!1,Br,$s;const ws=new Set;function vh(e,t,a,r){if(Br&&Br!==e&&Br.isConnected!==!1)return;Br=e;const i=di!==t||ys!==!!a;di=t,ys=!!a,$s=r,i&&ws.forEach(s=>s())}function gh(e){return ws.add(e),()=>{ws.delete(e)}}function bh(e){if(!$s)return!1;const t=ju(di,e);return t?($s(t,e),!0):!1}function yh(e,t){return ys?[]:fh(di,e,t)}const Mo=new WeakMap,$h=e=>{let t=Mo.get(e);return t===void 0&&(t=typeof window<"u"?window.location.pathname:"",Mo.set(e,t)),t};class wh{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const ut=new wh;var xh=Object.defineProperty,kh=Object.getOwnPropertyDescriptor,Nt=(e,t,a,r)=>{for(var i=r>1?void 0:r?kh(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&xh(t,a,i),i};const Ys=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},El=e=>{const t=Ys(e)??"",a=[];return t.includes("primary")&&a.push("primary"),t.includes("tertiary")&&a.push("tertiary"),(t.includes("error")||e.color==="error")&&a.push("danger"),a.join(" ")};let Qe=class extends I{constructor(){super(...arguments),this.appState={},this.appData={},this._overflowOpen=!1,this._overflowN=0,this._secCount=0,this._onDocClick=e=>{e.composedPath().includes(this)||(this._overflowOpen=!1)},this._resetOverflow=()=>{this._overflowN!==0?this._overflowN=0:this.requestUpdate()},this.handleButtonClick=e=>{this._overflowOpen=!1;const t=e.route?G(e.route,this.state,this.data):void 0;if(t&&!t.includes("${")){mt(this,t);return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{crud_selected_items:this.listingSelection()}},bubbles:!0,composed:!0}))},this.listingSelection=()=>{const t=this.findSiblingCrud()?.state?.crud_selected_items;return Array.isArray(t)?t:[]},this.findSiblingCrud=()=>{const e=a=>{for(const r of Array.from(a.querySelectorAll("*"))){if(r.tagName==="MATEU-TABLE-CRUD")return r;if(r.shadowRoot){const i=e(r.shadowRoot);if(i)return i}}return null};let t=this;for(;t;){const a=t,r=a.parentElement??(a.getRootNode?.()instanceof ShadowRoot?a.getRootNode().host:null);if(!r)break;const i=e(r);if(i)return i;t=r}return null},this.evalLabel=e=>G(e,this.state,this.data),this.renderBackChevron=e=>{if((this.data??{})[e.actionId+".hidden"])return d;const t=this.evalLabel(e.label);return n`
        <button class="back-chevron"
                data-action-id="${e.id}"
                title="${t}"
                aria-label="${t}"
                @click="${()=>this.handleButtonClick(e)}">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>`},this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return d;const t=this.evalLabel(e.label),a=J.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e));return a||n`
        <button class="mtb ${El(e)}"
                data-action-id="${e.id}"
                @click="${()=>this.handleButtonClick(e)}"
                ?disabled="${e.disabled}"
        >${t}</button>
    `},this.renderActions=e=>{const t=e.filter(l=>!(this.data??{})[l.actionId+".hidden"]),a=t.filter(l=>l.buttonStyle==="primary"),r=t.filter(l=>l.buttonStyle!=="primary");this._secCount=r.length;const i=Math.max(0,Math.min(this._overflowN,r.length)),s=r.slice(0,r.length-i),o=r.slice(r.length-i);return n`
            <div class="actions-cluster">
                ${a.map(this.renderBtn)}
                ${s.map(this.renderBtn)}
                ${o.length?n`
                    <div class="overflow-wrap">
                        <button class="mtb overflow-btn" title="Más acciones" aria-haspopup="true"
                                aria-expanded="${this._overflowOpen}"
                                @click="${l=>{l.stopPropagation(),this._overflowOpen=!this._overflowOpen}}">⋯</button>
                        ${this._overflowOpen?n`
                            <div class="overflow-menu">
                                ${o.map(l=>n`
                                    <button class="overflow-item" ?disabled="${l.disabled}"
                                            data-action-id="${l.actionId}"
                                            @click="${()=>this.handleButtonClick(l)}">${this.evalLabel(l.label)}</button>
                                `)}
                            </div>
                        `:d}
                    </div>
                `:d}
            </div>
        `},this.renderPeerNav=e=>{const t=J.get()?.renderPeerNav?.(e);return t||n`
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
        `}}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._onDocClick),this._ro=new ResizeObserver(()=>this._resetOverflow()),this._ro.observe(this),window.addEventListener("resize",this._resetOverflow),this._offShellMenu=gh(()=>this.requestUpdate())}disconnectedCallback(){this._offShellMenu?.(),this._offShellMenu=void 0,document.removeEventListener("click",this._onDocClick),window.removeEventListener("resize",this._resetOverflow),this._ro?.disconnect(),this._ro=void 0,super.disconnectedCallback()}updated(e){if(e.has("_overflowOpen")&&this._overflowOpen&&this._placeOverflowMenu(),e.has("metadata")||e.has("data")){this._resetOverflow();return}if(this._inDialog()){this._overflowN!==0&&(this._overflowN=0);return}const t=this.renderRoot.querySelector(".actions-cluster");if(!t||this._secCount===0)return;const a=t.closest(".form-header, .no-header-row");if(!a)return;const r=t.getBoundingClientRect(),i=a.getBoundingClientRect();(r.top-i.top>8||r.right>i.right+1)&&this._overflowN<this._secCount&&(this._overflowN+=1)}_inDialog(){let e=this;for(;e;){const t=e.tagName;if(t==="VAADIN-DIALOG-OVERLAY"||t==="DIALOG"||e.getAttribute?.("role")==="dialog")return!0;e=e.parentElement??e.getRootNode?.()?.host}return!1}_placeOverflowMenu(){const e=this.renderRoot.querySelector(".overflow-menu");e&&(e.classList.remove("flip"),e.getBoundingClientRect().left<0&&e.classList.add("flip"))}crumbsOf(e,t){return e?.breadcrumbs&&e.breadcrumbs.length>0?e.breadcrumbs.map(a=>({text:a.text,route:a.link||void 0})):t>0||e?.type!==v.Page||e.noBreadcrumbs?[]:yh($h(e),{title:e.title,pageType:e.pageType})}goToCrumb(e){if(/^[a-z]+:\/\//i.test(e)){window.location.href=e;return}ut.confirmLeave()&&(bh(e)||mt(this,e))}render(){const e=this.metadata;if(!e)return n``;const t=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0,a=e.toolbar??[],r=!e.noHeader,i=a.filter(g=>li(g.actionId)&&!(r&&Ba(g.actionId))),s=r?a.filter(g=>Ba(g.actionId)):[],o=a.filter(g=>!li(g.actionId)),l=i.length>0&&o.length>0?n`<span class="toolbar-divider"></span>`:d,c=e.overline,u=e.title?void 0:e.titlePlaceholder,p=e.avatar||e.title||e.subtitle||c||u||e.kpis?.length>0||e.header?.length>0||a.length>0||!!t,m=e.level??0;m>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested");const f=this.crumbsOf(e,m);return n`
            ${f.length>0?n`
                <nav class="breadcrumbs-bar" aria-label="Breadcrumb">
                    ${f.map((g,y)=>n`
                        ${y>0?n`<span class="breadcrumb-sep" aria-hidden="true">›</span>`:d}
                        ${g.route?n`<button class="breadcrumb-link" @click="${()=>this.goToCrumb(g.route)}">${g.text}</button>`:n`<span class="${y===f.length-1?"breadcrumb-current":"breadcrumb-group"}"
                                        aria-current="${y===f.length-1?"page":d}">${g.text}</span>`}
                    `)}
                </nav>
            `:d}
            ${e.noHeader?n`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;" class="no-header-row">
                    ${e?.header?.map(g=>x(this,g,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${t?this.renderPeerNav(t):d}
                    ${i.map(this.renderBtn)}
                    ${l}
                    ${this.renderActions(o)}
                </div>
            `:p?n`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center; flex-wrap: wrap;" class="form-header">
                    ${s.map(this.renderBackChevron)}
                    ${e.avatar?x(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):d}
                    <div style="flex: 1; min-width: min(22rem, 100%); overflow: hidden;">
                        ${c?n`<div class="page-overline">${we(Ge(c,this.state??{},this.data??{}))}</div>`:d}
                        ${(e?.title||u)&&m==0?n`
                            <div style="display: flex; align-items: center; gap: var(--lumo-space-s, .5rem); min-width: 0;">
                                <h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${e?.title?we(Ge(e?.title,this.state??{},this.data??{})):n`<span class="page-title-placeholder">${we(Ge(u,this.state??{},this.data??{}))}</span>`}</h2>
                                ${e.kpisBelow&&e.badges?.length?e.badges.map(g=>zo(g,this.state??{},this.data??{},{pill:!0})):d}
                            </div>`:d}
                        ${e?.title&&m==1?n`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${we(Ge(e?.title,this.state??{},this.data??{}))}</h3>`:d}
                        ${e?.title&&m==2?n`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${we(Ge(e?.title,this.state??{},this.data??{}))}</h4>`:d}
                        ${e?.title&&m==3?n`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${we(Ge(e?.title,this.state??{},this.data??{}))}</h5>`:d}
                        ${e?.title&&m>3?n`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${we(Ge(e?.title,this.state??{},this.data??{}))}</h6>`:d}

                        ${e?.subtitle?n`<span style="display: inline-block; margin-block-end: 0.83em;">${we(Ge(e?.subtitle,this.state??{},this.data??{}))}</span>`:d}
                        ${e?.timestamp?n`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${we(Ge(e.timestamp,this.state??{},this.data??{}))}</span>`:d}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e.kpisBelow?d:e?.kpis?.map(g=>n`
                            <div class="header-fact">
                                <span class="header-fact-label">${this.evalLabel(g.title)}</span>
                                <span class="header-fact-value">${we(Ge(g.text,this.state??{},this.data??{}))}</span>
                            </div>
                        `)}
                        ${e?.header?.map(g=>x(this,g,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${t?this.renderPeerNav(t):d}
                        ${i.map(this.renderBtn)}
                        ${l}
                        ${this.renderActions(o)}
                    </div>
                </div>
            `:d}
            ${e.kpisBelow&&e?.kpis?.length?n`
                <div class="kpi-row">
                    ${e.kpis.map(g=>n`
                        <div class="kpi-pair">
                            <span class="kpi-label">${this.evalLabel(g.title)}</span>
                            <span class="kpi-value">${we(Ge(g.text,this.state??{},this.data??{}))}</span>
                        </div>
                    `)}
                </div>
            `:d}
            ${e.badges&&e.badges.length>0&&!e.kpisBelow?n`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(g=>zo(g,this.state??{},this.data??{},{pill:!0}))}
                </div>
            `:d}
        `}};Qe.styles=[k`
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

        /* The way back: a chevron sitting before the title, at its optical size rather than a
           button's. Quiet until pointed at, like the affordance it imitates — a detail view's back
           arrow is furniture, not an action competing with Save. */
        .back-chevron {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
            width: 2rem;
            height: 2rem;
            padding: 0;
            margin-inline-start: -0.35rem;
            border: none;
            border-radius: 50%;
            background: transparent;
            color: var(--lumo-secondary-text-color, #5a6270);
            cursor: pointer;
        }
        .back-chevron svg { width: 1.25rem; height: 1.25rem; }
        .back-chevron:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); color: inherit; }
        .back-chevron:focus-visible { outline: 2px solid var(--lumo-primary-color, #2563eb); outline-offset: 2px; }

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

        .breadcrumbs-bar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--lumo-space-xs, .25rem) var(--lumo-space-s, .5rem);
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #6b7280);
            padding-bottom: var(--lumo-space-xs, .25rem);
        }
        .breadcrumb-sep { color: var(--lumo-tertiary-text-color, #9ca3af); }
        .breadcrumb-current { color: var(--lumo-body-text-color, inherit); }

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
        /* @KPI in the header: the EntityHeader fact look (small-caps muted label over a bold
           value), like the front office stay's TOTAL RESERVA / AGENCIA */
        .header-fact {
            display: flex; flex-direction: column; gap: .1rem; min-width: 0;
            padding-inline-end: var(--lumo-space-s, .5rem);
        }
        .header-fact-label {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-tertiary-text-color, #999);
            white-space: nowrap;
        }
        .header-fact-value {
            font-size: var(--lumo-font-size-m, 1rem); font-weight: 600;
            color: var(--lumo-body-text-color, #222);
            white-space: nowrap; line-height: normal;
        }
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
        .overflow-menu.flip {
            right: auto;
            left: 0;
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

        ${Mt}
    `,Ta];Nt([h()],Qe.prototype,"metadata",2);Nt([h()],Qe.prototype,"baseUrl",2);Nt([h()],Qe.prototype,"state",2);Nt([h()],Qe.prototype,"data",2);Nt([h()],Qe.prototype,"appState",2);Nt([h()],Qe.prototype,"appData",2);Nt([b()],Qe.prototype,"_overflowOpen",2);Nt([b()],Qe.prototype,"_overflowN",2);Qe=Nt([_("mateu-content-header")],Qe);var _h=Object.defineProperty,Sh=Object.getOwnPropertyDescriptor,Ar=(e,t,a,r)=>{for(var i=r>1?void 0:r?Sh(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&_h(t,a,i),i};let ya=class extends Oi{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return n`
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
       `}};ya.styles=k`
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
    `;Ar([h()],ya.prototype,"state",2);Ar([h()],ya.prototype,"data",2);Ar([h()],ya.prototype,"appState",2);Ar([h()],ya.prototype,"appData",2);ya=Ar([_("mateu-form")],ya);const Ch=e=>{const t=e?.line;return typeof t=="number"&&t>1?Math.floor(t):1};function Il(e,t=a=>a){const a=[],r=new Map;for(const s of e??[]){const o=Ch(t(s));o===1?a.push(s):(r.has(o)||r.set(o,[]),r.get(o).push(s))}const i=[...r.keys()].sort((s,o)=>s-o).map(s=>r.get(s));return{first:a,extra:i}}function Eh(e,t=a=>a){const{first:a,extra:r}=Il(e,t);return[...a,...r.flat()]}var Ih=Object.defineProperty,Th=Object.getOwnPropertyDescriptor,Js=(e,t,a,r)=>{for(var i=r>1?void 0:r?Th(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Ih(t,a,i),i};let br=class extends I{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?n`${e.map(()=>n`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?n`${e.map(()=>n`<div class="bone row"></div>`)}`:this.variant=="form"?n`${e.map(()=>n`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:n`${e.map(()=>n`<div class="bone line"></div>`)}`}};br.styles=k`
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
    `;Js([h()],br.prototype,"variant",2);Js([h({type:Number})],br.prototype,"count",2);br=Js([_("mateu-skeleton")],br);const V=(e,t,a,r)=>{if(!e)return n``;const i=J.get()?.renderIcon;if(i){const s=i.call(J.get(),e,t,a);return r?n`<span slot="${r}">${s}</span>`:s}return n`<span class="mateu-icon ${a??""}" data-icon="${e}" aria-hidden="true"
                      style="display:inline-block; width:1em; height:1em; ${t??""}" slot="${r??d}"></span>`},Ah="vaadin:ban",Ph=e=>{const t=e??Ah;return t.includes(":")?J.get()?.renderIcon?V(t,"width: 1.8rem; height: 1.8rem;"):n`${e?d:"🗂"}`:n`${t}`},Oh=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},ma=(e,t,a,r,i,s)=>n`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${Ph(t)}</span>
            ${a?n`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${a}</span>`:d}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${r??e??"Nothing here yet."}</span>
            ${i&&s?n`
                <button style="margin-top: .25rem; font: inherit; font-weight: 500; cursor: pointer; padding: .4rem .9rem; border: none; border-radius: var(--lumo-border-radius-m, 6px); background: transparent; color: var(--lumo-primary-text-color, #3b5bdb);"
                        @click="${o=>Oh(o,i)}">${s}</button>
            `:d}
        </div>
    `,Rh=e=>{const t=e.metadata;return n`
        <div style="${e.style??d}" class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${ma(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},zh=e=>{const t=e.metadata;return n`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-skeleton>
    `},pr="ids",No="searchText",Ur="q";function Lh(e){if(e==null)return[];const t=Array.isArray(e)?e:String(e).split(","),a=[];for(const r of t){if(r==null)continue;const i=String(r).trim();i&&!a.includes(i)&&a.push(i)}return a}const Dh={en:{label:"Selection",many:e=>`${e} selected items`},es:{label:"Selección",many:e=>`${e} elementos seleccionados`}};function Mh(e,t){const a=Lh(e);if(!a.length)return;const r=Dh[sl()];return{label:r.label,display:a.length<=3?a.join(", "):r.many(a.length)}}const Tl="mateu-saved-views",zi=()=>{try{return JSON.parse(localStorage.getItem(Tl)??"{}")}catch{return{}}},Xs=e=>{try{localStorage.setItem(Tl,JSON.stringify(e))}catch{}},Al=e=>zi()[e]??[],Nh=(e,t)=>{const a=t.name?.trim();if(!a||Object.keys(t.values??{}).length===0)return;const r=zi(),i=(r[e]??[]).filter(s=>s.name!==a);i.push({...t,name:a}),r[e]=i,Xs(r)},Fh=(e,t)=>{const a=zi(),r=(a[e]??[]).filter(i=>i.name!==t);r.length===0?delete a[e]:a[e]=r,Xs(a)},qh=(e,t)=>{const a=zi();a[e]=(a[e]??[]).map(r=>({...r,isDefault:r.name===t?!r.isDefault:!1})),Xs(a)},Bh=e=>Al(e).find(t=>t.isDefault);var Uh=Object.defineProperty,jh=Object.getOwnPropertyDescriptor,Ue=(e,t,a,r)=>{for(var i=r>1?void 0:r?jh(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Uh(t,a,i),i};let xe=class extends I{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.viewsOpened=!1,this.draftText="",this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{const e=this.filters.flatMap(a=>this.isRangeFilter(a)?[`${a.fieldId}_from`,`${a.fieldId}_to`]:[a.fieldId]);e.push(pr);const t={searchText:void 0};e.forEach(a=>{t[a]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return(this.metadata?.filters??[]).filter(e=>!e.readOnly)}get scopeFilters(){return(this.metadata?.filters??[]).filter(e=>e.readOnly)}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){const t=this.filters.find(a=>a.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e==="searchText"?"":void 0),this.requestSearch()}commitText(e){this.emitValueChanged("searchText",e.value),this.draftText="",e.value="",this.requestSearch()}get viewsScope(){return window.location.pathname}allFilterKeys(){return["searchText",...this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])]}snapshotValues(){const e={};return this.state.searchText&&(e.searchText=this.state.searchText),this.filters.forEach(t=>{if(this.isSet(t))if(this.isRangeFilter(t)){const a=this.rangeBound(t,"from"),r=this.rangeBound(t,"to");a&&(e[`${t.fieldId}_from`]=a),r&&(e[`${t.fieldId}_to`]=r)}else this.isMultiFilter(t)?e[t.fieldId]=this.multiValues(t):e[t.fieldId]=this.state[t.fieldId]}),e}applyView(e){const t=this.allFilterKeys(),a={};t.forEach(r=>{a[r]=void 0}),this.state={...this.state,...a},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:t},bubbles:!0,composed:!0})),Object.entries(e.values).forEach(([r,i])=>this.emitValueChanged(r,i)),this.viewsOpened=!1,this.detachOutsideClick(),this.requestSearch()}saveCurrentView(e){const t=e.value.trim();t&&(Nh(this.viewsScope,{name:t,values:this.snapshotValues()}),e.value="",this.requestUpdate())}firstUpdated(){if(window.location.search)return;const e=Bh(this.viewsScope);e&&setTimeout(()=>{this.state.searchText||this.filters.some(a=>this.isSet(a))||this.applyView(e)},0)}isBooleanFilter(e){return e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle"}isNumericFilter(e){return["integer","decimal","number","money"].includes(e.dataType??"")}isRangeFilter(e){return e.stereotype==="dateRange"||e.stereotype==="numberRange"}isMultiFilter(e){return e.stereotype==="multiSelect"}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){const t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t=="string"&&t!==""?t.split(",").map(a=>a.trim()).filter(a=>a):[]}rangeBound(e,t){const a=this.state[`${e.fieldId}_${t}`];return a==null?"":String(a)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,"from")!==""||this.rangeBound(e,"to")!=="";if(this.isMultiFilter(e))return this.multiValues(e).length>0;const t=this.state[e.fieldId];return t!=null&&t!==""&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){const a=e.options.find(r=>r.value===String(t));if(a)return a.label??a.value}return typeof t=="boolean"?t?"Yes":"No":String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){const t=this.rangeBound(e,"from"),a=this.rangeBound(e,"to");return t&&a?`${t} – ${a}`:t?`≥ ${t}`:`≤ ${a}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(", "):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return G(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,a="panel-row"){return n`
            <div class="${a}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){const t=e.stereotype==="numberRange"?"number":e.dataType==="dateTime"?"datetime-local":e.dataType==="time"?"time":"date",a=i=>{const s=i.closest(".panel-input-row"),o=s.querySelector("input.range-from").value,l=s.querySelector("input.range-to").value;this.emitValueChanged(`${e.fieldId}_from`,o===""?void 0:o),this.emitValueChanged(`${e.fieldId}_to`,l===""?void 0:l),this.requestSearch()},r=i=>{i.key==="Enter"&&a(i.target),i.key==="Escape"&&this.closePanel()};return n`
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
            </div>`}renderMultiWidget(e){const t=this.multiValues(e),a=r=>{const i=t.includes(r)?t.filter(s=>s!==r):[...t,r];this.emitValueChanged(e.fieldId,i.length>0?i:void 0),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))};return n`${(e.options??[]).map(r=>this.panelRow(n`
            <span class="multi-check ${t.includes(r.value)?"multi-check--on":""}"
                  aria-hidden="true">${t.includes(r.value)?"✓":""}</span>
            ${r.label??r.value}
        `,()=>a(r.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return n`${e.options.map(r=>this.panelRow(r.label??r.value,()=>this.applyFilter(e.fieldId,r.value)))}`;if(this.isBooleanFilter(e))return n`
                ${this.panelRow("Yes",()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow("No",()=>this.applyFilter(e.fieldId,!1))}`;const t=this.isNumericFilter(e),a=r=>{r.value!==""&&this.applyFilter(e.fieldId,t?Number(r.value):r.value)};return n`
            <div class="panel-input-row">
                <input type="${t?"number":"text"}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${r=>r.stopPropagation()}"
                       @keydown="${r=>{r.key==="Enter"&&a(r.target),r.key==="Escape"&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${r=>a(r.target.previousElementSibling)}">Apply</button>
            </div>`}renderViewsPanel(){if(!this.viewsOpened)return d;const e=Al(this.viewsScope),t=!!this.state.searchText||this.filters.some(a=>this.isSet(a));return n`
            <div class="panel views-panel">
                <div class="panel-caption">Saved views</div>
                ${e.length===0?n`
                    <div class="panel-row views-empty">No saved views yet</div>`:d}
                ${e.map(a=>n`
                    <div class="panel-row view-row" @mousedown="${this.keepFocus}">
                        <span class="view-name" @click="${()=>this.applyView(a)}">${a.name}</span>
                        <button class="view-star ${a.isDefault?"view-star--on":""}"
                                title="${a.isDefault?"Unset as default":"Open this listing with this view"}"
                                @click="${()=>{qh(this.viewsScope,a.name),this.requestUpdate()}}">★</button>
                        <button class="chip-remove" aria-label="Delete view ${a.name}"
                                @click="${()=>{Fh(this.viewsScope,a.name),this.requestUpdate()}}">✕</button>
                    </div>`)}
                ${t?n`
                    <div class="panel-input-row" @mousedown="${a=>a.stopPropagation()}">
                        <input class="view-name-input" type="text" placeholder="Save current view as…"
                               @keydown="${a=>{a.key==="Enter"&&this.saveCurrentView(a.target),a.key==="Escape"&&(this.viewsOpened=!1)}}"/>
                        <button class="apply-button"
                                @click="${a=>this.saveCurrentView(a.target.previousElementSibling)}">Save</button>
                    </div>`:n`
                    <div class="panel-row views-empty">Apply some filters to save a view</div>`}
            </div>`}renderPanel(){if(!this.panelOpened||this.filters.length===0)return d;if(this.activeFilter){const t=this.activeFilter;return n`
                <div class="panel">
                    <div class="panel-row panel-header"
                         @mousedown="${this.keepFocus}"
                         @click="${()=>{this.activeFilter=void 0}}">
                        <span aria-hidden="true">←</span> ${this.labelOf(t)}
                    </div>
                    ${this.renderActiveFilterWidget(t)}
                </div>`}const e=!!this.state.searchText||this.filters.some(t=>this.isSet(t));return n`
            <div class="panel">
                <div class="panel-caption">Filter by</div>
                ${this.filters.map(t=>this.panelRow(n`
                    ${this.labelOf(t)}
                    ${this.isSet(t)?n`<span class="current-value">${this.conditionDisplay(t)}</span>`:d}
                `,()=>{this.activeFilter=t}))}
                ${e?this.panelRow("Clear filters",this.clearAllFilters,"panel-row panel-footer"):d}
            </div>`}render(){const e=[];this.state.searchText&&e.push({fieldId:"searchText",label:"Text",display:String(this.state.searchText)});const t=this.filters.some(a=>a.fieldId===pr)?void 0:Mh(this.state[pr]);return t&&e.push({fieldId:pr,label:t.label,display:t.display}),this.filters.forEach(a=>{this.isSet(a)&&e.push({fieldId:a.fieldId,label:this.labelOf(a),display:this.conditionDisplay(a)})}),n`
            <div class="smart-search">
                <div class="bar"
                     @click="${a=>{a.currentTarget.querySelector("input.free-text")?.focus(),this.openPanel()}}">
                    <svg aria-hidden="true" class="magnifier" width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
                    </svg>
                    ${this.scopeFilters.filter(a=>this.isSet(a)).map(a=>n`
                        <span theme="badge pill" class="chip chip-scope" title="Fixed by the page">
                            <span class="chip-label">${this.labelOf(a)}:</span> ${this.conditionDisplay(a)}
                        </span>`)}
                    ${e.map(a=>n`
                        <span theme="badge contrast pill" class="chip">
                            <span class="chip-label">${a.label}:</span> ${a.display}
                            <button class="chip-remove" aria-label="Remove filter ${a.label}"
                                    @mousedown="${this.keepFocus}"
                                    @click="${r=>{r.stopPropagation(),this.removeChip(a.fieldId)}}">✕</button>
                        </span>`)}
                    ${this.metadata?.searchable!==!1?n`
                        <input class="free-text" type="text" id="searchText"
                               placeholder="${e.length===0?"Search":""}"
                               autofocus="${this.metadata?.autoFocusOnSearchText?!0:d}"
                               .value="${this.draftText??""}"
                               @input="${a=>{this.draftText=a.target.value,this.openPanel()}}"
                               @keydown="${a=>{a.key==="Enter"&&this.commitText(a.target),a.key==="Escape"&&this.closePanel()}}"/>
                    `:d}
                    <button class="views-button" title="Saved views" aria-label="Saved views"
                            @mousedown="${this.keepFocus}"
                            @click="${a=>{a.stopPropagation(),this.closePanel(),this.viewsOpened=!this.viewsOpened,this.viewsOpened&&(this.outsideClick=r=>{r.composedPath().includes(this)||(this.viewsOpened=!1,this.detachOutsideClick())},document.addEventListener("mousedown",this.outsideClick))}}">
                        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"/>
                        </svg>
                    </button>
                </div>
                ${this.renderPanel()}
                ${this.renderViewsPanel()}
            </div>
            <slot></slot>
        `}};xe.styles=k`
        ${Mt}
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
        .chip-scope {
            /* the listing's scope: no remove button, and a distinct, quieter look than a condition */
            padding-inline-end: var(--lumo-space-s, 0.5rem);
            background: var(--lumo-primary-color-10pct, #e6efff);
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
    `;Ue([h()],xe.prototype,"metadata",2);Ue([h()],xe.prototype,"baseUrl",2);Ue([b()],xe.prototype,"state",2);Ue([b()],xe.prototype,"data",2);Ue([h()],xe.prototype,"appState",2);Ue([h()],xe.prototype,"appData",2);Ue([h({type:Boolean})],xe.prototype,"searchOnly",2);Ue([b()],xe.prototype,"panelOpened",2);Ue([b()],xe.prototype,"viewsOpened",2);Ue([b()],xe.prototype,"activeFilter",2);Ue([b()],xe.prototype,"draftText",2);xe=Ue([_("mateu-filter-bar")],xe);const Pl="mateu-column-prefs",Qs=()=>{try{const e=JSON.parse(localStorage.getItem(Pl)??"{}");return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}},Ol=e=>{try{localStorage.setItem(Pl,JSON.stringify(e))}catch{}},Zs=e=>{if(!e||typeof e!="object")return;const t=a=>Array.isArray(a)?a.filter(r=>typeof r=="string"):[];return{hidden:t(e.hidden),order:t(e.order)}},Rl=e=>Zs(Qs()[e]),Hh=(e,t)=>{const a=Qs(),r=Zs(t);r.hidden.length===0&&r.order.length===0?delete a[e]:a[e]=r,Ol(a)},Wh=e=>{const t=Qs();delete t[e],Ol(t)},zl=e=>e?!!e.identifier||e.dataType==="action"||e.dataType==="actionGroup"||e.dataType==="menu"||e.id==="select"||e.id==="menu":!1,Ll=(e,t,a=r=>r)=>{const r=Zs(t);if(!r||r.hidden.length===0&&r.order.length===0)return e;const i=m=>a(m)?.id??m.id,s=new Set(r.hidden),o=e.filter(m=>{const f=i(m);return!f||!s.has(f)||zl(a(m))});if(r.order.length===0)return o.length===e.length?e:o;const l=new Map;o.forEach(m=>{const f=i(m);f&&!l.has(f)&&l.set(f,m)});const c=[],u=new Set;return r.order.forEach(m=>{const f=l.get(m);f&&!u.has(f)&&(c.push(f),u.add(f))}),o.forEach(m=>{u.has(m)||(c.push(m),u.add(m))}),c.length===e.length&&c.every((m,f)=>m===e[f])?e:c};var Vh=Object.defineProperty,Gh=Object.getOwnPropertyDescriptor,Pr=(e,t,a,r)=>{for(var i=r>1?void 0:r?Gh(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Vh(t,a,i),i};let $a=class extends I{constructor(){super(...arguments),this.columns=[],this.scope="",this.panelOpened=!1,this.revision=0,this.togglePanel=()=>{if(this.panelOpened){this.closePanel();return}this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick)},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1},this.reset=()=>{Wh(this.scope),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}get prefs(){return Rl(this.scope)??{hidden:[],order:[]}}effectiveEntries(e){return Ll(this.columns,{hidden:[],order:e.order})}commit(e){Hh(this.scope,e),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}toggleVisibility(e){const t=this.prefs,a=t.hidden.includes(e)?t.hidden.filter(r=>r!==e):[...t.hidden,e];this.commit({...t,hidden:a})}move(e,t){const a=this.prefs,r=[...this.effectiveEntries(a)],i=r.findIndex(l=>l.id===e);if(i<0)return;let s=i+t;for(;s>=0&&s<r.length&&r[s].protected;)s+=t;if(s<0||s>=r.length)return;const o=r[i];r[i]=r[s],r[s]=o,this.commit({...a,order:r.map(l=>l.id)})}render(){this.revision;const e=this.prefs,t=this.effectiveEntries(e).filter(r=>!r.protected);if(t.length===0)return n``;const a=e.hidden.length>0||e.order.length>0;return n`
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
                ${this.panelOpened?n`
                    <div class="panel" role="menu">
                        <div class="panel-title">Columns</div>
                        ${t.map((r,i)=>{const s=e.hidden.includes(r.id);return n`
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
                `:d}
            </div>
        `}};$a.styles=k`
        /* Exactly as tall as the search box beside it, and square: it stretches to the filter row
           and takes the same vertical padding the search box sits in (mateu-filter-bar's
           .smart-search), so a taller search field does not leave it half its height and it does
           not reach past the field to touch the table. */
        :host {
            display: block;
            flex: none;
            align-self: stretch;
            box-sizing: border-box;
            padding-block: var(--lumo-space-xs, 0.25rem);
        }
        .chooser {
            position: relative;
            height: 100%;
        }
        .trigger {
            border: none;
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            cursor: pointer;
            height: 100%;
            min-height: var(--lumo-size-m, 2.25rem);
            aspect-ratio: 1;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
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
    `;Pr([h()],$a.prototype,"columns",2);Pr([h()],$a.prototype,"scope",2);Pr([b()],$a.prototype,"panelOpened",2);Pr([b()],$a.prototype,"revision",2);$a=Pr([_("mateu-column-chooser")],$a);async function Kh(e){return{}}function va(e,t){return t?t.split(".").reduce((a,r)=>a!=null&&typeof a=="object"?a[r]:void 0,e):e}function Dl(e,t,a="value",r="label"){const i=va(e,t);return Array.isArray(i)?i.map(s=>{if(s!=null&&typeof s=="object"){const o=va(s,a),l=va(s,r);return{value:o??l,label:String(l??o??"")}}return{value:s,label:String(s)}}):[]}function Ml(e,t,a,r=i=>i){const i=va(e,t);return Array.isArray(i)?i.map(s=>{const o={};for(const l of a)o[l]=va(s,r(l));return o}):[]}async function Ua(e,t=i=>i,a=fetch,r){const i=Xa(e),s=(i.method||"GET").toUpperCase();if(!i.url)throw new Error(`External REST fetch has no url${e.ref?` (unknown source "${e.ref}")`:""}`);const o=t(i.url)??i.url,l={};for(const[m,f]of Object.entries(i.headers??{}))l[m]=t(f)??f;Object.assign(l,await Kh());const c={method:s,headers:l};if(s!=="GET"&&s!=="HEAD"&&i.body){const m=r&&Rc(l)?r:t;c.body=m(i.body)??i.body}const u=await a(o,c);if(!u.ok)throw new Error(`External REST fetch failed: ${u.status}`);if(u.status===204||u.status===205)return null;if(typeof u.text!="function")return u.json();const p=await u.text();return p.trim()===""?null:JSON.parse(p)}async function Yh(e,t=r=>r,a=fetch){const r=await Ua(e,t,a),i=Xa(e);return Dl(r,i.itemsPath,i.valuePath,i.labelPath)}async function Jh(e,t,a=i=>i,r=fetch){const i=await Ua(e,a,r),s=Xa(e);return Ml(i,s.itemsPath,t,o=>Wn(e,o))}async function Xh(e,t,a=i=>i,r=fetch){const i=await Ua(e,a,r);return Nl(i,e,t)}function Nl(e,t,a){const r=Xa(t),i=Ml(e,r.itemsPath,a,l=>Wn(t,l)),s=va(e,Vn(t)),o=typeof s=="number"?s:Number(s);return{rows:i,total:Number.isFinite(o)?o:null}}const fa=e=>e==null||e===""||typeof e=="number"&&Number.isNaN(e),Qh=e=>e.stereotype==="dateRange"||e.stereotype==="numberRange",Zh=e=>e.stereotype==="multiSelect",ep=e=>e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle",tp=e=>Array.isArray(e)?e.map(String):typeof e=="string"&&e!==""?e.split(",").map(t=>t.trim()).filter(t=>t):[],ap=(e,t,a,r)=>{if(r){const s=Number(e);return!(e===""||e==null||Number.isNaN(s)||!fa(t)&&s<Number(t)||!fa(a)&&s>Number(a))}const i=e==null?"":String(e);return!(i===""||!fa(t)&&i<String(t)||!fa(a)&&i>String(a))},rp=(e,t,a)=>{const r=t.fieldId;if(!r)return!0;const i=e[r];if(Qh(t)){const o=a[`${r}_from`],l=a[`${r}_to`];return fa(o)&&fa(l)?!0:ap(i,o,l,t.stereotype==="numberRange")}if(Zh(t)){const o=tp(a[r]);return o.length===0?!0:o.includes(String(i??""))}const s=a[r];if(fa(s))return!0;if(ep(t)){const o=typeof s=="boolean"?s:String(s).toLowerCase()==="true",l=typeof i=="boolean"?i:String(i??"").toLowerCase()==="true";return o===l}return(t.options?.length??0)>0?String(i??"")===String(s):String(i??"").toLowerCase().includes(String(s).toLowerCase())};function ip(e,t,a,r){const i=String(r?.searchText??"").trim().toLowerCase(),s=(a??[]).filter(o=>o?.fieldId);return i===""&&s.length===0?e:e.filter(o=>i!==""&&!t.some(l=>String(o[l]??"").toLowerCase().includes(i))?!1:s.every(l=>rp(o,l,r??{})))}const Ji=e=>{const t=Number(e);return Number.isFinite(t)&&t>0?Math.floor(t):0},sp=(e,t,a)=>{const r=Ji(e),i=Ji(t),s=Ji(a);if(i===0)return{totalPages:void 0,currentPage:s,multiPage:s>0,isFirst:s===0,isLast:!0};const o=Math.max(1,Math.ceil(r/i)),l=Math.min(s,o-1);return{totalPages:o,currentPage:l,multiPage:o>1,isFirst:l===0,isLast:l>=o-1}};var op=Object.defineProperty,np=Object.getOwnPropertyDescriptor,Li=(e,t,a,r)=>{for(var i=r>1?void 0:r?np(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&op(t,a,i),i};let ja=class extends I{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return d;const{totalPages:e,currentPage:t,multiPage:a,isFirst:r,isLast:i}=sp(this.totalElements,this.pageSize,this.pageNumber);return n`
            <div class="bar">
                ${a?n`
                    <button class="nav" title="First page" ?disabled="${r}"
                        @click="${()=>this.dispatch(0)}" data-testid="page-first">«</button>
                    <button class="nav" title="Previous page" ?disabled="${r}"
                        @click="${()=>this.dispatch(t-1)}" data-testid="page-prev">‹</button>
                    <span class="page-indicator">Page ${t+1}${e!=null?n` of ${e}`:d}</span>
                    <button class="nav" title="Next page" ?disabled="${i}"
                        @click="${()=>this.dispatch(t+1)}" data-testid="page-next">›</button>
                    <button class="nav" title="Last page" ?disabled="${i||e==null}"
                        @click="${()=>this.dispatch(e-1)}" data-testid="page-last">»</button>
                    <span class="separator"></span>
                `:d}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?"":"s"}</span>
                <slot></slot>
            </div>
        `}};ja.styles=k`
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
    `;Li([h()],ja.prototype,"totalElements",2);Li([h()],ja.prototype,"pageSize",2);Li([h()],ja.prototype,"pageNumber",2);ja=Li([_("mateu-pagination")],ja);const Fl=(e,t,a=!1)=>e&&e>1||a?n`<div style="grid-column: span ${e&&e>1?e:1}; min-width: 0;">${t}</div>`:t,er="var(--lumo-space-m, 1rem)",lp=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=l.columnWidth||"13rem";let p=`display: grid; grid-template-columns: ${l.maxColumns&&l.maxColumns>0?`repeat(${l.maxColumns}, minmax(0, 1fr))`:`repeat(auto-fill, minmax(min(100%, ${c}), 1fr))`}; gap: ${er} var(--lumo-space-l, 1.5rem); align-items: start;`;return l.labelsAside&&(p+=" --mateu-label-width: 10rem;"),l.fullWidth&&(p+=" width: 100%;"),p+=t.style??"",n`
        <div id="${t.id??d}" style="${p}" class="${t.cssClasses}" slot="${t.slot||d}">
            ${t.children?.map(m=>ql(l,e,m,a,r,i,s,o))}
        </div>
    `},ql=(e,t,a,r,i,s,o,l)=>{if(a.type==re.ClientSide&&a.metadata?.type==v.FormRow)return up(e,t,a,r,i,s,o,l);const c=dp(a),u=e.labelsAside?cp(t,a,r,i,s,o,l):x(t,a,r,i,s,o,l);return Fl(c,u,!0)},dp=e=>{if(e.type==re.ClientSide){const t=e.metadata;if(t?.type==v.FormField)return t.colspan||1}return 1},cp=(e,t,a,r,i,s,o)=>{if(t.type==re.ClientSide&&t.metadata?.type==v.FormField&&t.metadata.label){const l=t.metadata,c=l.label?.includes("${")?e._evalTemplate(l.label):l.label;return n`
            <div style="display: flex; gap: ${er}; align-items: baseline;">
                <label style="flex: 0 0 var(--mateu-label-width, 10rem); color: var(--lumo-secondary-text-color, #667);">${c}</label>
                <div style="flex: 1; min-width: 0;">${x(e,t,a,r,i,s,o,!0)}</div>
            </div>
        `}return x(e,t,a,r,i,s,o)},up=(e,t,a,r,i,s,o,l)=>n`
        <div style="grid-column: 1 / -1; display: flex; gap: ${er}; flex-wrap: wrap;">
            ${a.children?.map(c=>n`<div style="flex: 1 1 ${100/Math.max(1,a.children.length)}%; min-width: min(100%, 13rem);">${ql(e,t,c,r,i,s,o,l)}</div>`)}
        </div>
    `,Bl=(e,t,a,r,i,s,o,l)=>{const c=a.metadata;let u=`display: flex; flex-direction: ${e};`;c.spacing&&(u+=` gap: ${er};`),c.padding&&(u+=" padding: var(--lumo-space-m, 1rem);"),c.wrap&&(u+=" flex-wrap: wrap;"),c.fullWidth&&(u+=" width: 100%;"),c.justification&&(u+=` justify-content: ${c.justification};`);const p=e==="row"?c.verticalAlignment:c.horizontalAlignment;return p&&(u+=` align-items: ${p};`),u+=a.style??"",n`
        <div id="${a.id??d}" style="${u}" class="${a.cssClasses}" slot="${a.slot??d}">
            ${a.children?.map(m=>x(t,m,r,i,s,o,l))}
        </div>
    `},hp=(e,t,a,r,i,s,o)=>Bl("row",e,t,a,r,i,s,o),pp=(e,t,a,r,i,s,o)=>Bl("column",e,t,a,r,i,s,o),mp=(e,t,a,r,i,s,o)=>{const l=t.metadata;let u=`display: flex; flex-direction: ${l.orientation==="vertical"?"column":"row"}; gap: var(--lumo-space-s, 0.5rem);`;return l.fullWidth&&(u+=" width: 100%;"),u+=t.style??"",n`
        <div id="${t.id??d}" style="${u}" class="${t.cssClasses}" slot="${t.slot??d}">
            <div style="flex: 1; min-width: 0; min-height: 0;">${x(e,t.children[0],a,r,i,s,o)}</div>
            <div style="flex: 1; min-width: 0; min-height: 0;">${x(e,t.children[1],a,r,i,s,o)}</div>
        </div>
    `},fp=(e,t,a,r,i,s,o)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,u=!!i?.hasDetail||!!l,p=c??l;return n`
        <div id="${t.id??d}" style="display: flex; gap: var(--lumo-space-m, 1rem); ${t.style??""}" class="${t.cssClasses}" slot="${t.slot??d}">
            <div style="flex: 1; min-width: 0;">${x(e,t.children[0],a,r,i,s,o)}</div>
            ${u&&p?n`<div style="flex: 1; min-width: 0;">${x(e,p,a,r,i,s,o)}</div>`:n`<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem);">Select an item to view details</div>`}
        </div>
    `},vp=(e,t,a,r,i,s,o)=>{let l=t.style??"";t.metadata.fullWidth&&(l+=" width: 100%;");const c=Math.max(0,(t.children??[]).findIndex(u=>u.metadata.active));return n`
        <div id="${t.id??d}" style="${l}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map((u,p)=>{const m=u,f=m.metadata.label,g=f?.includes("${")?e._evalTemplate(f):f;return n`
                    <details ?open="${p===c}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));">
                        <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600;">${g}</summary>
                        <div style="padding: var(--lumo-space-m, 1rem) 0;">
                            ${m.children?.map(y=>x(e,y,a,r,i,s,o))}
                        </div>
                    </details>
                `})}
        </div>
    `},gp=(e,t,a,r,i,s,o)=>{const l=t.metadata;let c=t.style??"";return l.fullWidth&&(c+=" width: 100%;"),n`
        <div style="${c}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(u=>bp(e,u,a,r,i,s,o,l.variant))}
        </div>
    `},bp=(e,t,a,r,i,s,o,l)=>{const c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return n`
        <details ?open="${c.active}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); ${t.style??""}" class="${t.cssClasses}">
            <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600; ${c.disabled?"pointer-events: none; opacity: .5;":""}">${u}</summary>
            <div style="padding: var(--lumo-space-s, .5rem) 0;">
                ${t.children?.map(p=>x(e,p,a,r,i,s,o))}
            </div>
        </details>
    `},yp=(e,t,a,r,i,s,o)=>n`
        <div style="overflow: auto; ${t.style??""}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(l=>x(e,l,a,r,i,s,o))}
        </div>
    `,$p=(e,t,a,r,i,s,o)=>n`
        <div style="width: 100%; ${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(l=>x(e,l,a,r,i,s,o))}
        </div>
    `,wp=(e,t,a,r,i,s,o)=>n`
        <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(l=>x(e,l,a,r,i,s,o))}
        </div>
    `,xp=(e,t,a,r,i,s,o)=>n`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: ${er}; ${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(l=>x(e,l,a,r,i,s,o))}
        </div>
    `,kp=(e,t,a,r,i,s,o)=>n`
        <div style="display: flex; gap: ${er}; flex-wrap: wrap; ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(l=>x(e,l,a,r,i,s,o))}
        </div>
    `,_p=(e,t,a,r,i,s,o)=>{const l=t.metadata;return n`
        <div style="flex: ${l.boardCols??1} 1 0; min-width: min(100%, 12rem); ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(c=>x(e,c,a,r,i,s,o))}
        </div>
    `},Sp=(e,t,a,r,i,s,o)=>{const l=t.metadata;return n`
        <div
                style="display: flex; flex-direction: column; overflow: auto; ${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${l.page.content.map(c=>x(e,c,a,r,i,s,o))}
        </div>
    `},Cp=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,Ul=e=>typeof e=="string"&&Cp.test(e),Ep=e=>Ul(e)?"…-"+e.substring(e.lastIndexOf("-")+1):e,Ip=e=>t=>{t.clipboardData&&(t.clipboardData.setData("text/plain",e),t.preventDefault())},yr=e=>Ul(e)?n`<span class="mateu-uuid" data-uuid="${e}" title="${e}"
                     @copy="${Ip(e)}">${Ep(e)}</span>`:e,Tp=e=>{const t=e.metadata;return(t?.content??t?.columns??[]).filter(r=>r&&r.metadata).map(r=>{const i=r.metadata;return{id:r.id??"",label:i?.label??r.id??"",autoWidth:i?.autoWidth,width:i?.width}})},Fo=(e,t)=>{const a=e?.[t];return a==null?"":typeof a=="object"?a.text??a.label??a.value??"":String(a)},xs=(e,t,a)=>{const r=Tp(e),i="text-align:left; padding:.45rem .6rem; border-bottom:2px solid var(--lumo-contrast-20pct,rgba(0,0,0,.2)); font-weight:600; white-space:nowrap; color: var(--lumo-secondary-text-color,#556);",s="padding:.4rem .6rem; border-bottom:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.08)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:24rem;";return n`
        <div style="overflow:auto; width:100%; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            <table style="border-collapse:collapse; width:100%; font-size: var(--lumo-font-size-s,.875rem);">
                <thead><tr>${r.map(o=>n`<th style="${i}">${o.label}</th>`)}</tr></thead>
                <tbody>
                    ${(t??[]).length===0?n`<tr><td colspan="${Math.max(1,r.length)}" style="padding:1.5rem; text-align:center; color: var(--lumo-secondary-text-color,#888);">${a??"No data."}</td></tr>`:t.map(o=>n`<tr>${r.map(l=>n`<td style="${s}" title="${Fo(o,l.id)}">${yr(Fo(o,l.id))}</td>`)}</tr>`)}
                </tbody>
            </table>
        </div>
    `},qo=(e,t)=>{const a=e.metadata;return e.id&&t&&t[e.id]?t[e.id]:a?.page?.content??[]},Ap=e=>{const a=e.metadata.items??[];return n`
        <div class="mateu-message-list ${e.cssClasses??""}"
             style="display:flex; flex-direction:column; gap:.75rem; ${e.style??""}"
             slot="${e.slot??d}">
            ${a.map(r=>n`
                <div style="display:flex; gap:.6rem; align-items:flex-start;">
                    <span style="flex:0 0 auto; width:2rem; height:2rem; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:.8rem; background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);">
                        ${r.userImg?n`<img src="${r.userImg}" alt="" style="width:100%; height:100%; object-fit:cover;">`:r.userAbbr??(r.userName?r.userName.charAt(0):"?")}
                    </span>
                    <div style="min-width:0;">
                        <div style="display:flex; gap:.5rem; align-items:baseline;">
                            ${r.userName?n`<span style="font-weight:600;">${r.userName}</span>`:d}
                            ${r.time?n`<span style="font-size:var(--lumo-font-size-xs,.75rem); color:var(--lumo-secondary-text-color,#666);">${r.time}</span>`:d}
                        </div>
                        <div style="white-space:pre-wrap; overflow-wrap:anywhere;">${r.text}</div>
                    </div>
                </div>
            `)}
        </div>
    `},jl=(e,t,a,r,i,s,o)=>t.separator?n`<span style="align-self: stretch; width: 1px; background: var(--lumo-contrast-20pct, rgba(0,0,0,.2));"></span>`:t.submenus?n`
            <details style="position: relative;">
                <summary style="cursor: pointer; list-style: none; padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);">
                    ${t.component?x(e,t.component,a,r,i,s,o):t.label} ▾
                </summary>
                <div style="display: flex; flex-direction: column; gap: .1rem; padding: .3rem; min-width: 10rem;
                            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px);
                            background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15));">
                    ${t.submenus.map(l=>jl(e,l,a,r,i,s,o))}
                </div>
            </details>
        `:n`
        <span class="${t.className??""}"
              style="cursor: ${t.disabled?"default":"pointer"}; opacity: ${t.disabled?.5:1};
                     padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
                     ${t.selected?"background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));":""}">
            ${t.component?x(e,t.component,a,r,i,s,o):t.label}
        </span>
    `,Pp=(e,t,a,r,i,s,o)=>{const l=t.metadata;return n`
        <div style="display: flex; flex-wrap: wrap; gap: .25rem; align-items: center; ${t.style}"
             class="${t.cssClasses}" slot="${t.slot??d}">
            ${l.options?.map(c=>jl(e,c,a,r,i,{},{}))}
        </div>
    `},Op=(e,t,a,r,i,s,o)=>{const l=t.metadata;return n`
        <div style="${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${x(e,l.wrapped,a,r,i,s,o)}
        </div>
    `},Rp=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=l.content?.metadata,u=c?.type==v.Notice&&c.fullWidth===!0;return n`
        <div style="display:flex; flex-direction:column; ${u?"width: 100%; ":""}${t.style}"
             class="${t.cssClasses}"
             slot="${t.slot??d}"
             data-colspan="${l.colspan||(u?99:d)}"
        >
            ${l.label?n`<label style="font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${l.label}</label>`:d}
            ${x(e,l.content,a,r,i,s,o)}
        </div>
            `},zp=e=>{const t=e.metadata,a=r=>{const i=r.closest(".mateu-message-input")?.querySelector("input"),s=i?.value??"";!t.actionId||!s.trim()||(r.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:s}},bubbles:!0,composed:!0})),i&&(i.value=""))};return n`
        <div class="mateu-message-input ${e.cssClasses??""}"
             style="display:flex; gap:.5rem; align-items:center; ${e.style??""}"
             slot="${e.slot??d}">
            <input type="text"
                   style="flex:1; min-width:0; font:inherit; padding:.5rem .75rem; border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16)); border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513);"
                   @keydown="${r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),a(r.currentTarget))}}">
            <button style="font:inherit; font-weight:500; cursor:pointer; padding:.5rem 1rem; border:none; border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);"
                    @click="${r=>a(r.currentTarget)}">Send</button>
        </div>
    `},Lp=(e,t,a,r,i,s,o)=>{const l=t.metadata;return n`<span title="${l.text}" style="${t.style}" class="${t.cssClasses}" slot="${t.slot??d}"
        >${x(e,l.wrapped,a,r,i,s,o)}</span>`},Dp=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const a in e){const r=e[a];["number","string","boolean"].indexOf(typeof r)>=0&&(t[a]=e[a])}return t},Mp=(e,t,a,r,i)=>{const s={appState:r??{},appData:i??{}},o={};for(const l in e.attributes)o[l]=G(e.attributes[l],t,a,s);return{attributes:o,content:G(e.content,t,a,s)}},Bo=(e,t,a,r)=>{for(let i in r.attributes)e.setAttribute(i,r.attributes[i]);a.style&&e.setAttribute("style",a.style),a.cssClasses&&e.setAttribute("class",a.cssClasses),a.slot&&e.setAttribute("slot",a.slot),r.content&&(t.html?e.innerHTML=t.content?.includes("${")?$l(r.content):r.content:e.append(r.content))},Np=e=>{const t=e.name,a=e.attributes?e.attributes.import:void 0;a&&t.includes("-")&&!customElements.get(t)&&import(a)},Fp=(e,t,a,r,i,s,o)=>{Np(t);const l=Mp(t,r,i,s,o);let c=t.name;l.attributes.id&&(c="#"+l.attributes.id);const u=a.id?`.element-container[data-element-id="${a.id}"]`:".element-container";return setTimeout(()=>{const p=e.shadowRoot?.querySelector(u),m=p?.querySelector(c);if(m){for(;m.firstChild;)m.removeChild(m.lastChild);Bo(m,t,a,l)}else{const f=document.createElement(t.name);Bo(f,t,a,l);for(let g in t.on)f.addEventListener(g,y=>{const $=Dp(y);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[g],parameters:{event:$}},bubbles:!0,composed:!0}))});p?.appendChild(f)}}),n`<div class="element-container" data-element-id="${M(a.id)}"></div>`};var Je=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(Je||{});const qp=(e,t,a,r,i)=>{const s={...e.metadata};s.container??=Je.div;const o=s.attributes?.["data-colspan"],l=gr(s.text,t,a,r,i),c={xl:"var(--lumo-font-size-xl, 1.375rem)",l:"var(--lumo-font-size-l, 1.125rem)",s:"var(--lumo-font-size-s, .875rem)",xs:"var(--lumo-font-size-xs, .8125rem)"},u=(s.size&&c[s.size]?`font-size: ${c[s.size]}; `:"")+(s.noMargins?"margin-block-start: 0; margin-block-end: 0; ":"");return Je.h1==s.container?n`
            <h1 style="${u}${e.style}" class="${e.cssClasses}"
                id="${M(e.id)}"
                data-colspan="${M(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h1>
        `:Je.h2==s.container?n`
            <h2 style="${u}${e.style}" class="${e.cssClasses}"
                id="${M(e.id)}"
                data-colspan="${M(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h2>
        `:Je.h3==s.container?n`
            <h3 style="${u}${e.style}" class="${e.cssClasses}"
                id="${M(e.id)}"
                data-colspan="${M(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h3>
        `:Je.h4==s.container?n`
            <h4 style="${u}${e.style}" class="${e.cssClasses}"
                id="${M(e.id)}"
                data-colspan="${M(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h4>
        `:Je.h5==s.container?n`
            <h5 style="${u}${e.style}" class="${e.cssClasses}"
                id="${M(e.id)}"
                data-colspan="${M(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h5>
        `:Je.h6==s.container?n`
            <h6 style="${u}${e.style}" class="${e.cssClasses}"
                id="${M(e.id)}"
                data-colspan="${M(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h6>
        `:Je.p==s.container?n`
               <p style="${u}${e.style}" class="${e.cssClasses}"
                  id="${M(e.id)}"
                  data-colspan="${M(o)}"
                  slot="${e.slot??d}">
                   ${l??d}
               </p>
            `:Je.div==s.container?n`
               <div style="${u}${e.style}" class="${e.cssClasses}"
                    id="${M(e.id)}"
                    data-colspan="${M(o)}"
                    slot="${e.slot??d}">${l?we(l):d}</div>
            `:Je.span==s.container?n`
               <span style="${u}${e.style}" class="${e.cssClasses}"
                     id="${M(e.id)}"
                     data-colspan="${M(o)}"
                    slot="${e.slot??d}">${l??d}</span>
            `:n`
               <p
                       id="${M(e.id)}"
                       data-colspan="${M(o)}"
                       slot="${e.slot??d}">
                   Unknown text container: ${s.container} 
               </p>
            `},Bp=e=>{const t=e.metadata;return n`<a href="${t.url}" target="${t.target??d}"
                   rel="${t.target==="_blank"?"noopener":d}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}">${t.text}</a>`},Hl=(e,t)=>{const a=e.toLowerCase().split("+");return t.ctrlKey===a.includes("ctrl")&&t.altKey===a.includes("alt")&&t.shiftKey===a.includes("shift")&&t.metaKey===a.includes("meta")},Up=(e,t)=>{if(!Hl(e,t))return!1;const a=e.toLowerCase().split("+"),r=a[a.length-1];return!!(t.key.toLowerCase()===r||/^[a-z]$/.test(r)&&t.code==="Key"+r.toUpperCase()||/^[0-9]$/.test(r)&&(t.code==="Digit"+r||t.code==="Numpad"+r))},Wl=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,Vl=(e,t)=>{const a=e.currentTarget,r=a.dataset.route;if(r){mt(a,r);return}a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.dataset.actionId,parameters:t.parameters},bubbles:!0,composed:!0}))},Gl=(e,t,a)=>{if(!e.route)return;const r=G(e.route,t,a);return!r||r.includes("${")?void 0:r},jp="display:inline-flex; align-items:center; justify-content:center; gap:.4em; box-sizing:border-box; font:inherit; font-weight:500; cursor:pointer; border-radius:var(--lumo-border-radius-m,6px); border:1px solid transparent; line-height:1; white-space:nowrap;",Hp=e=>{const t=e.buttonStyle??"",a=e.color&&e.color!=="none"&&e.color!=="normal"?e.color:"",r=e.size,i=a==="success"?"var(--lumo-success-color,#1a7f37)":a==="error"?"var(--lumo-error-color,#c5221f)":a==="contrast"?"var(--lumo-contrast,#161513)":"var(--lumo-primary-color,#3b5bdb)",s=a==="success"?"var(--lumo-success-contrast-color,#fff)":a==="error"?"var(--lumo-error-contrast-color,#fff)":a==="contrast"?"var(--lumo-base-color,#fff)":"var(--lumo-primary-contrast-color,#fff)",o=a==="success"?"var(--lumo-success-text-color,#1a7f37)":a==="error"?"var(--lumo-error-text-color,#c5221f)":a==="contrast"?"var(--lumo-body-text-color,#161513)":"var(--lumo-primary-text-color,#3b5bdb)";let l;return t==="primary"?l=`background:${i}; color:${s};`:t==="tertiary"||t==="tertiaryInline"?l=`background:transparent; color:${o};`:l=`background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:${o}; border-color:var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,`${jp}${l}${r==="small"?"padding:.25rem .6rem; font-size:var(--lumo-font-size-s,.875rem);":r==="large"?"padding:.65rem 1.4rem; font-size:var(--lumo-font-size-l,1.125rem);":"padding:.45rem 1rem; font-size:var(--lumo-font-size-m,1rem);"}`},Wp=(e,t,a)=>{const r=e.metadata,i=G(r.label,t,a);return n`<button
            id="${e.id}"
            data-action-id="${r.actionId}"
            data-route="${Gl(r,t,a)??d}"
            @click="${s=>Vl(s,r)}"
            style="${Hp(r)}${e.style}"
            class="${e.cssClasses}"
            ?disabled="${r.disabled}"
            data-shortcut="${r.shortcut??d}"
            title="${r.shortcut?`${i} (${Wl(r.shortcut)})`:d}"
            slot="${e.slot??d}"
    >${r.iconOnLeft?V(r.iconOnLeft):d}${i}${r.iconOnRight?V(r.iconOnRight):d}</button>`},Vp="display:block; box-sizing:border-box; background:var(--lumo-base-color,#fff); border:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.1)); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-xs,0 1px 3px rgba(0,0,0,.08)); overflow:hidden;",Gp=(e,t,a,r,i,s,o)=>{const l=t.metadata;if(!l)return n``;const c=p=>p?x(e,p,a,r,i,s,o,!1):d,u=l.header||l.headerPrefix||l.headerSuffix||l.title||l.subtitle;return n`
        <div id="${t.id??d}" style="${Vp}${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${l.media?c(l.media):d}
            ${u?n`<div style="display:flex; align-items:flex-start; gap:.75rem; padding:1rem 1.25rem ${l.content||l.footer?"0":"1rem"};">
                ${l.headerPrefix?c(l.headerPrefix):d}
                <div style="flex:1; min-width:0;">
                    ${l.header?c(l.header):d}
                    ${l.title?n`<div style="font-weight:600; font-size:1.05rem; color:var(--lumo-body-text-color,#161513);">${c(l.title)}</div>`:d}
                    ${l.subtitle?n`<div style="color:var(--lumo-secondary-text-color,#667);">${c(l.subtitle)}</div>`:d}
                </div>
                ${l.headerSuffix?c(l.headerSuffix):d}
            </div>`:d}
            ${l.content?n`<div style="padding:1rem 1.25rem;">${c(l.content)}</div>`:d}
            ${l.footer?n`<div style="padding:0 1.25rem 1rem;">${c(l.footer)}</div>`:d}
        </div>
    `},Kp=e=>{const t=e.metadata;return n`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??d}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},Yp=e=>{const t=e.metadata;return V(t.icon,e.style,e.cssClasses,e.slot)},Xi=(e,t)=>{e&&e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},Kl="font:inherit; font-weight:500; cursor:pointer; padding:.45rem 1rem; border-radius:var(--lumo-border-radius-m,6px);",Uo=`${Kl} background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:var(--lumo-body-text-color,#161513); border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,Jp=`${Kl} background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff); border:1px solid transparent;`,Xp=(e,t,a,r,i,s,o)=>{const l=t.metadata;let c=!1;if(l.openedCondition)try{c=Ks(l.openedCondition,r,i,s,o)}catch(u){console.error("when evaluating "+l.openedCondition+" :"+u+", where data is "+i+" and state is "+r)}return c?n`
        <div class="mateu-confirm-dialog ${t.cssClasses??""}"
             style="position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.4); ${t.style??""}"
             slot="${t.slot??d}">
            <div style="background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-l,0 8px 24px rgba(0,0,0,.2)); width:100%; max-width:min(90vw,32rem); padding:1.5rem; box-sizing:border-box;">
                ${l.header?n`<h3 style="margin:0 0 .75rem; font-size:1.15rem;">${l.header}</h3>`:d}
                <div>${t.children?.map(u=>x(e,u,a,r,i,s,o))}</div>
                <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:1.25rem;">
                    ${l.canCancel?n`<button style="${Uo}" @click="${u=>Xi(u.currentTarget,l.cancelActionId)}">${l.rejectText&&!l.canReject?l.rejectText:"Cancel"}</button>`:d}
                    ${l.canReject?n`<button style="${Uo}" @click="${u=>Xi(u.currentTarget,l.rejectActionId)}">${l.rejectText||"No"}</button>`:d}
                    <button style="${Jp}" @click="${u=>Xi(u.currentTarget,l.confirmActionId)}">${l.confirmText||"OK"}</button>
                </div>
            </div>
        </div>
    `:n``},Qp=e=>{const t=e.metadata;let a;return t.position&&(a={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),n`
        <mateu-cookie-consent style="${e.style}" class="${e.cssClasses}"
                               slot="${e.slot??d}"
                               position="${a??d}"
                               cookie-name="${t.cookieName??d}"
                               .message="${t.message??d}"
                               theme="${t.theme??d}"
                               .learnMore="${t.learnMore??d}"
                               .learnMoreLink="${t.learnMoreLink??d}"
                               .dismiss="${t.dismiss??d}"
        ></mateu-cookie-consent>
    `},Zp=(e,t,a,r,i,s,o)=>{const l=t.metadata;return n`
        <details
                ?open="${l.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            <summary>${x(e,l.summary,a,r,i,s,o)}</summary>
            ${x(e,l.content,a,r,i,s,o)}
        </details>
            `},em=(e,t,a,r,i,s)=>n`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${s}"
        ></mateu-dialog>
            `,tm=(e,t,a,r,i,s)=>n`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${s}"
        ></mateu-drawer>
            `,am=e=>"mfe_"+[e.baseUrl,e.route,e.consumedRoute,e.serverSideType].map(t=>t??"").join("|").replace(/[^a-zA-Z0-9]/g,"_"),rm=e=>{const t=e.metadata;return n`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"
                  route="${t.route}"
                  consumedRoute="${t.consumedRoute}"
                  id="${am(t)}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??d}"
        ></mateu-ux>
        </mateu-api-caller>
            `},im=e=>{const t=e.metadata;return n`
        <mateu-markdown .content=${t.markdown}
                        style="display:block; max-width: 72ch; ${e.style??""}" class="${e.cssClasses}"
                        slot="${e.slot??d}"></mateu-markdown>
            `},sm=e=>{const t=e.metadata;return n`
        <div
            role="status"
            slot="${e.slot??d}"
            class="${e.cssClasses}"
            style="display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem;
                   border-radius: var(--lumo-border-radius-m, 8px);
                   background: var(--lumo-contrast-5pct, rgba(0,0,0,0.05));
                   color: var(--lumo-body-text-color, #1a1a1a); ${e.style}"
        >
            ${t.title?n`<strong>${t.title}</strong>`:d}
            ${t.text?n`<span>${t.text}</span>`:d}
        </div>
    `},om=(e,t={})=>{const a=e.metadata,r=a.valueKey?t[a.valueKey]:a.value,i=a.max&&a.max!=0?a.max:1,s=!a.indeterminate&&r!=null;return n`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            <progress
                    style="width:100%;"
                    max="${i}"
                    .value="${s?r:d}"
            ></progress>
            ${a.text?n`<span class="text-secondary text-xs" id="sublbl">
    ${a.text}
  </span>`:d}
        </div>
    `},nm=(e,t,a,r,i,s,o)=>{const l=t.metadata;return n`
        <details style="position: relative; ${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            <summary style="list-style: none; cursor: pointer;">${x(e,l.wrapped,a,r,i,s,o)}</summary>
            <div style="position: absolute; z-index: 100; min-width: 300px; margin-top: .25rem; padding: .6rem .8rem;
                        border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px);
                        background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.2));">
                ${x(e,l.content,a,r,i,s,o)}
            </div>
        </details>
    `},lm=e=>{const t=e.metadata;return n`
        <mateu-map id="${e.id??d}"
                   position="${t.position??d}" zoom="${t.zoom??d}"
                   .markers=${t.markers??[]}
                   .markerActionId=${t.markerActionId??void 0}
                   style="${e.style??d}" class="${e.cssClasses??d}"
                   slot="${e.slot??d}"></mateu-map>
            `},dm=e=>{const t=e.metadata;return n`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??d}">
            `},cm=e=>{const t=e.metadata;return n`<div style="display:flex; align-items:center; gap:0.5rem;" slot="${e.slot??d}">
        ${t.breadcrumbs.map(a=>n`
            <a href="${a.link}">${a.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </div>`},um=(e,t,a,r,i,s,o)=>{const l=t.metadata;return n`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${l.dots}" 
                ?nav = "${l.nav}" 
                ?loop = "${l.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>n`<div>${x(e,c,a,r,i,s,o)}</div>`)}
        </skeleton-carousel>
    `},hm=(e,t,a,r)=>{const i=e.metadata;return n`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            ${i.menu.map(s=>Yl(s))}
        </div>
            `},Yl=e=>n`
        ${e.submenus?n`
                <details open>
                    <summary>${e.label}</summary>
                    <div style="display:flex; flex-direction:column; gap:0.25rem; padding-left:0.5rem;">
                        ${e.submenus.map(t=>Yl(t))}
                    </div>
                </details>
            `:n`
                <a href="${e.path}">${e.label}</a>
        `}
        `,pm=(e,t,a,r,i,s,o)=>{const l=t.metadata;return n`<div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >${l.content?qn(l.content):d}${t.children?.map(c=>x(e,c,a,r,i,s,o))}</div>
    `},mm=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return n`<div
                id="${t.id??d}"
                slot="${t.slot??d}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?n`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${c}</div>`:d}
        ${t.children?.map(u=>x(e,u,a,r,i,s,o))}
    </div>
    `},fm=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return n`
        <div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(u=>x(e,u,a,r,i,s,o))}</div>
    `},vm=(e,t,a)=>{a.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:e,value:t},bubbles:!0,composed:!0}))},jr=e=>t=>{const a=t.target,r=a.type==="checkbox"?a.checked:a.value;vm(e.fieldId,r,a)},gm=(e,t)=>{const a=e.metadata,r=t?.[a.fieldId]??"",i=a,s=i.dataType,o=i.stereotype,l=!!i.readOnly,c=!!i.disabled,u=i.options,p=a.label?n`<label style="display:block; font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${a.label}</label>`:d,m="width:100%; box-sizing:border-box; padding:.4rem .6rem; border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.3)); border-radius: var(--lumo-border-radius-m,6px); font:inherit; background: var(--lumo-base-color,#fff); color: var(--lumo-body-text-color,#1a1a1a);";let f;return l||o==="plainText"?f=n`<div style="padding:.4rem 0;">${String(r??"")}</div>`:s==="boolean"||s==="bool"||o==="checkbox"||o==="badge"?f=n`<input type="checkbox" ?checked="${!!r}" ?disabled="${c}" @change="${jr(a)}">`:u&&u.length?f=n`
            <select style="${m}" ?disabled="${c}" @change="${jr(a)}">
                <option value="">—</option>
                ${u.map(g=>n`<option value="${g.value}" ?selected="${g.value===r}">${g.label}</option>`)}
            </select>`:o==="textarea"||o==="richText"||o==="html"?f=n`<textarea style="${m}" rows="3" ?disabled="${c}" @input="${jr(a)}">${String(r??"")}</textarea>`:f=n`<input type="${s==="integer"||s==="number"||s==="double"||s==="money"?"number":s==="date"?"date":s==="datetime"?"datetime-local":s==="time"?"time":o==="password"?"password":s==="email"?"email":"text"}" style="${m}" .value="${String(r??"")}"
                              placeholder="${i.placeholder??d}" ?disabled="${c}" @input="${jr(a)}">`,n`
        <div id="${e.id??d}" style="${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            ${p}
            ${f}
        </div>
    `},ci="var(--mateu-fab-size, var(--lumo-size-l, 2.75rem))",Jl="var(--mateu-fab-gap, var(--lumo-space-s, 0.5rem))",Xl="var(--mateu-fab-inset-bottom, var(--mateu-fab-inset-block, var(--lumo-space-m, 1rem)))",Ql="var(--mateu-fab-inset-end, var(--lumo-space-m, 1rem))",bm=600,ym=1200,cr={inset:1,size:2.75,gap:.5,toc:15,tocGap:2},$m=e=>`calc(${Xl} + ${e} * (${ci} + ${Jl}))`,wm=e=>`calc(${Xl} + (var(--mateu-fab-shell-slots, 0) + ${e}) * (${ci} + ${Jl}))`,Zl=e=>`bottom: ${$m(e)}; right: ${Ql};`,xm=e=>`bottom: ${wm(e)}; right: ${Ql};`,eo=e=>k`
    ${Hr(e)} {
        position: fixed;
        box-sizing: border-box;
        width: ${Vo(ci)};
        height: ${Vo(ci)};
        padding: 0;
        border: none;
        border-radius: var(--lumo-border-radius-m, 0.25rem);
        background-color: var(--lumo-primary-color, #1676f3);
        color: var(--lumo-primary-contrast-color, #fff);
        box-shadow: var(--lumo-box-shadow-s, 0 2px 4px rgba(0, 0, 0, 0.2));
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--lumo-icon-size-m, 1.5rem);
        z-index: 900;
        transition: background-color 0.15s, bottom 0.2s ease, right 0.2s ease;
    }
    ${Hr(e)}:hover {
        background-image: linear-gradient(var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)), var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)));
    }
    ${Hr(e)}:active {
        background-image: linear-gradient(var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)), var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)));
    }
    ${Hr(e)}:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--lumo-base-color, #fff), 0 0 0 4px var(--lumo-primary-color-50pct, rgba(22, 118, 243, 0.5));
    }
`,$r=new Map,ui=new Map,to=new Set;let Qi=!1;const km=()=>parseFloat(getComputedStyle(document.documentElement).fontSize||"16")||16,ks=()=>{const e=document.documentElement.style,t=[...$r.values()],a=t.filter(i=>i.kind==="shell").reduce((i,s)=>Math.max(i,s.slot+1),0),r=t.filter(i=>i.kind==="page").length;e.setProperty("--mateu-fab-shell-slots",String(a)),e.setProperty("--mateu-fab-slots",String(a+r))},hi=()=>{Qi||(Qi=!0,queueMicrotask(()=>{Qi=!1,ks(),to.forEach(e=>e())}))},jo=(e,t)=>{const a=$r.get(e);a?.kind===t.kind&&a.slot===t.slot||($r.set(e,t),hi())},Ho=e=>{$r.delete(e)&&hi()};class _m extends _c{constructor(t){if(super(t),t.type!==Sc.ELEMENT)throw new Error("onFabRail goes on the FAB element")}render(t,a){return d}update(t,[a,r]){return this.element&&this.element!==t.element&&Ho(this.element),this.element=t.element,this.entry={kind:a,slot:r??0},this.isConnected&&jo(this.element,this.entry),d}disconnected(){this.element&&Ho(this.element)}reconnected(){this.element&&this.entry&&jo(this.element,this.entry)}}const ao=kc(_m),Sm=(e,t)=>(ui.set(e,t),t(ed,td),hi(),()=>{ui.delete(e)&&hi()});let ed="column",td;const Wo=(e,t)=>{ed=e,td=t,ui.forEach(a=>a(e,t))},Cm=e=>{const{mode:t,viewportWidth:a,contentEnd:r,hasFabs:i,hasToc:s,rem:o}=e,l=cr.inset*o,c=(cr.size+cr.gap)*o;if(t==="edge")return{channel:0,toc:"bar",insetEnd:0,insetBottom:0};if(a<bm)return{channel:0,toc:"bar",insetEnd:l};const u=s&&a>=ym,p=Math.max(i?l+c:0,u?l+(cr.toc+cr.tocGap)*o:0),m=u?"aside":"bar";if(t==="full"){const y=p>0?Math.max(24,Math.round(p-(a-r))):void 0;return{channel:p,toc:m,insetEnd:l,padEnd:y}}const f=p>0?Math.max(0,Math.round(p-(a-(e.containerEnd??r)))):void 0,g=Math.max(c,p-l);return{channel:p,toc:m,insetEnd:Math.max(l,Math.round(a-r-g)),squeeze:f}},Na=new Map;let Em=0,ue,wr;const Im=(e,t)=>{let a=t;for(;a;)if(a=a.parentNode??a.host??null,a===e)return!0;return!1},Tm=()=>{const e=[...Na.values()].filter(a=>a.element.isConnected);return e.filter(a=>!e.some(r=>r!==a&&Im(r.element,a.element))).sort((a,r)=>r.order-a.order)[0]?.element},_s=e=>{e.removeAttribute("data-aside"),e.style.removeProperty("--mateu-aside-squeeze"),e.style.removeProperty("--mateu-aside-pad-end")},ga=()=>{const e=document.documentElement,t=Tm();if(ue&&ue!==t&&(wr?.unobserve(ue),_s(ue)),t&&t!==ue&&wr?.observe(t),ue=t,!ue){e.style.removeProperty("--mateu-fab-inset-end"),e.style.removeProperty("--mateu-fab-inset-bottom"),ks(),Wo("column");return}const a=Na.get(ue),r=km(),i=e.clientWidth||window.innerWidth,s=ue.getBoundingClientRect().right,o=Cm({mode:a.mode,viewportWidth:i,contentEnd:s,containerEnd:s+(parseFloat(getComputedStyle(ue).marginRight)||0),hasFabs:$r.size>0,hasToc:ui.size>0,rem:r});o.channel>0?(ue.setAttribute("data-aside",""),ue.style.setProperty("--mateu-aside-squeeze",`${o.squeeze??0}px`),o.padEnd!==void 0?ue.style.setProperty("--mateu-aside-pad-end",`${o.padEnd}px`):ue.style.removeProperty("--mateu-aside-pad-end")):_s(ue),e.style.setProperty("--mateu-fab-inset-end",`${o.insetEnd}px`),ks(),o.insetBottom!==void 0?e.style.setProperty("--mateu-fab-inset-bottom",`${o.insetBottom}px`):e.style.removeProperty("--mateu-fab-inset-bottom"),Wo(o.toc,s-(parseFloat(getComputedStyle(ue).paddingRight)||0))};let pi=!1;const Am=()=>{pi||(pi=!0,wr=typeof ResizeObserver<"u"?new ResizeObserver(()=>ga()):void 0,window.addEventListener("resize",ga),to.add(ga))},Pm=()=>{pi&&(pi=!1,wr?.disconnect(),wr=void 0,window.removeEventListener("resize",ga),to.delete(ga))},Om=(e,t)=>(Na.set(e,{element:e,mode:t,order:++Em}),Am(),ga(),()=>{Na.get(e)?.element===e&&(Na.delete(e),_s(e),ga(),Na.size===0&&Pm())}),Vo=e=>Ls(e),Hr=e=>Ls(e),Rm=e=>{const t=e.metadata;if((t?.level??0)>0)return e;const a=c=>{if(c?.metadata?.type===v.EntityHeader)return c;const u=c?.metadata?.content,p=[...c?.children??[],...Array.isArray(u)?u:u?[u]:[]];for(const m of p){const f=a(m);if(f)return f}};let r;for(const c of e.children??[])if(r=a(c),r)break;if(!r)return e;const i=r.metadata;r.__hoistedToPageHeader=!0;const s=[...(i.facts??[]).filter(c=>c.label||c.value).map(c=>({title:c.label??"",text:c.value??""})),...i.metricLabel?[{title:i.metricLabel,text:i.metricValue??""}]:[]],o=(i.badges??[]).filter(c=>c.label).map(c=>({text:c.label,color:c.color})),l={...t,title:i.title||t.title,subtitle:i.subtitle??t.subtitle,kpis:[...t.kpis??[],...s],kpisBelow:!0,badges:[...t.badges??[],...o]};return{...e,metadata:l}},zm=e=>`width: 100%; box-sizing: border-box; ${e??""}`,Ss=(e,t,a,r,i,s,o,l)=>{const c=Rm(t),u=c.metadata,p=u?.fabs??[];return n`<mateu-page
            .component="${c}"
            baseUrl="${a}"
            .state="${r}"
            .data="${i}"
            .appState="${s}"
            .appdata="${o}"
            slot="${c.slot??d}"
            style="${zm(c.style)}"
            class="${c.cssClasses}"
            ?standalone="${l??!1}"
    >
        ${c.children?.map(m=>x(e,m,a,r,i,s,o))}
        ${u?.buttons?.map(m=>n`
                   ${x(e,{id:m.actionId,metadata:m,type:re.ClientSide,slot:"buttons"},void 0,r,i,s,o)}
`)}
        ${p.map((m,f)=>n`
            <button class="page-fab" style="${xm(f)}" ${ao("page",f)} aria-label="${m.label}"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:m.actionId},bubbles:!0,composed:!0}))}"
                title="${m.label}">
                ${V(m.icon)}
            </button>
        `)}
</mateu-page>
    `},Cs=(e,t,a,r,i,s,o,l)=>n`<mateu-table-crud
            id="${t.id}"
            baseUrl="${a}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${r}"
            .data="${i}"
            .appState="${s}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(c=>x(e,c,a,r,i,s,o))}
    </mateu-table-crud>`,Lm=e=>{const t=e.metadata;return n`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},Dm=(e,t,a)=>{const r=e.metadata;return n`<mateu-chat sseUrl="${r.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??d}"></mateu-chat>`},Mm=e=>{const t=e.metadata;return n`
        <mateu-workflow
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},Nm=e=>{const t=e.metadata;return n`
        <mateu-form-editor
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},ad=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,Fm=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",qm=e=>e=="up"?"▲":e=="down"?"▼":"",Bm=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},Um=e=>{const t=e.metadata,a=!!t.actionId;return n`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${ad} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${a?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??d}"
             role="${a?"button":d}"
             @click="${r=>Bm(r,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?V(t.icon,"color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;"):d}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?n`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:d}
            </div>
            ${t.trend||t.trendLabel?n`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${Fm(t.trend)};">
                    ${qm(t.trend)} ${t.trendLabel??d}
                </span>
            `:d}
            ${t.description?n`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:d}
        </div>
    `},jm=(e,t,a,r,i,s,o)=>n`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(l=>x(e,l,a,r,i,s,o))}
        </div>
    `,Hm=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=l.colSpan&&l.colSpan>1?`grid-column: span ${l.colSpan};`:"",u=l.rowSpan&&l.rowSpan>1?`grid-row: span ${l.rowSpan};`:"",p=t.children??[];return p.length===1&&p[0].metadata?.type==="MetricCard"?n`
            <div style="min-width: 0; ${c} ${u} ${t.style??""}" slot="${t.slot??d}">
                ${x(e,p[0],a,r,i,s,o)}
            </div>`:n`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${ad} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${u} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?n`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${l.title}</h3>
                    ${l.subtitle?n`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${l.subtitle}</span>`:d}
                </div>
            `:d}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(m=>x(e,m,a,r,i,s,o))}
            </div>
        </div>
    `},Wm=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=l.columns&&l.columns>0?`repeat(${l.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return n`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(u=>x(e,u,a,r,i,s,o))}
        </div>
    `};var Vm=Object.defineProperty,Gm=Object.getOwnPropertyDescriptor,Ft=(e,t,a,r)=>{for(var i=r>1?void 0:r?Gm(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Vm(t,a,i),i};let Ze=class extends I{constructor(){super(...arguments),this.panels=[],this.headerTitle="",this.badges=[],this.orientation="vertical",this.navigation=null,this.overviewEditActionId="",this.openPanels=new Set,this.expandedPanel=null,this._onPopState=()=>{const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),a=this.panels.findIndex((r,i)=>this.panelAnchor(r,i)===t);this.expandedPanel=a>=0?a:null}else this.expandedPanel=null},this.initialized=!1}navAction(e){e&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),window.addEventListener("popstate",this._onPopState)}disconnectedCallback(){window.removeEventListener("popstate",this._onPopState),super.disconnectedCallback()}willUpdate(){if(!this.initialized&&this.panels.length){this.openPanels=new Set(this.panels.map((t,a)=>t.open?a:-1).filter(t=>t>=0));const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),a=this.panels.findIndex((r,i)=>this.panelAnchor(r,i)===t);a>=0&&(this.expandedPanel=a)}else if(e){const t=this.panels.findIndex((a,r)=>this.panelAnchor(a,r)===e);t>=0&&this.openPanels.add(t)}this.initialized=!0}}firstUpdated(){const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(!e)return;const t=this.renderRoot.querySelector(`[data-anchor="${CSS.escape(e)}"]`);t&&t.scrollIntoView({block:"nearest"})}panelAnchor(e,t){return(e.title??"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`panel-${t}`}bookmarkPanel(e){const t=this.panelAnchor(this.panels[e],e);try{history.replaceState(history.state,"","#"+t)}catch{}}clearBookmark(e){const t=this.panelAnchor(this.panels[e],e);if(decodeURIComponent((location.hash||"").replace(/^#/,""))===t)try{history.replaceState(history.state,"",location.pathname+location.search)}catch{}}expandPanel(e,t){t?.stopPropagation(),this.expandedPanel=e;const a=this.panelAnchor(this.panels[e],e);try{history.pushState(history.state,"","#expand="+a)}catch{}}collapsePanel(){try{history.back()}catch{this.expandedPanel=null}}toggle(e){const t=new Set(this.openPanels);t.has(e)?(t.delete(e),this.clearBookmark(e)):(t.add(e),this.bookmarkPanel(e)),this.openPanels=t}render(){if(this.expandedPanel!=null&&this.panels[this.expandedPanel]){const t=this.panels[this.expandedPanel];return n`
                <div class="expanded-view" part="expanded-view">
                    <div class="expanded-header">
                        <button class="nav-parent" title="Back"
                                @click="${()=>this.collapsePanel()}">
                            <span>‹</span><span>Back</span>
                        </button>
                        <span class="nav-title">${t.title}</span>
                        ${t.subtitle?n`<span class="subtitle">${t.subtitle}</span>`:d}
                    </div>
                    <div class="expanded-body">
                        <slot name="panel-${this.expandedPanel}"></slot>
                    </div>
                </div>
            `}const e=this.navigation;return n`
            ${e?n`
                <div class="nav-header" part="nav-header">
                    ${e.parentActionId?n`
                        <button class="nav-parent" title="${e.parentLabel??"Back"}"
                                @click="${()=>this.navAction(e.parentActionId)}">
                            <span>‹</span><span>${e.parentLabel??"Back"}</span>
                        </button>
                    `:d}
                    ${e.title?n`<span class="nav-title">${e.title}</span>`:d}
                    <span class="nav-spacer"></span>
                    ${e.previousActionId?n`
                        <button class="nav-move" title="Previous"
                                @click="${()=>this.navAction(e.previousActionId)}">‹</button>
                    `:d}
                    ${e.nextActionId?n`
                        <button class="nav-move" title="Next"
                                @click="${()=>this.navAction(e.nextActionId)}">›</button>
                    `:d}
                </div>
            `:d}
            ${this.headerTitle?n`
                <div class="header-band" part="header-band">
                    <div class="header-content">
                        <h2 class="header-title">${this.headerTitle}</h2>
                        ${this.badges.length?n`
                            <div class="header-badges">
                                ${this.badges.map(t=>n`<span class="header-badge">${t}</span>`)}
                            </div>
                        `:""}
                    </div>
                    <div class="header-accent" part="header-accent"></div>
                </div>
            `:""}
            <div class="columns" part="columns">
                <div class="overview" part="overview">
                    ${this.overviewEditActionId?n`
                        <button class="overview-edit" title="Edit"
                                @click="${()=>this.navAction(this.overviewEditActionId)}">
                            <span>✎</span><span>Edit</span>
                        </button>
                    `:d}
                    <slot name="overview"></slot>
                </div>
                <div class="rail" part="rail">
                    ${this.panels.map((t,a)=>this.openPanels.has(a)?n`
                        <div class="panel" part="panel" data-anchor="${this.panelAnchor(t,a)}"
                             style="${t.width?`flex-basis: ${t.width}; min-width: min(${t.width}, 100%);`:d}"
                             @click="${()=>this.bookmarkPanel(a)}">
                            <div class="panel-header">
                                <div>
                                    <h3>${t.title}</h3>
                                    ${t.subtitle?n`<div class="subtitle">${t.subtitle}</div>`:""}
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
                    `:n`
                        <div class="strip" role="button" title="${t.title}"
                             data-anchor="${this.panelAnchor(t,a)}" @click="${()=>this.toggle(a)}">
                            <button class="fold" tabindex="-1">⟩</button>
                            <span>${t.title}</span>
                        </div>
                    `)}
                </div>
            </div>
        `}};Ze.styles=k`
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
    `;Ft([h({type:Array})],Ze.prototype,"panels",2);Ft([h({type:String})],Ze.prototype,"headerTitle",2);Ft([h({type:Array})],Ze.prototype,"badges",2);Ft([h({type:String,reflect:!0})],Ze.prototype,"orientation",2);Ft([h({attribute:!1})],Ze.prototype,"navigation",2);Ft([h({type:String})],Ze.prototype,"overviewEditActionId",2);Ft([b()],Ze.prototype,"openPanels",2);Ft([b()],Ze.prototype,"expandedPanel",2);Ze=Ft([_("mateu-foldout")],Ze);const Km=(e,t,a,r,i,s,o)=>{const l=t.metadata;return n`
        <mateu-foldout
                .panels="${l.panels??[]}"
                .headerTitle="${l.headerTitle??""}"
                .badges="${l.badges??[]}"
                .navigation="${l.navigation??null}"
                overviewEditActionId="${l.overviewEditActionId??""}"
                orientation="${l.orientation??"vertical"}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(c=>x(e,c,a,r,i,s,o))}
        </mateu-foldout>
    `},rd="mateu-tile-order",id=()=>{try{const e=JSON.parse(localStorage.getItem(rd)??"{}");return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}},Ym=(e,t)=>e?.id?String(e.id):"#"+t,Jm=e=>{const t=id()[e];return Array.isArray(t)?t.filter(a=>typeof a=="string"):null},Xm=(e,t)=>{try{const a=id();a[e]=t,localStorage.setItem(rd,JSON.stringify(a))}catch{}},Qm=(e,t)=>{if(!t||!t.length)return e.map((i,s)=>s);const a=t.map(i=>e.indexOf(i)).filter(i=>i>=0),r=new Set(a);return[...a,...e.map((i,s)=>s).filter(i=>!r.has(i))]},sd=(e,t,a)=>{const r=e.indexOf(t),i=e.indexOf(a);if(r<0||i<0||r===i)return e;const s=e.filter(o=>o!==t);return s.splice(i,0,t),s},Zm=(e,t)=>{if(e?.type==="Scoreboard")return"grid-column: 1 / -1;";const a=e?.type==="DashboardPanel"?e.colSpan:t,r=e?.type==="DashboardPanel"?e.rowSpan:void 0;return(a&&a>1?`grid-column: span ${a};`:"")+(r&&r>1?` grid-row: span ${r};`:"")},ef=(e,t,a)=>{const r=e.indexOf(t),i=r+a;return r<0||i<0||i>=e.length?e:sd(e,t,e[i])},Zi="application/x-mateu-tile",tf=(e,t,a,r)=>{const i=t.children??[],s=(typeof location<"u"?location.pathname:"")+"#"+(t.id??"grid"),o=i.map((p,m)=>Ym(p,m)),l=Qm(o,Jm(s)),c=l.map(p=>o[p]),u=p=>{p!==c&&(Xm(s,p),e.requestUpdate())};return l.map(p=>{const m=o[p],f=i[p].metadata;return n`<div class="mateu-tile" draggable="true" tabindex="0" data-tile-key="${m}"
                         aria-roledescription="draggable tile"
                         title="Drag to rearrange (Alt+← / Alt+→)"
                         style="min-width: 0; cursor: grab; ${Zm(f,r[p])}"
                         @dragstart=${g=>{g.dataTransfer?.setData(Zi,s+`
`+m),g.dataTransfer&&(g.dataTransfer.effectAllowed="move")}}
                         @dragover=${g=>{g.dataTransfer?.types.includes(Zi)&&g.preventDefault()}}
                         @drop=${g=>{const[y,$]=(g.dataTransfer?.getData(Zi)??"").split(`
`);y!==s||!$||(g.preventDefault(),u(sd(c,$,m)))}}
                         @keydown=${g=>{if(!g.altKey||g.key!=="ArrowLeft"&&g.key!=="ArrowRight"||g.target!==g.currentTarget)return;g.preventDefault(),u(ef(c,m,g.key==="ArrowLeft"?-1:1));const y=g.currentTarget;requestAnimationFrame(()=>y.parentElement?.querySelector(`[data-tile-key="${CSS.escape(m)}"]`)?.focus())}}
        >${a(p)}</div>`})},af=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=l.gridTemplateAreas,p=l.gridTemplateColumns&&l.gridTemplateColumns.trim().length?l.gridTemplateColumns:c&&c.trim().length?null:"repeat(auto-fit, minmax(min(100%, 16rem), 1fr))",m=l.gap??"var(--lumo-space-m, 1rem)",f=l.colSpans??[],g=l.stickyAreas??[],y=p?` grid-template-columns: ${p};`:"",$=c&&c.trim().length?` grid-template-areas: ${c};`:"",w=`display: grid;${y} gap: ${m}; align-items: start;${$} ${t.style??""}`,E=!!l.reorderable&&!(c&&c.trim().length)?tf(e,t,P=>x(e,t.children[P],a,r,i,s,o),f):t.children?.map((P,R)=>{const O=x(e,P,a,r,i,s,o);if(c&&P.slot){const S=g.includes(P.slot)?" position: sticky; top: 1rem; align-self: start; height: fit-content;":"";return n`<div style="grid-area: ${P.slot}; min-width: 0;${S}">${O}</div>`}return Fl(f[R],O)});if(!l.stackBelow)return n`
            <div class="mateu-responsive-grid ${t.cssClasses??""}"
                 style="${w}"
                 slot="${t.slot??d}"
            >${E}</div>
        `;const A=t.id??"mateu-grid";return n`
        <div style="container-type: inline-size;" slot="${t.slot??d}">
            <style>
                @container (max-width: ${l.stackBelow}) {
                    .mateu-responsive-grid[data-grid-id="${A}"] {
                        grid-template-columns: 1fr !important;
                        /* a named-slot template names N columns per row; on one track that would be a
                           mismatch (and void the areas) — drop the areas so the slots stack in order. */
                        grid-template-areas: none !important;
                    }
                }
            </style>
            <div class="mateu-responsive-grid ${t.cssClasses??""}"
                 data-grid-id="${A}"
                 style="${w}"
            >${E}</div>
        </div>
    `},rf=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=t.children??[],u=A=>c.filter(P=>(P.slot??"").startsWith(A)),p=u("main-"),m=u("aside-"),f=u("footer-"),g=l.asideWidth&&l.asideWidth.trim()?l.asideWidth:"32%",y=l.asidePosition==="start",$=l.asideSticky!==!1,w=A=>A.map(P=>x(e,P,a,r,i,s,o)),C=n`
        <div class="mateu-content-main"
             style="flex: 1 1 0; min-width: min(20rem, 100%); box-sizing: border-box;">
            ${w(p)}
        </div>`,E=m.length?n`
        <div class="mateu-content-aside"
             style="flex: 0 1 calc(${g} - var(--lumo-space-m, 1rem)); min-width: min(18rem, 100%); box-sizing: border-box; ${$?"position: sticky; top: 1rem; align-self: flex-start;":""}">
            ${w(m)}
        </div>`:d;return n`
        <div class="mateu-content-layout ${t.cssClasses??""}"
             style="${t.style??""}"
             slot="${t.slot??d}">
            <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); align-items: flex-start;">
                ${y?[E,C]:[C,E]}
            </div>
            ${f.length?n`
                <div class="mateu-content-footer"
                     style="flex-basis: 100%; margin-top: var(--lumo-space-m, 1rem);">
                    ${w(f)}
                </div>`:d}
        </div>
    `},sf="var(--mateu-hero-background, color-mix(in srgb, var(--mateu-accent, #1f6f8f) 78%, #0b1a24))",of=e=>e&&/^[\w\s/.:%~?&=#+,@-]+$/.test(e.trim())?`url("${e.trim()}")`:void 0,nf=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=of(l.image),u=!c&&l.centered!==!1,p=u?"center":"flex-start",m=u?"center":"start";return n`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="position: relative; display: flex; flex-direction: column; overflow: hidden; border-radius: var(--lumo-border-radius-l, 12px); margin-top: var(--mateu-hero-margin-top, var(--lumo-space-l, 1.5rem)); min-height: ${l.height??"12rem"}; box-sizing: border-box; background: ${sf}; color: #fff; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${c?n`<div class="mateu-hero-image" aria-hidden="true"
                 style="position: absolute; inset: 0 0 0 auto; width: min(55%, 40rem); background-image: ${c}; background-repeat: no-repeat; background-position: right center; background-size: auto 150%; pointer-events: none;"></div>`:d}
            <div class="mateu-hero-text"
                 style="position: relative; flex: 1; display: flex; flex-direction: column; align-items: ${p}; justify-content: center; gap: var(--lumo-space-s, .5rem); text-align: ${m}; padding: var(--lumo-space-xl, 2.5rem); ${c?"max-width: min(60%, 42rem);":""} box-sizing: border-box;">
                ${l.title?n`<h1 style="margin: 0; font-family: var(--lumo-font-family); font-size: var(--lumo-font-size-xxxl, 2.5rem); font-weight: 600; line-height: 1.15; letter-spacing: -0.01em; color: inherit;">${l.title}</h1>`:d}
                ${l.subtitle?n`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); color: rgba(255, 255, 255, .88); max-width: 40rem;">${l.subtitle}</p>`:d}
                ${t.children?.length?n`
                    <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${p}; width: 100%; max-width: 40rem; margin-top: var(--lumo-space-s, .5rem);">
                        ${t.children?.map(f=>x(e,f,a,r,i,s,o))}
                    </div>
                `:d}
            </div>
            <div class="mateu-hero-strip" aria-hidden="true"
                 style="position: relative; flex-shrink: 0; height: var(--mateu-page-band-h, 0px); background-image: var(--mateu-page-band-image, none); background-repeat: repeat-x; background-size: auto 100%;"></div>
        </div>
    `},te=e=>t=>{if(t.key==="Enter"){e(t);return}(t.key===" "||t.key==="Spacebar")&&(t.preventDefault(),e(t))},le=k`
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
`;var lf=Object.defineProperty,df=Object.getOwnPropertyDescriptor,ro=(e,t,a,r)=>{for(var i=r>1?void 0:r?df(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&lf(t,a,i),i};const es=1440*60*1e3;let xr=class extends I{constructor(){super(...arguments),this.tasks=[],this.onTaskSelectionActionId=""}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-es,max:Math.max(...e)+2*es}:null}months(e,t){const a=[],r=new Date(e);for(r.setDate(1);r.getTime()<=t;){const i=Math.max(r.getTime(),e),s=new Date(r.getFullYear(),r.getMonth()+1,1),o=Math.min(s.getTime(),t);a.push({label:r.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:i,to:o}),r.setMonth(r.getMonth()+1)}return a}render(){const e=this.range();if(!e)return n``;const t=e.max-e.min,a=i=>(i-e.min)/t*100,r=Date.now();return n`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(i=>n`
                        <div class="month" style="width: ${(i.to-i.from)/t*100}%;">${i.label}</div>
                    `)}
                </div>
                ${this.tasks.map(i=>{const s=new Date(i.start+"T00:00:00").getTime(),o=new Date(i.end+"T00:00:00").getTime()+es;return n`
                        <div class="label" title="${i.title}">${i.title}</div>
                        <div class="lane">
                            ${r>=e.min&&r<=e.max?n`<div class="today" style="left: ${a(r)}%;"></div>`:d}
                            <div role="button" tabindex="0"
                                 aria-label="${i.title}, ${i.start} to ${i.end}${i.progress?`, ${i.progress}% complete`:""}"
                                 class="bar ${this.onTaskSelectionActionId?"clickable":""}"
                                 title="${i.title} · ${i.start} → ${i.end}${i.progress?` · ${i.progress}%`:""}"
                                 @click="${()=>this.selectTask(i)}" @keydown="${te(()=>this.selectTask(i))}"
                                 style="left: ${a(s)}%; width: ${(o-s)/t*100}%; ${i.color?`--mateu-gantt-fill: ${i.color};`:""}">
                                <div class="fill" style="width: ${i.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};xr.styles=k`
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
    
        ${le}
    `;ro([h({type:Array})],xr.prototype,"tasks",2);ro([h()],xr.prototype,"onTaskSelectionActionId",2);xr=ro([_("mateu-gantt")],xr);const cf=e=>{const t=e.metadata;return n`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                .onTaskSelectionActionId="${t.onTaskSelectionActionId??""}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-gantt>
    `};var uf=Object.defineProperty,hf=Object.getOwnPropertyDescriptor,Ce=(e,t,a,r)=>{for(var i=r>1?void 0:r?hf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&uf(t,a,i),i};const Go=(e,t)=>({startIdx:Math.min(e,t),endIdx:Math.max(e,t)}),pf=(e,t,a,r)=>e==="start"?{startIdx:Math.min(r,a),endIdx:a}:{startIdx:t,endIdx:Math.max(r,t)};let N=class extends I{constructor(){super(...arguments),this.resources=[],this.blocks=[],this.attributeColumns=[],this.resize=null,this.range=null,this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key==="Escape"&&(this.drag||this.resize||this.range)&&(e.stopPropagation(),this.endDrag())}}static parse(e){return new Date(e+"T00:00:00")}static iso(e){const t=a=>String(a).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){const r=N.parse(this.from),i=N.daysBetween(r,N.parse(this.to))+1;return i>0?{from:r,days:i}:null}const e=this.blocks.flatMap(r=>[r.start,r.end]).filter(r=>!!r).map(r=>N.parse(r));if(!e.length)return null;const t=new Date(Math.min(...e.map(r=>r.getTime()))),a=new Date(Math.max(...e.map(r=>r.getTime())));return{from:t,days:N.daysBetween(t,a)+1}}onBlockPointerDown(e,t,a){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;const s=N.parse(t.start),o=N.parse(t.end),l=Math.max(1,N.daysBetween(s,o)+1);this.laneRects=[...this.renderRoot.querySelectorAll(".lane[data-resource-id]")].map(u=>({resourceId:u.dataset.resourceId,rect:u.getBoundingClientRect()}));const c=this.dayAt(t.resourceId,e.clientX)??a;this.drag={blockId:t.id,duration:l,grabOffsetDays:c-a,originResourceId:t.resourceId,originStartIdx:a,targetResourceId:t.resourceId,targetStartIdx:a,moved:!1},window.addEventListener("keydown",this.onDragKeydown)}dayAt(e,t){const a=this.laneRects.find(s=>s.resourceId===e),r=this.window();if(!a||!r||a.rect.width===0)return null;const i=Math.floor((t-a.rect.left)/a.rect.width*r.days);return Math.max(0,Math.min(r.days-1,i))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;const t=this.window();if(!t)return;const a=this.laneRects.find(s=>e.clientY>=s.rect.top&&e.clientY<=s.rect.bottom)??this.laneRects.find(s=>s.resourceId===this.drag.targetResourceId);if(!a)return;const r=this.dayAt(a.resourceId,e.clientX);if(r==null)return;const i=Math.max(0,Math.min(t.days-this.drag.duration,r-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:a.resourceId,targetStartIdx:i}}onBlockPointerUp(e){const t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;const a=this.window();if(!a)return;const r=N.addDays(a.from,t.targetStartIdx),i=N.addDays(r,t.duration-1);this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:N.iso(r),_end:N.iso(i)}},bubbles:!0,composed:!0}))}emit(e,t){this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}measureLanes(){this.laneRects=[...this.renderRoot.querySelectorAll(".lane[data-resource-id]")].map(e=>({resourceId:e.dataset.resourceId,rect:e.getBoundingClientRect()}))}onHandlePointerDown(e,t,a,r,i){this.resizeActionId&&(e.preventDefault(),e.stopPropagation(),e.currentTarget.setPointerCapture(e.pointerId),this.measureLanes(),this.resize={blockId:t.id,resourceId:t.resourceId,edge:a,startIdx:r,endIdx:i,originStartIdx:r,originEndIdx:i},window.addEventListener("keydown",this.onDragKeydown))}onHandlePointerMove(e){if(!this.resize)return;e.stopPropagation();const t=this.dayAt(this.resize.resourceId,e.clientX);t!=null&&(this.resize={...this.resize,...pf(this.resize.edge,this.resize.originStartIdx,this.resize.originEndIdx,t)})}onHandlePointerUp(e){e.stopPropagation();const t=this.resize;this.endDrag();const a=this.window();!t||!a||!this.resizeActionId||t.startIdx===t.originStartIdx&&t.endIdx===t.originEndIdx||this.emit(this.resizeActionId,{_blockId:t.blockId,_resourceId:t.resourceId,_start:N.iso(N.addDays(a.from,t.startIdx)),_end:N.iso(N.addDays(a.from,t.endIdx))})}onCellsPointerDown(e,t){if(!this.rangeSelectActionId||e.button>0)return;e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.measureLanes();const a=this.dayAt(t,e.clientX);a!=null&&(this.range={resourceId:t,anchorIdx:a,currentIdx:a},window.addEventListener("keydown",this.onDragKeydown))}onCellsPointerMove(e){if(!this.range)return;const t=this.dayAt(this.range.resourceId,e.clientX);t!=null&&t!==this.range.currentIdx&&(this.range={...this.range,currentIdx:t})}onCellsPointerUp(){const e=this.range;this.endDrag();const t=this.window();if(!e||!t||!this.rangeSelectActionId)return;const{startIdx:a,endIdx:r}=Go(e.anchorIdx,e.currentIdx);this.emit(this.rangeSelectActionId,{_resourceId:e.resourceId,_start:N.iso(N.addDays(t.from,a)),_end:N.iso(N.addDays(t.from,r))})}endDrag(){this.drag=null,this.resize=null,this.range=null,window.removeEventListener("keydown",this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.onDragKeydown)}render(){const e=this.window();if(!e||!this.resources.length)return n``;const t=[...Array(e.days).keys()].map(l=>N.addDays(e.from,l)),a=new Date,r=N.daysBetween(e.from,new Date(a.getFullYear(),a.getMonth(),a.getDate())),i=r>=0&&r<e.days,s=[];let o;return this.resources.forEach(l=>{l.group&&l.group!==o&&s.push(n`<div class="group">${l.group}</div>`),o=l.group,s.push(this.renderRow(l,e,t,i?r:null))}),n`
            <div class="frame" style="grid-template-columns: minmax(${8+4.5*this.attributeColumns.length}rem, ${12+4.5*this.attributeColumns.length}rem) repeat(${e.days}, minmax(2.2rem, 1fr));">
                <div class="corner"><span class="res-name">Resource</span>${this.attributeColumns.map(l=>n`<span class="attr">${l}</span>`)}</div>
                ${t.map((l,c)=>n`
                    <div class="day-head ${this.isWeekend(l)?"weekend":""} ${c===r?"today":""}">
                        <span class="dow">${l.toLocaleDateString(void 0,{weekday:"short"})}</span>
                        <span class="num">${l.getDate()}</span>
                    </div>
                `)}
                ${s}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(e,t,a,r){const i=100/t.days,s=this.blocks.filter(l=>l.resourceId===e.id&&l.start&&l.end),o=this.drag?.moved&&this.drag.targetResourceId===e.id?this.drag:null;return n`
            <div class="label" title="${e.label??""}">
                <span class="res-name">${e.icon?V(e.icon):d}${e.label}</span>
                ${this.attributeColumns.map((l,c)=>n`<span class="attr">${(e.attributes??[])[c]??""}</span>`)}
            </div>
            <div class="lane" data-resource-id="${e.id}">
                <div class="cells ${this.rangeSelectActionId?"selectable":""}"
                     @pointerdown="${l=>this.onCellsPointerDown(l,e.id)}"
                     @pointermove="${l=>this.onCellsPointerMove(l)}"
                     @pointerup="${()=>this.onCellsPointerUp()}"
                     @pointercancel="${()=>this.endDrag()}">
                    ${a.map(l=>n`<div class="cell ${this.isWeekend(l)?"weekend":""}"></div>`)}
                </div>
                ${r!=null?n`<div class="today-line" style="left: ${(r+.5)*i}%;"></div>`:d}
                ${s.map(l=>{const c=N.daysBetween(t.from,N.parse(l.start)),u=N.daysBetween(t.from,N.parse(l.end));if(u<0||c>=t.days)return d;const p=Math.max(0,c),m=Math.min(t.days-1,u),f=this.drag?.moved&&this.drag.blockId===l.id,g=this.resize?.blockId===l.id?this.resize:null,y=g?Math.max(0,g.startIdx):p,$=g?Math.min(t.days-1,g.endIdx):m,w=l.summary??`${l.label??""} · ${l.start} → ${l.end}${l.status?` · ${l.status}`:""}`;return n`
                        <div class="block ${this.selectActionId?"clickable":""} ${this.moveActionId?"draggable":""} ${f?"dragging":""}"
                             title="${w}"
                             style="left: ${y*i}%; width: ${($-y+1)*i}%; ${l.color?`--mateu-planning-block: ${l.color};`:""}"
                             @dblclick="${this.openActionId?()=>this.emit(this.openActionId,{_blockId:l.id}):d}"
                             @pointerdown="${C=>this.onBlockPointerDown(C,l,c)}"
                             @pointermove="${C=>this.onBlockPointerMove(C)}"
                             @pointerup="${()=>this.onBlockPointerUp(l)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${this.resizeActionId?n`<span class="handle start"
                                @pointerdown="${C=>this.onHandlePointerDown(C,l,"start",c,u)}"
                                @pointermove="${C=>this.onHandlePointerMove(C)}"
                                @pointerup="${C=>this.onHandlePointerUp(C)}"></span>`:d}${l.icon?V(l.icon):d}${l.label}${this.resizeActionId?n`<span class="handle end"
                                @pointerdown="${C=>this.onHandlePointerDown(C,l,"end",c,u)}"
                                @pointermove="${C=>this.onHandlePointerMove(C)}"
                                @pointerup="${C=>this.onHandlePointerUp(C)}"></span>`:d}</div>
                    `})}
                ${this.range&&this.range.resourceId===e.id?(()=>{const{startIdx:l,endIdx:c}=Go(this.range.anchorIdx,this.range.currentIdx);return n`<div class="range" style="left: ${l*i}%; width: ${(c-l+1)*i}%;"></div>`})():d}
                ${o?n`
                    <div class="ghost"
                         style="left: ${o.targetStartIdx*i}%; width: ${Math.min(o.duration,t.days-o.targetStartIdx)*i}%;"></div>
                `:d}
            </div>
        `}};N.styles=k`
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
        .label { display: flex; align-items: center; gap: .5rem; }
        .label .res-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; display: inline-flex; align-items: center; gap: .3rem; }
        .label .attr, .corner .attr {
            flex: 0 0 4rem; overflow: hidden; text-overflow: ellipsis; color: var(--lumo-secondary-text-color, #666);
            font-size: .85em;
        }
        .corner { display: flex; align-items: center; gap: .5rem; }
        .corner .res-name { flex: 1 1 auto; }
        .block vaadin-icon, .label vaadin-icon { width: .9rem; height: .9rem; vertical-align: -2px; margin-right: .2rem; }
        .handle {
            position: absolute; top: 0; bottom: 0; width: 6px; cursor: ew-resize; z-index: 1;
        }
        .handle.start { left: 0; }
        .handle.end { right: 0; }
        .handle:hover { background: rgba(255,255,255,.35); }
        .cells.selectable { cursor: crosshair; }
        .range {
            position: absolute; top: 15%; bottom: 15%;
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));
            border: 1px solid var(--lumo-primary-color-50pct, rgba(26,115,232,.5));
            border-radius: .35rem; pointer-events: none; z-index: 1;
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
    `;Ce([h({type:Array})],N.prototype,"resources",2);Ce([h({type:Array})],N.prototype,"blocks",2);Ce([h()],N.prototype,"from",2);Ce([h()],N.prototype,"to",2);Ce([h()],N.prototype,"moveActionId",2);Ce([h()],N.prototype,"selectActionId",2);Ce([h({type:Array})],N.prototype,"attributeColumns",2);Ce([h()],N.prototype,"resizeActionId",2);Ce([h()],N.prototype,"openActionId",2);Ce([h()],N.prototype,"rangeSelectActionId",2);Ce([b()],N.prototype,"resize",2);Ce([b()],N.prototype,"range",2);Ce([b()],N.prototype,"drag",2);N=Ce([_("mateu-planning-board")],N);const mf=e=>{const t=e.metadata;return n`
        <mateu-planning-board
                .resources="${t.resources??[]}"
                .blocks="${t.blocks??[]}"
                .from="${t.from}"
                .to="${t.to}"
                .moveActionId="${t.moveActionId}"
                .selectActionId="${t.selectActionId}"
                .attributeColumns="${t.attributeColumns??[]}"
                .resizeActionId="${t.resizeActionId??void 0}"
                .openActionId="${t.openActionId??void 0}"
                .rangeSelectActionId="${t.rangeSelectActionId??void 0}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-planning-board>
    `};var ff=Object.defineProperty,vf=Object.getOwnPropertyDescriptor,od=(e,t,a,r)=>{for(var i=r>1?void 0:r?vf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&ff(t,a,i),i};let mi=class extends I{constructor(){super(...arguments),this.columns=[]}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return n`
            <div class="board">
                ${this.columns.map(e=>n`
                    <div class="column" style="${e.color?`--mateu-kanban-accent: ${e.color};`:""}">
                        <div class="column-head">
                            <span class="column-title" title="${e.title??""}">${e.title}</span>
                            <span class="count">${e.cards?.length??0}</span>
                        </div>
                        ${(e.cards??[]).map(t=>n`
                            <div role="button" tabindex="0" class="card ${t.actionId?"clickable":""}"
                                 style="${t.color?`--mateu-kanban-card-accent: ${t.color};`:""}"
                                 @click="${()=>this.clickCard(t)}" @keydown="${te(()=>this.clickCard(t))}">
                                <span class="card-title">${t.title}</span>
                                ${t.description?n`<span class="card-desc">${t.description}</span>`:d}
                                ${t.badge?n`<span class="badge">${t.badge}</span>`:d}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};mi.styles=k`
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
    
        ${le}
    `;od([h({type:Array})],mi.prototype,"columns",2);mi=od([_("mateu-kanban")],mi);const gf=e=>{const t=e.metadata;return n`
        <mateu-kanban
                .columns="${t.columns??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-kanban>
    `};var bf=Object.defineProperty,yf=Object.getOwnPropertyDescriptor,nd=(e,t,a,r)=>{for(var i=r>1?void 0:r?yf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&bf(t,a,i),i};let fi=class extends I{constructor(){super(...arguments),this.items=[]}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return n`
            <div class="feed">
                ${this.items.map(e=>n`
                    <div class="item ${e.actionId?"clickable":""}">
                        <div class="rail">
                            <div class="dot" style="${e.color?`--mateu-timeline-dot: ${e.color};`:""}">${e.icon??""}</div>
                            <div class="line"></div>
                        </div>
                        <div role="button" tabindex="0" class="body" @click="${()=>this.clickItem(e)}" @keydown="${te(()=>this.clickItem(e))}">
                            <div class="head">
                                <span class="title">${e.title}</span>
                                ${e.timestamp?n`<span class="time">${e.timestamp}</span>`:d}
                            </div>
                            ${e.description?n`<div class="desc">${e.description}</div>`:d}
                        </div>
                    </div>
                `)}
            </div>
        `}};fi.styles=k`
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
    
        ${le}
    `;nd([h({type:Array})],fi.prototype,"items",2);fi=nd([_("mateu-timeline")],fi);const $f=e=>{const t=e.metadata;return n`
        <mateu-timeline
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-timeline>
    `};var wf=Object.defineProperty,xf=Object.getOwnPropertyDescriptor,io=(e,t,a,r)=>{for(var i=r>1?void 0:r?xf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&wf(t,a,i),i};let kr=class extends I{constructor(){super(...arguments),this.steps=[],this.vertical=!1}updated(){const e=this.steps.length;if(e===0)return;const t=this.steps.findIndex(i=>i.status==="current"),a=this.steps.every(i=>i.status==="done"),r=t>=0?t+1:a?e:0;this.dispatchEvent(new CustomEvent("mateu-guided-progress",{detail:{current:r,total:e,steps:this.steps.map(i=>({id:i.id,title:i.title,status:i.status??"upcoming"}))},bubbles:!0,composed:!0}))}render(){return n`
            <div class="steps">
                ${this.steps.map((e,t)=>{const a=e.status??"upcoming";return n`
                        <div class="step ${a}">
                            <div class="connector"></div>
                            <div class="dot">${a==="done"?"✓":t+1}</div>
                            <div class="label">${e.title}</div>
                            ${e.description?n`<div class="desc">${e.description}</div>`:d}
                        </div>
                    `})}
            </div>
        `}};kr.styles=k`
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
    `;io([h({type:Array})],kr.prototype,"steps",2);io([h({type:Boolean,reflect:!0})],kr.prototype,"vertical",2);kr=io([_("mateu-progress-steps")],kr);const kf=e=>{const t=e.metadata;return n`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                ?vertical="${t.vertical??!1}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-progress-steps>
    `};var _f=Object.defineProperty,Sf=Object.getOwnPropertyDescriptor,ra=(e,t,a,r)=>{for(var i=r>1?void 0:r?Sf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&_f(t,a,i),i};let ft=class extends I{constructor(){super(...arguments),this.spark=[]}sparkline(){const e=this.spark;if(!e||e.length<2)return d;const t=84,a=30,r=2,i=Math.min(...e),o=Math.max(...e)-i||1,l=(t-r*2)/(e.length-1),c=e.map((f,g)=>{const y=r+g*l,$=r+(a-r*2)*(1-(f-i)/o);return[y,$]}),u=c.map(([f,g],y)=>`${y===0?"M":"L"}${f.toFixed(1)} ${g.toFixed(1)}`).join(" "),p=`${u} L${c[c.length-1][0].toFixed(1)} ${a} L${c[0][0].toFixed(1)} ${a} Z`,m=this.trend==="down"?"var(--lumo-error-color, #e11d48)":this.trend==="flat"?"var(--lumo-secondary-text-color, #888)":"var(--lumo-success-color, #12b76a)";return me`
            <svg width="${t}" height="${a}" viewBox="0 0 ${t} ${a}">
                <path d="${p}" fill="${m}" opacity="0.12"></path>
                <path d="${u}" fill="none" stroke="${m}" stroke-width="1.6"
                      stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>
        `}dispatchAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=this.trend??"up";return n`
            <div role="button" tabindex="0" class="tile ${this.actionId?"clickable":""}" @click="${()=>this.dispatchAction()}" @keydown="${te(()=>this.dispatchAction())}">
                ${this.label?n`<span class="label">${this.label}</span>`:d}
                <span class="value">${this.value}${this.unit?n`<span class="unit">${this.unit}</span>`:d}</span>
                <div class="foot">
                    ${this.delta?n`<span class="delta ${e}">${e==="up"?"▲":e==="down"?"▼":"→"} ${this.delta}</span>`:n`<span></span>`}
                    ${this.sparkline()}
                </div>
            </div>
        `}};ft.styles=k`
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
    
        ${le}
    `;ra([h()],ft.prototype,"label",2);ra([h()],ft.prototype,"value",2);ra([h()],ft.prototype,"unit",2);ra([h()],ft.prototype,"delta",2);ra([h()],ft.prototype,"trend",2);ra([h({type:Array})],ft.prototype,"spark",2);ra([h()],ft.prototype,"actionId",2);ft=ra([_("mateu-stat")],ft);const Cf=e=>{const t=e.metadata;return n`
        <mateu-stat
                label="${t.label??d}"
                value="${t.value??d}"
                unit="${t.unit??d}"
                delta="${t.delta??d}"
                trend="${t.trend??d}"
                actionId="${t.actionId??d}"
                .spark="${t.spark??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-stat>
    `},ld=e=>{const[t,a,r]=e.split("-").map(Number);return Date.UTC(t,a-1,r)},so=e=>new Date(e).toISOString().slice(0,10),Es=(e,t)=>so(ld(e)+t*864e5),dd=e=>(new Date(ld(e)).getUTCDay()+6)%7,cd=e=>e.slice(0,8)+"01",ud=e=>{const[t,a]=e.split("-").map(Number);return so(Date.UTC(t,a,0))},Ko=()=>{const e=new Date;return so(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()))},ts=(e,t)=>{if(e==="day")return{from:t,to:t};if(e==="week"){const a=Es(t,-dd(t));return{from:a,to:Es(a,6)}}return{from:cd(t),to:ud(t)}},oo=(e,t)=>{const a=[];for(let r=e;r<=t;r=Es(r,1))a.push(r);return a},Ef=e=>{const t=cd(e),a=Array(dd(t)).fill(null);for(a.push(...oo(t,ud(e)));a.length%7;)a.push(null);const r=[];for(let i=0;i<a.length;i+=7)r.push(a.slice(i,i+7));return r},hd=(e,t)=>e.filter(a=>a.date&&a.date<=t&&(a.endDate||a.date)>=t).map((a,r)=>({e:a,i:r})).sort((a,r)=>(a.e.startTime||"").localeCompare(r.e.startTime||"")||a.i-r.i).map(({e:a})=>a),If=(e,t,a)=>oo(t,a).map(r=>({date:r,events:hd(e,r)})).filter(r=>r.events.length),Yo=(e,t)=>(e||[]).find(a=>a.date===t),Tf=e=>e.startTime?e.startTime+(e.endTime?"–"+e.endTime:""):"",Af=new Set(["info","success","warning","danger","neutral"]),Jo=e=>e&&Af.has(e)?"tone-"+e:"";var Pf=Object.defineProperty,Of=Object.getOwnPropertyDescriptor,ia=(e,t,a,r)=>{for(var i=r>1?void 0:r?Of(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Pf(t,a,i),i};let vt=class extends I{constructor(){super(...arguments),this.events=[],this.views=[],this.days=[]}willUpdate(e){(e.has("view")||!this.shown)&&(this.shown=this.view||"month")}clickEvent(e,t){t?.stopPropagation(),e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}clickDay(e){this.dayActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.dayActionId,parameters:{_date:e}},bubbles:!0,composed:!0}))}chip(e,t){const a=t?Tf(e):"";return n`
            <span role="button" tabindex="0" class="chip ${e.actionId?"clickable":""}"
                  style="${e.color?`--mateu-cal-accent: ${e.color};`:""}"
                  title="${(a?a+" ":"")+(e.title??"")}"
                  @click="${r=>this.clickEvent(e,r)}"
                  @keydown="${te(()=>this.clickEvent(e))}">${a?n`<span class="time">${a}</span>`:d}${e.title}</span>`}dayCell(e,t,a=!0){const r=Yo(this.days,e),i=!!this.dayActionId,s=hd(this.events,e),o=new Date(e+"T00:00:00").toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"})+(r?.label?", "+r.label:"")+(s.length?", "+s.length+" event"+(s.length>1?"s":""):"");return n`
            <div class="cell ${e===Ko()?"today":""} ${Jo(r?.tone)} ${i?"clickable":""}"
                 role="${i?"button":d}" tabindex="${i?"0":d}"
                 aria-label="${i?o:d}"
                 @click="${i?()=>this.clickDay(e):d}"
                 @keydown="${i?te(()=>this.clickDay(e)):d}">
                <div class="top">
                    ${r?.label?n`<span class="label">${r.label}</span>`:d}
                    ${a?n`<span class="num">${Number(e.slice(8))}</span>`:d}
                </div>
                ${s.map(l=>this.chip(l,t))}
            </div>`}renderMonth(e){return n`
            <div class="grid month">
                ${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(a=>n`<div class="dow">${a}</div>`)}
                ${Ef(e).flat().map(a=>a?this.dayCell(a,!1):n`<div class="cell blank"></div>`)}
            </div>`}renderWeek(e){const{from:t,to:a}=ts("week",e),r=oo(t,a);return n`
            <div class="grid week">
                ${r.map(i=>n`<div class="dow">${new Date(i+"T00:00:00").toLocaleDateString(void 0,{weekday:"short",day:"numeric"})}</div>`)}
                ${r.map(i=>this.dayCell(i,!0,!1))}
            </div>`}renderDay(e){return n`
            <div class="grid day">
                <div class="dow">${new Date(e+"T00:00:00").toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"})}</div>
                ${this.dayCell(e,!0,!1)}
            </div>`}renderList(e){const{from:t,to:a}=ts("list",e),r=If(this.events,t,a);return r.length?n`
            <div class="agenda">
                ${r.map(({date:i,events:s})=>{const o=Yo(this.days,i);return n`
                        <div class="date ${Jo(o?.tone)}">
                            <span>${new Date(i+"T00:00:00").toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"})}</span>
                            ${o?.label?n`<span class="label">${o.label}</span>`:d}
                        </div>
                        <div class="entries">${s.map(l=>this.chip(l,!0))}</div>`})}
            </div>`:n`<div class="agenda"><div class="empty">No events</div></div>`}titleOf(e,t){const a=new Date(t+"T00:00:00");if(e==="day")return a.toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long",year:"numeric"});if(e==="week"){const{from:r,to:i}=ts("week",t),s=new Date(r+"T00:00:00"),o=new Date(i+"T00:00:00");return s.toLocaleDateString(void 0,{day:"numeric",month:"short"})+" – "+o.toLocaleDateString(void 0,{day:"numeric",month:"short",year:"numeric"})}return a.toLocaleDateString(void 0,{month:"long",year:"numeric"})}render(){const e=this.month||Ko(),t=this.shown||"month";return n`
            <div class="head">
                <div class="title">${this.titleOf(t,e)}</div>
                ${this.views&&this.views.length>1?n`
                    <div class="switcher" role="group" aria-label="View">
                        ${this.views.map(a=>n`<button type="button" aria-pressed="${a===t?"true":"false"}"
                            @click="${()=>{this.shown=a}}">${a.charAt(0).toUpperCase()+a.slice(1)}</button>`)}
                    </div>`:d}
            </div>
            ${t==="week"?this.renderWeek(e):t==="day"?this.renderDay(e):t==="list"?this.renderList(e):this.renderMonth(e)}
        `}};vt.styles=k`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .head { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-bottom: .5rem; }
        .title {
            font-weight: 700;
            font-size: 1.05rem;
            color: var(--lumo-body-text-color, #222);
        }
        .switcher { display: inline-flex; border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2)); border-radius: var(--lumo-border-radius-m, 6px); overflow: hidden; }
        .switcher button {
            font: inherit; font-size: var(--lumo-font-size-s, .85rem); border: 0; padding: .3rem .7rem; cursor: pointer;
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #222);
        }
        .switcher button + button { border-left: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2)); }
        .switcher button[aria-pressed="true"] { background: var(--lumo-primary-color, #1a73e8); color: var(--lumo-primary-contrast-color, #fff); }
        .grid {
            display: grid;
            grid-template-columns: repeat(7, minmax(0, 1fr));
            gap: 1px;
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-m, 8px);
            overflow: hidden;
        }
        .grid.day { grid-template-columns: 1fr; }
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
        .grid.week .cell { min-height: 12rem; }
        .grid.day .cell { min-height: 10rem; }
        .cell.blank {
            background: var(--lumo-contrast-5pct, #fafafa);
        }
        .cell.clickable { cursor: pointer; }
        .cell.clickable:hover { box-shadow: inset 0 0 0 2px var(--lumo-primary-color-50pct, rgba(26,115,232,.5)); }
        .top { display: flex; justify-content: space-between; align-items: center; gap: .25rem; }
        .label { font-size: var(--lumo-font-size-xs, .72rem); font-weight: 600; color: var(--lumo-secondary-text-color, #555); }
        .num {
            font-size: var(--lumo-font-size-xs, .72rem);
            color: var(--lumo-secondary-text-color, #888);
            margin-left: auto;
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
        .grid.week .chip, .grid.day .chip, .agenda .chip { white-space: normal; }
        .time { font-variant-numeric: tabular-nums; opacity: .8; margin-right: .25rem; }
        .chip.clickable { cursor: pointer; }
        .chip.clickable:hover { filter: brightness(.95); }
        .agenda { border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); border-radius: var(--lumo-border-radius-m, 8px); }
        .agenda .date { padding: .5rem .75rem; font-weight: 600; background: var(--lumo-contrast-5pct, #f7f7f8); display: flex; justify-content: space-between; }
        .agenda .entries { padding: .4rem .75rem; display: flex; flex-direction: column; gap: .3rem; }
        .empty { padding: 1rem; color: var(--lumo-secondary-text-color, #888); }
        .tone-info { background-color: rgba(0, 110, 200, .08); }
        .tone-success { background-color: rgba(30, 140, 60, .10); }
        .tone-warning { background-color: rgba(220, 140, 0, .16); }
        .tone-danger { background-color: rgba(200, 40, 30, .10); }
        .tone-danger .label { color: #b3261e; }
        .tone-neutral { background-color: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
        @media (prefers-color-scheme: dark) {
            .cell { background: var(--lumo-contrast-5pct, #2a2a2a); }
            .dow { background: var(--lumo-contrast-10pct, #333); }
        }

        ${le}
    `;ia([h()],vt.prototype,"month",2);ia([h({type:Array})],vt.prototype,"events",2);ia([h()],vt.prototype,"view",2);ia([h({type:Array})],vt.prototype,"views",2);ia([h({type:Array})],vt.prototype,"days",2);ia([h()],vt.prototype,"dayActionId",2);ia([b()],vt.prototype,"shown",2);vt=ia([_("mateu-calendar")],vt);const Rf=e=>{const t=e.metadata;return n`
        <mateu-calendar
                month="${t.month??d}"
                .events="${t.events??[]}"
                view="${t.view??d}"
                .views="${t.views??[]}"
                .days="${t.days??[]}"
                dayActionId="${t.dayActionId??d}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-calendar>
    `};var zf=Object.defineProperty,Lf=Object.getOwnPropertyDescriptor,pd=(e,t,a,r)=>{for(var i=r>1?void 0:r?Lf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&zf(t,a,i),i};let vi=class extends I{constructor(){super(...arguments),this.plans=[]}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return n`
            <div class="plans">
                ${this.plans.map(e=>n`
                    <div class="plan ${e.featured?"featured":""}">
                        ${e.featured?n`<span class="badge">Recommended</span>`:d}
                        <span class="name">${e.name}</span>
                        <div>
                            <span class="price">${e.price}</span>
                            ${e.period?n`<span class="period">${e.period}</span>`:d}
                        </div>
                        <ul>
                            ${(e.features??[]).map(t=>n`<li>${t}</li>`)}
                        </ul>
                        ${e.ctaLabel?n`
                            <button class="cta" @click="${()=>this.cta(e)}">${e.ctaLabel}</button>
                        `:d}
                    </div>
                `)}
            </div>
        `}};vi.styles=k`
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
    `;pd([h({type:Array})],vi.prototype,"plans",2);vi=pd([_("mateu-pricing-table")],vi);const Df=e=>{const t=e.metadata;return n`
        <mateu-pricing-table
                .plans="${t.plans??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-pricing-table>
    `};var Mf=Object.defineProperty,Nf=Object.getOwnPropertyDescriptor,md=(e,t,a,r)=>{for(var i=r>1?void 0:r?Nf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Mf(t,a,i),i};let gi=class extends I{clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){const t=e.avatar,a=t&&(t.startsWith("http")||t.startsWith("data:"));return n`
            <li>
                <div role="button" tabindex="0" class="node ${e.actionId?"clickable":""}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:""}"
                     @click="${()=>this.clickNode(e)}" @keydown="${te(()=>this.clickNode(e))}">
                    ${t?n`<span class="avatar">${a?n`<img src="${t}" alt="">`:t}</span>`:d}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?n`<span class="subtitle">${e.subtitle}</span>`:d}
                </div>
                ${e.children&&e.children.length?n`<ul>${e.children.map(r=>this.renderNode(r))}</ul>`:d}
            </li>
        `}render(){return this.root?n`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:n``}};gi.styles=k`
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
    
        ${le}
    `;md([h({attribute:!1})],gi.prototype,"root",2);gi=md([_("mateu-org-chart")],gi);const Ff=e=>{const t=e.metadata;return n`
        <mateu-org-chart
                .root="${t.root}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-org-chart>
    `};var qf=Object.defineProperty,Bf=Object.getOwnPropertyDescriptor,fd=(e,t,a,r)=>{for(var i=r>1?void 0:r?Bf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&qf(t,a,i),i};const Uf=1440*60*1e3;let bi=class extends I{constructor(){super(...arguments),this.cells=[]}color(e,t){if(e<=0||t<=0)return"var(--lumo-contrast-10pct, #ebedf0)";const a=e/t,r=a>.75?1:a>.5?.75:a>.25?.5:.3;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round(r*100)}%, transparent)`}render(){const e=this.cells.filter(c=>!!c.date);if(!e.length)return n``;const t=e.map(c=>new Date(c.date+"T00:00:00").getTime()),a=Math.min(...t),r=Math.max(...t),i=new Date(a);i.setDate(i.getDate()-(i.getDay()+6)%7);const s={};for(const c of e)s[c.date]=c;const o=Math.max(...e.map(c=>c.value??0),1),l=[];for(let c=i.getTime();c<=r;c+=Uf){const u=new Date(c),p=u.toISOString().slice(0,10),m=s[p],f=m?.value??0,g=(u.getDay()+6)%7+1,y=m?.label??`${p}: ${f}`;l.push(n`
                <div class="cell" style="grid-row: ${g}; --cell: ${this.color(f,o)};" title="${y}"></div>
            `)}return n`
            <div class="wrap">
                <div class="grid">${l}</div>
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
        `}};bi.styles=k`
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
    `;fd([h({type:Array})],bi.prototype,"cells",2);bi=fd([_("mateu-heatmap")],bi);const jf=e=>{const t=e.metadata;return n`
        <mateu-heatmap
                .cells="${t.cells??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-heatmap>
    `};var Hf=Object.defineProperty,Wf=Object.getOwnPropertyDescriptor,vd=(e,t,a,r)=>{for(var i=r>1?void 0:r?Wf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Hf(t,a,i),i};let yi=class extends I{constructor(){super(...arguments),this.stages=[]}render(){const e=this.stages;if(!e.length)return n``;const t=e[0].value??0,a=Math.max(...e.map(r=>r.value??0),1);return n`
            <div class="funnel">
                ${e.map((r,i)=>{const s=r.value??0,o=a>0?Math.max(6,s/a*100):6,l=i>0?e[i-1].value??0:t,c=i===0?t>0?"100%":"":l>0?`${Math.round(s/l*100)}%`:"0%";return n`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${r.label}</span>
                                ${i>0?n`<span class="conv">${c} of previous</span>`:d}
                            </div>
                            <div class="bar" style="width: ${o}%; ${r.color?`--bar: ${r.color};`:""}">
                                ${s.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};yi.styles=k`
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
    `;vd([h({type:Array})],yi.prototype,"stages",2);yi=vd([_("mateu-funnel")],yi);const Vf=e=>{const t=e.metadata;return n`
        <mateu-funnel
                .stages="${t.stages??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-funnel>
    `};var Gf=Object.defineProperty,Kf=Object.getOwnPropertyDescriptor,tr=(e,t,a,r)=>{for(var i=r>1?void 0:r?Kf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Gf(t,a,i),i};let Jt=class extends I{constructor(){super(...arguments),this.values=[],this.labels=[],this.area=!1}render(){const e=this.values;if(!e||e.length<2)return n``;const t=600,a=160,r=8,i=Math.min(...e),s=Math.max(...e),o=s-i||1,l=(t-r*2)/(e.length-1),c=e.map((y,$)=>{const w=r+$*l,C=r+(a-r*2)*(1-(y-i)/o);return[w,C]}),u=c.map(([y,$],w)=>`${w===0?"M":"L"}${y.toFixed(1)} ${$.toFixed(1)}`).join(" "),p=`${u} L${c[c.length-1][0].toFixed(1)} ${a-r} L${c[0][0].toFixed(1)} ${a-r} Z`,m=this.color||"var(--lumo-primary-color, #1a73e8)",f=e.indexOf(s),g=e.indexOf(i);return n`
            ${this.heading?n`<div class="title">${this.heading}</div>`:d}
            <svg viewBox="0 0 ${t} ${a}" preserveAspectRatio="none">
                ${this.area?me`<path d="${p}" fill="${m}" opacity="0.12"></path>`:d}
                <path d="${u}" fill="none" stroke="${m}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${c.map((y,$)=>$===f||$===g?me`<circle cx="${y[0]}" cy="${y[1]}" r="3.2" fill="${m}"><title>${this.labels[$]??""}: ${e[$]}</title></circle>`:me`<circle cx="${y[0]}" cy="${y[1]}" r="6" fill="transparent"><title>${this.labels[$]??""}: ${e[$]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?n`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:d}
        `}};Jt.styles=k`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `;tr([h()],Jt.prototype,"heading",2);tr([h({type:Array})],Jt.prototype,"values",2);tr([h({type:Array})],Jt.prototype,"labels",2);tr([h()],Jt.prototype,"color",2);tr([h({type:Boolean})],Jt.prototype,"area",2);Jt=tr([_("mateu-trend-chart")],Jt);const Yf=e=>{const t=e.metadata;return n`
        <mateu-trend-chart
                heading="${t.title??d}"
                color="${t.color??d}"
                ?area="${t.area??!1}"
                .values="${t.values??[]}"
                .labels="${t.labels??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-trend-chart>
    `};var Jf=Object.defineProperty,Xf=Object.getOwnPropertyDescriptor,no=(e,t,a,r)=>{for(var i=r>1?void 0:r?Xf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Jf(t,a,i),i};let _r=class extends I{constructor(){super(...arguments),this.features=[],this.columns=0}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){const e=this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(15rem, 1fr))";return n`
            <div class="grid" style="grid-template-columns: ${e};">
                ${this.features.map(t=>n`
                    <div role="button" tabindex="0" class="card ${t.actionId?"clickable":""}" @click="${()=>this.clickFeature(t)}" @keydown="${te(()=>this.clickFeature(t))}">
                        ${t.icon?n`<span class="icon">${t.icon}</span>`:d}
                        <span class="title">${t.title}</span>
                        ${t.description?n`<span class="desc">${t.description}</span>`:d}
                    </div>
                `)}
            </div>
        `}};_r.styles=k`
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
    
        ${le}
    `;no([h({type:Array})],_r.prototype,"features",2);no([h({type:Number})],_r.prototype,"columns",2);_r=no([_("mateu-feature-grid")],_r);const Qf=e=>{const t=e.metadata;return n`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-feature-grid>
    `};var Zf=Object.defineProperty,ev=Object.getOwnPropertyDescriptor,gd=(e,t,a,r)=>{for(var i=r>1?void 0:r?ev(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Zf(t,a,i),i};let $i=class extends I{constructor(){super(...arguments),this.items=[]}stars(e){const t=Math.max(0,Math.min(5,e||0));return"★".repeat(t)+"☆".repeat(5-t)}render(){return n`
            <div class="grid">
                ${this.items.map(e=>{const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return n`
                        <div class="card">
                            ${e.rating?n`<div class="stars">${this.stars(e.rating)}</div>`:d}
                            <div class="quote">${e.quote}</div>
                            <div class="author">
                                ${e.avatar?n`<span class="avatar">${t?n`<img src="${e.avatar}" alt="">`:e.avatar}</span>`:d}
                                <div>
                                    <div class="name">${e.author}</div>
                                    ${e.role?n`<div class="role">${e.role}</div>`:d}
                                </div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};$i.styles=k`
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
    `;gd([h({type:Array})],$i.prototype,"items",2);$i=gd([_("mateu-testimonials")],$i);const tv=e=>{const t=e.metadata;return n`
        <mateu-testimonials
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-testimonials>
    `};var av=Object.defineProperty,rv=Object.getOwnPropertyDescriptor,lo=(e,t,a,r)=>{for(var i=r>1?void 0:r?rv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&av(t,a,i),i};let Sr=class extends I{constructor(){super(...arguments),this.items=[],this.openSet=new Set,this.seeded=!1}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),n`
            <div class="list">
                ${this.items.map((e,t)=>{const a=this.openSet.has(t);return n`
                        <div class="item ${a?"open":""}">
                            <div role="button" tabindex="0" aria-expanded="${a}" class="q" @click="${()=>this.toggle(t)}" @keydown="${te(()=>this.toggle(t))}">
                                <span>${e.question}</span>
                                <span class="chevron">›</span>
                            </div>
                            ${a?n`<div class="a">${e.answer}</div>`:""}
                        </div>
                    `})}
            </div>
        `}};Sr.styles=k`
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
    
        ${le}
    `;lo([h({type:Array})],Sr.prototype,"items",2);lo([b()],Sr.prototype,"openSet",2);Sr=lo([_("mateu-faq")],Sr);const iv=e=>{const t=e.metadata;return n`
        <mateu-faq
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-faq>
    `};var sv=Object.defineProperty,ov=Object.getOwnPropertyDescriptor,Pa=(e,t,a,r)=>{for(var i=r>1?void 0:r?ov(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&sv(t,a,i),i};let zt=class extends I{themeVars(){switch(this.theme){case"success":return"--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));";case"warning":return"--accent: #f59e0b; --bg: rgba(245,158,11,.12);";case"danger":return"--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));";default:return"--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));"}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return n`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?n`<span class="icon">${this.icon}</span>`:d}
                <div class="body">
                    ${this.heading?n`<span class="heading">${this.heading}</span>`:d}
                    ${this.description?n`<span class="desc">${this.description}</span>`:d}
                    ${this.ctaLabel?n`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:d}
                </div>
            </div>
        `}};zt.styles=k`
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
    `;Pa([h()],zt.prototype,"heading",2);Pa([h()],zt.prototype,"description",2);Pa([h()],zt.prototype,"icon",2);Pa([h()],zt.prototype,"ctaLabel",2);Pa([h()],zt.prototype,"actionId",2);Pa([h()],zt.prototype,"theme",2);zt=Pa([_("mateu-callout-card")],zt);const nv=e=>{const t=e.metadata;return n`
        <mateu-callout-card
                heading="${t.title??d}"
                description="${t.description??d}"
                icon="${t.icon??d}"
                ctaLabel="${t.ctaLabel??d}"
                actionId="${t.actionId??d}"
                theme="${t.theme??d}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-callout-card>
    `};var lv=Object.defineProperty,dv=Object.getOwnPropertyDescriptor,bd=(e,t,a,r)=>{for(var i=r>1?void 0:r?dv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&lv(t,a,i),i};let wi=class extends I{constructor(){super(...arguments),this.comments=[]}renderComment(e){const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return n`
            <div class="comment">
                <span class="avatar">${e.avatar?t?n`<img src="${e.avatar}" alt="">`:e.avatar:e.author?.[0]??"?"}</span>
                <div class="body">
                    <div class="head">
                        <span class="author">${e.author}</span>
                        ${e.timestamp?n`<span class="time">${e.timestamp}</span>`:d}
                    </div>
                    <div class="text">${e.text}</div>
                    ${e.replies&&e.replies.length?n`<div class="replies">${e.replies.map(a=>this.renderComment(a))}</div>`:d}
                </div>
            </div>
        `}render(){return n`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};wi.styles=k`
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
    `;bd([h({type:Array})],wi.prototype,"comments",2);wi=bd([_("mateu-comment-thread")],wi);const cv=e=>{const t=e.metadata;return n`
        <mateu-comment-thread
                .comments="${t.comments??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-comment-thread>
    `};var uv=Object.defineProperty,hv=Object.getOwnPropertyDescriptor,yd=(e,t,a,r)=>{for(var i=r>1?void 0:r?hv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&uv(t,a,i),i};const pv={pdf:"📕",image:"🖼️",img:"🖼️",doc:"📘",docx:"📘",word:"📘",xls:"📗",xlsx:"📗",excel:"📗",sheet:"📗",zip:"🗜️",archive:"🗜️",video:"🎬",audio:"🎵",code:"💻",csv:"📄",txt:"📄"};let xi=class extends I{constructor(){super(...arguments),this.files=[]}icon(e){return e&&pv[e.toLowerCase()]||"📄"}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return n`
            <div class="list">
                ${this.files.map(e=>{const t=!!e.url||!!e.actionId,a=n`
                        <span class="icon">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?n`<span class="size">${e.size}</span>`:d}
                        ${e.url?n`<span class="dl">⬇</span>`:d}
                    `;return e.url?n`<a class="file clickable" href="${e.url}" download target="_blank" rel="noopener">${a}</a>`:n`<div role="button" tabindex="0" class="file ${t?"clickable":""}" @click="${r=>this.clickFile(e,r)}" @keydown="${te(r=>this.clickFile(e,r))}">${a}</div>`})}
            </div>
        `}};xi.styles=k`
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
    
        ${le}
    `;yd([h({type:Array})],xi.prototype,"files",2);xi=yd([_("mateu-file-list")],xi);const mv=e=>{const t=e.metadata;return n`
        <mateu-file-list
                .files="${t.files??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-file-list>
    `};var fv=Object.defineProperty,vv=Object.getOwnPropertyDescriptor,Di=(e,t,a,r)=>{for(var i=r>1?void 0:r?vv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&fv(t,a,i),i};let Ha=class extends I{constructor(){super(...arguments),this.items=[],this.localDone=new Map}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){const a=!this.isDone(e,t);this.localDone.set(t,a),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e,_done:a}},bubbles:!0,composed:!0}))}render(){const e=this.items.length,t=this.items.filter((r,i)=>this.isDone(r,i)).length,a=e>0?Math.round(t/e*100):0;return n`
            <div class="head">
                ${this.heading?n`<span class="title">${this.heading}</span>`:n`<span></span>`}
                <span class="count">${t} / ${e}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${a}%;"></div></div>
            ${this.items.map((r,i)=>{const s=this.isDone(r,i);return n`
                    <div role="button" tabindex="0" class="item ${s?"done":""}" @click="${()=>this.toggle(r,i)}" @keydown="${te(()=>this.toggle(r,i))}">
                        <span class="box">${s?"✓":d}</span>
                        <span class="label">${r.label}</span>
                    </div>
                `})}
        `}};Ha.styles=k`
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
    
        ${le}
    `;Di([h()],Ha.prototype,"heading",2);Di([h({type:Array})],Ha.prototype,"items",2);Di([b()],Ha.prototype,"localDone",2);Ha=Di([_("mateu-checklist")],Ha);const gv=e=>{const t=e.metadata;return n`
        <mateu-checklist
                heading="${t.title??d}"
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-checklist>
    `};var bv=Object.defineProperty,yv=Object.getOwnPropertyDescriptor,sa=(e,t,a,r)=>{for(var i=r>1?void 0:r?yv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&bv(t,a,i),i};let gt=class extends I{render(){const e=this.trend??"flat";return n`
            <div class="card">
                ${this.heading?n`<div class="title">${this.heading}</div>`:d}
                <div class="row">
                    <div class="side">
                        ${this.leftLabel?n`<div class="label">${this.leftLabel}</div>`:d}
                        <div class="value">${this.leftValue}</div>
                    </div>
                    <div class="mid">
                        <span class="arrow">${"→"}</span>
                        ${this.delta?n`<span class="delta ${e}">${e==="up"?"▲":e==="down"?"▼":""} ${this.delta}</span>`:d}
                    </div>
                    <div class="side">
                        ${this.rightLabel?n`<div class="label">${this.rightLabel}</div>`:d}
                        <div class="value">${this.rightValue}</div>
                    </div>
                </div>
            </div>
        `}};gt.styles=k`
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
    `;sa([h()],gt.prototype,"heading",2);sa([h()],gt.prototype,"leftLabel",2);sa([h()],gt.prototype,"leftValue",2);sa([h()],gt.prototype,"rightLabel",2);sa([h()],gt.prototype,"rightValue",2);sa([h()],gt.prototype,"delta",2);sa([h()],gt.prototype,"trend",2);gt=sa([_("mateu-comparison-card")],gt);const $v=e=>{const t=e.metadata;return n`
        <mateu-comparison-card
                heading="${t.title??d}"
                leftLabel="${t.leftLabel??d}"
                leftValue="${t.leftValue??d}"
                rightLabel="${t.rightLabel??d}"
                rightValue="${t.rightValue??d}"
                delta="${t.delta??d}"
                trend="${t.trend??d}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-comparison-card>
    `},Mi=k`
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
`,wv=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}),Is=e=>Number.isFinite(e)?wv.format(e):"",ki=(e,t)=>{const a=e<0?"-":"",r=Is(Math.abs(e));return t?`${a}${t} ${r}`:`${a}${r}`},xv=(e,t)=>t?`${Is(e)} ${t}`:Is(e);var kv=Object.defineProperty,_v=Object.getOwnPropertyDescriptor,oa=(e,t,a,r)=>{for(var i=r>1?void 0:r?_v(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&kv(t,a,i),i};let bt=class extends I{constructor(){super(...arguments),this.title="",this.badges=[],this.facts=[]}render(){const e=!!(this.metricLabel||this.metricValue||this.metricCaption);return n`
            <div class="card">
                <div class="main">
                    <div class="title-row">
                        <span class="title">${this.title}</span>
                        ${this.badges.map(t=>n`<span class="chip ${t.color??""}">${t.label}</span>`)}
                    </div>
                    ${this.subtitle?n`<span class="subtitle">${this.subtitle}</span>`:d}
                    ${this.facts.length?n`
                        <div class="facts">
                            ${this.facts.map(t=>n`
                                <div class="fact">
                                    <span class="label">${t.label}</span>
                                    <span class="value">${t.value}</span>
                                </div>
                            `)}
                        </div>
                    `:d}
                </div>
                ${e?n`
                    <div class="metric">
                        ${this.metricLabel?n`<span class="label">${this.metricLabel}</span>`:d}
                        ${this.metricValue?n`<span class="value">${this.metricValue}</span>`:d}
                        ${this.metricCaption?n`<span class="caption">${this.metricCaption}</span>`:d}
                    </div>
                `:d}
            </div>
        `}};bt.styles=[Mi,k`
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
    `];oa([h()],bt.prototype,"title",2);oa([h({type:Array})],bt.prototype,"badges",2);oa([h()],bt.prototype,"subtitle",2);oa([h({type:Array})],bt.prototype,"facts",2);oa([h()],bt.prototype,"metricLabel",2);oa([h()],bt.prototype,"metricValue",2);oa([h()],bt.prototype,"metricCaption",2);bt=oa([_("mateu-entity-header")],bt);const Sv=e=>{if(e.__hoistedToPageHeader)return n``;const t=e.metadata;return n`
        <mateu-entity-header
                .title="${t.title??""}"
                .badges="${t.badges??[]}"
                .subtitle="${t.subtitle}"
                .facts="${t.facts??[]}"
                .metricLabel="${t.metricLabel}"
                .metricValue="${t.metricValue}"
                .metricCaption="${t.metricCaption}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-entity-header>
    `};var Cv=Object.defineProperty,Ev=Object.getOwnPropertyDescriptor,na=(e,t,a,r)=>{for(var i=r>1?void 0:r?Ev(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Cv(t,a,i),i};let yt=class extends I{constructor(){super(...arguments),this.value=0,this.max=0}fillColor(){return this.dangerAt!=null&&this.value>=this.dangerAt?"error":this.warnAt!=null&&this.value>=this.warnAt?"warning":this.warnAt!=null||this.dangerAt!=null?"success":"primary"}render(){const e=this.max>0?Math.min(Math.max(this.value/this.max,0),1):0,t=Math.round(e*100);return n`
            <div class="meter">
                ${this.label?n`<span class="label">${this.label}</span>`:d}
                <span class="value">${xv(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};yt.styles=k`
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
    `;na([h()],yt.prototype,"label",2);na([h({type:Number})],yt.prototype,"value",2);na([h({type:Number})],yt.prototype,"max",2);na([h()],yt.prototype,"unit",2);na([h()],yt.prototype,"caption",2);na([h({type:Number})],yt.prototype,"warnAt",2);na([h({type:Number})],yt.prototype,"dangerAt",2);yt=na([_("mateu-meter")],yt);const Iv=e=>{const t=e.metadata;return n`
        <mateu-meter
                .label="${t.label}"
                .value="${t.value??0}"
                .max="${t.max??0}"
                .unit="${t.unit}"
                .caption="${t.caption}"
                .warnAt="${t.warnAt}"
                .dangerAt="${t.dangerAt}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-meter>
    `};var Tv=Object.defineProperty,Av=Object.getOwnPropertyDescriptor,ar=(e,t,a,r)=>{for(var i=r>1?void 0:r?Av(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Tv(t,a,i),i};let Xt=class extends I{constructor(){super(...arguments),this.total=0,this.done=0}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){const e=this.total>0&&this.done>=this.total,t=!e&&!!this.actionLabel&&!!this.actionId;return n`
            <div class="banner ${e?"complete":""}">
                <span class="icon">👥</span>
                ${this.label?n`<span class="label">${this.label}</span>`:d}
                <div class="pills">
                    ${Array.from({length:this.total},(a,r)=>n`
                        <span class="pill ${r+1<=this.done?"filled":""}">${r+1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${t?n`<button @click="${()=>this.runAction()}">${this.actionLabel} →</button>`:d}
            </div>
        `}};Xt.styles=k`
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
    `;ar([h()],Xt.prototype,"label",2);ar([h({type:Number})],Xt.prototype,"total",2);ar([h({type:Number})],Xt.prototype,"done",2);ar([h()],Xt.prototype,"actionLabel",2);ar([h()],Xt.prototype,"actionId",2);Xt=ar([_("mateu-task-progress")],Xt);const Pv=e=>{const t=e.metadata;return n`
        <mateu-task-progress
                .label="${t.label}"
                .total="${t.total??0}"
                .done="${t.done??0}"
                .actionLabel="${t.actionLabel}"
                .actionId="${t.actionId}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-task-progress>
    `};var Ov=Object.defineProperty,Rv=Object.getOwnPropertyDescriptor,Oa=(e,t,a,r)=>{for(var i=r>1?void 0:r?Rv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Ov(t,a,i),i};let Lt=class extends I{constructor(){super(...arguments),this.items=[],this.compact=!1,this.frameless=!1,this.columns=0,this.itemHeadingLevel=3}runAction(e,t){t&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}rowClicked(e){this.rowActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.rowActionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}renderItemAction(e,t,a,r){return!t||!a?d:r?n`
                <button class="icon-action" title="${t}" aria-label="${t}"
                    @click="${i=>{i.stopPropagation(),this.runAction(e,a)}}">
                    ${V(r)}
                </button>`:n`
            <button class="row-action" title="${t}"
                @click="${i=>{i.stopPropagation(),this.runAction(e,a)}}">${t}</button>`}render(){const e=this.columns>1||this.items.some(a=>a.actionId||a.actionId2||a.actionId3||(a.lines?.length??0)>0),t=this.itemHeadingLevel===4?"h4":"h3";return e?n`
                <div class="list stacked ${this.compact?"compact":""} ${this.columns>1?"grid":""}"
                     style="${this.columns>1?`grid-template-columns: repeat(auto-fit, minmax(min(18rem, calc(100% / ${this.columns} - 1.5rem)), 1fr));`:""}">
                    ${this.items.map(a=>n`
                        <div role="button" tabindex="0" class="cell ${(a.lines?.length??0)>0?"with-lines":""} ${this.rowActionId?"clickable":""}"
                             @click="${()=>this.rowClicked(a)}" @keydown="${te(()=>this.rowClicked(a))}">
                            <div class="cell-title-row">
                                ${t==="h4"?n`<h4 class="cell-title">${a.title}</h4>`:n`<h3 class="cell-title">${a.title}</h3>`}
                                ${a.status?n`<span class="chip ${a.statusColor??""}">${a.status}</span>`:d}
                            </div>
                            ${a.description?n`<span class="cell-description">${a.description}</span>`:d}
                            ${(a.lines??[]).map(r=>n`<span class="cell-line">${r}</span>`)}
                            ${a.actionId||a.actionId2||a.actionId3?n`
                                <div class="cell-actions">
                                    ${this.renderItemAction(a,a.actionLabel,a.actionId,a.actionIcon)}
                                    ${this.renderItemAction(a,a.actionLabel2,a.actionId2,a.actionIcon2)}
                                    ${this.renderItemAction(a,a.actionLabel3,a.actionId3,a.actionIcon3)}
                                </div>`:d}
                        </div>
                    `)}
                </div>
            `:n`
            <div class="list ${this.compact?"compact":""} ${this.frameless?"frameless":""}">
                ${this.items.map(a=>n`
                    <div role="button" tabindex="0" class="row ${this.rowActionId?"clickable":""}"
                         @click="${()=>this.rowClicked(a)}" @keydown="${te(()=>this.rowClicked(a))}">
                        ${a.avatar?n`<span class="avatar">${a.avatar}</span>`:a.icon?n`<span class="icon">${a.icon}</span>`:d}
                        <div class="body">
                            <span class="title">${a.title}</span>
                            ${a.description?n`<span class="description">${a.description}</span>`:d}
                        </div>
                        ${a.status?n`<span class="chip ${a.statusColor??""}">${a.status}</span>`:d}
                    </div>
                `)}
            </div>
        `}};Lt.styles=[Mi,le,k`
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
        /* title and description WRAP (a history entry or a payment in a narrow fold read whole —
           «Booking created 1 Oct 08:18 · demo — Res…» hid the part that mattered) */
        .title {
            font-weight: 500; color: var(--lumo-body-text-color, #222);
            white-space: normal; overflow-wrap: anywhere;
        }
        .description {
            font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888);
            white-space: normal; overflow-wrap: anywhere;
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
            white-space: normal; overflow-wrap: anywhere;
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
    `];Oa([h({type:Array})],Lt.prototype,"items",2);Oa([h({type:Boolean})],Lt.prototype,"compact",2);Oa([h({type:Boolean})],Lt.prototype,"frameless",2);Oa([h()],Lt.prototype,"rowActionId",2);Oa([h({type:Number})],Lt.prototype,"columns",2);Oa([h({type:Number})],Lt.prototype,"itemHeadingLevel",2);Lt=Oa([_("mateu-status-list")],Lt);const zv=e=>{const t=e.metadata;return n`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                columns="${t.columns??0}"
                itemHeadingLevel="${t.itemHeadingLevel??3}"
                rowActionId="${M(t.rowActionId??void 0)}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-status-list>
    `};var Lv=Object.defineProperty,Dv=Object.getOwnPropertyDescriptor,$d=(e,t,a,r)=>{for(var i=r>1?void 0:r?Dv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Lv(t,a,i),i};let _i=class extends I{constructor(){super(...arguments),this.items=[]}render(){return n`
            <ul>
                ${this.items.map(e=>n`<li>${e}</li>`)}
            </ul>
        `}};_i.styles=k`
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
    `;$d([h({type:Array})],_i.prototype,"items",2);_i=$d([_("mateu-bulleted-list")],_i);const Mv=e=>{const t=e.metadata;return n`
        <mateu-bulleted-list
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-bulleted-list>
    `},Xo=["a[href]","button","input","select","textarea","[tabindex]","vaadin-button","vaadin-text-field","vaadin-combo-box","vaadin-select","vaadin-checkbox","vaadin-date-picker","ui5-button","oj-c-button"].join(","),Qo=e=>{const t=e;return t.hidden||t.hasAttribute("disabled")||t.getAttribute("aria-hidden")==="true"||t.getAttribute("tabindex")==="-1"?!1:!!(t.offsetParent||t.getClientRects().length)},Nv=e=>{const t=[],a=r=>{r.querySelectorAll("*").forEach(i=>{i.matches(Xo)&&Qo(i)&&t.push(i),i.shadowRoot&&a(i.shadowRoot),i instanceof HTMLSlotElement&&i.assignedElements().forEach(s=>{s.matches(Xo)&&Qo(s)&&t.push(s),a(s)})})};return a(e),t.filter((r,i)=>t.indexOf(r)===i)},co=(e,t={})=>{const a=as();let r=[];const i=()=>{r=Nv(e)},s=o=>{if(o.key!=="Tab")return;if(i(),r.length===0){o.preventDefault(),e.focus();return}const l=r[0],c=r[r.length-1],u=as();o.shiftKey&&(u===l||!u||!Zo(u,e))?(o.preventDefault(),c.focus()):!o.shiftKey&&u===c&&(o.preventDefault(),l.focus())};return e.addEventListener("keydown",s),requestAnimationFrame(()=>{i();const o=t.initialFocus?.()??r[0];o?o.focus():(e.hasAttribute("tabindex")||e.setAttribute("tabindex","-1"),e.focus())}),{refresh:i,release(){e.removeEventListener("keydown",s);const o=as();(!o||o===document.body||Zo(o,e))&&a?.focus?.()}}},as=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},Zo=(e,t)=>{let a=e;for(;a;){if(a===t)return!0;a=a.parentNode??a.host??null}return!1};var Fv=Object.defineProperty,qv=Object.getOwnPropertyDescriptor,Or=(e,t,a,r)=>{for(var i=r>1?void 0:r?qv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Fv(t,a,i),i};const Bv=e=>(e.label??"")+((e.count??0)>0?` (${(e.count??0)>25?"25+":e.count})`:""),Uv=(e,t={})=>{const a=(e.maxPerCategory??0)>0?e.maxPerCategory:10;return(e.categories??[]).map((r,i)=>{let s=(r.actions??[]).map((c,u)=>({a:c,i:u})).sort((c,u)=>+!!u.a.populated-+!!c.a.populated||c.i-u.i).map(({a:c})=>({label:Bv(c),actionId:c.actionId??"",parameters:c.parameters??{},populated:!!c.populated,disabled:!!c.disabled}));t.hideUnpopulated&&(s=s.filter(c=>c.populated));const l=t.showAll?.has(i)?s:s.slice(0,a);return{title:r.title??"",actions:l,hiddenCount:s.length-l.length,index:i}}).filter(r=>r.actions.length>0)},jv=(e,t)=>{const a=String(e??"").toLowerCase().split("+").map(s=>s.trim()).filter(Boolean);if(!a.length)return!1;const r=s=>a.includes(s),i=a.find(s=>!["ctrl","control","alt","shift","meta","cmd"].includes(s));return!i||t.ctrlKey!==(r("ctrl")||r("control"))||t.altKey!==r("alt")||t.shiftKey!==r("shift")||t.metaKey!==(r("meta")||r("cmd"))?!1:t.key?.toLowerCase()===i||t.code==="Key"+i.toUpperCase()||t.code==="Digit"+i||t.code==="Numpad"+i};let wa=class extends I{constructor(){super(...arguments),this.open=!1,this.hideUnpopulated=!1,this.showAll=new Set,this.keydown=e=>{if(this.open&&e.key==="Escape"){e.preventDefault(),this.close();return}!this.open&&this.panel?.shortcut&&this.isConnected&&this.getClientRects().length&&jv(this.panel.shortcut,e)&&(e.preventDefault(),this.show())}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.keydown,!0)}disconnectedCallback(){document.removeEventListener("keydown",this.keydown,!0),this.focusTrap?.release(),this.focusTrap=void 0,super.disconnectedCallback()}show(){this.showAll=new Set,this.open=!0}close(){this.open=!1,this.focusTrap?.release(),this.focusTrap=void 0}updated(){const e=this.renderRoot.querySelector('[role="dialog"]');this.open&&e&&!this.focusTrap?this.focusTrap=co(e):this.open&&this.focusTrap?.refresh()}pick(e){e.disabled||(this.close(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:e.parameters},bubbles:!0,composed:!0})))}render(){const e=this.panel;if(!e)return d;const t=e.label||"I want to…",a=Uv(e,{showAll:this.showAll,hideUnpopulated:this.hideUnpopulated});return n`
            <button class="trigger" type="button" aria-haspopup="dialog" aria-expanded="${this.open?"true":"false"}"
                    title="${e.shortcut?`${t} (${e.shortcut})`:t}"
                    @click="${()=>this.show()}">${t}</button>
            ${this.open?n`
                <div class="backdrop" @click="${()=>this.close()}"></div>
                <div class="dialog" role="dialog" aria-modal="true" aria-label="${t}">
                    <div class="head">
                        <h2>${t}</h2>
                        <button class="close" type="button" aria-label="Close" @click="${()=>this.close()}">✕</button>
                    </div>
                    ${e.hideUnpopulatedToggle?n`
                        <label class="toggle">
                            <input type="checkbox" role="switch" .checked="${this.hideUnpopulated}"
                                   @change="${r=>{this.hideUnpopulated=r.target.checked}}" />
                            Hide unpopulated
                        </label>`:d}
                    <div class="columns">
                        ${a.map(r=>n`
                            <section class="column" aria-label="${r.title}">
                                <h3>${r.title}</h3>
                                ${r.actions.map(i=>n`
                                    <button class="action ${i.populated?"populated":""}" type="button"
                                            ?disabled="${i.disabled}"
                                            @click="${()=>this.pick(i)}">${i.label}</button>`)}
                                ${r.hiddenCount>0?n`
                                    <button class="action more" type="button"
                                            @click="${()=>{this.showAll=new Set([...this.showAll,r.index])}}">Show more (${r.hiddenCount})</button>`:d}
                            </section>`)}
                    </div>
                </div>`:d}
        `}};wa.styles=k`
        :host { display: inline-flex; }
        button { font: inherit; cursor: pointer; }
        button:focus-visible { outline: 2px solid var(--lumo-primary-color, #0b6bcb); outline-offset: 2px; }
        .trigger {
            padding: 0.4rem 0.9rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid var(--lumo-contrast-30pct, rgba(0,0,0,.3)); background: var(--lumo-base-color, #fff);
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .trigger:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 1000; }
        .dialog {
            position: fixed; z-index: 1001; top: 10vh; left: 50%; transform: translateX(-50%);
            width: min(64rem, calc(100vw - 2rem)); max-height: 80vh; overflow: auto; box-sizing: border-box;
            padding: 1.25rem 1.5rem; border-radius: var(--lumo-border-radius-l, 10px);
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            box-shadow: var(--lumo-box-shadow-xl, 0 12px 40px rgba(0,0,0,.25));
        }
        .head { display: flex; align-items: center; justify-content: space-between; }
        h2 { margin: 0; font-size: var(--lumo-font-size-xl, 1.375rem); }
        .close { background: none; border: 0; font-size: 1.1rem; color: inherit; }
        .toggle { display: inline-flex; gap: 0.5rem; align-items: center; margin: 0.75rem 0 0.25rem; font-size: var(--lumo-font-size-s, 0.875rem); }
        .columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 0.5rem 1.5rem; margin-top: 0.75rem; }
        .column { display: flex; flex-direction: column; align-items: flex-start; }
        h3 { margin: 0 0 0.5rem; font-size: var(--lumo-font-size-m, 1rem); }
        .action {
            background: none; border: 0; padding: 0.3rem 0; text-align: start;
            color: var(--lumo-primary-text-color, #0b6bcb);
        }
        .action:hover:not([disabled]) { text-decoration: underline; }
        .action.populated { font-weight: 700; }
        .action[disabled] { color: var(--lumo-disabled-text-color, #999); cursor: default; }
        .action.more { color: var(--lumo-secondary-text-color, #555); }
    `;Or([h({attribute:!1})],wa.prototype,"panel",2);Or([b()],wa.prototype,"open",2);Or([b()],wa.prototype,"hideUnpopulated",2);Or([b()],wa.prototype,"showAll",2);wa=Or([_("mateu-action-panel")],wa);const Hv=e=>n`
    <mateu-action-panel
            .panel="${e.metadata}"
            style="${e.style??d}"
            class="${e.cssClasses??d}"
            slot="${e.slot??d}"
    ></mateu-action-panel>
`;var Wv=Object.defineProperty,Vv=Object.getOwnPropertyDescriptor,Ni=(e,t,a,r)=>{for(var i=r>1?void 0:r?Vv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Wv(t,a,i),i};const Gv=(e,t)=>{const a=[];for(const r of e.sections??[]){const i=!!r.title,s=i&&t.has(r.id);if(i&&a.push({kind:"section",id:r.id,title:r.title,collapsed:s}),!s)for(const o of r.rows??[])a.push({kind:"row",row:o,sectionId:r.id,indented:i})}return a},Kv=e=>new Set((e.sections??[]).filter(t=>t.title&&t.collapsed).map(t=>t.id)),Yv=e=>{const t=e.columns??[];if(!t.some(r=>r.group))return[];const a=[];for(const r of t){const i=r.group??"",s=a[a.length-1];s&&s.label===i?s.span++:a.push({label:i,span:1})}return a},en=new Set(["info","success","warning","danger","neutral"]),tn=(e,t)=>e&&en.has(e)?e:t&&en.has(t)?t:"";let Wa=class extends I{constructor(){super(...arguments),this.collapsed=new Set}willUpdate(e){e.has("grid")&&this.grid&&!this.seenGrid&&(this.collapsed=Kv(this.grid)),e.has("grid")&&(this.seenGrid=this.grid,this.editing=void 0)}toggle(e){const t=new Set(this.collapsed);t.has(e)?t.delete(e):t.add(e),this.collapsed=t}dispatch(e,t,a,r){const i=this.grid?.columns?.[a];this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{_rowId:t,_columnId:i?.id,_value:r}},bubbles:!0,composed:!0}))}commit(e,t,a){if(!this.editing)return;this.editing=void 0;const r=e.cells?.[t]?.value??"";a.value!==r&&this.grid?.editActionId&&this.dispatch(this.grid.editActionId,e.id,t,a.value)}renderCell(e,t){const a=this.grid,r=e.cells?.[t]??{},i=a.columns?.[t],s=tn(r.tone,i?.tone),o=!!(e.editable&&a.editActionId),l=`${e.label??""}, ${i?.label??""}: ${r.value??""}`;if(this.editing&&this.editing.rowId===e.id&&this.editing.columnIndex===t)return n`<td class="cell ${s} editing"><input aria-label="${l}" .value="${r.value??""}"
                @keydown="${u=>{u.key==="Enter"&&this.commit(e,t,u.target),u.key==="Escape"&&(this.editing=void 0)}}"
                @blur="${u=>this.commit(e,t,u.target)}" /></td>`;const c=()=>{this.editing={rowId:e.id,columnIndex:t}};return r.link&&a.cellActionId?n`<td class="cell ${s}"><button class="link" type="button" aria-label="${l}"
                @click="${()=>this.dispatch(a.cellActionId,e.id,t,r.value??"")}">${r.value}</button></td>`:n`<td class="cell ${s} ${o?"editable":""}" tabindex="${o?"0":d}"
            aria-label="${o?l:d}"
            @dblclick="${o?c:d}"
            @keydown="${o?u=>{(u.key==="Enter"||u.key==="F2")&&(u.preventDefault(),c())}:d}">${r.value}</td>`}updated(){this.renderRoot.querySelector("td.editing input")?.focus()}render(){const e=this.grid;if(!e)return d;const t=e.columns??[],a=Yv(e);return n`
            <div class="scroller">
                <table>
                    <thead>
                        ${a.length?n`<tr>
                            <th class="corner" rowspan="2">${e.rowHeaderLabel??""}</th>
                            ${a.map(r=>n`<th class="group" colspan="${r.span}">${r.label}</th>`)}
                        </tr>`:d}
                        <tr>
                            ${a.length?d:n`<th class="corner">${e.rowHeaderLabel??""}</th>`}
                            ${t.map(r=>n`<th class="col ${tn(null,r.tone)}" scope="col">${r.label??r.id}</th>`)}
                        </tr>
                    </thead>
                    <tbody>
                        ${Gv(e,this.collapsed).map(r=>r.kind==="section"?n`<tr class="section"><th scope="rowgroup" class="rowhead">
                                    <button type="button" class="toggle" aria-expanded="${r.collapsed?"false":"true"}"
                                            @click="${()=>this.toggle(r.id)}"><span class="chevron" aria-hidden="true">${r.collapsed?"▸":"▾"}</span>${r.title}</button>
                                </th>${t.map(()=>n`<td class="cell section-cell"></td>`)}</tr>`:n`<tr class="${r.row.emphasis?"emphasis":""}">
                                    <th scope="row" class="rowhead ${r.indented?"indented":""}">${r.row.label}</th>
                                    ${t.map((i,s)=>this.renderCell(r.row,s))}
                                </tr>`)}
                    </tbody>
                </table>
            </div>
        `}};Wa.styles=k`
        :host { display: block; max-width: 100%; }
        .scroller { overflow: auto; max-height: 36rem; border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px); }
        table { border-collapse: separate; border-spacing: 0; font-size: var(--lumo-font-size-s, 0.875rem); color: var(--lumo-body-text-color, #1a1a1a); }
        th, td { padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); white-space: nowrap; background: var(--lumo-base-color, #fff); }
        thead th { position: sticky; top: 0; z-index: 2; font-weight: 600; text-align: end; }
        thead tr:nth-child(2) th { top: 2rem; }
        thead th.group { text-align: start; }
        th.corner, th.rowhead { position: sticky; left: 0; z-index: 1; text-align: start; min-width: 12rem; }
        th.corner { z-index: 3; }
        th.rowhead.indented { padding-inline-start: 1.6rem; font-weight: 500; }
        td.cell { text-align: end; min-width: 4.5rem; }
        tr.emphasis td, tr.emphasis th { font-weight: 700; }
        tr.section th, tr.section td { background: var(--lumo-contrast-5pct, #f5f5f5); }
        .toggle { font: inherit; font-weight: 600; background: none; border: 0; padding: 0; cursor: pointer; color: inherit; display: inline-flex; gap: 0.4rem; }
        .chevron { width: 1em; }
        .link { font: inherit; background: none; border: 0; padding: 0; cursor: pointer; color: var(--lumo-primary-text-color, #0b6bcb); text-decoration: underline; }
        td.editable { cursor: text; box-shadow: inset 0 -2px 0 var(--lumo-contrast-20pct, rgba(0,0,0,.2)); }
        td.editing input { width: 4rem; font: inherit; text-align: end; }
        button:focus-visible, td.editable:focus-visible { outline: 2px solid var(--lumo-primary-color, #0b6bcb); outline-offset: -2px; }
        .info { background-color: rgba(0, 110, 200, 0.08); }
        .success { background-color: rgba(30, 140, 60, 0.10); }
        .warning { background-color: rgba(220, 140, 0, 0.16); }
        .danger { background-color: rgba(200, 40, 30, 0.10); color: #b3261e; }
        .neutral { background-color: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
    `;Ni([h({attribute:!1})],Wa.prototype,"grid",2);Ni([b()],Wa.prototype,"collapsed",2);Ni([b()],Wa.prototype,"editing",2);Wa=Ni([_("mateu-matrix-grid")],Wa);const Jv=e=>n`
    <mateu-matrix-grid
            .grid="${e.metadata}"
            style="${e.style??d}"
            class="${e.cssClasses??d}"
            slot="${e.slot??d}"
    ></mateu-matrix-grid>
`,wd=e=>e?"application/x-mateu-"+String(e).toLowerCase().replace(/[^a-z0-9.+-]/g,"-"):"",Xv=e=>{let t;try{t=JSON.parse(e)}catch{return[]}return(Array.isArray(t)?t:[t]).map(r=>{if(r==null)return null;if(typeof r!="object")return String(r);const i=r,o=(i.data&&typeof i.data=="object"?i.data:i).id??i.key;return o==null?null:String(o)}).filter(r=>r!=null)},Qv=(e,t,a)=>({...e??{},_draggedIds:t,_dragType:a});var Zv=Object.defineProperty,eg=Object.getOwnPropertyDescriptor,Fi=(e,t,a,r)=>{for(var i=r>1?void 0:r?eg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Zv(t,a,i),i};let Va=class extends I{constructor(){super(...arguments),this.ready=!1,this.over=!1,this.onDocumentDragStart=e=>{setTimeout(()=>{this.ready=this.accepts(e)})},this.onDocumentDragEnd=()=>{this.ready=!1,this.over=!1}}get mime(){return wd(this.zone?.accept)}accepts(e){const t=e.dataTransfer?Array.from(e.dataTransfer.types):[];return!!this.mime&&t.includes(this.mime)}connectedCallback(){super.connectedCallback(),document.addEventListener("dragstart",this.onDocumentDragStart,!0),document.addEventListener("dragend",this.onDocumentDragEnd,!0)}disconnectedCallback(){document.removeEventListener("dragstart",this.onDocumentDragStart,!0),document.removeEventListener("dragend",this.onDocumentDragEnd,!0),super.disconnectedCallback()}onDragOver(e){this.accepts(e)&&(e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="move"),this.over=!0)}onDrop(e){if(!this.accepts(e))return;e.preventDefault(),this.over=!1,this.ready=!1;const t=Xv(e.dataTransfer?.getData(this.mime)??"");!t.length||!this.zone?.actionId||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.zone.actionId,parameters:Qv(this.zone.parameters,t,this.zone.accept??"")},bubbles:!0,composed:!0}))}render(){const e=this.zone;return e?n`
            <div class="zone ${this.ready?"ready":""} ${this.over?"over":""}" role="group"
                 aria-label="${(e.title??"")+(e.subtitle?", "+e.subtitle:"")} — drop target"
                 @dragover="${this.onDragOver}" @dragleave="${()=>{this.over=!1}}" @drop="${this.onDrop}">
                ${e.title?n`<div class="title">${e.title}</div>`:d}
                ${e.subtitle?n`<div class="subtitle">${e.subtitle}</div>`:d}
                <slot></slot>
                ${this.ready?n`<div class="hint">Drop here</div>`:d}
            </div>`:d}};Va.styles=k`
        :host { display: block; }
        .zone {
            padding: var(--lumo-space-m, 1rem); border-radius: var(--lumo-border-radius-l, 10px);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); background: var(--lumo-base-color, #fff);
            transition: border-color .15s, background-color .15s; height: 100%; box-sizing: border-box;
        }
        .zone.ready { border: 2px dashed var(--lumo-primary-color, #1a73e8); }
        .zone.over { background: var(--lumo-primary-color-10pct, rgba(26,115,232,.1)); }
        .title { font-weight: 600; }
        .subtitle { font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666); margin-bottom: .25rem; }
        .hint { margin-top: .5rem; font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-primary-text-color, #1a73e8); }
    `;Fi([h({attribute:!1})],Va.prototype,"zone",2);Fi([b()],Va.prototype,"ready",2);Fi([b()],Va.prototype,"over",2);Va=Fi([_("mateu-drop-zone")],Va);const tg=(e,t,a,r,i,s,o)=>n`
    <mateu-drop-zone
            .zone="${t.metadata}"
            style="${t.style??d}"
            class="${t.cssClasses??d}"
            slot="${t.slot??d}"
    >${(t.children??[]).map(l=>x(e,l,a,r,i,s,o))}</mateu-drop-zone>
`,ag=e=>{const a=e.metadata.attributes?.["data-colspan"];return n`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??""}"
            class="${e.cssClasses??d}"
            id="${M(e.id??void 0)}"
            data-colspan="${M(a)}"
            slot="${e.slot??d}"/>
    `},rg=new Map,ig=e=>rg.get(e),sg=(e,t)=>t!=null&&e!=null&&!e.has(t),og=typeof HTMLElement<"u"?HTMLElement:class{};class ng extends og{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",a=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",ng);const an=new Set,xd=(e,t,a)=>{const r=`${a}/${t}`;return an.has(r)||(an.add(r),console.warn(`[mateu] Component type "${t}" is not supported by the "${a}" renderer — rendering <mateu-unsupported> placeholder.`)),n`<mateu-unsupported
            type="${t}"
            renderer="${a}"
            data-component-id="${e?.id??d}"
            slot="${e?.slot??d}"
    ></mateu-unsupported>`},lg=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=t.children?.map(p=>x(e,p,a,r,i,s,o,!1))??[],u=ig(l.name);return u?u(l.props??{},c):xd(t,`${v.CustomComponent}:${l.name}`,"custom-component-registry")};var dg=Object.defineProperty,cg=Object.getOwnPropertyDescriptor,je=(e,t,a,r)=>{for(var i=r>1?void 0:r?cg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&dg(t,a,i),i};const ug={info:"ℹ",success:"✓",warning:"!",danger:"!"};let ke=class extends I{constructor(){super(...arguments),this.text="",this.theme="info",this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=!!this.text&&!!this.text.trim();if(!e&&!this.hasContent)return n``;const t=["info","success","warning","danger"].includes(this.theme)?this.theme:"info";return n`
            <div class="notice ${t} ${this.slim?"slim":""}">
                ${this.noIcon?d:n`<span class="icon ${this.icon?"custom":""}">${this.icon||ug[t]}</span>`}
                <div class="body ${this.inlineContent?"inline":""}">
                    ${e?n`<span class="text">${this.text}</span>`:d}
                    ${this.hasContent?n`<div class="content"><slot></slot></div>`:d}
                </div>
                ${this.actionLabel&&this.actionId?n`<button class="notice-action" @click="${()=>this.runAction()}">${this.actionLabel}</button>`:this.status?n`<span class="status">${this.status}</span>`:d}
            </div>
        `}};ke.styles=k`
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
    `;je([h()],ke.prototype,"text",2);je([h()],ke.prototype,"theme",2);je([h()],ke.prototype,"icon",2);je([h({type:Boolean})],ke.prototype,"noIcon",2);je([h()],ke.prototype,"actionLabel",2);je([h()],ke.prototype,"actionId",2);je([h()],ke.prototype,"status",2);je([h({type:Boolean})],ke.prototype,"slim",2);je([h({type:Boolean})],ke.prototype,"fullWidth",2);je([h({type:Boolean})],ke.prototype,"hasContent",2);je([h({type:Boolean})],ke.prototype,"inlineContent",2);ke=je([_("mateu-notice")],ke);const hg=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=gr(l.text??"",r,i,s,o)??"",u=t.children??[];return n`
        <mateu-notice
                text="${c}"
                theme="${l.theme??"info"}"
                icon="${M(l.icon??void 0)}"
                ?noIcon="${l.noIcon??!1}"
                actionLabel="${M(l.actionLabel??void 0)}"
                actionId="${M(l.actionId??void 0)}"
                status="${M(l.status??void 0)}"
                ?slim="${l.slim??!1}"
                ?fullWidth="${l.fullWidth??!1}"
                ?inlineContent="${l.inlineContent??!1}"
                ?hasContent="${u.length>0}"
                data-colspan="${l.fullWidth?"99":d}"
                style="${t.style??d}"
                class="${t.cssClasses??d}"
                slot="${t.slot??d}"
        >${u.map(p=>x(e,p,a,r,i,s,o))}</mateu-notice>
    `};var pg=Object.defineProperty,mg=Object.getOwnPropertyDescriptor,qi=(e,t,a,r)=>{for(var i=r>1?void 0:r?mg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&pg(t,a,i),i};let Ga=class extends I{constructor(){super(...arguments),this.groups=[]}willUpdate(e){e.has("groups")&&(this.selectedId=this.groups.flatMap(t=>t.items??[]).find(t=>t.selected)?.id)}itemAction(e,t,a){e.stopPropagation(),t&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{_item:a}},bubbles:!0,composed:!0}))}select(e){this.selectedId=e,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e}},bubbles:!0,composed:!0}))}render(){return n`
            <div class="rail">
                ${this.groups.map(e=>n`
                    <div class="group" role="listbox">
                        ${e.label?n`<span class="group-label">${e.label}</span>`:d}
                        ${(e.items??[]).map(t=>n`
                            <div role="option" tabindex="0" aria-selected="${t.id===this.selectedId}" class="card ${t.id===this.selectedId?"selected":""}"
                                 @click="${()=>this.select(t.id)}" @keydown="${te(()=>this.select(t.id))}">
                                <span class="title">${t.title}</span>
                                <div class="meta">
                                    ${t.caption?n`<span class="caption">${t.caption}</span>`:d}
                                    ${(t.badges??[]).map(a=>n`<span class="chip ${a.color??""}">${a.label}</span>`)}
                                </div>
                                ${t.actionLabel&&t.actionId?n`
                                    <button class="item-action"
                                            @click="${a=>this.itemAction(a,t.actionId,t.id)}">${t.actionLabel}</button>
                                `:d}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};Ga.styles=[Mi,le,k`
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
    `];qi([h()],Ga.prototype,"actionId",2);qi([h({type:Array})],Ga.prototype,"groups",2);qi([b()],Ga.prototype,"selectedId",2);Ga=qi([_("mateu-task-queue")],Ga);const fg=e=>{const t=e.metadata;return n`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-task-queue>
    `};var vg=Object.defineProperty,gg=Object.getOwnPropertyDescriptor,rr=(e,t,a,r)=>{for(var i=r>1?void 0:r?gg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&vg(t,a,i),i};let Qt=class extends I{constructor(){super(...arguments),this.columns=0,this.items=[]}willUpdate(e){e.has("items")&&(this.selectedId=this.items.find(t=>t.selected)?.id)}select(e){e.disabled||(this.selectedId=e.id,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0})))}render(){const e=this.columns>0?`grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`:"grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));";return n`
            <div class="grid" style="${e}">
                ${this.items.map(t=>n`
                    <div role="button" tabindex="0" class="cell ${t.disabled?"disabled":""} ${t.recommended?"recommended":""} ${t.id===this.selectedId?"selected":""}"
                         @click="${()=>this.select(t)}" @keydown="${te(()=>this.select(t))}">
                        ${t.recommended?n`<span class="tag">${this.recommendedLabel||"Recommended"}</span>`:d}
                        <span class="title">${t.title}</span>
                        ${t.subtitle?n`<span class="subtitle">${t.subtitle}</span>`:d}
                        ${t.statusLabel?n`<span class="chip ${t.statusColor??""}">${t.statusLabel}</span>`:d}
                        ${t.note?n`<span class="note ${t.noteColor??""}"><span class="dot"></span>${t.note}</span>`:d}
                    </div>
                `)}
            </div>
        `}};Qt.styles=[Mi,le,k`
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
    `];rr([h()],Qt.prototype,"actionId",2);rr([h({type:Number})],Qt.prototype,"columns",2);rr([h()],Qt.prototype,"recommendedLabel",2);rr([h({type:Array})],Qt.prototype,"items",2);rr([b()],Qt.prototype,"selectedId",2);Qt=rr([_("mateu-resource-grid")],Qt);const bg=e=>{const t=e.metadata;return n`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-resource-grid>
    `};var yg=Object.defineProperty,$g=Object.getOwnPropertyDescriptor,Le=(e,t,a,r)=>{for(var i=r>1?void 0:r?$g(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&yg(t,a,i),i};let be=class extends I{constructor(){super(...arguments),this.title="",this.features=[],this.current=!1,this.added=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return n`
            <div class="card ${this.current?"":"offer"}">
                ${this.image?n`<img class="image" src="${this.image}" alt="${this.title}">`:d}
                ${this.tag&&this.image?n`<span class="tag">${this.tag}</span>`:d}
                <div class="body">
                    ${this.tag&&!this.image?n`<span class="tag static">${this.tag}</span>`:d}
                    <span class="title">${this.title}</span>
                    ${this.subtitle?n`<span class="subtitle">${this.subtitle}</span>`:d}
                    ${this.features.length?n`
                        <div class="features">
                            ${this.features.map(e=>n`<span class="feature">${e}</span>`)}
                        </div>
                    `:d}
                </div>
                <div class="footer">
                    ${this.current?this.currentLabel?n`<span class="current-label">${this.currentLabel}</span>`:d:this.actionLabel&&this.actionId?n`
                            <button class="${this.added?"added":""}" @click="${()=>this.runAction()}">
                                <span>${this.added?this.addedLabel||this.actionLabel:this.actionLabel}</span>
                                ${this.priceLabel?n`<span class="price">${this.priceLabel}</span>`:d}
                            </button>
                        `:d}
                </div>
            </div>
        `}};be.styles=k`
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
    `;Le([h()],be.prototype,"tag",2);Le([h()],be.prototype,"title",2);Le([h()],be.prototype,"subtitle",2);Le([h()],be.prototype,"image",2);Le([h({type:Array})],be.prototype,"features",2);Le([h()],be.prototype,"priceLabel",2);Le([h()],be.prototype,"actionLabel",2);Le([h()],be.prototype,"actionId",2);Le([h({type:Boolean})],be.prototype,"current",2);Le([h()],be.prototype,"currentLabel",2);Le([h({type:Boolean})],be.prototype,"added",2);Le([h()],be.prototype,"addedLabel",2);be=Le([_("mateu-offer-card")],be);const wg=e=>{const t=e.metadata;return n`
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
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-offer-card>
    `};var xg=Object.defineProperty,kg=Object.getOwnPropertyDescriptor,ir=(e,t,a,r)=>{for(var i=r>1?void 0:r?kg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&xg(t,a,i),i};let Zt=class extends I{constructor(){super(...arguments),this.items=[],this.added=new Set}willUpdate(e){e.has("items")&&(this.added=new Set(this.items.filter(t=>t.added).map(t=>t.id)))}total(){return this.items.filter(e=>e.id!=null&&this.added.has(e.id)).reduce((e,t)=>e+(t.price??0),0)}toggle(e){if(e.id==null)return;const t=new Set(this.added),a=!t.has(e.id);a?t.add(e.id):t.delete(e.id),this.added=t,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id,_added:a,_total:this.total()}},bubbles:!0,composed:!0}))}render(){return n`
            <div class="header">
                ${this.totalLabel?n`<span class="total-label">${this.totalLabel}:</span>`:d}
                <span class="total">${ki(this.total(),this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(e=>{const t=e.id!=null&&this.added.has(e.id);return n`
                        <div class="card ${t?"added":""}">
                            ${e.icon?n`<span class="icon">${e.icon}</span>`:d}
                            <span class="title">${e.title}</span>
                            ${e.description?n`<span class="description">${e.description}</span>`:d}
                            ${e.includedLabel?n`<span class="included">${e.includedLabel}</span>`:n`
                                    ${e.price!=null?n`
                                        <span class="price">${ki(e.price,this.currency)}${e.unit?` / ${e.unit}`:""}</span>
                                    `:d}
                                    <button class="toggle ${t?"on":""}" @click="${()=>this.toggle(e)}"
                                            aria-pressed="${t}">${t?"✓":"+"}</button>
                                `}
                        </div>
                    `})}
            </div>
        `}};Zt.styles=k`
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
    `;ir([h()],Zt.prototype,"totalLabel",2);ir([h()],Zt.prototype,"currency",2);ir([h()],Zt.prototype,"actionId",2);ir([h({type:Array})],Zt.prototype,"items",2);ir([b()],Zt.prototype,"added",2);Zt=ir([_("mateu-addon-picker")],Zt);const _g=e=>{const t=e.metadata;return n`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-addon-picker>
    `};var Sg=Object.defineProperty,Cg=Object.getOwnPropertyDescriptor,Rr=(e,t,a,r)=>{for(var i=r>1?void 0:r?Cg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Sg(t,a,i),i};let xa=class extends I{constructor(){super(...arguments),this.lines=[]}computedTotal(){return this.total!=null?this.total:this.lines.filter(e=>!e.included).reduce((e,t)=>e+(t.amount??0),0)}render(){return n`
            ${this.lines.map(e=>n`
                <div class="row">
                    <span class="dot"></span>
                    <span class="concept">${e.concept}</span>
                    ${e.included?n`<span class="included-label">${e.includedLabel||"Included"}</span>`:n`<span class="amount ${(e.amount??0)<0?"negative":""}">${ki(e.amount??0,this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel||"Total"}</span>
                <span class="total">${ki(this.computedTotal(),this.currency)}</span>
            </div>
        `}};xa.styles=k`
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
    `;Rr([h()],xa.prototype,"currency",2);Rr([h()],xa.prototype,"totalLabel",2);Rr([h({type:Array})],xa.prototype,"lines",2);Rr([h({type:Number})],xa.prototype,"total",2);xa=Rr([_("mateu-ledger")],xa);const Eg=e=>{const t=e.metadata;return n`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-ledger>
    `};var Ig=Object.defineProperty,Tg=Object.getOwnPropertyDescriptor,qt=(e,t,a,r)=>{for(var i=r>1?void 0:r?Tg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Ig(t,a,i),i};let et=class extends I{constructor(){super(...arguments),this.methods=[]}willUpdate(e){e.has("selected")&&(this.selectedId=this.selected)}confirm(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_method:this.selectedId}},bubbles:!0,composed:!0}))}pick(e){this.selectedId=e,this.methodActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.methodActionId,parameters:{_method:e}},bubbles:!0,composed:!0}))}render(){return n`
            <div class="bar">
                <div class="methods">
                    ${this.methods.map(e=>n`
                        <button class="method ${e.id===this.selectedId?"selected":""}"
                                @click="${()=>this.pick(e.id)}">${e.label}</button>
                    `)}
                </div>
                ${this.contextLabel||this.contextValue?n`
                    <div class="context">
                        ${this.contextLabel?n`<span class="label">${this.contextLabel}</span>`:d}
                        ${this.contextValue?n`<span class="value">${this.contextValue}</span>`:d}
                    </div>
                `:d}
                <span class="spacer"></span>
                ${this.confirmLabel&&this.actionId?n`<button class="confirm" @click="${()=>this.confirm()}">${this.confirmLabel}</button>`:d}
            </div>
        `}};et.styles=k`
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
    `;qt([h()],et.prototype,"actionId",2);qt([h()],et.prototype,"methodActionId",2);qt([h({type:Array})],et.prototype,"methods",2);qt([h()],et.prototype,"selected",2);qt([h()],et.prototype,"contextLabel",2);qt([h()],et.prototype,"contextValue",2);qt([h()],et.prototype,"confirmLabel",2);qt([b()],et.prototype,"selectedId",2);et=qt([_("mateu-payment-picker")],et);const Ag=e=>{const t=e.metadata;return n`
        <mateu-payment-picker
                .actionId="${t.actionId}"
                .methodActionId="${t.methodActionId}"
                .methods="${t.methods??[]}"
                .selected="${t.selected}"
                .contextLabel="${t.contextLabel}"
                .contextValue="${t.contextValue}"
                .confirmLabel="${t.confirmLabel}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-payment-picker>
    `};var Pg=Object.defineProperty,Og=Object.getOwnPropertyDescriptor,kd=(e,t,a,r)=>{for(var i=r>1?void 0:r?Og(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Pg(t,a,i),i};let Si=class extends I{constructor(){super(...arguments),this.items=[]}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return n`
            <div class="list">
                ${this.items.map(e=>n`
                    <div class="row">
                        <span class="dot ${e.status??"ok"}"></span>
                        <div class="body">
                            <span class="name">${e.name}</span>
                            ${e.systems?.length?n`<span class="systems">${e.systems.join(" · ")}</span>`:d}
                        </div>
                        <div class="counters">
                            <span class="counter ok">✓ ${e.ok??0} OK</span>
                            ${(e.warnings??0)>0?n`<span class="counter warning">⚠ ${e.warnings} warnings</span>`:d}
                            ${(e.errors??0)>0?n`<span class="counter error">⛔ ${e.errors} errors</span>`:d}
                        </div>
                        ${e.actionLabel&&e.actionId?n`<button @click="${()=>this.runAction(e)}">${e.actionLabel}</button>`:d}
                    </div>
                `)}
            </div>
        `}};Si.styles=k`
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
    `;kd([h({type:Array})],Si.prototype,"items",2);Si=kd([_("mateu-process-monitor")],Si);const Rg=e=>{const t=e.metadata;return n`
        <mateu-process-monitor
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-process-monitor>
    `},zg=me`<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line></svg>`,Lg=()=>J.get()?.renderIcon?V("vaadin:search","width: 100%; height: 100%;"):n`${zg}`,Dg=(e,t)=>{e.ctrlKey||e.metaKey||e.shiftKey||(e.preventDefault(),mt(e.currentTarget,t))},Mg=e=>{const t=e.metadata??{},a=t.title||Pe("notFound"),r=t.message||Pe("notFoundMessage"),i=t.backRoute;return n`
        <section class="mateu-not-found ${e.cssClasses??""}"
                 slot="${e.slot??d}"
                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
                        gap: var(--lumo-space-s, .5rem); min-height: 50vh; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-m, 1rem);
                        color: var(--lumo-secondary-text-color, #5f6b7a); ${e.style??""}">
            <span class="mateu-not-found-icon" aria-hidden="true"
                  style="display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
                         width: 4.5rem; height: 4.5rem; padding: 1.1rem; margin-bottom: var(--lumo-space-s, .5rem); border-radius: 50%;
                         color: var(--lumo-primary-text-color, #1676f3); background: var(--lumo-primary-color-10pct, rgba(22, 118, 243, .1));">
                ${Lg()}
            </span>
            <h2 class="mateu-not-found-title"
                style="margin: 0; font-size: var(--lumo-font-size-xl, 1.375rem); font-weight: 600; line-height: var(--lumo-line-height-s, 1.375);
                       color: var(--lumo-header-text-color, var(--lumo-body-text-color, #1a2533)); overflow-wrap: anywhere;">${a}</h2>
            <p class="mateu-not-found-message" style="margin: 0; max-width: 32rem; font-size: var(--lumo-font-size-m, 1rem);">${r}</p>
            ${i?n`
                <a class="mateu-not-found-back" href="${i}" @click="${s=>Dg(s,i)}"
                   style="margin-top: var(--lumo-space-m, 1rem); font-weight: 500; text-decoration: none;
                          color: var(--lumo-primary-text-color, #1676f3);">← ${t.backLabel||Pe("goBack")}</a>
            `:d}
        </section>
    `},_d=(e,t)=>{let a=e.style;return e.id&&(a&&!a.endsWith(";")&&(a+=";"),a==null&&(a=""),t[e.id+".hidden"]==!0&&(a+="display: none;")),a},Ng=(e,t)=>{let a={...e.metadata};if(e.id&&a){if(a.type==v.Button){const r=a;t[e.id+".disabled"]==!0&&(r.disabled=!0)}if(a.type==v.FormField){const r=a;t[e.id+".disabled"]==!0&&(r.disabled=!0)}}return a},q=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),Fg={[v.Bpmn]:({component:e})=>Lm(e),[v.Workflow]:({component:e})=>Mm(e),[v.FormEditor]:({component:e})=>Nm(e),[v.Page]:q(Ss),[v.Div]:q(pm),[v.Directory]:({component:e,baseUrl:t,state:a,data:r})=>hm(e),[v.FormLayout]:q(lp),[v.HorizontalLayout]:q(hp),[v.VerticalLayout]:q(pp),[v.SplitLayout]:q(mp),[v.MasterDetailLayout]:q(fp),[v.TabLayout]:q(vp),[v.AccordionLayout]:q(gp),[v.BoardLayout]:q(xp),[v.BoardLayoutRow]:q(kp),[v.BoardLayoutItem]:q(_p),[v.Scroller]:q(yp),[v.FullWidth]:q($p),[v.Container]:q(wp),[v.Form]:({container:e,component:t,baseUrl:a,state:r,data:i,appState:s,appData:o})=>{const l=t.metadata;return n`<mateu-form
            id="${t.id}"
        baseUrl="${a}"
            .component="${t}"
            .values="${r}"
            .state="${r}"
            .data="${i}"
            .appState="${s}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            >
                ${t.children?.map(c=>x(e,c,a,r,i,s,o))}
            ${l?.buttons?.map(c=>n`
               ${x(e,{id:c.actionId,metadata:c,type:re.ClientSide,slot:"buttons"},void 0,r,i,s,o)}
`)}

            </mateu-form>`},[v.Table]:({component:e,state:t,data:a})=>xs(e,(e.id?a?.[e.id]:void 0)?.page?.content??qo(e,t)),[v.Crud]:q(Cs),[v.App]:({container:e,component:t,baseUrl:a,state:r,data:i,appState:s,appData:o})=>n`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${a}"
                        .component="${t}"
                        .state="${r}"
                        .data="${i}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${s}"
                        .appData="${o}"
            >
             ${t.children?.map(l=>x(e,l,a,r,i,s,o))}
         </mateu-app>`,[v.Element]:({container:e,component:t,state:a,data:r,appState:i,appData:s})=>Fp(e,t.metadata,t,a,r,i,s),[v.FormField]:({component:e,state:t})=>gm(e,t),[v.Text]:({component:e,state:t,data:a,appState:r,appData:i})=>qp(e,t,a,r,i),[v.Avatar]:({component:e,state:t,data:a})=>nh(e,t,a),[v.Chat]:({component:e,state:t,data:a})=>Dm(e),[v.AvatarGroup]:({component:e})=>lh(e),[v.Badge]:({component:e,state:t,data:a})=>dh(e,t,a),[v.Breadcrumbs]:({component:e})=>cm(e),[v.Anchor]:({component:e})=>Bp(e),[v.Button]:({component:e,state:t,data:a})=>Wp(e,t,a),[v.Card]:q(Gp),[v.Chart]:({component:e})=>Kp(e),[v.Icon]:({component:e})=>Yp(e),[v.ConfirmDialog]:q(Xp),[v.ContextMenu]:q(Op),[v.CookieConsent]:({component:e})=>Qp(e),[v.Details]:q(Zp),[v.Dialog]:({component:e,baseUrl:t,state:a,data:r,appState:i,appData:s})=>em(e,t,a,r,i,s),[v.Drawer]:({component:e,baseUrl:t,state:a,data:r,appState:i,appData:s})=>tm(e,t,a,r,i,s),[v.Image]:({component:e})=>dm(e),[v.Map]:({component:e})=>lm(e),[v.Markdown]:({component:e})=>im(e),[v.MicroFrontend]:({component:e})=>rm(e),[v.Notification]:({component:e})=>sm(e),[v.ProgressBar]:({component:e,state:t})=>om(e,t),[v.Popover]:q(nm),[v.CarouselLayout]:q(um),[v.Tooltip]:q(Lp),[v.MessageInput]:({component:e})=>zp(e),[v.MessageList]:({component:e})=>Ap(e),[v.CustomField]:q(Rp),[v.MenuBar]:({container:e,component:t,baseUrl:a,state:r,data:i})=>Pp(e,t,a,r,i),[v.Grid]:({component:e,state:t})=>xs(e,qo(e,t)),[v.VirtualList]:q(Sp),[v.FormSection]:q(mm),[v.FormSubSection]:q(fm),[v.MetricCard]:({component:e})=>Um(e),[v.Scoreboard]:q(jm),[v.DashboardPanel]:q(Hm),[v.DashboardLayout]:q(Wm),[v.ResponsiveGrid]:q(af),[v.FoldoutLayout]:q(Km),[v.ContentLayout]:q(rf),[v.HeroSection]:q(nf),[v.EmptyState]:({component:e})=>Rh(e),[v.Skeleton]:({component:e})=>zh(e),[v.Gantt]:({component:e})=>cf(e),[v.PlanningBoard]:({component:e})=>mf(e),[v.Kanban]:({component:e})=>gf(e),[v.Timeline]:({component:e})=>$f(e),[v.ProgressSteps]:({component:e})=>kf(e),[v.Stat]:({component:e})=>Cf(e),[v.Calendar]:({component:e})=>Rf(e),[v.PricingTable]:({component:e})=>Df(e),[v.OrgChart]:({component:e})=>Ff(e),[v.Heatmap]:({component:e})=>jf(e),[v.Funnel]:({component:e})=>Vf(e),[v.TrendChart]:({component:e})=>Yf(e),[v.FeatureGrid]:({component:e})=>Qf(e),[v.Testimonials]:({component:e})=>tv(e),[v.Faq]:({component:e})=>iv(e),[v.CalloutCard]:({component:e})=>nv(e),[v.CommentThread]:({component:e})=>cv(e),[v.FileList]:({component:e})=>mv(e),[v.Checklist]:({component:e})=>gv(e),[v.ComparisonCard]:({component:e})=>$v(e),[v.EntityHeader]:({component:e})=>Sv(e),[v.Meter]:({component:e})=>Iv(e),[v.TaskProgress]:({component:e})=>Pv(e),[v.StatusList]:({component:e})=>zv(e),[v.BulletedList]:({component:e})=>Mv(e),[v.ActionPanel]:({component:e})=>Hv(e),[v.MatrixGrid]:({component:e})=>Jv(e),[v.DropZone]:q(tg),[v.Separator]:({component:e})=>ag(e),[v.CustomComponent]:q(lg),[v.Notice]:q(hg),[v.TaskQueue]:({component:e})=>fg(e),[v.ResourceGrid]:({component:e})=>bg(e),[v.OfferCard]:({component:e})=>wg(e),[v.AddOnPicker]:({component:e})=>_g(e),[v.Ledger]:({component:e})=>Eg(e),[v.PaymentPicker]:({component:e})=>Ag(e),[v.ProcessMonitor]:({component:e})=>Rg(e),[v.NotFound]:({component:e})=>Mg(e)},uo=(e,t,a,r,i,s,o,l)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),n`<p>No metadata for component</p>`):uo(e,{id:Ne(),metadata:t,type:re.ClientSide},a,r,i,s,o,l);const c=t.metadata.type,u={...t,style:_d(t,i),metadata:Ng(t,i)},p=Fg[c];return p?p({container:e,component:u,baseUrl:a,state:r,data:i,appState:s,appData:o,labelAlreadyRendered:l}):n`<p ${u?.slot??d}>Unknown metadata type ${c} for component ${u?.id}</p>`};var Rt=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(Rt||{});const qg=(e,t,a)=>{const r=Sd(e[a.path]);return r?n`<span theme="badge pill ${Bi(r.type)}">${r.message}</span>`:n``},Bg=new Set(["AVAILABLE","ACTIVE","RUNNING","SUCCEEDED","SUCCESS","OK","ENABLED","READY","HEALTHY","COMPLETED","DONE","ATTACHED","UP"]),Ug=new Set(["PROVISIONING","UPDATING","PENDING","STARTING","STOPPING","IN_PROGRESS","TERMINATING","DELETING","CREATING","MOVING","WAITING","ACCEPTED","WARNING","DEGRADED","RESTORING","SCALING"]),jg=new Set(["FAILED","TERMINATED","ERROR","DELETED","STOPPED","DISABLED","UNHEALTHY","DOWN","CANCELED","CANCELLED","REJECTED","INACTIVE"]),Sd=e=>{if(e==null||e==="")return;if(typeof e=="object")return e;const t=String(e),a=t.trim().toUpperCase().replace(/[\s-]+/g,"_");return{type:Bg.has(a)?Rt.SUCCESS:Ug.has(a)?Rt.WARNING:jg.has(a)?Rt.DANGER:Rt.NONE,message:t}},Bi=e=>{switch(e){case Rt.SUCCESS:return"success";case Rt.WARNING:return"warning";case Rt.DANGER:return"error";case Rt.NONE:return"contrast"}return""};var Hg=Object.defineProperty,Wg=Object.getOwnPropertyDescriptor,He=(e,t,a,r)=>{for(var i=r>1?void 0:r?Wg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Hg(t,a,i),i};let _e=class extends I{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.respondToVisibility=(e,t)=>{var a={root:document.documentElement},r=new IntersectionObserver(i=>{i.forEach(s=>{t(s.intersectionRatio>0)})},a);r.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?uo(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?n`<div class="neutral-card">
                ${e.image?n`<img class="card-media" src="${e.image}" alt="" />`:d}
                <div class="card-body">
                    <div class="card-head">
                        ${e.title?n`<span class="card-title">${e.title}</span>`:d}
                        ${e.status?n`<span theme="badge ${Bi(e.status.type)}">${e.status.message}</span>`:d}
                    </div>
                    ${e.subtitle?n`<div class="card-subtitle">${e.subtitle}</div>`:d}
                    ${e.content?n`<div>${e.content}</div>`:d}
                </div>
        </div>`:n`${e}`,this.hasMore=!1,this.clickedOnCard=e=>{this.state[this.id+"_selected_items"]=[e],this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0}))}}updated(e){super.updated(e);const t=this.data[this.id]?.page;this.hasMore=t?.content?.length<t?.totalElements}firstUpdated(e){super.firstUpdated(e),this.respondToVisibility(this.askForMore,t=>{this.keepAsking=t,t&&this.askToUpper()})}render(){const e=this.data[this.id]?.page;return n`
            <div class="card-container">
                ${e?.content?.map(t=>n`<div role="button" tabindex="0" @click="${()=>this.clickedOnCard(t)}" @keydown="${te(()=>this.clickedOnCard(t))}" class="car-container">${this.renderItem(t)}</div>`)}
                <div id="ask-for-more" style="display: ${this.hasMore?"flex":"none"}; width: 100%; justify-content: center; padding: var(--lumo-space-m); color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Loading more…</div>
            </div>

            <slot></slot>
       `}};_e.styles=k`
        ${Mt}
        
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
    
        ${le}
    `;He([h()],_e.prototype,"id",2);He([h()],_e.prototype,"metadata",2);He([h()],_e.prototype,"baseUrl",2);He([h()],_e.prototype,"state",2);He([h()],_e.prototype,"data",2);He([h()],_e.prototype,"appState",2);He([h()],_e.prototype,"appData",2);He([h()],_e.prototype,"emptyStateMessage",2);He([b()],_e.prototype,"keepAsking",2);He([fe("#ask-for-more")],_e.prototype,"askForMore",2);He([b()],_e.prototype,"hasMore",2);_e=He([_("mateu-card-list")],_e);const Vg={show:e=>console.debug("[mateu] no notifier registered, dropping toast:",e.text)};let Cd=Vg;function Ed(e){Cd=e}function lt(e,t){Cd.show(e,t)}function Id(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,a)=>(t.priority??Number.MAX_SAFE_INTEGER)-(a.priority??Number.MAX_SAFE_INTEGER))}function Gg(e){const t=Id(e);return t.length>0?t:e.slice(0,3)}const Kg=e=>!!e&&(e.startsWith("search-")||e.startsWith("code-")||e==="__restfetch__"),Td=(e,t)=>e==="search"&&!t,Yg=e=>Object.values(e??{}).some(t=>!!t?.page?.content?.length),Jg=(e,t)=>Td(e.actionId,Yg(t))?!0:e.background;var Xg=Object.defineProperty,Qg=Object.getOwnPropertyDescriptor,Ee=(e,t,a,r)=>{for(var i=r>1?void 0:r?Qg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Xg(t,a,i),i};const Zg={asc:"ascending",desc:"descending"},Wr="padding-inline: var(--mateu-edge-header-gutter, 0px); box-sizing: border-box;",rn="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem); padding: 3px;";let j=class extends I{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this._columnPrefsRevision=0,this._prefsRevisionApplied=-1,this.pendingMeasure=!0,this.corrections=0,this.unsettledRefusals=0,this.windowResizeListener=()=>this.scheduleMeasure(),this.search=()=>{this.beginLoading();const e=this.component.metadata;if(this.state={...this.state,size:this._pageSizeOf(e),page:0,crud_selected_items:[]},this._syncStateToUrl(e),e.rowsSource){this._fetchRowsFromRest(e,void 0);return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},background:this.ownLoadingBackground()},bubbles:!0,composed:!0}))},this._appliedUrl=void 0,this.notify=e=>{lt({text:e,position:"bottomEnd",variant:"error",duration:3e3},this)},this.handleSearchRequested=e=>{const t=this.component.metadata;if(this.state={...this.state,size:this._pageSizeOf(t),crud_selected_items:[]},this._syncStateToUrl(t),t.rowsSource){this._fetchRowsFromRest(t,e);return}!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.beginLoading(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e,background:this.ownLoadingBackground()},bubbles:!0,composed:!0}))},this._fetchRowsFromRest=(e,t)=>{const a=[...new Set([...this.cols.map(o=>o.id).filter(Boolean),...hh(e.rowRoute)])],r=e.rowsSource,i=Vn(r)!=null;(Xa(r)?.proxy?new Promise(o=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"__restfetch__",parameters:{_sourceKind:"rows",_sourceId:this.id},callback:l=>o(Nl(l?.appData?._restfetch,r,a)),callbackonly:!0},bubbles:!0,composed:!0}))}):i?Xh(r,a,o=>G(o,this.state,this.data)):Jh(r,a,o=>G(o,this.state,this.data)).then(o=>({rows:o,total:null}))).then(({rows:o,total:l})=>{const c=this.cols.find(C=>C.identifier)?.id,u=o.map((C,E)=>({...C,_rowNumber:c!=null&&C[c]!=null?String(C[c]):`_row:${E}`})),p=Number(this.state?.page??0),m=i&&l!=null,f=m?u:ip(u,a,e.filters,this.state),g=e.pageSize&&e.pageSize>0?e.pageSize:f.length||1,y=m?f:f.slice(p*g,p*g+g),w={page:{totalElements:m?l:f.length,pageSize:g,pageNumber:p,content:y}};this._restRows={key:j._initKeyOf(this.component),listing:w},this.data={...this.data,[this.id]:w},this.requestUpdate(),t?.()}).catch(o=>{console.warn("mateu: external rows fetch failed",o),t?.()})},this.fetchMoreElements=e=>{const{params:t,callback:a}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(a)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(a=>({fieldId:a.__data.path,direction:a.__data.direction?Zg[a.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForKey=void 0,this._restRows=void 0,this.evalLabel=e=>G(e,this.state,this.data),this.handleToolbarButtonClick=e=>{const t=e.route?G(e.route,this.state,this.data):void 0;if(t&&!t.includes("${")){mt(this,t);return}if(e.actionId==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{crud_selected_items:this.state.crud_selected_items??[]}},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get columnPrefsScope(){return window.location.pathname}get effectiveComponent(){const e=this.component,t=e?.metadata;if(!e||!t?.columns)return e;if(this._prefsSource===e&&this._prefsRevisionApplied===this._columnPrefsRevision)return this._prefsApplied;const a=Rl(this.columnPrefsScope),r=Ll(t.columns,a,i=>i.metadata??{});return this._prefsApplied=r===t.columns?e:{...e,metadata:{...t,columns:r}},this._prefsSource=e,this._prefsRevisionApplied=this._columnPrefsRevision,this._prefsApplied}get columnChooserEntries(){return(this.component?.metadata?.columns??[]).map(t=>{const a=t.metadata??{},r=a.id??t.id;return r?{id:r,label:a.label??r,protected:zl(a)}:void 0}).filter(t=>!!t)}renderColumnChooser(){const e=this.columnChooserEntries;return e.filter(t=>!t.protected).length===0?d:n`
            <mateu-column-chooser
                .columns="${e}"
                .scope="${this.columnPrefsScope}"
                @column-prefs-changed="${t=>{t.stopPropagation(),this._columnPrefsRevision++}}"
            ></mateu-column-chooser>
        `}get cols(){return this.effectiveComponent?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":"table":t}scheduleMeasure(){this.pendingMeasure=!0,this.corrections=0,this.requestUpdate()}measureFill(){if(!this.pendingMeasure)return;const e=this.renderRoot?.querySelector?.("[data-crud-box]");if(!e)return;if(this.closest?.("mateu-dialog, mateu-drawer")){this.pendingMeasure=!1;return}const t=e.style.height;t&&(e.style.height="");const a=e.getBoundingClientRect().top,r=Math.round(window.innerHeight-a-this.measureBottomInset(e)-j.BOTTOM_GUTTER_PX);t&&(e.style.height=t);const i=this.lastMeasuredTop==null,s=!i&&Math.abs(a-this.lastMeasuredTop)>=2;if(r>=j.MIN_FILL_PX){if(s&&this.retryMeasure(a))return;this.pendingMeasure=!1,this.unsettledRefusals=0,this.lastMeasuredTop=a,this.fillHeightPx=r;return}!(!i&&!s)&&this.retryMeasure(a)||(this.lastMeasuredTop=a,this.pendingMeasure=!1,this.unsettledRefusals=0,this.fillHeightPx=void 0)}retryMeasure(e){return this.unsettledRefusals>=j.MAX_UNSETTLED_REFUSALS?!1:(this.lastMeasuredTop=e,this.unsettledRefusals++,this.requestUpdate(),!0)}trimOverflow(){if(this.fillHeightPx==null||this.pendingMeasure||this.corrections>=j.MAX_CORRECTIONS)return;const e=document.documentElement.scrollHeight-window.innerHeight;e<=1||e>j.MAX_SLIVER_PX||(this.corrections++,this.fillHeightPx=Math.max(j.MIN_FILL_PX,this.fillHeightPx-e))}measureBottomInset(e){let t=e,a=0;const r=e.getBoundingClientRect().bottom;for(let i=0;t&&i<20;i++){a+=parseFloat(getComputedStyle(t).marginBottom)||0;const s=t.getRootNode(),o=t.assignedSlot??t.parentElement??s.host??null;if(!o||o===document.documentElement||o===document.body)break;const l=getComputedStyle(o);a+=(parseFloat(l.paddingBottom)||0)+(parseFloat(l.borderBottomWidth)||0);const c=parseFloat(l.rowGap)||0;for(let u=t.nextElementSibling;u;u=u.nextElementSibling){const p=u.getBoundingClientRect();if(p.top<r-1)continue;const m=getComputedStyle(u);a+=p.height+(parseFloat(m.marginTop)||0)+(parseFloat(m.marginBottom)||0)+c}t=o}return Math.round(a)}boxStyle(){const e="border: var(--mateu-section-border, none); background: var(--mateu-section-bg, transparent); overflow: hidden; padding: var(--mateu-section-padding, 0); display: flex; flex-direction: column;";return this.fillHeightPx!=null?`${e} height: ${this.fillHeightPx}px;`:`${e} max-height: calc(100dvh - 12rem);`}connectedCallback(){super.connectedCallback(),window.addEventListener("resize",this.windowResizeListener),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.loadingTimer),window.removeEventListener("resize",this.windowResizeListener),this.resizeObserver?.disconnect()}get awaitingRows(){return this.loadingSince!=null&&Date.now()-this.loadingSince<j.LOADING_VALVE_MS}beginLoading(){this.loadingSince=Date.now(),clearTimeout(this.loadingTimer),this.loadingTimer=setTimeout(()=>this.requestUpdate(),j.LOADING_VALVE_MS)}endLoading(){this.loadingSince=void 0,clearTimeout(this.loadingTimer)}ownLoadingBackground(){const e=this.data?.[this.id]?.page?.content;return Td("search",!!e?.length)||void 0}_filterIds(e){return new Set(["searchText",pr,...(e.filters??[]).filter(t=>!t.readOnly).flatMap(t=>t.stereotype==="dateRange"||t.stereotype==="numberRange"?[`${t.fieldId}_from`,`${t.fieldId}_to`]:[t.fieldId])])}_syncStateToUrl(e){const t=this._filterIds(e),a=new URLSearchParams(window.location.search);t.forEach(l=>a.delete(l)),a.delete(Ur),a.delete("page"),a.delete("sort"),t.forEach(l=>{const c=this.state[l];c!=null&&c!==""&&a.set(l,String(c))});const r=this.state.page;r&&r>0&&a.set("page",String(r));const i=this.state.sort;if(i&&i.length>0){const l=i.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");l&&a.set("sort",l)}const s=a.toString(),o=s?`${window.location.pathname}?${s}`:window.location.pathname;window.location.pathname+window.location.search!==o&&history.replaceState(null,"",o),this._appliedUrl=window.location.pathname+window.location.search}_urlParams(){const e=new URLSearchParams(window.location.search);return e.has(Ur)&&!e.has(No)&&e.set(No,e.get(Ur)??""),e.delete(Ur),e}_initStateFromUrl(e,t){const a=this._urlParams(),r=this._filterIds(e),i={...t};a.forEach((l,c)=>{r.has(c)&&(i[c]=l)});const s=a.get("page");if(s!==null){const l=parseInt(s,10);!isNaN(l)&&l>0&&(i.page=l)}const o=a.get("sort");if(o){const l=o.split(",").map(c=>{const[u,p]=c.split(":");return u&&p?{fieldId:u,direction:p}:null}).filter(Boolean);l.length>0&&(i.sort=l)}return i}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}_pageSizeOf(e){const t=Number(e?.pageSize);if(t>0)return t;const a=Number(this.state?.size);if(a>0)return a;const r=Number(this.data?.[this.id]?.page?.pageSize);return r>0?r:void 0}static _initKeyOf(e){if(!e)return;const t=e.metadata?.rowsSource;return`${e.id}|${t?t.ref??t.url??"":""}`}willUpdate(e){if(super.willUpdate(e),!e.has("data")||this.data?.[this.id]!=null)return;const t=this._restRows;!t||t.key!==j._initKeyOf(this.component)||(this.data={...this.data,[this.id]:t.listing})}updated(e){if(super.updated(e),e.has("component")?this.scheduleMeasure():(this.measureFill(),this.trimOverflow()),this.data?.[this.id]!=null?this.endLoading():this.loadingSince==null&&this._initializedForKey!=null&&!this.awaitingRows&&this.beginLoading(),e.has("component")){const a=j._initKeyOf(this.component),r=this.component?.metadata,i=globalThis.window?.location,s=i?i.pathname+i.search:void 0,o=!!i&&a===this._initializedForKey&&this._appliedUrl!==void 0&&s!==this._appliedUrl&&i.pathname===this._appliedUrl.split("?")[0];if(o){const l={...this.state};this._filterIds(r).forEach(c=>{delete l[c]}),this.state=l}if(a!==this._initializedForKey||o){this._initializedForKey=a,this._appliedUrl=s;const l=r.initialPage&&r.initialPage>0?r.initialPage:0;this.state=this._initStateFromUrl(r,{...this.state,size:r.pageSize,page:l,sort:[]}),(this.state.page!==l||this.state.sort?.length>0||[...this._filterIds(r)].some(u=>this.state[u]!=null)||r.rowsSource||o)&&this.handleSearchRequested(void 0)}else{const l=this._restoreUrlFiltersIfMissing(r,this.state);l!==this.state&&(this.state=l)}}}_restoreUrlFiltersIfMissing(e,t){const a=this._urlParams(),r=this._filterIds(e);let i=t;return a.forEach((s,o)=>{if(!r.has(o))return;const l=i[o];(l==null||l==="")&&(i===t&&(i={...t}),i[o]=s)}),i}render(){const e=T=>{const U=J.get()?.renderToolbarButton?.(T,this.evalLabel(T.label),()=>this.handleToolbarButtonClick(T));return U||n`
                <button class="crud-btn ${El(T)}"
                        data-action-id="${T.id}"
                        theme="${Ys(T)||d}"
                        @click="${()=>this.handleToolbarButtonClick(T)}"
                >${this.evalLabel(T.label)}</button>
            `};if(!this.component)return n`no component`;const t=this.effectiveComponent,a=t.metadata;a.serverSideOrdering=!0;const i=(()=>{let T=this;for(;T;){const U=T;if(U.tagName==="MATEU-PAGE")return(U.component?.metadata?.toolbar?.length??0)>0;T=U.parentElement??(U.getRootNode?.()instanceof ShadowRoot?U.getRootNode().host:null)}return!1})()?[]:a?.toolbar??[],s=i.filter(T=>li(T.actionId)&&!Ba(T.actionId)),o=i.filter(T=>Ba(T.actionId)),l=i.filter(T=>!li(T.actionId)),c=s.length>0&&l.length>0,u=!!a?.title||!!a?.subtitle||i.length>0,p=this.effectiveGridLayout,m=this.cols,f=Id(m),y=this.data[this.id]?.page?.content??[],$=this.state[this.component?.id]?.emptyStateMessage,w=(T,U)=>{const B=U[T.id];if(B==null)return n``;if(T.dataType==="status"){const D=Sd(B),de=Bi(D.type);return n`<span theme="badge pill ${de}">${D.message}</span>`}return T.dataType==="bool"?n`${B?"✓":"✗"}`:typeof B=="object"?n`${B.label??B.name??B.message??""}`:n`${B}`},C=()=>{const T=this.identifierFieldName,U=this.state._selectedId??this.appState?._splitDetailId,B=f.find(F=>F.identifier)??f[0],D=F=>F.dataType==="action"||F.dataType==="actionGroup"||F.dataType==="menu"||F.stereotype==="button",de=f.filter(F=>F!==B&&!D(F)),Ve=m.filter(F=>D(F)),Et=(F,W,ae)=>{F.stopPropagation(),F.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:W,parameters:{_clickedRow:ae}},bubbles:!0,composed:!0}))},Bt=F=>{const W=[];for(const ae of Ve){const se=F[ae.id];if(ae.dataType==="action"){const Te=se?.methodNameInCrud?se:F.action?.methodNameInCrud?F.action:{methodNameInCrud:ae.id,label:ae.label,icon:null};W.push(n`
                            <button class="crud-btn" theme="tertiary small" title="${Te.label||d}"
                                @click="${It=>Et(It,"action-on-row-"+Te.methodNameInCrud,F)}">
                                ${Te.icon?V(Te.icon):d}
                                ${Te.label??d}
                            </button>`)}else(ae.dataType==="actionGroup"||ae.dataType==="menu")&&(se?.actions??[]).forEach(It=>W.push(n`
                            <button class="crud-btn" theme="tertiary small" title="${It.label||d}"
                                @click="${L=>Et(L,"action-on-row-"+It.methodNameInCrud,F)}">
                                ${It.icon?V(It.icon):d}
                                ${It.label??d}
                            </button>`))}return W.length?n`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${W}
                    </div>`:d};return n`
                <div class="m-listbox" style="width: 100%;">
                    ${y.length===0?n`<div class="m-item" disabled>${ma($)}</div>`:d}
                    ${y.map(F=>n`
                        <div role="button" tabindex="0" class="m-item"
                            ?selected="${T&&U!==void 0&&String(F[T])===String(U)}"
                            @click="${()=>{T&&F[T]!==void 0&&(this.state={...this.state,_selectedId:String(F[T])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:F},bubbles:!0,composed:!0}))}}" @keydown="${te(()=>{T&&F[T]!==void 0&&(this.state={...this.state,_selectedId:String(F[T])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:F},bubbles:!0,composed:!0}))})}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${B?F[B.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${de.map(W=>n`<span>${W.label}: ${w(W,F)}</span>`)}
                            </div>
                            ${Bt(F)}
                        </div>
                    `)}
                </div>`},E=(T,U,B)=>{const D=this.identifierFieldName;D&&B[D]!==void 0&&(this.state={...this.state,_selectedId:String(B[D])}),T.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:U,parameters:B},bubbles:!0,composed:!0}))},A=()=>{const T=this.identifierFieldName,U=this.state._selectedId??this.appState?._splitDetailId,B=L=>!!L.actionId,D=L=>L.dataType==="action"||L.dataType==="actionGroup"||L.dataType==="menu"||L.stereotype==="button",de=Eh(m),Ve=[...de.slice(0,6),...de.slice(6).filter(L=>D(L)||L.dataType==="status")],Et=Ve.filter(L=>L.stereotype==="image"),Bt=Ve.find(L=>L.identifier)??Ve[0],F=Ve.find(L=>L.id==="select"&&L.dataType==="action"),W=!!F,ae=Ve.filter(L=>L!==Bt&&!Et.includes(L)&&!B(L)&&!D(L)),se=Ve.filter(L=>D(L)&&!(W&&L===F)),Te=(L,ge,Ut)=>{L.stopPropagation(),L.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:ge,parameters:{_clickedRow:Ut}},bubbles:!0,composed:!0}))},It=L=>{const ge=[];for(const Ut of se){const Gi=L[Ut.id];if(Ut.dataType==="action"){const La=Gi?.methodNameInCrud?Gi:L.action?.methodNameInCrud?L.action:{methodNameInCrud:Ut.id,label:Ut.label,icon:null};ge.push(n`
                            <button class="crud-btn" theme="tertiary" title="${La.label||d}"
                                @click="${ha=>Te(ha,"action-on-row-"+La.methodNameInCrud,L)}">
                                ${La.icon?V(La.icon):d}
                                ${La.label??d}
                            </button>`)}else(Ut.dataType==="actionGroup"||Ut.dataType==="menu")&&(Gi?.actions??[]).forEach(ha=>ge.push(n`
                            <button class="crud-btn" theme="tertiary" title="${ha.label||d}"
                                @click="${uc=>Te(uc,"action-on-row-"+ha.methodNameInCrud,L)}">
                                ${ha.icon?V(ha.icon):d}
                                ${ha.label??d}
                            </button>`))}return ge.length?n`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${ge}
                    </div>`:d};return n`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${y.length===0?n`<div style="grid-column: 1 / -1;">${ma($)}</div>`:d}
                    ${y.map(L=>n`
                        <div role="button" tabindex="0" class="crud-card"
                            ?data-selected="${T&&U!==void 0&&String(L[T])===String(U)}"
                            style="cursor: pointer;"
                            @click="${ge=>W?Te(ge,"action-on-row-select",L):E(ge.target,"view",L)}" @keydown="${te(ge=>W?Te(ge,"action-on-row-select",L):E(ge.target,"view",L))}"
                        >
                            ${Et.length?n`<img src="${L[Et[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: var(--lumo-border-radius-m, 8px);" />`:d}
                            ${Bt?n`<div class="crud-card-title">${L[Bt.id]??""}</div>`:d}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${ae.map(ge=>n`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${ge.label}</span>
                                        <span>${w(ge,L)}</span>
                                    </div>
                                `)}
                            </div>
                            ${It(L)}
                        </div>
                    `)}
                </div>`},P=()=>{const T=Gg(m),U=T.find(D=>D.identifier)??T[0],B=T.filter(D=>D!==U);return n`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <div class="m-listbox" style="width: 100%;">
                            ${y.length===0?n`<div class="m-item" disabled>${ma($)}</div>`:d}
                            ${y.map(D=>n`
                                <div role="button" tabindex="0" class="m-item"
                                    ?selected="${this.selectedItem===D}"
                                    @click="${()=>{this.selectedItem=D}}" @keydown="${te(()=>{this.selectedItem=D})}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${U?D[U.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${B.map(de=>n`${w(de,D)} `)}
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?n`
                            <div class="m-formlayout">
                                ${m.map(D=>n`
                                    <label style="display: flex; flex-direction: column; gap: .1rem; font-size: var(--lumo-font-size-s, .875rem);">
                                        <span style="color: var(--lumo-secondary-text-color, #667);">${D.label}</span>
                                        <span>${String(this.selectedItem[D.id]??"")}</span>
                                    </label>
                                `)}
                            </div>
                        `:n`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},R=()=>{const T=this.identifierFieldName,U=this.state._selectedId??this.appState?._splitDetailId,B=m[0],D=m.slice(1),de=!!B?.actionId,Ve=W=>(W??[]).map(ae=>{const se=Array.isArray(ae.children)?ae.children:[];return se.length>0?{...ae,children:Ve(se)}:{...ae,children:void 0}}),Et=Ve(y),Bt=(W,ae,se)=>{W.stopPropagation(),T&&ae[T]!==void 0&&(this.state={...this.state,_selectedId:String(ae[T])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:se,parameters:ae},bubbles:!0,composed:!0}))},F=(W,ae)=>n`
                <tr class="${T&&U!==void 0&&String(W[T])===String(U)?"selected":""}"
                    style="cursor: pointer;" @click="${se=>Bt(se,W,"view")}">
                    ${B?n`<td style="padding-left: ${ae*1.2+.6}rem;">${W[B.id]??""}</td>`:d}
                    ${D.map(se=>se.id==="select"?n`<td><button class="crud-btn small" @click="${Te=>{Te.stopPropagation(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-select",parameters:{_clickedRow:W}},bubbles:!0,composed:!0}))}}">Select</button></td>`:n`<td>${W[se.id]??""}</td>`)}
                    ${de?n`<td style="text-align: end;">${W?.viewable===!1?d:n`<button class="crud-btn small" @click="${se=>Bt(se,W,"view")}">View</button>`}</td>`:d}
                </tr>
                ${(W.children??[]).map(se=>F(se,ae+1))}
            `;return n`
                <table class="crud-table">
                    <thead><tr>
                        ${B?n`<th>${B.label??d}</th>`:d}
                        ${D.map(W=>n`<th>${W.label??d}</th>`)}
                        ${de?n`<th></th>`:d}
                    </tr></thead>
                    <tbody>
                        ${Et.length===0?n`<tr><td colspan="99" style="padding: 1.5rem; text-align: center; color: var(--lumo-secondary-text-color, #888);">${ma($)}</td></tr>`:d}
                        ${Et.map(W=>F(W,0))}
                    </tbody>
                </table>`},O=J.get()?.rendersCrudLayouts?.()===!0,S=()=>{const T=J.get();return T?.renderTreeComponent?T.renderTreeComponent(this,{rows:y,columns:m.map(U=>({id:U.id,label:U.label})),idField:this.identifierFieldName,navigable:!!m[0]?.actionId,selectedId:this.state._selectedId??this.appState?._splitDetailId}):R()},z=y.length===0&&this.awaitingRows?n`
            <div role="status" aria-live="polite" aria-busy="true"
                 style="padding: var(--lumo-space-m, 1rem); width: 100%; box-sizing: border-box;">
                <span style="position: absolute; width: 1px; height: 1px; overflow: hidden;
                             clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap;"
                >Loading…</span>
                <mateu-skeleton variant="grid" count="6"></mateu-skeleton>
            </div>
        `:n`
            ${a.infiniteScrolling?n`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:d}
            ${!O&&p==="list"?C():!O&&p==="cards"?a.contentHeight?n`
                <div class="m-scroll" style="width: 100%; height: ${a.contentHeight};">
                    ${A()}
                </div>
            `:A():!O&&p==="masterDetail"?P():!O&&p==="tree"?S():J.get()?.renderTableComponent(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,Z=n`<div class="crud-band" aria-hidden="true"
            style="flex-shrink: 0; width: 100%; height: var(--mateu-crud-band-h, var(--mateu-page-band-h, 0px)); background-image: var(--mateu-page-band-image, none); background-repeat: repeat-x; background-size: auto 100%;"></div>`,H=a.infiniteScrolling?d:J.get()?.renderPagination(this,this.component),Q=this.showImportDialog?n`
            <div role="button" tabindex="0" class="crud-modal-backdrop" @click="${T=>{T.target===T.currentTarget&&(this.showImportDialog=!1)}}" @keydown="${te(T=>{T.target===T.currentTarget&&(this.showImportDialog=!1)})}">
                <div class="crud-modal">
                    <h3 style="margin: 0 0 .75rem;">Import</h3>
                    <input type="file" @change="${T=>{const U=T.target.files?.[0];if(U){const B=new FormData;B.append("file",U),fetch("/upload",{method:"POST",body:B}).then(D=>D.json()).then(D=>this.handleImportUploadSuccess({detail:D})).catch(()=>this.notify("Import failed"))}}}">
                    <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                        <button class="crud-btn" @click="${()=>{this.showImportDialog=!1}}">Cancel</button>
                    </div>
                </div>
            </div>
        `:d;return this.standalone?n`
                ${Q}
                <style>
                    /* Scoped to the listing area: a grid field inside a FORM must keep sizing
                       itself, so the fill is expressed here and never on the table component. */
                    [data-crud-area] > * { flex: 1 1 auto; min-height: 0; }
                    [data-crud-area] mateu-table, [data-crud-area] mateu-redwood-table { display: flex; flex-direction: column; }
                    [data-crud-area] vaadin-grid { height: 100%; min-height: 0; }
                </style>
                <div data-crud-box style="${this.boxStyle()} width: 100%; box-sizing: border-box;">
                    <div style="flex-shrink: 0; ${Wr}">
                        <mateu-content-header
                            .metadata="${a}"
                            .baseUrl="${this.baseUrl}"
                            .state="${this.state}"
                            .data="${this.data}"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                        ></mateu-content-header>
                    </div>
                    <div style="${rn} padding-inline: calc(3px + var(--mateu-edge-header-gutter, 0px)); box-sizing: border-box;">
                        <div style="flex: 1; min-width: 0;">${J.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                        ${this.renderColumnChooser()}
                    </div>
                    ${Z}
                    <div data-crud-area style="flex: 1; overflow-y: auto; min-height: 0; display: flex; flex-direction: column;">${z}</div>
                    <div style="flex-shrink: 0; ${Wr}">${H}</div>
                </div>
            `:n`
            ${Q}
            ${u?n`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; box-sizing: border-box; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem); ${Wr}">
                        ${o.map(T=>n`
                            <button class="back-chevron"
                                    data-action-id="${T.id}"
                                    title="${this.evalLabel(T.label)}"
                                    aria-label="${this.evalLabel(T.label)}"
                                    @click="${()=>this.handleToolbarButtonClick(T)}">
                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor"
                                          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>`)}
                        <div style="flex: 1; min-width: 0;">
                            ${a?.title?n`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(a.title)}</h2>
                            `:d}
                            ${a?.subtitle?n`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(a.subtitle)}</span>
                            `:d}
                        </div>
                        ${s.map(T=>e(T))}
                        ${c?n`<span class="toolbar-divider"></span>`:d}
                        ${l.map(T=>e(T))}
                        <slot></slot>
                    </div>
                `:d}
                <style>
                    /* Scoped to the listing area: a grid field inside a FORM must keep sizing
                       itself, so the fill is expressed here and never on the table component. */
                    [data-crud-area] > * { flex: 1 1 auto; min-height: 0; }
                    [data-crud-area] mateu-table, [data-crud-area] mateu-redwood-table { display: flex; flex-direction: column; }
                    [data-crud-area] vaadin-grid { height: 100%; min-height: 0; }
                </style>
            <div data-crud-box style="${this.boxStyle()}">
                <div style="${rn} padding-inline: calc(3px + var(--mateu-edge-header-gutter, 0px)); box-sizing: border-box;">
                    <div style="flex: 1; min-width: 0;">${J.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                    ${this.renderColumnChooser()}
                </div>
                ${Z}
                    <div data-crud-area style="flex: 1; overflow-y: auto; min-height: 0; display: flex; flex-direction: column;">${z}</div>
                <div style="flex-shrink: 0; ${Wr}">${H}</div>
            </div>
        `}createRenderRoot(){return J.mustUseShadowRoot()?super.createRenderRoot():this}};j.BOTTOM_GUTTER_PX=16;j.MAX_SLIVER_PX=64;j.MAX_CORRECTIONS=3;j.MAX_UNSETTLED_REFUSALS=4;j.MIN_FILL_PX=320;j.LOADING_VALVE_MS=15e3;j.styles=k`
        ${Mt}
        /* DS-neutral crud widgets (replace vaadin-button/card/grid/list-box/form-layout/dialog). */
        /* The way back: a chevron before the title, not a button competing with the actions.
           Same shape as the header's — see mateu-content-header. */
        .back-chevron {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
            width: 2rem;
            height: 2rem;
            padding: 0;
            margin-inline-start: -0.35rem;
            border: none;
            border-radius: 50%;
            background: transparent;
            color: var(--lumo-secondary-text-color, #5a6270);
            cursor: pointer;
        }
        .back-chevron svg { width: 1.25rem; height: 1.25rem; }
        .back-chevron:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); color: inherit; }
        .back-chevron:focus-visible { outline: 2px solid var(--lumo-primary-color, #2563eb); outline-offset: 2px; }

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
        /* A destructive bulk action must READ destructive — same treatment as the page header's
           toolbar (mateu-content-header .mtb), so the two toolbars of a crud agree. */
        .crud-btn.danger { color: var(--lumo-error-text-color, #c0392b); border-color: var(--lumo-error-color-50pct, rgba(192,57,43,.5)); }
        .crud-btn.danger:hover { background: var(--lumo-error-color-10pct, rgba(192,57,43,.1)); }
        .crud-btn.danger.primary { background: var(--lumo-error-color, #c0392b); color: #fff; border-color: transparent; }

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
    
        ${le}
    `;Ee([h()],j.prototype,"component",2);Ee([h()],j.prototype,"baseUrl",2);Ee([h({type:Boolean})],j.prototype,"standalone",2);Ee([h()],j.prototype,"state",2);Ee([h()],j.prototype,"data",2);Ee([h()],j.prototype,"appState",2);Ee([h()],j.prototype,"appData",2);Ee([b()],j.prototype,"showImportDialog",2);Ee([b()],j.prototype,"availableWidthPx",2);Ee([b()],j.prototype,"selectedItem",2);Ee([b()],j.prototype,"_columnPrefsRevision",2);Ee([b()],j.prototype,"fillHeightPx",2);Ee([b()],j.prototype,"loadingSince",2);j=Ee([_("mateu-table-crud")],j);const eb=(e,t)=>{const a=new Set,r=(i,s)=>{if(!i||typeof i!="object"||a.has(i)||s>40)return!1;if(a.add(i),Array.isArray(i))return i.some(l=>r(l,s+1));const o=i;if(o.id===t&&o.metadata&&typeof o.metadata=="object"&&o.metadata.infiniteScrolling)return!0;for(const l of["children","metadata","content","columns","tabs","components","header","footer"])if(r(o[l],s+1))return!0;return!1};return r(e,0)},tb=(e,t,a)=>{const r={...e};for(const i in t){const s=t[i],o=s?.page,l=e?.[i]?.page?.content,c=Number(o?.pageNumber);if(c>0&&Array.isArray(l)&&a(i)){const u=Number(o.pageSize),p=u>0&&l.length>=c*u?l.slice(0,c*u):l;r[i]={...s,page:{...o,content:[...p,...o.content??[]]}}}else r[i]=s}return r};var Gt=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(Gt||{}),ab=Object.defineProperty,Ui=(e,t,a,r)=>{for(var i=void 0,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=o(t,a,i)||i);return i&&ab(t,a,i),i};class la extends Oi{constructor(){super(...arguments),this.state={},this.data={},this._locallyEdited=new Set,this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(a=>a.type==Gt.OnLoad).forEach(a=>{if((!a.condition||this._evalExpr(a.condition))&&!a.triggered){const i=a;i.triggered=!0;var r=i.times-1;i.timeoutMillis>0?this.scheduleOnload(i,r,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId,background:Jg(i,this.data)},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,a,r)=>{if(r!=this.component?.id)return;const i=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,background:t.background,callbackToken:i},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const a=t,i=(this.component.triggers??[]).filter(s=>s.type==Gt.OnCustomEvent).filter(s=>s.eventName==a.type).filter(s=>s.source!=="COMPONENT"||a.detail?.__source===s.from);i.length!==0&&(i.some(s=>!s.source||s.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),i.forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId,parameters:a.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return _l(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return oh(t,this.state??{},this.data??{},this._interpolationExtra())}isOverlayChild(t){const a=t?.metadata?.type;return a==v.Drawer||a==v.Dialog}removeSelfFromOwnerChildren(){const t=this.component;if(!t)return!1;const a=i=>{if(i===t)return!0;const s=i;return t.id!=null&&s?.id==t.id&&this.isOverlayChild(s)};let r=this.parentNode;for(;r;){const i=r instanceof ShadowRoot?r.host:r,s=i.component?.children;if(Array.isArray(s)){const o=s.findIndex(a);if(o>=0)return s.splice(o,1),i.requestUpdate?.(),!0}r=r instanceof ShadowRoot?i:r.parentNode}return!1}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(Kt.Add==t.action){if(this.component){const s=this.component.children??(this.component.children=[]),o=t.component.id?s.findIndex(l=>l.id==t.component.id&&this.isOverlayChild(l)):-1;o>=0?(s[o]=t.component,this.component={...this.component}):s.push(t.component)}}else{this.callbackToken=Ne();let s=!1;if(t.component?.type==re.ServerSide)if(this.component){const o=this.component,l=t.component;s=o.serverSideType==l.serverSideType;const c=s?(o.children??[]).filter(u=>this.isOverlayChild(u)):[];o.actions=l.actions,o.type=l.type,o.rules=l.rules,o.triggers=l.triggers,o.serverSideType=l.serverSideType,o.route=l.route,o.initialData=l.initialData,o.validations=l.validations,o.cssClasses=l.cssClasses,o.slot=l.slot,o.style=l.style,o.children=c.length?[...l.children??[],...c]:l.children,(o.serverSideType!=l.serverSideType||o.id!=l.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const o=[t.component];this.component&&(this.component.children=o)}t.action!==Kt.ReplaceKeepData&&!s&&(this.state={},this.data={},this._locallyEdited.clear())}t.state&&(Object.keys(t.state).forEach(s=>this._locallyEdited.delete(s)),this.state={...this.state,...t.state});const a=this._lastOwnState;let r=this.state;a&&this._locallyEdited.forEach(s=>{!(t.state!=null&&s in t.state)&&r[s]!==a[s]&&(r={...r,[s]:a[s]})}),this._lastOwnState=r,t.data&&(this.data=tb(this.data??{},t.data,s=>eb(this.component,s))),this._lastFragmentData=this.data,this.registerCustomEventListeners();const i=J.getAfterRenderHook();i&&setTimeout(()=>i(this)),this.requestUpdate()}}willUpdate(t){super.willUpdate(t);const a=this.component?.serverSideType,r=a!=null&&this._lastViewKey!=null&&a!==this._lastViewKey;if(a!=null&&(this._lastViewKey=a),r&&this._locallyEdited.clear(),this._keepEditedFieldValues(t,r),!t.has("data")||this.data===this._lastFragmentData||r)return;const i=this.data,s=t.get("data");i&&Object.keys(i).length===0&&s&&Object.keys(s).length>0&&(this.data=s)}_keepEditedFieldValues(t,a){if(a||!t.has("state")||this._locallyEdited.size===0||this.state===this._lastOwnState)return;const r=this._lastOwnState;if(!r)return;let i;this._locallyEdited.forEach(s=>{r[s]!==this.state?.[s]&&(i=i??{...this.state},i[s]=r[s])}),i&&(this.state=i)}adoptEditedState(t,a){this._locallyEdited.add(t),this.state=a,this._lastOwnState=a}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:a,name:r})=>a.removeEventListener(r,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(a=>a.type==Gt.OnCustomEvent).forEach(a=>{const r=a.source==="DOCUMENT"||a.source==="COMPONENT"?document:this;r.addEventListener(a.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:r,name:a.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:a})=>t.removeEventListener(a,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}Ui([h()],la.prototype,"state");Ui([h()],la.prototype,"data");Ui([h()],la.prototype,"appData");Ui([h()],la.prototype,"appState");const rb=new Set(["sse","app-data","rest-sources","command-center","global-search","notifications","context-selectors","header-actions"]);function ib(e,t=rb){const a=(e??[]).filter(r=>r&&!t.has(r));return{ok:a.length===0,missing:a}}function sb(e,t=document){const a=ib(e);return a.ok||(console.warn(`[mateu] this renderer is missing capabilities the app requires: ${a.missing.join(", ")}. The app may not render correctly. Load a renderer build that provides them.`),t.dispatchEvent(new CustomEvent("mateu-capability-mismatch",{detail:{missing:a.missing,required:[...e??[]]},bubbles:!0,composed:!0}))),a}const Ad="mateu-recent-routes",ob=8;function Pd(){try{return JSON.parse(localStorage.getItem(Ad)??"{}")}catch{return{}}}function nb(e){try{localStorage.setItem(Ad,JSON.stringify(e))}catch{}}function sn(e){return Pd()[e||"_"]??[]}function lb(e,t){if(!t?.route||!t.label)return;const a=e||"_",r=Pd(),s=(r[a]??[]).filter(o=>o.route!==t.route);s.unshift({route:t.route,label:t.label}),r[a]=s.slice(0,ob),nb(r)}var db=Object.defineProperty,cb=Object.getOwnPropertyDescriptor,kt=(e,t,a,r)=>{for(var i=r>1?void 0:r?cb(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&db(t,a,i),i};let Fe=class extends I{constructor(){super(...arguments),this.baseUrl="",this.open=!1,this.queryText="",this.dataHits=[],this.loading=!1,this.selectedIndex=0,this.fabOffset=0,this.keydownHandler=null}connectedCallback(){super.connectedCallback(),this.keydownHandler=e=>{(e.metaKey||e.ctrlKey)&&(e.key==="k"||e.key==="K")?(e.preventDefault(),this.toggle()):e.key==="Escape"&&this.open&&this.close()},document.addEventListener("keydown",this.keydownHandler),this.setupFabObserver()}disconnectedCallback(){super.disconnectedCallback(),this.keydownHandler&&document.removeEventListener("keydown",this.keydownHandler),clearTimeout(this.searchTimer),this.fabObserver?.disconnect(),this.fabObserver=void 0}setupFabObserver(){const e=this.getRootNode(),t=e instanceof ShadowRoot?e:document.body;this.measureFabStack(),this.fabObserver?.disconnect(),this.fabObserver=new MutationObserver(()=>this.measureFabStack()),this.fabObserver.observe(t,{childList:!0,subtree:!0})}measureFabStack(){const t=this.getRootNode().querySelectorAll?.(".app-fab").length??0;t!==this.fabOffset&&(this.fabOffset=t)}updated(e){e.has("open")&&this.open&&requestAnimationFrame(()=>this.inputEl?.focus())}toggle(){this.open?this.close():this.openCenter()}openCenter(){this.open=!0,this.queryText="",this.dataHits=[],this.selectedIndex=0}close(){this.open=!1,this.queryText="",this.dataHits=[],clearTimeout(this.searchTimer)}flattenMenu(e,t){const a=[];for(const r of e??[])if(!r.separator)if(r.submenus&&r.submenus.length>0){const i=t?`${t} › ${r.label}`:r.label;a.push(...this.flattenMenu(r.submenus,i))}else r.route!==void 0&&r.route!==null&&a.push({label:r.label,breadcrumb:t,route:r.route});return a}onInput(e){this.queryText=e,this.selectedIndex=0;const t=e.trim();if(clearTimeout(this.searchTimer),!t||!this.app?.globalSearchEnabled){this.dataHits=[],this.loading=!1;return}this.loading=!0,this.searchTimer=setTimeout(()=>this.fetchGlobalSearch(t),250)}async fetchGlobalSearch(e){const t=this.app;if(!t?.globalSearchEnabled){this.loading=!1;return}try{const r=(await Aa.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","command-center",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(i=>i.data).find(i=>i&&i._globalsearch);this.dataHits=r?._globalsearch??[]}catch{this.dataHits=[]}finally{this.loading=!1}}navigateTo(e,t){lb(this.app?.serverSideType??"",{route:e,label:t}),this.close();for(const a of["route-changed","navigate-to-requested"])this.dispatchEvent(new CustomEvent(a,{detail:{route:e},bubbles:!0,composed:!0}))}askAi(){const e=this.queryText.trim();this.close(),this.dispatchEvent(new CustomEvent("mateu-open-ai",{detail:{query:e},bubbles:!0,composed:!0}))}visibleTargets(e){if(!this.queryText.trim()){const t=this.flattenMenu(this.app?.menu,"").map(r=>({route:r.route,label:r.label})),a=sn(this.app?.serverSideType??"");return[...t,...a]}return[...e.map(t=>({route:t.route,label:t.label})),...this.dataHits.map(t=>({route:t.route,label:t.label}))]}onKeydown(e,t){if(e.key==="ArrowDown")e.preventDefault(),this.selectedIndex=Math.min(this.selectedIndex+1,t.length-1);else if(e.key==="ArrowUp")e.preventDefault(),this.selectedIndex=Math.max(this.selectedIndex-1,0);else if(e.key==="Enter"){const a=t[this.selectedIndex];a&&this.navigateTo(a.route,a.label)}}render(){return n`
            <button class="cc-fab" style="${Zl(this.fabOffset)} z-index: 950;" ${ao("shell",this.fabOffset)}
                @click=${()=>this.openCenter()} title="Buscar y navegar (⌘K)" aria-label="Command center">
                ${this.fabIcon()}
            </button>
            ${this.open?this.renderOverlay():d}
        `}fabIcon(){return n`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>`}renderOverlay(){const e=this.queryText.trim().toLowerCase(),t=e?this.flattenMenu(this.app?.menu,"").filter(r=>r.label.toLowerCase().includes(e)||r.breadcrumb.toLowerCase().includes(e)):[],a=this.visibleTargets(t);return n`
            <div class="cc-backdrop" @click=${()=>this.close()}>
                <div class="cc-panel" @click=${r=>r.stopPropagation()}>
                    <div class="cc-bar">
                        <button class="cc-icon-btn" @click=${()=>this.queryText?this.onInput(""):this.close()} title="${this.queryText?"Borrar":"Cerrar"}">
                            ${this.queryText?this.backIcon():this.searchGlyph()}
                        </button>
                        <input class="cc-input" .value=${this.queryText} placeholder="Buscar pantallas, datos y acciones…"
                            @input=${r=>this.onInput(r.target.value)}
                            @keydown=${r=>this.onKeydown(r,a)}>
                        ${this.queryText?n`<button class="cc-icon-btn" @click=${()=>this.onInput("")} title="Limpiar">${this.clearIcon()}</button>`:d}
                    </div>
                    <div class="cc-body">
                        ${e?this.renderResults(t):this.renderDefault()}
                    </div>
                </div>
                <button class="cc-close" @click=${()=>this.close()} title="Cerrar">${this.clearIcon()}</button>
            </div>
        `}renderDefault(){const e=this.flattenMenu(this.app?.menu,""),t=sn(this.app?.serverSideType??"");let a=-1;return n`
            <div class="cc-columns">
                <div class="cc-col">
                    <div class="cc-section-title">Ir a</div>
                    <div class="cc-tiles">
                        ${e.map(r=>{a++;const i=a;return n`
                            <button class="cc-tile ${i===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(r.route,r.label)}
                                @mouseenter=${()=>{this.selectedIndex=i}}>
                                <span class="cc-tile-label">${r.label}</span>
                                ${r.breadcrumb?n`<span class="cc-sub">${r.breadcrumb}</span>`:d}
                            </button>`})}
                        ${e.length===0?n`<div class="cc-empty">Sin opciones de menú.</div>`:d}
                    </div>
                </div>
                ${t.length>0?n`
                    <div class="cc-col cc-col--recent">
                        <div class="cc-section-title">Recientes</div>
                        ${t.map(r=>{a++;const i=a;return n`
                            <button class="cc-row ${i===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(r.route,r.label)}
                                @mouseenter=${()=>{this.selectedIndex=i}}>
                                <span class="cc-tile-label">${r.label}</span>
                            </button>`})}
                    </div>`:d}
            </div>
        `}renderResults(e){if(this.loading&&this.dataHits.length===0&&e.length===0)return n`<div class="cc-list">${[0,1,2,3].map(()=>n`<div class="cc-skeleton"></div>`)}</div>`;const t=e.length===0&&this.dataHits.length===0;return n`
            <div class="cc-list">
                ${this.app?.sseUrl?n`
                    <button class="cc-row cc-ask-ai" @click=${()=>this.askAi()}>
                        ${this.aiIcon()}<span class="cc-tile-label">Preguntar a la IA: “${this.queryText.trim()}”</span>
                    </button>`:d}
                ${e.length>0?n`<div class="cc-section-title">Pantallas</div>`:d}
                ${e.map((a,r)=>n`
                    <button class="cc-row ${r===this.selectedIndex?"cc-sel":""}"
                        @click=${()=>this.navigateTo(a.route,a.label)}
                        @mouseenter=${()=>{this.selectedIndex=r}}>
                        <span class="cc-tile-label">${a.label}</span>
                        ${a.breadcrumb?n`<span class="cc-sub">${a.breadcrumb}</span>`:d}
                    </button>`)}
                ${this.renderDataHits(e.length)}
                ${t?n`<div class="cc-empty">No encontramos coincidencias para “${this.queryText.trim()}”.</div>`:d}
            </div>
        `}renderDataHits(e){if(this.dataHits.length===0)return d;let t;return n`${this.dataHits.map((a,r)=>{const i=e+r,s=a.category&&a.category!==t;return t=a.category,n`
                ${s?n`<div class="cc-section-title">${a.category}</div>`:d}
                <button class="cc-row ${i===this.selectedIndex?"cc-sel":""}"
                    @click=${()=>this.navigateTo(a.route,a.label)}
                    @mouseenter=${()=>{this.selectedIndex=i}}>
                    <span class="cc-tile-label">${a.label}</span>
                    ${a.description?n`<span class="cc-sub">${a.description}</span>`:d}
                </button>`})}`}searchGlyph(){return n`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`}backIcon(){return n`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`}clearIcon(){return n`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`}aiIcon(){return n`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 4.7L19 8.5l-4.1 2.3L12 15l-1.9-4.2L6 8.5l5.1-1.8z"></path></svg>`}};Fe.styles=[k`
        :host { --cc-accent: var(--lumo-primary-color, #3b82f6); }


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
            position: fixed; bottom: var(--mateu-fab-inset-bottom, var(--mateu-fab-inset-block, var(--lumo-space-m, 1rem))); right: var(--mateu-fab-inset-end, var(--lumo-space-m, 1rem));
            width: var(--lumo-size-l, 2.75rem); height: var(--lumo-size-l, 2.75rem); border-radius: var(--lumo-border-radius-m, 0.25rem);
            background: rgba(0,0,0,0.55); color: #fff; border: 1px solid rgba(255,255,255,0.2);
            display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 1110;
        }
        .cc-close:hover { background: rgba(0,0,0,0.75); }
    `,eo(".cc-fab")];kt([h({attribute:!1})],Fe.prototype,"app",2);kt([h()],Fe.prototype,"baseUrl",2);kt([b()],Fe.prototype,"open",2);kt([b()],Fe.prototype,"queryText",2);kt([b()],Fe.prototype,"dataHits",2);kt([b()],Fe.prototype,"loading",2);kt([b()],Fe.prototype,"selectedIndex",2);kt([b()],Fe.prototype,"fabOffset",2);kt([fe(".cc-input")],Fe.prototype,"inputEl",2);Fe=kt([_("mateu-command-center")],Fe);let st=null;function ub(e){const t=e.component?.metadata;!!(t&&(t.commandCenterEnabled||t.chromeless)&&t.variant!=="MEDIATOR")?((!st||!st.isConnected)&&(st=document.createElement("mateu-command-center"),e.renderRoot.appendChild(st)),st.app=t,st.baseUrl=e.baseUrl??""):st&&e.renderRoot.contains(st)&&(st.remove(),st=null)}const hb=(e,t=[])=>{const a=new Set(t.map(r=>r.toLowerCase()));return e.map(r=>{const i=(r||"").toLowerCase(),s=i.split(/[^a-z0-9]+/).map(o=>o.charAt(0));for(const o of[...s,...i,..."1234567890"])if(/^[a-z0-9]$/.test(o)&&!a.has(o))return a.add(o),o;return""})},pb=e=>e.split("+").filter(Boolean).map(t=>t.length===1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"),mb="vaadin-button, vaadin-tab, vaadin-menu-bar-button, button.mateu-button, [data-access-key-target]",fb=e=>{if(!e.getClientRects().length)return!1;const a=e.getBoundingClientRect();return a.width>0&&a.height>0&&a.bottom>0&&a.top<window.innerHeight},Od=(e,t=[])=>(e.querySelectorAll("*").forEach(a=>{a.matches(mb)&&t.push(a),a.shadowRoot&&Od(a.shadowRoot,t)}),t),vb=e=>{const t=e.getAttribute("data-action-id");if(!t)return"";let a=e;for(;a;){if(a instanceof HTMLElement&&a.localName==="mateu-component"){const i=(a.component?.actions??[]).find(s=>s.id===t)?.shortcut;if(i)return i}a=a.parentNode??(a instanceof ShadowRoot?a.host:null)}return""},gb=e=>Od(e).filter((t,a,r)=>r.indexOf(t)===a).filter(t=>fb(t)&&!t.hasAttribute("disabled")&&t.getAttribute("aria-disabled")!=="true").map(t=>({el:t,label:(t.getAttribute("aria-label")||t.textContent||"").replace(/\s+/g," ").trim(),declared:t.getAttribute("data-shortcut")||vb(t)})).filter(t=>t.label);let Vr=!1,on=!1,Rd=[];const mr=()=>document.querySelectorAll(".mateu-access-keys").forEach(e=>e.remove()),nn=()=>{mr();const e=gb(document),t=e.map(i=>/^alt\+([a-z0-9])$/i.exec(i.declared)?.[1]??"").filter(Boolean),a=e.filter(i=>!i.declared);hb(a.map(i=>i.label),t).forEach((i,s)=>{a[s].letter=i});const r=document.createElement("div");r.className="mateu-access-keys",r.setAttribute("aria-hidden","true"),Object.assign(r.style,{position:"fixed",inset:"0",pointerEvents:"none",zIndex:"10000"});for(const i of e){const s=i.declared?pb(i.declared):(i.letter??"").toUpperCase();if(!s)continue;const o=i.el.getBoundingClientRect(),l=document.createElement("span");l.textContent=s,Object.assign(l.style,{position:"absolute",left:Math.max(0,o.left-4)+"px",top:Math.max(0,o.top-8)+"px",padding:"0 .3rem",borderRadius:"3px",font:"600 .7rem/1.2rem var(--lumo-font-family, sans-serif)",background:"#fcd34d",color:"#1a1a1a",boxShadow:"0 1px 3px rgba(0,0,0,.35)"}),r.appendChild(l)}document.body.appendChild(r),Rd=e.filter(i=>i.letter)},bb=e=>{if(Vr=!!e,Vr||mr(),on||!Vr)return;on=!0;let t;document.addEventListener("keydown",a=>{if(!Vr)return;if(a.key==="Alt"&&!a.ctrlKey&&!a.metaKey&&!a.shiftKey){t||(t=setTimeout(nn,250));return}if(t&&(clearTimeout(t),t=void 0),!a.altKey||a.ctrlKey||a.metaKey)return;const r=/^(Key([A-Z])|Digit([0-9]))$/.exec(a.code||""),i=r?(r[2]||r[3]).toLowerCase():"";if(!i)return;document.querySelector(".mateu-access-keys")||nn();const s=Rd.find(o=>o.letter===i);s&&(a.preventDefault(),a.stopPropagation(),mr(),s.el.click())},!0),document.addEventListener("keyup",a=>{a.key==="Alt"&&(t&&(clearTimeout(t),t=void 0),mr())},!0),window.addEventListener("blur",mr)},yb="data-mateu-pending-styles",ln=`
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
`,dn=new WeakSet,$b=e=>{if(dn.has(e))return;dn.add(e);const t=e;if(typeof CSSStyleSheet<"u"&&Array.isArray(t.adoptedStyleSheets))try{const i=new CSSStyleSheet;i.replaceSync(ln),t.adoptedStyleSheets=[...t.adoptedStyleSheets,i];return}catch{}const a=e instanceof Document?e.head:e;if(!a)return;const r=document.createElement("style");r.setAttribute(yb,""),r.textContent=ln,a.appendChild(r)},wb=e=>{const t=e.getRootNode();if(t instanceof ShadowRoot||t instanceof Document)return t},Ci=new Set,xb=()=>{for(const e of Ci){if(e.isConnected&&e.hasAttribute("data-mateu-pending"))return!0;Ci.delete(e)}return!1},kb=e=>{if(!e||e.hasAttribute("data-mateu-pending"))return;const t=wb(e);t&&$b(t),e.setAttribute("data-mateu-pending",""),e.setAttribute("aria-busy","true"),Ci.add(e)},_b=e=>{e&&(e.removeAttribute("data-mateu-pending"),e.removeAttribute("aria-busy"),Ci.delete(e))},Sb=e=>{const a=(typeof e.composedPath=="function"?e.composedPath():[])[0]??e.target;return a instanceof Element?a:void 0},Cb=["button","a[href]",'[role="button"]','[role="menuitem"]','input[type="button"]','input[type="submit"]',"vaadin-button","vaadin-menu-bar-button","ui5-button","oj-c-button","oj-button"].join(", "),Eb=e=>{if(!(!e||typeof e.closest!="function"))return e.closest(Cb)??void 0};var Ib=Object.defineProperty,Tb=Object.getOwnPropertyDescriptor,ho=(e,t,a,r)=>{for(var i=r>1?void 0:r?Tb(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Ib(t,a,i),i};let Cr=class extends I{constructor(){super(...arguments),this.localFeedback=!1,this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.localFeedback=xb(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1;const t=e.detail??{},a=t.failure??ps(t.reason,{online:Vt.isOnline()});if(a.kind==="cancelled")return;nl(zu(a,t.reason,t.actionId));const r=bu(a)?t.retry:void 0;lt({text:a.message,variant:"error",duration:r?8e3:5e3,position:"bottomEnd",...r?{actionLabel:"Retry",onAction:r}:{}},this)}}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-called-event",this.fetchStarted),this.addEventListener("backend-succeeded-event",this.fetchFinished),this.addEventListener("backend-cancelled-event",this.fetchFinished),this.addEventListener("backend-failed-event",this.fetchFailed)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-called-event",this.fetchStarted),this.removeEventListener("backend-succeeded-event",this.fetchFinished),this.removeEventListener("backend-cancelled-event",this.fetchFinished),this.removeEventListener("backend-failed-event",this.fetchFailed)}render(){return n`<div class="loader-container">
            <div style="display: flex; flex-direction: column;">
                <slot></slot>
                <div class="loader-frame ${this.loading?this.localFeedback?"delayed-show late":"delayed-show":""}" style="${this.loading?"pointer-events: all;":"display: none;"}"><div class="loader"></div></div>
            </div>
        </div>`}};Cr.styles=k`
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

        /* The pressed control already pulses: the veil is for a wait that has made the screen stale. */
        .delayed-show.late {
            animation-delay: 3s;
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
  `;ho([b()],Cr.prototype,"loading",2);ho([b()],Cr.prototype,"localFeedback",2);Cr=ho([_("mateu-api-caller")],Cr);var Ae=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(Ae||{}),Ab=Object.defineProperty,Pb=Object.getOwnPropertyDescriptor,ie=(e,t,a,r)=>{for(var i=r>1?void 0:r?Pb(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Ab(t,a,i),i};const Ob=(e,t)=>(e.homeBaseUrl??"").includes("://")?e.homeBaseUrl:t||e.homeBaseUrl,Rb="10px",zb=["--mateu-accent","--mateu-page-band-h","--mateu-page-band-image"],Lb=(e,t,a)=>{const r=t&&/^[#\w\s(),.%-]+$/.test(t.trim())?t.trim():void 0,i=a&&(/^[\w\s/.:%~?&=#+,@-]+$/.test(a.trim())||/^data:image\/svg\+xml;base64,[A-Za-z0-9+/]+=*$/.test(a.trim()))?a.trim():void 0;r?(e.style.setProperty("--mateu-accent",r),e.style.setProperty("--mateu-page-band-h",Rb),e.style.setProperty("--mateu-page-band-image",i?`url("${i}")`:`linear-gradient(${r}, ${r})`),e._mateuAccent=r):e._mateuAccent&&(zb.forEach(s=>e.style.removeProperty(s)),e._mateuAccent=void 0)};let K=class extends la{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.sectionsOpen=!1,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this.commandPaletteDataHits=[],this._fetchedAppDataRef=void 0,this.openDataHit=e=>{ut.confirmLeave()&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteDataHits=[],this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:e.route},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:e.route},bubbles:!0,composed:!0})))},this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this._openAiHandler=()=>{this.chatOpen||this.showHideIa()},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const a=this.renderRoot.querySelector?.("mateu-component");a&&a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.runMenuRules=e=>{for(const t of e)if(t.action===Ae.RunAction&&t.actionId)this.runAction(t.actionId);else if(t.action===Ae.RunJS&&t.value!=null)try{new Function(String(t.value))()}catch(a){console.error("menu RunJS rule failed",a)}},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const a=e[t];if(this.selectedRoute?this.isActiveOption(a):a.selected)return a;const r=this.getSelectedOption(a.submenus);if(r)return r}return null},this.itemSelected=e=>{const t=e.detail.value;if(t.unavailable){Oo();return}this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix,t.rules)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix,t.rules))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const a=[];for(const r of e)if(!r.separator)if(r.submenus&&r.submenus.length>0){const i=t?`${t} › ${r.label}`:r.label;a.push(...this.flattenMenuForPalette(r.submenus,i))}else a.push({label:r.label,breadcrumb:t,consumedRoute:r.consumedRoute,route:r.route,actionId:r.actionId,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix});return a},this.handleCommandPaletteKeydown=(e,t)=>{const a=Math.min(t.length,10),r=a+Math.min(this.commandPaletteDataHits.length,8);if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,r-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){if(this.commandPaletteSelectedIndex>=a){const s=this.commandPaletteDataHits[this.commandPaletteSelectedIndex-a];s&&this.openDataHit(s);return}const i=t[this.commandPaletteSelectedIndex];i&&(this.selectRoute(i.consumedRoute,i.route,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return d;const e=this.component?.metadata;if(e?.commandCenterEnabled)return d;if(!e?.menu)return d;const t=this.flattenMenuForPalette(e.menu,""),a=this.commandPaletteQuery.toLowerCase(),r=a?t.filter(i=>i.label.toLowerCase().includes(a)||i.breadcrumb.toLowerCase().includes(a)):t;return n`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}>
                <div class="cmd-palette" @click=${i=>i.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        ${V("vaadin:search",void 0,"cmd-search-icon")}
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${i=>{this.commandPaletteQuery=i.target.value,this.commandPaletteSelectedIndex=0,this.fetchGlobalSearch(this.commandPaletteQuery)}}
                            @keydown=${i=>this.handleCommandPaletteKeydown(i,r)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${r.slice(0,10).map((i,s)=>n`
                            <div class="cmd-result ${s===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                @click=${()=>{this.selectRoute(i.consumedRoute,i.route,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=s}}
                            >
                                <span class="cmd-result-label">${i.label}</span>
                                ${i.breadcrumb?n`<span class="cmd-result-breadcrumb">${i.breadcrumb}</span>`:d}
                            </div>
                        `)}
                        ${a&&this.commandPaletteDataHits.length>0?n`
                            ${this.commandPaletteDataHits.slice(0,8).map((i,s)=>{const o=Math.min(r.length,10)+s,l=this.commandPaletteDataHits[s-1];return n`
                                    ${i.category&&i.category!==l?.category?n`
                                        <div class="cmd-category">${i.category}</div>`:d}
                                    <div class="cmd-result ${o===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                         @click=${()=>this.openDataHit(i)}
                                         @mouseenter=${()=>{this.commandPaletteSelectedIndex=o}}
                                    >
                                        <span class="cmd-result-label">${i.label}</span>
                                        ${i.description?n`<span class="cmd-result-breadcrumb">${i.description}</span>`:d}
                                    </div>`})}`:d}
                        ${r.length===0&&this.commandPaletteDataHits.length===0?n`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:d}
                    </div>
                </div>
            </div>
        `},this.renderRail=e=>n`
            <div class="nav-rail">
                ${e.map(t=>this.renderRailItem(t))}
            </div>
        `,this.renderRailItem=e=>{const t=e.submenus?.length>0?this.railOpenOption?.label===e.label:e.selected;return n`
            <div class="rail-item ${t?"rail-item--active":""}"
                @click=${()=>{e.submenus&&e.submenus.length>0?this.railOpenOption=this.railOpenOption?.label===e.label?null:e:(this.railOpenOption=null,this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix,e.rules))}}
            >
                ${e.icon?V(e.icon,void 0,"rail-icon"):n`<div class="rail-icon-placeholder">${e.label.charAt(0).toUpperCase()}</div>`}
                <span class="rail-label">${e.label}</span>
            </div>
        `},this.renderRailSubPanel=e=>n`
            <div class="rail-sub-panel">
                <div class="rail-sub-title">${e.label}</div>
                ${e.submenus.map(t=>n`
                    <div class="rail-sub-item ${t.selected?"rail-sub-item--active":""}"
                        @click=${()=>{t.submenus&&t.submenus.length>0?this.railOpenOption=t:this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix,t.rules)}}
                    >${t.label}</div>
                `)}
            </div>
        `,this.renderTilesHub=e=>n`
            <div style="padding: 2rem;">
                <h2 style="margin-top: 0; margin-bottom: 1.5rem;">${e.label}</h2>
                <div class="tiles-hub-grid">
                    ${e.submenus.map(t=>n`
                        <div class="nav-tile"
                            @click=${()=>{t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix,t.rules))}}
                        >
                            ${t.icon?V(t.icon,"font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;"):d}
                            <div class="nav-tile-title">${t.label}</div>
                            ${t.description?n`<div class="nav-tile-desc">${t.description}</div>`:d}
                        </div>
                    `)}
                </div>
            </div>
        `,this.goHome=()=>{ut.confirmLeave()&&(window.history.pushState(null,"","/"),window.dispatchEvent(new PopStateEvent("popstate",{state:null})))},this.selectRoute=(e,t,a,r,i,s,o)=>{if(o&&o.length>0){this.runMenuRules(o);return}ut.confirmLeave()&&this._selectRoute(e,t,a,r,i,s)},this._selectRoute=(e,t,a,r,i,s)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=r,this.selectedRoute=t,this.selectedServerSideType=i,this.selectedUriPrefix=s,this.instant=Ne(),this.state&&this.state._route!=null&&(this.state._route=void 0);let o=this.baseUrl??"";o.indexOf("://")<0&&(o.startsWith("/")||(o="/"+o),o=window.location.origin+o),o.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(o+t);if(e&&l.pathname.startsWith(e)){const c=l.pathname.substring(e.length);l=new URL(l.origin+(c||"/")+l.search)}if((window.location.pathname||l.pathname)&&(window.location.pathname!=l.pathname||window.location.search!=l.search)){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="/_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.isActiveOption=e=>this.selectedRoute?fs(e,this.selectedRoute):!!e.selected||at(e)&&fs(e,window.location.pathname),this.mapItems=(e,t)=>e.map(a=>{if(a.submenus&&a.submenus.length>0){let r=this.mapItems(a.submenus,t);return t&&a.label.toLowerCase().includes(t)&&(r=this.mapItems(a.submenus,"")),r&&r.length>0?{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||this.isActiveOption(a),display:a.display??void 0,description:a.description,icon:a.icon,image:a.image??void 0,children:r}:void 0}if(a.separator)return t?void 0:{component:"hr"};if(!t||a.label.toLowerCase().includes(t))return{...a.unavailable?{unavailable:!0,className:"mateu-nav-unavailable",tooltip:a.description,title:a.description}:{},consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||this.isActiveOption(a),description:a.unavailable?void 0:a.description,icon:a.icon,image:a.image??void 0}}).filter(a=>a!=null),this.getSelectedIndex=e=>{if(!e)return NaN;const a=cl(e,(i=>{let s=(i??"").trim();return s.length>1&&s.endsWith("/")&&(s=s.slice(0,-1)),s})(this.selectedRoute??window.location.pathname));if(!Number.isNaN(a))return a;const r=this.getSelectedOption(e);return r?e.indexOf(r):NaN},this.activeSectionOf=e=>{if(!e)return;const t=Po(e,window.location.pathname)??(this.selectedRoute?Po(e,this.selectedRoute):void 0);if(t)return t;const a=this.getSelectedIndex(e);return Number.isNaN(a)?void 0:e[a]},this.selectSection=e=>{if(e.unavailable){Oo();return}const t=vl(e);t&&(this.sectionsOpen=!1,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix,t.rules))},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?n`
                <details open class="left-menu-group">
                    <summary>${e.label}</summary>
                    <div class="left-menu-children">
                        ${e.submenus.map(t=>n`${this.renderOptionOnLeftMenu(t)}`)}
                    </div>
                </details>
`:n`<button class="left-menu-item"
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix,e.rules)}"
        >${e.label}</button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",Ne())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?n`
            ${e.map(a=>{const r=a;return n`

                        ${r.component=="hr"?n`<hr/>`:n`
                                <div class="side-nav-item ${r.selected?"side-nav-item--active":""}">
                                    <button class="side-nav-link"
                                            @click="${()=>{r.route&&!r.children&&this.selectRoute(void 0,r.route,void 0,this.baseUrl,void 0,void 0)}}">
                                        ${r.icon?V("vaadin:dashboard","margin-right:.5rem;"):d}${r.text}
                                    </button>
                                    ${r.children?n`<div class="side-nav-children">${this.renderSideNav(r.children,"children")}</div>`:d}
                                </div>
                        `}

                            `})}`:d,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix,t.rules)}}createRenderRoot(){return J.mustUseShadowRoot()?super.createRenderRoot():(K.injectLightDomStyles(),this)}static injectLightDomStyles(){if(K.lightDomStylesInjected||typeof document>"u"||(K.lightDomStylesInjected=!0,document.getElementById("mateu-app-light-styles")))return;const e=K.styles,t=Array.isArray(e)?e.map(r=>r?.cssText??"").join(`
`):e?.cssText??"";if(!t)return;const a=document.createElement("style");a.id="mateu-app-light-styles",a.textContent=t,document.head.appendChild(a)}fetchGlobalSearch(e){const t=this.component?.metadata;if(t?.globalSearchEnabled){if(clearTimeout(this._globalSearchTimer),!e){this.commandPaletteDataHits=[];return}this._globalSearchTimer=setTimeout(async()=>{try{const r=(await Aa.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","cmd-palette",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(i=>i.data).find(i=>i&&i._globalsearch);this.commandPaletteDataHits=r?._globalsearch??[]}catch{this.commandPaletteDataHits=[]}},250)}}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{e.key==="Escape"&&this.sectionsOpen&&(this.sectionsOpen=!1),!this.component?.metadata?.commandCenterEnabled&&((e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=""))},document.addEventListener("keydown",this._commandPaletteHandler),ut.install(),this.addEventListener("compact-changed",this._compactHandler),this.addEventListener("mateu-open-ai",this._openAiHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler),this.removeEventListener("mateu-open-ai",this._openAiHandler)}updated(e){if(super.updated(e),ub(this),this.component){const a=this.component.metadata;if(a){const r=a;if(bb(!!r.accessKeys),vh(this,r.navMenu??r.menu,r.noBreadcrumbs,(i,s)=>this.selectRoute(i.consumedRoute,s,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix)),Hn(r.restSources),Yc(r.components),r.appDataSource){const i=r.appDataSource.ref||r.appDataSource.url;i&&i!==this._fetchedAppDataRef&&(this._fetchedAppDataRef=i,Ua(r.appDataSource).then(s=>{s&&typeof s=="object"&&(ba.value={...ba.value,...s},this.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0})))}).catch(s=>console.error("app-scope data source fetch failed",s)))}if(Lb(this,r.accentColor,r.accentStrip||r.generatedAccentStrip),r.favicon){let i=document.querySelector("link[rel~='icon']");i||(i=document.createElement("link"),i.rel="icon",document.head.appendChild(i)),i.href=r.favicon}e.has("component")&&(sb(r.requiredCapabilities,this),this.selectedRoute=r.homeRoute,this.selectedConsumedRoute=r.homeConsumedRoute,this.selectedServerSideType=r.homeServerSideType,this.selectedBaseUrl=Ob(r,this.baseUrl),this.selectedUriPrefix=r.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return J.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};K.lightDomStylesInjected=!1;K.styles=[k`
        /* DS-neutral app chrome (replaces vaadin-app-layout / menu-bar / tabs / side-nav). */
        .m-hl { display: flex; flex-direction: row; }
        .m-vl { display: flex; flex-direction: column; }
        .m-scroll { overflow: auto; }
        .m-md { display: flex; width: 100%; height: 100%; }
        .m-md > .m-scroll { flex: 1; min-width: 0; }
        /* The agent's chat panel: shown when open (slot="detail"), hidden when closed. It opens on
           the content row's START (order -1: the left), under the header, which it never covers
           or moves; the header's chat toggle (appRenderer, renderChatToggle) opens and closes it.
           On a wide viewport it pushes the content aside; on a narrow one it covers the content
           area, full width (in either mode) — a side column would leave the page nothing. */
        mateu-chat[slot="detail-hidden"] { display: none; }
        mateu-chat[slot="detail"] { display: flex; flex-direction: column; flex: 0 0 var(--mateu-chat-width, 460px); min-width: 0; max-width: calc(100% - 20rem); order: -1; box-sizing: border-box; padding-top: 0.5rem; border-inline-end: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); background: var(--lumo-base-color, #fff); }
        /* its width is the user's (mateu-chat: 460px by default, 320–720 dragging its edge,
           remembered); ⤢ widens it to ~60% of the viewport, the page still beside it */
        mateu-chat[slot="detail"][expanded] { flex-basis: var(--mateu-chat-wide, 60vw); max-width: none; }
        /* pushed aside, a fixed-width page fills what is left and would touch the panel: keep a gutter */
        @media (min-width: 601px) {
            .m-md:has(> mateu-chat[slot="detail"]) > .m-scroll { padding-inline: var(--lumo-space-m, 1rem); }
        }
        @media (max-width: 600px) {
            .m-md:has(> mateu-chat[slot="detail"]) { position: relative; }
            mateu-chat[slot="detail"] { position: absolute; inset: 0; z-index: 1000; width: 100%; max-width: none; border-inline-end: none; }
        }
        /* The header's icon buttons (appRenderer, renderHeaderIconButton: the chat and theme toggles —
           a tertiary icon vaadin-button in the Vaadin renderer, .app-chrome-icon-btn otherwise). One
           icon style for the whole header: outline glyphs at --lumo-icon-size-m, in
           --mateu-header-icon-color (an app can set it on mateu-app; default the secondary text
           colour). A two-state button reads as pressed (aria-pressed) in the primary colours. */
        .mateu-header-icon-btn, .app-chrome-icon-btn { color: var(--mateu-header-icon-color, var(--lumo-secondary-text-color, #5a6573)); flex-shrink: 0; margin: 0; }
        .mateu-header-icon-btn > vaadin-icon { width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem); }
        .mateu-header-icon-btn:hover { color: var(--lumo-body-text-color, #1a1a1a); }
        /* (Lumo forces a tertiary button's background through --vaadin-button-tertiary-background) */
        .mateu-header-icon-btn[aria-pressed="true"], .app-chrome-icon-btn[aria-pressed="true"] { color: var(--lumo-primary-text-color, #1676f3); --vaadin-button-tertiary-background: var(--lumo-primary-color-10pct, rgba(22,118,243,.1)); background-color: var(--lumo-primary-color-10pct, rgba(22,118,243,.1)); }
        .app-chrome-icon-btn:focus-visible { outline: 2px solid var(--lumo-primary-color-50pct, rgba(22,118,243,.5)); outline-offset: 1px; }
        .m-app-layout { display: flex; flex-direction: column; width: 100%; height: 100vh; overflow: hidden; }
        .m-app-layout > .app-navbar { display: flex; align-items: center; gap: .5rem; height: 4rem; flex-shrink: 0; padding: 0 .75rem; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); background: var(--lumo-base-color, #fff); }
        .m-app-layout > .app-body { display: flex; flex: 1; min-height: 0; }
        .app-drawer { width: 16rem; flex-shrink: 0; overflow: auto; border-right: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); padding: .5rem 0; }
        .m-app-layout:not(.drawer-open) > .app-body > .app-drawer { display: none; }
        .drawer-toggle { border: none; background: transparent; font-size: 1.2rem; cursor: pointer; padding: .3rem .5rem; border-radius: var(--lumo-border-radius-m, 6px); }
        .drawer-toggle:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .drawer-search { padding: .4rem .6rem; border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2)); border-radius: var(--lumo-border-radius-m, 6px); box-sizing: border-box; font: inherit; }

        /* The app header's row (.mateu-app-header, see appRenderer) on a narrow viewport. The brand
           and the widgets may shrink, and the menu takes what is left with room kept for at least its
           overflow button: vaadin-menu-bar moves what does not fit into "···" by itself, so a width
           to measure is all it needs. Before, brand and widgets would not shrink, the menu was left
           0px wide and the widgets ran off the right edge. */
        .mateu-app-header > .mateu-app-brand { flex: 0 1 auto; min-width: 0; }
        .mateu-app-header > .menu-on-top { flex: 1 1 0; min-width: var(--lumo-size-m, 2.25rem); }
        .mateu-app-header > .mateu-app-widgets { flex: 0 1 auto; min-width: 0; }
        /* One spacing between everything in the widget zone — the chat toggle, the app's own widgets
           (slotted: a slot is display: contents, so they are items of this row too), the context
           pickers and actions, the theme toggle. Each used to bring its own margin, or none: the
           app's widgets and the pickers had none and sat against each other. */
        .mateu-app-widgets { gap: var(--lumo-space-m, 1rem); }
        /* The app's widgets are often raw HTML (a Text with an <a>…). Text in them is header text,
           and a bare link reads as header text too, not as the browser's link blue: the shared link
           rule (linkStyles.ts) takes --mateu-link-color, which inherits into the widgets' own shadow
           roots. An app can set --mateu-header-link-color on mateu-app to have them stand out. */
        .mateu-app-widgets { --mateu-link-color: var(--mateu-header-link-color, var(--lumo-body-text-color, #1a1a1a)); }
        .mateu-app-widgets ::slotted(*) { color: var(--lumo-body-text-color, #1a1a1a); }
        /* Below 600px the title goes (the logo still says whose app this is) and the header turns
           compact. What a widget shows then is the widget's to say, and a class could not reach it —
           widgets are other components, in shadow roots of their own — but a custom property is
           inherited through those, so the header sets two:
             display: var(--mateu-header-wide-only, inline)   shown except when compact
             display: var(--mateu-header-narrow-only, none)   shown only when compact (inline-flex, what a vaadin-icon needs to keep its size and place) */
        @media (max-width: 600px) {
            .mateu-app-header .mateu-app-title { display: none; }
            .mateu-app-header { --mateu-header-wide-only: none; --mateu-header-narrow-only: inline-flex; }
            /* compact header: every pixel of the row is the menu's */
            .mateu-app-widgets { gap: var(--lumo-space-s, .5rem); }
        }

        /* MENU_ON_TOP in two bands (appRenderer): band 1 = logo + widgets, band 2 = the app title
           then the menu bar. Band 2's start lines up with the content gutter below it. Below 600px
           the menu folds into a ☰ button before the title. Band 1 takes the same gutter as band 2
           and the content, so the logo, the band-2 title and the page share one left edge (24px,
           16px on a phone); on the end, the last widget's own padding makes up the difference. */
        .mateu-app-band1 {
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            box-sizing: border-box;
            padding-inline: var(--mateu-content-gutter, 24px) calc(var(--mateu-content-gutter, 24px) - var(--lumo-space-s, .5rem));
        }
        .mateu-app-band1 > .mateu-app-header { align-items: center !important; }
        .mateu-app-band1 .mateu-app-brand > .m-hl { align-items: center !important; }
        .mateu-app-band2 {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-s, .5rem);
            flex-shrink: 0;
            width: 100%;
            box-sizing: border-box;
            min-height: 2.75rem;
            padding-inline: var(--mateu-content-gutter, 24px) calc(var(--mateu-content-gutter, 24px) - var(--lumo-space-s, .5rem));
            background-color: var(--lumo-base-color);
            color: var(--lumo-body-text-color);
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            /* (no accent line here: the app's accent is a strip drawn where Redwood draws its
               colour strip — under the page header, on top of a listing — see applyAccent) */
        }
        .mateu-app-band-title {
            flex: 0 0 auto;
            margin-inline-end: var(--lumo-space-m, 1rem);
            font-size: var(--lumo-font-size-l, 1.125rem);
            font-weight: 600;
            color: var(--lumo-header-text-color, inherit);
            /* the app's accent (@App(accentColor) → --mateu-accent) in the light theme only: on the
               dark base a brand red loses contrast, so there it stays the header text colour */
            color: light-dark(var(--mateu-accent, var(--lumo-header-text-color, currentColor)), var(--lumo-header-text-color, currentColor));
            text-decoration: none;
            white-space: nowrap;
        }
        .mateu-app-band2 > .menu-band { flex: 1 1 0; min-width: 0; }
        /* The menu band is navigation, not a row of links: its items in the body text colour (the
           Vaadin adapter draws it as a tertiary contrast vaadin-menu-bar), and the section on screen
           marked quietly — the primary text colour and a 2px underline, as vaadin-tabs marks its
           selected tab, with no fill. The ☰ button of a narrow viewport is header text too. */
        .mateu-app-band2 vaadin-menu-bar-button { color: var(--lumo-body-text-color, #1a1a1a); font-weight: 500; }
        .mateu-app-band2 vaadin-menu-bar-button:hover { color: var(--lumo-header-text-color, #000); }
        .mateu-app-band2 .menu-band vaadin-menu-bar-button.mateu-nav-active,
        .mateu-app-band2 .sections-band vaadin-menu-bar-button.mateu-nav-active {
            color: var(--lumo-primary-text-color, #1676f3);
            border-radius: var(--lumo-border-radius-m, 6px) var(--lumo-border-radius-m, 6px) 0 0;
            box-shadow: inset 0 -2px 0 0 var(--lumo-primary-color, #1676f3);
        }
        .mateu-app-menu-button { display: none; flex: 0 0 auto; margin-inline-start: calc(-1 * var(--lumo-space-s, .5rem)); }
        /* The content gutter of this shell (it has no padded .app-content): the page's content view
           takes it (mateu-ux data-page-width fixed/full), the RDS 24px — 16px on a phone. */
        .mateu-content-gutter { --mateu-content-gutter: 24px; --mateu-shell-gutter: 24px; }
        /* …and the two header bands take the same gutter, so the header's edges line up with it */
        .mateu-app-band1, .mateu-app-band2 { --mateu-content-gutter: 24px; }
        @media (max-width: 600px) {
            .mateu-app-band2 > .menu-band { display: none; }
            .mateu-app-menu-button { display: inline-flex; }
            .mateu-app-band-title { overflow: hidden; text-overflow: ellipsis; min-width: 0; flex: 0 1 auto; }
            .mateu-content-gutter { --mateu-content-gutter: 16px; --mateu-shell-gutter: 16px; }
            .mateu-app-band1, .mateu-app-band2 { --mateu-content-gutter: 16px; }
        }

        /* HAMBURGER_SECTIONS (appRenderer), Opera Cloud's navigation. Band 1 = hamburger, brand and
           widgets; band 2 = the section on screen (its name, as MENU_ON_TOP's band title) and its
           entries. Unlike MENU_ON_TOP's band the entries stay on a narrow viewport: the menu bar
           moves what does not fit into its own "···". The hamburger opens the sections over the
           content, under band 1, with a scrim that closes it. */
        .mateu-app-band2 > .sections-band { flex: 1 1 0; min-width: 0; }
        /* the hamburger is one more header icon button (renderSectionsToggle): the header's icon colour
           and size like the chat, bell and theme toggles; its glyph lines up with the gutter */
        .mateu-sections-toggle { align-self: center; margin-inline: calc(-1 * var(--lumo-space-s, .5rem)) var(--lumo-space-s, .5rem); }
        /* Band 2 holds the section on screen. With none (the home) it has nothing to say, so it
           folds away — and comes back when a section is chosen — sliding and fading rather than
           jumping (no motion for whoever asks the system for less). */
        .mateu-section-band {
            max-height: 4rem;
            transition: max-height .22s ease, min-height .22s ease, opacity .18s ease, border-bottom-width .22s step-end;
        }
        .mateu-section-band.mateu-section-band--empty {
            max-height: 0; min-height: 0; opacity: 0; overflow: hidden;
            border-bottom-width: 0;
            transition: max-height .22s ease, min-height .22s ease, opacity .18s ease, border-bottom-width .22s step-start;
        }
        @media (prefers-reduced-motion: reduce) {
            .mateu-section-band, .mateu-section-band.mateu-section-band--empty { transition: none; }
        }
        .mateu-sections-scrim { position: absolute; inset: 3.5rem 0 0 0; z-index: 199; background: var(--lumo-shade-20pct, rgba(0,0,0,.2)); }
        .mateu-sections-panel {
            position: absolute; top: 3.5rem; bottom: 0; left: 0; z-index: 200;
            width: 18rem; max-width: calc(100% - 3rem); overflow-y: auto; box-sizing: border-box;
            display: flex; flex-direction: column; padding: var(--lumo-space-s, .5rem) 0;
            background: var(--lumo-base-color, #fff);
            border-inline-end: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            box-shadow: var(--lumo-box-shadow-m, 0 4px 12px rgba(0,0,0,.15));
        }
        .mateu-section-link {
            display: flex; align-items: center; gap: var(--lumo-space-s, .5rem);
            border: none; background: transparent; font: inherit; text-align: start; cursor: pointer;
            padding: .65rem var(--mateu-content-gutter, 24px); color: var(--lumo-body-text-color, #1a1a1a);
            border-inline-start: 3px solid transparent;
        }
        .mateu-section-link:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .mateu-section-link:focus-visible { outline: 2px solid var(--lumo-primary-color-50pct, rgba(22,118,243,.5)); outline-offset: -2px; }
        .mateu-section-link--active { color: var(--lumo-primary-text-color, #1676f3); font-weight: 600; border-inline-start-color: var(--lumo-primary-color, #1676f3); }

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
            --mateu-content-gutter: 0px;
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
        /* a remote section whose remote did not answer: there, dimmed, its tooltip says why */
        .mateu-nav-unavailable { opacity: .55; cursor: help; }
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
        .app-chrome-icon-btn { border: none; background: transparent; cursor: pointer; font: inherit; padding: .4rem; border-radius: var(--lumo-border-radius-m, 6px); display: inline-flex; align-items: center; justify-content: center; min-width: var(--lumo-size-m, 2.25rem); min-height: var(--lumo-size-m, 2.25rem); box-sizing: border-box; }
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

        /* The FABs' look and place are the rail's (layout/fabRail.ts): Lumo buttons, square, in the
           column the page width picks. The agent's chat has none: its toggle is in the header. */


  `,eo(".app-fab, .page-fab"),Ta];ie([b()],K.prototype,"filter",2);ie([b()],K.prototype,"instant",2);ie([b()],K.prototype,"selectedConsumedRoute",2);ie([b()],K.prototype,"selectedRoute",2);ie([b()],K.prototype,"selectedUriPrefix",2);ie([b()],K.prototype,"selectedBaseUrl",2);ie([b()],K.prototype,"selectedServerSideType",2);ie([b()],K.prototype,"selectedParams",2);ie([b()],K.prototype,"tilesMenuOption",2);ie([b()],K.prototype,"railOpenOption",2);ie([b()],K.prototype,"sectionsOpen",2);ie([b()],K.prototype,"commandPaletteOpen",2);ie([b()],K.prototype,"commandPaletteQuery",2);ie([b()],K.prototype,"commandPaletteSelectedIndex",2);ie([b()],K.prototype,"commandPaletteDataHits",2);ie([b()],K.prototype,"pageCompact",2);ie([fe("mateu-chat")],K.prototype,"chat",2);ie([b()],K.prototype,"isDark",2);ie([b()],K.prototype,"chatOpen",2);ie([fe(".mateu-app-layout")],K.prototype,"vaadinAppLayout",2);K=ie([_("mateu-app")],K);var Db=Object.defineProperty,Mb=Object.getOwnPropertyDescriptor,_t=(e,t,a,r)=>{for(var i=r>1?void 0:r?Mb(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Db(t,a,i),i};let qe=class extends I{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",a=>{const s=a.keyCode||a.which;(s===32||s===13)&&t.click()})}}render(){return n`
       `}};qe.styles=k`
  `;_t([h()],qe.prototype,"message",2);_t([h()],qe.prototype,"dismiss",2);_t([h()],qe.prototype,"learnMore",2);_t([h()],qe.prototype,"learnMoreLink",2);_t([h()],qe.prototype,"showLearnMore",2);_t([h()],qe.prototype,"position",2);_t([h()],qe.prototype,"cookieName",2);_t([b()],qe.prototype,"_css",2);_t([fe('[aria-label="cookieconsent"]')],qe.prototype,"popup",2);qe=_t([_("mateu-cookie-consent")],qe);var Nb=Object.defineProperty,Fb=Object.getOwnPropertyDescriptor,zd=(e,t,a,r)=>{for(var i=r>1?void 0:r?Fb(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Nb(t,a,i),i};let Ei=class extends I{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return n`<slot></slot>`}};Ei.styles=k`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;zd([h()],Ei.prototype,"target",2);Ei=zd([_("mateu-event-interceptor")],Ei);var qb=Object.defineProperty,Bb=Object.getOwnPropertyDescriptor,Ld=(e,t,a,r)=>{for(var i=r>1?void 0:r?Bb(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&qb(t,a,i),i};let Ii=class extends la{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,this.releaseFocusTrap(),setTimeout(()=>{this.removeSelfFromOwnerChildren()||this.parentElement?.removeChild(this)},500)},this.onKeydown=e=>{e.key==="Escape"&&this.opened&&(e.stopPropagation(),this.close())}}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this.onKeydown)}disconnectedCallback(){super.disconnectedCallback(),this.releaseFocusTrap()}releaseFocusTrap(){this.focusTrap?.release(),this.focusTrap=void 0}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const r=this.component.metadata;this.state=r.initialData}const t=this.renderRoot.querySelector('[role="dialog"]'),a=this.component?.metadata?.modeless;this.opened&&t&&!this.focusTrap&&!a?this.focusTrap=co(t):this.focusTrap&&this.opened&&this.focusTrap.refresh()}render(){if(!this.opened)return n``;const e=this.component.metadata,t=gr(e.headerTitle,this.state,this.data,this.appState,this.appData),a=!!(t||e.header||e.closeButtonOnHeader),r=[e.width?`width:${e.width};`:"min-width:min(90vw,28rem);",e.height?`height:${e.height};`:"",e.top?`margin-top:${e.top};`:""].join("");return n`
            <div class="backdrop ${e.modeless?"modeless":""}"
                 @click="${i=>{!e.modeless&&i.target===i.currentTarget&&this.close()}}">
                <div class="dialog ${e.noPadding?"no-padding":""} ${this.component?.cssClasses??""}"
                     role="dialog"
                     aria-modal="${e.modeless?"false":"true"}"
                     aria-label="${t||"Dialog"}"
                     style="${r} ${this.component?.style??""}">
                    ${a?n`
                        <div class="dialog-header">
                            <mateu-event-interceptor .target="${this}" style="flex:1; min-width:0;">
                                ${t?n`<span class="dialog-title">${t}</span>`:d}
                                ${e.header?x(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):d}
                            </mateu-event-interceptor>
                            ${e.closeButtonOnHeader?n`<button class="dialog-close" @click="${this.close}" aria-label="Close">✕</button>`:d}
                        </div>`:d}
                    ${e.content?n`
                        <div class="dialog-body">
                            <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width:100%;">
                                ${x(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:d}
                    ${e.footer?n`
                        <div class="dialog-footer">
                            <mateu-event-interceptor .target="${this}" style="width:100%;">
                                ${x(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:d}
                </div>
            </div>
        `}};Ii.styles=[k`
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
    `,Ta];Ld([b()],Ii.prototype,"opened",2);Ii=Ld([_("mateu-dialog")],Ii);var Ub=Object.defineProperty,jb=Object.getOwnPropertyDescriptor,sr=(e,t,a,r)=>{for(var i=r>1?void 0:r?jb(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Ub(t,a,i),i};let Oe=class extends la{constructor(){super(...arguments),this.opened=!1,this.maximizeSteps=0,this.collapsed=!1,this.pagerMenuOpen=!1,this.onGuidedProgress=e=>{const t=e.detail;t&&t.total>0&&(this.guidedProgress=t)},this.close=()=>{this.opened=!1,this.releaseLayoutInset(),this.releaseFocusTrap(),setTimeout(()=>{this.removeSelfFromOwnerChildren()||this.parentElement?.removeChild(this)},300)},this._escListener=e=>{if(e.key!=="Escape")return;const a=this.getRootNode().querySelectorAll("mateu-drawer, mateu-dialog");a[a.length-1]===this&&(e.stopPropagation(),this.close())}}jumpToStep(e){if(this.pagerMenuOpen=!1,!e)return;(this.renderRoot.querySelector(".content mateu-component")??this.renderRoot.querySelector("mateu-component"))?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"goToStep",parameters:{_stepId:e}},bubbles:!0,composed:!0}))}effectiveWidth(e){if(e.width)return e.width;if(!e.size)return;const t=Oe.SIZE_LADDER,a=Math.max(0,t.indexOf(e.size)),r=Math.min(t.length-1,a+this.maximizeSteps);return Oe.SIZE_WIDTHS[t[r]]}canMaximize(e){if(!e.maximizable)return!1;const t=Oe.SIZE_LADDER;return Math.max(0,t.indexOf(e.size??"m"))+this.maximizeSteps<t.length-1}firstUpdated(){requestAnimationFrame(()=>this.opened=!0),this.addEventListener("mateu-guided-progress",this.onGuidedProgress);const e=this.component?.metadata;e&&requestAnimationFrame(()=>this.applyLayoutInset(e))}releaseFocusTrap(){this.focusTrap?.release(),this.focusTrap=void 0}applyLayoutInset(e){if(!e.layout)return;const t=document.querySelector("mateu-ui");if(!t)return;const a=e.position??"end",r=a==="bottom"?"var(--mateu-drawer-height, 50vh)":this.effectiveWidth(e)??"648px";this._insetProp=a==="start"?"paddingLeft":a==="bottom"?"paddingBottom":"paddingRight",t.style.transition="padding .25s ease",t.style[this._insetProp]=r}releaseLayoutInset(){if(!this._insetProp)return;const e=document.querySelector("mateu-ui");e&&(e.style[this._insetProp]=""),this._insetProp=void 0}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const i=this.component.metadata;this.state=i.initialData}const t=this.component?.metadata,a=this.renderRoot.querySelector('[role="dialog"]');this.opened&&!!a&&!t?.modeless&&!t?.layout&&!this.focusTrap?this.focusTrap=co(a):this.focusTrap&&this.opened&&this.focusTrap.refresh()}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._escListener)}disconnectedCallback(){document.removeEventListener("keydown",this._escListener),this.releaseLayoutInset(),this.releaseFocusTrap(),super.disconnectedCallback()}render(){const e=this.component.metadata,t=e.position??"end",a=gr(e.headerTitle,this.state,this.data,this.appState,this.appData),r=gr(e.subtitle,this.state,this.data,this.appState,this.appData),i=this.effectiveWidth(e),s=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0;return n`
        ${e.modeless||e.layout?d:n`
            <div class="backdrop ${this.opened?"open":""}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${t} ${this.opened?"open":""} ${this.collapsed?"collapsed":""} ${this.component?.cssClasses??""}"
                role="dialog"
                aria-modal="${!e.modeless}"
                aria-label="${a??d}"
                style="${i&&t!=="bottom"?`width: ${i};`:""}${this.component?.style??""}"
        >
            <header>
                ${a?n`<div class="titles"><h3>${a}</h3>${r?n`<span class="subtitle">${r}</span>`:d}</div>`:n`<span class="spacer"></span>`}
                ${this.guidedProgress&&this.guidedProgress.total>1?n`
                    <div class="guided-pager-wrap">
                        <button class="guided-pager" aria-haspopup="true" aria-expanded="${this.pagerMenuOpen}"
                                aria-label="Step ${this.guidedProgress.current} of ${this.guidedProgress.total}"
                                @click="${()=>this.pagerMenuOpen=!this.pagerMenuOpen}">${this.guidedProgress.current} | ${this.guidedProgress.total}<span class="caret">▾</span></button>
                        ${this.pagerMenuOpen&&this.guidedProgress.steps?n`
                            <div class="guided-pager-menu">
                                ${this.guidedProgress.steps.map((o,l)=>n`
                                    <button class="guided-pager-item ${o.status}" ?disabled="${o.status!=="done"}"
                                            @click="${()=>this.jumpToStep(o.id)}"><span class="pager-dot">${o.status==="done"?"✓":l+1}</span>${o.title??`Step ${l+1}`}</button>
                                `)}
                            </div>
                        `:d}
                    </div>
                `:d}
                ${e.header?n`
                    <mateu-event-interceptor .target="${this}">${x(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
                ${s?n`
                    <button class="drawer-icon" aria-label="${s.prevLabel??"Previous"}" title="${s.prevLabel??"Previous"}"
                            ?disabled="${!s.prevRoute}" @click="${()=>{s.prevRoute&&(window.location.href=s.prevRoute)}}">‹</button>
                    <button class="drawer-icon" aria-label="${s.nextLabel??"Next"}" title="${s.nextLabel??"Next"}"
                            ?disabled="${!s.nextRoute}" @click="${()=>{s.nextRoute&&(window.location.href=s.nextRoute)}}">›</button>
                `:d}
                ${e.collapsible?n`
                    <button class="drawer-icon" aria-label="${this.collapsed?"Expand":"Collapse"}" title="${this.collapsed?"Expand":"Collapse"}"
                            @click="${()=>this.collapsed=!this.collapsed}">${this.collapsed?"▴":"▾"}</button>
                `:d}
                ${this.canMaximize(e)?n`
                    <button class="drawer-icon" aria-label="Maximize" title="Maximize" @click="${()=>this.maximizeSteps++}">⤢</button>
                `:d}
                <button class="drawer-close" aria-label="Close" @click="${this.close}">✕</button>
            </header>
            ${this.collapsed?d:n`
            <div class="content ${e.noPadding?"no-padding":""}">
                ${e.content?n`
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${x(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
            </div>
            ${e.footer?n`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${x(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:d}
            `}
        </section>
       `}};Oe.SIZE_LADDER=["s","m","l","xl"];Oe.SIZE_WIDTHS={s:"464px",m:"648px",l:"968px",xl:"90vw"};Oe.styles=[k`
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
  `,Ta];sr([b()],Oe.prototype,"opened",2);sr([b()],Oe.prototype,"maximizeSteps",2);sr([b()],Oe.prototype,"collapsed",2);sr([b()],Oe.prototype,"guidedProgress",2);sr([b()],Oe.prototype,"pagerMenuOpen",2);Oe=sr([_("mateu-drawer")],Oe);var Hb=Object.defineProperty,Wb=Object.getOwnPropertyDescriptor,$e=(e,t,a,r)=>{for(var i=r>1?void 0:r?Wb(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Hb(t,a,i),i};const Vb="(max-width: 599px)";function cn(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let ce=class extends I{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocPlacement="column",this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,a=t.banners??[],r=t.append??!1;r?this.actionBanners=[...this.actionBanners,...a]:(this._clearActionBannerTimers(),this.actionBanners=a);const i=r?this.actionBanners.length-a.length:0;a.forEach((s,o)=>{if(s.timeoutSeconds&&s.timeoutSeconds>0){const l=i+o;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,u)=>u!==l)},s.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const a=parseInt(t[1],10)-1;a>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(a))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,a=this.shadowRoot?.querySelector("mateu-content-header");let r=a?a.getBoundingClientRect().bottom:0;const i=this._tocBar();i&&(r=Math.max(r,i.getBoundingClientRect().bottom));for(const l of e){if(!l.classList.contains("mateu-section--sticky"))continue;const c=l.getBoundingClientRect();c.top<=r+t+2&&(r=Math.max(r,c.bottom))}const s=r+t+4;let o=0;this._tocEntries.forEach((l,c)=>{l.el.getBoundingClientRect().top<=s&&(o=c)}),this._activeToc=o}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy(),this._syncAside(!1)}_alignAside(){const e=this.shadowRoot?.querySelector(".page-body");if(!e||this._workEnd===void 0)return;const t=Math.max(0,Math.round(this._workEnd-e.getBoundingClientRect().right));this.style.setProperty("--mateu-toc-shift",`${t}px`)}_syncAside(e){e&&!this._releaseAside?this._releaseAside=Sm(this,(t,a)=>{this._workEnd=a,t==="aside"&&requestAnimationFrame(()=>this._alignAside()),t!==this._tocPlacement&&(this._tocPlacement=t,requestAnimationFrame(()=>this._layoutStickyTops()))}):!e&&this._releaseAside&&(this._releaseAside(),this._releaseAside=void 0,this._tocPlacement="column")}updated(e){if(super.updated(e),this.toggleAttribute("data-hero-top",this._heroOnTop()),this.toggleAttribute("data-crud-page",this._hasCrud()),e.has("_activeToc")&&this._revealActiveInBar(),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")){const t=this.component?.metadata?.level??0;this.toggleAttribute("data-nested",t>0),this._scheduleStaticBannerTimeouts();const a=this.component?.metadata?.pageWidth==="edgeToEdge";this.toggleAttribute("data-edge",a),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")||a},bubbles:!0,composed:!0})),this._scheduleTocRebuild()}}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(a=>clearTimeout(a)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((a,r)=>{a.timeoutSeconds&&a.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,r])},a.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,a)=>a!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return G(e,this.state,this.data)}_renderBanner(e,t){const a=this._evalBannerText(e.title),r=this._evalBannerText(e.description);return n`
            <div class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${a||e.hasCloseButton?n`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${a??""}</span>
                        ${e.hasCloseButton?n`
                            <button class="banner-close" @click=${t} title="Dismiss" aria-label="Dismiss">✕</button>
                        `:d}
                    </div>
                `:d}
                ${r?n`<p>${r}</p>`:d}
            </div>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(".mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(s=>({title:this._sectionTitle(s),el:s})).filter(s=>!!s.title),a=this.component?.metadata?.toc,r=t.length>4&&e.every(s=>!s.closest("vaadin-horizontal-layout")),i=(a===!0?!0:a===!1?!1:r)&&t.length>0;this._tocEntries=t,this._tocVisible=i,this._syncAside(i&&!this.hasAttribute("data-nested")),this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),i?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header"),t=!window.matchMedia?.(Vb).matches,a=this._tocVisible&&e&&t?e.offsetHeight:0;this.style.setProperty("--mateu-header-h",a+"px"),this._headerH=a+(this._tocBar()?.offsetHeight??0);const r=12;let i=this._headerH+r;for(const s of this._sectionCards())s.classList.contains("mateu-section--sticky")&&(s.style.top=i+"px",i+=s.offsetHeight+r)}_revealActiveInBar(){const e=this._tocBar()?.querySelector("nav"),t=e?.querySelector(".page-toc__item.is-active");if(!e||!t)return;const a=t.offsetLeft-e.offsetLeft;(a<e.scrollLeft||a+t.offsetWidth>e.scrollLeft+e.clientWidth)&&e.scrollTo({left:Math.max(0,a-16),behavior:"smooth"})}_tocBar(){return this._tocVisible&&this._tocPlacement==="bar"?this.shadowRoot?.querySelector(".page-toc"):null}_scrollContainer(){let e=cn(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=cn(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const a=12;let r=this._headerH+a;for(const l of this._sectionCards()){if(l===t.el)break;l.classList.contains("mateu-section--sticky")&&(r+=l.offsetHeight+a)}const i=this._scrollContainer(),s=i?i.getBoundingClientRect().top:0,o=t.el.getBoundingClientRect().top-s-r;(i??window).scrollBy({top:o,behavior:"smooth"})}_showHeaderBand(){const e=this.component?.metadata;return!!(e?.title||e?.subtitle||e?.overline||e?.titlePlaceholder||e?.toolbar?.length)&&!this._hasCrud()&&!this._hasWelcomeBanner()}_hasCrud(){return!!this.component?.children?.some(e=>e.metadata?.type===v.Crud)}_heroOnTop(){const e=this.component?.metadata;return!!!(e?.title||e?.subtitle||e?.overline||e?.titlePlaceholder||e?.toolbar?.length)&&this._hasWelcomeBanner()}_hasWelcomeBanner(){const e=t=>t?.metadata?.type===v.HeroSection?!0:(t?.children??[]).some(e);return(this.component?.children??[]).some(e)}render(){const e=this.component?.metadata,r=[...(e?.banners??[]).map((s,o)=>({banner:s,index:o})).filter(({index:s})=>!this.dismissedStaticBannerIndices.has(s)).map(({banner:s,index:o})=>({banner:s,onDismiss:()=>this._dismissStaticBanner(o)})),...this.actionBanners.map((s,o)=>({banner:s,onDismiss:()=>this._dismissActionBanner(o)}))],i=n`
            <!-- The pin goes on the wrapper, not on the header inside it: a sticky element only sticks
                 within its parent, and the wrapper is exactly as tall as the header, so a pinned
                 header scrolled away with it and the index's scrollspy never left its first entry. -->
            <div class="page-header-wrap ${this._tocVisible?"sticky-header":""}">
                <mateu-content-header
                    .metadata="${e}"
                    .baseUrl="${this.baseUrl}"
                    .state="${this.state}"
                    .data="${this.data}"
                    .appState="${this.appState}"
                    .appData="${this.appData}"
                ></mateu-content-header>
                ${this._showHeaderBand()?n`
                    <div class="page-header-band" aria-hidden="true"></div>
                `:d}
            </div>
            ${r.length>0?n`
                <div class="page-banners">
                    ${r.map(({banner:s,onDismiss:o})=>this._renderBanner(s,o))}
                </div>
            `:d}
            <div class="page-body ${this._tocVisible?`with-toc toc-${this._tocPlacement}`:""}">
                <div class="form-content">
                    <slot @slotchange=${this._onSlotChange}></slot>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem);" class="form-buttons">
                        <slot name="buttons"></slot>
                    </div>
                </div>
                ${this._tocVisible?n`
                    <aside class="page-toc" aria-label="Sections">
                        <nav>
                            ${this._tocEntries.map((s,o)=>n`
                                <a class="page-toc__item ${o===this._activeToc?"is-active":""}"
                                   @click=${()=>this._scrollToSection(o)}
                                   title=${o<9?`${s.title} (Ctrl+Alt+${o+1})`:s.title}>
                                    <span class="page-toc__label">${s.title}</span>
                                    ${o<9?n`<span class="page-toc__key">${o+1}</span>`:d}
                                </a>
                            `)}
                        </nav>
                    </aside>
                `:d}
            </div>
            <div class="form-footer">
                ${e?.footer?.map(s=>x(this,s,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return n`<div style="display: flex; flex-direction: column; width: 100%;">${i}</div>`}};ce.styles=[k`
        /* the welcome hero takes a top gap (heroRenderer) only when nothing is above it: under a
           page header it sits where the header leaves it */
        :host(:not([data-hero-top])) {
            --mateu-hero-margin-top: 0px;
        }

        /* Design-system hook: background behind the page header (the RDS "Header + Background"
           band) — transparent by default; the Redwood renderer paints it with the canvas color
           via a custom property, so the header reads as part of the canvas and the content slab
           starts at the color strip below. */
        .page-header-wrap {
            background: var(--mateu-page-header-bg, transparent);
        }

        /* an edge page (declared or inferred) in a shell without padded content: the header keeps
           the shell's content gutter (mateu-ux sets --mateu-edge-header-gutter) */
        .page-header-wrap,
        .page-banners {
            padding-inline: var(--mateu-edge-header-gutter, 0px);
        }

        /* edgeToEdge (RDS): the shell drops its gutters (no-padding hook) so the CONTENT
           bleeds, but the page header + banners keep their own gutter — like the Redwood
           anatomy, where only the content band reaches the edges. */
        :host([data-edge]) .page-header-wrap,
        :host([data-edge]) .page-banners {
            padding-left: var(--mateu-shell-gutter, 2rem);
            padding-right: var(--mateu-shell-gutter, 2rem);
        }

        /* The accent strip of a listing goes on top of its results, drawn by the crud itself
           (mateu-table-crud .crud-band): only the crud that IS this page's listing draws it, not
           one embedded further down, nor any crud in a nested page. */
        :host {
            --mateu-crud-band-h: 0px;
        }
        :host([data-crud-page]) {
            --mateu-crud-band-h: var(--mateu-page-band-h, 0px);
        }
        :host([data-nested]) {
            --mateu-crud-band-h: 0px;
        }

        .page-header-band {
            width: 100%;
            /* clear of the header's buttons when there is a strip; no gap at all when there is none */
            margin-top: calc(var(--mateu-page-band-h, 0px) * 0.8);
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
            .page-body.with-toc.toc-column {
                grid-template-columns: 1fr;
            }
            .toc-column .page-toc {
                display: none;
            }
        }

        /* In the aside channel: OUTSIDE the work area, to its right — the content view leaves the
           room (fabRail.ts: an inset, the 15rem index and its 2rem gap), and the index takes it by
           overflowing a zero-width track. Still sticky, under the pinned header, and short enough
           to leave the FABs at the bottom of the same channel clear. */
        .page-body.with-toc.toc-aside {
            grid-template-columns: minmax(0, 1fr) 0;
            gap: 0;
        }
        .toc-aside .page-toc {
            width: 15rem;
            box-sizing: border-box;
            margin-inline-start: calc(2rem + var(--mateu-toc-shift, 0px));
            max-height: calc(100vh - var(--mateu-header-h, 0px) - 8rem - var(--mateu-fab-slots, 0) * 3.25rem);
        }

        /* No aside (edge-to-edge, narrow): the index folds into a bar over the form — the sections
           in a row that scrolls sideways, pinned under the header, the active one underlined. The
           horizontal form of the same navigator, as Redwood does on a narrow screen: every section
           one tap away, the reading position still shown, no width taken from the form. */
        .page-body.with-toc.toc-bar {
            grid-template-columns: minmax(0, 1fr);
            gap: 0;
        }
        .toc-bar .page-toc {
            order: -1;
            top: var(--mateu-header-h, 0px);
            max-height: none;
            overflow: visible;
            z-index: 4;
            background: var(--lumo-base-color, #fff);
            margin-bottom: var(--lumo-space-m, 1rem);
        }
        .toc-bar .page-toc nav {
            flex-direction: row;
            overflow-x: auto;
            scrollbar-width: none;
            gap: 0.25rem;
            border-left: none;
            border-bottom: 1px solid var(--lumo-contrast-10pct);
            padding-left: 0;
        }
        .toc-bar .page-toc__item {
            flex: none;
            margin-left: 0;
            border-left: none;
            border-bottom: 2px solid transparent;
            border-radius: 0;
            padding: 0.5rem 0.75rem;
        }
        .toc-bar .page-toc__item.is-active {
            border-bottom-color: var(--lumo-primary-color);
        }
        .toc-bar .page-toc__label {
            overflow: visible;
        }
        .toc-bar .page-toc__key {
            display: none;
        }

        /* A phone: the page header scrolls away with the page and the section bar is one compact
           line — pinned, scrolling sideways, still marking the active section. */
        @media (max-width: 599px) {
            .page-header-wrap.sticky-header {
                position: static;
            }
            .toc-bar .page-toc {
                top: 0;
                margin-bottom: var(--lumo-space-s, 0.5rem);
            }
            .toc-bar .page-toc__item {
                padding: 0.3rem 0.6rem;
                font-size: var(--lumo-font-size-xs, 0.8125rem);
                line-height: 1.4;
            }
        }

        .page-banners {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding-block: 1rem 0.5rem;
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
    `,Ta];$e([h()],ce.prototype,"component",2);$e([h()],ce.prototype,"baseUrl",2);$e([h()],ce.prototype,"state",2);$e([h()],ce.prototype,"data",2);$e([h()],ce.prototype,"appState",2);$e([h()],ce.prototype,"appData",2);$e([h()],ce.prototype,"value",2);$e([h({type:Boolean})],ce.prototype,"standalone",2);$e([b()],ce.prototype,"actionBanners",2);$e([b()],ce.prototype,"dismissedStaticBannerIndices",2);$e([b()],ce.prototype,"_tocEntries",2);$e([b()],ce.prototype,"_activeToc",2);$e([b()],ce.prototype,"_tocVisible",2);$e([b()],ce.prototype,"_tocPlacement",2);ce=$e([_("mateu-page")],ce);function Gb(e){if(!e)return;const t=e.trim();if(!(!t.startsWith("/")||t.startsWith("//")))return t}function Kb(e,t){if(!e||(t.button??0)!==0||t.ctrlKey||t.metaKey||t.shiftKey||t.altKey)return;const a=e.getAttribute("target");if(!(a&&a!=="_self"))return Gb(e.getAttribute("href"))}function Yb(e,t){const a=t.split(/[?#]/)[0];let r,i=-1;const s=o=>{for(const l of o??[]){if(l.separator)continue;if(l.submenus?.length){s(l.submenus);continue}if(l.remote)continue;const c=(l.route??"").split(/[?#]/)[0];!c||c==="/"||(a===c||a.startsWith(c.endsWith("/")?c:c+"/"))&&c.length>i&&(r=l,i=c.length)}};if(s(e),!!r)return{route:t,consumedRoute:r.consumedRoute??"",actionId:"",baseUrl:r.baseUrl??"",serverSideType:r.serverSideType,uriPrefix:r.uriPrefix}}const po=k`
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
`,or=e=>me`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,Dd=or(me`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),Md=or(me`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),Nd=or(me`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`);or(me`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`);const Jb=or(me`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`);or(me`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);function Fd(e,t,a=new Set){if(!(!e||typeof e!="object"||a.has(e))){a.add(e),Array.isArray(e)||t(e);for(const r of Array.isArray(e)?e:Object.values(e))r&&typeof r=="object"&&Fd(r,t,a)}}const Xb=e=>e&&e.metadata&&typeof e.metadata.type=="string"?e.metadata.type:void 0;function Qb(e,t){if(!e||typeof e!="object")return{fields:[],actions:[]};const a=[],r=new Map;let i;Fd(e,f=>{const g=Xb(f);g==="FormField"&&f.metadata.fieldId?a.push(f.metadata):g==="Page"&&!i?i=f.metadata:g==="Button"&&f.metadata.actionId&&(r.has(f.metadata.actionId)||r.set(f.metadata.actionId,f.metadata.label))});const s=t&&typeof t=="object"?t:e.initialData&&typeof e.initialData=="object"?e.initialData:{},o=new Set,l=[];for(const f of a){if(o.has(f.fieldId))continue;o.add(f.fieldId);const g={id:f.fieldId,label:f.label??f.fieldId,dataType:f.dataType??"string",stereotype:f.stereotype??"regular",required:!!f.required,readOnly:!!f.readOnly};s&&Object.prototype.hasOwnProperty.call(s,f.fieldId)&&(g.value=s[f.fieldId]),Array.isArray(f.options)&&f.options.length&&(g.options=f.options.map(y=>y&&typeof y=="object"?{value:y.value,label:y.label??String(y.value??"")}:{value:y,label:String(y)})),l.push(g)}const c=[],u=new Set;for(const f of Array.isArray(e.actions)?e.actions:[]){if(!f||!f.id||u.has(f.id))continue;u.add(f.id);const g={id:f.id,label:r.get(f.id)??f.id};f.shortcut&&(g.shortcut=f.shortcut),c.push(g)}for(const[f,g]of r)u.has(f)||(u.add(f),c.push({id:f,label:g??f}));const p={fields:l,actions:c},m=i&&(i.pageTitle||i.title)||void 0;return m&&(p.title=m),e.route&&(p.route=e.route),e.serverSideType&&(p.serverSideType=e.serverSideType),(e.pageType||i&&i.pageType)&&(p.pageType=e.pageType||i.pageType),p}function Zb(e){const t=[],a=r=>{const i=r.shadowRoot??r;i.querySelectorAll?.("mateu-component")?.forEach(o=>{const l=o.component;l&&t.push(l),o.shadowRoot&&a(o)}),i.querySelectorAll?.("*").forEach(o=>{o.shadowRoot&&o.tagName!=="MATEU-COMPONENT"&&a(o)})};return a(e),t}function e0(e=document,t){let a=null,r=-1;for(const i of Zb(e)){const s=Qb(i,t),o=s.fields.length+s.actions.length+(s.title?1:0);o>r&&(a=s,r=o)}return a}class t0{constructor(){this.buffer="",this.data=[],this.hasData=!1}push(t){this.buffer+=t;const a=[];for(;;){const r=/\r\n|\r|\n/.exec(this.buffer);if(!r||r[0]==="\r"&&r.index===this.buffer.length-1)break;const i=this.buffer.slice(0,r.index);this.buffer=this.buffer.slice(r.index+r[0].length),this.line(i,a)}return a}end(){const t=[];return this.buffer&&(this.line(this.buffer.replace(/\r$/,""),t),this.buffer=""),this.dispatch(t),t}line(t,a){if(t===""){this.dispatch(a);return}if(t.startsWith(":"))return;const r=t.indexOf(":");if((r<0?t:t.slice(0,r))!=="data")return;let s=r<0?"":t.slice(r+1);s.startsWith(" ")&&(s=s.slice(1)),this.data.push(s),this.hasData=!0}dispatch(t){this.hasData&&t.push(this.data.join(`
`)),this.data=[],this.hasData=!1}}const qd=e=>typeof e=="number"&&Number.isFinite(e);function a0(e){const t=e.trim();if(t.startsWith("{")){let a=null;try{const r=JSON.parse(t);r&&typeof r=="object"&&!Array.isArray(r)&&(a=r)}catch{}if(a){if("inputTokens"in a||"outputTokens"in a||"totalTokens"in a)return{kind:"usage",usage:a};if(typeof a.event=="string"){const r=a.detail??{};switch(a.event){case"agent-delta":return{kind:"delta",text:typeof r.text=="string"?r.text:""};case"agent-status":return{kind:"status",detail:r};case"agent-tool":return{kind:"tool",detail:r};case"agent-error":return{kind:"error",message:String(r.message??"Error desconocido del agente")};default:return{kind:"event",event:a.event,detail:a.detail??{}}}}}}return{kind:"text",text:e}}function r0(e){if(!e)return!0;const t=[e.inputTokens,e.outputTokens,e.totalTokens].filter(qd);return t.length===0||t.every(a=>a===0)}class i0{constructor(){this.text="",this.streamed=!1}delta(t){return this.text+=t,this.streamed=!0,this.text}line(t){return this.streamed?(this.text=t,this.streamed=!1):this.text=this.text?this.text+`
`+t:t,this.text}error(t){return this.text="⚠️ "+t,this.streamed=!1,this.text}}class s0{constructor(t){this.steps=[],this.answering=!1,this.reported=!1,this.since=t}status(t,a){this.reported=!0;const r=typeof t.text=="string"?t.text:void 0;(t.phase!==this.phase||r!==this.statusText||this.answering)&&(this.since=a),this.phase=t.phase,this.statusText=r,this.answering=!1}tool(t,a){this.reported=!0;const r=t.name??"herramienta";if(t.phase==="start"){this.steps=[...this.steps,{name:r,server:t.server,kind:t.kind,running:!0}],this.since=a,this.answering=!1;return}const i=this.steps.slice();let s=i.length-1;for(;s>=0&&!(i[s].running&&i[s].name===r);)s--;const o={name:r,server:t.server,kind:t.kind,ms:t.ms,error:t.error,running:!1};s>=0?i[s]=o:i.push(o),this.steps=i,this.since=a}text(t){this.answering||(this.since=t),this.answering=!0}get runningTool(){for(let t=this.steps.length-1;t>=0;t--)if(this.steps[t].running)return this.steps[t]}line(t){const a=Math.max(0,Math.floor((t-this.since)/1e3)),r=s=>a>0?`${s} ${a} s`:s,i=this.runningTool;return i?r(`Llamando a ${i.name}…`):this.answering?"Respondiendo…":this.reported?r(this.statusText||"Pensando…"):null}}function o0(e){return qd(e)?e<1e3?`${Math.round(e)} ms`:`${(e/1e3).toFixed(1).replace(".",",")} s`:""}const n0={en:{title:"Assistant",expand:"Widen the assistant",restore:"Restore the width",close:"Close the assistant",resize:"Assistant width",empty:"Ask whatever you need: about this screen, your data or how to do something.",placeholder:"Write a message…",send:"Send",dictate:"Dictate",stopDictation:"Stop dictation"},es:{title:"Asistente",expand:"Ampliar el asistente",restore:"Ancho normal",close:"Cerrar el asistente",resize:"Ancho del asistente",empty:"Pregunta lo que necesites: sobre esta pantalla, tus datos o cómo hacer algo.",placeholder:"Escribe un mensaje…",send:"Enviar",dictate:"Dictar",stopDictation:"Detener dictado"}},l0=e=>(typeof document<"u"&&document.documentElement?.lang||typeof navigator<"u"&&navigator.language||"").toLowerCase().startsWith("es")?"es":"en",Pt=(e,t)=>n0[l0()][e],d0="Ctrl+Shift+M",c0="Control+Shift+M",u0=e=>{if(!e||!e.ctrlKey||!e.shiftKey||e.altKey||e.metaKey||e.repeat)return!1;const t=typeof e.key=="string"?e.key:"";return/^[a-z]$/i.test(t)?t.toLowerCase()==="m":e.code==="KeyM"},un=(e,t)=>`${Pt(e?"stopDictation":"dictate")} (${d0})`,dt={default:460,min:320,max:720},h0=60,Bd="mateu-chat-width",ji=e=>e==null||!Number.isFinite(e)?dt.default:Math.round(Math.min(dt.max,Math.max(dt.min,e))),Ud=()=>{try{return typeof localStorage>"u"?void 0:localStorage}catch{return}},p0=(e=Ud())=>{try{const t=e?.getItem(Bd);return t?ji(Number(t)):dt.default}catch{return dt.default}},rs=(e,t=Ud())=>{const a=ji(e);try{t?.setItem(Bd,String(a))}catch{}return a},m0=(e,t,a,r=!1)=>ji(e+(r?t-a:a-t)),hn=24;var f0=Object.defineProperty,v0=Object.getOwnPropertyDescriptor,X=(e,t,a,r)=>{for(var i=r>1?void 0:r?v0(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&f0(t,a,i),i};const pn=e=>J.get()?.renderHeaderIconButton?.(e)??n`
        <button class="chat-header-btn ${e.cssClasses??""}" @click="${e.onClick}"
                title="${e.title??e.label}" aria-label="${e.label}">
            ${V(e.icon,"width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem);")}
        </button>`,mn=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],g0=e=>mn[Math.abs(e??0)%mn.length],b0=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let Y=class extends I{constructor(){super(...arguments),this.localAgentUrl="http://127.0.0.1:8776",this.localAgentAlive=!1,this.menu=[],this.chatSessionId=Ne(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.label=void 0,this.width=p0(),this.resizing=!1,this.dragStart=void 0,this.isRtl=()=>getComputedStyle(this).direction==="rtl",this.onResizeStart=e=>{e.button===0&&(e.preventDefault(),this.dragStart={x:e.clientX,width:this.width},this.resizing=!0,e.currentTarget.setPointerCapture?.(e.pointerId))},this.onResizeMove=e=>{this.dragStart&&(this.width=m0(this.dragStart.width,this.dragStart.x,e.clientX,this.isRtl()))},this.onResizeEnd=e=>{this.dragStart&&(this.dragStart=void 0,this.resizing=!1,e.currentTarget.releasePointerCapture?.(e.pointerId),this.width=rs(this.width))},this.onResizeKey=e=>{const t=this.isRtl()?"ArrowLeft":"ArrowRight",a=this.isRtl()?"ArrowRight":"ArrowLeft";let r;e.key===t?r=this.width+hn:e.key===a?r=this.width-hn:e.key==="Home"?r=dt.min:e.key==="End"&&(r=dt.max),r!==void 0&&(e.preventDefault(),this.width=rs(ji(r)))},this.onResizeReset=()=>{this.width=rs(dt.default)},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.progressTick=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onShortcutKeydown=e=>{!u0(e)||!this.panelOpen||!this.recognitionAvailable||(e.preventDefault(),this.startListening())},this.onSpeechResult=e=>{if(this.recognition){const t=e,a=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=a,this.send(new CustomEvent("submit",{detail:{value:a},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{const e=new AbortController,t=setTimeout(()=>e.abort(),1200),a=await fetch(this.localAgentUrl+"/health",{signal:e.signal});clearTimeout(t),this.localAgentAlive=a.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{const t=e.target,a=Array.from(t.files??[]);if(t.value="",!(!a.length||!this.uploadUrl)){this.uploading=!0;try{const r=new FormData;r.append("sessionId",this.chatSessionId);for(const p of a)r.append("files",p,p.name);const i={},s=localStorage.getItem("__mateu_auth_token");s&&(i.Authorization="Bearer "+s);const o=sessionStorage.getItem("__mateu_sesion_id");o&&(i["X-Session-Id"]=o);const l=await fetch(this.uploadUrl,{method:"POST",headers:i,body:r});if(!l.ok)throw new Error(`Upload failed: ${l.status}`);const u=((await l.json()).files??[]).filter(p=>p&&p.path);this.attachments=[...this.attachments,...u]}catch(r){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${r instanceof Error?r.message:r}`,"agent")}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim(),a=this.localAgentAlive?this.localAgentUrl+"/mateu/agent/stream":this.sseUrl,r=this.attachments;if(!t&&r.length===0||!a)return;const i=r.length?`${t}${t?`

`:""}📎 ${r.map(l=>l.name).join(", ")}`:t;this.addMessage(i,"user"),this.attachments=[];const s=this.addMessage("","agent");this.startLoading();let o="";try{const l=()=>{const P={Accept:"text/event-stream","Content-Type":"application/json"},R=localStorage.getItem("__mateu_auth_token");R&&(P.Authorization="Bearer "+R);const O=sessionStorage.getItem("__mateu_sesion_id");return O&&(P["X-Session-Id"]=O),P},c=this.contextProvider?.(),u=e0(document,c?.componentState),p=!!u&&(u.fields.length>0||u.actions.length>0||!!u.title),m=JSON.stringify({message:t,sessionId:this.chatSessionId,...r.length&&{attachments:r},...c!=null&&{context:c},...p&&{screen:u},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const f=()=>fetch(a,{method:"POST",headers:l(),body:m});let g=await f();if(g.status===401&&(g=await Jn(new Error("401"),f).catch(()=>g)),!g.ok){const P=await g.text();throw new Error(`Servidor respondió ${g.status}: ${P}`)}const y=g.body?.getReader();if(!y)throw new Error("No se pudo obtener el reader del stream.");const $=new TextDecoder,w=new t0,C=new i0,E=new s0(Date.now());this.progress=E;const A=P=>{const R=a0(P);switch(R.kind){case"usage":r0(R.usage)||(this.tokenUsage={...this.tokenUsage,...R.usage});return;case"delta":o=C.delta(R.text),E.text(Date.now());break;case"text":o=C.line(R.text),E.text(Date.now());break;case"error":o=C.error(R.message);break;case"status":E.status(R.detail,Date.now());break;case"tool":E.tool(R.detail,Date.now());break;case"event":this.dispatchEvent(new CustomEvent(R.event,{detail:R.detail,bubbles:!0,composed:!0}));return}this.progressTick++,(R.kind==="delta"||R.kind==="text"||R.kind==="error")&&this.updateMessage(s,o)};for(;;){const{done:P,value:R}=await y.read();if(P){w.push($.decode()),w.end().forEach(A);break}w.push($.decode(R,{stream:!0})).forEach(A)}o||this.updateMessage(s,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(l){console.error("Error en el flujo SSE:",l);const c=l?.message??String(l);(c==="Failed to fetch"||c==="network error"||c==="Load failed")&&!o?this.updateMessage(s,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(s,"⚠️ Error: "+c)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.onMessageClick=e=>{const t=e.composedPath().find(i=>i instanceof HTMLAnchorElement)??null,a=Kb(t,e);if(!a)return;e.preventDefault();const r=Yb(this.menu,a);r?this.dispatchEvent(new CustomEvent("navigation-requested",{detail:r,bubbles:!0,composed:!0})):mt(this,a)},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}updated(e){super.updated(e),e.has("width")&&this.style.setProperty("--mateu-chat-width",`${this.width}px`),this.style.getPropertyValue("--mateu-chat-wide")||this.style.setProperty("--mateu-chat-wide",`${h0}vw`)}get panelOpen(){return this.isConnected&&this.slot!=="detail-hidden"}connectedCallback(){super.connectedCallback(),this.probeLocalAgent(),window.addEventListener("keydown",this.onShortcutKeydown,!0);const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=a=>{console.error("Error de reconocimiento: "+a.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}disconnectedCallback(){window.removeEventListener("keydown",this.onShortcutKeydown,!0),super.disconnectedCallback()}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const a={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,a],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((a,r)=>r===e?{...a,text:t}:a),this.scrollBottom()}buildMenuContext(e,t=[]){const a=[];for(const r of e){if(r.separator||r.remote)continue;const i=[...t,r.label];if(r.submenus&&r.submenus.length>0)a.push(...this.buildMenuContext(r.submenus,i));else{const s={path:i,navigation:{route:r.route,consumedRoute:r.consumedRoute,actionId:r.actionId??"",baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix}};r.description&&(s.description=r.description),r.listing&&(s.listing=r.listing),a.push(s)}}return a}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,this.progress=void 0,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}progressLine(){return this.progress?.line(Date.now())??`Thinking… ${this.elapsedSeconds}s`}renderToolSteps(){const e=this.progress?.steps??[];return e.length?n`
            <ul class="tool-steps" aria-label="Herramientas usadas">
                ${e.map(t=>n`
                    <li class="tool-step ${t.running?"running":t.error?"failed":"done"}"
                        title="${t.server?`${t.name} (${t.server})`:t.name}">
                        <span class="tool-step-icon">${t.running?"…":t.error?"✕":"✓"}</span>
                        <span class="tool-step-name">${t.name}</span>
                        ${t.running?d:n`<span class="tool-step-time">${o0(t.ms)}</span>`}
                        ${t.error?n`<span class="tool-step-error">${t.error}</span>`:d}
                    </li>
                `)}
            </ul>
        `:d}render(){return n`
            <div class="chat-container">
                <div class="chat-header">
                    ${V("vaadin:comments-o","","chat-title-icon")}
                    <h2 class="chat-title">${this.label?.trim()||Pt("title")}</h2>
                    ${this.localAgentAlive?n`<span class="local-agent-badge" title="Hablando con tu CLI local (companion en ${this.localAgentUrl}) — sin api key">agente local</span>`:d}
                    <div class="chat-header-actions">
                        ${pn({icon:this.expanded?"vaadin:compress":"vaadin:expand-full",label:Pt(this.expanded?"restore":"expand"),cssClasses:"chat-expand",onClick:()=>this.toggleExpanded()})}
                        ${pn({icon:"lumo:cross",label:Pt("close"),cssClasses:"chat-close",onClick:()=>this.closeChat()})}
                    </div>
                </div>
                <div class="scroll-container">
                    ${this.items.length===0&&!this.loading?n`
                        <div class="chat-empty">
                            ${V("vaadin:comments-o","","chat-empty-icon")}
                            <p>${Pt("empty")}</p>
                        </div>`:d}
                    <div class="message-list" role="list" @click="${this.onMessageClick}">
                        ${this.items.map((e,t)=>n`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${g0(e.userColorIndex)};">${b0(e.userName)}</div>
                                <div class="message-body">
                                    <div class="message-meta">
                                        <span class="message-name">${e.userName}</span>
                                        <span class="message-time">${e.time}</span>
                                    </div>
                                    <mateu-markdown class="message-text" .content="${e.text??""}"></mateu-markdown>
                                    ${t===this.items.length-1&&this.loading?this.renderToolSteps():d}
                                </div>
                            </div>
                        `)}
                    </div>
                </div>
                ${this.tokenUsage?n`
                    <div class="token-bar">
                        <span class="token-label">Tokens:</span>
                        ${this.tokenUsage.inputTokens!=null?n`<span class="token-chip">in&nbsp;<strong>${this.tokenUsage.inputTokens}</strong></span>`:d}
                        ${this.tokenUsage.outputTokens!=null?n`<span class="token-chip">out&nbsp;<strong>${this.tokenUsage.outputTokens}</strong></span>`:d}
                        ${this.tokenUsage.totalTokens!=null?n`<span class="token-chip">total&nbsp;<strong>${this.tokenUsage.totalTokens}</strong></span>`:d}
                    </div>
                `:d}
                ${this.loading?n`
                    <div class="loading-bar">
                        <span class="spinner"></span>
                        <span class="loading-text">${this.progressLine()}</span>
                    </div>
                `:d}
                ${this.attachments.length?n`
                    <div class="attachments">
                        ${this.attachments.map(e=>n`
                            <span class="attachment-chip" title="${e.path}">
                                📎 ${e.name}
                                <button class="attachment-remove" @click="${()=>this.removeAttachment(e.path)}" aria-label="Quitar ${e.name}">✕</button>
                            </span>`)}
                    </div>
                `:d}
                <div class="input-bar">
                    ${this.uploadUrl?n`
                        <button class="mic-btn" title="Adjuntar ficheros"
                                @click="${this.pickFiles}" ?disabled="${this.uploading}"
                                aria-label="Adjuntar ficheros">${this.uploading?"…":"📎"}</button>
                        <input class="file-input" type="file" multiple hidden
                               @change="${this.onFilesPicked}"/>
                    `:d}
                    <button class="mic-btn"
                            title="${un(this.listening)}"
                            aria-label="${un(this.listening)}"
                            aria-keyshortcuts="${c0}"
                            aria-pressed="${this.listening?"true":"false"}"
                            style="color: ${this.listening?"red":"var(--lumo-contrast-50pct, #767676)"};"
                            @click="${this.startListening}"
                            ?disabled="${!this.recognitionAvailable}"
                    >${Jb}</button>
                    <input class="msg-input"
                           placeholder="${Pt("placeholder")}"
                           aria-label="${Pt("placeholder")}"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">${Pt("send")}</button>
                </div>
                <div class="resize-handle ${this.resizing?"resizing":""}" role="separator"
                     aria-orientation="vertical" tabindex="0" aria-label="${Pt("resize")}"
                     aria-valuemin="${dt.min}" aria-valuemax="${dt.max}" aria-valuenow="${this.width}"
                     @pointerdown="${this.onResizeStart}" @pointermove="${this.onResizeMove}"
                     @pointerup="${this.onResizeEnd}" @pointercancel="${this.onResizeEnd}"
                     @keydown="${this.onResizeKey}" @dblclick="${this.onResizeReset}"></div>
            </div>
        `}};Y.styles=[po,k`
        :host {
            display: block;
            height: 100%;
            /* border-box, because the app shell sets padding on this host inline (appRenderer adds
               padding-top so the panel clears the header). Under the default content-box that
               padding is ADDED to the 100%, so the panel ends up taller than the slot that holds
               it and the overflow falls off the bottom of the viewport — which is where the input
               bar lives, so the mic, the field and Send were all clipped when opened. */
            box-sizing: border-box;
        }

        /* Wide mode (⤢): the shell gives the panel ~60% of the viewport (mateu-app's styles,
           --mateu-chat-wide); the conversation keeps a readable measure inside it. */
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
            position: relative;
            height: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: var(--lumo-base-color, #fff);
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

        /* The panel's header: its icon and title (a panel title, not a caption), then the
           expand/close buttons grouped at the end — tertiary icon buttons like the app header's. */
        .chat-header {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-s, .5rem);
            min-height: var(--lumo-size-l, 2.75rem);
            padding: 0.25rem 0.5rem 0.25rem 1rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, .1));
            flex-shrink: 0;
        }
        .chat-title-icon {
            flex-shrink: 0;
            width: var(--lumo-icon-size-m, 1.5rem);
            height: var(--lumo-icon-size-m, 1.5rem);
            color: var(--lumo-primary-text-color, #1676f3);
        }
        .chat-title {
            margin: 0;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: var(--lumo-font-size-l, 1.125rem);
            font-weight: 600;
            line-height: var(--lumo-line-height-xs, 1.25);
            color: var(--lumo-header-text-color, #1a1a1a);
        }
        .chat-header-actions {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-xs, .25rem);
            margin-inline-start: auto;
            flex-shrink: 0;
        }
        .chat-header-actions > * {
            margin: 0;
            color: var(--mateu-header-icon-color, var(--lumo-secondary-text-color, #5a6573));
        }
        .chat-header-btn {
            border: none;
            background: transparent;
            cursor: pointer;
            font: inherit;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: var(--lumo-size-m, 2.25rem);
            min-height: var(--lumo-size-m, 2.25rem);
            border-radius: var(--lumo-border-radius-m, 6px);
        }
        .chat-header-btn:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .05));
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .chat-header-btn:focus-visible {
            outline: 2px solid var(--lumo-primary-color-50pct, rgba(22, 118, 243, .5));
            outline-offset: 1px;
        }

        /* Before the first message: what the panel is for. */
        .chat-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--lumo-space-s, .5rem);
            padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem) 0;
            text-align: center;
            color: var(--lumo-secondary-text-color, #5a6573);
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .chat-empty p { margin: 0; max-width: 22rem; }
        .chat-empty-icon {
            width: var(--lumo-icon-size-l, 2.25rem);
            height: var(--lumo-icon-size-l, 2.25rem);
            color: var(--lumo-contrast-30pct, rgba(0, 0, 0, .3));
        }

        /* The edge on the panel's end side: drag it (or ←/→ on it) to resize between 320 and
           720px; a double click resets. Not in wide mode, nor on a phone, where the panel's width
           is the shell's. */
        .resize-handle {
            position: absolute;
            inset-block: 0;
            inset-inline-end: -4px;
            width: 8px;
            cursor: col-resize;
            touch-action: none;
            z-index: 2;
        }
        .resize-handle::after {
            content: '';
            position: absolute;
            inset-block: 0;
            inset-inline-start: 3px;
            width: 2px;
            background: transparent;
            transition: background-color .15s;
        }
        .resize-handle:hover::after, .resize-handle.resizing::after, .resize-handle:focus-visible::after {
            background: var(--lumo-primary-color-50pct, rgba(22, 118, 243, .5));
        }
        .resize-handle:focus-visible { outline: none; }
        :host([expanded]) .resize-handle { display: none; }
        @media (max-width: 600px) {
            /* a phone: the panel already covers the content — no edge, no wide mode */
            .resize-handle, .chat-expand { display: none; }
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
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0;
        }

        /* The tool calls of the turn in course, under the agent's message. */
        .tool-steps {
            list-style: none;
            margin: 0.25rem 0 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #555);
        }
        .tool-step {
            display: flex;
            align-items: baseline;
            gap: 0.4rem;
            min-width: 0;
        }
        .tool-step-icon {
            width: 1em;
            text-align: center;
            flex-shrink: 0;
        }
        .tool-step.done .tool-step-icon { color: var(--lumo-success-text-color, #0a7d3c); }
        .tool-step.failed .tool-step-icon,
        .tool-step-error { color: var(--lumo-error-text-color, #c62828); }
        .tool-step-name {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .tool-step-time { font-variant-numeric: tabular-nums; flex-shrink: 0; }
        .tool-step-error {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0;
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
    `];X([h({attribute:!1})],Y.prototype,"contextProvider",2);X([h()],Y.prototype,"localAgentUrl",2);X([h({attribute:!1})],Y.prototype,"mcpUrl",2);X([b()],Y.prototype,"localAgentAlive",2);X([h()],Y.prototype,"sseUrl",2);X([h()],Y.prototype,"uploadUrl",2);X([h({attribute:!1})],Y.prototype,"menu",2);X([b()],Y.prototype,"attachments",2);X([b()],Y.prototype,"uploading",2);X([fe(".file-input")],Y.prototype,"fileInputElement",2);X([h({type:Boolean,reflect:!0})],Y.prototype,"expanded",2);X([h()],Y.prototype,"label",2);X([b()],Y.prototype,"width",2);X([b()],Y.prototype,"resizing",2);X([h()],Y.prototype,"items",2);X([fe(".scroll-container")],Y.prototype,"scrollContainer",2);X([fe(".msg-input")],Y.prototype,"messageInputElement",2);X([b()],Y.prototype,"recognition",2);X([b()],Y.prototype,"listening",2);X([b()],Y.prototype,"recognitionAvailable",2);X([b()],Y.prototype,"loading",2);X([b()],Y.prototype,"elapsedSeconds",2);X([b()],Y.prototype,"tokenUsage",2);X([b()],Y.prototype,"progress",2);X([b()],Y.prototype,"progressTick",2);Y=X([_("mateu-chat")],Y);var y0=Object.defineProperty,$0=Object.getOwnPropertyDescriptor,zr=(e,t,a,r)=>{for(var i=r>1?void 0:r?$0(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&y0(t,a,i),i};let ka=class extends I{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([ee(()=>import("./vendor-chartjs.js").then(r=>r.a),[]),ee(()=>import("./vendor-chartjs.js").then(r=>r.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const a={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,a)}handleSlotChange(){}render(){return n`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};ka.styles=k`
    /* the host's inline height (Chart.style) must reach the canvas parent — chart.js
       measures .container to size the canvas when maintainAspectRatio is false */
    :host {
        display: block;
    }
    .container {
        height: 100%;
        position: relative;
    }
  `;zr([h()],ka.prototype,"type",2);zr([h()],ka.prototype,"data",2);zr([h()],ka.prototype,"options",2);zr([fe("#chart")],ka.prototype,"chartElement",2);ka=zr([_("mateu-chart")],ka);var w0=Object.defineProperty,x0=Object.getOwnPropertyDescriptor,mo=(e,t,a,r)=>{for(var i=r>1?void 0:r?x0(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&w0(t,a,i),i};let Er=class extends I{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await ee(async()=>{const{default:r}=await import("./vendor-diagrams.js");return{default:r}},__vite__mapDeps([0,1]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const a={container:this.divElement};this.chart=new t(a),this.chart.importXML(e)}handleSlotChange(){}render(){return n`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};Er.styles=k`
  `;mo([h()],Er.prototype,"xml",2);mo([fe("#canvas")],Er.prototype,"divElement",2);Er=mo([_("mateu-bpmn")],Er);var k0=Object.defineProperty,_0=Object.getOwnPropertyDescriptor,nr=(e,t,a,r)=>{for(var i=r>1?void 0:r?_0(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&k0(t,a,i),i};const is=160,ot=56,S0=220,fn=110,Ht=60,C0={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},E0={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},I0=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function T0(){return"step-"+Math.random().toString(36).slice(2,8)}let ea=class extends I{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(o=>{t[o.id]=0});let a=!0;for(;a;)a=!1,e.forEach(o=>{if(o.preconditionStepId!=null&&t[o.preconditionStepId]!==void 0){const l=t[o.preconditionStepId]+1;l>t[o.id]&&(t[o.id]=l,a=!0)}});const r={};e.forEach(o=>{const l=t[o.id]??0;(r[l]??=[]).push(o.id)});const i={...this.positions};let s=!1;Object.entries(r).forEach(([o,l])=>{const c=Number(o);l.forEach((u,p)=>{i[u]||(i[u]={x:Ht+c*S0,y:Ht+p*fn},s=!0)})}),s&&(this.positions=i)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addStep(){const e=T0(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(i=>i.y),r=a.length?Math.max(...a)+fn:Ht;this.positions={...this.positions,[e]:{x:Ht,y:r}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(r=>r.id!==e).map(r=>r.preconditionStepId===e?{...r,preconditionStepId:void 0}:r)};const{[e]:t,...a}=this.positions;this.positions=a,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},r=this.toSvgPoint(e);this.dragOffset={x:r.x-a.x,y:r.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(r=>r.x))+is+Ht:600,a=e.length?Math.max(...e.map(r=>r.y))+ot+Ht:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return n`
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
        `}renderToolbar(){const e=this.wf.status??"DRAFT";return n`
            <div class="toolbar">
                <span class="wf-name">${this.wf.name}</span>
                <span class="badge badge-${e.toLowerCase()}">${e}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${Dd}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${Md}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Nd}
                    Export
                </button>
            </div>
        `}renderMeta(){const e=this.wf;return n`
            <div class="meta-panel">
                <div class="meta-grid">
                    <label>Name</label>
                    <input class="inp" .value="${e.name}" @change="${t=>this.updateWf({name:t.target.value})}"/>
                    <label>Description</label>
                    <textarea class="inp" rows="2" @change="${t=>this.updateWf({description:t.target.value})}">${e.description??""}</textarea>
                    <label>Status</label>
                    <select class="inp" @change="${t=>this.updateWf({status:t.target.value})}">
                        ${["DRAFT","ACTIVE","DISABLED","ARCHIVED"].map(t=>n`
                            <option value="${t}" ?selected="${e.status===t}">${t}</option>`)}
                    </select>
                    <label>Limit concurrent</label>
                    <input type="checkbox" ?checked="${e.limitConcurrentExecutions}"
                           @change="${t=>this.updateWf({limitConcurrentExecutions:t.target.checked})}"/>
                    ${e.limitConcurrentExecutions?n`
                        <label>Max concurrent</label>
                        <input class="inp" type="number" min="0" .value="${String(e.maxConcurrentExecutions??0)}"
                               @change="${t=>this.updateWf({maxConcurrentExecutions:Number(t.target.value)})}"/>
                        <label>Enqueue on limit</label>
                        <input type="checkbox" ?checked="${e.enqueueOnLimit}"
                               @change="${t=>this.updateWf({enqueueOnLimit:t.target.checked})}"/>
                    `:""}
                </div>
            </div>
        `}renderArrow(e){if(!e.preconditionStepId)return me``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return me``;const r=t.x+is,i=t.y+ot/2,s=a.x,o=a.y+ot/2,l=(r+s)/2;return me`
            <path d="M${r},${i} C${l},${i} ${l},${o} ${s},${o}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:Ht,y:Ht},a=C0[e.type]??"#64748b",r=E0[e.type]??"•",i=this.selectedId===e.id;return me`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${s=>this.onNodeMouseDown(s,e.id)}"
               @click="${s=>{s.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${is}" height="${ot}" rx="8"
                      fill="white"
                      stroke="${i?a:"#e2e8f0"}"
                      stroke-width="${i?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${ot}" rx="8" fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${ot}" fill="${a}"/>
                <text x="16" y="${ot/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${r}</text>
                <!-- name -->
                <text x="44" y="${ot/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${ot/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${ot/2+20}" font-size="9" fill="${a}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(r=>r.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(r=>r.id!==e.id),a=(r,i)=>n`
            <div class="field">
                <label class="field-label">${r}</label>
                ${i}
            </div>
        `;return n`
            <div class="properties">
                <div class="prop-header">
                    <span>Step Properties</span>
                    <button class="del-btn" title="Delete step"
                            @click="${()=>this.deleteStep(e.id)}">🗑</button>
                    <button class="close-btn" @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${a("ID",n`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${a("Name",n`<input class="inp" .value="${e.name}"
                        @change="${r=>this.updateStep(e.id,{name:r.target.value})}"/>`)}
                    ${a("Type",n`
                        <select class="inp" @change="${r=>this.updateStep(e.id,{type:r.target.value})}">
                            ${I0.map(r=>n`<option value="${r}" ?selected="${e.type===r}">${r}</option>`)}
                        </select>`)}
                    ${a("Description",n`<textarea class="inp" rows="2"
                        @change="${r=>this.updateStep(e.id,{description:r.target.value})}">${e.description??""}</textarea>`)}
                    ${a("Precondition step",n`
                        <select class="inp" @change="${r=>this.updateStep(e.id,{preconditionStepId:r.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(r=>n`<option value="${r.id}" ?selected="${e.preconditionStepId===r.id}">${r.name} (${r.id})</option>`)}
                        </select>`)}
                    ${a("Precondition expression",n`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??""}"
                        @change="${r=>this.updateStep(e.id,{preconditionExpression:r.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${r=>this.updateStep(e.id,{parallel:r.target.checked})}"/>
                    </div>
                    ${a("Timeout (ms)",n`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${r=>this.updateStep(e.id,{timeout:Number(r.target.value)})}"/>`)}
                    ${a("Retries",n`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${r=>this.updateStep(e.id,{retries:Number(r.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${r=>this.updateStep(e.id,{rollbackable:r.target.checked})}"/>
                    </div>
                    ${e.rollbackable?a("Compensation step",n`
                        <select class="inp" @change="${r=>this.updateStep(e.id,{compensationStepId:r.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(r=>n`<option value="${r.id}" ?selected="${e.compensationStepId===r.id}">${r.name} (${r.id})</option>`)}
                        </select>`):""}

                    ${e.type==="ACTION"?a("Topic",n`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??""}"
                        @change="${r=>this.updateStep(e.id,{topic:r.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?a("Form ID",n`<input class="inp"
                        .value="${e.formId??""}"
                        @change="${r=>this.updateStep(e.id,{formId:r.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?a("Child workflow ID",n`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??""}"
                        @change="${r=>this.updateStep(e.id,{childWorkflowDefinitionId:r.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),r=document.createElement("a");r.href=a,r.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",r.click(),URL.revokeObjectURL(a)}};ea.styles=[po,k`
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
    `];nr([h()],ea.prototype,"value",2);nr([b()],ea.prototype,"wf",2);nr([b()],ea.prototype,"positions",2);nr([b()],ea.prototype,"selectedId",2);nr([b()],ea.prototype,"showMeta",2);ea=nr([_("mateu-workflow")],ea);var A0=Object.defineProperty,P0=Object.getOwnPropertyDescriptor,Lr=(e,t,a,r)=>{for(var i=r>1?void 0:r?P0(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&A0(t,a,i),i};const O0=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],R0=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],z0={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function vn(){return"field-"+Math.random().toString(36).slice(2,8)}let _a=class extends I{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=Ac.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:a,newIndex:r}=t;if(a===void 0||r===void 0||a===r)return;const i=[...this.form.fields],[s]=i.splice(a,1);i.splice(r,0,s),this.form={...this.form,fields:i},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addField(){const e=vn(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(s=>s.id===e);if(!t)return;const a={...t,id:vn(),label:t.label+" (copy)"},r=this.form.fields.findIndex(s=>s.id===e),i=[...this.form.fields];i.splice(r+1,0,a),this.form={...this.form,fields:i},this.selectedId=a.id,this.emit()}render(){return n`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():d}
                <div class="workspace">
                    ${this.renderList()}
                    ${this.selectedId?this.renderPanel():d}
                </div>
            </div>
        `}renderToolbar(){return n`
            <div class="toolbar">
                <span class="form-name">${this.form.name}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${Dd}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${Md}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Nd}
                    Export
                </button>
            </div>
        `}renderMeta(){const e=this.form;return n`
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
        `}renderList(){const e=this.form.fields;return n`
            <div class="list-wrap">
                ${e.length===0?n`
                    <div class="empty">
                        No fields yet. Click <strong>Add Field</strong> to start.
                    </div>`:d}
                <div class="field-list">
                    ${e.map(t=>this.renderRow(t))}
                </div>
            </div>
        `}renderRow(e){const t=z0[e.dataType]??"#64748b",a=this.selectedId===e.id;return n`
            <div role="button" tabindex="0" class="field-row ${a?"selected":""}"
                 data-id="${e.id}"
                 @click="${()=>this.selectedId=this.selectedId===e.id?null:e.id}" @keydown="${te(()=>this.selectedId=this.selectedId===e.id?null:e.id)}">
                <span class="drag-handle" title="Drag to reorder">⠿</span>
                <span class="type-badge" style="background:${t}">${e.dataType}</span>
                <span class="field-label-text">${e.label}</span>
                <span class="field-id-text">${e.id}</span>
                ${e.required?n`<span class="required-badge">required</span>`:d}
                ${e.stereotype&&e.stereotype!=="regular"?n`<span class="stereo-badge">${e.stereotype}</span>`:d}
                <div style="flex:1"></div>
                <button class="row-btn" title="Duplicate"
                        @click="${r=>{r.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${r=>{r.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){const e=this.form.fields.find(a=>a.id===this.selectedId);if(!e)return d;const t=(a,r)=>n`
            <div class="prop-field">
                <label class="prop-label">${a}</label>
                ${r}
            </div>
        `;return n`
            <div class="properties">
                <div class="prop-header">
                    <span>Field Properties</span>
                    <button class="close-btn" @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${t("ID",n`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${t("Label",n`
                        <input class="inp" .value="${e.label}"
                               @change="${a=>this.updateField(e.id,{label:a.target.value})}"/>`)}
                    ${t("Data type",n`
                        <select class="inp"
                                @change="${a=>this.updateField(e.id,{dataType:a.target.value})}">
                            ${O0.map(a=>n`
                                <option value="${a}" ?selected="${e.dataType===a}">${a}</option>`)}
                        </select>`)}
                    ${t("Stereotype",n`
                        <select class="inp"
                                @change="${a=>this.updateField(e.id,{stereotype:a.target.value||void 0})}">
                            ${R0.map(a=>n`
                                <option value="${a}" ?selected="${(e.stereotype??"regular")===a}">${a}</option>`)}
                        </select>`)}
                    <div class="prop-field row">
                        <label class="prop-label">Required</label>
                        <input type="checkbox" ?checked="${e.required}"
                               @change="${a=>this.updateField(e.id,{required:a.target.checked})}"/>
                    </div>
                    ${t("Description / hint",n`
                        <textarea class="inp" rows="3"
                                  @change="${a=>this.updateField(e.id,{description:a.target.value||void 0})}">${e.description??""}</textarea>`)}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),r=document.createElement("a");r.href=a,r.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",r.click(),URL.revokeObjectURL(a)}};_a.styles=[po,le,k`
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
    `];Lr([h()],_a.prototype,"value",2);Lr([b()],_a.prototype,"form",2);Lr([b()],_a.prototype,"selectedId",2);Lr([b()],_a.prototype,"showMeta",2);_a=Lr([_("mateu-form-editor")],_a);var L0=Object.defineProperty,D0=Object.getOwnPropertyDescriptor,St=(e,t,a,r)=>{for(var i=r>1?void 0:r?D0(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&L0(t,a,i),i};let Be=class extends I{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return n`
            <button class="tab ${this.activeTab===e?"tab--active":""}"
                @click=${()=>{this.activeTab=e}}>
                ${t}
            </button>
        `}render(){return this.open?n`
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
                        ${this.activeTab==="appstate"?n`
                            <pre class="json">${this._fmt(this.appState)}</pre>
                        `:d}
                        ${this.activeTab==="appdata"?n`
                            <pre class="json">${this._fmt(this.appData)}</pre>
                        `:d}
                        ${this.activeTab==="inspector"?n`
                            ${this.hoveredTag?n`
                                <div class="inspector-tag">&lt;${this.hoveredTag}${this.hoveredId?` id="${this.hoveredId}"`:""}&gt;</div>
                                <div class="section-label">state</div>
                                <pre class="json">${this._fmt(this.hoveredState)}</pre>
                                <div class="section-label">data</div>
                                <pre class="json">${this._fmt(this.hoveredData)}</pre>
                                <div class="section-label">metadata</div>
                                <pre class="json">${this._fmt(this.hoveredMeta)}</pre>
                            `:n`
                                <div class="inspector-hint">Hover a mateu-* element to inspect it</div>
                            `}
                        `:d}
                    </div>
                </div>
            `:n`
            <button class="fab" @click=${()=>{this.open=!0}} title="Mateu Debug">🐛</button>
        `}};Be.styles=k`
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
    `;St([h()],Be.prototype,"appState",2);St([h()],Be.prototype,"appData",2);St([b()],Be.prototype,"open",2);St([b()],Be.prototype,"activeTab",2);St([b()],Be.prototype,"hoveredTag",2);St([b()],Be.prototype,"hoveredId",2);St([b()],Be.prototype,"hoveredState",2);St([b()],Be.prototype,"hoveredData",2);St([b()],Be.prototype,"hoveredMeta",2);Be=St([_("mateu-debug-overlay")],Be);const M0=(e,t,a)=>{const r=t?.initiatorState;return r&&typeof r=="object"&&!F0(e,a)?{...r}:{...e??{}}},N0=/^(.+)_(create-and-stay|create|save|cancel|remove|add|select|selected|prev|next|move-up|move-down)$/,F0=(e,t)=>{const a=t?N0.exec(t):null;return!!a&&!!e&&`${a[1]}_rowClass`in e},gn=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}};var jd=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(jd||{}),Hd=(e=>(e.Continue="Continue",e.Stop="Stop",e))(Hd||{});const bn=12e4,yn=(e,t)=>`${e??"_"}::${t}`;class q0{constructor(){this.started=new Map,this.listeners=new Set}begin(t,a=Date.now()){const r=this.started.get(t);return r!==void 0&&a-r<bn?!1:(this.started.set(t,a),this.emit(),!0)}end(t){this.started.delete(t)&&this.emit()}isPending(t,a=Date.now()){const r=this.started.get(t);return r!==void 0&&a-r<bn}snapshot(){return new Set(this.started.keys())}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}reset(){this.started.clear(),this.emit()}emit(){const t=this.snapshot();this.listeners.forEach(a=>a(t))}}const $n=new q0;function B0(e,t){const a=e?.commands;return a&&a.length?(a.forEach(t),!0):!1}function U0(e,t){if(!t){e.removeAttribute("data-sizing"),e.style.flexBasis="";return}if(t.startsWith("fixed:")){e.setAttribute("data-sizing","fixed"),e.style.flexBasis=t.slice(6);return}e.setAttribute("data-sizing",t),e.style.flexBasis=""}const j0=e=>({header:Pe("confirmTitle"),message:Pe("confirmMessage"),confirmationText:Pe("confirmYes"),denialText:Pe("confirmNo")}),H0=(e,t)=>{const a=j0(),r=e?.confirmationTexts,i=(s,o)=>s!=null&&s.trim().length>0?s:o;return{header:i(r?.title,a.header),message:i(r?.message,a.message),confirmationText:i(r?.confirmationText,a.confirmationText),denialText:i(r?.denialText,a.denialText)}};var W0=Object.defineProperty,V0=Object.getOwnPropertyDescriptor,Hi=(e,t,a,r)=>{for(var i=r>1?void 0:r?V0(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&W0(t,a,i),i};let ur=null,Ka=class extends la{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,a=this.data,r=this.appState,i=this.appData,s=this.component,o=y=>_l(y,t,a,{appState:r,appData:i,component:s}),l=y=>Ks(y,t,a,r,i,{component:s}),c=["state","data","appState","appData","component"],u=[t,a,r,i,s],p={...this.state},m={...this.data};let f=!1,g=!1;for(let y=0;y<e.length;y++){const $=e[y];try{if(o($.filter)){if(Ae.SetStateValue==$.action||Ae.SetDataValue==$.action){const w=Ae.SetStateValue==$.action?p:m,C=$.fieldName.split(",");for(let E=0;E<C.length;E++){const A=C[E];if(!w[A]||w[A]!=$.value){const P=$.expression?l($.expression):$.value,R=jd.none==$.fieldAttribute?A:A+"."+$.fieldAttribute;P!=w[R]&&(w[R]=P,Ae.SetStateValue==$.action&&(f=!0),Ae.SetDataValue==$.action&&(g=!0))}}}if(Ae.RunAction==$.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:$.actionId},bubbles:!0,composed:!0})),Ae.RunJS==$.action&&new Function(...c,$.value)(...u),Ae.SetAttributeValue==$.action){const w=$.expression?o($.expression):$.value;if($.fieldAttribute=="disabled"){w?this.shadowRoot?.getElementById($.fieldName)?.setAttribute($.fieldAttribute,"disabled"):this.shadowRoot?.getElementById($.fieldName)?.removeAttribute($.fieldAttribute);continue}this.shadowRoot?.getElementById($.fieldName)?.setAttribute($.fieldAttribute,w)}if(Ae.SetCssClass==$.action&&this.shadowRoot?.getElementById($.fieldName)?.setAttribute("class",$.value),Ae.SetStyle==$.action&&this.shadowRoot?.getElementById($.fieldName)?.style.setProperty($.expression,$.value),Hd.Stop==$.result)break}}catch(w){console.error("rule failed",$,w)}}f&&(this.state=p),g&&(this.data=m),f&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,a=this.component.validations;let r=!0,i=!1;const s=this.data??{},o={...this.data??{},errors:{}};if(a){for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let p=0;p<u.length;p++){const m=u[p];o.errors[m]=[]}}for(let l=0;l<a.length;l++){const c=a[l];if(!this.skipValidation(t,c))try{const u=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!u){r=!1;const m=(c.fieldId??"_component").split(",");for(let f=0;f<m.length;f++){const g=m[f];let y=o.errors[g];if(y||(o.errors[g]=[]),y=o.errors[g],!s[g]){let $=c.message;try{$=this._evalTemplate(c.message)}catch{}y.push($)}}}}catch(u){console.error("validation failed",c,u)}}for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let p=0;p<u.length;p++){const m=u[p];if(s.errors?[m].join(","):o.errors==""&&[m].join(",")){i=!0;break}}}(s.errors?["_component"].join(","):o.errors==""&&["_component"].join(","))&&(i=!0)}o._valid=r,o._valid!=s._valid&&(i=!0),i&&(this.data=o)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};t.fieldIds.forEach(r=>{a[r]=void 0}),a.searchText=void 0,this.state={...this.state,...a}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};a[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...a})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const a={...this.state};a[t.fieldId]=t.value,this.adoptEditedState(t.fieldId,a),(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const r=this.component;r.triggers?.filter(i=>i.type==Gt.OnValueChange).filter(i=>!i.propertyName||t.fieldId==i.propertyName).forEach(i=>{(!i.condition||this._evalExpr(i.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))}),r.triggers?.filter(i=>i.type==Gt.AutoSave).forEach(i=>{const s=i.actionId,o=this._autoSaveTimers.get(s);o!==void 0&&clearTimeout(o),this._autoSaveTimers.set(s,setTimeout(()=>{this._autoSaveTimers.delete(s),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0}))},i.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail,a=t?._originElement??Sb(e);if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation(),Array.isArray(t.parameters?.crud_selected_items)&&(this.state={...this.state,crud_selected_items:t.parameters.crud_selected_items});const r=this.component,i=r.actions?.find(s=>s.id==t.actionId)??r.actions?.find(s=>s.id.endsWith("*")&&t.actionId.startsWith(s.id.slice(0,-1)));if(i){if(i&&i.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(i&&i.validationRequired){const o=ur??this;if(ur=null,o.checkValidations(i.fieldsToValidate),!o.data._valid){o.notifyValidationErrors();return}}ur=null;const s={...t,initiatorComponentId:this.id};i&&i.confirmationRequired?this.callAfterConfirmation(i,()=>this.requestActionCallToServerOrBubble(s,r,i,a)):this.requestActionCallToServerOrBubble(s,r,i,a)}else{const s={...t.parameters};s.initiatorState||(s.initiatorState=this.state),ur||(ur=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,_originElement:a,parameters:s},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=a=>{if(a)for(const r of a){const i=r.metadata;if(i?.type===v.FormField){const s=i;s.fieldId&&s.label&&(e[s.fieldId]=s.label)}t(r.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),a=[];if(Object.entries(e).forEach(([i,s])=>{if(!Array.isArray(s))return;const o=i==="_component"?void 0:t[i]??i;s.forEach(l=>{l&&!a.some(c=>c.label===o&&c.msg===l)&&a.push({label:o,msg:l})})}),a.length===0){this.notify("There are validation errors");return}const r=`There are validation errors
`+a.map(({label:i,msg:s})=>i?`• ${i}: ${s}`:`• ${s}`).join(`
`);lt({text:r,variant:"error",position:"bottomEnd",duration:Math.max(3e3,1500+a.length*1e3)},this),this.focusFirstInvalidField()},this.notify=e=>{lt({text:e,variant:"error",position:"bottomEnd",duration:3e3},this)},this.handleRestAction=(e,t)=>{const a=()=>{const p=G(e.successMessage,this.state,this.data);p&&lt({text:p,variant:"success",position:"bottomEnd",duration:3e3},this);const m=G(e.successRoute,this.state,this.data);if(!(!m||m.includes("${"))){if(this.sameRoute(m)){this.refreshListing();return}mt(this,m)}},r=p=>{if(e.resultPath!=null){const m=va(p,e.resultPath);m&&typeof m=="object"&&(this.state={...this.state,...m})}a()},i=p=>{console.warn("mateu: rest action failed",p),lt({text:"Request failed",variant:"error",position:"bottomEnd",duration:3e3},this)},s=(p,m)=>{const f=p?.appData?._restfetchError;if(f){const g=typeof f?.status=="number"&&f.status>0?` (HTTP ${f.status})`:"";lt({text:`Request failed${g}`,variant:"error",position:"bottomEnd",duration:3e3},this);return}m(p?.appData?._restfetch)},o=!!Xa(e.source)?.proxy,l=t==="__restdata__"?"data":"action";if(e.forEachSelectedRow){const p=this.state.crud_selected_items??[];if(!p.length){this.notify("You first need to select some rows");return}if(o){this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:"__restfetch__",parameters:{_sourceKind:l,_sourceId:t,_forEachSelectedRow:!0},callback:m=>s(m,()=>a()),callbackonly:!0},bubbles:!0,composed:!0}));return}Promise.all(p.map(m=>Ua(e.source,f=>G(f,{...this.state,...m},this.data)))).then(()=>a()).catch(i);return}if(o){this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:"__restfetch__",parameters:{_sourceKind:l,_sourceId:t},callback:p=>s(p,r),callbackonly:!0},bubbles:!0,composed:!0}));return}const c=p=>G(p,this.state,this.data),u=p=>G(p,ri(this.state),ri(this.data));Ua(e.source,c,void 0,u).then(r).catch(i)},this.callAfterConfirmation=(e,t)=>{const{header:a,message:r,confirmationText:i,denialText:s}=H0(e),o=document.createElement("div");o.style.cssText="position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);padding:1rem;";const l=document.createElement("div");l.style.cssText="background:var(--lumo-base-color,#fff);color:var(--lumo-body-text-color,#1a1a1a);border-radius:var(--lumo-border-radius-l,12px);box-shadow:var(--lumo-box-shadow-xl,0 12px 40px rgba(0,0,0,.3));padding:1.2rem;max-width:min(90vw,26rem);";const c=()=>{o.parentElement&&document.body.removeChild(o)},u="font:inherit;font-weight:600;padding:.45rem 1rem;border-radius:var(--lumo-border-radius-m,6px);cursor:pointer;";Bn(n`
            <h3 style="margin:0 0 .5rem;">${a}</h3>
            <div style="margin-bottom:1.2rem;">${r}</div>
            <div style="display:flex;justify-content:flex-end;gap:.5rem;">
                <button style="${u}border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.25));background:var(--lumo-base-color,#fff);"
                        @click="${()=>c()}">${s}</button>
                <button style="${u}border:none;background:var(--lumo-primary-color,#1676f3);color:var(--lumo-primary-contrast-color,#fff);"
                        @click="${()=>{c(),t()}}">${i}</button>
            </div>
        `,l),o.appendChild(l),o.addEventListener("click",p=>{p.target===o&&c()}),document.body.appendChild(o)},this.requestActionCallToServerOrBubble=(e,t,a,r)=>{if(a&&a.bubble){const i={...e.parameters};i.initiatorState||(i.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,_originElement:r,parameters:i},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,a,r)},this.requestActionCallToServer=(e,t,a,r)=>{if(a&&a.href){window.location.href=a.href;return}if(a&&a.js)try{new Function("state","data","appState","appData","component",a.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(o){console.error("when evaluating "+a.js,o,this.component,this.state,this.data)}if(a&&a.customEvent&&this.dispatchEvent(new CustomEvent(a.customEvent.name,{detail:a.customEvent.detail,bubbles:!0,composed:!0})),a&&(a.js||a.customEvent)||B0(a,o=>this.applyCommand(o)))return;if(a&&a.restAction){this.handleRestAction(a.restAction,a.id);return}if(e.actionId=="search"){const o=e.parameters?._searchState;o?this.state={...this.state,...o}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}const i=e.background??a?.background??(Kg(e.actionId)||void 0);if(!i){if(!ol(e.actionId,a?.idempotent)&&!$n.begin(yn(this.id,e.actionId)))return;const l=Eb(r);this._pendingOrigins.set(e.actionId,l),kb(l)}const s=M0(this.state,e.parameters,e.actionId);this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:s,parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:i,sse:a?.sse,timeoutMillis:a?.timeoutMillis,idempotent:a?.idempotent,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(r=>r.type==Gt.OnSuccess).filter(r=>e.detail.actionId==r.calledActionId).forEach(r=>{if(!r.condition||this._evalExpr(r.condition))if(e.preventDefault(),e.stopPropagation(),r.timeoutMillis>0){const i=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,background:r.background,callbackToken:i},bubbles:!0,composed:!0}))},r.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,background:r.background},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(r=>r.type==Gt.OnError).filter(r=>e.detail.actionId==r.calledActionId).forEach(r=>{(!r.condition||this._evalExpr(r.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId},bubbles:!0,composed:!0})))})},this._pendingOrigins=new Map,this._backendSettledListener=e=>{((typeof e.composedPath=="function"?e.composedPath():[])[0]??e.target)===this&&this._releasePending(e.detail?.actionId)},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const a of t.actions??[]){const r=a.shortcut||(a.runOnEnter?"enter":null);if(r&&this._shortcutMatchesEvent(r,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return J.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(U0(this,this.component?.sizing),this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}sameRoute(e){const t=a=>a.replace(/^\/+/,"").replace(/\/+$/,"").split("?")[0];return t(e)===t(window.location.pathname)}refreshListing(){let e=null;const t=a=>{const r=a.querySelector?.("mateu-table-crud");r&&(e=r),a.querySelectorAll?.("*").forEach(i=>{i.shadowRoot&&t(i.shadowRoot)})};t(this.renderRoot),e?.search?.()}focusFirstInvalidField(){const e=t=>requestAnimationFrame(()=>{const a=this.findFirstInvalid(this.renderRoot);if(a){a.focus?.(),a.scrollIntoView?.({block:"center",behavior:"smooth"});return}t>0&&e(t-1)});e(3)}findFirstInvalid(e){if(!e?.querySelectorAll)return null;for(const t of Array.from(e.querySelectorAll("*"))){if(t.invalid===!0)return t;if(t.shadowRoot){const a=this.findFirstInvalid(t.shadowRoot);if(a)return a}}return null}_releasePending(e){(e!==void 0?[e]:Array.from(this._pendingOrigins.keys())).forEach(a=>{$n.end(yn(this.id,a)),_b(this._pendingOrigins.get(a)),this._pendingOrigins.delete(a)})}_shortcutMatchesEvent(e,t){return Up(e,t)}_collectShortcutTabs(){const e=this.renderRoot;if(!e)return[];const t=Array.from(e.querySelectorAll("vaadin-tab[data-shortcut]"));return e.querySelectorAll("mateu-drawer, mateu-dialog").forEach(a=>{const r=a.shadowRoot;r&&t.push(...Array.from(r.querySelectorAll("vaadin-tab[data-shortcut]")))}),t}_handleTabShortcut(e){const t=this._collectShortcutTabs();if(t.length===0)return!1;for(const a of Array.from(t)){const r=a.dataset.shortcut;if(!r||!this._shortcutMatchesEvent(r,e))continue;const i=a.closest("vaadin-tabs");if(!i)continue;const s=Array.from(i.querySelectorAll("vaadin-tab")).indexOf(a);if(!(s<0))return e.preventDefault(),i.selected=s,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),this.addEventListener("backend-succeeded-event",this._backendSettledListener),this.addEventListener("backend-failed-event",this._backendSettledListener),this.addEventListener("backend-cancelled-event",this._backendSettledListener),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),this.removeEventListener("backend-succeeded-event",this._backendSettledListener),this.removeEventListener("backend-failed-event",this._backendSettledListener),this.removeEventListener("backend-cancelled-event",this._backendSettledListener),document.removeEventListener("keydown",this._keydownListener),this._releasePending()}render(){return n`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?n`
                <div><ul>${this.data.errors._component.map(e=>n`<li>${e}</li>`)}</ul></div>
            `:d}</div>`}_render(){if(this.component?.type==re.ClientSide){const e=this.component;return e.metadata?.type==v.Page?Ss(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==v.Crud?Cs(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):J.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return n`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==re.ClientSide){const t=e;if(t.metadata?.type==v.Page)return Ss(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==v.Crud)return Cs(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return x(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};Ka.styles=[k`
        :host {
        }

        /* Sizing intent (coherence-plan #8), applied via the data-sizing attribute set from
           component.sizing. "fill" grows to take the space its parent (a flex column) leaves and
           scrolls internally rather than pushing the page — in a viewport-height flex chain this
           subtracts header/menu/searchbox automatically. "hug" sizes to content. A "fixed:<len>"
           intent sets flex-basis inline (see applySizing). */
        :host([data-sizing="fill"]) {
            flex: 1 1 auto;
            min-height: 0;
            align-self: stretch;
            overflow: auto;
        }
        :host([data-sizing="hug"]) {
            flex: 0 0 auto;
        }
        :host([data-sizing="fixed"]) {
            flex: 0 0 auto;
        }

        ${Ls(Mt.cssText)}
        
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
  `,eo(".page-fab"),Ta];Hi([h()],Ka.prototype,"baseUrl",2);Hi([h()],Ka.prototype,"route",2);Hi([h()],Ka.prototype,"consumedRoute",2);Ka=Hi([_("mateu-component")],Ka);class G0{async handle(t,a){return await t.runAction(a.baseUrl,a.route,a.consumedRoute,a.actionId,a.initiatorComponentId,a.appState,a.serverSideType,a.componentState,a.parameters,a.initiator,a.background,a.options)}}const K0=new G0;class Y0{constructor(){this.handleUIIncrement=(t,a,r)=>{if(t?.fragments?.forEach(i=>{Fa.next({command:void 0,fragment:i,ui:void 0,error:void 0,callbackToken:r,initiator:a})}),t?.appState&&(pe.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const i=t?.appData;ba.value={...t.appData,...i},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(i=>{lt({text:i.text,position:i.position,variant:i.variant,duration:i.duration,undoLabel:i.undoLabel,undoActionId:i.undoActionId,undoParameters:i.undoParameters},a)}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(i=>{Fa.next({command:i,fragment:void 0,ui:void 0,error:void 0,callbackToken:r,initiator:a})})}}async runAction(t,a,r,i,s,o,l,c,u,p,m,f,g,y,$,w={}){const C=()=>{this.runAction(t,a,r,i,s,o,l,c,u,p,m,f,g,y,$,w)};try{const E=await K0.handle(t,{baseUrl:a,route:r,consumedRoute:i,actionId:s,appState:pe.value,initiatorComponentId:o,componentState:u,parameters:p,serverSideType:c,initiator:m,background:f,options:{...w,retry:C}});if(w.isStale?.()){console.debug?.("mateu: dropped the answer to an action of a view no longer on screen",s,c,a),m.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{actionId:s}}));return}g&&g(E),y||this.handleUIIncrement(E,m,$),E.messages&&E.messages.length==1&&E.messages[0].variant=="error"&&m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:s},bubbles:!0,composed:!0})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:s,evevntId:Ne()},bubbles:!0,composed:!0}))}catch(E){if(dl(E)){console.debug?.("mateu: dropped the answer ("+E.outcome+") to an action of a view no longer on screen",s,c,a);return}console.warn("Action request failed",E),E?.__mateuReported||m.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:s,reason:this.serialize(E),retry:C}})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:s},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const J0=new Y0,X0=J0;class Q0{constructor(){this.handleUIIncrement=(t,a,r)=>{if(t?.messages?.forEach(i=>{lt({text:i.text,position:i.position,variant:i.variant,duration:i.duration,undoLabel:i.undoLabel,undoActionId:i.undoActionId,undoParameters:i.undoParameters},a)}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(i=>{Fa.next({command:i,fragment:void 0,ui:void 0,error:void 0,callbackToken:r,initiator:a})}),t?.fragments?.forEach(i=>{Fa.next({command:void 0,fragment:i,ui:void 0,error:void 0,callbackToken:r,initiator:a})}),t?.appState&&(pe.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const i=t?.appData;ba.value={...t.appData,...i},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,a,r,i,s,o,l,c,u,p,m,f,g,y,$,w={}){const C=()=>{this.runAction(t,a,r,i,s,o,l,c,u,p,m,f,g,y,$,w)};if(r){r=r||"_no_route",r&&r.startsWith("/")&&(r=r.substring(1));const E={serverSideType:c,appState:pe.value,componentState:u,parameters:p,initiatorComponentId:o,consumedRoute:i,route:"/"+r,actionId:s};f||m.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}}));const A={Accept:"text/event-stream","Content-Type":"application/json"},P=localStorage.getItem("__mateu_auth_token");P&&(A.Authorization="Bearer "+P);const R=sessionStorage.getItem("__mateu_sesion_id");R&&(A["X-Session-Id"]=R),fetch(a+"/mateu/v3/sse/"+r,{method:"POST",headers:A,body:JSON.stringify(E)}).then(async O=>{let S;const z=Z=>{if(w.isStale?.())throw S?.cancel().catch(()=>{}),new ll(s,Z)};if(z("answered"),S=O.body?.pipeThrough(new TextDecoderStream).getReader(),S){let Z="";for(;;){const{value:H,done:Q}=await S.read();if(Q)break;Z+=H;const T=Z.split(`

`);Z=T.pop()??"";for(const U of T){const B=U.trim();if(B)if(B.startsWith("data:")){z("answered");const D=JSON.parse(B.substring(5).trim());g&&g(D),y||this.handleUIIncrement(D,m,$),D.messages&&D.messages.length==1&&D.messages[0].variant=="error"&&m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:s},bubbles:!0,composed:!0}))}else{let D=B;try{const de=JSON.parse(B);D=de.message,de._embedded?.errors?.length>0&&de._embedded.errors[0].message&&(D=de._embedded.errors[0].message)}catch{}throw z("failed"),new Error(D)}}}}f||m.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:s}})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:s},bubbles:!0,composed:!0}))}).catch(O=>{if(dl(O)||w.isStale?.()){console.debug?.("mateu: dropped a streamed answer to an action of a view no longer on screen",s,c,a),m.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{actionId:s}}));return}m.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:s,reason:this.serialize(O),retry:C}})),m.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:s},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}}const Wd=new Q0,Z0={fixed:"fixed",fullWidth:"full",edgeToEdge:"edge"},ey=new Set([v.Gantt,v.PlanningBoard,v.Kanban,v.Bpmn,v.Workflow,v.Map]),ty={landing:"fixed",form:"fixed",process:"fixed"},Vd=e=>e?Z0[e]:void 0,Sa=e=>e.type==re.ClientSide?e.metadata:void 0,Gd=e=>{const t=Sa(e);if(t?.type==v.Page){const a=Vd(t.pageWidth);if(a)return a}for(const a of e.children??[]){const r=Gd(a);if(r)return r}},Kd=e=>{const t=e.pageType;if(t)return t;const a=r=>{const i=Sa(r);if(i?.type==v.Page&&i.pageType)return i.pageType;for(const s of r.children??[]){const o=a(s);if(o)return o}};return a(e)},ay=e=>{const t=Sa(e);if(t?.type!=v.Crud)return!1;const a=t;return a.compact?!0:(a.columns??[]).some(r=>r.metadata?.editable)},Ti=(e,t)=>t(e)||(e.children??[]).some(a=>Ti(a,t)),ry=e=>!!e&&Ti(e,t=>Sa(t)?.type==v.HeroSection),Ts=e=>Sa(e)?.type==v.App?!0:(e.children??[]).some(t=>Sa(t)?.type==v.App),iy=(e,t)=>{if(!e)return"fixed";const a=Vd(e.pageWidth)??Gd(e);if(a)return a;if(t?.top&&Ts(e))return"edge";const r=ty[Kd(e)??""];return r||(Ti(e,i=>{const s=Sa(i)?.type;return s!=null&&ey.has(s)})?"edge":Ti(e,ay)?"full":"fixed")},As="mateu-route-structure-cache",Yd=1,Ps=50;let Jd=(()=>{try{return localStorage.getItem("mateu-route-structure-cache-off")!=="1"}catch{return!0}})();const Xd=()=>{try{return JSON.parse(localStorage.getItem(As)??"{}")}catch{return{}}},sy=e=>{try{localStorage.setItem(As,JSON.stringify(e))}catch{try{const t=Object.entries(e).sort((a,r)=>r[1].t-a[1].t).slice(0,Math.floor(Ps/2));localStorage.setItem(As,JSON.stringify(Object.fromEntries(t)))}catch{}}},oy=e=>{const t=e.initialState&&Object.keys(e.initialState).length?"#"+dy(JSON.stringify(e.initialState)):"";return[e.baseUrl,e.consumedRoute??"",e.route??"",e.serverSideType??""].join("|")+t},ny=e=>{if(!Jd)return;const t=Xd()[e];if(!(!t||t.v!==Yd))return{component:t.component,hash:t.hash}},ly=(e,t,a)=>{if(!Jd)return;const r=Xd();r[e]={v:Yd,t:Date.now(),component:t,hash:a};const i=Object.keys(r);if(i.length>Ps){const s=i.sort((o,l)=>r[o].t-r[l].t).slice(0,i.length-Ps);for(const o of s)delete r[o]}sy(r)},dy=e=>{let t=2166136261;for(let a=0;a<e.length;a++)t^=e.charCodeAt(a),t=Math.imul(t,16777619);return(t>>>0).toString(36)},cy=30,Ma=new Map,uy=e=>Ma.get(e),hy=(e,t)=>{if(Ma.delete(e),Ma.set(e,t),Ma.size>cy){const a=Ma.keys().next().value;a!==void 0&&Ma.delete(a)}};var py=Object.defineProperty,my=Object.getOwnPropertyDescriptor,Ie=(e,t,a,r)=>{for(var i=r>1?void 0:r?my(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&py(t,a,i),i};let oe=class extends yl{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.showSkeleton=!1,this.pendingRouteFocus=!1,this.hasRenderedContent=!1,this.generation=0,this.viewGeneration=Object.defineProperties({},{generation:{get:()=>this.generation},callbackToken:{get:()=>this.callbackToken},connected:{get:()=>this.isConnected}}),this.loadLifecycleListener=e=>{if(((typeof e.composedPath=="function"?e.composedPath():[])[0]??e.target)===this)if(clearTimeout(this.skeletonTimer),e.type==="backend-called-event"){if(this.fragment?.component)return;this.skeletonTimer=setTimeout(()=>{this.showSkeleton=!0},oe.SKELETON_DELAY_MS)}else this.showSkeleton=!1},this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:re.ClientSide,metadata:{type:v.Element,name:"div",content:"Not found"},id:"fieldId"},action:Kt.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"&&t.initiator!==this&&!Du(this.contentIdentity,qr(this.id,this.baseUrl),t.actionId)){console.debug?.("mateu-ux: dropped an action of the previous view",t.actionId,t.serverSideType,"now",this.baseUrl,this.route),t.initiator?.dispatchEvent?.(new CustomEvent("backend-cancelled-event",{detail:{actionId:t.actionId}}));return}if(e.type=="server-side-action-requested"){let a=X0;t.sse&&(a=Wd),a.runAction(Aa,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken,{timeoutMillis:t.timeoutMillis,idempotent:t.idempotent,knownStructureHash:t.knownStructureHash,isStale:Mu(this.viewGeneration,t.initiator===this&&!t.actionId)})}},this.getCustomisedAppState=()=>{let e={...pe.value};if(this.overrides){const t=gn(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return J.mustUseShadowRoot()?super.createRenderRoot():this}structureCacheKey(){return oy({baseUrl:this.baseUrl,consumedRoute:this.consumedRoute,route:this.route,serverSideType:this.serverSideType,initialState:this.initialState})}focusNewContent(){requestAnimationFrame(()=>{const a=this.renderRoot?.querySelector?.('h1, h2, [role="heading"]')??this;a.hasAttribute("tabindex")||a.setAttribute("tabindex","-1"),a.focus?.({preventScroll:!0})})}connectedCallback(){super.connectedCallback(),this.overridesParsed=gn(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener),this.addEventListener("backend-called-event",this.loadLifecycleListener),this.addEventListener("backend-succeeded-event",this.loadLifecycleListener),this.addEventListener("backend-failed-event",this.loadLifecycleListener),this.addEventListener("backend-cancelled-event",this.loadLifecycleListener)}disconnectedCallback(){super.disconnectedCallback(),this.releaseFabAnchor?.(),this.releaseFabAnchor=void 0,this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener),this.removeEventListener("backend-called-event",this.loadLifecycleListener),this.removeEventListener("backend-succeeded-event",this.loadLifecycleListener),this.removeEventListener("backend-failed-event",this.loadLifecycleListener),this.removeEventListener("backend-cancelled-event",this.loadLifecycleListener),clearTimeout(this.skeletonTimer)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(a=>a==="appState"||a==="appData")){const a=this.renderRoot.querySelector("mateu-component");if(a)return e.has("appState")&&(a.appState=this.appState),e.has("appData")&&(a.appData=this.appData),!1}return!0}updated(e){if((e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&!this.preventNavigation){const t=qr(this.id,this.baseUrl)+"|"+(this.route??"");t!==this.generationKey&&(this.generationKey=t,this.generation++),this.callbackToken=this.instant||Ne();const a=this.structureCacheKey(),r=a!==this.lastAuthoritativeKey?uy(a):void 0;if(r)queueMicrotask(()=>this.applyFragment(r));else{if(a!==this.lastAuthoritativeKey){const i=ny(a);this.currentStructureHash=i?.hash,i&&(this.fragment={targetComponentId:this.id,component:i.component,state:{},data:{},action:Kt.Replace,containerId:void 0},this.stampPageChrome(),this.contentIdentity=qr(this.id,this.baseUrl))}this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,componentState:this.initialState,knownStructureHash:this.currentStructureHash,callbackToken:this.callbackToken},bubbles:!0,composed:!0}))}}e.has("route")&&this.top&&(this.preventNavigation||(this.pendingRouteFocus=!0),this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(this.contentIdentity=qr(this.id,this.baseUrl),!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}},this.stampPageChrome();return}if(this.fragment=e,e.component){if(e.action!==Kt.Add){const t=this.structureCacheKey(),a=e.component.structureHash;ly(t,e.component,a),this.lastAuthoritativeKey=t,this.currentStructureHash=a,e.component.staticView&&hy(t,e)}this.pendingRouteFocus&&this.hasRenderedContent&&this.focusNewContent(),this.pendingRouteFocus=!1,this.hasRenderedContent=!0}this.stampPageChrome()}stampPageChrome(){const e=this.fragment?.component;if(!e||e===this.lastStampedComponent)return;this.lastStampedComponent=e;const t=!this.top&&Ts(e);this.dataset.pageWidth=t?"edge":iy(e,{top:this.top}),this.releaseFabAnchor?.(),this.releaseFabAnchor=void 0,(this.top===!0||String(this.top)==="true"||this.hasAttribute("data-content-view"))&&!Ts(e)&&(this.releaseFabAnchor=Om(this,this.dataset.pageWidth)),this.dataset.pageType=Kd(e)??"",this.dataset.hasWelcomeBanner=String(ry(e))}render(){return!this.fragment?.component&&this.showSkeleton?n`
                <div class="route-skeleton" aria-busy="true" aria-live="polite">
                    <mateu-skeleton variant="text" count="1"></mateu-skeleton>
                    <mateu-skeleton variant="form" count="4"></mateu-skeleton>
                </div>
            `:n`
           ${this.fragment?.component?x(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):d}
       `}};oe.SKELETON_DELAY_MS=400;oe.styles=[k`
        /* The content ux is a flex COLUMN, not a block — the missing link in the viewport-height
           flex chain (coherence-plan #8): the shell content area is already flex:1;min-height:0, so
           a flex-column ux lets a direct child that declares sizing "fill" (a listing's
           mateu-component: flex:1 1 auto;min-height:0;overflow:auto) take the remaining height and
           scroll internally instead of pushing the page. A "hug" child (a form) keeps its natural
           height and the content area scrolls as before. min-height:100% keeps a short page filling
           the viewport; an embedded island's parent is auto-height, so the percentage resolves to 0
           there and the child keeps its natural size (no harm). */
        :host {
            display: flex;
            flex-direction: column;
            min-height: 100%;
            min-width: 0;
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
        /* --mateu-content-gutter: the gutter a shell WITHOUT padded content area asks its content
           view for (MENU_ON_TOP's two-band shell: 24px, 16px on a phone); a padded .app-content
           sets it to 0. Fixed keeps its 1408px column and gets the gutter when narrower. */
        :host([data-page-width='fixed']) {
            box-sizing: border-box;
            max-width: min(calc(1408px + 2 * var(--mateu-content-gutter, 0px)), 100%);
            margin-inline: auto;
            padding-inline: var(--mateu-content-gutter, 0px);
        }
        :host([data-page-width='full']) {
            box-sizing: border-box;
            padding-inline: var(--mateu-content-gutter, 24px);
        }
        /* the view that took the gutter is the page: views nested in it (islands, a drawer's
           content) are not, and must not take it again. An edge view (a remote shell's root)
           passes it through to the page it holds. */
        :host([data-page-width='fixed']) *,
        :host([data-page-width='full']) * {
            --mateu-content-gutter: 0px;
            --mateu-edge-header-gutter: 0px;
        }
        /* An edge page's CONTENT bleeds, but its header (breadcrumbs, title, banners) keeps the
           gutter the shell asked for — mateu-page reads it (RDS anatomy: only the content band
           reaches the edges). Inside a padded .app-content the gutter is 0: the shell pads it. */
        :host([data-page-width='edge']) {
            --mateu-edge-header-gutter: var(--mateu-content-gutter, 0px);
        }

        /* The aside channel (layout/fabRail.ts): when the page has FABs or a section index, the
           content view leaves room at its end for them, so they sit OUTSIDE the work area. Fixed:
           narrowed only as much as its margin lacks for the channel, both sides alike to stay
           centred (the Redwood shell's box is the 1408px column plus a channel each side). Full: the channel is
           its end padding. The values are measured and set by the view that owns the channel. */
        :host([data-page-width='fixed'][data-aside]) {
            max-width: min(calc(1408px + 2 * var(--mateu-content-gutter, 0px)), 100% - 2 * var(--mateu-aside-squeeze, 0px));
        }
        :host([data-page-width='full'][data-aside]) {
            padding-inline-end: var(--mateu-aside-pad-end, 24px);
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
  `,Ta,Mt];Ie([h()],oe.prototype,"consumedRoute",2);Ie([h()],oe.prototype,"serverSideType",2);Ie([h()],oe.prototype,"uriPrefix",2);Ie([h()],oe.prototype,"overrides",2);Ie([h()],oe.prototype,"homeRoute",2);Ie([h()],oe.prototype,"route",2);Ie([h()],oe.prototype,"top",2);Ie([h()],oe.prototype,"instant",2);Ie([h()],oe.prototype,"initialState",2);Ie([h()],oe.prototype,"appState",2);Ie([h()],oe.prototype,"appData",2);Ie([b()],oe.prototype,"fragment",2);Ie([b()],oe.prototype,"showSkeleton",2);oe=Ie([_("mateu-ux")],oe);function fy(e){const t="var(--lumo-space-m, 1rem)",a={left:"50%",transform:"translateX(-50%)"};switch(e){case"topStart":return{top:t,left:t};case"topCenter":return{top:t,...a};case"topEnd":return{top:t,right:t};case"topStretch":return{top:t,left:t,right:t};case"middle":return{top:"50%",left:"50%",transform:"translate(-50%, -50%)"};case"bottomStart":return{bottom:t,left:t};case"bottomCenter":return{bottom:t,...a};case"bottomStretch":return{bottom:t,left:t,right:t};default:return{bottom:t,right:t}}}function vy(e){switch(e){case"success":return{bg:"var(--lumo-success-color, #2e7d32)",fg:"#fff"};case"error":return{bg:"var(--lumo-error-color, #c62828)",fg:"#fff"};case"warning":return{bg:"var(--lumo-warning-color, #f9a825)",fg:"#1a1a1a"};case"contrast":return{bg:"var(--lumo-contrast-90pct, #1a1a1a)",fg:"#fff"};default:return{bg:"var(--lumo-base-color, #fff)",fg:"var(--lumo-body-text-color, #1a1a1a)"}}}const gy={show(e,t){const{bg:a,fg:r}=vy(e.variant),i=fy(e.position),s=document.createElement("div"),o=e.variant==="error";s.setAttribute("role",o?"alert":"status"),s.setAttribute("aria-live",o?"assertive":"polite"),s.setAttribute("aria-atomic","true"),Object.assign(s.style,{position:"fixed",zIndex:"2000",display:"flex",alignItems:"center",gap:"0.75rem",maxWidth:"min(90vw, 28rem)",padding:"0.7rem 1rem",borderRadius:"var(--lumo-border-radius-m, 8px)",boxShadow:"var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,0.2))",background:a,color:r,font:"inherit",fontSize:"var(--lumo-font-size-s, 0.875rem)",opacity:"0",transition:"opacity 0.2s ease",...i});const l=document.createElement("span");l.textContent=e.text,s.appendChild(l);const c=()=>{s.style.opacity="0",setTimeout(()=>s.remove(),200)},u=e.onAction?{label:e.actionLabel??"Retry",run:e.onAction}:e.undoActionId?{label:e.undoLabel??"Undo",run:()=>t.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0}))}:void 0;if(u){const m=document.createElement("button");m.textContent=u.label,m.style.cssText="margin-left: 0.25rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;",m.addEventListener("click",()=>{u.run(),c()}),s.appendChild(m)}document.body.appendChild(s),requestAnimationFrame(()=>{s.style.opacity="1"});const p=e.duration??(u?1e4:5e3);p>0&&setTimeout(c,p)}};function by(){Ed(gy)}var yy=Object.defineProperty,$y=Object.getOwnPropertyDescriptor,fo=(e,t,a,r)=>{for(var i=r>1?void 0:r?$y(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&yy(t,a,i),i};let Ir=class extends I{constructor(){super(...arguments),this.online=!0,this.recovered=!1}connectedCallback(){super.connectedCallback(),this.online=Vt.isOnline(),this.unsubscribe=Vt.subscribe(e=>{const t=!this.online;this.online=e,e&&t&&(this.recovered=!0,clearTimeout(this.recoveredTimer),this.recoveredTimer=setTimeout(()=>{this.recovered=!1},4e3))})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),clearTimeout(this.recoveredTimer),this.releaseSpace()}updated(){const e=this.renderRoot.querySelector(".bar");if(!e){this.releaseSpace();return}document.body.style.setProperty("padding-block-start",`${e.offsetHeight}px`)}releaseSpace(){typeof document<"u"&&document.body?.style.removeProperty("padding-block-start")}render(){if(this.online&&!this.recovered)return d;const e=!this.online;return n`<div class="bar ${e?"offline":"back"}" role="status" aria-live="polite">
            <span class="dot"></span>
            <span>${e?"No connection — changes you make now will not be saved.":"Connection restored."}</span>
        </div>`}};Ir.styles=k`
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
    `;fo([b()],Ir.prototype,"online",2);fo([b()],Ir.prototype,"recovered",2);Ir=fo([_("mateu-connectivity-banner")],Ir);let Gr=null;function Qd(){if(!(typeof document>"u")&&!(Gr&&Gr.isConnected)){if(!document.body){document.addEventListener("DOMContentLoaded",()=>Qd(),{once:!0});return}Gr=document.createElement("mateu-connectivity-banner"),document.body.appendChild(Gr)}}var wy=Object.getOwnPropertyDescriptor,xy=(e,t,a,r)=>{for(var i=r>1?void 0:r?wy(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=o(i)||i);return i};let Tr=class extends I{constructor(){super(...arguments),this.skip=()=>{const e=this.findContent();e&&(e.hasAttribute("tabindex")||e.setAttribute("tabindex","-1"),e.focus(),e.scrollIntoView({block:"start"}))}}findContent(){const e=new Set,t=a=>{if(e.has(a))return null;e.add(a);for(const r of Tr.TARGETS){const i=a.querySelector?.(r);if(i&&i!==this)return i}for(const r of Array.from(a.querySelectorAll?.("*")??[]))if(r.shadowRoot){const i=t(r.shadowRoot);if(i)return i}return null};return t(document)}render(){return n`<button class="skip" @click="${this.skip}">Skip to content</button>`}};Tr.TARGETS=[".app-content","mateu-page","mateu-ux","mateu-component"];Tr.styles=k`
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
    `;Tr=xy([_("mateu-skip-link")],Tr);let Kr=null;function Zd(){if(!(typeof document>"u")&&!(Kr&&Kr.isConnected)){if(!document.body){document.addEventListener("DOMContentLoaded",()=>Zd(),{once:!0});return}Kr=document.createElement("mateu-skip-link"),document.body.insertBefore(Kr,document.body.firstChild)}}function ky(e){const t=()=>{const r=document.documentElement.getAttribute("theme");r?e.setAttribute("theme",r):e.removeAttribute("theme")};t();const a=new MutationObserver(t);return a.observe(document.documentElement,{attributes:!0,attributeFilter:["theme"]}),()=>a.disconnect()}const _y=(e,t)=>{const a=t.pathname+(t.search??""),r=(e.pathname??"")+(e.search??"");return!a&&!r||r===a?null:a.startsWith("/")?a:"/"+a},Sy=(e,t)=>{if(!e)return!1;let a;try{a=new URL(e)}catch{return!1}return a.pathname!==t.pathname||(a.search??"")!==(t.search??"")};var Cy=Object.defineProperty,Ey=Object.getOwnPropertyDescriptor,rt=(e,t,a,r)=>{for(var i=r>1?void 0:r?Ey(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Cy(t,a,i),i};by();Qd();gl();Zd();let Re=class extends I{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.bundleUrl=void 0,this.navigationKey="initial",this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,a=this.baseUrl??"";!t||t.startsWith("/")?a=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,a.indexOf("://")<0&&(a.startsWith("/")||(a="/"+a),a=window.location.origin+a)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),a.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let r=new URL(a+t);const i=_y(window.location,r);i&&(window.history.pushState({},"",i),this._lastUrl=window.location.href)}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),ut.markClean(),e instanceof CustomEvent){let t=e.detail.route;const a=this.renderRoot.querySelector("mateu-ux");a&&(a.setAttribute("route",t),a.setAttribute("instant",Ne()))}}}createRenderRoot(){return J.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),this._themeMirrorDisposer=ky(this),ut.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!ut.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;Sy(this._lastUrl,t.location)&&(this.navigationKey=Ne()),this.loadUrl(t)},this.top=="true"?(Lu(this.baseUrl),this.bundleUrl&&cu(this.bundleUrl),this.loadUrl(window)):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);pe.value={...pe.value,...e}}catch{pe.value={...pe.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this._themeMirrorDisposer?.(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=Ne(),this._lastUrl=e.location.href,e.location.search){const a=new URLSearchParams(e.location.search).get("overrides");if(a&&(this.config=a,this.config))try{const r=JSON.parse(this.config);pe.value={...pe.value,...r}}catch{pe.value={...pe.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,a=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(a)?t.substring(a.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return n`
           <mateu-api-caller>
                ${Cc(this.navigationKey,n`<mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${ba.value}"
                          .appState="${pe.value}"
                ></mateu-ux>`)}
           </mateu-api-caller>
           ${this.debug?n`
               <mateu-debug-overlay
                   .appState="${pe.value}"
                   .appData="${ba.value}"
               ></mateu-debug-overlay>
           `:d}
       `}};Re.styles=k`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;rt([h()],Re.prototype,"baseUrl",2);rt([h()],Re.prototype,"route",2);rt([h()],Re.prototype,"consumedRoute",2);rt([h()],Re.prototype,"config",2);rt([h()],Re.prototype,"top",2);rt([h()],Re.prototype,"pathPrefix",2);rt([h()],Re.prototype,"bundleUrl",2);rt([b()],Re.prototype,"instant",2);rt([b()],Re.prototype,"navigationKey",2);rt([h({type:Boolean})],Re.prototype,"debug",2);Re=rt([_("mateu-ui")],Re);var Iy=Object.defineProperty,Ty=Object.getOwnPropertyDescriptor,Ra=(e,t,a,r)=>{for(var i=r>1?void 0:r?Ty(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Iy(t,a,i),i};let tt=class extends I{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.searchText=""}connectedCallback(){super.connectedCallback(),Hc()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(Fs()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"—";const t=(this.searchedOptions??this.selector.options)?.find(r=>String(r.value)===e);if(t)return t.label;const a=Yn()[this.selector.fieldName];return a!==void 0?String(a):e}pick(e,t){jc(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText="",this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector("input.picker-search")?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){const e=this.app;if(e?.serverSideType)try{const t=await Aa.runAction(this.baseUrl??"",e.rootRoute??e.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(const a of t?.fragments??[]){const s=a.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(s)){this.searchedOptions=s.map(o=>({value:o.value,label:o.label??String(o.value)}));return}}}catch{}}visibleOptions(){const e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(a=>a.label.toLowerCase().includes(t)):e}renderPanel(){const e=this.currentValue(),t=this.visibleOptions(),a=this.searchText!==""||t.length>tt.SEARCHABLE_THRESHOLD;return n`
            <div class="panel">
                ${a?n`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${r=>{r.key==="Escape"&&this.closePanel()}}"/>`:d}
                <div class="options">
                    ${e?n`
                        <div class="option option--clear" @click="${()=>this.pick("")}">— (clear)</div>`:d}
                    ${t.map(r=>n`
                        <div class="option ${e===String(r.value)?"option--selected":""}"
                             @click="${()=>this.pick(r.value,r.label)}">${r.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?n`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():d}
            </label>`:n``}};tt.SEARCHABLE_THRESHOLD=7;tt.styles=k`
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
    `;Ra([h()],tt.prototype,"selector",2);Ra([h()],tt.prototype,"app",2);Ra([h()],tt.prototype,"baseUrl",2);Ra([b()],tt.prototype,"opened",2);Ra([b()],tt.prototype,"searchText",2);Ra([b()],tt.prototype,"searchedOptions",2);tt=Ra([_("mateu-app-context-picker")],tt);var Ay=Object.defineProperty,Py=Object.getOwnPropertyDescriptor,Dr=(e,t,a,r)=>{for(var i=r>1?void 0:r?Py(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Ay(t,a,i),i};let Ca=class extends I{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){const a=this.app;if(a?.serverSideType)try{const r=await Aa.runAction(this.baseUrl??"",a.rootRoute??a.initialRoute??"","",e,"notification-bell",void 0,a.serverSideType,{},t,this,!0);for(const i of r?.fragments??[]){const o=i.data?._notifications;if(Array.isArray(o)){this.notifications=o;return}}}catch{}}refresh(){return this.runNotificationsAction("_notifications-list",{})}markRead(e){return this.runNotificationsAction("_notifications-read",{ids:e})}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);const t=e.route;if(t){if(!ut.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return n`
            <div role="button" tabindex="0" class="entry ${e.unread?"entry--unread":""}"
                 @click="${()=>this.entryClicked(e)}" @keydown="${te(()=>this.entryClicked(e))}">
                <span class="unread-dot" aria-hidden="true"></span>
                <div class="entry-body">
                    <div class="entry-top">
                        <span class="entry-title">${e.title}</span>
                        ${e.when?n`<span class="entry-when">${e.when}</span>`:d}
                    </div>
                    ${e.text?n`<div class="entry-text">${e.text}</div>`:d}
                </div>
            </div>`}renderPanel(){return n`
            <div class="panel">
                <div class="entries">
                    ${this.notifications.length===0?n`
                        <div class="empty">No notifications</div>`:d}
                    ${this.notifications.map(e=>this.renderEntry(e))}
                </div>
                ${this.notifications.length>0?n`
                    <div class="footer">
                        <button class="mark-all" ?disabled="${this.unreadCount()===0}"
                                @click="${()=>this.markRead("all")}">Mark all read</button>
                    </div>`:d}
            </div>`}render(){const e=this.unreadCount();return n`
            <div class="root">
                <button class="bell-button" data-access-key-target title="Notifications" aria-label="Notifications"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    <svg class="bell-icon" viewBox="0 0 24 24" aria-hidden="true"
                         fill="none" stroke="currentColor" stroke-width="1.8"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    ${e>0?n`<span class="badge">${e>99?"99+":e}</span>`:d}
                </button>
                ${this.opened?this.renderPanel():d}
            </div>`}};Ca.styles=k`
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
            /* the header's one icon colour (mateu-app: --mateu-header-icon-color) */
            color: var(--mateu-header-icon-color, var(--lumo-secondary-text-color, #5a6573));
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
    
        ${le}
    `;Dr([h()],Ca.prototype,"app",2);Dr([h()],Ca.prototype,"baseUrl",2);Dr([b()],Ca.prototype,"opened",2);Dr([b()],Ca.prototype,"notifications",2);Ca=Dr([_("mateu-notification-bell")],Ca);const ec=e=>{if(!e||!("querySelectorAll"in e))return null;for(const t of e.querySelectorAll("*")){if(t.tagName?.toLowerCase()==="mateu-component")return t;const a=ec(t.shadowRoot);if(a)return a}return null},Oy=async(e,t,a)=>{const r=t.renderRoot??t,i=ec(r);await Wd.runAction(Aa,t.baseUrl??"",e.rootRoute||"_no_route","",a,i?.id??"app-header-action",{},e.serverSideType??"",{},{},i??t,!0,void 0,!1,"")};var Ry=Object.defineProperty,zy=Object.getOwnPropertyDescriptor,vo=(e,t,a,r)=>{for(var i=r>1?void 0:r?zy(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Ry(t,a,i),i};let Ai=class extends I{constructor(){super(...arguments),this.shown=!1}createRenderRoot(){return this}connectedCallback(){if(super.connectedCallback(),!this.shown){if(typeof IntersectionObserver>"u"){this.shown=!0;return}this.observer=new IntersectionObserver(e=>{e.some(t=>t.isIntersecting)&&(this.shown=!0,this.observer?.disconnect(),this.observer=void 0)}),this.observer.observe(this)}}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0}render(){return this.shown&&this.content?this.content():n`<div class="mateu-when-visible-placeholder" style="min-height: 1px;">${d}</div>`}};vo([h({attribute:!1})],Ai.prototype,"content",2);vo([b()],Ai.prototype,"shown",2);Ai=vo([_("mateu-when-visible")],Ai);const Ly=e=>!!e&&/[?&]_lazy=1(&|$)/.test(e);var Dy=Object.defineProperty,My=Object.getOwnPropertyDescriptor,Wi=(e,t,a,r)=>{for(var i=r>1?void 0:r?My(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Dy(t,a,i),i};const Ny=e=>(e.children??[]).filter(t=>t&&t.component!=="hr"&&t.text).map(t=>{const a=(t.children??[]).filter(r=>r&&r.text&&r.component!=="hr");return{item:t,title:String(t.text??""),description:String(t.description??""),icon:String(t.icon??""),image:String(t.image??""),navigable:a.length===0,actions:a}}),wn=e=>!!e&&e.display==="cards"&&(e.children?.length??0)>0;let Ya=class extends I{constructor(){super(...arguments),this.open=!1,this.outside=e=>{e.composedPath().includes(this)||(this.open=!1)},this.escape=e=>{e.key==="Escape"&&this.open&&(this.open=!1,this.renderRoot.querySelector(".trigger")?.focus())}}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this.outside,!0),document.addEventListener("keydown",this.escape)}disconnectedCallback(){document.removeEventListener("click",this.outside,!0),document.removeEventListener("keydown",this.escape),super.disconnectedCallback()}select(e,t){t?.stopPropagation(),this.open=!1,this.onSelect?.(e)}renderIcon(e){return e.image?n`<img class="visual image" src="${e.image}" alt="" />`:e.icon&&customElements.get("vaadin-icon")?n`<vaadin-icon class="visual icon" icon="${e.icon}"></vaadin-icon>`:d}render(){const e=this.item;if(!e)return d;const t=Ny(e);return n`
            <button class="trigger ${e.selected?"active":""}" type="button" data-access-key-target
                    aria-haspopup="true" aria-expanded="${this.open?"true":"false"}"
                    @click="${()=>{this.open=!this.open}}">
                ${e.text}<span class="chevron" aria-hidden="true">▾</span>
            </button>
            ${this.open?n`
                <div class="panel" role="menu" aria-label="${e.text??""}">
                    ${t.map(a=>n`
                        <div class="card ${a.navigable?"navigable":""} ${a.item.selected?"active":""}"
                             role="${a.navigable?"menuitem":"group"}"
                             tabindex="${a.navigable?"0":d}"
                             aria-label="${a.title}"
                             @click="${a.navigable?r=>this.select(a.item,r):d}"
                             @keydown="${a.navigable?r=>{(r.key==="Enter"||r.key===" ")&&(r.preventDefault(),this.select(a.item,r))}:d}">
                            ${this.renderIcon(a)}
                            <div class="body">
                                <div class="title">${a.title}</div>
                                ${a.description?n`<div class="description">${a.description}</div>`:d}
                                ${a.actions.length?n`
                                    <div class="actions">
                                        ${a.actions.map(r=>n`
                                            <button class="action" type="button" role="menuitem"
                                                    @click="${i=>this.select(r,i)}">${r.text}</button>`)}
                                    </div>`:d}
                            </div>
                        </div>`)}
                </div>`:d}
        `}};Ya.styles=k`
        :host { position: relative; display: inline-flex; }
        .trigger {
            font: inherit; background: none; border: 0; cursor: pointer; display: inline-flex; align-items: center;
            gap: 0.25rem; padding: 0.5rem 0.75rem; border-radius: var(--lumo-border-radius-m, 6px);
            color: var(--lumo-body-text-color, inherit);
        }
        .trigger:hover, .trigger[aria-expanded="true"] { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .trigger.active { font-weight: 600; }
        .trigger:focus-visible, .card:focus-visible, .action:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #0b6bcb); outline-offset: 2px;
        }
        .chevron { font-size: 0.75em; opacity: 0.7; }
        .panel {
            position: absolute; top: calc(100% + 0.25rem); left: 0; z-index: 1000;
            display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 0.5rem;
            width: min(44rem, calc(100vw - 2rem)); padding: 0.75rem; box-sizing: border-box;
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 10px);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 24px rgba(0,0,0,.15));
        }
        .card {
            display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.75rem;
            border-radius: var(--lumo-border-radius-m, 6px);
        }
        .card.navigable { cursor: pointer; }
        .card.navigable:hover, .card.active { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .visual { flex: 0 0 auto; }
        .icon { width: 1.5rem; height: 1.5rem; color: var(--lumo-primary-color, #0b6bcb); }
        .image { width: 2.5rem; height: 2.5rem; object-fit: cover; border-radius: var(--lumo-border-radius-s, 4px); }
        .body { min-width: 0; }
        .title { font-weight: 600; font-size: var(--lumo-font-size-m, 1rem); }
        .description { margin-top: 0.125rem; font-size: var(--lumo-font-size-s, 0.875rem); color: var(--lumo-secondary-text-color, #555); }
        .actions { margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.25rem 0.75rem; }
        .action {
            font: inherit; font-size: var(--lumo-font-size-s, 0.875rem); background: none; border: 0; padding: 0;
            cursor: pointer; color: var(--lumo-primary-text-color, #0b6bcb);
        }
        .action:hover { text-decoration: underline; }
    `;Wi([h({attribute:!1})],Ya.prototype,"item",2);Wi([h({attribute:!1})],Ya.prototype,"onSelect",2);Wi([b()],Ya.prototype,"open",2);Ya=Wi([_("mateu-card-menu")],Ya);const Fy=(e,t)=>e?n`<mateu-when-visible style="display: block; width: 100%;" .content="${t}"></mateu-when-visible>`:t(),xn=async(e,t,a)=>{try{await Oy(e,t,a)}catch(r){lt({text:"La acción falló: "+r,position:"bottomStart",duration:6e3,variant:"error"},t)}},tc=(e,t)=>{const a=e.contextSelectors??[],r=e.contextActions??[];return a.length===0&&r.length===0&&!e.notificationsEnabled?d:n`${e.notificationsEnabled?n`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-notification-bell>`:d}${a.map(i=>n`
        <mateu-app-context-picker .selector="${i}" .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-app-context-picker>`)}${r.map(i=>(i.children?.length??0)>0?n`
        <details class="mateu-nav-group" style="flex-shrink: 0;">
            <summary class="app-header-action-btn">${i.label} ▾</summary>
            <div class="mateu-nav-panel" style="right: 0; left: auto;">
                ${i.children.map(s=>n`
                    <button class="mateu-nav-item" @click="${()=>s.actionId&&xn(e,t,s.actionId)}">${s.label}</button>`)}
            </div>
        </details>`:n`
        <button class="app-header-action-btn" style="flex-shrink: 0;"
            @click="${()=>i.actionId&&xn(e,t,i.actionId)}" title="${i.label}">${i.icon?V(i.icon):d}${i.label}</button>`)}`},kn=(e,t)=>n`
    <button class="mateu-nav-item ${e.selected?"mateu-nav-item--active":""} ${e.className??""}"
            ?disabled="${e.disabled}"
            title="${e.title??d}"
            @click="${()=>t(e)}">${e.text}</button>`,Yr=(e,t=!0)=>n`
    <div class="m-hl" style="align-items: ${e.title?"baseline":"center"}; min-width: 0;">
        ${e.logo?n`<img src="${e.logo}" alt="logo" height="28px" style="margin-left: ${t?"10px":"0"}; align-self: center;">`:d}
        ${e.title?n`<h2 class="mateu-app-title" style="margin: 0 var(--lumo-space-l, 1.5rem) 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${e.title}</h2>`:d}
    </div>`,Jr="flex: 1; min-width: 0; align-items: baseline;",Xr="m-hl mateu-app-header",go=(e,t,a="")=>n`
    <nav class="mateu-nav ${a}">
        ${e.map(r=>(r.children?.length??0)>0?n`<details class="mateu-nav-group">
                       <summary class="mateu-nav-item">${r.text} ▾</summary>
                       <div class="mateu-nav-panel">
                           ${r.children.map(i=>kn(i,t))}
                       </div>
                   </details>`:kn(r,t))}
    </nav>`,ac=(e,t,a)=>{const r=o=>J.get()?.renderTopNav?.(o,t,a)??go(o,t,a);if(!e.some(wn))return r(e);const i=[];let s=[];for(const o of e)wn(o)?(s.length&&i.push(r(s)),s=[],i.push(n`<mateu-card-menu .item=${o} .onSelect=${t}></mateu-card-menu>`)):s.push(o);return s.length&&i.push(r(s)),n`<div class="mateu-nav-with-cards" style="display: flex; align-items: center; flex-wrap: wrap; min-width: 0;">${i}</div>`},qy=(e,t)=>{const a=[{text:"☰",children:e,className:"mateu-menu-button-root","aria-label":"Menu"}];return J.get()?.renderTopNav?.(a,t,"menu-button")??go(a,t,"menu-button")},ti=(e,t)=>a=>t.call(e,{detail:{value:a}}),By=(e,t)=>e.backRoute?n`
        <a href="${e.backRoute}" class="mateu-back-link"
           style="align-self: center; margin-left: 10px; white-space: nowrap; font-size: var(--lumo-font-size-s, .875rem);"
           @click="${a=>{a.preventDefault(),ut.confirmLeave()&&mt(t,e.backRoute)}}">← ${e.backLabel??"Back"}</a>`:d,bo=e=>J.get()?.renderHeaderIconButton?.(e)??n`
        <button class="app-chrome-icon-btn ${e.cssClasses??""}" @click="${e.onClick}"
            title="${e.title??e.label}" aria-label="${e.label}"
            aria-pressed="${e.pressed===void 0?d:String(e.pressed)}"
            aria-expanded="${e.expanded===void 0?d:String(e.expanded)}"
            aria-controls="${e.controls??d}">
            ${V(e.icon,"width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem); color: currentColor;")}
        </button>`,rc=(e,t)=>e.themeToggle?bo({icon:t.isDark?"vaadin:sun-o":"vaadin:moon-o",label:Pe(t.isDark?"lightMode":"darkMode"),cssClasses:"mateu-theme-toggle",onClick:()=>t.toggleTheme()}):d,ic=(e,t)=>e.sseUrl?bo({icon:"vaadin:comments-o",label:Pe("chat"),title:Pe(t.chatOpen?"closeChat":"openChat"),pressed:!!t.chatOpen,cssClasses:"mateu-chat-toggle"+(t.chatOpen?" mateu-chat-toggle--open":""),onClick:()=>t.showHideIa()}):d,hr=(e,t)=>n`
    ${ic(e,t)}
    <slot name="widgets"></slot>
    ${tc(e,t)}${rc(e,t)}`,Wt=(e,t,a,r)=>e.sseUrl?n`<mateu-chat slot="${t.chatOpen?"detail":"detail-hidden"}" sseurl="${e.sseUrl}" .label="${e.askLabel}" .mcpUrl="${e.mcpUrl}" .uploadUrl="${e.uploadUrl}" .menu="${e.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:r,componentState:t.state,componentData:t.data})}" @navigation-requested="${t.updateRoute}" @close-requested="${t.showHideIa}"></mateu-chat>`:d,Uy=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},_n=(e,t,a)=>{const r=nt(e,t,a),i=he(t,a);return r=="list"||r==i?"new":r},nt=(e,t,a)=>{const r=e?._route;if(r!=null&&(r===""||r.startsWith("/"))){const i=a.homeRoute??"",s=i.indexOf("?"),o=s>=0?i.substring(s+1):"",l=he(t,a)+r;if(!o)return l;const c=l.indexOf("?")>=0?"&":"?";return l+c+o}return t.selectedRoute?t.selectedRoute:a.homeRoute},he=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,Ke=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:e.baseUrl||t.homeBaseUrl,De=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,Ye=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,jy=(e,t)=>"ux_"+((he(e,t)||"root")+"|"+(De(e,t)??"")).replace(/[^a-zA-Z0-9]/g,"_"),Hy=e=>bo({icon:e.sectionsOpen?"lumo:cross":"lumo:menu",label:Pe("sections"),expanded:!!e.sectionsOpen,controls:"mateu-sections-panel",cssClasses:"mateu-sections-toggle"+(e.sectionsOpen?" mateu-sections-toggle--open":""),onClick:()=>{e.sectionsOpen=!e.sectionsOpen}}),Wy=(e,t,a)=>a.sectionsOpen?n`
    <div class="mateu-sections-scrim" @click="${()=>{a.sectionsOpen=!1}}"></div>
    <nav class="mateu-sections-panel" id="mateu-sections-panel" aria-label="${Pe("sections")}"
         @keydown="${r=>{r.key==="Escape"&&(a.sectionsOpen=!1)}}">
        ${e.filter(r=>!r.separator&&r.visible!==!1).map(r=>n`
            <button class="mateu-section-link ${r===t?"mateu-section-link--active":""} ${r.unavailable?"mateu-nav-unavailable":""}"
                    aria-current="${r===t?"page":d}"
                    title="${r.unavailable?r.description??d:d}"
                    @click="${()=>a.selectSection(r)}">
                ${r.icon?V(r.icon,"width: var(--lumo-icon-size-s, 1.125rem); height: var(--lumo-icon-size-s, 1.125rem); flex-shrink: 0;"):d}
                <span>${r.label}</span>
            </button>`)}
    </nav>`:d,Vy=(e,t)=>{if(!e)return d;const a=ti(t,t.itemSelected),r=at(e)?[]:t.mapItems(e.submenus??[],"");return n`
        <a href="javascript: void(0);" class="mateu-app-band-title mateu-section-title"
           @click="${()=>t.selectSection(e)}">${e.label}</a>
        ${r.length>0?ac(r,a,"menu-on-top sections-band"):d}`},Gy=(e,t,a,r,i,s,o)=>{const l=jy(e,t);if(t.chromeless)return n`
            <div class="app chromeless">
                <div role="main" class="${"app-content"+(e.pageCompact?" no-padding":"")}" style="height: 100%;">
                    <div class="m-md">
                        <div class="m-scroll" style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        data-content-view
                                        route="${nt(r,e,t)}"
                                        id="${l}"
                                        baseUrl="${Ke(e,t)}"
                                        consumedRoute="${he(e,t)}"
                                        serverSideType="${De(e,t)}"
                                        uriPrefix="${Ye(e,t)}"
                                        style="width: 100%;"
                                        .appState="${s}"
                                        .appData="${o}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                        ${Wt(t,e,s,o)}
                    </div>
                </div>
                <slot></slot>
            </div>
        `;const c=e.mapItems(t.menu,e.filter?.toLowerCase()??""),u=he(e,t),p=_n(r,e,t),m=p&&p!=="new"&&p.startsWith(u+"/")?p.substring(u.length+1).split("/")[0]:void 0;return n`
                    ${t.variant==Xe.MEDIATOR?n`

                        ${t.layout=="SPLIT"?n`
                            <div class="m-md">
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            data-content-view
                                            route="${he(e,t)}"
                                            id="${l}"
                                            baseUrl="${Ke(e,t)}"
                                            consumedRoute="${he(e,t)}"
                                            serverSideType="${De(e,t)}"
                                            uriPrefix="${Ye(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...s,_splitDetailId:m}}"
                                            .appData="${o}"
                                            instant="${u}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            data-content-view
                                            route="${_n(r,e,t)}"
                                            id="${l}_detail"
                                            baseUrl="${Ke(e,t)}"
                                            consumedRoute="${he(e,t)}"
                                            serverSideType="${De(e,t)}"
                                            uriPrefix="${Ye(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>

                            </div>
                        `:Fy(Ly(t.homeRoute),()=>n`
                            <mateu-api-caller>
                                <mateu-ux
                                        data-content-view
                                        route="${nt(r,e,t)}"
                                        id="${l}"
                                        baseUrl="${Ke(e,t)}"
                                        consumedRoute="${he(e,t)}"
                                        serverSideType="${De(e,t)}"
                                        uriPrefix="${Ye(e,t)}"
                                        style="width: 100%;"
                                        .appState="${s}"
                                        .appData="${o}"
                                        .initialState="${r}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `)}
                        
`:d}
            ${t.variant==Xe.HAMBURGUER_MENU||t.variant==Xe.HAMBURGER_MENU?n`
                <div class="mateu-app-layout m-app-layout ${t.drawerClosed?"":"drawer-open"} ${t?.cssClasses}" style="${t?.style}">
                    <header class="app-navbar">
                        <button class="drawer-toggle" title="Menu"
                                @click="${f=>f.currentTarget.closest(".m-app-layout")?.classList.toggle("drawer-open")}">
                            ${V("vaadin:menu")}
                        </button>
                        <h2 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; margin: 0 .5rem;">${t.title}</h2><p style="margin: 0;">${t.subtitle}</p>
                        <div class="m-hl" style="margin-left: auto; align-items: center;">
                            ${hr(t,e)}
                        </div>
                    </header>
                    <div class="app-body">
                        <aside class="app-drawer p-s" @navigation-requested="${e.updateRoute}">
                            ${t.menu&&t.totalMenuOptions>10?n`
                                <div style="position: sticky; top: 0; z-index: 2; background: var(--lumo-base-color); padding: .25rem 0 .5rem;">
                                    <input class="drawer-search" placeholder="Search…" style="width: calc(100% - 20px); margin: 0 10px;"
                                           @input="${f=>Uy({detail:{value:f.target.value}},e)}">
                                </div>
                                `:d}
                            <nav class="side-nav">
                                ${e.renderSideNav(c,void 0)}
                            </nav>
                        </aside>
                        <div role="main" class="${"app-content"+(e.pageCompact?" no-padding":"")}" style="flex: 1; min-width: 0;">
                            <div class="m-md">
                                <div class="m-scroll" style="height: 100%;">
                                    <mateu-api-caller>
                                        <mateu-ux
                                                data-content-view
                                                route="${nt(r,e,t)}"
                                                id="${l}"
                                                baseUrl="${Ke(e,t)}"
                                                consumedRoute="${he(e,t)}"
                                                serverSideType="${De(e,t)}"
                                                uriPrefix="${Ye(e,t)}"
                                                style="width: 100%;"
                                                .appState="${s}"
                                                .appData="${o}"
                                                instant="${e.instant}"
                                                @navigation-requested="${e.updateRoute}"
                                        ></mateu-ux>
                                    </mateu-api-caller>
                                </div>
                                ${Wt(t,e,s,o)}
                            </div>
                        </div>
                    </div>
                </div>

            `:d}
            
            ${t.variant==Xe.MENU_ON_TOP?n`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <!-- TWO BANDS, like the Redwood header: band 1 = the logo on the left and the
                         widgets on the right; band 2 = the app's title, then its menu as a horizontal
                         bar. A narrow viewport folds the menu into a ☰ button next to the title. -->
                    <div class="m-hl mateu-app-band1"
                            style="width: 100%; height: 3.5rem; flex-shrink: 0; align-items: center; background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${Xr}" style="${Jr}" theme="spacing">
                        <a href="javascript: void(0);" @click="${()=>e.goHome()}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                        ${Yr({...t,title:""},!1)}
                        </a>
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${hr(t,e)}
                        </div>
                    </div>
                    </div>
                    <nav class="mateu-app-band2" aria-label="${t.title||"Menu"}"
                            @navigation-requested="${e.updateRoute}">
                        <div class="mateu-app-menu-button">
                            ${qy(c,ti(e,e.itemSelected))}
                        </div>
                        ${t.title?n`<a href="javascript: void(0);" @click="${()=>e.goHome()}" class="mateu-app-band-title">${t.title}</a>`:d}
                        ${(()=>{const f=ti(e,e.itemSelected);return ac(c,f,"menu-on-top menu-band")})()}
                    </nav>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll mateu-content-gutter" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${nt(r,e,t)}"
                                            id="${l}"
                                            baseUrl="${Ke(e,t)}"
                                            consumedRoute="${he(e,t)}"
                                            serverSideType="${De(e,t)}"
                                            uriPrefix="${Ye(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${Wt(t,e,s,o)}
                        </div>
                    </div>
                </div>

            `:d}

            ${t.variant==Xe.HAMBURGER_SECTIONS?(()=>{const f=e.activeSectionOf(t.menu);return n`
                <div class="m-vl mateu-sections-shell" style="width: 100%; height: 100vh; overflow: hidden; position: relative;">
                    <div class="m-hl mateu-app-band1"
                            style="width: 100%; height: 3.5rem; flex-shrink: 0; align-items: center; background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${Xr}" style="${Jr}" theme="spacing">
                        ${Hy(e)}
                        <a href="javascript: void(0);" @click="${()=>{e.sectionsOpen=!1,e.goHome()}}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                        ${Yr(t,!1)}
                        </a>
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${hr(t,e)}
                        </div>
                    </div>
                    </div>
                    <nav class="mateu-app-band2 mateu-section-band ${f?"":"mateu-section-band--empty"}"
                            aria-label="${f?.label||t.title||"Menu"}" ?inert="${!f}"
                            @navigation-requested="${e.updateRoute}">
                        ${Vy(f,e)}
                    </nav>
                    ${Wy(t.menu??[],f,e)}
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll mateu-content-gutter" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${nt(r,e,t)}"
                                            id="${l}"
                                            baseUrl="${Ke(e,t)}"
                                            consumedRoute="${he(e,t)}"
                                            serverSideType="${De(e,t)}"
                                            uriPrefix="${Ye(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${Wt(t,e,s,o)}
                        </div>
                    </div>
                </div>
            `})():d}

            ${t.variant==Xe.TILES?n`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${Xr}" style="${Jr}" theme="spacing">
                        <a href="javascript: void(0);" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                        ${Yr(t)}
                        </a>
                        ${go(e.mapItemsForTiles(t.menu),ti(e,e.itemSelectedTiles),"menu-on-top")}
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${hr(t,e)}
                        </div>
                    </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):n`
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${nt(r,e,t)}"
                                            id="${l}"
                                            baseUrl="${Ke(e,t)}"
                                            consumedRoute="${he(e,t)}"
                                            serverSideType="${De(e,t)}"
                                            uriPrefix="${Ye(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${Wt(t,e,s,o)}
                        </div>
                        `}
                    </div>
                </div>
            `:d}

            ${t.variant==Xe.RAIL?n`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):d}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${nt(r,e,t)}"
                                            id="${l}"
                                            baseUrl="${Ke(e,t)}"
                                            consumedRoute="${he(e,t)}"
                                            serverSideType="${De(e,t)}"
                                            uriPrefix="${Ye(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${Wt(t,e,s,o)}
                        </div>
                    </div>
                </div>
            `:d}

            ${t.variant==Xe.MENU_ON_LEFT?n`

                <div class="m-hl">
                    <div class="m-scroll" style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <div class="m-vl"
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(f=>e.renderOptionOnLeftMenu(f))}
                            ${ic(t,e)}${tc(t,e)}${rc(t,e)}
                        </div>
                    </div>
                    <div role="main" class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${nt(r,e,t)}"
                                            id="${l}"
                                            baseUrl="${Ke(e,t)}"
                                            consumedRoute="${he(e,t)}"
                                            serverSideType="${De(e,t)}"
                                            uriPrefix="${Ye(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${s}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${Wt(t,e,s,o)}
                        </div>
                    </div>
                </div>


            `:d}

            ${t.variant==Xe.TABS?n`
                <!--
                
                box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
                
                -->
                
                <div>
                    <div>
                        <div class="${Xr}" 
                                style="width: 100%; ${Jr} border-bottom: 1px solid var(--lumo-contrast-10pct);" 
                                theme="spacing"
                                @navigation-requested="${e.updateRoute}">
                            ${By(t,e)}
                            <a href="javascript: void(0);" @click="${()=>e.goHome()}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                            ${Yr(t)}
                            </a>
                            <nav class="mateu-tabs ${e.component?.cssClasses??""}" style="flex-grow: 1; min-width: 0; margin-left: 1.5rem;">
                                ${(t.menu?.length??0)<2?d:t.menu.map((f,g)=>n`
                                <button class="mateu-tab ${g===e.getSelectedIndex(t.menu)?"mateu-tab--active":""}"
                                        @click="${()=>e.selectRoute(f.consumedRoute,f.route,f.actionId,f.baseUrl,f.serverSideType,f.uriPrefix,f.rules)}"
                                >${f.label}</button>`)}
                            </nav>
                            <div class="m-hl mateu-app-widgets" style="align-items: center;">
                                ${hr(t,e)}
                            </div>
                        </div>
                    </div>
                    <div role="main" class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${nt(r,e,t)}"
                                            id="${l}"
                                            baseUrl="${Ke(e,t)}"
                                            consumedRoute="${he(e,t)}"
                                            serverSideType="${De(e,t)}"
                                            uriPrefix="${Ye(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${Wt(t,e,s,o)}
                        </div>
                    </div>
                </div>
            
            `:d}

            ${t.fabs?.map((f,g)=>n`
                <button class="app-fab" style="${Zl(g)}" ${ao("shell",g)} aria-label="${f.label}"
                    @click="${()=>e.runAction(f.actionId)}"
                    title="${f.label}">
                    ${V(f.icon)}
                </button>
            `)}
            ${e.renderCommandPalette()}
            <slot></slot>
       `};class Ky{renderFilterBar(t,a,r,i,s,o,l,c){const u=a?.metadata,p=f=>{const{fieldId:g,value:y}=f.detail;t.state={...t.state,[g]:y}},m=f=>{const{fieldIds:g}=f.detail,y={};g.forEach($=>{y[$]=void 0}),y.searchText=void 0,t.state={...t.state,...y}};return n`
            <mateu-filter-bar
                .metadata="${u}"
                @search-requested="${t.search}"
                @value-changed="${p}"
                @filter-reset-requested="${m}"
                .state="${t.state}"
                .data="${s}"
                .appState="${o}"
                .appData="${l}"
                ?searchOnly="${c??!1}"
            >
                ${u?.header?.map(f=>x(t,f,r,i,s,o,l))}
            </mateu-filter-bar>
        `}renderPagination(t,a){return n`
        <mateu-pagination
                @page-changed="${t.pageChanged}"
                @fetch-more-elements="${t.fetchMoreElements}"
                .totalElements="${t.data[a?.id]?.page?.totalElements??0}"
                .pageSize="${t.data[a?.id]?.page?.pageSize??10}"
                data-testid="pagination"
                .pageNumber="${t.data[a?.id]?.page?.pageNumber??0}"
        ></mateu-pagination>
        `}renderTableComponent(t,a,r,i,s,o,l){const c=t.data?.[t.id]?.page?.content??[];return xs(a,c,i[a?.id]?.emptyStateMessage)}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,a,r,i,s,o,l,c){const u=a?.metadata?.type??a?.type,p=Object.values(v).includes(u)?u:void 0;return sg(this.supportedClientSideTypes(),p)?xd(a,p,this.rendererName()):uo(t,a,r,i,s,o,l,c)}renderAppComponent(t,a,r,i,s,o,l){return Gy(t,a?.metadata,r,i,s,o,l)}}const Yy=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=u=>n`${x(e,u,a,r,i,s,o)}`;return n`
        <vaadin-virtual-list
                .items="${l.page.content}"
                ${bc(c,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
        ></vaadin-virtual-list>
    `},Jy=e=>{const t=e.metadata;return n`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${yc(()=>n`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>${t.text}</div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
    `},Xy=(e,t={})=>{const a=e.metadata,r=a.valueKey?t[a.valueKey]:a.value;return n`
        <div style="${e.style}">
        <vaadin-progress-bar
                ?indeterminate="${a.indeterminate}"
                min="${a.min&&a.min!=0?a.min:d}"
                max="${a.max&&a.max!=0?a.max:d}"
                value="${r??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
        ></vaadin-progress-bar>
        ${a.text?n`<span class="text-secondary text-xs" id="sublbl">
    ${a.text}
  </span>`:d}
        </div>
    `},Qy=(e,t,a,r,i,s,o)=>{const l=t.metadata;return n`
        <vaadin-details
                ?opened="${l.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            <vaadin-details-summary slot="summary">
            ${x(e,l.summary,a,r,i,s,o)}
            </vaadin-details-summary>
            ${x(e,l.content,a,r,i,s,o)}
        </vaadin-details>
            `},Zy=(e,t,a)=>{const r=e.metadata;return n`<vaadin-avatar
            img="${r.image}"
            name="${Me(r.name,t,a)}"
            abbr="${r.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??d}"
    ></vaadin-avatar>`},e$=e=>{const t=e.metadata;return n`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??d}">
    </vaadin-avatar-group>`},t$=(e,t,a,r,i,s,o)=>{const l=t.metadata;if(!l)return n``;let c="";return l.variants?.map(u=>u=="stretchMedia"?"stretch-media":u=="coverMedia"?"cover-media":u).forEach(u=>c+=" "+u),c=c.trim(),n`
        <vaadin-card
                style="${t.style}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${l.media?pa(e,l.media,a,r,i,s,o,"media",!1):d}
            ${l.title?pa(e,l.title,a,r,i,s,o,"title",!1):d}
            ${l.subtitle?pa(e,l.subtitle,a,r,i,s,o,"subtitle",!1):d}
            ${l.header?pa(e,l.header,a,r,i,s,o,"header",!1):d}
            ${l.headerPrefix?pa(e,l.headerPrefix,a,r,i,s,o,"header-prefix",!1):d}
            ${l.headerSuffix?pa(e,l.headerSuffix,a,r,i,s,o,"header-suffix",!1):d}
            ${l.footer?pa(e,l.footer,a,r,i,s,o,"footer",!1):d}
            ${l.content?x(e,l.content,a,r,i,s,o,!1):d}
        </vaadin-card>
    `},a$=640,r$=e=>e>0&&e<a$?"accordion":"tabs";var i$=Object.defineProperty,s$=Object.getOwnPropertyDescriptor,Vi=(e,t,a,r)=>{for(var i=r>1?void 0:r?s$(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&i$(t,a,i),i};let Ja=class extends I{constructor(){super(...arguments),this.tabLabels=[],this.mode="tabs",this.selected=0,this.selectedChangedListener=e=>{const t=e.detail?.value;typeof t=="number"&&t>=0&&(this.selected=t)}}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)this.mode=r$(t.contentRect.width)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=void 0,this.detachTabsListener()}detachTabsListener(){this.slottedTabs?.removeEventListener("selected-changed",this.selectedChangedListener),this.slottedTabs=void 0}tabsSlotChanged(e){this.detachTabsListener();const a=e.target.assignedElements().find(r=>"selected"in r);a&&(this.slottedTabs=a,a.addEventListener("selected-changed",this.selectedChangedListener),a.selected=this.selected)}select(e){this.selected=e,this.slottedTabs&&(this.slottedTabs.selected=e)}updated(){this.slottedTabs&&this.slottedTabs.selected!=this.selected&&(this.slottedTabs.selected=this.selected)}render(){return n`
            <div class="strip" ?hidden="${this.mode!="tabs"}">
                <slot name="tabs" @slotchange="${this.tabsSlotChanged}"></slot>
            </div>
            ${this.mode=="tabs"?n`
                ${this.tabLabels.map((e,t)=>n`
                    <div class="panel" ?hidden="${t!=this.selected}">
                        <slot name="panel-${t}"></slot>
                    </div>
                `)}
            `:n`
                <div class="accordion" part="accordion">
                    ${this.tabLabels.map((e,t)=>n`
                        <div class="acc-item">
                            <button class="acc-header"
                                    aria-expanded="${t==this.selected}"
                                    aria-controls="acc-body-${t}"
                                    @click="${()=>this.select(t)}"
                            >
                                <span>${e??d}</span>
                                <span class="chevron">⟩</span>
                            </button>
                            <div class="acc-body" id="acc-body-${t}" ?hidden="${t!=this.selected}">
                                <slot name="panel-${t}"></slot>
                            </div>
                        </div>
                    `)}
                </div>
            `}
        `}};Ja.styles=k`
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
    `;Vi([h({type:Array})],Ja.prototype,"tabLabels",2);Vi([b()],Ja.prototype,"mode",2);Vi([b()],Ja.prototype,"selected",2);Ja=Vi([_("mateu-adaptive-tabs")],Ja);const o$=(e,t,a)=>{const r=(e||"").replace(/\/+$/,""),i=r.split("/"),s=i[i.length-1];return(t.includes(s)?i.slice(0,-1).join("/"):r)+"/"+a},n$=(e,t)=>{const a=(e||"").replace(/\/+$/,""),r=a.substring(a.lastIndexOf("/")+1);return r?t.findIndex(i=>!!i&&i===r):-1},l$=(e,t,a)=>{const r=t[a];if(!r||typeof window>"u")return;const i=t.filter(o=>!!o),s=o$(window.location.pathname,i,r);s!==window.location.pathname&&e.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:s},bubbles:!0,composed:!0}))},d$=(e,t="")=>{const a=u$(e)||"tabs";return t?`${t}.${a}`:a},c$=(e,t)=>`${e}-tab-${t}`,u$=e=>(e??"").trim().replace(/\s+/g,"_"),fr=[],h$=()=>fr.length?fr[fr.length-1]:"",Sn=(e,t)=>{fr.push(e);try{return t()}finally{fr.pop()}},p$=(e,t,a,r,i,s,o)=>{const l=t.metadata;let c=t.style;c==null&&(c=""),l.columnSpacing&&(c+="--vaadin-form-layout-column-spacing: "+l.columnSpacing+";");const u=l.itemRowSpacing&&l.itemRowSpacing!=="0"?l.itemRowSpacing:"var(--lumo-space-m)";return c+="--vaadin-form-layout-row-spacing: "+u+";",l.itemLabelSpacing&&(c+="--vaadin-form-layout-label-spacing: "+l.itemLabelSpacing+";"),l.labelsAside&&(c+="--vaadin-form-item-label-width: 10rem;"),l.fullWidth&&(c+="width: 100%;"),n`
               <vaadin-form-layout 
                       .responsiveSteps="${l.responsiveSteps||d}"  
                       style="${c||d}" 
                       class="${t.cssClasses}"
                       max-columns="${l.maxColumns&&l.maxColumns>0?l.maxColumns:d}"
                       auto-responsive="${l.autoResponsive||d}"
                       column-width="${l.columnWidth||d}"
                       expand-columns="${l.expandColumns||d}"
                       expand-fields="${l.expandFields||!l.labelsAside||d}"
                       labels-aside="${l.labelsAside||d}"
                       slot="${t.slot||d}"
               >
                   ${t.children?.map(p=>sc(l,e,p,a,r,i,s,o))}
               </vaadin-form-layout>
            `},sc=(e,t,a,r,i,s,o,l)=>a.type==re.ClientSide&&a.metadata?.type==v.FormRow?f$(e,t,a,r,i,s,o,l):e.labelsAside?m$(t,a,r,i,s,o,l):x(t,a,r,i,s,o,l),m$=(e,t,a,r,i,s,o)=>{if(t.type==re.ClientSide&&t.metadata?.type==v.FormField&&t.metadata.label){const l=t.metadata,c=l.label?.includes("${")?e._evalTemplate(l.label):l.label;return n`
                       <vaadin-form-item data-colspan="${l.colspan}">
                           <label slot="label">${c}</label>
                           ${x(e,t,a,r,i,s,o,!0)}
                       </vaadin-form-item>
                   `}return x(e,t,a,r,i,s,o)},f$=(e,t,a,r,i,s,o,l)=>n`
        <vaadin-form-row>
            ${a.children?.map(c=>sc(e,t,c,r,i,s,o,l))}
        </vaadin-form-row>
            `,v$=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.verticalAlignment&&(u=u?"align-items: "+l.verticalAlignment+";"+u:"align-items: "+l.verticalAlignment+";"),n`
               <vaadin-horizontal-layout 
                       style="${u}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(p=>x(e,p,a,r,i,s,o))}
               </vaadin-horizontal-layout>
            `},g$=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.horizontalAlignment&&(u=u?"align-items: "+l.horizontalAlignment+";"+u:"align-items: "+l.horizontalAlignment+";"),n`
        <vaadin-vertical-layout
                style="${u}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(p=>x(e,p,a,r,i,s,o))}
        </vaadin-vertical-layout>
    `},b$=(e,t,a,r,i,s,o)=>{const l=t.metadata;let c=t.style;return l.fullWidth&&(c=c?"width: 100%;"+c:"width: 100%;"),n`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${l.orientation??d}"
                       theme="${l.variant??d}"
                       slot="${t.slot??d}"
               >
                   <master-content>${x(e,t.children[0],a,r,i,s,o)}</master-content>
                   <detail-content>${x(e,t.children[1],a,r,i,s,o)}</detail-content>
               </vaadin-split-layout>
            `},y$=(e,t,a,r,i,s,o)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,u=!!i?.hasDetail||!!l,p=c??l;return n`
               <vaadin-master-detail-layout ?has-detail="${u}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??d}">
                   <div>${x(e,t.children[0],a,r,i,s,o)}</div>
                   ${u&&p?n`<div slot="detail">${x(e,p,a,r,i,s,o)}</div>`:n`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},$$=(e,t,a,r,i,s,o)=>{const l=t.metadata;let c=t.style;c==null&&(c=""),l.fullWidth&&(c+="width: 100%;");let u=l.variant;u=="equalWidth"&&(u="equal-width-tabs");const p=(t.children??[]).map(E=>E);if(p.length===1)return En(e,p[0],a,r,i,s,o);const m=p.map(E=>E.metadata.routeKey),f=typeof window<"u"?n$(window.location.pathname,m):-1,g=f>=0?f:Math.max(0,p.findIndex(E=>E.metadata.active)),y=E=>{const A=E.target;A.__mateuTabsSettled=!1,A.selected=g,setTimeout(()=>{A.__mateuTabsSettled=!0})},$=m.some(E=>!!E)?E=>{const A=E.target;if(!A.__mateuTabsSettled)return;const P=E.detail?.value;typeof P=="number"&&P>=0&&l$(A,m,P)}:void 0,w=d$(t.id,h$()),C=(t.children??[]).map((E,A)=>c$(w,A));if(l.adaptable){const E=(t.children??[]).map(A=>{const P=A.metadata.label;return P?.includes("${")?e._evalTemplate(P):P});return n`
            <mateu-adaptive-tabs
                    .tabLabels="${E}"
                    style="${c}"
                    class="${t.cssClasses}"
                    slot="${t.slot??d}"
            >
                <vaadin-tabs slot="tabs"
                             theme="${u??d}"
                             orientation="${l.orientation??d}"
                             @items-changed=${y}
                             @selected-changed=${$??d}
                >
                    ${t.children?.map(A=>A).map((A,P)=>{const R=A.metadata.shortcut;return n`
                        <vaadin-tab id="${C[P]}"
                                    style="${A.style}"
                                    class="${A.cssClasses}"
                                    data-shortcut="${R??d}"
                        >${E[P]}${Cn(A)}</vaadin-tab>`})}
                </vaadin-tabs>

                ${t.children?.map((A,P)=>n`
                    <div slot="panel-${P}" style="padding: var(--lumo-space-m) 0;">
                        ${Sn(C[P],()=>A.children?.map(R=>x(e,R,a,r,i,s,o)))}
                    </div>`)}
            </mateu-adaptive-tabs>
                `}return n`
        <vaadin-tabsheet
                theme="${u??d}"
                style="${c}"
                slot="${t.slot??d}"
        >
            <vaadin-tabs slot="tabs"
                         style="${c}"
                         class="${t.cssClasses}"
                         orientation="${l.orientation??d}"
                         @items-changed=${y}
                         @selected-changed=${$??d}
            >
                ${t.children?.map(E=>E).map((E,A)=>{const P=E.metadata.label,R=P?.includes("${")?e._evalTemplate(P):P,O=E.metadata.shortcut;return n`
                    <vaadin-tab id="${C[A]}"
                                style="${E.style}"
                                class="${E.cssClasses}"
                                data-shortcut="${O??d}"
                    >${R}${Cn(E)}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map((E,A)=>Sn(C[A],()=>En(e,E,a,r,i,s,o,C[A])))}
        </vaadin-tabsheet>
            `},Cn=e=>{const t=e.metadata.badge;return t?n` <span theme="badge pill small contrast" style="margin-inline-start: .35em;">${t}</span>`:d},En=(e,t,a,r,i,s,o,l)=>{const c=t.metadata.label,u=c?.includes("${")?e._evalTemplate(c):c;return n`
        <div tab="${l??u}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(p=>x(e,p,a,r,i,s,o))}
               </div>
            `},w$=(e,t,a,r,i,s,o)=>{const l=t.metadata;t.style,l.fullWidth;let c=0;if(t.children){for(let u=0;u<t.children.length;u++)if(t.children[u].metadata?.active){c=u;break}}return n`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(u=>x$(e,u,a,r,i,s,o,l.variant))}
               </vaadin-accordion>
            `},x$=(e,t,a,r,i,s,o,l)=>{const c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return n`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${l??d}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${u}</vaadin-accordion-heading>
            ${t.children?.map(p=>x(e,p,a,r,i,s,o))}
        </vaadin-accordion-panel>
            `},k$=(e,t,a,r,i,s,o)=>n`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??d}">
                   ${t.children?.map(l=>x(e,l,a,r,i,s,o))}
               </vaadin-scroller>
            `,_$="mateu-nav-active",oc=e=>e.selected===!0||(e.children??[]).some(oc),S$=e=>e.map(t=>oc(t)?{...t,className:[t.className,_$].filter(Boolean).join(" ")}:t),C$=(e,t,a)=>n`
    <vaadin-menu-bar
        theme="tertiary contrast"
        .items=${S$(e)}
        class="${a??d}"
        @item-selected=${r=>t(r.detail.value)}>
        <!-- an item's tooltip (a remote section that did not answer says why it is disabled) -->
        <vaadin-tooltip slot="tooltip"></vaadin-tooltip>
    </vaadin-menu-bar>`,E$=(e,t,a,r,i,s,o)=>{const l=t.metadata;return n`
        <vaadin-context-menu .items=${yo(e,l.menu,a,r,i,s,o)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${l.activateOnLeftClick?"click":d}"
                             slot="${t.slot??d}">
            ${x(e,l.wrapped,a,r,i,s,o)}
        </vaadin-context-menu>
            `},I$=(e,t,a,r,i)=>{const s=t.metadata;return n`
        <vaadin-menu-bar .items=${yo(e,s.options,a,r,i,pe,ba)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??d}">
        </vaadin-menu-bar>
            `},In=(e,t,a,r,i,s,o)=>{const l=document.createElement("vaadin-context-menu-item");return Bn(x(e,t,a,r,i,s,o),l),l},yo=(e,t,a,r,i,s,o)=>t.map(l=>l.submenus?{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?In(e,l.component,a,r,i,s,o):void 0,children:yo(e,l.submenus,a,r,i,s,o)}:l.separator?{component:"hr"}:{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?In(e,l.component,a,r,i,s,o):void 0});var T$=Object.defineProperty,A$=Object.getOwnPropertyDescriptor,Mr=(e,t,a,r)=>{for(var i=r>1?void 0:r?A$(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&T$(t,a,i),i};let Ea=class extends I{constructor(){super(...arguments),this.fieldId="",this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{const t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;const a=t.getContext("2d");a.lineWidth=2,a.lineCap="round",a.lineJoin="round",a.strokeStyle=getComputedStyle(this).getPropertyValue("--lumo-body-text-color")||"#1a1a1a";const[r,i]=this.pointerPosition(e);a.beginPath(),a.moveTo(r,i),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;const a=e.target.getContext("2d"),[r,i]=this.pointerPosition(e);a.lineTo(r,i),a.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector("canvas")}pointerPosition(e){const a=e.target.getBoundingClientRect();return[e.clientX-a.left,e.clientY-a.top]}ensureCanvasSize(e){const t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){const e=this.canvas();e&&e.getContext("2d").clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){const e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL("image/png")))}renderPad(){return n`
            <canvas class="pad"
                    @pointerdown="${this.startStroke}"
                    @pointermove="${this.stroke}"
                    @pointerup="${this.endStroke}"
                    @pointercancel="${this.endStroke}"></canvas>
            <div class="actions">
                <button class="button" @click="${this.clear}">Clear</button>
                <button class="button button--primary" ?disabled="${!this.hasStrokes}"
                        @click="${this.accept}">Accept</button>
                ${this.value?n`
                    <button class="button" @click="${()=>{this.signing=!1}}">Cancel</button>`:d}
            </div>`}render(){const e=this.value!=null&&this.value!=="";return this.signing||!e?this.renderPad():n`
            <img class="preview" src="${this.value}" alt="Signature"/>
            <div class="actions">
                <button class="button" @click="${()=>{this.signing=!0,this.hasStrokes=!1,this.updateComplete.then(()=>this.clear())}}">Sign again</button>
                <button class="button button--danger" @click="${()=>this.emit("")}">Delete</button>
            </div>`}};Ea.styles=k`
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
    `;Mr([h()],Ea.prototype,"fieldId",2);Mr([h()],Ea.prototype,"value",2);Mr([b()],Ea.prototype,"signing",2);Mr([b()],Ea.prototype,"hasStrokes",2);Ea=Mr([_("mateu-signature-pad")],Ea);var P$=Object.defineProperty,O$=Object.getOwnPropertyDescriptor,za=(e,t,a,r)=>{for(var i=r>1?void 0:r?O$(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&P$(t,a,i),i};let Dt=class extends I{constructor(){super(...arguments),this.fieldId="",this.options=[],this.leavesOnly=!1,this.opened=!1,this.expandedItems=[],this._normalized=[],this.dataProvider=(e,t)=>{const a=e.parentItem?e.parentItem.children??[]:this.normalized;t(a,a.length)}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get normalized(){return this._optsSource!==this.options&&(this._optsSource=this.options,this._normalized=this.normalizeOptions(this.options??[])),this._normalized}normalizeOptions(e){return e.map(t=>{const a=t.children&&t.children.length?this.normalizeOptions(t.children):void 0;return{...t,children:a}})}ancestorsOf(e,t){for(const a of t){if(String(a.value)===e)return[];const r=a.children?this.ancestorsOf(e,a.children):null;if(r!=null)return[a,...r]}return null}labelOf(e,t){for(const a of t){if(String(a.value)===e)return a.label;const r=a.children?this.labelOf(e,a.children):null;if(r!=null)return r}return null}open(){this.opened||(this.expandedItems=this.value!=null?this.ancestorsOf(String(this.value),this.normalized)??[]:[],this.opened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.close()},document.addEventListener("mousedown",this.outsideClick))}close(){this.detachOutsideClick(),this.opened=!1}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}pick(e){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e.value,fieldId:this.fieldId},bubbles:!0,composed:!0}))}clear(){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:this.fieldId},bubbles:!0,composed:!0}))}onActiveItemChanged(e){const t=e.detail.value;if(!t)return;if((t.children?.length??0)>0&&this.leavesOnly){this.expandedItems=this.expandedItems.includes(t)?this.expandedItems.filter(r=>r!==t):[...this.expandedItems,t],e.target.activeItem=null;return}this.pick(t)}render(){const e=this.value!=null&&this.value!==""?this.labelOf(String(this.value),this.normalized)??String(this.value):"";return n`
            <div class="root">
                <vaadin-button class="control" theme="tertiary"
                               @click="${()=>this.opened?this.close():this.open()}">
                    <span class="${e?"":"placeholder"}">${e||"—"}</span>
                    <span class="chevron" slot="suffix" aria-hidden="true">▾</span>
                </vaadin-button>
                ${this.opened?n`
                    <div class="panel">
                        ${this.value?n`
                            <div class="clear-row">
                                <vaadin-button theme="tertiary small" @click="${this.clear}">— Clear</vaadin-button>
                            </div>`:d}
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
                    </div>`:d}
            </div>`}};Dt.styles=k`
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
    `;za([h()],Dt.prototype,"fieldId",2);za([h()],Dt.prototype,"value",2);za([h()],Dt.prototype,"options",2);za([h({type:Boolean})],Dt.prototype,"leavesOnly",2);za([b()],Dt.prototype,"opened",2);za([b()],Dt.prototype,"expandedItems",2);Dt=za([_("mateu-vaadin-tree-select")],Dt);var R$=Object.defineProperty,z$=Object.getOwnPropertyDescriptor,Nr=(e,t,a,r)=>{for(var i=r>1?void 0:r?z$(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&R$(t,a,i),i};let Ia=class extends I{constructor(){super(...arguments),this.fieldId="",this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const r=new FileReader;r.onload=()=>this.emit(r.result),r.readAsDataURL(a),t.value=""}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:!1}),this.cameraOpen=!0,await this.updateComplete;const e=this.renderRoot.querySelector("video");e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){const e=this.renderRoot.querySelector("video");if(!e||e.videoWidth===0)return;const t=document.createElement("canvas");t.width=e.videoWidth,t.height=e.videoHeight,t.getContext("2d").drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL("image/jpeg",.9))}triggerFallback(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="";return n`
            <input type="file" accept="image/*" capture="environment" style="display: none;"
                   @change="${this.fileFallback}">
            ${this.cameraOpen?n`
                <video class="viewfinder" playsinline muted></video>
                <div class="actions">
                    <button class="button button--primary" @click="${this.shoot}">Capture</button>
                    <button class="button" @click="${this.closeCamera}">Cancel</button>
                </div>
            `:n`
                ${e?n`<img class="preview" src="${this.value}" alt="Photo"/>`:n`<div class="placeholder" aria-hidden="true">📷</div>`}
                <div class="actions">
                    <button class="button button--primary" @click="${this.openCamera}">
                        ${e?"Retake":"Take photo"}
                    </button>
                    ${this.cameraError?n`
                        <button class="button" @click="${this.triggerFallback}">Use file / native camera</button>`:d}
                    ${e?n`
                        <button class="button button--danger" @click="${()=>this.emit("")}">Delete</button>`:d}
                </div>
                ${this.cameraError?n`
                    <div class="error-hint">Camera unavailable — the file picker opens the device camera on phones.</div>`:d}
            `}`}};Ia.styles=k`
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
    `;Nr([h()],Ia.prototype,"fieldId",2);Nr([h()],Ia.prototype,"value",2);Nr([b()],Ia.prototype,"cameraOpen",2);Nr([b()],Ia.prototype,"cameraError",2);Ia=Nr([_("mateu-camera-capture")],Ia);var L$=Object.defineProperty,D$=Object.getOwnPropertyDescriptor,Fr=(e,t,a,r)=>{for(var i=r>1?void 0:r?D$(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&L$(t,a,i),i};const M$=(e,t)=>{if(!e)return;if(Array.isArray(e)){const r=e.find(i=>i.key==t);return r?.value!=null?String(r.value):void 0}const a=e[t];return a!=null?String(a):void 0};let ta=class extends I{constructor(){super(...arguments),this.fieldId="",this.editable=!0,this.filePicked=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const r=new FileReader;r.onload=()=>{const i=r.result,s=i.indexOf(","),o=i.substring(0,s).replace(";base64",`;name=${encodeURIComponent(a.name)};base64`);this.emit(o+i.substring(s))},r.readAsDataURL(a),t.value=""}}static fileName(e){if(!e)return"";if(e.startsWith("data:")){const t=e.indexOf(","),r=e.substring(5,t<0?e.length:t).split(";").find(i=>i.startsWith("name="));if(r)try{return decodeURIComponent(r.substring(5))}catch{return r.substring(5)}return"Attached file"}return e.split("/").pop()||e}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}triggerPick(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="",t=ta.fileName(this.value),a=e&&this.value.startsWith("data:"),r=e?n`<span class="file" title="${t}">📄 ${a?n`<a href="${this.value}" download="${t}">${t}</a>`:n`<a href="${this.value}" target="_blank">${t}</a>`}</span>`:d;return this.editable?n`
            <input type="file" accept="${this.accept||d}" style="display: none;"
                   @change="${this.filePicked}">
            <div class="row">
                ${r}
                <button class="button" @click="${this.triggerPick}">
                    ${e?"Replace":"Choose file"}
                </button>
                ${e?n`
                    <button class="button button--danger" @click="${()=>this.emit("")}">Remove</button>`:d}
            </div>`:n`${e?r:n`<span class="empty">—</span>`}`}};ta.styles=k`
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
    `;Fr([h()],ta.prototype,"fieldId",2);Fr([h()],ta.prototype,"value",2);Fr([h()],ta.prototype,"accept",2);Fr([h({type:Boolean})],ta.prototype,"editable",2);ta=Fr([_("mateu-file-upload")],ta);const Os=e=>e==null||typeof e=="string"&&e.trim()==="",$o=(e,t)=>{if(Os(e))return null;const a=t?parseInt(String(e),10):Number(e);return Number.isNaN(a)?null:a},N$=(e,t)=>Os(e)&&Os(t)?!0:e==t,F$=e=>!!e&&e.stereotype=="searchable"&&e.dataType=="array",q$=e=>e.endsWith("-label")?e.substring(0,e.length-6):e,B$=e=>e==null||e===""?[]:Array.isArray(e)?e.filter(t=>t!=null&&t!==""):e instanceof Set?[...e].filter(t=>t!=null&&t!==""):[e],U$=(e,t)=>{const a=t&&typeof t=="object"?t:{};return e.map(r=>{const i=a[String(r)];return{id:r,label:i!=null&&i!==""?String(i):String(r)}})},j$=(e,t)=>e.filter(a=>String(a)!==String(t)),Qr="3rem";function H$(e,t=!0){if(!t)return`flex: 0 0 ${Qr}; width: ${Qr}; min-width: ${Qr}; max-width: ${Qr};`;const a=(e??"").trim();return a?`flex: 0 0 min(${a}, 100%); width: min(${a}, 100%); min-width: min(${a}, 100%); max-width: min(${a}, 100%);`:""}function W$(e){return(e??[]).map(t=>t?.open!==!1)}function V$(e,t,a){const r=(a??[]).map(i=>i?.title??"").join("");return e&&r===t&&e.length===(a??[]).length?{states:e,key:r}:{states:W$(a),key:r}}function G$(e,t){const a=Math.max(0,e.right-e.left);return t.map(r=>{const i=Math.max(0,r.right-r.left);return i===0||a===0?!1:Math.max(0,Math.min(r.right,e.right)-Math.max(r.left,e.left))>=Math.min(i,a)/2})}function K$(e,t){if(!e?.readOnly)return!1;const a=new Set(["grid","fileUpload","image","uploadableImage","signature","camera","badge","bulletedList","html","richText","markdown","link","icon","color","stars","slider","toggle","popover","plainText","status","money","password"]);if(e.stereotype&&a.has(e.stereotype))return!1;const r=new Set(["status","money","bool","boolean","array","file","range"]);return!(e.dataType&&r.has(e.dataType))}function Y$(e,t){const a=t.toUpperCase();let r=e;for(;r;){if(r.tagName===a)return!0;r=r.parentNode??r.host??null}return!1}function J$(e,t){return e?{allRowsVisible:!0,theme:"wrap-cell-content"}:{allRowsVisible:t<10,theme:void 0}}function X$(e){const t=e?.metadata;return!t||t.type==="GridGroupColumn"?e:{...e,metadata:{...t,width:"3rem",autoWidth:!1,flexGrow:"1",frozen:!1,frozenToEnd:!1}}}function Q$(e,t,a,r,i=[]){if(t===0||Math.abs(e)>=Math.abs(t))return null;const s=t>0;for(const o of i)if((s?o.scrollHeight-o.clientHeight-o.scrollTop:o.scrollTop)>1)return null;return r<=1||s&&a>=r-1||!s&&a<=1?null:t}const Z$=e=>!!e&&typeof e=="object"&&"insert"in e,ew=e=>{const t=(e??"").trim();if(!t.startsWith("[")&&!t.startsWith("{"))return null;try{const a=JSON.parse(t),r=Array.isArray(a)?a:a&&Array.isArray(a.ops)?a.ops:null;return r&&r.length>0&&r.every(Z$)?r:null}catch{return null}},Tn=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),An=e=>{const t=String(e??"").trim();return/^(https?:|mailto:|tel:|\/|#)/i.test(t)||!/^[a-z][a-z0-9+.-]*:/i.test(t)?t:""},tw=(e,t={})=>{let a=Tn(e);return t.code&&(a=`<code>${a}</code>`),t.bold&&(a=`<strong>${a}</strong>`),t.italic&&(a=`<em>${a}</em>`),t.underline&&(a=`<u>${a}</u>`),t.strike&&(a=`<s>${a}</s>`),t.link&&An(t.link)&&(a=`<a href="${Tn(An(t.link))}">${a}</a>`),a},aw=e=>{const t=[];let a="";for(const o of e){if(typeof o.insert!="string")continue;const l=o.insert.split(`
`);l.forEach((c,u)=>{c&&(a+=tw(c,o.attributes)),u<l.length-1&&(t.push({html:a,attrs:o.attributes??{}}),a="")})}a&&t.push({html:a,attrs:{}});const r=[];let i=null;const s=()=>{i&&r.push(`<${i.tag}>${i.items.map(o=>`<li>${o}</li>`).join("")}</${i.tag}>`),i=null};for(const o of t){const l=o.attrs,c=l.list==="ordered"?"ol":l.list==="bullet"?"ul":null;if(c){(!i||i.tag!==c)&&(s(),i={tag:c,items:[]}),i.items.push(o.html);continue}s();const u=Number(l.header);u>=1&&u<=6?r.push(`<h${u}>${o.html}</h${u}>`):l.blockquote?r.push(`<blockquote>${o.html}</blockquote>`):l["code-block"]?r.push(`<pre><code>${o.html}</code></pre>`):r.push(`<p>${o.html}</p>`)}return s(),r.join("")},Pn=e=>{const t=ew(e);return t?aw(t):e??""};var rw=Object.defineProperty,iw=Object.getOwnPropertyDescriptor,da=(e,t,a,r)=>{for(var i=r>1?void 0:r?iw(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&rw(t,a,i),i};const sw=[{id:"bold",label:"Bold",glyph:"B",active:e=>e.isActive("bold"),run:e=>e.chain().focus().toggleBold().run()},{id:"italic",label:"Italic",glyph:"I",active:e=>e.isActive("italic"),run:e=>e.chain().focus().toggleItalic().run()},{id:"underline",label:"Underline",glyph:"U",active:e=>e.isActive("underline"),run:e=>e.chain().focus().toggleUnderline().run()},{id:"strike",label:"Strikethrough",glyph:"S",active:e=>e.isActive("strike"),run:e=>e.chain().focus().toggleStrike().run()},{id:"h2",label:"Heading",glyph:"H",active:e=>e.isActive("heading",{level:2}),run:e=>e.chain().focus().toggleHeading({level:2}).run()},{id:"bullet",label:"Bulleted list",glyph:"•",active:e=>e.isActive("bulletList"),run:e=>e.chain().focus().toggleBulletList().run()},{id:"ordered",label:"Numbered list",glyph:"1.",active:e=>e.isActive("orderedList"),run:e=>e.chain().focus().toggleOrderedList().run()},{id:"quote",label:"Quote",glyph:"❝",active:e=>e.isActive("blockquote"),run:e=>e.chain().focus().toggleBlockquote().run()},{id:"code",label:"Code block",glyph:"</>",active:e=>e.isActive("codeBlock"),run:e=>e.chain().focus().toggleCodeBlock().run()}];let $t=class extends I{constructor(){super(...arguments),this.readonly=!1,this.autofocus=!1,this.tick=0}async firstUpdated(){const[{Editor:e},{default:t}]=await Promise.all([ee(()=>import("./vendor-editor.js").then(a=>a.i),[]),ee(()=>import("./vendor-editor.js").then(a=>a.a),[])]);this.isConnected&&(this.editor=new e({element:this.editorElement,injectCSS:!1,extensions:[t.configure({link:{openOnClick:!1}})],content:Pn(this.value),editable:!this.readonly,autofocus:this.autofocus,editorProps:{attributes:{"aria-label":this.label??"Rich text",role:"textbox","aria-multiline":"true"}},onTransaction:()=>{this.tick++},onUpdate:({editor:a})=>{if(this.maxlength&&a.state.doc.textContent.length>this.maxlength){a.commands.undo();return}const r=a.isEmpty?"":a.getHTML();this.lastEmitted=r,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r},bubbles:!0,composed:!0}))}}),this.lastEmitted=this.value??"")}updated(e){super.updated(e),this.editor&&(e.has("readonly")&&this.editor.setEditable(!this.readonly),e.has("value")&&(this.value??"")!==(this.lastEmitted??"")&&(this.editor.commands.setContent(Pn(this.value),{emitUpdate:!1}),this.lastEmitted=this.value??""))}disconnectedCallback(){super.disconnectedCallback(),this.editor?.destroy(),this.editor=void 0}link(){if(!this.editor)return;const e=this.editor.getAttributes("link").href,t=window.prompt("Link address",e??"https://");t!==null&&(t.trim()?/^(https?:|mailto:|\/)/i.test(t.trim())&&this.editor.chain().focus().setLink({href:t.trim()}).run():this.editor.chain().focus().unsetLink().run())}render(){this.tick;const e=this.editor;return n`
            <div class="frame">
                ${this.readonly?d:n`
                    <div class="toolbar" role="toolbar" aria-label="Formatting">
                        ${sw.map(t=>n`
                            <button type="button" class="tool tool-${t.id}" title="${t.label}" aria-label="${t.label}"
                                    aria-pressed="${e?String(t.active(e)):"false"}" ?disabled=${!e}
                                    @mousedown=${a=>a.preventDefault()}
                                    @click=${()=>e&&t.run(e)}>${t.glyph}</button>`)}
                        <button type="button" class="tool" title="Link" aria-label="Link" ?disabled=${!e}
                                aria-pressed="${e?String(e.isActive("link")):"false"}"
                                @mousedown=${t=>t.preventDefault()} @click=${()=>this.link()}>🔗</button>
                    </div>`}
                <div id="editor"></div>
            </div>`}};$t.styles=k`
        :host {
            display: block;
            width: 100%;
            font-family: var(--lumo-font-family, inherit);
            color: var(--lumo-body-text-color, inherit);
        }
        .frame {
            border: 1px solid var(--lumo-contrast-20pct, #d0d4d9);
            border-radius: var(--lumo-border-radius-m, 4px);
            background: var(--lumo-base-color, #fff);
        }
        .frame:focus-within { border-color: var(--lumo-primary-color, #1676f3); }
        .toolbar {
            display: flex; flex-wrap: wrap; gap: 2px; padding: 4px;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e6e8eb);
        }
        .tool {
            min-width: 2rem; height: 2rem; padding: 0 .4rem; border: 0; border-radius: 4px;
            background: transparent; color: inherit; font: inherit; font-weight: 600; cursor: pointer;
        }
        .tool-italic { font-style: italic; }
        .tool-underline { text-decoration: underline; }
        .tool-strike { text-decoration: line-through; }
        .tool:hover { background: var(--lumo-contrast-5pct, #f1f3f5); }
        .tool[aria-pressed="true"] { background: var(--lumo-primary-color-10pct, #e3eefc); color: var(--lumo-primary-text-color, #1676f3); }
        .tool:focus-visible { outline: 2px solid var(--lumo-primary-color, #1676f3); outline-offset: 1px; }
        #editor { padding: 0 .75rem; }
        /* ProseMirror's own required styles (Tiptap injects them into document.head, out of reach) */
        .ProseMirror { min-height: 7rem; padding: .5rem 0; outline: none; white-space: pre-wrap; word-wrap: break-word; }
        .ProseMirror p { margin: .25rem 0; }
        .ProseMirror blockquote { margin: .25rem 0; padding-left: .75rem; border-left: 3px solid var(--lumo-contrast-20pct, #d0d4d9); }
        .ProseMirror pre { background: var(--lumo-contrast-5pct, #f1f3f5); padding: .5rem; border-radius: 4px; }
        .ProseMirror a { color: var(--lumo-primary-text-color, #1676f3); }
    `;da([h()],$t.prototype,"value",2);da([h({type:Number})],$t.prototype,"maxlength",2);da([h({type:Boolean})],$t.prototype,"readonly",2);da([h({type:Boolean})],$t.prototype,"autofocus",2);da([h()],$t.prototype,"label",2);da([fe("#editor")],$t.prototype,"editorElement",2);da([b()],$t.prototype,"tick",2);$t=da([_("mateu-rich-text-editor")],$t);const Ot=e=>!!e&&typeof e=="object"&&"__mateuGroup"in e,ss=e=>String(e??""),ow=(e,t,a)=>{const r=e??[];if(!t||!a||a.length===0)return r;const i=[];let s,o=!1;return r.forEach((l,c)=>{const u=ss(l?.[t]);if(!o||u!==s){const p=a.find(m=>ss(m.value)===u)??{value:u,count:r.filter(m=>ss(m?.[t])===u).length,aggregates:{}};i.push({__mateuGroup:p,__mateuGroupBy:t,_rowNumber:`__mateuGroup:${c}:${u}`}),o=!0,s=u}i.push(l)}),i},nc=(e,t)=>e==null?"":t.dataType==="money"||t.stereotype==="money"?new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(e):t.aggregate==="count"?new Intl.NumberFormat(void 0,{maximumFractionDigits:0}).format(Math.round(e)):new Intl.NumberFormat(void 0,{maximumFractionDigits:2}).format(e),nw=(e,t)=>e&&t.includes(e)?e:t.find(a=>!!a),lw=(e,t,a)=>{const r=e.__mateuGroup;return t.id===a?`${r.value} (${r.count})`:t.aggregate?nc(r.aggregates?.[t.id],t):""},dw=(e,t,a)=>{const r=t?.aggregates;if(!r||!e.some(o=>o.aggregate))return;const i={};e.forEach(o=>{o.aggregate&&r[o.id]!=null&&(i[o.id]=nc(r[o.id],o))});const s=e[0];if(s&&i[s.id]===void 0){const o=t?.page?.totalElements;i[s.id]=a&&s.id===a&&o!=null?`Total (${o})`:"Total"}return i},cw=(e,t,a)=>{const r=e[a.path]??"",i=t.captionPath?e[t.captionPath]:void 0,s=t.leadingPath?e[t.leadingPath]:void 0;return n`
        <span style="display: flex; align-items: center; gap: var(--lumo-space-s); overflow: hidden;">
            ${s?n`<img src="${s}" alt="" loading="lazy"
                style="width: 2rem; height: 2rem; border-radius: 50%; object-fit: cover; flex-shrink: 0;" />`:d}
            <span style="display: flex; flex-direction: column; overflow: hidden;">
                <span style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${yr(r)}</span>
                ${i?n`<span style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${i}</span>`:d}
            </span>
        </span>`},uw=(e,t,a)=>{const i=e[a.path]?"vaadin:check":"vaadin:minus";return V(i,"height: 16px; width: 16px; color: var(--lumo-body-text-color);")},hw=(e,t,a,r,i)=>{const s=e[a.path];let o=s;return r=="money"&&s&&s.locale&&s.currency?o=new Intl.NumberFormat(s.locale,{style:"currency",currency:s.currency}).format(s.value):i=="money"&&(o=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(s)),n`${o}`},On=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},pw=(e,t,a,r,i,s)=>{const o=a.xcolumn??s;if(o.text){if(o.actionId)return n`<a href="javascript: void(0);" @click="${u=>On(a,o,e)}">${o.text}</a>`;const c=e[a.path];return n`<a href="${c}">${o.text}</a>`}if(r=="string"){if(o.actionId){const u=e[a.path];return n`<a href="javascript: void(0);" @click="${p=>On(a,o,e)}">${u}</a>`}const c=e[a.path];return n`<a href="${c}">${c}</a>`}const l=e[a.path];return n`<a href="${l.href}">${l.text}</a>`},mw=(e,t,a,r,i)=>{const s=e[a.path];return r=="string"?s.split(",").map(o=>V(o,"width: 16px;")):s.split(",").map(o=>V(o.icon,"width: 16px;"))},fw=(e,t,a,r,i)=>{const s=e[a.path];return n`${we(s)}`},vw=(e,t,a,r,i,s)=>{if(r=="string"){const l=e[a.path],c="max-height: 40px; "+(s.style??"");return n`<img src="${l}" style="${c}">`}const o=e[a.path];return n`<img src="${o.src}" style="${s.style??""}">`},gw=e=>{const t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Rs=e=>{const t={_clickedRow:e.target.row},a=e.target.action;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+a.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},bw=e=>{const t=document.createElement("vaadin-context-menu-item"),a=document.createElement("vaadin-icon");return a.style.color="var(--lumo-secondary-text-color)",a.style.marginInlineEnd="var(--lumo-space-s)",a.style.padding="var(--lumo-space-xs)",a.setAttribute("icon",e.icon),t.appendChild(a),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},Rn=(e,t,a)=>{const r=e[a.path]?.actions;if(r?.length==1){const s=r[0],o=s.icon&&!s.label;return n`
         <vaadin-button theme="tertiary${o?" icon":""}" title="${s.label||d}" ?disabled=${s.disabled}
                        @click="${Rs}" .row="${e}" .action="${s}" data-testid="action-${a.path}">
             ${s.icon?n`<vaadin-icon icon="${s.icon}"></vaadin-icon>`:d}
             ${s.label?s.label:d}
         </vaadin-button>
    `}const i=r?.map(s=>s.icon?{component:bw(s),methodNameInCrud:s.methodNameInCrud}:{...s,text:s.label});return!i||i.length==0?n``:n`
                                     <vaadin-menu-bar
                                         .items=${[{text:"···",children:i}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${a.path}"
                                         @item-selected="${gw}"
                                     ></vaadin-menu-bar>
                                   `},yw=(e,t,a)=>{if(a.path=="select"){const s={actionId:a.path,icon:"",label:"Select",disabled:!1,methodNameInCrud:"select"};return n`
         <vaadin-button theme="tertiary" title="Select" @click="${Rs}" .row="${e}" .action="${s}">
             Select
         </vaadin-button>
    `}const r=a.path&&e[a.path]?.methodNameInCrud?e[a.path]:e.action;if(!r)return n``;const i=r.icon&&!r.label;return n`
         <vaadin-button theme="tertiary${i?" icon":""}" title="${r.label||d}" @click="${Rs}" .row="${e}" .action="${r}">
             ${r.icon?n`<vaadin-icon icon="${r.icon}"></vaadin-icon>`:d}
             ${r.label?r.label:d}
         </vaadin-button>
    `},$w=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},ww=(e,t,a,r,i,s)=>{const o=a.xcolumn??s;if(o.actionId){const c=o.text||yr(e[a.path]);return n`
            <vaadin-button theme="tertiary" @click="${u=>$w(a,o,e)}" .row="${e}">
                ${c}
            </vaadin-button>
        `}const l=e[a.path];return n`<a href="${l}">${o.text||l}</a>`},xw=(e,t,a,r,i,s,o,l,c)=>{const u=e[a.path];return x(r,u,i,s,o,l,c)},zs=new WeakMap,kw=(e,t)=>zs.get(e)?.[t],_w=(e,t,a)=>{let r=zs.get(e);r||(r={},zs.set(e,r)),r[t]=a},zn=(e,t=!1)=>$o(e,t),Sw=(e,t,a,r)=>{const i=a?.field?.fieldId,s=c=>{if(e[t.id]===c||e[t.id]==null&&(c===""||c==null))return;if(e[t.id]=c,!i){a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"update-row",parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}const p=(a?.state??r)[i];a.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:i,value:Array.isArray(p)?[...p]:p},bubbles:!0,composed:!0}))},o=e[t.id],l=o==null?"":String(o);switch(t.editorType){case"boolean":return n`<vaadin-checkbox ?checked=${!!o} @checked-changed=${c=>s(c.detail.value)}></vaadin-checkbox>`;case"integer":return n`<vaadin-integer-field theme="small" style="width:100%;" .value=${l} @change=${c=>s(zn(c.target.value,!0))}></vaadin-integer-field>`;case"number":return n`<vaadin-number-field theme="small" style="width:100%;" .value=${l} @change=${c=>s(zn(c.target.value))}></vaadin-number-field>`;case"date":return n`<vaadin-date-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>s(c.detail.value)}></vaadin-date-picker>`;case"time":return n`<vaadin-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>s(c.detail.value)}></vaadin-time-picker>`;case"datetime":return n`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>s(c.detail.value)}></vaadin-date-time-picker>`;case"select":return n`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(c=>({label:c.label,value:String(c.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${l}
                @value-changed=${c=>s(c.detail.value)}></vaadin-combo-box>`;case"lookup":{const c=a?.field?.fieldId,u=`search-${c}-${t.id}`,p=`${c}-${t.id}`,f=(t.editorOptions??[]).find(y=>String(y.value)===l)??(l?{value:l,label:kw(e,t.id)??l}:void 0);return n`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${(y,$)=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:u,parameters:{searchText:y.filter,size:y.pageSize,page:y.page},callback:w=>{const C=w?.fragments?.[0]?.data?.[p];$(C?.content??[],C?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${f}
                @selected-item-changed=${y=>{const $=y.detail.value,w=$?$.value:null;String(w??"")!==l&&($&&_w(e,t.id,$.label),s(w))}}></vaadin-combo-box>`}default:return n`<vaadin-text-field theme="small" style="width:100%;" .value=${l} @change=${c=>s(c.target.value)}></vaadin-text-field>`}},os=e=>$c(()=>n`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),ns=e=>e!==void 0?wc(()=>n`<span style="font-weight: 600; white-space: nowrap;">${e}</span>`,[e]):d,Cw=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent("sort-direction-changed",{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},Ew=(e,t,a,r,i,s,o,l)=>{const c=G(e.label,r,i);return n`
<vaadin-grid-column-group header="${c}">
    ${e.columns.map(u=>lc(u.metadata,t,a,r,i,s,o,l?.[u.metadata?.id]))}
</vaadin-grid-column-group>
`},wo=(e,t,a,r,i,s,o,l)=>v.GridGroupColumn==e.metadata?.type?Ew(e.metadata,t,a,r,i,s,o,l):lc(e.metadata,t,a,r,i,s,o,l?.[e.metadata?.id]),lc=(e,t,a,r,i,s,o,l)=>{const c=G(e.label,r,i);return e.sortable?n`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??d}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??d}"
                                ?resizable="${e.resizable}"
                                width="${e.width??d}"
                                @direction-changed="${Cw}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${os(c)}
                                ${ns(l)}
                                ${ht((u,p,m)=>vr(u,p,m,e,t,a,r,i,s,o),[e,r,i])}
                        ></vaadin-grid-sort-column>
                    `:e.filterable?n`
                        <vaadin-grid-filter-column
                                path="${e.id}"
                                text-align="${e.align??d}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??d}"
                                ?resizable="${e.resizable}"
                                width="${e.width??d}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${os(c)}
                                ${ns(l)}
                                ${ht((u,p,m)=>vr(u,p,m,e,t,a,r,i,s,o),[e,r,i])}
                        ></vaadin-grid-filter-column>
                    `:n`
                        <vaadin-grid-column
                                path="${e.id}"
                                text-align="${e.align??d}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??d}"
                                ?resizable="${e.resizable}"
                                width="${e.width??d}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                .xcolumn="${e}"
                                ${os(c)}
                                ${ns(l)}
                                ${ht((u,p,m)=>vr(u,p,m,e,t,a,r,i,s,o),[e,r,i])}
                        ></vaadin-grid-column>
                    `},vr=(e,t,a,r,i,s,o,l,c,u)=>{const p=a.dataset.dataType??"",m=a.dataset.stereotype??"";if(Ot(e)){const y=i?.metadata,$=(y?.columns??[]).flatMap(P=>P?.metadata?.type===v.GridGroupColumn?(P.metadata.columns??[]).map(R=>R?.metadata?.id):[P?.metadata?.id]),w=nw(e.__mateuGroupBy,$),C=lw(e,r,w),E=e.__mateuGroup.hiddenActions??[],A=r.id===$[$.length-1]?(y?.groupActions??[]).filter(P=>!E.includes(P.actionId??P.id)):[];return A.length?n`<span style="display: flex; align-items: center; justify-content: flex-end; gap: var(--lumo-space-s); overflow: hidden;">
                ${C?n`<span style="font-weight: 600;">${C}</span>`:d}
                ${A.map(P=>n`
                    <vaadin-button theme="tertiary small" style="flex-shrink: 0;"
                        @click="${R=>{R.stopPropagation(),R.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+(P.actionId??P.id),parameters:{_groupValue:e.__mateuGroup.value}},bubbles:!0,composed:!0}))}}">${P.label??P.caption??""}</vaadin-button>
                `)}
            </span>`:n`<span title="${C}" style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${C}</span>`}if(r.editable)return Sw(e,r,i,o);if(p=="status")return qg(e,t,a);if(m=="primary")return cw(e,r,a);if(p=="bool")return uw(e,t,a);if(p=="money"||m=="money")return hw(e,t,a,p,m);if(p=="link"||m=="link")return pw(e,t,a,p,m,r);if(p=="icon"||m=="icon")return mw(e,t,a,p);if(m=="html")return fw(e,t,a);if(m=="image")return vw(e,t,a,p,m,r);if(p=="menu")return Rn(e,t,a);if(p=="component")return xw(e,t,a,i,s,o,l,c,u);if(p=="action")return yw(e,t,a);if(p=="actionGroup")return Rn(e,t,a);if(m=="button"||r.actionId)return ww(e,t,a,p,m,r);const f=e[a.path],g=i?.metadata?.rowRoute;if(r.identifier&&g){const y=Cl(g,e,o,l);if(y){const $="/"+y.replace(/^\/+/,"");return n`<a href="${$}" title="${f}"
                @click="${w=>{w.defaultPrevented||w.metaKey||w.ctrlKey||w.shiftKey||w.button!==0||(w.preventDefault(),mt(i,y))}}"
                style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; color: var(--lumo-primary-text-color); text-decoration: none; cursor: pointer;"
                @mouseover="${w=>{w.currentTarget.style.textDecoration="underline"}}"
                @mouseout="${w=>{w.currentTarget.style.textDecoration="none"}}"
            >${yr(f)}</a>`}}return n`<span title="${f}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${yr(f)}</span>`};function dc(e,t){return n`
        <vaadin-grid-column
                width="2.25rem"
                flex-grow="0"
                ${ht((a,{detailsOpened:r})=>e?.(a)?d:n`
                    <vaadin-icon
                            icon="${(t?t(a):r)?"lumo:angle-down":"lumo:angle-right"}"
                            aria-hidden="true"
                            style="color: var(--lumo-secondary-text-color); width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"
                    ></vaadin-icon>`,[t])}
        ></vaadin-grid-column>`}var Iw=Object.defineProperty,Tw=Object.getOwnPropertyDescriptor,ca=(e,t,a,r)=>{for(var i=r>1?void 0:r?Tw(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Iw(t,a,i),i};const Aw=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},Pw=(e,t)=>{let a=t;for(;a;){if(a===e)return!0;a=a.assignedSlot??a.parentNode??a.host??null}return!1};let wt=class extends Oi{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{const t=e.currentTarget,a=t.getEventContext(e)?.item??null;a!==this.hoveredItem&&(this.hoveredItem=a,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?"hovered-cell":"",this._onRowKey=e=>{const t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!Hl(t,e))return;const a=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!a)return;const r=this.currentItems(),i=parseInt(a[1],10)-1;i>=r.length||(e.preventDefault(),this.selectRow(r[i]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+"_selected_items"]=[e],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;const e=Aw();if(e&&e!==document.body&&!Pw(this,e)){const t=e.tagName?.toLowerCase()??"";if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith("vaadin-")&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){const{item:t,selected:a,shiftKey:r}=e.detail;if(this.rangeStartItem??=t,r){let i=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(i=this.state[this.field.fieldId]);const[s,o]=[this.rangeStartItem,t].map(u=>i.indexOf(u)).sort((u,p)=>u-p),l=i.slice(s,o+1),c=new Set(this.selectedItems);l.forEach(u=>{a?c.add(u):c.delete(u)}),this.selectedItems=[...c],this.state[this.id+"_selected_items"]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);const t=this.state[this.field?.fieldId+"_show_detail"]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates,r="";this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((a,r)=>{a&&typeof a=="object"&&a._rowNumber===void 0&&(a._rowNumber=r)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith("modal")){const a=this;return n`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.field?.fieldId+"_cancel"},bubbles:!0,composed:!0}))}}"
                        ${Nn(()=>n`
                            <mateu-event-interceptor .target="${a}">
                                <div id="container" style="${this.field?.formStyle??"display: contents;"}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>Ne()])}
                ></vaadin-dialog>
                
            `}else{const a=this.field?.formPosition,r=a==="left"||a==="right";return n`
            <div style="display: flex; flex-direction: ${r?"row":"column"}; gap: var(--lumo-space-m, 1rem); width: 100%; ${t&&this.field?.minHeightWhenDetailVisible?"min-height: "+this.field?.minHeightWhenDetailVisible+";":""}">
                <div style="${r?"flex: 1; min-width: 0;":"width: 100%;"}${a==="left"?" order: 2;":""}">
                    ${this.renderMaster(e)}
                </div>
                <div style="${t?"":"display: none;"}${r?"flex: 1; min-width: 0;":"width: 100%;"}${a==="left"?" order: 1;":""}${this.field?.formStyle??""}">
                    <div id="container" style="padding: 0 2rem 2rem; background-color: var(--lumo-base-color);">
                        <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                    </div>
                </div>
            </div>`}}renderMaster(e){const t=this.selectedItems||[],a=J$(this.field?.readOnly,e?.length??0),r=this.field?.readOnly?(this.field?.columns??[]).map(X$):this.field?.columns;return n`<vaadin-vertical-layout style="width: 100%;">
            <!-- The field label is rendered by the surrounding mateu-field wrapper; rendering it
                 here too would duplicate it (e.g. "Guests / Guests"). -->
            <vaadin-grid
                    ?clickable="${!!this.field?.onItemSelectionActionId}"
                    .cellPartNameGenerator="${M(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${M(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${M(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?"cursor: pointer;":""}${this.field?.style??""}"
                    class="${this.field?.cssClasses}"
                    theme="${M(a.theme)}"
                    .items="${e}"
                    .selectedItems="${t}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${i=>{this.selectedItems=i.detail.value,this.state[this.id+"_selected_items"]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${M(this.field?.onItemSelectionActionId?i=>{if(i.composedPath().some(l=>l instanceof HTMLElement&&(l.localName==="vaadin-button"||l.localName==="button"||l.localName==="a"||l.localName==="vaadin-checkbox"||l.getAttribute?.("role")==="button")))return;const o=i.currentTarget.getEventContext(i)?.item;o&&this.selectRow(o)}:void 0)}"
                    @active-item-changed="${M(this.field?.detailPath&&!this.field?.useButtonForDetail?i=>{if(this.field?.detailPath){const s=i.detail.value;s?this.detailsOpenedItems=[s]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${M(this.field?.detailPath?cs(i=>n`${x(this,i[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${a.allRowsVisible}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:"No items added yet."}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?d:n`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.detailPath&&!this.field?.useButtonForDetail?dc():d}
                ${r?.map(i=>wo(i,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?n`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${ht(i=>n`
                                <vaadin-button theme="tertiary icon error" title="Remove row"
                                    @click="${()=>{this.state[this.id+"_selected_items"]=[i],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_remove"},bubbles:!0,composed:!0}))}}">
                                    <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                </vaadin-button>`,[])}
                    ></vaadin-grid-column>
                `:d}

                ${this.field?.useButtonForDetail?n`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${ht((i,{detailsOpened:s})=>n`
              <vaadin-button
                theme="tertiary icon"
                title="${s?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${s?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=this.detailsOpenedItems.length?this.detailsOpenedItems[0]._rowNumber==i._rowNumber?[]:[i]:[i]}}"
              >
                <vaadin-icon
                  .icon="${s?"lumo:angle-down":"lumo:angle-right"}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:d}

            </vaadin-grid>
            ${this.field?.readOnly?d:this.field?.inlineEditing?n`
                    <vaadin-horizontal-layout theme="spacing">
                        <!-- Inline mode: rows are removed with the per-row trash button, so the
                             toolbar only needs the "add" action. -->
                        <vaadin-button theme="tertiary icon" title="Add row" @click="${()=>this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_add"},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:plus"></vaadin-icon></vaadin-button>
                    </vaadin-horizontal-layout>
                `:n`
                    <vaadin-horizontal-layout theme="spacing">
                        <vaadin-button theme="tertiary icon" @click="${()=>this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_add"},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:plus"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon error" @click="${()=>this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_remove"},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:minus"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon" title="Move up" @click="${()=>this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_move-up"},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:arrow-up"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon" title="Move down" @click="${()=>this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_move-down"},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:arrow-down"></vaadin-icon></vaadin-button>
                    </vaadin-horizontal-layout>
                `}
        </vaadin-vertical-layout>`}};wt.styles=k`
        ${Mt}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `;ca([h()],wt.prototype,"field",2);ca([h()],wt.prototype,"state",2);ca([h()],wt.prototype,"data",2);ca([h()],wt.prototype,"appState",2);ca([h()],wt.prototype,"appData",2);ca([h()],wt.prototype,"selectedItems",2);ca([b()],wt.prototype,"detailsOpenedItems",2);wt=ca([_("mateu-grid")],wt);var Ow=Object.defineProperty,Rw=Object.getOwnPropertyDescriptor,lr=(e,t,a,r)=>{for(var i=r>1?void 0:r?Rw(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Ow(t,a,i),i};let aa=class extends I{constructor(){super(...arguments),this.getNewValue=e=>{if(this.field?.dataType=="array"){if(!this.value)return[e];const t=this.value;return t.indexOf(e)>=0?t.filter(a=>a!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:"",fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}const t=this.field?.attributes?.divStyle;return n`
        <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; ${t}">
                                    ${e?.map(a=>n`
                            <div role="button" tabindex="0" 
                                    class="choice ${this.value==a.value||Array.isArray(this.value)&&this.value.includes(a.value)?"selected":""}"
                                    @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.getNewValue(a.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}" @keydown="${te(()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.getNewValue(a.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))}"
                            >${a.description||a.image?n`
                                <div style="display: flex; align-items: center; gap: var(--lumo-space-m, 1rem);">
                                    ${a.image?n`
                                            <img src="${a.image}" alt="${a.label}" style="${a.imageStyle??"width: 2rem;"}" />
                                        `:d}
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

       `}};aa.styles=k`
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
  
        ${le}
    `;lr([h()],aa.prototype,"field",2);lr([h()],aa.prototype,"baseUrl",2);lr([h()],aa.prototype,"state",2);lr([h()],aa.prototype,"data",2);lr([h()],aa.prototype,"value",2);aa=lr([_("mateu-choice")],aa);var zw=Object.defineProperty,Lw=Object.getOwnPropertyDescriptor,Ct=(e,t,a,r)=>{for(var i=r>1?void 0:r?Lw(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&zw(t,a,i),i};let ye=class extends I{constructor(){super(...arguments),this.commit=e=>{this.value=e,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...e},fieldId:this.fieldId}}))},this.currencyChanged=e=>{const t=this.value??ye.EMPTY;!e.detail.value||e.detail.value===t.currency||this.commit({...t,currency:e.detail.value})},this.valueChanged=e=>{const t=this.value??ye.EMPTY,a=$o(e.detail.value,!1)??0;a!==t.value&&this.commit({...t,value:a})}}render(){return n`
            <vaadin-number-field
                    id="${this.fieldId}"
                    label="${this.label}"
                    @value-changed="${this.valueChanged}"
                    .value="${this.value?.value}"
                    .helperText="${this.helperText}"
                    ?autofocus="${this.autofocus}"
                    ?required="${this.required||d}"
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
       `}};ye.EMPTY={value:0,currency:"EUR",locale:"es-ES"};ye.styles=k`
  `;Ct([h()],ye.prototype,"fieldId",2);Ct([h()],ye.prototype,"label",2);Ct([h()],ye.prototype,"state",2);Ct([h()],ye.prototype,"data",2);Ct([h()],ye.prototype,"value",2);Ct([h()],ye.prototype,"autoFocus",2);Ct([h()],ye.prototype,"required",2);Ct([h()],ye.prototype,"colspan",2);Ct([h()],ye.prototype,"helperText",2);ye=Ct([_("mateu-money-field")],ye);const Ln=["vaadin:abacus","vaadin:absolute-position","vaadin:academy-cap","vaadin:accessibility","vaadin:accordion-menu","vaadin:add-dock","vaadin:adjust","vaadin:adobe-flash","vaadin:airplane","vaadin:alarm","vaadin:align-center","vaadin:align-justify","vaadin:align-left","vaadin:align-right","vaadin:alt-a","vaadin:alt","vaadin:ambulance","vaadin:anchor","vaadin:angle-double-down","vaadin:angle-double-left","vaadin:angle-double-right","vaadin:angle-double-up","vaadin:angle-down","vaadin:angle-left","vaadin:angle-right","vaadin:angle-up","vaadin:archive","vaadin:archives","vaadin:area-select","vaadin:arrow-backward","vaadin:arrow-circle-down-o","vaadin:arrow-circle-down","vaadin:arrow-circle-left-o","vaadin:arrow-circle-left","vaadin:arrow-circle-right-o","vaadin:arrow-circle-right","vaadin:arrow-circle-up-o","vaadin:arrow-circle-up","vaadin:arrow-down","vaadin:arrow-forward","vaadin:arrow-left","vaadin:arrow-long-down","vaadin:arrow-long-left","vaadin:arrow-right","vaadin:arrow-up","vaadin:arrows-cross","vaadin:arrows-long-h","vaadin:arrows-long-right","vaadin:arrows-long-up","vaadin:arrows-long-v","vaadin:arrows","vaadin:asterisk","vaadin:at","vaadin:automation","vaadin:backspace-a","vaadin:backspace","vaadin:backwards","vaadin:ban","vaadin:bar-chart-h","vaadin:bar-chart-v","vaadin:bar-chart","vaadin:barcode","vaadin:bed","vaadin:bell-o","vaadin:bell-slash-o","vaadin:bell-slash","vaadin:bell","vaadin:boat","vaadin:bold","vaadin:bolt","vaadin:bomb","vaadin:book-dollar","vaadin:book-percent","vaadin:book","vaadin:bookmark-o","vaadin:bookmark","vaadin:briefcase","vaadin:browser","vaadin:bug-o","vaadin:bug","vaadin:building-o","vaadin:building","vaadin:bullets","vaadin:bullseye","vaadin:bus","vaadin:buss","vaadin:button","vaadin:calc-book","vaadin:calc","vaadin:calendar-briefcase","vaadin:calendar-clock","vaadin:calendar-envelope","vaadin:calendar-o","vaadin:calendar-user","vaadin:calendar","vaadin:camera","vaadin:car","vaadin:caret-down","vaadin:caret-left","vaadin:caret-right","vaadin:caret-square-down-o","vaadin:caret-square-left-o","vaadin:caret-square-right-o","vaadin:caret-square-up-o","vaadin:caret-up","vaadin:cart-o","vaadin:cart","vaadin:cash","vaadin:chart-3d","vaadin:chart-grid","vaadin:chart-line","vaadin:chart-timeline","vaadin:chart","vaadin:chat","vaadin:check-circle-o","vaadin:check-circle","vaadin:check-square-o","vaadin:check-square","vaadin:check","vaadin:chevron-circle-down-o","vaadin:chevron-circle-down","vaadin:chevron-circle-left-o","vaadin:chevron-circle-left","vaadin:chevron-circle-right-o","vaadin:chevron-circle-right","vaadin:chevron-circle-up-o","vaadin:chevron-circle-up","vaadin:chevron-down-small","vaadin:chevron-down","vaadin:chevron-left-small","vaadin:chevron-left","vaadin:chevron-right-small","vaadin:chevron-right","vaadin:chevron-up-small","vaadin:chevron-up","vaadin:child","vaadin:circle-thin","vaadin:circle","vaadin:clipboard-check","vaadin:clipboard-cross","vaadin:clipboard-heart","vaadin:clipboard-pulse","vaadin:clipboard-text","vaadin:clipboard-user","vaadin:clipboard","vaadin:clock","vaadin:close-big","vaadin:close-circle-o","vaadin:close-circle","vaadin:close-small","vaadin:close","vaadin:cloud-download-o","vaadin:cloud-download","vaadin:cloud-o","vaadin:cloud-upload-o","vaadin:cloud-upload","vaadin:cloud","vaadin:cluster","vaadin:code","vaadin:coffee","vaadin:cog-o","vaadin:cog","vaadin:cogs","vaadin:coin-piles","vaadin:coins","vaadin:combobox","vaadin:comment-ellipsis-o","vaadin:comment-ellipsis","vaadin:comment-o","vaadin:comment","vaadin:comments-o","vaadin:comments","vaadin:compile","vaadin:compress-square","vaadin:compress","vaadin:connect-o","vaadin:connect","vaadin:controller","vaadin:copy-o","vaadin:copy","vaadin:copyright","vaadin:corner-lower-left","vaadin:corner-lower-right","vaadin:corner-upper-left","vaadin:corner-upper-right","vaadin:credit-card","vaadin:crop","vaadin:cross-cutlery","vaadin:crosshairs","vaadin:css","vaadin:ctrl-a","vaadin:ctrl","vaadin:cube","vaadin:cubes","vaadin:curly-brackets","vaadin:cursor-o","vaadin:cursor","vaadin:cutlery","vaadin:dashboard","vaadin:database","vaadin:date-input","vaadin:deindent","vaadin:del-a","vaadin:del","vaadin:dental-chair","vaadin:desktop","vaadin:diamond-o","vaadin:diamond","vaadin:diploma-scroll","vaadin:diploma","vaadin:disc","vaadin:doctor-briefcase","vaadin:doctor","vaadin:dollar","vaadin:dot-circle","vaadin:download-alt","vaadin:download","vaadin:drop","vaadin:edit","vaadin:eject","vaadin:elastic","vaadin:ellipsis-circle-o","vaadin:ellipsis-circle","vaadin:ellipsis-dots-h","vaadin:ellipsis-dots-v","vaadin:ellipsis-h","vaadin:ellipsis-v","vaadin:enter-arrow","vaadin:enter","vaadin:envelope-o","vaadin:envelope-open-o","vaadin:envelope-open","vaadin:envelope","vaadin:envelopes-o","vaadin:envelopes","vaadin:eraser","vaadin:esc-a","vaadin:esc","vaadin:euro","vaadin:exchange","vaadin:exclamation-circle-o","vaadin:exclamation-circle","vaadin:exclamation","vaadin:exit-o","vaadin:exit","vaadin:expand-full","vaadin:expand-square","vaadin:expand","vaadin:external-browser","vaadin:external-link","vaadin:eye-slash","vaadin:eye","vaadin:eyedropper","vaadin:facebook-square","vaadin:facebook","vaadin:factory","vaadin:family","vaadin:fast-backward","vaadin:fast-forward","vaadin:female","vaadin:file-add","vaadin:file-code","vaadin:file-font","vaadin:file-movie","vaadin:file-o","vaadin:file-picture","vaadin:file-presentation","vaadin:file-process","vaadin:file-refresh","vaadin:file-remove","vaadin:file-search","vaadin:file-sound","vaadin:file-start","vaadin:file-table","vaadin:file-text-o","vaadin:file-text","vaadin:file-tree-small","vaadin:file-tree-sub","vaadin:file-tree","vaadin:file-zip","vaadin:file","vaadin:fill","vaadin:film","vaadin:filter","vaadin:fire","vaadin:flag-checkered","vaadin:flag-o","vaadin:flag","vaadin:flash","vaadin:flask","vaadin:flight-landing","vaadin:flight-takeoff","vaadin:flip-h","vaadin:flip-v","vaadin:folder-add","vaadin:folder-o","vaadin:folder-open-o","vaadin:folder-open","vaadin:folder-remove","vaadin:folder-search","vaadin:folder","vaadin:font","vaadin:form","vaadin:forward","vaadin:frown-o","vaadin:funcion","vaadin:function","vaadin:funnel","vaadin:gamepad","vaadin:gavel","vaadin:gift","vaadin:glass","vaadin:glasses","vaadin:globe-wire","vaadin:globe","vaadin:golf","vaadin:google-plus-square","vaadin:google-plus","vaadin:grab","vaadin:grid-bevel","vaadin:grid-big-o","vaadin:grid-big","vaadin:grid-h","vaadin:grid-small-o","vaadin:grid-small","vaadin:grid-v","vaadin:grid","vaadin:group","vaadin:hammer","vaadin:hand","vaadin:handle-corner","vaadin:hands-up","vaadin:handshake","vaadin:harddrive-o","vaadin:harddrive","vaadin:hash","vaadin:header","vaadin:headphones","vaadin:headset","vaadin:health-card","vaadin:heart-o","vaadin:heart","vaadin:home-o","vaadin:home","vaadin:hospital","vaadin:hourglass-empty","vaadin:hourglass-end","vaadin:hourglass-start","vaadin:hourglass","vaadin:inbox","vaadin:indent","vaadin:info-circle-o","vaadin:info-circle","vaadin:info","vaadin:input","vaadin:insert","vaadin:institution","vaadin:invoice","vaadin:italic","vaadin:key-o","vaadin:key","vaadin:keyboard-o","vaadin:keyboard","vaadin:laptop","vaadin:layout","vaadin:level-down-bold","vaadin:level-down","vaadin:level-left-bold","vaadin:level-left","vaadin:level-right-bold","vaadin:level-right","vaadin:level-up-bold","vaadin:level-up","vaadin:lifebuoy","vaadin:lightbulb","vaadin:line-bar-chart","vaadin:line-chart","vaadin:line-h","vaadin:line-v","vaadin:lines-list","vaadin:lines","vaadin:link","vaadin:list-ol","vaadin:list-select","vaadin:list-ul","vaadin:list","vaadin:location-arrow-circle-o","vaadin:location-arrow-circle","vaadin:location-arrow","vaadin:lock","vaadin:magic","vaadin:magnet","vaadin:mailbox","vaadin:male","vaadin:map-marker","vaadin:margin-bottom","vaadin:margin-left","vaadin:margin-right","vaadin:margin-top","vaadin:margin","vaadin:medal","vaadin:megafone","vaadin:megaphone","vaadin:meh-o","vaadin:menu","vaadin:microphone","vaadin:minus-circle-o","vaadin:minus-circle","vaadin:minus-square-o","vaadin:minus","vaadin:mobile-browser","vaadin:mobile-retro","vaadin:mobile","vaadin:modal-list","vaadin:modal","vaadin:money-deposit","vaadin:money-exchange","vaadin:money-withdraw","vaadin:money","vaadin:moon-o","vaadin:moon","vaadin:morning","vaadin:movie","vaadin:music","vaadin:mute","vaadin:native-button","vaadin:newspaper","vaadin:notebook","vaadin:nurse","vaadin:office","vaadin:open-book","vaadin:option-a","vaadin:option","vaadin:options","vaadin:orientation","vaadin:out","vaadin:outbox","vaadin:package","vaadin:padding-bottom","vaadin:padding-left","vaadin:padding-right","vaadin:padding-top","vaadin:padding","vaadin:paint-roll","vaadin:paintbrush","vaadin:palete","vaadin:palette","vaadin:panel","vaadin:paperclip","vaadin:paperplane-o","vaadin:paperplane","vaadin:paragraph","vaadin:password","vaadin:paste","vaadin:pause","vaadin:pencil","vaadin:phone-landline","vaadin:phone","vaadin:picture","vaadin:pie-bar-chart","vaadin:pie-chart","vaadin:piggy-bank-coin","vaadin:piggy-bank","vaadin:pill","vaadin:pills","vaadin:pin-post","vaadin:pin","vaadin:play-circle-o","vaadin:play-circle","vaadin:play","vaadin:plug","vaadin:plus-circle-o","vaadin:plus-circle","vaadin:plus-minus","vaadin:plus-square-o","vaadin:plus","vaadin:pointer","vaadin:power-off","vaadin:presentation","vaadin:print","vaadin:progressbar","vaadin:puzzle-piece","vaadin:pyramid-chart","vaadin:qrcode","vaadin:question-circle-o","vaadin:question-circle","vaadin:question","vaadin:quote-left","vaadin:quote-right","vaadin:random","vaadin:raster-lower-left","vaadin:raster","vaadin:records","vaadin:recycle","vaadin:refresh","vaadin:reply-all","vaadin:reply","vaadin:resize-h","vaadin:resize-v","vaadin:retweet","vaadin:rhombus","vaadin:road-branch","vaadin:road-branches","vaadin:road-split","vaadin:road","vaadin:rocket","vaadin:rotate-left","vaadin:rotate-right","vaadin:rss-square","vaadin:rss","vaadin:safe-lock","vaadin:safe","vaadin:scale-unbalance","vaadin:scale","vaadin:scatter-chart","vaadin:scissors","vaadin:screwdriver","vaadin:search-minus","vaadin:search-plus","vaadin:search","vaadin:select","vaadin:server","vaadin:share-square","vaadin:share","vaadin:shield","vaadin:shift-arrow","vaadin:shift","vaadin:shop","vaadin:sign-in-alt","vaadin:sign-in","vaadin:sign-out-alt","vaadin:sign-out","vaadin:signal","vaadin:sitemap","vaadin:slider","vaadin:sliders","vaadin:smiley-o","vaadin:sort","vaadin:sound-disable","vaadin:spark-line","vaadin:specialist","vaadin:spinner-arc","vaadin:spinner-third","vaadin:spinner","vaadin:spline-area-chart","vaadin:spline-chart","vaadin:split-h","vaadin:split-v","vaadin:split","vaadin:spoon","vaadin:square-shadow","vaadin:star-half-left-o","vaadin:star-half-left","vaadin:star-half-right-o","vaadin:star-half-right","vaadin:star-o","vaadin:star","vaadin:start-cog","vaadin:step-backward","vaadin:step-forward","vaadin:stethoscope","vaadin:stock","vaadin:stop-cog","vaadin:stop","vaadin:stopwatch","vaadin:storage","vaadin:strikethrough","vaadin:subscript","vaadin:suitcase","vaadin:sun-down","vaadin:sun-o","vaadin:sun-rise","vaadin:superscript","vaadin:sword","vaadin:tab-a","vaadin:tab","vaadin:table","vaadin:tablet","vaadin:tabs","vaadin:tag","vaadin:tags","vaadin:tasks","vaadin:taxi","vaadin:teeth","vaadin:terminal","vaadin:text-height","vaadin:text-input","vaadin:text-label","vaadin:text-width","vaadin:thin-square","vaadin:thumbs-down-o","vaadin:thumbs-down","vaadin:thumbs-up-o","vaadin:thumbs-up","vaadin:ticket","vaadin:time-backward","vaadin:time-forward","vaadin:timer","vaadin:toolbox","vaadin:tools","vaadin:tooth","vaadin:touch","vaadin:train","vaadin:trash","vaadin:tree-table","vaadin:trendind-down","vaadin:trending-down","vaadin:trending-up","vaadin:trophy","vaadin:truck","vaadin:twin-col-select","vaadin:twitter-square","vaadin:twitter","vaadin:umbrella","vaadin:underline","vaadin:unlink","vaadin:unlock","vaadin:upload-alt","vaadin:upload","vaadin:user-card","vaadin:user-check","vaadin:user-clock","vaadin:user-heart","vaadin:user-star","vaadin:user","vaadin:users","vaadin:vaadin-h","vaadin:vaadin-v","vaadin:viewport","vaadin:vimeo-square","vaadin:vimeo","vaadin:volume-down","vaadin:volume-off","vaadin:volume-up","vaadin:volume","vaadin:wallet","vaadin:warning","vaadin:workplace","vaadin:wrench","vaadin:youtube-square","vaadin:youtube"];var Dw=Object.defineProperty,Mw=Object.getOwnPropertyDescriptor,ve=(e,t,a,r)=>{for(var i=r>1?void 0:r?Mw(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&Dw(t,a,i),i};let ls=null;const Nw=()=>(ls||(ls=Promise.all([ee(()=>import("./vendor-ui5.js").then(e=>e.C),__vite__mapDeps([2,3,4,1])),ee(()=>import("./vendor-ui5.js").then(e=>e.R),__vite__mapDeps([2,3,4,1]))])),ls);let ne=class extends I{constructor(){super(...arguments),this.inFoldout=!1,this.ui5FieldComponentsReady=!1,this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter="",this.rendered=!1,this.renderColorPicker=()=>{this.loadUi5FieldComponents();const e=this.field?.fieldId,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue;return n`
            <ui5-color-picker value="${t}" @change="${a=>this.colorPickerValue=a.target.value}">Picker</ui5-color-picker>
        `},this.saveColor=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.colorPickerValue,fieldId:this.field.fieldId},bubbles:!0,composed:!0})),this.colorPickerOpened=!1},this.renderColorPickerFooter=()=>n`<vaadin-button @click="${()=>this.colorPickerOpened=!1}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`,this.checked=e=>{const t=e.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))},this.convert=e=>this.field?.dataType=="integer"?$o(e,!0):e,this.multiComboBoxValueChanged=e=>{if(this.rendered){const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let r;e.detail.value&&(r=e.detail.value.map(i=>i.value),r&&r.length>0&&(this.data[this.id]||(this.data[this.id]={}),this.data[this.id].content||(this.data[this.id].content=[]),this.data[this.id]&&this.data[this.id].content&&e.detail.value.forEach(i=>{this.data[this.id].content?.find(s=>i.value==s.value)||this.data[this.id].content.push(i)}))),this.compareArrays(r,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.valueChanged=e=>{this.rendered&&e.detail.value!==void 0&&!N$(e.detail.value,this.state[this.field.fieldId])&&this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.convert(e.detail.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.selectedItems=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.comboData&&this.comboData.length>0)return this.comboData?.filter(t=>e.indexOf(t.value)>=0);if(this.data[this.id]&&this.data[this.id].content&&this.data[this.id].content.length>0)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0)}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0);return[]},this.selectedIndex=e=>{if(e)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const t=this.data[this.id].content.find(a=>a.value==e);if(t)return this.data[this.id].content.indexOf(t)}}else{const t=this.field?.options?.find(a=>a.value==e);if(t)return this.field?.options?.indexOf(t)}},this.selectedIndexes=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content)return this.data[this.id].content.filter(a=>e.indexOf(a.value)>=0).map(a=>this.data[this.id].content.indexOf(a))}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0).map(t=>this.field?.options?.indexOf(t));return[]},this.compareArrays=(e,t)=>this.falsy(e)&&this.falsy(t)||e&&t&&e.length===t.length&&e.every((a,r)=>a===t[r]),this.falsy=e=>!e||e.length==0,this.listItemsSelected=e=>{const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let r;this.rendered&&(e.detail.value&&(this.field?.remoteCoordinates?this.data[this.id]&&this.data[this.id].content&&(r=e.detail.value.map(i=>this.data[this.id].content[i].value)):r=e.detail.value.map(i=>this.field.options[i].value)),this.compareArrays(r,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r,fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))},this.listItemSelected=e=>{let t;if(e.detail.value||e.detail.value==0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const a=this.data[this.id].content[e.detail.value];a&&(t=a.value)}}else{const a=this.field.options[e.detail.value];a&&(t=a.value)}this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.mapPosition=e=>{switch(e){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.helperShownInControl=!1,this.lastAnnouncedError="",this.controlOwnsValidity=!1,this.fileUploaded=e=>{const t=this.field?.fieldId??"",a=this.state[t];a.push({id:e.detail.xhr.responseText,name:e.detail.file.name}),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.fileChanged=e=>{const t=this.field?.fieldId??"",a=(e.detail.value??[]).filter(i=>i.id).map(i=>i.id),r=(this.state[t]??[]).map(i=>i.id);if(!this.compareArrays(r,a)){const i=(e.detail.value??[]).filter(s=>s.id).map(s=>({id:s.id,name:s.name}));this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.triggerImageUpload=()=>{this.renderRoot?.querySelector('input[type="file"]')?.click()},this.imageUpload=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const r=new FileReader;r.onload=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r.result,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},r.readAsDataURL(a),t.value=""},this.imageDelete=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:"",fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.iconComboboxRenderer=e=>n`
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
`,this.comboRenderer=e=>n`
        ${e.description||e.image||e.icon?n`
            <vaadin-horizontal-layout theme="spacing">
                ${e.icon?n`<div><vaadin-icon icon="${e.icon}"></vaadin-icon></div>
                                    `:d}
                ${e.image?n`
                    <div>
                    <img
                            style="width: var(--lumo-size-m); margin-right: var(--lumo-space-s);"
                            src="${e.image}"
                            alt="${e.label}"
                    />
                    </div>
                                        `:d}
                <div>
                    ${e.label}
                    ${e.description?n`
            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);">
                ${e.description}
            </div>
        `:d}
                </div>

            </vaadin-horizontal-layout>
                            `:e.label}
`,this.filteredIcons=[],this.navLinkOffset=null,this.iconFilterChanged=e=>{this.filteredIcons=Ln.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}connectedCallback(){super.connectedCallback(),this.inFoldout=Y$(this,"mateu-vaadin-foldout")}loadUi5FieldComponents(){this.ui5FieldComponentsReady||Nw().then(()=>{this.ui5FieldComponentsReady=!0})}remoteComboDataProvider(e){return(t,a)=>{const{filter:r,page:i,pageSize:s}=t,o=r??"";this._comboFilter=o,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{searchText:r,fieldId:this.field?.fieldId,size:s,page:i,sort:void 0},callback:l=>{if(o===this._comboFilter)if(l?.messages?.forEach(c=>{ai.show(c.text,{position:c.position?this.mapPosition(c.position):void 0,theme:c.variant,duration:c.duration})}),!l.fragments||l.fragments.length==0)this.comboData=[],a([],0);else{const c=l.fragments[0].data?.[this.id];this.comboData=c?.content,a(c?.content,c?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}renderNavLink(){const e=this.field?.link;if(!e?.href)return d;const t=G(e.href,this.state,this.data)??e.href,a=G(e.title,this.state,this.data)||t,r=e.icon||(t.startsWith("http")?"vaadin:external-link":"vaadin:link"),i=this.navLinkOffset??"calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)";return n`<a
                data-navlink
                href="${t}"
                title="${a}"
                target="${M(e.target||void 0)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${i};"
        ><vaadin-icon icon="${r}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`}positionNavLink(){const e=this.renderRoot?.querySelector("a[data-navlink]");e&&setTimeout(()=>{const t=e.parentElement,a=t?.firstElementChild?.firstElementChild;if(!t||!a)return;const i=(a.shadowRoot?.querySelector('[part="input-field"]')??a).getBoundingClientRect();if(i.height===0)return;const s=Math.max(0,i.top+i.height/2-e.offsetHeight/2-t.getBoundingClientRect().top),o=`${Math.round(s)}px`;this.navLinkOffset!==o&&(this.navLinkOffset=o)})}helperText(){return this.helperShownInControl=!0,Me(this.field?.description??"",this.state,this.data)??""}fieldErrors(){const e=this.field?.fieldId??"",t=this.data?.errors?.[e];return Array.isArray(t)?t.filter(a=>!!a):[]}validatableControl(){const e=this.renderRoot.querySelectorAll("*");for(const t of e)if("invalid"in t&&"errorMessage"in t)return t;return null}applyValidationState(){const e=this.fieldErrors(),t=this.validatableControl();if(!t){this.lastAnnouncedError=e.join(". ");return}const a=e.join(". ");if(t.errorMessage=a,t.invalid=e.length>0,a&&a!==this.lastAnnouncedError){const r=(this.field?.label??"").toString().trim();Vs(r?`${r}: ${a}`:a,{politeness:"assertive"})}this.lastAnnouncedError=a}render(){this.rendered=!0;const e=this.renderNavLink();this.helperShownInControl=!1;const t=this.renderField(),a=this.field?.description&&!this.helperShownInControl?Me(this.field.description,this.state,this.data):void 0,r=this.fieldErrors(),i=r.length>0&&!this.controlOwnsValidity;return n`<div style="display: block;">
            <div style="${e!==d?"display: flex; gap: var(--lumo-space-xs);":""}"><div style="flex: 1; min-width: 0;">${t}</div>${e}</div>
            ${a?n`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${a}</div>
            `:d}
            ${i?n`
                <div role="alert"><ul>${r.map(s=>n`<li>${s}</li>`)}</ul></div>
            `:d}
        </div>`}async firstUpdated(){this.filteredIcons=Ln}update(e){e.has("component")&&(this.rendered=!1),super.update(e)}updated(e){super.updated(e),this.positionNavLink(),this.applyValidationState(),this.controlOwnsValidity=!!this.validatableControl()}renderField(){const e=this.field?.fieldId??"",t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,a=this.field?.label+"",r=G(a,this.state,this.data),i=this.labelAlreadyRendered||!r||r=="null"?d:r;return this.field?.propertyRow?this.renderPropertyRowField(e,t,i,r):this.field?.stereotype=="badge"?this.renderBadgeField(e,t,i,r):this.field?.stereotype=="plainText"?this.renderPlainTextField(e,t,i,r):this.field?.stereotype=="bulletedList"?this.renderBulletedListField(e,t,i,r):F$(this.field)?this.renderSearchableMultiField(e,t,i):K$(this.field,this.inFoldout)?this.renderFoldoutReadOnlyField(t,i):this.field?.readOnly&&this.field.stereotype!="grid"&&this.field.dataType!="status"&&this.field?.dataType!="money"?this.renderReadOnlyField(e,t,i,r):this.field?.dataType=="file"?this.renderFileField(e,t,i,r):this.field?.dataType=="string"?this.renderStringField(e,t,i,r):this.field?.dataType=="number"?this.renderNumberField(e,t,i,r):this.field?.dataType=="integer"?this.renderIntegerField(e,t,i,r):this.field?.dataType=="bool"||this.field?.dataType=="boolean"?this.renderBoolField(e,t,i,r):this.field?.dataType=="dateRange"?this.renderDateRangeField(e,t,i,r):this.field?.dataType=="date"?this.renderDateField(e,t,i,r):this.field?.dataType=="dateTime"?this.renderDateTimeField(e,t,i,r):this.field?.dataType=="time"?this.renderTimeField(e,t,i,r):this.field?.dataType=="array"?this.renderArrayField(e,t,i,r):this.field?.dataType=="money"?this.renderMoneyField(e,t,i,r):this.field?.dataType=="status"?this.renderStatusField(e,t,i,r):this.field?.dataType=="range"?this.renderRangeField(e,t,i,r):n`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,a,r){if(!this.field)return n``;const i=t===!0||t==="true";return n`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${i?"success":""} pill" style="${i?"":"opacity: 0.4;"}">${r}</span>
            </vaadin-custom-field>`}renderPropertyRowField(e,t,a,r){if(!this.field)return n``;let i=Me(t,this.state,this.data);const s=this.data??{},o=$=>s[$]!==void 0&&s[$]!==null&&typeof s[$]!="object"?s[$]:void 0;(i==null||i==="")&&o(this.field.fieldId)!==void 0&&(i=o(this.field.fieldId));const l=o(this.field.fieldId+"-label");l!==void 0&&l!==""&&(i=l);const c=i&&typeof i=="object"&&"value"in i?i:null;i&&i.value&&(i=i.value);const u=this.field?.dataType=="bool"||i===!0||i===!1,p=this.field?.dataType=="money",m=i!=null&&i!=="";let f=m?String(i):"—";if(p&&m){const $=typeof i=="number"?i:parseFloat(String(i));isNaN($)||(f=c&&c.locale&&c.currency?new Intl.NumberFormat(c.locale,{style:"currency",currency:c.currency}).format($):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format($))}const g=u?n`<vaadin-icon icon="${i===!0||i==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:n`<span style="font-weight: 500; text-align: right; word-break: break-word; margin-left: auto;${p?" font-variant-numeric: tabular-nums;":""}">${f}</span>`,y=r&&r!="null";return n`<div
                    id="${this.field.fieldId}"
                    data-colspan="${this.field?.colspan}"
                    style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; width: 100%; padding: 0.4rem 0; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); font-size: var(--lumo-font-size-s, .875rem); ${this.field?.style}"
            >${y?n`<span style="color: var(--lumo-secondary-text-color, #888); white-space: nowrap;">${r}</span>`:d}${g}</div>`}renderBulletedListField(e,t,a,r){if(!this.field)return n``;const i=Me(t,this.state,this.data),s=Array.isArray(i)?i.map(o=>String(o)):i!=null&&i!==""?[String(i)]:[];return n`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><mateu-bulleted-list .items="${s}"></mateu-bulleted-list>
            </vaadin-custom-field>`}renderPlainTextField(e,t,a,r){if(!this.field)return n``;let i=Me(t,this.state,this.data);const s=i&&typeof i=="object"&&"value"in i?i:null;i&&i.value&&(i=i.value);const o=this.field?.dataType=="bool"||i===!0||i===!1,l=this.field?.dataType=="money",c=i!=null&&i!=="";let u=c?String(i):"—";if(l&&c){const m=typeof i=="number"?i:parseFloat(String(i));isNaN(m)||(u=s&&s.locale&&s.currency?new Intl.NumberFormat(s.locale,{style:"currency",currency:s.currency}).format(m):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(m))}const p=o?n`<vaadin-icon icon="${i===!0||i==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?n`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${u}</span>`:n`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${l?" font-variant-numeric: tabular-nums;":""}">${u}</span>`;return n`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    data-colspan="${this.field?.colspan}"
                    style="${l?"text-align: right; ":""}${this.field?.style}"
            >${p}</vaadin-custom-field>`}renderFoldoutReadOnlyField(e,t){if(!this.field)return n``;let a=Me(e,this.state,this.data);const r=this.data??{},i=c=>r[c]!==void 0&&r[c]!==null&&typeof r[c]!="object"?r[c]:void 0;(a==null||a==="")&&i(this.field.fieldId)!==void 0&&(a=i(this.field.fieldId));const s=i(this.field.fieldId+"-label");s!==void 0&&s!==""&&(a=s),a&&typeof a=="object"&&"value"in a&&(a=a.value);const o=this.field.options?.find?.(c=>c&&c.value==a);o&&o.label!=null&&(s===void 0||s==="")&&(a=o.label);const l=a!=null&&a!==""?String(a):"—";return n`<vaadin-custom-field
                id="${this.field.fieldId}"
                class="mateu-readonly-text"
                label="${t}"
                data-colspan="${this.field?.colspan}"
                style="padding-top: 0; padding-bottom: 0; ${this.field?.style??""}"
        ><span style="display: block; line-height: 1.4; font-weight: 500; white-space: pre-wrap; word-break: break-word; color: var(--lumo-body-text-color);">${l}</span></vaadin-custom-field>`}renderReadOnlyField(e,t,a,r){if(!this.field)return n``;let i=Me(t,this.state,this.data)||this.data[e];if(i&&i.value&&(i=i.value),this.field.stereotype=="fileUpload")return n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><mateu-file-upload .fieldId="${this.field.fieldId}" .value="${i}" .editable="${!1}"></mateu-file-upload>
                </vaadin-custom-field>`;if(this.field.stereotype=="image"||this.field.stereotype=="uploadableImage"||this.field.stereotype=="signature"||this.field.stereotype=="camera")return n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><img src="${i}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`;if(this.field.dataType=="bool"||this.field.dataType=="boolean")return n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${i?"vaadin:check":"vaadin:minus"}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`;const s=i!=null?String(i):"";return n`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .value="${s}"
                        readonly
                        style="${this.field.style}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon
                        slot="suffix"
                        icon="vaadin:copy"
                        title="Copiar"
                        ?hidden="${s.length<=15}"
                        style="cursor: pointer; color: var(--lumo-secondary-text-color);"
                        @click="${()=>this.copyValue(s)}"
                ></vaadin-icon></vaadin-text-field>
`}copyValue(e){navigator.clipboard.writeText(e).then(()=>ai.show("Copied",{position:"bottom-end",theme:"success",duration:2e3})).catch(()=>{})}renderSearchableMultiField(e,t,a){if(!this.field)return n``;const r=!!this.field.readOnly,i=q$(e),s=B$(this.state&&i in this.state?this.state[i]:t),o=U$(s,this.data?.[i+"-labels"]),l=this.data?.[i+"-label"],c=p=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:j$(s,p),fieldId:i},bubbles:!0,composed:!0}))},u=()=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"codesearch-"+i,parameters:{}},bubbles:!0,composed:!0}))};return n`
            <vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    required="${this.field.required||d}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field.colspan}"
            >
                <div class="searchable-multi" role="list">
                    ${o.map(p=>n`<span class="searchable-chip" role="listitem" theme="badge pill">
                        <span>${p.label}</span>
                        ${r?d:n`<vaadin-button
                                theme="icon tertiary-inline small"
                                aria-label="Remove ${p.label}"
                                title="Remove"
                                @click="${()=>c(p.id)}"
                        ><vaadin-icon icon="vaadin:close-small"></vaadin-icon></vaadin-button>`}
                    </span>`)}
                    ${r&&o.length==0&&l?n`<span>${l}</span>`:d}
                    ${r?d:n`<vaadin-button
                            theme="small tertiary"
                            class="searchable-add"
                            @click="${u}"
                    ><vaadin-icon icon="lumo:search" slot="prefix"></vaadin-icon>Add</vaadin-button>`}
                </div>
            </vaadin-custom-field>
        `}renderFileField(e,t,a,r){if(!this.field)return n``;const i=t?.map(s=>({id:s.id,name:s.name,type:"",uploadTarget:"",complete:!0}))??[];return n`
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
            `}renderStringField(e,t,a,r){if(!this.field)return n``;if(this.field?.stereotype=="searchable"){const i=o=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"code-"+this.field?.fieldId,parameters:{code:o.currentTarget.value}},bubbles:!0,composed:!0}))},s=o=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"codesearch-"+this.field?.fieldId,parameters:{}},bubbles:!0,composed:!0}))};return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            required="${this.field.required||d}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-horizontal-layout theme="spacing" style="--lumo-space-m: 0.33rem;">
                            <vaadin-text-field style="width: 4rem;" @change="${i}" value="${t}"></vaadin-text-field>
                            <vaadin-text-field readonly="" value="${this.data[this.field.fieldId+"-label"]}"></vaadin-text-field>
                            <vaadin-button theme="icon" @click="${s}"><vaadin-icon icon="lumo:search"></vaadin-icon></vaadin-button>
                        </vaadin-horizontal-layout>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="select"){if(this.field?.optionsSource){const s=this.field.optionsSource,o=G(s.url,this.state,this.data)??s.url;this.data[this.id]?.sourceSignature!==o&&(this.data[this.id]={content:this.data[this.id]?.content??[],sourceSignature:o},s.proxy?this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"__restfetch__",parameters:{_sourceKind:"options",_sourceId:this.field.fieldId},callback:c=>{const u=c?.appData?._restfetch,p=Dl(u,s.itemsPath,s.valuePath,s.labelPath);this.data[this.id]={content:p,totalElements:p.length,sourceSignature:o},this.requestUpdate()},callbackonly:!0},bubbles:!0,composed:!0})):Yh(s,c=>G(c,this.state,this.data)).then(c=>{this.data[this.id]={content:c,totalElements:c.length,sourceSignature:o},this.requestUpdate()}).catch(c=>console.warn("mateu: external options fetch failed",c)));let l=t;return t&&t.value&&(l=t.value),n`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.data[this.id]?.content??[]}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${l}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                    `}if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,o="";this.data[this.id]&&(this.data[this.id].searchSignature||o)&&this.data[this.id].searchSignature!=o&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:o,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}));let l=t;return t&&t.value&&(l=t.value),n`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.data[this.id]?.content}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${l}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                    `}let i=t;return t&&t.value&&(i=t.value),n`
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
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                `}if(this.field?.stereotype=="markdown")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            required="${this.field.required||d}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><vaadin-markdown
                            .content="${t}"
                    ></vaadin-markdown>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates;let s;this.data[this.id]&&this.data[this.id].content&&(s=this.data[this.id].content.find(l=>l.value==t)),!s&&this.comboData&&(s=this.comboData.find(l=>l.value==t)),!s&&t&&(s={value:t,label:this.data[this.id+"-label"]??t});const o=this.remoteComboDataProvider(i.action);return n`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-id-path="value"
                            .dataProvider="${o}"
                            .selectedItem="${s}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            @keyup="${l=>{if(l.key=="Backspace"){const c=l.currentTarget;c.inputElement.value||(c.value="")}}}"
                            ${Ki(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}return n`
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
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            ${Ki(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,s="";return this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),n`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${M(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map(o=>n`
                            <vaadin-item>${o.description||o.image||o.icon?n`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${o.icon?n`
                                        <vaadin-icon icon="${o.icon}"></vaadin-icon>
                                    `:d}
                                    ${o.image?n`
                                            <img src="${o.image}" alt="${o.label}" style="width: 2rem;" />
                                        `:d}
                                    <vaadin-vertical-layout>
                                        <span> ${o.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${o.description}
            </span>
                                    </vaadin-vertical-layout>
                                </vaadin-horizontal-layout>
                            `:o.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                        </vaadin-custom-field>
                    `}return n`
                    <vaadin-custom-field
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${M(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(i=>n`
                            <vaadin-item>${i.description||i.image||i.icon?n`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${i.icon?n`
                                        <vaadin-icon icon="${i.icon}"></vaadin-icon>
                                    `:d}
                                    ${i.image?n`
                                            <img src="${i.image}" alt="${i.label}" style="width: 2rem;" />
                                        `:d}
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
                `}if(this.field?.stereotype=="radio"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,s="";return this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),n`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${a}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            theme="horizontal"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.data[this.id]?.content?.map(o=>n`
                            <vaadin-radio-button value="${o.value}" label="${o.label}" ?checked="${o&&t&&o.value===t}">
                                ${o.description||o.image||o.icon?n`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${o.icon?n`
                                                <vaadin-icon icon="${o.icon}"></vaadin-icon>
                                            `:d}
                                            ${o.image?n`
                                                <img src="${o.image}" alt="${o.label}" style="height: 1rem;" />
                                            `:d}
                                            <span>${o.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${o.description?n`
                                            <div>${o.description}</div>
                                        `:d}
                                    </label>
                                `:d}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `}return n`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${a}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(i=>n`
                            <vaadin-radio-button value="${i.value}" label="${i.label}">
                                ${i.description||i.image||i.icon?n`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${i.icon?n`
                                                <vaadin-icon icon="${i.icon}"></vaadin-icon>
                                            `:d}
                                            ${i.image?n`
                                                <img src="${i.image}" alt="${i.label}" style="height: 1rem;" />
                                            `:d}
                                            <span>${i.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${i.description?n`
                                            <div>${i.description}</div>
                                        `:d}
                                    </label>
                                `:d}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `}if(this.field.stereotype=="popover")return n`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            required="${this.field.required||d}"
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
                            ${Fn(()=>n`
                                <mateu-event-interceptor .target="${this}">
                                <mateu-choice
                                        .field="${this.field}"
                                        .value="${t}"
                                ></mateu-choice>
                                </mateu-event-interceptor>
                            `,[])}
                    ></vaadin-popover>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="choice")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            required="${this.field.required||d}"
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
                    `;if(this.field?.stereotype=="richText")return n`
                    <vaadin-custom-field
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <mateu-rich-text-editor
                            .maxlength="${this.field.charLimit}"
                            .value="${t}"
                            .label="${a}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                    ></mateu-rich-text-editor>
                    </vaadin-custom-field>`;if(this.field?.stereotype=="textarea")return n`
                    <vaadin-text-area
                            id="${this.field.fieldId}"
                            label="${a}"
                            .maxlength="${this.field.charLimit}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                            rows="4"
                            style="width: 100%;"
                    ></vaadin-text-area>`;if(this.field?.stereotype=="email")return n`
                    <vaadin-email-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-email-field>
                `;if(this.field?.stereotype=="link")return this.field.readOnly?n`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><a href="${t}">${t}</a></vaadin-custom-field>`:n`
                            <vaadin-text-field
                                    id="${this.field.fieldId}"
                                    label="${a}"
                                    required="${this.field.required||d}"
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
                `;if(this.field?.stereotype=="icon")return this.field.readOnly?n`<vaadin-icon
                                             icon="${t}"
                                             data-colspan="${this.field.colspan}"
                    ></vaadin-icon>`:n`
                    <vaadin-combo-box
                                    id="${this.field.fieldId}"
                                    label="${a}"
                                    required="${this.field.required||d}"
                                    @value-changed="${this.valueChanged}"
                                    value="${t}"
                                    .helperText="${this.helperText()}"
                                    ?autofocus="${this.field.wantsFocus}"
                                    data-colspan="${this.field.colspan}"
                            item-label-path="displayName"
                            style="--vaadin-combo-box-overlay-width: 16em"
                                    .filteredItems="${this.filteredIcons}"
                            @filter-changed="${this.iconFilterChanged}"
                            ${Ki(this.iconComboboxRenderer,[])}
                    >
                        ${t?n`<vaadin-icon slot="prefix" icon="${t}"></vaadin-icon>`:d}
                    </vaadin-combo-box>
                `;if(this.field?.stereotype=="password")return n`
                    <vaadin-password-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-password-field>
                `;if(this.field?.stereotype=="html")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${we(""+t)}</div></vaadin-custom-field>
                `;if(this.field?.stereotype=="image")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><img
                            src="${t}"
                            style="${this.component?.style}" class="${this.component?.cssClasses}"></vaadin-custom-field>
                `;if(this.field?.stereotype=="treeSelect"){const i=this.helperText();return n`
                    <div class="tree-field" id="${this.field.fieldId}" data-colspan="${this.field.colspan}">
                        ${a?n`
                            <span class="tree-field__label">${a}${this.field.required?n`<span class="tree-field__required"> •</span>`:d}</span>`:d}
                        <mateu-vaadin-tree-select
                                style="width: 100%;"
                                .fieldId="${this.field.fieldId}"
                                .value="${t}"
                                .options="${this.field.options??[]}"
                                .leavesOnly="${this.field.treeLeavesOnly??!1}"
                        ></mateu-vaadin-tree-select>
                        ${i?n`<span class="tree-field__helper">${i}</span>`:d}
                    </div>
                `}if(this.field?.stereotype=="signature")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-signature-pad .fieldId="${this.field.fieldId}" .value="${t}"></mateu-signature-pad>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="camera")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-camera-capture .fieldId="${this.field.fieldId}" .value="${t}"></mateu-camera-capture>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="fileUpload"){const i=M$(this.field.attributes,"accept");return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-file-upload .fieldId="${this.field.fieldId}" .value="${t}" .accept="${i}"></mateu-file-upload>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="uploadableImage"){const i=t!=null&&t!=="";return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-vertical-layout style="align-items: stretch; gap: var(--lumo-space-s); max-width: 320px;">
                            ${i?n`<img
                                    src="${t}"
                                    style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--lumo-contrast-20pct); border-radius: var(--lumo-border-radius-m); ${this.field.style??""}"
                                    class="${this.component?.cssClasses}">`:n`<div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--lumo-contrast-30pct); border-radius: var(--lumo-border-radius-m); color: var(--lumo-secondary-text-color);">
                                    <vaadin-icon icon="vaadin:picture" style="height: 2rem; width: 2rem;"></vaadin-icon>
                                </div>`}
                            <input type="file" accept="image/*" style="display: none;" @change="${this.imageUpload}">
                            <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-start;">
                                <vaadin-button @click="${this.triggerImageUpload}">
                                    <vaadin-icon icon="vaadin:upload" slot="prefix"></vaadin-icon>
                                    ${i?"Replace":"Upload"}
                                </vaadin-button>
                                ${i?n`<vaadin-button theme="error tertiary" @click="${this.imageDelete}">
                                    <vaadin-icon icon="vaadin:trash" slot="prefix"></vaadin-icon>
                                    Delete
                                </vaadin-button>`:d}
                            </vaadin-horizontal-layout>
                        </vaadin-vertical-layout>
                    </vaadin-custom-field>
                `}return this.field?.stereotype=="color"?this.field.readOnly?n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><span style="background-color: ${t}; display: block; height: 20px; width: 40px; margin-top: 5px; margin-bottom: 24px; border: 1px solid var(--lumo-secondary-text-color)"></vaadin-custom-field>
                `:n`
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
  ${Nn(this.renderColorPicker,[])}
  ${xc(this.renderColorPickerFooter,[])}
></vaadin-dialog>
                `:n`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        ?disabled="${this.field.disabled}"
                        data-colspan="${this.field.colspan}"
                        style="${this.field.style}"
                ></vaadin-text-field>
`}renderNumberField(e,t,a,r){return this.field?n`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||d}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min!=null?this.field.min:d}"
                        max="${this.field.max!=null?this.field.max:d}"
            ></vaadin-number-field>`:n``}renderIntegerField(e,t,a,r){if(!this.field)return n``;if(this.field.stereotype=="stars"){let i=t;isNaN(i)&&(i=0);const s=[1,2,3,4,5];return n`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >${s.map(o=>n`
                    <vaadin-icon 
                            icon="vaadin:star" 
                            style="cursor: pointer; color: var(${o<=i?"--lumo-warning-color":"--lumo-shade-30pct"});"
                            @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:o,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}"
                    
                    ></vaadin-icon>
                `)}</vaadin-custom-field>`}if(this.field.stereotype=="slider"){let i=t;return isNaN(i)&&(i=0),n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><input type="range" @input="${s=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}" min="${this.field.sliderMin??0}" max="${this.field.sliderMax??10}" value="${i??0}"/></vaadin-custom-field>
                `}return n`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||d}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min!=null?this.field.min:d}"
                        max="${this.field.max!=null?this.field.max:d}"
                ></vaadin-integer-field>
            `}renderBoolField(e,t,a,r){return this.field?this.field.stereotype=="toggle"?n`
                    <vaadin-custom-field
                            label="${a}"
                            .helperText="${this.helperText()}"
                            ?required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    >
                        <paper-toggle-button id="${this.field.fieldId}"
                                             ?disabled=${this.field.disabled}
                                             ?checked=${t}
                                             @change=${this.checked}>
                        </paper-toggle-button>
                    </vaadin-custom-field>
                `:n`
                <vaadin-checkbox
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                        @change="${this.checked}"
                        value="${t}"
                        ?checked=${t}
                        ?autofocus="${this.field.wantsFocus}"
                ></vaadin-checkbox>
            `:n``}renderDateRangeField(e,t,a,r){if(!this.field)return n``;const i=t?t.from+";"+t.to:void 0;return n`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${a}"
                    @value-changed="${s=>{s.detail.value&&(s.detail.value={from:s.detail.value.split(";")[0],to:s.detail.value.split(";")[1]}),this.valueChanged(s)}}"
                    value="${i}"
                    .helperText="${this.helperText()}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||d}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,a,r){return this.field?n`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:n``}renderDateTimeField(e,t,a,r){return this.field?n`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:n``}renderTimeField(e,t,a,r){return this.field?n`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:n``}renderArrayField(e,t,a,r){if(!this.field)return n``;if(this.field?.stereotype=="choice")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            required="${this.field.required||d}"
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
                    `;if(this.field?.stereotype=="grid")return n`
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
`;if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,s="";return this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),n`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box multiple
                                     .selectedValues="${M(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                            id="${this.field.fieldId}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map(o=>n`
                            <vaadin-item>${o.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                        </vaadin-custom-field>
                    `}return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box multiple
                                     .selectedValues="${M(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                                     data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(i=>n`
                            <vaadin-item>${i.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,s=this.remoteComboDataProvider(i.action);return n`
                        <vaadin-multi-select-combo-box
                            label="${a}"
                            item-label-path="label"
                            item-id-path="value"
                            item-value-path="value"
                            .dataProvider="${s}"
                            .helperText="${this.helperText()}"
                            .selectedItems="${this.selectedItems(t)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||d}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            auto-expand-horizontally
                            auto-expand-vertically
                            xselected-items-on-top
                    ></vaadin-multi-select-combo-box>
                    `}return n`
                    <vaadin-multi-select-combo-box
                            label="${a}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            .selectedItems="${this.selectedItems(t)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||d}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            auto-expand-horizontally
                            auto-expand-vertically
                            xselected-items-on-top
                    ></vaadin-multi-select-combo-box>
                    `}if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,s="";return this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.rendered||setTimeout(()=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}),n`
                    <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${a}"
                        theme="vertical"
                        @value-changed="${this.valueChanged}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                        .value="${t}"
                        class="mateu-checkbox-group-${this.field.optionsColumns>1?"multi-column":""}"
                >
                        ${this.data[this.id]?.content?.map(o=>n`
                            <vaadin-checkbox
                                    value="${o.value}"
                                    label="${o.label}"
                            ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
                    `}return n`
                <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        theme="vertical"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                        class="mateu-checkbox-group-${this.field.optionsColumns>1?"multi-column":""}"
                        .value="${t}"
                >
                        ${this.field.options?.map(i=>n`
                        <vaadin-checkbox 
                                value="${i.value}" 
                                label="${i.label}"
                        ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
            `}renderMoneyField(e,t,a,r){if(!this.field)return n``;if(this.field.readOnly){const i=t;let s=i;return i&&i.locale&&i.currency?s=new Intl.NumberFormat(i.locale,{style:"currency",currency:i.currency}).format(i.value):s=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(i),n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><div style="width: 186px; text-align: right;">${s}</div></vaadin-custom-field>`}return n`<mateu-money-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        .value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></mateu-money-field>`}renderStatusField(e,t,a,r){if(!this.field)return n``;const i=t;return n`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    ${i?n`<span theme="badge pill ${Bi(i.type)}">${i.message}</span>`:n``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,a,r){if(!this.field)return n``;this.loadUi5FieldComponents();const i=t;return n`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${i?.from??0}" end-value="${i?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${this.field.sliderMax??10}"
                                   step="${this.field.step||d}"
                                   @change="${s=>{const o=s.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{from:o.startValue,to:o.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}};ne.styles=k`
        /* multi-valued @Searchable: the ids as chips, then «Add» */
        .searchable-multi {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--lumo-space-xs);
            min-height: var(--lumo-size-m);
        }
        .searchable-chip {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            padding: 2px var(--lumo-space-s);
            border-radius: var(--lumo-border-radius-l, 1em);
            background: var(--lumo-contrast-10pct);
            color: var(--lumo-body-text-color);
            font-size: var(--lumo-font-size-s);
            line-height: var(--lumo-line-height-s);
        }
        .searchable-chip vaadin-button {
            margin: 0;
            min-width: 0;
            padding: 0;
            height: auto;
        }
        ${Mt}

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
  `;ve([b()],ne.prototype,"inFoldout",2);ve([b()],ne.prototype,"ui5FieldComponentsReady",2);ve([h()],ne.prototype,"component",2);ve([h()],ne.prototype,"field",2);ve([h()],ne.prototype,"baseUrl",2);ve([h()],ne.prototype,"state",2);ve([h()],ne.prototype,"data",2);ve([h()],ne.prototype,"appState",2);ve([h()],ne.prototype,"appData",2);ve([h()],ne.prototype,"labelAlreadyRendered",2);ve([b()],ne.prototype,"colorPickerOpened",2);ve([b()],ne.prototype,"colorPickerValue",2);ve([b()],ne.prototype,"controlOwnsValidity",2);ve([b()],ne.prototype,"filteredIcons",2);ve([b()],ne.prototype,"navLinkOffset",2);ne=ve([_("mateu-field")],ne);const Fw=(e,t,a,r,i,s,o,l)=>{const c=t.metadata;return n`
        <mateu-field
                id="${t.id}"
                .component="${t}"
                .field="${t.metadata}"
                .state="${r}"
                .data="${i}"
                .appState="${s}"
                .appdata="${o}"
                style="${_d(t,i)}" class="${t.cssClasses}"
                slot="${t.slot??d}"
                data-colspan="${c.colspan}"
                colspan="${(c.colspan??1)>1?c.colspan:d}"
                .labelAlreadyRendered="${l}"
        >
            ${t.children?.map(u=>x(e,u,a,r,i,s,o,l))}
        </mateu-field>
    `},qw=(e,t,a,r,i,s,o)=>{const l=t.metadata;if(l.tree){const u=async(p,m)=>{const f=p.parentItem?p.parentItem.children:l.page.content;m(f,f.length)};return n`
        <vaadin-grid style="${t.style}" class="${t.cssClasses}"
                     .itemHasChildrenPath="${"children"}" .dataProvider="${u}"
                     slot="${t.slot??d}"
                     all-rows-visible
        >
            ${l.content.map((p,m)=>{const f=p.metadata;return m>0?n`
            <vaadin-grid-column path="${p.id}"
                                header="${f?.label??d}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??d}"
                                width="${f?.width??d}"
                                .column="${p.metadata}"
                                ${ht((g,y,$)=>vr(g,y,$,f,e,a,r,i,s,o),[])}></vaadin-grid-column>
`:n`
            <vaadin-grid-tree-column path="${p.id}"
                                header="${f?.label??d}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??d}"
                                width="${f?.width??d}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${ma()}</span>
        </vaadin-grid>
    `}let c=l.page?.content;return t.id&&r&&r[t.id]&&(c=r[t.id]),c||(c=[]),n`
        <vaadin-grid 
                style="${t.style}" 
                class="${t.cssClasses}" 
                .items="${c}"
                all-rows-visible
        >
            ${l?.content?.map(u=>wo(u,e,a,r,i,s,o))}
        </vaadin-grid>
    `},Bw={success:"success",warning:"warning",danger:"danger",error:"danger",info:"info",neutral:"neutral",none:"neutral"},Uw=(e,t)=>{if(!e||!t)return null;let a=e[t];return a&&typeof a=="object"&&(a=a.type??a.value),a==null?null:Bw[String(a).toLowerCase()]??null};var jw=Object.defineProperty,Hw=Object.getOwnPropertyDescriptor,it=(e,t,a,r)=>{for(var i=r>1?void 0:r?Hw(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&jw(t,a,i),i};let ze=class extends I{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this._lastGridHeight=0,this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let r=!1;a&&a.content&&(a.content.length>=(e.page+1)*e.pageSize||a.content.length==a.totalElements)&&(t(a.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),a.totalElements),r=!0,this.grid&&this.grid.recalculateColumnWidths()),r||this.pagesRequested.find(i=>i==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{const r=this.metadata?.infiniteScrolling?a?.totalElements:a?.content?.length??0;t(a?.content??[],r),this.grid&&this.grid.recalculateColumnWidths()}},this.onRowsDragStart=e=>{const t=this.metadata?.dragType;if(!t)return;const a=this.identifierFieldName??"id",r=(e.detail?.draggedItems??[]).filter(i=>!Ot(i));e.detail.setDragData(wd(t),JSON.stringify(r.map(i=>i?.[a]).filter(i=>i!=null))),e.detail.setDraggedItemsCount?.(r.length)},this._onActionRequested=e=>{const t=e.detail,a=this.identifierFieldName;if(!a||!t.parameters||t.actionId?.startsWith("action-on-row-"))return;const r=t.parameters[a];r!==void 0&&(this.state._selectedId=String(r),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t="";const{column:a,item:r}=e,i=this.metadata?.columns?.find(s=>s.metadata.id==a?.path);if(i?.metadata){const s=(i?.metadata).tooltipPath;s&&a&&r&&(t=r[s])}return t},this.isDetailOpen=e=>this.detailsOpenedItems.some(t=>this.sameRow(t,e))}get identifierFieldName(){const e=this.metadata?.columns?.find(a=>a.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(a=>a.metadata?.id==="id"))return"id"}_applyCellPartNameGenerator(){if(!this.grid)return;const e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId,a=!!this.metadata?.groupBy,r=this.metadata?.rowStatusField??void 0;e&&t!==void 0||a||r?this.grid.cellPartNameGenerator=(i,s)=>{const o=s.item;if(Ot(o))return"mateu-group-row";const l=[];e&&t!==void 0&&String(o[e])===String(t)&&l.push("selected-row");const c=Uw(o,r);return c&&l.push("mateu-row-"+c),l.join(" ")}:this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener("action-requested",this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("action-requested",this._onActionRequested),this._resizeObserver?.disconnect(),this._resizeObserver=void 0}firstUpdated(){const e=this.grid;!e||this._resizeObserver||(this._resizeObserver=new ResizeObserver(()=>{const t=e.offsetHeight;t>0&&this._lastGridHeight===0&&requestAnimationFrame(()=>{e.recalculateColumnWidths(),e.requestContentUpdate(),e.notifyResize?.()}),this._lastGridHeight=t}),this._resizeObserver.observe(e))}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.requestContentUpdate(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}navigateToRowRoute(e){const a=this.shadowRoot?.querySelector("vaadin-grid")?.getEventContext?.(e)?.item;if(!a||Ot(a)||e.composedPath().some(s=>s?.tagName&&/^(A|BUTTON|INPUT|VAADIN-BUTTON|VAADIN-CHECKBOX)$/.test(s.tagName)))return;const i=Cl(this.metadata?.rowRoute,a,this.state,this.data);i&&mt(this,i)}render(){const e=this.data[this.id],t=e?.page,a=this.metadata?.groupBy,r=this.metadata?.infiniteScrolling?void 0:t?.content?ow(t.content,a,e?.groups):t?.content,i=(this.metadata?.columns??[]).flatMap(w=>w.metadata?.type===v.GridGroupColumn?(w.metadata.columns??[]).map(C=>C.metadata):[w.metadata]),s=dw(i,e,a),o=Il(this.metadata?.columns??[],w=>w.metadata?.type===v.GridGroupColumn?void 0:w.metadata),l=o.extra.length>0,c=o.extra.map(w=>w.map(C=>C.metadata)),u=l?o.first:this.metadata?.columns??[],p=!!this.metadata?.detailPath,m=r??t?.content??[],f=l?m.filter(w=>!Ot(w)):this.detailsOpenedItems,g=l?cs(w=>Ot(w)?n``:n`
                ${this.renderRowLines(w,c,p&&!this.metadata?.useButtonForDetail)}
                ${p&&this.isDetailOpen(w)?this.renderRowDetail(w[this.metadata?.detailPath]):d}`,[c,this.detailsOpenedItems,this.state,this.data]):p?cs(w=>this.renderRowDetail(w[this.metadata?.detailPath])):void 0;let y="";this.metadata?.wrapCellContent&&(y+=" wrap-cell-content"),this.metadata?.compact&&(y+=" compact"),this.metadata?.noBorder&&(y+=" no-border"),this.metadata?.noRowBorder&&(y+=" no-row-borders"),this.metadata?.columnBorders&&(y+=" column-borders"),this.metadata?.rowStripes&&(y+=" row-stripes");const $=this.state[this.id+"_selected_items"]||[];return n`
            <vaadin-grid
                    .items="${r}"
                    item-id-path="_rowNumber"
                    .selectedItems="${$}"
                    ?data-clickable-rows="${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail}"
                    ?data-multiline="${l}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?"lazy":d}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.metadata?.infiniteScrolling?this.dataProvider:void 0}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    ?rows-draggable="${!!this.metadata?.dragType}"
                    @grid-dragstart="${this.onRowsDragStart}"
                    @selected-items-changed="${w=>{const C=(w.detail.value??[]).filter(E=>!Ot(E));this.emptyArray(this.state[this.id+"_selected_items"])&&this.emptyArray(C)||(this.state[this.id+"_selected_items"]=C,l&&this.grid?.requestContentUpdate(),this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0})))}}"
                    @active-item-changed="${M(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?w=>{const C=w.detail.value;C&&Ot(C)||(this.detailsOpenedItems=C?[C]:[])}:void 0)}"
                    @click="${M(this.metadata?.rowRoute?w=>this.navigateToRowRoute(w):void 0)}"
                    .detailsOpenedItems="${f}"
                    ${M(g)}
                    theme="${y}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?n`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:d}
                ${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?dc(Ot,l?this.isDetailOpen:void 0):d}
                ${u.map(w=>wo(w,this,this.baseUrl,this.state,this.data,this.appState,this.appData,s))}
                ${this.metadata?.useButtonForDetail?n`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${ht((w,{detailsOpened:C})=>{const E=l?this.isDetailOpen(w):C;return n`
              <vaadin-button
                theme="tertiary icon"
                title="${E?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${E?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=E?this.detailsOpenedItems.filter(A=>A!==w&&!this.sameRow(A,w)):[...this.detailsOpenedItems,w]}}"
              >
                <vaadin-icon
                  .icon="${E?"lumo:angle-down":"lumo:angle-right"}"
                ></vaadin-icon>
              </vaadin-button>
            `},[l])}
                    ></vaadin-grid-column>
                `:d}
                <span slot="empty-state">${ma(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(w=>w.metadata.tooltipPath)?n`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:d}
            </vaadin-grid>
            <slot></slot>
       `}sameRow(e,t){return e===t?!0:e?._rowNumber!==void 0&&t?._rowNumber!==void 0&&e._rowNumber===t._rowNumber}renderRowLines(e,t,a){const r=this.state?.[this.id+"_selected_items"]??[],i=this.identifierFieldName,s=this.state?._selectedId??this.appState?._splitDetailId,o=r.some(l=>this.sameRow(l,e))||!!i&&s!==void 0&&String(e?.[i])===String(s);return n`<div class="row-lines" ?data-selected="${o}"
                         @click="${a?l=>{l.composedPath().some(u=>u?.tagName&&/^(A|BUTTON|INPUT|VAADIN-BUTTON|VAADIN-CHECKBOX)$/.test(u.tagName))||(this.detailsOpenedItems=this.isDetailOpen(e)?[]:[e])}:d}">
            ${t.map(l=>n`<div class="row-line">
                ${l.map(c=>n`<span class="row-line-pair" data-column="${c.id}">
                    <span class="row-line-label">${G(c.label,this.state,this.data)}:</span>
                    <span class="row-line-value">${vr(e,{},{path:c.id,dataset:{dataType:c.dataType??"",stereotype:c.stereotype??""}},c,this,this.baseUrl,this.state,this.data,this.appState,this.appData)}</span>
                </span>`)}
            </div>`)}
        </div>`}renderRowDetail(e){if(e==null||e==="")return n``;if(typeof e=="object"&&e.type)return n`${x(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)}`;const t=typeof e=="object"?JSON.stringify(e,null,2):String(e);return n`<div class="row-detail">${t}</div>`}};ze.styles=k`
        ${Mt}
        vaadin-grid[data-clickable-rows]::part(row) {
            cursor: pointer;
        }
        .row-detail {
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            font-family: var(--lumo-font-family-monospace, monospace);
            font-size: var(--lumo-font-size-s);
            padding: var(--lumo-space-s) var(--lumo-space-m);
        }
        vaadin-grid[data-clickable-rows]::part(row):hover {
            background-color: var(--lumo-primary-color-10pct);
        }
        vaadin-grid::part(selected-row) {
            background-color: var(--lumo-primary-color-10pct);
        }
        /* multi-line rows: the extra lines sit right under line 1, inside the same row */
        /* the details cell's content carries the grid's cell padding: the lines bring their own,
           so a selected row's tint fills the whole area */
        vaadin-grid[data-multiline] vaadin-grid-cell-content:has(> .row-lines) {
            padding: 0;
        }
        .row-lines {
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 0 var(--lumo-space-m) var(--lumo-space-s);
            font-size: var(--lumo-font-size-s);
            color: var(--lumo-secondary-text-color);
        }
        .row-lines[data-selected] {
            background-color: var(--lumo-primary-color-10pct);
        }
        .row-line {
            display: flex;
            flex-wrap: wrap;
            column-gap: var(--lumo-space-l);
            row-gap: 2px;
            align-items: baseline;
        }
        .row-line-pair {
            display: inline-flex;
            align-items: baseline;
            gap: var(--lumo-space-xs);
            min-width: 0;
            max-width: 100%;
        }
        .row-line-label {
            color: var(--lumo-tertiary-text-color, var(--lumo-secondary-text-color));
            white-space: nowrap;
        }
        .row-line-value {
            color: var(--lumo-body-text-color);
            min-width: 0;
            overflow: hidden;
        }
        .row-line-value > span {
            display: inline !important;
        }
        /* @RowStatus tones: a coloured left edge + a light wash of the tone on every cell */
        vaadin-grid::part(mateu-row-success) { background-color: var(--lumo-success-color-10pct, rgba(43,160,90,.10)); }
        vaadin-grid::part(mateu-row-warning) { background-color: var(--mateu-warning-10pct, rgba(255,191,0,.14)); }
        vaadin-grid::part(mateu-row-danger) { background-color: var(--lumo-error-color-10pct, rgba(231,24,24,.10)); }
        vaadin-grid::part(mateu-row-info) { background-color: var(--lumo-primary-color-10pct, rgba(0,108,226,.10)); }
        vaadin-grid::part(mateu-row-neutral) { background-color: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
        vaadin-grid::part(first-column-cell mateu-row-success) { box-shadow: inset 3px 0 0 var(--lumo-success-color, #2ba05a); }
        vaadin-grid::part(first-column-cell mateu-row-warning) { box-shadow: inset 3px 0 0 #e5a400; }
        vaadin-grid::part(first-column-cell mateu-row-danger) { box-shadow: inset 3px 0 0 var(--lumo-error-color, #e71818); }
        vaadin-grid::part(first-column-cell mateu-row-info) { box-shadow: inset 3px 0 0 var(--lumo-primary-color, #006ce2); }
        vaadin-grid::part(mateu-group-row) {
            background-color: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
            font-weight: 600;
        }
  `;it([h()],ze.prototype,"id",2);it([h()],ze.prototype,"metadata",2);it([h()],ze.prototype,"baseUrl",2);it([h()],ze.prototype,"state",2);it([h()],ze.prototype,"data",2);it([h()],ze.prototype,"appState",2);it([h()],ze.prototype,"appData",2);it([h()],ze.prototype,"emptyStateMessage",2);it([b()],ze.prototype,"detailsOpenedItems",2);it([fe("vaadin-grid")],ze.prototype,"grid",2);ze=it([_("mateu-table")],ze);const Ww=(e,t,a,r,i,s,o)=>n`
    <mateu-table
            id="${t.id}"
            baseUrl="${a}"
            .metadata="${t.metadata}"
            .state="${r}"
            .data="${i}"
            .appState="${s}"
            .appDate="${o}"
            style="${t.style}" class="${t.cssClasses}"
            slot="${t.slot??d}"
    >
        ${t.children?.map(l=>x(e,l,a,r,i,s,o))}
    </mateu-table>`,Vw=(e,t,a,r,i,s)=>n`
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
    ></mateu-table>`,Dn=new WeakMap;let Gw=0;const Kw=e=>{if(e.id&&e.id!=="fieldId")return"mateu-popover-"+e.id;let t=Dn.get(e);return t||(t="mateu-popover-"+ ++Gw,Dn.set(e,t)),t},Yw=(e,t,a,r,i,s,o)=>{const l=t.metadata,c=Kw(t),u=l.trigger==="hover";return n`
        <div id="${c}" slot="${t.slot??d}" tabindex="${u?"0":d}"
             style="${u?"display: inline-block; cursor: help; text-decoration: underline dotted; text-underline-offset: 3px;":d}">${x(e,l.wrapped,a,r,i,s,o)}</div>
        <vaadin-popover
                for="${c}"
                .trigger="${u?["hover","focus"]:["click"]}"
                theme="${u?"arrow":"arrow no-padding"}"
                ?modal="${!u}"
                accessible-name="Details"
                content-width="300px"
                position="bottom"
                ${Fn(()=>n`${x(e,l.content,a,r,i,s,o)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},Jw=(e,t,a)=>{const r=e;return n`
        <vaadin-button
                data-action-id="${r.id}"
                theme="${Ys(e)||d}"
                @click="${a}"
                ?disabled="${r.disabled}"
        >${r.iconOnLeft?n`<vaadin-icon icon="${r.iconOnLeft}"></vaadin-icon>`:d}${t}${r.iconOnRight?n`<vaadin-icon icon="${r.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>
    `},Xw=e=>n`
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
    </div>`,Qw={"vaadin:wifi":"vaadin:connect","vaadin:pen":"vaadin:pencil","vaadin:automation":"vaadin:cogs"},Zw=(e,t,a)=>n`<vaadin-icon icon="${Qw[e]??e}" style="${t??d}" class="${a??d}"></vaadin-icon>`,ex=e=>n`
    <vaadin-button theme="tertiary icon" class="mateu-header-icon-btn ${e.cssClasses??""}"
            @click="${e.onClick}"
            title="${e.title??e.label}" aria-label="${e.label}"
            aria-pressed="${e.pressed===void 0?d:String(e.pressed)}"
            aria-expanded="${e.expanded===void 0?d:String(e.expanded)}"
            aria-controls="${e.controls??d}">
        <vaadin-icon icon="${e.icon}"></vaadin-icon>
    </vaadin-button>`,tx=(e,t,a)=>{const r=e.metadata,i=G(r.label,t,a);let s="";return r.buttonStyle&&(s+=" "+r.buttonStyle),r.color&&r.color!=="none"&&r.color!=="normal"&&(s+=" "+r.color),r.size&&r.size!=="none"&&r.size!=="normal"&&(s+=" "+r.size),n`<vaadin-button
            id="${e.id}"
            data-action-id="${r.actionId}"
            data-route="${Gl(r,t,a)??d}"
            @click="${o=>Vl(o,r)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${s}"
            ?disabled="${r.disabled}"
            data-shortcut="${r.shortcut??d}"
            title="${r.shortcut?`${i} (${Wl(r.shortcut)})`:d}"
            slot="${e.slot??d}"
    >${r.iconOnLeft?n`<vaadin-icon icon="${r.iconOnLeft}"></vaadin-icon>`:d}${i}${r.iconOnRight?n`<vaadin-icon icon="${r.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>`},ax=e=>{const t=e.metadata,a=r=>{const i=r.detail?.value??"";!t.actionId||!i.trim()||r.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:i}},bubbles:!0,composed:!0}))};return n`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                @submit="${a}"
        ></vaadin-message-input>
    `},rx=e=>{const a=(e.metadata.items??[]).map(r=>({text:r.text,time:r.time,userName:r.userName,userImg:r.userImg,userAbbr:r.userAbbr,userColorIndex:r.userColorIndex}));return n`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                .items="${a}"
        ></vaadin-message-list>
    `},ds=(e,t)=>{e&&e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},ix=(e,t,a,r,i,s,o)=>{const l=t.metadata;let c=!1;if(l.openedCondition)try{c=Ks(l.openedCondition,r,i,s,o)}catch(u){console.error("when evaluating "+l.openedCondition+" :"+u+", where data is "+i+" and state is "+r)}return n`
        <vaadin-confirm-dialog
                header="${l.header}"
                ?cancel-button-visible="${l.canCancel}"
                ?reject-button-visible="${l.canReject}"
                reject-text="${l.rejectText}"
                confirm-text="${l.confirmText}"
                .opened="${c}"
                @confirm="${u=>ds(u.currentTarget,l.confirmActionId)}"
                @reject="${u=>ds(u.currentTarget,l.rejectActionId)}"
                @cancel="${u=>ds(u.currentTarget,l.cancelActionId)}"
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(u=>x(e,u,a,r,i,s,o))}
        </vaadin-confirm-dialog>
    `};var sx=Object.defineProperty,ox=Object.getOwnPropertyDescriptor,We=(e,t,a,r)=>{for(var i=r>1?void 0:r?ox(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&sx(t,a,i),i};function nx(e){let t=e;for(;t;){const a=t.parentElement??t.getRootNode().host??null;if(!a||a===t)break;if(a instanceof Element){const r=getComputedStyle(a).overflowY;if(r==="auto"||r==="scroll")return a}t=a}return document.scrollingElement}let Se=class extends I{constructor(){super(...arguments),this.panels=[],this.headerTitle="",this.badges=[],this.navigation=null,this.overviewEditActionId="",this._raf=0,this._snapping=!1,this._less=!1,this._more=!1,this._open=[],this._openKey="",this._visible=[],this._onScroll=()=>{this._raf||(this._raf=requestAnimationFrame(()=>{this._raf=0,this._syncPin()}))},this._onScrollEnd=()=>{!this._snapping&&Date.now()-this._lastWheel>400&&this._snapToNearest()},this._lastWheel=0,this._onWheel=e=>{const t=this._rail;if(!t||e.ctrlKey||e.defaultPrevented)return;const a=e.deltaMode===1?40:e.deltaMode===2?t.clientWidth:1,r=[];for(const s of e.composedPath()){if(s===t)break;if(!(s instanceof HTMLElement))continue;const o=getComputedStyle(s).overflowY;(o==="auto"||o==="scroll")&&s.scrollHeight>s.clientHeight+1&&r.push({scrollTop:s.scrollTop,scrollHeight:s.scrollHeight,clientHeight:s.clientHeight})}const i=Q$(e.deltaX*a,e.deltaY*a,t.scrollLeft,t.scrollWidth-t.clientWidth,r);i!=null&&(e.preventDefault(),this._lastWheel=Date.now(),t.scrollLeft=Math.max(0,Math.min(t.scrollWidth-t.clientWidth,t.scrollLeft+i)))},this._fit=()=>{const e=this.getBoundingClientRect().top,t=Math.max(240,window.innerHeight-e);this.style.setProperty("--mateu-foldout-fill",`${t}px`);const a=nx(this);if(a){const r=a.scrollHeight-a.clientHeight;r>0&&this.style.setProperty("--mateu-foldout-fill",`${Math.max(240,t-r)}px`)}this._syncPin()},this._onKeydown=e=>{if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft"||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||this._isEditingContext())return;const t=this._rail;!t||t.scrollWidth<=t.clientWidth||(e.preventDefault(),this._step(e.key==="ArrowRight"?1:-1))}}willUpdate(e){if(e.has("panels")){const t=V$(this._open,this._openKey,this.panels);this._open=t.states,this._openKey=t.key}}_toggle(e){const t=[...this._open];t[e]=!(t[e]??!0),this._open=t,requestAnimationFrame(()=>this._syncPin())}_goTo(e){const t=this._rail;if(!t)return;const a=[...this.renderRoot.querySelectorAll(".section")],r=(this._first?.offsetWidth??0)<t.clientWidth*.6,i=e===0||e===1&&r?0:a[e]?.offsetLeft??0,s=t.scrollWidth-t.clientWidth;this._snapping=!0,t.scrollTo({left:Math.max(0,Math.min(i,s)),behavior:"smooth"}),window.setTimeout(()=>{this._snapping=!1},400)}navAction(e){e&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}_stride(){const e=this.renderRoot.querySelectorAll(".section");return e.length>1?e[1].offsetLeft:this._rail?.clientWidth??0}_boundaries(){const e=this._rail;if(!e)return[];const t=e.scrollWidth-e.clientWidth,a=[...this.renderRoot.querySelectorAll(".section")].map(r=>Math.max(0,Math.min(r.offsetLeft,t)));return[...new Set(a)]}_snapToNearest(){const e=this._rail;if(!e)return;const t=this._boundaries();if(!t.length)return;const a=t.reduce((r,i)=>Math.abs(i-e.scrollLeft)<Math.abs(r-e.scrollLeft)?i:r);Math.abs(a-e.scrollLeft)<1||(this._snapping=!0,e.scrollTo({left:a,behavior:"smooth"}),window.setTimeout(()=>{this._snapping=!1},400))}_syncPin(){const e=this._rail,t=this._first;if(!e||!t)return;const a=this._stride(),i=t.offsetWidth<e.clientWidth*.6?Math.min(e.scrollLeft,a):0;t.style.transform=i?`translateX(${i}px)`:"",t.classList.toggle("floating",e.scrollLeft>0);const s=e.scrollWidth-e.clientWidth,o=s>32;this._less=o&&e.scrollLeft>2,this._more=o&&e.scrollLeft<s-2;const l=e.getBoundingClientRect(),c=G$({left:l.left,right:l.right},[...this.renderRoot.querySelectorAll(".section")].map(u=>{const p=u.getBoundingClientRect();return{left:p.left,right:p.right}}));c.join()!==this._visible.join()&&(this._visible=c)}_step(e){const t=this._rail;if(!t)return;const a=this._boundaries();if(!a.length)return;const r=a.reduce((s,o,l)=>Math.abs(o-t.scrollLeft)<Math.abs(a[s]-t.scrollLeft)?l:s,0),i=a[Math.max(0,Math.min(r+e,a.length-1))];this._snapping=!0,t.scrollTo({left:i,behavior:"smooth"}),window.setTimeout(()=>{this._snapping=!1},400)}_isEditingContext(){let e=document.activeElement;for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;if(!e)return!1;const t=e.tagName;return t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||e.isContentEditable}_sectionStyle(e,t){return H$(e.width,this._open[t]??!0)||d}firstUpdated(){this._fit();for(const e of[300,1e3,2500])window.setTimeout(()=>this._fit(),e);this._resizeObserver=new ResizeObserver(()=>this._fit()),this._rail&&this._resizeObserver.observe(this._rail);for(const e of this.renderRoot.querySelectorAll(".section"))this._resizeObserver.observe(e)}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onKeydown),window.addEventListener("resize",this._fit)}disconnectedCallback(){document.removeEventListener("keydown",this._onKeydown),window.removeEventListener("resize",this._fit),this._resizeObserver?.disconnect(),this._resizeObserver=void 0,this._raf&&(cancelAnimationFrame(this._raf),this._raf=0),super.disconnectedCallback()}render(){const e=this.navigation,t=!!(this.overviewEditActionId||e&&(e.parentActionId||e.previousActionId||e.nextActionId)),a=!!(this.headerTitle||t||this.badges.length);return n`
            <div class="rail" part="rail" tabindex="0"
                 @scroll="${this._onScroll}" @scrollend="${this._onScrollEnd}"
                 @wheel="${{handleEvent:this._onWheel,passive:!1}}">
                <section class="section section--first" part="section overview">
                    ${a?n`
                        <header class="section-head" part="section-head">
                            <div class="section-head-row">
                                ${this.headerTitle?n`<h2 class="section-title">${this.headerTitle}</h2>`:n`<span></span>`}
                                ${t?n`
                                    <div class="section-toolbar" part="section-toolbar">
                                        ${e?.parentActionId?n`
                                            <button class="tb-parent" title="${e.parentLabel??"Back"}"
                                                    @click="${()=>this.navAction(e.parentActionId)}">
                                                <span>‹</span><span>${e.parentLabel??"Back"}</span>
                                            </button>
                                        `:d}
                                        ${e?.previousActionId?n`
                                            <button class="tb-move" title="Previous"
                                                    @click="${()=>this.navAction(e.previousActionId)}">‹</button>
                                        `:d}
                                        ${e?.nextActionId?n`
                                            <button class="tb-move" title="Next"
                                                    @click="${()=>this.navAction(e.nextActionId)}">›</button>
                                        `:d}
                                        ${this.overviewEditActionId?n`
                                            <button class="tb-edit" title="Edit"
                                                    @click="${()=>this.navAction(this.overviewEditActionId)}">
                                                <span>✎</span><span>Edit</span>
                                            </button>
                                        `:d}
                                    </div>
                                `:d}
                            </div>
                            ${this.badges.length?n`
                                <div class="section-badges">
                                    ${this.badges.map(r=>n`<span class="section-badge">${r}</span>`)}
                                </div>
                            `:d}
                        </header>
                    `:d}
                    <div class="overview-body">
                        <slot name="overview"></slot>
                    </div>
                </section>
                ${this.panels.map((r,i)=>{const s=this._open[i]??!0,o=i%2===1?" panel-alt":"";if(!s)return n`
                            <section class="section strip${o}" part="section panel strip"
                                     style="${this._sectionStyle(r,i)}">
                                <button class="strip-button" title="${r.title??""}"
                                        aria-expanded="false" @click="${()=>this._toggle(i)}">
                                    <span class="strip-chevron" aria-hidden="true">›</span>
                                    <span class="strip-title">${r.title??""}</span>
                                </button>
                            </section>
                        `;const l=r.open===!1;return n`
                    <section class="section${o}" part="section panel"
                             style="${this._sectionStyle(r,i)}">
                        ${r.title||r.subtitle||l?n`
                            <div class="panel-header">
                                <div>
                                ${r.title?n`<h3>${r.title}${r.subtitle?n` <span class="subtitle" style="font-weight: 400;">· ${r.subtitle}</span>`:d}</h3>`:d}
                                ${!r.title&&r.subtitle?n`<div class="subtitle">${r.subtitle}</div>`:d}
                                </div>
                                ${l?n`<button class="panel-fold" title="Fold" aria-expanded="true"
                                        @click="${()=>this._toggle(i)}">‹</button>`:d}
                            </div>
                        `:d}
                        <div class="panel-body">
                            <slot name="panel-${i}"></slot>
                        </div>
                    </section>
                `})}
            </div>
            ${this._less||this._more?n`
                <nav class="dots" part="paging-dots" aria-label="Panels">
                    ${[this.headerTitle||"Overview",...this.panels.map(r=>r.title??"")].map((r,i)=>n`
                        <button class="dot ${this._visible[i]?"on":""}" title="${r}"
                                aria-label="${r}" aria-current="${this._visible[i]?"true":"false"}"
                                @click="${()=>this._goTo(i)}"></button>
                    `)}
                </nav>
            `:d}
        `}};Se.styles=k`
        :host {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
            /* a record's detail: the panels GROW with their content (no scroll inside a fold, as
               Redwood) — the viewport fill is a minimum, not a cap */
            min-height: var(--mateu-foldout-fill, var(--mateu-foldout-min-height, 30rem));
            height: auto;
            margin: var(--mateu-foldout-outer-margin, 0);
        }
        /* The row of sections (Redwood: oj-sp-foldout-layout). Fixed-width sections; the leftover
           of the row goes BETWEEN them (space-between), never into them. */
        .rail {
            display: flex;
            flex: 1;
            min-height: var(--mateu-foldout-fill, var(--mateu-foldout-min-height, calc(100dvh - 8rem)));
            gap: var(--mateu-foldout-gap, 0);
            justify-content: space-between;
            align-items: stretch;
            overflow-x: auto;
            overflow-y: hidden;
            padding: var(--mateu-foldout-rail-padding, 0);
            outline: none;
            scrollbar-width: none;
        }
        .rail::-webkit-scrollbar {
            display: none;
        }
        .rail:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #1976d2);
            outline-offset: -2px;
        }
        .section {
            position: relative;
            /* a panel with no declared width shares the row (its basis is a readable column);
               one with a width gets it inline, fixed (foldoutSectionStyle) */
            flex: 1 1 var(--mateu-foldout-section-width, 22rem);
            min-width: min(var(--mateu-foldout-section-min-width, 16rem), 100%);
            background: var(--mateu-foldout-panel-bg, var(--lumo-base-color, #fff));
            border: none;
            border-radius: 0;
            /* Redwood's panel gutter: 24px each side */
            padding: var(--mateu-foldout-panel-padding, 1.5rem);
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: .75rem;
            /* no inner scroll, either way: the panel grows, and a long value (a link, an id)
               wraps instead of pushing the panel wider */
            overflow: visible;
            overflow-wrap: anywhere;
        }
        /* alternate the panels' backgrounds, as Redwood's foldout does, so each reads as a column */
        .section.panel-alt {
            background: var(--mateu-foldout-panel-alt-bg, var(--lumo-contrast-5pct, rgba(0, 0, 0, .03)));
        }
        /* The overview: a FIXED rail (Redwood: 25rem), pinned to the left edge for one carousel
           step via a transform (see _syncPin). While floating over the scrolled content it keeps
           an opaque background + a drop shadow. */
        .section--first {
            position: relative;
            z-index: 2;
            flex: 0 0 min(var(--mateu-foldout-overview-width, 25rem), 100%);
            width: min(var(--mateu-foldout-overview-width, 25rem), 100%);
            background: var(--mateu-foldout-overview-bg, var(--lumo-contrast-5pct, #f4f4f4));
            will-change: transform;
        }
        .section--first.floating {
            background: var(--mateu-foldout-overview-bg-floating, var(--lumo-base-color, #fff));
            box-shadow: var(--mateu-foldout-pinned-shadow, 6px 0 12px -6px rgba(0, 0, 0, .25));
        }
        /* A CLOSED panel (open=false): a narrow strip with its title written vertically; the whole
           strip opens it. */
        .section.strip {
            padding: 0;
            overflow: hidden;
        }
        .strip-button {
            all: unset;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: .75rem;
            padding: 1.5rem 0;
            cursor: pointer;
            color: var(--lumo-body-text-color, inherit);
        }
        .strip-button:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .04));
        }
        .strip-button:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #1976d2);
            outline-offset: -2px;
        }
        .strip-title {
            writing-mode: vertical-rl;
            font-weight: 600;
            font-size: var(--lumo-font-size-m, 1rem);
            white-space: nowrap;
        }
        .strip-chevron, .panel-fold {
            font-size: 1.1rem;
            line-height: 1;
            color: var(--lumo-secondary-text-color, #666);
        }
        .panel-fold {
            all: unset;
            cursor: pointer;
            padding: .15rem .35rem;
            border-radius: var(--lumo-border-radius-s, 4px);
        }
        .panel-fold:hover {
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, .08));
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
        .panel-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: .5rem;
        }
        /* Redwood's panel title: a heading with a short accent rule under it */
        .panel-header h3::after,
        .section-title::after {
            content: '';
            display: block;
            width: 2.25rem;
            height: 4px;
            margin-top: .6rem;
            border-radius: 2px;
            background: var(--mateu-foldout-accent, var(--lumo-primary-color, #1976d2));
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
        /* Paging dots (Redwood's foldout): one per section, filled while it is in view; shown
           only when the row overflows. A dot brings its section to the left. */
        .dots {
            /* sticky to the viewport's bottom while the (now growing) panels are taller than it;
               it takes no room of its own (negative margin) */
            position: sticky;
            align-self: center;
            bottom: var(--mateu-foldout-nav-bottom, 1rem);
            margin-top: -3.2rem;
            z-index: 3;
            display: inline-flex;
            gap: .5rem;
            padding: .55rem .9rem;
            border-radius: 999px;
            background: var(--mateu-foldout-dots-bg, rgba(22, 21, 19, .78));
        }
        .dot {
            all: unset;
            box-sizing: border-box;
            width: .7rem;
            height: .7rem;
            border-radius: 50%;
            border: 1.5px solid #fff;
            cursor: pointer;
        }
        .dot.on {
            background: #fff;
        }
        .dot:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #1976d2);
            outline-offset: 2px;
        }
    `;We([h({type:Array})],Se.prototype,"panels",2);We([h({type:String})],Se.prototype,"headerTitle",2);We([h({type:Array})],Se.prototype,"badges",2);We([h({attribute:!1})],Se.prototype,"navigation",2);We([h({type:String})],Se.prototype,"overviewEditActionId",2);We([fe(".rail")],Se.prototype,"_rail",2);We([fe(".section--first")],Se.prototype,"_first",2);We([b()],Se.prototype,"_less",2);We([b()],Se.prototype,"_more",2);We([b()],Se.prototype,"_open",2);We([b()],Se.prototype,"_visible",2);Se=We([_("mateu-vaadin-foldout")],Se);const lx=(e,t,a,r,i,s,o)=>{const l=t.metadata;return n`
        <mateu-vaadin-foldout
                .panels="${l.panels??[]}"
                .headerTitle="${l.headerTitle??""}"
                .badges="${l.badges??[]}"
                .navigation="${l.navigation??null}"
                overviewEditActionId="${l.overviewEditActionId??""}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(c=>x(e,c,a,r,i,s,o))}
        </mateu-vaadin-foldout>
    `};var dx=Object.defineProperty,cx=Object.getOwnPropertyDescriptor,ua=(e,t,a,r)=>{for(var i=r>1?void 0:r?cx(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(i=(r?o(t,a,i):o(i))||i);return r&&i&&dx(t,a,i),i};let xt=class extends I{constructor(){super(...arguments),this.rows=[],this.columns=[],this.navigable=!1,this.expandedItems=[],this._normalized=[],this.dataProvider=(e,t)=>{const a=e.parentItem?e.parentItem.children??[]:this.normalized;t(a,a.length)}}get normalized(){return this._src!==this.rows&&(this._src=this.rows,this._normalized=this.normalizeRows(this.rows??[])),this._normalized}normalizeRows(e){return(e??[]).map(t=>{const a=Array.isArray(t.children)&&t.children.length?this.normalizeRows(t.children):void 0;return{...t,children:a}})}collectGroups(e,t=[]){return e.forEach(a=>{a.children&&a.children.length&&(t.push(a),this.collectGroups(a.children,t))}),t}willUpdate(){this._expandedSrc!==this.rows&&(this._expandedSrc=this.rows,this.expandedItems=this.collectGroups(this.normalized))}updated(e){e.has("rows")&&this._grid?.clearCache?.()}dispatch(e,t){this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}render(){const e=this.columns??[],t=e[0],a=e.slice(1);return n`
            <vaadin-grid
                    theme="compact no-row-borders"
                    all-rows-visible
                    .dataProvider="${this.dataProvider}"
                    .itemHasChildrenPath="${"children"}"
                    .expandedItems="${this.expandedItems}"
                    @expanded-items-changed="${r=>{this.expandedItems=r.detail.value}}">
                ${t?n`
                    <vaadin-grid-tree-column path="${t.id}" header="${t.label??""}"
                                             auto-width flex-grow="0"></vaadin-grid-tree-column>
                `:d}
                ${a.map(r=>r.id==="select"?n`<vaadin-grid-column header="${r.label??""}" auto-width flex-grow="0" text-align="end"
                              ${ht(i=>n`<vaadin-button theme="tertiary small"
                                          @click="${()=>this.dispatch("action-on-row-select",{_clickedRow:i})}">Select</vaadin-button>`,[])}></vaadin-grid-column>`:n`<vaadin-grid-column path="${r.id}" header="${r.label??""}"></vaadin-grid-column>`)}
                ${this.navigable?n`
                    <vaadin-grid-column auto-width flex-grow="0" text-align="end"
                          ${ht(r=>r?.viewable===!1?n``:n`<vaadin-button theme="tertiary small"
                                          @click="${()=>this.dispatch("view",r)}">View</vaadin-button>`,[])}></vaadin-grid-column>
                `:d}
            </vaadin-grid>
        `}};xt.styles=k`
        :host {
            display: block;
            width: 100%;
        }
        vaadin-grid {
            max-height: min(60vh, 32rem);
            min-width: 22rem;
        }
    `;ua([h({attribute:!1})],xt.prototype,"rows",2);ua([h({attribute:!1})],xt.prototype,"columns",2);ua([h()],xt.prototype,"idField",2);ua([h({type:Boolean})],xt.prototype,"navigable",2);ua([h()],xt.prototype,"selectedId",2);ua([b()],xt.prototype,"expandedItems",2);ua([fe("vaadin-grid")],xt.prototype,"_grid",2);xt=ua([_("mateu-vaadin-tree")],xt);const ux={[v.VirtualList]:(e,t,a,r,i,s,o)=>Yy(e,t,a,r,i,s,o),[v.Notification]:(e,t)=>Jy(t),[v.ProgressBar]:(e,t,a,r)=>Xy(t,r),[v.Details]:(e,t,a,r,i,s,o)=>Qy(e,t,a,r,i,s,o),[v.Avatar]:(e,t,a,r,i)=>Zy(t,r,i),[v.AvatarGroup]:(e,t)=>e$(t),[v.Card]:(e,t,a,r,i,s,o)=>t$(e,t,a,r,i,s,o),[v.Button]:(e,t,a,r,i)=>tx(t,r,i),[v.MessageInput]:(e,t)=>ax(t),[v.MessageList]:(e,t)=>rx(t),[v.ConfirmDialog]:(e,t,a,r,i,s,o)=>ix(e,t,a,r,i,s,o),[v.FormLayout]:(e,t,a,r,i,s,o)=>p$(e,t,a,r,i,s,o),[v.HorizontalLayout]:(e,t,a,r,i,s,o)=>v$(e,t,a,r,i,s,o),[v.VerticalLayout]:(e,t,a,r,i,s,o)=>g$(e,t,a,r,i,s,o),[v.SplitLayout]:(e,t,a,r,i,s,o)=>b$(e,t,a,r,i,s,o),[v.MasterDetailLayout]:(e,t,a,r,i,s,o)=>y$(e,t,a,r,i,s,o),[v.TabLayout]:(e,t,a,r,i,s,o)=>$$(e,t,a,r,i,s,o),[v.AccordionLayout]:(e,t,a,r,i,s,o)=>w$(e,t,a,r,i,s,o),[v.Scroller]:(e,t,a,r,i,s,o)=>k$(e,t,a,r,i,s,o),[v.MenuBar]:(e,t,a,r,i)=>I$(e,t,a,r,i),[v.ContextMenu]:(e,t,a,r,i,s,o)=>E$(e,t,a,r,i,s,o),[v.FormField]:(e,t,a,r,i,s,o,l)=>Fw(e,t,a,r,i,s,o,l),[v.Grid]:(e,t,a,r,i,s,o)=>qw(e,t,a,r,i,s,o),[v.Table]:(e,t,a,r,i,s,o)=>Ww(e,t,a,r,i,s,o),[v.Popover]:(e,t,a,r,i,s,o)=>Yw(e,t,a,r,i,s,o),[v.FoldoutLayout]:(e,t,a,r,i,s,o)=>lx(e,t,a,r,i,s,o)};class hx extends Ky{rendererName(){return"vaadin"}renderClientSideComponent(t,a,r,i,s,o,l,c){const u=a?.metadata?.type,p=u?ux[u]:void 0;return p&&a?p(t,a,r,i,s,o,l,c):super.renderClientSideComponent(t,a,r,i,s,o,l,c)}renderTableComponent(t,a,r,i,s,o,l){return Vw(t,a,r,i,o,l)}renderTreeComponent(t,a){return n`
            <mateu-vaadin-tree
                    .rows="${a.rows}"
                    .columns="${a.columns}"
                    .idField="${a.idField}"
                    .navigable="${a.navigable}"
                    .selectedId="${a.selectedId}"
            ></mateu-vaadin-tree>`}renderToolbarButton(t,a,r){return Jw(t,a,r)}renderPeerNav(t){return Xw(t)}renderIcon(t,a,r){return Zw(t,a,r)}renderTopNav(t,a,r){return C$(t,a,r)}renderHeaderIconButton(t){return ex(t)}}function cc(e){switch(e){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"}function px(e,t){if(e.onAction)return{label:e.actionLabel??"Retry",run:e.onAction};if(e.undoActionId)return{label:e.undoLabel??"Undo",run:()=>t.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0}))}}function mx(e,t){const a=new ai;a.position=cc(e.position),a.duration=e.duration??1e4,e.variant&&a.setAttribute("theme",e.variant),a.renderer=r=>{if(r.firstElementChild)return;const i=document.createElement("span");i.textContent=e.text;const s=px(e,t),o=document.createElement("button");o.textContent=s.label,o.style.cssText="margin-left: 0.75rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;",o.addEventListener("click",()=>{s.run(),a.opened=!1}),r.append(i,o)},document.body.appendChild(a),a.opened=!0,a.addEventListener("opened-changed",r=>{r.detail.value||a.remove()})}const fx={show(e,t){if(Vs(e.text,{politeness:e.variant==="error"?"assertive":"polite"}),e.undoActionId||e.onAction){mx(e,t);return}ai.show(e.text,{position:e.position?cc(e.position):"bottom-end",theme:e.variant,duration:e.duration})}};J.set(new hx);Ed(fx);
