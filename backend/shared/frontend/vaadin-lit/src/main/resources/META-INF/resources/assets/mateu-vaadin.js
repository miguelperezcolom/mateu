const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-diagrams.js","assets/vendor.js","assets/vendor-ui5.js","assets/vendor-vaadin.js","assets/vendor-lit.js"])))=>i.map(i=>d[i]);
import{r as _l,f as Cl,m as Sl,o as El,a as Il,l as _o,u as Tl,_ as ke,v as Pl,n as Ol,c as tt,b as zl,d as Rl,e as Co,g as So,N as Ti,h as fr,p as Eo,i as Al}from"./vendor-vaadin.js";import{a as x,j as h,k as me,i as _,b as n,m as k,A as d,p as g,q as ce,c as R,d as Ll,h as Dl,t as Fl,r as Qr,w as ue,D as Io,s as Ml}from"./vendor-lit.js";import{S as Nl,a as ql,n as Te,b as Bl}from"./vendor.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function a(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=a(r);fetch(r.href,s)}})();_l("vaadin-card",x`
      :host(.mateu-section) {
        --vaadin-card-border-width: 0 !important;
        --vaadin-card-background: transparent !important;
        --vaadin-card-shadow: none !important;
        --vaadin-card-padding: 0 !important;
      }
    `);const To=document.createElement("style");To.innerHTML=`
${Cl.cssText}
${Sl.cssText}
${El.cssText}
${Il.cssText}
${_o}
${Tl}
`;document.body.appendChild(To);function jl(e,t){const a=t.split(",").map(o=>o.trim()),i=o=>a.map(l=>l+o).join(","),r=[`${i("")}{color-scheme:light dark}`],s=(o,l)=>{const c=new RegExp(o.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\s*\\{([^}]*)\\}","g");let u;for(;(u=c.exec(e))!==null;){const p=u[1].trim();p&&r.push(`${i(l)}{${p}}`)}};return s(":where(:host),:where(:root)",""),s(":host,:root",""),s(":host([theme~=dark]),[theme~=dark]","[theme~=dark]"),s(":host([theme~=light-dark]),[theme~=light-dark]","[theme~=light-dark]"),r.join(`
`)}const Zr=document.createElement("style");Zr.setAttribute("data-mateu-theme-scope","");Zr.textContent=jl(_o,"mateu-ui,mateu-ux");document.head.appendChild(Zr);{const e=window.Vaadin;e&&((e.featureFlags??={}).masterDetailLayoutComponent=!0)}const wa=new Nl,oe={value:{}},Zt={value:{}};function Ul(e){let t="";for(const a of e)switch(a){case'"':t+='\\"';break;case"\\":t+="\\\\";break;case`
`:t+="\\n";break;case"\r":t+="\\r";break;case"	":t+="\\t";break;case"\b":t+="\\b";break;case"\f":t+="\\f";break;default:t+=a<" "?"\\u"+a.charCodeAt(0).toString(16).padStart(4,"0"):a}return t}function Pi(e){if(typeof e=="string")return Ul(e);if(Array.isArray(e))return e.map(Pi);if(e&&typeof e=="object"){const t={};for(const[a,i]of Object.entries(e))t[a]=Pi(i);return t}return e}function Wl(e){return e?Object.entries(e).some(([t,a])=>t.toLowerCase()==="content-type"&&(a??"").toLowerCase().includes("json")):!1}let Po=[];const Oo=e=>{Po=Array.isArray(e)?e:[]},es=e=>e?Po.find(t=>t.name===e):void 0,ba=e=>e==null||e==="",Oa=e=>{if(!e?.ref)return e;const t=es(e.ref);if(!t?.source)return console.warn(`mateu: no REST source named "${e.ref}" in the app's catalogue`),e;const a=t.source;return{...e,url:ba(e.url)?a.url:e.url,method:ba(e.method)?a.method:e.method,headers:e.headers&&Object.keys(e.headers).length>0?e.headers:a.headers,body:ba(e.body)?a.body:e.body,itemsPath:ba(e.itemsPath)?a.itemsPath:e.itemsPath,valuePath:ba(e.valuePath)?a.valuePath:e.valuePath,labelPath:ba(e.labelPath)?a.labelPath:e.labelPath,proxy:e.proxy||a.proxy}},zo=(e,t)=>{const i=es(e?.ref)?.fields?.[t];return i&&i!==""?i:t},Ro=e=>es(e?.ref)?.totalPath||void 0,Lt=x`
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
`,da=x`
    :where(a:any-link) {
        color: var(--mateu-link-color, var(--lumo-primary-text-color, #1676f3));
    }
`,Hl={lon:0,lat:0},Os=3,Vl=e=>{if(!e)return;const t=e.split(",").map(r=>r.trim());if(t.length!==2)return;const a=Number(t[0]),i=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(a)||!Number.isFinite(i)))return{lon:i,lat:a}},Gl=e=>{if(e==null||e.trim()==="")return Os;const t=Number(e);return Number.isFinite(t)?t:Os};var Kl=Object.defineProperty,Yl=Object.getOwnPropertyDescriptor,tr=(e,t,a,i)=>{for(var r=i>1?void 0:i?Yl(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Kl(t,a,r),r};let xa=class extends _{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:a},{default:i},{default:r},{fromLonLat:s},{default:o}]=await Promise.all([ke(()=>import("./vendor-ol.js").then(c=>c.M),[]),ke(()=>import("./vendor-ol.js").then(c=>c.V),[]),ke(()=>import("./vendor-ol.js").then(c=>c.T),[]),ke(()=>import("./vendor-ol.js").then(c=>c.O),[]),ke(()=>import("./vendor-ol.js").then(c=>c.p),[]),ke(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=o,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const l=Vl(this.position)??Hl;this.map=new t({target:this.mapElement,layers:[new i({source:new r})],view:new a({center:s([l.lon,l.lat]),zoom:Gl(this.zoom)})})}render(){return n`<div id="map"></div>`}};xa.styles=x`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;tr([h()],xa.prototype,"position",2);tr([h()],xa.prototype,"zoom",2);tr([me("#map")],xa.prototype,"mapElement",2);xa=tr([k("mateu-map")],xa);const Xl=typeof HTMLElement<"u"?HTMLElement:class{};class Jl extends Xl{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#a()}attributeChangedCallback(t,a,i){this.content=i??void 0}connectedCallback(){this.style.display="block",this.#a()}async#a(){if(!this.isConnected)return;const t=this.#e??"",a=++this.#t,[{marked:i},{default:r}]=await Promise.all([ke(()=>import("./vendor.js").then(s=>s.m),[]),ke(()=>import("./vendor.js").then(s=>s.c),[])]);a===this.#t&&(this.innerHTML=r.sanitize(await i.parse(t),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:s=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",Jl);var J=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(J||{}),v=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Drawer="Drawer",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.ResponsiveGrid="ResponsiveGrid",e.FoldoutLayout="FoldoutLayout",e.ContentLayout="ContentLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e.PlanningBoard="PlanningBoard",e.Kanban="Kanban",e.Timeline="Timeline",e.ProgressSteps="ProgressSteps",e.Stat="Stat",e.Calendar="Calendar",e.PricingTable="PricingTable",e.OrgChart="OrgChart",e.Heatmap="Heatmap",e.Funnel="Funnel",e.TrendChart="TrendChart",e.FeatureGrid="FeatureGrid",e.Testimonials="Testimonials",e.Faq="Faq",e.CalloutCard="CalloutCard",e.CommentThread="CommentThread",e.FileList="FileList",e.Checklist="Checklist",e.ComparisonCard="ComparisonCard",e.EntityHeader="EntityHeader",e.Meter="Meter",e.TaskProgress="TaskProgress",e.StatusList="StatusList",e.BulletedList="BulletedList",e.Separator="Separator",e.CustomComponent="CustomComponent",e.Notice="Notice",e.TaskQueue="TaskQueue",e.ResourceGrid="ResourceGrid",e.OfferCard="OfferCard",e.AddOnPicker="AddOnPicker",e.Ledger="Ledger",e.PaymentPicker="PaymentPicker",e.ProcessMonitor="ProcessMonitor",e))(v||{});const ts="mateu-app-context",Ao="mateu-app-context-labels",Lo=e=>{try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}},zs=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},as=()=>Lo(ts),Do=()=>Lo(Ao),Ql=(e,t,a)=>{const i=as(),r=Do();t==null||t===""?(delete i[e],delete r[e]):(i[e]=t,a!==void 0&&(r[e]=a)),zs(ts,i),zs(Ao,r)};let Rs=!1;const Zl=()=>{Rs||(Rs=!0,window.addEventListener("storage",e=>{e.key===ts&&e.newValue!==e.oldValue&&window.location.reload()}))},Fo=(e,t)=>new Promise((a,i)=>{let r=!1;const s={retry:()=>{r||(r=!0,t().then(a,i))},giveUp:()=>{r||(r=!0,i(e))}},o=new CustomEvent("mateu-session-expired",{detail:s,cancelable:!0,bubbles:!1});typeof document<"u"&&!document.dispatchEvent(o)||s.giveUp()}),ed=(e,t)=>e.includes("json")?!0:t!==null&&typeof t=="object",td=(e,t)=>{const a=e.finalUrl;if(!a)return;const i=typeof window<"u"?window.location.href:void 0;let r;try{r=new URL(e.requestedUrl,i).href}catch{return}if(r!==a&&!ed(e.contentType??"",e.data))return a};class ad{constructor(){this.windowMs=4e3,this.threshold=12,this.events=[],this.reported=new Set}check(t,a=Date.now()){this.events.push({sig:t,t:a});const i=a-this.windowMs;this.events=this.events.filter(s=>s.t>=i);let r=0;for(const s of this.events)s.sig===t&&r++;if(r>=this.threshold){const s=!this.reported.has(t);return this.reported.add(t),{blocked:!0,firstTrip:s}}return this.reported.delete(t),{blocked:!1,firstTrip:!1}}reset(){this.events=[],this.reported.clear()}configure(t){t.windowMs!==void 0&&(this.windowMs=t.windowMs),t.threshold!==void 0&&(this.threshold=t.threshold)}}const id=new ad;var Xt=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(Xt||{});let Mo=[];const rd=e=>{Mo=Array.isArray(e)?e:[]},sd=e=>e?Mo.find(t=>t.name===e)?.component:void 0,No=new Set(["id","style","cssClasses","slot","initialData","confirmOnNavigationIfDirty","sizing"]),od=new Set(["VerticalLayout","HorizontalLayout","Div","FlexLayout","CustomComponent"]),nd=new Set(["Card"]),ld=new Set(["Listing","Crudl","Crud"]);function Oi(e){if(ld.has(e.type))return dd(e);if(e.type==="ComponentRef"){const c=sd(e.ref);return c||{type:J.ClientSide,metadata:{type:"Text",text:`Unknown business component: ${e.ref}`},children:[]}}const{type:t,content:a,children:i,...r}=e,s={},o={type:t};for(const[c,u]of Object.entries(r))No.has(c)?s[c]=u:o[c]=u;let l=[];if(od.has(t)){const c=a??i??[];l=Array.isArray(c)?c:[c]}else nd.has(t)&&a&&typeof a=="object"&&!Array.isArray(a)&&(o.content=Oi(a));return{...s,type:J.ClientSide,metadata:o,children:l.map(Oi)}}function dd(e){const{type:t,content:a,children:i,...r}=e,s={id:"crud",sizing:"fill"},o={type:"Crud",crudlType:r.crudlType??r.listingType??"table"};for(const[l,c]of Object.entries(r))l==="crudlType"||l==="listingType"||(No.has(l)?s[l]=c:l==="columns"&&Array.isArray(c)?o[l]=c.map(cd):o[l]=c);return{...s,type:J.ClientSide,metadata:o,children:[]}}function cd(e){const t=Oi(e);return e.id!==void 0&&t.metadata&&(t.metadata.id=e.id),t}const As="ux_main";function ud(e){return!!!(e.viewModel??e.modelView)&&!!qo(e)}function qo(e){if(e.layout&&typeof e.layout=="object")return e.layout;if(typeof e.type=="string")return e}function hd(e,t,a){const i=qo(e);if(!i)throw new Error(`Definition for route "${t}" has no layout to expand`);return{commands:[{targetComponentId:As,type:"SetWindowTitle",data:a??t}],messages:[],fragments:[{targetComponentId:As,component:Oi(i),data:void 0,state:void 0,action:Xt.Replace,containerId:void 0}],banners:[],appendBanners:!1,appData:void 0,appState:void 0}}let zi,is=[],Rr,Bo=[],rs={};const Ls=e=>e.split("/").filter(t=>t.startsWith(":")&&t.length>1).map(t=>t.substring(1)),jo=e=>{const t=s=>s.replace(/^\/+/,"").replace(/\/+$/,""),a=t(e==="_no_route"?"":e),i=a===""?[]:a.split("/");let r;for(const s of Bo){const o=t(s.route??""),l=o===""?[]:o.split("/");if(l.length!==i.length)continue;const c={};let u=!0;for(let f=0;f<l.length;f++){const m=l[f];if(m.startsWith(":")&&m.length>1)c[m.substring(1)]=i[f];else if(m!==i[f]){u=!1;break}}if(!u)continue;const p={entry:s,pathParams:c};(!r||Ls(o).length<Ls(t(r.entry.route??"")).length)&&(r=p)}return r},ss=(e,t)=>{const a=jo(e);if(!a)return t;const{entry:i,pathParams:r}=a,s=i.defaultParams??{},o=i.fixedParams??{};return!Object.keys(s).length&&!Object.keys(o).length&&!Object.keys(r).length?t:{...t,fragments:(t.fragments??[]).map(l=>({...l,state:{...s,...l.state??{},...r,...o},data:{...s,...l.data??{},...r,...o}}))}},vr=e=>{const t=e&&e.startsWith("/")?e.substring(1):e??"";return t===""?"_no_route":t};function pd(e,t=fetch){return Rr=(async()=>{try{const a=await t(e);if(!a.ok)return;const i=await a.json(),r=new Map,s=[];for(const o of i.entries??[])if(!(!o.ok||!o.json))try{const l=JSON.parse(o.json);o.routePattern?s.push({regex:new RegExp(o.routePattern),paramNames:o.paramNames??[],increment:l}):r.set(o.syncPath,l)}catch(l){console.warn("mateu: bundle entry parse failed for",o.syncPath,l)}zi=r,is=s,Bo=i.routes?.routes??[],rs=i.definitions??{},Oo(i.sources?.sources)}catch(a){console.warn("mateu: bundle manifest load failed",a)}})(),Rr}const md=()=>Rr??Promise.resolve(),fd=()=>zi!==void 0&&zi.size>0||is.length>0||Object.keys(rs).length>0,vd=e=>{const t=zi?.get(e);return t===void 0?void 0:ss(e,t)},bd=e=>{for(const t of is){const a=t.regex.exec(e);if(!a)continue;const i={};t.paramNames.forEach((s,o)=>{i[s]=a[o+1]});const r={...t.increment,fragments:(t.increment.fragments??[]).map(s=>({...s,state:{...s.state??{},...i},data:{...s.data??{},...i}}))};return ss(e,r)}},gd=e=>{const t=jo(e),a=t?.entry.definition;if(!a)return;const i=rs[a];if(!(!i||!ud(i)))return ss(e,hd(i,t.entry.route))},yd={offline:()=>"No connection. Your changes have not been sent — check your network and try again.",timeout:()=>"The server is taking too long to answer. Your changes may not have been saved.",server:e=>`The server could not complete the request${e?` (error ${e})`:""}. Please try again.`,unauthorized:()=>"Your session is no longer valid. Please sign in again.",notFound:()=>"This is no longer available. It may have been moved or deleted.",client:e=>`The request was rejected${e?` (error ${e})`:""}.`,cancelled:()=>"",unknown:()=>"Something went wrong. Please try again."},$d=new Set(["offline","timeout","server"]),Ar=(e,t={})=>{const a=e??{},i=a.response?.status,r=a.code,s=t.online??(typeof navigator<"u"&&typeof navigator.onLine=="boolean"?navigator.onLine:!0),o=l=>({kind:l,message:yd[l](i),retryable:$d.has(l),status:i});return r==="ERR_CANCELED"?o("cancelled"):r==="ECONNABORTED"||r==="ETIMEDOUT"||/timeout/i.test(a.message??"")?o("timeout"):i===void 0?!s||r==="ERR_NETWORK"||/network error/i.test(a.message??"")?o("offline"):o("unknown"):i===401||i===403?o("unauthorized"):i===404||i===410?o("notFound"):i===408||i===429?o("timeout"):i>=500?o("server"):i>=400?o("client"):o("unknown")},wd=new Set(["","__load__","search","_globalsearch","_notifications-list"]),xd=["_appcontext-search-","search-"],Uo=(e,t)=>t===!0?!0:e==null?!1:wd.has(e)?!0:xd.some(a=>e.startsWith(a)),kd=2,_d=(e,t=Math.random)=>{const a=300*Math.pow(3,Math.max(0,e-1));return Math.round(a*(.75+t()*.5))},Cd=(e,t,a)=>!a.idempotent||t>kd||!e.retryable?!1:e.kind==="timeout"||e.kind==="server";class Sd{constructor(){this.linkUp=!0,this.listeners=new Set,this.waiters=new Set,this.started=!1}start(){this.started||typeof window>"u"||(this.started=!0,this.linkUp=typeof navigator<"u"&&typeof navigator.onLine=="boolean"?navigator.onLine:!0,window.addEventListener("online",()=>{this.linkUp=!0,this.reachable=void 0,this.changed(),this.releaseWaiters()}),window.addEventListener("offline",()=>{this.linkUp=!1,this.changed()}))}isOnline(){return this.linkUp?this.reachable!==!1:!1}noteReachable(){const t=this.isOnline();this.reachable=!0,t||(this.changed(),this.releaseWaiters())}noteUnreachable(){const t=this.isOnline();this.reachable=!1,t&&this.changed()}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}whenBack(t){return this.isOnline()?(t(),()=>{}):(this.waiters.add(t),()=>this.waiters.delete(t))}reset(){this.linkUp=!0,this.reachable=void 0,this.waiters.clear()}changed(){const t=this.isOnline();this.listeners.forEach(a=>a(t))}releaseWaiters(){const t=Array.from(this.waiters);this.waiters.clear(),t.forEach(a=>a())}}const Ct=new Sd;Ct.start();let xt=[];const Ed=6e4,Id=e=>new Promise(t=>setTimeout(t,e));class Td{constructor(){this.axiosInstance=ql.create({timeout:Ed}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t)),this.axiosInstance.interceptors.response.use(t=>{const a=td({requestedUrl:this.axiosInstance.getUri(t.config),finalUrl:t.request?.responseURL,contentType:String(t.headers?.["content-type"]??""),data:t.data});if(a)throw window.location.assign(a),Object.assign(new Error("session lost — redirecting to "+a),{code:"ERR_CANCELED"});return t},t=>{const a=t;if(a?.response?.status===401&&a.config&&!a.config.__mateuRetried){const i=a.config;return i.__mateuRetried=!0,Fo(t,()=>this.axiosInstance.request(i))}throw t})}addSessionId(t){let a=sessionStorage.getItem("__mateu_sesion_id");a||(a=Te(),sessionStorage.setItem("__mateu_sesion_id",a)),t.headers["X-Session-Id"]=a}addAuthToken(t){const a=localStorage.getItem("__mateu_auth_token");a&&(t.headers.Authorization="Bearer "+a)}async wrap(t,a,i,r,s){return i||a.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t().then(o=>(a.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:r}})),o)).catch(o=>{const l=Ar(o,{online:Ct.isOnline()});throw l.kind=="cancelled"?a.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{actionId:r}})):(o&&typeof o=="object"&&(o.__mateuReported=!0),a.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(o),failure:l,retry:s}}))),o})}async sendWithRetry(t,a){let i=0;for(;;)try{const r=await t();return Ct.noteReachable(),r}catch(r){const s=Ar(r,{online:Ct.isOnline()});if(s.kind=="offline"&&Ct.noteUnreachable(),i++,!Cd(s,i,{idempotent:a}))throw r;await Id(_d(i))}}serialize(t){return t?.message?t:JSON.stringify(t)}release(t){xt=xt.filter(a=>a!==t)}async get(t){const a=new AbortController;return xt=[...xt,a],this.axiosInstance.get(t,{signal:a.signal}).finally(()=>this.release(a))}async post(t,a,i){const r=new AbortController;return xt=[...xt,r],this.axiosInstance.post(t,a,{signal:r.signal,...i&&i>0?{timeout:i}:{}}).finally(()=>this.release(r))}async abortAll(){xt.forEach(t=>t.abort()),xt=[]}async runAction(t,a,i,r,s,o,l,c,u,p,f,m={}){if(a&&a.startsWith("/")&&(a=a.substring(1)),r===""&&(await md(),fd())){const I=vd(vr(a))??bd(vr(a))??gd(vr(a));if(I){const T={...I,fragments:(I.fragments??[]).map(O=>O.targetComponentId?O:{...O,targetComponentId:s})};return await this.wrap(()=>Promise.resolve(T),p,f,r,m.retry)}}const b=[t,a,i,l??"",r,s].join(""),$=id.check(b);if($.blocked)return await this.abortAll(),$.firstTrip&&console.error("[mateu] request loop detected — aborting repeated request",b),{messages:$.firstTrip?[{title:"",text:"A repeating request was detected and stopped to protect the server. Reload the page or navigate elsewhere.",position:"bottom-end",variant:"error",duration:6e3}]:[],commands:[],fragments:[],banners:[],appendBanners:!1,appData:void 0,appState:void 0};o={...as(),...o};const y=t+"/mateu/v3/sync/"+(a&&a!=""?a:"_no_route"),E={serverSideType:l,appState:o,componentState:c,parameters:u,initiatorComponentId:s,consumedRoute:i,route:a&&a!=""?"/"+a:"",actionId:r,knownStructureHash:m.knownStructureHash},z=Uo(r,m.idempotent),S=()=>this.post(y,E,m.timeoutMillis).then(I=>I.data);return await this.wrap(()=>this.sendWithRetry(S,z),p,f,r,m.retry)}}const ca=new Td;var Ne=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(Ne||{});const Ds=new Map,Pd=["position:absolute","width:1px","height:1px","margin:-1px","padding:0","overflow:hidden","clip:rect(0 0 0 0)","clip-path:inset(50%)","white-space:nowrap","border:0"].join(";"),Lr=e=>{if(typeof document>"u"||!document.body)return;let t=Ds.get(e);return t?.isConnected||(t=document.createElement("div"),t.setAttribute("aria-live",e),t.setAttribute("aria-atomic","true"),t.setAttribute("role",e==="assertive"?"alert":"status"),t.setAttribute("data-mateu-live-region",e),t.style.cssText=Pd,document.body.appendChild(t),Ds.set(e,t)),t},Wo=()=>{if(!(typeof document>"u")){if(!document.body){document.addEventListener("DOMContentLoaded",()=>Wo(),{once:!0});return}Lr("polite"),Lr("assertive")}},os=(e,t={})=>{const a=(e??"").trim();if(!a)return;const i=Lr(t.politeness??"polite");if(i){if(i.textContent===a){i.textContent="",setTimeout(()=>{i.textContent=a},60);return}i.textContent=a}};function Od(e,t){return!t.callbackToken||!e.callbackToken||t.callbackToken===e.callbackToken?!0:t.initiator!=null&&t.initiator!==e}var zd=Object.defineProperty,Ho=(e,t,a,i)=>{for(var r=void 0,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=o(t,a,r)||r);return r&&zd(t,a,r),r};class ar extends _{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const a=t.data,i=document.createElement(a.name);for(let r in a.attributes)i.setAttribute(r,a.attributes[r]);for(let r in a.on)i.addEventListener(r,s=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.on[r],parameters:{event:s}},bubbles:!0,composed:!0}))});return i},this.closeModal=()=>{const t=(this.shadowRoot??this).querySelectorAll("mateu-dialog, mateu-drawer");if(t&&t.length>0){t[t.length-1].close();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let a=document.querySelector('link[rel="icon"]');a!==null?a.setAttribute("href",t):(a=document.createElement("link"),a.setAttribute("rel","icon"),a.setAttribute("href",t),document.head.appendChild(a))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=wa.subscribe(t=>{if(t.command){const a=t.command;this.id==a.targetComponentId&&this.applyCommand(a)}if(Od(this,t)&&t.fragment){const a=t.fragment;this.id==a.targetComponentId&&(this.applyFragment(a),this.completeMenu(a))}})}completeMenu(t){if(t.component&&t.component.type==J.ClientSide){const a=t.component,i=a.metadata;if(i?.type==v.App){let r=i;const s=this.withoutHidden(r.menu??[]);s!==r.menu&&(r={...r,menu:s},a.metadata=r);const o=this.getRemoteMenus(r.menu);if(o.length>0){const l=o.map(c=>ca.runAction(c.baseUrl,c.route,"_empty","",c.baseUrl+"#"+c.route,void 0,void 0,void 0,c.params,this,!0));Promise.all(l).then(c=>{const u=this.updateMenu(r.menu,c.map(p=>p.fragments).filter(p=>p).map(p=>p).flat());a.metadata={...r,menu:u,variant:Ne.MENU_ON_TOP},this.requestUpdate()})}}}}updateMenu(t,a){const i=[];return t.forEach(r=>{if(r.remote){const s=a.find(o=>o.targetComponentId==r.baseUrl+"#"+r.route);if(s&&s.component?.type==J.ClientSide){const o=s.component;if(o.metadata?.type==v.App){const l=o.metadata,c=r.serverSideType&&r.serverSideType!=""?r.serverSideType:l.serverSideType;this.changeBaseUrl(l.menu,r.baseUrl,c,r.route,l.route),i.push(...l.menu)}}}else r.submenus&&r.submenus.length>0?i.push({...r,submenus:this.updateMenu(r.submenus,a)}):i.push(r)}),i}changeBaseUrl(t,a,i,r,s){t.forEach(o=>{o.baseUrl||(o.submenus&&o.submenus.length>0?this.changeBaseUrl(o.submenus,a,i,r,s):(o.consumedRoute=s??"",o.baseUrl=a,o.serverSideType=i,o.uriPrefix=r))})}withoutHidden(t){let a=!1;const i=[];return t.forEach(r=>{if(r.visible===!1){a=!0;return}if(r.submenus&&r.submenus.length>0){const s=this.withoutHidden(r.submenus);if(s!==r.submenus){a=!0,i.push({...r,submenus:s});return}}i.push(r)}),a?i:t}getRemoteMenus(t){const a=[];return t.forEach(i=>{i.remote?a.push(i):i.submenus&&i.submenus.length>0&&a.push(...this.getRemoteMenus(i.submenus))}),a}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data,os(document.title)),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"&&this.dispatchNamedEvent(t.data),t.type=="NavigateTo"){const a=t.data;a&&(a.startsWith("http:")||a.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const a=t.data;a!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:a},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const a=t.data;if(a&&a.actionId)if(a.targetComponentId){const i={command:{type:"RunAction",data:{actionId:a.actionId},targetComponentId:a.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>wa.next(i))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const a=t.data;if(a&&a.base64Content){const i=atob(a.base64Content),r=new Uint8Array(i.length);for(let c=0;c<i.length;c++)r[c]=i.charCodeAt(c);const s=new Blob([r],{type:a.mimeType}),o=URL.createObjectURL(s),l=document.createElement("a");l.href=o,l.download=a.filename??"export",l.click(),URL.revokeObjectURL(o)}}if(t.type=="CloseModal"&&(this.closeModal(),this.dispatchNamedEvent(t.data)),t.type=="AddContentToHead"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const a=t.data;if(a&&a.name){if(a.attributes&&a.attributes.id&&document.getElementById(a.attributes.id))return;document.body.appendChild(this.createElement(t))}}}dispatchNamedEvent(t){if(t&&t.eventName){const a=this.component,i=a?.emitsName??a?.serverSideType;let r=t.payload??t.detail;i&&r&&typeof r=="object"&&(r={...r,__source:i}),this.dispatchEvent(new CustomEvent(t.eventName,{detail:r,bubbles:!0,composed:!0}))}}}Ho([h()],ar.prototype,"id");Ho([h()],ar.prototype,"baseUrl");var Rd=Object.defineProperty,Ad=(e,t,a,i)=>{for(var r=void 0,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=o(t,a,r)||r);return r&&Rd(t,a,r),r};class ir extends ar{applyFragment(t){}manageActionRequestedEvent(t){}}Ad([h()],ir.prototype,"component");const Ld=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),Dd=(e,...t)=>e.reduce((a,i,r)=>a+i+(r<t.length?t[r]??"":""),""),Va=(e,t)=>new Function("__mateuBlankNullish",...Object.keys(t),"return __mateuBlankNullish`"+e+"`")(Dd,...Object.values(t)),za=(e,t,a)=>({state:e??{},data:t??{},...a});function U(e,t,a,i){if(!e?.includes("${"))return e;try{return Va(e,za(t,a,i))}catch(r){return console.warn(`Mateu: could not interpolate "${e}":`,r),e}}const Fe=(e,t,a)=>{if(e&&e.indexOf("${")>=0)try{return Va(e,za(t,a))}catch(i){return i.message}return e},Ga=(e,t,a,i,r)=>{if(!e)return e;const s=za(t,a,{appState:i??{},appData:r??{}});let o=e;try{if(o=Va(e,s),o.includes("${"))try{o=Va(o,s)}catch(l){o="when evaluating nested "+e+" :"+l+", where data is "+a+" and state is "+t+" and app state is "+i+" and app data is "+r,console.error(l,o,t,a,i,r)}}catch(l){o="when evaluating "+e+" :"+l+", where data is "+a+" and state is "+t+" and app state is "+i+" and app data is "+r,console.error(l,o,t,a,i,r)}return o},ns=(e,t,a,i,r,s)=>{const o=za(t,a,{appState:i??{},appData:r??{},...s}),l=Ld(e,o);return new Function(...Object.keys(o),`return (${l})`)(...Object.values(o))},Vo=(e,t,a,i)=>{const r=za(t,a,i);return new Function(...Object.keys(r),`return (${e})`)(...Object.values(r))},Fd=(e,t,a,i)=>Va(e,za(t,a,i)),Dr="display:inline-flex; align-items:center; justify-content:center; width:2rem; height:2rem; border-radius:50%; background:var(--lumo-contrast-10pct,#e0e0e0); color:var(--lumo-secondary-text-color,#555); font-size:.8rem; font-weight:600; overflow:hidden; flex:none;",Go=(e,t)=>t||(typeof e=="string"&&e?e.trim().split(/\s+/).map(a=>a[0]).slice(0,2).join("").toUpperCase():""),Md=(e,t,a)=>{const i=e.metadata,r=Ie(i.name,t,a);return n`<span style="${Dr}${e.style}" class="${e.cssClasses}"
                      title="${r||d}" slot="${e.slot??d}">
        ${i.image?n`<img src="${i.image}" alt="${r}" style="width:100%;height:100%;object-fit:cover;">`:Go(r,i.abbreviation)}
    </span>`},Ie=(e,t,a)=>typeof e=="string"&&e.includes("${")?U(e,t,a):e,Nd=e=>{const t=e.metadata,a=t.avatars??[],i=t.maxItemsVisible&&t.maxItemsVisible>0?t.maxItemsVisible:a.length,r=a.slice(0,i),s=a.length-r.length,o="margin-left:-0.4rem; border:2px solid var(--lumo-base-color,#fff);";return n`<span style="display:inline-flex; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
        ${r.map(l=>n`<span style="${Dr}${o}" title="${l.name||d}">
            ${l.img?n`<img src="${l.img}" style="width:100%;height:100%;object-fit:cover;">`:Go(l.name??"",l.abbr)}
        </span>`)}
        ${s>0?n`<span style="${Dr}${o}">+${s}</span>`:d}
    </span>`},qd=(e,t,a)=>{const i=e.metadata;return n`<span theme="badge ${i.color} ${i.pill?"pill":""} ${i.small?"small":""} ${i.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??d}">${Ie(i.text,t,a)}</span>`},Fs=(e,t,a,i)=>{const r=Ie(e.text,t,a);if(!r)return d;let s=Ie(e.color,t,a);s=="SUCCESS"&&(s="success"),s=="ERROR"&&(s="error"),s=="DANGER"&&(s="error"),s=="WARNING"&&(s="warning"),s=="INFO"&&(s="info"),s=="PRIMARY"&&(s="primary"),s=="SECONDARY"&&(s="secondary"),s=="TERTIARY"&&(s="tertiary"),s=="QUATERNARY"&&(s="quaternary"),s=="LIGHT"&&(s="light"),s=="DARK"&&(s="dark");const o=e.pill||i?.pill;return n`<span theme="badge ${s} ${o?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${r}</span>`};class Bd{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const a=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:a?[...a].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const H=new Bd,Vt=(e,t,a,i,r,s,o,l,c)=>(t.slot=l,w(e,t,a,i,r,s,o,c)),w=(e,t,a,i,r,s,o,l)=>{if(!t)return n``;if(t.type==J.ClientSide)return H.get().renderClientSideComponent(e,t,a,i,r,s,o,l);const c=e.route,u=e.consumedRoute;return n`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${u}"
                         baseUrl="${a}"
                         slot="${t.slot??d}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...i}}"
                         .data="${{...r}}"
                         .appState="${s}"
                         .appData="${o}"
        >
       </mateu-component>`},ka=e=>e==="back"||e==="backToList"||e==="cancel-view",jd=e=>!!e&&e.startsWith("cancel")&&!ka(e),Ri=e=>ka(e)||jd(e);function Ko(e,t,a,i){if(!e||t==null)return;const r=U(e,a,i,{row:t});if(!(!r||r===e||r.includes("${")))return r}function Et(e,t){for(const a of["route-changed","navigate-to-requested"])e.dispatchEvent(new CustomEvent(a,{detail:{route:t},bubbles:!0,composed:!0}))}function Ud(e){if(!e)return[];const t=new Set;for(const a of e.matchAll(/\$\{\s*row\.([A-Za-z0-9_]+)/g))t.add(a[1]);return[...t]}const _a=e=>{let t=(e??"").trim();const a=t.search(/[?#]/);for(a>=0&&(t=t.slice(0,a)),t&&!t.startsWith("/")&&(t="/"+t);t.length>1&&t.endsWith("/");)t=t.slice(0,-1);return t},Yo=e=>{let t=e??"",a;do a=t,t=t.replace(/<[^<>]*>/g,"");while(t!==a);return t.replace(/[<>]/g,"").replace(/\s+/g," ").trim()},Wd=e=>(e||typeof document<"u"&&document.documentElement?.lang||typeof navigator<"u"&&navigator.language||"").toLowerCase().startsWith("es");function Hd(e,t){const a=_a(t);let i;const r=Vd(e),s=(o,l)=>{for(const c of o??[]){if(!c||c.separator||c.visible===!1)continue;const u=_a(c.route),p=Yo(c.label),f=c.submenus??[];if(f.length>0){s(f,[...l,u&&u!=="/"&&r.has(u)?{text:p,route:u}:{text:p}]);continue}!u||u==="/"||(a===u||a.startsWith(u+"/"))&&(!i||u.length>i.route.length)&&(i={crumbs:[...l,{text:p,route:u}],route:u})}};return s(e,[]),i?{crumbs:i.crumbs,matched:i.route}:{crumbs:[]}}function Vd(e){const t=new Set,a=i=>{for(const r of i??[]){if(!r||r.separator)continue;const s=r.submenus??[];if(s.length>0){a(s);continue}const o=_a(r.route);o&&o!=="/"&&t.add(o)}};return a(e),t}const Ms=new Map;function Gd(e,t,a={}){const{crumbs:i,matched:r}=Hd(e,t);if(!r)return[];const s=[...i],o=_a(t).slice(r.length).split("/").filter(Boolean),l=Wd(a.lang);if(o.length>0){const u=decodeURIComponent(o[0]);if(u==="new"||u==="create")s.push({text:l?"Nuevo":"New"});else{const p=r+"/"+o[0],f=Yo(a.title);o.length===1&&f&&Ms.set(p,f),s.push({text:Ms.get(p)||u,route:p}),o[1]==="edit"?s.push({text:l?"Editar":"Edit"}):o.length>1&&s.push({text:f||decodeURIComponent(o[o.length-1])})}}if(s.length<2)return[];const c=s[s.length-1];return s[s.length-1]={text:c.text},s}let ls,Xo=!1,yi,Fr;function Kd(e,t,a,i){yi&&yi!==e&&yi.isConnected!==!1||(yi=e,ls=t,Xo=!!a,Fr=i)}function Yd(e,t){const a=_a(t);let i;const r=s=>{for(const o of s??[]){if(!o||o.separator)continue;const l=o.submenus??[];if(l.length>0){r(l);continue}const c=_a(o.route);!c||c==="/"||(a===c||a.startsWith(c+"/"))&&(!i||c.length>i.route.length)&&(i={option:o,route:c})}};return r(e),i?.option}function Xd(e){if(!Fr)return!1;const t=Yd(ls,e);return t?(Fr(t,e),!0):!1}function Jd(e,t){return Xo?[]:Gd(ls,e,t)}const Ns=new WeakMap,Qd=e=>{let t=Ns.get(e);return t===void 0&&(t=typeof window<"u"?window.location.pathname:"",Ns.set(e,t)),t};class Zd{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const et=new Zd;var ec=Object.defineProperty,tc=Object.getOwnPropertyDescriptor,bt=(e,t,a,i)=>{for(var r=i>1?void 0:i?tc(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&ec(t,a,r),r};const ds=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},Jo=e=>{const t=ds(e)??"",a=[];return t.includes("primary")&&a.push("primary"),t.includes("tertiary")&&a.push("tertiary"),(t.includes("error")||e.color==="error")&&a.push("danger"),a.join(" ")};let qe=class extends _{constructor(){super(...arguments),this.appState={},this.appData={},this._overflowOpen=!1,this._overflowN=0,this._secCount=0,this._onDocClick=e=>{e.composedPath().includes(this)||(this._overflowOpen=!1)},this._resetOverflow=()=>{this._overflowN!==0?this._overflowN=0:this.requestUpdate()},this.handleButtonClick=e=>{this._overflowOpen=!1;const t=e.route?U(e.route,this.state,this.data):void 0;if(t&&!t.includes("${")){Et(this,t);return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{crud_selected_items:this.listingSelection()}},bubbles:!0,composed:!0}))},this.listingSelection=()=>{const t=this.findSiblingCrud()?.state?.crud_selected_items;return Array.isArray(t)?t:[]},this.findSiblingCrud=()=>{const e=a=>{for(const i of Array.from(a.querySelectorAll("*"))){if(i.tagName==="MATEU-TABLE-CRUD")return i;if(i.shadowRoot){const r=e(i.shadowRoot);if(r)return r}}return null};let t=this;for(;t;){const a=t,i=a.parentElement??(a.getRootNode?.()instanceof ShadowRoot?a.getRootNode().host:null);if(!i)break;const r=e(i);if(r)return r;t=i}return null},this.evalLabel=e=>U(e,this.state,this.data),this.renderBackChevron=e=>{if((this.data??{})[e.actionId+".hidden"])return d;const t=this.evalLabel(e.label);return n`
        <button class="back-chevron"
                data-action-id="${e.id}"
                title="${t}"
                aria-label="${t}"
                @click="${()=>this.handleButtonClick(e)}">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>`},this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return d;const t=this.evalLabel(e.label),a=H.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e));return a||n`
        <button class="mtb ${Jo(e)}"
                data-action-id="${e.id}"
                @click="${()=>this.handleButtonClick(e)}"
                ?disabled="${e.disabled}"
        >${t}</button>
    `},this.renderActions=e=>{const t=e.filter(l=>!(this.data??{})[l.actionId+".hidden"]),a=t.filter(l=>l.buttonStyle==="primary"),i=t.filter(l=>l.buttonStyle!=="primary");this._secCount=i.length;const r=Math.max(0,Math.min(this._overflowN,i.length)),s=i.slice(0,i.length-r),o=i.slice(i.length-r);return n`
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
        `},this.renderPeerNav=e=>{const t=H.get()?.renderPeerNav?.(e);return t||n`
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
        `}}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._onDocClick),this._ro=new ResizeObserver(()=>this._resetOverflow()),this._ro.observe(this),window.addEventListener("resize",this._resetOverflow)}disconnectedCallback(){document.removeEventListener("click",this._onDocClick),window.removeEventListener("resize",this._resetOverflow),this._ro?.disconnect(),this._ro=void 0,super.disconnectedCallback()}updated(e){if(e.has("_overflowOpen")&&this._overflowOpen&&this._placeOverflowMenu(),e.has("metadata")||e.has("data")){this._resetOverflow();return}if(this._inDialog()){this._overflowN!==0&&(this._overflowN=0);return}const t=this.renderRoot.querySelector(".actions-cluster");if(!t||this._secCount===0)return;const a=t.closest(".form-header, .no-header-row");if(!a)return;const i=t.getBoundingClientRect(),r=a.getBoundingClientRect();(i.top-r.top>8||i.right>r.right+1)&&this._overflowN<this._secCount&&(this._overflowN+=1)}_inDialog(){let e=this;for(;e;){const t=e.tagName;if(t==="VAADIN-DIALOG-OVERLAY"||t==="DIALOG"||e.getAttribute?.("role")==="dialog")return!0;e=e.parentElement??e.getRootNode?.()?.host}return!1}_placeOverflowMenu(){const e=this.renderRoot.querySelector(".overflow-menu");e&&(e.classList.remove("flip"),e.getBoundingClientRect().left<0&&e.classList.add("flip"))}crumbsOf(e,t){return e?.breadcrumbs&&e.breadcrumbs.length>0?e.breadcrumbs.map(a=>({text:a.text,route:a.link||void 0})):t>0||e?.type!==v.Page||e.noBreadcrumbs?[]:Jd(Qd(e),{title:e.title,pageType:e.pageType})}goToCrumb(e){if(/^[a-z]+:\/\//i.test(e)){window.location.href=e;return}et.confirmLeave()&&(Xd(e)||Et(this,e))}render(){const e=this.metadata;if(!e)return n``;const t=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0,a=e.toolbar??[],i=!e.noHeader,r=a.filter(b=>Ri(b.actionId)&&!(i&&ka(b.actionId))),s=i?a.filter(b=>ka(b.actionId)):[],o=a.filter(b=>!Ri(b.actionId)),l=r.length>0&&o.length>0?n`<span class="toolbar-divider"></span>`:d,c=e.overline,u=e.title?void 0:e.titlePlaceholder,p=e.avatar||e.title||e.subtitle||c||u||e.kpis?.length>0||e.header?.length>0||a.length>0||!!t,f=e.level??0;f>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested");const m=this.crumbsOf(e,f);return n`
            ${m.length>0?n`
                <nav class="breadcrumbs-bar" aria-label="Breadcrumb">
                    ${m.map((b,$)=>n`
                        ${$>0?n`<span class="breadcrumb-sep" aria-hidden="true">›</span>`:d}
                        ${b.route?n`<button class="breadcrumb-link" @click="${()=>this.goToCrumb(b.route)}">${b.text}</button>`:n`<span class="${$===m.length-1?"breadcrumb-current":"breadcrumb-group"}"
                                        aria-current="${$===m.length-1?"page":d}">${b.text}</span>`}
                    `)}
                </nav>
            `:d}
            ${e.noHeader?n`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;" class="no-header-row">
                    ${e?.header?.map(b=>w(this,b,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${t?this.renderPeerNav(t):d}
                    ${r.map(this.renderBtn)}
                    ${l}
                    ${this.renderActions(o)}
                </div>
            `:p?n`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center; flex-wrap: wrap;" class="form-header">
                    ${s.map(this.renderBackChevron)}
                    ${e.avatar?w(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):d}
                    <div style="flex: 1; min-width: min(22rem, 100%); overflow: hidden;">
                        ${c?n`<div class="page-overline">${ce(Fe(c,this.state??{},this.data??{}))}</div>`:d}
                        ${(e?.title||u)&&f==0?n`
                            <div style="display: flex; align-items: center; gap: var(--lumo-space-s, .5rem); min-width: 0;">
                                <h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${e?.title?ce(Fe(e?.title,this.state??{},this.data??{})):n`<span class="page-title-placeholder">${ce(Fe(u,this.state??{},this.data??{}))}</span>`}</h2>
                                ${e.kpisBelow&&e.badges?.length?e.badges.map(b=>Fs(b,this.state??{},this.data??{},{pill:!0})):d}
                            </div>`:d}
                        ${e?.title&&f==1?n`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ce(Fe(e?.title,this.state??{},this.data??{}))}</h3>`:d}
                        ${e?.title&&f==2?n`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ce(Fe(e?.title,this.state??{},this.data??{}))}</h4>`:d}
                        ${e?.title&&f==3?n`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ce(Fe(e?.title,this.state??{},this.data??{}))}</h5>`:d}
                        ${e?.title&&f>3?n`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${ce(Fe(e?.title,this.state??{},this.data??{}))}</h6>`:d}

                        ${e?.subtitle?n`<span style="display: inline-block; margin-block-end: 0.83em;">${ce(Fe(e?.subtitle,this.state??{},this.data??{}))}</span>`:d}
                        ${e?.timestamp?n`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${ce(Fe(e.timestamp,this.state??{},this.data??{}))}</span>`:d}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e.kpisBelow?d:e?.kpis?.map(b=>n`
                            <div class="header-fact">
                                <span class="header-fact-label">${this.evalLabel(b.title)}</span>
                                <span class="header-fact-value">${ce(Fe(b.text,this.state??{},this.data??{}))}</span>
                            </div>
                        `)}
                        ${e?.header?.map(b=>w(this,b,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${t?this.renderPeerNav(t):d}
                        ${r.map(this.renderBtn)}
                        ${l}
                        ${this.renderActions(o)}
                    </div>
                </div>
            `:d}
            ${e.kpisBelow&&e?.kpis?.length?n`
                <div class="kpi-row">
                    ${e.kpis.map(b=>n`
                        <div class="kpi-pair">
                            <span class="kpi-label">${this.evalLabel(b.title)}</span>
                            <span class="kpi-value">${ce(Fe(b.text,this.state??{},this.data??{}))}</span>
                        </div>
                    `)}
                </div>
            `:d}
            ${e.badges&&e.badges.length>0&&!e.kpisBelow?n`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(b=>Fs(b,this.state??{},this.data??{},{pill:!0}))}
                </div>
            `:d}
        `}};qe.styles=[x`
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

        ${Lt}
    `,da];bt([h()],qe.prototype,"metadata",2);bt([h()],qe.prototype,"baseUrl",2);bt([h()],qe.prototype,"state",2);bt([h()],qe.prototype,"data",2);bt([h()],qe.prototype,"appState",2);bt([h()],qe.prototype,"appData",2);bt([g()],qe.prototype,"_overflowOpen",2);bt([g()],qe.prototype,"_overflowN",2);qe=bt([k("mateu-content-header")],qe);var ac=Object.defineProperty,ic=Object.getOwnPropertyDescriptor,ni=(e,t,a,i)=>{for(var r=i>1?void 0:i?ic(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&ac(t,a,r),r};let ea=class extends ir{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return n`
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
       `}};ea.styles=x`
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
    `;ni([h()],ea.prototype,"state",2);ni([h()],ea.prototype,"data",2);ni([h()],ea.prototype,"appState",2);ni([h()],ea.prototype,"appData",2);ea=ni([k("mateu-form")],ea);var rc=Object.defineProperty,sc=Object.getOwnPropertyDescriptor,cs=(e,t,a,i)=>{for(var r=i>1?void 0:i?sc(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&rc(t,a,r),r};let Ka=class extends _{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?n`${e.map(()=>n`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?n`${e.map(()=>n`<div class="bone row"></div>`)}`:this.variant=="form"?n`${e.map(()=>n`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:n`${e.map(()=>n`<div class="bone line"></div>`)}`}};Ka.styles=x`
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
    `;cs([h()],Ka.prototype,"variant",2);cs([h({type:Number})],Ka.prototype,"count",2);Ka=cs([k("mateu-skeleton")],Ka);const G=(e,t,a,i)=>{if(!e)return n``;const r=H.get()?.renderIcon;if(r){const s=r.call(H.get(),e,t,a);return i?n`<span slot="${i}">${s}</span>`:s}return n`<span class="mateu-icon ${a??""}" data-icon="${e}" aria-hidden="true"
                      style="display:inline-block; width:1em; height:1em; ${t??""}" slot="${i??d}"></span>`},oc="vaadin:ban",nc=e=>{const t=e??oc;return t.includes(":")?H.get()?.renderIcon?G(t,"width: 1.8rem; height: 1.8rem;"):n`${e?d:"🗂"}`:n`${t}`},lc=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},Kt=(e,t,a,i,r,s)=>n`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${nc(t)}</span>
            ${a?n`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${a}</span>`:d}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${i??e??"Nothing here yet."}</span>
            ${r&&s?n`
                <button style="margin-top: .25rem; font: inherit; font-weight: 500; cursor: pointer; padding: .4rem .9rem; border: none; border-radius: var(--lumo-border-radius-m, 6px); background: transparent; color: var(--lumo-primary-text-color, #3b5bdb);"
                        @click="${o=>lc(o,r)}">${s}</button>
            `:d}
        </div>
    `,dc=e=>{const t=e.metadata;return n`
        <div style="${e.style??d}" class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${Kt(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},cc=e=>{const t=e.metadata;return n`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-skeleton>
    `},Qo="mateu-saved-views",rr=()=>{try{return JSON.parse(localStorage.getItem(Qo)??"{}")}catch{return{}}},us=e=>{try{localStorage.setItem(Qo,JSON.stringify(e))}catch{}},Zo=e=>rr()[e]??[],uc=(e,t)=>{const a=t.name?.trim();if(!a||Object.keys(t.values??{}).length===0)return;const i=rr(),r=(i[e]??[]).filter(s=>s.name!==a);r.push({...t,name:a}),i[e]=r,us(i)},hc=(e,t)=>{const a=rr(),i=(a[e]??[]).filter(r=>r.name!==t);i.length===0?delete a[e]:a[e]=i,us(a)},pc=(e,t)=>{const a=rr();a[e]=(a[e]??[]).map(i=>({...i,isDefault:i.name===t?!i.isDefault:!1})),us(a)},mc=e=>Zo(e).find(t=>t.isDefault);var fc=Object.defineProperty,vc=Object.getOwnPropertyDescriptor,Re=(e,t,a,i)=>{for(var r=i>1?void 0:i?vc(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&fc(t,a,r),r};let ve=class extends _{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.viewsOpened=!1,this.draftText="",this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{const e=this.filters.flatMap(a=>this.isRangeFilter(a)?[`${a.fieldId}_from`,`${a.fieldId}_to`]:[a.fieldId]),t={searchText:void 0};e.forEach(a=>{t[a]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return(this.metadata?.filters??[]).filter(e=>!e.readOnly)}get scopeFilters(){return(this.metadata?.filters??[]).filter(e=>e.readOnly)}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){const t=this.filters.find(a=>a.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e==="searchText"?"":void 0),this.requestSearch()}commitText(e){this.emitValueChanged("searchText",e.value),this.draftText="",e.value="",this.requestSearch()}get viewsScope(){return window.location.pathname}allFilterKeys(){return["searchText",...this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])]}snapshotValues(){const e={};return this.state.searchText&&(e.searchText=this.state.searchText),this.filters.forEach(t=>{if(this.isSet(t))if(this.isRangeFilter(t)){const a=this.rangeBound(t,"from"),i=this.rangeBound(t,"to");a&&(e[`${t.fieldId}_from`]=a),i&&(e[`${t.fieldId}_to`]=i)}else this.isMultiFilter(t)?e[t.fieldId]=this.multiValues(t):e[t.fieldId]=this.state[t.fieldId]}),e}applyView(e){const t=this.allFilterKeys(),a={};t.forEach(i=>{a[i]=void 0}),this.state={...this.state,...a},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:t},bubbles:!0,composed:!0})),Object.entries(e.values).forEach(([i,r])=>this.emitValueChanged(i,r)),this.viewsOpened=!1,this.detachOutsideClick(),this.requestSearch()}saveCurrentView(e){const t=e.value.trim();t&&(uc(this.viewsScope,{name:t,values:this.snapshotValues()}),e.value="",this.requestUpdate())}firstUpdated(){if(window.location.search)return;const e=mc(this.viewsScope);e&&setTimeout(()=>{this.state.searchText||this.filters.some(a=>this.isSet(a))||this.applyView(e)},0)}isBooleanFilter(e){return e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle"}isNumericFilter(e){return["integer","decimal","number","money"].includes(e.dataType??"")}isRangeFilter(e){return e.stereotype==="dateRange"||e.stereotype==="numberRange"}isMultiFilter(e){return e.stereotype==="multiSelect"}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){const t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t=="string"&&t!==""?t.split(",").map(a=>a.trim()).filter(a=>a):[]}rangeBound(e,t){const a=this.state[`${e.fieldId}_${t}`];return a==null?"":String(a)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,"from")!==""||this.rangeBound(e,"to")!=="";if(this.isMultiFilter(e))return this.multiValues(e).length>0;const t=this.state[e.fieldId];return t!=null&&t!==""&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){const a=e.options.find(i=>i.value===String(t));if(a)return a.label??a.value}return typeof t=="boolean"?t?"Yes":"No":String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){const t=this.rangeBound(e,"from"),a=this.rangeBound(e,"to");return t&&a?`${t} – ${a}`:t?`≥ ${t}`:`≤ ${a}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(", "):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return U(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,a="panel-row"){return n`
            <div class="${a}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){const t=e.stereotype==="numberRange"?"number":e.dataType==="dateTime"?"datetime-local":e.dataType==="time"?"time":"date",a=r=>{const s=r.closest(".panel-input-row"),o=s.querySelector("input.range-from").value,l=s.querySelector("input.range-to").value;this.emitValueChanged(`${e.fieldId}_from`,o===""?void 0:o),this.emitValueChanged(`${e.fieldId}_to`,l===""?void 0:l),this.requestSearch()},i=r=>{r.key==="Enter"&&a(r.target),r.key==="Escape"&&this.closePanel()};return n`
            <div class="panel-input-row">
                <input class="range-from" type="${t}" placeholder="From"
                       .value="${this.rangeBound(e,"from")}"
                       @mousedown="${r=>r.stopPropagation()}"
                       @keydown="${i}"/>
                <span class="range-separator" aria-hidden="true">–</span>
                <input class="range-to" type="${t}" placeholder="To"
                       .value="${this.rangeBound(e,"to")}"
                       @mousedown="${r=>r.stopPropagation()}"
                       @keydown="${i}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${r=>a(r.target)}">Apply</button>
            </div>`}renderMultiWidget(e){const t=this.multiValues(e),a=i=>{const r=t.includes(i)?t.filter(s=>s!==i):[...t,i];this.emitValueChanged(e.fieldId,r.length>0?r:void 0),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))};return n`${(e.options??[]).map(i=>this.panelRow(n`
            <span class="multi-check ${t.includes(i.value)?"multi-check--on":""}"
                  aria-hidden="true">${t.includes(i.value)?"✓":""}</span>
            ${i.label??i.value}
        `,()=>a(i.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return n`${e.options.map(i=>this.panelRow(i.label??i.value,()=>this.applyFilter(e.fieldId,i.value)))}`;if(this.isBooleanFilter(e))return n`
                ${this.panelRow("Yes",()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow("No",()=>this.applyFilter(e.fieldId,!1))}`;const t=this.isNumericFilter(e),a=i=>{i.value!==""&&this.applyFilter(e.fieldId,t?Number(i.value):i.value)};return n`
            <div class="panel-input-row">
                <input type="${t?"number":"text"}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${i=>i.stopPropagation()}"
                       @keydown="${i=>{i.key==="Enter"&&a(i.target),i.key==="Escape"&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${i=>a(i.target.previousElementSibling)}">Apply</button>
            </div>`}renderViewsPanel(){if(!this.viewsOpened)return d;const e=Zo(this.viewsScope),t=!!this.state.searchText||this.filters.some(a=>this.isSet(a));return n`
            <div class="panel views-panel">
                <div class="panel-caption">Saved views</div>
                ${e.length===0?n`
                    <div class="panel-row views-empty">No saved views yet</div>`:d}
                ${e.map(a=>n`
                    <div class="panel-row view-row" @mousedown="${this.keepFocus}">
                        <span class="view-name" @click="${()=>this.applyView(a)}">${a.name}</span>
                        <button class="view-star ${a.isDefault?"view-star--on":""}"
                                title="${a.isDefault?"Unset as default":"Open this listing with this view"}"
                                @click="${()=>{pc(this.viewsScope,a.name),this.requestUpdate()}}">★</button>
                        <button class="chip-remove" aria-label="Delete view ${a.name}"
                                @click="${()=>{hc(this.viewsScope,a.name),this.requestUpdate()}}">✕</button>
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
            </div>`}render(){const e=[];return this.state.searchText&&e.push({fieldId:"searchText",label:"Text",display:String(this.state.searchText)}),this.filters.forEach(t=>{this.isSet(t)&&e.push({fieldId:t.fieldId,label:this.labelOf(t),display:this.conditionDisplay(t)})}),n`
            <div class="smart-search">
                <div class="bar"
                     @click="${t=>{t.currentTarget.querySelector("input.free-text")?.focus(),this.openPanel()}}">
                    <svg aria-hidden="true" class="magnifier" width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
                    </svg>
                    ${this.scopeFilters.filter(t=>this.isSet(t)).map(t=>n`
                        <span theme="badge pill" class="chip chip-scope" title="Fixed by the page">
                            <span class="chip-label">${this.labelOf(t)}:</span> ${this.conditionDisplay(t)}
                        </span>`)}
                    ${e.map(t=>n`
                        <span theme="badge contrast pill" class="chip">
                            <span class="chip-label">${t.label}:</span> ${t.display}
                            <button class="chip-remove" aria-label="Remove filter ${t.label}"
                                    @mousedown="${this.keepFocus}"
                                    @click="${a=>{a.stopPropagation(),this.removeChip(t.fieldId)}}">✕</button>
                        </span>`)}
                    ${this.metadata?.searchable!==!1?n`
                        <input class="free-text" type="text" id="searchText"
                               placeholder="${e.length===0?"Search":""}"
                               autofocus="${this.metadata?.autoFocusOnSearchText?!0:d}"
                               .value="${this.draftText??""}"
                               @input="${t=>{this.draftText=t.target.value,this.openPanel()}}"
                               @keydown="${t=>{t.key==="Enter"&&this.commitText(t.target),t.key==="Escape"&&this.closePanel()}}"/>
                    `:d}
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
        `}};ve.styles=x`
        ${Lt}
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
    `;Re([h()],ve.prototype,"metadata",2);Re([h()],ve.prototype,"baseUrl",2);Re([g()],ve.prototype,"state",2);Re([g()],ve.prototype,"data",2);Re([h()],ve.prototype,"appState",2);Re([h()],ve.prototype,"appData",2);Re([h({type:Boolean})],ve.prototype,"searchOnly",2);Re([g()],ve.prototype,"panelOpened",2);Re([g()],ve.prototype,"viewsOpened",2);Re([g()],ve.prototype,"activeFilter",2);Re([g()],ve.prototype,"draftText",2);ve=Re([k("mateu-filter-bar")],ve);const en="mateu-column-prefs",hs=()=>{try{const e=JSON.parse(localStorage.getItem(en)??"{}");return e&&typeof e=="object"&&!Array.isArray(e)?e:{}}catch{return{}}},tn=e=>{try{localStorage.setItem(en,JSON.stringify(e))}catch{}},ps=e=>{if(!e||typeof e!="object")return;const t=a=>Array.isArray(a)?a.filter(i=>typeof i=="string"):[];return{hidden:t(e.hidden),order:t(e.order)}},an=e=>ps(hs()[e]),bc=(e,t)=>{const a=hs(),i=ps(t);i.hidden.length===0&&i.order.length===0?delete a[e]:a[e]=i,tn(a)},gc=e=>{const t=hs();delete t[e],tn(t)},rn=e=>e?!!e.identifier||e.dataType==="action"||e.dataType==="actionGroup"||e.dataType==="menu"||e.id==="select"||e.id==="menu":!1,sn=(e,t,a=i=>i)=>{const i=ps(t);if(!i||i.hidden.length===0&&i.order.length===0)return e;const r=f=>a(f)?.id??f.id,s=new Set(i.hidden),o=e.filter(f=>{const m=r(f);return!m||!s.has(m)||rn(a(f))});if(i.order.length===0)return o.length===e.length?e:o;const l=new Map;o.forEach(f=>{const m=r(f);m&&!l.has(m)&&l.set(m,f)});const c=[],u=new Set;return i.order.forEach(f=>{const m=l.get(f);m&&!u.has(m)&&(c.push(m),u.add(m))}),o.forEach(f=>{u.has(f)||(c.push(f),u.add(f))}),c.length===e.length&&c.every((f,m)=>f===e[m])?e:c};var yc=Object.defineProperty,$c=Object.getOwnPropertyDescriptor,li=(e,t,a,i)=>{for(var r=i>1?void 0:i?$c(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&yc(t,a,r),r};let ta=class extends _{constructor(){super(...arguments),this.columns=[],this.scope="",this.panelOpened=!1,this.revision=0,this.togglePanel=()=>{if(this.panelOpened){this.closePanel();return}this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick)},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1},this.reset=()=>{gc(this.scope),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}get prefs(){return an(this.scope)??{hidden:[],order:[]}}effectiveEntries(e){return sn(this.columns,{hidden:[],order:e.order})}commit(e){bc(this.scope,e),this.revision++,this.dispatchEvent(new CustomEvent("column-prefs-changed",{bubbles:!0,composed:!0}))}toggleVisibility(e){const t=this.prefs,a=t.hidden.includes(e)?t.hidden.filter(i=>i!==e):[...t.hidden,e];this.commit({...t,hidden:a})}move(e,t){const a=this.prefs,i=[...this.effectiveEntries(a)],r=i.findIndex(l=>l.id===e);if(r<0)return;let s=r+t;for(;s>=0&&s<i.length&&i[s].protected;)s+=t;if(s<0||s>=i.length)return;const o=i[r];i[r]=i[s],i[s]=o,this.commit({...a,order:i.map(l=>l.id)})}render(){this.revision;const e=this.prefs,t=this.effectiveEntries(e).filter(i=>!i.protected);if(t.length===0)return n``;const a=e.hidden.length>0||e.order.length>0;return n`
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
                        ${t.map((i,r)=>{const s=e.hidden.includes(i.id);return n`
                                <div class="row" data-column-id="${i.id}">
                                    <label class="row-label">
                                        <input
                                            type="checkbox"
                                            .checked="${!s}"
                                            @change="${()=>this.toggleVisibility(i.id)}"
                                        />
                                        <span class="${s?"muted":""}">${i.label||i.id}</span>
                                    </label>
                                    <button class="move" type="button" title="Move up" aria-label="Move ${i.label||i.id} up"
                                        ?disabled="${r===0}"
                                        @click="${()=>this.move(i.id,-1)}">↑</button>
                                    <button class="move" type="button" title="Move down" aria-label="Move ${i.label||i.id} down"
                                        ?disabled="${r===t.length-1}"
                                        @click="${()=>this.move(i.id,1)}">↓</button>
                                </div>
                            `})}
                        <div class="footer">
                            <button class="reset" type="button" ?disabled="${!a}" @click="${this.reset}">Reset</button>
                        </div>
                    </div>
                `:d}
            </div>
        `}};ta.styles=x`
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
    `;li([h()],ta.prototype,"columns",2);li([h()],ta.prototype,"scope",2);li([g()],ta.prototype,"panelOpened",2);li([g()],ta.prototype,"revision",2);ta=li([k("mateu-column-chooser")],ta);async function wc(e){return{}}function Jt(e,t){return t?t.split(".").reduce((a,i)=>a!=null&&typeof a=="object"?a[i]:void 0,e):e}function on(e,t,a="value",i="label"){const r=Jt(e,t);return Array.isArray(r)?r.map(s=>{if(s!=null&&typeof s=="object"){const o=Jt(s,a),l=Jt(s,i);return{value:o??l,label:String(l??o??"")}}return{value:s,label:String(s)}}):[]}function nn(e,t,a,i=r=>r){const r=Jt(e,t);return Array.isArray(r)?r.map(s=>{const o={};for(const l of a)o[l]=Jt(s,i(l));return o}):[]}async function Ca(e,t=r=>r,a=fetch,i){const r=Oa(e),s=(r.method||"GET").toUpperCase();if(!r.url)throw new Error(`External REST fetch has no url${e.ref?` (unknown source "${e.ref}")`:""}`);const o=t(r.url)??r.url,l={};for(const[p,f]of Object.entries(r.headers??{}))l[p]=t(f)??f;Object.assign(l,await wc());const c={method:s,headers:l};if(s!=="GET"&&s!=="HEAD"&&r.body){const p=i&&Wl(l)?i:t;c.body=p(r.body)??r.body}const u=await a(o,c);if(!u.ok)throw new Error(`External REST fetch failed: ${u.status}`);return u.json()}async function xc(e,t=i=>i,a=fetch){const i=await Ca(e,t,a),r=Oa(e);return on(i,r.itemsPath,r.valuePath,r.labelPath)}async function kc(e,t,a=r=>r,i=fetch){const r=await Ca(e,a,i),s=Oa(e);return nn(r,s.itemsPath,t,o=>zo(e,o))}async function _c(e,t,a=r=>r,i=fetch){const r=await Ca(e,a,i);return ln(r,e,t)}function ln(e,t,a){const i=Oa(t),r=nn(e,i.itemsPath,a,l=>zo(t,l)),s=Jt(e,Ro(t)),o=typeof s=="number"?s:Number(s);return{rows:r,total:Number.isFinite(o)?o:null}}const Yt=e=>e==null||e===""||typeof e=="number"&&Number.isNaN(e),Cc=e=>e.stereotype==="dateRange"||e.stereotype==="numberRange",Sc=e=>e.stereotype==="multiSelect",Ec=e=>e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle",Ic=e=>Array.isArray(e)?e.map(String):typeof e=="string"&&e!==""?e.split(",").map(t=>t.trim()).filter(t=>t):[],Tc=(e,t,a,i)=>{if(i){const s=Number(e);return!(e===""||e==null||Number.isNaN(s)||!Yt(t)&&s<Number(t)||!Yt(a)&&s>Number(a))}const r=e==null?"":String(e);return!(r===""||!Yt(t)&&r<String(t)||!Yt(a)&&r>String(a))},Pc=(e,t,a)=>{const i=t.fieldId;if(!i)return!0;const r=e[i];if(Cc(t)){const o=a[`${i}_from`],l=a[`${i}_to`];return Yt(o)&&Yt(l)?!0:Tc(r,o,l,t.stereotype==="numberRange")}if(Sc(t)){const o=Ic(a[i]);return o.length===0?!0:o.includes(String(r??""))}const s=a[i];if(Yt(s))return!0;if(Ec(t)){const o=typeof s=="boolean"?s:String(s).toLowerCase()==="true",l=typeof r=="boolean"?r:String(r??"").toLowerCase()==="true";return o===l}return(t.options?.length??0)>0?String(r??"")===String(s):String(r??"").toLowerCase().includes(String(s).toLowerCase())};function Oc(e,t,a,i){const r=String(i?.searchText??"").trim().toLowerCase(),s=(a??[]).filter(o=>o?.fieldId);return r===""&&s.length===0?e:e.filter(o=>r!==""&&!t.some(l=>String(o[l]??"").toLowerCase().includes(r))?!1:s.every(l=>Pc(o,l,i??{})))}const br=e=>{const t=Number(e);return Number.isFinite(t)&&t>0?Math.floor(t):0},zc=(e,t,a)=>{const i=br(e),r=br(t),s=br(a);if(r===0)return{totalPages:void 0,currentPage:s,multiPage:s>0,isFirst:s===0,isLast:!0};const o=Math.max(1,Math.ceil(i/r)),l=Math.min(s,o-1);return{totalPages:o,currentPage:l,multiPage:o>1,isFirst:l===0,isLast:l>=o-1}};var Rc=Object.defineProperty,Ac=Object.getOwnPropertyDescriptor,sr=(e,t,a,i)=>{for(var r=i>1?void 0:i?Ac(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Rc(t,a,r),r};let Sa=class extends _{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return d;const{totalPages:e,currentPage:t,multiPage:a,isFirst:i,isLast:r}=zc(this.totalElements,this.pageSize,this.pageNumber);return n`
            <div class="bar">
                ${a?n`
                    <button class="nav" title="First page" ?disabled="${i}"
                        @click="${()=>this.dispatch(0)}" data-testid="page-first">«</button>
                    <button class="nav" title="Previous page" ?disabled="${i}"
                        @click="${()=>this.dispatch(t-1)}" data-testid="page-prev">‹</button>
                    <span class="page-indicator">Page ${t+1}${e!=null?n` of ${e}`:d}</span>
                    <button class="nav" title="Next page" ?disabled="${r}"
                        @click="${()=>this.dispatch(t+1)}" data-testid="page-next">›</button>
                    <button class="nav" title="Last page" ?disabled="${r||e==null}"
                        @click="${()=>this.dispatch(e-1)}" data-testid="page-last">»</button>
                    <span class="separator"></span>
                `:d}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?"":"s"}</span>
                <slot></slot>
            </div>
        `}};Sa.styles=x`
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
    `;sr([h()],Sa.prototype,"totalElements",2);sr([h()],Sa.prototype,"pageSize",2);sr([h()],Sa.prototype,"pageNumber",2);Sa=sr([k("mateu-pagination")],Sa);const dn=(e,t,a=!1)=>e&&e>1||a?n`<div style="grid-column: span ${e&&e>1?e:1}; min-width: 0;">${t}</div>`:t,Ra="var(--lumo-space-m, 1rem)",Lc=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=l.columnWidth||"13rem";let p=`display: grid; grid-template-columns: ${l.maxColumns&&l.maxColumns>0?`repeat(${l.maxColumns}, minmax(0, 1fr))`:`repeat(auto-fill, minmax(min(100%, ${c}), 1fr))`}; gap: ${Ra} var(--lumo-space-l, 1.5rem); align-items: start;`;return l.labelsAside&&(p+=" --mateu-label-width: 10rem;"),l.fullWidth&&(p+=" width: 100%;"),p+=t.style??"",n`
        <div id="${t.id??d}" style="${p}" class="${t.cssClasses}" slot="${t.slot||d}">
            ${t.children?.map(f=>cn(l,e,f,a,i,r,s,o))}
        </div>
    `},cn=(e,t,a,i,r,s,o,l)=>{if(a.type==J.ClientSide&&a.metadata?.type==v.FormRow)return Mc(e,t,a,i,r,s,o,l);const c=Dc(a),u=e.labelsAside?Fc(t,a,i,r,s,o,l):w(t,a,i,r,s,o,l);return dn(c,u,!0)},Dc=e=>{if(e.type==J.ClientSide){const t=e.metadata;if(t?.type==v.FormField)return t.colspan||1}return 1},Fc=(e,t,a,i,r,s,o)=>{if(t.type==J.ClientSide&&t.metadata?.type==v.FormField&&t.metadata.label){const l=t.metadata,c=l.label?.includes("${")?e._evalTemplate(l.label):l.label;return n`
            <div style="display: flex; gap: ${Ra}; align-items: baseline;">
                <label style="flex: 0 0 var(--mateu-label-width, 10rem); color: var(--lumo-secondary-text-color, #667);">${c}</label>
                <div style="flex: 1; min-width: 0;">${w(e,t,a,i,r,s,o,!0)}</div>
            </div>
        `}return w(e,t,a,i,r,s,o)},Mc=(e,t,a,i,r,s,o,l)=>n`
        <div style="grid-column: 1 / -1; display: flex; gap: ${Ra}; flex-wrap: wrap;">
            ${a.children?.map(c=>n`<div style="flex: 1 1 ${100/Math.max(1,a.children.length)}%; min-width: min(100%, 13rem);">${cn(e,t,c,i,r,s,o,l)}</div>`)}
        </div>
    `,un=(e,t,a,i,r,s,o,l)=>{const c=a.metadata;let u=`display: flex; flex-direction: ${e};`;c.spacing&&(u+=` gap: ${Ra};`),c.padding&&(u+=" padding: var(--lumo-space-m, 1rem);"),c.wrap&&(u+=" flex-wrap: wrap;"),c.fullWidth&&(u+=" width: 100%;"),c.justification&&(u+=` justify-content: ${c.justification};`);const p=e==="row"?c.verticalAlignment:c.horizontalAlignment;return p&&(u+=` align-items: ${p};`),u+=a.style??"",n`
        <div id="${a.id??d}" style="${u}" class="${a.cssClasses}" slot="${a.slot??d}">
            ${a.children?.map(f=>w(t,f,i,r,s,o,l))}
        </div>
    `},Nc=(e,t,a,i,r,s,o)=>un("row",e,t,a,i,r,s,o),qc=(e,t,a,i,r,s,o)=>un("column",e,t,a,i,r,s,o),Bc=(e,t,a,i,r,s,o)=>{const l=t.metadata;let u=`display: flex; flex-direction: ${l.orientation==="vertical"?"column":"row"}; gap: var(--lumo-space-s, 0.5rem);`;return l.fullWidth&&(u+=" width: 100%;"),u+=t.style??"",n`
        <div id="${t.id??d}" style="${u}" class="${t.cssClasses}" slot="${t.slot??d}">
            <div style="flex: 1; min-width: 0; min-height: 0;">${w(e,t.children[0],a,i,r,s,o)}</div>
            <div style="flex: 1; min-width: 0; min-height: 0;">${w(e,t.children[1],a,i,r,s,o)}</div>
        </div>
    `},jc=(e,t,a,i,r,s,o)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=r?.detailComponent??null,u=!!r?.hasDetail||!!l,p=c??l;return n`
        <div id="${t.id??d}" style="display: flex; gap: var(--lumo-space-m, 1rem); ${t.style??""}" class="${t.cssClasses}" slot="${t.slot??d}">
            <div style="flex: 1; min-width: 0;">${w(e,t.children[0],a,i,r,s,o)}</div>
            ${u&&p?n`<div style="flex: 1; min-width: 0;">${w(e,p,a,i,r,s,o)}</div>`:n`<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem);">Select an item to view details</div>`}
        </div>
    `},Uc=(e,t,a,i,r,s,o)=>{let l=t.style??"";t.metadata.fullWidth&&(l+=" width: 100%;");const c=Math.max(0,(t.children??[]).findIndex(u=>u.metadata.active));return n`
        <div id="${t.id??d}" style="${l}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map((u,p)=>{const f=u,m=f.metadata.label,b=m?.includes("${")?e._evalTemplate(m):m;return n`
                    <details ?open="${p===c}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));">
                        <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600;">${b}</summary>
                        <div style="padding: var(--lumo-space-m, 1rem) 0;">
                            ${f.children?.map($=>w(e,$,a,i,r,s,o))}
                        </div>
                    </details>
                `})}
        </div>
    `},Wc=(e,t,a,i,r,s,o)=>{const l=t.metadata;let c=t.style??"";return l.fullWidth&&(c+=" width: 100%;"),n`
        <div style="${c}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(u=>Hc(e,u,a,i,r,s,o,l.variant))}
        </div>
    `},Hc=(e,t,a,i,r,s,o,l)=>{const c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return n`
        <details ?open="${c.active}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); ${t.style??""}" class="${t.cssClasses}">
            <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600; ${c.disabled?"pointer-events: none; opacity: .5;":""}">${u}</summary>
            <div style="padding: var(--lumo-space-s, .5rem) 0;">
                ${t.children?.map(p=>w(e,p,a,i,r,s,o))}
            </div>
        </details>
    `},Vc=(e,t,a,i,r,s,o)=>n`
        <div style="overflow: auto; ${t.style??""}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(l=>w(e,l,a,i,r,s,o))}
        </div>
    `,Gc=(e,t,a,i,r,s,o)=>n`
        <div style="width: 100%; ${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(l=>w(e,l,a,i,r,s,o))}
        </div>
    `,Kc=(e,t,a,i,r,s,o)=>n`
        <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(l=>w(e,l,a,i,r,s,o))}
        </div>
    `,Yc=(e,t,a,i,r,s,o)=>n`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: ${Ra}; ${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${t.children?.map(l=>w(e,l,a,i,r,s,o))}
        </div>
    `,Xc=(e,t,a,i,r,s,o)=>n`
        <div style="display: flex; gap: ${Ra}; flex-wrap: wrap; ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(l=>w(e,l,a,i,r,s,o))}
        </div>
    `,Jc=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`
        <div style="flex: ${l.boardCols??1} 1 0; min-width: min(100%, 12rem); ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(c=>w(e,c,a,i,r,s,o))}
        </div>
    `},Qc=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`
        <div
                style="display: flex; flex-direction: column; overflow: auto; ${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${l.page.content.map(c=>w(e,c,a,i,r,s,o))}
        </div>
    `},Zc=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,hn=e=>typeof e=="string"&&Zc.test(e),eu=e=>hn(e)?"…-"+e.substring(e.lastIndexOf("-")+1):e,tu=e=>t=>{t.clipboardData&&(t.clipboardData.setData("text/plain",e),t.preventDefault())},Ya=e=>hn(e)?n`<span class="mateu-uuid" data-uuid="${e}" title="${e}"
                     @copy="${tu(e)}">${eu(e)}</span>`:e,au=e=>{const t=e.metadata;return(t?.content??t?.columns??[]).filter(i=>i&&i.metadata).map(i=>{const r=i.metadata;return{id:i.id??"",label:r?.label??i.id??"",autoWidth:r?.autoWidth,width:r?.width}})},qs=(e,t)=>{const a=e?.[t];return a==null?"":typeof a=="object"?a.text??a.label??a.value??"":String(a)},Mr=(e,t,a)=>{const i=au(e),r="text-align:left; padding:.45rem .6rem; border-bottom:2px solid var(--lumo-contrast-20pct,rgba(0,0,0,.2)); font-weight:600; white-space:nowrap; color: var(--lumo-secondary-text-color,#556);",s="padding:.4rem .6rem; border-bottom:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.08)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:24rem;";return n`
        <div style="overflow:auto; width:100%; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            <table style="border-collapse:collapse; width:100%; font-size: var(--lumo-font-size-s,.875rem);">
                <thead><tr>${i.map(o=>n`<th style="${r}">${o.label}</th>`)}</tr></thead>
                <tbody>
                    ${(t??[]).length===0?n`<tr><td colspan="${Math.max(1,i.length)}" style="padding:1.5rem; text-align:center; color: var(--lumo-secondary-text-color,#888);">${a??"No data."}</td></tr>`:t.map(o=>n`<tr>${i.map(l=>n`<td style="${s}" title="${qs(o,l.id)}">${Ya(qs(o,l.id))}</td>`)}</tr>`)}
                </tbody>
            </table>
        </div>
    `},Bs=(e,t)=>{const a=e.metadata;return e.id&&t&&t[e.id]?t[e.id]:a?.page?.content??[]},iu=e=>{const a=e.metadata.items??[];return n`
        <div class="mateu-message-list ${e.cssClasses??""}"
             style="display:flex; flex-direction:column; gap:.75rem; ${e.style??""}"
             slot="${e.slot??d}">
            ${a.map(i=>n`
                <div style="display:flex; gap:.6rem; align-items:flex-start;">
                    <span style="flex:0 0 auto; width:2rem; height:2rem; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:.8rem; background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);">
                        ${i.userImg?n`<img src="${i.userImg}" alt="" style="width:100%; height:100%; object-fit:cover;">`:i.userAbbr??(i.userName?i.userName.charAt(0):"?")}
                    </span>
                    <div style="min-width:0;">
                        <div style="display:flex; gap:.5rem; align-items:baseline;">
                            ${i.userName?n`<span style="font-weight:600;">${i.userName}</span>`:d}
                            ${i.time?n`<span style="font-size:var(--lumo-font-size-xs,.75rem); color:var(--lumo-secondary-text-color,#666);">${i.time}</span>`:d}
                        </div>
                        <div style="white-space:pre-wrap; overflow-wrap:anywhere;">${i.text}</div>
                    </div>
                </div>
            `)}
        </div>
    `},pn=(e,t,a,i,r,s,o)=>t.separator?n`<span style="align-self: stretch; width: 1px; background: var(--lumo-contrast-20pct, rgba(0,0,0,.2));"></span>`:t.submenus?n`
            <details style="position: relative;">
                <summary style="cursor: pointer; list-style: none; padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);">
                    ${t.component?w(e,t.component,a,i,r,s,o):t.label} ▾
                </summary>
                <div style="display: flex; flex-direction: column; gap: .1rem; padding: .3rem; min-width: 10rem;
                            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px);
                            background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15));">
                    ${t.submenus.map(l=>pn(e,l,a,i,r,s,o))}
                </div>
            </details>
        `:n`
        <span class="${t.className??""}"
              style="cursor: ${t.disabled?"default":"pointer"}; opacity: ${t.disabled?.5:1};
                     padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
                     ${t.selected?"background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));":""}">
            ${t.component?w(e,t.component,a,i,r,s,o):t.label}
        </span>
    `,ru=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`
        <div style="display: flex; flex-wrap: wrap; gap: .25rem; align-items: center; ${t.style}"
             class="${t.cssClasses}" slot="${t.slot??d}">
            ${l.options?.map(c=>pn(e,c,a,i,r,{},{}))}
        </div>
    `},su=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`
        <div style="${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            ${w(e,l.wrapped,a,i,r,s,o)}
        </div>
    `},ou=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=l.content?.metadata,u=c?.type==v.Notice&&c.fullWidth===!0;return n`
        <div style="display:flex; flex-direction:column; ${u?"width: 100%; ":""}${t.style}"
             class="${t.cssClasses}"
             slot="${t.slot??d}"
             data-colspan="${l.colspan||(u?99:d)}"
        >
            ${l.label?n`<label style="font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${l.label}</label>`:d}
            ${w(e,l.content,a,i,r,s,o)}
        </div>
            `},nu=e=>{const t=e.metadata,a=i=>{const r=i.closest(".mateu-message-input")?.querySelector("input"),s=r?.value??"";!t.actionId||!s.trim()||(i.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:s}},bubbles:!0,composed:!0})),r&&(r.value=""))};return n`
        <div class="mateu-message-input ${e.cssClasses??""}"
             style="display:flex; gap:.5rem; align-items:center; ${e.style??""}"
             slot="${e.slot??d}">
            <input type="text"
                   style="flex:1; min-width:0; font:inherit; padding:.5rem .75rem; border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16)); border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513);"
                   @keydown="${i=>{i.key==="Enter"&&!i.shiftKey&&(i.preventDefault(),a(i.currentTarget))}}">
            <button style="font:inherit; font-weight:500; cursor:pointer; padding:.5rem 1rem; border:none; border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);"
                    @click="${i=>a(i.currentTarget)}">Send</button>
        </div>
    `},lu=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`<span title="${l.text}" style="${t.style}" class="${t.cssClasses}" slot="${t.slot??d}"
        >${w(e,l.wrapped,a,i,r,s,o)}</span>`},du=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const a in e){const i=e[a];["number","string","boolean"].indexOf(typeof i)>=0&&(t[a]=e[a])}return t},cu=(e,t,a,i,r)=>{const s={appState:i??{},appData:r??{}},o={};for(const l in e.attributes)o[l]=U(e.attributes[l],t,a,s);return{attributes:o,content:U(e.content,t,a,s)}},js=(e,t,a,i)=>{for(let r in i.attributes)e.setAttribute(r,i.attributes[r]);a.style&&e.setAttribute("style",a.style),a.cssClasses&&e.setAttribute("class",a.cssClasses),a.slot&&e.setAttribute("slot",a.slot),i.content&&(t.html?e.innerHTML=i.content:e.append(i.content))},uu=e=>{const t=e.name,a=e.attributes?e.attributes.import:void 0;a&&t.includes("-")&&!customElements.get(t)&&import(a)},hu=(e,t,a,i,r,s,o)=>{uu(t);const l=cu(t,i,r,s,o);let c=t.name;l.attributes.id&&(c="#"+l.attributes.id);const u=a.id?`.element-container[data-element-id="${a.id}"]`:".element-container";return setTimeout(()=>{const p=e.shadowRoot?.querySelector(u),f=p?.querySelector(c);if(f){for(;f.firstChild;)f.removeChild(f.lastChild);js(f,t,a,l)}else{const m=document.createElement(t.name);js(m,t,a,l);for(let b in t.on)m.addEventListener(b,$=>{const y=du($);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[b],parameters:{event:y}},bubbles:!0,composed:!0}))});p?.appendChild(m)}}),n`<div class="element-container" data-element-id="${R(a.id)}"></div>`};var Je=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(Je||{});const pu=(e,t,a,i,r)=>{const s=e.metadata,o=s.attributes?.["data-colspan"],l=Ga(s.text,t,a,i,r),c={xl:"var(--lumo-font-size-xl, 1.375rem)",l:"var(--lumo-font-size-l, 1.125rem)",s:"var(--lumo-font-size-s, .875rem)",xs:"var(--lumo-font-size-xs, .8125rem)"},u=(s.size&&c[s.size]?`font-size: ${c[s.size]}; `:"")+(s.noMargins?"margin-block-start: 0; margin-block-end: 0; ":"");return Je.h1==s.container?n`
            <h1 style="${u}${e.style}" class="${e.cssClasses}"
                id="${R(e.id)}"
                data-colspan="${R(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h1>
        `:Je.h2==s.container?n`
            <h2 style="${u}${e.style}" class="${e.cssClasses}"
                id="${R(e.id)}"
                data-colspan="${R(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h2>
        `:Je.h3==s.container?n`
            <h3 style="${u}${e.style}" class="${e.cssClasses}"
                id="${R(e.id)}"
                data-colspan="${R(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h3>
        `:Je.h4==s.container?n`
            <h4 style="${u}${e.style}" class="${e.cssClasses}"
                id="${R(e.id)}"
                data-colspan="${R(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h4>
        `:Je.h5==s.container?n`
            <h5 style="${u}${e.style}" class="${e.cssClasses}"
                id="${R(e.id)}"
                data-colspan="${R(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h5>
        `:Je.h6==s.container?n`
            <h6 style="${u}${e.style}" class="${e.cssClasses}"
                id="${R(e.id)}"
                data-colspan="${R(o)}"
                slot="${e.slot??d}">
                ${l??d}
            </h6>
        `:Je.p==s.container?n`
               <p style="${u}${e.style}" class="${e.cssClasses}"
                  id="${R(e.id)}"
                  data-colspan="${R(o)}"
                  slot="${e.slot??d}">
                   ${l??d}
               </p>
            `:Je.div==s.container?n`
               <div style="${u}${e.style}" class="${e.cssClasses}"
                    id="${R(e.id)}"
                    data-colspan="${R(o)}"
                    slot="${e.slot??d}">${l?ce(l):d}</div>
            `:Je.span==s.container?n`
               <span style="${u}${e.style}" class="${e.cssClasses}"
                     id="${R(e.id)}"
                     data-colspan="${R(o)}"
                    slot="${e.slot??d}">${l??d}</span>
            `:n`
               <p
                       id="${R(e.id)}"
                       data-colspan="${R(o)}"
                       slot="${e.slot??d}">
                   Unknown text container: ${s.container} 
               </p>
            `},mu=e=>{const t=e.metadata;return n`<a href="${t.url}" target="${t.target??d}"
                   rel="${t.target==="_blank"?"noopener":d}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}">${t.text}</a>`},mn=(e,t)=>{const a=e.toLowerCase().split("+");return t.ctrlKey===a.includes("ctrl")&&t.altKey===a.includes("alt")&&t.shiftKey===a.includes("shift")&&t.metaKey===a.includes("meta")},fu=(e,t)=>{if(!mn(e,t))return!1;const a=e.toLowerCase().split("+"),i=a[a.length-1];return!!(t.key.toLowerCase()===i||/^[a-z]$/.test(i)&&t.code==="Key"+i.toUpperCase()||/^[0-9]$/.test(i)&&(t.code==="Digit"+i||t.code==="Numpad"+i))},fn=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,vn=(e,t)=>{const a=e.currentTarget,i=a.dataset.route;if(i){Et(a,i);return}a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.dataset.actionId,parameters:t.parameters},bubbles:!0,composed:!0}))},bn=(e,t,a)=>{if(!e.route)return;const i=U(e.route,t,a);return!i||i.includes("${")?void 0:i},vu="display:inline-flex; align-items:center; justify-content:center; gap:.4em; box-sizing:border-box; font:inherit; font-weight:500; cursor:pointer; border-radius:var(--lumo-border-radius-m,6px); border:1px solid transparent; line-height:1; white-space:nowrap;",bu=e=>{const t=e.buttonStyle??"",a=e.color&&e.color!=="none"&&e.color!=="normal"?e.color:"",i=e.size,r=a==="success"?"var(--lumo-success-color,#1a7f37)":a==="error"?"var(--lumo-error-color,#c5221f)":a==="contrast"?"var(--lumo-contrast,#161513)":"var(--lumo-primary-color,#3b5bdb)",s=a==="success"?"var(--lumo-success-contrast-color,#fff)":a==="error"?"var(--lumo-error-contrast-color,#fff)":a==="contrast"?"var(--lumo-base-color,#fff)":"var(--lumo-primary-contrast-color,#fff)",o=a==="success"?"var(--lumo-success-text-color,#1a7f37)":a==="error"?"var(--lumo-error-text-color,#c5221f)":a==="contrast"?"var(--lumo-body-text-color,#161513)":"var(--lumo-primary-text-color,#3b5bdb)";let l;return t==="primary"?l=`background:${r}; color:${s};`:t==="tertiary"||t==="tertiaryInline"?l=`background:transparent; color:${o};`:l=`background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:${o}; border-color:var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,`${vu}${l}${i==="small"?"padding:.25rem .6rem; font-size:var(--lumo-font-size-s,.875rem);":i==="large"?"padding:.65rem 1.4rem; font-size:var(--lumo-font-size-l,1.125rem);":"padding:.45rem 1rem; font-size:var(--lumo-font-size-m,1rem);"}`},gu=(e,t,a)=>{const i=e.metadata,r=U(i.label,t,a);return n`<button
            id="${e.id}"
            data-action-id="${i.actionId}"
            data-route="${bn(i,t,a)??d}"
            @click="${s=>vn(s,i)}"
            style="${bu(i)}${e.style}"
            class="${e.cssClasses}"
            ?disabled="${i.disabled}"
            title="${i.shortcut?`${r} (${fn(i.shortcut)})`:d}"
            slot="${e.slot??d}"
    >${i.iconOnLeft?G(i.iconOnLeft):d}${r}${i.iconOnRight?G(i.iconOnRight):d}</button>`},yu="display:block; box-sizing:border-box; background:var(--lumo-base-color,#fff); border:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.1)); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-xs,0 1px 3px rgba(0,0,0,.08)); overflow:hidden;",$u=(e,t,a,i,r,s,o)=>{const l=t.metadata;if(!l)return n``;const c=p=>p?w(e,p,a,i,r,s,o,!1):d,u=l.header||l.headerPrefix||l.headerSuffix||l.title||l.subtitle;return n`
        <div id="${t.id??d}" style="${yu}${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
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
    `},wu=e=>{const t=e.metadata;return n`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??d}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},xu=e=>{const t=e.metadata;return G(t.icon,e.style,e.cssClasses,e.slot)},gr=(e,t)=>{e&&e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},gn="font:inherit; font-weight:500; cursor:pointer; padding:.45rem 1rem; border-radius:var(--lumo-border-radius-m,6px);",Us=`${gn} background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:var(--lumo-body-text-color,#161513); border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,ku=`${gn} background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff); border:1px solid transparent;`,_u=(e,t,a,i,r,s,o)=>{const l=t.metadata;let c=!1;if(l.openedCondition)try{c=ns(l.openedCondition,i,r,s,o)}catch(u){console.error("when evaluating "+l.openedCondition+" :"+u+", where data is "+r+" and state is "+i)}return c?n`
        <div class="mateu-confirm-dialog ${t.cssClasses??""}"
             style="position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.4); ${t.style??""}"
             slot="${t.slot??d}">
            <div style="background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-l,0 8px 24px rgba(0,0,0,.2)); width:100%; max-width:min(90vw,32rem); padding:1.5rem; box-sizing:border-box;">
                ${l.header?n`<h3 style="margin:0 0 .75rem; font-size:1.15rem;">${l.header}</h3>`:d}
                <div>${t.children?.map(u=>w(e,u,a,i,r,s,o))}</div>
                <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:1.25rem;">
                    ${l.canCancel?n`<button style="${Us}" @click="${u=>gr(u.currentTarget,l.cancelActionId)}">${l.rejectText&&!l.canReject?l.rejectText:"Cancel"}</button>`:d}
                    ${l.canReject?n`<button style="${Us}" @click="${u=>gr(u.currentTarget,l.rejectActionId)}">${l.rejectText||"No"}</button>`:d}
                    <button style="${ku}" @click="${u=>gr(u.currentTarget,l.confirmActionId)}">${l.confirmText||"OK"}</button>
                </div>
            </div>
        </div>
    `:n``},Cu=e=>{const t=e.metadata;let a;return t.position&&(a={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),n`
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
    `},Su=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`
        <details
                ?open="${l.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            <summary>${w(e,l.summary,a,i,r,s,o)}</summary>
            ${w(e,l.content,a,i,r,s,o)}
        </details>
            `},Eu=(e,t,a,i,r,s)=>n`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${i}"
            .appState="${r}"
            .appdata="${s}"
        ></mateu-dialog>
            `,Iu=(e,t,a,i,r,s)=>n`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${a}"
            .xdata="${i}"
            .appState="${r}"
            .appdata="${s}"
        ></mateu-drawer>
            `,Tu=e=>"mfe_"+[e.baseUrl,e.route,e.consumedRoute,e.serverSideType].map(t=>t??"").join("|").replace(/[^a-zA-Z0-9]/g,"_"),Pu=e=>{const t=e.metadata;return n`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"
                  route="${t.route}"
                  consumedRoute="${t.consumedRoute}"
                  id="${Tu(t)}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??d}"
        ></mateu-ux>
        </mateu-api-caller>
            `},Ou=e=>{const t=e.metadata;return n`
        <mateu-markdown .content=${t.markdown}
                        style="display:block; max-width: 72ch; ${e.style??""}" class="${e.cssClasses}"
                        slot="${e.slot??d}"></mateu-markdown>
            `},zu=e=>{const t=e.metadata;return n`
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
    `},Ru=(e,t={})=>{const a=e.metadata,i=a.valueKey?t[a.valueKey]:a.value,r=a.max&&a.max!=0?a.max:1,s=!a.indeterminate&&i!=null;return n`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            <progress
                    style="width:100%;"
                    max="${r}"
                    .value="${s?i:d}"
            ></progress>
            ${a.text?n`<span class="text-secondary text-xs" id="sublbl">
    ${a.text}
  </span>`:d}
        </div>
    `},Au=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`
        <details style="position: relative; ${t.style}" class="${t.cssClasses}" slot="${t.slot??d}">
            <summary style="list-style: none; cursor: pointer;">${w(e,l.wrapped,a,i,r,s,o)}</summary>
            <div style="position: absolute; z-index: 100; min-width: 300px; margin-top: .25rem; padding: .6rem .8rem;
                        border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px);
                        background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.2));">
                ${w(e,l.content,a,i,r,s,o)}
            </div>
        </details>
    `},Lu=e=>{const t=e.metadata;return n`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}"></mateu-map>
            `},Du=e=>{const t=e.metadata;return n`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??d}">
            `},Fu=e=>{const t=e.metadata;return n`<div style="display:flex; align-items:center; gap:0.5rem;" slot="${e.slot??d}">
        ${t.breadcrumbs.map(a=>n`
            <a href="${a.link}">${a.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </div>`},Mu=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${l.dots}" 
                ?nav = "${l.nav}" 
                ?loop = "${l.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>n`<div>${w(e,c,a,i,r,s,o)}</div>`)}
        </skeleton-carousel>
    `},Nu=(e,t,a,i)=>{const r=e.metadata;return n`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            ${r.menu.map(s=>yn(s))}
        </div>
            `},yn=e=>n`
        ${e.submenus?n`
                <details open>
                    <summary>${e.label}</summary>
                    <div style="display:flex; flex-direction:column; gap:0.25rem; padding-left:0.5rem;">
                        ${e.submenus.map(t=>yn(t))}
                    </div>
                </details>
            `:n`
                <a href="${e.path}">${e.label}</a>
        `}
        `,qu=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`<div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >${l.content?ce(l.content):d}${t.children?.map(c=>w(e,c,a,i,r,s,o))}</div>
    `},Bu=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return n`<div
                id="${t.id??d}"
                slot="${t.slot??d}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?n`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${c}</div>`:d}
        ${t.children?.map(u=>w(e,u,a,i,r,s,o))}
    </div>
    `},ju=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return n`
        <div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(u=>w(e,u,a,i,r,s,o))}</div>
    `},Uu=(e,t,a)=>{a.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:e,value:t},bubbles:!0,composed:!0}))},$i=e=>t=>{const a=t.target,i=a.type==="checkbox"?a.checked:a.value;Uu(e.fieldId,i,a)},Wu=(e,t)=>{const a=e.metadata,i=t?.[a.fieldId]??"",r=a,s=r.dataType,o=r.stereotype,l=!!r.readOnly,c=!!r.disabled,u=r.options,p=a.label?n`<label style="display:block; font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${a.label}</label>`:d,f="width:100%; box-sizing:border-box; padding:.4rem .6rem; border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.3)); border-radius: var(--lumo-border-radius-m,6px); font:inherit; background: var(--lumo-base-color,#fff); color: var(--lumo-body-text-color,#1a1a1a);";let m;return l||o==="plainText"?m=n`<div style="padding:.4rem 0;">${String(i??"")}</div>`:s==="boolean"||s==="bool"||o==="checkbox"||o==="badge"?m=n`<input type="checkbox" ?checked="${!!i}" ?disabled="${c}" @change="${$i(a)}">`:u&&u.length?m=n`
            <select style="${f}" ?disabled="${c}" @change="${$i(a)}">
                <option value="">—</option>
                ${u.map(b=>n`<option value="${b.value}" ?selected="${b.value===i}">${b.label}</option>`)}
            </select>`:o==="textarea"||o==="richText"||o==="html"?m=n`<textarea style="${f}" rows="3" ?disabled="${c}" @input="${$i(a)}">${String(i??"")}</textarea>`:m=n`<input type="${s==="integer"||s==="number"||s==="double"||s==="money"?"number":s==="date"?"date":s==="datetime"?"datetime-local":s==="time"?"time":o==="password"?"password":s==="email"?"email":"text"}" style="${f}" .value="${String(i??"")}"
                              placeholder="${r.placeholder??d}" ?disabled="${c}" @input="${$i(a)}">`,n`
        <div id="${e.id??d}" style="${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            ${p}
            ${m}
        </div>
    `},Ai="var(--mateu-fab-size, var(--lumo-size-l, 2.75rem))",$n="var(--mateu-fab-gap, var(--lumo-space-s, 0.5rem))",wn="var(--mateu-fab-inset-bottom, var(--mateu-fab-inset-block, var(--lumo-space-m, 1rem)))",xn="var(--mateu-fab-inset-end, var(--lumo-space-m, 1rem))",Hu=600,Vu=1200,ja={inset:1,size:2.75,gap:.5,toc:15,tocGap:2},Gu=e=>`calc(${wn} + ${e} * (${Ai} + ${$n}))`,Ku=e=>`calc(${wn} + (var(--mateu-fab-shell-slots, 0) + ${e}) * (${Ai} + ${$n}))`,kn=e=>`bottom: ${Gu(e)}; right: ${xn};`,Yu=e=>`bottom: ${Ku(e)}; right: ${xn};`,ms=e=>x`
    ${wi(e)} {
        position: fixed;
        box-sizing: border-box;
        width: ${Gs(Ai)};
        height: ${Gs(Ai)};
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
    ${wi(e)}:hover {
        background-image: linear-gradient(var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)), var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)));
    }
    ${wi(e)}:active {
        background-image: linear-gradient(var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)), var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)));
    }
    ${wi(e)}:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--lumo-base-color, #fff), 0 0 0 4px var(--lumo-primary-color-50pct, rgba(22, 118, 243, 0.5));
    }
`,Xa=new Map,Li=new Map,fs=new Set;let yr=!1;const Xu=()=>parseFloat(getComputedStyle(document.documentElement).fontSize||"16")||16,Nr=()=>{const e=document.documentElement.style,t=[...Xa.values()],a=t.filter(r=>r.kind==="shell").reduce((r,s)=>Math.max(r,s.slot+1),0),i=t.filter(r=>r.kind==="page").length;e.setProperty("--mateu-fab-shell-slots",String(a)),e.setProperty("--mateu-fab-slots",String(a+i))},Di=()=>{yr||(yr=!0,queueMicrotask(()=>{yr=!1,Nr(),fs.forEach(e=>e())}))},Ws=(e,t)=>{const a=Xa.get(e);a?.kind===t.kind&&a.slot===t.slot||(Xa.set(e,t),Di())},Hs=e=>{Xa.delete(e)&&Di()};class Ju extends Dl{constructor(t){if(super(t),t.type!==Fl.ELEMENT)throw new Error("onFabRail goes on the FAB element")}render(t,a){return d}update(t,[a,i]){return this.element&&this.element!==t.element&&Hs(this.element),this.element=t.element,this.entry={kind:a,slot:i??0},this.isConnected&&Ws(this.element,this.entry),d}disconnected(){this.element&&Hs(this.element)}reconnected(){this.element&&this.entry&&Ws(this.element,this.entry)}}const vs=Ll(Ju),Qu=(e,t)=>(Li.set(e,t),t(_n,Cn),Di(),()=>{Li.delete(e)&&Di()});let _n="column",Cn;const Vs=(e,t)=>{_n=e,Cn=t,Li.forEach(a=>a(e,t))},Zu=e=>{const{mode:t,viewportWidth:a,contentEnd:i,hasFabs:r,hasToc:s,rem:o}=e,l=ja.inset*o,c=(ja.size+ja.gap)*o;if(t==="edge")return{channel:0,toc:"bar",insetEnd:0,insetBottom:0};if(a<Hu)return{channel:0,toc:"bar",insetEnd:l};const u=s&&a>=Vu,p=Math.max(r?l+c:0,u?l+(ja.toc+ja.tocGap)*o:0),f=u?"aside":"bar";if(t==="full"){const $=p>0?Math.max(24,Math.round(p-(a-i))):void 0;return{channel:p,toc:f,insetEnd:l,padEnd:$}}const m=p>0?Math.max(0,Math.round(p-(a-(e.containerEnd??i)))):void 0,b=Math.max(c,p-l);return{channel:p,toc:f,insetEnd:Math.max(l,Math.round(a-i-b)),squeeze:m}},$a=new Map;let eh=0,se,Ja;const th=(e,t)=>{let a=t;for(;a;)if(a=a.parentNode??a.host??null,a===e)return!0;return!1},ah=()=>{const e=[...$a.values()].filter(a=>a.element.isConnected);return e.filter(a=>!e.some(i=>i!==a&&th(i.element,a.element))).sort((a,i)=>i.order-a.order)[0]?.element},qr=e=>{e.removeAttribute("data-aside"),e.style.removeProperty("--mateu-aside-squeeze"),e.style.removeProperty("--mateu-aside-pad-end")},Qt=()=>{const e=document.documentElement,t=ah();if(se&&se!==t&&(Ja?.unobserve(se),qr(se)),t&&t!==se&&Ja?.observe(t),se=t,!se){e.style.removeProperty("--mateu-fab-inset-end"),e.style.removeProperty("--mateu-fab-inset-bottom"),Nr(),Vs("column");return}const a=$a.get(se),i=Xu(),r=e.clientWidth||window.innerWidth,s=se.getBoundingClientRect().right,o=Zu({mode:a.mode,viewportWidth:r,contentEnd:s,containerEnd:s+(parseFloat(getComputedStyle(se).marginRight)||0),hasFabs:Xa.size>0,hasToc:Li.size>0,rem:i});o.channel>0?(se.setAttribute("data-aside",""),se.style.setProperty("--mateu-aside-squeeze",`${o.squeeze??0}px`),o.padEnd!==void 0?se.style.setProperty("--mateu-aside-pad-end",`${o.padEnd}px`):se.style.removeProperty("--mateu-aside-pad-end")):qr(se),e.style.setProperty("--mateu-fab-inset-end",`${o.insetEnd}px`),Nr(),o.insetBottom!==void 0?e.style.setProperty("--mateu-fab-inset-bottom",`${o.insetBottom}px`):e.style.removeProperty("--mateu-fab-inset-bottom"),Vs(o.toc,s-(parseFloat(getComputedStyle(se).paddingRight)||0))};let Fi=!1;const ih=()=>{Fi||(Fi=!0,Ja=typeof ResizeObserver<"u"?new ResizeObserver(()=>Qt()):void 0,window.addEventListener("resize",Qt),fs.add(Qt))},rh=()=>{Fi&&(Fi=!1,Ja?.disconnect(),Ja=void 0,window.removeEventListener("resize",Qt),fs.delete(Qt))},sh=(e,t)=>($a.set(e,{element:e,mode:t,order:++eh}),ih(),Qt(),()=>{$a.get(e)?.element===e&&($a.delete(e),qr(e),Qt(),$a.size===0&&rh())}),Gs=e=>Qr(e),wi=e=>Qr(e),oh=e=>{const t=e.metadata;if((t?.level??0)>0)return e;const a=c=>{if(c?.metadata?.type===v.EntityHeader)return c;const u=c?.metadata?.content,p=[...c?.children??[],...Array.isArray(u)?u:u?[u]:[]];for(const f of p){const m=a(f);if(m)return m}};let i;for(const c of e.children??[])if(i=a(c),i)break;if(!i)return e;const r=i.metadata;i.__hoistedToPageHeader=!0;const s=[...(r.facts??[]).filter(c=>c.label||c.value).map(c=>({title:c.label??"",text:c.value??""})),...r.metricLabel?[{title:r.metricLabel,text:r.metricValue??""}]:[]],o=(r.badges??[]).filter(c=>c.label).map(c=>({text:c.label,color:c.color})),l={...t,title:r.title||t.title,subtitle:r.subtitle??t.subtitle,kpis:[...t.kpis??[],...s],kpisBelow:!0,badges:[...t.badges??[],...o]};return{...e,metadata:l}},nh=e=>`width: 100%; box-sizing: border-box; ${e??""}`,Br=(e,t,a,i,r,s,o,l)=>{const c=oh(t),u=c.metadata,p=u?.fabs??[];return n`<mateu-page
            .component="${c}"
            baseUrl="${a}"
            .state="${i}"
            .data="${r}"
            .appState="${s}"
            .appdata="${o}"
            slot="${c.slot??d}"
            style="${nh(c.style)}"
            class="${c.cssClasses}"
            ?standalone="${l??!1}"
    >
        ${c.children?.map(f=>w(e,f,a,i,r,s,o))}
        ${u?.buttons?.map(f=>n`
                   ${w(e,{id:f.actionId,metadata:f,type:J.ClientSide,slot:"buttons"},void 0,i,r,s,o)}
`)}
        ${p.map((f,m)=>n`
            <button class="page-fab" style="${Yu(m)}" ${vs("page",m)} aria-label="${f.label}"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:f.actionId},bubbles:!0,composed:!0}))}"
                title="${f.label}">
                ${G(f.icon)}
            </button>
        `)}
</mateu-page>
    `},jr=(e,t,a,i,r,s,o,l)=>n`<mateu-table-crud
            id="${t.id}"
            baseUrl="${a}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${i}"
            .data="${r}"
            .appState="${s}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(c=>w(e,c,a,i,r,s,o))}
    </mateu-table-crud>`,lh=e=>{const t=e.metadata;return n`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},dh=(e,t,a)=>{const i=e.metadata;return n`<mateu-chat sseUrl="${i.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??d}"></mateu-chat>`},ch=e=>{const t=e.metadata;return n`
        <mateu-workflow
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},uh=e=>{const t=e.metadata;return n`
        <mateu-form-editor
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},Sn=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,hh=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",ph=e=>e=="up"?"▲":e=="down"?"▼":"",mh=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},fh=e=>{const t=e.metadata,a=!!t.actionId;return n`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${Sn} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${a?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??d}"
             role="${a?"button":d}"
             @click="${i=>mh(i,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?G(t.icon,"color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;"):d}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?n`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:d}
            </div>
            ${t.trend||t.trendLabel?n`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${hh(t.trend)};">
                    ${ph(t.trend)} ${t.trendLabel??d}
                </span>
            `:d}
            ${t.description?n`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:d}
        </div>
    `},vh=(e,t,a,i,r,s,o)=>n`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(l=>w(e,l,a,i,r,s,o))}
        </div>
    `,bh=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=l.colSpan&&l.colSpan>1?`grid-column: span ${l.colSpan};`:"",u=l.rowSpan&&l.rowSpan>1?`grid-row: span ${l.rowSpan};`:"",p=t.children??[];return p.length===1&&p[0].metadata?.type==="MetricCard"?n`
            <div style="min-width: 0; ${c} ${u} ${t.style??""}" slot="${t.slot??d}">
                ${w(e,p[0],a,i,r,s,o)}
            </div>`:n`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${Sn} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${u} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?n`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${l.title}</h3>
                    ${l.subtitle?n`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${l.subtitle}</span>`:d}
                </div>
            `:d}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(f=>w(e,f,a,i,r,s,o))}
            </div>
        </div>
    `},gh=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=l.columns&&l.columns>0?`repeat(${l.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return n`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(u=>w(e,u,a,i,r,s,o))}
        </div>
    `};var yh=Object.defineProperty,$h=Object.getOwnPropertyDescriptor,gt=(e,t,a,i)=>{for(var r=i>1?void 0:i?$h(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&yh(t,a,r),r};let Be=class extends _{constructor(){super(...arguments),this.panels=[],this.headerTitle="",this.badges=[],this.orientation="vertical",this.navigation=null,this.overviewEditActionId="",this.openPanels=new Set,this.expandedPanel=null,this._onPopState=()=>{const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),a=this.panels.findIndex((i,r)=>this.panelAnchor(i,r)===t);this.expandedPanel=a>=0?a:null}else this.expandedPanel=null},this.initialized=!1}navAction(e){e&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),window.addEventListener("popstate",this._onPopState)}disconnectedCallback(){window.removeEventListener("popstate",this._onPopState),super.disconnectedCallback()}willUpdate(){if(!this.initialized&&this.panels.length){this.openPanels=new Set(this.panels.map((t,a)=>t.open?a:-1).filter(t=>t>=0));const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(e.startsWith("expand=")){const t=e.slice(7),a=this.panels.findIndex((i,r)=>this.panelAnchor(i,r)===t);a>=0&&(this.expandedPanel=a)}else if(e){const t=this.panels.findIndex((a,i)=>this.panelAnchor(a,i)===e);t>=0&&this.openPanels.add(t)}this.initialized=!0}}firstUpdated(){const e=decodeURIComponent((location.hash||"").replace(/^#/,""));if(!e)return;const t=this.renderRoot.querySelector(`[data-anchor="${CSS.escape(e)}"]`);t&&t.scrollIntoView({block:"nearest"})}panelAnchor(e,t){return(e.title??"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`panel-${t}`}bookmarkPanel(e){const t=this.panelAnchor(this.panels[e],e);try{history.replaceState(history.state,"","#"+t)}catch{}}clearBookmark(e){const t=this.panelAnchor(this.panels[e],e);if(decodeURIComponent((location.hash||"").replace(/^#/,""))===t)try{history.replaceState(history.state,"",location.pathname+location.search)}catch{}}expandPanel(e,t){t?.stopPropagation(),this.expandedPanel=e;const a=this.panelAnchor(this.panels[e],e);try{history.pushState(history.state,"","#expand="+a)}catch{}}collapsePanel(){try{history.back()}catch{this.expandedPanel=null}}toggle(e){const t=new Set(this.openPanels);t.has(e)?(t.delete(e),this.clearBookmark(e)):(t.add(e),this.bookmarkPanel(e)),this.openPanels=t}render(){if(this.expandedPanel!=null&&this.panels[this.expandedPanel]){const t=this.panels[this.expandedPanel];return n`
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
                                            @click="${i=>this.expandPanel(a,i)}">⤢</button>
                                    <button class="fold" title="Fold" @click="${i=>{i.stopPropagation(),this.toggle(a)}}">⟨</button>
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
        `}};Be.styles=x`
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
    `;gt([h({type:Array})],Be.prototype,"panels",2);gt([h({type:String})],Be.prototype,"headerTitle",2);gt([h({type:Array})],Be.prototype,"badges",2);gt([h({type:String,reflect:!0})],Be.prototype,"orientation",2);gt([h({attribute:!1})],Be.prototype,"navigation",2);gt([h({type:String})],Be.prototype,"overviewEditActionId",2);gt([g()],Be.prototype,"openPanels",2);gt([g()],Be.prototype,"expandedPanel",2);Be=gt([k("mateu-foldout")],Be);const wh=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`
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
            ${t.children?.map(c=>w(e,c,a,i,r,s,o))}
        </mateu-foldout>
    `},xh=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=l.gridTemplateAreas,p=l.gridTemplateColumns&&l.gridTemplateColumns.trim().length?l.gridTemplateColumns:c&&c.trim().length?null:"repeat(auto-fit, minmax(min(100%, 16rem), 1fr))",f=l.gap??"var(--lumo-space-m, 1rem)",m=l.colSpans??[],b=l.stickyAreas??[],$=p?` grid-template-columns: ${p};`:"",y=c&&c.trim().length?` grid-template-areas: ${c};`:"",E=`display: grid;${$} gap: ${f}; align-items: start;${y} ${t.style??""}`,z=t.children?.map((I,T)=>{const O=w(e,I,a,i,r,s,o);if(c&&I.slot){const le=b.includes(I.slot)?" position: sticky; top: 1rem; align-self: start; height: fit-content;":"";return n`<div style="grid-area: ${I.slot}; min-width: 0;${le}">${O}</div>`}return dn(m[T],O)});if(!l.stackBelow)return n`
            <div class="mateu-responsive-grid ${t.cssClasses??""}"
                 style="${E}"
                 slot="${t.slot??d}"
            >${z}</div>
        `;const S=t.id??"mateu-grid";return n`
        <div style="container-type: inline-size;" slot="${t.slot??d}">
            <style>
                @container (max-width: ${l.stackBelow}) {
                    .mateu-responsive-grid[data-grid-id="${S}"] {
                        grid-template-columns: 1fr !important;
                        /* a named-slot template names N columns per row; on one track that would be a
                           mismatch (and void the areas) — drop the areas so the slots stack in order. */
                        grid-template-areas: none !important;
                    }
                }
            </style>
            <div class="mateu-responsive-grid ${t.cssClasses??""}"
                 data-grid-id="${S}"
                 style="${E}"
            >${z}</div>
        </div>
    `},kh=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=t.children??[],u=I=>c.filter(T=>(T.slot??"").startsWith(I)),p=u("main-"),f=u("aside-"),m=u("footer-"),b=l.asideWidth&&l.asideWidth.trim()?l.asideWidth:"32%",$=l.asidePosition==="start",y=l.asideSticky!==!1,E=I=>I.map(T=>w(e,T,a,i,r,s,o)),z=n`
        <div class="mateu-content-main"
             style="flex: 1 1 0; min-width: min(20rem, 100%); box-sizing: border-box;">
            ${E(p)}
        </div>`,S=f.length?n`
        <div class="mateu-content-aside"
             style="flex: 0 1 calc(${b} - var(--lumo-space-m, 1rem)); min-width: min(18rem, 100%); box-sizing: border-box; ${y?"position: sticky; top: 1rem; align-self: flex-start;":""}">
            ${E(f)}
        </div>`:d;return n`
        <div class="mateu-content-layout ${t.cssClasses??""}"
             style="${t.style??""}"
             slot="${t.slot??d}">
            <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); align-items: flex-start;">
                ${$?[S,z]:[z,S]}
            </div>
            ${m.length?n`
                <div class="mateu-content-footer"
                     style="flex-basis: 100%; margin-top: var(--lumo-space-m, 1rem);">
                    ${E(m)}
                </div>`:d}
        </div>
    `},_h=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=!!l.image,u=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${l.image}'); background-size: cover; background-position: center; color: #fff;`:"",p=l.centered===!1?"flex-start":"center",f=l.centered===!1?"left":"center";return n`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${p}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${f}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); margin-top: var(--mateu-hero-margin-top, var(--lumo-space-l, 1.5rem)); min-height: ${l.height??"12rem"}; box-sizing: border-box; ${u} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?n`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${l.title}</h1>`:d}
            ${l.subtitle?n`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${l.subtitle}</p>`:d}
            ${t.children?.length?n`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${p}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(m=>w(e,m,a,i,r,s,o))}
                </div>
            `:d}
        </div>
    `},X=e=>t=>{if(t.key==="Enter"){e(t);return}(t.key===" "||t.key==="Spacebar")&&(t.preventDefault(),e(t))},ae=x`
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
`;var Ch=Object.defineProperty,Sh=Object.getOwnPropertyDescriptor,bs=(e,t,a,i)=>{for(var r=i>1?void 0:i?Sh(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Ch(t,a,r),r};const $r=1440*60*1e3;let Qa=class extends _{constructor(){super(...arguments),this.tasks=[],this.onTaskSelectionActionId=""}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-$r,max:Math.max(...e)+2*$r}:null}months(e,t){const a=[],i=new Date(e);for(i.setDate(1);i.getTime()<=t;){const r=Math.max(i.getTime(),e),s=new Date(i.getFullYear(),i.getMonth()+1,1),o=Math.min(s.getTime(),t);a.push({label:i.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:r,to:o}),i.setMonth(i.getMonth()+1)}return a}render(){const e=this.range();if(!e)return n``;const t=e.max-e.min,a=r=>(r-e.min)/t*100,i=Date.now();return n`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(r=>n`
                        <div class="month" style="width: ${(r.to-r.from)/t*100}%;">${r.label}</div>
                    `)}
                </div>
                ${this.tasks.map(r=>{const s=new Date(r.start+"T00:00:00").getTime(),o=new Date(r.end+"T00:00:00").getTime()+$r;return n`
                        <div class="label" title="${r.title}">${r.title}</div>
                        <div class="lane">
                            ${i>=e.min&&i<=e.max?n`<div class="today" style="left: ${a(i)}%;"></div>`:d}
                            <div role="button" tabindex="0"
                                 aria-label="${r.title}, ${r.start} to ${r.end}${r.progress?`, ${r.progress}% complete`:""}"
                                 class="bar ${this.onTaskSelectionActionId?"clickable":""}"
                                 title="${r.title} · ${r.start} → ${r.end}${r.progress?` · ${r.progress}%`:""}"
                                 @click="${()=>this.selectTask(r)}" @keydown="${X(()=>this.selectTask(r))}"
                                 style="left: ${a(s)}%; width: ${(o-s)/t*100}%; ${r.color?`--mateu-gantt-fill: ${r.color};`:""}">
                                <div class="fill" style="width: ${r.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};Qa.styles=x`
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
    
        ${ae}
    `;bs([h({type:Array})],Qa.prototype,"tasks",2);bs([h()],Qa.prototype,"onTaskSelectionActionId",2);Qa=bs([k("mateu-gantt")],Qa);const Eh=e=>{const t=e.metadata;return n`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                .onTaskSelectionActionId="${t.onTaskSelectionActionId??""}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-gantt>
    `};var Ih=Object.defineProperty,Th=Object.getOwnPropertyDescriptor,Dt=(e,t,a,i)=>{for(var r=i>1?void 0:i?Th(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Ih(t,a,r),r};let B=class extends _{constructor(){super(...arguments),this.resources=[],this.blocks=[],this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key==="Escape"&&this.drag&&(e.stopPropagation(),this.endDrag())}}static parse(e){return new Date(e+"T00:00:00")}static iso(e){const t=a=>String(a).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){const i=B.parse(this.from),r=B.daysBetween(i,B.parse(this.to))+1;return r>0?{from:i,days:r}:null}const e=this.blocks.flatMap(i=>[i.start,i.end]).filter(i=>!!i).map(i=>B.parse(i));if(!e.length)return null;const t=new Date(Math.min(...e.map(i=>i.getTime()))),a=new Date(Math.max(...e.map(i=>i.getTime())));return{from:t,days:B.daysBetween(t,a)+1}}onBlockPointerDown(e,t,a){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;const s=B.parse(t.start),o=B.parse(t.end),l=Math.max(1,B.daysBetween(s,o)+1);this.laneRects=[...this.renderRoot.querySelectorAll(".lane[data-resource-id]")].map(u=>({resourceId:u.dataset.resourceId,rect:u.getBoundingClientRect()}));const c=this.dayAt(t.resourceId,e.clientX)??a;this.drag={blockId:t.id,duration:l,grabOffsetDays:c-a,originResourceId:t.resourceId,originStartIdx:a,targetResourceId:t.resourceId,targetStartIdx:a,moved:!1},window.addEventListener("keydown",this.onDragKeydown)}dayAt(e,t){const a=this.laneRects.find(s=>s.resourceId===e),i=this.window();if(!a||!i||a.rect.width===0)return null;const r=Math.floor((t-a.rect.left)/a.rect.width*i.days);return Math.max(0,Math.min(i.days-1,r))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;const t=this.window();if(!t)return;const a=this.laneRects.find(s=>e.clientY>=s.rect.top&&e.clientY<=s.rect.bottom)??this.laneRects.find(s=>s.resourceId===this.drag.targetResourceId);if(!a)return;const i=this.dayAt(a.resourceId,e.clientX);if(i==null)return;const r=Math.max(0,Math.min(t.days-this.drag.duration,i-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:a.resourceId,targetStartIdx:r}}onBlockPointerUp(e){const t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;const a=this.window();if(!a)return;const i=B.addDays(a.from,t.targetStartIdx),r=B.addDays(i,t.duration-1);this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:B.iso(i),_end:B.iso(r)}},bubbles:!0,composed:!0}))}endDrag(){this.drag=null,window.removeEventListener("keydown",this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.onDragKeydown)}render(){const e=this.window();if(!e||!this.resources.length)return n``;const t=[...Array(e.days).keys()].map(l=>B.addDays(e.from,l)),a=new Date,i=B.daysBetween(e.from,new Date(a.getFullYear(),a.getMonth(),a.getDate())),r=i>=0&&i<e.days,s=[];let o;return this.resources.forEach(l=>{l.group&&l.group!==o&&s.push(n`<div class="group">${l.group}</div>`),o=l.group,s.push(this.renderRow(l,e,t,r?i:null))}),n`
            <div class="frame" style="grid-template-columns: minmax(8rem, 12rem) repeat(${e.days}, minmax(2.2rem, 1fr));">
                <div class="corner">Resource</div>
                ${t.map((l,c)=>n`
                    <div class="day-head ${this.isWeekend(l)?"weekend":""} ${c===i?"today":""}">
                        <span class="dow">${l.toLocaleDateString(void 0,{weekday:"short"})}</span>
                        <span class="num">${l.getDate()}</span>
                    </div>
                `)}
                ${s}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(e,t,a,i){const r=100/t.days,s=this.blocks.filter(l=>l.resourceId===e.id&&l.start&&l.end),o=this.drag?.moved&&this.drag.targetResourceId===e.id?this.drag:null;return n`
            <div class="label" title="${e.label??""}">${e.label}</div>
            <div class="lane" data-resource-id="${e.id}">
                <div class="cells">
                    ${a.map(l=>n`<div class="cell ${this.isWeekend(l)?"weekend":""}"></div>`)}
                </div>
                ${i!=null?n`<div class="today-line" style="left: ${(i+.5)*r}%;"></div>`:d}
                ${s.map(l=>{const c=B.daysBetween(t.from,B.parse(l.start)),u=B.daysBetween(t.from,B.parse(l.end));if(u<0||c>=t.days)return d;const p=Math.max(0,c),f=Math.min(t.days-1,u),m=this.drag?.moved&&this.drag.blockId===l.id;return n`
                        <div class="block ${this.selectActionId?"clickable":""} ${this.moveActionId?"draggable":""} ${m?"dragging":""}"
                             title="${l.label??""} · ${l.start} → ${l.end}${l.status?` · ${l.status}`:""}"
                             style="left: ${p*r}%; width: ${(f-p+1)*r}%; ${l.color?`--mateu-planning-block: ${l.color};`:""}"
                             @pointerdown="${b=>this.onBlockPointerDown(b,l,c)}"
                             @pointermove="${b=>this.onBlockPointerMove(b)}"
                             @pointerup="${()=>this.onBlockPointerUp(l)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${l.label}</div>
                    `})}
                ${o?n`
                    <div class="ghost"
                         style="left: ${o.targetStartIdx*r}%; width: ${Math.min(o.duration,t.days-o.targetStartIdx)*r}%;"></div>
                `:d}
            </div>
        `}};B.styles=x`
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
    `;Dt([h({type:Array})],B.prototype,"resources",2);Dt([h({type:Array})],B.prototype,"blocks",2);Dt([h()],B.prototype,"from",2);Dt([h()],B.prototype,"to",2);Dt([h()],B.prototype,"moveActionId",2);Dt([h()],B.prototype,"selectActionId",2);Dt([g()],B.prototype,"drag",2);B=Dt([k("mateu-planning-board")],B);const Ph=e=>{const t=e.metadata;return n`
        <mateu-planning-board
                .resources="${t.resources??[]}"
                .blocks="${t.blocks??[]}"
                .from="${t.from}"
                .to="${t.to}"
                .moveActionId="${t.moveActionId}"
                .selectActionId="${t.selectActionId}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-planning-board>
    `};var Oh=Object.defineProperty,zh=Object.getOwnPropertyDescriptor,En=(e,t,a,i)=>{for(var r=i>1?void 0:i?zh(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Oh(t,a,r),r};let Mi=class extends _{constructor(){super(...arguments),this.columns=[]}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return n`
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
                                 @click="${()=>this.clickCard(t)}" @keydown="${X(()=>this.clickCard(t))}">
                                <span class="card-title">${t.title}</span>
                                ${t.description?n`<span class="card-desc">${t.description}</span>`:d}
                                ${t.badge?n`<span class="badge">${t.badge}</span>`:d}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};Mi.styles=x`
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
    
        ${ae}
    `;En([h({type:Array})],Mi.prototype,"columns",2);Mi=En([k("mateu-kanban")],Mi);const Rh=e=>{const t=e.metadata;return n`
        <mateu-kanban
                .columns="${t.columns??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-kanban>
    `};var Ah=Object.defineProperty,Lh=Object.getOwnPropertyDescriptor,In=(e,t,a,i)=>{for(var r=i>1?void 0:i?Lh(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Ah(t,a,r),r};let Ni=class extends _{constructor(){super(...arguments),this.items=[]}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return n`
            <div class="feed">
                ${this.items.map(e=>n`
                    <div class="item ${e.actionId?"clickable":""}">
                        <div class="rail">
                            <div class="dot" style="${e.color?`--mateu-timeline-dot: ${e.color};`:""}">${e.icon??""}</div>
                            <div class="line"></div>
                        </div>
                        <div role="button" tabindex="0" class="body" @click="${()=>this.clickItem(e)}" @keydown="${X(()=>this.clickItem(e))}">
                            <div class="head">
                                <span class="title">${e.title}</span>
                                ${e.timestamp?n`<span class="time">${e.timestamp}</span>`:d}
                            </div>
                            ${e.description?n`<div class="desc">${e.description}</div>`:d}
                        </div>
                    </div>
                `)}
            </div>
        `}};Ni.styles=x`
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
    
        ${ae}
    `;In([h({type:Array})],Ni.prototype,"items",2);Ni=In([k("mateu-timeline")],Ni);const Dh=e=>{const t=e.metadata;return n`
        <mateu-timeline
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-timeline>
    `};var Fh=Object.defineProperty,Mh=Object.getOwnPropertyDescriptor,gs=(e,t,a,i)=>{for(var r=i>1?void 0:i?Mh(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Fh(t,a,r),r};let Za=class extends _{constructor(){super(...arguments),this.steps=[],this.vertical=!1}updated(){const e=this.steps.length;if(e===0)return;const t=this.steps.findIndex(r=>r.status==="current"),a=this.steps.every(r=>r.status==="done"),i=t>=0?t+1:a?e:0;this.dispatchEvent(new CustomEvent("mateu-guided-progress",{detail:{current:i,total:e,steps:this.steps.map(r=>({id:r.id,title:r.title,status:r.status??"upcoming"}))},bubbles:!0,composed:!0}))}render(){return n`
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
        `}};Za.styles=x`
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
    `;gs([h({type:Array})],Za.prototype,"steps",2);gs([h({type:Boolean,reflect:!0})],Za.prototype,"vertical",2);Za=gs([k("mateu-progress-steps")],Za);const Nh=e=>{const t=e.metadata;return n`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                ?vertical="${t.vertical??!1}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-progress-steps>
    `};var qh=Object.defineProperty,Bh=Object.getOwnPropertyDescriptor,Ft=(e,t,a,i)=>{for(var r=i>1?void 0:i?Bh(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&qh(t,a,r),r};let at=class extends _{constructor(){super(...arguments),this.spark=[]}sparkline(){const e=this.spark;if(!e||e.length<2)return d;const t=84,a=30,i=2,r=Math.min(...e),o=Math.max(...e)-r||1,l=(t-i*2)/(e.length-1),c=e.map((m,b)=>{const $=i+b*l,y=i+(a-i*2)*(1-(m-r)/o);return[$,y]}),u=c.map(([m,b],$)=>`${$===0?"M":"L"}${m.toFixed(1)} ${b.toFixed(1)}`).join(" "),p=`${u} L${c[c.length-1][0].toFixed(1)} ${a} L${c[0][0].toFixed(1)} ${a} Z`,f=this.trend==="down"?"var(--lumo-error-color, #e11d48)":this.trend==="flat"?"var(--lumo-secondary-text-color, #888)":"var(--lumo-success-color, #12b76a)";return ue`
            <svg width="${t}" height="${a}" viewBox="0 0 ${t} ${a}">
                <path d="${p}" fill="${f}" opacity="0.12"></path>
                <path d="${u}" fill="none" stroke="${f}" stroke-width="1.6"
                      stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>
        `}dispatchAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=this.trend??"up";return n`
            <div role="button" tabindex="0" class="tile ${this.actionId?"clickable":""}" @click="${()=>this.dispatchAction()}" @keydown="${X(()=>this.dispatchAction())}">
                ${this.label?n`<span class="label">${this.label}</span>`:d}
                <span class="value">${this.value}${this.unit?n`<span class="unit">${this.unit}</span>`:d}</span>
                <div class="foot">
                    ${this.delta?n`<span class="delta ${e}">${e==="up"?"▲":e==="down"?"▼":"→"} ${this.delta}</span>`:n`<span></span>`}
                    ${this.sparkline()}
                </div>
            </div>
        `}};at.styles=x`
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
    
        ${ae}
    `;Ft([h()],at.prototype,"label",2);Ft([h()],at.prototype,"value",2);Ft([h()],at.prototype,"unit",2);Ft([h()],at.prototype,"delta",2);Ft([h()],at.prototype,"trend",2);Ft([h({type:Array})],at.prototype,"spark",2);Ft([h()],at.prototype,"actionId",2);at=Ft([k("mateu-stat")],at);const jh=e=>{const t=e.metadata;return n`
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
    `};var Uh=Object.defineProperty,Wh=Object.getOwnPropertyDescriptor,ys=(e,t,a,i)=>{for(var r=i>1?void 0:i?Wh(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Uh(t,a,r),r};let ei=class extends _{constructor(){super(...arguments),this.events=[]}clickEvent(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}render(){const e=this.month?new Date(this.month+"T00:00:00"):new Date,t=e.getFullYear(),a=e.getMonth(),i=new Date(t,a,1),r=(i.getDay()+6)%7,s=new Date(t,a+1,0).getDate(),o=new Date,l=m=>o.getFullYear()===t&&o.getMonth()===a&&o.getDate()===m,c={};for(const m of this.events){if(!m.date)continue;const b=new Date(m.date+"T00:00:00");b.getFullYear()===t&&b.getMonth()===a&&(c[b.getDate()]??=[]).push(m)}const u=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],p=[];for(let m=0;m<r;m++)p.push(n`<div class="cell blank"></div>`);for(let m=1;m<=s;m++)p.push(n`
                <div class="cell ${l(m)?"today":""}">
                    <span class="num">${m}</span>
                    ${(c[m]??[]).map(b=>n`
                        <span role="button" tabindex="0" class="chip ${b.actionId?"clickable":""}"
                              style="${b.color?`--mateu-cal-accent: ${b.color};`:""}"
                              title="${b.title??""}"
                              @click="${()=>this.clickEvent(b)}" @keydown="${X(()=>this.clickEvent(b))}">${b.title}</span>
                    `)}
                </div>
            `);const f=i.toLocaleDateString(void 0,{month:"long",year:"numeric"});return n`
            <div class="title">${f}</div>
            <div class="grid">
                ${u.map(m=>n`<div class="dow">${m}</div>`)}
                ${p}
            </div>
        `}};ei.styles=x`
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
    
        ${ae}
    `;ys([h()],ei.prototype,"month",2);ys([h({type:Array})],ei.prototype,"events",2);ei=ys([k("mateu-calendar")],ei);const Hh=e=>{const t=e.metadata;return n`
        <mateu-calendar
                month="${t.month??d}"
                .events="${t.events??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-calendar>
    `};var Vh=Object.defineProperty,Gh=Object.getOwnPropertyDescriptor,Tn=(e,t,a,i)=>{for(var r=i>1?void 0:i?Gh(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Vh(t,a,r),r};let qi=class extends _{constructor(){super(...arguments),this.plans=[]}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return n`
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
        `}};qi.styles=x`
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
    `;Tn([h({type:Array})],qi.prototype,"plans",2);qi=Tn([k("mateu-pricing-table")],qi);const Kh=e=>{const t=e.metadata;return n`
        <mateu-pricing-table
                .plans="${t.plans??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-pricing-table>
    `};var Yh=Object.defineProperty,Xh=Object.getOwnPropertyDescriptor,Pn=(e,t,a,i)=>{for(var r=i>1?void 0:i?Xh(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Yh(t,a,r),r};let Bi=class extends _{clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){const t=e.avatar,a=t&&(t.startsWith("http")||t.startsWith("data:"));return n`
            <li>
                <div role="button" tabindex="0" class="node ${e.actionId?"clickable":""}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:""}"
                     @click="${()=>this.clickNode(e)}" @keydown="${X(()=>this.clickNode(e))}">
                    ${t?n`<span class="avatar">${a?n`<img src="${t}" alt="">`:t}</span>`:d}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?n`<span class="subtitle">${e.subtitle}</span>`:d}
                </div>
                ${e.children&&e.children.length?n`<ul>${e.children.map(i=>this.renderNode(i))}</ul>`:d}
            </li>
        `}render(){return this.root?n`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:n``}};Bi.styles=x`
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
    
        ${ae}
    `;Pn([h({attribute:!1})],Bi.prototype,"root",2);Bi=Pn([k("mateu-org-chart")],Bi);const Jh=e=>{const t=e.metadata;return n`
        <mateu-org-chart
                .root="${t.root}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-org-chart>
    `};var Qh=Object.defineProperty,Zh=Object.getOwnPropertyDescriptor,On=(e,t,a,i)=>{for(var r=i>1?void 0:i?Zh(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Qh(t,a,r),r};const ep=1440*60*1e3;let ji=class extends _{constructor(){super(...arguments),this.cells=[]}color(e,t){if(e<=0||t<=0)return"var(--lumo-contrast-10pct, #ebedf0)";const a=e/t,i=a>.75?1:a>.5?.75:a>.25?.5:.3;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round(i*100)}%, transparent)`}render(){const e=this.cells.filter(c=>!!c.date);if(!e.length)return n``;const t=e.map(c=>new Date(c.date+"T00:00:00").getTime()),a=Math.min(...t),i=Math.max(...t),r=new Date(a);r.setDate(r.getDate()-(r.getDay()+6)%7);const s={};for(const c of e)s[c.date]=c;const o=Math.max(...e.map(c=>c.value??0),1),l=[];for(let c=r.getTime();c<=i;c+=ep){const u=new Date(c),p=u.toISOString().slice(0,10),f=s[p],m=f?.value??0,b=(u.getDay()+6)%7+1,$=f?.label??`${p}: ${m}`;l.push(n`
                <div class="cell" style="grid-row: ${b}; --cell: ${this.color(m,o)};" title="${$}"></div>
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
        `}};ji.styles=x`
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
    `;On([h({type:Array})],ji.prototype,"cells",2);ji=On([k("mateu-heatmap")],ji);const tp=e=>{const t=e.metadata;return n`
        <mateu-heatmap
                .cells="${t.cells??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-heatmap>
    `};var ap=Object.defineProperty,ip=Object.getOwnPropertyDescriptor,zn=(e,t,a,i)=>{for(var r=i>1?void 0:i?ip(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&ap(t,a,r),r};let Ui=class extends _{constructor(){super(...arguments),this.stages=[]}render(){const e=this.stages;if(!e.length)return n``;const t=e[0].value??0,a=Math.max(...e.map(i=>i.value??0),1);return n`
            <div class="funnel">
                ${e.map((i,r)=>{const s=i.value??0,o=a>0?Math.max(6,s/a*100):6,l=r>0?e[r-1].value??0:t,c=r===0?t>0?"100%":"":l>0?`${Math.round(s/l*100)}%`:"0%";return n`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${i.label}</span>
                                ${r>0?n`<span class="conv">${c} of previous</span>`:d}
                            </div>
                            <div class="bar" style="width: ${o}%; ${i.color?`--bar: ${i.color};`:""}">
                                ${s.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};Ui.styles=x`
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
    `;zn([h({type:Array})],Ui.prototype,"stages",2);Ui=zn([k("mateu-funnel")],Ui);const rp=e=>{const t=e.metadata;return n`
        <mateu-funnel
                .stages="${t.stages??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-funnel>
    `};var sp=Object.defineProperty,op=Object.getOwnPropertyDescriptor,Aa=(e,t,a,i)=>{for(var r=i>1?void 0:i?op(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&sp(t,a,r),r};let It=class extends _{constructor(){super(...arguments),this.values=[],this.labels=[],this.area=!1}render(){const e=this.values;if(!e||e.length<2)return n``;const t=600,a=160,i=8,r=Math.min(...e),s=Math.max(...e),o=s-r||1,l=(t-i*2)/(e.length-1),c=e.map(($,y)=>{const E=i+y*l,z=i+(a-i*2)*(1-($-r)/o);return[E,z]}),u=c.map(([$,y],E)=>`${E===0?"M":"L"}${$.toFixed(1)} ${y.toFixed(1)}`).join(" "),p=`${u} L${c[c.length-1][0].toFixed(1)} ${a-i} L${c[0][0].toFixed(1)} ${a-i} Z`,f=this.color||"var(--lumo-primary-color, #1a73e8)",m=e.indexOf(s),b=e.indexOf(r);return n`
            ${this.heading?n`<div class="title">${this.heading}</div>`:d}
            <svg viewBox="0 0 ${t} ${a}" preserveAspectRatio="none">
                ${this.area?ue`<path d="${p}" fill="${f}" opacity="0.12"></path>`:d}
                <path d="${u}" fill="none" stroke="${f}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${c.map(($,y)=>y===m||y===b?ue`<circle cx="${$[0]}" cy="${$[1]}" r="3.2" fill="${f}"><title>${this.labels[y]??""}: ${e[y]}</title></circle>`:ue`<circle cx="${$[0]}" cy="${$[1]}" r="6" fill="transparent"><title>${this.labels[y]??""}: ${e[y]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?n`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:d}
        `}};It.styles=x`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `;Aa([h()],It.prototype,"heading",2);Aa([h({type:Array})],It.prototype,"values",2);Aa([h({type:Array})],It.prototype,"labels",2);Aa([h()],It.prototype,"color",2);Aa([h({type:Boolean})],It.prototype,"area",2);It=Aa([k("mateu-trend-chart")],It);const np=e=>{const t=e.metadata;return n`
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
    `};var lp=Object.defineProperty,dp=Object.getOwnPropertyDescriptor,$s=(e,t,a,i)=>{for(var r=i>1?void 0:i?dp(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&lp(t,a,r),r};let ti=class extends _{constructor(){super(...arguments),this.features=[],this.columns=0}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){const e=this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(15rem, 1fr))";return n`
            <div class="grid" style="grid-template-columns: ${e};">
                ${this.features.map(t=>n`
                    <div role="button" tabindex="0" class="card ${t.actionId?"clickable":""}" @click="${()=>this.clickFeature(t)}" @keydown="${X(()=>this.clickFeature(t))}">
                        ${t.icon?n`<span class="icon">${t.icon}</span>`:d}
                        <span class="title">${t.title}</span>
                        ${t.description?n`<span class="desc">${t.description}</span>`:d}
                    </div>
                `)}
            </div>
        `}};ti.styles=x`
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
    
        ${ae}
    `;$s([h({type:Array})],ti.prototype,"features",2);$s([h({type:Number})],ti.prototype,"columns",2);ti=$s([k("mateu-feature-grid")],ti);const cp=e=>{const t=e.metadata;return n`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-feature-grid>
    `};var up=Object.defineProperty,hp=Object.getOwnPropertyDescriptor,Rn=(e,t,a,i)=>{for(var r=i>1?void 0:i?hp(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&up(t,a,r),r};let Wi=class extends _{constructor(){super(...arguments),this.items=[]}stars(e){const t=Math.max(0,Math.min(5,e||0));return"★".repeat(t)+"☆".repeat(5-t)}render(){return n`
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
        `}};Wi.styles=x`
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
    `;Rn([h({type:Array})],Wi.prototype,"items",2);Wi=Rn([k("mateu-testimonials")],Wi);const pp=e=>{const t=e.metadata;return n`
        <mateu-testimonials
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-testimonials>
    `};var mp=Object.defineProperty,fp=Object.getOwnPropertyDescriptor,ws=(e,t,a,i)=>{for(var r=i>1?void 0:i?fp(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&mp(t,a,r),r};let ai=class extends _{constructor(){super(...arguments),this.items=[],this.openSet=new Set,this.seeded=!1}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),n`
            <div class="list">
                ${this.items.map((e,t)=>{const a=this.openSet.has(t);return n`
                        <div class="item ${a?"open":""}">
                            <div role="button" tabindex="0" aria-expanded="${a}" class="q" @click="${()=>this.toggle(t)}" @keydown="${X(()=>this.toggle(t))}">
                                <span>${e.question}</span>
                                <span class="chevron">›</span>
                            </div>
                            ${a?n`<div class="a">${e.answer}</div>`:""}
                        </div>
                    `})}
            </div>
        `}};ai.styles=x`
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
    
        ${ae}
    `;ws([h({type:Array})],ai.prototype,"items",2);ws([g()],ai.prototype,"openSet",2);ai=ws([k("mateu-faq")],ai);const vp=e=>{const t=e.metadata;return n`
        <mateu-faq
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-faq>
    `};var bp=Object.defineProperty,gp=Object.getOwnPropertyDescriptor,ua=(e,t,a,i)=>{for(var r=i>1?void 0:i?gp(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&bp(t,a,r),r};let mt=class extends _{themeVars(){switch(this.theme){case"success":return"--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));";case"warning":return"--accent: #f59e0b; --bg: rgba(245,158,11,.12);";case"danger":return"--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));";default:return"--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));"}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return n`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?n`<span class="icon">${this.icon}</span>`:d}
                <div class="body">
                    ${this.heading?n`<span class="heading">${this.heading}</span>`:d}
                    ${this.description?n`<span class="desc">${this.description}</span>`:d}
                    ${this.ctaLabel?n`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:d}
                </div>
            </div>
        `}};mt.styles=x`
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
    `;ua([h()],mt.prototype,"heading",2);ua([h()],mt.prototype,"description",2);ua([h()],mt.prototype,"icon",2);ua([h()],mt.prototype,"ctaLabel",2);ua([h()],mt.prototype,"actionId",2);ua([h()],mt.prototype,"theme",2);mt=ua([k("mateu-callout-card")],mt);const yp=e=>{const t=e.metadata;return n`
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
    `};var $p=Object.defineProperty,wp=Object.getOwnPropertyDescriptor,An=(e,t,a,i)=>{for(var r=i>1?void 0:i?wp(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&$p(t,a,r),r};let Hi=class extends _{constructor(){super(...arguments),this.comments=[]}renderComment(e){const t=e.avatar&&(e.avatar.startsWith("http")||e.avatar.startsWith("data:"));return n`
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
        `}render(){return n`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};Hi.styles=x`
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
    `;An([h({type:Array})],Hi.prototype,"comments",2);Hi=An([k("mateu-comment-thread")],Hi);const xp=e=>{const t=e.metadata;return n`
        <mateu-comment-thread
                .comments="${t.comments??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-comment-thread>
    `};var kp=Object.defineProperty,_p=Object.getOwnPropertyDescriptor,Ln=(e,t,a,i)=>{for(var r=i>1?void 0:i?_p(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&kp(t,a,r),r};const Cp={pdf:"📕",image:"🖼️",img:"🖼️",doc:"📘",docx:"📘",word:"📘",xls:"📗",xlsx:"📗",excel:"📗",sheet:"📗",zip:"🗜️",archive:"🗜️",video:"🎬",audio:"🎵",code:"💻",csv:"📄",txt:"📄"};let Vi=class extends _{constructor(){super(...arguments),this.files=[]}icon(e){return e&&Cp[e.toLowerCase()]||"📄"}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return n`
            <div class="list">
                ${this.files.map(e=>{const t=!!e.url||!!e.actionId,a=n`
                        <span class="icon">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?n`<span class="size">${e.size}</span>`:d}
                        ${e.url?n`<span class="dl">⬇</span>`:d}
                    `;return e.url?n`<a class="file clickable" href="${e.url}" download target="_blank" rel="noopener">${a}</a>`:n`<div role="button" tabindex="0" class="file ${t?"clickable":""}" @click="${i=>this.clickFile(e,i)}" @keydown="${X(i=>this.clickFile(e,i))}">${a}</div>`})}
            </div>
        `}};Vi.styles=x`
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
    
        ${ae}
    `;Ln([h({type:Array})],Vi.prototype,"files",2);Vi=Ln([k("mateu-file-list")],Vi);const Sp=e=>{const t=e.metadata;return n`
        <mateu-file-list
                .files="${t.files??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-file-list>
    `};var Ep=Object.defineProperty,Ip=Object.getOwnPropertyDescriptor,or=(e,t,a,i)=>{for(var r=i>1?void 0:i?Ip(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Ep(t,a,r),r};let Ea=class extends _{constructor(){super(...arguments),this.items=[],this.localDone=new Map}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){const a=!this.isDone(e,t);this.localDone.set(t,a),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{_item:e,_done:a}},bubbles:!0,composed:!0}))}render(){const e=this.items.length,t=this.items.filter((i,r)=>this.isDone(i,r)).length,a=e>0?Math.round(t/e*100):0;return n`
            <div class="head">
                ${this.heading?n`<span class="title">${this.heading}</span>`:n`<span></span>`}
                <span class="count">${t} / ${e}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${a}%;"></div></div>
            ${this.items.map((i,r)=>{const s=this.isDone(i,r);return n`
                    <div role="button" tabindex="0" class="item ${s?"done":""}" @click="${()=>this.toggle(i,r)}" @keydown="${X(()=>this.toggle(i,r))}">
                        <span class="box">${s?"✓":d}</span>
                        <span class="label">${i.label}</span>
                    </div>
                `})}
        `}};Ea.styles=x`
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
    
        ${ae}
    `;or([h()],Ea.prototype,"heading",2);or([h({type:Array})],Ea.prototype,"items",2);or([g()],Ea.prototype,"localDone",2);Ea=or([k("mateu-checklist")],Ea);const Tp=e=>{const t=e.metadata;return n`
        <mateu-checklist
                heading="${t.title??d}"
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-checklist>
    `};var Pp=Object.defineProperty,Op=Object.getOwnPropertyDescriptor,Mt=(e,t,a,i)=>{for(var r=i>1?void 0:i?Op(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Pp(t,a,r),r};let it=class extends _{render(){const e=this.trend??"flat";return n`
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
        `}};it.styles=x`
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
    `;Mt([h()],it.prototype,"heading",2);Mt([h()],it.prototype,"leftLabel",2);Mt([h()],it.prototype,"leftValue",2);Mt([h()],it.prototype,"rightLabel",2);Mt([h()],it.prototype,"rightValue",2);Mt([h()],it.prototype,"delta",2);Mt([h()],it.prototype,"trend",2);it=Mt([k("mateu-comparison-card")],it);const zp=e=>{const t=e.metadata;return n`
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
    `},nr=x`
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
`,Rp=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}),Ur=e=>Number.isFinite(e)?Rp.format(e):"",Gi=(e,t)=>{const a=e<0?"-":"",i=Ur(Math.abs(e));return t?`${a}${t} ${i}`:`${a}${i}`},Ap=(e,t)=>t?`${Ur(e)} ${t}`:Ur(e);var Lp=Object.defineProperty,Dp=Object.getOwnPropertyDescriptor,Nt=(e,t,a,i)=>{for(var r=i>1?void 0:i?Dp(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Lp(t,a,r),r};let rt=class extends _{constructor(){super(...arguments),this.title="",this.badges=[],this.facts=[]}render(){const e=!!(this.metricLabel||this.metricValue||this.metricCaption);return n`
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
        `}};rt.styles=[nr,x`
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
    `];Nt([h()],rt.prototype,"title",2);Nt([h({type:Array})],rt.prototype,"badges",2);Nt([h()],rt.prototype,"subtitle",2);Nt([h({type:Array})],rt.prototype,"facts",2);Nt([h()],rt.prototype,"metricLabel",2);Nt([h()],rt.prototype,"metricValue",2);Nt([h()],rt.prototype,"metricCaption",2);rt=Nt([k("mateu-entity-header")],rt);const Fp=e=>{if(e.__hoistedToPageHeader)return n``;const t=e.metadata;return n`
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
    `};var Mp=Object.defineProperty,Np=Object.getOwnPropertyDescriptor,qt=(e,t,a,i)=>{for(var r=i>1?void 0:i?Np(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Mp(t,a,r),r};let st=class extends _{constructor(){super(...arguments),this.value=0,this.max=0}fillColor(){return this.dangerAt!=null&&this.value>=this.dangerAt?"error":this.warnAt!=null&&this.value>=this.warnAt?"warning":this.warnAt!=null||this.dangerAt!=null?"success":"primary"}render(){const e=this.max>0?Math.min(Math.max(this.value/this.max,0),1):0,t=Math.round(e*100);return n`
            <div class="meter">
                ${this.label?n`<span class="label">${this.label}</span>`:d}
                <span class="value">${Ap(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};st.styles=x`
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
    `;qt([h()],st.prototype,"label",2);qt([h({type:Number})],st.prototype,"value",2);qt([h({type:Number})],st.prototype,"max",2);qt([h()],st.prototype,"unit",2);qt([h()],st.prototype,"caption",2);qt([h({type:Number})],st.prototype,"warnAt",2);qt([h({type:Number})],st.prototype,"dangerAt",2);st=qt([k("mateu-meter")],st);const qp=e=>{const t=e.metadata;return n`
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
    `};var Bp=Object.defineProperty,jp=Object.getOwnPropertyDescriptor,La=(e,t,a,i)=>{for(var r=i>1?void 0:i?jp(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Bp(t,a,r),r};let Tt=class extends _{constructor(){super(...arguments),this.total=0,this.done=0}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){const e=this.total>0&&this.done>=this.total,t=!e&&!!this.actionLabel&&!!this.actionId;return n`
            <div class="banner ${e?"complete":""}">
                <span class="icon">👥</span>
                ${this.label?n`<span class="label">${this.label}</span>`:d}
                <div class="pills">
                    ${Array.from({length:this.total},(a,i)=>n`
                        <span class="pill ${i+1<=this.done?"filled":""}">${i+1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${t?n`<button @click="${()=>this.runAction()}">${this.actionLabel} →</button>`:d}
            </div>
        `}};Tt.styles=x`
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
    `;La([h()],Tt.prototype,"label",2);La([h({type:Number})],Tt.prototype,"total",2);La([h({type:Number})],Tt.prototype,"done",2);La([h()],Tt.prototype,"actionLabel",2);La([h()],Tt.prototype,"actionId",2);Tt=La([k("mateu-task-progress")],Tt);const Up=e=>{const t=e.metadata;return n`
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
    `};var Wp=Object.defineProperty,Hp=Object.getOwnPropertyDescriptor,ha=(e,t,a,i)=>{for(var r=i>1?void 0:i?Hp(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Wp(t,a,r),r};let ft=class extends _{constructor(){super(...arguments),this.items=[],this.compact=!1,this.frameless=!1,this.columns=0,this.itemHeadingLevel=3}runAction(e,t){t&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}rowClicked(e){this.rowActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.rowActionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}renderItemAction(e,t,a,i){return!t||!a?d:i?n`
                <button class="icon-action" title="${t}" aria-label="${t}"
                    @click="${r=>{r.stopPropagation(),this.runAction(e,a)}}">
                    ${G(i)}
                </button>`:n`
            <button class="row-action" title="${t}"
                @click="${r=>{r.stopPropagation(),this.runAction(e,a)}}">${t}</button>`}render(){const e=this.columns>1||this.items.some(a=>a.actionId||a.actionId2||a.actionId3||(a.lines?.length??0)>0),t=this.itemHeadingLevel===4?"h4":"h3";return e?n`
                <div class="list stacked ${this.compact?"compact":""} ${this.columns>1?"grid":""}"
                     style="${this.columns>1?`grid-template-columns: repeat(auto-fit, minmax(min(18rem, calc(100% / ${this.columns} - 1.5rem)), 1fr));`:""}">
                    ${this.items.map(a=>n`
                        <div role="button" tabindex="0" class="cell ${(a.lines?.length??0)>0?"with-lines":""} ${this.rowActionId?"clickable":""}"
                             @click="${()=>this.rowClicked(a)}" @keydown="${X(()=>this.rowClicked(a))}">
                            <div class="cell-title-row">
                                ${t==="h4"?n`<h4 class="cell-title">${a.title}</h4>`:n`<h3 class="cell-title">${a.title}</h3>`}
                                ${a.status?n`<span class="chip ${a.statusColor??""}">${a.status}</span>`:d}
                            </div>
                            ${a.description?n`<span class="cell-description">${a.description}</span>`:d}
                            ${(a.lines??[]).map(i=>n`<span class="cell-line">${i}</span>`)}
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
                         @click="${()=>this.rowClicked(a)}" @keydown="${X(()=>this.rowClicked(a))}">
                        ${a.avatar?n`<span class="avatar">${a.avatar}</span>`:a.icon?n`<span class="icon">${a.icon}</span>`:d}
                        <div class="body">
                            <span class="title">${a.title}</span>
                            ${a.description?n`<span class="description">${a.description}</span>`:d}
                        </div>
                        ${a.status?n`<span class="chip ${a.statusColor??""}">${a.status}</span>`:d}
                    </div>
                `)}
            </div>
        `}};ft.styles=[nr,ae,x`
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
    `];ha([h({type:Array})],ft.prototype,"items",2);ha([h({type:Boolean})],ft.prototype,"compact",2);ha([h({type:Boolean})],ft.prototype,"frameless",2);ha([h()],ft.prototype,"rowActionId",2);ha([h({type:Number})],ft.prototype,"columns",2);ha([h({type:Number})],ft.prototype,"itemHeadingLevel",2);ft=ha([k("mateu-status-list")],ft);const Vp=e=>{const t=e.metadata;return n`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                columns="${t.columns??0}"
                itemHeadingLevel="${t.itemHeadingLevel??3}"
                rowActionId="${R(t.rowActionId??void 0)}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-status-list>
    `};var Gp=Object.defineProperty,Kp=Object.getOwnPropertyDescriptor,Dn=(e,t,a,i)=>{for(var r=i>1?void 0:i?Kp(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Gp(t,a,r),r};let Ki=class extends _{constructor(){super(...arguments),this.items=[]}render(){return n`
            <ul>
                ${this.items.map(e=>n`<li>${e}</li>`)}
            </ul>
        `}};Ki.styles=x`
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
    `;Dn([h({type:Array})],Ki.prototype,"items",2);Ki=Dn([k("mateu-bulleted-list")],Ki);const Yp=e=>{const t=e.metadata;return n`
        <mateu-bulleted-list
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-bulleted-list>
    `},Xp=e=>{const a=e.metadata.attributes?.["data-colspan"];return n`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??""}"
            class="${e.cssClasses??d}"
            id="${R(e.id??void 0)}"
            data-colspan="${R(a)}"
            slot="${e.slot??d}"/>
    `},Jp=new Map,Qp=e=>Jp.get(e),Zp=(e,t)=>t!=null&&e!=null&&!e.has(t),em=typeof HTMLElement<"u"?HTMLElement:class{};class tm extends em{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",a=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",tm);const Ks=new Set,Fn=(e,t,a)=>{const i=`${a}/${t}`;return Ks.has(i)||(Ks.add(i),console.warn(`[mateu] Component type "${t}" is not supported by the "${a}" renderer — rendering <mateu-unsupported> placeholder.`)),n`<mateu-unsupported
            type="${t}"
            renderer="${a}"
            data-component-id="${e?.id??d}"
            slot="${e?.slot??d}"
    ></mateu-unsupported>`},am=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=t.children?.map(p=>w(e,p,a,i,r,s,o,!1))??[],u=Qp(l.name);return u?u(l.props??{},c):Fn(t,`${v.CustomComponent}:${l.name}`,"custom-component-registry")};var im=Object.defineProperty,rm=Object.getOwnPropertyDescriptor,Ae=(e,t,a,i)=>{for(var r=i>1?void 0:i?rm(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&im(t,a,r),r};const sm={info:"ℹ",success:"✓",warning:"!",danger:"!"};let be=class extends _{constructor(){super(...arguments),this.text="",this.theme="info",this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){const e=!!this.text&&!!this.text.trim();if(!e&&!this.hasContent)return n``;const t=["info","success","warning","danger"].includes(this.theme)?this.theme:"info";return n`
            <div class="notice ${t} ${this.slim?"slim":""}">
                ${this.noIcon?d:n`<span class="icon ${this.icon?"custom":""}">${this.icon||sm[t]}</span>`}
                <div class="body ${this.inlineContent?"inline":""}">
                    ${e?n`<span class="text">${this.text}</span>`:d}
                    ${this.hasContent?n`<div class="content"><slot></slot></div>`:d}
                </div>
                ${this.actionLabel&&this.actionId?n`<button class="notice-action" @click="${()=>this.runAction()}">${this.actionLabel}</button>`:this.status?n`<span class="status">${this.status}</span>`:d}
            </div>
        `}};be.styles=x`
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
    `;Ae([h()],be.prototype,"text",2);Ae([h()],be.prototype,"theme",2);Ae([h()],be.prototype,"icon",2);Ae([h({type:Boolean})],be.prototype,"noIcon",2);Ae([h()],be.prototype,"actionLabel",2);Ae([h()],be.prototype,"actionId",2);Ae([h()],be.prototype,"status",2);Ae([h({type:Boolean})],be.prototype,"slim",2);Ae([h({type:Boolean})],be.prototype,"fullWidth",2);Ae([h({type:Boolean})],be.prototype,"hasContent",2);Ae([h({type:Boolean})],be.prototype,"inlineContent",2);be=Ae([k("mateu-notice")],be);const om=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=Ga(l.text??"",i,r,s,o)??"",u=t.children??[];return n`
        <mateu-notice
                text="${c}"
                theme="${l.theme??"info"}"
                icon="${R(l.icon??void 0)}"
                ?noIcon="${l.noIcon??!1}"
                actionLabel="${R(l.actionLabel??void 0)}"
                actionId="${R(l.actionId??void 0)}"
                status="${R(l.status??void 0)}"
                ?slim="${l.slim??!1}"
                ?fullWidth="${l.fullWidth??!1}"
                ?inlineContent="${l.inlineContent??!1}"
                ?hasContent="${u.length>0}"
                data-colspan="${l.fullWidth?"99":d}"
                style="${t.style??d}"
                class="${t.cssClasses??d}"
                slot="${t.slot??d}"
        >${u.map(p=>w(e,p,a,i,r,s,o))}</mateu-notice>
    `};var nm=Object.defineProperty,lm=Object.getOwnPropertyDescriptor,lr=(e,t,a,i)=>{for(var r=i>1?void 0:i?lm(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&nm(t,a,r),r};let Ia=class extends _{constructor(){super(...arguments),this.groups=[]}willUpdate(e){e.has("groups")&&(this.selectedId=this.groups.flatMap(t=>t.items??[]).find(t=>t.selected)?.id)}itemAction(e,t,a){e.stopPropagation(),t&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{_item:a}},bubbles:!0,composed:!0}))}select(e){this.selectedId=e,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e}},bubbles:!0,composed:!0}))}render(){return n`
            <div class="rail">
                ${this.groups.map(e=>n`
                    <div class="group" role="listbox">
                        ${e.label?n`<span class="group-label">${e.label}</span>`:d}
                        ${(e.items??[]).map(t=>n`
                            <div role="option" tabindex="0" aria-selected="${t.id===this.selectedId}" class="card ${t.id===this.selectedId?"selected":""}"
                                 @click="${()=>this.select(t.id)}" @keydown="${X(()=>this.select(t.id))}">
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
        `}};Ia.styles=[nr,ae,x`
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
    `];lr([h()],Ia.prototype,"actionId",2);lr([h({type:Array})],Ia.prototype,"groups",2);lr([g()],Ia.prototype,"selectedId",2);Ia=lr([k("mateu-task-queue")],Ia);const dm=e=>{const t=e.metadata;return n`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-task-queue>
    `};var cm=Object.defineProperty,um=Object.getOwnPropertyDescriptor,Da=(e,t,a,i)=>{for(var r=i>1?void 0:i?um(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&cm(t,a,r),r};let Pt=class extends _{constructor(){super(...arguments),this.columns=0,this.items=[]}willUpdate(e){e.has("items")&&(this.selectedId=this.items.find(t=>t.selected)?.id)}select(e){e.disabled||(this.selectedId=e.id,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0})))}render(){const e=this.columns>0?`grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`:"grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));";return n`
            <div class="grid" style="${e}">
                ${this.items.map(t=>n`
                    <div role="button" tabindex="0" class="cell ${t.disabled?"disabled":""} ${t.recommended?"recommended":""} ${t.id===this.selectedId?"selected":""}"
                         @click="${()=>this.select(t)}" @keydown="${X(()=>this.select(t))}">
                        ${t.recommended?n`<span class="tag">${this.recommendedLabel||"Recommended"}</span>`:d}
                        <span class="title">${t.title}</span>
                        ${t.subtitle?n`<span class="subtitle">${t.subtitle}</span>`:d}
                        ${t.statusLabel?n`<span class="chip ${t.statusColor??""}">${t.statusLabel}</span>`:d}
                        ${t.note?n`<span class="note ${t.noteColor??""}"><span class="dot"></span>${t.note}</span>`:d}
                    </div>
                `)}
            </div>
        `}};Pt.styles=[nr,ae,x`
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
    `];Da([h()],Pt.prototype,"actionId",2);Da([h({type:Number})],Pt.prototype,"columns",2);Da([h()],Pt.prototype,"recommendedLabel",2);Da([h({type:Array})],Pt.prototype,"items",2);Da([g()],Pt.prototype,"selectedId",2);Pt=Da([k("mateu-resource-grid")],Pt);const hm=e=>{const t=e.metadata;return n`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-resource-grid>
    `};var pm=Object.defineProperty,mm=Object.getOwnPropertyDescriptor,Ee=(e,t,a,i)=>{for(var r=i>1?void 0:i?mm(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&pm(t,a,r),r};let he=class extends _{constructor(){super(...arguments),this.title="",this.features=[],this.current=!1,this.added=!1}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return n`
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
        `}};he.styles=x`
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
    `;Ee([h()],he.prototype,"tag",2);Ee([h()],he.prototype,"title",2);Ee([h()],he.prototype,"subtitle",2);Ee([h()],he.prototype,"image",2);Ee([h({type:Array})],he.prototype,"features",2);Ee([h()],he.prototype,"priceLabel",2);Ee([h()],he.prototype,"actionLabel",2);Ee([h()],he.prototype,"actionId",2);Ee([h({type:Boolean})],he.prototype,"current",2);Ee([h()],he.prototype,"currentLabel",2);Ee([h({type:Boolean})],he.prototype,"added",2);Ee([h()],he.prototype,"addedLabel",2);he=Ee([k("mateu-offer-card")],he);const fm=e=>{const t=e.metadata;return n`
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
    `};var vm=Object.defineProperty,bm=Object.getOwnPropertyDescriptor,Fa=(e,t,a,i)=>{for(var r=i>1?void 0:i?bm(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&vm(t,a,r),r};let Ot=class extends _{constructor(){super(...arguments),this.items=[],this.added=new Set}willUpdate(e){e.has("items")&&(this.added=new Set(this.items.filter(t=>t.added).map(t=>t.id)))}total(){return this.items.filter(e=>e.id!=null&&this.added.has(e.id)).reduce((e,t)=>e+(t.price??0),0)}toggle(e){if(e.id==null)return;const t=new Set(this.added),a=!t.has(e.id);a?t.add(e.id):t.delete(e.id),this.added=t,this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_item:e.id,_added:a,_total:this.total()}},bubbles:!0,composed:!0}))}render(){return n`
            <div class="header">
                ${this.totalLabel?n`<span class="total-label">${this.totalLabel}:</span>`:d}
                <span class="total">${Gi(this.total(),this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(e=>{const t=e.id!=null&&this.added.has(e.id);return n`
                        <div class="card ${t?"added":""}">
                            ${e.icon?n`<span class="icon">${e.icon}</span>`:d}
                            <span class="title">${e.title}</span>
                            ${e.description?n`<span class="description">${e.description}</span>`:d}
                            ${e.includedLabel?n`<span class="included">${e.includedLabel}</span>`:n`
                                    ${e.price!=null?n`
                                        <span class="price">${Gi(e.price,this.currency)}${e.unit?` / ${e.unit}`:""}</span>
                                    `:d}
                                    <button class="toggle ${t?"on":""}" @click="${()=>this.toggle(e)}"
                                            aria-pressed="${t}">${t?"✓":"+"}</button>
                                `}
                        </div>
                    `})}
            </div>
        `}};Ot.styles=x`
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
    `;Fa([h()],Ot.prototype,"totalLabel",2);Fa([h()],Ot.prototype,"currency",2);Fa([h()],Ot.prototype,"actionId",2);Fa([h({type:Array})],Ot.prototype,"items",2);Fa([g()],Ot.prototype,"added",2);Ot=Fa([k("mateu-addon-picker")],Ot);const gm=e=>{const t=e.metadata;return n`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-addon-picker>
    `};var ym=Object.defineProperty,$m=Object.getOwnPropertyDescriptor,di=(e,t,a,i)=>{for(var r=i>1?void 0:i?$m(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&ym(t,a,r),r};let aa=class extends _{constructor(){super(...arguments),this.lines=[]}computedTotal(){return this.total!=null?this.total:this.lines.filter(e=>!e.included).reduce((e,t)=>e+(t.amount??0),0)}render(){return n`
            ${this.lines.map(e=>n`
                <div class="row">
                    <span class="dot"></span>
                    <span class="concept">${e.concept}</span>
                    ${e.included?n`<span class="included-label">${e.includedLabel||"Included"}</span>`:n`<span class="amount ${(e.amount??0)<0?"negative":""}">${Gi(e.amount??0,this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel||"Total"}</span>
                <span class="total">${Gi(this.computedTotal(),this.currency)}</span>
            </div>
        `}};aa.styles=x`
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
    `;di([h()],aa.prototype,"currency",2);di([h()],aa.prototype,"totalLabel",2);di([h({type:Array})],aa.prototype,"lines",2);di([h({type:Number})],aa.prototype,"total",2);aa=di([k("mateu-ledger")],aa);const wm=e=>{const t=e.metadata;return n`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-ledger>
    `};var xm=Object.defineProperty,km=Object.getOwnPropertyDescriptor,yt=(e,t,a,i)=>{for(var r=i>1?void 0:i?km(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&xm(t,a,r),r};let je=class extends _{constructor(){super(...arguments),this.methods=[]}willUpdate(e){e.has("selected")&&(this.selectedId=this.selected)}confirm(){this.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.actionId,parameters:{_method:this.selectedId}},bubbles:!0,composed:!0}))}pick(e){this.selectedId=e,this.methodActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.methodActionId,parameters:{_method:e}},bubbles:!0,composed:!0}))}render(){return n`
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
        `}};je.styles=x`
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
    `;yt([h()],je.prototype,"actionId",2);yt([h()],je.prototype,"methodActionId",2);yt([h({type:Array})],je.prototype,"methods",2);yt([h()],je.prototype,"selected",2);yt([h()],je.prototype,"contextLabel",2);yt([h()],je.prototype,"contextValue",2);yt([h()],je.prototype,"confirmLabel",2);yt([g()],je.prototype,"selectedId",2);je=yt([k("mateu-payment-picker")],je);const _m=e=>{const t=e.metadata;return n`
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
    `};var Cm=Object.defineProperty,Sm=Object.getOwnPropertyDescriptor,Mn=(e,t,a,i)=>{for(var r=i>1?void 0:i?Sm(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Cm(t,a,r),r};let Yi=class extends _{constructor(){super(...arguments),this.items=[]}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return n`
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
        `}};Yi.styles=x`
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
    `;Mn([h({type:Array})],Yi.prototype,"items",2);Yi=Mn([k("mateu-process-monitor")],Yi);const Em=e=>{const t=e.metadata;return n`
        <mateu-process-monitor
                .items="${t.items??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-process-monitor>
    `},Nn=(e,t)=>{let a=e.style;return e.id&&(a&&!a.endsWith(";")&&(a+=";"),a==null&&(a=""),t[e.id+".hidden"]==!0&&(a+="display: none;")),a},Im=(e,t)=>{let a={...e.metadata};if(e.id&&a){if(a.type==v.Button){const i=a;t[e.id+".disabled"]==!0&&(i.disabled=!0)}if(a.type==v.FormField){const i=a;t[e.id+".disabled"]==!0&&(i.disabled=!0)}}return a},F=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),Tm={[v.Bpmn]:({component:e})=>lh(e),[v.Workflow]:({component:e})=>ch(e),[v.FormEditor]:({component:e})=>uh(e),[v.Page]:F(Br),[v.Div]:F(qu),[v.Directory]:({component:e,baseUrl:t,state:a,data:i})=>Nu(e),[v.FormLayout]:F(Lc),[v.HorizontalLayout]:F(Nc),[v.VerticalLayout]:F(qc),[v.SplitLayout]:F(Bc),[v.MasterDetailLayout]:F(jc),[v.TabLayout]:F(Uc),[v.AccordionLayout]:F(Wc),[v.BoardLayout]:F(Yc),[v.BoardLayoutRow]:F(Xc),[v.BoardLayoutItem]:F(Jc),[v.Scroller]:F(Vc),[v.FullWidth]:F(Gc),[v.Container]:F(Kc),[v.Form]:({container:e,component:t,baseUrl:a,state:i,data:r,appState:s,appData:o})=>{const l=t.metadata;return n`<mateu-form
            id="${t.id}"
        baseUrl="${a}"
            .component="${t}"
            .values="${i}"
            .state="${i}"
            .data="${r}"
            .appState="${s}"
            .appdata="${o}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            >
                ${t.children?.map(c=>w(e,c,a,i,r,s,o))}
            ${l?.buttons?.map(c=>n`
               ${w(e,{id:c.actionId,metadata:c,type:J.ClientSide,slot:"buttons"},void 0,i,r,s,o)}
`)}

            </mateu-form>`},[v.Table]:({component:e,state:t,data:a})=>Mr(e,(e.id?a?.[e.id]:void 0)?.page?.content??Bs(e,t)),[v.Crud]:F(jr),[v.App]:({container:e,component:t,baseUrl:a,state:i,data:r,appState:s,appData:o})=>n`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${a}"
                        .component="${t}"
                        .state="${i}"
                        .data="${r}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${s}"
                        .appData="${o}"
            >
             ${t.children?.map(l=>w(e,l,a,i,r,s,o))}
         </mateu-app>`,[v.Element]:({container:e,component:t,state:a,data:i,appState:r,appData:s})=>hu(e,t.metadata,t,a,i,r,s),[v.FormField]:({component:e,state:t})=>Wu(e,t),[v.Text]:({component:e,state:t,data:a,appState:i,appData:r})=>pu(e,t,a,i,r),[v.Avatar]:({component:e,state:t,data:a})=>Md(e,t,a),[v.Chat]:({component:e,state:t,data:a})=>dh(e),[v.AvatarGroup]:({component:e})=>Nd(e),[v.Badge]:({component:e,state:t,data:a})=>qd(e,t,a),[v.Breadcrumbs]:({component:e})=>Fu(e),[v.Anchor]:({component:e})=>mu(e),[v.Button]:({component:e,state:t,data:a})=>gu(e,t,a),[v.Card]:F($u),[v.Chart]:({component:e})=>wu(e),[v.Icon]:({component:e})=>xu(e),[v.ConfirmDialog]:F(_u),[v.ContextMenu]:F(su),[v.CookieConsent]:({component:e})=>Cu(e),[v.Details]:F(Su),[v.Dialog]:({component:e,baseUrl:t,state:a,data:i,appState:r,appData:s})=>Eu(e,t,a,i,r,s),[v.Drawer]:({component:e,baseUrl:t,state:a,data:i,appState:r,appData:s})=>Iu(e,t,a,i,r,s),[v.Image]:({component:e})=>Du(e),[v.Map]:({component:e})=>Lu(e),[v.Markdown]:({component:e})=>Ou(e),[v.MicroFrontend]:({component:e})=>Pu(e),[v.Notification]:({component:e})=>zu(e),[v.ProgressBar]:({component:e,state:t})=>Ru(e,t),[v.Popover]:F(Au),[v.CarouselLayout]:F(Mu),[v.Tooltip]:F(lu),[v.MessageInput]:({component:e})=>nu(e),[v.MessageList]:({component:e})=>iu(e),[v.CustomField]:F(ou),[v.MenuBar]:({container:e,component:t,baseUrl:a,state:i,data:r})=>ru(e,t,a,i,r),[v.Grid]:({component:e,state:t})=>Mr(e,Bs(e,t)),[v.VirtualList]:F(Qc),[v.FormSection]:F(Bu),[v.FormSubSection]:F(ju),[v.MetricCard]:({component:e})=>fh(e),[v.Scoreboard]:F(vh),[v.DashboardPanel]:F(bh),[v.DashboardLayout]:F(gh),[v.ResponsiveGrid]:F(xh),[v.FoldoutLayout]:F(wh),[v.ContentLayout]:F(kh),[v.HeroSection]:F(_h),[v.EmptyState]:({component:e})=>dc(e),[v.Skeleton]:({component:e})=>cc(e),[v.Gantt]:({component:e})=>Eh(e),[v.PlanningBoard]:({component:e})=>Ph(e),[v.Kanban]:({component:e})=>Rh(e),[v.Timeline]:({component:e})=>Dh(e),[v.ProgressSteps]:({component:e})=>Nh(e),[v.Stat]:({component:e})=>jh(e),[v.Calendar]:({component:e})=>Hh(e),[v.PricingTable]:({component:e})=>Kh(e),[v.OrgChart]:({component:e})=>Jh(e),[v.Heatmap]:({component:e})=>tp(e),[v.Funnel]:({component:e})=>rp(e),[v.TrendChart]:({component:e})=>np(e),[v.FeatureGrid]:({component:e})=>cp(e),[v.Testimonials]:({component:e})=>pp(e),[v.Faq]:({component:e})=>vp(e),[v.CalloutCard]:({component:e})=>yp(e),[v.CommentThread]:({component:e})=>xp(e),[v.FileList]:({component:e})=>Sp(e),[v.Checklist]:({component:e})=>Tp(e),[v.ComparisonCard]:({component:e})=>zp(e),[v.EntityHeader]:({component:e})=>Fp(e),[v.Meter]:({component:e})=>qp(e),[v.TaskProgress]:({component:e})=>Up(e),[v.StatusList]:({component:e})=>Vp(e),[v.BulletedList]:({component:e})=>Yp(e),[v.Separator]:({component:e})=>Xp(e),[v.CustomComponent]:F(am),[v.Notice]:F(om),[v.TaskQueue]:({component:e})=>dm(e),[v.ResourceGrid]:({component:e})=>hm(e),[v.OfferCard]:({component:e})=>fm(e),[v.AddOnPicker]:({component:e})=>gm(e),[v.Ledger]:({component:e})=>wm(e),[v.PaymentPicker]:({component:e})=>_m(e),[v.ProcessMonitor]:({component:e})=>Em(e)},xs=(e,t,a,i,r,s,o,l)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),n`<p>No metadata for component</p>`):xs(e,{id:Te(),metadata:t,type:J.ClientSide},a,i,r,s,o,l);const c=t.metadata.type,u={...t,style:Nn(t,r),metadata:Im(t,r)},p=Tm[c];return p?p({container:e,component:u,baseUrl:a,state:i,data:r,appState:s,appData:o,labelAlreadyRendered:l}):n`<p ${u?.slot??d}>Unknown metadata type ${c} for component ${u?.id}</p>`};var Wa=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(Wa||{});const Pm=(e,t,a)=>{const i=e[a.path];return i?n`<span theme="badge pill ${dr(i.type)}">${i.message}</span>`:n``},dr=e=>{switch(e){case Wa.SUCCESS:return"success";case Wa.WARNING:return"warning";case Wa.DANGER:return"error";case Wa.NONE:return"contrast"}return""};var Om=Object.defineProperty,zm=Object.getOwnPropertyDescriptor,Le=(e,t,a,i)=>{for(var r=i>1?void 0:i?zm(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Om(t,a,r),r};let ge=class extends _{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.respondToVisibility=(e,t)=>{var a={root:document.documentElement},i=new IntersectionObserver(r=>{r.forEach(s=>{t(s.intersectionRatio>0)})},a);i.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?xs(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?n`<div class="neutral-card">
                ${e.image?n`<img class="card-media" src="${e.image}" alt="" />`:d}
                <div class="card-body">
                    <div class="card-head">
                        ${e.title?n`<span class="card-title">${e.title}</span>`:d}
                        ${e.status?n`<span theme="badge ${dr(e.status.type)}">${e.status.message}</span>`:d}
                    </div>
                    ${e.subtitle?n`<div class="card-subtitle">${e.subtitle}</div>`:d}
                    ${e.content?n`<div>${e.content}</div>`:d}
                </div>
        </div>`:n`${e}`,this.hasMore=!1,this.clickedOnCard=e=>{this.state[this.id+"_selected_items"]=[e],this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0}))}}updated(e){super.updated(e);const t=this.data[this.id]?.page;this.hasMore=t?.content?.length<t?.totalElements}firstUpdated(e){super.firstUpdated(e),this.respondToVisibility(this.askForMore,t=>{this.keepAsking=t,t&&this.askToUpper()})}render(){const e=this.data[this.id]?.page;return n`
            <div class="card-container">
                ${e?.content?.map(t=>n`<div role="button" tabindex="0" @click="${()=>this.clickedOnCard(t)}" @keydown="${X(()=>this.clickedOnCard(t))}" class="car-container">${this.renderItem(t)}</div>`)}
                <div id="ask-for-more" style="display: ${this.hasMore?"flex":"none"}; width: 100%; justify-content: center; padding: var(--lumo-space-m); color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Loading more…</div>
            </div>

            <slot></slot>
       `}};ge.styles=x`
        ${Lt}
        
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
    
        ${ae}
    `;Le([h()],ge.prototype,"id",2);Le([h()],ge.prototype,"metadata",2);Le([h()],ge.prototype,"baseUrl",2);Le([h()],ge.prototype,"state",2);Le([h()],ge.prototype,"data",2);Le([h()],ge.prototype,"appState",2);Le([h()],ge.prototype,"appData",2);Le([h()],ge.prototype,"emptyStateMessage",2);Le([g()],ge.prototype,"keepAsking",2);Le([me("#ask-for-more")],ge.prototype,"askForMore",2);Le([g()],ge.prototype,"hasMore",2);ge=Le([k("mateu-card-list")],ge);const Rm={show:e=>console.debug("[mateu] no notifier registered, dropping toast:",e.text)};let qn=Rm;function Bn(e){qn=e}function Qe(e,t){qn.show(e,t)}function jn(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,a)=>(t.priority??Number.MAX_SAFE_INTEGER)-(a.priority??Number.MAX_SAFE_INTEGER))}function Am(e){const t=jn(e);return t.length>0?t:e.slice(0,3)}var Lm=Object.defineProperty,Dm=Object.getOwnPropertyDescriptor,$e=(e,t,a,i)=>{for(var r=i>1?void 0:i?Dm(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Lm(t,a,r),r};const Fm={asc:"ascending",desc:"descending"},xi="padding-inline: var(--mateu-edge-header-gutter, 0px); box-sizing: border-box;",Ys="flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem); padding: 3px;";let N=class extends _{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this._columnPrefsRevision=0,this._prefsRevisionApplied=-1,this.pendingMeasure=!0,this.corrections=0,this.unsettledRefusals=0,this.windowResizeListener=()=>this.scheduleMeasure(),this.search=()=>{this.beginLoading();const e=this.component.metadata;if(this.state={...this.state,size:this._pageSizeOf(e),page:0,crud_selected_items:[]},this._syncStateToUrl(e),e.rowsSource){this._fetchRowsFromRest(e,void 0);return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{Qe({text:e,position:"bottomEnd",variant:"error",duration:3e3},this)},this.handleSearchRequested=e=>{const t=this.component.metadata;if(this.state={...this.state,size:this._pageSizeOf(t),crud_selected_items:[]},this._syncStateToUrl(t),t.rowsSource){this._fetchRowsFromRest(t,e);return}!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.beginLoading(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this._fetchRowsFromRest=(e,t)=>{const a=[...new Set([...this.cols.map(o=>o.id).filter(Boolean),...Ud(e.rowRoute)])],i=e.rowsSource,r=Ro(i)!=null;(Oa(i)?.proxy?new Promise(o=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"__restfetch__",parameters:{_sourceKind:"rows",_sourceId:this.id},callback:l=>o(ln(l?.appData?._restfetch,i,a)),callbackonly:!0},bubbles:!0,composed:!0}))}):r?_c(i,a,o=>U(o,this.state,this.data)):kc(i,a,o=>U(o,this.state,this.data)).then(o=>({rows:o,total:null}))).then(({rows:o,total:l})=>{const c=this.cols.find(z=>z.identifier)?.id,u=o.map((z,S)=>({...z,_rowNumber:c!=null&&z[c]!=null?String(z[c]):`_row:${S}`})),p=Number(this.state?.page??0),f=r&&l!=null,m=f?u:Oc(u,a,e.filters,this.state),b=e.pageSize&&e.pageSize>0?e.pageSize:m.length||1,$=f?m:m.slice(p*b,p*b+b),E={page:{totalElements:f?l:m.length,pageSize:b,pageNumber:p,content:$}};this._restRows={key:N._initKeyOf(this.component),listing:E},this.data={...this.data,[this.id]:E},this.requestUpdate(),t?.()}).catch(o=>{console.warn("mateu: external rows fetch failed",o),t?.()})},this.fetchMoreElements=e=>{const{params:t,callback:a}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(a)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(a=>({fieldId:a.__data.path,direction:a.__data.direction?Fm[a.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForKey=void 0,this._restRows=void 0,this.evalLabel=e=>U(e,this.state,this.data),this.handleToolbarButtonClick=e=>{const t=e.route?U(e.route,this.state,this.data):void 0;if(t&&!t.includes("${")){Et(this,t);return}if(e.actionId==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.actionId,parameters:{crud_selected_items:this.state.crud_selected_items??[]}},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get columnPrefsScope(){return window.location.pathname}get effectiveComponent(){const e=this.component,t=e?.metadata;if(!e||!t?.columns)return e;if(this._prefsSource===e&&this._prefsRevisionApplied===this._columnPrefsRevision)return this._prefsApplied;const a=an(this.columnPrefsScope),i=sn(t.columns,a,r=>r.metadata??{});return this._prefsApplied=i===t.columns?e:{...e,metadata:{...t,columns:i}},this._prefsSource=e,this._prefsRevisionApplied=this._columnPrefsRevision,this._prefsApplied}get columnChooserEntries(){return(this.component?.metadata?.columns??[]).map(t=>{const a=t.metadata??{},i=a.id??t.id;return i?{id:i,label:a.label??i,protected:rn(a)}:void 0}).filter(t=>!!t)}renderColumnChooser(){const e=this.columnChooserEntries;return e.filter(t=>!t.protected).length===0?d:n`
            <mateu-column-chooser
                .columns="${e}"
                .scope="${this.columnPrefsScope}"
                @column-prefs-changed="${t=>{t.stopPropagation(),this._columnPrefsRevision++}}"
            ></mateu-column-chooser>
        `}get cols(){return this.effectiveComponent?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":"table":t}scheduleMeasure(){this.pendingMeasure=!0,this.corrections=0,this.requestUpdate()}measureFill(){if(!this.pendingMeasure)return;const e=this.renderRoot?.querySelector?.("[data-crud-box]");if(!e)return;if(this.closest?.("mateu-dialog, mateu-drawer")){this.pendingMeasure=!1;return}const t=e.style.height;t&&(e.style.height="");const a=e.getBoundingClientRect().top,i=Math.round(window.innerHeight-a-this.measureBottomInset(e)-N.BOTTOM_GUTTER_PX);t&&(e.style.height=t);const r=this.lastMeasuredTop==null,s=!r&&Math.abs(a-this.lastMeasuredTop)>=2;if(i>=N.MIN_FILL_PX){if(s&&this.retryMeasure(a))return;this.pendingMeasure=!1,this.unsettledRefusals=0,this.lastMeasuredTop=a,this.fillHeightPx=i;return}!(!r&&!s)&&this.retryMeasure(a)||(this.lastMeasuredTop=a,this.pendingMeasure=!1,this.unsettledRefusals=0,this.fillHeightPx=void 0)}retryMeasure(e){return this.unsettledRefusals>=N.MAX_UNSETTLED_REFUSALS?!1:(this.lastMeasuredTop=e,this.unsettledRefusals++,this.requestUpdate(),!0)}trimOverflow(){if(this.fillHeightPx==null||this.pendingMeasure||this.corrections>=N.MAX_CORRECTIONS)return;const e=document.documentElement.scrollHeight-window.innerHeight;e<=1||e>N.MAX_SLIVER_PX||(this.corrections++,this.fillHeightPx=Math.max(N.MIN_FILL_PX,this.fillHeightPx-e))}measureBottomInset(e){let t=e,a=0;const i=e.getBoundingClientRect().bottom;for(let r=0;t&&r<20;r++){a+=parseFloat(getComputedStyle(t).marginBottom)||0;const s=t.getRootNode(),o=t.assignedSlot??t.parentElement??s.host??null;if(!o||o===document.documentElement||o===document.body)break;const l=getComputedStyle(o);a+=(parseFloat(l.paddingBottom)||0)+(parseFloat(l.borderBottomWidth)||0);const c=parseFloat(l.rowGap)||0;for(let u=t.nextElementSibling;u;u=u.nextElementSibling){const p=u.getBoundingClientRect();if(p.top<i-1)continue;const f=getComputedStyle(u);a+=p.height+(parseFloat(f.marginTop)||0)+(parseFloat(f.marginBottom)||0)+c}t=o}return Math.round(a)}boxStyle(){const e="border: var(--mateu-section-border, none); background: var(--mateu-section-bg, transparent); overflow: hidden; padding: var(--mateu-section-padding, 0); display: flex; flex-direction: column;";return this.fillHeightPx!=null?`${e} height: ${this.fillHeightPx}px;`:`${e} max-height: calc(100dvh - 12rem);`}connectedCallback(){super.connectedCallback(),window.addEventListener("resize",this.windowResizeListener),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.loadingTimer),window.removeEventListener("resize",this.windowResizeListener),this.resizeObserver?.disconnect()}get awaitingRows(){return this.loadingSince!=null&&Date.now()-this.loadingSince<N.LOADING_VALVE_MS}beginLoading(){this.loadingSince=Date.now(),clearTimeout(this.loadingTimer),this.loadingTimer=setTimeout(()=>this.requestUpdate(),N.LOADING_VALVE_MS)}endLoading(){this.loadingSince=void 0,clearTimeout(this.loadingTimer)}_filterIds(e){return new Set(["searchText",...(e.filters??[]).filter(t=>!t.readOnly).flatMap(t=>t.stereotype==="dateRange"||t.stereotype==="numberRange"?[`${t.fieldId}_from`,`${t.fieldId}_to`]:[t.fieldId])])}_syncStateToUrl(e){const t=this._filterIds(e),a=new URLSearchParams(window.location.search);t.forEach(l=>a.delete(l)),a.delete("page"),a.delete("sort"),t.forEach(l=>{const c=this.state[l];c!=null&&c!==""&&a.set(l,String(c))});const i=this.state.page;i&&i>0&&a.set("page",String(i));const r=this.state.sort;if(r&&r.length>0){const l=r.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");l&&a.set("sort",l)}const s=a.toString(),o=s?`${window.location.pathname}?${s}`:window.location.pathname;window.location.pathname+window.location.search!==o&&history.replaceState(null,"",o)}_initStateFromUrl(e,t){const a=new URLSearchParams(window.location.search),i=this._filterIds(e),r={...t};a.forEach((l,c)=>{i.has(c)&&(r[c]=l)});const s=a.get("page");if(s!==null){const l=parseInt(s,10);!isNaN(l)&&l>0&&(r.page=l)}const o=a.get("sort");if(o){const l=o.split(",").map(c=>{const[u,p]=c.split(":");return u&&p?{fieldId:u,direction:p}:null}).filter(Boolean);l.length>0&&(r.sort=l)}return r}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}_pageSizeOf(e){const t=Number(e?.pageSize);if(t>0)return t;const a=Number(this.state?.size);if(a>0)return a;const i=Number(this.data?.[this.id]?.page?.pageSize);return i>0?i:void 0}static _initKeyOf(e){if(!e)return;const t=e.metadata?.rowsSource;return`${e.id}|${t?t.ref??t.url??"":""}`}willUpdate(e){if(super.willUpdate(e),!e.has("data")||this.data?.[this.id]!=null)return;const t=this._restRows;!t||t.key!==N._initKeyOf(this.component)||(this.data={...this.data,[this.id]:t.listing})}updated(e){if(super.updated(e),e.has("component")?this.scheduleMeasure():(this.measureFill(),this.trimOverflow()),this.data?.[this.id]!=null?this.endLoading():this.loadingSince==null&&this._initializedForKey!=null&&!this.awaitingRows&&this.beginLoading(),e.has("component")){const a=N._initKeyOf(this.component),i=this.component?.metadata;if(a!==this._initializedForKey){this._initializedForKey=a;const r=i.initialPage&&i.initialPage>0?i.initialPage:0;this.state=this._initStateFromUrl(i,{...this.state,size:i.pageSize,page:r,sort:[]}),(this.state.page!==r||this.state.sort?.length>0||[...this._filterIds(i)].some(o=>this.state[o]!=null)||i.rowsSource)&&this.handleSearchRequested(void 0)}else{const r=this._restoreUrlFiltersIfMissing(i,this.state);r!==this.state&&(this.state=r)}}}_restoreUrlFiltersIfMissing(e,t){const a=new URLSearchParams(window.location.search),i=this._filterIds(e);let r=t;return a.forEach((s,o)=>{if(!i.has(o))return;const l=r[o];(l==null||l==="")&&(r===t&&(r={...t}),r[o]=s)}),r}render(){const e=C=>{const M=H.get()?.renderToolbarButton?.(C,this.evalLabel(C.label),()=>this.handleToolbarButtonClick(C));return M||n`
                <button class="crud-btn ${Jo(C)}"
                        data-action-id="${C.id}"
                        theme="${ds(C)||d}"
                        @click="${()=>this.handleToolbarButtonClick(C)}"
                >${this.evalLabel(C.label)}</button>
            `};if(!this.component)return n`no component`;const t=this.effectiveComponent,a=t.metadata;a.serverSideOrdering=!0;const r=(()=>{let C=this;for(;C;){const M=C;if(M.tagName==="MATEU-PAGE")return(M.component?.metadata?.toolbar?.length??0)>0;C=M.parentElement??(M.getRootNode?.()instanceof ShadowRoot?M.getRootNode().host:null)}return!1})()?[]:a?.toolbar??[],s=r.filter(C=>Ri(C.actionId)&&!ka(C.actionId)),o=r.filter(C=>ka(C.actionId)),l=r.filter(C=>!Ri(C.actionId)),c=s.length>0&&l.length>0,u=!!a?.title||!!a?.subtitle||r.length>0,p=this.effectiveGridLayout,f=this.cols,m=jn(f),$=this.data[this.id]?.page?.content??[],y=this.state[this.component?.id]?.emptyStateMessage,E=(C,M)=>{const D=M[C.id];if(D==null)return n``;if(C.dataType==="status"){const A=dr(D.type);return n`<span theme="badge pill ${A}">${D.message}</span>`}return C.dataType==="bool"?n`${D?"✓":"✗"}`:typeof D=="object"?n`${D.label??D.name??D.message??""}`:n`${D}`},z=()=>{const C=this.identifierFieldName,M=this.state._selectedId??this.appState?._splitDetailId,D=m.find(L=>L.identifier)??m[0],A=L=>L.dataType==="action"||L.dataType==="actionGroup"||L.dataType==="menu"||L.stereotype==="button",Z=m.filter(L=>L!==D&&!A(L)),$t=f.filter(L=>A(L)),ht=(L,q,K)=>{L.stopPropagation(),L.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:q,parameters:{_clickedRow:K}},bubbles:!0,composed:!0}))},Wt=L=>{const q=[];for(const K of $t){const Y=L[K.id];if(K.dataType==="action"){const Ve=Y?.methodNameInCrud?Y:L.action?.methodNameInCrud?L.action:{methodNameInCrud:K.id,label:K.label,icon:null};q.push(n`
                            <button class="crud-btn" theme="tertiary small" title="${Ve.label||d}"
                                @click="${P=>ht(P,"action-on-row-"+Ve.methodNameInCrud,L)}">
                                ${Ve.icon?G(Ve.icon):d}
                                ${Ve.label??d}
                            </button>`)}else(K.dataType==="actionGroup"||K.dataType==="menu")&&(Y?.actions??[]).forEach(P=>q.push(n`
                            <button class="crud-btn" theme="tertiary small" title="${P.label||d}"
                                @click="${ie=>ht(ie,"action-on-row-"+P.methodNameInCrud,L)}">
                                ${P.icon?G(P.icon):d}
                                ${P.label??d}
                            </button>`))}return q.length?n`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${q}
                    </div>`:d};return n`
                <div class="m-listbox" style="width: 100%;">
                    ${$.length===0?n`<div class="m-item" disabled>${Kt(y)}</div>`:d}
                    ${$.map(L=>n`
                        <div role="button" tabindex="0" class="m-item"
                            ?selected="${C&&M!==void 0&&String(L[C])===String(M)}"
                            @click="${()=>{C&&L[C]!==void 0&&(this.state={...this.state,_selectedId:String(L[C])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:L},bubbles:!0,composed:!0}))}}" @keydown="${X(()=>{C&&L[C]!==void 0&&(this.state={...this.state,_selectedId:String(L[C])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:L},bubbles:!0,composed:!0}))})}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${D?L[D.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${Z.map(q=>n`<span>${q.label}: ${E(q,L)}</span>`)}
                            </div>
                            ${Wt(L)}
                        </div>
                    `)}
                </div>`},S=(C,M,D)=>{const A=this.identifierFieldName;A&&D[A]!==void 0&&(this.state={...this.state,_selectedId:String(D[A])}),C.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:M,parameters:D},bubbles:!0,composed:!0}))},I=()=>{const C=this.identifierFieldName,M=this.state._selectedId??this.appState?._splitDetailId,D=P=>!!P.actionId,A=P=>P.dataType==="action"||P.dataType==="actionGroup"||P.dataType==="menu"||P.stereotype==="button",Z=[...f.slice(0,6),...f.slice(6).filter(P=>A(P)||P.dataType==="status")],$t=Z.filter(P=>P.stereotype==="image"),ht=Z.find(P=>P.identifier)??Z[0],Wt=Z.find(P=>P.id==="select"&&P.dataType==="action"),L=!!Wt,q=Z.filter(P=>P!==ht&&!$t.includes(P)&&!D(P)&&!A(P)),K=Z.filter(P=>A(P)&&!(L&&P===Wt)),Y=(P,ie,wt)=>{P.stopPropagation(),P.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:ie,parameters:{_clickedRow:wt}},bubbles:!0,composed:!0}))},Ve=P=>{const ie=[];for(const wt of K){const mr=P[wt.id];if(wt.dataType==="action"){const va=mr?.methodNameInCrud?mr:P.action?.methodNameInCrud?P.action:{methodNameInCrud:wt.id,label:wt.label,icon:null};ie.push(n`
                            <button class="crud-btn" theme="tertiary" title="${va.label||d}"
                                @click="${Ht=>Y(Ht,"action-on-row-"+va.methodNameInCrud,P)}">
                                ${va.icon?G(va.icon):d}
                                ${va.label??d}
                            </button>`)}else(wt.dataType==="actionGroup"||wt.dataType==="menu")&&(mr?.actions??[]).forEach(Ht=>ie.push(n`
                            <button class="crud-btn" theme="tertiary" title="${Ht.label||d}"
                                @click="${kl=>Y(kl,"action-on-row-"+Ht.methodNameInCrud,P)}">
                                ${Ht.icon?G(Ht.icon):d}
                                ${Ht.label??d}
                            </button>`))}return ie.length?n`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${ie}
                    </div>`:d};return n`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${$.length===0?n`<div style="grid-column: 1 / -1;">${Kt(y)}</div>`:d}
                    ${$.map(P=>n`
                        <div role="button" tabindex="0" class="crud-card"
                            ?data-selected="${C&&M!==void 0&&String(P[C])===String(M)}"
                            style="cursor: pointer;"
                            @click="${ie=>L?Y(ie,"action-on-row-select",P):S(ie.target,"view",P)}" @keydown="${X(ie=>L?Y(ie,"action-on-row-select",P):S(ie.target,"view",P))}"
                        >
                            ${$t.length?n`<img src="${P[$t[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: var(--lumo-border-radius-m, 8px);" />`:d}
                            ${ht?n`<div class="crud-card-title">${P[ht.id]??""}</div>`:d}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${q.map(ie=>n`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${ie.label}</span>
                                        <span>${E(ie,P)}</span>
                                    </div>
                                `)}
                            </div>
                            ${Ve(P)}
                        </div>
                    `)}
                </div>`},T=()=>{const C=Am(f),M=C.find(A=>A.identifier)??C[0],D=C.filter(A=>A!==M);return n`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <div class="m-listbox" style="width: 100%;">
                            ${$.length===0?n`<div class="m-item" disabled>${Kt(y)}</div>`:d}
                            ${$.map(A=>n`
                                <div role="button" tabindex="0" class="m-item"
                                    ?selected="${this.selectedItem===A}"
                                    @click="${()=>{this.selectedItem=A}}" @keydown="${X(()=>{this.selectedItem=A})}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${M?A[M.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${D.map(Z=>n`${E(Z,A)} `)}
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?n`
                            <div class="m-formlayout">
                                ${f.map(A=>n`
                                    <label style="display: flex; flex-direction: column; gap: .1rem; font-size: var(--lumo-font-size-s, .875rem);">
                                        <span style="color: var(--lumo-secondary-text-color, #667);">${A.label}</span>
                                        <span>${String(this.selectedItem[A.id]??"")}</span>
                                    </label>
                                `)}
                            </div>
                        `:n`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},O=()=>{const C=this.identifierFieldName,M=this.state._selectedId??this.appState?._splitDetailId,D=f[0],A=f.slice(1),Z=!!D?.actionId,$t=q=>(q??[]).map(K=>{const Y=Array.isArray(K.children)?K.children:[];return Y.length>0?{...K,children:$t(Y)}:{...K,children:void 0}}),ht=$t($),Wt=(q,K,Y)=>{q.stopPropagation(),C&&K[C]!==void 0&&(this.state={...this.state,_selectedId:String(K[C])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:Y,parameters:K},bubbles:!0,composed:!0}))},L=(q,K)=>n`
                <tr class="${C&&M!==void 0&&String(q[C])===String(M)?"selected":""}"
                    style="cursor: pointer;" @click="${Y=>Wt(Y,q,"view")}">
                    ${D?n`<td style="padding-left: ${K*1.2+.6}rem;">${q[D.id]??""}</td>`:d}
                    ${A.map(Y=>Y.id==="select"?n`<td><button class="crud-btn small" @click="${Ve=>{Ve.stopPropagation(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-select",parameters:{_clickedRow:q}},bubbles:!0,composed:!0}))}}">Select</button></td>`:n`<td>${q[Y.id]??""}</td>`)}
                    ${Z?n`<td style="text-align: end;">${q?.viewable===!1?d:n`<button class="crud-btn small" @click="${Y=>Wt(Y,q,"view")}">View</button>`}</td>`:d}
                </tr>
                ${(q.children??[]).map(Y=>L(Y,K+1))}
            `;return n`
                <table class="crud-table">
                    <thead><tr>
                        ${D?n`<th>${D.label??d}</th>`:d}
                        ${A.map(q=>n`<th>${q.label??d}</th>`)}
                        ${Z?n`<th></th>`:d}
                    </tr></thead>
                    <tbody>
                        ${ht.length===0?n`<tr><td colspan="99" style="padding: 1.5rem; text-align: center; color: var(--lumo-secondary-text-color, #888);">${Kt(y)}</td></tr>`:d}
                        ${ht.map(q=>L(q,0))}
                    </tbody>
                </table>`},le=H.get()?.rendersCrudLayouts?.()===!0,vi=()=>{const C=H.get();return C?.renderTreeComponent?C.renderTreeComponent(this,{rows:$,columns:f.map(M=>({id:M.id,label:M.label})),idField:this.identifierFieldName,navigable:!!f[0]?.actionId,selectedId:this.state._selectedId??this.appState?._splitDetailId}):O()},fa=$.length===0&&this.awaitingRows?n`
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
            ${!le&&p==="list"?z():!le&&p==="cards"?a.contentHeight?n`
                <div class="m-scroll" style="width: 100%; height: ${a.contentHeight};">
                    ${I()}
                </div>
            `:I():!le&&p==="masterDetail"?T():!le&&p==="tree"?vi():H.get()?.renderTableComponent(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,bi=a.infiniteScrolling?d:H.get()?.renderPagination(this,this.component),gi=this.showImportDialog?n`
            <div role="button" tabindex="0" class="crud-modal-backdrop" @click="${C=>{C.target===C.currentTarget&&(this.showImportDialog=!1)}}" @keydown="${X(C=>{C.target===C.currentTarget&&(this.showImportDialog=!1)})}">
                <div class="crud-modal">
                    <h3 style="margin: 0 0 .75rem;">Import</h3>
                    <input type="file" @change="${C=>{const M=C.target.files?.[0];if(M){const D=new FormData;D.append("file",M),fetch("/upload",{method:"POST",body:D}).then(A=>A.json()).then(A=>this.handleImportUploadSuccess({detail:A})).catch(()=>this.notify("Import failed"))}}}">
                    <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                        <button class="crud-btn" @click="${()=>{this.showImportDialog=!1}}">Cancel</button>
                    </div>
                </div>
            </div>
        `:d;return this.standalone?n`
                ${gi}
                <style>
                    /* Scoped to the listing area: a grid field inside a FORM must keep sizing
                       itself, so the fill is expressed here and never on the table component. */
                    [data-crud-area] > * { flex: 1 1 auto; min-height: 0; }
                    [data-crud-area] mateu-table, [data-crud-area] mateu-redwood-table { display: flex; flex-direction: column; }
                    [data-crud-area] vaadin-grid { height: 100%; min-height: 0; }
                </style>
                <div data-crud-box style="${this.boxStyle()} width: 100%; box-sizing: border-box;">
                    <div style="flex-shrink: 0; ${xi}">
                        <mateu-content-header
                            .metadata="${a}"
                            .baseUrl="${this.baseUrl}"
                            .state="${this.state}"
                            .data="${this.data}"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                        ></mateu-content-header>
                    </div>
                    <div style="${Ys} padding-inline: calc(3px + var(--mateu-edge-header-gutter, 0px)); box-sizing: border-box;">
                        <div style="flex: 1; min-width: 0;">${H.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                        ${this.renderColumnChooser()}
                    </div>
                    <div data-crud-area style="flex: 1; overflow-y: auto; min-height: 0; display: flex; flex-direction: column;">${fa}</div>
                    <div style="flex-shrink: 0; ${xi}">${bi}</div>
                </div>
            `:n`
            ${gi}
            ${u?n`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; box-sizing: border-box; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem); ${xi}">
                        ${o.map(C=>n`
                            <button class="back-chevron"
                                    data-action-id="${C.id}"
                                    title="${this.evalLabel(C.label)}"
                                    aria-label="${this.evalLabel(C.label)}"
                                    @click="${()=>this.handleToolbarButtonClick(C)}">
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
                        ${s.map(C=>e(C))}
                        ${c?n`<span class="toolbar-divider"></span>`:d}
                        ${l.map(C=>e(C))}
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
                <div style="${Ys} padding-inline: calc(3px + var(--mateu-edge-header-gutter, 0px)); box-sizing: border-box;">
                    <div style="flex: 1; min-width: 0;">${H.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                    ${this.renderColumnChooser()}
                </div>
                <div data-crud-area style="flex: 1; overflow-y: auto; min-height: 0; display: flex; flex-direction: column;">${fa}</div>
                <div style="flex-shrink: 0; ${xi}">${bi}</div>
            </div>
        `}createRenderRoot(){return H.mustUseShadowRoot()?super.createRenderRoot():this}};N.BOTTOM_GUTTER_PX=16;N.MAX_SLIVER_PX=64;N.MAX_CORRECTIONS=3;N.MAX_UNSETTLED_REFUSALS=4;N.MIN_FILL_PX=320;N.LOADING_VALVE_MS=15e3;N.styles=x`
        ${Lt}
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
    
        ${ae}
    `;$e([h()],N.prototype,"component",2);$e([h()],N.prototype,"baseUrl",2);$e([h({type:Boolean})],N.prototype,"standalone",2);$e([h()],N.prototype,"state",2);$e([h()],N.prototype,"data",2);$e([h()],N.prototype,"appState",2);$e([h()],N.prototype,"appData",2);$e([g()],N.prototype,"showImportDialog",2);$e([g()],N.prototype,"availableWidthPx",2);$e([g()],N.prototype,"selectedItem",2);$e([g()],N.prototype,"_columnPrefsRevision",2);$e([g()],N.prototype,"fillHeightPx",2);$e([g()],N.prototype,"loadingSince",2);N=$e([k("mateu-table-crud")],N);const Mm=(e,t)=>{const a=new Set,i=(r,s)=>{if(!r||typeof r!="object"||a.has(r)||s>40)return!1;if(a.add(r),Array.isArray(r))return r.some(l=>i(l,s+1));const o=r;if(o.id===t&&o.metadata&&typeof o.metadata=="object"&&o.metadata.infiniteScrolling)return!0;for(const l of["children","metadata","content","columns","tabs","components","header","footer"])if(i(o[l],s+1))return!0;return!1};return i(e,0)},Nm=(e,t,a)=>{const i={...e};for(const r in t){const s=t[r],o=s?.page,l=e?.[r]?.page?.content,c=Number(o?.pageNumber);if(c>0&&Array.isArray(l)&&a(r)){const u=Number(o.pageSize),p=u>0&&l.length>=c*u?l.slice(0,c*u):l;i[r]={...s,page:{...o,content:[...p,...o.content??[]]}}}else i[r]=s}return i};var St=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(St||{}),qm=Object.defineProperty,cr=(e,t,a,i)=>{for(var r=void 0,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=o(t,a,r)||r);return r&&qm(t,a,r),r};class Bt extends ir{constructor(){super(...arguments),this.state={},this.data={},this._locallyEdited=new Set,this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(a=>a.type==St.OnLoad).forEach(a=>{if((!a.condition||this._evalExpr(a.condition))&&!a.triggered){const r=a;r.triggered=!0;var i=r.times-1;r.timeoutMillis>0?this.scheduleOnload(r,i,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,background:r.background},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,a,i)=>{if(i!=this.component?.id)return;const r=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,background:t.background,callbackToken:r},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const a=t,r=(this.component.triggers??[]).filter(s=>s.type==St.OnCustomEvent).filter(s=>s.eventName==a.type).filter(s=>s.source!=="COMPONENT"||a.detail?.__source===s.from);r.length!==0&&(r.some(s=>!s.source||s.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),r.forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId,parameters:a.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return Vo(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return Fd(t,this.state??{},this.data??{},this._interpolationExtra())}isOverlayChild(t){const a=t?.metadata?.type;return a==v.Drawer||a==v.Dialog}removeSelfFromOwnerChildren(){const t=this.component;if(!t)return!1;const a=r=>{if(r===t)return!0;const s=r;return t.id!=null&&s?.id==t.id&&this.isOverlayChild(s)};let i=this.parentNode;for(;i;){const r=i instanceof ShadowRoot?i.host:i,s=r.component?.children;if(Array.isArray(s)){const o=s.findIndex(a);if(o>=0)return s.splice(o,1),r.requestUpdate?.(),!0}i=i instanceof ShadowRoot?r:i.parentNode}return!1}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(Xt.Add==t.action){if(this.component){const s=this.component.children??(this.component.children=[]),o=t.component.id?s.findIndex(l=>l.id==t.component.id&&this.isOverlayChild(l)):-1;o>=0?(s[o]=t.component,this.component={...this.component}):s.push(t.component)}}else{this.callbackToken=Te();let s=!1;if(t.component?.type==J.ServerSide)if(this.component){const o=this.component,l=t.component;s=o.serverSideType==l.serverSideType;const c=s?(o.children??[]).filter(u=>this.isOverlayChild(u)):[];o.actions=l.actions,o.type=l.type,o.rules=l.rules,o.triggers=l.triggers,o.serverSideType=l.serverSideType,o.route=l.route,o.initialData=l.initialData,o.validations=l.validations,o.cssClasses=l.cssClasses,o.slot=l.slot,o.style=l.style,o.children=c.length?[...l.children??[],...c]:l.children,(o.serverSideType!=l.serverSideType||o.id!=l.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const o=[t.component];this.component&&(this.component.children=o)}t.action!==Xt.ReplaceKeepData&&!s&&(this.state={},this.data={},this._locallyEdited.clear())}t.state&&(Object.keys(t.state).forEach(s=>this._locallyEdited.delete(s)),this.state={...this.state,...t.state});const a=this._lastOwnState;let i=this.state;a&&this._locallyEdited.forEach(s=>{!(t.state!=null&&s in t.state)&&i[s]!==a[s]&&(i={...i,[s]:a[s]})}),this._lastOwnState=i,t.data&&(this.data=Nm(this.data??{},t.data,s=>Mm(this.component,s))),this._lastFragmentData=this.data,this.registerCustomEventListeners();const r=H.getAfterRenderHook();r&&setTimeout(()=>r(this)),this.requestUpdate()}}willUpdate(t){super.willUpdate(t);const a=this.component?.serverSideType,i=a!=null&&this._lastViewKey!=null&&a!==this._lastViewKey;if(a!=null&&(this._lastViewKey=a),i&&this._locallyEdited.clear(),this._keepEditedFieldValues(t,i),!t.has("data")||this.data===this._lastFragmentData||i)return;const r=this.data,s=t.get("data");r&&Object.keys(r).length===0&&s&&Object.keys(s).length>0&&(this.data=s)}_keepEditedFieldValues(t,a){if(a||!t.has("state")||this._locallyEdited.size===0||this.state===this._lastOwnState)return;const i=this._lastOwnState;if(!i)return;let r;this._locallyEdited.forEach(s=>{i[s]!==this.state?.[s]&&(r=r??{...this.state},r[s]=i[s])}),r&&(this.state=r)}adoptEditedState(t,a){this._locallyEdited.add(t),this.state=a,this._lastOwnState=a}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:a,name:i})=>a.removeEventListener(i,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(a=>a.type==St.OnCustomEvent).forEach(a=>{const i=a.source==="DOCUMENT"||a.source==="COMPONENT"?document:this;i.addEventListener(a.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:i,name:a.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:a})=>t.removeEventListener(a,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}cr([h()],Bt.prototype,"state");cr([h()],Bt.prototype,"data");cr([h()],Bt.prototype,"appData");cr([h()],Bt.prototype,"appState");const Bm=new Set(["sse","app-data","rest-sources","command-center","global-search","notifications","context-selectors","header-actions"]);function jm(e,t=Bm){const a=(e??[]).filter(i=>i&&!t.has(i));return{ok:a.length===0,missing:a}}function Um(e,t=document){const a=jm(e);return a.ok||(console.warn(`[mateu] this renderer is missing capabilities the app requires: ${a.missing.join(", ")}. The app may not render correctly. Load a renderer build that provides them.`),t.dispatchEvent(new CustomEvent("mateu-capability-mismatch",{detail:{missing:a.missing,required:[...e??[]]},bubbles:!0,composed:!0}))),a}const Un="mateu-recent-routes",Wm=8;function Wn(){try{return JSON.parse(localStorage.getItem(Un)??"{}")}catch{return{}}}function Hm(e){try{localStorage.setItem(Un,JSON.stringify(e))}catch{}}function Xs(e){return Wn()[e||"_"]??[]}function Vm(e,t){if(!t?.route||!t.label)return;const a=e||"_",i=Wn(),s=(i[a]??[]).filter(o=>o.route!==t.route);s.unshift({route:t.route,label:t.label}),i[a]=s.slice(0,Wm),Hm(i)}var Gm=Object.defineProperty,Km=Object.getOwnPropertyDescriptor,lt=(e,t,a,i)=>{for(var r=i>1?void 0:i?Km(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Gm(t,a,r),r};let Pe=class extends _{constructor(){super(...arguments),this.baseUrl="",this.open=!1,this.queryText="",this.dataHits=[],this.loading=!1,this.selectedIndex=0,this.fabOffset=0,this.keydownHandler=null}connectedCallback(){super.connectedCallback(),this.keydownHandler=e=>{(e.metaKey||e.ctrlKey)&&(e.key==="k"||e.key==="K")?(e.preventDefault(),this.toggle()):e.key==="Escape"&&this.open&&this.close()},document.addEventListener("keydown",this.keydownHandler),this.setupFabObserver()}disconnectedCallback(){super.disconnectedCallback(),this.keydownHandler&&document.removeEventListener("keydown",this.keydownHandler),clearTimeout(this.searchTimer),this.fabObserver?.disconnect(),this.fabObserver=void 0}setupFabObserver(){const e=this.getRootNode(),t=e instanceof ShadowRoot?e:document.body;this.measureFabStack(),this.fabObserver?.disconnect(),this.fabObserver=new MutationObserver(()=>this.measureFabStack()),this.fabObserver.observe(t,{childList:!0,subtree:!0})}measureFabStack(){const t=this.getRootNode().querySelectorAll?.(".app-fab").length??0;t!==this.fabOffset&&(this.fabOffset=t)}updated(e){e.has("open")&&this.open&&requestAnimationFrame(()=>this.inputEl?.focus())}toggle(){this.open?this.close():this.openCenter()}openCenter(){this.open=!0,this.queryText="",this.dataHits=[],this.selectedIndex=0}close(){this.open=!1,this.queryText="",this.dataHits=[],clearTimeout(this.searchTimer)}flattenMenu(e,t){const a=[];for(const i of e??[])if(!i.separator)if(i.submenus&&i.submenus.length>0){const r=t?`${t} › ${i.label}`:i.label;a.push(...this.flattenMenu(i.submenus,r))}else i.route!==void 0&&i.route!==null&&a.push({label:i.label,breadcrumb:t,route:i.route});return a}onInput(e){this.queryText=e,this.selectedIndex=0;const t=e.trim();if(clearTimeout(this.searchTimer),!t||!this.app?.globalSearchEnabled){this.dataHits=[],this.loading=!1;return}this.loading=!0,this.searchTimer=setTimeout(()=>this.fetchGlobalSearch(t),250)}async fetchGlobalSearch(e){const t=this.app;if(!t?.globalSearchEnabled){this.loading=!1;return}try{const i=(await ca.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","command-center",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(r=>r.data).find(r=>r&&r._globalsearch);this.dataHits=i?._globalsearch??[]}catch{this.dataHits=[]}finally{this.loading=!1}}navigateTo(e,t){Vm(this.app?.serverSideType??"",{route:e,label:t}),this.close();for(const a of["route-changed","navigate-to-requested"])this.dispatchEvent(new CustomEvent(a,{detail:{route:e},bubbles:!0,composed:!0}))}askAi(){const e=this.queryText.trim();this.close(),this.dispatchEvent(new CustomEvent("mateu-open-ai",{detail:{query:e},bubbles:!0,composed:!0}))}visibleTargets(e){if(!this.queryText.trim()){const t=this.flattenMenu(this.app?.menu,"").map(i=>({route:i.route,label:i.label})),a=Xs(this.app?.serverSideType??"");return[...t,...a]}return[...e.map(t=>({route:t.route,label:t.label})),...this.dataHits.map(t=>({route:t.route,label:t.label}))]}onKeydown(e,t){if(e.key==="ArrowDown")e.preventDefault(),this.selectedIndex=Math.min(this.selectedIndex+1,t.length-1);else if(e.key==="ArrowUp")e.preventDefault(),this.selectedIndex=Math.max(this.selectedIndex-1,0);else if(e.key==="Enter"){const a=t[this.selectedIndex];a&&this.navigateTo(a.route,a.label)}}render(){return n`
            <button class="cc-fab" style="${kn(this.fabOffset)} z-index: 950;" ${vs("shell",this.fabOffset)}
                @click=${()=>this.openCenter()} title="Buscar y navegar (⌘K)" aria-label="Command center">
                ${this.fabIcon()}
            </button>
            ${this.open?this.renderOverlay():d}
        `}fabIcon(){return n`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>`}renderOverlay(){const e=this.queryText.trim().toLowerCase(),t=e?this.flattenMenu(this.app?.menu,"").filter(i=>i.label.toLowerCase().includes(e)||i.breadcrumb.toLowerCase().includes(e)):[],a=this.visibleTargets(t);return n`
            <div class="cc-backdrop" @click=${()=>this.close()}>
                <div class="cc-panel" @click=${i=>i.stopPropagation()}>
                    <div class="cc-bar">
                        <button class="cc-icon-btn" @click=${()=>this.queryText?this.onInput(""):this.close()} title="${this.queryText?"Borrar":"Cerrar"}">
                            ${this.queryText?this.backIcon():this.searchGlyph()}
                        </button>
                        <input class="cc-input" .value=${this.queryText} placeholder="Buscar pantallas, datos y acciones…"
                            @input=${i=>this.onInput(i.target.value)}
                            @keydown=${i=>this.onKeydown(i,a)}>
                        ${this.queryText?n`<button class="cc-icon-btn" @click=${()=>this.onInput("")} title="Limpiar">${this.clearIcon()}</button>`:d}
                    </div>
                    <div class="cc-body">
                        ${e?this.renderResults(t):this.renderDefault()}
                    </div>
                </div>
                <button class="cc-close" @click=${()=>this.close()} title="Cerrar">${this.clearIcon()}</button>
            </div>
        `}renderDefault(){const e=this.flattenMenu(this.app?.menu,""),t=Xs(this.app?.serverSideType??"");let a=-1;return n`
            <div class="cc-columns">
                <div class="cc-col">
                    <div class="cc-section-title">Ir a</div>
                    <div class="cc-tiles">
                        ${e.map(i=>{a++;const r=a;return n`
                            <button class="cc-tile ${r===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(i.route,i.label)}
                                @mouseenter=${()=>{this.selectedIndex=r}}>
                                <span class="cc-tile-label">${i.label}</span>
                                ${i.breadcrumb?n`<span class="cc-sub">${i.breadcrumb}</span>`:d}
                            </button>`})}
                        ${e.length===0?n`<div class="cc-empty">Sin opciones de menú.</div>`:d}
                    </div>
                </div>
                ${t.length>0?n`
                    <div class="cc-col cc-col--recent">
                        <div class="cc-section-title">Recientes</div>
                        ${t.map(i=>{a++;const r=a;return n`
                            <button class="cc-row ${r===this.selectedIndex?"cc-sel":""}"
                                @click=${()=>this.navigateTo(i.route,i.label)}
                                @mouseenter=${()=>{this.selectedIndex=r}}>
                                <span class="cc-tile-label">${i.label}</span>
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
                ${e.map((a,i)=>n`
                    <button class="cc-row ${i===this.selectedIndex?"cc-sel":""}"
                        @click=${()=>this.navigateTo(a.route,a.label)}
                        @mouseenter=${()=>{this.selectedIndex=i}}>
                        <span class="cc-tile-label">${a.label}</span>
                        ${a.breadcrumb?n`<span class="cc-sub">${a.breadcrumb}</span>`:d}
                    </button>`)}
                ${this.renderDataHits(e.length)}
                ${t?n`<div class="cc-empty">No encontramos coincidencias para “${this.queryText.trim()}”.</div>`:d}
            </div>
        `}renderDataHits(e){if(this.dataHits.length===0)return d;let t;return n`${this.dataHits.map((a,i)=>{const r=e+i,s=a.category&&a.category!==t;return t=a.category,n`
                ${s?n`<div class="cc-section-title">${a.category}</div>`:d}
                <button class="cc-row ${r===this.selectedIndex?"cc-sel":""}"
                    @click=${()=>this.navigateTo(a.route,a.label)}
                    @mouseenter=${()=>{this.selectedIndex=r}}>
                    <span class="cc-tile-label">${a.label}</span>
                    ${a.description?n`<span class="cc-sub">${a.description}</span>`:d}
                </button>`})}`}searchGlyph(){return n`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`}backIcon(){return n`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`}clearIcon(){return n`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`}aiIcon(){return n`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 4.7L19 8.5l-4.1 2.3L12 15l-1.9-4.2L6 8.5l5.1-1.8z"></path></svg>`}};Pe.styles=[x`
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
    `,ms(".cc-fab")];lt([h({attribute:!1})],Pe.prototype,"app",2);lt([h()],Pe.prototype,"baseUrl",2);lt([g()],Pe.prototype,"open",2);lt([g()],Pe.prototype,"queryText",2);lt([g()],Pe.prototype,"dataHits",2);lt([g()],Pe.prototype,"loading",2);lt([g()],Pe.prototype,"selectedIndex",2);lt([g()],Pe.prototype,"fabOffset",2);lt([me(".cc-input")],Pe.prototype,"inputEl",2);Pe=lt([k("mateu-command-center")],Pe);let Ge=null;function Ym(e){const t=e.component?.metadata;!!(t&&(t.commandCenterEnabled||t.chromeless)&&t.variant!=="MEDIATOR")?((!Ge||!Ge.isConnected)&&(Ge=document.createElement("mateu-command-center"),e.renderRoot.appendChild(Ge)),Ge.app=t,Ge.baseUrl=e.baseUrl??""):Ge&&e.renderRoot.contains(Ge)&&(Ge.remove(),Ge=null)}const Xm="data-mateu-pending-styles",Js=`
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
`,Qs=new WeakSet,Jm=e=>{if(Qs.has(e))return;Qs.add(e);const t=e;if(typeof CSSStyleSheet<"u"&&Array.isArray(t.adoptedStyleSheets))try{const r=new CSSStyleSheet;r.replaceSync(Js),t.adoptedStyleSheets=[...t.adoptedStyleSheets,r];return}catch{}const a=e instanceof Document?e.head:e;if(!a)return;const i=document.createElement("style");i.setAttribute(Xm,""),i.textContent=Js,a.appendChild(i)},Qm=e=>{const t=e.getRootNode();if(t instanceof ShadowRoot||t instanceof Document)return t},Xi=new Set,Zm=()=>{for(const e of Xi){if(e.isConnected&&e.hasAttribute("data-mateu-pending"))return!0;Xi.delete(e)}return!1},ef=e=>{if(!e||e.hasAttribute("data-mateu-pending"))return;const t=Qm(e);t&&Jm(t),e.setAttribute("data-mateu-pending",""),e.setAttribute("aria-busy","true"),Xi.add(e)},tf=e=>{e&&(e.removeAttribute("data-mateu-pending"),e.removeAttribute("aria-busy"),Xi.delete(e))},af=e=>{const a=(typeof e.composedPath=="function"?e.composedPath():[])[0]??e.target;return a instanceof Element?a:void 0},rf=["button","a[href]",'[role="button"]','[role="menuitem"]','input[type="button"]','input[type="submit"]',"vaadin-button","vaadin-menu-bar-button","ui5-button","oj-c-button","oj-button"].join(", "),sf=e=>{if(!(!e||typeof e.closest!="function"))return e.closest(rf)??void 0};var of=Object.defineProperty,nf=Object.getOwnPropertyDescriptor,ks=(e,t,a,i)=>{for(var r=i>1?void 0:i?nf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&of(t,a,r),r};let ii=class extends _{constructor(){super(...arguments),this.localFeedback=!1,this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.localFeedback=Zm(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1;const t=e.detail??{},a=t.failure??Ar(t.reason,{online:Ct.isOnline()});if(a.kind==="cancelled")return;const i=t.retry;Qe({text:a.message,variant:"error",duration:i?8e3:5e3,position:"bottomEnd",...i?{actionLabel:"Retry",onAction:i}:{}},this)}}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-called-event",this.fetchStarted),this.addEventListener("backend-succeeded-event",this.fetchFinished),this.addEventListener("backend-cancelled-event",this.fetchFinished),this.addEventListener("backend-failed-event",this.fetchFailed)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-called-event",this.fetchStarted),this.removeEventListener("backend-succeeded-event",this.fetchFinished),this.removeEventListener("backend-cancelled-event",this.fetchFinished),this.removeEventListener("backend-failed-event",this.fetchFailed)}render(){return n`<div class="loader-container">
            <div style="display: flex; flex-direction: column;">
                <slot></slot>
                <div class="loader-frame ${this.loading?this.localFeedback?"delayed-show late":"delayed-show":""}" style="${this.loading?"pointer-events: all;":"display: none;"}"><div class="loader"></div></div>
            </div>
        </div>`}};ii.styles=x`
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
  `;ks([g()],ii.prototype,"loading",2);ks([g()],ii.prototype,"localFeedback",2);ii=ks([k("mateu-api-caller")],ii);var xe=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(xe||{}),lf=Object.defineProperty,df=Object.getOwnPropertyDescriptor,Q=(e,t,a,i)=>{for(var r=i>1?void 0:i?df(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&lf(t,a,r),r};const cf=(e,t)=>(e.homeBaseUrl??"").includes("://")?e.homeBaseUrl:t||e.homeBaseUrl,uf=(e,t)=>{const a=t&&/^[#\w\s(),.%-]+$/.test(t.trim())?t.trim():void 0;a?(e.style.setProperty("--mateu-accent",a),e._mateuAccent=a):e._mateuAccent&&(e.style.removeProperty("--mateu-accent"),e._mateuAccent=void 0)};let W=class extends Bt{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this.commandPaletteDataHits=[],this._fetchedAppDataRef=void 0,this.openDataHit=e=>{et.confirmLeave()&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteDataHits=[],this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:e.route},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:e.route},bubbles:!0,composed:!0})))},this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this._openAiHandler=()=>{this.chatOpen||this.showHideIa()},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const a=this.renderRoot.querySelector?.("mateu-component");a&&a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.runMenuRules=e=>{for(const t of e)if(t.action===xe.RunAction&&t.actionId)this.runAction(t.actionId);else if(t.action===xe.RunJS&&t.value!=null)try{new Function(String(t.value))()}catch(a){console.error("menu RunJS rule failed",a)}},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const a=e[t];if(this.selectedRoute?this.isActiveOption(a):a.selected)return a;const i=this.getSelectedOption(a.submenus);if(i)return i}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix,t.rules)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix,t.rules))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const a=[];for(const i of e)if(!i.separator)if(i.submenus&&i.submenus.length>0){const r=t?`${t} › ${i.label}`:i.label;a.push(...this.flattenMenuForPalette(i.submenus,r))}else a.push({label:i.label,breadcrumb:t,consumedRoute:i.consumedRoute,route:i.route,actionId:i.actionId,baseUrl:i.baseUrl,serverSideType:i.serverSideType,uriPrefix:i.uriPrefix});return a},this.handleCommandPaletteKeydown=(e,t)=>{const a=Math.min(t.length,10),i=a+Math.min(this.commandPaletteDataHits.length,8);if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,i-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){if(this.commandPaletteSelectedIndex>=a){const s=this.commandPaletteDataHits[this.commandPaletteSelectedIndex-a];s&&this.openDataHit(s);return}const r=t[this.commandPaletteSelectedIndex];r&&(this.selectRoute(r.consumedRoute,r.route,r.actionId,r.baseUrl,r.serverSideType,r.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return d;const e=this.component?.metadata;if(e?.commandCenterEnabled)return d;if(!e?.menu)return d;const t=this.flattenMenuForPalette(e.menu,""),a=this.commandPaletteQuery.toLowerCase(),i=a?t.filter(r=>r.label.toLowerCase().includes(a)||r.breadcrumb.toLowerCase().includes(a)):t;return n`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}>
                <div class="cmd-palette" @click=${r=>r.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        ${G("vaadin:search",void 0,"cmd-search-icon")}
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${r=>{this.commandPaletteQuery=r.target.value,this.commandPaletteSelectedIndex=0,this.fetchGlobalSearch(this.commandPaletteQuery)}}
                            @keydown=${r=>this.handleCommandPaletteKeydown(r,i)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${i.slice(0,10).map((r,s)=>n`
                            <div class="cmd-result ${s===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                @click=${()=>{this.selectRoute(r.consumedRoute,r.route,r.actionId,r.baseUrl,r.serverSideType,r.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=s}}
                            >
                                <span class="cmd-result-label">${r.label}</span>
                                ${r.breadcrumb?n`<span class="cmd-result-breadcrumb">${r.breadcrumb}</span>`:d}
                            </div>
                        `)}
                        ${a&&this.commandPaletteDataHits.length>0?n`
                            ${this.commandPaletteDataHits.slice(0,8).map((r,s)=>{const o=Math.min(i.length,10)+s,l=this.commandPaletteDataHits[s-1];return n`
                                    ${r.category&&r.category!==l?.category?n`
                                        <div class="cmd-category">${r.category}</div>`:d}
                                    <div class="cmd-result ${o===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                         @click=${()=>this.openDataHit(r)}
                                         @mouseenter=${()=>{this.commandPaletteSelectedIndex=o}}
                                    >
                                        <span class="cmd-result-label">${r.label}</span>
                                        ${r.description?n`<span class="cmd-result-breadcrumb">${r.description}</span>`:d}
                                    </div>`})}`:d}
                        ${i.length===0&&this.commandPaletteDataHits.length===0?n`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:d}
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
                ${e.icon?G(e.icon,void 0,"rail-icon"):n`<div class="rail-icon-placeholder">${e.label.charAt(0).toUpperCase()}</div>`}
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
                            ${t.icon?G(t.icon,"font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;"):d}
                            <div class="nav-tile-title">${t.label}</div>
                            ${t.description?n`<div class="nav-tile-desc">${t.description}</div>`:d}
                        </div>
                    `)}
                </div>
            </div>
        `,this.goHome=()=>{et.confirmLeave()&&(window.history.pushState(null,"","/"),window.dispatchEvent(new PopStateEvent("popstate",{state:null})))},this.selectRoute=(e,t,a,i,r,s,o)=>{if(o&&o.length>0){this.runMenuRules(o);return}et.confirmLeave()&&this._selectRoute(e,t,a,i,r,s)},this._selectRoute=(e,t,a,i,r,s)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=i,this.selectedRoute=t,this.selectedServerSideType=r,this.selectedUriPrefix=s,this.instant=Te(),this.state&&this.state._route!=null&&(this.state._route=void 0);let o=this.baseUrl??"";o.indexOf("://")<0&&(o.startsWith("/")||(o="/"+o),o=window.location.origin+o),o.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(o+t);if(e&&l.pathname.startsWith(e)){const c=l.pathname.substring(e.length);l=new URL(l.origin+(c||"/"))}if((window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="/_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.isActiveOption=e=>this.selectedRoute?!!e.route&&(this.selectedRoute==e.route||this.selectedRoute.startsWith(e.route+"/")):!!e.selected,this.mapItems=(e,t)=>e.map(a=>{if(a.submenus&&a.submenus.length>0){let i=this.mapItems(a.submenus,t);return t&&a.label.toLowerCase().includes(t)&&(i=this.mapItems(a.submenus,"")),i&&i.length>0?{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||this.isActiveOption(a),children:i}:void 0}if(a.separator)return t?void 0:{component:"hr"};if(!t||a.label.toLowerCase().includes(t))return{consumedRoute:a.consumedRoute,text:a.label,route:a.route,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix,actionId:a.actionId,selected:t||this.isActiveOption(a)}}).filter(a=>a!=null),this.getSelectedIndex=e=>{if(!e)return NaN;const t=o=>{let l=(o??"").trim();return l.length>1&&l.endsWith("/")&&(l=l.slice(0,-1)),l},a=t(this.selectedRoute??window.location.pathname);let i=NaN,r=-1;for(let o=0;o<e.length;o++){const l=t(e[o].route);l!==""&&(a===l||a.startsWith(l+"/"))&&l.length>r&&(r=l.length,i=o)}if(!Number.isNaN(i))return i;const s=this.getSelectedOption(e);return s?e.indexOf(s):NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?n`
                <details open class="left-menu-group">
                    <summary>${e.label}</summary>
                    <div class="left-menu-children">
                        ${e.submenus.map(t=>n`${this.renderOptionOnLeftMenu(t)}`)}
                    </div>
                </details>
`:n`<button class="left-menu-item"
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix,e.rules)}"
        >${e.label}</button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",Te())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?n`
            ${e.map(a=>{const i=a;return n`

                        ${i.component=="hr"?n`<hr/>`:n`
                                <div class="side-nav-item ${i.selected?"side-nav-item--active":""}">
                                    <button class="side-nav-link"
                                            @click="${()=>{i.route&&!i.children&&this.selectRoute(void 0,i.route,void 0,this.baseUrl,void 0,void 0)}}">
                                        ${i.icon?G("vaadin:dashboard","margin-right:.5rem;"):d}${i.text}
                                    </button>
                                    ${i.children?n`<div class="side-nav-children">${this.renderSideNav(i.children,"children")}</div>`:d}
                                </div>
                        `}

                            `})}`:d,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix,t.rules)}}createRenderRoot(){return H.mustUseShadowRoot()?super.createRenderRoot():(W.injectLightDomStyles(),this)}static injectLightDomStyles(){if(W.lightDomStylesInjected||typeof document>"u"||(W.lightDomStylesInjected=!0,document.getElementById("mateu-app-light-styles")))return;const e=W.styles,t=Array.isArray(e)?e.map(i=>i?.cssText??"").join(`
`):e?.cssText??"";if(!t)return;const a=document.createElement("style");a.id="mateu-app-light-styles",a.textContent=t,document.head.appendChild(a)}fetchGlobalSearch(e){const t=this.component?.metadata;if(t?.globalSearchEnabled){if(clearTimeout(this._globalSearchTimer),!e){this.commandPaletteDataHits=[];return}this._globalSearchTimer=setTimeout(async()=>{try{const i=(await ca.runAction(this.baseUrl??"",t.rootRoute??"","","_globalsearch","cmd-palette",void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(r=>r.data).find(r=>r&&r._globalsearch);this.commandPaletteDataHits=i?._globalsearch??[]}catch{this.commandPaletteDataHits=[]}},250)}}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{this.component?.metadata?.commandCenterEnabled||((e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=""))},document.addEventListener("keydown",this._commandPaletteHandler),et.install(),this.addEventListener("compact-changed",this._compactHandler),this.addEventListener("mateu-open-ai",this._openAiHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler),this.removeEventListener("mateu-open-ai",this._openAiHandler)}updated(e){if(super.updated(e),Ym(this),this.component){const a=this.component.metadata;if(a){const i=a;if(Kd(this,i.menu,i.noBreadcrumbs,(r,s)=>this.selectRoute(r.consumedRoute,s,r.actionId,r.baseUrl,r.serverSideType,r.uriPrefix)),Oo(i.restSources),rd(i.components),i.appDataSource){const r=i.appDataSource.ref||i.appDataSource.url;r&&r!==this._fetchedAppDataRef&&(this._fetchedAppDataRef=r,Ca(i.appDataSource).then(s=>{s&&typeof s=="object"&&(Zt.value={...Zt.value,...s},this.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0})))}).catch(s=>console.error("app-scope data source fetch failed",s)))}if(uf(this,i.accentColor),i.favicon){let r=document.querySelector("link[rel~='icon']");r||(r=document.createElement("link"),r.rel="icon",document.head.appendChild(r)),r.href=i.favicon}e.has("component")&&(Um(i.requiredCapabilities,this),this.selectedRoute=i.homeRoute,this.selectedConsumedRoute=i.homeConsumedRoute,this.selectedServerSideType=i.homeServerSideType,this.selectedBaseUrl=cf(i,this.baseUrl),this.selectedUriPrefix=i.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return H.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};W.lightDomStylesInjected=!1;W.styles=[x`
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
            /* The app's brand accent (--mateu-accent, @App(accentColor)): a 3px line along the
               band's bottom. Not the primary colour — it marks whose app this is, never something
               to click. With no accent there is no line. */
            box-shadow: inset 0 -3px 0 var(--mateu-accent, transparent);
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
        .mateu-app-band2 .menu-band vaadin-menu-bar-button.mateu-nav-active {
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


  `,ms(".app-fab, .page-fab"),da];Q([g()],W.prototype,"filter",2);Q([g()],W.prototype,"instant",2);Q([g()],W.prototype,"selectedConsumedRoute",2);Q([g()],W.prototype,"selectedRoute",2);Q([g()],W.prototype,"selectedUriPrefix",2);Q([g()],W.prototype,"selectedBaseUrl",2);Q([g()],W.prototype,"selectedServerSideType",2);Q([g()],W.prototype,"selectedParams",2);Q([g()],W.prototype,"tilesMenuOption",2);Q([g()],W.prototype,"railOpenOption",2);Q([g()],W.prototype,"commandPaletteOpen",2);Q([g()],W.prototype,"commandPaletteQuery",2);Q([g()],W.prototype,"commandPaletteSelectedIndex",2);Q([g()],W.prototype,"commandPaletteDataHits",2);Q([g()],W.prototype,"pageCompact",2);Q([me("mateu-chat")],W.prototype,"chat",2);Q([g()],W.prototype,"isDark",2);Q([g()],W.prototype,"chatOpen",2);Q([me(".mateu-app-layout")],W.prototype,"vaadinAppLayout",2);W=Q([k("mateu-app")],W);var hf=Object.defineProperty,pf=Object.getOwnPropertyDescriptor,dt=(e,t,a,i)=>{for(var r=i>1?void 0:i?pf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&hf(t,a,r),r};let Oe=class extends _{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",a=>{const s=a.keyCode||a.which;(s===32||s===13)&&t.click()})}}render(){return n`
       `}};Oe.styles=x`
  `;dt([h()],Oe.prototype,"message",2);dt([h()],Oe.prototype,"dismiss",2);dt([h()],Oe.prototype,"learnMore",2);dt([h()],Oe.prototype,"learnMoreLink",2);dt([h()],Oe.prototype,"showLearnMore",2);dt([h()],Oe.prototype,"position",2);dt([h()],Oe.prototype,"cookieName",2);dt([g()],Oe.prototype,"_css",2);dt([me('[aria-label="cookieconsent"]')],Oe.prototype,"popup",2);Oe=dt([k("mateu-cookie-consent")],Oe);var mf=Object.defineProperty,ff=Object.getOwnPropertyDescriptor,Hn=(e,t,a,i)=>{for(var r=i>1?void 0:i?ff(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&mf(t,a,r),r};let Ji=class extends _{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return n`<slot></slot>`}};Ji.styles=x`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;Hn([h()],Ji.prototype,"target",2);Ji=Hn([k("mateu-event-interceptor")],Ji);const Zs=["a[href]","button","input","select","textarea","[tabindex]","vaadin-button","vaadin-text-field","vaadin-combo-box","vaadin-select","vaadin-checkbox","vaadin-date-picker","ui5-button","oj-c-button"].join(","),eo=e=>{const t=e;return t.hidden||t.hasAttribute("disabled")||t.getAttribute("aria-hidden")==="true"||t.getAttribute("tabindex")==="-1"?!1:!!(t.offsetParent||t.getClientRects().length)},vf=e=>{const t=[],a=i=>{i.querySelectorAll("*").forEach(r=>{r.matches(Zs)&&eo(r)&&t.push(r),r.shadowRoot&&a(r.shadowRoot),r instanceof HTMLSlotElement&&r.assignedElements().forEach(s=>{s.matches(Zs)&&eo(s)&&t.push(s),a(s)})})};return a(e),t.filter((i,r)=>t.indexOf(i)===r)},Vn=(e,t={})=>{const a=wr();let i=[];const r=()=>{i=vf(e)},s=o=>{if(o.key!=="Tab")return;if(r(),i.length===0){o.preventDefault(),e.focus();return}const l=i[0],c=i[i.length-1],u=wr();o.shiftKey&&(u===l||!u||!to(u,e))?(o.preventDefault(),c.focus()):!o.shiftKey&&u===c&&(o.preventDefault(),l.focus())};return e.addEventListener("keydown",s),requestAnimationFrame(()=>{r();const o=t.initialFocus?.()??i[0];o?o.focus():(e.hasAttribute("tabindex")||e.setAttribute("tabindex","-1"),e.focus())}),{refresh:r,release(){e.removeEventListener("keydown",s);const o=wr();(!o||o===document.body||to(o,e))&&a?.focus?.()}}},wr=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},to=(e,t)=>{let a=e;for(;a;){if(a===t)return!0;a=a.parentNode??a.host??null}return!1};var bf=Object.defineProperty,gf=Object.getOwnPropertyDescriptor,Gn=(e,t,a,i)=>{for(var r=i>1?void 0:i?gf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&bf(t,a,r),r};let Qi=class extends Bt{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,this.releaseFocusTrap(),setTimeout(()=>{this.removeSelfFromOwnerChildren()||this.parentElement?.removeChild(this)},500)},this.onKeydown=e=>{e.key==="Escape"&&this.opened&&(e.stopPropagation(),this.close())}}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this.onKeydown)}disconnectedCallback(){super.disconnectedCallback(),this.releaseFocusTrap()}releaseFocusTrap(){this.focusTrap?.release(),this.focusTrap=void 0}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const i=this.component.metadata;this.state=i.initialData}const t=this.renderRoot.querySelector('[role="dialog"]'),a=this.component?.metadata?.modeless;this.opened&&t&&!this.focusTrap&&!a?this.focusTrap=Vn(t):this.focusTrap&&this.opened&&this.focusTrap.refresh()}render(){if(!this.opened)return n``;const e=this.component.metadata,t=Ga(e.headerTitle,this.state,this.data,this.appState,this.appData),a=!!(t||e.header||e.closeButtonOnHeader),i=[e.width?`width:${e.width};`:"min-width:min(90vw,28rem);",e.height?`height:${e.height};`:"",e.top?`margin-top:${e.top};`:""].join("");return n`
            <div class="backdrop ${e.modeless?"modeless":""}"
                 @click="${r=>{!e.modeless&&r.target===r.currentTarget&&this.close()}}">
                <div class="dialog ${e.noPadding?"no-padding":""} ${this.component?.cssClasses??""}"
                     role="dialog"
                     aria-modal="${e.modeless?"false":"true"}"
                     aria-label="${t||"Dialog"}"
                     style="${i} ${this.component?.style??""}">
                    ${a?n`
                        <div class="dialog-header">
                            <mateu-event-interceptor .target="${this}" style="flex:1; min-width:0;">
                                ${t?n`<span class="dialog-title">${t}</span>`:d}
                                ${e.header?w(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):d}
                            </mateu-event-interceptor>
                            ${e.closeButtonOnHeader?n`<button class="dialog-close" @click="${this.close}" aria-label="Close">✕</button>`:d}
                        </div>`:d}
                    ${e.content?n`
                        <div class="dialog-body">
                            <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width:100%;">
                                ${w(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:d}
                    ${e.footer?n`
                        <div class="dialog-footer">
                            <mateu-event-interceptor .target="${this}" style="width:100%;">
                                ${w(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:d}
                </div>
            </div>
        `}};Qi.styles=[x`
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
    `,da];Gn([g()],Qi.prototype,"opened",2);Qi=Gn([k("mateu-dialog")],Qi);var yf=Object.defineProperty,$f=Object.getOwnPropertyDescriptor,Ma=(e,t,a,i)=>{for(var r=i>1?void 0:i?$f(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&yf(t,a,r),r};let _e=class extends Bt{constructor(){super(...arguments),this.opened=!1,this.maximizeSteps=0,this.collapsed=!1,this.pagerMenuOpen=!1,this.onGuidedProgress=e=>{const t=e.detail;t&&t.total>0&&(this.guidedProgress=t)},this.close=()=>{this.opened=!1,this.releaseLayoutInset(),this.releaseFocusTrap(),setTimeout(()=>{this.removeSelfFromOwnerChildren()||this.parentElement?.removeChild(this)},300)},this._escListener=e=>{if(e.key!=="Escape")return;const a=this.getRootNode().querySelectorAll("mateu-drawer, mateu-dialog");a[a.length-1]===this&&(e.stopPropagation(),this.close())}}jumpToStep(e){if(this.pagerMenuOpen=!1,!e)return;(this.renderRoot.querySelector(".content mateu-component")??this.renderRoot.querySelector("mateu-component"))?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"goToStep",parameters:{_stepId:e}},bubbles:!0,composed:!0}))}effectiveWidth(e){if(e.width)return e.width;if(!e.size)return;const t=_e.SIZE_LADDER,a=Math.max(0,t.indexOf(e.size)),i=Math.min(t.length-1,a+this.maximizeSteps);return _e.SIZE_WIDTHS[t[i]]}canMaximize(e){if(!e.maximizable)return!1;const t=_e.SIZE_LADDER;return Math.max(0,t.indexOf(e.size??"m"))+this.maximizeSteps<t.length-1}firstUpdated(){requestAnimationFrame(()=>this.opened=!0),this.addEventListener("mateu-guided-progress",this.onGuidedProgress);const e=this.component?.metadata;e&&requestAnimationFrame(()=>this.applyLayoutInset(e))}releaseFocusTrap(){this.focusTrap?.release(),this.focusTrap=void 0}applyLayoutInset(e){if(!e.layout)return;const t=document.querySelector("mateu-ui");if(!t)return;const a=e.position??"end",i=a==="bottom"?"var(--mateu-drawer-height, 50vh)":this.effectiveWidth(e)??"648px";this._insetProp=a==="start"?"paddingLeft":a==="bottom"?"paddingBottom":"paddingRight",t.style.transition="padding .25s ease",t.style[this._insetProp]=i}releaseLayoutInset(){if(!this._insetProp)return;const e=document.querySelector("mateu-ui");e&&(e.style[this._insetProp]=""),this._insetProp=void 0}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const r=this.component.metadata;this.state=r.initialData}const t=this.component?.metadata,a=this.renderRoot.querySelector('[role="dialog"]');this.opened&&!!a&&!t?.modeless&&!t?.layout&&!this.focusTrap?this.focusTrap=Vn(a):this.focusTrap&&this.opened&&this.focusTrap.refresh()}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._escListener)}disconnectedCallback(){document.removeEventListener("keydown",this._escListener),this.releaseLayoutInset(),this.releaseFocusTrap(),super.disconnectedCallback()}render(){const e=this.component.metadata,t=e.position??"end",a=Ga(e.headerTitle,this.state,this.data,this.appState,this.appData),i=Ga(e.subtitle,this.state,this.data,this.appState,this.appData),r=this.effectiveWidth(e),s=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0;return n`
        ${e.modeless||e.layout?d:n`
            <div class="backdrop ${this.opened?"open":""}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${t} ${this.opened?"open":""} ${this.collapsed?"collapsed":""} ${this.component?.cssClasses??""}"
                role="dialog"
                aria-modal="${!e.modeless}"
                aria-label="${a??d}"
                style="${r&&t!=="bottom"?`width: ${r};`:""}${this.component?.style??""}"
        >
            <header>
                ${a?n`<div class="titles"><h3>${a}</h3>${i?n`<span class="subtitle">${i}</span>`:d}</div>`:n`<span class="spacer"></span>`}
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
                    <mateu-event-interceptor .target="${this}">${w(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
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
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${w(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
            </div>
            ${e.footer?n`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${w(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:d}
            `}
        </section>
       `}};_e.SIZE_LADDER=["s","m","l","xl"];_e.SIZE_WIDTHS={s:"464px",m:"648px",l:"968px",xl:"90vw"};_e.styles=[x`
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
  `,da];Ma([g()],_e.prototype,"opened",2);Ma([g()],_e.prototype,"maximizeSteps",2);Ma([g()],_e.prototype,"collapsed",2);Ma([g()],_e.prototype,"guidedProgress",2);Ma([g()],_e.prototype,"pagerMenuOpen",2);_e=Ma([k("mateu-drawer")],_e);var wf=Object.defineProperty,xf=Object.getOwnPropertyDescriptor,fe=(e,t,a,i)=>{for(var r=i>1?void 0:i?xf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&wf(t,a,r),r};const kf="(max-width: 599px)";function ao(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let re=class extends _{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocPlacement="column",this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,a=t.banners??[],i=t.append??!1;i?this.actionBanners=[...this.actionBanners,...a]:(this._clearActionBannerTimers(),this.actionBanners=a);const r=i?this.actionBanners.length-a.length:0;a.forEach((s,o)=>{if(s.timeoutSeconds&&s.timeoutSeconds>0){const l=r+o;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,u)=>u!==l)},s.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const a=parseInt(t[1],10)-1;a>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(a))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,a=this.shadowRoot?.querySelector("mateu-content-header");let i=a?a.getBoundingClientRect().bottom:0;const r=this._tocBar();r&&(i=Math.max(i,r.getBoundingClientRect().bottom));for(const l of e){if(!l.classList.contains("mateu-section--sticky"))continue;const c=l.getBoundingClientRect();c.top<=i+t+2&&(i=Math.max(i,c.bottom))}const s=i+t+4;let o=0;this._tocEntries.forEach((l,c)=>{l.el.getBoundingClientRect().top<=s&&(o=c)}),this._activeToc=o}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy(),this._syncAside(!1)}_alignAside(){const e=this.shadowRoot?.querySelector(".page-body");if(!e||this._workEnd===void 0)return;const t=Math.max(0,Math.round(this._workEnd-e.getBoundingClientRect().right));this.style.setProperty("--mateu-toc-shift",`${t}px`)}_syncAside(e){e&&!this._releaseAside?this._releaseAside=Qu(this,(t,a)=>{this._workEnd=a,t==="aside"&&requestAnimationFrame(()=>this._alignAside()),t!==this._tocPlacement&&(this._tocPlacement=t,requestAnimationFrame(()=>this._layoutStickyTops()))}):!e&&this._releaseAside&&(this._releaseAside(),this._releaseAside=void 0,this._tocPlacement="column")}updated(e){if(super.updated(e),this.toggleAttribute("data-hero-top",this._heroOnTop()),e.has("_activeToc")&&this._revealActiveInBar(),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")){const t=this.component?.metadata?.level??0;this.toggleAttribute("data-nested",t>0),this._scheduleStaticBannerTimeouts();const a=this.component?.metadata?.pageWidth==="edgeToEdge";this.toggleAttribute("data-edge",a),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")||a},bubbles:!0,composed:!0})),this._scheduleTocRebuild()}}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(a=>clearTimeout(a)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((a,i)=>{a.timeoutSeconds&&a.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,i])},a.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,a)=>a!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return U(e,this.state,this.data)}_renderBanner(e,t){const a=this._evalBannerText(e.title),i=this._evalBannerText(e.description);return n`
            <div class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${a||e.hasCloseButton?n`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${a??""}</span>
                        ${e.hasCloseButton?n`
                            <button class="banner-close" @click=${t} title="Dismiss" aria-label="Dismiss">✕</button>
                        `:d}
                    </div>
                `:d}
                ${i?n`<p>${i}</p>`:d}
            </div>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(".mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(s=>({title:this._sectionTitle(s),el:s})).filter(s=>!!s.title),a=this.component?.metadata?.toc,i=t.length>4&&e.every(s=>!s.closest("vaadin-horizontal-layout")),r=(a===!0?!0:a===!1?!1:i)&&t.length>0;this._tocEntries=t,this._tocVisible=r,this._syncAside(r&&!this.hasAttribute("data-nested")),this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),r?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header"),t=!window.matchMedia?.(kf).matches,a=this._tocVisible&&e&&t?e.offsetHeight:0;this.style.setProperty("--mateu-header-h",a+"px"),this._headerH=a+(this._tocBar()?.offsetHeight??0);const i=12;let r=this._headerH+i;for(const s of this._sectionCards())s.classList.contains("mateu-section--sticky")&&(s.style.top=r+"px",r+=s.offsetHeight+i)}_revealActiveInBar(){const e=this._tocBar()?.querySelector("nav"),t=e?.querySelector(".page-toc__item.is-active");if(!e||!t)return;const a=t.offsetLeft-e.offsetLeft;(a<e.scrollLeft||a+t.offsetWidth>e.scrollLeft+e.clientWidth)&&e.scrollTo({left:Math.max(0,a-16),behavior:"smooth"})}_tocBar(){return this._tocVisible&&this._tocPlacement==="bar"?this.shadowRoot?.querySelector(".page-toc"):null}_scrollContainer(){let e=ao(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=ao(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const a=12;let i=this._headerH+a;for(const l of this._sectionCards()){if(l===t.el)break;l.classList.contains("mateu-section--sticky")&&(i+=l.offsetHeight+a)}const r=this._scrollContainer(),s=r?r.getBoundingClientRect().top:0,o=t.el.getBoundingClientRect().top-s-i;(r??window).scrollBy({top:o,behavior:"smooth"})}_showHeaderBand(){const e=this.component?.metadata,t=!!(e?.title||e?.subtitle||e?.overline||e?.titlePlaceholder||e?.toolbar?.length),a=!!this.component?.children?.some(i=>i.metadata?.type===v.Crud);return t&&!a&&!this._hasWelcomeBanner()}_heroOnTop(){const e=this.component?.metadata;return!!!(e?.title||e?.subtitle||e?.overline||e?.titlePlaceholder||e?.toolbar?.length)&&this._hasWelcomeBanner()}_hasWelcomeBanner(){const e=t=>t?.metadata?.type===v.HeroSection?!0:(t?.children??[]).some(e);return(this.component?.children??[]).some(e)}render(){const e=this.component?.metadata,i=[...(e?.banners??[]).map((s,o)=>({banner:s,index:o})).filter(({index:s})=>!this.dismissedStaticBannerIndices.has(s)).map(({banner:s,index:o})=>({banner:s,onDismiss:()=>this._dismissStaticBanner(o)})),...this.actionBanners.map((s,o)=>({banner:s,onDismiss:()=>this._dismissActionBanner(o)}))],r=n`
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
            ${i.length>0?n`
                <div class="page-banners">
                    ${i.map(({banner:s,onDismiss:o})=>this._renderBanner(s,o))}
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
                ${e?.footer?.map(s=>w(this,s,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return n`<div style="display: flex; flex-direction: column; width: 100%;">${r}</div>`}};re.styles=[x`
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
    `,da];fe([h()],re.prototype,"component",2);fe([h()],re.prototype,"baseUrl",2);fe([h()],re.prototype,"state",2);fe([h()],re.prototype,"data",2);fe([h()],re.prototype,"appState",2);fe([h()],re.prototype,"appData",2);fe([h()],re.prototype,"value",2);fe([h({type:Boolean})],re.prototype,"standalone",2);fe([g()],re.prototype,"actionBanners",2);fe([g()],re.prototype,"dismissedStaticBannerIndices",2);fe([g()],re.prototype,"_tocEntries",2);fe([g()],re.prototype,"_activeToc",2);fe([g()],re.prototype,"_tocVisible",2);fe([g()],re.prototype,"_tocPlacement",2);re=fe([k("mateu-page")],re);const _s=x`
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
`,Na=e=>ue`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,Kn=Na(ue`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),Yn=Na(ue`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),Xn=Na(ue`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`);Na(ue`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`);const _f=Na(ue`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`);Na(ue`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);function Jn(e,t,a=new Set){if(!(!e||typeof e!="object"||a.has(e))){a.add(e),Array.isArray(e)||t(e);for(const i of Array.isArray(e)?e:Object.values(e))i&&typeof i=="object"&&Jn(i,t,a)}}const Cf=e=>e&&e.metadata&&typeof e.metadata.type=="string"?e.metadata.type:void 0;function Sf(e,t){if(!e||typeof e!="object")return{fields:[],actions:[]};const a=[],i=new Map;let r;Jn(e,m=>{const b=Cf(m);b==="FormField"&&m.metadata.fieldId?a.push(m.metadata):b==="Page"&&!r?r=m.metadata:b==="Button"&&m.metadata.actionId&&(i.has(m.metadata.actionId)||i.set(m.metadata.actionId,m.metadata.label))});const s=t&&typeof t=="object"?t:e.initialData&&typeof e.initialData=="object"?e.initialData:{},o=new Set,l=[];for(const m of a){if(o.has(m.fieldId))continue;o.add(m.fieldId);const b={id:m.fieldId,label:m.label??m.fieldId,dataType:m.dataType??"string",stereotype:m.stereotype??"regular",required:!!m.required,readOnly:!!m.readOnly};s&&Object.prototype.hasOwnProperty.call(s,m.fieldId)&&(b.value=s[m.fieldId]),Array.isArray(m.options)&&m.options.length&&(b.options=m.options.map($=>$&&typeof $=="object"?{value:$.value,label:$.label??String($.value??"")}:{value:$,label:String($)})),l.push(b)}const c=[],u=new Set;for(const m of Array.isArray(e.actions)?e.actions:[]){if(!m||!m.id||u.has(m.id))continue;u.add(m.id);const b={id:m.id,label:i.get(m.id)??m.id};m.shortcut&&(b.shortcut=m.shortcut),c.push(b)}for(const[m,b]of i)u.has(m)||(u.add(m),c.push({id:m,label:b??m}));const p={fields:l,actions:c},f=r&&(r.pageTitle||r.title)||void 0;return f&&(p.title=f),e.route&&(p.route=e.route),e.serverSideType&&(p.serverSideType=e.serverSideType),(e.pageType||r&&r.pageType)&&(p.pageType=e.pageType||r.pageType),p}function Ef(e){const t=[],a=i=>{const r=i.shadowRoot??i;r.querySelectorAll?.("mateu-component")?.forEach(o=>{const l=o.component;l&&t.push(l),o.shadowRoot&&a(o)}),r.querySelectorAll?.("*").forEach(o=>{o.shadowRoot&&o.tagName!=="MATEU-COMPONENT"&&a(o)})};return a(e),t}function If(e=document,t){let a=null,i=-1;for(const r of Ef(e)){const s=Sf(r,t),o=s.fields.length+s.actions.length+(s.title?1:0);o>i&&(a=s,i=o)}return a}class Tf{constructor(){this.buffer="",this.data=[],this.hasData=!1}push(t){this.buffer+=t;const a=[];for(;;){const i=/\r\n|\r|\n/.exec(this.buffer);if(!i||i[0]==="\r"&&i.index===this.buffer.length-1)break;const r=this.buffer.slice(0,i.index);this.buffer=this.buffer.slice(i.index+i[0].length),this.line(r,a)}return a}end(){const t=[];return this.buffer&&(this.line(this.buffer.replace(/\r$/,""),t),this.buffer=""),this.dispatch(t),t}line(t,a){if(t===""){this.dispatch(a);return}if(t.startsWith(":"))return;const i=t.indexOf(":");if((i<0?t:t.slice(0,i))!=="data")return;let s=i<0?"":t.slice(i+1);s.startsWith(" ")&&(s=s.slice(1)),this.data.push(s),this.hasData=!0}dispatch(t){this.hasData&&t.push(this.data.join(`
`)),this.data=[],this.hasData=!1}}const Qn=e=>typeof e=="number"&&Number.isFinite(e);function Pf(e){const t=e.trim();if(t.startsWith("{")){let a=null;try{const i=JSON.parse(t);i&&typeof i=="object"&&!Array.isArray(i)&&(a=i)}catch{}if(a){if("inputTokens"in a||"outputTokens"in a||"totalTokens"in a)return{kind:"usage",usage:a};if(typeof a.event=="string"){const i=a.detail??{};switch(a.event){case"agent-delta":return{kind:"delta",text:typeof i.text=="string"?i.text:""};case"agent-status":return{kind:"status",detail:i};case"agent-tool":return{kind:"tool",detail:i};case"agent-error":return{kind:"error",message:String(i.message??"Error desconocido del agente")};default:return{kind:"event",event:a.event,detail:a.detail??{}}}}}}return{kind:"text",text:e}}function Of(e){if(!e)return!0;const t=[e.inputTokens,e.outputTokens,e.totalTokens].filter(Qn);return t.length===0||t.every(a=>a===0)}class zf{constructor(){this.text="",this.streamed=!1}delta(t){return this.text+=t,this.streamed=!0,this.text}line(t){return this.streamed?(this.text=t,this.streamed=!1):this.text=this.text?this.text+`
`+t:t,this.text}error(t){return this.text="⚠️ "+t,this.streamed=!1,this.text}}class Rf{constructor(t){this.steps=[],this.answering=!1,this.reported=!1,this.since=t}status(t,a){this.reported=!0;const i=typeof t.text=="string"?t.text:void 0;(t.phase!==this.phase||i!==this.statusText||this.answering)&&(this.since=a),this.phase=t.phase,this.statusText=i,this.answering=!1}tool(t,a){this.reported=!0;const i=t.name??"herramienta";if(t.phase==="start"){this.steps=[...this.steps,{name:i,server:t.server,kind:t.kind,running:!0}],this.since=a,this.answering=!1;return}const r=this.steps.slice();let s=r.length-1;for(;s>=0&&!(r[s].running&&r[s].name===i);)s--;const o={name:i,server:t.server,kind:t.kind,ms:t.ms,error:t.error,running:!1};s>=0?r[s]=o:r.push(o),this.steps=r,this.since=a}text(t){this.answering||(this.since=t),this.answering=!0}get runningTool(){for(let t=this.steps.length-1;t>=0;t--)if(this.steps[t].running)return this.steps[t]}line(t){const a=Math.max(0,Math.floor((t-this.since)/1e3)),i=s=>a>0?`${s} ${a} s`:s,r=this.runningTool;return r?i(`Llamando a ${r.name}…`):this.answering?"Respondiendo…":this.reported?i(this.statusText||"Pensando…"):null}}function Af(e){return Qn(e)?e<1e3?`${Math.round(e)} ms`:`${(e/1e3).toFixed(1).replace(".",",")} s`:""}const Lf={en:{title:"Assistant",expand:"Widen the assistant",restore:"Restore the width",close:"Close the assistant",resize:"Assistant width",empty:"Ask whatever you need: about this screen, your data or how to do something.",placeholder:"Write a message…",send:"Send"},es:{title:"Asistente",expand:"Ampliar el asistente",restore:"Ancho normal",close:"Cerrar el asistente",resize:"Ancho del asistente",empty:"Pregunta lo que necesites: sobre esta pantalla, tus datos o cómo hacer algo.",placeholder:"Escribe un mensaje…",send:"Enviar"}},Df=e=>(typeof document<"u"&&document.documentElement?.lang||typeof navigator<"u"&&navigator.language||"").toLowerCase().startsWith("es")?"es":"en",kt=(e,t)=>Lf[Df()][e],Ze={default:460,min:320,max:720},Ff=60,Zn="mateu-chat-width",ur=e=>e==null||!Number.isFinite(e)?Ze.default:Math.round(Math.min(Ze.max,Math.max(Ze.min,e))),el=()=>{try{return typeof localStorage>"u"?void 0:localStorage}catch{return}},Mf=(e=el())=>{try{const t=e?.getItem(Zn);return t?ur(Number(t)):Ze.default}catch{return Ze.default}},xr=(e,t=el())=>{const a=ur(e);try{t?.setItem(Zn,String(a))}catch{}return a},Nf=(e,t,a,i=!1)=>ur(e+(i?t-a:a-t)),io=24;var qf=Object.defineProperty,Bf=Object.getOwnPropertyDescriptor,V=(e,t,a,i)=>{for(var r=i>1?void 0:i?Bf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&qf(t,a,r),r};const ro=e=>H.get()?.renderHeaderIconButton?.(e)??n`
        <button class="chat-header-btn ${e.cssClasses??""}" @click="${e.onClick}"
                title="${e.title??e.label}" aria-label="${e.label}">
            ${G(e.icon,"width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem);")}
        </button>`,so=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],jf=e=>so[Math.abs(e??0)%so.length],Uf=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let j=class extends _{constructor(){super(...arguments),this.localAgentUrl="http://127.0.0.1:8776",this.localAgentAlive=!1,this.menu=[],this.chatSessionId=Te(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.label=void 0,this.width=Mf(),this.resizing=!1,this.dragStart=void 0,this.isRtl=()=>getComputedStyle(this).direction==="rtl",this.onResizeStart=e=>{e.button===0&&(e.preventDefault(),this.dragStart={x:e.clientX,width:this.width},this.resizing=!0,e.currentTarget.setPointerCapture?.(e.pointerId))},this.onResizeMove=e=>{this.dragStart&&(this.width=Nf(this.dragStart.width,this.dragStart.x,e.clientX,this.isRtl()))},this.onResizeEnd=e=>{this.dragStart&&(this.dragStart=void 0,this.resizing=!1,e.currentTarget.releasePointerCapture?.(e.pointerId),this.width=xr(this.width))},this.onResizeKey=e=>{const t=this.isRtl()?"ArrowLeft":"ArrowRight",a=this.isRtl()?"ArrowRight":"ArrowLeft";let i;e.key===t?i=this.width+io:e.key===a?i=this.width-io:e.key==="Home"?i=Ze.min:e.key==="End"&&(i=Ze.max),i!==void 0&&(e.preventDefault(),this.width=xr(ur(i)))},this.onResizeReset=()=>{this.width=xr(Ze.default)},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.progressTick=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,a=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=a,this.send(new CustomEvent("submit",{detail:{value:a},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{const e=new AbortController,t=setTimeout(()=>e.abort(),1200),a=await fetch(this.localAgentUrl+"/health",{signal:e.signal});clearTimeout(t),this.localAgentAlive=a.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{const t=e.target,a=Array.from(t.files??[]);if(t.value="",!(!a.length||!this.uploadUrl)){this.uploading=!0;try{const i=new FormData;i.append("sessionId",this.chatSessionId);for(const p of a)i.append("files",p,p.name);const r={},s=localStorage.getItem("__mateu_auth_token");s&&(r.Authorization="Bearer "+s);const o=sessionStorage.getItem("__mateu_sesion_id");o&&(r["X-Session-Id"]=o);const l=await fetch(this.uploadUrl,{method:"POST",headers:r,body:i});if(!l.ok)throw new Error(`Upload failed: ${l.status}`);const u=((await l.json()).files??[]).filter(p=>p&&p.path);this.attachments=[...this.attachments,...u]}catch(i){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${i instanceof Error?i.message:i}`,"agent")}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim(),a=this.localAgentAlive?this.localAgentUrl+"/mateu/agent/stream":this.sseUrl,i=this.attachments;if(!t&&i.length===0||!a)return;const r=i.length?`${t}${t?`

`:""}📎 ${i.map(l=>l.name).join(", ")}`:t;this.addMessage(r,"user"),this.attachments=[];const s=this.addMessage("","agent");this.startLoading();let o="";try{const l=()=>{const T={Accept:"text/event-stream","Content-Type":"application/json"},O=localStorage.getItem("__mateu_auth_token");O&&(T.Authorization="Bearer "+O);const le=sessionStorage.getItem("__mateu_sesion_id");return le&&(T["X-Session-Id"]=le),T},c=this.contextProvider?.(),u=If(document,c?.componentState),p=!!u&&(u.fields.length>0||u.actions.length>0||!!u.title),f=JSON.stringify({message:t,sessionId:this.chatSessionId,...i.length&&{attachments:i},...c!=null&&{context:c},...p&&{screen:u},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const m=()=>fetch(a,{method:"POST",headers:l(),body:f});let b=await m();if(b.status===401&&(b=await Fo(new Error("401"),m).catch(()=>b)),!b.ok){const T=await b.text();throw new Error(`Servidor respondió ${b.status}: ${T}`)}const $=b.body?.getReader();if(!$)throw new Error("No se pudo obtener el reader del stream.");const y=new TextDecoder,E=new Tf,z=new zf,S=new Rf(Date.now());this.progress=S;const I=T=>{const O=Pf(T);switch(O.kind){case"usage":Of(O.usage)||(this.tokenUsage={...this.tokenUsage,...O.usage});return;case"delta":o=z.delta(O.text),S.text(Date.now());break;case"text":o=z.line(O.text),S.text(Date.now());break;case"error":o=z.error(O.message);break;case"status":S.status(O.detail,Date.now());break;case"tool":S.tool(O.detail,Date.now());break;case"event":this.dispatchEvent(new CustomEvent(O.event,{detail:O.detail,bubbles:!0,composed:!0}));return}this.progressTick++,(O.kind==="delta"||O.kind==="text"||O.kind==="error")&&this.updateMessage(s,o)};for(;;){const{done:T,value:O}=await $.read();if(T){E.push(y.decode()),E.end().forEach(I);break}E.push(y.decode(O,{stream:!0})).forEach(I)}o||this.updateMessage(s,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(l){console.error("Error en el flujo SSE:",l);const c=l?.message??String(l);(c==="Failed to fetch"||c==="network error"||c==="Load failed")&&!o?this.updateMessage(s,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(s,"⚠️ Error: "+c)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}updated(e){super.updated(e),e.has("width")&&this.style.setProperty("--mateu-chat-width",`${this.width}px`),this.style.getPropertyValue("--mateu-chat-wide")||this.style.setProperty("--mateu-chat-wide",`${Ff}vw`)}connectedCallback(){super.connectedCallback(),this.probeLocalAgent();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=a=>{console.error("Error de reconocimiento: "+a.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const a={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,a],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((a,i)=>i===e?{...a,text:t}:a),this.scrollBottom()}buildMenuContext(e,t=[]){const a=[];for(const i of e){if(i.separator||i.remote)continue;const r=[...t,i.label];if(i.submenus&&i.submenus.length>0)a.push(...this.buildMenuContext(i.submenus,r));else{const s={path:r,navigation:{route:i.route,consumedRoute:i.consumedRoute,actionId:i.actionId??"",baseUrl:i.baseUrl,serverSideType:i.serverSideType,uriPrefix:i.uriPrefix}};i.description&&(s.description=i.description),a.push(s)}}return a}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,this.progress=void 0,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}progressLine(){return this.progress?.line(Date.now())??`Thinking… ${this.elapsedSeconds}s`}renderToolSteps(){const e=this.progress?.steps??[];return e.length?n`
            <ul class="tool-steps" aria-label="Herramientas usadas">
                ${e.map(t=>n`
                    <li class="tool-step ${t.running?"running":t.error?"failed":"done"}"
                        title="${t.server?`${t.name} (${t.server})`:t.name}">
                        <span class="tool-step-icon">${t.running?"…":t.error?"✕":"✓"}</span>
                        <span class="tool-step-name">${t.name}</span>
                        ${t.running?d:n`<span class="tool-step-time">${Af(t.ms)}</span>`}
                        ${t.error?n`<span class="tool-step-error">${t.error}</span>`:d}
                    </li>
                `)}
            </ul>
        `:d}render(){return n`
            <div class="chat-container">
                <div class="chat-header">
                    ${G("vaadin:comments-o","","chat-title-icon")}
                    <h2 class="chat-title">${this.label?.trim()||kt("title")}</h2>
                    ${this.localAgentAlive?n`<span class="local-agent-badge" title="Hablando con tu CLI local (companion en ${this.localAgentUrl}) — sin api key">agente local</span>`:d}
                    <div class="chat-header-actions">
                        ${ro({icon:this.expanded?"vaadin:compress":"vaadin:expand-full",label:kt(this.expanded?"restore":"expand"),cssClasses:"chat-expand",onClick:()=>this.toggleExpanded()})}
                        ${ro({icon:"lumo:cross",label:kt("close"),cssClasses:"chat-close",onClick:()=>this.closeChat()})}
                    </div>
                </div>
                <div class="scroll-container">
                    ${this.items.length===0&&!this.loading?n`
                        <div class="chat-empty">
                            ${G("vaadin:comments-o","","chat-empty-icon")}
                            <p>${kt("empty")}</p>
                        </div>`:d}
                    <div class="message-list" role="list">
                        ${this.items.map((e,t)=>n`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${jf(e.userColorIndex)};">${Uf(e.userName)}</div>
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
                            title="Dictar"
                            style="color: ${this.listening?"red":"var(--lumo-contrast-50pct, #767676)"};"
                            @click="${this.startListening}"
                            ?disabled="${!this.recognitionAvailable}"
                    >${_f}</button>
                    <input class="msg-input"
                           placeholder="${kt("placeholder")}"
                           aria-label="${kt("placeholder")}"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">${kt("send")}</button>
                </div>
                <div class="resize-handle ${this.resizing?"resizing":""}" role="separator"
                     aria-orientation="vertical" tabindex="0" aria-label="${kt("resize")}"
                     aria-valuemin="${Ze.min}" aria-valuemax="${Ze.max}" aria-valuenow="${this.width}"
                     @pointerdown="${this.onResizeStart}" @pointermove="${this.onResizeMove}"
                     @pointerup="${this.onResizeEnd}" @pointercancel="${this.onResizeEnd}"
                     @keydown="${this.onResizeKey}" @dblclick="${this.onResizeReset}"></div>
            </div>
        `}};j.styles=[_s,x`
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
    `];V([h({attribute:!1})],j.prototype,"contextProvider",2);V([h()],j.prototype,"localAgentUrl",2);V([h({attribute:!1})],j.prototype,"mcpUrl",2);V([g()],j.prototype,"localAgentAlive",2);V([h()],j.prototype,"sseUrl",2);V([h()],j.prototype,"uploadUrl",2);V([h({attribute:!1})],j.prototype,"menu",2);V([g()],j.prototype,"attachments",2);V([g()],j.prototype,"uploading",2);V([me(".file-input")],j.prototype,"fileInputElement",2);V([h({type:Boolean,reflect:!0})],j.prototype,"expanded",2);V([h()],j.prototype,"label",2);V([g()],j.prototype,"width",2);V([g()],j.prototype,"resizing",2);V([h()],j.prototype,"items",2);V([me(".scroll-container")],j.prototype,"scrollContainer",2);V([me(".msg-input")],j.prototype,"messageInputElement",2);V([g()],j.prototype,"recognition",2);V([g()],j.prototype,"listening",2);V([g()],j.prototype,"recognitionAvailable",2);V([g()],j.prototype,"loading",2);V([g()],j.prototype,"elapsedSeconds",2);V([g()],j.prototype,"tokenUsage",2);V([g()],j.prototype,"progress",2);V([g()],j.prototype,"progressTick",2);j=V([k("mateu-chat")],j);var Wf=Object.defineProperty,Hf=Object.getOwnPropertyDescriptor,ci=(e,t,a,i)=>{for(var r=i>1?void 0:i?Hf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Wf(t,a,r),r};let ia=class extends _{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([ke(()=>import("./vendor-chartjs.js").then(i=>i.a),[]),ke(()=>import("./vendor-chartjs.js").then(i=>i.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const a={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,a)}handleSlotChange(){}render(){return n`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};ia.styles=x`
    /* the host's inline height (Chart.style) must reach the canvas parent — chart.js
       measures .container to size the canvas when maintainAspectRatio is false */
    :host {
        display: block;
    }
    .container {
        height: 100%;
        position: relative;
    }
  `;ci([h()],ia.prototype,"type",2);ci([h()],ia.prototype,"data",2);ci([h()],ia.prototype,"options",2);ci([me("#chart")],ia.prototype,"chartElement",2);ia=ci([k("mateu-chart")],ia);var Vf=Object.defineProperty,Gf=Object.getOwnPropertyDescriptor,Cs=(e,t,a,i)=>{for(var r=i>1?void 0:i?Gf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Vf(t,a,r),r};let ri=class extends _{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await ke(async()=>{const{default:i}=await import("./vendor-diagrams.js");return{default:i}},__vite__mapDeps([0,1]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const a={container:this.divElement};this.chart=new t(a),this.chart.importXML(e)}handleSlotChange(){}render(){return n`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};ri.styles=x`
  `;Cs([h()],ri.prototype,"xml",2);Cs([me("#canvas")],ri.prototype,"divElement",2);ri=Cs([k("mateu-bpmn")],ri);var Kf=Object.defineProperty,Yf=Object.getOwnPropertyDescriptor,qa=(e,t,a,i)=>{for(var r=i>1?void 0:i?Yf(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Kf(t,a,r),r};const kr=160,Ke=56,Xf=220,oo=110,_t=60,Jf={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},Qf={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},Zf=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function ev(){return"step-"+Math.random().toString(36).slice(2,8)}let zt=class extends _{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(o=>{t[o.id]=0});let a=!0;for(;a;)a=!1,e.forEach(o=>{if(o.preconditionStepId!=null&&t[o.preconditionStepId]!==void 0){const l=t[o.preconditionStepId]+1;l>t[o.id]&&(t[o.id]=l,a=!0)}});const i={};e.forEach(o=>{const l=t[o.id]??0;(i[l]??=[]).push(o.id)});const r={...this.positions};let s=!1;Object.entries(i).forEach(([o,l])=>{const c=Number(o);l.forEach((u,p)=>{r[u]||(r[u]={x:_t+c*Xf,y:_t+p*oo},s=!0)})}),s&&(this.positions=r)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addStep(){const e=ev(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const a=Object.values(this.positions).map(r=>r.y),i=a.length?Math.max(...a)+oo:_t;this.positions={...this.positions,[e]:{x:_t,y:i}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(i=>i.id!==e).map(i=>i.preconditionStepId===e?{...i,preconditionStepId:void 0}:i)};const{[e]:t,...a}=this.positions;this.positions=a,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const a=this.positions[t]??{x:0,y:0},i=this.toSvgPoint(e);this.dragOffset={x:i.x-a.x,y:i.y-a.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(i=>i.x))+kr+_t:600,a=e.length?Math.max(...e.map(i=>i.y))+Ke+_t:400;return{w:Math.max(t,600),h:Math.max(a,400)}}render(){const{w:e,h:t}=this.canvasSize(),a=this.wf.steps??[];return n`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():""}
                <div class="workspace">
                    <div class="canvas-wrap">
                        <svg width="${e}" height="${t}" class="canvas"
                             @click="${i=>{i.target===i.currentTarget&&(this.selectedId=null)}}">
                            <defs>
                                <marker id="arrow" markerWidth="8" markerHeight="8"
                                        refX="6" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/>
                                </marker>
                            </defs>
                            ${a.map(i=>this.renderArrow(i))}
                            ${a.map(i=>this.renderNode(i))}
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
                    ${Kn}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${Yn}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Xn}
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
        `}renderArrow(e){if(!e.preconditionStepId)return ue``;const t=this.positions[e.preconditionStepId],a=this.positions[e.id];if(!t||!a)return ue``;const i=t.x+kr,r=t.y+Ke/2,s=a.x,o=a.y+Ke/2,l=(i+s)/2;return ue`
            <path d="M${i},${r} C${l},${r} ${l},${o} ${s},${o}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:_t,y:_t},a=Jf[e.type]??"#64748b",i=Qf[e.type]??"•",r=this.selectedId===e.id;return ue`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${s=>this.onNodeMouseDown(s,e.id)}"
               @click="${s=>{s.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${kr}" height="${Ke}" rx="8"
                      fill="white"
                      stroke="${r?a:"#e2e8f0"}"
                      stroke-width="${r?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${Ke}" rx="8" fill="${a}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Ke}" fill="${a}"/>
                <text x="16" y="${Ke/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${i}</text>
                <!-- name -->
                <text x="44" y="${Ke/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${Ke/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Ke/2+20}" font-size="9" fill="${a}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(i=>i.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(i=>i.id!==e.id),a=(i,r)=>n`
            <div class="field">
                <label class="field-label">${i}</label>
                ${r}
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
                        @change="${i=>this.updateStep(e.id,{name:i.target.value})}"/>`)}
                    ${a("Type",n`
                        <select class="inp" @change="${i=>this.updateStep(e.id,{type:i.target.value})}">
                            ${Zf.map(i=>n`<option value="${i}" ?selected="${e.type===i}">${i}</option>`)}
                        </select>`)}
                    ${a("Description",n`<textarea class="inp" rows="2"
                        @change="${i=>this.updateStep(e.id,{description:i.target.value})}">${e.description??""}</textarea>`)}
                    ${a("Precondition step",n`
                        <select class="inp" @change="${i=>this.updateStep(e.id,{preconditionStepId:i.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(i=>n`<option value="${i.id}" ?selected="${e.preconditionStepId===i.id}">${i.name} (${i.id})</option>`)}
                        </select>`)}
                    ${a("Precondition expression",n`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??""}"
                        @change="${i=>this.updateStep(e.id,{preconditionExpression:i.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${i=>this.updateStep(e.id,{parallel:i.target.checked})}"/>
                    </div>
                    ${a("Timeout (ms)",n`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${i=>this.updateStep(e.id,{timeout:Number(i.target.value)})}"/>`)}
                    ${a("Retries",n`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${i=>this.updateStep(e.id,{retries:Number(i.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${i=>this.updateStep(e.id,{rollbackable:i.target.checked})}"/>
                    </div>
                    ${e.rollbackable?a("Compensation step",n`
                        <select class="inp" @change="${i=>this.updateStep(e.id,{compensationStepId:i.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(i=>n`<option value="${i.id}" ?selected="${e.compensationStepId===i.id}">${i.name} (${i.id})</option>`)}
                        </select>`):""}

                    ${e.type==="ACTION"?a("Topic",n`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??""}"
                        @change="${i=>this.updateStep(e.id,{topic:i.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?a("Form ID",n`<input class="inp"
                        .value="${e.formId??""}"
                        @change="${i=>this.updateStep(e.id,{formId:i.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?a("Child workflow ID",n`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??""}"
                        @change="${i=>this.updateStep(e.id,{childWorkflowDefinitionId:i.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",i.click(),URL.revokeObjectURL(a)}};zt.styles=[_s,x`
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
    `];qa([h()],zt.prototype,"value",2);qa([g()],zt.prototype,"wf",2);qa([g()],zt.prototype,"positions",2);qa([g()],zt.prototype,"selectedId",2);qa([g()],zt.prototype,"showMeta",2);zt=qa([k("mateu-workflow")],zt);var tv=Object.defineProperty,av=Object.getOwnPropertyDescriptor,ui=(e,t,a,i)=>{for(var r=i>1?void 0:i?av(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&tv(t,a,r),r};const iv=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],rv=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],sv={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function no(){return"field-"+Math.random().toString(36).slice(2,8)}let ra=class extends _{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=Bl.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:a,newIndex:i}=t;if(a===void 0||i===void 0||a===i)return;const r=[...this.form.fields],[s]=r.splice(a,1);r.splice(i,0,s),this.form={...this.form,fields:r},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(a=>a.id===e?{...a,...t}:a)},this.emit()}addField(){const e=no(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(s=>s.id===e);if(!t)return;const a={...t,id:no(),label:t.label+" (copy)"},i=this.form.fields.findIndex(s=>s.id===e),r=[...this.form.fields];r.splice(i+1,0,a),this.form={...this.form,fields:r},this.selectedId=a.id,this.emit()}render(){return n`
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
                    ${Kn}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${Yn}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Xn}
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
        `}renderRow(e){const t=sv[e.dataType]??"#64748b",a=this.selectedId===e.id;return n`
            <div role="button" tabindex="0" class="field-row ${a?"selected":""}"
                 data-id="${e.id}"
                 @click="${()=>this.selectedId=this.selectedId===e.id?null:e.id}" @keydown="${X(()=>this.selectedId=this.selectedId===e.id?null:e.id)}">
                <span class="drag-handle" title="Drag to reorder">⠿</span>
                <span class="type-badge" style="background:${t}">${e.dataType}</span>
                <span class="field-label-text">${e.label}</span>
                <span class="field-id-text">${e.id}</span>
                ${e.required?n`<span class="required-badge">required</span>`:d}
                ${e.stereotype&&e.stereotype!=="regular"?n`<span class="stereo-badge">${e.stereotype}</span>`:d}
                <div style="flex:1"></div>
                <button class="row-btn" title="Duplicate"
                        @click="${i=>{i.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${i=>{i.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){const e=this.form.fields.find(a=>a.id===this.selectedId);if(!e)return d;const t=(a,i)=>n`
            <div class="prop-field">
                <label class="prop-label">${a}</label>
                ${i}
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
                            ${iv.map(a=>n`
                                <option value="${a}" ?selected="${e.dataType===a}">${a}</option>`)}
                        </select>`)}
                    ${t("Stereotype",n`
                        <select class="inp"
                                @change="${a=>this.updateField(e.id,{stereotype:a.target.value||void 0})}">
                            ${rv.map(a=>n`
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
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),a=URL.createObjectURL(t),i=document.createElement("a");i.href=a,i.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",i.click(),URL.revokeObjectURL(a)}};ra.styles=[_s,ae,x`
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
    `];ui([h()],ra.prototype,"value",2);ui([g()],ra.prototype,"form",2);ui([g()],ra.prototype,"selectedId",2);ui([g()],ra.prototype,"showMeta",2);ra=ui([k("mateu-form-editor")],ra);var ov=Object.defineProperty,nv=Object.getOwnPropertyDescriptor,ct=(e,t,a,i)=>{for(var r=i>1?void 0:i?nv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&ov(t,a,r),r};let ze=class extends _{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return n`
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
        `}};ze.styles=x`
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
    `;ct([h()],ze.prototype,"appState",2);ct([h()],ze.prototype,"appData",2);ct([g()],ze.prototype,"open",2);ct([g()],ze.prototype,"activeTab",2);ct([g()],ze.prototype,"hoveredTag",2);ct([g()],ze.prototype,"hoveredId",2);ct([g()],ze.prototype,"hoveredState",2);ct([g()],ze.prototype,"hoveredData",2);ct([g()],ze.prototype,"hoveredMeta",2);ze=ct([k("mateu-debug-overlay")],ze);const lv=(e,t,a)=>{const i=t?.initiatorState;return i&&typeof i=="object"&&!cv(e,a)?{...i}:{...e??{}}},dv=/^(.+)_(create-and-stay|create|save|cancel|remove|add|select|selected|prev|next|move-up|move-down)$/,cv=(e,t)=>{const a=t?dv.exec(t):null;return!!a&&!!e&&`${a[1]}_rowClass`in e},lo=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}};var tl=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(tl||{}),al=(e=>(e.Continue="Continue",e.Stop="Stop",e))(al||{});const co=12e4,uo=(e,t)=>`${e??"_"}::${t}`;class uv{constructor(){this.started=new Map,this.listeners=new Set}begin(t,a=Date.now()){const i=this.started.get(t);return i!==void 0&&a-i<co?!1:(this.started.set(t,a),this.emit(),!0)}end(t){this.started.delete(t)&&this.emit()}isPending(t,a=Date.now()){const i=this.started.get(t);return i!==void 0&&a-i<co}snapshot(){return new Set(this.started.keys())}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}reset(){this.started.clear(),this.emit()}emit(){const t=this.snapshot();this.listeners.forEach(a=>a(t))}}const ho=new uv,hv=e=>!!e&&(e.startsWith("search-")||e.startsWith("code-")||e==="__restfetch__");function pv(e,t){const a=e?.commands;return a&&a.length?(a.forEach(t),!0):!1}function mv(e,t){if(!t){e.removeAttribute("data-sizing"),e.style.flexBasis="";return}if(t.startsWith("fixed:")){e.setAttribute("data-sizing","fixed"),e.style.flexBasis=t.slice(6);return}e.setAttribute("data-sizing",t),e.style.flexBasis=""}const ki={header:"One moment, please",message:"Are you sure?",confirmationText:"Yes",denialText:"No"},fv=e=>{const t=e?.confirmationTexts,a=(i,r)=>i!=null&&i.trim().length>0?i:r;return{header:a(t?.title,ki.header),message:a(t?.message,ki.message),confirmationText:a(t?.confirmationText,ki.confirmationText),denialText:a(t?.denialText,ki.denialText)}};var vv=Object.defineProperty,bv=Object.getOwnPropertyDescriptor,hr=(e,t,a,i)=>{for(var r=i>1?void 0:i?bv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&vv(t,a,r),r};let Ua=null,Ta=class extends Bt{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,a=this.data,i=this.appState,r=this.appData,s=this.component,o=$=>Vo($,t,a,{appState:i,appData:r,component:s}),l=$=>ns($,t,a,i,r,{component:s}),c=["state","data","appState","appData","component"],u=[t,a,i,r,s],p={...this.state},f={...this.data};let m=!1,b=!1;for(let $=0;$<e.length;$++){const y=e[$];try{if(o(y.filter)){if(xe.SetStateValue==y.action||xe.SetDataValue==y.action){const E=xe.SetStateValue==y.action?p:f,z=y.fieldName.split(",");for(let S=0;S<z.length;S++){const I=z[S];if(!E[I]||E[I]!=y.value){const T=y.expression?l(y.expression):y.value,O=tl.none==y.fieldAttribute?I:I+"."+y.fieldAttribute;T!=E[O]&&(E[O]=T,xe.SetStateValue==y.action&&(m=!0),xe.SetDataValue==y.action&&(b=!0))}}}if(xe.RunAction==y.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:y.actionId},bubbles:!0,composed:!0})),xe.RunJS==y.action&&new Function(...c,y.value)(...u),xe.SetAttributeValue==y.action){const E=y.expression?o(y.expression):y.value;if(y.fieldAttribute=="disabled"){E?this.shadowRoot?.getElementById(y.fieldName)?.setAttribute(y.fieldAttribute,"disabled"):this.shadowRoot?.getElementById(y.fieldName)?.removeAttribute(y.fieldAttribute);continue}this.shadowRoot?.getElementById(y.fieldName)?.setAttribute(y.fieldAttribute,E)}if(xe.SetCssClass==y.action&&this.shadowRoot?.getElementById(y.fieldName)?.setAttribute("class",y.value),xe.SetStyle==y.action&&this.shadowRoot?.getElementById(y.fieldName)?.style.setProperty(y.expression,y.value),al.Stop==y.result)break}}catch(E){console.error("rule failed",y,E)}}m&&(this.state=p),b&&(this.data=f),m&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,a=this.component.validations;let i=!0,r=!1;const s=this.data??{},o={...this.data??{},errors:{}};if(a){for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let p=0;p<u.length;p++){const f=u[p];o.errors[f]=[]}}for(let l=0;l<a.length;l++){const c=a[l];if(!this.skipValidation(t,c))try{const u=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!u){i=!1;const f=(c.fieldId??"_component").split(",");for(let m=0;m<f.length;m++){const b=f[m];let $=o.errors[b];if($||(o.errors[b]=[]),$=o.errors[b],!s[b]){let y=c.message;try{y=this._evalTemplate(c.message)}catch{}$.push(y)}}}}catch(u){console.error("validation failed",c,u)}}for(let l=0;l<a.length;l++){const c=a[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let p=0;p<u.length;p++){const f=u[p];if(s.errors?[f].join(","):o.errors==""&&[f].join(",")){r=!0;break}}}(s.errors?["_component"].join(","):o.errors==""&&["_component"].join(","))&&(r=!0)}o._valid=i,o._valid!=s._valid&&(r=!0),r&&(this.data=o)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};t.fieldIds.forEach(i=>{a[i]=void 0}),a.searchText=void 0,this.state={...this.state,...a}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,a={};a[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...a})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const a={...this.state};a[t.fieldId]=t.value,this.adoptEditedState(t.fieldId,a),(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const i=this.component;i.triggers?.filter(r=>r.type==St.OnValueChange).filter(r=>!r.propertyName||t.fieldId==r.propertyName).forEach(r=>{(!r.condition||this._evalExpr(r.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId},bubbles:!0,composed:!0}))}),i.triggers?.filter(r=>r.type==St.AutoSave).forEach(r=>{const s=r.actionId,o=this._autoSaveTimers.get(s);o!==void 0&&clearTimeout(o),this._autoSaveTimers.set(s,setTimeout(()=>{this._autoSaveTimers.delete(s),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId},bubbles:!0,composed:!0}))},r.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail,a=t?._originElement??af(e);if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation(),Array.isArray(t.parameters?.crud_selected_items)&&(this.state={...this.state,crud_selected_items:t.parameters.crud_selected_items});const i=this.component,r=i.actions?.find(s=>s.id==t.actionId)??i.actions?.find(s=>s.id.endsWith("*")&&t.actionId.startsWith(s.id.slice(0,-1)));if(r){if(r&&r.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(r&&r.validationRequired){const o=Ua??this;if(Ua=null,o.checkValidations(r.fieldsToValidate),!o.data._valid){o.notifyValidationErrors();return}}Ua=null;const s={...t,initiatorComponentId:this.id};r&&r.confirmationRequired?this.callAfterConfirmation(r,()=>this.requestActionCallToServerOrBubble(s,i,r,a)):this.requestActionCallToServerOrBubble(s,i,r,a)}else{const s={...t.parameters};s.initiatorState||(s.initiatorState=this.state),Ua||(Ua=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,_originElement:a,parameters:s},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=a=>{if(a)for(const i of a){const r=i.metadata;if(r?.type===v.FormField){const s=r;s.fieldId&&s.label&&(e[s.fieldId]=s.label)}t(i.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),a=[];if(Object.entries(e).forEach(([r,s])=>{if(!Array.isArray(s))return;const o=r==="_component"?void 0:t[r]??r;s.forEach(l=>{l&&!a.some(c=>c.label===o&&c.msg===l)&&a.push({label:o,msg:l})})}),a.length===0){this.notify("There are validation errors");return}const i=`There are validation errors
`+a.map(({label:r,msg:s})=>r?`• ${r}: ${s}`:`• ${s}`).join(`
`);Qe({text:i,variant:"error",position:"bottomEnd",duration:Math.max(3e3,1500+a.length*1e3)},this),this.focusFirstInvalidField()},this.notify=e=>{Qe({text:e,variant:"error",position:"bottomEnd",duration:3e3},this)},this.handleRestAction=(e,t)=>{const a=()=>{const p=U(e.successMessage,this.state,this.data);p&&Qe({text:p,variant:"success",position:"bottomEnd",duration:3e3},this);const f=U(e.successRoute,this.state,this.data);if(!(!f||f.includes("${"))){if(this.sameRoute(f)){this.refreshListing();return}Et(this,f)}},i=p=>{if(e.resultPath!=null){const f=Jt(p,e.resultPath);f&&typeof f=="object"&&(this.state={...this.state,...f})}a()},r=p=>{console.warn("mateu: rest action failed",p),Qe({text:"Request failed",variant:"error",position:"bottomEnd",duration:3e3},this)},s=(p,f)=>{const m=p?.appData?._restfetchError;if(m){const b=typeof m?.status=="number"&&m.status>0?` (HTTP ${m.status})`:"";Qe({text:`Request failed${b}`,variant:"error",position:"bottomEnd",duration:3e3},this);return}f(p?.appData?._restfetch)},o=!!Oa(e.source)?.proxy,l=t==="__restdata__"?"data":"action";if(e.forEachSelectedRow){const p=this.state.crud_selected_items??[];if(!p.length){this.notify("You first need to select some rows");return}if(o){this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:"__restfetch__",parameters:{_sourceKind:l,_sourceId:t,_forEachSelectedRow:!0},callback:f=>s(f,()=>a()),callbackonly:!0},bubbles:!0,composed:!0}));return}Promise.all(p.map(f=>Ca(e.source,m=>U(m,{...this.state,...f},this.data)))).then(()=>a()).catch(r);return}if(o){this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:"__restfetch__",parameters:{_sourceKind:l,_sourceId:t},callback:p=>s(p,i),callbackonly:!0},bubbles:!0,composed:!0}));return}const c=p=>U(p,this.state,this.data),u=p=>U(p,Pi(this.state),Pi(this.data));Ca(e.source,c,void 0,u).then(i).catch(r)},this.callAfterConfirmation=(e,t)=>{const{header:a,message:i,confirmationText:r,denialText:s}=fv(e),o=document.createElement("div");o.style.cssText="position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);padding:1rem;";const l=document.createElement("div");l.style.cssText="background:var(--lumo-base-color,#fff);color:var(--lumo-body-text-color,#1a1a1a);border-radius:var(--lumo-border-radius-l,12px);box-shadow:var(--lumo-box-shadow-xl,0 12px 40px rgba(0,0,0,.3));padding:1.2rem;max-width:min(90vw,26rem);";const c=()=>{o.parentElement&&document.body.removeChild(o)},u="font:inherit;font-weight:600;padding:.45rem 1rem;border-radius:var(--lumo-border-radius-m,6px);cursor:pointer;";Io(n`
            <h3 style="margin:0 0 .5rem;">${a}</h3>
            <div style="margin-bottom:1.2rem;">${i}</div>
            <div style="display:flex;justify-content:flex-end;gap:.5rem;">
                <button style="${u}border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.25));background:var(--lumo-base-color,#fff);"
                        @click="${()=>c()}">${s}</button>
                <button style="${u}border:none;background:var(--lumo-primary-color,#1676f3);color:var(--lumo-primary-contrast-color,#fff);"
                        @click="${()=>{c(),t()}}">${r}</button>
            </div>
        `,l),o.appendChild(l),o.addEventListener("click",p=>{p.target===o&&c()}),document.body.appendChild(o)},this.requestActionCallToServerOrBubble=(e,t,a,i)=>{if(a&&a.bubble){const r={...e.parameters};r.initiatorState||(r.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,_originElement:i,parameters:r},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,a,i)},this.requestActionCallToServer=(e,t,a,i)=>{if(a&&a.href){window.location.href=a.href;return}if(a&&a.js)try{new Function("state","data","appState","appData","component",a.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(o){console.error("when evaluating "+a.js,o,this.component,this.state,this.data)}if(a&&a.customEvent&&this.dispatchEvent(new CustomEvent(a.customEvent.name,{detail:a.customEvent.detail,bubbles:!0,composed:!0})),a&&(a.js||a.customEvent)||pv(a,o=>this.applyCommand(o)))return;if(a&&a.restAction){this.handleRestAction(a.restAction,a.id);return}if(e.actionId=="search"){const o=e.parameters?._searchState;o?this.state={...this.state,...o}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}const r=e.background??a?.background??(hv(e.actionId)||void 0);if(!r){if(!Uo(e.actionId,a?.idempotent)&&!ho.begin(uo(this.id,e.actionId)))return;const l=sf(i);this._pendingOrigins.set(e.actionId,l),ef(l)}const s=lv(this.state,e.parameters,e.actionId);this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:s,parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:r,sse:a?.sse,timeoutMillis:a?.timeoutMillis,idempotent:a?.idempotent,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(i=>i.type==St.OnSuccess).filter(i=>e.detail.actionId==i.calledActionId).forEach(i=>{if(!i.condition||this._evalExpr(i.condition))if(e.preventDefault(),e.stopPropagation(),i.timeoutMillis>0){const r=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId,background:i.background,callbackToken:r},bubbles:!0,composed:!0}))},i.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId,background:i.background},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(i=>i.type==St.OnError).filter(i=>e.detail.actionId==i.calledActionId).forEach(i=>{(!i.condition||this._evalExpr(i.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId},bubbles:!0,composed:!0})))})},this._pendingOrigins=new Map,this._backendSettledListener=e=>{((typeof e.composedPath=="function"?e.composedPath():[])[0]??e.target)===this&&this._releasePending(e.detail?.actionId)},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const a of t.actions??[]){const i=a.shortcut||(a.runOnEnter?"enter":null);if(i&&this._shortcutMatchesEvent(i,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return H.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(mv(this,this.component?.sizing),this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}sameRoute(e){const t=a=>a.replace(/^\/+/,"").replace(/\/+$/,"").split("?")[0];return t(e)===t(window.location.pathname)}refreshListing(){let e=null;const t=a=>{const i=a.querySelector?.("mateu-table-crud");i&&(e=i),a.querySelectorAll?.("*").forEach(r=>{r.shadowRoot&&t(r.shadowRoot)})};t(this.renderRoot),e?.search?.()}focusFirstInvalidField(){const e=t=>requestAnimationFrame(()=>{const a=this.findFirstInvalid(this.renderRoot);if(a){a.focus?.(),a.scrollIntoView?.({block:"center",behavior:"smooth"});return}t>0&&e(t-1)});e(3)}findFirstInvalid(e){if(!e?.querySelectorAll)return null;for(const t of Array.from(e.querySelectorAll("*"))){if(t.invalid===!0)return t;if(t.shadowRoot){const a=this.findFirstInvalid(t.shadowRoot);if(a)return a}}return null}_releasePending(e){(e!==void 0?[e]:Array.from(this._pendingOrigins.keys())).forEach(a=>{ho.end(uo(this.id,a)),tf(this._pendingOrigins.get(a)),this._pendingOrigins.delete(a)})}_shortcutMatchesEvent(e,t){return fu(e,t)}_collectShortcutTabs(){const e=this.renderRoot;if(!e)return[];const t=Array.from(e.querySelectorAll("vaadin-tab[data-shortcut]"));return e.querySelectorAll("mateu-drawer, mateu-dialog").forEach(a=>{const i=a.shadowRoot;i&&t.push(...Array.from(i.querySelectorAll("vaadin-tab[data-shortcut]")))}),t}_handleTabShortcut(e){const t=this._collectShortcutTabs();if(t.length===0)return!1;for(const a of Array.from(t)){const i=a.dataset.shortcut;if(!i||!this._shortcutMatchesEvent(i,e))continue;const r=a.closest("vaadin-tabs");if(!r)continue;const s=Array.from(r.querySelectorAll("vaadin-tab")).indexOf(a);if(!(s<0))return e.preventDefault(),r.selected=s,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),this.addEventListener("backend-succeeded-event",this._backendSettledListener),this.addEventListener("backend-failed-event",this._backendSettledListener),this.addEventListener("backend-cancelled-event",this._backendSettledListener),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),this.removeEventListener("backend-succeeded-event",this._backendSettledListener),this.removeEventListener("backend-failed-event",this._backendSettledListener),this.removeEventListener("backend-cancelled-event",this._backendSettledListener),document.removeEventListener("keydown",this._keydownListener),this._releasePending()}render(){return n`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?n`
                <div><ul>${this.data.errors._component.map(e=>n`<li>${e}</li>`)}</ul></div>
            `:d}</div>`}_render(){if(this.component?.type==J.ClientSide){const e=this.component;return e.metadata?.type==v.Page?Br(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==v.Crud?jr(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):H.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return n`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==J.ClientSide){const t=e;if(t.metadata?.type==v.Page)return Br(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==v.Crud)return jr(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return w(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};Ta.styles=[x`
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

        ${Qr(Lt.cssText)}
        
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
  `,ms(".page-fab"),da];hr([h()],Ta.prototype,"baseUrl",2);hr([h()],Ta.prototype,"route",2);hr([h()],Ta.prototype,"consumedRoute",2);Ta=hr([k("mateu-component")],Ta);class gv{async handle(t,a){return await t.runAction(a.baseUrl,a.route,a.consumedRoute,a.actionId,a.initiatorComponentId,a.appState,a.serverSideType,a.componentState,a.parameters,a.initiator,a.background,a.options)}}const yv=new gv;class $v{constructor(){this.handleUIIncrement=(t,a,i)=>{if(t?.fragments?.forEach(r=>{wa.next({command:void 0,fragment:r,ui:void 0,error:void 0,callbackToken:i,initiator:a})}),t?.appState&&(oe.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const r=t?.appData;Zt.value={...t.appData,...r},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(r=>{Qe({text:r.text,position:r.position,variant:r.variant,duration:r.duration,undoLabel:r.undoLabel,undoActionId:r.undoActionId,undoParameters:r.undoParameters},a)}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(r=>{wa.next({command:r,fragment:void 0,ui:void 0,error:void 0,callbackToken:i,initiator:a})})}}async runAction(t,a,i,r,s,o,l,c,u,p,f,m,b,$,y,E={}){const z=()=>{this.runAction(t,a,i,r,s,o,l,c,u,p,f,m,b,$,y,E)};try{const S=await yv.handle(t,{baseUrl:a,route:i,consumedRoute:r,actionId:s,appState:oe.value,initiatorComponentId:o,componentState:u,parameters:p,serverSideType:c,initiator:f,background:m,options:{...E,retry:z}});b&&b(S),$||this.handleUIIncrement(S,f,y),S.messages&&S.messages.length==1&&S.messages[0].variant=="error"&&f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:s},bubbles:!0,composed:!0})),f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:s,evevntId:Te()},bubbles:!0,composed:!0}))}catch(S){console.warn("Action request failed",S),S?.__mateuReported||f.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:s,reason:this.serialize(S),retry:z}})),f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:s},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const wv=new $v,xv=wv;class kv{constructor(){this.handleUIIncrement=(t,a,i)=>{if(t?.messages?.forEach(r=>{Qe({text:r.text,position:r.position,variant:r.variant,duration:r.duration,undoLabel:r.undoLabel,undoActionId:r.undoActionId,undoParameters:r.undoParameters},a)}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(r=>{wa.next({command:r,fragment:void 0,ui:void 0,error:void 0,callbackToken:i,initiator:a})}),t?.fragments?.forEach(r=>{wa.next({command:void 0,fragment:r,ui:void 0,error:void 0,callbackToken:i,initiator:a})}),t?.appState&&(oe.value={...t.appState},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const r=t?.appData;Zt.value={...t.appData,...r},a.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,a,i,r,s,o,l,c,u,p,f,m,b,$,y,E={}){const z=()=>{this.runAction(t,a,i,r,s,o,l,c,u,p,f,m,b,$,y,E)};if(i){i=i||"_no_route",i&&i.startsWith("/")&&(i=i.substring(1));const S={serverSideType:c,appState:oe.value,componentState:u,parameters:p,initiatorComponentId:o,consumedRoute:r,route:"/"+i,actionId:s};m||f.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}}));const I={Accept:"text/event-stream","Content-Type":"application/json"},T=localStorage.getItem("__mateu_auth_token");T&&(I.Authorization="Bearer "+T);const O=sessionStorage.getItem("__mateu_sesion_id");O&&(I["X-Session-Id"]=O),fetch(a+"/mateu/v3/sse/"+i,{method:"POST",headers:I,body:JSON.stringify(S)}).then(async le=>{const vi=le.body?.pipeThrough(new TextDecoderStream).getReader();if(vi){let fa="";for(;;){const{value:bi,done:gi}=await vi.read();if(gi)break;fa+=bi;const C=fa.split(`

`);fa=C.pop()??"";for(const M of C){const D=M.trim();if(D)if(D.startsWith("data:")){const A=JSON.parse(D.substring(5).trim());b&&b(A),$||this.handleUIIncrement(A,f,y),A.messages&&A.messages.length==1&&A.messages[0].variant=="error"&&f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:s},bubbles:!0,composed:!0}))}else{let A=D;try{const Z=JSON.parse(D);A=Z.message,Z._embedded?.errors?.length>0&&Z._embedded.errors[0].message&&(A=Z._embedded.errors[0].message)}catch{}throw new Error(A)}}}}m||f.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:s}})),f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:s},bubbles:!0,composed:!0}))}).catch(le=>{f.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:s,reason:this.serialize(le),retry:z}})),f.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:s},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}}const il=new kv,_v={fixed:"fixed",fullWidth:"full",edgeToEdge:"edge"},Cv=new Set([v.Gantt,v.PlanningBoard,v.Kanban,v.Bpmn,v.Workflow,v.Map]),Sv={landing:"fixed",form:"fixed",process:"fixed"},rl=e=>e?_v[e]:void 0,sa=e=>e.type==J.ClientSide?e.metadata:void 0,sl=e=>{const t=sa(e);if(t?.type==v.Page){const a=rl(t.pageWidth);if(a)return a}for(const a of e.children??[]){const i=sl(a);if(i)return i}},ol=e=>{const t=e.pageType;if(t)return t;const a=i=>{const r=sa(i);if(r?.type==v.Page&&r.pageType)return r.pageType;for(const s of i.children??[]){const o=a(s);if(o)return o}};return a(e)},Ev=e=>{const t=sa(e);if(t?.type!=v.Crud)return!1;const a=t;return a.compact?!0:(a.columns??[]).some(i=>i.metadata?.editable)},Zi=(e,t)=>t(e)||(e.children??[]).some(a=>Zi(a,t)),Iv=e=>!!e&&Zi(e,t=>sa(t)?.type==v.HeroSection),Wr=e=>sa(e)?.type==v.App?!0:(e.children??[]).some(t=>sa(t)?.type==v.App),Tv=(e,t)=>{if(!e)return"fixed";const a=rl(e.pageWidth)??sl(e);if(a)return a;if(t?.top&&Wr(e))return"edge";const i=Sv[ol(e)??""];return i||(Zi(e,r=>{const s=sa(r)?.type;return s!=null&&Cv.has(s)})?"edge":Zi(e,Ev)?"full":"fixed")},Hr="mateu-route-structure-cache",nl=1,Vr=50;let ll=(()=>{try{return localStorage.getItem("mateu-route-structure-cache-off")!=="1"}catch{return!0}})();const dl=()=>{try{return JSON.parse(localStorage.getItem(Hr)??"{}")}catch{return{}}},Pv=e=>{try{localStorage.setItem(Hr,JSON.stringify(e))}catch{try{const t=Object.entries(e).sort((a,i)=>i[1].t-a[1].t).slice(0,Math.floor(Vr/2));localStorage.setItem(Hr,JSON.stringify(Object.fromEntries(t)))}catch{}}},Ov=e=>{const t=e.initialState&&Object.keys(e.initialState).length?"#"+Av(JSON.stringify(e.initialState)):"";return[e.baseUrl,e.consumedRoute??"",e.route??"",e.serverSideType??""].join("|")+t},zv=e=>{if(!ll)return;const t=dl()[e];if(!(!t||t.v!==nl))return{component:t.component,hash:t.hash}},Rv=(e,t,a)=>{if(!ll)return;const i=dl();i[e]={v:nl,t:Date.now(),component:t,hash:a};const r=Object.keys(i);if(r.length>Vr){const s=r.sort((o,l)=>i[o].t-i[l].t).slice(0,r.length-Vr);for(const o of s)delete i[o]}Pv(i)},Av=e=>{let t=2166136261;for(let a=0;a<e.length;a++)t^=e.charCodeAt(a),t=Math.imul(t,16777619);return(t>>>0).toString(36)},Lv=30,ga=new Map,Dv=e=>ga.get(e),Fv=(e,t)=>{if(ga.delete(e),ga.set(e,t),ga.size>Lv){const a=ga.keys().next().value;a!==void 0&&ga.delete(a)}};var Mv=Object.defineProperty,Nv=Object.getOwnPropertyDescriptor,we=(e,t,a,i)=>{for(var r=i>1?void 0:i?Nv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Mv(t,a,r),r};let ee=class extends ar{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.showSkeleton=!1,this.pendingRouteFocus=!1,this.hasRenderedContent=!1,this.loadLifecycleListener=e=>{if(((typeof e.composedPath=="function"?e.composedPath():[])[0]??e.target)===this)if(clearTimeout(this.skeletonTimer),e.type==="backend-called-event"){if(this.fragment?.component)return;this.skeletonTimer=setTimeout(()=>{this.showSkeleton=!0},ee.SKELETON_DELAY_MS)}else this.showSkeleton=!1},this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:J.ClientSide,metadata:{type:v.Element,name:"div",content:"Not found"},id:"fieldId"},action:Xt.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let a=xv;t.sse&&(a=il),a.runAction(ca,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken,{timeoutMillis:t.timeoutMillis,idempotent:t.idempotent,knownStructureHash:t.knownStructureHash})}},this.getCustomisedAppState=()=>{let e={...oe.value};if(this.overrides){const t=lo(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return H.mustUseShadowRoot()?super.createRenderRoot():this}structureCacheKey(){return Ov({baseUrl:this.baseUrl,consumedRoute:this.consumedRoute,route:this.route,serverSideType:this.serverSideType,initialState:this.initialState})}focusNewContent(){requestAnimationFrame(()=>{const a=this.renderRoot?.querySelector?.('h1, h2, [role="heading"]')??this;a.hasAttribute("tabindex")||a.setAttribute("tabindex","-1"),a.focus?.({preventScroll:!0})})}connectedCallback(){super.connectedCallback(),this.overridesParsed=lo(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener),this.addEventListener("backend-called-event",this.loadLifecycleListener),this.addEventListener("backend-succeeded-event",this.loadLifecycleListener),this.addEventListener("backend-failed-event",this.loadLifecycleListener),this.addEventListener("backend-cancelled-event",this.loadLifecycleListener)}disconnectedCallback(){super.disconnectedCallback(),this.releaseFabAnchor?.(),this.releaseFabAnchor=void 0,this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener),this.removeEventListener("backend-called-event",this.loadLifecycleListener),this.removeEventListener("backend-succeeded-event",this.loadLifecycleListener),this.removeEventListener("backend-failed-event",this.loadLifecycleListener),this.removeEventListener("backend-cancelled-event",this.loadLifecycleListener),clearTimeout(this.skeletonTimer)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(a=>a==="appState"||a==="appData")){const a=this.renderRoot.querySelector("mateu-component");if(a)return e.has("appState")&&(a.appState=this.appState),e.has("appData")&&(a.appData=this.appData),!1}return!0}updated(e){if((e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&!this.preventNavigation){this.callbackToken=this.instant||Te();const t=this.structureCacheKey(),a=t!==this.lastAuthoritativeKey?Dv(t):void 0;if(a)queueMicrotask(()=>this.applyFragment(a));else{if(t!==this.lastAuthoritativeKey){const i=zv(t);this.currentStructureHash=i?.hash,i&&(this.fragment={targetComponentId:this.id,component:i.component,state:{},data:{},action:Xt.Replace,containerId:void 0},this.stampPageChrome())}this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,componentState:this.initialState,knownStructureHash:this.currentStructureHash,callbackToken:this.callbackToken},bubbles:!0,composed:!0}))}}e.has("route")&&this.top&&(this.preventNavigation||(this.pendingRouteFocus=!0),this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}},this.stampPageChrome();return}if(this.fragment=e,e.component){if(e.action!==Xt.Add){const t=this.structureCacheKey(),a=e.component.structureHash;Rv(t,e.component,a),this.lastAuthoritativeKey=t,this.currentStructureHash=a,e.component.staticView&&Fv(t,e)}this.pendingRouteFocus&&this.hasRenderedContent&&this.focusNewContent(),this.pendingRouteFocus=!1,this.hasRenderedContent=!0}this.stampPageChrome()}stampPageChrome(){const e=this.fragment?.component;if(!e||e===this.lastStampedComponent)return;this.lastStampedComponent=e;const t=!this.top&&Wr(e);this.dataset.pageWidth=t?"edge":Tv(e,{top:this.top}),this.releaseFabAnchor?.(),this.releaseFabAnchor=void 0,(this.top===!0||String(this.top)==="true"||this.hasAttribute("data-content-view"))&&!Wr(e)&&(this.releaseFabAnchor=sh(this,this.dataset.pageWidth)),this.dataset.pageType=ol(e)??"",this.dataset.hasWelcomeBanner=String(Iv(e))}render(){return!this.fragment?.component&&this.showSkeleton?n`
                <div class="route-skeleton" aria-busy="true" aria-live="polite">
                    <mateu-skeleton variant="text" count="1"></mateu-skeleton>
                    <mateu-skeleton variant="form" count="4"></mateu-skeleton>
                </div>
            `:n`
           ${this.fragment?.component?w(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):d}
       `}};ee.SKELETON_DELAY_MS=400;ee.styles=[x`
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
  `,da];we([h()],ee.prototype,"consumedRoute",2);we([h()],ee.prototype,"serverSideType",2);we([h()],ee.prototype,"uriPrefix",2);we([h()],ee.prototype,"overrides",2);we([h()],ee.prototype,"homeRoute",2);we([h()],ee.prototype,"route",2);we([h()],ee.prototype,"top",2);we([h()],ee.prototype,"instant",2);we([h()],ee.prototype,"initialState",2);we([h()],ee.prototype,"appState",2);we([h()],ee.prototype,"appData",2);we([g()],ee.prototype,"fragment",2);we([g()],ee.prototype,"showSkeleton",2);ee=we([k("mateu-ux")],ee);function qv(e){const t="var(--lumo-space-m, 1rem)",a={left:"50%",transform:"translateX(-50%)"};switch(e){case"topStart":return{top:t,left:t};case"topCenter":return{top:t,...a};case"topEnd":return{top:t,right:t};case"topStretch":return{top:t,left:t,right:t};case"middle":return{top:"50%",left:"50%",transform:"translate(-50%, -50%)"};case"bottomStart":return{bottom:t,left:t};case"bottomCenter":return{bottom:t,...a};case"bottomStretch":return{bottom:t,left:t,right:t};default:return{bottom:t,right:t}}}function Bv(e){switch(e){case"success":return{bg:"var(--lumo-success-color, #2e7d32)",fg:"#fff"};case"error":return{bg:"var(--lumo-error-color, #c62828)",fg:"#fff"};case"warning":return{bg:"var(--lumo-warning-color, #f9a825)",fg:"#1a1a1a"};case"contrast":return{bg:"var(--lumo-contrast-90pct, #1a1a1a)",fg:"#fff"};default:return{bg:"var(--lumo-base-color, #fff)",fg:"var(--lumo-body-text-color, #1a1a1a)"}}}const jv={show(e,t){const{bg:a,fg:i}=Bv(e.variant),r=qv(e.position),s=document.createElement("div"),o=e.variant==="error";s.setAttribute("role",o?"alert":"status"),s.setAttribute("aria-live",o?"assertive":"polite"),s.setAttribute("aria-atomic","true"),Object.assign(s.style,{position:"fixed",zIndex:"2000",display:"flex",alignItems:"center",gap:"0.75rem",maxWidth:"min(90vw, 28rem)",padding:"0.7rem 1rem",borderRadius:"var(--lumo-border-radius-m, 8px)",boxShadow:"var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,0.2))",background:a,color:i,font:"inherit",fontSize:"var(--lumo-font-size-s, 0.875rem)",opacity:"0",transition:"opacity 0.2s ease",...r});const l=document.createElement("span");l.textContent=e.text,s.appendChild(l);const c=()=>{s.style.opacity="0",setTimeout(()=>s.remove(),200)},u=e.onAction?{label:e.actionLabel??"Retry",run:e.onAction}:e.undoActionId?{label:e.undoLabel??"Undo",run:()=>t.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0}))}:void 0;if(u){const f=document.createElement("button");f.textContent=u.label,f.style.cssText="margin-left: 0.25rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;",f.addEventListener("click",()=>{u.run(),c()}),s.appendChild(f)}document.body.appendChild(s),requestAnimationFrame(()=>{s.style.opacity="1"});const p=e.duration??(u?1e4:5e3);p>0&&setTimeout(c,p)}};function Uv(){Bn(jv)}var Wv=Object.defineProperty,Hv=Object.getOwnPropertyDescriptor,Ss=(e,t,a,i)=>{for(var r=i>1?void 0:i?Hv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Wv(t,a,r),r};let si=class extends _{constructor(){super(...arguments),this.online=!0,this.recovered=!1}connectedCallback(){super.connectedCallback(),this.online=Ct.isOnline(),this.unsubscribe=Ct.subscribe(e=>{const t=!this.online;this.online=e,e&&t&&(this.recovered=!0,clearTimeout(this.recoveredTimer),this.recoveredTimer=setTimeout(()=>{this.recovered=!1},4e3))})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),clearTimeout(this.recoveredTimer),this.releaseSpace()}updated(){const e=this.renderRoot.querySelector(".bar");if(!e){this.releaseSpace();return}document.body.style.setProperty("padding-block-start",`${e.offsetHeight}px`)}releaseSpace(){typeof document<"u"&&document.body?.style.removeProperty("padding-block-start")}render(){if(this.online&&!this.recovered)return d;const e=!this.online;return n`<div class="bar ${e?"offline":"back"}" role="status" aria-live="polite">
            <span class="dot"></span>
            <span>${e?"No connection — changes you make now will not be saved.":"Connection restored."}</span>
        </div>`}};si.styles=x`
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
    `;Ss([g()],si.prototype,"online",2);Ss([g()],si.prototype,"recovered",2);si=Ss([k("mateu-connectivity-banner")],si);let _i=null;function cl(){if(!(typeof document>"u")&&!(_i&&_i.isConnected)){if(!document.body){document.addEventListener("DOMContentLoaded",()=>cl(),{once:!0});return}_i=document.createElement("mateu-connectivity-banner"),document.body.appendChild(_i)}}var Vv=Object.getOwnPropertyDescriptor,Gv=(e,t,a,i)=>{for(var r=i>1?void 0:i?Vv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=o(r)||r);return r};let oi=class extends _{constructor(){super(...arguments),this.skip=()=>{const e=this.findContent();e&&(e.hasAttribute("tabindex")||e.setAttribute("tabindex","-1"),e.focus(),e.scrollIntoView({block:"start"}))}}findContent(){const e=new Set,t=a=>{if(e.has(a))return null;e.add(a);for(const i of oi.TARGETS){const r=a.querySelector?.(i);if(r&&r!==this)return r}for(const i of Array.from(a.querySelectorAll?.("*")??[]))if(i.shadowRoot){const r=t(i.shadowRoot);if(r)return r}return null};return t(document)}render(){return n`<button class="skip" @click="${this.skip}">Skip to content</button>`}};oi.TARGETS=[".app-content","mateu-page","mateu-ux","mateu-component"];oi.styles=x`
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
    `;oi=Gv([k("mateu-skip-link")],oi);let Ci=null;function ul(){if(!(typeof document>"u")&&!(Ci&&Ci.isConnected)){if(!document.body){document.addEventListener("DOMContentLoaded",()=>ul(),{once:!0});return}Ci=document.createElement("mateu-skip-link"),document.body.insertBefore(Ci,document.body.firstChild)}}function Kv(e){const t=()=>{const i=document.documentElement.getAttribute("theme");i?e.setAttribute("theme",i):e.removeAttribute("theme")};t();const a=new MutationObserver(t);return a.observe(document.documentElement,{attributes:!0,attributeFilter:["theme"]}),()=>a.disconnect()}const Yv=(e,t)=>{const a=t.pathname+(t.search??""),i=(e.pathname??"")+(e.search??"");return!a&&!i||i===a?null:a.startsWith("/")?a:"/"+a},Xv=(e,t)=>{if(!e)return!1;let a;try{a=new URL(e)}catch{return!1}return a.pathname!==t.pathname||(a.search??"")!==(t.search??"")};var Jv=Object.defineProperty,Qv=Object.getOwnPropertyDescriptor,We=(e,t,a,i)=>{for(var r=i>1?void 0:i?Qv(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Jv(t,a,r),r};Uv();cl();Wo();ul();let Ce=class extends _{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.bundleUrl=void 0,this.navigationKey="initial",this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,a=this.baseUrl??"";!t||t.startsWith("/")?a=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,a.indexOf("://")<0&&(a.startsWith("/")||(a="/"+a),a=window.location.origin+a)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),a.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let i=new URL(a+t);const r=Yv(window.location,i);r&&(window.history.pushState({},"",r),this._lastUrl=window.location.href)}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),et.markClean(),e instanceof CustomEvent){let t=e.detail.route;const a=this.renderRoot.querySelector("mateu-ux");a&&(a.setAttribute("route",t),a.setAttribute("instant",Te()))}}}createRenderRoot(){return H.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),this._themeMirrorDisposer=Kv(this),et.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!et.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;Xv(this._lastUrl,t.location)&&(this.navigationKey=Te()),this.loadUrl(t)},this.top=="true"?(this.bundleUrl&&pd(this.bundleUrl),this.loadUrl(window)):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);oe.value={...oe.value,...e}}catch{oe.value={...oe.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this._themeMirrorDisposer?.(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=Te(),this._lastUrl=e.location.href,e.location.search){const a=new URLSearchParams(e.location.search).get("overrides");if(a&&(this.config=a,this.config))try{const i=JSON.parse(this.config);oe.value={...oe.value,...i}}catch{oe.value={...oe.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,a=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(a)?t.substring(a.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return n`
           <mateu-api-caller>
                ${Ml(this.navigationKey,n`<mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${Zt.value}"
                          .appState="${oe.value}"
                ></mateu-ux>`)}
           </mateu-api-caller>
           ${this.debug?n`
               <mateu-debug-overlay
                   .appState="${oe.value}"
                   .appData="${Zt.value}"
               ></mateu-debug-overlay>
           `:d}
       `}};Ce.styles=x`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;We([h()],Ce.prototype,"baseUrl",2);We([h()],Ce.prototype,"route",2);We([h()],Ce.prototype,"consumedRoute",2);We([h()],Ce.prototype,"config",2);We([h()],Ce.prototype,"top",2);We([h()],Ce.prototype,"pathPrefix",2);We([h()],Ce.prototype,"bundleUrl",2);We([g()],Ce.prototype,"instant",2);We([g()],Ce.prototype,"navigationKey",2);We([h({type:Boolean})],Ce.prototype,"debug",2);Ce=We([k("mateu-ui")],Ce);const Zv={en:{chat:"Assistant",openChat:"Open the assistant",closeChat:"Close the assistant",darkMode:"Switch to dark mode",lightMode:"Switch to light mode",expandChat:"Expand",collapseChat:"Restore size",chatEmpty:"Ask whatever you need: about this screen, your data or how to do something.",chatPlaceholder:"Write a message…",send:"Send"},es:{chat:"Asistente",openChat:"Abrir el asistente",closeChat:"Cerrar el asistente",darkMode:"Cambiar a modo oscuro",lightMode:"Cambiar a modo claro",expandChat:"Ampliar",collapseChat:"Tamaño normal",chatEmpty:"Pregunta lo que necesites: sobre esta pantalla, tus datos o cómo hacer algo.",chatPlaceholder:"Escribe un mensaje…",send:"Enviar"}},eb=e=>(typeof document<"u"&&document.documentElement?.lang||typeof navigator<"u"&&navigator.language||"").toLowerCase().startsWith("es")?"es":"en",Gr=(e,t)=>Zv[eb()][e];var tb=Object.defineProperty,ab=Object.getOwnPropertyDescriptor,pa=(e,t,a,i)=>{for(var r=i>1?void 0:i?ab(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&tb(t,a,r),r};let Ue=class extends _{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.searchText=""}connectedCallback(){super.connectedCallback(),Zl()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(as()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"—";const t=(this.searchedOptions??this.selector.options)?.find(i=>String(i.value)===e);if(t)return t.label;const a=Do()[this.selector.fieldName];return a!==void 0?String(a):e}pick(e,t){Ql(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText="",this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector("input.picker-search")?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){const e=this.app;if(e?.serverSideType)try{const t=await ca.runAction(this.baseUrl??"",e.rootRoute??e.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(const a of t?.fragments??[]){const s=a.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(s)){this.searchedOptions=s.map(o=>({value:o.value,label:o.label??String(o.value)}));return}}}catch{}}visibleOptions(){const e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(a=>a.label.toLowerCase().includes(t)):e}renderPanel(){const e=this.currentValue(),t=this.visibleOptions(),a=this.searchText!==""||t.length>Ue.SEARCHABLE_THRESHOLD;return n`
            <div class="panel">
                ${a?n`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${i=>{i.key==="Escape"&&this.closePanel()}}"/>`:d}
                <div class="options">
                    ${e?n`
                        <div class="option option--clear" @click="${()=>this.pick("")}">— (clear)</div>`:d}
                    ${t.map(i=>n`
                        <div class="option ${e===String(i.value)?"option--selected":""}"
                             @click="${()=>this.pick(i.value,i.label)}">${i.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?n`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():d}
            </label>`:n``}};Ue.SEARCHABLE_THRESHOLD=7;Ue.styles=x`
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
    `;pa([h()],Ue.prototype,"selector",2);pa([h()],Ue.prototype,"app",2);pa([h()],Ue.prototype,"baseUrl",2);pa([g()],Ue.prototype,"opened",2);pa([g()],Ue.prototype,"searchText",2);pa([g()],Ue.prototype,"searchedOptions",2);Ue=pa([k("mateu-app-context-picker")],Ue);var ib=Object.defineProperty,rb=Object.getOwnPropertyDescriptor,hi=(e,t,a,i)=>{for(var r=i>1?void 0:i?rb(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&ib(t,a,r),r};let oa=class extends _{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){const a=this.app;if(a?.serverSideType)try{const i=await ca.runAction(this.baseUrl??"",a.rootRoute??a.initialRoute??"","",e,"notification-bell",void 0,a.serverSideType,{},t,this,!0);for(const r of i?.fragments??[]){const o=r.data?._notifications;if(Array.isArray(o)){this.notifications=o;return}}}catch{}}refresh(){return this.runNotificationsAction("_notifications-list",{})}markRead(e){return this.runNotificationsAction("_notifications-read",{ids:e})}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);const t=e.route;if(t){if(!et.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("navigate-to-requested",{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return n`
            <div role="button" tabindex="0" class="entry ${e.unread?"entry--unread":""}"
                 @click="${()=>this.entryClicked(e)}" @keydown="${X(()=>this.entryClicked(e))}">
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
                <button class="bell-button" title="Notifications" aria-label="Notifications"
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
            </div>`}};oa.styles=x`
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
    
        ${ae}
    `;hi([h()],oa.prototype,"app",2);hi([h()],oa.prototype,"baseUrl",2);hi([g()],oa.prototype,"opened",2);hi([g()],oa.prototype,"notifications",2);oa=hi([k("mateu-notification-bell")],oa);const hl=e=>{if(!e||!("querySelectorAll"in e))return null;for(const t of e.querySelectorAll("*")){if(t.tagName?.toLowerCase()==="mateu-component")return t;const a=hl(t.shadowRoot);if(a)return a}return null},sb=async(e,t,a)=>{const i=t.renderRoot??t,r=hl(i);await il.runAction(ca,t.baseUrl??"",e.rootRoute||"_no_route","",a,r?.id??"app-header-action",{},e.serverSideType??"",{},{},r??t,!0,void 0,!1,"")};var ob=Object.defineProperty,nb=Object.getOwnPropertyDescriptor,Es=(e,t,a,i)=>{for(var r=i>1?void 0:i?nb(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&ob(t,a,r),r};let er=class extends _{constructor(){super(...arguments),this.shown=!1}createRenderRoot(){return this}connectedCallback(){if(super.connectedCallback(),!this.shown){if(typeof IntersectionObserver>"u"){this.shown=!0;return}this.observer=new IntersectionObserver(e=>{e.some(t=>t.isIntersecting)&&(this.shown=!0,this.observer?.disconnect(),this.observer=void 0)}),this.observer.observe(this)}}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0}render(){return this.shown&&this.content?this.content():n`<div class="mateu-when-visible-placeholder" style="min-height: 1px;">${d}</div>`}};Es([h({attribute:!1})],er.prototype,"content",2);Es([g()],er.prototype,"shown",2);er=Es([k("mateu-when-visible")],er);const lb=e=>!!e&&/[?&]_lazy=1(&|$)/.test(e),db=(e,t)=>e?n`<mateu-when-visible style="display: block; width: 100%;" .content="${t}"></mateu-when-visible>`:t(),po=async(e,t,a)=>{try{await sb(e,t,a)}catch(i){Qe({text:"La acción falló: "+i,position:"bottomStart",duration:6e3,variant:"error"},t)}},pl=(e,t)=>{const a=e.contextSelectors??[],i=e.contextActions??[];return a.length===0&&i.length===0&&!e.notificationsEnabled?d:n`${e.notificationsEnabled?n`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-notification-bell>`:d}${a.map(r=>n`
        <mateu-app-context-picker .selector="${r}" .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-app-context-picker>`)}${i.map(r=>(r.children?.length??0)>0?n`
        <details class="mateu-nav-group" style="flex-shrink: 0;">
            <summary class="app-header-action-btn">${r.label} ▾</summary>
            <div class="mateu-nav-panel" style="right: 0; left: auto;">
                ${r.children.map(s=>n`
                    <button class="mateu-nav-item" @click="${()=>s.actionId&&po(e,t,s.actionId)}">${s.label}</button>`)}
            </div>
        </details>`:n`
        <button class="app-header-action-btn" style="flex-shrink: 0;"
            @click="${()=>r.actionId&&po(e,t,r.actionId)}" title="${r.label}">${r.icon?G(r.icon):d}${r.label}</button>`)}`},mo=(e,t)=>n`
    <button class="mateu-nav-item ${e.selected?"mateu-nav-item--active":""}"
            ?disabled="${e.disabled}"
            @click="${()=>t(e)}">${e.text}</button>`,_r=(e,t=!0)=>n`
    <div class="m-hl" style="align-items: ${e.title?"baseline":"center"}; min-width: 0;">
        ${e.logo?n`<img src="${e.logo}" alt="logo" height="28px" style="margin-left: ${t?"10px":"0"}; align-self: center;">`:d}
        ${e.title?n`<h2 class="mateu-app-title" style="margin: 0 var(--lumo-space-l, 1.5rem) 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${e.title}</h2>`:d}
    </div>`,Cr="flex: 1; min-width: 0; align-items: baseline;",Sr="m-hl mateu-app-header",Kr=(e,t,a="")=>n`
    <nav class="mateu-nav ${a}">
        ${e.map(i=>(i.children?.length??0)>0?n`<details class="mateu-nav-group">
                       <summary class="mateu-nav-item">${i.text} ▾</summary>
                       <div class="mateu-nav-panel">
                           ${i.children.map(r=>mo(r,t))}
                       </div>
                   </details>`:mo(i,t))}
    </nav>`,cb=(e,t)=>{const a=[{text:"☰",children:e,className:"mateu-menu-button-root","aria-label":"Menu"}];return H.get()?.renderTopNav?.(a,t,"menu-button")??Kr(a,t,"menu-button")},Er=(e,t)=>a=>t.call(e,{detail:{value:a}}),ub=(e,t)=>e.backRoute?n`
        <a href="${e.backRoute}" class="mateu-back-link"
           style="align-self: center; margin-left: 10px; white-space: nowrap; font-size: var(--lumo-font-size-s, .875rem);"
           @click="${a=>{a.preventDefault(),et.confirmLeave()&&Et(t,e.backRoute)}}">← ${e.backLabel??"Back"}</a>`:d,ml=e=>H.get()?.renderHeaderIconButton?.(e)??n`
        <button class="app-chrome-icon-btn ${e.cssClasses??""}" @click="${e.onClick}"
            title="${e.title??e.label}" aria-label="${e.label}"
            aria-pressed="${e.pressed===void 0?d:String(e.pressed)}">
            ${G(e.icon,"width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem); color: currentColor;")}
        </button>`,fl=(e,t)=>e.themeToggle?ml({icon:t.isDark?"vaadin:sun-o":"vaadin:moon-o",label:Gr(t.isDark?"lightMode":"darkMode"),cssClasses:"mateu-theme-toggle",onClick:()=>t.toggleTheme()}):d,vl=(e,t)=>e.sseUrl?ml({icon:"vaadin:comments-o",label:Gr("chat"),title:Gr(t.chatOpen?"closeChat":"openChat"),pressed:!!t.chatOpen,cssClasses:"mateu-chat-toggle"+(t.chatOpen?" mateu-chat-toggle--open":""),onClick:()=>t.showHideIa()}):d,Si=(e,t)=>n`
    ${vl(e,t)}
    <slot name="widgets"></slot>
    ${pl(e,t)}${fl(e,t)}`,Gt=(e,t,a,i)=>e.sseUrl?n`<mateu-chat slot="${t.chatOpen?"detail":"detail-hidden"}" sseurl="${e.sseUrl}" .label="${e.askLabel}" .mcpUrl="${e.mcpUrl}" .uploadUrl="${e.uploadUrl}" .menu="${e.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:a,appData:i,componentState:t.state,componentData:t.data})}" @navigation-requested="${t.updateRoute}" @close-requested="${t.showHideIa}"></mateu-chat>`:d,hb=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},fo=(e,t,a)=>{const i=pt(e,t,a),r=de(t,a);return i=="list"||i==r?"new":i},pt=(e,t,a)=>{const i=e?._route;if(i!=null&&(i===""||i.startsWith("/"))){const r=a.homeRoute??"",s=r.indexOf("?"),o=s>=0?r.substring(s+1):"",l=de(t,a)+i;if(!o)return l;const c=l.indexOf("?")>=0?"&":"?";return l+c+o}return t.selectedRoute?t.selectedRoute:a.homeRoute},de=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,Ye=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:e.baseUrl||t.homeBaseUrl,Me=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,Xe=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,pb=(e,t)=>"ux_"+((de(e,t)||"root")+"|"+(Me(e,t)??"")).replace(/[^a-zA-Z0-9]/g,"_"),mb=(e,t,a,i,r,s,o)=>{t.variant!==Ne.MENU_ON_TOP&&t.menu?.some(m=>m.remote)&&(t={...t,variant:Ne.MENU_ON_TOP});const l=pb(e,t);if(t.chromeless)return n`
            <div class="app chromeless">
                <div role="main" class="${"app-content"+(e.pageCompact?" no-padding":"")}" style="height: 100%;">
                    <div class="m-md">
                        <div class="m-scroll" style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        data-content-view
                                        route="${pt(i,e,t)}"
                                        id="${l}"
                                        baseUrl="${Ye(e,t)}"
                                        consumedRoute="${de(e,t)}"
                                        serverSideType="${Me(e,t)}"
                                        uriPrefix="${Xe(e,t)}"
                                        style="width: 100%;"
                                        .appState="${s}"
                                        .appData="${o}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                        ${Gt(t,e,s,o)}
                    </div>
                </div>
                <slot></slot>
            </div>
        `;const c=e.mapItems(t.menu,e.filter?.toLowerCase()??""),u=de(e,t),p=fo(i,e,t),f=p&&p!=="new"&&p.startsWith(u+"/")?p.substring(u.length+1).split("/")[0]:void 0;return n`
                    ${t.variant==Ne.MEDIATOR?n`

                        ${t.layout=="SPLIT"?n`
                            <div class="m-md">
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            data-content-view
                                            route="${de(e,t)}"
                                            id="${l}"
                                            baseUrl="${Ye(e,t)}"
                                            consumedRoute="${de(e,t)}"
                                            serverSideType="${Me(e,t)}"
                                            uriPrefix="${Xe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...s,_splitDetailId:f}}"
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
                                            route="${fo(i,e,t)}"
                                            id="${l}_detail"
                                            baseUrl="${Ye(e,t)}"
                                            consumedRoute="${de(e,t)}"
                                            serverSideType="${Me(e,t)}"
                                            uriPrefix="${Xe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>

                            </div>
                        `:db(lb(t.homeRoute),()=>n`
                            <mateu-api-caller>
                                <mateu-ux
                                        data-content-view
                                        route="${pt(i,e,t)}"
                                        id="${l}"
                                        baseUrl="${Ye(e,t)}"
                                        consumedRoute="${de(e,t)}"
                                        serverSideType="${Me(e,t)}"
                                        uriPrefix="${Xe(e,t)}"
                                        style="width: 100%;"
                                        .appState="${s}"
                                        .appData="${o}"
                                        .initialState="${i}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `)}
                        
`:d}
            ${t.variant==Ne.HAMBURGUER_MENU?n`
                <div class="mateu-app-layout m-app-layout ${t.drawerClosed?"":"drawer-open"} ${t?.cssClasses}" style="${t?.style}">
                    <header class="app-navbar">
                        <button class="drawer-toggle" title="Menu"
                                @click="${m=>m.currentTarget.closest(".m-app-layout")?.classList.toggle("drawer-open")}">
                            ${G("vaadin:menu")}
                        </button>
                        <h2 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; margin: 0 .5rem;">${t.title}</h2><p style="margin: 0;">${t.subtitle}</p>
                        <div class="m-hl" style="margin-left: auto; align-items: center;">
                            ${Si(t,e)}
                        </div>
                    </header>
                    <div class="app-body">
                        <aside class="app-drawer p-s" @navigation-requested="${e.updateRoute}">
                            ${t.menu&&t.totalMenuOptions>10?n`
                                <div style="position: sticky; top: 0; z-index: 2; background: var(--lumo-base-color); padding: .25rem 0 .5rem;">
                                    <input class="drawer-search" placeholder="Search…" style="width: calc(100% - 20px); margin: 0 10px;"
                                           @input="${m=>hb({detail:{value:m.target.value}},e)}">
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
                                                route="${pt(i,e,t)}"
                                                id="${l}"
                                                baseUrl="${Ye(e,t)}"
                                                consumedRoute="${de(e,t)}"
                                                serverSideType="${Me(e,t)}"
                                                uriPrefix="${Xe(e,t)}"
                                                style="width: 100%;"
                                                .appState="${s}"
                                                .appData="${o}"
                                                instant="${e.instant}"
                                                @navigation-requested="${e.updateRoute}"
                                        ></mateu-ux>
                                    </mateu-api-caller>
                                </div>
                                ${Gt(t,e,s,o)}
                            </div>
                        </div>
                    </div>
                </div>

            `:d}
            
            ${t.variant==Ne.MENU_ON_TOP?n`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <!-- TWO BANDS, like the Redwood header: band 1 = the logo on the left and the
                         widgets on the right; band 2 = the app's title, then its menu as a horizontal
                         bar. A narrow viewport folds the menu into a ☰ button next to the title. -->
                    <div class="m-hl mateu-app-band1"
                            style="width: 100%; height: 3.5rem; flex-shrink: 0; align-items: center; background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${Sr}" style="${Cr}" theme="spacing">
                        <a href="javascript: void(0);" @click="${()=>e.goHome()}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                        ${_r({...t,title:""},!1)}
                        </a>
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${Si(t,e)}
                        </div>
                    </div>
                    </div>
                    <nav class="mateu-app-band2" aria-label="${t.title||"Menu"}"
                            @navigation-requested="${e.updateRoute}">
                        <div class="mateu-app-menu-button">
                            ${cb(c,Er(e,e.itemSelected))}
                        </div>
                        ${t.title?n`<a href="javascript: void(0);" @click="${()=>e.goHome()}" class="mateu-app-band-title">${t.title}</a>`:d}
                        ${(()=>{const m=Er(e,e.itemSelected);return H.get()?.renderTopNav?.(c,m,"menu-on-top menu-band")??Kr(c,m,"menu-on-top menu-band")})()}
                    </nav>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll mateu-content-gutter" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${pt(i,e,t)}"
                                            id="${l}"
                                            baseUrl="${Ye(e,t)}"
                                            consumedRoute="${de(e,t)}"
                                            serverSideType="${Me(e,t)}"
                                            uriPrefix="${Xe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${Gt(t,e,s,o)}
                        </div>
                    </div>
                </div>

            `:d}

            ${t.variant==Ne.TILES?n`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${Sr}" style="${Cr}" theme="spacing">
                        <a href="javascript: void(0);" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                        ${_r(t)}
                        </a>
                        ${Kr(e.mapItemsForTiles(t.menu),Er(e,e.itemSelectedTiles),"menu-on-top")}
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${Si(t,e)}
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
                                            route="${pt(i,e,t)}"
                                            id="${l}"
                                            baseUrl="${Ye(e,t)}"
                                            consumedRoute="${de(e,t)}"
                                            serverSideType="${Me(e,t)}"
                                            uriPrefix="${Xe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${Gt(t,e,s,o)}
                        </div>
                        `}
                    </div>
                </div>
            `:d}

            ${t.variant==Ne.RAIL?n`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):d}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${pt(i,e,t)}"
                                            id="${l}"
                                            baseUrl="${Ye(e,t)}"
                                            consumedRoute="${de(e,t)}"
                                            serverSideType="${Me(e,t)}"
                                            uriPrefix="${Xe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${Gt(t,e,s,o)}
                        </div>
                    </div>
                </div>
            `:d}

            ${t.variant==Ne.MENU_ON_LEFT?n`

                <div class="m-hl">
                    <div class="m-scroll" style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <div class="m-vl"
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(m=>e.renderOptionOnLeftMenu(m))}
                            ${vl(t,e)}${pl(t,e)}${fl(t,e)}
                        </div>
                    </div>
                    <div role="main" class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${pt(i,e,t)}"
                                            id="${l}"
                                            baseUrl="${Ye(e,t)}"
                                            consumedRoute="${de(e,t)}"
                                            serverSideType="${Me(e,t)}"
                                            uriPrefix="${Xe(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${s}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${Gt(t,e,s,o)}
                        </div>
                    </div>
                </div>


            `:d}

            ${t.variant==Ne.TABS?n`
                <!--
                
                box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
                
                -->
                
                <div>
                    <div>
                        <div class="${Sr}" 
                                style="width: 100%; ${Cr} border-bottom: 1px solid var(--lumo-contrast-10pct);" 
                                theme="spacing"
                                @navigation-requested="${e.updateRoute}">
                            ${ub(t,e)}
                            <a href="javascript: void(0);" @click="${()=>e.goHome()}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                            ${_r(t)}
                            </a>
                            <nav class="mateu-tabs ${e.component?.cssClasses??""}" style="flex-grow: 1; min-width: 0; margin-left: 1.5rem;">
                                ${(t.menu?.length??0)<2?d:t.menu.map((m,b)=>n`
                                <button class="mateu-tab ${b===e.getSelectedIndex(t.menu)?"mateu-tab--active":""}"
                                        @click="${()=>e.selectRoute(m.consumedRoute,m.route,m.actionId,m.baseUrl,m.serverSideType,m.uriPrefix,m.rules)}"
                                >${m.label}</button>`)}
                            </nav>
                            <div class="m-hl mateu-app-widgets" style="align-items: center;">
                                ${Si(t,e)}
                            </div>
                        </div>
                    </div>
                    <div role="main" class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${pt(i,e,t)}"
                                            id="${l}"
                                            baseUrl="${Ye(e,t)}"
                                            consumedRoute="${de(e,t)}"
                                            serverSideType="${Me(e,t)}"
                                            uriPrefix="${Xe(e,t)}"
                                            style="width: 100%;"
                                            .appState="${s}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${Gt(t,e,s,o)}
                        </div>
                    </div>
                </div>
            
            `:d}

            ${t.fabs?.map((m,b)=>n`
                <button class="app-fab" style="${kn(b)}" ${vs("shell",b)} aria-label="${m.label}"
                    @click="${()=>e.runAction(m.actionId)}"
                    title="${m.label}">
                    ${G(m.icon)}
                </button>
            `)}
            ${e.renderCommandPalette()}
            <slot></slot>
       `};class fb{renderFilterBar(t,a,i,r,s,o,l,c){const u=a?.metadata,p=m=>{const{fieldId:b,value:$}=m.detail;t.state={...t.state,[b]:$}},f=m=>{const{fieldIds:b}=m.detail,$={};b.forEach(y=>{$[y]=void 0}),$.searchText=void 0,t.state={...t.state,...$}};return n`
            <mateu-filter-bar
                .metadata="${u}"
                @search-requested="${t.search}"
                @value-changed="${p}"
                @filter-reset-requested="${f}"
                .state="${t.state}"
                .data="${s}"
                .appState="${o}"
                .appData="${l}"
                ?searchOnly="${c??!1}"
            >
                ${u?.header?.map(m=>w(t,m,i,r,s,o,l))}
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
        `}renderTableComponent(t,a,i,r,s,o,l){const c=t.data?.[t.id]?.page?.content??[];return Mr(a,c,r[a?.id]?.emptyStateMessage)}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,a,i,r,s,o,l,c){const u=a?.metadata?.type??a?.type,p=Object.values(v).includes(u)?u:void 0;return Zp(this.supportedClientSideTypes(),p)?Fn(a,p,this.rendererName()):xs(t,a,i,r,s,o,l,c)}renderAppComponent(t,a,i,r,s,o,l){return mb(t,a?.metadata,i,r,s,o,l)}}const vb=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=u=>n`${w(e,u,a,i,r,s,o)}`;return n`
        <vaadin-virtual-list
                .items="${l.page.content}"
                ${Pl(c,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
        ></vaadin-virtual-list>
    `},bb=e=>{const t=e.metadata;return n`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${Ol(()=>n`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>${t.text}</div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
    `},gb=(e,t={})=>{const a=e.metadata,i=a.valueKey?t[a.valueKey]:a.value;return n`
        <div style="${e.style}">
        <vaadin-progress-bar
                ?indeterminate="${a.indeterminate}"
                min="${a.min&&a.min!=0?a.min:d}"
                max="${a.max&&a.max!=0?a.max:d}"
                value="${i??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
        ></vaadin-progress-bar>
        ${a.text?n`<span class="text-secondary text-xs" id="sublbl">
    ${a.text}
  </span>`:d}
        </div>
    `},yb=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`
        <vaadin-details
                ?opened="${l.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            <vaadin-details-summary slot="summary">
            ${w(e,l.summary,a,i,r,s,o)}
            </vaadin-details-summary>
            ${w(e,l.content,a,i,r,s,o)}
        </vaadin-details>
            `},$b=(e,t,a)=>{const i=e.metadata;return n`<vaadin-avatar
            img="${i.image}"
            name="${Ie(i.name,t,a)}"
            abbr="${i.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??d}"
    ></vaadin-avatar>`},wb=e=>{const t=e.metadata;return n`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??d}">
    </vaadin-avatar-group>`},xb=(e,t,a,i,r,s,o)=>{const l=t.metadata;if(!l)return n``;let c="";return l.variants?.map(u=>u=="stretchMedia"?"stretch-media":u=="coverMedia"?"cover-media":u).forEach(u=>c+=" "+u),c=c.trim(),n`
        <vaadin-card
                style="${t.style}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${l.media?Vt(e,l.media,a,i,r,s,o,"media",!1):d}
            ${l.title?Vt(e,l.title,a,i,r,s,o,"title",!1):d}
            ${l.subtitle?Vt(e,l.subtitle,a,i,r,s,o,"subtitle",!1):d}
            ${l.header?Vt(e,l.header,a,i,r,s,o,"header",!1):d}
            ${l.headerPrefix?Vt(e,l.headerPrefix,a,i,r,s,o,"header-prefix",!1):d}
            ${l.headerSuffix?Vt(e,l.headerSuffix,a,i,r,s,o,"header-suffix",!1):d}
            ${l.footer?Vt(e,l.footer,a,i,r,s,o,"footer",!1):d}
            ${l.content?w(e,l.content,a,i,r,s,o,!1):d}
        </vaadin-card>
    `},kb=640,_b=e=>e>0&&e<kb?"accordion":"tabs";var Cb=Object.defineProperty,Sb=Object.getOwnPropertyDescriptor,pr=(e,t,a,i)=>{for(var r=i>1?void 0:i?Sb(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Cb(t,a,r),r};let Pa=class extends _{constructor(){super(...arguments),this.tabLabels=[],this.mode="tabs",this.selected=0,this.selectedChangedListener=e=>{const t=e.detail?.value;typeof t=="number"&&t>=0&&(this.selected=t)}}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)this.mode=_b(t.contentRect.width)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=void 0,this.detachTabsListener()}detachTabsListener(){this.slottedTabs?.removeEventListener("selected-changed",this.selectedChangedListener),this.slottedTabs=void 0}tabsSlotChanged(e){this.detachTabsListener();const a=e.target.assignedElements().find(i=>"selected"in i);a&&(this.slottedTabs=a,a.addEventListener("selected-changed",this.selectedChangedListener),a.selected=this.selected)}select(e){this.selected=e,this.slottedTabs&&(this.slottedTabs.selected=e)}updated(){this.slottedTabs&&this.slottedTabs.selected!=this.selected&&(this.slottedTabs.selected=this.selected)}render(){return n`
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
        `}};Pa.styles=x`
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
    `;pr([h({type:Array})],Pa.prototype,"tabLabels",2);pr([g()],Pa.prototype,"mode",2);pr([g()],Pa.prototype,"selected",2);Pa=pr([k("mateu-adaptive-tabs")],Pa);const Eb=(e,t,a)=>{const i=(e||"").replace(/\/+$/,""),r=i.split("/"),s=r[r.length-1];return(t.includes(s)?r.slice(0,-1).join("/"):i)+"/"+a},Ib=(e,t)=>{const a=(e||"").replace(/\/+$/,""),i=a.substring(a.lastIndexOf("/")+1);return i?t.findIndex(r=>!!r&&r===i):-1},Tb=(e,t,a)=>{const i=t[a];if(!i||typeof window>"u")return;const r=t.filter(o=>!!o),s=Eb(window.location.pathname,r,i);s!==window.location.pathname&&e.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:s},bubbles:!0,composed:!0}))},Pb=(e,t="")=>{const a=zb(e)||"tabs";return t?`${t}.${a}`:a},Ob=(e,t)=>`${e}-tab-${t}`,zb=e=>(e??"").trim().replace(/\s+/g,"_"),Ha=[],Rb=()=>Ha.length?Ha[Ha.length-1]:"",vo=(e,t)=>{Ha.push(e);try{return t()}finally{Ha.pop()}},Ab=(e,t,a,i,r,s,o)=>{const l=t.metadata;let c=t.style;c==null&&(c=""),l.columnSpacing&&(c+="--vaadin-form-layout-column-spacing: "+l.columnSpacing+";");const u=l.itemRowSpacing&&l.itemRowSpacing!=="0"?l.itemRowSpacing:"var(--lumo-space-m)";return c+="--vaadin-form-layout-row-spacing: "+u+";",l.itemLabelSpacing&&(c+="--vaadin-form-layout-label-spacing: "+l.itemLabelSpacing+";"),l.labelsAside&&(c+="--vaadin-form-item-label-width: 10rem;"),l.fullWidth&&(c+="width: 100%;"),n`
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
                   ${t.children?.map(p=>bl(l,e,p,a,i,r,s,o))}
               </vaadin-form-layout>
            `},bl=(e,t,a,i,r,s,o,l)=>a.type==J.ClientSide&&a.metadata?.type==v.FormRow?Db(e,t,a,i,r,s,o,l):e.labelsAside?Lb(t,a,i,r,s,o,l):w(t,a,i,r,s,o,l),Lb=(e,t,a,i,r,s,o)=>{if(t.type==J.ClientSide&&t.metadata?.type==v.FormField&&t.metadata.label){const l=t.metadata,c=l.label?.includes("${")?e._evalTemplate(l.label):l.label;return n`
                       <vaadin-form-item data-colspan="${l.colspan}">
                           <label slot="label">${c}</label>
                           ${w(e,t,a,i,r,s,o,!0)}
                       </vaadin-form-item>
                   `}return w(e,t,a,i,r,s,o)},Db=(e,t,a,i,r,s,o,l)=>n`
        <vaadin-form-row>
            ${a.children?.map(c=>bl(e,t,c,i,r,s,o,l))}
        </vaadin-form-row>
            `,Fb=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.verticalAlignment&&(u=u?"align-items: "+l.verticalAlignment+";"+u:"align-items: "+l.verticalAlignment+";"),n`
               <vaadin-horizontal-layout 
                       style="${u}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(p=>w(e,p,a,i,r,s,o))}
               </vaadin-horizontal-layout>
            `},Mb=(e,t,a,i,r,s,o)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.horizontalAlignment&&(u=u?"align-items: "+l.horizontalAlignment+";"+u:"align-items: "+l.horizontalAlignment+";"),n`
        <vaadin-vertical-layout
                style="${u}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(p=>w(e,p,a,i,r,s,o))}
        </vaadin-vertical-layout>
    `},Nb=(e,t,a,i,r,s,o)=>{const l=t.metadata;let c=t.style;return l.fullWidth&&(c=c?"width: 100%;"+c:"width: 100%;"),n`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${l.orientation??d}"
                       theme="${l.variant??d}"
                       slot="${t.slot??d}"
               >
                   <master-content>${w(e,t.children[0],a,i,r,s,o)}</master-content>
                   <detail-content>${w(e,t.children[1],a,i,r,s,o)}</detail-content>
               </vaadin-split-layout>
            `},qb=(e,t,a,i,r,s,o)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=r?.detailComponent??null,u=!!r?.hasDetail||!!l,p=c??l;return n`
               <vaadin-master-detail-layout ?has-detail="${u}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??d}">
                   <div>${w(e,t.children[0],a,i,r,s,o)}</div>
                   ${u&&p?n`<div slot="detail">${w(e,p,a,i,r,s,o)}</div>`:n`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},Bb=(e,t,a,i,r,s,o)=>{const l=t.metadata;let c=t.style;c==null&&(c=""),l.fullWidth&&(c+="width: 100%;");let u=l.variant;u=="equalWidth"&&(u="equal-width-tabs");const p=(t.children??[]).map(S=>S);if(p.length===1)return go(e,p[0],a,i,r,s,o);const f=p.map(S=>S.metadata.routeKey),m=typeof window<"u"?Ib(window.location.pathname,f):-1,b=m>=0?m:Math.max(0,p.findIndex(S=>S.metadata.active)),$=S=>{const I=S.target;I.__mateuTabsSettled=!1,I.selected=b,setTimeout(()=>{I.__mateuTabsSettled=!0})},y=f.some(S=>!!S)?S=>{const I=S.target;if(!I.__mateuTabsSettled)return;const T=S.detail?.value;typeof T=="number"&&T>=0&&Tb(I,f,T)}:void 0,E=Pb(t.id,Rb()),z=(t.children??[]).map((S,I)=>Ob(E,I));if(l.adaptable){const S=(t.children??[]).map(I=>{const T=I.metadata.label;return T?.includes("${")?e._evalTemplate(T):T});return n`
            <mateu-adaptive-tabs
                    .tabLabels="${S}"
                    style="${c}"
                    class="${t.cssClasses}"
                    slot="${t.slot??d}"
            >
                <vaadin-tabs slot="tabs"
                             theme="${u??d}"
                             orientation="${l.orientation??d}"
                             @items-changed=${$}
                             @selected-changed=${y??d}
                >
                    ${t.children?.map(I=>I).map((I,T)=>{const O=I.metadata.shortcut;return n`
                        <vaadin-tab id="${z[T]}"
                                    style="${I.style}"
                                    class="${I.cssClasses}"
                                    data-shortcut="${O??d}"
                        >${S[T]}${bo(I)}</vaadin-tab>`})}
                </vaadin-tabs>

                ${t.children?.map((I,T)=>n`
                    <div slot="panel-${T}" style="padding: var(--lumo-space-m) 0;">
                        ${vo(z[T],()=>I.children?.map(O=>w(e,O,a,i,r,s,o)))}
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
                         @items-changed=${$}
                         @selected-changed=${y??d}
            >
                ${t.children?.map(S=>S).map((S,I)=>{const T=S.metadata.label,O=T?.includes("${")?e._evalTemplate(T):T,le=S.metadata.shortcut;return n`
                    <vaadin-tab id="${z[I]}"
                                style="${S.style}"
                                class="${S.cssClasses}"
                                data-shortcut="${le??d}"
                    >${O}${bo(S)}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map((S,I)=>vo(z[I],()=>go(e,S,a,i,r,s,o,z[I])))}
        </vaadin-tabsheet>
            `},bo=e=>{const t=e.metadata.badge;return t?n` <span theme="badge pill small contrast" style="margin-inline-start: .35em;">${t}</span>`:d},go=(e,t,a,i,r,s,o,l)=>{const c=t.metadata.label,u=c?.includes("${")?e._evalTemplate(c):c;return n`
        <div tab="${l??u}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(p=>w(e,p,a,i,r,s,o))}
               </div>
            `},jb=(e,t,a,i,r,s,o)=>{const l=t.metadata;t.style,l.fullWidth;let c=0;if(t.children){for(let u=0;u<t.children.length;u++)if(t.children[u].metadata?.active){c=u;break}}return n`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(u=>Ub(e,u,a,i,r,s,o,l.variant))}
               </vaadin-accordion>
            `},Ub=(e,t,a,i,r,s,o,l)=>{const c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return n`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${l??d}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${u}</vaadin-accordion-heading>
            ${t.children?.map(p=>w(e,p,a,i,r,s,o))}
        </vaadin-accordion-panel>
            `},Wb=(e,t,a,i,r,s,o)=>n`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??d}">
                   ${t.children?.map(l=>w(e,l,a,i,r,s,o))}
               </vaadin-scroller>
            `,Hb=(e,t,a,i,r,s,o)=>n`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??d}">
            ${t.children?.map(l=>w(e,l,a,i,r,s,o))}
        </vaadin-board>
            `,Vb=(e,t,a,i,r,s,o)=>n`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(l=>w(e,l,a,i,r,s,o))}
               </vaadin-board-row>
            `,Gb=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${l.boardCols??d}"
        >
                   ${t.children?.map(c=>w(e,c,a,i,r,s,o))}
               </div>
            `},Kb="mateu-nav-active",gl=e=>e.selected===!0||(e.children??[]).some(gl),Yb=e=>e.map(t=>gl(t)?{...t,className:[t.className,Kb].filter(Boolean).join(" ")}:t),Xb=(e,t,a)=>n`
    <vaadin-menu-bar
        theme="tertiary contrast"
        .items=${Yb(e)}
        class="${a??d}"
        @item-selected=${i=>t(i.detail.value)}>
    </vaadin-menu-bar>`,Jb=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`
        <vaadin-context-menu .items=${Is(e,l.menu,a,i,r,s,o)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${l.activateOnLeftClick?"click":d}"
                             slot="${t.slot??d}">
            ${w(e,l.wrapped,a,i,r,s,o)}
        </vaadin-context-menu>
            `},Qb=(e,t,a,i,r)=>{const s=t.metadata;return n`
        <vaadin-menu-bar .items=${Is(e,s.options,a,i,r,oe,Zt)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??d}">
        </vaadin-menu-bar>
            `},yo=(e,t,a,i,r,s,o)=>{const l=document.createElement("vaadin-context-menu-item");return Io(w(e,t,a,i,r,s,o),l),l},Is=(e,t,a,i,r,s,o)=>t.map(l=>l.submenus?{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?yo(e,l.component,a,i,r,s,o):void 0,children:Is(e,l.submenus,a,i,r,s,o)}:l.separator?{component:"hr"}:{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?yo(e,l.component,a,i,r,s,o):void 0});var Zb=Object.defineProperty,eg=Object.getOwnPropertyDescriptor,pi=(e,t,a,i)=>{for(var r=i>1?void 0:i?eg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Zb(t,a,r),r};let na=class extends _{constructor(){super(...arguments),this.fieldId="",this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{const t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;const a=t.getContext("2d");a.lineWidth=2,a.lineCap="round",a.lineJoin="round",a.strokeStyle=getComputedStyle(this).getPropertyValue("--lumo-body-text-color")||"#1a1a1a";const[i,r]=this.pointerPosition(e);a.beginPath(),a.moveTo(i,r),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;const a=e.target.getContext("2d"),[i,r]=this.pointerPosition(e);a.lineTo(i,r),a.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector("canvas")}pointerPosition(e){const a=e.target.getBoundingClientRect();return[e.clientX-a.left,e.clientY-a.top]}ensureCanvasSize(e){const t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){const e=this.canvas();e&&e.getContext("2d").clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){const e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL("image/png")))}renderPad(){return n`
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
            </div>`}};na.styles=x`
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
    `;pi([h()],na.prototype,"fieldId",2);pi([h()],na.prototype,"value",2);pi([g()],na.prototype,"signing",2);pi([g()],na.prototype,"hasStrokes",2);na=pi([k("mateu-signature-pad")],na);var tg=Object.defineProperty,ag=Object.getOwnPropertyDescriptor,ma=(e,t,a,i)=>{for(var r=i>1?void 0:i?ag(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&tg(t,a,r),r};let vt=class extends _{constructor(){super(...arguments),this.fieldId="",this.options=[],this.leavesOnly=!1,this.opened=!1,this.expandedItems=[],this._normalized=[],this.dataProvider=(e,t)=>{const a=e.parentItem?e.parentItem.children??[]:this.normalized;t(a,a.length)}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get normalized(){return this._optsSource!==this.options&&(this._optsSource=this.options,this._normalized=this.normalizeOptions(this.options??[])),this._normalized}normalizeOptions(e){return e.map(t=>{const a=t.children&&t.children.length?this.normalizeOptions(t.children):void 0;return{...t,children:a}})}ancestorsOf(e,t){for(const a of t){if(String(a.value)===e)return[];const i=a.children?this.ancestorsOf(e,a.children):null;if(i!=null)return[a,...i]}return null}labelOf(e,t){for(const a of t){if(String(a.value)===e)return a.label;const i=a.children?this.labelOf(e,a.children):null;if(i!=null)return i}return null}open(){this.opened||(this.expandedItems=this.value!=null?this.ancestorsOf(String(this.value),this.normalized)??[]:[],this.opened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.close()},document.addEventListener("mousedown",this.outsideClick))}close(){this.detachOutsideClick(),this.opened=!1}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}pick(e){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e.value,fieldId:this.fieldId},bubbles:!0,composed:!0}))}clear(){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:this.fieldId},bubbles:!0,composed:!0}))}onActiveItemChanged(e){const t=e.detail.value;if(!t)return;if((t.children?.length??0)>0&&this.leavesOnly){this.expandedItems=this.expandedItems.includes(t)?this.expandedItems.filter(i=>i!==t):[...this.expandedItems,t],e.target.activeItem=null;return}this.pick(t)}render(){const e=this.value!=null&&this.value!==""?this.labelOf(String(this.value),this.normalized)??String(this.value):"";return n`
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
            </div>`}};vt.styles=x`
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
    `;ma([h()],vt.prototype,"fieldId",2);ma([h()],vt.prototype,"value",2);ma([h()],vt.prototype,"options",2);ma([h({type:Boolean})],vt.prototype,"leavesOnly",2);ma([g()],vt.prototype,"opened",2);ma([g()],vt.prototype,"expandedItems",2);vt=ma([k("mateu-vaadin-tree-select")],vt);var ig=Object.defineProperty,rg=Object.getOwnPropertyDescriptor,mi=(e,t,a,i)=>{for(var r=i>1?void 0:i?rg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&ig(t,a,r),r};let la=class extends _{constructor(){super(...arguments),this.fieldId="",this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const i=new FileReader;i.onload=()=>this.emit(i.result),i.readAsDataURL(a),t.value=""}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:!1}),this.cameraOpen=!0,await this.updateComplete;const e=this.renderRoot.querySelector("video");e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){const e=this.renderRoot.querySelector("video");if(!e||e.videoWidth===0)return;const t=document.createElement("canvas");t.width=e.videoWidth,t.height=e.videoHeight,t.getContext("2d").drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL("image/jpeg",.9))}triggerFallback(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="";return n`
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
            `}`}};la.styles=x`
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
    `;mi([h()],la.prototype,"fieldId",2);mi([h()],la.prototype,"value",2);mi([g()],la.prototype,"cameraOpen",2);mi([g()],la.prototype,"cameraError",2);la=mi([k("mateu-camera-capture")],la);var sg=Object.defineProperty,og=Object.getOwnPropertyDescriptor,fi=(e,t,a,i)=>{for(var r=i>1?void 0:i?og(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&sg(t,a,r),r};const ng=(e,t)=>{if(!e)return;if(Array.isArray(e)){const i=e.find(r=>r.key==t);return i?.value!=null?String(i.value):void 0}const a=e[t];return a!=null?String(a):void 0};let Rt=class extends _{constructor(){super(...arguments),this.fieldId="",this.editable=!0,this.filePicked=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const i=new FileReader;i.onload=()=>{const r=i.result,s=r.indexOf(","),o=r.substring(0,s).replace(";base64",`;name=${encodeURIComponent(a.name)};base64`);this.emit(o+r.substring(s))},i.readAsDataURL(a),t.value=""}}static fileName(e){if(!e)return"";if(e.startsWith("data:")){const t=e.indexOf(","),i=e.substring(5,t<0?e.length:t).split(";").find(r=>r.startsWith("name="));if(i)try{return decodeURIComponent(i.substring(5))}catch{return i.substring(5)}return"Attached file"}return e.split("/").pop()||e}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}triggerPick(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="",t=Rt.fileName(this.value),a=e&&this.value.startsWith("data:"),i=e?n`<span class="file" title="${t}">📄 ${a?n`<a href="${this.value}" download="${t}">${t}</a>`:n`<a href="${this.value}" target="_blank">${t}</a>`}</span>`:d;return this.editable?n`
            <input type="file" accept="${this.accept||d}" style="display: none;"
                   @change="${this.filePicked}">
            <div class="row">
                ${i}
                <button class="button" @click="${this.triggerPick}">
                    ${e?"Replace":"Choose file"}
                </button>
                ${e?n`
                    <button class="button button--danger" @click="${()=>this.emit("")}">Remove</button>`:d}
            </div>`:n`${e?i:n`<span class="empty">—</span>`}`}};Rt.styles=x`
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
    `;fi([h()],Rt.prototype,"fieldId",2);fi([h()],Rt.prototype,"value",2);fi([h()],Rt.prototype,"accept",2);fi([h({type:Boolean})],Rt.prototype,"editable",2);Rt=fi([k("mateu-file-upload")],Rt);const Yr=e=>e==null||typeof e=="string"&&e.trim()==="",Ts=(e,t)=>{if(Yr(e))return null;const a=t?parseInt(String(e),10):Number(e);return Number.isNaN(a)?null:a},lg=(e,t)=>Yr(e)&&Yr(t)?!0:e==t,dg=e=>!!e&&e.stereotype=="searchable"&&e.dataType=="array",cg=e=>e.endsWith("-label")?e.substring(0,e.length-6):e,ug=e=>e==null||e===""?[]:Array.isArray(e)?e.filter(t=>t!=null&&t!==""):e instanceof Set?[...e].filter(t=>t!=null&&t!==""):[e],hg=(e,t)=>{const a=t&&typeof t=="object"?t:{};return e.map(i=>{const r=a[String(i)];return{id:i,label:r!=null&&r!==""?String(r):String(i)}})},pg=(e,t)=>e.filter(a=>String(a)!==String(t)),Ei="3rem";function mg(e,t=!0){if(!t)return`flex: 0 0 ${Ei}; width: ${Ei}; min-width: ${Ei}; max-width: ${Ei};`;const a=(e??"").trim();return a?`flex: 0 0 min(${a}, 100%); width: min(${a}, 100%); min-width: min(${a}, 100%); max-width: min(${a}, 100%);`:""}function fg(e){return(e??[]).map(t=>t?.open!==!1)}function vg(e,t,a){const i=(a??[]).map(r=>r?.title??"").join("");return e&&i===t&&e.length===(a??[]).length?{states:e,key:i}:{states:fg(a),key:i}}function bg(e,t){const a=Math.max(0,e.right-e.left);return t.map(i=>{const r=Math.max(0,i.right-i.left);return r===0||a===0?!1:Math.max(0,Math.min(i.right,e.right)-Math.max(i.left,e.left))>=Math.min(r,a)/2})}function gg(e,t){if(!e?.readOnly)return!1;const a=new Set(["grid","fileUpload","image","uploadableImage","signature","camera","badge","bulletedList","html","richText","markdown","link","icon","color","stars","slider","toggle","popover","plainText","status","money","password"]);if(e.stereotype&&a.has(e.stereotype))return!1;const i=new Set(["status","money","bool","boolean","array","file","range"]);return!(e.dataType&&i.has(e.dataType))}function yg(e,t){const a=t.toUpperCase();let i=e;for(;i;){if(i.tagName===a)return!0;i=i.parentNode??i.host??null}return!1}function $g(e,t){return e?{allRowsVisible:!0,theme:"wrap-cell-content"}:{allRowsVisible:t<10,theme:void 0}}function wg(e){const t=e?.metadata;return!t||t.type==="GridGroupColumn"?e:{...e,metadata:{...t,width:"3rem",autoWidth:!1,flexGrow:"1",frozen:!1,frozenToEnd:!1}}}function xg(e,t,a,i,r=[]){if(t===0||Math.abs(e)>=Math.abs(t))return null;const s=t>0;for(const o of r)if((s?o.scrollHeight-o.clientHeight-o.scrollTop:o.scrollTop)>1)return null;return i<=1||s&&a>=i-1||!s&&a<=1?null:t}const ya=e=>!!e&&typeof e=="object"&&"__mateuGroup"in e,Ir=e=>String(e??""),kg=(e,t,a)=>{const i=e??[];if(!t||!a||a.length===0)return i;const r=[];let s,o=!1;return i.forEach((l,c)=>{const u=Ir(l?.[t]);if(!o||u!==s){const p=a.find(f=>Ir(f.value)===u)??{value:u,count:i.filter(f=>Ir(f?.[t])===u).length,aggregates:{}};r.push({__mateuGroup:p,__mateuGroupBy:t,_rowNumber:`__mateuGroup:${c}:${u}`}),o=!0,s=u}r.push(l)}),r},yl=(e,t)=>e==null?"":t.dataType==="money"||t.stereotype==="money"?new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(e):t.aggregate==="count"?new Intl.NumberFormat(void 0,{maximumFractionDigits:0}).format(Math.round(e)):new Intl.NumberFormat(void 0,{maximumFractionDigits:2}).format(e),_g=(e,t)=>e&&t.includes(e)?e:t.find(a=>!!a),Cg=(e,t,a)=>{const i=e.__mateuGroup;return t.id===a?`${i.value} (${i.count})`:t.aggregate?yl(i.aggregates?.[t.id],t):""},Sg=(e,t,a)=>{const i=t?.aggregates;if(!i||!e.some(o=>o.aggregate))return;const r={};e.forEach(o=>{o.aggregate&&i[o.id]!=null&&(r[o.id]=yl(i[o.id],o))});const s=e[0];if(s&&r[s.id]===void 0){const o=t?.page?.totalElements;r[s.id]=a&&s.id===a&&o!=null?`Total (${o})`:"Total"}return r},Eg=(e,t,a)=>{const i=e[a.path]??"",r=t.captionPath?e[t.captionPath]:void 0,s=t.leadingPath?e[t.leadingPath]:void 0;return n`
        <span style="display: flex; align-items: center; gap: var(--lumo-space-s); overflow: hidden;">
            ${s?n`<img src="${s}" alt="" loading="lazy"
                style="width: 2rem; height: 2rem; border-radius: 50%; object-fit: cover; flex-shrink: 0;" />`:d}
            <span style="display: flex; flex-direction: column; overflow: hidden;">
                <span style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${Ya(i)}</span>
                ${r?n`<span style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${r}</span>`:d}
            </span>
        </span>`},Ig=(e,t,a)=>{const r=e[a.path]?"vaadin:check":"vaadin:minus";return G(r,"height: 16px; width: 16px; color: var(--lumo-body-text-color);")},Tg=(e,t,a,i,r)=>{const s=e[a.path];let o=s;return i=="money"&&s&&s.locale&&s.currency?o=new Intl.NumberFormat(s.locale,{style:"currency",currency:s.currency}).format(s.value):r=="money"&&(o=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(s)),n`${o}`},$o=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},Pg=(e,t,a,i,r,s)=>{const o=a.xcolumn??s;if(o.text){if(o.actionId)return n`<a href="javascript: void(0);" @click="${u=>$o(a,o,e)}">${o.text}</a>`;const c=e[a.path];return n`<a href="${c}">${o.text}</a>`}if(i=="string"){if(o.actionId){const u=e[a.path];return n`<a href="javascript: void(0);" @click="${p=>$o(a,o,e)}">${u}</a>`}const c=e[a.path];return n`<a href="${c}">${c}</a>`}const l=e[a.path];return n`<a href="${l.href}">${l.text}</a>`},Og=(e,t,a,i,r)=>{const s=e[a.path];return i=="string"?s.split(",").map(o=>G(o,"width: 16px;")):s.split(",").map(o=>G(o.icon,"width: 16px;"))},zg=(e,t,a,i,r)=>{const s=e[a.path];return n`${ce(s)}`},Rg=(e,t,a,i,r,s)=>{if(i=="string"){const l=e[a.path],c="max-height: 40px; "+(s.style??"");return n`<img src="${l}" style="${c}">`}const o=e[a.path];return n`<img src="${o.src}" style="${s.style??""}">`},Ag=e=>{const t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Xr=e=>{const t={_clickedRow:e.target.row},a=e.target.action;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+a.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Lg=e=>{const t=document.createElement("vaadin-context-menu-item"),a=document.createElement("vaadin-icon");return a.style.color="var(--lumo-secondary-text-color)",a.style.marginInlineEnd="var(--lumo-space-s)",a.style.padding="var(--lumo-space-xs)",a.setAttribute("icon",e.icon),t.appendChild(a),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},wo=(e,t,a)=>{const i=e[a.path]?.actions;if(i?.length==1){const s=i[0],o=s.icon&&!s.label;return n`
         <vaadin-button theme="tertiary${o?" icon":""}" title="${s.label||d}" ?disabled=${s.disabled}
                        @click="${Xr}" .row="${e}" .action="${s}" data-testid="action-${a.path}">
             ${s.icon?n`<vaadin-icon icon="${s.icon}"></vaadin-icon>`:d}
             ${s.label?s.label:d}
         </vaadin-button>
    `}const r=i?.map(s=>s.icon?{component:Lg(s),methodNameInCrud:s.methodNameInCrud}:{...s,text:s.label});return!r||r.length==0?n``:n`
                                     <vaadin-menu-bar
                                         .items=${[{text:"···",children:r}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${a.path}"
                                         @item-selected="${Ag}"
                                     ></vaadin-menu-bar>
                                   `},Dg=(e,t,a)=>{if(a.path=="select"){const s={actionId:a.path,icon:"",label:"Select",disabled:!1,methodNameInCrud:"select"};return n`
         <vaadin-button theme="tertiary" title="Select" @click="${Xr}" .row="${e}" .action="${s}">
             Select
         </vaadin-button>
    `}const i=a.path&&e[a.path]?.methodNameInCrud?e[a.path]:e.action;if(!i)return n``;const r=i.icon&&!i.label;return n`
         <vaadin-button theme="tertiary${r?" icon":""}" title="${i.label||d}" @click="${Xr}" .row="${e}" .action="${i}">
             ${i.icon?n`<vaadin-icon icon="${i.icon}"></vaadin-icon>`:d}
             ${i.label?i.label:d}
         </vaadin-button>
    `},Fg=(e,t,a)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:a},bubbles:!0,composed:!0}))},Mg=(e,t,a,i,r,s)=>{const o=a.xcolumn??s;if(o.actionId){const c=o.text||Ya(e[a.path]);return n`
            <vaadin-button theme="tertiary" @click="${u=>Fg(a,o,e)}" .row="${e}">
                ${c}
            </vaadin-button>
        `}const l=e[a.path];return n`<a href="${l}">${o.text||l}</a>`},Ng=(e,t,a,i,r,s,o,l,c)=>{const u=e[a.path];return w(i,u,r,s,o,l,c)},Jr=new WeakMap,qg=(e,t)=>Jr.get(e)?.[t],Bg=(e,t,a)=>{let i=Jr.get(e);i||(i={},Jr.set(e,i)),i[t]=a},xo=(e,t=!1)=>Ts(e,t),jg=(e,t,a,i)=>{const r=a?.field?.fieldId,s=c=>{if(e[t.id]===c||e[t.id]==null&&(c===""||c==null))return;if(e[t.id]=c,!r){a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"update-row",parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}const p=(a?.state??i)[r];a.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:r,value:Array.isArray(p)?[...p]:p},bubbles:!0,composed:!0}))},o=e[t.id],l=o==null?"":String(o);switch(t.editorType){case"boolean":return n`<vaadin-checkbox ?checked=${!!o} @checked-changed=${c=>s(c.detail.value)}></vaadin-checkbox>`;case"integer":return n`<vaadin-integer-field theme="small" style="width:100%;" .value=${l} @change=${c=>s(xo(c.target.value,!0))}></vaadin-integer-field>`;case"number":return n`<vaadin-number-field theme="small" style="width:100%;" .value=${l} @change=${c=>s(xo(c.target.value))}></vaadin-number-field>`;case"date":return n`<vaadin-date-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>s(c.detail.value)}></vaadin-date-picker>`;case"time":return n`<vaadin-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>s(c.detail.value)}></vaadin-time-picker>`;case"datetime":return n`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>s(c.detail.value)}></vaadin-date-time-picker>`;case"select":return n`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(c=>({label:c.label,value:String(c.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${l}
                @value-changed=${c=>s(c.detail.value)}></vaadin-combo-box>`;case"lookup":{const c=a?.field?.fieldId,u=`search-${c}-${t.id}`,p=`${c}-${t.id}`,m=(t.editorOptions??[]).find($=>String($.value)===l)??(l?{value:l,label:qg(e,t.id)??l}:void 0);return n`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${($,y)=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:u,parameters:{searchText:$.filter,size:$.pageSize,page:$.page},callback:E=>{const z=E?.fragments?.[0]?.data?.[p];y(z?.content??[],z?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${m}
                @selected-item-changed=${$=>{const y=$.detail.value,E=y?y.value:null;String(E??"")!==l&&(y&&Bg(e,t.id,y.label),s(E))}}></vaadin-combo-box>`}default:return n`<vaadin-text-field theme="small" style="width:100%;" .value=${l} @change=${c=>s(c.target.value)}></vaadin-text-field>`}},Tr=e=>zl(()=>n`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),Pr=e=>e!==void 0?Rl(()=>n`<span style="font-weight: 600; white-space: nowrap;">${e}</span>`,[e]):d,Ug=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent("sort-direction-changed",{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},Wg=(e,t,a,i,r,s,o,l)=>{const c=U(e.label,i,r);return n`
<vaadin-grid-column-group header="${c}">
    ${e.columns.map(u=>$l(u.metadata,t,a,i,r,s,o,l?.[u.metadata?.id]))}
</vaadin-grid-column-group>
`},Ps=(e,t,a,i,r,s,o,l)=>v.GridGroupColumn==e.metadata?.type?Wg(e.metadata,t,a,i,r,s,o,l):$l(e.metadata,t,a,i,r,s,o,l?.[e.metadata?.id]),$l=(e,t,a,i,r,s,o,l)=>{const c=U(e.label,i,r);return e.sortable?n`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??d}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??d}"
                                ?resizable="${e.resizable}"
                                width="${e.width??d}"
                                @direction-changed="${Ug}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${Tr(c)}
                                ${Pr(l)}
                                ${tt((u,p,f)=>Ii(u,p,f,e,t,a,i,r,s,o),[e,i,r])}
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
                                ${Tr(c)}
                                ${Pr(l)}
                                ${tt((u,p,f)=>Ii(u,p,f,e,t,a,i,r,s,o),[e,i,r])}
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
                                ${Tr(c)}
                                ${Pr(l)}
                                ${tt((u,p,f)=>Ii(u,p,f,e,t,a,i,r,s,o),[e,i,r])}
                        ></vaadin-grid-column>
                    `},Ii=(e,t,a,i,r,s,o,l,c,u)=>{const p=a.dataset.dataType??"",f=a.dataset.stereotype??"";if(ya(e)){const $=r?.metadata,y=($?.columns??[]).flatMap(T=>T?.metadata?.type===v.GridGroupColumn?(T.metadata.columns??[]).map(O=>O?.metadata?.id):[T?.metadata?.id]),E=_g(e.__mateuGroupBy,y),z=Cg(e,i,E),S=e.__mateuGroup.hiddenActions??[],I=i.id===y[y.length-1]?($?.groupActions??[]).filter(T=>!S.includes(T.actionId??T.id)):[];return I.length?n`<span style="display: flex; align-items: center; justify-content: flex-end; gap: var(--lumo-space-s); overflow: hidden;">
                ${z?n`<span style="font-weight: 600;">${z}</span>`:d}
                ${I.map(T=>n`
                    <vaadin-button theme="tertiary small" style="flex-shrink: 0;"
                        @click="${O=>{O.stopPropagation(),O.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+(T.actionId??T.id),parameters:{_groupValue:e.__mateuGroup.value}},bubbles:!0,composed:!0}))}}">${T.label??T.caption??""}</vaadin-button>
                `)}
            </span>`:n`<span title="${z}" style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${z}</span>`}if(i.editable)return jg(e,i,r,o);if(p=="status")return Pm(e,t,a);if(f=="primary")return Eg(e,i,a);if(p=="bool")return Ig(e,t,a);if(p=="money"||f=="money")return Tg(e,t,a,p,f);if(p=="link"||f=="link")return Pg(e,t,a,p,f,i);if(p=="icon"||f=="icon")return Og(e,t,a,p);if(f=="html")return zg(e,t,a);if(f=="image")return Rg(e,t,a,p,f,i);if(p=="menu")return wo(e,t,a);if(p=="component")return Ng(e,t,a,r,s,o,l,c,u);if(p=="action")return Dg(e,t,a);if(p=="actionGroup")return wo(e,t,a);if(f=="button"||i.actionId)return Mg(e,t,a,p,f,i);const m=e[a.path],b=r?.metadata?.rowRoute;if(i.identifier&&b){const $=Ko(b,e,o,l);if($){const y="/"+$.replace(/^\/+/,"");return n`<a href="${y}" title="${m}"
                @click="${E=>{E.defaultPrevented||E.metaKey||E.ctrlKey||E.shiftKey||E.button!==0||(E.preventDefault(),Et(r,$))}}"
                style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; color: var(--lumo-primary-text-color); text-decoration: none; cursor: pointer;"
                @mouseover="${E=>{E.currentTarget.style.textDecoration="underline"}}"
                @mouseout="${E=>{E.currentTarget.style.textDecoration="none"}}"
            >${Ya(m)}</a>`}}return n`<span title="${m}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${Ya(m)}</span>`};function wl(e){return n`
        <vaadin-grid-column
                width="2.25rem"
                flex-grow="0"
                ${tt((t,{detailsOpened:a})=>e?.(t)?d:n`
                    <vaadin-icon
                            icon="${a?"lumo:angle-down":"lumo:angle-right"}"
                            aria-hidden="true"
                            style="color: var(--lumo-secondary-text-color); width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"
                    ></vaadin-icon>`,[])}
        ></vaadin-grid-column>`}var Hg=Object.defineProperty,Vg=Object.getOwnPropertyDescriptor,jt=(e,t,a,i)=>{for(var r=i>1?void 0:i?Vg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Hg(t,a,r),r};const Gg=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},Kg=(e,t)=>{let a=t;for(;a;){if(a===e)return!0;a=a.assignedSlot??a.parentNode??a.host??null}return!1};let ot=class extends ir{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{const t=e.currentTarget,a=t.getEventContext(e)?.item??null;a!==this.hoveredItem&&(this.hoveredItem=a,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?"hovered-cell":"",this._onRowKey=e=>{const t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!mn(t,e))return;const a=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!a)return;const i=this.currentItems(),r=parseInt(a[1],10)-1;r>=i.length||(e.preventDefault(),this.selectRow(i[r]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+"_selected_items"]=[e],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;const e=Gg();if(e&&e!==document.body&&!Kg(this,e)){const t=e.tagName?.toLowerCase()??"";if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith("vaadin-")&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){const{item:t,selected:a,shiftKey:i}=e.detail;if(this.rangeStartItem??=t,i){let r=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(r=this.state[this.field.fieldId]);const[s,o]=[this.rangeStartItem,t].map(u=>r.indexOf(u)).sort((u,p)=>u-p),l=r.slice(s,o+1),c=new Set(this.selectedItems);l.forEach(u=>{a?c.add(u):c.delete(u)}),this.selectedItems=[...c],this.state[this.id+"_selected_items"]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);const t=this.state[this.field?.fieldId+"_show_detail"]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates,i="";this.data[this.id]&&(this.data[this.id].searchSignature||i)&&this.data[this.id].searchSignature!=i&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:i,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((a,i)=>{a&&typeof a=="object"&&a._rowNumber===void 0&&(a._rowNumber=i)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith("modal")){const a=this;return n`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{a.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.field?.fieldId+"_cancel"},bubbles:!0,composed:!0}))}}"
                        ${Co(()=>n`
                            <mateu-event-interceptor .target="${a}">
                                <div id="container" style="${this.field?.formStyle??"display: contents;"}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>Te()])}
                ></vaadin-dialog>
                
            `}else{const a=this.field?.formPosition,i=a==="left"||a==="right";return n`
            <div style="display: flex; flex-direction: ${i?"row":"column"}; gap: var(--lumo-space-m, 1rem); width: 100%; ${t&&this.field?.minHeightWhenDetailVisible?"min-height: "+this.field?.minHeightWhenDetailVisible+";":""}">
                <div style="${i?"flex: 1; min-width: 0;":"width: 100%;"}${a==="left"?" order: 2;":""}">
                    ${this.renderMaster(e)}
                </div>
                <div style="${t?"":"display: none;"}${i?"flex: 1; min-width: 0;":"width: 100%;"}${a==="left"?" order: 1;":""}${this.field?.formStyle??""}">
                    <div id="container" style="padding: 0 2rem 2rem; background-color: var(--lumo-base-color);">
                        <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                    </div>
                </div>
            </div>`}}renderMaster(e){const t=this.selectedItems||[],a=$g(this.field?.readOnly,e?.length??0),i=this.field?.readOnly?(this.field?.columns??[]).map(wg):this.field?.columns;return n`<vaadin-vertical-layout style="width: 100%;">
            <!-- The field label is rendered by the surrounding mateu-field wrapper; rendering it
                 here too would duplicate it (e.g. "Guests / Guests"). -->
            <vaadin-grid
                    ?clickable="${!!this.field?.onItemSelectionActionId}"
                    .cellPartNameGenerator="${R(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${R(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${R(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?"cursor: pointer;":""}${this.field?.style??""}"
                    class="${this.field?.cssClasses}"
                    theme="${R(a.theme)}"
                    .items="${e}"
                    .selectedItems="${t}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${r=>{this.selectedItems=r.detail.value,this.state[this.id+"_selected_items"]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${R(this.field?.onItemSelectionActionId?r=>{if(r.composedPath().some(l=>l instanceof HTMLElement&&(l.localName==="vaadin-button"||l.localName==="button"||l.localName==="a"||l.localName==="vaadin-checkbox"||l.getAttribute?.("role")==="button")))return;const o=r.currentTarget.getEventContext(r)?.item;o&&this.selectRow(o)}:void 0)}"
                    @active-item-changed="${R(this.field?.detailPath&&!this.field?.useButtonForDetail?r=>{if(this.field?.detailPath){const s=r.detail.value;s?this.detailsOpenedItems=[s]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${R(this.field?.detailPath?So(r=>n`${w(this,r[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${a.allRowsVisible}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:"No items added yet."}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?d:n`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.detailPath&&!this.field?.useButtonForDetail?wl():d}
                ${i?.map(r=>Ps(r,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?n`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${tt(r=>n`
                                <vaadin-button theme="tertiary icon error" title="Remove row"
                                    @click="${()=>{this.state[this.id+"_selected_items"]=[r],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_remove"},bubbles:!0,composed:!0}))}}">
                                    <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                </vaadin-button>`,[])}
                    ></vaadin-grid-column>
                `:d}

                ${this.field?.useButtonForDetail?n`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${tt((r,{detailsOpened:s})=>n`
              <vaadin-button
                theme="tertiary icon"
                title="${s?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${s?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=this.detailsOpenedItems.length?this.detailsOpenedItems[0]._rowNumber==r._rowNumber?[]:[r]:[r]}}"
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
        </vaadin-vertical-layout>`}};ot.styles=x`
        ${Lt}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `;jt([h()],ot.prototype,"field",2);jt([h()],ot.prototype,"state",2);jt([h()],ot.prototype,"data",2);jt([h()],ot.prototype,"appState",2);jt([h()],ot.prototype,"appData",2);jt([h()],ot.prototype,"selectedItems",2);jt([g()],ot.prototype,"detailsOpenedItems",2);ot=jt([k("mateu-grid")],ot);var Yg=Object.defineProperty,Xg=Object.getOwnPropertyDescriptor,Ba=(e,t,a,i)=>{for(var r=i>1?void 0:i?Xg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Yg(t,a,r),r};let At=class extends _{constructor(){super(...arguments),this.getNewValue=e=>{if(this.field?.dataType=="array"){if(!this.value)return[e];const t=this.value;return t.indexOf(e)>=0?t.filter(a=>a!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){const a=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:a.action,parameters:{searchText:"",fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}const t=this.field?.attributes?.divStyle;return n`
        <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; ${t}">
                                    ${e?.map(a=>n`
                            <div role="button" tabindex="0" 
                                    class="choice ${this.value==a.value||Array.isArray(this.value)&&this.value.includes(a.value)?"selected":""}"
                                    @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.getNewValue(a.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}" @keydown="${X(()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.getNewValue(a.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))}"
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

       `}};At.styles=x`
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
  
        ${ae}
    `;Ba([h()],At.prototype,"field",2);Ba([h()],At.prototype,"baseUrl",2);Ba([h()],At.prototype,"state",2);Ba([h()],At.prototype,"data",2);Ba([h()],At.prototype,"value",2);At=Ba([k("mateu-choice")],At);var Jg=Object.defineProperty,Qg=Object.getOwnPropertyDescriptor,ut=(e,t,a,i)=>{for(var r=i>1?void 0:i?Qg(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Jg(t,a,r),r};let pe=class extends _{constructor(){super(...arguments),this.commit=e=>{this.value=e,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...e},fieldId:this.fieldId}}))},this.currencyChanged=e=>{const t=this.value??pe.EMPTY;!e.detail.value||e.detail.value===t.currency||this.commit({...t,currency:e.detail.value})},this.valueChanged=e=>{const t=this.value??pe.EMPTY,a=Ts(e.detail.value,!1)??0;a!==t.value&&this.commit({...t,value:a})}}render(){return n`
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
       `}};pe.EMPTY={value:0,currency:"EUR",locale:"es-ES"};pe.styles=x`
  `;ut([h()],pe.prototype,"fieldId",2);ut([h()],pe.prototype,"label",2);ut([h()],pe.prototype,"state",2);ut([h()],pe.prototype,"data",2);ut([h()],pe.prototype,"value",2);ut([h()],pe.prototype,"autoFocus",2);ut([h()],pe.prototype,"required",2);ut([h()],pe.prototype,"colspan",2);ut([h()],pe.prototype,"helperText",2);pe=ut([k("mateu-money-field")],pe);const ko=["vaadin:abacus","vaadin:absolute-position","vaadin:academy-cap","vaadin:accessibility","vaadin:accordion-menu","vaadin:add-dock","vaadin:adjust","vaadin:adobe-flash","vaadin:airplane","vaadin:alarm","vaadin:align-center","vaadin:align-justify","vaadin:align-left","vaadin:align-right","vaadin:alt-a","vaadin:alt","vaadin:ambulance","vaadin:anchor","vaadin:angle-double-down","vaadin:angle-double-left","vaadin:angle-double-right","vaadin:angle-double-up","vaadin:angle-down","vaadin:angle-left","vaadin:angle-right","vaadin:angle-up","vaadin:archive","vaadin:archives","vaadin:area-select","vaadin:arrow-backward","vaadin:arrow-circle-down-o","vaadin:arrow-circle-down","vaadin:arrow-circle-left-o","vaadin:arrow-circle-left","vaadin:arrow-circle-right-o","vaadin:arrow-circle-right","vaadin:arrow-circle-up-o","vaadin:arrow-circle-up","vaadin:arrow-down","vaadin:arrow-forward","vaadin:arrow-left","vaadin:arrow-long-down","vaadin:arrow-long-left","vaadin:arrow-right","vaadin:arrow-up","vaadin:arrows-cross","vaadin:arrows-long-h","vaadin:arrows-long-right","vaadin:arrows-long-up","vaadin:arrows-long-v","vaadin:arrows","vaadin:asterisk","vaadin:at","vaadin:automation","vaadin:backspace-a","vaadin:backspace","vaadin:backwards","vaadin:ban","vaadin:bar-chart-h","vaadin:bar-chart-v","vaadin:bar-chart","vaadin:barcode","vaadin:bed","vaadin:bell-o","vaadin:bell-slash-o","vaadin:bell-slash","vaadin:bell","vaadin:boat","vaadin:bold","vaadin:bolt","vaadin:bomb","vaadin:book-dollar","vaadin:book-percent","vaadin:book","vaadin:bookmark-o","vaadin:bookmark","vaadin:briefcase","vaadin:browser","vaadin:bug-o","vaadin:bug","vaadin:building-o","vaadin:building","vaadin:bullets","vaadin:bullseye","vaadin:bus","vaadin:buss","vaadin:button","vaadin:calc-book","vaadin:calc","vaadin:calendar-briefcase","vaadin:calendar-clock","vaadin:calendar-envelope","vaadin:calendar-o","vaadin:calendar-user","vaadin:calendar","vaadin:camera","vaadin:car","vaadin:caret-down","vaadin:caret-left","vaadin:caret-right","vaadin:caret-square-down-o","vaadin:caret-square-left-o","vaadin:caret-square-right-o","vaadin:caret-square-up-o","vaadin:caret-up","vaadin:cart-o","vaadin:cart","vaadin:cash","vaadin:chart-3d","vaadin:chart-grid","vaadin:chart-line","vaadin:chart-timeline","vaadin:chart","vaadin:chat","vaadin:check-circle-o","vaadin:check-circle","vaadin:check-square-o","vaadin:check-square","vaadin:check","vaadin:chevron-circle-down-o","vaadin:chevron-circle-down","vaadin:chevron-circle-left-o","vaadin:chevron-circle-left","vaadin:chevron-circle-right-o","vaadin:chevron-circle-right","vaadin:chevron-circle-up-o","vaadin:chevron-circle-up","vaadin:chevron-down-small","vaadin:chevron-down","vaadin:chevron-left-small","vaadin:chevron-left","vaadin:chevron-right-small","vaadin:chevron-right","vaadin:chevron-up-small","vaadin:chevron-up","vaadin:child","vaadin:circle-thin","vaadin:circle","vaadin:clipboard-check","vaadin:clipboard-cross","vaadin:clipboard-heart","vaadin:clipboard-pulse","vaadin:clipboard-text","vaadin:clipboard-user","vaadin:clipboard","vaadin:clock","vaadin:close-big","vaadin:close-circle-o","vaadin:close-circle","vaadin:close-small","vaadin:close","vaadin:cloud-download-o","vaadin:cloud-download","vaadin:cloud-o","vaadin:cloud-upload-o","vaadin:cloud-upload","vaadin:cloud","vaadin:cluster","vaadin:code","vaadin:coffee","vaadin:cog-o","vaadin:cog","vaadin:cogs","vaadin:coin-piles","vaadin:coins","vaadin:combobox","vaadin:comment-ellipsis-o","vaadin:comment-ellipsis","vaadin:comment-o","vaadin:comment","vaadin:comments-o","vaadin:comments","vaadin:compile","vaadin:compress-square","vaadin:compress","vaadin:connect-o","vaadin:connect","vaadin:controller","vaadin:copy-o","vaadin:copy","vaadin:copyright","vaadin:corner-lower-left","vaadin:corner-lower-right","vaadin:corner-upper-left","vaadin:corner-upper-right","vaadin:credit-card","vaadin:crop","vaadin:cross-cutlery","vaadin:crosshairs","vaadin:css","vaadin:ctrl-a","vaadin:ctrl","vaadin:cube","vaadin:cubes","vaadin:curly-brackets","vaadin:cursor-o","vaadin:cursor","vaadin:cutlery","vaadin:dashboard","vaadin:database","vaadin:date-input","vaadin:deindent","vaadin:del-a","vaadin:del","vaadin:dental-chair","vaadin:desktop","vaadin:diamond-o","vaadin:diamond","vaadin:diploma-scroll","vaadin:diploma","vaadin:disc","vaadin:doctor-briefcase","vaadin:doctor","vaadin:dollar","vaadin:dot-circle","vaadin:download-alt","vaadin:download","vaadin:drop","vaadin:edit","vaadin:eject","vaadin:elastic","vaadin:ellipsis-circle-o","vaadin:ellipsis-circle","vaadin:ellipsis-dots-h","vaadin:ellipsis-dots-v","vaadin:ellipsis-h","vaadin:ellipsis-v","vaadin:enter-arrow","vaadin:enter","vaadin:envelope-o","vaadin:envelope-open-o","vaadin:envelope-open","vaadin:envelope","vaadin:envelopes-o","vaadin:envelopes","vaadin:eraser","vaadin:esc-a","vaadin:esc","vaadin:euro","vaadin:exchange","vaadin:exclamation-circle-o","vaadin:exclamation-circle","vaadin:exclamation","vaadin:exit-o","vaadin:exit","vaadin:expand-full","vaadin:expand-square","vaadin:expand","vaadin:external-browser","vaadin:external-link","vaadin:eye-slash","vaadin:eye","vaadin:eyedropper","vaadin:facebook-square","vaadin:facebook","vaadin:factory","vaadin:family","vaadin:fast-backward","vaadin:fast-forward","vaadin:female","vaadin:file-add","vaadin:file-code","vaadin:file-font","vaadin:file-movie","vaadin:file-o","vaadin:file-picture","vaadin:file-presentation","vaadin:file-process","vaadin:file-refresh","vaadin:file-remove","vaadin:file-search","vaadin:file-sound","vaadin:file-start","vaadin:file-table","vaadin:file-text-o","vaadin:file-text","vaadin:file-tree-small","vaadin:file-tree-sub","vaadin:file-tree","vaadin:file-zip","vaadin:file","vaadin:fill","vaadin:film","vaadin:filter","vaadin:fire","vaadin:flag-checkered","vaadin:flag-o","vaadin:flag","vaadin:flash","vaadin:flask","vaadin:flight-landing","vaadin:flight-takeoff","vaadin:flip-h","vaadin:flip-v","vaadin:folder-add","vaadin:folder-o","vaadin:folder-open-o","vaadin:folder-open","vaadin:folder-remove","vaadin:folder-search","vaadin:folder","vaadin:font","vaadin:form","vaadin:forward","vaadin:frown-o","vaadin:funcion","vaadin:function","vaadin:funnel","vaadin:gamepad","vaadin:gavel","vaadin:gift","vaadin:glass","vaadin:glasses","vaadin:globe-wire","vaadin:globe","vaadin:golf","vaadin:google-plus-square","vaadin:google-plus","vaadin:grab","vaadin:grid-bevel","vaadin:grid-big-o","vaadin:grid-big","vaadin:grid-h","vaadin:grid-small-o","vaadin:grid-small","vaadin:grid-v","vaadin:grid","vaadin:group","vaadin:hammer","vaadin:hand","vaadin:handle-corner","vaadin:hands-up","vaadin:handshake","vaadin:harddrive-o","vaadin:harddrive","vaadin:hash","vaadin:header","vaadin:headphones","vaadin:headset","vaadin:health-card","vaadin:heart-o","vaadin:heart","vaadin:home-o","vaadin:home","vaadin:hospital","vaadin:hourglass-empty","vaadin:hourglass-end","vaadin:hourglass-start","vaadin:hourglass","vaadin:inbox","vaadin:indent","vaadin:info-circle-o","vaadin:info-circle","vaadin:info","vaadin:input","vaadin:insert","vaadin:institution","vaadin:invoice","vaadin:italic","vaadin:key-o","vaadin:key","vaadin:keyboard-o","vaadin:keyboard","vaadin:laptop","vaadin:layout","vaadin:level-down-bold","vaadin:level-down","vaadin:level-left-bold","vaadin:level-left","vaadin:level-right-bold","vaadin:level-right","vaadin:level-up-bold","vaadin:level-up","vaadin:lifebuoy","vaadin:lightbulb","vaadin:line-bar-chart","vaadin:line-chart","vaadin:line-h","vaadin:line-v","vaadin:lines-list","vaadin:lines","vaadin:link","vaadin:list-ol","vaadin:list-select","vaadin:list-ul","vaadin:list","vaadin:location-arrow-circle-o","vaadin:location-arrow-circle","vaadin:location-arrow","vaadin:lock","vaadin:magic","vaadin:magnet","vaadin:mailbox","vaadin:male","vaadin:map-marker","vaadin:margin-bottom","vaadin:margin-left","vaadin:margin-right","vaadin:margin-top","vaadin:margin","vaadin:medal","vaadin:megafone","vaadin:megaphone","vaadin:meh-o","vaadin:menu","vaadin:microphone","vaadin:minus-circle-o","vaadin:minus-circle","vaadin:minus-square-o","vaadin:minus","vaadin:mobile-browser","vaadin:mobile-retro","vaadin:mobile","vaadin:modal-list","vaadin:modal","vaadin:money-deposit","vaadin:money-exchange","vaadin:money-withdraw","vaadin:money","vaadin:moon-o","vaadin:moon","vaadin:morning","vaadin:movie","vaadin:music","vaadin:mute","vaadin:native-button","vaadin:newspaper","vaadin:notebook","vaadin:nurse","vaadin:office","vaadin:open-book","vaadin:option-a","vaadin:option","vaadin:options","vaadin:orientation","vaadin:out","vaadin:outbox","vaadin:package","vaadin:padding-bottom","vaadin:padding-left","vaadin:padding-right","vaadin:padding-top","vaadin:padding","vaadin:paint-roll","vaadin:paintbrush","vaadin:palete","vaadin:palette","vaadin:panel","vaadin:paperclip","vaadin:paperplane-o","vaadin:paperplane","vaadin:paragraph","vaadin:password","vaadin:paste","vaadin:pause","vaadin:pencil","vaadin:phone-landline","vaadin:phone","vaadin:picture","vaadin:pie-bar-chart","vaadin:pie-chart","vaadin:piggy-bank-coin","vaadin:piggy-bank","vaadin:pill","vaadin:pills","vaadin:pin-post","vaadin:pin","vaadin:play-circle-o","vaadin:play-circle","vaadin:play","vaadin:plug","vaadin:plus-circle-o","vaadin:plus-circle","vaadin:plus-minus","vaadin:plus-square-o","vaadin:plus","vaadin:pointer","vaadin:power-off","vaadin:presentation","vaadin:print","vaadin:progressbar","vaadin:puzzle-piece","vaadin:pyramid-chart","vaadin:qrcode","vaadin:question-circle-o","vaadin:question-circle","vaadin:question","vaadin:quote-left","vaadin:quote-right","vaadin:random","vaadin:raster-lower-left","vaadin:raster","vaadin:records","vaadin:recycle","vaadin:refresh","vaadin:reply-all","vaadin:reply","vaadin:resize-h","vaadin:resize-v","vaadin:retweet","vaadin:rhombus","vaadin:road-branch","vaadin:road-branches","vaadin:road-split","vaadin:road","vaadin:rocket","vaadin:rotate-left","vaadin:rotate-right","vaadin:rss-square","vaadin:rss","vaadin:safe-lock","vaadin:safe","vaadin:scale-unbalance","vaadin:scale","vaadin:scatter-chart","vaadin:scissors","vaadin:screwdriver","vaadin:search-minus","vaadin:search-plus","vaadin:search","vaadin:select","vaadin:server","vaadin:share-square","vaadin:share","vaadin:shield","vaadin:shift-arrow","vaadin:shift","vaadin:shop","vaadin:sign-in-alt","vaadin:sign-in","vaadin:sign-out-alt","vaadin:sign-out","vaadin:signal","vaadin:sitemap","vaadin:slider","vaadin:sliders","vaadin:smiley-o","vaadin:sort","vaadin:sound-disable","vaadin:spark-line","vaadin:specialist","vaadin:spinner-arc","vaadin:spinner-third","vaadin:spinner","vaadin:spline-area-chart","vaadin:spline-chart","vaadin:split-h","vaadin:split-v","vaadin:split","vaadin:spoon","vaadin:square-shadow","vaadin:star-half-left-o","vaadin:star-half-left","vaadin:star-half-right-o","vaadin:star-half-right","vaadin:star-o","vaadin:star","vaadin:start-cog","vaadin:step-backward","vaadin:step-forward","vaadin:stethoscope","vaadin:stock","vaadin:stop-cog","vaadin:stop","vaadin:stopwatch","vaadin:storage","vaadin:strikethrough","vaadin:subscript","vaadin:suitcase","vaadin:sun-down","vaadin:sun-o","vaadin:sun-rise","vaadin:superscript","vaadin:sword","vaadin:tab-a","vaadin:tab","vaadin:table","vaadin:tablet","vaadin:tabs","vaadin:tag","vaadin:tags","vaadin:tasks","vaadin:taxi","vaadin:teeth","vaadin:terminal","vaadin:text-height","vaadin:text-input","vaadin:text-label","vaadin:text-width","vaadin:thin-square","vaadin:thumbs-down-o","vaadin:thumbs-down","vaadin:thumbs-up-o","vaadin:thumbs-up","vaadin:ticket","vaadin:time-backward","vaadin:time-forward","vaadin:timer","vaadin:toolbox","vaadin:tools","vaadin:tooth","vaadin:touch","vaadin:train","vaadin:trash","vaadin:tree-table","vaadin:trendind-down","vaadin:trending-down","vaadin:trending-up","vaadin:trophy","vaadin:truck","vaadin:twin-col-select","vaadin:twitter-square","vaadin:twitter","vaadin:umbrella","vaadin:underline","vaadin:unlink","vaadin:unlock","vaadin:upload-alt","vaadin:upload","vaadin:user-card","vaadin:user-check","vaadin:user-clock","vaadin:user-heart","vaadin:user-star","vaadin:user","vaadin:users","vaadin:vaadin-h","vaadin:vaadin-v","vaadin:viewport","vaadin:vimeo-square","vaadin:vimeo","vaadin:volume-down","vaadin:volume-off","vaadin:volume-up","vaadin:volume","vaadin:wallet","vaadin:warning","vaadin:workplace","vaadin:wrench","vaadin:youtube-square","vaadin:youtube"];var Zg=Object.defineProperty,e0=Object.getOwnPropertyDescriptor,ne=(e,t,a,i)=>{for(var r=i>1?void 0:i?e0(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&Zg(t,a,r),r};let Or=null;const t0=()=>(Or||(Or=Promise.all([ke(()=>import("./vendor-ui5.js").then(e=>e.C),__vite__mapDeps([2,3,4,1])),ke(()=>import("./vendor-ui5.js").then(e=>e.R),__vite__mapDeps([2,3,4,1]))])),Or);let te=class extends _{constructor(){super(...arguments),this.inFoldout=!1,this.ui5FieldComponentsReady=!1,this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter="",this.rendered=!1,this.renderColorPicker=()=>{this.loadUi5FieldComponents();const e=this.field?.fieldId,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue;return n`
            <ui5-color-picker value="${t}" @change="${a=>this.colorPickerValue=a.target.value}">Picker</ui5-color-picker>
        `},this.saveColor=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.colorPickerValue,fieldId:this.field.fieldId},bubbles:!0,composed:!0})),this.colorPickerOpened=!1},this.renderColorPickerFooter=()=>n`<vaadin-button @click="${()=>this.colorPickerOpened=!1}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`,this.checked=e=>{const t=e.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))},this.convert=e=>this.field?.dataType=="integer"?Ts(e,!0):e,this.multiComboBoxValueChanged=e=>{if(this.rendered){const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let i;e.detail.value&&(i=e.detail.value.map(r=>r.value),i&&i.length>0&&(this.data[this.id]||(this.data[this.id]={}),this.data[this.id].content||(this.data[this.id].content=[]),this.data[this.id]&&this.data[this.id].content&&e.detail.value.forEach(r=>{this.data[this.id].content?.find(s=>r.value==s.value)||this.data[this.id].content.push(r)}))),this.compareArrays(i,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.valueChanged=e=>{this.rendered&&e.detail.value!==void 0&&!lg(e.detail.value,this.state[this.field.fieldId])&&this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.convert(e.detail.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.selectedItems=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.comboData&&this.comboData.length>0)return this.comboData?.filter(t=>e.indexOf(t.value)>=0);if(this.data[this.id]&&this.data[this.id].content&&this.data[this.id].content.length>0)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0)}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0);return[]},this.selectedIndex=e=>{if(e)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const t=this.data[this.id].content.find(a=>a.value==e);if(t)return this.data[this.id].content.indexOf(t)}}else{const t=this.field?.options?.find(a=>a.value==e);if(t)return this.field?.options?.indexOf(t)}},this.selectedIndexes=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content)return this.data[this.id].content.filter(a=>e.indexOf(a.value)>=0).map(a=>this.data[this.id].content.indexOf(a))}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0).map(t=>this.field?.options?.indexOf(t));return[]},this.compareArrays=(e,t)=>this.falsy(e)&&this.falsy(t)||e&&t&&e.length===t.length&&e.every((a,i)=>a===t[i]),this.falsy=e=>!e||e.length==0,this.listItemsSelected=e=>{const t=this.field?.fieldId,a=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let i;this.rendered&&(e.detail.value&&(this.field?.remoteCoordinates?this.data[this.id]&&this.data[this.id].content&&(i=e.detail.value.map(r=>this.data[this.id].content[r].value)):i=e.detail.value.map(r=>this.field.options[r].value)),this.compareArrays(i,a)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))},this.listItemSelected=e=>{let t;if(e.detail.value||e.detail.value==0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const a=this.data[this.id].content[e.detail.value];a&&(t=a.value)}}else{const a=this.field.options[e.detail.value];a&&(t=a.value)}this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.mapPosition=e=>{switch(e){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.helperShownInControl=!1,this.lastAnnouncedError="",this.controlOwnsValidity=!1,this.fileUploaded=e=>{const t=this.field?.fieldId??"",a=this.state[t];a.push({id:e.detail.xhr.responseText,name:e.detail.file.name}),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.fileChanged=e=>{const t=this.field?.fieldId??"",a=(e.detail.value??[]).filter(r=>r.id).map(r=>r.id),i=(this.state[t]??[]).map(r=>r.id);if(!this.compareArrays(i,a)){const r=(e.detail.value??[]).filter(s=>s.id).map(s=>({id:s.id,name:s.name}));this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.triggerImageUpload=()=>{this.renderRoot?.querySelector('input[type="file"]')?.click()},this.imageUpload=e=>{const t=e.target,a=t.files?.[0];if(!a)return;const i=new FileReader;i.onload=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i.result,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},i.readAsDataURL(a),t.value=""},this.imageDelete=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:"",fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.iconComboboxRenderer=e=>n`
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
`,this.filteredIcons=[],this.navLinkOffset=null,this.iconFilterChanged=e=>{this.filteredIcons=ko.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}connectedCallback(){super.connectedCallback(),this.inFoldout=yg(this,"mateu-vaadin-foldout")}loadUi5FieldComponents(){this.ui5FieldComponentsReady||t0().then(()=>{this.ui5FieldComponentsReady=!0})}remoteComboDataProvider(e){return(t,a)=>{const{filter:i,page:r,pageSize:s}=t,o=i??"";this._comboFilter=o,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{searchText:i,fieldId:this.field?.fieldId,size:s,page:r,sort:void 0},callback:l=>{if(o===this._comboFilter)if(l?.messages?.forEach(c=>{Ti.show(c.text,{position:c.position?this.mapPosition(c.position):void 0,theme:c.variant,duration:c.duration})}),!l.fragments||l.fragments.length==0)this.comboData=[],a([],0);else{const c=l.fragments[0].data?.[this.id];this.comboData=c?.content,a(c?.content,c?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}renderNavLink(){const e=this.field?.link;if(!e?.href)return d;const t=U(e.href,this.state,this.data)??e.href,a=U(e.title,this.state,this.data)||t,i=e.icon||(t.startsWith("http")?"vaadin:external-link":"vaadin:link"),r=this.navLinkOffset??"calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)";return n`<a
                data-navlink
                href="${t}"
                title="${a}"
                target="${R(e.target||void 0)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${r};"
        ><vaadin-icon icon="${i}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`}positionNavLink(){const e=this.renderRoot?.querySelector("a[data-navlink]");e&&setTimeout(()=>{const t=e.parentElement,a=t?.firstElementChild?.firstElementChild;if(!t||!a)return;const r=(a.shadowRoot?.querySelector('[part="input-field"]')??a).getBoundingClientRect();if(r.height===0)return;const s=Math.max(0,r.top+r.height/2-e.offsetHeight/2-t.getBoundingClientRect().top),o=`${Math.round(s)}px`;this.navLinkOffset!==o&&(this.navLinkOffset=o)})}helperText(){return this.helperShownInControl=!0,Ie(this.field?.description??"",this.state,this.data)??""}fieldErrors(){const e=this.field?.fieldId??"",t=this.data?.errors?.[e];return Array.isArray(t)?t.filter(a=>!!a):[]}validatableControl(){const e=this.renderRoot.querySelectorAll("*");for(const t of e)if("invalid"in t&&"errorMessage"in t)return t;return null}applyValidationState(){const e=this.fieldErrors(),t=this.validatableControl();if(!t){this.lastAnnouncedError=e.join(". ");return}const a=e.join(". ");if(t.errorMessage=a,t.invalid=e.length>0,a&&a!==this.lastAnnouncedError){const i=(this.field?.label??"").toString().trim();os(i?`${i}: ${a}`:a,{politeness:"assertive"})}this.lastAnnouncedError=a}render(){this.rendered=!0;const e=this.renderNavLink();this.helperShownInControl=!1;const t=this.renderField(),a=this.field?.description&&!this.helperShownInControl?Ie(this.field.description,this.state,this.data):void 0,i=this.fieldErrors(),r=i.length>0&&!this.controlOwnsValidity;return n`<div style="display: block;">
            <div style="${e!==d?"display: flex; gap: var(--lumo-space-xs);":""}"><div style="flex: 1; min-width: 0;">${t}</div>${e}</div>
            ${a?n`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${a}</div>
            `:d}
            ${r?n`
                <div role="alert"><ul>${i.map(s=>n`<li>${s}</li>`)}</ul></div>
            `:d}
        </div>`}async firstUpdated(){this.filteredIcons=ko}update(e){e.has("component")&&(this.rendered=!1),super.update(e)}updated(e){super.updated(e),this.positionNavLink(),this.applyValidationState(),this.controlOwnsValidity=!!this.validatableControl()}renderField(){const e=this.field?.fieldId??"",t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,a=this.field?.label+"",i=U(a,this.state,this.data),r=this.labelAlreadyRendered||!i||i=="null"?d:i;return this.field?.propertyRow?this.renderPropertyRowField(e,t,r,i):this.field?.stereotype=="badge"?this.renderBadgeField(e,t,r,i):this.field?.stereotype=="plainText"?this.renderPlainTextField(e,t,r,i):this.field?.stereotype=="bulletedList"?this.renderBulletedListField(e,t,r,i):dg(this.field)?this.renderSearchableMultiField(e,t,r):gg(this.field,this.inFoldout)?this.renderFoldoutReadOnlyField(t,r):this.field?.readOnly&&this.field.stereotype!="grid"&&this.field.dataType!="status"&&this.field?.dataType!="money"?this.renderReadOnlyField(e,t,r,i):this.field?.dataType=="file"?this.renderFileField(e,t,r,i):this.field?.dataType=="string"?this.renderStringField(e,t,r,i):this.field?.dataType=="number"?this.renderNumberField(e,t,r,i):this.field?.dataType=="integer"?this.renderIntegerField(e,t,r,i):this.field?.dataType=="bool"||this.field?.dataType=="boolean"?this.renderBoolField(e,t,r,i):this.field?.dataType=="dateRange"?this.renderDateRangeField(e,t,r,i):this.field?.dataType=="date"?this.renderDateField(e,t,r,i):this.field?.dataType=="dateTime"?this.renderDateTimeField(e,t,r,i):this.field?.dataType=="time"?this.renderTimeField(e,t,r,i):this.field?.dataType=="array"?this.renderArrayField(e,t,r,i):this.field?.dataType=="money"?this.renderMoneyField(e,t,r,i):this.field?.dataType=="status"?this.renderStatusField(e,t,r,i):this.field?.dataType=="range"?this.renderRangeField(e,t,r,i):n`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,a,i){if(!this.field)return n``;const r=t===!0||t==="true";return n`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${r?"success":""} pill" style="${r?"":"opacity: 0.4;"}">${i}</span>
            </vaadin-custom-field>`}renderPropertyRowField(e,t,a,i){if(!this.field)return n``;let r=Ie(t,this.state,this.data);const s=this.data??{},o=y=>s[y]!==void 0&&s[y]!==null&&typeof s[y]!="object"?s[y]:void 0;(r==null||r==="")&&o(this.field.fieldId)!==void 0&&(r=o(this.field.fieldId));const l=o(this.field.fieldId+"-label");l!==void 0&&l!==""&&(r=l);const c=r&&typeof r=="object"&&"value"in r?r:null;r&&r.value&&(r=r.value);const u=this.field?.dataType=="bool"||r===!0||r===!1,p=this.field?.dataType=="money",f=r!=null&&r!=="";let m=f?String(r):"—";if(p&&f){const y=typeof r=="number"?r:parseFloat(String(r));isNaN(y)||(m=c&&c.locale&&c.currency?new Intl.NumberFormat(c.locale,{style:"currency",currency:c.currency}).format(y):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(y))}const b=u?n`<vaadin-icon icon="${r===!0||r==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:n`<span style="font-weight: 500; text-align: right; word-break: break-word; margin-left: auto;${p?" font-variant-numeric: tabular-nums;":""}">${m}</span>`,$=i&&i!="null";return n`<div
                    id="${this.field.fieldId}"
                    data-colspan="${this.field?.colspan}"
                    style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; width: 100%; padding: 0.4rem 0; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); font-size: var(--lumo-font-size-s, .875rem); ${this.field?.style}"
            >${$?n`<span style="color: var(--lumo-secondary-text-color, #888); white-space: nowrap;">${i}</span>`:d}${b}</div>`}renderBulletedListField(e,t,a,i){if(!this.field)return n``;const r=Ie(t,this.state,this.data),s=Array.isArray(r)?r.map(o=>String(o)):r!=null&&r!==""?[String(r)]:[];return n`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><mateu-bulleted-list .items="${s}"></mateu-bulleted-list>
            </vaadin-custom-field>`}renderPlainTextField(e,t,a,i){if(!this.field)return n``;let r=Ie(t,this.state,this.data);const s=r&&typeof r=="object"&&"value"in r?r:null;r&&r.value&&(r=r.value);const o=this.field?.dataType=="bool"||r===!0||r===!1,l=this.field?.dataType=="money",c=r!=null&&r!=="";let u=c?String(r):"—";if(l&&c){const f=typeof r=="number"?r:parseFloat(String(r));isNaN(f)||(u=s&&s.locale&&s.currency?new Intl.NumberFormat(s.locale,{style:"currency",currency:s.currency}).format(f):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(f))}const p=o?n`<vaadin-icon icon="${r===!0||r==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?n`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${u}</span>`:n`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${l?" font-variant-numeric: tabular-nums;":""}">${u}</span>`;return n`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${a}"
                    data-colspan="${this.field?.colspan}"
                    style="${l?"text-align: right; ":""}${this.field?.style}"
            >${p}</vaadin-custom-field>`}renderFoldoutReadOnlyField(e,t){if(!this.field)return n``;let a=Ie(e,this.state,this.data);const i=this.data??{},r=c=>i[c]!==void 0&&i[c]!==null&&typeof i[c]!="object"?i[c]:void 0;(a==null||a==="")&&r(this.field.fieldId)!==void 0&&(a=r(this.field.fieldId));const s=r(this.field.fieldId+"-label");s!==void 0&&s!==""&&(a=s),a&&typeof a=="object"&&"value"in a&&(a=a.value);const o=this.field.options?.find?.(c=>c&&c.value==a);o&&o.label!=null&&(s===void 0||s==="")&&(a=o.label);const l=a!=null&&a!==""?String(a):"—";return n`<vaadin-custom-field
                id="${this.field.fieldId}"
                class="mateu-readonly-text"
                label="${t}"
                data-colspan="${this.field?.colspan}"
                style="padding-top: 0; padding-bottom: 0; ${this.field?.style??""}"
        ><span style="display: block; line-height: 1.4; font-weight: 500; white-space: pre-wrap; word-break: break-word; color: var(--lumo-body-text-color);">${l}</span></vaadin-custom-field>`}renderReadOnlyField(e,t,a,i){if(!this.field)return n``;let r=Ie(t,this.state,this.data)||this.data[e];if(r&&r.value&&(r=r.value),this.field.stereotype=="fileUpload")return n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><mateu-file-upload .fieldId="${this.field.fieldId}" .value="${r}" .editable="${!1}"></mateu-file-upload>
                </vaadin-custom-field>`;if(this.field.stereotype=="image"||this.field.stereotype=="uploadableImage"||this.field.stereotype=="signature"||this.field.stereotype=="camera")return n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><img src="${r}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`;if(this.field.dataType=="bool"||this.field.dataType=="boolean")return n`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${r?"vaadin:check":"vaadin:minus"}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`;const s=r!=null?String(r):"";return n`
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
`}copyValue(e){navigator.clipboard.writeText(e).then(()=>Ti.show("Copied",{position:"bottom-end",theme:"success",duration:2e3})).catch(()=>{})}renderSearchableMultiField(e,t,a){if(!this.field)return n``;const i=!!this.field.readOnly,r=cg(e),s=ug(this.state&&r in this.state?this.state[r]:t),o=hg(s,this.data?.[r+"-labels"]),l=this.data?.[r+"-label"],c=p=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:pg(s,p),fieldId:r},bubbles:!0,composed:!0}))},u=()=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"codesearch-"+r,parameters:{}},bubbles:!0,composed:!0}))};return n`
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
                        ${i?d:n`<vaadin-button
                                theme="icon tertiary-inline small"
                                aria-label="Remove ${p.label}"
                                title="Remove"
                                @click="${()=>c(p.id)}"
                        ><vaadin-icon icon="vaadin:close-small"></vaadin-icon></vaadin-button>`}
                    </span>`)}
                    ${i&&o.length==0&&l?n`<span>${l}</span>`:d}
                    ${i?d:n`<vaadin-button
                            theme="small tertiary"
                            class="searchable-add"
                            @click="${u}"
                    ><vaadin-icon icon="lumo:search" slot="prefix"></vaadin-icon>Add</vaadin-button>`}
                </div>
            </vaadin-custom-field>
        `}renderFileField(e,t,a,i){if(!this.field)return n``;const r=t?.map(s=>({id:s.id,name:s.name,type:"",uploadTarget:"",complete:!0}))??[];return n`
                <vaadin-custom-field
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    <vaadin-upload
                            target="/upload"
                            .files="${r}"
                            @upload-success="${this.fileUploaded}"
                            @files-changed="${this.fileChanged}"
                    ></vaadin-upload>
                </vaadin-custom-field>
            `}renderStringField(e,t,a,i){if(!this.field)return n``;if(this.field?.stereotype=="searchable"){const r=o=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"code-"+this.field?.fieldId,parameters:{code:o.currentTarget.value}},bubbles:!0,composed:!0}))},s=o=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"codesearch-"+this.field?.fieldId,parameters:{}},bubbles:!0,composed:!0}))};return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            required="${this.field.required||d}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-horizontal-layout theme="spacing" style="--lumo-space-m: 0.33rem;">
                            <vaadin-text-field style="width: 4rem;" @change="${r}" value="${t}"></vaadin-text-field>
                            <vaadin-text-field readonly="" value="${this.data[this.field.fieldId+"-label"]}"></vaadin-text-field>
                            <vaadin-button theme="icon" @click="${s}"><vaadin-icon icon="lumo:search"></vaadin-icon></vaadin-button>
                        </vaadin-horizontal-layout>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="select"){if(this.field?.optionsSource){const s=this.field.optionsSource,o=U(s.url,this.state,this.data)??s.url;this.data[this.id]?.sourceSignature!==o&&(this.data[this.id]={content:this.data[this.id]?.content??[],sourceSignature:o},s.proxy?this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"__restfetch__",parameters:{_sourceKind:"options",_sourceId:this.field.fieldId},callback:c=>{const u=c?.appData?._restfetch,p=on(u,s.itemsPath,s.valuePath,s.labelPath);this.data[this.id]={content:p,totalElements:p.length,sourceSignature:o},this.requestUpdate()},callbackonly:!0},bubbles:!0,composed:!0})):xc(s,c=>U(c,this.state,this.data)).then(c=>{this.data[this.id]={content:c,totalElements:c.length,sourceSignature:o},this.requestUpdate()}).catch(c=>console.warn("mateu: external options fetch failed",c)));let l=t;return t&&t.value&&(l=t.value),n`
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
                    `}let r=t;return t&&t.value&&(r=t.value),n`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${a}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${r}"
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
                `;if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const r=this.field.remoteCoordinates;let s;this.data[this.id]&&this.data[this.id].content&&(s=this.data[this.id].content.find(l=>l.value==t)),!s&&this.comboData&&(s=this.comboData.find(l=>l.value==t)),!s&&t&&(s={value:t,label:this.data[this.id+"-label"]??t});const o=this.remoteComboDataProvider(r.action);return n`
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
                            ${fr(this.comboRenderer,[])}
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
                            ${fr(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const r=this.field.remoteCoordinates,s="";return this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),n`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${R(this.selectedIndex(t))}"
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
                            selected="${R(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(r=>n`
                            <vaadin-item>${r.description||r.image||r.icon?n`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${r.icon?n`
                                        <vaadin-icon icon="${r.icon}"></vaadin-icon>
                                    `:d}
                                    ${r.image?n`
                                            <img src="${r.image}" alt="${r.label}" style="width: 2rem;" />
                                        `:d}
                                    <vaadin-vertical-layout>
                                        <span> ${r.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${r.description}
            </span>
                                    </vaadin-vertical-layout>
                                </vaadin-horizontal-layout>
                            `:r.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="radio"){if(this.field?.remoteCoordinates){const r=this.field.remoteCoordinates,s="";return this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),n`
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
                        ${this.field.options?.map(r=>n`
                            <vaadin-radio-button value="${r.value}" label="${r.label}">
                                ${r.description||r.image||r.icon?n`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${r.icon?n`
                                                <vaadin-icon icon="${r.icon}"></vaadin-icon>
                                            `:d}
                                            ${r.image?n`
                                                <img src="${r.image}" alt="${r.label}" style="height: 1rem;" />
                                            `:d}
                                            <span>${r.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${r.description?n`
                                            <div>${r.description}</div>
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
                            ${Eo(()=>n`
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
                    <vaadin-rich-text-editor
                            .maxlength="${this.field.charLimit}"
                            .value="${t}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                    ></vaadin-rich-text-editor>
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
                            ${fr(this.iconComboboxRenderer,[])}
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
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${ce(""+t)}</div></vaadin-custom-field>
                `;if(this.field?.stereotype=="image")return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><img
                            src="${t}"
                            style="${this.component?.style}" class="${this.component?.cssClasses}"></vaadin-custom-field>
                `;if(this.field?.stereotype=="treeSelect"){const r=this.helperText();return n`
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
                        ${r?n`<span class="tree-field__helper">${r}</span>`:d}
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
                `;if(this.field?.stereotype=="fileUpload"){const r=ng(this.field.attributes,"accept");return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-file-upload .fieldId="${this.field.fieldId}" .value="${t}" .accept="${r}"></mateu-file-upload>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="uploadableImage"){const r=t!=null&&t!=="";return n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-vertical-layout style="align-items: stretch; gap: var(--lumo-space-s); max-width: 320px;">
                            ${r?n`<img
                                    src="${t}"
                                    style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--lumo-contrast-20pct); border-radius: var(--lumo-border-radius-m); ${this.field.style??""}"
                                    class="${this.component?.cssClasses}">`:n`<div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--lumo-contrast-30pct); border-radius: var(--lumo-border-radius-m); color: var(--lumo-secondary-text-color);">
                                    <vaadin-icon icon="vaadin:picture" style="height: 2rem; width: 2rem;"></vaadin-icon>
                                </div>`}
                            <input type="file" accept="image/*" style="display: none;" @change="${this.imageUpload}">
                            <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-start;">
                                <vaadin-button @click="${this.triggerImageUpload}">
                                    <vaadin-icon icon="vaadin:upload" slot="prefix"></vaadin-icon>
                                    ${r?"Replace":"Upload"}
                                </vaadin-button>
                                ${r?n`<vaadin-button theme="error tertiary" @click="${this.imageDelete}">
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
                        <input type="color" @input="${r=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"/>
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
  ${Co(this.renderColorPicker,[])}
  ${Al(this.renderColorPickerFooter,[])}
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
`}renderNumberField(e,t,a,i){return this.field?n`<vaadin-number-field
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
            ></vaadin-number-field>`:n``}renderIntegerField(e,t,a,i){if(!this.field)return n``;if(this.field.stereotype=="stars"){let r=t;isNaN(r)&&(r=0);const s=[1,2,3,4,5];return n`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >${s.map(o=>n`
                    <vaadin-icon 
                            icon="vaadin:star" 
                            style="cursor: pointer; color: var(${o<=r?"--lumo-warning-color":"--lumo-shade-30pct"});"
                            @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:o,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}"
                    
                    ></vaadin-icon>
                `)}</vaadin-custom-field>`}if(this.field.stereotype=="slider"){let r=t;return isNaN(r)&&(r=0),n`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${a}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><input type="range" @input="${s=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}" min="${this.field.sliderMin??0}" max="${this.field.sliderMax??10}" value="${r??0}"/></vaadin-custom-field>
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
            `}renderBoolField(e,t,a,i){return this.field?this.field.stereotype=="toggle"?n`
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
            `:n``}renderDateRangeField(e,t,a,i){if(!this.field)return n``;const r=t?t.from+";"+t.to:void 0;return n`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${a}"
                    @value-changed="${s=>{s.detail.value&&(s.detail.value={from:s.detail.value.split(";")[0],to:s.detail.value.split(";")[1]}),this.valueChanged(s)}}"
                    value="${r}"
                    .helperText="${this.helperText()}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||d}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,a,i){return this.field?n`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:n``}renderDateTimeField(e,t,a,i){return this.field?n`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:n``}renderTimeField(e,t,a,i){return this.field?n`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${a}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:n``}renderArrayField(e,t,a,i){if(!this.field)return n``;if(this.field?.stereotype=="choice")return n`
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
`;if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const r=this.field.remoteCoordinates,s="";return this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),n`
                        <vaadin-custom-field
                                label="${a}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box multiple
                                     .selectedValues="${R(this.selectedIndexes(t))}"
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
                                     .selectedValues="${R(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                                     data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(r=>n`
                            <vaadin-item>${r.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const r=this.field.remoteCoordinates,s=this.remoteComboDataProvider(r.action);return n`
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
                    `}if(this.field?.remoteCoordinates){const r=this.field.remoteCoordinates,s="";return this.data[this.id]&&(this.data[this.id].searchSignature||s)&&this.data[this.id].searchSignature!=s&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.rendered||setTimeout(()=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r.action,parameters:{searchText:s,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}),n`
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
                        ${this.field.options?.map(r=>n`
                        <vaadin-checkbox 
                                value="${r.value}" 
                                label="${r.label}"
                        ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
            `}renderMoneyField(e,t,a,i){if(!this.field)return n``;if(this.field.readOnly){const r=t;let s=r;return r&&r.locale&&r.currency?s=new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(r.value):s=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(r),n`<vaadin-custom-field
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
            ></mateu-money-field>`}renderStatusField(e,t,a,i){if(!this.field)return n``;const r=t;return n`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    ${r?n`<span theme="badge pill ${dr(r.type)}">${r.message}</span>`:n``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,a,i){if(!this.field)return n``;this.loadUi5FieldComponents();const r=t;return n`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${a}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${r?.from??0}" end-value="${r?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${this.field.sliderMax??10}"
                                   step="${this.field.step||d}"
                                   @change="${s=>{const o=s.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{from:o.startValue,to:o.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}};te.styles=x`
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
        ${Lt}

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
  `;ne([g()],te.prototype,"inFoldout",2);ne([g()],te.prototype,"ui5FieldComponentsReady",2);ne([h()],te.prototype,"component",2);ne([h()],te.prototype,"field",2);ne([h()],te.prototype,"baseUrl",2);ne([h()],te.prototype,"state",2);ne([h()],te.prototype,"data",2);ne([h()],te.prototype,"appState",2);ne([h()],te.prototype,"appData",2);ne([h()],te.prototype,"labelAlreadyRendered",2);ne([g()],te.prototype,"colorPickerOpened",2);ne([g()],te.prototype,"colorPickerValue",2);ne([g()],te.prototype,"controlOwnsValidity",2);ne([g()],te.prototype,"filteredIcons",2);ne([g()],te.prototype,"navLinkOffset",2);te=ne([k("mateu-field")],te);const a0=(e,t,a,i,r,s,o,l)=>{const c=t.metadata;return n`
        <mateu-field
                id="${t.id}"
                .component="${t}"
                .field="${t.metadata}"
                .state="${i}"
                .data="${r}"
                .appState="${s}"
                .appdata="${o}"
                style="${Nn(t,r)}" class="${t.cssClasses}"
                slot="${t.slot??d}"
                data-colspan="${c.colspan}"
                colspan="${(c.colspan??1)>1?c.colspan:d}"
                .labelAlreadyRendered="${l}"
        >
            ${t.children?.map(u=>w(e,u,a,i,r,s,o,l))}
        </mateu-field>
    `},i0=(e,t,a,i,r,s,o)=>{const l=t.metadata;if(l.tree){const u=async(p,f)=>{const m=p.parentItem?p.parentItem.children:l.page.content;f(m,m.length)};return n`
        <vaadin-grid style="${t.style}" class="${t.cssClasses}"
                     .itemHasChildrenPath="${"children"}" .dataProvider="${u}"
                     slot="${t.slot??d}"
                     all-rows-visible
        >
            ${l.content.map((p,f)=>{const m=p.metadata;return f>0?n`
            <vaadin-grid-column path="${p.id}"
                                header="${m?.label??d}"
                                ?auto-width="${m?.autoWidth}"
                                flex-grow="${m?.flexGrow??d}"
                                width="${m?.width??d}"
                                .column="${p.metadata}"
                                ${tt((b,$,y)=>Ii(b,$,y,m,e,a,i,r,s,o),[])}></vaadin-grid-column>
`:n`
            <vaadin-grid-tree-column path="${p.id}"
                                header="${m?.label??d}"
                                ?auto-width="${m?.autoWidth}"
                                flex-grow="${m?.flexGrow??d}"
                                width="${m?.width??d}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${Kt()}</span>
        </vaadin-grid>
    `}let c=l.page?.content;return t.id&&i&&i[t.id]&&(c=i[t.id]),c||(c=[]),n`
        <vaadin-grid 
                style="${t.style}" 
                class="${t.cssClasses}" 
                .items="${c}"
                all-rows-visible
        >
            ${l?.content?.map(u=>Ps(u,e,a,i,r,s,o))}
        </vaadin-grid>
    `};var r0=Object.defineProperty,s0=Object.getOwnPropertyDescriptor,He=(e,t,a,i)=>{for(var r=i>1?void 0:i?s0(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&r0(t,a,r),r};let Se=class extends _{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this._lastGridHeight=0,this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{const a=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let i=!1;a&&a.content&&(a.content.length>=(e.page+1)*e.pageSize||a.content.length==a.totalElements)&&(t(a.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),a.totalElements),i=!0,this.grid&&this.grid.recalculateColumnWidths()),i||this.pagesRequested.find(r=>r==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{const i=this.metadata?.infiniteScrolling?a?.totalElements:a?.content?.length??0;t(a?.content??[],i),this.grid&&this.grid.recalculateColumnWidths()}},this._onActionRequested=e=>{const t=e.detail,a=this.identifierFieldName;if(!a||!t.parameters||t.actionId?.startsWith("action-on-row-"))return;const i=t.parameters[a];i!==void 0&&(this.state._selectedId=String(i),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t="";const{column:a,item:i}=e,r=this.metadata?.columns?.find(s=>s.metadata.id==a?.path);if(r?.metadata){const s=(r?.metadata).tooltipPath;s&&a&&i&&(t=i[s])}return t}}get identifierFieldName(){const e=this.metadata?.columns?.find(a=>a.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(a=>a.metadata?.id==="id"))return"id"}_applyCellPartNameGenerator(){if(!this.grid)return;const e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId,a=!!this.metadata?.groupBy;e&&t!==void 0||a?this.grid.cellPartNameGenerator=(i,r)=>{const s=r.item;return ya(s)?"mateu-group-row":e&&t!==void 0&&String(s[e])===String(t)?"selected-row":""}:this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener("action-requested",this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("action-requested",this._onActionRequested),this._resizeObserver?.disconnect(),this._resizeObserver=void 0}firstUpdated(){const e=this.grid;!e||this._resizeObserver||(this._resizeObserver=new ResizeObserver(()=>{const t=e.offsetHeight;t>0&&this._lastGridHeight===0&&requestAnimationFrame(()=>{e.recalculateColumnWidths(),e.requestContentUpdate(),e.notifyResize?.()}),this._lastGridHeight=t}),this._resizeObserver.observe(e))}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.requestContentUpdate(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}navigateToRowRoute(e){const a=this.shadowRoot?.querySelector("vaadin-grid")?.getEventContext?.(e)?.item;if(!a||ya(a)||e.composedPath().some(s=>s?.tagName&&/^(A|BUTTON|INPUT|VAADIN-BUTTON|VAADIN-CHECKBOX)$/.test(s.tagName)))return;const r=Ko(this.metadata?.rowRoute,a,this.state,this.data);r&&Et(this,r)}render(){const e=this.data[this.id],t=e?.page,a=this.metadata?.groupBy,i=this.metadata?.infiniteScrolling?void 0:t?.content?kg(t.content,a,e?.groups):t?.content,r=(this.metadata?.columns??[]).flatMap(c=>c.metadata?.type===v.GridGroupColumn?(c.metadata.columns??[]).map(u=>u.metadata):[c.metadata]),s=Sg(r,e,a);let o="";this.metadata?.wrapCellContent&&(o+=" wrap-cell-content"),this.metadata?.compact&&(o+=" compact"),this.metadata?.noBorder&&(o+=" no-border"),this.metadata?.noRowBorder&&(o+=" no-row-borders"),this.metadata?.columnBorders&&(o+=" column-borders"),this.metadata?.rowStripes&&(o+=" row-stripes");const l=this.state[this.id+"_selected_items"]||[];return n`
            <vaadin-grid
                    .items="${i}"
                    item-id-path="_rowNumber"
                    .selectedItems="${l}"
                    ?data-clickable-rows="${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?"lazy":d}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.metadata?.infiniteScrolling?this.dataProvider:void 0}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    @selected-items-changed="${c=>{const u=(c.detail.value??[]).filter(p=>!ya(p));this.emptyArray(this.state[this.id+"_selected_items"])&&this.emptyArray(u)||(this.state[this.id+"_selected_items"]=u,this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0})))}}"
                    @active-item-changed="${R(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?c=>{const u=c.detail.value;u&&ya(u)||(this.detailsOpenedItems=u?[u]:[])}:void 0)}"
                    @click="${R(this.metadata?.rowRoute?c=>this.navigateToRowRoute(c):void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${R(this.metadata?.detailPath?So(c=>this.renderRowDetail(c[this.metadata?.detailPath])):void 0)}
                    theme="${o}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?n`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:d}
                ${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?wl(ya):d}
                ${this.metadata?.columns?.map(c=>Ps(c,this,this.baseUrl,this.state,this.data,this.appState,this.appData,s))}
                ${this.metadata?.useButtonForDetail?n`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${tt((c,{detailsOpened:u})=>n`
              <vaadin-button
                theme="tertiary icon"
                title="${u?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${u?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=u?this.detailsOpenedItems.filter(p=>p!==c):[...this.detailsOpenedItems,c]}}"
              >
                <vaadin-icon
                  .icon="${u?"lumo:angle-down":"lumo:angle-right"}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:d}
                <span slot="empty-state">${Kt(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(c=>c.metadata.tooltipPath)?n`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:d}
            </vaadin-grid>
            <slot></slot>
       `}renderRowDetail(e){if(e==null||e==="")return n``;if(typeof e=="object"&&e.type)return n`${w(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)}`;const t=typeof e=="object"?JSON.stringify(e,null,2):String(e);return n`<div class="row-detail">${t}</div>`}};Se.styles=x`
        ${Lt}
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
        vaadin-grid::part(mateu-group-row) {
            background-color: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
            font-weight: 600;
        }
  `;He([h()],Se.prototype,"id",2);He([h()],Se.prototype,"metadata",2);He([h()],Se.prototype,"baseUrl",2);He([h()],Se.prototype,"state",2);He([h()],Se.prototype,"data",2);He([h()],Se.prototype,"appState",2);He([h()],Se.prototype,"appData",2);He([h()],Se.prototype,"emptyStateMessage",2);He([g()],Se.prototype,"detailsOpenedItems",2);He([me("vaadin-grid")],Se.prototype,"grid",2);Se=He([k("mateu-table")],Se);const o0=(e,t,a,i,r,s,o)=>n`
    <mateu-table
            id="${t.id}"
            baseUrl="${a}"
            .metadata="${t.metadata}"
            .state="${i}"
            .data="${r}"
            .appState="${s}"
            .appDate="${o}"
            style="${t.style}" class="${t.cssClasses}"
            slot="${t.slot??d}"
    >
        ${t.children?.map(l=>w(e,l,a,i,r,s,o))}
    </mateu-table>`,n0=(e,t,a,i,r,s)=>n`
    <mateu-table id="${e.id}"
                 .metadata="${t?.metadata}"
                 .data="${e.data}"
                 .state="${i}"
                 .appState="${r}"
                 .appData="${s}"
                 .emptyStateMessage="${i[t?.id]?.emptyStateMessage}"
                 @sort-direction-changed="${e.directionChanged}"
                 @fetch-more-elements="${e.fetchMoreElements}"
                 baseUrl="${a}"
    ></mateu-table>`,l0=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`
        <div id="show-notifications" slot="${t.slot??d}">${w(e,l.wrapped,a,i,r,s,o)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                ${Eo(()=>n`${w(e,l.content,a,i,r,s,o)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},d0=(e,t,a)=>{const i=e;return n`
        <vaadin-button
                data-action-id="${i.id}"
                theme="${ds(e)||d}"
                @click="${a}"
                ?disabled="${i.disabled}"
        >${i.iconOnLeft?n`<vaadin-icon icon="${i.iconOnLeft}"></vaadin-icon>`:d}${t}${i.iconOnRight?n`<vaadin-icon icon="${i.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>
    `},c0=e=>n`
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
    </div>`,u0={"vaadin:wifi":"vaadin:connect","vaadin:pen":"vaadin:pencil","vaadin:automation":"vaadin:cogs"},h0=(e,t,a)=>n`<vaadin-icon icon="${u0[e]??e}" style="${t??d}" class="${a??d}"></vaadin-icon>`,p0=e=>n`
    <vaadin-button theme="tertiary icon" class="mateu-header-icon-btn ${e.cssClasses??""}"
            @click="${e.onClick}"
            title="${e.title??e.label}" aria-label="${e.label}"
            aria-pressed="${e.pressed===void 0?d:String(e.pressed)}">
        <vaadin-icon icon="${e.icon}"></vaadin-icon>
    </vaadin-button>`,m0=(e,t,a)=>{const i=e.metadata,r=U(i.label,t,a);let s="";return i.buttonStyle&&(s+=" "+i.buttonStyle),i.color&&i.color!=="none"&&i.color!=="normal"&&(s+=" "+i.color),i.size&&i.size!=="none"&&i.size!=="normal"&&(s+=" "+i.size),n`<vaadin-button
            id="${e.id}"
            data-action-id="${i.actionId}"
            data-route="${bn(i,t,a)??d}"
            @click="${o=>vn(o,i)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${s}"
            ?disabled="${i.disabled}"
            title="${i.shortcut?`${r} (${fn(i.shortcut)})`:d}"
            slot="${e.slot??d}"
    >${i.iconOnLeft?n`<vaadin-icon icon="${i.iconOnLeft}"></vaadin-icon>`:d}${r}${i.iconOnRight?n`<vaadin-icon icon="${i.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>`},f0=e=>{const t=e.metadata,a=i=>{const r=i.detail?.value??"";!t.actionId||!r.trim()||i.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:r}},bubbles:!0,composed:!0}))};return n`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                @submit="${a}"
        ></vaadin-message-input>
    `},v0=e=>{const a=(e.metadata.items??[]).map(i=>({text:i.text,time:i.time,userName:i.userName,userImg:i.userImg,userAbbr:i.userAbbr,userColorIndex:i.userColorIndex}));return n`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                .items="${a}"
        ></vaadin-message-list>
    `},zr=(e,t)=>{e&&e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},b0=(e,t,a,i,r,s,o)=>{const l=t.metadata;let c=!1;if(l.openedCondition)try{c=ns(l.openedCondition,i,r,s,o)}catch(u){console.error("when evaluating "+l.openedCondition+" :"+u+", where data is "+r+" and state is "+i)}return n`
        <vaadin-confirm-dialog
                header="${l.header}"
                ?cancel-button-visible="${l.canCancel}"
                ?reject-button-visible="${l.canReject}"
                reject-text="${l.rejectText}"
                confirm-text="${l.confirmText}"
                .opened="${c}"
                @confirm="${u=>zr(u.currentTarget,l.confirmActionId)}"
                @reject="${u=>zr(u.currentTarget,l.rejectActionId)}"
                @cancel="${u=>zr(u.currentTarget,l.cancelActionId)}"
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(u=>w(e,u,a,i,r,s,o))}
        </vaadin-confirm-dialog>
    `};var g0=Object.defineProperty,y0=Object.getOwnPropertyDescriptor,De=(e,t,a,i)=>{for(var r=i>1?void 0:i?y0(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&g0(t,a,r),r};function $0(e){let t=e;for(;t;){const a=t.parentElement??t.getRootNode().host??null;if(!a||a===t)break;if(a instanceof Element){const i=getComputedStyle(a).overflowY;if(i==="auto"||i==="scroll")return a}t=a}return document.scrollingElement}let ye=class extends _{constructor(){super(...arguments),this.panels=[],this.headerTitle="",this.badges=[],this.navigation=null,this.overviewEditActionId="",this._raf=0,this._snapping=!1,this._less=!1,this._more=!1,this._open=[],this._openKey="",this._visible=[],this._onScroll=()=>{this._raf||(this._raf=requestAnimationFrame(()=>{this._raf=0,this._syncPin()}))},this._onScrollEnd=()=>{!this._snapping&&Date.now()-this._lastWheel>400&&this._snapToNearest()},this._lastWheel=0,this._onWheel=e=>{const t=this._rail;if(!t||e.ctrlKey||e.defaultPrevented)return;const a=e.deltaMode===1?40:e.deltaMode===2?t.clientWidth:1,i=[];for(const s of e.composedPath()){if(s===t)break;if(!(s instanceof HTMLElement))continue;const o=getComputedStyle(s).overflowY;(o==="auto"||o==="scroll")&&s.scrollHeight>s.clientHeight+1&&i.push({scrollTop:s.scrollTop,scrollHeight:s.scrollHeight,clientHeight:s.clientHeight})}const r=xg(e.deltaX*a,e.deltaY*a,t.scrollLeft,t.scrollWidth-t.clientWidth,i);r!=null&&(e.preventDefault(),this._lastWheel=Date.now(),t.scrollBy({left:r,behavior:"smooth"}))},this._fit=()=>{const e=this.getBoundingClientRect().top,t=Math.max(240,window.innerHeight-e);this.style.setProperty("--mateu-foldout-fill",`${t}px`);const a=$0(this);if(a){const i=a.scrollHeight-a.clientHeight;i>0&&this.style.setProperty("--mateu-foldout-fill",`${Math.max(240,t-i)}px`)}this._syncPin()},this._onKeydown=e=>{if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft"||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||this._isEditingContext())return;const t=this._rail;!t||t.scrollWidth<=t.clientWidth||(e.preventDefault(),this._step(e.key==="ArrowRight"?1:-1))}}willUpdate(e){if(e.has("panels")){const t=vg(this._open,this._openKey,this.panels);this._open=t.states,this._openKey=t.key}}_toggle(e){const t=[...this._open];t[e]=!(t[e]??!0),this._open=t,requestAnimationFrame(()=>this._syncPin())}_goTo(e){const t=this._rail;if(!t)return;const a=[...this.renderRoot.querySelectorAll(".section")],i=(this._first?.offsetWidth??0)<t.clientWidth*.6,r=e===0||e===1&&i?0:a[e]?.offsetLeft??0,s=t.scrollWidth-t.clientWidth;this._snapping=!0,t.scrollTo({left:Math.max(0,Math.min(r,s)),behavior:"smooth"}),window.setTimeout(()=>{this._snapping=!1},400)}navAction(e){e&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}_stride(){const e=this.renderRoot.querySelectorAll(".section");return e.length>1?e[1].offsetLeft:this._rail?.clientWidth??0}_boundaries(){const e=this._rail;if(!e)return[];const t=e.scrollWidth-e.clientWidth,a=[...this.renderRoot.querySelectorAll(".section")].map(i=>Math.max(0,Math.min(i.offsetLeft,t)));return[...new Set(a)]}_snapToNearest(){const e=this._rail;if(!e)return;const t=this._boundaries();if(!t.length)return;const a=t.reduce((i,r)=>Math.abs(r-e.scrollLeft)<Math.abs(i-e.scrollLeft)?r:i);Math.abs(a-e.scrollLeft)<1||(this._snapping=!0,e.scrollTo({left:a,behavior:"smooth"}),window.setTimeout(()=>{this._snapping=!1},400))}_syncPin(){const e=this._rail,t=this._first;if(!e||!t)return;const a=this._stride(),r=t.offsetWidth<e.clientWidth*.6?Math.min(e.scrollLeft,a):0;t.style.transform=r?`translateX(${r}px)`:"",t.classList.toggle("floating",e.scrollLeft>0);const s=e.scrollWidth-e.clientWidth,o=s>32;this._less=o&&e.scrollLeft>2,this._more=o&&e.scrollLeft<s-2;const l=e.getBoundingClientRect(),c=bg({left:l.left,right:l.right},[...this.renderRoot.querySelectorAll(".section")].map(u=>{const p=u.getBoundingClientRect();return{left:p.left,right:p.right}}));c.join()!==this._visible.join()&&(this._visible=c)}_step(e){const t=this._rail;if(!t)return;const a=this._boundaries();if(!a.length)return;const i=a.reduce((s,o,l)=>Math.abs(o-t.scrollLeft)<Math.abs(a[s]-t.scrollLeft)?l:s,0),r=a[Math.max(0,Math.min(i+e,a.length-1))];this._snapping=!0,t.scrollTo({left:r,behavior:"smooth"}),window.setTimeout(()=>{this._snapping=!1},400)}_isEditingContext(){let e=document.activeElement;for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;if(!e)return!1;const t=e.tagName;return t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||e.isContentEditable}_sectionStyle(e,t){return mg(e.width,this._open[t]??!0)||d}firstUpdated(){this._fit();for(const e of[300,1e3,2500])window.setTimeout(()=>this._fit(),e);this._resizeObserver=new ResizeObserver(()=>this._fit()),this._rail&&this._resizeObserver.observe(this._rail);for(const e of this.renderRoot.querySelectorAll(".section"))this._resizeObserver.observe(e)}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onKeydown),window.addEventListener("resize",this._fit)}disconnectedCallback(){document.removeEventListener("keydown",this._onKeydown),window.removeEventListener("resize",this._fit),this._resizeObserver?.disconnect(),this._resizeObserver=void 0,this._raf&&(cancelAnimationFrame(this._raf),this._raf=0),super.disconnectedCallback()}render(){const e=this.navigation,t=!!(this.overviewEditActionId||e&&(e.parentActionId||e.previousActionId||e.nextActionId)),a=!!(this.headerTitle||t||this.badges.length);return n`
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
                                    ${this.badges.map(i=>n`<span class="section-badge">${i}</span>`)}
                                </div>
                            `:d}
                        </header>
                    `:d}
                    <div class="overview-body">
                        <slot name="overview"></slot>
                    </div>
                </section>
                ${this.panels.map((i,r)=>{const s=this._open[r]??!0,o=r%2===1?" panel-alt":"";if(!s)return n`
                            <section class="section strip${o}" part="section panel strip"
                                     style="${this._sectionStyle(i,r)}">
                                <button class="strip-button" title="${i.title??""}"
                                        aria-expanded="false" @click="${()=>this._toggle(r)}">
                                    <span class="strip-chevron" aria-hidden="true">›</span>
                                    <span class="strip-title">${i.title??""}</span>
                                </button>
                            </section>
                        `;const l=i.open===!1;return n`
                    <section class="section${o}" part="section panel"
                             style="${this._sectionStyle(i,r)}">
                        ${i.title||i.subtitle||l?n`
                            <div class="panel-header">
                                <div>
                                ${i.title?n`<h3>${i.title}${i.subtitle?n` <span class="subtitle" style="font-weight: 400;">· ${i.subtitle}</span>`:d}</h3>`:d}
                                ${!i.title&&i.subtitle?n`<div class="subtitle">${i.subtitle}</div>`:d}
                                </div>
                                ${l?n`<button class="panel-fold" title="Fold" aria-expanded="true"
                                        @click="${()=>this._toggle(r)}">‹</button>`:d}
                            </div>
                        `:d}
                        <div class="panel-body">
                            <slot name="panel-${r}"></slot>
                        </div>
                    </section>
                `})}
            </div>
            ${this._less||this._more?n`
                <nav class="dots" part="paging-dots" aria-label="Panels">
                    ${[this.headerTitle||"Overview",...this.panels.map(i=>i.title??"")].map((i,r)=>n`
                        <button class="dot ${this._visible[r]?"on":""}" title="${i}"
                                aria-label="${i}" aria-current="${this._visible[r]?"true":"false"}"
                                @click="${()=>this._goTo(r)}"></button>
                    `)}
                </nav>
            `:d}
        `}};ye.styles=x`
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
    `;De([h({type:Array})],ye.prototype,"panels",2);De([h({type:String})],ye.prototype,"headerTitle",2);De([h({type:Array})],ye.prototype,"badges",2);De([h({attribute:!1})],ye.prototype,"navigation",2);De([h({type:String})],ye.prototype,"overviewEditActionId",2);De([me(".rail")],ye.prototype,"_rail",2);De([me(".section--first")],ye.prototype,"_first",2);De([g()],ye.prototype,"_less",2);De([g()],ye.prototype,"_more",2);De([g()],ye.prototype,"_open",2);De([g()],ye.prototype,"_visible",2);ye=De([k("mateu-vaadin-foldout")],ye);const w0=(e,t,a,i,r,s,o)=>{const l=t.metadata;return n`
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
            ${t.children?.map(c=>w(e,c,a,i,r,s,o))}
        </mateu-vaadin-foldout>
    `};var x0=Object.defineProperty,k0=Object.getOwnPropertyDescriptor,Ut=(e,t,a,i)=>{for(var r=i>1?void 0:i?k0(t,a):t,s=e.length-1,o;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&x0(t,a,r),r};let nt=class extends _{constructor(){super(...arguments),this.rows=[],this.columns=[],this.navigable=!1,this.expandedItems=[],this._normalized=[],this.dataProvider=(e,t)=>{const a=e.parentItem?e.parentItem.children??[]:this.normalized;t(a,a.length)}}get normalized(){return this._src!==this.rows&&(this._src=this.rows,this._normalized=this.normalizeRows(this.rows??[])),this._normalized}normalizeRows(e){return(e??[]).map(t=>{const a=Array.isArray(t.children)&&t.children.length?this.normalizeRows(t.children):void 0;return{...t,children:a}})}collectGroups(e,t=[]){return e.forEach(a=>{a.children&&a.children.length&&(t.push(a),this.collectGroups(a.children,t))}),t}willUpdate(){this._expandedSrc!==this.rows&&(this._expandedSrc=this.rows,this.expandedItems=this.collectGroups(this.normalized))}updated(e){e.has("rows")&&this._grid?.clearCache?.()}dispatch(e,t){this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}render(){const e=this.columns??[],t=e[0],a=e.slice(1);return n`
            <vaadin-grid
                    theme="compact no-row-borders"
                    all-rows-visible
                    .dataProvider="${this.dataProvider}"
                    .itemHasChildrenPath="${"children"}"
                    .expandedItems="${this.expandedItems}"
                    @expanded-items-changed="${i=>{this.expandedItems=i.detail.value}}">
                ${t?n`
                    <vaadin-grid-tree-column path="${t.id}" header="${t.label??""}"
                                             auto-width flex-grow="0"></vaadin-grid-tree-column>
                `:d}
                ${a.map(i=>i.id==="select"?n`<vaadin-grid-column header="${i.label??""}" auto-width flex-grow="0" text-align="end"
                              ${tt(r=>n`<vaadin-button theme="tertiary small"
                                          @click="${()=>this.dispatch("action-on-row-select",{_clickedRow:r})}">Select</vaadin-button>`,[])}></vaadin-grid-column>`:n`<vaadin-grid-column path="${i.id}" header="${i.label??""}"></vaadin-grid-column>`)}
                ${this.navigable?n`
                    <vaadin-grid-column auto-width flex-grow="0" text-align="end"
                          ${tt(i=>i?.viewable===!1?n``:n`<vaadin-button theme="tertiary small"
                                          @click="${()=>this.dispatch("view",i)}">View</vaadin-button>`,[])}></vaadin-grid-column>
                `:d}
            </vaadin-grid>
        `}};nt.styles=x`
        :host {
            display: block;
            width: 100%;
        }
        vaadin-grid {
            max-height: min(60vh, 32rem);
            min-width: 22rem;
        }
    `;Ut([h({attribute:!1})],nt.prototype,"rows",2);Ut([h({attribute:!1})],nt.prototype,"columns",2);Ut([h()],nt.prototype,"idField",2);Ut([h({type:Boolean})],nt.prototype,"navigable",2);Ut([h()],nt.prototype,"selectedId",2);Ut([g()],nt.prototype,"expandedItems",2);Ut([me("vaadin-grid")],nt.prototype,"_grid",2);nt=Ut([k("mateu-vaadin-tree")],nt);const _0={[v.VirtualList]:(e,t,a,i,r,s,o)=>vb(e,t,a,i,r,s,o),[v.Notification]:(e,t)=>bb(t),[v.ProgressBar]:(e,t,a,i)=>gb(t,i),[v.Details]:(e,t,a,i,r,s,o)=>yb(e,t,a,i,r,s,o),[v.Avatar]:(e,t,a,i,r)=>$b(t,i,r),[v.AvatarGroup]:(e,t)=>wb(t),[v.Card]:(e,t,a,i,r,s,o)=>xb(e,t,a,i,r,s,o),[v.Button]:(e,t,a,i,r)=>m0(t,i,r),[v.MessageInput]:(e,t)=>f0(t),[v.MessageList]:(e,t)=>v0(t),[v.ConfirmDialog]:(e,t,a,i,r,s,o)=>b0(e,t,a,i,r,s,o),[v.FormLayout]:(e,t,a,i,r,s,o)=>Ab(e,t,a,i,r,s,o),[v.HorizontalLayout]:(e,t,a,i,r,s,o)=>Fb(e,t,a,i,r,s,o),[v.VerticalLayout]:(e,t,a,i,r,s,o)=>Mb(e,t,a,i,r,s,o),[v.SplitLayout]:(e,t,a,i,r,s,o)=>Nb(e,t,a,i,r,s,o),[v.MasterDetailLayout]:(e,t,a,i,r,s,o)=>qb(e,t,a,i,r,s,o),[v.TabLayout]:(e,t,a,i,r,s,o)=>Bb(e,t,a,i,r,s,o),[v.AccordionLayout]:(e,t,a,i,r,s,o)=>jb(e,t,a,i,r,s,o),[v.BoardLayout]:(e,t,a,i,r,s,o)=>Hb(e,t,a,i,r,s,o),[v.BoardLayoutRow]:(e,t,a,i,r,s,o)=>Vb(e,t,a,i,r,s,o),[v.BoardLayoutItem]:(e,t,a,i,r,s,o)=>Gb(e,t,a,i,r,s,o),[v.Scroller]:(e,t,a,i,r,s,o)=>Wb(e,t,a,i,r,s,o),[v.MenuBar]:(e,t,a,i,r)=>Qb(e,t,a,i,r),[v.ContextMenu]:(e,t,a,i,r,s,o)=>Jb(e,t,a,i,r,s,o),[v.FormField]:(e,t,a,i,r,s,o,l)=>a0(e,t,a,i,r,s,o,l),[v.Grid]:(e,t,a,i,r,s,o)=>i0(e,t,a,i,r,s,o),[v.Table]:(e,t,a,i,r,s,o)=>o0(e,t,a,i,r,s,o),[v.Popover]:(e,t,a,i,r,s,o)=>l0(e,t,a,i,r,s,o),[v.FoldoutLayout]:(e,t,a,i,r,s,o)=>w0(e,t,a,i,r,s,o)};class C0 extends fb{rendererName(){return"vaadin"}renderClientSideComponent(t,a,i,r,s,o,l,c){const u=a?.metadata?.type,p=u?_0[u]:void 0;return p&&a?p(t,a,i,r,s,o,l,c):super.renderClientSideComponent(t,a,i,r,s,o,l,c)}renderTableComponent(t,a,i,r,s,o,l){return n0(t,a,i,r,o,l)}renderTreeComponent(t,a){return n`
            <mateu-vaadin-tree
                    .rows="${a.rows}"
                    .columns="${a.columns}"
                    .idField="${a.idField}"
                    .navigable="${a.navigable}"
                    .selectedId="${a.selectedId}"
            ></mateu-vaadin-tree>`}renderToolbarButton(t,a,i){return d0(t,a,i)}renderPeerNav(t){return c0(t)}renderIcon(t,a,i){return h0(t,a,i)}renderTopNav(t,a,i){return Xb(t,a,i)}renderHeaderIconButton(t){return p0(t)}}function xl(e){switch(e){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"}function S0(e,t){if(e.onAction)return{label:e.actionLabel??"Retry",run:e.onAction};if(e.undoActionId)return{label:e.undoLabel??"Undo",run:()=>t.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0}))}}function E0(e,t){const a=new Ti;a.position=xl(e.position),a.duration=e.duration??1e4,e.variant&&a.setAttribute("theme",e.variant),a.renderer=i=>{if(i.firstElementChild)return;const r=document.createElement("span");r.textContent=e.text;const s=S0(e,t),o=document.createElement("button");o.textContent=s.label,o.style.cssText="margin-left: 0.75rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;",o.addEventListener("click",()=>{s.run(),a.opened=!1}),i.append(r,o)},document.body.appendChild(a),a.opened=!0,a.addEventListener("opened-changed",i=>{i.detail.value||a.remove()})}const I0={show(e,t){if(os(e.text,{politeness:e.variant==="error"?"assertive":"polite"}),e.undoActionId||e.onAction){E0(e,t);return}Ti.show(e.text,{position:e.position?xl(e.position):"bottom-end",theme:e.variant,duration:e.duration})}};H.set(new C0);Bn(I0);
