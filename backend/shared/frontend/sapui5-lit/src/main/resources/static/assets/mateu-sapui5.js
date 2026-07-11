const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-highcharts.js","assets/vendor-vaadin.js","assets/vendor-lit.js","assets/vendor.js","assets/vendor-diagrams.js"])))=>i.map(i=>d[i]);
import{d as o,A as d,a as T,j as m,r as g,i as L,k as _,m as de,D as xa,c as O,p as Me,w as Y,q as Qa}from"./vendor-lit.js";import{v as Za,b as Ve,e as es,_ as ce,n as wa,p as Ca,f as ot,i as pi,j as ka,N as Jt,k as Si,l as Ni,m as ts}from"./vendor-vaadin.js";import{S as is,n as Z,a as as,b as ss}from"./vendor.js";import{N as ri}from"./vendor-ui5.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function i(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(s){if(s.ep)return;s.ep=!0;const r=i(s);fetch(s.href,r)}})();class rs{constructor(){this.afterRenderHook=void 0,this.useShadowRoot=!0,this.componentRenderer=void 0}set(t){if(this.componentRenderer=t,typeof window<"u"){const i=t.supportedClientSideTypes?.();window.__mateuRendererInfo={name:t.rendererName?.()??t.constructor?.name??"unknown",supportedTypes:i?[...i].sort():null}}}get(){return this.componentRenderer}setUseShadowRoot(t){this.useShadowRoot=t}mustUseShadowRoot(){return this.useShadowRoot}setAfterRenderHook(t){this.afterRenderHook=t}getAfterRenderHook(){return this.afterRenderHook}}const H=new rs;var h=(e=>(e.Page="Page",e.Div="Div",e.Element="Element",e.MicroFrontend="MicroFrontend",e.Form="Form",e.Crud="Crud",e.Result="Result",e.Card="Card",e.Directory="Directory",e.Stepper="Stepper",e.HorizontalLayout="HorizontalLayout",e.VerticalLayout="VerticalLayout",e.SplitLayout="SplitLayout",e.MasterDetailLayout="MasterDetailLayout",e.TabLayout="TabLayout",e.AccordionLayout="AccordionLayout",e.FormLayout="FormLayout",e.FormRow="FormRow",e.FormItem="FormItem",e.BoardLayout="BoardLayout",e.BoardLayoutRow="BoardLayoutRow",e.BoardLayoutItem="BoardLayoutItem",e.Scroller="Scroller",e.FullWidth="FullWidth",e.Container="Container",e.FormField="FormField",e.Table="Table",e.App="App",e.Text="Text",e.Avatar="Avatar",e.Chat="Chat",e.AvatarGroup="AvatarGroup",e.Badge="Badge",e.Breadcrumbs="Breadcrumbs",e.Anchor="Anchor",e.Button="Button",e.Chart="Chart",e.Icon="Icon",e.ConfirmDialog="ConfirmDialog",e.ContextMenu="ContextMenu",e.CookieConsent="CookieConsent",e.Details="Details",e.Dialog="Dialog",e.Drawer="Drawer",e.Image="Image",e.Map="Map",e.Markdown="Markdown",e.Notification="Notification",e.ProgressBar="ProgressBar",e.Popover="Popover",e.CarouselLayout="CarouselLayout",e.Tooltip="Tooltip",e.MessageInput="MessageInput",e.MessageList="MessageList",e.CustomField="CustomField",e.MenuBar="MenuBar",e.Grid="Grid",e.GridColumn="GridColumn",e.GridGroupColumn="GridGroupColumn",e.VirtualList="VirtualList",e.FormSection="FormSection",e.FormSubSection="FormSubSection",e.Bpmn="Bpmn",e.Workflow="Workflow",e.WorkflowElk="WorkflowElk",e.FormEditor="FormEditor",e.MetricCard="MetricCard",e.Scoreboard="Scoreboard",e.DashboardPanel="DashboardPanel",e.DashboardLayout="DashboardLayout",e.FoldoutLayout="FoldoutLayout",e.HeroSection="HeroSection",e.EmptyState="EmptyState",e.Skeleton="Skeleton",e.Gantt="Gantt",e))(h||{}),U=(e=>(e.ServerSide="ServerSide",e.ClientSide="ClientSide",e))(U||{});const pt=(e,t,i,a,s,r,n,l,c)=>(t.slot=l,b(e,t,i,a,s,r,n,c)),b=(e,t,i,a,s,r,n,l)=>{if(!t)return o``;if(t.type==U.ClientSide)return H.get().renderClientSideComponent(e,t,i,a,s,r,n,l);const c=e.route,u=e.consumedRoute;return o`
        <mateu-component id="${t.id}"
                         .component="${t}"
                        route="${c}"
                         consumedRoute="${u}"
                         baseUrl="${i}"
                         slot="${t.slot??d}"
                         style="${t.style}"
                         class="${t.cssClasses}"
                         .state="${{...t.initialData??{},...a}}"
                         .data="${{...s}}"
                         .appState="${r}"
                         .appData="${n}"
        >
       </mateu-component>`},os=640,ns=e=>e>0&&e<os?"accordion":"tabs";var ls=Object.defineProperty,ds=Object.getOwnPropertyDescriptor,mi=(e,t,i,a)=>{for(var s=a>1?void 0:a?ds(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&ls(t,i,s),s};let Tt=class extends L{constructor(){super(...arguments),this.tabLabels=[],this.mode="tabs",this.selected=0,this.selectedChangedListener=e=>{const t=e.detail?.value;typeof t=="number"&&t>=0&&(this.selected=t)}}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)this.mode=ns(t.contentRect.width)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=void 0,this.detachTabsListener()}detachTabsListener(){this.slottedTabs?.removeEventListener("selected-changed",this.selectedChangedListener),this.slottedTabs=void 0}tabsSlotChanged(e){this.detachTabsListener();const i=e.target.assignedElements().find(a=>"selected"in a);i&&(this.slottedTabs=i,i.addEventListener("selected-changed",this.selectedChangedListener),i.selected=this.selected)}select(e){this.selected=e,this.slottedTabs&&(this.slottedTabs.selected=e)}updated(){this.slottedTabs&&this.slottedTabs.selected!=this.selected&&(this.slottedTabs.selected=this.selected)}render(){return o`
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
        `}};Tt.styles=T`
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
    `;mi([m({type:Array})],Tt.prototype,"tabLabels",2);mi([g()],Tt.prototype,"mode",2);mi([g()],Tt.prototype,"selected",2);Tt=mi([_("mateu-adaptive-tabs")],Tt);const cs=(e,t,i,a,s,r,n)=>{const l=t.metadata;let c=t.style;return c==null&&(c=""),l.columnSpacing&&(c+="--vaadin-form-layout-column-spacing: "+l.columnSpacing+";"),l.itemRowSpacing&&(c+="--vaadin-form-layout-row-spacing: "+l.itemRowSpacing+";"),l.itemLabelSpacing&&(c+="--vaadin-form-layout-label-spacing: "+l.itemLabelSpacing+";"),l.labelsAside&&(c+="--vaadin-form-item-label-width: 92px;"),l.fullWidth&&(c+="width: 100%;"),o`
               <vaadin-form-layout 
                       .responsiveSteps="${l.responsiveSteps||d}"  
                       style="${c||d}" 
                       class="${t.cssClasses}"
                       max-columns="${l.maxColumns&&l.maxColumns>0?l.maxColumns:d}"
                       auto-responsive="${l.autoResponsive||d}"
                       column-width="${l.columnWidth||d}"
                       expand-columns="${l.expandColumns||d}"
                       expand-fields="${l.expandFields||d}"
                       labels-aside="${l.labelsAside||d}"
                       slot="${t.slot||d}"
               >
                   ${t.children?.map(u=>Sa(l,e,u,i,a,s,r,n))}
               </vaadin-form-layout>
            `},Sa=(e,t,i,a,s,r,n,l)=>i.type==U.ClientSide&&i.metadata?.type==h.FormRow?hs(e,t,i,a,s,r,n,l):e.labelsAside?us(t,i,a,s,r,n,l):b(t,i,a,s,r,n,l),us=(e,t,i,a,s,r,n)=>{if(t.type==U.ClientSide&&t.metadata?.type==h.FormField&&t.metadata.label){const l=t.metadata,c=l.label?.includes("${")?e._evalTemplate(l.label):l.label;return o`
                       <vaadin-form-item data-colspan="${l.colspan}">
                           <label slot="label">${c}</label>
                           ${b(e,t,i,a,s,r,n,!0)}
                       </vaadin-form-item>
                   `}return b(e,t,i,a,s,r,n)},hs=(e,t,i,a,s,r,n,l)=>o`
        <vaadin-form-row>
            ${i.children?.map(c=>Sa(e,t,c,a,s,r,n,l))}
        </vaadin-form-row>
            `,ps=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.verticalAlignment&&(u=u?"align-items: "+l.verticalAlignment+";"+u:"align-items: "+l.verticalAlignment+";"),o`
               <vaadin-horizontal-layout 
                       style="${u}" 
                       class="${t.cssClasses}"
                       theme="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(p=>b(e,p,i,a,s,r,n))}
               </vaadin-horizontal-layout>
            `},ms=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=(l.padding?" padding":"")+(l.spacing?" spacing":"")+(l.spacingVariant?" spacing-"+l.spacingVariant:"")+(l.wrap?" wrap":"");let u=t.style;return l.fullWidth&&(u=u?"width: 100%;"+u:"width: 100%;"),l.justification&&(u=u?"justify-content: "+l.justification+";"+u:"justify-content: "+l.justification+";"),l.horizontalAlignment&&(u=u?"align-items: "+l.horizontalAlignment+";"+u:"align-items: "+l.horizontalAlignment+";"),o`
        <vaadin-vertical-layout
                style="${u}"
                class="${t.cssClasses}"
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(p=>b(e,p,i,a,s,r,n))}
        </vaadin-vertical-layout>
    `},vs=(e,t,i,a,s,r,n)=>{const l=t.metadata;let c=t.style;return l.fullWidth&&(c=c?"width: 100%;"+c:"width: 100%;"),o`
               <vaadin-split-layout 
                       style="${c}" 
                       class="${t.cssClasses}"
                       orientation="${l.orientation??d}"
                       theme="${l.variant??d}"
                       slot="${t.slot??d}"
               >
                   <master-content>${b(e,t.children[0],i,a,s,r,n)}</master-content>
                   <detail-content>${b(e,t.children[1],i,a,s,r,n)}</detail-content>
               </vaadin-split-layout>
            `},fs=(e,t,i,a,s,r,n)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=s?.detailComponent??null,u=!!s?.hasDetail||!!l,p=c??l;return o`
               <vaadin-master-detail-layout ?has-detail="${u}"
                                            style="${t.style}"
                                            class="${t.cssClasses}"
                                            slot="${t.slot??d}">
                   <div>${b(e,t.children[0],i,a,s,r,n)}</div>
                   ${u&&p?o`<div slot="detail">${b(e,p,i,a,s,r,n)}</div>`:o`<div slot="detail" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Select an item to view details</div>`}
               </vaadin-master-detail-layout>
            `},bs=(e,t,i,a,s,r,n)=>{const l=t.metadata;let c=t.style;c==null&&(c=""),l.fullWidth&&(c+="width: 100%;");let u=l.variant;u=="equalWidth"&&(u="equal-width-tabs");const p=Math.max(0,(t.children??[]).findIndex(f=>f.metadata.active)),v=f=>{f.target.selected=p};if(l.adaptable){const f=(t.children??[]).map(y=>{const x=y.metadata.label;return x?.includes("${")?e._evalTemplate(x):x});return o`
            <mateu-adaptive-tabs
                    .tabLabels="${f}"
                    style="${c}"
                    class="${t.cssClasses}"
                    slot="${t.slot??d}"
            >
                <vaadin-tabs slot="tabs"
                             theme="${u??d}"
                             orientation="${l.orientation??d}"
                             @items-changed=${v}
                >
                    ${t.children?.map(y=>y).map((y,x)=>{const $=y.metadata.shortcut;return o`
                        <vaadin-tab id="${f[x]}"
                                    style="${y.style}"
                                    class="${y.cssClasses}"
                                    data-shortcut="${$??d}"
                        >${f[x]}</vaadin-tab>`})}
                </vaadin-tabs>

                ${t.children?.map((y,x)=>o`
                    <div slot="panel-${x}" style="padding: var(--lumo-space-m) 0;">
                        ${y.children?.map($=>b(e,$,i,a,s,r,n))}
                    </div>`)}
            </mateu-adaptive-tabs>
                `}return o`
        <vaadin-tabsheet
                theme="${u??d}"
                style="${c}"
                slot="${t.slot??d}"
        >
            <vaadin-tabs slot="tabs"
                         style="${c}"
                         class="${t.cssClasses}"
                         orientation="${l.orientation??d}"
                         @items-changed=${v}
            >
                ${t.children?.map(f=>f).map(f=>{const y=f.metadata.label,x=y?.includes("${")?e._evalTemplate(y):y,$=f.metadata.shortcut;return o`
                    <vaadin-tab id="${x}"
                                style="${f.style}"
                                class="${f.cssClasses}"
                                data-shortcut="${$??d}"
                    >${x}</vaadin-tab>`})}
            </vaadin-tabs>

            ${t.children?.map(f=>gs(e,f,i,a,s,r,n))}
        </vaadin-tabsheet>
            `},gs=(e,t,i,a,s,r,n)=>{const l=t.metadata.label,c=l?.includes("${")?e._evalTemplate(l):l;return o`
        <div tab="${c}" style="padding: var(--lumo-space-m) 0;">
                   ${t.children?.map(u=>b(e,u,i,a,s,r,n))}
               </div>
            `},$s=(e,t,i,a,s,r,n)=>{const l=t.metadata;t.style,l.fullWidth;let c=0;if(t.children){for(let u=0;u<t.children.length;u++)if(t.children[u].metadata?.active){c=u;break}}return o`
               <vaadin-accordion
                       style="${t.style}"
                       class="${t.cssClasses}"
                       opened="${c}"
                       slot="${t.slot??d}"
               >
                   ${t.children?.map(u=>ys(e,u,i,a,s,r,n,l.variant))}
               </vaadin-accordion>
            `},ys=(e,t,i,a,s,r,n,l)=>{const c=t.metadata,u=c.label?.includes("${")?e._evalTemplate(c.label):c.label;return o`
        <vaadin-accordion-panel style="${t.style}"
                                class="${t.cssClasses}"
                                theme="${l??d}"
                                ?opened="${c.active}"
                                ?disabled="${c.disabled}">
            <vaadin-accordion-heading slot="summary">${u}</vaadin-accordion-heading>
            ${t.children?.map(p=>b(e,p,i,a,s,r,n))}
        </vaadin-accordion-panel>
            `},xs=(e,t,i,a,s,r,n)=>o`
               <vaadin-scroller style="${t.style}" 
                                class="${t.cssClasses}"
                                slot="${t.slot??d}">
                   ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
               </vaadin-scroller>
            `,ws=(e,t,i,a,s,r,n)=>o`
               <div style="width: 100%; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
               </div>
            `,Cs=(e,t,i,a,s,r,n)=>o`
               <div style="max-width: min(100%, 1200px); margin: auto; ${t.style}" 
                    class="${t.cssClasses}"
                    slot="${t.slot??d}">
                   ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
               </div>
            `,ks=(e,t,i,a,s,r,n)=>o`
        <vaadin-board style="${t.style}" 
                      class="${t.cssClasses}"
                      slot="${t.slot??d}">
            ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
        </vaadin-board>
            `,Ss=(e,t,i,a,s,r,n)=>o`
        <vaadin-board-row style="${t.style}" class="${t.cssClasses}">
                   ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
               </vaadin-board-row>
            `,Es=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`
        <div style="${t.style}" 
             class="${t.cssClasses}"
             board-cols="${l.boardCols??d}"
        >
                   ${t.children?.map(c=>b(e,c,i,a,s,r,n))}
               </div>
            `},Rt=(e,t)=>new Function(...Object.keys(t),"return `"+e+"`")(...Object.values(t)),zt=(e,t,i)=>({state:e??{},data:t??{},...i});function ye(e,t,i,a){if(!e?.includes("${"))return e;try{return Rt(e,zt(t,i,a))}catch(s){return console.warn(`Mateu: could not interpolate "${e}":`,s),e}}const mt=(e,t,i)=>{if(e&&e.indexOf("${")>=0)try{return Rt(e,zt(t,i))}catch(a){return a.message}return e},qi=(e,t,i,a,s)=>{if(!e)return e;const r=zt(t,i,{appState:a??{},appData:s??{}});let n=e;try{if(n=Rt(e,r),n.includes("${"))try{n=Rt(n,r)}catch(l){n="when evaluating nested "+e+" :"+l+", where data is "+i+" and state is "+t+" and app state is "+a+" and app data is "+s,console.error(l,n,t,i,a,s)}}catch(l){n="when evaluating "+e+" :"+l+", where data is "+i+" and state is "+t+" and app state is "+a+" and app data is "+s,console.error(l,n,t,i,a,s)}return n},Ea=(e,t,i,a,s,r)=>{const n=zt(t,i,{appState:a??{},appData:s??{},...r}),l=Rt(e,n);return new Function(...Object.keys(n),`return (${l})`)(...Object.values(n))},Ia=(e,t,i,a)=>{const s=zt(t,i,a);return new Function(...Object.keys(s),`return (${e})`)(...Object.values(s))},Is=(e,t,i,a)=>Rt(e,zt(t,i,a)),_s=(e,t,i)=>{const a=e.metadata;return o`<vaadin-avatar
            img="${a.image}"
            name="${Ne(a.name,t,i)}"
            abbr="${a.abbreviation}"
            style="${e.style}" class="${e.cssClasses}"
            slot="${e.slot??d}"
    ></vaadin-avatar>`},Ne=(e,t,i)=>typeof e=="string"&&e.includes("${")?ye(e,t,i):e,Ts=e=>{const t=e.metadata;return o`<vaadin-avatar-group max-items-visible="${t.maxItemsVisible}"
                                     .items="${t.avatars}"
                                     style="${e.style}" class="${e.cssClasses}"
                                     slot="${e.slot??d}">
    </vaadin-avatar-group>`},Rs=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=u=>o`
            ${b(e,u,i,a,s,r,n)}
`;return o`
        <vaadin-virtual-list
                .items="${l.page.content}"
                ${Za(c,[])}
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
        ></vaadin-virtual-list>
    `};var Ps=Object.defineProperty,Os=Object.getOwnPropertyDescriptor,Mi=(e,t,i,a)=>{for(var s=a>1?void 0:a?Os(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Ps(t,i,s),s};let Wt=class extends L{constructor(){super(...arguments),this.variant="text",this.count=3}render(){const e=Array.from({length:Math.max(1,this.count)});return this.variant=="card"?o`${e.map(()=>o`<div class="bone card" style="margin: .5em 0;"></div>`)}`:this.variant=="grid"?o`${e.map(()=>o`<div class="bone row"></div>`)}`:this.variant=="form"?o`${e.map(()=>o`
                <div class="form-pair">
                    <div class="bone label"></div>
                    <div class="bone field"></div>
                </div>
            `)}`:o`${e.map(()=>o`<div class="bone line"></div>`)}`}};Wt.styles=T`
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
    `;Mi([m()],Wt.prototype,"variant",2);Mi([m({type:Number})],Wt.prototype,"count",2);Wt=Mi([_("mateu-skeleton")],Wt);const Ls=(e,t)=>{t&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},vt=(e,t,i,a,s,r)=>o`
        <div class="mateu-empty-state"
             style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .35rem; padding: var(--lumo-space-l, 1.5rem); text-align: center; color: var(--lumo-secondary-text-color, #666);">
            <span style="font-size: 1.8rem; line-height: 1; opacity: .6;">${t??"🗂"}</span>
            ${i?o`<span style="font-weight: 600; color: var(--lumo-body-text-color, #333);">${i}</span>`:d}
            <span style="font-size: var(--lumo-font-size-s, .875rem);">${a??e??"Nothing here yet."}</span>
            ${s&&r?o`
                <vaadin-button theme="tertiary" style="margin-top: .25rem;" @click="${n=>Ls(n,s)}">${r}</vaadin-button>
            `:d}
        </div>
    `,Ds=e=>{const t=e.metadata;return o`
        <div style="${e.style??d}" class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${vt(void 0,t.icon,t.title,t.description,t.actionId,t.actionLabel)}
        </div>
    `},zs=e=>{const t=e.metadata;return o`
        <mateu-skeleton
                variant="${t.variant??"text"}"
                count="${t.count&&t.count>0?t.count:3}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-skeleton>
    `};var We=(e=>(e.NONE="NONE",e.INFO="INFO",e.SUCCESS="SUCCESS",e.WARNING="WARNING",e.DANGER="DANGER",e))(We||{});const As=(e,t,i)=>{const a=e[i.path];return a?o`<span theme="badge pill ${vi(a.type)}">${a.message}</span>`:o``},vi=e=>{switch(e){case We.SUCCESS:return"success";case We.WARNING:return"warning";case We.DANGER:return"error";case We.NONE:return"contrast"}return""},Fs=(e,t,i)=>{const s=e[i.path]?"vaadin:check":"vaadin:minus";return o`<vaadin-icon 
                    icon="${s}"
                    style="height: 16px; width: 16px; color: ${"var(--lumo-body-text-color)"};"
            ></vaadin-icon>`},Ns=(e,t,i,a,s)=>{const r=e[i.path];let n=r;return a=="money"&&r&&r.locale&&r.currency?n=new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(r.value):s=="money"&&(n=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(r)),o`${n}`},Qi=(e,t,i)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:i},bubbles:!0,composed:!0}))},qs=(e,t,i,a,s,r)=>{const n=i.xcolumn??r;if(n.text){if(n.actionId)return o`<a href="javascript: void(0);" @click="${u=>Qi(i,n,e)}">${n.text}</a>`;const c=e[i.path];return o`<a href="${c}">${n.text}</a>`}if(a=="string"){if(n.actionId){const u=e[i.path];return o`<a href="javascript: void(0);" @click="${p=>Qi(i,n,e)}">${u}</a>`}const c=e[i.path];return o`<a href="${c}">${c}</a>`}const l=e[i.path];return o`<a href="${l.href}">${l.text}</a>`},Ms=(e,t,i,a,s)=>a=="string"?e[i.path].split(",").map(l=>o`<vaadin-icon icon="${l}" style="width: 16px;"></vaadin-icon>`):e[i.path].split(",").map(n=>o`<vaadin-icon icon="${n.icon}" style="width: 16px;"></vaadin-icon>`),Us=(e,t,i,a,s)=>{const r=e[i.path];return o`${de(r)}`},Bs=(e,t,i,a,s,r)=>{if(a=="string"){const l=e[i.path],c="max-height: 40px; "+(r.style??"");return o`<img src="${l}" style="${c}">`}const n=e[i.path];return o`<img src="${n.src}" style="${r.style??""}">`},js=e=>{const t={_clickedRow:e.target.row};e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+e.detail.value.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Zi=e=>{const t={_clickedRow:e.target.row},i=e.target.action;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-"+i.methodNameInCrud,parameters:t},bubbles:!0,composed:!0}))},Ws=e=>{const t=document.createElement("vaadin-context-menu-item"),i=document.createElement("vaadin-icon");return i.style.color="var(--lumo-secondary-text-color)",i.style.marginInlineEnd="var(--lumo-space-s)",i.style.padding="var(--lumo-space-xs)",i.setAttribute("icon",e.icon),t.appendChild(i),e.label&&t.appendChild(document.createTextNode(e.label)),t.disabled=e.disabled,t},ea=(e,t,i)=>{const a=e[i.path]?.actions?.map(s=>s.icon?{component:Ws(s),methodNameInCrud:s.methodNameInCrud}:{...s,text:s.label});return!a||a.length==0?o``:o`
                                     <vaadin-menu-bar
                                         .items=${[{text:"···",children:a}]}
                                         theme="tertiary"
                                         .row="${e}"
                                         data-testid="menubar-${i.path}"
                                         @item-selected="${js}"
                                     ></vaadin-menu-bar>
                                   `},Vs=(e,t,i)=>{if(i.path=="select"){const r={actionId:i.path,icon:"",label:"Select",disabled:!1,methodNameInCrud:"select"};return o`
         <vaadin-button theme="tertiary" title="Select" @click="${Zi}" .row="${e}" .action="${r}">
             Select
         </vaadin-button>
    `}const a=i.path&&e[i.path].methodNameInCrud?e[i.path]:e.action,s=a.icon&&!a.label;return o`
         <vaadin-button theme="tertiary${s?" icon":""}" title="${a.label||d}" @click="${Zi}" .row="${e}" .action="${a}">
             ${a.icon?o`<vaadin-icon icon="${a.icon}"></vaadin-icon>`:d}
             ${a.label?a.label:d}
         </vaadin-button>
    `},Hs=(e,t,i)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:i},bubbles:!0,composed:!0}))},Gs=(e,t,i,a,s,r)=>{const n=i.xcolumn??r;if(n.actionId){const c=n.text||e[i.path];return o`
            <vaadin-button theme="tertiary" @click="${u=>Hs(i,n,e)}" .row="${e}">
                ${c}
            </vaadin-button>
        `}const l=e[i.path];return o`<a href="${l}">${n.text||l}</a>`},Ks=(e,t,i,a,s,r,n,l,c)=>{const u=e[i.path];return b(a,u,s,r,n,l,c)},Pi=new WeakMap,Js=(e,t)=>Pi.get(e)?.[t],Ys=(e,t,i)=>{let a=Pi.get(e);a||(a={},Pi.set(e,a)),a[t]=i},ta=e=>{if(e==null||e==="")return null;const t=Number(e);return Number.isNaN(t)?null:t},Xs=(e,t,i,a)=>{const s=i?.field?.fieldId,r=c=>{if(e[t.id]===c||e[t.id]==null&&(c===""||c==null))return;if(e[t.id]=c,!s){i.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"update-row",parameters:{_editedRow:{...e}}},bubbles:!0,composed:!0}));return}const u=a[s];i.dispatchEvent(new CustomEvent("value-changed",{detail:{fieldId:s,value:Array.isArray(u)?[...u]:u},bubbles:!0,composed:!0}))},n=e[t.id],l=n==null?"":String(n);switch(t.editorType){case"boolean":return o`<vaadin-checkbox ?checked=${!!n} @checked-changed=${c=>r(c.detail.value)}></vaadin-checkbox>`;case"integer":return o`<vaadin-integer-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(ta(c.target.value))}></vaadin-integer-field>`;case"number":return o`<vaadin-number-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(ta(c.target.value))}></vaadin-number-field>`;case"date":return o`<vaadin-date-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-picker>`;case"time":return o`<vaadin-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-time-picker>`;case"datetime":return o`<vaadin-date-time-picker theme="small" style="width:100%;" .value=${l} @value-changed=${c=>r(c.detail.value)}></vaadin-date-time-picker>`;case"select":return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                .items=${(t.editorOptions??[]).map(c=>({label:c.label,value:String(c.value)}))}
                item-label-path="label" item-value-path="value"
                .value=${l}
                @value-changed=${c=>r(c.detail.value)}></vaadin-combo-box>`;case"lookup":{const c=i?.field?.fieldId,u=`search-${c}-${t.id}`,p=`${c}-${t.id}`,f=(t.editorOptions??[]).find(x=>String(x.value)===l)??(l?{value:l,label:Js(e,t.id)??l}:void 0);return o`<vaadin-combo-box
                theme="small" style="width:100%;"
                item-label-path="label" item-id-path="value"
                .dataProvider=${(x,$)=>{i.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:u,parameters:{searchText:x.filter,size:x.pageSize,page:x.page},callback:k=>{const E=k?.fragments?.[0]?.data?.[p];$(E?.content??[],E?.totalElements??0)},callbackonly:!0},bubbles:!0,composed:!0}))}}
                .selectedItem=${f}
                @selected-item-changed=${x=>{const $=x.detail.value,k=$?$.value:null;String(k??"")!==l&&($&&Ys(e,t.id,$.label),r(k))}}></vaadin-combo-box>`}default:return o`<vaadin-text-field theme="small" style="width:100%;" .value=${l} @change=${c=>r(c.target.value)}></vaadin-text-field>`}},Ei=e=>es(()=>o`<span title="${e}" style="white-space:normal;overflow-wrap:break-word;">${e}</span>`,[e]),Qs=e=>{e.preventDefault(),e.stopPropagation(),e.currentTarget?.dispatchEvent(new CustomEvent("sort-direction-changed",{detail:{grid:e.currentTarget.parentElement},bubbles:!0,composed:!0}))},Zs=(e,t,i,a,s,r,n)=>{const l=ye(e.label,a,s);return o`
<vaadin-grid-column-group header="${l}">
    ${e.columns.map(c=>_a(c.metadata,t,i,a,s,r,n))}
</vaadin-grid-column-group>
`},Ui=(e,t,i,a,s,r,n)=>h.GridGroupColumn==e.metadata?.type?Zs(e.metadata,t,i,a,s,r,n):_a(e.metadata,t,i,a,s,r,n),_a=(e,t,i,a,s,r,n)=>{const l=ye(e.label,a,s);return e.sortable?o`
                        <vaadin-grid-sort-column
                                path="${e.id}"
                                text-align="${e.align??d}"
                                ?frozen="${e.frozen}"
                                ?frozen-to-end="${e.frozenToEnd}"
                                ?auto-width="${e.autoWidth}"
                                flex-grow="${e.flexGrow??d}"
                                ?resizable="${e.resizable}"
                                width="${e.width??d}"
                                @direction-changed="${Qs}"
                                data-data-type="${e.dataType}"
                                data-stereotype="${e.stereotype}"
                                ${Ei(l)}
                                ${Ve((c,u,p)=>ni(c,u,p,e,t,i,a,s,r,n),[])}
                        ></vaadin-grid-sort-column>
                    `:e.filterable?o`
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
                                ${Ei(l)}
                                ${Ve((c,u,p)=>ni(c,u,p,e,t,i,a,s,r,n),[])}
                        ></vaadin-grid-filter-column>
                    `:o`
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
                                ${Ei(l)}
                                ${Ve((c,u,p)=>ni(c,u,p,e,t,i,a,s,r,n),[])}
                        ></vaadin-grid-column>
                    `},ni=(e,t,i,a,s,r,n,l,c,u)=>{const p=i.dataset.dataType??"",v=i.dataset.stereotype??"";if(a.editable)return Xs(e,a,s,n);if(p=="status")return As(e,t,i);if(p=="bool")return Fs(e,t,i);if(p=="money"||v=="money")return Ns(e,t,i,p,v);if(p=="link"||v=="link")return qs(e,t,i,p,v,a);if(p=="icon"||v=="icon")return Ms(e,t,i,p);if(v=="html")return Us(e,t,i);if(v=="image")return Bs(e,t,i,p,v,a);if(p=="menu")return ea(e,t,i);if(p=="component")return Ks(e,t,i,s,r,n,l,c,u);if(p=="action")return Vs(e,t,i);if(p=="actionGroup")return ea(e,t,i);if(v=="button"||a.actionId)return Gs(e,t,i,p,v,a);const f=e[i.path];return o`<span title="${f}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">${f}</span>`},er=(e,t,i,a,s,r,n)=>{const l=t.metadata;if(l.tree){const u=async(p,v)=>{const f=p.parentItem?p.parentItem.children:l.page.content;v(f,f.length)};return o`
        <vaadin-grid style="${t.style}" class="${t.cssClasses}"
                     .itemHasChildrenPath="${"children"}" .dataProvider="${u}"
                     slot="${t.slot??d}"
                     all-rows-visible
        >
            ${l.content.map((p,v)=>{const f=p.metadata;return v>0?o`
            <vaadin-grid-column path="${p.id}"
                                header="${f?.label??d}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??d}"
                                width="${f?.width??d}"
                                .column="${p.metadata}"
                                ${Ve((y,x,$)=>ni(y,x,$,f,e,i,a,s,r,n),[])}></vaadin-grid-column>
`:o`
            <vaadin-grid-tree-column path="${p.id}"
                                header="${f?.label??d}"
                                ?auto-width="${f?.autoWidth}"
                                flex-grow="${f?.flexGrow??d}"
                                width="${f?.width??d}"
            ></vaadin-grid-tree-column>
`})}
            <span slot="empty-state">${vt()}</span>
        </vaadin-grid>
    `}let c=l.page?.content;return t.id&&a&&a[t.id]&&(c=a[t.id]),c||(c=[]),o`
        <vaadin-grid 
                style="${t.style}" 
                class="${t.cssClasses}" 
                .items="${c}"
                all-rows-visible
        >
            ${l?.content?.map(u=>Ui(u,e,i,a,s,r,n))}
        </vaadin-grid>
    `},tr=e=>{const i=(e.metadata.items??[]).map(a=>({text:a.text,time:a.time,userName:a.userName,userImg:a.userImg,userAbbr:a.userAbbr,userColorIndex:a.userColorIndex}));return o`
        <vaadin-message-list
                markdown
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                .items="${i}"
        ></vaadin-message-list>
    `},at=new is,K={value:{}},Vt={value:{}},ir=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`
        <vaadin-context-menu .items=${Bi(e,l.menu,i,a,s,r,n)} 
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             open-on="${l.activateOnLeftClick?"click":d}"
                             slot="${t.slot??d}">
            ${b(e,l.wrapped,i,a,s,r,n)}
        </vaadin-context-menu>
            `},ar=(e,t,i,a,s)=>{const r=t.metadata;return o`
        <vaadin-menu-bar .items=${Bi(e,r.options,i,a,s,K,Vt)}
                         style="${t.style}" class="${t.cssClasses}"
                         slot="${t.slot??d}">
        </vaadin-menu-bar>
            `},ia=(e,t,i,a,s,r,n)=>{const l=document.createElement("vaadin-context-menu-item");return xa(b(e,t,i,a,s,r,n),l),l},Bi=(e,t,i,a,s,r,n)=>t.map(l=>l.submenus?{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?ia(e,l.component,i,a,s,r,n):void 0,children:Bi(e,l.submenus,i,a,s,r,n)}:l.separator?{component:"hr"}:{text:l.component?void 0:l.label,route:l.path,checked:l.selected,disabled:l.disabled,className:l.className,component:l.component?ia(e,l.component,i,a,s,r,n):void 0}),sr=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`
        <vaadin-custom-field label="${l.label}"
                             style="${t.style}" 
                             class="${t.cssClasses}"
                             slot="${t.slot??d}"
                             data-colspan="${l.colspan||d}"
        >
            ${b(e,l.content,i,a,s,r,n)}
        </vaadin-custom-field>
            `},rr=e=>{const t=e.metadata,i=a=>{const s=a.detail?.value??"";!t.actionId||!s.trim()||a.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,parameters:{message:s}},bubbles:!0,composed:!0}))};return o`
        <vaadin-message-input
                style="${e.style}" class="${e.cssClasses}"
                slot="${e.slot??d}"
                @submit="${i}"
        ></vaadin-message-input>
    `},or=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`
        <div id="show-notifications">${b(e,l.wrapped,i,a,s,r,n)}</div>
        <vaadin-tooltip
                style="${t.style}" class="${t.cssClasses}"
                slot="${t.slot??d}"
                for="show-notifications" text="${l.text}" position="top-start"></vaadin-tooltip>
    `},nr=e=>{if(e instanceof CustomEvent)return e.detail;const t={};for(const i in e){const a=e[i];["number","string","boolean"].indexOf(typeof a)>=0&&(t[i]=e[i])}return t},aa=(e,t,i)=>{for(let a in t.attributes)e.setAttribute(a,t.attributes[a]);i.style&&e.setAttribute("style",i.style),i.cssClasses&&e.setAttribute("class",i.cssClasses),i.slot&&e.setAttribute("slot",i.slot),t.content&&(t.html?e.innerHTML=t.content:e.append(t.content))},lr=e=>{const t=e.name;t.startsWith("vaadin-chart")&&!customElements.get(t)&&ce(()=>import("./vendor-highcharts.js"),__vite__mapDeps([0,1,2,3]));const i=e.attributes?e.attributes.import:void 0;i&&t.includes("-")&&!customElements.get(t)&&import(i)},dr=(e,t,i)=>{lr(t);let a=t.name;return t.attributes&&t.attributes.id&&(a="#"+t.attributes.id),setTimeout(()=>{const s=e.shadowRoot?.querySelector(".element-container")?.querySelector(a);if(s){for(;s.firstChild;)s.removeChild(s.lastChild);aa(s,t,i)}else{const r=document.createElement(t.name);aa(r,t,i);for(let n in t.on)r.addEventListener(n,l=>{const c=nr(l);e.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.on[n],parameters:{event:c}},bubbles:!0,composed:!0}))});e.shadowRoot?.querySelector(".element-container")?.appendChild(r)}}),o`<div class="element-container"></div>`};var V=(e=>(e.div="div",e.p="p",e.h1="h1",e.h2="h2",e.h3="h3",e.h4="h4",e.h5="h5",e.h6="h6",e.span="span",e))(V||{});const cr=(e,t,i,a,s)=>{const r=e.metadata,n=r.attributes?.["data-colspan"],l=qi(r.text,t,i,a,s);return V.h1==r.container?o`
            <h1 style="${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h1>
        `:V.h2==r.container?o`
            <h2 style="${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h2>
        `:V.h3==r.container?o`
            <h3 style="${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h3>
        `:V.h4==r.container?o`
            <h4 style="${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h4>
        `:V.h5==r.container?o`
            <h5 style="${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h5>
        `:V.h6==r.container?o`
            <h6 style="${e.style}" class="${e.cssClasses}"
                id="${O(e.id)}"
                data-colspan="${O(n)}"
                slot="${e.slot??d}">
                ${l??d}
            </h6>
        `:V.p==r.container?o`
               <p style="${e.style}" class="${e.cssClasses}"
                  id="${O(e.id)}"
                  data-colspan="${O(n)}"
                  slot="${e.slot??d}">
                   ${l??d}
               </p>
            `:V.div==r.container?o`
               <div style="${e.style}" class="${e.cssClasses}"
                    id="${O(e.id)}"
                    data-colspan="${O(n)}"
                    slot="${e.slot??d}">${l?de(l):d}</div>
            `:V.span==r.container?o`
               <span style="${e.style}" class="${e.cssClasses}"
                     id="${O(e.id)}"
                     data-colspan="${O(n)}"
                    slot="${e.slot??d}">${l??d}</span>
            `:o`
               <p
                       id="${O(e.id)}"
                       data-colspan="${O(n)}"
                       slot="${e.slot??d}">
                   Unknown text container: ${r.container} 
               </p>
            `},ur=(e,t,i)=>{const a=e.metadata;return o`<span theme="badge ${a.color} ${a.pill?"pill":""} ${a.small?"small":""} ${a.primary?"primary":""}"
                      style="${e.style}" class="${e.cssClasses}"
                      slot="${e.slot??d}">${Ne(a.text,t,i)}</span>`},hr=(e,t,i)=>{const a=Ne(e.text,t,i);if(!a)return d;let s=Ne(e.color,t,i);return s=="SUCCESS"&&(s="success"),s=="ERROR"&&(s="error"),s=="DANGER"&&(s="error"),s=="WARNING"&&(s="warning"),s=="INFO"&&(s="info"),s=="PRIMARY"&&(s="primary"),s=="SECONDARY"&&(s="secondary"),s=="TERTIARY"&&(s="tertiary"),s=="QUATERNARY"&&(s="quaternary"),s=="LIGHT"&&(s="light"),s=="DARK"&&(s="dark"),o`<span theme="badge ${s} ${e.pill?"pill":""} ${e.small?"small":""} ${e.primary?"primary":""}">${a}</span>`},pr=e=>{const t=e.metadata;return o`<a href="${t.url}" style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}">${t.text}</a>`},Ta=(e,t)=>{const i=e.toLowerCase().split("+");return t.ctrlKey===i.includes("ctrl")&&t.altKey===i.includes("alt")&&t.shiftKey===i.includes("shift")&&t.metaKey===i.includes("meta")},mr=(e,t)=>{if(!Ta(e,t))return!1;const i=e.toLowerCase().split("+"),a=i[i.length-1];return!!(t.key.toLowerCase()===a||/^[a-z]$/.test(a)&&t.code==="Key"+a.toUpperCase()||/^[0-9]$/.test(a)&&(t.code==="Digit"+a||t.code==="Numpad"+a))},vr=e=>e?e.split("+").map(t=>t.length<=1?t.toUpperCase():t.charAt(0).toUpperCase()+t.slice(1)).join("+"):void 0,fr=(e,t)=>{const i=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i,parameters:t.parameters},bubbles:!0,composed:!0}))},br=(e,t,i)=>{const a=e.metadata,s=ye(a.label,t,i);let r="";return a.buttonStyle&&(r+=" "+a.buttonStyle),a.color&&a.color!=="none"&&a.color!=="normal"&&(r+=" "+a.color),a.size&&a.size!=="none"&&a.size!=="normal"&&(r+=" "+a.size),o`<vaadin-button
id="${e.id}"
            data-action-id="${a.actionId}"
            @click="${n=>fr(n,a)}"
            style="${e.style}"
            class="${e.cssClasses}"
            theme="${r}"
            ?disabled="${a.disabled}"
            title="${a.shortcut?`${s} (${vr(a.shortcut)})`:d}"
            slot="${e.slot??d}"
    >${a.iconOnLeft?o`<vaadin-icon icon="${a.iconOnLeft}"></vaadin-icon>`:d}${s}${a.iconOnRight?o`<vaadin-icon icon="${a.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>`},gr=(e,t,i,a,s,r,n)=>{const l=t.metadata;if(!l)return o``;let c="";return l.variants?.map(u=>u=="stretchMedia"?"stretch-media":u=="coverMedia"?"cover-media":u).forEach(u=>c+=" "+u),c=c.trim(),o`
        <vaadin-card
                style="${t.style}" 
                class="${t.cssClasses}" 
                theme="${c}"
                slot="${t.slot??d}"
        >
            ${l.media?pt(e,l.media,i,a,s,r,n,"media",!1):d}
            ${l.title?pt(e,l.title,i,a,s,r,n,"title",!1):d}
            ${l.subtitle?pt(e,l.subtitle,i,a,s,r,n,"subtitle",!1):d}
            ${l.header?pt(e,l.header,i,a,s,r,n,"header",!1):d}
            ${l.headerPrefix?pt(e,l.headerPrefix,i,a,s,r,n,"header-prefix",!1):d}
            ${l.headerSuffix?pt(e,l.headerSuffix,i,a,s,r,n,"header-suffix",!1):d}
            ${l.footer?pt(e,l.footer,i,a,s,r,n,"footer",!1):d}
            ${l.content?b(e,l.content,i,a,s,r,n,!1):d}
        </vaadin-card>
    `},$r=e=>{const t=e.metadata;return o`
        <mateu-chart 
                style="${e.style}" 
                class="${e.cssClasses}"
                slot="${e.slot??d}" 
                type="${t.chartType}" 
                .data="${t.chartData}" 
                .options="${t.chartOptions}"
        >
        </mateu-chart>
    `},yr=e=>{const t=e.metadata;return o`
        <vaadin-icon icon="${t.icon}" style="${e.style}" class="${e.cssClasses}"
                     slot="${e.slot??d}"></vaadin-icon>
    `},xr=(e,t,i,a,s,r,n)=>{const l=t.metadata;let c=!1;if(l.openedCondition)try{c=Ea(l.openedCondition,a,s,r,n)}catch(u){console.error("when evaluating "+l.openedCondition+" :"+u+", where data is "+s+" and state is "+a)}return o`
        <vaadin-confirm-dialog
  header="${l.header}"
  ?cancel-button-visible="${l.canCancel}"
  ?reject-button-visible="${l.canReject}"
  reject-text="${l.rejectText}"
  confirm-text="${l.confirmText}"
  .opened="${c}"
  style="${t.style}" class="${t.cssClasses}"
  slot="${t.slot??d}"
>
  ${t.children?.map(u=>b(e,u,i,a,s,r,n))}
</vaadin-confirm-dialog>
            `},wr=e=>{const t=e.metadata;let i;return t.position&&(i={Top:"top",Bottom:"bottom",TopLeft:"top-left",TopRight:"top-right",BottomLeft:"bottom-left",BottomRight:"bottom-right"}[t.position]),o`
        <mateu-cookie-consent style="${e.style}" class="${e.cssClasses}"
                               slot="${e.slot??d}"
                               position="${i??d}"
                               cookie-name="${t.cookieName??d}"
                               .message="${t.message??d}"
                               theme="${t.theme??d}"
                               .learnMore="${t.learnMore??d}"
                               .learnMoreLink="${t.learnMoreLink??d}"
                               .dismiss="${t.dismiss??d}"
        ></mateu-cookie-consent>
    `},Cr=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`
        <vaadin-details 
                ?opened="${l.opened}" 
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            <vaadin-details-summary slot="summary">
            ${b(e,l.summary,i,a,s,r,n)}
            </vaadin-details-summary>
            ${b(e,l.content,i,a,s,r,n)}
        </vaadin-details>
            `},kr=(e,t,i,a,s,r)=>o`
        <mateu-dialog
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${i}"
            .xdata="${a}"
            .appState="${s}"
            .appdata="${r}"
        ></mateu-dialog>
            `,Sr=(e,t,i,a,s,r)=>o`
        <mateu-drawer
                id="${e.metadata.id}"
            .component="${e}"
            baseUrl="${t}"
            .xstate="${i}"
            .xdata="${a}"
            .appState="${s}"
            .appdata="${r}"
        ></mateu-drawer>
            `,Er=e=>{const t=e.metadata;return o`
        <mateu-api-caller>
        <mateu-ux baseUrl="${t.baseUrl}"  
                  route="${t.route}" 
                  consumedRoute="${t.consumedRoute}" 
                  id="${Z()}"
                  serverSideType="${t.serverSideType}"
                  .appState="${t.appState}"
                  style="${e.style}" class="${e.cssClasses}"
                  slot="${e.slot??d}"
        ></mateu-ux>
        </mateu-api-caller>
            `},Ir=e=>{const t=e.metadata;return o`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style}" class="${e.cssClasses}"
                        slot="${e.slot??d}"></mateu-markdown>
            `},_r=e=>{const t=e.metadata;return o`
        <vaadin-notification
                .opened="${!0}"
                slot="${e.slot??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                ${wa(()=>o`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${t.title}</h3>
                        <div>
                            ${t.text}
                        </div>
                    </vaadin-horizontal-layout>
                `,[])}
        ></vaadin-notification>
            `},Tr=(e,t={})=>{const i=e.metadata,a=i.valueKey?t[i.valueKey]:i.value;return o`
        <div style="${e.style}">
        <vaadin-progress-bar
                ?indeterminate="${i.indeterminate}"
                min="${i.min&&i.min!=0?i.min:d}"
                max="${i.max&&i.max!=0?i.max:d}"
                value="${a??d}"
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
        ></vaadin-progress-bar>
        ${i.text?o`<span class="text-secondary text-xs" id="sublbl">
    ${i.text}
  </span>`:d}
        </div>
    `},Rr=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`
        <div id="show-notifications">${b(e,l.wrapped,i,a,s,r,n)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                slot="${t.slot??d}"
                ${Ca(()=>o`${b(e,l.content,i,a,s,r,n)}`,[])}
                style="${t.style}" class="${t.cssClasses}"
        ></vaadin-popover>
    `},Pr=e=>{const t=e.metadata;return o`
        <mateu-map position="${t.position}" zoom="${t.zoom}"
                   style="${e.style}" class="${e.cssClasses}"
                   slot="${e.slot??d}"></mateu-map>
            `},Or=e=>{const t=e.metadata;return o`
        <img src="${t.src}" style="${e.style}" class="${e.cssClasses}"
             slot="${e.slot??d}">
            `},Lr=e=>{const t=e.metadata;return o`<vaadin-horizontal-layout theme="spacing"
                                          slot="${e.slot??d}">
        ${t.breadcrumbs.map(i=>o`
            <a href="${i.link}">${i.text}</a>
            <span>/</span>
        `)}
        <span style="${e.style}" class="${e.cssClasses}">${t.currentItemText}</span>
    </vaadin-horizontal-layout>`},Dr=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`
        <skeleton-carousel 
                id="${t.id}"
                ?dots = "${l.dots}" 
                ?nav = "${l.nav}" 
                ?loop = "${l.loop}"
                style="${t.style}"
                css="${t.cssClasses}"
        >
            ${t.children?.map(c=>o`<div>${b(e,c,i,a,s,r,n)}</div>`)}
        </skeleton-carousel>
    `},zr=(e,t,i,a)=>{const s=e.metadata;return o`
        <div style="display: flex; gap: 3rem; ${e.style}" class="${e.cssClasses}" slot="${e.slot??d}">
            ${s.menu.map(r=>Ra(r))}
        </div>
            `},Ra=e=>o`
        ${e.submenus?o`
                <vaadin-details summary="${e.label}" opened>
                    <vaadin-vertical-layout theme="spacing">
                        ${e.submenus.map(t=>Ra(t))}
                    </vaadin-vertical-layout>
                </vaadin-details>
            `:o`
                <a href="${e.path}">${e.label}</a>
        `}
        `,Ar=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`<div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >${l.content?de(l.content):d}${t.children?.map(c=>b(e,c,i,a,s,r,n))}</div>
    `},Fr=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return o`<vaadin-card
                slot="${t.slot??d}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${t.style}"
                class="${t.cssClasses}"
        >
        ${c?o`<div slot="title" style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color);">${c}</div>`:d}
        ${t.children?.map(u=>b(e,u,i,a,s,r,n))}
    </vaadin-card>
    `},Nr=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=l.title?.includes("${")?e._evalTemplate(l.title):l.title;return o`
        <div
                slot="${t.slot??d}"
                style="${t.style}" class="${t.cssClasses}"
        >
        <h4>${c}</h4>
        ${t.children?.map(u=>b(e,u,i,a,s,r,n))}</div>
    `},Oi=(e,t,i,a,s,r,n,l)=>{const c=t.metadata,u=c?.fabs??[];return o`<mateu-page
            .component="${t}"
            baseUrl="${i}"
            .state="${a}"
            .data="${s}"
            .appState="${r}"
            .appdata="${n}"
            slot="${t.slot??d}"
            style="${t.style}"
            class="${t.cssClasses}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(p=>b(e,p,i,a,s,r,n))}
        ${c?.buttons?.map(p=>o`
                   ${b(e,{id:p.actionId,metadata:p,type:U.ClientSide,slot:"buttons"},void 0,a,s,r,n)}
`)}
        ${u.map((p,v)=>o`
            <button class="page-fab" style="position: fixed; bottom: ${1.5+v*4}rem; right: 5.5rem;"
                @click="${()=>e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:p.actionId},bubbles:!0,composed:!0}))}"
                title="${p.label}">
                <vaadin-icon icon="${p.icon}"></vaadin-icon>
            </button>
        `)}
</mateu-page>
    `},Li=(e,t,i,a,s,r,n,l)=>o`<mateu-table-crud
            id="${t.id}"
            baseUrl="${i}"
            .component="${t}"
            .metadata="${t.metadata}"
            .state="${a}"
            .data="${s}"
            .appState="${r}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            ?standalone="${l??!1}"
    >
        ${t.children?.map(c=>b(e,c,i,a,s,r,n))}
    </mateu-table-crud>`,qr=e=>{const t=e.metadata;return o`
        <mateu-bpmn
                style="${e.style}"
                class="${e.cssClasses}"
                slot="${e.slot??d}"
                xml="${t.xml}"
        >
        </mateu-bpmn>
    `},Mr=(e,t,i)=>{const a=e.metadata;return o`<mateu-chat sseUrl="${a.sseUrl}"
                            style="${e.style}" 
                            class="${e.cssClasses}" 
                            slot="${e.slot??d}"></mateu-chat>`},Ur=e=>{const t=e.metadata;return o`
        <mateu-workflow
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `},Br=e=>{const t=e.metadata;return o`
        <mateu-workflow-elk
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Workflow","steps":[]}'}"
                ?readOnly="${t.readOnly??!1}"
        ></mateu-workflow-elk>
    `},jr=e=>{const t=e.metadata;return o`
        <mateu-form-editor
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
                value="${t.value??'{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `},Pa=`
    background: var(--lumo-base-color, #fff);
    border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
    border-radius: var(--lumo-border-radius-l, 12px);
    padding: var(--lumo-space-m, 1rem);
    box-sizing: border-box;
`,Wr=e=>e=="up"?"var(--lumo-success-text-color, #1a7f37)":e=="down"?"var(--lumo-error-text-color, #c5221f)":"var(--lumo-secondary-text-color, #666)",Vr=e=>e=="up"?"▲":e=="down"?"▼":"",Hr=(e,t)=>{t.actionId&&e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId},bubbles:!0,composed:!0}))},Gr=e=>{const t=e.metadata,i=!!t.actionId;return o`
        <div class="mateu-metric-card ${e.cssClasses??""}"
             style="${Pa} display: flex; flex-direction: column; gap: .25rem; min-width: 11rem; flex: 1; ${i?"cursor: pointer;":""} ${e.style??""}"
             slot="${e.slot??d}"
             role="${i?"button":d}"
             @click="${a=>Hr(a,t)}"
        >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: .5rem;">
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${t.title}</span>
                ${t.icon?o`<vaadin-icon icon="${t.icon}" style="color: var(--lumo-tertiary-text-color, #999); width: 1.1em; height: 1.1em;"></vaadin-icon>`:d}
            </div>
            <div style="display: flex; align-items: baseline; gap: .35rem;">
                <span style="font-size: var(--lumo-font-size-xxxl, 2rem); font-weight: 600; line-height: 1.1;">${t.value}</span>
                ${t.unit?o`<span style="font-size: var(--lumo-font-size-m, 1rem); color: var(--lumo-secondary-text-color, #666);">${t.unit}</span>`:d}
            </div>
            ${t.trend||t.trendLabel?o`
                <span style="font-size: var(--lumo-font-size-s, .875rem); color: ${Wr(t.trend)};">
                    ${Vr(t.trend)} ${t.trendLabel??d}
                </span>
            `:d}
            ${t.description?o`<span style="font-size: var(--lumo-font-size-xs, .8rem); color: var(--lumo-tertiary-text-color, #999);">${t.description}</span>`:d}
        </div>
    `},Kr=(e,t,i,a,s,r,n)=>o`
        <div class="mateu-scoreboard ${t.cssClasses??""}"
             style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); grid-column: 1 / -1; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
        </div>
    `,Jr=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=l.colSpan&&l.colSpan>1?`grid-column: span ${l.colSpan};`:"",u=l.rowSpan&&l.rowSpan>1?`grid-row: span ${l.rowSpan};`:"";return o`
        <div class="mateu-dashboard-panel ${t.cssClasses??""}"
             style="${Pa} display: flex; flex-direction: column; gap: .5rem; min-width: 0; ${c} ${u} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?o`
                <div>
                    <h3 style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem);">${l.title}</h3>
                    ${l.subtitle?o`<span style="font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #666);">${l.subtitle}</span>`:d}
                </div>
            `:d}
            <div style="flex: 1; min-height: 0;">
                ${t.children?.map(p=>b(e,p,i,a,s,r,n))}
            </div>
        </div>
    `},Yr=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=l.columns&&l.columns>0?`repeat(${l.columns}, minmax(0, 1fr))`:"repeat(auto-fit, minmax(20rem, 1fr))";return o`
        <div class="mateu-dashboard ${t.cssClasses??""}"
             style="display: grid; grid-template-columns: ${c}; gap: var(--lumo-space-m, 1rem); align-items: stretch; ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${t.children?.map(u=>b(e,u,i,a,s,r,n))}
        </div>
    `};var Xr=Object.defineProperty,Qr=Object.getOwnPropertyDescriptor,ji=(e,t,i,a)=>{for(var s=a>1?void 0:a?Qr(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Xr(t,i,s),s};let Ht=class extends L{constructor(){super(...arguments),this.panels=[],this.openPanels=new Set,this.initialized=!1}willUpdate(){!this.initialized&&this.panels.length&&(this.openPanels=new Set(this.panels.map((e,t)=>e.open?t:-1).filter(e=>e>=0)),this.initialized=!0)}toggle(e){const t=new Set(this.openPanels);t.has(e)?t.delete(e):t.add(e),this.openPanels=t}render(){return o`
            <div class="overview" part="overview">
                <slot name="overview"></slot>
            </div>
            <div class="rail" part="rail">
                ${this.panels.map((e,t)=>this.openPanels.has(t)?o`
                    <div class="panel" part="panel">
                        <div class="panel-header">
                            <div>
                                <h3>${e.title}</h3>
                                ${e.subtitle?o`<div class="subtitle">${e.subtitle}</div>`:""}
                            </div>
                            <button class="fold" title="Fold" @click="${()=>this.toggle(t)}">⟨</button>
                        </div>
                        <div style="flex: 1; min-height: 0;">
                            <slot name="panel-${t}"></slot>
                        </div>
                    </div>
                `:o`
                    <div class="strip" role="button" title="${e.title}" @click="${()=>this.toggle(t)}">
                        <button class="fold" tabindex="-1">⟩</button>
                        <span>${e.title}</span>
                    </div>
                `)}
            </div>
        `}};Ht.styles=T`
        :host {
            display: flex;
            gap: var(--lumo-space-m, 1rem);
            align-items: stretch;
            min-height: 24rem;
        }
        .overview {
            flex: 0 0 20rem;
            min-width: 0;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            padding: var(--lumo-space-m, 1rem);
            box-sizing: border-box;
            overflow: auto;
        }
        .rail {
            display: flex;
            gap: var(--lumo-space-s, .5rem);
            flex: 1;
            min-width: 0;
            overflow-x: auto;
            align-items: stretch;
        }
        .panel {
            flex: 1 1 22rem;
            min-width: 18rem;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            padding: var(--lumo-space-m, 1rem);
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: .5rem;
            overflow: auto;
        }
        .panel-header {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: .5rem;
        }
        .panel-header h3 {
            margin: 0;
            font-size: var(--lumo-font-size-l, 1.125rem);
        }
        .panel-header .subtitle {
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #666);
        }
        .strip {
            flex: 0 0 2.75rem;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
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
            border: none;
            background: none;
            cursor: pointer;
            color: var(--lumo-secondary-text-color, #666);
            font-size: 1rem;
            padding: 0;
            line-height: 1;
        }
    `;ji([m({type:Array})],Ht.prototype,"panels",2);ji([g()],Ht.prototype,"openPanels",2);Ht=ji([_("mateu-foldout")],Ht);const Zr=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`
        <mateu-foldout
                .panels="${l.panels??[]}"
                style="${t.style}"
                class="${t.cssClasses}"
                slot="${t.slot??d}"
        >
            ${t.children?.map(c=>b(e,c,i,a,s,r,n))}
        </mateu-foldout>
    `},eo=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=!!l.image,u=c?`background-image: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${l.image}'); background-size: cover; background-position: center; color: #fff;`:"",p=l.centered===!1?"flex-start":"center",v=l.centered===!1?"left":"center";return o`
        <div class="mateu-hero ${t.cssClasses??""}"
             style="display: flex; flex-direction: column; align-items: ${p}; justify-content: center; gap: var(--lumo-space-m, 1rem); text-align: ${v}; padding: var(--lumo-space-xl, 2.5rem) var(--lumo-space-l, 1.5rem); border-radius: var(--lumo-border-radius-l, 12px); min-height: ${l.height??"12rem"}; box-sizing: border-box; ${u} ${t.style??""}"
             slot="${t.slot??d}"
        >
            ${l.title?o`<h1 style="margin: 0; font-size: var(--lumo-font-size-xxxl, 2.5rem); line-height: 1.15;">${l.title}</h1>`:d}
            ${l.subtitle?o`<p style="margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); ${c?"":"color: var(--lumo-secondary-text-color, #666);"} max-width: 40rem;">${l.subtitle}</p>`:d}
            ${t.children?.length?o`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); flex-wrap: wrap; justify-content: ${p}; width: 100%; max-width: 40rem;">
                    ${t.children?.map(f=>b(e,f,i,a,s,r,n))}
                </div>
            `:d}
        </div>
    `};var to=Object.defineProperty,io=Object.getOwnPropertyDescriptor,Oa=(e,t,i,a)=>{for(var s=a>1?void 0:a?io(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&to(t,i,s),s};const Ii=1440*60*1e3;let li=class extends L{constructor(){super(...arguments),this.tasks=[]}range(){const e=this.tasks.flatMap(t=>[t.start,t.end]).filter(t=>!!t).map(t=>new Date(t+"T00:00:00").getTime());return e.length?{min:Math.min(...e)-Ii,max:Math.max(...e)+2*Ii}:null}months(e,t){const i=[],a=new Date(e);for(a.setDate(1);a.getTime()<=t;){const s=Math.max(a.getTime(),e),r=new Date(a.getFullYear(),a.getMonth()+1,1),n=Math.min(r.getTime(),t);i.push({label:a.toLocaleDateString(void 0,{month:"short",year:"2-digit"}),from:s,to:n}),a.setMonth(a.getMonth()+1)}return i}render(){const e=this.range();if(!e)return o``;const t=e.max-e.min,i=s=>(s-e.min)/t*100,a=Date.now();return o`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(e.min,e.max).map(s=>o`
                        <div class="month" style="width: ${(s.to-s.from)/t*100}%;">${s.label}</div>
                    `)}
                </div>
                ${this.tasks.map(s=>{const r=new Date(s.start+"T00:00:00").getTime(),n=new Date(s.end+"T00:00:00").getTime()+Ii;return o`
                        <div class="label" title="${s.title}">${s.title}</div>
                        <div class="lane">
                            ${a>=e.min&&a<=e.max?o`<div class="today" style="left: ${i(a)}%;"></div>`:d}
                            <div class="bar"
                                 title="${s.title} · ${s.start} → ${s.end}${s.progress?` · ${s.progress}%`:""}"
                                 style="left: ${i(r)}%; width: ${(n-r)/t*100}%; ${s.color?`--mateu-gantt-fill: ${s.color};`:""}">
                                <div class="fill" style="width: ${s.progress??0}%;"></div>
                            </div>
                        </div>
                    `})}
            </div>
        `}};li.styles=T`
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
    `;Oa([m({type:Array})],li.prototype,"tasks",2);li=Oa([_("mateu-gantt")],li);const ao=e=>{const t=e.metadata;return o`
        <mateu-gantt
                .tasks="${t.tasks??[]}"
                style="${e.style??d}"
                class="${e.cssClasses??d}"
                slot="${e.slot??d}"
        ></mateu-gantt>
    `},so=(e,t)=>{let i=e.style;return e.id&&(i&&!i.endsWith(";")&&(i+=";"),i==null&&(i=""),t[e.id+".hidden"]==!0&&(i+="display: none;")),i},ro=(e,t)=>{let i={...e.metadata};if(e.id&&i){if(i.type==h.Button){const a=i;t[e.id+".disabled"]==!0&&(a.disabled=!0)}if(i.type==h.FormField){const a=i;t[e.id+".disabled"]==!0&&(a.disabled=!0)}}return i},D=e=>t=>e(t.container,t.component,t.baseUrl,t.state,t.data,t.appState,t.appData),oo={[h.Bpmn]:({component:e})=>qr(e),[h.Workflow]:({component:e})=>Ur(e),[h.WorkflowElk]:({component:e})=>Br(e),[h.FormEditor]:({component:e})=>jr(e),[h.Page]:D(Oi),[h.Div]:D(Ar),[h.Directory]:({component:e,baseUrl:t,state:i,data:a})=>zr(e),[h.FormLayout]:D(cs),[h.HorizontalLayout]:D(ps),[h.VerticalLayout]:D(ms),[h.SplitLayout]:D(vs),[h.MasterDetailLayout]:D(fs),[h.TabLayout]:D(bs),[h.AccordionLayout]:D($s),[h.BoardLayout]:D(ks),[h.BoardLayoutRow]:D(Ss),[h.BoardLayoutItem]:D(Es),[h.Scroller]:D(xs),[h.FullWidth]:D(ws),[h.Container]:D(Cs),[h.Form]:({container:e,component:t,baseUrl:i,state:a,data:s,appState:r,appData:n})=>{const l=t.metadata;return o`<mateu-form
            id="${t.id}"
        baseUrl="${i}"
            .component="${t}"
            .values="${a}"
            .state="${a}"
            .data="${s}"
            .appState="${r}"
            .appdata="${n}"
            style="${t.style}"
            class="${t.cssClasses}"
            slot="${t.slot??d}"
            >
                ${t.children?.map(c=>b(e,c,i,a,s,r,n))}
            ${l?.buttons?.map(c=>o`
               ${b(e,{id:c.actionId,metadata:c,type:U.ClientSide,slot:"buttons"},void 0,a,s,r,n)}
`)}

            </mateu-form>`},[h.Table]:({container:e,component:t,baseUrl:i,state:a,data:s,appState:r,appData:n})=>o`<mateu-table
                        id="${t.id}"
        baseUrl="${i}"
            .metadata="${t.metadata}"
            .state="${a}"
                        .data="${s}"
                        .appState="${r}"
                        .appDate="${n}"
                        style="${t.style}" class="${t.cssClasses}"
                        slot="${t.slot??d}"
            >
             ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
            </mateu-table>`,[h.Crud]:D(Li),[h.App]:({container:e,component:t,baseUrl:i,state:a,data:s,appState:r,appData:n})=>o`
            <mateu-app
                        id="${t.id}"
                        baseUrl="${i}"
                        .component="${t}"
                        .state="${a}"
                        .data="${s}"
                        style="${t.style}"
                        class="${t.cssClasses}"
                        .appState="${r}"
                        .appData="${n}"
            >
             ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
         </mateu-app>`,[h.Element]:({container:e,component:t})=>dr(e,t.metadata,t),[h.FormField]:({container:e,component:t,baseUrl:i,state:a,data:s,appState:r,appData:n,labelAlreadyRendered:l})=>{const c=t.metadata;return o`
    <mateu-field
                   id="${t.id}"
                   .component="${t}"
            .field="${t.metadata}"
                   .state="${a}"
                   .data="${s}"
                   .appState="${r}"
                   .appdata="${n}"
                   style="${t.style}" class="${t.cssClasses}"
                   slot="${t.slot??d}"
                   data-colspan="${c.colspan}"
                   .labelAlreadyRendered="${l}"
            >
                    ${t.children?.map(u=>b(e,u,i,a,s,r,n,l))}
                </mateu-field>
        `},[h.Text]:({component:e,state:t,data:i,appState:a,appData:s})=>cr(e,t,i,a,s),[h.Avatar]:({component:e,state:t,data:i})=>_s(e,t,i),[h.Chat]:({component:e,state:t,data:i})=>Mr(e),[h.AvatarGroup]:({component:e})=>Ts(e),[h.Badge]:({component:e,state:t,data:i})=>ur(e,t,i),[h.Breadcrumbs]:({component:e})=>Lr(e),[h.Anchor]:({component:e})=>pr(e),[h.Button]:({component:e,state:t,data:i})=>br(e,t,i),[h.Card]:D(gr),[h.Chart]:({component:e})=>$r(e),[h.Icon]:({component:e})=>yr(e),[h.ConfirmDialog]:D(xr),[h.ContextMenu]:D(ir),[h.CookieConsent]:({component:e})=>wr(e),[h.Details]:D(Cr),[h.Dialog]:({component:e,baseUrl:t,state:i,data:a,appState:s,appData:r})=>kr(e,t,i,a,s,r),[h.Drawer]:({component:e,baseUrl:t,state:i,data:a,appState:s,appData:r})=>Sr(e,t,i,a,s,r),[h.Image]:({component:e})=>Or(e),[h.Map]:({component:e})=>Pr(e),[h.Markdown]:({component:e})=>Ir(e),[h.MicroFrontend]:({component:e})=>Er(e),[h.Notification]:({component:e})=>_r(e),[h.ProgressBar]:({component:e,state:t})=>Tr(e,t),[h.Popover]:D(Rr),[h.CarouselLayout]:D(Dr),[h.Tooltip]:D(or),[h.MessageInput]:({component:e})=>rr(e),[h.MessageList]:({component:e})=>tr(e),[h.CustomField]:D(sr),[h.MenuBar]:({container:e,component:t,baseUrl:i,state:a,data:s})=>ar(e,t,i,a,s),[h.Grid]:D(er),[h.VirtualList]:D(Rs),[h.FormSection]:D(Fr),[h.FormSubSection]:D(Nr),[h.MetricCard]:({component:e})=>Gr(e),[h.Scoreboard]:D(Kr),[h.DashboardPanel]:D(Jr),[h.DashboardLayout]:D(Yr),[h.FoldoutLayout]:D(Zr),[h.HeroSection]:D(eo),[h.EmptyState]:({component:e})=>Ds(e),[h.Skeleton]:({component:e})=>zs(e),[h.Gantt]:({component:e})=>ao(e)},Wi=(e,t,i,a,s,r,n,l)=>{if(!t?.metadata)return t==null?(console.warn("No metadata for component",t),o`<p>No metadata for component</p>`):Wi(e,{id:Z(),metadata:t,type:U.ClientSide},i,a,s,r,n,l);const c=t.metadata.type,u={...t,style:so(t,s),metadata:ro(t,s)},p=oo[c];return p?p({container:e,component:u,baseUrl:i,state:a,data:s,appState:r,appData:n,labelAlreadyRendered:l}):o`<p ${u?.slot??d}>Unknown metadata type ${c} for component ${u?.id}</p>`};var ge=(e=>(e.HAMBURGUER_MENU="HAMBURGUER_MENU",e.MENU_ON_LEFT="MENU_ON_LEFT",e.MENU_ON_TOP="MENU_ON_TOP",e.TABS="TABS",e.TILES="TILES",e.RAIL="RAIL",e.AUTO="AUTO",e.MEDIATOR="MEDIATOR",e))(ge||{});const Vi="mateu-app-context",La="mateu-app-context-labels",Da=e=>{try{return JSON.parse(localStorage.getItem(e)??"{}")}catch{return{}}},sa=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},Hi=()=>Da(Vi),za=()=>Da(La),no=(e,t,i)=>{const a=Hi(),s=za();t==null||t===""?(delete a[e],delete s[e]):(a[e]=t,i!==void 0&&(s[e]=i)),sa(Vi,a),sa(La,s)};let ra=!1;const lo=()=>{ra||(ra=!0,window.addEventListener("storage",e=>{e.key===Vi&&e.newValue!==e.oldValue&&window.location.reload()}))};let _t=[];class co{constructor(){this.axiosInstance=as.create({timeout:6e4}),this.axiosInstance.interceptors.request.use(t=>(this.addAuthToken(t),this.addSessionId(t),t))}addSessionId(t){let i=sessionStorage.getItem("__mateu_sesion_id");i||(i=Z(),sessionStorage.setItem("__mateu_sesion_id",i)),t.headers["X-Session-Id"]=i}addAuthToken(t){const i=localStorage.getItem("__mateu_auth_token");i&&(t.headers.Authorization="Bearer "+i)}async wrap(t,i,a,s){return a||i.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),t.then(r=>(i.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:s}})),r)).catch(r=>{throw r?.code=="ERR_CANCELED"?i.dispatchEvent(new CustomEvent("backend-cancelled-event",{bubbles:!0,composed:!0,detail:{}})):i.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:s,reason:this.serialize(r)}})),r})}serialize(t){return t?.message?t:JSON.stringify(t)}async get(t){const i=new AbortController;return _t=[..._t,i],this.axiosInstance.get(t,{signal:i.signal})}async post(t,i){const a=new AbortController;return _t=[..._t,a],this.axiosInstance.post(t,i,{signal:a.signal})}async abortAll(){_t.forEach(t=>t.abort()),_t=[]}async runAction(t,i,a,s,r,n,l,c,u,p,v){return i&&i.startsWith("/")&&(i=i.substring(1)),n={...Hi(),...n},await this.wrap(this.post(t+"/mateu/v3/sync/"+(i&&i!=""?i:"_no_route"),{serverSideType:l,appState:n,componentState:c,parameters:u,initiatorComponentId:r,consumedRoute:a,route:i&&i!=""?"/"+i:"",actionId:s}).then(f=>f.data),p,v,s)}}const Gi=new co;var uo=Object.defineProperty,ho=Object.getOwnPropertyDescriptor,wt=(e,t,i,a)=>{for(var s=a>1?void 0:a?ho(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&uo(t,i,s),s};let Te=class extends L{constructor(){super(...arguments),this.baseUrl="",this.opened=!1,this.searchText=""}connectedCallback(){super.connectedCallback(),lo()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick(),this.searchTimer&&clearTimeout(this.searchTimer)}currentValue(){return String(Hi()[this.selector.fieldName]??"")}currentLabel(){const e=this.currentValue();if(!e)return"—";const t=(this.searchedOptions??this.selector.options)?.find(a=>String(a.value)===e);if(t)return t.label;const i=za()[this.selector.fieldName];return i!==void 0?String(i):e}pick(e,t){no(this.selector.fieldName,e,t),window.location.reload()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}openPanel(){this.opened||(this.opened=!0,this.searchText="",this.searchedOptions=void 0,this.remoteSearch(),this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick),this.updateComplete.then(()=>this.renderRoot.querySelector("input.picker-search")?.focus()))}closePanel(){this.detachOutsideClick(),this.opened=!1}onSearchInput(e){this.searchText=e.target.value,this.searchTimer&&clearTimeout(this.searchTimer),this.searchTimer=setTimeout(()=>this.remoteSearch(),300)}async remoteSearch(){const e=this.app;if(e?.serverSideType)try{const t=await Gi.runAction(this.baseUrl??"",e.rootRoute??e.initialRoute??"","",`_appcontext-search-${this.selector.fieldName}`,`appcontext-${this.selector.fieldName}`,void 0,e.serverSideType,{},{searchText:this.searchText},this,!0);for(const i of t?.fragments??[]){const r=i.data?.[`_appcontext_${this.selector.fieldName}`]?.content;if(Array.isArray(r)){this.searchedOptions=r.map(n=>({value:n.value,label:n.label??String(n.value)}));return}}}catch{}}visibleOptions(){const e=this.searchedOptions??this.selector.options??[],t=this.searchText.trim().toLowerCase();return t?e.filter(i=>i.label.toLowerCase().includes(t)):e}renderPanel(){const e=this.currentValue(),t=this.visibleOptions(),i=this.searchText!==""||t.length>Te.SEARCHABLE_THRESHOLD;return o`
            <div class="panel">
                ${i?o`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${a=>{a.key==="Escape"&&this.closePanel()}}"/>`:d}
                <div class="options">
                    ${e?o`
                        <div class="option option--clear" @click="${()=>this.pick("")}">— (clear)</div>`:d}
                    ${t.map(a=>o`
                        <div class="option ${e===String(a.value)?"option--selected":""}"
                             @click="${()=>this.pick(a.value,a.label)}">${a.label}</div>`)}
                </div>
            </div>`}render(){return this.selector?o`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${()=>this.opened?this.closePanel():this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened?this.renderPanel():d}
            </label>`:o``}};Te.SEARCHABLE_THRESHOLD=7;Te.styles=T`
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
    `;wt([m()],Te.prototype,"selector",2);wt([m()],Te.prototype,"app",2);wt([m()],Te.prototype,"baseUrl",2);wt([g()],Te.prototype,"opened",2);wt([g()],Te.prototype,"searchText",2);wt([g()],Te.prototype,"searchedOptions",2);Te=wt([_("mateu-app-context-picker")],Te);const Mt=(e,t)=>{const i=e.contextSelectors??[];return i.length===0?d:o`${i.map(a=>o`
        <mateu-app-context-picker .selector="${a}" .app="${e}" .baseUrl="${t.baseUrl??""}"></mateu-app-context-picker>`)}`},oi=(e,t)=>e.themeToggle?o`
        <vaadin-button theme="tertiary icon" @click="${t.toggleTheme}"
            title="${t.isDark?"Switch to light mode":"Switch to dark mode"}"
            style="margin-left: 0.5rem; margin-right: 0.5rem; flex-shrink: 0;">
            <vaadin-icon icon="${t.isDark?"vaadin:sun-o":"vaadin:moon"}" style="color: var(--lumo-body-text-color);"></vaadin-icon>
        </vaadin-button>
    `:d,po=(e,t)=>{t.filter!=e.detail.value&&(t.filter=e.detail.value)},oa=(e,t,i)=>{const a=$e(e,t,i),s=j(t,i);return a=="list"||a==s?"new":a},$e=(e,t,i)=>{const a=e?._route;if(a!=null&&(a===""||a.startsWith("/"))){const s=i.homeRoute??"",r=s.indexOf("?"),n=r>=0?s.substring(r+1):"",l=j(t,i)+a;if(!n)return l;const c=l.indexOf("?")>=0?"&":"?";return l+c+n}return t.selectedRoute?t.selectedRoute:i.homeRoute},j=(e,t)=>e.selectedRoute?e.selectedConsumedRoute??t.route:t.homeConsumedRoute,re=(e,t)=>e.selectedRoute?e.selectedBaseUrl??e.baseUrl:t.homeBaseUrl,oe=(e,t)=>e.selectedRoute?e.selectedServerSideType??t.serverSideType:t.homeServerSideType,ne=(e,t)=>e.selectedRoute?e.selectedUriPrefix:t.homeUriPrefix,mo=(e,t,i,a,s,r,n)=>{const l=e.mapItems(t.menu,e.filter?.toLowerCase()??""),c=j(e,t),u=oa(a,e,t),p=u&&u!=="new"&&u.startsWith(c+"/")?u.substring(c.length+1).split("/")[0]:void 0;return o`
                    ${t.variant==ge.MEDIATOR?o`

                        ${t.layout=="SPLIT"?o`
                            <vaadin-master-detail-layout>
                                <mateu-api-caller>
                                    <div style="display: block; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${j(e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${oe(e,t)}"
                                            uriPrefix="${ne(e,t)}"
                                            style="width: 100%;"
                                            .appState="${{...r,_splitDetailId:p}}"
                                            .appData="${n}"
                                            instant="${c}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>
                                <mateu-api-caller slot="detail">
                                    <div style="padding-left: 1rem; width: calc(100% - 1rem);">
                                    <mateu-ux
                                            route="${oa(a,e,t)}"
                                            id="ux_${e.id}_detail"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${oe(e,t)}"
                                            uriPrefix="${ne(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                    </div>
                                </mateu-api-caller>

                            </vaadin-master-detail-layout>
                        `:o`
                            <mateu-api-caller>
                                <mateu-ux
                                        route="${$e(a,e,t)}"
                                        id="ux_${e.id}"
                                        baseUrl="${re(e,t)}"
                                        consumedRoute="${j(e,t)}"
                                        serverSideType="${oe(e,t)}"
                                        uriPrefix="${ne(e,t)}"
                                        style="width: 100%;"
                                        .appState="${r}"
                                        .appData="${n}"
                                        instant="${e.instant}"
                                        @navigation-requested="${e.updateRoute}"
                                ></mateu-ux>
                            </mateu-api-caller>
                        `}
                        
`:d}
            ${t.variant==ge.HAMBURGUER_MENU?o`
                <vaadin-app-layout style="${t?.style}" class="${t?.cssClasses}" .drawerOpened=${!t.drawerClosed}>
                    <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
                    <h2 slot="navbar" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2><p slot="navbar">${t.subtitle}</p>
                    <vaadin-horizontal-layout slot="navbar" style="margin-left: auto; align-items: center;">
                        <slot name="widgets"></slot>
                        ${Mt(t,e)}${oi(t,e)}
                    </vaadin-horizontal-layout>
                    <vaadin-scroller slot="drawer" class="p-s"
                                     @navigation-requested="${e.updateRoute}">
                        ${t.menu&&t.totalMenuOptions>10?o`
                            <vaadin-text-field style="width: calc(100% - 20px); padding-left: 10px; padding-right: 10px;" @value-changed="${v=>po(v,e)}">
                                <vaadin-icon slot="suffix" icon="vaadin:search"></vaadin-icon>
                            </vaadin-text-field>
                            `:d}

                        <vaadin-side-nav .onNavigate="${e.navItemSelected}">
                            ${e.renderSideNav(l,void 0)}
                        </vaadin-side-nav>
                    </vaadin-scroller>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${$e(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${oe(e,t)}"
                                            uriPrefix="${ne(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .menu="${t.menu}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-app-layout>

            `:d}
            
            ${t.variant==ge.MENU_ON_TOP?o`
                <vaadin-vertical-layout style="width: 100%; height: 100vh; overflow: hidden;">
                    <vaadin-horizontal-layout
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <vaadin-horizontal-layout style="align-items: center;">
                            ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                            ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
                        </vaadin-horizontal-layout>
                        </a>
                        <vaadin-menu-bar
                                .items="${l}"
                                @item-selected="${e.itemSelected}"
                                theme="dropdown-indicators"
                                style="flex-grow: 1; min-width: 0; margin-left: 4rem; margin-top: 1.3rem;"
                                class="menu"
                        >
                        </vaadin-menu-bar>
                        <vaadin-horizontal-layout style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${Mt(t,e)}${oi(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${$e(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${oe(e,t)}"
                                            uriPrefix="${ne(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .menu="${t.menu}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-vertical-layout>

            `:d}

            ${t.variant==ge.TILES?o`
                <vaadin-vertical-layout style="width: 100%; height: 100vh; overflow: hidden;">
                    <vaadin-horizontal-layout
                            style="width: 100%; height: 4rem; flex-shrink: 0; align-items: center; border-bottom: 1px solid var(--lumo-disabled-text-color); background-color: var(--lumo-base-color);"
                            theme="spacing"
                            @navigation-requested="${e.updateRoute}">
                        <a href="javascript: void(0);" @click="${()=>{e.goHome(),e.tilesMenuOption=null}}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                        <vaadin-horizontal-layout style="align-items: center;">
                            ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                            ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
                        </vaadin-horizontal-layout>
                        </a>
                        <vaadin-menu-bar
                                .items="${e.mapItemsForTiles(t.menu)}"
                                @item-selected="${e.itemSelectedTiles}"
                                theme="dropdown-indicators"
                                style="flex-grow: 1; min-width: 0; margin-left: 4rem; margin-top: 1.3rem;"
                                class="menu"
                        >
                        </vaadin-menu-bar>
                        <vaadin-horizontal-layout style="flex-shrink: 0; align-items: center;">
                            <slot name="widgets"></slot>
                            ${Mt(t,e)}${oi(t,e)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                    <div style="flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; width: 100%;">
                        ${e.tilesMenuOption?e.renderTilesHub(e.tilesMenuOption):o`
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${$e(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${oe(e,t)}"
                                            uriPrefix="${ne(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .menu="${t.menu}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                        `}
                    </div>
                </vaadin-vertical-layout>
            `:d}

            ${t.variant==ge.RAIL?o`
                <div style="display: flex; width: 100%; height: 100vh; overflow: hidden;">
                    ${e.renderRail(t.menu)}
                    ${e.railOpenOption?e.renderRailSubPanel(e.railOpenOption):d}
                    <div style="flex: 1; overflow: hidden; padding: 2rem 2rem 0; height: 100vh; box-sizing: border-box; background-color: var(--lumo-contrast-10pct);">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${$e(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${oe(e,t)}"
                                            uriPrefix="${ne(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .menu="${t.menu}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </div>
            `:d}

            ${t.variant==ge.MENU_ON_LEFT?o`

                <vaadin-horizontal-layout>
                    <vaadin-scroller style="width: 16em; border-right: 2px solid var(--lumo-contrast-5pct);">
                        <vaadin-vertical-layout
                                @navigation-requested="${e.updateRoute}">
                            ${t.menu.map(v=>e.renderOptionOnLeftMenu(v))}
                            ${Mt(t,e)}${oi(t,e)}
                        </vaadin-vertical-layout>
                    </vaadin-scroller>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${$e(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${oe(e,t)}"
                                            uriPrefix="${ne(e,t)}"
                                            style="width: 100%; padding: 1em;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .menu="${t.menu}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </vaadin-horizontal-layout>


            `:d}

            ${t.variant==ge.TABS?o`
                <!--
                
                box-shadow: inset 0 -1px 0 0 var(--lumo-contrast-10pct);
                
                -->
                
                <div>
                    <div>
                        <vaadin-horizontal-layout 
                                style="width: 100%;   align-items: center; border-bottom: 1px solid var(--lumo-contrast-10pct);" 
                                theme="spacing"
                                @navigation-requested="${e.updateRoute}">
                            <a href="javascript: void(0);" @click="${()=>e.goHome()}" style="text-decoration: none; color: inherit; flex-shrink: 0;">
                            <vaadin-horizontal-layout style="align-items: center;">
                                ${t.logo?o`<img src="${t.logo}" alt="logo" height="28px" style="margin-left: 10px;">`:d}
                                ${t.title?o`<h2 style="margin: 0; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">${t.title}</h2>`:d}
                            </vaadin-horizontal-layout>
                            </a>
                            <vaadin-tabs selected="${e.getSelectedIndex(t.menu)}"
                                         style="box-shadow: unset; flex-grow: 1; min-width: 0;"
                                         class="${e.component?.cssClasses}">
                                ${t.menu.map(v=>o`
                                <vaadin-tab 
                                        @click="${()=>e.selectRoute(v.consumedRoute,v.route,v.actionId,v.baseUrl,v.serverSideType,v.uriPrefix)}"
                                >${v.label}</vaadin-tab>
                            `)}
                            </vaadin-tabs>
                            <vaadin-horizontal-layout style="flex-shrink: 0; align-items: center;">
                                <slot name="widgets"></slot>
                                ${Mt(t,e)}
                            </vaadin-horizontal-layout>
                        </vaadin-horizontal-layout>
                    </div>
                    <div class="${"app-content"+(e.pageCompact?" no-padding":"")}">
                        <vaadin-master-detail-layout>
                            <vaadin-scroller style="height: 100%;">
                                <mateu-api-caller>
                                    <mateu-ux
                                            route="${$e(a,e,t)}"
                                            id="ux_${e.id}"
                                            baseUrl="${re(e,t)}"
                                            consumedRoute="${j(e,t)}"
                                            serverSideType="${oe(e,t)}"
                                            uriPrefix="${ne(e,t)}"
                                            style="width: 100%;"
                                            .appState="${r}"
                                            .appData="${n}"
                                            instant="${e.instant}"
                                            @navigation-requested="${e.updateRoute}"
                                    ></mateu-ux>
                                </mateu-api-caller>
                            </vaadin-scroller>
                            ${t.sseUrl?o`<mateu-chat slot="detail-hidden" sseurl="${t.sseUrl}" .menu="${t.menu}" style="border-left: 1px solid var(--lumo-contrast-10pct); padding-top: 0.5rem;" class="" @navigation-requested="${e.updateRoute}" @close-requested="${e.showHideIa}"></mateu-chat>`:d}
                        </vaadin-master-detail-layout>
                    </div>
                </div>
            
            `:d}

            ${t.fabs?.map((v,f)=>o`
                <button class="app-fab" style="bottom: ${t.sseUrl?5.5+f*4:1.5+f*4}rem; right: 1.5rem;"
                    @click="${()=>e.runAction(v.actionId)}"
                    title="${v.label}">
                    <vaadin-icon icon="${v.icon}"></vaadin-icon>
                </button>
            `)}
            ${t.sseUrl&&!e.chatOpen?o`
                <button class="ai-fab" @click="${e.showHideIa}" title="Asistente IA">
                    <vaadin-icon icon="vaadin:comments-o"></vaadin-icon>
                </button>
            `:d}
            ${e.renderCommandPalette()}
            <slot></slot>
       `},vo=(e,t)=>t!=null&&e!=null&&!e.has(t),fo=typeof HTMLElement<"u"?HTMLElement:class{};class bo extends fo{static get observedAttributes(){return["type","renderer"]}connectedCallback(){this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("type")??"unknown",i=this.getAttribute("renderer")??"unknown";this.shadowRoot||this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`
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
                ⚠ Component “${t}” is not supported by the “${i}” renderer yet.
            </div>
        `}}typeof customElements<"u"&&!customElements.get("mateu-unsupported")&&customElements.define("mateu-unsupported",bo);const na=new Set,go=(e,t,i)=>{const a=`${i}/${t}`;return na.has(a)||(na.add(a),console.warn(`[mateu] Component type "${t}" is not supported by the "${i}" renderer — rendering <mateu-unsupported> placeholder.`)),o`<mateu-unsupported
            type="${t}"
            renderer="${i}"
            data-component-id="${e?.id??d}"
            slot="${e?.slot??d}"
    ></mateu-unsupported>`};class $o{renderFilterBar(t,i,a,s,r,n,l,c){const u=i?.metadata,p=f=>{const{fieldId:y,value:x}=f.detail;t.state={...t.state,[y]:x}},v=f=>{const{fieldIds:y}=f.detail,x={};y.forEach($=>{x[$]=void 0}),x.searchText=void 0,t.state={...t.state,...x}};return o`
            <mateu-filter-bar
                .metadata="${u}"
                @search-requested="${t.search}"
                @value-changed="${p}"
                @filter-reset-requested="${v}"
                .state="${t.state}"
                .data="${r}"
                .appState="${n}"
                .appData="${l}"
                ?searchOnly="${c??!1}"
            >
                ${u?.header?.map(f=>b(t,f,a,s,r,n,l))}
            </mateu-filter-bar>
        `}renderPagination(t,i){return o`
        <mateu-pagination
                @page-changed="${t.pageChanged}"
                @fetch-more-elements="${t.fetchMoreElements}"
                .totalElements="${t.data[i?.id]?.page?.totalElements??0}"
                .pageSize="${t.data[i?.id]?.page?.pageSize??10}"
                data-testid="pagination"
                .pageNumber="${t.data[i?.id]?.page?.pageNumber??0}"
        ></mateu-pagination>
        `}renderTableComponent(t,i,a,s,r,n,l){return o`
        <mateu-table id="${t.id}"
                     .metadata="${i?.metadata}"
                     .data="${t.data}"
                     .state="${s}"
                     .appState="${n}"
                     .appData="${l}"
                     .emptyStateMessage="${s[i?.id]?.emptyStateMessage}"
                     @sort-direction-changed="${t.directionChanged}"
                     @fetch-more-elements="${t.fetchMoreElements}"
                     baseUrl="${a}"
        ></mateu-table>
        `}rendererName(){return this.constructor?.name??"unknown"}supportedClientSideTypes(){}renderClientSideComponent(t,i,a,s,r,n,l,c){const u=i?.metadata?.type??i?.type,p=Object.values(h).includes(u)?u:void 0;return vo(this.supportedClientSideTypes(),p)?go(i,p,this.rendererName()):Wi(t,i,a,s,r,n,l,c)}renderAppComponent(t,i,a,s,r,n,l){return mo(t,i?.metadata,a,s,r,n,l)}}const yo=76;function la(e){if(e.weight!=null)return e.weight;const t=e.stereotype??"";if(t==="icon")return 1;if(t==="image")return 4;if(t==="html"||t==="richText"||t==="markdown"||t==="textarea")return 5;if(t==="link")return 2.5;if(t==="combobox"||t==="select")return 2;const i=e.dataType??"";return i==="bool"?1:i==="status"||i==="integer"?1.5:i==="number"||i==="date"||i==="money"?2:i==="dateTime"||i==="dateRange"?2.5:3}function Aa(e,t){if(e.length===0)return"table";const i=e.reduce((c,u)=>c+la(u),0),a=t/yo,s=i/a;if(s<=1)return"table";const r=e.filter(c=>c.identifier||(c.priority??Number.MAX_SAFE_INTEGER)<=2),n=r.reduce((c,u)=>c+la(u),0);return s>1.6||e.length>10?"masterDetail":r.length>0&&n<=8?"list":e.some(c=>c.stereotype==="image"||c.stereotype==="html")||r.length===0&&e.length>=4&&e.length<=8?"cards":"masterDetail"}function Di(e){return e.filter(t=>t.identifier||(t.priority??Number.MAX_SAFE_INTEGER)<=2).sort((t,i)=>(t.priority??Number.MAX_SAFE_INTEGER)-(i.priority??Number.MAX_SAFE_INTEGER))}function xo(e){const t=e.dataType??"",i=e.stereotype??"";let a;return i==="combobox"||i==="select"?a=2:t==="bool"?a=1:t==="status"||t==="integer"?a=1.5:t==="number"||t==="date"||t==="money"?a=2:t==="dateTime"?a=2.5:a=3,t==="dateRange"?2.5*1.5:i==="listBox"?a*1.5:a}function wo(e){if(e.length===0)return"inline";const t=e.reduce((i,a)=>i+xo(a),0);return t<=4?"inline":e.length>=6||t>8?"drawer":"popover"}const Co=e=>e===We.SUCCESS?"8":e===We.DANGER?"1":e===We.WARNING?"6":e===We.INFO?"4":"5",Fa=e=>{if(!e)return o``;const t=e.message??String(e);return o`<ui5-tag color-scheme="${Co(e.type)}">${t}</ui5-tag>`},Na=(e,t,i)=>{const a=t.dataType??"",s=t.stereotype??"",r=e[t.id];if(a==="status")return Fa(r);if(a==="bool")return r?o`<ui5-icon name="accept"></ui5-icon>`:o`<ui5-icon name="decline"></ui5-icon>`;if(a==="money"||s==="money")return r==null?o``:o`${new Intl.NumberFormat(void 0,{minimumFractionDigits:2}).format(Number(r))}`;if(a==="link"||s==="link"){const n=typeof r=="object"?r?.text??"":r??"",l=t.actionId;if(l)return o`<ui5-link @click="${u=>{u.preventDefault(),i(l,e)}}">${n}</ui5-link>`;const c=typeof r=="object"?r?.href??r?.url??"":"";return o`<a href="${c}">${n}</a>`}if(a==="icon"||s==="icon"){const n=Array.isArray(r)?r:r?String(r).split(","):[];return o`${n.map(l=>o`<ui5-icon name="${l.trim().replace(/^vaadin:|^lumo:/,"")}"></ui5-icon>`)}`}if(s==="html")return o`${de(r??"")}`;if(s==="image"){const n=typeof r=="object"?r?.url??r?.src??"":r??"";return n?o`<img src="${n}" style="max-height: 3rem; object-fit: contain;" />`:o``}if(s==="button"){const n=t.text??t.label??"",l=t.actionId??t.id;return o`<ui5-button design="Transparent"
            @click="${c=>{c.stopPropagation(),i(l,e)}}"
        >${n}</ui5-button>`}if(a==="action"){const n=typeof r=="object"?r?.text??r?.label??"":"",l=typeof r=="object"?r?.methodNameInCrud??r?.actionId??r?.id??t.id:t.actionId??t.id;return o`<ui5-button design="Transparent"
            @click="${c=>{c.stopPropagation(),i(l,e)}}"
        >${n}</ui5-button>`}if(a==="actionGroup"||a==="menu"){const n=typeof r=="object"&&r?.actions?r.actions:Array.isArray(r)?r:[];return o`${n.map(l=>{const c=l.methodNameInCrud??l.actionId??l.id??"";return o`<ui5-button design="Transparent"
                @click="${u=>{u.stopPropagation(),i(c,e)}}"
            >${l.label??l.text??c}</ui5-button>`})}`}return o`${r??""}`};var ko=Object.defineProperty,So=Object.getOwnPropertyDescriptor,ve=(e,t,i,a)=>{for(var s=a>1?void 0:a?So(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&ko(t,i,s),s};let ee=class extends L{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.sortField="",this.sortDirection="None",this.availableWidthPx=1024,this.selectedItem=null}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}get cols(){return this.metadata?.columns?.map(e=>e.metadata)??[]}get effectiveGridLayout(){const e=this.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":Aa(this.cols,this.availableWidthPx):t}getRows(){return this.data[this.id]?.page?.content??[]}toggleSort(e){this.sortField!==e?(this.sortField=e,this.sortDirection="Ascending"):this.sortDirection==="Ascending"?this.sortDirection="Descending":(this.sortDirection="None",this.sortField=""),this.dispatchEvent(new CustomEvent("sort-changed",{detail:{sorts:this.sortField?[{fieldId:this.sortField,direction:this.sortDirection==="Ascending"?"ascending":"descending"}]:[]},bubbles:!0,composed:!0}))}dispatchAction(e,t){this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:t},bubbles:!0,composed:!0}))}renderCellValue(e,t){return Na(e,t,(i,a)=>this.dispatchAction(i,a))}renderTable(e){const t=this.getRows();return o`
            <ui5-table
                no-data-text="${this.emptyStateMessage??this.metadata?.emptyStateMessage??"No data."}"
                overflow-mode="Popin"
                style="width: 100%;"
            >
                ${this.metadata?.rowsSelectionEnabled?o`
                    <ui5-table-selection mode="Multiple" slot="features"></ui5-table-selection>
                `:d}

                <ui5-table-header-row slot="headerRow">
                    ${e.map(i=>o`
                        <ui5-table-header-cell
                            width="${i.width??d}"
                            sort-indicator="${i.sortable&&this.sortField===i.id?this.sortDirection:i.sortable?"None":d}"
                            @click="${i.sortable?()=>this.toggleSort(i.id):d}"
                            style="${i.sortable?"cursor: pointer;":d}"
                        >${i.label}</ui5-table-header-cell>
                    `)}
                </ui5-table-header-row>

                ${t.map((i,a)=>o`
                    <ui5-table-row row-key="${i._rowNumber??a}">
                        ${e.map(s=>o`
                            <ui5-table-cell>${this.renderCellValue(i,s)}</ui5-table-cell>
                        `)}
                    </ui5-table-row>
                `)}
            </ui5-table>`}renderTwoLineList(e){const t=this.getRows(),i=Di(e),a=i.find(r=>r.identifier)??i[0],s=i.filter(r=>r!==a);return o`
            <ui5-list no-data-text="${this.emptyStateMessage??"No data."}" style="width: 100%;">
                ${t.map(r=>o`
                    <ui5-li
                        description="${s.map(n=>`${n.label}: ${r[n.id]??""}`).join(" · ")}"
                        @click="${()=>this.dispatchAction("_rowClick",r)}"
                        style="cursor: pointer;"
                    >
                        ${a?this.renderCellValue(r,a):o`${r._rowNumber}`}
                    </ui5-li>
                `)}
            </ui5-list>`}renderCards(e){const t=this.getRows(),i=e.slice(0,6),a=i.filter(n=>n.stereotype==="image"),s=i.find(n=>n.identifier)??i[0],r=i.filter(n=>n!==s&&!a.includes(n));return o`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; padding: 0.5rem 0;">
                ${t.map(n=>o`
                    <ui5-card style="cursor: pointer;" @click="${()=>this.dispatchAction("_rowClick",n)}">
                        ${a.length?o`
                            <div slot="header" style="padding: 0.5rem;">
                                ${this.renderCellValue(n,a[0])}
                            </div>
                        `:d}
                        <ui5-card-header
                            title-text="${s?String(n[s.id]??""):""}"
                            slot="header"
                        ></ui5-card-header>
                        <div style="padding: 0.5rem 1rem 1rem; display: flex; flex-direction: column; gap: 0.25rem;">
                            ${r.map(l=>o`
                                <div style="display: flex; gap: 0.5rem; font-size: 0.875rem;">
                                    <span style="color: var(--sapContent_LabelColor, #6a6d70); min-width: 80px;">${l.label}</span>
                                    <span>${this.renderCellValue(n,l)}</span>
                                </div>
                            `)}
                        </div>
                    </ui5-card>
                `)}
            </div>`}renderMasterDetail(e){const t=this.getRows(),i=Di(e),a=i.find(s=>s.identifier)??i[0];return o`
            <div style="display: flex; gap: 0; height: 100%; min-height: 400px; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; overflow: hidden;">
                <!-- Left: compact row list -->
                <div style="width: 280px; flex-shrink: 0; border-right: 1px solid var(--sapNeutralBorderColor, #e5e5e5); overflow-y: auto;">
                    <ui5-list no-data-text="${this.emptyStateMessage??"No data."}" style="width: 100%;">
                        ${t.map(s=>o`
                            <ui5-li
                                description="${i.filter(r=>r!==a).map(r=>`${r.label}: ${s[r.id]??""}`).join(" · ")}"
                                ?selected="${this.selectedItem===s}"
                                @click="${()=>{this.selectedItem=s}}"
                                style="cursor: pointer;"
                            >
                                ${a?this.renderCellValue(s,a):o`${s._rowNumber}`}
                            </ui5-li>
                        `)}
                    </ui5-list>
                </div>

                <!-- Right: full detail for selected row -->
                <div style="flex: 1; overflow-y: auto; padding: 1rem;">
                    ${this.selectedItem?o`
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${e.map(s=>o`
                                <div style="display: flex; gap: 0.75rem; align-items: baseline;">
                                    <span style="min-width: 140px; color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem;">${s.label}</span>
                                    <span>${this.renderCellValue(this.selectedItem,s)}</span>
                                </div>
                            `)}
                        </div>
                    `:o`
                        <p style="color: var(--sapContent_LabelColor, #6a6d70);">Select a row to view details.</p>
                    `}
                </div>
            </div>`}renderTree(e){const t=this.getRows(),i=e.find(l=>l.dataType!=="action"&&l.dataType!=="actionGroup"&&l.dataType!=="menu")??e[0],a=e.filter(l=>l!==i),s=l=>String(l[i?.id??""]??""),r=l=>a.map(c=>l[c.id]!=null?`${c.label}: ${l[c.id]}`:"").filter(c=>c).join(" · "),n=l=>o`
            <ui5-tree-item
                text="${s(l)}"
                additional-text="${r(l)||d}"
                ?has-children="${(l.children?.length??0)>0}"
                expanded
                @click="${c=>{c.stopPropagation(),this.dispatchAction("_rowClick",l)}}"
            >
                ${l.children?.map(c=>n(c))}
            </ui5-tree-item>`;return o`
            <ui5-tree no-data-text="${this.emptyStateMessage??"No data."}" style="width: 100%;">
                ${t.map(l=>n(l))}
            </ui5-tree>`}render(){const e=this.cols,t=this.effectiveGridLayout;return t==="list"?this.renderTwoLineList(e):t==="cards"?this.renderCards(e):t==="masterDetail"?this.renderMasterDetail(e):t==="tree"?this.renderTree(e):this.renderTable(e)}};ve([m()],ee.prototype,"id",2);ve([m()],ee.prototype,"metadata",2);ve([m()],ee.prototype,"baseUrl",2);ve([m()],ee.prototype,"state",2);ve([m()],ee.prototype,"data",2);ve([m()],ee.prototype,"appState",2);ve([m()],ee.prototype,"appData",2);ve([m()],ee.prototype,"emptyStateMessage",2);ve([g()],ee.prototype,"sortField",2);ve([g()],ee.prototype,"sortDirection",2);ve([g()],ee.prototype,"availableWidthPx",2);ve([g()],ee.prototype,"selectedItem",2);ee=ve([_("mateu-sapui5-table")],ee);var Eo=Object.defineProperty,Io=Object.getOwnPropertyDescriptor,nt=(e,t,i,a)=>{for(var s=a>1?void 0:a?Io(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Eo(t,i,s),s};let He=class extends L{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.filtersOpen=!1,this.handleKey=e=>{e.code==="Enter"&&(this.filtersOpen=!1,this.triggerSearch())}}createRenderRoot(){return this}get effectiveFiltersLayout(){const e=this.metadata?.filtersLayout??"auto";return e==="auto"?wo(this.metadata?.filters??[]):e}connectedCallback(){super.connectedCallback(),this.metadata?.searchOnEnter&&this.addEventListener("keydown",this.handleKey)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this.handleKey)}triggerSearch(){this.dispatchEvent(new CustomEvent("search-requested",{bubbles:!0,composed:!0,detail:{}}))}clearFilters(){const e={};this.metadata?.filters?.forEach(t=>{e[t.fieldId??t.id]=void 0}),e.searchText=void 0,this.state={...this.state,...e},this.metadata?.filters?.forEach(t=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:t.fieldId??t.id},bubbles:!0,composed:!0}))}),this.triggerSearch()}clearSingleFilter(e){this.state={...this.state,[e]:void 0},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:e},bubbles:!0,composed:!0})),this.triggerSearch()}getFilterDisplayValue(e,t){if(e.options?.length){const i=e.options.find(a=>a.value===String(t));if(i)return i.label}return typeof t=="boolean"?t?"Yes":"No":String(t)}renderActiveFilterChips(){const e=(this.metadata?.filters??[]).map(t=>t).filter(t=>{const i=this.state[t.fieldId];return i!=null&&i!==""});return e.length===0?d:o`
            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; padding: 0.25rem 0;">
                ${e.map(t=>o`
                    <ui5-token
                        text="${t.label}: ${this.getFilterDisplayValue(t,this.state[t.fieldId])}"
                        @ui5-delete="${()=>this.clearSingleFilter(t.fieldId)}"
                    ></ui5-token>
                `)}
            </div>`}wrapFilter(e){return{id:e.fieldId??"",metadata:{...e},type:U.ClientSide,style:"",children:[],slot:"",cssClasses:"",initialData:{}}}renderFilterControls(){return o`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; padding: 0.75rem 0;">
                ${this.metadata?.filters?.map(e=>b(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-bottom: 0.5rem;">
                <ui5-button @click="${()=>{this.filtersOpen=!1,this.clearFilters()}}">Clear</ui5-button>
                <ui5-button design="Emphasized" @click="${()=>{this.filtersOpen=!1,this.triggerSearch()}}">Search</ui5-button>
            </div>`}renderInlineFilters(){return o`
            ${this.metadata?.filters?.map(e=>b(this,this.wrapFilter(e),this.baseUrl,this.state,this.data,this.appState,this.appData))}`}renderDrawer(){return o`
            <div
                style="
                    position: fixed; inset: 0 0 0 auto;
                    width: min(360px, 90vw);
                    background: var(--sapBackgroundColor, #fff);
                    box-shadow: var(--sapContent_Shadow3, -4px 0 12px rgba(0,0,0,.15));
                    z-index: 200;
                    display: flex; flex-direction: column;
                    transform: ${this.filtersOpen?"translateX(0)":"translateX(100%)"};
                    transition: transform .2s ease;
                    padding: 1rem;
                ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <span style="font-size: 1rem; font-weight: 600;">Filters</span>
                    <ui5-button design="Transparent" icon="decline" @click="${()=>this.filtersOpen=!1}"></ui5-button>
                </div>
                <div style="flex: 1; overflow-y: auto;">
                    ${this.renderFilterControls()}
                </div>
            </div>
            ${this.filtersOpen?o`
                <div
                    style="position: fixed; inset: 0; background: rgba(0,0,0,.32); z-index: 199;"
                    @click="${()=>this.filtersOpen=!1}"
                ></div>`:d}`}renderDialog(){return o`
            <ui5-dialog
                header-text="Filters"
                ?open="${this.filtersOpen}"
                @ui5-after-close="${()=>this.filtersOpen=!1}"
            >
                ${this.renderFilterControls()}
                <div slot="footer" style="display: flex; gap: 0.5rem; justify-content: flex-end; padding: 0.5rem 1rem;">
                    <ui5-button @click="${()=>{this.filtersOpen=!1,this.clearFilters()}}">Clear</ui5-button>
                    <ui5-button design="Emphasized" @click="${()=>{this.filtersOpen=!1,this.triggerSearch()}}">Search</ui5-button>
                </div>
            </ui5-dialog>`}render(){const e=(this.metadata?.filters?.length??0)>0,t=this.effectiveFiltersLayout;return o`
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; padding: 0.25rem 0;">
                ${this.metadata?.searchable?o`
                    <ui5-input
                        id="searchText"
                        placeholder="Search..."
                        value="${this.state?.searchText??""}"
                        style="flex: 1; min-width: 180px;"
                        @input="${i=>{this.state.searchText=i.target.value}}"
                        @keydown="${i=>{i.code==="Enter"&&this.triggerSearch()}}"
                    ></ui5-input>
                `:d}

                ${e&&t==="inline"?this.renderInlineFilters():d}

                ${e&&(t==="popover"||t==="drawer"||t==="dialog")?o`
                    <ui5-button
                        @click="${()=>this.filtersOpen=!this.filtersOpen}"
                    >${this.filtersOpen?"Hide Filters":"Filters"}</ui5-button>
                    <ui5-button @click="${()=>this.clearFilters()}">Clear</ui5-button>
                `:d}

                ${this.metadata?.searchable?o`
                    <ui5-button design="Emphasized" @click="${()=>this.triggerSearch()}">Search</ui5-button>
                `:d}

                <slot></slot>
            </div>

            ${this.renderActiveFilterChips()}

            ${e&&t==="popover"&&this.filtersOpen?o`
                <div style="border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; padding: 0.75rem; margin-top: 0.25rem;">
                    ${this.renderFilterControls()}
                </div>
            `:d}

            ${e&&t==="drawer"?this.renderDrawer():d}

            ${e&&t==="dialog"?this.renderDialog():d}
        `}};nt([m()],He.prototype,"metadata",2);nt([m()],He.prototype,"baseUrl",2);nt([m()],He.prototype,"state",2);nt([m()],He.prototype,"data",2);nt([m()],He.prototype,"appState",2);nt([m()],He.prototype,"appData",2);nt([g()],He.prototype,"filtersOpen",2);He=nt([_("mateu-sapui5-filter-bar")],He);var _o=Object.defineProperty,To=Object.getOwnPropertyDescriptor,Yt=(e,t,i,a)=>{for(var s=a>1?void 0:a?To(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&_o(t,i,s),s};let Pt=class extends L{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.pages=[]}createRenderRoot(){return this}updated(e){if(super.updated(e),e.has("totalElements")||e.has("pageNumber")||e.has("pageSize")){const t=[],a=Math.ceil(this.totalElements/this.pageSize)-1;this.totalElements>0&&(this.pageNumber>0&&t.push({pageNumber:0,text:"«",clickable:!0}),this.pageNumber>1&&t.push({pageNumber:this.pageNumber-1,text:"‹",clickable:!0}),t.push({pageNumber:this.pageNumber,text:`${this.pageNumber+1}`,clickable:!1}),this.pageNumber<a-1&&t.push({pageNumber:this.pageNumber+1,text:"›",clickable:!0}),this.pageNumber<a&&t.push({pageNumber:a,text:"»",clickable:!0})),this.pages=t}}goToPage(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){return this.totalElements?o`
            <div style="display: flex; align-items: center; gap: 0.25rem; padding: 0.5rem 0; flex-wrap: wrap;">
                ${this.pages.length>=2&&this.totalElements>this.pageSize?o`
                    <span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem; margin-right: 0.25rem;">Page:</span>
                    ${this.pages.map(e=>e.clickable?o`<ui5-button design="Transparent" @click="${()=>this.goToPage(e.pageNumber)}">${e.text}</ui5-button>`:o`<ui5-button design="Default" ?disabled="${!0}">${e.text}</ui5-button>`)}
                    <span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem; margin-left: 0.5rem;">|</span>
                `:d}
                <span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem;">
                    Total: <strong>${this.totalElements}</strong>
                </span>
                <slot></slot>
            </div>
        `:o``}};Yt([m({type:Number})],Pt.prototype,"totalElements",2);Yt([m({type:Number})],Pt.prototype,"pageSize",2);Yt([m({type:Number})],Pt.prototype,"pageNumber",2);Yt([g()],Pt.prototype,"pages",2);Pt=Yt([_("mateu-sapui5-pagination")],Pt);const Ro=(e,t,i,a)=>{const s=e.metadata;return o`<ui5-button
                    part="button"
                    @click=${zd}
                    data-action-id="${s.actionId}"
                    slot="${e.slot}"
            >${s.label}</ui5-button>`},Po=e=>{const t=e.target,i=e.detail?.selectedOption,a=i?.value??i?.textContent?.trim()??"";t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:t.id},bubbles:!0,composed:!0}))},Oo=e=>{const t=e.target,a=(e.detail?.items??[]).map(s=>s.dataset?.value??s.text);t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:t.id},bubbles:!0,composed:!0}))},ue=(e,t,i)=>{e?.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:t},bubbles:!0,composed:!0}))},zi=(e,t,i)=>{e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:i},bubbles:!0,composed:!0}))},fi=e=>(e??"").replace(/^vaadin:/,"").replace(/^lumo:/,""),I=(e,t,i,a,s,r="")=>o`
    <div style="${r}${e.style??""}" data-field-id="${t.fieldId??d}">
        ${a?o`<ui5-label for="${i}" show-colon ?required="${t.required}">${a}</ui5-label>`:d}
        ${s}
        ${t.description?o`
            <div style="font-size: 0.75rem; color: var(--sapContent_LabelColor, #6a6d70); margin-top: 0.125rem;">${t.description}</div>
        `:d}
    </div>`,di=(e,t)=>{const i=e!=null?String(e):"";return!t||i.length<=15?d:o`<ui5-icon
        slot="icon"
        name="copy"
        style="cursor: pointer;"
        @click="${()=>navigator.clipboard.writeText(i).catch(()=>{})}"
    ></ui5-icon>`},qa=(e,t)=>{const i=typeof e=="number"?e:parseFloat(String(e));return isNaN(i)?String(e):t&&t.locale&&t.currency?new Intl.NumberFormat(t.locale,{style:"currency",currency:t.currency}).format(i):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(i)},da=new WeakMap,Ma=(e,t,i,a,s)=>{const r=s?.[i]??s?.[a],n=r?.content??(Array.isArray(r)?r:void 0);if(n)return n;const l=t.remoteCoordinates?.action;if(l){let c=da.get(e);c||(c=new Set,da.set(e,c)),c.has(a)||(c.add(a),setTimeout(()=>zi(e,l,{searchText:"",fieldId:a,size:200,page:0,sort:void 0})))}return[]},Fe=(e,t,i,a,s)=>t.remoteCoordinates?Ma(e,t,i,a,s):t.options??[],ca=(e,t,i,a)=>o`
    <ui5-select
        id="${t}"
        ?disabled="${e.disabled}"
        @change="${Po}"
        style="width: 100%;"
    >
        ${e.required?d:o`<ui5-option value="">-- Select --</ui5-option>`}
        ${a.map(s=>o`
            <ui5-option value="${s.value}" ?selected="${i===s.value}">${s.label}</ui5-option>
        `)}
    </ui5-select>`,ua=(e,t,i,a)=>{const s=a.find(r=>r.value===i);return o`
        <ui5-combobox
            id="${t}"
            value="${s?.label??i??""}"
            ?disabled="${e.disabled}"
            ?readonly="${e.readOnly}"
            @selection-change="${r=>{const n=r.detail?.item;ue(r.target,e.fieldId,n?.dataset?.value??n?.text)}}"
            style="width: 100%;"
        >
            ${a.map(r=>o`
                <ui5-cb-item text="${r.label??r}" data-value="${r.value??r}"></ui5-cb-item>
            `)}
        </ui5-combobox>`},Lo=(e,t,i)=>o`
    <div style="display: flex; flex-wrap: wrap; gap: 0.25rem 1rem;">
        ${i.map(a=>o`
            <div style="display: flex; align-items: center; gap: 0.25rem;">
                ${a.icon?o`<ui5-icon name="${fi(a.icon)}"></ui5-icon>`:d}
                ${a.image?o`<img src="${a.image}" alt="${a.label}" style="height: 1rem;" />`:d}
                <ui5-radio-button
                    name="rg-${e.fieldId}"
                    text="${a.label}"
                    ?checked="${t===a.value}"
                    ?disabled="${e.disabled}"
                    @change="${s=>{s.target.checked&&ue(s.target,e.fieldId,a.value)}}"
                ></ui5-radio-button>
                ${a.description?o`<span style="font-size: 0.8125rem; color: var(--sapContent_LabelColor, #6a6d70);">${a.description}</span>`:d}
            </div>
        `)}
    </div>`,Do=(e,t)=>i=>{const s=(i.detail?.selectedItems??[]).map(r=>r.dataset?.value);ue(i.target,e,t?s:s[0])},Ua=(e,t,i,a)=>{const s=r=>a?Array.isArray(t)&&t.includes(r.value):t===r.value;return o`
        <ui5-list
            selection-mode="${a?"Multiple":"Single"}"
            @selection-change="${Do(e.fieldId,a)}"
            style="width: 100%; border: 1px solid var(--sapField_BorderColor, #89919a); border-radius: 0.25rem;"
        >
            ${i.map(r=>o`
                <ui5-li
                    data-value="${r.value}"
                    ?selected="${s(r)}"
                    description="${r.description??d}"
                    icon="${r.icon?fi(r.icon):d}"
                >${r.label}</ui5-li>
            `)}
        </ui5-list>`},Ai=(e,t,i,a)=>o`
    <div style="display: flex; gap: 0.75rem; padding: 0.25rem 0; flex-wrap: wrap;">
        ${i.map(s=>{const r=a?Array.isArray(t)&&t.includes(s.value):t==s.value,n=()=>{if(!a)return s.value;const l=Array.isArray(t)?t:[];return l.includes(s.value)?l.filter(c=>c!==s.value):[...l,s.value]};return o`
                <div role="button" tabindex="0"
                     style="min-width: 10rem; min-height: 3rem; padding: 0.75rem 1rem; cursor: pointer; border-radius: 0.5rem; border: 1px solid ${r?"var(--sapButton_Selected_BorderColor, #0064d9)":"var(--sapNeutralBorderColor, #e5e5e5)"}; background: ${r?"var(--sapList_SelectionBackgroundColor, #e5f0fa)":"transparent"};"
                     @click="${l=>ue(l.target,e.fieldId,n())}"
                >
                    <div style="display: flex; align-items: center; gap: 0.5rem; pointer-events: none;">
                        ${s.icon?o`<ui5-icon name="${fi(s.icon)}"></ui5-icon>`:d}
                        ${s.image?o`<img src="${s.image}" alt="${s.label}" style="${s.imageStyle??"width: 2rem;"}" />`:d}
                        <div>
                            <div>${s.label}</div>
                            ${s.description?o`
                                <div style="font-size: 0.8125rem; color: var(--sapContent_LabelColor, #6a6d70);">${s.description}</div>
                            `:d}
                        </div>
                    </div>
                </div>`})}
    </div>`,zo=(e,t,i)=>{const a=(e.optionsColumns??0)>1,s=r=>n=>{const l=Array.isArray(t)?t:[],u=n.target.checked?[...l.filter(p=>p!==r),r]:l.filter(p=>p!==r);ue(n.target,e.fieldId,u)};return o`
        <div style="display: ${a?"grid; grid-template-columns: repeat(3, 1fr); gap: 0.25rem 2rem":"flex; flex-direction: column"};">
            ${i.map(r=>o`
                <ui5-checkbox
                    text="${r.label}"
                    ?checked="${Array.isArray(t)&&t.includes(r.value)}"
                    ?disabled="${e.disabled}"
                    ?readonly="${e.readOnly}"
                    @change="${s(r.value)}"
                ></ui5-checkbox>
            `)}
        </div>`},Ao=(e,t,i)=>{let a=e;return isNaN(a)&&(a=0),o`<div style="display: flex; align-items: center; gap: 0.25rem;">
        ${[1,2,3,4,5].map(r=>o`
            <ui5-icon
                name="${r<=a?"favorite":"unfavorite"}"
                style="cursor: ${i?"default":"pointer"}; color: ${r<=a?"var(--sapIndicationColor_5)":"var(--sapContent_NonInteractiveIconColor)"}; font-size: 1.5rem;"
                @click="${i?d:n=>ue(n.target,t,r)}"
            ></ui5-icon>
        `)}
    </div>`},Fo=e=>t=>{const i=t.target,a=i.files?.[0];if(!a)return;const s=new FileReader;s.onload=()=>ue(i,e,s.result),s.readAsDataURL(a),i.value=""},No=e=>t=>{t.target.getRootNode().querySelector(`#${CSS.escape(e)}`)?.click()},qo=(e,t,i)=>{const a=i!=null&&i!=="",s=`${t}_file`;return o`
        <div style="display: flex; flex-direction: column; align-items: stretch; gap: 0.5rem; max-width: 320px;">
            ${a?o`
                <img src="${i}"
                     style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; ${e.style??""}">
            `:o`
                <div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--sapNeutralBorderColor, #b3b3b3); border-radius: 0.5rem; color: var(--sapContent_LabelColor, #6a6d70);">
                    <ui5-icon name="picture" style="height: 2rem; width: 2rem;"></ui5-icon>
                </div>
            `}
            <input type="file" id="${s}" accept="image/*" style="display: none;" @change="${Fo(e.fieldId)}">
            <div style="display: flex; gap: 0.5rem;">
                <ui5-button icon="upload" @click="${No(s)}">${a?"Replace":"Upload"}</ui5-button>
                ${a?o`
                    <ui5-button design="Transparent" icon="delete"
                        @click="${r=>ue(r.target,e.fieldId,"")}"
                    >Delete</ui5-button>`:d}
            </div>
        </div>`},Mo=(e,t)=>{const i=e[t.id];return t.dataType==="bool"||t.dataType==="boolean"?o`<ui5-icon name="${i?"accept":"decline"}"></ui5-icon>`:o`${i??""}`},Uo=(e,t)=>{const i=Array.isArray(t)?t:[],a=e.columns.map(s=>s.metadata);return o`
        <ui5-table style="width: 100%; margin-top: 0.5rem;">
            <ui5-table-header-row slot="headerRow">
                ${a.map(s=>o`
                    <ui5-table-header-cell width="${s.width??d}">${s.label}</ui5-table-header-cell>
                `)}
            </ui5-table-header-row>
            ${i.map((s,r)=>o`
                <ui5-table-row row-key="${s._rowNumber??r}">
                    ${a.map(n=>o`
                        <ui5-table-cell>${Mo(s,n)}</ui5-table-cell>
                    `)}
                </ui5-table-row>
            `)}
        </ui5-table>`},Bo=(e,t,i)=>{const a=t===!0||t==="true";return o`
        <div style="${e.style??d}">
            <ui5-tag color-scheme="${a?"8":d}" style="${a?"":"opacity: 0.4;"}">${i}</ui5-tag>
        </div>`},jo=(e,t,i,a,s,r,n)=>{let l=Ne(a,r,n);const c=l&&typeof l=="object"&&"value"in l?l:null;l&&l.value&&(l=l.value);const u=t.dataType=="bool"||l===!0||l===!1,p=t.dataType=="money",v=l!=null&&l!=="";let f=v?String(l):"—";p&&v&&(f=qa(l,c));const y=u?o`<ui5-icon name="${l===!0||l==="true"?"accept":"less"}" style="height: 16px; width: 16px;"></ui5-icon>`:t.multiline?o`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${f}</span>`:o`<span style="display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${p?" font-variant-numeric: tabular-nums;":""}">${f}</span>`;return I(e,t,i,s,y,p?"text-align: right; ":"")},Wo=(e,t,i,a,s,r,n)=>{let l=Ne(a,r,n)||n?.[t.fieldId];return l&&l.value&&(l=l.value),t.stereotype=="image"||t.stereotype=="uploadableImage"?I(e,t,i,s,o`<img src="${l}" id="${i}_img" style="${t.style??d}">`):t.dataType=="bool"?I(e,t,i,s,o`<ui5-icon name="${l?"accept":"less"}" style="height: 20px;"></ui5-icon>`):t.stereotype=="link"?I(e,t,i,s,o`<ui5-link href="${l??""}" target="_blank">${l??""}</ui5-link>`):t.stereotype=="color"?I(e,t,i,s,o`<span style="background-color: ${l}; display: block; height: 20px; width: 40px; border: 1px solid var(--sapContent_LabelColor, #6a6d70); border-radius: 0.25rem;"></span>`):I(e,t,i,s,o`
        <ui5-input
            id="${i}"
            readonly
            value="${l??""}"
            style="width: 100%;"
        >${di(l,!0)}</ui5-input>`)},Vo=(e,t,i,a,s,r,n)=>{const l=i.fieldId??"";if(i.stereotype=="searchable"){const u=v=>zi(v.currentTarget,"code-"+l,{code:v.currentTarget.value}),p=v=>zi(v.currentTarget,"codesearch-"+l,{});return I(t,i,a,r,o`
            <div style="display: flex; gap: 0.33rem; align-items: center;">
                <ui5-input style="width: 5rem;" value="${s??""}" @change="${u}"></ui5-input>
                <ui5-input readonly value="${n?.[l+"-label"]??""}" style="flex: 1;"></ui5-input>
                <ui5-button icon="search" @click="${p}"></ui5-button>
            </div>`)}if(i.stereotype=="select"){const u=s&&s.value?s.value:s;return I(t,i,a,r,ca(i,a,u,Fe(e,i,a,l,n)))}if(i.stereotype=="markdown")return I(t,i,a,r,o`
            <mateu-markdown .content="${s??""}"></mateu-markdown>`);if(i.stereotype=="combobox")return I(t,i,a,r,ua(i,a,s,Fe(e,i,a,l,n)));if(i.stereotype=="listBox")return I(t,i,a,r,Ua(i,s,Fe(e,i,a,l,n),!1));if(i.stereotype=="radio")return I(t,i,a,r,Lo(i,s,Fe(e,i,a,l,n)));if(i.stereotype=="popover"){const u=Fe(e,i,a,l,n),p=`${a}_popover`,v=y=>{const $=y.target.getRootNode().querySelector(`#${CSS.escape(p)}`);$&&($.opener=y.currentTarget,$.open=!$.open)},f=u.find(y=>y.value===s)?.label??s??"";return I(t,i,a,r,o`
            <div style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;" @click="${v}">
                <span>${f}</span>
                <ui5-icon name="slim-arrow-down"></ui5-icon>
            </div>
            <ui5-popover id="${p}" placement="Bottom">
                ${Ai(i,s,u,!1)}
            </ui5-popover>`)}if(i.stereotype=="choice")return I(t,i,a,r,Ai(i,s,Fe(e,i,a,l,n),!1));if(i.stereotype=="richText"||i.stereotype=="richtext")return I(t,i,a,r,o`
            <ui5-textarea
                id="${a}"
                ?disabled="${i.disabled}"
                ?readonly="${i.readOnly}"
                @change="${le}"
                value="${s??""}"
                growing
                growing-max-lines="10"
                style="width: 100%;"
            ></ui5-textarea>`);if(i.stereotype=="textarea")return I(t,i,a,r,o`
            <ui5-textarea
                id="${a}"
                ?disabled="${i.disabled}"
                ?readonly="${i.readOnly}"
                @change="${le}"
                value="${s??""}"
                maxlength="${i.charLimit??d}"
                growing
                growing-max-lines="5"
                style="width: 100%;"
            ></ui5-textarea>`);if(i.stereotype=="link")return I(t,i,a,r,o`
            <ui5-input
                id="${a}"
                ?disabled="${i.disabled}"
                value="${s??""}"
                @change="${le}"
                style="width: 100%;"
            ><ui5-icon
                slot="icon"
                name="chain-link"
                style="cursor: pointer;"
                @click="${()=>s&&window.open(s,"_blank")?.focus()}"
            ></ui5-icon></ui5-input>`);if(i.stereotype=="icon")return I(t,i,a,r,o`
            <ui5-input
                id="${a}"
                ?disabled="${i.disabled}"
                value="${s??""}"
                @change="${le}"
                style="width: 100%;"
            >${s?o`<ui5-icon slot="icon" name="${fi(s)}"></ui5-icon>`:d}</ui5-input>`);if(i.stereotype=="html")return I(t,i,a,r,o`
            <div style="line-height: 20px; margin-top: 5px;">${de(""+(s??""))}</div>`);if(i.stereotype=="image")return I(t,i,a,r,o`
            <img src="${s??""}" style="${t.style??d}" class="${t.cssClasses??d}">`);if(i.stereotype=="uploadableImage")return I(t,i,a,r,qo(i,a,s));if(i.stereotype=="color")return I(t,i,a,r,o`
            <input type="color" value="${s??"#000000"}" ?disabled="${i.disabled}"
                   style="display: block; height: 2rem; width: 4rem; border: 1px solid var(--sapField_BorderColor, #89919a); border-radius: 0.25rem; background: transparent; cursor: pointer;"
                   @input="${u=>ue(u.target,l,u.target.value)}"/>`);if(i.options&&i.options.length>0)return I(t,i,a,r,ca(i,a,s,i.options));if(i.remoteCoordinates)return I(t,i,a,r,ua(i,a,s,Ma(e,i,a,l,n)));const c=(()=>{switch(i.stereotype){case"email":return"Email";case"password":return"Password";case"url":return"URL";case"phone":case"tel":return"Tel";case"search":return"Search";default:return"Text"}})();return I(t,i,a,r,o`
        <ui5-input
            id="${a}"
            type="${c}"
            ?disabled="${i.disabled}"
            ?readonly="${i.readOnly}"
            value="${s??""}"
            @change="${le}"
            maxlength="${i.charLimit??d}"
            placeholder="${i.placeholder??d}"
            style="width: 100%;"
        >${di(s,i.readOnly)}</ui5-input>`)},Ho=(e,t,i,a,s)=>{const r=t.metadata,n=r?.fieldId??"",l=a&&n in a?a[n]:r?.initialValue,c=t.id||n,u=r.label+"",p=ye(u,a,s),v=!p||p=="null"||p=="undefined"?void 0:p,f=r.dataType,y=r.stereotype;if(y=="badge")return Bo(t,l,v??r.fieldId??"");if(y=="plainText")return jo(t,r,c,l,v,a,s);if(r.readOnly&&y!="grid"&&f!="status"&&f!="money")return Wo(t,r,c,l,v,a,s);if(y=="grid"&&r.columns&&r.columns.length>0)return I(t,r,c,v,Uo(r,l));if(f=="file"||y=="file")return I(t,r,c,v,o`
            <ui5-file-uploader id="${c}" ?disabled="${r.disabled}" @change="${le}">
                <ui5-button icon="upload">Upload</ui5-button>
            </ui5-file-uploader>`);if(f=="dateRange"){const x=l?`${l.from} - ${l.to}`:"";return I(t,r,c,v,o`
            <ui5-daterange-picker
                id="${c}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                format-pattern="yyyy-MM-dd"
                value="${x}"
                @change="${$=>{const k=$.target,E=M=>M?`${M.getFullYear()}-${String(M.getMonth()+1).padStart(2,"0")}-${String(M.getDate()).padStart(2,"0")}`:void 0,R=E(k.startDateValue),N=E(k.endDateValue);ue($.target,n,R&&N?{from:R,to:N}:void 0)}}"
                style="width: 100%;"
            ></ui5-daterange-picker>`)}if(f=="date"||f=="LocalDate")return I(t,r,c,v,o`
            <ui5-date-picker
                id="${c}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                format-pattern="yyyy-MM-dd"
                value="${l??""}"
                @change="${le}"
                style="width: 100%;"
            ></ui5-date-picker>`);if(f=="dateTime"||f=="datetime"||f=="LocalDateTime"||f=="ZonedDateTime")return I(t,r,c,v,o`
            <ui5-datetime-picker
                id="${c}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                value="${l??""}"
                @change="${le}"
                style="width: 100%;"
            ></ui5-datetime-picker>`);if(f=="time"||f=="LocalTime")return I(t,r,c,v,o`
            <ui5-time-picker
                id="${c}"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                value="${l??""}"
                @change="${le}"
                style="width: 100%;"
            ></ui5-time-picker>`);if(f=="number"||y=="currency")return I(t,r,c,v,o`
            <ui5-input
                id="${c}"
                type="Number"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                value="${l??""}"
                @change="${le}"
                style="width: 100%;"
            >${di(l,r.readOnly)}</ui5-input>`);if(f=="integer")return y=="stars"?I(t,r,c,v,Ao(l,n,r.disabled)):y=="slider"?I(t,r,c,v,o`
                <ui5-slider
                    id="${c}"
                    min="${r.sliderMin??0}"
                    max="${r.sliderMax??100}"
                    step="${r.step??1}"
                    value="${l??0}"
                    ?disabled="${r.disabled}"
                    show-tooltip
                    @change="${le}"
                    style="width: 100%;"
                ></ui5-slider>`):r.stepButtonsVisible?I(t,r,c,v,o`
                <ui5-step-input
                    id="${c}"
                    ?disabled="${r.disabled}"
                    ?readonly="${r.readOnly}"
                    value="${l??0}"
                    min="${r.min??d}"
                    max="${r.max??d}"
                    step="${r.step??d}"
                    @change="${le}"
                    style="width: 100%;"
                ></ui5-step-input>`):I(t,r,c,v,o`
            <ui5-input
                id="${c}"
                type="Number"
                ?disabled="${r.disabled}"
                ?readonly="${r.readOnly}"
                value="${l??""}"
                @change="${le}"
                style="width: 100%;"
            >${di(l,r.readOnly)}</ui5-input>`);if(f=="bool"||f=="boolean"||f=="Boolean")return y=="toggle"?o`
                <div style="display: flex; align-items: center; gap: 0.5rem; ${t.style??""}">
                    <ui5-label for="${c}" ?required="${r.required}">${v}</ui5-label>
                    <ui5-switch
                        id="${c}"
                        ?checked="${l}"
                        ?disabled="${r.disabled}"
                        @change="${ya}"
                    ></ui5-switch>
                </div>`:o`
            <div style="${t.style??d}">
                <ui5-checkbox
                    id="${c}"
                    text="${v??""}"
                    ?checked="${l}"
                    ?disabled="${r.disabled}"
                    ?readonly="${r.readOnly}"
                    @change="${ya}"
                ></ui5-checkbox>
            </div>`;if(f=="array"){if(y=="choice")return I(t,r,c,v,Ai(r,l,Fe(e,r,c,n,s),!0));if(y=="listBox")return I(t,r,c,v,Ua(r,l,Fe(e,r,c,n,s),!0));if(y=="combobox"){const x=Fe(e,r,c,n,s),$=Array.isArray(l)?l:[];return I(t,r,c,v,o`
                <ui5-multi-combobox
                    id="${c}"
                    ?disabled="${r.disabled}"
                    ?readonly="${r.readOnly}"
                    @selection-change="${Oo}"
                    style="width: 100%;"
                >
                    ${x.map(k=>o`
                        <ui5-mcb-item
                            text="${k.label??k}"
                            data-value="${k.value??k}"
                            ?selected="${$.includes(k.value??k)}"
                        ></ui5-mcb-item>
                    `)}
                </ui5-multi-combobox>`)}return I(t,r,c,v,zo(r,l,Fe(e,r,c,n,s)))}if(f=="money"||y=="money"){if(r.readOnly){const E=l&&typeof l=="object"&&"value"in l?l:null,R=E?E.value:l;return I(t,r,c,v,o`
                <div style="min-width: 8rem; text-align: right; font-variant-numeric: tabular-nums;">${l!=null?qa(R,E):""}</div>`)}const x=l&&typeof l=="object"&&"value"in l?l:{value:typeof l=="number"?l:parseFloat(String(l??0))||0,currency:"EUR",locale:"es-ES"},$=E=>{const R=E.detail?.selectedOption;ue(E.target,n,{...x,currency:R?.value??R?.textContent?.trim()??x.currency})},k=E=>{const R=E.target.value;ue(E.target,n,{...x,value:R?parseFloat(R):0})};return I(t,r,c,v,o`
            <div style="display: flex; gap: 0.25rem;">
                <ui5-select style="width: 6rem;" ?disabled="${r.disabled}" @change="${$}">
                    ${["EUR","USD","GBP"].map(E=>o`
                        <ui5-option value="${E}" ?selected="${x.currency===E}">${E}</ui5-option>
                    `)}
                </ui5-select>
                <ui5-input
                    id="${c}"
                    type="Number"
                    ?disabled="${r.disabled}"
                    value="${x.value??""}"
                    @change="${k}"
                    style="flex: 1; text-align: right;"
                ></ui5-input>
            </div>`)}if(f=="status")return I(t,r,c,v,Fa(l));if(f=="range"){const x=l;return I(t,r,c,v,o`
            <ui5-range-slider
                start-value="${x?.from??0}"
                end-value="${x?.to??0}"
                min="${r.sliderMin??0}"
                max="${r.sliderMax??10}"
                step="${r.step||d}"
                ?disabled="${r.disabled}"
                @change="${$=>{const k=$.target;ue($.target,n,{from:k.startValue,to:k.endValue})}}"
                style="min-width: 10rem; width: 100%;"
            ></ui5-range-slider>`)}return Vo(e,t,r,c,l,v,s)};var Gt=(e=>(e.Add="Add",e.Replace="Replace",e.ReplaceKeepData="ReplaceKeepData",e))(Gt||{}),Go=Object.defineProperty,Ba=(e,t,i,a)=>{for(var s=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=n(t,i,s)||s);return s&&Go(t,i,s),s};class bi extends L{constructor(){super(...arguments),this.id="",this.baseUrl="",this.callbackToken="",this.createElement=t=>{const i=t.data,a=document.createElement(i.name);for(let s in i.attributes)a.setAttribute(s,i.attributes[s]);for(let s in i.on)a.addEventListener(s,r=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.on[s],parameters:{event:r}},bubbles:!0,composed:!0}))});return a},this.closeModal=()=>{const t=this.shadowRoot?.querySelectorAll("mateu-dialog, mateu-drawer");if(t&&t.length>0){t[t.length-1].close();return}this.dispatchEvent(new CustomEvent("close-modal-requested",{bubbles:!0,composed:!0}))},this.changeFavicon=t=>{let i=document.querySelector('link[rel="icon"]');i!==null?i.setAttribute("href",t):(i=document.createElement("link"),i.setAttribute("rel","icon"),i.setAttribute("href",t),document.head.appendChild(i))}}connectedCallback(){super.connectedCallback(),this.upstreamSubscription=at.subscribe(t=>{if(t.command){const i=t.command;this.id==i.targetComponentId&&this.applyCommand(i)}if((!t.callbackToken||!this.callbackToken||t.callbackToken===this.callbackToken)&&t.fragment){const i=t.fragment;this.id==i.targetComponentId&&(this.applyFragment(i),this.completeMenu(i))}})}completeMenu(t){if(t.component&&t.component.type==U.ClientSide){const i=t.component,a=i.metadata;if(a?.type==h.App){const s=a,r=this.getRemoteMenus(s.menu);if(r.length>0){const n=r.map(l=>Gi.runAction(l.baseUrl,l.route,"_empty","",l.baseUrl+"#"+l.route,void 0,void 0,void 0,l.params,this,!0));Promise.all(n).then(l=>{s.menu=this.updateMenu(s.menu,l.map(c=>c.fragments).filter(c=>c).map(c=>c).flat()),s.variant=ge.MENU_ON_TOP,at.next({fragment:{component:i,data:void 0,state:void 0,action:Gt.Replace,targetComponentId:this.id,containerId:void 0},callbackToken:this.callbackToken})})}}}}updateMenu(t,i){const a=[];return t.forEach(s=>{if(s.remote){const r=i.find(n=>n.targetComponentId==s.baseUrl+"#"+s.route);if(r&&r.component?.type==U.ClientSide){const n=r.component;if(n.metadata?.type==h.App){const l=n.metadata,c=s.serverSideType&&s.serverSideType!=""?s.serverSideType:l.serverSideType;this.changeBaseUrl(l.menu,s.baseUrl,c,s.route,l.route),a.push(...l.menu)}}}else a.push(s)}),a}changeBaseUrl(t,i,a,s,r){t.forEach(n=>{n.baseUrl||(n.submenus&&n.submenus.length>0?this.changeBaseUrl(n.submenus,i,a,s,r):(n.consumedRoute=r??"",n.baseUrl=i,n.serverSideType=a,n.uriPrefix=s))})}getRemoteMenus(t){const i=[];return t.forEach(a=>{a.remote&&i.push(a)}),i}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe()}applyCommand(t){if(t.type=="SetWindowTitle"&&(document.title=t.data),t.type=="SetFavicon"&&this.changeFavicon(t.data),t.type=="DispatchEvent"&&this.dispatchNamedEvent(t.data),t.type=="NavigateTo"){const i=t.data;i&&(i.startsWith("http:")||i.startsWith("https:")?window.open(t.data,"_blank"):window.location.href=t.data)}if(t.type=="PushStateToHistory"){const i=t.data;i!==void 0&&this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:i},bubbles:!0,composed:!0}))}if(t.type=="RunAction"){const i=t.data;if(i&&i.actionId)if(i.targetComponentId){const a={command:{type:"RunAction",data:{actionId:i.actionId},targetComponentId:i.targetComponentId},fragment:void 0,ui:void 0,error:void 0,callbackToken:""};setTimeout(()=>at.next(a))}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.actionId,parameters:{}},bubbles:!0,composed:!0}))}if(t.type=="MarkAsDirty"&&this.dispatchEvent(new CustomEvent("dirty",{detail:{},bubbles:!0,composed:!0})),t.type=="MarkAsClean"&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),t.type=="DownloadFile"){const i=t.data;if(i&&i.base64Content){const a=atob(i.base64Content),s=new Uint8Array(a.length);for(let c=0;c<a.length;c++)s[c]=a.charCodeAt(c);const r=new Blob([s],{type:i.mimeType}),n=URL.createObjectURL(r),l=document.createElement("a");l.href=n,l.download=i.filename??"export",l.click(),URL.revokeObjectURL(n)}}if(t.type=="CloseModal"&&(this.closeModal(),this.dispatchNamedEvent(t.data)),t.type=="AddContentToHead"){const i=t.data;if(i&&i.name){if(i.attributes&&i.attributes.id&&document.getElementById(i.attributes.id))return;document.head.appendChild(this.createElement(t))}}if(t.type=="AddContentToBody"){const i=t.data;if(i&&i.name){if(i.attributes&&i.attributes.id&&document.getElementById(i.attributes.id))return;document.body.appendChild(this.createElement(t))}}}dispatchNamedEvent(t){if(t&&t.eventName){const i=this.component,a=i?.emitsName??i?.serverSideType;let s=t.payload??t.detail;a&&s&&typeof s=="object"&&(s={...s,__source:a}),this.dispatchEvent(new CustomEvent(t.eventName,{detail:s,bubbles:!0,composed:!0}))}}}Ba([m()],bi.prototype,"id");Ba([m()],bi.prototype,"baseUrl");var Ko=Object.defineProperty,Jo=(e,t,i,a)=>{for(var s=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=n(t,i,s)||s);return s&&Ko(t,i,s),s};class Xt extends bi{applyFragment(t){}manageActionRequestedEvent(t){}}Jo([m()],Xt.prototype,"component");var it=(e=>(e.OnLoad="OnLoad",e.OnSuccess="OnSuccess",e.OnError="OnError",e.OnValueChange="OnValueChange",e.OnCustomEvent="OnCustomEvent",e.AutoSave="AutoSave",e))(it||{}),Yo=Object.defineProperty,gi=(e,t,i,a)=>{for(var s=void 0,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=n(t,i,s)||s);return s&&Yo(t,i,s),s};class lt extends Xt{constructor(){super(...arguments),this.state={},this.data={},this.appData={},this.appState={},this.triggerOnLoad=()=>{const t=this.component;this.registerCustomEventListeners(),t.triggers?.filter(i=>i.type==it.OnLoad).forEach(i=>{if((!i.condition||this._evalExpr(i.condition))&&!i.triggered){const s=i;s.triggered=!0;var a=s.times-1;s.timeoutMillis>0?this.scheduleOnload(s,a,this.id):this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))}})},this.scheduleOnload=(t,i,a)=>{if(a!=this.component?.id)return;const s=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:t.actionId,callbackToken:s},bubbles:!0,composed:!0}))},t.timeoutMillis)},this._registeredCustomEventListeners=[],this.customEventManager=t=>{if(!(t instanceof CustomEvent))return;const i=t,s=(this.component.triggers??[]).filter(r=>r.type==it.OnCustomEvent).filter(r=>r.eventName==i.type).filter(r=>r.source!=="COMPONENT"||i.detail?.__source===r.from);s.length!==0&&(s.some(r=>!r.source||r.source==="SELF")&&(t.stopPropagation(),t.preventDefault()),s.forEach(r=>{(!r.condition||this._evalExpr(r.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:r.actionId,parameters:i.detail},bubbles:!0,composed:!0}))}))}}_interpolationExtra(){return{appState:this.appState??{},appData:this.appData??{},component:this.component}}_evalExpr(t){return Ia(t,this.state??{},this.data??{},this._interpolationExtra())}_evalTemplate(t){return Is(t,this.state??{},this.data??{},this._interpolationExtra())}applyFragment(t){if(this.id==t.targetComponentId){if(t.component)if(Gt.Add==t.action)this.component&&this.component.children?.push(t.component);else{if(this.callbackToken=Z(),t.component?.type==U.ServerSide)if(this.component){const a=this.component,s=t.component;a.actions=s.actions,a.type=s.type,a.rules=s.rules,a.triggers=s.triggers,a.serverSideType=s.serverSideType,a.route=s.route,a.initialData=s.initialData,a.validations=s.validations,a.cssClasses=s.cssClasses,a.slot=s.slot,a.style=s.style,a.children=s.children,(a.serverSideType!=s.serverSideType||a.id!=s.id)&&setTimeout(()=>this.triggerOnLoad())}else this.component=t.component,setTimeout(()=>this.triggerOnLoad());else{const a=[t.component];this.component&&(this.component.children=a)}t.action!==Gt.ReplaceKeepData&&(this.state={},this.data={})}if(t.state&&(this.state={...this.state,...t.state}),t.data){for(const a in t.data){const s=t.data[a]?.page;s?.pageNumber>0&&this.data[a]&&this.data[a].page.content&&(s.content?s.content=[...this.data[a].page.content,...s.content]:s.content=[...this.data[a].page.content])}this.data={...this.data,...t.data}}this.registerCustomEventListeners();const i=H.getAfterRenderHook();i&&setTimeout(()=>i(this)),this.requestUpdate()}}registerCustomEventListeners(){this._registeredCustomEventListeners.forEach(({target:i,name:a})=>i.removeEventListener(a,this.customEventManager)),this._registeredCustomEventListeners=[],this.component?.triggers?.filter(i=>i.type==it.OnCustomEvent).forEach(i=>{const a=i.source==="DOCUMENT"||i.source==="COMPONENT"?document:this;a.addEventListener(i.eventName,this.customEventManager),this._registeredCustomEventListeners.push({target:a,name:i.eventName})})}disconnectedCallback(){this._registeredCustomEventListeners.forEach(({target:t,name:i})=>t.removeEventListener(i,this.customEventManager)),this._registeredCustomEventListeners=[],super.disconnectedCallback()}connectedCallback(){super.connectedCallback(),this.component&&this.registerCustomEventListeners()}}gi([m()],lt.prototype,"state");gi([m()],lt.prototype,"data");gi([m()],lt.prototype,"appData");gi([m()],lt.prototype,"appState");const Xo={lon:0,lat:0},ha=3,Qo=e=>{if(!e)return;const t=e.split(",").map(s=>s.trim());if(t.length!==2)return;const i=Number(t[0]),a=Number(t[1]);if(!(t[0]===""||t[1]===""||!Number.isFinite(i)||!Number.isFinite(a)))return{lon:a,lat:i}},Zo=e=>{if(e==null||e.trim()==="")return ha;const t=Number(e);return Number.isFinite(t)?t:ha};var en=Object.defineProperty,tn=Object.getOwnPropertyDescriptor,$i=(e,t,i,a)=>{for(var s=a>1?void 0:a?tn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&en(t,i,s),s};let Ot=class extends L{constructor(){super(...arguments),this.renderSeq=0}updated(e){super.updated(e),this.createMap()}disconnectedCallback(){super.disconnectedCallback(),this.map?.setTarget(void 0),this.map=void 0}async createMap(){const e=++this.renderSeq,[{default:t},{default:i},{default:a},{default:s},{fromLonLat:r},{default:n}]=await Promise.all([ce(()=>import("./vendor-ol.js").then(c=>c.M),[]),ce(()=>import("./vendor-ol.js").then(c=>c.V),[]),ce(()=>import("./vendor-ol.js").then(c=>c.T),[]),ce(()=>import("./vendor-ol.js").then(c=>c.O),[]),ce(()=>import("./vendor-ol.js").then(c=>c.p),[]),ce(()=>import("./vendor-ol.js").then(c=>c.o),[])]);if(e!==this.renderSeq||!this.isConnected)return;if(!this.shadowRoot.querySelector("style[data-ol]")){const c=document.createElement("style");c.setAttribute("data-ol",""),c.textContent=n,this.shadowRoot.appendChild(c)}this.map&&(this.map.setTarget(void 0),this.map=void 0);const l=Qo(this.position)??Xo;this.map=new t({target:this.mapElement,layers:[new a({source:new s})],view:new i({center:r([l.lon,l.lat]),zoom:Zo(this.zoom)})})}render(){return o`<div id="map"></div>`}};Ot.styles=T`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `;$i([m()],Ot.prototype,"position",2);$i([m()],Ot.prototype,"zoom",2);$i([Me("#map")],Ot.prototype,"mapElement",2);Ot=$i([_("mateu-map")],Ot);const an=typeof HTMLElement<"u"?HTMLElement:class{};class sn extends an{static get observedAttributes(){return["content"]}#e;#t=0;get content(){return this.#e}set content(t){this.#e=t,this.#i()}attributeChangedCallback(t,i,a){this.content=a??void 0}connectedCallback(){this.style.display="block",this.#i()}async#i(){if(!this.isConnected)return;const t=this.#e??"",i=++this.#t,[{marked:a},{default:s}]=await Promise.all([ce(()=>import("./vendor.js").then(r=>r.f),[]),ce(()=>import("./vendor.js").then(r=>r.c),[])]);i===this.#t&&(this.innerHTML=s.sanitize(await a.parse(t),{CUSTOM_ELEMENT_HANDLING:{tagNameCheck:r=>!0}}))}}typeof customElements<"u"&&!customElements.get("mateu-markdown")&&customElements.define("mateu-markdown",sn);var rn=Object.defineProperty,on=Object.getOwnPropertyDescriptor,Qt=(e,t,i,a)=>{for(var s=a>1?void 0:a?on(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&rn(t,i,s),s};let ft=class extends L{constructor(){super(...arguments),this.fieldId="",this.signing=!1,this.hasStrokes=!1,this.drawing=!1,this.startStroke=e=>{const t=e.target;this.ensureCanvasSize(t),t.setPointerCapture(e.pointerId),this.drawing=!0;const i=t.getContext("2d");i.lineWidth=2,i.lineCap="round",i.lineJoin="round",i.strokeStyle=getComputedStyle(this).getPropertyValue("--lumo-body-text-color")||"#1a1a1a";const[a,s]=this.pointerPosition(e);i.beginPath(),i.moveTo(a,s),e.preventDefault()},this.stroke=e=>{if(!this.drawing)return;const i=e.target.getContext("2d"),[a,s]=this.pointerPosition(e);i.lineTo(a,s),i.stroke(),this.hasStrokes=!0,e.preventDefault()},this.endStroke=e=>{this.drawing=!1,e.target.releasePointerCapture(e.pointerId)}}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}canvas(){return this.renderRoot.querySelector("canvas")}pointerPosition(e){const i=e.target.getBoundingClientRect();return[e.clientX-i.left,e.clientY-i.top]}ensureCanvasSize(e){const t=e.getBoundingClientRect();(e.width!==Math.round(t.width)||e.height!==Math.round(t.height))&&(e.width=Math.round(t.width),e.height=Math.round(t.height))}clear(){const e=this.canvas();e&&e.getContext("2d").clearRect(0,0,e.width,e.height),this.hasStrokes=!1}accept(){const e=this.canvas();!e||!this.hasStrokes||(this.signing=!1,this.emit(e.toDataURL("image/png")))}renderPad(){return o`
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
                    <button class="button" @click="${()=>{this.signing=!1}}">Cancel</button>`:d}
            </div>`}render(){const e=this.value!=null&&this.value!=="";return this.signing||!e?this.renderPad():o`
            <img class="preview" src="${this.value}" alt="Signature"/>
            <div class="actions">
                <button class="button" @click="${()=>{this.signing=!0,this.hasStrokes=!1,this.updateComplete.then(()=>this.clear())}}">Sign again</button>
                <button class="button button--danger" @click="${()=>this.emit("")}">Delete</button>
            </div>`}};ft.styles=T`
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
    `;Qt([m()],ft.prototype,"fieldId",2);Qt([m()],ft.prototype,"value",2);Qt([g()],ft.prototype,"signing",2);Qt([g()],ft.prototype,"hasStrokes",2);ft=Qt([_("mateu-signature-pad")],ft);var nn=Object.defineProperty,ln=Object.getOwnPropertyDescriptor,Ct=(e,t,i,a)=>{for(var s=a>1?void 0:a?ln(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&nn(t,i,s),s};let Ge=class extends L{constructor(){super(...arguments),this.fieldId="",this.options=[],this.leavesOnly=!1,this.opened=!1,this.expanded=new Set}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}open(){this.opened||(this.opened=!0,this.expanded=new Set(this.pathTo(this.value??"",this.options)??[]),this.outsideClick=e=>{e.composedPath().includes(this)||this.close()},document.addEventListener("mousedown",this.outsideClick))}close(){this.detachOutsideClick(),this.opened=!1}pick(e){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e.value,fieldId:this.fieldId},bubbles:!0,composed:!0}))}clear(){this.close(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:void 0,fieldId:this.fieldId},bubbles:!0,composed:!0}))}pathTo(e,t){for(const i of t){if(String(i.value)===e)return[];const a=this.pathTo(e,i.children??[]);if(a!=null)return[String(i.value),...a]}return null}labelOf(e,t){for(const i of t){if(String(i.value)===e)return i.label;const a=this.labelOf(e,i.children??[]);if(a!=null)return a}return null}toggle(e){const t=String(e.value),i=new Set(this.expanded);i.has(t)?i.delete(t):i.add(t),this.expanded=i}renderNode(e,t){const i=(e.children?.length??0)>0,a=this.expanded.has(String(e.value)),s=!this.leavesOnly||!i,r=String(e.value)===String(this.value??"");return o`
            <div class="node ${r?"node--selected":""} ${s?"":"node--group"}"
                 style="padding-left: ${.5+t*1.1}rem;"
                 @mousedown="${n=>n.preventDefault()}"
                 @click="${()=>s?this.pick(e):this.toggle(e)}">
                ${i?o`
                    <span class="caret" @click="${n=>{n.stopPropagation(),this.toggle(e)}}"
                    >${a?"▾":"▸"}</span>`:o`<span class="caret caret--empty"></span>`}
                ${e.label}
            </div>
            ${i&&a?e.children.map(n=>this.renderNode(n,t+1)):d}`}render(){const e=this.value?this.labelOf(String(this.value),this.options)??String(this.value):"";return o`
            <div class="root">
                <button class="control" @click="${()=>this.opened?this.close():this.open()}">
                    <span class="${e?"":"placeholder"}">${e||"—"}</span>
                    <span class="chevron" aria-hidden="true">▾</span>
                </button>
                ${this.opened?o`
                    <div class="panel">
                        ${this.value?o`
                            <div class="node node--clear"
                                 @mousedown="${t=>t.preventDefault()}"
                                 @click="${this.clear}">— (clear)</div>`:d}
                        ${this.options.map(t=>this.renderNode(t,0))}
                    </div>`:d}
            </div>`}};Ge.styles=T`
        :host {
            display: block;
            min-width: 12rem;
        }
        .root {
            position: relative;
        }
        .control {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            font: inherit;
            font-size: var(--lumo-font-size-m, 1rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border: none;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            padding: 0.45rem 0.75rem;
            cursor: pointer;
            text-align: left;
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
            max-height: 18rem;
            overflow-y: auto;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 16px rgba(0, 0, 0, 0.15));
            z-index: 300;
            padding: 0.25rem 0;
        }
        .node {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.35rem 0.75rem;
            cursor: pointer;
            color: var(--lumo-body-text-color, #1a1a1a);
            font-size: var(--lumo-font-size-s, 0.875rem);
            white-space: nowrap;
        }
        .node:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
        }
        .node--selected {
            font-weight: 600;
        }
        .node--group {
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.65));
        }
        .node--clear {
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
        }
        .caret {
            width: 1rem;
            flex: none;
            text-align: center;
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
        }
        .caret--empty::before {
            content: '';
        }
    `;Ct([m()],Ge.prototype,"fieldId",2);Ct([m()],Ge.prototype,"value",2);Ct([m()],Ge.prototype,"options",2);Ct([m({type:Boolean})],Ge.prototype,"leavesOnly",2);Ct([g()],Ge.prototype,"opened",2);Ct([g()],Ge.prototype,"expanded",2);Ge=Ct([_("mateu-tree-select")],Ge);var dn=Object.defineProperty,cn=Object.getOwnPropertyDescriptor,Zt=(e,t,i,a)=>{for(var s=a>1?void 0:a?cn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&dn(t,i,s),s};let bt=class extends L{constructor(){super(...arguments),this.fieldId="",this.cameraOpen=!1,this.cameraError=!1,this.fileFallback=e=>{const t=e.target,i=t.files?.[0];if(!i)return;const a=new FileReader;a.onload=()=>this.emit(a.result),a.readAsDataURL(i),t.value=""}}disconnectedCallback(){super.disconnectedCallback(),this.stopStream()}emit(e){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e,fieldId:this.fieldId},bubbles:!0,composed:!0}))}stopStream(){this.stream?.getTracks().forEach(e=>e.stop()),this.stream=void 0}async openCamera(){this.cameraError=!1;try{this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:!1}),this.cameraOpen=!0,await this.updateComplete;const e=this.renderRoot.querySelector("video");e&&(e.srcObject=this.stream,await e.play())}catch{this.stopStream(),this.cameraOpen=!1,this.cameraError=!0}}closeCamera(){this.stopStream(),this.cameraOpen=!1}shoot(){const e=this.renderRoot.querySelector("video");if(!e||e.videoWidth===0)return;const t=document.createElement("canvas");t.width=e.videoWidth,t.height=e.videoHeight,t.getContext("2d").drawImage(e,0,0),this.closeCamera(),this.emit(t.toDataURL("image/jpeg",.9))}triggerFallback(){this.renderRoot.querySelector("input[type=file]")?.click()}render(){const e=this.value!=null&&this.value!=="";return o`
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
                        <button class="button" @click="${this.triggerFallback}">Use file / native camera</button>`:d}
                    ${e?o`
                        <button class="button button--danger" @click="${()=>this.emit("")}">Delete</button>`:d}
                </div>
                ${this.cameraError?o`
                    <div class="error-hint">Camera unavailable — the file picker opens the device camera on phones.</div>`:d}
            `}`}};bt.styles=T`
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
    `;Zt([m()],bt.prototype,"fieldId",2);Zt([m()],bt.prototype,"value",2);Zt([g()],bt.prototype,"cameraOpen",2);Zt([g()],bt.prototype,"cameraError",2);bt=Zt([_("mateu-camera-capture")],bt);var un=Object.defineProperty,hn=Object.getOwnPropertyDescriptor,dt=(e,t,i,a)=>{for(var s=a>1?void 0:a?hn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&un(t,i,s),s};const pn=()=>{let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e},mn=(e,t)=>{let i=t;for(;i;){if(i===e)return!0;i=i.assignedSlot??i.parentNode??i.host??null}return!1};let qe=class extends Xt{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.hoveredItem=null,this.onGridHoverMove=e=>{const t=e.currentTarget,i=t.getEventContext(e)?.item??null;i!==this.hoveredItem&&(this.hoveredItem=i,t.generateCellPartNames())},this.onGridHoverLeave=e=>{this.hoveredItem!==null&&(this.hoveredItem=null,e.currentTarget.generateCellPartNames())},this.hoverCellPartNameGenerator=(e,t)=>t?.item!=null&&t.item===this.hoveredItem?"hovered-cell":"",this._onRowKey=e=>{const t=this.field?.rowSelectionShortcut;if(!t||!this.field?.onItemSelectionActionId||!this._isRowShortcutRelevant()||!Ta(t,e))return;const i=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!i)return;const a=this.currentItems(),s=parseInt(i[1],10)-1;s>=a.length||(e.preventDefault(),this.selectRow(a[s]))},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onRowKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onRowKey)}currentItems(){return this.field?.remoteCoordinates?this.data?.[this.id]?.content??[]:this.field?.fieldId&&this.state?this.state[this.field.fieldId]??[]:[]}selectRow(e){!e||!this.field?.onItemSelectionActionId||(this.selectedItems=[e],this.state[this.id+"_selected_items"]=[e],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.field.onItemSelectionActionId,parameters:{_clickedRow:e}},bubbles:!0,composed:!0})))}_isRowShortcutRelevant(){if(this.offsetParent===null&&this.getClientRects().length===0)return!1;const e=pn();if(e&&e!==document.body&&!mn(this,e)){const t=e.tagName?.toLowerCase()??"";if(e.isContentEditable||/^(input|textarea|select)$/.test(t)||t.startsWith("vaadin-")&&/(field|combo|picker|area|select)/.test(t))return!1}return!0}handleItemToggle(e){const{item:t,selected:i,shiftKey:a}=e.detail;if(this.rangeStartItem??=t,a){let s=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(s=this.state[this.field.fieldId]);const[r,n]=[this.rangeStartItem,t].map(u=>s.indexOf(u)).sort((u,p)=>u-p),l=s.slice(r,n+1),c=new Set(this.selectedItems);l.forEach(u=>{i?c.add(u):c.delete(u)}),this.selectedItems=[...c],this.state[this.id+"_selected_items"]=this.selectedItems}this.rangeStartItem=t}render(){let e=[];this.field?.fieldId&&this.state&&this.state[this.field.fieldId]&&(e=this.state[this.field.fieldId]);const t=this.state[this.field?.fieldId+"_show_detail"]||this.state._show_detail&&this.state._show_detail[this.field.fieldId];if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates,a="";this.data[this.id]&&(this.data[this.id].searchSignature||a)&&this.data[this.id].searchSignature!=a&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements?e=this.data[this.id].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:a,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}if(Array.isArray(e)&&e.forEach((i,a)=>{i&&typeof i=="object"&&i._rowNumber===void 0&&(i._rowNumber=a)}),this.field?.inlineEditing)return this.renderMaster(e);if(this.field?.formPosition&&this.field?.formPosition.startsWith("modal")){const i=this;return o`

                ${this.renderMaster(e)}

                <vaadin-dialog
                        .opened="${t}"
                        @closed="${()=>{i.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.field?.fieldId+"_cancel"},bubbles:!0,composed:!0}))}}"
                        ${pi(()=>o`
                            <mateu-event-interceptor .target="${i}">
                                <div id="container" style="${this.field?.formStyle??"display: contents;"}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                                </div>
                            </mateu-event-interceptor>
                            `,[()=>Z()])}
                ></vaadin-dialog>
                
            `}else{const i=this.field?.formPosition=="left"||this.field?.formPosition=="right"?"horizontal":"vertical";return o`
            <vaadin-master-detail-layout
                    style="overflow: unset; width: 100%; ${t&&this.field?.minHeightWhenDetailVisible?"min-height: "+this.field?.minHeightWhenDetailVisible+";":""}"
                    orientation="${i}"
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
                    .cellPartNameGenerator="${O(this.field?.onItemSelectionActionId?this.hoverCellPartNameGenerator:void 0)}"
                    @mousemove="${O(this.field?.onItemSelectionActionId?this.onGridHoverMove:void 0)}"
                    @mouseleave="${O(this.field?.onItemSelectionActionId?this.onGridHoverLeave:void 0)}"
                    style="${this.field?.onItemSelectionActionId?"cursor: pointer;":""}${this.field?.style??""}"
                    class="${this.field?.cssClasses}"
                    .items="${e}"
                    .selectedItems="${t}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${i=>{this.selectedItems=i.detail.value,this.state[this.id+"_selected_items"]=this.selectedItems}}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${O(this.field?.onItemSelectionActionId?i=>{const s=i.currentTarget.getEventContext(i)?.item;s&&this.selectRow(s)}:void 0)}"
                    @active-item-changed="${O(this.field?.detailPath&&!this.field?.useButtonForDetail?i=>{if(this.field?.detailPath){const a=i.detail.value;a?this.detailsOpenedItems=[a]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${O(this.field?.detailPath?ka(i=>o`${b(this,i[this.field?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    ?all-rows-visible=${e?.length<10}
            >
                <span slot="empty-state">${this.field?.label?`No ${this.field.label.toLowerCase()} added yet.`:"No items added yet."}</span>
                ${this.field?.readOnly||this.field?.inlineEditing?d:o`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(i=>Ui(i,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}

                ${this.field?.inlineEditing&&!this.field?.readOnly?o`
                    <vaadin-grid-column width="3.5rem" flex-grow="0" frozen-to-end
                            ${Ve(i=>o`
                                <vaadin-button theme="tertiary icon error" title="Remove row"
                                    @click="${()=>{this.state[this.id+"_selected_items"]=[i],this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.id+"_remove"},bubbles:!0,composed:!0}))}}">
                                    <vaadin-icon icon="vaadin:trash"></vaadin-icon>
                                </vaadin-button>`,[])}
                    ></vaadin-grid-column>
                `:d}

                ${this.field?.useButtonForDetail?o`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${Ve((i,{detailsOpened:a})=>o`
              <vaadin-button
                theme="tertiary icon"
                title="${a?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${a?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=this.detailsOpenedItems.length?this.detailsOpenedItems[0]._rowNumber==i._rowNumber?[]:[i]:[i]}}"
              >
                <vaadin-icon
                  .icon="${a?"lumo:angle-down":"lumo:angle-right"}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:d}

            </vaadin-grid>
            ${this.field?.readOnly?d:this.field?.inlineEditing?o`
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
        </vaadin-vertical-layout>`}};qe.styles=T`
        ${ot}

        /* Clickable grids (a row-selection action is wired) give visual feedback: the host sets a
           pointer cursor (inline, inherited by the slotted cell content), and the cells of the
           hovered row — tagged "hovered-cell" by cellPartNameGenerator — get a subtle highlight. */
        vaadin-grid[clickable]::part(hovered-cell) {
            background-color: var(--lumo-primary-color-10pct);
            cursor: pointer;
        }
    `;dt([m()],qe.prototype,"field",2);dt([m()],qe.prototype,"state",2);dt([m()],qe.prototype,"data",2);dt([m()],qe.prototype,"appState",2);dt([m()],qe.prototype,"appData",2);dt([m()],qe.prototype,"selectedItems",2);dt([g()],qe.prototype,"detailsOpenedItems",2);qe=dt([_("mateu-grid")],qe);var vn=Object.defineProperty,fn=Object.getOwnPropertyDescriptor,At=(e,t,i,a)=>{for(var s=a>1?void 0:a?fn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&vn(t,i,s),s};let st=class extends L{constructor(){super(...arguments),this.getNewValue=e=>{if(this.field?.dataType=="array"){if(!this.value)return[e];const t=this.value;return t.indexOf(e)>=0?t.filter(i=>i!==e):[...t,e]}return e}}render(){let e=this.field?.options;if(this.field?.remoteCoordinates){const i=this.field.remoteCoordinates;this.data?.[this.field.fieldId]&&this.data[this.field.fieldId].content&&this.data[this.field.fieldId].totalElements?e=this.data[this.field.fieldId].content:this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:i.action,parameters:{searchText:"",fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}const t=this.field?.attributes?.divStyle;return o`
        <div style="display: flex; gap: 1rem; padding: 1rem; flex-wrap: wrap; ${t}">
                                    ${e?.map(i=>o`
                            <div 
                                    class="choice ${this.value==i.value||Array.isArray(this.value)&&this.value.includes(i.value)?"selected":""}"
                                    @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.getNewValue(i.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}"
                            >${i.description||i.image?o`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${i.image?o`
                                            <img src="${i.image}" alt="${i.label}" style="${i.imageStyle??"width: 2rem;"}" />
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
                            `:i.label}</div>
                        `)}
                                </div>

       `}};st.styles=T`
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
  `;At([m()],st.prototype,"field",2);At([m()],st.prototype,"baseUrl",2);At([m()],st.prototype,"state",2);At([m()],st.prototype,"data",2);At([m()],st.prototype,"value",2);st=At([_("mateu-choice")],st);var bn=Object.defineProperty,gn=Object.getOwnPropertyDescriptor,Ue=(e,t,i,a)=>{for(var s=a>1?void 0:a?gn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&bn(t,i,s),s};let xe=class extends L{constructor(){super(...arguments),this.currencyChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),this.value.currency=e.detail.value,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}}))},this.valueChanged=e=>{this.value||(this.value={value:0,currency:"EUR",locale:"es-ES"}),e.detail.value&&(this.value.value=e.detail.value?parseFloat(e.detail.value):0,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{...this.value},fieldId:this.fieldId}})))}}render(){return o`
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
       `}};xe.styles=T`
  `;Ue([m()],xe.prototype,"fieldId",2);Ue([m()],xe.prototype,"label",2);Ue([m()],xe.prototype,"state",2);Ue([m()],xe.prototype,"data",2);Ue([m()],xe.prototype,"value",2);Ue([m()],xe.prototype,"autoFocus",2);Ue([m()],xe.prototype,"required",2);Ue([m()],xe.prototype,"colspan",2);Ue([m()],xe.prototype,"helperText",2);xe=Ue([_("mateu-money-field")],xe);const pa=["vaadin:abacus","vaadin:absolute-position","vaadin:academy-cap","vaadin:accessibility","vaadin:accordion-menu","vaadin:add-dock","vaadin:adjust","vaadin:adobe-flash","vaadin:airplane","vaadin:alarm","vaadin:align-center","vaadin:align-justify","vaadin:align-left","vaadin:align-right","vaadin:alt-a","vaadin:alt","vaadin:ambulance","vaadin:anchor","vaadin:angle-double-down","vaadin:angle-double-left","vaadin:angle-double-right","vaadin:angle-double-up","vaadin:angle-down","vaadin:angle-left","vaadin:angle-right","vaadin:angle-up","vaadin:archive","vaadin:archives","vaadin:area-select","vaadin:arrow-backward","vaadin:arrow-circle-down-o","vaadin:arrow-circle-down","vaadin:arrow-circle-left-o","vaadin:arrow-circle-left","vaadin:arrow-circle-right-o","vaadin:arrow-circle-right","vaadin:arrow-circle-up-o","vaadin:arrow-circle-up","vaadin:arrow-down","vaadin:arrow-forward","vaadin:arrow-left","vaadin:arrow-long-down","vaadin:arrow-long-left","vaadin:arrow-right","vaadin:arrow-up","vaadin:arrows-cross","vaadin:arrows-long-h","vaadin:arrows-long-right","vaadin:arrows-long-up","vaadin:arrows-long-v","vaadin:arrows","vaadin:asterisk","vaadin:at","vaadin:automation","vaadin:backspace-a","vaadin:backspace","vaadin:backwards","vaadin:ban","vaadin:bar-chart-h","vaadin:bar-chart-v","vaadin:bar-chart","vaadin:barcode","vaadin:bed","vaadin:bell-o","vaadin:bell-slash-o","vaadin:bell-slash","vaadin:bell","vaadin:boat","vaadin:bold","vaadin:bolt","vaadin:bomb","vaadin:book-dollar","vaadin:book-percent","vaadin:book","vaadin:bookmark-o","vaadin:bookmark","vaadin:briefcase","vaadin:browser","vaadin:bug-o","vaadin:bug","vaadin:building-o","vaadin:building","vaadin:bullets","vaadin:bullseye","vaadin:bus","vaadin:buss","vaadin:button","vaadin:calc-book","vaadin:calc","vaadin:calendar-briefcase","vaadin:calendar-clock","vaadin:calendar-envelope","vaadin:calendar-o","vaadin:calendar-user","vaadin:calendar","vaadin:camera","vaadin:car","vaadin:caret-down","vaadin:caret-left","vaadin:caret-right","vaadin:caret-square-down-o","vaadin:caret-square-left-o","vaadin:caret-square-right-o","vaadin:caret-square-up-o","vaadin:caret-up","vaadin:cart-o","vaadin:cart","vaadin:cash","vaadin:chart-3d","vaadin:chart-grid","vaadin:chart-line","vaadin:chart-timeline","vaadin:chart","vaadin:chat","vaadin:check-circle-o","vaadin:check-circle","vaadin:check-square-o","vaadin:check-square","vaadin:check","vaadin:chevron-circle-down-o","vaadin:chevron-circle-down","vaadin:chevron-circle-left-o","vaadin:chevron-circle-left","vaadin:chevron-circle-right-o","vaadin:chevron-circle-right","vaadin:chevron-circle-up-o","vaadin:chevron-circle-up","vaadin:chevron-down-small","vaadin:chevron-down","vaadin:chevron-left-small","vaadin:chevron-left","vaadin:chevron-right-small","vaadin:chevron-right","vaadin:chevron-up-small","vaadin:chevron-up","vaadin:child","vaadin:circle-thin","vaadin:circle","vaadin:clipboard-check","vaadin:clipboard-cross","vaadin:clipboard-heart","vaadin:clipboard-pulse","vaadin:clipboard-text","vaadin:clipboard-user","vaadin:clipboard","vaadin:clock","vaadin:close-big","vaadin:close-circle-o","vaadin:close-circle","vaadin:close-small","vaadin:close","vaadin:cloud-download-o","vaadin:cloud-download","vaadin:cloud-o","vaadin:cloud-upload-o","vaadin:cloud-upload","vaadin:cloud","vaadin:cluster","vaadin:code","vaadin:coffee","vaadin:cog-o","vaadin:cog","vaadin:cogs","vaadin:coin-piles","vaadin:coins","vaadin:combobox","vaadin:comment-ellipsis-o","vaadin:comment-ellipsis","vaadin:comment-o","vaadin:comment","vaadin:comments-o","vaadin:comments","vaadin:compile","vaadin:compress-square","vaadin:compress","vaadin:connect-o","vaadin:connect","vaadin:controller","vaadin:copy-o","vaadin:copy","vaadin:copyright","vaadin:corner-lower-left","vaadin:corner-lower-right","vaadin:corner-upper-left","vaadin:corner-upper-right","vaadin:credit-card","vaadin:crop","vaadin:cross-cutlery","vaadin:crosshairs","vaadin:css","vaadin:ctrl-a","vaadin:ctrl","vaadin:cube","vaadin:cubes","vaadin:curly-brackets","vaadin:cursor-o","vaadin:cursor","vaadin:cutlery","vaadin:dashboard","vaadin:database","vaadin:date-input","vaadin:deindent","vaadin:del-a","vaadin:del","vaadin:dental-chair","vaadin:desktop","vaadin:diamond-o","vaadin:diamond","vaadin:diploma-scroll","vaadin:diploma","vaadin:disc","vaadin:doctor-briefcase","vaadin:doctor","vaadin:dollar","vaadin:dot-circle","vaadin:download-alt","vaadin:download","vaadin:drop","vaadin:edit","vaadin:eject","vaadin:elastic","vaadin:ellipsis-circle-o","vaadin:ellipsis-circle","vaadin:ellipsis-dots-h","vaadin:ellipsis-dots-v","vaadin:ellipsis-h","vaadin:ellipsis-v","vaadin:enter-arrow","vaadin:enter","vaadin:envelope-o","vaadin:envelope-open-o","vaadin:envelope-open","vaadin:envelope","vaadin:envelopes-o","vaadin:envelopes","vaadin:eraser","vaadin:esc-a","vaadin:esc","vaadin:euro","vaadin:exchange","vaadin:exclamation-circle-o","vaadin:exclamation-circle","vaadin:exclamation","vaadin:exit-o","vaadin:exit","vaadin:expand-full","vaadin:expand-square","vaadin:expand","vaadin:external-browser","vaadin:external-link","vaadin:eye-slash","vaadin:eye","vaadin:eyedropper","vaadin:facebook-square","vaadin:facebook","vaadin:factory","vaadin:family","vaadin:fast-backward","vaadin:fast-forward","vaadin:female","vaadin:file-add","vaadin:file-code","vaadin:file-font","vaadin:file-movie","vaadin:file-o","vaadin:file-picture","vaadin:file-presentation","vaadin:file-process","vaadin:file-refresh","vaadin:file-remove","vaadin:file-search","vaadin:file-sound","vaadin:file-start","vaadin:file-table","vaadin:file-text-o","vaadin:file-text","vaadin:file-tree-small","vaadin:file-tree-sub","vaadin:file-tree","vaadin:file-zip","vaadin:file","vaadin:fill","vaadin:film","vaadin:filter","vaadin:fire","vaadin:flag-checkered","vaadin:flag-o","vaadin:flag","vaadin:flash","vaadin:flask","vaadin:flight-landing","vaadin:flight-takeoff","vaadin:flip-h","vaadin:flip-v","vaadin:folder-add","vaadin:folder-o","vaadin:folder-open-o","vaadin:folder-open","vaadin:folder-remove","vaadin:folder-search","vaadin:folder","vaadin:font","vaadin:form","vaadin:forward","vaadin:frown-o","vaadin:funcion","vaadin:function","vaadin:funnel","vaadin:gamepad","vaadin:gavel","vaadin:gift","vaadin:glass","vaadin:glasses","vaadin:globe-wire","vaadin:globe","vaadin:golf","vaadin:google-plus-square","vaadin:google-plus","vaadin:grab","vaadin:grid-bevel","vaadin:grid-big-o","vaadin:grid-big","vaadin:grid-h","vaadin:grid-small-o","vaadin:grid-small","vaadin:grid-v","vaadin:grid","vaadin:group","vaadin:hammer","vaadin:hand","vaadin:handle-corner","vaadin:hands-up","vaadin:handshake","vaadin:harddrive-o","vaadin:harddrive","vaadin:hash","vaadin:header","vaadin:headphones","vaadin:headset","vaadin:health-card","vaadin:heart-o","vaadin:heart","vaadin:home-o","vaadin:home","vaadin:hospital","vaadin:hourglass-empty","vaadin:hourglass-end","vaadin:hourglass-start","vaadin:hourglass","vaadin:inbox","vaadin:indent","vaadin:info-circle-o","vaadin:info-circle","vaadin:info","vaadin:input","vaadin:insert","vaadin:institution","vaadin:invoice","vaadin:italic","vaadin:key-o","vaadin:key","vaadin:keyboard-o","vaadin:keyboard","vaadin:laptop","vaadin:layout","vaadin:level-down-bold","vaadin:level-down","vaadin:level-left-bold","vaadin:level-left","vaadin:level-right-bold","vaadin:level-right","vaadin:level-up-bold","vaadin:level-up","vaadin:lifebuoy","vaadin:lightbulb","vaadin:line-bar-chart","vaadin:line-chart","vaadin:line-h","vaadin:line-v","vaadin:lines-list","vaadin:lines","vaadin:link","vaadin:list-ol","vaadin:list-select","vaadin:list-ul","vaadin:list","vaadin:location-arrow-circle-o","vaadin:location-arrow-circle","vaadin:location-arrow","vaadin:lock","vaadin:magic","vaadin:magnet","vaadin:mailbox","vaadin:male","vaadin:map-marker","vaadin:margin-bottom","vaadin:margin-left","vaadin:margin-right","vaadin:margin-top","vaadin:margin","vaadin:medal","vaadin:megafone","vaadin:megaphone","vaadin:meh-o","vaadin:menu","vaadin:microphone","vaadin:minus-circle-o","vaadin:minus-circle","vaadin:minus-square-o","vaadin:minus","vaadin:mobile-browser","vaadin:mobile-retro","vaadin:mobile","vaadin:modal-list","vaadin:modal","vaadin:money-deposit","vaadin:money-exchange","vaadin:money-withdraw","vaadin:money","vaadin:moon-o","vaadin:moon","vaadin:morning","vaadin:movie","vaadin:music","vaadin:mute","vaadin:native-button","vaadin:newspaper","vaadin:notebook","vaadin:nurse","vaadin:office","vaadin:open-book","vaadin:option-a","vaadin:option","vaadin:options","vaadin:orientation","vaadin:out","vaadin:outbox","vaadin:package","vaadin:padding-bottom","vaadin:padding-left","vaadin:padding-right","vaadin:padding-top","vaadin:padding","vaadin:paint-roll","vaadin:paintbrush","vaadin:palete","vaadin:palette","vaadin:panel","vaadin:paperclip","vaadin:paperplane-o","vaadin:paperplane","vaadin:paragraph","vaadin:password","vaadin:paste","vaadin:pause","vaadin:pencil","vaadin:phone-landline","vaadin:phone","vaadin:picture","vaadin:pie-bar-chart","vaadin:pie-chart","vaadin:piggy-bank-coin","vaadin:piggy-bank","vaadin:pill","vaadin:pills","vaadin:pin-post","vaadin:pin","vaadin:play-circle-o","vaadin:play-circle","vaadin:play","vaadin:plug","vaadin:plus-circle-o","vaadin:plus-circle","vaadin:plus-minus","vaadin:plus-square-o","vaadin:plus","vaadin:pointer","vaadin:power-off","vaadin:presentation","vaadin:print","vaadin:progressbar","vaadin:puzzle-piece","vaadin:pyramid-chart","vaadin:qrcode","vaadin:question-circle-o","vaadin:question-circle","vaadin:question","vaadin:quote-left","vaadin:quote-right","vaadin:random","vaadin:raster-lower-left","vaadin:raster","vaadin:records","vaadin:recycle","vaadin:refresh","vaadin:reply-all","vaadin:reply","vaadin:resize-h","vaadin:resize-v","vaadin:retweet","vaadin:rhombus","vaadin:road-branch","vaadin:road-branches","vaadin:road-split","vaadin:road","vaadin:rocket","vaadin:rotate-left","vaadin:rotate-right","vaadin:rss-square","vaadin:rss","vaadin:safe-lock","vaadin:safe","vaadin:scale-unbalance","vaadin:scale","vaadin:scatter-chart","vaadin:scissors","vaadin:screwdriver","vaadin:search-minus","vaadin:search-plus","vaadin:search","vaadin:select","vaadin:server","vaadin:share-square","vaadin:share","vaadin:shield","vaadin:shift-arrow","vaadin:shift","vaadin:shop","vaadin:sign-in-alt","vaadin:sign-in","vaadin:sign-out-alt","vaadin:sign-out","vaadin:signal","vaadin:sitemap","vaadin:slider","vaadin:sliders","vaadin:smiley-o","vaadin:sort","vaadin:sound-disable","vaadin:spark-line","vaadin:specialist","vaadin:spinner-arc","vaadin:spinner-third","vaadin:spinner","vaadin:spline-area-chart","vaadin:spline-chart","vaadin:split-h","vaadin:split-v","vaadin:split","vaadin:spoon","vaadin:square-shadow","vaadin:star-half-left-o","vaadin:star-half-left","vaadin:star-half-right-o","vaadin:star-half-right","vaadin:star-o","vaadin:star","vaadin:start-cog","vaadin:step-backward","vaadin:step-forward","vaadin:stethoscope","vaadin:stock","vaadin:stop-cog","vaadin:stop","vaadin:stopwatch","vaadin:storage","vaadin:strikethrough","vaadin:subscript","vaadin:suitcase","vaadin:sun-down","vaadin:sun-o","vaadin:sun-rise","vaadin:superscript","vaadin:sword","vaadin:tab-a","vaadin:tab","vaadin:table","vaadin:tablet","vaadin:tabs","vaadin:tag","vaadin:tags","vaadin:tasks","vaadin:taxi","vaadin:teeth","vaadin:terminal","vaadin:text-height","vaadin:text-input","vaadin:text-label","vaadin:text-width","vaadin:thin-square","vaadin:thumbs-down-o","vaadin:thumbs-down","vaadin:thumbs-up-o","vaadin:thumbs-up","vaadin:ticket","vaadin:time-backward","vaadin:time-forward","vaadin:timer","vaadin:toolbox","vaadin:tools","vaadin:tooth","vaadin:touch","vaadin:train","vaadin:trash","vaadin:tree-table","vaadin:trendind-down","vaadin:trending-down","vaadin:trending-up","vaadin:trophy","vaadin:truck","vaadin:twin-col-select","vaadin:twitter-square","vaadin:twitter","vaadin:umbrella","vaadin:underline","vaadin:unlink","vaadin:unlock","vaadin:upload-alt","vaadin:upload","vaadin:user-card","vaadin:user-check","vaadin:user-clock","vaadin:user-heart","vaadin:user-star","vaadin:user","vaadin:users","vaadin:vaadin-h","vaadin:vaadin-v","vaadin:viewport","vaadin:vimeo-square","vaadin:vimeo","vaadin:volume-down","vaadin:volume-off","vaadin:volume-up","vaadin:volume","vaadin:wallet","vaadin:warning","vaadin:workplace","vaadin:wrench","vaadin:youtube-square","vaadin:youtube"];var $n=Object.defineProperty,yn=Object.getOwnPropertyDescriptor,fe=(e,t,i,a)=>{for(var s=a>1?void 0:a?yn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&$n(t,i,s),s};let X=class extends L{constructor(){super(...arguments),this.component=void 0,this.field=void 0,this.baseUrl=void 0,this.state={},this.data={},this.appState={},this.appData={},this.colorPickerOpened=!1,this.colorPickerValue=void 0,this.comboData=[],this._comboFilter="",this.rendered=!1,this.renderColorPicker=()=>{const e=this.field?.fieldId,t=this.state&&e in this.state?this.state[e]:this.field?.initialValue;return o`
            <ui5-color-picker value="${t}" @change="${i=>this.colorPickerValue=i.target.value}">Picker</ui5-color-picker>
        `},this.saveColor=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.colorPickerValue,fieldId:this.field.fieldId},bubbles:!0,composed:!0})),this.colorPickerOpened=!1},this.renderColorPickerFooter=()=>o`<vaadin-button @click="${()=>this.colorPickerOpened=!1}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`,this.checked=e=>{const t=e.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))},this.convert=e=>this.field?.dataType=="integer"?parseInt(e):e,this.multiComboBoxValueChanged=e=>{if(this.rendered){const t=this.field?.fieldId,i=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let a;e.detail.value&&(a=e.detail.value.map(s=>s.value),a&&a.length>0&&(this.data[this.id]||(this.data[this.id]={}),this.data[this.id].content||(this.data[this.id].content=[]),this.data[this.id]&&this.data[this.id].content&&e.detail.value.forEach(s=>{this.data[this.id].content?.find(r=>s.value==r.value)||this.data[this.id].content.push(s)}))),this.compareArrays(a,i)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.valueChanged=e=>{this.rendered&&e.detail.value!==void 0&&e.detail.value!=this.state[this.field.fieldId]&&this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.convert(e.detail.value),fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.selectedItems=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.comboData&&this.comboData.length>0)return this.comboData?.filter(t=>e.indexOf(t.value)>=0);if(this.data[this.id]&&this.data[this.id].content&&this.data[this.id].content.length>0)return this.data[this.id].content.filter(t=>e.indexOf(t.value)>=0)}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0);return[]},this.selectedIndex=e=>{if(e)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const t=this.data[this.id].content.find(i=>i.value==e);if(t)return this.data[this.id].content.indexOf(t)}}else{const t=this.field?.options?.find(i=>i.value==e);if(t)return this.field?.options?.indexOf(t)}},this.selectedIndexes=e=>{if(e&&e.length>0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content)return this.data[this.id].content.filter(i=>e.indexOf(i.value)>=0).map(i=>this.data[this.id].content.indexOf(i))}else return this.field?.options?.filter(t=>e.indexOf(t.value)>=0).map(t=>this.field?.options?.indexOf(t));return[]},this.compareArrays=(e,t)=>this.falsy(e)&&this.falsy(t)||e&&t&&e.length===t.length&&e.every((i,a)=>i===t[a]),this.falsy=e=>!e||e.length==0,this.listItemsSelected=e=>{const t=this.field?.fieldId,i=this.state&&t in this.state?this.state[t]:this.field?.initialValue;let a;this.rendered&&(e.detail.value&&(this.field?.remoteCoordinates?this.data[this.id]&&this.data[this.id].content&&(a=e.detail.value.map(s=>this.data[this.id].content[s].value)):a=e.detail.value.map(s=>this.field.options[s].value)),this.compareArrays(a,i)||this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a,fieldId:this.field?.fieldId},bubbles:!0,composed:!0})))},this.listItemSelected=e=>{let t;if(e.detail.value||e.detail.value==0)if(this.field?.remoteCoordinates){if(this.data[this.id]&&this.data[this.id].content){const i=this.data[this.id].content[e.detail.value];i&&(t=i.value)}}else{const i=this.field.options[e.detail.value];i&&(t=i.value)}this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.mapPosition=e=>{switch(e){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.helperShownInControl=!1,this.fileUploaded=e=>{const t=this.field?.fieldId??"",i=this.state[t];i.push({id:e.detail.xhr.responseText,name:e.detail.file.name}),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:i,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.fileChanged=e=>{const t=this.field?.fieldId??"",i=(e.detail.value??[]).filter(s=>s.id).map(s=>s.id),a=(this.state[t]??[]).map(s=>s.id);if(!this.compareArrays(a,i)){const s=(e.detail.value??[]).filter(r=>r.id).map(r=>({id:r.id,name:r.name}));this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))}},this.triggerImageUpload=()=>{this.renderRoot?.querySelector('input[type="file"]')?.click()},this.imageUpload=e=>{const t=e.target,i=t.files?.[0];if(!i)return;const a=new FileReader;a.onload=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:a.result,fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},a.readAsDataURL(i),t.value=""},this.imageDelete=()=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:"",fieldId:this.field?.fieldId},bubbles:!0,composed:!0}))},this.iconComboboxRenderer=e=>o`
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
                                    `:d}
                ${e.image?o`
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
                    ${e.description?o`
            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);">
                ${e.description}
            </div>
        `:d}
                </div>

            </vaadin-horizontal-layout>
                            `:e.label}
`,this.filteredIcons=[],this.navLinkOffset=null,this.iconFilterChanged=e=>{this.filteredIcons=pa.filter(t=>!e.detail.value||t.indexOf(e.detail.value)>=0)}}remoteComboDataProvider(e){return(t,i)=>{const{filter:a,page:s,pageSize:r}=t,n=a??"";this._comboFilter=n,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e,parameters:{searchText:a,fieldId:this.field?.fieldId,size:r,page:s,sort:void 0},callback:l=>{if(n===this._comboFilter)if(l?.messages?.forEach(c=>{Jt.show(c.text,{position:c.position?this.mapPosition(c.position):void 0,theme:c.variant,duration:c.duration})}),!l.fragments||l.fragments.length==0)this.comboData=[],i([],0);else{const c=l.fragments[0].data?.[this.id];this.comboData=c?.content,i(c?.content,c?.totalElements)}},callbackonly:!0},bubbles:!0,composed:!0}))}}disconnectedCallback(){super.disconnectedCallback(),this.rendered=!1}renderNavLink(){const e=this.field?.link;if(!e?.href)return d;const t=ye(e.href,this.state,this.data)??e.href,i=ye(e.title,this.state,this.data)||t,a=e.icon||(t.startsWith("http")?"vaadin:external-link":"vaadin:link"),s=this.navLinkOffset??"calc(var(--lumo-font-size-s) * 1.6 + (var(--lumo-size-m) - var(--lumo-icon-size-s)) / 2)";return o`<a
                data-navlink
                href="${t}"
                title="${i}"
                target="${O(e.target||void 0)}"
                style="display: flex; align-items: center; color: var(--lumo-secondary-text-color); align-self: flex-start; margin-top: ${s};"
        ><vaadin-icon icon="${a}" style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"></vaadin-icon></a>`}positionNavLink(){const e=this.renderRoot?.querySelector("a[data-navlink]");e&&setTimeout(()=>{const t=e.parentElement,i=t?.firstElementChild?.firstElementChild;if(!t||!i)return;const s=(i.shadowRoot?.querySelector('[part="input-field"]')??i).getBoundingClientRect();if(s.height===0)return;const r=Math.max(0,s.top+s.height/2-e.offsetHeight/2-t.getBoundingClientRect().top),n=`${Math.round(r)}px`;this.navLinkOffset!==n&&(this.navLinkOffset=n)})}helperText(){return this.helperShownInControl=!0,Ne(this.field?.description??"",this.state,this.data)??""}render(){const e=this.field?.fieldId??"";this.rendered=!0;const t=this.renderNavLink();this.helperShownInControl=!1;const i=this.renderField(),a=this.field?.description&&!this.helperShownInControl?Ne(this.field.description,this.state,this.data):void 0;return o`<div style="display: block;">
            <div style="${t!==d?"display: flex; gap: var(--lumo-space-xs);":""}"><div style="flex: 1; min-width: 0;">${i}</div>${t}</div>
            ${a?o`
                <div style="font-size: var(--lumo-font-size-xs); color: var(--lumo-secondary-text-color); margin-top: var(--lumo-space-xs);">${a}</div>
            `:d}
            ${this.data.errors&&this.data.errors[e]&&this.data.errors[e].length>0?o`
                <div><ul>${this.data.errors[e].map(s=>o`<li>${s}</li>`)}</ul></div>
            `:d}
        </div>`}async firstUpdated(){this.filteredIcons=pa}update(e){e.has("component")&&(this.rendered=!1),super.update(e)}updated(e){super.updated(e),this.positionNavLink()}renderField(){const e=this.field?.fieldId??"",t=this.state&&e in this.state?this.state[e]:this.field?.initialValue,i=this.field?.label+"",a=ye(i,this.state,this.data),s=this.labelAlreadyRendered||!a||a=="null"?d:a;return this.field?.stereotype=="badge"?this.renderBadgeField(e,t,s,a):this.field?.stereotype=="plainText"?this.renderPlainTextField(e,t,s,a):this.field?.readOnly&&this.field.stereotype!="grid"&&this.field.dataType!="status"&&this.field?.dataType!="money"?this.renderReadOnlyField(e,t,s,a):this.field?.dataType=="file"?this.renderFileField(e,t,s,a):this.field?.dataType=="string"?this.renderStringField(e,t,s,a):this.field?.dataType=="number"?this.renderNumberField(e,t,s,a):this.field?.dataType=="integer"?this.renderIntegerField(e,t,s,a):this.field?.dataType=="bool"?this.renderBoolField(e,t,s,a):this.field?.dataType=="dateRange"?this.renderDateRangeField(e,t,s,a):this.field?.dataType=="date"?this.renderDateField(e,t,s,a):this.field?.dataType=="dateTime"?this.renderDateTimeField(e,t,s,a):this.field?.dataType=="time"?this.renderTimeField(e,t,s,a):this.field?.dataType=="array"?this.renderArrayField(e,t,s,a):this.field?.dataType=="money"?this.renderMoneyField(e,t,s,a):this.field?.dataType=="status"?this.renderStatusField(e,t,s,a):this.field?.dataType=="range"?this.renderRangeField(e,t,s,a):o`<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`}renderBadgeField(e,t,i,a){if(!this.field)return o``;const s=t===!0||t==="true";return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    .helperText="${this.helperText()}"
                    data-colspan="${this.field?.colspan}"
                    style="${this.field?.style}"
            ><span theme="badge ${s?"success":""} pill" style="${s?"":"opacity: 0.4;"}">${a}</span>
            </vaadin-custom-field>`}renderPlainTextField(e,t,i,a){if(!this.field)return o``;let s=Ne(t,this.state,this.data);const r=s&&typeof s=="object"&&"value"in s?s:null;s&&s.value&&(s=s.value);const n=this.field?.dataType=="bool"||s===!0||s===!1,l=this.field?.dataType=="money",c=s!=null&&s!=="";let u=c?String(s):"—";if(l&&c){const v=typeof s=="number"?s:parseFloat(String(s));isNaN(v)||(u=r&&r.locale&&r.currency?new Intl.NumberFormat(r.locale,{style:"currency",currency:r.currency}).format(v):new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v))}const p=n?o`<vaadin-icon icon="${s===!0||s==="true"?"vaadin:check":"vaadin:minus"}" style="height: 16px; width: 16px;"></vaadin-icon>`:this.field?.multiline?o`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${u}</span>`:o`<span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${l?" font-variant-numeric: tabular-nums;":""}">${u}</span>`;return o`<vaadin-custom-field
                    id="${this.field.fieldId}"
                    label="${i}"
                    data-colspan="${this.field?.colspan}"
                    style="${l?"text-align: right; ":""}${this.field?.style}"
            >${p}</vaadin-custom-field>`}renderReadOnlyField(e,t,i,a){if(!this.field)return o``;let s=Ne(t,this.state,this.data)||this.data[e];if(s&&s.value&&(s=s.value),this.field.stereotype=="image"||this.field.stereotype=="uploadableImage"||this.field.stereotype=="signature"||this.field.stereotype=="camera")return o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><img src="${s}" id="${this.field.fieldId}_img" style="${this.field.style}">
                </vaadin-custom-field>`;if(this.field.dataType=="bool")return o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><vaadin-icon icon="${s?"vaadin:check":"vaadin:minus"}" style="height: 20px;"></vaadin-icon>
                </vaadin-custom-field>`;const r=s!=null?String(s):"";return o`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        value="${s}"
                        readonly
                        style="${this.field.style}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >${r.length>15?o`<vaadin-icon
                        slot="suffix"
                        icon="vaadin:copy"
                        title="Copiar"
                        style="cursor: pointer; color: var(--lumo-secondary-text-color);"
                        @click="${()=>navigator.clipboard.writeText(r).catch(()=>{})}"
                ></vaadin-icon>`:d}</vaadin-text-field>
`}renderFileField(e,t,i,a){if(!this.field)return o``;const s=t?.map(r=>({id:r.id,name:r.name,type:"",uploadTarget:"",complete:!0}))??[];return o`
                <vaadin-custom-field
                        label="${i}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    <vaadin-upload
                            target="/upload"
                            .files="${s}"
                            @upload-success="${this.fileUploaded}"
                            @files-changed="${this.fileChanged}"
                    ></vaadin-upload>
                </vaadin-custom-field>
            `}renderStringField(e,t,i,a){if(!this.field)return o``;if(this.field?.stereotype=="searchable"){const s=n=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"code-"+this.field?.fieldId,parameters:{code:n.currentTarget.value}},bubbles:!0,composed:!0}))},r=n=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"codesearch-"+this.field?.fieldId,parameters:{}},bubbles:!0,composed:!0}))};return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            required="${this.field.required||d}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-horizontal-layout theme="spacing" style="--lumo-space-m: 0.33rem;">
                            <vaadin-text-field style="width: 4rem;" @change="${s}" value="${t}"></vaadin-text-field>
                            <vaadin-text-field readonly="" value="${this.data[this.field.fieldId+"-label"]}"></vaadin-text-field>
                            <vaadin-button theme="icon" @click="${r}"><vaadin-icon icon="lumo:search"></vaadin-icon></vaadin-button>
                        </vaadin-horizontal-layout>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="select"){if(this.field?.remoteCoordinates){const r=this.field.remoteCoordinates,n="";this.data[this.id]&&(this.data[this.id].searchSignature||n)&&this.data[this.id].searchSignature!=n&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:r.action,parameters:{searchText:n,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}));let l=t;return t&&t.value&&(l=t.value),o`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${i}"
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
                    `}let s=t;return t&&t.value&&(s=t.value),o`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${i}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            .value="${s}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-select>
                `}if(this.field?.stereotype=="markdown")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            required="${this.field.required||d}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><vaadin-markdown
                            .content="${t}"
                    ></vaadin-markdown>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates;let r;this.data[this.id]&&this.data[this.id].content&&(r=this.data[this.id].content.find(l=>l.value==t)),!r&&this.comboData&&(r=this.comboData.find(l=>l.value==t)),!r&&t&&(r={value:t,label:this.data[this.id+"-label"]??t});const n=this.remoteComboDataProvider(s.action);return o`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${i}"
                            item-label-path="label"
                            item-id-path="value"
                            .dataProvider="${n}"
                            .selectedItem="${r}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                            style="${this.field.style}"
                            @keyup="${l=>{if(l.key=="Backspace"){const c=l.currentTarget;c.inputElement.value||(c.value="")}}}"
                            ${Si(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}return o`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${i}"
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
                            ${Si(this.comboRenderer,[])}
                    ></vaadin-combo-box>
                    `}if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                        <vaadin-custom-field
                                label="${i}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${O(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.data[this.id]?.content?.map(n=>o`
                            <vaadin-item>${n.description||n.image||n.icon?o`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${n.icon?o`
                                        <vaadin-icon icon="${n.icon}"></vaadin-icon>
                                    `:d}
                                    ${n.image?o`
                                            <img src="${n.image}" alt="${n.label}" style="width: 2rem;" />
                                        `:d}
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
                            label="${i}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${O(this.selectedIndex(t))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(s=>o`
                            <vaadin-item>${s.description||s.image||s.icon?o`
                                <vaadin-horizontal-layout style="align-items: center;" theme="spacing">
                                    ${s.icon?o`
                                        <vaadin-icon icon="${s.icon}"></vaadin-icon>
                                    `:d}
                                    ${s.image?o`
                                            <img src="${s.image}" alt="${s.label}" style="width: 2rem;" />
                                        `:d}
                                    <vaadin-vertical-layout>
                                        <span> ${s.label} </span>
                                        <span
                                                style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);"
                                        >
              ${s.description}
            </span>
                                    </vaadin-vertical-layout>
                                </vaadin-horizontal-layout>
                            `:s.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="radio"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${i}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            theme="horizontal"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.data[this.id]?.content?.map(n=>o`
                            <vaadin-radio-button value="${n.value}" label="${n.label}" ?checked="${n&&t&&n.value===t}">
                                ${n.description||n.image||n.icon?o`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${n.icon?o`
                                                <vaadin-icon icon="${n.icon}"></vaadin-icon>
                                            `:d}
                                            ${n.image?o`
                                                <img src="${n.image}" alt="${n.label}" style="height: 1rem;" />
                                            `:d}
                                            <span>${n.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${n.description?o`
                                            <div>${n.description}</div>
                                        `:d}
                                    </label>
                                `:d}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `}return o`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${i}"
                            @value-changed="${this.valueChanged}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(s=>o`
                            <vaadin-radio-button value="${s.value}" label="${s.label}">
                                ${s.description||s.image||s.icon?o`
                                    <label slot="label">
                                        <vaadin-horizontal-layout theme="spacing">
                                            ${s.icon?o`
                                                <vaadin-icon icon="${s.icon}"></vaadin-icon>
                                            `:d}
                                            ${s.image?o`
                                                <img src="${s.image}" alt="${s.label}" style="height: 1rem;" />
                                            `:d}
                                            <span>${s.label}</span>
                                        </vaadin-horizontal-layout>
                                        ${s.description?o`
                                            <div>${s.description}</div>
                                        `:d}
                                    </label>
                                `:d}
                            </vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `}if(this.field.stereotype=="popover")return o`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
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
                            ${Ca(()=>o`
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
                            label="${i}"
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
                    `;if(this.field?.stereotype=="richText")return o`
                    <vaadin-custom-field
                            label="${i}"
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
                            label="${i}"
                            .maxlength="${this.field.charLimit}"
                            .value="${t}"
                            .helperText="${this.helperText()}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                            rows="4"
                            style="width: 100%;"
                    ></vaadin-text-area>`;if(this.field?.stereotype=="email")return o`
                    <vaadin-email-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-email-field>
                `;if(this.field?.stereotype=="link")return this.field.readOnly?o`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><a href="${t}">${t}</a></vaadin-custom-field>`:o`
                            <vaadin-text-field
                                    id="${this.field.fieldId}"
                                    label="${i}"
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
                `;if(this.field?.stereotype=="icon")return this.field.readOnly?o`<vaadin-icon
                                             icon="${t}"
                                             data-colspan="${this.field.colspan}"
                    ></vaadin-icon>`:o`
                    <vaadin-combo-box
                                    id="${this.field.fieldId}"
                                    label="${i}"
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
                            ${Si(this.iconComboboxRenderer,[])}
                    >
                        ${t?o`<vaadin-icon slot="prefix" icon="${t}"></vaadin-icon>`:d}
                    </vaadin-combo-box>
                `;if(this.field?.stereotype=="password")return o`
                    <vaadin-password-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            @value-changed="${this.valueChanged}"
                            value="${t}"
                            .helperText="${this.helperText()}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required||d}"
                            data-colspan="${this.field.colspan}"
                    ></vaadin-password-field>
                `;if(this.field?.stereotype=="html")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${de(""+t)}</div></vaadin-custom-field>
                `;if(this.field?.stereotype=="image")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><img
                            src="${t}"
                            style="${this.component?.style}" class="${this.component?.cssClasses}"></vaadin-custom-field>
                `;if(this.field?.stereotype=="treeSelect")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-tree-select
                                .fieldId="${this.field.fieldId}"
                                .value="${t}"
                                .options="${this.field.options??[]}"
                                .leavesOnly="${this.field.treeLeavesOnly??!1}"
                        ></mateu-tree-select>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="signature")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-signature-pad .fieldId="${this.field.fieldId}" .value="${t}"></mateu-signature-pad>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="camera")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <mateu-camera-capture .fieldId="${this.field.fieldId}" .value="${t}"></mateu-camera-capture>
                    </vaadin-custom-field>
                `;if(this.field?.stereotype=="uploadableImage"){const s=t!=null&&t!=="";return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                        <vaadin-vertical-layout style="align-items: stretch; gap: var(--lumo-space-s); max-width: 320px;">
                            ${s?o`<img
                                    src="${t}"
                                    style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid var(--lumo-contrast-20pct); border-radius: var(--lumo-border-radius-m); ${this.field.style??""}"
                                    class="${this.component?.cssClasses}">`:o`<div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--lumo-contrast-30pct); border-radius: var(--lumo-border-radius-m); color: var(--lumo-secondary-text-color);">
                                    <vaadin-icon icon="vaadin:picture" style="height: 2rem; width: 2rem;"></vaadin-icon>
                                </div>`}
                            <input type="file" accept="image/*" style="display: none;" @change="${this.imageUpload}">
                            <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-start;">
                                <vaadin-button @click="${this.triggerImageUpload}">
                                    <vaadin-icon icon="vaadin:upload" slot="prefix"></vaadin-icon>
                                    ${s?"Replace":"Upload"}
                                </vaadin-button>
                                ${s?o`<vaadin-button theme="error tertiary" @click="${this.imageDelete}">
                                    <vaadin-icon icon="vaadin:trash" slot="prefix"></vaadin-icon>
                                    Delete
                                </vaadin-button>`:d}
                            </vaadin-horizontal-layout>
                        </vaadin-vertical-layout>
                    </vaadin-custom-field>
                `}return this.field?.stereotype=="color"?this.field.readOnly?o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><span style="background-color: ${t}; display: block; height: 20px; width: 40px; margin-top: 5px; margin-bottom: 24px; border: 1px solid var(--lumo-secondary-text-color)"></vaadin-custom-field>
                `:o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            .helperText="${this.helperText()}"
                    >
                        <input type="color" @input="${s=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:s.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"/>
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
  ${pi(this.renderColorPicker,[])}
  ${Ni(this.renderColorPickerFooter,[])}
></vaadin-dialog>
                `:o`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        ?disabled="${this.field.disabled}"
                        data-colspan="${this.field.colspan}"
                        style="${this.field.style}"
                ></vaadin-text-field>
`}renderNumberField(e,t,i,a){return this.field?o`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${i}"
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
            ></vaadin-number-field>`:o``}renderIntegerField(e,t,i,a){if(!this.field)return o``;if(this.field.stereotype=="stars"){let s=t;isNaN(s)&&(s=0);const r=[1,2,3,4,5];return o`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >${r.map(n=>o`
                    <vaadin-icon 
                            icon="vaadin:star" 
                            style="cursor: pointer; color: var(${n<=s?"--lumo-warning-color":"--lumo-shade-30pct"});"
                            @click="${()=>this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:n,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}"
                    
                    ></vaadin-icon>
                `)}</vaadin-custom-field>`}if(this.field.stereotype=="slider"){let s=t;return isNaN(s)&&(s=0),o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    ><input type="range" @input="${r=>{this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:r.target.value,fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}" min="${this.field.sliderMin??0}" max="${this.field.sliderMax??10}" value="${s??0}"/></vaadin-custom-field>
                `}return o`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${i}"
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
            `}renderBoolField(e,t,i,a){return this.field?o`
                <vaadin-custom-field
                        label="${i}"
                        .helperText="${this.helperText()}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                >
                    ${this.field.stereotype=="toggle"?o`
                        <paper-toggle-button id="${this.field.fieldId}"
                                             ?disabled=${this.field.disabled}
                                             ?checked=${t}
                                             @change=${this.checked}>
                        </paper-toggle-button>
                    `:o`
                        <vaadin-checkbox
                                id="${this.field.fieldId}"
                                @change="${this.checked}"
                                value="${t}"
                                ?checked=${t}
                                ?autofocus="${this.field.wantsFocus}"
                        ></vaadin-checkbox>
                    `}
                </vaadin-custom-field>
            `:o``}renderDateRangeField(e,t,i,a){if(!this.field)return o``;const s=t?t.from+";"+t.to:void 0;return o`<vcf-date-range-picker
                    id="${this.field.fieldId}"
                    label="${i}"
                    @value-changed="${r=>{r.detail.value&&(r.detail.value={from:r.detail.value.split(";")[0],to:r.detail.value.split(";")[1]}),this.valueChanged(r)}}"
                    value="${s}"
                    .helperText="${this.helperText()}"
                    ?autofocus="${this.field.wantsFocus}"
                    ?required="${this.field.required||d}"
                    data-colspan="${this.field.colspan}"
            ></vcf-date-range-picker>`}renderDateField(e,t,i,a){return this.field?o`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${i}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-picker>`:o``}renderDateTimeField(e,t,i,a){return this.field?o`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${i}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-date-time-picker>`:o``}renderTimeField(e,t,i,a){return this.field?o`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${i}"
                        @value-changed="${this.valueChanged}"
                        value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></vaadin-time-picker>`:o``}renderArrayField(e,t,i,a){if(!this.field)return o``;if(this.field?.stereotype=="choice")return o`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${i}"
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
                    `;if(this.field?.stereotype=="grid")return o`
                    <vaadin-custom-field
                            label="${i}"
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
`;if(this.field?.stereotype=="listBox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0})),o`
                        <vaadin-custom-field
                                label="${i}"
                                .helperText="${this.helperText()}"
                                data-colspan="${this.field.colspan}"
                        >
                    <vaadin-list-box multiple
                                     .selectedValues="${O(this.selectedIndexes(t))}"
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
                            label="${i}"
                            .helperText="${this.helperText()}"
                            data-colspan="${this.field.colspan}"
                    >
                    <vaadin-list-box multiple
                                     .selectedValues="${O(this.selectedIndexes(t))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                                     data-colspan="${this.field.colspan}"
                    >
                        ${this.field.options?.map(s=>o`
                            <vaadin-item>${s.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `}if(this.field?.stereotype=="combobox"){if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r=this.remoteComboDataProvider(s.action);return o`
                        <vaadin-multi-select-combo-box
                            label="${i}"
                            item-label-path="label"
                            item-id-path="value"
                            item-value-path="value"
                            .dataProvider="${r}"
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
                    `}return o`
                    <vaadin-multi-select-combo-box
                            label="${i}"
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
                    `}if(this.field?.remoteCoordinates){const s=this.field.remoteCoordinates,r="";return this.data[this.id]&&(this.data[this.id].searchSignature||r)&&this.data[this.id].searchSignature!=r&&(this.data[this.id]=void 0),this.data[this.id]&&this.data[this.id].content&&this.data[this.id].totalElements||this.rendered||setTimeout(()=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:s.action,parameters:{searchText:r,fieldId:this.field?.fieldId,size:200,page:0,sort:void 0}},bubbles:!0,composed:!0}))}),o`
                    <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${i}"
                        theme="vertical"
                        @value-changed="${this.valueChanged}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
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
                        label="${i}"
                        @value-changed="${this.valueChanged}"
                        theme="vertical"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
                        class="mateu-checkbox-group-${this.field.optionsColumns>1?"multi-column":""}"
                        .value="${t}"
                >
                        ${this.field.options?.map(s=>o`
                        <vaadin-checkbox 
                                value="${s.value}" 
                                label="${s.label}"
                        ></vaadin-checkbox>
                        `)}
                </vaadin-checkbox-group>
            `}renderMoneyField(e,t,i,a){if(!this.field)return o``;if(this.field.readOnly){const s=t;let r=s;return s&&s.locale&&s.currency?r=new Intl.NumberFormat(s.locale,{style:"currency",currency:s.currency}).format(s.value):r=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(s),o`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><div style="width: 186px; text-align: right;">${r}</div></vaadin-custom-field>`}return o`<mateu-money-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        @value-changed="${this.valueChanged}"
                        .value="${t}"
                        .helperText="${this.helperText()}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required||d}"
                        data-colspan="${this.field.colspan}"
            ></mateu-money-field>`}renderStatusField(e,t,i,a){if(!this.field)return o``;const s=t;return o`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        required="${this.field.required||d}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                >
                    ${s?o`<span theme="badge pill ${vi(s.type)}">${s.message}</span>`:o``}                    
                </vaadin-custom-field>
            `}renderRangeField(e,t,i,a){if(!this.field)return o``;const s=t;return o`
                <vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${i}"
                        .helperText="${this.helperText()}"
                        data-colspan="${this.field.colspan}"
                ><ui5-range-slider start-value="${s?.from??0}" end-value="${s?.to??0}" 
                                   min="${this.field.sliderMin??0}" 
                                   max="${this.field.sliderMax??10}"
                                   step="${this.field.step||d}"
                                   @change="${r=>{const n=r.target;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:{from:n.startValue,to:n.endValue},fieldId:this.field.fieldId},bubbles:!0,composed:!0}))}}"
                                   style="min-width: 10rem;"
                ></ui5-range-slider></vaadin-custom-field>
            `}};X.styles=T`
        ${ot}

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
        vaadin-date-picker::part(label),
        vaadin-time-picker::part(label),
        vaadin-number-field::part(label),
        vaadin-email-field::part(label),
        vaadin-password-field::part(label),
        vaadin-custom-field::part(label) {
            font-size: var(--mateu-label-font-size, var(--lumo-font-size-s));
            padding-bottom: var(--mateu-label-padding-bottom, 7px);
            line-height: var(--mateu-label-line-height, 1);
        }
  `;fe([m()],X.prototype,"component",2);fe([m()],X.prototype,"field",2);fe([m()],X.prototype,"baseUrl",2);fe([m()],X.prototype,"state",2);fe([m()],X.prototype,"data",2);fe([m()],X.prototype,"appState",2);fe([m()],X.prototype,"appData",2);fe([m()],X.prototype,"labelAlreadyRendered",2);fe([g()],X.prototype,"colorPickerOpened",2);fe([g()],X.prototype,"colorPickerValue",2);fe([g()],X.prototype,"filteredIcons",2);fe([g()],X.prototype,"navLinkOffset",2);X=fe([_("mateu-field")],X);var xn=Object.defineProperty,wn=Object.getOwnPropertyDescriptor,kt=(e,t,i,a)=>{for(var s=a>1?void 0:a?wn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&xn(t,i,s),s};const Cn=e=>{const t=[];return e.color&&e.color!=="normal"&&e.color!=="none"&&t.push(e.color),e.buttonStyle&&t.push(e.buttonStyle==="tertiaryInline"?"tertiary-inline":e.buttonStyle),e.size&&e.size!=="none"&&e.size!=="normal"&&t.push(e.size),t.length?t.join(" "):void 0},ma=e=>e==="back"||e==="backToList"||!!e&&e.startsWith("cancel");let Ke=class extends L{constructor(){super(...arguments),this.appState={},this.appData={},this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.evalLabel=e=>ye(e,this.state,this.data),this.renderBtn=e=>{if((this.data??{})[e.actionId+".hidden"])return d;const t=this.evalLabel(e.label),i=H.get()?.renderToolbarButton?.(e,t,()=>this.handleButtonClick(e.actionId));return i||o`
        <vaadin-button
                data-action-id="${e.id}"
                theme="${Cn(e)||d}"
                @click="${()=>this.handleButtonClick(e.actionId)}"
                ?disabled="${e.disabled}"
        >${e.iconOnLeft?o`<vaadin-icon icon="${e.iconOnLeft}"></vaadin-icon>`:d}${t}${e.iconOnRight?o`<vaadin-icon icon="${e.iconOnRight}"></vaadin-icon>`:d}</vaadin-button>
    `}}render(){const e=this.metadata;if(!e)return o``;const t=e.toolbar??[],i=t.filter(l=>ma(l.actionId)),a=t.filter(l=>!ma(l.actionId)),s=i.length>0&&a.length>0?o`<span class="toolbar-divider"></span>`:d,r=e.avatar||e.title||e.subtitle||e.kpis?.length>0||e.header?.length>0||t.length>0,n=e.level??0;return n>0?this.setAttribute("data-nested",""):this.removeAttribute("data-nested"),o`
            ${e.breadcrumbs&&e.breadcrumbs.length>0?o`
                <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: center;" class="breadcrumbs-bar">
                    ${e.breadcrumbs.map((l,c)=>o`
                        ${c>0?o`<span>/</span>`:d}
                        ${l.link?o`<vaadin-button theme="tertiary" @click="${()=>window.location.href=`${l.link}`}">${l.text}</vaadin-button>`:o`<span>${l.text}</span>`}
                    `)}
                </vaadin-horizontal-layout>
            `:d}
            ${e.noHeader?o`
                <vaadin-horizontal-layout theme="spacing">
                    ${e?.header?.map(l=>b(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                    ${i.map(this.renderBtn)}
                    ${s}
                    ${a.map(this.renderBtn)}
                </vaadin-horizontal-layout>
            `:r?o`
                <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: center;" class="form-header">
                    ${e.avatar?b(this,e.avatar,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData):d}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${e?.title&&n==0?o`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${de(mt(e?.title,this.state??{},this.data??{}))}</h2>`:d}
                        ${e?.title&&n==1?o`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${de(mt(e?.title,this.state??{},this.data??{}))}</h3>`:d}
                        ${e?.title&&n==2?o`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${de(mt(e?.title,this.state??{},this.data??{}))}</h4>`:d}
                        ${e?.title&&n==3?o`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${de(mt(e?.title,this.state??{},this.data??{}))}</h5>`:d}
                        ${e?.title&&n>3?o`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${de(mt(e?.title,this.state??{},this.data??{}))}</h6>`:d}

                        ${e?.subtitle?o`<span style="display: inline-block; margin-block-end: 0.83em;">${de(mt(e?.subtitle,this.state??{},this.data??{}))}</span>`:d}
                    </div>
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        ${e?.kpis?.map(l=>o`
                            <vaadin-vertical-layout style="align-items: center">
                                <div>${this.evalLabel(l.title)}</div>
                                <div>${de(mt(l.text,this.state??{},this.data??{}))}</div>
                            </vaadin-vertical-layout>
                        `)}
                        ${e?.header?.map(l=>b(this,l,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
                        ${i.map(this.renderBtn)}
                        ${s}
                        ${a.map(this.renderBtn)}
                    </vaadin-horizontal-layout>
                </vaadin-horizontal-layout>
            `:d}
            ${e.badges&&e.badges.length>0?o`
                <vaadin-horizontal-layout style="padding-bottom: var(--lumo-space-s);">
                    ${e.badges.map(l=>hr(l,this.state??{},this.data??{}))}
                </vaadin-horizontal-layout>
            `:d}
        `}};Ke.styles=T`
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

        .toolbar-divider {
            display: inline-block;
            width: 1px;
            height: 1.5rem;
            background-color: var(--lumo-contrast-20pct);
            align-self: center;
            margin: 0 4px;
        }

        ${ot}
    `;kt([m()],Ke.prototype,"metadata",2);kt([m()],Ke.prototype,"baseUrl",2);kt([m()],Ke.prototype,"state",2);kt([m()],Ke.prototype,"data",2);kt([m()],Ke.prototype,"appState",2);kt([m()],Ke.prototype,"appData",2);Ke=kt([_("mateu-content-header")],Ke);var kn=Object.defineProperty,Sn=Object.getOwnPropertyDescriptor,ei=(e,t,i,a)=>{for(var s=a>1?void 0:a?Sn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&kn(t,i,s),s};let gt=class extends Xt{constructor(){super(...arguments),this.state={},this.data={},this.appState={},this.appData={}}render(){const e=this.component?.metadata;return o`
            <vaadin-vertical-layout theme="spacing" class="${this.component?.cssClasses}">
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
                    <vaadin-horizontal-layout theme="spacing" class="form-buttons">
                        <slot name="buttons"></slot>
                    </vaadin-horizontal-layout>
                </div>
            </vaadin-vertical-layout>
       `}};gt.styles=T`
        :host {
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
    `;ei([m()],gt.prototype,"state",2);ei([m()],gt.prototype,"data",2);ei([m()],gt.prototype,"appState",2);ei([m()],gt.prototype,"appData",2);gt=ei([_("mateu-form")],gt);var En=Object.defineProperty,In=Object.getOwnPropertyDescriptor,Le=(e,t,i,a)=>{for(var s=a>1?void 0:a?In(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&En(t,i,s),s};let he=class extends L{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.detailsOpenedItems=[],this.pagesRequested=[],this.emptyArray=e=>!e||e.length==0,this.dataProvider=(e,t)=>{const i=this.data[this.id]?.page;if(this.metadata?.infiniteScrolling&&e.page>0){let a=!1;i&&i.content&&(i.content.length>=(e.page+1)*e.pageSize||i.content.length==i.totalElements)&&(t(i.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),i.totalElements),a=!0,this.grid&&this.grid.recalculateColumnWidths()),a||this.pagesRequested.find(s=>s==e.page)||(this.pagesRequested.push(e.page),this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:e,callback:()=>{this.data[this.id]?.page?.content&&(t(this.data[this.id].page.content.slice(e.page*e.pageSize,(e.page+1)*e.pageSize),this.data[this.id].page.totalElements),this.grid&&this.grid.recalculateColumnWidths())}},bubbles:!0,composed:!0})))}else{const a=this.metadata?.infiniteScrolling?i?.totalElements:i?.content?.length??0;t(i?.content??[],a),this.grid&&this.grid.recalculateColumnWidths()}},this._onActionRequested=e=>{const t=e.detail,i=this.identifierFieldName;if(!i||!t.parameters||t.actionId?.startsWith("action-on-row-"))return;const a=t.parameters[i];a!==void 0&&(this.state._selectedId=String(a),this._applyCellPartNameGenerator(),this.grid?.requestContentUpdate())},this.tooltipGenerator=e=>{let t="";const{column:i,item:a}=e,s=this.metadata?.columns?.find(r=>r.metadata.id==i?.path);if(s?.metadata){const r=(s?.metadata).tooltipPath;r&&i&&a&&(t=a[r])}return t}}get identifierFieldName(){const e=this.metadata?.columns?.find(i=>i.metadata?.identifier);if(e)return e.metadata?.id;if(this.metadata?.columns?.find(i=>i.metadata?.id==="id"))return"id"}_applyCellPartNameGenerator(){if(!this.grid)return;const e=this.identifierFieldName,t=this.state?._selectedId??this.appState?._splitDetailId;e&&t!==void 0?this.grid.cellPartNameGenerator=(i,a)=>String(a.item[e])===String(t)?"selected-row":"":this.grid.cellPartNameGenerator=null}connectedCallback(){super.connectedCallback(),this.addEventListener("action-requested",this._onActionRequested)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("action-requested",this._onActionRequested)}updated(e){super.updated(e),this._applyCellPartNameGenerator(),this.grid?.clearCache(),this.grid?.recalculateColumnWidths(),this.pagesRequested=[]}render(){const e=this.data[this.id]?.page;let t="";this.metadata?.wrapCellContent&&(t+=" wrap-cell-content"),this.metadata?.compact&&(t+=" compact"),this.metadata?.noBorder&&(t+=" no-border"),this.metadata?.noRowBorder&&(t+=" no-row-borders"),this.metadata?.columnBorders&&(t+=" column-borders"),this.metadata?.rowStripes&&(t+=" row-stripes");const i=this.state[this.id+"_selected_items"]||[];return o`
            <vaadin-grid
                    .items="${e?.content}"
                    item-id-path="_rowNumber"
                    .selectedItems="${i}"
                    ?data-clickable-rows="${this.metadata?.detailPath&&!this.metadata?.useButtonForDetail}"
                    ?all-rows-visible="${this.metadata?.allRowsVisible}"
                    column-rendering="${this.metadata?.lazyColumnRendering?"lazy":d}"
                    ?column-reordering-allowed="${this.metadata?.columnReorderingAllowed}"
                    .dataProvider="${this.dataProvider}"
                    page-size="${this.metadata?.pageSize}"
                    multi-sort-on-shift-click
                    @selected-items-changed="${a=>{this.emptyArray(this.state[this.id+"_selected_items"])&&this.emptyArray(a.detail.value)||(this.state[this.id+"_selected_items"]=a.detail.value,this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0})))}}"
                    @active-item-changed="${O(this.metadata?.detailPath&&!this.metadata?.useButtonForDetail?a=>{if(this.metadata?.detailPath){const s=a.detail.value;s?this.detailsOpenedItems=[s]:this.detailsOpenedItems=[]}}:void 0)}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${O(this.metadata?.detailPath?ka(a=>o`${b(this,a[this.metadata?.detailPath],this.baseUrl,this.state,this.data,this.appState,this.appData)}`):void 0)}
                    theme="${t}"
                    style="${this.metadata?.gridStyle}"
            >
                ${this.metadata?.rowsSelectionEnabled?o`
                    <vaadin-grid-selection-column></vaadin-grid-selection-column>
                `:d}
                ${this.metadata?.columns?.map(a=>Ui(a,this,this.baseUrl,this.state,this.data,this.appState,this.appData))}
                ${this.metadata?.useButtonForDetail?o`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${Ve((a,{detailsOpened:s})=>o`
              <vaadin-button
                theme="tertiary icon"
                title="${s?"Collapse":"Expand"}"
                aria-label="Toggle details"
                aria-expanded="${s?"true":"false"}"
                @click="${()=>{this.detailsOpenedItems=s?this.detailsOpenedItems.filter(r=>r!==a):[...this.detailsOpenedItems,a]}}"
              >
                <vaadin-icon
                  .icon="${s?"lumo:angle-down":"lumo:angle-right"}"
                ></vaadin-icon>
              </vaadin-button>
            `,[])}
                    ></vaadin-grid-column>
                `:d}
                <span slot="empty-state">${vt(this.emptyStateMessage??this.metadata?.emptyStateMessage)}</span>
                ${this.metadata?.columns?.find(a=>a.metadata.tooltipPath)?o`<vaadin-tooltip slot="tooltip" .generator="${this.tooltipGenerator}"></vaadin-tooltip>`:d}
            </vaadin-grid>
            <slot></slot>
       `}};he.styles=T`
        ${ot}
        vaadin-grid[data-clickable-rows]::part(row) {
            cursor: pointer;
        }
        vaadin-grid[data-clickable-rows]::part(row):hover {
            background-color: var(--lumo-primary-color-10pct);
        }
        vaadin-grid::part(selected-row) {
            background-color: var(--lumo-primary-color-10pct);
        }
  `;Le([m()],he.prototype,"id",2);Le([m()],he.prototype,"metadata",2);Le([m()],he.prototype,"baseUrl",2);Le([m()],he.prototype,"state",2);Le([m()],he.prototype,"data",2);Le([m()],he.prototype,"appState",2);Le([m()],he.prototype,"appData",2);Le([m()],he.prototype,"emptyStateMessage",2);Le([g()],he.prototype,"detailsOpenedItems",2);Le([Me("vaadin-grid")],he.prototype,"grid",2);he=Le([_("mateu-table")],he);var _n=Object.defineProperty,Tn=Object.getOwnPropertyDescriptor,De=(e,t,i,a)=>{for(var s=a>1?void 0:a?Tn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&_n(t,i,s),s};let pe=class extends L{constructor(){super(...arguments),this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.searchOnly=!1,this.panelOpened=!1,this.draftText="",this.openPanel=()=>{this.panelOpened||this.filters.length===0||(this.panelOpened=!0,this.outsideClick=e=>{e.composedPath().includes(this)||this.closePanel()},document.addEventListener("mousedown",this.outsideClick))},this.closePanel=()=>{this.detachOutsideClick(),this.panelOpened=!1,this.activeFilter=void 0},this.clearAllFilters=()=>{const e=this.filters.flatMap(i=>this.isRangeFilter(i)?[`${i.fieldId}_from`,`${i.fieldId}_to`]:[i.fieldId]),t={searchText:void 0};e.forEach(i=>{t[i]=void 0}),this.state={...this.state,...t},this.dispatchEvent(new CustomEvent("filter-reset-requested",{detail:{fieldIds:e},bubbles:!0,composed:!0})),this.requestSearch()},this.keepFocus=e=>e.preventDefault()}disconnectedCallback(){super.disconnectedCallback(),this.detachOutsideClick()}get filters(){return this.metadata?.filters??[]}detachOutsideClick(){this.outsideClick&&(document.removeEventListener("mousedown",this.outsideClick),this.outsideClick=void 0)}requestSearch(){this.closePanel(),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))}emitValueChanged(e,t){this.state={...this.state,[e]:t},this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t,fieldId:e},bubbles:!0,composed:!0}))}applyFilter(e,t){this.emitValueChanged(e,t),this.requestSearch()}removeChip(e){const t=this.filters.find(i=>i.fieldId===e);t&&this.isRangeFilter(t)?(this.emitValueChanged(`${e}_from`,void 0),this.emitValueChanged(`${e}_to`,void 0)):this.emitValueChanged(e,e==="searchText"?"":void 0),this.requestSearch()}commitText(e){this.emitValueChanged("searchText",e.value),this.draftText="",e.value="",this.requestSearch()}isBooleanFilter(e){return e.dataType==="boolean"||e.dataType==="bool"||e.stereotype==="checkbox"||e.stereotype==="toggle"}isNumericFilter(e){return["integer","decimal","number","money"].includes(e.dataType??"")}isRangeFilter(e){return e.stereotype==="dateRange"||e.stereotype==="numberRange"}isMultiFilter(e){return e.stereotype==="multiSelect"}hasOptions(e){return(e.options?.length??0)>0}multiValues(e){const t=this.state[e.fieldId];return Array.isArray(t)?t.map(String):typeof t=="string"&&t!==""?t.split(",").map(i=>i.trim()).filter(i=>i):[]}rangeBound(e,t){const i=this.state[`${e.fieldId}_${t}`];return i==null?"":String(i)}isSet(e){if(this.isRangeFilter(e))return this.rangeBound(e,"from")!==""||this.rangeBound(e,"to")!=="";if(this.isMultiFilter(e))return this.multiValues(e).length>0;const t=this.state[e.fieldId];return t!=null&&t!==""&&!Number.isNaN(t)}getFilterDisplayValue(e,t){if(e.options?.length){const i=e.options.find(a=>a.value===String(t));if(i)return i.label??i.value}return typeof t=="boolean"?t?"Yes":"No":String(t)}conditionDisplay(e){if(this.isRangeFilter(e)){const t=this.rangeBound(e,"from"),i=this.rangeBound(e,"to");return t&&i?`${t} – ${i}`:t?`≥ ${t}`:`≤ ${i}`}return this.isMultiFilter(e)?this.multiValues(e).map(t=>this.getFilterDisplayValue(e,t)).join(", "):this.getFilterDisplayValue(e,this.state[e.fieldId])}labelOf(e){return ye(e.label,this.state,this.data)||e.fieldId}panelRow(e,t,i="panel-row"){return o`
            <div class="${i}" @mousedown="${this.keepFocus}" @click="${t}">${e}</div>`}renderRangeWidget(e){const t=e.stereotype==="numberRange"?"number":e.dataType==="dateTime"?"datetime-local":e.dataType==="time"?"time":"date",i=s=>{const r=s.closest(".panel-input-row"),n=r.querySelector("input.range-from").value,l=r.querySelector("input.range-to").value;this.emitValueChanged(`${e.fieldId}_from`,n===""?void 0:n),this.emitValueChanged(`${e.fieldId}_to`,l===""?void 0:l),this.requestSearch()},a=s=>{s.key==="Enter"&&i(s.target),s.key==="Escape"&&this.closePanel()};return o`
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
                        @click="${s=>i(s.target)}">Apply</button>
            </div>`}renderMultiWidget(e){const t=this.multiValues(e),i=a=>{const s=t.includes(a)?t.filter(r=>r!==a):[...t,a];this.emitValueChanged(e.fieldId,s.length>0?s:void 0),this.dispatchEvent(new CustomEvent("search-requested",{detail:{},bubbles:!0,composed:!0}))};return o`${(e.options??[]).map(a=>this.panelRow(o`
            <span class="multi-check ${t.includes(a.value)?"multi-check--on":""}"
                  aria-hidden="true">${t.includes(a.value)?"✓":""}</span>
            ${a.label??a.value}
        `,()=>i(a.value)))}`}renderActiveFilterWidget(e){if(this.isRangeFilter(e))return this.renderRangeWidget(e);if(this.isMultiFilter(e))return this.renderMultiWidget(e);if(this.hasOptions(e))return o`${e.options.map(a=>this.panelRow(a.label??a.value,()=>this.applyFilter(e.fieldId,a.value)))}`;if(this.isBooleanFilter(e))return o`
                ${this.panelRow("Yes",()=>this.applyFilter(e.fieldId,!0))}
                ${this.panelRow("No",()=>this.applyFilter(e.fieldId,!1))}`;const t=this.isNumericFilter(e),i=a=>{a.value!==""&&this.applyFilter(e.fieldId,t?Number(a.value):a.value)};return o`
            <div class="panel-input-row">
                <input type="${t?"number":"text"}"
                       placeholder="${e.placeholder||this.labelOf(e)}"
                       @mousedown="${a=>a.stopPropagation()}"
                       @keydown="${a=>{a.key==="Enter"&&i(a.target),a.key==="Escape"&&this.closePanel()}}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${a=>i(a.target.previousElementSibling)}">Apply</button>
            </div>`}renderPanel(){if(!this.panelOpened||this.filters.length===0)return d;if(this.activeFilter){const t=this.activeFilter;return o`
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
                    ${this.isSet(t)?o`<span class="current-value">${this.conditionDisplay(t)}</span>`:d}
                `,()=>{this.activeFilter=t}))}
                ${e?this.panelRow("Clear filters",this.clearAllFilters,"panel-row panel-footer"):d}
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
                                    @click="${i=>{i.stopPropagation(),this.removeChip(t.fieldId)}}">✕</button>
                        </span>`)}
                    ${this.metadata?.searchable!==!1?o`
                        <input class="free-text" type="text" id="searchText"
                               placeholder="${e.length===0?"Search":""}"
                               autofocus="${this.metadata?.autoFocusOnSearchText?!0:d}"
                               .value="${this.draftText??""}"
                               @input="${t=>{this.draftText=t.target.value,this.openPanel()}}"
                               @keydown="${t=>{t.key==="Enter"&&this.commitText(t.target),t.key==="Escape"&&this.closePanel()}}"/>
                    `:d}
                </div>
                ${this.renderPanel()}
            </div>
            <slot></slot>
        `}};pe.styles=T`
        ${ot}
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
    `;De([m()],pe.prototype,"metadata",2);De([m()],pe.prototype,"baseUrl",2);De([g()],pe.prototype,"state",2);De([g()],pe.prototype,"data",2);De([m()],pe.prototype,"appState",2);De([m()],pe.prototype,"appData",2);De([m({type:Boolean})],pe.prototype,"searchOnly",2);De([g()],pe.prototype,"panelOpened",2);De([g()],pe.prototype,"activeFilter",2);De([g()],pe.prototype,"draftText",2);pe=De([_("mateu-filter-bar")],pe);var Rn=Object.defineProperty,Pn=Object.getOwnPropertyDescriptor,ti=(e,t,i,a)=>{for(var s=a>1?void 0:a?Pn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Rn(t,i,s),s};let $t=class extends L{constructor(){super(...arguments),this.totalElements=0,this.pageSize=100,this.pageNumber=0,this.totalPages=0}updated(e){super.updated(e),(e.has("totalElements")||e.has("pageSize"))&&(this.totalPages=Math.ceil(this.totalElements/this.pageSize))}dispatch(e){this.dispatchEvent(new CustomEvent("page-changed",{bubbles:!0,composed:!0,detail:{page:e}}))}render(){if(!this.totalElements)return d;const e=this.totalPages>1,t=this.pageNumber,i=t===0,a=t>=this.totalPages-1;return o`
            <vaadin-horizontal-layout theme="spacing" style="align-items: center; flex-wrap: wrap;">
                ${e?o`
                    <vaadin-button theme="tertiary icon" title="First page" ?disabled="${i}"
                        @click="${()=>this.dispatch(0)}" data-testid="page-first">
                        <vaadin-icon icon="vaadin:angle-double-left"></vaadin-icon>
                    </vaadin-button>
                    <vaadin-button theme="tertiary icon" title="Previous page" ?disabled="${i}"
                        @click="${()=>this.dispatch(t-1)}" data-testid="page-prev">
                        <vaadin-icon icon="vaadin:angle-left"></vaadin-icon>
                    </vaadin-button>
                    <span class="page-indicator">Page ${t+1} of ${this.totalPages}</span>
                    <vaadin-button theme="tertiary icon" title="Next page" ?disabled="${a}"
                        @click="${()=>this.dispatch(t+1)}" data-testid="page-next">
                        <vaadin-icon icon="vaadin:angle-right"></vaadin-icon>
                    </vaadin-button>
                    <vaadin-button theme="tertiary icon" title="Last page" ?disabled="${a}"
                        @click="${()=>this.dispatch(this.totalPages-1)}" data-testid="page-last">
                        <vaadin-icon icon="vaadin:angle-double-right"></vaadin-icon>
                    </vaadin-button>
                    <span class="separator"></span>
                `:d}
                <span class="total-count">${this.totalElements} item${this.totalElements===1?"":"s"}</span>
                <slot></slot>
            </vaadin-horizontal-layout>
        `}};$t.styles=T`
        :host {
            display: block;
            width: 100%;
        }
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
    `;ti([m()],$t.prototype,"totalElements",2);ti([m()],$t.prototype,"pageSize",2);ti([m()],$t.prototype,"pageNumber",2);ti([g()],$t.prototype,"totalPages",2);$t=ti([_("mateu-pagination")],$t);var On=Object.defineProperty,Ln=Object.getOwnPropertyDescriptor,ke=(e,t,i,a)=>{for(var s=a>1?void 0:a?Ln(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&On(t,i,s),s};let te=class extends L{constructor(){super(...arguments),this.id="",this.baseUrl="",this.state={},this.data={},this.appState={},this.appData={},this.dataProvider=(e,t)=>{const i=this.data[this.id]?.page;t(i?.content??[],i?.content?.length??0)},this.respondToVisibility=(e,t)=>{var i={root:document.documentElement},a=new IntersectionObserver(s=>{s.forEach(r=>{t(r.intersectionRatio>0)})},i);a.observe(e)},this.keepAsking=!1,this.askToUpper=()=>{const e=this.data[this.id]?.page,t=e?.content?.length/e?.pageSize;this.dispatchEvent(new CustomEvent("fetch-more-elements",{detail:{params:{page:t,pageSize:this.metadata?.pageSize},callback:()=>{this.keepAsking&&this.askToUpper()}},bubbles:!0,composed:!0}))},this.renderItem=e=>e.card?Wi(this,e.card,this.baseUrl,this.state,this.data,this.appState,this.appData,!1):e.title?o`<vaadin-card
        >
                ${e.title?o`
                    <div slot="title">${e.title}</div>
                `:d}
                ${e.subtitle?o`
                    <div slot="subtitle">${e.subtitle}</div>
                `:d}
                ${e.content?o`
                    <div>${e.content}</div>
                `:d}
                ${e.status?o`
                    <span slot="header-suffix" theme="badge ${vi(e.status.type)}">${e.status.message}</span>
                `:d}
                ${e.image?o`
                    <img slot="media" src="${e.image}" alt="" />
                `:d}
                
        </vaadin-card>`:o`${e}`,this.hasMore=!1,this.clickedOnCard=e=>{this.state[this.id+"_selected_items"]=[e],this.metadata?.onRowSelectionChangedActionId&&this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:this.metadata?.onRowSelectionChangedActionId},bubbles:!0,composed:!0}))}}updated(e){super.updated(e);const t=this.data[this.id]?.page;this.hasMore=t?.content?.length<t?.totalElements}firstUpdated(e){super.firstUpdated(e),this.respondToVisibility(this.askForMore,t=>{this.keepAsking=t,t&&this.askToUpper()})}render(){const e=this.data[this.id]?.page;return o`
            <div class="card-container">
                ${e?.content?.map(t=>o`<div @click="${()=>this.clickedOnCard(t)}" class="car-container">${this.renderItem(t)}</div>`)}
                <div id="ask-for-more" style="display: ${this.hasMore?"flex":"none"}; width: 100%; justify-content: center; padding: var(--lumo-space-m); color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Loading more…</div>
            </div>

            <slot></slot>
       `}};te.styles=T`
        ${ot}
        
        .card-container {
            display: flex; 
            width: 100%; 
            flex-wrap: wrap; 
            gap: 10px;
        }

        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }

    `;ke([m()],te.prototype,"id",2);ke([m()],te.prototype,"metadata",2);ke([m()],te.prototype,"baseUrl",2);ke([m()],te.prototype,"state",2);ke([m()],te.prototype,"data",2);ke([m()],te.prototype,"appState",2);ke([m()],te.prototype,"appData",2);ke([m()],te.prototype,"emptyStateMessage",2);ke([g()],te.prototype,"keepAsking",2);ke([Me("#ask-for-more")],te.prototype,"askForMore",2);ke([g()],te.prototype,"hasMore",2);te=ke([_("mateu-card-list")],te);var ja=(e=>(e.none="none",e.success="success",e.error="error",e.warning="warning",e.contrast="contrast",e.normal="normal",e))(ja||{}),Wa=(e=>(e.primary="primary",e.secondary="secondary",e.tertiary="tertiary",e.tertiaryInline="tertiaryInline",e))(Wa||{}),Dn=Object.defineProperty,zn=Object.getOwnPropertyDescriptor,ze=(e,t,i,a)=>{for(var s=a>1?void 0:a?zn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Dn(t,i,s),s};const An={asc:"ascending",desc:"descending"};let me=class extends L{constructor(){super(...arguments),this.component=void 0,this.standalone=!1,this.state={},this.data={},this.appState={},this.appData={},this.showImportDialog=!1,this.availableWidthPx=1024,this.selectedItem=null,this.search=()=>{const e=this.component.metadata;this.state={...this.state,size:e.pageSize,page:0,crud_selected_items:[]},this._syncStateToUrl(e),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}}},bubbles:!0,composed:!0}))},this.notify=e=>{Jt.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.handleSearchRequested=e=>{this.state={...this.state,crud_selected_items:[]};const t=this.component.metadata;this._syncStateToUrl(t),!t.infiniteScrolling&&this.data?.[this.id]?.page&&(this.data[this.id].page.content=[]),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"search",parameters:{crudId:this.id,_searchState:{...this.state}},callback:e},bubbles:!0,composed:!0}))},this.fetchMoreElements=e=>{const{params:t,callback:i}=e.detail;this.state={...this.state,size:t.pageSize,page:t.page},this.handleSearchRequested(i)},this.directionChanged=e=>{const t=e.detail.grid._sorters;this.state={...this.state,sort:t.map(i=>({fieldId:i.__data.path,direction:i.__data.direction?An[i.__data.direction]:void 0}))},this.handleSearchRequested(void 0)},this._initializedForComponentId=void 0,this.evalLabel=e=>ye(e,this.state,this.data),this.handleToolbarButtonClick=e=>{if(e==="import"){this.showImportDialog=!0;return}this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.handleImportUploadSuccess=e=>{const t=e.detail.xhr.responseText;this.showImportDialog=!1,this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"process-import",parameters:{fileId:t}},bubbles:!0,composed:!0}))}}get cols(){return this.component?.metadata?.columns?.map(t=>t.metadata)??[]}get identifierFieldName(){const e=this.cols.find(t=>t.identifier);return e?e.id:this.cols.find(t=>t.id==="id")?.id}get effectiveGridLayout(){const e=this.component?.metadata,t=e?.gridLayout??"auto";return t==="auto"?e?.crudlType==="card"?"cards":Aa(this.cols,this.availableWidthPx):t}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect.width;t&&Math.abs(t-this.availableWidthPx)>10&&(this.availableWidthPx=t)}),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}_filterIds(e){return new Set(["searchText",...(e.filters??[]).flatMap(t=>t.stereotype==="dateRange"||t.stereotype==="numberRange"?[`${t.fieldId}_from`,`${t.fieldId}_to`]:[t.fieldId])])}_syncStateToUrl(e){const t=this._filterIds(e),i=new URLSearchParams(window.location.search);t.forEach(l=>i.delete(l)),i.delete("page"),i.delete("sort"),t.forEach(l=>{const c=this.state[l];c!=null&&c!==""&&i.set(l,String(c))});const a=this.state.page;a&&a>0&&i.set("page",String(a));const s=this.state.sort;if(s&&s.length>0){const l=s.filter(c=>c.fieldId&&c.direction).map(c=>`${c.fieldId}:${c.direction}`).join(",");l&&i.set("sort",l)}const r=i.toString(),n=r?`${window.location.pathname}?${r}`:window.location.pathname;window.location.pathname+window.location.search!==n&&history.replaceState(null,"",n)}_initStateFromUrl(e,t){const i=new URLSearchParams(window.location.search),a=this._filterIds(e),s={...t};i.forEach((l,c)=>{a.has(c)&&(s[c]=l)});const r=i.get("page");if(r!==null){const l=parseInt(r,10);!isNaN(l)&&l>0&&(s.page=l)}const n=i.get("sort");if(n){const l=n.split(",").map(c=>{const[u,p]=c.split(":");return u&&p?{fieldId:u,direction:p}:null}).filter(Boolean);l.length>0&&(s.sort=l)}return s}pageChanged(e){this.state={...this.state,page:e.detail.page},this.handleSearchRequested(void 0)}updated(e){if(super.updated(e),e.has("component")){const t=this.component?.id;if(t!==this._initializedForComponentId){this._initializedForComponentId=t;const i=this.component?.metadata,a=i.initialPage&&i.initialPage>0?i.initialPage:0;this.state=this._initStateFromUrl(i,{...this.state,size:i.pageSize,page:a,sort:[]}),(this.state.page!==a||this.state.sort?.length>0||[...this._filterIds(i)].some(r=>this.state[r]!=null))&&this.handleSearchRequested(void 0)}}}render(){const e=w=>{const z=[];return w.color&&w.color!==ja.normal&&z.push(w.color),w.buttonStyle&&z.push(w.buttonStyle===Wa.tertiaryInline?"tertiary-inline":w.buttonStyle),z.length?z.join(" "):void 0},t=w=>w==="back"||w==="backToList"||!!w&&w.startsWith("cancel"),i=w=>{const z=H.get()?.renderToolbarButton?.(w,this.evalLabel(w.label),()=>this.handleToolbarButtonClick(w.actionId));return z||o`
                <vaadin-button
                        data-action-id="${w.id}"
                        theme="${e(w)||d}"
                        @click="${()=>this.handleToolbarButtonClick(w.actionId)}"
                >${this.evalLabel(w.label)}</vaadin-button>
            `};if(!this.component)return o`no component`;const a=this.component.metadata;a.serverSideOrdering=!0;const s=a?.toolbar??[],r=s.filter(w=>t(w.actionId)),n=s.filter(w=>!t(w.actionId)),l=r.length>0&&n.length>0,c=!!a?.title||!!a?.subtitle||s.length>0,u=this.effectiveGridLayout,p=this.cols,v=Di(p),f=this.data[this.id]?.page?.content??[],y=this.state[this.component?.id]?.emptyStateMessage,x=(w,z)=>{const S=z[w.id];if(S==null)return o``;if(w.dataType==="status"){const G=vi(S.type);return o`<span theme="badge pill ${G}">${S.message}</span>`}return w.dataType==="bool"?o`${S?"✓":"✗"}`:typeof S=="object"?o`${S.label??S.name??S.message??""}`:o`${S}`},$=()=>{const w=this.identifierFieldName,z=this.state._selectedId??this.appState?._splitDetailId,S=v.find(P=>P.identifier)??v[0],G=P=>P.dataType==="action"||P.dataType==="actionGroup"||P.dataType==="menu"||P.stereotype==="button",ut=v.filter(P=>P!==S&&!G(P)),St=p.filter(P=>G(P)),Qe=(P,Q,be)=>{P.stopPropagation(),P.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:Q,parameters:{_clickedRow:be}},bubbles:!0,composed:!0}))},Et=P=>{const Q=[];for(const be of St){const F=P[be.id];if(be.dataType==="action"){const A=F?.methodNameInCrud?F:P.action?.methodNameInCrud?P.action:{methodNameInCrud:be.id,label:be.label,icon:null};Q.push(o`
                            <vaadin-button theme="tertiary small" title="${A.label||d}"
                                @click="${C=>Qe(C,"action-on-row-"+A.methodNameInCrud,P)}">
                                ${A.icon?o`<vaadin-icon icon="${A.icon}"></vaadin-icon>`:d}
                                ${A.label??d}
                            </vaadin-button>`)}else(be.dataType==="actionGroup"||be.dataType==="menu")&&(F?.actions??[]).forEach(C=>Q.push(o`
                            <vaadin-button theme="tertiary small" title="${C.label||d}"
                                @click="${W=>Qe(W,"action-on-row-"+C.methodNameInCrud,P)}">
                                ${C.icon?o`<vaadin-icon icon="${C.icon}"></vaadin-icon>`:d}
                                ${C.label??d}
                            </vaadin-button>`))}return Q.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); margin-top: var(--lumo-space-xs);">
                        ${Q}
                    </div>`:d};return o`
                <vaadin-list-box style="width: 100%;">
                    ${f.length===0?o`<vaadin-item disabled>${vt(y)}</vaadin-item>`:d}
                    ${f.map(P=>o`
                        <vaadin-item
                            ?selected="${w&&z!==void 0&&String(P[w])===String(z)}"
                            @click="${()=>{w&&P[w]!==void 0&&(this.state={...this.state,_selectedId:String(P[w])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"view",parameters:P},bubbles:!0,composed:!0}))}}"
                            style="cursor: pointer;"
                        >
                            <div style="font-weight: 600;">${S?P[S.id]??"":""}</div>
                            <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                ${ut.map(Q=>o`<span>${Q.label}: ${x(Q,P)}</span>`)}
                            </div>
                            ${Et(P)}
                        </vaadin-item>
                    `)}
                </vaadin-list-box>`},k=(w,z,S)=>{const G=this.identifierFieldName;G&&S[G]!==void 0&&(this.state={...this.state,_selectedId:String(S[G])}),w.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:z,parameters:S},bubbles:!0,composed:!0}))},E=()=>{const w=this.identifierFieldName,z=this.state._selectedId??this.appState?._splitDetailId,S=p.slice(0,6),G=S.filter(C=>C.stereotype==="image"),ut=S.find(C=>C.identifier)??S[0],St=C=>!!C.actionId,Qe=C=>C.dataType==="action"||C.dataType==="actionGroup"||C.dataType==="menu"||C.stereotype==="button",Et=S.find(C=>C.id==="select"&&C.dataType==="action"),P=!!Et,Q=S.filter(C=>C!==ut&&!G.includes(C)&&!St(C)&&!Qe(C)),be=S.filter(C=>Qe(C)&&!(P&&C===Et)),F=(C,W,Ze)=>{C.stopPropagation(),C.currentTarget.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:W,parameters:{_clickedRow:Ze}},bubbles:!0,composed:!0}))},A=C=>{const W=[];for(const Ze of be){const ki=C[Ze.id];if(Ze.dataType==="action"){const It=ki?.methodNameInCrud?ki:C.action?.methodNameInCrud?C.action:{methodNameInCrud:Ze.id,label:Ze.label,icon:null};W.push(o`
                            <vaadin-button theme="tertiary" title="${It.label||d}"
                                @click="${ht=>F(ht,"action-on-row-"+It.methodNameInCrud,C)}">
                                ${It.icon?o`<vaadin-icon icon="${It.icon}"></vaadin-icon>`:d}
                                ${It.label??d}
                            </vaadin-button>`)}else(Ze.dataType==="actionGroup"||Ze.dataType==="menu")&&(ki?.actions??[]).forEach(ht=>W.push(o`
                            <vaadin-button theme="tertiary" title="${ht.label||d}"
                                @click="${Xa=>F(Xa,"action-on-row-"+ht.methodNameInCrud,C)}">
                                ${ht.icon?o`<vaadin-icon icon="${ht.icon}"></vaadin-icon>`:d}
                                ${ht.label??d}
                            </vaadin-button>`))}return W.length?o`
                    <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); padding-top: var(--lumo-space-s); border-top: 1px solid var(--lumo-contrast-10pct);">
                        ${W}
                    </div>`:d};return o`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--lumo-space-m); padding: var(--lumo-space-s) 0;">
                    ${f.length===0?o`<div style="grid-column: 1 / -1;">${vt(y)}</div>`:d}
                    ${f.map(C=>o`
                        <vaadin-card
                            clickable
                            ?data-selected="${w&&z!==void 0&&String(C[w])===String(z)}"
                            style="cursor: pointer;"
                            @click="${W=>P?F(W,"action-on-row-select",C):k(W.target,"view",C)}"
                        >
                            ${G.length?o`<img slot="media" src="${C[G[0].id]??""}" alt="" style="width: 100%; max-height: 160px; object-fit: cover;" />`:d}
                            ${ut?o`<div slot="title">${C[ut.id]??""}</div>`:d}
                            <div style="display: flex; flex-direction: column; gap: var(--lumo-space-xs); padding: var(--lumo-space-s) 0;">
                                ${Q.map(W=>o`
                                    <div style="display: flex; gap: var(--lumo-space-s); font-size: var(--lumo-font-size-s);">
                                        <span style="color: var(--lumo-secondary-text-color); min-width: 80px;">${W.label}</span>
                                        <span>${x(W,C)}</span>
                                    </div>
                                `)}
                            </div>
                            ${A(C)}
                        </vaadin-card>
                    `)}
                </div>`},R=()=>{const w=v.find(S=>S.identifier)??v[0],z=v.filter(S=>S!==w);return o`
                <div style="display: flex; height: 100%; min-height: 400px; gap: 0;">
                    <div style="width: 260px; flex-shrink: 0; border-right: 1px solid var(--lumo-contrast-20pct); overflow-y: auto;">
                        <vaadin-list-box style="width: 100%;">
                            ${f.length===0?o`<vaadin-item disabled>${vt(y)}</vaadin-item>`:d}
                            ${f.map(S=>o`
                                <vaadin-item
                                    ?selected="${this.selectedItem===S}"
                                    @click="${()=>{this.selectedItem=S}}"
                                    style="cursor: pointer;"
                                >
                                    <div style="font-weight: 600;">${w?S[w.id]??"":""}</div>
                                    <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color); display: flex; flex-wrap: wrap; gap: var(--lumo-space-xs); align-items: center;">
                                        ${z.map(G=>o`${x(G,S)} `)}
                                    </div>
                                </vaadin-item>
                            `)}
                        </vaadin-list-box>
                    </div>
                    <div style="flex: 1; padding: var(--lumo-space-m); overflow-y: auto;">
                        ${this.selectedItem?o`
                            <vaadin-form-layout>
                                ${p.map(S=>o`
                                    <vaadin-text-field
                                        label="${S.label}"
                                        .value="${String(this.selectedItem[S.id]??"")}"
                                        readonly
                                    ></vaadin-text-field>
                                `)}
                            </vaadin-form-layout>
                        `:o`
                            <p style="color: var(--lumo-secondary-text-color);">Select a row to view details.</p>
                        `}
                    </div>
                </div>`},N=()=>{const w=this.identifierFieldName,z=this.state._selectedId??this.appState?._splitDetailId,S=p[0],G=p.slice(1),ut=!!S?.actionId,St=F=>(F??[]).map(A=>{const C=Array.isArray(A.children)?A.children:[];return C.length>0?{...A,children:St(C)}:{...A,children:void 0}}),Qe=St(f),Et=(F,A)=>{const C=F.parentItem?F.parentItem.children??[]:Qe;A(C,C.length)},P=(F,A)=>{for(const C of F??[]){if(w&&String(C[w])===A)return C;const W=P(C.children,A);if(W)return W}},Q=w&&z!==void 0?P(Qe,String(z)):void 0,be=(F,A,C)=>{F.stopPropagation(),w&&A[w]!==void 0&&(this.state={...this.state,_selectedId:String(A[w])}),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:C,parameters:A},bubbles:!0,composed:!0}))};return o`
                <vaadin-grid
                    style="width: 100%;"
                    all-rows-visible
                    .itemHasChildrenPath="${"children"}"
                    .itemIdPath="${w??"id"}"
                    .dataProvider="${Et}"
                    .selectedItems="${Q?[Q]:[]}"
                >
                    ${S?o`<vaadin-grid-tree-column path="${S.id}" header="${S.label??d}" flex-grow="1"></vaadin-grid-tree-column>`:d}
                    ${ut?o`
                    <vaadin-grid-column width="6rem" flex-grow="0" text-align="end" ${Ve(F=>F?.viewable===!1?d:o`
                        <vaadin-button theme="tertiary small" @click="${A=>be(A,F,"view")}">View</vaadin-button>
                    `,[])}></vaadin-grid-column>`:d}
                    ${G.map(F=>F.id==="select"?o`<vaadin-grid-column width="7rem" flex-grow="0" text-align="end" header="${F.label??d}" ${Ve(A=>o`
                            <vaadin-button theme="tertiary small" @click="${C=>{C.stopPropagation(),this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:"action-on-row-select",parameters:{_clickedRow:A}},bubbles:!0,composed:!0}))}}">Select</vaadin-button>
                        `,[])}></vaadin-grid-column>`:o`<vaadin-grid-column path="${F.id}" header="${F.label??d}" auto-width></vaadin-grid-column>`)}
                    <span slot="empty-state">${vt(y)}</span>
                </vaadin-grid>`},M=H.get()?.rendersCrudLayouts?.()===!0,ct=o`
            ${a.infiniteScrolling?o`
                <div>${this.data[this.id]?.page?.totalElements} items found.</div>
            `:d}
            ${!M&&u==="list"?$():!M&&u==="cards"?a.contentHeight?o`
                <vaadin-scroller style="width: 100%; height: ${a.contentHeight};">
                    ${E()}
                </vaadin-scroller>
            `:E():!M&&u==="masterDetail"?R():!M&&u==="tree"?N():H.get()?.renderTableComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}
            <slot></slot>
        `,qt=a.infiniteScrolling?d:H.get()?.renderPagination(this,this.component),si=o`
            <vaadin-dialog
                .opened="${this.showImportDialog}"
                header-title="Import"
                @opened-changed="${w=>{this.showImportDialog=w.detail.value}}"
                ${pi(()=>o`
                    <vaadin-upload
                        target="/upload"
                        max-files="1"
                        @upload-success="${this.handleImportUploadSuccess}"
                    ></vaadin-upload>
                `,[this.showImportDialog])}
                ${Ni(()=>o`
                    <vaadin-button @click="${()=>{this.showImportDialog=!1}}">Cancel</vaadin-button>
                `,[])}
            ></vaadin-dialog>
        `;return this.standalone?o`
                ${si}
                <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); width: 100%; box-sizing: border-box; padding: var(--lumo-space-m); display: flex; flex-direction: column;">
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
                    <div style="flex-shrink: 0;">${H.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}</div>
                    <div style="flex: 1; overflow-y: auto; min-height: 0;">${ct}</div>
                    <div style="flex-shrink: 0;">${qt}</div>
                </div>
            `:o`
            ${si}
            ${c?o`
                    <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: flex-end; padding-bottom: var(--lumo-space-m);">
                        <div style="flex: 1; min-width: 0;">
                            ${a?.title?o`
                                <h2 style="margin: 0; font-size: var(--lumo-font-size-xxl); font-weight: 700; color: var(--lumo-header-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.evalLabel(a.title)}</h2>
                            `:d}
                            ${a?.subtitle?o`
                                <span style="display: block; color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); margin-top: var(--lumo-space-xs);">${this.evalLabel(a.subtitle)}</span>
                            `:d}
                        </div>
                        ${r.map(w=>i(w))}
                        ${l?o`<span class="toolbar-divider"></span>`:d}
                        ${n.map(w=>i(w))}
                        <slot></slot>
                    </vaadin-horizontal-layout>
                `:d}
            <div style="border: var(--mateu-section-border, 1px solid var(--lumo-contrast-20pct)); border-radius: var(--lumo-border-radius-l); overflow: hidden; max-height: calc(100dvh - 12rem); padding: var(--lumo-space-m); display: flex; flex-direction: column;">
                <div style="flex-shrink: 0;">${H.get()?.renderFilterBar(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}</div>
                <div style="flex: 1; overflow-y: auto; min-height: 0;">${ct}</div>
                <div style="flex-shrink: 0;">${qt}</div>
            </div>
        `}createRenderRoot(){return H.mustUseShadowRoot()?super.createRenderRoot():this}};me.styles=T`
        ${ot}
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
    `;ze([m()],me.prototype,"component",2);ze([m()],me.prototype,"baseUrl",2);ze([m({type:Boolean})],me.prototype,"standalone",2);ze([m()],me.prototype,"state",2);ze([m()],me.prototype,"data",2);ze([m()],me.prototype,"appState",2);ze([m()],me.prototype,"appData",2);ze([g()],me.prototype,"showImportDialog",2);ze([g()],me.prototype,"availableWidthPx",2);ze([g()],me.prototype,"selectedItem",2);me=ze([_("mateu-table-crud")],me);var Fn=Object.defineProperty,Nn=Object.getOwnPropertyDescriptor,yi=(e,t,i,a)=>{for(var s=a>1?void 0:a?Nn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Fn(t,i,s),s};let Lt=class extends L{constructor(){super(...arguments),this.notificationOpened=!1,this.fetchStarted=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!0},this.fetchFinished=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1},this.fetchFailed=e=>{e.preventDefault(),e.stopPropagation(),this.loading=!1,this.error=e.detail.reason,this.openNotification()},this.openNotification=()=>{this.notificationOpened=!0},this.closeNotification=()=>{this.notificationOpened=!1},this.notificationRenderer=()=>o`
    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
      <div>${this.error?.message??String(this.error)}</div>
      <vaadin-button theme="tertiary-inline" @click="${this.closeNotification}" aria-label="Close">
        <vaadin-icon icon="lumo:cross"></vaadin-icon>
      </vaadin-button>
    </vaadin-horizontal-layout>
  `}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-called-event",this.fetchStarted),this.addEventListener("backend-succeeded-event",this.fetchFinished),this.addEventListener("backend-cancelled-event",this.fetchFailed),this.addEventListener("backend-failed-event",this.fetchFailed)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-succeeded-event",this.fetchStarted),this.removeEventListener("backend-succeeded-event",this.fetchFinished),this.removeEventListener("backend-cancelled-event",this.fetchFailed),this.removeEventListener("backend-failed-event",this.fetchFailed)}render(){return o`<div class="loader-container"><vaadin-vertical-layout>
                <slot></slot>
            <!--<vaadin-progress-bar indeterminate style="visibility: ${this.loading?"visible":"hidden"}; margin: 0;max-width: 2rem;"></vaadin-progress-bar>-->
            <div class="loader-frame ${this.loading?"delayed-show":""}" style="${this.loading?"pointer-events: all;":"display: none;"}"><div class="loader"></div></div>
        </vaadin-vertical-layout></div>
        <vaadin-notification
                theme="error"
                duration="3000"
                position="bottom-end"
                .opened="${this.notificationOpened}"
                @opened-changed="${e=>{this.notificationOpened=e.detail.value}}"
                ${wa(this.notificationRenderer,[])}
        ></vaadin-notification>`}};Lt.styles=T`
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
  `;yi([g()],Lt.prototype,"loading",2);yi([g()],Lt.prototype,"notificationOpened",2);yi([g()],Lt.prototype,"error",2);Lt=yi([_("mateu-api-caller")],Lt);var qn=Object.defineProperty,Mn=Object.getOwnPropertyDescriptor,Be=(e,t,i,a)=>{for(var s=a>1?void 0:a?Mn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&qn(t,i,s),s};let we=class extends L{constructor(){super(...arguments),this.message="This website uses cookies.",this.dismiss="Ok. Thanks :).",this.learnMore="Learn more",this.learnMoreLink="https://cookiesandyou.com/",this.showLearnMore=!0,this.position="top",this.cookieName="mateu-cookieconsent"}updated(e){super.updated(e)}connectedCallback(){super.connectedCallback(),this._css=document.createElement("style"),this._css.innerText=".cc-window{opacity:1;transition:opacity 1s ease}.cc-window.cc-invisible{opacity:0}.cc-animate.cc-revoke{transition:transform 1s ease}.cc-animate.cc-revoke.cc-top{transform:translateY(-2em)}.cc-animate.cc-revoke.cc-bottom{transform:translateY(2em)}.cc-animate.cc-revoke.cc-active.cc-bottom,.cc-animate.cc-revoke.cc-active.cc-top,.cc-revoke:hover{transform:translateY(0)}.cc-grower{max-height:0;overflow:hidden;transition:max-height 1s}.cc-link,.cc-revoke:hover{text-decoration:underline}.cc-revoke,.cc-window{position:fixed;overflow:hidden;box-sizing:border-box;font-family:Helvetica,Calibri,Arial,sans-serif;font-size:16px;line-height:1.5em;display:flex;flex-wrap:nowrap;z-index:9999}.cc-window.cc-static{position:static}.cc-window.cc-floating{padding:2em;max-width:24em;flex-direction:column}.cc-window.cc-banner{padding:1em 1.8em;width:100%;flex-direction:row}.cc-revoke{padding:.5em}.cc-header{font-size:18px;font-weight:700}.cc-btn,.cc-close,.cc-link,.cc-revoke{cursor:pointer}.cc-link{opacity:.8;display:inline-block;padding:.2em}.cc-link:hover{opacity:1}.cc-link:active,.cc-link:visited{color:initial}.cc-btn{display:block;padding:.4em .8em;font-size:.9em;font-weight:700;border-width:2px;border-style:solid;text-align:center;white-space:nowrap}.cc-banner .cc-btn:last-child{min-width:140px}.cc-highlight .cc-btn:first-child{background-color:transparent;border-color:transparent}.cc-highlight .cc-btn:first-child:focus,.cc-highlight .cc-btn:first-child:hover{background-color:transparent;text-decoration:underline}.cc-close{display:block;position:absolute;top:.5em;right:.5em;font-size:1.6em;opacity:.9;line-height:.75}.cc-close:focus,.cc-close:hover{opacity:1}.cc-revoke.cc-top{top:0;left:3em;border-bottom-left-radius:.5em;border-bottom-right-radius:.5em}.cc-revoke.cc-bottom{bottom:0;left:3em;border-top-left-radius:.5em;border-top-right-radius:.5em}.cc-revoke.cc-left{left:3em;right:unset}.cc-revoke.cc-right{right:3em;left:unset}.cc-top{top:1em}.cc-left{left:1em}.cc-right{right:1em}.cc-bottom{bottom:1em}.cc-floating>.cc-link{margin-bottom:1em}.cc-floating .cc-message{display:block;margin-bottom:1em}.cc-window.cc-floating .cc-compliance{flex:1 0 auto}.cc-window.cc-banner{align-items:center}.cc-banner.cc-top{left:0;right:0;top:0}.cc-banner.cc-bottom{left:0;right:0;bottom:0}.cc-banner .cc-message{flex:1}.cc-compliance{display:flex;align-items:center;align-content:space-between}.cc-compliance>.cc-btn{flex:1}.cc-btn+.cc-btn{margin-left:.5em}@media print{.cc-revoke,.cc-window{display:none}}@media screen and (max-width:900px){.cc-btn{white-space:normal}}@media screen and (max-width:414px) and (orientation:portrait),screen and (max-width:736px) and (orientation:landscape){.cc-window.cc-top{top:0}.cc-window.cc-bottom{bottom:0}.cc-window.cc-banner,.cc-window.cc-left,.cc-window.cc-right{left:0;right:0}.cc-window.cc-banner{flex-direction:column}.cc-window.cc-banner .cc-compliance{flex:1}.cc-window.cc-floating{max-width:none}.cc-window .cc-message{margin-bottom:1em}.cc-window.cc-banner{align-items:unset}}.cc-floating.cc-theme-classic{padding:1.2em;border-radius:5px}.cc-floating.cc-type-info.cc-theme-classic .cc-compliance{text-align:center;display:inline;flex:none}.cc-theme-classic .cc-btn{border-radius:5px}.cc-theme-classic .cc-btn:last-child{min-width:140px}.cc-floating.cc-type-info.cc-theme-classic .cc-btn{display:inline-block}.cc-theme-edgeless.cc-window{padding:0}.cc-floating.cc-theme-edgeless .cc-message{margin:2em 2em 1.5em}.cc-banner.cc-theme-edgeless .cc-btn{margin:0;padding:.8em 1.8em;height:100%}.cc-banner.cc-theme-edgeless .cc-message{margin-left:1em}.cc-floating.cc-theme-edgeless .cc-btn+.cc-btn{margin-left:0}",document.head.appendChild(this._css),this.__updatePopup()}disconnectedCallback(){super.disconnectedCallback(),this.__closePopup(),this._css.isConnected&&this._css.remove()}__closePopup(){const e=this.popup;e&&e.parentNode?.removeChild(e)}_show(){const e=this.popup;e&&(e.classList.remove("cc-invisible"),e.style.display="")}__updatePopup(){this.__closePopup(),window.cookieconsent.initialise({palette:{popup:{background:"#000"},button:{background:"rgba(22, 118, 243, 0.95)",hover:"rgba(22, 118, 243, 1)"}},showLink:this.showLearnMore,content:{message:this.message,dismiss:this.dismiss,link:this.learnMore,href:this.learnMoreLink},cookie:{name:this.cookieName},position:this.position,elements:{messagelink:`<span id="cookieconsent:desc" class="cc-message">${this.message} <a tabindex="0" class="cc-link" href="${this.learnMoreLink}" target="_blank" rel="noopener noreferrer nofollow">${this.learnMore}</a></span>`,dismiss:`<a tabindex="0" class="cc-btn cc-dismiss">${this.dismiss}</a>`}});const e=this.popup;if(e){e.setAttribute("role","alert");const t=e.querySelector("a.cc-btn");t?.addEventListener("keydown",i=>{const r=i.keyCode||i.which;(r===32||r===13)&&t.click()})}}render(){return o`
       `}};we.styles=T`
  `;Be([m()],we.prototype,"message",2);Be([m()],we.prototype,"dismiss",2);Be([m()],we.prototype,"learnMore",2);Be([m()],we.prototype,"learnMoreLink",2);Be([m()],we.prototype,"showLearnMore",2);Be([m()],we.prototype,"position",2);Be([m()],we.prototype,"cookieName",2);Be([g()],we.prototype,"_css",2);Be([Me('[aria-label="cookieconsent"]')],we.prototype,"popup",2);we=Be([_("mateu-cookie-consent")],we);var Un=Object.defineProperty,Bn=Object.getOwnPropertyDescriptor,Va=(e,t,i,a)=>{for(var s=a>1?void 0:a?Bn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Un(t,i,s),s};let ci=class extends L{constructor(){super(...arguments),this.redispatchEvent=e=>{e instanceof CustomEvent&&(e.stopPropagation(),e.preventDefault(),this.target?.dispatchEvent(new CustomEvent(e.type,{detail:e.detail,bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),this.addEventListener("value-changed",this.redispatchEvent),this.addEventListener("data-changed",this.redispatchEvent),this.addEventListener("action-requested",this.redispatchEvent),this.addEventListener("server-side-action-requested",this.redispatchEvent),this.addEventListener("route-changed",this.redispatchEvent),this.addEventListener("close-modal-requested",this.redispatchEvent)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("value-changed",this.redispatchEvent),this.removeEventListener("data-changed",this.redispatchEvent),this.removeEventListener("action-requested",this.redispatchEvent),this.removeEventListener("server-side-action-requested",this.redispatchEvent),this.removeEventListener("route-changed",this.redispatchEvent)}render(){return o`<slot></slot>`}};ci.styles=T`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `;Va([m()],ci.prototype,"target",2);ci=Va([_("mateu-event-interceptor")],ci);var jn=Object.defineProperty,Wn=Object.getOwnPropertyDescriptor,Ha=(e,t,i,a)=>{for(var s=a>1?void 0:a?Wn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&jn(t,i,s),s};let ui=class extends lt{constructor(){super(...arguments),this.opened=!0,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),500)}}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}render(){const e=this.component.metadata;let t="";e.noPadding&&(t+=" no-padding");const i=qi(e.headerTitle,this.state,this.data,this.appState,this.appData);return o`
        <vaadin-dialog
                header-title="${i}"
                .opened="${this.opened}"
                slot="${this.component?.slot??d}"
                theme="${t}"
                ?modeless="${e.modeless}"
                ?draggable="${e.draggable}"
                ?resizable="${e.resizable}"
                top="${e.top??d}"
                left="${e.left??d}"
                right="${e.right??d}"
                width="${e.width??d}"
                height="${e.height??d}"
                ${e.header||e.closeButtonOnHeader?ts(()=>o`<mateu-event-interceptor .target="${this}" style="width: 100%;">${e.header?b(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData):d}${e.closeButtonOnHeader?o`
                            <vaadin-button theme="tertiary" @click="${this.close}">
                                <vaadin-icon icon="lumo:cross"></vaadin-icon>
                            </vaadin-button>
                        `:d}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.footer?Ni(()=>o`<mateu-event-interceptor .target="${this}" style="width: 100%;">${b(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                ${e.content?pi(()=>o`<mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${b(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>`,[this.state,this.data]):d}
                style="${this.component?.style}" 
                class="${this.component?.cssClasses}"
        >
        </vaadin-dialog>

       `}};ui.styles=T`
  `;Ha([g()],ui.prototype,"opened",2);ui=Ha([_("mateu-dialog")],ui);var Vn=Object.defineProperty,Hn=Object.getOwnPropertyDescriptor,Ga=(e,t,i,a)=>{for(var s=a>1?void 0:a?Hn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Vn(t,i,s),s};let hi=class extends lt{constructor(){super(...arguments),this.opened=!1,this.close=()=>{this.opened=!1,setTimeout(()=>this.parentElement?.removeChild(this),300)},this._escListener=e=>{if(e.key!=="Escape")return;const i=this.getRootNode().querySelectorAll("mateu-drawer, mateu-dialog");i[i.length-1]===this&&(e.stopPropagation(),this.close())}}firstUpdated(){requestAnimationFrame(()=>this.opened=!0)}applyFragment(e){super.applyFragment(e);const t=e.state?._closeAfterMillis;t&&setTimeout(()=>this.close(),t)}updated(e){if(super.updated(e),e.has("component")&&this.component){const t=this.component.metadata;this.state=t.initialData}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._escListener)}disconnectedCallback(){document.removeEventListener("keydown",this._escListener),super.disconnectedCallback()}render(){const e=this.component.metadata,t=e.position??"end",i=qi(e.headerTitle,this.state,this.data,this.appState,this.appData);return o`
        ${e.modeless?d:o`
            <div class="backdrop ${this.opened?"open":""}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${t} ${this.opened?"open":""} ${this.component?.cssClasses??""}"
                role="dialog"
                aria-modal="${!e.modeless}"
                aria-label="${i??d}"
                style="${e.width?`width: ${e.width};`:""}${this.component?.style??""}"
        >
            <header>
                ${i?o`<h3>${i}</h3>`:o`<span class="spacer"></span>`}
                ${e.header?o`
                    <mateu-event-interceptor .target="${this}">${b(this,e.header,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
                <vaadin-button theme="tertiary" aria-label="Close" @click="${this.close}">
                    <vaadin-icon icon="lumo:cross"></vaadin-icon>
                </vaadin-button>
            </header>
            <div class="content ${e.noPadding?"no-padding":""}">
                ${e.content?o`
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${b(this,e.content,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                `:d}
            </div>
            ${e.footer?o`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${b(this,e.footer,this.baseUrl,this.state,this.data,this.appState,this.appData)}</mateu-event-interceptor>
                </footer>
            `:d}
        </section>
       `}};hi.styles=T`
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
        header {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-s, 0.5rem);
            padding: var(--lumo-space-s, 0.5rem) var(--lumo-space-m, 1rem);
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
        }
        header h3 {
            flex: 1;
            margin: 0;
            font-size: var(--lumo-font-size-l, 1.125rem);
            font-weight: 600;
        }
        header .spacer {
            flex: 1;
        }
        .content {
            flex: 1;
            overflow: auto;
            padding: var(--lumo-space-m, 1rem);
        }
        .content.no-padding {
            padding: 0;
        }
        footer {
            padding: var(--lumo-space-s, 0.5rem) var(--lumo-space-m, 1rem);
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
        }
  `;Ga([g()],hi.prototype,"opened",2);hi=Ga([_("mateu-drawer")],hi);var Gn=Object.defineProperty,Kn=Object.getOwnPropertyDescriptor,se=(e,t,i,a)=>{for(var s=a>1?void 0:a?Kn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Gn(t,i,s),s};function va(e){if(e.parentElement)return e.parentElement;const t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}let J=class extends L{constructor(){super(...arguments),this.appState={},this.appData={},this.standalone=!1,this.actionBanners=[],this.dismissedStaticBannerIndices=new Set,this._tocEntries=[],this._activeToc=0,this._tocVisible=!1,this._tocRebuildScheduled=!1,this._headerH=0,this._onResize=()=>this._layoutStickyTops(),this._tocLocked=!1,this._unlockToc=e=>{if(e&&e.type==="keydown"){const t=e;if(t.ctrlKey&&t.altKey&&!t.shiftKey&&!t.metaKey&&/^(?:Digit|Numpad)[1-9]$/.test(t.code))return}this._tocLocked=!1},this._actionBannerTimers=[],this._staticBannerTimers=[],this._bannersHandler=e=>{const t=e.detail,i=t.banners??[],a=t.append??!1;a?this.actionBanners=[...this.actionBanners,...i]:(this._clearActionBannerTimers(),this.actionBanners=i);const s=a?this.actionBanners.length-i.length:0;i.forEach((r,n)=>{if(r.timeoutSeconds&&r.timeoutSeconds>0){const l=s+n;this._actionBannerTimers.push(setTimeout(()=>{this.actionBanners=this.actionBanners.filter((c,u)=>u!==l)},r.timeoutSeconds*1e3))}})},this._onTocKey=e=>{if(!this._tocVisible||!e.ctrlKey||!e.altKey||e.shiftKey||e.metaKey)return;const t=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!t)return;const i=parseInt(t[1],10)-1;i>=this._tocEntries.length||(e.preventDefault(),this._scrollToSection(i))},this._onScrollSpy=()=>{if(this._tocLocked)return;const e=this._sectionCards();if(!e.length)return;const t=12,i=this.shadowRoot?.querySelector("mateu-content-header");let a=i?i.getBoundingClientRect().bottom:0;for(const n of e){if(!n.classList.contains("mateu-section--sticky"))continue;const l=n.getBoundingClientRect();l.top<=a+t+2&&(a=Math.max(a,l.bottom))}const s=a+t+4;let r=0;this._tocEntries.forEach((n,l)=>{n.el.getBoundingClientRect().top<=s&&(r=l)}),this._activeToc=r}}connectedCallback(){super.connectedCallback(),document.addEventListener("page-banners-received",this._bannersHandler),window.addEventListener("resize",this._onResize),document.addEventListener("keydown",this._onTocKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("page-banners-received",this._bannersHandler),window.removeEventListener("resize",this._onResize),document.removeEventListener("keydown",this._onTocKey),this._clearAllTimers(),this._teardownScrollSpy()}updated(e){super.updated(e),e.has("component")&&e.get("component")!==void 0&&(this._clearAllTimers(),this.actionBanners=[],this.dismissedStaticBannerIndices=new Set),e.has("component")&&(this._scheduleStaticBannerTimeouts(),this.dispatchEvent(new CustomEvent("compact-changed",{detail:{compact:!!this.component?.style?.includes("--mateu-compact:1")},bubbles:!0,composed:!0})),this._scheduleTocRebuild())}_scheduleStaticBannerTimeouts(){this._staticBannerTimers.forEach(i=>clearTimeout(i)),this._staticBannerTimers=[],(this.component?.metadata?.banners??[]).forEach((i,a)=>{i.timeoutSeconds&&i.timeoutSeconds>0&&this._staticBannerTimers.push(setTimeout(()=>{this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,a])},i.timeoutSeconds*1e3))})}_clearActionBannerTimers(){this._actionBannerTimers.forEach(e=>clearTimeout(e)),this._actionBannerTimers=[]}_clearAllTimers(){this._clearActionBannerTimers(),this._staticBannerTimers.forEach(e=>clearTimeout(e)),this._staticBannerTimers=[]}_dismissActionBanner(e){this.actionBanners=this.actionBanners.filter((t,i)=>i!==e)}_dismissStaticBanner(e){this.dismissedStaticBannerIndices=new Set([...this.dismissedStaticBannerIndices,e])}bannerThemeClass(e){const t=e.theme?.toLowerCase()??"info";return t==="none"?"":t}_evalBannerText(e){return ye(e,this.state,this.data)}_renderBanner(e,t){const i=this._evalBannerText(e.title),a=this._evalBannerText(e.description);return o`
            <vaadin-card class="page-banner page-banner--${this.bannerThemeClass(e)}">
                ${i?o`
                    <div slot="title" style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span>${i}</span>
                        ${e.hasCloseButton?o`
                            <vaadin-button theme="icon tertiary small" class="banner-close" @click=${t} title="Dismiss">
                                <vaadin-icon icon="vaadin:close"></vaadin-icon>
                            </vaadin-button>
                        `:d}
                    </div>
                `:e.hasCloseButton?o`
                    <vaadin-button slot="title" theme="icon tertiary small" class="banner-close" style="margin-left: auto;" @click=${t} title="Dismiss">
                        <vaadin-icon icon="vaadin:close"></vaadin-icon>
                    </vaadin-button>
                `:d}
                ${a?o`<p>${a}</p>`:d}
            </vaadin-card>
        `}_onSlotChange(){this._scheduleTocRebuild()}_scheduleTocRebuild(){this._tocRebuildScheduled||(this._tocRebuildScheduled=!0,requestAnimationFrame(()=>{this._tocRebuildScheduled=!1,this._rebuildToc()}))}_sectionCards(){return Array.from(this.querySelectorAll("vaadin-card.mateu-section"))}_sectionTitle(e){const t=e.querySelector('[slot="title"]')?.textContent?.trim();return t||e.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()||void 0}_rebuildToc(){const e=this._sectionCards(),t=e.map(r=>({title:this._sectionTitle(r),el:r})).filter(r=>!!r.title),i=this.component?.metadata?.toc,a=t.length>4&&e.every(r=>!r.closest("vaadin-horizontal-layout")),s=(i===!0?!0:i===!1?!1:a)&&t.length>0;this._tocEntries=t,this._tocVisible=s,this._activeToc>=t.length&&(this._activeToc=0),this._teardownScrollSpy(),s?requestAnimationFrame(()=>{this._layoutStickyTops(),this._setupScrollSpy()}):this._layoutStickyTops()}_layoutStickyTops(){const e=this.shadowRoot?.querySelector("mateu-content-header");this._headerH=this._tocVisible&&e?e.offsetHeight:0,this.style.setProperty("--mateu-header-h",this._headerH+"px");const t=12;let i=this._headerH+t;for(const a of this._sectionCards())a.classList.contains("mateu-section--sticky")&&(a.style.top=i+"px",i+=a.offsetHeight+t)}_scrollContainer(){let e=va(this);for(;e;){const t=getComputedStyle(e).overflowY;if((t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight)return e;e=va(e)}return null}_setupScrollSpy(){this._tocEntries.length&&(this._spyTarget=this._scrollContainer()??window,this._spyTarget.addEventListener("scroll",this._onScrollSpy,{passive:!0}),window.addEventListener("wheel",this._unlockToc,{passive:!0}),window.addEventListener("touchstart",this._unlockToc,{passive:!0}),window.addEventListener("keydown",this._unlockToc),this._onScrollSpy())}_teardownScrollSpy(){this._spyTarget?.removeEventListener("scroll",this._onScrollSpy),window.removeEventListener("wheel",this._unlockToc),window.removeEventListener("touchstart",this._unlockToc),window.removeEventListener("keydown",this._unlockToc),this._spyTarget=void 0}_scrollToSection(e){const t=this._tocEntries[e];if(!t)return;this._activeToc=e,this._tocLocked=!0;const i=12;let a=this._headerH+i;for(const l of this._sectionCards()){if(l===t.el)break;l.classList.contains("mateu-section--sticky")&&(a+=l.offsetHeight+i)}const s=this._scrollContainer(),r=s?s.getBoundingClientRect().top:0,n=t.el.getBoundingClientRect().top-r-a;(s??window).scrollBy({top:n,behavior:"smooth"})}render(){const e=this.component?.metadata,a=[...(e?.banners??[]).map((r,n)=>({banner:r,index:n})).filter(({index:r})=>!this.dismissedStaticBannerIndices.has(r)).map(({banner:r,index:n})=>({banner:r,onDismiss:()=>this._dismissStaticBanner(n)})),...this.actionBanners.map((r,n)=>({banner:r,onDismiss:()=>this._dismissActionBanner(n)}))],s=o`
            <mateu-content-header
                class="${this._tocVisible?"sticky-header":""}"
                .metadata="${e}"
                .baseUrl="${this.baseUrl}"
                .state="${this.state}"
                .data="${this.data}"
                .appState="${this.appState}"
                .appData="${this.appData}"
            ></mateu-content-header>
            ${a.length>0?o`
                <div class="page-banners">
                    ${a.map(({banner:r,onDismiss:n})=>this._renderBanner(r,n))}
                </div>
            `:d}
            <div class="page-body ${this._tocVisible?"with-toc":""}">
                <div class="form-content">
                    <slot @slotchange=${this._onSlotChange}></slot>
                    <vaadin-horizontal-layout theme="spacing" class="form-buttons">
                        <slot name="buttons"></slot>
                    </vaadin-horizontal-layout>
                </div>
                ${this._tocVisible?o`
                    <aside class="page-toc">
                        <nav>
                            ${this._tocEntries.map((r,n)=>o`
                                <a class="page-toc__item ${n===this._activeToc?"is-active":""}"
                                   @click=${()=>this._scrollToSection(n)}
                                   title=${n<9?`${r.title} (Ctrl+Alt+${n+1})`:r.title}>
                                    <span class="page-toc__label">${r.title}</span>
                                    ${n<9?o`<span class="page-toc__key">${n+1}</span>`:d}
                                </a>
                            `)}
                        </nav>
                    </aside>
                `:d}
            </div>
            <div class="form-footer">
                ${e?.footer?.map(r=>b(this,r,this.baseUrl,this.state??{},this.data??{},this.appState,this.appData))}
            </div>
        `;return o`<vaadin-vertical-layout style="width: 100%;">${s}</vaadin-vertical-layout>`}};J.styles=T`
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
            color: #1a1a1a;
        }

        .page-banner p {
            margin: 0;
            color: #1a1a1a;
        }

        .banner-close {
            color: #1a1a1a;
            flex-shrink: 0;
        }

        .page-banner--info {
            --vaadin-card-background: #e8f4fd;
            border-leftx: 4px solid var(--lumo-primary-color);
        }

        .page-banner--success {
            --vaadin-card-background: #eafaf1;
            border-leftx: 4px solid var(--lumo-success-color);
        }

        .page-banner--warning {
            --vaadin-card-background: #fef9e7;
            border-leftx: 4px solid var(--lumo-warning-color, #f59e0b);
        }

        .page-banner--danger {
            --vaadin-card-background: #fdf2f2;
            border-leftx: 4px solid var(--lumo-error-color);
        }
    `;se([m()],J.prototype,"component",2);se([m()],J.prototype,"baseUrl",2);se([m()],J.prototype,"state",2);se([m()],J.prototype,"data",2);se([m()],J.prototype,"appState",2);se([m()],J.prototype,"appData",2);se([m()],J.prototype,"value",2);se([m({type:Boolean})],J.prototype,"standalone",2);se([g()],J.prototype,"actionBanners",2);se([g()],J.prototype,"dismissedStaticBannerIndices",2);se([g()],J.prototype,"_tocEntries",2);se([g()],J.prototype,"_activeToc",2);se([g()],J.prototype,"_tocVisible",2);J=se([_("mateu-page")],J);const xi=T`
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
`,Ft=e=>Y`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,Ki=Ft(Y`
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`),Ji=Ft(Y`
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>`),Yi=Ft(Y`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>`),Jn=Ft(Y`
    <rect x="9" y="2" width="6" height="5" rx="1"></rect>
    <rect x="2" y="17" width="6" height="5" rx="1"></rect>
    <rect x="16" y="17" width="6" height="5" rx="1"></rect>
    <path d="M12 7v4M5 17v-3h14v3M12 11v3"></path>`),Yn=Ft(Y`
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>`),Xn=Ft(Y`
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>`);var Qn=Object.defineProperty,Zn=Object.getOwnPropertyDescriptor,Se=(e,t,i,a)=>{for(var s=a>1?void 0:a?Zn(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Qn(t,i,s),s};const fa=["#e91e63","#1676f3","#10b981","#8b5cf6","#f59e0b","#ef4444"],el=e=>fa[Math.abs(e??0)%fa.length],tl=e=>(e??"?").split(/\s+/).filter(t=>t).map(t=>t[0]).slice(0,2).join("").toUpperCase()||"?";let ie=class extends L{constructor(){super(...arguments),this.menu=[],this.chatSessionId=Z(),this.menuContextSent=!1,this.items=[],this.listening=!1,this.recognitionAvailable=!1,this.loading=!1,this.elapsedSeconds=0,this.startListening=()=>{this.recognition&&(this.listening?(this.recognition.stop(),this.listening=!1):(this.recognition.start(),this.listening=!0))},this.onSpeechResult=e=>{if(this.recognition){const t=e,i=t.results[t.results[0].length-1][0].transcript;this.messageInputElement&&(this.messageInputElement.value=i,this.send(new CustomEvent("submit",{detail:{value:i},bubbles:!0,composed:!0})))}},this.send=async e=>{this.messageInputElement?.setAttribute("disabled","disabled");const t=e.detail.value.trim();if(!t||!this.sseUrl)return;this.addMessage(t,"user");const i=this.addMessage("","agent");this.startLoading();let a="";try{const s={Accept:"text/event-stream","Content-Type":"application/json"},r=localStorage.getItem("__mateu_auth_token");r&&(s.Authorization="Bearer "+r);const n=sessionStorage.getItem("__mateu_sesion_id");n&&(s["X-Session-Id"]=n);const l=JSON.stringify({message:t,sessionId:this.chatSessionId,...!this.menuContextSent&&{menuContext:this.buildMenuContext(this.menu)}});this.menuContextSent=!0;const c=await fetch(this.sseUrl,{method:"POST",headers:s,body:l});if(!c.ok){const f=await c.text();throw new Error(`Servidor respondió ${c.status}: ${f}`)}const u=c.body?.getReader();if(!u)throw new Error("No se pudo obtener el reader del stream.");const p=new TextDecoder;let v="";for(;;){const{done:f,value:y}=await u.read();if(f){if(v.trim().startsWith("data:")){const E=v.trim().slice(5).trim(),R=this.tryParseTokenUsage(E),N=!R&&this.tryParseCustomEvent(E);R?this.tokenUsage={...this.tokenUsage,...R}:N?N.event==="agent-error"?(a="⚠️ "+(N.detail?.message??"Error desconocido del agente"),this.updateMessage(i,a)):this.dispatchEvent(new CustomEvent(N.event,{detail:N.detail,bubbles:!0,composed:!0})):(a+=E,this.updateMessage(i,a))}break}const x=p.decode(y,{stream:!0});v+=x;const $=v.split(`
`);v=$.pop()||"";let k=!1;for(const E of $)if(E.trim().startsWith("data:")){const R=E.trim().slice(5).trim(),N=this.tryParseTokenUsage(R),M=!N&&this.tryParseCustomEvent(R);N?this.tokenUsage={...this.tokenUsage,...N}:M?M.event==="agent-error"?(a="⚠️ "+(M.detail?.message??"Error desconocido del agente"),this.updateMessage(i,a)):this.dispatchEvent(new CustomEvent(M.event,{detail:M.detail,bubbles:!0,composed:!0})):(a+=R+`
`,k=!0)}k&&this.updateMessage(i,a)}a||this.updateMessage(i,"⚠️ El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).")}catch(s){console.error("Error en el flujo SSE:",s);const r=s?.message??String(s);(r==="Failed to fetch"||r==="network error"||r==="Load failed")&&!a?this.updateMessage(i,"⚠️ No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible."):this.updateMessage(i,"⚠️ Error: "+r)}finally{this.stopLoading(),setTimeout(()=>{this.messageInputElement&&(this.messageInputElement.value="")},250),this.messageInputElement?.removeAttribute("disabled"),this.messageInputElement?.focus()}},this.closeChat=()=>{this.dispatchEvent(new CustomEvent("close-requested",{bubbles:!0,composed:!0}))},this.submitFromInput=()=>{const e=this.messageInputElement?.value?.trim()??"";e&&this.send(new CustomEvent("submit",{detail:{value:e},bubbles:!0,composed:!0}))},this.onInputKeydown=e=>{e.key==="Enter"&&(e.preventDefault(),this.submitFromInput())}}connectedCallback(){super.connectedCallback();const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e){const t=new e;this.recognition=t,t.lang="es-ES",t.onend=()=>{setTimeout(()=>{if(this.listening&&this.recognition)try{this.recognition.start()}catch{}},250)},this.recognitionAvailable=!0,t.onresult=this.onSpeechResult,t.onerror=i=>{console.error("Error de reconocimiento: "+i.error),this.listening&&this.recognition&&setTimeout(()=>{this.recognition.start()},250)}}}scrollBottom(){setTimeout(()=>{this.scrollContainer&&this.scrollContainer.scrollTo({top:this.scrollContainer.scrollHeight,behavior:"smooth"})},0)}addMessage(e,t){const i={text:e,time:new Date().toLocaleTimeString(),userName:t.includes("agent")?"Asistente":"Tú",userColorIndex:t.includes("agent")?2:1};return this.items=[...this.items,i],this.scrollBottom(),this.items.length-1}updateMessage(e,t){this.items=this.items.map((i,a)=>a===e?{...i,text:t}:i),this.scrollBottom()}tryParseCustomEvent(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const i=JSON.parse(t);if(typeof i.event=="string")return{event:i.event,detail:i.detail??{}}}catch{}return null}tryParseTokenUsage(e){const t=e.trim();if(!t.startsWith("{"))return null;try{const i=JSON.parse(t);if("inputTokens"in i||"outputTokens"in i||"totalTokens"in i)return i}catch{}return null}buildMenuContext(e,t=[]){const i=[];for(const a of e){if(a.separator||a.remote)continue;const s=[...t,a.label];if(a.submenus&&a.submenus.length>0)i.push(...this.buildMenuContext(a.submenus,s));else{const r={path:s,navigation:{route:a.route,consumedRoute:a.consumedRoute,actionId:a.actionId??"",baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix}};a.description&&(r.description=a.description),i.push(r)}}return i}startLoading(){this.loading=!0,this.elapsedSeconds=0,this._elapsedTimer=setInterval(()=>{this.elapsedSeconds++},1e3)}stopLoading(){this.loading=!1,clearInterval(this._elapsedTimer),this._elapsedTimer=void 0}render(){return o`
            <div class="chat-container">
                <div class="chat-header">
                    <span class="chat-title">AI Assistant</span>
                    <button class="chat-close" @click="${this.closeChat}" title="Cerrar">
                        ${Xn}
                    </button>
                </div>
                <div class="scroll-container">
                    <div class="message-list" role="list">
                        ${this.items.map(e=>o`
                            <div class="message" role="listitem">
                                <div class="avatar" style="background: ${el(e.userColorIndex)};">${tl(e.userName)}</div>
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
                        ${this.tokenUsage.inputTokens!=null?o`<span class="token-chip">in&nbsp;<strong>${this.tokenUsage.inputTokens}</strong></span>`:d}
                        ${this.tokenUsage.outputTokens!=null?o`<span class="token-chip">out&nbsp;<strong>${this.tokenUsage.outputTokens}</strong></span>`:d}
                        ${this.tokenUsage.totalTokens!=null?o`<span class="token-chip">total&nbsp;<strong>${this.tokenUsage.totalTokens}</strong></span>`:d}
                    </div>
                `:d}
                ${this.loading?o`
                    <div class="loading-bar">
                        <span class="spinner"></span>
                        <span class="loading-text">Thinking… ${this.elapsedSeconds}s</span>
                    </div>
                `:d}
                <div class="input-bar">
                    <button class="mic-btn"
                            title="Dictar"
                            style="color: ${this.listening?"red":"var(--lumo-contrast-50pct, #767676)"};"
                            @click="${this.startListening}"
                            ?disabled="${!this.recognitionAvailable}"
                    >${Yn}</button>
                    <input class="msg-input"
                           placeholder="Message"
                           aria-label="Message"
                           @keydown="${this.onInputKeydown}"/>
                    <button class="nbtn primary" ?disabled="${this.loading}" @click="${this.submitFromInput}">Send</button>
                </div>
            </div>
        `}};ie.styles=[xi,T`
        :host {
            display: block;
            height: 100%;
        }

        .chat-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: var(--lumo-base-color, #fff);
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
    `];Se([m()],ie.prototype,"sseUrl",2);Se([m({attribute:!1})],ie.prototype,"menu",2);Se([m()],ie.prototype,"items",2);Se([Me(".scroll-container")],ie.prototype,"scrollContainer",2);Se([Me(".msg-input")],ie.prototype,"messageInputElement",2);Se([g()],ie.prototype,"recognition",2);Se([g()],ie.prototype,"listening",2);Se([g()],ie.prototype,"recognitionAvailable",2);Se([g()],ie.prototype,"loading",2);Se([g()],ie.prototype,"elapsedSeconds",2);Se([g()],ie.prototype,"tokenUsage",2);ie=Se([_("mateu-chat")],ie);var il=Object.defineProperty,al=Object.getOwnPropertyDescriptor,ii=(e,t,i,a)=>{for(var s=a>1?void 0:a?al(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&il(t,i,s),s};let yt=class extends L{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.data&&this.createChart(this.data)}async createChart(e){const[{default:t}]=await Promise.all([ce(()=>import("./vendor-chartjs.js").then(a=>a.a),[]),ce(()=>import("./vendor-chartjs.js").then(a=>a.c),[])]);if(e!==this.data)return;this.chart&&this.chart.destroy();const i={type:this.type,data:this.data,options:this.options};this.chart=new t(this.chartElement,i)}handleSlotChange(){}render(){return o`
            <div class="container">
                <canvas id="chart"></canvas>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};yt.styles=T`
  `;ii([m()],yt.prototype,"type",2);ii([m()],yt.prototype,"data",2);ii([m()],yt.prototype,"options",2);ii([Me("#chart")],yt.prototype,"chartElement",2);yt=ii([_("mateu-chart")],yt);var sl=Object.defineProperty,rl=Object.getOwnPropertyDescriptor,Xi=(e,t,i,a)=>{for(var s=a>1?void 0:a?rl(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&sl(t,i,s),s};let Kt=class extends L{updated(e){super.updated(e),this.chart&&(this.chart.destroy(),this.chart=void 0),this.xml&&this.createViewer(this.xml)}async createViewer(e){const{default:t}=await ce(async()=>{const{default:a}=await import("./vendor-diagrams.js").then(s=>s.i);return{default:a}},__vite__mapDeps([4,3,1,2]));if(e!==this.xml)return;this.chart&&this.chart.destroy();const i={container:this.divElement};this.chart=new t(i),this.chart.importXML(e)}handleSlotChange(){}render(){return o`
            <div class="container" style="width: 20rem; height: 15rem; overflow: auto;">
                <!-- BPMN diagram container -->
                <div id="canvas" style="width: 60rem; height: 30rem; zoom: 0.5;"></div>
            </div>
            <div style="display: none;">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
       `}};Kt.styles=T`
  `;Xi([m()],Kt.prototype,"xml",2);Xi([Me("#canvas")],Kt.prototype,"divElement",2);Kt=Xi([_("mateu-bpmn")],Kt);var ol=Object.defineProperty,nl=Object.getOwnPropertyDescriptor,Nt=(e,t,i,a)=>{for(var s=a>1?void 0:a?nl(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&ol(t,i,s),s};const _i=160,Ae=56,ll=220,ba=110,et=60,dl={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},cl={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},ul=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];function hl(){return"step-"+Math.random().toString(36).slice(2,8)}let rt=class extends L{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.wf={name:"New Workflow",steps:[]},this.positions={},this.selectedId=null,this.showMeta=!1,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value")){try{this.wf=JSON.parse(this.value)}catch{}this.autoLayout()}}autoLayout(){const e=this.wf.steps??[],t={};e.forEach(n=>{t[n.id]=0});let i=!0;for(;i;)i=!1,e.forEach(n=>{if(n.preconditionStepId!=null&&t[n.preconditionStepId]!==void 0){const l=t[n.preconditionStepId]+1;l>t[n.id]&&(t[n.id]=l,i=!0)}});const a={};e.forEach(n=>{const l=t[n.id]??0;(a[l]??=[]).push(n.id)});const s={...this.positions};let r=!1;Object.entries(a).forEach(([n,l])=>{const c=Number(n);l.forEach((u,p)=>{s[u]||(s[u]={x:et+c*ll,y:et+p*ba},r=!0)})}),r&&(this.positions=s)}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){this.wf={...this.wf,steps:this.wf.steps.map(i=>i.id===e?{...i,...t}:i)},this.emit()}addStep(){const e=hl(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const i=Object.values(this.positions).map(s=>s.y),a=i.length?Math.max(...i)+ba:et;this.positions={...this.positions,[e]:{x:et,y:a}},this.selectedId=e,this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(a=>a.id!==e).map(a=>a.preconditionStepId===e?{...a,preconditionStepId:void 0}:a)};const{[e]:t,...i}=this.positions;this.positions=i,this.selectedId===e&&(this.selectedId=null),this.emit()}onNodeMouseDown(e,t){e.preventDefault(),this.draggingId=t;const i=this.positions[t]??{x:0,y:0},a=this.toSvgPoint(e);this.dragOffset={x:a.x-i.x,y:a.y-i.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(a=>a.x))+_i+et:600,i=e.length?Math.max(...e.map(a=>a.y))+Ae+et:400;return{w:Math.max(t,600),h:Math.max(i,400)}}render(){const{w:e,h:t}=this.canvasSize(),i=this.wf.steps??[];return o`
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
                            ${i.map(a=>this.renderArrow(a))}
                            ${i.map(a=>this.renderNode(a))}
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
                    ${Ki}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addStep()}">
                    ${Ji}
                    Add Step
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Yi}
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
        `}renderArrow(e){if(!e.preconditionStepId)return Y``;const t=this.positions[e.preconditionStepId],i=this.positions[e.id];if(!t||!i)return Y``;const a=t.x+_i,s=t.y+Ae/2,r=i.x,n=i.y+Ae/2,l=(a+r)/2;return Y`
            <path d="M${a},${s} C${l},${s} ${l},${n} ${r},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:et,y:et},i=dl[e.type]??"#64748b",a=cl[e.type]??"•",s=this.selectedId===e.id;return Y`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${r=>this.onNodeMouseDown(r,e.id)}"
               @click="${r=>{r.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${_i}" height="${Ae}" rx="8"
                      fill="white"
                      stroke="${s?i:"#e2e8f0"}"
                      stroke-width="${s?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${Ae}" rx="8" fill="${i}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Ae}" fill="${i}"/>
                <text x="16" y="${Ae/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${a}</text>
                <!-- name -->
                <text x="44" y="${Ae/2-6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${e.name.length>16?e.name.slice(0,15)+"…":e.name}
                </text>
                <text x="44" y="${Ae/2+8}" font-size="9" fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Ae/2+20}" font-size="9" fill="${i}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(a=>a.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(a=>a.id!==e.id),i=(a,s)=>o`
            <div class="field">
                <label class="field-label">${a}</label>
                ${s}
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
                    ${i("ID",o`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${i("Name",o`<input class="inp" .value="${e.name}"
                        @change="${a=>this.updateStep(e.id,{name:a.target.value})}"/>`)}
                    ${i("Type",o`
                        <select class="inp" @change="${a=>this.updateStep(e.id,{type:a.target.value})}">
                            ${ul.map(a=>o`<option value="${a}" ?selected="${e.type===a}">${a}</option>`)}
                        </select>`)}
                    ${i("Description",o`<textarea class="inp" rows="2"
                        @change="${a=>this.updateStep(e.id,{description:a.target.value})}">${e.description??""}</textarea>`)}
                    ${i("Precondition step",o`
                        <select class="inp" @change="${a=>this.updateStep(e.id,{preconditionStepId:a.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(a=>o`<option value="${a.id}" ?selected="${e.preconditionStepId===a.id}">${a.name} (${a.id})</option>`)}
                        </select>`)}
                    ${i("Precondition expression",o`<input class="inp" placeholder="JEXL expression"
                        .value="${e.preconditionExpression??""}"
                        @change="${a=>this.updateStep(e.id,{preconditionExpression:a.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}"
                               @change="${a=>this.updateStep(e.id,{parallel:a.target.checked})}"/>
                    </div>
                    ${i("Timeout (ms)",o`<input class="inp" type="number" min="0"
                        .value="${String(e.timeout??0)}"
                        @change="${a=>this.updateStep(e.id,{timeout:Number(a.target.value)})}"/>`)}
                    ${i("Retries",o`<input class="inp" type="number" min="0"
                        .value="${String(e.retries??0)}"
                        @change="${a=>this.updateStep(e.id,{retries:Number(a.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}"
                               @change="${a=>this.updateStep(e.id,{rollbackable:a.target.checked})}"/>
                    </div>
                    ${e.rollbackable?i("Compensation step",o`
                        <select class="inp" @change="${a=>this.updateStep(e.id,{compensationStepId:a.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(a=>o`<option value="${a.id}" ?selected="${e.compensationStepId===a.id}">${a.name} (${a.id})</option>`)}
                        </select>`):""}

                    ${e.type==="ACTION"?i("Topic",o`<input class="inp" placeholder="kafka.topic.name"
                        .value="${e.topic??""}"
                        @change="${a=>this.updateStep(e.id,{topic:a.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?i("Form ID",o`<input class="inp"
                        .value="${e.formId??""}"
                        @change="${a=>this.updateStep(e.id,{formId:a.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?i("Child workflow ID",o`<input class="inp"
                        .value="${e.childWorkflowDefinitionId??""}"
                        @change="${a=>this.updateStep(e.id,{childWorkflowDefinitionId:a.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),i=URL.createObjectURL(t),a=document.createElement("a");a.href=i,a.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",a.click(),URL.revokeObjectURL(i)}};rt.styles=[xi,T`
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
    `];Nt([m()],rt.prototype,"value",2);Nt([g()],rt.prototype,"wf",2);Nt([g()],rt.prototype,"positions",2);Nt([g()],rt.prototype,"selectedId",2);Nt([g()],rt.prototype,"showMeta",2);rt=Nt([_("mateu-workflow")],rt);var pl=Object.defineProperty,ml=Object.getOwnPropertyDescriptor,Je=(e,t,i,a)=>{for(var s=a>1?void 0:a?ml(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&pl(t,i,s),s};const Ut=160,Ie=56,tt=60,vl={ACTION:"#3B82F6",JOIN:"#8B5CF6",FORK:"#F59E0B",END:"#EF4444",USER_TASK:"#10B981",PROCESS:"#6366F1"},fl={ACTION:"▶",JOIN:"⟨",FORK:"⟩",END:"◼",USER_TASK:"👤",PROCESS:"⚙"},bl=["ACTION","JOIN","FORK","END","USER_TASK","PROCESS"];let Ti;const gl=()=>(Ti||(Ti=ce(()=>import("./vendor-diagrams.js").then(e=>e.e),__vite__mapDeps([4,3,1,2])).then(e=>new e.default)),Ti);function $l(){return"step-"+Math.random().toString(36).slice(2,8)}let Re=class extends L{constructor(){super(...arguments),this.value='{"name":"New Workflow","steps":[]}',this.readOnly=!1,this.wf={name:"New Workflow",steps:[]},this.positions={},this.layoutReady=!1,this.selectedId=null,this.showMeta=!1,this.layoutError=null,this.draggingId=null,this.dragOffset={x:0,y:0},this.svgEl=null,this.elkPositioned=new Set,this.onMouseMove=e=>{if(!this.draggingId||!this.svgEl)return;const t=this.toSvgPoint(e);this.elkPositioned.add(this.draggingId),this.positions={...this.positions,[this.draggingId]:{x:Math.max(0,t.x-this.dragOffset.x),y:Math.max(0,t.y-this.dragOffset.y)}}},this.onMouseUp=()=>{this.draggingId=null,window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp)}}updated(e){if(e.has("value"))try{const t=JSON.parse(this.value),i=new Set((this.wf.steps??[]).map(r=>r.id)),a=new Set((t.steps??[]).map(r=>r.id)),s=i.size!==a.size||[...a].some(r=>!i.has(r))||[...a].some(r=>{const n=(this.wf.steps??[]).find(c=>c.id===r),l=(t.steps??[]).find(c=>c.id===r);return n?.preconditionStepId!==l?.preconditionStepId});this.wf=t,(s||!this.layoutReady)&&this.runElkLayout()}catch{}}async runElkLayout(){const e=this.wf.steps??[];if(e.length===0){this.positions={},this.layoutReady=!0;return}const t={id:"root",layoutOptions:{"elk.algorithm":"layered","elk.direction":"RIGHT","elk.spacing.nodeNode":"40","elk.layered.spacing.nodeNodeBetweenLayers":"80","elk.edgeRouting":"ORTHOGONAL","elk.layered.nodePlacement.strategy":"BRANDES_KOEPF"},children:e.map(i=>({id:i.id,width:Ut,height:Ie})),edges:e.filter(i=>i.preconditionStepId).map(i=>({id:`${i.preconditionStepId}->${i.id}`,sources:[i.preconditionStepId],targets:[i.id]}))};try{const a=await(await gl()).layout(t),s={...this.positions};for(const r of a.children??[])(!this.elkPositioned.has(r.id)||!s[r.id])&&(s[r.id]={x:(r.x??0)+tt,y:(r.y??0)+tt},this.elkPositioned.add(r.id));this.positions=s,this.layoutReady=!0,this.layoutError=null}catch(i){this.layoutError=i?.message??"ELK layout failed",this.layoutReady=!0}}emit(){const e=JSON.stringify(this.wf,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateWf(e){this.wf={...this.wf,...e},this.emit()}updateStep(e,t){const i=this.wf.steps.map(r=>r.id===e?{...r,...t}:r),a=this.wf.steps.find(r=>r.id===e),s=t.preconditionStepId!==void 0&&t.preconditionStepId!==a?.preconditionStepId;this.wf={...this.wf,steps:i},s&&(this.elkPositioned.clear(),this.runElkLayout()),this.emit()}addStep(){const e=$l(),t={id:e,type:"ACTION",name:"New Step"};this.wf={...this.wf,steps:[...this.wf.steps??[],t]};const i=Object.values(this.positions).map(a=>a.x);this.positions={...this.positions,[e]:{x:i.length?Math.max(...i)+Ut+80:tt,y:tt}},this.selectedId=e,this.elkPositioned.clear(),this.runElkLayout(),this.emit()}deleteStep(e){this.wf={...this.wf,steps:this.wf.steps.filter(a=>a.id!==e).map(a=>a.preconditionStepId===e?{...a,preconditionStepId:void 0}:a)};const{[e]:t,...i}=this.positions;this.positions=i,this.elkPositioned.delete(e),this.selectedId===e&&(this.selectedId=null),this.runElkLayout(),this.emit()}onNodeMouseDown(e,t){if(this.readOnly)return;e.preventDefault(),this.draggingId=t;const i=this.positions[t]??{x:0,y:0},a=this.toSvgPoint(e);this.dragOffset={x:a.x-i.x,y:a.y-i.y},this.svgEl=e.currentTarget.closest("svg"),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp)}toSvgPoint(e){if(!this.svgEl)return{x:0,y:0};const t=this.svgEl.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}}relayout(){this.elkPositioned.clear(),this.runElkLayout()}canvasSize(){const e=Object.values(this.positions),t=e.length?Math.max(...e.map(a=>a.x))+Ut+tt:600,i=e.length?Math.max(...e.map(a=>a.y))+Ie+tt:400;return{w:Math.max(t,600),h:Math.max(i,400)}}render(){if(!this.layoutReady)return o`<div class="loading">Computing layout…</div>`;const{w:e,h:t}=this.canvasSize(),i=this.wf.steps??[];return o`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():""}
                ${this.layoutError?o`<div class="error">⚠ ${this.layoutError}</div>`:""}
                <div class="workspace">
                    <div class="canvas-wrap">
                        <svg width="${e}" height="${t}" class="canvas"
                             @click="${a=>{a.target===a.currentTarget&&(this.selectedId=null)}}">
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
                            ${i.map(a=>this.renderArrow(a))}
                            ${i.map(a=>this.renderNode(a))}
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
                <button class="nbtn" title="Re-run ELK layout"
                        @click="${()=>this.relayout()}">
                    ${Jn}
                    Re-layout
                </button>
                ${this.readOnly?d:o`
                    <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                        ${Ki}
                        Settings
                    </button>
                    <button class="nbtn primary" @click="${()=>this.addStep()}">
                        ${Ji}
                        Add Step
                    </button>
                `}
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Yi}
                    Export
                </button>
            </div>
        `}renderMeta(){const e=this.wf;return o`
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
                        ${["DRAFT","ACTIVE","DISABLED","ARCHIVED"].map(t=>o`
                            <option value="${t}" ?selected="${e.status===t}">${t}</option>`)}
                    </select>
                    <label>Limit concurrent</label>
                    <input type="checkbox" ?checked="${e.limitConcurrentExecutions}"
                           @change="${t=>this.updateWf({limitConcurrentExecutions:t.target.checked})}"/>
                    ${e.limitConcurrentExecutions?o`
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
        `}renderArrow(e){if(!e.preconditionStepId)return Y``;const t=this.positions[e.preconditionStepId],i=this.positions[e.id];if(!t||!i)return Y``;const a=t.x+Ut,s=t.y+Ie/2,r=i.x,n=i.y+Ie/2,l=(a+r)/2;return Y`
            <path d="M${a},${s} C${l},${s} ${l},${n} ${r},${n}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `}renderNode(e){const t=this.positions[e.id]??{x:tt,y:tt},i=vl[e.type]??"#64748b",a=fl[e.type]??"•",s=this.selectedId===e.id,r=e.name.length>16?e.name.slice(0,15)+"…":e.name;return Y`
            <g transform="translate(${t.x},${t.y})"
               style="cursor:grab"
               @mousedown="${n=>this.onNodeMouseDown(n,e.id)}"
               @click="${n=>{n.stopPropagation(),this.selectedId=e.id}}">
                <rect width="${Ut}" height="${Ie}" rx="8"
                      fill="white"
                      stroke="${s?i:"#e2e8f0"}"
                      stroke-width="${s?2.5:1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge strip -->
                <rect x="0" y="0" width="32" height="${Ie}" rx="8"
                      fill="${i}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${Ie}" fill="${i}"/>
                <text x="16" y="${Ie/2+5}" text-anchor="middle"
                      font-size="14" fill="white">${a}</text>
                <!-- labels -->
                <text x="44" y="${Ie/2-6}" font-size="11"
                      fill="#1e293b" font-weight="600">${r}</text>
                <text x="44" y="${Ie/2+8}" font-size="9"
                      fill="#94a3b8">${e.id}</text>
                <text x="44" y="${Ie/2+20}" font-size="9"
                      fill="${i}">${e.type}</text>
            </g>
        `}renderPanel(){const e=this.wf.steps.find(s=>s.id===this.selectedId);if(!e)return"";const t=this.wf.steps.filter(s=>s.id!==e.id),i=this.readOnly,a=(s,r)=>o`
            <div class="field">
                <label class="field-label">${s}</label>
                ${r}
            </div>
        `;return o`
            <div class="properties">
                <div class="prop-header">
                    <span>Step Properties</span>
                    ${i?d:o`<button class="del-btn" title="Delete step"
                            @click="${()=>this.deleteStep(e.id)}">🗑</button>`}
                    <button class="close-btn"
                            @click="${()=>this.selectedId=null}">✕</button>
                </div>
                <div class="prop-body">
                    ${a("ID",o`<input class="inp" readonly .value="${e.id}"/>`)}
                    ${a("Name",o`<input class="inp" ?readonly="${i}" .value="${e.name}"
                        @change="${i?d:s=>this.updateStep(e.id,{name:s.target.value})}"/>`)}
                    ${a("Type",o`
                        <select class="inp" ?disabled="${i}"
                                @change="${i?d:s=>this.updateStep(e.id,{type:s.target.value})}">
                            ${bl.map(s=>o`
                                <option value="${s}" ?selected="${e.type===s}">${s}</option>`)}
                        </select>`)}
                    ${a("Description",o`<textarea class="inp" rows="2" ?readonly="${i}"
                        @change="${i?d:s=>this.updateStep(e.id,{description:s.target.value})}">${e.description??""}</textarea>`)}
                    ${a("Precondition step",o`
                        <select class="inp" ?disabled="${i}"
                                @change="${i?d:s=>this.updateStep(e.id,{preconditionStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>o`
                                <option value="${s.id}" ?selected="${e.preconditionStepId===s.id}">
                                    ${s.name} (${s.id})
                                </option>`)}
                        </select>`)}
                    ${a("Precondition expression",o`
                        <input class="inp" placeholder="JEXL expression" ?readonly="${i}"
                               .value="${e.preconditionExpression??""}"
                               @change="${i?d:s=>this.updateStep(e.id,{preconditionExpression:s.target.value||void 0})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${e.parallel}" ?disabled="${i}"
                               @change="${i?d:s=>this.updateStep(e.id,{parallel:s.target.checked})}"/>
                    </div>
                    ${a("Timeout (ms)",o`
                        <input class="inp" type="number" min="0" ?readonly="${i}"
                               .value="${String(e.timeout??0)}"
                               @change="${i?d:s=>this.updateStep(e.id,{timeout:Number(s.target.value)})}"/>`)}
                    ${a("Retries",o`
                        <input class="inp" type="number" min="0" ?readonly="${i}"
                               .value="${String(e.retries??0)}"
                               @change="${i?d:s=>this.updateStep(e.id,{retries:Number(s.target.value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${e.rollbackable}" ?disabled="${i}"
                               @change="${i?d:s=>this.updateStep(e.id,{rollbackable:s.target.checked})}"/>
                    </div>
                    ${e.rollbackable?a("Compensation step",o`
                        <select class="inp" ?disabled="${i}"
                                @change="${i?d:s=>this.updateStep(e.id,{compensationStepId:s.target.value||void 0})}">
                            <option value="">— none —</option>
                            ${t.map(s=>o`
                                <option value="${s.id}" ?selected="${e.compensationStepId===s.id}">
                                    ${s.name} (${s.id})
                                </option>`)}
                        </select>`):""}
                    ${e.type==="ACTION"?a("Topic",o`
                        <input class="inp" placeholder="kafka.topic.name" ?readonly="${i}"
                               .value="${e.topic??""}"
                               @change="${i?d:s=>this.updateStep(e.id,{topic:s.target.value||void 0})}"/>`):""}
                    ${e.type==="USER_TASK"?a("Form ID",o`
                        <input class="inp" ?readonly="${i}" .value="${e.formId??""}"
                               @change="${i?d:s=>this.updateStep(e.id,{formId:s.target.value||void 0})}"/>`):""}
                    ${e.type==="PROCESS"?a("Child workflow ID",o`
                        <input class="inp" ?readonly="${i}" .value="${e.childWorkflowDefinitionId??""}"
                               @change="${i?d:s=>this.updateStep(e.id,{childWorkflowDefinitionId:s.target.value||void 0})}"/>`):""}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.wf,null,2),t=new Blob([e],{type:"application/json"}),i=URL.createObjectURL(t),a=document.createElement("a");a.href=i,a.download=(this.wf.name??"workflow").replace(/\s+/g,"-").toLowerCase()+".json",a.click(),URL.revokeObjectURL(i)}};Re.styles=[xi,T`
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
    `];Je([m()],Re.prototype,"value",2);Je([m({type:Boolean})],Re.prototype,"readOnly",2);Je([g()],Re.prototype,"wf",2);Je([g()],Re.prototype,"positions",2);Je([g()],Re.prototype,"layoutReady",2);Je([g()],Re.prototype,"selectedId",2);Je([g()],Re.prototype,"showMeta",2);Je([g()],Re.prototype,"layoutError",2);Re=Je([_("mateu-workflow-elk")],Re);var yl=Object.defineProperty,xl=Object.getOwnPropertyDescriptor,ai=(e,t,i,a)=>{for(var s=a>1?void 0:a?xl(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&yl(t,i,s),s};const wl=["string","integer","number","bool","date","time","dateTime","dateRange","money","file","array","status","component","menu","range","action","actionGroup"],Cl=["regular","radio","checkbox","textarea","toggle","combobox","select","email","password","richText","listBox","html","markdown","image","icon","link","money","grid","color","choice","popover","slider","button","stars"],kl={string:"#3B82F6",integer:"#8B5CF6",number:"#6366F1",bool:"#10B981",date:"#F59E0B",time:"#F59E0B",dateTime:"#F59E0B",dateRange:"#F59E0B",money:"#EF4444",file:"#64748B",array:"#0EA5E9",status:"#EC4899",component:"#14B8A6",menu:"#94A3B8",range:"#A855F7",action:"#F97316",actionGroup:"#FB923C"};function ga(){return"field-"+Math.random().toString(36).slice(2,8)}let xt=class extends L{constructor(){super(...arguments),this.value='{"name":"New Form","fields":[]}',this.form={name:"New Form",fields:[]},this.selectedId=null,this.showMeta=!1,this.sortable=null,this.listEl=null}updated(e){if(e.has("value"))try{this.form=JSON.parse(this.value)}catch{}this.attachSortable()}disconnectedCallback(){super.disconnectedCallback(),this.sortable?.destroy(),this.sortable=null}attachSortable(){const e=this.shadowRoot?.querySelector(".field-list");!e||e===this.listEl||(this.listEl=e,this.sortable?.destroy(),this.sortable=ss.create(e,{animation:150,handle:".drag-handle",ghostClass:"sortable-ghost",onEnd:t=>{const{oldIndex:i,newIndex:a}=t;if(i===void 0||a===void 0||i===a)return;const s=[...this.form.fields],[r]=s.splice(i,1);s.splice(a,0,r),this.form={...this.form,fields:s},this.emit()}}))}emit(){const e=JSON.stringify(this.form,null,2);this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}updateForm(e){this.form={...this.form,...e},this.emit()}updateField(e,t){this.form={...this.form,fields:this.form.fields.map(i=>i.id===e?{...i,...t}:i)},this.emit()}addField(){const e=ga(),t={id:e,label:"New Field",dataType:"string"};this.form={...this.form,fields:[...this.form.fields,t]},this.selectedId=e,this.emit()}deleteField(e){this.form={...this.form,fields:this.form.fields.filter(t=>t.id!==e)},this.selectedId===e&&(this.selectedId=null),this.emit()}duplicateField(e){const t=this.form.fields.find(r=>r.id===e);if(!t)return;const i={...t,id:ga(),label:t.label+" (copy)"},a=this.form.fields.findIndex(r=>r.id===e),s=[...this.form.fields];s.splice(a+1,0,i),this.form={...this.form,fields:s},this.selectedId=i.id,this.emit()}render(){return o`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta?this.renderMeta():d}
                <div class="workspace">
                    ${this.renderList()}
                    ${this.selectedId?this.renderPanel():d}
                </div>
            </div>
        `}renderToolbar(){return o`
            <div class="toolbar">
                <span class="form-name">${this.form.name}</span>
                <div style="flex:1"></div>
                <button class="nbtn" @click="${()=>this.showMeta=!this.showMeta}">
                    ${Ki}
                    Settings
                </button>
                <button class="nbtn primary" @click="${()=>this.addField()}">
                    ${Ji}
                    Add Field
                </button>
                <button class="nbtn" @click="${()=>this.exportJson()}">
                    ${Yi}
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
                    </div>`:d}
                <div class="field-list">
                    ${e.map(t=>this.renderRow(t))}
                </div>
            </div>
        `}renderRow(e){const t=kl[e.dataType]??"#64748b",i=this.selectedId===e.id;return o`
            <div class="field-row ${i?"selected":""}"
                 data-id="${e.id}"
                 @click="${()=>this.selectedId=this.selectedId===e.id?null:e.id}">
                <span class="drag-handle" title="Drag to reorder">⠿</span>
                <span class="type-badge" style="background:${t}">${e.dataType}</span>
                <span class="field-label-text">${e.label}</span>
                <span class="field-id-text">${e.id}</span>
                ${e.required?o`<span class="required-badge">required</span>`:d}
                ${e.stereotype&&e.stereotype!=="regular"?o`<span class="stereo-badge">${e.stereotype}</span>`:d}
                <div style="flex:1"></div>
                <button class="row-btn" title="Duplicate"
                        @click="${a=>{a.stopPropagation(),this.duplicateField(e.id)}}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${a=>{a.stopPropagation(),this.deleteField(e.id)}}">🗑</button>
            </div>
        `}renderPanel(){const e=this.form.fields.find(i=>i.id===this.selectedId);if(!e)return d;const t=(i,a)=>o`
            <div class="prop-field">
                <label class="prop-label">${i}</label>
                ${a}
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
                               @change="${i=>this.updateField(e.id,{label:i.target.value})}"/>`)}
                    ${t("Data type",o`
                        <select class="inp"
                                @change="${i=>this.updateField(e.id,{dataType:i.target.value})}">
                            ${wl.map(i=>o`
                                <option value="${i}" ?selected="${e.dataType===i}">${i}</option>`)}
                        </select>`)}
                    ${t("Stereotype",o`
                        <select class="inp"
                                @change="${i=>this.updateField(e.id,{stereotype:i.target.value||void 0})}">
                            ${Cl.map(i=>o`
                                <option value="${i}" ?selected="${(e.stereotype??"regular")===i}">${i}</option>`)}
                        </select>`)}
                    <div class="prop-field row">
                        <label class="prop-label">Required</label>
                        <input type="checkbox" ?checked="${e.required}"
                               @change="${i=>this.updateField(e.id,{required:i.target.checked})}"/>
                    </div>
                    ${t("Description / hint",o`
                        <textarea class="inp" rows="3"
                                  @change="${i=>this.updateField(e.id,{description:i.target.value||void 0})}">${e.description??""}</textarea>`)}
                </div>
            </div>
        `}exportJson(){const e=JSON.stringify(this.form,null,2),t=new Blob([e],{type:"application/json"}),i=URL.createObjectURL(t),a=document.createElement("a");a.href=i,a.download=(this.form.name??"form").replace(/\s+/g,"-").toLowerCase()+".json",a.click(),URL.revokeObjectURL(i)}};xt.styles=[xi,T`
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
    `];ai([m()],xt.prototype,"value",2);ai([g()],xt.prototype,"form",2);ai([g()],xt.prototype,"selectedId",2);ai([g()],xt.prototype,"showMeta",2);xt=ai([_("mateu-form-editor")],xt);var Sl=Object.defineProperty,El=Object.getOwnPropertyDescriptor,je=(e,t,i,a)=>{for(var s=a>1?void 0:a?El(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Sl(t,i,s),s};let Ce=class extends L{constructor(){super(...arguments),this.appState={},this.appData={},this.open=!1,this.activeTab="appstate",this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null,this._prevTarget=null,this._onMouseover=e=>{let t=e.target;for(;t&&!(t.tagName?.toLowerCase().startsWith("mateu-")&&t!==this);)t=t.parentElement;if(t===this||t===null){t===null&&this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset="",this._prevTarget=null,this.hoveredTag="",this.hoveredId="",this.hoveredState=null,this.hoveredData=null,this.hoveredMeta=null);return}t!==this._prevTarget&&(this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget.style.outlineOffset=""),this._prevTarget=t,t.style.outline="2px solid #0070f3",t.style.outlineOffset="-2px",this.hoveredTag=t.tagName.toLowerCase(),this.hoveredId=t.id||"",this.hoveredState=t.state,this.hoveredData=t.data,this.hoveredMeta=t.component?.metadata)}}connectedCallback(){super.connectedCallback(),document.addEventListener("mouseover",this._onMouseover,!0)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mouseover",this._onMouseover,!0),this._prevTarget&&(this._prevTarget.style.outline="",this._prevTarget=null)}_fmt(e){try{return JSON.stringify(e,null,2)??"null"}catch{return String(e)}}_renderTab(e,t){return o`
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
                        `:d}
                        ${this.activeTab==="appdata"?o`
                            <pre class="json">${this._fmt(this.appData)}</pre>
                        `:d}
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
                        `:d}
                    </div>
                </div>
            `:o`
            <button class="fab" @click=${()=>{this.open=!0}} title="Mateu Debug">🐛</button>
        `}};Ce.styles=T`
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
    `;je([m()],Ce.prototype,"appState",2);je([m()],Ce.prototype,"appData",2);je([g()],Ce.prototype,"open",2);je([g()],Ce.prototype,"activeTab",2);je([g()],Ce.prototype,"hoveredTag",2);je([g()],Ce.prototype,"hoveredId",2);je([g()],Ce.prototype,"hoveredState",2);je([g()],Ce.prototype,"hoveredData",2);je([g()],Ce.prototype,"hoveredMeta",2);Ce=je([_("mateu-debug-overlay")],Ce);var _e=(e=>(e.SetAppDataValue="SetAppDataValue",e.SetAppStateValue="SetAppStateValue",e.SetDataValue="SetDataValue",e.RunAction="RunAction",e.RunJS="RunJS",e.SetAttributeValue="SetAttributeValue",e.SetStateValue="SetStateValue",e.SetCssClass="SetCssClass",e.SetStyle="SetStyle",e))(_e||{}),Ka=(e=>(e.required="required",e.disabled="disabled",e.hidden="hidden",e.pattern="pattern",e.minValue="minValue",e.maxValue="maxValue",e.minLength="minLength",e.maxLength="maxLength",e.css="css",e.style="style",e.theme="theme",e.errorMessage="errorMessage",e.description="description",e.none="none",e))(Ka||{}),Ja=(e=>(e.Continue="Continue",e.Stop="Stop",e))(Ja||{}),Il=Object.defineProperty,_l=Object.getOwnPropertyDescriptor,wi=(e,t,i,a)=>{for(var s=a>1?void 0:a?_l(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Il(t,i,s),s};let Bt=null,Dt=class extends lt{constructor(){super(...arguments),this.baseUrl="",this.route="",this.consumedRoute="",this.formerState={},this.applyRules=()=>{const e=this.component.rules;if(e&&e.length>0){const t=this.state,i=this.data,a=this.appState,s=this.appData,r=this.component,n=x=>Ia(x,t,i,{appState:a,appData:s,component:r}),l=x=>Ea(x,t,i,a,s,{component:r}),c=["state","data","appState","appData","component"],u=[t,i,a,s,r],p={...this.state},v={...this.data};let f=!1,y=!1;for(let x=0;x<e.length;x++){const $=e[x];try{if(n($.filter)){if(_e.SetStateValue==$.action||_e.SetDataValue==$.action){const k=_e.SetStateValue==$.action?p:v,E=$.fieldName.split(",");for(let R=0;R<E.length;R++){const N=E[R];if(!k[N]||k[N]!=$.value){const M=$.expression?l($.expression):$.value,ct=Ka.none==$.fieldAttribute?N:N+"."+$.fieldAttribute;M!=k[ct]&&(k[ct]=M,_e.SetStateValue==$.action&&(f=!0),_e.SetDataValue==$.action&&(y=!0))}}}if(_e.RunAction==$.action&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:$.actionId},bubbles:!0,composed:!0})),_e.RunJS==$.action&&new Function(...c,$.value)(...u),_e.SetAttributeValue==$.action){const k=$.expression?n($.expression):$.value;if($.fieldAttribute=="disabled"){k?this.shadowRoot?.getElementById($.fieldName)?.setAttribute($.fieldAttribute,"disabled"):this.shadowRoot?.getElementById($.fieldName)?.removeAttribute($.fieldAttribute);continue}this.shadowRoot?.getElementById($.fieldName)?.setAttribute($.fieldAttribute,k)}if(_e.SetCssClass==$.action&&this.shadowRoot?.getElementById($.fieldName)?.setAttribute("class",$.value),_e.SetStyle==$.action&&this.shadowRoot?.getElementById($.fieldName)?.style.setProperty($.expression,$.value),Ja.Stop==$.result)break}}catch(k){console.error("rule failed",$,k)}}f&&(this.state=p),y&&(this.data=v),f&&this.checkValidations()}},this.skipValidation=(e,t)=>e&&t.fieldId&&!e.includes(t.fieldId)||!e&&t.fieldId&&t.fieldId.includes("-"),this.checkValidations=e=>{const t=e?e.split(","):void 0,i=this.component.validations;let a=!0,s=!1;const r=this.data??{},n={...this.data??{},errors:{}};if(i){for(let l=0;l<i.length;l++){const c=i[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let p=0;p<u.length;p++){const v=u[p];n.errors[v]=[]}}for(let l=0;l<i.length;l++){const c=i[l];if(!this.skipValidation(t,c))try{const u=c.condition&&c.condition.includes("${")?this._evalTemplate(c.condition):this._evalExpr(c.condition);if(c.condition&&!u){a=!1;const v=(c.fieldId??"_component").split(",");for(let f=0;f<v.length;f++){const y=v[f];let x=n.errors[y];if(x||(n.errors[y]=[]),x=n.errors[y],!r[y]){let $=c.message;try{$=this._evalTemplate(c.message)}catch{}x.push($)}}}}catch(u){console.error("validation failed",c,u)}}for(let l=0;l<i.length;l++){const c=i[l];if(this.skipValidation(t,c))continue;const u=(c.fieldId??"_component").split(",");for(let p=0;p<u.length;p++){const v=u[p];if(r.errors?[v].join(","):n.errors==""&&[v].join(",")){s=!0;break}}}(r.errors?["_component"].join(","):n.errors==""&&["_component"].join(","))&&(s=!0)}n._valid=a,n._valid!=r._valid&&(s=!0),s&&(this.data=n)},this._autoSaveTimers=new Map,this.onChange=()=>{this.applyRules()},this.closeModalRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.closeModal()},this.resetFilters=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,i={};t.fieldIds.forEach(a=>{i[a]=void 0}),i.searchText=void 0,this.state={...this.state,...i}}},this.dataChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail,i={};i[t.key]=t.value,e.type=="data-changed"&&(this.data={...this.data,...i})}},this.valueChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent){const t=e.detail;if(e.type=="value-changed"){const i={...this.state};i[t.fieldId]=t.value,this.state=i,(this.state[t.fieldId]||this.formerState[t.fieldId])&&this.state[t.fieldId]!=this.formerState[t.fieldId]&&this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("dirty",{detail:e.detail,bubbles:!0,composed:!0}));const a=this.component;a.triggers?.filter(s=>s.type==it.OnValueChange).filter(s=>!s.propertyName||t.fieldId==s.propertyName).forEach(s=>{(!s.condition||this._evalExpr(s.condition))&&this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))}),a.triggers?.filter(s=>s.type==it.AutoSave).forEach(s=>{const r=s.actionId,n=this._autoSaveTimers.get(r);n!==void 0&&clearTimeout(n),this._autoSaveTimers.set(r,setTimeout(()=>{this._autoSaveTimers.delete(r),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:s.actionId},bubbles:!0,composed:!0}))},s.debounceMillis??800))})}}},this.actionRequestedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.manageActionRequestedEvent(e)},this.manageActionRequestedEvent=e=>{const t=e.detail;if(e.type=="action-requested"){e.preventDefault(),e.stopPropagation();const i=this.component,a=i.actions?.find(s=>s.id==t.actionId||s.id.endsWith("*")&&t.actionId.startsWith(s.id.replace("*","")));if(a){if(a&&a.rowsSelectedRequired&&(!this.state.crud_selected_items||this.state.crud_selected_items.length==0)){this.notify("You first need to select some rows");return}if(a&&a.validationRequired){const r=Bt??this;if(Bt=null,r.checkValidations(a.fieldsToValidate),!r.data._valid){r.notifyValidationErrors();return}}Bt=null;const s={...t,initiatorComponentId:this.id};a&&a.confirmationRequired?this.callAfterConfirmation(a,()=>this.requestActionCallToServerOrBubble(s,i,a)):this.requestActionCallToServerOrBubble(s,i,a)}else{const s={...t.parameters};s.initiatorState||(s.initiatorState=this.state),Bt||(Bt=this),this.dispatchEvent(new CustomEvent(e.type,{detail:{...e.detail,parameters:s},bubbles:!0,composed:!0}))}}},this.buildFieldLabelMap=()=>{const e={},t=i=>{if(i)for(const a of i){const s=a.metadata;if(s?.type===h.FormField){const r=s;r.fieldId&&r.label&&(e[r.fieldId]=r.label)}t(a.children)}};return t(this.component?.children),e},this.notifyValidationErrors=()=>{const e=this.data?.errors??{},t=this.buildFieldLabelMap(),i=[];if(Object.entries(e).forEach(([s,r])=>{if(!Array.isArray(r))return;const n=s==="_component"?void 0:t[s]??s;r.forEach(l=>{l&&!i.some(c=>c.label===n&&c.msg===l)&&i.push({label:n,msg:l})})}),i.length===0){this.notify("There are validation errors");return}const a=document.createElement("vaadin-notification");a.position="bottom-end",a.setAttribute("theme","error"),a.duration=Math.max(3e3,1500+i.length*1e3),a.renderer=s=>{xa(o`
                <vaadin-vertical-layout style="gap: var(--lumo-space-xs);">
                    <strong>There are validation errors</strong>
                    ${i.map(({label:r,msg:n})=>r?o`<span>• <b>${r}:</b> ${n}</span>`:o`<span>• ${n}</span>`)}
                </vaadin-vertical-layout>
            `,s)},document.body.appendChild(a),a.opened=!0,a.addEventListener("opened-changed",s=>{s.detail.value||document.body.removeChild(a)})},this.notify=e=>{Jt.show(e,{position:"bottom-end",theme:"error",duration:3e3})},this.callAfterConfirmation=(e,t)=>{let i="One moment, please",a="Are you sure?",s="Yes",r="No";e.confirmationTexts&&(i=e.confirmationTexts.title,a=e.confirmationTexts.message,s=e.confirmationTexts.confirmationText,r=e.confirmationTexts.denialText);const n=document.createElement("vaadin-confirm-dialog");n.setAttribute("header",i),n.setAttribute("cancel-button-visible","cancel-button-visible"),n.setAttribute("confirm-text",s),n.setAttribute("cancel-text",r),n.append(a),n.opened=!0,n.addEventListener("confirm",()=>t()),n.addEventListener("close",()=>document.body.removeChild(n)),n.addEventListener("confirm",()=>document.body.removeChild(n)),n.addEventListener("cancel",()=>document.body.removeChild(n)),n.addEventListener("reject",()=>document.body.removeChild(n)),document.body.append(n)},this.requestActionCallToServerOrBubble=(e,t,i)=>{if(i&&i.bubble){const a={...e.parameters};a.initiatorState||(a.initiatorState=this.state),this.dispatchEvent(new CustomEvent("action-requested",{detail:{...e,parameters:a},bubbles:!0,composed:!0}))}else this.requestActionCallToServer(e,t,i)},this.requestActionCallToServer=(e,t,i)=>{if(i&&i.href){window.location.href=i.href;return}if(i&&i.js)try{new Function("state","data","appState","appData","component",i.js).call(this,this.state??{},this.data??{},this.appState??{},this.appData??{},this.component),this.state={...this.state},this.data={...this.data}}catch(a){console.error("when evaluating "+i.js,a,this.component,this.state,this.data)}if(i&&i.customEvent&&this.dispatchEvent(new CustomEvent(i.customEvent.name,{detail:i.customEvent.detail,bubbles:!0,composed:!0})),!(i&&(i.js||i.customEvent))){if(e.actionId=="search"){const a=e.parameters?._searchState;a?this.state={...this.state,...a}:this.state.size||(this.state={...this.state,size:10,page:0,sort:[]})}this.dispatchEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,componentState:{...this.state},parameters:e.parameters??{},actionId:e.actionId,serverSideType:t.serverSideType,serverSideComponentRoute:t.route,initiatorComponentId:e.initiatorComponentId??t.id,initiator:this,background:i?.background,sse:i?.sse,callback:e.callback,callbackonly:e.callbackonly,callbackToken:e.callbackToken??this.callbackToken},bubbles:!0,composed:!0}))}},this.handleBackendSucceeded=e=>{e.detail.actionId&&this.component.triggers?.filter(a=>a.type==it.OnSuccess).filter(a=>e.detail.actionId==a.calledActionId).forEach(a=>{if(!a.condition||this._evalExpr(a.condition))if(e.preventDefault(),e.stopPropagation(),a.timeoutMillis>0){const s=this.callbackToken;setTimeout(()=>{this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId,callbackToken:s},bubbles:!0,composed:!0}))},a.timeoutMillis)}else this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId},bubbles:!0,composed:!0}))})},this.handleBackendFailed=e=>{e.detail.actionId&&this.component.triggers?.filter(a=>a.type==it.OnError).filter(a=>e.detail.actionId==a.calledActionId).forEach(a=>{(!a.condition||this._evalExpr(a.condition))&&(e.preventDefault(),e.stopPropagation(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:a.actionId},bubbles:!0,composed:!0})))})},this._keydownListener=e=>{if(this._handleTabShortcut(e))return;const t=this.component;if(t)for(const i of t.actions??[]){const a=i.shortcut||(i.runOnEnter?"enter":null);if(a&&this._shortcutMatchesEvent(a,e)){e.preventDefault(),this.manageActionRequestedEvent(new CustomEvent("action-requested",{detail:{actionId:i.id},bubbles:!0,composed:!0}));return}}}}createRenderRoot(){return H.mustUseShadowRoot()?super.createRenderRoot():this}updated(e){super.updated(e),e.has("state")&&this.state&&JSON.stringify(this.state)!=JSON.stringify({})&&this.onChange(),e.has("component")&&(this.formerState={...this.state},this.component?.confirmOnNavigationIfDirty&&this.dispatchEvent(new CustomEvent("clean",{detail:{},bubbles:!0,composed:!0})),setTimeout(()=>this.triggerOnLoad()))}_shortcutMatchesEvent(e,t){return mr(e,t)}_collectShortcutTabs(){const e=this.renderRoot;if(!e)return[];const t=Array.from(e.querySelectorAll("vaadin-tab[data-shortcut]"));return e.querySelectorAll("mateu-drawer, mateu-dialog").forEach(i=>{const a=i.shadowRoot;a&&t.push(...Array.from(a.querySelectorAll("vaadin-tab[data-shortcut]")))}),t}_handleTabShortcut(e){const t=this._collectShortcutTabs();if(t.length===0)return!1;for(const i of Array.from(t)){const a=i.dataset.shortcut;if(!a||!this._shortcutMatchesEvent(a,e))continue;const s=i.closest("vaadin-tabs");if(!s)continue;const r=Array.from(s.querySelectorAll("vaadin-tab")).indexOf(i);if(!(r<0))return e.preventDefault(),s.selected=r,!0}return!1}connectedCallback(){super.connectedCallback(),this.addEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.addEventListener("backend-call-failed",this.handleBackendFailed),document.addEventListener("keydown",this._keydownListener)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("backend-call-succeeded",this.handleBackendSucceeded),this.removeEventListener("backend-call-failed",this.handleBackendFailed),document.removeEventListener("keydown",this._keydownListener)}render(){return o`<div>
            <div>${this._render()}</div>
            ${this.data&&this.data.errors&&this.data.errors._component&&this.data.errors._component.length>0?o`
                <div><ul>${this.data.errors._component.map(e=>o`<li>${e}</li>`)}</ul></div>
            `:d}</div>`}_render(){if(this.component?.type==U.ClientSide){const e=this.component;return e.metadata?.type==h.Page?Oi(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):e.metadata?.type==h.Crud?Li(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!0):H.get()?.renderClientSideComponent(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData,!1)}return o`
            <mateu-api-caller 
                    @value-changed="${this.valueChangedListener}"
                    @data-changed="${this.dataChangedListener}"
                    @close-modal-requested="${this.closeModalRequestedListener}"
                    @filter-reset-requested="${this.resetFilters}"
                    @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(e=>{if(e.type==U.ClientSide){const t=e;if(t.metadata?.type==h.Page)return Oi(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0);if(t.metadata?.type==h.Crud)return Li(this,t,this.baseUrl,this.state,this.data,this.appState,this.appData,!0)}return b(this,e,this.baseUrl,this.state,this.data,this.appState,this.appData)})}
            </mateu-api-caller>
        `}};Dt.styles=T`
        :host {
        }

        ${Qa(ot.cssText)}
        
        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }
        
  `;wi([m()],Dt.prototype,"baseUrl",2);wi([m()],Dt.prototype,"route",2);wi([m()],Dt.prototype,"consumedRoute",2);Dt=wi([_("mateu-component")],Dt);const $a=e=>{if(e)try{return JSON.parse(e)}catch{return{value:e}}else return{}};class Tl{async handle(t,i){return await t.runAction(i.baseUrl,i.route,i.consumedRoute,i.actionId,i.initiatorComponentId,i.appState,i.serverSideType,i.componentState,i.parameters,i.initiator,i.background)}}const Rl=new Tl;class Pl{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,i,a)=>{if(t?.fragments?.forEach(s=>{at.next({command:void 0,fragment:s,ui:void 0,error:void 0,callbackToken:a})}),t?.appState&&(K.value={...t.appState},i.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const s=t?.appData;Vt.value={...t.appData,...s},i.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}t?.messages?.forEach(s=>{Jt.show(s.text,{position:s.position?this.mapPosition(s.position):void 0,theme:s.variant,duration:s.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(s=>{at.next({command:s,fragment:void 0,ui:void 0,error:void 0,callbackToken:a})})}}async runAction(t,i,a,s,r,n,l,c,u,p,v,f,y,x,$){try{const k=await Rl.handle(t,{baseUrl:i,route:a,consumedRoute:s,actionId:r,appState:K.value,initiatorComponentId:n,componentState:u,parameters:p,serverSideType:c,initiator:v,background:f});y&&y(k),x||this.handleUIIncrement(k,v,$),k.messages&&k.messages.length==1&&k.messages[0].variant=="error"&&v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r,evevntId:Z()},bubbles:!0,composed:!0}))}catch(k){console.warn("Action request failed",k),v.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(k)}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}}serialize(t){return t?.message?t:JSON.stringify(t)}}const Ol=new Pl,Ll=Ol;class Dl{constructor(){this.mapPosition=t=>{switch(t){case"topStretch":return"top-stretch";case"topStart":return"top-start";case"topCenter":return"top-center";case"topEnd":return"top-end";case"middle":return"middle";case"bottomStart":return"bottom-start";case"bottomEnd":return"bottom-end";case"bottomStretch":return"bottom-stretch";case"bottomCenter":return"bottom-center"}return"bottom-end"},this.handleUIIncrement=(t,i,a)=>{if(t?.messages?.forEach(s=>{Jt.show(s.text,{position:s.position?this.mapPosition(s.position):"bottom-end",theme:s.variant,duration:s.duration})}),t?.banners&&t.banners.length>0&&document.dispatchEvent(new CustomEvent("page-banners-received",{detail:{banners:t.banners,append:t.appendBanners??!1},bubbles:!1,composed:!1})),t?.commands?.forEach(s=>{at.next({command:s,fragment:void 0,ui:void 0,error:void 0,callbackToken:a})}),t?.fragments?.forEach(s=>{at.next({command:void 0,fragment:s,ui:void 0,error:void 0,callbackToken:a})}),t?.appState&&(K.value={...t.appState},i.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))),t?.appData){const s=t?.appData;Vt.value={...t.appData,...s},i.dispatchEvent(new CustomEvent("app-data-updated",{bubbles:!0,composed:!0}))}}}async runAction(t,i,a,s,r,n,l,c,u,p,v,f,y,x,$){if(a){a=a||"_no_route",a&&a.startsWith("/")&&(a=a.substring(1));const k={serverSideType:c,appState:K.value,componentState:u,parameters:p,initiatorComponentId:n,consumedRoute:s,route:"/"+a,actionId:r};f||v.dispatchEvent(new CustomEvent("backend-called-event",{bubbles:!0,composed:!0,detail:{}})),fetch(i+"/mateu/v3/sse/"+a,{method:"POST",headers:{Accept:"text/event-stream","Content-Type":"application/json"},body:JSON.stringify(k)}).then(async E=>{const R=E.body?.pipeThrough(new TextDecoderStream).getReader();if(R){let N="";for(;;){const{value:M,done:ct}=await R.read();if(ct)break;N+=M;const qt=N.split(`

`);N=qt.pop()??"";for(const si of qt){const w=si.trim();if(w)if(w.startsWith("data:")){const z=JSON.parse(w.substring(5).trim());y&&y(z),x||this.handleUIIncrement(z,v,$),z.messages&&z.messages.length==1&&z.messages[0].variant=="error"&&v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))}else{let z=w;try{const S=JSON.parse(w);z=S.message,S._embedded?.errors?.length>0&&S._embedded.errors[0].message&&(z=S._embedded.errors[0].message)}catch{}throw new Error(z)}}}}f||v.dispatchEvent(new CustomEvent("backend-succeeded-event",{bubbles:!0,composed:!0,detail:{actionId:r}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-succeeded",{detail:{actionId:r},bubbles:!0,composed:!0}))}).catch(E=>{v.dispatchEvent(new CustomEvent("backend-failed-event",{bubbles:!0,composed:!0,detail:{actionId:r,reason:this.serialize(E)}})),v.shadowRoot?.dispatchEvent(new CustomEvent("backend-call-failed",{detail:{actionId:r},bubbles:!0,composed:!0}))})}}serialize(t){return t?.message?t:JSON.stringify(t)}}const zl=new Dl;var Al=Object.defineProperty,Fl=Object.getOwnPropertyDescriptor,Ee=(e,t,i,a)=>{for(var s=a>1?void 0:a?Fl(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Al(t,i,s),s};let ae=class extends bi{constructor(){super(...arguments),this.consumedRoute="",this.serverSideType=void 0,this.uriPrefix=void 0,this.overrides=void 0,this.homeRoute=void 0,this.route=void 0,this.top=void 0,this.appState={},this.appData={},this.preventNavigation=!1,this.overridesParsed={},this.fragment=void 0,this.actionRequestedListener=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.manageActionEvent(e))},this.historyPushed=e=>{e instanceof CustomEvent&&(e.preventDefault(),e.stopPropagation(),this.preventNavigation=!0,this.route=e.detail.route)},this.routeChangedListener=e=>{if(e instanceof CustomEvent){e.preventDefault(),e.stopPropagation();let t=e.detail.route;typeof t=="string"&&(t===""||t.startsWith("/"))&&this.consumedRoute&&this.consumedRoute!=="_empty"&&this.consumedRoute.startsWith("/")&&!t.startsWith(this.consumedRoute)&&(t=this.consumedRoute+t),this.uriPrefix&&(t.startsWith("/")&&this.uriPrefix.endsWith("/")?t=this.uriPrefix+t.substring(1):!t.startsWith("/")&&!this.uriPrefix.endsWith("/")?t=this.uriPrefix+"/"+t:t=this.uriPrefix+t),this.dispatchEvent(new CustomEvent("url-update-requested",{detail:{route:t},bubbles:!0,composed:!0}))}},this.backendFailedListener=e=>{e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&e.detail.actionId==""&&(this.fragment={targetComponentId:this.id,data:{},state:{},component:{type:U.ClientSide,metadata:{type:h.Element,name:"div",content:"Not found"},id:"fieldId"},action:Gt.Replace,containerId:void 0})},this.detail1=void 0,this.manageActionEvent=e=>{e.preventDefault(),e.stopPropagation(),this.detail1=e.detail;const t=this.detail1;if(e.type=="server-side-action-requested"){let i=Ll;t.sse&&(i=zl),i.runAction(Gi,this.baseUrl,t.route??"",t.consumedRoute,t.actionId,t.initiatorComponentId,this.getCustomisedAppState(),t.serverSideType,t.componentState,t.parameters,t.initiator,t.background,t.callback,t.callbackonly,t.callbackToken)}},this.getCustomisedAppState=()=>{let e={...K.value};if(this.overrides){const t=$a(this.overrides);e={...e,...t}}return e}}manageActionRequestedEvent(e){throw new Error("Method not implemented.")}createRenderRoot(){return H.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.overridesParsed=$a(this.overrides),this.addEventListener("server-side-action-requested",this.actionRequestedListener),this.addEventListener("backend-call-failed",this.backendFailedListener),this.addEventListener("history-pushed",this.historyPushed),this.addEventListener("route-changed",this.routeChangedListener),window.Vaadin.featureFlags.masterDetailLayoutComponent=!0}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.actionRequestedListener),this.removeEventListener("backend-call-failed",this.backendFailedListener),this.removeEventListener("history-pushed",this.historyPushed),this.removeEventListener("route-changed",this.routeChangedListener)}shouldUpdate(e){if(this.fragment?.component&&[...e.keys()].every(i=>i==="appState"||i==="appData")){const i=this.renderRoot.querySelector("mateu-component");if(i)return e.has("appState")&&(i.appState=this.appState),e.has("appData")&&(i.appData=this.appData),!1}return!0}updated(e){(e.has("id")||e.has("baseurl")||e.has("route")||e.has("consumedRoute")||e.has("instant"))&&(this.preventNavigation||(this.callbackToken=this.instant||Z(),this.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:this.route,consumedRoute:this.consumedRoute,userData:void 0,actionId:"",serverSideType:this.serverSideType,initiatorComponentId:this.id,initiator:this,callbackToken:this.callbackToken},bubbles:!0,composed:!0})))),e.has("route")&&this.top&&(this.preventNavigation||this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.route},bubbles:!0,composed:!0}))),this.preventNavigation&&(this.preventNavigation=!1)}applyFragment(e){if(!e.component&&this.fragment?.component){this.fragment={...this.fragment,state:{...this.fragment.state??{},...e.state??{}},data:{...this.fragment.data??{},...e.data??{}}};return}this.fragment=e}render(){return o`
           ${this.fragment?.component?b(this,this.fragment?.component,this.baseUrl,this.fragment?.state??{},this.fragment?.data??{},this.appState,this.appData):d}
       `}};ae.styles=T`
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
  `;Ee([m()],ae.prototype,"consumedRoute",2);Ee([m()],ae.prototype,"serverSideType",2);Ee([m()],ae.prototype,"uriPrefix",2);Ee([m()],ae.prototype,"overrides",2);Ee([m()],ae.prototype,"homeRoute",2);Ee([m()],ae.prototype,"route",2);Ee([m()],ae.prototype,"top",2);Ee([m()],ae.prototype,"instant",2);Ee([m()],ae.prototype,"appState",2);Ee([m()],ae.prototype,"appData",2);Ee([g()],ae.prototype,"fragment",2);ae=Ee([_("mateu-ux")],ae);class Nl{constructor(){this._dirty=!1,this._installed=!1,this.message="You have unsaved changes. Are you sure you want to leave this page?",this._onDirty=()=>{this._dirty=!0},this._onClean=()=>{this._dirty=!1},this._onBeforeUnload=t=>{this._dirty&&(t.preventDefault(),t.returnValue="")}}install(){this._installed||(this._installed=!0,document.addEventListener("dirty",this._onDirty),document.addEventListener("clean",this._onClean),window.addEventListener("beforeunload",this._onBeforeUnload))}get dirty(){return this._dirty}markDirty(){this._dirty=!0}markClean(){this._dirty=!1}confirmLeave(){if(!this._dirty)return!0;const t=window.confirm(this.message);return t&&(this._dirty=!1),t}}const jt=new Nl;var ql=Object.defineProperty,Ml=Object.getOwnPropertyDescriptor,B=(e,t,i,a)=>{for(var s=a>1?void 0:a?Ml(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&ql(t,i,s),s};let q=class extends lt{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.tilesMenuOption=null,this.railOpenOption=null,this.commandPaletteOpen=!1,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0,this._commandPaletteHandler=null,this.pageCompact=!1,this._compactHandler=e=>{this.pageCompact=e.detail?.compact??!1},this.isDark=document.documentElement.getAttribute("theme")==="dark",this.chatOpen=!1,this.toggleTheme=()=>{this.isDark=!this.isDark;const e=this.isDark?"dark":"light";document.documentElement.setAttribute("theme",e),localStorage.setItem("mateu-theme",e)},this.showHideIa=()=>{this.chat&&(this.chatOpen=!this.chatOpen,this.chat.slot=this.chatOpen?"detail":"detail-hidden")},this.runAction=e=>{const i=this.renderRoot.querySelector?.("mateu-component");i&&i.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))},this.getSelectedOption=e=>{if(e)for(let t=0;t<e.length;t++){const i=e[t];if(i.selected)return i;const a=this.getSelectedOption(i.submenus);if(a)return a}return null},this.itemSelected=e=>{const t=e.detail.value;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.itemSelectedTiles=e=>{const t=e.detail.value._menuOption;t.submenus&&t.submenus.length>0?this.tilesMenuOption=t:(this.tilesMenuOption=null,this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix))},this.mapItemsForTiles=e=>e.map(t=>({text:t.label,consumedRoute:t.consumedRoute,route:t.route,baseUrl:t.baseUrl,serverSideType:t.serverSideType,uriPrefix:t.uriPrefix,actionId:t.actionId,selected:t.selected,_menuOption:t})),this.flattenMenuForPalette=(e,t)=>{const i=[];for(const a of e)if(!a.separator)if(a.submenus&&a.submenus.length>0){const s=t?`${t} › ${a.label}`:a.label;i.push(...this.flattenMenuForPalette(a.submenus,s))}else i.push({label:a.label,breadcrumb:t,consumedRoute:a.consumedRoute,route:a.route,actionId:a.actionId,baseUrl:a.baseUrl,serverSideType:a.serverSideType,uriPrefix:a.uriPrefix});return i},this.handleCommandPaletteKeydown=(e,t)=>{if(e.key==="ArrowDown")e.preventDefault(),this.commandPaletteSelectedIndex=Math.min(this.commandPaletteSelectedIndex+1,Math.min(t.length,10)-1);else if(e.key==="ArrowUp")e.preventDefault(),this.commandPaletteSelectedIndex=Math.max(this.commandPaletteSelectedIndex-1,0);else if(e.key==="Enter"){const i=t[this.commandPaletteSelectedIndex];i&&(this.selectRoute(i.consumedRoute,i.route,i.actionId,i.baseUrl,i.serverSideType,i.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery="")}},this.renderCommandPalette=()=>{if(!this.commandPaletteOpen)return d;const e=this.component?.metadata;if(!e?.menu)return d;const t=this.flattenMenuForPalette(e.menu,""),i=this.commandPaletteQuery.toLowerCase(),a=i?t.filter(s=>s.label.toLowerCase().includes(i)||s.breadcrumb.toLowerCase().includes(i)):t;return o`
            <div class="cmd-backdrop" @click=${()=>{this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}>
                <div class="cmd-palette" @click=${s=>s.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        <vaadin-icon icon="vaadin:search" class="cmd-search-icon"></vaadin-icon>
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${s=>{this.commandPaletteQuery=s.target.value,this.commandPaletteSelectedIndex=0}}
                            @keydown=${s=>this.handleCommandPaletteKeydown(s,a)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${a.slice(0,10).map((s,r)=>o`
                            <div class="cmd-result ${r===this.commandPaletteSelectedIndex?"cmd-result--selected":""}"
                                @click=${()=>{this.selectRoute(s.consumedRoute,s.route,s.actionId,s.baseUrl,s.serverSideType,s.uriPrefix),this.commandPaletteOpen=!1,this.commandPaletteQuery=""}}
                                @mouseenter=${()=>{this.commandPaletteSelectedIndex=r}}
                            >
                                <span class="cmd-result-label">${s.label}</span>
                                ${s.breadcrumb?o`<span class="cmd-result-breadcrumb">${s.breadcrumb}</span>`:d}
                            </div>
                        `)}
                        ${a.length===0?o`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>`:d}
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
                ${e.icon?o`<vaadin-icon icon="${e.icon}" class="rail-icon"></vaadin-icon>`:o`<div class="rail-icon-placeholder">${e.label.charAt(0).toUpperCase()}</div>`}
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
                            ${t.icon?o`<vaadin-icon icon="${t.icon}" style="font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;"></vaadin-icon>`:d}
                            <div class="nav-tile-title">${t.label}</div>
                            ${t.description?o`<div class="nav-tile-desc">${t.description}</div>`:d}
                        </div>
                    `)}
                </div>
            </div>
        `,this.goHome=()=>{const e=this.component.metadata;this.selectRoute(e.route,"_page","",void 0,void 0,void 0)},this.selectRoute=(e,t,i,a,s,r)=>{jt.confirmLeave()&&this._selectRoute(e,t,i,a,s,r)},this._selectRoute=(e,t,i,a,s,r)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=a,this.selectedRoute=t,this.selectedServerSideType=s,this.selectedUriPrefix=r,this.instant=Z(),this.state&&this.state._route!=null&&(this.state._route=void 0);let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(n+t);if(e&&l.pathname.startsWith(e)){const c=l.pathname.substring(e.length);l=new URL(l.origin+(c||"/"))}if((window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="/_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.mapItems=(e,t)=>e.map(i=>{if(i.submenus&&i.submenus.length>0){let a=this.mapItems(i.submenus,t);return t&&i.label.toLowerCase().includes(t)&&(a=this.mapItems(i.submenus,"")),a&&a.length>0?{consumedRoute:i.consumedRoute,text:i.label,route:i.route,baseUrl:i.baseUrl,serverSideType:i.serverSideType,uriPrefix:i.uriPrefix,actionId:i.actionId,selected:t||i.selected,children:a}:void 0}if(i.separator)return t?void 0:{component:"hr"};if(!t||i.label.toLowerCase().includes(t))return{consumedRoute:i.consumedRoute,text:i.label,route:i.route,baseUrl:i.baseUrl,serverSideType:i.serverSideType,uriPrefix:i.uriPrefix,actionId:i.actionId,selected:t||i.selected}}).filter(i=>i!=null),this.getSelectedIndex=e=>{if(e){const t=this.getSelectedOption(e);if(t)return e.indexOf(t)}return NaN},this.renderOptionOnLeftMenu=e=>e.submenus&&e.submenus.length>0?o`
                <vaadin-details summary="${e.label}" theme="reverse">
                    <vaadin-vertical-layout>
                        ${e.submenus.map(t=>o`${this.renderOptionOnLeftMenu(t)}`)}
                    </vaadin-vertical-layout>
                </vaadin-details>
`:o`<vaadin-button theme="tertiary" 
                @click="${()=>this.selectRoute(e.consumedRoute,e.route,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix)}"
        >${e.label}</vaadin-button>`,this.navItemSelected=e=>{if(e.path==this.selectedRoute&&e.consumedRoute==this.selectedConsumedRoute&&e.baseUrl==this.selectedBaseUrl&&e.serverSideType==this.selectedServerSideType){const t=this.shadowRoot?.querySelector("mateu-ux");t&&t.setAttribute("instant",Z())}else this.selectRoute(e.consumedRoute,e.path,e.actionId,e.baseUrl,e.serverSideType,e.uriPrefix);this.component.metadata.drawerClosed&&this.vaadinAppLayout&&(this.vaadinAppLayout.drawerOpened=!1)},this.renderSideNav=(e,t)=>e?o`
            ${e.map(i=>{const a=i;return o`

                        ${a.component=="hr"?o`<hr slot="children"/>`:o`
                                <vaadin-side-nav-item
                                .path="${a.route&&!a.children?a.route:void 0}"
                                .pathAliases="${[this.baseUrl+(a.route?a.route:"")]}"
                                slot="${t}"
                                ?expanded="${a.selected}"
                                >
                                    ${a.icon?o`
                                        <vaadin-icon icon="vaadin:dashboard" slot="prefix"></vaadin-icon>
                                    `:d}
                                    ${a.text}
                                    ${this.renderSideNav(a.children,"children")}
                                </vaadin-side-nav-item>
                        `}

                            `})}`:d,this.updateRoute=e=>{e.preventDefault(),e.stopPropagation();var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)}}createRenderRoot(){return H.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){super.connectedCallback(),this.isDark=document.documentElement.getAttribute("theme")==="dark",this._commandPaletteHandler=e=>{(e.metaKey||e.ctrlKey)&&e.key==="k"&&(e.preventDefault(),this.commandPaletteOpen=!this.commandPaletteOpen,this.commandPaletteQuery="",this.commandPaletteSelectedIndex=0),e.key==="Escape"&&this.commandPaletteOpen&&(this.commandPaletteOpen=!1,this.commandPaletteQuery="")},document.addEventListener("keydown",this._commandPaletteHandler),jt.install(),this.addEventListener("compact-changed",this._compactHandler)}disconnectedCallback(){super.disconnectedCallback(),this._commandPaletteHandler&&document.removeEventListener("keydown",this._commandPaletteHandler),this.removeEventListener("compact-changed",this._compactHandler)}updated(e){if(super.updated(e),this.component){const i=this.component.metadata;if(i){const a=i;if(a.favicon){let s=document.querySelector("link[rel~='icon']");s||(s=document.createElement("link"),s.rel="icon",document.head.appendChild(s)),s.href=a.favicon}e.has("component")&&(this.selectedRoute=a.homeRoute,this.selectedConsumedRoute=a.homeConsumedRoute,this.selectedServerSideType=a.homeServerSideType,this.selectedBaseUrl=a.homeBaseUrl,this.selectedUriPrefix=a.homeUriPrefix)}}e.has("commandPaletteOpen")&&this.commandPaletteOpen&&setTimeout(()=>{this.renderRoot.querySelector(".cmd-input")?.focus()},0)}render(){return H.get()?.renderAppComponent(this,this.component,this.baseUrl,this.state,this.data,this.appState,this.appData)}};q.styles=T`

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

  `;B([g()],q.prototype,"filter",2);B([g()],q.prototype,"instant",2);B([g()],q.prototype,"selectedConsumedRoute",2);B([g()],q.prototype,"selectedRoute",2);B([g()],q.prototype,"selectedUriPrefix",2);B([g()],q.prototype,"selectedBaseUrl",2);B([g()],q.prototype,"selectedServerSideType",2);B([g()],q.prototype,"selectedParams",2);B([g()],q.prototype,"tilesMenuOption",2);B([g()],q.prototype,"railOpenOption",2);B([g()],q.prototype,"commandPaletteOpen",2);B([g()],q.prototype,"commandPaletteQuery",2);B([g()],q.prototype,"commandPaletteSelectedIndex",2);B([g()],q.prototype,"pageCompact",2);B([Me("mateu-chat")],q.prototype,"chat",2);B([g()],q.prototype,"isDark",2);B([g()],q.prototype,"chatOpen",2);B([Me("vaadin-app-layout")],q.prototype,"vaadinAppLayout",2);q=B([_("mateu-app")],q);var Ul=Object.defineProperty,Bl=Object.getOwnPropertyDescriptor,Ye=(e,t,i,a)=>{for(var s=a>1?void 0:a?Bl(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Ul(t,i,s),s};let Pe=class extends q{constructor(){super(...arguments),this.filter="",this.instant=void 0,this.selectedConsumedRoute=void 0,this.selectedRoute=void 0,this.selectedUriPrefix=void 0,this.selectedBaseUrl=void 0,this.selectedServerSideType=void 0,this.selectedParams=void 0,this.lastActionServerSideType=void 0,this.lastActionInitiatorComponentId=void 0,this.captureActionSST=e=>{const t=e.detail;t?.serverSideType&&(this.lastActionServerSideType=t.serverSideType,this.lastActionInitiatorComponentId=t.initiatorComponentId)},this.handleUnhandledAction=e=>{const t=e.detail;e.preventDefault(),e.stopPropagation();const i=this.shadowRoot?.querySelector("#ux_"+this.id);!i||typeof i.manageActionEvent!="function"||(this.lastActionServerSideType=this.selectedServerSideType,this.lastActionInitiatorComponentId=i.id,i.manageActionEvent(new CustomEvent("server-side-action-requested",{detail:{route:i.route??this.selectedRoute??"",consumedRoute:i.consumedRoute??this.selectedConsumedRoute??"",componentState:t.parameters?.initiatorState??{},parameters:t.parameters,actionId:t.actionId,serverSideType:this.selectedServerSideType??"",initiatorComponentId:i.id,initiator:i}})))},this.selectRoute=(e,t,i,a,s,r)=>{{this.selectedConsumedRoute=e,this.selectedBaseUrl=a,this.selectedRoute=t,this.selectedServerSideType=s,this.selectedUriPrefix=r,this.instant=Z();let n=this.baseUrl??"";n.indexOf("://")<0&&(n.startsWith("/")||(n="/"+n),n=window.location.origin+n),n.endsWith("/")&&(t??"").startsWith("/")&&(t=(t??"").substring(1));let l=new URL(n+t);if(e&&(t??"").startsWith(e)&&(l=new URL(n+t?.substring(e.length))),(window.location.pathname||l.pathname)&&window.location.pathname!=l.pathname){let c=l.pathname;l.search&&(c+=l.search),c&&!c.startsWith("/")&&(c="/"+c),this.baseUrl&&c.startsWith(this.baseUrl)&&(c=c.substring(this.baseUrl.length));let u=c;this.selectedUriPrefix&&(u.startsWith("/")&&this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+u.substring(1):!u.startsWith("/")&&!this.selectedUriPrefix.endsWith("/")?u=this.selectedUriPrefix+"/"+u:u=this.selectedUriPrefix+u),u=="_page"&&(u=""),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:u},bubbles:!0,composed:!0}))}}},this.updateRoute=e=>{e.preventDefault(),e.stopPropagation(),console.log("update route",e,this);var t=e.detail;this.selectRoute(t.consumedRoute,t.route,t.actionId,t.baseUrl,t.serverSideType,t.uriPrefix)},this.tabSelected=(e,t,i,a)=>{const s=e.detail.tab.dataset.route,r=a.menu.find(n=>n.route===s||n.path===s);r&&this.selectRoute(r.consumedRoute,r.route,r.actionId,r.baseUrl,r.serverSideType,r.uriPrefix)},this.mode=ri.Auto,this.toggle=e=>{this.mode=this.mode==ri.Expanded?ri.Collapsed:ri.Expanded,e.requestUpdate()},this.findMenuOption=(e,t)=>{for(const i of e){if(i.route===t||i.path===t||i.consumedRoute===t)return i;if(i.submenus?.length){const a=this.findMenuOption(i.submenus,t);if(a)return a}}},this.selected=(e,t,i,a)=>{const s=e.detail.item.dataset.route,r=this.findMenuOption(a.menu,s);r&&this.selectRoute(r.consumedRoute,r.route,r.actionId,r.baseUrl,r.serverSideType,r.uriPrefix)},this.renderSubmenu=e=>o`
                    ${e.submenus&&e.submenus.length>0?o`
                        <ui5-side-navigation-item text="${e.label}" ?unselectable="${e.submenus&&e.submenus.length>0}"
                                                  data-path="${e.path}"
                                                  data-route="${e.route}"
                                                  data-consumed-route="${e.consumedRoute}"
                                                  data-action-id="${e.actionId}"
                                                  data-server-side-type="${e.serverSideType}"
                                                  data-uri-prefix="${e.uriPrefix}"
                                                  data-base-url="${e.baseUrl}"
                        >
                            ${e.submenus.filter(t=>!t.separator).map(t=>o`
                                <ui5-side-navigation-sub-item text="${t.label}"
                                                              data-path="${t.path}"
                                                              data-route="${t.route}"
                                                              data-consumed-route="${t.consumedRoute}"
                                                              data-action-id="${t.actionId}"
                                                              data-server-side-type="${t.serverSideType}"
                                                              data-uri-prefix="${t.uriPrefix}"
                                                              data-base-url="${t.baseUrl}"
                                ></ui5-side-navigation-sub-item>
                            `)}
                        </ui5-side-navigation-item>
                    `:o`

                        <ui5-side-navigation-item text="${e.label}"
                                                  data-path="${e.path}"
                                                  data-route="${e.route}"
                                                  data-consumed-route="${e.consumedRoute}"
                                                  data-action-id="${e.actionId}"
                                                  data-server-side-type="${e.serverSideType}"
                                                  data-uri-prefix="${e.uriPrefix}"
                                                  data-base-url="${e.baseUrl}"
                        ></ui5-side-navigation-item>

                    `}
                `,this.renderMenu=e=>o`
                    ${e.submenus&&e.submenus.length>0?o`
                        <ui5-side-navigation-group text="${e.label}">
                            ${e.submenus.filter(t=>!t.separator).map(t=>this.renderSubmenu(t))}
                        </ui5-side-navigation-group>

                    `:o`

                        <ui5-side-navigation-item text="${e.label}"
                                                  data-path="${e.path}"
                                                  data-route="${e.route}"
                                                  data-consumed-route="${e.consumedRoute}"
                                                  data-action-id="${e.actionId}"
                                                  data-server-side-type="${e.serverSideType}"
                                                  data-uri-prefix="${e.uriPrefix}"
                                                  data-base-url="${e.baseUrl}"
                                                  icon="home"
                        ></ui5-side-navigation-item>

                    `}
                `}connectedCallback(){super.connectedCallback(),this.addEventListener("server-side-action-requested",this.captureActionSST,!0),this.addEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription=at.subscribe(e=>{if(e.fragment){const t=e.fragment;if(this.lastActionInitiatorComponentId&&t.targetComponentId===this.lastActionInitiatorComponentId&&t.state?._route!==void 0){const i=t.state._route;if(i!==""&&!i.startsWith("/")){this.lastActionInitiatorComponentId=void 0,this.lastActionServerSideType=void 0;return}const a=t.state._componentRoute||"";a&&(this.selectedConsumedRoute=a);const s=this.component?.metadata,r=a||j(this,s)||"";a||(this.selectedConsumedRoute=r||this.selectedConsumedRoute);const n=r+i;this.lastActionInitiatorComponentId=void 0,n!==this.selectedRoute&&(this.selectedRoute=n,this.lastActionServerSideType&&(this.selectedServerSideType=this.lastActionServerSideType),this.instant=Z()),this.lastActionServerSideType=void 0}}})}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("server-side-action-requested",this.captureActionSST,!0),this.removeEventListener("action-requested",this.handleUnhandledAction),this.innerFragmentSubscription?.unsubscribe()}render(){const e=this.component?.metadata;return e.variant==ge.MEDIATOR?o`
                        <mateu-api-caller>
                            <mateu-ux
                                    route="${$e(this.state,this,e)}"
                                    id="ux_${this.id}"
                                    baseUrl="${re(this,e)}"
                                    consumedRoute="${j(this,e)}"
                                    serverSideType="${oe(this,e)}"
                                    uriPrefix="${ne(this,e)}"
                                    style="width: 100%;"
                                    .appState="${this.appState}"
                                    .appData="${this.appData}"
                                    instant="${this.instant}"
                                    @navigation-requested="${this.updateRoute}"
                            ></mateu-ux>
                        </mateu-api-caller>
`:ge.TABS==e.variant?o`

                <ui5-tabcontainer
                        @tab-select="${t=>this.tabSelected(t,this,this.baseUrl??"",e)}"
                >
                    ${e.menu.map(t=>o`
                        <ui5-tab ?icon="${t.icon}"
                                 text="${t.label}"
                                 data-path="${t.path}"
                                 data-route="${t.route}"
                                 data-consumed-route="${t.consumedRoute}"
                                 data-action-id="${t.actionId}"
                                 data-server-side-type="${t.serverSideType}"
                                 data-uri-prefix="${t.uriPrefix}"
                                 data-base-url="${t.baseUrl}"
                                 data-params="${t.params}"
                                 ?selected="${this.selectedRoute==t.path||this.selectedRoute==this.selectedConsumedRoute&&this.selectedRoute==e.homeRoute}"
                        >

                            ${this.selectedRoute==t.path||this.selectedRoute==this.selectedConsumedRoute&&t.path==e.homeRoute?o`
                                <div class="content" style="flex-grow: 1; width: 100%; height: 100%;">
                                    <mateu-api-caller style="width: 100%;">
                                        <mateu-ux
                                                route="${$e(this.state,this,e)}"
                                                id="ux_${this.id}"
                                                baseUrl="${re(this,e)}"
                                                consumedRoute="${j(this,e)}"
                                                serverSideType="${oe(this,e)}"
                                                uriPrefix="${ne(this,e)}"
                                                style="width: 100%;"
                                                .appState="${this.appState}"
                                                .appData="${this.appData}"
                                                instant="${this.instant}"
                                                @navigation-requested="${this.updateRoute}"
                                        ></mateu-ux>
                                    </mateu-api-caller>
                                </div>
                            `:d}
                        </ui5-tab>
                    `)}
                </ui5-tabcontainer>

            `:ge.MENU_ON_LEFT==e.variant?o`
        <div style="display: flex; width: 100%; height: 100%;">
            <ui5-side-navigation id="snx"
                                 @selection-change="${t=>this.selected(t,this,this.baseUrl??"",e)}"
                                 style="flex-grow: 0;">
                <!-- Items -->
                ${e.menu.map(t=>o`
                    ${t.submenus?o`

                        <ui5-side-navigation-item text="${t.label}"
                                                  ?unselectable="${t.submenus&&t.submenus.length>0}"
                                                  data-path="${t.path}"
                                                  data-route="${t.route}"
                                                  data-consumed-route="${t.consumedRoute}"
                                                  data-action-id="${t.actionId}"
                                                  data-server-side-type="${t.serverSideType}"
                                                  data-uri-prefix="${t.uriPrefix}"
                                                  data-base-url="${t.baseUrl}"
                        >
                            ${t.submenus.map(i=>o`
                                <ui5-side-navigation-sub-item text="${i.label}"
                                                              data-path="${i.path}"
                                                              data-route="${i.route}"
                                                              data-consumed-route="${i.consumedRoute}"
                                                              data-action-id="${i.actionId}"
                                                              data-server-side-type="${i.serverSideType}"
                                                              data-uri-prefix="${i.uriPrefix}"
                                                              data-base-url="${i.baseUrl}"
                                ></ui5-side-navigation-sub-item>
                            `)}
                        </ui5-side-navigation-item>

                    `:o`

                        <ui5-side-navigation-item text="${t.label}"
                                                  data-path="${t.path}"
                                                  data-route="${t.route}"
                                                  data-consumed-route="${t.consumedRoute}"
                                                  data-action-id="${t.actionId}"
                                                  data-server-side-type="${t.serverSideType}"
                                                  data-uri-prefix="${t.uriPrefix}"
                                                  data-base-url="${t.baseUrl}"
                                                  icon="home"
                        ></ui5-side-navigation-item>

                    `}
                `)}

            </ui5-side-navigation>

            <div class="content" style="flex-grow: 1; width: 100%; height: 100%;">
                <mateu-api-caller style="width: 100%;">
                    <mateu-ux
                            route="${$e(this.state,this,e)}"
                            id="ux_${this.id}"
                            baseUrl="${re(this,e)}"
                            consumedRoute="${j(this,e)}"
                            serverSideType="${oe(this,e)}"
                            uriPrefix="${ne(this,e)}"
                            style="width: 100%;"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                            instant="${this.instant}"
                            @navigation-requested="${this.updateRoute}"
                    ></mateu-ux>
                </mateu-api-caller>
            </div>

        </div>
        `:o`
        <ui5-navigation-layout id="nl1" mode="${this.mode}" style="height: 100vh;">
            <ui5-shellbar
                    slot="header"
                    secondary-title="The Best Run SAP"
            >
                <ui5-shellbar-branding slot="branding" @click="${()=>this.goHome()}" style="cursor: pointer;">${e.title}</ui5-shellbar-branding>
                <ui5-button icon="menu" slot="startButton" id="startButton" @click="${()=>this.toggle(this)}"></ui5-button>
            </ui5-shellbar>
            <ui5-side-navigation id="sn1" slot="sideContent" @selection-change="${t=>this.selected(t,this,this.baseUrl??"",e)}" collapsed>
                <!-- Items -->
                ${e.menu.map(t=>this.renderMenu(t))}
                <!-- Fixed Items -->
                <ui5-side-navigation-item slot="fixedItems"
                                          text="Legal"
                                          href="https://www.sap.com/about/legal/impressum.html"
                                          target="_blank"
                                          unselectable
                                          icon="compare"></ui5-side-navigation-item>
                <ui5-side-navigation-item slot="fixedItems"
                                          text="Privacy"
                                          href="https://www.sap.com/about/legal/privacy.html"
                                          target="_blank"
                                          unselectable
                                          icon="locked"></ui5-side-navigation-item>
            </ui5-side-navigation>
            <div class="content" style="">
                <mateu-api-caller style="width: 100%;">
                    <mateu-ux
                            route="${$e(this.state,this,e)}"
                            id="ux_${this.id}"
                            baseUrl="${re(this,e)}"
                            consumedRoute="${j(this,e)}"
                            serverSideType="${oe(this,e)}"
                            uriPrefix="${ne(this,e)}"
                            style="width: 100%;"
                            .appState="${this.appState}"
                            .appData="${this.appData}"
                            instant="${this.instant}"
                            @navigation-requested="${this.updateRoute}"
                    ></mateu-ux>
                </mateu-api-caller>
            </div>
        </ui5-navigation-layout>`}};Pe.styles=T`
        ::part(tabstrip) {
            height: 4rem;
            top: 0rem;
        }
        .ui5-tc__tabStrip {
            padding: 2rem;
        }
        ::part(content) {
            padding: 0;
            top: -10px;
        }
  `;Ye([g()],Pe.prototype,"filter",2);Ye([g()],Pe.prototype,"instant",2);Ye([g()],Pe.prototype,"selectedConsumedRoute",2);Ye([g()],Pe.prototype,"selectedRoute",2);Ye([g()],Pe.prototype,"selectedUriPrefix",2);Ye([g()],Pe.prototype,"selectedBaseUrl",2);Ye([g()],Pe.prototype,"selectedServerSideType",2);Ye([g()],Pe.prototype,"selectedParams",2);Pe=Ye([_("mateu-sapui5-app")],Pe);const jl=(e,t,i,a,s)=>{const r=t.metadata;return o`
        <mateu-sapui5-app
                id="${e.id}_app"
                route="${r.homeRoute}"
                consumedRoute="${r.route}"
                baseUrl="${i}"
                .component="${t}"
                style="width: 100%;"
        ></mateu-sapui5-app>
    `},Wl=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`
        
        <mateu-sapui5-form 
            baseUrl="${i}"
                .component="${t}"
                .values="${a}"
                .state="${a}"
                .data="${s}"
            .appState="${r}"
            .appData="${n}"
                style="${t.style}" 
                class="${t.cssClasses}"
                slot="${t.slot??d}"
                >
                    ${t.children?.map(c=>b(e,c,i,a,s,r,n))}
            
                            ${l?.toolbar?.map(c=>o`
                   ${b(e,{metadata:c,type:U.ClientSide,slot:"toolbar"},i,a,s,r,n)}
                `)}
            
            
                ${l?.buttons?.map(c=>o`
                   ${b(e,{metadata:c,type:U.ClientSide,slot:"buttons"},i,a,s,r,n)}

                `)}

                </mateu-sapui5-form>
        
    
    `},Vl=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`
        <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">

            ${l?.title&&!l.noHeader?o`
                <ui5-title>${l.title}</ui5-title>
                ${l?.subtitle?o`<p style="color: var(--sapContent_LabelColor); margin: 0;">${l.subtitle}</p>`:d}
            `:d}

            ${l?.toolbar?.length>0?o`
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${l.toolbar.map(c=>b(e,{metadata:c,type:U.ClientSide},i,a,s,r,n))}
                </div>
            `:d}

            ${t.children?.map(c=>b(e,c,i,a,s,r,n))}

            ${l?.buttons?.length>0?o`
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--sapGroup_ContentBorderColor);">
                    ${l.buttons.map(c=>b(e,{metadata:c,type:U.ClientSide},i,a,s,r,n))}
                </div>
            `:d}
        </div>`},Ci=(e,t)=>e?e.includes("${")&&t._evalTemplate?t._evalTemplate(e):e:"",Hl=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=Ci(l.title,e);return o`
        <ui5-panel header-text="${c||d}" fixed
                   style="margin-bottom: 1rem; ${t.style??""}"
                   class="${t.cssClasses??d}"
                   slot="${t.slot??d}">
            <div style="display:flex; flex-direction:column; gap:.5rem; padding:.25rem 0;">
                ${t.children?.map(u=>b(e,u,i,a,s,r,n))}
            </div>
        </ui5-panel>`},Gl=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=Ci(l.title,e);return o`
        <div style="margin: .5rem 0; ${t.style??""}" class="${t.cssClasses??d}" slot="${t.slot??d}">
            ${c?o`<ui5-title level="H5" style="margin-bottom:.25rem;">${c}</ui5-title>`:d}
            <div style="display:flex; flex-direction:column; gap:.5rem;">
                ${t.children?.map(u=>b(e,u,i,a,s,r,n))}
            </div>
        </div>`},Kl=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=v=>v?b(e,v,i,a,s,r,n):d,u=typeof l.title=="string"?l.title:"",p=l.title&&typeof l.title=="object";return o`
        <ui5-card style="${t.style??""}" class="${t.cssClasses??d}" slot="${t.slot??d}">
            ${u||l.subtitle?o`
                <ui5-card-header slot="header"
                                 title-text="${u||d}"
                                 subtitle-text="${(typeof l.subtitle=="string"?l.subtitle:"")||d}">
                </ui5-card-header>`:d}
            <div style="padding: 1rem;">
                ${p?c(l.title):d}
                ${c(l.content)}
                ${t.children?.map(v=>b(e,v,i,a,s,r,n))}
                ${c(l.footer)}
            </div>
        </ui5-card>`},Jl=e=>{const t=e.metadata;return o`<ui5-link href="${t.url??"#"}" slot="${e.slot??d}">${t.text??t.url??""}</ui5-link>`},Ri=(e,t)=>{t&&e?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t,parameters:{}},bubbles:!0,composed:!0}))},Yl=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=Ci(l.headerTitle,e),u=p=>p?b(e,p,i,a,s,r,n):d;return o`
        <ui5-dialog open header-text="${c||d}">
            ${u(l.content)}
            ${t.children?.map(p=>b(e,p,i,a,s,r,n))}
            ${l.footer?o`<div slot="footer" style="display:flex; gap:.5rem; padding:.5rem; justify-content:flex-end;">${u(l.footer)}</div>`:d}
        </ui5-dialog>`},Xl=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=Ci(l.header,e),u=l.content?b(e,l.content,i,a,s,r,n):d;return o`
        <ui5-dialog open header-text="${c||d}">
            ${u}
            <div slot="footer" style="display:flex; gap:.5rem; padding:.5rem; justify-content:flex-end;">
                ${l.canCancel?o`<ui5-button @click="${p=>Ri(p.target,l.cancelActionId)}">${l.cancelText??"Cancel"}</ui5-button>`:d}
                ${l.canReject?o`<ui5-button @click="${p=>Ri(p.target,l.rejectActionId)}">${l.rejectText??"No"}</ui5-button>`:d}
                <ui5-button design="Emphasized" @click="${p=>Ri(p.target,l.confirmActionId)}">${l.confirmText??"OK"}</ui5-button>
            </div>
        </ui5-dialog>`},Ql=e=>{const t=e.metadata,i=t.abbreviation||(t.name?t.name.split(/\s+/).map(a=>a[0]).slice(0,2).join(""):"");return o`
        <ui5-avatar slot="${e.slot??d}"
                    initials="${i||d}"
                    accessible-name="${t.name??d}">
            ${t.image?o`<img src="${t.image}" />`:d}
        </ui5-avatar>`},Zl=e=>{const i=e.metadata.avatars??[];return o`
        <ui5-avatar-group type="Group" slot="${e.slot??d}">
            ${i.map(a=>{const s=a.abbreviation||(a.name?a.name.split(/\s+/).map(r=>r[0]).slice(0,2).join(""):"");return o`<ui5-avatar initials="${s||d}" accessible-name="${a.name??d}">
                    ${a.image?o`<img src="${a.image}" />`:d}
                </ui5-avatar>`})}
        </ui5-avatar-group>`},ed=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`
        <span title="${l.text??""}" slot="${t.slot??d}">
            ${l.wrapped?b(e,l.wrapped,i,a,s,r,n):d}
        </span>`},td=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`
        <ui5-carousel
                ?cyclic="${l.auto??!1}"
                arrows-placement="${l.alt?"Navigation":d}"
                style="${t.style??""}"
                class="${t.cssClasses??d}"
                slot="${t.slot??d}">
            ${t.children?.map(c=>b(e,c,i,a,s,r,n))}
        </ui5-carousel>`},id=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=`pop-opener-${t.id}`,u=p=>{const f=p.target.getRootNode().querySelector(`#pop-${t.id}`);f&&(f.opener=c,f.open=!0)};return o`
        <span slot="${t.slot??d}">
            <span id="${c}" @click="${u}" style="cursor:pointer;">
                ${l.wrapped?b(e,l.wrapped,i,a,s,r,n):d}
            </span>
            <ui5-popover id="pop-${t.id}">
                <div style="padding:.5rem;">
                    ${l.content?b(e,l.content,i,a,s,r,n):d}
                </div>
            </ui5-popover>
        </span>`},ad=(e,t)=>{const a=t.metadata.options??[],s=n=>{n&&e.dispatchEvent(new CustomEvent("update-route",{detail:{route:n},bubbles:!0,composed:!0}))},r=n=>{if(n.submenus&&n.submenus.length>0){const l=`menu-${t.id}-${n.label}`,c=u=>{const v=u.target.getRootNode().querySelector(`#${CSS.escape(l)}`);v&&(v.opener=u.target,v.open=!0)};return o`
                <ui5-button design="Transparent" icon="${n.icon||d}" @click="${c}">${n.label}</ui5-button>
                <ui5-menu id="${l}">
                    ${n.submenus.map(u=>o`
                        <ui5-menu-item text="${u.label}" icon="${u.icon||d}"
                                       @click="${()=>s(u.path)}"></ui5-menu-item>`)}
                </ui5-menu>`}return o`<ui5-button design="Transparent" icon="${n.icon||d}" @click="${()=>s(n.path)}">${n.label}</ui5-button>`};return o`
        <div style="display:flex; flex-direction:row; gap:.25rem; align-items:center;"
             slot="${t.slot??d}">
            ${a.map(r)}
        </div>`},sd=(e,t,i,a,s,r,n)=>{const l=t.metadata;let c=t.style??"";l?.fullWidth&&(c+="width: 100%;"),l?.justification&&(c+=`justify-content: ${l.justification};`),l?.verticalAlignment&&(c+=`align-items: ${l.verticalAlignment};`);const u=l?.spacing?"1rem":"0";return o`
        <div style="display: flex; flex-direction: row; flex-wrap: ${l?.wrap?"wrap":"nowrap"}; gap: ${u}; ${c}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(p=>b(e,p,i,a,s,r,n))}
        </div>`},rd=(e,t,i,a,s,r,n)=>{const l=t.metadata;let c=t.style??"";l?.fullWidth&&(c+="width: 100%;"),l?.justification&&(c+=`justify-content: ${l.justification};`),l?.horizontalAlignment&&(c+=`align-items: ${l.horizontalAlignment};`);const u=l?.spacing?"1rem":"0";return o`
        <div style="display: flex; flex-direction: column; gap: ${u}; ${c}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(p=>b(e,p,i,a,s,r,n))}
        </div>`},Ya=(e,t,i,a,s,r,n,l)=>{const c=t;if(c.type===U.ClientSide&&c.metadata?.type===h.FormRow)return o`${c.children?.map(u=>Ya(e,u,i,a,s,r,n,l))}`;if(c.type===U.ClientSide&&c.metadata?.type===h.FormField){const p=c.metadata?.colspan??1;if(p>1)return o`<div style="grid-column: span ${Math.min(p,l)};">
                ${b(e,t,i,a,s,r,n)}
            </div>`}return b(e,t,i,a,s,r,n)},od=(e,t,i,a,s,r,n)=>o`${t.children?.map(l=>b(e,l,i,a,s,r,n))}`,nd=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=l?.maxColumns&&l.maxColumns>0?l.maxColumns:2;let u=t.style??"";return l?.fullWidth&&(u+="width: 100%;"),o`
        <div style="display: grid; grid-template-columns: repeat(${c}, 1fr); gap: 1rem; ${u}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(p=>Ya(e,p,i,a,s,r,n,c))}
        </div>`},ld=(e,t,i,a,s,r,n)=>{const l=t.metadata;let c=t.style??"";return l?.fullWidth&&(c+="width: 100%;"),o`
        <ui5-tabcontainer
            style="${c}"
            class="${t.cssClasses??d}"
            slot="${t.slot??d}"
        >
            ${t.children?.map(u=>{const p=u,v=p.metadata;return o`
                    <ui5-tab text="${v?.label??""}">
                        ${p.children?.map(f=>b(e,f,i,a,s,r,n))}
                    </ui5-tab>`})}
        </ui5-tabcontainer>`},dd=(e,t,i,a,s,r,n)=>{const l=t.metadata;let c=t.style??"";return l?.fullWidth&&(c+="width: 100%;"),o`
        <div style="${c}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(u=>{const p=u,v=p.metadata;return o`
                    <ui5-panel
                        header-text="${v?.label??""}"
                        ?collapsed="${!v?.active}"
                        ?disabled="${v?.disabled}"
                        style="margin-bottom: 0.5rem;"
                    >
                        ${p.children?.map(f=>b(e,f,i,a,s,r,n))}
                    </ui5-panel>`})}
        </div>`},cd=(e,t,i,a,s,r,n)=>o`
        <div style="display: flex; gap: 1rem; ${t.style??""}"
             slot="${t.slot??d}">
            <div style="flex: 1;">${t.children?.[0]?b(e,t.children[0],i,a,s,r,n):d}</div>
            <div style="flex: 1;">${t.children?.[1]?b(e,t.children[1],i,a,s,r,n):d}</div>
        </div>`,ud=(e,t,i,a,s,r,n)=>o`
        <div style="overflow: auto; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
        </div>`,hd=(e,t,i,a,s,r,n)=>o`
        <div style="width: 100%; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
        </div>`,pd=(e,t,i,a,s,r,n)=>o`
        <div style="max-width: 800px; margin: auto; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
        </div>`,md=(e,t,i,a,s,r,n)=>o`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; ${t.style??""}"
             class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
        </div>`,vd=(e,t,i,a,s,r,n)=>o`
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; ${t.style??""}"
             class="${t.cssClasses??d}">
            ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
        </div>`,fd=(e,t,i,a,s,r,n)=>{const c=t.metadata?.boardCols,u=c?`flex: ${c}; ${t.style??""}`:`flex: 1; ${t.style??""}`;return o`
        <div style="${u}" class="${t.cssClasses??d}">
            ${t.children?.map(p=>b(e,p,i,a,s,r,n))}
        </div>`},bd=(e,t,i,a,s)=>{const r=e.metadata,n=r.text??"",l={id:O(e.id),style:e.style??d,class:e.cssClasses??d,slot:e.slot??d};return r.container===V.h1?o`<h1 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h1>`:r.container===V.h2?o`<h2 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h2>`:r.container===V.h3?o`<h3 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h3>`:r.container===V.h4?o`<h4 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h4>`:r.container===V.h5?o`<h5 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h5>`:r.container===V.h6?o`<h6 id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</h6>`:r.container===V.span?o`<span id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</span>`:o`<p id="${l.id}" style="${l.style}" class="${l.class}" slot="${l.slot}">${n}</p>`},gd=(e,t,i)=>{const a=e.metadata,s=a?.text??"",r=a?.color??"",n=(()=>{const l=String(r).toUpperCase();return l==="SUCCESS"?"8":l==="ERROR"||l==="DANGER"?"1":l==="WARNING"?"6":l==="INFO"?"4":l==="PRIMARY"?"5":""})();return o`
        <ui5-tag
            color-scheme="${n||d}"
            style="${e.style??d}"
            slot="${e.slot??d}"
        >${s}</ui5-tag>`},$d=e=>{const i=(e.metadata?.icon??"").replace(/^vaadin:/,"").replace(/^lumo:/,"");return o`
        <ui5-icon
            name="${i||"question-mark"}"
            style="${e.style??d}"
            class="${e.cssClasses??d}"
            slot="${e.slot??d}"
        ></ui5-icon>`},yd=e=>{const t=e.metadata,i=t?.breadcrumbs??[],a=t?.currentItemText??"";return o`
        <ui5-breadcrumbs slot="${e.slot??d}">
            ${i.map(s=>o`
                <ui5-breadcrumbs-item href="${s.link??d}">${s.text}</ui5-breadcrumbs-item>
            `)}
            ${a?o`<ui5-breadcrumbs-item>${a}</ui5-breadcrumbs-item>`:d}
        </ui5-breadcrumbs>`},xd=e=>{const t=e.metadata;return o`
        <ui5-message-strip
            design="Information"
            style="${e.style??d}"
            slot="${e.slot??d}"
        >
            ${t?.title?o`<strong>${t.title}: </strong>`:d}
            ${t?.text??""}
        </ui5-message-strip>`},wd=e=>{const t=e.metadata,i=t?.value??0,a=t?.label??`${i}%`,s=t?.valueState??"None";return o`
        <ui5-progress-indicator
            value="${i}"
            value-state="${s}"
            display-value="${a}"
            style="${e.style??d}"
            slot="${e.slot??d}"
        ></ui5-progress-indicator>`},Cd=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=l?.summary??l?.label??"",u=l?.open??!1;return o`
        <ui5-panel
            header-text="${c}"
            ?collapsed="${!u}"
            style="${t.style??d}"
            class="${t.cssClasses??d}"
            slot="${t.slot??d}"
        >
            ${t.children?.map(p=>b(e,p,i,a,s,r,n))}
        </ui5-panel>`},kd=e=>{const t=e.metadata,i=t?.src??t?.url??"",a=t?.alt??"";return o`
        <img
            src="${i}"
            alt="${a}"
            style="${e.style??d}"
            class="${e.cssClasses??d}"
            slot="${e.slot??d}"
        />`},Sd=e=>{const t=e.metadata;return o`
        <mateu-markdown .content=${t.markdown}
                        style="${e.style??d}" class="${e.cssClasses??d}"
                        slot="${e.slot??d}"></mateu-markdown>`},Ed=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=(f,y)=>{e.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:f,parameters:y},bubbles:!0,composed:!0}))},u=f=>{const y=[];return f?.forEach(x=>{const $=x.metadata;$?.type===h.GridGroupColumn?y.push(...u($.columns??$.content??x.children)):$&&y.push({...$,id:$.id??x.id})}),y},p=u(l.content);if(l.tree){const f=l.page?.content??[],y=p[0],x=p.slice(1),$=E=>x.map(R=>E[R.id]!=null?`${R.label}: ${E[R.id]}`:"").filter(R=>R).join(" · "),k=E=>o`
            <ui5-tree-item
                text="${String(E[y?.id??""]??"")}"
                additional-text="${$(E)||d}"
                ?has-children="${(E.children?.length??0)>0}"
                expanded
            >
                ${E.children?.map(R=>k(R))}
            </ui5-tree-item>`;return o`
            <ui5-tree no-data-text="No data."
                      style="${t.style??"width: 100%;"}" class="${t.cssClasses??d}"
                      slot="${t.slot??d}">
                ${f.map(E=>k(E))}
            </ui5-tree>`}let v=l.page?.content??[];return t.id&&a&&a[t.id]&&(v=a[t.id]),o`
        <ui5-table no-data-text="No data." overflow-mode="Popin"
                   style="${t.style??"width: 100%;"}" class="${t.cssClasses??d}"
                   slot="${t.slot??d}">
            <ui5-table-header-row slot="headerRow">
                ${p.map(f=>o`
                    <ui5-table-header-cell width="${f.width??d}">${f.label??""}</ui5-table-header-cell>
                `)}
            </ui5-table-header-row>
            ${v.map((f,y)=>o`
                <ui5-table-row row-key="${f._rowNumber??y}">
                    ${p.map(x=>o`
                        <ui5-table-cell>${Na(f,x,c)}</ui5-table-cell>
                    `)}
                </ui5-table-row>
            `)}
        </ui5-table>`},Id=(e,t,i,a,s,r,n)=>o`
    <mateu-sapui5-table
        id="${t.id}"
        .metadata="${t.metadata}"
        .data="${s}"
        .state="${a}"
        .appState="${r}"
        .appData="${n}"
        baseUrl="${i??""}"
        style="${t.style??d}"
        class="${t.cssClasses??d}"
        slot="${t.slot??d}"
    >
        ${t.children?.map(l=>b(e,l,i,a,s,r,n))}
    </mateu-sapui5-table>`,_d=(e,t,i,a,s,r,n)=>{const c=t.metadata.page?.content??[];return o`
        <div style="overflow-y: auto; ${t.style??""}" class="${t.cssClasses??d}"
             slot="${t.slot??d}">
            ${c.map(u=>b(e,u,i,a,s,r,n))}
        </div>`},Td=(e,t,i,a,s,r,n)=>{const l=t.metadata,c=`ctx-menu-${t.id}`,u=(f,y)=>{y.path&&f?.dispatchEvent(new CustomEvent("update-route",{detail:{route:y.path},bubbles:!0,composed:!0}))},p=f=>o`
        ${f.map(y=>y.separator?o`<ui5-menu-separator></ui5-menu-separator>`:o`
                <ui5-menu-item
                    text="${y.label??""}"
                    ?disabled="${y.disabled}"
                    @click="${x=>u(x.target,y)}"
                >
                    ${y.submenus?p(y.submenus):d}
                </ui5-menu-item>`)}
    `,v=f=>{f.preventDefault();const x=f.currentTarget.getRootNode().querySelector(`#${CSS.escape(c)}`);x&&(x.opener=f.currentTarget,x.open=!0)};return o`
        <span style="${t.style??d}" class="${t.cssClasses??d}"
              slot="${t.slot??d}"
              @contextmenu="${l.activateOnLeftClick?d:v}"
              @click="${l.activateOnLeftClick?v:d}">
            ${b(e,l.wrapped,i,a,s,r,n)}
            <ui5-menu id="${c}">
                ${p(l.menu??[])}
            </ui5-menu>
        </span>`},Rd=e=>{const t=e.metadata,i=a=>a.submenus?o`
            <ui5-panel header-text="${a.label??""}" style="min-width: 12rem;">
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${a.submenus.map(s=>i(s))}
                </div>
            </ui5-panel>`:o`<ui5-link href="${a.path??d}">${a.label}</ui5-link>`;return o`
        <div style="display: flex; gap: 3rem; align-items: flex-start; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${t.menu.map(a=>i(a))}
        </div>`},Pd=(e,t,i,a,s,r,n)=>{const l=t.metadata;return o`
        <div style="${t.style??d}" class="${t.cssClasses??d}"
             slot="${t.slot??d}" data-colspan="${l.colspan||d}">
            ${l.label?o`<ui5-label show-colon>${l.label}</ui5-label>`:d}
            <div>${b(e,l.content,i,a,s,r,n)}</div>
        </div>`},Od=(e,t,i,a,s,r,n)=>{const l=t.children&&t.children.length>1?t.children[1]:null,c=s?.detailComponent??null,u=!!s?.hasDetail||!!l,p=c??l;return o`
        <div style="display: flex; gap: 0; width: 100%; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; overflow: hidden; ${t.style??""}"
             class="${t.cssClasses??d}" slot="${t.slot??d}">
            <div style="flex: 1; min-width: 0; overflow-y: auto;">
                ${b(e,t.children[0],i,a,s,r,n)}
            </div>
            <div style="flex: 1; min-width: 0; overflow-y: auto; border-left: 1px solid var(--sapNeutralBorderColor, #e5e5e5); ${u&&p?"":"display: flex; align-items: center; justify-content: center;"}">
                ${u&&p?b(e,p,i,a,s,r,n):o`<span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem; padding: 1rem;">Select an item to view details</span>`}
            </div>
        </div>`},Ld=e=>{const t=e.state?.items??e.metadata?.items??[];return o`
        <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.5rem; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            ${t.map(i=>o`
                <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                    <ui5-avatar size="XS" initials="${(i.userName??"?").split(/\s+/).map(a=>a[0]).slice(0,2).join("")}"></ui5-avatar>
                    <div>
                        ${i.userName?o`<div style="font-size: 0.75rem; color: var(--sapContent_LabelColor, #6a6d70);">${i.userName}</div>`:d}
                        <div>${i.text}</div>
                    </div>
                </div>
            `)}
        </div>`},Dd=e=>{const t=i=>{const s=i.target.parentElement?.querySelector("ui5-input"),r=s?.value??"";r&&(i.target.dispatchEvent(new CustomEvent("submit",{detail:{value:r},bubbles:!0,composed:!0})),s&&(s.value=""))};return o`
        <div style="display: flex; gap: 0.5rem; align-items: center; ${e.style??""}"
             class="${e.cssClasses??d}" slot="${e.slot??d}">
            <ui5-input placeholder="Message" style="flex: 1;"
                       @keydown="${i=>{i.key==="Enter"&&t(i)}}"></ui5-input>
            <ui5-button design="Emphasized" @click="${t}">Send</ui5-button>
        </div>`},le=e=>{const t=e.target;t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.value,fieldId:t.id},bubbles:!0,composed:!0}))},ya=e=>{const t=e.target;t.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.checked,fieldId:t.id},bubbles:!0,composed:!0}))},zd=e=>{const t=e.target.dataset.actionId;e.target?.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:t},bubbles:!0,composed:!0}))},Ad=new Set([h.App,h.Page,h.Form,h.Button,h.FormField,h.HorizontalLayout,h.VerticalLayout,h.FormLayout,h.FormRow,h.FormSection,h.FormSubSection,h.Card,h.TabLayout,h.AccordionLayout,h.SplitLayout,h.MasterDetailLayout,h.Scroller,h.FullWidth,h.Container,h.BoardLayout,h.BoardLayoutRow,h.BoardLayoutItem,h.Text,h.Badge,h.Icon,h.Breadcrumbs,h.Notification,h.ProgressBar,h.Details,h.Image,h.Anchor,h.Dialog,h.Drawer,h.ConfirmDialog,h.Avatar,h.AvatarGroup,h.Tooltip,h.CarouselLayout,h.Popover,h.MenuBar,h.ContextMenu,h.Markdown,h.Grid,h.Table,h.VirtualList,h.Directory,h.CustomField,h.MessageList,h.MessageInput,h.Crud,h.Element,h.Div,h.MicroFrontend,h.Chart,h.Bpmn,h.CookieConsent,h.Map,h.Chat,h.Workflow,h.WorkflowElk,h.FormEditor,h.MetricCard,h.Scoreboard,h.DashboardPanel,h.DashboardLayout,h.FoldoutLayout,h.HeroSection,h.EmptyState,h.Skeleton,h.Gantt]);class Fd extends $o{rendererName(){return"sapui5"}supportedClientSideTypes(){return Ad}rendersCrudLayouts(){return!0}renderClientSideComponent(t,i,a,s,r,n,l,c){return h.App==i?.metadata?.type?jl(t,i,a):h.Page==i?.metadata?.type?Wl(t,i,a,s,r,n,l):h.Form==i?.metadata?.type?Vl(t,i,a,s,r,n,l):h.Button==i?.metadata?.type?Ro(i):h.FormField==i?.metadata?.type?Ho(t,i,a,s,r):h.HorizontalLayout==i?.metadata?.type?sd(t,i,a,s,r,n,l):h.VerticalLayout==i?.metadata?.type?rd(t,i,a,s,r,n,l):h.FormLayout==i?.metadata?.type?nd(t,i,a,s,r,n,l):h.FormRow==i?.metadata?.type?od(t,i,a,s,r,n,l):h.FormSection==i?.metadata?.type?Hl(t,i,a,s,r,n,l):h.FormSubSection==i?.metadata?.type?Gl(t,i,a,s,r,n,l):h.Card==i?.metadata?.type?Kl(t,i,a,s,r,n,l):h.TabLayout==i?.metadata?.type?ld(t,i,a,s,r,n,l):h.AccordionLayout==i?.metadata?.type?dd(t,i,a,s,r,n,l):h.SplitLayout==i?.metadata?.type?cd(t,i,a,s,r,n,l):h.Scroller==i?.metadata?.type?ud(t,i,a,s,r,n,l):h.FullWidth==i?.metadata?.type?hd(t,i,a,s,r,n,l):h.Container==i?.metadata?.type?pd(t,i,a,s,r,n,l):h.BoardLayout==i?.metadata?.type?md(t,i,a,s,r,n,l):h.BoardLayoutRow==i?.metadata?.type?vd(t,i,a,s,r,n,l):h.BoardLayoutItem==i?.metadata?.type?fd(t,i,a,s,r,n,l):h.Text==i?.metadata?.type?bd(i):h.Badge==i?.metadata?.type?gd(i):h.Icon==i?.metadata?.type?$d(i):h.Breadcrumbs==i?.metadata?.type?yd(i):h.Notification==i?.metadata?.type?xd(i):h.ProgressBar==i?.metadata?.type?wd(i):h.Details==i?.metadata?.type?Cd(t,i,a,s,r,n,l):h.Image==i?.metadata?.type?kd(i):h.Anchor==i?.metadata?.type?Jl(i):h.Dialog==i?.metadata?.type?Yl(t,i,a,s,r,n,l):h.ConfirmDialog==i?.metadata?.type?Xl(t,i,a,s,r,n,l):h.Avatar==i?.metadata?.type?Ql(i):h.AvatarGroup==i?.metadata?.type?Zl(i):h.Tooltip==i?.metadata?.type?ed(t,i,a,s,r,n,l):h.CarouselLayout==i?.metadata?.type?td(t,i,a,s,r,n,l):h.Popover==i?.metadata?.type?id(t,i,a,s,r,n,l):h.MenuBar==i?.metadata?.type?ad(t,i):h.ContextMenu==i?.metadata?.type?Td(t,i,a,s,r,n,l):h.Markdown==i?.metadata?.type?Sd(i):h.Grid==i?.metadata?.type?Ed(t,i,a,s):h.Table==i?.metadata?.type?Id(t,i,a,s,r,n,l):h.VirtualList==i?.metadata?.type?_d(t,i,a,s,r,n,l):h.Directory==i?.metadata?.type?Rd(i):h.CustomField==i?.metadata?.type?Pd(t,i,a,s,r,n,l):h.MasterDetailLayout==i?.metadata?.type?Od(t,i,a,s,r,n,l):h.MessageList==i?.metadata?.type?Ld(i):h.MessageInput==i?.metadata?.type?Dd(i):super.renderClientSideComponent(t,i,a,s,r,n,l,c)}renderFilterBar(t,i,a,s,r,n,l){const c=i?.metadata,u=v=>{const{fieldId:f,value:y}=v.detail;t.state={...t.state,[f]:y}},p=v=>{const{fieldIds:f}=v.detail,y={};f?.forEach(x=>{y[x]=void 0}),y.searchText=void 0,t.state={...t.state,...y}};return o`
            <mateu-sapui5-filter-bar
                .metadata="${c}"
                .state="${t.state}"
                .data="${r}"
                .appState="${n}"
                .appData="${l}"
                baseUrl="${a??""}"
                @search-requested="${t.search}"
                @value-changed="${u}"
                @filter-reset-requested="${p}"
                @action-requested="${v=>{v.stopPropagation(),t.dispatchEvent(new CustomEvent("action-requested",{detail:v.detail,bubbles:!0,composed:!0}))}}"
            >
                ${c?.header?.map(v=>b(t,v,a,s,r,n,l))}
            </mateu-sapui5-filter-bar>
        `}renderPagination(t,i){const a=t.id;return o`
            <mateu-sapui5-pagination
                totalElements="${t.data[a]?.page?.totalElements??0}"
                pageSize="${t.data[a]?.page?.pageSize??100}"
                pageNumber="${t.data[a]?.page?.pageNumber??0}"
                @page-changed="${t.pageChanged}"
                @fetch-more-elements="${t.fetchMoreElements}"
            ></mateu-sapui5-pagination>
        `}renderTableComponent(t,i,a,s,r,n,l){return o`
            <mateu-sapui5-table
                id="${t.id}"
                .metadata="${i?.metadata}"
                .data="${t.data}"
                .state="${s}"
                .appState="${n}"
                .appData="${l}"
                .emptyStateMessage="${s[i?.id]?.emptyStateMessage}"
                baseUrl="${a}"
                @sort-changed="${c=>{t.state.sort=c.detail.sorts,t.handleSearchRequested(void 0)}}"
                @fetch-more-elements="${t.fetchMoreElements}"
                @action-requested="${c=>{c.stopPropagation(),t.dispatchEvent(new CustomEvent("action-requested",{detail:c.detail,bubbles:!0,composed:!0}))}}"
            ></mateu-sapui5-table>
        `}}var Nd=Object.defineProperty,qd=Object.getOwnPropertyDescriptor,Xe=(e,t,i,a)=>{for(var s=a>1?void 0:a?qd(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=(a?n(t,i,s):n(s))||s);return a&&s&&Nd(t,i,s),s};let Oe=class extends L{constructor(){super(...arguments),this.baseUrl="",this.route=void 0,this.consumedRoute="_empty",this.config=void 0,this.top="true",this.pathPrefix=void 0,this.debug=!1,this._lastUrl="",this.routeChangedListener=e=>{if(e.preventDefault(),e.stopPropagation(),e instanceof CustomEvent&&this.top=="true"){let t=e.detail.route,i=this.baseUrl??"";!t||t.startsWith("/")?i=window.location.origin+(this.pathPrefix??""):(t=(this.pathPrefix??"")+t,i.indexOf("://")<0&&(i.startsWith("/")||(i="/"+i),i=window.location.origin+i)),t.startsWith(this.pathPrefix+"/")&&(t=t.substring(this.pathPrefix?.length)),i.endsWith("/")&&t.startsWith("/")&&(t=t.substring(1));let a=new URL(i+t);if((window.location.pathname||a.pathname)&&window.location.pathname!=a.pathname){let s=a.pathname;a.search&&(s+=a.search),s&&!s.startsWith("/")&&(s="/"+s),window.history.pushState({},"",s),this._lastUrl=window.location.href}}},this.navigateToRequestedListener=e=>{if(e.preventDefault(),e.stopPropagation(),jt.markClean(),e instanceof CustomEvent){let t=e.detail.route;const i=this.renderRoot.querySelector("mateu-ux");i&&(i.setAttribute("route",t),i.setAttribute("instant",Z()))}}}createRenderRoot(){return H.mustUseShadowRoot()?super.createRenderRoot():this}connectedCallback(){if(super.connectedCallback(),jt.install(),this._lastUrl=window.location.href,window.onpopstate=e=>{if(!jt.confirmLeave()){window.history.pushState({},"",this._lastUrl);return}const t=e.target;this.loadUrl(t)},this.top=="true"?this.loadUrl(window):this.route&&(this.consumedRoute=""),this.config)try{const e=JSON.parse(this.config);K.value={...K.value,...e}}catch{K.value={...K.value,config:this.config}}this.addEventListener("url-update-requested",this.routeChangedListener),this.addEventListener("navigate-to-requested",this.navigateToRequestedListener)}disconnectedCallback(){super.disconnectedCallback(),this.upstreamSubscription?.unsubscribe(),this.removeEventListener("url-update-requested",this.routeChangedListener),this.removeEventListener("navigate-to-requested",this.navigateToRequestedListener)}loadUrl(e){if(this.route=this.extractRouteFromUrl(e),this.setAttribute("route",this.route),this.instant=Z(),this._lastUrl=e.location.href,e.location.search){const i=new URLSearchParams(e.location.search).get("overrides");if(i&&(this.config=i,this.config))try{const a=JSON.parse(this.config);K.value={...K.value,...a}}catch{K.value={...K.value,config:this.config}}}}extractRouteFromUrl(e){return this.addQueryParams(this.extractRouteWithoutParamsFromUrl(e),e.location)}extractRouteWithoutParamsFromUrl(e){const t=this.extractGrossRouteFromUrl(e);return this.pathPrefix&&t.startsWith(this.pathPrefix)?t.substring(this.pathPrefix.length):t=="/"?"":t}addQueryParams(e,t){return e+(t.search?""+t.search:"")}extractGrossRouteFromUrl(e){const t=e.location.pathname,i=this.baseUrl&&(this.baseUrl.startsWith("http://")||this.baseUrl.startsWith("https://"))?this.baseUrl.substring(this.getContextPathStartingIndex(this.baseUrl)):this.baseUrl;return t.startsWith(i)?t.substring(i.length):t}getContextPathStartingIndex(e){return e.startsWith("http:")?e.indexOf("/",7):e.startsWith("https:")?e.indexOf("/",8):0}render(){return o`
           <mateu-api-caller>
                <mateu-ux id="_ux"
                          baseurl="${this.baseUrl}"
                          route="${this.route}"
                          consumedRoute="${this.consumedRoute}"
                          instant="${this.instant}"
                          top="${this.top}"
                          style="width: 100%;"
                          @app-data-updated="${()=>this.requestUpdate()}"
                          .appData="${Vt.value}"
                          .appState="${K.value}"
                ></mateu-ux>
           </mateu-api-caller>
           ${this.debug?o`
               <mateu-debug-overlay
                   .appState="${K.value}"
                   .appData="${Vt.value}"
               ></mateu-debug-overlay>
           `:d}
       `}};Oe.styles=T`
        :host {
            --lumo-clickable-cursor: pointer;
        }
  `;Xe([m()],Oe.prototype,"baseUrl",2);Xe([m()],Oe.prototype,"route",2);Xe([m()],Oe.prototype,"consumedRoute",2);Xe([m()],Oe.prototype,"config",2);Xe([m()],Oe.prototype,"top",2);Xe([m()],Oe.prototype,"pathPrefix",2);Xe([g()],Oe.prototype,"instant",2);Xe([m({type:Boolean})],Oe.prototype,"debug",2);Oe=Xe([_("mateu-ui")],Oe);var Md=Object.getOwnPropertyDescriptor,Ud=(e,t,i,a)=>{for(var s=a>1?void 0:a?Md(t,i):t,r=e.length-1,n;r>=0;r--)(n=e[r])&&(s=n(s)||s);return s};let Fi=class extends Xt{constructor(){super(...arguments),this.handleButtonClick=e=>{this.dispatchEvent(new CustomEvent("action-requested",{detail:{actionId:e},bubbles:!0,composed:!0}))}}render(){const e=this.component?.metadata;return o`
            <div class="page-wrapper">
                ${e.noHeader?o`
                    ${e.toolbar?.length>0?o`
                        <div class="page-toolbar">
                            <slot name="toolbar"></slot>
                        </div>
                    `:d}
                `:o`
                    <div class="page-header">
                        <div class="page-title-area">
                            <ui5-title level="H3">${e.title}</ui5-title>
                            ${e.subtitle?o`<p class="subtitle">${e.subtitle}</p>`:d}
                        </div>
                        ${e.toolbar?.length>0?o`
                            <div class="page-toolbar">
                                <slot name="toolbar"></slot>
                            </div>
                        `:d}
                    </div>
                `}

                <div class="page-content">
                    <slot></slot>
                </div>

                ${e.buttons?.length>0?o`
                    <div class="page-footer">
                        <slot name="buttons"></slot>
                    </div>
                `:d}
            </div>`}};Fi.styles=T`
        :host {
            display: block;
            width: 100%;
        }
        .page-wrapper {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
            box-sizing: border-box;
        }
        .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .page-title-area {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .subtitle {
            margin: 0;
            color: var(--sapContent_LabelColor, #6a6d70);
            font-size: var(--sapFontSmallSize, 0.75rem);
        }
        .page-toolbar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .page-content {
            width: 100%;
        }
        .page-footer {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid var(--sapGroup_TitleBorderColor, #d9d9d9);
        }
    `;Fi=Ud([_("mateu-sapui5-form")],Fi);H.set(new Fd);
