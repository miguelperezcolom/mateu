const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-ol.js","assets/rolldown-runtime.js","assets/vendor.js","assets/vendor-chartjs.js","assets/vendor-diagrams.js","assets/vendor-ui5.js"])))=>i.map(i=>d[i]);
import{_ as e,a as t,c as n,d as r,f as i,g as a,h as o,i as s,l as c,m as l,n as u,o as d,p as f,r as p,s as m,t as h,u as g,v as _}from"./vendor-vaadin.js";import{C as v,T as ee,_ as te,a as y,b,f as ne,g as x,h as S,i as C,l as re,n as ie,o as w,r as T,s as E,t as ae,u as oe,y as D}from"./vendor-lit.js";import{a as se,c as ce,i as le,l as ue,s as de}from"./vendor.js";import{r as O}from"./vendor-ui5.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),_(`vaadin-card`,v`
      :host(.mateu-section) {
        --vaadin-card-border-width: 0 !important;
        --vaadin-card-background: transparent !important;
        --vaadin-card-shadow: none !important;
        --vaadin-card-padding: 0 !important;
      }
    `);var fe=document.createElement(`style`);fe.innerHTML=`
${e.cssText}
${o.cssText}
${a.cssText}
${l.cssText}
${f}
${i}
`,document.body.appendChild(fe);function pe(e,t){let n=t.split(`,`).map(e=>e.trim()),r=e=>n.map(t=>t+e).join(`,`),i=[`${r(``)}{color-scheme:light dark}`],a=(t,n)=>{let a=RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)+`\\s*\\{([^}]*)\\}`,`g`),o;for(;(o=a.exec(e))!==null;){let e=o[1].trim();e&&i.push(`${r(n)}{${e}}`)}};return a(`:where(:host),:where(:root)`,``),a(`:host,:root`,``),a(`:host([theme~=dark]),[theme~=dark]`,`[theme~=dark]`),a(`:host([theme~=light-dark]),[theme~=light-dark]`,`[theme~=light-dark]`),i.join(`
`)}var me=document.createElement(`style`);me.setAttribute(`data-mateu-theme-scope`,``),me.textContent=pe(f,`mateu-ui,mateu-ux`),document.head.appendChild(me);{let e=window.Vaadin;e&&((e.featureFlags??={}).masterDetailLayoutComponent=!0)}new class{constructor(){this.ui=void 0,this.loading=!1,this.config={},this.sharedData={},this.userData={},this.appData={},this.runtimeData={}}};var he=new ue,k={value:{}},ge={value:{}};function _e(e){let t=``;for(let n of e)switch(n){case`"`:t+=`\\"`;break;case`\\`:t+=`\\\\`;break;case`
`:t+=`\\n`;break;case`\r`:t+=`\\r`;break;case`	`:t+=`\\t`;break;case`\b`:t+=`\\b`;break;case`\f`:t+=`\\f`;break;default:t+=n<` `?`\\u`+n.charCodeAt(0).toString(16).padStart(4,`0`):n}return t}function ve(e){if(typeof e==`string`)return _e(e);if(Array.isArray(e))return e.map(ve);if(e&&typeof e==`object`){let t={};for(let[n,r]of Object.entries(e))t[n]=ve(r);return t}return e}function ye(e){return e?Object.entries(e).some(([e,t])=>e.toLowerCase()===`content-type`&&(t??``).toLowerCase().includes(`json`)):!1}var be=[],xe=e=>{be=Array.isArray(e)?e:[]},Se=e=>e?be.find(t=>t.name===e):void 0,Ce=e=>e==null||e===``,we=e=>{if(!e?.ref)return e;let t=Se(e.ref);if(!t?.source)return console.warn(`mateu: no REST source named "${e.ref}" in the app's catalogue`),e;let n=t.source;return{...e,url:Ce(e.url)?n.url:e.url,method:Ce(e.method)?n.method:e.method,headers:e.headers&&Object.keys(e.headers).length>0?e.headers:n.headers,body:Ce(e.body)?n.body:e.body,itemsPath:Ce(e.itemsPath)?n.itemsPath:e.itemsPath,valuePath:Ce(e.valuePath)?n.valuePath:e.valuePath,labelPath:Ce(e.labelPath)?n.labelPath:e.labelPath,proxy:e.proxy||n.proxy}},Te=(e,t)=>{let n=Se(e?.ref)?.fields?.[t];return n&&n!==``?n:t},Ee=e=>Se(e?.ref)?.totalPath||void 0,De=v`
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
`,Oe=v`
    :where(a:any-link) {
        color: var(--mateu-link-color, var(--lumo-primary-text-color, #1676f3));
    }
`,ke={lon:0,lat:0},Ae=e=>{if(!e)return;let t=e.split(`,`).map(e=>e.trim());if(t.length!==2)return;let n=Number(t[0]),r=Number(t[1]);if(!(t[0]===``||t[1]===``||!Number.isFinite(n)||!Number.isFinite(r)))return{lon:r,lat:n}},je=e=>{if(e==null||e.trim()===``)return 3;let t=Number(e);return Number.isFinite(t)?t:3};function A(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var Me=class extends S{constructor(...e){super(...e),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){let e=++this.renderSeq,[{default:t},{default:n},{default:r},{default:i},{fromLonLat:a},{default:o}]=await Promise.all([O(()=>import(`./vendor-ol.js`).then(e=>e.i),__vite__mapDeps([0,1])),O(()=>import(`./vendor-ol.js`).then(e=>e.a),__vite__mapDeps([0,1])),O(()=>import(`./vendor-ol.js`).then(e=>e.r),__vite__mapDeps([0,1])),O(()=>import(`./vendor-ol.js`).then(e=>e.t),__vite__mapDeps([0,1])),O(()=>import(`./vendor-ol.js`).then(e=>e.o),__vite__mapDeps([0,1])),O(()=>import(`./vendor-ol.js`).then(e=>e.n),__vite__mapDeps([0,1]))]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector(`style[data-ol]`)){let e=document.createElement(`style`);e.setAttribute(`data-ol`,``),e.textContent=o,this.shadowRoot.appendChild(e)}this.map&&=(this.map.setTarget(void 0),void 0);let s=Ae(this.position)??ke;this.map=new t({target:this.mapElement,layers:[new r({source:new i})],view:new n({center:a([s.lon,s.lat]),zoom:je(this.zoom)})})}render(){return D`<div id="map"></div>`}static{this.styles=v`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `}};A([y()],Me.prototype,`position`,void 0),A([y()],Me.prototype,`zoom`,void 0),A([T(`#map`)],Me.prototype,`mapElement`,void 0),Me=A([w(`mateu-map`)],Me);var Ne=typeof HTMLElement<`u`?HTMLElement:class{},Pe=class extends Ne{static get observedAttributes(){return[`content`]}#e;#t=0;get content(){return this.#e}set content(e){this.#e=e,this.#n()}attributeChangedCallback(e,t,n){this.content=n??void 0}connectedCallback(){this.style.display=`block`,this.#n()}async#n(){if(!this.isConnected)return;let e=this.#e??``,t=++this.#t,[{marked:n},{default:r}]=await Promise.all([O(()=>import(`./vendor.js`).then(e=>e.t),__vite__mapDeps([2,1])),O(()=>import(`./vendor.js`).then(e=>e.o),__vite__mapDeps([2,1]))]);t===this.#t&&(this.innerHTML=r.sanitize(await n.parse(e),{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:e=>!0}}))}};typeof customElements<`u`&&!customElements.get(`mateu-markdown`)&&customElements.define(`mateu-markdown`,Pe);var j=function(e){return e.ServerSide=`ServerSide`,e.ClientSide=`ClientSide`,e}({}),M=function(e){return e.Page=`Page`,e.Div=`Div`,e.Element=`Element`,e.MicroFrontend=`MicroFrontend`,e.Form=`Form`,e.Crud=`Crud`,e.Result=`Result`,e.Card=`Card`,e.Directory=`Directory`,e.Stepper=`Stepper`,e.HorizontalLayout=`HorizontalLayout`,e.VerticalLayout=`VerticalLayout`,e.SplitLayout=`SplitLayout`,e.MasterDetailLayout=`MasterDetailLayout`,e.TabLayout=`TabLayout`,e.AccordionLayout=`AccordionLayout`,e.FormLayout=`FormLayout`,e.FormRow=`FormRow`,e.FormItem=`FormItem`,e.BoardLayout=`BoardLayout`,e.BoardLayoutRow=`BoardLayoutRow`,e.BoardLayoutItem=`BoardLayoutItem`,e.Scroller=`Scroller`,e.FullWidth=`FullWidth`,e.Container=`Container`,e.FormField=`FormField`,e.Table=`Table`,e.App=`App`,e.Text=`Text`,e.Avatar=`Avatar`,e.Chat=`Chat`,e.AvatarGroup=`AvatarGroup`,e.Badge=`Badge`,e.Breadcrumbs=`Breadcrumbs`,e.Anchor=`Anchor`,e.Button=`Button`,e.Chart=`Chart`,e.Icon=`Icon`,e.ConfirmDialog=`ConfirmDialog`,e.ContextMenu=`ContextMenu`,e.CookieConsent=`CookieConsent`,e.Details=`Details`,e.Dialog=`Dialog`,e.Drawer=`Drawer`,e.Image=`Image`,e.Map=`Map`,e.Markdown=`Markdown`,e.Notification=`Notification`,e.ProgressBar=`ProgressBar`,e.Popover=`Popover`,e.CarouselLayout=`CarouselLayout`,e.Tooltip=`Tooltip`,e.MessageInput=`MessageInput`,e.MessageList=`MessageList`,e.CustomField=`CustomField`,e.MenuBar=`MenuBar`,e.Grid=`Grid`,e.GridColumn=`GridColumn`,e.GridGroupColumn=`GridGroupColumn`,e.VirtualList=`VirtualList`,e.FormSection=`FormSection`,e.FormSubSection=`FormSubSection`,e.Bpmn=`Bpmn`,e.Workflow=`Workflow`,e.FormEditor=`FormEditor`,e.MetricCard=`MetricCard`,e.Scoreboard=`Scoreboard`,e.DashboardPanel=`DashboardPanel`,e.DashboardLayout=`DashboardLayout`,e.ResponsiveGrid=`ResponsiveGrid`,e.FoldoutLayout=`FoldoutLayout`,e.ContentLayout=`ContentLayout`,e.HeroSection=`HeroSection`,e.EmptyState=`EmptyState`,e.Skeleton=`Skeleton`,e.Gantt=`Gantt`,e.PlanningBoard=`PlanningBoard`,e.Kanban=`Kanban`,e.Timeline=`Timeline`,e.ProgressSteps=`ProgressSteps`,e.Stat=`Stat`,e.Calendar=`Calendar`,e.PricingTable=`PricingTable`,e.OrgChart=`OrgChart`,e.Heatmap=`Heatmap`,e.Funnel=`Funnel`,e.TrendChart=`TrendChart`,e.FeatureGrid=`FeatureGrid`,e.Testimonials=`Testimonials`,e.Faq=`Faq`,e.CalloutCard=`CalloutCard`,e.CommentThread=`CommentThread`,e.FileList=`FileList`,e.Checklist=`Checklist`,e.ComparisonCard=`ComparisonCard`,e.EntityHeader=`EntityHeader`,e.Meter=`Meter`,e.TaskProgress=`TaskProgress`,e.StatusList=`StatusList`,e.BulletedList=`BulletedList`,e.ActionPanel=`ActionPanel`,e.MatrixGrid=`MatrixGrid`,e.DropZone=`DropZone`,e.Separator=`Separator`,e.CustomComponent=`CustomComponent`,e.Notice=`Notice`,e.TaskQueue=`TaskQueue`,e.ResourceGrid=`ResourceGrid`,e.OfferCard=`OfferCard`,e.AddOnPicker=`AddOnPicker`,e.Ledger=`Ledger`,e.PaymentPicker=`PaymentPicker`,e.ProcessMonitor=`ProcessMonitor`,e.NotFound=`NotFound`,e}({}),Fe=function(e){return e.HAMBURGUER_MENU=`HAMBURGUER_MENU`,e.HAMBURGER_MENU=`HAMBURGER_MENU`,e.HAMBURGER_SECTIONS=`HAMBURGER_SECTIONS`,e.MENU_ON_LEFT=`MENU_ON_LEFT`,e.MENU_ON_TOP=`MENU_ON_TOP`,e.TABS=`TABS`,e.TILES=`TILES`,e.RAIL=`RAIL`,e.AUTO=`AUTO`,e.MEDIATOR=`MEDIATOR`,e}({}),Ie=`mateu-app-context`,Le=`mateu-app-context-labels`,Re=e=>{try{return JSON.parse(localStorage.getItem(e)??`{}`)}catch{return{}}},ze=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},Be=()=>Re(Ie),Ve=()=>Re(Le),He=(e,t,n)=>{let r=Be(),i=Ve();t==null||t===``?(delete r[e],delete i[e]):(r[e]=t,n!==void 0&&(i[e]=n)),ze(Ie,r),ze(Le,i)},Ue=!1,We=()=>{Ue||(Ue=!0,window.addEventListener(`storage`,e=>{e.key===Ie&&e.newValue!==e.oldValue&&window.location.reload()}))},Ge,Ke=(e,t)=>new Promise((n,r)=>{let i=!1,a={retry:()=>{i||(i=!0,t().then(n,r))},giveUp:()=>{i||(i=!0,r(e))}};if(Ge){Ge(a);return}let o=new CustomEvent(`mateu-session-expired`,{detail:a,cancelable:!0,bubbles:!1});typeof document<`u`&&!document.dispatchEvent(o)||a.giveUp()}),qe=(e,t)=>e.includes(`json`)?!0:typeof t==`object`&&!!t,Je=(e,t)=>{let n=e.finalUrl;if(!n)return;let r=t??(typeof window<`u`?window.location.href:void 0),i;try{i=new URL(e.requestedUrl,r).href}catch{return}if(i!==n&&!qe(e.contentType??``,e.data))return n},Ye=new class{constructor(){this.windowMs=4e3,this.threshold=12,this.events=[],this.reported=new Set}check(e,t=Date.now()){this.events.push({sig:e,t});let n=t-this.windowMs;this.events=this.events.filter(e=>e.t>=n);let r=0;for(let t of this.events)t.sig===e&&r++;if(r>=this.threshold){let t=!this.reported.has(e);return this.reported.add(e),{blocked:!0,firstTrip:t}}return this.reported.delete(e),{blocked:!1,firstTrip:!1}}reset(){this.events=[],this.reported.clear()}configure(e){e.windowMs!==void 0&&(this.windowMs=e.windowMs),e.threshold!==void 0&&(this.threshold=e.threshold)}},Xe=function(e){return e.Add=`Add`,e.Replace=`Replace`,e.ReplaceKeepData=`ReplaceKeepData`,e}({}),Ze=[],Qe=e=>{Ze=Array.isArray(e)?e:[]},$e=e=>e?Ze.find(t=>t.name===e)?.component:void 0,et=new Set([`id`,`style`,`cssClasses`,`slot`,`initialData`,`confirmOnNavigationIfDirty`,`sizing`]),tt=new Set([`Form`,`FormLayout`,`VerticalLayout`,`HorizontalLayout`,`Div`,`FlexLayout`,`CustomComponent`]),nt=new Set([`Card`]),rt=new Set([`Listing`,`Crudl`,`Crud`]);function it(e){let{note:t,...n}=e;if(rt.has(n.type))return at(n);if(n.type===`ComponentRef`)return $e(n.ref)||{type:j.ClientSide,metadata:{type:`Text`,text:`Unknown business component: ${n.ref}`},children:[]};let{type:r,content:i,children:a,...o}=n,s={},c={type:r};for(let[e,t]of Object.entries(o))et.has(e)?s[e]=t:(e===`toolbar`||e===`buttons`)&&Array.isArray(t)?c[e]=t.map(ct):c[e]=t;r===`FormField`&&(o.id!==void 0&&(c.fieldId=o.id),delete c.id,c.dataType=c.dataType??`string`,c.stereotype=c.stereotype??`regular`);let l=[];if(tt.has(r)){let e=i??a??[];l=Array.isArray(e)?e:[e]}else nt.has(r)&&i&&typeof i==`object`&&!Array.isArray(i)&&(c.content=it(i));return{...s,type:j.ClientSide,metadata:c,children:l.map(it)}}function at(e){let{type:t,content:n,children:r,...i}=e,a={id:`crud`,sizing:`fill`},o={type:`Crud`,crudlType:i.crudlType??i.listingType??`table`,pageSize:10,searchOnEnter:!0,autoFocusOnSearchText:!0,filtersLayout:`auto`,gridLayout:`auto`};for(let[e,t]of Object.entries(i))e===`crudlType`||e===`listingType`||(et.has(e)?a[e]=t:e===`columns`&&Array.isArray(t)?o[e]=t.map(ot):e===`toolbar`&&Array.isArray(t)?o[e]=t.map(ct):e===`filters`&&Array.isArray(t)?o[e]=t.map(lt):o[e]=t);return{...a,type:j.ClientSide,metadata:o,children:[]}}function ot(e){let t=it(e);return e.id!==void 0&&t.metadata&&(t.metadata.id=e.id),t}var st=e=>e.replace(/[^\p{L}\p{N}]+/gu,` `).trim().split(/\s+/).filter(Boolean).map((e,t)=>t===0?e.charAt(0).toLowerCase()+e.slice(1):e.charAt(0).toUpperCase()+e.slice(1)).join(``);function ct(e){if(!e||e.type!==`Button`)return e;let{actionable:t,...n}=e,r={...n};return t?.type===`RouteLink`&&t.route&&(r.route=t.route),!r.actionId&&typeof r.label==`string`&&(r.actionId=st(r.label)),r}function lt(e){if(!e||e.type!==`FormField`)return e;let{id:t,...n}=e;return{...n,fieldId:n.fieldId??t,dataType:n.dataType??`string`,stereotype:n.stereotype??`regular`}}var ut=`ux_main`;function dt(e){return!(e.viewModel??e.modelView)&&!!ft(e)}function ft(e){if(e.layout&&typeof e.layout==`object`)return e.layout;if(typeof e.type==`string`)return e}function pt(e,t,n,r={}){let i=ft(e);if(!i)throw Error(`Definition for route "${t}" has no layout to expand`);if(i.type===`AppShell`)return vt(i);let a=n??(typeof i.title==`string`?i.title:t),o=it(i);return{commands:[{targetComponentId:ut,type:`SetWindowTitle`,data:a}],messages:[],fragments:[{targetComponentId:ut,component:ht(e,o,r),data:void 0,state:void 0,action:Xe.Replace,containerId:void 0}],banners:[],appendBanners:!1,appData:void 0,appState:void 0}}function mt(e){return e.ref?{ref:e.ref}:Object.fromEntries(Object.entries(e).filter(([,e])=>e!=null))}function ht(e,t,n){let r=[...e.actions??[]],i=[...e.triggers??[]];if(n.data&&(n.data.ref||n.data.url)&&(r.push({id:`__restdata__`,restAction:{source:mt(n.data),resultPath:``}}),i.push({type:`OnLoad`,actionId:`__restdata__`,times:1})),!r.length&&!i.length)return t;let a=n.path??``;return{type:j.ServerSide,id:`page_`+(a||`root`).replace(/[^A-Za-z0-9_-]/g,`_`),serverSideType:void 0,route:`/`+a,initialData:{},actions:r,triggers:i,rules:[],validations:[],children:[t]}}function gt(e){let t=`/`+(typeof e.route==`string`&&e.route?e.route:typeof e.path==`string`?e.path:``).replace(/^\/+/,``),n=e.submenu??e.submenus??e.menu;return{label:e.label,icon:e.icon,path:t,route:t,consumedRoute:``,uriPrefix:``,visible:!e.hidden,selected:!1,disabled:!1,separator:e.type===`MenuSeparator`,remote:!1,rules:[],submenus:Array.isArray(n)?n.map(gt):[]}}function _t(e){for(let t of e){if(t.type===`RouteLink`&&(t.route||t.path))return t.route??t.path;let e=t.submenu??t.submenus??t.menu;if(Array.isArray(e)){let t=_t(e);if(t)return t}}}function vt(e){let t=e.menu??[];return{commands:[{targetComponentId:ut,type:`SetWindowTitle`,data:e.title??``}],messages:[],fragments:[{targetComponentId:ut,component:{type:j.ClientSide,id:`app`,metadata:{type:`App`,route:``,rootRoute:``,variant:e.variant??`MENU_ON_TOP`,layout:`SINGLE_SLOT`,title:e.title,subtitle:e.subtitle,logo:e.logo,favicon:e.favicon,themeToggle:!!e.themeToggle,accentColor:typeof e.accentColor==`string`&&e.accentColor.trim()?e.accentColor.trim():void 0,menu:t.map(gt),totalMenuOptions:t.length,homeRoute:_t(t)??``,homeConsumedRoute:``,homeBaseUrl:``,apps:[],fabs:[],contextSelectors:[],contextActions:[]},children:[]},data:void 0,state:void 0,action:Xe.Replace,containerId:void 0}],banners:[],appendBanners:!1,appData:void 0,appState:void 0}}var yt,bt=new Map,xt=[],St,Ct=[],wt=[],Tt={},Et=e=>e.split(`/`).filter(e=>e.startsWith(`:`)&&e.length>1).map(e=>e.substring(1)),Dt=e=>{let t=e=>e.replace(/^\/+/,``).replace(/\/+$/,``),n=t(e===`_no_route`?``:e),r=n===``?[]:n.split(`/`),i;for(let e of Ct){let n=t(e.route??``),a=n===``?[]:n.split(`/`);if(a.length!==r.length)continue;let o={},s=!0;for(let e=0;e<a.length;e++){let t=a[e];if(t.startsWith(`:`)&&t.length>1)o[t.substring(1)]=r[e];else if(t!==r[e]){s=!1;break}}if(!s)continue;let c={entry:e,pathParams:o};(!i||Et(n).length<Et(t(i.entry.route??``)).length)&&(i=c)}return i},Ot=(e,t)=>{let n=Dt(e);if(!n)return t;let{entry:r,pathParams:i}=n,a=r.defaultParams??{},o=r.fixedParams??{};return!Object.keys(a).length&&!Object.keys(o).length&&!Object.keys(i).length?t:{...t,fragments:(t.fragments??[]).map(e=>({...e,state:{...a,...e.state??{},...i,...o},data:{...a,...e.data??{},...i,...o}}))}},kt=e=>{let t=e&&e.startsWith(`/`)?e.substring(1):e??``;return t===``?`_no_route`:t};function At(e,t=fetch){return St=(async()=>{try{let n=await t(e);if(!n.ok)return;let r=await n.json(),i=new Map,a=new Map,o=[];for(let e of r.entries??[])if(!(!e.ok||!e.json))try{let t=JSON.parse(e.json),n=e.contentJson?JSON.parse(e.contentJson):void 0;e.routePattern?o.push({regex:new RegExp(e.routePattern),paramNames:e.paramNames??[],increment:t,content:n}):(i.set(e.syncPath,t),n&&a.set(e.syncPath,n))}catch(t){console.warn(`mateu: bundle entry parse failed for`,e.syncPath,t)}yt=i,bt=a,xt=o,Ct=r.routes?.routes??[],Tt=r.definitions??{},wt=r.sources?.sources??[],xe(r.sources?.sources)}catch(e){console.warn(`mateu: bundle manifest load failed`,e)}})(),St}var jt=()=>St??Promise.resolve(),Mt=()=>yt!==void 0&&yt.size>0||xt.length>0||Object.keys(Tt).length>0,Nt=e=>{let t=yt?.get(e);return t===void 0?void 0:Ot(e,t)},Pt=(e,t=!1)=>{for(let n of xt){let r=n.regex.exec(e);if(!r)continue;let i=t?n.content:n.increment;if(!i)return;let a={};return n.paramNames.forEach((e,t)=>{a[e]=r[t+1]}),Ot(e,{...i,fragments:(i.fragments??[]).map(e=>({...e,component:Ft(e.component,a),state:{...e.state??{},...a},data:{...e.data??{},...a}}))})}},Ft=(e,t)=>{let n=e;return!n||!n.initialData||typeof n.initialData!=`object`?e:{...n,initialData:{...n.initialData,...t}}},It=e=>{let t=Dt(e),n=t?.entry.definition;if(!n)return;let r=Tt[n];if(!r||!dt(r))return;let i=pt(r,t.entry.route,void 0,{data:t.entry.data??void 0,path:e===`_no_route`?``:e});return Ot(e,{...i,fragments:(i.fragments??[]).map(e=>{let t=Lt({fragments:[e]}),n=t?{...e.component,metadata:{...t,restSources:wt}}:e.component;return{...e,component:n,targetComponentId:void 0}})})},Lt=e=>{let t=e?.fragments?.[0]?.component;return t?.metadata?.type===`App`?t.metadata:void 0},Rt=(e,t)=>{if(t===`_no_route`)return e;let[n,...r]=e.fragments??[],i=n.component;return{...e,fragments:[{...n,component:{...i,metadata:{...i.metadata,homeRoute:`/`+t}}},...r]}},zt=(e,t)=>{let n=t===void 0||t===`_empty`,r=()=>Nt(e)??Pt(e)??It(e);if(n){let t=r();if(t&&Lt(t))return Rt(t,e);if(e!==`_no_route`&&(Dt(e)||!t)){let t=Nt(`_no_route`)??It(`_no_route`);if(t&&Lt(t))return Rt(t,e)}return t}let i=bt.get(e)===void 0?Pt(e,!0):Ot(e,bt.get(e));if(i)return i;let a=r();return a&&Lt(a)?void 0:a},Bt={en:{chat:`Assistant`,openChat:`Open the assistant`,closeChat:`Close the assistant`,darkMode:`Switch to dark mode`,lightMode:`Switch to light mode`,expandChat:`Expand`,collapseChat:`Restore size`,chatEmpty:`Ask whatever you need: about this screen, your data or how to do something.`,chatPlaceholder:`Write a message…`,send:`Send`,sections:`Sections`,confirmTitle:`One moment, please`,confirmMessage:`Are you sure?`,confirmYes:`Yes`,confirmNo:`No`,forbidden:`You are not allowed to do this.`,notFound:`Not found`,notFoundMessage:`It may have been deleted, or the link is wrong.`,goBack:`Go back`},es:{chat:`Asistente`,openChat:`Abrir el asistente`,closeChat:`Cerrar el asistente`,darkMode:`Cambiar a modo oscuro`,lightMode:`Cambiar a modo claro`,expandChat:`Ampliar`,collapseChat:`Tamaño normal`,chatEmpty:`Pregunta lo que necesites: sobre esta pantalla, tus datos o cómo hacer algo.`,chatPlaceholder:`Escribe un mensaje…`,send:`Enviar`,sections:`Secciones`,confirmTitle:`Un momento`,confirmMessage:`¿Seguro?`,confirmYes:`Sí`,confirmNo:`No`,forbidden:`No tienes permiso para esta acción.`,notFound:`No encontrado`,notFoundMessage:`Puede que se haya borrado o que el enlace no sea correcto.`,goBack:`Volver`}},Vt=e=>(e||typeof document<`u`&&document.documentElement?.lang||typeof navigator<`u`&&navigator.language||``).toLowerCase().startsWith(`es`)?`es`:`en`,Ht=(e,t)=>Bt[Vt(t)][e],Ut={offline:()=>`No connection. Your changes have not been sent — check your network and try again.`,timeout:()=>`The server is taking too long to answer. Your changes may not have been saved.`,server:e=>`The server could not complete the request${e?` (error ${e})`:``}. Please try again.`,unauthorized:()=>`Your session is no longer valid. Please sign in again.`,forbidden:()=>Ht(`forbidden`),notFound:()=>`This is no longer available. It may have been moved or deleted.`,client:e=>`The request was rejected${e?` (error ${e})`:``}.`,cancelled:()=>``,unknown:()=>`Something went wrong. Please try again.`},Wt=new Set([`offline`,`timeout`,`server`]),Gt=(e,t={})=>{let n=e??{},r=n.response?.status,i=n.code,a=t.online??(typeof navigator<`u`&&typeof navigator.onLine==`boolean`?navigator.onLine:!0),o=e=>({kind:e,message:Ut[e](r),retryable:Wt.has(e),status:r});return i===`ERR_CANCELED`?o(`cancelled`):i===`ECONNABORTED`||i===`ETIMEDOUT`||/timeout/i.test(n.message??``)?o(`timeout`):r===void 0?!a||i===`ERR_NETWORK`||/network error/i.test(n.message??``)?o(`offline`):o(`unknown`):o(r===401?`unauthorized`:r===403?`forbidden`:r===404||r===410?`notFound`:r===408||r===429?`timeout`:r>=500?`server`:r>=400?`client`:`unknown`)},Kt=e=>e.kind!==`forbidden`,qt=new Set([``,`__load__`,`search`,`_globalsearch`,`_notifications-list`]),Jt=[`_appcontext-search-`,`search-`],Yt=(e,t)=>t===!0?!0:e==null?!1:qt.has(e)?!0:Jt.some(t=>e.startsWith(t)),Xt=(e,t=Math.random)=>{let n=300*3**Math.max(0,e-1);return Math.round(n*(.75+t()*.5))},Zt=(e,t,n)=>!n.idempotent||t>2||!e.retryable?!1:e.kind===`timeout`||e.kind===`server`,Qt=new class{constructor(){this.linkUp=!0,this.listeners=new Set,this.waiters=new Set,this.started=!1}start(){this.started||typeof window>`u`||(this.started=!0,this.linkUp=typeof navigator<`u`&&typeof navigator.onLine==`boolean`?navigator.onLine:!0,window.addEventListener(`online`,()=>{this.linkUp=!0,this.reachable=void 0,this.changed(),this.releaseWaiters()}),window.addEventListener(`offline`,()=>{this.linkUp=!1,this.changed()}))}isOnline(){return this.linkUp?this.reachable!==!1:!1}noteReachable(){let e=this.isOnline();this.reachable=!0,e||(this.changed(),this.releaseWaiters())}noteUnreachable(){let e=this.isOnline();this.reachable=!1,e&&this.changed()}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}whenBack(e){return this.isOnline()?(e(),()=>{}):(this.waiters.add(e),()=>this.waiters.delete(e))}reset(){this.linkUp=!0,this.reachable=void 0,this.waiters.clear()}changed(){let e=this.isOnline();this.listeners.forEach(t=>t(e))}releaseWaiters(){let e=Array.from(this.waiters);this.waiters.clear(),e.forEach(e=>e())}};Qt.start();var $t=`/mateu/v3/client-log`,en={message:1e3,detail:1e3,stack:4e3,url:1e3,pageUrl:1e3,source:500,route:500,actionId:200,userAgent:300},tn=14e3,nn=/^(code|state|session_state|token|access_token|id_token|refresh_token|auth|password)$/i,rn=(e,t)=>{if(e==null)return;let n=String(e);return n.length>t?n.slice(0,t)+`…`:n},an=e=>{try{return decodeURIComponent(e)}catch{return e}},on=e=>{if(!e)return e;let t=String(e).split(`#`)[0],n=t.indexOf(`?`);if(n<0)return t;let r=t.slice(n+1).split(`&`).map(e=>{let t=e.indexOf(`=`),n=t<0?e:e.slice(0,t);return nn.test(an(n))?`${n}=***`:e});return t.slice(0,n+1)+r.join(`&`)},sn=e=>{if(!e)return;let t=/\/mateu\/v3\/(?:sync|sse)\/([^?#]*)/.exec(e);if(t)return t[1]===`_no_route`?``:`/`+t[1]},cn=e=>!(e==null||e===0||e===204||e===401||e===403||e===413||e===429||e>=502),ln=(e,t)=>{let n=e??``;return/^https?:\/\//i.test(n)&&(!t||n.indexOf(t)!==0)?null:n.replace(/\/+$/,``)+$t},un=e=>{let t=e.renderer??`vaadin`,n=e.now??(()=>Date.now()),r=e.schedule??((e,t)=>setTimeout(e,t)),i=e.cancel??(e=>clearTimeout(e)),a=e.dedupeWindowMs??6e4,o=e.batchDelayMs??2e3,s=e.maxPerMinute??20,c=e.endpoint??(()=>`/mateu/v3/client-log`),l=new Map,u=[],d=0,f=!1,p=null,m=1/0,h=e=>[e.kind,e.status,e.message,e.url,e.actionId,(e.stack??``).split(`
`)[0]].join(`|`),g=e=>{let t=n()+Math.max(0,e);p!==null&&t>=m||(p!==null&&i(p),m=t,p=r(()=>{p=null,m=1/0,y(!1)},Math.max(0,e)))},_=e=>{try{if(f||!e||e.kind===`cancelled`)return;let t=e.url?String(e.url):void 0;if(t&&t.indexOf(`/mateu/v3/client-log`)>=0||/ResizeObserver loop/i.test(e.message??``))return;let r=n(),i={level:`error`,kind:e.kind??`unknown`,message:rn(e.message,en.message),detail:rn(e.detail,en.detail),status:typeof e.status==`number`?e.status:void 0,url:rn(on(t),en.url),route:rn(e.route===void 0?sn(t):e.route,en.route),actionId:rn(e.actionId,en.actionId),source:rn(e.source,en.source),traceparent:e.traceparent,stack:rn(e.stack,en.stack)},s=h(i),c=l.get(s);if(c&&r-c.windowStart<a){c.pending===0&&(c.pendingFirstAt=r),c.pending++,c.lastAt=r,g(c.windowStart+a-r);return}l.set(s,{report:i,windowStart:r,pending:1,pendingFirstAt:r,lastAt:r,sent:!1}),g(o)}catch{}},v=e=>{let t=n(),r=[];for(let[n,i]of l){let o=t-i.windowStart>=a;i.pending>0&&(!i.sent||o||e)&&(r.push({...i.report,count:i.pending,firstAt:new Date(i.pendingFirstAt).toISOString(),lastAt:new Date(i.lastAt).toISOString()}),i.pending=0,i.sent=!0),o&&i.pending===0&&l.delete(n)}return r},ee=e=>{let t=n();u=u.filter(e=>t-e<6e4);let r=d,i=[];for(let n of e){if(u.length>=s){d++;continue}u.push(t),i.push(n)}return i.length&&r&&(i[0].dropped=r,d-=r),i},te=e=>{let t=[],n=[],r=2;for(let i of e){let e=JSON.stringify(i).length+1;n.length&&r+e>tn&&(t.push(n),n=[],r=2),n.push(i),r+=e}return n.length&&t.push(n),t},y=(r=!1)=>{try{if(f)return;let i=c();if(!i)return;let o={renderer:t,userAgent:rn(e.userAgent,en.userAgent),pageUrl:rn(on(e.pageUrl?.()),en.pageUrl)},s=ee(v(r)).map(e=>JSON.parse(JSON.stringify({...o,...e})));for(let t of te(s)){let n;try{n=e.send(i,JSON.stringify(t),{final:r})}catch{n=void 0}Promise.resolve(n).then(e=>{cn(e)&&(f=!0)},()=>{})}let u=1/0;for(let e of l.values())e.pending>0&&(u=Math.min(u,e.windowStart+a));u!==1/0&&!r&&g(u-n())}catch{}};return{report:_,flush:y,isDisabled:()=>f,pendingCount:()=>l.size}},dn=(e=()=>({}))=>(t,n,{final:r})=>{let i=e()??{},a=Object.keys(i).length>0;if(r&&!a&&typeof navigator<`u`&&typeof navigator.sendBeacon==`function`)try{return navigator.sendBeacon(t,new Blob([n],{type:`application/json`})),Promise.resolve(void 0)}catch{}return typeof fetch>`u`?Promise.resolve(void 0):fetch(t,{method:`POST`,keepalive:!0,credentials:`same-origin`,headers:{"Content-Type":`application/json`,...i},body:n}).then(e=>e.status,()=>void 0)},fn=()=>{try{let e=typeof localStorage<`u`?localStorage.getItem(`__mateu_auth_token`):null;return e?{Authorization:`Bearer `+e}:{}}catch{return{}}},pn=(e,t,n)=>{let r=t??{},i=!!r.config||!!r.response,a=r.config?.headers?.traceparent;return{kind:e.kind,message:e.message,status:e.status??r.response?.status,detail:typeof t==`string`?t:r.message,url:r.config?.url,actionId:n,traceparent:typeof a==`string`?a:void 0,stack:i?void 0:r.stack}},mn=null,hn=e=>{mn?.report(e)},gn=e=>{if(mn||typeof window>`u`)return mn;let t=window.location?.origin,n=un({renderer:`vaadin`,endpoint:()=>ln(e,t),send:dn(fn),userAgent:typeof navigator<`u`?navigator.userAgent:void 0,pageUrl:()=>window.location?.href});return mn=n,window.addEventListener(`error`,e=>{if(!e||!e.error&&!e.message)return;let t=e.error;n.report({kind:`js-error`,message:e.message||t?.message,stack:t?.stack,source:e.filename?`${e.filename}:${e.lineno??0}:${e.colno??0}`:void 0})}),window.addEventListener(`unhandledrejection`,e=>{let t=e?.reason;if(t?.__mateuReported||t?.code===`ERR_CANCELED`||t?.name===`AbortError`)return;let r=t?.message;if(!r)try{r=typeof t==`string`?t:JSON.stringify(t)}catch{r=String(t)}n.report({kind:`unhandled-rejection`,message:r,stack:t?.stack})}),window.addEventListener(`pagehide`,()=>n.flush(!0)),n},_n=(e,t)=>`${e??``}|${t??``}`,vn=(e,t,n)=>!n||e===void 0||e===t,yn=(e,t)=>{let n=e.generation,r=e.callbackToken,i=e.connected;return()=>e.generation!==n||t&&e.callbackToken!==r||i&&!e.connected},bn=class extends Error{constructor(e,t){super(`response to '${e}' arrived for a view no longer on screen`),this.actionId=e,this.outcome=t,this.__mateuStale=!0,this.__mateuReported=!0,this.code=`ERR_CANCELED`}},xn=e=>!!e&&typeof e==`object`&&e.__mateuStale===!0,Sn=[],Cn=6e4,wn=e=>new Promise(t=>setTimeout(t,e)),Tn=new class{constructor(){this.axiosInstance=ce.create({timeout:Cn}),this.axiosInstance.interceptors.request.use(e=>(this.addAuthToken(e),this.addSessionId(e),e)),this.axiosInstance.interceptors.response.use(e=>{let t=Je({requestedUrl:this.axiosInstance.getUri(e.config),finalUrl:e.request?.responseURL,contentType:String(e.headers?.[`content-type`]??``),data:e.data});if(t)throw window.location.assign(t),Object.assign(Error(`session lost — redirecting to `+t),{code:`ERR_CANCELED`});return e},e=>{let t=e;if(t?.response?.status===401&&t.config&&!t.config.__mateuRetried&&!t.config.__mateuIsStale?.()){let n=t.config;return n.__mateuRetried=!0,Ke(e,()=>this.axiosInstance.request(n))}throw e})}addSessionId(e){let t=sessionStorage.getItem(`__mateu_sesion_id`);t||(t=de(),sessionStorage.setItem(`__mateu_sesion_id`,t)),e.headers[`X-Session-Id`]=t}addAuthToken(e){let t=localStorage.getItem(`__mateu_auth_token`);t&&(e.headers.Authorization=`Bearer `+t)}async wrap(e,t,n,r,i,a=!1,o){n||t.dispatchEvent(new CustomEvent(`backend-called-event`,{bubbles:!0,composed:!0,detail:{}}));let s=e=>{throw t.dispatchEvent(new CustomEvent(`backend-cancelled-event`,{bubbles:!0,composed:!0,detail:{actionId:r}})),new bn(r,e)};return e().then(e=>(o?.()&&s(`answered`),t.dispatchEvent(new CustomEvent(`backend-succeeded-event`,{bubbles:!0,composed:!0,detail:{actionId:r}})),e),e=>{o?.()&&s(`failed`);let n=Gt(e,{online:Qt.isOnline()});throw a||(n.kind==`cancelled`?t.dispatchEvent(new CustomEvent(`backend-cancelled-event`,{bubbles:!0,composed:!0,detail:{actionId:r}})):(e&&typeof e==`object`&&(e.__mateuReported=!0),t.dispatchEvent(new CustomEvent(`backend-failed-event`,{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(e),failure:n,retry:i}})))),e})}async sendWithRetry(e,t,n=!1,r){let i=0;for(;;)try{let t=await e();return n||Qt.noteReachable(),t}catch(e){let a=Gt(e,{online:Qt.isOnline()});if(a.kind==`offline`&&!n&&Qt.noteUnreachable(),i++,r?.()||!Zt(a,i,{idempotent:t}))throw e;await wn(Xt(i))}}serialize(e){return e?.message?e:JSON.stringify(e)}release(e){Sn=Sn.filter(t=>t!==e)}async get(e){let t=new AbortController;return Sn=[...Sn,t],this.axiosInstance.get(e,{signal:t.signal}).finally(()=>this.release(t))}async post(e,t,n,r){let i=new AbortController;return Sn=[...Sn,i],this.axiosInstance.post(e,t,{signal:i.signal,...r?{__mateuIsStale:r}:{},...n&&n>0?{timeout:n}:{}}).finally(()=>this.release(i))}async abortAll(){Sn.forEach(e=>e.abort()),Sn=[]}async runAction(e,t,n,r,i,a,o,s,c,l,u,d={}){if(t&&t.startsWith(`/`)&&(t=t.substring(1)),r===``&&(await jt(),Mt())){let e=zt(kt(t),n);if(e){let t={...e,fragments:(e.fragments??[]).map(e=>e.targetComponentId?e:{...e,targetComponentId:i})};return await this.wrap(()=>Promise.resolve(t),l,u,r,d.retry,!1,d.isStale)}}let f=[e,t,n,o??``,r,i].join(``),p=Ye.check(f);if(p.blocked)return await this.abortAll(),p.firstTrip&&(console.error(`[mateu] request loop detected — aborting repeated request`,f),hn({kind:`request-loop`,message:`A repeating request was detected and stopped`,url:e+`/mateu/v3/sync/`+(t||`_no_route`),actionId:r})),{messages:p.firstTrip?[{title:``,text:`A repeating request was detected and stopped to protect the server. Reload the page or navigate elsewhere.`,position:`bottom-end`,variant:`error`,duration:6e3}]:[],commands:[],fragments:[],banners:[],appendBanners:!1,appData:void 0,appState:void 0};a={...Be(),...a};let m=e+`/mateu/v3/sync/`+(t&&t!=``?t:`_no_route`),h={serverSideType:o,appState:a,componentState:s,parameters:c,initiatorComponentId:i,consumedRoute:n,route:t&&t!=``?`/`+t:``,actionId:r,knownStructureHash:d.knownStructureHash},g=Yt(r,d.idempotent),_=()=>this.post(m,h,d.timeoutMillis,d.isStale).then(e=>e.data);return await this.wrap(()=>this.sendWithRetry(_,g,d.quiet,d.isStale),l,u,r,d.retry,d.quiet,d.isStale)}},En=e=>{let t=(e??``).trim(),n=t.search(/[?#]/);for(n>=0&&(t=t.slice(0,n)),t&&!t.startsWith(`/`)&&(t=`/`+t);t.length>1&&t.endsWith(`/`);)t=t.slice(0,-1);return t},Dn=e=>{let t=e??``,n;do n=t,t=t.replace(/<[^<>]*>/g,``);while(t!==n);return t.replace(/[<>]/g,``).replace(/\s+/g,` `).trim()},On=(e,t)=>!!e&&e!==`/`&&(t===e||t.startsWith(e+`/`)),kn=e=>!!e&&!!e.remote,An=e=>kn(e)?En(e.routePrefix||e.path||e.route):``,jn=(e,t)=>{if(!e||e.separator)return-1;let n=En(t);if(kn(e)){let t=An(e);return On(t,n)?t.length:-1}let r=-1,i=En(e.route);On(i,n)&&(r=i.length);for(let t of e.submenus??[])r=Math.max(r,jn(t,n));return r},Mn=(e,t)=>jn(e,t)>=0;function Nn(e,t){let n=NaN,r=-1;return(e??[]).forEach((e,i)=>{let a=jn(e,t);a>r&&(r=a,n=i)}),n}function Pn(e,t){let n=En(t),r,i=Fn(e),a=(e,t,n)=>{(!r||e.length>r.route.length||e.length===r.route.length&&r.pending&&!n)&&(r={crumbs:t,route:e,pending:n})},o=(e,t)=>{for(let r of e??[]){if(!r||r.separator)continue;let e=Dn(r.label);if(kn(r)){let i=An(r);On(i,n)&&a(i,[...t,{text:e}],!0);continue}let s=En(r.route),c=r.submenus??[];if(c.length>0){o(c,[...t,s&&s!==`/`&&i.has(s)?{text:e,route:s}:{text:e}]);continue}On(s,n)&&a(s,[...t,{text:e,route:s}],!1)}};return o(e,[]),r?{crumbs:r.crumbs,matched:r.route,...r.pending?{pending:!0}:{}}:{crumbs:[]}}function Fn(e){let t=new Set,n=e=>{for(let r of e??[]){if(!r||r.separator||kn(r))continue;let e=r.submenus??[];if(e.length>0){n(e);continue}let i=En(r.route);i&&i!==`/`&&t.add(i)}};return n(e),t}function In(e,t){let n=En(t),r,i=e=>{for(let t of e??[]){if(!t||t.separator||kn(t))continue;let e=t.submenus??[];if(e.length>0){i(e);continue}let a=En(t.route);On(a,n)&&(!r||a.length>r.route.length)&&(r={option:t,route:a})}};return i(e),r?.option}var Ln=(e,t)=>{let n=!1,r=e.map(e=>{if(kn(e)){let r=t(e);return r!==e&&(n=!0),r}if(e.submenus&&e.submenus.length>0){let r=Ln(e.submenus,t);if(r!==e.submenus)return n=!0,{...e,submenus:r}}return e});return n?r:e};function Rn(e,t,n){let r=En(n);if(!t||!r||r===`/`)return e;let i=`/`+r.split(`/`)[1];return Ln(e,e=>e.baseUrl===t&&!On(An(e),r)?{...e,routePrefix:i}:e)}function zn(e,t){let n=t||typeof document<`u`&&document.documentElement?.lang||typeof navigator<`u`&&navigator.language||``,r=Dn(e);return n.toLowerCase().startsWith(`es`)?`${r} no está disponible ahora. Se volverá a intentar.`:`${r} is not available right now. It will be retried.`}var Bn=e=>e.map(e=>({...e,visible:!1,...e.submenus&&e.submenus.length>0?{submenus:Bn(e.submenus)}:{}})),Vn=(e,t,n)=>{let r=t.serverSideType&&t.serverSideType!==``?t.serverSideType:n.serverSideType;return e.map(e=>e.baseUrl?e:e.submenus&&e.submenus.length>0?{...e,submenus:Vn(e.submenus,t,n)}:{...e,consumedRoute:n.route??``,baseUrl:t.baseUrl,serverSideType:r,uriPrefix:t.route})};function Hn(e,t,n,r={},i=0){let a=[];for(let o of e)if(kn(o)){let e=t.get(o);if(!e)a.push(o);else if(`failed`in e)a.push({...o,unavailable:!0,disabled:!0,description:zn(o.label,n)});else{let t=Vn(e.app.menu??[],o,e.app),n=t.length===1&&(t[0].submenus?.length??0)>0;r.sections&&i===0&&!n&&t.length>0?t=[Un(o,t)]:o.shellLabel&&o.label&&t.length===1&&(t=[{...t[0],label:o.label,icon:o.icon||t[0].icon}]),a.push(...o.visible===!1?Bn(t):t)}}else o.submenus&&o.submenus.length>0?a.push({...o,submenus:Hn(o.submenus,t,n,r,i+1)}):a.push(o);return a}var Un=(e,t)=>({label:e.label,icon:e.icon,path:e.path,route:``,separator:!1,visible:e.visible,description:void 0,submenus:t});function Wn(e){let t=[];for(let n of e??[])kn(n)?t.push(n):n.submenus&&n.submenus.length>0&&t.push(...Wn(n.submenus));return t}function Gn(e){let t=!1,n=[];for(let r of e){if(r.visible===!1){t=!0;continue}if(r.submenus&&r.submenus.length>0){let e=Gn(r.submenus);if(e!==r.submenus){t=!0,n.push({...r,submenus:e});continue}}n.push(r)}return t?n:e}function Kn(e,t){let n=Nn(e,t);return Number.isNaN(n)?void 0:e[n]}function qn(e){if(!e||e.separator||e.visible===!1||kn(e)||e.unavailable)return;let t=e.submenus??[];if(t.length===0)return e;for(let e of t){let t=qn(e);if(t)return t}}var Jn=new Set;function Yn(e){return Jn.add(e),()=>{Jn.delete(e)}}function Xn(){let e=[...Jn];Jn.clear(),e.forEach(e=>e())}var Zn=new Map,Qn=[`position:absolute`,`width:1px`,`height:1px`,`margin:-1px`,`padding:0`,`overflow:hidden`,`clip:rect(0 0 0 0)`,`clip-path:inset(50%)`,`white-space:nowrap`,`border:0`].join(`;`),$n=e=>{if(typeof document>`u`||!document.body)return;let t=Zn.get(e);return t?.isConnected?t:(t=document.createElement(`div`),t.setAttribute(`aria-live`,e),t.setAttribute(`aria-atomic`,`true`),t.setAttribute(`role`,e===`assertive`?`alert`:`status`),t.setAttribute(`data-mateu-live-region`,e),t.style.cssText=Qn,document.body.appendChild(t),Zn.set(e,t),t)},er=()=>{if(!(typeof document>`u`)){if(!document.body){document.addEventListener(`DOMContentLoaded`,()=>er(),{once:!0});return}$n(`polite`),$n(`assertive`)}},tr=(e,t={})=>{let n=(e??``).trim();if(!n)return;let r=$n(t.politeness??`polite`);if(r){if(r.textContent===n){r.textContent=``,setTimeout(()=>{r.textContent=n},60);return}r.textContent=n}};function nr(e,t){return!t.callbackToken||!e.callbackToken||t.callbackToken===e.callbackToken||t.initiator!=null&&t.initiator!==e}var rr=class e extends S{constructor(...e){super(...e),this.id=``,this.baseUrl=``,this.callbackToken=``,this.createElement=e=>{let t=e.data,n=document.createElement(t.name);for(let e in t.attributes)n.setAttribute(e,t.attributes[e]);for(let e in t.on)n.addEventListener(e,n=>{this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.on[e],parameters:{event:n}},bubbles:!0,composed:!0}))});return n},this.closeModal=()=>{let e=(this.shadowRoot??this).querySelectorAll(`mateu-dialog, mateu-drawer`);if(e&&e.length>0){e[e.length-1].close();return}this.dispatchEvent(new CustomEvent(`close-modal-requested`,{bubbles:!0,composed:!0}))},this.changeFavicon=e=>{let t=document.querySelector(`link[rel="icon"]`);t===null?(t=document.createElement(`link`),t.setAttribute(`rel`,`icon`),t.setAttribute(`href`,e),document.head.appendChild(t)):t.setAttribute(`href`,e)}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=he.subscribe(e=>{if(e.command){let t=e.command;this.id==t.targetComponentId&&this.applyCommand(t)}if(nr(this,e)&&e.fragment){let t=e.fragment;this.id==t.targetComponentId&&(this.applyFragment(t),this.completeMenu(t))}})}completeMenu(e){if(e.component&&e.component.type==j.ClientSide){let t=e.component,n=t.metadata;if(n?.type==M.App){this.pendingMenuRetries?.forEach(e=>e()),this.pendingMenuRetries=new Set;let e=n,r=typeof window<`u`?window.location.pathname:``,i=Rn(e.menu??[],e.homeBaseUrl,r),a=Gn(i);(a!==e.menu||i!==e.menu)&&(t.metadata={...e,menu:a,navMenu:i});let o=Wn(i).filter(t=>t.visible!==!1||Mn(t,r)||!!e.homeBaseUrl&&t.baseUrl===e.homeBaseUrl);o.length>0&&this.askRemotes(t,i,o,new Map,0)}}}static{this.remoteMenuTimeoutMillis=2e4}static{this.remoteRetryDelays=[1e4,3e4,6e4]}askRemotes(t,n,r,i,a){let o=[],s=()=>{let e=Hn(n,i,void 0,{sections:t.metadata.variant===Fe.HAMBURGER_SECTIONS});t.metadata={...t.metadata,menu:Gn(e),navMenu:e},this.requestUpdate()};Promise.allSettled(r.map(t=>Tn.runAction(t.baseUrl,t.route,`_empty`,``,t.baseUrl+`#`+t.route,void 0,void 0,void 0,t.params,this,!0,{quiet:!0,timeoutMillis:e.remoteMenuTimeoutMillis}).then(e=>{let n=this.remoteAppOf(e?.fragments,t);if(!n)throw Error(`no app in the answer of `+t.baseUrl);i.set(t,{app:n}),s()}).catch(()=>{i.set(t,{failed:!0}),o.push(t),s()}))).then(()=>{if(o.length>0){let r=e.remoteRetryDelays[a],s,c=()=>{s!==void 0&&clearTimeout(s),u(),this.pendingMenuRetries?.delete(c)},l=()=>{c(),this.isConnected&&this.askRemotes(t,n,o,i,Math.min(a+1,e.remoteRetryDelays.length))},u=Yn(l);this.pendingMenuRetries?.add(c),r!==void 0&&(s=setTimeout(l,r))}})}remoteAppOf(e,t){let n=(e??[]).find(e=>e?.targetComponentId==t.baseUrl+`#`+t.route);if(n?.component?.type==j.ClientSide){let e=n.component.metadata;if(e?.type==M.App){let t=e;return{menu:t.menu??[],route:t.route,serverSideType:t.serverSideType}}}}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(e){if(e.type==`SetWindowTitle`&&(document.title=e.data,tr(document.title)),e.type==`SetFavicon`&&this.changeFavicon(e.data),e.type==`DispatchEvent`&&this.dispatchNamedEvent(e.data),e.type==`NavigateTo`){let t=e.data;t&&(t.startsWith(`http:`)||t.startsWith(`https:`)?window.open(e.data,`_blank`):window.location.href=e.data)}if(e.type==`PushStateToHistory`){let t=e.data;t!==void 0&&this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:t},bubbles:!0,composed:!0}))}if(e.type==`RunAction`){let t=e.data;if(t&&t.actionId)if(t.targetComponentId){let e={command:{type:`RunAction`,data:{actionId:t.actionId},targetComponentId:t.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:``};setTimeout(()=>he.next(e))}else this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(e.type==`MarkAsDirty`&&this.dispatchEvent(new CustomEvent(`dirty`,{detail:{},bubbles:!0,composed:!0})),e.type==`MarkAsClean`&&this.dispatchEvent(new CustomEvent(`clean`,{detail:{},bubbles:!0,composed:!0})),e.type==`DownloadFile`){let t=e.data;if(t&&t.base64Content){let e=atob(t.base64Content),n=new Uint8Array(e.length);for(let t=0;t<e.length;t++)n[t]=e.charCodeAt(t);let r=new Blob([n],{type:t.mimeType}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t.filename??`export`,a.click(),URL.revokeObjectURL(i)}}if(e.type==`CloseModal`&&(this.closeModal(),this.dispatchNamedEvent(e.data)),e.type==`AddContentToHead`){let t=e.data;if(t&&t.name){if(t.attributes&&t.attributes.id&&document.getElementById(t.attributes.id))return;document.head.appendChild(this.createElement(e))}}if(e.type==`AddContentToBody`){let t=e.data;if(t&&t.name){if(t.attributes&&t.attributes.id&&document.getElementById(t.attributes.id))return;document.body.appendChild(this.createElement(e))}}}dispatchNamedEvent(e){if(e&&e.eventName){let t=this.component,n=t?.emitsName??t?.serverSideType,r=e.payload??e.detail;n&&r&&typeof r==`object`&&(r={...r,__source:n}),this.dispatchEvent(new CustomEvent(e.eventName,{detail:r,bubbles:!0,composed:!0}))}}};A([y()],rr.prototype,`id`,void 0),A([y()],rr.prototype,`baseUrl`,void 0);var ir=class extends rr{applyFragment(e){}manageActionRequestedEvent(e){}};A([y()],ir.prototype,`component`,void 0);var ar=e=>se.sanitize(e,{USE_PROFILES:{html:!0,svg:!0,svgFilters:!0},CUSTOM_ELEMENT_HANDLING:{tagNameCheck:e=>!0,attributeNameCheck:e=>!/^on/i.test(e),allowCustomizedBuiltInElements:!1}}),N=e=>re(e==null?e:ar(String(e))),or=(e,t)=>{let n=e[t];for(let r=t+1;r<e.length;r++){let t=e[r];if(t===`\\`){r++;continue}if(t===n)return r+1}throw SyntaxError(`Unterminated string literal in template expression`)},sr=(e,t)=>{for(let n=t+1;n<e.length;n++){let t=e[n];if(t===`\\`){n++;continue}if(t==="`")return n+1;t===`$`&&e[n+1]===`{`&&(n=cr(e,n+2))}throw SyntaxError(`Unterminated template literal in template expression`)},cr=(e,t)=>{let n=0,r=t;for(;r<e.length;){let t=e[r];if(t===`'`||t===`"`){r=or(e,r);continue}if(t==="`"){r=sr(e,r);continue}if(t===`{`)n++;else if(t===`}`){if(n===0)return r;n--}r++}throw SyntaxError('Unterminated ${ expression in "'+e+`"`)},lr=e=>{let t=[],n=``,r=0;for(;r<e.length;){let i=e[r];if(i===`\\`&&e[r+1]===`\\`){n+=`\\`,r+=2;continue}if(i===`\\`&&e[r+1]===`$`&&e[r+2]===`{`){n+="${",r+=3;continue}if(i===`$`&&e[r+1]===`{`){let i=cr(e,r+2);n&&t.push({lit:n}),n=``,t.push({expr:e.substring(r+2,i)}),r=i+1;continue}n+=i,r++}return n&&t.push({lit:n}),t},ur=500,dr=new Map,fr=(e,t)=>{let n=e.join(`,`)+`\0`+t,r=dr.get(n);return r||(r=Function(...e,`return (`+t+`
)`),dr.size>=ur&&dr.delete(dr.keys().next().value),dr.set(n,r)),r},pr=(e,t)=>fr(Object.keys(t),e)(...Object.values(t)),mr=(e,t)=>{let n=``;for(let r of lr(e))n+=`lit`in r?r.lit:String(pr(r.expr,t)??``);return n},hr=(e,t,n)=>({state:e??{},data:t??{},...n});function P(e,t,n,r){if(!e?.includes("${"))return e;try{return mr(e,hr(t,n,r))}catch(t){return console.warn(`Mateu: could not interpolate "${e}":`,t),e}}var gr=(e,t,n)=>{if(e&&e.indexOf("${")>=0)try{return mr(e,hr(t,n))}catch(e){return e.message}return e},_r=(e,t,n,r,i)=>{if(!e?.includes("${"))return e;let a=hr(t,n,{appState:r??{},appData:i??{}}),o=e;try{o=mr(e,a)}catch(a){o=`when evaluating `+e+` :`+a+`, where data is `+n+` and state is `+t+` and app state is `+r+` and app data is `+i,console.error(a,o,t,n,r,i)}return o},vr=(e,t)=>{for(let n=0;n<e.length;n++){let r=e[n];t===`code`?(r===`'`||r===`"`||r==="`")&&(t=r):r===`\\`?n++:r===t&&(t=`code`)}return t},yr=e=>e.replace(/[\\'"`\n\r\u2028\u2029]|\$\{/g,e=>{switch(e){case`
`:return`\\n`;case`\r`:return`\\r`;case`\u2028`:return`\\u2028`;case`\u2029`:return`\\u2029`;case"${":return"\\${";default:return`\\`+e}}),br=e=>e===null?`null`:e===void 0?`undefined`:typeof e==`number`||typeof e==`boolean`?String(e):typeof e==`bigint`?e+`n`:JSON.stringify(e)??`undefined`,xr=(e,t,n,r,i,a)=>{let o=hr(t,n,{appState:r??{},appData:i??{},...a}),s=``,c=`code`;for(let t of lr(e))if(`lit`in t)s+=t.lit,c=vr(t.lit,c);else{let e=pr(t.expr,o);s+=c===`code`?br(e):yr(String(e))}return Function(...Object.keys(o),`return (`+s+`
)`)(...Object.values(o))},Sr=(e,t,n,r)=>{let i=hr(t,n,r);return Function(...Object.keys(i),`return (${e})`)(...Object.values(i))},Cr=(e,t,n,r)=>mr(e,hr(t,n,r)),wr=`display:inline-flex; align-items:center; justify-content:center; width:2rem; height:2rem; border-radius:50%; background:var(--lumo-contrast-10pct,#e0e0e0); color:var(--lumo-secondary-text-color,#555); font-size:.8rem; font-weight:600; overflow:hidden; flex:none;`,Tr=(e,t)=>t||(typeof e==`string`&&e?e.trim().split(/\s+/).map(e=>e[0]).slice(0,2).join(``).toUpperCase():``),Er=(e,t,n)=>{let r=e.metadata,i=Dr(r.name,t,n);return D`<span style="${wr}${e.style}" class="${e.cssClasses}"
                      title="${i||x}" slot="${e.slot??x}">
        ${r.image?D`<img src="${r.image}" alt="${i}" style="width:100%;height:100%;object-fit:cover;">`:Tr(i,r.abbreviation)}
    </span>`},Dr=(e,t,n)=>typeof e==`string`&&e.includes("${")?P(e,t,n):e,Or=e=>{let t=e.metadata,n=t.avatars??[],r=t.maxItemsVisible&&t.maxItemsVisible>0?t.maxItemsVisible:n.length,i=n.slice(0,r),a=n.length-i.length,o=`margin-left:-0.4rem; border:2px solid var(--lumo-base-color,#fff);`;return D`<span style="display:inline-flex; ${e.style}" class="${e.cssClasses}" slot="${e.slot??x}">
        ${i.map(e=>D`<span style="${wr}${o}" title="${e.name||x}">
            ${e.img?D`<img src="${e.img}" style="width:100%;height:100%;object-fit:cover;">`:Tr(e.name??``,e.abbr)}
        </span>`)}
        ${a>0?D`<span style="${wr}${o}">+${a}</span>`:x}
    </span>`},kr=(e,t,n)=>{let r=e.metadata;return D`<span theme="badge ${r.color} ${r.pill?`pill`:``} ${r.small?`small`:``} ${r.primary?`primary`:``}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??x}">${Dr(r.text,t,n)}</span>`},Ar=(e,t,n,r)=>{let i=Dr(e.text,t,n);if(!i)return x;let a=Dr(e.color,t,n);a==`SUCCESS`&&(a=`success`),a==`ERROR`&&(a=`error`),a==`DANGER`&&(a=`error`),a==`WARNING`&&(a=`warning`),a==`INFO`&&(a=`info`),a==`PRIMARY`&&(a=`primary`),a==`SECONDARY`&&(a=`secondary`),a==`TERTIARY`&&(a=`tertiary`),a==`QUATERNARY`&&(a=`quaternary`),a==`LIGHT`&&(a=`light`),a==`DARK`&&(a=`dark`);let o=e.pill||r?.pill;return D`<span theme="badge ${a} ${o?`pill`:``} ${e.small?`small`:``} ${e.primary?`primary`:``}">${i}</span>`},F=new class{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(e){if(this.componentRenderer=e,typeof window<`u`){let t=e.supportedClientSideTypes?.();window.__mateuRendererInfo={name:e.rendererName?.()??e.constructor?.name??`unknown`,supportedTypes:t?[...t].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(e){this.useShadowRoot=e}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(e){this.afterRenderHook=e}getAfterRenderHook(){return this.afterRenderHook}},jr=(e,t,n,r,i,a,o,s,c)=>(t.slot=s,I(e,t,n,r,i,a,o,c)),I=(e,t,n,r,i,a,o,s)=>{if(!t)return D``;if(t.type==j.ClientSide)return F.get().renderClientSideComponent(e,t,n,r,i,a,o,s);let c=e.route,l=e.consumedRoute;return D`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${l}"
                         baseUrl="${n}"
                         slot="${t.slot??x}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...r}}"
                         .data="${{...i}}"
                         .appState="${a}"
                         .appData="${o}"
        >
       </mateu-component>`},Mr=e=>e===`back`||e===`backToList`||e===`cancel-view`,Nr=e=>!!e&&e.startsWith(`cancel`)&&!Mr(e),Pr=e=>Mr(e)||Nr(e);function Fr(e,t,n,r){if(!e||t==null)return;let i=P(e,n,r,{row:t});if(!(!i||i===e||i.includes("${")))return i}function Ir(e,t){for(let n of[`route-changed`,`navigate-to-requested`])e.dispatchEvent(new CustomEvent(n,{detail:{route:t},bubbles:!0,composed:!0}))}function Lr(e){if(!e)return[];let t=new Set;for(let n of e.matchAll(/\$\{\s*row\.([A-Za-z0-9_]+)/g))t.add(n[1]);return[...t]}var Rr=En,zr=Dn,Br=e=>(e||typeof document<`u`&&document.documentElement?.lang||typeof navigator<`u`&&navigator.language||``).toLowerCase().startsWith(`es`),Vr=new Map;function Hr(e,t,n={}){let{crumbs:r,matched:i,pending:a}=Pn(e,t);if(!i)return[];let o=[...r];if(a){let e=zr(n.title);return e&&e!==o[o.length-1]?.text&&o.push({text:e}),o.length<2?[]:o}let s=Rr(t).slice(i.length).split(`/`).filter(Boolean),c=Br(n.lang);if(s.length>0){let e=decodeURIComponent(s[0]);if(e===`new`||e===`create`)o.push({text:c?`Nuevo`:`New`});else{let t=i+`/`+s[0],r=zr(n.title);s.length===1&&r&&Vr.set(t,r),o.push({text:Vr.get(t)||e,route:t}),s[1]===`edit`?o.push({text:c?`Editar`:`Edit`}):s.length>1&&o.push({text:r||decodeURIComponent(s[s.length-1])})}}if(o.length<2)return[];let l=o[o.length-1];return o[o.length-1]={text:l.text},o}var Ur,Wr=!1,Gr,Kr,qr=new Set;function Jr(e,t,n,r){if(Gr&&Gr!==e&&Gr.isConnected!==!1)return;Gr=e;let i=Ur!==t||Wr!==!!n;Ur=t,Wr=!!n,Kr=r,i&&qr.forEach(e=>e())}function Yr(e){return qr.add(e),()=>{qr.delete(e)}}function Xr(e){if(!Kr)return!1;let t=In(Ur,e);return t?(Kr(t,e),!0):!1}function Zr(e,t){return Wr?[]:Hr(Ur,e,t)}var Qr=new WeakMap,$r=e=>{let t=Qr.get(e);return t===void 0&&(t=typeof window<`u`?window.location.pathname:``,Qr.set(e,t)),t},ei=new class{constructor(){this._dirty=!1,this._installed=!1,this.message=`You have unsaved changes. Are you sure you want to leave this page?`,this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=e=>{this._dirty&&(e.preventDefault(),e.returnValue=``)}}install(){this._installed||(this._installed=!0,document.addEventListener(`dirty`,this._onDirty),document.addEventListener(`clean`,this._onClean),window.addEventListener(`beforeunload`,this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;let e=window.confirm(this.message);return e&&(this._dirty=!1),e}},ti=e=>{let t=[];return e.color&&e.color!==`normal`&&e.color!==`none`&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle===`tertiaryInline`?`tertiary-inline`:e.buttonStyle),e.size&&e.size!==`none`&&e.size!==`normal`&&t.push(e.size),t.length?t.join(` `):void 0},ni=e=>{let t=ti(e)??``,n=[];return t.includes(`primary`)&&n.push(`primary`),t.includes(`tertiary`)&&n.push(`tertiary`),(t.includes(`error`)||e.color===`error`)&&n.push(`danger`),n.join(` `)},ri=class extends S{constructor(...e){super(...e),this.appState={},this.appData={},this._overflowOpen=!1,this._overflowN=0,this._secCount=0,this._onDocClick=e=>{e.composedPath().includes(this)||(this._overflowOpen=!1)},this._resetOverflow=()=>{this._overflowN===0?this.requestUpdate():this._overflowN=0},this.handleButtonClick=e=>{this._overflowOpen=!1;let t=e.route?P(e.route,this.state,this.data):void 0;if(t&&!t.includes("${")){Ir(this,t);return}this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{crud_selected_items:this.listingSelection()}},bubbles:!0,composed:!0}))},this.listingSelection=()=>{let e=this.findSiblingCrud()?.state?.crud_selected_items;return Array.isArray(e)?e:[]},this.findSiblingCrud=()=>{let e=t=>{for(let n of Array.from(t.querySelectorAll(`*`))){if(n.tagName===`MATEU-TABLE-CRUD`)return n;if(n.shadowRoot){let t=e(n.shadowRoot);if(t)return t}}return null},t=this;for(;t;){let n=t,r=n.parentElement??(n.getRootNode?.()instanceof ShadowRoot?n.getRootNode().host:null);if(!r)break;let i=e(r);if(i)return i;t=r}return null},this.evalLabel=e=>P(e,this.state,this.data),this.renderBackChevron=e=>{if((this.data??{})[e.actionId+`.hidden`])return x;let t=this.evalLabel(e.label);return D`
        <button class="back-chevron"
                data-action-id="${e.id}"
                title="${t}"
                aria-label="${t}"
                @click="${()=>this.handleButtonClick(e)}">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>`},this.renderBtn=e=>{if((this.data??{})[e.actionId+`.hidden`])return x;let t=this.evalLabel(e.label);return F.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e))||D`
        <button class="mtb ${ni(e)}"
                data-action-id="${e.id}"
                @click="${()=>this.handleButtonClick(e)}"
                ?disabled="${e.disabled}"
        >${t}</button>
    `},this.renderActions=e=>{let t=e.filter(e=>!(this.data??{})[e.actionId+`.hidden`]),n=t.filter(e=>e.buttonStyle===`primary`),r=t.filter(e=>e.buttonStyle!==`primary`);this._secCount=r.length;let i=Math.max(0,Math.min(this._overflowN,r.length)),a=r.slice(0,r.length-i),o=r.slice(r.length-i);return D`
            <div class="actions-cluster">
                ${n.map(this.renderBtn)}
                ${a.map(this.renderBtn)}
                ${o.length?D`
                    <div class="overflow-wrap">
                        <button class="mtb overflow-btn" title="Más acciones" aria-haspopup="true"
                                aria-expanded="${this._overflowOpen}"
                                @click="${e=>{e.stopPropagation(),this._overflowOpen=!this._overflowOpen}}">⋯</button>
                        ${this._overflowOpen?D`
                            <div class="overflow-menu">
                                ${o.map(e=>D`
                                    <button class="overflow-item" ?disabled="${e.disabled}"
                                            data-action-id="${e.actionId}"
                                            @click="${()=>this.handleButtonClick(e)}">${this.evalLabel(e.label)}</button>
                                `)}
                            </div>
                        `:x}
                    </div>
                `:x}
            </div>
        `},this.renderPeerNav=e=>F.get()?.renderPeerNav?.(e)||D`
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
        `}connectedCallback(){super.connectedCallback(),document.addEventListener(`click`,this._onDocClick),this._ro=new ResizeObserver(()=>this._resetOverflow()),this._ro.observe(this),window.addEventListener(`resize`,this._resetOverflow),this._offShellMenu=Yr(()=>this.requestUpdate())}disconnectedCallback(){this._offShellMenu?.(),this._offShellMenu=void 0,document.removeEventListener(`click`,this._onDocClick),window.removeEventListener(`resize`,this._resetOverflow),this._ro?.disconnect(),this._ro=void 0,super.disconnectedCallback()}updated(e){if(e.has(`_overflowOpen`)&&this._overflowOpen&&this._placeOverflowMenu(),e.has(`metadata`)||e.has(`data`)){this._resetOverflow();return}if(this._inDialog()){this._overflowN!==0&&(this._overflowN=0);return}let t=this.renderRoot.querySelector(`.actions-cluster`);if(!t||this._secCount===0)return;let n=t.closest(`.form-header, .no-header-row`);if(!n)return;let r=t.getBoundingClientRect(),i=n.getBoundingClientRect();(r.top-i.top>8||r.right>i.right+1)&&this._overflowN<this._secCount&&(this._overflowN+=1)}_inDialog(){let e=this;for(;e;){let t=e.tagName;if(t===`VAADIN-DIALOG-OVERLAY`||t===`DIALOG`||e.getAttribute?.(`role`)===`dialog`)return!0;e=e.parentElement??e.getRootNode?.()?.host}return!1}_placeOverflowMenu(){let e=this.renderRoot.querySelector(`.overflow-menu`);e&&(e.classList.remove(`flip`),e.getBoundingClientRect().left<0&&e.classList.add(`flip`))}crumbsOf(e,t){return e?.breadcrumbs&&e.breadcrumbs.length>0?e.breadcrumbs.map(e=>({text:e.text,route:e.link||void 0})):t>0||e?.type!==M.Page||e.noBreadcrumbs?[]:Zr($r(e),{title:e.title,pageType:e.pageType})}goToCrumb(e){if(/^[a-z]+:\/\//i.test(e)){window.location.href=e;return}ei.confirmLeave()&&(Xr(e)||Ir(this,e))}render(){let e=this.metadata;if(!e)return D``;let t=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0,n=e.toolbar??[],r=!e.noHeader,i=n.filter(e=>Pr(e.actionId)&&!(r&&Mr(e.actionId))),a=r?n.filter(e=>Mr(e.actionId)):[],o=n.filter(e=>!Pr(e.actionId)),s=i.length>0&&o.length>0?D`<span class="toolbar-divider"></span>`:x,c=e.overline,l=e.title?void 0:e.titlePlaceholder,u=e.avatar||e.title||e.subtitle||c||l||e.kpis?.length>0||e.header?.length>0||n.length>0||!!t,d=e.level??0;d>0?this.setAttribute(`data-nested`,``):this.removeAttribute(`data-nested`);let f=this.crumbsOf(e,d);return D`
            ${f.length>0?D`
                <nav class="breadcrumbs-bar" aria-label="Breadcrumb">
                    ${f.map((e,t)=>D`
                        ${t>0?D`<span class="breadcrumb-sep" aria-hidden="true">›</span>`:x}
                        ${e.route?D`<button class="breadcrumb-link" @click="${()=>this.goToCrumb(e.route)}">${e.text}</button>`:D`<span class="${t===f.length-1?`breadcrumb-current`:`breadcrumb-group`}"
                                        aria-current="${t===f.length-1?`page`:x}">${e.text}</span>`}
                    `)}
                </nav>
            `:x}
            ${e.noHeader?D`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;" class="no-header-row">
                    ${e?.header?.map(e=>I(this,e,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${t?this.renderPeerNav(t):x}
                    ${i.map(this.renderBtn)}
                    ${s}
                    ${this.renderActions(o)}
                </div>
            `:u?D`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center; flex-wrap: wrap;" class="form-header">
                    ${a.map(this.renderBackChevron)}
                    ${e.avatar?I(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):x}
                    <div style="flex: 1; min-width: min(22rem, 100%); overflow: hidden;">
                        ${c?D`<div class="page-overline">${N(gr(c,this.state??{},this.data??{}))}</div>`:x}
                        ${(e?.title||l)&&d==0?D`
                            <div style="display: flex; align-items: center; gap: var(--lumo-space-s, .5rem); min-width: 0;">
                                <h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${e?.title?N(gr(e?.title,this.state??{},this.data??{})):D`<span class="page-title-placeholder">${N(gr(l,this.state??{},this.data??{}))}</span>`}</h2>
                                ${e.kpisBelow&&e.badges?.length?e.badges.map(e=>Ar(e,this.state??{},this.data??{},{pill:!0})):x}
                            </div>`:x}
                        ${e?.title&&d==1?D`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${N(gr(e?.title,this.state??{},this.data??{}))}</h3>`:x}
                        ${e?.title&&d==2?D`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${N(gr(e?.title,this.state??{},this.data??{}))}</h4>`:x}
                        ${e?.title&&d==3?D`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${N(gr(e?.title,this.state??{},this.data??{}))}</h5>`:x}
                        ${e?.title&&d>3?D`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${N(gr(e?.title,this.state??{},this.data??{}))}</h6>`:x}

                        ${e?.subtitle?D`<span style="display: inline-block; margin-block-end: 0.83em;">${N(gr(e?.subtitle,this.state??{},this.data??{}))}</span>`:x}
                        ${e?.timestamp?D`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${N(gr(e.timestamp,this.state??{},this.data??{}))}</span>`:x}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${e.kpisBelow?x:e?.kpis?.map(e=>D`
                            <div class="header-fact">
                                <span class="header-fact-label">${this.evalLabel(e.title)}</span>
                                <span class="header-fact-value">${N(gr(e.text,this.state??{},this.data??{}))}</span>
                            </div>
                        `)}
                        ${e?.header?.map(e=>I(this,e,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${t?this.renderPeerNav(t):x}
                        ${i.map(this.renderBtn)}
                        ${s}
                        ${this.renderActions(o)}
                    </div>
                </div>
            `:x}
            ${e.kpisBelow&&e?.kpis?.length?D`
                <div class="kpi-row">
                    ${e.kpis.map(e=>D`
                        <div class="kpi-pair">
                            <span class="kpi-label">${this.evalLabel(e.title)}</span>
                            <span class="kpi-value">${N(gr(e.text,this.state??{},this.data??{}))}</span>
                        </div>
                    `)}
                </div>
            `:x}
            ${e.badges&&e.badges.length>0&&!e.kpisBelow?D`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${e.badges.map(e=>Ar(e,this.state??{},this.data??{},{pill:!0}))}
                </div>
            `:x}
        `}static{this.styles=[v`
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

        ${De}
    `,Oe]}};A([y()],ri.prototype,`metadata`,void 0),A([y()],ri.prototype,`baseUrl`,void 0),A([y()],ri.prototype,`state`,void 0),A([y()],ri.prototype,`data`,void 0),A([y()],ri.prototype,`appState`,void 0),A([y()],ri.prototype,`appData`,void 0),A([C()],ri.prototype,`_overflowOpen`,void 0),A([C()],ri.prototype,`_overflowN`,void 0),ri=A([w(`mateu-content-header`)],ri);var ii=class extends ir{constructor(...e){super(...e),this.state={},this.data={},this.appState={},this.appData={}}render(){let e=this.component?.metadata;return D`
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
       `}static{this.styles=v`
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
    `}};A([y()],ii.prototype,`state`,void 0),A([y()],ii.prototype,`data`,void 0),A([y()],ii.prototype,`appState`,void 0),A([y()],ii.prototype,`appData`,void 0),ii=A([w(`mateu-form`)],ii);var ai=e=>{let t=e?.line;return typeof t==`number`&&t>1?Math.floor(t):1};function oi(e,t=e=>e){let n=[],r=new Map;for(let i of e??[]){let e=ai(t(i));e===1?n.push(i):(r.has(e)||r.set(e,[]),r.get(e).push(i))}return{first:n,extra:[...r.keys()].sort((e,t)=>e-t).map(e=>r.get(e))}}function si(e,t=e=>e){let{first:n,extra:r}=oi(e,t);return[...n,...r.flat()]}var ci=class extends S{constructor(...e){super(...e),this.variant=`text`,this.count=3}static{this.styles=v`
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
    `}render(){let e=Array.from({length:Math.max(1,this.count)});return this.variant==`card`?D`${e.map(()=>D`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant==`grid`?D`${e.map(()=>D`<div class="bone row"></div>`)}`:this.variant==`form`?D`${e.map(()=>D`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:D`${e.map(()=>D`<div class="bone line"></div>`)}`}};A([y()],ci.prototype,`variant`,void 0),A([y({type:Number})],ci.prototype,`count`,void 0),ci=A([w(`mateu-skeleton`)],ci);var L=(e,t,n,r)=>{if(!e)return D``;let i=F.get()?.renderIcon;if(i){let a=i.call(F.get(),e,t,n);return r?D`<span slot="${r}">${a}</span>`:a}return D`<span class="mateu-icon ${n??``}" data-icon="${e}" aria-hidden="true"
                      style="display:inline-block; width:1em; height:1em; ${t??``}" slot="${r??x}"></span>`},li=`vaadin:ban`,ui=e=>{let t=e??li;return t.includes(`:`)?F.get()?.renderIcon?L(t,`width: 1.8rem; height: 1.8rem;`):D`${e?x:`🗂`}`:D`${t}`},di=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t},bubbles:!0,composed:!0}))},fi=(e,t,n,r,i,a)=>D`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${ui(t)}</span>
            ${n?D`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${n}</span>`:x}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${r??e??`Nothing here yet.`}</span>
            ${i&&a?D`
                <button style="margin-top: .25rem; font: inherit; font-weight: 500; cursor: pointer; padding: .4rem .9rem; border: none; border-radius: var(--lumo-border-radius-m, 6px); background: transparent; color: var(--lumo-primary-text-color, #3b5bdb);"
                        @click="${e=>di(e,i)}">${a}</button>
            `:x}
        </div>
    `,pi=e=>{let t=e.metadata;return D`
        <div style="${e.style??x}" class="${e.cssClasses??x}" slot="${e.slot??x}">
            ${fi(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},mi=e=>{let t=e.metadata;return D`
        <mateu-skeleton
                variant="${t.variant??`text`}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-skeleton>
    `},hi=`searchText`;function gi(e){if(e==null)return[];let t=Array.isArray(e)?e:String(e).split(`,`),n=[];for(let e of t){if(e==null)continue;let t=String(e).trim();t&&!n.includes(t)&&n.push(t)}return n}var _i={en:{label:`Selection`,many:e=>`${e} selected items`},es:{label:`Selección`,many:e=>`${e} elementos seleccionados`}};function vi(e,t){let n=gi(e);if(!n.length)return;let r=_i[Vt(t)];return{label:r.label,display:n.length<=3?n.join(`, `):r.many(n.length)}}var yi=`mateu-saved-views`,bi=()=>{try{return JSON.parse(localStorage.getItem(yi)??`{}`)}catch{return{}}},xi=e=>{try{localStorage.setItem(yi,JSON.stringify(e))}catch{}},Si=e=>bi()[e]??[],Ci=(e,t)=>{let n=t.name?.trim();if(!n||Object.keys(t.values??{}).length===0)return;let r=bi(),i=(r[e]??[]).filter(e=>e.name!==n);i.push({...t,name:n}),r[e]=i,xi(r)},wi=(e,t)=>{let n=bi(),r=(n[e]??[]).filter(e=>e.name!==t);r.length===0?delete n[e]:n[e]=r,xi(n)},Ti=(e,t)=>{let n=bi();n[e]=(n[e]??[]).map(e=>({...e,isDefault:e.name===t&&!e.isDefault})),xi(n)},Ei=e=>Si(e).find(e=>e.isDefault),R=class extends S{constructor(...e){super(...e),this.baseUrl=``,this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.viewsOpened=!1,this.draftText=``,this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{let e=this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId]);e.push(`ids`);let t={searchText:void 0};e.forEach(e=>{t[e]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent(`filter-reset-requested`,{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return(this.metadata?.filters??[]).filter(e=>!e.readOnly)}get scopeFilters(){return(this.metadata?.filters??[]).filter(e=>e.readOnly)}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent(`search-requested`,{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){let t=this.filters.find(t=>t.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e===`searchText`?``:void 0),this.requestSearch()}commitText(e){this.emitValueChanged(`searchText`,e.value),this.draftText=``,e.value=``,this.requestSearch()}get viewsScope(){return window.location.pathname}allFilterKeys(){return[`searchText`,...this.filters.flatMap(e=>this.isRangeFilter(e)?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])]}snapshotValues(){let e={};return this.state.searchText&&(e.searchText=this.state.searchText),this.filters.forEach(t=>{if(this.isSet(t))if(this.isRangeFilter(t)){let n=this.rangeBound(t,`from`),r=this.rangeBound(t,`to`);n&&(e[`${t.fieldId}_from`]=n),r&&(e[`${t.fieldId}_to`]=r)}else this.isMultiFilter(t)?e[t.fieldId]=this.multiValues(t):e[t.fieldId]=this.state[t.fieldId]}),e}applyView(e){let t=this.allFilterKeys(),n={};t.forEach(e=>{n[e]=void 0}),this.state={...this.state,...n},this.dispatchEvent(new CustomEvent(`filter-reset-requested`,{detail:{fieldIds:t},bubbles:!0,composed:!0})),Object.entries(e.values).forEach(([e,t])=>this.emitValueChanged(e,t)),this.viewsOpened=!1,this.detachOutsideClick(),this.requestSearch()}saveCurrentView(e){let t=e.value.trim();t&&(Ci(this.viewsScope,{name:t,values:this.snapshotValues()}),e.value=``,this.requestUpdate())}firstUpdated(){if(window.location.search)return;let e=Ei(this.viewsScope);e&&setTimeout(()=>{this.state.searchText||this.filters.some(e=>this.isSet(e))||this.applyView(e)},0)}isBooleanFilter(e){return e.dataType===`boolean`||e.dataType===`bool`||e.stereotype===`checkbox`||e.stereotype===`toggle`}isNumericFilter(e){return[`integer`,`decimal`,`number`,`money`].includes(e.dataType??``)}isRangeFilter(e){return e.stereotype===`dateRange`||e.stereotype===`numberRange`}isMultiFilter(e){return e.stereotype===`multiSelect`}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){let t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t==`string`&&t!==``?t.split(`,`).map(e=>e.trim()).filter(e=>e):[]}rangeBound(e,t){let n=this.state[`${e.fieldId}_${t}`];return n==null?``:String(n)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,`from`)!==``||this.rangeBound(e,`to`)!==``;if(this.isMultiFilter(e))return this.multiValues(e).length>0;let t=this.state[e.fieldId];return t!=null&&t!==``&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){let n=e.options.find(e=>e.value===String(t));if(n)return n.label??n.value}return typeof t==`boolean`?t?`Yes`:`No`:String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){let t=this.rangeBound(e,`from`),n=this.rangeBound(e,`to`);return t&&n?`${t} – ${n}`:t?`≥ ${t}`:`≤ ${n}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(`, `):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return P(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,n=`panel-row`){return D`
            <div class="${n}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){let t=e.stereotype===`numberRange`?`number`:e.dataType===`dateTime`?`datetime-local`:e.dataType===`time`?`time`:`date`,n=t=>{let n=t.closest(`.panel-input-row`),r=n.querySelector(`input.range-from`).value,i=n.querySelector(`input.range-to`).value;this.emitValueChanged(`${e.fieldId}_from`,r===``?void 0:r),this.emitValueChanged(`${e.fieldId}_to`,i===``?void 0:i),this.requestSearch()},r=e=>{e.key===`Enter`&&n(e.target),e.key===`Escape`&&this.closePanel()};return D`
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
            </div>`}renderMultiWidget(e){let t=this.multiValues(e),n=n=>{let r=t.includes(n)?t.filter(e=>e!==n):[...t,n];this.emitValueChanged(e.fieldId,r.length>0?r:void 0),this.dispatchEvent(new CustomEvent(`search-requested`,{detail:{},bubbles:!0,composed:!0}))};return D`${(e.options??[]).map(e=>this.panelRow(D`
            <span class="multi-check ${t.includes(e.value)?`multi-check--on`:``}"
                  aria-hidden="true">${t.includes(e.value)?`✓`:``}</span>
            ${e.label??e.value}
        `,()=>n(e.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return D`${e.options.map(t=>this.panelRow(t.label??t.value,()=>this.applyFilter(e.fieldId,t.value)))}`;if(this.isBooleanFilter(e))return D`
                ${this.panelRow(`Yes`,()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow(`No`,()=>this.applyFilter(e.fieldId,!1))}`;let t=this.isNumericFilter(e),n=n=>{n.value!==``&&this.applyFilter(e.fieldId,t?Number(n.value):n.value)};return D`
            <div class="panel-input-row">
                <input type="${t?`number`:`text`}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${e=>e.stopPropagation()}"
                       @keydown="${e=>{e.key===`Enter`&&n(e.target),e.key===`Escape`&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${e=>n(e.target.previousElementSibling)}">Apply</button>
            </div>`}renderViewsPanel(){if(!this.viewsOpened)return x;let e=Si(this.viewsScope),t=!!this.state.searchText||this.filters.some(e=>this.isSet(e));return D`
            <div class="panel views-panel">
                <div class="panel-caption">Saved views</div>
                ${e.length===0?D`
                    <div class="panel-row views-empty">No saved views yet</div>`:x}
                ${e.map(e=>D`
                    <div class="panel-row view-row" @mousedown="${this.keepFocus}">
                        <span class="view-name" @click="${()=>this.applyView(e)}">${e.name}</span>
                        <button class="view-star ${e.isDefault?`view-star--on`:``}"
                                title="${e.isDefault?`Unset as default`:`Open this listing with this view`}"
                                @click="${()=>{Ti(this.viewsScope,e.name),this.requestUpdate()}}">★</button>
                        <button class="chip-remove" aria-label="Delete view ${e.name}"
                                @click="${()=>{wi(this.viewsScope,e.name),this.requestUpdate()}}">✕</button>
                    </div>`)}
                ${t?D`
                    <div class="panel-input-row" @mousedown="${e=>e.stopPropagation()}">
                        <input class="view-name-input" type="text" placeholder="Save current view as…"
                               @keydown="${e=>{e.key===`Enter`&&this.saveCurrentView(e.target),e.key===`Escape`&&(this.viewsOpened=!1)}}"/>
                        <button class="apply-button"
                                @click="${e=>this.saveCurrentView(e.target.previousElementSibling)}">Save</button>
                    </div>`:D`
                    <div class="panel-row views-empty">Apply some filters to save a view</div>`}
            </div>`}renderPanel(){if(!this.panelOpened||this.filters.length===0)return x;if(this.activeFilter){let e=this.activeFilter;return D`
                <div class="panel">
                    <div class="panel-row panel-header"
                         @mousedown="${this.keepFocus}"
                         @click="${()=>{this.activeFilter=void 0}}">
                        <span aria-hidden="true">←</span> ${this.labelOf(e)}
                    </div>
                    ${this.renderActiveFilterWidget(e)}
                </div>`}let e=!!this.state.searchText||this.filters.some(e=>this.isSet(e));return D`
            <div class="panel">
                <div class="panel-caption">Filter by</div>
                ${this.filters.map(e=>this.panelRow(D`
                    ${this.labelOf(e)}
                    ${this.isSet(e)?D`<span class="current-value">${this.conditionDisplay(e)}</span>`:x}
                `,()=>{this.activeFilter=e}))}
                ${e?this.panelRow(`Clear filters`,this.clearAllFilters,`panel-row panel-footer`):x}
            </div>`}render(){let e=[];this.state.searchText&&e.push({fieldId:`searchText`,label:`Text`,display:String(this.state.searchText)});let t=this.filters.some(e=>e.fieldId===`ids`)?void 0:vi(this.state.ids);return t&&e.push({fieldId:`ids`,label:t.label,display:t.display}),this.filters.forEach(t=>{this.isSet(t)&&e.push({fieldId:t.fieldId,label:this.labelOf(t),display:this.conditionDisplay(t)})}),D`
            <div class="smart-search">
                <div class="bar"
                     @click="${e=>{e.currentTarget.querySelector(`input.free-text`)?.focus(),this.openPanel()}}">
                    <svg aria-hidden="true" class="magnifier" width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
                    </svg>
                    ${this.scopeFilters.filter(e=>this.isSet(e)).map(e=>D`
                        <span theme="badge pill" class="chip chip-scope" title="Fixed by the page">
                            <span class="chip-label">${this.labelOf(e)}:</span> ${this.conditionDisplay(e)}
                        </span>`)}
                    ${e.map(e=>D`
                        <span theme="badge contrast pill" class="chip">
                            <span class="chip-label">${e.label}:</span> ${e.display}
                            <button class="chip-remove" aria-label="Remove filter ${e.label}"
                                    @mousedown="${this.keepFocus}"
                                    @click="${t=>{t.stopPropagation(),this.removeChip(e.fieldId)}}">✕</button>
                        </span>`)}
                    ${this.metadata?.searchable===!1?x:D`
                        <input class="free-text" type="text" id="searchText"
                               placeholder="${e.length===0?`Search`:``}"
                               autofocus="${this.metadata?.autoFocusOnSearchText?!0:x}"
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
        `}static{this.styles=v`
        ${De}
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
    `}};A([y()],R.prototype,`metadata`,void 0),A([y()],R.prototype,`baseUrl`,void 0),A([C()],R.prototype,`state`,void 0),A([C()],R.prototype,`data`,void 0),A([y()],R.prototype,`appState`,void 0),A([y()],R.prototype,`appData`,void 0),A([y({type:Boolean})],R.prototype,`searchOnly`,void 0),A([C()],R.prototype,`panelOpened`,void 0),A([C()],R.prototype,`viewsOpened`,void 0),A([C()],R.prototype,`activeFilter`,void 0),A([C()],R.prototype,`draftText`,void 0),R=A([w(`mateu-filter-bar`)],R);var Di=`mateu-column-prefs`,Oi=()=>{try{let e=JSON.parse(localStorage.getItem(Di)??`{}`);return e&&typeof e==`object`&&!Array.isArray(e)?e:{}}catch{return{}}},ki=e=>{try{localStorage.setItem(Di,JSON.stringify(e))}catch{}},Ai=e=>{if(!e||typeof e!=`object`)return;let t=e=>Array.isArray(e)?e.filter(e=>typeof e==`string`):[];return{hidden:t(e.hidden),order:t(e.order)}},ji=e=>Ai(Oi()[e]),Mi=(e,t)=>{let n=Oi(),r=Ai(t);r.hidden.length===0&&r.order.length===0?delete n[e]:n[e]=r,ki(n)},Ni=e=>{let t=Oi();delete t[e],ki(t)},Pi=e=>e?!!e.identifier||e.dataType===`action`||e.dataType===`actionGroup`||e.dataType===`menu`||e.id===`select`||e.id===`menu`:!1,Fi=(e,t,n=e=>e)=>{let r=Ai(t);if(!r||r.hidden.length===0&&r.order.length===0)return e;let i=e=>n(e)?.id??e.id,a=new Set(r.hidden),o=e.filter(e=>{let t=i(e);return!t||!a.has(t)||Pi(n(e))});if(r.order.length===0)return o.length===e.length?e:o;let s=new Map;o.forEach(e=>{let t=i(e);t&&!s.has(t)&&s.set(t,e)});let c=[],l=new Set;return r.order.forEach(e=>{let t=s.get(e);t&&!l.has(t)&&(c.push(t),l.add(t))}),o.forEach(e=>{l.has(e)||(c.push(e),l.add(e))}),c.length===e.length&&c.every((t,n)=>t===e[n])?e:c},Ii=class extends S{constructor(...e){super(...e),this.columns=[],this.scope=``,this.panelOpened=!1,this.revision=0,this.togglePanel=()=>{if(this.panelOpened){this.closePanel();return}this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick)},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1},this.reset=()=>{Ni(this.scope),this.revision++,this.dispatchEvent(new CustomEvent(`column-prefs-changed`,{bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}get prefs(){return ji(this.scope)??{hidden:[],order:[]}}effectiveEntries(e){return Fi(this.columns,{hidden:[],order:e.order})}commit(e){Mi(this.scope,e),this.revision++,this.dispatchEvent(new CustomEvent(`column-prefs-changed`,{bubbles:!0,composed:!0}))}toggleVisibility(e){let t=this.prefs,n=t.hidden.includes(e)?t.hidden.filter(t=>t!==e):[...t.hidden,e];this.commit({...t,hidden:n})}move(e,t){let n=this.prefs,r=[...this.effectiveEntries(n)],i=r.findIndex(t=>t.id===e);if(i<0)return;let a=i+t;for(;a>=0&&a<r.length&&r[a].protected;)a+=t;if(a<0||a>=r.length)return;let o=r[i];r[i]=r[a],r[a]=o,this.commit({...n,order:r.map(e=>e.id)})}render(){this.revision;let e=this.prefs,t=this.effectiveEntries(e).filter(e=>!e.protected);if(t.length===0)return D``;let n=e.hidden.length>0||e.order.length>0;return D`
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
                ${this.panelOpened?D`
                    <div class="panel" role="menu">
                        <div class="panel-title">Columns</div>
                        ${t.map((n,r)=>{let i=e.hidden.includes(n.id);return D`
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
                `:x}
            </div>
        `}static{this.styles=v`
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
    `}};A([y()],Ii.prototype,`columns`,void 0),A([y()],Ii.prototype,`scope`,void 0),A([C()],Ii.prototype,`panelOpened`,void 0),A([C()],Ii.prototype,`revision`,void 0),Ii=A([w(`mateu-column-chooser`)],Ii);var Li;async function Ri(e){if(!Li)return{};try{return await Li(e)??{}}catch(e){return console.warn(`mateu: external auth provider failed`,e),{}}}function zi(e,t){return t?t.split(`.`).reduce((e,t)=>typeof e==`object`&&e?e[t]:void 0,e):e}function Bi(e,t,n=`value`,r=`label`){let i=zi(e,t);return Array.isArray(i)?i.map(e=>{if(typeof e==`object`&&e){let t=zi(e,n),i=zi(e,r);return{value:t??i,label:String(i??t??``)}}return{value:e,label:String(e)}}):[]}function Vi(e,t,n,r=e=>e){let i=zi(e,t);return Array.isArray(i)?i.map(e=>{let t={};for(let i of n)t[i]=zi(e,r(i));return t}):[]}async function Hi(e,t=e=>e,n=fetch,r){let i=we(e),a=(i.method||`GET`).toUpperCase();if(!i.url)throw Error(`External REST fetch has no url${e.ref?` (unknown source "${e.ref}")`:``}`);let o=t(i.url)??i.url,s={};for(let[e,n]of Object.entries(i.headers??{}))s[e]=t(n)??n;Object.assign(s,await Ri({url:o,method:a}));let c={method:a,headers:s};a!==`GET`&&a!==`HEAD`&&i.body&&(c.body=(r&&ye(s)?r:t)(i.body)??i.body);let l=await n(o,c);if(!l.ok)throw Error(`External REST fetch failed: ${l.status}`);if(l.status===204||l.status===205)return null;if(typeof l.text!=`function`)return l.json();let u=await l.text();return u.trim()===``?null:JSON.parse(u)}async function Ui(e,t=e=>e,n=fetch){let r=await Hi(e,t,n),i=we(e);return Bi(r,i.itemsPath,i.valuePath,i.labelPath)}async function Wi(e,t,n=e=>e,r=fetch){return Vi(await Hi(e,n,r),we(e).itemsPath,t,t=>Te(e,t))}async function Gi(e,t,n=e=>e,r=fetch){return Ki(await Hi(e,n,r),e,t)}function Ki(e,t,n){let r=Vi(e,we(t).itemsPath,n,e=>Te(t,e)),i=zi(e,Ee(t)),a=typeof i==`number`?i:Number(i);return{rows:r,total:Number.isFinite(a)?a:null}}var qi=e=>e==null||e===``||typeof e==`number`&&Number.isNaN(e),Ji=e=>e.stereotype===`dateRange`||e.stereotype===`numberRange`,Yi=e=>e.stereotype===`multiSelect`,Xi=e=>e.dataType===`boolean`||e.dataType===`bool`||e.stereotype===`checkbox`||e.stereotype===`toggle`,Zi=e=>Array.isArray(e)?e.map(String):typeof e==`string`&&e!==``?e.split(`,`).map(e=>e.trim()).filter(e=>e):[],Qi=(e,t,n,r)=>{if(r){let r=Number(e);return!(e===``||e==null||Number.isNaN(r)||!qi(t)&&r<Number(t)||!qi(n)&&r>Number(n))}let i=e==null?``:String(e);return!(i===``||!qi(t)&&i<String(t)||!qi(n)&&i>String(n))},$i=(e,t,n)=>{let r=t.fieldId;if(!r)return!0;let i=e[r];if(Ji(t)){let e=n[`${r}_from`],a=n[`${r}_to`];return qi(e)&&qi(a)?!0:Qi(i,e,a,t.stereotype===`numberRange`)}if(Yi(t)){let e=Zi(n[r]);return e.length===0||e.includes(String(i??``))}let a=n[r];return qi(a)?!0:Xi(t)?(typeof a==`boolean`?a:String(a).toLowerCase()===`true`)===(typeof i==`boolean`?i:String(i??``).toLowerCase()===`true`):(t.options?.length??0)>0?String(i??``)===String(a):String(i??``).toLowerCase().includes(String(a).toLowerCase())};function ea(e,t,n,r){let i=String(r?.searchText??``).trim().toLowerCase(),a=(n??[]).filter(e=>e?.fieldId);return i===``&&a.length===0?e:e.filter(e=>i!==``&&!t.some(t=>String(e[t]??``).toLowerCase().includes(i))?!1:a.every(t=>$i(e,t,r??{})))}var ta=e=>{let t=Number(e);return Number.isFinite(t)&&t>0?Math.floor(t):0},na=(e,t,n)=>{let r=ta(e),i=ta(t),a=ta(n);if(i===0)return{totalPages:void 0,currentPage:a,multiPage:a>0,isFirst:a===0,isLast:!0};let o=Math.max(1,Math.ceil(r/i)),s=Math.min(a,o-1);return{totalPages:o,currentPage:s,multiPage:o>1,isFirst:s===0,isLast:s>=o-1}},ra=class extends S{constructor(...e){super(...e),this.totalElements=0,this.pageSize=100,this.pageNumber=0}dispatch(e){this.dispatchEvent(new CustomEvent(`page-changed`,{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return x;let{totalPages:e,currentPage:t,multiPage:n,isFirst:r,isLast:i}=na(this.totalElements,this.pageSize,this.pageNumber);return D`
            <div class="bar">
                ${n?D`
                    <button class="nav" title="First page" ?disabled="${r}"
                        @click="${()=>this.dispatch(0)}" data-testid="page-first">«</button>
                    <button class="nav" title="Previous page" ?disabled="${r}"
                        @click="${()=>this.dispatch(t-1)}" data-testid="page-prev">‹</button>
                    <span class="page-indicator">Page ${t+1}${e==null?x:D` of ${e}`}</span>
                    <button class="nav" title="Next page" ?disabled="${i}"
                        @click="${()=>this.dispatch(t+1)}" data-testid="page-next">›</button>
                    <button class="nav" title="Last page" ?disabled="${i||e==null}"
                        @click="${()=>this.dispatch(e-1)}" data-testid="page-last">»</button>
                    <span class="separator"></span>
                `:x}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?``:`s`}</span>
                <slot></slot>
            </div>
        `}static{this.styles=v`
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
    `}};A([y()],ra.prototype,`totalElements`,void 0),A([y()],ra.prototype,`pageSize`,void 0),A([y()],ra.prototype,`pageNumber`,void 0),ra=A([w(`mateu-pagination`)],ra);var ia=(e,t,n=!1)=>e&&e>1||n?D`<div style="grid-column: span ${e&&e>1?e:1}; min-width: 0;">${t}</div>`:t,aa=`var(--lumo-space-m, 1rem)`,oa=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.columnWidth||`13rem`,l=`display: grid; grid-template-columns: ${s.maxColumns&&s.maxColumns>0?`repeat(${s.maxColumns}, minmax(0, 1fr))`:`repeat(auto-fill, minmax(min(100%, ${c}), 1fr))`}; gap: ${aa} var(--lumo-space-l, 1.5rem); align-items: start;`;return s.labelsAside&&(l+=` --mateu-label-width: 10rem;`),s.fullWidth&&(l+=` width: 100%;`),l+=t.style??``,D`
        <div id="${t.id??x}" style="${l}" class="${t.cssClasses}" slot="${t.slot||x}">
            ${t.children?.map(t=>sa(s,e,t,n,r,i,a,o))}
        </div>
    `},sa=(e,t,n,r,i,a,o,s)=>n.type==j.ClientSide&&n.metadata?.type==M.FormRow?ua(e,t,n,r,i,a,o,s):ia(ca(n),e.labelsAside?la(t,n,r,i,a,o,s):I(t,n,r,i,a,o,s),!0),ca=e=>{if(e.type==j.ClientSide){let t=e.metadata;if(t?.type==M.FormField)return t.colspan||1}return 1},la=(e,t,n,r,i,a,o)=>{if(t.type==j.ClientSide&&t.metadata?.type==M.FormField&&t.metadata.label){let s=t.metadata;return D`
            <div style="display: flex; gap: ${aa}; align-items: baseline;">
                <label style="flex: 0 0 var(--mateu-label-width, 10rem); color: var(--lumo-secondary-text-color, #667);">${s.label?.includes("${")?e._evalTemplate(s.label):s.label}</label>
                <div style="flex: 1; min-width: 0;">${I(e,t,n,r,i,a,o,!0)}</div>
            </div>
        `}return I(e,t,n,r,i,a,o)},ua=(e,t,n,r,i,a,o,s)=>D`
        <div style="grid-column: 1 / -1; display: flex; gap: ${aa}; flex-wrap: wrap;">
            ${n.children?.map(c=>D`<div style="flex: 1 1 ${100/Math.max(1,n.children.length)}%; min-width: min(100%, 13rem);">${sa(e,t,c,r,i,a,o,s)}</div>`)}
        </div>
    `,da=(e,t,n,r,i,a,o,s)=>{let c=n.metadata,l=`display: flex; flex-direction: ${e};`;c.spacing&&(l+=` gap: ${aa};`),c.padding&&(l+=` padding: var(--lumo-space-m, 1rem);`),c.wrap&&(l+=` flex-wrap: wrap;`),c.fullWidth&&(l+=` width: 100%;`),c.justification&&(l+=` justify-content: ${c.justification};`);let u=e===`row`?c.verticalAlignment:c.horizontalAlignment;return u&&(l+=` align-items: ${u};`),l+=n.style??``,D`
        <div id="${n.id??x}" style="${l}" class="${n.cssClasses}" slot="${n.slot??x}">
            ${n.children?.map(e=>I(t,e,r,i,a,o,s))}
        </div>
    `},fa=(e,t,n,r,i,a,o)=>da(`row`,e,t,n,r,i,a,o),pa=(e,t,n,r,i,a,o)=>da(`column`,e,t,n,r,i,a,o),ma=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=`display: flex; flex-direction: ${s.orientation===`vertical`?`column`:`row`}; gap: var(--lumo-space-s, 0.5rem);`;return s.fullWidth&&(c+=` width: 100%;`),c+=t.style??``,D`
        <div id="${t.id??x}" style="${c}" class="${t.cssClasses}" slot="${t.slot??x}">
            <div style="flex: 1; min-width: 0; min-height: 0;">${I(e,t.children[0],n,r,i,a,o)}</div>
            <div style="flex: 1; min-width: 0; min-height: 0;">${I(e,t.children[1],n,r,i,a,o)}</div>
        </div>
    `},ha=(e,t,n,r,i,a,o)=>{let s=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,l=!!i?.hasDetail||!!s,u=c??s;return D`
        <div id="${t.id??x}" style="display: flex; gap: var(--lumo-space-m, 1rem); ${t.style??``}" class="${t.cssClasses}" slot="${t.slot??x}">
            <div style="flex: 1; min-width: 0;">${I(e,t.children[0],n,r,i,a,o)}</div>
            ${l&&u?D`<div style="flex: 1; min-width: 0;">${I(e,u,n,r,i,a,o)}</div>`:D`<div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem);">Select an item to view details</div>`}
        </div>
    `},ga=(e,t,n,r,i,a,o)=>{let s=t.style??``;t.metadata.fullWidth&&(s+=` width: 100%;`);let c=Math.max(0,(t.children??[]).findIndex(e=>e.metadata.active));return D`
        <div id="${t.id??x}" style="${s}" class="${t.cssClasses}" slot="${t.slot??x}">
            ${t.children?.map((t,s)=>{let l=t,u=l.metadata.label,d=u?.includes("${")?e._evalTemplate(u):u;return D`
                    <details ?open="${s===c}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));">
                        <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600;">${d}</summary>
                        <div style="padding: var(--lumo-space-m, 1rem) 0;">
                            ${l.children?.map(t=>I(e,t,n,r,i,a,o))}
                        </div>
                    </details>
                `})}
        </div>
    `},_a=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style??``;return s.fullWidth&&(c+=` width: 100%;`),D`
        <div style="${c}" class="${t.cssClasses}" slot="${t.slot??x}">
            ${t.children?.map(t=>va(e,t,n,r,i,a,o,s.variant))}
        </div>
    `},va=(e,t,n,r,i,a,o,s)=>{let c=t.metadata,l=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return D`
        <details ?open="${c.active}" style="border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); ${t.style??``}" class="${t.cssClasses}">
            <summary style="cursor: pointer; padding: var(--lumo-space-s, .5rem) 0; font-weight: 600; ${c.disabled?`pointer-events: none; opacity: .5;`:``}">${l}</summary>
            <div style="padding: var(--lumo-space-s, .5rem) 0;">
                ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
            </div>
        </details>
    `},ya=(e,t,n,r,i,a,o)=>D`
        <div style="overflow: auto; ${t.style??``}" class="${t.cssClasses}" slot="${t.slot??x}">
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </div>
    `,ba=(e,t,n,r,i,a,o)=>D`
        <div style="width: 100%; ${t.style}" class="${t.cssClasses}" slot="${t.slot??x}">
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </div>
    `,xa=(e,t,n,r,i,a,o)=>D`
        <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" class="${t.cssClasses}" slot="${t.slot??x}">
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </div>
    `,Sa=(e,t,n,r,i,a,o)=>D`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: ${aa}; ${t.style}" class="${t.cssClasses}" slot="${t.slot??x}">
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </div>
    `,Ca=(e,t,n,r,i,a,o)=>D`
        <div style="display: flex; gap: ${aa}; flex-wrap: wrap; ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </div>
    `,wa=(e,t,n,r,i,a,o)=>D`
        <div style="flex: ${t.metadata.boardCols??1} 1 0; min-width: min(100%, 12rem); ${t.style}" class="${t.cssClasses}">
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </div>
    `,Ta=(e,t,n,r,i,a,o)=>{let s=t.metadata;return D`
        <div
                style="display: flex; flex-direction: column; overflow: auto; ${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??x}"
        >
            ${s.page.content.map(t=>I(e,t,n,r,i,a,o))}
        </div>
    `},Ea=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,Da=e=>typeof e==`string`&&Ea.test(e),Oa=e=>Da(e)?`…-`+e.substring(e.lastIndexOf(`-`)+1):e,ka=e=>t=>{t.clipboardData&&(t.clipboardData.setData(`text/plain`,e),t.preventDefault())},Aa=e=>Da(e)?D`<span class="mateu-uuid" data-uuid="${e}" title="${e}"
                     @copy="${ka(e)}">${Oa(e)}</span>`:e,ja=e=>{let t=e.metadata;return(t?.content??t?.columns??[]).filter(e=>e&&e.metadata).map(e=>{let t=e.metadata;return{id:e.id??``,label:t?.label??e.id??``,autoWidth:t?.autoWidth,width:t?.width}})},Ma=(e,t)=>{let n=e?.[t];return n==null?``:typeof n==`object`?n.text??n.label??n.value??``:String(n)},Na=(e,t,n)=>{let r=ja(e);return D`
        <div style="overflow:auto; width:100%; ${e.style}" class="${e.cssClasses}" slot="${e.slot??x}">
            <table style="border-collapse:collapse; width:100%; font-size: var(--lumo-font-size-s,.875rem);">
                <thead><tr>${r.map(e=>D`<th style="${`text-align:left; padding:.45rem .6rem; border-bottom:2px solid var(--lumo-contrast-20pct,rgba(0,0,0,.2)); font-weight:600; white-space:nowrap; color: var(--lumo-secondary-text-color,#556);`}">${e.label}</th>`)}</tr></thead>
                <tbody>
                    ${(t??[]).length===0?D`<tr><td colspan="${Math.max(1,r.length)}" style="padding:1.5rem; text-align:center; color: var(--lumo-secondary-text-color,#888);">${n??`No data.`}</td></tr>`:t.map(e=>D`<tr>${r.map(t=>D`<td style="${`padding:.4rem .6rem; border-bottom:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.08)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:24rem;`}" title="${Ma(e,t.id)}">${Aa(Ma(e,t.id))}</td>`)}</tr>`)}
                </tbody>
            </table>
        </div>
    `},Pa=(e,t)=>{let n=e.metadata;return e.id&&t&&t[e.id]?t[e.id]:n?.page?.content??[]},Fa=e=>{let t=e.metadata.items??[];return D`
        <div class="mateu-message-list ${e.cssClasses??``}"
             style="display:flex; flex-direction:column; gap:.75rem; ${e.style??``}"
             slot="${e.slot??x}">
            ${t.map(e=>D`
                <div style="display:flex; gap:.6rem; align-items:flex-start;">
                    <span style="flex:0 0 auto; width:2rem; height:2rem; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:.8rem; background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);">
                        ${e.userImg?D`<img src="${e.userImg}" alt="" style="width:100%; height:100%; object-fit:cover;">`:e.userAbbr??(e.userName?e.userName.charAt(0):`?`)}
                    </span>
                    <div style="min-width:0;">
                        <div style="display:flex; gap:.5rem; align-items:baseline;">
                            ${e.userName?D`<span style="font-weight:600;">${e.userName}</span>`:x}
                            ${e.time?D`<span style="font-size:var(--lumo-font-size-xs,.75rem); color:var(--lumo-secondary-text-color,#666);">${e.time}</span>`:x}
                        </div>
                        <div style="white-space:pre-wrap; overflow-wrap:anywhere;">${e.text}</div>
                    </div>
                </div>
            `)}
        </div>
    `},Ia=(e,t,n,r,i,a,o)=>t.separator?D`<span style="align-self: stretch; width: 1px; background: var(--lumo-contrast-20pct, rgba(0,0,0,.2));"></span>`:t.submenus?D`
            <details style="position: relative;">
                <summary style="cursor: pointer; list-style: none; padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);">
                    ${t.component?I(e,t.component,n,r,i,a,o):t.label} ▾
                </summary>
                <div style="display: flex; flex-direction: column; gap: .1rem; padding: .3rem; min-width: 10rem;
                            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px);
                            background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15));">
                    ${t.submenus.map(t=>Ia(e,t,n,r,i,a,o))}
                </div>
            </details>
        `:D`
        <span class="${t.className??``}"
              style="cursor: ${t.disabled?`default`:`pointer`}; opacity: ${t.disabled?.5:1};
                     padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
                     ${t.selected?`background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));`:``}">
            ${t.component?I(e,t.component,n,r,i,a,o):t.label}
        </span>
    `,La=(e,t,n,r,i,a,o)=>{let s=t.metadata;return D`
        <div style="display: flex; flex-wrap: wrap; gap: .25rem; align-items: center; ${t.style}"
             class="${t.cssClasses}" slot="${t.slot??x}">
            ${s.options?.map(t=>Ia(e,t,n,r,i,a??{},o??{}))}
        </div>
    `},Ra=(e,t,n,r,i,a,o)=>{let s=t.metadata;return D`
        <div style="${t.style}" class="${t.cssClasses}" slot="${t.slot??x}">
            ${I(e,s.wrapped,n,r,i,a,o)}
        </div>
    `},za=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.content?.metadata,l=c?.type==M.Notice&&c.fullWidth===!0;return D`
        <div style="display:flex; flex-direction:column; ${l?`width: 100%; `:``}${t.style}"
             class="${t.cssClasses}"
             slot="${t.slot??x}"
             data-colspan="${s.colspan||(l?99:x)}"
        >
            ${s.label?D`<label style="font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${s.label}</label>`:x}
            ${I(e,s.content,n,r,i,a,o)}
        </div>
            `},Ba=e=>{let t=e.metadata,n=e=>{let n=e.closest(`.mateu-message-input`)?.querySelector(`input`),r=n?.value??``;!t.actionId||!r.trim()||(e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:{message:r}},bubbles:!0,composed:!0})),n&&(n.value=``))};return D`
        <div class="mateu-message-input ${e.cssClasses??``}"
             style="display:flex; gap:.5rem; align-items:center; ${e.style??``}"
             slot="${e.slot??x}">
            <input type="text"
                   style="flex:1; min-width:0; font:inherit; padding:.5rem .75rem; border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16)); border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513);"
                   @keydown="${e=>{e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),n(e.currentTarget))}}">
            <button style="font:inherit; font-weight:500; cursor:pointer; padding:.5rem 1rem; border:none; border-radius:var(--lumo-border-radius-m,6px); background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff);"
                    @click="${e=>n(e.currentTarget)}">Send</button>
        </div>
    `},Va=(e,t,n,r,i,a,o)=>{let s=t.metadata;return D`<span title="${s.text}" style="${t.style}" class="${t.cssClasses}" slot="${t.slot??x}"
        >${I(e,s.wrapped,n,r,i,a,o)}</span>`},Ha=e=>{if(e instanceof CustomEvent)return e.detail;let t={};for(let n in e){let r=e[n];[`number`,`string`,`boolean`].indexOf(typeof r)>=0&&(t[n]=e[n])}return t},Ua=(e,t,n,r,i)=>{let a={appState:r??{},appData:i??{}},o={};for(let r in e.attributes)o[r]=P(e.attributes[r],t,n,a);return{attributes:o,content:P(e.content,t,n,a)}},Wa=(e,t,n,r)=>{for(let t in r.attributes)e.setAttribute(t,r.attributes[t]);n.style&&e.setAttribute(`style`,n.style),n.cssClasses&&e.setAttribute(`class`,n.cssClasses),n.slot&&e.setAttribute(`slot`,n.slot),r.content&&(t.html?e.innerHTML=t.content?.includes("${")?ar(r.content):r.content:e.append(r.content))},Ga=e=>{let t=e.name,n=e.attributes?e.attributes.import:void 0;n&&t.includes(`-`)&&!customElements.get(t)&&O(()=>import(n),[])},Ka=(e,t,n,r,i,a,o)=>{Ga(t);let s=Ua(t,r,i,a,o),c=t.name;s.attributes.id&&(c=`#`+s.attributes.id);let l=n.id?`.element-container[data-element-id="${n.id}"]`:`.element-container`;return setTimeout(()=>{let r=e.shadowRoot?.querySelector(l),i=r?.querySelector(c);if(i){for(;i.firstChild;)i.removeChild(i.lastChild);Wa(i,t,n,s)}else{let i=document.createElement(t.name);Wa(i,t,n,s);for(let n in t.on)i.addEventListener(n,r=>{let i=Ha(r);e.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.on[n],parameters:{event:i}},bubbles:!0,composed:!0}))});r?.appendChild(i)}}),D`<div class="element-container" data-element-id="${E(n.id)}"></div>`},qa=function(e){return e.div=`div`,e.p=`p`,e.h1=`h1`,e.h2=`h2`,e.h3=`h3`,e.h4=`h4`,e.h5=`h5`,e.h6=`h6`,e.span=`span`,e}({}),Ja=(e,t,n,r,i)=>{let a={...e.metadata};a.container??=qa.div;let o=a.attributes?.[`data-colspan`],s=_r(a.text,t,n,r,i),c={xl:`var(--lumo-font-size-xl, 1.375rem)`,l:`var(--lumo-font-size-l, 1.125rem)`,s:`var(--lumo-font-size-s, .875rem)`,xs:`var(--lumo-font-size-xs, .8125rem)`},l=(a.size&&c[a.size]?`font-size: ${c[a.size]}; `:``)+(a.noMargins?`margin-block-start: 0; margin-block-end: 0; `:``);return qa.h1==a.container?D`
            <h1 style="${l}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(o)}"
                slot="${e.slot??x}">
                ${s??x}
            </h1>
        `:qa.h2==a.container?D`
            <h2 style="${l}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(o)}"
                slot="${e.slot??x}">
                ${s??x}
            </h2>
        `:qa.h3==a.container?D`
            <h3 style="${l}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(o)}"
                slot="${e.slot??x}">
                ${s??x}
            </h3>
        `:qa.h4==a.container?D`
            <h4 style="${l}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(o)}"
                slot="${e.slot??x}">
                ${s??x}
            </h4>
        `:qa.h5==a.container?D`
            <h5 style="${l}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(o)}"
                slot="${e.slot??x}">
                ${s??x}
            </h5>
        `:qa.h6==a.container?D`
            <h6 style="${l}${e.style}" class="${e.cssClasses}"
                id="${E(e.id)}"
                data-colspan="${E(o)}"
                slot="${e.slot??x}">
                ${s??x}
            </h6>
        `:qa.p==a.container?D`
               <p style="${l}${e.style}" class="${e.cssClasses}"
                  id="${E(e.id)}"
                  data-colspan="${E(o)}"
                  slot="${e.slot??x}">
                   ${s??x}
               </p>
            `:qa.div==a.container?D`
               <div style="${l}${e.style}" class="${e.cssClasses}"
                    id="${E(e.id)}"
                    data-colspan="${E(o)}"
                    slot="${e.slot??x}">${s?N(s):x}</div>
            `:qa.span==a.container?D`
               <span style="${l}${e.style}" class="${e.cssClasses}"
                     id="${E(e.id)}"
                     data-colspan="${E(o)}"
                    slot="${e.slot??x}">${s??x}</span>
            `:D`
               <p
                       id="${E(e.id)}"
                       data-colspan="${E(o)}"
                       slot="${e.slot??x}">
                   Unknown text container: ${a.container} 
               </p>
            `},Ya=e=>{let t=e.metadata;return D`<a href="${t.url}" target="${t.target??x}"
                   rel="${t.target===`_blank`?`noopener`:x}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??x}">${t.text}</a>`},Xa=(e,t)=>{let n=e.toLowerCase().split(`+`);return t.ctrlKey===n.includes(`ctrl`)&&t.altKey===n.includes(`alt`)&&t.shiftKey===n.includes(`shift`)&&t.metaKey===n.includes(`meta`)},Za=(e,t)=>{if(!Xa(e,t))return!1;let n=e.toLowerCase().split(`+`),r=n[n.length-1];return!!(t.key.toLowerCase()===r||/^[a-z]$/.test(r)&&t.code===`Key`+r.toUpperCase()||/^[0-9]$/.test(r)&&(t.code===`Digit`+r||t.code===`Numpad`+r))},Qa=e=>e?e.split(`+`).map(e=>e.length<=1?e.toUpperCase():e.charAt(0).toUpperCase()+e.slice(1)).join(`+`):void 0,$a=(e,t)=>{let n=e.currentTarget,r=n.dataset.route;if(r){Ir(n,r);return}n.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.dataset.actionId,parameters:t.parameters},bubbles:!0,composed:!0}))},eo=(e,t,n)=>{if(!e.route)return;let r=P(e.route,t,n);return!r||r.includes("${")?void 0:r},to=`display:inline-flex; align-items:center; justify-content:center; gap:.4em; box-sizing:border-box; font:inherit; font-weight:500; cursor:pointer; border-radius:var(--lumo-border-radius-m,6px); border:1px solid transparent; line-height:1; white-space:nowrap;`,no=e=>{let t=e.buttonStyle??``,n=e.color&&e.color!==`none`&&e.color!==`normal`?e.color:``,r=e.size,i=n===`success`?`var(--lumo-success-color,#1a7f37)`:n===`error`?`var(--lumo-error-color,#c5221f)`:n===`contrast`?`var(--lumo-contrast,#161513)`:`var(--lumo-primary-color,#3b5bdb)`,a=n===`success`?`var(--lumo-success-contrast-color,#fff)`:n===`error`?`var(--lumo-error-contrast-color,#fff)`:n===`contrast`?`var(--lumo-base-color,#fff)`:`var(--lumo-primary-contrast-color,#fff)`,o=n===`success`?`var(--lumo-success-text-color,#1a7f37)`:n===`error`?`var(--lumo-error-text-color,#c5221f)`:n===`contrast`?`var(--lumo-body-text-color,#161513)`:`var(--lumo-primary-text-color,#3b5bdb)`,s;return s=t===`primary`?`background:${i}; color:${a};`:t===`tertiary`||t===`tertiaryInline`?`background:transparent; color:${o};`:`background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:${o}; border-color:var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,`${to}${s}${r===`small`?`padding:.25rem .6rem; font-size:var(--lumo-font-size-s,.875rem);`:r===`large`?`padding:.65rem 1.4rem; font-size:var(--lumo-font-size-l,1.125rem);`:`padding:.45rem 1rem; font-size:var(--lumo-font-size-m,1rem);`}`},ro=(e,t,n)=>{let r=e.metadata,i=P(r.label,t,n);return D`<button
            id="${e.id}"
            data-action-id="${r.actionId}"
            data-route="${eo(r,t,n)??x}"
            @click="${e=>$a(e,r)}"
            style="${no(r)}${e.style}"
            class="${e.cssClasses}"
            ?disabled="${r.disabled}"
            data-shortcut="${r.shortcut??x}"
            title="${r.shortcut?`${i} (${Qa(r.shortcut)})`:x}"
            slot="${e.slot??x}"
    >${r.iconOnLeft?L(r.iconOnLeft):x}${i}${r.iconOnRight?L(r.iconOnRight):x}</button>`},io=`display:block; box-sizing:border-box; background:var(--lumo-base-color,#fff); border:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.1)); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-xs,0 1px 3px rgba(0,0,0,.08)); overflow:hidden;`,ao=(e,t,n,r,i,a,o)=>{let s=t.metadata;if(!s)return D``;let c=t=>t?I(e,t,n,r,i,a,o,!1):x,l=s.header||s.headerPrefix||s.headerSuffix||s.title||s.subtitle;return D`
        <div id="${t.id??x}" style="${io}${t.style}" class="${t.cssClasses}" slot="${t.slot??x}">
            ${s.media?c(s.media):x}
            ${l?D`<div style="display:flex; align-items:flex-start; gap:.75rem; padding:1rem 1.25rem ${s.content||s.footer?`0`:`1rem`};">
                ${s.headerPrefix?c(s.headerPrefix):x}
                <div style="flex:1; min-width:0;">
                    ${s.header?c(s.header):x}
                    ${s.title?D`<div style="font-weight:600; font-size:1.05rem; color:var(--lumo-body-text-color,#161513);">${c(s.title)}</div>`:x}
                    ${s.subtitle?D`<div style="color:var(--lumo-secondary-text-color,#667);">${c(s.subtitle)}</div>`:x}
                </div>
                ${s.headerSuffix?c(s.headerSuffix):x}
            </div>`:x}
            ${s.content?D`<div style="padding:1rem 1.25rem;">${c(s.content)}</div>`:x}
            ${s.footer?D`<div style="padding:0 1.25rem 1rem;">${c(s.footer)}</div>`:x}
        </div>
    `},oo=e=>{let t=e.metadata;return D`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??x}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},so=e=>{let t=e.metadata;return L(t.icon,e.style,e.cssClasses,e.slot)},co=(e,t)=>{e&&e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t},bubbles:!0,composed:!0}))},lo=`font:inherit; font-weight:500; cursor:pointer; padding:.45rem 1rem; border-radius:var(--lumo-border-radius-m,6px);`,uo=`${lo} background:var(--lumo-contrast-5pct,rgba(0,0,0,.04)); color:var(--lumo-body-text-color,#161513); border:1px solid var(--lumo-contrast-20pct,rgba(0,0,0,.16));`,fo=`${lo} background:var(--lumo-primary-color,#3b5bdb); color:var(--lumo-primary-contrast-color,#fff); border:1px solid transparent;`,po=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=!1;if(s.openedCondition)try{c=xr(s.openedCondition,r,i,a,o)}catch(e){console.error(`when evaluating `+s.openedCondition+` :`+e+`, where data is `+i+` and state is `+r)}return c?D`
        <div class="mateu-confirm-dialog ${t.cssClasses??``}"
             style="position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.4); ${t.style??``}"
             slot="${t.slot??x}">
            <div style="background:var(--lumo-base-color,#fff); color:var(--lumo-body-text-color,#161513); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-l,0 8px 24px rgba(0,0,0,.2)); width:100%; max-width:min(90vw,32rem); padding:1.5rem; box-sizing:border-box;">
                ${s.header?D`<h3 style="margin:0 0 .75rem; font-size:1.15rem;">${s.header}</h3>`:x}
                <div>${t.children?.map(t=>I(e,t,n,r,i,a,o))}</div>
                <div style="display:flex; gap:.5rem; justify-content:flex-end; margin-top:1.25rem;">
                    ${s.canCancel?D`<button style="${uo}" @click="${e=>co(e.currentTarget,s.cancelActionId)}">${s.rejectText&&!s.canReject?s.rejectText:`Cancel`}</button>`:x}
                    ${s.canReject?D`<button style="${uo}" @click="${e=>co(e.currentTarget,s.rejectActionId)}">${s.rejectText||`No`}</button>`:x}
                    <button style="${fo}" @click="${e=>co(e.currentTarget,s.confirmActionId)}">${s.confirmText||`OK`}</button>
                </div>
            </div>
        </div>
    `:D``},mo=e=>{let t=e.metadata,n;return t.position&&(n={Top:`top`,Bottom:`bottom`,TopLeft:`top-left`,TopRight:`top-right`,BottomLeft:`bottom-left`,BottomRight:`bottom-right`}[t.position]),D`
        <mateu-cookie-consent style="${e.style}" class="${e.cssClasses}"
                               slot="${e.slot??x}"
                               position="${n??x}"
                               cookie-name="${t.cookieName??x}"
                               .message="${t.message??x}"
                               theme="${t.theme??x}"
                               .learnMore="${t.learnMore??x}"
                               .learnMoreLink="${t.learnMoreLink??x}"
                               .dismiss="${t.dismiss??x}"
        ></mateu-cookie-consent>
    `},ho=(e,t,n,r,i,a,o)=>{let s=t.metadata;return D`
        <details
                ?open="${s.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??x}"
        >
            <summary>${I(e,s.summary,n,r,i,a,o)}</summary>
            ${I(e,s.content,n,r,i,a,o)}
        </details>
            `},go=(e,t,n,r,i,a)=>D`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${n}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${a}"
        ></mateu-dialog>
            `,_o=(e,t,n,r,i,a)=>D`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${n}"
            .xdata="${r}"
            .appState="${i}"
            .appdata="${a}"
        ></mateu-drawer>
            `,vo=e=>`mfe_`+[e.baseUrl,e.route,e.consumedRoute,e.serverSideType].map(e=>e??``).join(`|`).replace(/[^a-zA-Z0-9]/g,`_`),yo=e=>{let t=e.metadata;return D`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"
                  route="${t.route}"
                  consumedRoute="${t.consumedRoute}"
                  id="${vo(t)}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??x}"
        ></mateu-ux>
        </mateu-api-caller>
            `},bo=e=>D`
        <mateu-markdown .content=${e.metadata.markdown}
                        style="display:block; max-width: 72ch; ${e.style??``}" class="${e.cssClasses}"
                        slot="${e.slot??x}"></mateu-markdown>
            `,xo=e=>{let t=e.metadata;return D`
        <div
            role="status"
            slot="${e.slot??x}"
            class="${e.cssClasses}"
            style="display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem;
                   border-radius: var(--lumo-border-radius-m, 8px);
                   background: var(--lumo-contrast-5pct, rgba(0,0,0,0.05));
                   color: var(--lumo-body-text-color, #1a1a1a); ${e.style}"
        >
            ${t.title?D`<strong>${t.title}</strong>`:x}
            ${t.text?D`<span>${t.text}</span>`:x}
        </div>
    `},So=(e,t={})=>{let n=e.metadata,r=n.valueKey?t[n.valueKey]:n.value,i=n.max&&n.max!=0?n.max:1,a=!n.indeterminate&&r!=null;return D`
        <div style="${e.style}" class="${e.cssClasses}" slot="${e.slot??x}">
            <progress
                    style="width:100%;"
                    max="${i}"
                    .value="${a?r:x}"
            ></progress>
            ${n.text?D`<span class="text-secondary text-xs" id="sublbl">
    ${n.text}
  </span>`:x}
        </div>
    `},Co=(e,t,n,r,i,a,o)=>{let s=t.metadata;return D`
        <details style="position: relative; ${t.style}" class="${t.cssClasses}" slot="${t.slot??x}">
            <summary style="list-style: none; cursor: pointer;">${I(e,s.wrapped,n,r,i,a,o)}</summary>
            <div style="position: absolute; z-index: 100; min-width: 300px; margin-top: .25rem; padding: .6rem .8rem;
                        border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px);
                        background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.2));">
                ${I(e,s.content,n,r,i,a,o)}
            </div>
        </details>
    `},wo=e=>{let t=e.metadata;return D`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??x}"></mateu-map>
            `},To=e=>D`
        <img src="${e.metadata.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??x}">
            `,Eo=e=>{let t=e.metadata;return D`<div style="display:flex; align-items:center; gap:0.5rem;" slot="${e.slot??x}">
        ${t.breadcrumbs.map(e=>D`
            <a href="${e.link}">${e.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </div>`},Do=(e,t,n,r,i,a,o)=>{let s=t.metadata;return D`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${s.dots}" 
                ?nav = "${s.nav}" 
                ?loop = "${s.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(t=>D`<div>${I(e,t,n,r,i,a,o)}</div>`)}
        </skeleton-carousel>
    `},Oo=(e,t,n,r)=>{let i=e.metadata;return D`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??x}">
            ${i.menu.map(e=>ko(e))}
        </div>
            `},ko=e=>D`
        ${e.submenus?D`
                <details open>
                    <summary>${e.label}</summary>
                    <div style="display:flex; flex-direction:column; gap:0.25rem; padding-left:0.5rem;">
                        ${e.submenus.map(e=>ko(e))}
                    </div>
                </details>
            `:D`
                <a href="${e.path}">${e.label}</a>
        `}
        `,Ao=(e,t,n,r,i,a,o)=>{let s=t.metadata;return D`<div
                slot="${t.slot??x}"
                style="${t.style}" class="${t.cssClasses}"
        >${s.content?re(s.content):x}${t.children?.map(t=>I(e,t,n,r,i,a,o))}</div>
    `},jo=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.title?.includes("${")?e._evalTemplate(s.title):s.title;return D`<div
                id="${t.id??x}"
                slot="${t.slot??x}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?D`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${c}</div>`:x}
        ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
    </div>
    `},Mo=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.title?.includes("${")?e._evalTemplate(s.title):s.title;return D`
        <div
                slot="${t.slot??x}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(t=>I(e,t,n,r,i,a,o))}</div>
    `},No=(e,t,n)=>{n.dispatchEvent(new CustomEvent(`value-changed`,{detail:{fieldId:e,value:t},bubbles:!0,composed:!0}))},Po=e=>t=>{let n=t.target,r=n.type===`checkbox`?n.checked:n.value;No(e.fieldId,r,n)},Fo=(e,t)=>{let n=e.metadata,r=t?.[n.fieldId]??``,i=n,a=i.dataType,o=i.stereotype,s=!!i.readOnly,c=!!i.disabled,l=i.options,u=n.label?D`<label style="display:block; font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${n.label}</label>`:x,d=`width:100%; box-sizing:border-box; padding:.4rem .6rem; border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.3)); border-radius: var(--lumo-border-radius-m,6px); font:inherit; background: var(--lumo-base-color,#fff); color: var(--lumo-body-text-color,#1a1a1a);`,f;return f=s||o===`plainText`?D`<div style="padding:.4rem 0;">${String(r??``)}</div>`:a===`boolean`||a===`bool`||o===`checkbox`||o===`badge`?D`<input type="checkbox" ?checked="${!!r}" ?disabled="${c}" @change="${Po(n)}">`:l&&l.length?D`
            <select style="${d}" ?disabled="${c}" @change="${Po(n)}">
                <option value="">—</option>
                ${l.map(e=>D`<option value="${e.value}" ?selected="${e.value===r}">${e.label}</option>`)}
            </select>`:o===`textarea`||o===`richText`||o===`html`?D`<textarea style="${d}" rows="3" ?disabled="${c}" @input="${Po(n)}">${String(r??``)}</textarea>`:D`<input type="${a===`integer`||a===`number`||a===`double`||a===`money`?`number`:a===`date`?`date`:a===`datetime`?`datetime-local`:a===`time`?`time`:o===`password`?`password`:a===`email`?`email`:`text`}" style="${d}" .value="${String(r??``)}"
                              placeholder="${i.placeholder??x}" ?disabled="${c}" @input="${Po(n)}">`,D`
        <div id="${e.id??x}" style="${e.style}" class="${e.cssClasses}" slot="${e.slot??x}">
            ${u}
            ${f}
        </div>
    `},Io=`var(--mateu-fab-size, var(--lumo-size-l, 2.75rem))`,Lo=`var(--mateu-fab-gap, var(--lumo-space-s, 0.5rem))`,Ro=`var(--mateu-fab-inset-bottom, var(--mateu-fab-inset-block, var(--lumo-space-m, 1rem)))`,zo=`var(--mateu-fab-inset-end, var(--lumo-space-m, 1rem))`,Bo={inset:1,size:2.75,gap:.5,toc:15,tocGap:2},Vo=e=>`calc(${Ro} + ${e} * (${Io} + ${Lo}))`,Ho=e=>`calc(${Ro} + (var(--mateu-fab-shell-slots, 0) + ${e}) * (${Io} + ${Lo}))`,Uo=e=>`bottom: ${Vo(e)}; right: ${zo};`,Wo=e=>`bottom: ${Ho(e)}; right: ${zo};`,Go=e=>v`
    ${ys(e)} {
        position: fixed;
        box-sizing: border-box;
        width: ${vs(Io)};
        height: ${vs(Io)};
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
    ${ys(e)}:hover {
        background-image: linear-gradient(var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)), var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)));
    }
    ${ys(e)}:active {
        background-image: linear-gradient(var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)), var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)));
    }
    ${ys(e)}:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--lumo-base-color, #fff), 0 0 0 4px var(--lumo-primary-color-50pct, rgba(22, 118, 243, 0.5));
    }
`,Ko=new Map,qo=new Map,Jo=new Set,Yo=!1,Xo=()=>parseFloat(getComputedStyle(document.documentElement).fontSize||`16`)||16,Zo=()=>{let e=document.documentElement.style,t=[...Ko.values()],n=t.filter(e=>e.kind===`shell`).reduce((e,t)=>Math.max(e,t.slot+1),0),r=t.filter(e=>e.kind===`page`).length;e.setProperty(`--mateu-fab-shell-slots`,String(n)),e.setProperty(`--mateu-fab-slots`,String(n+r))},Qo=()=>{Yo||(Yo=!0,queueMicrotask(()=>{Yo=!1,Zo(),Jo.forEach(e=>e())}))},$o=(e,t)=>{let n=Ko.get(e);n?.kind===t.kind&&n.slot===t.slot||(Ko.set(e,t),Qo())},es=e=>{Ko.delete(e)&&Qo()},ts=oe(class extends ie{constructor(e){if(super(e),e.type!==ne.ELEMENT)throw Error(`onFabRail goes on the FAB element`)}render(e,t){return x}update(e,[t,n]){return this.element&&this.element!==e.element&&es(this.element),this.element=e.element,this.entry={kind:t,slot:n??0},this.isConnected&&$o(this.element,this.entry),x}disconnected(){this.element&&es(this.element)}reconnected(){this.element&&this.entry&&$o(this.element,this.entry)}}),ns=(e,t)=>(qo.set(e,t),t(rs,is),Qo(),()=>{qo.delete(e)&&Qo()}),rs=`column`,is,as=(e,t)=>{rs=e,is=t,qo.forEach(n=>n(e,t))},os=e=>{let{mode:t,viewportWidth:n,contentEnd:r,hasFabs:i,hasToc:a,rem:o}=e,s=Bo.inset*o,c=(Bo.size+Bo.gap)*o;if(t===`edge`)return{channel:0,toc:`bar`,insetEnd:0,insetBottom:0};if(n<600)return{channel:0,toc:`bar`,insetEnd:s};let l=a&&n>=1200,u=Math.max(i?s+c:0,l?s+(Bo.toc+Bo.tocGap)*o:0),d=l?`aside`:`bar`;if(t===`full`)return{channel:u,toc:d,insetEnd:s,padEnd:u>0?Math.max(24,Math.round(u-(n-r))):void 0};let f=u>0?Math.max(0,Math.round(u-(n-(e.containerEnd??r)))):void 0,p=Math.max(c,u-s);return{channel:u,toc:d,insetEnd:Math.max(s,Math.round(n-r-p)),squeeze:f}},ss=new Map,cs=0,z,ls,us=(e,t)=>{let n=t;for(;n;)if(n=n.parentNode??n.host??null,n===e)return!0;return!1},ds=()=>{let e=[...ss.values()].filter(e=>e.element.isConnected);return e.filter(t=>!e.some(e=>e!==t&&us(e.element,t.element))).sort((e,t)=>t.order-e.order)[0]?.element},fs=e=>{e.removeAttribute(`data-aside`),e.style.removeProperty(`--mateu-aside-squeeze`),e.style.removeProperty(`--mateu-aside-pad-end`)},ps=()=>{let e=document.documentElement,t=ds();if(z&&z!==t&&(ls?.unobserve(z),fs(z)),t&&t!==z&&ls?.observe(t),z=t,!z){e.style.removeProperty(`--mateu-fab-inset-end`),e.style.removeProperty(`--mateu-fab-inset-bottom`),Zo(),as(`column`);return}let n=ss.get(z),r=Xo(),i=e.clientWidth||window.innerWidth,a=z.getBoundingClientRect().right,o=os({mode:n.mode,viewportWidth:i,contentEnd:a,containerEnd:a+(parseFloat(getComputedStyle(z).marginRight)||0),hasFabs:Ko.size>0,hasToc:qo.size>0,rem:r});o.channel>0?(z.setAttribute(`data-aside`,``),z.style.setProperty(`--mateu-aside-squeeze`,`${o.squeeze??0}px`),o.padEnd===void 0?z.style.removeProperty(`--mateu-aside-pad-end`):z.style.setProperty(`--mateu-aside-pad-end`,`${o.padEnd}px`)):fs(z),e.style.setProperty(`--mateu-fab-inset-end`,`${o.insetEnd}px`),Zo(),o.insetBottom===void 0?e.style.removeProperty(`--mateu-fab-inset-bottom`):e.style.setProperty(`--mateu-fab-inset-bottom`,`${o.insetBottom}px`),as(o.toc,a-(parseFloat(getComputedStyle(z).paddingRight)||0))},ms=!1,hs=()=>{ms||(ms=!0,ls=typeof ResizeObserver<`u`?new ResizeObserver(()=>ps()):void 0,window.addEventListener(`resize`,ps),Jo.add(ps))},gs=()=>{ms&&(ms=!1,ls?.disconnect(),ls=void 0,window.removeEventListener(`resize`,ps),Jo.delete(ps))},_s=(e,t)=>(ss.set(e,{element:e,mode:t,order:++cs}),hs(),ps(),()=>{ss.get(e)?.element===e&&(ss.delete(e),fs(e),ps(),ss.size===0&&gs())}),vs=e=>ee(e),ys=e=>ee(e),bs=e=>{let t=e.metadata;if((t?.level??0)>0)return e;let n=e=>{if(e?.metadata?.type===M.EntityHeader)return e;let t=e?.metadata?.content,r=[...e?.children??[],...Array.isArray(t)?t:t?[t]:[]];for(let e of r){let t=n(e);if(t)return t}},r;for(let t of e.children??[])if(r=n(t),r)break;if(!r)return e;let i=r.metadata;r.__hoistedToPageHeader=!0;let a=[...(i.facts??[]).filter(e=>e.label||e.value).map(e=>({title:e.label??``,text:e.value??``})),...i.metricLabel?[{title:i.metricLabel,text:i.metricValue??``}]:[]],o=(i.badges??[]).filter(e=>e.label).map(e=>({text:e.label,color:e.color})),s={...t,title:i.title||t.title,subtitle:i.subtitle??t.subtitle,kpis:[...t.kpis??[],...a],kpisBelow:!0,badges:[...t.badges??[],...o]};return{...e,metadata:s}},xs=e=>`width: 100%; box-sizing: border-box; ${e??``}`,Ss=(e,t,n,r,i,a,o,s)=>{let c=bs(t),l=c.metadata,u=l?.fabs??[];return D`<mateu-page
            .component="${c}"
            baseUrl="${n}"
            .state="${r}"
            .data="${i}"
            .appState="${a}"
            .appdata="${o}"
            slot="${c.slot??x}"
            style="${xs(c.style)}"
            class="${c.cssClasses}"
            ?standalone="${s??!1}"
    >
        ${c.children?.map(t=>I(e,t,n,r,i,a,o))}
        ${l?.buttons?.map(t=>D`
                   ${I(e,{id:t.actionId,metadata:t,type:j.ClientSide,slot:`buttons`},void 0,r,i,a,o)}
`)}
        ${u.map((t,n)=>D`
            <button class="page-fab" style="${Wo(n)}" ${ts(`page`,n)} aria-label="${t.label}"
                @click="${()=>e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))}"
                title="${t.label}">
                ${L(t.icon)}
            </button>
        `)}
</mateu-page>
    `},Cs=(e,t,n,r,i,a,o,s)=>D`<mateu-table-crud
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
            slot="${t.slot??x}"
            ?standalone="${s??!1}"
    >
        ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
    </mateu-table-crud>`,ws=e=>{let t=e.metadata;return D`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??x}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},Ts=(e,t,n)=>D`<mateu-chat sseUrl="${e.metadata.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??x}"></mateu-chat>`,Es=e=>{let t=e.metadata;return D`
        <mateu-workflow
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
                value="${t.value??`{"name":"New Workflow","steps":[]}`}"
        ></mateu-workflow>
    `},Ds=e=>{let t=e.metadata;return D`
        <mateu-form-editor
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
                value="${t.value??`{"name":"New Form","fields":[]}`}"
        ></mateu-form-editor>
    `},Os=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,ks=e=>e==`up`?`var(--lumo-success-text-color, #1a7f37)`:e==`down`?`var(--lumo-error-text-color, #c5221f)`:`var(--lumo-secondary-text-color, #666)`,As=e=>e==`up`?`▲`:e==`down`?`▼`:``,js=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},Ms=e=>{let t=e.metadata,n=!!t.actionId;return D`
        <div class="mateu-metric-card ${e.cssClasses??``}"
             style="${Os} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${n?`cursor: pointer;`:``} ${e.style??``}"
             slot="${e.slot??x}"
             role="${n?`button`:x}"
             @click="${e=>js(e,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?L(t.icon,`color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;`):x}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?D`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:x}
            </div>
            ${t.trend||t.trendLabel?D`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${ks(t.trend)};">
                    ${As(t.trend)} ${t.trendLabel??x}
                </span>
            `:x}
            ${t.description?D`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:x}
        </div>
    `},Ns=(e,t,n,r,i,a,o)=>D`
        <div class="mateu-scoreboard ${t.cssClasses??``}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??``}"
             slot="${t.slot??x}"
        >
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </div>
    `,Ps=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.colSpan&&s.colSpan>1?`grid-column: span ${s.colSpan};`:``,l=s.rowSpan&&s.rowSpan>1?`grid-row: span ${s.rowSpan};`:``,u=t.children??[];return u.length===1&&u[0].metadata?.type===`MetricCard`?D`
            <div style="min-width: 0; ${c} ${l} ${t.style??``}" slot="${t.slot??x}">
                ${I(e,u[0],n,r,i,a,o)}
            </div>`:D`
        <div class="mateu-dashboard-panel ${t.cssClasses??``}"
             style="${Os} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${l} ${t.style??``}"
             slot="${t.slot??x}"
        >
            ${s.title?D`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${s.title}</h3>
                    ${s.subtitle?D`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${s.subtitle}</span>`:x}
                </div>
            `:x}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
            </div>
        </div>
    `},Fs=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.columns&&s.columns>0?`repeat(${s.columns}, minmax(0, 1fr))`:`repeat(auto-fit, minmax(20rem, 1fr))`;return D`
        <div class="mateu-dashboard ${t.cssClasses??``}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??``}"
             slot="${t.slot??x}"
        >
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </div>
    `},Is=class extends S{constructor(...e){super(...e),this.panels=[],this.headerTitle=``,this.badges=[],this.orientation=`vertical`,this.navigation=null,this.overviewEditActionId=``,this.openPanels=new Set,this.expandedPanel=null,this._onPopState=()=>{let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(e.startsWith(`expand=`)){let t=e.slice(7),n=this.panels.findIndex((e,n)=>this.panelAnchor(e,n)===t);this.expandedPanel=n>=0?n:null}else this.expandedPanel=null},this.initialized=!1}navAction(e){e&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),window.addEventListener(`popstate`,this._onPopState)}disconnectedCallback(){window.removeEventListener(`popstate`,this._onPopState),super.disconnectedCallback()}willUpdate(){if(!this.initialized&&this.panels.length){this.openPanels=new Set(this.panels.map((e,t)=>e.open?t:-1).filter(e=>e>=0));let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(e.startsWith(`expand=`)){let t=e.slice(7),n=this.panels.findIndex((e,n)=>this.panelAnchor(e,n)===t);n>=0&&(this.expandedPanel=n)}else if(e){let t=this.panels.findIndex((t,n)=>this.panelAnchor(t,n)===e);t>=0&&this.openPanels.add(t)}this.initialized=!0}}firstUpdated(){let e=decodeURIComponent((location.hash||``).replace(/^#/,``));if(!e)return;let t=this.renderRoot.querySelector(`[data-anchor="${CSS.escape(e)}"]`);t&&t.scrollIntoView({block:`nearest`})}panelAnchor(e,t){return(e.title??``).toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)||`panel-${t}`}bookmarkPanel(e){let t=this.panelAnchor(this.panels[e],e);try{history.replaceState(history.state,``,`#`+t)}catch{}}clearBookmark(e){let t=this.panelAnchor(this.panels[e],e);if(decodeURIComponent((location.hash||``).replace(/^#/,``))===t)try{history.replaceState(history.state,``,location.pathname+location.search)}catch{}}expandPanel(e,t){t?.stopPropagation(),this.expandedPanel=e;let n=this.panelAnchor(this.panels[e],e);try{history.pushState(history.state,``,`#expand=`+n)}catch{}}collapsePanel(){try{history.back()}catch{this.expandedPanel=null}}toggle(e){let t=new Set(this.openPanels);t.has(e)?(t.delete(e),this.clearBookmark(e)):(t.add(e),this.bookmarkPanel(e)),this.openPanels=t}static{this.styles=v`
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
    `}render(){if(this.expandedPanel!=null&&this.panels[this.expandedPanel]){let e=this.panels[this.expandedPanel];return D`
                <div class="expanded-view" part="expanded-view">
                    <div class="expanded-header">
                        <button class="nav-parent" title="Back"
                                @click="${()=>this.collapsePanel()}">
                            <span>‹</span><span>Back</span>
                        </button>
                        <span class="nav-title">${e.title}</span>
                        ${e.subtitle?D`<span class="subtitle">${e.subtitle}</span>`:x}
                    </div>
                    <div class="expanded-body">
                        <slot name="panel-${this.expandedPanel}"></slot>
                    </div>
                </div>
            `}let e=this.navigation;return D`
            ${e?D`
                <div class="nav-header" part="nav-header">
                    ${e.parentActionId?D`
                        <button class="nav-parent" title="${e.parentLabel??`Back`}"
                                @click="${()=>this.navAction(e.parentActionId)}">
                            <span>‹</span><span>${e.parentLabel??`Back`}</span>
                        </button>
                    `:x}
                    ${e.title?D`<span class="nav-title">${e.title}</span>`:x}
                    <span class="nav-spacer"></span>
                    ${e.previousActionId?D`
                        <button class="nav-move" title="Previous"
                                @click="${()=>this.navAction(e.previousActionId)}">‹</button>
                    `:x}
                    ${e.nextActionId?D`
                        <button class="nav-move" title="Next"
                                @click="${()=>this.navAction(e.nextActionId)}">›</button>
                    `:x}
                </div>
            `:x}
            ${this.headerTitle?D`
                <div class="header-band" part="header-band">
                    <div class="header-content">
                        <h2 class="header-title">${this.headerTitle}</h2>
                        ${this.badges.length?D`
                            <div class="header-badges">
                                ${this.badges.map(e=>D`<span class="header-badge">${e}</span>`)}
                            </div>
                        `:``}
                    </div>
                    <div class="header-accent" part="header-accent"></div>
                </div>
            `:``}
            <div class="columns" part="columns">
                <div class="overview" part="overview">
                    ${this.overviewEditActionId?D`
                        <button class="overview-edit" title="Edit"
                                @click="${()=>this.navAction(this.overviewEditActionId)}">
                            <span>✎</span><span>Edit</span>
                        </button>
                    `:x}
                    <slot name="overview"></slot>
                </div>
                <div class="rail" part="rail">
                    ${this.panels.map((e,t)=>this.openPanels.has(t)?D`
                        <div class="panel" part="panel" data-anchor="${this.panelAnchor(e,t)}"
                             style="${e.width?`flex-basis: ${e.width}; min-width: min(${e.width}, 100%);`:x}"
                             @click="${()=>this.bookmarkPanel(t)}">
                            <div class="panel-header">
                                <div>
                                    <h3>${e.title}</h3>
                                    ${e.subtitle?D`<div class="subtitle">${e.subtitle}</div>`:``}
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
                    `:D`
                        <div class="strip" role="button" title="${e.title}"
                             data-anchor="${this.panelAnchor(e,t)}" @click="${()=>this.toggle(t)}">
                            <button class="fold" tabindex="-1">⟩</button>
                            <span>${e.title}</span>
                        </div>
                    `)}
                </div>
            </div>
        `}};A([y({type:Array})],Is.prototype,`panels`,void 0),A([y({type:String})],Is.prototype,`headerTitle`,void 0),A([y({type:Array})],Is.prototype,`badges`,void 0),A([y({type:String,reflect:!0})],Is.prototype,`orientation`,void 0),A([y({attribute:!1})],Is.prototype,`navigation`,void 0),A([y({type:String})],Is.prototype,`overviewEditActionId`,void 0),A([C()],Is.prototype,`openPanels`,void 0),A([C()],Is.prototype,`expandedPanel`,void 0),Is=A([w(`mateu-foldout`)],Is);var Ls=(e,t,n,r,i,a,o)=>{let s=t.metadata;return D`
        <mateu-foldout
                .panels="${s.panels??[]}"
                .headerTitle="${s.headerTitle??``}"
                .badges="${s.badges??[]}"
                .navigation="${s.navigation??null}"
                overviewEditActionId="${s.overviewEditActionId??``}"
                orientation="${s.orientation??`vertical`}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??x}"
        >
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </mateu-foldout>
    `},Rs=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=s.gridTemplateAreas,l=s.gridTemplateColumns&&s.gridTemplateColumns.trim().length?s.gridTemplateColumns:c&&c.trim().length?null:`repeat(auto-fit, minmax(min(100%, 16rem), 1fr))`,u=s.gap??`var(--lumo-space-m, 1rem)`,d=s.colSpans??[],f=s.stickyAreas??[],p=`display: grid;${l?` grid-template-columns: ${l};`:``} gap: ${u}; align-items: start;${c&&c.trim().length?` grid-template-areas: ${c};`:``} ${t.style??``}`,m=t.children?.map((t,s)=>{let l=I(e,t,n,r,i,a,o);if(c&&t.slot){let e=f.includes(t.slot)?` position: sticky; top: 1rem; align-self: start; height: fit-content;`:``;return D`<div style="grid-area: ${t.slot}; min-width: 0;${e}">${l}</div>`}return ia(d[s],l)});if(!s.stackBelow)return D`
            <div class="mateu-responsive-grid ${t.cssClasses??``}"
                 style="${p}"
                 slot="${t.slot??x}"
            >${m}</div>
        `;let h=t.id??`mateu-grid`;return D`
        <div style="container-type: inline-size;" slot="${t.slot??x}">
            <style>
                @container (max-width: ${s.stackBelow}) {
                    .mateu-responsive-grid[data-grid-id="${h}"] {
                        grid-template-columns: 1fr !important;
                        /* a named-slot template names N columns per row; on one track that would be a
                           mismatch (and void the areas) — drop the areas so the slots stack in order. */
                        grid-template-areas: none !important;
                    }
                }
            </style>
            <div class="mateu-responsive-grid ${t.cssClasses??``}"
                 data-grid-id="${h}"
                 style="${p}"
            >${m}</div>
        </div>
    `},zs=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.children??[],l=e=>c.filter(t=>(t.slot??``).startsWith(e)),u=l(`main-`),d=l(`aside-`),f=l(`footer-`),p=s.asideWidth&&s.asideWidth.trim()?s.asideWidth:`32%`,m=s.asidePosition===`start`,h=s.asideSticky!==!1,g=t=>t.map(t=>I(e,t,n,r,i,a,o)),_=D`
        <div class="mateu-content-main"
             style="flex: 1 1 0; min-width: min(20rem, 100%); box-sizing: border-box;">
            ${g(u)}
        </div>`,v=d.length?D`
        <div class="mateu-content-aside"
             style="flex: 0 1 calc(${p} - var(--lumo-space-m, 1rem)); min-width: min(18rem, 100%); box-sizing: border-box; ${h?`position: sticky; top: 1rem; align-self: flex-start;`:``}">
            ${g(d)}
        </div>`:x;return D`
        <div class="mateu-content-layout ${t.cssClasses??``}"
             style="${t.style??``}"
             slot="${t.slot??x}">
            <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); align-items: flex-start;">
                ${m?[v,_]:[_,v]}
            </div>
            ${f.length?D`
                <div class="mateu-content-footer"
                     style="flex-basis: 100%; margin-top: var(--lumo-space-m, 1rem);">
                    ${g(f)}
                </div>`:x}
        </div>
    `},Bs=`var(--mateu-hero-background, color-mix(in srgb, var(--mateu-accent, #1f6f8f) 78%, #0b1a24))`,Vs=e=>e&&/^[\w\s/.:%~?&=#+,@-]+$/.test(e.trim())?`url("${e.trim()}")`:void 0,Hs=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=Vs(s.image),l=!c&&s.centered!==!1,u=l?`center`:`flex-start`,d=l?`center`:`start`;return D`
        <div class="mateu-hero ${t.cssClasses??``}"
             style="position: relative; display: flex; flex-direction: column; overflow: hidden; border-radius: var(--lumo-border-radius-l, 12px); margin-top: var(--mateu-hero-margin-top, var(--lumo-space-l, 1.5rem)); min-height: ${s.height??`12rem`}; box-sizing: border-box; background: ${Bs}; color: #fff; ${t.style??``}"
             slot="${t.slot??x}"
        >
            ${c?D`<div class="mateu-hero-image" aria-hidden="true"
                 style="position: absolute; inset: 0 0 0 auto; width: min(55%, 40rem); background-image: ${c}; background-repeat: no-repeat; background-position: right center; background-size: auto 150%; pointer-events: none;"></div>`:x}
            <div class="mateu-hero-text"
                 style="position: relative; flex: 1; display: flex; flex-direction: column; align-items: ${u}; justify-content: center; gap: var(--lumo-space-s, .5rem); text-align: ${d}; padding: var(--lumo-space-xl, 2.5rem); ${c?`max-width: min(60%, 42rem);`:``} box-sizing: border-box;">
                ${s.title?D`<h1 style="margin: 0; font-family: var(--lumo-font-family); font-size: var(--lumo-font-size-xxxl, 2.5rem); font-weight: 600; line-height: 1.15; letter-spacing: -0.01em; color: inherit;">${s.title}</h1>`:x}
                ${s.subtitle?D`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); color: rgba(255, 255, 255, .88); max-width: 40rem;">${s.subtitle}</p>`:x}
                ${t.children?.length?D`
                    <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${u}; width: 100%; max-width: 40rem; margin-top: var(--lumo-space-s, .5rem);">
                        ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
                    </div>
                `:x}
            </div>
            <div class="mateu-hero-strip" aria-hidden="true"
                 style="position: relative; flex-shrink: 0; height: var(--mateu-page-band-h, 0px); background-image: var(--mateu-page-band-image, none); background-repeat: repeat-x; background-size: auto 100%;"></div>
        </div>
    `},B=e=>t=>{if(t.key===`Enter`){e(t);return}(t.key===` `||t.key===`Spacebar`)&&(t.preventDefault(),e(t))},V=v`
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
`,Us=1440*60*1e3,Ws=class extends S{constructor(...e){super(...e),this.tasks=[],this.onTaskSelectionActionId=``}selectTask(e){this.onTaskSelectionActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.onTaskSelectionActionId,parameters:{_clickedTaskId:e.id}},bubbles:!0,composed:!0}))}static{this.styles=v`
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
    
        ${V}
    `}range(){let e=this.tasks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>new Date(e+`T00:00:00`).getTime());return e.length?{min:Math.min(...e)-Us,max:Math.max(...e)+2*Us}:null}months(e,t){let n=[],r=new Date(e);for(r.setDate(1);r.getTime()<=t;){let i=Math.max(r.getTime(),e),a=new Date(r.getFullYear(),r.getMonth()+1,1),o=Math.min(a.getTime(),t);n.push({label:r.toLocaleDateString(void 0,{month:`short`,year:`2-digit`}),from:i,to:o}),r.setMonth(r.getMonth()+1)}return n}render(){let e=this.range();if(!e)return D``;let t=e.max-e.min,n=n=>(n-e.min)/t*100,r=Date.now();return D`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(e=>D`
                        <div class="month" style="width: ${(e.to-e.from)/t*100}%;">${e.label}</div>
                    `)}
                </div>
                ${this.tasks.map(i=>{let a=new Date(i.start+`T00:00:00`).getTime(),o=new Date(i.end+`T00:00:00`).getTime()+Us;return D`
                        <div class="label" title="${i.title}">${i.title}</div>
                        <div class="lane">
                            ${r>=e.min&&r<=e.max?D`<div class="today" style="left: ${n(r)}%;"></div>`:x}
                            <div role="button" tabindex="0"
                                 aria-label="${i.title}, ${i.start} to ${i.end}${i.progress?`, ${i.progress}% complete`:``}"
                                 class="bar ${this.onTaskSelectionActionId?`clickable`:``}"
                                 title="${i.title} · ${i.start} → ${i.end}${i.progress?` · ${i.progress}%`:``}"
                                 @click="${()=>this.selectTask(i)}" @keydown="${B(()=>this.selectTask(i))}"
                                 style="left: ${n(a)}%; width: ${(o-a)/t*100}%; ${i.color?`--mateu-gantt-fill: ${i.color};`:``}">
                                <div class="fill" style="width: ${i.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};A([y({type:Array})],Ws.prototype,`tasks`,void 0),A([y()],Ws.prototype,`onTaskSelectionActionId`,void 0),Ws=A([w(`mateu-gantt`)],Ws);var Gs=e=>{let t=e.metadata;return D`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                .onTaskSelectionActionId="${t.onTaskSelectionActionId??``}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-gantt>
    `},H,Ks=(e,t)=>({startIdx:Math.min(e,t),endIdx:Math.max(e,t)}),qs=(e,t,n,r)=>e===`start`?{startIdx:Math.min(r,n),endIdx:n}:{startIdx:t,endIdx:Math.max(r,t)},U=class extends S{static{H=this}constructor(...e){super(...e),this.resources=[],this.blocks=[],this.attributeColumns=[],this.resize=null,this.range=null,this.drag=null,this.dragStartX=0,this.dragStartY=0,this.laneRects=[],this.onDragKeydown=e=>{e.key===`Escape`&&(this.drag||this.resize||this.range)&&(e.stopPropagation(),this.endDrag())}}static{this.styles=v`
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
    `}static parse(e){return new Date(e+`T00:00:00`)}static iso(e){let t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}static addDays(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}static daysBetween(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}window(){if(this.from&&this.to){let e=H.parse(this.from),t=H.daysBetween(e,H.parse(this.to))+1;return t>0?{from:e,days:t}:null}let e=this.blocks.flatMap(e=>[e.start,e.end]).filter(e=>!!e).map(e=>H.parse(e));if(!e.length)return null;let t=new Date(Math.min(...e.map(e=>e.getTime()))),n=new Date(Math.max(...e.map(e=>e.getTime())));return{from:t,days:H.daysBetween(t,n)+1}}onBlockPointerDown(e,t,n){if(!this.moveActionId&&!this.selectActionId||(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.dragStartX=e.clientX,this.dragStartY=e.clientY,!this.window()))return;let r=H.parse(t.start),i=H.parse(t.end),a=Math.max(1,H.daysBetween(r,i)+1);this.laneRects=[...this.renderRoot.querySelectorAll(`.lane[data-resource-id]`)].map(e=>({resourceId:e.dataset.resourceId,rect:e.getBoundingClientRect()}));let o=this.dayAt(t.resourceId,e.clientX)??n;this.drag={blockId:t.id,duration:a,grabOffsetDays:o-n,originResourceId:t.resourceId,originStartIdx:n,targetResourceId:t.resourceId,targetStartIdx:n,moved:!1},window.addEventListener(`keydown`,this.onDragKeydown)}dayAt(e,t){let n=this.laneRects.find(t=>t.resourceId===e),r=this.window();if(!n||!r||n.rect.width===0)return null;let i=Math.floor((t-n.rect.left)/n.rect.width*r.days);return Math.max(0,Math.min(r.days-1,i))}onBlockPointerMove(e){if(!this.drag||!this.drag.moved&&Math.abs(e.clientX-this.dragStartX)<4&&Math.abs(e.clientY-this.dragStartY)<4||!this.moveActionId)return;let t=this.window();if(!t)return;let n=this.laneRects.find(t=>e.clientY>=t.rect.top&&e.clientY<=t.rect.bottom)??this.laneRects.find(e=>e.resourceId===this.drag.targetResourceId);if(!n)return;let r=this.dayAt(n.resourceId,e.clientX);if(r==null)return;let i=Math.max(0,Math.min(t.days-this.drag.duration,r-this.drag.grabOffsetDays));this.drag={...this.drag,moved:!0,targetResourceId:n.resourceId,targetStartIdx:i}}onBlockPointerUp(e){let t=this.drag;if(this.endDrag(),!t)return;if(!t.moved){this.selectActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.selectActionId,parameters:{_blockId:e.id}},bubbles:!0,composed:!0}));return}if(!this.moveActionId||t.targetResourceId===t.originResourceId&&t.targetStartIdx===t.originStartIdx)return;let n=this.window();if(!n)return;let r=H.addDays(n.from,t.targetStartIdx),i=H.addDays(r,t.duration-1);this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.moveActionId,parameters:{_blockId:t.blockId,_resourceId:t.targetResourceId,_start:H.iso(r),_end:H.iso(i)}},bubbles:!0,composed:!0}))}emit(e,t){this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}measureLanes(){this.laneRects=[...this.renderRoot.querySelectorAll(`.lane[data-resource-id]`)].map(e=>({resourceId:e.dataset.resourceId,rect:e.getBoundingClientRect()}))}onHandlePointerDown(e,t,n,r,i){this.resizeActionId&&(e.preventDefault(),e.stopPropagation(),e.currentTarget.setPointerCapture(e.pointerId),this.measureLanes(),this.resize={blockId:t.id,resourceId:t.resourceId,edge:n,startIdx:r,endIdx:i,originStartIdx:r,originEndIdx:i},window.addEventListener(`keydown`,this.onDragKeydown))}onHandlePointerMove(e){if(!this.resize)return;e.stopPropagation();let t=this.dayAt(this.resize.resourceId,e.clientX);t!=null&&(this.resize={...this.resize,...qs(this.resize.edge,this.resize.originStartIdx,this.resize.originEndIdx,t)})}onHandlePointerUp(e){e.stopPropagation();let t=this.resize;this.endDrag();let n=this.window();!t||!n||!this.resizeActionId||t.startIdx===t.originStartIdx&&t.endIdx===t.originEndIdx||this.emit(this.resizeActionId,{_blockId:t.blockId,_resourceId:t.resourceId,_start:H.iso(H.addDays(n.from,t.startIdx)),_end:H.iso(H.addDays(n.from,t.endIdx))})}onCellsPointerDown(e,t){if(!this.rangeSelectActionId||e.button>0)return;e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this.measureLanes();let n=this.dayAt(t,e.clientX);n!=null&&(this.range={resourceId:t,anchorIdx:n,currentIdx:n},window.addEventListener(`keydown`,this.onDragKeydown))}onCellsPointerMove(e){if(!this.range)return;let t=this.dayAt(this.range.resourceId,e.clientX);t!=null&&t!==this.range.currentIdx&&(this.range={...this.range,currentIdx:t})}onCellsPointerUp(){let e=this.range;this.endDrag();let t=this.window();if(!e||!t||!this.rangeSelectActionId)return;let{startIdx:n,endIdx:r}=Ks(e.anchorIdx,e.currentIdx);this.emit(this.rangeSelectActionId,{_resourceId:e.resourceId,_start:H.iso(H.addDays(t.from,n)),_end:H.iso(H.addDays(t.from,r))})}endDrag(){this.drag=null,this.resize=null,this.range=null,window.removeEventListener(`keydown`,this.onDragKeydown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener(`keydown`,this.onDragKeydown)}render(){let e=this.window();if(!e||!this.resources.length)return D``;let t=[...Array(e.days).keys()].map(t=>H.addDays(e.from,t)),n=new Date,r=H.daysBetween(e.from,new Date(n.getFullYear(),n.getMonth(),n.getDate())),i=r>=0&&r<e.days,a=[],o;return this.resources.forEach(n=>{n.group&&n.group!==o&&a.push(D`<div class="group">${n.group}</div>`),o=n.group,a.push(this.renderRow(n,e,t,i?r:null))}),D`
            <div class="frame" style="grid-template-columns: minmax(${8+4.5*this.attributeColumns.length}rem, ${12+4.5*this.attributeColumns.length}rem) repeat(${e.days}, minmax(2.2rem, 1fr));">
                <div class="corner"><span class="res-name">Resource</span>${this.attributeColumns.map(e=>D`<span class="attr">${e}</span>`)}</div>
                ${t.map((e,t)=>D`
                    <div class="day-head ${this.isWeekend(e)?`weekend`:``} ${t===r?`today`:``}">
                        <span class="dow">${e.toLocaleDateString(void 0,{weekday:`short`})}</span>
                        <span class="num">${e.getDate()}</span>
                    </div>
                `)}
                ${a}
            </div>
        `}isWeekend(e){return e.getDay()===0||e.getDay()===6}renderRow(e,t,n,r){let i=100/t.days,a=this.blocks.filter(t=>t.resourceId===e.id&&t.start&&t.end),o=this.drag?.moved&&this.drag.targetResourceId===e.id?this.drag:null;return D`
            <div class="label" title="${e.label??``}">
                <span class="res-name">${e.icon?L(e.icon):x}${e.label}</span>
                ${this.attributeColumns.map((t,n)=>D`<span class="attr">${(e.attributes??[])[n]??``}</span>`)}
            </div>
            <div class="lane" data-resource-id="${e.id}">
                <div class="cells ${this.rangeSelectActionId?`selectable`:``}"
                     @pointerdown="${t=>this.onCellsPointerDown(t,e.id)}"
                     @pointermove="${e=>this.onCellsPointerMove(e)}"
                     @pointerup="${()=>this.onCellsPointerUp()}"
                     @pointercancel="${()=>this.endDrag()}">
                    ${n.map(e=>D`<div class="cell ${this.isWeekend(e)?`weekend`:``}"></div>`)}
                </div>
                ${r==null?x:D`<div class="today-line" style="left: ${(r+.5)*i}%;"></div>`}
                ${a.map(e=>{let n=H.daysBetween(t.from,H.parse(e.start)),r=H.daysBetween(t.from,H.parse(e.end));if(r<0||n>=t.days)return x;let a=Math.max(0,n),o=Math.min(t.days-1,r),s=this.drag?.moved&&this.drag.blockId===e.id,c=this.resize?.blockId===e.id?this.resize:null,l=c?Math.max(0,c.startIdx):a,u=c?Math.min(t.days-1,c.endIdx):o,d=e.summary??`${e.label??``} · ${e.start} → ${e.end}${e.status?` · ${e.status}`:``}`;return D`
                        <div class="block ${this.selectActionId?`clickable`:``} ${this.moveActionId?`draggable`:``} ${s?`dragging`:``}"
                             title="${d}"
                             style="left: ${l*i}%; width: ${(u-l+1)*i}%; ${e.color?`--mateu-planning-block: ${e.color};`:``}"
                             @dblclick="${this.openActionId?()=>this.emit(this.openActionId,{_blockId:e.id}):x}"
                             @pointerdown="${t=>this.onBlockPointerDown(t,e,n)}"
                             @pointermove="${e=>this.onBlockPointerMove(e)}"
                             @pointerup="${()=>this.onBlockPointerUp(e)}"
                             @pointercancel="${()=>this.endDrag()}"
                        >${this.resizeActionId?D`<span class="handle start"
                                @pointerdown="${t=>this.onHandlePointerDown(t,e,`start`,n,r)}"
                                @pointermove="${e=>this.onHandlePointerMove(e)}"
                                @pointerup="${e=>this.onHandlePointerUp(e)}"></span>`:x}${e.icon?L(e.icon):x}${e.label}${this.resizeActionId?D`<span class="handle end"
                                @pointerdown="${t=>this.onHandlePointerDown(t,e,`end`,n,r)}"
                                @pointermove="${e=>this.onHandlePointerMove(e)}"
                                @pointerup="${e=>this.onHandlePointerUp(e)}"></span>`:x}</div>
                    `})}
                ${this.range&&this.range.resourceId===e.id?(()=>{let{startIdx:e,endIdx:t}=Ks(this.range.anchorIdx,this.range.currentIdx);return D`<div class="range" style="left: ${e*i}%; width: ${(t-e+1)*i}%;"></div>`})():x}
                ${o?D`
                    <div class="ghost"
                         style="left: ${o.targetStartIdx*i}%; width: ${Math.min(o.duration,t.days-o.targetStartIdx)*i}%;"></div>
                `:x}
            </div>
        `}};A([y({type:Array})],U.prototype,`resources`,void 0),A([y({type:Array})],U.prototype,`blocks`,void 0),A([y()],U.prototype,`from`,void 0),A([y()],U.prototype,`to`,void 0),A([y()],U.prototype,`moveActionId`,void 0),A([y()],U.prototype,`selectActionId`,void 0),A([y({type:Array})],U.prototype,`attributeColumns`,void 0),A([y()],U.prototype,`resizeActionId`,void 0),A([y()],U.prototype,`openActionId`,void 0),A([y()],U.prototype,`rangeSelectActionId`,void 0),A([C()],U.prototype,`resize`,void 0),A([C()],U.prototype,`range`,void 0),A([C()],U.prototype,`drag`,void 0),U=H=A([w(`mateu-planning-board`)],U);var Js=e=>{let t=e.metadata;return D`
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
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-planning-board>
    `},Ys=class extends S{constructor(...e){super(...e),this.columns=[]}static{this.styles=v`
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
    
        ${V}
    `}clickCard(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedCard:e}},bubbles:!0,composed:!0}))}render(){return D`
            <div class="board">
                ${this.columns.map(e=>D`
                    <div class="column" style="${e.color?`--mateu-kanban-accent: ${e.color};`:``}">
                        <div class="column-head">
                            <span class="column-title" title="${e.title??``}">${e.title}</span>
                            <span class="count">${e.cards?.length??0}</span>
                        </div>
                        ${(e.cards??[]).map(e=>D`
                            <div role="button" tabindex="0" class="card ${e.actionId?`clickable`:``}"
                                 style="${e.color?`--mateu-kanban-card-accent: ${e.color};`:``}"
                                 @click="${()=>this.clickCard(e)}" @keydown="${B(()=>this.clickCard(e))}">
                                <span class="card-title">${e.title}</span>
                                ${e.description?D`<span class="card-desc">${e.description}</span>`:x}
                                ${e.badge?D`<span class="badge">${e.badge}</span>`:x}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};A([y({type:Array})],Ys.prototype,`columns`,void 0),Ys=A([w(`mateu-kanban`)],Ys);var Xs=e=>D`
        <mateu-kanban
                .columns="${e.metadata.columns??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-kanban>
    `,Zs=class extends S{constructor(...e){super(...e),this.items=[]}static{this.styles=v`
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
    
        ${V}
    `}clickItem(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedItem:e}},bubbles:!0,composed:!0}))}render(){return D`
            <div class="feed">
                ${this.items.map(e=>D`
                    <div class="item ${e.actionId?`clickable`:``}">
                        <div class="rail">
                            <div class="dot" style="${e.color?`--mateu-timeline-dot: ${e.color};`:``}">${e.icon??``}</div>
                            <div class="line"></div>
                        </div>
                        <div role="button" tabindex="0" class="body" @click="${()=>this.clickItem(e)}" @keydown="${B(()=>this.clickItem(e))}">
                            <div class="head">
                                <span class="title">${e.title}</span>
                                ${e.timestamp?D`<span class="time">${e.timestamp}</span>`:x}
                            </div>
                            ${e.description?D`<div class="desc">${e.description}</div>`:x}
                        </div>
                    </div>
                `)}
            </div>
        `}};A([y({type:Array})],Zs.prototype,`items`,void 0),Zs=A([w(`mateu-timeline`)],Zs);var Qs=e=>D`
        <mateu-timeline
                .items="${e.metadata.items??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-timeline>
    `,$s=class extends S{constructor(...e){super(...e),this.steps=[],this.vertical=!1}static{this.styles=v`
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
    `}updated(){let e=this.steps.length;if(e===0)return;let t=this.steps.findIndex(e=>e.status===`current`),n=this.steps.every(e=>e.status===`done`),r=t>=0?t+1:n?e:0;this.dispatchEvent(new CustomEvent(`mateu-guided-progress`,{detail:{current:r,total:e,steps:this.steps.map(e=>({id:e.id,title:e.title,status:e.status??`upcoming`}))},bubbles:!0,composed:!0}))}render(){return D`
            <div class="steps">
                ${this.steps.map((e,t)=>{let n=e.status??`upcoming`;return D`
                        <div class="step ${n}">
                            <div class="connector"></div>
                            <div class="dot">${n===`done`?`✓`:t+1}</div>
                            <div class="label">${e.title}</div>
                            ${e.description?D`<div class="desc">${e.description}</div>`:x}
                        </div>
                    `})}
            </div>
        `}};A([y({type:Array})],$s.prototype,`steps`,void 0),A([y({type:Boolean,reflect:!0})],$s.prototype,`vertical`,void 0),$s=A([w(`mateu-progress-steps`)],$s);var ec=e=>{let t=e.metadata;return D`
        <mateu-progress-steps
                .steps="${t.steps??[]}"
                ?vertical="${t.vertical??!1}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-progress-steps>
    `},tc=class extends S{constructor(...e){super(...e),this.spark=[]}static{this.styles=v`
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
    
        ${V}
    `}sparkline(){let e=this.spark;if(!e||e.length<2)return x;let t=Math.min(...e),n=Math.max(...e)-t||1,r=80/(e.length-1),i=e.map((e,i)=>[2+i*r,2+26*(1-(e-t)/n)]),a=i.map(([e,t],n)=>`${n===0?`M`:`L`}${e.toFixed(1)} ${t.toFixed(1)}`).join(` `),o=`${a} L${i[i.length-1][0].toFixed(1)} 30 L${i[0][0].toFixed(1)} 30 Z`,s=this.trend===`down`?`var(--lumo-error-color, #e11d48)`:this.trend===`flat`?`var(--lumo-secondary-text-color, #888)`:`var(--lumo-success-color, #12b76a)`;return b`
            <svg width="${84}" height="${30}" viewBox="0 0 ${84} ${30}">
                <path d="${o}" fill="${s}" opacity="0.12"></path>
                <path d="${a}" fill="none" stroke="${s}" stroke-width="1.6"
                      stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>
        `}dispatchAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){let e=this.trend??`up`;return D`
            <div role="button" tabindex="0" class="tile ${this.actionId?`clickable`:``}" @click="${()=>this.dispatchAction()}" @keydown="${B(()=>this.dispatchAction())}">
                ${this.label?D`<span class="label">${this.label}</span>`:x}
                <span class="value">${this.value}${this.unit?D`<span class="unit">${this.unit}</span>`:x}</span>
                <div class="foot">
                    ${this.delta?D`<span class="delta ${e}">${e===`up`?`▲`:e===`down`?`▼`:`→`} ${this.delta}</span>`:D`<span></span>`}
                    ${this.sparkline()}
                </div>
            </div>
        `}};A([y()],tc.prototype,`label`,void 0),A([y()],tc.prototype,`value`,void 0),A([y()],tc.prototype,`unit`,void 0),A([y()],tc.prototype,`delta`,void 0),A([y()],tc.prototype,`trend`,void 0),A([y({type:Array})],tc.prototype,`spark`,void 0),A([y()],tc.prototype,`actionId`,void 0),tc=A([w(`mateu-stat`)],tc);var nc=e=>{let t=e.metadata;return D`
        <mateu-stat
                label="${t.label??x}"
                value="${t.value??x}"
                unit="${t.unit??x}"
                delta="${t.delta??x}"
                trend="${t.trend??x}"
                actionId="${t.actionId??x}"
                .spark="${t.spark??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-stat>
    `},rc=e=>{let[t,n,r]=e.split(`-`).map(Number);return Date.UTC(t,n-1,r)},ic=e=>new Date(e).toISOString().slice(0,10),ac=(e,t)=>ic(rc(e)+t*864e5),oc=e=>(new Date(rc(e)).getUTCDay()+6)%7,sc=e=>e.slice(0,8)+`01`,cc=e=>{let[t,n]=e.split(`-`).map(Number);return ic(Date.UTC(t,n,0))},lc=()=>{let e=new Date;return ic(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()))},uc=(e,t)=>{if(e===`day`)return{from:t,to:t};if(e===`week`){let e=ac(t,-oc(t));return{from:e,to:ac(e,6)}}return{from:sc(t),to:cc(t)}},dc=(e,t)=>{let n=[];for(let r=e;r<=t;r=ac(r,1))n.push(r);return n},fc=e=>{let t=sc(e),n=Array(oc(t)).fill(null);for(n.push(...dc(t,cc(e)));n.length%7;)n.push(null);let r=[];for(let e=0;e<n.length;e+=7)r.push(n.slice(e,e+7));return r},pc=(e,t)=>e.filter(e=>e.date&&e.date<=t&&(e.endDate||e.date)>=t).map((e,t)=>({e,i:t})).sort((e,t)=>(e.e.startTime||``).localeCompare(t.e.startTime||``)||e.i-t.i).map(({e})=>e),mc=(e,t,n)=>dc(t,n).map(t=>({date:t,events:pc(e,t)})).filter(e=>e.events.length),hc=(e,t)=>(e||[]).find(e=>e.date===t),gc=e=>e.startTime?e.startTime+(e.endTime?`–`+e.endTime:``):``,_c=new Set([`info`,`success`,`warning`,`danger`,`neutral`]),vc=e=>e&&_c.has(e)?`tone-`+e:``,yc=class extends S{constructor(...e){super(...e),this.events=[],this.views=[],this.days=[]}willUpdate(e){(e.has(`view`)||!this.shown)&&(this.shown=this.view||`month`)}static{this.styles=v`
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

        ${V}
    `}clickEvent(e,t){t?.stopPropagation(),e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedEvent:e}},bubbles:!0,composed:!0}))}clickDay(e){this.dayActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.dayActionId,parameters:{_date:e}},bubbles:!0,composed:!0}))}chip(e,t){let n=t?gc(e):``;return D`
            <span role="button" tabindex="0" class="chip ${e.actionId?`clickable`:``}"
                  style="${e.color?`--mateu-cal-accent: ${e.color};`:``}"
                  title="${(n?n+` `:``)+(e.title??``)}"
                  @click="${t=>this.clickEvent(e,t)}"
                  @keydown="${B(()=>this.clickEvent(e))}">${n?D`<span class="time">${n}</span>`:x}${e.title}</span>`}dayCell(e,t,n=!0){let r=hc(this.days,e),i=!!this.dayActionId,a=pc(this.events,e),o=new Date(e+`T00:00:00`).toLocaleDateString(void 0,{weekday:`long`,day:`numeric`,month:`long`})+(r?.label?`, `+r.label:``)+(a.length?`, `+a.length+` event`+(a.length>1?`s`:``):``);return D`
            <div class="cell ${e===lc()?`today`:``} ${vc(r?.tone)} ${i?`clickable`:``}"
                 role="${i?`button`:x}" tabindex="${i?`0`:x}"
                 aria-label="${i?o:x}"
                 @click="${i?()=>this.clickDay(e):x}"
                 @keydown="${i?B(()=>this.clickDay(e)):x}">
                <div class="top">
                    ${r?.label?D`<span class="label">${r.label}</span>`:x}
                    ${n?D`<span class="num">${Number(e.slice(8))}</span>`:x}
                </div>
                ${a.map(e=>this.chip(e,t))}
            </div>`}renderMonth(e){return D`
            <div class="grid month">
                ${[`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`,`Sun`].map(e=>D`<div class="dow">${e}</div>`)}
                ${fc(e).flat().map(e=>e?this.dayCell(e,!1):D`<div class="cell blank"></div>`)}
            </div>`}renderWeek(e){let{from:t,to:n}=uc(`week`,e),r=dc(t,n);return D`
            <div class="grid week">
                ${r.map(e=>D`<div class="dow">${new Date(e+`T00:00:00`).toLocaleDateString(void 0,{weekday:`short`,day:`numeric`})}</div>`)}
                ${r.map(e=>this.dayCell(e,!0,!1))}
            </div>`}renderDay(e){return D`
            <div class="grid day">
                <div class="dow">${new Date(e+`T00:00:00`).toLocaleDateString(void 0,{weekday:`long`,day:`numeric`,month:`long`})}</div>
                ${this.dayCell(e,!0,!1)}
            </div>`}renderList(e){let{from:t,to:n}=uc(`list`,e),r=mc(this.events,t,n);return r.length?D`
            <div class="agenda">
                ${r.map(({date:e,events:t})=>{let n=hc(this.days,e);return D`
                        <div class="date ${vc(n?.tone)}">
                            <span>${new Date(e+`T00:00:00`).toLocaleDateString(void 0,{weekday:`long`,day:`numeric`,month:`long`})}</span>
                            ${n?.label?D`<span class="label">${n.label}</span>`:x}
                        </div>
                        <div class="entries">${t.map(e=>this.chip(e,!0))}</div>`})}
            </div>`:D`<div class="agenda"><div class="empty">No events</div></div>`}titleOf(e,t){let n=new Date(t+`T00:00:00`);if(e===`day`)return n.toLocaleDateString(void 0,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`});if(e===`week`){let{from:e,to:n}=uc(`week`,t),r=new Date(e+`T00:00:00`),i=new Date(n+`T00:00:00`);return r.toLocaleDateString(void 0,{day:`numeric`,month:`short`})+` – `+i.toLocaleDateString(void 0,{day:`numeric`,month:`short`,year:`numeric`})}return n.toLocaleDateString(void 0,{month:`long`,year:`numeric`})}render(){let e=this.month||lc(),t=this.shown||`month`;return D`
            <div class="head">
                <div class="title">${this.titleOf(t,e)}</div>
                ${this.views&&this.views.length>1?D`
                    <div class="switcher" role="group" aria-label="View">
                        ${this.views.map(e=>D`<button type="button" aria-pressed="${e===t?`true`:`false`}"
                            @click="${()=>{this.shown=e}}">${e.charAt(0).toUpperCase()+e.slice(1)}</button>`)}
                    </div>`:x}
            </div>
            ${t===`week`?this.renderWeek(e):t===`day`?this.renderDay(e):t===`list`?this.renderList(e):this.renderMonth(e)}
        `}};A([y()],yc.prototype,`month`,void 0),A([y({type:Array})],yc.prototype,`events`,void 0),A([y()],yc.prototype,`view`,void 0),A([y({type:Array})],yc.prototype,`views`,void 0),A([y({type:Array})],yc.prototype,`days`,void 0),A([y()],yc.prototype,`dayActionId`,void 0),A([C()],yc.prototype,`shown`,void 0),yc=A([w(`mateu-calendar`)],yc);var bc=e=>{let t=e.metadata;return D`
        <mateu-calendar
                month="${t.month??x}"
                .events="${t.events??[]}"
                view="${t.view??x}"
                .views="${t.views??[]}"
                .days="${t.days??[]}"
                dayActionId="${t.dayActionId??x}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-calendar>
    `},xc=class extends S{constructor(...e){super(...e),this.plans=[]}static{this.styles=v`
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
    `}cta(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return D`
            <div class="plans">
                ${this.plans.map(e=>D`
                    <div class="plan ${e.featured?`featured`:``}">
                        ${e.featured?D`<span class="badge">Recommended</span>`:x}
                        <span class="name">${e.name}</span>
                        <div>
                            <span class="price">${e.price}</span>
                            ${e.period?D`<span class="period">${e.period}</span>`:x}
                        </div>
                        <ul>
                            ${(e.features??[]).map(e=>D`<li>${e}</li>`)}
                        </ul>
                        ${e.ctaLabel?D`
                            <button class="cta" @click="${()=>this.cta(e)}">${e.ctaLabel}</button>
                        `:x}
                    </div>
                `)}
            </div>
        `}};A([y({type:Array})],xc.prototype,`plans`,void 0),xc=A([w(`mateu-pricing-table`)],xc);var Sc=e=>D`
        <mateu-pricing-table
                .plans="${e.metadata.plans??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-pricing-table>
    `,Cc=class extends S{static{this.styles=v`
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
    
        ${V}
    `}clickNode(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_clickedNode:e}},bubbles:!0,composed:!0}))}renderNode(e){let t=e.avatar,n=t&&(t.startsWith(`http`)||t.startsWith(`data:`));return D`
            <li>
                <div role="button" tabindex="0" class="node ${e.actionId?`clickable`:``}"
                     style="${e.color?`--mateu-org-accent: ${e.color};`:``}"
                     @click="${()=>this.clickNode(e)}" @keydown="${B(()=>this.clickNode(e))}">
                    ${t?D`<span class="avatar">${n?D`<img src="${t}" alt="">`:t}</span>`:x}
                    <span class="title">${e.title}</span>
                    ${e.subtitle?D`<span class="subtitle">${e.subtitle}</span>`:x}
                </div>
                ${e.children&&e.children.length?D`<ul>${e.children.map(e=>this.renderNode(e))}</ul>`:x}
            </li>
        `}render(){return this.root?D`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`:D``}};A([y({attribute:!1})],Cc.prototype,`root`,void 0),Cc=A([w(`mateu-org-chart`)],Cc);var wc=e=>D`
        <mateu-org-chart
                .root="${e.metadata.root}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-org-chart>
    `,Tc=1440*60*1e3,Ec=class extends S{constructor(...e){super(...e),this.cells=[]}static{this.styles=v`
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
    `}color(e,t){if(e<=0||t<=0)return`var(--lumo-contrast-10pct, #ebedf0)`;let n=e/t;return`color-mix(in srgb, var(--lumo-primary-color, #1a73e8) ${Math.round((n>.75?1:n>.5?.75:n>.25?.5:.3)*100)}%, transparent)`}render(){let e=this.cells.filter(e=>!!e.date);if(!e.length)return D``;let t=e.map(e=>new Date(e.date+`T00:00:00`).getTime()),n=Math.min(...t),r=Math.max(...t),i=new Date(n);i.setDate(i.getDate()-(i.getDay()+6)%7);let a={};for(let t of e)a[t.date]=t;let o=Math.max(...e.map(e=>e.value??0),1),s=[];for(let e=i.getTime();e<=r;e+=Tc){let t=new Date(e),n=t.toISOString().slice(0,10),r=a[n],i=r?.value??0,c=(t.getDay()+6)%7+1,l=r?.label??`${n}: ${i}`;s.push(D`
                <div class="cell" style="grid-row: ${c}; --cell: ${this.color(i,o)};" title="${l}"></div>
            `)}return D`
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
        `}};A([y({type:Array})],Ec.prototype,`cells`,void 0),Ec=A([w(`mateu-heatmap`)],Ec);var Dc=e=>D`
        <mateu-heatmap
                .cells="${e.metadata.cells??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-heatmap>
    `,Oc=class extends S{constructor(...e){super(...e),this.stages=[]}static{this.styles=v`
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
    `}render(){let e=this.stages;if(!e.length)return D``;let t=e[0].value??0,n=Math.max(...e.map(e=>e.value??0),1);return D`
            <div class="funnel">
                ${e.map((r,i)=>{let a=r.value??0,o=n>0?Math.max(6,a/n*100):6,s=i>0?e[i-1].value??0:t,c=i===0?t>0?`100%`:``:s>0?`${Math.round(a/s*100)}%`:`0%`;return D`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${r.label}</span>
                                ${i>0?D`<span class="conv">${c} of previous</span>`:x}
                            </div>
                            <div class="bar" style="width: ${o}%; ${r.color?`--bar: ${r.color};`:``}">
                                ${a.toLocaleString()}
                            </div>
                        </div>
                    `})}
            </div>
        `}};A([y({type:Array})],Oc.prototype,`stages`,void 0),Oc=A([w(`mateu-funnel`)],Oc);var kc=e=>D`
        <mateu-funnel
                .stages="${e.metadata.stages??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-funnel>
    `,Ac=class extends S{constructor(...e){super(...e),this.values=[],this.labels=[],this.area=!1}static{this.styles=v`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .title { font-weight: 600; margin-bottom: .35rem; color: var(--lumo-body-text-color, #222); }
        svg { display: block; width: 100%; height: auto; overflow: visible; }
        .labels { display: flex; justify-content: space-between; color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); margin-top: .2rem; }
    `}render(){let e=this.values;if(!e||e.length<2)return D``;let t=Math.min(...e),n=Math.max(...e),r=n-t||1,i=584/(e.length-1),a=e.map((e,n)=>[8+n*i,8+144*(1-(e-t)/r)]),o=a.map(([e,t],n)=>`${n===0?`M`:`L`}${e.toFixed(1)} ${t.toFixed(1)}`).join(` `),s=`${o} L${a[a.length-1][0].toFixed(1)} 152 L${a[0][0].toFixed(1)} 152 Z`,c=this.color||`var(--lumo-primary-color, #1a73e8)`,l=e.indexOf(n),u=e.indexOf(t);return D`
            ${this.heading?D`<div class="title">${this.heading}</div>`:x}
            <svg viewBox="0 0 ${600} ${160}" preserveAspectRatio="none">
                ${this.area?b`<path d="${s}" fill="${c}" opacity="0.12"></path>`:x}
                <path d="${o}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
                ${a.map((t,n)=>n===l||n===u?b`<circle cx="${t[0]}" cy="${t[1]}" r="3.2" fill="${c}"><title>${this.labels[n]??``}: ${e[n]}</title></circle>`:b`<circle cx="${t[0]}" cy="${t[1]}" r="6" fill="transparent"><title>${this.labels[n]??``}: ${e[n]}</title></circle>`)}
            </svg>
            ${this.labels&&this.labels.length?D`<div class="labels"><span>${this.labels[0]}</span><span>${this.labels[this.labels.length-1]}</span></div>`:x}
        `}};A([y()],Ac.prototype,`heading`,void 0),A([y({type:Array})],Ac.prototype,`values`,void 0),A([y({type:Array})],Ac.prototype,`labels`,void 0),A([y()],Ac.prototype,`color`,void 0),A([y({type:Boolean})],Ac.prototype,`area`,void 0),Ac=A([w(`mateu-trend-chart`)],Ac);var jc=e=>{let t=e.metadata;return D`
        <mateu-trend-chart
                heading="${t.title??x}"
                color="${t.color??x}"
                ?area="${t.area??!1}"
                .values="${t.values??[]}"
                .labels="${t.labels??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-trend-chart>
    `},Mc=class extends S{constructor(...e){super(...e),this.features=[],this.columns=0}static{this.styles=v`
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
    
        ${V}
    `}clickFeature(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}render(){return D`
            <div class="grid" style="grid-template-columns: ${this.columns&&this.columns>0?`repeat(${this.columns}, minmax(0, 1fr))`:`repeat(auto-fit, minmax(15rem, 1fr))`};">
                ${this.features.map(e=>D`
                    <div role="button" tabindex="0" class="card ${e.actionId?`clickable`:``}" @click="${()=>this.clickFeature(e)}" @keydown="${B(()=>this.clickFeature(e))}">
                        ${e.icon?D`<span class="icon">${e.icon}</span>`:x}
                        <span class="title">${e.title}</span>
                        ${e.description?D`<span class="desc">${e.description}</span>`:x}
                    </div>
                `)}
            </div>
        `}};A([y({type:Array})],Mc.prototype,`features`,void 0),A([y({type:Number})],Mc.prototype,`columns`,void 0),Mc=A([w(`mateu-feature-grid`)],Mc);var Nc=e=>{let t=e.metadata;return D`
        <mateu-feature-grid
                .features="${t.features??[]}"
                .columns="${t.columns??0}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-feature-grid>
    `},Pc=class extends S{constructor(...e){super(...e),this.items=[]}static{this.styles=v`
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
    `}stars(e){let t=Math.max(0,Math.min(5,e||0));return`★`.repeat(t)+`☆`.repeat(5-t)}render(){return D`
            <div class="grid">
                ${this.items.map(e=>{let t=e.avatar&&(e.avatar.startsWith(`http`)||e.avatar.startsWith(`data:`));return D`
                        <div class="card">
                            ${e.rating?D`<div class="stars">${this.stars(e.rating)}</div>`:x}
                            <div class="quote">${e.quote}</div>
                            <div class="author">
                                ${e.avatar?D`<span class="avatar">${t?D`<img src="${e.avatar}" alt="">`:e.avatar}</span>`:x}
                                <div>
                                    <div class="name">${e.author}</div>
                                    ${e.role?D`<div class="role">${e.role}</div>`:x}
                                </div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};A([y({type:Array})],Pc.prototype,`items`,void 0),Pc=A([w(`mateu-testimonials`)],Pc);var Fc=e=>D`
        <mateu-testimonials
                .items="${e.metadata.items??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-testimonials>
    `,Ic=class extends S{constructor(...e){super(...e),this.items=[],this.openSet=new Set,this.seeded=!1}static{this.styles=v`
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
    
        ${V}
    `}seed(){this.seeded||(this.seeded=!0,this.items.forEach((e,t)=>{e.open&&this.openSet.add(t)}))}toggle(e){this.openSet.has(e)?this.openSet.delete(e):this.openSet.add(e),this.requestUpdate()}render(){return this.seed(),D`
            <div class="list">
                ${this.items.map((e,t)=>{let n=this.openSet.has(t);return D`
                        <div class="item ${n?`open`:``}">
                            <div role="button" tabindex="0" aria-expanded="${n}" class="q" @click="${()=>this.toggle(t)}" @keydown="${B(()=>this.toggle(t))}">
                                <span>${e.question}</span>
                                <span class="chevron">›</span>
                            </div>
                            ${n?D`<div class="a">${e.answer}</div>`:``}
                        </div>
                    `})}
            </div>
        `}};A([y({type:Array})],Ic.prototype,`items`,void 0),A([C()],Ic.prototype,`openSet`,void 0),Ic=A([w(`mateu-faq`)],Ic);var Lc=e=>D`
        <mateu-faq
                .items="${e.metadata.items??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-faq>
    `,Rc=class extends S{static{this.styles=v`
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
    `}themeVars(){switch(this.theme){case`success`:return`--accent: var(--lumo-success-color, #12b76a); --bg: var(--lumo-success-color-10pct, rgba(18,183,106,.1));`;case`warning`:return`--accent: #f59e0b; --bg: rgba(245,158,11,.12);`;case`danger`:return`--accent: var(--lumo-error-color, #e11d48); --bg: var(--lumo-error-color-10pct, rgba(225,29,72,.1));`;default:return`--accent: var(--lumo-primary-color, #1a73e8); --bg: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));`}}cta(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){return D`
            <div class="callout" style="${this.themeVars()}">
                ${this.icon?D`<span class="icon">${this.icon}</span>`:x}
                <div class="body">
                    ${this.heading?D`<span class="heading">${this.heading}</span>`:x}
                    ${this.description?D`<span class="desc">${this.description}</span>`:x}
                    ${this.ctaLabel?D`<button class="cta" @click="${()=>this.cta()}">${this.ctaLabel}</button>`:x}
                </div>
            </div>
        `}};A([y()],Rc.prototype,`heading`,void 0),A([y()],Rc.prototype,`description`,void 0),A([y()],Rc.prototype,`icon`,void 0),A([y()],Rc.prototype,`ctaLabel`,void 0),A([y()],Rc.prototype,`actionId`,void 0),A([y()],Rc.prototype,`theme`,void 0),Rc=A([w(`mateu-callout-card`)],Rc);var zc=e=>{let t=e.metadata;return D`
        <mateu-callout-card
                heading="${t.title??x}"
                description="${t.description??x}"
                icon="${t.icon??x}"
                ctaLabel="${t.ctaLabel??x}"
                actionId="${t.actionId??x}"
                theme="${t.theme??x}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-callout-card>
    `},Bc=class extends S{constructor(...e){super(...e),this.comments=[]}static{this.styles=v`
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
    `}renderComment(e){let t=e.avatar&&(e.avatar.startsWith(`http`)||e.avatar.startsWith(`data:`));return D`
            <div class="comment">
                <span class="avatar">${e.avatar?t?D`<img src="${e.avatar}" alt="">`:e.avatar:e.author?.[0]??`?`}</span>
                <div class="body">
                    <div class="head">
                        <span class="author">${e.author}</span>
                        ${e.timestamp?D`<span class="time">${e.timestamp}</span>`:x}
                    </div>
                    <div class="text">${e.text}</div>
                    ${e.replies&&e.replies.length?D`<div class="replies">${e.replies.map(e=>this.renderComment(e))}</div>`:x}
                </div>
            </div>
        `}render(){return D`<div class="thread">${this.comments.map(e=>this.renderComment(e))}</div>`}};A([y({type:Array})],Bc.prototype,`comments`,void 0),Bc=A([w(`mateu-comment-thread`)],Bc);var Vc=e=>D`
        <mateu-comment-thread
                .comments="${e.metadata.comments??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-comment-thread>
    `,Hc={pdf:`📕`,image:`🖼️`,img:`🖼️`,doc:`📘`,docx:`📘`,word:`📘`,xls:`📗`,xlsx:`📗`,excel:`📗`,sheet:`📗`,zip:`🗜️`,archive:`🗜️`,video:`🎬`,audio:`🎵`,code:`💻`,csv:`📄`,txt:`📄`},Uc=class extends S{constructor(...e){super(...e),this.files=[]}static{this.styles=v`
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
    
        ${V}
    `}icon(e){return e&&Hc[e.toLowerCase()]||`📄`}clickFile(e,t){e.url||e.actionId&&(t.preventDefault(),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_file:e}},bubbles:!0,composed:!0})))}render(){return D`
            <div class="list">
                ${this.files.map(e=>{let t=!!e.url||!!e.actionId,n=D`
                        <span class="icon">${this.icon(e.type)}</span>
                        <span class="name">${e.name}</span>
                        ${e.size?D`<span class="size">${e.size}</span>`:x}
                        ${e.url?D`<span class="dl">⬇</span>`:x}
                    `;return e.url?D`<a class="file clickable" href="${e.url}" download target="_blank" rel="noopener">${n}</a>`:D`<div role="button" tabindex="0" class="file ${t?`clickable`:``}" @click="${t=>this.clickFile(e,t)}" @keydown="${B(t=>this.clickFile(e,t))}">${n}</div>`})}
            </div>
        `}};A([y({type:Array})],Uc.prototype,`files`,void 0),Uc=A([w(`mateu-file-list`)],Uc);var Wc=e=>D`
        <mateu-file-list
                .files="${e.metadata.files??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-file-list>
    `,Gc=class extends S{constructor(...e){super(...e),this.items=[],this.localDone=new Map}static{this.styles=v`
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
    
        ${V}
    `}isDone(e,t){return this.localDone.has(t)?!!this.localDone.get(t):!!e.done}toggle(e,t){let n=!this.isDone(e,t);this.localDone.set(t,n),this.requestUpdate(),e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{_item:e,_done:n}},bubbles:!0,composed:!0}))}render(){let e=this.items.length,t=this.items.filter((e,t)=>this.isDone(e,t)).length,n=e>0?Math.round(t/e*100):0;return D`
            <div class="head">
                ${this.heading?D`<span class="title">${this.heading}</span>`:D`<span></span>`}
                <span class="count">${t} / ${e}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${n}%;"></div></div>
            ${this.items.map((e,t)=>{let n=this.isDone(e,t);return D`
                    <div role="button" tabindex="0" class="item ${n?`done`:``}" @click="${()=>this.toggle(e,t)}" @keydown="${B(()=>this.toggle(e,t))}">
                        <span class="box">${n?`✓`:x}</span>
                        <span class="label">${e.label}</span>
                    </div>
                `})}
        `}};A([y()],Gc.prototype,`heading`,void 0),A([y({type:Array})],Gc.prototype,`items`,void 0),A([C()],Gc.prototype,`localDone`,void 0),Gc=A([w(`mateu-checklist`)],Gc);var Kc=e=>{let t=e.metadata;return D`
        <mateu-checklist
                heading="${t.title??x}"
                .items="${t.items??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-checklist>
    `},qc=class extends S{static{this.styles=v`
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
    `}render(){let e=this.trend??`flat`;return D`
            <div class="card">
                ${this.heading?D`<div class="title">${this.heading}</div>`:x}
                <div class="row">
                    <div class="side">
                        ${this.leftLabel?D`<div class="label">${this.leftLabel}</div>`:x}
                        <div class="value">${this.leftValue}</div>
                    </div>
                    <div class="mid">
                        <span class="arrow">${`→`}</span>
                        ${this.delta?D`<span class="delta ${e}">${e===`up`?`▲`:e===`down`?`▼`:``} ${this.delta}</span>`:x}
                    </div>
                    <div class="side">
                        ${this.rightLabel?D`<div class="label">${this.rightLabel}</div>`:x}
                        <div class="value">${this.rightValue}</div>
                    </div>
                </div>
            </div>
        `}};A([y()],qc.prototype,`heading`,void 0),A([y()],qc.prototype,`leftLabel`,void 0),A([y()],qc.prototype,`leftValue`,void 0),A([y()],qc.prototype,`rightLabel`,void 0),A([y()],qc.prototype,`rightValue`,void 0),A([y()],qc.prototype,`delta`,void 0),A([y()],qc.prototype,`trend`,void 0),qc=A([w(`mateu-comparison-card`)],qc);var Jc=e=>{let t=e.metadata;return D`
        <mateu-comparison-card
                heading="${t.title??x}"
                leftLabel="${t.leftLabel??x}"
                leftValue="${t.leftValue??x}"
                rightLabel="${t.rightLabel??x}"
                rightValue="${t.rightValue??x}"
                delta="${t.delta??x}"
                trend="${t.trend??x}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-comparison-card>
    `},Yc=v`
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
`,Xc=new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}),Zc=e=>Number.isFinite(e)?Xc.format(e):``,Qc=(e,t)=>{let n=e<0?`-`:``,r=Zc(Math.abs(e));return t?`${n}${t} ${r}`:`${n}${r}`},$c=(e,t)=>t?`${Zc(e)} ${t}`:Zc(e),el=class extends S{constructor(...e){super(...e),this.title=``,this.badges=[],this.facts=[]}static{this.styles=[Yc,v`
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
    `]}render(){let e=!!(this.metricLabel||this.metricValue||this.metricCaption);return D`
            <div class="card">
                <div class="main">
                    <div class="title-row">
                        <span class="title">${this.title}</span>
                        ${this.badges.map(e=>D`<span class="chip ${e.color??``}">${e.label}</span>`)}
                    </div>
                    ${this.subtitle?D`<span class="subtitle">${this.subtitle}</span>`:x}
                    ${this.facts.length?D`
                        <div class="facts">
                            ${this.facts.map(e=>D`
                                <div class="fact">
                                    <span class="label">${e.label}</span>
                                    <span class="value">${e.value}</span>
                                </div>
                            `)}
                        </div>
                    `:x}
                </div>
                ${e?D`
                    <div class="metric">
                        ${this.metricLabel?D`<span class="label">${this.metricLabel}</span>`:x}
                        ${this.metricValue?D`<span class="value">${this.metricValue}</span>`:x}
                        ${this.metricCaption?D`<span class="caption">${this.metricCaption}</span>`:x}
                    </div>
                `:x}
            </div>
        `}};A([y()],el.prototype,`title`,void 0),A([y({type:Array})],el.prototype,`badges`,void 0),A([y()],el.prototype,`subtitle`,void 0),A([y({type:Array})],el.prototype,`facts`,void 0),A([y()],el.prototype,`metricLabel`,void 0),A([y()],el.prototype,`metricValue`,void 0),A([y()],el.prototype,`metricCaption`,void 0),el=A([w(`mateu-entity-header`)],el);var tl=e=>{if(e.__hoistedToPageHeader)return D``;let t=e.metadata;return D`
        <mateu-entity-header
                .title="${t.title??``}"
                .badges="${t.badges??[]}"
                .subtitle="${t.subtitle}"
                .facts="${t.facts??[]}"
                .metricLabel="${t.metricLabel}"
                .metricValue="${t.metricValue}"
                .metricCaption="${t.metricCaption}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-entity-header>
    `},nl=class extends S{constructor(...e){super(...e),this.value=0,this.max=0}static{this.styles=v`
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
    `}fillColor(){return this.dangerAt!=null&&this.value>=this.dangerAt?`error`:this.warnAt!=null&&this.value>=this.warnAt?`warning`:this.warnAt!=null||this.dangerAt!=null?`success`:`primary`}render(){let e=this.max>0?Math.min(Math.max(this.value/this.max,0),1):0,t=Math.round(e*100);return D`
            <div class="meter">
                ${this.label?D`<span class="label">${this.label}</span>`:x}
                <span class="value">${$c(this.value,this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${t}%"></div>
                </div>
                <span class="caption">${this.caption?this.caption:`${t}%`}</span>
            </div>
        `}};A([y()],nl.prototype,`label`,void 0),A([y({type:Number})],nl.prototype,`value`,void 0),A([y({type:Number})],nl.prototype,`max`,void 0),A([y()],nl.prototype,`unit`,void 0),A([y()],nl.prototype,`caption`,void 0),A([y({type:Number})],nl.prototype,`warnAt`,void 0),A([y({type:Number})],nl.prototype,`dangerAt`,void 0),nl=A([w(`mateu-meter`)],nl);var rl=e=>{let t=e.metadata;return D`
        <mateu-meter
                .label="${t.label}"
                .value="${t.value??0}"
                .max="${t.max??0}"
                .unit="${t.unit}"
                .caption="${t.caption}"
                .warnAt="${t.warnAt}"
                .dangerAt="${t.dangerAt}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-meter>
    `},il=class extends S{constructor(...e){super(...e),this.total=0,this.done=0}static{this.styles=v`
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
    `}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){let e=this.total>0&&this.done>=this.total,t=!e&&!!this.actionLabel&&!!this.actionId;return D`
            <div class="banner ${e?`complete`:``}">
                <span class="icon">👥</span>
                ${this.label?D`<span class="label">${this.label}</span>`:x}
                <div class="pills">
                    ${Array.from({length:this.total},(e,t)=>D`
                        <span class="pill ${t+1<=this.done?`filled`:``}">${t+1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${t?D`<button @click="${()=>this.runAction()}">${this.actionLabel} →</button>`:x}
            </div>
        `}};A([y()],il.prototype,`label`,void 0),A([y({type:Number})],il.prototype,`total`,void 0),A([y({type:Number})],il.prototype,`done`,void 0),A([y()],il.prototype,`actionLabel`,void 0),A([y()],il.prototype,`actionId`,void 0),il=A([w(`mateu-task-progress`)],il);var al=e=>{let t=e.metadata;return D`
        <mateu-task-progress
                .label="${t.label}"
                .total="${t.total??0}"
                .done="${t.done??0}"
                .actionLabel="${t.actionLabel}"
                .actionId="${t.actionId}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-task-progress>
    `},ol=class extends S{constructor(...e){super(...e),this.items=[],this.compact=!1,this.frameless=!1,this.columns=0,this.itemHeadingLevel=3}static{this.styles=[Yc,V,v`
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
    `]}runAction(e,t){t&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}rowClicked(e){this.rowActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.rowActionId,parameters:{_item:e.id}},bubbles:!0,composed:!0}))}renderItemAction(e,t,n,r){return!t||!n?x:r?D`
                <button class="icon-action" title="${t}" aria-label="${t}"
                    @click="${t=>{t.stopPropagation(),this.runAction(e,n)}}">
                    ${L(r)}
                </button>`:D`
            <button class="row-action" title="${t}"
                @click="${t=>{t.stopPropagation(),this.runAction(e,n)}}">${t}</button>`}render(){let e=this.columns>1||this.items.some(e=>e.actionId||e.actionId2||e.actionId3||(e.lines?.length??0)>0),t=this.itemHeadingLevel===4?`h4`:`h3`;return e?D`
                <div class="list stacked ${this.compact?`compact`:``} ${this.columns>1?`grid`:``}"
                     style="${this.columns>1?`grid-template-columns: repeat(auto-fit, minmax(min(18rem, calc(100% / ${this.columns} - 1.5rem)), 1fr));`:``}">
                    ${this.items.map(e=>D`
                        <div role="button" tabindex="0" class="cell ${(e.lines?.length??0)>0?`with-lines`:``} ${this.rowActionId?`clickable`:``}"
                             @click="${()=>this.rowClicked(e)}" @keydown="${B(()=>this.rowClicked(e))}">
                            <div class="cell-title-row">
                                ${t===`h4`?D`<h4 class="cell-title">${e.title}</h4>`:D`<h3 class="cell-title">${e.title}</h3>`}
                                ${e.status?D`<span class="chip ${e.statusColor??``}">${e.status}</span>`:x}
                            </div>
                            ${e.description?D`<span class="cell-description">${e.description}</span>`:x}
                            ${(e.lines??[]).map(e=>D`<span class="cell-line">${e}</span>`)}
                            ${e.actionId||e.actionId2||e.actionId3?D`
                                <div class="cell-actions">
                                    ${this.renderItemAction(e,e.actionLabel,e.actionId,e.actionIcon)}
                                    ${this.renderItemAction(e,e.actionLabel2,e.actionId2,e.actionIcon2)}
                                    ${this.renderItemAction(e,e.actionLabel3,e.actionId3,e.actionIcon3)}
                                </div>`:x}
                        </div>
                    `)}
                </div>
            `:D`
            <div class="list ${this.compact?`compact`:``} ${this.frameless?`frameless`:``}">
                ${this.items.map(e=>D`
                    <div role="button" tabindex="0" class="row ${this.rowActionId?`clickable`:``}"
                         @click="${()=>this.rowClicked(e)}" @keydown="${B(()=>this.rowClicked(e))}">
                        ${e.avatar?D`<span class="avatar">${e.avatar}</span>`:e.icon?D`<span class="icon">${e.icon}</span>`:x}
                        <div class="body">
                            <span class="title">${e.title}</span>
                            ${e.description?D`<span class="description">${e.description}</span>`:x}
                        </div>
                        ${e.status?D`<span class="chip ${e.statusColor??``}">${e.status}</span>`:x}
                    </div>
                `)}
            </div>
        `}};A([y({type:Array})],ol.prototype,`items`,void 0),A([y({type:Boolean})],ol.prototype,`compact`,void 0),A([y({type:Boolean})],ol.prototype,`frameless`,void 0),A([y()],ol.prototype,`rowActionId`,void 0),A([y({type:Number})],ol.prototype,`columns`,void 0),A([y({type:Number})],ol.prototype,`itemHeadingLevel`,void 0),ol=A([w(`mateu-status-list`)],ol);var sl=e=>{let t=e.metadata;return D`
        <mateu-status-list
                .items="${t.items??[]}"
                ?compact="${t.compact??!1}"
                ?frameless="${t.frameless??!1}"
                columns="${t.columns??0}"
                itemHeadingLevel="${t.itemHeadingLevel??3}"
                rowActionId="${E(t.rowActionId??void 0)}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-status-list>
    `},cl=class extends S{constructor(...e){super(...e),this.items=[]}static{this.styles=v`
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
    `}render(){return D`
            <ul>
                ${this.items.map(e=>D`<li>${e}</li>`)}
            </ul>
        `}};A([y({type:Array})],cl.prototype,`items`,void 0),cl=A([w(`mateu-bulleted-list`)],cl);var ll=e=>D`
        <mateu-bulleted-list
                .items="${e.metadata.items??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-bulleted-list>
    `,ul=[`a[href]`,`button`,`input`,`select`,`textarea`,`[tabindex]`,`vaadin-button`,`vaadin-text-field`,`vaadin-combo-box`,`vaadin-select`,`vaadin-checkbox`,`vaadin-date-picker`,`ui5-button`,`oj-c-button`].join(`,`),dl=e=>{let t=e;return t.hidden||t.hasAttribute(`disabled`)||t.getAttribute(`aria-hidden`)===`true`||t.getAttribute(`tabindex`)===`-1`?!1:!!(t.offsetParent||t.getClientRects().length)},fl=e=>{let t=[],n=e=>{e.querySelectorAll(`*`).forEach(e=>{e.matches(ul)&&dl(e)&&t.push(e),e.shadowRoot&&n(e.shadowRoot),e instanceof HTMLSlotElement&&e.assignedElements().forEach(e=>{e.matches(ul)&&dl(e)&&t.push(e),n(e)})})};return n(e),t.filter((e,n)=>t.indexOf(e)===n)},pl=(e,t={})=>{let n=ml(),r=[],i=()=>{r=fl(e)},a=t=>{if(t.key!==`Tab`)return;if(i(),r.length===0){t.preventDefault(),e.focus();return}let n=r[0],a=r[r.length-1],o=ml();t.shiftKey&&(o===n||!o||!hl(o,e))?(t.preventDefault(),a.focus()):!t.shiftKey&&o===a&&(t.preventDefault(),n.focus())};return e.addEventListener(`keydown`,a),requestAnimationFrame(()=>{i();let n=t.initialFocus?.()??r[0];n?n.focus():(e.hasAttribute(`tabindex`)||e.setAttribute(`tabindex`,`-1`),e.focus())}),{refresh:i,release(){e.removeEventListener(`keydown`,a);let t=ml();(!t||t===document.body||hl(t,e))&&n?.focus?.()}}},ml=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},hl=(e,t)=>{let n=e;for(;n;){if(n===t)return!0;n=n.parentNode??n.host??null}return!1},gl=e=>(e.label??``)+((e.count??0)>0?` (${(e.count??0)>25?`25+`:e.count})`:``),_l=(e,t={})=>{let n=(e.maxPerCategory??0)>0?e.maxPerCategory:10;return(e.categories??[]).map((e,r)=>{let i=(e.actions??[]).map((e,t)=>({a:e,i:t})).sort((e,t)=>Number(!!t.a.populated)-Number(!!e.a.populated)||e.i-t.i).map(({a:e})=>({label:gl(e),actionId:e.actionId??``,parameters:e.parameters??{},populated:!!e.populated,disabled:!!e.disabled}));t.hideUnpopulated&&(i=i.filter(e=>e.populated));let a=t.showAll?.has(r)?i:i.slice(0,n);return{title:e.title??``,actions:a,hiddenCount:i.length-a.length,index:r}}).filter(e=>e.actions.length>0)},vl=(e,t)=>{let n=String(e??``).toLowerCase().split(`+`).map(e=>e.trim()).filter(Boolean);if(!n.length)return!1;let r=e=>n.includes(e),i=n.find(e=>![`ctrl`,`control`,`alt`,`shift`,`meta`,`cmd`].includes(e));return!i||t.ctrlKey!==(r(`ctrl`)||r(`control`))||t.altKey!==r(`alt`)||t.shiftKey!==r(`shift`)||t.metaKey!==(r(`meta`)||r(`cmd`))?!1:t.key?.toLowerCase()===i||t.code===`Key`+i.toUpperCase()||t.code===`Digit`+i||t.code===`Numpad`+i},yl=class extends S{constructor(...e){super(...e),this.open=!1,this.hideUnpopulated=!1,this.showAll=new Set,this.keydown=e=>{if(this.open&&e.key===`Escape`){e.preventDefault(),this.close();return}!this.open&&this.panel?.shortcut&&this.isConnected&&this.getClientRects().length&&vl(this.panel.shortcut,e)&&(e.preventDefault(),this.show())}}connectedCallback(){super.connectedCallback(),document.addEventListener(`keydown`,this.keydown,!0)}disconnectedCallback(){document.removeEventListener(`keydown`,this.keydown,!0),this.focusTrap?.release(),this.focusTrap=void 0,super.disconnectedCallback()}show(){this.showAll=new Set,this.open=!0}close(){this.open=!1,this.focusTrap?.release(),this.focusTrap=void 0}updated(){let e=this.renderRoot.querySelector(`[role="dialog"]`);this.open&&e&&!this.focusTrap?this.focusTrap=pl(e):this.open&&this.focusTrap?.refresh()}pick(e){e.disabled||(this.close(),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:e.parameters},bubbles:!0,composed:!0})))}render(){let e=this.panel;if(!e)return x;let t=e.label||`I want to…`,n=_l(e,{showAll:this.showAll,hideUnpopulated:this.hideUnpopulated});return D`
            <button class="trigger" type="button" aria-haspopup="dialog" aria-expanded="${this.open?`true`:`false`}"
                    title="${e.shortcut?`${t} (${e.shortcut})`:t}"
                    @click="${()=>this.show()}">${t}</button>
            ${this.open?D`
                <div class="backdrop" @click="${()=>this.close()}"></div>
                <div class="dialog" role="dialog" aria-modal="true" aria-label="${t}">
                    <div class="head">
                        <h2>${t}</h2>
                        <button class="close" type="button" aria-label="Close" @click="${()=>this.close()}">✕</button>
                    </div>
                    ${e.hideUnpopulatedToggle?D`
                        <label class="toggle">
                            <input type="checkbox" role="switch" .checked="${this.hideUnpopulated}"
                                   @change="${e=>{this.hideUnpopulated=e.target.checked}}" />
                            Hide unpopulated
                        </label>`:x}
                    <div class="columns">
                        ${n.map(e=>D`
                            <section class="column" aria-label="${e.title}">
                                <h3>${e.title}</h3>
                                ${e.actions.map(e=>D`
                                    <button class="action ${e.populated?`populated`:``}" type="button"
                                            ?disabled="${e.disabled}"
                                            @click="${()=>this.pick(e)}">${e.label}</button>`)}
                                ${e.hiddenCount>0?D`
                                    <button class="action more" type="button"
                                            @click="${()=>{this.showAll=new Set([...this.showAll,e.index])}}">Show more (${e.hiddenCount})</button>`:x}
                            </section>`)}
                    </div>
                </div>`:x}
        `}static{this.styles=v`
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
    `}};A([y({attribute:!1})],yl.prototype,`panel`,void 0),A([C()],yl.prototype,`open`,void 0),A([C()],yl.prototype,`hideUnpopulated`,void 0),A([C()],yl.prototype,`showAll`,void 0),yl=A([w(`mateu-action-panel`)],yl);var bl=e=>D`
    <mateu-action-panel
            .panel="${e.metadata}"
            style="${e.style??x}"
            class="${e.cssClasses??x}"
            slot="${e.slot??x}"
    ></mateu-action-panel>
`,xl=(e,t)=>{let n=[];for(let r of e.sections??[]){let e=!!r.title,i=e&&t.has(r.id);if(e&&n.push({kind:`section`,id:r.id,title:r.title,collapsed:i}),!i)for(let t of r.rows??[])n.push({kind:`row`,row:t,sectionId:r.id,indented:e})}return n},Sl=e=>new Set((e.sections??[]).filter(e=>e.title&&e.collapsed).map(e=>e.id)),Cl=e=>{let t=e.columns??[];if(!t.some(e=>e.group))return[];let n=[];for(let e of t){let t=e.group??``,r=n[n.length-1];r&&r.label===t?r.span++:n.push({label:t,span:1})}return n},wl=new Set([`info`,`success`,`warning`,`danger`,`neutral`]),Tl=(e,t)=>e&&wl.has(e)?e:t&&wl.has(t)?t:``,El=class extends S{constructor(...e){super(...e),this.collapsed=new Set}willUpdate(e){e.has(`grid`)&&this.grid&&!this.seenGrid&&(this.collapsed=Sl(this.grid)),e.has(`grid`)&&(this.seenGrid=this.grid,this.editing=void 0)}toggle(e){let t=new Set(this.collapsed);t.has(e)?t.delete(e):t.add(e),this.collapsed=t}dispatch(e,t,n,r){let i=this.grid?.columns?.[n];this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{_rowId:t,_columnId:i?.id,_value:r}},bubbles:!0,composed:!0}))}commit(e,t,n){if(!this.editing)return;this.editing=void 0;let r=e.cells?.[t]?.value??``;n.value!==r&&this.grid?.editActionId&&this.dispatch(this.grid.editActionId,e.id,t,n.value)}renderCell(e,t){let n=this.grid,r=e.cells?.[t]??{},i=n.columns?.[t],a=Tl(r.tone,i?.tone),o=!!(e.editable&&n.editActionId),s=`${e.label??``}, ${i?.label??``}: ${r.value??``}`;if(this.editing&&this.editing.rowId===e.id&&this.editing.columnIndex===t)return D`<td class="cell ${a} editing"><input aria-label="${s}" .value="${r.value??``}"
                @keydown="${n=>{n.key===`Enter`&&this.commit(e,t,n.target),n.key===`Escape`&&(this.editing=void 0)}}"
                @blur="${n=>this.commit(e,t,n.target)}" /></td>`;let c=()=>{this.editing={rowId:e.id,columnIndex:t}};return r.link&&n.cellActionId?D`<td class="cell ${a}"><button class="link" type="button" aria-label="${s}"
                @click="${()=>this.dispatch(n.cellActionId,e.id,t,r.value??``)}">${r.value}</button></td>`:D`<td class="cell ${a} ${o?`editable`:``}" tabindex="${o?`0`:x}"
            aria-label="${o?s:x}"
            @dblclick="${o?c:x}"
            @keydown="${o?e=>{(e.key===`Enter`||e.key===`F2`)&&(e.preventDefault(),c())}:x}">${r.value}</td>`}updated(){this.renderRoot.querySelector(`td.editing input`)?.focus()}render(){let e=this.grid;if(!e)return x;let t=e.columns??[],n=Cl(e);return D`
            <div class="scroller">
                <table>
                    <thead>
                        ${n.length?D`<tr>
                            <th class="corner" rowspan="2">${e.rowHeaderLabel??``}</th>
                            ${n.map(e=>D`<th class="group" colspan="${e.span}">${e.label}</th>`)}
                        </tr>`:x}
                        <tr>
                            ${n.length?x:D`<th class="corner">${e.rowHeaderLabel??``}</th>`}
                            ${t.map(e=>D`<th class="col ${Tl(null,e.tone)}" scope="col">${e.label??e.id}</th>`)}
                        </tr>
                    </thead>
                    <tbody>
                        ${xl(e,this.collapsed).map(e=>e.kind===`section`?D`<tr class="section"><th scope="rowgroup" class="rowhead">
                                    <button type="button" class="toggle" aria-expanded="${e.collapsed?`false`:`true`}"
                                            @click="${()=>this.toggle(e.id)}"><span class="chevron" aria-hidden="true">${e.collapsed?`▸`:`▾`}</span>${e.title}</button>
                                </th>${t.map(()=>D`<td class="cell section-cell"></td>`)}</tr>`:D`<tr class="${e.row.emphasis?`emphasis`:``}">
                                    <th scope="row" class="rowhead ${e.indented?`indented`:``}">${e.row.label}</th>
                                    ${t.map((t,n)=>this.renderCell(e.row,n))}
                                </tr>`)}
                    </tbody>
                </table>
            </div>
        `}static{this.styles=v`
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
    `}};A([y({attribute:!1})],El.prototype,`grid`,void 0),A([C()],El.prototype,`collapsed`,void 0),A([C()],El.prototype,`editing`,void 0),El=A([w(`mateu-matrix-grid`)],El);var Dl=e=>D`
    <mateu-matrix-grid
            .grid="${e.metadata}"
            style="${e.style??x}"
            class="${e.cssClasses??x}"
            slot="${e.slot??x}"
    ></mateu-matrix-grid>
`,Ol=e=>e?`application/x-mateu-`+String(e).toLowerCase().replace(/[^a-z0-9.+-]/g,`-`):``,kl=e=>{let t;try{t=JSON.parse(e)}catch{return[]}return(Array.isArray(t)?t:[t]).map(e=>{if(e==null)return null;if(typeof e!=`object`)return String(e);let t=e,n=(t.data&&typeof t.data==`object`?t.data:t).id??t.key;return n==null?null:String(n)}).filter(e=>e!=null)},Al=(e,t,n)=>({...e??{},_draggedIds:t,_dragType:n}),jl=class extends S{constructor(...e){super(...e),this.ready=!1,this.over=!1,this.onDocumentDragStart=e=>{setTimeout(()=>{this.ready=this.accepts(e)})},this.onDocumentDragEnd=()=>{this.ready=!1,this.over=!1}}get mime(){return Ol(this.zone?.accept)}accepts(e){let t=e.dataTransfer?Array.from(e.dataTransfer.types):[];return!!this.mime&&t.includes(this.mime)}connectedCallback(){super.connectedCallback(),document.addEventListener(`dragstart`,this.onDocumentDragStart,!0),document.addEventListener(`dragend`,this.onDocumentDragEnd,!0)}disconnectedCallback(){document.removeEventListener(`dragstart`,this.onDocumentDragStart,!0),document.removeEventListener(`dragend`,this.onDocumentDragEnd,!0),super.disconnectedCallback()}onDragOver(e){this.accepts(e)&&(e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect=`move`),this.over=!0)}onDrop(e){if(!this.accepts(e))return;e.preventDefault(),this.over=!1,this.ready=!1;let t=kl(e.dataTransfer?.getData(this.mime)??``);!t.length||!this.zone?.actionId||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.zone.actionId,parameters:Al(this.zone.parameters,t,this.zone.accept??``)},bubbles:!0,composed:!0}))}render(){let e=this.zone;return e?D`
            <div class="zone ${this.ready?`ready`:``} ${this.over?`over`:``}" role="group"
                 aria-label="${(e.title??``)+(e.subtitle?`, `+e.subtitle:``)} — drop target"
                 @dragover="${this.onDragOver}" @dragleave="${()=>{this.over=!1}}" @drop="${this.onDrop}">
                ${e.title?D`<div class="title">${e.title}</div>`:x}
                ${e.subtitle?D`<div class="subtitle">${e.subtitle}</div>`:x}
                <slot></slot>
                ${this.ready?D`<div class="hint">Drop here</div>`:x}
            </div>`:x}static{this.styles=v`
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
    `}};A([y({attribute:!1})],jl.prototype,`zone`,void 0),A([C()],jl.prototype,`ready`,void 0),A([C()],jl.prototype,`over`,void 0),jl=A([w(`mateu-drop-zone`)],jl);var Ml=(e,t,n,r,i,a,o)=>D`
    <mateu-drop-zone
            .zone="${t.metadata}"
            style="${t.style??x}"
            class="${t.cssClasses??x}"
            slot="${t.slot??x}"
    >${(t.children??[]).map(t=>I(e,t,n,r,i,a,o))}</mateu-drop-zone>
`,Nl=e=>{let t=e.metadata.attributes?.[`data-colspan`];return D`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${e.style??``}"
            class="${e.cssClasses??x}"
            id="${E(e.id??void 0)}"
            data-colspan="${E(t)}"
            slot="${e.slot??x}"/>
    `},Pl=new Map,Fl=e=>Pl.get(e),Il=(e,t)=>t!=null&&e!=null&&!e.has(t),Ll=typeof HTMLElement<`u`?HTMLElement:class{},Rl=class extends Ll{static get observedAttributes(){return[`type`,`renderer`]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){let e=this.getAttribute(`type`)??`unknown`,t=this.getAttribute(`renderer`)??`unknown`;this.shadowRoot||this.attachShadow({mode:`open`}),this.shadowRoot.innerHTML=`
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
        `}};typeof customElements<`u`&&!customElements.get(`mateu-unsupported`)&&customElements.define(`mateu-unsupported`,Rl);var zl=new Set,Bl=(e,t,n)=>{let r=`${n}/${t}`;return zl.has(r)||(zl.add(r),console.warn(`[mateu] Component type "${t}" is not supported by the "${n}" renderer — rendering <mateu-unsupported> placeholder.`)),D`<mateu-unsupported
            type="${t}"
            renderer="${n}"
            data-component-id="${e?.id??x}"
            slot="${e?.slot??x}"
    ></mateu-unsupported>`},Vl=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.children?.map(t=>I(e,t,n,r,i,a,o,!1))??[],l=Fl(s.name);return l?l(s.props??{},c):Bl(t,`${M.CustomComponent}:${s.name}`,`custom-component-registry`)},Hl={info:`ℹ`,success:`✓`,warning:`!`,danger:`!`},W=class extends S{constructor(...e){super(...e),this.text=``,this.theme=`info`,this.noIcon=!1,this.slim=!1,this.fullWidth=!1,this.hasContent=!1,this.inlineContent=!1}static{this.styles=v`
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
    `}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId},bubbles:!0,composed:!0}))}render(){let e=!!this.text&&!!this.text.trim();if(!e&&!this.hasContent)return D``;let t=[`info`,`success`,`warning`,`danger`].includes(this.theme)?this.theme:`info`;return D`
            <div class="notice ${t} ${this.slim?`slim`:``}">
                ${this.noIcon?x:D`<span class="icon ${this.icon?`custom`:``}">${this.icon||Hl[t]}</span>`}
                <div class="body ${this.inlineContent?`inline`:``}">
                    ${e?D`<span class="text">${this.text}</span>`:x}
                    ${this.hasContent?D`<div class="content"><slot></slot></div>`:x}
                </div>
                ${this.actionLabel&&this.actionId?D`<button class="notice-action" @click="${()=>this.runAction()}">${this.actionLabel}</button>`:this.status?D`<span class="status">${this.status}</span>`:x}
            </div>
        `}};A([y()],W.prototype,`text`,void 0),A([y()],W.prototype,`theme`,void 0),A([y()],W.prototype,`icon`,void 0),A([y({type:Boolean})],W.prototype,`noIcon`,void 0),A([y()],W.prototype,`actionLabel`,void 0),A([y()],W.prototype,`actionId`,void 0),A([y()],W.prototype,`status`,void 0),A([y({type:Boolean})],W.prototype,`slim`,void 0),A([y({type:Boolean})],W.prototype,`fullWidth`,void 0),A([y({type:Boolean})],W.prototype,`hasContent`,void 0),A([y({type:Boolean})],W.prototype,`inlineContent`,void 0),W=A([w(`mateu-notice`)],W);var Ul=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=_r(s.text??``,r,i,a,o)??``,l=t.children??[];return D`
        <mateu-notice
                text="${c}"
                theme="${s.theme??`info`}"
                icon="${E(s.icon??void 0)}"
                ?noIcon="${s.noIcon??!1}"
                actionLabel="${E(s.actionLabel??void 0)}"
                actionId="${E(s.actionId??void 0)}"
                status="${E(s.status??void 0)}"
                ?slim="${s.slim??!1}"
                ?fullWidth="${s.fullWidth??!1}"
                ?inlineContent="${s.inlineContent??!1}"
                ?hasContent="${l.length>0}"
                data-colspan="${s.fullWidth?`99`:x}"
                style="${t.style??x}"
                class="${t.cssClasses??x}"
                slot="${t.slot??x}"
        >${l.map(t=>I(e,t,n,r,i,a,o))}</mateu-notice>
    `},Wl=class extends S{constructor(...e){super(...e),this.groups=[]}static{this.styles=[Yc,V,v`
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
    `]}willUpdate(e){e.has(`groups`)&&(this.selectedId=this.groups.flatMap(e=>e.items??[]).find(e=>e.selected)?.id)}itemAction(e,t,n){e.stopPropagation(),t&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_item:n}},bubbles:!0,composed:!0}))}select(e){this.selectedId=e,this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_item:e}},bubbles:!0,composed:!0}))}render(){return D`
            <div class="rail">
                ${this.groups.map(e=>D`
                    <div class="group" role="listbox">
                        ${e.label?D`<span class="group-label">${e.label}</span>`:x}
                        ${(e.items??[]).map(e=>D`
                            <div role="option" tabindex="0" aria-selected="${e.id===this.selectedId}" class="card ${e.id===this.selectedId?`selected`:``}"
                                 @click="${()=>this.select(e.id)}" @keydown="${B(()=>this.select(e.id))}">
                                <span class="title">${e.title}</span>
                                <div class="meta">
                                    ${e.caption?D`<span class="caption">${e.caption}</span>`:x}
                                    ${(e.badges??[]).map(e=>D`<span class="chip ${e.color??``}">${e.label}</span>`)}
                                </div>
                                ${e.actionLabel&&e.actionId?D`
                                    <button class="item-action"
                                            @click="${t=>this.itemAction(t,e.actionId,e.id)}">${e.actionLabel}</button>
                                `:x}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `}};A([y()],Wl.prototype,`actionId`,void 0),A([y({type:Array})],Wl.prototype,`groups`,void 0),A([C()],Wl.prototype,`selectedId`,void 0),Wl=A([w(`mateu-task-queue`)],Wl);var Gl=e=>{let t=e.metadata;return D`
        <mateu-task-queue
                .actionId="${t.actionId}"
                .groups="${t.groups??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-task-queue>
    `},Kl=class extends S{constructor(...e){super(...e),this.columns=0,this.items=[]}static{this.styles=[Yc,V,v`
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
    `]}willUpdate(e){e.has(`items`)&&(this.selectedId=this.items.find(e=>e.selected)?.id)}select(e){e.disabled||(this.selectedId=e.id,this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_item:e.id}},bubbles:!0,composed:!0})))}render(){return D`
            <div class="grid" style="${this.columns>0?`grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`:`grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));`}">
                ${this.items.map(e=>D`
                    <div role="button" tabindex="0" class="cell ${e.disabled?`disabled`:``} ${e.recommended?`recommended`:``} ${e.id===this.selectedId?`selected`:``}"
                         @click="${()=>this.select(e)}" @keydown="${B(()=>this.select(e))}">
                        ${e.recommended?D`<span class="tag">${this.recommendedLabel||`Recommended`}</span>`:x}
                        <span class="title">${e.title}</span>
                        ${e.subtitle?D`<span class="subtitle">${e.subtitle}</span>`:x}
                        ${e.statusLabel?D`<span class="chip ${e.statusColor??``}">${e.statusLabel}</span>`:x}
                        ${e.note?D`<span class="note ${e.noteColor??``}"><span class="dot"></span>${e.note}</span>`:x}
                    </div>
                `)}
            </div>
        `}};A([y()],Kl.prototype,`actionId`,void 0),A([y({type:Number})],Kl.prototype,`columns`,void 0),A([y()],Kl.prototype,`recommendedLabel`,void 0),A([y({type:Array})],Kl.prototype,`items`,void 0),A([C()],Kl.prototype,`selectedId`,void 0),Kl=A([w(`mateu-resource-grid`)],Kl);var ql=e=>{let t=e.metadata;return D`
        <mateu-resource-grid
                .actionId="${t.actionId}"
                .columns="${t.columns??0}"
                .recommendedLabel="${t.recommendedLabel}"
                .items="${t.items??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-resource-grid>
    `},G=class extends S{constructor(...e){super(...e),this.title=``,this.features=[],this.current=!1,this.added=!1}static{this.styles=v`
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
    `}runAction(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return D`
            <div class="card ${this.current?``:`offer`}">
                ${this.image?D`<img class="image" src="${this.image}" alt="${this.title}">`:x}
                ${this.tag&&this.image?D`<span class="tag">${this.tag}</span>`:x}
                <div class="body">
                    ${this.tag&&!this.image?D`<span class="tag static">${this.tag}</span>`:x}
                    <span class="title">${this.title}</span>
                    ${this.subtitle?D`<span class="subtitle">${this.subtitle}</span>`:x}
                    ${this.features.length?D`
                        <div class="features">
                            ${this.features.map(e=>D`<span class="feature">${e}</span>`)}
                        </div>
                    `:x}
                </div>
                <div class="footer">
                    ${this.current?this.currentLabel?D`<span class="current-label">${this.currentLabel}</span>`:x:this.actionLabel&&this.actionId?D`
                            <button class="${this.added?`added`:``}" @click="${()=>this.runAction()}">
                                <span>${this.added&&this.addedLabel||this.actionLabel}</span>
                                ${this.priceLabel?D`<span class="price">${this.priceLabel}</span>`:x}
                            </button>
                        `:x}
                </div>
            </div>
        `}};A([y()],G.prototype,`tag`,void 0),A([y()],G.prototype,`title`,void 0),A([y()],G.prototype,`subtitle`,void 0),A([y()],G.prototype,`image`,void 0),A([y({type:Array})],G.prototype,`features`,void 0),A([y()],G.prototype,`priceLabel`,void 0),A([y()],G.prototype,`actionLabel`,void 0),A([y()],G.prototype,`actionId`,void 0),A([y({type:Boolean})],G.prototype,`current`,void 0),A([y()],G.prototype,`currentLabel`,void 0),A([y({type:Boolean})],G.prototype,`added`,void 0),A([y()],G.prototype,`addedLabel`,void 0),G=A([w(`mateu-offer-card`)],G);var Jl=e=>{let t=e.metadata;return D`
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
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-offer-card>
    `},Yl=class extends S{constructor(...e){super(...e),this.items=[],this.added=new Set}static{this.styles=v`
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
    `}willUpdate(e){e.has(`items`)&&(this.added=new Set(this.items.filter(e=>e.added).map(e=>e.id)))}total(){return this.items.filter(e=>e.id!=null&&this.added.has(e.id)).reduce((e,t)=>e+(t.price??0),0)}toggle(e){if(e.id==null)return;let t=new Set(this.added),n=!t.has(e.id);n?t.add(e.id):t.delete(e.id),this.added=t,this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_item:e.id,_added:n,_total:this.total()}},bubbles:!0,composed:!0}))}render(){return D`
            <div class="header">
                ${this.totalLabel?D`<span class="total-label">${this.totalLabel}:</span>`:x}
                <span class="total">${Qc(this.total(),this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(e=>{let t=e.id!=null&&this.added.has(e.id);return D`
                        <div class="card ${t?`added`:``}">
                            ${e.icon?D`<span class="icon">${e.icon}</span>`:x}
                            <span class="title">${e.title}</span>
                            ${e.description?D`<span class="description">${e.description}</span>`:x}
                            ${e.includedLabel?D`<span class="included">${e.includedLabel}</span>`:D`
                                    ${e.price==null?x:D`
                                        <span class="price">${Qc(e.price,this.currency)}${e.unit?` / ${e.unit}`:``}</span>
                                    `}
                                    <button class="toggle ${t?`on`:``}" @click="${()=>this.toggle(e)}"
                                            aria-pressed="${t}">${t?`✓`:`+`}</button>
                                `}
                        </div>
                    `})}
            </div>
        `}};A([y()],Yl.prototype,`totalLabel`,void 0),A([y()],Yl.prototype,`currency`,void 0),A([y()],Yl.prototype,`actionId`,void 0),A([y({type:Array})],Yl.prototype,`items`,void 0),A([C()],Yl.prototype,`added`,void 0),Yl=A([w(`mateu-addon-picker`)],Yl);var Xl=e=>{let t=e.metadata;return D`
        <mateu-addon-picker
                .totalLabel="${t.totalLabel}"
                .currency="${t.currency}"
                .actionId="${t.actionId}"
                .items="${t.items??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-addon-picker>
    `},Zl=class extends S{constructor(...e){super(...e),this.lines=[]}static{this.styles=v`
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
    `}computedTotal(){return this.total==null?this.lines.filter(e=>!e.included).reduce((e,t)=>e+(t.amount??0),0):this.total}render(){return D`
            ${this.lines.map(e=>D`
                <div class="row">
                    <span class="dot"></span>
                    <span class="concept">${e.concept}</span>
                    ${e.included?D`<span class="included-label">${e.includedLabel||`Included`}</span>`:D`<span class="amount ${(e.amount??0)<0?`negative`:``}">${Qc(e.amount??0,this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel||`Total`}</span>
                <span class="total">${Qc(this.computedTotal(),this.currency)}</span>
            </div>
        `}};A([y()],Zl.prototype,`currency`,void 0),A([y()],Zl.prototype,`totalLabel`,void 0),A([y({type:Array})],Zl.prototype,`lines`,void 0),A([y({type:Number})],Zl.prototype,`total`,void 0),Zl=A([w(`mateu-ledger`)],Zl);var Ql=e=>{let t=e.metadata;return D`
        <mateu-ledger
                .currency="${t.currency}"
                .totalLabel="${t.totalLabel}"
                .lines="${t.lines??[]}"
                .total="${t.total}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-ledger>
    `},$l=class extends S{constructor(...e){super(...e),this.methods=[]}static{this.styles=v`
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
    `}willUpdate(e){e.has(`selected`)&&(this.selectedId=this.selected)}confirm(){this.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.actionId,parameters:{_method:this.selectedId}},bubbles:!0,composed:!0}))}pick(e){this.selectedId=e,this.methodActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.methodActionId,parameters:{_method:e}},bubbles:!0,composed:!0}))}render(){return D`
            <div class="bar">
                <div class="methods">
                    ${this.methods.map(e=>D`
                        <button class="method ${e.id===this.selectedId?`selected`:``}"
                                @click="${()=>this.pick(e.id)}">${e.label}</button>
                    `)}
                </div>
                ${this.contextLabel||this.contextValue?D`
                    <div class="context">
                        ${this.contextLabel?D`<span class="label">${this.contextLabel}</span>`:x}
                        ${this.contextValue?D`<span class="value">${this.contextValue}</span>`:x}
                    </div>
                `:x}
                <span class="spacer"></span>
                ${this.confirmLabel&&this.actionId?D`<button class="confirm" @click="${()=>this.confirm()}">${this.confirmLabel}</button>`:x}
            </div>
        `}};A([y()],$l.prototype,`actionId`,void 0),A([y()],$l.prototype,`methodActionId`,void 0),A([y({type:Array})],$l.prototype,`methods`,void 0),A([y()],$l.prototype,`selected`,void 0),A([y()],$l.prototype,`contextLabel`,void 0),A([y()],$l.prototype,`contextValue`,void 0),A([y()],$l.prototype,`confirmLabel`,void 0),A([C()],$l.prototype,`selectedId`,void 0),$l=A([w(`mateu-payment-picker`)],$l);var eu=e=>{let t=e.metadata;return D`
        <mateu-payment-picker
                .actionId="${t.actionId}"
                .methodActionId="${t.methodActionId}"
                .methods="${t.methods??[]}"
                .selected="${t.selected}"
                .contextLabel="${t.contextLabel}"
                .contextValue="${t.contextValue}"
                .confirmLabel="${t.confirmLabel}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-payment-picker>
    `},tu=class extends S{constructor(...e){super(...e),this.items=[]}static{this.styles=v`
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
    `}runAction(e){e.actionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{}},bubbles:!0,composed:!0}))}render(){return D`
            <div class="list">
                ${this.items.map(e=>D`
                    <div class="row">
                        <span class="dot ${e.status??`ok`}"></span>
                        <div class="body">
                            <span class="name">${e.name}</span>
                            ${e.systems?.length?D`<span class="systems">${e.systems.join(` · `)}</span>`:x}
                        </div>
                        <div class="counters">
                            <span class="counter ok">✓ ${e.ok??0} OK</span>
                            ${(e.warnings??0)>0?D`<span class="counter warning">⚠ ${e.warnings} warnings</span>`:x}
                            ${(e.errors??0)>0?D`<span class="counter error">⛔ ${e.errors} errors</span>`:x}
                        </div>
                        ${e.actionLabel&&e.actionId?D`<button @click="${()=>this.runAction(e)}">${e.actionLabel}</button>`:x}
                    </div>
                `)}
            </div>
        `}};A([y({type:Array})],tu.prototype,`items`,void 0),tu=A([w(`mateu-process-monitor`)],tu);var nu=e=>D`
        <mateu-process-monitor
                .items="${e.metadata.items??[]}"
                style="${e.style??x}"
                class="${e.cssClasses??x}"
                slot="${e.slot??x}"
        ></mateu-process-monitor>
    `,ru=b`<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line></svg>`,iu=()=>F.get()?.renderIcon?L(`vaadin:search`,`width: 100%; height: 100%;`):D`${ru}`,au=(e,t)=>{e.ctrlKey||e.metaKey||e.shiftKey||(e.preventDefault(),Ir(e.currentTarget,t))},ou=e=>{let t=e.metadata??{},n=t.title||Ht(`notFound`),r=t.message||Ht(`notFoundMessage`),i=t.backRoute;return D`
        <section class="mateu-not-found ${e.cssClasses??``}"
                 slot="${e.slot??x}"
                 style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
                        gap: var(--lumo-space-s, .5rem); min-height: 50vh; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-m, 1rem);
                        color: var(--lumo-secondary-text-color, #5f6b7a); ${e.style??``}">
            <span class="mateu-not-found-icon" aria-hidden="true"
                  style="display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
                         width: 4.5rem; height: 4.5rem; padding: 1.1rem; margin-bottom: var(--lumo-space-s, .5rem); border-radius: 50%;
                         color: var(--lumo-primary-text-color, #1676f3); background: var(--lumo-primary-color-10pct, rgba(22, 118, 243, .1));">
                ${iu()}
            </span>
            <h2 class="mateu-not-found-title"
                style="margin: 0; font-size: var(--lumo-font-size-xl, 1.375rem); font-weight: 600; line-height: var(--lumo-line-height-s, 1.375);
                       color: var(--lumo-header-text-color, var(--lumo-body-text-color, #1a2533)); overflow-wrap: anywhere;">${n}</h2>
            <p class="mateu-not-found-message" style="margin: 0; max-width: 32rem; font-size: var(--lumo-font-size-m, 1rem);">${r}</p>
            ${i?D`
                <a class="mateu-not-found-back" href="${i}" @click="${e=>au(e,i)}"
                   style="margin-top: var(--lumo-space-m, 1rem); font-weight: 500; text-decoration: none;
                          color: var(--lumo-primary-text-color, #1676f3);">← ${t.backLabel||Ht(`goBack`)}</a>
            `:x}
        </section>
    `},su=(e,t)=>{let n=e.style;return e.id&&(n&&!n.endsWith(`;`)&&(n+=`;`),n??=``,t[e.id+`.hidden`]==1&&(n+=`display: none;`)),n},cu=(e,t)=>{let n={...e.metadata};if(e.id&&n){if(n.type==M.Button){let r=n;t[e.id+`.disabled`]==1&&(r.disabled=!0)}if(n.type==M.FormField){let r=n;t[e.id+`.disabled`]==1&&(r.disabled=!0)}}return n},K=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),lu={[M.Bpmn]:({component:e})=>ws(e),[M.Workflow]:({component:e})=>Es(e),[M.FormEditor]:({component:e})=>Ds(e),[M.Page]:K(Ss),[M.Div]:K(Ao),[M.Directory]:({component:e,baseUrl:t,state:n,data:r})=>Oo(e,t,n,r),[M.FormLayout]:K(oa),[M.HorizontalLayout]:K(fa),[M.VerticalLayout]:K(pa),[M.SplitLayout]:K(ma),[M.MasterDetailLayout]:K(ha),[M.TabLayout]:K(ga),[M.AccordionLayout]:K(_a),[M.BoardLayout]:K(Sa),[M.BoardLayoutRow]:K(Ca),[M.BoardLayoutItem]:K(wa),[M.Scroller]:K(ya),[M.FullWidth]:K(ba),[M.Container]:K(xa),[M.Form]:({container:e,component:t,baseUrl:n,state:r,data:i,appState:a,appData:o})=>{let s=t.metadata;return D`<mateu-form
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
            slot="${t.slot??x}"
            >
                ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
            ${s?.buttons?.map(t=>D`
               ${I(e,{id:t.actionId,metadata:t,type:j.ClientSide,slot:`buttons`},void 0,r,i,a,o)}
`)}

            </mateu-form>`},[M.Table]:({component:e,state:t,data:n})=>Na(e,(e.id?n?.[e.id]:void 0)?.page?.content??Pa(e,t)),[M.Crud]:K(Cs),[M.App]:({container:e,component:t,baseUrl:n,state:r,data:i,appState:a,appData:o})=>D`
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
             ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
         </mateu-app>`,[M.Element]:({container:e,component:t,state:n,data:r,appState:i,appData:a})=>Ka(e,t.metadata,t,n,r,i,a),[M.FormField]:({component:e,state:t})=>Fo(e,t),[M.Text]:({component:e,state:t,data:n,appState:r,appData:i})=>Ja(e,t,n,r,i),[M.Avatar]:({component:e,state:t,data:n})=>Er(e,t,n),[M.Chat]:({component:e,state:t,data:n})=>Ts(e,t,n),[M.AvatarGroup]:({component:e})=>Or(e),[M.Badge]:({component:e,state:t,data:n})=>kr(e,t,n),[M.Breadcrumbs]:({component:e})=>Eo(e),[M.Anchor]:({component:e})=>Ya(e),[M.Button]:({component:e,state:t,data:n})=>ro(e,t,n),[M.Card]:K(ao),[M.Chart]:({component:e})=>oo(e),[M.Icon]:({component:e})=>so(e),[M.ConfirmDialog]:K(po),[M.ContextMenu]:K(Ra),[M.CookieConsent]:({component:e})=>mo(e),[M.Details]:K(ho),[M.Dialog]:({component:e,baseUrl:t,state:n,data:r,appState:i,appData:a})=>go(e,t,n,r,i,a),[M.Drawer]:({component:e,baseUrl:t,state:n,data:r,appState:i,appData:a})=>_o(e,t,n,r,i,a),[M.Image]:({component:e})=>To(e),[M.Map]:({component:e})=>wo(e),[M.Markdown]:({component:e})=>bo(e),[M.MicroFrontend]:({component:e})=>yo(e),[M.Notification]:({component:e})=>xo(e),[M.ProgressBar]:({component:e,state:t})=>So(e,t),[M.Popover]:K(Co),[M.CarouselLayout]:K(Do),[M.Tooltip]:K(Va),[M.MessageInput]:({component:e})=>Ba(e),[M.MessageList]:({component:e})=>Fa(e),[M.CustomField]:K(za),[M.MenuBar]:({container:e,component:t,baseUrl:n,state:r,data:i})=>La(e,t,n,r,i),[M.Grid]:({component:e,state:t})=>Na(e,Pa(e,t)),[M.VirtualList]:K(Ta),[M.FormSection]:K(jo),[M.FormSubSection]:K(Mo),[M.MetricCard]:({component:e})=>Ms(e),[M.Scoreboard]:K(Ns),[M.DashboardPanel]:K(Ps),[M.DashboardLayout]:K(Fs),[M.ResponsiveGrid]:K(Rs),[M.FoldoutLayout]:K(Ls),[M.ContentLayout]:K(zs),[M.HeroSection]:K(Hs),[M.EmptyState]:({component:e})=>pi(e),[M.Skeleton]:({component:e})=>mi(e),[M.Gantt]:({component:e})=>Gs(e),[M.PlanningBoard]:({component:e})=>Js(e),[M.Kanban]:({component:e})=>Xs(e),[M.Timeline]:({component:e})=>Qs(e),[M.ProgressSteps]:({component:e})=>ec(e),[M.Stat]:({component:e})=>nc(e),[M.Calendar]:({component:e})=>bc(e),[M.PricingTable]:({component:e})=>Sc(e),[M.OrgChart]:({component:e})=>wc(e),[M.Heatmap]:({component:e})=>Dc(e),[M.Funnel]:({component:e})=>kc(e),[M.TrendChart]:({component:e})=>jc(e),[M.FeatureGrid]:({component:e})=>Nc(e),[M.Testimonials]:({component:e})=>Fc(e),[M.Faq]:({component:e})=>Lc(e),[M.CalloutCard]:({component:e})=>zc(e),[M.CommentThread]:({component:e})=>Vc(e),[M.FileList]:({component:e})=>Wc(e),[M.Checklist]:({component:e})=>Kc(e),[M.ComparisonCard]:({component:e})=>Jc(e),[M.EntityHeader]:({component:e})=>tl(e),[M.Meter]:({component:e})=>rl(e),[M.TaskProgress]:({component:e})=>al(e),[M.StatusList]:({component:e})=>sl(e),[M.BulletedList]:({component:e})=>ll(e),[M.ActionPanel]:({component:e})=>bl(e),[M.MatrixGrid]:({component:e})=>Dl(e),[M.DropZone]:K(Ml),[M.Separator]:({component:e})=>Nl(e),[M.CustomComponent]:K(Vl),[M.Notice]:K(Ul),[M.TaskQueue]:({component:e})=>Gl(e),[M.ResourceGrid]:({component:e})=>ql(e),[M.OfferCard]:({component:e})=>Jl(e),[M.AddOnPicker]:({component:e})=>Xl(e),[M.Ledger]:({component:e})=>Ql(e),[M.PaymentPicker]:({component:e})=>eu(e),[M.ProcessMonitor]:({component:e})=>nu(e),[M.NotFound]:({component:e})=>ou(e)},uu=(e,t,n,r,i,a,o,s)=>{if(!t?.metadata)return t==null?(console.warn(`No metadata for component`,t),D`<p>No metadata for component</p>`):uu(e,{id:de(),metadata:t,type:j.ClientSide},n,r,i,a,o,s);let c=t.metadata.type,l={...t,style:su(t,i),metadata:cu(t,i)},u=lu[c];return u?u({container:e,component:l,baseUrl:n,state:r,data:i,appState:a,appData:o,labelAlreadyRendered:s}):D`<p ${l?.slot??x}>Unknown metadata type ${c} for component ${l?.id}</p>`},du=function(e){return e.NONE=`NONE`,e.INFO=`INFO`,e.SUCCESS=`SUCCESS`,e.WARNING=`WARNING`,e.DANGER=`DANGER`,e}({}),fu=(e,t,n)=>{let r=gu(e[n.path]);return r?D`<span theme="badge pill ${_u(r.type)}">${r.message}</span>`:D``},pu=new Set([`AVAILABLE`,`ACTIVE`,`RUNNING`,`SUCCEEDED`,`SUCCESS`,`OK`,`ENABLED`,`READY`,`HEALTHY`,`COMPLETED`,`DONE`,`ATTACHED`,`UP`]),mu=new Set([`PROVISIONING`,`UPDATING`,`PENDING`,`STARTING`,`STOPPING`,`IN_PROGRESS`,`TERMINATING`,`DELETING`,`CREATING`,`MOVING`,`WAITING`,`ACCEPTED`,`WARNING`,`DEGRADED`,`RESTORING`,`SCALING`]),hu=new Set([`FAILED`,`TERMINATED`,`ERROR`,`DELETED`,`STOPPED`,`DISABLED`,`UNHEALTHY`,`DOWN`,`CANCELED`,`CANCELLED`,`REJECTED`,`INACTIVE`]),gu=e=>{if(e==null||e===``)return;if(typeof e==`object`)return e;let t=String(e),n=t.trim().toUpperCase().replace(/[\s-]+/g,`_`);return{type:pu.has(n)?du.SUCCESS:mu.has(n)?du.WARNING:hu.has(n)?du.DANGER:du.NONE,message:t}},_u=e=>{switch(e){case du.SUCCESS:return`success`;case du.WARNING:return`warning`;case du.DANGER:return`error`;case du.NONE:return`contrast`}return``},vu=class extends S{constructor(...e){super(...e),this.id=``,this.baseUrl=``,this.state={},this.data={},this.appState={},this.appData={},this.respondToVisibility=(e,t)=>{var n={root:document.documentElement};new IntersectionObserver(e=>{e.forEach(e=>{t(e.intersectionRatio>0)})},n).observe(e)},this.keepAsking=!1,this.askToUpper=()=>{let e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent(`fetch-more-elements`,{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?uu(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?D`<div class="neutral-card">
                ${e.image?D`<img class="card-media" src="${e.image}" alt="" />`:x}
                <div class="card-body">
                    <div class="card-head">
                        ${e.title?D`<span class="card-title">${e.title}</span>`:x}
                        ${e.status?D`<span theme="badge ${_u(e.status.type)}">${e.status.message}</span>`:x}
                    </div>
                    ${e.subtitle?D`<div class="card-subtitle">${e.subtitle}</div>`:x}
                    ${e.content?D`<div>${e.content}</div>`:x}
                </div>
        </div>`:D`${e}`,this.hasMore=!1,this.clickedOnCard=e=>{this.state[this.id+`_selected_items`]=[e],this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0}))}}updated(e){super.updated(e);let t=this.data[this.id]?.page;this.hasMore=t?.content?.length<t?.totalElements}firstUpdated(e){super.firstUpdated(e),this.respondToVisibility(this.askForMore,e=>{this.keepAsking=e,e&&this.askToUpper()})}render(){return D`
            <div class="card-container">
                ${(this.data[this.id]?.page)?.content?.map(e=>D`<div role="button" tabindex="0" @click="${()=>this.clickedOnCard(e)}" @keydown="${B(()=>this.clickedOnCard(e))}" class="car-container">${this.renderItem(e)}</div>`)}
                <div id="ask-for-more" style="display: ${this.hasMore?`flex`:`none`}; width: 100%; justify-content: center; padding: var(--lumo-space-m); color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Loading more…</div>
            </div>

            <slot></slot>
       `}static{this.styles=v`
        ${De}
        
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
    
        ${V}
    `}};A([y()],vu.prototype,`id`,void 0),A([y()],vu.prototype,`metadata`,void 0),A([y()],vu.prototype,`baseUrl`,void 0),A([y()],vu.prototype,`state`,void 0),A([y()],vu.prototype,`data`,void 0),A([y()],vu.prototype,`appState`,void 0),A([y()],vu.prototype,`appData`,void 0),A([y()],vu.prototype,`emptyStateMessage`,void 0),A([C()],vu.prototype,`keepAsking`,void 0),A([T(`#ask-for-more`)],vu.prototype,`askForMore`,void 0),A([C()],vu.prototype,`hasMore`,void 0),vu=A([w(`mateu-card-list`)],vu);var yu={show:e=>console.debug(`[mateu] no notifier registered, dropping toast:`,e.text)};function bu(e){yu=e}function xu(e,t){yu.show(e,t)}function Su(e){return e.filter(e=>e.identifier||(e.priority??2**53-1)<=2).sort((e,t)=>(e.priority??2**53-1)-(t.priority??2**53-1))}function Cu(e){let t=Su(e);return t.length>0?t:e.slice(0,3)}var wu=e=>!!e&&(e.startsWith(`search-`)||e.startsWith(`code-`)||e===`__restfetch__`),Tu=(e,t)=>e===`search`&&!t,Eu=e=>Object.values(e??{}).some(e=>!!e?.page?.content?.length),Du=(e,t)=>Tu(e.actionId,Eu(t))?!0:e.background,Ou,ku={asc:`ascending`,desc:`descending`},Au=`padding-inline: var(--mateu-edge-header-gutter, 0px); box-sizing: border-box;`,ju=`flex-shrink: 0; display: flex; align-items: center; gap: var(--lumo-space-s, 0.5rem); padding: 3px;`,q=class extends S{static{Ou=this}constructor(...e){super(...e),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this._columnPrefsRevision=0,this._prefsRevisionApplied=-1,this.pendingMeasure=!0,this.corrections=0,this.unsettledRefusals=0,this.windowResizeListener=()=>this.scheduleMeasure(),this.search=()=>{this.beginLoading();let e=this.component.metadata;if(this.state={...this.state,size:this._pageSizeOf(e),page:0,crud_selected_items:[]},this._syncStateToUrl(e),e.rowsSource){this._fetchRowsFromRest(e,void 0);return}this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`search`,parameters:{crudId:this.id,_searchState:{...this.state}},background:this.ownLoadingBackground()},bubbles:!0,composed:!0}))},this._appliedUrl=void 0,this.notify=e=>{xu({text:e,position:`bottomEnd`,variant:`error`,duration:3e3},this)},this.handleSearchRequested=e=>{let t=this.component.metadata;if(this.state={...this.state,size:this._pageSizeOf(t),crud_selected_items:[]},this._syncStateToUrl(t),t.rowsSource){this._fetchRowsFromRest(t,e);return}!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.beginLoading(),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`search`,parameters:{crudId:this.id,_searchState:{...this.state}},callback:e,background:this.ownLoadingBackground()},bubbles:!0,composed:!0}))},this._fetchRowsFromRest=(e,t)=>{let n=[...new Set([...this.cols.map(e=>e.id).filter(Boolean),...Lr(e.rowRoute)])],r=e.rowsSource,i=Ee(r)!=null;(we(r)?.proxy?new Promise(e=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`__restfetch__`,parameters:{_sourceKind:`rows`,_sourceId:this.id},callback:t=>e(Ki(t?.appData?._restfetch,r,n)),callbackonly:!0},bubbles:!0,composed:!0}))}):i?Gi(r,n,e=>P(e,this.state,this.data)):Wi(r,n,e=>P(e,this.state,this.data)).then(e=>({rows:e,total:null}))).then(({rows:r,total:a})=>{let o=this.cols.find(e=>e.identifier)?.id,s=r.map((e,t)=>({...e,_rowNumber:o!=null&&e[o]!=null?String(e[o]):`_row:${t}`})),c=Number(this.state?.page??0),l=i&&a!=null,u=l?s:ea(s,n,e.filters,this.state),d=e.pageSize&&e.pageSize>0?e.pageSize:u.length||1,f=l?u:u.slice(c*d,c*d+d),p={page:{totalElements:l?a:u.length,pageSize:d,pageNumber:c,content:f}};this._restRows={key:Ou._initKeyOf(this.component),listing:p},this.data={...this.data,[this.id]:p},this.requestUpdate(),t?.()}).catch(e=>{console.warn(`mateu: external rows fetch failed`,e),t?.()})},this.fetchMoreElements=e=>{let{params:t,callback:n}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(n)},this.directionChanged=e=>{let t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(e=>({fieldId:e.__data.path,direction:e.__data.direction?ku[e.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForKey=void 0,this._restRows=void 0,this.evalLabel=e=>P(e,this.state,this.data),this.handleToolbarButtonClick=e=>{let t=e.route?P(e.route,this.state,this.data):void 0;if(t&&!t.includes("${")){Ir(this,t);return}if(e.actionId===`import`){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:{crud_selected_items:this.state.crud_selected_items??[]}},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{let t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`process-import`,parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get columnPrefsScope(){return window.location.pathname}get effectiveComponent(){let e=this.component,t=e?.metadata;if(!e||!t?.columns)return e;if(this._prefsSource===e&&this._prefsRevisionApplied===this._columnPrefsRevision)return this._prefsApplied;let n=ji(this.columnPrefsScope),r=Fi(t.columns,n,e=>e.metadata??{});return this._prefsApplied=r===t.columns?e:{...e,metadata:{...t,columns:r}},this._prefsSource=e,this._prefsRevisionApplied=this._columnPrefsRevision,this._prefsApplied}get columnChooserEntries(){return(this.component?.metadata?.columns??[]).map(e=>{let t=e.metadata??{},n=t.id??e.id;return n?{id:n,label:t.label??n,protected:Pi(t)}:void 0}).filter(e=>!!e)}renderColumnChooser(){let e=this.columnChooserEntries;return e.filter(e=>!e.protected).length===0?x:D`
            <mateu-column-chooser
                .columns="${e}"
                .scope="${this.columnPrefsScope}"
                @column-prefs-changed="${e=>{e.stopPropagation(),this._columnPrefsRevision++}}"
            ></mateu-column-chooser>
        `}get cols(){return(this.effectiveComponent?.metadata)?.columns?.map(e=>e.metadata)??[]}get identifierFieldName(){let e=this.cols.find(e=>e.identifier);return e?e.id:this.cols.find(e=>e.id===`id`)?.id}get effectiveGridLayout(){let e=this.component?.metadata,t=e?.gridLayout??`auto`;return t===`auto`?e?.crudlType===`card`?`cards`:`table`:t}scheduleMeasure(){this.pendingMeasure=!0,this.corrections=0,this.requestUpdate()}measureFill(){if(!this.pendingMeasure)return;let e=this.renderRoot?.querySelector?.(`[data-crud-box]`);if(!e)return;if(this.closest?.(`mateu-dialog, mateu-drawer`)){this.pendingMeasure=!1;return}let t=e.style.height;t&&(e.style.height=``);let n=e.getBoundingClientRect().top,r=Math.round(window.innerHeight-n-this.measureBottomInset(e)-Ou.BOTTOM_GUTTER_PX);t&&(e.style.height=t);let i=this.lastMeasuredTop==null,a=!i&&Math.abs(n-this.lastMeasuredTop)>=2;if(r>=Ou.MIN_FILL_PX){if(a&&this.retryMeasure(n))return;this.pendingMeasure=!1,this.unsettledRefusals=0,this.lastMeasuredTop=n,this.fillHeightPx=r;return}!(!i&&!a)&&this.retryMeasure(n)||(this.lastMeasuredTop=n,this.pendingMeasure=!1,this.unsettledRefusals=0,this.fillHeightPx=void 0)}retryMeasure(e){return this.unsettledRefusals>=Ou.MAX_UNSETTLED_REFUSALS?!1:(this.lastMeasuredTop=e,this.unsettledRefusals++,this.requestUpdate(),!0)}trimOverflow(){if(this.fillHeightPx==null||this.pendingMeasure||this.corrections>=Ou.MAX_CORRECTIONS)return;let e=document.documentElement.scrollHeight-window.innerHeight;e<=1||e>Ou.MAX_SLIVER_PX||(this.corrections++,this.fillHeightPx=Math.max(Ou.MIN_FILL_PX,this.fillHeightPx-e))}measureBottomInset(e){let t=e,n=0,r=e.getBoundingClientRect().bottom;for(let e=0;t&&e<20;e++){n+=parseFloat(getComputedStyle(t).marginBottom)||0;let e=t.getRootNode(),i=t.assignedSlot??t.parentElement??e.host??null;if(!i||i===document.documentElement||i===document.body)break;let a=getComputedStyle(i);n+=(parseFloat(a.paddingBottom)||0)+(parseFloat(a.borderBottomWidth)||0);let o=parseFloat(a.rowGap)||0;for(let e=t.nextElementSibling;e;e=e.nextElementSibling){let t=e.getBoundingClientRect();if(t.top<r-1)continue;let i=getComputedStyle(e);n+=t.height+(parseFloat(i.marginTop)||0)+(parseFloat(i.marginBottom)||0)+o}t=i}return Math.round(n)}static{this.BOTTOM_GUTTER_PX=16}static{this.MAX_SLIVER_PX=64}static{this.MAX_CORRECTIONS=3}static{this.MAX_UNSETTLED_REFUSALS=4}static{this.MIN_FILL_PX=320}boxStyle(){let e=`border: var(--mateu-section-border, none); background: var(--mateu-section-bg, transparent); overflow: hidden; padding: var(--mateu-section-padding, 0); display: flex; flex-direction: column;`;return this.fillHeightPx==null?`${e} max-height: calc(100dvh - 12rem);`:`${e} height: ${this.fillHeightPx}px;`}connectedCallback(){super.connectedCallback(),window.addEventListener(`resize`,this.windowResizeListener),this.resizeObserver=new ResizeObserver(e=>{let t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.loadingTimer),window.removeEventListener(`resize`,this.windowResizeListener),this.resizeObserver?.disconnect()}static{this.LOADING_VALVE_MS=15e3}get awaitingRows(){return this.loadingSince!=null&&Date.now()-this.loadingSince<Ou.LOADING_VALVE_MS}beginLoading(){this.loadingSince=Date.now(),clearTimeout(this.loadingTimer),this.loadingTimer=setTimeout(()=>this.requestUpdate(),Ou.LOADING_VALVE_MS)}endLoading(){this.loadingSince=void 0,clearTimeout(this.loadingTimer)}ownLoadingBackground(){let e=(this.data?.[this.id])?.page?.content;return Tu(`search`,!!e?.length)||void 0}_filterIds(e){return new Set([`searchText`,`ids`,...(e.filters??[]).filter(e=>!e.readOnly).flatMap(e=>e.stereotype===`dateRange`||e.stereotype===`numberRange`?[`${e.fieldId}_from`,`${e.fieldId}_to`]:[e.fieldId])])}_syncStateToUrl(e){let t=this._filterIds(e),n=new URLSearchParams(window.location.search);t.forEach(e=>n.delete(e)),n.delete(`q`),n.delete(`page`),n.delete(`sort`),t.forEach(e=>{let t=this.state[e];t!=null&&t!==``&&n.set(e,String(t))});let r=this.state.page;r&&r>0&&n.set(`page`,String(r));let i=this.state.sort;if(i&&i.length>0){let e=i.filter(e=>e.fieldId&&e.direction).map(e=>`${e.fieldId}:${e.direction}`).join(`,`);e&&n.set(`sort`,e)}let a=n.toString(),o=a?`${window.location.pathname}?${a}`:window.location.pathname;window.location.pathname+window.location.search!==o&&history.replaceState(null,``,o),this._appliedUrl=window.location.pathname+window.location.search}_urlParams(){let e=new URLSearchParams(window.location.search);return e.has(`q`)&&!e.has(`searchText`)&&e.set(hi,e.get(`q`)??``),e.delete(`q`),e}_initStateFromUrl(e,t){let n=this._urlParams(),r=this._filterIds(e),i={...t};n.forEach((e,t)=>{r.has(t)&&(i[t]=e)});let a=n.get(`page`);if(a!==null){let e=parseInt(a,10);!isNaN(e)&&e>0&&(i.page=e)}let o=n.get(`sort`);if(o){let e=o.split(`,`).map(e=>{let[t,n]=e.split(`:`);return t&&n?{fieldId:t,direction:n}:null}).filter(Boolean);e.length>0&&(i.sort=e)}return i}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}_pageSizeOf(e){let t=Number(e?.pageSize);if(t>0)return t;let n=Number(this.state?.size);if(n>0)return n;let r=Number((this.data?.[this.id])?.page?.pageSize);return r>0?r:void 0}static _initKeyOf(e){if(!e)return;let t=e.metadata?.rowsSource;return`${e.id}|${t?t.ref??t.url??``:``}`}willUpdate(e){if(super.willUpdate(e),!e.has(`data`)||this.data?.[this.id]!=null)return;let t=this._restRows;!t||t.key!==Ou._initKeyOf(this.component)||(this.data={...this.data,[this.id]:t.listing})}updated(e){if(super.updated(e),e.has(`component`)?this.scheduleMeasure():(this.measureFill(),this.trimOverflow()),this.data?.[this.id]==null?this.loadingSince==null&&this._initializedForKey!=null&&!this.awaitingRows&&this.beginLoading():this.endLoading(),e.has(`component`)){let e=Ou._initKeyOf(this.component),t=this.component?.metadata,n=globalThis.window?.location,r=n?n.pathname+n.search:void 0,i=!!n&&e===this._initializedForKey&&this._appliedUrl!==void 0&&r!==this._appliedUrl&&n.pathname===this._appliedUrl.split(`?`)[0];if(i){let e={...this.state};this._filterIds(t).forEach(t=>{delete e[t]}),this.state=e}if(e!==this._initializedForKey||i){this._initializedForKey=e,this._appliedUrl=r;let n=t.initialPage&&t.initialPage>0?t.initialPage:0;this.state=this._initStateFromUrl(t,{...this.state,size:t.pageSize,page:n,sort:[]}),(this.state.page!==n||this.state.sort?.length>0||[...this._filterIds(t)].some(e=>this.state[e]!=null)||t.rowsSource||i)&&this.handleSearchRequested(void 0)}else{let e=this._restoreUrlFiltersIfMissing(t,this.state);e!==this.state&&(this.state=e)}}}_restoreUrlFiltersIfMissing(e,t){let n=this._urlParams(),r=this._filterIds(e),i=t;return n.forEach((e,n)=>{if(!r.has(n))return;let a=i[n];(a==null||a===``)&&(i===t&&(i={...t}),i[n]=e)}),i}render(){let e=e=>F.get()?.renderToolbarButton?.(e,this.evalLabel(e.label),()=>this.handleToolbarButtonClick(e))||D`
                <button class="crud-btn ${ni(e)}"
                        data-action-id="${e.id}"
                        theme="${ti(e)||x}"
                        @click="${()=>this.handleToolbarButtonClick(e)}"
                >${this.evalLabel(e.label)}</button>
            `;if(!this.component)return D`no component`;let t=this.effectiveComponent,n=t.metadata;n.serverSideOrdering=!0;let r=(()=>{let e=this;for(;e;){let t=e;if(t.tagName===`MATEU-PAGE`)return(t.component?.metadata?.toolbar?.length??0)>0;e=t.parentElement??(t.getRootNode?.()instanceof ShadowRoot?t.getRootNode().host:null)}return!1})()?[]:n?.toolbar??[],i=r.filter(e=>Pr(e.actionId)&&!Mr(e.actionId)),a=r.filter(e=>Mr(e.actionId)),o=r.filter(e=>!Pr(e.actionId)),s=i.length>0&&o.length>0,c=!!n?.title||!!n?.subtitle||r.length>0,l=this.effectiveGridLayout,u=this.cols,d=Su(u),f=this.data[this.id]?.page?.content??[],p=this.state[this.component?.id]?.emptyStateMessage,m=(e,t)=>{let n=t[e.id];if(n==null)return D``;if(e.dataType===`status`){let e=gu(n);return D`<span theme="badge pill ${_u(e.type)}">${e.message}</span>`}return e.dataType===`bool`?D`${n?`✓`:`✗`}`:typeof n==`object`?D`${n.label??n.name??n.message??``}`:D`${n}`},h=()=>{let e=this.identifierFieldName,t=this.state._selectedId??this.appState?._splitDetailId,n=d.find(e=>e.identifier)??d[0],r=e=>e.dataType===`action`||e.dataType===`actionGroup`||e.dataType===`menu`||e.stereotype===`button`,i=d.filter(e=>e!==n&&!r(e)),a=u.filter(e=>r(e)),o=(e,t,n)=>{e.stopPropagation(),e.currentTarget.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_clickedRow:n}},bubbles:!0,composed:!0}))},s=e=>{let t=[];for(let n of a){let r=e[n.id];if(n.dataType===`action`){let i=r?.methodNameInCrud?r:e.action?.methodNameInCrud?e.action:{methodNameInCrud:n.id,label:n.label,icon:null,disabled:!1};t.push(D`
                            <button class="crud-btn" theme="tertiary small" title="${i.label||x}"
                                @click="${t=>o(t,`action-on-row-`+i.methodNameInCrud,e)}">
                                ${i.icon?L(i.icon):x}
                                ${i.label??x}
                            </button>`)}else(n.dataType===`actionGroup`||n.dataType===`menu`)&&(r?.actions??[]).forEach(n=>t.push(D`
                            <button class="crud-btn" theme="tertiary small" title="${n.label||x}"
                                @click="${t=>o(t,`action-on-row-`+n.methodNameInCrud,e)}">
                                ${n.icon?L(n.icon):x}
                                ${n.label??x}
                            </button>`))}return t.length?D`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${t}
                    </div>`:x};return D`
                <div class="m-listbox" style="width: 100%;">
                    ${f.length===0?D`<div class="m-item" disabled>${fi(p)}</div>`:x}
                    ${f.map(r=>D`
                        <div role="button" tabindex="0" class="m-item"
                            ?selected="${e&&t!==void 0&&String(r[e])===String(t)}"
                            @click="${()=>{e&&r[e]!==void 0&&(this.state={...this.state,_selectedId:String(r[e])}),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`view`,parameters:r},bubbles:!0,composed:!0}))}}" @keydown="${B(()=>{e&&r[e]!==void 0&&(this.state={...this.state,_selectedId:String(r[e])}),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`view`,parameters:r},bubbles:!0,composed:!0}))})}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${n?r[n.id]??``:``}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${i.map(e=>D`<span>${e.label}: ${m(e,r)}</span>`)}
                            </div>
                            ${s(r)}
                        </div>
                    `)}
                </div>`},g=(e,t,n)=>{let r=this.identifierFieldName;r&&n[r]!==void 0&&(this.state={...this.state,_selectedId:String(n[r])}),e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:n},bubbles:!0,composed:!0}))},_=()=>{let e=this.identifierFieldName,t=this.state._selectedId??this.appState?._splitDetailId,n=e=>!!e.actionId,r=e=>e.dataType===`action`||e.dataType===`actionGroup`||e.dataType===`menu`||e.stereotype===`button`,i=si(u),a=[...i.slice(0,6),...i.slice(6).filter(e=>r(e)||e.dataType===`status`)],o=a.filter(e=>e.stereotype===`image`),s=a.find(e=>e.identifier)??a[0],c=a.find(e=>e.id===`select`&&e.dataType===`action`),l=!!c,d=a.filter(e=>e!==s&&!o.includes(e)&&!n(e)&&!r(e)),h=a.filter(e=>r(e)&&!(l&&e===c)),_=(e,t,n)=>{e.stopPropagation(),e.currentTarget.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t,parameters:{_clickedRow:n}},bubbles:!0,composed:!0}))},v=e=>{let t=[];for(let n of h){let r=e[n.id];if(n.dataType===`action`){let i=r?.methodNameInCrud?r:e.action?.methodNameInCrud?e.action:{methodNameInCrud:n.id,label:n.label,icon:null,disabled:!1};t.push(D`
                            <button class="crud-btn" theme="tertiary" title="${i.label||x}"
                                @click="${t=>_(t,`action-on-row-`+i.methodNameInCrud,e)}">
                                ${i.icon?L(i.icon):x}
                                ${i.label??x}
                            </button>`)}else(n.dataType===`actionGroup`||n.dataType===`menu`)&&(r?.actions??[]).forEach(n=>t.push(D`
                            <button class="crud-btn" theme="tertiary" title="${n.label||x}"
                                @click="${t=>_(t,`action-on-row-`+n.methodNameInCrud,e)}">
                                ${n.icon?L(n.icon):x}
                                ${n.label??x}
                            </button>`))}return t.length?D`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${t}
                    </div>`:x};return D`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${f.length===0?D`<div style="grid-column: 1 / -1;">${fi(p)}</div>`:x}
                    ${f.map(n=>D`
                        <div role="button" tabindex="0" class="crud-card"
                            ?data-selected="${e&&t!==void 0&&String(n[e])===String(t)}"
                            style="cursor: pointer;"
                            @click="${e=>l?_(e,`action-on-row-select`,n):g(e.target,`view`,n)}" @keydown="${B(e=>l?_(e,`action-on-row-select`,n):g(e.target,`view`,n))}"
                        >
                            ${o.length?D`<img src="${n[o[0].id]??``}" alt="" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: var(--lumo-border-radius-m, 8px);" />`:x}
                            ${s?D`<div class="crud-card-title">${n[s.id]??``}</div>`:x}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${d.map(e=>D`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${e.label}</span>
                                        <span>${m(e,n)}</span>
                                    </div>
                                `)}
                            </div>
                            ${v(n)}
                        </div>
                    `)}
                </div>`},v=()=>{let e=Cu(u),t=e.find(e=>e.identifier)??e[0],n=e.filter(e=>e!==t);return D`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <div class="m-listbox" style="width: 100%;">
                            ${f.length===0?D`<div class="m-item" disabled>${fi(p)}</div>`:x}
                            ${f.map(e=>D`
                                <div role="button" tabindex="0" class="m-item"
                                    ?selected="${this.selectedItem===e}"
                                    @click="${()=>{this.selectedItem=e}}" @keydown="${B(()=>{this.selectedItem=e})}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${t?e[t.id]??``:``}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${n.map(t=>D`${m(t,e)} `)}
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?D`
                            <div class="m-formlayout">
                                ${u.map(e=>D`
                                    <label style="display: flex; flex-direction: column; gap: .1rem; font-size: var(--lumo-font-size-s, .875rem);">
                                        <span style="color: var(--lumo-secondary-text-color, #667);">${e.label}</span>
                                        <span>${String(this.selectedItem[e.id]??``)}</span>
                                    </label>
                                `)}
                            </div>
                        `:D`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},ee=()=>{let e=this.identifierFieldName,t=this.state._selectedId??this.appState?._splitDetailId,n=u[0],r=u.slice(1),i=!!n?.actionId,a=e=>(e??[]).map(e=>{let t=Array.isArray(e.children)?e.children:[];return t.length>0?{...e,children:a(t)}:{...e,children:void 0}}),o=a(f),s=(t,n,r)=>{t.stopPropagation(),e&&n[e]!==void 0&&(this.state={...this.state,_selectedId:String(n[e])}),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:r,parameters:n},bubbles:!0,composed:!0}))},c=(a,o)=>D`
                <tr class="${e&&t!==void 0&&String(a[e])===String(t)?`selected`:``}"
                    style="cursor: pointer;" @click="${e=>s(e,a,`view`)}">
                    ${n?D`<td style="padding-left: ${o*1.2+.6}rem;">${a[n.id]??``}</td>`:x}
                    ${r.map(e=>e.id===`select`?D`<td><button class="crud-btn small" @click="${e=>{e.stopPropagation(),this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`action-on-row-select`,parameters:{_clickedRow:a}},bubbles:!0,composed:!0}))}}">Select</button></td>`:D`<td>${a[e.id]??``}</td>`)}
                    ${i?D`<td style="text-align: end;">${a?.viewable===!1?x:D`<button class="crud-btn small" @click="${e=>s(e,a,`view`)}">View</button>`}</td>`:x}
                </tr>
                ${(a.children??[]).map(e=>c(e,o+1))}
            `;return D`
                <table class="crud-table">
                    <thead><tr>
                        ${n?D`<th>${n.label??x}</th>`:x}
                        ${r.map(e=>D`<th>${e.label??x}</th>`)}
                        ${i?D`<th></th>`:x}
                    </tr></thead>
                    <tbody>
                        ${o.length===0?D`<tr><td colspan="99" style="padding: 1.5rem; text-align: center; color: var(--lumo-secondary-text-color, #888);">${fi(p)}</td></tr>`:x}
                        ${o.map(e=>c(e,0))}
                    </tbody>
                </table>`},te=F.get()?.rendersCrudLayouts?.()===!0,y=f.length===0&&this.awaitingRows?D`
            <div role="status" aria-live="polite" aria-busy="true"
                 style="padding: var(--lumo-space-m, 1rem); width: 100%; box-sizing: border-box;">
                <span style="position: absolute; width: 1px; height: 1px; overflow: hidden;
                             clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap;"
                >Loading…</span>
                <mateu-skeleton variant="grid" count="6"></mateu-skeleton>
            </div>
        `:D`
            ${n.infiniteScrolling?D`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:x}
            ${!te&&l===`list`?h():!te&&l===`cards`?n.contentHeight?D`
                <div class="m-scroll" style="width: 100%; height: ${n.contentHeight};">
                    ${_()}
                </div>
            `:_():!te&&l===`masterDetail`?v():!te&&l===`tree`?(()=>{let e=F.get();return e?.renderTreeComponent?e.renderTreeComponent(this,{rows:f,columns:u.map(e=>({id:e.id,label:e.label})),idField:this.identifierFieldName,navigable:!!u[0]?.actionId,selectedId:this.state._selectedId??this.appState?._splitDetailId}):ee()})():F.get()?.renderTableComponent(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,b=D`<div class="crud-band" aria-hidden="true"
            style="flex-shrink: 0; width: 100%; height: var(--mateu-crud-band-h, var(--mateu-page-band-h, 0px)); background-image: var(--mateu-page-band-image, none); background-repeat: repeat-x; background-size: auto 100%;"></div>`,ne=n.infiniteScrolling?x:F.get()?.renderPagination(this,this.component),S=this.showImportDialog?D`
            <div role="button" tabindex="0" class="crud-modal-backdrop" @click="${e=>{e.target===e.currentTarget&&(this.showImportDialog=!1)}}" @keydown="${B(e=>{e.target===e.currentTarget&&(this.showImportDialog=!1)})}">
                <div class="crud-modal">
                    <h3 style="margin: 0 0 .75rem;">Import</h3>
                    <input type="file" @change="${e=>{let t=e.target.files?.[0];if(t){let e=new FormData;e.append(`file`,t),fetch(`/upload`,{method:`POST`,body:e}).then(e=>e.json()).then(e=>this.handleImportUploadSuccess({detail:e})).catch(()=>this.notify(`Import failed`))}}}">
                    <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                        <button class="crud-btn" @click="${()=>{this.showImportDialog=!1}}">Cancel</button>
                    </div>
                </div>
            </div>
        `:x;return this.standalone?D`
                ${S}
                <style>
                    /* Scoped to the listing area: a grid field inside a FORM must keep sizing
                       itself, so the fill is expressed here and never on the table component. */
                    [data-crud-area] > * { flex: 1 1 auto; min-height: 0; }
                    [data-crud-area] mateu-table, [data-crud-area] mateu-redwood-table { display: flex; flex-direction: column; }
                    [data-crud-area] vaadin-grid { height: 100%; min-height: 0; }
                </style>
                <div data-crud-box style="${this.boxStyle()} width: 100%; box-sizing: border-box;">
                    <div style="flex-shrink: 0; ${Au}">
                        <mateu-content-header
                            .metadata="${n}"
                            .baseUrl="${this.baseUrl}"
                            .state="${this.state}"
                            .data="${this.data}"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                        ></mateu-content-header>
                    </div>
                    <div style="${ju} padding-inline: calc(3px + var(--mateu-edge-header-gutter, 0px)); box-sizing: border-box;">
                        <div style="flex: 1; min-width: 0;">${F.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                        ${this.renderColumnChooser()}
                    </div>
                    ${b}
                    <div data-crud-area style="flex: 1; overflow-y: auto; min-height: 0; display: flex; flex-direction: column;">${y}</div>
                    <div style="flex-shrink: 0; ${Au}">${ne}</div>
                </div>
            `:D`
            ${S}
            ${c?D`
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; box-sizing: border-box; align-items: flex-end; padding-bottom: var(--lumo-space-m, 1rem); ${Au}">
                        ${a.map(e=>D`
                            <button class="back-chevron"
                                    data-action-id="${e.id}"
                                    title="${this.evalLabel(e.label)}"
                                    aria-label="${this.evalLabel(e.label)}"
                                    @click="${()=>this.handleToolbarButtonClick(e)}">
                                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor"
                                          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>`)}
                        <div style="flex: 1; min-width: 0;">
                            ${n?.title?D`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(n.title)}</h2>
                            `:x}
                            ${n?.subtitle?D`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(n.subtitle)}</span>
                            `:x}
                        </div>
                        ${i.map(t=>e(t))}
                        ${s?D`<span class="toolbar-divider"></span>`:x}
                        ${o.map(t=>e(t))}
                        <slot></slot>
                    </div>
                `:x}
                <style>
                    /* Scoped to the listing area: a grid field inside a FORM must keep sizing
                       itself, so the fill is expressed here and never on the table component. */
                    [data-crud-area] > * { flex: 1 1 auto; min-height: 0; }
                    [data-crud-area] mateu-table, [data-crud-area] mateu-redwood-table { display: flex; flex-direction: column; }
                    [data-crud-area] vaadin-grid { height: 100%; min-height: 0; }
                </style>
            <div data-crud-box style="${this.boxStyle()}">
                <div style="${ju} padding-inline: calc(3px + var(--mateu-edge-header-gutter, 0px)); box-sizing: border-box;">
                    <div style="flex: 1; min-width: 0;">${F.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                    ${this.renderColumnChooser()}
                </div>
                ${b}
                    <div data-crud-area style="flex: 1; overflow-y: auto; min-height: 0; display: flex; flex-direction: column;">${y}</div>
                <div style="flex-shrink: 0; ${Au}">${ne}</div>
            </div>
        `}createRenderRoot(){return F.mustUseShadowRoot()?super.createRenderRoot():this}static{this.styles=v`
        ${De}
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
    
        ${V}
    `}};A([y()],q.prototype,`component`,void 0),A([y()],q.prototype,`baseUrl`,void 0),A([y({type:Boolean})],q.prototype,`standalone`,void 0),A([y()],q.prototype,`state`,void 0),A([y()],q.prototype,`data`,void 0),A([y()],q.prototype,`appState`,void 0),A([y()],q.prototype,`appData`,void 0),A([C()],q.prototype,`showImportDialog`,void 0),A([C()],q.prototype,`availableWidthPx`,void 0),A([C()],q.prototype,`selectedItem`,void 0),A([C()],q.prototype,`_columnPrefsRevision`,void 0),A([C()],q.prototype,`fillHeightPx`,void 0),A([C()],q.prototype,`loadingSince`,void 0),q=Ou=A([w(`mateu-table-crud`)],q);var Mu=(e,t)=>{let n=new Set,r=(e,i)=>{if(!e||typeof e!=`object`||n.has(e)||i>40)return!1;if(n.add(e),Array.isArray(e))return e.some(e=>r(e,i+1));let a=e;if(a.id===t&&a.metadata&&typeof a.metadata==`object`&&a.metadata.infiniteScrolling)return!0;for(let e of[`children`,`metadata`,`content`,`columns`,`tabs`,`components`,`header`,`footer`])if(r(a[e],i+1))return!0;return!1};return r(e,0)},Nu=(e,t,n)=>{let r={...e};for(let i in t){let a=t[i],o=a?.page,s=e?.[i]?.page?.content,c=Number(o?.pageNumber);if(c>0&&Array.isArray(s)&&n(i)){let e=Number(o.pageSize),t=e>0&&s.length>=c*e?s.slice(0,c*e):s;r[i]={...a,page:{...o,content:[...t,...o.content??[]]}}}else r[i]=a}return r},Pu=function(e){return e.OnLoad=`OnLoad`,e.OnSuccess=`OnSuccess`,e.OnError=`OnError`,e.OnValueChange=`OnValueChange`,e.OnCustomEvent=`OnCustomEvent`,e.AutoSave=`AutoSave`,e}({}),Fu=class extends ir{constructor(...e){super(...e),this.state={},this.data={},this._locallyEdited=new Set,this.appData={},this.appState={},this.triggerOnLoad=()=>{let e=this.component;this.registerCustomEventListeners(),e.triggers?.filter(e=>e.type==Pu.OnLoad).forEach(e=>{if((!e.condition||this._evalExpr(e.condition))&&!e.triggered){let n=e;n.triggered=!0;var t=n.times-1;n.timeoutMillis>0?this.scheduleOnload(n,t,this.id):this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.actionId,background:Du(n,this.data)},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(e,t,n)=>{if(n!=this.component?.id)return;let r=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,background:e.background,callbackToken:r},bubbles:!0,composed:!0}))},e.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=e=>{if(!(e instanceof CustomEvent))return;let t=e,n=(this.component.triggers??[]).filter(e=>e.type==Pu.OnCustomEvent).filter(e=>e.eventName==t.type).filter(e=>e.source!==`COMPONENT`||t.detail?.__source===e.from);n.length!==0&&(n.some(e=>!e.source||e.source===`SELF`)&&(e.stopPropagation(),e.preventDefault()),n.forEach(e=>{(!e.condition||this._evalExpr(e.condition))&&this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId,parameters:t.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(e){return Sr(e,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(e){return Cr(e,this.state??{},this.data??{},this._interpolationExtra())}isOverlayChild(e){let t=e?.metadata?.type;return t==M.Drawer||t==M.Dialog}removeSelfFromOwnerChildren(){let e=this.component;if(!e)return!1;let t=t=>{if(t===e)return!0;let n=t;return e.id!=null&&n?.id==e.id&&this.isOverlayChild(n)},n=this.parentNode;for(;n;){let e=n instanceof ShadowRoot?n.host:n,r=e.component?.children;if(Array.isArray(r)){let n=r.findIndex(t);if(n>=0)return r.splice(n,1),e.requestUpdate?.(),!0}n=n instanceof ShadowRoot?e:n.parentNode}return!1}applyFragment(e){if(this.id==e.targetComponentId){if(e.component)if(Xe.Add==e.action){if(this.component){let t=this.component.children??(this.component.children=[]),n=e.component.id?t.findIndex(t=>t.id==e.component.id&&this.isOverlayChild(t)):-1;n>=0?(t[n]=e.component,this.component={...this.component}):t.push(e.component)}}else{this.callbackToken=de();let t=!1;if(e.component?.type==j.ServerSide)if(this.component){let n=this.component,r=e.component;t=n.serverSideType==r.serverSideType;let i=t?(n.children??[]).filter(e=>this.isOverlayChild(e)):[];n.actions=r.actions,n.type=r.type,n.rules=r.rules,n.triggers=r.triggers,n.serverSideType=r.serverSideType,n.route=r.route,n.initialData=r.initialData,n.validations=r.validations,n.cssClasses=r.cssClasses,n.slot=r.slot,n.style=r.style,n.children=i.length?[...r.children??[],...i]:r.children,(n.serverSideType!=r.serverSideType||n.id!=r.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=e.component,setTimeout(()=>this.triggerOnLoad());else{let t=[e.component];this.component&&(this.component.children=t)}e.action!==Xe.ReplaceKeepData&&!t&&(this.state={},this.data={},this._locallyEdited.clear())}e.state&&(Object.keys(e.state).forEach(e=>this._locallyEdited.delete(e)),this.state={...this.state,...e.state});let t=this._lastOwnState,n=this.state;t&&this._locallyEdited.forEach(r=>{!(e.state!=null&&r in e.state)&&n[r]!==t[r]&&(n={...n,[r]:t[r]})}),this._lastOwnState=n,e.data&&(this.data=Nu(this.data??{},e.data,e=>Mu(this.component,e))),this._lastFragmentData=this.data,this.registerCustomEventListeners();let r=F.getAfterRenderHook();r&&setTimeout(()=>r(this)),this.requestUpdate()}}willUpdate(e){super.willUpdate(e);let t=this.component?.serverSideType,n=t!=null&&this._lastViewKey!=null&&t!==this._lastViewKey;if(t!=null&&(this._lastViewKey=t),n&&this._locallyEdited.clear(),this._keepEditedFieldValues(e,n),!e.has(`data`)||this.data===this._lastFragmentData||n)return;let r=this.data,i=e.get(`data`);r&&Object.keys(r).length===0&&i&&Object.keys(i).length>0&&(this.data=i)}_keepEditedFieldValues(e,t){if(t||!e.has(`state`)||this._locallyEdited.size===0||this.state===this._lastOwnState)return;let n=this._lastOwnState;if(!n)return;let r;this._locallyEdited.forEach(e=>{n[e]!==this.state?.[e]&&(r??={...this.state},r[e]=n[e])}),r&&(this.state=r)}adoptEditedState(e,t){this._locallyEdited.add(e),this.state=t,this._lastOwnState=t}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:e,name:t})=>e.removeEventListener(t,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(e=>e.type==Pu.OnCustomEvent).forEach(e=>{let t=e.source===`DOCUMENT`||e.source===`COMPONENT`?document:this;t.addEventListener(e.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:t,name:e.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:e,name:t})=>e.removeEventListener(t,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}};A([y()],Fu.prototype,`state`,void 0),A([y()],Fu.prototype,`data`,void 0),A([y()],Fu.prototype,`appData`,void 0),A([y()],Fu.prototype,`appState`,void 0);var Iu=new Set([`sse`,`app-data`,`rest-sources`,`command-center`,`global-search`,`notifications`,`context-selectors`,`header-actions`]);function Lu(e,t=Iu){let n=(e??[]).filter(e=>e&&!t.has(e));return{ok:n.length===0,missing:n}}function Ru(e,t=document){let n=Lu(e);return n.ok||(console.warn(`[mateu] this renderer is missing capabilities the app requires: ${n.missing.join(`, `)}. The app may not render correctly. Load a renderer build that provides them.`),t.dispatchEvent(new CustomEvent(`mateu-capability-mismatch`,{detail:{missing:n.missing,required:[...e??[]]},bubbles:!0,composed:!0}))),n}var zu=`mateu-recent-routes`,Bu=8;function Vu(){try{return JSON.parse(localStorage.getItem(zu)??`{}`)}catch{return{}}}function Hu(e){try{localStorage.setItem(zu,JSON.stringify(e))}catch{}}function Uu(e){return Vu()[e||`_`]??[]}function Wu(e,t){if(!t?.route||!t.label)return;let n=e||`_`,r=Vu(),i=(r[n]??[]).filter(e=>e.route!==t.route);i.unshift({route:t.route,label:t.label}),r[n]=i.slice(0,Bu),Hu(r)}var Gu=class extends S{constructor(...e){super(...e),this.baseUrl=``,this.open=!1,this.queryText=``,this.dataHits=[],this.loading=!1,this.selectedIndex=0,this.fabOffset=0,this.keydownHandler=null}connectedCallback(){super.connectedCallback(),this.keydownHandler=e=>{(e.metaKey||e.ctrlKey)&&(e.key===`k`||e.key===`K`)?(e.preventDefault(),this.toggle()):e.key===`Escape`&&this.open&&this.close()},document.addEventListener(`keydown`,this.keydownHandler),this.setupFabObserver()}disconnectedCallback(){super.disconnectedCallback(),this.keydownHandler&&document.removeEventListener(`keydown`,this.keydownHandler),clearTimeout(this.searchTimer),this.fabObserver?.disconnect(),this.fabObserver=void 0}setupFabObserver(){let e=this.getRootNode(),t=e instanceof ShadowRoot?e:document.body;this.measureFabStack(),this.fabObserver?.disconnect(),this.fabObserver=new MutationObserver(()=>this.measureFabStack()),this.fabObserver.observe(t,{childList:!0,subtree:!0})}measureFabStack(){let e=this.getRootNode().querySelectorAll?.(`.app-fab`).length??0;e!==this.fabOffset&&(this.fabOffset=e)}updated(e){e.has(`open`)&&this.open&&requestAnimationFrame(()=>this.inputEl?.focus())}toggle(){this.open?this.close():this.openCenter()}openCenter(){this.open=!0,this.queryText=``,this.dataHits=[],this.selectedIndex=0}close(){this.open=!1,this.queryText=``,this.dataHits=[],clearTimeout(this.searchTimer)}flattenMenu(e,t){let n=[];for(let r of e??[])if(!r.separator)if(r.submenus&&r.submenus.length>0){let e=t?`${t} › ${r.label}`:r.label;n.push(...this.flattenMenu(r.submenus,e))}else r.route!==void 0&&r.route!==null&&n.push({label:r.label,breadcrumb:t,route:r.route});return n}onInput(e){this.queryText=e,this.selectedIndex=0;let t=e.trim();if(clearTimeout(this.searchTimer),!t||!this.app?.globalSearchEnabled){this.dataHits=[],this.loading=!1;return}this.loading=!0,this.searchTimer=setTimeout(()=>this.fetchGlobalSearch(t),250)}async fetchGlobalSearch(e){let t=this.app;if(!t?.globalSearchEnabled){this.loading=!1;return}try{let n=(await Tn.runAction(this.baseUrl??``,t.rootRoute??``,``,`_globalsearch`,`command-center`,void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(e=>e.data).find(e=>e&&e._globalsearch);this.dataHits=n?._globalsearch??[]}catch{this.dataHits=[]}finally{this.loading=!1}}navigateTo(e,t){Wu(this.app?.serverSideType??``,{route:e,label:t}),this.close();for(let t of[`route-changed`,`navigate-to-requested`])this.dispatchEvent(new CustomEvent(t,{detail:{route:e},bubbles:!0,composed:!0}))}askAi(){let e=this.queryText.trim();this.close(),this.dispatchEvent(new CustomEvent(`mateu-open-ai`,{detail:{query:e},bubbles:!0,composed:!0}))}visibleTargets(e){if(!this.queryText.trim()){let e=this.flattenMenu(this.app?.menu,``).map(e=>({route:e.route,label:e.label})),t=Uu(this.app?.serverSideType??``);return[...e,...t]}return[...e.map(e=>({route:e.route,label:e.label})),...this.dataHits.map(e=>({route:e.route,label:e.label}))]}onKeydown(e,t){if(e.key===`ArrowDown`)e.preventDefault(),this.selectedIndex=Math.min(this.selectedIndex+1,t.length-1);else if(e.key===`ArrowUp`)e.preventDefault(),this.selectedIndex=Math.max(this.selectedIndex-1,0);else if(e.key===`Enter`){let e=t[this.selectedIndex];e&&this.navigateTo(e.route,e.label)}}render(){return D`
            <button class="cc-fab" style="${Uo(this.fabOffset)} z-index: 950;" ${ts(`shell`,this.fabOffset)}
                @click=${()=>this.openCenter()} title="Buscar y navegar (⌘K)" aria-label="Command center">
                ${this.fabIcon()}
            </button>
            ${this.open?this.renderOverlay():x}
        `}fabIcon(){return D`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>`}renderOverlay(){let e=this.queryText.trim().toLowerCase(),t=e?this.flattenMenu(this.app?.menu,``).filter(t=>t.label.toLowerCase().includes(e)||t.breadcrumb.toLowerCase().includes(e)):[],n=this.visibleTargets(t);return D`
            <div class="cc-backdrop" @click=${()=>this.close()}>
                <div class="cc-panel" @click=${e=>e.stopPropagation()}>
                    <div class="cc-bar">
                        <button class="cc-icon-btn" @click=${()=>this.queryText?this.onInput(``):this.close()} title="${this.queryText?`Borrar`:`Cerrar`}">
                            ${this.queryText?this.backIcon():this.searchGlyph()}
                        </button>
                        <input class="cc-input" .value=${this.queryText} placeholder="Buscar pantallas, datos y acciones…"
                            @input=${e=>this.onInput(e.target.value)}
                            @keydown=${e=>this.onKeydown(e,n)}>
                        ${this.queryText?D`<button class="cc-icon-btn" @click=${()=>this.onInput(``)} title="Limpiar">${this.clearIcon()}</button>`:x}
                    </div>
                    <div class="cc-body">
                        ${e?this.renderResults(t):this.renderDefault()}
                    </div>
                </div>
                <button class="cc-close" @click=${()=>this.close()} title="Cerrar">${this.clearIcon()}</button>
            </div>
        `}renderDefault(){let e=this.flattenMenu(this.app?.menu,``),t=Uu(this.app?.serverSideType??``),n=-1;return D`
            <div class="cc-columns">
                <div class="cc-col">
                    <div class="cc-section-title">Ir a</div>
                    <div class="cc-tiles">
                        ${e.map(e=>{n++;let t=n;return D`
                            <button class="cc-tile ${t===this.selectedIndex?`cc-sel`:``}"
                                @click=${()=>this.navigateTo(e.route,e.label)}
                                @mouseenter=${()=>{this.selectedIndex=t}}>
                                <span class="cc-tile-label">${e.label}</span>
                                ${e.breadcrumb?D`<span class="cc-sub">${e.breadcrumb}</span>`:x}
                            </button>`})}
                        ${e.length===0?D`<div class="cc-empty">Sin opciones de menú.</div>`:x}
                    </div>
                </div>
                ${t.length>0?D`
                    <div class="cc-col cc-col--recent">
                        <div class="cc-section-title">Recientes</div>
                        ${t.map(e=>{n++;let t=n;return D`
                            <button class="cc-row ${t===this.selectedIndex?`cc-sel`:``}"
                                @click=${()=>this.navigateTo(e.route,e.label)}
                                @mouseenter=${()=>{this.selectedIndex=t}}>
                                <span class="cc-tile-label">${e.label}</span>
                            </button>`})}
                    </div>`:x}
            </div>
        `}renderResults(e){if(this.loading&&this.dataHits.length===0&&e.length===0)return D`<div class="cc-list">${[0,1,2,3].map(()=>D`<div class="cc-skeleton"></div>`)}</div>`;let t=e.length===0&&this.dataHits.length===0;return D`
            <div class="cc-list">
                ${this.app?.sseUrl?D`
                    <button class="cc-row cc-ask-ai" @click=${()=>this.askAi()}>
                        ${this.aiIcon()}<span class="cc-tile-label">Preguntar a la IA: “${this.queryText.trim()}”</span>
                    </button>`:x}
                ${e.length>0?D`<div class="cc-section-title">Pantallas</div>`:x}
                ${e.map((e,t)=>D`
                    <button class="cc-row ${t===this.selectedIndex?`cc-sel`:``}"
                        @click=${()=>this.navigateTo(e.route,e.label)}
                        @mouseenter=${()=>{this.selectedIndex=t}}>
                        <span class="cc-tile-label">${e.label}</span>
                        ${e.breadcrumb?D`<span class="cc-sub">${e.breadcrumb}</span>`:x}
                    </button>`)}
                ${this.renderDataHits(e.length)}
                ${t?D`<div class="cc-empty">No encontramos coincidencias para “${this.queryText.trim()}”.</div>`:x}
            </div>
        `}renderDataHits(e){if(this.dataHits.length===0)return x;let t;return D`${this.dataHits.map((n,r)=>{let i=e+r,a=n.category&&n.category!==t;return t=n.category,D`
                ${a?D`<div class="cc-section-title">${n.category}</div>`:x}
                <button class="cc-row ${i===this.selectedIndex?`cc-sel`:``}"
                    @click=${()=>this.navigateTo(n.route,n.label)}
                    @mouseenter=${()=>{this.selectedIndex=i}}>
                    <span class="cc-tile-label">${n.label}</span>
                    ${n.description?D`<span class="cc-sub">${n.description}</span>`:x}
                </button>`})}`}searchGlyph(){return D`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`}backIcon(){return D`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`}clearIcon(){return D`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`}aiIcon(){return D`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 4.7L19 8.5l-4.1 2.3L12 15l-1.9-4.2L6 8.5l5.1-1.8z"></path></svg>`}static{this.styles=[v`
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
    `,Go(`.cc-fab`)]}};A([y({attribute:!1})],Gu.prototype,`app`,void 0),A([y()],Gu.prototype,`baseUrl`,void 0),A([C()],Gu.prototype,`open`,void 0),A([C()],Gu.prototype,`queryText`,void 0),A([C()],Gu.prototype,`dataHits`,void 0),A([C()],Gu.prototype,`loading`,void 0),A([C()],Gu.prototype,`selectedIndex`,void 0),A([C()],Gu.prototype,`fabOffset`,void 0),A([T(`.cc-input`)],Gu.prototype,`inputEl`,void 0),Gu=A([w(`mateu-command-center`)],Gu);var Ku=null;function qu(e){let t=e.component?.metadata;t&&(t.commandCenterEnabled||t.chromeless)&&t.variant!==`MEDIATOR`?((!Ku||!Ku.isConnected)&&(Ku=document.createElement(`mateu-command-center`),e.renderRoot.appendChild(Ku)),Ku.app=t,Ku.baseUrl=e.baseUrl??``):Ku&&e.renderRoot.contains(Ku)&&(Ku.remove(),Ku=null)}var Ju=(e,t=[])=>{let n=new Set(t.map(e=>e.toLowerCase()));return e.map(e=>{let t=(e||``).toLowerCase(),r=t.split(/[^a-z0-9]+/).map(e=>e.charAt(0));for(let e of[...r,...t,...`1234567890`])if(/^[a-z0-9]$/.test(e)&&!n.has(e))return n.add(e),e;return``})},Yu=e=>e.split(`+`).filter(Boolean).map(e=>e.length===1?e.toUpperCase():e.charAt(0).toUpperCase()+e.slice(1)).join(`+`),Xu=`vaadin-button, vaadin-tab, vaadin-menu-bar-button, button.mateu-button, [data-access-key-target]`,Zu=e=>{if(!e.getClientRects().length)return!1;let t=e.getBoundingClientRect();return t.width>0&&t.height>0&&t.bottom>0&&t.top<window.innerHeight},Qu=(e,t=[])=>(e.querySelectorAll(`*`).forEach(e=>{e.matches(Xu)&&t.push(e),e.shadowRoot&&Qu(e.shadowRoot,t)}),t),$u=e=>{let t=e.getAttribute(`data-action-id`);if(!t)return``;let n=e;for(;n;){if(n instanceof HTMLElement&&n.localName===`mateu-component`){let e=(n.component?.actions??[]).find(e=>e.id===t)?.shortcut;if(e)return e}n=n.parentNode??(n instanceof ShadowRoot?n.host:null)}return``},ed=e=>Qu(e).filter((e,t,n)=>n.indexOf(e)===t).filter(e=>Zu(e)&&!e.hasAttribute(`disabled`)&&e.getAttribute(`aria-disabled`)!==`true`).map(e=>({el:e,label:(e.getAttribute(`aria-label`)||e.textContent||``).replace(/\s+/g,` `).trim(),declared:e.getAttribute(`data-shortcut`)||$u(e)})).filter(e=>e.label),td=!1,nd=!1,rd=[],id=()=>document.querySelectorAll(`.mateu-access-keys`).forEach(e=>e.remove()),ad=()=>{id();let e=ed(document),t=e.map(e=>/^alt\+([a-z0-9])$/i.exec(e.declared)?.[1]??``).filter(Boolean),n=e.filter(e=>!e.declared);Ju(n.map(e=>e.label),t).forEach((e,t)=>{n[t].letter=e});let r=document.createElement(`div`);r.className=`mateu-access-keys`,r.setAttribute(`aria-hidden`,`true`),Object.assign(r.style,{position:`fixed`,inset:`0`,pointerEvents:`none`,zIndex:`10000`});for(let t of e){let e=t.declared?Yu(t.declared):(t.letter??``).toUpperCase();if(!e)continue;let n=t.el.getBoundingClientRect(),i=document.createElement(`span`);i.textContent=e,Object.assign(i.style,{position:`absolute`,left:Math.max(0,n.left-4)+`px`,top:Math.max(0,n.top-8)+`px`,padding:`0 .3rem`,borderRadius:`3px`,font:`600 .7rem/1.2rem var(--lumo-font-family, sans-serif)`,background:`#fcd34d`,color:`#1a1a1a`,boxShadow:`0 1px 3px rgba(0,0,0,.35)`}),r.appendChild(i)}document.body.appendChild(r),rd=e.filter(e=>e.letter)},od=e=>{if(td=!!e,td||id(),nd||!td)return;nd=!0;let t;document.addEventListener(`keydown`,e=>{if(!td)return;if(e.key===`Alt`&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey){t||=setTimeout(ad,250);return}if(t&&=(clearTimeout(t),void 0),!e.altKey||e.ctrlKey||e.metaKey)return;let n=/^(Key([A-Z])|Digit([0-9]))$/.exec(e.code||``),r=n?(n[2]||n[3]).toLowerCase():``;if(!r)return;document.querySelector(`.mateu-access-keys`)||ad();let i=rd.find(e=>e.letter===r);i&&(e.preventDefault(),e.stopPropagation(),id(),i.el.click())},!0),document.addEventListener(`keyup`,e=>{e.key===`Alt`&&(t&&=(clearTimeout(t),void 0),id())},!0),window.addEventListener(`blur`,id)},sd=`data-mateu-pending-styles`,cd=`
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
`,ld=new WeakSet,ud=e=>{if(ld.has(e))return;ld.add(e);let t=e;if(typeof CSSStyleSheet<`u`&&Array.isArray(t.adoptedStyleSheets))try{let e=new CSSStyleSheet;e.replaceSync(cd),t.adoptedStyleSheets=[...t.adoptedStyleSheets,e];return}catch{}let n=e instanceof Document?e.head:e;if(!n)return;let r=document.createElement(`style`);r.setAttribute(sd,``),r.textContent=cd,n.appendChild(r)},dd=e=>{let t=e.getRootNode();if(t instanceof ShadowRoot||t instanceof Document)return t},fd=new Set,pd=()=>{for(let e of fd){if(e.isConnected&&e.hasAttribute(`data-mateu-pending`))return!0;fd.delete(e)}return!1},md=e=>{if(!e||e.hasAttribute(`data-mateu-pending`))return;let t=dd(e);t&&ud(t),e.setAttribute(`data-mateu-pending`,``),e.setAttribute(`aria-busy`,`true`),fd.add(e)},hd=e=>{e&&(e.removeAttribute(`data-mateu-pending`),e.removeAttribute(`aria-busy`),fd.delete(e))},gd=e=>{let t=(typeof e.composedPath==`function`?e.composedPath():[])[0]??e.target;return t instanceof Element?t:void 0},_d=[`button`,`a[href]`,`[role="button"]`,`[role="menuitem"]`,`input[type="button"]`,`input[type="submit"]`,`vaadin-button`,`vaadin-menu-bar-button`,`ui5-button`,`oj-c-button`,`oj-button`].join(`, `),vd=e=>{if(!(!e||typeof e.closest!=`function`))return e.closest(_d)??void 0},yd=class extends S{constructor(...e){super(...e),this.localFeedback=!1,this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.localFeedback=pd(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1;let t=e.detail??{},n=t.failure??Gt(t.reason,{online:Qt.isOnline()});if(n.kind===`cancelled`)return;hn(pn(n,t.reason,t.actionId));let r=Kt(n)?t.retry:void 0;xu({text:n.message,variant:`error`,duration:r?8e3:5e3,position:`bottomEnd`,...r?{actionLabel:`Retry`,onAction:r}:{}},this)}}connectedCallback(){super.connectedCallback(),this.addEventListener(`backend-called-event`,this.fetchStarted),this.addEventListener(`backend-succeeded-event`,this.fetchFinished),this.addEventListener(`backend-cancelled-event`,this.fetchFinished),this.addEventListener(`backend-failed-event`,this.fetchFailed)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`backend-called-event`,this.fetchStarted),this.removeEventListener(`backend-succeeded-event`,this.fetchFinished),this.removeEventListener(`backend-cancelled-event`,this.fetchFinished),this.removeEventListener(`backend-failed-event`,this.fetchFailed)}render(){return D`<div class="loader-container">
            <div style="display: flex; flex-direction: column;">
                <slot></slot>
                <div class="loader-frame ${this.loading?this.localFeedback?`delayed-show late`:`delayed-show`:``}" style="${this.loading?`pointer-events: all;`:`display: none;`}"><div class="loader"></div></div>
            </div>
        </div>`}static{this.styles=v`
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
  `}};A([C()],yd.prototype,`loading`,void 0),A([C()],yd.prototype,`localFeedback`,void 0),yd=A([w(`mateu-api-caller`)],yd);var bd=function(e){return e.SetAppDataValue=`SetAppDataValue`,e.SetAppStateValue=`SetAppStateValue`,e.SetDataValue=`SetDataValue`,e.RunAction=`RunAction`,e.RunJS=`RunJS`,e.SetAttributeValue=`SetAttributeValue`,e.SetStateValue=`SetStateValue`,e.SetCssClass=`SetCssClass`,e.SetStyle=`SetStyle`,e}({}),xd,Sd=(e,t)=>(e.homeBaseUrl??``).includes(`://`)?e.homeBaseUrl:t||e.homeBaseUrl,Cd=`10px`,wd=[`--mateu-accent`,`--mateu-page-band-h`,`--mateu-page-band-image`],Td=(e,t,n)=>{let r=t&&/^[#\w\s(),.%-]+$/.test(t.trim())?t.trim():void 0,i=n&&(/^[\w\s/.:%~?&=#+,@-]+$/.test(n.trim())||/^data:image\/svg\+xml;base64,[A-Za-z0-9+/]+=*$/.test(n.trim()))?n.trim():void 0;r?(e.style.setProperty(`--mateu-accent`,r),e.style.setProperty(`--mateu-page-band-h`,Cd),e.style.setProperty(`--mateu-page-band-image`,i?`url("${i}")`:`linear-gradient(${r}, ${r})`),e._mateuAccent=r):e._mateuAccent&&=(wd.forEach(t=>e.style.removeProperty(t)),void 0)},J=class extends Fu{static{xd=this}constructor(...e){super(...e),this.filter=``,this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.sectionsOpen=!1,this.commandPaletteOpen=!1,this.commandPaletteQuery=``,this.commandPaletteSelectedIndex=0,this.commandPaletteDataHits=[],this._fetchedAppDataRef=void 0,this.openDataHit=e=>{ei.confirmLeave()&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=``,this.commandPaletteDataHits=[],this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:e.route},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`navigate-to-requested`,{detail:{route:e.route},bubbles:!0,composed:!0})))},this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this._openAiHandler=()=>{this.chatOpen||this.showHideIa()},this.isDark=document.documentElement.getAttribute(`theme`)===`dark`,this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;let e=this.isDark?`dark`:`light`;document.documentElement.setAttribute(`theme`,e),localStorage.setItem(`mateu-theme`,e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?`detail`:`detail-hidden`)},this.runAction=e=>{let t=this.renderRoot.querySelector?.(`mateu-component`);t&&t.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e},bubbles:!0,composed:!0}))},this.runMenuRules=e=>{for(let t of e)if(t.action===bd.RunAction&&t.actionId)this.runAction(t.actionId);else if(t.action===bd.RunJS&&t.value!=null)try{Function(String(t.value))()}catch(e){console.error(`menu RunJS rule failed`,e)}},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){let n=e[t];if(this.selectedRoute?this.isActiveOption(n):n.selected)return n;let r=this.getSelectedOption(n.submenus);if(r)return r}return null},this.itemSelected=e=>{let t=e.detail.value;if(t.unavailable){Xn();return}this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix,t.rules)},this.itemSelectedTiles=e=>{let t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix,t.rules))},this.mapItemsForTiles=e=>e.map(e=>({text:e.label,consumedRoute:e.consumedRoute,route:e.route,baseUrl:e.baseUrl,serverSideType:e.serverSideType,uriPrefix:e.uriPrefix,actionId:e.actionId,selected:e.selected,_menuOption:e})),this.flattenMenuForPalette=(e,t)=>{let n=[];for(let r of e)if(!r.separator)if(r.submenus&&r.submenus.length>0){let e=t?`${t} › ${r.label}`:r.label;n.push(...this.flattenMenuForPalette(r.submenus,e))}else n.push({label:r.label,breadcrumb:t,consumedRoute:r.consumedRoute,route:r.route,actionId:r.actionId,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix});return n},this.handleCommandPaletteKeydown=(e,t)=>{let n=Math.min(t.length,10),r=n+Math.min(this.commandPaletteDataHits.length,8);if(e.key===`ArrowDown`)e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,r-1);else if(e.key===`ArrowUp`)e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key===`Enter`){if(this.commandPaletteSelectedIndex>=n){let e=this.commandPaletteDataHits[this.commandPaletteSelectedIndex-n];e&&this.openDataHit(e);return}let e=t[this.commandPaletteSelectedIndex];e&&(this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=``)}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return x;let e=this.component?.metadata;if(e?.commandCenterEnabled||!e?.menu)return x;let t=this.flattenMenuForPalette(e.menu,``),n=this.commandPaletteQuery.toLowerCase(),r=n?t.filter(e=>e.label.toLowerCase().includes(n)||e.breadcrumb.toLowerCase().includes(n)):t;return D`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=``}}>
                <div class="cmd-palette" @click=${e=>e.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        ${L(`vaadin:search`,void 0,`cmd-search-icon`)}
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${e=>{this.commandPaletteQuery=e.target.value,this.commandPaletteSelectedIndex=0,this.fetchGlobalSearch(this.commandPaletteQuery)}}
                            @keydown=${e=>this.handleCommandPaletteKeydown(e,r)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${r.slice(0,10).map((e,t)=>D`
                            <div class="cmd-result ${t===this.commandPaletteSelectedIndex?`cmd-result--selected`:``}"
                                @click=${()=>{this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=``}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=t}}
                            >
                                <span class="cmd-result-label">${e.label}</span>
                                ${e.breadcrumb?D`<span class="cmd-result-breadcrumb">${e.breadcrumb}</span>`:x}
                            </div>
                        `)}
                        ${n&&this.commandPaletteDataHits.length>0?D`
                            ${this.commandPaletteDataHits.slice(0,8).map((e,t)=>{let n=Math.min(r.length,10)+t,i=this.commandPaletteDataHits[t-1];return D`
                                    ${e.category&&e.category!==i?.category?D`
                                        <div class="cmd-category">${e.category}</div>`:x}
                                    <div class="cmd-result ${n===this.commandPaletteSelectedIndex?`cmd-result--selected`:``}"
                                         @click=${()=>this.openDataHit(e)}
                                         @mouseenter=${()=>{this.commandPaletteSelectedIndex=n}}
                                    >
                                        <span class="cmd-result-label">${e.label}</span>
                                        ${e.description?D`<span class="cmd-result-breadcrumb">${e.description}</span>`:x}
                                    </div>`})}`:x}
                        ${r.length===0&&this.commandPaletteDataHits.length===0?D`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:x}
                    </div>
                </div>
            </div>
        `},this.renderRail=e=>D`
            <div class="nav-rail">
                ${e.map(e=>this.renderRailItem(e))}
            </div>
        `,this.renderRailItem=e=>D`
            <div class="rail-item ${(e.submenus?.length>0?this.railOpenOption?.label===e.label:e.selected)?`rail-item--active`:``}"
                @click=${()=>{e.submenus&&e.submenus.length>0?this.railOpenOption=this.railOpenOption?.label===e.label?null:e:(this.railOpenOption=null,this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix,e.rules))}}
            >
                ${e.icon?L(e.icon,void 0,`rail-icon`):D`<div class="rail-icon-placeholder">${e.label.charAt(0).toUpperCase()}</div>`}
                <span class="rail-label">${e.label}</span>
            </div>
        `,this.renderRailSubPanel=e=>D`
            <div class="rail-sub-panel">
                <div class="rail-sub-title">${e.label}</div>
                ${e.submenus.map(e=>D`
                    <div class="rail-sub-item ${e.selected?`rail-sub-item--active`:``}"
                        @click=${()=>{e.submenus&&e.submenus.length>0?this.railOpenOption=e:this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix,e.rules)}}
                    >${e.label}</div>
                `)}
            </div>
        `,this.renderTilesHub=e=>D`
            <div style="padding: 2rem;">
                <h2 style="margin-top: 0; margin-bottom: 1.5rem;">${e.label}</h2>
                <div class="tiles-hub-grid">
                    ${e.submenus.map(e=>D`
                        <div class="nav-tile"
                            @click=${()=>{e.submenus&&e.submenus.length>0?this.tilesMenuOption=e:(this.tilesMenuOption=null,this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix,e.rules))}}
                        >
                            ${e.icon?L(e.icon,`font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;`):x}
                            <div class="nav-tile-title">${e.label}</div>
                            ${e.description?D`<div class="nav-tile-desc">${e.description}</div>`:x}
                        </div>
                    `)}
                </div>
            </div>
        `,this.goHome=()=>{ei.confirmLeave()&&(window.history.pushState(null,``,`/`),window.dispatchEvent(new PopStateEvent(`popstate`,{state:null})))},this.selectRoute=(e,t,n,r,i,a,o)=>{if(o&&o.length>0){this.runMenuRules(o);return}ei.confirmLeave()&&this._selectRoute(e,t,n,r,i,a)},this._selectRoute=(e,t,n,r,i,a)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=r,this.selectedRoute=t,this.selectedServerSideType=i,this.selectedUriPrefix=a,this.instant=de(),this.state&&this.state._route!=null&&(this.state._route=void 0);let n=this.baseUrl??``;n.indexOf(`://`)<0&&(n.startsWith(`/`)||(n=`/`+n),n=window.location.origin+n),n.endsWith(`/`)&&(t??``).startsWith(`/`)&&(t=(t??``).substring(1));let o=new URL(n+t);if(e&&o.pathname.startsWith(e)){let t=o.pathname.substring(e.length);o=new URL(o.origin+(t||`/`)+o.search)}if((window.location.pathname||o.pathname)&&(window.location.pathname!=o.pathname||window.location.search!=o.search)){let e=o.pathname;o.search&&(e+=o.search),e&&!e.startsWith(`/`)&&(e=`/`+e),this.baseUrl&&e.startsWith(this.baseUrl)&&(e=e.substring(this.baseUrl.length));let t=e;this.selectedUriPrefix&&(t=t.startsWith(`/`)&&this.selectedUriPrefix.endsWith(`/`)?this.selectedUriPrefix+t.substring(1):!t.startsWith(`/`)&&!this.selectedUriPrefix.endsWith(`/`)?this.selectedUriPrefix+`/`+t:this.selectedUriPrefix+t),t==`/_page`&&(t=``),this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:t},bubbles:!0,composed:!0}))}}},this.isActiveOption=e=>this.selectedRoute?Mn(e,this.selectedRoute):!!e.selected||kn(e)&&Mn(e,window.location.pathname),this.mapItems=(e,t)=>e.map(e=>{if(e.submenus&&e.submenus.length>0){let n=this.mapItems(e.submenus,t);return t&&e.label.toLowerCase().includes(t)&&(n=this.mapItems(e.submenus,``)),n&&n.length>0?{consumedRoute:e.consumedRoute,text:e.label,route:e.route,baseUrl:e.baseUrl,serverSideType:e.serverSideType,uriPrefix:e.uriPrefix,actionId:e.actionId,selected:t||this.isActiveOption(e),display:e.display??void 0,description:e.description,icon:e.icon,image:e.image??void 0,children:n}:void 0}if(e.separator)return t?void 0:{component:`hr`};if(!t||e.label.toLowerCase().includes(t))return{...e.unavailable?{unavailable:!0,className:`mateu-nav-unavailable`,tooltip:e.description,title:e.description}:{},consumedRoute:e.consumedRoute,text:e.label,route:e.route,baseUrl:e.baseUrl,serverSideType:e.serverSideType,uriPrefix:e.uriPrefix,actionId:e.actionId,selected:t||this.isActiveOption(e),description:e.unavailable?void 0:e.description,icon:e.icon,image:e.image??void 0}}).filter(e=>e!=null),this.getSelectedIndex=e=>{if(!e)return NaN;let t=Nn(e,(e=>{let t=(e??``).trim();return t.length>1&&t.endsWith(`/`)&&(t=t.slice(0,-1)),t})(this.selectedRoute??window.location.pathname));if(!Number.isNaN(t))return t;let n=this.getSelectedOption(e);return n?e.indexOf(n):NaN},this.activeSectionOf=e=>{if(!e)return;let t=Kn(e,window.location.pathname)??(this.selectedRoute?Kn(e,this.selectedRoute):void 0);if(t)return t;let n=this.getSelectedIndex(e);return Number.isNaN(n)?void 0:e[n]},this.selectSection=e=>{if(e.unavailable){Xn();return}let t=qn(e);t&&(this.sectionsOpen=!1,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix,t.rules))},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?D`
                <details open class="left-menu-group">
                    <summary>${e.label}</summary>
                    <div class="left-menu-children">
                        ${e.submenus.map(e=>D`${this.renderOptionOnLeftMenu(e)}`)}
                    </div>
                </details>
`:D`<button class="left-menu-item"
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix,e.rules)}"
        >${e.label}</button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){let e=this.shadowRoot?.querySelector(`mateu-ux`);e&&e.setAttribute(`instant`,de())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?D`
            ${e.map(e=>{let t=e;return D`

                        ${t.component==`hr`?D`<hr/>`:D`
                                <div class="side-nav-item ${t.selected?`side-nav-item--active`:``}">
                                    <button class="side-nav-link"
                                            @click="${()=>{t.route&&!t.children&&this.selectRoute(void 0,t.route,void 0,this.baseUrl,void 0,void 0)}}">
                                        ${t.icon?L(`vaadin:dashboard`,`margin-right:.5rem;`):x}${t.text}
                                    </button>
                                    ${t.children?D`<div class="side-nav-children">${this.renderSideNav(t.children,`children`)}</div>`:x}
                                </div>
                        `}

                            `})}`:x,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix,t.rules)}}createRenderRoot(){return F.mustUseShadowRoot()?super.createRenderRoot():(xd.injectLightDomStyles(),this)}static{this.lightDomStylesInjected=!1}static injectLightDomStyles(){if(xd.lightDomStylesInjected||typeof document>`u`||(xd.lightDomStylesInjected=!0,document.getElementById(`mateu-app-light-styles`)))return;let e=xd.styles,t=Array.isArray(e)?e.map(e=>e?.cssText??``).join(`
`):e?.cssText??``;if(!t)return;let n=document.createElement(`style`);n.id=`mateu-app-light-styles`,n.textContent=t,document.head.appendChild(n)}fetchGlobalSearch(e){let t=this.component?.metadata;if(t?.globalSearchEnabled){if(clearTimeout(this._globalSearchTimer),!e){this.commandPaletteDataHits=[];return}this._globalSearchTimer=setTimeout(async()=>{try{let n=(await Tn.runAction(this.baseUrl??``,t.rootRoute??``,``,`_globalsearch`,`cmd-palette`,void 0,t.serverSideType,{},{searchText:e},this,!0))?.fragments?.map(e=>e.data).find(e=>e&&e._globalsearch);this.commandPaletteDataHits=n?._globalsearch??[]}catch{this.commandPaletteDataHits=[]}},250)}}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute(`theme`)===`dark`,this._commandPaletteHandler=e=>{e.key===`Escape`&&this.sectionsOpen&&(this.sectionsOpen=!1),!this.component?.metadata?.commandCenterEnabled&&((e.metaKey||e.ctrlKey)&&e.key===`k`&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery=``,this.commandPaletteSelectedIndex=0),e.key===`Escape`&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery=``))},document.addEventListener(`keydown`,this._commandPaletteHandler),ei.install(),this.addEventListener(`compact-changed`,this._compactHandler),this.addEventListener(`mateu-open-ai`,this._openAiHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener(`keydown`,this._commandPaletteHandler),this.removeEventListener(`compact-changed`,this._compactHandler),this.removeEventListener(`mateu-open-ai`,this._openAiHandler)}updated(e){if(super.updated(e),qu(this),this.component){let t=this.component.metadata;if(t){let n=t;if(od(!!n.accessKeys),Jr(this,n.navMenu??n.menu,n.noBreadcrumbs,(e,t)=>this.selectRoute(e.consumedRoute,t,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)),xe(n.restSources),Qe(n.components),n.appDataSource){let e=n.appDataSource.ref||n.appDataSource.url;e&&e!==this._fetchedAppDataRef&&(this._fetchedAppDataRef=e,Hi(n.appDataSource).then(e=>{e&&typeof e==`object`&&(ge.value={...ge.value,...e},this.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0})))}).catch(e=>console.error(`app-scope data source fetch failed`,e)))}if(Td(this,n.accentColor,n.accentStrip||n.generatedAccentStrip),n.favicon){let e=document.querySelector(`link[rel~='icon']`);e||(e=document.createElement(`link`),e.rel=`icon`,document.head.appendChild(e)),e.href=n.favicon}e.has(`component`)&&(Ru(n.requiredCapabilities,this),this.selectedRoute=n.homeRoute,this.selectedConsumedRoute=n.homeConsumedRoute,this.selectedServerSideType=n.homeServerSideType,this.selectedBaseUrl=Sd(n,this.baseUrl),this.selectedUriPrefix=n.homeUriPrefix)}}e.has(`commandPaletteOpen`)&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(`.cmd-input`)?.focus()},0)}render(){return F.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}static{this.styles=[v`
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


  `,Go(`.app-fab, .page-fab`),Oe]}};A([C()],J.prototype,`filter`,void 0),A([C()],J.prototype,`instant`,void 0),A([C()],J.prototype,`selectedConsumedRoute`,void 0),A([C()],J.prototype,`selectedRoute`,void 0),A([C()],J.prototype,`selectedUriPrefix`,void 0),A([C()],J.prototype,`selectedBaseUrl`,void 0),A([C()],J.prototype,`selectedServerSideType`,void 0),A([C()],J.prototype,`selectedParams`,void 0),A([C()],J.prototype,`tilesMenuOption`,void 0),A([C()],J.prototype,`railOpenOption`,void 0),A([C()],J.prototype,`sectionsOpen`,void 0),A([C()],J.prototype,`commandPaletteOpen`,void 0),A([C()],J.prototype,`commandPaletteQuery`,void 0),A([C()],J.prototype,`commandPaletteSelectedIndex`,void 0),A([C()],J.prototype,`commandPaletteDataHits`,void 0),A([C()],J.prototype,`pageCompact`,void 0),A([T(`mateu-chat`)],J.prototype,`chat`,void 0),A([C()],J.prototype,`isDark`,void 0),A([C()],J.prototype,`chatOpen`,void 0),A([T(`.mateu-app-layout`)],J.prototype,`vaadinAppLayout`,void 0),J=xd=A([w(`mateu-app`)],J);var Ed=class extends S{constructor(...e){super(...e),this.message=`This website uses cookies.`,this.dismiss=`Ok. Thanks :).`,this.learnMore=`Learn more`,this.learnMoreLink=`https://cookiesandyou.com/`,this.showLearnMore=!0,this.position=`top`,this.cookieName=`mateu-cookieconsent`}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement(`style`),this._css.innerText=`.cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}`,document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){let e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){let e=this.popup;e&&(e.classList.remove(`cc-invisible`),e.style.display=``)}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:`#000`},button:{background:`rgba(22, 118, 243, 0.95)`,hover:`rgba(22, 118, 243, 1)`}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});let e=this.popup;if(e){e.setAttribute(`role`,`alert`);let t=e.querySelector(`a.cc-btn`);t?.addEventListener(`keydown`,e=>{let n=e.keyCode||e.which;(n===32||n===13)&&t.click()})}}render(){return D`
       `}static{this.styles=v`
  `}};A([y()],Ed.prototype,`message`,void 0),A([y()],Ed.prototype,`dismiss`,void 0),A([y()],Ed.prototype,`learnMore`,void 0),A([y()],Ed.prototype,`learnMoreLink`,void 0),A([y()],Ed.prototype,`showLearnMore`,void 0),A([y()],Ed.prototype,`position`,void 0),A([y()],Ed.prototype,`cookieName`,void 0),A([C()],Ed.prototype,`_css`,void 0),A([T(`[aria-label="cookieconsent"]`)],Ed.prototype,`popup`,void 0),Ed=A([w(`mateu-cookie-consent`)],Ed);var Dd=class extends S{constructor(...e){super(...e),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener(`value-changed`,this.redispatchEvent),this.addEventListener(`data-changed`,this.redispatchEvent),this.addEventListener(`action-requested`,this.redispatchEvent),this.addEventListener(`server-side-action-requested`,this.redispatchEvent),this.addEventListener(`route-changed`,this.redispatchEvent),this.addEventListener(`close-modal-requested`,this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`value-changed`,this.redispatchEvent),this.removeEventListener(`data-changed`,this.redispatchEvent),this.removeEventListener(`action-requested`,this.redispatchEvent),this.removeEventListener(`server-side-action-requested`,this.redispatchEvent),this.removeEventListener(`route-changed`,this.redispatchEvent)}render(){return D`<slot></slot>`}static{this.styles=v`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `}};A([y()],Dd.prototype,`target`,void 0),Dd=A([w(`mateu-event-interceptor`)],Dd);var Od=class extends Fu{constructor(...e){super(...e),this.opened=!0,this.close=()=>{this.opened=!1,this.releaseFocusTrap(),setTimeout(()=>{this.removeSelfFromOwnerChildren()||this.parentElement?.removeChild(this)},500)},this.onKeydown=e=>{e.key===`Escape`&&this.opened&&(e.stopPropagation(),this.close())}}connectedCallback(){super.connectedCallback(),this.addEventListener(`keydown`,this.onKeydown)}disconnectedCallback(){super.disconnectedCallback(),this.releaseFocusTrap()}releaseFocusTrap(){this.focusTrap?.release(),this.focusTrap=void 0}applyFragment(e){super.applyFragment(e);let t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has(`component`)&&this.component){let e=this.component.metadata;this.state=e.initialData}let t=this.renderRoot.querySelector(`[role="dialog"]`),n=this.component?.metadata?.modeless;this.opened&&t&&!this.focusTrap&&!n?this.focusTrap=pl(t):this.focusTrap&&this.opened&&this.focusTrap.refresh()}render(){if(!this.opened)return D``;let e=this.component.metadata,t=_r(e.headerTitle,this.state,this.data,this.appState,this.appData),n=!!(t||e.header||e.closeButtonOnHeader),r=[e.width?`width:${e.width};`:`min-width:min(90vw,28rem);`,e.height?`height:${e.height};`:``,e.top?`margin-top:${e.top};`:``].join(``);return D`
            <div class="backdrop ${e.modeless?`modeless`:``}"
                 @click="${t=>{!e.modeless&&t.target===t.currentTarget&&this.close()}}">
                <div class="dialog ${e.noPadding?`no-padding`:``} ${this.component?.cssClasses??``}"
                     role="dialog"
                     aria-modal="${e.modeless?`false`:`true`}"
                     aria-label="${t||`Dialog`}"
                     style="${r} ${this.component?.style??``}">
                    ${n?D`
                        <div class="dialog-header">
                            <mateu-event-interceptor .target="${this}" style="flex:1; min-width:0;">
                                ${t?D`<span class="dialog-title">${t}</span>`:x}
                                ${e.header?I(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):x}
                            </mateu-event-interceptor>
                            ${e.closeButtonOnHeader?D`<button class="dialog-close" @click="${this.close}" aria-label="Close">✕</button>`:x}
                        </div>`:x}
                    ${e.content?D`
                        <div class="dialog-body">
                            <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width:100%;">
                                ${I(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:x}
                    ${e.footer?D`
                        <div class="dialog-footer">
                            <mateu-event-interceptor .target="${this}" style="width:100%;">
                                ${I(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}
                            </mateu-event-interceptor>
                        </div>`:x}
                </div>
            </div>
        `}static{this.styles=[v`
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
    `,Oe]}};A([C()],Od.prototype,`opened`,void 0),Od=A([w(`mateu-dialog`)],Od);var kd,Ad=class extends Fu{static{kd=this}constructor(...e){super(...e),this.opened=!1,this.maximizeSteps=0,this.collapsed=!1,this.pagerMenuOpen=!1,this.onGuidedProgress=e=>{let t=e.detail;t&&t.total>0&&(this.guidedProgress=t)},this.close=()=>{this.opened=!1,this.releaseLayoutInset(),this.releaseFocusTrap(),setTimeout(()=>{this.removeSelfFromOwnerChildren()||this.parentElement?.removeChild(this)},300)},this._escListener=e=>{if(e.key!==`Escape`)return;let t=this.getRootNode().querySelectorAll(`mateu-drawer, mateu-dialog`);t[t.length-1]===this&&(e.stopPropagation(),this.close())}}jumpToStep(e){this.pagerMenuOpen=!1,e&&(this.renderRoot.querySelector(`.content mateu-component`)??this.renderRoot.querySelector(`mateu-component`))?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`goToStep`,parameters:{_stepId:e}},bubbles:!0,composed:!0}))}static{this.SIZE_LADDER=[`s`,`m`,`l`,`xl`]}static{this.SIZE_WIDTHS={s:`464px`,m:`648px`,l:`968px`,xl:`90vw`}}effectiveWidth(e){if(e.width)return e.width;if(!e.size)return;let t=kd.SIZE_LADDER,n=Math.max(0,t.indexOf(e.size)),r=Math.min(t.length-1,n+this.maximizeSteps);return kd.SIZE_WIDTHS[t[r]]}canMaximize(e){if(!e.maximizable)return!1;let t=kd.SIZE_LADDER;return Math.max(0,t.indexOf(e.size??`m`))+this.maximizeSteps<t.length-1}firstUpdated(){requestAnimationFrame(()=>this.opened=!0),this.addEventListener(`mateu-guided-progress`,this.onGuidedProgress);let e=this.component?.metadata;e&&requestAnimationFrame(()=>this.applyLayoutInset(e))}releaseFocusTrap(){this.focusTrap?.release(),this.focusTrap=void 0}applyLayoutInset(e){if(!e.layout)return;let t=document.querySelector(`mateu-ui`);if(!t)return;let n=e.position??`end`,r=n===`bottom`?`var(--mateu-drawer-height, 50vh)`:this.effectiveWidth(e)??`648px`;this._insetProp=n===`start`?`paddingLeft`:n===`bottom`?`paddingBottom`:`paddingRight`,t.style.transition=`padding .25s ease`,t.style[this._insetProp]=r}releaseLayoutInset(){if(!this._insetProp)return;let e=document.querySelector(`mateu-ui`);e&&(e.style[this._insetProp]=``),this._insetProp=void 0}applyFragment(e){super.applyFragment(e);let t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has(`component`)&&this.component){let e=this.component.metadata;this.state=e.initialData}let t=this.component?.metadata,n=this.renderRoot.querySelector(`[role="dialog"]`);this.opened&&n&&!t?.modeless&&!t?.layout&&!this.focusTrap?this.focusTrap=pl(n):this.focusTrap&&this.opened&&this.focusTrap.refresh()}connectedCallback(){super.connectedCallback(),document.addEventListener(`keydown`,this._escListener)}disconnectedCallback(){document.removeEventListener(`keydown`,this._escListener),this.releaseLayoutInset(),this.releaseFocusTrap(),super.disconnectedCallback()}render(){let e=this.component.metadata,t=e.position??`end`,n=_r(e.headerTitle,this.state,this.data,this.appState,this.appData),r=_r(e.subtitle,this.state,this.data,this.appState,this.appData),i=this.effectiveWidth(e),a=e.peerNav&&(e.peerNav.prevRoute||e.peerNav.nextRoute)?e.peerNav:void 0;return D`
        ${e.modeless||e.layout?x:D`
            <div class="backdrop ${this.opened?`open`:``}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${t} ${this.opened?`open`:``} ${this.collapsed?`collapsed`:``} ${this.component?.cssClasses??``}"
                role="dialog"
                aria-modal="${!e.modeless}"
                aria-label="${n??x}"
                style="${i&&t!==`bottom`?`width: ${i};`:``}${this.component?.style??``}"
        >
            <header>
                ${n?D`<div class="titles"><h3>${n}</h3>${r?D`<span class="subtitle">${r}</span>`:x}</div>`:D`<span class="spacer"></span>`}
                ${this.guidedProgress&&this.guidedProgress.total>1?D`
                    <div class="guided-pager-wrap">
                        <button class="guided-pager" aria-haspopup="true" aria-expanded="${this.pagerMenuOpen}"
                                aria-label="Step ${this.guidedProgress.current} of ${this.guidedProgress.total}"
                                @click="${()=>this.pagerMenuOpen=!this.pagerMenuOpen}">${this.guidedProgress.current} | ${this.guidedProgress.total}<span class="caret">▾</span></button>
                        ${this.pagerMenuOpen&&this.guidedProgress.steps?D`
                            <div class="guided-pager-menu">
                                ${this.guidedProgress.steps.map((e,t)=>D`
                                    <button class="guided-pager-item ${e.status}" ?disabled="${e.status!==`done`}"
                                            @click="${()=>this.jumpToStep(e.id)}"><span class="pager-dot">${e.status===`done`?`✓`:t+1}</span>${e.title??`Step ${t+1}`}</button>
                                `)}
                            </div>
                        `:x}
                    </div>
                `:x}
                ${e.header?D`
                    <mateu-event-interceptor .target="${this}">${I(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:x}
                ${a?D`
                    <button class="drawer-icon" aria-label="${a.prevLabel??`Previous`}" title="${a.prevLabel??`Previous`}"
                            ?disabled="${!a.prevRoute}" @click="${()=>{a.prevRoute&&(window.location.href=a.prevRoute)}}">‹</button>
                    <button class="drawer-icon" aria-label="${a.nextLabel??`Next`}" title="${a.nextLabel??`Next`}"
                            ?disabled="${!a.nextRoute}" @click="${()=>{a.nextRoute&&(window.location.href=a.nextRoute)}}">›</button>
                `:x}
                ${e.collapsible?D`
                    <button class="drawer-icon" aria-label="${this.collapsed?`Expand`:`Collapse`}" title="${this.collapsed?`Expand`:`Collapse`}"
                            @click="${()=>this.collapsed=!this.collapsed}">${this.collapsed?`▴`:`▾`}</button>
                `:x}
                ${this.canMaximize(e)?D`
                    <button class="drawer-icon" aria-label="Maximize" title="Maximize" @click="${()=>this.maximizeSteps++}">⤢</button>
                `:x}
                <button class="drawer-close" aria-label="Close" @click="${this.close}">✕</button>
            </header>
            ${this.collapsed?x:D`
            <div class="content ${e.noPadding?`no-padding`:``}">
                ${e.content?D`
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${I(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:x}
            </div>
            ${e.footer?D`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${I(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:x}
            `}
        </section>
       `}static{this.styles=[v`
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
  `,Oe]}};A([C()],Ad.prototype,`opened`,void 0),A([C()],Ad.prototype,`maximizeSteps`,void 0),A([C()],Ad.prototype,`collapsed`,void 0),A([C()],Ad.prototype,`guidedProgress`,void 0),A([C()],Ad.prototype,`pagerMenuOpen`,void 0),Ad=kd=A([w(`mateu-drawer`)],Ad);var jd=`(max-width: 599px)`;function Md(e){if(e.parentElement)return e.parentElement;let t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}var Y=class extends S{constructor(...e){super(...e),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocPlacement=`column`,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type===`keydown`){let t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{let t=e.detail,n=t.banners??[],r=t.append??!1;r?this.actionBanners=[...this.actionBanners,...n]:(this._clearActionBannerTimers(),this.actionBanners=n);let i=r?this.actionBanners.length-n.length:0;n.forEach((e,t)=>{if(e.timeoutSeconds&&e.timeoutSeconds>0){let n=i+t;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((e,t)=>t!==n)},e.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;let t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;let n=parseInt(t[1],10)-1;n>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(n))},this._onScrollSpy=()=>{if(this._tocLocked)return;let e=this._sectionCards();if(!e.length)return;let t=this.shadowRoot?.querySelector(`mateu-content-header`),n=t?t.getBoundingClientRect().bottom:0,r=this._tocBar();r&&(n=Math.max(n,r.getBoundingClientRect().bottom));for(let t of e){if(!t.classList.contains(`mateu-section--sticky`))continue;let e=t.getBoundingClientRect();e.top<=n+12+2&&(n=Math.max(n,e.bottom))}let i=n+12+4,a=0;this._tocEntries.forEach((e,t)=>{e.el.getBoundingClientRect().top<=i&&(a=t)}),this._activeToc=a}}connectedCallback(){super.connectedCallback(),document.addEventListener(`page-banners-received`,this._bannersHandler),window.addEventListener(`resize`,this._onResize),document.addEventListener(`keydown`,this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener(`page-banners-received`,this._bannersHandler),window.removeEventListener(`resize`,this._onResize),document.removeEventListener(`keydown`,this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy(),this._syncAside(!1)}_alignAside(){let e=this.shadowRoot?.querySelector(`.page-body`);if(!e||this._workEnd===void 0)return;let t=Math.max(0,Math.round(this._workEnd-e.getBoundingClientRect().right));this.style.setProperty(`--mateu-toc-shift`,`${t}px`)}_syncAside(e){e&&!this._releaseAside?this._releaseAside=ns(this,(e,t)=>{this._workEnd=t,e===`aside`&&requestAnimationFrame(()=>this._alignAside()),e!==this._tocPlacement&&(this._tocPlacement=e,requestAnimationFrame(()=>this._layoutStickyTops()))}):!e&&this._releaseAside&&(this._releaseAside(),this._releaseAside=void 0,this._tocPlacement=`column`)}updated(e){if(super.updated(e),this.toggleAttribute(`data-hero-top`,this._heroOnTop()),this.toggleAttribute(`data-crud-page`,this._hasCrud()),e.has(`_activeToc`)&&this._revealActiveInBar(),e.has(`component`)&&e.get(`component`)!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has(`component`)){let e=this.component?.metadata?.level??0;this.toggleAttribute(`data-nested`,e>0),this._scheduleStaticBannerTimeouts();let t=this.component?.metadata?.pageWidth===`edgeToEdge`;this.toggleAttribute(`data-edge`,t),this.dispatchEvent(new CustomEvent(`compact-changed`,{detail:{compact:!!this.component?.style?.includes(`--mateu-compact:1`)||t},bubbles:!0,composed:!0})),this._scheduleTocRebuild()}}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((e,t)=>{e.timeoutSeconds&&e.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,t])},e.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,n)=>n!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){let t=e.theme?.toLowerCase()??`info`;return t===`none`?``:t}_evalBannerText(e){return P(e,this.state,this.data)}_renderBanner(e,t){let n=this._evalBannerText(e.title),r=this._evalBannerText(e.description);return D`
            <div class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${n||e.hasCloseButton?D`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${n??``}</span>
                        ${e.hasCloseButton?D`
                            <button class="banner-close" @click=${t} title="Dismiss" aria-label="Dismiss">✕</button>
                        `:x}
                    </div>
                `:x}
                ${r?D`<p>${r}</p>`:x}
            </div>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll(`.mateu-section`))}_sectionTitle(e){return e.querySelector(`[slot="title"]`)?.textContent?.trim()||e.querySelector(`h1,h2,h3,h4,h5,h6`)?.textContent?.trim()||void 0}_rebuildToc(){let e=this._sectionCards(),t=e.map(e=>({title:this._sectionTitle(e),el:e})).filter(e=>!!e.title),n=this.component?.metadata?.toc,r=t.length>4&&e.every(e=>!e.closest(`vaadin-horizontal-layout`)),i=(n===!0||n!==!1&&r)&&t.length>0;this._tocEntries=t,this._tocVisible=i,this._syncAside(i&&!this.hasAttribute(`data-nested`)),this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),i?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){let e=this.shadowRoot?.querySelector(`mateu-content-header`),t=!window.matchMedia?.(jd).matches,n=this._tocVisible&&e&&t?e.offsetHeight:0;this.style.setProperty(`--mateu-header-h`,n+`px`),this._headerH=n+(this._tocBar()?.offsetHeight??0);let r=this._headerH+12;for(let e of this._sectionCards())e.classList.contains(`mateu-section--sticky`)&&(e.style.top=r+`px`,r+=e.offsetHeight+12)}_revealActiveInBar(){let e=this._tocBar()?.querySelector(`nav`),t=e?.querySelector(`.page-toc__item.is-active`);if(!e||!t)return;let n=t.offsetLeft-e.offsetLeft;(n<e.scrollLeft||n+t.offsetWidth>e.scrollLeft+e.clientWidth)&&e.scrollTo({left:Math.max(0,n-16),behavior:`smooth`})}_tocBar(){return this._tocVisible&&this._tocPlacement===`bar`?this.shadowRoot?.querySelector(`.page-toc`):null}_scrollContainer(){let e=Md(this);for(;e;){let t=getComputedStyle(e).overflowY;if((t===`auto`||t===`scroll`)&&e.scrollHeight>e.clientHeight)return e;e=Md(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener(`scroll`,this._onScrollSpy,{passive:!0}),window.addEventListener(`wheel`,this._unlockToc,{passive:!0}),window.addEventListener(`touchstart`,this._unlockToc,{passive:!0}),window.addEventListener(`keydown`,this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener(`scroll`,this._onScrollSpy),window.removeEventListener(`wheel`,this._unlockToc),window.removeEventListener(`touchstart`,this._unlockToc),window.removeEventListener(`keydown`,this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){let t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;let n=this._headerH+12;for(let e of this._sectionCards()){if(e===t.el)break;e.classList.contains(`mateu-section--sticky`)&&(n+=e.offsetHeight+12)}let r=this._scrollContainer(),i=r?r.getBoundingClientRect().top:0,a=t.el.getBoundingClientRect().top-i-n;(r??window).scrollBy({top:a,behavior:`smooth`})}_showHeaderBand(){let e=this.component?.metadata;return!!(e?.title||e?.subtitle||e?.overline||e?.titlePlaceholder||e?.toolbar?.length)&&!this._hasCrud()&&!this._hasWelcomeBanner()}_hasCrud(){return!!this.component?.children?.some(e=>e.metadata?.type===M.Crud)}_heroOnTop(){let e=this.component?.metadata;return!(e?.title||e?.subtitle||e?.overline||e?.titlePlaceholder||e?.toolbar?.length)&&this._hasWelcomeBanner()}_hasWelcomeBanner(){let e=t=>t?.metadata?.type===M.HeroSection||(t?.children??[]).some(e);return(this.component?.children??[]).some(e)}render(){let e=this.component?.metadata,t=[...(e?.banners??[]).map((e,t)=>({banner:e,index:t})).filter(({index:e})=>!this.dismissedStaticBannerIndices.has(e)).map(({banner:e,index:t})=>({banner:e,onDismiss:()=>this._dismissStaticBanner(t)})),...this.actionBanners.map((e,t)=>({banner:e,onDismiss:()=>this._dismissActionBanner(t)}))];return D`<div style="display: flex; flex-direction: column; width: 100%;">${D`
            <!-- The pin goes on the wrapper, not on the header inside it: a sticky element only sticks
                 within its parent, and the wrapper is exactly as tall as the header, so a pinned
                 header scrolled away with it and the index's scrollspy never left its first entry. -->
            <div class="page-header-wrap ${this._tocVisible?`sticky-header`:``}">
                <mateu-content-header
                    .metadata="${e}"
                    .baseUrl="${this.baseUrl}"
                    .state="${this.state}"
                    .data="${this.data}"
                    .appState="${this.appState}"
                    .appData="${this.appData}"
                ></mateu-content-header>
                ${this._showHeaderBand()?D`
                    <div class="page-header-band" aria-hidden="true"></div>
                `:x}
            </div>
            ${t.length>0?D`
                <div class="page-banners">
                    ${t.map(({banner:e,onDismiss:t})=>this._renderBanner(e,t))}
                </div>
            `:x}
            <div class="page-body ${this._tocVisible?`with-toc toc-${this._tocPlacement}`:``}">
                <div class="form-content">
                    <slot @slotchange=${this._onSlotChange}></slot>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem);" class="form-buttons">
                        <slot name="buttons"></slot>
                    </div>
                </div>
                ${this._tocVisible?D`
                    <aside class="page-toc" aria-label="Sections">
                        <nav>
                            ${this._tocEntries.map((e,t)=>D`
                                <a class="page-toc__item ${t===this._activeToc?`is-active`:``}"
                                   @click=${()=>this._scrollToSection(t)}
                                   title=${t<9?`${e.title} (Ctrl+Alt+${t+1})`:e.title}>
                                    <span class="page-toc__label">${e.title}</span>
                                    ${t<9?D`<span class="page-toc__key">${t+1}</span>`:x}
                                </a>
                            `)}
                        </nav>
                    </aside>
                `:x}
            </div>
            <div class="form-footer">
                ${e?.footer?.map(e=>I(this,e,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `}</div>`}static{this.styles=[v`
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
    `,Oe]}};A([y()],Y.prototype,`component`,void 0),A([y()],Y.prototype,`baseUrl`,void 0),A([y()],Y.prototype,`state`,void 0),A([y()],Y.prototype,`data`,void 0),A([y()],Y.prototype,`appState`,void 0),A([y()],Y.prototype,`appData`,void 0),A([y()],Y.prototype,`value`,void 0),A([y({type:Boolean})],Y.prototype,`standalone`,void 0),A([C()],Y.prototype,`actionBanners`,void 0),A([C()],Y.prototype,`dismissedStaticBannerIndices`,void 0),A([C()],Y.prototype,`_tocEntries`,void 0),A([C()],Y.prototype,`_activeToc`,void 0),A([C()],Y.prototype,`_tocVisible`,void 0),A([C()],Y.prototype,`_tocPlacement`,void 0),Y=A([w(`mateu-page`)],Y);function Nd(e){if(!e)return;let t=e.trim();if(!(!t.startsWith(`/`)||t.startsWith(`//`)))return t}function Pd(e,t){if(!e||(t.button??0)!==0||t.ctrlKey||t.metaKey||t.shiftKey||t.altKey)return;let n=e.getAttribute(`target`);if(!(n&&n!==`_self`))return Nd(e.getAttribute(`href`))}function Fd(e,t){let n=t.split(/[?#]/)[0],r,i=-1,a=e=>{for(let t of e??[]){if(t.separator)continue;if(t.submenus?.length){a(t.submenus);continue}if(t.remote)continue;let e=(t.route??``).split(/[?#]/)[0];!e||e===`/`||(n===e||n.startsWith(e.endsWith(`/`)?e:e+`/`))&&e.length>i&&(r=t,i=e.length)}};if(a(e),r)return{route:t,consumedRoute:r.consumedRoute??``,actionId:``,baseUrl:r.baseUrl??``,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix}}var Id=v`
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
`,Ld=e=>b`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,Rd=Ld(b`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),zd=Ld(b`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),Bd=Ld(b`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`);Ld(b`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`);var Vd=Ld(b`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`);Ld(b`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);function Hd(e,t,n=new Set){if(!(!e||typeof e!=`object`||n.has(e))){n.add(e),Array.isArray(e)||t(e);for(let r of Array.isArray(e)?e:Object.values(e))r&&typeof r==`object`&&Hd(r,t,n)}}var Ud=e=>e&&e.metadata&&typeof e.metadata.type==`string`?e.metadata.type:void 0;function Wd(e,t){if(!e||typeof e!=`object`)return{fields:[],actions:[]};let n=[],r=new Map,i;Hd(e,e=>{let t=Ud(e);t===`FormField`&&e.metadata.fieldId?n.push(e.metadata):t===`Page`&&!i?i=e.metadata:t===`Button`&&e.metadata.actionId&&(r.has(e.metadata.actionId)||r.set(e.metadata.actionId,e.metadata.label))});let a=t&&typeof t==`object`?t:e.initialData&&typeof e.initialData==`object`?e.initialData:{},o=new Set,s=[];for(let e of n){if(o.has(e.fieldId))continue;o.add(e.fieldId);let t={id:e.fieldId,label:e.label??e.fieldId,dataType:e.dataType??`string`,stereotype:e.stereotype??`regular`,required:!!e.required,readOnly:!!e.readOnly};a&&Object.prototype.hasOwnProperty.call(a,e.fieldId)&&(t.value=a[e.fieldId]),Array.isArray(e.options)&&e.options.length&&(t.options=e.options.map(e=>e&&typeof e==`object`?{value:e.value,label:e.label??String(e.value??``)}:{value:e,label:String(e)})),s.push(t)}let c=[],l=new Set;for(let t of Array.isArray(e.actions)?e.actions:[]){if(!t||!t.id||l.has(t.id))continue;l.add(t.id);let e={id:t.id,label:r.get(t.id)??t.id};t.shortcut&&(e.shortcut=t.shortcut),c.push(e)}for(let[e,t]of r)l.has(e)||(l.add(e),c.push({id:e,label:t??e}));let u={fields:s,actions:c},d=i&&(i.pageTitle||i.title)||void 0;return d&&(u.title=d),e.route&&(u.route=e.route),e.serverSideType&&(u.serverSideType=e.serverSideType),(e.pageType||i&&i.pageType)&&(u.pageType=e.pageType||i.pageType),u}function Gd(e){let t=[],n=e=>{let r=e.shadowRoot??e;(r.querySelectorAll?.(`mateu-component`))?.forEach(e=>{let r=e.component;r&&t.push(r),e.shadowRoot&&n(e)}),r.querySelectorAll?.(`*`).forEach(e=>{e.shadowRoot&&e.tagName!==`MATEU-COMPONENT`&&n(e)})};return n(e),t}function Kd(e=document,t){let n=null,r=-1;for(let i of Gd(e)){let e=Wd(i,t),a=e.fields.length+e.actions.length+ +!!e.title;a>r&&(n=e,r=a)}return n}var qd=class{constructor(){this.buffer=``,this.data=[],this.hasData=!1}push(e){this.buffer+=e;let t=[];for(;;){let e=/\r\n|\r|\n/.exec(this.buffer);if(!e||e[0]===`\r`&&e.index===this.buffer.length-1)break;let n=this.buffer.slice(0,e.index);this.buffer=this.buffer.slice(e.index+e[0].length),this.line(n,t)}return t}end(){let e=[];return this.buffer&&=(this.line(this.buffer.replace(/\r$/,``),e),``),this.dispatch(e),e}line(e,t){if(e===``){this.dispatch(t);return}if(e.startsWith(`:`))return;let n=e.indexOf(`:`);if((n<0?e:e.slice(0,n))!==`data`)return;let r=n<0?``:e.slice(n+1);r.startsWith(` `)&&(r=r.slice(1)),this.data.push(r),this.hasData=!0}dispatch(e){this.hasData&&e.push(this.data.join(`
`)),this.data=[],this.hasData=!1}},Jd=e=>typeof e==`number`&&Number.isFinite(e);function Yd(e){let t=e.trim();if(t.startsWith(`{`)){let e=null;try{let n=JSON.parse(t);n&&typeof n==`object`&&!Array.isArray(n)&&(e=n)}catch{}if(e){if(`inputTokens`in e||`outputTokens`in e||`totalTokens`in e)return{kind:`usage`,usage:e};if(typeof e.event==`string`){let t=e.detail??{};switch(e.event){case`agent-delta`:return{kind:`delta`,text:typeof t.text==`string`?t.text:``};case`agent-status`:return{kind:`status`,detail:t};case`agent-tool`:return{kind:`tool`,detail:t};case`agent-error`:return{kind:`error`,message:String(t.message??`Error desconocido del agente`)};default:return{kind:`event`,event:e.event,detail:e.detail??{}}}}}}return{kind:`text`,text:e}}function Xd(e){if(!e)return!0;let t=[e.inputTokens,e.outputTokens,e.totalTokens].filter(Jd);return t.length===0||t.every(e=>e===0)}var Zd=class{constructor(){this.text=``,this.streamed=!1}delta(e){return this.text+=e,this.streamed=!0,this.text}line(e){return this.streamed?(this.text=e,this.streamed=!1):this.text=this.text?this.text+`
`+e:e,this.text}error(e){return this.text=`⚠️ `+e,this.streamed=!1,this.text}},Qd=class{constructor(e){this.steps=[],this.answering=!1,this.reported=!1,this.since=e}status(e,t){this.reported=!0;let n=typeof e.text==`string`?e.text:void 0;(e.phase!==this.phase||n!==this.statusText||this.answering)&&(this.since=t),this.phase=e.phase,this.statusText=n,this.answering=!1}tool(e,t){this.reported=!0;let n=e.name??`herramienta`;if(e.phase===`start`){this.steps=[...this.steps,{name:n,server:e.server,kind:e.kind,running:!0}],this.since=t,this.answering=!1;return}let r=this.steps.slice(),i=r.length-1;for(;i>=0&&!(r[i].running&&r[i].name===n);)i--;let a={name:n,server:e.server,kind:e.kind,ms:e.ms,error:e.error,running:!1};i>=0?r[i]=a:r.push(a),this.steps=r,this.since=t}text(e){this.answering||(this.since=e),this.answering=!0}get runningTool(){for(let e=this.steps.length-1;e>=0;e--)if(this.steps[e].running)return this.steps[e]}line(e){let t=Math.max(0,Math.floor((e-this.since)/1e3)),n=e=>t>0?`${e} ${t} s`:e,r=this.runningTool;return r?n(`Llamando a ${r.name}…`):this.answering?`Respondiendo…`:this.reported?n(this.statusText||`Pensando…`):null}};function $d(e){return Jd(e)?e<1e3?`${Math.round(e)} ms`:`${(e/1e3).toFixed(1).replace(`.`,`,`)} s`:``}var ef={en:{title:`Assistant`,expand:`Widen the assistant`,restore:`Restore the width`,close:`Close the assistant`,resize:`Assistant width`,empty:`Ask whatever you need: about this screen, your data or how to do something.`,placeholder:`Write a message…`,send:`Send`,dictate:`Dictate`,stopDictation:`Stop dictation`},es:{title:`Asistente`,expand:`Ampliar el asistente`,restore:`Ancho normal`,close:`Cerrar el asistente`,resize:`Ancho del asistente`,empty:`Pregunta lo que necesites: sobre esta pantalla, tus datos o cómo hacer algo.`,placeholder:`Escribe un mensaje…`,send:`Enviar`,dictate:`Dictar`,stopDictation:`Detener dictado`}},tf=e=>(e||typeof document<`u`&&document.documentElement?.lang||typeof navigator<`u`&&navigator.language||``).toLowerCase().startsWith(`es`)?`es`:`en`,nf=(e,t)=>ef[tf(t)][e],rf=`Ctrl+Shift+M`,af=`Control+Shift+M`,of=e=>{if(!e||!e.ctrlKey||!e.shiftKey||e.altKey||e.metaKey||e.repeat)return!1;let t=typeof e.key==`string`?e.key:``;return/^[a-z]$/i.test(t)?t.toLowerCase()===`m`:e.code===`KeyM`},sf=(e,t)=>`${nf(e?`stopDictation`:`dictate`,t)} (${rf})`,cf={default:460,min:320,max:720},lf=`mateu-chat-width`,uf=e=>e==null||!Number.isFinite(e)?cf.default:Math.round(Math.min(cf.max,Math.max(cf.min,e))),df=()=>{try{return typeof localStorage>`u`?void 0:localStorage}catch{return}},ff=(e=df())=>{try{let t=e?.getItem(lf);return t?uf(Number(t)):cf.default}catch{return cf.default}},pf=(e,t=df())=>{let n=uf(e);try{t?.setItem(lf,String(n))}catch{}return n},mf=(e,t,n,r=!1)=>uf(e+(r?t-n:n-t)),hf=e=>F.get()?.renderHeaderIconButton?.(e)??D`
        <button class="chat-header-btn ${e.cssClasses??``}" @click="${e.onClick}"
                title="${e.title??e.label}" aria-label="${e.label}">
            ${L(e.icon,`width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem);`)}
        </button>`,gf=[`#e91e63`,`#1676f3`,`#10b981`,`#8b5cf6`,`#f59e0b`,`#ef4444`],_f=e=>gf[Math.abs(e??0)%gf.length],vf=e=>(e??`?`).split(/\s+/).filter(e=>e).map(e=>e[0]).slice(0,2).join(``).toUpperCase()||`?`,X=class extends S{constructor(...e){super(...e),this.localAgentUrl=`http://127.0.0.1:8776`,this.localAgentAlive=!1,this.menu=[],this.chatSessionId=de(),this.menuContextSent=!1,this.attachments=[],this.uploading=!1,this.expanded=!1,this.toggleExpanded=()=>{this.expanded=!this.expanded},this.label=void 0,this.width=ff(),this.resizing=!1,this.dragStart=void 0,this.isRtl=()=>getComputedStyle(this).direction===`rtl`,this.onResizeStart=e=>{e.button===0&&(e.preventDefault(),this.dragStart={x:e.clientX,width:this.width},this.resizing=!0,e.currentTarget.setPointerCapture?.(e.pointerId))},this.onResizeMove=e=>{this.dragStart&&(this.width=mf(this.dragStart.width,this.dragStart.x,e.clientX,this.isRtl()))},this.onResizeEnd=e=>{this.dragStart&&(this.dragStart=void 0,this.resizing=!1,e.currentTarget.releasePointerCapture?.(e.pointerId),this.width=pf(this.width))},this.onResizeKey=e=>{let t=this.isRtl()?`ArrowLeft`:`ArrowRight`,n=this.isRtl()?`ArrowRight`:`ArrowLeft`,r;e.key===t?r=this.width+24:e.key===n?r=this.width-24:e.key===`Home`?r=cf.min:e.key===`End`&&(r=cf.max),r!==void 0&&(e.preventDefault(),this.width=pf(uf(r)))},this.onResizeReset=()=>{this.width=pf(cf.default)},this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.progressTick=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onShortcutKeydown=e=>{!of(e)||!this.panelOpen||!this.recognitionAvailable||(e.preventDefault(),this.startListening())},this.onSpeechResult=e=>{if(this.recognition){let t=e,n=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=n,this.send(new CustomEvent(`submit`,{detail:{value:n},bubbles:!0,composed:!0})))}},this.probeLocalAgent=async()=>{if(this.localAgentUrl)try{let e=new AbortController,t=setTimeout(()=>e.abort(),1200),n=await fetch(this.localAgentUrl+`/health`,{signal:e.signal});clearTimeout(t),this.localAgentAlive=n.ok}catch{this.localAgentAlive=!1}},this.pickFiles=()=>this.fileInputElement?.click(),this.onFilesPicked=async e=>{let t=e.target,n=Array.from(t.files??[]);if(t.value=``,!(!n.length||!this.uploadUrl)){this.uploading=!0;try{let e=new FormData;e.append(`sessionId`,this.chatSessionId);for(let t of n)e.append(`files`,t,t.name);let t={},r=localStorage.getItem(`__mateu_auth_token`);r&&(t.Authorization=`Bearer `+r);let i=sessionStorage.getItem(`__mateu_sesion_id`);i&&(t[`X-Session-Id`]=i);let a=await fetch(this.uploadUrl,{method:`POST`,headers:t,body:e});if(!a.ok)throw Error(`Upload failed: ${a.status}`);let o=((await a.json()).files??[]).filter(e=>e&&e.path);this.attachments=[...this.attachments,...o]}catch(e){this.addMessage(`⚠️ No se pudieron subir los ficheros: ${e instanceof Error?e.message:e}`,`agent`)}finally{this.uploading=!1}}},this.removeAttachment=e=>{this.attachments=this.attachments.filter(t=>t.path!==e)},this.send=async e=>{this.messageInputElement?.setAttribute(`disabled`,`disabled`);let t=e.detail.value.trim(),n=this.localAgentAlive?this.localAgentUrl+`/mateu/agent/stream`:this.sseUrl,r=this.attachments;if(!t&&r.length===0||!n)return;let i=r.length?`${t}${t?`

`:``}📎 ${r.map(e=>e.name).join(`, `)}`:t;this.addMessage(i,`user`),this.attachments=[];let a=this.addMessage(``,`agent`);this.startLoading();let o=``;try{let e=()=>{let e={Accept:`text/event-stream`,"Content-Type":`application/json`},t=localStorage.getItem(`__mateu_auth_token`);t&&(e.Authorization=`Bearer `+t);let n=sessionStorage.getItem(`__mateu_sesion_id`);return n&&(e[`X-Session-Id`]=n),e},i=this.contextProvider?.(),s=Kd(document,i?.componentState),c=!!s&&(s.fields.length>0||s.actions.length>0||!!s.title),l=JSON.stringify({message:t,sessionId:this.chatSessionId,...r.length&&{attachments:r},...i!=null&&{context:i},...c&&{screen:s},...this.mcpUrl&&{mcpUrl:new URL(this.mcpUrl,window.location.origin).href},...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;let u=()=>fetch(n,{method:`POST`,headers:e(),body:l}),d=await u();if(d.status===401&&(d=await Ke(Error(`401`),u).catch(()=>d)),!d.ok){let e=await d.text();throw Error(`Servidor respondió ${d.status}: ${e}`)}let f=d.body?.getReader();if(!f)throw Error(`No se pudo obtener el reader del stream.`);let p=new TextDecoder,m=new qd,h=new Zd,g=new Qd(Date.now());this.progress=g;let _=e=>{let t=Yd(e);switch(t.kind){case`usage`:Xd(t.usage)||(this.tokenUsage={...this.tokenUsage,...t.usage});return;case`delta`:o=h.delta(t.text),g.text(Date.now());break;case`text`:o=h.line(t.text),g.text(Date.now());break;case`error`:o=h.error(t.message);break;case`status`:g.status(t.detail,Date.now());break;case`tool`:g.tool(t.detail,Date.now());break;case`event`:this.dispatchEvent(new CustomEvent(t.event,{detail:t.detail,bubbles:!0,composed:!0}));return}this.progressTick++,(t.kind===`delta`||t.kind===`text`||t.kind===`error`)&&this.updateMessage(a,o)};for(;;){let{done:e,value:t}=await f.read();if(e){m.push(p.decode()),m.end().forEach(_);break}m.push(p.decode(t,{stream:!0})).forEach(_)}o||this.updateMessage(a,`⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).`)}catch(e){console.error(`Error en el flujo SSE:`,e);let t=e?.message??String(e);(t===`Failed to fetch`||t===`network error`||t===`Load failed`)&&!o?this.updateMessage(a,`⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible.`):this.updateMessage(a,`⚠️ Error: `+t)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value=``)},250),this.messageInputElement?.removeAttribute(`disabled`),this.messageInputElement?.focus()}},this.onMessageClick=e=>{let t=Pd(e.composedPath().find(e=>e instanceof HTMLAnchorElement)??null,e);if(!t)return;e.preventDefault();let n=Fd(this.menu,t);n?this.dispatchEvent(new CustomEvent(`navigation-requested`,{detail:n,bubbles:!0,composed:!0})):Ir(this,t)},this.closeChat=()=>{this.dispatchEvent(new CustomEvent(`close-requested`,{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{let e=this.messageInputElement?.value?.trim()??``;e&&this.send(new CustomEvent(`submit`,{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key===`Enter`&&(e.preventDefault(),this.submitFromInput())}}updated(e){super.updated(e),e.has(`width`)&&this.style.setProperty(`--mateu-chat-width`,`${this.width}px`),this.style.getPropertyValue(`--mateu-chat-wide`)||this.style.setProperty(`--mateu-chat-wide`,`60vw`)}get panelOpen(){return this.isConnected&&this.slot!==`detail-hidden`}connectedCallback(){super.connectedCallback(),this.probeLocalAgent(),window.addEventListener(`keydown`,this.onShortcutKeydown,!0);let e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){let t=new e;this.recognition=t,t.lang=`es-ES`,t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=e=>{console.error(`Error de reconocimiento: `+e.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}disconnectedCallback(){window.removeEventListener(`keydown`,this.onShortcutKeydown,!0),super.disconnectedCallback()}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:`smooth`})},0)}addMessage(e,t){let n={text:e,time:new Date().toLocaleTimeString(),userName:t.includes(`agent`)?`Asistente`:`Tú`,userColorIndex:t.includes(`agent`)?2:1};return this.items=[...this.items,n],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((n,r)=>r===e?{...n,text:t}:n),this.scrollBottom()}buildMenuContext(e,t=[]){let n=[];for(let r of e){if(r.separator||r.remote)continue;let e=[...t,r.label];if(r.submenus&&r.submenus.length>0)n.push(...this.buildMenuContext(r.submenus,e));else{let t={path:e,navigation:{route:r.route,consumedRoute:r.consumedRoute,actionId:r.actionId??``,baseUrl:r.baseUrl,serverSideType:r.serverSideType,uriPrefix:r.uriPrefix}};r.description&&(t.description=r.description),r.listing&&(t.listing=r.listing),n.push(t)}}return n}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,this.progress=void 0,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}progressLine(){return this.progress?.line(Date.now())??`Thinking… ${this.elapsedSeconds}s`}renderToolSteps(){let e=this.progress?.steps??[];return e.length?D`
            <ul class="tool-steps" aria-label="Herramientas usadas">
                ${e.map(e=>D`
                    <li class="tool-step ${e.running?`running`:e.error?`failed`:`done`}"
                        title="${e.server?`${e.name} (${e.server})`:e.name}">
                        <span class="tool-step-icon">${e.running?`…`:e.error?`✕`:`✓`}</span>
                        <span class="tool-step-name">${e.name}</span>
                        ${e.running?x:D`<span class="tool-step-time">${$d(e.ms)}</span>`}
                        ${e.error?D`<span class="tool-step-error">${e.error}</span>`:x}
                    </li>
                `)}
            </ul>
        `:x}render(){return D`
            <div class="chat-container">
                <div class="chat-header">
                    ${L(`vaadin:comments-o`,``,`chat-title-icon`)}
                    <h2 class="chat-title">${this.label?.trim()||nf(`title`)}</h2>
                    ${this.localAgentAlive?D`<span class="local-agent-badge" title="Hablando con tu CLI local (companion en ${this.localAgentUrl}) — sin api key">agente local</span>`:x}
                    <div class="chat-header-actions">
                        ${hf({icon:this.expanded?`vaadin:compress`:`vaadin:expand-full`,label:nf(this.expanded?`restore`:`expand`),cssClasses:`chat-expand`,onClick:()=>this.toggleExpanded()})}
                        ${hf({icon:`lumo:cross`,label:nf(`close`),cssClasses:`chat-close`,onClick:()=>this.closeChat()})}
                    </div>
                </div>
                <div class="scroll-container">
                    ${this.items.length===0&&!this.loading?D`
                        <div class="chat-empty">
                            ${L(`vaadin:comments-o`,``,`chat-empty-icon`)}
                            <p>${nf(`empty`)}</p>
                        </div>`:x}
                    <div class="message-list" role="list" @click="${this.onMessageClick}">
                        ${this.items.map((e,t)=>D`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${_f(e.userColorIndex)};">${vf(e.userName)}</div>
                                <div class="message-body">
                                    <div class="message-meta">
                                        <span class="message-name">${e.userName}</span>
                                        <span class="message-time">${e.time}</span>
                                    </div>
                                    <mateu-markdown class="message-text" .content="${e.text??``}"></mateu-markdown>
                                    ${t===this.items.length-1&&this.loading?this.renderToolSteps():x}
                                </div>
                            </div>
                        `)}
                    </div>
                </div>
                ${this.tokenUsage?D`
                    <div class="token-bar">
                        <span class="token-label">Tokens:</span>
                        ${this.tokenUsage.inputTokens==null?x:D`<span class="token-chip">in&nbsp;<strong>${this.tokenUsage.inputTokens}</strong></span>`}
                        ${this.tokenUsage.outputTokens==null?x:D`<span class="token-chip">out&nbsp;<strong>${this.tokenUsage.outputTokens}</strong></span>`}
                        ${this.tokenUsage.totalTokens==null?x:D`<span class="token-chip">total&nbsp;<strong>${this.tokenUsage.totalTokens}</strong></span>`}
                    </div>
                `:x}
                ${this.loading?D`
                    <div class="loading-bar">
                        <span class="spinner"></span>
                        <span class="loading-text">${this.progressLine()}</span>
                    </div>
                `:x}
                ${this.attachments.length?D`
                    <div class="attachments">
                        ${this.attachments.map(e=>D`
                            <span class="attachment-chip" title="${e.path}">
                                📎 ${e.name}
                                <button class="attachment-remove" @click="${()=>this.removeAttachment(e.path)}" aria-label="Quitar ${e.name}">✕</button>
                            </span>`)}
                    </div>
                `:x}
                <div class="input-bar">
                    ${this.uploadUrl?D`
                        <button class="mic-btn" title="Adjuntar ficheros"
                                @click="${this.pickFiles}" ?disabled="${this.uploading}"
                                aria-label="Adjuntar ficheros">${this.uploading?`…`:`📎`}</button>
                        <input class="file-input" type="file" multiple hidden
                               @change="${this.onFilesPicked}"/>
                    `:x}
                    <button class="mic-btn"
                            title="${sf(this.listening)}"
                            aria-label="${sf(this.listening)}"
                            aria-keyshortcuts="${af}"
                            aria-pressed="${this.listening?`true`:`false`}"
                            style="color: ${this.listening?`red`:`var(--lumo-contrast-50pct, #767676)`};"
                            @click="${this.startListening}"
                            ?disabled="${!this.recognitionAvailable}"
                    >${Vd}</button>
                    <input class="msg-input"
                           placeholder="${nf(`placeholder`)}"
                           aria-label="${nf(`placeholder`)}"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">${nf(`send`)}</button>
                </div>
                <div class="resize-handle ${this.resizing?`resizing`:``}" role="separator"
                     aria-orientation="vertical" tabindex="0" aria-label="${nf(`resize`)}"
                     aria-valuemin="${cf.min}" aria-valuemax="${cf.max}" aria-valuenow="${this.width}"
                     @pointerdown="${this.onResizeStart}" @pointermove="${this.onResizeMove}"
                     @pointerup="${this.onResizeEnd}" @pointercancel="${this.onResizeEnd}"
                     @keydown="${this.onResizeKey}" @dblclick="${this.onResizeReset}"></div>
            </div>
        `}static{this.styles=[Id,v`
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
    `]}};A([y({attribute:!1})],X.prototype,`contextProvider`,void 0),A([y()],X.prototype,`localAgentUrl`,void 0),A([y({attribute:!1})],X.prototype,`mcpUrl`,void 0),A([C()],X.prototype,`localAgentAlive`,void 0),A([y()],X.prototype,`sseUrl`,void 0),A([y()],X.prototype,`uploadUrl`,void 0),A([y({attribute:!1})],X.prototype,`menu`,void 0),A([C()],X.prototype,`attachments`,void 0),A([C()],X.prototype,`uploading`,void 0),A([T(`.file-input`)],X.prototype,`fileInputElement`,void 0),A([y({type:Boolean,reflect:!0})],X.prototype,`expanded`,void 0),A([y()],X.prototype,`label`,void 0),A([C()],X.prototype,`width`,void 0),A([C()],X.prototype,`resizing`,void 0),A([y()],X.prototype,`items`,void 0),A([T(`.scroll-container`)],X.prototype,`scrollContainer`,void 0),A([T(`.msg-input`)],X.prototype,`messageInputElement`,void 0),A([C()],X.prototype,`recognition`,void 0),A([C()],X.prototype,`listening`,void 0),A([C()],X.prototype,`recognitionAvailable`,void 0),A([C()],X.prototype,`loading`,void 0),A([C()],X.prototype,`elapsedSeconds`,void 0),A([C()],X.prototype,`tokenUsage`,void 0),A([C()],X.prototype,`progress`,void 0),A([C()],X.prototype,`progressTick`,void 0),X=A([w(`mateu-chat`)],X);var yf=class extends S{updated(e){super.updated(e),this.chart&&=(this.chart.destroy(),void 0),this.data&&this.createChart(this.data)}async createChart(e){let[{default:t}]=await Promise.all([O(()=>import(`./vendor-chartjs.js`).then(e=>e.n),__vite__mapDeps([3,1])),O(()=>import(`./vendor-chartjs.js`).then(e=>e.t),__vite__mapDeps([3,1]))]);if(e!==this.data)return;this.chart&&this.chart.destroy();let n={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,n)}handleSlotChange(){}render(){return D`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}static{this.styles=v`
    /* the host's inline height (Chart.style) must reach the canvas parent — chart.js
       measures .container to size the canvas when maintainAspectRatio is false */
    :host {
        display: block;
    }
    .container {
        height: 100%;
        position: relative;
    }
  `}};A([y()],yf.prototype,`type`,void 0),A([y()],yf.prototype,`data`,void 0),A([y()],yf.prototype,`options`,void 0),A([T(`#chart`)],yf.prototype,`chartElement`,void 0),yf=A([w(`mateu-chart`)],yf);var bf=class extends S{updated(e){super.updated(e),this.chart&&=(this.chart.destroy(),void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){let{default:t}=await O(async()=>{let{default:e}=await import(`./vendor-diagrams.js`).then(e=>e.t);return{default:e}},__vite__mapDeps([4,1,2]));if(e!==this.xml)return;this.chart&&this.chart.destroy();let n={container:this.divElement};this.chart=new t(n),this.chart.importXML(e)}handleSlotChange(){}render(){return D`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}static{this.styles=v`
  `}};A([y()],bf.prototype,`xml`,void 0),A([T(`#canvas`)],bf.prototype,`divElement`,void 0),bf=A([w(`mateu-bpmn`)],bf);var xf=160,Sf=56,Cf=220,wf=110,Tf=60,Ef={ACTION:`#3B82F6`,JOIN:`#8B5CF6`,FORK:`#F59E0B`,END:`#EF4444`,USER_TASK:`#10B981`,PROCESS:`#6366F1`},Df={ACTION:`▶`,JOIN:`⟨`,FORK:`⟩`,END:`◼`,USER_TASK:`👤`,PROCESS:`⚙`},Of=[`ACTION`,`JOIN`,`FORK`,`END`,`USER_TASK`,`PROCESS`];function kf(){return`step-`+Math.random().toString(36).slice(2,8)}var Af=class extends S{constructor(...e){super(...e),this.value=`{"name":"New Workflow","steps":[]}`,this.wf={name:`New Workflow`,steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;let t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener(`mousemove`,this.onMouseMove),window.removeEventListener(`mouseup`,this.onMouseUp)}}updated(e){if(e.has(`value`)){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){let e=this.wf.steps??[],t={};e.forEach(e=>{t[e.id]=0});let n=!0;for(;n;)n=!1,e.forEach(e=>{if(e.preconditionStepId!=null&&t[e.preconditionStepId]!==void 0){let r=t[e.preconditionStepId]+1;r>t[e.id]&&(t[e.id]=r,n=!0)}});let r={};e.forEach(e=>{let n=t[e.id]??0;(r[n]??=[]).push(e.id)});let i={...this.positions},a=!1;Object.entries(r).forEach(([e,t])=>{let n=Number(e);t.forEach((e,t)=>{i[e]||(i[e]={x:Tf+n*Cf,y:Tf+t*wf},a=!0)})}),a&&(this.positions=i)}emit(){let e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(n=>n.id===e?{...n,...t}:n)},this.emit()}addStep(){let e=kf(),t={id:e,type:`ACTION`,name:`New Step`};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};let n=Object.values(this.positions).map(e=>e.y),r=n.length?Math.max(...n)+wf:Tf;this.positions={...this.positions,[e]:{x:Tf,y:r}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(t=>t.id!==e).map(t=>t.preconditionStepId===e?{...t,preconditionStepId:void 0}:t)};let{[e]:t,...n}=this.positions;this.positions=n,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;let n=this.positions[t]??{x:0,y:0},r=this.toSvgPoint(e);this.dragOffset={x:r.x-n.x,y:r.y-n.y},this.svgEl=e.currentTarget.closest(`svg`),window.addEventListener(`mousemove`,this.onMouseMove),window.addEventListener(`mouseup`,this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};let t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){let e=Object.values(this.positions),t=e.length?Math.max(...e.map(e=>e.x))+xf+Tf:600,n=e.length?Math.max(...e.map(e=>e.y))+Sf+Tf:400;return{w:Math.max(t,600),h:Math.max(n,400)}}render(){let{w:e,h:t}=this.canvasSize(),n=this.wf.steps??[];return D`
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
        `}renderToolbar(){let e=this.wf.status??`DRAFT`;return D`
            <div class="toolbar">
                <span class="wf-name">${this.wf.name}</span>
                <span class="badge badge-${e.toLowerCase()}">${e}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${Rd}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${zd}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Bd}
                    Export
                </button>
            </div>
        `}renderMeta(){let e=this.wf;return D`
            <div class="meta-panel">
                <div class="meta-grid">
                    <label>Name</label>
                    <input class="inp" .value="${e.name}" @change="${e=>this.updateWf({name:e.target.value})}"/>
                    <label>Description</label>
                    <textarea class="inp" rows="2" @change="${e=>this.updateWf({description:e.target.value})}">${e.description??``}</textarea>
                    <label>Status</label>
                    <select class="inp" @change="${e=>this.updateWf({status:e.target.value})}">
                        ${[`DRAFT`,`ACTIVE`,`DISABLED`,`ARCHIVED`].map(t=>D`
                            <option value="${t}" ?selected="${e.status===t}">${t}</option>`)}
                    </select>
                    <label>Limit concurrent</label>
                    <input type="checkbox" ?checked="${e.limitConcurrentExecutions}"
                           @change="${e=>this.updateWf({limitConcurrentExecutions:e.target.checked})}"/>
                    ${e.limitConcurrentExecutions?D`
                        <label>Max concurrent</label>
                        <input class="inp" type="number" min="0" .value="${String(e.maxConcurrentExecutions??0)}"
                               @change="${e=>this.updateWf({maxConcurrentExecutions:Number(e.target.value)})}"/>
                        <label>Enqueue on limit</label>
                        <input type="checkbox" ?checked="${e.enqueueOnLimit}"
                               @change="${e=>this.updateWf({enqueueOnLimit:e.target.checked})}"/>
                    `:``}
                </div>
            </div>
        `}renderArrow(e){if(!e.preconditionStepId)return b``;let t=this.positions[e.preconditionStepId],n=this.positions[e.id];if(!t||!n)return b``;let r=t.x+xf,i=t.y+Sf/2,a=n.x,o=n.y+Sf/2,s=(r+a)/2;return b`
            <path d="M${r},${i} C${s},${i} ${s},${o} ${a},${o}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){let t=this.positions[e.id]??{x:Tf,y:Tf},n=Ef[e.type]??`#64748b`,r=Df[e.type]??`•`,i=this.selectedId===e.id;return b`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${t=>this.onNodeMouseDown(t,e.id)}"
               @click="${t=>{t.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${xf}" height="${Sf}" rx="8"
                      fill="white"
                      stroke="${i?n:`#e2e8f0`}"
                      stroke-width="${i?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${Sf}" rx="8" fill="${n}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Sf}" fill="${n}"/>
                <text x="16" y="${33}" text-anchor="middle"
                      font-size="14" fill="white">${r}</text>
                <!-- name -->
                <text x="44" y="${Sf/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+`…`:e.name}
                </text>
                <text x="44" y="${36}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${48}" font-size="9" fill="${n}">${e.type}</text>
            </g>
        `}renderPanel(){let e=this.wf.steps.find(e=>e.id===this.selectedId);if(!e)return``;let t=this.wf.steps.filter(t=>t.id!==e.id),n=(e,t)=>D`
            <div class="field">
                <label class="field-label">${e}</label>
                ${t}
            </div>
        `;return D`
            <div class="properties">
                <div class="prop-header">
                    <span>Step Properties</span>
                    <button class="del-btn" title="Delete step"
                            @click="${()=>this.deleteStep(e.id)}">🗑</button>
                    <button class="close-btn" @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${n(`ID`,D`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${n(`Name`,D`<input class="inp" .value="${e.name}"
                        @change="${t=>this.updateStep(e.id,{name:t.target.value})}"/>`)}
                    ${n(`Type`,D`
                        <select class="inp" @change="${t=>this.updateStep(e.id,{type:t.target.value})}">
                            ${Of.map(t=>D`<option value="${t}" ?selected="${e.type===t}">${t}</option>`)}
                        </select>`)}
                    ${n(`Description`,D`<textarea class="inp" rows="2"
                        @change="${t=>this.updateStep(e.id,{description:t.target.value})}">${e.description??``}</textarea>`)}
                    ${n(`Precondition step`,D`
                        <select class="inp" @change="${t=>this.updateStep(e.id,{preconditionStepId:t.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(t=>D`<option value="${t.id}" ?selected="${e.preconditionStepId===t.id}">${t.name} (${t.id})</option>`)}
                        </select>`)}
                    ${n(`Precondition expression`,D`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??``}"
                        @change="${t=>this.updateStep(e.id,{preconditionExpression:t.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${t=>this.updateStep(e.id,{parallel:t.target.checked})}"/>
                    </div>
                    ${n(`Timeout (ms)`,D`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${t=>this.updateStep(e.id,{timeout:Number(t.target.value)})}"/>`)}
                    ${n(`Retries`,D`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${t=>this.updateStep(e.id,{retries:Number(t.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${t=>this.updateStep(e.id,{rollbackable:t.target.checked})}"/>
                    </div>
                    ${e.rollbackable?n(`Compensation step`,D`
                        <select class="inp" @change="${t=>this.updateStep(e.id,{compensationStepId:t.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(t=>D`<option value="${t.id}" ?selected="${e.compensationStepId===t.id}">${t.name} (${t.id})</option>`)}
                        </select>`):``}

                    ${e.type===`ACTION`?n(`Topic`,D`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??``}"
                        @change="${t=>this.updateStep(e.id,{topic:t.target.value||void 0})}"/>`):``}
                    ${e.type===`USER_TASK`?n(`Form ID`,D`<input class="inp"
                        .value="${e.formId??``}"
                        @change="${t=>this.updateStep(e.id,{formId:t.target.value||void 0})}"/>`):``}
                    ${e.type===`PROCESS`?n(`Child workflow ID`,D`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??``}"
                        @change="${t=>this.updateStep(e.id,{childWorkflowDefinitionId:t.target.value||void 0})}"/>`):``}
                </div>
            </div>
        `}exportJson(){let e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=(this.wf.name??`workflow`).replace(/\s+/g,`-`).toLowerCase()+`.json`,r.click(),URL.revokeObjectURL(n)}static{this.styles=[Id,v`
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
    `]}};A([y()],Af.prototype,`value`,void 0),A([C()],Af.prototype,`wf`,void 0),A([C()],Af.prototype,`positions`,void 0),A([C()],Af.prototype,`selectedId`,void 0),A([C()],Af.prototype,`showMeta`,void 0),Af=A([w(`mateu-workflow`)],Af);var jf=[`string`,`integer`,`number`,`bool`,`date`,`time`,`dateTime`,`dateRange`,`money`,`file`,`array`,`status`,`component`,`menu`,`range`,`action`,`actionGroup`],Mf=[`regular`,`radio`,`checkbox`,`textarea`,`toggle`,`combobox`,`select`,`email`,`password`,`richText`,`listBox`,`html`,`markdown`,`image`,`icon`,`link`,`money`,`grid`,`color`,`choice`,`popover`,`slider`,`button`,`stars`],Nf={string:`#3B82F6`,integer:`#8B5CF6`,number:`#6366F1`,bool:`#10B981`,date:`#F59E0B`,time:`#F59E0B`,dateTime:`#F59E0B`,dateRange:`#F59E0B`,money:`#EF4444`,file:`#64748B`,array:`#0EA5E9`,status:`#EC4899`,component:`#14B8A6`,menu:`#94A3B8`,range:`#A855F7`,action:`#F97316`,actionGroup:`#FB923C`};function Pf(){return`field-`+Math.random().toString(36).slice(2,8)}var Ff=class extends S{constructor(...e){super(...e),this.value=`{"name":"New Form","fields":[]}`,this.form={name:`New Form`,fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has(`value`))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){let e=this.shadowRoot?.querySelector(`.field-list`);!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=le.create(e,{animation:150,handle:`.drag-handle`,ghostClass:`sortable-ghost`,onEnd:e=>{let{oldIndex:t,newIndex:n}=e;if(t===void 0||n===void 0||t===n)return;let r=[...this.form.fields],[i]=r.splice(t,1);r.splice(n,0,i),this.form={...this.form,fields:r},this.emit()}}))}emit(){let e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(n=>n.id===e?{...n,...t}:n)},this.emit()}addField(){let e=Pf(),t={id:e,label:`New Field`,dataType:`string`};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){let t=this.form.fields.find(t=>t.id===e);if(!t)return;let n={...t,id:Pf(),label:t.label+` (copy)`},r=this.form.fields.findIndex(t=>t.id===e),i=[...this.form.fields];i.splice(r+1,0,n),this.form={...this.form,fields:i},this.selectedId=n.id,this.emit()}render(){return D`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():x}
                <div class="workspace">
                    ${this.renderList()}
                    ${this.selectedId?this.renderPanel():x}
                </div>
            </div>
        `}renderToolbar(){return D`
            <div class="toolbar">
                <span class="form-name">${this.form.name}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${Rd}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${zd}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Bd}
                    Export
                </button>
            </div>
        `}renderMeta(){let e=this.form;return D`
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
        `}renderList(){let e=this.form.fields;return D`
            <div class="list-wrap">
                ${e.length===0?D`
                    <div class="empty">
                        No fields yet. Click <strong>Add Field</strong> to start.
                    </div>`:x}
                <div class="field-list">
                    ${e.map(e=>this.renderRow(e))}
                </div>
            </div>
        `}renderRow(e){let t=Nf[e.dataType]??`#64748b`;return D`
            <div role="button" tabindex="0" class="field-row ${this.selectedId===e.id?`selected`:``}"
                 data-id="${e.id}"
                 @click="${()=>this.selectedId=this.selectedId===e.id?null:e.id}" @keydown="${B(()=>this.selectedId=this.selectedId===e.id?null:e.id)}">
                <span class="drag-handle" title="Drag to reorder">⠿</span>
                <span class="type-badge" style="background:${t}">${e.dataType}</span>
                <span class="field-label-text">${e.label}</span>
                <span class="field-id-text">${e.id}</span>
                ${e.required?D`<span class="required-badge">required</span>`:x}
                ${e.stereotype&&e.stereotype!==`regular`?D`<span class="stereo-badge">${e.stereotype}</span>`:x}
                <div style="flex:1"></div>
                <button class="row-btn" title="Duplicate"
                        @click="${t=>{t.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${t=>{t.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){let e=this.form.fields.find(e=>e.id===this.selectedId);if(!e)return x;let t=(e,t)=>D`
            <div class="prop-field">
                <label class="prop-label">${e}</label>
                ${t}
            </div>
        `;return D`
            <div class="properties">
                <div class="prop-header">
                    <span>Field Properties</span>
                    <button class="close-btn" @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${t(`ID`,D`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${t(`Label`,D`
                        <input class="inp" .value="${e.label}"
                               @change="${t=>this.updateField(e.id,{label:t.target.value})}"/>`)}
                    ${t(`Data type`,D`
                        <select class="inp"
                                @change="${t=>this.updateField(e.id,{dataType:t.target.value})}">
                            ${jf.map(t=>D`
                                <option value="${t}" ?selected="${e.dataType===t}">${t}</option>`)}
                        </select>`)}
                    ${t(`Stereotype`,D`
                        <select class="inp"
                                @change="${t=>this.updateField(e.id,{stereotype:t.target.value||void 0})}">
                            ${Mf.map(t=>D`
                                <option value="${t}" ?selected="${(e.stereotype??`regular`)===t}">${t}</option>`)}
                        </select>`)}
                    <div class="prop-field row">
                        <label class="prop-label">Required</label>
                        <input type="checkbox" ?checked="${e.required}"
                               @change="${t=>this.updateField(e.id,{required:t.target.checked})}"/>
                    </div>
                    ${t(`Description / hint`,D`
                        <textarea class="inp" rows="3"
                                  @change="${t=>this.updateField(e.id,{description:t.target.value||void 0})}">${e.description??``}</textarea>`)}
                </div>
            </div>
        `}exportJson(){let e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=(this.form.name??`form`).replace(/\s+/g,`-`).toLowerCase()+`.json`,r.click(),URL.revokeObjectURL(n)}static{this.styles=[Id,V,v`
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
    `]}};A([y()],Ff.prototype,`value`,void 0),A([C()],Ff.prototype,`form`,void 0),A([C()],Ff.prototype,`selectedId`,void 0),A([C()],Ff.prototype,`showMeta`,void 0),Ff=A([w(`mateu-form-editor`)],Ff);var If=class extends S{constructor(...e){super(...e),this.appState={},this.appData={},this.open=!1,this.activeTab=`appstate`,this.hoveredTag=``,this.hoveredId=``,this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith(`mateu-`)&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline=``,this._prevTarget.style.outlineOffset=``,this._prevTarget=null,this.hoveredTag=``,this.hoveredId=``,this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline=``,this._prevTarget.style.outlineOffset=``),this._prevTarget=t,t.style.outline=`2px solid #0070f3`,t.style.outlineOffset=`-2px`,this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||``,this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener(`mouseover`,this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener(`mouseover`,this._onMouseover,!0),this._prevTarget&&=(this._prevTarget.style.outline=``,null)}_fmt(e){try{return JSON.stringify(e,null,2)??`null`}catch{return String(e)}}_renderTab(e,t){return D`
            <button class="tab ${this.activeTab===e?`tab--active`:``}"
                @click=${()=>{this.activeTab=e}}>
                ${t}
            </button>
        `}render(){return this.open?D`
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
                        ${this.activeTab===`appstate`?D`
                            <pre class="json">${this._fmt(this.appState)}</pre>
                        `:x}
                        ${this.activeTab===`appdata`?D`
                            <pre class="json">${this._fmt(this.appData)}</pre>
                        `:x}
                        ${this.activeTab===`inspector`?D`
                            ${this.hoveredTag?D`
                                <div class="inspector-tag">&lt;${this.hoveredTag}${this.hoveredId?` id="${this.hoveredId}"`:``}&gt;</div>
                                <div class="section-label">state</div>
                                <pre class="json">${this._fmt(this.hoveredState)}</pre>
                                <div class="section-label">data</div>
                                <pre class="json">${this._fmt(this.hoveredData)}</pre>
                                <div class="section-label">metadata</div>
                                <pre class="json">${this._fmt(this.hoveredMeta)}</pre>
                            `:D`
                                <div class="inspector-hint">Hover a mateu-* element to inspect it</div>
                            `}
                        `:x}
                    </div>
                </div>
            `:D`
            <button class="fab" @click=${()=>{this.open=!0}} title="Mateu Debug">🐛</button>
        `}static{this.styles=v`
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
    `}};A([y()],If.prototype,`appState`,void 0),A([y()],If.prototype,`appData`,void 0),A([C()],If.prototype,`open`,void 0),A([C()],If.prototype,`activeTab`,void 0),A([C()],If.prototype,`hoveredTag`,void 0),A([C()],If.prototype,`hoveredId`,void 0),A([C()],If.prototype,`hoveredState`,void 0),A([C()],If.prototype,`hoveredData`,void 0),A([C()],If.prototype,`hoveredMeta`,void 0),If=A([w(`mateu-debug-overlay`)],If);var Lf=(e,t,n)=>{let r=t?.initiatorState;return r&&typeof r==`object`&&!zf(e,n)?{...r}:{...e??{}}},Rf=/^(.+)_(create-and-stay|create|save|cancel|remove|add|select|selected|prev|next|move-up|move-down)$/,zf=(e,t)=>{let n=t?Rf.exec(t):null;return!!n&&!!e&&`${n[1]}_rowClass`in e},Bf=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}},Vf=function(e){return e.required=`required`,e.disabled=`disabled`,e.hidden=`hidden`,e.pattern=`pattern`,e.minValue=`minValue`,e.maxValue=`maxValue`,e.minLength=`minLength`,e.maxLength=`maxLength`,e.css=`css`,e.style=`style`,e.theme=`theme`,e.errorMessage=`errorMessage`,e.description=`description`,e.none=`none`,e}({}),Hf=function(e){return e.Continue=`Continue`,e.Stop=`Stop`,e}({}),Uf=12e4,Wf=(e,t)=>`${e??`_`}::${t}`,Gf=new class{constructor(){this.started=new Map,this.listeners=new Set}begin(e,t=Date.now()){let n=this.started.get(e);return n!==void 0&&t-n<Uf?!1:(this.started.set(e,t),this.emit(),!0)}end(e){this.started.delete(e)&&this.emit()}isPending(e,t=Date.now()){let n=this.started.get(e);return n!==void 0&&t-n<Uf}snapshot(){return new Set(this.started.keys())}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}reset(){this.started.clear(),this.emit()}emit(){let e=this.snapshot();this.listeners.forEach(t=>t(e))}};function Kf(e,t){let n=e?.commands;return n&&n.length?(n.forEach(t),!0):!1}function qf(e,t){if(!t){e.removeAttribute(`data-sizing`),e.style.flexBasis=``;return}if(t.startsWith(`fixed:`)){e.setAttribute(`data-sizing`,`fixed`),e.style.flexBasis=t.slice(6);return}e.setAttribute(`data-sizing`,t),e.style.flexBasis=``}var Jf=e=>({header:Ht(`confirmTitle`,e),message:Ht(`confirmMessage`,e),confirmationText:Ht(`confirmYes`,e),denialText:Ht(`confirmNo`,e)}),Yf=(e,t)=>{let n=Jf(t),r=e?.confirmationTexts,i=(e,t)=>e!=null&&e.trim().length>0?e:t;return{header:i(r?.title,n.header),message:i(r?.message,n.message),confirmationText:i(r?.confirmationText,n.confirmationText),denialText:i(r?.denialText,n.denialText)}},Xf=null,Zf=class extends Fu{constructor(...e){super(...e),this.baseUrl=``,this.route=``,this.consumedRoute=``,this.formerState={},this.applyRules=()=>{let e=this.component.rules;if(e&&e.length>0){let t=this.state,n=this.data,r=this.appState,i=this.appData,a=this.component,o=e=>Sr(e,t,n,{appState:r,appData:i,component:a}),s=e=>xr(e,t,n,r,i,{component:a}),c=[`state`,`data`,`appState`,`appData`,`component`],l=[t,n,r,i,a],u={...this.state},d={...this.data},f=!1,p=!1;for(let t=0;t<e.length;t++){let n=e[t];try{if(o(n.filter)){if(bd.SetStateValue==n.action||bd.SetDataValue==n.action){let e=bd.SetStateValue==n.action?u:d,t=n.fieldName.split(`,`);for(let r=0;r<t.length;r++){let i=t[r];if(!e[i]||e[i]!=n.value){let t=n.expression?s(n.expression):n.value,r=Vf.none==n.fieldAttribute?i:i+`.`+n.fieldAttribute;t!=e[r]&&(e[r]=t,bd.SetStateValue==n.action&&(f=!0),bd.SetDataValue==n.action&&(p=!0))}}}if(bd.RunAction==n.action&&this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.actionId},bubbles:!0,composed:!0})),bd.RunJS==n.action&&Function(...c,n.value)(...l),bd.SetAttributeValue==n.action){let e=n.expression?o(n.expression):n.value;if(n.fieldAttribute==`disabled`){e?this.shadowRoot?.getElementById(n.fieldName)?.setAttribute(n.fieldAttribute,`disabled`):this.shadowRoot?.getElementById(n.fieldName)?.removeAttribute(n.fieldAttribute);continue}this.shadowRoot?.getElementById(n.fieldName)?.setAttribute(n.fieldAttribute,e)}if(bd.SetCssClass==n.action&&this.shadowRoot?.getElementById(n.fieldName)?.setAttribute(`class`,n.value),bd.SetStyle==n.action&&this.shadowRoot?.getElementById(n.fieldName)?.style.setProperty(n.expression,n.value),Hf.Stop==n.result)break}}catch(e){console.error(`rule failed`,n,e)}}f&&(this.state=u),p&&(this.data=d),f&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes(`-`),this.checkValidations=e=>{let t=e?e.split(`,`):void 0,n=this.component.validations,r=!0,i=!1,a=this.data??{},o={...this.data??{},errors:{}};if(n){for(let e=0;e<n.length;e++){let r=n[e];if(this.skipValidation(t,r))continue;let i=(r.fieldId??`_component`).split(`,`);for(let e=0;e<i.length;e++){let t=i[e];o.errors[t]=[]}}for(let e=0;e<n.length;e++){let i=n[e];if(!this.skipValidation(t,i))try{let e=i.condition&&i.condition.includes("${")?this._evalTemplate(i.condition):this._evalExpr(i.condition);if(i.condition&&!e){r=!1;let e=(i.fieldId??`_component`).split(`,`);for(let t=0;t<e.length;t++){let n=e[t],r=o.errors[n];if(r||(o.errors[n]=[]),r=o.errors[n],!a[n]){let e=i.message;try{e=this._evalTemplate(i.message)}catch{}r.push(e)}}}}catch(e){console.error(`validation failed`,i,e)}}for(let e=0;e<n.length;e++){let r=n[e];if(this.skipValidation(t,r))continue;let s=(r.fieldId??`_component`).split(`,`);for(let e=0;e<s.length;e++){let t=s[e];if((a.errors||o.errors==``)&&[t].join(`,`)){i=!0;break}}}(a.errors||o.errors==``)&&[`_component`].join(`,`)&&(i=!0)}o._valid=r,o._valid!=a._valid&&(i=!0),i&&(this.data=o)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){let t=e.detail,n={};t.fieldIds.forEach(e=>{n[e]=void 0}),n.searchText=void 0,this.state={...this.state,...n}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){let t=e.detail,n={};n[t.key]=t.value,e.type==`data-changed`&&(this.data={...this.data,...n})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){let t=e.detail;if(e.type==`value-changed`){let n={...this.state};n[t.fieldId]=t.value,this.adoptEditedState(t.fieldId,n),(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent(`dirty`,{detail:e.detail,bubbles:!0,composed:!0}));let r=this.component;r.triggers?.filter(e=>e.type==Pu.OnValueChange).filter(e=>!e.propertyName||t.fieldId==e.propertyName).forEach(e=>{(!e.condition||this._evalExpr(e.condition))&&this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))}),r.triggers?.filter(e=>e.type==Pu.AutoSave).forEach(e=>{let t=e.actionId,n=this._autoSaveTimers.get(t);n!==void 0&&clearTimeout(n),this._autoSaveTimers.set(t,setTimeout(()=>{this._autoSaveTimers.delete(t),this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.actionId},bubbles:!0,composed:!0}))},e.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{let t=e.detail,n=t?._originElement??gd(e);if(e.type==`action-requested`){e.preventDefault(),e.stopPropagation(),Array.isArray(t.parameters?.crud_selected_items)&&(this.state={...this.state,crud_selected_items:t.parameters.crud_selected_items});let r=this.component,i=r.actions?.find(e=>e.id==t.actionId)??r.actions?.find(e=>e.id.endsWith(`*`)&&t.actionId.startsWith(e.id.slice(0,-1)));if(i){if(i&&i.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify(`You first need to select some rows`);return}if(i&&i.validationRequired){let e=Xf??this;if(Xf=null,e.checkValidations(i.fieldsToValidate),!e.data._valid){e.notifyValidationErrors();return}}Xf=null;let e={...t,initiatorComponentId:this.id};i&&i.confirmationRequired?this.callAfterConfirmation(i,()=>this.requestActionCallToServerOrBubble(e,r,i,n)):this.requestActionCallToServerOrBubble(e,r,i,n)}else{let r={...t.parameters};r.initiatorState||=this.state,Xf||=this,this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,_originElement:n,parameters:r},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{let e={},t=n=>{if(n)for(let r of n){let n=r.metadata;if(n?.type===M.FormField){let t=n;t.fieldId&&t.label&&(e[t.fieldId]=t.label)}t(r.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{let e=this.data?.errors??{},t=this.buildFieldLabelMap(),n=[];if(Object.entries(e).forEach(([e,r])=>{if(!Array.isArray(r))return;let i=e===`_component`?void 0:t[e]??e;r.forEach(e=>{e&&!n.some(t=>t.label===i&&t.msg===e)&&n.push({label:i,msg:e})})}),n.length===0){this.notify(`There are validation errors`);return}xu({text:`There are validation errors
`+n.map(({label:e,msg:t})=>e?`• ${e}: ${t}`:`• ${t}`).join(`
`),variant:`error`,position:`bottomEnd`,duration:Math.max(3e3,1500+n.length*1e3)},this),this.focusFirstInvalidField()},this.notify=e=>{xu({text:e,variant:`error`,position:`bottomEnd`,duration:3e3},this)},this.handleRestAction=(e,t)=>{let n=()=>{let t=P(e.successMessage,this.state,this.data);t&&xu({text:t,variant:`success`,position:`bottomEnd`,duration:3e3},this);let n=P(e.successRoute,this.state,this.data);if(!(!n||n.includes("${"))){if(this.sameRoute(n)){this.refreshListing();return}Ir(this,n)}},r=t=>{if(e.resultPath!=null){let n=zi(t,e.resultPath);n&&typeof n==`object`&&(this.state={...this.state,...n})}n()},i=e=>{console.warn(`mateu: rest action failed`,e),xu({text:`Request failed`,variant:`error`,position:`bottomEnd`,duration:3e3},this)},a=(e,t)=>{let n=e?.appData?._restfetchError;if(n){xu({text:`Request failed${typeof n?.status==`number`&&n.status>0?` (HTTP ${n.status})`:``}`,variant:`error`,position:`bottomEnd`,duration:3e3},this);return}t(e?.appData?._restfetch)},o=!!we(e.source)?.proxy,s=t===`__restdata__`?`data`:`action`;if(e.forEachSelectedRow){let r=this.state.crud_selected_items??[];if(!r.length){this.notify(`You first need to select some rows`);return}if(o){this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:`__restfetch__`,parameters:{_sourceKind:s,_sourceId:t,_forEachSelectedRow:!0},callback:e=>a(e,()=>n()),callbackonly:!0},bubbles:!0,composed:!0}));return}Promise.all(r.map(t=>Hi(e.source,e=>P(e,{...this.state,...t},this.data)))).then(()=>n()).catch(i);return}if(o){this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:`__restfetch__`,parameters:{_sourceKind:s,_sourceId:t},callback:e=>a(e,r),callbackonly:!0},bubbles:!0,composed:!0}));return}Hi(e.source,e=>P(e,this.state,this.data),void 0,e=>P(e,ve(this.state),ve(this.data))).then(r).catch(i)},this.callAfterConfirmation=(e,t)=>{let{header:n,message:r,confirmationText:i,denialText:a}=Yf(e),o=document.createElement(`div`);o.style.cssText=`position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);padding:1rem;`;let s=document.createElement(`div`);s.style.cssText=`background:var(--lumo-base-color,#fff);color:var(--lumo-body-text-color,#1a1a1a);border-radius:var(--lumo-border-radius-l,12px);box-shadow:var(--lumo-box-shadow-xl,0 12px 40px rgba(0,0,0,.3));padding:1.2rem;max-width:min(90vw,26rem);`;let c=()=>{o.parentElement&&document.body.removeChild(o)},l=`font:inherit;font-weight:600;padding:.45rem 1rem;border-radius:var(--lumo-border-radius-m,6px);cursor:pointer;`;te(D`
            <h3 style="margin:0 0 .5rem;">${n}</h3>
            <div style="margin-bottom:1.2rem;">${r}</div>
            <div style="display:flex;justify-content:flex-end;gap:.5rem;">
                <button style="${l}border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.25));background:var(--lumo-base-color,#fff);"
                        @click="${()=>c()}">${a}</button>
                <button style="${l}border:none;background:var(--lumo-primary-color,#1676f3);color:var(--lumo-primary-contrast-color,#fff);"
                        @click="${()=>{c(),t()}}">${i}</button>
            </div>
        `,s),o.appendChild(s),o.addEventListener(`click`,e=>{e.target===o&&c()}),document.body.appendChild(o)},this.requestActionCallToServerOrBubble=(e,t,n,r)=>{if(n&&n.bubble){let t={...e.parameters};t.initiatorState||=this.state,this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{...e,_originElement:r,parameters:t},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,n,r)},this.requestActionCallToServer=(e,t,n,r)=>{if(n&&n.href){window.location.href=n.href;return}if(n&&n.js)try{Function(`state`,`data`,`appState`,`appData`,`component`,n.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(e){console.error(`when evaluating `+n.js,e,this.component,this.state,this.data)}if(n&&n.customEvent&&this.dispatchEvent(new CustomEvent(n.customEvent.name,{detail:n.customEvent.detail,bubbles:!0,composed:!0})),n&&(n.js||n.customEvent)||Kf(n,e=>this.applyCommand(e)))return;if(n&&n.restAction){this.handleRestAction(n.restAction,n.id);return}if(e.actionId==`search`){let t=e.parameters?._searchState;t?this.state={...this.state,...t}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}let i=e.background??n?.background??(wu(e.actionId)||void 0);if(!i){if(!Yt(e.actionId,n?.idempotent)&&!Gf.begin(Wf(this.id,e.actionId)))return;let t=vd(r);this._pendingOrigins.set(e.actionId,t),md(t)}let a=Lf(this.state,e.parameters,e.actionId);this.dispatchEvent(new CustomEvent(`server-side-action-requested`,{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:a,parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:i,sse:n?.sse,timeoutMillis:n?.timeoutMillis,idempotent:n?.idempotent,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(e=>e.type==Pu.OnSuccess).filter(t=>e.detail.actionId==t.calledActionId).forEach(t=>{if(!t.condition||this._evalExpr(t.condition))if(e.preventDefault(),e.stopPropagation(),t.timeoutMillis>0){let e=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,background:t.background,callbackToken:e},bubbles:!0,composed:!0}))},t.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,background:t.background},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(e=>e.type==Pu.OnError).filter(t=>e.detail.actionId==t.calledActionId).forEach(t=>{(!t.condition||this._evalExpr(t.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId},bubbles:!0,composed:!0})))})},this._pendingOrigins=new Map,this._backendSettledListener=e=>{((typeof e.composedPath==`function`?e.composedPath():[])[0]??e.target)===this&&this._releasePending(e.detail?.actionId)},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;let t=this.component;if(t)for(let n of t.actions??[]){let t=n.shortcut||(n.runOnEnter?`enter`:null);if(t&&this._shortcutMatchesEvent(t,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return F.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has(`state`)&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has(`component`)&&(qf(this,this.component?.sizing),this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent(`clean`,{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}sameRoute(e){let t=e=>e.replace(/^\/+/,``).replace(/\/+$/,``).split(`?`)[0];return t(e)===t(window.location.pathname)}refreshListing(){let e=null,t=n=>{let r=n.querySelector?.(`mateu-table-crud`);r&&(e=r),n.querySelectorAll?.(`*`).forEach(e=>{e.shadowRoot&&t(e.shadowRoot)})};t(this.renderRoot),e?.search?.()}focusFirstInvalidField(){let e=t=>requestAnimationFrame(()=>{let n=this.findFirstInvalid(this.renderRoot);if(n){n.focus?.(),n.scrollIntoView?.({block:`center`,behavior:`smooth`});return}t>0&&e(t-1)});e(3)}findFirstInvalid(e){if(!e?.querySelectorAll)return null;for(let t of Array.from(e.querySelectorAll(`*`))){if(t.invalid===!0)return t;if(t.shadowRoot){let e=this.findFirstInvalid(t.shadowRoot);if(e)return e}}return null}_releasePending(e){(e===void 0?Array.from(this._pendingOrigins.keys()):[e]).forEach(e=>{Gf.end(Wf(this.id,e)),hd(this._pendingOrigins.get(e)),this._pendingOrigins.delete(e)})}_shortcutMatchesEvent(e,t){return Za(e,t)}_collectShortcutTabs(){let e=this.renderRoot;if(!e)return[];let t=Array.from(e.querySelectorAll(`vaadin-tab[data-shortcut]`));return e.querySelectorAll(`mateu-drawer, mateu-dialog`).forEach(e=>{let n=e.shadowRoot;n&&t.push(...Array.from(n.querySelectorAll(`vaadin-tab[data-shortcut]`)))}),t}_handleTabShortcut(e){let t=this._collectShortcutTabs();if(t.length===0)return!1;for(let n of Array.from(t)){let t=n.dataset.shortcut;if(!t||!this._shortcutMatchesEvent(t,e))continue;let r=n.closest(`vaadin-tabs`);if(!r)continue;let i=Array.from(r.querySelectorAll(`vaadin-tab`)).indexOf(n);if(!(i<0))return e.preventDefault(),r.selected=i,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener(`backend-call-succeeded`,this.handleBackendSucceeded),this.addEventListener(`backend-call-failed`,this.handleBackendFailed),this.addEventListener(`backend-succeeded-event`,this._backendSettledListener),this.addEventListener(`backend-failed-event`,this._backendSettledListener),this.addEventListener(`backend-cancelled-event`,this._backendSettledListener),document.addEventListener(`keydown`,this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`backend-call-succeeded`,this.handleBackendSucceeded),this.removeEventListener(`backend-call-failed`,this.handleBackendFailed),this.removeEventListener(`backend-succeeded-event`,this._backendSettledListener),this.removeEventListener(`backend-failed-event`,this._backendSettledListener),this.removeEventListener(`backend-cancelled-event`,this._backendSettledListener),document.removeEventListener(`keydown`,this._keydownListener),this._releasePending()}render(){return D`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?D`
                <div><ul>${this.data.errors._component.map(e=>D`<li>${e}</li>`)}</ul></div>
            `:x}</div>`}_render(){if(this.component?.type==j.ClientSide){let e=this.component;return e.metadata?.type==M.Page?Ss(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==M.Crud?Cs(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):F.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return D`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==j.ClientSide){let t=e;if(t.metadata?.type==M.Page)return Ss(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==M.Crud)return Cs(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return I(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}static{this.styles=[v`
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

        ${ee(De.cssText)}
        
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
  `,Go(`.page-fab`),Oe]}};A([y()],Zf.prototype,`baseUrl`,void 0),A([y()],Zf.prototype,`route`,void 0),A([y()],Zf.prototype,`consumedRoute`,void 0),Zf=A([w(`mateu-component`)],Zf);var Qf=new class{async handle(e,t){return await e.runAction(t.baseUrl,t.route,t.consumedRoute,t.actionId,t.initiatorComponentId,t.appState,t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.options)}},$f=new class{constructor(){this.handleUIIncrement=(e,t,n)=>{if(e?.fragments?.forEach(e=>{he.next({command:void 0,fragment:e,ui:void 0,error:void 0,callbackToken:n,initiator:t})}),e?.appState&&(k.value={...e.appState},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))),e?.appData){let n=e?.appData;ge.value={...e.appData,...n},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))}e?.messages?.forEach(e=>{xu({text:e.text,position:e.position,variant:e.variant,duration:e.duration,undoLabel:e.undoLabel,undoActionId:e.undoActionId,undoParameters:e.undoParameters},t)}),e?.banners&&e.banners.length>0&&document.dispatchEvent(new CustomEvent(`page-banners-received`,{detail:{banners:e.banners,append:e.appendBanners??!1},bubbles:!1,composed:!1})),e?.commands?.forEach(e=>{he.next({command:e,fragment:void 0,ui:void 0,error:void 0,callbackToken:n,initiator:t})})}}async runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h={}){let g=()=>{this.runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)};try{let o=await Qf.handle(e,{baseUrl:t,route:n,consumedRoute:r,actionId:i,appState:k.value,initiatorComponentId:a,componentState:c,parameters:l,serverSideType:s,initiator:u,background:d,options:{...h,retry:g}});if(h.isStale?.()){console.debug?.(`mateu: dropped the answer to an action of a view no longer on screen`,i,s,t),u.dispatchEvent(new CustomEvent(`backend-cancelled-event`,{bubbles:!0,composed:!0,detail:{actionId:i}}));return}f&&f(o),p||this.handleUIIncrement(o,u,m),o.messages&&o.messages.length==1&&o.messages[0].variant==`error`&&u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-succeeded`,{detail:{actionId:i,evevntId:de()},bubbles:!0,composed:!0}))}catch(e){if(xn(e)){console.debug?.(`mateu: dropped the answer (`+e.outcome+`) to an action of a view no longer on screen`,i,s,t);return}console.warn(`Action request failed`,e),e?.__mateuReported||u.dispatchEvent(new CustomEvent(`backend-failed-event`,{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(e),retry:g}})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0}))}}serialize(e){return e?.message?e:JSON.stringify(e)}},ep=new class{constructor(){this.handleUIIncrement=(e,t,n)=>{if(e?.messages?.forEach(e=>{xu({text:e.text,position:e.position,variant:e.variant,duration:e.duration,undoLabel:e.undoLabel,undoActionId:e.undoActionId,undoParameters:e.undoParameters},t)}),e?.banners&&e.banners.length>0&&document.dispatchEvent(new CustomEvent(`page-banners-received`,{detail:{banners:e.banners,append:e.appendBanners??!1},bubbles:!1,composed:!1})),e?.commands?.forEach(e=>{he.next({command:e,fragment:void 0,ui:void 0,error:void 0,callbackToken:n,initiator:t})}),e?.fragments?.forEach(e=>{he.next({command:void 0,fragment:e,ui:void 0,error:void 0,callbackToken:n,initiator:t})}),e?.appState&&(k.value={...e.appState},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))),e?.appData){let n=e?.appData;ge.value={...e.appData,...n},t.dispatchEvent(new CustomEvent(`app-data-updated`,{bubbles:!0,composed:!0}))}}}async runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h={}){let g=()=>{this.runAction(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)};if(n){n||=`_no_route`,n&&n.startsWith(`/`)&&(n=n.substring(1));let e={serverSideType:s,appState:k.value,componentState:c,parameters:l,initiatorComponentId:a,consumedRoute:r,route:`/`+n,actionId:i};d||u.dispatchEvent(new CustomEvent(`backend-called-event`,{bubbles:!0,composed:!0,detail:{}}));let o={Accept:`text/event-stream`,"Content-Type":`application/json`},_=localStorage.getItem(`__mateu_auth_token`);_&&(o.Authorization=`Bearer `+_);let v=sessionStorage.getItem(`__mateu_sesion_id`);v&&(o[`X-Session-Id`]=v),fetch(t+`/mateu/v3/sse/`+n,{method:`POST`,headers:o,body:JSON.stringify(e)}).then(async e=>{let t,n=e=>{if(h.isStale?.())throw t?.cancel().catch(()=>void 0),new bn(i,e)};if(n(`answered`),t=e.body?.pipeThrough(new TextDecoderStream).getReader(),t){let e=``;for(;;){let{value:r,done:a}=await t.read();if(a)break;e+=r;let o=e.split(`

`);e=o.pop()??``;for(let e of o){let t=e.trim();if(t)if(t.startsWith(`data:`)){n(`answered`);let e=JSON.parse(t.substring(5).trim());f&&f(e),p||this.handleUIIncrement(e,u,m),e.messages&&e.messages.length==1&&e.messages[0].variant==`error`&&u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0}))}else{let e=t;try{let n=JSON.parse(t);e=n.message,n._embedded?.errors?.length>0&&n._embedded.errors[0].message&&(e=n._embedded.errors[0].message)}catch{}throw n(`failed`),Error(e)}}}}d||u.dispatchEvent(new CustomEvent(`backend-succeeded-event`,{bubbles:!0,composed:!0,detail:{actionId:i}})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-succeeded`,{detail:{actionId:i},bubbles:!0,composed:!0}))}).catch(e=>{if(xn(e)||h.isStale?.()){console.debug?.(`mateu: dropped a streamed answer to an action of a view no longer on screen`,i,s,t),u.dispatchEvent(new CustomEvent(`backend-cancelled-event`,{bubbles:!0,composed:!0,detail:{actionId:i}}));return}u.dispatchEvent(new CustomEvent(`backend-failed-event`,{bubbles:!0,composed:!0,detail:{actionId:i,reason:this.serialize(e),retry:g}})),u.shadowRoot?.dispatchEvent(new CustomEvent(`backend-call-failed`,{detail:{actionId:i},bubbles:!0,composed:!0}))})}}serialize(e){return e?.message?e:JSON.stringify(e)}},tp={fixed:`fixed`,fullWidth:`full`,edgeToEdge:`edge`},np=new Set([M.Gantt,M.PlanningBoard,M.Kanban,M.Bpmn,M.Workflow,M.Map]),rp={landing:`fixed`,form:`fixed`,process:`fixed`},ip=e=>e?tp[e]:void 0,ap=e=>e.type==j.ClientSide?e.metadata:void 0,op=e=>{let t=ap(e);if(t?.type==M.Page){let e=ip(t.pageWidth);if(e)return e}for(let t of e.children??[]){let e=op(t);if(e)return e}},sp=e=>{let t=e.pageType;if(t)return t;let n=e=>{let t=ap(e);if(t?.type==M.Page&&t.pageType)return t.pageType;for(let t of e.children??[]){let e=n(t);if(e)return e}};return n(e)},cp=e=>{let t=ap(e);if(t?.type!=M.Crud)return!1;let n=t;return n.compact?!0:(n.columns??[]).some(e=>e.metadata?.editable)},lp=(e,t)=>t(e)||(e.children??[]).some(e=>lp(e,t)),up=e=>!!e&&lp(e,e=>ap(e)?.type==M.HeroSection),dp=e=>ap(e)?.type==M.App||(e.children??[]).some(e=>ap(e)?.type==M.App),fp=(e,t)=>e?(ip(e.pageWidth)??op(e))||(t?.top&&dp(e)?`edge`:rp[sp(e)??``]||(lp(e,e=>{let t=ap(e)?.type;return t!=null&&np.has(t)})?`edge`:lp(e,cp)?`full`:`fixed`)):`fixed`,pp=`mateu-route-structure-cache`,mp=1,hp=50,gp=(()=>{try{return localStorage.getItem(`mateu-route-structure-cache-off`)!==`1`}catch{return!0}})(),_p=()=>{try{return JSON.parse(localStorage.getItem(pp)??`{}`)}catch{return{}}},vp=e=>{try{localStorage.setItem(pp,JSON.stringify(e))}catch{try{let t=Object.entries(e).sort((e,t)=>t[1].t-e[1].t).slice(0,Math.floor(hp/2));localStorage.setItem(pp,JSON.stringify(Object.fromEntries(t)))}catch{}}},yp=e=>{let t=e.initialState&&Object.keys(e.initialState).length?`#`+Sp(JSON.stringify(e.initialState)):``;return[e.baseUrl,e.consumedRoute??``,e.route??``,e.serverSideType??``].join(`|`)+t},bp=e=>{if(!gp)return;let t=_p()[e];if(!(!t||t.v!==mp))return{component:t.component,hash:t.hash}},xp=(e,t,n)=>{if(!gp)return;let r=_p();r[e]={v:mp,t:Date.now(),component:t,hash:n};let i=Object.keys(r);if(i.length>hp){let e=i.sort((e,t)=>r[e].t-r[t].t).slice(0,i.length-hp);for(let t of e)delete r[t]}vp(r)},Sp=e=>{let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return(t>>>0).toString(36)},Cp=30,wp=new Map,Tp=!0,Ep=e=>{if(Tp)return wp.get(e)},Dp=(e,t)=>{if(Tp&&(wp.delete(e),wp.set(e,t),wp.size>Cp)){let e=wp.keys().next().value;e!==void 0&&wp.delete(e)}},Op,Z=class extends rr{static{Op=this}constructor(...e){super(...e),this.consumedRoute=``,this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.showSkeleton=!1,this.pendingRouteFocus=!1,this.hasRenderedContent=!1,this.generation=0,this.viewGeneration=Object.defineProperties({},{generation:{get:()=>this.generation},callbackToken:{get:()=>this.callbackToken},connected:{get:()=>this.isConnected}}),this.loadLifecycleListener=e=>{if(((typeof e.composedPath==`function`?e.composedPath():[])[0]??e.target)===this)if(clearTimeout(this.skeletonTimer),e.type===`backend-called-event`){if(this.fragment?.component)return;this.skeletonTimer=setTimeout(()=>{this.showSkeleton=!0},Op.SKELETON_DELAY_MS)}else this.showSkeleton=!1},this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t==`string`&&(t===``||t.startsWith(`/`))&&this.consumedRoute&&this.consumedRoute!==`_empty`&&this.consumedRoute.startsWith(`/`)&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t=t.startsWith(`/`)&&this.uriPrefix.endsWith(`/`)?this.uriPrefix+t.substring(1):!t.startsWith(`/`)&&!this.uriPrefix.endsWith(`/`)?this.uriPrefix+`/`+t:this.uriPrefix+t),this.dispatchEvent(new CustomEvent(`url-update-requested`,{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==``&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:j.ClientSide,metadata:{type:M.Element,name:`div`,content:`Not found`},id:`fieldId`},action:Xe.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;let t=this.detail1;if(e.type==`server-side-action-requested`&&t.initiator!==this&&!vn(this.contentIdentity,_n(this.id,this.baseUrl),t.actionId)){console.debug?.(`mateu-ux: dropped an action of the previous view`,t.actionId,t.serverSideType,`now`,this.baseUrl,this.route),t.initiator?.dispatchEvent?.(new CustomEvent(`backend-cancelled-event`,{detail:{actionId:t.actionId}}));return}if(e.type==`server-side-action-requested`){let e=$f;t.sse&&(e=ep),e.runAction(Tn,this.baseUrl,t.route??``,t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken,{timeoutMillis:t.timeoutMillis,idempotent:t.idempotent,knownStructureHash:t.knownStructureHash,isStale:yn(this.viewGeneration,t.initiator===this&&!t.actionId)})}},this.getCustomisedAppState=()=>{let e={...k.value};if(this.overrides){let t=Bf(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw Error(`Method not implemented.`)}createRenderRoot(){return F.mustUseShadowRoot()?super.createRenderRoot():this}structureCacheKey(){return yp({baseUrl:this.baseUrl,consumedRoute:this.consumedRoute,route:this.route,serverSideType:this.serverSideType,initialState:this.initialState})}focusNewContent(){requestAnimationFrame(()=>{let e=this.renderRoot?.querySelector?.(`h1, h2, [role="heading"]`)??this;e.hasAttribute(`tabindex`)||e.setAttribute(`tabindex`,`-1`),e.focus?.({preventScroll:!0})})}static{this.SKELETON_DELAY_MS=400}connectedCallback(){super.connectedCallback(),this.overridesParsed=Bf(this.overrides),this.addEventListener(`server-side-action-requested`,this.actionRequestedListener),this.addEventListener(`backend-call-failed`,this.backendFailedListener),this.addEventListener(`history-pushed`,this.historyPushed),this.addEventListener(`route-changed`,this.routeChangedListener),this.addEventListener(`backend-called-event`,this.loadLifecycleListener),this.addEventListener(`backend-succeeded-event`,this.loadLifecycleListener),this.addEventListener(`backend-failed-event`,this.loadLifecycleListener),this.addEventListener(`backend-cancelled-event`,this.loadLifecycleListener)}disconnectedCallback(){super.disconnectedCallback(),this.releaseFabAnchor?.(),this.releaseFabAnchor=void 0,this.removeEventListener(`server-side-action-requested`,this.actionRequestedListener),this.removeEventListener(`backend-call-failed`,this.backendFailedListener),this.removeEventListener(`history-pushed`,this.historyPushed),this.removeEventListener(`route-changed`,this.routeChangedListener),this.removeEventListener(`backend-called-event`,this.loadLifecycleListener),this.removeEventListener(`backend-succeeded-event`,this.loadLifecycleListener),this.removeEventListener(`backend-failed-event`,this.loadLifecycleListener),this.removeEventListener(`backend-cancelled-event`,this.loadLifecycleListener),clearTimeout(this.skeletonTimer)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(e=>e===`appState`||e===`appData`)){let t=this.renderRoot.querySelector(`mateu-component`);if(t)return e.has(`appState`)&&(t.appState=this.appState),e.has(`appData`)&&(t.appData=this.appData),!1}return!0}updated(e){if((e.has(`id`)||e.has(`baseurl`)||e.has(`route`)||e.has(`consumedRoute`)||e.has(`instant`))&&!this.preventNavigation){let e=_n(this.id,this.baseUrl)+`|`+(this.route??``);e!==this.generationKey&&(this.generationKey=e,this.generation++),this.callbackToken=this.instant||de();let t=this.structureCacheKey(),n=t===this.lastAuthoritativeKey?void 0:Ep(t);if(n)queueMicrotask(()=>this.applyFragment(n));else{if(t!==this.lastAuthoritativeKey){let e=bp(t);this.currentStructureHash=e?.hash,e&&(this.fragment={targetComponentId:this.id,component:e.component,state:{},data:{},action:Xe.Replace,containerId:void 0},this.stampPageChrome(),this.contentIdentity=_n(this.id,this.baseUrl))}this.manageActionEvent(new CustomEvent(`server-side-action-requested`,{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:``,serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,componentState:this.initialState,knownStructureHash:this.currentStructureHash,callbackToken:this.callbackToken},bubbles:!0,composed:!0}))}}e.has(`route`)&&this.top&&(this.preventNavigation||(this.pendingRouteFocus=!0),this.preventNavigation||this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&=!1}applyFragment(e){if(this.contentIdentity=_n(this.id,this.baseUrl),!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}},this.stampPageChrome();return}if(this.fragment=e,e.component){if(e.action!==Xe.Add){let t=this.structureCacheKey(),n=e.component.structureHash;xp(t,e.component,n),this.lastAuthoritativeKey=t,this.currentStructureHash=n,e.component.staticView&&Dp(t,e)}this.pendingRouteFocus&&this.hasRenderedContent&&this.focusNewContent(),this.pendingRouteFocus=!1,this.hasRenderedContent=!0}this.stampPageChrome()}stampPageChrome(){let e=this.fragment?.component;if(!e||e===this.lastStampedComponent)return;this.lastStampedComponent=e;let t=!this.top&&dp(e);this.dataset.pageWidth=t?`edge`:fp(e,{top:this.top}),this.releaseFabAnchor?.(),this.releaseFabAnchor=void 0,(this.top===!0||String(this.top)===`true`||this.hasAttribute(`data-content-view`))&&!dp(e)&&(this.releaseFabAnchor=_s(this,this.dataset.pageWidth)),this.dataset.pageType=sp(e)??``,this.dataset.hasWelcomeBanner=String(up(e))}render(){return!this.fragment?.component&&this.showSkeleton?D`
                <div class="route-skeleton" aria-busy="true" aria-live="polite">
                    <mateu-skeleton variant="text" count="1"></mateu-skeleton>
                    <mateu-skeleton variant="form" count="4"></mateu-skeleton>
                </div>
            `:D`
           ${this.fragment?.component?I(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):x}
       `}static{this.styles=[v`
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
  `,Oe,De]}};A([y()],Z.prototype,`consumedRoute`,void 0),A([y()],Z.prototype,`serverSideType`,void 0),A([y()],Z.prototype,`uriPrefix`,void 0),A([y()],Z.prototype,`overrides`,void 0),A([y()],Z.prototype,`homeRoute`,void 0),A([y()],Z.prototype,`route`,void 0),A([y()],Z.prototype,`top`,void 0),A([y()],Z.prototype,`instant`,void 0),A([y()],Z.prototype,`initialState`,void 0),A([y()],Z.prototype,`appState`,void 0),A([y()],Z.prototype,`appData`,void 0),A([C()],Z.prototype,`fragment`,void 0),A([C()],Z.prototype,`showSkeleton`,void 0),Z=Op=A([w(`mateu-ux`)],Z);function kp(e){let t=`var(--lumo-space-m, 1rem)`,n={left:`50%`,transform:`translateX(-50%)`};switch(e){case`topStart`:return{top:t,left:t};case`topCenter`:return{top:t,...n};case`topEnd`:return{top:t,right:t};case`topStretch`:return{top:t,left:t,right:t};case`middle`:return{top:`50%`,left:`50%`,transform:`translate(-50%, -50%)`};case`bottomStart`:return{bottom:t,left:t};case`bottomCenter`:return{bottom:t,...n};case`bottomStretch`:return{bottom:t,left:t,right:t};default:return{bottom:t,right:t}}}function Ap(e){switch(e){case`success`:return{bg:`var(--lumo-success-color, #2e7d32)`,fg:`#fff`};case`error`:return{bg:`var(--lumo-error-color, #c62828)`,fg:`#fff`};case`warning`:return{bg:`var(--lumo-warning-color, #f9a825)`,fg:`#1a1a1a`};case`contrast`:return{bg:`var(--lumo-contrast-90pct, #1a1a1a)`,fg:`#fff`};default:return{bg:`var(--lumo-base-color, #fff)`,fg:`var(--lumo-body-text-color, #1a1a1a)`}}}var jp={show(e,t){let{bg:n,fg:r}=Ap(e.variant),i=kp(e.position),a=document.createElement(`div`),o=e.variant===`error`;a.setAttribute(`role`,o?`alert`:`status`),a.setAttribute(`aria-live`,o?`assertive`:`polite`),a.setAttribute(`aria-atomic`,`true`),Object.assign(a.style,{position:`fixed`,zIndex:`2000`,display:`flex`,alignItems:`center`,gap:`0.75rem`,maxWidth:`min(90vw, 28rem)`,padding:`0.7rem 1rem`,borderRadius:`var(--lumo-border-radius-m, 8px)`,boxShadow:`var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,0.2))`,background:n,color:r,font:`inherit`,fontSize:`var(--lumo-font-size-s, 0.875rem)`,opacity:`0`,transition:`opacity 0.2s ease`,...i});let s=document.createElement(`span`);s.textContent=e.text,a.appendChild(s);let c=()=>{a.style.opacity=`0`,setTimeout(()=>a.remove(),200)},l=e.onAction?{label:e.actionLabel??`Retry`,run:e.onAction}:e.undoActionId?{label:e.undoLabel??`Undo`,run:()=>t.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0}))}:void 0;if(l){let e=document.createElement(`button`);e.textContent=l.label,e.style.cssText=`margin-left: 0.25rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;`,e.addEventListener(`click`,()=>{l.run(),c()}),a.appendChild(e)}document.body.appendChild(a),requestAnimationFrame(()=>{a.style.opacity=`1`});let u=e.duration??(l?1e4:5e3);u>0&&setTimeout(c,u)}};function Mp(){bu(jp)}var Np=class extends S{constructor(...e){super(...e),this.online=!0,this.recovered=!1}connectedCallback(){super.connectedCallback(),this.online=Qt.isOnline(),this.unsubscribe=Qt.subscribe(e=>{let t=!this.online;this.online=e,e&&t&&(this.recovered=!0,clearTimeout(this.recoveredTimer),this.recoveredTimer=setTimeout(()=>{this.recovered=!1},4e3))})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.(),clearTimeout(this.recoveredTimer),this.releaseSpace()}updated(){let e=this.renderRoot.querySelector(`.bar`);if(!e){this.releaseSpace();return}document.body.style.setProperty(`padding-block-start`,`${e.offsetHeight}px`)}releaseSpace(){typeof document<`u`&&document.body?.style.removeProperty(`padding-block-start`)}render(){if(this.online&&!this.recovered)return x;let e=!this.online;return D`<div class="bar ${e?`offline`:`back`}" role="status" aria-live="polite">
            <span class="dot"></span>
            <span>${e?`No connection — changes you make now will not be saved.`:`Connection restored.`}</span>
        </div>`}static{this.styles=v`
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
    `}};A([C()],Np.prototype,`online`,void 0),A([C()],Np.prototype,`recovered`,void 0),Np=A([w(`mateu-connectivity-banner`)],Np);var Pp=null;function Fp(){if(!(typeof document>`u`)&&!(Pp&&Pp.isConnected)){if(!document.body){document.addEventListener(`DOMContentLoaded`,()=>Fp(),{once:!0});return}Pp=document.createElement(`mateu-connectivity-banner`),document.body.appendChild(Pp)}}var Ip,Lp=class extends S{static{Ip=this}constructor(...e){super(...e),this.skip=()=>{let e=this.findContent();e&&(e.hasAttribute(`tabindex`)||e.setAttribute(`tabindex`,`-1`),e.focus(),e.scrollIntoView({block:`start`}))}}static{this.TARGETS=[`.app-content`,`mateu-page`,`mateu-ux`,`mateu-component`]}findContent(){let e=new Set,t=n=>{if(e.has(n))return null;e.add(n);for(let e of Ip.TARGETS){let t=n.querySelector?.(e);if(t&&t!==this)return t}for(let e of Array.from(n.querySelectorAll?.(`*`)??[]))if(e.shadowRoot){let n=t(e.shadowRoot);if(n)return n}return null};return t(document)}render(){return D`<button class="skip" @click="${this.skip}">Skip to content</button>`}static{this.styles=v`
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
    `}};Lp=Ip=A([w(`mateu-skip-link`)],Lp);var Rp=null;function zp(){if(!(typeof document>`u`)&&!(Rp&&Rp.isConnected)){if(!document.body){document.addEventListener(`DOMContentLoaded`,()=>zp(),{once:!0});return}Rp=document.createElement(`mateu-skip-link`),document.body.insertBefore(Rp,document.body.firstChild)}}function Bp(e){let t=()=>{let t=document.documentElement.getAttribute(`theme`);t?e.setAttribute(`theme`,t):e.removeAttribute(`theme`)};t();let n=new MutationObserver(t);return n.observe(document.documentElement,{attributes:!0,attributeFilter:[`theme`]}),()=>n.disconnect()}var Vp=(e,t)=>{let n=t.pathname+(t.search??``),r=(e.pathname??``)+(e.search??``);return!n&&!r||r===n?null:n.startsWith(`/`)?n:`/`+n},Hp=(e,t)=>{if(!e)return!1;let n;try{n=new URL(e)}catch{return!1}return n.pathname!==t.pathname||(n.search??``)!==(t.search??``)};Mp(),Fp(),er(),zp();var Up=class extends S{constructor(...e){super(...e),this.baseUrl=``,this.route=void 0,this.consumedRoute=`_empty`,this.config=void 0,this.top=`true`,this.pathPrefix=void 0,this.bundleUrl=void 0,this.navigationKey=`initial`,this.debug=!1,this._lastUrl=``,this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top==`true`){let t=e.detail.route,n=this.baseUrl??``;!t||t.startsWith(`/`)?n=window.location.origin+(this.pathPrefix??``):(t=(this.pathPrefix??``)+t,n.indexOf(`://`)<0&&(n.startsWith(`/`)||(n=`/`+n),n=window.location.origin+n)),t.startsWith(this.pathPrefix+`/`)&&(t=t.substring(this.pathPrefix?.length)),n.endsWith(`/`)&&t.startsWith(`/`)&&(t=t.substring(1));let r=new URL(n+t),i=Vp(window.location,r);i&&(window.history.pushState({},``,i),this._lastUrl=window.location.href)}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),ei.markClean(),e instanceof CustomEvent){let t=e.detail.route,n=this.renderRoot.querySelector(`mateu-ux`);n&&(n.setAttribute(`route`,t),n.setAttribute(`instant`,de()))}}}createRenderRoot(){return F.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),this._themeMirrorDisposer=Bp(this),ei.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!ei.confirmLeave()){window.history.pushState({},``,this._lastUrl);return}let t=e.target;Hp(this._lastUrl,t.location)&&(this.navigationKey=de()),this.loadUrl(t)},this.top==`true`?(gn(this.baseUrl),this.bundleUrl&&At(this.bundleUrl),this.loadUrl(window)):this.route&&(this.consumedRoute=``),this.config)try{let e=JSON.parse(this.config);k.value={...k.value,...e}}catch{k.value={...k.value,config:this.config}}this.addEventListener(`url-update-requested`,this.routeChangedListener),this.addEventListener(`navigate-to-requested`,this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this._themeMirrorDisposer?.(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener(`url-update-requested`,this.routeChangedListener),this.removeEventListener(`navigate-to-requested`,this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute(`route`,this.route),this.instant=de(),this._lastUrl=e.location.href,e.location.search){let t=new URLSearchParams(e.location.search).get(`overrides`);if(t&&(this.config=t,this.config))try{let e=JSON.parse(this.config);k.value={...k.value,...e}}catch{k.value={...k.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){let t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t==`/`?``:t}addQueryParams(e,t){return e+(t.search?``+t.search:``)}extractGrossRouteFromUrl(e){let t=e.location.pathname,n=this.baseUrl&&(this.baseUrl.startsWith(`http://`)||this.baseUrl.startsWith(`https://`))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(n)?t.substring(n.length):t}getContextPathStartingIndex(e){return e.startsWith(`http:`)?e.indexOf(`/`,7):e.startsWith(`https:`)?e.indexOf(`/`,8):0}render(){return D`
           <mateu-api-caller>
                ${ae(this.navigationKey,D`<mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${ge.value}"
                          .appState="${k.value}"
                ></mateu-ux>`)}
           </mateu-api-caller>
           ${this.debug?D`
               <mateu-debug-overlay
                   .appState="${k.value}"
                   .appData="${ge.value}"
               ></mateu-debug-overlay>
           `:x}
       `}static{this.styles=v`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `}};A([y()],Up.prototype,`baseUrl`,void 0),A([y()],Up.prototype,`route`,void 0),A([y()],Up.prototype,`consumedRoute`,void 0),A([y()],Up.prototype,`config`,void 0),A([y()],Up.prototype,`top`,void 0),A([y()],Up.prototype,`pathPrefix`,void 0),A([y()],Up.prototype,`bundleUrl`,void 0),A([C()],Up.prototype,`instant`,void 0),A([C()],Up.prototype,`navigationKey`,void 0),A([y({type:Boolean})],Up.prototype,`debug`,void 0),Up=A([w(`mateu-ui`)],Up);var Wp,Gp=class extends S{static{Wp=this}constructor(...e){super(...e),this.baseUrl=``,this.opened=!1,this.searchText=``}static{this.SEARCHABLE_THRESHOLD=7}connectedCallback(){super.connectedCallback(),We()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(Be()[this.selector.fieldName]??``)}currentLabel(){let e=this.currentValue();if(!e)return`—`;let t=(this.searchedOptions??this.selector.options)?.find(t=>String(t.value)===e);if(t)return t.label;let n=Ve()[this.selector.fieldName];return n===void 0?e:String(n)}pick(e,t){He(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText=``,this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector(`input.picker-search`)?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){let e=this.app;if(e?.serverSideType)try{let t=await Tn.runAction(this.baseUrl??``,e.rootRoute??e.initialRoute??``,``,`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(let e of t?.fragments??[]){let t=e.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(t)){this.searchedOptions=t.map(e=>({value:e.value,label:e.label??String(e.value)}));return}}}catch{}}visibleOptions(){let e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(e=>e.label.toLowerCase().includes(t)):e}renderPanel(){let e=this.currentValue(),t=this.visibleOptions();return D`
            <div class="panel">
                ${this.searchText!==``||t.length>Wp.SEARCHABLE_THRESHOLD?D`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${e=>{e.key===`Escape`&&this.closePanel()}}"/>`:x}
                <div class="options">
                    ${e?D`
                        <div class="option option--clear" @click="${()=>this.pick(``)}">— (clear)</div>`:x}
                    ${t.map(t=>D`
                        <div class="option ${e===String(t.value)?`option--selected`:``}"
                             @click="${()=>this.pick(t.value,t.label)}">${t.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?D`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():x}
            </label>`:D``}static{this.styles=v`
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
    `}};A([y()],Gp.prototype,`selector`,void 0),A([y()],Gp.prototype,`app`,void 0),A([y()],Gp.prototype,`baseUrl`,void 0),A([C()],Gp.prototype,`opened`,void 0),A([C()],Gp.prototype,`searchText`,void 0),A([C()],Gp.prototype,`searchedOptions`,void 0),Gp=Wp=A([w(`mateu-app-context-picker`)],Gp);var Kp=class extends S{constructor(...e){super(...e),this.baseUrl=``,this.opened=!1,this.notifications=[],this.fetched=!1}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}updated(){!this.fetched&&this.app?.serverSideType&&(this.fetched=!0,this.refresh())}unreadCount(){return this.notifications.filter(e=>e.unread).length}async runNotificationsAction(e,t){let n=this.app;if(n?.serverSideType)try{let r=await Tn.runAction(this.baseUrl??``,n.rootRoute??n.initialRoute??``,``,e,`notification-bell`,void 0,n.serverSideType,{},t,this,!0);for(let e of r?.fragments??[]){let t=e.data?._notifications;if(Array.isArray(t)){this.notifications=t;return}}}catch{}}refresh(){return this.runNotificationsAction(`_notifications-list`,{})}markRead(e){return this.runNotificationsAction(`_notifications-read`,{ids:e})}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}openPanel(){this.opened||(this.opened=!0,this.refresh(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener(`mousedown`,this.outsideClick))}closePanel(){this.detachOutsideClick(),this.opened=!1}async entryClicked(e){e.unread&&await this.markRead([e.id]);let t=e.route;if(t){if(!ei.confirmLeave())return;this.closePanel(),this.dispatchEvent(new CustomEvent(`route-changed`,{detail:{route:t},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`navigate-to-requested`,{detail:{route:t},bubbles:!0,composed:!0}))}}renderEntry(e){return D`
            <div role="button" tabindex="0" class="entry ${e.unread?`entry--unread`:``}"
                 @click="${()=>this.entryClicked(e)}" @keydown="${B(()=>this.entryClicked(e))}">
                <span class="unread-dot" aria-hidden="true"></span>
                <div class="entry-body">
                    <div class="entry-top">
                        <span class="entry-title">${e.title}</span>
                        ${e.when?D`<span class="entry-when">${e.when}</span>`:x}
                    </div>
                    ${e.text?D`<div class="entry-text">${e.text}</div>`:x}
                </div>
            </div>`}renderPanel(){return D`
            <div class="panel">
                <div class="entries">
                    ${this.notifications.length===0?D`
                        <div class="empty">No notifications</div>`:x}
                    ${this.notifications.map(e=>this.renderEntry(e))}
                </div>
                ${this.notifications.length>0?D`
                    <div class="footer">
                        <button class="mark-all" ?disabled="${this.unreadCount()===0}"
                                @click="${()=>this.markRead(`all`)}">Mark all read</button>
                    </div>`:x}
            </div>`}render(){let e=this.unreadCount();return D`
            <div class="root">
                <button class="bell-button" data-access-key-target title="Notifications" aria-label="Notifications"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    <svg class="bell-icon" viewBox="0 0 24 24" aria-hidden="true"
                         fill="none" stroke="currentColor" stroke-width="1.8"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    ${e>0?D`<span class="badge">${e>99?`99+`:e}</span>`:x}
                </button>
                ${this.opened?this.renderPanel():x}
            </div>`}static{this.styles=v`
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
    
        ${V}
    `}};A([y()],Kp.prototype,`app`,void 0),A([y()],Kp.prototype,`baseUrl`,void 0),A([C()],Kp.prototype,`opened`,void 0),A([C()],Kp.prototype,`notifications`,void 0),Kp=A([w(`mateu-notification-bell`)],Kp);var qp=e=>{if(!e||!(`querySelectorAll`in e))return null;for(let t of e.querySelectorAll(`*`)){if(t.tagName?.toLowerCase()===`mateu-component`)return t;let e=qp(t.shadowRoot);if(e)return e}return null},Jp=async(e,t,n)=>{let r=qp(t.renderRoot??t);await ep.runAction(Tn,t.baseUrl??``,e.rootRoute||`_no_route`,``,n,r?.id??`app-header-action`,{},e.serverSideType??``,{},{},r??t,!0,void 0,!1,``)},Yp=class extends S{constructor(...e){super(...e),this.shown=!1}createRenderRoot(){return this}connectedCallback(){if(super.connectedCallback(),!this.shown){if(typeof IntersectionObserver>`u`){this.shown=!0;return}this.observer=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)&&(this.shown=!0,this.observer?.disconnect(),this.observer=void 0)}),this.observer.observe(this)}}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=void 0}render(){return this.shown&&this.content?this.content():D`<div class="mateu-when-visible-placeholder" style="min-height: 1px;">${x}</div>`}};A([y({attribute:!1})],Yp.prototype,`content`,void 0),A([C()],Yp.prototype,`shown`,void 0),Yp=A([w(`mateu-when-visible`)],Yp);var Xp=e=>!!e&&/[?&]_lazy=1(&|$)/.test(e),Zp=e=>(e.children??[]).filter(e=>e&&e.component!==`hr`&&e.text).map(e=>{let t=(e.children??[]).filter(e=>e&&e.text&&e.component!==`hr`);return{item:e,title:String(e.text??``),description:String(e.description??``),icon:String(e.icon??``),image:String(e.image??``),navigable:t.length===0,actions:t}}),Qp=e=>!!e&&e.display===`cards`&&(e.children?.length??0)>0,$p=class extends S{constructor(...e){super(...e),this.open=!1,this.outside=e=>{e.composedPath().includes(this)||(this.open=!1)},this.escape=e=>{e.key===`Escape`&&this.open&&(this.open=!1,this.renderRoot.querySelector(`.trigger`)?.focus())}}connectedCallback(){super.connectedCallback(),document.addEventListener(`click`,this.outside,!0),document.addEventListener(`keydown`,this.escape)}disconnectedCallback(){document.removeEventListener(`click`,this.outside,!0),document.removeEventListener(`keydown`,this.escape),super.disconnectedCallback()}select(e,t){t?.stopPropagation(),this.open=!1,this.onSelect?.(e)}renderIcon(e){return e.image?D`<img class="visual image" src="${e.image}" alt="" />`:e.icon&&customElements.get(`vaadin-icon`)?D`<vaadin-icon class="visual icon" icon="${e.icon}"></vaadin-icon>`:x}render(){let e=this.item;if(!e)return x;let t=Zp(e);return D`
            <button class="trigger ${e.selected?`active`:``}" type="button" data-access-key-target
                    aria-haspopup="true" aria-expanded="${this.open?`true`:`false`}"
                    @click="${()=>{this.open=!this.open}}">
                ${e.text}<span class="chevron" aria-hidden="true">▾</span>
            </button>
            ${this.open?D`
                <div class="panel" role="menu" aria-label="${e.text??``}">
                    ${t.map(e=>D`
                        <div class="card ${e.navigable?`navigable`:``} ${e.item.selected?`active`:``}"
                             role="${e.navigable?`menuitem`:`group`}"
                             tabindex="${e.navigable?`0`:x}"
                             aria-label="${e.title}"
                             @click="${e.navigable?t=>this.select(e.item,t):x}"
                             @keydown="${e.navigable?t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),this.select(e.item,t))}:x}">
                            ${this.renderIcon(e)}
                            <div class="body">
                                <div class="title">${e.title}</div>
                                ${e.description?D`<div class="description">${e.description}</div>`:x}
                                ${e.actions.length?D`
                                    <div class="actions">
                                        ${e.actions.map(e=>D`
                                            <button class="action" type="button" role="menuitem"
                                                    @click="${t=>this.select(e,t)}">${e.text}</button>`)}
                                    </div>`:x}
                            </div>
                        </div>`)}
                </div>`:x}
        `}static{this.styles=v`
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
    `}};A([y({attribute:!1})],$p.prototype,`item`,void 0),A([y({attribute:!1})],$p.prototype,`onSelect`,void 0),A([C()],$p.prototype,`open`,void 0),$p=A([w(`mateu-card-menu`)],$p);var em=(e,t)=>e?D`<mateu-when-visible style="display: block; width: 100%;" .content="${t}"></mateu-when-visible>`:t(),tm=async(e,t,n)=>{try{await Jp(e,t,n)}catch(e){xu({text:`La acción falló: `+e,position:`bottomStart`,duration:6e3,variant:`error`},t)}},nm=(e,t)=>{let n=e.contextSelectors??[],r=e.contextActions??[];return n.length===0&&r.length===0&&!e.notificationsEnabled?x:D`${e.notificationsEnabled?D`
        <mateu-notification-bell .app="${e}" .baseUrl="${t.baseUrl??``}"></mateu-notification-bell>`:x}${n.map(n=>D`
        <mateu-app-context-picker .selector="${n}" .app="${e}" .baseUrl="${t.baseUrl??``}"></mateu-app-context-picker>`)}${r.map(n=>(n.children?.length??0)>0?D`
        <details class="mateu-nav-group" style="flex-shrink: 0;">
            <summary class="app-header-action-btn">${n.label} ▾</summary>
            <div class="mateu-nav-panel" style="right: 0; left: auto;">
                ${n.children.map(n=>D`
                    <button class="mateu-nav-item" @click="${()=>n.actionId&&tm(e,t,n.actionId)}">${n.label}</button>`)}
            </div>
        </details>`:D`
        <button class="app-header-action-btn" style="flex-shrink: 0;"
            @click="${()=>n.actionId&&tm(e,t,n.actionId)}" title="${n.label}">${n.icon?L(n.icon):x}${n.label}</button>`)}`},rm=(e,t)=>D`
    <button class="mateu-nav-item ${e.selected?`mateu-nav-item--active`:``} ${e.className??``}"
            ?disabled="${e.disabled}"
            title="${e.title??x}"
            @click="${()=>t(e)}">${e.text}</button>`,im=(e,t=!0)=>D`
    <div class="m-hl" style="align-items: ${e.title?`baseline`:`center`}; min-width: 0;">
        ${e.logo?D`<img src="${e.logo}" alt="logo" height="28px" style="margin-left: ${t?`10px`:`0`}; align-self: center;">`:x}
        ${e.title?D`<h2 class="mateu-app-title" style="margin: 0 var(--lumo-space-l, 1.5rem) 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${e.title}</h2>`:x}
    </div>`,am=`flex: 1; min-width: 0; align-items: baseline;`,om=`m-hl mateu-app-header`,sm=(e,t,n=``)=>D`
    <nav class="mateu-nav ${n}">
        ${e.map(e=>(e.children?.length??0)>0?D`<details class="mateu-nav-group">
                       <summary class="mateu-nav-item">${e.text} ▾</summary>
                       <div class="mateu-nav-panel">
                           ${e.children.map(e=>rm(e,t))}
                       </div>
                   </details>`:rm(e,t))}
    </nav>`,cm=(e,t,n)=>{let r=e=>F.get()?.renderTopNav?.(e,t,n)??sm(e,t,n);if(!e.some(Qp))return r(e);let i=[],a=[];for(let n of e)Qp(n)?(a.length&&i.push(r(a)),a=[],i.push(D`<mateu-card-menu .item=${n} .onSelect=${t}></mateu-card-menu>`)):a.push(n);return a.length&&i.push(r(a)),D`<div class="mateu-nav-with-cards" style="display: flex; align-items: center; flex-wrap: wrap; min-width: 0;">${i}</div>`},lm=(e,t)=>{let n=[{text:`☰`,children:e,className:`mateu-menu-button-root`,"aria-label":`Menu`}];return F.get()?.renderTopNav?.(n,t,`menu-button`)??sm(n,t,`menu-button`)},um=(e,t)=>n=>t.call(e,{detail:{value:n}}),dm=(e,t)=>e.backRoute?D`
        <a href="${e.backRoute}" class="mateu-back-link"
           style="align-self: center; margin-left: 10px; white-space: nowrap; font-size: var(--lumo-font-size-s, .875rem);"
           @click="${n=>{n.preventDefault(),ei.confirmLeave()&&Ir(t,e.backRoute)}}">← ${e.backLabel??`Back`}</a>`:x,fm=e=>F.get()?.renderHeaderIconButton?.(e)??D`
        <button class="app-chrome-icon-btn ${e.cssClasses??``}" @click="${e.onClick}"
            title="${e.title??e.label}" aria-label="${e.label}"
            aria-pressed="${e.pressed===void 0?x:String(e.pressed)}"
            aria-expanded="${e.expanded===void 0?x:String(e.expanded)}"
            aria-controls="${e.controls??x}">
            ${L(e.icon,`width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem); color: currentColor;`)}
        </button>`,pm=(e,t)=>e.themeToggle?fm({icon:t.isDark?`vaadin:sun-o`:`vaadin:moon-o`,label:Ht(t.isDark?`lightMode`:`darkMode`),cssClasses:`mateu-theme-toggle`,onClick:()=>t.toggleTheme()}):x,mm=(e,t)=>e.sseUrl?fm({icon:`vaadin:comments-o`,label:Ht(`chat`),title:Ht(t.chatOpen?`closeChat`:`openChat`),pressed:!!t.chatOpen,cssClasses:`mateu-chat-toggle`+(t.chatOpen?` mateu-chat-toggle--open`:``),onClick:()=>t.showHideIa()}):x,hm=(e,t)=>D`
    ${mm(e,t)}
    <slot name="widgets"></slot>
    ${nm(e,t)}${pm(e,t)}`,gm=(e,t,n,r)=>e.sseUrl?D`<mateu-chat slot="${t.chatOpen?`detail`:`detail-hidden`}" sseurl="${e.sseUrl}" .label="${e.askLabel}" .mcpUrl="${e.mcpUrl}" .uploadUrl="${e.uploadUrl}" .menu="${e.menu}" .contextProvider="${()=>({url:window.location.pathname+window.location.search,screenTitle:document.title,appState:n,appData:r,componentState:t.state,componentData:t.data})}" @navigation-requested="${t.updateRoute}" @close-requested="${t.showHideIa}"></mateu-chat>`:x,_m=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},vm=(e,t,n)=>{let r=ym(e,t,n),i=Q(t,n);return r==`list`||r==i?`new`:r},ym=(e,t,n)=>{let r=e?._route;if(r!=null&&(r===``||r.startsWith(`/`))){let e=n.homeRoute??``,i=e.indexOf(`?`),a=i>=0?e.substring(i+1):``,o=Q(t,n)+r;return a?o+(o.indexOf(`?`)>=0?`&`:`?`)+a:o}return t.selectedRoute?t.selectedRoute:n.homeRoute},Q=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,bm=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:e.baseUrl||t.homeBaseUrl,xm=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,Sm=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,Cm=(e,t)=>`ux_`+((Q(e,t)||`root`)+`|`+(xm(e,t)??``)).replace(/[^a-zA-Z0-9]/g,`_`),wm=e=>fm({icon:e.sectionsOpen?`lumo:cross`:`lumo:menu`,label:Ht(`sections`),expanded:!!e.sectionsOpen,controls:`mateu-sections-panel`,cssClasses:`mateu-sections-toggle`+(e.sectionsOpen?` mateu-sections-toggle--open`:``),onClick:()=>{e.sectionsOpen=!e.sectionsOpen}}),Tm=(e,t,n)=>n.sectionsOpen?D`
    <div class="mateu-sections-scrim" @click="${()=>{n.sectionsOpen=!1}}"></div>
    <nav class="mateu-sections-panel" id="mateu-sections-panel" aria-label="${Ht(`sections`)}"
         @keydown="${e=>{e.key===`Escape`&&(n.sectionsOpen=!1)}}">
        ${e.filter(e=>!e.separator&&e.visible!==!1).map(e=>D`
            <button class="mateu-section-link ${e===t?`mateu-section-link--active`:``} ${e.unavailable?`mateu-nav-unavailable`:``}"
                    aria-current="${e===t?`page`:x}"
                    title="${e.unavailable?e.description??x:x}"
                    @click="${()=>n.selectSection(e)}">
                ${e.icon?L(e.icon,`width: var(--lumo-icon-size-s, 1.125rem); height: var(--lumo-icon-size-s, 1.125rem); flex-shrink: 0;`):x}
                <span>${e.label}</span>
            </button>`)}
    </nav>`:x,Em=(e,t)=>{if(!e)return x;let n=um(t,t.itemSelected),r=kn(e)?[]:t.mapItems(e.submenus??[],``);return D`
        <a href="javascript: void(0);" class="mateu-app-band-title mateu-section-title"
           @click="${()=>t.selectSection(e)}">${e.label}</a>
        ${r.length>0?cm(r,n,`menu-on-top sections-band`):x}`},Dm=(e,t,n,r,i,a,o)=>{let s=Cm(e,t);if(t.chromeless)return D`
            <div class="app chromeless">
                <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}" style="height: 100%;">
                    <div class="m-md">
                        <div class="m-scroll" style="height: 100%;">
                            <mateu-api-caller>
                                <mateu-ux
                                        data-content-view
                                        route="${ym(r,e,t)}"
                                        id="${s}"
                                        baseUrl="${bm(e,t)}"
                                        consumedRoute="${Q(e,t)}"
                                        serverSideType="${xm(e,t)}"
                                        uriPrefix="${Sm(e,t)}"
                                        style="width: 100%;"
                                        .appState="${a}"
                                        .appData="${o}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        </div>
                        ${gm(t,e,a,o)}
                    </div>
                </div>
                <slot></slot>
            </div>
        `;let c=e.mapItems(t.menu,e.filter?.toLowerCase()??``),l=Q(e,t),u=vm(r,e,t),d=u&&u!==`new`&&u.startsWith(l+`/`)?u.substring(l.length+1).split(`/`)[0]:void 0;return D`
                    ${t.variant==Fe.MEDIATOR?D`

                        ${t.layout==`SPLIT`?D`
                            <div class="m-md">
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            data-content-view
                                            route="${Q(e,t)}"
                                            id="${s}"
                                            baseUrl="${bm(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${xm(e,t)}"
                                            uriPrefix="${Sm(e,t)}"
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
                                            data-content-view
                                            route="${vm(r,e,t)}"
                                            id="${s}_detail"
                                            baseUrl="${bm(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${xm(e,t)}"
                                            uriPrefix="${Sm(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>

                            </div>
                        `:em(Xp(t.homeRoute),()=>D`
                            <mateu-api-caller>
                                <mateu-ux
                                        data-content-view
                                        route="${ym(r,e,t)}"
                                        id="${s}"
                                        baseUrl="${bm(e,t)}"
                                        consumedRoute="${Q(e,t)}"
                                        serverSideType="${xm(e,t)}"
                                        uriPrefix="${Sm(e,t)}"
                                        style="width: 100%;"
                                        .appState="${a}"
                                        .appData="${o}"
                                        .initialState="${r}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `)}
                        
`:x}
            ${t.variant==Fe.HAMBURGUER_MENU||t.variant==Fe.HAMBURGER_MENU?D`
                <div class="mateu-app-layout m-app-layout ${t.drawerClosed?``:`drawer-open`} ${t?.cssClasses}" style="${t?.style}">
                    <header class="app-navbar">
                        <button class="drawer-toggle" title="Menu"
                                @click="${e=>e.currentTarget.closest(`.m-app-layout`)?.classList.toggle(`drawer-open`)}">
                            ${L(`vaadin:menu`)}
                        </button>
                        <h2 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; margin: 0 .5rem;">${t.title}</h2><p style="margin: 0;">${t.subtitle}</p>
                        <div class="m-hl" style="margin-left: auto; align-items: center;">
                            ${hm(t,e)}
                        </div>
                    </header>
                    <div class="app-body">
                        <aside class="app-drawer p-s" @navigation-requested="${e.updateRoute}">
                            ${t.menu&&t.totalMenuOptions>10?D`
                                <div style="position: sticky; top: 0; z-index: 2; background: var(--lumo-base-color); padding: .25rem 0 .5rem;">
                                    <input class="drawer-search" placeholder="Search…" style="width: calc(100% - 20px); margin: 0 10px;"
                                           @input="${t=>_m({detail:{value:t.target.value}},e)}">
                                </div>
                                `:x}
                            <nav class="side-nav">
                                ${e.renderSideNav(c,void 0)}
                            </nav>
                        </aside>
                        <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}" style="flex: 1; min-width: 0;">
                            <div class="m-md">
                                <div class="m-scroll" style="height: 100%;">
                                    <mateu-api-caller>
                                        <mateu-ux
                                                data-content-view
                                                route="${ym(r,e,t)}"
                                                id="${s}"
                                                baseUrl="${bm(e,t)}"
                                                consumedRoute="${Q(e,t)}"
                                                serverSideType="${xm(e,t)}"
                                                uriPrefix="${Sm(e,t)}"
                                                style="width: 100%;"
                                                .appState="${a}"
                                                .appData="${o}"
                                                instant="${e.instant}"
                                                @navigation-requested="${e.updateRoute}"
                                        ></mateu-ux>
                                    </mateu-api-caller>
                                </div>
                                ${gm(t,e,a,o)}
                            </div>
                        </div>
                    </div>
                </div>

            `:x}
            
            ${t.variant==Fe.MENU_ON_TOP?D`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <!-- TWO BANDS, like the Redwood header: band 1 = the logo on the left and the
                         widgets on the right; band 2 = the app's title, then its menu as a horizontal
                         bar. A narrow viewport folds the menu into a ☰ button next to the title. -->
                    <div class="m-hl mateu-app-band1"
                            style="width: 100%; height: 3.5rem; flex-shrink: 0; align-items: center; background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${om}" style="${am}" theme="spacing">
                        <a href="javascript: void(0);" @click="${()=>e.goHome()}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                        ${im({...t,title:``},!1)}
                        </a>
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${hm(t,e)}
                        </div>
                    </div>
                    </div>
                    <nav class="mateu-app-band2" aria-label="${t.title||`Menu`}"
                            @navigation-requested="${e.updateRoute}">
                        <div class="mateu-app-menu-button">
                            ${lm(c,um(e,e.itemSelected))}
                        </div>
                        ${t.title?D`<a href="javascript: void(0);" @click="${()=>e.goHome()}" class="mateu-app-band-title">${t.title}</a>`:x}
                        ${(()=>{let t=um(e,e.itemSelected);return cm(c,t,`menu-on-top menu-band`)})()}
                    </nav>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll mateu-content-gutter" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${ym(r,e,t)}"
                                            id="${s}"
                                            baseUrl="${bm(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${xm(e,t)}"
                                            uriPrefix="${Sm(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${gm(t,e,a,o)}
                        </div>
                    </div>
                </div>

            `:x}

            ${t.variant==Fe.HAMBURGER_SECTIONS?(()=>{let n=e.activeSectionOf(t.menu);return D`
                <div class="m-vl mateu-sections-shell" style="width: 100%; height: 100vh; overflow: hidden; position: relative;">
                    <div class="m-hl mateu-app-band1"
                            style="width: 100%; height: 3.5rem; flex-shrink: 0; align-items: center; background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${om}" style="${am}" theme="spacing">
                        ${wm(e)}
                        <a href="javascript: void(0);" @click="${()=>{e.sectionsOpen=!1,e.goHome()}}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                        ${im(t,!1)}
                        </a>
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${hm(t,e)}
                        </div>
                    </div>
                    </div>
                    <nav class="mateu-app-band2 mateu-section-band ${n?``:`mateu-section-band--empty`}"
                            aria-label="${n?.label||t.title||`Menu`}" ?inert="${!n}"
                            @navigation-requested="${e.updateRoute}">
                        ${Em(n,e)}
                    </nav>
                    ${Tm(t.menu??[],n,e)}
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <div class="m-md">
                            <div class="m-scroll mateu-content-gutter" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${ym(r,e,t)}"
                                            id="${s}"
                                            baseUrl="${bm(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${xm(e,t)}"
                                            uriPrefix="${Sm(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${gm(t,e,a,o)}
                        </div>
                    </div>
                </div>
            `})():x}

            ${t.variant==Fe.TILES?D`
                <div class="m-vl" style="width: 100%; height: 100vh; overflow: hidden;">
                    <div class="m-hl"
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            @navigation-requested="${e.updateRoute}">
                    <div class="${om}" style="${am}" theme="spacing">
                        <a href="javascript: void(0);" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                        ${im(t)}
                        </a>
                        ${sm(e.mapItemsForTiles(t.menu),um(e,e.itemSelectedTiles),`menu-on-top`)}
                        <div class="m-hl mateu-app-widgets" style="margin-left: auto; align-items: center;">
                            ${hm(t,e)}
                        </div>
                    </div>
                    </div>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):D`
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${ym(r,e,t)}"
                                            id="${s}"
                                            baseUrl="${bm(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${xm(e,t)}"
                                            uriPrefix="${Sm(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${gm(t,e,a,o)}
                        </div>
                        `}
                    </div>
                </div>
            `:x}

            ${t.variant==Fe.RAIL?D`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):x}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${ym(r,e,t)}"
                                            id="${s}"
                                            baseUrl="${bm(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${xm(e,t)}"
                                            uriPrefix="${Sm(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${gm(t,e,a,o)}
                        </div>
                    </div>
                </div>
            `:x}

            ${t.variant==Fe.MENU_ON_LEFT?D`

                <div class="m-hl">
                    <div class="m-scroll" style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <div class="m-vl"
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(t=>e.renderOptionOnLeftMenu(t))}
                            ${mm(t,e)}${nm(t,e)}${pm(t,e)}
                        </div>
                    </div>
                    <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${ym(r,e,t)}"
                                            id="${s}"
                                            baseUrl="${bm(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${xm(e,t)}"
                                            uriPrefix="${Sm(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${gm(t,e,a,o)}
                        </div>
                    </div>
                </div>


            `:x}

            ${t.variant==Fe.TABS?D`
                <!--
                
                box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
                
                -->
                
                <div>
                    <div>
                        <div class="${om}" 
                                style="width: 100%; ${am} border-bottom: 1px solid var(--lumo-contrast-10pct);" 
                                theme="spacing"
                                @navigation-requested="${e.updateRoute}">
                            ${dm(t,e)}
                            <a href="javascript: void(0);" @click="${()=>e.goHome()}" class="mateu-app-brand" style="text-decoration: none; color: inherit;">
                            ${im(t)}
                            </a>
                            <nav class="mateu-tabs ${e.component?.cssClasses??``}" style="flex-grow: 1; min-width: 0; margin-left: 1.5rem;">
                                ${(t.menu?.length??0)<2?x:t.menu.map((n,r)=>D`
                                <button class="mateu-tab ${r===e.getSelectedIndex(t.menu)?`mateu-tab--active`:``}"
                                        @click="${()=>e.selectRoute(n.consumedRoute,n.route,n.actionId,n.baseUrl,n.serverSideType,n.uriPrefix,n.rules)}"
                                >${n.label}</button>`)}
                            </nav>
                            <div class="m-hl mateu-app-widgets" style="align-items: center;">
                                ${hm(t,e)}
                            </div>
                        </div>
                    </div>
                    <div role="main" class="${`app-content`+(e.pageCompact?` no-padding`:``)}">
                        <div class="m-md">
                            <div class="m-scroll" style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            data-content-view
                                            route="${ym(r,e,t)}"
                                            id="${s}"
                                            baseUrl="${bm(e,t)}"
                                            consumedRoute="${Q(e,t)}"
                                            serverSideType="${xm(e,t)}"
                                            uriPrefix="${Sm(e,t)}"
                                            style="width: 100%;"
                                            .appState="${a}"
                                            .appData="${o}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </div>
                            ${gm(t,e,a,o)}
                        </div>
                    </div>
                </div>
            
            `:x}

            ${t.fabs?.map((t,n)=>D`
                <button class="app-fab" style="${Uo(n)}" ${ts(`shell`,n)} aria-label="${t.label}"
                    @click="${()=>e.runAction(t.actionId)}"
                    title="${t.label}">
                    ${L(t.icon)}
                </button>
            `)}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},Om=class{renderFilterBar(e,t,n,r,i,a,o,s){let c=t?.metadata;return D`
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
                ${c?.header?.map(t=>I(e,t,n,r,i,a,o))}
            </mateu-filter-bar>
        `}renderPagination(e,t){return D`
        <mateu-pagination
                @page-changed="${e.pageChanged}"
                @fetch-more-elements="${e.fetchMoreElements}"
                .totalElements="${e.data[t?.id]?.page?.totalElements??0}"
                .pageSize="${e.data[t?.id]?.page?.pageSize??10}"
                data-testid="pagination"
                .pageNumber="${e.data[t?.id]?.page?.pageNumber??0}"
        ></mateu-pagination>
        `}renderTableComponent(e,t,n,r,i,a,o){return Na(t,(e.data?.[e.id])?.page?.content??[],r[t?.id]?.emptyStateMessage)}rendererName(){return this.constructor?.name??`unknown`}supportedClientSideTypes(){}renderClientSideComponent(e,t,n,r,i,a,o,s){let c=t?.metadata?.type??t?.type,l=Object.values(M).includes(c)?c:void 0;return Il(this.supportedClientSideTypes(),l)?Bl(t,l,this.rendererName()):uu(e,t,n,r,i,a,o,s)}renderAppComponent(e,t,n,r,i,a,o){return Dm(e,t?.metadata,n,r,i,a,o)}},km=(e,t,n,r,i,a,o)=>D`
        <vaadin-virtual-list
                .items="${t.metadata.page.content}"
                ${g(t=>D`${I(e,t,n,r,i,a,o)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??x}"
        ></vaadin-virtual-list>
    `,Am=e=>{let t=e.metadata;return D`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??x}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${c(()=>D`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>${t.text}</div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
    `},jm=(e,t={})=>{let n=e.metadata,r=n.valueKey?t[n.valueKey]:n.value;return D`
        <div style="${e.style}">
        <vaadin-progress-bar
                ?indeterminate="${n.indeterminate}"
                min="${n.min&&n.min!=0?n.min:x}"
                max="${n.max&&n.max!=0?n.max:x}"
                value="${r??x}"
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??x}"
        ></vaadin-progress-bar>
        ${n.text?D`<span class="text-secondary text-xs" id="sublbl">
    ${n.text}
  </span>`:x}
        </div>
    `},Mm=(e,t,n,r,i,a,o)=>{let s=t.metadata;return D`
        <vaadin-details
                ?opened="${s.opened}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??x}"
        >
            <vaadin-details-summary slot="summary">
            ${I(e,s.summary,n,r,i,a,o)}
            </vaadin-details-summary>
            ${I(e,s.content,n,r,i,a,o)}
        </vaadin-details>
            `},Nm=(e,t,n)=>{let r=e.metadata;return D`<vaadin-avatar
            img="${r.image}"
            name="${Dr(r.name,t,n)}"
            abbr="${r.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??x}"
    ></vaadin-avatar>`},Pm=e=>{let t=e.metadata;return D`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??x}">
    </vaadin-avatar-group>`},Fm=(e,t,n,r,i,a,o)=>{let s=t.metadata;if(!s)return D``;let c=``;return s.variants?.map(e=>e==`stretchMedia`?`stretch-media`:e==`coverMedia`?`cover-media`:e).forEach(e=>c+=` `+e),c=c.trim(),D`
        <vaadin-card
                style="${t.style}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??x}"
        >
            ${s.media?jr(e,s.media,n,r,i,a,o,`media`,!1):x}
            ${s.title?jr(e,s.title,n,r,i,a,o,`title`,!1):x}
            ${s.subtitle?jr(e,s.subtitle,n,r,i,a,o,`subtitle`,!1):x}
            ${s.header?jr(e,s.header,n,r,i,a,o,`header`,!1):x}
            ${s.headerPrefix?jr(e,s.headerPrefix,n,r,i,a,o,`header-prefix`,!1):x}
            ${s.headerSuffix?jr(e,s.headerSuffix,n,r,i,a,o,`header-suffix`,!1):x}
            ${s.footer?jr(e,s.footer,n,r,i,a,o,`footer`,!1):x}
            ${s.content?I(e,s.content,n,r,i,a,o,!1):x}
        </vaadin-card>
    `},Im=e=>e>0&&e<640?`accordion`:`tabs`,Lm=class extends S{constructor(...e){super(...e),this.tabLabels=[],this.mode=`tabs`,this.selected=0,this.selectedChangedListener=e=>{let t=e.detail?.value;typeof t==`number`&&t>=0&&(this.selected=t)}}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{for(let t of e)this.mode=Im(t.contentRect.width)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=void 0,this.detachTabsListener()}detachTabsListener(){this.slottedTabs?.removeEventListener(`selected-changed`,this.selectedChangedListener),this.slottedTabs=void 0}tabsSlotChanged(e){this.detachTabsListener();let t=e.target.assignedElements().find(e=>`selected`in e);t&&(this.slottedTabs=t,t.addEventListener(`selected-changed`,this.selectedChangedListener),t.selected=this.selected)}select(e){this.selected=e,this.slottedTabs&&(this.slottedTabs.selected=e)}updated(){this.slottedTabs&&this.slottedTabs.selected!=this.selected&&(this.slottedTabs.selected=this.selected)}static{this.styles=v`
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
    `}render(){return D`
            <div class="strip" ?hidden="${this.mode!=`tabs`}">
                <slot name="tabs" @slotchange="${this.tabsSlotChanged}"></slot>
            </div>
            ${this.mode==`tabs`?D`
                ${this.tabLabels.map((e,t)=>D`
                    <div class="panel" ?hidden="${t!=this.selected}">
                        <slot name="panel-${t}"></slot>
                    </div>
                `)}
            `:D`
                <div class="accordion" part="accordion">
                    ${this.tabLabels.map((e,t)=>D`
                        <div class="acc-item">
                            <button class="acc-header"
                                    aria-expanded="${t==this.selected}"
                                    aria-controls="acc-body-${t}"
                                    @click="${()=>this.select(t)}"
                            >
                                <span>${e??x}</span>
                                <span class="chevron">⟩</span>
                            </button>
                            <div class="acc-body" id="acc-body-${t}" ?hidden="${t!=this.selected}">
                                <slot name="panel-${t}"></slot>
                            </div>
                        </div>
                    `)}
                </div>
            `}
        `}};A([y({type:Array})],Lm.prototype,`tabLabels`,void 0),A([C()],Lm.prototype,`mode`,void 0),A([C()],Lm.prototype,`selected`,void 0),Lm=A([w(`mateu-adaptive-tabs`)],Lm);var Rm=(e,t,n)=>{let r=(e||``).replace(/\/+$/,``),i=r.split(`/`),a=i[i.length-1];return(t.includes(a)?i.slice(0,-1).join(`/`):r)+`/`+n},zm=(e,t)=>{let n=(e||``).replace(/\/+$/,``),r=n.substring(n.lastIndexOf(`/`)+1);return r?t.findIndex(e=>!!e&&e===r):-1},Bm=(e,t,n)=>{let r=t[n];if(!r||typeof window>`u`)return;let i=t.filter(e=>!!e),a=Rm(window.location.pathname,i,r);a!==window.location.pathname&&e.dispatchEvent(new CustomEvent(`url-update-requested`,{detail:{route:a},bubbles:!0,composed:!0}))},Vm=(e,t=``)=>{let n=Um(e)||`tabs`;return t?`${t}.${n}`:n},Hm=(e,t)=>`${e}-tab-${t}`,Um=e=>(e??``).trim().replace(/\s+/g,`_`),Wm=[],Gm=()=>Wm.length?Wm[Wm.length-1]:``,Km=(e,t)=>{Wm.push(e);try{return t()}finally{Wm.pop()}},qm=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style;c??=``,s.columnSpacing&&(c+=`--vaadin-form-layout-column-spacing: `+s.columnSpacing+`;`);let l=s.itemRowSpacing&&s.itemRowSpacing!==`0`?s.itemRowSpacing:`var(--lumo-space-m)`;return c+=`--vaadin-form-layout-row-spacing: `+l+`;`,s.itemLabelSpacing&&(c+=`--vaadin-form-layout-label-spacing: `+s.itemLabelSpacing+`;`),s.labelsAside&&(c+=`--vaadin-form-item-label-width: 10rem;`),s.fullWidth&&(c+=`width: 100%;`),D`
               <vaadin-form-layout 
                       .responsiveSteps="${s.responsiveSteps||x}"  
                       style="${c||x}" 
                       class="${t.cssClasses}"
                       max-columns="${s.maxColumns&&s.maxColumns>0?s.maxColumns:x}"
                       auto-responsive="${s.autoResponsive||x}"
                       column-width="${s.columnWidth||x}"
                       expand-columns="${s.expandColumns||x}"
                       expand-fields="${s.expandFields||!s.labelsAside||x}"
                       labels-aside="${s.labelsAside||x}"
                       slot="${t.slot||x}"
               >
                   ${t.children?.map(t=>Jm(s,e,t,n,r,i,a,o))}
               </vaadin-form-layout>
            `},Jm=(e,t,n,r,i,a,o,s)=>n.type==j.ClientSide&&n.metadata?.type==M.FormRow?Xm(e,t,n,r,i,a,o,s):e.labelsAside?Ym(t,n,r,i,a,o,s):I(t,n,r,i,a,o,s),Ym=(e,t,n,r,i,a,o)=>{if(t.type==j.ClientSide&&t.metadata?.type==M.FormField&&t.metadata.label){let s=t.metadata,c=s.label?.includes("${")?e._evalTemplate(s.label):s.label;return D`
                       <vaadin-form-item data-colspan="${s.colspan}">
                           <label slot="label">${c}</label>
                           ${I(e,t,n,r,i,a,o,!0)}
                       </vaadin-form-item>
                   `}return I(e,t,n,r,i,a,o)},Xm=(e,t,n,r,i,a,o,s)=>D`
        <vaadin-form-row>
            ${n.children?.map(n=>Jm(e,t,n,r,i,a,o,s))}
        </vaadin-form-row>
            `,Zm=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=(s.padding?` padding`:``)+(s.spacing?` spacing`:``)+(s.spacingVariant?` spacing-`+s.spacingVariant:``)+(s.wrap?` wrap`:``),l=t.style;return s.fullWidth&&(l=l?`width: 100%;`+l:`width: 100%;`),s.justification&&(l=l?`justify-content: `+s.justification+`;`+l:`justify-content: `+s.justification+`;`),s.verticalAlignment&&(l=l?`align-items: `+s.verticalAlignment+`;`+l:`align-items: `+s.verticalAlignment+`;`),D`
               <vaadin-horizontal-layout 
                       style="${l}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??x}"
               >
                   ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
               </vaadin-horizontal-layout>
            `},Qm=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=(s.padding?` padding`:``)+(s.spacing?` spacing`:``)+(s.spacingVariant?` spacing-`+s.spacingVariant:``)+(s.wrap?` wrap`:``),l=t.style;return s.fullWidth&&(l=l?`width: 100%;`+l:`width: 100%;`),s.justification&&(l=l?`justify-content: `+s.justification+`;`+l:`justify-content: `+s.justification+`;`),s.horizontalAlignment&&(l=l?`align-items: `+s.horizontalAlignment+`;`+l:`align-items: `+s.horizontalAlignment+`;`),D`
        <vaadin-vertical-layout
                style="${l}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??x}"
        >
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </vaadin-vertical-layout>
    `},$m=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style;return s.fullWidth&&(c=c?`width: 100%;`+c:`width: 100%;`),D`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${s.orientation??x}"
                       theme="${s.variant??x}"
                       slot="${t.slot??x}"
               >
                   <master-content>${I(e,t.children[0],n,r,i,a,o)}</master-content>
                   <detail-content>${I(e,t.children[1],n,r,i,a,o)}</detail-content>
               </vaadin-split-layout>
            `},eh=(e,t,n,r,i,a,o)=>{let s=t.children&&t.children.length>1?t.children[1]:null,c=i?.detailComponent??null,l=!!i?.hasDetail||!!s,u=c??s;return D`
               <vaadin-master-detail-layout ?has-detail="${l}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??x}">
                   <div>${I(e,t.children[0],n,r,i,a,o)}</div>
                   ${l&&u?D`<div slot="detail">${I(e,u,n,r,i,a,o)}</div>`:D`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},th=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style;c??=``,s.fullWidth&&(c+=`width: 100%;`);let l=s.variant;l==`equalWidth`&&(l=`equal-width-tabs`);let u=(t.children??[]).map(e=>e);if(u.length===1)return rh(e,u[0],n,r,i,a,o);let d=u.map(e=>e.metadata.routeKey),f=typeof window<`u`?zm(window.location.pathname,d):-1,p=f>=0?f:Math.max(0,u.findIndex(e=>e.metadata.active)),m=e=>{let t=e.target;t.__mateuTabsSettled=!1,t.selected=p,setTimeout(()=>{t.__mateuTabsSettled=!0})},h=d.some(e=>!!e)?e=>{let t=e.target;if(!t.__mateuTabsSettled)return;let n=e.detail?.value;typeof n==`number`&&n>=0&&Bm(t,d,n)}:void 0,g=Vm(t.id,Gm()),_=(t.children??[]).map((e,t)=>Hm(g,t));if(s.adaptable){let u=(t.children??[]).map(t=>{let n=t.metadata.label;return n?.includes("${")?e._evalTemplate(n):n});return D`
            <mateu-adaptive-tabs
                    .tabLabels="${u}"
                    style="${c}"
                    class="${t.cssClasses}"
                    slot="${t.slot??x}"
            >
                <vaadin-tabs slot="tabs"
                             theme="${l??x}"
                             orientation="${s.orientation??x}"
                             @items-changed=${m}
                             @selected-changed=${h??x}
                >
                    ${t.children?.map(e=>e).map((e,t)=>{let n=e.metadata.shortcut;return D`
                        <vaadin-tab id="${_[t]}"
                                    style="${e.style}"
                                    class="${e.cssClasses}"
                                    data-shortcut="${n??x}"
                        >${u[t]}${nh(e)}</vaadin-tab>`})}
                </vaadin-tabs>

                ${t.children?.map((t,s)=>D`
                    <div slot="panel-${s}" style="padding: var(--lumo-space-m) 0;">
                        ${Km(_[s],()=>t.children?.map(t=>I(e,t,n,r,i,a,o)))}
                    </div>`)}
            </mateu-adaptive-tabs>
                `}return D`
        <vaadin-tabsheet
                theme="${l??x}"
                style="${c}"
                slot="${t.slot??x}"
        >
            <vaadin-tabs slot="tabs"
                         style="${c}"
                         class="${t.cssClasses}"
                         orientation="${s.orientation??x}"
                         @items-changed=${m}
                         @selected-changed=${h??x}
            >
                ${t.children?.map(e=>e).map((t,n)=>{let r=t.metadata.label,i=r?.includes("${")?e._evalTemplate(r):r,a=t.metadata.shortcut;return D`
                    <vaadin-tab id="${_[n]}"
                                style="${t.style}"
                                class="${t.cssClasses}"
                                data-shortcut="${a??x}"
                    >${i}${nh(t)}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map((t,s)=>Km(_[s],()=>rh(e,t,n,r,i,a,o,_[s])))}
        </vaadin-tabsheet>
            `},nh=e=>{let t=e.metadata.badge;return t?D` <span theme="badge pill small contrast" style="margin-inline-start: .35em;">${t}</span>`:x},rh=(e,t,n,r,i,a,o,s)=>{let c=t.metadata.label,l=c?.includes("${")?e._evalTemplate(c):c;return D`
        <div tab="${s??l}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
               </div>
            `},ih=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=t.style;s.fullWidth&&(c=c?`width: 100%;`+c:`width: 100%;`);let l=0;if(t.children){for(let e=0;e<t.children.length;e++)if(t.children[e].metadata?.active){l=e;break}}return D`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${l}"
                       slot="${t.slot??x}"
               >
                   ${t.children?.map(t=>ah(e,t,n,r,i,a,o,s.variant))}
               </vaadin-accordion>
            `},ah=(e,t,n,r,i,a,o,s)=>{let c=t.metadata,l=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return D`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${s??x}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${l}</vaadin-accordion-heading>
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </vaadin-accordion-panel>
            `},oh=(e,t,n,r,i,a,o)=>D`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??x}">
                   ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
               </vaadin-scroller>
            `,sh=(e,t,n,r,i,a,o)=>D`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??x}">
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </vaadin-board>
            `,ch=(e,t,n,r,i,a,o)=>D`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
               </vaadin-board-row>
            `,lh=(e,t,n,r,i,a,o)=>{let s=t.metadata;return D`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${s.boardCols??x}"
        >
                   ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
               </div>
            `},uh=`mateu-nav-active`,dh=e=>e.selected===!0||(e.children??[]).some(dh),fh=e=>e.map(e=>dh(e)?{...e,className:[e.className,uh].filter(Boolean).join(` `)}:e),ph=(e,t,n)=>D`
    <vaadin-menu-bar
        theme="tertiary contrast"
        .items=${fh(e)}
        class="${n??x}"
        @item-selected=${e=>t(e.detail.value)}>
        <!-- an item's tooltip (a remote section that did not answer says why it is disabled) -->
        <vaadin-tooltip slot="tooltip"></vaadin-tooltip>
    </vaadin-menu-bar>`,mh=(e,t,n,r,i,a,o)=>{let s=t.metadata;return D`
        <vaadin-context-menu .items=${_h(e,s.menu,n,r,i,a,o)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${s.activateOnLeftClick?`click`:x}"
                             slot="${t.slot??x}">
            ${I(e,s.wrapped,n,r,i,a,o)}
        </vaadin-context-menu>
            `},hh=(e,t,n,r,i)=>{let a=t.metadata;return D`
        <vaadin-menu-bar .items=${_h(e,a.options,n,r,i,k,ge)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??x}">
        </vaadin-menu-bar>
            `},gh=(e,t,n,r,i,a,o)=>{let s=document.createElement(`vaadin-context-menu-item`);return te(I(e,t,n,r,i,a,o),s),s},_h=(e,t,n,r,i,a,o)=>t.map(t=>t.submenus?{text:t.component?void 0:t.label,route:t.path,checked:t.selected,disabled:t.disabled,className:t.className,component:t.component?gh(e,t.component,n,r,i,a,o):void 0,children:_h(e,t.submenus,n,r,i,a,o)}:t.separator?{component:`hr`}:{text:t.component?void 0:t.label,route:t.path,checked:t.selected,disabled:t.disabled,className:t.className,component:t.component?gh(e,t.component,n,r,i,a,o):void 0}),vh=class extends S{constructor(...e){super(...e),this.fieldId=``,this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{let t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;let n=t.getContext(`2d`);n.lineWidth=2,n.lineCap=`round`,n.lineJoin=`round`,n.strokeStyle=getComputedStyle(this).getPropertyValue(`--lumo-body-text-color`)||`#1a1a1a`;let[r,i]=this.pointerPosition(e);n.beginPath(),n.moveTo(r,i),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;let t=e.target.getContext(`2d`),[n,r]=this.pointerPosition(e);t.lineTo(n,r),t.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector(`canvas`)}pointerPosition(e){let t=e.target.getBoundingClientRect();return[e.clientX-t.left,e.clientY-t.top]}ensureCanvasSize(e){let t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){let e=this.canvas();e&&e.getContext(`2d`).clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){let e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL(`image/png`)))}renderPad(){return D`
            <canvas class="pad"
                    @pointerdown="${this.startStroke}"
                    @pointermove="${this.stroke}"
                    @pointerup="${this.endStroke}"
                    @pointercancel="${this.endStroke}"></canvas>
            <div class="actions">
                <button class="button" @click="${this.clear}">Clear</button>
                <button class="button button--primary" ?disabled="${!this.hasStrokes}"
                        @click="${this.accept}">Accept</button>
                ${this.value?D`
                    <button class="button" @click="${()=>{this.signing=!1}}">Cancel</button>`:x}
            </div>`}render(){let e=this.value!=null&&this.value!==``;return this.signing||!e?this.renderPad():D`
            <img class="preview" src="${this.value}" alt="Signature"/>
            <div class="actions">
                <button class="button" @click="${()=>{this.signing=!0,this.hasStrokes=!1,this.updateComplete.then(()=>this.clear())}}">Sign again</button>
                <button class="button button--danger" @click="${()=>this.emit(``)}">Delete</button>
            </div>`}static{this.styles=v`
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
    `}};A([y()],vh.prototype,`fieldId`,void 0),A([y()],vh.prototype,`value`,void 0),A([C()],vh.prototype,`signing`,void 0),A([C()],vh.prototype,`hasStrokes`,void 0),vh=A([w(`mateu-signature-pad`)],vh);var yh=class extends S{constructor(...e){super(...e),this.fieldId=``,this.options=[],this.leavesOnly=!1,this.opened=!1,this.expandedItems=[],this._normalized=[],this.dataProvider=(e,t)=>{let n=e.parentItem?e.parentItem.children??[]:this.normalized;t(n,n.length)}}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get normalized(){return this._optsSource!==this.options&&(this._optsSource=this.options,this._normalized=this.normalizeOptions(this.options??[])),this._normalized}normalizeOptions(e){return e.map(e=>{let t=e.children&&e.children.length?this.normalizeOptions(e.children):void 0;return{...e,children:t}})}ancestorsOf(e,t){for(let n of t){if(String(n.value)===e)return[];let t=n.children?this.ancestorsOf(e,n.children):null;if(t!=null)return[n,...t]}return null}labelOf(e,t){for(let n of t){if(String(n.value)===e)return n.label;let t=n.children?this.labelOf(e,n.children):null;if(t!=null)return t}return null}open(){this.opened||(this.expandedItems=this.value==null?[]:this.ancestorsOf(String(this.value),this.normalized)??[],this.opened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.close()},document.addEventListener(`mousedown`,this.outsideClick))}close(){this.detachOutsideClick(),this.opened=!1}detachOutsideClick(){this.outsideClick&&=(document.removeEventListener(`mousedown`,this.outsideClick),void 0)}pick(e){this.close(),this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e.value,fieldId:this.fieldId},bubbles:!0,composed:!0}))}clear(){this.close(),this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:void 0,fieldId:this.fieldId},bubbles:!0,composed:!0}))}onActiveItemChanged(e){let t=e.detail.value;if(t){if((t.children?.length??0)>0&&this.leavesOnly){this.expandedItems=this.expandedItems.includes(t)?this.expandedItems.filter(e=>e!==t):[...this.expandedItems,t],e.target.activeItem=null;return}this.pick(t)}}render(){let e=this.value!=null&&this.value!==``?this.labelOf(String(this.value),this.normalized)??String(this.value):``;return D`
            <div class="root">
                <vaadin-button class="control" theme="tertiary"
                               @click="${()=>this.opened?this.close():this.open()}">
                    <span class="${e?``:`placeholder`}">${e||`—`}</span>
                    <span class="chevron" slot="suffix" aria-hidden="true">▾</span>
                </vaadin-button>
                ${this.opened?D`
                    <div class="panel">
                        ${this.value?D`
                            <div class="clear-row">
                                <vaadin-button theme="tertiary small" @click="${this.clear}">— Clear</vaadin-button>
                            </div>`:x}
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
                    </div>`:x}
            </div>`}static{this.styles=v`
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
    `}};A([y()],yh.prototype,`fieldId`,void 0),A([y()],yh.prototype,`value`,void 0),A([y()],yh.prototype,`options`,void 0),A([y({type:Boolean})],yh.prototype,`leavesOnly`,void 0),A([C()],yh.prototype,`opened`,void 0),A([C()],yh.prototype,`expandedItems`,void 0),yh=A([w(`mateu-vaadin-tree-select`)],yh);var bh=class extends S{constructor(...e){super(...e),this.fieldId=``,this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{let t=e.target,n=t.files?.[0];if(!n)return;let r=new FileReader;r.onload=()=>this.emit(r.result),r.readAsDataURL(n),t.value=``}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:`environment`},audio:!1}),this.cameraOpen=!0,await this.updateComplete;let e=this.renderRoot.querySelector(`video`);e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){let e=this.renderRoot.querySelector(`video`);if(!e||e.videoWidth===0)return;let t=document.createElement(`canvas`);t.width=e.videoWidth,t.height=e.videoHeight,t.getContext(`2d`).drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL(`image/jpeg`,.9))}triggerFallback(){this.renderRoot.querySelector(`input[type=file]`)?.click()}render(){let e=this.value!=null&&this.value!==``;return D`
            <input type="file" accept="image/*" capture="environment" style="display: none;"
                   @change="${this.fileFallback}">
            ${this.cameraOpen?D`
                <video class="viewfinder" playsinline muted></video>
                <div class="actions">
                    <button class="button button--primary" @click="${this.shoot}">Capture</button>
                    <button class="button" @click="${this.closeCamera}">Cancel</button>
                </div>
            `:D`
                ${e?D`<img class="preview" src="${this.value}" alt="Photo"/>`:D`<div class="placeholder" aria-hidden="true">📷</div>`}
                <div class="actions">
                    <button class="button button--primary" @click="${this.openCamera}">
                        ${e?`Retake`:`Take photo`}
                    </button>
                    ${this.cameraError?D`
                        <button class="button" @click="${this.triggerFallback}">Use file / native camera</button>`:x}
                    ${e?D`
                        <button class="button button--danger" @click="${()=>this.emit(``)}">Delete</button>`:x}
                </div>
                ${this.cameraError?D`
                    <div class="error-hint">Camera unavailable — the file picker opens the device camera on phones.</div>`:x}
            `}`}static{this.styles=v`
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
    `}};A([y()],bh.prototype,`fieldId`,void 0),A([y()],bh.prototype,`value`,void 0),A([C()],bh.prototype,`cameraOpen`,void 0),A([C()],bh.prototype,`cameraError`,void 0),bh=A([w(`mateu-camera-capture`)],bh);var xh,Sh=(e,t)=>{if(!e)return;if(Array.isArray(e)){let n=e.find(e=>e.key==t);return n?.value==null?void 0:String(n.value)}let n=e[t];return n==null?void 0:String(n)},Ch=class extends S{static{xh=this}constructor(...e){super(...e),this.fieldId=``,this.editable=!0,this.filePicked=e=>{let t=e.target,n=t.files?.[0];if(!n)return;let r=new FileReader;r.onload=()=>{let e=r.result,t=e.indexOf(`,`),i=e.substring(0,t).replace(`;base64`,`;name=${encodeURIComponent(n.name)};base64`);this.emit(i+e.substring(t))},r.readAsDataURL(n),t.value=``}}static fileName(e){if(!e)return``;if(e.startsWith(`data:`)){let t=e.indexOf(`,`),n=e.substring(5,t<0?e.length:t).split(`;`).find(e=>e.startsWith(`name=`));if(n)try{return decodeURIComponent(n.substring(5))}catch{return n.substring(5)}return`Attached file`}return e.split(`/`).pop()||e}emit(e){this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}triggerPick(){this.renderRoot.querySelector(`input[type=file]`)?.click()}render(){let e=this.value!=null&&this.value!==``,t=xh.fileName(this.value),n=e&&this.value.startsWith(`data:`),r=e?D`<span class="file" title="${t}">📄 ${n?D`<a href="${this.value}" download="${t}">${t}</a>`:D`<a href="${this.value}" target="_blank">${t}</a>`}</span>`:x;return this.editable?D`
            <input type="file" accept="${this.accept||x}" style="display: none;"
                   @change="${this.filePicked}">
            <div class="row">
                ${r}
                <button class="button" @click="${this.triggerPick}">
                    ${e?`Replace`:`Choose file`}
                </button>
                ${e?D`
                    <button class="button button--danger" @click="${()=>this.emit(``)}">Remove</button>`:x}
            </div>`:D`${e?r:D`<span class="empty">—</span>`}`}static{this.styles=v`
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
    `}};A([y()],Ch.prototype,`fieldId`,void 0),A([y()],Ch.prototype,`value`,void 0),A([y()],Ch.prototype,`accept`,void 0),A([y({type:Boolean})],Ch.prototype,`editable`,void 0),Ch=xh=A([w(`mateu-file-upload`)],Ch);var wh=e=>e==null||typeof e==`string`&&e.trim()===``,Th=(e,t)=>{if(wh(e))return null;let n=t?parseInt(String(e),10):Number(e);return Number.isNaN(n)?null:n},Eh=(e,t)=>wh(e)&&wh(t)?!0:e==t,Dh=e=>!!e&&e.stereotype==`searchable`&&e.dataType==`array`,Oh=e=>e.endsWith(`-label`)?e.substring(0,e.length-6):e,kh=e=>e==null||e===``?[]:Array.isArray(e)?e.filter(e=>e!=null&&e!==``):e instanceof Set?[...e].filter(e=>e!=null&&e!==``):[e],Ah=(e,t)=>{let n=t&&typeof t==`object`?t:{};return e.map(e=>{let t=n[String(e)];return{id:e,label:String(t!=null&&t!==``?t:e)}})},jh=(e,t)=>e.filter(e=>String(e)!==String(t)),Mh=`3rem`;function Nh(e,t=!0){if(!t)return`flex: 0 0 ${Mh}; width: ${Mh}; min-width: ${Mh}; max-width: ${Mh};`;let n=(e??``).trim();return n?`flex: 0 0 min(${n}, 100%); width: min(${n}, 100%); min-width: min(${n}, 100%); max-width: min(${n}, 100%);`:``}function Ph(e){return(e??[]).map(e=>e?.open!==!1)}function Fh(e,t,n){let r=(n??[]).map(e=>e?.title??``).join(``);return e&&r===t&&e.length===(n??[]).length?{states:e,key:r}:{states:Ph(n),key:r}}function Ih(e,t){let n=Math.max(0,e.right-e.left);return t.map(t=>{let r=Math.max(0,t.right-t.left);return r===0||n===0?!1:Math.max(0,Math.min(t.right,e.right)-Math.max(t.left,e.left))>=Math.min(r,n)/2})}function Lh(e,t){if(!e?.readOnly)return!1;let n=new Set([`grid`,`fileUpload`,`image`,`uploadableImage`,`signature`,`camera`,`badge`,`bulletedList`,`html`,`richText`,`markdown`,`link`,`icon`,`color`,`stars`,`slider`,`toggle`,`popover`,`plainText`,`status`,`money`,`password`]);if(e.stereotype&&n.has(e.stereotype))return!1;let r=new Set([`status`,`money`,`bool`,`boolean`,`array`,`file`,`range`]);return!(e.dataType&&r.has(e.dataType))}function Rh(e,t){let n=t.toUpperCase(),r=e;for(;r;){if(r.tagName===n)return!0;r=r.parentNode??r.host??null}return!1}function zh(e,t){return e?{allRowsVisible:!0,theme:`wrap-cell-content`}:{allRowsVisible:t<10,theme:void 0}}function Bh(e){let t=e?.metadata;return!t||t.type===`GridGroupColumn`?e:{...e,metadata:{...t,width:`3rem`,autoWidth:!1,flexGrow:`1`,frozen:!1,frozenToEnd:!1}}}function Vh(e,t,n,r,i=[]){if(t===0||Math.abs(e)>=Math.abs(t))return null;let a=t>0;for(let e of i)if((a?e.scrollHeight-e.clientHeight-e.scrollTop:e.scrollTop)>1)return null;return r<=1||a&&n>=r-1||!a&&n<=1?null:t}var Hh=e=>!!e&&typeof e==`object`&&`__mateuGroup`in e,Uh=e=>String(e??``),Wh=(e,t,n)=>{let r=e??[];if(!t||!n||n.length===0)return r;let i=[],a,o=!1;return r.forEach((e,s)=>{let c=Uh(e?.[t]);if(!o||c!==a){let e=n.find(e=>Uh(e.value)===c)??{value:c,count:r.filter(e=>Uh(e?.[t])===c).length,aggregates:{}};i.push({__mateuGroup:e,__mateuGroupBy:t,_rowNumber:`__mateuGroup:${s}:${c}`}),o=!0,a=c}i.push(e)}),i},Gh=(e,t)=>e==null?``:t.dataType===`money`||t.stereotype===`money`?new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(e):t.aggregate===`count`?new Intl.NumberFormat(void 0,{maximumFractionDigits:0}).format(Math.round(e)):new Intl.NumberFormat(void 0,{maximumFractionDigits:2}).format(e),Kh=(e,t)=>e&&t.includes(e)?e:t.find(e=>!!e),qh=(e,t,n)=>{let r=e.__mateuGroup;return t.id===n?`${r.value} (${r.count})`:t.aggregate?Gh(r.aggregates?.[t.id],t):``},Jh=(e,t,n)=>{let r=t?.aggregates;if(!r||!e.some(e=>e.aggregate))return;let i={};e.forEach(e=>{e.aggregate&&r[e.id]!=null&&(i[e.id]=Gh(r[e.id],e))});let a=e[0];if(a&&i[a.id]===void 0){let e=t?.page?.totalElements;i[a.id]=n&&a.id===n&&e!=null?`Total (${e})`:`Total`}return i},Yh=(e,t,n)=>{let r=e[n.path]??``,i=t.captionPath?e[t.captionPath]:void 0,a=t.leadingPath?e[t.leadingPath]:void 0;return D`
        <span style="display: flex; align-items: center; gap: var(--lumo-space-s); overflow: hidden;">
            ${a?D`<img src="${a}" alt="" loading="lazy"
                style="width: 2rem; height: 2rem; border-radius: 50%; object-fit: cover; flex-shrink: 0;" />`:x}
            <span style="display: flex; flex-direction: column; overflow: hidden;">
                <span style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${Aa(r)}</span>
                ${i?D`<span style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${i}</span>`:x}
            </span>
        </span>`},Xh=(e,t,n)=>L(e[n.path]?`vaadin:check`:`vaadin:minus`,`height: 16px; width: 16px; color: var(--lumo-body-text-color);`),Zh=(e,t,n,r,i)=>{let a=e[n.path],o=a;return r==`money`&&a&&a.locale&&a.currency?o=new Intl.NumberFormat(a.locale,{style:`currency`,currency:a.currency}).format(a.value):i==`money`&&(o=new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(a)),D`${o}`},Qh=(e,t,n)=>{e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:n},bubbles:!0,composed:!0}))},$h=(e,t,n,r,i,a)=>{let o=n.xcolumn??a;if(o.text)return o.actionId?D`<a href="javascript: void(0);" @click="${t=>Qh(n,o,e)}">${o.text}</a>`:D`<a href="${e[n.path]}">${o.text}</a>`;if(r==`string`){if(o.actionId)return D`<a href="javascript: void(0);" @click="${t=>Qh(n,o,e)}">${e[n.path]}</a>`;let t=e[n.path];return D`<a href="${t}">${t}</a>`}let s=e[n.path];return D`<a href="${s.href}">${s.text}</a>`},eg=(e,t,n,r,i)=>{let a=e[n.path];return r==`string`?a.split(`,`).map(e=>L(e,`width: 16px;`)):a.split(`,`).map(e=>L(e.icon,`width: 16px;`))},tg=(e,t,n,r,i)=>{let a=e[n.path];return D`${N(a)}`},ng=(e,t,n,r,i,a)=>r==`string`?D`<img src="${e[n.path]}" style="${`max-height: 40px; `+(a.style??``)}">`:D`<img src="${e[n.path].src}" style="${a.style??``}">`,rg=e=>{let t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`action-on-row-`+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},ig=e=>{let t={_clickedRow:e.target.row},n=e.target.action;e.target?.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`action-on-row-`+n.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},ag=e=>{let t=document.createElement(`vaadin-context-menu-item`),n=document.createElement(`vaadin-icon`);return n.style.color=`var(--lumo-secondary-text-color)`,n.style.marginInlineEnd=`var(--lumo-space-s)`,n.style.padding=`var(--lumo-space-xs)`,n.setAttribute(`icon`,e.icon),t.appendChild(n),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},og=(e,t,n)=>{let r=e[n.path]?.actions;if(r?.length==1){let t=r[0];return D`
         <vaadin-button theme="tertiary${t.icon&&!t.label?` icon`:``}" title="${t.label||x}" ?disabled=${t.disabled}
                        @click="${ig}" .row="${e}" .action="${t}" data-testid="action-${n.path}">
             ${t.icon?D`<vaadin-icon icon="${t.icon}"></vaadin-icon>`:x}
             ${t.label?t.label:x}
         </vaadin-button>
    `}let i=r?.map(e=>e.icon?{component:ag(e),methodNameInCrud:e.methodNameInCrud}:{...e,text:e.label});return!i||i.length==0?D``:D`
                                     <vaadin-menu-bar
                                         .items=${[{text:`···`,children:i}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${n.path}"
                                         @item-selected="${rg}"
                                     ></vaadin-menu-bar>
                                   `},sg=(e,t,n)=>{if(n.path==`select`)return D`
         <vaadin-button theme="tertiary" title="Select" @click="${ig}" .row="${e}" .action="${{actionId:n.path,icon:``,label:`Select`,disabled:!1,methodNameInCrud:`select`}}">
             Select
         </vaadin-button>
    `;let r=n.path&&e[n.path]?.methodNameInCrud?e[n.path]:e.action;return r?D`
         <vaadin-button theme="tertiary${r.icon&&!r.label?` icon`:``}" title="${r.label||x}" @click="${ig}" .row="${e}" .action="${r}">
             ${r.icon?D`<vaadin-icon icon="${r.icon}"></vaadin-icon>`:x}
             ${r.label?r.label:x}
         </vaadin-button>
    `:D``},cg=(e,t,n)=>{e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:n},bubbles:!0,composed:!0}))},lg=(e,t,n,r,i,a)=>{let o=n.xcolumn??a;if(o.actionId)return D`
            <vaadin-button theme="tertiary" @click="${t=>cg(n,o,e)}" .row="${e}">
                ${o.text||Aa(e[n.path])}
            </vaadin-button>
        `;let s=e[n.path];return D`<a href="${s}">${o.text||s}</a>`},ug=(e,t,n,r,i,a,o,s,c)=>{let l=e[n.path];return I(r,l,i,a,o,s,c)},dg=new WeakMap,fg=(e,t)=>dg.get(e)?.[t],pg=(e,t,n)=>{let r=dg.get(e);r||(r={},dg.set(e,r)),r[t]=n},mg=(e,t=!1)=>Th(e,t),hg=(e,t,n,r)=>{let i=n?.field?.fieldId,a=a=>{if(e[t.id]===a||e[t.id]==null&&(a===``||a==null))return;if(e[t.id]=a,!i){n.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`update-row`,parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}let o=(n?.state??r)[i];n.dispatchEvent(new CustomEvent(`value-changed`,{detail:{fieldId:i,value:Array.isArray(o)?[...o]:o},bubbles:!0,composed:!0}))},o=e[t.id],s=o==null?``:String(o);switch(t.editorType){case`boolean`:return D`<vaadin-checkbox ?checked=${!!o} @checked-changed=${e=>a(e.detail.value)}></vaadin-checkbox>`;case`integer`:return D`<vaadin-integer-field theme="small" style="width:100%;" .value=${s} @change=${e=>a(mg(e.target.value,!0))}></vaadin-integer-field>`;case`number`:return D`<vaadin-number-field theme="small" style="width:100%;" .value=${s} @change=${e=>a(mg(e.target.value))}></vaadin-number-field>`;case`date`:return D`<vaadin-date-picker theme="small" style="width:100%;" .value=${s} @value-changed=${e=>a(e.detail.value)}></vaadin-date-picker>`;case`time`:return D`<vaadin-time-picker theme="small" style="width:100%;" .value=${s} @value-changed=${e=>a(e.detail.value)}></vaadin-time-picker>`;case`datetime`:return D`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${s} @value-changed=${e=>a(e.detail.value)}></vaadin-date-time-picker>`;case`select`:return D`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(e=>({label:e.label,value:String(e.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${s}
                @value-changed=${e=>a(e.detail.value)}></vaadin-combo-box>`;case`lookup`:{let r=n?.field?.fieldId,i=`search-${r}-${t.id}`,o=`${r}-${t.id}`;return D`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${(e,t)=>{n.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:i,parameters:{searchText:e.filter,size:e.pageSize,page:e.page},callback:e=>{let n=e?.fragments?.[0]?.data?.[o];t(n?.content??[],n?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${(t.editorOptions??[]).find(e=>String(e.value)===s)??(s?{value:s,label:fg(e,t.id)??s}:void 0)}
                @selected-item-changed=${n=>{let r=n.detail.value,i=r?r.value:null;String(i??``)!==s&&(r&&pg(e,t.id,r.label),a(i))}}></vaadin-combo-box>`}default:return D`<vaadin-text-field theme="small" style="width:100%;" .value=${s} @change=${e=>a(e.target.value)}></vaadin-text-field>`}},gg=e=>m(()=>D`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),_g=e=>e===void 0?x:d(()=>D`<span style="font-weight: 600; white-space: nowrap;">${e}</span>`,[e]),vg=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent(`sort-direction-changed`,{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},yg=(e,t,n,r,i,a,o,s)=>D`
<vaadin-grid-column-group header="${P(e.label,r,i)}">
    ${e.columns.map(e=>xg(e.metadata,t,n,r,i,a,o,s?.[e.metadata?.id]))}
</vaadin-grid-column-group>
`,bg=(e,t,n,r,i,a,o,s)=>M.GridGroupColumn==e.metadata?.type?yg(e.metadata,t,n,r,i,a,o,s):xg(e.metadata,t,n,r,i,a,o,s?.[e.metadata?.id]),xg=(e,n,r,i,a,o,s,c)=>{let l=P(e.label,i,a);return e.sortable?D`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??x}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??x}"
                                ?resizable="${e.resizable}"
                                width="${e.width??x}"
                                @direction-changed="${vg}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${gg(l)}
                                ${_g(c)}
                                ${t((t,c,l)=>Sg(t,c,l,e,n,r,i,a,o,s),[e,i,a])}
                        ></vaadin-grid-sort-column>
                    `:e.filterable?D`
                        <vaadin-grid-filter-column
                                path="${e.id}"
                                text-align="${e.align??x}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??x}"
                                ?resizable="${e.resizable}"
                                width="${e.width??x}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${gg(l)}
                                ${_g(c)}
                                ${t((t,c,l)=>Sg(t,c,l,e,n,r,i,a,o,s),[e,i,a])}
                        ></vaadin-grid-filter-column>
                    `:D`
                        <vaadin-grid-column
                                path="${e.id}"
                                text-align="${e.align??x}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??x}"
                                ?resizable="${e.resizable}"
                                width="${e.width??x}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                .xcolumn="${e}"
                                ${gg(l)}
                                ${_g(c)}
                                ${t((t,c,l)=>Sg(t,c,l,e,n,r,i,a,o,s),[e,i,a])}
                        ></vaadin-grid-column>
                    `},Sg=(e,t,n,r,i,a,o,s,c,l)=>{let u=n.dataset.dataType??``,d=n.dataset.stereotype??``;if(Hh(e)){let t=i?.metadata,n=(t?.columns??[]).flatMap(e=>e?.metadata?.type===M.GridGroupColumn?(e.metadata.columns??[]).map(e=>e?.metadata?.id):[e?.metadata?.id]),a=qh(e,r,Kh(e.__mateuGroupBy,n)),o=e.__mateuGroup.hiddenActions??[],s=r.id===n[n.length-1]?(t?.groupActions??[]).filter(e=>!o.includes(e.actionId??e.id)):[];return s.length?D`<span style="display: flex; align-items: center; justify-content: flex-end; gap: var(--lumo-space-s); overflow: hidden;">
                ${a?D`<span style="font-weight: 600;">${a}</span>`:x}
                ${s.map(t=>D`
                    <vaadin-button theme="tertiary small" style="flex-shrink: 0;"
                        @click="${n=>{n.stopPropagation(),n.currentTarget.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`action-on-row-`+(t.actionId??t.id),parameters:{_groupValue:e.__mateuGroup.value}},bubbles:!0,composed:!0}))}}">${t.label??t.caption??``}</vaadin-button>
                `)}
            </span>`:D`<span title="${a}" style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${a}</span>`}if(r.editable)return hg(e,r,i,o);if(u==`status`)return fu(e,t,n);if(d==`primary`)return Yh(e,r,n);if(u==`bool`)return Xh(e,t,n);if(u==`money`||d==`money`)return Zh(e,t,n,u,d);if(u==`link`||d==`link`)return $h(e,t,n,u,d,r);if(u==`icon`||d==`icon`)return eg(e,t,n,u,d);if(d==`html`)return tg(e,t,n,u,d);if(d==`image`)return ng(e,t,n,u,d,r);if(u==`menu`)return og(e,t,n);if(u==`component`)return ug(e,t,n,i,a,o,s,c,l);if(u==`action`)return sg(e,t,n);if(u==`actionGroup`)return og(e,t,n);if(d==`button`||r.actionId)return lg(e,t,n,u,d,r);let f=e[n.path],p=i?.metadata?.rowRoute;if(r.identifier&&p){let t=Fr(p,e,o,s);if(t)return D`<a href="${`/`+t.replace(/^\/+/,``)}" title="${f}"
                @click="${e=>{e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button!==0||(e.preventDefault(),Ir(i,t))}}"
                style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; color: var(--lumo-primary-text-color); text-decoration: none; cursor: pointer;"
                @mouseover="${e=>{e.currentTarget.style.textDecoration=`underline`}}"
                @mouseout="${e=>{e.currentTarget.style.textDecoration=`none`}}"
            >${Aa(f)}</a>`}return D`<span title="${f}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${Aa(f)}</span>`};function Cg(e,n){return D`
        <vaadin-grid-column
                width="2.25rem"
                flex-grow="0"
                ${t((t,{detailsOpened:r})=>e?.(t)?x:D`
                    <vaadin-icon
                            icon="${(n?n(t):r)?`lumo:angle-down`:`lumo:angle-right`}"
                            aria-hidden="true"
                            style="color: var(--lumo-secondary-text-color); width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"
                    ></vaadin-icon>`,[n])}
        ></vaadin-grid-column>`}var wg=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},Tg=(e,t)=>{let n=t;for(;n;){if(n===e)return!0;n=n.assignedSlot??n.parentNode??n.host??null}return!1},Eg=class extends ir{constructor(...e){super(...e),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{let t=e.currentTarget,n=t.getEventContext(e)?.item??null;n!==this.hoveredItem&&(this.hoveredItem=n,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?`hovered-cell`:``,this._onRowKey=e=>{let t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!Xa(t,e))return;let n=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!n)return;let r=this.currentItems(),i=parseInt(n[1],10)-1;i>=r.length||(e.preventDefault(),this.selectRow(r[i]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener(`keydown`,this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener(`keydown`,this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+`_selected_items`]=[e],this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;let e=wg();if(e&&e!==document.body&&!Tg(this,e)){let t=e.tagName?.toLowerCase()??``;if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith(`vaadin-`)&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){let{item:t,selected:n,shiftKey:r}=e.detail;if(this.rangeStartItem??=t,r){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);let[r,i]=[this.rangeStartItem,t].map(t=>e.indexOf(t)).sort((e,t)=>e-t),a=e.slice(r,i+1),o=new Set(this.selectedItems);a.forEach(e=>{n?o.add(e):o.delete(e)}),this.selectedItems=[...o],this.state[this.id+`_selected_items`]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);let t=this.state[this.field?.fieldId+`_show_detail`]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){let t=this.field.remoteCoordinates;this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((e,t)=>{e&&typeof e==`object`&&e._rowNumber===void 0&&(e._rowNumber=t)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith(`modal`)){let n=this;return D`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{n.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:n.field?.fieldId+`_cancel`},bubbles:!0,composed:!0}))}}"
                        ${s(()=>D`
                            <mateu-event-interceptor .target="${n}">
                                <div id="container" style="${this.field?.formStyle??`display: contents;`}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>de()])}
                ></vaadin-dialog>
                
            `}else{let n=this.field?.formPosition,r=n===`left`||n===`right`;return D`
            <div style="display: flex; flex-direction: ${r?`row`:`column`}; gap: var(--lumo-space-m, 1rem); width: 100%; ${t&&this.field?.minHeightWhenDetailVisible?`min-height: `+this.field?.minHeightWhenDetailVisible+`;`:``}">
                <div style="${r?`flex: 1; min-width: 0;`:`width: 100%;`}${n===`left`?` order: 2;`:``}">
                    ${this.renderMaster(e)}
                </div>
                <div style="${t?``:`display: none;`}${r?`flex: 1; min-width: 0;`:`width: 100%;`}${n===`left`?` order: 1;`:``}${this.field?.formStyle??``}">
                    <div id="container" style="padding: 0 2rem 2rem; background-color: var(--lumo-base-color);">
                        <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                    </div>
                </div>
            </div>`}}renderMaster(e){let r=this.selectedItems||[],i=zh(this.field?.readOnly,e?.length??0),a=this.field?.readOnly?(this.field?.columns??[]).map(Bh):this.field?.columns;return D`<vaadin-vertical-layout style="width: 100%;">
            <!-- The field label is rendered by the surrounding mateu-field wrapper; rendering it
                 here too would duplicate it (e.g. "Guests / Guests"). -->
            <vaadin-grid
                    ?clickable="${!!this.field?.onItemSelectionActionId}"
                    .cellPartNameGenerator="${E(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${E(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${E(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?`cursor: pointer;`:``}${this.field?.style??``}"
                    class="${this.field?.cssClasses}"
                    theme="${E(i.theme)}"
                    .items="${e}"
                    .selectedItems="${r}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${e=>{this.selectedItems=e.detail.value,this.state[this.id+`_selected_items`]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${E(this.field?.onItemSelectionActionId?e=>{if(e.composedPath().some(e=>e instanceof HTMLElement&&(e.localName===`vaadin-button`||e.localName===`button`||e.localName===`a`||e.localName===`vaadin-checkbox`||e.getAttribute?.(`role`)===`button`)))return;let t=e.currentTarget.getEventContext(e)?.item;t&&this.selectRow(t)}:void 0)}"
                    @active-item-changed="${E(this.field?.detailPath&&!this.field?.useButtonForDetail?e=>{if(this.field?.detailPath){let t=e.detail.value;t?this.detailsOpenedItems=[t]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${E(this.field?.detailPath?n(e=>D`${I(this,e[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${i.allRowsVisible}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:`No items added yet.`}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?x:D`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.detailPath&&!this.field?.useButtonForDetail?Cg():x}
                ${a?.map(e=>bg(e,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?D`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${t(e=>D`
                                <vaadin-button theme="tertiary icon error" title="Remove row"
                                    @click="${()=>{this.state[this.id+`_selected_items`]=[e],this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_remove`},bubbles:!0,composed:!0}))}}">
                                    <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                </vaadin-button>`,[])}
                    ></vaadin-grid-column>
                `:x}

                ${this.field?.useButtonForDetail?D`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${t((e,{detailsOpened:t})=>D`
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
                `:x}

            </vaadin-grid>
            ${this.field?.readOnly?x:this.field?.inlineEditing?D`
                    <vaadin-horizontal-layout theme="spacing">
                        <!-- Inline mode: rows are removed with the per-row trash button, so the
                             toolbar only needs the "add" action. -->
                        <vaadin-button theme="tertiary icon" title="Add row" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_add`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:plus"></vaadin-icon></vaadin-button>
                    </vaadin-horizontal-layout>
                `:D`
                    <vaadin-horizontal-layout theme="spacing">
                        <vaadin-button theme="tertiary icon" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_add`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:plus"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon error" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_remove`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:minus"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon" title="Move up" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_move-up`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:arrow-up"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon" title="Move down" @click="${()=>this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.id+`_move-down`},bubbles:!0,composed:!0}))}"><vaadin-icon icon="vaadin:arrow-down"></vaadin-icon></vaadin-button>
                    </vaadin-horizontal-layout>
                `}
        </vaadin-vertical-layout>`}static{this.styles=v`
        ${De}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `}};A([y()],Eg.prototype,`field`,void 0),A([y()],Eg.prototype,`state`,void 0),A([y()],Eg.prototype,`data`,void 0),A([y()],Eg.prototype,`appState`,void 0),A([y()],Eg.prototype,`appData`,void 0),A([y()],Eg.prototype,`selectedItems`,void 0),A([C()],Eg.prototype,`detailsOpenedItems`,void 0),Eg=A([w(`mateu-grid`)],Eg);var Dg=class extends S{constructor(...e){super(...e),this.getNewValue=e=>{if(this.field?.dataType==`array`){if(!this.value)return[e];let t=this.value;return t.indexOf(e)>=0?t.filter(t=>t!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){let t=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}return D`
        <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; ${this.field?.attributes?.divStyle}">
                                    ${e?.map(e=>D`
                            <div role="button" tabindex="0" 
                                    class="choice ${this.value==e.value||Array.isArray(this.value)&&this.value.includes(e.value)?`selected`:``}"
                                    @click="${()=>this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:this.getNewValue(e.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}" @keydown="${B(()=>this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:this.getNewValue(e.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))}"
                            >${e.description||e.image?D`
                                <div style="display: flex; align-items: center; gap: var(--lumo-space-m, 1rem);">
                                    ${e.image?D`
                                            <img src="${e.image}" alt="${e.label}" style="${e.imageStyle??`width: 2rem;`}" />
                                        `:x}
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

       `}static{this.styles=v`
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
  
        ${V}
    `}};A([y()],Dg.prototype,`field`,void 0),A([y()],Dg.prototype,`baseUrl`,void 0),A([y()],Dg.prototype,`state`,void 0),A([y()],Dg.prototype,`data`,void 0),A([y()],Dg.prototype,`value`,void 0),Dg=A([w(`mateu-choice`)],Dg);var Og,kg=class extends S{static{Og=this}constructor(...e){super(...e),this.commit=e=>{this.value=e,this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:{...e},fieldId:this.fieldId}}))},this.currencyChanged=e=>{let t=this.value??Og.EMPTY;!e.detail.value||e.detail.value===t.currency||this.commit({...t,currency:e.detail.value})},this.valueChanged=e=>{let t=this.value??Og.EMPTY,n=Th(e.detail.value,!1)??0;n!==t.value&&this.commit({...t,value:n})}}static{this.EMPTY={value:0,currency:`EUR`,locale:`es-ES`}}render(){return D`
            <vaadin-number-field
                    id="${this.fieldId}"
                    label="${this.label}"
                    @value-changed="${this.valueChanged}"
                    .value="${this.value?.value}"
                    .helperText="${this.helperText}"
                    ?autofocus="${this.autofocus}"
                    ?required="${this.required||x}"
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
       `}static{this.styles=v`
  `}};A([y()],kg.prototype,`fieldId`,void 0),A([y()],kg.prototype,`label`,void 0),A([y()],kg.prototype,`state`,void 0),A([y()],kg.prototype,`data`,void 0),A([y()],kg.prototype,`value`,void 0),A([y()],kg.prototype,`autoFocus`,void 0),A([y()],kg.prototype,`required`,void 0),A([y()],kg.prototype,`colspan`,void 0),A([y()],kg.prototype,`helperText`,void 0),kg=Og=A([w(`mateu-money-field`)],kg);var Ag=`vaadin:abacus.vaadin:absolute-position.vaadin:academy-cap.vaadin:accessibility.vaadin:accordion-menu.vaadin:add-dock.vaadin:adjust.vaadin:adobe-flash.vaadin:airplane.vaadin:alarm.vaadin:align-center.vaadin:align-justify.vaadin:align-left.vaadin:align-right.vaadin:alt-a.vaadin:alt.vaadin:ambulance.vaadin:anchor.vaadin:angle-double-down.vaadin:angle-double-left.vaadin:angle-double-right.vaadin:angle-double-up.vaadin:angle-down.vaadin:angle-left.vaadin:angle-right.vaadin:angle-up.vaadin:archive.vaadin:archives.vaadin:area-select.vaadin:arrow-backward.vaadin:arrow-circle-down-o.vaadin:arrow-circle-down.vaadin:arrow-circle-left-o.vaadin:arrow-circle-left.vaadin:arrow-circle-right-o.vaadin:arrow-circle-right.vaadin:arrow-circle-up-o.vaadin:arrow-circle-up.vaadin:arrow-down.vaadin:arrow-forward.vaadin:arrow-left.vaadin:arrow-long-down.vaadin:arrow-long-left.vaadin:arrow-right.vaadin:arrow-up.vaadin:arrows-cross.vaadin:arrows-long-h.vaadin:arrows-long-right.vaadin:arrows-long-up.vaadin:arrows-long-v.vaadin:arrows.vaadin:asterisk.vaadin:at.vaadin:automation.vaadin:backspace-a.vaadin:backspace.vaadin:backwards.vaadin:ban.vaadin:bar-chart-h.vaadin:bar-chart-v.vaadin:bar-chart.vaadin:barcode.vaadin:bed.vaadin:bell-o.vaadin:bell-slash-o.vaadin:bell-slash.vaadin:bell.vaadin:boat.vaadin:bold.vaadin:bolt.vaadin:bomb.vaadin:book-dollar.vaadin:book-percent.vaadin:book.vaadin:bookmark-o.vaadin:bookmark.vaadin:briefcase.vaadin:browser.vaadin:bug-o.vaadin:bug.vaadin:building-o.vaadin:building.vaadin:bullets.vaadin:bullseye.vaadin:bus.vaadin:buss.vaadin:button.vaadin:calc-book.vaadin:calc.vaadin:calendar-briefcase.vaadin:calendar-clock.vaadin:calendar-envelope.vaadin:calendar-o.vaadin:calendar-user.vaadin:calendar.vaadin:camera.vaadin:car.vaadin:caret-down.vaadin:caret-left.vaadin:caret-right.vaadin:caret-square-down-o.vaadin:caret-square-left-o.vaadin:caret-square-right-o.vaadin:caret-square-up-o.vaadin:caret-up.vaadin:cart-o.vaadin:cart.vaadin:cash.vaadin:chart-3d.vaadin:chart-grid.vaadin:chart-line.vaadin:chart-timeline.vaadin:chart.vaadin:chat.vaadin:check-circle-o.vaadin:check-circle.vaadin:check-square-o.vaadin:check-square.vaadin:check.vaadin:chevron-circle-down-o.vaadin:chevron-circle-down.vaadin:chevron-circle-left-o.vaadin:chevron-circle-left.vaadin:chevron-circle-right-o.vaadin:chevron-circle-right.vaadin:chevron-circle-up-o.vaadin:chevron-circle-up.vaadin:chevron-down-small.vaadin:chevron-down.vaadin:chevron-left-small.vaadin:chevron-left.vaadin:chevron-right-small.vaadin:chevron-right.vaadin:chevron-up-small.vaadin:chevron-up.vaadin:child.vaadin:circle-thin.vaadin:circle.vaadin:clipboard-check.vaadin:clipboard-cross.vaadin:clipboard-heart.vaadin:clipboard-pulse.vaadin:clipboard-text.vaadin:clipboard-user.vaadin:clipboard.vaadin:clock.vaadin:close-big.vaadin:close-circle-o.vaadin:close-circle.vaadin:close-small.vaadin:close.vaadin:cloud-download-o.vaadin:cloud-download.vaadin:cloud-o.vaadin:cloud-upload-o.vaadin:cloud-upload.vaadin:cloud.vaadin:cluster.vaadin:code.vaadin:coffee.vaadin:cog-o.vaadin:cog.vaadin:cogs.vaadin:coin-piles.vaadin:coins.vaadin:combobox.vaadin:comment-ellipsis-o.vaadin:comment-ellipsis.vaadin:comment-o.vaadin:comment.vaadin:comments-o.vaadin:comments.vaadin:compile.vaadin:compress-square.vaadin:compress.vaadin:connect-o.vaadin:connect.vaadin:controller.vaadin:copy-o.vaadin:copy.vaadin:copyright.vaadin:corner-lower-left.vaadin:corner-lower-right.vaadin:corner-upper-left.vaadin:corner-upper-right.vaadin:credit-card.vaadin:crop.vaadin:cross-cutlery.vaadin:crosshairs.vaadin:css.vaadin:ctrl-a.vaadin:ctrl.vaadin:cube.vaadin:cubes.vaadin:curly-brackets.vaadin:cursor-o.vaadin:cursor.vaadin:cutlery.vaadin:dashboard.vaadin:database.vaadin:date-input.vaadin:deindent.vaadin:del-a.vaadin:del.vaadin:dental-chair.vaadin:desktop.vaadin:diamond-o.vaadin:diamond.vaadin:diploma-scroll.vaadin:diploma.vaadin:disc.vaadin:doctor-briefcase.vaadin:doctor.vaadin:dollar.vaadin:dot-circle.vaadin:download-alt.vaadin:download.vaadin:drop.vaadin:edit.vaadin:eject.vaadin:elastic.vaadin:ellipsis-circle-o.vaadin:ellipsis-circle.vaadin:ellipsis-dots-h.vaadin:ellipsis-dots-v.vaadin:ellipsis-h.vaadin:ellipsis-v.vaadin:enter-arrow.vaadin:enter.vaadin:envelope-o.vaadin:envelope-open-o.vaadin:envelope-open.vaadin:envelope.vaadin:envelopes-o.vaadin:envelopes.vaadin:eraser.vaadin:esc-a.vaadin:esc.vaadin:euro.vaadin:exchange.vaadin:exclamation-circle-o.vaadin:exclamation-circle.vaadin:exclamation.vaadin:exit-o.vaadin:exit.vaadin:expand-full.vaadin:expand-square.vaadin:expand.vaadin:external-browser.vaadin:external-link.vaadin:eye-slash.vaadin:eye.vaadin:eyedropper.vaadin:facebook-square.vaadin:facebook.vaadin:factory.vaadin:family.vaadin:fast-backward.vaadin:fast-forward.vaadin:female.vaadin:file-add.vaadin:file-code.vaadin:file-font.vaadin:file-movie.vaadin:file-o.vaadin:file-picture.vaadin:file-presentation.vaadin:file-process.vaadin:file-refresh.vaadin:file-remove.vaadin:file-search.vaadin:file-sound.vaadin:file-start.vaadin:file-table.vaadin:file-text-o.vaadin:file-text.vaadin:file-tree-small.vaadin:file-tree-sub.vaadin:file-tree.vaadin:file-zip.vaadin:file.vaadin:fill.vaadin:film.vaadin:filter.vaadin:fire.vaadin:flag-checkered.vaadin:flag-o.vaadin:flag.vaadin:flash.vaadin:flask.vaadin:flight-landing.vaadin:flight-takeoff.vaadin:flip-h.vaadin:flip-v.vaadin:folder-add.vaadin:folder-o.vaadin:folder-open-o.vaadin:folder-open.vaadin:folder-remove.vaadin:folder-search.vaadin:folder.vaadin:font.vaadin:form.vaadin:forward.vaadin:frown-o.vaadin:funcion.vaadin:function.vaadin:funnel.vaadin:gamepad.vaadin:gavel.vaadin:gift.vaadin:glass.vaadin:glasses.vaadin:globe-wire.vaadin:globe.vaadin:golf.vaadin:google-plus-square.vaadin:google-plus.vaadin:grab.vaadin:grid-bevel.vaadin:grid-big-o.vaadin:grid-big.vaadin:grid-h.vaadin:grid-small-o.vaadin:grid-small.vaadin:grid-v.vaadin:grid.vaadin:group.vaadin:hammer.vaadin:hand.vaadin:handle-corner.vaadin:hands-up.vaadin:handshake.vaadin:harddrive-o.vaadin:harddrive.vaadin:hash.vaadin:header.vaadin:headphones.vaadin:headset.vaadin:health-card.vaadin:heart-o.vaadin:heart.vaadin:home-o.vaadin:home.vaadin:hospital.vaadin:hourglass-empty.vaadin:hourglass-end.vaadin:hourglass-start.vaadin:hourglass.vaadin:inbox.vaadin:indent.vaadin:info-circle-o.vaadin:info-circle.vaadin:info.vaadin:input.vaadin:insert.vaadin:institution.vaadin:invoice.vaadin:italic.vaadin:key-o.vaadin:key.vaadin:keyboard-o.vaadin:keyboard.vaadin:laptop.vaadin:layout.vaadin:level-down-bold.vaadin:level-down.vaadin:level-left-bold.vaadin:level-left.vaadin:level-right-bold.vaadin:level-right.vaadin:level-up-bold.vaadin:level-up.vaadin:lifebuoy.vaadin:lightbulb.vaadin:line-bar-chart.vaadin:line-chart.vaadin:line-h.vaadin:line-v.vaadin:lines-list.vaadin:lines.vaadin:link.vaadin:list-ol.vaadin:list-select.vaadin:list-ul.vaadin:list.vaadin:location-arrow-circle-o.vaadin:location-arrow-circle.vaadin:location-arrow.vaadin:lock.vaadin:magic.vaadin:magnet.vaadin:mailbox.vaadin:male.vaadin:map-marker.vaadin:margin-bottom.vaadin:margin-left.vaadin:margin-right.vaadin:margin-top.vaadin:margin.vaadin:medal.vaadin:megafone.vaadin:megaphone.vaadin:meh-o.vaadin:menu.vaadin:microphone.vaadin:minus-circle-o.vaadin:minus-circle.vaadin:minus-square-o.vaadin:minus.vaadin:mobile-browser.vaadin:mobile-retro.vaadin:mobile.vaadin:modal-list.vaadin:modal.vaadin:money-deposit.vaadin:money-exchange.vaadin:money-withdraw.vaadin:money.vaadin:moon-o.vaadin:moon.vaadin:morning.vaadin:movie.vaadin:music.vaadin:mute.vaadin:native-button.vaadin:newspaper.vaadin:notebook.vaadin:nurse.vaadin:office.vaadin:open-book.vaadin:option-a.vaadin:option.vaadin:options.vaadin:orientation.vaadin:out.vaadin:outbox.vaadin:package.vaadin:padding-bottom.vaadin:padding-left.vaadin:padding-right.vaadin:padding-top.vaadin:padding.vaadin:paint-roll.vaadin:paintbrush.vaadin:palete.vaadin:palette.vaadin:panel.vaadin:paperclip.vaadin:paperplane-o.vaadin:paperplane.vaadin:paragraph.vaadin:password.vaadin:paste.vaadin:pause.vaadin:pencil.vaadin:phone-landline.vaadin:phone.vaadin:picture.vaadin:pie-bar-chart.vaadin:pie-chart.vaadin:piggy-bank-coin.vaadin:piggy-bank.vaadin:pill.vaadin:pills.vaadin:pin-post.vaadin:pin.vaadin:play-circle-o.vaadin:play-circle.vaadin:play.vaadin:plug.vaadin:plus-circle-o.vaadin:plus-circle.vaadin:plus-minus.vaadin:plus-square-o.vaadin:plus.vaadin:pointer.vaadin:power-off.vaadin:presentation.vaadin:print.vaadin:progressbar.vaadin:puzzle-piece.vaadin:pyramid-chart.vaadin:qrcode.vaadin:question-circle-o.vaadin:question-circle.vaadin:question.vaadin:quote-left.vaadin:quote-right.vaadin:random.vaadin:raster-lower-left.vaadin:raster.vaadin:records.vaadin:recycle.vaadin:refresh.vaadin:reply-all.vaadin:reply.vaadin:resize-h.vaadin:resize-v.vaadin:retweet.vaadin:rhombus.vaadin:road-branch.vaadin:road-branches.vaadin:road-split.vaadin:road.vaadin:rocket.vaadin:rotate-left.vaadin:rotate-right.vaadin:rss-square.vaadin:rss.vaadin:safe-lock.vaadin:safe.vaadin:scale-unbalance.vaadin:scale.vaadin:scatter-chart.vaadin:scissors.vaadin:screwdriver.vaadin:search-minus.vaadin:search-plus.vaadin:search.vaadin:select.vaadin:server.vaadin:share-square.vaadin:share.vaadin:shield.vaadin:shift-arrow.vaadin:shift.vaadin:shop.vaadin:sign-in-alt.vaadin:sign-in.vaadin:sign-out-alt.vaadin:sign-out.vaadin:signal.vaadin:sitemap.vaadin:slider.vaadin:sliders.vaadin:smiley-o.vaadin:sort.vaadin:sound-disable.vaadin:spark-line.vaadin:specialist.vaadin:spinner-arc.vaadin:spinner-third.vaadin:spinner.vaadin:spline-area-chart.vaadin:spline-chart.vaadin:split-h.vaadin:split-v.vaadin:split.vaadin:spoon.vaadin:square-shadow.vaadin:star-half-left-o.vaadin:star-half-left.vaadin:star-half-right-o.vaadin:star-half-right.vaadin:star-o.vaadin:star.vaadin:start-cog.vaadin:step-backward.vaadin:step-forward.vaadin:stethoscope.vaadin:stock.vaadin:stop-cog.vaadin:stop.vaadin:stopwatch.vaadin:storage.vaadin:strikethrough.vaadin:subscript.vaadin:suitcase.vaadin:sun-down.vaadin:sun-o.vaadin:sun-rise.vaadin:superscript.vaadin:sword.vaadin:tab-a.vaadin:tab.vaadin:table.vaadin:tablet.vaadin:tabs.vaadin:tag.vaadin:tags.vaadin:tasks.vaadin:taxi.vaadin:teeth.vaadin:terminal.vaadin:text-height.vaadin:text-input.vaadin:text-label.vaadin:text-width.vaadin:thin-square.vaadin:thumbs-down-o.vaadin:thumbs-down.vaadin:thumbs-up-o.vaadin:thumbs-up.vaadin:ticket.vaadin:time-backward.vaadin:time-forward.vaadin:timer.vaadin:toolbox.vaadin:tools.vaadin:tooth.vaadin:touch.vaadin:train.vaadin:trash.vaadin:tree-table.vaadin:trendind-down.vaadin:trending-down.vaadin:trending-up.vaadin:trophy.vaadin:truck.vaadin:twin-col-select.vaadin:twitter-square.vaadin:twitter.vaadin:umbrella.vaadin:underline.vaadin:unlink.vaadin:unlock.vaadin:upload-alt.vaadin:upload.vaadin:user-card.vaadin:user-check.vaadin:user-clock.vaadin:user-heart.vaadin:user-star.vaadin:user.vaadin:users.vaadin:vaadin-h.vaadin:vaadin-v.vaadin:viewport.vaadin:vimeo-square.vaadin:vimeo.vaadin:volume-down.vaadin:volume-off.vaadin:volume-up.vaadin:volume.vaadin:wallet.vaadin:warning.vaadin:workplace.vaadin:wrench.vaadin:youtube-square.vaadin:youtube`.split(`.`),jg=null,Mg=()=>(jg||=Promise.all([O(()=>import(`./vendor-ui5.js`).then(e=>e.n),__vite__mapDeps([5,1])),O(()=>import(`./vendor-ui5.js`).then(e=>e.t),__vite__mapDeps([5,1]))]),jg),$=class extends S{constructor(...e){super(...e),this.inFoldout=!1,this.ui5FieldComponentsReady=!1,this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter=``,this.rendered=!1,this.renderColorPicker=()=>{this.loadUi5FieldComponents();let e=this.field?.fieldId;return D`
            <ui5-color-picker value="${this.state&&e in this.state?this.state[e]:this.field?.initialValue}" @change="${e=>this.colorPickerValue=e.target.value}">Picker</ui5-color-picker>
        `},this.saveColor=()=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:this.colorPickerValue,fieldId:this.field.fieldId},bubbles:!0,composed:!0})),this.colorPickerOpened=!1},this.renderColorPickerFooter=()=>D`<vaadin-button @click="${()=>this.colorPickerOpened=!1}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`,this.checked=e=>{let t=e.target;this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t.checked,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))},this.convert=e=>this.field?.dataType==`integer`?Th(e,!0):e,this.multiComboBoxValueChanged=e=>{if(this.rendered){let t=this.field?.fieldId,n=this.state&&t in this.state?this.state[t]:this.field?.initialValue,r;e.detail.value&&(r=e.detail.value.map(e=>e.value),r&&r.length>0&&(this.data[this.id]||(this.data[this.id]={}),this.data[this.id].content||(this.data[this.id].content=[]),this.data[this.id]&&this.data[this.id].content&&e.detail.value.forEach(e=>{this.data[this.id].content?.find(t=>e.value==t.value)||this.data[this.id].content.push(e)}))),this.compareArrays(r,n)||this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:r,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.valueChanged=e=>{this.rendered&&e.detail.value!==void 0&&!Eh(e.detail.value,this.state[this.field.fieldId])&&this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:this.convert(e.detail.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.selectedItems=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.comboData&&this.comboData.length>0)return this.comboData?.filter(t=>e.indexOf(t.value)>=0);if(this.data[this.id]&&this.data[this.id].content&&this.data[this.id].content.length>0)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0)}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0);return[]},this.selectedIndex=e=>{if(e)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){let t=this.data[this.id].content.find(t=>t.value==e);if(t)return this.data[this.id].content.indexOf(t)}}else{let t=this.field?.options?.find(t=>t.value==e);if(t)return this.field?.options?.indexOf(t)}},this.selectedIndexes=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0).map(e=>this.data[this.id].content.indexOf(e))}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0).map(e=>this.field?.options?.indexOf(e));return[]},this.compareArrays=(e,t)=>this.falsy(e)&&this.falsy(t)||e&&t&&e.length===t.length&&e.every((e,n)=>e===t[n]),this.falsy=e=>!e||e.length==0,this.listItemsSelected=e=>{let t=this.field?.fieldId,n=this.state&&t in this.state?this.state[t]:this.field?.initialValue,r;this.rendered&&(e.detail.value&&(this.field?.remoteCoordinates?this.data[this.id]&&this.data[this.id].content&&(r=e.detail.value.map(e=>this.data[this.id].content[e].value)):r=e.detail.value.map(e=>this.field.options[e].value)),this.compareArrays(r,n)||this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:r,fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))},this.listItemSelected=e=>{let t;if(e.detail.value||e.detail.value==0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){let n=this.data[this.id].content[e.detail.value];n&&(t=n.value)}}else{let n=this.field.options[e.detail.value];n&&(t=n.value)}this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.mapPosition=e=>{switch(e){case`topStretch`:return`top-stretch`;case`topStart`:return`top-start`;case`topCenter`:return`top-center`;case`topEnd`:return`top-end`;case`middle`:return`middle`;case`bottomStart`:return`bottom-start`;case`bottomEnd`:return`bottom-end`;case`bottomStretch`:return`bottom-stretch`;case`bottomCenter`:return`bottom-center`}return`bottom-end`},this.helperShownInControl=!1,this.lastAnnouncedError=``,this.controlOwnsValidity=!1,this.fileUploaded=e=>{let t=this.field?.fieldId??``,n=this.state[t];n.push({id:e.detail.xhr.responseText,name:e.detail.file.name}),this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:n,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.fileChanged=e=>{let t=this.field?.fieldId??``,n=(e.detail.value??[]).filter(e=>e.id).map(e=>e.id),r=(this.state[t]??[]).map(e=>e.id);if(!this.compareArrays(r,n)){let t=(e.detail.value??[]).filter(e=>e.id).map(e=>({id:e.id,name:e.name}));this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.triggerImageUpload=()=>{(this.renderRoot?.querySelector(`input[type="file"]`))?.click()},this.imageUpload=e=>{let t=e.target,n=t.files?.[0];if(!n)return;let r=new FileReader;r.onload=()=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:r.result,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},r.readAsDataURL(n),t.value=``},this.imageDelete=()=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:``,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.iconComboboxRenderer=e=>D`
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
`,this.comboRenderer=e=>D`
        ${e.description||e.image||e.icon?D`
            <vaadin-horizontal-layout theme="spacing">
                ${e.icon?D`<div><vaadin-icon icon="${e.icon}"></vaadin-icon></div>
                                    `:x}
                ${e.image?D`
                    <div>
                    <img
                            style="width: var(--lumo-size-m); margin-right: var(--lumo-space-s);"
                            src="${e.image}"
                            alt="${e.label}"
                    />
                    </div>
                                        `:x}
                <div>
                    ${e.label}
                    ${e.description?D`
            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);">
                ${e.description}
            </div>
        `:x}
                </div>

            </vaadin-horizontal-layout>
                            `:e.label}
`,this.filteredIcons=[],this.navLinkOffset=null,this.iconFilterChanged=e=>{this.filteredIcons=Ag.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}connectedCallback(){super.connectedCallback(),this.inFoldout=Rh(this,`mateu-vaadin-foldout`)}loadUi5FieldComponents(){this.ui5FieldComponentsReady||Mg().then(()=>{this.ui5FieldComponentsReady=!0})}remoteComboDataProvider(e){return(t,n)=>{let{filter:i,page:a,pageSize:o}=t,s=i??``;this._comboFilter=s,this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{searchText:i,fieldId:this.field?.fieldId,size:o,page:a,sort:void 0},callback:e=>{if(s===this._comboFilter)if(e?.messages?.forEach(e=>{r.show(e.text,{position:e.position?this.mapPosition(e.position):void 0,theme:e.variant,duration:e.duration})}),!e.fragments||e.fragments.length==0)this.comboData=[],n([],0);else{let t=e.fragments[0].data?.[this.id];this.comboData=t?.content,n(t?.content,t?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}renderNavLink(){let e=this.field?.link;if(!e?.href)return x;let t=P(e.href,this.state,this.data)??e.href,n=P(e.title,this.state,this.data)||t,r=e.icon||(t.startsWith(`http`)?`vaadin:external-link`:`vaadin:link`),i=this.navLinkOffset??`calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)`;return D`<a
                data-navlink
                href="${t}"
                title="${n}"
                target="${E(e.target||void 0)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${i};"
        ><vaadin-icon icon="${r}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`}positionNavLink(){let e=this.renderRoot?.querySelector(`a[data-navlink]`);e&&setTimeout(()=>{let t=e.parentElement,n=t?.firstElementChild?.firstElementChild;if(!t||!n)return;let r=(n.shadowRoot?.querySelector(`[part="input-field"]`)??n).getBoundingClientRect();if(r.height===0)return;let i=Math.max(0,r.top+r.height/2-e.offsetHeight/2-t.getBoundingClientRect().top),a=`${Math.round(i)}px`;this.navLinkOffset!==a&&(this.navLinkOffset=a)})}helperText(){return this.helperShownInControl=!0,Dr(this.field?.description??``,this.state,this.data)??``}fieldErrors(){let e=this.field?.fieldId??``,t=this.data?.errors?.[e];return Array.isArray(t)?t.filter(e=>!!e):[]}validatableControl(){let e=this.renderRoot.querySelectorAll(`*`);for(let t of e)if(`invalid`in t&&`errorMessage`in t)return t;return null}applyValidationState(){let e=this.fieldErrors(),t=this.validatableControl();if(!t){this.lastAnnouncedError=e.join(`. `);return}let n=e.join(`. `);if(t.errorMessage=n,t.invalid=e.length>0,n&&n!==this.lastAnnouncedError){let e=(this.field?.label??``).toString().trim();tr(e?`${e}: ${n}`:n,{politeness:`assertive`})}this.lastAnnouncedError=n}render(){this.rendered=!0;let e=this.renderNavLink();this.helperShownInControl=!1;let t=this.renderField(),n=this.field?.description&&!this.helperShownInControl?Dr(this.field.description,this.state,this.data):void 0,r=this.fieldErrors(),i=r.length>0&&!this.controlOwnsValidity;return D`<div style="display: block;">
            <div style="${e===x?``:`display: flex; gap: var(--lumo-space-xs);`}"><div style="flex: 1; min-width: 0;">${t}</div>${e}</div>
            ${n?D`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${n}</div>
            `:x}
            ${i?D`
                <div role="alert"><ul>${r.map(e=>D`<li>${e}</li>`)}</ul></div>
            `:x}
        </div>`}async firstUpdated(){this.filteredIcons=Ag}update(e){e.has(`component`)&&(this.rendered=!1),super.update(e)}updated(e){super.updated(e),this.positionNavLink(),this.applyValidationState(),this.controlOwnsValidity=!!this.validatableControl()}renderField(){let e=this.field?.fieldId??``,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,n=P(this.field?.label+``,this.state,this.data),r=this.labelAlreadyRendered||!n||n==`null`?x:n;return this.field?.propertyRow?this.renderPropertyRowField(e,t,r,n):this.field?.stereotype==`badge`?this.renderBadgeField(e,t,r,n):this.field?.stereotype==`plainText`?this.renderPlainTextField(e,t,r,n):this.field?.stereotype==`bulletedList`?this.renderBulletedListField(e,t,r,n):Dh(this.field)?this.renderSearchableMultiField(e,t,r):Lh(this.field,this.inFoldout)?this.renderFoldoutReadOnlyField(t,r):this.field?.readOnly&&this.field.stereotype!=`grid`&&this.field.dataType!=`status`&&this.field?.dataType!=`money`?this.renderReadOnlyField(e,t,r,n):this.field?.dataType==`file`?this.renderFileField(e,t,r,n):this.field?.dataType==`string`?this.renderStringField(e,t,r,n):this.field?.dataType==`number`?this.renderNumberField(e,t,r,n):this.field?.dataType==`integer`?this.renderIntegerField(e,t,r,n):this.field?.dataType==`bool`||this.field?.dataType==`boolean`?this.renderBoolField(e,t,r,n):this.field?.dataType==`dateRange`?this.renderDateRangeField(e,t,r,n):this.field?.dataType==`date`?this.renderDateField(e,t,r,n):this.field?.dataType==`dateTime`?this.renderDateTimeField(e,t,r,n):this.field?.dataType==`time`?this.renderTimeField(e,t,r,n):this.field?.dataType==`array`?this.renderArrayField(e,t,r,n):this.field?.dataType==`money`?this.renderMoneyField(e,t,r,n):this.field?.dataType==`status`?this.renderStatusField(e,t,r,n):this.field?.dataType==`range`?this.renderRangeField(e,t,r,n):D`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,n,r){if(!this.field)return D``;let i=t===!0||t===`true`;return D`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${i?`success`:``} pill" style="${i?``:`opacity: 0.4;`}">${r}</span>
            </vaadin-custom-field>`}renderPropertyRowField(e,t,n,r){if(!this.field)return D``;let i=Dr(t,this.state,this.data),a=this.data??{},o=e=>a[e]!==void 0&&a[e]!==null&&typeof a[e]!=`object`?a[e]:void 0;(i==null||i===``)&&o(this.field.fieldId)!==void 0&&(i=o(this.field.fieldId));let s=o(this.field.fieldId+`-label`);s!==void 0&&s!==``&&(i=s);let c=i&&typeof i==`object`&&`value`in i?i:null;i&&i.value&&(i=i.value);let l=this.field?.dataType==`bool`||i===!0||i===!1,u=this.field?.dataType==`money`,d=i!=null&&i!==``,f=d?String(i):`—`;if(u&&d){let e=typeof i==`number`?i:parseFloat(String(i));isNaN(e)||(f=c&&c.locale&&c.currency?new Intl.NumberFormat(c.locale,{style:`currency`,currency:c.currency}).format(e):new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(e))}let p=l?D`<vaadin-icon icon="${i===!0||i===`true`?`vaadin:check`:`vaadin:minus`}" style="height: 16px; width: 16px;"></vaadin-icon>`:D`<span style="font-weight: 500; text-align: right; word-break: break-word; margin-left: auto;${u?` font-variant-numeric: tabular-nums;`:``}">${f}</span>`,m=r&&r!=`null`;return D`<div
                    id="${this.field.fieldId}"
                    data-colspan="${this.field?.colspan}"
                    style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; width: 100%; padding: 0.4rem 0; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); font-size: var(--lumo-font-size-s, .875rem); ${this.field?.style}"
            >${m?D`<span style="color: var(--lumo-secondary-text-color, #888); white-space: nowrap;">${r}</span>`:x}${p}</div>`}renderBulletedListField(e,t,n,r){if(!this.field)return D``;let i=Dr(t,this.state,this.data),a=Array.isArray(i)?i.map(e=>String(e)):i!=null&&i!==``?[String(i)]:[];return D`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${n}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><mateu-bulleted-list .items="${a}"></mateu-bulleted-list>
            </vaadin-custom-field>`}renderPlainTextField(e,t,n,r){if(!this.field)return D``;let i=Dr(t,this.state,this.data),a=i&&typeof i==`object`&&`value`in i?i:null;i&&i.value&&(i=i.value);let o=this.field?.dataType==`bool`||i===!0||i===!1,s=this.field?.dataType==`money`,c=i!=null&&i!==``,l=c?String(i):`—`;if(s&&c){let e=typeof i==`number`?i:parseFloat(String(i));isNaN(e)||(l=a&&a.locale&&a.currency?new Intl.NumberFormat(a.locale,{style:`currency`,currency:a.currency}).format(e):new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(e))}let u=o?D`<vaadin-icon icon="${i===!0||i===`true`?`vaadin:check`:`vaadin:minus`}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?D`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${l}</span>`:D`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${s?` font-variant-numeric: tabular-nums;`:``}">${l}</span>`;return D`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${n}"
                    data-colspan="${this.field?.colspan}"
                    style="${s?`text-align: right; `:``}${this.field?.style}"
            >${u}</vaadin-custom-field>`}renderFoldoutReadOnlyField(e,t){if(!this.field)return D``;let n=Dr(e,this.state,this.data),r=this.data??{},i=e=>r[e]!==void 0&&r[e]!==null&&typeof r[e]!=`object`?r[e]:void 0;(n==null||n===``)&&i(this.field.fieldId)!==void 0&&(n=i(this.field.fieldId));let a=i(this.field.fieldId+`-label`);a!==void 0&&a!==``&&(n=a),n&&typeof n==`object`&&`value`in n&&(n=n.value);let o=this.field.options?.find?.(e=>e&&e.value==n);o&&o.label!=null&&(a===void 0||a===``)&&(n=o.label);let s=n!=null&&n!==``?String(n):`—`;return D`<vaadin-custom-field
                id="${this.field.fieldId}"
                class="mateu-readonly-text"
                label="${t}"
                data-colspan="${this.field?.colspan}"
                style="padding-top: 0; padding-bottom: 0; ${this.field?.style??``}"
        ><span style="display: block; line-height: 1.4; font-weight: 500; white-space: pre-wrap; word-break: break-word; color: var(--lumo-body-text-color);">${s}</span></vaadin-custom-field>`}renderReadOnlyField(e,t,n,r){if(!this.field)return D``;let i=Dr(t,this.state,this.data)||this.data[e];if(i&&i.value&&(i=i.value),this.field.stereotype==`fileUpload`)return D`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><mateu-file-upload .fieldId="${this.field.fieldId}" .value="${i}" .editable="${!1}"></mateu-file-upload>
                </vaadin-custom-field>`;if(this.field.stereotype==`image`||this.field.stereotype==`uploadableImage`||this.field.stereotype==`signature`||this.field.stereotype==`camera`)return D`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        required="${this.field.required||x}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><img src="${i}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`;if(this.field.dataType==`bool`||this.field.dataType==`boolean`)return D`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        required="${this.field.required||x}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${i?`vaadin:check`:`vaadin:minus`}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`;let a=i==null?``:String(i);return D`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        .value="${a}"
                        readonly
                        style="${this.field.style}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon
                        slot="suffix"
                        icon="vaadin:copy"
                        title="Copiar"
                        ?hidden="${a.length<=15}"
                        style="cursor: pointer; color: var(--lumo-secondary-text-color);"
                        @click="${()=>this.copyValue(a)}"
                ></vaadin-icon></vaadin-text-field>
`}copyValue(e){navigator.clipboard.writeText(e).then(()=>r.show(`Copied`,{position:`bottom-end`,theme:`success`,duration:2e3})).catch(()=>{})}renderSearchableMultiField(e,t,n){if(!this.field)return D``;let r=!!this.field.readOnly,i=Oh(e),a=kh(this.state&&i in this.state?this.state[i]:t),o=Ah(a,this.data?.[i+`-labels`]),s=this.data?.[i+`-label`],c=e=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:jh(a,e),fieldId:i},bubbles:!0,composed:!0}))};return D`
            <vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${n}"
                    required="${this.field.required||x}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field.colspan}"
            >
                <div class="searchable-multi" role="list">
                    ${o.map(e=>D`<span class="searchable-chip" role="listitem" theme="badge pill">
                        <span>${e.label}</span>
                        ${r?x:D`<vaadin-button
                                theme="icon tertiary-inline small"
                                aria-label="Remove ${e.label}"
                                title="Remove"
                                @click="${()=>c(e.id)}"
                        ><vaadin-icon icon="vaadin:close-small"></vaadin-icon></vaadin-button>`}
                    </span>`)}
                    ${r&&o.length==0&&s?D`<span>${s}</span>`:x}
                    ${r?x:D`<vaadin-button
                            theme="small tertiary"
                            class="searchable-add"
                            @click="${()=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`codesearch-`+i,parameters:{}},bubbles:!0,composed:!0}))}}"
                    ><vaadin-icon icon="lumo:search" slot="prefix"></vaadin-icon>Add</vaadin-button>`}
                </div>
            </vaadin-custom-field>
        `}renderFileField(e,t,n,r){if(!this.field)return D``;let i=t?.map(e=>({id:e.id,name:e.name,type:``,uploadTarget:``,complete:!0}))??[];return D`
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
            `}renderStringField(e,t,n,r){if(!this.field)return D``;if(this.field?.stereotype==`searchable`)return D`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            required="${this.field.required||x}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-horizontal-layout theme="spacing" style="--lumo-space-m: 0.33rem;">
                            <vaadin-text-field style="width: 4rem;" @change="${e=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`code-`+this.field?.fieldId,parameters:{code:e.currentTarget.value}},bubbles:!0,composed:!0}))}}" value="${t}"></vaadin-text-field>
                            <vaadin-text-field readonly="" value="${this.data[this.field.fieldId+`-label`]}"></vaadin-text-field>
                            <vaadin-button theme="icon" @click="${e=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`codesearch-`+this.field?.fieldId,parameters:{}},bubbles:!0,composed:!0}))}}"><vaadin-icon icon="lumo:search"></vaadin-icon></vaadin-button>
                        </vaadin-horizontal-layout>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`select`){if(this.field?.optionsSource){let e=this.field.optionsSource,r=P(e.url,this.state,this.data)??e.url;this.data[this.id]?.sourceSignature!==r&&(this.data[this.id]={content:this.data[this.id]?.content??[],sourceSignature:r},e.proxy?this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:`__restfetch__`,parameters:{_sourceKind:`options`,_sourceId:this.field.fieldId},callback:t=>{let n=t?.appData?._restfetch,i=Bi(n,e.itemsPath,e.valuePath,e.labelPath);this.data[this.id]={content:i,totalElements:i.length,sourceSignature:r},this.requestUpdate()},callbackonly:!0},bubbles:!0,composed:!0})):Ui(e,e=>P(e,this.state,this.data)).then(e=>{this.data[this.id]={content:e,totalElements:e.length,sourceSignature:r},this.requestUpdate()}).catch(e=>console.warn(`mateu: external options fetch failed`,e)));let i=t;return t&&t.value&&(i=t.value),D`
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
                            required="${this.field.required||x}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                    `}if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}));let r=t;return t&&t.value&&(r=t.value),D`
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
                            required="${this.field.required||x}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                    `}let e=t;return t&&t.value&&(e=t.value),D`
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
                            required="${this.field.required||x}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                `}if(this.field?.stereotype==`markdown`)return D`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            required="${this.field.required||x}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><vaadin-markdown
                            .content="${t}"
                    ></vaadin-markdown>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`combobox`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates,r;this.data[this.id]&&this.data[this.id].content&&(r=this.data[this.id].content.find(e=>e.value==t)),!r&&this.comboData&&(r=this.comboData.find(e=>e.value==t)),!r&&t&&(r={value:t,label:this.data[this.id+`-label`]??t});let i=this.remoteComboDataProvider(e.action);return D`
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
                            ?required="${this.field.required||x}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            @keyup="${e=>{if(e.key==`Backspace`){let t=e.currentTarget;t.inputElement.value||(t.value=``)}}}"
                            ${u(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}return D`
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
                            required="${this.field.required||x}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            ${u(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype==`listBox`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),D`
                        <vaadin-custom-field
                                label="${n}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${E(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map(e=>D`
                            <vaadin-item>${e.description||e.image||e.icon?D`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${e.icon?D`
                                        <vaadin-icon icon="${e.icon}"></vaadin-icon>
                                    `:x}
                                    ${e.image?D`
                                            <img src="${e.image}" alt="${e.label}" style="width: 2rem;" />
                                        `:x}
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
                    `}return D`
                    <vaadin-custom-field
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${E(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(e=>D`
                            <vaadin-item>${e.description||e.image||e.icon?D`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${e.icon?D`
                                        <vaadin-icon icon="${e.icon}"></vaadin-icon>
                                    `:x}
                                    ${e.image?D`
                                            <img src="${e.image}" alt="${e.label}" style="width: 2rem;" />
                                        `:x}
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
                `}if(this.field?.stereotype==`radio`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),D`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${n}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            theme="horizontal"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||x}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.data[this.id]?.content?.map(e=>D`
                            <vaadin-radio-button value="${e.value}" label="${e.label}" ?checked="${e&&t&&e.value===t}">
                                ${e.description||e.image||e.icon?D`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${e.icon?D`
                                                <vaadin-icon icon="${e.icon}"></vaadin-icon>
                                            `:x}
                                            ${e.image?D`
                                                <img src="${e.image}" alt="${e.label}" style="height: 1rem;" />
                                            `:x}
                                            <span>${e.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${e.description?D`
                                            <div>${e.description}</div>
                                        `:x}
                                    </label>
                                `:x}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `}return D`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${n}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||x}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(e=>D`
                            <vaadin-radio-button value="${e.value}" label="${e.label}">
                                ${e.description||e.image||e.icon?D`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${e.icon?D`
                                                <vaadin-icon icon="${e.icon}"></vaadin-icon>
                                            `:x}
                                            ${e.image?D`
                                                <img src="${e.image}" alt="${e.label}" style="height: 1rem;" />
                                            `:x}
                                            <span>${e.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${e.description?D`
                                            <div>${e.description}</div>
                                        `:x}
                                    </label>
                                `:x}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `}if(this.field.stereotype==`popover`)return D`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            required="${this.field.required||x}"
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
                            ${h(()=>D`
                                <mateu-event-interceptor .target="${this}">
                                <mateu-choice
                                        .field="${this.field}"
                                        .value="${t}"
                                ></mateu-choice>
                                </mateu-event-interceptor>
                            `,[])}
                    ></vaadin-popover>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`choice`)return D`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            required="${this.field.required||x}"
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
                    `;if(this.field?.stereotype==`richText`)return D`
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
                    </vaadin-custom-field>`;if(this.field?.stereotype==`textarea`)return D`
                    <vaadin-text-area
                            id="${this.field.fieldId}"
                            label="${n}"
                            .maxlength="${this.field.charLimit}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||x}"
                            data-colspan="${this.field.colspan}"
                            rows="4"
                            style="width: 100%;"
                    ></vaadin-text-area>`;if(this.field?.stereotype==`email`)return D`
                    <vaadin-email-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||x}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-email-field>
                `;if(this.field?.stereotype==`link`)return this.field.readOnly?D`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><a href="${t}">${t}</a></vaadin-custom-field>`:D`
                            <vaadin-text-field
                                    id="${this.field.fieldId}"
                                    label="${n}"
                                    required="${this.field.required||x}"
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
                `;if(this.field?.stereotype==`icon`)return this.field.readOnly?D`<vaadin-icon
                                             icon="${t}"
                                             data-colspan="${this.field.colspan}"
                    ></vaadin-icon>`:D`
                    <vaadin-combo-box
                                    id="${this.field.fieldId}"
                                    label="${n}"
                                    required="${this.field.required||x}"
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
                        ${t?D`<vaadin-icon slot="prefix" icon="${t}"></vaadin-icon>`:x}
                    </vaadin-combo-box>
                `;if(this.field?.stereotype==`password`)return D`
                    <vaadin-password-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||x}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-password-field>
                `;if(this.field?.stereotype==`html`)return D`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${N(``+t)}</div></vaadin-custom-field>
                `;if(this.field?.stereotype==`image`)return D`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><img
                            src="${t}"
                            style="${this.component?.style}" class="${this.component?.cssClasses}"></vaadin-custom-field>
                `;if(this.field?.stereotype==`treeSelect`){let e=this.helperText();return D`
                    <div class="tree-field" id="${this.field.fieldId}" data-colspan="${this.field.colspan}">
                        ${n?D`
                            <span class="tree-field__label">${n}${this.field.required?D`<span class="tree-field__required"> •</span>`:x}</span>`:x}
                        <mateu-vaadin-tree-select
                                style="width: 100%;"
                                .fieldId="${this.field.fieldId}"
                                .value="${t}"
                                .options="${this.field.options??[]}"
                                .leavesOnly="${this.field.treeLeavesOnly??!1}"
                        ></mateu-vaadin-tree-select>
                        ${e?D`<span class="tree-field__helper">${e}</span>`:x}
                    </div>
                `}if(this.field?.stereotype==`signature`)return D`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-signature-pad .fieldId="${this.field.fieldId}" .value="${t}"></mateu-signature-pad>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`camera`)return D`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-camera-capture .fieldId="${this.field.fieldId}" .value="${t}"></mateu-camera-capture>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype==`fileUpload`){let e=Sh(this.field.attributes,`accept`);return D`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-file-upload .fieldId="${this.field.fieldId}" .value="${t}" .accept="${e}"></mateu-file-upload>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype==`uploadableImage`){let e=t!=null&&t!==``;return D`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-vertical-layout style="align-items: stretch; gap: var(--lumo-space-s); max-width: 320px;">
                            ${e?D`<img
                                    src="${t}"
                                    style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--lumo-contrast-20pct); border-radius: var(--lumo-border-radius-m); ${this.field.style??``}"
                                    class="${this.component?.cssClasses}">`:D`<div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--lumo-contrast-30pct); border-radius: var(--lumo-border-radius-m); color: var(--lumo-secondary-text-color);">
                                    <vaadin-icon icon="vaadin:picture" style="height: 2rem; width: 2rem;"></vaadin-icon>
                                </div>`}
                            <input type="file" accept="image/*" style="display: none;" @change="${this.imageUpload}">
                            <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-start;">
                                <vaadin-button @click="${this.triggerImageUpload}">
                                    <vaadin-icon icon="vaadin:upload" slot="prefix"></vaadin-icon>
                                    ${e?`Replace`:`Upload`}
                                </vaadin-button>
                                ${e?D`<vaadin-button theme="error tertiary" @click="${this.imageDelete}">
                                    <vaadin-icon icon="vaadin:trash" slot="prefix"></vaadin-icon>
                                    Delete
                                </vaadin-button>`:x}
                            </vaadin-horizontal-layout>
                        </vaadin-vertical-layout>
                    </vaadin-custom-field>
                `}return this.field?.stereotype==`color`?this.field.readOnly?D`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><span style="background-color: ${t}; display: block; height: 20px; width: 40px; margin-top: 5px; margin-bottom: 24px; border: 1px solid var(--lumo-secondary-text-color)"></vaadin-custom-field>
                `:D`
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
                `:D`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||x}"
                        ?disabled="${this.field.disabled}"
                        data-colspan="${this.field.colspan}"
                        style="${this.field.style}"
                ></vaadin-text-field>
`}renderNumberField(e,t,n,r){return this.field?D`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||x}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||x}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min==null?x:this.field.min}"
                        max="${this.field.max==null?x:this.field.max}"
            ></vaadin-number-field>`:D``}renderIntegerField(e,t,n,r){if(!this.field)return D``;if(this.field.stereotype==`stars`){let e=t;return isNaN(e)&&(e=0),D`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >${[1,2,3,4,5].map(t=>D`
                    <vaadin-icon 
                            icon="vaadin:star" 
                            style="cursor: pointer; color: var(${t<=e?`--lumo-warning-color`:`--lumo-shade-30pct`});"
                            @click="${()=>this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:t,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}"
                    
                    ></vaadin-icon>
                `)}</vaadin-custom-field>`}if(this.field.stereotype==`slider`){let e=t;return isNaN(e)&&(e=0),D`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><input type="range" @input="${e=>{this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}" min="${this.field.sliderMin??0}" max="${this.field.sliderMax??10}" value="${e??0}"/></vaadin-custom-field>
                `}return D`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||x}"
                        data-colspan="${this.field.colspan}"
                        step="${this.field.step||x}"
                        ?step-buttons-visible="${this.field.stepButtonsVisible}"
                        min="${this.field.min==null?x:this.field.min}"
                        max="${this.field.max==null?x:this.field.max}"
                ></vaadin-integer-field>
            `}renderBoolField(e,t,n,r){return this.field?this.field.stereotype==`toggle`?D`
                    <vaadin-custom-field
                            label="${n}"
                            .helperText="${this.helperText()}"
                            ?required="${this.field.required||x}"
                            data-colspan="${this.field.colspan}"
                    >
                        <paper-toggle-button id="${this.field.fieldId}"
                                             ?disabled=${this.field.disabled}
                                             ?checked=${t}
                                             @change=${this.checked}>
                        </paper-toggle-button>
                    </vaadin-custom-field>
                `:D`
                <vaadin-checkbox
                        id="${this.field.fieldId}"
                        label="${n}"
                        .helperText="${this.helperText()}"
                        ?required="${this.field.required||x}"
                        data-colspan="${this.field.colspan}"
                        @change="${this.checked}"
                        value="${t}"
                        ?checked=${t}
                        ?autofocus="${this.field.wantsFocus}"
                ></vaadin-checkbox>
            `:D``}renderDateRangeField(e,t,n,r){if(!this.field)return D``;let i=t?t.from+`;`+t.to:void 0;return D`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${n}"
                    @value-changed="${e=>{e.detail.value&&(e.detail.value={from:e.detail.value.split(`;`)[0],to:e.detail.value.split(`;`)[1]}),this.valueChanged(e)}}"
                    value="${i}"
                    .helperText="${this.helperText()}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||x}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,n,r){return this.field?D`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||x}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:D``}renderDateTimeField(e,t,n,r){return this.field?D`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||x}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:D``}renderTimeField(e,t,n,r){return this.field?D`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||x}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:D``}renderArrayField(e,t,n,r){if(!this.field)return D``;if(this.field?.stereotype==`choice`)return D`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            required="${this.field.required||x}"
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
                    `;if(this.field?.stereotype==`grid`)return D`
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
`;if(this.field?.stereotype==`listBox`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),D`
                        <vaadin-custom-field
                                label="${n}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box multiple
                                     .selectedValues="${E(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                            id="${this.field.fieldId}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map(e=>D`
                            <vaadin-item>${e.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                        </vaadin-custom-field>
                    `}return D`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${n}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box multiple
                                     .selectedValues="${E(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                                     data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(e=>D`
                            <vaadin-item>${e.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype==`combobox`){if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return D`
                        <vaadin-multi-select-combo-box
                            label="${n}"
                            item-label-path="label"
                            item-id-path="value"
                            item-value-path="value"
                            .dataProvider="${this.remoteComboDataProvider(e.action)}"
                            .helperText="${this.helperText()}"
                            .selectedItems="${this.selectedItems(t)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||x}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            auto-expand-horizontally
                            auto-expand-vertically
                            xselected-items-on-top
                    ></vaadin-multi-select-combo-box>
                    `}return D`
                    <vaadin-multi-select-combo-box
                            label="${n}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            .selectedItems="${this.selectedItems(t)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||x}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            auto-expand-horizontally
                            auto-expand-vertically
                            xselected-items-on-top
                    ></vaadin-multi-select-combo-box>
                    `}if(this.field?.remoteCoordinates){let e=this.field.remoteCoordinates;return this.data[this.id]&&this.data[this.id].searchSignature&&this.data[this.id].searchSignature!=``&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.rendered||setTimeout(()=>{this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.action,parameters:{searchText:``,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}),D`
                    <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${n}"
                        theme="vertical"
                        @value-changed="${this.valueChanged}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||x}"
                        data-colspan="${this.field.colspan}"
                        .value="${t}"
                        class="mateu-checkbox-group-${this.field.optionsColumns>1?`multi-column`:``}"
                >
                        ${this.data[this.id]?.content?.map(e=>D`
                            <vaadin-checkbox
                                    value="${e.value}"
                                    label="${e.label}"
                            ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
                    `}return D`
                <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        theme="vertical"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||x}"
                        data-colspan="${this.field.colspan}"
                        class="mateu-checkbox-group-${this.field.optionsColumns>1?`multi-column`:``}"
                        .value="${t}"
                >
                        ${this.field.options?.map(e=>D`
                        <vaadin-checkbox 
                                value="${e.value}" 
                                label="${e.label}"
                        ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
            `}renderMoneyField(e,t,n,r){if(!this.field)return D``;if(this.field.readOnly){let e=t,r=e;return r=e&&e.locale&&e.currency?new Intl.NumberFormat(e.locale,{style:`currency`,currency:e.currency}).format(e.value):new Intl.NumberFormat(`de-DE`,{minimumFractionDigits:2,maximumFractionDigits:2}).format(e),D`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><div style="width: 186px; text-align: right;">${r}</div></vaadin-custom-field>`}return D`<mateu-money-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        @value-changed="${this.valueChanged}"
                        .value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||x}"
                        data-colspan="${this.field.colspan}"
            ></mateu-money-field>`}renderStatusField(e,t,n,r){if(!this.field)return D``;let i=t;return D`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        required="${this.field.required||x}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    ${i?D`<span theme="badge pill ${_u(i.type)}">${i.message}</span>`:D``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,n,r){if(!this.field)return D``;this.loadUi5FieldComponents();let i=t;return D`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${n}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${i?.from??0}" end-value="${i?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${this.field.sliderMax??10}"
                                   step="${this.field.step||x}"
                                   @change="${e=>{let t=e.target;this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:{from:t.startValue,to:t.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}static{this.styles=v`
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
        ${De}

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
  `}};A([C()],$.prototype,`inFoldout`,void 0),A([C()],$.prototype,`ui5FieldComponentsReady`,void 0),A([y()],$.prototype,`component`,void 0),A([y()],$.prototype,`field`,void 0),A([y()],$.prototype,`baseUrl`,void 0),A([y()],$.prototype,`state`,void 0),A([y()],$.prototype,`data`,void 0),A([y()],$.prototype,`appState`,void 0),A([y()],$.prototype,`appData`,void 0),A([y()],$.prototype,`labelAlreadyRendered`,void 0),A([C()],$.prototype,`colorPickerOpened`,void 0),A([C()],$.prototype,`colorPickerValue`,void 0),A([C()],$.prototype,`controlOwnsValidity`,void 0),A([C()],$.prototype,`filteredIcons`,void 0),A([C()],$.prototype,`navLinkOffset`,void 0),$=A([w(`mateu-field`)],$);var Ng=(e,t,n,r,i,a,o,s)=>{let c=t.metadata;return D`
        <mateu-field
                id="${t.id}"
                .component="${t}"
                .field="${t.metadata}"
                .state="${r}"
                .data="${i}"
                .appState="${a}"
                .appdata="${o}"
                style="${su(t,i)}" class="${t.cssClasses}"
                slot="${t.slot??x}"
                data-colspan="${c.colspan}"
                colspan="${(c.colspan??1)>1?c.colspan:x}"
                .labelAlreadyRendered="${s}"
        >
            ${t.children?.map(t=>I(e,t,n,r,i,a,o,s))}
        </mateu-field>
    `},Pg=(e,n,r,i,a,o,s)=>{let c=n.metadata;if(c.tree)return D`
        <vaadin-grid style="${n.style}" class="${n.cssClasses}"
                     .itemHasChildrenPath="${`children`}" .dataProvider="${async(e,t)=>{let n=e.parentItem?e.parentItem.children:c.page.content;t(n,n.length)}}"
                     slot="${n.slot??x}"
                     all-rows-visible
        >
            ${c.content.map((n,c)=>{let l=n.metadata;return c>0?D`
            <vaadin-grid-column path="${n.id}"
                                header="${l?.label??x}"
                                ?auto-width="${l?.autoWidth}"
                                flex-grow="${l?.flexGrow??x}"
                                width="${l?.width??x}"
                                .column="${n.metadata}"
                                ${t((t,n,c)=>Sg(t,n,c,l,e,r,i,a,o,s),[])}></vaadin-grid-column>
`:D`
            <vaadin-grid-tree-column path="${n.id}"
                                header="${l?.label??x}"
                                ?auto-width="${l?.autoWidth}"
                                flex-grow="${l?.flexGrow??x}"
                                width="${l?.width??x}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${fi()}</span>
        </vaadin-grid>
    `;let l=c.page?.content;return n.id&&i&&i[n.id]&&(l=i[n.id]),l||=[],D`
        <vaadin-grid 
                style="${n.style}" 
                class="${n.cssClasses}" 
                .items="${l}"
                all-rows-visible
        >
            ${c?.content?.map(t=>bg(t,e,r,i,a,o,s))}
        </vaadin-grid>
    `},Fg={success:`success`,warning:`warning`,danger:`danger`,error:`danger`,info:`info`,neutral:`neutral`,none:`neutral`},Ig=(e,t)=>{if(!e||!t)return null;let n=e[t];return n&&typeof n==`object`&&(n=n.type??n.value),n==null?null:Fg[String(n).toLowerCase()]??null},Lg=class extends S{constructor(...e){super(...e),this.id=``,this.baseUrl=``,this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this._lastGridHeight=0,this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{let n=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let r=!1;n&&n.content&&(n.content.length>=(e.page+1)*e.pageSize||n.content.length==n.totalElements)&&(t(n.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),n.totalElements),r=!0,this.grid&&this.grid.recalculateColumnWidths()),r||this.pagesRequested.find(t=>t==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent(`fetch-more-elements`,{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{let e=this.metadata?.infiniteScrolling?n?.totalElements:n?.content?.length??0;t(n?.content??[],e),this.grid&&this.grid.recalculateColumnWidths()}},this.onRowsDragStart=e=>{let t=this.metadata?.dragType;if(!t)return;let n=this.identifierFieldName??`id`,r=(e.detail?.draggedItems??[]).filter(e=>!Hh(e));e.detail.setDragData(Ol(t),JSON.stringify(r.map(e=>e?.[n]).filter(e=>e!=null))),e.detail.setDraggedItemsCount?.(r.length)},this._onActionRequested=e=>{let t=e.detail,n=this.identifierFieldName;if(!n||!t.parameters||t.actionId?.startsWith(`action-on-row-`))return;let r=t.parameters[n];r!==void 0&&(this.state._selectedId=String(r),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t=``,{column:n,item:r}=e,i=this.metadata?.columns?.find(e=>e.metadata.id==n?.path);if(i?.metadata){let e=(i?.metadata).tooltipPath;e&&n&&r&&(t=r[e])}return t},this.isDetailOpen=e=>this.detailsOpenedItems.some(t=>this.sameRow(t,e))}get identifierFieldName(){let e=this.metadata?.columns?.find(e=>e.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(e=>e.metadata?.id===`id`))return`id`}_applyCellPartNameGenerator(){if(!this.grid)return;let e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId,n=!!this.metadata?.groupBy,r=this.metadata?.rowStatusField??void 0;e&&t!==void 0||n||r?this.grid.cellPartNameGenerator=(n,i)=>{let a=i.item;if(Hh(a))return`mateu-group-row`;let o=[];e&&t!==void 0&&String(a[e])===String(t)&&o.push(`selected-row`);let s=Ig(a,r);return s&&o.push(`mateu-row-`+s),o.join(` `)}:this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener(`action-requested`,this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`action-requested`,this._onActionRequested),this._resizeObserver?.disconnect(),this._resizeObserver=void 0}firstUpdated(){let e=this.grid;!e||this._resizeObserver||(this._resizeObserver=new ResizeObserver(()=>{let t=e.offsetHeight;t>0&&this._lastGridHeight===0&&requestAnimationFrame(()=>{e.recalculateColumnWidths(),e.requestContentUpdate(),e.notifyResize?.()}),this._lastGridHeight=t}),this._resizeObserver.observe(e))}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.requestContentUpdate(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}navigateToRowRoute(e){let t=(this.shadowRoot?.querySelector(`vaadin-grid`))?.getEventContext?.(e)?.item;if(!t||Hh(t)||e.composedPath().some(e=>e?.tagName&&/^(A|BUTTON|INPUT|VAADIN-BUTTON|VAADIN-CHECKBOX)$/.test(e.tagName)))return;let n=Fr(this.metadata?.rowRoute,t,this.state,this.data);n&&Ir(this,n)}render(){let e=this.data[this.id],r=e?.page,i=this.metadata?.groupBy,a=this.metadata?.infiniteScrolling?void 0:r?.content?Wh(r.content,i,e?.groups):r?.content,o=Jh((this.metadata?.columns??[]).flatMap(e=>e.metadata?.type===M.GridGroupColumn?(e.metadata.columns??[]).map(e=>e.metadata):[e.metadata]),e,i),s=oi(this.metadata?.columns??[],e=>e.metadata?.type===M.GridGroupColumn?void 0:e.metadata),c=s.extra.length>0,l=s.extra.map(e=>e.map(e=>e.metadata)),u=c?s.first:this.metadata?.columns??[],d=!!this.metadata?.detailPath,f=a??r?.content??[],p=c?f.filter(e=>!Hh(e)):this.detailsOpenedItems,m=c?n(e=>Hh(e)?D``:D`
                ${this.renderRowLines(e,l,d&&!this.metadata?.useButtonForDetail)}
                ${d&&this.isDetailOpen(e)?this.renderRowDetail(e[this.metadata?.detailPath]):x}`,[l,this.detailsOpenedItems,this.state,this.data]):d?n(e=>this.renderRowDetail(e[this.metadata?.detailPath])):void 0,h=``;return this.metadata?.wrapCellContent&&(h+=` wrap-cell-content`),this.metadata?.compact&&(h+=` compact`),this.metadata?.noBorder&&(h+=` no-border`),this.metadata?.noRowBorder&&(h+=` no-row-borders`),this.metadata?.columnBorders&&(h+=` column-borders`),this.metadata?.rowStripes&&(h+=` row-stripes`),D`
            <vaadin-grid
                    .items="${a}"
                    item-id-path="_rowNumber"
                    .selectedItems="${this.state[this.id+`_selected_items`]||[]}"
                    ?data-clickable-rows="${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail}"
                    ?data-multiline="${c}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?`lazy`:x}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.metadata?.infiniteScrolling?this.dataProvider:void 0}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    ?rows-draggable="${!!this.metadata?.dragType}"
                    @grid-dragstart="${this.onRowsDragStart}"
                    @selected-items-changed="${e=>{let t=(e.detail.value??[]).filter(e=>!Hh(e));this.emptyArray(this.state[this.id+`_selected_items`])&&this.emptyArray(t)||(this.state[this.id+`_selected_items`]=t,c&&this.grid?.requestContentUpdate(),this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0})))}}"
                    @active-item-changed="${E(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?e=>{let t=e.detail.value;t&&Hh(t)||(this.detailsOpenedItems=t?[t]:[])}:void 0)}"
                    @click="${E(this.metadata?.rowRoute?e=>this.navigateToRowRoute(e):void 0)}"
                    .detailsOpenedItems="${p}"
                    ${E(m)}
                    theme="${h}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?D`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:x}
                ${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?Cg(Hh,c?this.isDetailOpen:void 0):x}
                ${u.map(e=>bg(e,this,this.baseUrl,this.state,this.data,this.appState,this.appData,o))}
                ${this.metadata?.useButtonForDetail?D`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${t((e,{detailsOpened:t})=>{let n=c?this.isDetailOpen(e):t;return D`
              <vaadin-button
                theme="tertiary icon"
                title="${n?`Collapse`:`Expand`}"
                aria-label="Toggle details"
                aria-expanded="${n?`true`:`false`}"
                @click="${()=>{this.detailsOpenedItems=n?this.detailsOpenedItems.filter(t=>t!==e&&!this.sameRow(t,e)):[...this.detailsOpenedItems,e]}}"
              >
                <vaadin-icon
                  .icon="${n?`lumo:angle-down`:`lumo:angle-right`}"
                ></vaadin-icon>
              </vaadin-button>
            `},[c])}
                    ></vaadin-grid-column>
                `:x}
                <span slot="empty-state">${fi(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(e=>e.metadata.tooltipPath)?D`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:x}
            </vaadin-grid>
            <slot></slot>
       `}sameRow(e,t){return e===t||e?._rowNumber!==void 0&&t?._rowNumber!==void 0&&e._rowNumber===t._rowNumber}renderRowLines(e,t,n){let r=this.state?.[this.id+`_selected_items`]??[],i=this.identifierFieldName,a=this.state?._selectedId??this.appState?._splitDetailId;return D`<div class="row-lines" ?data-selected="${r.some(t=>this.sameRow(t,e))||!!i&&a!==void 0&&String(e?.[i])===String(a)}"
                         @click="${n?t=>{t.composedPath().some(e=>e?.tagName&&/^(A|BUTTON|INPUT|VAADIN-BUTTON|VAADIN-CHECKBOX)$/.test(e.tagName))||(this.detailsOpenedItems=this.isDetailOpen(e)?[]:[e])}:x}">
            ${t.map(t=>D`<div class="row-line">
                ${t.map(t=>D`<span class="row-line-pair" data-column="${t.id}">
                    <span class="row-line-label">${P(t.label,this.state,this.data)}:</span>
                    <span class="row-line-value">${Sg(e,{item:e,index:0,selected:!1,detailsOpened:!0,expanded:!1,level:0},{path:t.id,dataset:{dataType:t.dataType??``,stereotype:t.stereotype??``}},t,this,this.baseUrl,this.state,this.data,this.appState,this.appData)}</span>
                </span>`)}
            </div>`)}
        </div>`}renderRowDetail(e){return e==null||e===``?D``:typeof e==`object`&&e.type?D`${I(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)}`:D`<div class="row-detail">${typeof e==`object`?JSON.stringify(e,null,2):String(e)}</div>`}static{this.styles=v`
        ${De}
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
  `}};A([y()],Lg.prototype,`id`,void 0),A([y()],Lg.prototype,`metadata`,void 0),A([y()],Lg.prototype,`baseUrl`,void 0),A([y()],Lg.prototype,`state`,void 0),A([y()],Lg.prototype,`data`,void 0),A([y()],Lg.prototype,`appState`,void 0),A([y()],Lg.prototype,`appData`,void 0),A([y()],Lg.prototype,`emptyStateMessage`,void 0),A([C()],Lg.prototype,`detailsOpenedItems`,void 0),A([T(`vaadin-grid`)],Lg.prototype,`grid`,void 0),Lg=A([w(`mateu-table`)],Lg);var Rg=(e,t,n,r,i,a,o)=>D`
    <mateu-table
            id="${t.id}"
            baseUrl="${n}"
            .metadata="${t.metadata}"
            .state="${r}"
            .data="${i}"
            .appState="${a}"
            .appDate="${o}"
            style="${t.style}" class="${t.cssClasses}"
            slot="${t.slot??x}"
    >
        ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
    </mateu-table>`,zg=(e,t,n,r,i,a)=>D`
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
    ></mateu-table>`,Bg=new WeakMap,Vg=0,Hg=e=>{if(e.id&&e.id!==`fieldId`)return`mateu-popover-`+e.id;let t=Bg.get(e);return t||(t=`mateu-popover-`+ ++Vg,Bg.set(e,t)),t},Ug=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=Hg(t),l=s.trigger===`hover`;return D`
        <div id="${c}" slot="${t.slot??x}" tabindex="${l?`0`:x}"
             style="${l?`display: inline-block; cursor: help; text-decoration: underline dotted; text-underline-offset: 3px;`:x}">${I(e,s.wrapped,n,r,i,a,o)}</div>
        <vaadin-popover
                for="${c}"
                .trigger="${l?[`hover`,`focus`]:[`click`]}"
                theme="${l?`arrow`:`arrow no-padding`}"
                ?modal="${!l}"
                accessible-name="Details"
                content-width="300px"
                position="bottom"
                ${h(()=>D`${I(e,s.content,n,r,i,a,o)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},Wg=(e,t,n)=>{let r=e;return D`
        <vaadin-button
                data-action-id="${r.id}"
                theme="${ti(e)||x}"
                @click="${n}"
                ?disabled="${r.disabled}"
        >${r.iconOnLeft?D`<vaadin-icon icon="${r.iconOnLeft}"></vaadin-icon>`:x}${t}${r.iconOnRight?D`<vaadin-icon icon="${r.iconOnRight}"></vaadin-icon>`:x}</vaadin-button>
    `},Gg=e=>D`
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
    </div>`,Kg={"vaadin:wifi":`vaadin:connect`,"vaadin:pen":`vaadin:pencil`,"vaadin:automation":`vaadin:cogs`},qg=(e,t,n)=>D`<vaadin-icon icon="${Kg[e]??e}" style="${t??x}" class="${n??x}"></vaadin-icon>`,Jg=e=>D`
    <vaadin-button theme="tertiary icon" class="mateu-header-icon-btn ${e.cssClasses??``}"
            @click="${e.onClick}"
            title="${e.title??e.label}" aria-label="${e.label}"
            aria-pressed="${e.pressed===void 0?x:String(e.pressed)}"
            aria-expanded="${e.expanded===void 0?x:String(e.expanded)}"
            aria-controls="${e.controls??x}">
        <vaadin-icon icon="${e.icon}"></vaadin-icon>
    </vaadin-button>`,Yg=(e,t,n)=>{let r=e.metadata,i=P(r.label,t,n),a=``;return r.buttonStyle&&(a+=` `+r.buttonStyle),r.color&&r.color!==`none`&&r.color!==`normal`&&(a+=` `+r.color),r.size&&r.size!==`none`&&r.size!==`normal`&&(a+=` `+r.size),D`<vaadin-button
            id="${e.id}"
            data-action-id="${r.actionId}"
            data-route="${eo(r,t,n)??x}"
            @click="${e=>$a(e,r)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${a}"
            ?disabled="${r.disabled}"
            data-shortcut="${r.shortcut??x}"
            title="${r.shortcut?`${i} (${Qa(r.shortcut)})`:x}"
            slot="${e.slot??x}"
    >${r.iconOnLeft?D`<vaadin-icon icon="${r.iconOnLeft}"></vaadin-icon>`:x}${i}${r.iconOnRight?D`<vaadin-icon icon="${r.iconOnRight}"></vaadin-icon>`:x}</vaadin-button>`},Xg=e=>{let t=e.metadata;return D`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??x}"
                @submit="${e=>{let n=e.detail?.value??``;!t.actionId||!n.trim()||e.currentTarget.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t.actionId,parameters:{message:n}},bubbles:!0,composed:!0}))}}"
        ></vaadin-message-input>
    `},Zg=e=>{let t=(e.metadata.items??[]).map(e=>({text:e.text,time:e.time,userName:e.userName,userImg:e.userImg,userAbbr:e.userAbbr,userColorIndex:e.userColorIndex}));return D`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??x}"
                .items="${t}"
        ></vaadin-message-list>
    `},Qg=(e,t)=>{e&&e.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:t},bubbles:!0,composed:!0}))},$g=(e,t,n,r,i,a,o)=>{let s=t.metadata,c=!1;if(s.openedCondition)try{c=xr(s.openedCondition,r,i,a,o)}catch(e){console.error(`when evaluating `+s.openedCondition+` :`+e+`, where data is `+i+` and state is `+r)}return D`
        <vaadin-confirm-dialog
                header="${s.header}"
                ?cancel-button-visible="${s.canCancel}"
                ?reject-button-visible="${s.canReject}"
                reject-text="${s.rejectText}"
                confirm-text="${s.confirmText}"
                .opened="${c}"
                @confirm="${e=>Qg(e.currentTarget,s.confirmActionId)}"
                @reject="${e=>Qg(e.currentTarget,s.rejectActionId)}"
                @cancel="${e=>Qg(e.currentTarget,s.cancelActionId)}"
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??x}"
        >
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </vaadin-confirm-dialog>
    `};function e_(e){let t=e;for(;t;){let e=t.parentElement??t.getRootNode().host??null;if(!e||e===t)break;if(e instanceof Element){let t=getComputedStyle(e).overflowY;if(t===`auto`||t===`scroll`)return e}t=e}return document.scrollingElement}var t_=class extends S{constructor(...e){super(...e),this.panels=[],this.headerTitle=``,this.badges=[],this.navigation=null,this.overviewEditActionId=``,this._raf=0,this._snapping=!1,this._less=!1,this._more=!1,this._open=[],this._openKey=``,this._visible=[],this._onScroll=()=>{this._raf||=requestAnimationFrame(()=>{this._raf=0,this._syncPin()})},this._onScrollEnd=()=>{!this._snapping&&Date.now()-this._lastWheel>400&&this._snapToNearest()},this._lastWheel=0,this._onWheel=e=>{let t=this._rail;if(!t||e.ctrlKey||e.defaultPrevented)return;let n=e.deltaMode===1?40:e.deltaMode===2?t.clientWidth:1,r=[];for(let n of e.composedPath()){if(n===t)break;if(!(n instanceof HTMLElement))continue;let e=getComputedStyle(n).overflowY;(e===`auto`||e===`scroll`)&&n.scrollHeight>n.clientHeight+1&&r.push({scrollTop:n.scrollTop,scrollHeight:n.scrollHeight,clientHeight:n.clientHeight})}let i=Vh(e.deltaX*n,e.deltaY*n,t.scrollLeft,t.scrollWidth-t.clientWidth,r);i!=null&&(e.preventDefault(),this._lastWheel=Date.now(),t.scrollLeft=Math.max(0,Math.min(t.scrollWidth-t.clientWidth,t.scrollLeft+i)))},this._fit=()=>{let e=this.getBoundingClientRect().top,t=Math.max(240,window.innerHeight-e);this.style.setProperty(`--mateu-foldout-fill`,`${t}px`);let n=e_(this);if(n){let e=n.scrollHeight-n.clientHeight;e>0&&this.style.setProperty(`--mateu-foldout-fill`,`${Math.max(240,t-e)}px`)}this._syncPin()},this._onKeydown=e=>{if(e.key!==`ArrowRight`&&e.key!==`ArrowLeft`||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||this._isEditingContext())return;let t=this._rail;!t||t.scrollWidth<=t.clientWidth||(e.preventDefault(),this._step(e.key===`ArrowRight`?1:-1))}}willUpdate(e){if(e.has(`panels`)){let e=Fh(this._open,this._openKey,this.panels);this._open=e.states,this._openKey=e.key}}_toggle(e){let t=[...this._open];t[e]=!(t[e]??!0),this._open=t,requestAnimationFrame(()=>this._syncPin())}_goTo(e){let t=this._rail;if(!t)return;let n=[...this.renderRoot.querySelectorAll(`.section`)],r=(this._first?.offsetWidth??0)<t.clientWidth*.6,i=e===0||e===1&&r?0:n[e]?.offsetLeft??0,a=t.scrollWidth-t.clientWidth;this._snapping=!0,t.scrollTo({left:Math.max(0,Math.min(i,a)),behavior:`smooth`}),window.setTimeout(()=>{this._snapping=!1},400)}navAction(e){e&&this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:{}},bubbles:!0,composed:!0}))}_stride(){let e=this.renderRoot.querySelectorAll(`.section`);return e.length>1?e[1].offsetLeft:this._rail?.clientWidth??0}_boundaries(){let e=this._rail;if(!e)return[];let t=e.scrollWidth-e.clientWidth,n=[...this.renderRoot.querySelectorAll(`.section`)].map(e=>Math.max(0,Math.min(e.offsetLeft,t)));return[...new Set(n)]}_snapToNearest(){let e=this._rail;if(!e)return;let t=this._boundaries();if(!t.length)return;let n=t.reduce((t,n)=>Math.abs(n-e.scrollLeft)<Math.abs(t-e.scrollLeft)?n:t);Math.abs(n-e.scrollLeft)<1||(this._snapping=!0,e.scrollTo({left:n,behavior:`smooth`}),window.setTimeout(()=>{this._snapping=!1},400))}_syncPin(){let e=this._rail,t=this._first;if(!e||!t)return;let n=this._stride(),r=t.offsetWidth<e.clientWidth*.6?Math.min(e.scrollLeft,n):0;t.style.transform=r?`translateX(${r}px)`:``,t.classList.toggle(`floating`,e.scrollLeft>0);let i=e.scrollWidth-e.clientWidth,a=i>32;this._less=a&&e.scrollLeft>2,this._more=a&&e.scrollLeft<i-2;let o=e.getBoundingClientRect(),s=Ih({left:o.left,right:o.right},[...this.renderRoot.querySelectorAll(`.section`)].map(e=>{let t=e.getBoundingClientRect();return{left:t.left,right:t.right}}));s.join()!==this._visible.join()&&(this._visible=s)}_step(e){let t=this._rail;if(!t)return;let n=this._boundaries();if(!n.length)return;let r=n.reduce((e,r,i)=>Math.abs(r-t.scrollLeft)<Math.abs(n[e]-t.scrollLeft)?i:e,0),i=n[Math.max(0,Math.min(r+e,n.length-1))];this._snapping=!0,t.scrollTo({left:i,behavior:`smooth`}),window.setTimeout(()=>{this._snapping=!1},400)}_isEditingContext(){let e=document.activeElement;for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;if(!e)return!1;let t=e.tagName;return t===`INPUT`||t===`TEXTAREA`||t===`SELECT`||e.isContentEditable}_sectionStyle(e,t){return Nh(e.width,this._open[t]??!0)||x}firstUpdated(){this._fit();for(let e of[300,1e3,2500])window.setTimeout(()=>this._fit(),e);this._resizeObserver=new ResizeObserver(()=>this._fit()),this._rail&&this._resizeObserver.observe(this._rail);for(let e of this.renderRoot.querySelectorAll(`.section`))this._resizeObserver.observe(e)}connectedCallback(){super.connectedCallback(),document.addEventListener(`keydown`,this._onKeydown),window.addEventListener(`resize`,this._fit)}disconnectedCallback(){document.removeEventListener(`keydown`,this._onKeydown),window.removeEventListener(`resize`,this._fit),this._resizeObserver?.disconnect(),this._resizeObserver=void 0,this._raf&&=(cancelAnimationFrame(this._raf),0),super.disconnectedCallback()}static{this.styles=v`
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
    `}render(){let e=this.navigation,t=!!(this.overviewEditActionId||e&&(e.parentActionId||e.previousActionId||e.nextActionId)),n=!!(this.headerTitle||t||this.badges.length);return D`
            <div class="rail" part="rail" tabindex="0"
                 @scroll="${this._onScroll}" @scrollend="${this._onScrollEnd}"
                 @wheel="${{handleEvent:this._onWheel,passive:!1}}">
                <section class="section section--first" part="section overview">
                    ${n?D`
                        <header class="section-head" part="section-head">
                            <div class="section-head-row">
                                ${this.headerTitle?D`<h2 class="section-title">${this.headerTitle}</h2>`:D`<span></span>`}
                                ${t?D`
                                    <div class="section-toolbar" part="section-toolbar">
                                        ${e?.parentActionId?D`
                                            <button class="tb-parent" title="${e.parentLabel??`Back`}"
                                                    @click="${()=>this.navAction(e.parentActionId)}">
                                                <span>‹</span><span>${e.parentLabel??`Back`}</span>
                                            </button>
                                        `:x}
                                        ${e?.previousActionId?D`
                                            <button class="tb-move" title="Previous"
                                                    @click="${()=>this.navAction(e.previousActionId)}">‹</button>
                                        `:x}
                                        ${e?.nextActionId?D`
                                            <button class="tb-move" title="Next"
                                                    @click="${()=>this.navAction(e.nextActionId)}">›</button>
                                        `:x}
                                        ${this.overviewEditActionId?D`
                                            <button class="tb-edit" title="Edit"
                                                    @click="${()=>this.navAction(this.overviewEditActionId)}">
                                                <span>✎</span><span>Edit</span>
                                            </button>
                                        `:x}
                                    </div>
                                `:x}
                            </div>
                            ${this.badges.length?D`
                                <div class="section-badges">
                                    ${this.badges.map(e=>D`<span class="section-badge">${e}</span>`)}
                                </div>
                            `:x}
                        </header>
                    `:x}
                    <div class="overview-body">
                        <slot name="overview"></slot>
                    </div>
                </section>
                ${this.panels.map((e,t)=>{let n=this._open[t]??!0,r=t%2==1?` panel-alt`:``;if(!n)return D`
                            <section class="section strip${r}" part="section panel strip"
                                     style="${this._sectionStyle(e,t)}">
                                <button class="strip-button" title="${e.title??``}"
                                        aria-expanded="false" @click="${()=>this._toggle(t)}">
                                    <span class="strip-chevron" aria-hidden="true">›</span>
                                    <span class="strip-title">${e.title??``}</span>
                                </button>
                            </section>
                        `;let i=e.open===!1;return D`
                    <section class="section${r}" part="section panel"
                             style="${this._sectionStyle(e,t)}">
                        ${e.title||e.subtitle||i?D`
                            <div class="panel-header">
                                <div>
                                ${e.title?D`<h3>${e.title}${e.subtitle?D` <span class="subtitle" style="font-weight: 400;">· ${e.subtitle}</span>`:x}</h3>`:x}
                                ${!e.title&&e.subtitle?D`<div class="subtitle">${e.subtitle}</div>`:x}
                                </div>
                                ${i?D`<button class="panel-fold" title="Fold" aria-expanded="true"
                                        @click="${()=>this._toggle(t)}">‹</button>`:x}
                            </div>
                        `:x}
                        <div class="panel-body">
                            <slot name="panel-${t}"></slot>
                        </div>
                    </section>
                `})}
            </div>
            ${this._less||this._more?D`
                <nav class="dots" part="paging-dots" aria-label="Panels">
                    ${[this.headerTitle||`Overview`,...this.panels.map(e=>e.title??``)].map((e,t)=>D`
                        <button class="dot ${this._visible[t]?`on`:``}" title="${e}"
                                aria-label="${e}" aria-current="${this._visible[t]?`true`:`false`}"
                                @click="${()=>this._goTo(t)}"></button>
                    `)}
                </nav>
            `:x}
        `}};A([y({type:Array})],t_.prototype,`panels`,void 0),A([y({type:String})],t_.prototype,`headerTitle`,void 0),A([y({type:Array})],t_.prototype,`badges`,void 0),A([y({attribute:!1})],t_.prototype,`navigation`,void 0),A([y({type:String})],t_.prototype,`overviewEditActionId`,void 0),A([T(`.rail`)],t_.prototype,`_rail`,void 0),A([T(`.section--first`)],t_.prototype,`_first`,void 0),A([C()],t_.prototype,`_less`,void 0),A([C()],t_.prototype,`_more`,void 0),A([C()],t_.prototype,`_open`,void 0),A([C()],t_.prototype,`_visible`,void 0),t_=A([w(`mateu-vaadin-foldout`)],t_);var n_=(e,t,n,r,i,a,o)=>{let s=t.metadata;return D`
        <mateu-vaadin-foldout
                .panels="${s.panels??[]}"
                .headerTitle="${s.headerTitle??``}"
                .badges="${s.badges??[]}"
                .navigation="${s.navigation??null}"
                overviewEditActionId="${s.overviewEditActionId??``}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??x}"
        >
            ${t.children?.map(t=>I(e,t,n,r,i,a,o))}
        </mateu-vaadin-foldout>
    `},r_=class extends S{constructor(...e){super(...e),this.rows=[],this.columns=[],this.navigable=!1,this.expandedItems=[],this._normalized=[],this.dataProvider=(e,t)=>{let n=e.parentItem?e.parentItem.children??[]:this.normalized;t(n,n.length)}}get normalized(){return this._src!==this.rows&&(this._src=this.rows,this._normalized=this.normalizeRows(this.rows??[])),this._normalized}normalizeRows(e){return(e??[]).map(e=>{let t=Array.isArray(e.children)&&e.children.length?this.normalizeRows(e.children):void 0;return{...e,children:t}})}collectGroups(e,t=[]){return e.forEach(e=>{e.children&&e.children.length&&(t.push(e),this.collectGroups(e.children,t))}),t}willUpdate(){this._expandedSrc!==this.rows&&(this._expandedSrc=this.rows,this.expandedItems=this.collectGroups(this.normalized))}updated(e){e.has(`rows`)&&this._grid?.clearCache?.()}dispatch(e,t){this.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}render(){let e=this.columns??[],n=e[0],r=e.slice(1);return D`
            <vaadin-grid
                    theme="compact no-row-borders"
                    all-rows-visible
                    .dataProvider="${this.dataProvider}"
                    .itemHasChildrenPath="${`children`}"
                    .expandedItems="${this.expandedItems}"
                    @expanded-items-changed="${e=>{this.expandedItems=e.detail.value}}">
                ${n?D`
                    <vaadin-grid-tree-column path="${n.id}" header="${n.label??``}"
                                             auto-width flex-grow="0"></vaadin-grid-tree-column>
                `:x}
                ${r.map(e=>e.id===`select`?D`<vaadin-grid-column header="${e.label??``}" auto-width flex-grow="0" text-align="end"
                              ${t(e=>D`<vaadin-button theme="tertiary small"
                                          @click="${()=>this.dispatch(`action-on-row-select`,{_clickedRow:e})}">Select</vaadin-button>`,[])}></vaadin-grid-column>`:D`<vaadin-grid-column path="${e.id}" header="${e.label??``}"></vaadin-grid-column>`)}
                ${this.navigable?D`
                    <vaadin-grid-column auto-width flex-grow="0" text-align="end"
                          ${t(e=>e?.viewable===!1?D``:D`<vaadin-button theme="tertiary small"
                                          @click="${()=>this.dispatch(`view`,e)}">View</vaadin-button>`,[])}></vaadin-grid-column>
                `:x}
            </vaadin-grid>
        `}static{this.styles=v`
        :host {
            display: block;
            width: 100%;
        }
        vaadin-grid {
            max-height: min(60vh, 32rem);
            min-width: 22rem;
        }
    `}};A([y({attribute:!1})],r_.prototype,`rows`,void 0),A([y({attribute:!1})],r_.prototype,`columns`,void 0),A([y()],r_.prototype,`idField`,void 0),A([y({type:Boolean})],r_.prototype,`navigable`,void 0),A([y()],r_.prototype,`selectedId`,void 0),A([C()],r_.prototype,`expandedItems`,void 0),A([T(`vaadin-grid`)],r_.prototype,`_grid`,void 0),r_=A([w(`mateu-vaadin-tree`)],r_);var i_={[M.VirtualList]:(e,t,n,r,i,a,o)=>km(e,t,n,r,i,a,o),[M.Notification]:(e,t)=>Am(t),[M.ProgressBar]:(e,t,n,r)=>jm(t,r),[M.Details]:(e,t,n,r,i,a,o)=>Mm(e,t,n,r,i,a,o),[M.Avatar]:(e,t,n,r,i)=>Nm(t,r,i),[M.AvatarGroup]:(e,t)=>Pm(t),[M.Card]:(e,t,n,r,i,a,o)=>Fm(e,t,n,r,i,a,o),[M.Button]:(e,t,n,r,i)=>Yg(t,r,i),[M.MessageInput]:(e,t)=>Xg(t),[M.MessageList]:(e,t)=>Zg(t),[M.ConfirmDialog]:(e,t,n,r,i,a,o)=>$g(e,t,n,r,i,a,o),[M.FormLayout]:(e,t,n,r,i,a,o)=>qm(e,t,n,r,i,a,o),[M.HorizontalLayout]:(e,t,n,r,i,a,o)=>Zm(e,t,n,r,i,a,o),[M.VerticalLayout]:(e,t,n,r,i,a,o)=>Qm(e,t,n,r,i,a,o),[M.SplitLayout]:(e,t,n,r,i,a,o)=>$m(e,t,n,r,i,a,o),[M.MasterDetailLayout]:(e,t,n,r,i,a,o)=>eh(e,t,n,r,i,a,o),[M.TabLayout]:(e,t,n,r,i,a,o)=>th(e,t,n,r,i,a,o),[M.AccordionLayout]:(e,t,n,r,i,a,o)=>ih(e,t,n,r,i,a,o),[M.BoardLayout]:(e,t,n,r,i,a,o)=>sh(e,t,n,r,i,a,o),[M.BoardLayoutRow]:(e,t,n,r,i,a,o)=>ch(e,t,n,r,i,a,o),[M.BoardLayoutItem]:(e,t,n,r,i,a,o)=>lh(e,t,n,r,i,a,o),[M.Scroller]:(e,t,n,r,i,a,o)=>oh(e,t,n,r,i,a,o),[M.MenuBar]:(e,t,n,r,i)=>hh(e,t,n,r,i),[M.ContextMenu]:(e,t,n,r,i,a,o)=>mh(e,t,n,r,i,a,o),[M.FormField]:(e,t,n,r,i,a,o,s)=>Ng(e,t,n,r,i,a,o,s),[M.Grid]:(e,t,n,r,i,a,o)=>Pg(e,t,n,r,i,a,o),[M.Table]:(e,t,n,r,i,a,o)=>Rg(e,t,n,r,i,a,o),[M.Popover]:(e,t,n,r,i,a,o)=>Ug(e,t,n,r,i,a,o),[M.FoldoutLayout]:(e,t,n,r,i,a,o)=>n_(e,t,n,r,i,a,o)},a_=class extends Om{rendererName(){return`vaadin`}renderClientSideComponent(e,t,n,r,i,a,o,s){let c=t?.metadata?.type,l=c?i_[c]:void 0;return l&&t?l(e,t,n,r,i,a,o,s):super.renderClientSideComponent(e,t,n,r,i,a,o,s)}renderTableComponent(e,t,n,r,i,a,o){return zg(e,t,n,r,a,o)}renderTreeComponent(e,t){return D`
            <mateu-vaadin-tree
                    .rows="${t.rows}"
                    .columns="${t.columns}"
                    .idField="${t.idField}"
                    .navigable="${t.navigable}"
                    .selectedId="${t.selectedId}"
            ></mateu-vaadin-tree>`}renderToolbarButton(e,t,n){return Wg(e,t,n)}renderPeerNav(e){return Gg(e)}renderIcon(e,t,n){return qg(e,t,n)}renderTopNav(e,t,n){return ph(e,t,n)}renderHeaderIconButton(e){return Jg(e)}};function o_(e){switch(e){case`topStretch`:return`top-stretch`;case`topStart`:return`top-start`;case`topCenter`:return`top-center`;case`topEnd`:return`top-end`;case`middle`:return`middle`;case`bottomStart`:return`bottom-start`;case`bottomEnd`:return`bottom-end`;case`bottomStretch`:return`bottom-stretch`;case`bottomCenter`:return`bottom-center`}return`bottom-end`}function s_(e,t){if(e.onAction)return{label:e.actionLabel??`Retry`,run:e.onAction};if(e.undoActionId)return{label:e.undoLabel??`Undo`,run:()=>t.dispatchEvent(new CustomEvent(`action-requested`,{detail:{actionId:e.undoActionId,parameters:e.undoParameters??{}},bubbles:!0,composed:!0}))}}function c_(e,t){let n=new r;n.position=o_(e.position),n.duration=e.duration??1e4,e.variant&&n.setAttribute(`theme`,e.variant),n.renderer=r=>{if(r.firstElementChild)return;let i=document.createElement(`span`);i.textContent=e.text;let a=s_(e,t),o=document.createElement(`button`);o.textContent=a.label,o.style.cssText=`margin-left: 0.75rem; background: none; border: 1px solid currentColor; border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer; padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;`,o.addEventListener(`click`,()=>{a.run(),n.opened=!1}),r.append(i,o)},document.body.appendChild(n),n.opened=!0,n.addEventListener(`opened-changed`,e=>{e.detail.value||n.remove()})}F.set(new a_),bu({show(e,t){if(tr(e.text,{politeness:e.variant===`error`?`assertive`:`polite`}),e.undoActionId||e.onAction){c_(e,t);return}r.show(e.text,{position:e.position?o_(e.position):`bottom-end`,theme:e.variant,duration:e.duration})}});